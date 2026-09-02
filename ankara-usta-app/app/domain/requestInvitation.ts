import {z} from 'zod';

export type RequestInvitation = {
  request_id:string; status:'awaiting'|'quoted'|'declined'|'broadened';
  response_due_at:string; decline_reason:string|null; successor_request_id:string|null;
};
export function invitationState(invitation:RequestInvitation,now:number) {
  return invitation.status==='awaiting' && Date.parse(invitation.response_due_at)<=now ? 'expired' : invitation.status;
}
export const invitationLabels={awaiting:'Yanıt bekleniyor',quoted:'Teklif geldi',declined:'Usta talebi reddetti',expired:'Yanıt süresi doldu',broadened:'Diğer ustalar için taslak hazır'} as const;
export const invitationActionSchema=z.discriminatedUnion('action',[
  z.object({action:z.literal('decline'),reason:z.string().trim().min(10).max(1000)}),
  z.object({action:z.literal('broaden'),confirm:z.literal(true)}),
]);
