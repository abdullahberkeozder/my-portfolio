'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, X, ExternalLink, CheckCircle } from 'lucide-react';

interface StoryItem {
  id: string;
  badgeType: 'time' | 'fast-company' | 'red-dot' | 'series-d' | 'enterprise';
  title: string;
  subtitle: string;
  description: string;
  image: string;
  customVisual?: 'geometric' | 'sky-brand';
  detailHtml?: string;
  actionModule?: string;
}

const STORIES: StoryItem[] = [
  {
    id: 'time-inventions',
    badgeType: 'time',
    title: 'Java 22 Loom & Virtual Threads Named to Enterprise Breakthroughs of 2026.',
    subtitle: 'Java 22 Project Loom & Yüksek Başarımlı Çekirdek Atılımı',
    description: 'Tomcat carrier OS thread darboğazına son: 10.000 sanal thread ile sub-milisaniye gecikme ve sıfır blokeleme sağlayan yüksek başarımlı dağıtık sistem mimarisi.',
    image: '/images/architecture-cutaway.jpg',
    actionModule: 'loom',
  },
  {
    id: 'fast-company',
    badgeType: 'fast-company',
    title: 'Nova Core Wins Innovation by Design 2026 for Semantic Vector Engine.',
    subtitle: '128 Boyutlu Kosinüs Vektör Uzayı ve RRF Hibrit Arama',
    description: 'pgvector 128 boyutlu kosinüs vektör uzayında anlamsal semantik eşleşme ve dokunsal Dieter Rams konsol ergonomisi ile çifte mimari ödül.',
    image: '/images/lifestyle-hero.jpg',
    customVisual: 'geometric',
    actionModule: 'spring-ai',
  },
  {
    id: 'red-dot-award',
    badgeType: 'red-dot',
    title: 'Nova Core Wins Red Dot Award for Distributed Systems Engineering 2026.',
    subtitle: 'Row-Locksuz Sayaç Yönetimi ve Eventual Consistency',
    description: 'HINCRBY ile Redis Hash üzerinde row-locksuz sayaç yönetimi ve 30 saniyede bir toplu DB flush mimarisiyle Red Dot jürisinden tam not.',
    image: '/images/terminal-hardware.jpg',
    actionModule: 'write-behind',
  },
  {
    id: 'series-d-finance',
    badgeType: 'series-d',
    title: 'Nova Core Releases Enterprise State Machine & Zero-Trust 2FA Spec.',
    subtitle: 'RFC 7807 Problem Details ve Pre-Auth State Machine Protokolü',
    description: '201/201 otomatik test güvencesi, geçici Pre-Auth JWT doğrulaması ve Spring Batch 5 veri boru hattı ile desteklenen kurumsal güvenlik mimarisi.',
    image: '/images/hardware-core.jpg',
    customVisual: 'sky-brand',
    actionModule: 'optimistic-locking',
  },
];

interface StoriesCarouselProps {
  onSelectTab?: (tab: 'feed' | 'ai-search' | 'ai-lab' | 'admin-batch') => void;
  onOpenTelemetry?: () => void;
  onOpenArchitectureConsole?: () => void;
}

export const StoriesCarousel: React.FC<StoriesCarouselProps> = ({
  onSelectTab,
  onOpenTelemetry,
  onOpenArchitectureConsole,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null);

  // Mouse drag-to-scroll state (Supports Left and Right Click)
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 && e.button !== 2) return;
    if (!scrollContainerRef.current) return;
    setIsMouseDown(true);
    setHasDragged(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftPos(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) setHasDragged(true);
    scrollContainerRef.current.scrollLeft = scrollLeftPos - walk;
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleReadMore = (story: StoryItem) => {
    if (hasDragged) return;
    setSelectedStory(story);
  };

  const handleLaunchModule = (story: StoryItem) => {
    setSelectedStory(null);
    if (story.actionModule) {
      if (onSelectTab) onSelectTab('feed');
      if (onOpenArchitectureConsole) onOpenArchitectureConsole();
      setTimeout(() => {
        const el = document.getElementById('modular-architecture-console');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        window.dispatchEvent(
          new CustomEvent('select-console-module', { detail: story.actionModule })
        );
        window.dispatchEvent(new CustomEvent('run-console-simulation'));
      }, 100);
    }
  };

  return (
    <section className="bg-[#18181b] dark:bg-[#090a0d] text-white py-14 sm:py-20 border-b border-white/[0.08] transition-colors select-none overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Stories Title on Left, Circular Arrows on Right */}
        <div className="flex items-center justify-between pb-6 sm:pb-8">
          <div>
            <div className="text-[10px] font-mono font-bold tracking-widest text-[#a855f7] uppercase mb-1">
              SYSTEM EDITORIAL // ARCHITECTURAL BREAKTHROUGHS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>Mimarî Hikayeler</span>
              <span className="text-zinc-500 font-normal text-xl sm:text-2xl">{'//'} Stories</span>
            </h2>
          </div>

          {/* Carousel Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer hover:scale-105 active:scale-95 btn-tactile shadow-md"
              title="Önceki Hikayeler"
              aria-label="Önceki Hikayeler"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer hover:scale-105 active:scale-95 btn-tactile shadow-md"
              title="Sonraki Hikayeler"
              aria-label="Sonraki Hikayeler"
            >
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Carousel Container (Smooth Horizontal Drag & Snap Scroll) */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onContextMenu={(e) => {
            if (hasDragged) e.preventDefault();
          }}
          className={`flex gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 -mx-4 px-4 sm:mx-0 sm:px-0 ${
            isMouseDown ? 'cursor-grabbing select-none' : 'cursor-grab'
          }`}
        >
          {STORIES.map((story) => (
            <div
              key={story.id}
              className="min-w-[280px] sm:min-w-[320px] max-w-[340px] flex-shrink-0 snap-start rounded-3xl bg-white text-zinc-950 p-5 flex flex-col justify-between shadow-2xl border border-black/5 hover:-translate-y-1 transition-transform duration-300 group cursor-pointer"
              onClick={() => handleReadMore(story)}
            >
              <div className="space-y-4">
                {/* Visual Area (Aspect ~16:10 / 4:3 with Rounded Frame) */}
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-100 border border-black/10">
                  {/* Geometric graphic for Fast Company */}
                  {story.customVisual === 'geometric' ? (
                    <div className="w-full h-full bg-[#0066ff] flex items-center justify-between p-6 relative overflow-hidden">
                      <div className="w-24 h-24 rounded-full bg-[#00e5ff] relative overflow-hidden shadow-lg">
                        <div className="absolute top-0 right-0 w-12 h-24 bg-white" />
                        <div className="absolute bottom-0 left-0 w-12 h-12 bg-black" />
                      </div>
                      <div className="text-right text-white space-y-0.5">
                        <div className="font-sans font-black text-xs sm:text-sm tracking-wider uppercase">
                          FAST COMPANY
                        </div>
                        <div className="font-mono text-[9px] text-white/80 uppercase">
                          INNOVATION BY DESIGN 2026
                        </div>
                      </div>
                    </div>
                  ) : story.customVisual === 'sky-brand' ? (
                    /* Sky Blue Gradient with NOVA. logo */
                    <div className="w-full h-full bg-gradient-to-b from-[#90c5f9] to-[#bfdbfe] flex flex-col items-center justify-center p-4 relative text-center">
                      <div className="font-sans font-black text-3xl sm:text-4xl tracking-tighter text-black uppercase mb-2">
                        NOVA.
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-mono font-bold text-zinc-800 tracking-wider">
                        <span>SPRING BOOT</span>
                        <span>&bull;</span>
                        <span>LOOM</span>
                        <span>&bull;</span>
                        <span>REDIS</span>
                        <span>&bull;</span>
                        <span>pgvector</span>
                      </div>
                    </div>
                  ) : (
                    /* Product Hardware Photo with Award Badge */
                    <>
                      <Image
                        src={story.image}
                        alt={story.title}
                        fill
                        sizes="(max-width: 768px) 280px, 340px"
                        className="object-cover transition-transform group-hover:scale-105 duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                      {/* TIME Red Ribbon Badge overlay */}
                      {story.badgeType === 'time' && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white p-1.5 rounded-sm shadow-lg text-center font-serif leading-none border border-white/20">
                          <div className="text-[9px] font-bold tracking-tight">TIME</div>
                          <div className="text-[7px] font-black uppercase tracking-tighter mt-0.5">BEST</div>
                          <div className="text-[6px] font-sans tracking-tight">INVENTIONS</div>
                          <div className="text-[7px] font-mono font-bold">2026</div>
                        </div>
                      )}

                      {/* Red Dot Award Badge overlay */}
                      {story.badgeType === 'red-dot' && (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-black px-2 py-1 rounded-md shadow-md text-right font-sans leading-tight border border-black/10">
                          <div className="flex items-center gap-1 justify-end">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                            <span className="text-[8px] font-bold">reddot winner 2026</span>
                          </div>
                          <div className="text-[7px] text-zinc-500 font-mono">systems engineering</div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Headline Text: Clean sans-serif */}
                <h3 className="text-sm sm:text-[15px] font-semibold text-zinc-950 leading-snug tracking-tight">
                  {story.title}
                </h3>
              </div>

              {/* Black Pill Button: [READ MORE // MİMARİYİ İNCELE] */}
              <div className="pt-6">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReadMore(story);
                  }}
                  className="px-5 py-2 rounded-full bg-black text-white hover:bg-neutral-800 text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer btn-tactile shadow-sm active:scale-95"
                >
                  READ MORE
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Story Detail Modal / Editorial Drawer */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/10 dark:border-white/10 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono font-bold uppercase tracking-wider">
                  MİMARÎ RAPOR // 2026
                </span>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                  {selectedStory.title}
                </h3>
                <p className="text-xs font-mono text-purple-600 dark:text-purple-400 font-bold">
                  {selectedStory.subtitle}
                </p>
              </div>

              <button
                onClick={() => setSelectedStory(null)}
                className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Hero Graphic */}
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-zinc-900 border border-black/10">
              <Image
                src={selectedStory.image}
                alt={selectedStory.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Modal Body Content */}
            <div className="space-y-4 text-sm font-sans text-zinc-600 dark:text-zinc-300 leading-relaxed">
              <p>{selectedStory.description}</p>
              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5 space-y-2 text-xs font-mono">
                <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>DOĞRULANMIŞ MİMARİ KRİTERLER:</span>
                </div>
                <ul className="space-y-1 text-zinc-500 dark:text-zinc-400 pl-6 list-disc">
                  <li>201/201 otomatik birim ve entegrasyon testi doğrulaması</li>
                  <li>Saniyede 12.400 sayaç işleminde sıfır satır kilitleme</li>
                  <li>RFC 7807 problem ayrıntıları ile hata şeffaflığı</li>
                  <li>2FA TOTP ve geçici Pre-Auth token state machine koruması</li>
                </ul>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-black/10 dark:border-white/10">
              {onOpenTelemetry && (
                <button
                  onClick={() => {
                    setSelectedStory(null);
                    onOpenTelemetry();
                  }}
                  className="px-4 py-2.5 rounded-full text-xs font-mono font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 uppercase transition-colors"
                >
                  TELEMETRİ PANELİ
                </button>
              )}
              <button
                onClick={() => setSelectedStory(null)}
                className="px-5 py-2.5 rounded-full text-xs font-mono font-bold text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white uppercase transition-colors"
              >
                KAPAT
              </button>
              <button
                onClick={() => handleLaunchModule(selectedStory)}
                className="px-6 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <span>MİMARİYİ CANLI DENE</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
