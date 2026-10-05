import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ankaraRepresentativeShops } from '../../../../data/ankaraMapGeo';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Usta profili | Orkestra',
  robots: { index: false, follow: false },
};

export default async function ConceptProfessionalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shop = ankaraRepresentativeShops.find((item) => item.id === id);
  if (!shop) notFound();

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link href="/concepts/harita?view=list" className={styles.back}>← Usta listesine dön</Link>
        <header className={styles.header}>
          <span className={styles.kicker}>ANKARA USTA AĞI · PROFİL</span>
          <h1>{shop.ownerName.replace(/\s*\([^)]*\)/g, '').trim()}</h1>
          <p>{shop.name}</p>
        </header>

        <section className={styles.grid} aria-label="Usta özeti">
          <article className={styles.card}>
            <span className={styles.label}>Uzmanlık</span>
            <strong>{shop.category}</strong>
            <span>{shop.neighborhood}, {shop.district} · Ankara</span>
          </article>
          <article className={styles.card}>
            <span className={styles.label}>Güven sinyali</span>
            <strong>★ {shop.rating.toFixed(1)}</strong>
            <span>{shop.reviewCount} tamamlanan iş</span>
          </article>
        </section>

        <section className={styles.actionCard}>
          <div>
            <span className={styles.label}>Bir sonraki adım</span>
            <h2>İşinizi anlatın, uygun hizmeti birlikte netleştirelim.</h2>
            <p>Bu tasarım profili, talep akışına geçmeden önce ustanın uzmanlığını ve bölgesini hızlıca anlamanız için hazırlanmıştır.</p>
          </div>
          <Link href="/#services" className={styles.primaryAction}>Talep oluşturmaya başla →</Link>
        </section>
      </div>
    </main>
  );
}
