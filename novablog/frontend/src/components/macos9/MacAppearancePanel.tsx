'use client';

import React, { useState } from 'react';
import { macSound } from '@/lib/retroAudioMac9';

export type WallpaperTheme =
  | 'sonata-purple'
  | 'quantum-foam'
  | 'capsules'
  | 'blue-dalmatian'
  | 'blueberry-union'
  | 'heavy-petal'
  | 'blueberry-oxygen'
  | 'tangerine-fusion'
  | 'bondi-blue'
  | 'dark-carbon'
  | 'blueprint'
  | 'platinum-gray';

interface MacAppearancePanelProps {
  currentWallpaper: WallpaperTheme;
  onSelectWallpaper: (theme: WallpaperTheme) => void;
  onClose?: () => void;
}

interface WallpaperItem {
  id: WallpaperTheme;
  name: string;
  patternName: string;
  patternMeta: string;
  pictureMeta: string;
  previewClass: string;
  desc: string;
}

const WALLPAPER_ITEMS: WallpaperItem[] = [
  {
    id: 'quantum-foam',
    name: 'Quantum Foam',
    patternName: 'Waves',
    patternMeta: '16 X 16, 2K',
    pictureMeta: '800 X 600, 168K',
    previewClass: 'mac9-wallpaper-quantum-foam',
    desc: 'Lavanta ipek dalgaları & yumuşak organik eğriler (Figma 68-94977)',
  },
  {
    id: 'sonata-purple',
    name: 'Mac OS Default',
    patternName: 'Sonata Embossed',
    patternMeta: '32 X 32, 4K',
    pictureMeta: '1024 X 768, 220K',
    previewClass: 'mac9-wallpaper-sonata-purple',
    desc: 'Orijinal 1999 kabartmalı mor Finder deseni',
  },
  {
    id: 'capsules',
    name: 'Capsules',
    patternName: 'Aqua Spheres',
    patternMeta: '32 X 32, 4K',
    pictureMeta: '800 X 600, 192K',
    previewClass: 'mac9-wallpaper-capsules',
    desc: 'Parlak iMac şeker kapsülleri (Figma 73:1022)',
  },
  {
    id: 'blue-dalmatian',
    name: 'Blue Dalmatian',
    patternName: 'Dalmatian Dots',
    patternMeta: '24 X 24, 3K',
    pictureMeta: '800 X 600, 150K',
    previewClass: 'mac9-wallpaper-blue-dalmatian',
    desc: 'Retro iMac Swirl Dots deseni (Figma 73:1019)',
  },
  {
    id: 'blueberry-union',
    name: 'Blueberry Union',
    patternName: 'Blueberry Grid',
    patternMeta: '16 X 16, 2K',
    pictureMeta: '800 X 600, 140K',
    previewClass: 'mac9-wallpaper-blueberry-union',
    desc: 'Geometrik teknik ızgara (Figma 73:1085)',
  },
  {
    id: 'heavy-petal',
    name: 'Heavy Petal',
    patternName: 'Indigo Floral',
    patternMeta: '32 X 32, 4K',
    pictureMeta: '800 X 600, 185K',
    previewClass: 'mac9-wallpaper-heavy-petal',
    desc: 'Derin indigo floral akış (Figma 73:1084)',
  },
  {
    id: 'blueberry-oxygen',
    name: 'Blueberry Oxygen',
    patternName: 'Oxygen Swirl',
    patternMeta: '32 X 32, 4K',
    pictureMeta: '800 X 600, 175K',
    previewClass: 'mac9-wallpaper-blueberry-oxygen',
    desc: 'Siyanür radyal oksijen helezonu (Figma 73:1093)',
  },
  {
    id: 'tangerine-fusion',
    name: 'Tangerine Fusion',
    patternName: 'Tangerine Sunset',
    patternMeta: '32 X 32, 4K',
    pictureMeta: '800 X 600, 190K',
    previewClass: 'mac9-wallpaper-tangerine-fusion',
    desc: '1999 iMac Mandalina günbatımı (Figma 73:1092)',
  },
  {
    id: 'bondi-blue',
    name: 'Bondi Blue',
    patternName: 'Bondi Aqua',
    patternMeta: '16 X 16, 2K',
    pictureMeta: '800 X 600, 160K',
    previewClass: 'mac9-wallpaper-bondi-blue',
    desc: 'Steve Jobs 1998 iMac G3 okyanus mavisi',
  },
  {
    id: 'dark-carbon',
    name: 'Obsidian Carbon',
    patternName: 'Carbon Fiber',
    patternMeta: '20 X 20, 2K',
    pictureMeta: '1024 X 768, 210K',
    previewClass: 'mac9-wallpaper-dark-carbon',
    desc: 'Gece modu için mat karbon fiber örgü',
  },
  {
    id: 'blueprint',
    name: 'Cupertino Blueprint',
    patternName: 'Matrix Grid',
    patternMeta: '16 X 16, 1K',
    pictureMeta: '800 X 600, 130K',
    previewClass: 'mac9-wallpaper-blueprint',
    desc: 'Mühendislik matris koordinatları',
  },
  {
    id: 'platinum-gray',
    name: 'Classic Platinum',
    patternName: 'Platinum Dither',
    patternMeta: '8 X 8, 1K',
    pictureMeta: '640 X 480, 80K',
    previewClass: 'mac9-wallpaper-platinum-gray',
    desc: 'Distraction-free nötr gri pikselli dither',
  },
];

export const MacAppearancePanel: React.FC<MacAppearancePanelProps> = ({
  currentWallpaper,
  onSelectWallpaper,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'themes' | 'appearance' | 'fonts' | 'desktop' | 'sound' | 'options'>('desktop');
  const [selectedId, setSelectedId] = useState<WallpaperTheme>(currentWallpaper);

  React.useEffect(() => {
    setSelectedId(currentWallpaper);
  }, [currentWallpaper]);

  const activeItem = WALLPAPER_ITEMS.find((item) => item.id === selectedId) || WALLPAPER_ITEMS[0];

  const handleApply = () => {
    macSound.playMacClickDown();
    onSelectWallpaper(selectedId);
  };

  return (
    <div className="flex flex-col h-full bg-[#CCCCCC] select-none text-[12px] text-[#262626] font-['Charcoal',sans-serif]">
      {/* 6 Sekmeli Orijinal Mac OS 9 Appearance Sekme Başlığı (Image 5) */}
      <div className="flex items-center gap-1 px-3 pt-2 border-b border-[#808080] bg-[#DDDDDD] overflow-x-auto">
        {(['Themes', 'Appearance', 'Fonts', 'Desktop', 'Sound', 'Options'] as const).map((tab) => {
          const tabKey = tab.toLowerCase() as typeof activeTab;
          const isActive = activeTab === tabKey;
          return (
            <button
              key={tab}
              onClick={() => {
                macSound.playMacClickUp();
                setActiveTab(tabKey);
              }}
              className={`px-3 py-1 text-[11px] rounded-t-[3px] border-t border-l border-r border-[#262626] transition-none whitespace-nowrap ${
                isActive
                  ? 'bg-[#CCCCCC] font-bold shadow-[inset_0_1px_0_#FFFFFF]'
                  : 'bg-[#BBBBBB] hover:bg-[#C4C4C4] text-[#444]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Ana Gövde */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* ================= TAB: DESKTOP (IMAGE 5) ================= */}
        {activeTab === 'desktop' && (
          <div className="flex flex-col h-full justify-between gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* SOL TARAF: PREVIEW ÇERÇEVESİ VE METAVERİLER */}
              <div className="flex flex-col">
                {/* 3D Inset Preview Frame */}
                <div className="w-full h-44 border-2 border-[#808080] shadow-[inset_1px_1px_0_#000000,1px_1px_0_#FFFFFF] rounded-[2px] p-1 bg-[#404040]">
                  <div
                    className={`w-full h-full rounded-[1px] border border-[#262626] ${activeItem.previewClass}`}
                  />
                </div>

                {/* Pattern & Picture Metadata Info (Tam Image 5) */}
                <div className="mt-3 text-[11px] font-mono leading-tight space-y-1 text-[#333]">
                  <div className="flex">
                    <span className="font-bold w-20">Pattern:</span>
                    <span>{activeItem.patternName}</span>
                  </div>
                  <div className="flex pl-20 text-[10px] text-[#666]">
                    <span>{activeItem.patternMeta}</span>
                  </div>
                  <div className="flex pt-1">
                    <span className="font-bold w-20">Picture:</span>
                    <span className="font-bold text-[#000080]">{activeItem.name}</span>
                  </div>
                  <div className="flex pl-20 text-[10px] text-[#666]">
                    <span>{activeItem.pictureMeta}</span>
                  </div>
                </div>
              </div>

              {/* SAĞ TARAF: PATTERNS LİSTESİ & SEÇİM */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[12px]">Patterns:</span>
                  <span className="text-[10px] text-[#555]">Figma Mac OS 9 Wallpapers</span>
                </div>

                {/* Scrollable Mac OS 9 Listbox (Image 5) */}
                <div className="h-44 bg-white border border-[#808080] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3)] overflow-y-auto select-none rounded-[1px]">
                  {WALLPAPER_ITEMS.map((item) => {
                    const isSelected = selectedId === item.id;
                    const isApplied = currentWallpaper === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          macSound.playMacClickDown();
                          setSelectedId(item.id);
                        }}
                        onDoubleClick={() => {
                          setSelectedId(item.id);
                          onSelectWallpaper(item.id);
                        }}
                        className={`px-3 py-1 text-[11px] flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#000080] text-white font-bold'
                            : 'hover:bg-[#EAEAEA] text-[#262626]'
                        }`}
                      >
                        <span className="truncate">{item.name}</span>
                        {isApplied && (
                          <span
                            className={`text-[9px] px-1 rounded font-mono ${
                              isSelected ? 'bg-white text-[#000080]' : 'bg-[#D1E7DD] text-[#0F5132]'
                            }`}
                          >
                            ✓ Aktif
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Picture Actions */}
                <div className="mt-2.5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => alert(`Picture: ${activeItem.name} yüklendi.`)}
                      className="mac9-btn px-3 py-1 text-[11px] flex-1"
                    >
                      Place Picture...
                    </button>
                    <select
                      className="mac9-inset-box bg-[#EAEAEA] text-[11px] px-2 py-1 border border-[#808080] rounded-[2px]"
                      defaultValue="auto"
                    >
                      <option value="auto">Position Automatically</option>
                      <option value="center">Center on Desktop</option>
                      <option value="tile">Tile Across Screen</option>
                      <option value="scale">Scale to Fit</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ALT BUTONLAR (Double-ring primary button "Set Desktop") */}
            <div className="pt-2 border-t border-[#808080] flex items-center justify-between">
              <span className="text-[11px] text-[#555] italic">
                {activeItem.desc}
              </span>

              <div className="flex items-center gap-2">
                {onClose && (
                  <button onClick={onClose} className="mac9-btn px-4 py-1 text-[11px]">
                    Kapat
                  </button>
                )}
                <button
                  onClick={handleApply}
                  className="px-4 py-1 font-bold text-[11px] bg-[#DDDDDD] border border-[#262626] rounded-[4px] shadow-[0_0_0_2px_#262626,inset_1px_1px_0_#FFFFFF,inset_-1px_-1px_0_#808080] active:shadow-[0_0_0_2px_#262626,inset_1px_1px_0_#000000] hover:bg-[#E5E5E5]"
                >
                  Set Desktop
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: THEMES ================= */}
        {activeTab === 'themes' && (
          <div className="space-y-3">
            <h4 className="font-bold text-[13px]">Sistem Temaları</h4>
            <p className="text-[11px] text-[#555]">
              Mac OS 9 sistem görünümleri ve renk paletleri.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => {
                  onSelectWallpaper('quantum-foam');
                  setSelectedId('quantum-foam');
                }}
                className="p-3 border border-[#808080] bg-[#DDDDDD] hover:bg-[#E8E8E8] cursor-pointer rounded"
              >
                <div className="font-bold text-[12px] text-[#000080]">Aqua Sonata (1999)</div>
                <div className="text-[11px] text-[#555] mt-1">
                  Quantum Foam ipek desenli varsayılan masaüstü teması.
                </div>
              </div>

              <div
                onClick={() => {
                  onSelectWallpaper('dark-carbon');
                  setSelectedId('dark-carbon');
                }}
                className="p-3 border border-[#808080] bg-[#1E293B] text-white hover:bg-[#334155] cursor-pointer rounded"
              >
                <div className="font-bold text-[12px] text-[#38BDF8]">Obsidian Pro (Night Mode)</div>
                <div className="text-[11px] text-[#94A3B8] mt-1">
                  Karanlık mod ve yüksek kontrastlı mühendislik görünümü.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: SOUND ================= */}
        {activeTab === 'sound' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-[13px] mb-1">Web Audio API Prosedürel Ses Motoru</h4>
              <p className="text-[11px] text-[#555]">
                Sıfır harici MP3/WAV dosyası; tüm sesler donanımsal frekans sentezleyicisi ile gerçek zamanlı oluşturulur.
              </p>
            </div>

            <div className="bg-[#DDDDDD] p-3 border border-[#808080] rounded space-y-2">
              <span className="font-bold text-[11px] text-[#444] block">Sistem Ses Efektlerini Dinle:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => macSound.playMacStartupChime()}
                  className="mac9-btn py-1.5"
                >
                  🔔 Startup Chime (C-Maj)
                </button>
                <button
                  onClick={() => macSound.playSosumi()}
                  className="mac9-btn py-1.5"
                >
                  🎸 Sosumi Alert
                </button>
                <button
                  onClick={() => macSound.playWildEep()}
                  className="mac9-btn py-1.5"
                >
                  ⚡ Wild Eep
                </button>
                <button
                  onClick={() => macSound.playDroplet()}
                  className="mac9-btn py-1.5"
                >
                  💧 Droplet Beep
                </button>
                <button
                  onClick={() => macSound.playWindowShade()}
                  className="mac9-btn py-1.5"
                >
                  🪜 WindowShade
                </button>
                <button
                  onClick={() => macSound.playTrashCrinkle()}
                  className="mac9-btn py-1.5"
                >
                  🗑️ Trash Crinkle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: APPEARANCE / FONTS / OPTIONS ================= */}
        {(activeTab === 'appearance' || activeTab === 'fonts' || activeTab === 'options') && (
          <div className="space-y-3">
            <h4 className="font-bold text-[13px]">Sistem Tercihleri — {activeTab.toUpperCase()}</h4>
            <div className="mac9-inset-box p-3 bg-white space-y-2 text-[11px]">
              <div className="flex justify-between border-b pb-1">
                <span>Ana Sistem Fontu:</span>
                <span className="font-bold">Charcoal 12pt / Geneva 9pt</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Vurgu Rengi:</span>
                <span className="font-bold text-[#000080]">Bondi Blue / Cobalt #000080</span>
              </div>
              <div className="flex justify-between">
                <span>WindowShade Animasyonu:</span>
                <span className="font-bold text-emerald-700">Etkin (Saniyede 60 Kare)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
