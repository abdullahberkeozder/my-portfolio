import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RequestStatusBadge from '../../app/components/RequestStatusBadge';

describe('RequestStatusBadge', () => {
  it('renders draft status correctly', () => {
    render(<RequestStatusBadge status="draft" />);
    const badge = screen.getByTestId('request-status-badge');
    expect(badge.textContent).toBe('Taslak');
    expect(badge.className).toContain('req-status-neutral');
    expect(badge.className).toContain('req-status-draft');
  });

  it('renders matching status with pulse indicator', () => {
    const { container } = render(<RequestStatusBadge status="matching" />);
    const badge = screen.getByTestId('request-status-badge');
    expect(badge.textContent).toBe('Usta aranıyor');
    expect(badge.className).toContain('req-status-accent');
    expect(container.querySelector('.req-status-pulse')).not.toBeNull();
  });

  it('renders quotes_received with dynamic count', () => {
    render(<RequestStatusBadge status="quotes_received" quoteCount={3} />);
    const badge = screen.getByTestId('request-status-badge');
    expect(badge.textContent).toBe('3 Teklif Geldi');
    expect(badge.className).toContain('req-status-success');
  });

  it('renders quotes_received default label when quoteCount is 0 or undefined', () => {
    render(<RequestStatusBadge status="quotes_received" />);
    const badge = screen.getByTestId('request-status-badge');
    expect(badge.textContent).toBe('Teklifler hazır');
  });

  it('renders provider_selected with success tone', () => {
    render(<RequestStatusBadge status="provider_selected" />);
    const badge = screen.getByTestId('request-status-badge');
    expect(badge.textContent).toBe('Usta seçildi');
    expect(badge.className).toContain('req-status-success');
  });

  it('falls back gracefully for unknown status', () => {
    render(<RequestStatusBadge status="custom_status" />);
    const badge = screen.getByTestId('request-status-badge');
    expect(badge.textContent).toBe('custom_status');
    expect(badge.className).toContain('req-status-neutral');
  });
});
