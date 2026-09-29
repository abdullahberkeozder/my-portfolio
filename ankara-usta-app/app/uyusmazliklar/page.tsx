import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { disputeSlaState } from '../domain';
import { createSupabaseServerClient } from '../lib/supabase/server';
import styles from './disputeList.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Uyuşmazlıklar ve Hakemlik Dosyaları · Orkestra',
  description: 'Açık ve tamamlanmış uyuşmazlık dosyalarınızı, sunulan kanıtları ve hakem heyeti kararlarını inceleyin.',
};

const statusLabels: Record<string, string> = {
  opened: 'Açıldı',
  triage: 'Ön Değerlendirme',
  awaiting_evidence: 'Kanıt Bekleniyor',
  counterparty_response: 'Karşı Taraf Yanıtı',
  investigation: 'İnceleniyor',
  resolution_proposed: 'Çözüm Önerildi',
  notified: 'Taraflara Bildirildi',
  appealed: 'İtiraz Edildi',
  closed: 'Çözümlendi',
  dismissed: 'Kapatıldı',
};

const categoryLabels: Record<string, string> = {
  quality: 'İşçilik Kalitesi',
  scope: 'Kapsam Uyuşmazlığı',
  payment: 'Ödeme Sorunu',
  conduct: 'Davranış & İletişim',
  damage: 'Hasar Bildirimi',
  other: 'Diğer',
};

export default async function DisputesIndexPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/giris?next=/uyusmazliklar');
  }

  const { data, error } = await supabase
    .from('dispute_cases')
    .select('id,job_id,category,description,status,sla_due_at,created_at')
    .order('created_at', { ascending: false });

  const disputes = data ?? [];
  const activeDisputes = disputes.filter(d => !['closed', 'dismissed'].includes(d.status));
  const resolvedDisputes = disputes.filter(d => ['closed', 'dismissed'].includes(d.status));

  return (
    <div className={styles.pageShell}>
      <header className={styles.hero}>
        <div className={styles.container}>
          <Link href="/islerim" className={styles.backLink}>
            ← İşlerim Ekranına Dön
          </Link>
          <span className={styles.heroEyebrow}>GÜVENLİK VE ADİL HAKEMLİK</span>
          <h1 className={styles.heroTitle}>Uyuşmazlık Dosyalarınız</h1>
          <p className={styles.heroLead}>
            İş sürecinde mutabakat sağlanamayan durumlarda açılan hakemlik dosyalarını,
            sunulan kanıtları ve bağımsız platform heyetinin aldığı kararları buradan takip edebilirsiniz.
          </p>
        </div>
      </header>

      <main className={styles.container}>
        <section className={styles.summaryCardsRow} aria-label="Dosya İstatistikleri">
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Aktif İnceleme</span>
            <span className={styles.summaryValue}>{activeDisputes.length}</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Çözümlenen / Kapanan</span>
            <span className={styles.summaryValue}>{resolvedDisputes.length}</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Toplam Dosya</span>
            <span className={styles.summaryValue}>{disputes.length}</span>
          </div>
        </section>

        {error ? (
          <div className={styles.emptyState} role="alert">
            <div className={styles.emptyIcon}>⚠️</div>
            <h2 className={styles.emptyTitle}>Dosyalar Yüklenemedi</h2>
            <p className={styles.emptyDesc}>Bağlantı sağlanırken bir sorun oluştu. Lütfen sayfayı yenileyiniz.</p>
          </div>
        ) : disputes.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🛡️</div>
            <h2 className={styles.emptyTitle}>Aktif Bir Uyuşmazlığınız Bulunmuyor</h2>
            <p className={styles.emptyDesc}>
              Tüm işleriniz normal garanti ve onay süreçleriyle devam etmektedir. Bir problem yaşadığınızda
              iş odası Güven Merkezi sekmesinden resmi hakemlik başvurusu yapabilirsiniz.
            </p>
            <Link href="/islerim" className={styles.emptyCta}>
              İşlerimi Görüntüle →
            </Link>
          </div>
        ) : (
          <section className={styles.disputeListGrid} aria-label="Uyuşmazlık Dosyaları">
            {disputes.map(item => {
              const isClosed = ['closed', 'dismissed'].includes(item.status);
              const sla = disputeSlaState(item.sla_due_at);
              const statusText = statusLabels[item.status] ?? item.status;
              const categoryText = categoryLabels[item.category] ?? item.category;

              return (
                <article key={item.id} className={styles.disputeCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.headerLeft}>
                      <span
                        className={`${styles.statusBadge} ${isClosed ? styles.statusClosed : styles.statusActive}`}
                      >
                        {statusText}
                      </span>
                      <span className={styles.categoryTag}>{categoryText}</span>
                    </div>
                    <time className={styles.disputeDate}>
                      {new Intl.DateTimeFormat('tr-TR', {
                        dateStyle: 'medium',
                      }).format(new Date(item.created_at))}
                    </time>
                  </div>

                  <h2 className={styles.disputeTitle}>
                    {categoryText} · Dosya #{item.id.slice(0, 8)}
                  </h2>
                  <p className={styles.disputeDesc}>{item.description}</p>

                  <div className={styles.cardFooter}>
                    <div className={styles.slaBox}>
                      {!isClosed && (
                        <>
                          <span
                            className={
                              sla === 'overdue'
                                ? styles.slaOverdue
                                : sla === 'due_soon'
                                ? styles.slaSoon
                                : styles.slaOk
                            }
                          >
                            ● {sla === 'overdue' ? 'SLA Gecikti' : sla === 'due_soon' ? 'SLA Yaklaşıyor' : 'SLA İçinde'}
                          </span>
                          <span>
                            (Son işlem:{' '}
                            {new Intl.DateTimeFormat('tr-TR', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            }).format(new Date(item.sla_due_at))}
                            )
                          </span>
                        </>
                      )}
                      {isClosed && <span>Dosya karara bağlandı.</span>}
                    </div>

                    <Link href={`/uyusmazliklar/${item.id}`} className={styles.actionBtn}>
                      Dosyayı ve Kanıtları Aç →
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
