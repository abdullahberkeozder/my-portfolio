'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import TaskrabbitBrandLogo from './TaskrabbitBrandLogo';
import WhatsAppSupportPill from './WhatsAppSupportPill';
import { navigationContext } from '../lib/navigationModel';
import { canonicalRoute } from '../lib/routeManifest';

export default function AppFooter() {
  const pathname = usePathname();

  if (navigationContext(pathname) !== 'public' && pathname !== '/usta-basvurusu') return null;

  // The landing page is a social discovery surface. A compact footer keeps
  // the feed's final action visible instead of turning the first visit into a
  // directory of links. Full operational/legal navigation remains unchanged
  // on every other public route.
  if (pathname === '/') {
    return (
      <footer className="tr-footer tr-footer-landing" role="contentinfo" aria-label="Site alt bilgisi">
        <div className="footer-landing-inner">
          <Link href={canonicalRoute('/')} aria-label="Orkestra ana sayfa">
            <TaskrabbitBrandLogo size={27} textColor="#18241f" markColor="#0e6f47" />
          </Link>
          <nav aria-label="Alt navigasyon">
            <Link href={canonicalRoute('/yardim')}>Yardım</Link>
            <Link href={canonicalRoute('/gizlilik')}>Gizlilik</Link>
            <Link href={canonicalRoute('/kullanim-kosullari')}>Kullanım koşulları</Link>
          </nav>
        </div>
      </footer>
    );
  }

  return (
    <>
      <footer className="tr-footer" role="contentinfo" aria-label="Site alt bilgisi">
        <div className="footer-inner">
          <div className="footer-brand-col">
            <div className="footer-brand-header">
              <TaskrabbitBrandLogo inverse size={32} />
            </div>
            <p className="footer-brand-desc">
              Ankara’nın 9 pilot ilçesinde ev işi talebi oluşturma, teklif karşılaştırma ve iş takibi.
            </p>

          </div>

          <div className="footer-nav-col">
            <span className="footer-col-title">HİZMET VE KAPSAM</span>
            <ul className="footer-links-list">
              <li><Link href={`${canonicalRoute('/')}#services`}>Hizmet kategorileri</Link></li>
              <li><Link href={canonicalRoute('/ustalar')}>Doğrulanmış Usta Dizini</Link></li>
              <li><Link href={canonicalRoute('/harita')}>Ankara Usta Haritası</Link></li>
              <li><Link href={canonicalRoute('/nasil-calisir')}>Nasıl Çalışır?</Link></li>
              <li><Link href={canonicalRoute('/taleplerim')}>Taleplerim</Link></li>
              <li><Link href={canonicalRoute('/islerim')}>İşlerim</Link></li>
              <li><Link href={canonicalRoute('/giris')}>Kullanıcı Girişi</Link></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <span className="footer-col-title">USTALAR İÇİN</span>
            <ul className="footer-links-list">
              <li><Link href={canonicalRoute('/usta-basvurusu')}>Orkestraya Katıl (Usta Başvurusu)</Link></li>
              <li><Link href={canonicalRoute('/usta/giris')}>Usta Girişi</Link></li>
              <li><Link href={`${canonicalRoute('/nasil-calisir')}#dogrulama`}>Belge Doğrulama Süreci</Link></li>
              <li><Link href={canonicalRoute('/usta/talepler')}>Bölgesel İş Talepleri</Link></li>
              <li><Link href={canonicalRoute('/usta/musaitlik')}>Müsaitlik Takvimi</Link></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <span className="footer-col-title">YARDIM VE BİLGİ</span>
            <ul className="footer-links-list">
              <li><Link href={canonicalRoute('/yardim')}>Yardım ve Çözüm Merkezi</Link></li>
              <li>
                <a
                  href="https://wa.me/903128000606"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ankara Pilot Saha Koordinasyon WhatsApp Hattı"
                >
                  WhatsApp Saha Destek
                </a>
              </li>
              <li><Link href={canonicalRoute('/gizlilik')}>Gizlilik ve KVKK Politikası</Link></li>
              <li><Link href={canonicalRoute('/kullanim-kosullari')}>Kullanım Koşulları</Link></li>
              <li><span className="footer-badge-note">Mesleki belge kontrolü tamamlanmadan rozet verilmez</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-row">
          <div className="footer-districts-bar" aria-label="Ankara pilot hizmet bölgeleri">
            <span className="footer-districts-title">Hizmet Bölgeleri:</span>
            <div className="footer-districts-list">
              <span>Çankaya</span>
              <span className="footer-bullet-sep">·</span>
              <span>Yenimahalle</span>
              <span className="footer-bullet-sep">·</span>
              <span>Keçiören</span>
              <span className="footer-bullet-sep">·</span>
              <span>Mamak</span>
              <span className="footer-bullet-sep">·</span>
              <span>Altındağ</span>
              <span className="footer-bullet-sep">·</span>
              <span>Etimesgut</span>
              <span className="footer-bullet-sep">·</span>
              <span>Sincan</span>
              <span className="footer-bullet-sep">·</span>
              <span>Gölbaşı</span>
              <span className="footer-bullet-sep">·</span>
              <span>Pursaklar</span>
            </div>
          </div>
          <div className="footer-bottom-inner">
            <span className="footer-copyright">
              © {new Date().getFullYear()} Orkestra. Tüm hakları saklıdır.
            </span>
            <div className="footer-legal-links">
              <span>Başkent Zanaat Ekosistemi</span>
              <span className="footer-bullet-sep">·</span>
              <span>Ahilik Güvencesi</span>
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
