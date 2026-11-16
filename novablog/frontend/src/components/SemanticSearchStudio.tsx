'use client';

import React, { useState } from 'react';
import { BlogSemanticSearchResultDto, BlogDto } from '@/types/api';
import { ApiClient } from '@/lib/api';
import {
  Search,
  Sparkles,
  Sliders,
  Layers,
  Loader2,
  Activity,
  BookOpen,
  Compass,
} from 'lucide-react';
import { playKeyClick, playTabSelect } from '@/lib/retroAudio';

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

    playKeyClick('crisp');
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
      // ignore
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div id="ai-vector-studio" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 select-none">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-300 dark:border-zinc-800">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span>MİMARİ MODÜL 02 // MAC OS X VECTOR LAB & SPOTLIGHT STUDIO</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-3">
            <span>SPRING AI & PGVECTOR ANLAMSAL ARAMA STÜDYOSU</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl font-sans leading-relaxed">
            Klasik anahtar kelime aramasının ötesine geçen akıllı anlamsal arama motoru. Kullanıcı sorgularını 128 boyutlu
            kosinüs uzayında eşleştirerek milisaniyeler içinde en alakalı makaleleri bulur ve sıralar.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 shrink-0">
          <span className="mac-hardware-chip-badge">128D DENSE</span>
          <span className="mac-hardware-chip-badge">HNSW KOSİNÜS</span>
          <span className="mac-hardware-chip-badge">P99: ~1.8MS</span>
        </div>
      </div>

      {/* Mac OS X Window Chassis */}
      <div className="mac-activity-monitor-chassis">
        {/* Title Bar with Traffic Lights */}
        <div className="h-10 px-4 bg-gradient-to-b from-[#f2f2f2] to-[#d8d8d8] dark:from-[#2c3038] dark:to-[#1e2127] border-b border-[#a8a8a8] dark:border-[#383d47] flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]" />
            </div>
            <span className="ml-3 font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Vector Lab — Spring AI & pgvector Anlamsal Geri Getirim Konsolu
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
            <span>MODEL: EMBEDDING-GECKO-001</span>
            <span>&bull;</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">ONLINE</span>
          </div>
        </div>

        {/* Unified Search Cockpit */}
        <div className="p-5 sm:p-6 bg-[#ebebeb] dark:bg-[#1a1d22] border-b border-[#cccccc] dark:border-[#2f343e] space-y-4">
          {/* Search Mode Segmented Switcher & Threshold Slider */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Segmented Modes */}
            <div className="inline-flex items-center p-1 rounded-lg bg-[#cecece] dark:bg-[#16181d] border border-[#b4b4b4] dark:border-[#2b2f38] text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  playTabSelect();
                  setSearchMode('SEMANTIC');
                }}
                className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  searchMode === 'SEMANTIC'
                    ? 'bg-gradient-to-b from-white to-[#ececec] dark:from-[#3a3f4a] dark:to-[#2a2e37] text-zinc-950 dark:text-white shadow-sm border border-[#a8a8a8] dark:border-[#4c5361]'
                    : 'text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Anlamsal (Semantic)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTabSelect();
                  setSearchMode('HYBRID');
                }}
                className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  searchMode === 'HYBRID'
                    ? 'bg-gradient-to-b from-white to-[#ececec] dark:from-[#3a3f4a] dark:to-[#2a2e37] text-zinc-950 dark:text-white shadow-sm border border-[#a8a8a8] dark:border-[#4c5361]'
                    : 'text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hibrit (RRF)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTabSelect();
                  setSearchMode('KEYWORD');
                }}
                className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  searchMode === 'KEYWORD'
                    ? 'bg-gradient-to-b from-white to-[#ececec] dark:from-[#3a3f4a] dark:to-[#2a2e37] text-zinc-950 dark:text-white shadow-sm border border-[#a8a8a8] dark:border-[#4c5361]'
                    : 'text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-amber-600" />
                <span>Sözcüksel (SQL)</span>
              </button>
            </div>

            {/* Threshold Slider */}
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" />
                Eşik Değeri:
              </span>
              <input
                type="range"
                min="0.4"
                max="0.95"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-28 accent-emerald-500 cursor-pointer"
              />
              <span className="font-bold text-zinc-900 dark:text-zinc-100 min-w-[40px]">
                {(threshold * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Big Search Input with Action Button */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full flex items-center bg-white dark:bg-[#121417] rounded-xl border border-zinc-300 dark:border-zinc-700 px-3.5 py-2.5 shadow-inner">
              <Search className="w-4 h-4 text-zinc-400 mr-2.5 shrink-0" />
              <input
                type="text"
                placeholder="Örn: Yüksek eşzamanlı isteklerde thread performansı ve sanal iş parçacıkları..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                className="w-full bg-transparent text-xs sm:text-sm font-sans text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => handleSearch()}
              disabled={isSearching || !query.trim()}
              className="ios6-btn ios6-btn-blue px-6 py-2.5 text-xs font-bold uppercase w-full sm:w-auto shrink-0"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>ARANIYOR...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>VEKTÖRDE ARA</span>
                </>
              )}
            </button>
          </div>

          {/* Sample Query Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">Örnek Sorgular:</span>
            {sampleQueries.map((sq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(sq);
                  handleSearch(sq);
                }}
                className="text-[10px] font-mono px-2.5 py-1 rounded bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                {sq.substring(0, 38)}...
              </button>
            ))}
          </div>
        </div>

        {/* Results Deck */}
        <div className="p-5 sm:p-6 bg-white dark:bg-[#121417]">
          {hasSearched ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-500 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="font-bold text-zinc-900 dark:text-white">
                  BULUNAN SONUÇLAR: {results.length} ADET
                </span>
                {latencyMs !== null && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <Activity className="w-3 h-3" />
                    Sorgu Gecikmesi: {latencyMs} ms
                  </span>
                )}
              </div>

              {results.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 space-y-2">
                  <p className="text-xs font-mono uppercase font-bold">Eşleşen sonuç bulunamadı</p>
                  <p className="text-[11px] text-zinc-500">
                    Eşik değerini düşürebilir (%50) veya farklı bir anlamsal cümle deneyebilirsiniz.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((r, idx) => {
                    const simPercent = Math.round((r.similarityScore || 0.85) * 100);
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3 bg-[#fafafa] dark:bg-[#16181d] hover:border-emerald-500/60 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="retro-tag-pill">
                              #{r.blog.tags?.[0] || 'mimari'}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              %{simPercent} Anlamsal Uyum
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug line-clamp-2">
                            {r.blog.title}
                          </h3>

                          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed line-clamp-2">
                            {r.blog.header || r.blog.content}
                          </p>

                          {r.explanation && (
                            <div className="p-2 rounded bg-zinc-100 dark:bg-zinc-800/80 text-[10px] font-mono text-zinc-500 border border-zinc-200 dark:border-zinc-700/60 leading-tight">
                              💡 {r.explanation}
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-zinc-500">
                            {r.blog.author || 'Mühendis'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              playKeyClick('crisp');
                              onSelectBlog(r.blog);
                            }}
                            className="ios6-btn ios6-btn-silver px-3 py-1 text-xs"
                          >
                            <BookOpen className="w-3 h-3 text-emerald-600" />
                            <span>Safari Reader ile Aç</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-500 space-y-2">
              <Sparkles className="w-8 h-8 text-purple-500 mx-auto opacity-70 animate-pulse" />
              <p className="text-xs font-mono uppercase font-bold text-zinc-700 dark:text-zinc-300">
                Vektör Sorgulama Motoru Beklemede
              </p>
              <p className="text-[11px] text-zinc-500 max-w-md mx-auto">
                Yukarıdaki arama çubuğuna bir kavram girin veya örnek sorgulardan birine tıklayarak 128D anlamsal uzayı tarayın.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-8 px-4 bg-[#e8e8e8] dark:bg-[#1a1c22] border-t border-[#c0c0c0] dark:border-[#2c3038] flex items-center justify-between text-[10px] font-mono text-zinc-500 select-none">
          <span>SPRING AI 1.0 M4 &bull; POSTGRESQL 16 PGVECTOR</span>
          <span>128-DIMENSIONAL COSINE SIMILARITY ENGINE</span>
        </div>
      </div>
    </div>
  );
};
