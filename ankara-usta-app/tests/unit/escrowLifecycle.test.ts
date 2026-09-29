import { describe, expect, it } from 'vitest';
import {
  assertActorCanTransitionEscrowPayment,
  assertEscrowPaymentTransition,
  calculateEscrowAutoReleaseDeadline,
  canActorTransitionEscrowPayment,
  canTransitionEscrowPayment,
  ESCROW_AUTO_RELEASE_HOURS,
  escrowReleaseInputSchema,
  InvalidStateTransitionError,
  isEscrowEligibleForAutoRelease,
} from '../../app/domain';

describe('Escrow Payment State Machine (SRS: FR-15, BR-06 / SDD: 4.4)', () => {
  it('follows the standard linear happy path: pending -> authorized -> held_in_escrow -> released_to_tradesperson', () => {
    expect(canTransitionEscrowPayment('pending', 'authorized')).toBe(true);
    expect(canTransitionEscrowPayment('authorized', 'held_in_escrow')).toBe(true);
    expect(canTransitionEscrowPayment('held_in_escrow', 'released_to_tradesperson')).toBe(true);
    expect(() => assertEscrowPaymentTransition('pending', 'authorized')).not.toThrow();
    expect(() => assertEscrowPaymentTransition('authorized', 'held_in_escrow')).not.toThrow();
    expect(() => assertEscrowPaymentTransition('held_in_escrow', 'released_to_tradesperson')).not.toThrow();
  });

  it('supports partial refund and dispute refund paths', () => {
    expect(canTransitionEscrowPayment('held_in_escrow', 'partially_refunded')).toBe(true);
    expect(canTransitionEscrowPayment('partially_refunded', 'released_to_tradesperson')).toBe(true);
    expect(canTransitionEscrowPayment('held_in_escrow', 'refunded')).toBe(true);
    expect(canTransitionEscrowPayment('authorized', 'refunded')).toBe(true);
    expect(canTransitionEscrowPayment('pending', 'refunded')).toBe(true);
  });

  it('rejects illegal shortcut transitions and transitions from terminal states', () => {
    // Cannot skip authorization directly to released
    expect(canTransitionEscrowPayment('pending', 'released_to_tradesperson')).toBe(false);
    expect(() => assertEscrowPaymentTransition('pending', 'released_to_tradesperson')).toThrow(InvalidStateTransitionError);

    // Terminal states cannot transition
    expect(canTransitionEscrowPayment('released_to_tradesperson', 'refunded')).toBe(false);
    expect(canTransitionEscrowPayment('refunded', 'authorized')).toBe(false);
    expect(() => assertEscrowPaymentTransition('released_to_tradesperson', 'refunded')).toThrow('EscrowPayment cannot transition');
  });

  it('enforces actor-based authorization on escrow transitions', () => {
    // Customer or system can authorize payment
    expect(canActorTransitionEscrowPayment('pending', 'authorized', 'customer')).toBe(true);
    expect(canActorTransitionEscrowPayment('pending', 'authorized', 'system')).toBe(true);
    expect(canActorTransitionEscrowPayment('pending', 'authorized', 'tradesperson')).toBe(false);

    // Tradesperson CANNOT release escrow to themselves
    expect(canActorTransitionEscrowPayment('held_in_escrow', 'released_to_tradesperson', 'tradesperson')).toBe(false);
    expect(() => assertActorCanTransitionEscrowPayment('held_in_escrow', 'released_to_tradesperson', 'tradesperson')).toThrow(InvalidStateTransitionError);

    // Customer or admin can release escrow
    expect(canActorTransitionEscrowPayment('held_in_escrow', 'released_to_tradesperson', 'customer')).toBe(true);
    expect(canActorTransitionEscrowPayment('held_in_escrow', 'released_to_tradesperson', 'admin')).toBe(true);
    expect(canActorTransitionEscrowPayment('held_in_escrow', 'released_to_tradesperson', 'system')).toBe(true);

    // Only admin or system can issue full refunds from held_in_escrow
    expect(canActorTransitionEscrowPayment('held_in_escrow', 'refunded', 'admin')).toBe(true);
    expect(canActorTransitionEscrowPayment('held_in_escrow', 'refunded', 'tradesperson')).toBe(false);
  });
});

describe('72-Hour Auto-Release Inactivity SLA (BR-06)', () => {
  const deliveredAt = '2026-09-29T10:00:00.000Z';

  it('computes the exact 72-hour auto-release deadline', () => {
    const deadline = calculateEscrowAutoReleaseDeadline(deliveredAt);
    expect(deadline).toBe('2026-10-02T10:00:00.000Z');
    expect(ESCROW_AUTO_RELEASE_HOURS).toBe(72);
  });

  it('correctly evaluates auto-release eligibility before and after deadline', () => {
    // 24 hours later -> NOT eligible
    expect(isEscrowEligibleForAutoRelease(deliveredAt, '2026-09-30T10:00:00.000Z')).toBe(false);

    // 71 hours and 59 minutes later -> NOT eligible
    expect(isEscrowEligibleForAutoRelease(deliveredAt, '2026-10-02T09:59:00.000Z')).toBe(false);

    // Exactly 72 hours later -> ELIGIBLE
    expect(isEscrowEligibleForAutoRelease(deliveredAt, '2026-10-02T10:00:00.000Z')).toBe(true);

    // 96 hours later -> ELIGIBLE
    expect(isEscrowEligibleForAutoRelease(deliveredAt, '2026-10-03T10:00:00.000Z')).toBe(true);
  });

  it('throws an error when provided an invalid delivery date', () => {
    expect(() => calculateEscrowAutoReleaseDeadline('invalid-date')).toThrow('Geçersiz teslimat zaman damgası.');
  });
});

describe('Escrow Input Schemas', () => {
  it('validates release input parameters', () => {
    const valid = escrowReleaseInputSchema.safeParse({
      jobId: '11111111-1111-4111-8111-111111111111',
      idempotencyKey: '22222222-2222-4222-8222-222222222222',
      releaseReason: 'customer_acceptance',
      note: 'Müşteri işi sorunsuz onayladı.',
    });
    expect(valid.success).toBe(true);

    const invalidReason = escrowReleaseInputSchema.safeParse({
      jobId: '11111111-1111-4111-8111-111111111111',
      idempotencyKey: '22222222-2222-4222-8222-222222222222',
      releaseReason: 'unknown_reason',
    });
    expect(invalidReason.success).toBe(false);
  });
});
