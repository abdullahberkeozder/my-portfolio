import Link from 'next/link';
import { redirect } from 'next/navigation';
import { disputeSlaState } from '../../domain';
import { createSupabaseServerClient } from '../../lib/supabase/server';
import RealtimeRefresh from '../../components/RealtimeRefresh';

import { getServerUserAndRoles } from '../../lib/authServer';

export const dynamic = 'force-dynamic';

const labels: Record<string, string> = {
  opened: 'Açıldı',
  triage: 'Ön değerlendirme',
  awaiting_evidence: 'Kanıt bekleniyor',
  counterparty_response: 'Karşı taraf yanıtı',
  investigation: 'İnceleme',
  resolution_proposed: 'Çözüm önerildi',
  notified: 'Taraflara bildirildi',
  appealed: 'İtiraz edildi',
  closed: 'Kapandı',
  dismissed: 'Kapatıldı',
};

export default async function DisputeOperationsPage() {
  const { user, roles } = await getServerUserAndRoles();
  if (!user) redirect('/giris?next=/yonetim/uyusmazliklar');
  if (!roles.includes('admin') && !roles.includes('moderator')) redirect('/');

  const supabase = await createSupabaseServerClient();


  const { data } = await supabase
    .from('dispute_cases')
    .select('id,category,description,status,sla_due_at,created_at')
    .order('sla_due_at');

  const disputes = data ?? [];
  const overdue = disputes.filter(
    item => !['closed', 'dismissed'].includes(item.status) && disputeSlaState(item.sla_due_at) === 'overdue'
  ).length;

  return (
    <main className="account-shell admin-queue dispute-operations">

      <div style={{ maxWidth: '1140px', margin: '32px auto', padding: '0 16px' }}>
        <RealtimeRefresh channelName="admin-dispute-queue" subscriptions={[{ table: 'dispute_cases' }]} label="Uyuşmazlık kuyruğu" />
        <Link className="account-back" href="/yonetim/moderasyon">← Yönetim Paneli</Link>
        <header style={{ marginTop: '16px' }}>
          <span>FAZ 7 · OPERASYON</span>
          <h1>Uyuşmazlık merkezi</h1>
          <p>Kanıt sürelerini, taraf yanıtlarını, karar iletişimini ve itirazları tek denetlenebilir kuyruktan yönetin.</p>
        </header>

        <nav className="admin-tabs" style={{ marginTop: '24px' }}>
          <Link href="/yonetim/usta-basvurulari">Usta başvuruları</Link>
          <Link href="/yonetim/moderasyon">İçerik moderasyonu</Link>
          <Link className="active" href="/yonetim/uyusmazliklar">
            Uyuşmazlıklar <b>{disputes.length}</b>
          </Link>
        </nav>

        <section className="ops-summary">
          <div>
            <span>Aktif dosya</span>
            <b>{disputes.filter(item => !['closed', 'dismissed'].includes(item.status)).length}</b>
          </div>
          <div className={overdue ? 'danger' : ''}>
            <span>SLA geciken</span>
            <b>{overdue}</b>
          </div>
          <div>
            <span>İtiraz</span>
            <b>{disputes.filter(item => item.status === 'appealed').length}</b>
          </div>
        </section>

        <div className="operation-list">
          {disputes.map(item => {
            const sla = disputeSlaState(item.sla_due_at);
            return (
              <Link href={`/yonetim/uyusmazliklar/${item.id}`} key={item.id}>
                <div>
                  <span>{labels[item.status] ?? item.status}</span>
                  <h2>{item.category}</h2>
                  <p>{item.description}</p>
                </div>
                <div className={`sla-chip ${sla}`}>
                  <b>{sla === 'overdue' ? 'Gecikmiş' : sla === 'due_soon' ? 'Yaklaşıyor' : 'SLA içinde'}</b>
                  <time>{new Intl.DateTimeFormat('tr-TR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.sla_due_at))}</time>
                </div>
              </Link>
            );
          })}
        </div>

        {!disputes.length && (
          <section className="account-card empty-requests">
            <h2>Uyuşmazlık kuyruğu temiz</h2>
            <p>Yeni bir kayıt açıldığında burada SLA sırasına göre görünecek.</p>
          </section>
        )}
      </div>
    </main>
  );
}
