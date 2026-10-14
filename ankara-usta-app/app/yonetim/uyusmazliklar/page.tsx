import Link from 'next/link';
import { redirect } from 'next/navigation';
import AdminOperationsNav from '../../components/AdminOperationsNav';
import Pagination from '../../components/Pagination';
import RealtimeRefresh from '../../components/RealtimeRefresh';
import RetryButton from '../../components/RetryButton';
import styles from '../../components/operationsWorkspace.module.css';
import { disputeSlaState } from '../../domain';
import { getServerUserAndRoles } from '../../lib/authServer';
import { createSupabaseServerClient } from '../../lib/supabase/server';

export const dynamic = 'force-dynamic';

const labels: Record<string, string> = {
  opened: 'Açıldı', triage: 'Ön değerlendirme', awaiting_evidence: 'Kanıt bekleniyor',
  counterparty_response: 'Karşı taraf yanıtı', investigation: 'İnceleme',
  resolution_proposed: 'Çözüm önerildi', notified: 'Taraflara bildirildi',
  appealed: 'İtiraz edildi', closed: 'Kapandı', dismissed: 'Kapatıldı',
};

const categoryLabels: Record<string, string> = {
  quality: 'İşçilik kalitesi', scope: 'Kapsam uyuşmazlığı', payment: 'Ödeme sorunu',
  conduct: 'Davranış ve iletişim', damage: 'Hasar bildirimi', other: 'Diğer',
};

export default async function DisputeOperationsPage({ searchParams }: { searchParams?: Promise<{ page?: string }> } = {}) {
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
  const active = disputes.filter(item => !['closed', 'dismissed'].includes(item.status)).length;
  const overdue = disputes.filter(item => !['closed', 'dismissed'].includes(item.status) && disputeSlaState(item.sla_due_at) === 'overdue').length;
  const appeals = disputes.filter(item => item.status === 'appealed').length;
  const totalCount = count ?? disputes.length;

  return (
    <main className={styles.operationsPage}>
      <RealtimeRefresh channelName="admin-dispute-queue" subscriptions={[{ table: 'dispute_cases' }]} label="Uyuşmazlık kuyruğu" />
      <Link className={styles.backLink} href="/yonetim/usta-basvurulari">← Yönetim ana sayfası</Link>
      <header className={styles.pageHeader}>
        <h1>Uyuşmazlık merkezi</h1>
        <p>Süresi yaklaşan dosyaları önce ele alın; kanıt, taraf yanıtı ve karar iletişimini aynı kayıt üzerinden yönetin.</p>
      </header>
      <AdminOperationsNav active="disputes" disputeCount={totalCount} />

      {error ? (
        <section className={styles.statePanel} role="alert">
          <h2>Uyuşmazlık kuyruğu yüklenemedi</h2>
          <p>Bağlantıyı kontrol edip yeniden deneyin. Var olan dosyalarda herhangi bir değişiklik yapılmadı.</p>
          <RetryButton />
        </section>
      ) : (
        <>
          <section className={styles.summaryStrip} aria-label="Kuyruk özeti">
            <div className={styles.summaryItem}><span>Aktif dosya</span><strong>{active}</strong></div>
            <div className={styles.summaryItem} data-tone={overdue ? 'danger' : undefined}><span>Süresi geçen</span><strong>{overdue}</strong></div>
            <div className={styles.summaryItem}><span>İtiraz bekleyen</span><strong>{appeals}</strong></div>
          </section>
          {disputes.length ? (
            <>
              <section className={styles.queueList} aria-label="Uyuşmazlık dosyaları">
                {disputes.map(item => {
                  const sla = disputeSlaState(item.sla_due_at);
                  return (
                    <Link className={styles.queueRow} href={`/yonetim/uyusmazliklar/${item.id}`} key={item.id}>
                      <div className={styles.queueBody}>
                        <div className={styles.queueMeta}>
                          <span className={styles.statusText}>{labels[item.status] ?? item.status}</span>
                          <time className={styles.queueDate}>{new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' }).format(new Date(item.created_at))}</time>
                        </div>
                        <h2>{categoryLabels[item.category] ?? item.category}</h2>
                        <p>{item.description}</p>
                      </div>
                      <div className={styles.deadline} data-state={sla}>
                        <strong>{sla === 'overdue' ? 'Süresi geçti' : sla === 'due_soon' ? 'Süre yaklaşıyor' : 'Süre içinde'}</strong>
                        <time>{new Intl.DateTimeFormat('tr-TR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.sla_due_at))}</time>
                      </div>
                    </Link>
                  );
                })}
              </section>
              <div className={styles.pagination}><Pagination page={page} total={totalCount} pageSize={pageSize} path="/yonetim/uyusmazliklar" /></div>
            </>
          ) : (
            <section className={styles.statePanel}>
              <h2>İncelenecek uyuşmazlık yok</h2>
              <p>Yeni dosyalar son işlem sürelerine göre burada sıralanacak.</p>
            </section>
          )}
        </>
      )}
    </main>
  );
}
