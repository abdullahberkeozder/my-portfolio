'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
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
} from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { AquariumToggle } from './AquariumToggle';
import { AppleGlobalAcrylicNavBar } from './AppleGlobalAcrylicNavBar';
import { MacWindowChrome } from './MacWindowChrome';
import { playKeyClick, playTabSelect } from '@/lib/retroAudio';

export type NavTab = 'feed' | 'system' | 'ai-search' | 'admin-batch';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isBackendOnline: boolean | null;
  onRefreshHealth: () => void;
  onOpenTelemetry?: () => void;
  onOpenArchitectureConsole?: () => void;
  onOpenTwoFactor?: () => void;
  onOpenCreateModal?: () => void;
  onFocusSearch?: () => void;
}

type MegaDrawerCategory = 'articles' | 'system' | 'ai' | 'batch' | null;

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isBackendOnline,
  onRefreshHealth,
  onOpenTelemetry,
  onOpenTwoFactor,
  onOpenCreateModal,
  onFocusSearch,
}) => {
  const [megaMenu, setMegaMenu] = useState<MegaDrawerCategory>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Open mega drawer on hover
  const handleMouseEnter = (cat: MegaDrawerCategory) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setMegaMenu(cat);
  };

  // Gracefully close on mouse leave with debounce
  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setMegaMenu(null);
    }, 180);
  };

  // Keep open when cursor enters drawer
  const handleDrawerMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const closeMegaMenu = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setMegaMenu(null);
  };

  // On click: IMMEDIATELY close mega menu and smooth-scroll to section
  const scrollToSection = (sectionId: string, targetTab?: NavTab) => {
    closeMegaMenu();
    if (targetTab) {
      setActiveTab(targetTab);
    }

    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 30);
  };

  const navigateToConsoleModule = (moduleId: string) => {
    closeMegaMenu();
    setActiveTab('system');
    setTimeout(() => {
      const el = document.getElementById('modular-architecture-console');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.dispatchEvent(new CustomEvent('select-console-module', { detail: moduleId }));
    }, 50);
  };

  const handleTestDrive = () => {
    closeMegaMenu();
    setActiveTab('system');
    setTimeout(() => {
      const el = document.getElementById('modular-architecture-console');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.dispatchEvent(new CustomEvent('select-console-module', { detail: 'loom' }));
      window.dispatchEvent(new CustomEvent('run-console-simulation'));
    }, 50);
  };

  const TAB_ORDER: NavTab[] = ['feed', 'system', 'ai-search', 'admin-batch'];

  const handlePrevTab = () => {
    playKeyClick();
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    const prevIndex = (currentIndex - 1 + TAB_ORDER.length) % TAB_ORDER.length;
    const targetTab = TAB_ORDER[prevIndex];
    setActiveTab(targetTab);
    if (targetTab === 'feed') scrollToSection('articles-feed', targetTab);
    else if (targetTab === 'system') scrollToSection('modular-architecture-console', targetTab);
    else if (targetTab === 'ai-search') scrollToSection('ai-vector-studio', targetTab);
    else if (targetTab === 'admin-batch') scrollToSection('batch-etl-studio', targetTab);
  };

  const handleNextTab = () => {
    playKeyClick();
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % TAB_ORDER.length;
    const targetTab = TAB_ORDER[nextIndex];
    setActiveTab(targetTab);
    if (targetTab === 'feed') scrollToSection('articles-feed', targetTab);
    else if (targetTab === 'system') scrollToSection('modular-architecture-console', targetTab);
    else if (targetTab === 'ai-search') scrollToSection('ai-vector-studio', targetTab);
    else if (targetTab === 'admin-batch') scrollToSection('batch-etl-studio', targetTab);
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
    <header
      className="sticky top-0 z-50 select-none shadow-md"
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Top Tier: Apple 2010 Global Acrylic Nav Bar (40px) */}
      <AppleGlobalAcrylicNavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendOnline={isBackendOnline}
        onRefreshHealth={onRefreshHealth}
        onOpenTelemetry={onOpenTelemetry}
        onOpenTwoFactor={onOpenTwoFactor}
        onFocusSearch={onFocusSearch}
        scrollToSection={scrollToSection}
      />

      {/* 2. Middle Tier: Mac OS X Window Titlebar & Traffic Lights */}
      <MacWindowChrome
        title="NOVA — Dağıtık Sistemler ve Yapay Zeka Yayını (Mac OS X Edition)"
        subtitle="Java 22 Loom · Spring AI · PostgreSQL pgvector 128D"
        onClose={() => playKeyClick()}
        onMinimize={() => playKeyClick()}
        onMaximize={() => playKeyClick()}
      />

      {/* Subtle backdrop overlay when mega menu is open */}
      {isMegaOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 transition-opacity duration-200 pointer-events-auto"
          onClick={closeMegaMenu}
        />
      )}

      {/* 3. Bottom Tier: Mac OS X 44px Unified Brushed-Platinum Toolbar */}
      <div className="mac-unified-toolbar relative z-40">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 py-1">
          {/* Left Controls: Finder Nav Chevrons [<] [>] + Wordmark */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="mac-nav-chevron-group" title="Finder Tarihsel Pencereler Arası Gezinme">
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

            {/* Brand Logo & Wordmark */}
            <div
              className="flex items-center gap-2 cursor-pointer group py-1"
              onClick={() => {
                closeMegaMenu();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                if (onRefreshHealth) onRefreshHealth();
              }}
            >
              <svg
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 text-zinc-900 dark:text-zinc-100 transition-transform group-hover:scale-105 duration-200"
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

              <span className="font-black text-base sm:text-lg tracking-tight uppercase leading-none text-zinc-900 dark:text-zinc-100 drop-shadow-[0_1px_0_rgba(255,255,255,0.9)] dark:drop-shadow-[0_-1px_0_rgba(0,0,0,0.8)]">
                NOVA.
              </span>
            </div>
          </div>

          {/* Center Controls: Finder Metallic 4-Segmented Switcher */}
          <nav className="hidden md:inline-flex items-center retro-segmented-track shadow-inner">
            <button
              type="button"
              onMouseEnter={() => handleMouseEnter('articles')}
              onClick={() => {
                playTabSelect();
                scrollToSection('articles-feed', 'feed');
              }}
              className={`retro-segmented-item flex items-center gap-1.5 text-xs font-bold ${
                activeTab === 'feed' ? 'active' : ''
              }`}
            >
              <span>MAKALELER</span>
            </button>

            <button
              type="button"
              onMouseEnter={() => handleMouseEnter('system')}
              onClick={() => {
                playTabSelect();
                scrollToSection('modular-architecture-console', 'system');
              }}
              className={`retro-segmented-item flex items-center gap-1.5 text-xs font-bold ${
                activeTab === 'system' ? 'active' : ''
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>ÇEKİRDEK</span>
            </button>

            <button
              type="button"
              onMouseEnter={() => handleMouseEnter('ai')}
              onClick={() => {
                playTabSelect();
                scrollToSection('ai-vector-studio', 'ai-search');
              }}
              className={`retro-segmented-item flex items-center gap-1.5 text-xs font-bold ${
                activeTab === 'ai-search' ? 'active' : ''
              }`}
            >
              <Cpu className="w-3 h-3" />
              <span>AI & VEKTÖR</span>
            </button>

            <button
              type="button"
              onMouseEnter={() => handleMouseEnter('batch')}
              onClick={() => {
                playTabSelect();
                scrollToSection('batch-etl-studio', 'admin-batch');
              }}
              className={`retro-segmented-item flex items-center gap-1.5 text-xs font-bold ${
                activeTab === 'admin-batch' ? 'active' : ''
              }`}
            >
              <Database className="w-3 h-3" />
              <span>BATCH & ETL</span>
            </button>
          </nav>

          {/* Right Controls: Recessed Search, Blue Write Button, Aquarium Toggle & Mobile Menu */}
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

            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => {
                playKeyClick();
                setMegaMenu(isMegaOpen ? null : 'articles');
              }}
              className="md:hidden flex items-center gap-1 px-2.5 py-1 rounded border border-zinc-400 dark:border-zinc-700 bg-white/70 dark:bg-black/40 text-xs font-bold uppercase shadow-sm cursor-pointer"
              aria-label="Menüyü Aç / Kapat"
            >
              {isMegaOpen ? <ChevronDown className="w-3 h-3 rotate-180" /> : <Menu className="w-3 h-3" />}
              <span>{isMegaOpen ? 'Kapat' : 'Menü'}</span>
            </button>

            {/* Cylindrical Glossy Blue +Yaz Button */}
            {onOpenCreateModal && (
              <button
                type="button"
                onClick={() => {
                  playKeyClick();
                  onOpenCreateModal();
                }}
                className="retro-btn retro-btn-blue text-xs font-bold px-3 py-1 flex items-center gap-1 cursor-pointer select-none shadow-sm"
                title="Yeni Teknik Makale Yayınla"
              >
                <PenSquare className="w-3 h-3" />
                <span>+ Yaz</span>
              </button>
            )}

            {/* Living Pixel Aquarium Theme Toggle */}
            <div className="p-0.5 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
              <AquariumToggle compact compactWidth={76} className="shrink-0" />
            </div>

            {/* GitHub Icon Link */}
            <a
              href="https://github.com/abdullahberkeozder/my-portfolio"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playKeyClick()}
              className="flex items-center justify-center w-7 h-7 rounded border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 shadow-sm transition-colors cursor-pointer"
              title="GitHub Repository"
            >
              <GithubIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

          {/* 4. Elegant Frosted Glass Mega-Menu Dropdown (Hardware-Accelerated Single Surface) */}
          {isMegaOpen && (
            <div
              onMouseEnter={handleDrawerMouseEnter}
              className="mt-2 bg-white/98 dark:bg-[#0c0e12]/98 rounded-3xl p-6 sm:p-7 lg:p-8 shadow-2xl border border-zinc-200/90 dark:border-zinc-800/90 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start ride-also-drawer-anim text-zinc-900 dark:text-white"
            >
              {/* Mobile Category Switcher (md:hidden) */}
              <div className="md:hidden col-span-1 flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800 scrollbar-none font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setMegaMenu('articles')}
                  className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    megaMenu === 'articles'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  MAKALELER
                </button>
                <button
                  type="button"
                  onClick={() => setMegaMenu('system')}
                  className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    megaMenu === 'system'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  ÇEKİRDEK
                </button>
                <button
                  type="button"
                  onClick={() => setMegaMenu('ai')}
                  className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    megaMenu === 'ai'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  AI & VEKTÖR
                </button>
                <button
                  type="button"
                  onClick={() => setMegaMenu('batch')}
                  className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    megaMenu === 'batch'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  BATCH & ETL
                </button>
              </div>

              {/* Left Sub-Navigation Menu */}
              <div className="lg:col-span-3 space-y-4 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 pb-6 lg:pb-0 lg:pr-6 font-mono text-xs">
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold tracking-widest uppercase">
                  ALT DİZİN // SPEC
                </div>

                {megaMenu === 'articles' && (
                  <ul className="space-y-3 font-semibold">
                    <li>
                      <button
                        type="button"
                        onClick={() => scrollToSection('articles-feed', 'feed')}
                        className="text-left font-bold text-zinc-950 dark:text-white hover:text-emerald-600 dark:hover:text-[#d4f933] transition-colors cursor-pointer block tracking-wider"
                      >
                        &rarr; TÜM MAKALELER (FEED)
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => navigateToConsoleModule('spring-ai')}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        MİMARİ ÇEKİRDEK
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => navigateToConsoleModule('loom')}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        SPRING BOOT 4.1.1 SPEC
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => navigateToConsoleModule('loom')}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        JAVA 22 LOOM CONCURRENCY
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => navigateToConsoleModule('write-behind')}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        REDIS WRITE-BEHIND BUFFER
                      </button>
                    </li>
                  </ul>
                )}

                {megaMenu === 'system' && (
                  <ul className="space-y-3 font-semibold">
                    <li>
                      <button
                        type="button"
                        onClick={() => scrollToSection('modular-architecture-console', 'system')}
                        className="text-left font-bold text-emerald-600 dark:text-[#d4f933] transition-colors cursor-pointer block tracking-wider"
                      >
                        &rarr; MODULAR SIMULATOR CONSOLE
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => navigateToConsoleModule('loom')}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        LOOM VIRTUAL THREADS HUD
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => navigateToConsoleModule('write-behind')}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        REDIS WRITE-BEHIND BUFFER
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => navigateToConsoleModule('optimistic-locking')}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        JPA OPTIMISTIC LOCKING
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          closeMegaMenu();
                          if (onOpenTwoFactor) onOpenTwoFactor();
                          else if (onOpenTelemetry) onOpenTelemetry();
                        }}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        2FA TOTP PROTOKOLÜ
                      </button>
                    </li>
                  </ul>
                )}

                {megaMenu === 'ai' && (
                  <ul className="space-y-3 font-semibold">
                    <li>
                      <button
                        type="button"
                        onClick={() => scrollToSection('ai-vector-studio', 'ai-search')}
                        className="text-left font-bold text-zinc-950 dark:text-white hover:text-emerald-600 dark:hover:text-[#d4f933] transition-colors cursor-pointer block tracking-wider"
                      >
                        &rarr; SEMANTİK VEKTÖR ARAMA
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => scrollToSection('ai-vector-studio', 'ai-search')}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        AI LAB OYUN ALANI
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => navigateToConsoleModule('spring-ai')}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        ANLAMSAL BENZERLİK VEKTÖRÜ
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => scrollToSection('ai-vector-studio', 'ai-search')}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        AI İÇERİK DENETİM RADARI
                      </button>
                    </li>
                  </ul>
                )}

                {megaMenu === 'batch' && (
                  <ul className="space-y-3 font-semibold">
                    <li>
                      <button
                        type="button"
                        onClick={() => scrollToSection('batch-etl-studio', 'admin-batch')}
                        className="text-left font-bold text-zinc-950 dark:text-white hover:text-emerald-600 dark:hover:text-[#d4f933] transition-colors cursor-pointer block tracking-wider"
                      >
                        &rarr; SPRING BATCH KONSOLU
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => scrollToSection('batch-etl-studio', 'admin-batch')}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        SOFT-DELETE RETENTION PURGE
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => scrollToSection('batch-etl-studio', 'admin-batch')}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        YAZAR ANALİTİK RAPORLAMA
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          closeMegaMenu();
                          if (onOpenTelemetry) onOpenTelemetry();
                        }}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        POSTGRES &bull; REDIS TELEMETRİ
                      </button>
                    </li>
                  </ul>
                )}
              </div>

              {/* Right Showcase Cards Grid */}
              <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Showcase Card 1 */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-5 bg-zinc-50/70 dark:bg-zinc-900/40 flex flex-col justify-between space-y-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-300 group">
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider mb-1">
                        01 // TRANSPARENT CORE
                      </div>
                      <h4 className="text-xl font-black text-zinc-950 dark:text-white tracking-tight">
                        {megaMenu === 'articles' && 'Java 22 Loom'}
                        {megaMenu === 'system' && 'Şeffaf Motor'}
                        {megaMenu === 'ai' && 'Anlamsal Vektör'}
                        {megaMenu === 'batch' && 'Batch 5 Chunk'}
                      </h4>
                    </div>

                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                      <Image
                        src="/images/architecture-cutaway.jpg"
                        alt="Transparent Core Architecture"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover transition-transform group-hover:scale-105 duration-700 ease-out"
                      />
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-sans">
                      {megaMenu === 'articles' && '10.000 sanal thread havuzu ile sıfır platform thread kilitlemesi.'}
                      {megaMenu === 'system' && 'Mikroişlemci seviyesinde şeffaf akrilik ve titanyum soğutma tasarımı.'}
                      {megaMenu === 'ai' && 'Anlamsal yakınlık ile milisaniyede akıllı içerik eşleştirme.'}
                      {megaMenu === 'batch' && '100\'lük chunk işleyicisi ile veritabanı temizleme ve arşiv.'}
                    </p>
                  </div>

                  {/* Dual-Pill Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (megaMenu === 'batch') scrollToSection('batch-etl-studio', 'admin-batch');
                        else if (megaMenu === 'ai') scrollToSection('ai-vector-studio', 'ai-search');
                        else if (megaMenu === 'system') scrollToSection('modular-architecture-console', 'system');
                        else scrollToSection('articles-feed', 'feed');
                      }}
                      className="flex-1 px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono font-bold uppercase hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-pointer btn-tactile text-center"
                    >
                      İNCELE
                    </button>
                    <button
                      type="button"
                      onClick={handleTestDrive}
                      className="flex-1 px-4 py-2 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-black text-xs font-mono font-bold uppercase hover:opacity-90 transition-all cursor-pointer btn-tactile text-center"
                    >
                      MİMARİYİ İNCELE
                    </button>
                  </div>
                </div>

                {/* Showcase Card 2 */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-5 bg-zinc-50/70 dark:bg-zinc-900/40 flex flex-col justify-between space-y-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-300 group">
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider mb-1">
                        02 // HARDWARE CONSOLE
                      </div>
                      <h4 className="text-xl font-black text-zinc-950 dark:text-white tracking-tight">
                        {megaMenu === 'articles' && 'Write-Behind'}
                        {megaMenu === 'system' && 'Dokunsal Saha'}
                        {megaMenu === 'ai' && 'AI Güvenlik Radarı'}
                        {megaMenu === 'batch' && 'Yazar İstatistik'}
                      </h4>
                    </div>

                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                      <Image
                        src="/images/terminal-hardware.jpg"
                        alt="Tactile Hardware Terminal"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover transition-transform group-hover:scale-105 duration-700 ease-out"
                      />
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-sans">
                      {megaMenu === 'articles' && 'Görüntülenme ve beğeni sayaçlarında sıfır PostgreSQL satır kilitlemesi.'}
                      {megaMenu === 'system' && 'Teenage Engineering ve Dieter Rams tarzı fiziksel donanım konsolu.'}
                      {megaMenu === 'ai' && 'Kullanıcı yorumlarını yayınlanmadan önce denetleyen çok sınıflı AI.'}
                      {megaMenu === 'batch' && 'Tüm yazarların kelime sayısı ve etkileşim metrikleri.'}
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (megaMenu === 'ai') scrollToSection('ai-vector-studio', 'ai-search');
                        else if (megaMenu === 'batch') scrollToSection('batch-etl-studio', 'admin-batch');
                        else if (megaMenu === 'articles') scrollToSection('articles-feed', 'feed');
                        else navigateToConsoleModule('write-behind');
                      }}
                      className="w-full px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono font-bold uppercase hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-pointer text-center btn-tactile"
                    >
                      KEŞFET
                    </button>
                  </div>
                </div>

                {/* Showcase Card 3 */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-5 bg-zinc-50/70 dark:bg-zinc-900/40 flex flex-col justify-between space-y-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-300 group">
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider mb-1">
                        03 // CANLI SİMÜLASYON
                      </div>
                      <h4 className="text-xl font-black text-zinc-950 dark:text-white tracking-tight">
                        Canlı Simülatör
                      </h4>
                    </div>

                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                      <Image
                        src="/images/lifestyle-hero.jpg"
                        alt="Engineering Lifestyle"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover transition-transform group-hover:scale-105 duration-700 ease-out"
                      />
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-sans">
                      Gerçek zamanlı Loom sanal thread akışı ve 409 çakışma önleme simülasyonu.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleTestDrive}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-black text-xs font-mono font-bold uppercase hover:opacity-90 transition-all cursor-pointer btn-tactile shadow-sm"
                    >
                      <span>CANLI MİMARİYİ DENE</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
    </header>
  );
};
