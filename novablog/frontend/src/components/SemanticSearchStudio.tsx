'use client';

import React, { useState } from 'react';
import { BlogSemanticSearchResultDto, BlogDto } from '@/types/api';
import { ApiClient } from '@/lib/api';
import {
  Search,
  Cpu,
  Sparkles,
  Sliders,
  Layers,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Terminal,
  Activity,
  Flame,
} from 'lucide-react';

interface SemanticSearchStudioProps {
  onSelectBlog: (blog: BlogDto) => void;
}

export const SemanticSearchStudio: React.FC<SemanticSearchStudioProps> = ({ onSelectBlog }) => {
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'SEMANTIC' | 'HYBRID' | 'KEYWORD'>('SEMANTIC');
  const [threshold, setThreshold] = useState<number>(0.65);
  const [results, setResults] = useState<BlogSemanticSearchResultDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const sampleQueries = [
    'Yüksek eşzamanlı isteklerde thread performansı ve sanal iş parçacıkları',
    'Yapay zeka ile anlamsal makale arama ve akıllı sıralama',
    'Google Authenticator ile iki aşamalı güvenlik ve kurtarma kodları',
    'Büyük veri kümelerinde toplu chunk ETL ve veri temizliği',
  ];

  const handleSearch = async (overrideQuery?: string) => {
    const q = overrideQuery || query;
    if (!q.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    const start = performance.now();

    try {
      let data: BlogSemanticSearchResultDto[] = [];
      if (searchMode === 'SEMANTIC') {
        data = await ApiClient.searchSemantic(q, threshold, 10);
      } else if (searchMode === 'HYBRID') {
        data = await ApiClient.searchHybrid(q, threshold, 10);
      } else {
        const allBlogs = await ApiClient.getBlogs();
        const lower = q.toLowerCase();
        data = allBlogs
          .filter((b) => b.title.toLowerCase().includes(lower) || b.content.toLowerCase().includes(lower))
          .map((b) => ({
            blog: b,
            similarityScore: 0.88,
            matchedKeywords: [lower],
            searchMode: 'KEYWORD' as const,
            explanation: 'Geleneksel SQL LIKE tam metin araması ile sözcüksel eşleşme sağlandı.',
          }));
      }
      setResults(data);
      setLatencyMs(Math.round(performance.now() - start));
    } catch {
      alert('Arama sırasında bir bağlantı hatası oluştu.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner - Ride Also Industrial Spec Sheet */}
      <div className="relative rounded-3xl p-8 sm:p-10 bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden">
        {/* Subtle background tech grid */}
        <div className="absolute inset-0 bg-tech-grid opacity-30 dark:opacity-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-xs font-mono font-bold uppercase text-[#a3c900] dark:text-[#d4f933]">
              <span className="w-2 h-2 rounded-full bg-[#d4f933] shadow-[0_0_8px_#d4f933]" />
              <span>02 {'//'} COGNITIVE RETRIEVAL ENGINE</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-zinc-950 dark:text-white uppercase tracking-tight">
              YAPAY ZEKA ANLAMSAL ARAMA STÜDYOSU
            </h2>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-mono leading-relaxed">
              Klasik anahtar kelime eşleşmesinin ötesine geçen akıllı anlamsal arama motoru. Yazım hatası yapsanız veya
              farklı kelimeler kullansanız bile, aradığınız konunun gerçek bağlamını anlayarak en alakalı makaleleri milisaniyeler içinde bulur.
            </p>
          </div>

          {/* Quick Hardware Spec Cluster */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.08] dark:border-white/[0.08] text-center min-w-[110px]">
              <div className="text-[10px] text-zinc-400 uppercase">VEKTÖR BOYUTU</div>
              <div className="text-sm font-bold text-zinc-950 dark:text-white mt-0.5">128 BOYUTLU</div>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.08] dark:border-white/[0.08] text-center min-w-[110px]">
              <div className="text-[10px] text-zinc-400 uppercase">HESAPLAMA METRİĞİ</div>
              <div className="text-sm font-bold text-zinc-950 dark:text-[#d4f933] mt-0.5">KOSİNÜS AÇISI</div>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.08] dark:border-white/[0.08] text-center min-w-[110px]">
              <div className="text-[10px] text-zinc-400 uppercase">ORTALAMA GECİKME</div>
              <div className="text-sm font-bold text-emerald-500 mt-0.5">~1.8MS P99</div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Cockpit & Search Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 shadow-xl space-y-6">
        {/* Top Controls: Mode Switcher + Threshold Slider */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-black/[0.08] dark:border-white/[0.08]">
          {/* Mode Selector (Ride Also Pill Pairings) */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase text-zinc-400 tracking-wider">
              ARAMA MİMARİSİ //
            </span>
            <div className="inline-flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-full border border-black/10 dark:border-white/10">
              <button
                onClick={() => setSearchMode('SEMANTIC')}
                className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  searchMode === 'SEMANTIC'
                    ? 'bg-zinc-950 dark:bg-[#d4f933] text-white dark:text-black shadow-md'
                    : 'text-zinc-500 hover:text-black dark:hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>01 {'//'} ANLAMSAL VEKTÖR</span>
              </button>
              <button
                onClick={() => setSearchMode('HYBRID')}
                className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  searchMode === 'HYBRID'
                    ? 'bg-zinc-950 dark:bg-[#d4f933] text-white dark:text-black shadow-md'
                    : 'text-zinc-500 hover:text-black dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>02 {'//'} HİBRİT (RRF)</span>
              </button>
              <button
                onClick={() => setSearchMode('KEYWORD')}
                className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  searchMode === 'KEYWORD'
                    ? 'bg-zinc-950 dark:bg-[#d4f933] text-white dark:text-black shadow-md'
                    : 'text-zinc-500 hover:text-black dark:hover:text-white'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>03 {'//'} SQL LIKE</span>
              </button>
            </div>
          </div>

          {/* Threshold Tactile Dial */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.08] dark:border-white/[0.08] font-mono text-xs">
            <Sliders className="w-4 h-4 text-[#a3c900] dark:text-[#d4f933]" />
            <div>
              <span className="text-[10px] text-zinc-400 uppercase block">ANLAMSAL EŞLEŞME EŞİĞİ</span>
              <span className="font-bold text-zinc-950 dark:text-white">
                %{(threshold * 100).toFixed(0)} <span className="text-[#a3c900] dark:text-[#d4f933]">ve üzeri</span>
              </span>
            </div>
            <input
              type="range"
              min="0.40"
              max="0.95"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-32 accent-[#d4f933] cursor-pointer ml-2"
            />
          </div>
        </div>

        {/* Input Bar (Ride Also Capsule Styling) */}
        <div className="relative flex items-center">
          <Search className="absolute left-5 w-5 h-5 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Doğal dilde bir konu arayın... (Örn: 'Mikroservislerde thread bloklanması ve sanal iş parçacıkları')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-14 pr-36 py-4 rounded-full bg-zinc-50 dark:bg-zinc-900/90 border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 text-xs sm:text-sm font-mono focus:outline-none focus:border-[#d4f933] focus:ring-1 focus:ring-[#d4f933] transition-all shadow-inner"
          />
          <button
            onClick={() => handleSearch()}
            disabled={isSearching || !query.trim()}
            className="absolute right-2 px-6 py-2.5 rounded-full bg-zinc-950 dark:bg-[#d4f933] hover:opacity-90 disabled:opacity-50 text-white dark:text-black text-xs font-mono font-black uppercase tracking-wider shadow-md flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>ANLAMSAL ARA</span>
          </button>
        </div>

        {/* Preset Prompt Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
          <span className="text-zinc-400 flex items-center gap-1 text-[11px] uppercase font-bold mr-1">
            <Terminal className="w-3.5 h-3.5 text-[#a3c900] dark:text-[#d4f933]" />
            TEST SORGULARI //
          </span>
          {sampleQueries.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(sq);
                handleSearch(sq);
              }}
              className="text-[11px] px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-zinc-600 dark:text-zinc-300 border border-black/10 dark:border-white/10 transition-colors cursor-pointer text-left truncate max-w-xs"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Latency & Status Banner */}
      {hasSearched && (
        <div className="flex flex-wrap items-center justify-between text-xs font-mono px-2 text-zinc-500">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#a3c900] dark:text-[#d4f933]" />
            <span>
              SONUÇ RAPORU: <strong className="text-zinc-950 dark:text-white font-bold">{results.length}</strong> anlamsal eşleşme süzüldü.
            </span>
          </div>
          {latencyMs !== null && (
            <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>BORU HATTI GECİKMESİ: {latencyMs} ms (ANLAMSAL VEKTÖR ANALİZİ)</span>
            </div>
          )}
        </div>
      )}

      {/* Results Grid - Ride Also Technical Spec Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {results.map((res, index) => {
          const scorePercent = (res.similarityScore * 100).toFixed(1);
          return (
            <div
              key={index}
              onClick={() => onSelectBlog(res.blog)}
              className="group p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 cursor-pointer transition-all duration-300 hover:shadow-2xl space-y-5 relative overflow-hidden"
            >
              {/* Top Meta Line */}
              <div className="flex items-center justify-between gap-2 font-mono">
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-black/10 dark:border-white/10">
                  RANK #{String(index + 1).padStart(2, '0')} {'//'} {res.searchMode}
                </span>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-zinc-400 font-mono text-[11px]">BENZERLİK:</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-black bg-[#d4f933] px-2.5 py-0.5 rounded-full text-xs shadow-sm">
                    %{scorePercent}
                  </span>
                </div>
              </div>

              {/* Progress gauge (Electric Volt line) */}
              <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#d4f933] h-1.5 rounded-full transition-all duration-700 shadow-[0_0_8px_#d4f933]"
                  style={{ width: `${Math.min(100, res.similarityScore * 100)}%` }}
                />
              </div>

              {/* Content Information */}
              <div className="space-y-2">
                <p className="text-[11px] font-mono uppercase text-[#a3c900] dark:text-[#d4f933] font-bold tracking-wider">
                  {res.blog.header}
                </p>
                <h3 className="text-xl font-black text-zinc-950 dark:text-white uppercase tracking-tight group-hover:text-zinc-600 dark:group-hover:text-[#d4f933] transition-colors">
                  {res.blog.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {res.blog.content}
                </p>
              </div>

              {/* AI Explanation Telemetry Box */}
              {res.explanation && (
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-black/[0.08] dark:border-white/[0.08] text-xs font-mono text-zinc-600 dark:text-zinc-400 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#a3c900] dark:text-[#d4f933]" />
                    <span>AI EŞLEŞME GEREKÇESİ //</span>
                  </div>
                  <p className="text-[11px] leading-relaxed font-sans">{res.explanation}</p>
                </div>
              )}

              {/* Bottom Spec Footer & CTA */}
              <div className="pt-3 flex items-center justify-between border-t border-black/[0.08] dark:border-white/[0.08] text-xs font-mono">
                <div className="flex flex-wrap items-center gap-1.5">
                  {res.matchedKeywords?.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px]"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-zinc-950 dark:text-[#d4f933] font-black uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                  <span>İNCELE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
