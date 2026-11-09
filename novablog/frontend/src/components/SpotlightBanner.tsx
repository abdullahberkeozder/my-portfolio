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
    <section className="relative w-full bg-zinc-950 text-white overflow-hidden border-b border-black/10 select-none">
      {/* Background Studio Rendering Image (Direct Ride Also Screenshot 2 Look) */}
      <div className="relative w-full h-[460px] sm:h-[540px] lg:h-[620px]">
        <Image
          src="/images/lifestyle-hero.jpg"
          alt="Nova TM-B Architecture Spotlight"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.85] contrast-[1.05]"
        />

        {/* Ambient Dark Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        {/* Top Spec Pill Badge */}
        <div className="absolute top-6 left-4 sm:left-8 lg:left-12 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-mono">
          <span className="w-2 h-2 rounded-full bg-[#d4f933] shadow-[0_0_8px_#d4f933] animate-pulse" />
          <span className="font-bold tracking-widest uppercase text-white">TM-B SPECIFICATION</span>
          <span className="text-white/40">|</span>
          <span className="text-zinc-300">201/201 AUTOMATED TESTS</span>
        </div>

        {/* Bottom-Left Overlay Content (Matching Screenshot 2 "TM-Q" Overlay) */}
        <div className="absolute bottom-10 sm:bottom-14 lg:bottom-18 left-4 sm:left-8 lg:left-12 max-w-xl space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold tracking-widest text-[#d4f933] uppercase">
              HIGH-THROUGHPUT ENGINE //
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase">
              TM-B CORE.
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed max-w-lg">
            Java 22 Project Loom ile 10.000 sanal thread havuzu, 128 boyutlu Spring AI kosinüs vektör arama motoru ve Redis Write-Behind tamponu. Tomcat OS blokeleme darboğazını geride bırakan endüstriyel mimari.
          </p>

          {/* Ride Also Neon Volt Green Pill Button: [DISCOVER] */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleDiscover}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#d4f933] hover:bg-[#c4e82b] text-black text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 shadow-xl shadow-[#d4f933]/20 hover:scale-105 active:scale-95 cursor-pointer btn-tactile"
            >
              <span>DISCOVER</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onExploreAI && (
              <button
                onClick={onExploreAI}
                className="hidden sm:inline-flex items-center gap-2 px-5 py-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer backdrop-blur-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#a855f7]" />
                <span>VEKTÖR LAB</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
