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
    'Spring Boot 4.1.1 ve Java 22 Virtual Threads ile yüksek trafikli mikroservis mimarilerinde thread havuzu bloklanmaları tamamen ortadan kalkmaktadır. Spring AI entegrasyonu ile 128 boyutlu yoğun vektör gömmeleri oluşturulup veritabanında saklanmakta ve kosinüs benzerliği formülü ile milisaniyeler seviyesinde anlamsal sorgulama yapılabilmektedir. Sistem ayrıca RFC 6238 uyumlu TOTP iki faktörlü kimlik doğrulama, MinIO S3 nesne depolama ve Spring Batch ETL boru hatları ile güçlendirilmiştir.'
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="rounded-3xl p-8 bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Spring AI NLP & LLM Playground
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI Test & Deneyim Laboratuvarı
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Spring AI servislerinin doğal dil işleme yeteneklerini canlı olarak test edin: Otomatik TL;DR Özet Çıkarma,
            NLP tabanlı Akıllı Etiket & Kategori Önerisi ve Toksisite & Duygu Durum Denetimi.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('summarize')}
          className={`flex items-center gap-2 pb-3 px-2 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'summarize'
              ? 'border-emerald-400 text-emerald-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-4 h-4" />
          1. Canlı TL;DR Özetleme
        </button>
        <button
          onClick={() => setActiveTab('tagging')}
          className={`flex items-center gap-2 pb-3 px-2 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'tagging'
              ? 'border-indigo-400 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tags className="w-4 h-4" />
          2. Akıllı Etiket & Kategori
        </button>
        <button
          onClick={() => setActiveTab('moderation')}
          className={`flex items-center gap-2 pb-3 px-2 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'moderation'
              ? 'border-purple-400 text-purple-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          3. Toksisite & Duygu Denetimi
        </button>
      </div>

      {/* Tab 1: Summarize */}
      {activeTab === 'summarize' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-400" />
              Girdi Metni (Serbest Makale veya Paragraf)
            </h3>
            <textarea
              rows={8}
              value={sumText}
              onChange={(e) => setSumText(e.target.value)}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
            <button
              onClick={handleSummarize}
              disabled={isSummarizing || !sumText.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
            >
              {isSummarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Spring AI ile TL;DR Yönetici Özeti Çıkar
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Spring AI Çıktısı (TL;DR)
                </h3>
                {sumResult && (
                  <span className="text-xs font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                    -%{(sumResult.compressionRatio * 100).toFixed(0)} Sıkıştırma
                  </span>
                )}
              </div>

              {sumResult ? (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-slate-200 text-sm leading-relaxed space-y-3">
                  <p className="font-sans">{sumResult.summary}</p>
                  <div className="pt-3 border-t border-emerald-500/20 grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-400">
                    <div>
                      Orijinal: <strong className="text-slate-200">{sumResult.originalLength} krk</strong>
                    </div>
                    <div>
                      Özet: <strong className="text-slate-200">{sumResult.summaryLength} krk</strong>
                    </div>
                    <div>
                      Süre: <strong className="text-emerald-400">{sumResult.executionTimeMs} ms</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-slate-950/50 border border-slate-800/80 text-center text-xs text-slate-500">
                  Soldaki alana metin girip butona basarak anlık AI özet sonucunu görüntüleyin.
                </div>
              )}
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              Model: Extractive Salience Graph + Spring AI Fallback
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tagging */}
      {activeTab === 'tagging' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Tags className="w-5 h-5 text-indigo-400" />
              Blog Başlığı ve İçeriği
            </h3>
            <input
              type="text"
              value={tagTitle}
              onChange={(e) => setTagTitle(e.target.value)}
              placeholder="Blog Başlığı"
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            />
            <textarea
              rows={6}
              value={tagContent}
              onChange={(e) => setTagContent(e.target.value)}
              placeholder="Blog İçeriği"
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
            <button
              onClick={handleTagging}
              disabled={isTagging || !tagTitle.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all"
            >
              {isTagging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              NLP ile Otomatik Etiket & Kategori Belirle
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              AI Öneri Sonuçları
            </h3>

            {tagResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
                  <div>
                    <span className="text-xs text-slate-400">Önerilen Kategori:</span>
                    <div className="text-lg font-bold text-indigo-300 mt-0.5">
                      {tagResult.suggestedCategory}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Güven Skoru:</span>
                    <div className="text-sm font-mono text-emerald-400 font-bold">
                      %{(tagResult.confidenceScore * 100).toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Önerilen Etiketler:</span>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {tagResult.suggestedTags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 text-xs font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-950/50 border border-slate-800/80 text-center text-xs text-slate-500">
                Başlık ve içerik girip butona basarak Spring AI&apos;ın otomatik etiketleme sonucunu inceleyin.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Moderation */}
      {activeTab === 'moderation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              İçerik / Yorum Metni
            </h3>
            <textarea
              rows={6}
              value={modText}
              onChange={(e) => setModText(e.target.value)}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500 leading-relaxed"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setModText('Mükemmel bir anlatım, kod örnekleri çok kaliteli ve öğretici.')}
                className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Pozitif Yorum Örneği
              </button>
              <button
                onClick={() => setModText('Bu sistem tam bir rezalet, çok kötü ve berbat bir proje!')}
                className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300"
              >
                Negatif Yorum Örneği
              </button>
            </div>
            <button
              onClick={handleModerate}
              disabled={isModerating || !modText.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 transition-all"
            >
              {isModerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              AI Toksisite & Duygu Durumu Denetle
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-purple-400" />
              Moderasyon Değerlendirmesi
            </h3>

            {modResult ? (
              <div
                className={`p-5 rounded-xl border space-y-4 ${
                  modResult.toxic
                    ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                    : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {modResult.toxic ? (
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    )}
                    <span className="font-bold text-base">
                      {modResult.toxic ? 'Sakıncalı / Toksik İçerik Algılandı' : 'Güvenli ve Kurallara Uygun'}
                    </span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                    Toksisite: {(modResult.toxicityScore * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-700/60">
                  <div>
                    <span className="text-slate-400">Duygu Durumu (Sentiment):</span>
                    <div className="font-bold font-mono text-sm mt-0.5 text-white">
                      {modResult.sentiment}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Duygu Skoru:</span>
                    <div className="font-bold font-mono text-sm mt-0.5 text-white">
                      {modResult.sentimentScore > 0 ? `+${modResult.sentimentScore.toFixed(2)}` : modResult.sentimentScore.toFixed(2)}
                    </div>
                  </div>
                </div>

                {modResult.reason && (
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{modResult.reason}</p>
                )}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-950/50 border border-slate-800/80 text-center text-xs text-slate-500">
                Yorum metnini analiz ederek Spring AI pre-moderasyon motorunun sonucunu görün.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

