'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  ArrowDown,
  Cpu,
  Zap,
  Activity,
  Layers,
  Database,
  Radio,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

interface HeroSectionProps {
  onExploreAI: () => void;
  onOpenCreateModal: () => void;
  onOpenArchitectureConsole?: () => void;
}

interface SlideContent {
  tag: string;
  badge: string;
  title1: string;
  title2: string;
  description: string;
  image: string;
  primaryCta: string;
  primaryIcon: 'cpu' | 'terminal' | 'zap';
  secondaryCta: string;
  metric1: { label: string; value: string };
  metric2: { label: string; value: string };
  metric3: { label: string; value: string };
}

const SLIDES: SlideContent[] = [
  {
    tag: 'SYSTEM ARCHITECTURE // V4.1.1',
    badge: 'TRANSPARENT CORE // V4.1.1',
    title1: 'YÜKSEK HACİMLİ MİMARİ.',
    title2: 'SIFIR DARBOĞAZ.',
    description:
      'Aynı anda binlerce istek gelse dahi kilitlenmeyen Java 22 Loom sanal iş parçacıkları, anlam ilişkisini kavrayan yapay zeka arama motoru ve yüksek başarımlı Spring Boot 4 mimarisiyle inşa edilmiş teknik mühendislik platformu.',
    image: '/images/architecture-cutaway.jpg',
    primaryCta: 'Vektör Aramayı Başlat',
    primaryIcon: 'cpu',
    secondaryCta: 'Yeni Makale Yaz',
    metric1: { label: 'CONCURRENCY', value: 'Virtual Threads' },
    metric2: { label: 'VECTOR EMBEDDING', value: '128-Dim Cosine' },
    metric3: { label: 'EVENTUAL SYNC', value: 'Write-Behind 30s' },
  },
  {
    tag: 'TACTILE ARCHITECTURE CONSOLE // HUD SPEC',
    badge: 'SYSTEM TELEMETRY // V4.1.1',
    title1: 'MİKROSANİYE TELEMETRİSİ.',
    title2: '12.4K REQ/S THROUGHPUT.',
    description:
      'Dieter Rams ve Teenage Engineering dokunsal tasarım felsefesini canlı sistem telemetrisiyle buluşturan mimari konsol. Gerçek zamanlı istek akışını, önbellek senkronizasyonunu ve eşzamanlılık simülasyonlarını interaktif olarak keşfedin.',
    image: '/images/terminal-hardware.jpg',
    primaryCta: 'Mimari Konsolu Aç',
    primaryIcon: 'terminal',
    secondaryCta: 'Telemetriyi İncele',
    metric1: { label: 'THROUGHPUT', value: '12.4K req/s' },
    metric2: { label: 'SUBCYCLE LATENCY', value: '0.2ms Sub-Tick' },
    metric3: { label: 'TELEMETRY JITTER', value: '< 0.1ms Jitter' },
  },
  {
    tag: 'ENTERPRISE SECURITY // ZERO-TRUST ARCHITECTURE',
    badge: 'ZERO-TRUST & 201 TESTS',
    title1: 'MÜHENDİSLİK İÇİN TASARLANDI.',
    title2: 'GÜVENLİ & HIZLI.',
    description:
      '201 birim ve entegrasyon testiyle %100 doğrulanmış, iki faktörlü (2FA TOTP) kimlik doğrulama ve veri kaybını önleyen kilitlenme-karşıtı mimariyle donatılmış kurumsal dayanıklılık altyapısı.',
    image: '/images/lifestyle-hero.jpg',
    primaryCta: 'Simülatörü Başlat',
    primaryIcon: 'zap',
    secondaryCta: 'Şartnameyi İncele',
    metric1: { label: 'TEST COVERAGE', value: '201/201 (%100)' },
    metric2: { label: 'AUTH PROTOCOL', value: '2FA TOTP + PreAuth' },
    metric3: { label: 'ERROR FORMAT', value: 'RFC 7807 Problem' },
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreAI,
  onOpenCreateModal,
  onOpenArchitectureConsole,
}) => {
  const [activeSlide, setActiveSlide] = useState<0 | 1 | 2>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  const [telemetryTick, setTelemetryTick] = useState(0);

  // Background telemetry tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryTick((prev) => (prev + 1) % 100);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  // Automatic 6-second rotation timer with smooth progress and hover pause
  useEffect(() => {
    if (isPaused) return;
    const intervalMs = 60;
    const totalMs = 6000;
    const step = 100 / (totalMs / intervalMs);

    const timer = setInterval(() => {
      setSlideProgress((prev) => {
        if (prev >= 100) {
          setActiveSlide((s) => ((s + 1) % 3) as 0 | 1 | 2);
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPaused, activeSlide]);

  const handleSelectSlide = (idx: 0 | 1 | 2) => {
    setActiveSlide(idx);
    setSlideProgress(0);
  };

  const slide = SLIDES[activeSlide];
  const simulatedIops = 11400 + ((telemetryTick * 37) % 850);
  const bufferDelta = 12 + ((telemetryTick * 3) % 24);

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden border-b border-black/[0.08] dark:border-white/[0.08] bg-tech-grid transition-colors duration-300"
    >
      {/* Ambient Lighting Gradients */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-gradient-to-br from-[#d4f933]/10 via-cyan-500/5 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[450px] h-[250px] bg-gradient-to-tr from-[#8c52ff]/15 via-indigo-500/5 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 lg:pt-14 lg:pb-16">
        {/* Main Grid: Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Industrial Narrative & CTAs (7 cols) */}
          <div key={`narrative-${activeSlide}`} className="lg:col-span-7 space-y-6 ride-also-drawer-anim">
            {/* Spec Tag & Concept Manifesto */}
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-zinc-900/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-xs font-mono w-fit">
                <span className="w-2 h-2 rounded-full bg-[#d4f933] shadow-[0_0_8px_#d4f933] animate-pulse" />
                <span className="text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                  {slide.tag}
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">|</span>
                <span className="text-zinc-500 dark:text-zinc-400">201/201 TESTS (%100 PASS)</span>
              </div>
              <p className="text-[11px] font-mono font-medium text-purple-600 dark:text-purple-400 tracking-wide uppercase">
                Büyük Veri ve Yoğun Trafik Altında Dahi Milisaniyeler İçinde Yanıt Veren Modern Java 22 &amp; Spring Boot 4 Dağıtık Sistem Mimarisi
              </p>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-zinc-950 dark:text-white leading-[1.05] uppercase">
                {slide.title1}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-400 dark:from-white dark:via-zinc-200 dark:to-zinc-500">
                  {slide.title2}
                </span>
              </h1>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed pt-2">
                {slide.description}
              </p>
            </div>

            {/* Ride Also-Style Dual Pill Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              {/* Primary High-Contrast Volt Pill */}
              <button
                onClick={() => {
                  if (activeSlide === 0) onExploreAI();
                  else if (activeSlide === 1 && onOpenArchitectureConsole) onOpenArchitectureConsole();
                  else if (activeSlide === 2 && onOpenArchitectureConsole) onOpenArchitectureConsole();
                  else onExploreAI();
                }}
                className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#d4f933] hover:bg-[#c4e82b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-[#d4f933]/25 hover:shadow-[#d4f933]/40 active:scale-95 cursor-pointer btn-tactile"
              >
                {slide.primaryIcon === 'cpu' && <Cpu className="w-4 h-4 text-black" />}
                {slide.primaryIcon === 'terminal' && <Terminal className="w-4 h-4 text-black" />}
                {slide.primaryIcon === 'zap' && <Zap className="w-4 h-4 text-black" />}
                <span>{slide.primaryCta}</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Secondary Liquid Glass Capsule Pill */}
              <button
                onClick={() => {
                  if (activeSlide === 2) {
                    const el = document.getElementById('system-blueprint-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    onOpenCreateModal();
                  }
                }}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full glass-liquid hover:border-[#8c52ff]/50 text-zinc-900 dark:text-zinc-100 font-mono font-medium text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer btn-tactile"
              >
                <Sparkles className="w-4 h-4 text-[#8c52ff] dark:text-[#a259ff]" />
                <span>{slide.secondaryCta}</span>
              </button>

              {/* Direct Quick-Jump to Articles */}
              <button
                onClick={() => {
                  const el = document.getElementById('articles-feed');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-mono text-[11px] uppercase tracking-wider transition-colors cursor-pointer border border-transparent hover:border-black/10 dark:hover:border-white/10"
                title="Doğrudan teknik makale ve blog akışına atla"
              >
                <span>MAKALELERE ATLA</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Spec Footnotes */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-black/[0.08] dark:border-white/[0.08] text-xs font-mono">
              <div>
                <div className="text-zinc-400 text-[10px] uppercase">{slide.metric1.label}</div>
                <div className="text-zinc-900 dark:text-white font-bold">{slide.metric1.value}</div>
              </div>
              <div>
                <div className="text-zinc-400 text-[10px] uppercase">{slide.metric2.label}</div>
                <div className="text-zinc-900 dark:text-white font-bold">{slide.metric2.value}</div>
              </div>
              <div>
                <div className="text-zinc-400 text-[10px] uppercase">{slide.metric3.label}</div>
                <div className="text-zinc-900 dark:text-white font-bold">{slide.metric3.value}</div>
              </div>
            </div>
          </div>

          {/* Right Column: Ride Also Product Rendering & Telemetry HUD (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl p-6 glass-liquid border border-black/10 dark:border-white/10 shadow-2xl space-y-5 overflow-hidden hairline-glow">
              {/* HUD Header */}
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.08] dark:border-white/[0.08] text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#a3c900] dark:text-[#d4f933]" />
                  <span className="font-bold text-zinc-900 dark:text-white tracking-wider">
                    ENGINE_TELEMETRY // LIVE
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#a3c900] dark:text-[#d4f933]">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>ONLINE</span>
                </div>
              </div>

              {/* Hardware Visual Preview (Ride Also Product Rendering) with Smooth Zoom Transition */}
              <div key={`visual-${activeSlide}`} className="relative rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 aspect-[16/9] bg-zinc-950 ride-also-drawer-anim">
                <Image
                  src={slide.image}
                  alt={slide.title1}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                  className="object-cover object-center transform hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                {/* Hardware Badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4f933] animate-pulse" />
                  <span>{slide.badge}</span>
                </div>

                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-[#d4f933] font-bold">
                  128D VECTOR CORE
                </div>
              </div>

              {/* Gauge 1: Loom Virtual Threads RPM */}
              <div
                title="NEDEN VAR? Tomcat'in geleneksel 200 iş parçacığı sınırı yerine Project Loom sanal iş parçacıkları ile 10.000+ eşzamanlı istek kilitlenmeden işlenir."
                className="space-y-1.5 cursor-help group"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Eşzamanlı İstek Akışı (Loom)
                  </span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    {simulatedIops.toLocaleString()} istek/sn
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#d4f933] to-emerald-400 transition-all duration-700"
                    style={{ width: `${65 + ((telemetryTick * 17) % 30)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>Hafif Sanal Thread: Aktif</span>
                  <span>Sunucu Kilitlenmesi: 0.0ms (Sıfır)</span>
                </div>
              </div>

              {/* Gauge 2: Redis Write-Behind Buffer Pressure */}
              <div
                title="NEDEN VAR? Her beğeni ve görüntülenmede veritabanı satır kilidi almak yerine sayaçlar Redis Hash'te toplanır ve 30 saniyede bir topluca veritabanına yazılır."
                className="space-y-1.5 cursor-help group"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-rose-400" />
                    Önbellek Tampon Sayaçları
                  </span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    +{bufferDelta} Sayaç Beklemede
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all duration-700"
                    style={{ width: `${25 + (bufferDelta * 2.5)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>Bellekte Toplama: Anlık O(1)</span>
                  <span>Veritabanı Senkronizasyonu: 30sn</span>
                </div>
              </div>

              {/* Gauge 3: Vector Embedding 128D Radar */}
              <div
                title="NEDEN VAR? Klasik arama sadece aynı kelimeleri bulurken, yapay zeka vektör eşleştirmesi aranan konunun gerçek anlamını kavrayarak en alakalı makaleyi getirir."
                className="space-y-1.5 cursor-help group"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    Yapay Zeka Anlamsal İsabeti
                  </span>
                  <span className="font-bold text-emerald-500 dark:text-emerald-400">
                    %94.2 Doğruluk
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-[94.2%]" />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>pgvector Anlam Analizi</span>
                  <span>Akıllı Hibrit Sıralama</span>
                </div>
              </div>

              {/* Spec Footer Pill */}
              <div className="p-3 rounded-2xl bg-black/5 dark:bg-zinc-950/60 border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Veri Çakışma Koruması:
                </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                  İyimser Kilitleme (%100 Güvenli)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. The Signature Ride Also Bottom Slider Indicator Capsule (Screenshots 1 & 5) */}
        <div className="flex justify-center mt-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/85 dark:bg-zinc-900/90 backdrop-blur-md border border-white/10 shadow-2xl">
            {SLIDES.map((_, idx) => {
              const isActive = activeSlide === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectSlide(idx as 0 | 1 | 2)}
                  className="relative group transition-all duration-300 cursor-pointer p-0.5"
                  title={`Slayt 0${idx + 1}`}
                >
                  {isActive ? (
                    <div className="w-8 h-2.5 rounded-full bg-zinc-800 overflow-hidden relative shadow-[0_0_10px_#d4f933]/50">
                      <div
                        className="h-full bg-[#d4f933] transition-all duration-75"
                        style={{ width: `${slideProgress}%` }}
                      />
                    </div>
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-white/40 group-hover:bg-white/80 transition-all duration-200" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Highlight Hardware Architecture Spec Grid */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            onClick={onExploreAI}
            title="Spring AI Semantik Vektör Arama Modülünü Aç"
            className="p-4 rounded-2xl glass-liquid border border-black/10 dark:border-white/10 space-y-1 transition-all duration-300 hover:border-[#8c52ff]/50 hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-purple-600 dark:text-purple-400 font-bold uppercase group-hover:underline">01 // AI CORE</span>
              <span className="text-[10px] text-zinc-400">128D</span>
            </div>
            <div className="text-base font-bold text-zinc-950 dark:text-white">Vektör Arama</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Kosinüs Benzerliği, TL;DR Özet & Otomatik Etiket</p>
          </div>

          <div
            onClick={() => {
              if (onOpenArchitectureConsole) onOpenArchitectureConsole();
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('select-console-module', { detail: 'loom' }));
                window.dispatchEvent(new CustomEvent('run-console-simulation'));
              }, 100);
            }}
            title="Loom Sanal Thread Simülasyonunu Başlat"
            className="p-4 rounded-2xl glass-liquid border border-black/10 dark:border-white/10 space-y-1 transition-all duration-300 hover:border-[#d4f933]/50 hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#a3c900] dark:text-[#d4f933] font-bold uppercase group-hover:underline">02 // LOOM</span>
              <span className="text-[10px] text-zinc-400">JAVA 22</span>
            </div>
            <div className="text-base font-bold text-zinc-950 dark:text-white">Virtual Threads</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Sıfır Thread Havuzu Darboğazı & Yüksek Eşzamanlılık</p>
          </div>

          <div
            onClick={() => {
              if (onOpenArchitectureConsole) onOpenArchitectureConsole();
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('select-console-module', { detail: 'write-behind' }));
              }, 100);
            }}
            title="Redis Write-Behind Tampon Modülünü İncele"
            className="p-4 rounded-2xl glass-liquid border border-black/10 dark:border-white/10 space-y-1 transition-all duration-300 hover:border-rose-500/50 hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-rose-500 font-bold uppercase group-hover:underline">03 // CACHE</span>
              <span className="text-[10px] text-zinc-400">REDIS</span>
            </div>
            <div className="text-base font-bold text-zinc-950 dark:text-white">Write-Behind Buffer</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Atomik HINCRBY Sayaçları & 30s Batch Flush</p>
          </div>

          <div
            onClick={() => {
              if (onOpenArchitectureConsole) onOpenArchitectureConsole();
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('select-console-module', { detail: 'optimistic-locking' }));
              }, 100);
            }}
            title="JPA Optimistic Locking ve Test Matrisini İncele"
            className="p-4 rounded-2xl glass-liquid border border-black/10 dark:border-white/10 space-y-1 transition-all duration-300 hover:border-cyan-500/50 hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-500 font-bold uppercase group-hover:underline">04 // TESTS</span>
              <span className="text-[10px] text-emerald-400">201/201</span>
            </div>
            <div className="text-base font-bold text-zinc-950 dark:text-white">%100 Başarı</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Unit, Integration, Vector, Batch & Security</p>
          </div>
        </div>
      </div>
    </section>
  );
};
