import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AvailabilityForm, { type SavedAvailability } from '../../app/usta/musaitlik/AvailabilityForm';

const today = '2026-10-13';
const existing: SavedAvailability = {
  available_from: '2026-10-14',
  available_to: '2026-10-21',
  accepts_urgent: false,
  active: true,
};

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('Tradesperson availability', () => {
  it('shows only persisted preferences and loads the saved values', () => {
    render(<AvailabilityForm today={today} initialAvailability={existing} />);
    expect(screen.getByRole('heading', { name: 'İş alma durumunuz' })).toBeInTheDocument();
    expect(screen.getByLabelText('Başlangıç tarihi')).toHaveValue('2026-10-14');
    expect(screen.getByLabelText('Bitiş tarihi')).toHaveValue('2026-10-21');
    expect(screen.getByLabelText(/Açık talepler için aktifim/)).toBeChecked();
    expect(screen.getByLabelText(/Acil talepleri de değerlendirebilirim/)).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Müsaitliği kaydet' })).toBeDisabled();
    expect(screen.queryByText(/Sabah Slotu|Öğle Slotu|Akşam \/ Nöbetçi/)).not.toBeInTheDocument();
  });

  it('submits changed values and confirms only the returned record', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ availability: { ...existing, accepts_urgent: true } }),
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<AvailabilityForm today={today} initialAvailability={existing} />);
    await user.click(screen.getByLabelText(/Acil talepleri de değerlendirebilirim/));
    await user.click(screen.getByRole('button', { name: 'Müsaitliği kaydet' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/tradespeople/availability', expect.objectContaining({ method: 'POST' })));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      availableFrom: '2026-10-14', availableTo: '2026-10-21', acceptsUrgent: true, active: true,
    });
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Müsaitlik tercihleriniz kaydedildi.'));
    expect(screen.getByRole('button', { name: 'Müsaitliği kaydet' })).toBeDisabled();
  });

  it('keeps edits after an error and never reports false success', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Kaydedilemedi.' }) }));
    render(<AvailabilityForm today={today} initialAvailability={existing} />);
    fireEvent.change(screen.getByLabelText('Bitiş tarihi'), { target: { value: '2026-10-28' } });
    await user.click(screen.getByRole('button', { name: 'Müsaitliği kaydet' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Kaydedilemedi.'));
    expect(screen.getByLabelText('Bitiş tarihi')).toHaveValue('2026-10-28');
    expect(screen.getByRole('button', { name: 'Müsaitliği kaydet' })).toBeEnabled();
  });

  it('flags an expired saved range without silently replacing it', () => {
    render(<AvailabilityForm today={today} initialAvailability={{ ...existing, available_from: '2026-09-01', available_to: '2026-09-08' }} />);
    expect(screen.getByLabelText('Başlangıç tarihi')).toHaveValue('2026-09-01');
    expect(screen.getByText(/Kayıtlı tarih aralığınız sona erdi/)).toBeInTheDocument();
  });

  it('counts quick ranges inclusively from the Ankara calendar day', async () => {
    const user = userEvent.setup();
    render(<AvailabilityForm today={today} initialAvailability={null} />);
    await user.click(screen.getByRole('button', { name: '7 gün' }));
    expect(screen.getByLabelText('Başlangıç tarihi')).toHaveValue('2026-10-13');
    expect(screen.getByLabelText('Bitiş tarihi')).toHaveValue('2026-10-19');
    expect(screen.getByRole('button', { name: '7 gün' })).toHaveAttribute('aria-pressed', 'true');
  });
});
