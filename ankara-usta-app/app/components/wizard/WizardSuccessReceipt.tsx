'use client';

import Link from 'next/link';
import {useEffect, useRef} from 'react';
import OrchestraLogo from '../OrchestraLogo';
import {requestTimingLabel} from '../../domain/requestTiming';
import styles from './wizardSuccessReceipt.module.css';

type Props = {
  requestId: string;
  serviceName: string;
  district: string;
  neighborhood: string;
  timing: string;
  targetProfessionalName?: string;
};

export default function WizardSuccessReceipt({
  requestId,
  serviceName,
  district,
  neighborhood,
  timing,
  targetProfessionalName,
}: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus({preventScroll: true});
  }, []);

  const shortId = requestId.slice(0, 8).toLocaleUpperCase('tr-TR');
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <div className={styles.stage} role="status" aria-live="polite">
      {/* 3D Kasa / Terminal Çıkış Yuvası (Cash Register Slot) */}
      <div className={styles.printerHousing} aria-hidden="true">
        <div className={styles.printerTopLip}>
          <div className={styles.printerStatus}>
            <span className={styles.statusLed} />
            <span className={styles.statusText}>SERVİS FİŞİ · ÇIKTI ALINDI</span>
          </div>
          <span className={styles.printerBrand}>ORKESTRA POS-2026</span>
        </div>
        <div className={styles.printerSlot} />
      </div>

      {/* 3D Fiziksel Termal Servis Fişi (Physical Receipt Printing Feed) */}
      <article className={styles.receipt}>
        {/* Sol ve Sağ Perfore Bilet Çentikleri */}
        <span className={styles.notchLeft} aria-hidden="true" />
        <span className={styles.notchRight} aria-hidden="true" />

        {/* Fiş Başlığı */}
        <header className={styles.receiptHeader}>
          <div className={styles.headerBrand}>
            <OrchestraLogo size={32} variant="primary" />
            <div>
              <strong>ORKESTRA</strong>
              <span>RESMİ TALEP FİŞİ</span>
            </div>
          </div>
          <div className={styles.headerMeta}>
            <span>{dateStr}</span>
            <span>{timeStr}</span>
          </div>
        </header>

        <div className={styles.dashedDivider} aria-hidden="true" />

        {/* Onay Rozeti ve Başlık */}
        <div className={styles.confirmation}>
          <span className={styles.checkRing} aria-hidden="true">✓</span>
          <div>
            <p className={styles.kicker}>Talep Alındı · Doğrulandı</p>
            <h2 ref={titleRef} tabIndex={-1} className={styles.receiptTitle}>
              Ustalara iletilmek üzere hazır
            </h2>
          </div>
        </div>

        {/* Fiş Detay Tablosu */}
        <dl className={styles.receiptDl}>
          <div>
            <dt>Hizmet</dt>
            <dd>{serviceName}</dd>
          </div>
          <div>
            <dt>Konum</dt>
            <dd>{neighborhood}, {district}</dd>
          </div>
          <div>
            <dt>Zaman</dt>
            <dd>{requestTimingLabel(timing)}</dd>
          </div>
          <div>
            <dt>Talep no</dt>
            <dd className={styles.serial}>{shortId}</dd>
          </div>
          <div>
            <dt>Ücret</dt>
            <dd className={styles.priceHighlight}>%100 Ücretsiz Teklif</dd>
          </div>
        </dl>

        {/* Resmi Damga / Mühür Filigranı */}
        <div className={styles.sealStamp} aria-hidden="true">
          <div className={styles.sealBorder}>
            <span className={styles.sealText}>ORKESTRA GÜVENCESİ</span>
            <span className={styles.sealInner}>✓ ONAYLI TALEP</span>
            <span className={styles.sealSub}>ANKARA ZANAATKAR MERKEZİ</span>
          </div>
        </div>

        {/* Barkod / Karekod Bölümü */}
        <div className={styles.barcodeSection} aria-hidden="true">
          <div className={styles.laserScanline} />
          <svg className={styles.barcodeSvg} viewBox="0 0 200 36" preserveAspectRatio="none">
            <rect x="0" y="0" width="4" height="36" fill="currentColor" />
            <rect x="8" y="0" width="2" height="36" fill="currentColor" />
            <rect x="14" y="0" width="6" height="36" fill="currentColor" />
            <rect x="24" y="0" width="3" height="36" fill="currentColor" />
            <rect x="30" y="0" width="8" height="36" fill="currentColor" />
            <rect x="42" y="0" width="2" height="36" fill="currentColor" />
            <rect x="48" y="0" width="5" height="36" fill="currentColor" />
            <rect x="56" y="0" width="3" height="36" fill="currentColor" />
            <rect x="62" y="0" width="7" height="36" fill="currentColor" />
            <rect x="72" y="0" width="4" height="36" fill="currentColor" />
            <rect x="80" y="0" width="2" height="36" fill="currentColor" />
            <rect x="86" y="0" width="6" height="36" fill="currentColor" />
            <rect x="96" y="0" width="4" height="36" fill="currentColor" />
            <rect x="104" y="0" width="8" height="36" fill="currentColor" />
            <rect x="116" y="0" width="2" height="36" fill="currentColor" />
            <rect x="122" y="0" width="5" height="36" fill="currentColor" />
            <rect x="130" y="0" width="7" height="36" fill="currentColor" />
            <rect x="140" y="0" width="3" height="36" fill="currentColor" />
            <rect x="146" y="0" width="6" height="36" fill="currentColor" />
            <rect x="156" y="0" width="2" height="36" fill="currentColor" />
            <rect x="162" y="0" width="8" height="36" fill="currentColor" />
            <rect x="174" y="0" width="4" height="36" fill="currentColor" />
            <rect x="182" y="0" width="2" height="36" fill="currentColor" />
            <rect x="188" y="0" width="5" height="36" fill="currentColor" />
            <rect x="196" y="0" width="4" height="36" fill="currentColor" />
          </svg>
          <span className={styles.barcodeSerial}>ORK-{shortId}-TR</span>
        </div>

        {/* Sonraki Adım Bilgisi */}
        <p className={styles.next}>
          {targetProfessionalName
            ? `${targetProfessionalName} talebinizi inceleyecek. Yanıt gelmezse talep başka ustalara otomatik açılmaz.`
            : 'Uygun ve doğrulanmış ustalar kapsamı inceleyecek. Teklif geldiğinde çalışma alanınız güncellenir.'}
        </p>

        {/* Eylem Butonu */}
        <Link
          className={styles.action}
          href={`/taleplerim/${requestId}/teklifler?created=1`}
          aria-label="Talebi görüntüle"
        >
          <span>Talebi görüntüle</span>
          <span className={styles.actionArrow} aria-hidden="true">→</span>
        </Link>

        {/* Tırtıklı / Zikzaklı Koparma Kenarı (Perforated Tear Edge) */}
        <div className={styles.cut} aria-hidden="true" />
      </article>
    </div>
  );
}
