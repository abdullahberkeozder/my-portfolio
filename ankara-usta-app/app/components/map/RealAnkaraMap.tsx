'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import {
  ankaraDistrictsGeo,
  findDistrictByLatLng,
  getNeighborhoodCoordinates,
  type ShopPin,
} from '../../data/ankaraMapGeo';
import styles from './ankaraMap.module.css';

export interface TradespersonMapMarker {
  id: string;
  name: string;
  services: string[];
  district: string;
  neighborhood?: string;
  rating?: number;
  latLng: [number, number];
  badge?: string;
}

export interface RealAnkaraMapProps {
  filteredPins?: ShopPin[];
  tradespeopleMarkers?: TradespersonMapMarker[];
  activeTradespersonId?: string | null;
  onSelectTradespersonMarker?: (id: string) => void;
  selectedDistrict: string;
  selectedNeighborhood?: string;
  onSelectDistrict: (districtId: string) => void;
  onSelectNeighborhood?: (neighborhood: string) => void;
  mode?: 'discovery' | 'picker';
  onConfirmLocation?: (district: string, neighborhood?: string) => void;
}

const TILE_LAYERS = {
  streets: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    maxZoom: 19,
    subdomains: 'abcd',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    maxZoom: 19,
    subdomains: 'abcd',
    attribution: '&copy; CARTO &copy; OpenStreetMap',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 18,
    subdomains: '',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
  },
};

export default function RealAnkaraMap({
  selectedDistrict,
  selectedNeighborhood,
  onSelectDistrict,
  onSelectNeighborhood,
  mode = 'discovery',
  onConfirmLocation,
  tradespeopleMarkers,
  activeTradespersonId,
  onSelectTradespersonMarker,
}: RealAnkaraMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polygonLayerGroupRef = useRef<L.FeatureGroup | null>(null);
  const hubLayerGroupRef = useRef<L.FeatureGroup | null>(null);
  const ustaLayerGroupRef = useRef<L.FeatureGroup | null>(null);
  const targetMarkerRef = useRef<L.Marker | null>(null);
  const userGpsMarkerRef = useRef<L.Marker | null>(null);

  const [activeLayer, setActiveLayer] = useState<'streets' | 'light' | 'satellite'>('streets');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [closedDistrict, setClosedDistrict] = useState<string | null>(null);
  const activeDistrictGeo = ankaraDistrictsGeo.find(
    d => d.id === selectedDistrict || d.name.toLowerCase() === selectedDistrict.toLowerCase()
  );
  const drawerOpen = Boolean(activeDistrictGeo && closedDistrict !== activeDistrictGeo.id);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [39.9255, 32.8530], // Ankara Center (Kızılay)
      zoom: 11,
      minZoom: 9,
      maxZoom: 19,
      zoomControl: false, // We use custom sleek buttons
      attributionControl: false,
    });

    const layerConfig = TILE_LAYERS.streets;
    const tileLayer = L.tileLayer(layerConfig.url, {
      maxZoom: layerConfig.maxZoom,
      subdomains: layerConfig.subdomains,
      attribution: layerConfig.attribution,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Small scale bar bottom-left
    L.control.scale({ metric: true, imperial: false, position: 'bottomleft' }).addTo(map);

    polygonLayerGroupRef.current = L.featureGroup().addTo(map);
    hubLayerGroupRef.current = L.featureGroup().addTo(map);
    ustaLayerGroupRef.current = L.featureGroup().addTo(map);
    mapRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Handle Layer Switch
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const config = TILE_LAYERS[activeLayer];
    const newLayer = L.tileLayer(config.url, {
      maxZoom: config.maxZoom,
      subdomains: config.subdomains,
      attribution: config.attribution,
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [activeLayer]);

  // 3. Render / Update District Polygons & Hub Badges
  useEffect(() => {
    const polyGroup = polygonLayerGroupRef.current;
    const hubGroup = hubLayerGroupRef.current;
    if (!polyGroup || !hubGroup) return;

    polyGroup.clearLayers();
    hubGroup.clearLayers();

    ankaraDistrictsGeo.forEach(district => {
      const isSelected = selectedDistrict === district.id || selectedDistrict === district.name;

      // District boundary polygon
      const polygon = L.polygon(district.polygonLatLngs, {
        color: isSelected ? '#0b132b' : '#3b82f6',
        weight: isSelected ? 3.5 : 1.5,
        dashArray: isSelected ? undefined : '5, 5',
        fillColor: isSelected ? '#ffdd00' : district.color,
        fillOpacity: isSelected ? 0.22 : 0.06,
        className: isSelected ? styles.polygonSelected : '',
      });

      polygon.bindTooltip(
        `<div style="font-family: inherit; font-size: 12px; font-weight: 700; color: #0b132b;">📍 ${district.name} · ${district.tradeCount} Usta</div>`,
        { sticky: true, direction: 'top', opacity: 0.95 }
      );

      polygon.on('click', e => {
        L.DomEvent.stopPropagation(e);
        onSelectDistrict(isSelected ? 'all' : district.id);
      });

      polygon.addTo(polyGroup);

      // District Hub Badge at centroid (Only visible when no specific district is selected)
      if (selectedDistrict === 'all') {
        const hubIcon = L.divIcon({
          html: `<div class="${styles.districtHubBadge}">📍 ${district.name} (${district.tradeCount})</div>`,
          className: '',
          iconSize: [110, 26],
          iconAnchor: [55, 13],
        });

        const hubMarker = L.marker(district.latLngCenter, { icon: hubIcon });
        hubMarker.on('click', () => {
          onSelectDistrict(district.id);
        });
        hubMarker.addTo(hubGroup);
      }
    });
  }, [selectedDistrict, onSelectDistrict]);

  // 3.5 Render Tradesperson Directory Markers (Airbnb Split-View)
  useEffect(() => {
    const ustaGroup = ustaLayerGroupRef.current;
    if (!ustaGroup) return;

    ustaGroup.clearLayers();
    if (!tradespeopleMarkers || tradespeopleMarkers.length === 0) return;

    tradespeopleMarkers.forEach(usta => {
      const isHighlighted = activeTradespersonId === usta.id;
      const markerHtml = `
        <div class="${styles.ustaMapMarker} ${isHighlighted ? styles.ustaMapMarkerActive : ''}">
          <span class="${styles.ustaMapMarkerIcon}">🛠️</span>
          <span class="${styles.ustaMapMarkerName}">${usta.name}</span>
          ${usta.rating ? `<span class="${styles.ustaMapMarkerRating}">★ ${usta.rating.toFixed(1)}</span>` : ''}
        </div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: '',
        iconSize: [130, 28],
        iconAnchor: [65, 14],
      });

      const marker = L.marker(usta.latLng, {
        icon,
        zIndexOffset: isHighlighted ? 1500 : 100,
      });

      marker.on('click', () => {
        if (onSelectTradespersonMarker) {
          onSelectTradespersonMarker(usta.id);
        }
      });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; color: #0b132b; min-width: 170px; padding: 4px;">
          <div style="font-weight: 800; font-size: 14px; margin-bottom: 2px;">${usta.name}</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
            ${usta.services.slice(0, 2).join(' · ')}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <span style="font-size: 11px; font-weight: 700; color: #047857; background: #d1fae5; padding: 2px 6px; border-radius: 4px;">
              ${usta.badge ?? 'Doğrulanmış Usta'}
            </span>
            <a href="/ustalar/${usta.id}" style="font-size: 12px; font-weight: 700; color: #1246B5; text-decoration: none;">
              İncele →
            </a>
          </div>
        </div>
      `);

      marker.addTo(ustaGroup);
    });
  }, [tradespeopleMarkers, activeTradespersonId, onSelectTradespersonMarker]);

  // 4. Animated Yemeksepeti / Getir Target Pin Drop
  const dropTargetPin = useCallback((latLng: [number, number], label: string) => {
    const map = mapRef.current;
    if (!map) return;

    if (targetMarkerRef.current) {
      targetMarkerRef.current.remove();
    }

    const pinHtml = `
      <div class="${styles.targetPinWrapper}">
        <div class="${styles.targetPinRadar}"></div>
        <div class="${styles.targetPinTeardrop}">
          <span class="${styles.targetPinIcon}">⚡</span>
        </div>
      </div>
    `;

    const pinIcon = L.divIcon({
      html: pinHtml,
      className: '',
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -44],
    });

    const marker = L.marker(latLng, { icon: pinIcon }).addTo(map);

    marker.bindPopup(
      `<div style="font-family: inherit; font-size: 13px; font-weight: 700; color: #0b132b; text-align: center;">
        📍 ${label}<br/>
        <span style="font-size: 11px; font-weight: 600; color: #059669;">⚡ 20–30 Dk Usta Sevk Bölgesi</span>
      </div>`,
      { closeButton: false }
    );

    targetMarkerRef.current = marker;
  }, []);

  // 5. Smooth Camera Glide Animation (Yemeksepeti / Getir Style FlyTo)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedDistrict === 'all') {
      // Zoom out to macro Ankara
      map.flyTo([39.9255, 32.8530], 11, {
        duration: 1.25,
        easeLinearity: 0.25,
      });

      if (targetMarkerRef.current) {
        targetMarkerRef.current.remove();
        targetMarkerRef.current = null;
      }
    } else if (activeDistrictGeo) {
      // If a specific neighborhood is chosen, fly deep into it
      if (selectedNeighborhood) {
        const nCoords = getNeighborhoodCoordinates(activeDistrictGeo.name, selectedNeighborhood);
        if (nCoords) {
          map.flyTo(nCoords, 15.5, {
            duration: 1.1,
            easeLinearity: 0.2,
          });
          dropTargetPin(nCoords, `${selectedNeighborhood}, ${activeDistrictGeo.name}`);
          return;
        }
      }

      // Fly to district boundary
      map.flyToBounds(activeDistrictGeo.bounds, {
        padding: [60, 60],
        duration: 1.25,
        easeLinearity: 0.25,
      });

      dropTargetPin(activeDistrictGeo.latLngCenter, activeDistrictGeo.name);
    }
  }, [selectedDistrict, selectedNeighborhood, activeDistrictGeo, dropTargetPin]);

  // 6. Geolocation (Konumumu Bul)
  function handleLocateMe() {
    if (!navigator.geolocation) {
      alert('Tarayıcınız konum servisini desteklemiyor.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGpsLoading(false);
        const { latitude, longitude } = pos.coords;
        const map = mapRef.current;
        if (!map) return;

        // User blue pulsating marker
        if (userGpsMarkerRef.current) {
          userGpsMarkerRef.current.remove();
        }

        const gpsIcon = L.divIcon({
          html: `<div class="${styles.userGpsDot}"></div>`,
          className: '',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        userGpsMarkerRef.current = L.marker([latitude, longitude], { icon: gpsIcon }).addTo(map);

        // Find nearest Ankara district
        const nearest = findDistrictByLatLng(latitude, longitude);
        onSelectDistrict(nearest.id);

        map.flyTo([latitude, longitude], 14.5, {
          duration: 1.2,
          easeLinearity: 0.25,
        });
      },
      () => {
        setGpsLoading(false);
        // Default fallback to Ankara Kızılay if location denied
        onSelectDistrict('cankaya');
      },
      { timeout: 8000 }
    );
  }

  function handleZoomIn() {
    mapRef.current?.zoomIn();
  }

  function handleZoomOut() {
    mapRef.current?.zoomOut();
  }

  function handleResetView() {
    onSelectDistrict('all');
    if (onSelectNeighborhood) onSelectNeighborhood('');
  }

  const startRequestUrl = activeDistrictGeo
    ? `/?district=${encodeURIComponent(activeDistrictGeo.name)}${
        selectedNeighborhood ? `&neighborhood=${encodeURIComponent(selectedNeighborhood)}` : ''
      }&resume=1`
    : '/';

  return (
    <div className={styles.realMapOuter}>
      {/* Top Floating Control Bar */}
      <div className={styles.mapFloatingBar} role="toolbar" aria-label="Harita Görünüm Kontrolleri">
        <div className={styles.mapLayerSelector}>
          <button
            type="button"
            className={`${styles.mapLayerBtn} ${activeLayer === 'streets' ? styles.mapLayerBtnActive : ''}`}
            onClick={() => setActiveLayer('streets')}
            title="Sokak Haritası"
          >
            🗺️ Sokak
          </button>
          <button
            type="button"
            className={`${styles.mapLayerBtn} ${activeLayer === 'light' ? styles.mapLayerBtnActive : ''}`}
            onClick={() => setActiveLayer('light')}
            title="Açık Harita"
          >
            ☀️ Sade
          </button>
          <button
            type="button"
            className={`${styles.mapLayerBtn} ${activeLayer === 'satellite' ? styles.mapLayerBtnActive : ''}`}
            onClick={() => setActiveLayer('satellite')}
            title="Uydu Görüntüsü"
          >
            🛰️ Uydu
          </button>
        </div>

        <div className={styles.mapQuickActions}>
          <button
            type="button"
            className={styles.mapActionBtn}
            onClick={handleResetView}
            title="Tüm Ankara görünümüne dön"
          >
            ⟲ Tüm Ankara
          </button>
        </div>
      </div>

      {/* Right Side Floating Controls (Zoom + GPS) */}
      <div className={styles.floatingControlsRight}>
        <div className={styles.zoomBtnGroup}>
          <button type="button" className={styles.zoomBtn} onClick={handleZoomIn} title="Yakınlaştır" aria-label="Yakınlaştır">
            +
          </button>
          <button type="button" className={styles.zoomBtn} onClick={handleZoomOut} title="Uzaklaştır" aria-label="Uzaklaştır">
            −
          </button>
        </div>

        <button
          type="button"
          className={styles.gpsBtn}
          onClick={handleLocateMe}
          title="Konumumu Bul"
          aria-label="Konumumu Bul"
          disabled={gpsLoading}
        >
          {gpsLoading ? '⏳' : '🎯'}
        </button>
      </div>

      {/* Main Leaflet Viewport */}
      <div
        ref={containerRef}
        className={styles.realMapContainer}
        role="application"
        aria-label="İnteraktif Ankara Haritası"
      />

      {/* Yemeksepeti / Getir Style Bottom Drawer */}
      {drawerOpen && activeDistrictGeo && (
        <div className={styles.getirDrawer} role="region" aria-label="Seçilen Bölge Bilgileri">
          <div className={styles.drawerHeader}>
            <div className={styles.drawerTitleGroup}>
              <h3 className={styles.drawerDistrictName}>📍 {activeDistrictGeo.name}</h3>
              <span className={styles.drawerSlaBadge}>⚡ 20–30 dk Sevk SLA</span>
            </div>
            <button
              type="button"
              className={styles.drawerCloseBtn}
              onClick={() => setClosedDistrict(activeDistrictGeo.id)}
              aria-label="Kapat"
            >
              ✕
            </button>
          </div>

          <div className={styles.drawerNeighborhoodTitle}>Mahalle / Semt Seçimi:</div>
          <div className={styles.drawerPillsRow}>
            {activeDistrictGeo.neighborhoods.map(nb => {
              const isNbActive = selectedNeighborhood?.toLowerCase() === nb.toLowerCase();
              return (
                <button
                  key={nb}
                  type="button"
                  className={`${styles.drawerPill} ${isNbActive ? styles.drawerPillActive : ''}`}
                  onClick={() => {
                    if (onSelectNeighborhood) {
                      onSelectNeighborhood(isNbActive ? '' : nb);
                    }
                  }}
                >
                  {nb}
                </button>
              );
            })}
          </div>

          <div className={styles.drawerFooter}>
            <span className={styles.drawerTradeCount}>
              👥 <strong>{activeDistrictGeo.tradeCount}</strong> doğrulanmış usta aktif
            </span>

            {mode === 'picker' && onConfirmLocation ? (
              <button
                type="button"
                className={styles.drawerCtaBtn}
                onClick={() => onConfirmLocation(activeDistrictGeo.name, selectedNeighborhood)}
              >
                ✓ Bu Konumu Seç
              </button>
            ) : (
              <Link href={startRequestUrl} className={styles.drawerCtaBtn}>
                ⚡ Fiyat Teklifi Al →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
