'use client';

/**
 * UstaServiceAreaMap
 * ──────────────────
 * Lightweight Leaflet map that renders the tradesperson's service area
 * districts as filled polygons with labels. Designed for the public
 * profile page (/ustalar/[id]). No markers, no overlays — pure polygon
 * showcase of where the tradesperson operates.
 *
 * Props:
 *  - districts: string[]   ← district names matching ankaraDistrictsGeo
 *  - primaryDistrict?: string  ← optionally highlighted district
 */

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ankaraDistrictsGeo } from '../../data/ankaraMapGeo';
import styles from './ustaServiceAreaMap.module.css';

export interface UstaServiceAreaMapProps {
  /** District names the tradesperson serves (from tradesperson_service_areas) */
  districts: string[];
  /** Optional: highlight this district as the "primary" base */
  primaryDistrict?: string;
  /** Height of the map container (default: 340px) */
  height?: number;
}

// Crisp, authoritative municipal palette (Active vs Inactive Districts)
const COLOR_ACTIVE = '#e2e8f0';
const COLOR_PRIMARY = '#1d4ed8';
const COLOR_ACTIVE_STROKE = '#334155';
const COLOR_MUTED = 'transparent';
const COLOR_MUTED_STROKE = 'rgba(148, 163, 184, 0.40)';

export default function UstaServiceAreaMap({
  districts,
  primaryDistrict,
  height = 340,
}: UstaServiceAreaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // ── 1. Initialise map ──────────────────────────────────────────────
    const map = L.map(containerRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      dragging: true,
      attributionControl: false,
      preferCanvas: true,
    });
    mapRef.current = map;

    // Minimal clean light basemap
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 16 }
    ).addTo(map);

    // ── 2. Normalise input district names ──────────────────────────────
    const serviceSet = new Set(
      districts.map(d => d.toLowerCase().trim())
    );
    const primaryName = primaryDistrict?.toLowerCase().trim();

    // ── 3. Draw all 9 pilot districts (Exact Administrative Boundaries) ─
    const boundsPoints: L.LatLng[] = [];
    const activeFeatures: L.LatLng[] = [];

    ankaraDistrictsGeo.forEach(district => {
      const isService =
        serviceSet.has(district.name.toLowerCase()) ||
        serviceSet.has(district.id);
      const isPrimary =
        primaryName &&
        (district.name.toLowerCase() === primaryName ||
          district.id === primaryName);

      void L.polygon(
        district.polygonLatLngs.map(([lat, lng]) => L.latLng(lat, lng)),
        {
          fillColor: isService ? (isPrimary ? '#dbeafe' : COLOR_ACTIVE) : COLOR_MUTED,
          fillOpacity: isService ? (isPrimary ? 0.28 : 0.16) : 0.02,
          color: isService ? (isPrimary ? COLOR_PRIMARY : COLOR_ACTIVE_STROKE) : COLOR_MUTED_STROKE,
          weight: isService ? (isPrimary ? 2.2 : 1.6) : 0.9,
          dashArray: isService ? undefined : '3, 4',
        }
      ).addTo(map);

      // Collect bounds for fitBounds
      district.polygonLatLngs.forEach(([lat, lng]) => {
        const ll = L.latLng(lat, lng);
        boundsPoints.push(ll);
        if (isService) activeFeatures.push(ll);
      });

      // Label on active districts only
      if (isService) {
        const center = district.latLngCenter;
        const icon = L.divIcon({
          className: '',
          html: `<div class="${styles.districtLabel}${isPrimary ? ` ${styles.districtLabelPrimary}` : ''}">${district.name}</div>`,
          iconAnchor: [30, 12],
        });
        L.marker(L.latLng(center[0], center[1]), { icon, interactive: false }).addTo(map);
      }
    });

    // ── 4. Fit bounds to active service area (or full Ankara fallback) ─
    const fitPoints = activeFeatures.length >= 3 ? activeFeatures : boundsPoints;
    if (fitPoints.length) {
      map.fitBounds(L.latLngBounds(fitPoints), {
        padding: [28, 28],
        maxZoom: activeFeatures.length <= 3 ? 12 : 10,
        animate: true,
        duration: 0.8,
      });
    }

    // ── 5. Subtle zoom control (top-right) ────────────────────────────
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Attribution
    L.control.attribution({ position: 'bottomright', prefix: false })
      .addAttribution('© <a href="https://carto.com/">CARTO</a> © <a href="https://www.openstreetmap.org/copyright">OSM</a>')
      .addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.mapRoot} style={{ height }}>
      <div ref={containerRef} className={styles.mapContainer} />
      {districts.length === 0 && (
        <div className={styles.emptyOverlay}>
          <span>🗺️</span>
          <p>Hizmet bölgesi henüz tanımlanmamış</p>
        </div>
      )}
    </div>
  );
}
