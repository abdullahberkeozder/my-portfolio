'use client';

import React, { useEffect } from 'react';
import {
  X,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Zap,
  Layers,
  Database,
  Code2,
  Sparkles,
  User,
} from 'lucide-react';

interface AboutManifestoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutManifestoModal: React.FC<AboutManifestoModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 select-none">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/15 dark:border-white/15 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col font-sans">
        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 bg-zinc-50 dark:bg-zinc-950/80 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between font-mono">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d4f933] shadow-[0_0_8px_#d4f933] animate-pulse" />
            <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              MİMAR // MÜHENDİSLİK MANİFESTOSU
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span className="text-[11px] text-zinc-400">ABDULLAH BERKE ÖZDER</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Kapat (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 scrollbar-thin">
          {/* Hero Profile & Core Statement */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-mono font-bold uppercase">
              <User className="w-3.5 h-3.5" />
              <span>SİSTEM MİMARI &amp; BACKEND GELİŞTİRİCİ</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white uppercase tracking-tight">
              MÜHENDİSLİK, KARMAŞIK ŞEYLERİ DAHA DA KARMAŞIKLAŞTIRMAK DEĞİLDİR.
            </h3>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans">
              NovaBlog platformu; sıradan bir web sitesi veya şablon portfolyo olarak değil,{' '}
              <strong className="text-zinc-950 dark:text-white">
                &ldquo;Büyük veri ve yoğun trafik altında dahi milisaniyeler içinde yanıt veren modern bir dağıtık sistem şartnamesi&rdquo;
              </strong>{' '}
              olarak inşa edildi.
            </p>
          </div>

          {/* Why the Dieter Rams & Teenage Engineering Aesthetic? */}
          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.08] dark:border-white/[0.08] space-y-3 font-mono">
            <div className="flex items-center gap-2 text-xs font-bold text-[#a3c900] dark:text-[#d4f933] uppercase">
              <Sparkles className="w-4 h-4" />
              <span>NEDEN ENDÜSTRİYEL DOKUNSALLIK VE JAVA 22?</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-sans leading-relaxed">
              Dieter Rams&apos;ın <span className="italic">&ldquo;İyi tasarım dürüsttür, ayrıntıya kadar tutarlıdır ve olabildiğince az tasarımdır&rdquo;</span> ilkesini
              yazılım mimarisine uyarladık. Şişirilmiş gereksiz mikroservisler yerine, tek bir JVM üzerinde donanım sınırlarını zorlayan,
              kilitlenmeyen ve veri kaybetmeyen saf mühendislik disiplinini benimsiyoruz.
            </p>
          </div>

          {/* 4 Pillars of the Architecture */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
              DÖRT TEMEL MİMARİ TAAHHÜT
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 font-bold text-zinc-950 dark:text-white uppercase">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>01 // SIFIR KİLİTLENME</span>
                </div>
                <p className="text-[11px] font-sans text-zinc-500 leading-relaxed">
                  Java 22 Loom sanal iş parçacıklarıyla 10.000+ eşzamanlı istekte sunucu RAM darboğazına girmeden sub-milisaniyede yanıt verir.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 font-bold text-zinc-950 dark:text-white uppercase">
                  <Layers className="w-4 h-4 text-purple-500" />
                  <span>02 // ANLAMSAL ZEKA</span>
                </div>
                <p className="text-[11px] font-sans text-zinc-500 leading-relaxed">
                  Spring AI ve pgvector ile kelimeleri harf harf değil, anlam ilişkisine göre kavrayan açısal arama motoru.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 font-bold text-zinc-950 dark:text-white uppercase">
                  <Database className="w-4 h-4 text-rose-500" />
                  <span>03 // VERİ KORUMASI</span>
                </div>
                <p className="text-[11px] font-sans text-zinc-500 leading-relaxed">
                  Redis Write-Behind ile veritabanı satır kilitlemelerini önler, sayaçları bellekte toplayıp 30 saniyede bir güvenle yazar.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 font-bold text-zinc-950 dark:text-white uppercase">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>04 // TEST GÜVENCESİ</span>
                </div>
                <p className="text-[11px] font-sans text-zinc-500 leading-relaxed">
                  201 birim ve entegrasyon testiyle %100 doğrulanmış, RFC 7807 standartlarında kurumsal hata yönetimi.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action & Contact Links */}
          <div className="pt-2 flex flex-wrap items-center gap-3 font-mono text-xs">
            <a
              href="https://github.com/abdullahberkeozder"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-black font-bold uppercase hover:opacity-90 transition-opacity cursor-pointer shadow-md"
            >
              <Code2 className="w-4 h-4" />
              <span>GITHUB PROJELERİ</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>

            <a
              href="https://abdullahberkeozder.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold uppercase hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer border border-black/10 dark:border-white/10"
            >
              <span>PORTFOLYO &amp; KARİYER</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>

            <a
              href="http://localhost:5555/swagger-ui.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#d4f933]/15 text-[#6c8600] dark:text-[#d4f933] border border-[#d4f933]/30 font-bold uppercase hover:bg-[#d4f933]/25 transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>SWAGGER CANLI API</span>
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-zinc-50 dark:bg-zinc-950/80 border-t border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>NovaBlog Enterprise Core 4.1.1</span>
          <button
            onClick={onClose}
            className="text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white font-bold uppercase cursor-pointer"
          >
            Kapat [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
