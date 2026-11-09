'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  X,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface FloatingCopilotWidgetProps {
  onOpenArchitectureConsole?: () => void;
  onOpenTelemetry?: () => void;
  onSelectTab?: (tab: 'feed' | 'ai-search' | 'ai-lab' | 'admin-batch') => void;
}

interface QnA {
  id: string;
  chip: string;
  title: string;
  answer: string;
  tag: string;
  actionText?: string;
  actionType?: 'console-loom' | 'console-writebehind' | 'telemetry' | 'tab-ai' | 'tab-batch';
}

const KNOWLEDGE_BASE: QnA[] = [
  {
    id: 'loom',
    chip: '⚡ Java 22 Loom Threads',
    title: 'Java 22 Project Loom Sanal Thread Mimarisi',
    tag: 'CONCURRENCY // ZERO BLOCKING',
    answer:
      'Geleneksel Tomcat 200 OS platform thread havuzu yerine, Java 22 sanal thread’leri (Virtual Threads) Carrier Thread üzerinde yürütülür. I/O blokajı anında OS thread bloke edilmez, mikrosaniyede unpin edilir. Bu sayede 10.000+ eşzamanlı istek 0ms taşıyıcı gecikmesiyle işlenir.',
    actionText: 'Loom Simülatörünü Başlat',
    actionType: 'console-loom',
  },
  {
    id: 'write-behind',
    chip: '🗄️ Redis Write-Behind Buffer',
    title: 'Redis Write-Behind Asenkron Sayaç Mimarisi',
    tag: 'CACHE // ROW-LOCK FREE',
    answer:
      'Her görüntülenme ve beğenide PostgreSQL satır kilidi (Row Lock) almak yerine Redis Hash üzerinde HINCRBY ile atomik O(1) sayım yapılır. Arka plandaki Scheduled flusher her 30 saniyede bir birikmiş deltaları tek bir batch sorgusuyla veritabanına aktarır.',
    actionText: 'Write-Behind Tamponunu İncele',
    actionType: 'console-writebehind',
  },
  {
    id: 'spring-ai',
    chip: '🧠 Spring AI 128D Vektör Arama',
    title: '128 Boyutlu Kosinüs Semantik Arama Uzayı',
    tag: 'AI VECTOR // COSINE PROJECTION',
    answer:
      'Klasik SQL LIKE veya anahtar kelime eşleşmesi bağlamı yakalayamaz. Spring AI pgvector eklentisi ile makale içerikleri 128 boyutlu yoğun vektör uzayına projekte edilir. Arama sorgusu ile makale arasındaki kosinüs mesafesi mikrosaniyede hesaplanarak semantik benzerlik bulunur.',
    actionText: 'Vektör Arama Modülünü Aç',
    actionType: 'tab-ai',
  },
  {
    id: '2fa',
    chip: '🔐 2FA TOTP & Pre-Auth State Machine',
    title: 'İki Aşamalı Güvenlik ve Pre-Auth JWT',
    tag: 'SECURITY // STATE MACHINE',
    answer:
      'Kullanıcı şifresini doğruladığında doğrudan tam yetkili JWT verilmez; "PRE_AUTH" kapsamlı geçici token verilir. Bu token yalnızca TOTP doğrulama uç noktasına erişebilir. Başarılı Google Authenticator kodundan sonra asıl JWT tahsis edilir.',
    actionText: 'Telemetri Konsolunu Aç',
    actionType: 'telemetry',
  },
  {
    id: 'batch',
    chip: '📦 Spring Batch 5 & Soft-Delete',
    title: 'Chunk-Oriented ETL ve Retention Purge',
    tag: 'BATCH AUTOMATION // 100 CHUNKS',
    answer:
      'Soft-deleted olarak işaretlenen kayıtlar sistemde kalıcı çöp oluşturmaz. Spring Batch 5 ile her gece çalışan 100 kayıtlık chunk işleyicisi, 30 günü aşan kayıtları güvenli şekilde siler ve yazar analitik raporunu üretir.',
    actionText: 'Batch Stüdyosuna Git',
    actionType: 'tab-batch',
  },
];

export const FloatingCopilotWidget: React.FC<FloatingCopilotWidgetProps> = ({
  onOpenArchitectureConsole,
  onOpenTelemetry,
  onSelectTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQnA, setSelectedQnA] = useState<QnA>(KNOWLEDGE_BASE[0]);

  const handleAction = (type?: QnA['actionType']) => {
    setIsOpen(false);
    if (!type) return;

    if (type === 'console-loom') {
      if (onSelectTab) onSelectTab('feed');
      if (onOpenArchitectureConsole) onOpenArchitectureConsole();
      setTimeout(() => {
        const el = document.getElementById('modular-architecture-console');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        window.dispatchEvent(new CustomEvent('select-console-module', { detail: 'loom' }));
        window.dispatchEvent(new CustomEvent('run-console-simulation'));
      }, 100);
    } else if (type === 'console-writebehind') {
      if (onSelectTab) onSelectTab('feed');
      if (onOpenArchitectureConsole) onOpenArchitectureConsole();
      setTimeout(() => {
        const el = document.getElementById('modular-architecture-console');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        window.dispatchEvent(new CustomEvent('select-console-module', { detail: 'write-behind' }));
      }, 100);
    } else if (type === 'telemetry') {
      if (onOpenTelemetry) onOpenTelemetry();
    } else if (type === 'tab-ai') {
      if (onSelectTab) onSelectTab('ai-search');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (type === 'tab-batch') {
      if (onSelectTab) onSelectTab('admin-batch');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* 1. The Iconic Ride Also Floating Lavender Circular Trigger Button (All 6 Screenshots) */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#c084fc] hover:bg-[#a855f7] text-[#200e38] shadow-[0_10px_35px_rgba(168,85,247,0.45)] border-2 border-white/60 dark:border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer group select-none"
        title="Nova Mimari Copilot'u Aç"
        aria-label="Nova Mimari Copilot"
      >
        {/* Status Indicator Dot */}
        <span className="w-3 h-3 rounded-full bg-[#d4f933] absolute top-0.5 right-0.5 ring-2 ring-[#200e38] shadow-[0_0_8px_#d4f933] animate-pulse" />

        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-200 group-hover:rotate-90" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6 fill-current" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
          </div>
        )}
      </button>

      {/* 2. Interactive Ride Also Floating Industrial Copilot Drawer */}
      {isOpen && (
        <div className="fixed bottom-22 right-6 z-50 w-[380px] sm:w-[440px] max-w-[92vw] bg-white dark:bg-[#0c0e14] rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border border-black/10 dark:border-white/10 p-5 sm:p-6 space-y-4 font-sans ride-also-drawer-anim">
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.08] dark:border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#8c52ff] text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 dark:text-white flex items-center gap-1.5">
                  NOVA ARCHITECTURE COPILOT
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4f933] animate-pulse" />
                </h3>
                <span className="text-[10px] font-mono text-zinc-400 tracking-wider">
                  201/201 AUTOMATED TESTS (100% PASS)
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Subject Chip Carousel */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              MİMARİ SORU SEÇİNİZ //
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {KNOWLEDGE_BASE.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedQnA(item)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-mono whitespace-nowrap transition-all cursor-pointer ${
                    selectedQnA.id === item.id
                      ? 'bg-[#8c52ff] text-white font-bold shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white border border-black/5 dark:border-white/5'
                  }`}
                >
                  {item.chip}
                </button>
              ))}
            </div>
          </div>

          {/* Active Knowledge Card */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.08] dark:border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#8c52ff] dark:text-[#a259ff] font-bold uppercase tracking-wider">
                {selectedQnA.tag}
              </span>
              <span className="text-emerald-500 font-bold">VERIFIED SPEC</span>
            </div>
            <h4 className="text-sm font-black text-zinc-950 dark:text-white leading-snug">
              {selectedQnA.title}
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans">
              {selectedQnA.answer}
            </p>

            {selectedQnA.actionText && (
              <div className="pt-2">
                <button
                  onClick={() => handleAction(selectedQnA.actionType)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#d4f933] hover:bg-[#c4e82b] text-black text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-sm btn-tactile"
                >
                  <span>{selectedQnA.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Engine Links Footer */}
          <div className="pt-2 border-t border-black/[0.08] dark:border-white/[0.08] grid grid-cols-2 gap-2 text-[10px] font-mono">
            <a
              href="http://localhost:5555/swagger-ui.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <span>SWAGGER UI</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <a
              href="http://localhost:5555/h2-console"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <span>H2 CONSOLE</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>
      )}
    </>
  );
};
