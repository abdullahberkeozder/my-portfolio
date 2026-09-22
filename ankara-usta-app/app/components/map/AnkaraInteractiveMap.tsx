'use client';

import { useId, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { ankaraDistrictsGeo, type ShopPin } from '../../data/ankaraMapGeo';
import styles from './ankaraMap.module.css';

const RealAnkaraMap = dynamic(() => import('./RealAnkaraMap'), {
  ssr: false,
  loading: () => (
    <div className={styles.mapLoadingSkeleton} role="status" aria-live="polite">
      <div className={styles.mapLoadingSpinner} />
      <span>Temsili harita yükleniyor...</span>
    </div>
  ),
});

const tradeCategories = [
  { id: 'all', label: 'Tüm branşlar' },
  { id: 'plumbing', label: 'Tesisat' },
  { id: 'electric', label: 'Elektrik' },
  { id: 'carpentry', label: 'Marangozluk' },
  { id: 'paint', label: 'Boya' },
  { id: 'repair', label: 'Montaj' },
];

const conceptCategories: Array<Pick<ShopPin, 'category' | 'categoryIcon' | 'serviceId'>> = [
  { category: 'Tesisat', categoryIcon: 'plumbing', serviceId: 'musluk-degisimi' },
  { category: 'Elektrik', categoryIcon: 'electric', serviceId: 'priz-anahtar' },
  { category: 'Marangozluk', categoryIcon: 'carpentry', serviceId: 'mobilya-kurulumu' },
  { category: 'Boya', categoryIcon: 'paint', serviceId: 'tek-oda-boya' },
  { category: 'Montaj', categoryIcon: 'repair', serviceId: 'tv-duvar-montaji' },
];

const conceptPins: ShopPin[] = ankaraDistrictsGeo.map((district, index) => {
  const category = conceptCategories[index % conceptCategories.length];
  return {
  ...category,
  id: `concept-point-${district.id}`,
  name: `Temsili ${category.category} noktası`,
  ownerName: 'Temsili kayıt',
  district: district.name,
  neighborhood: district.neighborhoods[0] ?? 'Örnek bölge',
  address: `${district.name} bölgesi`,
  phone: 'Gösterilmez',
  rating: 0,
  reviewCount: 0,
  verifiedBadge: false,
  coords: district.center,
  latLng: { lat: district.latLngCenter[0], lng: district.latLngCenter[1] },
  isCustom: false,
  };
});

export default function AnkaraInteractiveMap({ initialDistrict }: { initialDistrict?: string }) {
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict ?? 'all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputId = useId();

  const filteredPins = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('tr-TR');
    return conceptPins.filter(pin => {
      const districtMatches = selectedDistrict === 'all' || pin.district.toLocaleLowerCase('tr-TR') === selectedDistrict.toLocaleLowerCase('tr-TR');
      const categoryMatches = selectedCategory === 'all' || pin.categoryIcon === selectedCategory;
      const queryMatches = !query || [pin.category, pin.district, pin.neighborhood]
        .some(value => value.toLocaleLowerCase('tr-TR').includes(query));
      return districtMatches && categoryMatches && queryMatches;
    });
  }, [searchQuery, selectedCategory, selectedDistrict]);

  return (
    <section className={styles.mapWrapper} aria-labelledby="concept-map-title">
      <div className={styles.mapHeader}>
        <div className={styles.headerTitleGroup}>
          <span className={styles.eyebrow}>ÜRÜN DIŞI KONSEPT</span>
          <h2 className={styles.title} id="concept-map-title">Bölge ve yoğunluk fikri</h2>
          <p className={styles.subtitle}>
            İşaretler yalnız arayüz davranışını göstermek için üretilmiştir. Gerçek usta, işletme, konum, puan veya doğrulama bilgisi içermez.
          </p>
        </div>
      </div>

      <div className={styles.filterRow} aria-label="Temsili harita filtreleri">
        <div className={styles.searchBox}>
          <label htmlFor={searchInputId} className="sr-only">Bölge veya branş ara</label>
          <input id={searchInputId} type="search" placeholder="Bölge veya branş ara" value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)} className={styles.searchInput} />
        </div>
        <button type="button" className={styles.districtPill + (selectedDistrict === 'all' ? ` ${styles.districtPillActive}` : '')}
          onClick={() => setSelectedDistrict('all')}>Tüm pilot ilçeler</button>
        {ankaraDistrictsGeo.map(district => (
          <button key={district.id} type="button"
            className={styles.districtPill + ((selectedDistrict === district.id || selectedDistrict === district.name) ? ` ${styles.districtPillActive}` : '')}
            onClick={() => setSelectedDistrict(district.id)}>{district.name}</button>
        ))}
      </div>

      <div className={styles.categoryRow} aria-label="Temsili branş filtresi">
        <span className={styles.categoryRowLabel}>Branş</span>
        {tradeCategories.map(category => (
          <button key={category.id} type="button" aria-pressed={selectedCategory === category.id}
            className={styles.categoryChip + (selectedCategory === category.id ? ` ${styles.categoryChipActive}` : '')}
            onClick={() => setSelectedCategory(category.id)}><span>{category.label}</span></button>
        ))}
      </div>

      <div className={styles.mapViewport}>
        {filteredPins.length === 0 && (
          <div className={styles.emptyMapCard} role="status">
            <h3>Temsili nokta bulunamadı</h3>
            <p>Filtreleri temizleyerek konsept noktalarının tamamını yeniden gösterebilirsiniz.</p>
            <button type="button" className={styles.emptyResetBtn} onClick={() => {
              setSelectedDistrict('all');
              setSelectedCategory('all');
              setSearchQuery('');
            }}>Filtreleri temizle</button>
          </div>
        )}
        <RealAnkaraMap filteredPins={filteredPins} selectedDistrict={selectedDistrict}
          onSelectDistrict={setSelectedDistrict} />
      </div>

      <div className={styles.statsBar} aria-label="Temsili harita özeti">
        <div className={styles.statsItem}><span>Görünüm</span><strong>{selectedDistrict === 'all' ? '9 pilot ilçe' : 'Seçili ilçe'}</strong></div>
        <div className={styles.statsItem}><span>Temsili nokta</span><strong>{filteredPins.length}</strong></div>
        <div className={styles.statsItem}><span>Ürün durumu</span><strong>Canlı değil</strong></div>
      </div>
    </section>
  );
}
