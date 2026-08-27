import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import RequestWizard from '../../app/components/RequestWizard';
import { services } from '../../app/data/serviceTaxonomy';

vi.mock('next/navigation', () => ({
  useRouter: () => ({push: vi.fn(), refresh: vi.fn()}),
}));

const tvMounting = services.find((service) => service.id === 'tv-duvar-montaji');

describe('RequestWizard', () => {
  it('requires every scope question before advancing', async () => {
    const user = userEvent.setup();

    expect(tvMounting).toBeDefined();
    render(<RequestWizard service={tvMounting!} onClose={vi.fn()} />);

    const continueButton = screen.getByRole('button', { name: 'Görsellere devam et' });
    expect(continueButton).toBeDisabled();

    await user.click(screen.getByLabelText('32–49 inç'));
    await user.click(screen.getByLabelText('Beton / tuğla'));
    await user.click(screen.getByLabelText('Evet, hazır'));

    expect(continueButton).toBeEnabled();
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
});
