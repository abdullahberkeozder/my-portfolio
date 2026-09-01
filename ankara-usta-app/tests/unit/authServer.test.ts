import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { getServerUserAndRoles } from '../../app/lib/authServer';
import { createSupabaseServerClient } from '../../app/lib/supabase/server';

vi.mock('../../app/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}));

describe('getServerUserAndRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns authenticated user and verified db roles in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123', email: 'musteri@example.com' } },
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ role: 'customer' }],
          }),
        }),
      }),
    };

    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase as never);

    const result = await getServerUserAndRoles();
    expect(result.user).toEqual({ id: 'user-123', email: 'musteri@example.com' });
    expect(result.roles).toEqual(['customer']);
  });

  it('uses only verified database roles for authorization', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-456', email: 'test@example.com' } },
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ role: 'customer' }],
          }),
        }),
      }),
    };
    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase as never);

    const result = await getServerUserAndRoles();
    expect(result.user).toEqual({ id: 'user-456', email: 'test@example.com' });
    expect(result.roles).toEqual(['customer']);
  });

  it('returns guest state when no user and no simulated role', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    };
    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase as never);

    const result = await getServerUserAndRoles();
    expect(result.user).toBeNull();
    expect(result.roles).toEqual([]);
  });
});
