import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { U5VisualFixture } from '../../app/components/U5VisualFixture';

describe('U5VisualFixture', () => {
  it.each([
    ['empty', 'Henüz kayıt yok'],
    ['partial-error', 'Bazı bilgiler eksik'],
    ['expired', 'Bağlantının süresi doldu'],
    ['direct-link', 'Doğrudan iş bağlantısı'],
  ] as const)('renders %s fixture', (kind, title) => {
    render(<U5VisualFixture audience="customer" kind={kind} view="open" />);
    expect(screen.getByTestId('u5-visual-fixture')).toHaveAttribute('data-audience', 'customer');
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
  });

  it('preserves audience, view and return link for a tradesperson', () => {
    render(<U5VisualFixture audience="tradesperson" kind="expired" view="direct" />);
    const main = screen.getByTestId('u5-visual-fixture');
    expect(main).toHaveAttribute('data-audience', 'tradesperson');
    expect(main).toHaveAttribute('data-view', 'direct');
    expect(screen.getByRole('link', { name: 'Güvenli alana dön' })).toHaveAttribute('href', '/ustalar');
  });

  it('prevents duplicate retry while the callback is pending', async () => {
    let resolveRetry: () => void = () => undefined;
    const onRetry = () => new Promise<void>((resolve) => { resolveRetry = resolve; });
    render(<U5VisualFixture audience="customer" kind="partial-error" view="open" onRetry={onRetry} />);

    const button = screen.getByRole('button', { name: 'Yeniden dene' });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    resolveRetry();
    await waitFor(() => {
      expect(button).not.toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'false');
    });
  });
});
