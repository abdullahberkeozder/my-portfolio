import Link from 'next/link';
import { notFound } from 'next/navigation';
import AppHeader from '../../components/AppHeader';
import { services } from '../../data/serviceTaxonomy';
import { createSupabaseServerClient } from '../../lib/supabase/server';
import { directedRequestsEnabled } from '../../lib/directedRequests';
import styles from '../directory.module.css';

export const dynamic = 'force-dynamic';

export default async function PublicTradespersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const [profileResult, servicesResult, areasResult, reviewsResult, metricsResult, verificationResult] = await Promise.all([
    supabase.from('tradesperson_profiles').select('user_id,display_name,bio,city,application_status').eq('user_id', id).eq('application_status', 'approved').maybeSingle(),
    supabase.from('tradesperson_services').select('service_id').eq('tradesperson_id', id),
    supabase.from('tradesperson_service_areas').select('district,neighborhood').eq('tradesperson_id', id),
    supabase.from('reviews').select('rating,comment,created_at').eq('tradesperson_id', id).eq('moderation_status', 'approved').order('created_at', { ascending: false }).limit(12),
    supabase.from('district_trust_metrics').select('district,completed_jobs,average_rating').eq('tradesperson_id', id).order('completed_jobs', { ascending: false }),
    supabase.rpc('has_current_professional_verification', { provider_id: id }),
  ]);

  if (profileResult.error || !profileResult.data) notFound();
  const profile = profileResult.data;
  const hasLoadError = servicesResult.error || areasResult.error || reviewsResult.error || metricsResult.error || verificationResult.error;
  const serviceNames = (servicesResult.data ?? []).map(item => services.find(service => service.id === item.service_id)?.name ?? item.service_id);

  return (
    <main className="account-shell public-profile-page">
      <AppHeader />
      <div className="public-profile-container">
        <Link className="account-back" href="/ustalar">← Ustalara dön</Link>
        <header className="public-profile-hero">
          <div className="public-profile-monogram" aria-hidden="true">{profile.display_name.slice(0, 1).toLocaleUpperCase('tr-TR')}</div>
          <div>
            <span>ORKESTRA PROFİLİ</span>
            <h1>{profile.display_name}</h1>
            <p>{profile.bio}</p>
            <div className="profile-badges">
              <span>Başvuru onaylı</span>
              {verificationResult.data === true && <span>Mesleki belge güncel</span>}
            </div>
          </div>
        </header>
        {hasLoadError ? <p className="account-message" role="status">Bazı profil kanıtları şu anda yüklenemedi.</p> : null}
        {directedRequestsEnabled() && verificationResult.data===true && !servicesResult.error && !areasResult.error && areasResult.data?.length && servicesResult.data?.length ? <section className="account-card">
          <h2>Bu ustadan teklif al</h2>
          <p>İşinizi aynı talep adımlarıyla anlatın. Talebiniz diğer ustalara açılmaz. Göndermeden önce giriş yapmanız istenir.</p>
          <form className={styles.filters} action={`/ustalar/${id}/talep`} method="get">
            <label htmlFor="direct-service">Hangi hizmete ihtiyacınız var?
            <select id="direct-service" name="service" required>{servicesResult.data.map(item=>{const service=services.find(s=>s.id===item.service_id);return service?<option key={service.id} value={service.id}>{service.name}</option>:null;})}</select></label>
            <button className="dialog-primary" type="submit">Bu ustadan teklif al</button>
          </form>
        </section> : null}
        <div className="public-profile-grid">
          <section className="account-card"><h2>Hizmetler</h2><ul>{serviceNames.map(name => <li key={name}>{name}</li>)}</ul></section>
          <section className="account-card"><h2>Çalışma bölgeleri</h2><ul>{(areasResult.data ?? []).map(area => <li key={`${area.district}-${area.neighborhood ?? ''}`}>{area.neighborhood ? `${area.neighborhood}, ` : ''}{area.district}</li>)}</ul></section>
          <section className="account-card profile-metrics"><h2>Yerel iş kanıtı</h2>{metricsResult.data?.length ? metricsResult.data.map(metric => <div key={metric.district}><strong>{metric.district}</strong><span>{metric.completed_jobs} tamamlanan iş · {Number(metric.average_rating).toFixed(1)}/5</span></div>) : <p>İlçe metriği, aynı ilçede en az beş onaylı değerlendirme oluştuğunda yayınlanır.</p>}</section>
          <section className="account-card profile-reviews"><h2>Onaylı değerlendirmeler</h2>{reviewsResult.data?.length ? reviewsResult.data.map((review, index) => <article key={`${review.created_at}-${index}`}><strong aria-label={`${review.rating} yıldız`}>{'★'.repeat(review.rating)}</strong><p>{review.comment || 'Yazılı yorum bırakılmadı.'}</p></article>) : <p>Henüz kamusal değerlendirme bulunmuyor.</p>}</section>
        </div>
      </div>
    </main>
  );
}
