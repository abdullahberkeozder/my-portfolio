import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DigitalWorkmanshipCertificate, {
  type CertificateData,
} from '../../app/components/DigitalWorkmanshipCertificate';

describe('DigitalWorkmanshipCertificate Component (FAZ 6.4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.print
    vi.spyOn(window, 'print').mockImplementation(() => {});
  });

  afterEach(cleanup);

  const sampleCertificate: CertificateData = {
    certificate_number: 'AU-2026-00000088',
    issued_at: '2026-10-01T10:00:00.000Z',
    warranty_ends_at: '2027-04-01T10:00:00.000Z',
    scope_snapshot: {
      quote_id: 'quote-456',
      labor_amount_kurus: 250000, // 2.500 TL
      material_amount_kurus: 80000, // 800 TL
      included_scope: ['Kombi petek temizliği', 'Oda termostatı montajı'],
      excluded_scope: ['Kazan dairesi ana vana değişimi'],
      warranty_days: 180,
    },
  };

  it('renders certificate number, jurisdiction header, and active warranty badge', () => {
    render(
      <DigitalWorkmanshipCertificate
        certificate={sampleCertificate}
        jobId="job-ankara-8888"
        role="customer"
      />
    );

    expect(screen.getByText('T.C. Ankara İli Pilot Bölge Sicili')).toBeInTheDocument();
    expect(screen.getByText('DİJİTAL İŞÇİLİK GARANTİSİ VE SAHA TESLİM TUTANAĞI')).toBeInTheDocument();
    expect(screen.getByText('AU-2026-00000088')).toBeInTheDocument();
    expect(screen.getByLabelText('Aktif Garanti')).toBeInTheDocument();
  });

  it('displays financial breakdown from escrow snapshot in Turkish Lira', () => {
    render(
      <DigitalWorkmanshipCertificate
        certificate={sampleCertificate}
        jobId="job-ankara-8888"
        role="customer"
      />
    );

    expect(screen.getByText(/Güvenli Havuz \(Escrow\) İle Onaylanan Tutar:/)).toBeInTheDocument();
    expect(screen.getByText(/İşçilik: ₺2\.500/)).toBeInTheDocument();
    expect(screen.getByText(/Malzeme: ₺800/)).toBeInTheDocument();
    expect(screen.getByText(/Toplam: ₺3\.300/)).toBeInTheDocument();
  });

  it('toggles protocol details when user clicks view protocol button', () => {
    render(
      <DigitalWorkmanshipCertificate
        certificate={sampleCertificate}
        jobId="job-ankara-8888"
        role="customer"
      />
    );

    const toggleBtn = screen.getByRole('button', { name: /Saha Teslim Tutanağını Görüntüle/i });
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Kombi petek temizliği')).not.toBeInTheDocument();

    // Expand
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Kombi petek temizliği')).toBeInTheDocument();
    expect(screen.getByText('Oda termostatı montajı')).toBeInTheDocument();
    expect(screen.getByText('Kazan dairesi ana vana değişimi')).toBeInTheDocument();
    expect(screen.getByText('Müşteri Kabul Onayı')).toBeInTheDocument();
    expect(screen.getByText('Yetkili Usta & Saha Masası')).toBeInTheDocument();

    // Collapse
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Kombi petek temizliği')).not.toBeInTheDocument();
  });

  it('calls window.print when print button is clicked', () => {
    render(
      <DigitalWorkmanshipCertificate
        certificate={sampleCertificate}
        jobId="job-ankara-8888"
        role="customer"
      />
    );

    const printBtn = screen.getByRole('button', { name: /Belgeyi Yazdır/i });
    fireEvent.click(printBtn);
    expect(window.print).toHaveBeenCalledTimes(1);
  });

  it('copies verification code and renders WhatsApp verification link', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    render(
      <DigitalWorkmanshipCertificate
        certificate={sampleCertificate}
        jobId="job-ankara-8888"
        role="customer"
      />
    );

    const copyBtn = screen.getByRole('button', { name: /Kodu Kopyala/i });
    fireEvent.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalledWith(expect.stringMatching(/^ORK-AU-2026-00000088-[A-Z0-9]{8}$/));

    const waLink = screen.getByRole('link', { name: /Saha Masasından Teyit Al/i });
    expect(waLink).toHaveAttribute('href', expect.stringContaining('https://wa.me/'));
    expect(waLink).toHaveAttribute('href', expect.stringContaining('AU-2026-00000088'));
    expect(waLink).toHaveAttribute('href', expect.stringContaining('job-ankara-8888'));
  });
});
