'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Volume2, VolumeX, Play } from 'lucide-react';

interface ReelItem {
  id: string;
  tag: string;
  subtitle: string;
  detail: string;
  image: string;
  badge: string;
  moduleTarget: string;
  durationSec: number;
}

const REELS: ReelItem[] = [
  {
    id: 'loom-threads',
    tag: '01 // JAVA 22 LOOM',
    subtitle: '10,000 SANAL THREAD DEVREDE',
    detail: 'Tomcat carrier thread blokajı sıfırlandı. 0.2ms sub-tick gecikme.',
    image: '/images/architecture-cutaway.jpg',
    badge: 'LOOM HUD',
    moduleTarget: 'loom',
    durationSec: 6,
  },
  {
    id: 'redis-buffer',
    tag: '02 // REDIS WRITE-BEHIND',
    subtitle: 'HINCRBY İLE SIFIR DB ROW-LOCK',
    detail: 'Saniyede 12.4K sayaç isteği Redis Hash üzerinde atomik toplandı.',
    image: '/images/terminal-hardware.jpg',
    badge: 'BUFFER LIVE',
    moduleTarget: 'write-behind',
    durationSec: 6,
  },
  {
    id: 'vector-ai',
    tag: '03 // SPRING AI 128D',
    subtitle: 'KOSİNÜS BENZERLİK PROJEKSİYONU',
    detail: '128 boyutlu yoğun uzayda mikrosaniyede kavramsal semantik arama.',
    image: '/images/lifestyle-hero.jpg',
    badge: '128D CORE',
    moduleTarget: 'spring-ai',
    durationSec: 6,
  },
  {
    id: 'totp-auth',
    tag: '04 // 2FA PRE-AUTH STATE',
    subtitle: 'İKİ ADIMLI TOTP MEYDAN OKUMASI',
    detail: 'Doğrulanmamış istemcilere geçici PRE_AUTH JWT sınırlandırması.',
    image: '/images/hardware-core.jpg',
    badge: 'SECURITY V2',
    moduleTarget: 'optimistic-locking',
    durationSec: 6,
  },
  {
    id: 'batch-purge',
    tag: '05 // SPRING BATCH 5',
    subtitle: 'CHUNK 100 İLE SIFIR ÇÖP TABLO',
    detail: 'Soft-deleted kayıtlar 30 günde bir otomatik arşivlendi.',
    image: '/images/architecture-cutaway.jpg',
    badge: 'ETL PIPELINE',
    moduleTarget: 'spring-batch',
    durationSec: 6,
  },
];

interface FieldDemoReelsProps {
  onOpenArchitectureConsole?: (moduleId: string) => void;
}

export const FieldDemoReels: React.FC<FieldDemoReelsProps> = ({
  onOpenArchitectureConsole,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredReelId, setHoveredReelId] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ [id: string]: number }>({});
  const [isMuted, setIsMuted] = useState(true);

  // Mouse drag-to-scroll state
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  // Video progress animation on hover (Direct Ride Also Screenshots 1, 2 & 3 Look)
  useEffect(() => {
    if (!hoveredReelId) return;

    const intervalMs = 50;
    const step = 100 / (6000 / intervalMs); // 6 seconds loop

    const timer = setInterval(() => {
      setProgress((prev) => {
        const current = prev[hoveredReelId] || 0;
        const next = current + step;
        return {
          ...prev,
          [hoveredReelId]: next >= 100 ? 0 : next,
        };
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [hoveredReelId]);

  const handleMouseEnter = (id: string) => {
    setHoveredReelId(id);
    setProgress((prev) => ({ ...prev, [id]: prev[id] || 0 }));
  };

  const handleMouseLeaveCard = () => {
    setHoveredReelId(null);
  };

  // Drag-to-scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsMouseDown(true);
    setHasDragged(false);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeftPos(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) setHasDragged(true);
    containerRef.current.scrollLeft = scrollLeftPos - walk;
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCardClick = (reel: ReelItem) => {
    if (hasDragged) return; // Prevent accidental click while dragging
    if (onOpenArchitectureConsole) {
      onOpenArchitectureConsole(reel.moduleTarget);
    } else {
      const el = document.getElementById('modular-architecture-console');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      window.dispatchEvent(new CustomEvent('select-console-module', { detail: reel.moduleTarget }));
      window.dispatchEvent(new CustomEvent('run-console-simulation'));
    }
  };

  return (
    <section className="bg-black text-white py-14 sm:py-20 border-b border-white/[0.08] select-none overflow-hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: @NOVABLOG on Left, Circular Arrows on Right (Direct Ride Also Screenshots 1 & 2) */}
        <div className="flex items-center justify-between pb-6 sm:pb-8">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs sm:text-sm font-black tracking-widest uppercase text-white hover:underline cursor-pointer">
              @NOVABLOG // FIELD REELS
            </span>
            <span className="w-2 h-2 rounded-full bg-[#d4f933] shadow-[0_0_8px_#d4f933] animate-pulse" />
            <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
              HOVER TO PLAY // DRAG TO SCROLL
            </span>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer hover:scale-105 active:scale-95 btn-tactile shadow-md"
              title="Önceki Videolar"
              aria-label="Önceki Videolar"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer hover:scale-105 active:scale-95 btn-tactile shadow-md"
              title="Sonraki Videolar"
              aria-label="Sonraki Videolar"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Vertical Reel Cards Carousel (with Mouse Drag-to-Scroll Physics) */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 -mx-4 px-4 sm:mx-0 sm:px-0 ${
            isMouseDown ? 'cursor-grabbing select-none' : 'cursor-grab'
          }`}
        >
          {REELS.map((reel) => {
            const isHovered = hoveredReelId === reel.id;
            const cardProgress = progress[reel.id] || 0;

            return (
              <div
                key={reel.id}
                onMouseEnter={() => handleMouseEnter(reel.id)}
                onMouseLeave={handleMouseLeaveCard}
                onClick={() => handleCardClick(reel)}
                className="relative min-w-[240px] sm:min-w-[270px] max-w-[290px] aspect-[9/16] flex-shrink-0 snap-start rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-[#d4f933]/50 group"
              >
                {/* Visual / Simulated Reel Video Background */}
                <Image
                  src={reel.image}
                  alt={reel.subtitle}
                  fill
                  sizes="(max-width: 768px) 240px, 290px"
                  className={`object-cover transition-transform duration-700 ease-out ${
                    isHovered ? 'scale-110 brightness-95' : 'scale-100 brightness-75'
                  }`}
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/40 pointer-events-none" />

                {/* Top Badge & Sound Toggle Icon (Matching Screenshots 1 & 3) */}
                <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-300">
                    {reel.badge}
                  </span>

                  {isHovered && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMuted(!isMuted);
                      }}
                      className="w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-lg"
                      title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
                      aria-label="Ses Kontrolü"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-[#d4f933]" />}
                    </button>
                  )}
                </div>

                {/* Center Subtitle Prompt Overlay (Direct Ride Also Screenshots 1 & 2 Text Style) */}
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 text-center space-y-1 pointer-events-none z-10">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#d4f933] uppercase">
                    {reel.tag}
                  </span>
                  <h4 className="text-base sm:text-lg font-black tracking-tight text-white uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] leading-tight">
                    {reel.subtitle}
                  </h4>
                  <p className="text-[11px] font-mono text-zinc-300 max-w-[200px] mx-auto drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                    {reel.detail}
                  </p>
                </div>

                {/* Live Playback Indicator Pill */}
                {isHovered && (
                  <div className="absolute bottom-10 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#d4f933]/20 border border-[#d4f933]/40 text-[9px] font-mono font-bold text-[#d4f933] uppercase tracking-wider z-10 animate-pulse">
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>CANLI TELEMETRİ</span>
                  </div>
                )}

                {/* The Signature Ride Also Green Video Progress Bar at Bottom (Direct Screenshot 1, 2 & 3) */}
                <div className="absolute bottom-4 inset-x-4 h-1 rounded-full bg-white/20 overflow-hidden z-10">
                  <div
                    className="h-full bg-[#d4f933] shadow-[0_0_8px_#d4f933] transition-all duration-75"
                    style={{ width: `${isHovered ? cardProgress : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
