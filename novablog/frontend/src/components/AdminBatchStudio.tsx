'use client';

import React, { useState } from 'react';
import { ApiClient } from '@/lib/api';
import { JobExecutionResponseDto } from '@/types/api';
import { useDeletedBlogsQuery, useRestoreBlogMutation } from '@/hooks/useBlogs';
import {
  RefreshCw,
  Trash2,
  BarChart3,
  Loader2,
  Archive,
  Undo2,
  CheckCircle2,
  Server,
} from 'lucide-react';
import { playKeyClick } from '@/lib/retroAudio';

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
    playKeyClick('crisp');
    setIsLoadingCleanup(true);
    try {
      const res = await ApiClient.triggerCleanupJob(30);
      setCleanupResult(res);
      await refetchDeleted();
    } catch {
      // ignore
    } finally {
      setIsLoadingCleanup(false);
    }
  };

  const handleRunAnalytics = async () => {
    playKeyClick('crisp');
    setIsLoadingAnalytics(true);
    try {
      const res = await ApiClient.triggerAnalyticsJob();
      setAnalyticsResult(res);
    } catch {
      // ignore
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleReindex = async () => {
    playKeyClick('crisp');
    setIsLoadingReindex(true);
    try {
      const msg = await ApiClient.reindexEmbeddings();
      setReindexMsg(msg);
    } catch {
      // ignore
    } finally {
      setIsLoadingReindex(false);
    }
  };

  const handleRestore = async (id: number) => {
    playKeyClick('crisp');
    await restoreBlogMutation.mutateAsync(id);
    await refetchDeleted();
  };

  return (
    <div id="batch-etl-studio" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 select-none">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-300 dark:border-zinc-800">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase font-bold text-amber-600 dark:text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
            <span>ARCHITECTURE MODULE 04 // MAC OS X SERVER BATCH &amp; ETL ENGINE</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-3">
            <span>SPRING BATCH 5 &amp; ENTERPRISE DATA WAREHOUSE CONSOLE</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl font-sans leading-relaxed">
            Manage large-scale data retention (chunk-based soft-delete cleanup), author interaction analytics reporting jobs,
            and Spring AI semantic vector database reindexing pipelines with enterprise stability.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 shrink-0">
          <span className="mac-hardware-chip-badge">CHUNK: 50 ITEMS</span>
          <span className="mac-hardware-chip-badge">3 RETRY TOLERANCE</span>
          <span className="mac-hardware-chip-badge">ISOLATED TX</span>
        </div>
      </div>

      {/* Mac OS X Server Xserve Chassis */}
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
              <Server className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Mac OS X Server — Spring Batch 5 Job Scheduler &amp; ETL Manager
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              JOB REPO: POSTGRESQL METADATA
            </span>
            <span>&bull;</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">READY</span>
          </div>
        </div>

        {/* 3 Modular Xserve Blade Job Cards */}
        <div className="p-5 sm:p-6 bg-[#ebebeb] dark:bg-[#1a1d22] border-b border-[#cccccc] dark:border-[#2f343e] grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Job 1: Soft-Delete Cleanup */}
          <div className="rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 space-y-3 bg-white dark:bg-[#15171c] flex flex-col justify-between shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-900 dark:text-white uppercase">
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  CLEANUP (SOFT-DELETE)
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  CHUNK: 50
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                Permanently purges deleted articles older than 30 days in 50-item batches within isolated transactions.
              </p>
            </div>

            {cleanupResult && (
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-700 dark:text-emerald-300">
                Status: {cleanupResult.status} &bull; Processed: {cleanupResult.exitCode || 'COMPLETED'}
              </div>
            )}

            <button
              type="button"
              disabled={isLoadingCleanup}
              onClick={handleRunCleanup}
              className="ios6-btn ios6-btn-silver w-full py-2 text-xs font-bold"
            >
              {isLoadingCleanup ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>PROCESSING...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>RUN CLEANUP JOB</span>
                </>
              )}
            </button>
          </div>

          {/* Job 2: Author Analytics */}
          <div className="rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 space-y-3 bg-white dark:bg-[#15171c] flex flex-col justify-between shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-900 dark:text-white uppercase">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  ANALYTICS (INTERACTIONS)
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  BATCH ETL
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                Periodically aggregates author performance, view counts, and clap metrics into analytics reporting tables.
              </p>
            </div>

            {analyticsResult && (
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-700 dark:text-emerald-300">
                Status: {analyticsResult.status} &bull; Processed: {analyticsResult.exitCode || 'COMPLETED'}
              </div>
            )}

            <button
              type="button"
              disabled={isLoadingAnalytics}
              onClick={handleRunAnalytics}
              className="ios6-btn ios6-btn-blue w-full py-2 text-xs font-bold"
            >
              {isLoadingAnalytics ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>COMPUTING...</span>
                </>
              ) : (
                <>
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>RUN ANALYTICS JOB</span>
                </>
              )}
            </button>
          </div>

          {/* Job 3: Vector Reindex */}
          <div className="rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 space-y-3 bg-white dark:bg-[#15171c] flex flex-col justify-between shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-900 dark:text-white uppercase">
                  <RefreshCw className="w-4 h-4 text-emerald-500" />
                  VECTOR RE-INDEX
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  SPRING AI
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                Re-generates 128-dimensional embedding vectors for all database articles into the pgvector HNSW index.
              </p>
            </div>

            {reindexMsg && (
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-700 dark:text-emerald-300">
                {reindexMsg}
              </div>
            )}

            <button
              type="button"
              disabled={isLoadingReindex}
              onClick={handleReindex}
              className="ios6-btn ios6-btn-silver w-full py-2 text-xs font-bold"
            >
              {isLoadingReindex ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>INDEXING...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>REFRESH ALL VECTORS</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Soft-Deleted Articles Mac Aqua Table */}
        <div className="p-5 sm:p-6 bg-white dark:bg-[#121417] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-zinc-500" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white font-mono uppercase">
                SOFT-DELETE ARCHIVE &bull; RECOVERABLE ARTICLES ({deletedBlogs.length})
              </h3>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              RETENTION: 30 DAYS &bull; SAFE RESTORATION
            </span>
          </div>

          {isLoadingDeleted ? (
            <div className="py-8 text-center text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500" />
              <p className="text-xs font-mono mt-2">Scanning archive...</p>
            </div>
          ) : deletedBlogs.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs font-mono">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
              <span>Soft-Delete archive is empty. No deleted articles found.</span>
            </div>
          ) : (
            <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <table className="mac-aqua-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>ID</th>
                    <th>TITLE &amp; SCOPE</th>
                    <th>AUTHOR</th>
                    <th>DELETION DATE</th>
                    <th style={{ width: '120px' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedBlogs.map((b) => (
                    <tr key={b.blogId}>
                      <td className="font-mono text-zinc-500 font-bold">{b.blogId}</td>
                      <td>
                        <div className="font-bold text-zinc-900 dark:text-white">{b.title}</div>
                        <div className="text-[10px] text-zinc-500">{b.header}</div>
                      </td>
                      <td className="font-mono">{b.author || 'Engineer'}</td>
                      <td className="font-mono text-zinc-500 text-[10px]">
                        {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString('en-US') : '-'}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleRestore(b.blogId || b.id || 0)}
                          className="ios6-btn ios6-btn-silver px-2.5 py-1 text-[11px] font-bold flex items-center gap-1"
                        >
                          <Undo2 className="w-3 h-3 text-emerald-600" />
                          <span>Restore</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-8 px-4 bg-[#e8e8e8] dark:bg-[#1a1c22] border-t border-[#c0c0c0] dark:border-[#2c3038] flex items-center justify-between text-[10px] font-mono text-zinc-500 select-none">
          <span>SPRING BATCH 5 &bull; CHUNK COMMIT (50 ITEMS / TX)</span>
          <span>FAULT-TOLERANT RETRY LIMIT: 3 &bull; POSTGRESQL METADATA</span>
        </div>
      </div>
    </div>
  );
};
