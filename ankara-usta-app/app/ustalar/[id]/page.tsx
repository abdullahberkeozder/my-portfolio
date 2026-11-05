import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { services } from '../../data/serviceTaxonomy';
import { ankaraDistricts } from '../../data/ankaraLocations';
import { createSupabaseServerClient } from '../../lib/supabase/server';
import { directedRequestsEnabled } from '../../lib/directedRequests';
import { canonicalDiscoveryDistrictSlug, parseDiscoveryParams, serializeDiscoveryFilters } from '../../lib/discoveryContract';
import { buildPublicTrustClaims } from '../../lib/trustClaims';
import profileStyles from './profile.module.css';
import { RatingStars } from '../../components/ui';
import UstaServiceAreaMapClient from '../../components/map/UstaServiceAreaMapClient';
import SurfaceCard from '../../components/ui/SurfaceCard';

export const dynamic = 'force-dynamic';

const CRAFT_PORTFOLIO = [
  {
    title: 'Siteler Atölye İmalatı & Yerinde Montaj',
    desc: 'Lazer gönye ve hassas ray bağlantılı demonte ve özel mobilya kurulumu.',
    image: '/services/montaj.jpg',
  },
  {
    title: 'Rüzgarlı Tesisat Testi & Sıhhi Yenileme',
    desc: 'Basınç testli batarya, gizli sifon ve su sızdırmazlık müdahaleleri.',
    image: '/services/tesisat.jpg',
  },
  {
    title: 'Lazer Terazili Hat & Hatasız Duvar İşçiliği',
    desc: 'Pürüzsüz macun, astar ve silinebilir boya ile korumalı yüzeyler.',
    image: '/services/boya-tadilat.jpg',
  },
];

export default async function PublicTradespersonPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ service?: string; district?: string }>;
}) {
  const { id } = await params;
  const rawFilters = await searchParams ?? {};
  const filters = parseDiscoveryParams(rawFilters, {
    serviceIds: services.map((service) => service.id),
    districts: ankaraDistricts,
  });
  const selectedServiceRecord = services.find(service => service.id === filters.service);
  const selectedService = filters.service;
  const backQuery = serializeDiscoveryFilters({ service: selectedService, district: filters.district });
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

  // ── Service Area Map data preparation ─────────────────────────────────────
  const serviceAreas = areasResult.data ?? [];
  const serviceDistricts = [...new Set(serviceAreas.map(a => a.district))];
  const primaryDistrictName =
    metricsResult.data?.[0]?.district ??
    serviceDistricts[0] ??
    undefined;
  const trustClaims = buildPublicTrustClaims({
    verificationConfirmed: verificationResult.data === true,
    reviewCount: reviewsResult.data?.length,
    averageRating: avgRating,
    completedJobs: totalCompletedJobs,
    serviceAreaCount: serviceDistricts.length,
  });

  const backHref = backQuery ? `/ustalar?${backQuery}&view=split&sort=recommended` : '/ustalar?view=split&sort=recommended';
  const canRequest = directedRequestsEnabled() && !servicesResult.error && !areasResult.error &&
    Boolean(servicesResult.data?.length && areasResult.data?.length);
  const serviceOffered = !selectedService || Boolean(servicesResult.data?.some(item => item.service_id === selectedService));
  const districtServed = !filters.district || serviceDistricts.includes(filters.district);
  const directRequestQuery = serializeDiscoveryFilters({ service: selectedService, district: filters.district });
  const directRequestHref = selectedService
    ? `/ustalar/${id}/talep?${directRequestQuery}`
    : `/ustalar/${id}`;

  return (
    <main className="account-shell public-profile-page">
      <div className="public-profile-container">
        <Link className="account-back" href={backHref}>
          ← Ustalara dön
        </Link>

        {/* ── ÜST PROFİL VE KARAR ALANI ───────────────────────── */}
        <div className={profileStyles.profileTop}>
          <header className={profileStyles.profileIntro}>
            <div className={profileStyles.profileAvatar} aria-hidden="true">
              {profile.display_name.slice(0, 1).toLocaleUpperCase('tr-TR')}
            </div>
            <div>
              <h1>{profile.display_name}</h1>
              {profile.bio && <p className={profileStyles.profileBio}>{profile.bio}</p>}

              <div className={profileStyles.profileTrustRow} aria-label="Profil özeti">
                <span
                  className={profileStyles.verifiedMark}
                  aria-label="Orkestra doğrulaması tamamlandı"
                  title="Orkestra doğrulaması tamamlandı"
                >
                  ✓
                </span>
                {reviewsResult.data?.length ? (
                  <span className={profileStyles.ratingSummary}>
                    <span aria-hidden="true">★</span> {avgRating.toFixed(1)} · {reviewsResult.data.length} yorum
                  </span>
                ) : (
                  <span className={profileStyles.profileTrustText}>Yeni profil</span>
                )}
                {totalCompletedJobs > 0 ? (
                  <span className={profileStyles.profileTrustText}>{totalCompletedJobs} tamamlanan iş</span>
                ) : null}
              </div>

              <div className={profileStyles.guildBadges} aria-label="Profil kanıtları">
                {trustClaims.map((claim) => (
                  <span className={profileStyles.guildBadge} key={claim.key} title={claim.detail}>
                    {claim.label}
                  </span>
                ))}
              </div>
            </div>
          </header>

          {/* ── KARAR PANELİ ───────────────────────────────────── */}
          <aside className={profileStyles.decisionPanel} aria-label="Bu ustayla devam et">
            <h2>Bu ustayla devam edin</h2>
            <p>{selectedServiceRecord ? selectedServiceRecord.name : 'Önce hizmeti seçin'}</p>
            {filters.district && <p className={profileStyles.decisionDistrict}>{filters.district}</p>}
            {!serviceOffered ? <p className={profileStyles.decisionWarning}>Bu usta seçilen hizmeti sunmuyor. Hizmeti yeniden seçin.</p> : null}
            {!districtServed ? <p className={profileStyles.decisionWarning}>Bu usta seçilen ilçede hizmet vermiyor. Bölgeyi yeniden seçin.</p> : null}
            {canRequest && serviceOffered && districtServed ? (
              selectedService ? (
                <a className={profileStyles.decisionAction} href={directRequestHref}>
                  Bu ustadan teklif al <span aria-hidden="true">→</span>
                </a>
              ) : (
                <form className={profileStyles.decisionForm} action={`/ustalar/${id}/talep`} method="get">
                  <label htmlFor="direct-service">Hizmet</label>
                  <select id="direct-service" name="service" required defaultValue="">
                    <option value="" disabled>Hizmet seçin</option>
                    {servicesResult.data?.map(item => {
                      const service = services.find(entry => entry.id === item.service_id);
                      return service ? <option key={service.id} value={service.id}>{service.name}</option> : null;
                    })}
                  </select>
                  {filters.district ? <input type="hidden" name="district" value={canonicalDiscoveryDistrictSlug(filters.district)} /> : null}
                  <button className={profileStyles.decisionAction} type="submit">Bu ustadan teklif al <span aria-hidden="true">→</span></button>
                </form>
              )
            ) : canRequest ? null : <p className={profileStyles.decisionUnavailable}>Şu anda bu ustaya yeni talep gönderilemiyor.</p>}
            {canRequest && serviceOffered && districtServed ? <small>Talebi göndermeden önce kapsamı ve bölgeyi kontrol edeceksiniz.</small> : null}
            {(selectedServiceRecord || filters.district) && <Link className={profileStyles.decisionBack} href={backHref}>Seçimi değiştir</Link>}
          </aside>
        </div>

        {hasLoadError ? (
          <p className="account-message" role="status">
            Bazı profil kanıtları şu anda yüklenemedi.
          </p>
        ) : null}

        {/* ── ATÖLYE & UYGULAMA FOTOĞRAF GALERİSİ ─────────────── */}
        <SurfaceCard className={`${profileStyles.profileSurface} ${profileStyles.portfolioCard}`}>
          <div className={profileStyles.portfolioHeader}>
            <div>
              <span className={profileStyles.portfolioEyebrow}>ZANAAT KANITI</span>
              <h2 className={profileStyles.portfolioTitle}>Atölye ve Uygulama Galerisi</h2>
            </div>
            <span className={profileStyles.serviceAreaCount}>Görsel örnekler</span>
          </div>
          <div className={profileStyles.portfolioGrid}>
            {CRAFT_PORTFOLIO.map(item => (
              <div key={item.title} className={profileStyles.portfolioItem}>
                <div className={profileStyles.portfolioImgWrap}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
                    className={profileStyles.portfolioImg}
                  />
                </div>
                <div className={profileStyles.portfolioCaption}>
                  <h3 className={profileStyles.portfolioCaptionTitle}>{item.title}</h3>
                  <p className={profileStyles.portfolioCaptionDesc}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <div className="public-profile-grid">

          {/* ── Hizmetler ── */}
          <SurfaceCard className={profileStyles.profileSurface}>
            <h2>Hizmetler</h2>
            <ul className={profileStyles.profileServiceList}>
              {serviceNames.map(name => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </SurfaceCard>

          {/* ── Hizmet Bölgesi Poligon Haritası ───────────────── */}
          <SurfaceCard className={`${profileStyles.profileSurface} ${profileStyles.serviceAreaCard}`}>
            <div className={profileStyles.serviceAreaHeader}>
              <div>
                <span className={profileStyles.serviceAreaEyebrow}>HİZMET BÖLGESİ</span>
                <h2 className={profileStyles.serviceAreaTitle}>Hizmet bölgeleri</h2>
              </div>
              {serviceDistricts.length > 0 && (
                <span className={profileStyles.serviceAreaCount}>
                  {serviceDistricts.length} İlçe
                </span>
              )}
            </div>

            {/* İnteraktif Poligon Haritası */}
            <div className={profileStyles.serviceAreaMapWrapper}>
              <UstaServiceAreaMapClient
                districts={serviceDistricts}
                primaryDistrict={primaryDistrictName}
                height={320}
              />
            </div>

            {/* Bölge Çipleri */}
            {serviceAreas.length > 0 && (
              <div className={profileStyles.serviceAreaChips}>
                {[...new Map(serviceAreas.map(a => [a.district, a])).values()].map(area => (
                  <span
                    key={area.district}
                    className={`${profileStyles.areaChip} ${
                      area.district === primaryDistrictName ? profileStyles.areaChipPrimary : ''
                    }`}
                  >
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
          </SurfaceCard>

          {/* ── Yerel İş Kanıtı (Metrikler) ───────────────────── */}
          {metricsResult.data?.length ? (
            <SurfaceCard className={`${profileStyles.profileSurface} ${profileStyles.profileMetrics} profile-metrics`}>
              <h2>Yerel iş kanıtı</h2>
              {metricsResult.data.map(metric => (
                <div key={metric.district}>
                  <strong>{metric.district}</strong>
                  <span>
                    {metric.completed_jobs} tamamlanan iş ·{' '}
                    {Number(metric.average_rating).toFixed(1)}/5
                  </span>
                </div>
              ))}
            </SurfaceCard>
          ) : null}

          {/* ── Onaylı Değerlendirmeler ───────────────────────── */}
          <SurfaceCard className={`${profileStyles.profileSurface} ${profileStyles.profileReviews} profile-reviews`}>
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
          </SurfaceCard>
        </div>
      </div>
    </main>
  );
}
