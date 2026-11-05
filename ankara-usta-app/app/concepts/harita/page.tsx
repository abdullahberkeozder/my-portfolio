import type { Metadata } from 'next';
import Link from 'next/link';
import UstalarSplitView from '../../ustalar/UstalarSplitView';
import { ankaraRepresentativeShops } from '../../data/ankaraMapGeo';
import OrchestraLogo from '../../components/OrchestraLogo';
import OrkestraWordmark from '../../components/OrkestraWordmark';
import styles from './discoveryShell.module.css';

export const metadata: Metadata = {
  title: 'Ankara’da usta keşfi — Tasarım çalışması | Orkestra',
  description:
    'Hizmet ve bölgeye göre liste ve harita üzerinden usta keşfi için tasarım çalışması.',
  robots: { index: false, follow: false },
};

export default async function MapConceptPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: 'split' | 'list' | 'map'; district?: string; service?: string; sort?: string }>;
}) {
  const params = await searchParams;

  const cleanOwnerRegex = /\s*\([^)]*\)/g;
  const demoProfiles = ankaraRepresentativeShops.map((s) => {
    const cleanOwner = s.ownerName.replace(cleanOwnerRegex, '').trim();
    return {
      user_id: s.id,
      display_name: `${cleanOwner} · ${s.name}`,
      bio: `${s.name} — ${s.district} / ${s.neighborhood}. ${s.category} uzmanı. ${s.address}`,
      city: 'Ankara',
      total_count: ankaraRepresentativeShops.length,
    };
  });

  const demoServiceMap: Record<string, string[]> = {};
  const demoAreaMap: Record<string, string[]> = {};
  const demoNeighborhoodMap: Record<string, string[]> = {};
  const demoMetricsMap: Record<string, { totalCompletedJobs: number; averageRating: number; totalReviews: number }> = {};

  ankaraRepresentativeShops.forEach((s) => {
    demoServiceMap[s.id] = [s.category];
    demoAreaMap[s.id] = [s.district];
    demoNeighborhoodMap[s.id] = [s.neighborhood];
    demoMetricsMap[s.id] = {
      totalCompletedJobs: s.reviewCount,
      averageRating: s.rating,
      totalReviews: s.reviewCount,
    };
  });

  const demoServicesList = [
    { id: 'plumbing', name: 'Sıhhi Tesisat' },
    { id: 'electric', name: 'Elektrik' },
    { id: 'carpentry', name: 'Mobilya & Ahşap' },
    { id: 'paint', name: 'Boya & Badana' },
    { id: 'repair', name: 'Mekanik Montaj' },
  ];

  const demoDistrictsList = ['Çankaya', 'Yenimahalle', 'Keçiören', 'Altındağ', 'Etimesgut', 'Mamak'];

  const initialView = params.view === 'map' ? 'map' : params.view === 'list' ? 'list' : 'split';
  const initialSortMode = params.sort === 'rating' || params.sort === 'jobs' ? params.sort : 'recommended';

  return (
    <main className={styles.shell}>
        <header className={styles.navigation}>
            <Link className={styles.brand} href="/" aria-label="Orkestra ana sayfa">
              <OrchestraLogo size={24} variant="primary" />
              <OrkestraWordmark />
            </Link>
            <nav aria-label="Keşif bağlantıları">
              <Link href="/yardim">Yardım</Link>
              <Link href="/#services">İhtiyacını anlat</Link>
            </nav>
        </header>
        <div className={styles.intro}>
          <div className={styles.introHeader}>
            <div>
              <span className={styles.kicker}>ANKARA HARİTA VE KEŞİF ÇALIŞMASI</span>
              <h1>Ankara’da işinize uygun ustayı bulun</h1>
              <p>Hizmet ve bölge seçin. Temsili atölyeleri liste ve harita üzerinde inceleyin.</p>
            </div>
            <Link className={styles.liveBridgeBtn} href="/ustalar?view=split&sort=recommended">
              Canlı Usta Dizini →
            </Link>
          </div>
        </div>
      <div className={styles.content}>
        <UstalarSplitView
          profiles={demoProfiles}
          serviceMap={demoServiceMap}
          areaMap={demoAreaMap}
          neighborhoodMap={demoNeighborhoodMap}
          metricsMap={demoMetricsMap}
          servicesList={demoServicesList}
          districtsList={demoDistrictsList}
          count={demoProfiles.length}
          page={1}
          pageSize={12}
          hasFilters={Boolean(params.service || params.district)}
          selectedService={params.service}
          selectedDistrict={params.district}
          baseHref="/concepts/harita"
          initialView={initialView}
          initialSortMode={initialSortMode}
          profileHrefBase="/concepts/harita/usta"
        />
      </div>
    </main>
  );
}
