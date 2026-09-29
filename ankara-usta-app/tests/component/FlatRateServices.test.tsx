import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FlatRateServices from '../../app/components/FlatRateServices';
import { FLAT_RATE_PACKAGES } from '../../app/data/flatRatePackages';

describe('FlatRateServices component', () => {
  it('renders all flat-rate packages with transparent scope and prices', () => {
    const handleSelect = vi.fn();
    render(<FlatRateServices onSelectService={handleSelect} />);

    expect(screen.getByText(/TASKRABBIT MODELİ · ŞEFFAF FİYAT GÜVENCESİ/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Sabit Paket Hizmetler/i })).toBeInTheDocument();

    for (const pkg of FLAT_RATE_PACKAGES) {
      expect(screen.getByText(pkg.title)).toBeInTheDocument();
      expect(screen.getAllByText(pkg.categoryName).length).toBeGreaterThan(0);
      expect(screen.getAllByText(new RegExp(`${pkg.warrantyDays} gün garanti`, 'i')).length).toBeGreaterThan(0);
    }
  });

  it('triggers onSelectService with correct serviceId on booking click', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    render(<FlatRateServices onSelectService={handleSelect} />);

    const bookFaucetBtn = screen.getByRole('button', {
      name: /Standart Musluk \/ Batarya Değişimi için hemen rezervasyon oluştur/i,
    });
    await user.click(bookFaucetBtn);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith('musluk-degisimi');
  });
});
