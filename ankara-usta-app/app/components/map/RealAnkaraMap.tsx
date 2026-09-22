'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ankaraDistrictsGeo, ShopPin } from '../../data/ankaraMapGeo';
import styles from './ankaraMap.module.css';

interface RealAnkaraMapProps {
  filteredPins: ShopPin[];
  selectedDistrict: string;
  onSelectDistrict: (districtId: string) => void;
}

function getCategoryColor(type: ShopPin['categoryIcon']): string {
  switch (type) {
    case 'plumbing': return '#1246b5';
    case 'electric': return '#b45309';
    case 'carpentry': return '#78350f';
    case 'paint': return '#047857';
    default: return '#ea4335';
  }
}

function getCategorySvgIcon(type: ShopPin['categoryIcon']): string {
  switch (type) {
    case 'plumbing':
      return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M9 15h6"/></svg>';
    case 'electric':
      return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
    case 'carpentry':
      return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 3.26-6.36 6.36"/></svg>';
    case 'paint':
      return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="m5 2 5 5"/><path d="M2 13h15"/><path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"/></svg>';
    default:
      return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>';
  }
}

export default function RealAnkaraMap({
  filteredPins,
  selectedDistrict,
  onSelectDistrict,
}: RealAnkaraMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polygonLayerGroupRef = useRef<L.FeatureGroup | null>(null);
  const markerLayerGroupRef = useRef<L.FeatureGroup | null>(null);

  const [activeLayer, setActiveLayer] = useState<'streets' | 'satellite'>('streets');

  // 1. Initialize Leaflet Map once with real OpenStreetMap Gold Standard
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [39.9255, 32.8530], // Ankara Center (Kızılay)
      zoom: 12,
      minZoom: 9,
      maxZoom: 19,
      zoomControl: true,
      attributionControl: true,
    });

    // Default: OpenStreetMap (Full Turkish labels, real roads, neighborhoods, verified live!)
    const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Scale bar like Google Maps
    L.control.scale({ metric: true, imperial: false, position: 'bottomright' }).addTo(map);

    polygonLayerGroupRef.current = L.featureGroup().addTo(map);
    markerLayerGroupRef.current = L.featureGroup().addTo(map);
    mapRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Handle Layer Switching (Sokak vs Uydu)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    let url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    let maxZoom = 19;
    let attribution = '&copy; OpenStreetMap contributors';

    if (activeLayer === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 18;
      attribution = 'Esri, Maxar, Earthstar Geographics';
    }

    const newLayer = L.tileLayer(url, {
      maxZoom,
      attribution,
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [activeLayer]);

  // 4. Render / Update District Polygons
  useEffect(() => {
    const layerGroup = polygonLayerGroupRef.current;
    if (!layerGroup) return;
    layerGroup.clearLayers();

    ankaraDistrictsGeo.forEach((district) => {
      const isSelected = selectedDistrict === district.id || selectedDistrict === district.name;
      const polygon = L.polygon(district.polygonLatLngs, {
        color: isSelected ? '#1d3557' : '#0284c7',
        weight: isSelected ? 3.5 : 1.5,
        dashArray: isSelected ? undefined : '5, 5',
        fillColor: isSelected ? '#38bdf8' : district.color,
        fillOpacity: isSelected ? 0.22 : 0.05,
      });

      polygon.bindTooltip(
        '<strong>' + district.name + '</strong><br/><span style="font-size:11px">Temsili konsept bölgesi</span>',
        { sticky: true, direction: 'top' }
      );

      polygon.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectDistrict(isSelected ? 'all' : district.id);
      });

      polygon.addTo(layerGroup);
    });
  }, [selectedDistrict, onSelectDistrict]);

  // 5. Update Camera Viewport based on selectedDistrict
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedDistrict === 'all') {
      map.flyTo([39.9255, 32.8530], 11, { duration: 0.8 });
    } else {
      const district = ankaraDistrictsGeo.find(
        (d) => d.id === selectedDistrict || d.name.toLowerCase() === selectedDistrict.toLowerCase()
      );
      if (district) {
        map.flyToBounds(district.bounds, { padding: [40, 40], duration: 0.8 });
      }
    }
  }, [selectedDistrict]);

  // 6. Render Shop Pins Markers
  useEffect(() => {
    const layerGroup = markerLayerGroupRef.current;
    if (!layerGroup) return;
    layerGroup.clearLayers();

    filteredPins.forEach((pin) => {
      const lat = pin.latLng?.lat ?? 39.9255;
      const lng = pin.latLng?.lng ?? 32.8530;
      const color = getCategoryColor(pin.categoryIcon);
      const iconSvg = getCategorySvgIcon(pin.categoryIcon);
      const isPulse = false;

      const markerHtml = `
        <div class="${styles.leafletMarkerPin} ${isPulse ? styles.leafletMarkerPulse : ''}" style="--pin-color: ${color};">
          ${isPulse ? '<div class="' + styles.leafletPulseRing + '"></div>' : ''}
          <div class="${styles.leafletTeardrop}" style="background-color: ${color};">
            <div class="${styles.leafletInnerIcon}">
              ${iconSvg}
            </div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-leaflet-marker',
        iconSize: [32, 38],
        iconAnchor: [16, 38],
        popupAnchor: [0, -38],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupHtml = `
        <div class="${styles.leafletPopupCard}">
          <span class="${styles.infoBadge}">Temsili kayıt</span>
          <h4 class="${styles.infoTitle}">${pin.name}</h4>
          <div class="${styles.infoOwner}">${pin.ownerName} · ${pin.category}</div>
          <div class="${styles.infoMeta}">
            <span>Bölge: ${pin.address}</span>
            <span>Canlı ürün verisi değildir</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 320,
        className: 'custom-leaflet-popup',
      });

      marker.addTo(layerGroup);
    });
  }, [filteredPins]);

  function handleResetView() {
    onSelectDistrict('all');
    mapRef.current?.flyTo([39.9255, 32.8530], 11, { duration: 0.8 });
  }

  return (
    <div className={styles.realMapOuter}>
      {/* Google Maps Style Floating Control Bar */}
      <div className={styles.mapFloatingBar} role="toolbar" aria-label="Harita Görünüm ve Konum Kontrolleri">
        <div className={styles.mapLayerSelector}>
          <button
            type="button"
            className={styles.mapLayerBtn + (activeLayer === 'streets' ? ' ' + styles.mapLayerBtnActive : '')}
            onClick={() => setActiveLayer('streets')}
            title="Sokak haritası"
          >
            🗺️ Sokak
          </button>
          <button
            type="button"
            className={styles.mapLayerBtn + (activeLayer === 'satellite' ? ' ' + styles.mapLayerBtnActive : '')}
            onClick={() => setActiveLayer('satellite')}
            title="Uydu görüntüsü"
          >
            🛰️ Uydu
          </button>
        </div>

        <div className={styles.mapQuickActions}>
          <button
            type="button"
            className={styles.mapActionBtn}
            onClick={handleResetView}
            title="Ankara Merkeze Sıfırla"
          >
            ⟲ Ankara Merkez
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={styles.realMapContainer}
        role="application"
        aria-label="Temsili Ankara bölge haritası"
      />
    </div>
  );
}
