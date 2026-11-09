'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Award } from 'lucide-react';

interface StoryItem {
  id: string;
  badgeType: string;
  badgeLabel: string;
  badgeSub: string;
  badgeBg: string;
  badgeText: string;
  title: string;
  description: string;
  image: string;
  ctaText: string;
  actionType: 'console-loom' | 'console-writebehind' | 'tab-ai' | 'tab-batch' | 'telemetry';
}

const STORIES: StoryItem[] = [
  {
    id: 'loom-breakthrough',
    badgeType: 'TIME INVENTIONS',
    badgeLabel: 'JAVA 22 LOOM',
    badgeSub: 'BEST INVENTIONS 2026',
    badgeBg: 'bg-rose-600',
    badgeText: 'text-white',
    title: 'Tomcat OS thread havuzu darboğazına son: 10.000 sanal thread ile sıfır blokeleme.',
    description: 'Project Loom sanal thread’leri Carrier Thread üzerinde koşturulur; I/O anında OS thread bloke edilmez.',
    image: '/images/architecture-cutaway.jpg',
    ctaText: 'MİMARİYİ İNCELE',
    actionType: 'console-loom',
  },
  {
    id: 'spring-ai-innovation',
    badgeType: 'FAST COMPANY',
    badgeLabel: 'SPRING AI 1.0 M6',
    badgeSub: 'INNOVATION BY DESIGN',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-white',
    title: 'Geleneksel SQL LIKE aramasına son: 128 boyutlu kosinüs vektör uzayında anlamsal eşleşme.',
    description: 'pgvector eklentisiyle makalelerin kavramsal bağlamı yakalanarak mikrosaniyede semantik arama yapılır.',
    image: '/images/lifestyle-hero.jpg',
    ctaText: 'VEKTÖR LAB’I AÇ',
    actionType: 'tab-ai',
  },
  {
    id: 'redis-writebehind',
    badgeType: 'RED DOT AWARD',
    badgeLabel: 'RED DOT WINNER',
    badgeSub: 'ENGINEERING 2026',
    badgeBg: 'bg-zinc-900',
    badgeText: 'text-white',
    title: 'Row-locksuz sayaç yönetimi: Saniyede 12.400 işlemde sıfır PostgreSQL satır kilitlemesi.',
    description: 'HINCRBY ile Redis Hash üzerinde atomik sayaç biriktirme ve 30 saniyede bir toplu veritabanı flush.',
    image: '/images/terminal-hardware.jpg',
    ctaText: 'TAMPONU TEST ET',
    actionType: 'console-writebehind',
  },
  {
    id: 'enterprise-reliability',
    badgeType: 'ENTERPRISE AUDIT',
    badgeLabel: '201/201 AUTOMATED',
    badgeSub: '100% PASS RATE',
    badgeBg: 'bg-gradient-to-r from-purple-700 to-indigo-700',
    badgeText: 'text-white',
    title: 'RFC 7807 Problem ayrıntıları ve 2FA TOTP geçici Pre-Auth token state machine güvenliği.',
    description: 'Şifresi doğrulanmış istemciye geçici token verilir; Google Authenticator onayından sonra JWT tahsis edilir.',
    image: '/images/hardware-core.jpg',
    ctaText: 'TELEMETRİYİ AÇ',
    actionType: 'telemetry',
  },
  {
    id: 'batch-retention',
    badgeType: 'CHUNK SPEC',
    badgeLabel: 'SPRING BATCH 5',
    badgeSub: 'CHUNK ARCHITECTURE',
    badgeBg: 'bg-emerald-600',
    badgeText: 'text-white',
    title: '30 günlük soft-delete retention purge ve yazar performans analitiği otomasyonu.',
    description: '100 kayıtlık chunk işleyicisi ve ItemReader ile bellek taşması olmadan veritabanı arşiv temizliği.',
    image: '/images/architecture-cutaway.jpg',
    ctaText: 'BATCH KONSOLU',
    actionType: 'tab-batch',
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

  // Mouse drag-to-scroll state (User requested drag capability!)
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
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
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleAction = (item: StoryItem) => {
    if (hasDragged) return; // Ignore click while dragging
    if (item.actionType === 'console-loom') {
      if (onSelectTab) onSelectTab('feed');
      if (onOpenArchitectureConsole) onOpenArchitectureConsole();
      setTimeout(() => {
        const el = document.getElementById('modular-architecture-console');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        window.dispatchEvent(new CustomEvent('select-console-module', { detail: 'loom' }));
        window.dispatchEvent(new CustomEvent('run-console-simulation'));
      }, 100);
    } else if (item.actionType === 'console-writebehind') {
      if (onSelectTab) onSelectTab('feed');
      if (onOpenArchitectureConsole) onOpenArchitectureConsole();
      setTimeout(() => {
        const el = document.getElementById('modular-architecture-console');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        window.dispatchEvent(new CustomEvent('select-console-module', { detail: 'write-behind' }));
      }, 100);
    } else if (item.actionType === 'tab-ai') {
      if (onSelectTab) onSelectTab('ai-search');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item.actionType === 'tab-batch') {
      if (onSelectTab) onSelectTab('admin-batch');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item.actionType === 'telemetry') {
      if (onOpenTelemetry) onOpenTelemetry();
    }
  };

  return (
    <section className="bg-zinc-950 dark:bg-[#07080a] text-white py-14 sm:py-18 border-b border-white/[0.08] transition-colors select-none overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Stories Title on Left, Circular Arrows on Right */}
        <div className="flex items-center justify-between pb-6 sm:pb-8">
          <div>
            <div className="text-[10px] font-mono font-bold tracking-widest text-[#a855f7] uppercase mb-1">
              RIDE ALSO INDUSTRIAL EDITORIAL // SPRING BOOT 4.1 SPEC
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Mimarî Hikayeler</span>
              <span className="text-zinc-500 font-normal text-xl sm:text-2xl">{'//'} Breakthroughs</span>
            </h2>
          </div>

          {/* Carousel Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer hover:scale-105 active:scale-95 btn-tactile shadow-md"
              title="Önceki Hikayeler"
              aria-label="Önceki Hikayeler"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer hover:scale-105 active:scale-95 btn-tactile shadow-md"
              title="Sonraki Hikayeler"
              aria-label="Sonraki Hikayeler"
            >
              <ArrowRight className="w-4 h-4" />
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
          className={`flex gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 -mx-4 px-4 sm:mx-0 sm:px-0 ${
            isMouseDown ? 'cursor-grabbing select-none' : 'cursor-grab'
          }`}
        >
          {STORIES.map((story) => (
            <div
              key={story.id}
              className="min-w-[290px] sm:min-w-[330px] max-w-[350px] flex-shrink-0 snap-start rounded-3xl bg-white text-zinc-950 p-5 flex flex-col justify-between shadow-2xl border border-black/5 hover:-translate-y-1 transition-transform duration-300 group"
            >
              <div className="space-y-4">
                {/* Story Image / Graphic Area with Award Badge Overlay */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-black/10">
                  {story.image && (
                    <Image
                      src={story.image}
                      alt={story.title}
                      fill
                      sizes="(max-width: 768px) 290px, 350px"
                      className="object-cover transition-transform group-hover:scale-105 duration-700 ease-out"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

                  {/* Award / Brand Badge (Direct Ride Also Screenshot 1 Look) */}
                  <div className="absolute top-3 right-3 flex flex-col items-end">
                    <div
                      className={`px-2.5 py-1 rounded-md text-[9px] font-mono font-bold tracking-wider uppercase shadow-md flex items-center gap-1 ${story.badgeBg} ${story.badgeText}`}
                    >
                      <Award className="w-3 h-3" />
                      <span>{story.badgeLabel}</span>
                    </div>
                    <span className="text-[8px] font-mono text-white/90 bg-black/60 px-1.5 py-0.5 rounded mt-0.5">
                      {story.badgeSub}
                    </span>
                  </div>
                </div>

                {/* Story Headline & Description */}
                <div className="space-y-1.5">
                  <h3 className="text-sm sm:text-base font-black text-zinc-950 leading-snug tracking-tight">
                    {story.title}
                  </h3>
                  <p className="text-xs text-zinc-600 font-sans line-clamp-2 leading-relaxed">
                    {story.description}
                  </p>
                </div>
              </div>

              {/* Ride Also Iconic Black Pill Button: [READ MORE / MİMARİYİ İNCELE] */}
              <div className="pt-5 border-t border-black/[0.06] mt-4">
                <button
                  onClick={() => handleAction(story)}
                  className="w-full py-2.5 px-4 rounded-full bg-black text-white hover:bg-zinc-800 text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer btn-tactile shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>{story.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
