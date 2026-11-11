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
  HelpCircle,
  X,
  Play,
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
    metric1: { label: 'EŞZAMANLILIK', value: 'Sanal Thread (Loom)' },
    metric2: { label: 'ANLAMSAL ARAMA', value: 'Anlamsal Vektör' },
    metric3: { label: 'ÖNBELLEK SENKRON', value: 'Write-Behind 30sn' },
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
    metric1: { label: 'İŞLEM KAPASİTESİ', value: '12.4K İstek/sn' },
    metric2: { label: 'İŞLEM GECİKMESİ', value: '0.2ms Alt-Döngü' },
    metric3: { label: 'TELEMETRİ SAPMASI', value: '< 0.1ms Sapma' },
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
    metric1: { label: 'TEST KAPSAMI', value: '201/201 (%100 Geçti)' },
    metric2: { label: 'GÜVENLİK PROTOKOLÜ', value: '2FA TOTP Doğrulama' },
    metric3: { label: 'HATA STANDARDI', value: 'RFC 7807 Problem' },
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreAI,
  onOpenCreateModal,
  onOpenArchitectureConsole,
}) => {
  const [activeSlide, setActiveSlide] = useState<0 | 1 | 2>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [telemetryTick, setTelemetryTick] = useState(0);
  const [activeExplainer, setActiveExplainer] = useState<'loom' | 'redis' | 'ai' | 'locking' | null>(null);
  const [burstIopsBonus, setBurstIopsBonus] = useState(0);
  const [manualBufferBonus, setManualBufferBonus] = useState(0);
  const [simulatingLoom, setSimulatingLoom] = useState(false);

  // Background telemetry tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryTick((prev) => (prev + 1) % 100);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  // Automatic 6-second rotation timer (GPU-composited CSS progress, zero micro-stutters)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((s) => ((s + 1) % 3) as 0 | 1 | 2);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handleSelectSlide = (idx: 0 | 1 | 2) => {
    setActiveSlide(idx);
  };

  const slide = SLIDES[activeSlide];
  const simulatedIops = 11400 + ((telemetryTick * 37) % 850) + burstIopsBonus;
  const bufferDelta = 12 + ((telemetryTick * 3) % 24) + manualBufferBonus;

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
                    MİMARİ TELEMETRİ // CANLI
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#a3c900] dark:text-[#d4f933]">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>SİSTEM AKTİF</span>
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
                  ANLAMSAL VEKTÖR ÇEKİRDEĞİ
                </div>
              </div>

              {/* Gauge 1: Loom Virtual Threads RPM */}
              <div className="space-y-1.5 p-3 rounded-2xl transition-colors bg-zinc-50/70 dark:bg-zinc-900/30 border border-black/[0.04] dark:border-white/[0.04]">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 font-semibold">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Eşzamanlı İstek Akışı (Loom)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {simulatedIops.toLocaleString()} istek/sn
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveExplainer(activeExplainer === 'loom' ? null : 'loom')}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                        activeExplainer === 'loom'
                          ? 'bg-amber-500 text-black border-amber-500 font-bold shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white border-black/5 dark:border-white/10'
                      }`}
                      title="Bu sayaç ne işe yarar?"
                    >
                      <HelpCircle className="w-2.5 h-2.5" />
                      <span>{activeExplainer === 'loom' ? 'Kapat' : 'Neden Var?'}</span>
                    </button>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#d4f933] to-emerald-400 transition-all duration-700"
                    style={{ width: `${Math.min(100, 65 + ((telemetryTick * 17) % 30) + (burstIopsBonus > 0 ? 25 : 0))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>Hafif Sanal Thread: Aktif</span>
                  <span>Sunucu Kilitlenmesi: 0.0ms (Sıfır)</span>
                </div>

                {/* Loom Explainer Drawer */}
                {activeExplainer === 'loom' && (
                  <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3 h-3" />
                        PROJECT LOOM // SANAL THREAD
                      </span>
                      <button
                        onClick={() => setActiveExplainer(null)}
                        className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-700 dark:text-zinc-300 font-sans leading-relaxed">
                      Geleneksel sunucular her istek için 1MB bellek tutar ve 200 istek sonrasında tıkanır. Java 22 Loom ise istek başına yalnızca ~1KB harcar; 10.000+ kullanıcı aynı anda bağlansa dahi sunucu kilitlenmez.
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-amber-500/20">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Canlı Etkiyi Görün:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSimulatingLoom(true);
                          setBurstIopsBonus(2450);
                          setTimeout(() => {
                            setBurstIopsBonus(0);
                            setSimulatingLoom(false);
                          }, 2500);
                        }}
                        disabled={simulatingLoom}
                        className="px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 dark:text-amber-300 font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        {simulatingLoom ? <Activity className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                        <span>{simulatingLoom ? '+2.450 İSTEK AKIYOR' : '+2.450 İstek Simüle Et'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Gauge 2: Redis Write-Behind Buffer Pressure */}
              <div className="space-y-1.5 p-3 rounded-2xl transition-colors bg-zinc-50/70 dark:bg-zinc-900/30 border border-black/[0.04] dark:border-white/[0.04]">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 font-semibold">
                    <Database className="w-3.5 h-3.5 text-rose-500" />
                    Önbellek Tampon Sayaçları
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-white">
                      +{bufferDelta} Sayaç Beklemede
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveExplainer(activeExplainer === 'redis' ? null : 'redis')}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                        activeExplainer === 'redis'
                          ? 'bg-rose-500 text-white border-rose-500 font-bold shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white border-black/5 dark:border-white/10'
                      }`}
                      title="Bu sayaç ne işe yarar?"
                    >
                      <HelpCircle className="w-2.5 h-2.5" />
                      <span>{activeExplainer === 'redis' ? 'Kapat' : 'Neden Var?'}</span>
                    </button>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all duration-700"
                    style={{ width: `${Math.min(100, 25 + (bufferDelta * 2.5))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>Bellekte Toplama: Anlık O(1)</span>
                  <span>Veritabanı Senkronizasyonu: 30sn</span>
                </div>

                {/* Redis Explainer Drawer */}
                {activeExplainer === 'redis' && (
                  <div className="mt-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-mono space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <Database className="w-3 h-3" />
                        REDIS WRITE-BEHIND // SAYAÇ TAMPONU
                      </span>
                      <button
                        onClick={() => setActiveExplainer(null)}
                        className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-700 dark:text-zinc-300 font-sans leading-relaxed">
                      Her beğeni ve görüntülenmede doğrudan veritabanına yazmak diskte satır kilitleme (Row Lock) darboğazı yaratır. Sistem sayaçları Redis belleğinde atomik toplar ve 30 saniyede bir toplu olarak diske yazar.
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-rose-500/20">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Canlı Etkiyi Görün:</span>
                      <button
                        type="button"
                        onClick={() => setManualBufferBonus((prev) => prev + 5)}
                        className="px-2.5 py-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-300 font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                      >
                        <span>+5 Sayaç Gönder</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Gauge 3: Vector Embedding 128D Radar */}
              <div className="space-y-1.5 p-3 rounded-2xl transition-colors bg-zinc-50/70 dark:bg-zinc-900/30 border border-black/[0.04] dark:border-white/[0.04]">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 font-semibold">
                    <Layers className="w-3.5 h-3.5 text-purple-500" />
                    Yapay Zeka Anlamsal İsabeti
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      %94.2 Doğruluk
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveExplainer(activeExplainer === 'ai' ? null : 'ai')}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                        activeExplainer === 'ai'
                          ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white border-black/5 dark:border-white/10'
                      }`}
                      title="Bu sayaç ne işe yarar?"
                    >
                      <HelpCircle className="w-2.5 h-2.5" />
                      <span>{activeExplainer === 'ai' ? 'Kapat' : 'Neden Var?'}</span>
                    </button>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-[94.2%]" />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>pgvector Anlam Analizi</span>
                  <span>Akıllı Hibrit Sıralama</span>
                </div>

                {/* AI Explainer Drawer */}
                {activeExplainer === 'ai' && (
                  <div className="mt-2.5 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-mono space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 font-bold text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3 h-3" />
                        SPRING AI // ANLAMSAL İSABET
                      </span>
                      <button
                        onClick={() => setActiveExplainer(null)}
                        className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-700 dark:text-zinc-300 font-sans leading-relaxed">
                      Yalnızca aynı kelimeleri aramak yerine cümlenin derin anlamını 128 boyutlu vektöre dönüştürür. Farklı kelimeler veya yazım hataları kullansanız dahi en alakalı makaleyi milisaniyeler içinde bulur.
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-purple-500/20">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Canlı Etkiyi Görün:</span>
                      <button
                        type="button"
                        onClick={onExploreAI}
                        className="px-2.5 py-1 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:text-purple-300 font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                      >
                        <span>Anlamsal Aramayı Aç →</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Spec Footer Pill */}
              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-black/5 dark:bg-zinc-950/60 border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Veri Çakışma Koruması:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                      İyimser Kilitleme (%100)
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveExplainer(activeExplainer === 'locking' ? null : 'locking')}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                        activeExplainer === 'locking'
                          ? 'bg-emerald-500 text-black border-emerald-500 font-bold shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white border-black/5 dark:border-white/10'
                      }`}
                      title="Bu koruma ne işe yarar?"
                    >
                      <HelpCircle className="w-2.5 h-2.5" />
                      <span>{activeExplainer === 'locking' ? 'Kapat' : 'Neden Var?'}</span>
                    </button>
                  </div>
                </div>

                {/* Locking Explainer Drawer */}
                {activeExplainer === 'locking' && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3" />
                        JPA @VERSION // VERİ BÜTÜNLÜĞÜ
                      </span>
                      <button
                        onClick={() => setActiveExplainer(null)}
                        className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-700 dark:text-zinc-300 font-sans leading-relaxed">
                      İki yazar aynı anda aynı makaleyi güncellediğinde veritabanı satır kilidi alarak sistemi dondurmaz. Versiyon numarası üzerinden doğrular ve eski versiyonla gelen istek nazikçe 409 Çakışma ile yakalanır.
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-emerald-500/20">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Canlı Etkiyi Görün:</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenArchitectureConsole) onOpenArchitectureConsole();
                          setTimeout(() => {
                            window.dispatchEvent(new CustomEvent('select-console-module', { detail: 'optimistic-locking' }));
                            window.dispatchEvent(new CustomEvent('run-console-simulation'));
                          }, 100);
                        }}
                        className="px-2.5 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                      >
                        <span>Konsolda Simüle Et →</span>
                      </button>
                    </div>
                  </div>
                )}
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
                    <div className="w-8 h-2.5 rounded-full bg-zinc-800 overflow-hidden relative shadow-[0_0_10px_#10b981]/30">
                      <div
                        key={activeSlide}
                        className="h-full bg-emerald-500 rounded-full animate-slide-progress"
                        style={{
                          animationDuration: '6000ms',
                          animationPlayState: isPaused ? 'paused' : 'running',
                        }}
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
              <span className="text-purple-600 dark:text-purple-400 font-bold uppercase group-hover:underline">01 // YAPAY ZEKA</span>
              <span className="text-[10px] text-zinc-400">ANLAMSAL VEKTÖR</span>
            </div>
            <div className="text-base font-bold text-zinc-950 dark:text-white">Anlamsal Arama</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Yapay Zeka Anlam Eşleştirmesi, TL;DR Özet & Otomatik Etiket</p>
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
              <span className="text-[#a3c900] dark:text-[#d4f933] font-bold uppercase group-hover:underline">02 // EŞZAMANLILIK</span>
              <span className="text-[10px] text-zinc-400">JAVA 22 LOOM</span>
            </div>
            <div className="text-base font-bold text-zinc-950 dark:text-white">Sanal İş Parçacıkları</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Sıfır Thread Havuzu Darboğazı & 10.000+ Eşzamanlı İstek</p>
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
              <span className="text-rose-500 font-bold uppercase group-hover:underline">03 // ÖNBELLEK</span>
              <span className="text-[10px] text-zinc-400">REDIS TAMPON</span>
            </div>
            <div className="text-base font-bold text-zinc-950 dark:text-white">Write-Behind Sayaç</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Atomik Sayaç Artışı & 30sn Toplu Veritabanı Kaydı</p>
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
              <span className="text-cyan-500 font-bold uppercase group-hover:underline">04 // DOĞRULAMA</span>
              <span className="text-[10px] text-emerald-400">201/201 GEÇTİ</span>
            </div>
            <div className="text-base font-bold text-zinc-950 dark:text-white">%100 Test Kapsamı</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Birim, Entegrasyon, Vektör, Toplu İş ve Güvenlik Testleri</p>
          </div>
        </div>
      </div>
    </section>
  );
};
