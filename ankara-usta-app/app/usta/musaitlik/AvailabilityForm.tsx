'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './availability.module.css';

const today = new Date().toISOString().slice(0, 10);

function getFutureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

export default function AvailabilityForm() {
  const [availableFrom, setAvailableFrom] = useState(today);
  const [availableTo, setAvailableTo] = useState(() => getFutureDate(7));
  const [acceptsUrgent, setAcceptsUrgent] = useState(false);
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>(['morning', 'afternoon']);

  function applyPreset(days: number) {
    setAvailableFrom(today);
    setAvailableTo(getFutureDate(days));
  }

  function toggleSlot(slotId: string) {
    setSelectedSlots(prev =>
      prev.includes(slotId) ? prev.filter(s => s !== slotId) : [...prev, slotId]
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch('/api/tradespeople/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableFrom, availableTo, acceptsUrgent, active }),
      });
      const body = (await response.json()) as { error?: string };
      setBusy(false);
      if (response.ok) {
        setMessage({ text: 'Müsaitlik takviminiz ve tercihleriniz başarıyla kaydedildi.', isError: false });
      } else {
        setMessage({ text: body.error ?? 'Müsaitlik kaydedilemedi. Lütfen tekrar deneyin.', isError: true });
      }
    } catch {
      setBusy(false);
      setMessage({ text: 'Bağlantı hatası oluştu. Lütfen tekrar deneyin.', isError: true });
    }
  }

  return (
    <main className={`account-shell ${styles.container}`}>
      <Link className="account-back" href="/usta/talepler">
        ← Usta Çalışma Alanına Dön
      </Link>

      <form className={styles.card} onSubmit={submit}>
        <span className={styles.eyebrow}>USTA ÇALIŞMA TAKVİMİ</span>
        <h1 className={styles.title}>İş Alabileceğiniz Zamanları Belirleyin</h1>
        <p className={styles.desc}>
          Ankara eşleştirme motoru; yalnızca hizmetiniz, onaylı ilçeleriniz ve belirlediğiniz bu tarih aralığı
          birlikte örtüştüğünde yeni iş taleplerini size yönlendirir.
        </p>

        {/* Hızlı Seçim Butonları */}
        <div className={styles.presetGroup}>
          <span className={styles.presetLabel}>Hızlı Tarih Seçimi</span>
          <div className={styles.presetRow}>
            <button type="button" className={styles.presetBtn} onClick={() => applyPreset(1)}>Bugün &amp; Yarın</button>
            <button type="button" className={styles.presetBtn} onClick={() => applyPreset(7)}>Bu Hafta (7 Gün)</button>
            <button type="button" className={styles.presetBtn} onClick={() => applyPreset(14)}>Gelecek 14 Gün</button>
            <button type="button" className={styles.presetBtn} onClick={() => applyPreset(30)}>Bu Ay (30 Gün)</button>
          </div>
        </div>

        {/* Tarih Aralığı */}
        <div className={styles.dateGrid}>
          <div className={styles.fieldGroup}>
            <label htmlFor="avail-from" className={styles.fieldLabel}>Başlangıç Tarihi</label>
            <input id="avail-from" required type="date" className={styles.dateInput}
              value={availableFrom} min={today} onChange={event => setAvailableFrom(event.target.value)} />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="avail-to" className={styles.fieldLabel}>Bitiş Tarihi</label>
            <input id="avail-to" required type="date" className={styles.dateInput}
              value={availableTo} min={availableFrom} onChange={event => setAvailableTo(event.target.value)} />
          </div>
        </div>

        {/* Çalışma Saat Dilimleri */}
        <div className={styles.slotSection}>
          <div className={styles.slotTitle}>
            <span>⏰</span>
            <span>Tercih Ettiğiniz Günlük Çalışma Dilimleri</span>
          </div>
          <div className={styles.slotChips}>
            <button type="button"
              className={`${styles.slotChip} ${selectedSlots.includes('morning') ? styles.slotChipActive : ''}`}
              onClick={() => toggleSlot('morning')} aria-pressed={selectedSlots.includes('morning')}>
              <span className={styles.slotIcon} aria-hidden="true">🌅</span>
              <span>Sabah Slotu</span>
              <span className={styles.slotHours}>08:30 – 12:30</span>
            </button>
            <button type="button"
              className={`${styles.slotChip} ${selectedSlots.includes('afternoon') ? styles.slotChipActive : ''}`}
              onClick={() => toggleSlot('afternoon')} aria-pressed={selectedSlots.includes('afternoon')}>
              <span className={styles.slotIcon} aria-hidden="true">☀️</span>
              <span>Öğle Slotu</span>
              <span className={styles.slotHours}>13:00 – 17:30</span>
            </button>
            <button type="button"
              className={`${styles.slotChip} ${selectedSlots.includes('evening') ? styles.slotChipActive : ''}`}
              onClick={() => toggleSlot('evening')} aria-pressed={selectedSlots.includes('evening')}>
              <span className={styles.slotIcon} aria-hidden="true">🌙</span>
              <span>Akşam / Nöbetçi</span>
              <span className={styles.slotHours}>18:00 – 21:00</span>
            </button>
          </div>
        </div>

        {/* Tercih Switchleri */}
        <div className={styles.toggleList}>
          <label className={styles.toggleItem}>
            <input type="checkbox" className={styles.checkboxInput}
              checked={acceptsUrgent} onChange={event => setAcceptsUrgent(event.target.checked)} />
            <div className={styles.toggleMeta}>
              <span className={styles.toggleTitle}>🚨 Acil / Aynı Gün Taleplerini Kabul Ediyorum</span>
              <span className={styles.toggleDesc}>
                Su patlağı, elektrik kesintisi gibi acil işlerde bölgenizdeki müşterilere öncelikli eşleşirsiniz.
              </span>
            </div>
          </label>
          <label className={styles.toggleItem}>
            <input type="checkbox" className={styles.checkboxInput}
              checked={active} onChange={event => setActive(event.target.checked)} />
            <div className={styles.toggleMeta}>
              <span className={styles.toggleTitle}>🟢 Eşleştirmelerde Aktif Görün</span>
              <span className={styles.toggleDesc}>
                İş alımını geçici olarak durdurmak istediğinizde bu seçeneği kapatabilirsiniz.
              </span>
            </div>
          </label>
        </div>

        {/* Bilgilendirme Kutusu */}
        <div className={styles.infoBanner}>
          <span aria-hidden="true">💡</span>
          <div>
            <strong>Kör Teklif Güvenliği:</strong> Müsait olduğunuz günlerde gelen talepleri inceleyip teklif
            verebilirsiniz. Verdiğiniz teklifleri diğer ustalar göremez; müşteriyle tam adres bilgisi yalnızca
            teklif kabul edildiğinde paylaşılır.
          </div>
        </div>

        {message && (
          <div className={`${styles.messageStatus} ${message.isError ? styles.messageError : ''}`} role="status">
            {message.text}
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.submitBtn} disabled={busy} type="submit">
            {busy ? 'Kaydediliyor…' : 'Müsaitlik Takvimini Kaydet →'}
          </button>
        </div>
      </form>
    </main>
  );
}
