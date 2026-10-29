'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import styles from './availability.module.css';

export type SavedAvailability = {
  available_from: string;
  available_to: string;
  accepts_urgent: boolean;
  active: boolean;
  updated_at?: string;
};

function addDays(date: string, count: number) {
  const result = new Date(`${date}T12:00:00Z`);
  result.setUTCDate(result.getUTCDate() + count);
  return result.toISOString().slice(0, 10);
}

function isAvailability(value: unknown): value is SavedAvailability {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<SavedAvailability>;
  return typeof item.available_from === 'string' && typeof item.available_to === 'string' &&
    typeof item.accepts_urgent === 'boolean' && typeof item.active === 'boolean';
}

export default function AvailabilityForm({
  today,
  initialAvailability,
}: {
  today: string;
  initialAvailability: SavedAvailability | null;
}) {
  const [saved, setSaved] = useState(initialAvailability);
  const [availableFrom, setAvailableFrom] = useState(initialAvailability?.available_from ?? today);
  const [availableTo, setAvailableTo] = useState(initialAvailability?.available_to ?? addDays(today, 6));
  const [acceptsUrgent, setAcceptsUrgent] = useState(initialAvailability?.accepts_urgent ?? false);
  const [active, setActive] = useState(initialAvailability?.active ?? true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const changed = !saved || availableFrom !== saved.available_from || availableTo !== saved.available_to ||
    acceptsUrgent !== saved.accepts_urgent || active !== saved.active;
  const expired = Boolean(saved && saved.available_to < today && !changed);

  function applyPreset(days: number) {
    setAvailableFrom(today);
    setAvailableTo(addDays(today, days - 1));
    setMessage(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !changed) return;
    if (availableFrom > availableTo) {
      setMessage({ text: 'Bitiş tarihi başlangıç tarihinden önce olamaz.', isError: true });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch('/api/tradespeople/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableFrom, availableTo, acceptsUrgent, active }),
      });
      const body: unknown = await response.json().catch(() => null);
      const result = body && typeof body === 'object' ? body as { availability?: unknown; error?: unknown } : null;
      if (!response.ok) {
        setMessage({ text: typeof result?.error === 'string' ? result.error : 'Müsaitlik kaydedilemedi. Yeniden deneyin.', isError: true });
      } else if (isAvailability(result?.availability)) {
        const record = result.availability;
        setSaved(record);
        setAvailableFrom(record.available_from);
        setAvailableTo(record.available_to);
        setAcceptsUrgent(record.accepts_urgent);
        setActive(record.active);
        setMessage({ text: 'Müsaitlik tercihleriniz kaydedildi.', isError: false });
      } else {
        setMessage({ text: 'Kaydetme sonucu doğrulanamadı. Sayfayı yenileyerek kayıtlı bilgileri kontrol edin.', isError: true });
      }
    } catch {
      setMessage({ text: 'Bağlantı kesildi. Kaydedilip kaydedilmediğini görmek için sayfayı yenileyin.', isError: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link className={styles.back} href="/usta/talepler">İş fırsatlarına dön</Link>
        <header className={styles.header}>
          <h1>İş alma durumunuz</h1>
          <p>Tarih aralığınızı ve acil iş tercihinizi yönetin. Bu bilgiler uygun açık taleplerle eşleştirmede kullanılır.</p>
        </header>

        <form onSubmit={submit} className={styles.form}>
          <fieldset disabled={busy} className={styles.fields}>
            <section className={styles.section} aria-labelledby="availability-dates-title">
              <div className={styles.sectionIntro}>
                <h2 id="availability-dates-title">Ne zaman iş alabilirsiniz?</h2>
                <p>Tarih aralığı dışında yeni açık taleplerle eşleşmezsiniz.</p>
              </div>
              <div className={styles.presetRow} aria-label="Hızlı tarih seçimi">
                {[
                  { days: 2, label: 'Bugün ve yarın' },
                  { days: 7, label: '7 gün' },
                  { days: 14, label: '14 gün' },
                  { days: 30, label: '30 gün' },
                ].map(({ days, label }) => (
                  <button key={days} type="button" className={styles.preset} aria-pressed={availableFrom === today && availableTo === addDays(today, days - 1)} onClick={() => applyPreset(days)}>{label}</button>
                ))}
              </div>
              <div className={styles.dateGrid}>
                <label className={styles.field}>Başlangıç tarihi
                  <input required type="date" value={availableFrom} min={availableFrom < today ? availableFrom : today} onChange={event => { setAvailableFrom(event.target.value); setMessage(null); }} />
                </label>
                <label className={styles.field}>Bitiş tarihi
                  <input required type="date" value={availableTo} min={availableFrom} onChange={event => { setAvailableTo(event.target.value); setMessage(null); }} />
                </label>
              </div>
              {expired && <p className={styles.expired}>Kayıtlı tarih aralığınız sona erdi. Yeniden iş almak için tarihleri güncelleyin.</p>}
            </section>

            <section className={styles.section} aria-labelledby="availability-options-title">
              <div className={styles.sectionIntro}>
                <h2 id="availability-options-title">İş tercihleri</h2>
                <p>Değişiklikler yalnız kaydettiğinizde geçerli olur.</p>
              </div>
              <label className={styles.option}>
                <input type="checkbox" checked={active} onChange={event => { setActive(event.target.checked); setMessage(null); }} />
                <span><strong>Açık talepler için aktifim</strong><small>Kapattığınızda yeni açık talep eşleştirmelerinde görünmezsiniz.</small></span>
              </label>
              <label className={styles.option}>
                <input type="checkbox" checked={acceptsUrgent} onChange={event => { setAcceptsUrgent(event.target.checked); setMessage(null); }} />
                <span><strong>Acil talepleri de değerlendirebilirim</strong><small>Bu tercih, acil açık taleplerin eşleştirmesinde kullanılır.</small></span>
              </label>
            </section>
          </fieldset>

          <div className={styles.saveArea}>
            <p className={styles.saveHint}>{changed ? 'Kaydedilmemiş değişiklikler var.' : 'Kayıtlı tercihleriniz gösteriliyor.'}</p>
            <button className={styles.submit} disabled={busy || !changed} type="submit" aria-busy={busy}>
              {busy ? 'Kaydediliyor…' : 'Müsaitliği kaydet'}
            </button>
          </div>
          {message && <p className={message.isError ? styles.error : styles.success} role={message.isError ? 'alert' : 'status'}>{message.text}</p>}
        </form>
      </div>
    </main>
  );
}
