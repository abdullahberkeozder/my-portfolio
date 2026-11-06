import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProfessionalMilestoneBadge from '../../app/components/ProfessionalMilestoneBadge';

describe('ProfessionalMilestoneBadge', () => {
  it('hides unknown and below-threshold counts', () => {
    const { rerender } = render(<ProfessionalMilestoneBadge count={null} professionalName="Ayşe Usta" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(<ProfessionalMilestoneBadge count={4} professionalName="Ayşe Usta" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows only the highest earned threshold', () => {
    render(<ProfessionalMilestoneBadge count={27} professionalName="Ayşe Usta" />);
    const trigger = screen.getByRole('button', { name: /Ayşe Usta: 20 iş tamamladı/ });
    expect(trigger).toHaveTextContent('20');
    expect(trigger).not.toHaveTextContent('27');
  });

  it('renders the open explanation panel into document.body, outside the badge root', () => {
    const { container } = render(
      <ProfessionalMilestoneBadge count={27} professionalName="Ayşe Usta" />
    );
    const trigger = screen.getByRole('button', { name: /Ayşe Usta: 20 iş tamamladı/ });
    const badgeRoot = container.firstElementChild as HTMLElement;

    fireEvent.click(trigger);

    const region = screen.getByRole('region', { name: '20 iş tamamladı' });
    expect(region).toBeInTheDocument();
    expect(region.parentElement).toBe(document.body);
    expect(badgeRoot.contains(region)).toBe(false);
  });

  it('opens and closes with the native button click path and restores focus on Escape', () => {
    render(<ProfessionalMilestoneBadge count={27} professionalName="Ayşe Usta" />);
    const trigger = screen.getByRole('button', { name: /Ayşe Usta: 20 iş tamamladı/ });

    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole('region', { name: '20 iş tamamladı' })).toHaveTextContent('27 iş tamamladı');
    expect(screen.getByRole('region')).toHaveTextContent('kalite puanı veya sıralama değildir');

    fireEvent.click(trigger);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByRole('region', { name: '20 iş tamamladı' })).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('keeps panel open on inside pointer interactions and closes on outside pointer interactions', () => {
    render(<ProfessionalMilestoneBadge count={52} professionalName="Ayşe Usta" />);
    const trigger = screen.getByRole('button', { name: /Ayşe Usta: 50 iş tamamladı/ });
    fireEvent.click(trigger);

    const region = screen.getByRole('region', { name: '50 iş tamamladı' });
    expect(region).toBeInTheDocument();

    // Pointer down inside the panel keeps it open
    fireEvent.pointerDown(region);
    expect(screen.getByRole('region', { name: '50 iş tamamladı' })).toBeInTheDocument();

    // Pointer down inside the trigger keeps it open
    fireEvent.pointerDown(trigger);
    expect(screen.getByRole('region', { name: '50 iş tamamladı' })).toBeInTheDocument();

    // Pointer down outside closes the panel
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('closes on capture-phase scroll and window resize to avoid drift', () => {
    render(<ProfessionalMilestoneBadge count={52} professionalName="Ayşe Usta" />);
    const trigger = screen.getByRole('button', { name: /Ayşe Usta: 50 iş tamamladı/ });

    // Open and verify scroll closes
    fireEvent.click(trigger);
    expect(screen.getByRole('region', { name: '50 iş tamamladı' })).toBeInTheDocument();

    fireEvent.scroll(window);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();

    // Reopen and verify resize closes
    fireEvent.click(trigger);
    expect(screen.getByRole('region', { name: '50 iş tamamladı' })).toBeInTheDocument();

    fireEvent(window, new Event('resize'));
    expect(screen.queryByRole('region')).not.toBeInTheDocument();

    // Reopen and verify scroll on scrollable child container closes via capture
    fireEvent.click(trigger);
    expect(screen.getByRole('region', { name: '50 iş tamamladı' })).toBeInTheDocument();

    const scrollContainer = document.createElement('div');
    document.body.appendChild(scrollContainer);
    fireEvent.scroll(scrollContainer);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    document.body.removeChild(scrollContainer);
  });

  it('closes with Escape from the panel close control and restores trigger focus', () => {
    render(<ProfessionalMilestoneBadge count={52} professionalName="Ayşe Usta" />);
    const trigger = screen.getByRole('button', { name: /Ayşe Usta: 50 iş tamamladı/ });
    fireEvent.click(trigger);

    const closeButton = screen.getByRole('button', { name: 'Kilometre taşı açıklamasını kapat' });
    closeButton.focus();
    fireEvent.keyDown(closeButton, { key: 'Escape' });

    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes when clicking close button and restores trigger focus', () => {
    render(<ProfessionalMilestoneBadge count={52} professionalName="Ayşe Usta" />);
    const trigger = screen.getByRole('button', { name: /Ayşe Usta: 50 iş tamamladı/ });
    fireEvent.click(trigger);

    const closeButton = screen.getByRole('button', { name: 'Kilometre taşı açıklamasını kapat' });
    fireEvent.click(closeButton);

    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('does not bubble pointer or keyboard events to parent card container', () => {
    const onParentClick = vi.fn();
    const onParentKeyDown = vi.fn();
    const onParentFocus = vi.fn();
    render(
      <div onClick={onParentClick} onKeyDown={onParentKeyDown} onFocus={onParentFocus}>
        <ProfessionalMilestoneBadge count={27} professionalName="Ayşe Usta" />
      </div>
    );
    const trigger = screen.getByRole('button', { name: /Ayşe Usta: 20 iş tamamladı/ });

    // Trigger click to open
    fireEvent.click(trigger);
    expect(onParentClick).not.toHaveBeenCalled();

    // Inside panel click
    const region = screen.getByRole('region', { name: '20 iş tamamladı' });
    fireEvent.click(region);
    expect(onParentClick).not.toHaveBeenCalled();

    // Enter and Space retain native button activation without reaching the parent card.
    fireEvent.keyDown(trigger, { key: 'Enter' });
    fireEvent.keyDown(trigger, { key: ' ' });
    expect(onParentKeyDown).not.toHaveBeenCalled();

    // Escape is handled by the badge and must not reach the parent card.
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(onParentKeyDown).not.toHaveBeenCalled();

    trigger.focus();
    expect(onParentFocus).not.toHaveBeenCalled();
  });
});
