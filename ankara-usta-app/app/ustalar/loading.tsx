import styles from './directory.module.css';

export default function UstalarLoading() {
  return <main className={styles.containerSplit} role="status" aria-busy="true" aria-label="Ankara zanaatkâr dizini ve haritası yükleniyor…"><span className="sr-only">Ankara zanaatkâr dizini ve haritası yükleniyor…</span><div className="directory-loading-grid" aria-hidden="true">{Array.from({ length: 4 }).map((_, index) => <article className="directory-loading-card" data-testid="directory-card-skeleton" key={index}><div /><span /><span /><small /></article>)}</div><div className="directory-loading-map" aria-hidden="true" /></main>;
}
