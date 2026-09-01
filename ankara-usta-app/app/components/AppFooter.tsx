'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import OrchestraLogo from './OrchestraLogo';

export default function AppFooter() {
  const pathname = usePathname();

  // Do not render marketing footer on operational workspaces and admin pages
  if (
    pathname.startsWith('/yonetim') ||
    pathname.startsWith('/islerim') ||
    pathname.startsWith('/taleplerim') ||
    pathname.startsWith('/uyusmazliklar') ||
    pathname.startsWith('/usta/') ||
    pathname === '/hesap'
  ) {
    return null;
  }

  return (
    <>
      <footer className="tr-footer" role="contentinfo" aria-label="Site alt bilgisi">
        <div className="footer-inner">
          <div className="footer-brand-col">
            <div className="footer-brand-header">
              <OrchestraLogo size={32} variant="pistachio" />
              <strong className="footer-brand-name">Orkestra</strong>
            </div>
            <p className="footer-brand-desc">
              Ankara’nın 9 pilot ilçesinde ev işi talebi oluşturma, teklif karşılaştırma ve iş takibi.
            </p>

            <div className="footer-status-pill">
              <span className="footer-status-dot" />
              <span>Orkestra Hizmet Ağı Aktif</span>
            </div>
          </div>

          <div className="footer-nav-col">
            <span className="footer-col-title">HİZMET VE KAPSAM</span>
            <ul className="footer-links-list">
              <li><Link href="/#services">Tüm Hizmet Dizini (01–26)</Link></li>
              <li><Link href="/nasil-calisir">Nasıl Çalışır?</Link></li>
              <li><Link href="/taleplerim">Taleplerim & Fişlerim</Link></li>
              <li><Link href="/islerim">Devam Eden İşlerim</Link></li>
              <li><Link href="/giris">Kullanıcı Girişi</Link></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <span className="footer-col-title">USTALAR İÇİN</span>
            <ul className="footer-links-list">
              <li><Link href="/usta-basvurusu">Orkestraya Katıl (Usta Başvurusu)</Link></li>
              <li><Link href="/nasil-calisir#dogrulama">Belge Doğrulama Süreci</Link></li>
              <li><Link href="/usta/talepler">Bölgesel İş Talepleri</Link></li>
              <li><Link href="/usta/musaitlik">Müsaitlik Takvimi</Link></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <span className="footer-col-title">GÜVENCE VE DESTEK</span>
            <ul className="footer-links-list">
              <li><Link href="/yardim">Yardım ve Çözüm Merkezi</Link></li>
              <li><Link href="/gizlilik">Gizlilik ve KVKK Politikası</Link></li>
              <li><Link href="/kullanim-kosullari">Kullanım Koşulları</Link></li>
              <li><span className="footer-badge-note">Mesleki belge kontrolü tamamlanmadan rozet verilmez</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-row">
          <div className="footer-bottom-inner">
            <span className="footer-copyright">
              © {new Date().getFullYear()} Orkestra. Tüm hakları saklıdır.
            </span>
            <div className="footer-legal-links">
              <span>Başkent Zanaat Ekosistemi</span>
              <span className="footer-bullet-sep">·</span>
              <span>9 Pilot İlçe</span>
            </div>
          </div>
        </div>
      </footer>


      <Link className="help-float" href="/yardim" aria-label="Yardım Merkezi">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span>Yardım</span>
      </Link>
    </>
  );
}
