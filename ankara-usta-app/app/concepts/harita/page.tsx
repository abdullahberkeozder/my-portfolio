import type { Metadata } from 'next';
import Link from 'next/link';
import UstalarSplitView from '../../ustalar/UstalarSplitView';
import { ankaraRepresentativeShops } from '../../data/ankaraMapGeo';
import { ANKARA_PILOT_SUPPORT } from '../../lib/pilotSupport';
import OrchestraLogo from '../../components/OrchestraLogo';
import OrkestraWordmark from '../../components/OrkestraWordmark';
import styles from '../../harita/harita.module.css';

export const metadata: Metadata = {
  title: 'Ankara Doğrulanmış Usta ve Atölye Haritası | Orkestra',
  description:
    '12 merkez ilçede MYK belgeli doğrulanmış ustaları ve atölyeleri haritada bulun, sabit fiyat ve acil sevk güvencesiyle doğrudan teklif alın.',
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
  const demoMetricsMap: Record<string, { totalCompletedJobs: number; averageRating: number }> = {};

  ankaraRepresentativeShops.forEach((s) => {
    demoServiceMap[s.id] = [s.category];
    demoAreaMap[s.id] = [s.district];
    demoNeighborhoodMap[s.id] = [s.neighborhood];
    demoMetricsMap[s.id] = {
      totalCompletedJobs: s.reviewCount,
      averageRating: s.rating,
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
    <main className={`account-shell ${styles.shellSplit}`}>
      <div className={`${styles.container} ${styles.containerSplit}`}>
        <header className={`${styles.header} ${styles.headerSplit}`}>
          <div className={styles.headerBrandGroup}>
            <Link className={styles.brandLockup} href="/" aria-label="Orkestra ana sayfa">
              <OrchestraLogo size={24} variant="primary" />
              <OrkestraWordmark />
            </Link>
            <div className={styles.kickerRow}>
              <span className={styles.livePulseDot} aria-hidden="true" />
              <span className={styles.kicker}>ANKARA USTA AĞI</span>
              <span className={styles.kickerBadge}>12 merkez ilçe</span>
            </div>
            <h1 className={`${styles.title} ${styles.titleCompact}`}>
              Ankara&apos;da doğru ustayı keşfedin
            </h1>
            <p className={styles.splitSubDesc}>
              Hizmeti ve ilçeyi seçin, doğrulanmış profilleri karşılaştırın.
            </p>
          </div>

          <div className={styles.headerActionsGroup}>
            <span className={styles.trustHeaderPill} title="Tüm ustalar ve talepler KVKK 6698 kapsamında güvendedir">
              <span aria-hidden="true">🛡️</span>
              <span>KVKK koruması</span>
            </span>
            <a
              href={`tel:${ANKARA_PILOT_SUPPORT.phoneTel}`}
              className={styles.headerPhonePill}
              title={`7/24 Ankara Acil Usta & Nöbetçi Sevk Hattı: ${ANKARA_PILOT_SUPPORT.phoneDisplay}`}
              aria-label={`7/24 acil usta sevk hattını ara: ${ANKARA_PILOT_SUPPORT.phoneDisplay}`}
            >
              <span aria-hidden="true">📞</span>
              <span>Acil destek</span>
            </a>
            <Link
              href="/#services"
              className={styles.headerCtaBtn}
              title="Ücretsiz Hizmet Talebi Oluştur"
            >
              <span>Talep oluştur</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </header>

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
