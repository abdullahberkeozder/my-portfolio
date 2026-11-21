'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  PenSquare,
  Search,
  ShieldAlert,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
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
  const { isDark, toggleTheme } = useTheme();
  const [megaMenu, setMegaMenu] = useState<MegaDrawerCategory>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const closeMegaMenu = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setMegaMenu(null);
  };

  // Reliable navigation across routes and in-page sections
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

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('manual-tab-navigation-start'));
      window.history.pushState(null, '', `#${sectionId}`);

      if (sectionId === 'articles-feed' && window.scrollY < 400) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const scrollToSection = (targetId: string, targetTab: NavTab) => {
    playTabSelect();
    if (setActiveTab) {
      setActiveTab(targetTab);
    }
    closeMegaMenu();

    const isHome = pathname === '/' || pathname === '';
    if (!isHome) {
      router.push(`/#${targetId}`);
      return;
    }

    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const tabOrder: NavTab[] = ['feed', 'system', 'ai-search', 'admin-batch'];

  const handlePrevTab = () => {
    playKeyClick();
    const currentIndex = tabOrder.indexOf(activeTab);
    const prevIndex = (currentIndex - 1 + tabOrder.length) % tabOrder.length;
    const targetTab = tabOrder[prevIndex];
    if (targetTab === 'feed') handleTabClick('articles-feed', targetTab);
    else if (targetTab === 'system') handleTabClick('modular-architecture-console', targetTab);
    else if (targetTab === 'ai-search') handleTabClick('ai-vector-studio', targetTab);
    else if (targetTab === 'admin-batch') handleTabClick('batch-etl-studio', targetTab);
  };

  const handleNextTab = () => {
    playKeyClick();
    const currentIndex = tabOrder.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % tabOrder.length;
    const targetTab = tabOrder[nextIndex];
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
    <header className="sticky top-0 z-50 select-none shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
      {/* Subtle backdrop overlay when mega menu is open */}
      {isMegaOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 transition-opacity duration-200 pointer-events-auto"
          onClick={closeMegaMenu}
        />
      )}

      {/* Mac OS 9 Platinum Application Toolbar (38px height, razor-sharp alignment) */}
      <div className="mac9-app-toolbar relative z-40 select-none border-b border-[#808080] dark:border-[#141518]">
        <div className="w-full px-2.5 sm:px-3 h-[38px] flex items-center justify-between gap-1.5 sm:gap-3">
          
          {/* Left Region: Mac OS 9 Nav Chevrons [◀] [▶] + NOVA Wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Finder Nav Chevrons [◀] [▶] in authentic Mac OS 9 Bevel Buttons */}
            <div className="flex items-center gap-1" title="Finder Section Navigation">
              <button
                type="button"
                onClick={handlePrevTab}
                className="mac9-btn mac9-btn-icon text-[#262626] dark:text-[#E0E0E0]"
                title="Previous Section (◀)"
                aria-label="Previous"
              >
                <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={handleNextTab}
                className="mac9-btn mac9-btn-icon text-[#262626] dark:text-[#E0E0E0]"
                title="Next Section (▶)"
                aria-label="Next"
              >
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            </div>

            <div className="h-4 w-[1px] bg-[#999999] dark:bg-[#404040] hidden sm:block mx-0.5" />

            {/* Brand Logo & Wordmark (Mac OS 9 Title Font) */}
            <div
              className="flex items-center gap-1.5 cursor-pointer group py-0.5"
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
                className="w-4 h-4 shrink-0 text-zinc-900 dark:text-zinc-100 transition-transform group-hover:scale-105 duration-200"
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

              <span className="font-['Charcoal',sans-serif] font-bold text-[12px] tracking-wider uppercase leading-none text-zinc-950 dark:text-zinc-100">
                NOVA
              </span>
            </div>
          </div>

          {/* Center Region: Mac OS 9 Segmented 4-Tab Switcher (Strictly single-line, NO text wrapping) */}
          <nav
            role="tablist"
            aria-label="Main Navigation Tabs"
            className="mac9-segmented-group shrink-0 h-[26px] overflow-hidden"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'feed'}
              onClick={() => handleTabClick('articles-feed', 'feed')}
              className={`mac9-segmented-item whitespace-nowrap shrink-0 !py-1 !px-2.5 !text-[11px] ${
                activeTab === 'feed' ? 'active' : ''
              }`}
            >
              <span>ARTICLES</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'system'}
              onClick={() => handleTabClick('modular-architecture-console', 'system')}
              className={`mac9-segmented-item whitespace-nowrap shrink-0 !py-1 !px-2.5 !text-[11px] ${
                activeTab === 'system' ? 'active' : ''
              }`}
            >
              <span>CORE ENGINE</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'ai-search'}
              onClick={() => handleTabClick('ai-vector-studio', 'ai-search')}
              className={`mac9-segmented-item whitespace-nowrap shrink-0 !py-1 !px-2.5 !text-[11px] ${
                activeTab === 'ai-search' ? 'active' : ''
              }`}
            >
              <span>AI &amp; VECTOR</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'admin-batch'}
              onClick={() => handleTabClick('batch-etl-studio', 'admin-batch')}
              className={`mac9-segmented-item whitespace-nowrap shrink-0 !py-1 !px-2.5 !text-[11px] ${
                activeTab === 'admin-batch' ? 'active' : ''
              }`}
            >
              <span>BATCH &amp; ETL</span>
            </button>
          </nav>

          {/* Right Region: Search + Action Button + Mac OS 9 Utility Palette */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Mac OS 9 Inset Search Field (24px height, matching controls) */}
            {onFocusSearch && (
              <button
                type="button"
                onClick={() => {
                  playKeyClick();
                  onFocusSearch();
                }}
                className="mac9-inset-box hidden md:flex items-center gap-1.5 px-2 h-[24px] text-[11px] font-['Geneva',sans-serif] text-zinc-700 dark:text-zinc-300 cursor-pointer select-none rounded-[2px]"
                title="Spotlight Search (⌘K)"
              >
                <Search className="w-3 h-3 text-zinc-500" />
                <span>⌘K Search...</span>
              </button>
            )}

            {/* Compose Article Action Button (Clean Mac OS 9 Bevel Button) */}
            {onOpenCreateModal && (
              <button
                type="button"
                onClick={() => {
                  playKeyClick();
                  onOpenCreateModal();
                }}
                className="mac9-btn flex items-center gap-1.5 h-[24px] !px-2.5 text-[11px] font-['Charcoal',sans-serif] font-bold cursor-pointer select-none text-[#262626] dark:text-[#EEEEEE]"
                title="Compose Technical Article"
              >
                <PenSquare className="w-3 h-3 text-[#333399] dark:text-blue-400" />
                <span>+ Write</span>
              </button>
            )}

            <div className="h-4 w-[1px] bg-[#999999] dark:bg-[#404040] hidden sm:block mx-0.5" />

            {/* Backend Health Status Pill */}
            <button
              type="button"
              onClick={() => {
                playKeyClick();
                if (onRefreshHealth) onRefreshHealth();
              }}
              className="mac9-btn h-[24px] !px-1.5 flex items-center gap-1 text-[10px] font-mono cursor-pointer"
              title={isBackendOnline ? 'Spring Boot 5555: Online (Click to Refresh)' : 'Backend Offline (Click to Refresh)'}
            >
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  isBackendOnline === true
                    ? 'bg-emerald-500 shadow-[0_0_4px_#10b981]'
                    : isBackendOnline === false
                    ? 'bg-amber-400 shadow-[0_0_4px_#fbbf24]'
                    : 'bg-zinc-400 animate-pulse'
                }`}
              />
              <span className="text-[10px] text-zinc-600 dark:text-zinc-400 hidden xl:inline">
                {isBackendOnline ? 'Online' : 'Offline'}
              </span>
            </button>

            {/* Mac OS 9 2FA Security Button */}
            {onOpenTwoFactor && (
              <button
                type="button"
                onClick={() => {
                  playKeyClick();
                  onOpenTwoFactor();
                }}
                className="mac9-btn mac9-btn-icon text-zinc-700 dark:text-zinc-300"
                title="Mac OS 9 Security &amp; 2FA"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Authentic Mac OS 9 Day / Night Theme Button (Matches Platinum aesthetic) */}
            <button
              type="button"
              onClick={(e) => {
                playKeyClick();
                toggleTheme(e);
              }}
              className="mac9-btn mac9-btn-icon text-zinc-700 dark:text-zinc-300"
              title={isDark ? 'Switch to Day Mode (Mac OS 9 Platinum)' : 'Switch to Night Mode (Mac OS X Night Sky)'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-700" />
              )}
            </button>

            {/* GitHub Source Link */}
            <a
              href="https://github.com/abdullahberkeozder/my-portfolio"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playKeyClick()}
              className="mac9-btn mac9-btn-icon text-zinc-700 dark:text-zinc-300"
              title="GitHub Source Code"
            >
              <GithubIcon className="w-3.5 h-3.5" />
            </a>

            {/* Spec Directory Menu / Index Button */}
            <button
              type="button"
              onClick={() => {
                playKeyClick();
                setMegaMenu(isMegaOpen ? null : 'articles');
              }}
              className={`mac9-btn flex items-center gap-1 h-[24px] !px-2 text-[10px] font-['Charcoal',sans-serif] font-bold uppercase cursor-pointer ${
                isMegaOpen ? 'active' : ''
              }`}
              aria-label="Architecture Directory Menu"
              title="Architecture Directory &amp; Module Specifications"
            >
              {isMegaOpen ? <ChevronDown className="w-3 h-3 rotate-180" /> : <Menu className="w-3 h-3" />}
              <span>{isMegaOpen ? 'Close' : 'Index'}</span>
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
