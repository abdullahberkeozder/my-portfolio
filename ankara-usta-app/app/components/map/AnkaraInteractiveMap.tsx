'use client';

import { useId, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  ankaraDistrictsGeo,
  ankaraCraftHubs,
  ankaraRepresentativeShops,
  type ShopPin,
} from '../../data/ankaraMapGeo';
import styles from './ankaraMap.module.css';

import type { TradespersonMapMarker } from './RealAnkaraMap';

const RealAnkaraMap = dynamic(() => import('./RealAnkaraMap'), {
  ssr: false,
  loading: () => (
    <div className={styles.mapLoadingSkeleton} role="status" aria-live="polite">
      <div className={styles.mapLoadingSpinner} />
      <span>İnteraktif Ankara haritası yükleniyor...</span>
    </div>
  ),
});

const CATEGORY_ICONS: Record<string, string> = {
  carpentry: '🪚',
  repair: '🛠️',
  plumbing: '🔧',
  electric: '⚡',
  paint: '🎨',
  cleaning: '🧹',
};

export interface SearchResultItem {
  id: string;
  type: 'district' | 'neighborhood' | 'hub' | 'shop';
  district: string;
  neighborhood?: string;
  title: string;
  subtitle: string;
  badge: string;
  shopId?: string;
  category?: string;
}

export interface AnkaraInteractiveMapProps {
  initialDistrict?: string;
  initialNeighborhood?: string;
  mode?: 'discovery' | 'picker';
  compact?: boolean;
  isSplitPane?: boolean;
  onLocationSelect?: (district: string, neighborhood?: string) => void;
  tradespeopleMarkers?: TradespersonMapMarker[];
  activeTradespersonId?: string | null;
  onSelectTradespersonMarker?: (id: string) => void;
  onHoverTradespersonMarker?: (id: string | null) => void;
  filteredPins?: ShopPin[];
  onVisibleTradespeopleChange?: (visibleIds: string[] | null) => void;
  resetTrigger?: number;
  panToTradespersonId?: string | null;
}

export default function AnkaraInteractiveMap({
  initialDistrict,
  initialNeighborhood,
  mode = 'discovery',
  compact = false,
  isSplitPane = false,
  onLocationSelect,
  tradespeopleMarkers,
  activeTradespersonId,
  onSelectTradespersonMarker,
  onHoverTradespersonMarker,
  filteredPins,
  onVisibleTradespeopleChange,
  resetTrigger,
  panToTradespersonId,
}: AnkaraInteractiveMapProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    initialDistrict ?? 'all'
  );
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(initialNeighborhood ?? '');
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [prevDistrict, setPrevDistrict] = useState(initialDistrict);
  const [prevNeighborhood, setPrevNeighborhood] = useState(initialNeighborhood);

  // Restore saved district preference from localStorage after first mount (client only)
  // Using useEffect prevents SSR/hydration mismatch since localStorage only exists client-side
  useEffect(() => {
    if (initialDistrict) return; // Don't override explicit prop
    try {
      const saved = localStorage.getItem('orkestra_preferred_district');
      if (saved && ankaraDistrictsGeo.some(d => d.id === saved || d.name.toLowerCase() === saved.toLowerCase())) {
        const frame = window.requestAnimationFrame(() => setSelectedDistrict(saved));
        return () => window.cancelAnimationFrame(frame);
      }
    } catch {
      // Safe fallback — localStorage may be unavailable
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (initialDistrict !== prevDistrict) {
    setPrevDistrict(initialDistrict);
    setSelectedDistrict(initialDistrict ?? 'all');
  }

  if (initialNeighborhood !== prevNeighborhood) {
    setPrevNeighborhood(initialNeighborhood);
    setSelectedNeighborhood(initialNeighborhood ?? '');
  }

  const [searchQuery, setSearchQuery] = useState('');
  const searchInputId = useId();

  const activeDistrict = ankaraDistrictsGeo.find(
    d => d.id === selectedDistrict || d.name.toLowerCase() === selectedDistrict.toLowerCase()
  );

  // Multi-entity search across Craft Hubs, Artisan Shops, Districts & Neighborhoods
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase('tr-TR');
    if (!q) return [];

    const matches: SearchResultItem[] = [];

    // 1. Match Ankara Craft Triangle Hubs (Siteler, Ostim, Rüzgarlı)
    ankaraCraftHubs.forEach(hub => {
      const hName = hub.name.toLocaleLowerCase('tr-TR');
      const hShort = hub.shortName.toLocaleLowerCase('tr-TR');
      const hSpec = hub.specialty.toLocaleLowerCase('tr-TR');
      if (hName.includes(q) || hShort.includes(q) || hSpec.includes(q)) {
        matches.push({
          id: `hub-${hub.id}`,
          type: 'hub',
          district: hub.district,
          neighborhood: hub.neighborhood,
          title: `👑 ${hub.shortName}`,
          subtitle: `${hub.specialty} · ${hub.tradeCapacity}+ Zanaatkâr`,
          badge: 'ANA ZANAAT MERKEZİ',
          category: hub.primaryCategories[0],
        });
      }
    });

    // 2. Match Artisan Shops
    const shopsPool = filteredPins ?? ankaraRepresentativeShops;
    shopsPool.forEach(shop => {
      const sName = shop.name.toLocaleLowerCase('tr-TR');
      const sOwner = shop.ownerName.toLocaleLowerCase('tr-TR');
      const sCategory = shop.category.toLocaleLowerCase('tr-TR');
      const sDistrict = shop.district.toLocaleLowerCase('tr-TR');
      const sAddress = shop.address.toLocaleLowerCase('tr-TR');
      if (
        sName.includes(q) ||
        sOwner.includes(q) ||
        sCategory.includes(q) ||
        sDistrict.includes(q) ||
        sAddress.includes(q)
      ) {
        const icon = CATEGORY_ICONS[shop.categoryIcon] || '🛠️';
        matches.push({
          id: `shop-${shop.id}`,
          type: 'shop',
          district: shop.district,
          neighborhood: shop.neighborhood,
          title: `${icon} ${shop.name}`,
          subtitle: `${shop.district} · ${shop.ownerName} · ★ ${shop.rating.toFixed(1)}`,
          badge: 'DOĞRULANMIŞ ATÖLYE',
          shopId: shop.id,
          category: shop.categoryIcon,
        });
      }
    });

    // 3. Match Districts & Neighborhoods
    ankaraDistrictsGeo.forEach(d => {
      if (d.name.toLocaleLowerCase('tr-TR').includes(q)) {
        matches.push({
          id: `dist-${d.id}`,
          type: 'district',
          district: d.id,
          title: `📍 ${d.name} İlçesi`,
          subtitle: `${d.tradeCount} Doğrulanmış Usta Bölgesi`,
          badge: 'PİLOT İLÇE',
        });
      }
      d.neighborhoods.forEach(n => {
        if (n.toLocaleLowerCase('tr-TR').includes(q)) {
          matches.push({
            id: `neigh-${d.id}-${n}`,
            type: 'neighborhood',
            district: d.id,
            neighborhood: n,
            title: `🏡 ${n} Mahallesi`,
            subtitle: `${d.name} İlçesi Pilot Sevk Bölgesi`,
            badge: 'MAHALLE',
          });
        }
      });
    });

    return matches.slice(0, 6);
  }, [searchQuery, filteredPins]);

  function handleSelectResult(item: SearchResultItem) {
    if (item.type === 'shop' && item.shopId) {
      setSelectedShopId(item.shopId);
      setSelectedDistrict(item.district);
      if (item.category) setActiveCategory(item.category);
    } else if (item.type === 'hub') {
      setSelectedDistrict(item.district);
      if (item.neighborhood) setSelectedNeighborhood(item.neighborhood);
      if (item.category) setActiveCategory(item.category);
      setSelectedShopId(null);
    } else {
      setSelectedDistrict(item.district);
      setSelectedNeighborhood(item.neighborhood ?? '');
      setSelectedShopId(null);
    }
    setSearchQuery('');
    if (onLocationSelect) {
      const distName = ankaraDistrictsGeo.find(d => d.id === item.district)?.name ?? item.district;
      onLocationSelect(distName, item.neighborhood);
    }
  }

  function handleDistrictClick(districtId: string) {
    setSelectedDistrict(districtId);
    setSelectedNeighborhood('');
    setSelectedShopId(null);
    if (onLocationSelect) {
      if (districtId !== 'all') {
        const distName = ankaraDistrictsGeo.find(d => d.id === districtId)?.name ?? districtId;
        onLocationSelect(distName, '');
      } else {
        onLocationSelect('', '');
      }
    }
  }

  function handleNeighborhoodClick(neighborhood: string) {
    setSelectedNeighborhood(neighborhood);
    setSelectedShopId(null);
    if (onLocationSelect && activeDistrict) {
      onLocationSelect(activeDistrict.name, neighborhood);
    }
  }

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const CATEGORY_FILTERS = [
    { id: 'plumbing', label: 'Tesisat', icon: '🔧' },
    { id: 'electric', label: 'Elektrik', icon: '⚡' },
    { id: 'carpentry', label: 'Mobilya', icon: '🪚' },
    { id: 'paint', label: 'Boya', icon: '🎨' },
    { id: 'repair', label: 'Metal', icon: '🛠️' },
    { id: 'cleaning', label: 'Temizlik', icon: '🧹' },
  ];

  const isCompact = compact || mode === 'picker';

  return (
    <section
      className={`${styles.mapWrapper} ${
        isSplitPane
          ? styles.mapWrapperSplitPane
          : isCompact
          ? styles.mapWrapperCompact
          : ''
      }`}
      aria-label="Ankara Canlı Sevk ve Zanaat Haritası"
    >
      <div className={styles.mapViewport}>
        {/* Apple Maps & Wolt Benchmark: Floating Search & Filter Island (Only in full discovery mode, omitted in split-pane to prevent duplication) */}
        {!isSplitPane && (
          <div className={styles.floatingSearchIsland} role="search" aria-label="Harita Arama ve Zanaat Filtresi">
            <div className={styles.searchBarRow}>
              <span className={styles.searchBarIcon} aria-hidden="true">🔍</span>
              <label htmlFor={searchInputId} className="sr-only">
                İlçe, atölye veya zanaat ara
              </label>
              <input
                id={searchInputId}
                type="search"
                placeholder="İlçe, usta veya zanaat ara..."
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                className={styles.cleanSearchInput}
              />

              {searchResults.length > 0 && (
                <div className={styles.searchResultsDropdown}>
                  {searchResults.map(res => (
                    <button
                      key={res.id}
                      type="button"
                      className={styles.searchResultItem}
                      onClick={() => handleSelectResult(res)}
                    >
                      <span className={styles.searchResultTitle}>{res.title}</span>
                      <span className={styles.searchResultSubtitle}>{res.subtitle}</span>
                      <span className={styles.searchResultBadge}>{res.badge}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.compactChipsRow} role="group" aria-label="Zanaat ve Bölge Filtreleri">
              {/* District chip: shows 'Tüm Ankara' or active district name */}
              <button
                type="button"
                className={`${styles.compactChip} ${selectedDistrict === 'all' ? styles.compactChipActive : ''}`}
                onClick={() => handleDistrictClick('all')}
              >
                <span>📍</span>
                <span>{activeDistrict ? activeDistrict.name : 'Tüm Ankara'}</span>
              </button>

              {/* Category chips: compact emoji + short label (Wolt benchmark) */}
              {CATEGORY_FILTERS.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`${styles.compactChip} ${activeCategory === cat.id ? styles.compactChipActive : ''}`}
                  onClick={() => {
                    setActiveCategory(cat.id === activeCategory ? 'all' : cat.id);
                    setSelectedShopId(null);
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <RealAnkaraMap
          selectedDistrict={selectedDistrict}
          selectedNeighborhood={selectedNeighborhood}
          onSelectDistrict={handleDistrictClick}
          onSelectNeighborhood={handleNeighborhoodClick}
          mode={mode}
          activeCategory={activeCategory}
          filteredPins={filteredPins}
          onConfirmLocation={(dist, neigh) => {
            if (onLocationSelect) onLocationSelect(dist, neigh);
          }}
          tradespeopleMarkers={tradespeopleMarkers}
          activeTradespersonId={activeTradespersonId}
          onSelectTradespersonMarker={onSelectTradespersonMarker}
          onHoverTradespersonMarker={onHoverTradespersonMarker}
          selectedShopId={selectedShopId}
          onShopSelected={shop => {
            if (shop) {
              setSelectedShopId(shop.id);
            }
          }}
          isSplitPane={isSplitPane}
          onVisibleTradespeopleChange={onVisibleTradespeopleChange}
          resetTrigger={resetTrigger}
          panToTradespersonId={panToTradespersonId}
        />
      </div>
    </section>
  );
}
