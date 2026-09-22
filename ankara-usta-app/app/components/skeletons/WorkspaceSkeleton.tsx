import React from 'react';
import styles from './workspaceSkeleton.module.css';

export interface WorkspaceSkeletonProps {
  title?: string;
  count?: number;
  role?: 'customer' | 'tradesperson' | 'jobs';
  ariaLabel?: string;
}

export default function WorkspaceSkeleton({
  title = 'Yükleniyor…',
  count = 3,
  ariaLabel,
}: WorkspaceSkeletonProps) {
  const accessibleLabel = ariaLabel ?? `${title} yükleniyor, lütfen bekleyin…`;

  return (
    <div
      className={styles.container}
      role="status"
      aria-busy="true"
      aria-label={accessibleLabel}
    >
      <span className="sr-only">{accessibleLabel}</span>
      <header className={styles.header}>
        <div className={`${styles.pulse} ${styles.titleSkeleton}`} />
        <div className={`${styles.pulse} ${styles.headerActionSkeleton}`} />
      </header>
      <div className={styles.list}>
        {Array.from({ length: count }).map((_, index) => (
          <article
            key={index}
            className={styles.card}
            data-testid="workspace-card-skeleton"
            aria-hidden="true"
          >
            <div className={styles.cardMain}>
              <div className={styles.cardTop}>
                <div className={`${styles.pulse} ${styles.badgeSkeleton}`} />
              </div>
              <div className={`${styles.pulse} ${styles.cardTitleSkeleton}`} />
              <div className={`${styles.pulse} ${styles.cardMetaSkeleton}`} />
            </div>
            <div className={styles.cardActionsCol}>
              <div className={`${styles.pulse} ${styles.timeSkeleton}`} />
              <div className={`${styles.pulse} ${styles.buttonSkeleton}`} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
