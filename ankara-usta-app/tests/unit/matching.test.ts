import { describe,expect,it } from 'vitest';
import { getSupplyState,rankEligibleMatches,scoreMatchCandidate,type MatchCandidate,type MatchRequest } from '../../app/domain';

const request:MatchRequest={serviceId:'tv-duvar-montaji',district:'Çankaya',neighborhood:'Bahçelievler',preferredTiming:'Bu hafta'};
const candidate:MatchCandidate={
  tradespersonId:'usta-1',applicationStatus:'approved',serviceIds:['tv-duvar-montaji'],areas:[{district:'Çankaya',neighborhood:'Bahçelievler'}],
  availability:[{availableFrom:'2026-08-26',availableTo:'2026-09-10',acceptsUrgent:true,active:true}],verifiedReferenceCount:1,
  documents:[{id:'doc-1',tradespersonId:'usta-1',kind:'professional_certificate',status:'verified',storagePath:'usta-1/doc.pdf',verifiedAt:'2026-08-20T10:00:00.000Z',expiresAt:'2027-01-01',createdAt:'2026-08-20T09:00:00.000Z'}],
};

describe('explainable matching',()=>{
  it('returns a complete score breakdown and human-readable reasons',()=>{
    const decision=scoreMatchCandidate(request,candidate,'2026-08-27');
    expect(decision).toMatchObject({eligible:true,score:100,components:{service:35,district:25,availability:20,verification:10,neighborhood:5,references:5}});
    expect(decision.reasons).toContain('Çankaya ilçesinde çalışıyor');
  });

  it('rejects candidates when a mandatory filter fails',()=>{
    const decision=scoreMatchCandidate(request,{...candidate,applicationStatus:'submitted'},'2026-08-27');
    expect(decision.eligible).toBe(false);
    expect(decision.rejectedBy).toContain('Onay ve mesleki belge koşulu sağlanmıyor');
  });

  it('ranks deterministically and reports supply shortage',()=>{
    expect(rankEligibleMatches(request,[{...candidate,tradespersonId:'usta-2',verifiedReferenceCount:0},candidate],'2026-08-27').map(item=>item.tradespersonId)).toEqual(['usta-1','usta-2']);
    expect(getSupplyState(0)).toBe('no_supply');
    expect(getSupplyState(2)).toBe('limited_supply');
    expect(getSupplyState(3)).toBe('healthy');
  });
});
