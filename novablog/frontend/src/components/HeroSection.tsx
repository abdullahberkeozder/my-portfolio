'use client';

import React from 'react';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  ArrowDown,
  PenSquare,
  BookOpen,
  Clock,
  Compass,
} from 'lucide-react';

interface HeroSectionProps {
  onExploreAI?: () => void;
  onOpenCreateModal: () => void;
  onOpenArchitectureConsole?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreAI,
  onOpenCreateModal,
}) => {
  const scrollToFeed = () => {
    if (onExploreAI) {
      // Keep hook available
    }
    const el = document.getElementById('articles-feed');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden border-b border-black/[0.08] dark:border-white/[0.08] transition-colors duration-300">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[450px] h-[250px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-14 lg:pt-16 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Publication Narrative (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Category / Scope Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs font-mono w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <span className="text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider">
                NOVA {'//'} TEKNOLOJİ &amp; MÜHENDİSLİK YAYINI
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.1] font-sans">
                Sistem Mimarisi, Dağıtık Sistemler ve{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
                  Modern Mühendislik.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed pt-1">
                Kıdemli mühendislerin, sistem mimarlarının ve teknoloji liderlerinin gerçek dünya tecrübelerini,
                mimari kararlarını ve teknik keşiflerini paylaştığı bağımsız yayın platformu.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={scrollToFeed}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-black font-semibold text-xs tracking-wide uppercase transition-all duration-300 shadow-lg hover:opacity-90 active:scale-95 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-emerald-400 dark:text-zinc-950" />
                <span>Makaleleri Keşfet</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onOpenCreateModal}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 font-semibold text-xs tracking-wide uppercase transition-all cursor-pointer"
              >
                <PenSquare className="w-4 h-4" />
                <span>Yeni Makale Yaz</span>
              </button>
            </div>

            {/* Core Tech Pillars Strip */}
            <div className="pt-4 border-t border-zinc-200/70 dark:border-zinc-800/70 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs font-mono text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Java 22 Loom
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                Spring AI &amp; Vektör Arama
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Redis Write-Behind
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Açık Kaynak Topluluk
              </span>
            </div>
          </div>

          {/* Right Column: Editorial Featured Story Spotlight (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#0d0f14] border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xl space-y-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all">
              {/* Cover Preview */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                <Image
                  src="/images/architecture-cutaway.jpg"
                  alt="Öne Çıkan Makale"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                    <Sparkles className="w-3 h-3" />
                    EDİTÖRÜN SEÇİMİ
                  </span>
                </div>
              </div>

              {/* Story Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    Abdullah Berke Özder
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    6 dk okuma
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white leading-snug tracking-tight">
                  Spring AI ve 128D Vektör Veritabanı ile Akıllı Semantik Arama Mimarisi
                </h3>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  Geleneksel kelime aramalarının ötesinde kullanıcı niyetini kavrayan yoğun vektör gömmeleri ve milisaniyeler
                  mertebesinde yanıt veren hibrit arama motoru tasarımı.
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={scrollToFeed}
                className="w-full py-2.5 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-950 hover:text-white dark:hover:bg-white dark:hover:text-black text-zinc-900 dark:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Makaleyi Oku</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
