'use client';

import React from 'react';
import { Search, ShieldAlert } from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { MacThemeToggle } from './MacThemeToggle';
import { playKeyClick, playTabSelect } from '@/lib/retroAudio';
import { NavTab } from './Navbar';

interface AppleGlobalAcrylicNavBarProps {
  activeTab: NavTab;
  setActiveTab?: (tab: NavTab) => void;
  isBackendOnline: boolean | null;
  onRefreshHealth?: () => void;
  onOpenTelemetry?: () => void;
  onOpenTwoFactor?: () => void;
  onFocusSearch?: () => void;
  onSearchClick?: () => void;
  onFeedTabChange?: () => void;
  scrollToSection?: (sectionId: string, targetTab?: NavTab) => void;
}

export const AppleGlobalAcrylicNavBar: React.FC<AppleGlobalAcrylicNavBarProps> = ({
  activeTab,
  setActiveTab,
  isBackendOnline,
  onRefreshHealth,
  onOpenTelemetry,
  onOpenTwoFactor,
  onFocusSearch,
  onSearchClick,
  onFeedTabChange,
  scrollToSection,
}) => {
  const handleNavClick = (tab: NavTab, sectionId?: string) => {
    playTabSelect();
    if (setActiveTab) setActiveTab(tab);
    if (tab === 'feed' && onFeedTabChange) onFeedTabChange();
    if (sectionId && scrollToSection) {
      scrollToSection(sectionId, tab);
    }
  };

  const handleSearchClick = () => {
    playKeyClick();
    if (onFocusSearch) {
      onFocusSearch();
    } else if (onSearchClick) {
      onSearchClick();
    }
  };

  return (
    <header className="apple-global-nav sticky top-0 left-0 w-full flex items-center justify-between px-3 md:px-6 z-50">
      {/* 1. Left: Apple 2010 Embossed Brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => handleNavClick('feed', 'editorial-feed-section')}
          className="apple-global-nav-brand flex items-center gap-1.5 hover:opacity-95 cursor-pointer focus:outline-none"
          title="Nova Teknoloji Yayıncılık (Apple 2010 Masaüstü Sürümü)"
        >
          <span className="text-base leading-none select-none"></span>
          <span className="font-extrabold tracking-tight">NOVA</span>
          <span className="text-[10px] text-zinc-400 font-normal hidden sm:inline ml-1 border-l border-zinc-600 pl-2">
            Masaüstü Web
          </span>
        </button>
      </div>

      {/* 2. Center: Historical Categorical Menu Items */}
      <nav className="hidden md:flex items-center gap-1 lg:gap-2">
        <button
          type="button"
          onClick={() => handleNavClick('feed', 'editorial-feed-section')}
          className={`apple-global-nav-link ${activeTab === 'feed' ? 'active' : ''}`}
        >
          Keşfet & Feed
        </button>

        <button
          type="button"
          onClick={() => handleNavClick('system', 'architecture-console-section')}
          className={`apple-global-nav-link ${activeTab === 'system' ? 'active' : ''}`}
        >
          Loom & Dağıtık Mimariler
        </button>

        <button
          type="button"
          onClick={() => handleNavClick('ai-search', 'semantic-search-section')}
          className={`apple-global-nav-link ${activeTab === 'ai-search' ? 'active' : ''}`}
        >
          Spring AI & pgvector
        </button>

        <button
          type="button"
          onClick={() => handleNavClick('admin-batch', 'batch-etl-studio')}
          className={`apple-global-nav-link ${activeTab === 'admin-batch' ? 'active' : ''}`}
        >
          Batch & ETL
        </button>

        {onOpenTelemetry && (
          <button
            type="button"
            onClick={() => {
              playKeyClick();
              onOpenTelemetry();
            }}
            className="apple-global-nav-link flex items-center gap-1 text-amber-300 hover:text-amber-200"
            title="Mac OS X Activity Monitor & Donanım Telemetrisi"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Etkinlik Monitörü
          </button>
        )}
      </nav>

      {/* 3. Right: System Health LED, Keychain 2FA, Celestial Theme Toggle & GitHub */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Backend Online Status LED */}
        <button
          type="button"
          onClick={() => {
            playKeyClick();
            if (onRefreshHealth) onRefreshHealth();
          }}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/40 border border-zinc-800 text-[10px] font-mono cursor-pointer"
          title={isBackendOnline ? 'Spring Boot 5555: Online (Tıkla Yenile)' : 'Backend Çevrimdışı'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendOnline === true
                ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]'
                : isBackendOnline === false
                ? 'bg-rose-500 shadow-[0_0_6px_#ef4444]'
                : 'bg-amber-500 animate-pulse'
            }`}
          />
          <span className="text-zinc-300 hidden sm:inline">
            {isBackendOnline === true ? 'ONLINE' : isBackendOnline === false ? 'OFFLINE' : 'CHECK'}
          </span>
        </button>

        {/* Security / 2FA trigger */}
        {onOpenTwoFactor && (
          <button
            type="button"
            onClick={() => {
              playKeyClick();
              onOpenTwoFactor();
            }}
            className="text-zinc-400 hover:text-zinc-200 transition-colors p-1 cursor-pointer"
            title="Mac OS X Keychain Güvenlik & 2FA"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Mac OS X Skeuomorphic Day/Night Celestial Switch */}
        <div className="flex items-center">
          <MacThemeToggle size="compact" className="scale-90" />
        </div>

        {/* GitHub Link */}
        <a
          href="https://github.com/abdullahberkeozder/my-portfolio"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playKeyClick()}
          className="text-zinc-400 hover:text-white transition-colors p-1"
          title="GitHub Repo"
        >
          <GithubIcon className="w-3.5 h-3.5" />
        </a>
      </div>
    </header>
  );
};
