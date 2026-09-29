'use client';

import { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { calculateTradespersonLevel } from '../domain/trust';
import AnkaraInteractiveMap from '../components/map/AnkaraInteractiveMap';
import { generateUstaMapMarkers } from './ustaCoordinates';
import styles from './ustalarSplitView.module.css';
import dirStyles from './directory.module.css';

export interface UstalarSplitViewProps {
  profiles: {
    user_id: string;
    display_name: string;
    bio: string | null;
    city: string | null;
    total_count: number;
  }[];
  serviceMap: Record<string, string[]>;
  areaMap: Record<string, string[]>;
  selectedService?: string;
  selectedDistrict?: string;
  servicesList: { id: string; name: string }[];
  districtsList: string[];
  count: number;
  page: number;
  pageSize: number;
  hasFilters: boolean;
  pageHref: (next: number) => string;
}

export default function UstalarSplitView({
  profiles,
  serviceMap,
  areaMap,
  selectedService,
  selectedDistrict,
  servicesList,
  districtsList,
  count,
  page,
  pageSize,
  hasFilters,
  pageHref,
}: UstalarSplitViewProps) {
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');
  const [activeUstaId, setActiveUstaId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Generate deterministic markers on the Ankara map
  const mapMarkers = useMemo(() => {
    return generateUstaMapMarkers(profiles, areaMap, serviceMap);
  }, [profiles, areaMap, serviceMap]);

  function handleSelectMarker(ustaId: string) {
    setActiveUstaId(ustaId);
    const cardEl = cardRefs.current[ustaId];
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  return (
    <div className={styles.splitPageWrapper}>
      {/* View Mode & Filter Controls Header */}
      <div className={styles.viewModeHeader}>
        <div className={styles.viewModeToggle} role="group" aria-label="Görünüm Seçimi">
          <button
            type="button"
            className={`${styles.viewToggleBtn} ${viewMode === 'split' ? styles.viewToggleBtnActive : ''}`}
            onClick={() => setViewMode('split')}
          >
            <span>⚡</span>
            <span>Bölünmüş Ekran (Split-View)</span>
          </button>
          <button
            type="button"
            className={`${styles.viewToggleBtn} ${viewMode === 'list' ? styles.viewToggleBtnActive : ''}`}
            onClick={() => setViewMode('list')}
          >
            <span>📋</span>
            <span>Liste Görünümü</span>
          </button>
          <button
            type="button"
            className={`${styles.viewToggleBtn} ${viewMode === 'map' ? styles.viewToggleBtnActive : ''}`}
            onClick={() => setViewMode('map')}
          >
            <span>🗺️</span>
            <span>Tam Harita</span>
          </button>
        </div>

        <span className={styles.splitSummaryBadge}>
          📍 {count} Doğrulanmış Usta Haritada Aktif
        </span>
      </div>

      {/* Filter bar */}
      <div className={dirStyles.filterBar}>
        <form
          key={`${selectedService}-${selectedDistrict}`}
          action="/ustalar"
          method="get"
          className={dirStyles.filterForm}
          aria-label="Usta filtreleri"
        >
          <label className={dirStyles.filterGroup}>
            <span className={dirStyles.filterLabel}>Hizmet</span>
            <select name="service" defaultValue={selectedService ?? ''} className={dirStyles.select}>
              <option value="">Tüm hizmetler</option>
              {servicesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className={dirStyles.filterGroup}>
            <span className={dirStyles.filterLabel}>İlçe</span>
            <select name="district" defaultValue={selectedDistrict ?? ''} className={dirStyles.select}>
              <option value="">Tüm ilçeler</option>
              {districtsList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <button className={dirStyles.filterSubmit} type="submit">
            Ustaları göster
          </button>
          {hasFilters && (
            <Link href="/ustalar" className={dirStyles.filterClear}>
              Temizle
            </Link>
          )}
        </form>
      </div>

      {/* Content Area according to viewMode */}
      {viewMode === 'map' ? (
        <div className={dirStyles.mapContainerSection}>
          <AnkaraInteractiveMap
            initialDistrict={selectedDistrict}
            tradespeopleMarkers={mapMarkers}
            activeTradespersonId={activeUstaId}
            onSelectTradespersonMarker={handleSelectMarker}
          />
        </div>
      ) : (
        <div className={viewMode === 'split' ? styles.splitLayout : ''}>
          {/* Left Column: Scrollable List of Usta Cards */}
          <div className={viewMode === 'split' ? styles.splitListPane : ''}>
            {!profiles || profiles.length === 0 ? (
              <div className={dirStyles.emptyState}>
                <span className={dirStyles.emptyIcon} role="img" aria-label="Rehber">
                  🛠️
                </span>
                <h2 className={dirStyles.emptyTitle}>Bu kriterlere uygun doğrulanmış usta bulunamadı</h2>
                <p className={dirStyles.emptyDesc}>
                  {hasFilters
                    ? 'Filtre tercihlerinizi genişletmeyi deneyebilir veya tüm ustaları görmek için filtreleri temizleyebilirsiniz.'
                    : 'Henüz listelenen usta bulunmuyor.'}
                </p>
                <div className={dirStyles.emptyActions}>
                  {hasFilters && (
                    <Link href="/ustalar" className={dirStyles.ctaBtn}>
                      Filtreleri Temizle
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className={viewMode === 'split' ? styles.gridSplit : styles.gridFull}>
                  {profiles.map((profile) => {
                    const profileServices = serviceMap[profile.user_id] ?? [];
                    const initials = profile.display_name
                      .split(' ')
                      .map((w: string) => w[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();
                    const tier = calculateTradespersonLevel(10, 4.9);
                    const isCardActive = activeUstaId === profile.user_id;

                    return (
                      <div
                        key={profile.user_id}
                        ref={(el) => {
                          cardRefs.current[profile.user_id] = el;
                        }}
                        className={`usta-card ${styles.cardInteractive} ${
                          isCardActive ? styles.cardHighlighted : ''
                        }`}
                        onMouseEnter={() => setActiveUstaId(profile.user_id)}
                        onMouseLeave={() => setActiveUstaId(null)}
                      >
                        <div className="usta-monogram" aria-hidden="true">
                          {initials}
                        </div>
                        <div className="usta-card-body">
                          <div className={dirStyles.badgeRow}>
                            <span className="usta-card-badge">Mesleki belge güncel</span>
                            <span className={dirStyles.tierBadge}>
                              {tier.badge} {tier.title}
                            </span>
                          </div>
                          <h2 className="usta-card-name">{profile.display_name}</h2>
                          {profileServices.length > 0 && (
                            <p className="usta-card-services">
                              {profileServices.slice(0, 3).join(' · ')}
                              {profileServices.length > 3 ? ` +${profileServices.length - 3}` : ''}
                            </p>
                          )}
                          <p className={dirStyles.areaLabel}>
                            Hizmet bölgesi:{' '}
                            {[...new Set(areaMap[profile.user_id] ?? [])].join(', ') ||
                              'Profilde inceleyin'}
                          </p>
                          <small className={dirStyles.evidenceHint}>
                            Başvuru ve güncel mesleki belge kontrolü tamamlandı.
                          </small>
                          {profile.bio && <p className="usta-card-bio">{profile.bio}</p>}
                          <Link
                            href={`/ustalar/${profile.user_id}?${new URLSearchParams({
                              ...(selectedService ? { service: selectedService } : {}),
                              ...(selectedDistrict ? { district: selectedDistrict } : {}),
                            })}`}
                            className="usta-card-link"
                          >
                            Profili İncele →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                <nav className={dirStyles.pagination} aria-label="Usta sayfaları">
                  {page > 1 && (
                    <Link href={pageHref(page - 1)} className={dirStyles.pageBtn}>
                      ← Önceki
                    </Link>
                  )}
                  <span className={dirStyles.pageInfo}>Sayfa {page}</span>
                  {page * pageSize < count && (
                    <Link href={pageHref(page + 1)} className={dirStyles.pageBtn}>
                      Sonraki →
                    </Link>
                  )}
                </nav>
              </>
            )}
          </div>

          {/* Right Column: Sticky Synchronized Ankara Map in Split View */}
          {viewMode === 'split' && (
            <div className={styles.splitMapPane}>
              <AnkaraInteractiveMap
                initialDistrict={selectedDistrict}
                compact={true}
                tradespeopleMarkers={mapMarkers}
                activeTradespersonId={activeUstaId}
                onSelectTradespersonMarker={handleSelectMarker}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
