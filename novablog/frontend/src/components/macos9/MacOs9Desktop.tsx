'use client';

import React, { useState, useEffect } from 'react';
import { MacOs9MenuBar } from './MacOs9MenuBar';
import { DesktopIcon } from './DesktopIcon';
import { MacOs9Window } from './MacOs9Window';
import { NovaEmblemWatermark } from './NovaEmblemWatermark';
import { MacBootSequence } from './MacBootSequence';
import { MacAppearancePanel, WallpaperTheme } from './MacAppearancePanel';
import { MacOs9ControlStrip } from './MacOs9ControlStrip';
import { NovaNewsWindow } from './NovaNewsWindow';
import { macSound } from '@/lib/retroAudioMac9';

interface MacOs9DesktopProps {
  children?: React.ReactNode;
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
}) => {
  const [isBooting, setIsBooting] = useState<boolean>(true);
  const [forceRestart, setForceRestart] = useState<boolean>(false);
  const [currentWallpaper, setCurrentWallpaper] = useState<WallpaperTheme>('sonata-purple');
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState<number>(100);

  // Window states
  const [windows, setWindows] = useState<Record<string, WindowState>>({
    blog: { id: 'blog', title: 'Nova Blog — Modern Mühendislik & Sistem Mimarisi', isOpen: false, zIndex: 10 },
    news: { id: 'news', title: 'Sherlock 2 — Nova Haberler & Flaş Gelişmeler', isOpen: false, zIndex: 10 },
    about: { id: 'about', title: 'Görünüm & Sistem Bilgisi (Appearance)', isOpen: false, zIndex: 10 },
    trash: { id: 'trash', title: 'Trash (Çöp Sepeti)', isOpen: false, zIndex: 10 },
  });

  // Load saved wallpaper from localStorage
  useEffect(() => {
    try {
      const savedWp = localStorage.getItem('novablog_macos9_wallpaper') as WallpaperTheme | null;
      if (savedWp) {
        setCurrentWallpaper(savedWp);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSelectWallpaper = (theme: WallpaperTheme) => {
    setCurrentWallpaper(theme);
    try {
      localStorage.setItem('novablog_macos9_wallpaper', theme);
    } catch {
      // ignore
    }
  };

  const handleRestart = () => {
    try {
      sessionStorage.removeItem('macos9_booted');
    } catch {
      // ignore
    }
    setForceRestart(true);
    setIsBooting(true);
  };

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
      className={`relative w-screen h-screen overflow-hidden mac9-wallpaper-canvas mac9-wallpaper-${currentWallpaper} macos9-mode select-none font-['Geneva',sans-serif]`}
    >
      {/* ================= 1. MAC BOOT LOADER & STARTUP EXPERIENCE ================= */}
      {isBooting && (
        <MacBootSequence
          forceRestart={forceRestart}
          onComplete={() => {
            setIsBooting(false);
            setForceRestart(false);
          }}
        />
      )}

      {/* ================= 2. 20PX ÜST SABİT APPLE MENÜ ÇUBUĞU ================= */}
      <MacOs9MenuBar
        onOpenBlog={() => openWindow('blog')}
        onOpenNews={() => openWindow('news')}
        onAbout={() => openWindow('about')}
        onEmptyTrash={() => {
          macSound.playTrashCrinkle();
          alert('Trash has been emptied.');
        }}
        onRestart={handleRestart}
        activeAppTitle={activeWindowId ? windows[activeWindowId]?.title.split('—')[0].trim() : 'Finder'}
      />

      {/* ================= 3. SAKİN VE ZARİF NOVA UI LOGO AMBLEMİ (SIFIR BİLİŞSEL YÜK) ================= */}
      {!isBooting && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-fade-in">
          <NovaEmblemWatermark />
        </div>
      )}

      {/* ================= 4. MASAÜSTÜ İKONLARI (FIGMA KİT SAĞ HİZALAMA) ================= */}
      <div className="absolute top-[32px] right-4 flex flex-col gap-6 z-10">
        {/* Macintosh HD (Açar: Görünüm & Sistem Bilgisi) */}
        <DesktopIcon
          id="harddrive"
          type="harddrive"
          title="Macintosh HD"
          isSelected={selectedIconId === 'harddrive'}
          onSelect={(id) => setSelectedIconId(id)}
          onOpen={() => openWindow('about')}
        />

        {/* 🌐 Blog İkonu (Açar: Tam Blog İnternet Sayfası) */}
        <DesktopIcon
          id="blog"
          type="blog"
          title="Blog"
          isSelected={selectedIconId === 'blog'}
          onSelect={(id) => setSelectedIconId(id)}
          onOpen={() => openWindow('blog')}
        />

        {/* 📰 News İkonu (Açar: Sherlock 2 Haber Bülteni) */}
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

      {/* ================= 5. GERİ ÇEKİLEBİLİR CONTROL STRIP (FIGMA BUILDING BLOCK) ================= */}
      <MacOs9ControlStrip
        currentWallpaper={currentWallpaper}
        onSelectWallpaper={handleSelectWallpaper}
        onOpenWindow={openWindow}
        onRestart={handleRestart}
      />

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

      {/* 2. News İnternet Sayfası Penceresi (Sherlock 2 Motoru) */}
      <MacOs9Window
        id="news"
        title="Sherlock 2 — Nova Haberler & Flaş Gelişmeler"
        isOpen={windows.news.isOpen}
        onClose={() => closeWindow('news')}
        zIndex={windows.news.zIndex}
        onFocus={() => bringToFront('news')}
        isActive={activeWindowId === 'news'}
        subtitle="sherlock://channels/nova-engineering-news"
        initialPosition={{ x: 120, y: 60 }}
        initialSize={{
          width: Math.min(840, typeof window !== 'undefined' ? window.innerWidth - 160 : 800),
          height: Math.min(620, typeof window !== 'undefined' ? window.innerHeight - 100 : 560),
        }}
      >
        <NovaNewsWindow
          onOpenArticleInBlog={() => {
            openWindow('blog');
          }}
        />
      </MacOs9Window>

      {/* 3. Görünüm & Sistem Bilgisi (Appearance Control Panel) */}
      <MacOs9Window
        id="about"
        title="Görünüm & Sistem Bilgisi (Appearance Control Panel)"
        isOpen={windows.about.isOpen}
        onClose={() => closeWindow('about')}
        zIndex={windows.about.zIndex}
        onFocus={() => bringToFront('about')}
        isActive={activeWindowId === 'about'}
        initialPosition={{ x: 160, y: 70 }}
        initialSize={{ width: 560, height: 420 }}
      >
        <MacAppearancePanel
          currentWallpaper={currentWallpaper}
          onSelectWallpaper={handleSelectWallpaper}
          onClose={() => closeWindow('about')}
        />
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
        <div className="p-4 bg-[#DDDDDD] h-full flex flex-col justify-between text-center font-['Charcoal',sans-serif]">
          <div className="flex flex-col items-center justify-center my-auto">
            <span className="text-3xl mb-2">🗑️</span>
            <p className="text-sm font-bold text-[#262626]">
              Çöp Sepeti Boş
            </p>
            <p className="text-[11px] text-[#555] mt-1">
              Silinecek veya çöpe atılacak dosya bulunmuyor.
            </p>
          </div>
          <div className="flex justify-center pt-2 border-t border-[#808080]">
            <button
              onClick={() => closeWindow('trash')}
              className="mac9-btn px-6 py-1"
            >
              Tamam
            </button>
          </div>
        </div>
      </MacOs9Window>
    </div>
  );
};
