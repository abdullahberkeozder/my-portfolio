import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import JobWorkspace, { type AcceptedQuoteTerms } from '../../app/components/JobWorkspace';

const mocks = vi.hoisted(() => ({ router: { refresh: vi.fn() } }));
vi.mock('next/navigation', () => ({ useRouter: () => mocks.router }));
vi.mock('../../app/lib/workspaceMutation', () => ({ workspaceMutation: vi.fn() }));

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

const sampleQuote: AcceptedQuoteTerms = {
  id: 'quote-contract-1',
  version: 1,
  labor_amount_kurus: 120000, // 1.200 TL
  material_amount_kurus: 30000, // 300 TL
  estimated_duration_minutes: 120,
  warranty_days: 90,
  included_scope: ['Klozet iç takım değişimi'],
  excluded_scope: [],
  note: null,
};

describe('JobWorkspace Escrow Protection (SRS: FR-15, BR-06 / SDD: 4.4)', () => {
  it('displays escrow protection card with held_in_escrow status when job is in_progress', () => {
    render(
      <JobWorkspace
        jobId="job-1"
        currentUserId="customer-1"
        role="customer"
        status="in_progress"
        events={[]}
        messages={[]}
        appointments={[]}
        scopeChanges={[]}
        address={null}
        acceptedQuote={sampleQuote}
      />
    );

    // Switch to Kapsam tab
    fireEvent.click(screen.getByRole('tab', { name: 'Kapsam' }));

    const escrowCard = screen.getByRole('article', { name: 'Emanet ödeme havuz güvencesi' });
    expect(escrowCard).toBeInTheDocument();
    expect(escrowCard).toHaveTextContent('ORKESTRA GÜVENLİ HAVUZ (ESCROW) GÜVENCESİ');
    expect(escrowCard).toHaveTextContent('Güvenli Havuz Koruması Aktif');
    expect(escrowCard).toHaveTextContent('🛡️ Havuzda Bloke Altında');
  });

  it('displays 72-hour auto-release countdown when awaiting_customer_approval', () => {
    const deliveryEvent = {
      id: 'event-delivery',
      sequence: 3,
      event_type: 'status_changed',
      actor_role: 'tradesperson',
      payload: { new_status: 'awaiting_customer_approval' },
      created_at: '2026-09-29T10:00:00.000Z',
    };

    render(
      <JobWorkspace
        jobId="job-1"
        currentUserId="customer-1"
        role="customer"
        status="awaiting_customer_approval"
        events={[deliveryEvent]}
        messages={[]}
        appointments={[]}
        scopeChanges={[]}
        address={null}
        acceptedQuote={sampleQuote}
      />
    );

    // Check Hero Banner
    expect(screen.getByText('SIRADAKİ EYLEM')).toBeInTheDocument();
    expect(screen.getByText(/72 saatlik güvenli havuz süresi devrededir/i)).toBeInTheDocument();

    // Check Onay ve işlemler tab (Tab 5)
    fireEvent.click(screen.getByRole('tab', { name: 'Onay ve işlemler' }));
    const trustBanner = screen.getByLabelText('Emanet ödeme durumu');
    expect(trustBanner).toBeInTheDocument();
    expect(trustBanner).toHaveTextContent('⏳ 72s Onay & Geri Sayım');
    expect(trustBanner).toHaveTextContent('Son İşlem Tarihi:');
    expect(trustBanner).toHaveTextContent('72 saatlik süre dolduğunda otomatik aktarım sağlanır');
  });

  it('displays released escrow badge when job is completed', () => {
    render(
      <JobWorkspace
        jobId="job-1"
        currentUserId="customer-1"
        role="customer"
        status="completed"
        events={[]}
        messages={[]}
        appointments={[]}
        scopeChanges={[]}
        address={null}
        acceptedQuote={sampleQuote}
      />
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Kapsam' }));
    const escrowCard = screen.getByRole('article', { name: 'Emanet ödeme havuz güvencesi' });
    expect(escrowCard).toHaveTextContent('✅ Ustanın Hesabına Aktarıldı');
    expect(escrowCard).toHaveTextContent('Emanet Başarıyla Çözümlendi');
  });

  it('displays transparent financial breakdown and confirmation modal with payout details', () => {
    render(
      <JobWorkspace
        jobId="job-1"
        currentUserId="customer-1"
        role="customer"
        status="awaiting_customer_approval"
        events={[]}
        messages={[]}
        appointments={[]}
        scopeChanges={[]}
        address={null}
        acceptedQuote={sampleQuote}
      />
    );

    // 1. Verify breakdown on Kapsam tab
    fireEvent.click(screen.getByRole('tab', { name: 'Kapsam' }));
    const breakdown = screen.getByLabelText('Emanet ödeme dökümü');
    expect(breakdown).toHaveTextContent('İşçilik Tutarı');
    expect(breakdown).toHaveTextContent('1.200');
    expect(breakdown).toHaveTextContent('Malzeme / Ek');
    expect(breakdown).toHaveTextContent('300');
    expect(breakdown).toHaveTextContent('Toplam Havuz Güvencesi');
    expect(breakdown).toHaveTextContent('1.500');

    // 2. Open confirmation modal from Onay ve işlemler tab
    fireEvent.click(screen.getByRole('tab', { name: 'Onay ve işlemler' }));
    fireEvent.click(screen.getByRole('button', { name: 'İşi onaylayın ve tamamlayın' }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent('İşi onaylayın ve tamamlayın işlemini onaylıyor musunuz?');
    expect(dialog).toHaveTextContent('1.500');
    expect(dialog).toHaveTextContent('tutarındaki ödeme ustanın hesabına aktarılacak');
  });
});
