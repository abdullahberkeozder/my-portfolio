'use client';

import React, { useState, useRef, useEffect } from 'react';
import { macSound } from '@/lib/retroAudioMac9';
import { WallpaperTheme } from './MacAppearancePanel';

interface MacOs9ControlStripProps {
  currentWallpaper: WallpaperTheme;
  onSelectWallpaper: (theme: WallpaperTheme) => void;
  onOpenWindow: (id: string) => void;
  onRestart: () => void;
}

export const MacOs9ControlStrip: React.FC<MacOs9ControlStripProps> = ({
  currentWallpaper,
  onSelectWallpaper,
  onOpenWindow,
  onRestart,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [activeModule, setActiveModule] = useState<'sound' | 'display' | 'status' | null>(null);
  const [volume, setVolume] = useState<number>(macSound.getVolume());
  const [isMuted, setIsMuted] = useState<boolean>(macSound.getIsMuted());
  const stripRef = useRef<HTMLDivElement>(null);

  // Close open popovers when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (stripRef.current && !stripRef.current.contains(e.target as Node)) {
        setActiveModule(null);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleToggleTab = () => {
    macSound.playMacClickDown();
    setIsCollapsed((prev) => !prev);
    setActiveModule(null);
  };

  const toggleModule = (module: 'sound' | 'display' | 'status') => {
    macSound.playMacClickDown();
    setActiveModule((prev) => (prev === module ? null : module));
  };

  const handleVolumeChange = (newVol: number) => {
    macSound.setVolume(newVol);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    macSound.playDroplet();
  };

  const handleToggleMute = () => {
    const muted = macSound.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      macSound.playDroplet();
    }
  };

  return (
    <div
      ref={stripRef}
      className="fixed bottom-0 left-4 z-40 select-none font-['Charcoal',sans-serif] text-[11px] text-[#262626]"
    >
      <div className="flex items-center">
        {/* Retractable Grip Handle (:::◀ / :::▶) */}
        <button
          onClick={handleToggleTab}
          title={isCollapsed ? 'Control Strip’i Genişlet' : 'Control Strip’i Daralt'}
          className="h-[26px] px-1.5 mac9-control-strip flex items-center justify-center border border-[#262626] rounded-tl rounded-bl hover:bg-[#CCCCCC] cursor-pointer shadow-md"
        >
          <span className="font-mono text-[9px] tracking-tighter text-[#444]">
            {isCollapsed ? ':::▶' : ':::◀'}
          </span>
        </button>

        {/* Expanded Strip Modules */}
        {!isCollapsed && (
          <div className="h-[26px] mac9-control-strip flex items-center border-t border-b border-r border-[#262626] rounded-tr shadow-md">
            
            {/* 1. Ses Modülü (Volume Control) */}
            <div className="relative h-full flex items-center">
              <button
                onClick={() => toggleModule('sound')}
                className={`h-full px-2.5 flex items-center gap-1 mac9-control-strip-btn hover:bg-[#E0E0E0] ${
                  activeModule === 'sound' ? 'bg-[#333399] text-white' : ''
                }`}
                title="Ses Düzeyi & Mute"
              >
                <span>{isMuted || volume === 0 ? '🔇' : '🔊'}</span>
                <span className="font-mono text-[10px]">{volume}</span>
              </button>

              {/* Ses Popover */}
              {activeModule === 'sound' && (
                <div className="absolute bottom-[28px] left-0 w-44 bg-[#DDDDDD] border border-[#262626] shadow-[2px_2px_8px_rgba(0,0,0,0.35)] p-2 z-50 rounded-[2px]">
                  <div className="flex items-center justify-between font-bold mb-1.5 pb-1 border-b border-[#999]">
                    <span>Hoparlör Düzeyi</span>
                    <button
                      onClick={handleToggleMute}
                      className="text-[10px] mac9-btn px-1.5 py-0.5"
                    >
                      {isMuted ? 'Aç' : 'Mute'}
                    </button>
                  </div>
                  <div className="flex items-center gap-1 justify-between py-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => handleVolumeChange(lvl)}
                        className={`w-4 h-6 text-[10px] font-mono flex items-center justify-center border border-[#262626] ${
                          volume === lvl
                            ? 'bg-[#333399] text-white font-bold'
                            : 'bg-white hover:bg-[#EEE] text-black'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Ekran / Duvar Kağıdı Modülü (Display / Wallpaper) */}
            <div className="relative h-full flex items-center">
              <button
                onClick={() => toggleModule('display')}
                className={`h-full px-2.5 flex items-center gap-1 mac9-control-strip-btn hover:bg-[#E0E0E0] ${
                  activeModule === 'display' ? 'bg-[#333399] text-white' : ''
                }`}
                title="Masaüstü Deseni / Wallpaper"
              >
                <span>🖥️</span>
                <span className="hidden sm:inline text-[10px]">Desen</span>
              </button>

              {/* Wallpaper Quick Switcher Popover */}
              {activeModule === 'display' && (
                <div className="absolute bottom-[28px] left-0 w-52 bg-[#DDDDDD] border border-[#262626] shadow-[2px_2px_8px_rgba(0,0,0,0.35)] p-2 z-50 rounded-[2px] space-y-1">
                  <div className="font-bold pb-1 border-b border-[#999] mb-1">
                    Masaüstü Deseni
                  </div>
                  {[
                    { id: 'quantum-foam' as WallpaperTheme, name: 'Quantum Foam', thumb: 'quantum-foam.png' },
                    { id: 'sonata-purple' as WallpaperTheme, name: 'Default Wallpaper', thumb: 'default-wallpaper.png' },
                    { id: 'macos-bg' as WallpaperTheme, name: 'macOS Background', thumb: 'macos-bg.png' },
                    { id: 'blue-dalmatian' as WallpaperTheme, name: 'Blue Dalmatian', thumb: 'blue-dalmatian.png' },
                    { id: 'capsules' as WallpaperTheme, name: 'Capsules', thumb: 'capsules.png' },
                    { id: 'tub' as WallpaperTheme, name: 'Tub', thumb: 'tub.png' },
                    { id: 'heavy-petal' as WallpaperTheme, name: 'Heavy Petal', thumb: 'heavy-petal.png' },
                    { id: 'indigo-foam' as WallpaperTheme, name: 'Indigo Foam', thumb: 'indigo-foam.png' },
                    { id: 'dark-carbon' as WallpaperTheme, name: 'Obsidian Carbon', thumb: 'obsidian-carbon.png' },
                  ].map((wp) => (
                    <button
                      key={wp.id}
                      onClick={() => {
                        macSound.playMacClickDown();
                        onSelectWallpaper(wp.id);
                        setActiveModule(null);
                      }}
                      className={`w-full text-left px-2 py-1 rounded-[2px] flex items-center justify-between text-[11px] ${
                        currentWallpaper === wp.id
                          ? 'bg-[#333399] text-white font-bold'
                          : 'hover:bg-[#CCC] text-[#262626]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <img
                          src={`/retro/wallpapers/${wp.thumb}`}
                          alt=""
                          className="w-4 h-3 object-cover border border-[#808080] rounded-[1px]"
                        />
                        <span className="truncate">{wp.name}</span>
                      </div>
                      {currentWallpaper === wp.id && <span className="font-bold">✓</span>}
                    </button>
                  ))}
                  <div className="pt-1 border-t border-[#999]">
                    <button
                      onClick={() => {
                        onOpenWindow('about');
                        setActiveModule(null);
                      }}
                      className="w-full text-left px-2 py-0.5 text-[10px] text-blue-800 hover:underline font-bold"
                    >
                      Tüm Görünüm Ayarları...
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Nova Mimarisi Durum Modülü (Telemetry) */}
            <div className="relative h-full flex items-center">
              <button
                onClick={() => toggleModule('status')}
                className={`h-full px-2.5 flex items-center gap-1 mac9-control-strip-btn hover:bg-[#E0E0E0] ${
                  activeModule === 'status' ? 'bg-[#333399] text-white' : ''
                }`}
                title="Sistem Telemetrisi"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                <span className="hidden sm:inline font-mono text-[10px]">11.4K rps</span>
              </button>

              {/* Telemetri Popover */}
              {activeModule === 'status' && (
                <div className="absolute bottom-[28px] left-0 w-56 bg-[#DDDDDD] border border-[#262626] shadow-[2px_2px_8px_rgba(0,0,0,0.35)] p-2 z-50 rounded-[2px] space-y-1.5">
                  <div className="font-bold pb-1 border-b border-[#999]">
                    Nova Çekirdek Telemetrisi
                  </div>
                  <div className="mac9-inset-box p-1.5 text-[10px] font-mono space-y-1 bg-white">
                    <div className="flex justify-between">
                      <span className="text-[#666]">Loom V-Threads:</span>
                      <span className="text-emerald-700 font-bold">10,000 Aktif</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666]">PostgreSQL 16:</span>
                      <span className="text-emerald-700 font-bold">pgvector 128D</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666]">Kapasite:</span>
                      <span className="font-bold">11,400+ İstek/sn</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Hızlı Başlatıcılar (Blog, News, Görünüm) */}
            <button
              onClick={() => onOpenWindow('blog')}
              className="h-full px-2 mac9-control-strip-btn hover:bg-[#E0E0E0] text-[11px]"
              title="Blog Penceresini Aç"
            >
              🌐 Blog
            </button>

            <button
              onClick={() => onOpenWindow('news')}
              className="h-full px-2 mac9-control-strip-btn hover:bg-[#E0E0E0] text-[11px]"
              title="Haberler Penceresini Aç"
            >
              📰 News
            </button>

            {/* 5. Yeniden Başlat (Restart) */}
            <button
              onClick={() => {
                macSound.playMacClickDown();
                onRestart();
              }}
              className="h-full px-2 mac9-control-strip-btn hover:bg-[#E0E0E0] text-[11px]"
              title="Sistemi Yeniden Başlat (Reboot Mac OS 9)"
            >
              🔄 Reboot
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
