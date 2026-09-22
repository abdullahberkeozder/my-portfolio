import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { isPilotIntakeEnabled, INTAKE_PAUSED_RESPONSE } from '../../app/lib/pilotIntake';
import { POST as draftPost } from '../../app/api/requests/draft/route';
import { POST as submitPost } from '../../app/api/requests/[id]/submit/route';

const mockCalls = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock('../../app/lib/supabase/server', () => ({
  createSupabaseServerClient: async () => ({
    auth: { getUser: mockCalls.getUser },
    from: mockCalls.from,
    rpc: mockCalls.rpc,
  }),
}));

describe('isPilotIntakeEnabled (ROLLBACK-01 Circuit Breaker)', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns true by default when environment variables are unset', () => {
    expect(isPilotIntakeEnabled()).toBe(true);
  });

  it('returns true when explicitly set to "true"', () => {
    vi.stubEnv('ORKESTRA_PILOT_INTAKE_ENABLED', 'true');
    expect(isPilotIntakeEnabled()).toBe(true);
  });

  it('returns false when ORKESTRA_PILOT_INTAKE_ENABLED is "false"', () => {
    vi.stubEnv('ORKESTRA_PILOT_INTAKE_ENABLED', 'false');
    expect(isPilotIntakeEnabled()).toBe(false);
  });

  it('returns false for disabled aliases ("0", "off", "disabled")', () => {
    for (const val of ['0', 'off', 'disabled', ' FALSE ']) {
      vi.stubEnv('ORKESTRA_PILOT_INTAKE_ENABLED', val);
      expect(isPilotIntakeEnabled()).toBe(false);
    }
  });

  it('honors fallback PILOT_INTAKE_ENABLED when primary env is unset', () => {
    vi.stubEnv('PILOT_INTAKE_ENABLED', 'false');
    expect(isPilotIntakeEnabled()).toBe(false);
  });

  it('primary ORKESTRA_PILOT_INTAKE_ENABLED takes precedence over fallback', () => {
    vi.stubEnv('ORKESTRA_PILOT_INTAKE_ENABLED', 'true');
    vi.stubEnv('PILOT_INTAKE_ENABLED', 'false');
    expect(isPilotIntakeEnabled()).toBe(true);
  });
});

describe('Circuit Breaker Route Integration (ROLLBACK-01)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('draft POST returns 503 INTAKE_PAUSED and halts before database/auth when disabled', async () => {
    vi.stubEnv('ORKESTRA_PILOT_INTAKE_ENABLED', 'false');

    const req = new Request('https://orkestra.invalid/api/requests/draft', {
      method: 'POST',
      body: JSON.stringify({
        idempotencyKey: crypto.randomUUID(),
        serviceId: 'musluk-tamiri',
        answers: {},
      }),
    });

    const res = await draftPost(req);
    expect(res.status).toBe(503);
    const body = (await res.json()) as { code: string; error: string };
    expect(body.code).toBe(INTAKE_PAUSED_RESPONSE.code);
    expect(body.error).toBe(INTAKE_PAUSED_RESPONSE.message);

    // Critical circuit breaker guarantee: auth or db must NOT be queried
    expect(mockCalls.getUser).not.toHaveBeenCalled();
    expect(mockCalls.rpc).not.toHaveBeenCalled();
  });

  it('submit POST returns 503 INTAKE_PAUSED and halts before database/auth when disabled', async () => {
    vi.stubEnv('ORKESTRA_PILOT_INTAKE_ENABLED', 'false');

    const req = new Request('https://orkestra.invalid/api/requests/test-id/submit', {
      method: 'POST',
      body: JSON.stringify({ idempotencyKey: crypto.randomUUID() }),
    });

    const res = await submitPost(req, { params: Promise.resolve({ id: crypto.randomUUID() }) });
    expect(res.status).toBe(503);
    const body = (await res.json()) as { code: string; error: string };
    expect(body.code).toBe(INTAKE_PAUSED_RESPONSE.code);
    expect(body.error).toBe(INTAKE_PAUSED_RESPONSE.message);

    // Critical circuit breaker guarantee
    expect(mockCalls.getUser).not.toHaveBeenCalled();
    expect(mockCalls.from).not.toHaveBeenCalled();
  });

  it('draft POST proceeds normally to auth when intake is enabled', async () => {
    vi.stubEnv('ORKESTRA_PILOT_INTAKE_ENABLED', 'true');
    mockCalls.getUser.mockResolvedValueOnce({ data: { user: null } });

    const req = new Request('https://orkestra.invalid/api/requests/draft', {
      method: 'POST',
      body: JSON.stringify({
        idempotencyKey: crypto.randomUUID(),
        serviceId: 'musluk-tamiri',
        answers: {},
      }),
    });

    const res = await draftPost(req);
    // When intake is enabled, request passes circuit breaker and fails on missing user (401)
    expect(res.status).toBe(401);
    expect(mockCalls.getUser).toHaveBeenCalled();
  });
});
