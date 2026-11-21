'use client';

import React, { useState } from 'react';
import { macSound } from '@/lib/retroAudioMac9';

export type WallpaperTheme =
  | 'sonata-purple'
  | 'macos-bg'
  | 'blue-dalmatian'
  | 'capsules'
  | 'tub'
  | 'ufo'
  | 'blueberry-union'
  | 'heavy-petal'
  | 'blueberry-oxygen'
  | 'tangerine-radian'
  | 'indigo-foam'
  | 'quantum-foam'
  | 'dark-carbon'
  | 'bondi-blue'
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
  thumbSrc: string;
  fullSrc: string;
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
    thumbSrc: '/retro/wallpapers/quantum-foam.png',
    fullSrc: '/retro/wallpapers/quantum-foam-800.png',
    previewClass: 'mac9-wallpaper-quantum-foam',
    desc: 'Lavanta ipek dalgaları & yumuşak organik eğriler (Figma Image 9)',
  },
  {
    id: 'sonata-purple',
    name: 'Default Wallpaper',
    patternName: 'Sonata Embossed',
    patternMeta: '32 X 32, 4K',
    pictureMeta: '1024 X 768, 220K',
    thumbSrc: '/retro/wallpapers/default-wallpaper.png',
    fullSrc: '/retro/wallpapers/default-wallpaper-800.png',
    previewClass: 'mac9-wallpaper-sonata-purple',
    desc: 'Orijinal 1999 kabartmalı mor Finder deseni (Figma Image 9)',
  },
  {
    id: 'macos-bg',
    name: 'macOS Background',
    patternName: 'Subtle Finder',
    patternMeta: '32 X 32, 4K',
    pictureMeta: '1024 X 768, 180K',
    thumbSrc: '/retro/wallpapers/macos-bg.png',
    fullSrc: '/retro/wallpapers/macos-bg-800.png',
    previewClass: 'mac9-wallpaper-macos-bg',
    desc: 'Açık buz mavisi ve büyük transparan Finder logosu (Figma Image 9)',
  },
  {
    id: 'blue-dalmatian',
    name: 'Blue Dalmatian',
    patternName: 'Dalmatian Dots',
    patternMeta: '24 X 24, 3K',
    pictureMeta: '800 X 600, 150K',
    thumbSrc: '/retro/wallpapers/blue-dalmatian.png',
    fullSrc: '/retro/wallpapers/blue-dalmatian-800.png',
    previewClass: 'mac9-wallpaper-blue-dalmatian',
    desc: 'Işıltılı transparan küreler & siyanür gradyanı (Figma Image 9)',
  },
  {
    id: 'capsules',
    name: 'Capsules',
    patternName: 'Aqua Spheres',
    patternMeta: '32 X 32, 4K',
    pictureMeta: '800 X 600, 192K',
    thumbSrc: '/retro/wallpapers/capsules.png',
    fullSrc: '/retro/wallpapers/capsules-800.png',
    previewClass: 'mac9-wallpaper-capsules',
    desc: 'Parlak iMac turkuaz şeker kapsülleri (Figma Image 9)',
  },
  {
    id: 'tub',
    name: 'Tub',
    patternName: 'Turbine Propellers',
    patternMeta: '32 X 32, 4K',
    pictureMeta: '800 X 600, 170K',
    thumbSrc: '/retro/wallpapers/tub.png',
    fullSrc: '/retro/wallpapers/tub-800.png',
    previewClass: 'mac9-wallpaper-tub',
    desc: 'Mandalina rengi zemin ve 3 kanatlı altın pervaneler (Figma Image 9)',
  },
  {
    id: 'ufo',
    name: 'UFO',
    patternName: 'Saucer Fleets',
    patternMeta: '32 X 32, 4K',
    pictureMeta: '800 X 600, 165K',
    thumbSrc: '/retro/wallpapers/ufo.png',
    fullSrc: '/retro/wallpapers/ufo-800.png',
    previewClass: 'mac9-wallpaper-ufo',
    desc: 'Fıstık yeşili uzay zemini & uçan daire filosu (Figma Image 9)',
  },
  {
    id: 'blueberry-union',
    name: 'Blueberry Union',
    patternName: 'Aquatic Pods',
    patternMeta: '32 X 32, 4K',
    pictureMeta: '800 X 600, 140K',
    thumbSrc: '/retro/wallpapers/blueberry-union.png',
    fullSrc: '/retro/wallpapers/blueberry-union-800.png',
    previewClass: 'mac9-wallpaper-blueberry-union',
    desc: 'Sualtı biyolojik denizanası & okyanus kapsülleri (Figma Image 9)',
  },
  {
    id: 'heavy-petal',
    name: 'Heavy Petal',
    patternName: 'Petal Flairs',
    patternMeta: '32 X 32, 4K',
    pictureMeta: '800 X 600, 185K',
    thumbSrc: '/retro/wallpapers/heavy-petal.png',
    fullSrc: '/retro/wallpapers/heavy-petal-800.png',
    previewClass: 'mac9-wallpaper-heavy-petal',
    desc: 'Parlak fuşya & derin çivit orkide taçyaprakları (Figma Image 9)',
  },
  {
    id: 'blueberry-oxygen',
    name: 'Blueberry Oxygen',
    patternName: 'Oxygen Bubbles',
    patternMeta: '32 X 32, 4K',
    pictureMeta: '800 X 600, 175K',
    thumbSrc: '/retro/wallpapers/blueberry-oxygen.png',
    fullSrc: '/retro/wallpapers/blueberry-oxygen-800.png',
    previewClass: 'mac9-wallpaper-blueberry-oxygen',
    desc: 'Okyanus derinliklerinden yükselen mikro oksijen kabarcıkları (Figma Image 9)',
  },
  {
    id: 'tangerine-radian',
    name: 'Tangerine Radian',
    patternName: 'Solar Radiance',
    patternMeta: '32 X 32, 4K',
    pictureMeta: '800 X 600, 190K',
    thumbSrc: '/retro/wallpapers/tangerine-radian.png',
    fullSrc: '/retro/wallpapers/tangerine-radian-800.png',
    previewClass: 'mac9-wallpaper-tangerine-radian',
    desc: 'Işıltılı kehribar rengi biyolojik dikenli küreler (Figma Image 9)',
  },
  {
    id: 'indigo-foam',
    name: 'Indigo Foam',
    patternName: 'Indigo Satin',
    patternMeta: '32 X 32, 4K',
    pictureMeta: '1024 X 768, 210K',
    thumbSrc: '/retro/wallpapers/indigo-foam.png',
    fullSrc: '/retro/wallpapers/indigo-foam-800.png',
    previewClass: 'mac9-wallpaper-indigo-foam',
    desc: 'Derin kobalt mavisi akıcı ipek ve saten kumaş (Figma Image 9)',
  },
  {
    id: 'dark-carbon',
    name: 'Obsidian Carbon',
    patternName: 'Carbon Fiber',
    patternMeta: '20 X 20, 2K',
    pictureMeta: '1024 X 768, 210K',
    thumbSrc: '/retro/wallpapers/obsidian-carbon.png',
    fullSrc: '/retro/wallpapers/obsidian-carbon-800.png',
    previewClass: 'mac9-wallpaper-dark-carbon',
    desc: 'Gece modu için mat karbon fiber örgü (Figma Colours: 800)',
  },
  {
    id: 'bondi-blue',
    name: 'Bondi Blue',
    patternName: 'Bondi Aqua',
    patternMeta: '16 X 16, 2K',
    pictureMeta: '800 X 600, 160K',
    thumbSrc: '/retro/wallpapers/bondi-blue.png',
    fullSrc: '/retro/wallpapers/bondi-blue-800.png',
    previewClass: 'mac9-wallpaper-bondi-blue',
    desc: 'Steve Jobs 1998 iMac G3 okyanus mavisi camı',
  },
  {
    id: 'blueprint',
    name: 'Cupertino Blueprint',
    patternName: 'Matrix Grid',
    patternMeta: '16 X 16, 1K',
    pictureMeta: '800 X 600, 130K',
    thumbSrc: '/retro/wallpapers/blueprint.png',
    fullSrc: '/retro/wallpapers/blueprint-800.png',
    previewClass: 'mac9-wallpaper-blueprint',
    desc: 'Mühendislik matris koordinatları',
  },
  {
    id: 'platinum-gray',
    name: 'Classic Platinum',
    patternName: 'Platinum Dither',
    patternMeta: '8 X 8, 1K',
    pictureMeta: '640 X 480, 80K',
    thumbSrc: '/retro/wallpapers/platinum-gray.png',
    fullSrc: '/retro/wallpapers/platinum-gray-800.png',
    previewClass: 'mac9-wallpaper-platinum-gray',
    desc: 'Distraction-free nötr gri pikselli dither',
  },
];

// Reusable HD Vector Stepper Arrows (Figma Image 6 & 8)
const MacStepperArrows = () => (
  <div className="flex flex-col items-center justify-center pl-1.5 ml-1.5 border-l border-[#808080] shadow-[1px_0_0_#FFFFFF] shrink-0 pointer-events-none">
    <svg className="w-2 h-1 text-[#262626]" viewBox="0 0 8 4" fill="currentColor">
      <polygon points="4,0 0,4 8,4" />
    </svg>
    <div className="h-[2px]" />
    <svg className="w-2 h-1 text-[#262626]" viewBox="0 0 8 4" fill="currentColor">
      <polygon points="0,0 8,0 4,4" />
    </svg>
  </div>
);

export const MacAppearancePanel: React.FC<MacAppearancePanelProps> = ({
  currentWallpaper,
  onSelectWallpaper,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'themes' | 'appearance' | 'fonts' | 'desktop' | 'sound' | 'options'>('desktop');
  const [selectedId, setSelectedId] = useState<WallpaperTheme>(currentWallpaper);

  // Position Automatically dropdown state
  const [isPositionOpen, setIsPositionOpen] = useState(false);
  const [positionMode, setPositionMode] = useState('Position Automatically');

  // Appearance Tab Dropdown states (Image 2)
  const [isHighlightOpen, setIsHighlightOpen] = useState(false);
  const [highlightColor, setHighlightColor] = useState({ name: 'Purple', hex: '#63659c' });
  const [isVariationOpen, setIsVariationOpen] = useState(false);
  const [variation, setVariation] = useState({ name: 'Lavender', hex: '#C6C8F9' });

  React.useEffect(() => {
    setSelectedId(currentWallpaper);
  }, [currentWallpaper]);

  const activeItem = WALLPAPER_ITEMS.find((item) => item.id === selectedId) || WALLPAPER_ITEMS[0];

  const handleApply = () => {
    macSound.playMacClickDown();
    onSelectWallpaper(selectedId);
  };

  const highlightOptions = [
    { name: 'Azul', hex: '#333399' },
    { name: 'Bondi', hex: '#007788' },
    { name: 'Green', hex: '#449944' },
    { name: 'Purple', hex: '#63659c' },
    { name: 'Plum', hex: '#883366' },
    { name: 'Teal', hex: '#208075' },
    { name: 'Yellow', hex: '#DDBB22' },
  ];

  const variationOptions = [
    { name: 'Lavender', hex: '#C6C8F9' },
    { name: 'Graphite', hex: '#4A4A5A' },
    { name: 'Azul', hex: '#333399' },
    { name: 'Bondi', hex: '#007788' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#CCCCCC] select-none text-[12px] text-[#262626] font-['Charcoal',sans-serif]">
      {/* 6 Sekmeli Orijinal Mac OS 9 Appearance Sekme Başlığı (Figma 82-812) */}
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
      <div className="flex-1 p-4 overflow-y-auto mac9-scrollbar">
        {/* ================= TAB: DESKTOP (CLONED FROM FIGMA 82-812) ================= */}
        {activeTab === 'desktop' && (
          <div className="flex flex-col h-full justify-between gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* SOL TARAF: APPLE STUDIO DISPLAY MONİTÖR ÖNİZLEMESİ & METAVERİLER */}
              <div className="flex flex-col">
                {/* Figma 82-812 Studio Display Bezel Frame */}
                <div className="w-full bg-[#D4D4D4] border-2 border-[#808080] shadow-[inset_1px_1px_0_#FFFFFF,1px_1px_0_#FFFFFF] rounded-[4px] p-2 flex flex-col items-center">
                  {/* Monitor Screen Glass */}
                  <div className="w-full h-36 border border-[#262626] shadow-[inset_1px_1px_3px_#000000] rounded-[2px] overflow-hidden relative flex flex-col bg-black">
                    {/* Mini Menu Bar at top of monitor screen */}
                    <div className="h-2.5 bg-[#DDDDDD] border-b border-[#262626] flex items-center px-1.5 justify-between shrink-0 z-10">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-[#262626] rounded-full" />
                        <div className="w-3.5 h-0.5 bg-[#666]" />
                        <div className="w-2.5 h-0.5 bg-[#888]" />
                      </div>
                      <div className="w-3 h-0.5 bg-[#666]" />
                    </div>

                    {/* Active Wallpaper Canvas inside monitor */}
                    <div className="flex-1 relative overflow-hidden">
                      <img
                        src={activeItem.fullSrc}
                        alt={activeItem.name}
                        className="w-full h-full object-cover select-none pointer-events-none"
                      />

                      {/* Mini Desktop Icons mockup on the right */}
                      <div className="absolute top-1 right-1 flex flex-col gap-1 items-end z-10">
                        <div className="w-3 h-2.5 bg-[#CCCCCC] border border-[#262626] shadow-[1px_1px_0_rgba(0,0,0,0.4)]" title="Macintosh HD" />
                        <div className="w-2.5 h-2.5 bg-[#999999] border border-[#262626] shadow-[1px_1px_0_rgba(0,0,0,0.4)]" title="Trash" />
                      </div>
                    </div>
                  </div>

                  {/* Monitor Stand and Apple Logo */}
                  <div className="w-4 h-1.5 bg-[#999999] mx-auto mt-1 rounded-sm border border-[#666]" />
                </div>

                {/* Pattern & Picture Metadata Info (Figma 82-812) */}
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
                    <span className="font-bold text-[#333399]">{activeItem.name}</span>
                  </div>
                  <div className="flex pl-20 text-[10px] text-[#666]">
                    <span>{activeItem.pictureMeta}</span>
                  </div>
                </div>
              </div>

              {/* SAĞ TARAF: PATTERNS LİSTESİ & SEÇİM (FIGMA 82-812) */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[12px]">Patterns:</span>
                  <span className="text-[10px] text-[#555]">Figma 82-812 Appearance Kit</span>
                </div>

                {/* Mac OS 9 Listbox with Authentic Scrollbar and Image Thumbnails */}
                <div className="h-44 bg-white border border-[#808080] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3)] overflow-y-auto select-none rounded-[1px] mac9-scrollbar">
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
                        className={`px-2 py-1 text-[11px] flex items-center justify-between cursor-pointer border-b border-[#F0F0F0] ${
                          isSelected
                            ? 'bg-[#333399] text-white font-bold'
                            : 'hover:bg-[#EAEAEA] text-[#262626]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {/* Mini Thumbnail Swatch */}
                          <div className="w-5 h-3.5 border border-[#808080] flex-shrink-0 overflow-hidden rounded-[1px] bg-[#DDD] shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
                            <img
                              src={item.thumbSrc}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="truncate">{item.name}</span>
                        </div>
                        {isApplied && (
                          <span
                            className={`text-[9px] px-1 rounded font-mono ${
                              isSelected ? 'bg-white text-[#333399]' : 'bg-[#D1E7DD] text-[#0F5132]'
                            }`}
                          >
                            ✓ Aktif
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Picture Actions (Figma 82-812 & Image 2 Dropdown) */}
                <div className="mt-2.5 flex flex-col gap-1.5 relative">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => alert(`Picture: ${activeItem.name} seçildi.`)}
                      className="mac9-btn px-3 py-1 text-[11px] flex-1"
                    >
                      Place Picture...
                    </button>

                    {/* Figma Image 2/3 Dropdown Stepper Button */}
                    <div className="relative">
                      <div
                        onClick={() => setIsPositionOpen((prev) => !prev)}
                        className="mac9-dropdown-stepper cursor-pointer select-none flex items-center justify-between"
                      >
                        <span className="text-[11px]">{positionMode}</span>
                        <MacStepperArrows />
                      </div>

                      {isPositionOpen && (
                        <div className="absolute top-full right-0 mt-0.5 w-48 bg-[#DDDDDD] border border-[#262626] shadow-[2px_2px_0_rgba(0,0,0,0.35)] py-1 z-50 text-[11px]">
                          {['Position Automatically', 'Scale to fit', 'Fill screen', 'Center on screen', 'Tile on screen'].map((opt) => (
                            <div
                              key={opt}
                              onClick={() => {
                                setPositionMode(opt);
                                setIsPositionOpen(false);
                                macSound.playMacClickUp();
                              }}
                              className="px-4 py-1 hover:bg-[#333399] hover:text-white cursor-pointer flex items-center justify-between"
                            >
                              <span>{opt}</span>
                              {positionMode === opt && <span className="font-bold">✓</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectWallpaper('sonata-purple');
                      setSelectedId('sonata-purple');
                    }}
                    className="mac9-btn px-3 py-0.5 text-[10px] text-[#666] self-start"
                  >
                    Remove Picture
                  </button>
                </div>
              </div>
            </div>

            {/* ALT BUTONLAR (Figma 82-812 & Mac OS 9 Standard Dialog Actions) */}
            <div className="pt-2 border-t border-[#808080] flex items-center justify-between">
              <span className="text-[11px] text-[#555] italic truncate max-w-[280px]">
                {activeItem.desc}
              </span>

              <div className="flex items-center gap-2">
                {onClose && (
                  <button onClick={onClose} className="mac9-btn px-4 py-1 text-[11px]">
                    Kapat
                  </button>
                )}
                {/* Double-border primary default button (Figma Image 2 & 6) */}
                <button
                  onClick={handleApply}
                  className="mac9-btn mac9-btn-default px-5 py-1 text-[11px]"
                >
                  Set Desktop
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: APPEARANCE (CLONED FROM FIGMA IMAGE 2) ================= */}
        {activeTab === 'appearance' && (
          <div className="space-y-4">
            <div className="bg-[#DFDFDF] border border-[#808080] shadow-[inset_1px_1px_0_#FFF] p-4 rounded-[3px] space-y-4">
              {/* 1. Appearance Look Dropdown */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="font-bold text-[12px] block">Appearance:</span>
                  <span className="text-[10px] text-[#555]">for the overall look of menus, icons, windows, and controls</span>
                </div>
                <div className="mac9-dropdown-stepper w-48 justify-between cursor-pointer">
                  <span>Apple platinum</span>
                  <MacStepperArrows />
                </div>
              </div>

              {/* 2. Highlight Color Dropdown (Image 2) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 relative">
                <div>
                  <span className="font-bold text-[12px] block">Highlight Color:</span>
                  <span className="text-[10px] text-[#555]">for selected text</span>
                </div>
                <div className="relative">
                  <div
                    onClick={() => {
                      setIsHighlightOpen((prev) => !prev);
                      setIsVariationOpen(false);
                    }}
                    className="mac9-dropdown-stepper w-48 justify-between cursor-pointer flex items-center"
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 border border-[#444] rounded-[1px]" style={{ backgroundColor: highlightColor.hex }} />
                      <span>{highlightColor.name}</span>
                    </div>
                    <MacStepperArrows />
                  </div>

                  {isHighlightOpen && (
                    <div className="absolute top-full right-0 mt-0.5 w-48 bg-[#DDDDDD] border border-[#262626] shadow-[2px_2px_0_rgba(0,0,0,0.35)] py-1 z-50 text-[11px]">
                      {highlightOptions.map((opt) => (
                        <div
                          key={opt.name}
                          onClick={() => {
                            setHighlightColor(opt);
                            setIsHighlightOpen(false);
                            macSound.playMacClickUp();
                          }}
                          className="px-3 py-1 hover:bg-[#333399] hover:text-white cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-[#444]" style={{ backgroundColor: opt.hex }} />
                            <span>{opt.name}</span>
                          </div>
                          {highlightColor.name === opt.name && <span className="font-bold">✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Variation Dropdown (Image 2) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 relative">
                <div>
                  <span className="font-bold text-[12px] block">Variation:</span>
                  <span className="text-[10px] text-[#555]">for menus and controls</span>
                </div>
                <div className="relative">
                  <div
                    onClick={() => {
                      setIsVariationOpen((prev) => !prev);
                      setIsHighlightOpen(false);
                    }}
                    className="mac9-dropdown-stepper w-48 justify-between cursor-pointer flex items-center"
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 border border-[#444] rounded-[1px]" style={{ backgroundColor: variation.hex }} />
                      <span>{variation.name}</span>
                    </div>
                    <MacStepperArrows />
                  </div>

                  {isVariationOpen && (
                    <div className="absolute top-full right-0 mt-0.5 w-48 bg-[#DDDDDD] border border-[#262626] shadow-[2px_2px_0_rgba(0,0,0,0.35)] py-1 z-50 text-[11px]">
                      {variationOptions.map((opt) => (
                        <div
                          key={opt.name}
                          onClick={() => {
                            setVariation(opt);
                            setIsVariationOpen(false);
                            macSound.playMacClickUp();
                          }}
                          className="px-3 py-1 hover:bg-[#333399] hover:text-white cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-[#444]" style={{ backgroundColor: opt.hex }} />
                            <span>{opt.name}</span>
                          </div>
                          {variation.name === opt.name && <span className="font-bold">✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                <div className="font-bold text-[12px] text-[#333399]">Aqua Sonata (1999)</div>
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

        {/* ================= TAB: FONTS / OPTIONS ================= */}
        {(activeTab === 'fonts' || activeTab === 'options') && (
          <div className="space-y-3">
            <h4 className="font-bold text-[13px]">Sistem Tercihleri — {activeTab.toUpperCase()}</h4>
            <div className="mac9-inset-box p-3 bg-white space-y-2 text-[11px]">
              <div className="flex justify-between border-b pb-1">
                <span>Ana Sistem Fontu:</span>
                <span className="font-bold">Charcoal 12pt / Geneva 9pt</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Vurgu Rengi:</span>
                <span className="font-bold text-[#333399]">Azul #333399 / Lavender #C6C8F9</span>
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
