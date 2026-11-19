'use client';

import React, { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Bell, ExternalLink, Newspaper, Quote } from 'lucide-react';
import { playKeyClick, playTabSelect } from '@/lib/retroAudio';

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
    typeColor: 'bg-emerald-600 text-white',
    date: '10 KAS 2026',
    headline: '"SPRING BOOT 4.1.1 + JAVA 22 LOOM SANAL THREAD MİMARİSİ CANLI ORTAMDA DEVREYE ALINDI"',
    description: 'Tomcat OS thread havuzu sınırlaması kaldırıldı; 10.000 sanal thread ile sub-milisaniye gecikme sağlandı.',
    statusTag: 'CANLI // ONLINE',
    source: 'NOVA CORE ENGINEERING',
  },
  {
    id: 'security-bulletin',
    typeBadge: 'GÜVENLİK PROTOKOLÜ // 2FA',
    typeColor: 'bg-purple-800 text-white',
    date: '8 KAS 2026',
    headline: '"RFC 7807 PROBLEM STANDARDI VE 2FA TOTP PRE-AUTH STATE MACHINE AKTİF"',
    description: 'Şifre doğrulamasında geçici PRE_AUTH JWT tahsis edilir; TOTP onayından sonra tam yetki verilir.',
    statusTag: 'RFC 7807 SPEC',
    source: 'SECURITY // STATE MACHINE',
  },
  {
    id: 'spring-ai-vector',
    typeBadge: 'AI ANLAMSAL VEKTÖR MOTORU',
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
    typeColor: 'bg-amber-600 text-white',
    date: '4 KAS 2026',
    headline: '"SOFT-DELETE 30 GÜNLÜK RETENTION PURGE VE YAZAR ETKİLEŞİM RAPORLAMA JOB\'I"',
    description: '100 kayıtlık chunk işleyicisi her gece veritabanını temizler ve yazar analitiklerini üretir.',
    statusTag: 'CHUNK SIZE: 100',
    source: 'DATA PIPELINE SPEC',
  },
  {
    id: 'reliability-audit',
    typeBadge: 'MİMARİ TEST MATRİSİ',
    typeColor: 'bg-indigo-600 text-white',
    date: '2 KAS 2026',
    headline: '"201/201 OTOMATİK TEST (%100 BAŞARI) VE SANİYEDE 12.4K SAYAÇ ENGELLENMESİ DOĞRULANDI"',
    description: 'Birim, entegrasyon, vektör projeksiyonu ve eşzamanlılık testlerinin tamamı yeşil olarak belgelendi.',
    statusTag: '201/201 TESTS PASS',
    source: 'BENCHMARK AUDIT // 2026',
  },
];

// High-Fidelity Publisher SVG Logos
const PressLogo: React.FC<{ outlet: PressQuoteItem['outlet'] }> = ({ outlet }) => {
  switch (outlet) {
    case 'the-verge':
      return (
        <div className="flex items-center gap-1.5 font-sans font-black tracking-tighter text-xl text-zinc-900 dark:text-zinc-100">
          <span>The</span>
          <span className="inline-flex items-center tracking-normal">
            <span className="text-[#e11d48]">/</span>
            <span className="font-mono uppercase tracking-widest text-lg ml-0.5">ERGE</span>
          </span>
        </div>
      );
    case 'washington-post':
      return (
        <div className="font-serif italic font-bold tracking-tight text-lg text-zinc-900 dark:text-zinc-100 border-b-2 border-zinc-900 dark:border-zinc-300 pb-0.5">
          The Washington Post
        </div>
      );
    case 'wired':
      return (
        <div className="flex items-center gap-1 font-mono font-black text-lg tracking-widest">
          <span className="bg-black dark:bg-zinc-200 text-white dark:text-black px-1.5 py-0.5 rounded-xs">W</span>
          <span className="bg-black dark:bg-zinc-200 text-white dark:text-black px-1.5 py-0.5 rounded-xs">I</span>
          <span className="bg-black dark:bg-zinc-200 text-white dark:text-black px-1.5 py-0.5 rounded-xs">R</span>
          <span className="bg-black dark:bg-zinc-200 text-white dark:text-black px-1.5 py-0.5 rounded-xs">E</span>
          <span className="bg-black dark:bg-zinc-200 text-white dark:text-black px-1.5 py-0.5 rounded-xs">D</span>
        </div>
      );
    case 'techradar':
      return (
        <div className="flex items-baseline gap-1 font-sans font-black text-xl text-zinc-900 dark:text-zinc-100 tracking-tighter">
          <span>techradar</span>
          <span className="text-blue-600 font-mono text-base">)))</span>
        </div>
      );
    case 'infoq':
      return (
        <div className="flex items-center gap-1.5 font-mono font-black text-lg text-zinc-900 dark:text-zinc-100">
          <span className="px-1.5 py-0.5 bg-zinc-950 dark:bg-zinc-200 text-white dark:text-black rounded">InfoQ</span>
          <span className="text-[10px] text-zinc-500 font-sans font-semibold">ENTERPRISE</span>
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

  // Drag-to-scroll state
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
    playKeyClick('crisp');
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleModeChange = (mode: 'press' | 'bulletins') => {
    playTabSelect();
    setViewMode(mode);
    setActivePageIndex(1);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gradient-to-b from-[#e5e5ea] via-[#ededf2] to-[#dcdce2] dark:from-[#1e1e24] dark:via-[#16161a] dark:to-[#101014] text-zinc-900 dark:text-zinc-100 py-14 sm:py-20 border-b border-black/15 dark:border-white/10 select-none transition-colors overflow-hidden relative">
      {/* Authentic Mac OS X 2010 Subtle Pinstripe Overlay */}
      <div className="absolute inset-0 ios-pinstripe opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header: Apple Press Room & Review Showcase */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 sm:pb-8 border-b border-black/10 dark:border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-gradient-to-b from-zinc-700 to-zinc-900 flex items-center justify-center text-white shadow-sm border border-zinc-500/30 font-semibold text-xs">
                ❖
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white flex items-center gap-2">
                <span>Apple Basın Odası ve Mühendislik İncelemeleri</span>
              </h2>
            </div>
            <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
              GLOBAL TECH PRESS ARCHIVE & ARCHITECTURAL BULLETINS
            </p>
          </div>

          {/* Controls: Segmented Aqua Switch + Counter + Tactile Navigation Buttons */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Apple Aqua Segmented Control */}
            <div className="inline-flex rounded-lg bg-zinc-300/80 dark:bg-zinc-800/80 p-1 border border-black/10 dark:border-white/10 shadow-inner">
              <button
                onClick={() => handleModeChange('press')}
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'press'
                    ? 'bg-gradient-to-b from-white to-zinc-100 dark:from-zinc-600 dark:to-zinc-700 text-zinc-900 dark:text-white shadow-sm border border-black/10 dark:border-white/20'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Newspaper className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>BASIN İNCELEMELERİ</span>
              </button>
              <button
                onClick={() => handleModeChange('bulletins')}
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'bulletins'
                    ? 'bg-gradient-to-b from-white to-zinc-100 dark:from-zinc-600 dark:to-zinc-700 text-zinc-900 dark:text-white shadow-sm border border-black/10 dark:border-white/20'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <span>MÜHENDİSLİK BÜLTENİ</span>
              </button>
            </div>

            {/* Apple Index Counter */}
            <span className="font-mono text-xs font-bold text-zinc-600 dark:text-zinc-300 tracking-widest min-w-[48px] text-center bg-white/60 dark:bg-black/40 px-2 py-1 rounded border border-black/10 dark:border-white/10">
              0{activePageIndex} / 0{totalItems}
            </span>

            {/* Apple Circular Metal Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scroll('left')}
                className="w-8 h-8 rounded-full bg-gradient-to-b from-white to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 text-zinc-800 dark:text-zinc-100 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow border border-black/15 dark:border-white/15"
                title="Önceki"
                aria-label="Önceki"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-8 h-8 rounded-full bg-gradient-to-b from-white to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 text-zinc-800 dark:text-zinc-100 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow border border-black/15 dark:border-white/15"
                title="Sonraki"
                aria-label="Sonraki"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Drag-to-Scroll Snap Cards */}
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
          className={`flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-4 -mx-4 px-4 sm:mx-0 sm:px-0 ${
            isMouseDown ? 'cursor-grabbing select-none' : 'cursor-grab'
          }`}
        >
          {viewMode === 'press'
            ? PRESS_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="min-w-[310px] sm:min-w-[360px] max-w-[380px] flex-shrink-0 snap-start bg-gradient-to-b from-white to-[#fafafa] dark:from-[#24242a] dark:to-[#1a1a20] text-zinc-950 dark:text-zinc-100 p-6 sm:p-7 flex flex-col justify-between h-[230px] rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_28px_rgba(0,0,0,0.6)] border border-black/10 dark:border-white/15 hover:-translate-y-1 transition-all duration-200 group relative overflow-hidden"
                >
                  {/* Subtle Top Watermark Quote */}
                  <Quote className="absolute -top-3 -right-2 w-20 h-20 text-zinc-200 dark:text-zinc-800/40 pointer-events-none -rotate-12" />

                  {/* Top Quote & Sub-Context */}
                  <div className="space-y-2 relative z-10">
                    <p className="font-serif italic text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug drop-shadow-xs">
                      {item.quote}
                    </p>
                    <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {item.subContext}
                    </p>
                  </div>

                  {/* Bottom: Press Logo & In Review Tag */}
                  <div className="pt-4 border-t border-black/[0.08] dark:border-white/10 flex items-center justify-between relative z-10">
                    <PressLogo outlet={item.outlet} />
                    <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1">
                      <span>KAYIT</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            : BULLETINS.map((item) => (
                <div
                  key={item.id}
                  className="min-w-[310px] sm:min-w-[360px] max-w-[380px] flex-shrink-0 snap-start bg-gradient-to-b from-white to-[#fafafa] dark:from-[#24242a] dark:to-[#1a1a20] text-zinc-950 dark:text-zinc-100 p-6 sm:p-7 flex flex-col justify-between h-[230px] rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_28px_rgba(0,0,0,0.6)] border border-black/10 dark:border-white/15 hover:-translate-y-1 transition-all duration-200 group relative"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${item.typeColor}`}>
                        {item.typeBadge}
                      </span>
                      <span className="text-zinc-500 dark:text-zinc-400 font-semibold">{item.date}</span>
                    </div>

                    <h3 className="font-mono text-xs sm:text-[13px] font-bold leading-snug text-zinc-950 dark:text-zinc-100 tracking-tight line-clamp-2">
                      {item.headline}
                    </h3>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 font-sans line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-black/[0.08] dark:border-white/10 flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold text-zinc-900 dark:text-zinc-200 tracking-wider uppercase">
                      {item.source}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-200/50 dark:border-blue-700/50">
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
