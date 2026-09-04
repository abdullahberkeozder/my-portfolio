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

  const [{ data: profile, error: profileError }, { data: roles, error: rolesError }] = await Promise.all([
    supabase.from('user_profiles').select('display_name,created_at').eq('user_id', user.id).maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', user.id),
  ]);
  const loadError = profileError ?? rolesError;
  const workspace=(await searchParams)?.workspace;
  const roleNames=(roles??[]).map(item=>item.role);
  const back=workspace==='operations'&&roleNames.some(role=>role==='admin'||role==='moderator')?{href:roleNames.includes('admin')?'/yonetim/uyusmazliklar':'/yonetim/moderasyon',label:'Yönetim alanı'}:
    roleNames.includes('tradesperson')&&workspace!=='customer'?{href:'/usta/talepler',label:'Usta alanı'}:{href:'/taleplerim',label:'Müşteri alanı'};

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
        {!loadError&&<AccountProfileForm key={user.id} userId={user.id} initialName={profile?.display_name??''}/>}
        <AccountCityForm key={user.id} userId={user.id} saved={pilotCityState(user.user_metadata)==='ankara'}/>
        <PilotCityMap cityState={pilotCityState(user.user_metadata)}/>
        <section id="oturum" className="account-card"><h2>Oturum ve gizlilik</h2><p>Bu tarayıcıdaki oturumunuzu kapatabilirsiniz.</p><Link href="/gizlilik">Gizlilik metnini incele</Link><AccountSignOut/></section>
      </div>
    </main>
  );
}
