import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TradespersonRequestsPage from '../../app/usta/talepler/page';

const mockState = vi.hoisted(() => ({
  user: { id: 'pro-123', email: 'usta@test.com', user_metadata: { service_city: 'Ankara' } },
  matches: [] as Record<string, unknown>[],
  invitations: [] as Record<string, unknown>[],
  quotes: [] as Record<string, unknown>[],
  jobs: [] as Record<string, unknown>[],
  role: { role: 'tradesperson' } as null | { role: string },
  errors: {} as Record<string, { message: string } | undefined>,
  authError: null as null | { name: string },
}));

vi.mock('../../app/lib/supabase/server', () => ({
  createSupabaseServerClient: async () => {
    return {
      auth: { getUser: async () => ({ data: { user: mockState.user }, error: mockState.authError }) },
      from: (table: string) => {
        let returnData: unknown = mockState.matches;
        if (table === 'request_invitations') returnData = mockState.invitations;
        if (table === 'quotes') returnData = mockState.quotes;
        if (table === 'jobs') returnData = mockState.jobs;
        if (table === 'user_roles') returnData = mockState.role;

        const queryObj: Record<string, unknown> = {
          data: returnData,
          error: mockState.errors[table] ?? null,
          count: Array.isArray(returnData) ? returnData.length : 0,
        };

        const methods = ['select', 'eq', 'order', 'range', 'in', 'maybeSingle'];
        for (const m of methods) {
          queryObj[m] = vi.fn().mockReturnValue(queryObj);
        }
        return queryObj;
      },
    };
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
  redirect: vi.fn(),
}));
vi.mock('../../app/lib/directedRequests', () => ({ directedRequestsEnabled: () => true }));
vi.mock('../../app/lib/prejobChat', () => ({ prejobChatEnabled: () => true }));

afterEach(() => {
  cleanup();
  mockState.matches = [];
  mockState.invitations = [];
  mockState.quotes = [];
  mockState.jobs = [];
  mockState.role = { role: 'tradesperson' };
  mockState.errors = {};
  mockState.authError = null;
});

describe('TradespersonRequestsPage (Artisan Workspace)', () => {
  it('renders workspace title, tabs, and action links', async () => {
    render(await TradespersonRequestsPage({ searchParams: Promise.resolve({ view: 'open' }) }));
    expect(screen.getByRole('heading', { name: 'İş fırsatları', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('USTA ÇALIŞMA ALANI')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Müsaitliğimi güncelle →' })).toHaveAttribute('href', '/usta/musaitlik');
    expect(screen.getByRole('link', { name: 'Özel görüşmelerim →' })).toHaveAttribute('href', '/gorusmeler');
    expect(screen.getByRole('link', { name: 'Bana özel talepler' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Uygun açık talepler' })).toBeInTheDocument();
  });

  it('renders new opportunity with Yeni Fırsat badge and prepare quote CTA', async () => {
    mockState.matches = [
      {
        request_id: 'req-opp-1',
        score: 95,
        reasons: ['Hizmet eşleşti', 'Sincan bölgesi uygun'],
        service_requests: {
          service_id: 'musluk-tamiri',
          district: 'Sincan',
          neighborhood: 'Fatih',
          preferred_timing: 'flexible_few_days',
          status: 'submitted',
        },
      },
    ];

    render(await TradespersonRequestsPage({ searchParams: Promise.resolve({ view: 'open' }) }));
    expect(screen.getByText('Yeni Fırsat')).toBeInTheDocument();
    expect(screen.getByText('🎯 %95 Uygunluk')).toBeInTheDocument();
    expect(screen.getByText(/📍 Fatih, Sincan/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Talebi İncele / Teklif Ver →' })).toHaveAttribute(
      'href',
      '/usta/teklifler/req-opp-1'
    );
  });

  it('reflects submitted quote and provides update CTA', async () => {
    mockState.matches = [
      {
        request_id: 'req-opp-2',
        score: 88,
        service_requests: {
          service_id: 'musluk-tamiri',
          district: 'Etimesgut',
          neighborhood: 'Eryaman',
          preferred_timing: 'specific_date',
          status: 'quotes_received',
        },
      },
    ];
    mockState.quotes = [
      {
        id: 'quote-abc',
        request_id: 'req-opp-2',
        version: 1,
        status: 'submitted',
        labor_amount_kurus: 120000,
        material_amount_kurus: 30000,
      },
    ];

    render(await TradespersonRequestsPage({ searchParams: Promise.resolve({ view: 'open' }) }));
    expect(screen.getByText(/Teklifiniz İletildi \(v1 · 1.500 ₺\)/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Teklifi İncele / Güncelle →' })).toHaveAttribute(
      'href',
      '/usta/teklifler/req-opp-2'
    );
  });

  it('reflects accepted quote and routes to jobs workspace', async () => {
    mockState.matches = [
      {
        request_id: 'req-opp-3',
        score: 92,
        service_requests: {
          service_id: 'musluk-tamiri',
          district: 'Çankaya',
          neighborhood: 'Birlik',
          preferred_timing: 'urgent',
          status: 'provider_selected',
        },
      },
    ];
    mockState.quotes = [
      {
        id: 'quote-win',
        request_id: 'req-opp-3',
        version: 1,
        status: 'accepted',
        labor_amount_kurus: 200000,
        material_amount_kurus: 50000,
      },
    ];
    mockState.jobs = [{ id: 'job-win', request_id: 'req-opp-3' }];

    render(await TradespersonRequestsPage({ searchParams: Promise.resolve({ view: 'open' }) }));
    expect(screen.getByText('✓ Teklifiniz Kabul Edildi')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'İş Ekranına Git →' })).toHaveAttribute('href', '/islerim/job-win');
  });

  it('renders direct invitation view with specific badge and panel', async () => {
    mockState.invitations = [
      {
        id: 'inv-1',
        request_id: 'req-direct-1',
        customer_id: 'cust-xyz',
        professional_id: 'pro-123',
        status: 'awaiting',
        response_due_at: '2099-09-22T12:00:00Z',
        service_requests: {
          service_id: 'musluk-tamiri',
          district: 'Sincan',
          neighborhood: 'Fatih',
          preferred_timing: 'flexible_few_days',
          status: 'submitted',
        },
      },
    ];

    render(await TradespersonRequestsPage({ searchParams: Promise.resolve({ view: 'direct' }) }));
    expect(screen.getByText('🎯 Size Özel Davet')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Özel talep durumu' })).toBeInTheDocument();
  });

  it('does not present an expired direct invitation as an actionable opportunity', async () => {
    mockState.invitations = [
      {
        id: 'inv-expired',
        request_id: 'req-direct-expired',
        customer_id: 'cust-xyz',
        professional_id: 'pro-123',
        status: 'awaiting',
        response_due_at: '2020-01-01T00:00:00Z',
        service_requests: {
          service_id: 'musluk-tamiri',
          district: 'Sincan',
          neighborhood: 'Fatih',
          preferred_timing: 'flexible_few_days',
          status: 'submitted',
        },
      },
    ];

    render(await TradespersonRequestsPage({ searchParams: Promise.resolve({ view: 'direct' }) }));
    expect(screen.getAllByText('Yanıt süresi doldu').length).toBeGreaterThan(0);
    expect(screen.getByText('Bu fırsat için yeni işlem yapılamaz')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Talebi İncele / Teklif Ver →' })).not.toBeInTheDocument();
  });

  it('keeps opportunities visible when quote summaries fail', async () => {
    mockState.matches = [
      {
        request_id: 'req-partial-pro',
        score: 90,
        service_requests: {
          service_id: 'musluk-tamiri',
          district: 'Sincan',
          neighborhood: 'Fatih',
          preferred_timing: 'flexible_few_days',
          status: 'submitted',
        },
      },
    ];
    mockState.errors.quotes = { message: 'private SQL detail' };

    render(await TradespersonRequestsPage({ searchParams: Promise.resolve({ view: 'open' }) }));
    expect(screen.getByTestId('opportunity-card-req-partial-pro')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Bazı güncel bilgiler alınamadı');
  });

  it('shows an explicit safe state to a customer opening the tradesperson workspace', async () => {
    mockState.role = null;

    render(await TradespersonRequestsPage({ searchParams: Promise.resolve({ view: 'open' }) }));
    expect(screen.getByRole('alert')).toHaveTextContent('Usta alanına erişiminiz yok');
    expect(screen.getByRole('link', { name: 'Müşteri alanına dön' })).toHaveAttribute('href', '/taleplerim');
    expect(screen.queryByText('Henüz size özel talep yok')).not.toBeInTheDocument();
  });
});
