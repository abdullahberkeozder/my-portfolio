'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot() {
  try {
    return localStorage.getItem('ankara_analytics_consent') ?? 'undecided';
  } catch {
    return 'accepted';
  }
}

function getServerSnapshot() {
  return 'accepted';
}

export default function ConsentBanner() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const show = consent === 'undecided';


  function saveChoice(value: 'accepted' | 'rejected') {
    try {
      localStorage.setItem('ankara_analytics_consent', value);
      window.dispatchEvent(new Event('storage'));
    } catch {
      // Ignore
    }
  }

  if (!show) return null;

  return (
    <aside
      className="privacy-consent-banner"
      role="region"
      aria-label="Gizlilik ve Çerez Tercihleri"
    >
      <div className="consent-inner">
        <p className="consent-text">
          İzin verirseniz yalnız ürün akışlarını iyileştirmek için anonim kullanım olayları toplarız. Form metinleri, adresler ve yüklenen dosyalar ölçümlere eklenmez.{' '}
          <Link href="/gizlilik" className="consent-link">
            Gizlilik Politikamızı
          </Link>{' '}
          inceleyebilirsiniz.
        </p>
        <div className="consent-actions">
          <button
            type="button"
            className="consent-accept-btn"
            onClick={() => saveChoice('accepted')}
          >
            Anonim ölçüme izin ver
          </button>
          <button type="button" className="consent-reject-btn" onClick={() => saveChoice('rejected')}>Reddet</button>
        </div>
      </div>
    </aside>
  );
}
