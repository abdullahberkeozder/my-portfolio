import styles from './wizardStepSkeleton.module.css';

export default function WizardStepSkeleton({ step = 0 }: { step?: number }) {
  return (
    <section className={styles.shell} role="status" aria-busy="true" aria-label={`Talep aşaması ${step + 1} yükleniyor`}>
      <span className="sr-only">Talep aşaması yükleniyor, lütfen bekleyin…</span>
      <div className={styles.kicker} aria-hidden="true" />
      <div className={styles.title} aria-hidden="true" />
      <div className={styles.copy} aria-hidden="true" />
      <div className={styles.options} aria-hidden="true">
        {Array.from({ length: 3 }).map((_, index) => <div className={styles.option} key={index} />)}
      </div>
      <div className={styles.action} aria-hidden="true" />
    </section>
  );
}
