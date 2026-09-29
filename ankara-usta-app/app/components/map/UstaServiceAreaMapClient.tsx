'use client';

/**
 * UstaServiceAreaMapClient
 * ─────────────────────────
 * SSR-safe dynamic import wrapper for UstaServiceAreaMap.
 * Import this in Server Components (like the profile page).
 */

import dynamic from 'next/dynamic';
import type { UstaServiceAreaMapProps } from './UstaServiceAreaMap';

const UstaServiceAreaMap = dynamic(() => import('./UstaServiceAreaMap'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 340,
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 12,
        color: '#64748b',
        fontSize: '0.875rem',
        fontWeight: 500,
      }}
    >
      <span style={{ fontSize: '2rem' }}>🗺️</span>
      <span>Hizmet bölgesi haritası yükleniyor...</span>
    </div>
  ),
});

export default function UstaServiceAreaMapClient(props: UstaServiceAreaMapProps) {
  return <UstaServiceAreaMap {...props} />;
}
