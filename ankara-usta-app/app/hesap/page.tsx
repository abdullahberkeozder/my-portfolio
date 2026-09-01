import Link from 'next/link';
import { redirect } from 'next/navigation';
import AppHeader from '../components/AppHeader';
import AccountSignOut from '../components/AccountSignOut';
import { createSupabaseServerClient } from '../lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/giris?next=/hesap');

  const [{ data: profile, error: profileError }, { data: roles, error: rolesError }] = await Promise.all([
    supabase.from('user_profiles').select('display_name,created_at').eq('user_id', user.id).maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', user.id),
  ]);
  const loadError = profileError ?? rolesError;

  return (
    <main className="account-shell account-settings-page">
      <AppHeader role="customer" />
      <div className="account-settings-container">
        <Link className="account-back" href="/taleplerim">← Müşteri alanı</Link>
        <header>
          <span>HESAP VE GİZLİLİK</span>
          <h1>Hesabınız</h1>
          <p>Oturum, kimlik ve gizlilik tercihlerinizi tek yerde yönetin.</p>
        </header>
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
              <div><dt>Hesap rolleri</dt><dd>{roles?.map(item => item.role).join(', ') || 'customer'}</dd></div>
            </dl>
            <div className="account-settings-actions">
              <Link href="/gizlilik">Gizlilik metnini incele</Link>
              <AccountSignOut />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
