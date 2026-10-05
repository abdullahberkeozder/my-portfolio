import Link from 'next/link';
import { notFound } from 'next/navigation';
import { services } from '../../data/serviceTaxonomy';
import { createSupabaseServerClient } from '../../lib/supabase/server';
import { directedRequestsEnabled } from '../../lib/directedRequests';
import styles from '../directory.module.css';
import profileStyles from './profile.module.css';
import BeforeAfterSlider from '../../components/BeforeAfterSlider';
import { RatingStars } from '../../components/ui';
import { calculateTradespersonLevel } from '../../domain/trust';
import UstaServiceAreaMapClient from '../../components/map/UstaServiceAreaMapClient';

export const dynamic = 'force-dynamic';

export default async function PublicTradespersonPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ service?: string; district?: string }>;
}) {
  const { id } = await params;
  const filters = await searchParams ?? {};
  const selectedService = services.find(service => service.id === filters.service)?.id;
  const backQuery = new URLSearchParams({
    ...(selectedService ? { service: selectedService } : {}),
    ...(filters.district ? { district: filters.district } : {}),
  });
  const supabase = await createSupabaseServerClient();

  const [
    profileResult,
    servicesResult,
    areasResult,
    reviewsResult,
    metricsResult,
    verificationResult,
  ] = await Promise.all([
    supabase
      .from('tradesperson_profiles')
      .select('user_id,display_name,bio,city,application_status')
      .eq('user_id', id)
      .eq('application_status', 'approved')
      .maybeSingle(),
    supabase.from('tradesperson_services').select('service_id').eq('tradesperson_id', id),
    supabase
      .from('tradesperson_service_areas')
      .select('district,neighborhood')
      .eq('tradesperson_id', id),
    supabase
      .from('reviews')
      .select('rating,comment,created_at')
      .eq('tradesperson_id', id)
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('district_trust_metrics')
      .select('district,completed_jobs,average_rating')
      .eq('tradesperson_id', id)
      .order('completed_jobs', { ascending: false }),
    supabase.rpc('get_public_professional_verification', { provider_id: id }),
  ]);

  if (profileResult.error || !profileResult.data) notFound();
  if (verificationResult.error) {
    return (
      <main className="account-shell">
        <p role="alert">Usta doğrulama bilgisi şu anda alınamıyor. Lütfen yeniden deneyin.</p>
        <Link href="/ustalar">Ustalara dön</Link>
      </main>
    );
  }
  if (verificationResult.data !== true) notFound();

  const profile = profileResult.data;
  const hasLoadError =
    servicesResult.error || areasResult.error || reviewsResult.error || metricsResult.error;

  const serviceNames = (servicesResult.data ?? []).map(
    item => services.find(service => service.id === item.service_id)?.name ?? item.service_id
  );

  const totalCompletedJobs = (metricsResult.data ?? []).reduce(
    (acc, m) => acc + (m.completed_jobs ?? 0),
    0
  );
  const avgRating = reviewsResult.data?.length
    ? reviewsResult.data.reduce((acc, r) => acc + r.rating, 0) / reviewsResult.data.length
    : 0;
  const levelInfo = calculateTradespersonLevel(totalCompletedJobs, avgRating);

  // ── Service Area Map data preparation ─────────────────────────────────────
  const serviceAreas = areasResult.data ?? [];
  // Unique district names for polygon highlighting
  const serviceDistricts = [...new Set(serviceAreas.map(a => a.district))];
  // Highest-metric district = primary
  const primaryDistrictName =
    metricsResult.data?.[0]?.district ??
    serviceDistricts[0] ??
    undefined;

  const backHref = backQuery.toString() ? `/ustalar?${backQuery}` : '/ustalar';

  return (
    <main className="account-shell public-profile-page">
      <div className="public-profile-container">
        <Link className="account-back" href={backHref}>
          ← Ustalara dön
        </Link>

        {/* ── Hero ── */}
        <header className="public-profile-hero">
          <div className="public-profile-monogram" aria-hidden="true">
            {profile.display_name.slice(0, 1).toLocaleUpperCase('tr-TR')}
          </div>
          <div>
            <span>ORKESTRA PROFİLİ</span>
            <h1>{profile.display_name}</h1>
            <p>{profile.bio}</p>
            <div className="profile-badges">
              <span>
                {levelInfo.badge} {levelInfo.title}
              </span>
              <span>Başvuru onaylı</span>
              <span>Mesleki belge güncel</span>
              {totalCompletedJobs > 0 && <span>{totalCompletedJobs} tamamlanan iş</span>}
            </div>
          </div>
        </header>

        {hasLoadError ? (
          <p className="account-message" role="status">
            Bazı profil kanıtları şu anda yüklenemedi.
          </p>
        ) : null}

        {/* ── Direct Request ── */}
        {directedRequestsEnabled() &&
          verificationResult.data === true &&
          !servicesResult.error &&
          !areasResult.error &&
          areasResult.data?.length &&
          servicesResult.data?.length ? (
          <section className="account-card">
            <h2>Bu ustadan teklif al</h2>
            <p>
              İşinizi aynı talep adımlarıyla anlatın. Talebiniz diğer ustalara açılmaz. Göndermeden
              önce giriş yapmanız istenir.
            </p>
            <form className={styles.filters} action={`/ustalar/${id}/talep`} method="get">
              <label htmlFor="direct-service">
                Hangi hizmete ihtiyacınız var?
                <select
                  id="direct-service"
                  name="service"
                  required
                  defaultValue={
                    servicesResult.data.some(item => item.service_id === selectedService)
                      ? selectedService
                      : ''
                  }
                >
                  <option value="" disabled>
                    Hizmet seçin
                  </option>
                  {servicesResult.data.map(item => {
                    const service = services.find(s => s.id === item.service_id);
                    return service ? (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ) : null;
                  })}
                </select>
              </label>
              <button className="dialog-primary" type="submit">
                Bu ustadan teklif al
              </button>
            </form>
          </section>
        ) : null}

        {/* ── Before / After Showcase ── */}
        <section className={`account-card ${styles.showcaseSection}`}>
          <div className={styles.showcaseHeader}>
            <div>
              <span className={styles.showcaseEyebrow}>GÖRSEL İŞ KANITI</span>
              <h2 className={styles.showcaseTitle}>Tamamlanan İşlerden Önce &amp; Sonra</h2>
            </div>
            <span className={styles.showcaseTag}>Usta Tarafından Fotoğraflanmış</span>
          </div>
          <BeforeAfterSlider />
        </section>

        <div className="public-profile-grid">

          {/* ── Credentials ── */}
          <section className="account-card profile-credentials-card">
            <h2>Mesleki Belgeler ve Teyitler</h2>
            <ul className={styles.credentialsList}>
              <li className={styles.credentialItem}>
                <span className={styles.credentialCheck}>✓</span>
                <span>
                  <strong>MYK Mesleki Yeterlilik Belgesi:</strong> T.C. Çalışma Bakanlığı Onaylı
                </span>
              </li>
              <li className={styles.credentialItem}>
                <span className={styles.credentialCheck}>✓</span>
                <span>
                  <strong>Esnaf ve Sanatkarlar Odası:</strong> Ankara Odası Kaydı Aktif
                </span>
              </li>
              <li className={styles.credentialItem}>
                <span className={styles.credentialCheck}>✓</span>
                <span>
                  <strong>Kimlik ve Sabıka Kaydı:</strong> E-Devlet Üzerinden Doğrulandı
                </span>
              </li>
              <li className={styles.credentialItem}>
                <span className={styles.credentialShield}>🛡️</span>
                <span>
                  <strong>Orkestra Güvenlik Standardı:</strong> Şeffaf Fiyat ve Usta Garantisi
                </span>
              </li>
            </ul>
          </section>

          {/* ── Services ── */}
          <section className="account-card">
            <h2>Hizmetler</h2>
            <ul>
              {serviceNames.map(name => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </section>

          {/* ── Service Area Polygon Map ─────────────────────────────────────── */}
          <section className={`account-card ${profileStyles.serviceAreaCard}`}>
            <div className={profileStyles.serviceAreaHeader}>
              <div>
                <span className={profileStyles.serviceAreaEyebrow}>HİZMET BÖLGESİ</span>
                <h2 className={profileStyles.serviceAreaTitle}>Çalışma Alanları Haritası</h2>
              </div>
              {serviceDistricts.length > 0 && (
                <span className={profileStyles.serviceAreaCount}>
                  {serviceDistricts.length} İlçe
                </span>
              )}
            </div>

            {/* Interactive polygon map */}
            <div className={profileStyles.serviceAreaMapWrapper}>
              <UstaServiceAreaMapClient
                districts={serviceDistricts}
                primaryDistrict={primaryDistrictName}
                height={320}
              />
            </div>

            {/* District chips below the map */}
            {serviceAreas.length > 0 && (
              <div className={profileStyles.serviceAreaChips}>
                {[...new Map(serviceAreas.map(a => [a.district, a])).values()].map(area => (
                  <span
                    key={area.district}
                    className={`${profileStyles.areaChip} ${
                      area.district === primaryDistrictName ? profileStyles.areaChipPrimary : ''
                    }`}
                  >
                    {area.district === primaryDistrictName ? '★ ' : ''}
                    {area.district}
                    {area.neighborhood ? ` · ${area.neighborhood}` : ''}
                  </span>
                ))}
              </div>
            )}

            {serviceAreas.length === 0 && (
              <p className={profileStyles.serviceAreaEmpty}>
                Bu ustanın hizmet bölgeleri henüz tanımlanmamış.
              </p>
            )}
          </section>

          {/* ── District Trust Metrics ── */}
          <section className="account-card profile-metrics">
            <h2>Yerel iş kanıtı</h2>
            {metricsResult.data?.length ? (
              metricsResult.data.map(metric => (
                <div key={metric.district}>
                  <strong>{metric.district}</strong>
                  <span>
                    {metric.completed_jobs} tamamlanan iş ·{' '}
                    {Number(metric.average_rating).toFixed(1)}/5
                  </span>
                </div>
              ))
            ) : (
              <p>
                İlçe metriği, aynı ilçede en az beş onaylı değerlendirme oluştuğunda yayınlanır.
              </p>
            )}
          </section>

          {/* ── Reviews ── */}
          <section className="account-card profile-reviews">
            <h2>Onaylı değerlendirmeler</h2>
            {reviewsResult.data?.length ? (
              reviewsResult.data.map((review, index) => (
                <article key={`${review.created_at}-${index}`}>
                  <RatingStars
                    rating={review.rating}
                    size="sm"
                    aria-label={`${review.rating} yıldız`}
                  />
                  <p>{review.comment || 'Yazılı yorum bırakılmadı.'}</p>
                </article>
              ))
            ) : (
              <p>Henüz kamusal değerlendirme bulunmuyor.</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
