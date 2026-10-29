import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DiscoveryWorkDetail from '../../app/components/DiscoveryWorkDetail';

vi.mock('next/image', () => ({ default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} /> }));

const work = { id: 'work-1', title: 'Duvar rafı', image: '/work.jpg', artisanName: 'Örnek Usta', artisanDistrict: 'Çankaya', materials: ['Ahşap'] };
const props = { work, serviceName: 'Montaj', returnFocusRef: { current: null }, onClose: vi.fn(), onRequest: vi.fn() };

describe('DiscoveryWorkDetail', () => {
  it('focuses close, locks scrolling and restores previous overflow', () => {
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'scroll';
    const { unmount } = render(<DiscoveryWorkDetail {...props} />);
    expect(screen.getByRole('button', { name: 'Kapat' })).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.documentElement.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('auto');
    expect(document.documentElement.style.overflow).toBe('scroll');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  });

  it('closes on Escape and backdrop but not interior clicks', () => {
    const onClose = vi.fn();
    render(<DiscoveryWorkDetail {...props} onClose={onClose} />);
    fireEvent.click(screen.getByRole('heading'));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('presentation'));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('wraps keyboard focus in both directions and preserves request action', () => {
    const onRequest = vi.fn();
    render(<DiscoveryWorkDetail {...props} onRequest={onRequest} />);
    const close = screen.getByRole('button', { name: 'Kapat' });
    const request = screen.getByRole('button', { name: 'Bu hizmet için talep oluştur' });
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(request).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(close).toHaveFocus();
    fireEvent.click(request);
    expect(onRequest).toHaveBeenCalledTimes(1);
  });

  it('restores focus to the explicit connected opener', () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    const { unmount } = render(<DiscoveryWorkDetail {...props} returnFocusRef={{ current: opener }} />);
    unmount();
    expect(opener).toHaveFocus();
    opener.remove();
  });
});
