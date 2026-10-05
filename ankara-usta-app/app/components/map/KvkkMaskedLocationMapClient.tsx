'use client';

/**
 * KvkkMaskedLocationMapClient
 * ────────────────────────────
 * SSR-safe dynamic import wrapper for KvkkMaskedLocationMap.
 */

import dynamic from 'next/dynamic';
import type { KvkkMaskedLocationMapProps } from './KvkkMaskedLocationMap';

const KvkkMaskedLocationMap = dynamic(() => import('./KvkkMaskedLocationMap'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 240,
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 8,
        color: '#64748b',
        fontSize: '0.85rem',
        fontWeight: 500,
        border: '1px solid #e2e8f0',
        margin: '14px 0 20px',
      }}
      role="status"
      aria-live="polite"
    >
      <span style={{ fontSize: '1.75rem' }}>🛡️</span>
      <span>KVKK 6698 Coğrafi Maskeleme Haritası yükleniyor...</span>
    </div>
  ),
});

export default function KvkkMaskedLocationMapClient(props: KvkkMaskedLocationMapProps) {
  return <KvkkMaskedLocationMap {...props} />;
}
