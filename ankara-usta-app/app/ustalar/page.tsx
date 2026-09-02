import Link from 'next/link';
import AppHeader from '../components/AppHeader';
import { services } from '../data/serviceTaxonomy';
import { createSupabaseServerClient } from '../lib/supabase/server';
import { ankaraDistricts } from '../data/ankaraLocations';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Onaylı Ustalar | Orkestra',
  description:
    'Başvurusu onaylı ustaları hizmet ve ilçeye göre keşfedin. Mesleki belge durumunu profilde inceleyin.',
};

export default async function UstalarIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; district?: string; page?: string }>;
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

  let query = supabase
    .from('tradesperson_profiles')
    .select(
      'user_id, display_name, bio, city, tradesperson_services!inner(service_id), tradesperson_service_areas!inner(district)',
      { count: 'exact' }
    )
    .eq('application_status', 'approved')
    .order('display_name', { ascending: true })
    .order('user_id', { ascending: true });
  if (service) query = query.eq('tradesperson_services.service_id', service);
  if (district) query = query.eq('tradesperson_service_areas.district', district);
  const { data: profiles, error, count } = await query.range(
    (page - 1) * pageSize,
    page * pageSize - 1
  );

  if (error) {
    return (
      <main className="account-shell">
        <AppHeader />
        <div style={{ maxWidth: '980px', margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
          <div className="empty-state" style={{ background: 'white', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)' }}>
            <span className="empty-state-icon" role="img" aria-label="Hata">⚠️</span>
            <h2>Usta listesi yüklenemedi</h2>
            <p>Bir bağlantı sorunu oluştu. Lütfen daha sonra tekrar deneyin.</p>
            <Link
              className="dialog-primary"
              href="/"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', background: 'var(--brand-cobalt)', color: 'white' }}
            >
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const tradespersonIds = (profiles ?? []).map((p) => p.user_id);
  const serviceMap: Record<string, string[]> = {};

  if (tradespersonIds.length > 0) {
    const { data: serviceRows } = await supabase
      .from('tradesperson_services')
      .select('tradesperson_id, service_id')
      .in('tradesperson_id', tradespersonIds);

    for (const row of serviceRows ?? []) {
      const name = services.find((s) => s.id === row.service_id)?.name;
      if (!name) continue;
      if (!serviceMap[row.tradesperson_id]) serviceMap[row.tradesperson_id] = [];
      serviceMap[row.tradesperson_id].push(name);
    }
  }

  const hasFilters = Boolean(service || district);

  return (
    <main className="account-shell ustalar-page">
      <AppHeader />
      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '32px 16px 80px' }}>
        {/* Page header */}
        <div className="ustalar-header">
          <div>
            <span style={{ color: 'var(--brand-cobalt)', fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>ORKESTRA AĞI</span>
            <h1 style={{ margin: '6px 0 0', fontSize: 'clamp(24px, 4vw, 36px)', letterSpacing: '-0.025em' }}>Onaylı Ustalar</h1>
          </div>
          <Link
            className="dialog-primary"
            href="/#services"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', background: 'var(--brand-cobalt)', color: 'white' }}
          >
            Hizmet Talep Et →
          </Link>
        </div>

        {/* Sticky filter bar */}
        <div className="ustalar-filter-bar">
          <form action="/ustalar" method="get" style={{ display: 'contents' }}>
            <label>
              Hizmet
              <select name="service" defaultValue={service ?? ''} className="ustalar-filter-bar-select">
                <option value="">Tüm hizmetler</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              İlçe
              <select name="district" defaultValue={district ?? ''} className="ustalar-filter-bar-select">
                <option value="">Tüm ilçeler</option>
                {ankaraDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <button className="ustalar-filter-submit" type="submit">
              Filtrele
            </button>
            {hasFilters && (
              <Link href="/ustalar" className="ustalar-filter-clear">
                Temizle
              </Link>
            )}
          </form>
          {profiles && profiles.length > 0 && (
            <span className="ustalar-result-count">
              {count ?? profiles.length} usta
            </span>
          )}
        </div>

        {/* Content */}
        {!profiles || profiles.length === 0 ? (
          <div className="empty-state" style={{ background: 'white', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)' }}>
            <span className="empty-state-icon" role="img" aria-label="Sonuç yok">🔍</span>
            <h2>Bu seçimde usta bulunamadı</h2>
            <p>
              {hasFilters
                ? 'Filtre seçimlerinizi değiştirmeyi deneyin veya tüm ustaları görmek için filtreleri temizleyin.'
                : 'Henüz onaylı usta bulunmuyor. İlk siz katılın!'}
            </p>
            {hasFilters ? (
              <Link
                href="/ustalar"
                className="dialog-primary"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', background: 'var(--brand-cobalt)', color: 'white' }}
              >
                Tüm Ustaları Göster
              </Link>
            ) : (
              <Link
                href="/usta-basvurusu"
                className="dialog-primary"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', background: 'var(--brand-cobalt)', color: 'white' }}
              >
                Usta Olarak Başvur →
              </Link>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
              {profiles.map((profile) => {
                const profileServices = serviceMap[profile.user_id] ?? [];
                const initials = profile.display_name
                  .split(' ')
                  .map((w: string) => w[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();
                return (
                  <div key={profile.user_id} className="usta-card">
                    {/* Monogram avatar */}
                    <div className="usta-monogram" aria-hidden="true">
                      {initials}
                    </div>
                    <div className="usta-card-body">
                      <span className="usta-card-badge">✓ Onaylı Usta</span>
                      <p className="usta-card-name">{profile.display_name}</p>
                      {profileServices.length > 0 && (
                        <p className="usta-card-services">
                          {profileServices.slice(0, 3).join(' · ')}
                          {profileServices.length > 3 ? ` +${profileServices.length - 3}` : ''}
                        </p>
                      )}
                      {profile.bio && (
                        <p className="usta-card-bio">{profile.bio}</p>
                      )}
                      <Link
                        href={`/ustalar/${profile.user_id}`}
                        className="usta-card-link"
                      >
                        Profili İncele →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <nav
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '32px' }}
              aria-label="Usta sayfaları"
            >
              {page > 1 && (
                <Link
                  href={pageHref(page - 1)}
                  style={{ height: '44px', padding: '0 16px', display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-control)', fontWeight: 600 }}
                >
                  ← Önceki
                </Link>
              )}
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Sayfa {page}</span>
              {page * pageSize < (count ?? 0) && (
                <Link
                  href={pageHref(page + 1)}
                  style={{ height: '44px', padding: '0 16px', display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-control)', fontWeight: 600 }}
                >
                  Sonraki →
                </Link>
              )}
            </nav>
          </>
        )}
      </div>
    </main>
  );
}
