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

export default function FlatRateServices({ onSelectService }: Props) {
  return (
    <section className={styles.container} aria-labelledby="flat-rate-heading">
      <div className={styles.headerRow}>
        <span className={styles.kicker}>TASKRABBIT MODELİ · ŞEFFAF FİYAT GÜVENCESİ</span>
        <h2 id="flat-rate-heading" className={styles.heading}>
          Sabit Paket Hizmetler
        </h2>
        <p className={styles.subheading}>
          Sürpriz masraf yok. Dahil ve hariç kapsamı baştan belli, referans işçilik bedeli ve 60–180 gün garantili popüler paketler.
        </p>
      </div>

      <div className={styles.grid}>
        {FLAT_RATE_PACKAGES.map((pkg: FlatRatePackage) => (
          <article key={pkg.id} className={styles.packageCard}>
            <div className={styles.cardTop}>
              <span className={styles.iconBadge} role="img" aria-label={pkg.title}>
                {pkg.icon}
              </span>
              {pkg.badge && <span className={styles.badge}>{pkg.badge}</span>}
            </div>

            <div className={styles.titleGroup}>
              <span className={styles.categoryTag}>{pkg.categoryName}</span>
              <h3 className={styles.cardTitle}>{pkg.title}</h3>
            </div>

            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>Referans İşçilik:</span>
              <span className={styles.priceValue}>{formatPrice(pkg.referencePriceTRY)}</span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaItem} title="Tahmini Süre">
                ⏱ {pkg.estimatedDuration}
              </span>
              <span className={styles.metaItem} title="İşçilik Garantisi">
                🛡 {pkg.warrantyDays} gün garanti
              </span>
            </div>

            <ul className={styles.scopeList} aria-label={`${pkg.title} kapsam maddeleri`}>
              {pkg.included.slice(0, 2).map((item, idx) => (
                <li key={idx} className={styles.scopeIncluded}>
                  <span className={styles.checkIcon} aria-hidden="true">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className={styles.selectButton}
              onClick={() => onSelectService(pkg.serviceId)}
              aria-label={`${pkg.title} için hemen rezervasyon oluştur`}
            >
              Hemen Rezervasyon Yap →
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
