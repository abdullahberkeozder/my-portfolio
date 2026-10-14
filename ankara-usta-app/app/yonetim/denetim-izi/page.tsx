import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AdminOperationsNav from '../../components/AdminOperationsNav';
import Pagination from '../../components/Pagination';
import styles from '../../components/operationsWorkspace.module.css';
import { getServerUserAndRoles } from '../../lib/authServer';
import { createSupabaseServerClient } from '../../lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Denetim İzi · Orkestra Yönetim',
  description: 'Yönetici kararları, doğrulamalar ve sistem olaylarının değiştirilemez denetim kayıtları.',
};

type AuditLogRow = {
  id: number; actor_id: string | null; actor_type: 'user' | 'system'; action: string;
  entity_type: string; entity_id: string; before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null; created_at: string;
};

const entityTypeLabels: Record<string, string> = {
  tradesperson_profiles: 'Usta profili', tradesperson_documents: 'Mesleki veya kimlik belgesi',
  tradesperson_references: 'Usta referansı', dispute: 'Uyuşmazlık dosyası',
  work_log_entry: 'İş günlüğü kanıtı', review: 'Müşteri değerlendirmesi',
};
const filterTabs = [
  { id: 'all', label: 'Tümü' }, { id: 'tradesperson_profiles', label: 'Usta profilleri' },
  { id: 'tradesperson_documents', label: 'Belgeler' }, { id: 'tradesperson_references', label: 'Referanslar' },
  { id: 'dispute', label: 'Uyuşmazlıklar' },
];

export default async function AdminAuditLogPage({ searchParams }: { searchParams?: Promise<{ page?: string; entity?: string }> } = {}) {
  const { user, roles } = await getServerUserAndRoles();
  if (!user) redirect('/giris?next=/yonetim/denetim-izi');
  if (!roles.includes('admin') && !roles.includes('moderator')) redirect('/');

  const resolvedParams = await searchParams;
  const rawPage = Number.parseInt(resolvedParams?.page ?? '1', 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const requestedEntity = resolvedParams?.entity ?? 'all';
  const activeEntity = filterTabs.some(tab => tab.id === requestedEntity) ? requestedEntity : 'all';
  const pageSize = 15;
  const supabase = await createSupabaseServerClient();
  let query = supabase.from('admin_audit_log').select(
    'id,actor_id,actor_type,action,entity_type,entity_id,before_data,after_data,created_at', { count: 'exact' }
  );
  if (activeEntity !== 'all') query = query.eq('entity_type', activeEntity);
  const { data, count, error } = await query.order('created_at', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
  const logs = (data ?? []) as unknown as AuditLogRow[];
  const totalCount = count ?? logs.length;

  return (
    <main className={styles.operationsPage}>
      <Link className={styles.backLink} href="/yonetim/usta-basvurulari">← Yönetim ana sayfası</Link>
      <header className={styles.pageHeader}>
        <h1>Değiştirilemez denetim izi</h1>
        <p>Kim, ne zaman, hangi kayıtta ve hangi gerekçeyle değişiklik yaptı sorularının yanıtını kronolojik olarak inceleyin.</p>
      </header>
      <AdminOperationsNav active="audit" />

      <section className={styles.filterBar} aria-label="Denetim kaydı filtreleri">
        <div className={styles.filterLinks}>
          {filterTabs.map(tab => {
            const href = tab.id === 'all' ? '/yonetim/denetim-izi' : `/yonetim/denetim-izi?entity=${tab.id}`;
            return <Link key={tab.id} href={href} className={styles.filterLink} aria-current={activeEntity === tab.id ? 'page' : undefined}>{tab.label}</Link>;
          })}
        </div>
        <span className={styles.resultCount}>{totalCount} kayıt</span>
      </section>

      {error ? (
        <section className={styles.statePanel} role="alert">
          <h2>Denetim kayıtları yüklenemedi</h2>
          <p>Bağlantıyı kontrol edip sayfayı yenileyin. Denetim kayıtlarında değişiklik yapılmadı.</p>
        </section>
      ) : logs.length === 0 ? (
        <section className={styles.statePanel}>
          <h2>Bu filtrede kayıt yok</h2>
          <p>Seçilen kayıt türünde henüz bir yönetim veya sistem olayı gerçekleşmedi.</p>
        </section>
      ) : (
        <>
          <section className={styles.auditList} aria-label="Denetim kayıtları">
            {logs.map(log => {
              const entityTitle = entityTypeLabels[log.entity_type] ?? log.entity_type;
              const note = (log.after_data?.review_note as string | undefined) ?? (log.after_data?.reason as string | undefined) ?? (log.after_data?.customer_explanation as string | undefined);
              const statusBefore = (log.before_data?.application_status as string | undefined) ?? (log.before_data?.status as string | undefined);
              const statusAfter = (log.after_data?.application_status as string | undefined) ?? (log.after_data?.status as string | undefined);
              return (
                <article key={log.id} className={styles.auditRow}>
                  <div className={styles.auditWhen}>
                    <span className={styles.actor}>{log.actor_type === 'system' ? 'Sistem' : `Yönetici (${log.actor_id?.slice(0, 8) ?? 'Bilinmeyen'})`}</span>
                    <time>{new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(log.created_at))}</time>
                  </div>
                  <div className={styles.auditBody}>
                    <div className={styles.auditHeading}>
                      <span className={styles.auditAction}>{log.action}</span>
                      <span className={styles.auditEntity}>{entityTitle}</span>
                      <span className={styles.auditTarget}>Kayıt {log.entity_id.slice(0, 16)}</span>
                    </div>
                    {note ? <p className={styles.auditReason}><strong>Gerekçe:</strong> {note}</p> : null}
                    {statusBefore || statusAfter ? <p className={styles.changeLine}>Durum: <strong>{statusBefore ?? 'Yok'}</strong> → <strong>{statusAfter ?? 'Yok'}</strong></p> : null}
                  </div>
                </article>
              );
            })}
          </section>
          <div className={styles.pagination}>
            <Pagination page={page} total={totalCount} pageSize={pageSize} path={activeEntity !== 'all' ? `/yonetim/denetim-izi?entity=${activeEntity}` : '/yonetim/denetim-izi'} />
          </div>
        </>
      )}
    </main>
  );
}
