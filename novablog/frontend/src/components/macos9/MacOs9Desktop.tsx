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
import { NovaApplicationsFolder } from './apps/NovaApplicationsFolder';
import { MacCalculator } from './apps/MacCalculator';
import { MacStickies } from './apps/MacStickies';
import { MacFmRadio } from './apps/MacFmRadio';
import { NovaWebBrowser } from './apps/NovaWebBrowser';
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
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState<number>(100);

  // Window states
  const [windows, setWindows] = useState<Record<string, WindowState>>({
    blog: { id: 'blog', title: 'Nova Blog — Modern Engineering & System Architecture', isOpen: false, zIndex: 10 },
    news: { id: 'news', title: 'Sherlock 2 — Nova News & Bulletins', isOpen: false, zIndex: 10 },
    browser: { id: 'browser', title: 'Internet Explorer — Web Browser', isOpen: false, zIndex: 10 },
    about: { id: 'about', title: 'Appearance Control Panel', isOpen: false, zIndex: 10 },
    applications: { id: 'applications', title: 'Applications — Mac OS 9.2.2', isOpen: false, zIndex: 10 },
    calculator: { id: 'calculator', title: 'Calculator', isOpen: false, zIndex: 10 },
    stickies: { id: 'stickies', title: 'Stickies', isOpen: false, zIndex: 10 },
    radio: { id: 'radio', title: 'Apple FM Stereo Radio', isOpen: false, zIndex: 10 },
    trash: { id: 'trash', title: 'Trash', isOpen: false, zIndex: 10 },
  });

  // Load saved wallpaper and theme from localStorage
  useEffect(() => {
    try {
      const savedWp = localStorage.getItem('novablog_macos9_wallpaper') as WallpaperTheme | null;
      if (savedWp) {
        setCurrentWallpaper(savedWp);
      }
      const savedTheme = localStorage.getItem('novablog_theme');
      if (savedTheme === 'dark') {
        setIsNightMode(true);
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

  const handleToggleNightMode = () => {
    const nextNight = !isNightMode;
    setIsNightMode(nextNight);
    macSound.playDroplet();

    if (nextNight) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      handleSelectWallpaper('dark-carbon');
      try {
        localStorage.setItem('novablog_theme', 'dark');
      } catch {}
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      handleSelectWallpaper('sonata-purple');
      try {
        localStorage.setItem('novablog_theme', 'light');
      } catch {}
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

      {/* ================= 2. 20PX TOP FIXED APPLE MENU BAR ================= */}
      <MacOs9MenuBar
        onOpenBlog={() => openWindow('blog')}
        onOpenNews={() => openWindow('news')}
        onOpenBrowser={() => openWindow('browser')}
        onOpenCalculator={() => openWindow('calculator')}
        onOpenStickies={() => openWindow('stickies')}
        onOpenAppearance={() => openWindow('about')}
        onToggleTheme={handleToggleNightMode}
        isNightMode={isNightMode}
        onEmptyTrash={() => {
          macSound.playTrashCrinkle();
          alert('Trash has been emptied.');
        }}
        onRestart={handleRestart}
        activeAppTitle={activeWindowId ? windows[activeWindowId]?.title.split('—')[0].trim() : 'Finder'}
      />

      {/* ================= 3. ELEGANT NOVA UI LOGO EMBLEM (G4 CUBE LUCITE SUITE) ================= */}
      {!isBooting && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1] animate-fade-in">
          <NovaEmblemWatermark
            hasOpenWindows={Object.values(windows).some((w) => w.isOpen)}
            wallpaper={currentWallpaper}
            isNightMode={isNightMode}
            onOpenAppearance={() => openWindow('about')}
          />
        </div>
      )}

      {/* ================= 4. DESKTOP ICONS (FIGMA KIT RIGHT-ALIGNED) ================= */}
      <div className="absolute top-[32px] right-4 flex flex-col gap-5 z-10">
        {/* 1. Macintosh HD (Opens: Applications) */}
        <DesktopIcon
          id="harddrive"
          type="harddrive"
          title="Macintosh HD"
          isSelected={selectedIconId === 'harddrive'}
          onSelect={(id) => setSelectedIconId(id)}
          onOpen={() => openWindow('applications')}
        />

        {/* 2. Applications Folder (Figma 71:116881) */}
        <DesktopIcon
          id="applications"
          type="applications"
          title="Applications"
          isSelected={selectedIconId === 'applications'}
          onSelect={(id) => setSelectedIconId(id)}
          onOpen={() => openWindow('applications')}
        />

        {/* 3. Browse the Internet (Opens: Internet Explorer / Google Web) */}
        <DesktopIcon
          id="browser"
          type="internet"
          title="Browse the Internet"
          isSelected={selectedIconId === 'browser'}
          onSelect={(id) => setSelectedIconId(id)}
          onOpen={() => openWindow('browser')}
        />

        {/* 4. News Icon (Opens: Sherlock 2 News Bulletin) */}
        <DesktopIcon
          id="news"
          type="news"
          title="News"
          isSelected={selectedIconId === 'news'}
          onSelect={(id) => setSelectedIconId(id)}
          onOpen={() => openWindow('news')}
        />
      </div>

      {/* Bottom Right Corner: Trash */}
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

      {/* ================= 6. RETRACTABLE CONTROL STRIP (FIGMA BUILDING BLOCK) ================= */}
      <MacOs9ControlStrip
        currentWallpaper={currentWallpaper}
        onSelectWallpaper={handleSelectWallpaper}
        onOpenWindow={openWindow}
        onRestart={handleRestart}
      />

      {/* =========================================================================
          WINDOWS
          ========================================================================= */}

      {/* 1. Applications Folder Window (Figma UI Kit Application Suite) */}
      <MacOs9Window
        id="applications"
        title="Applications — Mac OS 9.2.2"
        isOpen={windows.applications.isOpen}
        onClose={() => closeWindow('applications')}
        zIndex={windows.applications.zIndex}
        onFocus={() => bringToFront('applications')}
        isActive={activeWindowId === 'applications'}
        subtitle="finder://Macintosh_HD/Applications"
        initialPosition={{ x: 140, y: 60 }}
        initialSize={{ width: 560, height: 380 }}
      >
        <NovaApplicationsFolder
          onLaunchCalculator={() => openWindow('calculator')}
          onLaunchStickies={() => openWindow('stickies')}
          onLaunchRadio={() => openWindow('radio')}
          onLaunchBlog={() => openWindow('blog')}
          onLaunchNews={() => openWindow('news')}
          onLaunchAppearance={() => openWindow('about')}
          onLaunchBrowser={() => openWindow('browser')}
        />
      </MacOs9Window>

      {/* 2. Web Browser / Internet Explorer (Google and Live Web Search) */}
      <MacOs9Window
        id="browser"
        title="Internet Explorer — Web Browser"
        isOpen={windows.browser?.isOpen ?? false}
        onClose={() => closeWindow('browser')}
        zIndex={windows.browser?.zIndex ?? 10}
        onFocus={() => bringToFront('browser')}
        isActive={activeWindowId === 'browser'}
        subtitle="https://www.google.com"
        initialPosition={{ x: 100, y: 35 }}
        initialSize={{
          width: Math.min(1020, typeof window !== 'undefined' ? window.innerWidth - 80 : 960),
          height: Math.min(680, typeof window !== 'undefined' ? window.innerHeight - 70 : 620),
        }}
      >
        <NovaWebBrowser
          onOpenBlog={() => openWindow('blog')}
        />
      </MacOs9Window>

      {/* 3. Calculator (Calculator Application) */}
      <MacOs9Window
        id="calculator"
        title="Calculator"
        isOpen={windows.calculator.isOpen}
        onClose={() => closeWindow('calculator')}
        zIndex={windows.calculator.zIndex}
        onFocus={() => bringToFront('calculator')}
        isActive={activeWindowId === 'calculator'}
        initialPosition={{ x: 220, y: 100 }}
        initialSize={{ width: 220, height: 280 }}
      >
        <MacCalculator />
      </MacOs9Window>

      {/* 4. Stickies (Sticky Notes Application) */}
      <MacOs9Window
        id="stickies"
        title="Stickies"
        isOpen={windows.stickies.isOpen}
        onClose={() => closeWindow('stickies')}
        zIndex={windows.stickies.zIndex}
        onFocus={() => bringToFront('stickies')}
        isActive={activeWindowId === 'stickies'}
        initialPosition={{ x: 280, y: 130 }}
        initialSize={{ width: 280, height: 240 }}
      >
        <MacStickies />
      </MacOs9Window>

      {/* 5. Apple FM Radio (Stereo Radio Application) */}
      <MacOs9Window
        id="radio"
        title="Apple FM Stereo Radio"
        isOpen={windows.radio.isOpen}
        onClose={() => closeWindow('radio')}
        zIndex={windows.radio.zIndex}
        onFocus={() => bringToFront('radio')}
        isActive={activeWindowId === 'radio'}
        initialPosition={{ x: 320, y: 90 }}
        initialSize={{ width: 360, height: 240 }}
      >
        <MacFmRadio />
      </MacOs9Window>

      {/* 5. Blog Web Window */}
      <MacOs9Window
        id="blog"
        title="Nova Blog — Modern Engineering & System Architecture"
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
              <h2 className="text-xl font-bold font-['Charcoal',sans-serif] mb-2">Nova Blog Web Portal</h2>
              <p className="text-sm">Articles and engineering publications will load here.</p>
            </div>
          )}
        </div>
      </MacOs9Window>

      {/* 6. News Window (Sherlock 2 Engine) */}
      <MacOs9Window
        id="news"
        title="Sherlock 2 — Nova News & Bulletins"
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

      {/* 7. Appearance & System Settings (Appearance Control Panel) */}
      <MacOs9Window
        id="about"
        title="Appearance Control Panel"
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

      {/* 8. Trash Dialog */}
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
              The Trash is empty.
            </p>
            <p className="text-[11px] text-[#555] mt-1">
              There are no deleted files or items in Trash.
            </p>
          </div>
          <div className="flex justify-center pt-2 border-t border-[#808080]">
            <button
              onClick={() => closeWindow('trash')}
              className="mac9-btn px-6 py-1"
            >
              OK
            </button>
          </div>
        </div>
      </MacOs9Window>
    </div>
  );
};
