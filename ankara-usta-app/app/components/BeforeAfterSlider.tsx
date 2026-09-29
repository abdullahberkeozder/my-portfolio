'use client';

import React, { useState } from 'react';
import styles from './beforeAfterSlider.module.css';

export interface BeforeAfterItem {
  id: string;
  title: string;
  category: string;
  beforeDesc: string;
  afterDesc: string;
  beforeBadge?: string;
  afterBadge?: string;
}

const DEFAULT_PROJECTS: BeforeAfterItem[] = [
  {
    id: 'tesisat-1',
    title: 'Eski Galveniz Boru Yenileme & Kaçak Onarımı',
    category: 'Sıhhi Tesisat',
    beforeDesc: 'Yıpranmış metal borular, gizli su sızıntısı ve duvar nemlenmesi',
    afterDesc: 'Lazerli kaçak tespiti, PEX sessiz boru sistemi ve sıfır sızıntı garantisi',
    beforeBadge: 'Eski Durum',
    afterBadge: 'Tamamlanan İş',
  },
  {
    id: 'elektrik-1',
    title: 'Eski Tip Sigorta Panosu & Kaçak Akım Rölesi Montajı',
    category: 'Elektrik',
    beforeDesc: 'Eriyen porselen sigortalar, yangın riski ve topraklama eksikliği',
    afterDesc: 'Siemens otomat panosu, 30mA hayat koruma rölesi ve test onaylı topraklama',
    beforeBadge: 'Riskli Tesisat',
    afterBadge: 'Güvenli Pano',
  },
  {
    id: 'tadilat-1',
    title: 'Salon Duvar Çatlakları & Pürüzsüz Boya Uygulaması',
    category: 'Boya & Tadilat',
    beforeDesc: 'Derin oturma çatlakları, dökülen eski astar ve dalgalı yüzey',
    afterDesc: 'Fileli derz dolgu, çift kat saten alçı ve silinebilir jotun mat boya',
    beforeBadge: 'Hasarlı Duvar',
    afterBadge: 'Kusursuz Yüzey',
  },
];

export default function BeforeAfterSlider({
  items = DEFAULT_PROJECTS,
  className = '',
}: {
  items?: BeforeAfterItem[];
  className?: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);

  const activeItem = items[selectedIndex] ?? items[0];

  return (
    <div className={className}>
      {/* Category selector pills */}
      {items.length > 1 && (
        <div className={styles.sliderTabs} role="tablist" aria-label="Önce / Sonra iş örnekleri">
          {items.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={idx === selectedIndex}
              className={`${styles.sliderTab} ${idx === selectedIndex ? styles.sliderTabActive : ''}`}
              onClick={() => {
                setSelectedIndex(idx);
                setSliderPos(50);
              }}
            >
              {item.category}: {item.title.split('&')[0].trim()}
            </button>
          ))}
        </div>
      )}

      {/* Interactive slider viewer */}
      <div className={styles.container} aria-label={`${activeItem.title} - Önce ve Sonra karşılaştırma görseli`}>
        {/* After (background layer) */}
        <div className={`${styles.imageLayer} ${styles.afterLayer}`}>
          <div className={`${styles.graphicScene} ${styles.afterScene}`}>
            <span className={styles.sceneIcon}>✨</span>
            <strong className={styles.sceneTitle}>{activeItem.title}</strong>
            <p className={styles.sceneDesc}>
              {activeItem.afterDesc}
            </p>
            <span className={styles.sceneTagAfter}>
              ✓ Orkestra Usta Kalite Standardı
            </span>
          </div>
          <span className={`${styles.badge} ${styles.afterBadge}`}>
            {activeItem.afterBadge || 'SONRA'}
          </span>
        </div>

        {/* Before (clipped overlay layer) */}
        <div
          className={`${styles.imageLayer} ${styles.beforeLayer}`}
          style={{ width: `${sliderPos}%` }}
        >
          <div className={`${styles.graphicScene} ${styles.beforeScene} ${styles.beforeInner}`}>
            <span className={styles.sceneIcon}>⚠️</span>
            <strong className={styles.sceneTitle}>Başlangıç Durumu</strong>
            <p className={styles.sceneDesc}>
              {activeItem.beforeDesc}
            </p>
            <span className={styles.sceneTagBefore}>
              Müdahale Öncesi Durum
            </span>
          </div>
          <span className={`${styles.badge} ${styles.beforeBadge}`}>
            {activeItem.beforeBadge || 'ÖNCE'}
          </span>
        </div>

        {/* Divider line & handle */}
        <div className={styles.dividerLine} style={{ left: `${sliderPos}%` }}>
          <div className={styles.handleButton} aria-hidden="true">
            ⟷
          </div>
        </div>

        {/* Invisible range input for interaction & accessibility */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          className={styles.sliderInput}
          aria-label="Önce ve sonra kaydırıcısı: Sol taraf önce, sağ taraf sonra"
        />
      </div>

      {/* Caption & instructions */}
      <div className={styles.captionBar}>
        <span>💡 <em>Çizgiyi sağa-sola kaydırarak ustanın iş kalitesini inceleyebilirsiniz.</em></span>
        <span className={styles.conversionRate}>%{sliderPos} Dönüşüm</span>
      </div>
    </div>
  );
}
