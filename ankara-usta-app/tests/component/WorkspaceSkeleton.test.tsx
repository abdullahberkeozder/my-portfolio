import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import WorkspaceSkeleton from '../../app/components/skeletons/WorkspaceSkeleton';
import TaleplerimLoading from '../../app/taleplerim/loading';
import UstaTaleplerLoading from '../../app/usta/talepler/loading';
import IslerimLoading from '../../app/islerim/loading';

describe('WorkspaceSkeleton Component (A11y & Loading UX)', () => {
  it('renders with role="status", aria-busy="true", and accessible announcement', () => {
    render(<WorkspaceSkeleton title="Taleplerim" count={3} />);

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveAttribute('aria-label', 'Taleplerim yükleniyor, lütfen bekleyin…');

    const cards = screen.getAllByTestId('workspace-card-skeleton');
    expect(cards).toHaveLength(3);
    for (const card of cards) {
      expect(card).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('honors custom count prop for varying workspace list sizes', () => {
    render(<WorkspaceSkeleton count={5} title="İşler" />);
    expect(screen.getAllByTestId('workspace-card-skeleton')).toHaveLength(5);
  });

  it('renders TaleplerimLoading boundary with customer title and count', () => {
    render(<TaleplerimLoading />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-label', 'Müşteri talepleri yükleniyor…');
    expect(screen.getAllByTestId('workspace-card-skeleton')).toHaveLength(3);
  });

  it('renders UstaTaleplerLoading boundary with tradesperson title and count', () => {
    render(<UstaTaleplerLoading />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-label', 'Usta iş fırsatları yükleniyor…');
    expect(screen.getAllByTestId('workspace-card-skeleton')).toHaveLength(3);
  });

  it('renders IslerimLoading boundary with job workspace title and count', () => {
    render(<IslerimLoading />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-label', 'İş odaları yükleniyor…');
    expect(screen.getAllByTestId('workspace-card-skeleton')).toHaveLength(2);
  });
});
