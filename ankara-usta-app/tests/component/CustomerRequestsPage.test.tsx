import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MyRequestsPage from '../../app/taleplerim/page';

const mockState = vi.hoisted(() => ({
  user: { id: 'cust-123', email: 'musteri@test.com', user_metadata: { service_city: 'Ankara' } },
  requests: [] as Record<string, unknown>[],
  quotes: [] as Record<string, unknown>[],
  jobs: [] as Record<string, unknown>[],
  errors: {} as Record<string, { message: string } | undefined>,
  authError: null as null | { name: string },
}));

vi.mock('../../app/lib/supabase/server', () => ({
  createSupabaseServerClient: async () => {
    return {
      auth: { getUser: async () => ({ data: { user: mockState.user }, error: mockState.authError }) },
      from: (table: string) => {
        let returnData: unknown = mockState.requests;
        if (table === 'quotes') returnData = mockState.quotes;
        if (table === 'jobs') returnData = mockState.jobs;
        if (table === 'request_invitations') returnData = [];

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
vi.mock('../../app/lib/directedRequests', () => ({ directedRequestsEnabled: () => false }));
vi.mock('../../app/lib/prejobChat', () => ({ prejobChatEnabled: () => true }));

afterEach(() => {
  cleanup();
  mockState.requests = [];
  mockState.quotes = [];
  mockState.jobs = [];
  mockState.errors = {};
  mockState.authError = null;
});

describe('MyRequestsPage (Customer Workspace)', () => {
  it('renders workspace title and action bar', async () => {
    render(await MyRequestsPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole('heading', { name: 'Taleplerim', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('MÜŞTERİ ÇALIŞMA ALANI')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '+ Yeni Talep' })).toHaveAttribute('href', '/#services');
    expect(screen.getByRole('link', { name: 'Görüşmelerim →' })).toHaveAttribute('href', '/gorusmeler');
  });

  it('renders quotes_received request with prominent comparison CTA and badge', async () => {
    mockState.requests = [
      {
        id: 'req-quote-1',
        service_id: 'musluk-tamiri',
        status: 'quotes_received',
        district: 'Sincan',
        neighborhood: 'Fatih',
        updated_at: '2026-09-21T10:00:00Z',
      },
    ];
    mockState.quotes = [
      { id: 'q1', request_id: 'req-quote-1', status: 'submitted' },
      { id: 'q2', request_id: 'req-quote-1', status: 'submitted' },
    ];

    render(await MyRequestsPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText('2 Teklif Geldi')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Teklifleri Karşılaştır (2) →' })).toHaveAttribute(
      'href',
      '/taleplerim/req-quote-1/teklifler'
    );
    // P1.1: Çift CTA kaldırıldı; aynı sayfaya giden mükerrer "Eşleşme ve teklifler →" linki bulunmamalıdır.
    expect(screen.queryByRole('link', { name: 'Eşleşme ve teklifler →' })).not.toBeInTheDocument();
  });

  it('renders provider_selected request with direct job link', async () => {
    mockState.requests = [
      {
        id: 'req-selected-1',
        service_id: 'musluk-tamiri',
        status: 'provider_selected',
        district: 'Çankaya',
        neighborhood: 'Kızılay',
        updated_at: '2026-09-21T11:00:00Z',
      },
    ];
    mockState.jobs = [{ id: 'job-xyz', request_id: 'req-selected-1', status: 'in_progress' }];

    render(await MyRequestsPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText('Usta Seçildi')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'İş Ekranına Git →' })).toHaveAttribute('href', '/islerim/job-xyz');
    // P1.1: Usta seçildiğinde tek birincil link iş odasıdır, mükerrer eşleşme linki yoktur.
    expect(screen.queryByRole('link', { name: 'Eşleşme ve teklifler →' })).not.toBeInTheDocument();
  });

  it('keeps requests visible and reports a partial quote summary failure', async () => {
    mockState.requests = [
      {
        id: 'req-partial-1',
        service_id: 'musluk-tamiri',
        status: 'quotes_received',
        district: 'Sincan',
        neighborhood: 'Fatih',
        updated_at: '2026-09-21T10:00:00Z',
      },
    ];
    mockState.errors.quotes = { message: 'private SQL detail' };

    render(await MyRequestsPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByTestId('request-card-req-partial-1')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Bazı güncel bilgiler alınamadı');
    expect(screen.queryByText('Henüz talebiniz yok')).not.toBeInTheDocument();
  });

  it('falls back to the jobs workspace when a selected request job link cannot be verified', async () => {
    mockState.requests = [
      {
        id: 'req-selected-fallback',
        service_id: 'musluk-tamiri',
        status: 'provider_selected',
        district: 'Çankaya',
        neighborhood: 'Kızılay',
        updated_at: '2026-09-21T11:00:00Z',
      },
    ];
    mockState.errors.jobs = { message: 'private SQL detail' };

    render(await MyRequestsPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole('link', { name: 'İşlerimde Kontrol Et →' })).toHaveAttribute('href', '/islerim');
    expect(screen.getByText('İş bağlantısı henüz doğrulanamadı.')).toBeInTheDocument();
  });

  it('offers recovery instead of an active matching action for an expired request', async () => {
    mockState.requests = [
      {
        id: 'req-expired-1',
        service_id: 'musluk-tamiri',
        status: 'expired',
        district: 'Çankaya',
        neighborhood: 'Kızılay',
        updated_at: '2026-09-21T11:00:00Z',
      },
    ];

    render(await MyRequestsPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText('Süresi Doldu')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Yeni Talep Oluştur →' })).toHaveAttribute('href', '/#services');
    expect(screen.queryByRole('link', { name: 'Eşleşme ve teklifler →' })).not.toBeInTheDocument();
  });
});
