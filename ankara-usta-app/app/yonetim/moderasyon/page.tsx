import Link from 'next/link';
import { redirect } from 'next/navigation';
import AdminOperationsNav from '../../components/AdminOperationsNav';
import ModerationQueue from '../../components/ModerationQueue';
import RetryButton from '../../components/RetryButton';
import styles from '../../components/operationsWorkspace.module.css';
import { getServerUserAndRoles } from '../../lib/authServer';
import { createSupabaseServerClient } from '../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ModerationPage() {
  const { user, roles } = await getServerUserAndRoles();
  if (!user) redirect('/giris?next=/yonetim/moderasyon');
  if (!roles.includes('admin') && !roles.includes('moderator')) redirect('/');

  const supabase = await createSupabaseServerClient();
  const [mediaResult, reviewsResult, disputesResult] = await Promise.all([
    supabase.from('work_log_entries').select('id,kind,caption,storage_path,created_at').eq('moderation_status', 'pending').order('created_at'),
    supabase.from('reviews').select('id,rating,comment,created_at').eq('moderation_status', 'pending').order('created_at'),
    supabase.from('dispute_cases').select('id', { count: 'exact', head: true }).not('status', 'in', '(closed,dismissed)'),
  ]);

  const queryError = mediaResult.error ?? reviewsResult.error ?? disputesResult.error;
  const mediaItems = queryError ? [] : await Promise.all((mediaResult.data ?? []).map(async item => {
    const { data } = await supabase.storage.from('job-media').createSignedUrl(item.storage_path, 1800);
    return {
      id: item.id,
      entityType: 'work_log_entry' as const,
      title: item.kind === 'after' ? 'İş sonrası kanıtı' : 'İş günlüğü kanıtı',
      description: item.caption || 'Açıklama eklenmedi.',
      meta: new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' }).format(new Date(item.created_at)),
      previewUrl: data?.signedUrl ?? null,
    };
  }));
  const reviewItems = (reviewsResult.data ?? []).map(item => ({
    id: item.id,
    entityType: 'review' as const,
    title: `${item.rating}/5 müşteri değerlendirmesi`,
    description: item.comment || 'Metin yorumu bulunmuyor.',
    meta: 'Tamamlanmış işe bağlı değerlendirme',
  }));
  const items = [...mediaItems, ...reviewItems];

  return (
    <main className={styles.operationsPage}>
      <Link className={styles.backLink} href="/yonetim/usta-basvurulari">← Yönetim ana sayfası</Link>
      <header className={styles.pageHeader}>
        <h1>İçerik inceleme</h1>
        <p>İş kanıtlarını ve müşteri değerlendirmelerini yayınlanmadan önce bağlamı ve gerekçesiyle karara bağlayın.</p>
      </header>
      <AdminOperationsNav active="moderation" moderationCount={items.length} disputeCount={disputesResult.count ?? 0} />

      {queryError ? (
        <section className={styles.statePanel} role="alert">
          <h2>İnceleme kuyruğu yüklenemedi</h2>
          <p>Bağlantıyı kontrol edip yeniden deneyin. Kayıtlar boş kuyruk olarak işaretlenmedi.</p>
          <RetryButton />
        </section>
      ) : items.length ? (
        <>
          <div className={styles.moderationIntro}>
            <h2>Karar bekleyen içerikler</h2>
            <span>{items.length} kayıt</span>
          </div>
          <ModerationQueue items={items} />
        </>
      ) : (
        <section className={styles.statePanel}>
          <h2>İncelenecek içerik yok</h2>
          <p>Yeni iş görselleri ve değerlendirmeler gönderildiğinde bu kuyrukta görünecek.</p>
        </section>
      )}
    </main>
  );
}
