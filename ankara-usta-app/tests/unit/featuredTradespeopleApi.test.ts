import { describe, expect, it, vi } from 'vitest';
import { GET } from '../../app/api/tradespeople/featured/route';

vi.mock('../../app/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}));

import { createSupabaseServerClient } from '../../app/lib/supabase/server';

describe('GET /api/tradespeople/featured (SRS: FR-05, NFR-05 TRUST-01)', () => {
  it('returns verified professionals when available in directory', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: [
        {
          user_id: '11111111-1111-4111-8111-111111111111',
          display_name: 'Kemal Usta',
          bio: '25 yıllık sıhhi tesisat ve montaj uzmanı.',
          city: 'Ankara',
          total_count: 1,
        },
      ],
      error: null,
    });

    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      rpc: mockRpc,
    } as any);

    const response = await GET();
    expect(response.status).toBe(200);
    const body = (await response.json()) as any;

    expect(body.hasSyntheticArtisans).toBe(false);
    expect(body.pilotStatus).toBe('active');
    expect(body.professionals).toHaveLength(1);
    expect(body.professionals[0]).toEqual({
      userId: '11111111-1111-4111-8111-111111111111',
      displayName: 'Kemal Usta',
      bio: '25 yıllık sıhhi tesisat ve montaj uzmanı.',
      city: 'Ankara',
    });
    expect(mockRpc).toHaveBeenCalledWith('list_public_verified_professionals', {
      p_service_id: null,
      p_district: null,
      p_offset: 0,
      p_limit: 6,
    });
  });

  it('fails safely with empty list and honest pilot status when RPC errors or returns empty', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database unseeded' },
    });

    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      rpc: mockRpc,
    } as any);

    const response = await GET();
    expect(response.status).toBe(200);
    const body = (await response.json()) as any;

    expect(body.hasSyntheticArtisans).toBe(false);
    expect(body.pilotStatus).toBe('onboarding');
    expect(body.professionals).toEqual([]);
    expect(body.totalCount).toBe(0);
  });
});
