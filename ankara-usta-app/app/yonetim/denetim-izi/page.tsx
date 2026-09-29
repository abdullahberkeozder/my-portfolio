import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import Pagination from '../../components/Pagination';
import { getServerUserAndRoles } from '../../lib/authServer';
import { createSupabaseServerClient } from '../../lib/supabase/server';
import styles from './auditLog.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Denetim İzi (Audit Log) · Orkestra Yönetim',
  description: 'Tüm yönetici kararları, usta incelemeleri, belge doğrulamaları ve sistem olaylarının değiştirilemez denetim kayıtları.',
};

type AuditLogRow = {
  id: number;
  actor_id: string | null;
  actor_type: 'user' | 'system';
  action: string;
  entity_type: string;
  entity_id: string;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  created_at: string;
};

const entityTypeLabels: Record<string, string> = {
  tradesperson_profiles: 'Usta Başvurusu / Profili',
  tradesperson_documents: 'Mesleki / Kimlik Belgesi',
  tradesperson_references: 'Usta Referansı',
  dispute: 'Uyuşmazlık Hakem Dosyası',
  work_log_entry: 'İş Günlüğü / Kanıt Görseli',
  review: 'Müşteri Değerlendirmesi',
};

const filterTabs = [
  { id: 'all', label: 'Tümü' },
  { id: 'tradesperson_profiles', label: 'Usta Profilleri' },
  { id: 'tradesperson_documents', label: 'Belgeler (MYK/Kimlik)' },
  { id: 'tradesperson_references', label: 'Referanslar' },
  { id: 'dispute', label: 'Uyuşmazlıklar' },
];

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; entity?: string }>;
} = {}) {
  const { user, roles } = await getServerUserAndRoles();
  if (!user) redirect('/giris?next=/yonetim/denetim-izi');
  if (!roles.includes('admin') && !roles.includes('moderator')) redirect('/');

  const resolvedParams = await searchParams;
  const rawPage = Number.parseInt(resolvedParams?.page ?? '1', 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const activeEntity = resolvedParams?.entity ?? 'all';
  const pageSize = 15;

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('admin_audit_log')
    .select('id,actor_id,actor_type,action,entity_type,entity_id,before_data,after_data,created_at', {
      count: 'exact',
    });

  if (activeEntity !== 'all') {
    query = query.eq('entity_type', activeEntity);
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const logs = (data ?? []) as unknown as AuditLogRow[];
  const totalCount = count ?? logs.length;

  return (
    <div className={styles.pageShell}>
      <div className={styles.container}>
        <Link className={styles.backLink} href="/yonetim/usta-basvurulari">
          ← Yönetim Paneline Dön
        </Link>

        <header className={styles.header}>
          <span className={styles.eyebrow}>GÜVENLİK VE UYUMLULUK</span>
          <h1 className={styles.title}>Değiştirilemez Denetim İzi (Audit Log)</h1>
          <p className={styles.lead}>
            Usta onayları, belge kararları, yaptırımlar ve uyuşmazlık müdahaleleri KVKK ve yasal uyumluluk gereği
            PostgreSQL düzeyinde değiştirilemez olarak kaydedilmektedir.
          </p>
        </header>

        {/* Global Admin Navigation Tabs */}
        <nav className={styles.adminTabs} aria-label="Yönetim Sekmeleri">
          <Link href="/yonetim/usta-basvurulari" className={styles.tabLink}>
            Usta Başvuruları
          </Link>
          <Link href="/yonetim/moderasyon" className={styles.tabLink}>
            İçerik Moderasyonu
          </Link>
          <Link href="/yonetim/uyusmazliklar" className={styles.tabLink}>
            Uyuşmazlıklar
          </Link>
          <Link href="/yonetim/denetim-izi" className={`${styles.tabLink} ${styles.tabLinkActive}`}>
            Denetim İzi (Audit Log)
          </Link>
        </nav>

        {/* Entity Type Filter Bar */}
        <section className={styles.filterBar} aria-label="Filtreleme Çubuğu">
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Varlık Türü:</span>
            {filterTabs.map(tab => {
              const isActive = activeEntity === tab.id;
              const href = tab.id === 'all' ? '/yonetim/denetim-izi' : `/yonetim/denetim-izi?entity=${tab.id}`;
              return (
                <Link
                  key={tab.id}
                  href={href}
                  className={`${styles.filterChip} ${isActive ? styles.filterChipActive : ''}`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
          <span className={styles.totalBadge}>Toplam {totalCount} Olay</span>
        </section>

        {/* Audit Log Content */}
        {error ? (
          <div className={styles.emptyState} role="alert">
            <div className={styles.emptyIcon}>⚠️</div>
            <h2 className={styles.emptyTitle}>Denetim Kayıtları Yüklenemedi</h2>
            <p className={styles.emptyDesc}>Veritabanı bağlantısını kontrol edip sayfayı yenileyiniz.</p>
          </div>
        ) : logs.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🛡️</div>
            <h2 className={styles.emptyTitle}>Kayıt Bulunmuyor</h2>
            <p className={styles.emptyDesc}>Seçilen filtre için henüz bir denetim olayı gerçekleşmedi.</p>
          </div>
        ) : (
          <>
            <section className={styles.logList} aria-label="Denetim Kayıtları Listesi">
              {logs.map(log => {
                const isSystem = log.actor_type === 'system';
                const entityTitle = entityTypeLabels[log.entity_type] ?? log.entity_type;
                const note =
                  (log.after_data?.review_note as string | undefined) ??
                  (log.after_data?.reason as string | undefined) ??
                  (log.after_data?.customer_explanation as string | undefined);

                const statusBefore =
                  (log.before_data?.application_status as string | undefined) ??
                  (log.before_data?.status as string | undefined);
                const statusAfter =
                  (log.after_data?.application_status as string | undefined) ??
                  (log.after_data?.status as string | undefined);

                return (
                  <article key={log.id} className={styles.logCard}>
                    <div className={styles.cardTop}>
                      <div className={styles.actorBadge}>
                        <span className={isSystem ? styles.actorSystem : styles.actorUser}>
                          {isSystem ? '🤖 Sistem (Otomatik Görev)' : `👤 Yönetici (${log.actor_id?.slice(0, 8) ?? 'Bilinmeyen'})`}
                        </span>
                      </div>
                      <time className={styles.timestamp}>
                        {new Intl.DateTimeFormat('tr-TR', {
                          dateStyle: 'medium',
                          timeStyle: 'medium',
                        }).format(new Date(log.created_at))}
                      </time>
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.actionTitleRow}>
                        <span
                          className={`${styles.actionTag} ${
                            log.action.includes('INSERT')
                              ? styles.actionInsert
                              : log.action.includes('UPDATE')
                              ? styles.actionUpdate
                              : styles.actionSpecial
                          }`}
                        >
                          {log.action}
                        </span>
                        <span className={styles.entityInfo}>
                          {entityTitle} · Hedef: <code>{log.entity_id.slice(0, 16)}</code>
                        </span>
                      </div>

                      {note && <div className={styles.reasonNote}>💬 <strong>Gerekçe:</strong> {note}</div>}

                      {(statusBefore || statusAfter) && (
                        <div className={styles.diffSummary}>
                          <span className={styles.diffPill}>
                            Durum Geçişi: <strong>{statusBefore ?? 'Yok'}</strong> → <strong>{statusAfter ?? 'Yok'}</strong>
                          </span>
                          {log.after_data?.expires_at ? (
                            <span className={styles.diffPill}>
                              📅 Son Geçerlilik: <strong>{String(log.after_data.expires_at)}</strong>
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </section>

            <div className={styles.paginationWrapper}>
              <Pagination
                page={page}
                total={totalCount}
                pageSize={pageSize}
                path={activeEntity !== 'all' ? `/yonetim/denetim-izi?entity=${activeEntity}` : '/yonetim/denetim-izi'}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
