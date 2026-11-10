'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Cpu,
  Database,
  ArrowRight,
  Layers,
  Zap,
  ChevronDown,
  Menu,
  Lock,
  Sparkles,
} from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { LiquidThemeToggle } from './LiquidThemeToggle';

interface NavbarProps {
  activeTab: 'feed' | 'ai-search' | 'ai-lab' | 'admin-batch';
  setActiveTab: (tab: 'feed' | 'ai-search' | 'ai-lab' | 'admin-batch') => void;
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
  onOpenAbout,
}) => {
  const [megaMenu, setMegaMenu] = useState<MegaDrawerCategory>(null);

  const handleNavClick = (cat: MegaDrawerCategory) => {
    if (megaMenu === cat) {
      setMegaMenu(null);
      return;
    }
    setMegaMenu(cat);

    // Synchronize active view smoothly
    if (cat === 'articles') {
      setActiveTab('feed');
    } else if (cat === 'ai') {
      setActiveTab('ai-search');
    } else if (cat === 'batch') {
      setActiveTab('admin-batch');
    } else if (cat === 'system') {
      setActiveTab('feed');
      setTimeout(() => {
        const el = document.getElementById('modular-architecture-console');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  const closeMegaMenu = () => setMegaMenu(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMegaMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectTab = (tab: 'feed' | 'ai-search' | 'ai-lab' | 'admin-batch') => {
    setActiveTab(tab);
    closeMegaMenu();
  };

  const navigateToConsoleModule = (moduleId: string) => {
    setActiveTab('feed');
    closeMegaMenu();
    setTimeout(() => {
      const el = document.getElementById('modular-architecture-console');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      window.dispatchEvent(new CustomEvent('select-console-module', { detail: moduleId }));
    }, 100);
  };

  const handleTestDrive = () => {
    setActiveTab('feed');
    closeMegaMenu();
    setTimeout(() => {
      const el = document.getElementById('modular-architecture-console');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      window.dispatchEvent(new CustomEvent('select-console-module', { detail: 'loom' }));
      window.dispatchEvent(new CustomEvent('run-console-simulation'));
    }, 100);
  };

  const isMegaOpen = megaMenu !== null;

  return (
    <header className="sticky top-0 z-50 transition-all duration-300">
      {/* 1. Ride Also Top Marquee Ticker (Interactive Infinite Loop Lavender / Violet Band) */}
      <div
        onClick={handleTestDrive}
        title="Mimarî Test Drive konsoluna gitmek ve sanal thread simülasyonunu başlatmak için tıklayınız"
        className="bg-[#8c52ff] dark:bg-[#7232e8] text-white py-1.5 text-[11px] font-mono tracking-widest font-semibold uppercase border-b border-black/10 select-none overflow-hidden relative cursor-pointer hover:bg-[#783cf5] transition-colors group"
      >
        <div className="flex animate-marquee whitespace-nowrap">
          {/* First loop track */}
          <div className="flex items-center gap-6 px-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#d4f933] shadow-[0_0_6px_#d4f933] animate-pulse" />
              CANLI MİMARİYİ TEST EDİN
            </span>
            <span className="opacity-40">|</span>
            <span>JAVA 22 LOOM SANAL İŞ PARÇACIKLARI</span>
            <span className="opacity-40">&bull;</span>
            <span>REDIS WRITE-BEHIND ÖNBELLEK</span>
            <span className="opacity-40">&bull;</span>
            <span>YAPAY ZEKA ANLAMSAL ARAMA</span>
            <span className="opacity-40">&bull;</span>
            <span className="text-[#d4f933] font-bold">201/201 OTOMATİK TEST (%100 BAŞARILI)</span>
            <span className="opacity-40">|</span>
            <span>KURUMSAL ŞARTNAME V4.1.1</span>
          </div>
          {/* Second duplicate track for seamless continuous loop */}
          <div className="flex items-center gap-6 px-4" aria-hidden="true">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#d4f933] shadow-[0_0_6px_#d4f933] animate-pulse" />
              CANLI MİMARİYİ TEST EDİN
            </span>
            <span className="opacity-40">|</span>
            <span>JAVA 22 LOOM SANAL İŞ PARÇACIKLARI</span>
            <span className="opacity-40">&bull;</span>
            <span>REDIS WRITE-BEHIND ÖNBELLEK</span>
            <span className="opacity-40">&bull;</span>
            <span>YAPAY ZEKA ANLAMSAL ARAMA</span>
            <span className="opacity-40">&bull;</span>
            <span className="text-[#d4f933] font-bold">201/201 OTOMATİK TEST (%100 BAŞARILI)</span>
            <span className="opacity-40">|</span>
            <span>KURUMSAL ŞARTNAME V4.1.1</span>
          </div>
        </div>
      </div>

      {/* Subtle backdrop overlay when mega menu is open */}
      {isMegaOpen && (
        <div
          className="fixed inset-0 bg-black/45 backdrop-blur-xs z-30 transition-opacity duration-300"
          onClick={closeMegaMenu}
        />
      )}

      {/* 2. Unified Header Container (Seamlessly morphs into Ride Also Lavender Frame when open) */}
      <div
        className={`relative z-40 transition-all duration-300 ${
          isMegaOpen
            ? 'bg-[#8c52ff] dark:bg-[#7232e8] text-white shadow-2xl rounded-b-[28px] sm:rounded-b-[36px] border-b border-black/10 pb-6'
            : 'backdrop-blur-xl bg-white/85 dark:bg-[#07080a]/90 border-b border-black/[0.08] dark:border-white/[0.08]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar Row */}
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo (Bold Grotesque with Period, matching "ALSO.") */}
            <div
              className="flex items-center gap-3 cursor-pointer group select-none"
              onClick={() => {
                handleSelectTab('feed');
                if (onRefreshHealth) onRefreshHealth();
              }}
            >
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center p-[2px] transition-transform group-hover:scale-105 shadow-sm ${
                  isMegaOpen
                    ? 'bg-black/30 border-white/20'
                    : 'bg-zinc-900 dark:bg-zinc-800 border-black/10 dark:border-white/15'
                }`}
              >
                <div className="w-full h-full rounded-[9px] bg-black dark:bg-[#07080a] flex items-center justify-center">
                  <span
                    title={isBackendOnline === false ? 'Sistem: Mock Modu' : 'Sistem: Canlı Spring Boot Motoru Aktif'}
                    className={`w-2.5 h-2.5 rounded-full ${
                      isBackendOnline === false
                        ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                        : 'bg-[#d4f933] shadow-[0_0_8px_#d4f933]'
                    } transition-colors`}
                  />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`font-sans font-black text-xl tracking-tight uppercase ${
                    isMegaOpen ? 'text-white' : 'text-zinc-950 dark:text-white'
                  }`}
                >
                  NOVA<span className={isMegaOpen ? 'text-[#d4f933]' : 'text-[#8c52ff] dark:text-[#a259ff]'}>.</span>
                </span>
                <span
                  className={`text-[10px] font-mono tracking-widest uppercase ${
                    isMegaOpen ? 'text-white/70' : 'text-zinc-500'
                  }`}
                >
                  V4.1.1 SPEC
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs (Direct Ride Also Screenshots 2, 3 & 4 Navigation) */}
            <nav className="hidden md:flex items-center gap-1.5 font-mono text-xs">
              {/* Category 1: MAKALELER */}
              <button
                onClick={() => handleNavClick('articles')}
                className={`px-5 py-2 rounded-full font-bold transition-all cursor-pointer ${
                  megaMenu === 'articles'
                    ? 'bg-[#200e38] text-white shadow-md'
                    : isMegaOpen
                    ? 'text-white/85 hover:text-white hover:bg-black/10'
                    : activeTab === 'feed'
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-black shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                MAKALELER
              </button>

              {/* Category 2: ÇEKİRDEK */}
              <button
                onClick={() => handleNavClick('system')}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-full font-bold transition-all cursor-pointer ${
                  megaMenu === 'system'
                    ? 'bg-[#200e38] text-white shadow-md'
                    : isMegaOpen
                    ? 'text-white/85 hover:text-white hover:bg-black/10'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>ÇEKİRDEK</span>
              </button>

              {/* Category 3: AI & VEKTÖR */}
              <button
                onClick={() => handleNavClick('ai')}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-full font-bold transition-all cursor-pointer ${
                  megaMenu === 'ai'
                    ? 'bg-[#200e38] text-white shadow-md'
                    : isMegaOpen
                    ? 'text-white/85 hover:text-white hover:bg-black/10'
                    : activeTab === 'ai-search' || activeTab === 'ai-lab'
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-black shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>AI & VEKTÖR</span>
              </button>

              {/* Category 4: BATCH & ETL */}
              <button
                onClick={() => handleNavClick('batch')}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-full font-bold transition-all cursor-pointer ${
                  megaMenu === 'batch'
                    ? 'bg-[#200e38] text-white shadow-md'
                    : isMegaOpen
                    ? 'text-white/85 hover:text-white hover:bg-black/10'
                    : activeTab === 'admin-batch'
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-black shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>BATCH & ETL</span>
              </button>
            </nav>

            {/* Right Status & Controls (Ride Also Clean Minimalism) */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Mobile Menu Trigger Pill */}
              <button
                onClick={() => handleNavClick(isMegaOpen ? null : 'articles')}
                className={`md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  isMegaOpen
                    ? 'bg-black/30 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-zinc-800 dark:text-zinc-200'
                }`}
                aria-label="Menüyü Aç / Kapat"
              >
                {isMegaOpen ? <ChevronDown className="w-3.5 h-3.5 rotate-180" /> : <Menu className="w-3.5 h-3.5" />}
                <span>{isMegaOpen ? 'KAPAT' : 'MENÜ'}</span>
              </button>

              {/* Manifesto Button */}
              {onOpenAbout && (
                <button
                  type="button"
                  onClick={onOpenAbout}
                  className={`hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 shadow-sm cursor-pointer ${
                    isMegaOpen
                      ? 'text-white/90 hover:text-white hover:bg-black/10'
                      : 'text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                  title="Mimar Abdullah Berke Özder & Mühendislik Manifestosu"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <span>MANİFESTO</span>
                </button>
              )}

              {/* Ride Also "TEST DRIVE" Pill Button (Screenshots 1, 2, 3, 4) */}
              <button
                onClick={() => {
                  if (onOpenArchitectureConsole) {
                    onOpenArchitectureConsole();
                  } else if (onOpenTelemetry) {
                    onOpenTelemetry();
                  }
                }}
                className={`hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 shadow-sm cursor-pointer btn-tactile ${
                  isMegaOpen
                    ? 'bg-white text-zinc-950 hover:bg-[#d4f933] hover:text-black border-transparent'
                    : 'bg-white dark:bg-zinc-900 border border-black/15 dark:border-white/20 hover:bg-[#d4f933] hover:text-black hover:border-transparent text-zinc-900 dark:text-white'
                }`}
              >
                <Zap className={`w-3.5 h-3.5 ${isMegaOpen ? 'text-[#8c52ff]' : 'text-[#8c52ff] dark:text-[#a259ff]'}`} />
                <span>TEST DRIVE</span>
              </button>

              {/* 2FA / TOTP Security Center Button */}
              <button
                type="button"
                onClick={onOpenTwoFactor}
                className={`flex items-center gap-1.5 p-2 rounded-full transition-all cursor-pointer btn-tactile ${
                  isMegaOpen
                    ? 'bg-black/20 text-white hover:bg-black/40'
                    : 'glass-liquid hover:border-black/20 dark:hover:border-white/20 text-zinc-800 dark:text-zinc-200'
                }`}
                title="2FA / TOTP Güvenlik Protokolü"
              >
                <Lock className="w-4 h-4" />
              </button>

              {/* Kaolti Liquid Glass Theme Switcher */}
              <LiquidThemeToggle />

              {/* GitHub Repo Link */}
              <a
                href="https://github.com/abdullahberkeozder/my-portfolio"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 p-2 rounded-full transition-all cursor-pointer btn-tactile ${
                  isMegaOpen
                    ? 'bg-black/20 text-white hover:bg-black/40'
                    : 'glass-liquid hover:border-black/20 dark:hover:border-white/20 text-zinc-800 dark:text-zinc-200'
                }`}
                title="GitHub Repository"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 3. The Iconic Ride Also Inner White Card (Screenshots 2, 3 & 4) */}
          {isMegaOpen && (
            <div className="mt-2 bg-white dark:bg-[#090b0e] rounded-3xl p-5 sm:p-6 lg:p-8 shadow-2xl border border-black/5 dark:border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start ride-also-drawer-anim text-zinc-900 dark:text-white">
              {/* Mobile Category Switcher (md:hidden) */}
              <div className="md:hidden col-span-1 flex items-center gap-2 overflow-x-auto pb-2 border-b border-black/[0.08] dark:border-white/[0.08] scrollbar-none font-mono text-xs">
                <button
                  onClick={() => handleNavClick('articles')}
                  className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    megaMenu === 'articles'
                      ? 'bg-[#200e38] text-white shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  MAKALELER
                </button>
                <button
                  onClick={() => handleNavClick('system')}
                  className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    megaMenu === 'system'
                      ? 'bg-[#200e38] text-white shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  ÇEKİRDEK
                </button>
                <button
                  onClick={() => handleNavClick('ai')}
                  className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    megaMenu === 'ai'
                      ? 'bg-[#200e38] text-white shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  AI & VEKTÖR
                </button>
                <button
                  onClick={() => handleNavClick('batch')}
                  className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    megaMenu === 'batch'
                      ? 'bg-[#200e38] text-white shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  BATCH & ETL
                </button>
              </div>

              {/* Left Sub-Navigation Menu (Direct Ride Also Monospace Layout) */}
              <div className="lg:col-span-3 space-y-4 border-b lg:border-b-0 lg:border-r border-black/[0.08] dark:border-white/[0.08] pb-6 lg:pb-0 lg:pr-6 font-mono text-xs">
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold tracking-widest uppercase">
                  ALT DİZİN // SPEC
                </div>

                {megaMenu === 'articles' && (
                  <ul className="space-y-3 font-semibold">
                    <li>
                      <button
                        onClick={() => handleSelectTab('feed')}
                        className="text-left font-bold text-zinc-950 dark:text-white hover:text-[#8c52ff] dark:hover:text-[#a259ff] transition-colors cursor-pointer block tracking-wider"
                      >
                        &rarr; TÜM MAKALELER (FEED)
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => navigateToConsoleModule('spring-ai')}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        MİMARİ ÇEKİRDEK
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => navigateToConsoleModule('loom')}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        SPRING BOOT 4.1.1 SPEC
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => navigateToConsoleModule('loom')}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        JAVA 22 LOOM CONCURRENCY
                      </button>
                    </li>
                    <li>
                      <button
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
                        onClick={() => navigateToConsoleModule('spring-ai')}
                        className="text-left font-bold text-[#8c52ff] dark:text-[#a259ff] transition-colors cursor-pointer block tracking-wider"
                      >
                        &rarr; MODULAR SIMULATOR CONSOLE
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => navigateToConsoleModule('loom')}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        LOOM VIRTUAL THREADS HUD
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => navigateToConsoleModule('write-behind')}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        REDIS WRITE-BEHIND BUFFER
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => navigateToConsoleModule('optimistic-locking')}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        JPA OPTIMISTIC LOCKING
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          if (onOpenTwoFactor) onOpenTwoFactor();
                          else if (onOpenTelemetry) onOpenTelemetry();
                          closeMegaMenu();
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
                        onClick={() => handleSelectTab('ai-search')}
                        className="text-left font-bold text-zinc-950 dark:text-white hover:text-[#8c52ff] dark:hover:text-[#a259ff] transition-colors cursor-pointer block tracking-wider"
                      >
                        &rarr; SEMANTİK VEKTÖR ARAMA
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleSelectTab('ai-lab')}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        AI LAB OYUN ALANI
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => navigateToConsoleModule('spring-ai')}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        128D COSINE DİSTANCE
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleSelectTab('ai-lab')}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        AI TOKSİSİTE RADARI
                      </button>
                    </li>
                  </ul>
                )}

                {megaMenu === 'batch' && (
                  <ul className="space-y-3 font-semibold">
                    <li>
                      <button
                        onClick={() => handleSelectTab('admin-batch')}
                        className="text-left font-bold text-zinc-950 dark:text-white hover:text-[#8c52ff] dark:hover:text-[#a259ff] transition-colors cursor-pointer block tracking-wider"
                      >
                        &rarr; SPRING BATCH KONSOLU
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => navigateToConsoleModule('spring-batch')}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        SOFT-DELETE RETENTION PURGE
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleSelectTab('admin-batch')}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        YAZAR ANALİTİK RAPORLAMA
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          if (onOpenTelemetry) onOpenTelemetry();
                          closeMegaMenu();
                        }}
                        className="text-left text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block tracking-wider"
                      >
                        POSTGRES &bull; REDIS TELEMETRİ
                      </button>
                    </li>
                  </ul>
                )}
              </div>

              {/* Right Showcase Cards Grid (Matching Ride Also Screens 2, 3 & 4) */}
              <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Showcase Card 1 */}
                <div className="rounded-2xl border border-black/10 dark:border-white/10 p-5 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col justify-between space-y-4 hover:border-[#8c52ff]/40 transition-all duration-300 group">
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] font-mono text-[#8c52ff] dark:text-[#a259ff] font-bold uppercase tracking-wider mb-1">
                        01 // TRANSPARENT CORE
                      </div>
                      <h4 className="text-xl font-black text-zinc-950 dark:text-white tracking-tight">
                        {megaMenu === 'articles' && 'Java 22 Loom'}
                        {megaMenu === 'system' && 'Şeffaf Motor'}
                        {megaMenu === 'ai' && '128D Vektör'}
                        {megaMenu === 'batch' && 'Batch 5 Chunk'}
                      </h4>
                    </div>

                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900 border border-black/10 dark:border-white/10">
                      <Image
                        src="/images/architecture-cutaway.jpg"
                        alt="Transparent Core Architecture"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover transition-transform group-hover:scale-105 duration-700 ease-out"
                      />
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {megaMenu === 'articles' && '10.000 sanal thread havuzu ile sıfır platform thread kilitlemesi.'}
                      {megaMenu === 'system' && 'Mikroişlemci seviyesinde şeffaf akrilik ve titanyum soğutma tasarımı.'}
                      {megaMenu === 'ai' && 'Cosine mesafesi ile mikrosaniyede semantik içerik eşleştirme.'}
                      {megaMenu === 'batch' && '100\'lük chunk işleyicisi ile veritabanı temizleme ve arşiv.'}
                    </p>
                  </div>

                  {/* Dual-Pill Buttons (Ride Also Style) */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => navigateToConsoleModule(megaMenu === 'batch' ? 'spring-batch' : megaMenu === 'ai' ? 'spring-ai' : 'loom')}
                      className="flex-1 px-4 py-2 rounded-full border border-black/20 dark:border-white/20 bg-white dark:bg-zinc-800 text-xs font-mono font-bold uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-pointer btn-tactile text-center"
                    >
                      İNCELE
                    </button>
                    <button
                      onClick={handleTestDrive}
                      className="flex-1 px-4 py-2 rounded-full bg-black dark:bg-[#d4f933] text-white dark:text-black text-xs font-mono font-bold uppercase hover:opacity-90 transition-all cursor-pointer btn-tactile text-center"
                    >
                      MİMARİYİ İNCELE
                    </button>
                  </div>
                </div>

                {/* Showcase Card 2 */}
                <div className="rounded-2xl border border-black/10 dark:border-white/10 p-5 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col justify-between space-y-4 hover:border-[#8c52ff]/40 transition-all duration-300 group">
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] font-mono text-[#a3c900] dark:text-[#d4f933] font-bold uppercase tracking-wider mb-1">
                        02 // HARDWARE CONSOLE
                      </div>
                      <h4 className="text-xl font-black text-zinc-950 dark:text-white tracking-tight">
                        {megaMenu === 'articles' && 'Write-Behind'}
                        {megaMenu === 'system' && 'Dokunsal Saha'}
                        {megaMenu === 'ai' && 'Toksisite Radarı'}
                        {megaMenu === 'batch' && 'Yazar İstatistik'}
                      </h4>
                    </div>

                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900 border border-black/10 dark:border-white/10">
                      <Image
                        src="/images/terminal-hardware.jpg"
                        alt="Tactile Hardware Terminal"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover transition-transform group-hover:scale-105 duration-700 ease-out"
                      />
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {megaMenu === 'articles' && 'Görüntülenme ve beğeni sayaçlarında sıfır PostgreSQL satır kilitlemesi.'}
                      {megaMenu === 'system' && 'Teenage Engineering ve Dieter Rams tarzı fiziksel donanım konsolu.'}
                      {megaMenu === 'ai' && 'Kullanıcı yorumlarını yayınlanmadan önce denetleyen çok sınıflı AI.'}
                      {megaMenu === 'batch' && 'Tüm yazarların kelime sayısı ve etkileşim metrikleri.'}
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => navigateToConsoleModule(megaMenu === 'ai' ? 'spring-ai' : megaMenu === 'batch' ? 'spring-batch' : 'write-behind')}
                      className="w-full px-4 py-2 rounded-full border border-black/20 dark:border-white/20 bg-white dark:bg-zinc-800 text-xs font-mono font-bold uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-pointer text-center btn-tactile"
                    >
                      KEŞFET
                    </button>
                  </div>
                </div>

                {/* Showcase Card 3 */}
                <div className="rounded-2xl border border-black/10 dark:border-white/10 p-5 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col justify-between space-y-4 hover:border-[#8c52ff]/40 transition-all duration-300 group">
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider mb-1">
                        03 // TEST DRIVE
                      </div>
                      <h4 className="text-xl font-black text-zinc-950 dark:text-white tracking-tight">
                        Canlı Simülatör
                      </h4>
                    </div>

                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900 border border-black/10 dark:border-white/10">
                      <Image
                        src="/images/lifestyle-hero.jpg"
                        alt="Engineering Lifestyle"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover transition-transform group-hover:scale-105 duration-700 ease-out"
                      />
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      Gerçek zamanlı Loom virtual threads rampası ve 409 conflict simülasyonu.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleTestDrive}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#d4f933] text-black text-xs font-mono font-bold uppercase hover:bg-[#c4e82b] transition-all cursor-pointer btn-tactile shadow-sm"
                    >
                      <span>TEST DRIVE BAŞLAT</span>
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
