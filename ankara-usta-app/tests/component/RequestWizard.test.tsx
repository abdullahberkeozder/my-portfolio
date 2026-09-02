import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RequestWizard from '../../app/components/RequestWizard';
import { services } from '../../app/data/serviceTaxonomy';

vi.mock('next/navigation', () => ({
  useRouter: () => ({push: vi.fn(), refresh: vi.fn()}),
}));

const tvMounting = services.find((service) => service.id === 'tv-duvar-montaji');

describe('RequestWizard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('presents scope questions progressively and requires an answer before advancing', async () => {
    const user = userEvent.setup();

    expect(tvMounting).toBeDefined();
    render(<RequestWizard service={tvMounting!} onClose={vi.fn()} />);

    let continueButton = screen.getByRole('button', { name: /Sonraki soru/i });
    expect(continueButton).toBeDisabled();

    await user.click(screen.getByLabelText('32–49 inç'));
    expect(continueButton).toBeEnabled();
    await user.click(continueButton);

    expect(screen.getByRole('progressbar', { name: 'Talep adımları' })).toHaveAttribute('aria-valuenow', '2');

    await user.click(screen.getByLabelText('Beton / tuğla'));
    continueButton = screen.getByRole('button', { name: /Sonraki soru/i });
    await user.click(continueButton);

    await user.click(screen.getByLabelText('Evet, hazır'));
    continueButton = screen.getByRole('button', { name: /Görsellere devam et/i });

    expect(continueButton).toBeEnabled();
  });

  it('shows truthful progress and validates oversized media before upload', async () => {
    const user = userEvent.setup();
    render(<RequestWizard service={tvMounting!} onClose={vi.fn()} />);

    const progress = screen.getByRole('progressbar', { name: 'Talep adımları' });
    expect(progress).toHaveAttribute('aria-valuemax', '6');
    expect(progress).toHaveAttribute('aria-valuetext', 'Kapsam sorusu 1 / 3, toplam 6 adım');

    await user.click(screen.getByLabelText('32–49 inç'));
    await user.click(screen.getByRole('button', { name: /Sonraki soru/i }));
    await user.click(screen.getByLabelText('Beton / tuğla'));
    await user.click(screen.getByRole('button', { name: /Sonraki soru/i }));
    await user.click(screen.getByLabelText('Evet, hazır'));
    await user.click(screen.getByRole('button', { name: /Görsellere devam et/i }));

    const oversized = new File(['x'], 'buyuk-video.mp4', { type: 'video/mp4' });
    Object.defineProperty(oversized, 'size', { value: 52_428_801 });
    await user.upload(screen.getByLabelText(/Fotoğraf veya video seçin/i), oversized);

    expect(screen.getByRole('alert')).toHaveTextContent(/50 MB sınırını aşıyor/i);
  });

  it('uses a visible default timing that matches the submitted value', async () => {
    const user = userEvent.setup();
    render(<RequestWizard service={tvMounting!} onClose={vi.fn()} />);

    for (const option of ['32–49 inç', 'Beton / tuğla', 'Evet, hazır']) {
      await user.click(screen.getByLabelText(option));
      await user.click(screen.getByRole('button', { name: /Sonraki soru|Görsellere devam et/i }));
    }
    await user.click(screen.getByRole('button', { name: /Konum ve Tarih/i }));

    expect(screen.getByRole('button', { name: 'Bu hafta içinde' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('explains the account and optional media requirements before submission', async () => {
    const user = userEvent.setup();

    render(<RequestWizard service={tvMounting!} onClose={vi.fn()} />);

    expect(screen.getByText(/yalnız gönderirken giriş yapmanız gerekir/i)).toBeVisible();
    await user.click(screen.getByLabelText('32–49 inç'));
    await user.click(screen.getByRole('button', { name: /Sonraki soru/i }));
    await user.click(screen.getByLabelText('Beton / tuğla'));
    await user.click(screen.getByRole('button', { name: /Sonraki soru/i }));
    await user.click(screen.getByLabelText('Evet, hazır'));
    await user.click(screen.getByRole('button', { name: /Görsellere devam et/i }));

    expect(screen.getByRole('dialog', { name: /İsterseniz fotoğraf veya video ekleyin/i })).toBeVisible();
    expect(screen.getByText(/Yüklemeler herkese açık değildir/i)).toBeVisible();
  });

  it('exposes an accessible dialog title and close action', () => {
    const onClose = vi.fn();

    render(<RequestWizard service={tvMounting!} onClose={onClose} />);

    expect(screen.getByRole('dialog', { name: 'TV Duvar Montajı' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kapat' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Talep adımları' })).toHaveAttribute('aria-valuenow', '1');
  });

  it('moves focus into the modal and closes it with Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<RequestWizard service={tvMounting!} onClose={onClose} />);

    expect(screen.getByRole('button', { name: 'Kapat' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not hijack Enter on the close button after answering', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<RequestWizard service={tvMounting!} onClose={onClose} />);
    await user.click(screen.getByLabelText('32–49 inç'));
    screen.getByRole('button', {name: 'Kapat'}).focus();
    await user.keyboard('{Enter}');
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  });

  it('allows selected media to be removed and preserves it after an invalid selection', async () => {
    const user = userEvent.setup();
    render(<RequestWizard service={tvMounting!} onClose={vi.fn()} />);
    for (const option of ['32–49 inç', 'Beton / tuğla', 'Evet, hazır']) {
      await user.click(screen.getByLabelText(option));
      await user.click(screen.getByRole('button', {name: /Sonraki soru|Görsellere devam et/i}));
    }
    const input = screen.getByLabelText(/Fotoğraf veya video seçin/i);
    await user.upload(input, new File(['x'], 'test.jpg', {type:'image/jpeg'}));
    const oversized = new File(['x'], 'big.mp4', {type:'video/mp4'});
    Object.defineProperty(oversized, 'size', {value:52_428_801});
    await user.upload(input, oversized);
    expect(screen.getByText('test.jpg')).toBeVisible();
    await user.click(screen.getByRole('button', {name:'test.jpg dosyasını kaldır'}));
    expect(screen.queryByText('test.jpg')).not.toBeInTheDocument();
  });
});
