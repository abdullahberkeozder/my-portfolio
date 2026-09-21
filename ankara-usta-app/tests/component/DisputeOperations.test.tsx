import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DisputeOperationsPage from '../../app/yonetim/uyusmazliklar/page';

type DisputeItem = {
  id: string;
  category: string;
  description: string;
  status: string;
  sla_due_at: string;
  created_at: string;
};

const mockState = vi.hoisted(() => ({
  user: { id: 'admin-1', email: 'admin@example.com' },
  roles: ['admin'] as string[],
  disputes: [] as DisputeItem[],
  count: 0,
  error: null as null | { message: string },
}));

vi.mock('../../app/lib/authServer', () => ({
  getServerUserAndRoles: async () => ({
    user: mockState.user,
    roles: mockState.roles,
  }),
}));

vi.mock('../../app/lib/supabase/server', () => ({
  createSupabaseServerClient: async () => ({
    from: () => {
      const queryObj: Record<string, unknown> = {
        data: mockState.disputes,
        error: mockState.error,
        count: mockState.count,
      };
      const methods = ['select', 'order', 'range', 'in', 'eq', 'limit'];
      for (const m of methods) {
        queryObj[m] = vi.fn().mockReturnValue(queryObj);
      }
      return queryObj;
    },
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
  redirect: vi.fn(),
}));

vi.mock('../../app/components/RealtimeRefresh', () => ({
  default: () => <div data-testid="realtime-refresh" />,
}));

describe('DisputeOperationsPage (P5)', () => {
  afterEach(() => {
    cleanup();
    mockState.disputes = [];
    mockState.count = 0;
    mockState.error = null;
  });

  it('renders explicit error alert when database query fails', async () => {
    mockState.error = { message: 'Database connection failed' };

    render(await DisputeOperationsPage({ searchParams: Promise.resolve({ page: '1' }) }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Uyuşmazlık kuyruğu yüklenemedi' })).toBeInTheDocument();
    expect(screen.queryByText('Uyuşmazlık kuyruğu temiz')).not.toBeInTheDocument();
  });

  it('renders empty queue receipt when there are no disputes', async () => {
    mockState.disputes = [];
    mockState.count = 0;

    render(await DisputeOperationsPage({ searchParams: Promise.resolve({ page: '1' }) }));

    expect(screen.getByRole('heading', { name: 'Uyuşmazlık kuyruğu temiz' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders disputes list and SLA indicators when disputes are present', async () => {
    mockState.disputes = [
      {
        id: 'disp-1',
        category: 'Malzeme Kalitesi',
        description: 'Kullanılan batarya sızdırıyor.',
        status: 'opened',
        sla_due_at: '2026-09-22T10:00:00Z',
        created_at: '2026-09-21T08:00:00Z',
      },
    ];
    mockState.count = 1;

    render(await DisputeOperationsPage({ searchParams: Promise.resolve({ page: '1' }) }));

    expect(screen.getByRole('heading', { name: 'Malzeme Kalitesi' })).toBeInTheDocument();
    expect(screen.getByText('Kullanılan batarya sızdırıyor.')).toBeInTheDocument();
    expect(screen.getByText('Açıldı')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders pagination controls when total count exceeds page size', async () => {
    mockState.disputes = Array.from({ length: 15 }, (_, i) => ({
      id: `disp-${i}`,
      category: `Uyuşmazlık ${i}`,
      description: `Açıklama ${i}`,
      status: 'opened',
      sla_due_at: '2026-09-25T10:00:00Z',
      created_at: '2026-09-21T08:00:00Z',
    }));
    mockState.count = 35;

    render(await DisputeOperationsPage({ searchParams: Promise.resolve({ page: '1' }) }));

    expect(screen.getByRole('navigation', { name: /sayfa/i })).toBeInTheDocument();
  });
});
