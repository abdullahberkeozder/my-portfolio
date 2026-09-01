import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Button from '../../app/components/Button';

describe('Button', () => {
  it('announces its busy state and blocks repeated interaction while loading', () => {
    render(<Button loading loadingText="Kaydediliyor…">Kaydet</Button>);

    const button = screen.getByRole('button', { name: 'Kaydediliyor…' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('does not expose a busy state when idle', () => {
    render(<Button>Kaydet</Button>);

    expect(screen.getByRole('button', { name: 'Kaydet' })).not.toHaveAttribute('aria-busy');
  });
});
