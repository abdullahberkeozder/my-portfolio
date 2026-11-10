'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, Sparkles, Terminal } from 'lucide-react';

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
      {/* Background Architectural Core Engine Cutaway */}
      <div className="relative w-full h-[520px] sm:h-[600px] lg:h-[660px]">
        <Image
          src="/images/architecture-cutaway.jpg"
          alt="Nova Core 4.1 High-Throughput Distributed Architecture"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.88] contrast-[1.08]"
        />

        {/* Ambient Dark Gradient for Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent pointer-events-none" />

        {/* Top Spec Pill Badge */}
        <div className="absolute top-6 left-4 sm:left-8 lg:left-12 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[11px] font-mono">
          <span className="w-2 h-2 rounded-full bg-[#bef264] shadow-[0_0_8px_#bef264] animate-pulse" />
          <span className="font-bold tracking-widest uppercase text-white">NOVA CORE // HIGH-THROUGHPUT ENGINE</span>
          <span className="text-white/40">|</span>
          <span className="text-zinc-300">SPRING BOOT 4.1.1 SPEC</span>
        </div>

        {/* Bottom-Left Overlay Content */}
        <div className="absolute bottom-10 sm:bottom-14 lg:bottom-18 left-4 sm:left-8 lg:left-12 max-w-2xl space-y-4">
          <div className="space-y-1.5">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase drop-shadow-lg">
              NOVA CORE 4.1
            </h2>
            <div className="text-xs font-mono font-bold tracking-widest text-[#bef264] uppercase flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>ENTERPRISE DISTRIBUTED ARCHITECTURE & ZERO-BLOCKING LOOM</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-200 font-sans leading-relaxed max-w-xl drop-shadow-sm">
            Milyonlarca eşzamanlı isteği sub-milisaniye gecikmeyle işleyen, Java 22 Loom sanal iş parçacıkları, pgvector 128D anlamsal kosinüs arama motoru, Redis Write-Behind tamponlama ve RFC 7807 kurumsal hata standartlarıyla inşa edilmiş yüksek başarımlı sistem mimarisi.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleDiscover}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#bef264] hover:bg-[#aee64c] text-black text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 shadow-xl shadow-[#bef264]/25 hover:scale-105 active:scale-95 cursor-pointer btn-tactile"
            >
              <span>MİMARİYİ KEŞFET</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            {onExploreAI && (
              <button
                onClick={onExploreAI}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black/75 hover:bg-black text-white border border-white/25 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer backdrop-blur-md hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#bef264]" />
                <span>VEKTÖR LAB</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
