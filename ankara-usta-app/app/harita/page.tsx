import type { Metadata } from 'next';
import Link from 'next/link';
import AnkaraInteractiveMap from '../components/map/AnkaraInteractiveMap';
import { ankaraDistrictsGeo } from '../data/ankaraMapGeo';
import styles from './harita.module.css';

export const metadata: Metadata = {
  title: 'Örnek Ankara Bölge Haritası | Orkestra',
  description:
    'Örnek dükkân kayıtları içeren Ankara harita gösterimi. Gerçek usta listesi için Ustalar bölümünü kullanın.',
};

export default function HaritaPage() {
  return (
    <main className="account-shell">
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.kicker}>
            BAŞKENT ZANAAT COĞRAFYASI
          </span>
          <h1 className={styles.title}>
            Örnek bölge haritası
          </h1>
          <p className={styles.desc}>
            Bu gösterimdeki dükkânlar ve sayılar örnek veridir. Gerçek usta konumu, müsaitlik veya doğrulanmış idari sınır olarak kullanılmamalıdır.
          </p>
        </header>

        <AnkaraInteractiveMap />

        <section className={styles.districtsSection} aria-labelledby="districts-heading">
          <h2 id="districts-heading" className={styles.districtsTitle}>
            Pilot İlçeler ve Hizmet Ağları
          </h2>

          <div className={styles.districtsGrid}>
            {ankaraDistrictsGeo.map(d => (
              <div key={d.id} className={styles.districtCard}>
                <div className={styles.cardHeader}>
                  <strong className={styles.cardDistrictName}>{d.name}</strong>
                  <span className={styles.cardBadge}>
                    Örnek bölge
                  </span>
                </div>

                <p className={styles.cardDesc}>
                  {d.description}
                </p>

                <div className={styles.cardNeighborhoods}>
                  <strong>Mahalleler:</strong> {d.neighborhoods.join(', ')}
                </div>

                <Link
                  href={`/ustalar?district=${encodeURIComponent(d.name)}`}
                  className={styles.cardAction}
                >
                  {d.name} Ustalarını Gör →
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
