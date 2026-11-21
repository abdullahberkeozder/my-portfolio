'use client';

import React from 'react';
import {
  Compass,
  Activity,
  ArrowDown,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left Column: Mac OS 9 System Specification Presentation */}
          <div className="space-y-1 max-w-2xl">
            {/* Apple Minimalist Hardware Badge */}
            <div className="mac9-chip-tag !py-0.5 !px-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" />
              <span className="text-zinc-800 dark:text-zinc-200 font-bold uppercase tracking-wider text-[9.5px]">
                NOVA ENGINEERING PUBLICATION &bull; 2026 EDITION
              </span>
            </div>

            {/* Headline with Apple Charcoal & Geneva Aesthetic */}
            <h1 className="text-lg sm:text-xl font-black tracking-normal text-zinc-950 dark:text-white leading-tight font-['Charcoal',sans-serif]">
              System Architecture, Distributed Networks &amp;{' '}
              <span className="text-[#333399] dark:text-[#818CF8]">
                Modern Engineering.
              </span>
            </h1>
            <p className="text-[11.5px] text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed font-['Geneva',sans-serif] line-clamp-1">
              Enterprise systems publication powered by Java 22 Loom virtual threads, PostgreSQL pgvector 128D semantic cosine search, and Redis write-behind buffers.
            </p>
          </div>

          {/* Right Column: Tactile Mac OS 9 Actions & Specification Tags */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
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

            <span className="mac9-chip-tag !text-[9px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Java 22 Loom
            </span>
            <span className="mac9-chip-tag !text-[9px]">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              pgvector 128D
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
