import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TradespersonQuotePage from '../../app/usta/teklifler/[requestId]/page';

const mockState = vi.hoisted(() => ({
  user: { id: 'pro-456' },
  request: {
    id: 'req-123',
    service_id: 'musluk-tamiri',
    status: 'quotes_received',
    routing_mode: 'broadcast',
    neighborhood: 'Ayrancı',
    district: 'Çankaya',
    preferred_timing: 'asap',
    delivery_model: 'custom_quote',
    answers: {},
  },
  match: { score: 92, reasons: ['Bölge eşleşiyor', 'Hizmet eşleşiyor'] },
  latestQuote: { id: 'quote-v1', version: 1 } as null | { id: string; version: number },
  revisionRequest: null as null | { id: string; fields: string[]; reason: string; created_at: string },
}));

vi.mock('../../app/lib/quoteRevisions', () => ({ quoteRevisionsEnabled: () => true }));
vi.mock('../../app/lib/directedRequests', () => ({ directedRequestsEnabled: () => false }));
vi.mock('../../app/components/RealtimeRefresh', () => ({ default: () => null }));
vi.mock('../../app/components/RequestConversationLinks', () => ({ default: () => null }));
vi.mock('../../app/components/QuoteForm', () => ({ default: () => <div data-testid="quote-form">Teklif Formu</div> }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(() => { throw new Error('NOT_FOUND'); }),
}));

vi.mock('../../app/lib/supabase/server', () => ({
  createSupabaseServerClient: async () => ({
    auth: { getUser: async () => ({ data: { user: mockState.user } }) },
    from: (table: string) => {
      let data: unknown = null;
      if (table === 'service_requests') data = mockState.request;
      if (table === 'request_matches') data = mockState.match;
      if (table === 'quotes') data = mockState.latestQuote;
      if (table === 'quote_revision_requests') data = mockState.revisionRequest;

      const chain: Record<string, unknown> = {
        data,
        error: null,
      };
      const methods = ['select', 'eq', 'order', 'limit', 'maybeSingle'];
      for (const m of methods) {
        chain[m] = vi.fn().mockReturnValue(chain);
      }
      return chain;
    },
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockState.latestQuote = { id: 'quote-v1', version: 1 };
  mockState.revisionRequest = null;
});

afterEach(cleanup);

describe('TradespersonQuotePage (Quote Revision Alert)', () => {
  it('renders revision request alert with requested topics and customer reason', async () => {
    mockState.revisionRequest = {
      id: 'rev-req-1',
      fields: ['price', 'warranty'],
      reason: 'İşçilik bedeli biraz yüksek geldi ve garanti süresi 90 güne çıkarılabilir mi?',
      created_at: new Date().toISOString(),
    };

    render(await TradespersonQuotePage({ params: Promise.resolve({ requestId: 'req-123' }) }));

    const alert = screen.getByRole('alert', { name: 'Müşteri revizyon talebi' });
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Müşteri Teklif Revizyonu İstedi (Sürüm 1)');
    expect(alert).toHaveTextContent('İşçilik bedeli');
    expect(alert).toHaveTextContent('Garanti');
    expect(alert).toHaveTextContent('İşçilik bedeli biraz yüksek geldi ve garanti süresi 90 güne çıkarılabilir mi?');

    const revisionLink = screen.getByRole('link', { name: 'Yeni Sürüm (v2) Hazırla ve Gönder →' });
    expect(revisionLink).toHaveAttribute('href', '/teklifler/quote-v1');
  });

  it('renders standard revision link when no revision request is pending from customer', async () => {
    mockState.revisionRequest = null;

    render(await TradespersonQuotePage({ params: Promise.resolve({ requestId: 'req-123' }) }));

    expect(screen.queryByRole('alert', { name: 'Müşteri revizyon talebi' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Müşterinin isteğini ve sürüm geçmişini incele →' })).toHaveAttribute(
      'href',
      '/teklifler/quote-v1'
    );
  });
});
