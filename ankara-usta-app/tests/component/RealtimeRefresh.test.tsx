import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RealtimeRefresh from '../../app/components/RealtimeRefresh';

const mockRouter = { refresh: vi.fn() };
vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

let statusCallback: (status: string) => void = () => {};
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn((cb: (status: string) => void) => {
    statusCallback = cb;
  }),
};

const mockSupabase = {
  channel: vi.fn(() => mockChannel),
  removeChannel: vi.fn(),
};

vi.mock('../../app/lib/supabase/browser', () => ({
  createSupabaseBrowserClient: () => mockSupabase,
}));

describe('RealtimeRefresh Component (Resilience & Recovery Contract)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial connecting state with accessible live region', () => {
    render(
      <RealtimeRefresh
        channelName="customer-test"
        subscriptions={[{ table: 'service_requests' }]}
        label="Talep güncellemeleri"
      />
    );

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Bağlanıyor…');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('button', { name: 'Yeniden bağlan' })).toBeInTheDocument();
  });

  it('transitions to live state upon SUBSCRIBED event and offers manual refresh', () => {
    render(
      <RealtimeRefresh
        channelName="customer-test"
        subscriptions={[{ table: 'service_requests' }]}
      />
    );

    act(() => {
      statusCallback('SUBSCRIBED');
    });

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Canlı');
    expect(screen.getByRole('button', { name: 'Güncel durumu yenile' })).toBeInTheDocument();
  });

  it('transitions to unavailable upon offline event and switches to assertive announcement', () => {
    render(
      <RealtimeRefresh
        channelName="customer-test"
        subscriptions={[{ table: 'service_requests' }]}
      />
    );

    act(() => {
      statusCallback('SUBSCRIBED');
    });
    expect(screen.getByRole('status')).toHaveTextContent('Canlı');

    // Simulate browser losing internet connection
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Bağlantı kesildi');
    expect(status).toHaveAttribute('aria-live', 'assertive');
    expect(screen.getByRole('button', { name: 'Yeniden bağlan' })).toBeInTheDocument();
  });

  it('reconnects and refreshes router upon online event', async () => {
    render(
      <RealtimeRefresh
        channelName="customer-test"
        subscriptions={[{ table: 'service_requests' }]}
      />
    );

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByRole('status')).toHaveTextContent('Bağlantı kesildi');

    // Simulate browser coming back online
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(screen.getByRole('status')).toHaveTextContent('Bağlanıyor…');
    await waitFor(() => expect(mockRouter.refresh).toHaveBeenCalled());
  });

  it('allows user to trigger manual reconnection on error', () => {
    render(
      <RealtimeRefresh
        channelName="customer-test"
        subscriptions={[{ table: 'service_requests' }]}
      />
    );

    act(() => {
      statusCallback('CHANNEL_ERROR');
    });

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Bağlantı zayıf');

    const reconnectBtn = screen.getByRole('button', { name: 'Yeniden bağlan' });
    fireEvent.click(reconnectBtn);

    expect(mockRouter.refresh).toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Bağlanıyor…');
  });
});
