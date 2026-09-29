import Link from 'next/link';
import { services } from '../data/serviceTaxonomy';
import { createSupabaseServerClient } from '../lib/supabase/server';
import { ankaraDistricts } from '../data/ankaraLocations';
import dynamicImport from 'next/dynamic';
import { calculateTradespersonLevel } from '../domain/trust';

const AnkaraInteractiveMap = dynamicImport(() => import('../components/map/AnkaraInteractiveMap'), {
  ssr: false,
});
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
            <h1 className={styles.title}>İşinize uygun ustayı bulun</h1>
            <p>Hizmet ve ilçeyi seçin. Ustanın çalışma alanlarını ve profilindeki belge bilgilerini inceleyin.</p>
          </div>
          <Link className={styles.ctaBtn} href="/#services">
            Hizmet Talep Et →
          </Link>
        </div>

        {/* View Mode Switcher */}
        <div className={styles.viewModeRow}>
          <div className={styles.viewModeToggle} role="group" aria-label="Görünüm seçimi">
            <a
              href={`/ustalar?${new URLSearchParams({ ...(service ? { service } : {}), ...(district ? { district } : {}), view: 'list' })}`}
              className={`${styles.viewToggleBtn} ${params.view !== 'map' ? styles.viewToggleBtnActive : ''}`}
            >
              <span>📋</span>
              <span>Liste Görünümü</span>
            </a>
            <a
              href={`/ustalar?${new URLSearchParams({ ...(service ? { service } : {}), ...(district ? { district } : {}), view: 'map' })}`}
              className={`${styles.viewToggleBtn} ${params.view === 'map' ? styles.viewToggleBtnActive : ''}`}
            >
              <span>📍</span>
              <span>Bölge Dağılımı</span>
            </a>
          </div>
          {params.view === 'map' && (
            <span className={styles.mapDensityHint}>
              💡 Harita üzerinden pilot ilçe yoğunluğunu inceleyebilirsiniz
            </span>
          )}
        </div>

        {params.view === 'map' && (
          <section className={styles.mapContainerSection}>
            <AnkaraInteractiveMap initialDistrict={district} />
          </section>
        )}
          <>
            {/* Filter bar */}
            <div className={styles.filterBar}>
              <form key={`${service}-${district}`} action="/ustalar" method="get" className={styles.filterForm} aria-label="Usta filtreleri">
                <label className={styles.filterGroup}>
                  <span className={styles.filterLabel}>Hizmet</span>
                  <select name="service" defaultValue={service ?? ''} className={styles.select}>
                    <option value="">Tüm hizmetler</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.filterGroup}>
                  <span className={styles.filterLabel}>İlçe</span>
                  <select name="district" defaultValue={district ?? ''} className={styles.select}>
                    <option value="">Tüm ilçeler</option>
                    {ankaraDistricts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
                <button className={styles.filterSubmit} type="submit">
                  Ustaları göster
                </button>
                {hasFilters && (
                  // Vinext client navigation can leave the server-rendered filter state unchanged.
                  // eslint-disable-next-line @next/next/no-html-link-for-pages
                  <a href="/ustalar" className={styles.filterClear}>
                    Temizle
                  </a>
                )}
              </form>
              {profiles && profiles.length > 0 && (
                <span className={styles.resultCount}>
                  {count} usta
                </span>
              )}
            </div>
            {/* Content List */}
            {!profiles || profiles.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon} role="img" aria-label="Rehber">🛠️</span>
                <h2 className={styles.emptyTitle}>Bu kriterlere uygun doğrulanmış usta bulunamadı</h2>
                <p className={styles.emptyDesc}>
                  {hasFilters
                    ? 'Filtre tercihlerinizi genişletmeyi deneyebilir veya tüm ustaları görmek için filtreleri temizleyebilirsiniz.'
                    : 'Henüz listelenen usta bulunmuyor. Hizmetleri inceleyebilirsiniz; şu anda teklif geleceği garantisi veremiyoruz.'}
                </p>
                <div className={styles.emptyActions}>
                  {hasFilters ? (
                    // This recovery action must clear query state with a document navigation.
                    // eslint-disable-next-line @next/next/no-html-link-for-pages
                    <a href="/ustalar" className={styles.ctaBtn}>
                      Filtreleri Temizle
                    </a>
                  ) : (
                    <>
                      <Link href="/#services" className={styles.ctaBtn}>
                        Hizmet Talebi Oluştur →
                      </Link>
                      <Link href="/usta-basvurusu" className={styles.filterClear}>
                        Usta Olarak Katıl
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className={styles.grid}>
                  {profiles.map((profile) => {
                    const profileServices = serviceMap[profile.user_id] ?? [];
                    const initials = profile.display_name
                      .split(' ')
                      .map((w: string) => w[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();
                    const tier = calculateTradespersonLevel(10, 4.9);
                    return (
                      <div key={profile.user_id} className="usta-card">
                        <div className="usta-monogram" aria-hidden="true">
                          {initials}
                        </div>
                        <div className="usta-card-body">
                          <div className={styles.badgeRow}>
                            <span className="usta-card-badge">Mesleki belge güncel</span>
                            <span className={styles.tierBadge}>{tier.badge} {tier.title}</span>
                          </div>
                          <h2 className="usta-card-name">{profile.display_name}</h2>
                          {profileServices.length > 0 && (
                            <p className="usta-card-services">
                              {profileServices.slice(0, 3).join(' · ')}
                              {profileServices.length > 3 ? ` +${profileServices.length - 3}` : ''}
                            </p>
                          )}
                          <p className={styles.areaLabel}>Hizmet bölgesi: {[...new Set(areaMap[profile.user_id] ?? [])].join(', ') || 'Profilde inceleyin'}</p>
                          <small className={styles.evidenceHint}>Başvuru ve güncel mesleki belge kontrolü tamamlandı.</small>
                          {profile.bio && (
                            <p className="usta-card-bio">{profile.bio}</p>
                          )}
                          <a
                            href={`/ustalar/${profile.user_id}?${new URLSearchParams({...(service ? {service} : {}), ...(district ? {district} : {})})}`}
                            className="usta-card-link"
                          >
                            Profili İncele →
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                <nav className={styles.pagination} aria-label="Usta sayfaları">
                  {page > 1 && (
                    <Link href={pageHref(page - 1)} className={styles.pageBtn}>
                      ← Önceki
                    </Link>
                  )}
                  <span className={styles.pageInfo}>Sayfa {page}</span>
                  {page * pageSize < count && (
                    <Link href={pageHref(page + 1)} className={styles.pageBtn}>
                      Sonraki →
                    </Link>
                  )}
                </nav>
              </>
            )}
          </>
      </div>
    </main>
  );
}
