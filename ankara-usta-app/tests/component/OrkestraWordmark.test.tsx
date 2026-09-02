import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import OrkestraWordmark from '../../app/components/OrkestraWordmark';

describe('Orkestra lettering', () => {
  it('preserves the accessible brand name and eight separately editable letters', () => {
    render(<OrkestraWordmark />);
    const mark = screen.getByRole('img', { name: 'Orkestra' });
    expect([...mark.querySelectorAll('path')].map(path => path.getAttribute('data-letter')).join('')).toBe('ORKESTRA');
    expect(mark.getAttribute('stroke')).toContain('#1246B5');
  });
  it('uses yellow lettering on dark backgrounds', () => {
    render(<OrkestraWordmark inverse />);
    expect(screen.getByRole('img', { name: 'Orkestra' }).getAttribute('stroke')).toContain('#FFDD00');
  });
});
