'use client';

import { useEffect, useId, useRef } from 'react';
import Link from 'next/link';
import type { ComparableQuote } from './QuoteComparison';
import styles from './quoteAccept.module.css';

const money = (value: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value / 100);

export default function QuoteAcceptDialog({ quote, busy, stale, error, onClose, onAccept }: {
  quote: ComparableQuote; busy: boolean; stale: boolean; error: string;
  onClose: () => void; onAccept: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    cancelButton.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  return <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId} aria-describedby={descriptionId}
    onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <div className={styles.content}>
      <p>TEKLİF ONAYI · SÜRÜM {quote.version}</p>
      <h2 id={titleId}>{quote.tradespersonName} ile anlaşmayı onaylayın</h2>
      <p id={descriptionId}>Bu sürümün şartları sabitlenir ve yalnız bu ustayla iş oluşturulur. Diğer teklifler kapanır. Bu adım ödeme almaz veya randevu saati belirlemez.</p>
      <dl className={styles.terms}>
        <div><dt>İşçilik</dt><dd>{money(quote.laborAmountKurus)}</dd></div>
        <div><dt>Malzeme bedeli</dt><dd>{money(quote.materialAmountKurus)}</dd></div>
        <div><dt>Toplam</dt><dd><strong>{money(quote.laborAmountKurus + quote.materialAmountKurus)}</strong></dd></div>
        <div><dt>Tahmini süre</dt><dd>{quote.estimatedDurationMinutes} dakika</dd></div>
        <div><dt>İşçilik garantisi</dt><dd>{quote.warrantyDays} gün</dd></div>
      </dl>
      <h3>Dahil kapsam</h3><ul>{quote.includedScope.map((item, index) => <li key={index}>{item}</li>)}</ul>
      <h3>Hariç kapsam</h3>{quote.excludedScope.length ? <ul>{quote.excludedScope.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p>Açık hariç kapsam belirtilmedi.</p>}
      {quote.note && <><h3>Usta notu</h3><p>{quote.note}</p></>}
      {stale && <p role="alert">Teklif veya talep durumu değişti. Kapatıp güncel şartları tekrar inceleyin.</p>}
      {error && <p role="alert">{error}</p>}
      {error && <Link href="/islerim">İşlerimi kontrol et</Link>}
    </div>
    <div className={styles.actions}>
      <button ref={cancelButton} type="button" className="wizard-secondary" disabled={busy} onClick={onClose}>Vazgeç</button>
      <button type="button" className="dialog-primary" disabled={busy || stale} onClick={onAccept}>{busy ? 'Kabul ediliyor…' : 'Şartları onayla ve kabul et'}</button>
    </div>
  </dialog>;
}
