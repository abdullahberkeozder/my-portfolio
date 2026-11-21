'use client';

import React, { useState, useEffect } from 'react';
import { MacOs9MenuBar } from './MacOs9MenuBar';
import { DesktopIcon, DesktopIconType } from './DesktopIcon';
import { MacOs9Window } from './MacOs9Window';
import { NovaEmblemWatermark } from './NovaEmblemWatermark';
import { macSound } from '@/lib/retroAudioMac9';

interface MacOs9DesktopProps {
  children?: React.ReactNode; // Optional slot for the existing blog content inside the Blog window!
  blogContent?: React.ReactNode;
  newsContent?: React.ReactNode;
}

interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  zIndex: number;
}

export const MacOs9Desktop: React.FC<MacOs9DesktopProps> = ({
  blogContent,
  newsContent,
}) => {
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState<number>(100);

  // Window states
  const [windows, setWindows] = useState<Record<string, WindowState>>({
    blog: { id: 'blog', title: 'Nova Blog — Modern Mühendislik & Sistem Mimarisi', isOpen: false, zIndex: 10 },
    news: { id: 'news', title: 'Nova News — Teknoloji & Yapay Zeka Bülteni', isOpen: false, zIndex: 10 },
    about: { id: 'about', title: 'About Nova OS 9.2.2', isOpen: false, zIndex: 10 },
    trash: { id: 'trash', title: 'Trash (Çöp Sepeti)', isOpen: false, zIndex: 10 },
  });

  // Startup chime on first user click if not already played
  useEffect(() => {
    const handleFirstClick = () => {
      macSound.playMacStartupChime();
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick, { once: true });
    return () => window.removeEventListener('click', handleFirstClick);
  }, []);

  const bringToFront = (id: string) => {
    const newZ = maxZIndex + 1;
    setMaxZIndex(newZ);
    setActiveWindowId(id);
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], zIndex: newZ, isOpen: true },
    }));
  };

  const openWindow = (id: string) => {
    macSound.playWindowOpen();
    bringToFront(id);
  };

  const closeWindow = (id: string) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false },
    }));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const handleDesktopClick = (e: React.MouseEvent) => {
    // Only deselect if clicked directly on the desktop canvas
    if ((e.target as HTMLElement).classList.contains('mac9-wallpaper-canvas')) {
      setSelectedIconId(null);
    }
  };

  return (
    <div
      onClick={handleDesktopClick}
      className="relative w-screen h-screen overflow-hidden mac9-wallpaper-canvas macos9-mode select-none font-['Geneva',sans-serif]"
    >
      {/* 20px Üst Sabit Apple Menü Çubuğu */}
      <MacOs9MenuBar
        onOpenBlog={() => openWindow('blog')}
        onOpenNews={() => openWindow('news')}
        onAbout={() => openWindow('about')}
        onEmptyTrash={() => {
          macSound.playTrashCrinkle();
          alert('Trash has been emptied.');
        }}
        onRestart={() => {
          macSound.playMacStartupChime();
        }}
        activeAppTitle={activeWindowId ? windows[activeWindowId]?.title.split('—')[0].trim() : 'Finder'}
      />

      {/* Masaüstü Merkezinde Sakin ve Zarif Nova UI Amblemi (Sıfır Bilişsel Yük) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <NovaEmblemWatermark />
      </div>

      {/* Masaüstü İkonları (Figma'daki gibi Ekranın Sağ Tarafında Hizalı) */}
      <div className="absolute top-[32px] right-4 flex flex-col gap-6 z-10">
        {/* Macintosh HD */}
        <DesktopIcon
          id="harddrive"
          type="harddrive"
          title="Macintosh HD"
          isSelected={selectedIconId === 'harddrive'}
          onSelect={(id) => setSelectedIconId(id)}
          onOpen={() => openWindow('about')}
        />

        {/* 🌐 Blog İkonu */}
        <DesktopIcon
          id="blog"
          type="blog"
          title="Blog"
          isSelected={selectedIconId === 'blog'}
          onSelect={(id) => setSelectedIconId(id)}
          onOpen={() => openWindow('blog')}
        />

        {/* 📰 News İkonu */}
        <DesktopIcon
          id="news"
          type="news"
          title="News"
          isSelected={selectedIconId === 'news'}
          onSelect={(id) => setSelectedIconId(id)}
          onOpen={() => openWindow('news')}
        />
      </div>

      {/* Sağ Alt Köşe: Çöp Sepeti */}
      <div className="absolute bottom-4 right-4 z-10">
        <DesktopIcon
          id="trash"
          type="trash"
          title="Trash"
          isSelected={selectedIconId === 'trash'}
          onSelect={(id) => setSelectedIconId(id)}
          onOpen={() => {
            macSound.playTrashCrinkle();
            openWindow('trash');
          }}
        />
      </div>

      {/* =========================================================================
          PENCERELER (Windows)
          ========================================================================= */}

      {/* 1. Blog İnternet Sayfası Penceresi */}
      <MacOs9Window
        id="blog"
        title="Nova Blog — Modern Mühendislik & Sistem Mimarisi"
        isOpen={windows.blog.isOpen}
        onClose={() => closeWindow('blog')}
        zIndex={windows.blog.zIndex}
        onFocus={() => bringToFront('blog')}
        isActive={activeWindowId === 'blog'}
        subtitle="http://novablog.internal/articles"
        initialPosition={{ x: 60, y: 38 }}
        initialSize={{
          width: Math.min(1080, typeof window !== 'undefined' ? window.innerWidth - 120 : 960),
          height: Math.min(720, typeof window !== 'undefined' ? window.innerHeight - 80 : 640),
        }}
      >
        <div className="p-4 bg-[#F8F9FA] min-h-full">
          {blogContent ? (
            blogContent
          ) : (
            <div className="p-8 text-center text-gray-700">
              <h2 className="text-xl font-bold font-['Charcoal',sans-serif] mb-2">Nova Blog İnternet Sayfası</h2>
              <p className="text-sm">Makaleler ve blog içeriği burada yüklenecektir.</p>
            </div>
          )}
        </div>
      </MacOs9Window>

      {/* 2. News İnternet Sayfası Penceresi */}
      <MacOs9Window
        id="news"
        title="Nova News — Teknoloji & Yapay Zeka Haber Bülteni"
        isOpen={windows.news.isOpen}
        onClose={() => closeWindow('news')}
        zIndex={windows.news.zIndex}
        onFocus={() => bringToFront('news')}
        isActive={activeWindowId === 'news'}
        subtitle="http://novablog.internal/news-bulletin"
        initialPosition={{ x: 120, y: 70 }}
        initialSize={{
          width: Math.min(840, typeof window !== 'undefined' ? window.innerWidth - 160 : 800),
          height: Math.min(600, typeof window !== 'undefined' ? window.innerHeight - 120 : 540),
        }}
      >
        <div className="p-6 bg-[#FFFFFF] min-h-full">
          {newsContent ? (
            newsContent
          ) : (
            <div className="space-y-4">
              <div className="border-b border-[#CCCCCC] pb-3">
                <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Flaş Haber
                </span>
                <h3 className="text-base font-bold font-['Charcoal',sans-serif] mt-1 text-[#262626]">
                  React 19 Kararlı Sürüm: useActionState ve useOptimistic Duyuruldu
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Meta React çekirdek ekibi, React 19'un genel kullanıma hazır kararlı sürümünü duyurdu.
                </p>
                <div className="mt-2 text-[10px] text-gray-500 font-mono">via React Dev Blog · 19 Kas 2026</div>
              </div>

              <div className="border-b border-[#CCCCCC] pb-3">
                <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Flaş Haber
                </span>
                <h3 className="text-base font-bold font-['Charcoal',sans-serif] mt-1 text-[#262626]">
                  Anthropic Model Context Protocol (MCP) Açık Kaynak Standardı
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Anthropic, yapay zeka ajanları ile veri kaynakları arasında evrensel bağlantı protokolünü açık kaynaklaştırdı.
                </p>
                <div className="mt-2 text-[10px] text-gray-500 font-mono">via Anthropic Engineering · 20 Kas 2026</div>
              </div>
            </div>
          )}
        </div>
      </MacOs9Window>

      {/* 3. About This Computer Diyaloğu */}
      <MacOs9Window
        id="about"
        title="About Nova OS 9.2.2"
        isOpen={windows.about.isOpen}
        onClose={() => closeWindow('about')}
        zIndex={windows.about.zIndex}
        onFocus={() => bringToFront('about')}
        isActive={activeWindowId === 'about'}
        initialPosition={{ x: 180, y: 100 }}
        initialSize={{ width: 440, height: 260 }}
      >
        <div className="p-4 bg-[#DDDDDD] h-full flex flex-col justify-between text-[#262626]">
          <div className="flex items-center gap-4 border-b border-[#808080] pb-3">
            <div className="w-12 h-12 bg-white border border-[#262626] rounded flex items-center justify-center shadow-inner">
              <span className="text-2xl">🖥️</span>
            </div>
            <div>
              <h2 className="text-sm font-bold font-['Charcoal',sans-serif]">Mac OS 9.2.2 (Nova Web Edition)</h2>
              <p className="text-[11px] text-[#555555]">Built-in Memory: 256 MB</p>
              <p className="text-[11px] text-[#555555]">Processor: PowerPC G4 @ 500 MHz</p>
            </div>
          </div>

          <div className="space-y-1.5 my-2">
            <div className="text-[11px] flex justify-between font-mono">
              <span>Mac OS 9.2:</span>
              <span>32.4 MB</span>
            </div>
            <div className="w-full h-2.5 bg-white border border-[#808080] rounded-sm overflow-hidden">
              <div className="w-1/3 h-full bg-[#6666CC]" />
            </div>
            <div className="text-[11px] flex justify-between font-mono">
              <span>Nova Web Engine:</span>
              <span>18.6 MB</span>
            </div>
            <div className="w-full h-2.5 bg-white border border-[#808080] rounded-sm overflow-hidden">
              <div className="w-1/5 h-full bg-[#339966]" />
            </div>
          </div>

          <div className="text-center pt-2 border-t border-[#808080]">
            <button
              onClick={() => closeWindow('about')}
              className="mac9-btn px-6 py-1"
            >
              OK
            </button>
          </div>
        </div>
      </MacOs9Window>

      {/* 4. Çöp Kutusu Diyaloğu */}
      <MacOs9Window
        id="trash"
        title="Trash"
        isOpen={windows.trash.isOpen}
        onClose={() => closeWindow('trash')}
        zIndex={windows.trash.zIndex}
        onFocus={() => bringToFront('trash')}
        isActive={activeWindowId === 'trash'}
        initialPosition={{ x: 220, y: 150 }}
        initialSize={{ width: 380, height: 200 }}
      >
        <div className="p-4 bg-[#DDDDDD] h-full flex flex-col justify-between text-center">
          <p className="text-sm font-['Charcoal',sans-serif] text-[#262626]">
            The Trash is currently empty.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => closeWindow('trash')}
              className="mac9-btn px-6 py-1"
            >
              Close
            </button>
          </div>
        </div>
      </MacOs9Window>
    </div>
  );
};
