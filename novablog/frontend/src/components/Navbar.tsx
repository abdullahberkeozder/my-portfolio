'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Cpu,
  Database,
  Server,
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowRight,
  ChevronDown,
  X,
  Layers,
  Zap,
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
}

type MegaDrawerCategory = 'articles' | 'system' | 'ai' | 'batch' | null;

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isBackendOnline,
  onRefreshHealth,
  onOpenTelemetry,
  onOpenArchitectureConsole,
}) => {
  const [megaMenu, setMegaMenu] = useState<MegaDrawerCategory>(null);

  const toggleMegaMenu = (cat: MegaDrawerCategory) => {
    setMegaMenu((prev) => (prev === cat ? null : cat));
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

  return (
    <header className="sticky top-0 z-50 transition-colors duration-300">
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
              BOOK A TEST DRIVE
            </span>
            <span className="opacity-40">|</span>
            <span>JAVA 22 LOOM VIRTUAL THREADS</span>
            <span className="opacity-40">&bull;</span>
            <span>REDIS WRITE-BEHIND ACTIVE (30S DB FLUSH)</span>
            <span className="opacity-40">&bull;</span>
            <span>SPRING AI 128D COSINE VECTOR SEARCH</span>
            <span className="opacity-40">&bull;</span>
            <span className="text-[#d4f933] font-bold">201/201 AUTOMATED TESTS PASSING (100%)</span>
            <span className="opacity-40">|</span>
            <span>ENTERPRISE SPEC V4.1.1</span>
          </div>
          {/* Second duplicate track for seamless continuous loop */}
          <div className="flex items-center gap-6 px-4" aria-hidden="true">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#d4f933] shadow-[0_0_6px_#d4f933] animate-pulse" />
              BOOK A TEST DRIVE
            </span>
            <span className="opacity-40">|</span>
            <span>JAVA 22 LOOM VIRTUAL THREADS</span>
            <span className="opacity-40">&bull;</span>
            <span>REDIS WRITE-BEHIND ACTIVE (30S DB FLUSH)</span>
            <span className="opacity-40">&bull;</span>
            <span>SPRING AI 128D COSINE VECTOR SEARCH</span>
            <span className="opacity-40">&bull;</span>
            <span className="text-[#d4f933] font-bold">201/201 AUTOMATED TESTS PASSING (100%)</span>
            <span className="opacity-40">|</span>
            <span>ENTERPRISE SPEC V4.1.1</span>
          </div>
        </div>
      </div>

      {/* 2. Primary Navigation Bar */}
      <div className="backdrop-blur-xl bg-white/85 dark:bg-[#07080a]/90 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo (Bold Grotesque with Period, matching "ALSO.") */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => handleSelectTab('feed')}
            >
              <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-800 border border-black/10 dark:border-white/15 flex items-center justify-center p-[2px] transition-transform group-hover:scale-105 shadow-sm">
                <div className="w-full h-full rounded-[9px] bg-black dark:bg-[#07080a] flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d4f933] shadow-[0_0_8px_#d4f933]" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-sans font-black text-xl tracking-tight text-zinc-950 dark:text-white uppercase">
                  NOVA<span className="text-[#8c52ff] dark:text-[#a259ff]">.</span>
                </span>
                <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                  TM-B SPEC
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs (Interactive Mega-Menu Triggers) */}
            <nav className="hidden md:flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900/90 p-1 rounded-full border border-black/[0.08] dark:border-white/[0.08] shadow-inner text-xs font-mono">
              <button
                onClick={() => toggleMegaMenu('articles')}
                className={`flex items-center gap-1 px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                  megaMenu === 'articles' || (activeTab === 'feed' && !megaMenu)
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-black shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <span>MAKALELER</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${megaMenu === 'articles' ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={() => toggleMegaMenu('system')}
                className={`flex items-center gap-1 px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                  megaMenu === 'system'
                    ? 'bg-[#8c52ff] text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>ÇEKİRDEK</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${megaMenu === 'system' ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={() => toggleMegaMenu('ai')}
                className={`flex items-center gap-1 px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                  megaMenu === 'ai' || (activeTab === 'ai-search' && !megaMenu) || (activeTab === 'ai-lab' && !megaMenu)
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-black shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>AI & VEKTÖR</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${megaMenu === 'ai' ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={() => toggleMegaMenu('batch')}
                className={`flex items-center gap-1 px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                  megaMenu === 'batch' || (activeTab === 'admin-batch' && !megaMenu)
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-black shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>BATCH & ETL</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${megaMenu === 'batch' ? 'rotate-180' : ''}`} />
              </button>
            </nav>

            {/* Right Status & Controls (Ride Also Dual-Pill & Icons) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Ride Also "TEST DRIVE" Pill Button */}
              <button
                onClick={() => {
                  if (onOpenArchitectureConsole) {
                    onOpenArchitectureConsole();
                  } else if (onOpenTelemetry) {
                    onOpenTelemetry();
                  }
                }}
                className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/15 dark:border-white/20 bg-white dark:bg-zinc-900 hover:bg-[#d4f933] hover:text-black hover:border-transparent text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 shadow-sm cursor-pointer btn-tactile"
              >
                <Zap className="w-3.5 h-3.5 text-[#8c52ff] dark:text-[#a259ff] group-hover:text-black" />
                <span>TEST DRIVE</span>
              </button>

              {/* Kaolti Liquid Glass Theme Switcher */}
              <LiquidThemeToggle />

              {/* Telemetry Modal Button */}
              {onOpenTelemetry && (
                <button
                  onClick={onOpenTelemetry}
                  title="Sistem Telemetrisi ve Canlı Mimari"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all border border-black/10 dark:border-white/10 bg-zinc-900/5 dark:bg-zinc-900 hover:border-[#d4f933]/50 text-zinc-800 dark:text-zinc-200 cursor-pointer btn-tactile"
                >
                  <Activity className="w-3.5 h-3.5 text-[#a3c900] dark:text-[#d4f933] animate-pulse" />
                  <span className="hidden sm:inline font-bold">TELEMETRİ</span>
                </button>
              )}

              {/* Backend Health Badge */}
              <button
                onClick={onRefreshHealth}
                title="Backend Durumu (Tıklayarak sorgulayın)"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all border border-black/10 dark:border-white/10 bg-zinc-900/5 dark:bg-zinc-900 hover:border-black/20 dark:hover:border-white/20 cursor-pointer btn-tactile"
              >
                <Server className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                {isBackendOnline === true ? (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    :5555
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                    <AlertCircle className="w-3 h-3" />
                    DEMO
                  </span>
                )}
              </button>

              {/* GitHub Repo Link */}
              <a
                href="https://github.com/abdullahberkeozder/my-portfolio"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 p-2 rounded-full glass-liquid hover:border-black/20 dark:hover:border-white/20 text-zinc-800 dark:text-zinc-200 transition-all cursor-pointer btn-tactile"
                title="GitHub Repository"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 3. The Iconic Ride Also Interactive Lavender Mega-Drawer with Backdrop Overlay */}
      {megaMenu && (
        <>
          {/* Subtle backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity duration-300"
            onClick={closeMegaMenu}
          />
          <div className="relative z-50 bg-[#8c52ff] dark:bg-[#7232e8] p-3 sm:p-5 lg:p-6 shadow-2xl border-b border-black/10 ride-also-drawer-anim">
            <div className="max-w-7xl mx-auto">
              {/* Top drawer control bar */}
              <div className="flex items-center justify-between pb-3 text-white">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-black/30 backdrop-blur-md">
                    {megaMenu === 'articles' && '01 // MAKALELER & YAYINLAR'}
                    {megaMenu === 'system' && '02 // MİMARİ ÇEKİRDEK & DONANIM'}
                    {megaMenu === 'ai' && '03 // SPRING AI VEKTÖR LABORATUVARI'}
                    {megaMenu === 'batch' && '04 // BATCH & ETL OTOMASYONU'}
                  </span>
                  <span className="text-[11px] font-mono text-white/80 hidden sm:inline">
                    RIDE ALSO INDUSTRIAL INTERFACE V4.1
                  </span>
                </div>
                <button
                  onClick={closeMegaMenu}
                  className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer btn-tactile"
                  title="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Inner White / Dark Slate Card (Direct Ride Also Look) */}
              <div className="bg-white dark:bg-[#090b0e] rounded-3xl p-6 lg:p-8 shadow-xl border border-black/5 dark:border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Sub-Navigation Menu (Monospace uppercase links) */}
                <div className="lg:col-span-3 space-y-4 border-b lg:border-b-0 lg:border-r border-black/[0.08] dark:border-white/[0.08] pb-6 lg:pb-0 lg:pr-6 font-mono text-xs">
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold tracking-widest uppercase">
                    ALT MODÜLLER
                  </div>

                  {megaMenu === 'articles' && (
                    <ul className="space-y-2.5">
                      <li>
                        <button
                          onClick={() => handleSelectTab('feed')}
                          className="text-left font-bold text-zinc-950 dark:text-white hover:text-[#8c52ff] dark:hover:text-[#a259ff] transition-colors cursor-pointer block"
                        >
                          &rarr; TÜM MAKALELER (FEED)
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => navigateToConsoleModule('spring-ai')}
                          className="text-left text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block"
                        >
                          SİSTEM MİMARİSİ
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => navigateToConsoleModule('loom')}
                          className="text-left text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block"
                        >
                          SPRING BOOT 4.1.1
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => navigateToConsoleModule('loom')}
                          className="text-left text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block"
                        >
                          JAVA 22 LOOM CONCURRENCY
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => navigateToConsoleModule('write-behind')}
                          className="text-left text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block"
                        >
                          REDIS WRITE-BEHIND BUFFER
                        </button>
                      </li>
                    </ul>
                  )}

                  {megaMenu === 'system' && (
                    <ul className="space-y-2.5">
                      <li>
                        <button
                          onClick={() => navigateToConsoleModule('spring-ai')}
                          className="text-left font-bold text-[#8c52ff] dark:text-[#a259ff] transition-colors cursor-pointer block"
                        >
                          &rarr; MODULAR SIMULATOR CONSOLE
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => navigateToConsoleModule('loom')}
                          className="text-left text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block"
                        >
                          LOOM VIRTUAL THREADS HUD
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => navigateToConsoleModule('write-behind')}
                          className="text-left text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block"
                        >
                          REDIS WRITE-BEHIND BUFFER
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => navigateToConsoleModule('optimistic-locking')}
                          className="text-left text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block"
                        >
                          JPA OPTIMISTIC LOCKING
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            if (onOpenTelemetry) onOpenTelemetry();
                            closeMegaMenu();
                          }}
                          className="text-left text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block"
                        >
                          2FA TOTP ENROLLMENT
                        </button>
                      </li>
                    </ul>
                  )}

                  {megaMenu === 'ai' && (
                    <ul className="space-y-2.5">
                      <li>
                        <button
                          onClick={() => handleSelectTab('ai-search')}
                          className="text-left font-bold text-zinc-950 dark:text-white hover:text-[#8c52ff] dark:hover:text-[#a259ff] transition-colors cursor-pointer block"
                        >
                          &rarr; SEMANTİK VEKTÖR ARAMA
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleSelectTab('ai-lab')}
                          className="text-left text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block"
                        >
                          AI LAB OYUN ALANI
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => navigateToConsoleModule('spring-ai')}
                          className="text-left text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block"
                        >
                          128D COSINE DİSTANCE PROJECTION
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleSelectTab('ai-lab')}
                          className="text-left text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block"
                        >
                          AI TOKSİSİTE RADARI
                        </button>
                      </li>
                    </ul>
                  )}

                  {megaMenu === 'batch' && (
                    <ul className="space-y-2.5">
                      <li>
                        <button
                          onClick={() => handleSelectTab('admin-batch')}
                          className="text-left font-bold text-zinc-950 dark:text-white hover:text-[#8c52ff] dark:hover:text-[#a259ff] transition-colors cursor-pointer block"
                        >
                          &rarr; SPRING BATCH KONSOLU
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => navigateToConsoleModule('spring-batch')}
                          className="text-left text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block"
                        >
                          SOFT-DELETE RETENTION PURGE
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleSelectTab('admin-batch')}
                          className="text-left text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block"
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
                          className="text-left text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer block"
                        >
                          POSTGRES &bull; REDIS L2 TELEMETRİ
                        </button>
                      </li>
                    </ul>
                  )}
                </div>

                {/* Right Content Showcase Cards Grid (Matching Ride Also Screens 2, 3 & 4) */}
                <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Showcase Card 1 */}
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col justify-between space-y-4 hover:border-[#8c52ff]/40 transition-all duration-300">
                    <div className="space-y-2.5">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900">
                        <Image
                          src="/images/architecture-cutaway.jpg"
                          alt="Transparent Core Architecture"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                          className="object-cover transition-transform hover:scale-105 duration-700 ease-out"
                        />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-[#8c52ff] dark:text-[#a259ff] font-bold uppercase tracking-wider">
                          HARDWARE CORE // TM-B
                        </div>
                        <h4 className="text-base font-black text-zinc-950 dark:text-white">
                          {megaMenu === 'articles' && 'Java 22 Loom Threads'}
                          {megaMenu === 'system' && 'Şeffaf Çekirdek Motoru'}
                          {megaMenu === 'ai' && '128D Vektör Projeksiyonu'}
                          {megaMenu === 'batch' && 'Spring Batch 5 Chunk'}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                          {megaMenu === 'articles' && '10.000 sanal thread ile sıfır platform thread blokeleme mimarisi.'}
                          {megaMenu === 'system' && 'Mikroişlemci seviyesinde şeffaf akrilik ve titanyum soğutma tasarımı.'}
                          {megaMenu === 'ai' && 'Cosine mesafesi ile mikrosaniyede semantik içerik eşleştirme.'}
                          {megaMenu === 'batch' && '100\'lük chunk işleyicisi ile veritabanı temizleme ve arşiv.'}
                        </p>
                      </div>
                    </div>

                    {/* Dual-Pill Buttons (Ride Also Style) */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => navigateToConsoleModule(megaMenu === 'batch' ? 'spring-batch' : megaMenu === 'ai' ? 'spring-ai' : 'loom')}
                        className="px-4 py-2 rounded-full border border-black/20 dark:border-white/20 bg-white dark:bg-zinc-800 text-xs font-mono font-bold uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-pointer btn-tactile"
                      >
                        İNCELE
                      </button>
                      <button
                        onClick={() => {
                          if (onOpenTelemetry) onOpenTelemetry();
                          closeMegaMenu();
                        }}
                        className="px-4 py-2 rounded-full bg-black dark:bg-[#d4f933] text-white dark:text-black text-xs font-mono font-bold uppercase hover:opacity-90 transition-all cursor-pointer btn-tactile"
                      >
                        REZERVE ET
                      </button>
                    </div>
                  </div>

                  {/* Showcase Card 2 */}
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col justify-between space-y-4 hover:border-[#8c52ff]/40 transition-all duration-300">
                    <div className="space-y-2.5">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900">
                        <Image
                          src="/images/terminal-hardware.jpg"
                          alt="Tactile Hardware Terminal"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                          className="object-cover transition-transform hover:scale-105 duration-700 ease-out"
                        />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-[#a3c900] dark:text-[#d4f933] font-bold uppercase tracking-wider">
                          TACTILE TERMINAL
                        </div>
                        <h4 className="text-base font-black text-zinc-950 dark:text-white">
                          {megaMenu === 'articles' && 'Redis Write-Behind'}
                          {megaMenu === 'system' && 'Dokunsal Saha Terminali'}
                          {megaMenu === 'ai' && 'AI Toksisite Radarı'}
                          {megaMenu === 'batch' && 'Yazar İstatistikleri'}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                          {megaMenu === 'articles' && 'Görüntülenme ve beğeni sayaçlarında sıfır DB satır kilitlemesi.'}
                          {megaMenu === 'system' && 'Teenage Engineering ve Dieter Rams tarzı fiziksel donanım konsolu.'}
                          {megaMenu === 'ai' && 'Kullanıcı yorumlarını yayınlanmadan önce denetleyen çok sınıflı AI.'}
                          {megaMenu === 'batch' && 'Tüm yazarların kelime sayısı ve etkileşim metrikleri.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => navigateToConsoleModule(megaMenu === 'ai' ? 'spring-ai' : megaMenu === 'batch' ? 'spring-batch' : 'write-behind')}
                        className="w-full px-4 py-2 rounded-full border border-black/20 dark:border-white/20 bg-white dark:bg-zinc-800 text-xs font-mono font-bold uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-pointer text-center btn-tactile"
                      >
                        KEŞFET
                      </button>
                    </div>
                  </div>

                  {/* Showcase Card 3 */}
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col justify-between space-y-4 hover:border-[#8c52ff]/40 transition-all duration-300">
                    <div className="space-y-2.5">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900">
                        <Image
                          src="/images/lifestyle-hero.jpg"
                          alt="Engineering Lifestyle"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                          className="object-cover transition-transform hover:scale-105 duration-700 ease-out"
                        />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider">
                          TEST DRIVE & COMMUNITY
                        </div>
                        <h4 className="text-base font-black text-zinc-950 dark:text-white">
                          Mimari Canlı Test
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                          Gerçek zamanlı Loom virtual threads rampası ve 409 conflict simülasyonu.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={handleTestDrive}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#d4f933] text-black text-xs font-mono font-bold uppercase hover:bg-[#c4e82b] transition-all cursor-pointer btn-tactile"
                      >
                        <span>TEST DRIVE BAŞLAT</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 4. Mobile Navigation Row */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-black/[0.08] dark:border-white/[0.08] text-xs font-mono bg-white/90 dark:bg-[#07080a]/90">
        <button
          onClick={() => handleSelectTab('feed')}
          className={`px-2 py-1 rounded-full ${activeTab === 'feed'
            ? 'bg-zinc-950 dark:bg-white text-white dark:text-black font-bold'
            : 'text-zinc-600 dark:text-zinc-400'
            }`}
        >
          Vitrin
        </button>
        <button
          onClick={() => handleSelectTab('ai-search')}
          className={`px-2 py-1 rounded-full ${activeTab === 'ai-search'
            ? 'bg-zinc-950 dark:bg-white text-white dark:text-black font-bold'
            : 'text-zinc-600 dark:text-zinc-400'
            }`}
        >
          Vektör
        </button>
        <button
          onClick={() => handleSelectTab('ai-lab')}
          className={`px-2 py-1 rounded-full ${activeTab === 'ai-lab'
            ? 'bg-zinc-950 dark:bg-white text-white dark:text-black font-bold'
            : 'text-zinc-600 dark:text-zinc-400'
            }`}
        >
          AI Lab
        </button>
        <button
          onClick={() => handleSelectTab('admin-batch')}
          className={`px-2 py-1 rounded-full ${activeTab === 'admin-batch'
            ? 'bg-zinc-950 dark:bg-white text-white dark:text-black font-bold'
            : 'text-zinc-600 dark:text-zinc-400'
            }`}
        >
          Batch
        </button>
        {onOpenTelemetry && (
          <button
            onClick={onOpenTelemetry}
            className="px-2 py-1 text-[#a3c900] dark:text-[#d4f933] font-bold"
          >
            Telemetri
          </button>
        )}
      </div>
    </header>
  );
};
