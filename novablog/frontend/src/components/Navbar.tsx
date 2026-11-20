'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  Cpu,
  Database,
  ArrowRight,
  Layers,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  PenSquare,
  Search,
  ShieldAlert,
  X,
  Zap,
  Compass,
} from 'lucide-react';
import { MacThemeToggle } from './MacThemeToggle';
import { GithubIcon } from './GithubIcon';
import { SpecDirectoryPopover } from './SpecDirectoryPopover';
import { playKeyClick, playTabSelect } from '@/lib/retroAudio';

export type NavTab = 'feed' | 'system' | 'ai-search' | 'admin-batch';

interface NavbarProps {
  activeTab?: NavTab;
  setActiveTab?: (tab: NavTab) => void;
  isBackendOnline?: boolean | null;
  onRefreshHealth?: () => void;
  onOpenTelemetry?: () => void;
  onOpenArchitectureConsole?: () => void;
  onOpenTwoFactor?: () => void;
  onOpenCreateModal?: () => void;
  onFocusSearch?: () => void;
}

type MegaDrawerCategory = 'articles' | 'system' | 'ai' | 'batch' | null;

export const Navbar: React.FC<NavbarProps> = ({
  activeTab = 'feed',
  setActiveTab,
  isBackendOnline = true,
  onRefreshHealth,
  onOpenTelemetry,
  onOpenTwoFactor,
  onOpenCreateModal,
  onFocusSearch,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [megaMenu, setMegaMenu] = useState<MegaDrawerCategory>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const closeMegaMenu = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setMegaMenu(null);
  };

  // Fullscreen toggle for Mac OS X Green Traffic Light
  const toggleFullscreen = () => {
    playKeyClick();
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Reliable navigation across routes and in-page sections (NO hover trap, pure tactile click)
  const handleTabClick = (sectionId: string, targetTab: NavTab) => {
    playTabSelect();
    if (setActiveTab) {
      setActiveTab(targetTab);
    }
    closeMegaMenu();

    const isHome = pathname === '/' || pathname === '';

    if (!isHome) {
      router.push(`/#${sectionId}`);
      return;
    }

    // On home page: signal manual navigation to pause intersection observer flicker
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('manual-tab-navigation-start'));
      window.history.pushState(null, '', `#${sectionId}`);

      if (sectionId === 'articles-feed' && window.scrollY < 400) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const el = document.getElementById(sectionId);
      if (el) {
        const headerOffset = 54;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth',
        });
      }
    }
  };

  const scrollToSection = handleTabClick;

  const navigateToConsoleModule = (moduleId: string) => {
    closeMegaMenu();
    if (setActiveTab) {
      setActiveTab('system');
    }
    const isHome = pathname === '/' || pathname === '';
    if (!isHome) {
      router.push('/#modular-architecture-console');
      return;
    }
    setTimeout(() => {
      const el = document.getElementById('modular-architecture-console');
      if (el) {
        const headerOffset = 54;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: Math.max(0, offsetPosition), behavior: 'smooth' });
      }
      window.dispatchEvent(new CustomEvent('select-console-module', { detail: moduleId }));
    }, 50);
  };

  const handleTestDrive = () => {
    closeMegaMenu();
    if (setActiveTab) {
      setActiveTab('system');
    }
    const isHome = pathname === '/' || pathname === '';
    if (!isHome) {
      router.push('/#modular-architecture-console');
      return;
    }
    setTimeout(() => {
      const el = document.getElementById('modular-architecture-console');
      if (el) {
        const headerOffset = 54;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: Math.max(0, offsetPosition), behavior: 'smooth' });
      }
      window.dispatchEvent(new CustomEvent('select-console-module', { detail: 'loom' }));
      window.dispatchEvent(new CustomEvent('run-console-simulation'));
    }, 50);
  };

  const TAB_ORDER: NavTab[] = ['feed', 'system', 'ai-search', 'admin-batch'];

  const handlePrevTab = () => {
    playKeyClick();
    const currentIndex = TAB_ORDER.indexOf(activeTab || 'feed');
    const prevIndex = (currentIndex - 1 + TAB_ORDER.length) % TAB_ORDER.length;
    const targetTab = TAB_ORDER[prevIndex];
    if (targetTab === 'feed') handleTabClick('articles-feed', targetTab);
    else if (targetTab === 'system') handleTabClick('modular-architecture-console', targetTab);
    else if (targetTab === 'ai-search') handleTabClick('ai-vector-studio', targetTab);
    else if (targetTab === 'admin-batch') handleTabClick('batch-etl-studio', targetTab);
  };

  const handleNextTab = () => {
    playKeyClick();
    const currentIndex = TAB_ORDER.indexOf(activeTab || 'feed');
    const nextIndex = (currentIndex + 1) % TAB_ORDER.length;
    const targetTab = TAB_ORDER[nextIndex];
    if (targetTab === 'feed') handleTabClick('articles-feed', targetTab);
    else if (targetTab === 'system') handleTabClick('modular-architecture-console', targetTab);
    else if (targetTab === 'ai-search') handleTabClick('ai-vector-studio', targetTab);
    else if (targetTab === 'admin-batch') handleTabClick('batch-etl-studio', targetTab);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMegaMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isMegaOpen = megaMenu !== null;

  return (
    <header className="sticky top-0 z-50 select-none shadow-md">
      {/* Subtle backdrop overlay when mega menu is open */}
      {isMegaOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 transition-opacity duration-200 pointer-events-auto"
          onClick={closeMegaMenu}
        />
      )}

      {/* Mac OS X Yosemite / Snow Leopard Single Unified Window Header (44px) */}
      <div className="mac-unified-desktop-header relative z-40">
        <div className="w-full max-w-7xl mx-auto h-[44px] px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Sol Bölge: Trafik Işıkları (🔴 🟡 🟢) + Nav Chevrons [<][>] + NOVA Wordmark */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mac OS X Traffic Lights */}
            <div className="mac-traffic-lights" title="Mac OS X Pencere Yönetimi">
              <button
                type="button"
                onClick={() => {
                  playKeyClick();
                  if (pathname !== '/') {
                    router.push('/');
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="mac-traffic-dot mac-traffic-close focus:outline-none"
                title={pathname !== '/' ? 'Ana Sayfaya Dön' : 'En Başa Kaydır'}
                aria-label="Kapat"
              />
              <button
                type="button"
                onClick={() => {
                  playKeyClick();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="mac-traffic-dot mac-traffic-min focus:outline-none"
                title="Pencereyi Başa Al (Scroll Top)"
                aria-label="Küçült"
              />
              <button
                type="button"
                onClick={toggleFullscreen}
                className="mac-traffic-dot mac-traffic-max focus:outline-none"
                title="Tam Ekrana Geç / Çık (Fullscreen)"
                aria-label="Büyüt"
              />
            </div>

            <div className="h-4 w-[1px] bg-black/15 dark:bg-white/15 hidden sm:block mx-0.5" />

            {/* Finder Nav Chevrons [<] [>] */}
            <div className="mac-nav-chevron-group hidden sm:inline-flex" title="Finder Tarihsel Pencereler Arası Gezinme">
              <button
                type="button"
                onClick={handlePrevTab}
                className="mac-nav-chevron-btn"
                title="Önceki Sekme"
                aria-label="Önceki"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextTab}
                className="mac-nav-chevron-btn"
                title="Sonraki Sekme"
                aria-label="Sonraki"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Brand Logo & Wordmark (Single Source of Truth) */}
            <div
              className="flex items-center gap-1.5 cursor-pointer group py-1"
              onClick={() => {
                closeMegaMenu();
                playKeyClick();
                if (pathname !== '/') {
                  router.push('/');
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  if (setActiveTab) setActiveTab('feed');
                  if (onRefreshHealth) onRefreshHealth();
                }
              }}
              title="Nova Ana Sayfaya Dön"
            >
              <svg
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 shrink-0 text-zinc-900 dark:text-zinc-100 transition-transform group-hover:scale-105 duration-200"
                aria-label="Nova Logo"
              >
                <path
                  d="M20 2C20 11.9411 28.0589 20 38 20C28.0589 20 20 28.0589 20 38C20 28.0589 11.9411 20 2 20C11.9411 20 20 11.9411 20 2Z"
                  fill="currentColor"
                />
                <circle cx="20" cy="20" r="3.6" className="fill-white dark:fill-[#07080a]" />
                <circle
                  cx="20"
                  cy="20"
                  r="1.8"
                  className={isBackendOnline === false ? 'fill-amber-400' : 'fill-emerald-500 dark:fill-[#d4f933]'}
                />
              </svg>

              <span className="font-black text-sm tracking-tight uppercase leading-none text-zinc-900 dark:text-zinc-100 drop-shadow-[0_1px_0_rgba(255,255,255,0.9)] dark:drop-shadow-[0_-1px_0_rgba(0,0,0,0.8)]">
                NOVA
              </span>
            </div>
          </div>

          {/* Orta Bölge: Finder 4-Segmented View Switcher (Ana Görünüm Çıpası - Her Boyutta Tıklanabilir) */}
          <nav
            role="tablist"
            aria-label="Ana Gezinti Sekmeleri"
            className="flex items-center ios-segmented-track !py-0.5 !px-0.5 overflow-x-auto scrollbar-none max-w-full"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'feed'}
              onClick={() => handleTabClick('articles-feed', 'feed')}
              className={`ios-segment-btn !py-1.5 !px-3 sm:!px-4 !text-xs font-bold whitespace-nowrap cursor-pointer leading-normal ${
                activeTab === 'feed' ? 'active' : ''
              }`}
            >
              <span>MAKALELER</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'system'}
              onClick={() => handleTabClick('modular-architecture-console', 'system')}
              className={`ios-segment-btn !py-1.5 !px-3 sm:!px-4 !text-xs font-bold whitespace-nowrap cursor-pointer leading-normal ${
                activeTab === 'system' ? 'active' : ''
              }`}
            >
              <span>ÇEKİRDEK</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'ai-search'}
              onClick={() => handleTabClick('ai-vector-studio', 'ai-search')}
              className={`ios-segment-btn !py-1.5 !px-3 sm:!px-4 !text-xs font-bold whitespace-nowrap cursor-pointer leading-normal ${
                activeTab === 'ai-search' ? 'active' : ''
              }`}
            >
              <span>AI &amp; VEKTÖR</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'admin-batch'}
              onClick={() => handleTabClick('batch-etl-studio', 'admin-batch')}
              className={`ios-segment-btn !py-1.5 !px-3 sm:!px-4 !text-xs font-bold whitespace-nowrap cursor-pointer leading-normal ${
                activeTab === 'admin-batch' ? 'active' : ''
              }`}
            >
              <span>BATCH &amp; ETL</span>
            </button>
          </nav>

          {/* Sağ Bölge: Spotlight Search + Aqua +Yaz + Utility Kümesi (Status, 2FA, Theme, Github, Spec Dizin) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mac Recessed Search Field */}
            {onFocusSearch && (
              <button
                type="button"
                onClick={() => {
                  playKeyClick();
                  onFocusSearch();
                }}
                className="mac-search-field hidden lg:flex items-center gap-1.5 cursor-pointer select-none text-[11px]"
                title="Spotlight Arama (⌘K)"
              >
                <Search className="w-3 h-3 text-zinc-400" />
                <span>⌘K Ara...</span>
              </button>
            )}

            {/* Apple Aqua Blue +Yaz Action Button */}
            {onOpenCreateModal && (
              <button
                type="button"
                onClick={() => {
                  playKeyClick();
                  onOpenCreateModal();
                }}
                className="mac-aqua-btn-primary flex items-center gap-1.5 !px-3.5 !py-1.5 !text-xs font-bold cursor-pointer select-none"
                title="Yeni Teknik Makale Yayınla (Mac Mail)"
              >
                <PenSquare className="w-3.5 h-3.5" />
                <span>+ Yaz</span>
              </button>
            )}

            <div className="h-4 w-[1px] bg-black/15 dark:bg-white/15 hidden sm:block mx-0.5" />

            {/* Tekil Minimalist Durum LED'i */}
            <button
              type="button"
              onClick={() => {
                playKeyClick();
                if (onRefreshHealth) onRefreshHealth();
              }}
              className="p-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title={isBackendOnline ? 'Spring Boot 5555: Online (Tıkla Yenile)' : 'Backend Çevrimdışı (Tıkla Yenile)'}
            >
              <span className={`inline-block w-2 h-2 rounded-full ${
                isBackendOnline === true
                  ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]'
                  : isBackendOnline === false
                  ? 'bg-amber-400'
                  : 'bg-zinc-400 animate-pulse'
              }`} />
            </button>

            {/* 2FA Güvenlik */}
            {onOpenTwoFactor && (
              <button
                type="button"
                onClick={() => {
                  playKeyClick();
                  onOpenTwoFactor();
                }}
                className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 p-1 cursor-pointer"
                title="Mac OS X Keychain Güvenlik & 2FA"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Gece/Gündüz Göksel Geçiş */}
            <MacThemeToggle size="compact" className="scale-85" />

            {/* GitHub Repo */}
            <a
              href="https://github.com/abdullahberkeozder/my-portfolio"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playKeyClick()}
              className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white p-1"
              title="GitHub Kaynak Kodu"
            >
              <GithubIcon className="w-3.5 h-3.5" />
            </a>

            {/* Spec Drawer Toggle (Intentional Click, Never Accidental Hover Trap) */}
            <button
              type="button"
              onClick={() => {
                playKeyClick();
                setMegaMenu(isMegaOpen ? null : 'articles');
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded border border-zinc-400/80 dark:border-zinc-700 bg-white/70 dark:bg-black/40 text-[11px] font-bold uppercase shadow-sm cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Mimari Dizin ve Şartname Menüsü"
              title="Mimari Dizin ve Modül Şartnamesi"
            >
              {isMegaOpen ? <ChevronDown className="w-3 h-3 rotate-180" /> : <Menu className="w-3 h-3" />}
              <span className="hidden sm:inline">{isMegaOpen ? 'Kapat' : 'Dizin'}</span>
            </button>
          </div>
        </div>
      </div>

          {/* 4. Mac OS X Finder Column View Popover (Zero Layout Shift Overlay) */}
          <SpecDirectoryPopover
            isOpen={Boolean(isMegaOpen)}
            onClose={() => setMegaMenu(null)}
            onNavigate={(targetId, tab) => {
              setMegaMenu(null);
              scrollToSection(targetId, tab);
            }}
          />
    </header>
  );
};
