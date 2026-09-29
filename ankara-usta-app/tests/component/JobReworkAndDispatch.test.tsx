import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JobWorkspace from '../../app/components/JobWorkspace';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe('JobWorkspace Rework (Bionluk) and Dispatch (TaskRabbit) features', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const baseProps = {
    jobId: '11111111-1111-4111-8111-111111111111',
    currentUserId: 'user-pro-1',
    role: 'tradesperson' as const,
    status: 'in_progress',
    events: [
      {
        id: 'e1',
        sequence: 1,
        event_type: 'job_created',
        actor_role: 'system',
        payload: {},
        created_at: new Date().toISOString(),
      },
    ],
    messages: [],
    appointments: [],
    scopeChanges: [],
    address: {
      address_line: 'Karanfil Sokak No: 12',
      building: 'B Blok',
      apartment: '4',
      directions: 'Zil: Usta',
    },
    acceptedQuote: {
      id: 'q1',
      version: 1,
      labor_amount_kurus: 50000,
      material_amount_kurus: 10000,
      estimated_duration_minutes: 60,
      warranty_days: 90,
      included_scope: ['Montaj'],
      excluded_scope: [],
      note: null,
    },
  };

  it('renders quick dispatch buttons for tradesperson and sends status update message', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: { id: 'm1' } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<JobWorkspace {...baseProps} />);

    // Switch to trust tab
    const trustTab = screen.getByRole('tab', { name: /Onay ve işlemler/i });
    await user.click(trustTab);

    expect(screen.getByText(/Hızlı Sevk Durumu \(TaskRabbit Modeli\)/i)).toBeInTheDocument();
    const enRouteBtn = screen.getByRole('button', { name: /🚗 Yoldayım/i });
    expect(enRouteBtn).toBeInTheDocument();

    await user.click(enRouteBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
      const calledUrl = fetchMock.mock.calls[0][0];
      const calledBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(calledUrl).toContain('/api/jobs/11111111-1111-4111-8111-111111111111/messages');
      expect(calledBody.body).toContain('🚗 Yoldayım');
    });
  });

  it('enforces required punch-list note when customer requests rework on awaiting approval', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ job: { status: 'in_progress' } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <JobWorkspace
        {...baseProps}
        currentUserId="user-customer-1"
        role="customer"
        status="awaiting_customer_approval"
      />
    );

    // Switch to trust tab
    const trustTab = screen.getByRole('tab', { name: /Onay ve işlemler/i });
    await user.click(trustTab);

    const reworkTriggerBtn = screen.getByRole('button', { name: /Düzeltme iste/i });
    await user.click(reworkTriggerBtn);

    // Confirmation modal should display rework textarea
    expect(screen.getByText(/Eksik veya Düzeltilmesi Gereken Noktalar \(Zorunlu\)/i)).toBeInTheDocument();
    const confirmBtn = screen.getByRole('button', { name: /Evet, İşlemi Onayla/i });
    expect(confirmBtn).toBeDisabled();

    // Fill in rework explanation
    const reasonInput = screen.getByPlaceholderText(/Lavabo altındaki bağlantı contasından/i);
    await user.type(reasonInput, 'Batarya altındaki contadan su sızıyor, tekrar sıkılması gerekli.');

    expect(confirmBtn).not.toBeDisabled();
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
  });
});
