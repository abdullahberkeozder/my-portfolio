import Link from 'next/link';
import { redirect } from 'next/navigation';
import { disputeSlaState } from '../../domain';
import { createSupabaseServerClient } from '../../lib/supabase/server';
import RealtimeRefresh from '../../components/RealtimeRefresh';
import RetryButton from '../../components/RetryButton';
import Pagination from '../../components/Pagination';

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

export default async function DisputeOperationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
} = {}) {
  const { user, roles } = await getServerUserAndRoles();
  if (!user) redirect('/giris?next=/yonetim/uyusmazliklar');
  if (!roles.includes('admin') && !roles.includes('moderator')) redirect('/');

  const rawPage = Number.parseInt((await searchParams)?.page ?? '1', 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize = 15;

  const supabase = await createSupabaseServerClient();

  const { data, error, count } = await supabase
    .from('dispute_cases')
    .select('id,category,description,status,sla_due_at,created_at', { count: 'exact' })
    .order('sla_due_at')
    .range((page - 1) * pageSize, page * pageSize - 1);

  const disputes = data ?? [];
  const overdue = disputes.filter(
    item => !['closed', 'dismissed'].includes(item.status) && disputeSlaState(item.sla_due_at) === 'overdue'
  ).length;

  const totalCount = count ?? disputes.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <main className="account-shell admin-queue dispute-operations">
      <div className="admin-queue-container">
        <RealtimeRefresh channelName="admin-dispute-queue" subscriptions={[{ table: 'dispute_cases' }]} label="Uyuşmazlık kuyruğu" />
        <Link className="account-back" href="/yonetim/moderasyon">← Yönetim Paneli</Link>
        <header className="admin-queue-header">
          <span>FAZ 7 · OPERASYON</span>
          <h1>Uyuşmazlık merkezi</h1>
          <p>Kanıt sürelerini, taraf yanıtlarını, karar iletişimini ve itirazları tek denetlenebilir kuyruktan yönetin.</p>
        </header>

        <nav className="admin-tabs admin-tabs-nav">
          <Link href="/yonetim/usta-basvurulari">Usta başvuruları</Link>
          <Link href="/yonetim/moderasyon">İçerik moderasyonu</Link>
          <Link className="active" href="/yonetim/uyusmazliklar">
            Uyuşmazlıklar <b>{totalCount}</b>
          </Link>
        </nav>

        {error ? (
          <section className="account-card" role="alert">
            <h2>Uyuşmazlık kuyruğu yüklenemedi</h2>
            <p>Veritabanı bağlantısını kontrol edip sayfayı yenileyin.</p>
            <RetryButton />
          </section>
        ) : (
          <>
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

            {disputes.length > 0 ? (
              <>
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
                <div className="admin-pagination-wrapper">
                  <Pagination page={page} total={totalCount} pageSize={pageSize} path="/yonetim/uyusmazliklar" />
                </div>
              </>
            ) : (
              <section className="account-card empty-requests">
                <h2>Uyuşmazlık kuyruğu temiz</h2>
                <p>Yeni bir kayıt açıldığında burada SLA sırasına göre görünecek.</p>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
