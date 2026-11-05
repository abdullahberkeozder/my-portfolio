import Link from 'next/link';
import { accountRoleLabel } from '../lib/presentationLabels';
import { redirect } from 'next/navigation';
import AccountSignOut from '../components/AccountSignOut';
import AccountProfileForm from '../components/AccountProfileForm';
import AccountCityForm from '../components/AccountCityForm';
import {pilotCityState} from '../lib/pilotCity';
import { createSupabaseServerClient } from '../lib/supabase/server';
import styles from './accountPage.module.css';

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
    <main className={styles.page}>
      <div className={styles.container}>
        <Link className={styles.back} href={back.href}>← {back.label}</Link>
        <header className={styles.pageHeader}>
          <h1>Hesabınız</h1>
          <p>Kişisel bilgilerinizi ve hesap bölgenizi yönetin.</p>
        </header>
        <div className={styles.layout}>
          <nav className={styles.navigation} aria-label="Hesap bölümleri">
            {!loadError && <a href="#profil">Kişisel bilgiler</a>}
            {!loadError && <a href="#bolge">Hesap bölgesi</a>}
            {tpProfile && !loadError && <a href="#usta-durumu">Usta başvurusu</a>}
            <a href="#oturum">Oturum ve gizlilik</a>
          </nav>
          <div className={styles.content}>
            {loadError ? (
              <section className={styles.error} role="alert">
                <h2>Hesap bilgileri yüklenemedi</h2>
                <p>Bağlantınızı kontrol edip sayfayı yeniden deneyin.</p>
                <a href="/hesap">Hesabı yeniden yükle</a>
              </section>
            ) : (
              <>
                <section className={styles.identity} aria-label="Hesap kimliği">
                  <dl>
                    <div><dt>E-posta</dt><dd>{user.email || 'E-posta bilgisi yok'}</dd></div>
                    <div><dt>Hesap rolleri</dt><dd>{roles?.map(item => accountRoleLabel(item.role)).join(', ') || 'Müşteri'}</dd></div>
                  </dl>
                </section>
                <AccountProfileForm key={`profile-${user.id}`} userId={user.id} initialName={profile?.display_name??''}/>
                <AccountCityForm key={`city-${user.id}`} userId={user.id} saved={pilotCityState(user.user_metadata)==='ankara'}/>
              </>
            )}

        {tpProfile && !loadError && (
          <section id="usta-durumu" className={styles.professional} aria-label="Usta başvuru ve doğrulama durumu">
            <div className={styles.professionalHeader}>
              <h2 id="professional-status-title">Usta başvurusu</h2>
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
              <div className={styles.feedback}>
                <strong>İnceleme notu:</strong> {tpProfile.review_note}
              </div>
            )}

            {tpProfile.application_status === 'approved' && (
              <div>
                {verificationResult.data === true && <p className={styles.verification}>Mesleki belge güncel</p>}
                <p className={styles.statusDescription}>
                  Profiliniz onaylanmıştır. Hizmet bölgeniz ve uzmanlık alanınızdaki açık fırsatlara teklif verebilirsiniz.
                </p>
                <div className={styles.professionalLinks}>
                  <Link href={`/ustalar/${user.id}`}>Profilimi görüntüle</Link>
                  <Link href="/usta/talepler">İş fırsatlarını gör</Link>
                </div>
              </div>
            )}

            {(tpProfile.application_status === 'needs_changes' || tpProfile.application_status === 'reassessment_required') && (
              <div>
                <p className={styles.statusDescription}>
                  Moderatör tarafından talep edilen eksik veya güncellenmesi gereken belgeleri başvurunuza ekleyerek tekrar incelemeye gönderebilirsiniz.
                </p>
                <Link className={styles.statusAction} href="/usta-basvurusu">
                  Eksik belgeleri güncelle
                </Link>
              </div>
            )}

            {(tpProfile.application_status === 'submitted' || tpProfile.application_status === 'under_review') && (
              <p className={styles.statusDescription}>
                Başvurunuz ve yüklediğiniz belgeler moderatör ekibi tarafından incelenmektedir. Sonuç e-posta ile bildirilecek ve bu panelde güncellenecektir.
              </p>
            )}
          </section>
        )}

        <section id="oturum" className={styles.session} aria-labelledby="session-title">
          <h2 id="session-title">Oturum ve gizlilik</h2>
          <p>Bu tarayıcıdaki oturumunuzu kapatabilirsiniz.</p>
          <div className={styles.sessionActions}>
            <Link href="/gizlilik">Gizlilik metnini incele</Link>
            <AccountSignOut buttonClassName={styles.signOut}/>
          </div>
        </section>
          </div>
        </div>
      </div>
    </main>
  );
}
