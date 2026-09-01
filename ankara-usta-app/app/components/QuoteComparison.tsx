'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export type ComparableQuote = {
  id: string;
  tradespersonName: string;
  version: number;
  laborAmountKurus: number;
  materialAmountKurus: number;
  estimatedDurationMinutes: number;
  warrantyDays: number;
  includedScope: string[];
  excludedScope: string[];
  note: string | null;
};

const money = (kurus: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(kurus / 100);

export default function QuoteComparison({ quotes }: { quotes: ComparableQuote[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState(quotes.slice(0, 3).map(quote => quote.id));
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [confirmQuote, setConfirmQuote] = useState<ComparableQuote | null>(null);

  function toggle(id: string) {
    setSelected(current =>
      current.includes(id)
        ? current.filter(item => item !== id)
        : current.length < 3
        ? [...current, id]
        : current
    );
  }

  async function executeAccept(quote: ComparableQuote) {
    setBusy(quote.id);
    setMessage('');
    try {
      const response = await fetch(`/api/quotes/${quote.id}/accept`, { method: 'POST' });
      const body = (await response.json()) as { error?: string };
      setBusy('');
      setConfirmQuote(null);
      if (!response.ok) {
        return setMessage(body.error ?? 'Teklif kabul edilemedi.');
      }
      setMessage(`${quote.tradespersonName} ustanın teklifi kabul edildi. İş planlaması başlatıldı.`);
      router.refresh();
    } catch {
      setBusy('');
      setConfirmQuote(null);
      setMessage('Bağlantı hatası oluştu. Lütfen tekrar deneyin.');
    }
  }

  const compared = quotes.filter(quote => selected.includes(quote.id));

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
            const isChecked = selected.includes(quote.id);
            const isDisabled = !isChecked && selected.length === 3;
            return (
              <label key={quote.id} className={`picker-checkbox-card ${isChecked ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={() => toggle(quote.id)}
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
                    <th key={quote.id} className={`matrix-quote-th ${isLowest ? 'highlight-th' : ''}`}>
                      <div className="quote-th-header">
                        <span className="quote-th-badge">ONAYLI USTA HESABI</span>
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
                  <td key={quote.id} className="matrix-val-td">
                    <div className="proof-district-stat">
                      Usta başvurusu onaylandı · Belge ayrıntılarını profilden inceleyin
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="matrix-label-td">İşçilik Tutarı</td>
                {compared.map(quote => (
                  <td key={quote.id} className="matrix-val-td font-mono">
                    {money(quote.laborAmountKurus)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="matrix-label-td">Malzeme Durumu</td>
                {compared.map(quote => (
                  <td key={quote.id} className="matrix-val-td">
                    {quote.materialAmountKurus > 0 ? (
                      <span className="matrix-tag tag-included">{money(quote.materialAmountKurus)} (Malzeme Dahil)</span>
                    ) : (
                      <span className="matrix-tag tag-owner">0 ₺ (İş Sahibinden)</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="matrix-label-td">Tahmini Süre</td>
                {compared.map(quote => (
                  <td key={quote.id} className="matrix-val-td font-mono">
                    {quote.estimatedDurationMinutes} dakika
                  </td>
                ))}
              </tr>
              <tr>
                <td className="matrix-label-td">İşçilik Garantisi</td>
                {compared.map(quote => {
                  const isLongest = maxWarranty !== null && quote.warrantyDays === maxWarranty && maxWarranty > 0;
                  return (
                    <td key={quote.id} className="matrix-val-td">
                      <strong>{quote.warrantyDays} gün</strong>
                      {isLongest && <span className="objective-pill warranty-pill">En Uzun Garanti</span>}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="matrix-label-td">Dahil Kapsam</td>
                {compared.map(quote => (
                  <td key={quote.id} className="matrix-val-td">
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
                  <td key={quote.id} className="matrix-val-td">
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
                    <td key={quote.id} className="matrix-val-td note-cell">
                      {quote.note || '—'}
                    </td>
                  ))}
                </tr>
              )}
              <tr className="matrix-actions-row">
                <td className="matrix-label-td">İşlem</td>
                {compared.map(quote => (
                  <td key={quote.id} className="matrix-val-td">
                    <button
                      className="dialog-primary matrix-accept-btn"
                      disabled={Boolean(busy)}
                      onClick={() => setConfirmQuote(quote)}
                      type="button"
                    >
                      {busy === quote.id ? 'İşleniyor…' : 'Bu teklifi kabul et'}
                    </button>
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

      {/* Confirmation Modal */}
      {confirmQuote && (
        <div className="dialog-backdrop" role="presentation" onClick={() => setConfirmQuote(null)}>
          <div
            className="request-dialog confirmation-dialog"
            role="dialog"
            aria-modal="true"
            onClick={e => e.stopPropagation()}
          >
            <span className="account-eyebrow">TEKLİF ONAYI</span>
            <h2>{confirmQuote.tradespersonName} Ustanın Teklifini Onaylıyor musunuz?</h2>
            <div className="confirm-summary-box">
              <div className="confirm-row">
                <span>Toplam Tutar:</span>
                <strong>{money(confirmQuote.laborAmountKurus + confirmQuote.materialAmountKurus)}</strong>
              </div>
              <div className="confirm-row">
                <span>Garanti:</span>
                <span>{confirmQuote.warrantyDays} Gün İşçilik Garantisi</span>
              </div>
              <div className="confirm-row">
                <span>Tahmini Süre:</span>
                <span>{confirmQuote.estimatedDurationMinutes} Dakika</span>
              </div>
            </div>
            <p className="confirm-notice">
              Bu teklifi onayladığınızda iş takvimi oluşturulur ve gelen diğer teklifler otomatik olarak kapatılır.
            </p>
            <div className="confirm-actions">
              <button
                type="button"
                className="wizard-secondary"
                onClick={() => setConfirmQuote(null)}
                disabled={Boolean(busy)}
              >
                Vazgeç
              </button>
              <button
                type="button"
                className="dialog-primary"
                onClick={() => void executeAccept(confirmQuote)}
                disabled={Boolean(busy)}
              >
                {busy ? 'Kabul Ediliyor…' : 'Onayla ve Başlat →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
