'use client';

import styles from './discoveryGridSkeleton.module.css';

export default function DiscoveryGridSkeleton({ ariaLabel = 'İçerik yükleniyor…' }: { ariaLabel?: string }) {
  return (
    <section className={styles.shell} role="status" aria-busy="true" aria-label={ariaLabel}>
      <span className="sr-only">{ariaLabel}</span>
      <div className={styles.hero} aria-hidden="true"><span /><span /><span /></div>
      <div className={styles.grid} aria-hidden="true">
        {Array.from({ length: 6 }).map((_, index) => <article className={styles.card} key={index}><div className={styles.image} /><div className={styles.line} /><div className={styles.shortLine} /></article>)}
      </div>
    </section>
  );
}

