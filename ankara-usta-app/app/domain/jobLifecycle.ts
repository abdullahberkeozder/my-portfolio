import { z } from 'zod';
import type { JobParticipantRole,JobStatus } from './models';
import { canTransitionJob,InvalidStateTransitionError } from './stateMachines';

export const jobMessageInputSchema=z.object({
  body:z.string().trim().min(1).max(4000),
  idempotencyKey:z.uuid(),
});

export const inspectionAppointmentInputSchema=z.object({
  scheduledFor:z.iso.datetime({offset:true}).refine(value=>new Date(value).getTime()>Date.now(),{message:'Randevu gelecekte olmalıdır.'}),
  note:z.string().trim().max(1000).optional(),
});

export const scopeChangeInputSchema=z.object({
  description:z.string().trim().min(10).max(2000),
  laborDeltaKurus:z.number().int().min(-100_000_000_00).max(100_000_000_00),
  materialDeltaKurus:z.number().int().min(-100_000_000_00).max(100_000_000_00),
  durationDeltaMinutes:z.number().int().min(-525_600).max(525_600),
  includedScope:z.array(z.string().trim().min(1).max(300)).max(20).default([]),
  excludedScope:z.array(z.string().trim().min(1).max(300)).max(20).default([]),
}).refine(value=>value.laborDeltaKurus!==0||value.materialDeltaKurus!==0||value.durationDeltaMinutes!==0||value.includedScope.length>0||value.excludedScope.length>0,{message:'Kapsam değişikliği en az bir değişiklik içermelidir.'});

export const jobAddressInputSchema=z.object({
  addressLine:z.string().trim().min(10).max(300),
  building:z.string().trim().max(80).optional(),
  apartment:z.string().trim().max(40).optional(),
  directions:z.string().trim().max(500).optional(),
});

const transitionActors:Partial<Record<`${JobStatus}->${JobStatus}`,readonly JobParticipantRole[]>>={
  'scheduled->inspection_scheduled':['admin','system'],
  'scheduled->in_progress':['tradesperson','admin'],
  'scheduled->cancelled':['customer','tradesperson','admin'],
  'inspection_scheduled->scheduled':['customer','tradesperson','admin'],
  'inspection_scheduled->in_progress':['tradesperson','admin'],
  'inspection_scheduled->cancelled':['customer','tradesperson','admin'],
  'in_progress->awaiting_customer_approval':['tradesperson','admin'],
  'in_progress->disputed':['customer','tradesperson','admin'],
  'in_progress->cancelled':['admin'],
  'awaiting_customer_approval->in_progress':['customer','admin'],
  'awaiting_customer_approval->completed':['customer','admin'],
  'awaiting_customer_approval->disputed':['customer','tradesperson','admin'],
  'completed->disputed':['customer','tradesperson','admin'],
  'disputed->in_progress':['admin'],
  'disputed->awaiting_customer_approval':['admin'],
  'disputed->completed':['admin'],
  'disputed->cancelled':['admin'],
};

export function canActorTransitionJob(from:JobStatus,to:JobStatus,actor:JobParticipantRole){
  return canTransitionJob(from,to)&&Boolean(transitionActors[`${from}->${to}`]?.includes(actor));
}

export function assertActorCanTransitionJob(from:JobStatus,to:JobStatus,actor:JobParticipantRole){
  if(!canActorTransitionJob(from,to,actor))throw new InvalidStateTransitionError('Job',from,to);
}

export function notificationRetryDelaySeconds(attempt:number){
  if(!Number.isInteger(attempt)||attempt<1)throw new Error('Attempt must be a positive integer.');
  return Math.min(3600,30*2**(attempt-1));
}
