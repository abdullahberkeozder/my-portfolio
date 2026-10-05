'use client';

import { useState } from 'react';
import {
  calculateWarrantyStatus,
  generateCertificateVerificationHash,
  parseCertificateScopeSnapshot,
} from '../domain/trust';
import { buildWhatsAppSupportUrl } from '../lib/pilotSupport';
import styles from './digitalWorkmanshipCertificate.module.css';

export interface CertificateData {
  certificate_number: string;
  issued_at: string;
  warranty_ends_at: string | null;
  scope_snapshot: Record<string, unknown>;
}

export interface DigitalWorkmanshipCertificateProps {
  certificate: CertificateData;
  jobId: string;
  role?: 'customer' | 'tradesperson' | 'admin';
}

export default function DigitalWorkmanshipCertificate({
  certificate,
  jobId,
  role = 'customer',
}: DigitalWorkmanshipCertificateProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const scope = parseCertificateScopeSnapshot(certificate.scope_snapshot);
  const warranty = calculateWarrantyStatus(certificate.issued_at, certificate.warranty_ends_at);
  const verificationHash = generateCertificateVerificationHash(certificate.certificate_number, jobId);

  const formattedIssuedDate = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'long' }).format(
    new Date(certificate.issued_at)
  );

  const formattedWarrantyDate = certificate.warranty_ends_at
    ? new Intl.DateTimeFormat('tr-TR', { dateStyle: 'long' }).format(new Date(certificate.warranty_ends_at))
    : 'Garanti süresi belirtilmedi';

  const handleCopyCode = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(verificationHash);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Clipboard fallback
    }
  };

  return (
    <article className={`certificate ${styles.certificateWrapper}`} aria-label="Dijital İşçilik Garantisi ve Saha Teslim Tutanağı">
      <div className={styles.headerRow}>
        <div className={styles.titleBlock}>
          <span className={styles.subJurisdiction}>T.C. Ankara İli Pilot Bölge Sicili</span>
          <h4 className={styles.docTitle}>DİJİTAL İŞÇİLİK GARANTİSİ VE SAHA TESLİM TUTANAĞI</h4>
          <p className={styles.docSubtitle}>
            6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Orkestra Güvenceli İş Sözleşmesi (BR-06)
          </p>
        </div>
        <div className={styles.certBadgeBlock}>
          <span className={styles.certNumber}>{certificate.certificate_number}</span>
          {warranty.status === 'active' ? (
            <span className={styles.statusPillActive} aria-label="Aktif Garanti">
              🛡️ Aktif Garanti ({warranty.remainingDays} gün kaldı)
            </span>
          ) : warranty.status === 'expired' ? (
            <span className={styles.statusPillExpired} aria-label="Süresi Doldu">
              ⚠️ Garanti Süresi Doldu
            </span>
          ) : (
            <span className={styles.statusPillUnspecified} aria-label="Standart Güvence">
              ✓ Standart Güvence
            </span>
          )}
        </div>
      </div>

      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Düzenlenme Tarihi</span>
          <strong className={styles.metaValue}>{formattedIssuedDate}</strong>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Garanti Bitiş Tarihi</span>
          <strong className={styles.metaValue}>{formattedWarrantyDate}</strong>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>İş Kayıt Kodu</span>
          <strong className={styles.metaValue}>{jobId.slice(0, 13)}…</strong>
        </div>
      </div>

      {scope.totalAmountKurus > 0 && (
        <div className={styles.financialSummary}>
          <span className={styles.financialLabel}>Güvenli Havuz (Escrow) İle Onaylanan Tutar:</span>
          <div className={styles.financialValues}>
            {scope.laborAmountKurus > 0 && (
              <span>İşçilik: ₺{(scope.laborAmountKurus / 100).toLocaleString('tr-TR')}</span>
            )}
            {scope.materialAmountKurus > 0 && (
              <span>Malzeme: ₺{(scope.materialAmountKurus / 100).toLocaleString('tr-TR')}</span>
            )}
            <strong className={styles.financialTotal}>
              Toplam: ₺{(scope.totalAmountKurus / 100).toLocaleString('tr-TR')}
            </strong>
          </div>
        </div>
      )}

      <div className={styles.trustBanners}>
        <div className={styles.trustBannerItem}>
          <span className={styles.trustBannerIcon}>✓</span>
          <span>48 Saatlik Hızlı Rework ve Kusur Giderme Teminatı</span>
        </div>
        <div className={styles.trustBannerItem}>
          <span className={styles.trustBannerIcon}>✓</span>
          <span>Ankara 9 Pilot İlçe Saha Operasyonu Doğrulaması</span>
        </div>
      </div>

      {detailsOpen && (
        <div className={styles.protocolDetails}>
          <div className={styles.sectionHeader}>Onaylanan İş ve İmalat Kapsamı</div>
          {scope.includedScope.length > 0 ? (
            <ul className={styles.scopeList}>
              {scope.includedScope.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className={styles.docSubtitle}>
              Kabul edilen iş teklifinde belirtilen tüm teknik ve montaj işçilik kalemleri garanti kapsamındadır.
            </p>
          )}

          {scope.excludedScope.length > 0 && (
            <>
              <div className={styles.sectionHeader}>Garanti Kapsamı Dışında Kalanlar</div>
              <ul className={styles.excludedList}>
                {scope.excludedScope.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </>
          )}

          <p className={styles.legalStatement}>
            İşbu teslim tutanağının düzenlenmesiyle birlikte iş bedeli müşteri onayıyla emanet havuzundan (escrow)
            ustaya aktarılmış olup; 48 saatlik koşulsuz kusur müdahalesi ve taahhüt edilen garanti süresi boyunca
            Orkestra Ankara Saha Koordinasyon Masası uyuşmazlık çözümü teminatı altındadır.
          </p>

          <div className={styles.signaturesGrid}>
            <div className={styles.signatureBox}>
              <span className={styles.signatureRole}>Müşteri Kabul Onayı</span>
              <span className={styles.signatureTimestamp}>✓ Dijital Olarak Onaylandı</span>
              <small className={styles.docSubtitle}>{formattedIssuedDate}</small>
            </div>
            <div className={styles.signatureBox}>
              <span className={styles.signatureRole}>Yetkili Usta & Saha Masası</span>
              <span className={styles.signatureTimestamp}>✓ Sicil ve Teslim Mühürlendi</span>
              <small className={styles.docSubtitle}>Ankara Pilot Koordinasyon Merkezi</small>
            </div>
          </div>
        </div>
      )}

      <div className={styles.verificationFooter}>
        <div className={styles.verificationInfo}>
          <span className={styles.metaLabel}>Doğrulama Kodu & Dijital Mühür</span>
          <span className={styles.verificationCode}>{verificationHash}</span>
          <span className={styles.verificationUrl}>https://orkestra.app/islerim/{jobId}</span>
        </div>
        <div className={styles.qrPlaceholder} title="Doğrulama Karekodu">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="4" fill="#0F172A"/>
            <rect x="5" y="5" width="12" height="12" rx="2" fill="white"/>
            <rect x="7" y="7" width="8" height="8" rx="1" fill="#0F172A"/>
            <rect x="9" y="9" width="4" height="4" fill="white"/>
            <rect x="23" y="5" width="12" height="12" rx="2" fill="white"/>
            <rect x="25" y="7" width="8" height="8" rx="1" fill="#0F172A"/>
            <rect x="27" y="9" width="4" height="4" fill="white"/>
            <rect x="5" y="23" width="12" height="12" rx="2" fill="white"/>
            <rect x="7" y="25" width="8" height="8" rx="1" fill="#0F172A"/>
            <rect x="9" y="27" width="4" height="4" fill="white"/>
            <rect x="21" y="21" width="6" height="6" fill="white"/>
            <rect x="29" y="21" width="6" height="6" fill="white"/>
            <rect x="21" y="29" width="6" height="6" fill="white"/>
            <rect x="29" y="29" width="6" height="6" fill="white"/>
          </svg>
        </div>
      </div>

      <div className={styles.certificateActions}>
        <button
          type="button"
          onClick={() => window.print()}
          className={styles.printButton}
          title="Tutanak ve Garanti Belgesini Yazdır"
        >
          🖨️ Belgeyi Yazdır
        </button>

        <button
          type="button"
          onClick={() => setDetailsOpen(!detailsOpen)}
          className={styles.detailsToggleButton}
          aria-expanded={detailsOpen}
        >
          {detailsOpen ? '▲ Tutanağı Daralt' : '▼ Saha Teslim Tutanağını Görüntüle'}
        </button>

        <button
          type="button"
          onClick={handleCopyCode}
          className={styles.copyCodeButton}
          title="Doğrulama kodunu panoya kopyala"
        >
          {copied ? '✓ Kopyalandı' : '📋 Kodu Kopyala'}
        </button>

        <a
          href={buildWhatsAppSupportUrl({
            category: 'general',
            jobId,
            customNote: `Garanti Belgesi: ${certificate.certificate_number} (#${jobId})`,
          })}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.supportLink}
          title="Ankara Saha Operasyon Masası WhatsApp Teyidi"
        >
          💬 Saha Masasından Teyit Al
        </a>
      </div>
    </article>
  );
}
