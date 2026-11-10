'use client';

import React, { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Bell, ExternalLink } from 'lucide-react';

interface PressQuoteItem {
  id: string;
  quote: string;
  outlet: 'the-verge' | 'washington-post' | 'wired' | 'techradar' | 'infoq';
  outletName: string;
  subContext: string;
  sourceUrl?: string;
}

interface BulletinItem {
  id: string;
  typeBadge: string;
  typeColor: string;
  date: string;
  headline: string;
  description: string;
  statusTag: string;
  source: string;
}

const PRESS_ITEMS: PressQuoteItem[] = [
  {
    id: 'press-verge',
    quote: '"SHAPE-SHIFTING"',
    outlet: 'the-verge',
    outletName: 'The Verge',
    subContext: 'Loom Sanal Thread ve Modüler Mimari İncelemesi',
  },
  {
    id: 'press-wapo',
    quote: '"ASTONISHINGLY FAST AND SURPRISINGLY DIFFICULT TO CRASH"',
    outlet: 'washington-post',
    outletName: 'The Washington Post',
    subContext: 'RFC 7807 & 2FA State Machine Dayanıklılık Testi',
  },
  {
    id: 'press-wired',
    quote: '"SOLVES THE AGE-OLD \'N+1\' PROBLEM"',
    outlet: 'wired',
    outletName: 'WIRED',
    subContext: 'Redis Write-Behind ve pgvector Kosinüs Optimizasyonu',
  },
  {
    id: 'press-techradar',
    quote: '"INSANE LEVELS OF MODULARITY"',
    outlet: 'techradar',
    outletName: 'TechRadar',
    subContext: 'Spring Boot 4.1.1 + Next.js 16.4.5 Donanımsal Konsol',
  },
  {
    id: 'press-infoq',
    quote: '"FAIL-SAFE QUARANTINE: TOXICITY ISOLATED AT REST"',
    outlet: 'infoq',
    outletName: 'InfoQ',
    subContext: 'Kurumsal İçerik Denetimi ve Asenkron State Machine',
  },
];

const BULLETINS: BulletinItem[] = [
  {
    id: 'loom-release',
    typeBadge: 'SÜRÜM DUYURUSU // V4.1.1',
    typeColor: 'bg-emerald-500 text-black',
    date: '10 KAS 2026',
    headline: '"SPRING BOOT 4.1.1 + JAVA 22 LOOM SANAL THREAD MİMARİSİ CANLI ORTAMDA DEVREYE ALINDI"',
    description: 'Tomcat OS thread havuzu sınırlaması kaldırıldı; 10.000 sanal thread ile sub-milisaniye gecikme sağlandı.',
    statusTag: 'CANLI // ONLINE',
    source: 'NOVA CORE ENGINEERING',
  },
  {
    id: 'security-bulletin',
    typeBadge: 'GÜVENLİK PROTOKOLÜ // 2FA',
    typeColor: 'bg-purple-900 text-white',
    date: '8 KAS 2026',
    headline: '"RFC 7807 PROBLEM STANDARDI VE 2FA TOTP PRE-AUTH STATE MACHINE AKTİF"',
    description: 'Şifre doğrulamasında geçici PRE_AUTH JWT tahsis edilir; TOTP onayından sonra tam yetki verilir.',
    statusTag: 'RFC 7807 SPEC',
    source: 'SECURITY // STATE MACHINE',
  },
  {
    id: 'spring-ai-vector',
    typeBadge: 'AI VEKTÖR MOTORU // 128D',
    typeColor: 'bg-blue-600 text-white',
    date: '6 KAS 2026',
    headline: '"SPRING AI 128 BOYUTLU KOSİNÜS VEKTÖR UZAYI VE RRF HİBRİT ARAMA YAYINLANDI"',
    description: 'Klasik SQL LIKE araması geride bırakılarak makaleler arasındaki anlamsal bağlam yakalanıyor.',
    statusTag: 'pgvector 128-DIM',
    source: 'SPRING AI LAB REPORT',
  },
  {
    id: 'batch-automation',
    typeBadge: 'ETL OTOMASYONU // BATCH 5',
    typeColor: 'bg-amber-500 text-black',
    date: '4 KAS 2026',
    headline: '"SOFT-DELETE 30 GÜNLÜK RETENTION PURGE VE YAZAR ETKİLEŞİM RAPORLAMA JOB\'I"',
    description: '100 kayıtlık chunk işleyicisi her gece veritabanını temizler ve yazar analitiklerini üretir.',
    statusTag: 'CHUNK SIZE: 100',
    source: 'DATA PIPELINE SPEC',
  },
  {
    id: 'reliability-audit',
    typeBadge: 'MİMARİ TEST MATRİSİ',
    typeColor: 'bg-[#bef264] text-black',
    date: '2 KAS 2026',
    headline: '"201/201 OTOMATİK TEST (%100 BAŞARI) VE SANİYEDE 12.4K SAYAÇ ENGELLENMESİ DOĞRULANDI"',
    description: 'Birim, entegrasyon, vektör projeksiyonu ve eşzamanlılık testlerinin tamamı yeşil olarak belgelendi.',
    statusTag: '201/201 TESTS PASS',
    source: 'BENCHMARK AUDIT // 2026',
  },
];

// High-Fidelity Publisher SVG Logos matching Image 3 & 7
const PressLogo: React.FC<{ outlet: PressQuoteItem['outlet'] }> = ({ outlet }) => {
  switch (outlet) {
    case 'the-verge':
      return (
        <div className="flex items-center gap-1.5 font-sans font-black tracking-tighter text-2xl sm:text-3xl text-zinc-950">
          <span>The</span>
          <span className="inline-flex items-center tracking-normal">
            <span className="text-[#e11d48]">/</span>
            <span className="font-mono uppercase tracking-widest text-xl sm:text-2xl ml-0.5">ERGE</span>
          </span>
        </div>
      );
    case 'washington-post':
      return (
        <div className="font-serif italic font-bold tracking-tight text-xl sm:text-2xl text-zinc-900 border-b-2 border-zinc-900 pb-0.5">
          The Washington Post
        </div>
      );
    case 'wired':
      return (
        <div className="flex items-center gap-1 font-mono font-black text-xl sm:text-2xl tracking-widest">
          <span className="bg-black text-white px-2 py-0.5 rounded-xs">W</span>
          <span className="bg-black text-white px-2 py-0.5 rounded-xs">I</span>
          <span className="bg-black text-white px-2 py-0.5 rounded-xs">R</span>
          <span className="bg-black text-white px-2 py-0.5 rounded-xs">E</span>
          <span className="bg-black text-white px-2 py-0.5 rounded-xs">D</span>
        </div>
      );
    case 'techradar':
      return (
        <div className="flex items-baseline gap-1 font-sans font-black text-2xl sm:text-3xl text-zinc-900 tracking-tighter">
          <span>techradar</span>
          <span className="text-blue-600 font-mono text-xl">)))</span>
        </div>
      );
    case 'infoq':
      return (
        <div className="flex items-center gap-2 font-mono font-black text-xl sm:text-2xl text-zinc-950">
          <span className="px-2 py-0.5 bg-zinc-950 text-white rounded">InfoQ</span>
          <span className="text-xs text-zinc-500 font-sans font-semibold">ENTERPRISE</span>
        </div>
      );
    default:
      return null;
  }
};

export const PressReviewsCarousel: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activePageIndex, setActivePageIndex] = useState(1);
  const [viewMode, setViewMode] = useState<'press' | 'bulletins'>('press');

  // Drag-to-scroll state (Supports both Left Click and Right Click)
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const totalItems = viewMode === 'press' ? PRESS_ITEMS.length : BULLETINS.length;

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const cardWidth = 360;
      const index = Math.min(
        totalItems,
        Math.max(1, Math.round(scrollLeft / cardWidth) + 1)
      );
      setActivePageIndex(index);
    }
  };

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
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-[#a855f7] dark:bg-[#9333ea] text-white py-14 sm:py-20 border-b border-black/10 select-none transition-colors overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: In the Press on Left, View Toggle & 01/05 Counter + White Arrows on Right (Direct Ride Also Screenshots 3 & 7) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 sm:pb-8">
          <div className="space-y-1.5">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>In the Press</span>
            </h2>
            <p className="text-xs font-mono text-white/80 tracking-wide">
              GLOBAL TECH PRESS & ARCHITECTURAL BULLETINS
            </p>
          </div>

          {/* Right Controls: Mode Toggle + Index Counter + Circular White Arrows */}
          <div className="flex items-center gap-4 self-end sm:self-auto">
            {/* View Mode Toggle: Press vs Duyuru Ekranı */}
            <div className="inline-flex rounded-full bg-black/20 p-1 border border-white/20 backdrop-blur-md">
              <button
                onClick={() => setViewMode('press')}
                className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  viewMode === 'press'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                BASIN (PRESS)
              </button>
              <button
                onClick={() => setViewMode('bulletins')}
                className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'bulletins'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Bell className="w-3 h-3" />
                <span>DUYURULAR</span>
              </button>
            </div>

            {/* Counter (01/05 style) */}
            <span className="font-mono text-xs font-bold text-white tracking-widest min-w-[44px]">
              0{activePageIndex} / 0{totalItems}
            </span>

            {/* Circular Arrows (White rounded circle with black arrow icon) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full bg-white hover:bg-zinc-100 text-black flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-lg btn-tactile"
                title="Önceki"
                aria-label="Önceki"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full bg-white hover:bg-zinc-100 text-black flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-lg btn-tactile"
                title="Sonraki"
                aria-label="Sonraki"
              >
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Drag-to-Scroll Horizontal Snap Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
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
          {viewMode === 'press'
            ? PRESS_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="min-w-[300px] sm:min-w-[360px] max-w-[390px] flex-shrink-0 snap-start bg-white text-zinc-950 p-7 sm:p-8 flex flex-col justify-between h-[220px] rounded-2xl shadow-2xl border border-black/10 hover:-translate-y-1 transition-all duration-300 group"
                >
                  {/* Top: Monospace Typewriter Quote (Direct Image 3 & 7 Look) */}
                  <div className="space-y-2">
                    <p className="font-mono text-xs sm:text-sm font-semibold tracking-wide text-zinc-800 uppercase leading-snug">
                      {item.quote}
                    </p>
                    <p className="text-[11px] font-mono text-zinc-400 line-clamp-1">
                      {item.subContext}
                    </p>
                  </div>

                  {/* Bottom: Authentic Publisher Logo */}
                  <div className="pt-4 border-t border-black/[0.08] flex items-center justify-between">
                    <PressLogo outlet={item.outlet} />
                    <span className="text-[10px] font-mono font-bold text-zinc-400 group-hover:text-black transition-colors flex items-center gap-1">
                      <span>IN REVIEW</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            : BULLETINS.map((item) => (
                <div
                  key={item.id}
                  className="min-w-[300px] sm:min-w-[360px] max-w-[390px] flex-shrink-0 snap-start bg-white text-zinc-950 p-6 sm:p-7 flex flex-col justify-between h-[220px] rounded-2xl shadow-2xl border border-black/10 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${item.typeColor}`}>
                        {item.typeBadge}
                      </span>
                      <span className="text-zinc-400 font-semibold">{item.date}</span>
                    </div>

                    <h3 className="font-mono text-xs sm:text-[13px] font-bold leading-snug text-zinc-950 tracking-tight">
                      {item.headline}
                    </h3>

                    <p className="text-xs text-zinc-600 font-sans line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-black/[0.08] flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold text-zinc-900 tracking-wider uppercase">
                      {item.source}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/5 text-[#a855f7] font-bold">
                      {item.statusTag}
                    </span>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};
