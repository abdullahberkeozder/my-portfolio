'use client';

import { useSyncExternalStore, useState, useEffect, useRef } from 'react';
import Link from 'next/link';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot() {
  try {
    return localStorage.getItem('ankara_analytics_consent') ?? 'undecided';
  } catch {
    return 'unavailable';
  }
}

function getServerSnapshot() {
  return 'loading';
}

export default function ConsentBanner() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [localChoice,setLocalChoice] = useState(false);
  const show = !localChoice && ['undecided','unavailable'].includes(consent);
  const bannerRef = useRef<HTMLElement>(null);

  useEffect(()=>{
    if(!show || !bannerRef.current) return;
    const element=bannerRef.current;
    const previous=document.body.style.paddingBottom;
    const reserve=()=>{document.body.style.paddingBottom=`${element.getBoundingClientRect().height+32}px`;};
    reserve();
    const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(reserve);
    observer?.observe(element);
    return()=>{observer?.disconnect();document.body.style.paddingBottom=previous;};
  },[show]);


  function saveChoice(value: 'accepted' | 'rejected') {
    setLocalChoice(true);
    try {
      localStorage.setItem('ankara_analytics_consent', value);
      window.dispatchEvent(new Event('storage'));
    } catch {
      // Close for this visit without inventing persisted consent.
    }
  }

  if (!show) return null;

  return (
    <aside
      ref={bannerRef}
      className="privacy-consent-banner"
      role="region"
      aria-label="Gizlilik ve Çerez Tercihleri"
    >
      <div className="consent-inner">
        <p className="consent-text">
          Kullanımı iyileştirmek için isteğe bağlı ölçüme izin verir misiniz?{' '}
          <Link href="/gizlilik" className="consent-link">
            Gizlilik ayrıntıları
          </Link>
        </p>
        <div className="consent-actions">
          <button
            type="button"
            className="consent-accept-btn"
            onClick={() => saveChoice('accepted')}
          >
            İzin ver
          </button>
          <button type="button" className="consent-reject-btn" onClick={() => saveChoice('rejected')}>Reddet</button>
        </div>
      </div>
    </aside>
  );
}
