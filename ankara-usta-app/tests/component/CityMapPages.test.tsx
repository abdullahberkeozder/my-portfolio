import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import AccountPage from '../../app/hesap/page';
import MyRequestsPage from '../../app/taleplerim/page';
import TradespersonRequestsPage from '../../app/usta/talepler/page';
import { navigationItems } from '../../app/lib/navigationModel';

const state = vi.hoisted(() => ({
  user: { id: 'owner', email: 'example@example.test', user_metadata: { service_city: 'Ankara' } },
  requests: [] as Record<string, unknown>[],
  roles: [{ role: 'tradesperson' }] as Record<string, unknown>[],
}));

vi.mock('../../app/lib/supabase/server', () => ({
  createSupabaseServerClient: async () => ({
    auth: { getUser: async () => ({ data: { user: state.user }, error: null }) },
    rpc: async () => ({ data: false, error: null }),
    from: (table: string) => {
      const data = table === 'user_roles' ? state.roles : table === 'service_requests' ? state.requests : [];
      const query: Record<string, unknown> = { data, error: null, count: Array.isArray(data) ? data.length : 0 };
      for (const method of ['select', 'eq', 'order', 'range', 'in', 'maybeSingle']) {
        query[method] = vi.fn().mockReturnValue(query);
      }
      return query;
    },
  }),
}));

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }), redirect: vi.fn() }));
vi.mock('../../app/hooks/useAccountSummary', () => ({ useAccountSummary: () => ({ status: 'ready', user: { id: 'owner', name: 'Test', roles: ['customer'] } }) }));
vi.mock('../../app/lib/directedRequests', () => ({ directedRequestsEnabled: () => false }));
vi.mock('../../app/lib/prejobChat', () => ({ prejobChatEnabled: () => false }));

afterEach(() => {
  cleanup();
  state.requests = [];
  state.roles = [{ role: 'tradesperson' }];
});

it('removes the synthetic map from public product navigation', () => {
  expect(navigationItems('public').some(item => item.href === '/harita')).toBe(false);
});

it('keeps the customer request workspace focused on requests', async () => {
  render(await MyRequestsPage({ searchParams: Promise.resolve({}) }));
  expect(screen.getByRole('heading', { name: 'Taleplerim', level: 1 })).toBeInTheDocument();
  expect(screen.queryByRole('region', { name: 'Bölge haritası' })).not.toBeInTheDocument();
});

it('keeps the professional workspace focused on opportunities', async () => {
  render(await TradespersonRequestsPage({ searchParams: Promise.resolve({ view: 'open' }) }));
  expect(screen.getByRole('heading', { name: 'İş fırsatları', level: 1 })).toBeInTheDocument();
  expect(screen.queryByRole('region', { name: 'Bölge haritası' })).not.toBeInTheDocument();
});

it('keeps city preference in the account without rendering a marketplace map', async () => {
  render(await AccountPage());
  expect(screen.getByLabelText('Şehir')).toHaveValue('Ankara');
  expect(screen.queryByRole('region', { name: 'Bölge haritası' })).not.toBeInTheDocument();
});
