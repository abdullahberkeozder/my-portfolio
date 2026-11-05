import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import OrchestraLogo from '../../app/components/OrchestraLogo';

describe('Orkestra Birlik (Seçenek A: Çapraz Mavi & Yeşil) mark', () => {
  it('renders 4 interlocking Birlik lobes with cross two-tone fills', () => {
    const { container } = render(<OrchestraLogo />);
    const lobes = container.querySelectorAll('.birlik-lobe');
    expect(lobes).toHaveLength(4);

    const north = container.querySelector('.module-north');
    const south = container.querySelector('.module-south');
    const east = container.querySelector('.module-east');
    const west = container.querySelector('.module-west');

    expect(north).not.toBeNull();
    expect(south).not.toBeNull();
    expect(east).not.toBeNull();
    expect(west).not.toBeNull();

    // North & South are Cobalt Blue
    expect(north?.getAttribute('fill')).toContain('#1246B5');
    expect(south?.getAttribute('fill')).toContain('#1246B5');

    // East & West are Forest Emerald Green
    expect(east?.getAttribute('fill')).toContain('#0E6F47');
    expect(west?.getAttribute('fill')).toContain('#0E6F47');

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 100 100');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('preserves accent overrides on east and west lobes', () => {
    const { container } = render(<OrchestraLogo accentColor="#10B981" />);
    expect(container.querySelector('.module-north')?.getAttribute('fill')).toContain('#1246B5');
    expect(container.querySelector('.module-east')?.getAttribute('fill')).toBe('#10B981');
    expect(container.querySelector('.module-west')?.getAttribute('fill')).toBe('#10B981');
  });

  it('renders solid monochrome when single color override is passed', () => {
    const { container } = render(<OrchestraLogo color="#000000" />);
    const lobes = container.querySelectorAll('.birlik-lobe');
    lobes.forEach(lobe => {
      expect(lobe.getAttribute('fill')).toBe('#000000');
    });
  });

  it('renders crisp white on inverse dark backgrounds', () => {
    const { container } = render(<OrchestraLogo variant="inverse" size={24} />);
    const lobes = container.querySelectorAll('.birlik-lobe');
    lobes.forEach(lobe => {
      expect(lobe.getAttribute('fill')).toBe('#FFFFFF');
    });
    expect(container.querySelector('svg')).toHaveAttribute('width', '24');
  });
});
