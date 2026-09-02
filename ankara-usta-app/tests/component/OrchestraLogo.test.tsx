import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import OrchestraLogo from '../../app/components/OrchestraLogo';

describe('Orkestra yellow and cobalt mark', () => {
  it('preserves five circles and renders every module in cobalt on light surfaces', () => {
    const { container } = render(<OrchestraLogo />);
    expect(container.querySelectorAll('circle')).toHaveLength(5);
    expect(container.querySelector('.module-core')).toHaveAttribute('cx', '48');
    expect(container.querySelector('.module-east')).toHaveAttribute('cx', '76');
    expect(container.querySelector('.module-east')?.getAttribute('fill')).toContain('#1246B5');
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 96 96');
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('keeps the entire inverse mark visible and preserves accent overrides', () => {
    const { container } = render(<OrchestraLogo variant="inverse" accentColor="#123456" size={24} />);
    expect(container.querySelector('g')?.getAttribute('fill')).toContain('#FFDD00');
    expect(container.querySelector('.module-core')?.getAttribute('fill')).toContain('#FFDD00');
    expect(container.querySelector('.module-east')).toHaveAttribute('fill', '#123456');
    expect(container.querySelector('svg')).toHaveAttribute('width', '24');
  });
});
