'use client';

import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  ShieldCheck,
  Zap,
  Layers,
  Database,
  Code2,
  Terminal,
  Cpu,
  User,
  Info,
} from 'lucide-react';
import { playKeyClick, playTabSelect } from '@/lib/retroAudio';

interface AboutManifestoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutManifestoModal: React.FC<AboutManifestoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'manifesto' | 'pillars'>('overview');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-md transition-opacity duration-200"
      />

      {/* Mac OS X "About This Mac" Dialog Sheet */}
      <div
        className="relative mac-security-dialog w-full max-w-lg shadow-2xl overflow-hidden z-10 flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mac OS X Window Title Bar with Traffic Lights */}
        <div className="h-10 px-4 bg-gradient-to-b from-[#f2f2f2] to-[#d8d8d8] dark:from-[#2c3038] dark:to-[#1e2127] border-b border-[#a8a8a8] dark:border-[#383d47] flex items-center justify-between select-none shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  playKeyClick('crisp');
                  onClose();
                }}
                className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] hover:opacity-80 cursor-pointer"
                title="Kapat"
              />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] opacity-60" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] opacity-60" />
            </div>
            <span className="ml-3 font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-zinc-500" />
              Bu Sistem Hakkında — NovaBlog Enterprise
            </span>
          </div>

          <span className="text-[10px] font-mono text-zinc-500">
            MAC OS X 10.8 EDITION
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 py-2 bg-[#e4e4e4] dark:bg-[#202329] border-b border-[#c0c0c0] dark:border-[#333740] flex items-center justify-center shrink-0">
          <div className="inline-flex items-center p-0.5 rounded-lg bg-[#cecece] dark:bg-[#16181d] border border-[#b4b4b4] dark:border-[#2b2f38] text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                playTabSelect();
                setActiveTab('overview');
              }}
              className={`px-3 py-1 rounded font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Genel Bakış
            </button>
            <button
              type="button"
              onClick={() => {
                playTabSelect();
                setActiveTab('manifesto');
              }}
              className={`px-3 py-1 rounded font-bold transition-all ${
                activeTab === 'manifesto'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Manifesto
            </button>
            <button
              type="button"
              onClick={() => {
                playTabSelect();
                setActiveTab('pillars');
              }}
              className={`px-3 py-1 rounded font-bold transition-all ${
                activeTab === 'pillars'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Taahhütler
            </button>
          </div>
        </div>

        {/* Dialog Body */}
        <div className="p-6 space-y-5 bg-[#f6f6f6] dark:bg-[#16181d] max-h-[70vh] overflow-y-auto">
          {/* TAB 1: OVERVIEW (Authentic "About This Mac" Layout) */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Top Hero: Apple Logo & OS X Typography */}
              <div className="flex flex-col items-center justify-center text-center space-y-1 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="text-4xl font-extrabold text-zinc-700 dark:text-zinc-300 drop-shadow-sm select-none">
                  ❖
                </div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                  NovaBlog Enterprise OS
                </h2>
                <p className="text-xs font-mono text-zinc-500">
                  Sürüm 4.1.1 (Yapı 2026.11.16 &bull; Loom 64-Bit)
                </p>
              </div>

              {/* Hardware & System Profile Rows */}
              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex items-start justify-between py-1 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-bold w-28 shrink-0">İŞLEMCİ:</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-semibold text-right">
                    Java 22 Project Loom (8 Carrier Core, Lock-Free)
                  </span>
                </div>

                <div className="flex items-start justify-between py-1 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-bold w-28 shrink-0">BELLEK (RAM):</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-semibold text-right">
                    128D Dense Vector &bull; pgvector HNSW + L1 Caffeine
                  </span>
                </div>

                <div className="flex items-start justify-between py-1 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-bold w-28 shrink-0">DEPOLAMA:</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-semibold text-right">
                    PostgreSQL 16 Cluster &bull; Redis Write-Behind
                  </span>
                </div>

                <div className="flex items-start justify-between py-1 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-bold w-28 shrink-0">YAPAY ZEKA:</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-semibold text-right">
                    Spring AI 1.0 M4 &bull; 1.4ms P99 Kosinüs Arama
                  </span>
                </div>

                <div className="flex items-start justify-between py-1 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 font-bold w-28 shrink-0">MİMAR &amp; LEAD:</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-bold text-right flex items-center gap-1 justify-end">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    Abdullah Berke Özder
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANIFESTO */}
          {activeTab === 'manifesto' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  <Cpu className="w-4 h-4" />
                  <span>DİETER RAMS &amp; STEVE JOBS DİSİPLİNİ</span>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 font-sans leading-relaxed">
                  Dieter Rams&apos;ın <span className="italic font-semibold">&ldquo;İyi tasarım dürüsttür, ayrıntıya kadar tutarlıdır ve olabildiğince az tasarımdır&rdquo;</span> ilkesini
                  yazılım mimarisine uyarladık. Şişirilmiş gereksiz mikroservisler yerine, tek bir JVM üzerinde donanım sınırlarını zorlayan,
                  kilitlenmeyen ve veri kaybetmeyen saf mühendislik disiplinini benimsiyoruz.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                NovaBlog platformu sıradan bir web şablonu olarak değil, <strong>&ldquo;Büyük veri ve yoğun trafik altında dahi milisaniyeler içinde yanıt veren modern bir dağıtık sistem şartnamesi&rdquo;</strong> olarak inşa edildi.
              </div>
            </div>
          )}

          {/* TAB 3: 4 PILLARS */}
          {activeTab === 'pillars' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
              <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white text-[11px]">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>01 // SIFIR KİLİTLENME</span>
                </div>
                <p className="text-[10px] font-sans text-zinc-500 leading-snug">
                  Java 22 Loom ile 10.000+ eşzamanlı istekte sunucu RAM darboğazına girmeden sub-milisaniyede yanıt verir.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white text-[11px]">
                  <Layers className="w-3.5 h-3.5 text-purple-500" />
                  <span>02 // ANLAMSAL ZEKA</span>
                </div>
                <p className="text-[10px] font-sans text-zinc-500 leading-snug">
                  Spring AI ve pgvector ile kelimeleri anlam ilişkisine göre kavrayan açısal arama motoru.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white text-[11px]">
                  <Database className="w-3.5 h-3.5 text-rose-500" />
                  <span>03 // VERİ KORUMASI</span>
                </div>
                <p className="text-[10px] font-sans text-zinc-500 leading-snug">
                  Redis Write-Behind ile sayaçları bellekte toplayıp 30 saniyede bir toplu veritabanına yazar.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>04 // TEST GÜVENCESİ</span>
                </div>
                <p className="text-[10px] font-sans text-zinc-500 leading-snug">
                  201 test ile %100 doğrulanmış, RFC 7807 standartlarında kurumsal hata yönetimi.
                </p>
              </div>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <a
                href="http://localhost:5555/swagger-ui.html"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playKeyClick('crisp')}
                className="ios6-btn ios6-btn-blue px-3 py-1.5 text-xs font-bold"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Sistem Raporu...</span>
              </a>

              <a
                href="https://github.com/abdullahberkeozder"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playKeyClick('crisp')}
                className="ios6-btn ios6-btn-silver px-3 py-1.5 text-xs font-bold"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
              </a>
            </div>

            <button
              type="button"
              onClick={() => {
                playKeyClick('crisp');
                onClose();
              }}
              className="ios6-btn ios6-btn-silver px-4 py-1.5 text-xs font-bold"
            >
              Kapat
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="h-8 px-4 bg-[#e8e8e8] dark:bg-[#1a1c22] border-t border-[#c0c0c0] dark:border-[#2c3038] flex items-center justify-between text-[10px] font-mono text-zinc-500 select-none shrink-0">
          <span>TM ve © 2010–2026 Apple Inc. ve Nova Teknoloji</span>
          <span>TÜM HAKLARI SAKLIDIR</span>
        </div>
      </div>
    </div>
  );
};
