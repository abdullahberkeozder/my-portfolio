import {describe,expect,it} from 'vitest';
import {canCreateReview,canPublishWorkMedia,disputeInputSchema,moderationDecisionInputSchema,reviewInputSchema,shouldPublishTrustMetric,workLogEntryInputSchema} from '../../app/domain';

describe('trust, review and moderation rules',()=>{
  it('allows reviews only from the customer after completion',()=>{
    expect(canCreateReview('completed','customer-1','customer-1')).toBe(true);
    expect(canCreateReview('in_progress','customer-1','customer-1')).toBe(false);
    expect(canCreateReview('completed','customer-1','tradesperson-1')).toBe(false);
    expect(reviewInputSchema.safeParse({rating:5,comment:'İş kapsamı eksiksiz tamamlandı.'}).success).toBe(true);
    expect(reviewInputSchema.safeParse({rating:6}).success).toBe(false);
  });

  it('publishes work media only with customer consent and moderation approval',()=>{
    expect(canPublishWorkMedia(true,'approved')).toBe(true);
    expect(canPublishWorkMedia(false,'approved')).toBe(false);
    expect(canPublishWorkMedia(true,'pending')).toBe(false);
    expect(workLogEntryInputSchema.safeParse({kind:'before',storagePath:'job-id/before/photo.webp',customerPublicationConsent:true}).success).toBe(true);
    expect(workLogEntryInputSchema.safeParse({kind:'after',storagePath:'../private/photo.webp',customerPublicationConsent:true}).success).toBe(false);
  });

  it('requires attributable moderation reasons and protects small cohorts',()=>{
    expect(moderationDecisionInputSchema.safeParse({entityType:'review',entityId:'11111111-1111-4111-8111-111111111111',action:'approve',reason:'İş kaydıyla bağlantısı doğrulandı.'}).success).toBe(true);
    expect(moderationDecisionInputSchema.safeParse({entityType:'review',entityId:'11111111-1111-4111-8111-111111111111',action:'hide',reason:'kısa'}).success).toBe(false);
    expect(disputeInputSchema.safeParse({category:'quality',description:'Teslim edilen iş kabul edilen kapsamla uyuşmuyor.'}).success).toBe(true);
    expect(shouldPublishTrustMetric(4)).toBe(false);
    expect(shouldPublishTrustMetric(5)).toBe(true);
  });
});
