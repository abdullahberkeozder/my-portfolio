'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  Cpu,
  Zap,
  Activity,
  Layers,
  Database,
  Radio,
  ShieldCheck,
} from 'lucide-react';

interface HeroSectionProps {
  onExploreAI: () => void;
  onOpenCreateModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreAI,
  onOpenCreateModal,
}) => {
  // Simulated live telemetry stream (Ride Also instrument HUD feel)
  const [telemetryTick, setTelemetryTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryTick((prev) => (prev + 1) % 100);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const simulatedIops = 11400 + ((telemetryTick * 37) % 850);
  const bufferDelta = 12 + ((telemetryTick * 3) % 24);

  return (
    <section className="relative overflow-hidden border-b border-black/[0.08] dark:border-white/[0.08] bg-tech-grid">
      {/* Ambient Lighting Gradients */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-gradient-to-br from-[#d4f933]/10 via-cyan-500/5 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[450px] h-[250px] bg-gradient-to-tr from-purple-500/10 via-indigo-500/5 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-16 lg:pb-20">
        {/* Main Grid: Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Industrial Narrative & CTAs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Spec Tag */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-zinc-900/5 dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#d4f933] shadow-[0_0_8px_#d4f933] animate-pulse" />
              <span className="text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                SYSTEM ARCHITECTURE // V4.1.1
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span className="text-zinc-500 dark:text-zinc-400">195/195 TESTS (%100 PASS)</span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-zinc-950 dark:text-white leading-[1.05] uppercase">
                YÜKSEK HACİMLİ MİMARİ.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-400 dark:from-white dark:via-zinc-200 dark:to-zinc-500">
                  SIFIR DARBOĞAZ.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed pt-2">
                Java 22 Project Loom ile hafif sanal thread havuzu, 128 boyutlu Spring AI vektör arama motoru, 
                Redis Write-Behind tamponu ve Spring Batch 5 ile inşa edilmiş endüstriyel blog ekosistemi.
              </p>
            </div>

            {/* Ride Also-Style Dual Pill Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              {/* Primary High-Contrast Volt Pill */}
              <button
                onClick={onExploreAI}
                className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#d4f933] hover:bg-[#c4e82b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-[#d4f933]/25 hover:shadow-[#d4f933]/40 active:scale-95 cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-black" />
                <span>Vektör Aramayı Başlat</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Secondary Liquid Glass Capsule Pill */}
              <button
                onClick={onOpenCreateModal}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full glass-liquid hover:border-[#d4f933]/50 text-zinc-900 dark:text-zinc-100 font-mono font-medium text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#a3c900] dark:text-[#d4f933]" />
                <span>Yeni Makale Yaz</span>
              </button>
            </div>

            {/* Spec Footnotes */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-black/[0.08] dark:border-white/[0.08] text-xs font-mono">
              <div>
                <div className="text-zinc-400 text-[10px] uppercase">CONCURRENCY</div>
                <div className="text-zinc-900 dark:text-white font-bold">Virtual Threads</div>
              </div>
              <div>
                <div className="text-zinc-400 text-[10px] uppercase">VECTOR EMBEDDING</div>
                <div className="text-zinc-900 dark:text-white font-bold">128-Dim Cosine</div>
              </div>
              <div>
                <div className="text-zinc-400 text-[10px] uppercase">EVENTUAL SYNC</div>
                <div className="text-zinc-900 dark:text-white font-bold">Write-Behind 30s</div>
              </div>
            </div>
          </div>

          {/* Right Column: Ride Also-Inspired Hardware Architecture Telemetry HUD (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl p-6 glass-liquid border border-black/10 dark:border-white/10 shadow-2xl space-y-5 overflow-hidden">
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

              {/* Hardware Visual Preview (Ride Also Product Rendering) */}
              <div className="relative rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 aspect-[16/9] bg-zinc-950">
                <Image
                  src="/images/hardware-core.jpg"
                  alt="NovaBlog Hardware Engine Core"
                  fill
                  priority
                  className="object-cover object-center transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                {/* Hardware Badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4f933] animate-pulse" />
                  <span>TITANIUM SILICON // V4.1</span>
                </div>

                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-[#d4f933] font-bold">
                  128D VECTOR CORE
                </div>
              </div>

              {/* Gauge 1: Loom Virtual Threads RPM */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Loom Virtual Thread Throughput
                  </span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    {simulatedIops.toLocaleString()} req/s
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#d4f933] to-emerald-400 transition-all duration-1000"
                    style={{ width: `${65 + ((telemetryTick * 17) % 30)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>OS Thread: Unpinned</span>
                  <span>Carrier Block: 0.0ms</span>
                </div>
              </div>

              {/* Gauge 2: Redis Write-Behind Buffer Pressure */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-rose-400" />
                    Redis Write-Behind Delta Buffer
                  </span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    +{bufferDelta} Sayaç Beklemede
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all duration-1000"
                    style={{ width: `${25 + (bufferDelta * 2.5)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>HINCRBY: Atomik O(1)</span>
                  <span>Batch Flush: 30s Otomatik</span>
                </div>
              </div>

              {/* Gauge 3: Vector Embedding 128D Radar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    Spring AI 128D Vektör Uzayı
                  </span>
                  <span className="font-bold text-emerald-500 dark:text-emerald-400">
                    %94.2 Benzerlik
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-[94.2%]" />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>pgvector Kosinüs Metriği</span>
                  <span>RRF Hibrit Füzyon</span>
                </div>
              </div>

              {/* Spec Footer Pill */}
              <div className="p-3 rounded-2xl bg-black/5 dark:bg-zinc-950/60 border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  JPA @Version Locking:
                </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                  Lock-Free Aktif (v3.0)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Highlight Hardware Architecture Spec Grid */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl glass-liquid border border-black/10 dark:border-white/10 space-y-1 transition-all hover:border-[#d4f933]/40">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-purple-600 dark:text-purple-400 font-bold uppercase">01 // AI CORE</span>
              <span className="text-[10px] text-zinc-400">128D</span>
            </div>
            <div className="text-base font-bold text-zinc-950 dark:text-white">Vektör Arama</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Kosinüs Benzerliği, TL;DR Özet & Otomatik Etiket</p>
          </div>

          <div className="p-4 rounded-2xl glass-liquid border border-black/10 dark:border-white/10 space-y-1 transition-all hover:border-[#d4f933]/40">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#a3c900] dark:text-[#d4f933] font-bold uppercase">02 // LOOM</span>
              <span className="text-[10px] text-zinc-400">JAVA 22</span>
            </div>
            <div className="text-base font-bold text-zinc-950 dark:text-white">Virtual Threads</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Sıfır Thread Havuzu Darboğazı & Yüksek Eşzamanlılık</p>
          </div>

          <div className="p-4 rounded-2xl glass-liquid border border-black/10 dark:border-white/10 space-y-1 transition-all hover:border-[#d4f933]/40">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-rose-500 font-bold uppercase">03 // CACHE</span>
              <span className="text-[10px] text-zinc-400">REDIS</span>
            </div>
            <div className="text-base font-bold text-zinc-950 dark:text-white">Write-Behind Buffer</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Atomik HINCRBY Sayaçları & 30s Batch Flush</p>
          </div>

          <div className="p-4 rounded-2xl glass-liquid border border-black/10 dark:border-white/10 space-y-1 transition-all hover:border-[#d4f933]/40">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-500 font-bold uppercase">04 // TESTS</span>
              <span className="text-[10px] text-emerald-400">195/195</span>
            </div>
            <div className="text-base font-bold text-zinc-950 dark:text-white">%100 Başarı</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Unit, Integration, Vector, Batch & Security</p>
          </div>
        </div>
      </div>
    </section>
  );
};
