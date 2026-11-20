'use client';

import React from 'react';
import Image from 'next/image';
import {
  Compass,
  PenSquare,
  Activity,
  ArrowDown,
  Cpu,
  Layers,
  Database,
  ShieldCheck,
  Maximize2,
} from 'lucide-react';
import { playKeyClick, playWindowOpen } from '@/lib/retroAudio';

interface HeroSectionProps {
  onExploreAI?: () => void;
  onOpenCreateModal: () => void;
  onOpenArchitectureConsole?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreAI,
  onOpenCreateModal,
  onOpenArchitectureConsole,
}) => {
  const scrollToFeed = () => {
    playKeyClick('crisp');
    if (onExploreAI) {
      // Keep hook available
    }
    const el = document.getElementById('articles-feed');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExploreAI = () => {
    playKeyClick('crisp');
    if (onExploreAI) {
      onExploreAI();
    } else {
      const el = document.getElementById('ai-vector-studio');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenConsole = () => {
    playKeyClick('crisp');
    if (onOpenArchitectureConsole) {
      onOpenArchitectureConsole();
    } else {
      const el = document.getElementById('modular-architecture-console');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-black/15 dark:border-white/10 select-none bg-gradient-to-b from-[#f8f8fb] via-[#eeeeee] to-[#e4e4e9] dark:from-[#1b1b20] dark:via-[#141418] dark:to-[#0d0d10] transition-colors duration-300">
      {/* Authentic Mac OS X 2010 Pinstripe Texture Overlay */}
      <div className="absolute inset-0 ios-pinstripe opacity-25 pointer-events-none" />

      {/* Subtle Studio Glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 lg:pt-8 lg:pb-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          
          {/* Left Column: Mac OS X Editorial Presentation (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Apple Minimalist Hardware Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
              <span className="text-zinc-800 dark:text-zinc-200 font-bold uppercase tracking-wider text-[11px]">
                NOVA MÜHENDİSLİK YAYINI
              </span>
              <span className="text-zinc-400 font-normal hidden sm:inline">&bull;</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold text-[11px] hidden sm:inline">
                Java 22 Loom &amp; Spring AI
              </span>
            </div>

            {/* Headline with Letterpress Aesthetic */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.15] font-sans drop-shadow-xs">
                Sistem Mimarisi, Dağıtık Ağlar ve{' '}
                <span className="text-blue-600 dark:text-blue-400 underline decoration-blue-500/30 underline-offset-4">
                  Modern Mühendislik.
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-xl leading-relaxed font-sans">
                Java 22 Loom sanal iş parçacıkları, PostgreSQL pgvector 128 boyutlu anlamsal kosinüs uzayı ve Redis Write-Behind tamponu ile
                güçlendirilmiş kurumsal bağımsız mühendislik yayını.
              </p>
            </div>

            {/* Tactile Action Buttons: 2 Clear Hierarchical Controls (Decision Paralysis Free) */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* Primary: Apple Aqua Button (Feed Exploration) - Single Primary Focus */}
              <button
                type="button"
                onClick={scrollToFeed}
                className="mac-aqua-btn-primary mac-aqua-btn-lg flex items-center gap-2.5 !text-xs font-black shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer"
                title="Yayın akışına kaydır (Makaleleri Keşfet)"
              >
                <Compass className="w-4 h-4 text-white" />
                <span>Makaleleri Keşfet</span>
                <ArrowDown className="w-3.5 h-3.5 opacity-90" />
              </button>

              {/* Secondary: Architecture & Telemetry Console */}
              <button
                type="button"
                onClick={handleOpenConsole}
                className="mac-btn-aluminum mac-aqua-btn-lg flex items-center gap-2 !text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer"
                title="Activity Monitor & Donanım Telemetrisi konsoluna git"
              >
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Mimari &amp; Telemetri</span>
              </button>
            </div>

            {/* Hardware Architecture Specification Strip (Minimalist Single-Line Monospaced Spec) */}
            <div className="pt-2">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
                <span className="font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  MİMARİ:
                </span>
                <span className="inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Java 22 Loom
                </span>
                <span className="text-zinc-400 dark:text-zinc-600">&bull;</span>
                <span className="inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  pgvector 128D
                </span>
                <span className="text-zinc-400 dark:text-zinc-600">&bull;</span>
                <span className="inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Redis Write-Behind
                </span>
                <span className="text-zinc-400 dark:text-zinc-600">&bull;</span>
                <span className="inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  RFC 7807 2FA
                </span>
              </div>
            </div>
          </div>

          {/* Right Column:  Apple Cinema Display / Mac Window Chassis Showcase (5 cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-gradient-to-b from-[#e8e8ec] to-[#dcdce0] dark:from-[#26262a] dark:to-[#1a1a1e] border border-black/20 dark:border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col group">
              
              {/* Mac Window Chrome Titlebar */}
              <div className="h-8 bg-gradient-to-b from-[#f2f2f5] to-[#d8d8de] dark:from-[#323236] dark:to-[#222226] px-3.5 flex items-center justify-between border-b border-black/15 dark:border-black/60 select-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] border border-[#e0443e] shadow-inner" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e] border border-[#d89e24] shadow-inner" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28c840] border border-[#1aab29] shadow-inner" />
                </div>

                <span className="text-[11px] font-mono font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">
                  Nova_Architecture_Core.spec
                </span>

                <span className="text-[9px] font-mono text-zinc-400 bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded border border-black/5 dark:border-white/5">
                  v4.1.1
                </span>
              </div>

              {/* Viewport Screen */}
              <div className="relative aspect-[16/10] bg-black overflow-hidden cursor-pointer" onClick={handleOpenConsole}>
                <Image
                  src="/images/architecture-cutaway.jpg"
                  alt="Nova Sistem Mimarisi Şeması"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                  loading="eager"
                />

                {/* Subtle CRT Scanline Sheen */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                {/* Top Corner Live Status Pill */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                  <span>KONSOL AKTİF</span>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-3 inset-x-3 flex items-end justify-between z-10 pointer-events-none">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-blue-400 font-bold block uppercase tracking-wider">
                      CANLI MİMARİ TELEMETRİSİ
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-white drop-shadow-md">
                      Java 22 Loom &amp; pgvector Çekirdeği
                    </h3>
                  </div>

                  <span className="px-2 py-1 rounded bg-black/80 border border-white/20 text-[10px] font-mono text-zinc-300 font-bold flex items-center gap-1">
                    <span>Aç</span>
                    <Maximize2 className="w-2.5 h-2.5 text-blue-400" />
                  </span>
                </div>
              </div>

              {/* Bottom Bezel Strip */}
              <div className="p-3 bg-gradient-to-b from-[#e2e2e6] to-[#d4d4da] dark:from-[#222226] dark:to-[#18181c] border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>201/201 OTOMATİK TEST // %100 BAŞARI</span>
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  SUB-MS P99 LATENCY
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
