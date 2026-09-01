import Link from 'next/link';
import { notFound } from 'next/navigation';
import AppHeader from '../components/AppHeader';
import { services } from '../data/serviceTaxonomy';
import { createSupabaseServerClient } from '../lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Onaylı Ustalar | Orkestra',
  description: 'Orkestra tarafından belge doğrulaması yapılmış Ankara\'lı ustaları keşfedin. Hizmet alanına ve ilçeye göre filtreleyin.',
};

export default async function UstalarIndexPage() {
  const supabase = await createSupabaseServerClient();

  const { data: profiles, error } = await supabase
    .from('tradesperson_profiles')
    .select('user_id, display_name, bio, city')
    .eq('application_status', 'approved')
    .order('display_name', { ascending: true })
    .limit(60);

  if (error) {
    return (
      <main className="account-shell">
        <AppHeader />
        <div className="requests-page" style={{ textAlign: 'center', paddingTop: '60px' }}>
          <p className="account-message" role="alert">Usta listesi şu anda yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>
          <Link className="dialog-primary" href="/" style={{ display: 'inline-flex', marginTop: '16px', textDecoration: 'none', alignItems: 'center', justifyContent: 'center' }}>
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </main>
    );
  }

  const tradespersonIds = (profiles ?? []).map(p => p.user_id);
  const serviceMap: Record<string, string[]> = {};

  if (tradespersonIds.length > 0) {
    const { data: serviceRows } = await supabase
      .from('tradesperson_services')
      .select('tradesperson_id, service_id')
      .in('tradesperson_id', tradespersonIds);

    for (const row of serviceRows ?? []) {
      const name = services.find(s => s.id === row.service_id)?.name;
      if (!name) continue;
      if (!serviceMap[row.tradesperson_id]) serviceMap[row.tradesperson_id] = [];
      serviceMap[row.tradesperson_id].push(name);
    }
  }

  return (
    <main className="account-shell ustalar-page">
      <AppHeader />
      <div className="requests-page">
        <header className="requests-header">
          <div>
            <span>ORKESTRA AĞI</span>
            <h1>Onaylı Ustalar</h1>
          </div>
          <Link className="dialog-primary" href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            Hizmet Talep Et →
          </Link>
        </header>

        {(!profiles || profiles.length === 0) ? (
          <div className="empty-requests">
            <p style={{ fontSize: '40px', marginBottom: '8px' }}>🔍</p>
            <h2>Henüz Listelenmiş Usta Yok</h2>
            <p>Onaylı ustalar profil doğrulamasını tamamladıktan sonra burada görünecek.</p>
            <Link className="dialog-primary" href="/usta-basvurusu" style={{ marginTop: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              Usta Olarak Başvur →
            </Link>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
              {profiles.length} onaylı usta · Mesleki belge kontrolü tamamlanmadan rozet verilmez
            </p>
            <div className="request-list">
              {profiles.map(profile => {
                const profileServices = serviceMap[profile.user_id] ?? [];
                return (
                  <article key={profile.user_id}>
                    <div>
                      <span>ONAYLI USTA</span>
                      <h2 style={{ margin: '5px 0', fontSize: '18px' }}>{profile.display_name}</h2>
                      {profileServices.length > 0 && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0' }}>
                          {profileServices.slice(0, 3).join(' · ')}{profileServices.length > 3 ? ` +${profileServices.length - 3} daha` : ''}
                        </p>
                      )}
                      {profile.bio && (
                        <p style={{ marginTop: '6px', fontSize: '14px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {profile.bio}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/ustalar/${profile.user_id}`}
                      style={{ flexShrink: 0, padding: '10px 18px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-control)', color: 'var(--action-primary)', fontWeight: 700, fontSize: '13px', textDecoration: 'none', whiteSpace: 'nowrap', alignSelf: 'flex-start' }}
                    >
                      Profili İncele →
                    </Link>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
