'use client';

import React, { useState } from 'react';
import { ApiClient } from '@/lib/api';
import { JobExecutionResponseDto } from '@/types/api';
import {
  Database,
  RefreshCw,
  Cpu,
  Trash2,
  BarChart3,
  Loader2,
  Activity,
  Layers,
  HardDrive,
  Radio,
} from 'lucide-react';

export const AdminBatchStudio: React.FC = () => {
  const [cleanupResult, setCleanupResult] = useState<JobExecutionResponseDto | null>(null);
  const [analyticsResult, setAnalyticsResult] = useState<JobExecutionResponseDto | null>(null);
  const [reindexMsg, setReindexMsg] = useState<string | null>(null);

  const [isLoadingCleanup, setIsLoadingCleanup] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isLoadingReindex, setIsLoadingReindex] = useState(false);

  const handleRunCleanup = async () => {
    setIsLoadingCleanup(true);
    try {
      const res = await ApiClient.triggerCleanupJob(30);
      setCleanupResult(res);
    } catch {
      alert('Cleanup job tetiklenemedi.');
    } finally {
      setIsLoadingCleanup(false);
    }
  };

  const handleRunAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const res = await ApiClient.triggerAnalyticsJob();
      setAnalyticsResult(res);
    } catch {
      alert('Analytics job tetiklenemedi.');
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleReindex = async () => {
    setIsLoadingReindex(true);
    try {
      const msg = await ApiClient.reindexEmbeddings();
      setReindexMsg(msg);
    } catch {
      alert('Vektör indeksleme başlatılamadı.');
    } finally {
      setIsLoadingReindex(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="rounded-3xl p-8 bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono mb-4">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            Spring Batch 5 & Enterprise Architecture Studio
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Batch ETL & Sistem Konsolu
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Büyük ölçekli veri temizliği (Chunk-based Soft-Delete Cleanup), yazar etkileşim analitiği raporlama işleri
            ve Spring AI 128D vektör veritabanı indeksleme operasyonlarını doğrudan yönetin.
          </p>
        </div>
      </div>

      {/* Architecture System Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              PostgreSQL
            </span>
            <span className="text-emerald-400 font-mono text-[11px] font-bold">ONLINE</span>
          </div>
          <div className="text-xl font-bold text-white">HikariCP 10/10</div>
          <p className="text-[11px] text-slate-400">Flyway V7 Migration Aktif</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              Redis L2 Cache
            </span>
            <span className="text-emerald-400 font-mono text-[11px] font-bold">%94 Hit</span>
          </div>
          <div className="text-xl font-bold text-white">Caffeine + Redis</div>
          <p className="text-[11px] text-slate-400">TTL: 10 Dk / Multi-Layer</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              MinIO S3
            </span>
            <span className="text-emerald-400 font-mono text-[11px] font-bold">READY</span>
          </div>
          <div className="text-xl font-bold text-white">AWS S3 API</div>
          <p className="text-[11px] text-slate-400">Presigned Media Storage</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              STOMP WebSocket
            </span>
            <span className="text-emerald-400 font-mono text-[11px] font-bold">LIVE</span>
          </div>
          <div className="text-xl font-bold text-white">/ws Endpoint</div>
          <p className="text-[11px] text-slate-400">/topic/blogs & comments</p>
        </div>
      </div>

      {/* Batch Job Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Vector Reindex */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
              <Cpu className="w-5 h-5" />
              Spring AI Vektör İndeksleme
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Veritabanındaki tüm blog yazılarını 128 boyutlu gömmelerle yeniden hesaplayıp vektör indeksine yazar.
            </p>
          </div>

          <div className="space-y-3">
            {reindexMsg && (
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 font-mono">
                {reindexMsg}
              </div>
            )}
            <button
              onClick={handleReindex}
              disabled={isLoadingReindex}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-500/20"
            >
              {isLoadingReindex ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Vektörleri Baştan İndeksle
            </button>
          </div>
        </div>

        {/* Card 2: Soft Delete Cleanup Job */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
              <Trash2 className="w-5 h-5" />
              Spring Batch: Cleanup Job
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              30 günden eski soft-deleted (silinmiş olarak işaretlenmiş) blog kayıtlarını chunk mantığı ile kalıcı siler.
            </p>
          </div>

          <div className="space-y-3">
            {cleanupResult && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span>Job ID: #{cleanupResult.jobExecutionId}</span>
                  <span className="text-emerald-400 font-bold">{cleanupResult.status}</span>
                </div>
                <div className="text-slate-400">{cleanupResult.stepSummaries?.[0]}</div>
              </div>
            )}
            <button
              onClick={handleRunCleanup}
              disabled={isLoadingCleanup}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
            >
              {isLoadingCleanup ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              Temizleme Job&apos;ını Başlat
            </button>
          </div>
        </div>

        {/* Card 3: Author Analytics Job */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
              <BarChart3 className="w-5 h-5" />
              Spring Batch: Analytics Job
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Yazarların makale görüntülenme, beğeni ve yorum etkileşim skorlarını toplu olarak işler ve raporlar.
            </p>
          </div>

          <div className="space-y-3">
            {analyticsResult && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span>Job ID: #{analyticsResult.jobExecutionId}</span>
                  <span className="text-emerald-400 font-bold">{analyticsResult.status}</span>
                </div>
                <div className="text-slate-400">{analyticsResult.stepSummaries?.[0]}</div>
              </div>
            )}
            <button
              onClick={handleRunAnalytics}
              disabled={isLoadingAnalytics}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20"
            >
              {isLoadingAnalytics ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
              Analitik Rapor Job&apos;ını Çalıştır
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

