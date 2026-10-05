import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WhatsAppSupportPill from '../../app/components/WhatsAppSupportPill';

describe('WhatsAppSupportPill Component (Faz 6.3)', () => {
  it('renders closed floating capsule initially with proper accessibility attributes', () => {
    render(<WhatsAppSupportPill />);

    const region = screen.getByRole('region', { name: /Ankara Saha Destek ve Yardım İstasyonu/i });
    expect(region).toBeInTheDocument();

    const trigger = screen.getByRole('button', { name: /Ankara Saha Destek ve Yardım menüsünü aç/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // Menu dialog should not be rendered initially
    expect(screen.queryByRole('dialog', { name: /Saha Destek Menüsü/i })).not.toBeInTheDocument();
  });

  it('opens support card on click and exposes WhatsApp and Help links', () => {
    render(
      <WhatsAppSupportPill
        customCategory="customer_request"
        district="Çankaya"
        requestId="req-456"
      />
    );

    const trigger = screen.getByRole('button', { name: /Ankara Saha Destek ve Yardım menüsünü aç/i });
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Menu dialog should now be visible
    const dialog = screen.getByRole('dialog', { name: /Saha Destek Menüsü/i });
    expect(dialog).toBeInTheDocument();

    // Check WhatsApp link
    const waLink = screen.getByRole('link', { name: /WhatsApp Saha Hattı/i });
    expect(waLink).toBeInTheDocument();
    expect(waLink).toHaveAttribute('href', expect.stringContaining('https://wa.me/903128000606'));
    expect(decodeURIComponent(waLink.getAttribute('href') ?? '')).toContain('Çankaya');
    expect(decodeURIComponent(waLink.getAttribute('href') ?? '')).toContain('#req-456');

    // Check direct phone and help links
    expect(screen.getByRole('link', { name: /Doğrudan Ara/i })).toHaveAttribute(
      'href',
      'tel:+903128000606'
    );
    expect(screen.getByRole('link', { name: /Yardım & Süreç Rehberi/i })).toHaveAttribute(
      'href',
      '/yardim'
    );
  });

  it('closes dialog on close button click and on Escape key press', () => {
    render(<WhatsAppSupportPill />);

    const trigger = screen.getByRole('button', { name: /Ankara Saha Destek ve Yardım menüsünü aç/i });
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: /Saha Destek Menüsü/i })).toBeInTheDocument();

    // Click close button
    const closeBtn = screen.getByRole('button', { name: /Pencereyi kapat/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog', { name: /Saha Destek Menüsü/i })).not.toBeInTheDocument();

    // Open again and press Escape
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: /Saha Destek Menüsü/i })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: /Saha Destek Menüsü/i })).not.toBeInTheDocument();
  });
});
