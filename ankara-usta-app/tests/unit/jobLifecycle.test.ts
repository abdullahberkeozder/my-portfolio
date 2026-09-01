import { describe,expect,it } from 'vitest';
import { assertActorCanTransitionJob,canActorTransitionJob,jobMessageInputSchema,notificationRetryDelaySeconds,scopeChangeInputSchema } from '../../app/domain';

describe('job lifecycle authorization',()=>{
  it('allows only the appropriate participant to complete work',()=>{
    expect(canActorTransitionJob('awaiting_customer_approval','completed','customer')).toBe(true);
    expect(canActorTransitionJob('awaiting_customer_approval','completed','tradesperson')).toBe(false);
    expect(()=>assertActorCanTransitionJob('scheduled','completed','customer')).toThrow('Job cannot transition');
  });

  it('validates messages and bilateral scope changes',()=>{
    expect(jobMessageInputSchema.safeParse({body:'Yarın saat 10 uygundur.',idempotencyKey:'11111111-1111-4111-8111-111111111111'}).success).toBe(true);
    expect(scopeChangeInputSchema.safeParse({description:'İki ilave priz montajı eklenecek.',laborDeltaKurus:50000,materialDeltaKurus:20000,durationDeltaMinutes:60,includedScope:['İki priz montajı'],excludedScope:[]}).success).toBe(true);
    expect(scopeChangeInputSchema.safeParse({description:'Hiçbir değişiklik bulunmuyor.',laborDeltaKurus:0,materialDeltaKurus:0,durationDeltaMinutes:0,includedScope:[],excludedScope:[]}).success).toBe(false);
  });

  it('uses capped exponential retry intervals',()=>{
    expect(notificationRetryDelaySeconds(1)).toBe(30);
    expect(notificationRetryDelaySeconds(4)).toBe(240);
    expect(notificationRetryDelaySeconds(20)).toBe(3600);
  });
});
