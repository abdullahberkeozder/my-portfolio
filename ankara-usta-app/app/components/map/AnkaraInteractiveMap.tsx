'use client';

import React, { useState, useEffect, useId } from 'react';
import dynamic from 'next/dynamic';
import {
  ankaraDistrictsGeo,
  initialShopPins,
  loadSavedShopPins,
  saveShopPin,
  type ShopPin,
} from '../../data/ankaraMapGeo';
import styles from './ankaraMap.module.css';
import { services } from '../../data/serviceTaxonomy';
import RequestWizard from '../RequestWizard';

// Dynamically load RealAnkaraMap on client only (Leaflet requires window)
const RealAnkaraMap = dynamic(() => import('./RealAnkaraMap'), {
  ssr: false,
  loading: () => (
    <div className={styles.mapLoadingSkeleton} role="status" aria-live="polite">
      <div className={styles.mapLoadingSpinner} />
      <span>Gerçek Ankara Sokak ve Zanaatkar Haritası Yükleniyor...</span>
    </div>
  ),
});

function CategoryIcon({ type }: { type: ShopPin['categoryIcon'] }) {
  switch (type) {
    case 'plumbing':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14 2 14 8 20 8"/>
          <path d="M12 18v-6"/>
          <path d="M9 15h6"/>
        </svg>
      );
    case 'electric':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'carpentry':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9" />
          <path d="M17.64 15 22 10.64" />
          <path d="m20.91 3.26-6.36 6.36" />
        </svg>
      );
    case 'paint':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z" />
          <path d="m5 2 5 5" />
          <path d="M2 13h15" />
          <path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z" />
        </svg>
      );
    default:
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
  }
}

const tradeCategories = [
  { id: 'all', label: 'Tüm Branşlar', icon: null },
  { id: 'plumbing', label: 'Sıhhi Tesisat', icon: 'plumbing' as const },
  { id: 'electric', label: 'Elektrik', icon: 'electric' as const },
  { id: 'carpentry', label: 'Marangoz & Ahşap', icon: 'carpentry' as const },
  { id: 'paint', label: 'Boya & Badana', icon: 'paint' as const },
  { id: 'repair', label: 'Montaj & Mekanik', icon: 'repair' as const },
];

export default function AnkaraInteractiveMap({
  initialDistrict,
  showTitle = true,
  onSelectShop,
}: {
  initialDistrict?: string;
  showTitle?: boolean;
  onSelectShop?: (shop: ShopPin) => void;
}) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict ?? 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [emergencyOnly, setEmergencyOnly] = useState<boolean>(false);
  const [selectedShopForQuote, setSelectedShopForQuote] = useState<ShopPin | null>(null);
  const [pinMode, setPinMode] = useState<boolean>(false);
  const [placedPinCoords, setPlacedPinCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [allPins, setAllPins] = useState<ShopPin[]>(initialShopPins);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  const searchInputId = useId();

  useEffect(() => {
    const handle = window.requestAnimationFrame(() => {
      const customPins = loadSavedShopPins();
      if (customPins.length > 0) {
        setAllPins([...customPins, ...initialShopPins]);
      }
    });
    return () => window.cancelAnimationFrame(handle);
  }, []);

  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [category, setCategory] = useState('Tesisat & Mekanik');
  const [categoryIcon, setCategoryIcon] = useState<ShopPin['categoryIcon']>('plumbing');
  const [districtInput, setDistrictInput] = useState('Çankaya');
  const [neighborhoodInput, setNeighborhoodInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('0312 ');
  const [isEmergencyInput, setIsEmergencyInput] = useState<boolean>(false);

  function handlePlacePin(coords: { lat: number; lng: number; districtName: string }) {
    setPlacedPinCoords({ lat: coords.lat, lng: coords.lng });
    setDistrictInput(coords.districtName);
    const matched = ankaraDistrictsGeo.find(d => d.name.toLowerCase() === coords.districtName.toLowerCase());
    if (matched && matched.neighborhoods.length > 0) {
      setNeighborhoodInput(matched.neighborhoods[0]);
    }
    setShowDrawer(true);
  }

  function handleSaveShop(event: React.FormEvent) {
    event.preventDefault();
    if (!placedPinCoords || !shopName.trim()) return;
    const newPin: ShopPin = {
      id: 'custom-shop-' + Date.now(),
      name: shopName.trim(),
      ownerName: ownerName.trim() || 'Yetkili Usta',
      category,
      categoryIcon,
      serviceId: 'musluk-ve-batarya-montaji',
      district: districtInput,
      neighborhood: neighborhoodInput || 'Merkez',
      address: addressInput.trim() || (districtInput + ', Ankara'),
      phone: phoneInput.trim() || '0312 000 00 00',
      rating: 5.0,
      reviewCount: 1,
      verifiedBadge: true,
      latLng: placedPinCoords,
      coords: { x: 500, y: 375 },
      isEmergency: isEmergencyInput,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    const updated = saveShopPin(newPin);
    setAllPins([...updated, ...initialShopPins.filter(p => !updated.some(u => u.id === p.id))]);
    setShowDrawer(false);
    setPinMode(false);
    setPlacedPinCoords(null);
    setNotification('"' + newPin.name + '" dükkanınız haritaya başarıyla işaretlendi!');
    setTimeout(() => setNotification(null), 5000);
  }

  const filteredPins = allPins.filter(pin => {
    const matchesEmergency = !emergencyOnly || Boolean(pin.isEmergency);
    const matchesDistrict = selectedDistrict === 'all' || pin.district.toLowerCase() === selectedDistrict.toLowerCase();
    const matchesCategory = selectedCategory === 'all' || pin.categoryIcon === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query ||
      pin.name.toLowerCase().includes(query) ||
      pin.ownerName.toLowerCase().includes(query) ||
      pin.district.toLowerCase().includes(query) ||
      pin.neighborhood.toLowerCase().includes(query) ||
      pin.category.toLowerCase().includes(query);
    return matchesEmergency && matchesDistrict && matchesCategory && matchesSearch;
  });

  const selectedDistrictData = ankaraDistrictsGeo.find(
    d => d.id === selectedDistrict || d.name.toLowerCase() === selectedDistrict.toLowerCase()
  );

  return (
    <div className={styles.mapWrapper}>
      {showTitle && (
        <div className={styles.mapHeader}>
          <div className={styles.headerTitleGroup}>
            <span className={styles.eyebrow}>ANKARA ZANAATKAR AĞI</span>
            <h2 className={styles.title}>İlçe Sınırları & Usta Dükkan Haritası</h2>
            <p className={styles.subtitle}>
              9 pilot ilçenin gerçek sınırlarını ve yollarını inceleyin; sanayi ve atölye noktalarındaki onaylı ustaları keşfedin.
            </p>
          </div>
          <div className={styles.actionButtonGroup}>
            <button
              type="button"
              className={styles.emergencyToggleBtn + (emergencyOnly ? ' ' + styles.emergencyToggleBtnActive : '')}
              onClick={() => setEmergencyOnly(!emergencyOnly)}
              aria-pressed={emergencyOnly}
              title="Yalnızca 7/24 nöbetçi ve acil çağrı kabul eden ustaları göster"
            >
              <span className={styles.emergencyPulseDot} />
              <span>🚨 7/24 Acil & Nöbetçi</span>
            </button>
            
            <button
              type="button"
              className={styles.pinModeBtn + (pinMode ? ' ' + styles.pinModeBtnActive : '')}
              onClick={() => setPinMode(!pinMode)}
              aria-pressed={pinMode}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {pinMode ? 'İşaretlemeyi İptal Et' : '📍 Dükkanımı Haritada İşaretle'}
            </button>
          </div>
        </div>
      )}

      {pinMode && (
        <div className={styles.pinBanner}>
          <span className={styles.pinBannerText}>
            🎯 Dükkanınızın / atölyenizin bulunduğu gerçek sokak veya sanayi konumuna harita üzerinde tıklayarak işaretleyin.
          </span>
          <button type="button" className={styles.pinBannerCancel} onClick={() => setPinMode(false)}>
            Vazgeç
          </button>
        </div>
      )}

      {emergencyOnly && (
        <div className={styles.emergencyBanner} role="status">
          <span className={styles.emergencyBannerIcon}>🚨</span>
          <div className={styles.emergencyBannerContent}>
            <strong>7/24 Acil & Nöbetçi Usta Modu Aktif</strong>
            <span>Gece ve tatil saatlerinde su baskını, elektrik arızası ve acil kilit/çilingir desteği veren nöbetçi ustalar listeleniyor.</span>
          </div>
          <button
            type="button"
            className={styles.emergencyBannerClose}
            onClick={() => setEmergencyOnly(false)}
          >
            Normal Moda Dön
          </button>
        </div>
      )}

      {notification && (
        <div className={styles.pinBanner + ' ' + styles.pinNotification}>
          <span>✓ {notification}</span>
        </div>
      )}

      <div className={styles.filterRow} role="tablist" aria-label="İlçe Filtresi">
        <div className={styles.searchBox}>
          <label htmlFor={searchInputId} className="sr-only">Atölye veya usta ara</label>
          <input
            id={searchInputId}
            type="search"
            placeholder="Atölye, usta veya branş ara..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button
          type="button"
          className={styles.districtPill + (selectedDistrict === 'all' ? ' ' + styles.districtPillActive : '')}
          onClick={() => setSelectedDistrict('all')}
        >
          Tümü (9 Pilot İlçe)
        </button>
        {ankaraDistrictsGeo.map(d => (
          <button
            key={d.id}
            type="button"
            className={styles.districtPill + ((selectedDistrict === d.id || selectedDistrict === d.name) ? ' ' + styles.districtPillActive : '')}
            onClick={() => setSelectedDistrict(d.id)}
          >
            {d.name} ({allPins.filter(p => p.district.toLowerCase() === d.name.toLowerCase()).length})
          </button>
        ))}
      </div>

      <div className={styles.categoryRow} role="tablist" aria-label="Hizmet Branşı Filtresi">
        <span className={styles.categoryRowLabel}>Branş:</span>
        {tradeCategories.map(cat => {
          const count = allPins.filter(p => {
            const matchDist = selectedDistrict === 'all' || p.district.toLowerCase() === selectedDistrict.toLowerCase();
            const matchCat = cat.id === 'all' || p.categoryIcon === cat.id;
            return matchDist && matchCat;
          }).length;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={styles.categoryChip + (isActive ? ' ' + styles.categoryChipActive : '')}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.icon && (
                <span className={styles.categoryChipIcon}>
                  <CategoryIcon type={cat.icon} />
                </span>
              )}
              <span>{cat.label}</span>
              <span className={styles.categoryChipCount}>({count})</span>
            </button>
          );
        })}
      </div>

      <div className={styles.mapViewport}>
        {filteredPins.length === 0 && (
          <div className={styles.emptyMapCard} role="status">
            <div className={styles.emptyMapIcon}>{emergencyOnly ? '🚨' : '🔍'}</div>
            <h4>
              {emergencyOnly
                ? 'Seçili Bölgede Nöbetçi Usta Bulunamadı'
                : 'Aradığınız Kriterde Usta Bulunamadı'}
            </h4>
            <p>
              {selectedDistrict !== 'all' ? `"${selectedDistrictData?.name || selectedDistrict}" ilçesinde ` : ''}
              {selectedCategory !== 'all' ? 'seçili branşta ' : ''}
              {emergencyOnly ? 'şu an aktif nöbetçi usta yok. ' : ''}
              {searchQuery ? `"${searchQuery}" aramasına uygun ` : ''}
              {emergencyOnly
                ? 'Tüm Ankara genelindeki 6 nöbetçi ustayı inceleyebilir veya normal çalışma moduna geçebilirsiniz.'
                : 'Filtreleri sıfırlayarak tüm onaylı dükkanları görüntüleyebilirsiniz.'}
            </p>
            <div className={styles.emptyActions}>
              {emergencyOnly && selectedDistrict !== 'all' && (
                <button
                  type="button"
                  className={styles.emptySecondaryBtn}
                  onClick={() => {
                    setSelectedDistrict('all');
                    setSelectedCategory('all');
                  }}
                >
                  Tüm Ankara Nöbetçilerini Gör
                </button>
              )}
              {emergencyOnly && (
                <button
                  type="button"
                  className={styles.emptySecondaryBtn}
                  onClick={() => setEmergencyOnly(false)}
                >
                  Normal Moda Dön
                </button>
              )}
              <button
                type="button"
                className={styles.emptyResetBtn}
                onClick={() => {
                  setSelectedDistrict('all');
                  setSelectedCategory('all');
                  setEmergencyOnly(false);
                  setSearchQuery('');
                }}
              >
                Filtreleri Sıfırla
              </button>
            </div>
          </div>
        )}

        <RealAnkaraMap
          filteredPins={filteredPins}
          selectedDistrict={selectedDistrict}
          onSelectDistrict={(districtId) => setSelectedDistrict(districtId)}
          emergencyOnly={emergencyOnly}
          pinMode={pinMode}
          onSelectShop={(shop) => {
            if (onSelectShop) onSelectShop(shop);
          }}
          onStartQuote={(shop) => setSelectedShopForQuote(shop)}
          onPlacePin={handlePlacePin}
          placedPinCoords={placedPinCoords}
        />
      </div>

      <div className={styles.statsBar}>
        <div className={styles.statsItem}>
          <span>Seçili Bölge:</span>
          <strong>{selectedDistrictData ? selectedDistrictData.name : 'Tüm Ankara (9 Pilot İlçe)'}</strong>
        </div>
        <div className={styles.statsItem}>
          <span>Haritada Görünen Usta Dükkanı:</span>
          <strong>{filteredPins.length} Atölye / Dükkan</strong>
        </div>
        {selectedDistrictData && (
          <div className={styles.statsItem}>
            <span>Kapsamdaki Mahalleler:</span>
            <span>{selectedDistrictData.neighborhoods.slice(0, 4).join(', ')}...</span>
          </div>
        )}
      </div>

      {selectedShopForQuote && (() => {
        const wizardService = services.find(s => s.id === selectedShopForQuote.serviceId) ||
          services.find(s => s.categoryId === (selectedShopForQuote.categoryIcon === 'plumbing' ? 'tesisat' : selectedShopForQuote.categoryIcon === 'electric' ? 'elektrik' : selectedShopForQuote.categoryIcon === 'paint' ? 'boya-tadilat' : 'montaj')) ||
          services[0];
        return (
          <RequestWizard
            service={wizardService}
            targetProfessional={{
              id: selectedShopForQuote.id,
              name: selectedShopForQuote.ownerName
                ? `${selectedShopForQuote.ownerName} (${selectedShopForQuote.name})`
                : selectedShopForQuote.name,
              districts: [selectedShopForQuote.district],
            }}
            onClose={() => setSelectedShopForQuote(null)}
          />
        );
      })()}

      {showDrawer && placedPinCoords && (
        <div className={styles.modalBackdrop} onClick={() => setShowDrawer(false)}>
          <div className={styles.drawerCard} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="drawer-title">
            <div className={styles.drawerHeader}>
              <h3 id="drawer-title" className={styles.drawerTitle}>📍 Dükkan / Atölye Konumunu Kaydet</h3>
              <button type="button" className={styles.infoClose} onClick={() => setShowDrawer(false)}>×</button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
              İşaretlediğiniz gerçek GPS koordinatı ({placedPinCoords.lat.toFixed(4)}, {placedPinCoords.lng.toFixed(4)}) harita üzerinde dükkanınız olarak görünecektir.
            </p>
            <form className={styles.formGrid} onSubmit={handleSaveShop}>
              <label className={styles.formLabel}>
                Dükkan / İşletme Adı *
                <input
                  className={styles.formInput}
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Örn: Başkent Tesisat & Mekanik"
                  autoFocus
                />
              </label>
              <label className={styles.formLabel}>
                Yetkili Usta Adı
                <input
                  className={styles.formInput}
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Örn: Ahmet Usta"
                />
              </label>
              <label className={styles.formLabel}>
                Hizmet Alanı
                <select
                  className={styles.formSelect}
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (e.target.value.includes('Tesisat')) setCategoryIcon('plumbing');
                    else if (e.target.value.includes('Elektrik')) setCategoryIcon('electric');
                    else if (e.target.value.includes('Mobilya')) setCategoryIcon('carpentry');
                    else if (e.target.value.includes('Boya')) setCategoryIcon('paint');
                    else setCategoryIcon('repair');
                  }}
                >
                  <option>Tesisat & Mekanik</option>
                  <option>Elektrik</option>
                  <option>Mobilya & Marangozluk</option>
                  <option>Boya & Dekorasyon</option>
                  <option>Montaj & Onarım</option>
                  <option>Kilit & Güvenlik</option>
                </select>
              </label>
              <label className={styles.formLabel}>
                İlçe
                <select
                  className={styles.formSelect}
                  value={districtInput}
                  onChange={(e) => setDistrictInput(e.target.value)}
                >
                  {ankaraDistrictsGeo.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </label>
              <label className={styles.formLabel}>
                Mahalle / Sanayi Sitesi
                <input
                  className={styles.formInput}
                  value={neighborhoodInput}
                  onChange={(e) => setNeighborhoodInput(e.target.value)}
                  placeholder="Örn: Ostim / İvedik OSB / Kızılay"
                />
              </label>
              <label className={styles.formLabel}>
                Açık Adres Tarifi
                <input
                  className={styles.formInput}
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  placeholder="Örn: 1234. Cadde No: 24"
                />
              </label>
              
              <label className={styles.formCheckboxLabel}>
                <input
                  type="checkbox"
                  checked={isEmergencyInput}
                  onChange={(e) => setIsEmergencyInput(e.target.checked)}
                  className={styles.formCheckbox}
                />
                <span>🚨 7/24 Acil ve Nöbetçi Hizmet Veriyorum (Gece / Tatil Çağrıları)</span>
              </label>

              <label className={styles.formLabel}>
                Telefon / İletişim
                <input
                  className={styles.formInput}
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="0312 ..."
                />
              </label>
              <button type="submit" className={styles.formSubmit}>
                Dükkanı Haritaya Ekle ve Kaydet ✓
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
