'use client';

import React, { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Bell } from 'lucide-react';

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

const BULLETINS: BulletinItem[] = [
  {
    id: 'loom-release',
    typeBadge: 'SÜRÜM DUYURUSU // V4.1.1',
    typeColor: 'bg-emerald-500 text-black',
    date: '9 KAS 2026',
    headline: '"SPRING BOOT 4.1.1 + JAVA 22 LOOM SANAL THREAD MİMARİSİ CANLI ORTAMDA DEVREYE ALINDI"',
    description: 'Tomcat OS thread havuzu sınırlaması kaldırıldı; 10.000 sanal thread ile sub-milisaniye gecikme sağlandı.',
    statusTag: 'CANLI // ONLINE',
    source: 'NOVA CORE ENGINEERING',
  },
  {
    id: 'security-bulletin',
    typeBadge: 'GÜVENLİK PROTOKOLÜ // 2FA',
    typeColor: 'bg-purple-900 text-white',
    date: '7 KAS 2026',
    headline: '"RFC 7807 PROBLEM STANDARDI VE 2FA TOTP PRE-AUTH STATE MACHINE AKTİF"',
    description: 'Şifre doğrulamasında geçici PRE_AUTH JWT tahsis edilir; TOTP onayından sonra tam yetki verilir.',
    statusTag: 'RFC 7807 SPEC',
    source: 'SECURITY // STATE MACHINE',
  },
  {
    id: 'spring-ai-vector',
    typeBadge: 'AI VEKTÖR MOTORU // 128D',
    typeColor: 'bg-blue-600 text-white',
    date: '5 KAS 2026',
    headline: '"SPRING AI 128 BOYUTLU KOSİNÜS VEKTÖR UZAYI VE RRF HİBRİT ARAMA YAYINLANDI"',
    description: 'Klasik SQL LIKE araması geride bırakılarak makaleler arasındaki anlamsal bağlam yakalanıyor.',
    statusTag: 'pgvector 128-DIM',
    source: 'SPRING AI LAB REPORT',
  },
  {
    id: 'batch-automation',
    typeBadge: 'ETL OTOMASYONU // BATCH 5',
    typeColor: 'bg-amber-500 text-black',
    date: '3 KAS 2026',
    headline: '"SOFT-DELETE 30 GÜNLÜK RETENTION PURGE VE YAZAR ETKİLEŞİM RAPORLAMA JOB\'I"',
    description: '100 kayıtlık chunk işleyicisi her gece veritabanını temizler ve yazar analitiklerini üretir.',
    statusTag: 'CHUNK SIZE: 100',
    source: 'DATA PIPELINE SPEC',
  },
  {
    id: 'reliability-audit',
    typeBadge: 'MİMARİ TEST MATRİSİ',
    typeColor: 'bg-[#d4f933] text-black',
    date: '1 KAS 2026',
    headline: '"201/201 OTOMATİK TEST (%100 BAŞARI) VE SANİYEDE 12.4K SAYAÇ ENGELLENMESİ DOĞRULANDI"',
    description: 'Birim, entegrasyon, vektör projeksiyonu ve eşzamanlılık testlerinin tamamı yeşil olarak belgelendi.',
    statusTag: '201/201 TESTS PASS',
    source: 'BENCHMARK AUDIT // 2026',
  },
];

export const PressReviewsCarousel: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activePageIndex, setActivePageIndex] = useState(1);

  // Drag-to-scroll state
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const cardWidth = 360;
      const index = Math.min(
        BULLETINS.length,
        Math.max(1, Math.round(scrollLeft / cardWidth) + 1)
      );
      setActivePageIndex(index);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftPos(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
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
    <section className="bg-[#8c52ff] dark:bg-[#7232e8] text-white py-14 sm:py-18 border-b border-black/10 select-none transition-colors overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Announcements & Press on Left, 01/05 Counter & Arrows on Right */}
        <div className="flex items-center justify-between pb-6 sm:pb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-[#d4f933] uppercase">
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              <span>SİSTEM BÜLTENİ & MİMARÎ DUYURULAR // V4.1</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>In the Press & Announcements</span>
            </h2>
          </div>

          {/* Right Controls: Index Counter + Circular White Arrows */}
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs font-bold text-white/90 tracking-widest">
              0{activePageIndex} / 0{BULLETINS.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                className="w-9 h-9 rounded-full bg-white hover:bg-zinc-100 text-black flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md btn-tactile"
                title="Önceki Duyurular"
                aria-label="Önceki Duyurular"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-9 h-9 rounded-full bg-white hover:bg-zinc-100 text-black flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md btn-tactile"
                title="Sonraki Duyurular"
                aria-label="Sonraki Duyurular"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Drag-to-Scroll Horizontal Snap Bulletin Cards */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 -mx-4 px-4 sm:mx-0 sm:px-0 ${
            isMouseDown ? 'cursor-grabbing select-none' : 'cursor-grab'
          }`}
        >
          {BULLETINS.map((item) => (
            <div
              key={item.id}
              className="min-w-[300px] sm:min-w-[360px] max-w-[390px] flex-shrink-0 snap-start rounded-2xl bg-white text-zinc-950 p-6 sm:p-7 flex flex-col justify-between h-[230px] shadow-xl border border-black/5 hover:-translate-y-1 transition-transform duration-300"
            >
              {/* Card Header: Type Badge & Date */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${item.typeColor}`}>
                    {item.typeBadge}
                  </span>
                  <span className="text-zinc-400 font-semibold">{item.date}</span>
                </div>

                {/* Headline Quote */}
                <h3 className="font-mono text-xs sm:text-[13px] font-bold leading-snug text-zinc-950 tracking-tight">
                  {item.headline}
                </h3>

                <p className="text-xs text-zinc-500 font-sans line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Card Footer: Source & Live Status Pill */}
              <div className="pt-3 border-t border-black/[0.08] flex items-center justify-between text-[10px] font-mono">
                <span className="font-bold text-zinc-900 tracking-wider uppercase">
                  {item.source}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-zinc-100 text-[#8c52ff] font-bold">
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
