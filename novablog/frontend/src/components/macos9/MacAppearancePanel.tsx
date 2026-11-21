'use client';

import React, { useState } from 'react';
import { macSound } from '@/lib/retroAudioMac9';

export type WallpaperTheme =
  | 'sonata-purple'
  | 'bondi-blue'
  | 'blueprint'
  | 'platinum-gray'
  | 'dark-carbon';

interface MacAppearancePanelProps {
  currentWallpaper: WallpaperTheme;
  onSelectWallpaper: (theme: WallpaperTheme) => void;
  onClose?: () => void;
}

const WALLPAPERS: { id: WallpaperTheme; name: string; desc: string; previewClass: string }[] = [
  {
    id: 'sonata-purple',
    name: 'Mac OS 9 Sonata',
    desc: 'Orijinal 1999 kabartmalı mor Finder deseni (Figma Standardı)',
    previewClass: 'mac9-wallpaper-sonata-purple',
  },
  {
    id: 'bondi-blue',
    name: 'iMac Bondi Blue',
    desc: 'Steve Jobs 1998 iMac G3 okyanus mavisi cam gradyanı',
    previewClass: 'mac9-wallpaper-bondi-blue',
  },
  {
    id: 'blueprint',
    name: 'Cupertino Blueprint',
    desc: 'Mühendislik matris koordinatları & sistem mimarisi ızgarası',
    previewClass: 'mac9-wallpaper-blueprint',
  },
  {
    id: 'platinum-gray',
    name: 'Classic System 7 Platinum',
    desc: 'Distraction-free nötr gri pikselli dither deseni',
    previewClass: 'mac9-wallpaper-platinum-gray',
  },
  {
    id: 'dark-carbon',
    name: 'Obsidian Carbon Pro',
    desc: 'Gece mühendisliği için karbon fiber koyu mod dokusu',
    previewClass: 'mac9-wallpaper-dark-carbon',
  },
];

export const MacAppearancePanel: React.FC<MacAppearancePanelProps> = ({
  currentWallpaper,
  onSelectWallpaper,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'wallpapers' | 'sound' | 'about'>('wallpapers');
  const [selectedTemp, setSelectedTemp] = useState<WallpaperTheme>(currentWallpaper);

  React.useEffect(() => {
    setSelectedTemp(currentWallpaper);
  }, [currentWallpaper]);

  const handleApply = () => {
    macSound.playMacClickDown();
    onSelectWallpaper(selectedTemp);
  };

  return (
    <div className="flex flex-col h-full bg-[#CCCCCC] select-none text-[12px] text-[#262626] font-['Charcoal',sans-serif]">
      {/* Sekmeler (Appearance Control Panel Tabs) */}
      <div className="flex items-center gap-1 px-3 pt-2 border-b border-[#808080] bg-[#DDDDDD]">
        <button
          onClick={() => {
            macSound.playMacClickUp();
            setActiveTab('wallpapers');
          }}
          className={`px-3 py-1 text-[11px] rounded-t-[3px] border-t border-l border-r border-[#262626] transition-none ${
            activeTab === 'wallpapers'
              ? 'bg-[#CCCCCC] font-bold shadow-[inset_0_1px_0_#FFFFFF]'
              : 'bg-[#BBBBBB] hover:bg-[#C4C4C4] text-[#555]'
          }`}
        >
          Masaüstü Desenleri
        </button>

        <button
          onClick={() => {
            macSound.playMacClickUp();
            setActiveTab('sound');
          }}
          className={`px-3 py-1 text-[11px] rounded-t-[3px] border-t border-l border-r border-[#262626] transition-none ${
            activeTab === 'sound'
              ? 'bg-[#CCCCCC] font-bold shadow-[inset_0_1px_0_#FFFFFF]'
              : 'bg-[#BBBBBB] hover:bg-[#C4C4C4] text-[#555]'
          }`}
        >
          Ses & Geri Bildirim
        </button>

        <button
          onClick={() => {
            macSound.playMacClickUp();
            setActiveTab('about');
          }}
          className={`px-3 py-1 text-[11px] rounded-t-[3px] border-t border-l border-r border-[#262626] transition-none ${
            activeTab === 'about'
              ? 'bg-[#CCCCCC] font-bold shadow-[inset_0_1px_0_#FFFFFF]'
              : 'bg-[#BBBBBB] hover:bg-[#C4C4C4] text-[#555]'
          }`}
        >
          Sistem Hakkında
        </button>
      </div>

      {/* Sekme İçerikleri */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* ================= TAB 1: WALLPAPERS ================= */}
        {activeTab === 'wallpapers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[12px]">Kullanılabilir Masaüstü Desenleri (Figma Kit)</span>
              <span className="text-[11px] text-[#666]">Masaüstü için bir desen seçin ve &quot;Uygula&quot;ya tıklayın.</span>
            </div>

            {/* Duvar Kağıdı Izgarası */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {WALLPAPERS.map((wp) => {
                const isSelected = selectedTemp === wp.id;
                const isCurrent = currentWallpaper === wp.id;
                return (
                  <div
                    key={wp.id}
                    onClick={() => {
                      macSound.playMacClickDown();
                      setSelectedTemp(wp.id);
                      onSelectWallpaper(wp.id);
                    }}
                    className={`p-2 rounded border cursor-pointer flex gap-3 items-center transition-all ${
                      isSelected
                        ? 'border-[#000080] bg-[#DDDDFF] shadow-[0_0_0_1px_#000080]'
                        : 'border-[#808080] bg-[#DDDDDD] hover:bg-[#E5E5E5]'
                    }`}
                  >
                    {/* Önizleme Minyatürü */}
                    <div
                      className={`w-20 h-14 rounded border border-[#262626] shadow-inner shrink-0 ${wp.previewClass}`}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[12px] truncate">{wp.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-[#008800] text-white px-1.5 py-0.2 rounded font-mono font-bold">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#555] line-clamp-2 mt-0.5 leading-snug">
                        {wp.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Alt Butonlar */}
            <div className="pt-3 border-t border-[#808080] flex items-center justify-end gap-2">
              <button
                onClick={handleApply}
                className="mac9-btn mac9-btn-default px-5 py-1 text-[12px]"
              >
                Masaüstüne Uygula
              </button>
              {onClose && (
                <button onClick={onClose} className="mac9-btn px-4 py-1 text-[12px]">
                  Kapat
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: RETRO SOUNDS ================= */}
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

        {/* ================= TAB 3: ABOUT ================= */}
        {activeTab === 'about' && (
          <div className="space-y-3">
            <div className="flex items-center gap-4 bg-[#DDDDDD] p-3 border border-[#808080] rounded">
              <div className="w-12 h-12 relative shrink-0">
                <img src="/retro/happy-mac.png" alt="Happy Mac" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-[14px]">Nova System OS 9.2.2 (Platinum Sonata)</h3>
                <p className="text-[11px] text-[#555]">
                  Modern Spring Boot 4.1.1, Java 22 Loom ve Next.js 15 altyapısının Mac OS 9 tasarım diliyle birleşimi.
                </p>
              </div>
            </div>

            <div className="mac9-inset-box p-3 font-mono text-[11px] space-y-1 bg-white">
              <div className="flex justify-between border-b border-[#EEE] pb-1">
                <span className="text-[#666]">Bellek & Çekirdek:</span>
                <span className="font-bold">Java 22 Loom V-Threads (10.000 Havuz)</span>
              </div>
              <div className="flex justify-between border-b border-[#EEE] pb-1">
                <span className="text-[#666]">Vektör Uzayı:</span>
                <span className="font-bold">PostgreSQL pgvector 128D</span>
              </div>
              <div className="flex justify-between border-b border-[#EEE] pb-1">
                <span className="text-[#666]">Tasarım Kiti:</span>
                <span className="font-bold">Mac OS 9 UI Kit Community (Figma)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">Gecikme (P99):</span>
                <span className="font-bold text-emerald-700">Sub-ms P99 Latency</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
