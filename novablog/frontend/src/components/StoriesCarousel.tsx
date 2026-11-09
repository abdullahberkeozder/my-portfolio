'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Award } from 'lucide-react';

interface StoryItem {
  id: string;
  badgeType: 'time' | 'fastcompany' | 'reddot' | 'partner' | 'ieee';
  badgeLabel: string;
  badgeSub: string;
  badgeBg: string;
  badgeText: string;
  title: string;
  image?: string;
  ctaText: string;
  targetModule?: string;
  targetTab?: 'feed' | 'ai-search' | 'admin-batch';
  actionType: 'console-loom' | 'console-writebehind' | 'tab-ai' | 'tab-batch' | 'telemetry';
}

const STORIES: StoryItem[] = [
  {
    id: 'loom-breakthrough',
    badgeType: 'time',
    badgeLabel: 'JAVA 22 LOOM',
    badgeSub: 'BEST INVENTIONS 2026',
    badgeBg: 'bg-rose-600',
    badgeText: 'text-white',
    title: 'Java 22 Project Loom: 10.000 sanal thread havuzu ile sıfır platform thread kilitlemesi.',
    image: '/images/architecture-cutaway.jpg',
    ctaText: 'READ MORE',
    actionType: 'console-loom',
  },
  {
    id: 'spring-ai-innovation',
    badgeType: 'fastcompany',
    badgeLabel: 'SPRING AI 1.0 M6',
    badgeSub: 'INNOVATION BY DESIGN',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-white',
    title: '128 boyutlu yoğun vektör uzayı ve kosinüs benzerliği ile kavramsal semantik arama.',
    image: '/images/lifestyle-hero.jpg',
    ctaText: 'READ MORE',
    actionType: 'tab-ai',
  },
  {
    id: 'redis-writebehind',
    badgeType: 'reddot',
    badgeLabel: 'RED DOT WINNER',
    badgeSub: 'ENGINEERING 2026',
    badgeBg: 'bg-zinc-900',
    badgeText: 'text-white',
    title: 'Redis Write-Behind Buffer: Saniyede 12.400 işlemde sıfır PostgreSQL satır kilitlemesi.',
    image: '/images/terminal-hardware.jpg',
    ctaText: 'READ MORE',
    actionType: 'console-writebehind',
  },
  {
    id: 'enterprise-reliability',
    badgeType: 'partner',
    badgeLabel: 'ENTERPRISE SPEC',
    badgeSub: 'SERIES D FINANCING',
    badgeBg: 'bg-gradient-to-r from-purple-700 to-indigo-700',
    badgeText: 'text-white',
    title: '201/201 otomatik test güvenilirliği, RFC 7807 problem ayrıntıları ve 2FA TOTP protokolü.',
    image: '/images/hardware-core.jpg',
    ctaText: 'READ MORE',
    actionType: 'telemetry',
  },
  {
    id: 'batch-retention',
    badgeType: 'ieee',
    badgeLabel: 'SPRING BATCH 5',
    badgeSub: 'CHUNK ARCHITECTURE',
    badgeBg: 'bg-emerald-600',
    badgeText: 'text-white',
    title: '100\'lük chunk işleyicisi ve soft-delete retention purge ile veritabanı temizleme otomasyonu.',
    image: '/images/architecture-cutaway.jpg',
    ctaText: 'READ MORE',
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

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleAction = (item: StoryItem) => {
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
    <section className="bg-zinc-950 dark:bg-[#07080a] text-white py-12 sm:py-16 border-b border-white/[0.08] transition-colors select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Stories Title on Left, Circular Arrows on Right (Direct Ride Also Screenshot 1) */}
        <div className="flex items-center justify-between pb-6 sm:pb-8">
          <div>
            <div className="text-[10px] font-mono font-bold tracking-widest text-[#a855f7] uppercase mb-1">
              RIDE ALSO INDUSTRIAL EDITORIAL // V4.1
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Stories
            </h2>
          </div>

          {/* Carousel Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer hover:scale-105 active:scale-95 btn-tactile"
              title="Önceki Hikayeler"
              aria-label="Önceki Hikayeler"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer hover:scale-105 active:scale-95 btn-tactile"
              title="Sonraki Hikayeler"
              aria-label="Sonraki Hikayeler"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Container (Smooth Horizontal Snap Scroll) */}
        <div
          ref={scrollContainerRef}
          className="flex gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {STORIES.map((story) => (
            <div
              key={story.id}
              className="min-w-[280px] sm:min-w-[320px] max-w-[340px] flex-shrink-0 snap-start rounded-2xl bg-white text-zinc-950 p-4 sm:p-5 flex flex-col justify-between shadow-xl border border-black/5 hover:-translate-y-1 transition-transform duration-300 group"
            >
              <div className="space-y-4">
                {/* Story Image / Graphic Area with Award Badge Overlay */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900 border border-black/10">
                  {story.image && (
                    <Image
                      src={story.image}
                      alt={story.title}
                      fill
                      sizes="(max-width: 768px) 280px, 340px"
                      className="object-cover transition-transform group-hover:scale-105 duration-700 ease-out"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  {/* Award / Brand Badge (Matching Screenshot 1 TIME / RedDot / FastCompany / ALSO. badges) */}
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

                {/* Story Headline */}
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 leading-snug line-clamp-3">
                  {story.title}
                </h3>
              </div>

              {/* Ride Also Iconic Black Pill Button: [READ MORE] */}
              <div className="pt-5">
                <button
                  onClick={() => handleAction(story)}
                  className="px-5 py-2 rounded-full bg-black text-white hover:bg-zinc-800 text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer btn-tactile shadow-sm"
                >
                  {story.ctaText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
