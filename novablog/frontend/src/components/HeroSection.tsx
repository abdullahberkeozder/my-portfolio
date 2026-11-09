'use client';

import React from 'react';
import { Sparkles, CheckCircle2, Cpu, Zap, Shield, Search } from 'lucide-react';

interface HeroSectionProps {
  onExploreAI: () => void;
  onOpenCreateModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreAI, onOpenCreateModal }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/80 pt-10 pb-12 sm:pt-16 sm:pb-16">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/15 to-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs text-slate-300 mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-emerald-400">2026 Enterprise Edition</span>
            <span className="text-slate-500">|</span>
            <span className="font-mono text-slate-400">184/184 Unit & Integration Tests (%100 Pass)</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
            Enterprise Full-Stack{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
              Spring AI & Next.js
            </span>{' '}
            Mimarisi
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Java 22 Virtual Threads, Spring Boot 4.1.1, 128-boyutlu Vektör Anlamsal Arama (Cosine Similarity), 
            Spring Batch ETL ve MinIO S3 nesne depolama ile güçlendirilmiş kurumsal blog platformu.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onExploreAI}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 text-white font-semibold text-sm hover:brightness-110 shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Cpu className="w-4 h-4 text-emerald-300" />
              Spring AI Vektör Aramayı Dene
            </button>
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Yeni Makale Yayınla
            </button>
          </div>
        </div>

        {/* Highlight Architecture Cards */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <Cpu className="w-4 h-4" />
              <span className="text-xs font-mono font-bold uppercase">Spring AI Core</span>
            </div>
            <div className="text-lg font-bold text-white">128D Vektör Arama</div>
            <p className="text-xs text-slate-400 mt-1">Kosinüs Benzerliği, TL;DR Özet ve NLP Etiketleme</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-mono font-bold uppercase">Java 22 Loom</span>
            </div>
            <div className="text-lg font-bold text-white">Virtual Threads</div>
            <p className="text-xs text-slate-400 mt-1">Sıfır Thread Havuzu Darboğazı & Yüksek Eşzamanlılık</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-mono font-bold uppercase">Enterprise Auth</span>
            </div>
            <div className="text-lg font-bold text-white">TOTP 2FA & OAuth2</div>
            <p className="text-xs text-slate-400 mt-1">RFC 6238 Google Authenticator ve JWT Çift Katman</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-mono font-bold uppercase">Test Kapsamı</span>
            </div>
            <div className="text-lg font-bold text-white">184 / 184 Test (%100)</div>
            <p className="text-xs text-slate-400 mt-1">Unit, Integration, Vector, Batch & Security</p>
          </div>
        </div>
      </div>
    </div>
  );
};

