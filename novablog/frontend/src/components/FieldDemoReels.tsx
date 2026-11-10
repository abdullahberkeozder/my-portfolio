'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Volume2, VolumeX, Play } from 'lucide-react';

interface ReelItem {
  id: string;
  tag: string;
  badge: string;
  caption: string;
  title: string;
  subtitle: string;
  detail: string;
  image: string;
  moduleTarget: string;
  durationSec: number;
}

const REELS: ReelItem[] = [
  {
    id: 'reel-rider',
    tag: '01 // JAVA 22 LOOM',
    badge: '10K THREADS',
    caption: 'AHH !',
    title: '10,000 SANAL THREAD DEVREDE',
    subtitle: 'KARIYER THREAD DARBOĞAZINA SON',
    detail: 'Tomcat carrier thread blokajı sıfırlandı. 0.2ms sub-tick gecikmeyle 10K eşzamanlı istek işleniyor.',
    image: '/images/reel-rider.jpg',
    moduleTarget: 'loom',
    durationSec: 6,
  },
  {
    id: 'reel-crate',
    tag: '02 // REDIS WRITE-BEHIND',
    badge: 'ROW-LOCKLESS',
    caption: 'ONE OF MY FAVORITE THINGS ABOUT THIS SYSTEM',
    title: 'HINCRBY İLE SIFIR ROW-LOCK',
    subtitle: 'SANİYEDE 12.4K SAYAÇ İŞLEMİ',
    detail: 'Yüksek trafik anında veritabanı kilitlenmelerini önleyen 30 saniyelik atomik tamponlama mimarisi.',
    image: '/images/reel-crate.jpg',
    moduleTarget: 'write-behind',
    durationSec: 7,
  },
  {
    id: 'reel-tent',
    tag: '03 // SPRING AI 128D',
    badge: 'VECTOR CORE',
    caption: 'HERE WE GO',
    title: '128 BOYUTLU KOSİNÜS VEKTÖR UZAYI',
    subtitle: 'SEMANTİK ANLAMSAL ARAMA',
    detail: 'Geleneksel anahtar kelime eşleşmesi yerine kavramsal yakınlık ve RRF hibrit sıralama motoru.',
    image: '/images/reel-tent.jpg',
    moduleTarget: 'spring-ai',
    durationSec: 6,
  },
  {
    id: 'reel-stand',
    tag: '04 // RFC 7807 & 2FA',
    badge: 'STATE MACHINE',
    caption: 'INSANE MODULARITY',
    title: 'PRE-AUTH STATE MACHINE & TOTP',
    subtitle: 'İKİ AŞAMALI GÜVENLİK PROTOKOLÜ',
    detail: 'Geçici Pre-Auth JWT ve RFC 7807 Problem ayrıntılarıyla tavizsiz kurumsal kimlik doğrulama.',
    image: '/images/reel-stand.jpg',
    moduleTarget: 'optimistic-locking',
    durationSec: 6,
  },
  {
    id: 'reel-drone',
    tag: '05 // SPRING BATCH 5',
    badge: 'CHUNK 100',
    caption: 'SHAPE-SHIFTING PERFORMANCE',
    title: '30 GÜNLÜK RETENTION PURGE',
    subtitle: 'OTOMATİK ARŞİVLEME BORU HATTI',
    detail: '100 kayıtlık chunk işleyicisi ve ItemReader ile bellek taşması olmadan veritabanı temizliği.',
    image: '/images/reel-drone.jpg',
    moduleTarget: 'spring-batch',
    durationSec: 8,
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

  // Mouse drag-to-scroll state (Supports both Left Click and Right Click!)
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  // Video progress animation on hover (Direct Ride Also Screenshots 1, 4, 5, 6 Look)
  useEffect(() => {
    if (!hoveredReelId) return;

    const reel = REELS.find((r) => r.id === hoveredReelId);
    const duration = (reel?.durationSec || 6) * 1000;
    const intervalMs = 40;
    const step = 100 / (duration / intervalMs);

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

  // Drag-to-scroll handlers (Left and Right Click Support)
  const handleMouseDown = (e: React.MouseEvent) => {
    // 0 = Left click, 2 = Right click
    if (e.button !== 0 && e.button !== 2) return;
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
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }
    containerRef.current.scrollLeft = scrollLeftPos - walk;
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCardClick = (reel: ReelItem) => {
    if (hasDragged) return; // Prevent click while dragging
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
        {/* Section Header: @RIDEALSO / @NOVABLOG on Left, Circular Arrows on Right (Direct Ride Also Screenshots 4 & 5) */}
        <div className="flex items-center justify-between pb-6 sm:pb-8">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm sm:text-base font-black tracking-widest uppercase text-white hover:underline cursor-pointer">
              @RIDEALSO // FIELD REELS
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#bef264] shadow-[0_0_10px_#bef264] animate-pulse" />
            <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline tracking-wider">
              SAĞA TIK VEYA SOL TIK İLE SÜRÜKLE // HOVER TO PLAY
            </span>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer hover:scale-105 active:scale-95 btn-tactile shadow-md"
              title="Önceki Videolar"
              aria-label="Önceki Videolar"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer hover:scale-105 active:scale-95 btn-tactile shadow-md"
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
          onContextMenu={(e) => {
            // Prevent context menu when user drags with right-click
            if (hasDragged) {
              e.preventDefault();
            }
          }}
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
                className="relative min-w-[250px] sm:min-w-[280px] max-w-[300px] aspect-[9/16] flex-shrink-0 snap-start rounded-3xl overflow-hidden bg-zinc-950 border border-white/10 shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-[#bef264]/60 group cursor-pointer"
              >
                {/* Visual / Simulated Reel Video Background */}
                <Image
                  src={reel.image}
                  alt={reel.title}
                  fill
                  priority={reel.id === 'reel-rider'}
                  sizes="(max-width: 768px) 250px, 300px"
                  className={`object-cover object-center transition-transform duration-700 ease-out ${
                    isHovered ? 'scale-110 brightness-100' : 'scale-100 brightness-80'
                  }`}
                />

                {/* Ambient Dark Gradient Vignette for Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none" />

                {/* Top Badge & Sound Toggle Icon (Matching Screenshots 4 & 6) */}
                <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
                  <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-200">
                    {reel.badge}
                  </span>

                  {/* Audio Mute/Unmute Round Button on Top Right (Screenshot 4 & 6) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    className="w-9 h-9 rounded-full bg-black/75 hover:bg-black text-white border border-white/15 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-lg backdrop-blur-sm"
                    title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
                    aria-label="Ses Kontrolü"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-[#bef264]" />
                    )}
                  </button>
                </div>

                {/* Iconic Center Subtitle Caption (Direct Ride Also Screenshots 4 & 6 Look: "AHH !", "HERE WE GO", "ONE OF MY FAVORITE THINGS ABOUT THIS BIKE") */}
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 text-center pointer-events-none z-10 space-y-2">
                  <div className="font-mono text-sm sm:text-base font-black tracking-widest text-white uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                    {reel.caption}
                  </div>
                  <div className="text-[10px] font-mono font-bold tracking-wider text-[#bef264] uppercase drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
                    {reel.tag}
                  </div>
                </div>

                {/* Bottom Card Meta Details */}
                <div className="absolute bottom-7 inset-x-4 space-y-1 z-10 pointer-events-none">
                  <h4 className="text-sm font-black text-white uppercase drop-shadow-md leading-tight">
                    {reel.title}
                  </h4>
                  <p className="text-[11px] font-mono text-zinc-300 line-clamp-2 drop-shadow-sm">
                    {reel.detail}
                  </p>
                </div>

                {/* Live Playback Indicator Pill */}
                {isHovered && (
                  <div className="absolute top-14 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#bef264]/20 border border-[#bef264]/50 text-[9px] font-mono font-bold text-[#bef264] uppercase tracking-wider z-10 animate-pulse backdrop-blur-sm">
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>CANLI TELEMETRİ</span>
                  </div>
                )}

                {/* The Signature Ride Also Lime-Green Video Progress Bar at Bottom (Direct Screenshot 4, 5 & 6) */}
                <div className="absolute bottom-3 inset-x-4 h-1.5 rounded-full bg-white/20 overflow-hidden z-20">
                  <div
                    className="h-full bg-[#bef264] shadow-[0_0_10px_#bef264] transition-all duration-75"
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
