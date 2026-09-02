import {describe,it,expect} from 'vitest';
import {requestRoutingSchema,requestDraftKind,requestResumePath} from '../../app/domain/requestRouting';
import {validateRequestDraft} from '../../app/domain/requestPersistence';
import {landingPathForRoles} from '../../app/lib/authRedirect';

const target='f31e936b-d492-4d9b-a44a-a6ce932976d0';
describe('request routing contract',()=>{
  it('keeps legacy open requests valid',()=>expect(requestRoutingSchema.parse({})).toEqual({routingMode:'open'}));
  it.each([
    {routingMode:'direct'},
    {routingMode:'direct',targetProfessionalId:'not-a-uuid'},
    {routingMode:'open',targetProfessionalId:target},
    {routingMode:'broadcast'},
  ])('rejects inconsistent routing: %j',value=>expect(requestRoutingSchema.safeParse(value).success).toBe(false));
  it('preserves direct routing through draft validation',()=>{
    const {payload}=validateRequestDraft({idempotencyKey:crypto.randomUUID(),serviceId:'tv-duvar-montaji',answers:{},routingMode:'direct',targetProfessionalId:target});
    expect(payload.targetProfessionalId).toBe(target);expect(payload.routingMode).toBe('direct');
  });
  it('separates open and different professional drafts',()=>{
    const keys=[requestDraftKind('tv'),requestDraftKind('tv',target),requestDraftKind('tv','99de936b-d492-4d9b-a44a-a6ce932976d0')];
    expect(new Set(keys).size).toBe(3);
  });
  it('retains direct target through customer and newly registered auth return',()=>{
    const next=requestResumePath('tv-duvar-montaji',target);
    expect(next).toBe(`/ustalar/${target}/talep?resume=1&service=tv-duvar-montaji`);
    expect(landingPathForRoles(['customer'],next)).toBe(next);
    expect(landingPathForRoles([],next)).toBe(next);
    expect(landingPathForRoles([], '/ustalar-admin')).toBe('/taleplerim');
  });
});
