import type { Metadata } from 'next';
import Link from 'next/link';
import AnkaraInteractiveMap from '../../components/map/AnkaraInteractiveMap';
import { ankaraDistrictsGeo } from '../../data/ankaraMapGeo';
import styles from '../../harita/harita.module.css';

export const metadata: Metadata = {
  title: 'Harita Konsepti | Orkestra',
  description: 'Ürün akışına bağlı olmayan, yalnız tasarım değerlendirmesi için hazırlanmış temsili Ankara harita konsepti.',
  robots: { index: false, follow: false },
};

export default function MapConceptPage() {
  return (
    <main className="account-shell">
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.kicker}>TASARIM KONSEPTİ</span>
          <h1 className={styles.title}>Temsili Ankara haritası</h1>
          <p className={styles.desc}>
            Bu sayfadaki noktalar gerçek işletme, usta, doğrulama, puan veya müsaitlik verisi değildir. Talep oluşturmaz ve ürünün usta dizinine bağlı değildir.
          </p>
          <Link href="/ustalar">Gerçek usta dizinine dön</Link>
        </header>

        <AnkaraInteractiveMap />

        <section className={styles.districtsSection} aria-labelledby="districts-heading">
          <h2 id="districts-heading" className={styles.districtsTitle}>Temsili pilot bölge görünümü</h2>
          <div className={styles.districtsGrid}>
            {ankaraDistrictsGeo.map(district => (
              <div key={district.id} className={styles.districtCard}>
                <div className={styles.cardHeader}>
                  <strong className={styles.cardDistrictName}>{district.name}</strong>
                  <span className={styles.cardBadge}>Temsili</span>
                </div>
                <p className={styles.cardDesc}>{district.description}</p>
                <div className={styles.cardNeighborhoods}>
                  <strong>Örnek mahalleler:</strong> {district.neighborhoods.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
