import {expect,it} from 'vitest';
import {invitationState,invitationActionSchema,type RequestInvitation} from '../../app/domain/requestInvitation';
const invitation:RequestInvitation={request_id:'request',status:'awaiting',response_due_at:'2026-09-04T12:00:00Z',decline_reason:null,successor_request_id:null};
it('expires exactly at the deadline without widening visibility',()=>{
  const due=Date.parse(invitation.response_due_at);
  expect(invitationState(invitation,due-1)).toBe('awaiting');
  expect(invitationState(invitation,due)).toBe('expired');
  expect(invitation.status).toBe('awaiting');
  expect(invitation.successor_request_id).toBeNull();
});
it.each(['quoted','declined','broadened'] as const)('does not expire an already %s invitation',status=>{
  expect(invitationState({...invitation,status},Date.parse(invitation.response_due_at)+1000)).toBe(status);
});
it('requires affirmative broadening consent and a meaningful decline reason',()=>{
  expect(invitationActionSchema.safeParse({action:'broaden'}).success).toBe(false);
  expect(invitationActionSchema.safeParse({action:'broaden',confirm:false}).success).toBe(false);
  expect(invitationActionSchema.safeParse({action:'broaden',confirm:true}).success).toBe(true);
  expect(invitationActionSchema.safeParse({action:'decline',reason:'          '}).success).toBe(false);
  expect(invitationActionSchema.parse({action:'decline',reason:'  Bu tarihte müsait değilim.  '})).toEqual({action:'decline',reason:'Bu tarihte müsait değilim.'});
});
