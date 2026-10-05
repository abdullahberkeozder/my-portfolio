import { describe, expect, it } from 'vitest';
import {
  calculateWarrantyStatus,
  generateCertificateVerificationHash,
  parseCertificateScopeSnapshot,
} from '../../app/domain/trust';

describe('workmanship certificate domain logic (FAZ 6.4)', () => {
  it('parses valid scope snapshot with labor, material and scopes', () => {
    const raw = {
      quote_id: 'quote-123',
      labor_amount_kurus: 150000,
      material_amount_kurus: 50000,
      included_scope: ['Banyo bataryası montajı', 'Sızdırmazlık testi'],
      excluded_scope: ['Fayans kırma ve seramik tamiri'],
      warranty_days: 180,
    };

    const parsed = parseCertificateScopeSnapshot(raw);
    expect(parsed.quoteId).toBe('quote-123');
    expect(parsed.laborAmountKurus).toBe(150000);
    expect(parsed.materialAmountKurus).toBe(50000);
    expect(parsed.totalAmountKurus).toBe(200000);
    expect(parsed.includedScope).toEqual(['Banyo bataryası montajı', 'Sızdırmazlık testi']);
    expect(parsed.excludedScope).toEqual(['Fayans kırma ve seramik tamiri']);
    expect(parsed.warrantyDays).toBe(180);
  });

  it('handles null, undefined or empty scope snapshots gracefully', () => {
    const parsed = parseCertificateScopeSnapshot(null);
    expect(parsed.quoteId).toBeNull();
    expect(parsed.laborAmountKurus).toBe(0);
    expect(parsed.materialAmountKurus).toBe(0);
    expect(parsed.totalAmountKurus).toBe(0);
    expect(parsed.includedScope).toEqual([]);
    expect(parsed.excludedScope).toEqual([]);
    expect(parsed.warrantyDays).toBe(0);
  });

  it('calculates active warranty status when warranty ends in future', () => {
    const now = new Date();
    const issuedAt = new Date(now.getTime() - 10 * 86400000).toISOString();
    const warrantyEndsAt = new Date(now.getTime() + 80 * 86400000).toISOString();

    const status = calculateWarrantyStatus(issuedAt, warrantyEndsAt);
    expect(status.status).toBe('active');
    expect(status.remainingDays).toBeGreaterThanOrEqual(79);
    expect(status.remainingDays).toBeLessThanOrEqual(81);
  });

  it('calculates expired warranty status when warranty ended in past', () => {
    const issuedAt = '2025-01-01T00:00:00.000Z';
    const warrantyEndsAt = '2025-06-01T00:00:00.000Z';

    const status = calculateWarrantyStatus(issuedAt, warrantyEndsAt);
    expect(status.status).toBe('expired');
    expect(status.remainingDays).toBe(0);
  });

  it('returns unspecified status when warrantyEndsAt is null', () => {
    const issuedAt = new Date().toISOString();
    const status = calculateWarrantyStatus(issuedAt, null);
    expect(status.status).toBe('unspecified');
    expect(status.remainingDays).toBeNull();
  });

  it('generates consistent deterministic verification hash', () => {
    const hash = generateCertificateVerificationHash('AU-2026-00000042', 'job-9876-uuid');
    expect(hash).toMatch(/^ORK-AU-2026-00000042-[A-Z0-9]{8}$/);

    const hash2 = generateCertificateVerificationHash('AU-2026-00000042', 'job-9876-uuid');
    expect(hash).toBe(hash2);
  });
});
