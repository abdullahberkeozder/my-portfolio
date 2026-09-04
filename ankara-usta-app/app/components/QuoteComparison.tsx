'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QuoteAcceptDialog from './QuoteAcceptDialog';

export type ComparableQuote = {
  id: string;
  tradespersonName: string;
  tradespersonId: string;
  status: string;
  version: number;
  laborAmountKurus: number;
  materialAmountKurus: number;
  estimatedDurationMinutes: number;
  warrantyDays: number;
  includedScope: string[];
  excludedScope: string[];
  note: string | null;
  detailHref?: string;
};

const money = (kurus: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(kurus / 100);

const professionalKey = (quote: ComparableQuote) => quote.tradespersonId;

export default function QuoteComparison({ quotes: inputQuotes, currentUserId, canAccept = true }: {
  quotes: ComparableQuote[]; currentUserId: string; canAccept?: boolean;
}) {
  const router = useRouter();
  // Keep only the latest version per professional; selection survives a new ID.
  const latest = new Map<string, ComparableQuote>();
  for (const quote of inputQuotes) {
    const prior = latest.get(professionalKey(quote));
    if (!prior || prior.version < quote.version) latest.set(professionalKey(quote), quote);
  }
  const quotes = [...latest.values()];
  const [selected, setSelected] = useState(quotes.slice(0, 3).map(professionalKey));
  const activeSelection = selected.filter(id => latest.has(id)).slice(0, 3);
  const [busy, setBusy] = useState('');
  const inFlight = useRef(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [confirmQuote, setConfirmQuote] = useState<ComparableQuote | null>(null);
  const current = confirmQuote ? latest.get(professionalKey(confirmQuote)) : null;
  const stale = !canAccept || !current || current.id !== confirmQuote?.id || current.status !== 'submitted';

  function toggle(id: string) {
    setSelected(current => {
      const retained = current.filter(key => latest.has(key)).slice(0, 3);
      return retained.includes(id) ? retained.filter(item => item !== id)
        : retained.length < 3 ? [...retained, id] : retained;
    });
  }

  async function executeAccept(quote: ComparableQuote) {
    if (inFlight.current || stale || accepted) return;
    inFlight.current = true;
    setBusy(quote.id);
    setError('');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`/api/quotes/${quote.id}/accept`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expectedUserId: currentUserId }), signal: controller.signal,
      });
      const body = (await response.json()) as { error?: string; accepted?: boolean; jobId?: string | null };
      if (!response.ok || !body.accepted) {
        setError(body.error ?? 'Kabul sonucu doğrulanamadı. İşlerinizi kontrol edin veya aynı teklifi yeniden deneyin.');
        router.refresh();
        return;
      }
      setAccepted(true);
      setConfirmQuote(null);
      setMessage(`${quote.tradespersonName} ustanın teklifi kabul edildi.`);
      if (body.jobId) router.push(`/islerim/${body.jobId}`);
      router.refresh();
    } catch {
      setError('Yanıt alınamadı; işlem gerçekleşmiş olabilir. Aynı teklifi yeniden deneyebilir veya işlerinizi kontrol edebilirsiniz.');
    } finally {
      clearTimeout(timeout);
      inFlight.current = false;
      setBusy('');
    }
  }

  const compared = quotes.filter(quote => activeSelection.includes(professionalKey(quote)));

  // Compute objective highlights
  const minTotal = compared.length > 1
    ? Math.min(...compared.map(q => q.laborAmountKurus + q.materialAmountKurus))
    : null;
  const maxWarranty = compared.length > 1
    ? Math.max(...compared.map(q => q.warrantyDays))
    : null;

  return (
    <section className="quote-comparison-wrapper">
      <div className="comparison-picker-bar">
        <div className="picker-info">
          <span className="picker-kicker">TEKLİF KIYASLAMA</span>
          <h3>Gelen Teklifleri Karşılaştırın</h3>
          <p>Masaüstünde satır bazlı matris üzerinden işçilik, malzeme, süre ve garanti farklarını inceleyin (en fazla 3 teklif).</p>
        </div>
        <div className="picker-checkboxes" role="group" aria-label="Karşılaştırılacak teklifler">
          {quotes.map(quote => {
            const isChecked = activeSelection.includes(professionalKey(quote));
            const isDisabled = !isChecked && activeSelection.length === 3;
            return (
              <label key={professionalKey(quote)} className={`picker-checkbox-card ${isChecked ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={() => toggle(professionalKey(quote))}
                />
                <span className="checkbox-text">
                  <strong>{quote.tradespersonName}</strong>
                  <small>Sürüm {quote.version} · {money(quote.laborAmountKurus + quote.materialAmountKurus)}</small>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {compared.length > 0 ? (
        <div className="comparison-matrix-container">
          <table className="comparison-matrix-table" role="table" aria-label="Teklif karşılaştırma matrisi">
            <thead>
              <tr>
                <th className="matrix-criteria-th">Kriter</th>
                {compared.map(quote => {
                  const total = quote.laborAmountKurus + quote.materialAmountKurus;
                  const isLowest = minTotal !== null && total === minTotal;
                  return (
                    <th key={professionalKey(quote)} className={`matrix-quote-th ${isLowest ? 'highlight-th' : ''}`}>
                      <div className="quote-th-header">
                        <span className="quote-th-badge">TEKLİF SÜRÜMÜ {quote.version}</span>
                        <h4 className="quote-th-name">{quote.tradespersonName}</h4>
                        <div className="quote-th-total">{money(total)}</div>
                        {isLowest && <span className="objective-pill lowest-pill">En Düşük Toplam</span>}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="matrix-label-td">Usta Doğrulaması</td>
                {compared.map(quote => (
                  <td key={professionalKey(quote)} className="matrix-val-td">
                    <div className="proof-district-stat">
                      Güncel belge ve doğrulama bilgilerini usta profilinden inceleyin
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="matrix-label-td">İşçilik Tutarı</td>
                {compared.map(quote => (
                  <td key={professionalKey(quote)} className="matrix-val-td font-mono">
                    {money(quote.laborAmountKurus)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="matrix-label-td">Malzeme Durumu</td>
                {compared.map(quote => (
                  <td key={professionalKey(quote)} className="matrix-val-td">
                    {quote.materialAmountKurus > 0 ? (
                      <span className="matrix-tag tag-included">{money(quote.materialAmountKurus)} (Malzeme Dahil)</span>
                    ) : (
                      <span className="matrix-tag tag-owner">0 ₺ · Malzeme kapsamını kontrol edin</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="matrix-label-td">Tahmini Süre</td>
                {compared.map(quote => (
                  <td key={professionalKey(quote)} className="matrix-val-td font-mono">
                    {quote.estimatedDurationMinutes} dakika
                  </td>
                ))}
              </tr>
              <tr>
                <td className="matrix-label-td">İşçilik Garantisi</td>
                {compared.map(quote => {
                  const isLongest = maxWarranty !== null && quote.warrantyDays === maxWarranty && maxWarranty > 0;
                  return (
                    <td key={professionalKey(quote)} className="matrix-val-td">
                      <strong>{quote.warrantyDays} gün</strong>
                      {isLongest && <span className="objective-pill warranty-pill">En Uzun Garanti</span>}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="matrix-label-td">Dahil Kapsam</td>
                {compared.map(quote => (
                  <td key={professionalKey(quote)} className="matrix-val-td">
                    <ul className="matrix-scope-list">
                      {quote.includedScope.map(item => (
                        <li key={item}>✓ {item}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="matrix-label-td">Hariç Kapsam</td>
                {compared.map(quote => (
                  <td key={professionalKey(quote)} className="matrix-val-td">
                    {quote.excludedScope.length > 0 ? (
                      <ul className="matrix-scope-list excluded">
                        {quote.excludedScope.map(item => (
                          <li key={item}>✕ {item}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted">Açık hariç kapsam belirtilmedi</span>
                    )}
                  </td>
                ))}
              </tr>
              {compared.some(q => q.note) && (
                <tr>
                  <td className="matrix-label-td">Usta Notu</td>
                  {compared.map(quote => (
                    <td key={professionalKey(quote)} className="matrix-val-td note-cell">
                      {quote.note || '—'}
                    </td>
                  ))}
                </tr>
              )}
              <tr className="matrix-actions-row">
                <td className="matrix-label-td">İşlem</td>
                {compared.map(quote => (
                  <td key={professionalKey(quote)} className="matrix-val-td">
                    <button
                      className="dialog-primary matrix-accept-btn"
                      disabled={Boolean(busy) || accepted || !canAccept || quote.status !== 'submitted'}
                      onClick={() => { setError(''); setConfirmQuote(quote); }}
                      type="button"
                    >
                      {quote.status === 'accepted' ? 'Kabul edildi' : busy === quote.id ? 'İşleniyor…' : 'Bu teklifi kabul et'}
                    </button>
                    {quote.detailHref&&<Link className="account-back" href={quote.detailHref}>Sürümleri incele / revizyon iste →</Link>}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-comparison-card">
          <p>Kıyaslama yapmak için yukarıdan en az 1 teklif seçin.</p>
        </div>
      )}

      {message && (
        <div className="account-alert-box alert-success" role="status">
          <span>✓</span>
          <span>{message}</span>
        </div>
      )}

      {(accepted || quotes.some(quote => quote.status === 'accepted')) && <Link className="account-back" href="/islerim">İşlerime git →</Link>}
      {confirmQuote && <QuoteAcceptDialog quote={confirmQuote} busy={Boolean(busy)} stale={stale} error={error}
        onClose={() => { if (!inFlight.current) setConfirmQuote(null); }}
        onAccept={() => void executeAccept(confirmQuote)} />}
    </section>
  );
}
