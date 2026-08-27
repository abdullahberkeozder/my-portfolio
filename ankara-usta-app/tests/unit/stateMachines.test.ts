import { describe, expect, it } from 'vitest';
import { InvalidStateTransitionError, assertTradespersonApplicationTransition, canTransitionJob, canTransitionRequest, canTransitionTradespersonApplication, transitionJob, transitionRequest } from '../../app/domain';
import { jobFixture, requestFixture } from '../fixtures/domainEntities';

describe('request state machine', () => {
  it('advances through the valid request path without mutating the source', () => {
    const submitted = transitionRequest(requestFixture, 'submitted', '2026-08-26T09:00:00.000Z');
    const matching = transitionRequest(submitted, 'matching', '2026-08-26T09:01:00.000Z');
    const quoted = transitionRequest(matching, 'quotes_received', '2026-08-26T10:00:00.000Z');
    const selected = transitionRequest(quoted, 'provider_selected', '2026-08-26T11:00:00.000Z');
    expect(requestFixture.status).toBe('draft');
    expect(selected.status).toBe('provider_selected');
    expect(selected.updatedAt).toBe('2026-08-26T11:00:00.000Z');
  });

  it('rejects invalid and terminal-state transitions', () => {
    expect(canTransitionRequest('draft', 'provider_selected')).toBe(false);
    expect(() => transitionRequest(requestFixture, 'provider_selected', requestFixture.updatedAt)).toThrow(InvalidStateTransitionError);
    expect(canTransitionRequest('cancelled', 'submitted')).toBe(false);
  });
});

describe('job state machine', () => {
  it('supports inspection and completion paths', () => {
    const inspection = transitionJob(jobFixture, 'inspection_scheduled', '2026-08-26T09:00:00.000Z');
    const started = transitionJob(inspection, 'in_progress', '2026-08-27T09:00:00.000Z');
    const awaitingApproval = transitionJob(started, 'awaiting_customer_approval', '2026-08-27T11:00:00.000Z');
    const completed = transitionJob(awaitingApproval, 'completed', '2026-08-27T12:00:00.000Z');
    expect(completed.status).toBe('completed');
  });

  it('rejects skipped and terminal-state transitions', () => {
    expect(canTransitionJob('scheduled', 'completed')).toBe(false);
    expect(() => transitionJob(jobFixture, 'completed', jobFixture.updatedAt)).toThrow(InvalidStateTransitionError);
    expect(canTransitionJob('cancelled', 'in_progress')).toBe(false);
  });
});

describe('tradesperson application state machine', () => {
  it('supports review, approval, and reassessment paths', () => {
    expect(canTransitionTradespersonApplication('draft', 'submitted')).toBe(true);
    expect(canTransitionTradespersonApplication('under_review', 'approved')).toBe(true);
    expect(canTransitionTradespersonApplication('approved', 'reassessment_required')).toBe(true);
  });

  it('rejects approval before review and suspended-to-approved shortcuts', () => {
    expect(() => assertTradespersonApplicationTransition('submitted', 'approved')).toThrow(InvalidStateTransitionError);
    expect(() => assertTradespersonApplicationTransition('suspended', 'approved')).toThrow(InvalidStateTransitionError);
  });
});
