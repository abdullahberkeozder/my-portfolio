'use client';

/**
 * KvkkMaskedLocationMap
 * ───────────────────────
 * BR-16: KVKK 6698 Coğrafi Maskeleme Haritası
 * Teklif aşamasında ustanın müşterinin açık adresini görmesini engeller;
 * mahalle ağırlık merkezini 300m koruma yarıçapı ve radar halkasıyla gösterir.
 */

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getMaskedLocation, getNearestCraftHub } from '../../lib/kvkkSpatialShield';
import styles from './kvkkMaskedMap.module.css';

export interface KvkkMaskedLocationMapProps {
  district: string;
  neighborhood: string;
  serviceCategory?: string;
  serviceName?: string;
  height?: number;
}

export default function KvkkMaskedLocationMap({
  district,
  neighborhood,
  serviceCategory,
  height = 240,
}: KvkkMaskedLocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const masked = getMaskedLocation(district, neighborhood);
  const hubProximity = getNearestCraftHub(masked.lat, masked.lng, serviceCategory);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [masked.lat, masked.lng],
      zoom: 14.5,
      zoomControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      dragging: true,
      attributionControl: false,
      preferCanvas: true,
    });
    mapRef.current = map;

    // OpenStreetMap standard basemap (clean, resilient)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // 1. 300-Meter Privacy Halo Circle
    const privacyCircle = L.circle([masked.lat, masked.lng], {
      radius: masked.radiusMeters,
      color: '#2563eb',
      weight: 1.5,
      dashArray: '5, 5',
      fillColor: '#3b82f6',
      fillOpacity: 0.12,
    }).addTo(map);

    privacyCircle.bindTooltip(
      `🛡️ <strong>${masked.neighborhood}</strong><br/><span style="font-size:11px">KVKK 6698 Korumalı ~300m Alan</span>`,
      {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
      }
    );

    // 2. Center Pulsing Marker with Shield
    const pulseIcon = L.divIcon({
      className: '',
      html: `
        <div class="${styles.pulseMarker}">
          <div class="${styles.pulseRing}"></div>
          <div class="${styles.pulseCenter}"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const marker = L.marker([masked.lat, masked.lng], {
      icon: pulseIcon,
      interactive: true,
    }).addTo(map);

    marker.bindPopup(
      `
      <div style="font-family: inherit; font-size: 12.5px; line-height: 1.4; color: #0f172a; min-width: 180px; padding: 2px;">
        <strong style="display:block; font-size: 13px; margin-bottom: 2px;">${masked.neighborhood} Mahallesi</strong>
        <span style="color: #64748b; font-size: 11.5px; display:block; margin-bottom: 6px;">${masked.district} / Ankara</span>
        <div style="background: #eff6ff; color: #1d4ed8; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; margin-bottom: 4px;">
          🛡️ KVKK 6698 Korumalı Yarıçap (~300m)
        </div>
        <small style="color: #64748b; font-size: 10.5px;">Açık bina ve kapı no teklif onayında açılır.</small>
      </div>
      `,
      { closeButton: false, offset: [0, -12] }
    );

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [masked.lat, masked.lng, masked.radiusMeters, masked.district, masked.neighborhood]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.shieldIcon} aria-hidden="true">🛡️</span>
          <span className={styles.title}>KVKK 6698 Coğrafi Maskeleme Kalkanı</span>
          <span className={styles.badge}>~{masked.radiusMeters}m Koruma Yarıçapı</span>
        </div>
        <div className={styles.headerRight}>
          <span>{masked.neighborhood} Mah., {masked.district}</span>
        </div>
      </div>

      <div
        ref={containerRef}
        className={styles.mapContainer}
        style={{ height }}
        role="region"
        aria-label={`${masked.district} ${masked.neighborhood} KVKK Korumalı Yaklaşık Konum Haritası`}
      />

      <div className={styles.footer}>
        <div className={styles.hubTransit}>
          <span>{hubProximity.transitSlaText}</span>
        </div>
        <div className={styles.legalHint}>
          <span>Açık bina adresi teklif kabulünde iş odasına aktarılır.</span>
        </div>
      </div>
    </div>
  );
}
