'use client';

import { useId, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { ankaraDistrictsGeo } from '../../data/ankaraMapGeo';
import styles from './ankaraMap.module.css';

const RealAnkaraMap = dynamic(() => import('./RealAnkaraMap'), {
  ssr: false,
  loading: () => (
    <div className={styles.mapLoadingSkeleton} role="status" aria-live="polite">
      <div className={styles.mapLoadingSpinner} />
      <span>İnteraktif Ankara haritası yükleniyor...</span>
    </div>
  ),
});

export interface AnkaraInteractiveMapProps {
  initialDistrict?: string;
  initialNeighborhood?: string;
  mode?: 'discovery' | 'picker';
  compact?: boolean;
  onLocationSelect?: (district: string, neighborhood?: string) => void;
}

export default function AnkaraInteractiveMap({
  initialDistrict,
  initialNeighborhood,
  mode = 'discovery',
  compact = false,
  onLocationSelect,
}: AnkaraInteractiveMapProps) {
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict ?? 'all');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(initialNeighborhood ?? '');
  const [prevDistrict, setPrevDistrict] = useState(initialDistrict);
  const [prevNeighborhood, setPrevNeighborhood] = useState(initialNeighborhood);

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

  // Search filtered results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase('tr-TR');
    if (!q) return [];

    const matches: { district: string; neighborhood?: string; label: string }[] = [];
    ankaraDistrictsGeo.forEach(d => {
      if (d.name.toLocaleLowerCase('tr-TR').includes(q)) {
        matches.push({ district: d.id, label: `📍 ${d.name} İlçesi` });
      }
      d.neighborhoods.forEach(n => {
        if (n.toLocaleLowerCase('tr-TR').includes(q)) {
          matches.push({ district: d.id, neighborhood: n, label: `🏡 ${n} Mahallesi (${d.name})` });
        }
      });
    });
    return matches.slice(0, 6);
  }, [searchQuery]);

  function handleSelectResult(item: { district: string; neighborhood?: string }) {
    setSelectedDistrict(item.district);
    setSelectedNeighborhood(item.neighborhood ?? '');
    setSearchQuery('');
    if (onLocationSelect) {
      const distName = ankaraDistrictsGeo.find(d => d.id === item.district)?.name ?? item.district;
      onLocationSelect(distName, item.neighborhood);
    }
  }

  function handleDistrictClick(districtId: string) {
    setSelectedDistrict(districtId);
    setSelectedNeighborhood('');
    if (onLocationSelect && districtId !== 'all') {
      const distName = ankaraDistrictsGeo.find(d => d.id === districtId)?.name ?? districtId;
      onLocationSelect(distName, '');
    }
  }

  function handleNeighborhoodClick(neighborhood: string) {
    setSelectedNeighborhood(neighborhood);
    if (onLocationSelect && activeDistrict) {
      onLocationSelect(activeDistrict.name, neighborhood);
    }
  }

  const isCompact = compact || mode === 'picker';

  return (
    <section
      className={`${styles.mapWrapper} ${isCompact ? styles.mapWrapperCompact : ''}`}
      aria-labelledby={isCompact ? undefined : 'interactive-map-title'}
    >
      {!isCompact && (
        <div className={styles.mapHeader}>
          <div className={styles.headerTitleGroup}>
            <span className={styles.eyebrow}>ANKARA CANLI SEVK VE HİZMET HARİTASI</span>
            <h2 className={styles.title} id="interactive-map-title">
              {activeDistrict ? `${activeDistrict.name} Bölgesi ve Usta Sevk Ağı` : 'Ankara Pilot İlçe ve Sevk Ağı'}
            </h2>
            <p className={styles.subtitle}>
              İlçenizi veya mahallenizi seçerek ortalama sevk sürelerini, pilot bölge kapsamını ve doğrulanmış usta yoğunluğunu inceleyebilirsiniz.
            </p>
          </div>
        </div>
      )}

      <div className={styles.filterRow} aria-label="Harita filtreleri">
        <div className={styles.searchBox}>
          <label htmlFor={searchInputId} className="sr-only">
            İlçe veya mahalle ara (Örn: Çankaya, Batıkent, Tunalı)
          </label>
          <input
            id={searchInputId}
            type="search"
            placeholder="İlçe veya mahalle ara (Örn: Çayyolu, Ayrancı...)"
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            className={styles.searchInput}
          />

          {searchResults.length > 0 && (
            <div className={styles.searchResultsDropdown}>
              {searchResults.map((res, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={styles.searchResultItem}
                  onClick={() => handleSelectResult(res)}
                >
                  {res.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className={`${styles.districtPill} ${selectedDistrict === 'all' ? styles.districtPillActive : ''}`}
          onClick={() => handleDistrictClick('all')}
        >
          Tüm Ankara
        </button>

        {ankaraDistrictsGeo.map(district => (
          <button
            key={district.id}
            type="button"
            className={`${styles.districtPill} ${
              selectedDistrict === district.id || selectedDistrict === district.name
                ? styles.districtPillActive
                : ''
            }`}
            onClick={() => handleDistrictClick(district.id)}
          >
            {district.name}
          </button>
        ))}
      </div>

      <div className={styles.mapViewport}>
        <RealAnkaraMap
          selectedDistrict={selectedDistrict}
          selectedNeighborhood={selectedNeighborhood}
          onSelectDistrict={handleDistrictClick}
          onSelectNeighborhood={handleNeighborhoodClick}
          mode={mode}
          onConfirmLocation={(dist, neigh) => {
            if (onLocationSelect) onLocationSelect(dist, neigh);
          }}
        />
      </div>

      {!isCompact && (
        <div className={styles.statsBar} aria-label="Harita özet bilgileri">
          <div className={styles.statsItem}>
            <span>Seçili Bölge</span>
            <strong>{activeDistrict ? activeDistrict.name : '9 Pilot İlçe'}</strong>
          </div>
          <div className={styles.statsItem}>
            <span>Ortalama Sevk</span>
            <strong>⚡ 20–30 Dakika</strong>
          </div>
          <div className={styles.statsItem}>
            <span>Garanti Kapsamı</span>
            <strong>🛡️ 48 Saat Düzeltme SLA</strong>
          </div>
        </div>
      )}
    </section>
  );
}
