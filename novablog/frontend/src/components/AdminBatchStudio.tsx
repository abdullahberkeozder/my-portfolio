'use client';

import React, { useState } from 'react';
import { ApiClient } from '@/lib/api';
import { JobExecutionResponseDto } from '@/types/api';
import { useDeletedBlogsQuery, useRestoreBlogMutation } from '@/hooks/useBlogs';
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
  Archive,
  Undo2,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const AdminBatchStudio: React.FC = () => {
  const [cleanupResult, setCleanupResult] = useState<JobExecutionResponseDto | null>(null);
  const [analyticsResult, setAnalyticsResult] = useState<JobExecutionResponseDto | null>(null);
  const [reindexMsg, setReindexMsg] = useState<string | null>(null);

  const [isLoadingCleanup, setIsLoadingCleanup] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isLoadingReindex, setIsLoadingReindex] = useState(false);

  const { data: deletedBlogs = [], isLoading: isLoadingDeleted, refetch: refetchDeleted } = useDeletedBlogsQuery();
  const restoreBlogMutation = useRestoreBlogMutation();

  const handleRunCleanup = async () => {
    setIsLoadingCleanup(true);
    try {
      const res = await ApiClient.triggerCleanupJob(30);
      setCleanupResult(res);
      await refetchDeleted();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner - Ride Also Industrial Spec Sheet */}
      <div className="relative rounded-3xl p-8 sm:p-10 bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-tech-grid opacity-30 dark:opacity-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-xs font-mono font-bold uppercase text-[#a3c900] dark:text-[#d4f933]">
              <span className="w-2 h-2 rounded-full bg-[#d4f933] shadow-[0_0_8px_#d4f933]" />
              <span>04 {'//'} ENTERPRISE BATCH & ETL CONSOLE</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-zinc-950 dark:text-white uppercase tracking-tight">
              SPRING BATCH 5 & SİSTEM KONSOLU
            </h2>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-mono leading-relaxed">
              Büyük ölçekli veri temizliği (Chunk-based Soft-Delete Cleanup), yazar etkileşim analitiği raporlama işleri
              ve Spring AI 128D vektör veritabanı indeksleme boru hatlarını donanım kararlılığında yönetin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.08] dark:border-white/[0.08] text-center min-w-[110px]">
              <div className="text-[10px] text-zinc-400 uppercase">CHUNK SIZE</div>
              <div className="text-sm font-bold text-zinc-950 dark:text-white mt-0.5">50 ITEMS</div>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.08] dark:border-white/[0.08] text-center min-w-[110px]">
              <div className="text-[10px] text-zinc-400 uppercase">TRANSACTION</div>
              <div className="text-sm font-bold text-zinc-950 dark:text-[#d4f933] mt-0.5">ISOLATED</div>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.08] dark:border-white/[0.08] text-center min-w-[110px]">
              <div className="text-[10px] text-zinc-400 uppercase">BATCH META</div>
              <div className="text-sm font-bold text-emerald-500 mt-0.5">POSTGRES</div>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture System Metrics Grid (4 Hardware Tiles) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-1.5 uppercase font-bold text-[10px]">
              <Database className="w-3.5 h-3.5 text-[#a3c900] dark:text-[#d4f933]" />
              POSTGRESQL 16
            </span>
            <span className="text-emerald-500 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              ONLINE
            </span>
          </div>
          <div className="text-lg font-black text-zinc-950 dark:text-white">HIKARICP 10/10</div>
          <p className="text-[10px] text-zinc-500">Flyway V7 Migration Aktif</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-1.5 uppercase font-bold text-[10px]">
              <Activity className="w-3.5 h-3.5 text-[#a3c900] dark:text-[#d4f933]" />
              REDIS L2 CACHE
            </span>
            <span className="text-[#a3c900] dark:text-[#d4f933] font-bold text-[10px] bg-[#d4f933]/10 px-2 py-0.5 rounded-full border border-[#d4f933]/20">
              %94 HIT
            </span>
          </div>
          <div className="text-lg font-black text-zinc-950 dark:text-white">CAFFEINE + REDIS</div>
          <p className="text-[10px] text-zinc-500">TTL: 10 Dk / Multi-Layer</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-1.5 uppercase font-bold text-[10px]">
              <HardDrive className="w-3.5 h-3.5 text-[#a3c900] dark:text-[#d4f933]" />
              MINIO S3 VAULT
            </span>
            <span className="text-emerald-500 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              READY
            </span>
          </div>
          <div className="text-lg font-black text-zinc-950 dark:text-white">AWS S3 PROTOCOL</div>
          <p className="text-[10px] text-zinc-500">Presigned Media Storage</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-1.5 uppercase font-bold text-[10px]">
              <Radio className="w-3.5 h-3.5 text-[#a3c900] dark:text-[#d4f933]" />
              STOMP WEBSOCKET
            </span>
            <span className="text-emerald-500 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              LIVE BUS
            </span>
          </div>
          <div className="text-lg font-black text-zinc-950 dark:text-white">/WS ENDPOINT</div>
          <p className="text-[10px] text-zinc-500">/topic/blogs & comments</p>
        </div>
      </div>

      {/* Batch Job Operations Grid (3 Modular Hardware Units) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Vector Reindex */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-black/10 dark:border-white/10">
                MODULE {'//'} 01
              </span>
              <span className="text-zinc-400 font-mono text-[10px]">EMBEDDINGS</span>
            </div>

            <h3 className="text-xl font-black text-zinc-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#a3c900] dark:text-[#d4f933]" />
              VEKTÖR İNDEKSLEME
            </h3>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-mono">
              Veritabanındaki tüm blog yazılarını 128 boyutlu gömmelerle baştan hesaplar ve pgvector anlamsal indeksini tazeler.
            </p>
          </div>

          <div className="space-y-3 font-mono">
            {reindexMsg && (
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.08] dark:border-white/[0.08] text-xs text-zinc-900 dark:text-[#d4f933]">
                {reindexMsg}
              </div>
            )}

            <button
              onClick={handleReindex}
              disabled={isLoadingReindex}
              className="w-full py-3 px-5 rounded-full bg-zinc-950 dark:bg-[#d4f933] hover:opacity-90 disabled:opacity-50 text-white dark:text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-md"
            >
              {isLoadingReindex ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span>İNDEKSLERİ YENİLE</span>
            </button>
          </div>
        </div>

        {/* Card 2: Soft Delete Cleanup Job */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-black/10 dark:border-white/10">
                MODULE {'//'} 02
              </span>
              <span className="text-zinc-400 font-mono text-[10px]">MAINTENANCE</span>
            </div>

            <h3 className="text-xl font-black text-zinc-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-500" />
              CLEANUP JOB
            </h3>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-mono">
              30 günden eski soft-deleted (silinmiş olarak işaretlenmiş) blog kayıtlarını 50&apos;şerli chunk bloklarında güvenli biçimde kalıcı siler.
            </p>
          </div>

          <div className="space-y-3 font-mono">
            {cleanupResult && (
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.08] dark:border-white/[0.08] text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-400">JOB_ID: #{cleanupResult.jobExecutionId}</span>
                  <span className="text-emerald-500 font-bold">{cleanupResult.status}</span>
                </div>
                <div className="text-zinc-600 dark:text-zinc-300 text-[11px] truncate">
                  {cleanupResult.stepSummaries?.[0]}
                </div>
              </div>
            )}

            <button
              onClick={handleRunCleanup}
              disabled={isLoadingCleanup}
              className="w-full py-3 px-5 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-50 text-zinc-900 dark:text-white border border-black/10 dark:border-white/10 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-sm"
            >
              {isLoadingCleanup ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              <span>TEMİZLEME JOB&apos;I ÇALIŞTIR</span>
            </button>
          </div>
        </div>

        {/* Card 3: Author Analytics Job */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-black/10 dark:border-white/10">
                MODULE {'//'} 03
              </span>
              <span className="text-zinc-400 font-mono text-[10px]">ANALYTICS</span>
            </div>

            <h3 className="text-xl font-black text-zinc-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#a3c900] dark:text-[#d4f933]" />
              ANALYTICS JOB
            </h3>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-mono">
              Yazarların makale görüntülenme, beğeni ve yorum etkileşim sayaçlarını toplu olarak işler, analitik özet tablosuna basar.
            </p>
          </div>

          <div className="space-y-3 font-mono">
            {analyticsResult && (
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.08] dark:border-white/[0.08] text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-400">JOB_ID: #{analyticsResult.jobExecutionId}</span>
                  <span className="text-emerald-500 font-bold">{analyticsResult.status}</span>
                </div>
                <div className="text-zinc-600 dark:text-zinc-300 text-[11px] truncate">
                  {analyticsResult.stepSummaries?.[0]}
                </div>
              </div>
            )}

            <button
              onClick={handleRunAnalytics}
              disabled={isLoadingAnalytics}
              className="w-full py-3 px-5 rounded-full bg-zinc-950 dark:bg-[#d4f933] hover:opacity-90 disabled:opacity-50 text-white dark:text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-md"
            >
              {isLoadingAnalytics ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
              <span>ANALİTİK JOB&apos;I ÇALIŞTIR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Module 04: Blog Lifecycle & Soft-Deleted Retention Console (State Machine #1) */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.08] dark:border-white/[0.08]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-600 dark:text-amber-400">
              <Archive className="w-4 h-4" />
              <span>MODULE {'//'} 04 &middot; YAŞAM DÖNGÜSÜ &amp; SAKLAMA PENCERESİ</span>
            </div>
            <h3 className="text-2xl font-black text-zinc-950 dark:text-white uppercase tracking-tight">
              SOFT-DELETED BLOG ARŞİVİ ({deletedBlogs.length})
            </h3>
            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
              Silinmiş makaleler 30 günlük yasal saklama süresi boyunca burada tutulur; admin tarafından geri yüklenebilir veya Spring Batch Cleanup Job tarafından kalıcı silinir.
            </p>
          </div>

          <button
            onClick={() => refetchDeleted()}
            disabled={isLoadingDeleted}
            className="self-start sm:self-auto px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-xs font-mono font-bold text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer flex items-center gap-2"
          >
            {isLoadingDeleted ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>LİSTEYİ TAZELER</span>
          </button>
        </div>

        {/* Deleted Blogs List */}
        {isLoadingDeleted ? (
          <div className="flex items-center justify-center py-12 gap-3 font-mono text-xs text-zinc-500">
            <Loader2 className="w-5 h-5 animate-spin text-[#d4f933]" />
            <span>Arşiv kayıtları sorgulanıyor...</span>
          </div>
        ) : deletedBlogs.length === 0 ? (
          <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-dashed border-black/15 dark:border-white/15 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Arşiv Temiz &middot; Bekleyen Silinmiş Makale Yok</p>
            <p className="text-xs font-mono text-zinc-500">Tüm blog yazıları aktif yayında veya saklama süresi dolup chunk cleanup tarafından temizlenmiştir.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deletedBlogs.map((b) => {
              const bId = b.id ?? b.blogId;
              const isPurgeEligible = b.lifecycleStatus === 'PURGE_ELIGIBLE';
              return (
                <div
                  key={bId}
                  className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-black/[0.08] dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs transition-all hover:border-black/20 dark:hover:border-white/20"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {b.category?.categoryName || 'GENEL'}
                      </span>
                      {isPurgeEligible ? (
                        <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" /> PURGE_ELIGIBLE (&gt;30 GÜN)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> SOFT_DELETED (SAKLAMADA)
                        </span>
                      )}
                      <span className="text-zinc-400 text-[11px]">
                        ID: #{bId} &middot; v{b.version ?? 0}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-zinc-900 dark:text-white truncate">
                      {b.title || b.header}
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                      {b.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => bId && restoreBlogMutation.mutate(bId)}
                      disabled={restoreBlogMutation.isPending}
                      className="px-4 py-2 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {restoreBlogMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Undo2 className="w-3.5 h-3.5" />
                      )}
                      <span>GERİ YÜKLE (RESTORE)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
