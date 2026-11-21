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

      {/* Mac OS 9 Platinum Application Toolbar (42px) */}
      <div className="mac9-app-toolbar relative z-40 select-none">
        <div className="w-full max-w-7xl mx-auto h-[42px] px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left Region: Mac OS 9 Nav Chevrons [◀] [▶] + NOVA Wordmark */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Finder Nav Chevrons [◀] [▶] in Mac OS 9 Bevel Buttons */}
            <div className="flex items-center gap-1" title="Finder Historical Window Navigation">
              <button
                type="button"
                onClick={handlePrevTab}
                className="mac9-btn w-6 h-6 flex items-center justify-center p-0 text-[#262626] dark:text-[#E0E0E0]"
                title="Previous Tab"
                aria-label="Previous"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextTab}
                className="mac9-btn w-6 h-6 flex items-center justify-center p-0 text-[#262626] dark:text-[#E0E0E0]"
                title="Next Tab"
                aria-label="Next"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-4 w-[1px] bg-[#808080] dark:bg-[#404040] hidden sm:block mx-0.5" />

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
              title="Return to Nova Home"
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

              <span className="font-['Charcoal',sans-serif] font-black text-xs tracking-wider uppercase leading-none text-zinc-900 dark:text-zinc-100">
                NOVA
              </span>
            </div>
          </div>

          {/* Center Region: Mac OS 9 Segmented 4-Tab Switcher */}
          <nav
            role="tablist"
            aria-label="Main Navigation Tabs"
            className="mac9-segmented-group overflow-x-auto scrollbar-none max-w-full"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'feed'}
              onClick={() => handleTabClick('articles-feed', 'feed')}
              className={`mac9-segmented-item ${activeTab === 'feed' ? 'active' : ''}`}
            >
              <span>ARTICLES</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'system'}
              onClick={() => handleTabClick('modular-architecture-console', 'system')}
              className={`mac9-segmented-item ${activeTab === 'system' ? 'active' : ''}`}
            >
              <span>CORE ENGINE</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'ai-search'}
              onClick={() => handleTabClick('ai-vector-studio', 'ai-search')}
              className={`mac9-segmented-item ${activeTab === 'ai-search' ? 'active' : ''}`}
            >
              <span>AI &amp; VECTOR</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'admin-batch'}
              onClick={() => handleTabClick('batch-etl-studio', 'admin-batch')}
              className={`mac9-segmented-item ${activeTab === 'admin-batch' ? 'active' : ''}`}
            >
              <span>BATCH &amp; ETL</span>
            </button>
          </nav>

          {/* Right Region: Spotlight Search + Default +Write + Utility Cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mac OS 9 Inset Search Field */}
            {onFocusSearch && (
              <button
                type="button"
                onClick={() => {
                  playKeyClick();
                  onFocusSearch();
                }}
                className="mac9-inset-box hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-['Geneva',sans-serif] text-zinc-700 dark:text-zinc-300 cursor-pointer select-none rounded-[2px]"
                title="Spotlight Search (⌘K)"
              >
                <Search className="w-3 h-3 text-zinc-500" />
                <span>⌘K Search...</span>
              </button>
            )}

            {/* Mac OS 9 Default +Write Action Button */}
            {onOpenCreateModal && (
              <button
                type="button"
                onClick={() => {
                  playKeyClick();
                  onOpenCreateModal();
                }}
                className="mac9-btn-default flex items-center gap-1.5 !px-3 !py-1 !text-xs font-['Charcoal',sans-serif] font-bold cursor-pointer select-none text-[#262626] dark:text-[#EEEEEE]"
                title="Compose Technical Article"
              >
                <PenSquare className="w-3.5 h-3.5" />
                <span>+ Write</span>
              </button>
            )}

            <div className="h-4 w-[1px] bg-[#808080] dark:bg-[#404040] hidden sm:block mx-0.5" />

            {/* Status LED */}
            <button
              type="button"
              onClick={() => {
                playKeyClick();
                if (onRefreshHealth) onRefreshHealth();
              }}
              className="p-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title={isBackendOnline ? 'Spring Boot 5555: Online (Click to Refresh)' : 'Backend Offline (Click to Refresh)'}
            >
              <span className={`inline-block w-2 h-2 rounded-full ${
                isBackendOnline === true
                  ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]'
                  : isBackendOnline === false
                  ? 'bg-amber-400'
                  : 'bg-zinc-400 animate-pulse'
              }`} />
            </button>

            {/* 2FA Security */}
            {onOpenTwoFactor && (
              <button
                type="button"
                onClick={() => {
                  playKeyClick();
                  onOpenTwoFactor();
                }}
                className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 p-1 cursor-pointer"
                title="Mac OS 9 Security &amp; 2FA"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Day / Night Celestial Toggle */}
            <MacThemeToggle size="compact" className="scale-85" />

            {/* GitHub Repo */}
            <a
              href="https://github.com/abdullahberkeozder/my-portfolio"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playKeyClick()}
              className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white p-1"
              title="GitHub Source Code"
            >
              <GithubIcon className="w-3.5 h-3.5" />
            </a>

            {/* Spec Drawer Toggle (Mac OS 9 Button Style) */}
            <button
              type="button"
              onClick={() => {
                playKeyClick();
                setMegaMenu(isMegaOpen ? null : 'articles');
              }}
              className="mac9-btn flex items-center gap-1 !px-2 !py-0.5 text-[10px] font-['Charcoal',sans-serif] font-bold uppercase cursor-pointer"
              aria-label="Architecture Directory Menu"
              title="Architecture Directory &amp; Module Specifications"
            >
              {isMegaOpen ? <ChevronDown className="w-3 h-3 rotate-180" /> : <Menu className="w-3 h-3" />}
              <span className="hidden sm:inline">{isMegaOpen ? 'Close' : 'Index'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Mac OS 9 Finder Column View Popover (Zero Layout Shift Overlay) */}
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
