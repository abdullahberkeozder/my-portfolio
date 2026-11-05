import Link from 'next/link';
import { services } from '../data/serviceTaxonomy';
import { createSupabaseServerClient } from '../lib/supabase/server';
import { ankaraDistricts } from '../data/ankaraLocations';
import UstalarSplitView from './UstalarSplitView';
import styles from './directory.module.css';
import { discoveryHref, parseDiscoveryParams } from '../lib/discoveryContract';
import { getPilotCoverage } from '../data/pilotCoverage';
import { parseDirectoryVisualFixture, resolveDirectoryAvailability } from '../lib/directoryAvailability';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Doğrulanmış Ustalar | Orkestra',
  description:
    'Başvurusu onaylı ve mesleki belgesi güncel ustaları hizmet ve ilçeye göre keşfedin.',
};

type PublicProfessionalRow = {
  user_id: string;
  display_name: string;
  bio: string | null;
  city: string | null;
  total_count: number;
};

export default async function UstalarIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; district?: string; page?: string; view?: string; sort?: string; fixture?: string }>;
}) {
  const params = await searchParams;
  const visualFixture = parseDirectoryVisualFixture(
    params.fixture,
    process.env.ORKESTRA_DIRECTORY_VISUAL_FIXTURES === 'true' || process.env.NODE_ENV !== 'production'
  );
  const discovery = parseDiscoveryParams(params, {
    serviceIds: services.map((service) => service.id),
    districts: ankaraDistricts,
  });
  const service = discovery.service;
  const district = discovery.district;
  const page = discovery.page;
  const pageSize = 12;
  const sortMode = discovery.sort;
  const baseHref = discoveryHref(discovery);

  const serviceMap: Record<string, string[]> = {};
  const areaMap: Record<string, string[]> = {};
  const neighborhoodMap: Record<string, string[]> = {};
  const metricsMap: Record<string, { totalCompletedJobs: number; averageRating: number; totalReviews: number }> = {};

  const supabase = await createSupabaseServerClient();
  // Visual fixtures intentionally bypass the network contract. This keeps
  // deterministic QA states usable even when a local Supabase project does
  // not have the staging RPC installed yet.
  const { data: directoryRows, error } = visualFixture
    ? { data: [], error: null }
    : await supabase.rpc(
        'list_public_verified_professionals',
        {
          p_service_id: service ?? null,
          p_district: district ?? null,
          p_offset: (page - 1) * pageSize,
          p_limit: pageSize,
        }
      );

  if (error) {
    return (
      <main
        className="account-shell ustalar-page"
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100dvh',
          background: 'var(--surface-page, #faf8f5)',
          padding: '48px 16px',
        }}
      >
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon} role="img" aria-label="Hata">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--action-primary, #0E6F47)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
            <h2 className={styles.emptyTitle}>Usta listesi yüklenemedi</h2>
            <p className={styles.emptyDesc}>Bir bağlantı sorunu oluştu. Lütfen daha sonra tekrar deneyin.</p>
            <div className={styles.emptyActions}>
              <Link className={styles.ctaBtn} href={baseHref}>
                Tekrar dene
              </Link>
              <Link className={styles.secondaryBtn} href="/">
                Ana sayfaya dön
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const profiles = visualFixture ? [] : (directoryRows ?? []) as PublicProfessionalRow[];
  const count = visualFixture ? 0 : Number(profiles[0]?.total_count ?? profiles.length);
  const hasDbError = false;
  const hasFilters = Boolean(service || district);
  let hasGlobalSupply: boolean | undefined = hasFilters ? undefined : count > 0;

  // A filtered empty result is not enough evidence to say that the platform
  // has no supply. Check one unfiltered row before choosing between the
  // limited-scope and true cold-start messages. A fallback error stays
  // neutral; it must never be presented as a waitlist state.
  if (count === 0 && hasFilters && !visualFixture) {
    const { data: globalRows, error: globalError } = await supabase.rpc(
      'list_public_verified_professionals',
      {
        p_service_id: null,
        p_district: null,
        p_offset: 0,
        p_limit: 1,
      }
    );
    if (!globalError) {
      const rows = (globalRows ?? []) as PublicProfessionalRow[];
      const globalCount = Number(rows[0]?.total_count ?? rows.length);
      hasGlobalSupply = globalCount > 0;
    }
  }

  const availability = visualFixture ?? resolveDirectoryAvailability({
    filteredCount: count,
    hasGlobalSupply,
    hasFilters,
    pilotScope: !district || getPilotCoverage(district, service).tier !== 'unsupported',
  });

  const tradespersonIds = profiles.map((p) => p.user_id);
  if (tradespersonIds.length > 0) {
      const [{ data: serviceRows }, { data: areaRows }, { data: metricRows }, { data: reviewRows }] = await Promise.all([
        supabase
          .from('tradesperson_services')
          .select('tradesperson_id, service_id')
          .in('tradesperson_id', tradespersonIds),
        supabase
          .from('tradesperson_service_areas')
          .select('tradesperson_id, district, neighborhood')
          .in('tradesperson_id', tradespersonIds),
        supabase
          .from('district_trust_metrics')
          .select('tradesperson_id, district, completed_jobs, average_rating')
          .in('tradesperson_id', tradespersonIds),
        supabase
          .from('reviews')
          .select('tradesperson_id')
          .eq('moderation_status', 'approved')
          .in('tradesperson_id', tradespersonIds),
      ]);

      for (const row of serviceRows ?? []) {
        const name = services.find((s) => s.id === row.service_id)?.name;
        if (!name) continue;
        if (!serviceMap[row.tradesperson_id]) serviceMap[row.tradesperson_id] = [];
        serviceMap[row.tradesperson_id].push(name);
      }
      for (const row of areaRows ?? []) {
        if (!areaMap[row.tradesperson_id]) areaMap[row.tradesperson_id] = [];
        if (row.district && !areaMap[row.tradesperson_id].includes(row.district)) {
          areaMap[row.tradesperson_id].push(row.district);
        }
        if (row.neighborhood) {
          if (!neighborhoodMap[row.tradesperson_id]) neighborhoodMap[row.tradesperson_id] = [];
          if (!neighborhoodMap[row.tradesperson_id].includes(row.neighborhood)) {
            neighborhoodMap[row.tradesperson_id].push(row.neighborhood);
          }
        }
      }
      const metricAccumulator: Record<string, { totalJobs: number; weightedRatingSum: number }> = {};
      for (const row of metricRows ?? []) {
        const id = row.tradesperson_id;
        if (!id) continue;
        const jobs = Number(row.completed_jobs) || 0;
        const rating = Number(row.average_rating) || 0;
        if (!metricAccumulator[id]) {
          metricAccumulator[id] = { totalJobs: 0, weightedRatingSum: 0 };
        }
        metricAccumulator[id].totalJobs += jobs;
        metricAccumulator[id].weightedRatingSum += rating * jobs;
      }
      for (const [id, acc] of Object.entries(metricAccumulator)) {
        metricsMap[id] = {
          totalCompletedJobs: acc.totalJobs,
          averageRating: acc.totalJobs > 0 ? Number((acc.weightedRatingSum / acc.totalJobs).toFixed(1)) : 0,
          totalReviews: 0,
        };
      }
      for (const row of reviewRows ?? []) {
        const id = row.tradesperson_id;
        if (!id) continue;
        if (!metricsMap[id]) metricsMap[id] = { totalCompletedJobs: 0, averageRating: 0, totalReviews: 0 };
        metricsMap[id].totalReviews += 1;
      }
    }

  const isSplit = discovery.view === 'split';

  return (
    <main
      className={isSplit ? 'ustalar-page ustalar-split-shell' : 'account-shell ustalar-page'}
      style={isSplit ? {
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        maxHeight: '100dvh',
        overflow: 'hidden',
        padding: '0',
        margin: '0',
        background: 'var(--surface-page, #f8fafc)',
      } : undefined}
    >
      <div
        className={`${styles.container} ${isSplit ? styles.containerSplit : ''}`}
        style={isSplit ? {
          flex: '1 1 0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0,
          height: '100%',
        } : undefined}
      >
        {/* Page header */}
        <div className={`${styles.header} ${isSplit ? styles.headerSplit : ''}`}>
          <div className={styles.headerText}>
            <span className={styles.kicker}>ANKARA DOĞRULANMIŞ USTA DİZİNİ</span>
            <h1 className={`${styles.title} ${isSplit ? styles.titleSplit : ''}`}>
              İhtiyacınıza uygun ustayı bulun
            </h1>
            <p className={isSplit ? styles.headerSummary : undefined}>
              {isSplit
                ? 'Önce hizmet ve ilçeyi seçin; doğrulanmış profilleri karşılaştırın.'
                : 'Hizmet ve ilçeyi seçin. Ustanın çalışma alanlarını, puanlarını ve profilindeki belge bilgilerini inceleyin.'}
            </p>
          </div>
          <Link
            className={`${styles.ctaBtn} ${isSplit ? styles.ctaBtnSplit : ''}`}
            href="/#services"
          >
            İhtiyacını anlat →
          </Link>
        </div>

        {/* Airbnb Style Interactive Split-View (List + Map) */}
        <UstalarSplitView
          verificationConfirmed
          profiles={profiles}
          serviceMap={serviceMap}
          areaMap={areaMap}
          neighborhoodMap={neighborhoodMap}
          metricsMap={metricsMap}
          selectedService={service}
          selectedDistrict={district}
          servicesList={services}
          districtsList={ankaraDistricts}
          count={count}
          page={page}
          pageSize={pageSize}
          hasFilters={hasFilters}
          availability={availability}
          baseHref={baseHref}
          hasDbError={hasDbError}
          initialView={discovery.view}
          initialSortMode={sortMode}
        />
      </div>
    </main>
  );
}
