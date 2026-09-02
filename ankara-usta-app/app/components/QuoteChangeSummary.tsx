import {quoteChanges,type QuoteTerms} from '../domain/quoteRevision';
import styles from './quoteRevision.module.css';
export default function QuoteChangeSummary({before,after}:{before:QuoteTerms;after:QuoteTerms}){
  const changes=quoteChanges(before,after);
  return <section className={styles.summary} aria-label="Teklif değişiklik özeti"><h2>Ne değişti?</h2>{changes.length?<dl>{changes.map(change=><div key={change.label}><dt>{change.label}</dt><dd><span><small>Önce</small>{change.before}</span><span><small>Şimdi</small>{change.after}</span></dd></div>)}</dl>:<p>Önceki sürüme göre koşullar değişmedi.</p>}</section>;
}
