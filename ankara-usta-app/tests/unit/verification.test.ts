import { describe, expect, it } from 'vitest';
import type { VerificationDocument } from '../../app/domain';
import { canTradespersonCreateQuote, shouldShowVerificationBadge } from '../../app/domain';

const certificate:VerificationDocument={
  id:'document-1',
  tradespersonId:'tradesperson-1',
  kind:'professional_certificate',
  status:'verified',
  storagePath:'tradesperson-1/certificate.pdf',
  expiresAt:'2026-09-30',
  verifiedAt:'2026-08-20T10:00:00.000Z',
  verifiedBy:'admin-1',
  createdAt:'2026-08-19T10:00:00.000Z',
};

describe('tradesperson verification eligibility',()=>{
  it('requires both application approval and current professional evidence',()=>{
    expect(canTradespersonCreateQuote({applicationStatus:'submitted'},[certificate],'2026-08-27')).toBe(false);
    expect(canTradespersonCreateQuote({applicationStatus:'approved'},[certificate],'2026-08-27')).toBe(true);
  });

  it('removes quote eligibility and the badge after expiry',()=>{
    expect(canTradespersonCreateQuote({applicationStatus:'approved'},[certificate],'2026-10-01')).toBe(false);
    expect(shouldShowVerificationBadge([certificate],'2026-10-01')).toBe(false);
  });

  it('does not treat an unreviewed or unrelated document as verification',()=>{
    expect(shouldShowVerificationBadge([{...certificate,status:'pending'}],'2026-08-27')).toBe(false);
    expect(shouldShowVerificationBadge([{...certificate,kind:'identity'}],'2026-08-27')).toBe(false);
  });
});
