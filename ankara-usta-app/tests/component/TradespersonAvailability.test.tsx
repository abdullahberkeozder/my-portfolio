import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AvailabilityForm from '../../app/usta/musaitlik/AvailabilityForm';

describe('TradespersonAvailabilityPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the availability management header, preset buttons and time slots', () => {
    render(<AvailabilityForm />);

    expect(screen.getByText('USTA ÇALIŞMA TAKVİMİ')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /İş Alabileceğiniz Zamanları Belirleyin/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bugün & Yarın' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bu Hafta (7 Gün)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sabah Slotu/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Öğle Slotu/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Akşam \/ Nöbetçi/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Müsaitlik Takvimini Kaydet/i })).toBeInTheDocument();
  });

  it('submits availability payload and displays success message', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ availability: { active: true } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<AvailabilityForm />);

    const urgentCheckbox = screen.getByLabelText(/Acil \/ Aynı Gün Taleplerini Kabul Ediyorum/i);
    await user.click(urgentCheckbox);

    const submitBtn = screen.getByRole('button', { name: /Müsaitlik Takvimini Kaydet/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/tradespeople/availability',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/başarıyla kaydedildi/i);
    });
  });
});
