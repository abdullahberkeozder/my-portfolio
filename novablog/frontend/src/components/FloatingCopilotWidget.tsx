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
import { playKeyClick, playTabSelect, playWindowOpen } from '@/lib/retroAudio';

interface FloatingCopilotWidgetProps {
  onOpenArchitectureConsole?: () => void;
  onOpenTelemetry?: () => void;
  onSelectTab?: (tab: 'feed' | 'ai-search' | 'ai-lab' | 'admin-batch') => void;
  onMetricsFlushed?: () => void;
  onOpenAbout?: () => void;
  onOpenArticle?: (blogId: number) => void;
  onOpenTwoFactor?: () => void;
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

  const handleToggleOpen = () => {
    playWindowOpen();
    setIsOpen((prev) => !prev);
  };

  const handleManualFlush = async () => {
    playKeyClick('crisp');
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
    playKeyClick('crisp');
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
        window.dispatchEvent(new CustomEvent('run-console-simulation'));
      }, 100);
    } else if (type === 'telemetry') {
      if (onOpenTelemetry) onOpenTelemetry();
    } else if (type === 'tab-ai') {
      if (onSelectTab) onSelectTab('ai-search');
      setTimeout(() => {
        const el = document.getElementById('ai-vector-studio');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (type === 'tab-batch') {
      if (onSelectTab) onSelectTab('admin-batch');
      setTimeout(() => {
        const el = document.getElementById('batch-etl-studio');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (type === 'manifesto') {
      if (onOpenAbout) onOpenAbout();
    }
  };

  const handleSelectSubject = (item: QnA) => {
    playTabSelect();
    setSelectedQnA(item);
  };

  return (
    <>
      {/* Floating Trigger Button: Apple High-Gloss Frosted Glass Capsule */}
      {!isOpen && (
        <button
          onClick={handleToggleOpen}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-b from-[#2c2f36]/90 via-[#1e2025]/90 to-[#121316]/95 text-white border border-white/25 shadow-[0_8px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.25)] hover:border-cyan-400/60 hover:shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_16px_rgba(56,189,248,0.25)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer backdrop-blur-xl select-none"
          title="Nova Sistem Mimarı & Copilot Danışmanını Aç"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          </span>
          <Bot className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="font-sans text-xs font-bold tracking-wide text-zinc-100">
            MİMARİ ASİSTAN
          </span>
        </button>
      )}

      {/* Expanded HUD: Mac OS X Translucent Dark Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[95vw] sm:w-[440px] max-w-[460px] rounded-2xl bg-gradient-to-b from-[#222226]/95 via-[#1a1a1e]/95 to-[#121215]/95 backdrop-blur-xl border border-white/20 shadow-[0_24px_60px_rgba(0,0,0,0.85)] text-white p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200 select-none">
          
          {/* Mac Window Titlebar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleToggleOpen}
                  className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] shadow-inner cursor-pointer"
                  title="Pencereyi Kapat"
                />
                <span className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24] shadow-inner" />
                <span className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29] shadow-inner" />
              </div>

              <div className="ml-2 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-cyan-400" />
                <h3 className="font-sans text-xs font-bold text-white tracking-tight">
                  Nova Sistem Mimarı &amp; Copilot
                </h3>
              </div>
            </div>

            <button
              onClick={handleToggleOpen}
              className="text-zinc-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
              title="Kapat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Subject Chip Carousel (Apple Aqua Segmented Tabs) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              MİMARİ KONU BAŞLIĞI //
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {KNOWLEDGE_BASE.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedQnA.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectSubject(item)}
                    className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-sm border border-blue-400/40'
                        : 'bg-white/10 hover:bg-white/15 text-zinc-300 border border-white/10'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{item.chipText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Knowledge Card (Translucent Brushed Plinth) */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-blue-400 font-bold uppercase tracking-wider">
                {selectedQnA.tag}
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
                <span>DOĞRULANMIŞ SPEC</span>
              </span>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-snug">
              {selectedQnA.title}
            </h4>

            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              {selectedQnA.answer}
            </p>

            {/* Action Bar */}
            {selectedQnA.id === 'write-behind' ? (
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => handleAction(selectedQnA.actionType)}
                  className="mac-aqua-btn flex-1 flex items-center justify-center gap-1.5 !py-2 !text-xs font-bold"
                >
                  <span>Konsolda İncele</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={handleManualFlush}
                  disabled={isFlushing}
                  className={`ios6-btn ios6-btn-silver flex-1 flex items-center justify-center gap-1.5 !py-2 !text-xs font-bold ${
                    flushSuccess ? '!text-emerald-400' : ''
                  }`}
                  title="Redis Write-Behind tamponunu veritabanına aktarır"
                >
                  {isFlushing ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : flushSuccess ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  )}
                  <span>{isFlushing ? 'YAZILIYOR' : flushSuccess ? 'BAŞARILI ✓' : 'TEST FLUSH ET'}</span>
                </button>
              </div>
            ) : selectedQnA.actionText ? (
              <div className="pt-2">
                <button
                  onClick={() => handleAction(selectedQnA.actionType)}
                  className="mac-aqua-btn w-full flex items-center justify-center gap-2 !py-2 !text-xs font-bold"
                >
                  <span>{selectedQnA.actionText}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : null}
          </div>

          {/* Quick Engine Links Footer */}
          <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[10px] font-mono">
            <a
              href="http://localhost:5555/swagger-ui.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition-colors font-semibold"
            >
              <span>SWAGGER UI</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <a
              href="http://localhost:5555/h2-console"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition-colors font-semibold"
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
