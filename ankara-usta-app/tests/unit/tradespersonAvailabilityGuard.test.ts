import { describe, expect, it, vi, beforeEach } from 'vitest';
import TradespersonAvailabilityPage from '../../app/usta/musaitlik/page';
import { createSupabaseServerClient } from '../../app/lib/supabase/server';
import { redirect } from 'next/navigation';

vi.mock('../../app/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

describe('TradespersonAvailabilityPage Server Guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated users to usta login with next param', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    };
    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase as never);

    await expect(TradespersonAvailabilityPage()).rejects.toThrow('REDIRECT:/usta/giris?next=/usta/musaitlik');
    expect(redirect).toHaveBeenCalledWith('/usta/giris?next=/usta/musaitlik');
  });

  it('redirects authenticated non-tradesperson users to usta-basvurusu', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'cust-1', email: 'musteri@example.com' } },
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
              }),
            }),
          }),
        }),
      }),
    };
    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase as never);

    await expect(TradespersonAvailabilityPage()).rejects.toThrow('REDIRECT:/usta-basvurusu');
    expect(redirect).toHaveBeenCalledWith('/usta-basvurusu');
  });

  it('allows access for authenticated tradesperson users', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'pro-1', email: 'usta@example.com' } },
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'tradesperson' } }),
              }),
            }),
          }),
        }),
      }),
    };
    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase as never);

    const jsx = await TradespersonAvailabilityPage();
    expect(jsx).toBeDefined();
  });
});
