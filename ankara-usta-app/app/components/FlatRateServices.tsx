'use client';

import { FLAT_RATE_PACKAGES, FlatRatePackage } from '../data/flatRatePackages';
import styles from './flatRateServices.module.css';

type Props = {
  onSelectService: (serviceId: string) => void;
};

const formatPrice = (tryAmount: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(
    tryAmount
  );

function PackageIcon({ serviceId }: { serviceId: string }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  if (serviceId === 'musluk-degisimi') {
    return (
      <svg {...common} width="22" height="22">
        <path d="M8 4h6" />
        <path d="M11 4v3" />
        <path d="M3 13h5a2 2 0 0 0 2-2V7h2v4a3 3 0 0 0 3 3h1a2 2 0 0 1 2 2v2" />
        <path d="M18 20.5a1.5 1.5 0 0 0 1.5-1.5c0-.8-1.5-2-1.5-2s-1.5 1.2-1.5 2a1.5 1.5 0 0 0 1.5 1.5z" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (serviceId === 'avize-montaji') {
    return (
      <svg {...common} width="22" height="22">
        <path d="M12 2v4" />
        <path d="M12 18v4" />
        <path d="M4.93 4.93l2.83 2.83" />
        <path d="M16.24 16.24l2.83 2.83" />
        <path d="M2 12h4" />
        <path d="M18 12h4" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    );
  }

  if (serviceId === 'klozet-rezervuar') {
    return (
      <svg {...common} width="22" height="22">
        <path d="M6 3h12v6H6z" />
        <path d="M8 9v6a4 4 0 0 0 8 0V9" />
        <path d="M12 19v3" />
        <path d="M8 22h8" />
      </svg>
    );
  }

  if (serviceId === 'kornis-perde-montaji') {
    return (
      <svg {...common} width="22" height="22">
        <rect x="3" y="4" width="18" height="4" rx="1" />
        <path d="M6 8v12" />
        <path d="M18 8v12" />
        <path d="M6 14h12" />
      </svg>
    );
  }

  // tv-duvar-montaji or fallback
  return (
    <svg {...common} width="22" height="22">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M7 21h10" />
      <path d="M12 19v2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default function FlatRateServices({ onSelectService }: Props) {
  return (
    <section className={styles.container} aria-labelledby="flat-rate-heading">
      <div className={styles.headerRow}>
        <span className={styles.kicker}>SABİT FİYAT · KAPSAMI BELLİ</span>
        <h2 id="flat-rate-heading" className={styles.heading}>
          Sabit fiyatlı hizmetler
        </h2>
        <p className={styles.subheading}>
          Sürpriz maliyet yok. Ankara genelinde kapsamı, tahmini süresi ve işçilik garantisi baştan belli popüler paketler.
        </p>
      </div>

      <div className={styles.grid}>
        {FLAT_RATE_PACKAGES.map((pkg: FlatRatePackage, index: number) => {
          const isFeatured = index === 0; // First package is highlighted
          return (
            <article
              key={pkg.id}
              className={[styles.packageCard, isFeatured ? styles.packageCardFeatured : ''].filter(Boolean).join(' ')}
            >
              <div className={styles.cardTop}>
                <span className={styles.iconChip}>
                  <PackageIcon serviceId={pkg.serviceId} />
                </span>
                {pkg.badge && (
                  <span className={styles.badge}>
                    {pkg.badge}
                  </span>
                )}
              </div>

              <div className={styles.titleGroup}>
                <span className={styles.categoryTag}>{pkg.categoryName}</span>
                <h3 className={styles.cardTitle}>{pkg.title}</h3>
              </div>

              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>Tahmini işçilik</span>
                <span className={styles.priceValue}>{formatPrice(pkg.referencePriceTRY)}</span>
              </div>

              <div className={styles.metaRow}>
                <span className={styles.metaItem} title="Tahmini Süre">
                  <ClockIcon />
                  <span>Tahmini {pkg.estimatedDuration}</span>
                </span>
                <span className={styles.metaItem} title="İşçilik Garantisi">
                  <ShieldCheckIcon />
                  <span>{pkg.warrantyDays} gün garanti</span>
                </span>
              </div>

              <ul className={styles.scopeList} aria-label={`${pkg.title} kapsam maddeleri`}>
                {pkg.included.slice(0, 3).map((item, idx) => (
                  <li key={idx} className={styles.scopeIncluded}>
                    <span className={styles.checkIcon} aria-hidden="true">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={[styles.selectButton, isFeatured ? styles.selectButtonFeatured : styles.selectButtonStandard].join(' ')}
                onClick={() => onSelectService(pkg.serviceId)}
                aria-label={`${pkg.title} paketini seç`}
              >
                <span>Paketi Seç</span>
                <span className={styles.buttonArrow}>
                  <ArrowRightIcon />
                </span>
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
