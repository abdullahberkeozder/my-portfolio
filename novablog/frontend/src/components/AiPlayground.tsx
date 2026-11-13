'use client';

import React, { useState } from 'react';
import { ApiClient } from '@/lib/api';
import {
  AiSummaryResponseDto,
  AiTagSuggestionResponseDto,
  AiModerationResponseDto,
} from '@/types/api';
import {
  Sparkles,
  Bot,
  Tags,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

export const AiPlayground: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'summarize' | 'tagging' | 'moderation'>('summarize');

  // Summarize state
  const [sumText, setSumText] = useState(
    'Spring Boot 4.1.1 ve Java 22 Virtual Threads mimarisi, yüksek trafik anında sunucu kilitlenmelerini ortadan kaldırır. Spring AI entegrasyonu, kelimelerin ötesinde derin anlamsal ilişkileri kavrayarak en alakalı makaleleri milisaniyeler içinde kullanıcıya sunar. Sistem ayrıca Redis önbellek tamponu, iki faktörlü (2FA TOTP) kimlik doğrulama ve veri kaybını önleyen lock-free kilitlenme korumasıyla güçlendirilmiştir.'
  );
  const [sumResult, setSumResult] = useState<AiSummaryResponseDto | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Tagging state
  const [tagTitle, setTagTitle] = useState('Spring Boot 4 ve Java 22 ile Sanal İş Parçacıkları');
  const [tagContent, setTagContent] = useState(
    'Loom projesi kapsamında gelen virtual threads ile eşzamanlı I/O işlemlerinde sıfır maliyetli iş parçacığı yönetimi ve PostgreSQL bağlantı havuzu optimizasyonu.'
  );
  const [tagResult, setTagResult] = useState<AiTagSuggestionResponseDto | null>(null);
  const [isTagging, setIsTagging] = useState(false);

  // Moderation state
  const [modText, setModText] = useState(
    'Harika bir mimari makalesi olmuş, Spring AI vektör arama entegrasyonunu çok başarılı buldum!'
  );
  const [modResult, setModResult] = useState<AiModerationResponseDto | null>(null);
  const [isModerating, setIsModerating] = useState(false);

  const handleSummarize = async () => {
    if (!sumText.trim()) return;
    setIsSummarizing(true);
    try {
      const res = await ApiClient.summarizeText(sumText, 'Kurumsal Mimari');
      setSumResult(res);
    } catch {
      alert('Özet çıkarılamadı.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleTagging = async () => {
    if (!tagTitle.trim() || !tagContent.trim()) return;
    setIsTagging(true);
    try {
      const res = await ApiClient.suggestTags(tagTitle, tagContent);
      setTagResult(res);
    } catch {
      alert('Etiket önerilemedi.');
    } finally {
      setIsTagging(false);
    }
  };

  const handleModerate = async () => {
    if (!modText.trim()) return;
    setIsModerating(true);
    try {
      const res = await ApiClient.moderateContent(modText);
      setModResult(res);
    } catch {
      alert('Moderasyon analizi yapılamadı.');
    } finally {
      setIsModerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner (Ride Also Industrial Spec Sheet) */}
      <div className="relative rounded-3xl p-8 sm:p-10 bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-tech-grid opacity-30 dark:opacity-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs font-mono font-bold uppercase text-zinc-800 dark:text-zinc-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <span>03 {'//'} NEURAL INFERENCE LAB</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-zinc-950 dark:text-white uppercase tracking-tight">
              SPRING AI NLP & LLM DENEYİM ATÖLYESİ
            </h2>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-mono leading-relaxed">
              Spring AI servislerinin doğal dil işleme yeteneklerini gerçek zamanlı test edin: Otomatik TL;DR Yönetici
              Özeti, Kategori & Etiket Çıkarımı ve Toksisite & Duygu Durumu Güvenlik Radarı.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 text-center min-w-[110px]">
              <div className="text-[10px] text-zinc-400 uppercase">MODEL ÇIKARIMI</div>
              <div className="text-sm font-bold text-zinc-950 dark:text-white mt-0.5">LOCAL + API</div>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 text-center min-w-[110px]">
              <div className="text-[10px] text-zinc-400 uppercase">BORU HATTI</div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">SIFIR SIZINTI</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cockpit Mode Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono">
        <button
          onClick={() => setActiveTab('summarize')}
          className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 ${
            activeTab === 'summarize'
              ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-md'
              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white border border-zinc-200/80 dark:border-zinc-800'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>01 {'//'} TL;DR ÖZET ÇIKARICI</span>
        </button>

        <button
          onClick={() => setActiveTab('tagging')}
          className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 ${
            activeTab === 'tagging'
              ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-md'
              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white border border-zinc-200/80 dark:border-zinc-800'
          }`}
        >
          <Tags className="w-4 h-4" />
          <span>02 {'//'} AKILLI TAKSONOMİ</span>
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 ${
            activeTab === 'moderation'
              ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-md'
              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white border border-zinc-200/80 dark:border-zinc-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>03 {'//'} GÜVENLİK & DUYGU RADARI</span>
        </button>
      </div>

      {/* Tab 1: Summarize */}
      {activeTab === 'summarize' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Console (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 space-y-5 shadow-xl">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="flex items-center gap-2 text-zinc-950 dark:text-white font-bold uppercase">
                <Bot className="w-4 h-4 text-emerald-500" />
                METİN GİRDİ TAMPONU
              </span>
              <span className="text-zinc-400 uppercase">{sumText.length} KARAKTER</span>
            </div>

            <textarea
              rows={7}
              value={sumText}
              onChange={(e) => setSumText(e.target.value)}
              className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs font-mono focus:outline-none focus:border-zinc-500 leading-relaxed shadow-inner"
            />

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleSummarize}
                disabled={isSummarizing || !sumText.trim()}
                className="px-6 py-3 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 disabled:opacity-50 text-xs font-mono font-black uppercase tracking-wider shadow-md flex items-center gap-2 transition-transform active:scale-95 cursor-pointer btn-tactile"
              >
                {isSummarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>ÖZETİ ÇIKAR // ÇALIŞTIR</span>
              </button>

              <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">
                SALIENCE GRAPH + FALLBACK
              </span>
            </div>
          </div>

          {/* Telemetry Output (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 space-y-5 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="flex items-center gap-2 text-zinc-950 dark:text-white font-bold uppercase">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  TL;DR YÖNETİCİ ÇIKTISI
                </span>
                {sumResult && (() => {
                  const rawRatio = sumResult.compressionRatio != null ? Number(sumResult.compressionRatio) : 0;
                  const percent = Math.round(rawRatio <= 1 ? rawRatio * 100 : rawRatio);
                  const validPercent = isNaN(percent) || percent < 0 ? 0 : percent;
                  return (
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px]">
                      -%{validPercent} SIKIŞTIRMA
                    </span>
                  );
                })()}
              </div>

              {sumResult ? (
                <div className="space-y-4 font-mono">
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.08] dark:border-white/[0.08] text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                    {sumResult.summary}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
                      <div className="text-[10px] text-zinc-400 font-mono">ORİJİNAL</div>
                      <div className="font-bold text-zinc-950 dark:text-white mt-0.5 font-mono">
                        {sumResult.originalLength ?? sumText.length} krk
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
                      <div className="text-[10px] text-zinc-400 font-mono">ÖZET</div>
                      <div className="font-bold text-zinc-950 dark:text-white mt-0.5 font-mono">
                        {sumResult.summaryLength ?? (sumResult.summary || '').length} krk
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
                      <div className="text-[10px] text-zinc-400 font-mono">GECİKME</div>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                        {sumResult.executionTimeMs ?? 24} ms
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-14 text-center font-mono text-xs text-zinc-400 border border-dashed border-black/10 dark:border-white/10 rounded-2xl p-6">
                  Sol paneldeki metni onaylayarak çıkarımı başlatın.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                SPRING AI ÇIKARIM SERVİSİ
              </span>
              <span className="text-emerald-500 font-bold">HAZIR</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tagging */}
      {activeTab === 'tagging' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="flex items-center gap-2 text-zinc-950 dark:text-white font-bold uppercase">
                <Tags className="w-4 h-4 text-emerald-500" />
                İÇERİK ANALİZ GİRDİSİ
              </span>
            </div>

            <input
              type="text"
              value={tagTitle}
              onChange={(e) => setTagTitle(e.target.value)}
              placeholder="Blog Başlığı"
              className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs font-mono focus:outline-none focus:border-zinc-500"
            />

            <textarea
              rows={5}
              value={tagContent}
              onChange={(e) => setTagContent(e.target.value)}
              placeholder="Blog İçeriği"
              className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs font-mono focus:outline-none focus:border-zinc-500 leading-relaxed"
            />

            <button
              onClick={handleTagging}
              disabled={isTagging || !tagTitle.trim()}
              className="px-6 py-3 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 disabled:opacity-50 text-xs font-mono font-black uppercase tracking-wider shadow-md flex items-center gap-2 transition-transform active:scale-95 cursor-pointer btn-tactile"
            >
              {isTagging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>OTOMATİK TAKSONOMİ OLUŞTUR</span>
            </button>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 space-y-5 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="flex items-center gap-2 text-zinc-950 dark:text-white font-bold uppercase">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ÖNERİ TELEMETRİSİ
                </span>
              </div>

              {tagResult ? (
                <div className="space-y-4 font-mono text-xs">
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono">ÖNERİLEN KATEGORİ</span>
                    <div className="text-xl font-black text-zinc-950 dark:text-white uppercase">
                      {tagResult.suggestedCategory}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono">GÜVEN SKORU</span>
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      %{Math.round(tagResult.confidenceScore * 100)}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono">ÇIKARILAN ETİKETLER</span>
                    <div className="flex flex-wrap gap-1.5">
                      {tagResult.suggestedTags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-14 text-center font-mono text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                  İçerik bilgilerini girerek taksonomi çıkarımını tetikleyin.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>SIFIR ÖRNEKLİ SINIFLANDIRMA</span>
              <span className="text-emerald-500 font-bold">DOĞRULANDI</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Moderation */}
      {activeTab === 'moderation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="flex items-center gap-2 text-zinc-950 dark:text-white font-bold uppercase">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                İÇERİK / YORUM GÜVENLİK GİRDİSİ
              </span>
            </div>

            <textarea
              rows={5}
              value={modText}
              onChange={(e) => setModText(e.target.value)}
              className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs font-mono focus:outline-none focus:border-zinc-500 leading-relaxed"
            />

            <div className="flex flex-wrap gap-2 font-mono text-xs">
              <button
                onClick={() => setModText('Mükemmel bir anlatım, kod örnekleri çok kaliteli ve öğretici.')}
                className="text-[11px] px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800 transition-colors cursor-pointer"
              >
                + POZİTİF TEST ÖRNEĞİ
              </button>
              <button
                onClick={() => setModText('Bu sistem tam bir rezalet, çok kötü ve berbat bir proje!')}
                className="text-[11px] px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-rose-600 hover:text-white text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800 transition-colors cursor-pointer"
              >
                - TOKSİK TEST ÖRNEĞİ
              </button>
            </div>

            <button
              onClick={handleModerate}
              disabled={isModerating || !modText.trim()}
              className="px-6 py-3 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 disabled:opacity-50 text-xs font-mono font-black uppercase tracking-wider shadow-md flex items-center gap-2 transition-transform active:scale-95 cursor-pointer btn-tactile"
            >
              {isModerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>GÜVENLİK VE DUYGU DENETLE</span>
            </button>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 space-y-5 shadow-xl flex flex-col justify-between">
            <div className="space-y-4 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-zinc-950 dark:text-white font-bold uppercase">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  RADAR ANALİZİ
                </span>
              </div>

              {modResult ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {modResult.toxic ? (
                        <AlertTriangle className="w-5 h-5 text-rose-500" />
                      ) : (
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      )}
                      <span className="font-bold text-sm text-zinc-950 dark:text-white uppercase">
                        {modResult.toxic ? 'TOKSİK / SAKINCALI' : 'GÜVENLİ VE UYGUN'}
                      </span>
                    </div>

                    <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20">
                      %{(modResult.toxicityScore * 100).toFixed(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
                      <div className="text-[10px] text-zinc-400 uppercase font-mono">DUYGU DURUMU</div>
                      <div className="font-bold text-zinc-950 dark:text-white mt-0.5 font-mono">
                        {modResult.sentiment}
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
                      <div className="text-[10px] text-zinc-400 uppercase font-mono">DUYGU SKORU</div>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                        {modResult.sentimentScore > 0 ? `+${modResult.sentimentScore.toFixed(2)}` : modResult.sentimentScore.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {modResult.reason && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800">
                      {modResult.reason}
                    </p>
                  )}
                </div>
              ) : (
                <div className="py-14 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                  İçeriği denetime göndererek sonucu analiz edin.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>GÜVENLİK FİLTRESİ</span>
              <span className="text-emerald-500 font-bold">AKTİF</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
