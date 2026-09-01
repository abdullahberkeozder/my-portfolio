import {z} from 'zod';

export const disputeOperationStatuses=[
  'opened','triage','awaiting_evidence','counterparty_response','investigation',
  'resolution_proposed','notified','appealed','closed','dismissed',
] as const;
export type DisputeOperationStatus=(typeof disputeOperationStatuses)[number];

export const disputeStatusTransitions:Record<DisputeOperationStatus,readonly DisputeOperationStatus[]>={
  opened:['triage','dismissed'],
  triage:['awaiting_evidence','counterparty_response','investigation','dismissed'],
  awaiting_evidence:['counterparty_response','investigation','dismissed'],
  counterparty_response:['investigation','awaiting_evidence'],
  investigation:['resolution_proposed','awaiting_evidence','dismissed'],
  resolution_proposed:['notified','investigation'],
  notified:['appealed','closed'],
  appealed:['investigation','resolution_proposed','closed'],
  closed:[],
  dismissed:['appealed','closed'],
};

export function canTransitionDispute(from:DisputeOperationStatus,to:DisputeOperationStatus){
  return disputeStatusTransitions[from].includes(to);
}

export function disputeSlaState(dueAt:string,now=new Date()):'on_track'|'due_soon'|'overdue'{
  const remaining=new Date(dueAt).getTime()-now.getTime();
  if(remaining<0)return 'overdue';
  return remaining<=4*60*60*1000?'due_soon':'on_track';
}

export const disputeEvidenceSchema=z.object({
  kind:z.enum(['photo','video','document','message_export','invoice','other']),
  description:z.string().trim().min(5).max(1000),
});
export const disputeStatementSchema=z.object({statement:z.string().trim().min(20).max(6000)});
export const disputeAppealSchema=z.object({reason:z.string().trim().min(20).max(4000)});
export const disputeTransitionSchema=z.object({
  status:z.enum(disputeOperationStatuses),
  reason:z.string().trim().min(10).max(2000),
  evidenceDueAt:z.iso.datetime().nullable().optional(),
  customerExplanation:z.string().trim().min(10).max(4000).nullable().optional(),
  tradespersonExplanation:z.string().trim().min(10).max(4000).nullable().optional(),
});
export const disputeInternalNoteSchema=z.object({note:z.string().trim().min(5).max(4000)});
export const sanctionSchema=z.object({
  type:z.enum(['warning','temporary_suspension','permanent_suspension']),
  reason:z.string().trim().min(10).max(2000),
  endsAt:z.iso.datetime().nullable().optional(),
});
