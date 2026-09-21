import Link from 'next/link';
import { accountRoleLabel } from '../lib/presentationLabels';
import { redirect } from 'next/navigation';
import AccountSignOut from '../components/AccountSignOut';
import AccountProfileForm from '../components/AccountProfileForm';
import AccountCityForm from '../components/AccountCityForm';
import PilotCityMap from '../components/PilotCityMap';
import {pilotCityState} from '../lib/pilotCity';
import { createSupabaseServerClient } from '../lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AccountPage({searchParams}: {searchParams?:Promise<{workspace?:string}>}={}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/giris?next=/hesap');

  const [{ data: profile, error: profileError }, { data: roles, error: rolesError }, { data: tradespersonProfile, error: tpError }] = await Promise.all([
    supabase.from('user_profiles').select('display_name,created_at').eq('user_id', user.id).maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', user.id),
    supabase.from('tradesperson_profiles').select('user_id,application_status,review_note,reviewed_at').eq('user_id', user.id).maybeSingle(),
  ]);
  const loadError = profileError ?? rolesError ?? tpError;
  const workspace=(await searchParams)?.workspace;
  const roleNames=(roles??[]).map(item=>item.role);
  const back=workspace==='operations'&&roleNames.some(role=>role==='admin'||role==='moderator')?{href:roleNames.includes('admin')?'/yonetim/uyusmazliklar':'/yonetim/moderasyon',label:'Yönetim alanı'}:
    roleNames.includes('tradesperson')&&workspace!=='customer'?{href:'/usta/talepler',label:'Usta alanı'}:{href:'/taleplerim',label:'Müşteri alanı'};

  const tpProfile = (Array.isArray(tradespersonProfile) ? tradespersonProfile[0] : tradespersonProfile) as {
    user_id: string;
    application_status: string;
    review_note: string | null;
    reviewed_at: string | null;
  } | null | undefined;

  const verificationResult = (tpProfile?.application_status === 'approved')
    ? (supabase.rpc
        ? await supabase.rpc('get_public_professional_verification', { provider_id: user.id })
        : { data: false, error: null })
    : { data: false, error: null };

  return (
    <main className="account-shell account-settings-page">

      <div className="account-settings-container">
        <Link className="account-back" href={back.href}>← {back.label}</Link>
        <header>
          <span>HESAP VE GİZLİLİK</span>
          <h1>Hesabınız</h1>
          <p>Oturum, kimlik ve gizlilik tercihlerinizi tek yerde yönetin.</p>
        </header>
        <nav className="account-settings-actions" aria-label="Hesap bölümleri"><a href="#profil">Kişisel bilgiler</a><a href="#bolge">Bölge</a><a href="#oturum">Oturum ve gizlilik</a></nav>
        {loadError ? (
          <section className="account-card account-state-error" role="alert">
            <h2>Hesap bilgileri yüklenemedi</h2>
            <p>Bağlantınızı kontrol edip sayfayı yeniden deneyin.</p>
          </section>
        ) : (
          <section className="account-card account-details">
            <dl>
              <div><dt>Görünen ad</dt><dd>{profile?.display_name || 'Henüz belirlenmedi'}</dd></div>
              <div><dt>E-posta</dt><dd>{user.email || 'E-posta bilgisi yok'}</dd></div>
              <div><dt>Hesap rolleri</dt><dd>{roles?.map(item => accountRoleLabel(item.role)).join(', ') || 'Müşteri'}</dd></div>
            </dl>
          </section>
        )}

        {tpProfile && (
          <section className="artisan-status-card" aria-label="Usta başvuru ve doğrulama durumu">
            <div className="artisan-status-header">
              <div>
                <span className="workspace-eyebrow">USTA BAŞVURUSU</span>
                <h2 className="artisan-status-title">Doğrulama ve Başvuru Durumu</h2>
              </div>
              <span className={`req-status-badge ${
                tpProfile.application_status === 'approved' ? 'req-status-success' :
                tpProfile.application_status === 'needs_changes' || tpProfile.application_status === 'reassessment_required' ? 'req-status-warning' :
                tpProfile.application_status === 'suspended' || tpProfile.application_status === 'rejected' ? 'req-status-danger' :
                'req-status-info'
              }`}>
                {tpProfile.application_status === 'approved' ? '✓ Başvuru Onaylandı' :
                 tpProfile.application_status === 'under_review' ? 'İnceleniyor' :
                 tpProfile.application_status === 'needs_changes' ? 'Düzeltme Bekleniyor' :
                 tpProfile.application_status === 'reassessment_required' ? 'Yeniden Değerlendirme' :
                 tpProfile.application_status === 'suspended' ? 'Askıya Alındı' :
                 tpProfile.application_status === 'rejected' ? 'Başvuru Reddedildi' :
                 'Başvuru İletildi'}
              </span>
            </div>

            {tpProfile.review_note && (
              <div className="artisan-feedback-box">
                <strong>Moderatör Notu:</strong> {tpProfile.review_note}
              </div>
            )}

            {tpProfile.application_status === 'approved' && (
              <div>
                <div className="artisan-badges-row">
                  <span className="artisan-verified-pill">✓ Başvuru Onaylı</span>
                  {verificationResult.data === true && (
                    <span className="artisan-verified-pill artisan-badge-pro">
                      ★ Mesleki Belge Güncel
                    </span>
                  )}
                </div>
                <p className="artisan-status-desc">
                  Profiliniz onaylanmıştır. Hizmet bölgeniz ve uzmanlık alanınızdaki açık fırsatlara teklif verebilirsiniz.
                </p>
                <div className="artisan-links-row">
                  <Link className="artisan-action-link" href={`/ustalar/${user.id}`}>Kamuya Açık Profilinizi İnceleyin →</Link>
                  <Link className="artisan-action-link" href="/usta/talepler">İş Fırsatlarını Gör →</Link>
                </div>
              </div>
            )}

            {(tpProfile.application_status === 'needs_changes' || tpProfile.application_status === 'reassessment_required') && (
              <div>
                <p className="artisan-status-desc">
                  Moderatör tarafından talep edilen eksik veya güncellenmesi gereken belgeleri başvurunuza ekleyerek tekrar incelemeye gönderebilirsiniz.
                </p>
                <Link className="dialog-primary artisan-update-btn" href="/usta-basvurusu">
                  Eksik Belgeleri Güncelle ve Gönder →
                </Link>
              </div>
            )}

            {(tpProfile.application_status === 'submitted' || tpProfile.application_status === 'under_review') && (
              <p className="artisan-status-desc">
                Başvurunuz ve yüklediğiniz belgeler moderatör ekibi tarafından incelenmektedir. Sonuç e-posta ile bildirilecek ve bu panelde güncellenecektir.
              </p>
            )}
          </section>
        )}

        {!loadError&&<AccountProfileForm key={`profile-${user.id}`} userId={user.id} initialName={profile?.display_name??''}/>}
        <AccountCityForm key={`city-${user.id}`} userId={user.id} saved={pilotCityState(user.user_metadata)==='ankara'}/>
        <PilotCityMap cityState={pilotCityState(user.user_metadata)}/>
        <section id="oturum" className="account-card"><h2>Oturum ve gizlilik</h2><p>Bu tarayıcıdaki oturumunuzu kapatabilirsiniz.</p><Link href="/gizlilik">Gizlilik metnini incele</Link><AccountSignOut/></section>
      </div>
    </main>
  );
}
