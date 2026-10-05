'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import OrchestraLogo from './OrchestraLogo';
import OrkestraWordmark from './OrkestraWordmark';
import WhatsAppSupportPill from './WhatsAppSupportPill';
import { navigationContext } from '../lib/navigationModel';

export default function AppFooter() {
  const pathname = usePathname();

  if (navigationContext(pathname) !== 'public' && pathname !== '/usta-basvurusu') return null;

  return (
    <>
      <footer className="tr-footer" role="contentinfo" aria-label="Site alt bilgisi">
        <div className="footer-inner">
          <div className="footer-brand-col">
            <div className="footer-brand-header">
              <OrchestraLogo size={32} variant="inverse" />
              <OrkestraWordmark inverse />
            </div>
            <p className="footer-brand-desc">
              Ankara’nın 9 pilot ilçesinde ev işi talebi oluşturma, teklif karşılaştırma ve iş takibi.
            </p>

          </div>

          <div className="footer-nav-col">
            <span className="footer-col-title">HİZMET VE KAPSAM</span>
            <ul className="footer-links-list">
              <li><Link href="/#services">Hizmet kategorileri</Link></li>
              <li><Link href="/ustalar">Doğrulanmış Usta Dizini</Link></li>
              <li><Link href="/harita">Ankara Usta Haritası</Link></li>
              <li><Link href="/nasil-calisir">Nasıl Çalışır?</Link></li>
              <li><Link href="/taleplerim">Taleplerim</Link></li>
              <li><Link href="/islerim">İşlerim</Link></li>
              <li><Link href="/giris">Kullanıcı Girişi</Link></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <span className="footer-col-title">USTALAR İÇİN</span>
            <ul className="footer-links-list">
              <li><Link href="/usta-basvurusu">Orkestraya Katıl (Usta Başvurusu)</Link></li>
              <li><Link href="/usta/giris">Usta Girişi</Link></li>
              <li><Link href="/nasil-calisir#dogrulama">Belge Doğrulama Süreci</Link></li>
              <li><Link href="/usta/talepler">Bölgesel İş Talepleri</Link></li>
              <li><Link href="/usta/musaitlik">Müsaitlik Takvimi</Link></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <span className="footer-col-title">YARDIM VE BİLGİ</span>
            <ul className="footer-links-list">
              <li><Link href="/yardim">Yardım ve Çözüm Merkezi</Link></li>
              <li>
                <a
                  href="https://wa.me/903128000606"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ankara Pilot Saha Koordinasyon WhatsApp Hattı"
                >
                  💬 WhatsApp Saha Destek
                </a>
              </li>
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

      {/* FAZ 6.3: Thumb-Zone Floating Support Capsule & Menu */}
      <WhatsAppSupportPill />
    </>
  );
}
