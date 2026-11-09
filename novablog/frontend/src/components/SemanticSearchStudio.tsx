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
  Info,
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
    'Vektör gömme ve kosinüs benzerliği ile akıllı arama motoru',
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
        // Classic Keyword simulation
        const allBlogs = await ApiClient.getBlogs();
        const lower = q.toLowerCase();
        data = allBlogs
          .filter((b) => b.title.toLowerCase().includes(lower) || b.content.toLowerCase().includes(lower))
          .map((b) => ({
            blog: b,
            similarityScore: 0.85,
            matchedKeywords: [lower],
            searchMode: 'KEYWORD' as const,
            explanation: 'Geleneksel SQL LIKE araması ile kelime eşleşmesi sağlandı.',
          }));
      }
      setResults(data);
      setLatencyMs(Math.round(performance.now() - start));
    } catch {
      alert('Arama sırasında bir hata oluştu.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl p-8 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono mb-4">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            Spring AI Vector Studio & Cosine Similarity
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Anlamsal & Hibrit Vektör Arama Motoru
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Klasik anahtar kelime eşleşmesinin ötesine geçin. Doğal dil sorgunuz 128 boyutlu yoğun vektör gömmesine
            (Dense Vector Embedding) dönüştürülür ve veritabanındaki blog yazılarıyla Kosinüs Benzerliği{' '}
            <code className="text-xs bg-slate-900 px-2 py-0.5 rounded text-purple-300 font-mono">
              cos(θ) = (A · B) / (||A|| · ||B||)
            </code>{' '}
            formülü ile milisaniyeler içinde skorlanır.
          </p>
        </div>
      </div>

      {/* Control Panel & Search Bar */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5 backdrop-blur-sm">
        {/* Mode Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Arama Modu:</span>
            <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                onClick={() => setSearchMode('SEMANTIC')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  searchMode === 'SEMANTIC'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                Vektör (Anlamsal)
              </button>
              <button
                onClick={() => setSearchMode('HYBRID')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  searchMode === 'HYBRID'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Hibrit (RRF Füzyon)
              </button>
              <button
                onClick={() => setSearchMode('KEYWORD')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  searchMode === 'KEYWORD'
                    ? 'bg-slate-700 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                Klasik (SQL)
              </button>
            </div>
          </div>

          {/* Threshold Slider */}
          <div className="flex items-center gap-3">
            <Sliders className="w-4 h-4 text-slate-400" />
            <label className="text-xs text-slate-400 font-medium">
              Benzerlik Eşiği: <span className="font-mono text-indigo-400 font-bold">{threshold.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="0.40"
              max="0.95"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-28 accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Doğal dilde bir konu arayın... (Örn: 'Mikroservislerde thread performansı ve asenkron işleme')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-12 pr-32 py-4 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 shadow-inner"
          />
          <button
            onClick={() => handleSearch()}
            disabled={isSearching || !query.trim()}
            className="absolute right-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Vektör Ara
          </button>
        </div>

        {/* Preset Prompt Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Örnek Test Sorguları:
          </span>
          {sampleQueries.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(sq);
                handleSearch(sq);
              }}
              className="text-xs px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-all text-left truncate max-w-xs"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Latency & Status Banner */}
      {hasSearched && (
        <div className="flex items-center justify-between text-xs text-slate-400 px-2 font-mono">
          <span>
            Toplam <strong className="text-white">{results.length}</strong> anlamsal eşleşme bulundu.
          </span>
          {latencyMs !== null && (
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sorgu Süresi: {latencyMs} ms (128D Cosine Pipeline)
            </span>
          )}
        </div>
      )}

      {/* Results List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {results.map((res, index) => {
          const scorePercent = (res.similarityScore * 100).toFixed(1);
          return (
            <div
              key={index}
              onClick={() => onSelectBlog(res.blog)}
              className="group p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 space-y-4 relative overflow-hidden"
            >
              {/* Score Header */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {res.searchMode} MATCH
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">Kosinüs Benzerliği:</span>
                  <span className="text-sm font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    %{scorePercent}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, res.similarityScore * 100)}%` }}
                />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                  {res.blog.title}
                </h3>
                <p className="text-xs font-mono text-slate-400 uppercase mt-0.5">{res.blog.header}</p>
                <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {res.blog.content}
                </p>
              </div>

              {/* AI Explanation Pill */}
              {res.explanation && (
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200">
                  <strong className="text-purple-300 font-medium">AI Eşleşme Gerekçesi: </strong>
                  {res.explanation}
                </div>
              )}

              {/* Tags & Click through */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  {res.matchedKeywords?.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      #{kw}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-purple-400 font-medium group-hover:translate-x-1 transition-transform">
                  <span>İncele</span>
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

