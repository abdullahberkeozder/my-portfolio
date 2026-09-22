import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import HelpPage from '../../app/yardim/page';
import TermsPage from '../../app/kullanim-kosullari/page';
import PrivacyPage from '../../app/gizlilik/page';

afterEach(() => {
  cleanup();
});

describe('HelpPage (/yardim) Truth & Evidence Alignment', { timeout: 15000 }, () => {
  it('renders the help page with honest pilot process guidance', () => {
    render(<HelpPage />);
    expect(screen.getByRole('heading', { level: 1, name: /şeffaf ve kayıtlı ilerleyin/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Talep Oluşturma ve Hizmet Seçimi/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Teklif Kabulü ve Dijital İş Günlüğü/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Uyuşmazlık Kaydı ve Moderasyon İncelemesi/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Pilot Destek ve Geri Bildirim/i })).toBeInTheDocument();
  });

  it('does not promise a fictional arbitration panel or unverified SLAs', () => {
    render(<HelpPage />);
    const containerText = document.body.textContent ?? '';
    expect(containerText).not.toMatch(/uzman heyeti/i);
    expect(containerText).not.toMatch(/hakem heyeti/i);
    expect(containerText).not.toMatch(/24 saat kanıt ve beyan süresi/i);
    expect(containerText).not.toMatch(/azami 48 saat içinde/i);
    expect(containerText).not.toMatch(/Kapsamı ve fiyatı baştan belli standart işler/i);
  });
});

describe('TermsPage (/kullanim-kosullari) Legal & Intermediary Alignment', () => {
  it('renders the terms page stating clear intermediary role and disclaimer', () => {
    render(<TermsPage />);
    expect(screen.getByRole('heading', { level: 1, name: /Şeffaf süreç, kayıtlı onay/i })).toBeInTheDocument();
    const containerText = document.body.textContent ?? '';
    expect(containerText).toContain('aracı hizmet sağlayıcı');
    expect(containerText).toContain('sigortacı veya finansal emanetçi değildir');
    expect(containerText).toContain('işçilik sonucunu garanti etmez');
    expect(containerText).toContain('Pilot Aşama Şerhi');
  });
});

describe('PrivacyPage (/gizlilik) KVKK & Address Privacy Alignment', () => {
  it('renders complete KVKK disclosures, exact address withholding, and media consent rules', () => {
    render(<PrivacyPage />);
    expect(screen.getByRole('heading', { level: 1, name: /kanun güvencesiyle korunur/i })).toBeInTheDocument();
    const containerText = document.body.textContent ?? '';
    expect(containerText).toContain('6698 sayılı Kişisel Verilerin Korunması Kanunu');
    expect(containerText).toContain('tam açık adresiniz ve telefon numaranız, siz bir ustanın teklifini sistem üzerinden kabul edene kadar ustalara kesinlikle gösterilmez');
    expect(containerText).toContain('Medya Yayın İzni');
    expect(containerText).toContain('İlgili Kişi Hakları (KVKK Madde 11)');
  });
});
