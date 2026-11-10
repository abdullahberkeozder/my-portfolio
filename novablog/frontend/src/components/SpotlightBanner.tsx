'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

interface SpotlightBannerProps {
  onOpenArchitectureConsole?: () => void;
  onExploreAI?: () => void;
}

export const SpotlightBanner: React.FC<SpotlightBannerProps> = ({
  onOpenArchitectureConsole,
  onExploreAI,
}) => {
  const handleDiscover = () => {
    if (onOpenArchitectureConsole) {
      onOpenArchitectureConsole();
    } else {
      const el = document.getElementById('modular-architecture-console');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('select-console-module', { detail: 'loom' }));
      window.dispatchEvent(new CustomEvent('run-console-simulation'));
    }, 100);
  };

  return (
    <section className="relative w-full bg-[#f3f4f6] dark:bg-zinc-950 text-white overflow-hidden border-b border-black/10 select-none">
      {/* Background Studio Rendering Image (Direct Ride Also TM-Q Screenshot 2 Look) */}
      <div className="relative w-full h-[500px] sm:h-[580px] lg:h-[680px]">
        <Image
          src="/images/hero-tmq.jpg"
          alt="ALSO TM-Q Transcendent Mobility & High-Throughput Architecture"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.92] contrast-[1.02]"
        />

        {/* Ambient Dark Gradient for Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />

        {/* Top Spec Pill Badge */}
        <div className="absolute top-6 left-4 sm:left-8 lg:left-12 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-mono">
          <span className="w-2 h-2 rounded-full bg-[#bef264] shadow-[0_0_8px_#bef264] animate-pulse" />
          <span className="font-bold tracking-widest uppercase text-white">TM-Q // TRANSCENDENT MOBILITY</span>
          <span className="text-white/40">|</span>
          <span className="text-zinc-300">SPRING BOOT 4.1 SPEC</span>
        </div>

        {/* Bottom-Left Overlay Content (Matching Screenshot 2 "TM-Q" Overlay) */}
        <div className="absolute bottom-10 sm:bottom-14 lg:bottom-18 left-4 sm:left-8 lg:left-12 max-w-xl space-y-4">
          <div className="space-y-1">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase drop-shadow-md">
              TM-Q
            </h2>
            <div className="text-xs font-mono font-bold tracking-widest text-[#bef264] uppercase">
              TRANSCENDENT MOBILITY TO FOUR WHEELS
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-200 font-sans leading-relaxed max-w-lg drop-shadow-sm">
            Made to move more. From commercial cargo to precious cargo and bike lanes to city streets, the TM-Q takes Transcendent Mobility to four wheels — powered by Java 22 Loom virtual threads, zero-row-lock caching, and 128D cosine vector search.
          </p>

          {/* Ride Also Lime Volt Green Pill Button: [DISCOVER] (Matching Screenshot 2) */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleDiscover}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#bef264] hover:bg-[#aee64c] text-black text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 shadow-xl shadow-[#bef264]/25 hover:scale-105 active:scale-95 cursor-pointer btn-tactile"
            >
              <span>DISCOVER</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            {onExploreAI && (
              <button
                onClick={onExploreAI}
                className="hidden sm:inline-flex items-center gap-2 px-5 py-3 rounded-full bg-black/70 hover:bg-black text-white border border-white/25 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer backdrop-blur-md hover:scale-105"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#bef264]" />
                <span>MİMARÎ LAB</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
