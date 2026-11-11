'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Cpu,
  Database,
  ArrowRight,
  Layers,
  Zap,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { AquariumToggle } from './AquariumToggle';

export type NavTab = 'feed' | 'system' | 'ai-search' | 'admin-batch';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isBackendOnline: boolean | null;
  onRefreshHealth: () => void;
  onOpenTelemetry?: () => void;
  onOpenArchitectureConsole?: () => void;
  onOpenTwoFactor?: () => void;
  onOpenAbout?: () => void;
}

type MegaDrawerCategory = 'articles' | 'system' | 'ai' | 'batch' | null;

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isBackendOnline,
  onRefreshHealth,
  onOpenTelemetry,
  onOpenArchitectureConsole,
  onOpenTwoFactor,
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
      className="sticky top-0 z-50"
      onMouseLeave={handleMouseLeave}
    >
      {/* Subtle backdrop overlay when mega menu is open - pure opacity scrim, no expensive fullscreen blur */}
      {isMegaOpen && (
        <div
          className="fixed inset-0 bg-black/30 dark:bg-black/50 z-30 transition-opacity duration-200 pointer-events-auto"
          onClick={closeMegaMenu}
        />
      )}

      {/* Unified Apple-grade Frosted Glass Header Container - Static blur radius, GPU-accelerated layer */}
      <div
        className={`relative z-40 backdrop-blur-xl transition-colors duration-200 ${
          isMegaOpen
            ? 'bg-white/95 dark:bg-[#090b0e]/95 text-zinc-950 dark:text-white shadow-2xl rounded-b-[28px] border-b border-zinc-200 dark:border-zinc-800 pb-5'
            : 'bg-white/80 dark:bg-[#07080a]/85 border-b border-zinc-200/80 dark:border-zinc-800/80'
        }`}
        style={{ transform: 'translate3d(0,0,0)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar Row */}
          <div className="flex items-center justify-between h-18 sm:h-20">
            {/* 1. Premium Apple-Grade Brand Logo */}
            <div
              className="flex items-center gap-3.5 cursor-pointer group select-none py-2"
              onClick={() => {
                closeMegaMenu();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                if (onRefreshHealth) onRefreshHealth();
              }}
            >
              {/* Bespoke Geometric Nova Star Aperture Emblem */}
              <svg
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 text-zinc-950 dark:text-white transition-transform group-hover:scale-105 duration-300"
                aria-label="Nova Logo"
              >
                {/* 4-Cusped Precision Astroid Geometry */}
                <path
                  d="M20 2C20 11.9411 28.0589 20 38 20C28.0589 20 20 28.0589 20 38C20 28.0589 11.9411 20 2 20C11.9411 20 20 11.9411 20 2Z"
                  fill="currentColor"
                />
                {/* Inner Optical Lens Core with Dynamic Health State */}
                <circle cx="20" cy="20" r="3.6" className="fill-white dark:fill-[#07080a]" />
                <circle
                  cx="20"
                  cy="20"
                  r="1.8"
                  className={isBackendOnline === false ? 'fill-amber-400' : 'fill-emerald-500 dark:fill-[#d4f933]'}
                />
              </svg>

              {/* Prominent Bold Wordmark */}
              <div className="flex items-baseline">
                <span className="font-sans font-black text-2xl sm:text-[26px] tracking-[-0.04em] text-zinc-950 dark:text-white uppercase leading-none">
                  NOVA
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#d4f933] ml-0.5" />
              </div>
            </div>

            {/* 2. Desktop Navigation Tabs (Single-Line, High-Contrast Ergonomics) */}
            <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 font-mono text-xs">
              {/* Category 1: MAKALELER */}
              <button
                type="button"
                onMouseEnter={() => handleMouseEnter('articles')}
                onClick={() => scrollToSection('articles-feed', 'feed')}
                className={`whitespace-nowrap shrink-0 px-4 py-2 rounded-full font-bold transition-all cursor-pointer ${
                  megaMenu === 'articles'
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-md'
                    : activeTab === 'feed'
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-black shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                MAKALELER
              </button>

              {/* Category 2: ÇEKİRDEK */}
              <button
                type="button"
                onMouseEnter={() => handleMouseEnter('system')}
                onClick={() => scrollToSection('modular-architecture-console', 'system')}
                className={`whitespace-nowrap shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-bold transition-all cursor-pointer ${
                  megaMenu === 'system'
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-md'
                    : activeTab === 'system'
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-black shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>ÇEKİRDEK</span>
              </button>

              {/* Category 3: AI & VEKTÖR */}
              <button
                type="button"
                onMouseEnter={() => handleMouseEnter('ai')}
                onClick={() => scrollToSection('ai-vector-studio', 'ai-search')}
                className={`whitespace-nowrap shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-bold transition-all cursor-pointer ${
                  megaMenu === 'ai'
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-md'
                    : activeTab === 'ai-search'
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-black shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>AI & VEKTÖR</span>
              </button>

              {/* Category 4: BATCH & ETL */}
              <button
                type="button"
                onMouseEnter={() => handleMouseEnter('batch')}
                onClick={() => scrollToSection('batch-etl-studio', 'admin-batch')}
                className={`whitespace-nowrap shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-bold transition-all cursor-pointer ${
                  megaMenu === 'batch'
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-md'
                    : activeTab === 'admin-batch'
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-black shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>BATCH & ETL</span>
              </button>
            </nav>

            {/* 3. Right Status & Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Menu Trigger Pill */}
              <button
                type="button"
                onClick={() => setMegaMenu(isMegaOpen ? null : 'articles')}
                className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
                aria-label="Menüyü Aç / Kapat"
              >
                {isMegaOpen ? <ChevronDown className="w-3.5 h-3.5 rotate-180" /> : <Menu className="w-3.5 h-3.5" />}
                <span>{isMegaOpen ? 'KAPAT' : 'MENÜ'}</span>
              </button>

              {/* Architecture Test Pill Button */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenArchitectureConsole) {
                    onOpenArchitectureConsole();
                  } else if (onOpenTelemetry) {
                    onOpenTelemetry();
                  }
                }}
                className="hidden sm:inline-flex items-center gap-2 px-4.5 py-2 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 shadow-sm cursor-pointer whitespace-nowrap bg-zinc-950 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95 btn-tactile"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400 dark:text-zinc-950 fill-current" />
                <span>MİMARİYİ TEST ET</span>
              </button>

              {/* Living Pixel Aquarium Theme Toggle (Sean Galt / Fable Specification) */}
              <AquariumToggle compact compactWidth={72} className="shrink-0" />

              {/* GitHub Repo Link */}
              <a
                href="https://github.com/abdullahberkeozder/my-portfolio"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 p-2 rounded-full transition-all cursor-pointer glass-liquid hover:border-black/20 dark:hover:border-white/20 text-zinc-800 dark:text-zinc-200 btn-tactile"
                title="GitHub Repository"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
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
        </div>
      </div>
    </header>
  );
};
