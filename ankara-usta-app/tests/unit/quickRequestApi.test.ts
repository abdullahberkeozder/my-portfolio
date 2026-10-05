import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { POST } from '../../app/api/requests/quick/route';

const mockAuth = vi.hoisted(() => ({
  getUser: vi.fn(),
}));

vi.mock('../../app/lib/supabase/server', () => ({
  createSupabaseServerClient: async () => ({
    auth: { getUser: mockAuth.getUser },
  }),
}));

const validPayload = {
  ustaId: 'usta-123',
  craftsman: 'Hasan Usta',
  problem: 'Mutfak lavabo borusu su sızdırıyor, acil tamir lazım.',
  phone: '0532 123 45 67',
  district: 'Altındağ',
  service: 'Sıhhi Tesisat',
  sla: '~12–18 dk',
  urgency: '⚡ Hemen (Acil Sevk)',
  addressDetail: 'Anafartalar Cad. No: 4',
};

const send = (body: unknown) =>
  POST(
    new Request('https://orkestra.invalid/api/requests/quick', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  );

describe('/api/requests/quick POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.getUser.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('successfully creates a quick quote and returns leadRef matching ANK-XXXX', async () => {
    const response = await send(validPayload);
    expect(response.status).toBe(200);

    const data = (await response.json()) as Record<string, any>;
    expect(data.ok).toBe(true);
    expect(data.leadRef).toMatch(/^ANK-\d{4}$/);
    expect(data.ustaId).toBe('usta-123');
    expect(data.craftsman).toBe('Hasan Usta');
    expect(data.district).toBe('Altındağ');
    expect(data.sla).toBe('~12–18 dk');
    expect(data.userId).toBe('test-user-id');
  });

  it('allows anonymous guests without session', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: null } });

    const response = await send(validPayload);
    expect(response.status).toBe(200);

    const data = (await response.json()) as Record<string, any>;
    expect(data.ok).toBe(true);
    expect(data.userId).toBeNull();
    expect(data.leadRef).toMatch(/^ANK-\d{4}$/);
  });

  it('rejects submissions with missing or too short problem description', async () => {
    const invalid = { ...validPayload, problem: 'ab' };
    const response = await send(invalid);

    expect(response.status).toBe(400);
    const data = (await response.json()) as Record<string, any>;
    expect(data.code).toBe('INVALID_INPUT');
  });

  it('rejects submissions with invalid phone number', async () => {
    const invalid = { ...validPayload, phone: '123' };
    const response = await send(invalid);

    expect(response.status).toBe(400);
    const data = (await response.json()) as Record<string, any>;
    expect(data.code).toBe('INVALID_INPUT');
  });

  it('blocks submissions when pilot intake is paused via circuit breaker', async () => {
    vi.stubEnv('ORKESTRA_PILOT_INTAKE_ENABLED', 'false');

    const response = await send(validPayload);
    expect(response.status).toBe(503);

    const data = (await response.json()) as Record<string, any>;
    expect(data.code).toBe('INTAKE_PAUSED');
  });
});
