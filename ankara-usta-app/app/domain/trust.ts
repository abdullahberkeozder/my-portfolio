import {z} from 'zod';
import {disputeStatuses,moderationActions,moderationStatuses,workLogEntryKinds} from './models';

export const workLogEntryInputSchema=z.object({
  kind:z.enum(workLogEntryKinds),
  caption:z.string().trim().max(500).optional(),
  storagePath:z.string().trim().min(3).max(500).refine(path=>!path.startsWith('/')&&!path.includes('..'),{message:'Güvenli bir depolama yolu girilmelidir.'}),
  customerPublicationConsent:z.boolean().default(false),
});
export const reviewInputSchema=z.object({rating:z.number().int().min(1).max(5),comment:z.string().trim().min(10).max(2000).optional()});
export const disputeInputSchema=z.object({category:z.enum(['quality','scope','payment','conduct','damage','other']),description:z.string().trim().min(20).max(4000)});
export const moderationDecisionInputSchema=z.object({entityType:z.enum(['work_log_entry','review','dispute','tradesperson']),entityId:z.uuid(),action:z.enum(moderationActions),reason:z.string().trim().min(10).max(2000)});
export const moderationStatusSchema=z.enum(moderationStatuses);
export const disputeStatusSchema=z.enum(disputeStatuses);

export function canPublishWorkMedia(consent:boolean,status:string){return consent&&status==='approved';}
export function canCreateReview(jobStatus:string,customerId:string,actorId:string){return jobStatus==='completed'&&customerId===actorId;}
export function shouldPublishTrustMetric(completedJobs:number){return Number.isInteger(completedJobs)&&completedJobs>=5;}
