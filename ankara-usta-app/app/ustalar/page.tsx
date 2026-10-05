import Link from 'next/link';
import { services } from '../data/serviceTaxonomy';
import { createSupabaseServerClient } from '../lib/supabase/server';
import { ankaraDistricts } from '../data/ankaraLocations';
import UstalarSplitView from './UstalarSplitView';
import styles from './directory.module.css';

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
  searchParams: Promise<{ service?: string; district?: string; page?: string; view?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const service = services.some((s) => s.id === params.service) ? params.service : undefined;
  const district = ankaraDistricts.find((d) => d === params.district);
  const page = Math.min(1000, Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1));
  const pageSize = 12;
  const sortMode = params.sort === 'rating' || params.sort === 'jobs' ? params.sort : 'recommended';

  const baseHref = `/ustalar?${new URLSearchParams({
    ...(service ? { service } : {}),
    ...(district ? { district } : {}),
    ...(params.view ? { view: params.view } : {}),
  })}`;

  const serviceMap: Record<string, string[]> = {};
  const areaMap: Record<string, string[]> = {};
  const neighborhoodMap: Record<string, string[]> = {};
  const metricsMap: Record<string, { totalCompletedJobs: number; averageRating: number }> = {};

  const supabase = await createSupabaseServerClient();
  const { data: directoryRows, error } = await supabase.rpc(
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
      <main className="account-shell ustalar-page">
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon} role="img" aria-label="Hata">⚠️</span>
            <h2 className={styles.emptyTitle}>Usta listesi yüklenemedi</h2>
            <p className={styles.emptyDesc}>Bir bağlantı sorunu oluştu. Lütfen daha sonra tekrar deneyin.</p>
            <Link className={styles.ctaBtn} href="/">
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const profiles = (directoryRows ?? []) as PublicProfessionalRow[];
  const count = profiles[0]?.total_count ?? 0;
  const hasDbError = false;

    const tradespersonIds = profiles.map((p) => p.user_id);
    if (tradespersonIds.length > 0) {
      const [{ data: serviceRows }, { data: areaRows }, { data: metricRows }] = await Promise.all([
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
        };
      }
    }

  const hasFilters = Boolean(service || district);

  const isSplit = params.view === 'split' || !params.view;

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
            <h1 className={styles.title} style={isSplit ? { fontSize: '20px', margin: '2px 0 0' } : undefined}>
              İşinize uygun ustayı haritada bulun
            </h1>
            {!isSplit && (
              <p>Hizmet ve ilçeyi seçin. Ustanın çalışma alanlarını, puanlarını ve profilindeki belge bilgilerini inceleyin.</p>
            )}
          </div>
          <Link
            className={styles.ctaBtn}
            href="/#services"
            style={isSplit ? { minHeight: '34px', height: '34px', padding: '0 14px', fontSize: '12px' } : undefined}
          >
            Hizmet Talep Et →
          </Link>
        </div>

        {/* Airbnb Style Interactive Split-View (List + Map) */}
        <UstalarSplitView
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
          baseHref={baseHref}
          hasDbError={hasDbError}
          initialView={params.view === 'map' ? 'map' : params.view === 'list' ? 'list' : 'split'}
          initialSortMode={sortMode}
        />
      </div>
    </main>
  );
}
