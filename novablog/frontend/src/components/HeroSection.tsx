'use client';

import React from 'react';

interface HeroSectionProps {
  onExploreAI?: () => void;
  onOpenCreateModal?: () => void;
  onOpenArchitectureConsole?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = () => {
  return (
    <section className="relative overflow-hidden border-b border-[#808080] dark:border-[#2C2E35] select-none bg-[#ECECEC] dark:bg-[#1A1C21] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 relative z-10">
        <div className="space-y-0.5">
          {/* Headline with Apple Charcoal & Geneva Aesthetic */}
          <h1 className="text-lg sm:text-xl font-black tracking-normal text-zinc-950 dark:text-white leading-tight font-['Charcoal',sans-serif]">
            System Architecture, Distributed Networks &amp;{' '}
            <span className="text-[#333399] dark:text-[#818CF8]">
              Modern Engineering.
            </span>
          </h1>
          <p className="text-[11.5px] text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed font-['Geneva',sans-serif]">
            Enterprise systems publication powered by Java 22 Loom virtual threads, PostgreSQL pgvector 128D semantic cosine search, and Redis write-behind buffers.
          </p>
        </div>
      </div>
    </section>
  );
};
