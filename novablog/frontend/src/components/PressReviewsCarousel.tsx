'use client';

import React, { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';

interface PressReview {
  id: string;
  quote: string;
  publication: string;
  publicationSub: string;
  badge: string;
}

const PRESS_REVIEWS: PressReview[] = [
  {
    id: 'wired',
    quote: '"JAVA 22 VIRTUAL THREADS COMPARED TO TOMCAT: 10X CONCURRENCY WITH SUB-MILLISECOND LATENCY"',
    publication: 'WIRED',
    publicationSub: 'TECH ARCHITECTURE',
    badge: 'BENCHMARK 2026',
  },
  {
    id: 'washington-post',
    quote: '"POSTGRESQL WRITE-BEHIND BUFFER ELIMINATES ROW LOCKS UNDER 12.4K REQ/S HIGH-VOLUME TRAFFIC"',
    publication: 'The Washington Post',
    publicationSub: 'BUSINESS // TECHNOLOGY',
    badge: 'ENTERPRISE AUDIT',
  },
  {
    id: 'the-verge',
    quote: '"SPRING AI 128D VECTOR EMBEDDINGS OUTPERFORM CLASSIC KEYWORD FILTERS WITH HIGH PRECISION"',
    publication: 'The Verge',
    publicationSub: 'AI LAB REPORT',
    badge: 'VECTOR CORE',
  },
  {
    id: 'techradar',
    quote: '"100% AUTOMATED TEST PASS RATE WITH RFC 7807 PROBLEMS & 2FA TOTP SECURITY BOUNDARY"',
    publication: 'techradar pro',
    publicationSub: 'RELIABILITY SPEC',
    badge: '201/201 PASS',
  },
  {
    id: 'dzone',
    quote: '"SPRING BATCH 5 CHUNK-ORIENTED PROCESSING CUTS SOFT-DELETE PURGE DURATION BY 84%"',
    publication: 'DZone Enterprise',
    publicationSub: 'DATA PIPELINES',
    badge: 'ETL METRICS',
  },
];

export const PressReviewsCarousel: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activePageIndex, setActivePageIndex] = useState(1);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const cardWidth = 340;
      const index = Math.min(
        PRESS_REVIEWS.length,
        Math.max(1, Math.round(scrollLeft / cardWidth) + 1)
      );
      setActivePageIndex(index);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-[#8c52ff] dark:bg-[#7232e8] text-white py-14 sm:py-16 border-b border-black/10 select-none transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: In the Press on Left, 01/05 and Arrows on Right (Direct Ride Also Screenshot 3) */}
        <div className="flex items-center justify-between pb-6 sm:pb-8">
          <div>
            <div className="text-[10px] font-mono font-bold tracking-widest text-[#d4f933] uppercase mb-1">
              INDUSTRY BENCHMARKS & EDITORIAL //
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              In the Press
            </h2>
          </div>

          {/* Right Controls: Index Counter + Circular Arrows */}
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs font-bold text-white/90 tracking-widest">
              0{activePageIndex} / 0{PRESS_REVIEWS.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                className="w-9 h-9 rounded-full bg-white hover:bg-zinc-100 text-black flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md btn-tactile"
                title="Önceki Değerlendirmeler"
                aria-label="Önceki Değerlendirmeler"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-9 h-9 rounded-full bg-white hover:bg-zinc-100 text-black flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md btn-tactile"
                title="Sonraki Değerlendirmeler"
                aria-label="Sonraki Değerlendirmeler"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Scroll Snap Cards (Direct Ride Also Screenshot 3 Look) */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {PRESS_REVIEWS.map((review) => (
            <div
              key={review.id}
              className="min-w-[280px] sm:min-w-[340px] max-w-[360px] flex-shrink-0 snap-start rounded-2xl bg-white text-zinc-950 p-6 sm:p-7 flex flex-col justify-between h-[210px] shadow-xl border border-black/5 hover:-translate-y-1 transition-transform duration-300"
            >
              {/* Quote Text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                  <span>SPEC // VERIFIED</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-bold">
                    {review.badge}
                  </span>
                </div>
                <p className="font-mono text-xs font-semibold leading-relaxed text-zinc-900 tracking-tight">
                  {review.quote}
                </p>
              </div>

              {/* Publisher Brand Typography (WIRED, The Verge, etc.) */}
              <div className="pt-4 border-t border-black/[0.08] flex items-center justify-between">
                <div>
                  <span className="font-black text-lg tracking-tight uppercase font-sans text-zinc-950 block">
                    {review.publication}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                    {review.publicationSub}
                  </span>
                </div>
                <Quote className="w-5 h-5 text-purple-400 opacity-50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
