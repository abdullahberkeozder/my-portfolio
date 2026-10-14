import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import styles from '../components/operationsWorkspace.module.css';
import { disputeSlaState } from '../domain';
import { createSupabaseServerClient } from '../lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Uyuşmazlık Dosyalarım · Orkestra',
  description: 'Açık ve tamamlanmış uyuşmazlık dosyalarınızı, kanıtları ve kararları inceleyin.',
};

const statusLabels: Record<string, string> = {
  opened: 'Açıldı', triage: 'Ön değerlendirme', awaiting_evidence: 'Kanıt bekleniyor',
  counterparty_response: 'Karşı taraf yanıtı', investigation: 'İnceleniyor',
  resolution_proposed: 'Çözüm önerildi', notified: 'Taraflara bildirildi',
  appealed: 'İtiraz edildi', closed: 'Çözümlendi', dismissed: 'Kapatıldı',
};
const categoryLabels: Record<string, string> = {
  quality: 'İşçilik kalitesi', scope: 'Kapsam uyuşmazlığı', payment: 'Ödeme sorunu',
  conduct: 'Davranış ve iletişim', damage: 'Hasar bildirimi', other: 'Diğer',
};

export default async function DisputesIndexPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/giris?next=/uyusmazliklar');

  const { data, error } = await supabase.from('dispute_cases')
    .select('id,job_id,category,description,status,sla_due_at,created_at')
    .order('created_at', { ascending: false });
  const disputes = data ?? [];
  const active = disputes.filter(item => !['closed', 'dismissed'].includes(item.status)).length;
  const resolved = disputes.length - active;

  return (
    <main className={styles.operationsPage}>
      <Link className={styles.backLink} href="/islerim">← İşlerim</Link>
      <header className={styles.pageHeader}>
        <h1>Uyuşmazlık dosyalarınız</h1>
        <p>Beklenen adımı, gönderilen kanıtları ve size iletilen kararları her dosyada birlikte takip edin.</p>
      </header>

      {!error ? <section className={styles.summaryStrip} aria-label="Dosya özeti">
        <div className={styles.summaryItem}><span>Aktif inceleme</span><strong>{active}</strong></div>
        <div className={styles.summaryItem}><span>Çözümlenen veya kapanan</span><strong>{resolved}</strong></div>
        <div className={styles.summaryItem}><span>Toplam dosya</span><strong>{disputes.length}</strong></div>
      </section> : null}

      {error ? (
        <section className={styles.statePanel} role="alert">
          <h2>Dosyalar yüklenemedi</h2>
          <p>Bağlantı kurulamadı. Girdileriniz etkilenmedi; sayfayı yenileyerek yeniden deneyin.</p>
        </section>
      ) : disputes.length === 0 ? (
        <section className={styles.statePanel}>
          <h2>Aktif bir uyuşmazlığınız bulunmuyor</h2>
          <p>Bir işle ilgili sorun yaşarsanız ilgili işin güven bölümünden uyuşmazlık dosyası açabilirsiniz.</p>
          <Link className={styles.stateAction} href="/islerim">İşlerimi görüntüle →</Link>
        </section>
      ) : (
        <section className={styles.queueList} aria-label="Uyuşmazlık dosyaları">
          {disputes.map(item => {
            const closed = ['closed', 'dismissed'].includes(item.status);
            const sla = disputeSlaState(item.sla_due_at);
            const category = categoryLabels[item.category] ?? item.category;
            return (
              <Link className={styles.queueRow} href={`/uyusmazliklar/${item.id}`} key={item.id}>
                <div className={styles.queueBody}>
                  <div className={styles.queueMeta}>
                    <span className={styles.statusText}>{statusLabels[item.status] ?? item.status}</span>
                    <time className={styles.queueDate}>{new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' }).format(new Date(item.created_at))}</time>
                  </div>
                  <h2>{category} · Dosya #{item.id.slice(0, 8)}</h2>
                  <p>{item.description}</p>
                </div>
                <div className={styles.deadline} data-state={closed ? undefined : sla}>
                  <strong>{closed ? 'Karara bağlandı' : sla === 'overdue' ? 'Süre aşıldı' : sla === 'due_soon' ? 'Süre yaklaşıyor' : 'İnceleme sürüyor'}</strong>
                  {!closed ? <time>{new Intl.DateTimeFormat('tr-TR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.sla_due_at))}</time> : null}
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </main>
  );
}
