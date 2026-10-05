import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as getEscrow } from '../../app/api/jobs/[id]/escrow/route';
import { POST as releaseEscrow } from '../../app/api/jobs/[id]/escrow/release/route';
import { workspaceMutation } from '../../app/lib/workspaceMutation';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  rpc: vi.fn(),
  from: vi.fn(),
}));

vi.mock('../../app/lib/supabase/server', () => ({
  createSupabaseServerClient: async () => ({
    auth: { getUser: mocks.getUser },
    rpc: mocks.rpc,
    from: mocks.from,
  }),
}));

const jobId = '33333333-3333-4333-8333-333333333333';
const customerId = '11111111-1111-4111-8111-111111111111';
const tradespersonId = '22222222-2222-4222-8222-222222222222';
const quoteId = '44444444-4444-4444-8444-444444444444';

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getUser.mockResolvedValue({ data: { user: { id: customerId } } });
  mocks.rpc.mockResolvedValue({ data: { id: jobId, status: 'completed' }, error: null });
});

describe('GET /api/jobs/[id]/escrow (SRS: FR-15, BR-06)', () => {
  it('rejects invalid job IDs with 400', async () => {
    const res = await getEscrow(new Request('https://orkestra.invalid/api/jobs/invalid-id/escrow'), {
      params: Promise.resolve({ id: 'invalid-id' }),
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ code: 'INVALID_INPUT' });
  });

  it('rejects unauthenticated requests with 401', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const res = await getEscrow(new Request(`https://orkestra.invalid/api/jobs/${jobId}/escrow`), {
      params: Promise.resolve({ id: jobId }),
    });
    expect(res.status).toBe(401);
  });

  it('returns 404 when job does not exist', async () => {
    mocks.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });

    const res = await getEscrow(new Request(`https://orkestra.invalid/api/jobs/${jobId}/escrow`), {
      params: Promise.resolve({ id: jobId }),
    });
    expect(res.status).toBe(404);
  });

  it('returns calculated escrow financial amounts and held_in_escrow status for in_progress job', async () => {
    const jobData = {
      id: jobId,
      status: 'in_progress',
      customer_id: customerId,
      tradesperson_id: tradespersonId,
      accepted_quote_id: quoteId,
      warranty_ends_at: null,
      updated_at: '2026-10-01T10:00:00.000Z',
    };

    const quoteData = {
      labor_amount_kurus: 150000, // 1500 TL
      material_amount_kurus: 50000, // 500 TL
      warranty_days: 90,
    };

    mocks.from.mockImplementation((table: string) => {
      if (table === 'jobs') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({ data: jobData, error: null }),
            }),
          }),
        };
      }
      if (table === 'quotes') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({ data: quoteData, error: null }),
            }),
          }),
        };
      }
      return { select: () => ({ eq: () => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null }) }) }) };
    });

    const res = await getEscrow(new Request(`https://orkestra.invalid/api/jobs/${jobId}/escrow`), {
      params: Promise.resolve({ id: jobId }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { escrow: Record<string, unknown> };
    expect(body.escrow).toMatchObject({
      jobId,
      status: 'held_in_escrow',
      laborAmountKurus: 150000,
      materialAmountKurus: 50000,
      totalAmountKurus: 200000,
      warrantyDays: 90,
      currency: 'TRY',
      autoReleaseDeadline: null,
    });
  });

  it('computes 72-hour auto-release deadline for awaiting_customer_approval job', async () => {
    const deliveryIso = '2026-10-01T10:00:00.000Z';
    const jobData = {
      id: jobId,
      status: 'awaiting_customer_approval',
      customer_id: customerId,
      tradesperson_id: tradespersonId,
      accepted_quote_id: quoteId,
      warranty_ends_at: null,
      updated_at: deliveryIso,
    };

    mocks.from.mockImplementation((table: string) => {
      if (table === 'jobs') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({ data: jobData, error: null }),
            }),
          }),
        };
      }
      if (table === 'quotes') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({ data: { labor_amount_kurus: 100000, material_amount_kurus: 0 }, error: null }),
            }),
          }),
        };
      }
      if (table === 'job_events') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: () => ({
                  limit: vi.fn().mockResolvedValue({ data: [{ created_at: deliveryIso }], error: null }),
                }),
              }),
            }),
          }),
        };
      }
      return { select: () => ({ eq: () => ({ maybeSingle: vi.fn() }) }) };
    });

    const res = await getEscrow(new Request(`https://orkestra.invalid/api/jobs/${jobId}/escrow`), {
      params: Promise.resolve({ id: jobId }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { escrow: Record<string, unknown> };
    expect(body.escrow.autoReleaseDeadline).toBe('2026-10-04T10:00:00.000Z');
  });
});

describe('POST /api/jobs/[id]/escrow/release (SRS: FR-15, BR-06)', () => {
  it('successfully executes atomic escrow release and transitions job', async () => {
    const idempotencyKey = '55555555-5555-4555-8555-555555555555';
    const req = new Request(`https://orkestra.invalid/api/jobs/${jobId}/escrow/release`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Orkestra-Expected-User': customerId,
      },
      body: JSON.stringify({
        releaseReason: 'customer_acceptance',
        idempotencyKey,
        note: 'İş kusursuz teslim alındı.',
      }),
    });

    const res = await releaseEscrow(req, { params: Promise.resolve({ id: jobId }) });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { escrowPayment: Record<string, unknown> };

    expect(body.escrowPayment).toMatchObject({
      id: idempotencyKey,
      jobId,
      status: 'released_to_tradesperson',
      releaseReason: 'customer_acceptance',
      note: 'İş kusursuz teslim alındı.',
    });
    expect(mocks.rpc).toHaveBeenCalledWith('transition_job', {
      p_job_id: jobId,
      p_status: 'completed',
    });
  });

  it('works seamlessly with workspaceMutation client acknowledgement', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      Response.json({
        escrowPayment: {
          id: 'test-release-id',
          status: 'released_to_tradesperson',
        },
      })
    );
    vi.stubGlobal('fetch', fetcher);

    const result = await workspaceMutation(
      `/api/jobs/${jobId}/escrow/release`,
      { releaseReason: 'customer_acceptance', idempotencyKey: 'test-key' },
      customerId
    );

    expect(result).toEqual({ ok: true });
    vi.unstubAllGlobals();
  });
});
