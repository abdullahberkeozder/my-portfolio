import { describe, expect, it } from 'vitest';
import { jobSchema, quoteSchema, requestSchema, tradespersonApplicationStatusSchema, userRoleSchema, verificationDocumentStatusSchema } from '../../app/domain';
import { jobFixture, quoteFixture, requestFixture } from '../fixtures/domainEntities';

describe('domain runtime schemas', () => {
  it('accepts valid request, quote and job records', () => {
    expect(requestSchema.parse(requestFixture)).toEqual(requestFixture);
    expect(quoteSchema.parse(quoteFixture)).toEqual(quoteFixture);
    expect(jobSchema.parse(jobFixture)).toEqual(jobFixture);
  });

  it('rejects malformed records at the domain boundary', () => {
    expect(() => requestSchema.parse({...requestFixture, customerId: ''})).toThrow();
    expect(() => quoteSchema.parse({...quoteFixture, laborAmountKurus: -1})).toThrow();
    expect(() => jobSchema.parse({...jobFixture, status: 'unknown'})).toThrow();
  });

  it('recognizes only supported user roles', () => {
    expect(userRoleSchema.options).toEqual(['customer', 'tradesperson', 'moderator', 'admin']);
    expect(userRoleSchema.safeParse('customer').success).toBe(true);
    expect(userRoleSchema.safeParse('super-admin').success).toBe(false);
  });

  it('validates tradesperson review and document states', () => {
    expect(tradespersonApplicationStatusSchema.safeParse('reassessment_required').success).toBe(true);
    expect(tradespersonApplicationStatusSchema.safeParse('verified').success).toBe(false);
    expect(verificationDocumentStatusSchema.safeParse('verified').success).toBe(true);
  });
});
