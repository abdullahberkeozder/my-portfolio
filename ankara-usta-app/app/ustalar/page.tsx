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
  searchParams: Promise<{ service?: string; district?: string; page?: string; view?: string }>;
}) {
  const params = await searchParams;
  const service = services.some((s) => s.id === params.service) ? params.service : undefined;
  const district = ankaraDistricts.find((d) => d === params.district);
  const page = Math.min(1000, Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1));
  const pageSize = 12;

  const pageHref = (next: number) =>
    `/ustalar?${new URLSearchParams({
      ...(service ? { service } : {}),
      ...(district ? { district } : {}),
      page: String(next),
    })}`;

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
  const profiles = (directoryRows ?? []) as PublicProfessionalRow[];
  const count = profiles[0]?.total_count ?? 0;

  if (error) {
    return (
      <main className="account-shell">
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} role="img" aria-label="Hata">⚠️</span>
          <h2 className={styles.emptyTitle}>Usta listesi yüklenemedi</h2>
          <p className={styles.emptyDesc}>Bir bağlantı sorunu oluştu. Lütfen daha sonra tekrar deneyin.</p>
          <Link className={styles.ctaBtn} href="/">
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </main>
    );
  }

  const tradespersonIds = (profiles ?? []).map((p) => p.user_id);
  const serviceMap: Record<string, string[]> = {};
  const areaMap: Record<string, string[]> = {};

  if (tradespersonIds.length > 0) {
    const [{ data: serviceRows }, { data: areaRows }] = await Promise.all([
      supabase
        .from('tradesperson_services')
        .select('tradesperson_id, service_id')
        .in('tradesperson_id', tradespersonIds),
      supabase
        .from('tradesperson_service_areas')
        .select('tradesperson_id, district')
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
      areaMap[row.tradesperson_id].push(row.district);
    }
  }

  const hasFilters = Boolean(service || district);

  return (
    <main className="account-shell ustalar-page">
      <div className={styles.container}>
        {/* Page header */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <span className={styles.kicker}>ANKARA DOĞRULANMIŞ USTA DİZİNİ</span>
            <h1 className={styles.title}>İşinize uygun ustayı haritada bulun</h1>
            <p>Hizmet ve ilçeyi seçin. Ustanın çalışma alanlarını, puanlarını ve profilindeki belge bilgilerini inceleyin.</p>
          </div>
          <Link className={styles.ctaBtn} href="/#services">
            Hizmet Talep Et →
          </Link>
        </div>

        {/* Airbnb Style Interactive Split-View (List + Map) */}
        <UstalarSplitView
          profiles={profiles}
          serviceMap={serviceMap}
          areaMap={areaMap}
          selectedService={service}
          selectedDistrict={district}
          servicesList={services}
          districtsList={ankaraDistricts}
          count={count}
          page={page}
          pageSize={pageSize}
          hasFilters={hasFilters}
          pageHref={pageHref}
        />
      </div>
    </main>
  );
}
