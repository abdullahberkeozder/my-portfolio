'use client';

import React, { useState } from 'react';
import { ApiClient } from '@/lib/api';
import {
  X,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Check,
  BookOpen,
  Cpu,
  Database,
  Bot,
  ShieldCheck,
  Layers,
  Sparkles,
} from 'lucide-react';

interface FloatingCopilotWidgetProps {
  onOpenArchitectureConsole?: () => void;
  onOpenTelemetry?: () => void;
  onSelectTab?: (tab: 'feed' | 'ai-search' | 'ai-lab' | 'admin-batch') => void;
  onMetricsFlushed?: () => void;
  onOpenAbout?: () => void;
}

interface QnA {
  id: string;
  chipText: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  answer: string;
  tag: string;
  actionText?: string;
  actionType?: 'console-loom' | 'console-writebehind' | 'telemetry' | 'tab-ai' | 'tab-batch' | 'manifesto';
}

const KNOWLEDGE_BASE: QnA[] = [
  {
    id: 'manifesto',
    chipText: 'Mimari Felsefe',
    icon: BookOpen,
    title: 'Neden Endüstriyel Dokunsallık ve Java 22?',
    tag: 'FELSEFE // MÜHENDİSLİK DİSİPLİNİ',
    answer:
      'Dieter Rams’ın "İyi tasarım dürüsttür ve olabildiğince az tasarımdır" ilkesiyle inşa edildi. Şişirilmiş gereksiz mikroservisler yerine, tek bir modern JVM üzerinde donanım sınırlarını zorlayan, kilitlenmeyen ve veri kaybetmeyen saf mühendislik disiplinini benimsiyoruz.',
    actionText: 'Mühendislik Manifestosunu Oku',
    actionType: 'manifesto',
  },
  {
    id: 'loom',
    chipText: 'Java 22 Loom',
    icon: Cpu,
    title: 'Sanal İş Parçacıkları ve Eşzamanlılık',
    tag: 'EŞZAMANLILIK // VIRTUAL THREADS',
    answer:
      'Tomcat’in geleneksel 200 iş parçacığı havuzu yüksek trafikte tükenip sunucunun kilitlenmesine yol açar. Java 22 Loom sanal iş parçacıkları ise işletim sistemini bloke etmeden çalışır; bellek tüketimini megabaytlardan kilobaytlara düşürerek 10.000+ eşzamanlı isteği takılmadan karşılar.',
    actionText: 'Loom Simülatörünü Başlat',
    actionType: 'console-loom',
  },
  {
    id: 'write-behind',
    chipText: 'Redis Önbellek',
    icon: Database,
    title: 'Redis Write-Behind Asenkron Sayaç Mimarisi',
    tag: 'ÖNBELLEK // SIFIR KİLİTLEME',
    answer:
      'Her makale okunduğunda veya beğenildiğinde veritabanına doğrudan yazmak sunucu diskini kilitler. Redis Write-Behind mimarisinde sayaçlar önce ultra-hızlı bellekte toplanır ve her 30 saniyede bir topluca veritabanına güvenle aktarılır (%98 I/O tasarrufu).',
    actionText: 'Write-Behind Tamponunu İncele',
    actionType: 'console-writebehind',
  },
  {
    id: 'spring-ai',
    chipText: 'Yapay Zeka Arama',
    icon: Bot,
    title: 'Yapay Zeka Destekli Anlamsal Arama',
    tag: 'YAPAY ZEKA // VEKTÖR UZAYI',
    answer:
      'Klasik arama sadece yazdığınız aynı harfleri arar. Yapay zeka arama motorumuz ise girdiğiniz cümlenin gerçek anlamını kavrar. Örneğin "bellek yönetimi" aradığınızda içinde bu kelime geçmese bile "garbage collector" makalelerini bularak en alakalı içeriği getirir.',
    actionText: 'Vektör Arama Modülünü Aç',
    actionType: 'tab-ai',
  },
  {
    id: '2fa',
    chipText: '2FA Güvenlik',
    icon: ShieldCheck,
    title: 'İki Aşamalı Güvenlik ve Pre-Auth Doğrulama',
    tag: 'GÜVENLİK // İKİ AŞAMALI TOTP',
    answer:
      'Kullanıcı şifresini doğruladığında doğrudan tam yetki verilmez; geçici "PRE_AUTH" güvenlik kapsamı tanımlanır. Bu token yalnızca TOTP doğrulama uç noktasına erişebilir. Başarılı Google Authenticator kodundan sonra asıl kurumsal oturum açılır.',
    actionText: 'Telemetri Konsolunu Aç',
    actionType: 'telemetry',
  },
  {
    id: 'batch',
    chipText: 'Spring Batch',
    icon: Layers,
    title: 'Büyük Veri Temizliği ve Analitik Boru Hattı',
    tag: 'ETL // ARŞİV TEMİZLİĞİ',
    answer:
      'Silinmiş makaleler sistemde kalıcı çöp oluşturmaz. Spring Batch 5 ile arka planda çalışan 50 kayıtlık paket işleyicisi, 30 günü aşan kayıtları sunucuyu yormadan güvenli şekilde siler ve yazar analitik raporunu üretir.',
    actionText: 'Batch Stüdyosuna Git',
    actionType: 'tab-batch',
  },
];

export const FloatingCopilotWidget: React.FC<FloatingCopilotWidgetProps> = ({
  onOpenArchitectureConsole,
  onOpenTelemetry,
  onSelectTab,
  onMetricsFlushed,
  onOpenAbout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQnA, setSelectedQnA] = useState<QnA>(KNOWLEDGE_BASE[0]);
  const [isFlushing, setIsFlushing] = useState(false);
  const [flushSuccess, setFlushSuccess] = useState(false);

  const handleManualFlush = async () => {
    setIsFlushing(true);
    setFlushSuccess(false);
    try {
      await ApiClient.flushMetrics();
      setFlushSuccess(true);
      if (onMetricsFlushed) onMetricsFlushed();
      setTimeout(() => setFlushSuccess(false), 2500);
    } catch {
      // ignore
    } finally {
      setIsFlushing(false);
    }
  };

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
    } else if (type === 'manifesto') {
      if (onOpenAbout) onOpenAbout();
    }
  };

  return (
    <>
      {/* 1. Apple-Grade Monolithic Floating Trigger Button (FAB) */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-2xl border border-white/20 dark:border-zinc-800/20 flex items-center justify-center transition-all duration-300 hover:scale-108 active:scale-95 cursor-pointer group select-none btn-tactile"
        title="Nova Mimari Danışmanını Aç"
        aria-label="Nova Mimari Copilot"
      >
        {/* Live Status Indicator Dot */}
        <span className="w-3 h-3 rounded-full bg-emerald-500 absolute top-0.5 right-0.5 ring-2 ring-zinc-950 dark:ring-white shadow-[0_0_8px_#10b981] animate-pulse" />

        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-200 group-hover:rotate-90" />
        ) : (
          <div className="relative flex items-center justify-center">
            {/* Precision Nova Geometric Astroid Star Glyphs */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 transition-transform group-hover:scale-110"
            >
              <path
                d="M12 2C12 7.52285 16.4772 12 22 12C16.4772 12 12 16.4772 12 22C12 16.4772 7.52285 12 2 12C7.52285 12 12 7.52285 12 2Z"
                fill="currentColor"
              />
              <circle cx="12" cy="12" r="2.2" className="fill-zinc-950 dark:fill-white" />
              <circle cx="12" cy="12" r="1.1" className="fill-emerald-400" />
            </svg>
          </div>
        )}
      </button>

      {/* 2. Interactive Frosted Glass Architecture Assistant Drawer */}
      {isOpen && (
        <div className="fixed bottom-22 right-6 z-50 w-[390px] sm:w-[450px] max-w-[92vw] backdrop-blur-2xl bg-white/95 dark:bg-[#0c0e14]/95 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border border-zinc-200/90 dark:border-zinc-800/90 p-5 sm:p-6 space-y-4 font-sans ride-also-drawer-anim text-zinc-950 dark:text-white">
          {/* Drawer Header with Bespoke Nova Insignia */}
          <div className="flex items-center justify-between pb-3.5 border-b border-zinc-200/80 dark:border-zinc-800/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shadow-md border border-zinc-800 dark:border-zinc-200 shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                >
                  <path
                    d="M12 2C12 7.52285 16.4772 12 22 12C16.4772 12 12 16.4772 12 22C12 16.4772 7.52285 12 2 12C7.52285 12 12 7.52285 12 2Z"
                    fill="currentColor"
                  />
                  <circle cx="12" cy="12" r="2.2" className="fill-zinc-950 dark:fill-white" />
                  <circle cx="12" cy="12" r="1.1" className="fill-emerald-400 dark:fill-emerald-600" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 dark:text-white flex items-center gap-1.5">
                  NOVA ARCHITECTURE COPILOT
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 tracking-wider">
                  CANLI MİMARİ & DANIŞMANLIK SİSTEMİ
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Subject Chip Carousel */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
              MİMARİ SORU SEÇİNİZ //
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
              {KNOWLEDGE_BASE.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedQnA.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedQnA(item)}
                    className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-md font-bold'
                        : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200/80 dark:border-zinc-700/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400 dark:text-emerald-600' : 'text-zinc-400'}`} />
                    <span>{item.chipText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Knowledge Card */}
          <div className="p-4.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800/90 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                {selectedQnA.tag}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>DOĞRULANMIŞ SPEC</span>
              </span>
            </div>
            <h4 className="text-base sm:text-[17px] font-black text-zinc-950 dark:text-white leading-snug tracking-tight">
              {selectedQnA.title}
            </h4>
            <p className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans">
              {selectedQnA.answer}
            </p>

            {selectedQnA.id === 'write-behind' ? (
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => handleAction(selectedQnA.actionType)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-sm btn-tactile"
                >
                  <span>İncele</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleManualFlush}
                  disabled={isFlushing}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-sm ${
                    flushSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700'
                  }`}
                  title="Redis Write-Behind tamponundaki tüm birikmiş sayaçları tek seferde veritabanına aktarır"
                >
                  {isFlushing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-900 dark:text-white" />
                  ) : flushSuccess ? (
                    <Check className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{isFlushing ? 'YAZILIYOR' : flushSuccess ? 'BAŞARILI ✓' : 'TEST FLUSH ET'}</span>
                </button>
              </div>
            ) : selectedQnA.actionText ? (
              <div className="pt-2">
                <button
                  onClick={() => handleAction(selectedQnA.actionType)}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-sm btn-tactile"
                >
                  <span>{selectedQnA.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null}
          </div>

          {/* Quick Engine Links Footer */}
          <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <a
              href="http://localhost:5555/swagger-ui.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60 transition-colors font-semibold"
            >
              <span>SWAGGER UI</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
            <a
              href="http://localhost:5555/h2-console"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60 transition-colors font-semibold"
            >
              <span>H2 CONSOLE</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        </div>
      )}
    </>
  );
};
