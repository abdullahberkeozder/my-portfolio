import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DisputesIndexPage from '../../app/uyusmazliklar/page';

type DisputeItem = {
  id: string;
  job_id: string;
  category: string;
  description: string;
  status: string;
  sla_due_at: string;
  created_at: string;
};

const mockState = vi.hoisted(() => ({
  user: { id: 'cust-123', email: 'musteri@example.com' } as { id: string; email: string } | null,
  disputes: [] as DisputeItem[],
  error: null as null | { message: string },
}));

vi.mock('../../app/lib/supabase/server', () => ({
  createSupabaseServerClient: async () => ({
    auth: {
      getUser: async () => ({
        data: { user: mockState.user },
      }),
    },
    from: () => {
      const queryObj: Record<string, unknown> = {
        data: mockState.disputes,
        error: mockState.error,
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
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

describe('User Disputes Index Page (app/uyusmazliklar/page.tsx)', () => {
  afterEach(() => {
    cleanup();
    mockState.disputes = [];
    mockState.error = null;
    mockState.user = { id: 'cust-123', email: 'musteri@example.com' };
  });

  it('renders reassuring empty state when customer/tradesperson has no disputes', async () => {
    mockState.disputes = [];
    const ui = await DisputesIndexPage();
    render(ui);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Uyuşmazlık Dosyalarınız');
    expect(screen.getByText('Aktif Bir Uyuşmazlığınız Bulunmuyor')).toBeInTheDocument();
    expect(screen.getByText('İşlerimi Görüntüle →')).toHaveAttribute('href', '/islerim');
    expect(screen.getAllByText('0')).toHaveLength(3);
  });

  it('renders active dispute cards with category, status, and navigation to details', async () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    mockState.disputes = [
      {
        id: 'disp-1111-2222-3333-4444',
        job_id: 'job-aaa',
        category: 'quality',
        description: 'Banyo bataryası montajı sonrası contadan su sızmaya devam ediyor.',
        status: 'awaiting_evidence',
        sla_due_at: futureDate,
        created_at: new Date().toISOString(),
      },
      {
        id: 'disp-5555-6666-7777-8888',
        job_id: 'job-bbb',
        category: 'scope',
        description: 'Ekstra boru değişimi bedeli konusunda mutabakat sağlandı ve kapatıldı.',
        status: 'closed',
        sla_due_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    const ui = await DisputesIndexPage();
    render(ui);

    // Summary statistics cards
    expect(screen.getByText('Aktif İnceleme')).toBeInTheDocument();
    expect(screen.getByText('Çözümlenen / Kapanan')).toBeInTheDocument();

    // Dispute details
    expect(screen.getByText('Kanıt Bekleniyor')).toBeInTheDocument();
    expect(screen.getByText('Çözümlendi')).toBeInTheDocument();
    expect(screen.getByText('İşçilik Kalitesi · Dosya #disp-111')).toBeInTheDocument();
    expect(screen.getByText('Banyo bataryası montajı sonrası contadan su sızmaya devam ediyor.')).toBeInTheDocument();

    // Action button linking to /uyusmazliklar/[id]
    const detailLinks = screen.getAllByRole('link', { name: /Dosyayı ve Kanıtları Aç/i });
    expect(detailLinks).toHaveLength(2);
    expect(detailLinks[0]).toHaveAttribute('href', '/uyusmazliklar/disp-1111-2222-3333-4444');
    expect(detailLinks[1]).toHaveAttribute('href', '/uyusmazliklar/disp-5555-6666-7777-8888');
  });

  it('renders graceful error notification when database query fails', async () => {
    mockState.error = { message: 'DB connection interrupted' };
    const ui = await DisputesIndexPage();
    render(ui);

    expect(screen.getByText('Dosyalar Yüklenemedi')).toBeInTheDocument();
  });
});
