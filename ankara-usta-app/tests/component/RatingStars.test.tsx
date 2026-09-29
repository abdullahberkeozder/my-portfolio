import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import RatingStars from '../../app/components/ui/RatingStars';

describe('RatingStars', () => {
  it('renders correct accessible aria-label and score', () => {
    render(<RatingStars rating={4.8} showScore reviewCount={142} />);
    expect(screen.getByRole('img', { name: '4.8 / 5 yıldız' })).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('(142)')).toBeInTheDocument();
  });

  it('supports custom aria-label', () => {
    render(<RatingStars rating={5} aria-label="5 üzerinden 5 yıldız" />);
    expect(screen.getByRole('img', { name: '5 üzerinden 5 yıldız' })).toBeInTheDocument();
  });
});
