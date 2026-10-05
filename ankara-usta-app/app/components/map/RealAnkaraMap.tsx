'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import {
  ankaraDistrictsGeo,
  findDistrictByLatLng,
  getNeighborhoodCoordinates,
  ankaraRepresentativeShops,
  ankaraNeighborhoodCoordinates,
  ankaraCraftHubs,
  calculateDispatchSla,
  clusterShops,
  chaikinSmooth,
  type ShopPin,
  type GeoCluster,
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
  priceEstimate?: string;
  reviewCount?: number;
}

export interface RealAnkaraMapProps {
  filteredPins?: ShopPin[];
  tradespeopleMarkers?: TradespersonMapMarker[];
  activeTradespersonId?: string | null;
  onSelectTradespersonMarker?: (id: string) => void;
  onHoverTradespersonMarker?: (id: string | null) => void;
  selectedDistrict: string;
  selectedNeighborhood?: string;
  onSelectDistrict: (districtId: string) => void;
  onSelectNeighborhood?: (neighborhood: string) => void;
  mode?: 'discovery' | 'picker';
  onConfirmLocation?: (district: string, neighborhood?: string) => void;
  activeCategory?: string;
  onSelectShopPin?: (shop: ShopPin) => void;
  selectedShopId?: string | null;
  onShopSelected?: (shop: ShopPin | null) => void;
  enableManualPick?: boolean;
  isSplitPane?: boolean;
  onVisibleTradespeopleChange?: (visibleIds: string[] | null) => void;
  resetTrigger?: number;
  panToTradespersonId?: string | null;
}

const CATEGORY_ICONS: Record<string, string> = {
  carpentry: '🪚',
  repair: '🛠️',
  plumbing: '🔧',
  electric: '⚡',
  paint: '🎨',
  cleaning: '🧹',
};

const TILE_LAYERS = {
  streets: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19,
    subdomains: 'abc',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  light: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19,
    subdomains: 'abc',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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
  onHoverTradespersonMarker,
  filteredPins,
  activeCategory = 'all',
  onSelectShopPin,
  selectedShopId,
  onShopSelected,
  isSplitPane = false,
  onVisibleTradespeopleChange,
  resetTrigger,
  panToTradespersonId,
}: RealAnkaraMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polygonLayerGroupRef = useRef<L.FeatureGroup | null>(null);
  const hubLayerGroupRef = useRef<L.FeatureGroup | null>(null);
  const ustaLayerGroupRef = useRef<L.FeatureGroup | null>(null);
  const shopLayerGroupRef = useRef<L.FeatureGroup | null>(null);
  const targetMarkerRef = useRef<L.Marker | null>(null);
  const userGpsMarkerRef = useRef<L.Marker | null>(null);
  const manualMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const ustaMarkersMapRef = useRef<Record<string, L.Marker>>({});

  const [activeLayer, setActiveLayer] = useState<'streets' | 'light' | 'satellite'>('light');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [closedDistrict, setClosedDistrict] = useState<string | null>(null);
  const [selectedShop, setSelectedShop] = useState<ShopPin | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<GeoCluster<ShopPin> | null>(null);
  const [currentZoom, setCurrentZoom] = useState(11);
  // Split discovery starts with the full directory visible. Applying the
  // current viewport as a filter before Leaflet has measured the map can
  // briefly produce an empty result (0/N) even though markers are present.
  // Full-map mode keeps the explicit "Bu bölgede ara" behavior by default.
  const [searchThisArea, setSearchThisArea] = useState(!isSplitPane);
  const [visibleMarkerCount, setVisibleMarkerCount] = useState<number | null>(null);
  const [mapMoveCounter, setMapMoveCounter] = useState(0);
  const [tileLoadError, setTileLoadError] = useState(false);

  const onVisibleTradespeopleChangeRef = useRef(onVisibleTradespeopleChange);
  onVisibleTradespeopleChangeRef.current = onVisibleTradespeopleChange;
  const onSelectTradespersonMarkerRef = useRef(onSelectTradespersonMarker);
  onSelectTradespersonMarkerRef.current = onSelectTradespersonMarker;
  const onHoverTradespersonMarkerRef = useRef(onHoverTradespersonMarker);
  onHoverTradespersonMarkerRef.current = onHoverTradespersonMarker;
  const searchThisAreaRef = useRef(searchThisArea);
  searchThisAreaRef.current = searchThisArea;

  const [manualLocation, setManualLocation] = useState<{
    lat: number;
    lng: number;
    district: string;
    neighborhood?: string;
  } | null>(null);

  const [prevShopId, setPrevShopId] = useState<string | null | undefined>(undefined);
  if (selectedShopId !== prevShopId) {
    setPrevShopId(selectedShopId);
    if (selectedShopId) {
      const allShops = filteredPins ?? ankaraRepresentativeShops;
      const found = allShops.find(s => s.id === selectedShopId);
      if (found) {
        setSelectedShop(found);
        setSelectedCluster(null);
        setManualLocation(null);
      }
    }
  }

  const activeDistrictGeo = ankaraDistrictsGeo.find(
    d => d.id === selectedDistrict || d.name.toLowerCase() === selectedDistrict.toLowerCase()
  );
  const drawerOpen = Boolean(
    !isSplitPane &&
    activeDistrictGeo &&
    closedDistrict !== activeDistrictGeo.id &&
    !selectedShop &&
    !manualLocation &&
    !selectedCluster
  );

  const selectedShopTargetCoords: [number, number] | null = selectedShop
    ? [selectedShop.latLng?.lat ?? selectedShop.coords.y, selectedShop.latLng?.lng ?? selectedShop.coords.x]
    : null;

  const shopDispatchSla = selectedShopTargetCoords
    ? calculateDispatchSla(selectedShopTargetCoords, selectedShop?.categoryIcon)
    : null;

  const manualDispatchSla = manualLocation
    ? calculateDispatchSla(
        [manualLocation.lat, manualLocation.lng],
        activeCategory !== 'all' ? activeCategory : undefined
      )
    : null;

  // District centroid SLA — used in bottom sheet stat cards
  const districtDispatchSla = activeDistrictGeo
    ? calculateDispatchSla(activeDistrictGeo.latLngCenter, activeCategory !== 'all' ? activeCategory : undefined)
    : null;

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

    const layerConfig = TILE_LAYERS.light;
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
    shopLayerGroupRef.current = L.featureGroup().addTo(map);
    mapRef.current = map;

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    const handleMoveEnd = () => {
      if (!mapRef.current) return;
      const bounds = mapRef.current.getBounds();
      if (tradespeopleMarkers && tradespeopleMarkers.length > 0) {
        const visible = tradespeopleMarkers.filter(m => bounds.contains(m.latLng));
        setVisibleMarkerCount(visible.length);
        if (searchThisAreaRef.current) {
          onVisibleTradespeopleChangeRef.current?.(visible.map(m => m.id));
        }
        if (tradespeopleMarkers.length > 60) {
          setMapMoveCounter(prev => prev + 1);
        }
      }
    };
    map.on('moveend', handleMoveEnd);

    const timer = setTimeout(() => {
      map.invalidateSize();
      handleMoveEnd();
    }, 150);

    let resizeTimer: ReturnType<typeof setTimeout>;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        map.invalidateSize();
      }, 50);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      map.off('zoomend');
      map.off('moveend', handleMoveEnd);
      map.remove();
      mapRef.current = null;
    };
  }, [tradespeopleMarkers]);

  // Leaflet can initialize while the split pane is still measuring at zero
  // height. Re-measure once the pane is visible and keep the unfiltered map at
  // the Ankara overview instead of inheriting a stale street-level zoom.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isSplitPane) return;

    const frame = requestAnimationFrame(() => {
      map.invalidateSize({ pan: false });
      if (!selectedDistrict || selectedDistrict === 'all') {
        map.setView([39.9255, 32.8530], 11, { animate: false });
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [isSplitPane, selectedDistrict]);

  // Listen to resetTrigger to return to full Ankara view
  useEffect(() => {
    if (!resetTrigger || !mapRef.current) return;
    mapRef.current.flyTo([39.9255, 32.8530], 11, { duration: 0.8 });
    setSearchThisArea(true);
    searchThisAreaRef.current = true;
    onVisibleTradespeopleChangeRef.current?.(null);
    if (tradespeopleMarkers) {
      setVisibleMarkerCount(tradespeopleMarkers.length);
    }
  }, [resetTrigger, tradespeopleMarkers]);


  const handleToggleSearchThisArea = (checked: boolean) => {
    setSearchThisArea(checked);
    searchThisAreaRef.current = checked;
    if (checked) {
      if (mapRef.current && tradespeopleMarkers && tradespeopleMarkers.length > 0) {
        const bounds = mapRef.current.getBounds();
        const visible = tradespeopleMarkers.filter(m => bounds.contains(m.latLng));
        setVisibleMarkerCount(visible.length);
        onVisibleTradespeopleChangeRef.current?.(visible.map(m => m.id));
      }
    } else {
      onVisibleTradespeopleChangeRef.current?.(null);
    }
  };

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
    });

    // Resilient fallback: If Carto or Esri tiles fail, gracefully switch to OpenStreetMap
    newLayer.on('tileload', () => {
      setTileLoadError(false);
    });
    newLayer.on('tileerror', () => {
      if (activeLayer !== 'streets') {
        setActiveLayer('streets');
      } else {
        setTileLoadError(true);
      }
    });

    newLayer.addTo(map);
    tileLayerRef.current = newLayer;
  }, [activeLayer]);

  // 2.5 Fly camera when selectedShopId changes
  useEffect(() => {
    if (!selectedShopId) return;
    const allShops = filteredPins ?? ankaraRepresentativeShops;
    const found = allShops.find(s => s.id === selectedShopId);
    if (found) {
      const sLat = found.latLng?.lat ?? found.coords.y;
      const sLng = found.latLng?.lng ?? found.coords.x;
      mapRef.current?.flyTo([sLat, sLng], 15, { duration: 1.0 });
    }
  }, [selectedShopId, filteredPins]);

  // 2.7 Category Auto-Glide: Focus camera on specialized Craft Triangle Hub
  const prevCategoryRef = useRef(activeCategory);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (activeCategory === prevCategoryRef.current) return;
    prevCategoryRef.current = activeCategory;

    if (!activeCategory || activeCategory === 'all') {
      if (selectedDistrict === 'all') {
        map.flyTo([39.9255, 32.8530], 11, { duration: 1.0 });
      }
      return;
    }

    const hub = ankaraCraftHubs.find(h =>
      (h.primaryCategories as string[]).includes(activeCategory)
    );
    if (hub) {
      map.flyTo(hub.latLng, 13.5, { duration: 1.1 });
    }
  }, [activeCategory, selectedDistrict]);

  // 2.8 Remember preferred district locally
  useEffect(() => {
    if (selectedDistrict && selectedDistrict !== 'all') {
      try {
        localStorage.setItem('orkestra_preferred_district', selectedDistrict);
      } catch {
        // Safe fallback in restricted environments
      }
    }
  }, [selectedDistrict]);

  // 3. Render / Update District Polygons & Hub Badges (Airbnb Ambient Focus & Zoom LOD)
  useEffect(() => {
    const polyGroup = polygonLayerGroupRef.current;
    const hubGroup = hubLayerGroupRef.current;
    if (!polyGroup || !hubGroup) return;

    polyGroup.clearLayers();
    hubGroup.clearLayers();

    // Zoom LOD: At deep street level (zoom >= 14), declutter boundaries so street fabric and pins are never sliced
    if (currentZoom < 14) {
      // 3.1 Airbnb Inverted Ambient Focus Mask
      // When a specific district is selected, dim the outer world with a neutral wash leaving the district illuminated
      const hasSpecificDistrict = selectedDistrict && selectedDistrict !== 'all';
      const targetDistrict = hasSpecificDistrict
        ? ankaraDistrictsGeo.find(d => d.id === selectedDistrict || d.name === selectedDistrict)
        : null;

      if (targetDistrict) {
        const outerWorld: [number, number][] = [
          [85, -180],
          [85, 180],
          [-85, 180],
          [-85, -180],
        ];
        const maskPolygon = L.polygon([outerWorld, targetDistrict.polygonLatLngs], {
          stroke: false,
          fillColor: '#0b132b',
          fillOpacity: 0.08,
          interactive: false,
          className: styles.ambientFocusMask,
        });
        maskPolygon.addTo(polyGroup);
      }

      // 3.2 Render Exact Administrative Boundaries (OSM standard, no geometric distortion)
      ankaraDistrictsGeo.forEach(district => {
        const isSelected = selectedDistrict === district.id || selectedDistrict === district.name;

        // Clean, authentic administrative boundary polygon
        const polygon = L.polygon(district.polygonLatLngs, {
          color: isSelected ? '#0f172a' : 'rgba(51, 65, 85, 0.40)',
          weight: isSelected ? 2.2 : 1.2,
          dashArray: undefined,
          fillColor: isSelected ? '#1e293b' : 'rgba(241, 245, 249, 0.15)',
          fillOpacity: isSelected ? 0.08 : 0.02,
          className: `${styles.districtPolygonOrganic} ${isSelected ? styles.polygonSelected : ''}`,
        });

        polygon.bindTooltip(
          `<div class="${styles.cleanPinTooltip}"><strong>${district.name}</strong> · ${district.tradeCount} Doğrulanmış Usta</div>`,
          { sticky: true, direction: 'top', opacity: 0.98 }
        );

        polygon.on('mouseover', () => {
          if (selectedDistrict !== district.id && selectedDistrict !== district.name) {
            polygon.setStyle({
              color: '#1d4ed8',
              weight: 1.8,
              fillColor: '#2563eb',
              fillOpacity: 0.06,
            });
          }
        });

        polygon.on('mouseout', () => {
          if (selectedDistrict !== district.id && selectedDistrict !== district.name) {
            polygon.setStyle({
              color: 'rgba(51, 65, 85, 0.40)',
              weight: 1.2,
              fillColor: 'rgba(241, 245, 249, 0.15)',
              fillOpacity: 0.02,
            });
          }
        });

        polygon.on('click', e => {
          L.DomEvent.stopPropagation(e);
          onSelectDistrict(isSelected ? 'all' : district.id);
        });

        polygon.addTo(polyGroup);
      });
    }

    // Render Ankara Craft Triangle Hubs (Siteler, Ostim, Rüzgarlı) - Only in Full Canvas Mode
    if (!isSplitPane) {
      ankaraCraftHubs.forEach(hub => {
        const hubHtml = `
          <div class="${styles.craftHubToken}">
            <span class="${styles.craftHubLabel}">${hub.shortName}</span>
          </div>
        `;
        const hubIcon = L.divIcon({
          html: hubHtml,
          className: '',
          iconSize: [68, 24],
          iconAnchor: [34, 12],
        });
        const marker = L.marker(hub.latLng, { icon: hubIcon, zIndexOffset: 900 });
        marker.bindTooltip(
          `<div class="${styles.craftHubTooltip}">${hub.name} · ${hub.tradeCapacity}+ Zanaatkâr</div>`,
          { direction: 'top', offset: [0, -14], opacity: 0.98 }
        );
        marker.on('click', e => {
          L.DomEvent.stopPropagation(e);
          mapRef.current?.flyTo(hub.latLng, 14.5, { duration: 1.1 });
        });
        marker.addTo(hubGroup);
      });
    }
  }, [selectedDistrict, onSelectDistrict, isSplitPane, currentZoom]);

  // 3.8 Live Dispatch SLA Route Arc between Craft Hub and Target
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    const sla = shopDispatchSla || manualDispatchSla;
    if (!sla) return;

    const arcLine = L.polyline(sla.routePoints, {
      color: '#1d4ed8',
      weight: 2.5,
      dashArray: '5, 8',
      opacity: 0.8,
    }).addTo(map);

    routePolylineRef.current = arcLine;

    return () => {
      if (routePolylineRef.current) {
        routePolylineRef.current.remove();
        routePolylineRef.current = null;
      }
    };
  }, [shopDispatchSla, manualDispatchSla]);

  // 3.5 Render Tradesperson Directory Markers (Airbnb Split-View, Quiet 32px Token Standard)
  useEffect(() => {
    const ustaGroup = ustaLayerGroupRef.current;
    if (!ustaGroup) return;

    ustaGroup.clearLayers();
    ustaMarkersMapRef.current = {};
    if (!tradespeopleMarkers || tradespeopleMarkers.length === 0) return;

    // Faz 5: 60 FPS Viewport Windowing & Density Control for 500+ markers
    let markersToRender = tradespeopleMarkers;
    const map = mapRef.current;
    if (map && tradespeopleMarkers.length > 60) {
      try {
        const bufferedBounds = map.getBounds().pad(0.35); // 35% margin around viewport
        const inBounds = tradespeopleMarkers.filter(m => bufferedBounds.contains(m.latLng));
        if (activeTradespersonId && !inBounds.some(m => m.id === activeTradespersonId)) {
          const activeMarker = tradespeopleMarkers.find(m => m.id === activeTradespersonId);
          if (activeMarker) inBounds.unshift(activeMarker);
        }
        markersToRender = inBounds.length > 0 ? inBounds.slice(0, 100) : tradespeopleMarkers.slice(0, 60);
      } catch {
        markersToRender = tradespeopleMarkers.slice(0, 60);
      }
    }

    markersToRender.forEach(usta => {
      const isHighlighted = activeTradespersonId === usta.id;
      // Determine service icon from first service tag
      const serviceIconMap: Record<string, string> = {
        'tesisat': '🔧', 'musluk': '🔧', 'plumbing': '🔧',
        'elektrik': '⚡', 'electric': '⚡', 'pano': '⚡',
        'ahşap': '🪚', 'mobilya': '🪚', 'carpentry': '🪚',
        'boya': '🎨', 'badana': '🎨', 'paint': '🎨',
        'metal': '🛠️', 'kaynak': '🛠️', 'repair': '🛠️',
      };
      const firstService = (usta.services[0] ?? '').toLowerCase();
      const serviceIcon = Object.entries(serviceIconMap).find(([k]) =>
        firstService.includes(k)
      )?.[1] ?? '🛠️';

      // Airbnb 2026 Whisper Pin Standard: Calm neutral price pill by default; expands on hover/active
      const ratingText = usta.rating ? usta.rating.toFixed(1) : '4.9';
      const priceText = usta.priceEstimate ?? (firstService.includes('elektrik') ? '₺500' : firstService.includes('tesisat') ? '₺550' : '₺450');
      const reviewCount = usta.reviewCount ?? 28;
      const initials = usta.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
      const firstName = usta.name.split(' ')[0] || usta.name;
      const markerHtml = `
        <div class="${styles.airbnbMapPill} ${isHighlighted ? styles.airbnbMapPillActive : ''}">
          <span class="${styles.airbnbPillDefault}">
            <span class="${styles.airbnbPillPrice}">${priceText}</span>
          </span>
          <span class="${styles.airbnbPillExpanded}">
            <span class="${styles.airbnbPillRating}">★ ${ratingText}</span>
            <span class="${styles.airbnbPillName}">· ${firstName}</span>
            <span class="${styles.airbnbPillActivePrice}">· ${priceText}</span>
          </span>
        </div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: styles.airbnbDivIconWrapper || '',
        iconSize: [64, 26],
        iconAnchor: [32, 13],
      });

      const marker = L.marker(usta.latLng, {
        icon,
        zIndexOffset: isHighlighted ? 2500 : 150,
        keyboard: true,
        title: `${usta.name} · ★ ${ratingText} · ${priceText} (${usta.services[0] || 'Usta'})`,
        alt: `${usta.name} harita pini`,
      });

      ustaMarkersMapRef.current[usta.id] = marker;

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        marker.openPopup();
        if (onSelectTradespersonMarkerRef.current) {
          onSelectTradespersonMarkerRef.current(usta.id);
        }
      });

      // Two-Way Spatial Resonance: Hovering or focusing pin highlights card in left list
      marker.on('mouseover', () => {
        const pill = marker.getElement()?.querySelector(`.${styles.airbnbMapPill}`);
        if (pill) {
          pill.classList.add(styles.airbnbMapPillActive);
        }
        marker.setZIndexOffset(2500);
        if (onHoverTradespersonMarkerRef.current) {
          onHoverTradespersonMarkerRef.current(usta.id);
        }
      });

      marker.on('focus', () => {
        const pill = marker.getElement()?.querySelector(`.${styles.airbnbMapPill}`);
        if (pill) {
          pill.classList.add(styles.airbnbMapPillActive);
        }
        marker.setZIndexOffset(2500);
        if (onHoverTradespersonMarkerRef.current) {
          onHoverTradespersonMarkerRef.current(usta.id);
        }
      });

      marker.on('blur', () => {
        if (activeTradespersonId !== usta.id) {
          const pill = marker.getElement()?.querySelector(`.${styles.airbnbMapPill}`);
          if (pill) {
            pill.classList.remove(styles.airbnbMapPillActive);
          }
          marker.setZIndexOffset(150);
        }
      });

      marker.on('mouseout', () => {
        if (activeTradespersonId !== usta.id) {
          const pill = marker.getElement()?.querySelector(`.${styles.airbnbMapPill}`);
          if (pill) {
            pill.classList.remove(styles.airbnbMapPillActive);
          }
          marker.setZIndexOffset(150);
        }
        if (onHoverTradespersonMarkerRef.current) {
          onHoverTradespersonMarkerRef.current(null);
        }
      });

      // WCAG 2.1 AA Keyboard Traversal & Pin Activation
      marker.on('focus', () => {
        if (onSelectTradespersonMarkerRef.current) {
          onSelectTradespersonMarkerRef.current(usta.id);
        }
      });

      marker.on('keypress', (e: any) => {
        if (e.originalEvent?.key === 'Enter' || e.originalEvent?.key === ' ') {
          L.DomEvent.stopPropagation(e);
          marker.openPopup();
          if (onSelectTradespersonMarkerRef.current) {
            onSelectTradespersonMarkerRef.current(usta.id);
          }
        }
      });

      marker.on('keydown', (e: any) => {
        if (e.originalEvent?.key === 'Escape') {
          marker.closePopup();
        }
      });

      // Airbnb-Style Floating Listing Card Popup (Details-on-Demand)
      marker.bindPopup(`
        <div class="${styles.airbnbPopupCard}" role="dialog" aria-label="${usta.name} önizleme kartı">
          <div class="${styles.airbnbPopupHeader}">
            <div class="${styles.airbnbPopupAvatar}">${initials}</div>
            <div class="${styles.airbnbPopupHeaderInfo}">
              <span class="${styles.airbnbPopupCategory}">${usta.services[0] || 'Zanaatkâr'}</span>
              <span class="${styles.airbnbPopupBadge}">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style="vertical-align: -1px; margin-right: 2px;">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2.5"/>
                  <path d="M7.5 12l3 3 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                MYK-4 Onaylı
              </span>
            </div>
          </div>
          <h4 class="${styles.airbnbPopupTitle}">${usta.name}</h4>
          <div class="${styles.airbnbPopupRatingRow}">
            <span class="${styles.airbnbPopupStar}">★ ${ratingText}</span>
            <span class="${styles.airbnbPopupReviews}">(${reviewCount})</span>
            <span class="${styles.airbnbPopupDot}">·</span>
            <span class="${styles.airbnbPopupDistrict}">📍 ${usta.district}</span>
          </div>
          <div class="${styles.airbnbPopupFooter}">
            <div class="${styles.airbnbPopupPrice}">
              <strong>${priceText}</strong> <small>taban</small>
            </div>
            <div class="${styles.airbnbPopupActions}">
              <a href="/#services" class="${styles.airbnbPopupQuoteBtn}">
                ⚡ Teklif İste
              </a>
              <a href="/ustalar/${usta.id}" class="${styles.airbnbPopupCta}">
                İncele →
              </a>
            </div>
          </div>
        </div>
      `, {
        className: styles.airbnbCustomPopupWrapper || '',
        closeButton: true,
        closeOnEscapeKey: true,
        offset: [0, -14],
        maxWidth: 270,
        autoClose: true,
        closeOnClick: false,
      });

      marker.addTo(ustaGroup);
    });

    if (typeof window !== 'undefined') {
      (window as any).__openUstaPopup = (id: string) => {
        const m = ustaMarkersMapRef.current[id];
        if (m) m.openPopup();
      };
      (window as any).__ustaMarkers = ustaMarkersMapRef.current;
    }
  }, [tradespeopleMarkers, mapMoveCounter]);

  // 3.5b Real-Time Active Marker Highlight & Halo without re-creating layer (60 FPS & Persistent Popups)
  useEffect(() => {
    Object.entries(ustaMarkersMapRef.current).forEach(([id, marker]) => {
      const isHighlighted = activeTradespersonId === id;
      const el = marker.getElement();
      if (el) {
        const pill = el.querySelector(`.${styles.airbnbMapPill}`);
        if (pill) {
          if (isHighlighted) {
            pill.classList.add(styles.airbnbMapPillActive);
            marker.setZIndexOffset(2500);
          } else {
            pill.classList.remove(styles.airbnbMapPillActive);
            marker.setZIndexOffset(150);
          }
        }
      }
    });
  }, [activeTradespersonId]);

  // 3.5c Pan to tradesperson marker and open preview popup when requested from list (Two-Way Resonance)
  useEffect(() => {
    if (!panToTradespersonId || !mapRef.current) return;
    const marker = ustaMarkersMapRef.current[panToTradespersonId];
    if (marker) {
      const latLng = marker.getLatLng();
      mapRef.current.panTo(latLng, { animate: true, duration: 0.5 });
      marker.openPopup();
    }
  }, [panToTradespersonId]);

  // 3.6 Render Yemeksepeti-style Artisan Shop Pins
  useEffect(() => {
    const shopGroup = shopLayerGroupRef.current;
    if (!shopGroup) return;

    shopGroup.clearLayers();

    // Determine pins to render
    const pinsToRender =
      filteredPins ??
      (tradespeopleMarkers && tradespeopleMarkers.length > 0 ? [] : ankaraRepresentativeShops);

    if (!pinsToRender || pinsToRender.length === 0) return;

    const filteredActiveShops = pinsToRender.filter(shop => {
      // Category filter check
      if (activeCategory && activeCategory !== 'all' && shop.categoryIcon !== activeCategory) {
        return false;
      }

      // District filter check
      if (selectedDistrict !== 'all') {
        const matchDist = ankaraDistrictsGeo.find(
          d => d.id === selectedDistrict || d.name.toLowerCase() === selectedDistrict.toLowerCase()
        );
        if (matchDist && shop.district.toLowerCase() !== matchDist.name.toLowerCase()) {
          return false;
        }
      }
      return true;
    });

    const clusters = clusterShops(filteredActiveShops, currentZoom);

    clusters.forEach(cluster => {
      if (cluster.isCluster) {
        const markerHtml = `
          <div class="${styles.clusterPinToken}">
            <span class="${styles.clusterBadgeLabel}">${cluster.district}</span>
            <span class="${styles.clusterBadgeCount}">${cluster.count}</span>
          </div>
        `;
        const icon = L.divIcon({
          html: markerHtml,
          className: '',
          iconSize: [96, 28],
          iconAnchor: [48, 14],
        });
        const marker = L.marker(cluster.center, { icon, zIndexOffset: 450 });
        marker.bindTooltip(
          `<div class="${styles.cleanPinTooltip}">${cluster.label} (Yakınlaşmak için tıklayın)</div>`,
          { direction: 'top', offset: [0, -16], opacity: 0.98 }
        );
        marker.on('click', () => {
          setSelectedCluster(cluster);
          setSelectedShop(null);
          setManualLocation(null);
          mapRef.current?.flyTo(cluster.center, Math.min(currentZoom + 2, 14), { duration: 0.8 });
        });
        marker.addTo(shopGroup);
      } else {
        const shop = cluster.items[0];
        const isSelected = selectedShop?.id === shop.id;

        const markerHtml = `
          <div class="${styles.airbnbMapPill} ${isSelected ? styles.airbnbMapPillActive : ''}">
            <span class="${styles.airbnbPillRating}">★ ${shop.rating.toFixed(1)}</span>
            <span class="${styles.airbnbPillPrice}">· ${shop.name.split(' ')[0]}</span>
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: styles.airbnbDivIconWrapper || '',
          iconSize: [78, 28],
          iconAnchor: [39, 14],
        });

        const lat = cluster.center[0];
        const lng = cluster.center[1];

        const marker = L.marker([lat, lng], {
          icon: customIcon,
          zIndexOffset: isSelected ? 1600 : 300,
        });

        marker.bindTooltip(
          `<div class="${styles.cleanPinTooltip}">${shop.name} · ★ ${shop.rating.toFixed(1)}</div>`,
          { direction: 'top', offset: [0, -16], opacity: 0.98 }
        );

        if (isSelected) {
          marker.openTooltip();
        }

        marker.on('click', () => {
          setSelectedShop(shop);
          setSelectedCluster(null);
          setManualLocation(null);
          if (onSelectShopPin) onSelectShopPin(shop);
          if (onShopSelected) onShopSelected(shop);
          mapRef.current?.panTo([lat, lng], { animate: true });
        });

        marker.addTo(shopGroup);
      }
    });
  }, [
    filteredPins,
    tradespeopleMarkers,
    activeCategory,
    selectedDistrict,
    selectedShop,
    currentZoom,
    onSelectShopPin,
    onShopSelected,
  ]);

  // 3.7 Handle Map Click for Natural Location Picking (Uber / Bolt Benchmark - Only in Full Canvas Mode)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || isSplitPane) return;

    function handleMapClick(e: L.LeafletMouseEvent) {
      const { lat, lng } = e.latlng;
      const matchedDistrict = findDistrictByLatLng(lat, lng);

      let closestNeighborhood = '';
      const neighCoords = ankaraNeighborhoodCoordinates[matchedDistrict.name];
      if (neighCoords) {
        let minDist = Number.MAX_VALUE;
        for (const [nName, coords] of Object.entries(neighCoords)) {
          const dLat = coords[0] - lat;
          const dLng = coords[1] - lng;
          const dist = dLat * dLat + dLng * dLng;
          if (dist < minDist) {
            minDist = dist;
            closestNeighborhood = nName;
          }
        }
      }

      setSelectedShop(null);
      setSelectedCluster(null);
      if (onShopSelected) onShopSelected(null);
      setManualLocation({
        lat,
        lng,
        district: matchedDistrict.name,
        neighborhood: closestNeighborhood || undefined,
      });

      if (manualMarkerRef.current) {
        manualMarkerRef.current.remove();
      }

      const pinHtml = `
        <div style="position: relative; width: 34px; height: 34px;">
          <div class="${styles.minimalTargetPin}">
            <span>📍</span>
          </div>
        </div>
      `;

      const pinIcon = L.divIcon({
        html: pinHtml,
        className: '',
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      });

      const currentMap = mapRef.current;
      if (currentMap) {
        const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(currentMap);
        manualMarkerRef.current = marker;
      }
    }

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [onShopSelected]);

  // 4. Clean Target Pin Drop
  const dropTargetPin = useCallback((latLng: [number, number], label: string) => {
    const map = mapRef.current;
    if (!map) return;

    if (targetMarkerRef.current) {
      targetMarkerRef.current.remove();
    }

    const pinHtml = `
      <div class="${styles.targetPinWrapper}">
        <div class="${styles.targetPinTeardrop}">
          <span class="${styles.targetPinIcon}">📍</span>
        </div>
      </div>
    `;

    const pinIcon = L.divIcon({
      html: pinHtml,
      className: '',
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38],
    });

    const marker = L.marker(latLng, { icon: pinIcon }).addTo(map);

    marker.bindPopup(
      `<div style="font-family: inherit; font-size: 13px; font-weight: 700; color: #0f172a; text-align: center;">
        📍 ${label}<br/>
        <span style="font-size: 11px; font-weight: 600; color: #059669;">20–30 Dk Ortalama Usta Mesafesi</span>
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
    setSelectedShop(null);
    setManualLocation(null);
    if (manualMarkerRef.current) {
      manualMarkerRef.current.remove();
      manualMarkerRef.current = null;
    }
  }

  const startRequestUrl = activeDistrictGeo
    ? `/?district=${encodeURIComponent(activeDistrictGeo.name)}${
        selectedNeighborhood ? `&neighborhood=${encodeURIComponent(selectedNeighborhood)}` : ''
      }&resume=1`
    : '/';

  return (
    <div
      className={`${styles.realMapOuter} ${styles.declutteredMapContainer} ${
        activeLayer === 'light' ? styles.lightModeCanvas : activeLayer === 'streets' ? styles.streetsModeCanvas : ''
      }`}
    >
      {/* Airbnb Benchmark: "Bu bölgede ara" Floating Toggle Pill (Top-Center) */}
      <div className={styles.airbnbSearchAreaPill} role="status">
        <label className={styles.airbnbSearchAreaLabel}>
          <input
            type="checkbox"
            checked={searchThisArea}
            onChange={e => handleToggleSearchThisArea(e.target.checked)}
            className={styles.airbnbSearchAreaCheckbox}
          />
          <span>
            Bu bölgede ara
            {visibleMarkerCount !== null ? ` (${visibleMarkerCount} usta)` : ''}
          </span>
        </label>
        {searchThisArea && visibleMarkerCount !== null && (
          <button
            type="button"
            className={styles.airbnbResetSpatialBtn}
            onClick={() => handleToggleSearchThisArea(false)}
            title="Bölge filtresini kaldır ve tüm Ankara ustalarını göster"
          >
            ✕ Tümünü Göster
          </button>
        )}
      </div>

      {tileLoadError && (
        <div className={styles.mapStatusBanner} role="alert">
          <span>Harita görüntüsü yüklenemedi.</span>
          <button
            type="button"
            onClick={() => {
              setTileLoadError(false);
              setActiveLayer('light');
            }}
          >
            Yeniden dene
          </button>
        </div>
      )}

      {tradespeopleMarkers?.length === 0 ? (
        <div className={styles.mapEmptyState} role="status">
          <strong>Bu bölgede henüz uygun usta yok</strong>
          <span>Haritayı genişletin veya aramayı tüm Ankara için açın.</span>
          <button type="button" onClick={() => handleToggleSearchThisArea(false)}>
            Tüm Ankara&apos;yı göster
          </button>
        </div>
      ) : searchThisArea && visibleMarkerCount === 0 ? (
        <div className={styles.mapEmptyState} role="status">
          <strong>Bu bölgede usta bulunamadı</strong>
          <span>Haritayı taşıyın veya aramayı genişletin.</span>
          <button type="button" onClick={() => handleToggleSearchThisArea(false)}>
            Tüm ustaları göster
          </button>
        </div>
      ) : null}

      {/* Floating Utility Controls (Airbnb & Maps Standard) */}
      {isSplitPane ? (
        <>
          {/* In Split-Pane mode: Bottom-Left Layer Switcher */}
          <div className={styles.splitBottomLeftControls} role="toolbar" aria-label="Harita Katmanları">
            <div className={styles.layerPillToggle}>
              <button
                type="button"
                className={`${styles.layerOptionBtn} ${activeLayer === 'light' ? styles.layerOptionBtnActive : ''}`}
                onClick={() => setActiveLayer('light')}
                title="Sade & Minimalist Harita"
              >
                Sade
              </button>
              <button
                type="button"
                className={`${styles.layerOptionBtn} ${activeLayer === 'streets' ? styles.layerOptionBtnActive : ''}`}
                onClick={() => setActiveLayer('streets')}
                title="Sokak Haritası"
              >
                Sokak
              </button>
              <button
                type="button"
                className={`${styles.layerOptionBtn} ${activeLayer === 'satellite' ? styles.layerOptionBtnActive : ''}`}
                onClick={() => setActiveLayer('satellite')}
                title="Uydu Görüntüsü"
              >
                Uydu
              </button>
            </div>
          </div>

          {/* In Split-Pane mode: Bottom-Right Zoom & Locate Stack */}
          <div className={styles.splitBottomRightControls} role="toolbar" aria-label="Harita Yakınlaştırma ve Konum">
            <div className={styles.utilityControlGroup}>
              <button
                type="button"
                className={styles.utilityBtn}
                onClick={handleZoomIn}
                title="Yakınlaştır"
                aria-label="Yakınlaştır"
              >
                +
              </button>
              <button
                type="button"
                className={styles.utilityBtn}
                onClick={handleZoomOut}
                title="Uzaklaştır"
                aria-label="Uzaklaştır"
              >
                −
              </button>
              <button
                type="button"
                className={styles.utilityBtn}
                onClick={handleLocateMe}
                title="Konumumu Bul"
                aria-label="Konumumu Bul"
                disabled={gpsLoading}
              >
                {gpsLoading ? '⏳' : '🎯'}
              </button>
              <button
                type="button"
                className={styles.utilityBtn}
                onClick={handleResetView}
                title="Tüm Ankara Görünümüne Sıfırla"
                aria-label="Tüm Ankara Görünümüne Sıfırla"
              >
                ⟲
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.floatingUtilityStack} role="toolbar" aria-label="Harita Kontrolleri">
          <div className={styles.layerPillToggle}>
            <button
              type="button"
              className={`${styles.layerOptionBtn} ${activeLayer === 'light' ? styles.layerOptionBtnActive : ''}`}
              onClick={() => setActiveLayer('light')}
              title="Sade & Minimalist Harita"
            >
              ☀️ Sade
            </button>
            <button
              type="button"
              className={`${styles.layerOptionBtn} ${activeLayer === 'streets' ? styles.layerOptionBtnActive : ''}`}
              onClick={() => setActiveLayer('streets')}
              title="Sokak Haritası"
            >
              🗺️ Sokak
            </button>
            <button
              type="button"
              className={`${styles.layerOptionBtn} ${activeLayer === 'satellite' ? styles.layerOptionBtnActive : ''}`}
              onClick={() => setActiveLayer('satellite')}
              title="Uydu Görüntüsü"
            >
              🛰️ Uydu
            </button>
          </div>

          <div className={styles.utilityControlGroup}>
            <button
              type="button"
              className={styles.utilityBtn}
              onClick={handleZoomIn}
              title="Yakınlaştır"
              aria-label="Yakınlaştır"
            >
              +
            </button>
            <button
              type="button"
              className={styles.utilityBtn}
              onClick={handleZoomOut}
              title="Uzaklaştır"
              aria-label="Uzaklaştır"
            >
              −
            </button>
            <button
              type="button"
              className={styles.utilityBtn}
              onClick={handleLocateMe}
              title="Konumumu Bul"
              aria-label="Konumumu Bul"
              disabled={gpsLoading}
            >
              {gpsLoading ? '⏳' : '🎯'}
            </button>
            <button
              type="button"
              className={styles.utilityBtn}
              onClick={handleResetView}
              title="Tüm Ankara Görünümüne Sıfırla"
              aria-label="Tüm Ankara Görünümüne Sıfırla"
            >
              ⟲
            </button>
          </div>
        </div>
      )}

      {/* Main Leaflet Viewport */}
      <div
        ref={containerRef}
        className={styles.realMapContainer}
        role="application"
        aria-label="İnteraktif Ankara Haritası"
      />

      {/* Unified Progressive Bottom Sheet (Google Maps / Wolt Style) */}
      {(selectedShop || manualLocation || selectedCluster || (drawerOpen && activeDistrictGeo)) && (
        <div className={styles.unifiedBottomSheet} role="region" aria-label="Harita Detay Paneli">
          {selectedShop ? (
            <div className={styles.sheetContent}>
              <div className={styles.sheetTopRow}>
                <div className={styles.sheetTitleCol}>
                  <span className={styles.sheetEyebrow}>ZANAATKÂR ATÖLYESİ</span>
                  <h3 className={styles.sheetMainTitle}>
                    {CATEGORY_ICONS[selectedShop.categoryIcon] || '🛠️'} {selectedShop.name}
                  </h3>
                </div>
                <button
                  type="button"
                  className={styles.sheetCloseBtn}
                  onClick={() => {
                    setSelectedShop(null);
                    if (onShopSelected) onShopSelected(null);
                  }}
                  aria-label="Kapat"
                >
                  ✕
                </button>
              </div>

              <div className={styles.sheetBadgesRow}>
                <span className={styles.sheetRatingBadge}>★ {selectedShop.rating.toFixed(1)} ({selectedShop.reviewCount})</span>
                <span className={styles.sheetCategoryBadge}>🛡️ Doğrulanmış Usta</span>
                <span className={styles.sheetSlaBadge}>⚡ 20–30 dk Sevk SLA</span>
              </div>

              <p className={styles.sheetSubText}>
                📍 <strong>{selectedShop.district}</strong> · {selectedShop.address}
              </p>

              {shopDispatchSla && (
                <div className={styles.sheetDispatchBanner}>
                  <span className={styles.dispatchHubIcon}>{shopDispatchSla.hub.icon}</span>
                  <div className={styles.dispatchHubText}>
                    <span><strong>{shopDispatchSla.hub.name}</strong> merkezinden sevk:</span>
                    <span><strong>~{shopDispatchSla.estimatedMinutes} dk</strong> ({shopDispatchSla.distanceKm.toFixed(1)} km transit rotası)</span>
                  </div>
                </div>
              )}

              <div className={styles.sheetBottomActions}>
                <span className={styles.sheetDetailInfo}>👤 {selectedShop.ownerName} · {selectedShop.phone}</span>
                <Link
                  href={`/?service=${encodeURIComponent(selectedShop.serviceId)}&district=${encodeURIComponent(selectedShop.district)}&resume=1`}
                  className={styles.sheetPrimaryCta}
                >
                  ⚡ Fiyat Teklifi Al →
                </Link>
              </div>
            </div>
          ) : selectedCluster ? (
            <div className={styles.sheetContent}>
              <div className={styles.sheetTopRow}>
                <div className={styles.sheetTitleCol}>
                  <span className={styles.sheetEyebrow}>BÖLGESEL ZANAAT KÜMESİ</span>
                  <h3 className={styles.sheetMainTitle}>🏢 {selectedCluster.label}</h3>
                </div>
                <button
                  type="button"
                  className={styles.sheetCloseBtn}
                  onClick={() => setSelectedCluster(null)}
                  aria-label="Kapat"
                >
                  ✕
                </button>
              </div>

              <div className={styles.sheetBadgesRow}>
                <span className={styles.sheetRatingBadge}>★ {selectedCluster.count} Atölye</span>
                <span className={styles.sheetCategoryBadge}>📍 {selectedCluster.district}</span>
                <span className={styles.sheetSlaBadge}>⚡ 20–30 dk Sevk SLA</span>
              </div>

              <p className={styles.sheetSubText}>
                Bu bölgedeki yoğunlaşan atölyeleri doğrudan seçebilir veya haritada yakınlaşarak ayrıntılı inceleyebilirsiniz.
              </p>

              <div className={styles.clusterShopMiniList}>
                {selectedCluster.items.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    className={styles.clusterShopMiniItem}
                    onClick={() => {
                      setSelectedShop(s);
                      setSelectedCluster(null);
                      if (onShopSelected) onShopSelected(s);
                      const sLat = s.latLng?.lat ?? s.coords.y;
                      const sLng = s.latLng?.lng ?? s.coords.x;
                      mapRef.current?.flyTo([sLat, sLng], 15, { duration: 0.8 });
                    }}
                  >
                    <span>{CATEGORY_ICONS[s.categoryIcon] || '🛠️'} <strong>{s.name}</strong></span>
                    <span>★ {s.rating.toFixed(1)} →</span>
                  </button>
                ))}
              </div>

              <div className={styles.sheetBottomActions}>
                <span className={styles.sheetDetailInfo}>Genel Ankara Görünümü (Zoom: {currentZoom})</span>
                <button
                  type="button"
                  className={styles.sheetPrimaryCta}
                  onClick={() => {
                    mapRef.current?.flyTo(selectedCluster.center, 14, { duration: 0.8 });
                    setSelectedCluster(null);
                  }}
                >
                  🔍 Kümeyi Aç (Yakınlaş) →
                </button>
              </div>
            </div>
          ) : manualLocation ? (
            <div className={styles.sheetContent}>
              <div className={styles.sheetTopRow}>
                <div className={styles.sheetTitleCol}>
                  <span className={styles.sheetEyebrow}>İŞARETLENEN NOKTA</span>
                  <h3 className={styles.sheetMainTitle}>
                    📍 {manualLocation.neighborhood ? `${manualLocation.neighborhood}, ` : ''}{manualLocation.district}
                  </h3>
                </div>
                <button
                  type="button"
                  className={styles.sheetCloseBtn}
                  onClick={() => {
                    setManualLocation(null);
                    if (manualMarkerRef.current) {
                      manualMarkerRef.current.remove();
                      manualMarkerRef.current = null;
                    }
                  }}
                  aria-label="Kapat"
                >
                  ✕
                </button>
              </div>

              <div className={styles.sheetBadgesRow}>
                <span className={styles.sheetSlaBadge}>⚡ 20–30 dk Pilot Sevk Bölgesi</span>
                <span className={styles.sheetCategoryBadge}>✓ Ray-Casting ile Doğrulandı</span>
              </div>

              {manualDispatchSla && (
                <div className={styles.sheetDispatchBanner}>
                  <span className={styles.dispatchHubIcon}>{manualDispatchSla.hub.icon}</span>
                  <div className={styles.dispatchHubText}>
                    <span>En yakın zanaat merkezi <strong>{manualDispatchSla.hub.name}</strong>:</span>
                    <span><strong>~{manualDispatchSla.estimatedMinutes} dk</strong> tahmini varış ({manualDispatchSla.distanceKm.toFixed(1)} km)</span>
                  </div>
                </div>
              )}

              <div className={styles.sheetBottomActions}>
                <span className={styles.sheetDetailInfo}>Ankara Merkez Usta Ağı</span>
                {mode === 'picker' && onConfirmLocation ? (
                  <button
                    type="button"
                    className={styles.sheetPrimaryCta}
                    onClick={() => onConfirmLocation(manualLocation.district, manualLocation.neighborhood)}
                  >
                    ✓ Bu Konumu Seç
                  </button>
                ) : (
                  <Link
                    href={`/?district=${encodeURIComponent(manualLocation.district)}${
                      manualLocation.neighborhood ? `&neighborhood=${encodeURIComponent(manualLocation.neighborhood)}` : ''
                    }&resume=1`}
                    className={styles.sheetPrimaryCta}
                  >
                    ⚡ Buraya Usta Çağır →
                  </Link>
                )}
              </div>
            </div>
          ) : activeDistrictGeo ? (
            <div className={styles.sheetContent}>
              <div className={styles.sheetTopRow}>
                <div className={styles.sheetTitleCol}>
                  <span className={styles.sheetEyebrow}>PİLOT HİZMET İLÇESİ</span>
                  <h3 className={styles.sheetMainTitle}>📍 {activeDistrictGeo.name}</h3>
                </div>
                <button
                  type="button"
                  className={styles.sheetCloseBtn}
                  onClick={() => setClosedDistrict(activeDistrictGeo.id)}
                  aria-label="Kapat"
                >
                  ✕
                </button>
              </div>

              {/* Mini stat cards: real dispatch SLA data */}
              <div className={styles.sheetStatCards}>
                <div className={styles.sheetStatCard}>
                  <span className={styles.sheetStatCardLabel}>Usta Sayısı</span>
                  <span className={styles.sheetStatCardValue}>👥 {activeDistrictGeo.tradeCount}+</span>
                  <span className={styles.sheetStatCardSub}>Doğrulanmış</span>
                </div>
                <div className={styles.sheetStatCard}>
                  <span className={styles.sheetStatCardLabel}>Sevk SLA</span>
                  <span className={styles.sheetStatCardValue}>
                    ⚡ {districtDispatchSla ? `~${districtDispatchSla.estimatedMinutes} dk` : '~20 dk'}
                  </span>
                  <span className={styles.sheetStatCardSub}>
                    {districtDispatchSla ? `${districtDispatchSla.distanceKm.toFixed(1)} km` : 'Merkez'}
                  </span>
                </div>
                <div className={styles.sheetStatCard}>
                  <span className={styles.sheetStatCardLabel}>En Yakın Hub</span>
                  <span className={styles.sheetStatCardValue} style={{ fontSize: '11px' }}>
                    {districtDispatchSla ? districtDispatchSla.hub.icon : '🏭'}
                  </span>
                  <span className={styles.sheetStatCardSub}>
                    {districtDispatchSla ? districtDispatchSla.hub.name : 'Merkez Hub'}
                  </span>
                </div>
              </div>

              <div className={styles.sheetChipsScroll}>
                {activeDistrictGeo.neighborhoods.map(nb => {
                  const isNbActive = selectedNeighborhood?.toLowerCase() === nb.toLowerCase();
                  return (
                    <button
                      key={nb}
                      type="button"
                      className={`${styles.sheetNeighborhoodChip} ${isNbActive ? styles.sheetNeighborhoodChipActive : ''}`}
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

              <div className={styles.sheetBottomActions}>
                <span className={styles.sheetDetailInfo}>Hızlı Usta Eşleştirme</span>
                {mode === 'picker' && onConfirmLocation ? (
                  <button
                    type="button"
                    className={styles.sheetPrimaryCta}
                    onClick={() => onConfirmLocation(activeDistrictGeo.name, selectedNeighborhood)}
                  >
                    ✓ Bu Konumu Seç
                  </button>
                ) : (
                  <Link href={startRequestUrl} className={styles.sheetPrimaryCta}>
                    ⚡ Fiyat Teklifi Al →
                  </Link>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
