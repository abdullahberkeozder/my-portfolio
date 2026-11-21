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
    <section className="relative overflow-hidden border-b border-[#808080] dark:border-[#2C2E35] select-none bg-[#ECECEC] dark:bg-[#1A1C21] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center">
          
          {/* Left Column: Mac OS 9 System Specification Presentation (7 cols) */}
          <div className="lg:col-span-7 space-y-2.5">
            {/* Apple Minimalist Hardware Badge */}
            <div className="mac9-chip-tag !py-0.5 !px-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" />
              <span className="text-zinc-800 dark:text-zinc-200 font-bold uppercase tracking-wider text-[10px]">
                NOVA ENGINEERING DISPATCH
              </span>
              <span className="text-zinc-400 font-normal hidden sm:inline">&bull;</span>
              <span className="text-[#333399] dark:text-blue-400 font-semibold text-[10px] hidden sm:inline">
                Java 22 Loom &amp; Spring AI
              </span>
            </div>

            {/* Headline with Apple Charcoal & Geneva Aesthetic */}
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl lg:text-[26px] font-black tracking-normal text-zinc-950 dark:text-white leading-[1.2] font-['Charcoal',sans-serif]">
                System Architecture, Distributed Networks &amp;{' '}
                <span className="text-[#333399] dark:text-[#818CF8]">
                  Modern Engineering.
                </span>
              </h1>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 max-w-xl leading-relaxed font-['Geneva',sans-serif] line-clamp-2">
                Enterprise systems publication powered by Java 22 Loom virtual threads, PostgreSQL pgvector 128D semantic cosine search, and Redis write-behind buffers.
              </p>
            </div>

            {/* Tactile Mac OS 9 Actions & Specification Tags (Unified single row) */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={scrollToFeed}
                className="mac9-btn flex items-center gap-1.5 !px-3 !py-1 !text-[11px] font-['Charcoal',sans-serif] font-bold cursor-pointer text-[#262626] dark:text-[#EEEEEE]"
                title="Scroll to articles feed"
              >
                <Compass className="w-3 h-3 text-[#333399] dark:text-blue-400" />
                <span>Explore Articles</span>
                <ArrowDown className="w-2.5 h-2.5 opacity-75" />
              </button>

              <button
                type="button"
                onClick={handleOpenConsole}
                className="mac9-btn flex items-center gap-1.5 !px-3 !py-1 !text-[11px] font-['Charcoal',sans-serif] font-bold cursor-pointer text-[#262626] dark:text-[#EEEEEE]"
                title="Open Architecture & Telemetry Console"
              >
                <Activity className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Architecture Lab</span>
              </button>

              <div className="h-4 w-px bg-[#B0B0B0] dark:bg-[#333742] hidden sm:block mx-0.5" />

              <span className="mac9-chip-tag !text-[9.5px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Java 22 Loom
              </span>
              <span className="mac9-chip-tag !text-[9.5px]">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                pgvector 128D
              </span>
              <span className="mac9-chip-tag !text-[9.5px]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Redis Cache
              </span>
            </div>
          </div>

          {/* Right Column: Mac OS 9 Pinstripe Window Chassis (5 cols) */}
          <div className="lg:col-span-5">
            <div className="mac9-section-panel overflow-hidden flex flex-col group">
              
              {/* Mac OS 9 Pinstripe Mini Titlebar */}
              <div className="mac9-mini-titlebar">
                {/* Classic Square Close Box */}
                <div
                  className="mac9-mini-close-box cursor-pointer"
                  onClick={handleOpenConsole}
                  title="Close Window"
                />

                <span className="text-[10px] font-['Charcoal',sans-serif] font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">
                  Nova_Architecture_Core.spec
                </span>

                {/* Classic Zoom / Collapse Box */}
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 bg-[#CCCCCC] dark:bg-[#2E313A] border border-[#262626] dark:border-[#101115] shadow-[inset_1px_1px_0_#FFF,inset_-1px_-1px_0_#808080]" />
                  <span className="text-[9px] font-mono text-zinc-600 dark:text-zinc-400 px-1 bg-[#DDDDDD] dark:bg-[#1E2025] border border-[#808080] dark:border-[#333]">
                    v4.1.1
                  </span>
                </div>
              </div>

              {/* Viewport Screen */}
              <div className="relative aspect-[16/9] bg-black overflow-hidden cursor-pointer" onClick={handleOpenConsole}>
                <Image
                  src="/images/architecture-cutaway.jpg"
                  alt="Nova System Architecture Schematic"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                  loading="eager"
                />

                {/* Subtle CRT Scanline Sheen */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                {/* Top Corner Live Status Pill */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[9.5px] font-mono font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                  <span>CONSOLE ONLINE</span>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-2 inset-x-2.5 flex items-end justify-between z-10 pointer-events-none">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-blue-400 font-bold block uppercase tracking-wider">
                      LIVE ARCHITECTURE TELEMETRY
                    </span>
                    <h3 className="text-xs font-bold text-white drop-shadow-md">
                      Java 22 Loom &amp; pgvector Core
                    </h3>
                  </div>

                  <span className="px-1.5 py-0.5 rounded bg-black/80 border border-white/20 text-[9px] font-mono text-zinc-300 font-bold flex items-center gap-1">
                    <span>Inspect</span>
                    <Maximize2 className="w-2.5 h-2.5 text-blue-400" />
                  </span>
                </div>
              </div>

              {/* Bottom Bezel Strip */}
              <div className="p-2 bg-gradient-to-b from-[#e2e2e6] to-[#d4d4da] dark:from-[#222226] dark:to-[#18181c] border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[9.5px] font-mono text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>201/201 TESTS // 100% PASSED</span>
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  SUB-MS P99
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
