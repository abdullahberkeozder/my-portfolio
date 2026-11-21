'use client';

import React, { useState } from 'react';
import { ApiClient } from '@/lib/api';
import {
  X,
  Activity,
  Cpu,
  Database,
  ShieldCheck,
  Zap,
  RefreshCw,
  Clock,
  Layers,
  ArrowDownToLine,
  Server,
  Sparkles,
  Gauge,
  Lock,
} from 'lucide-react';
import { AnalogVuMeter } from './AnalogVuMeter';
import { playKeyClick, playTabSelect } from '@/lib/retroAudio';

interface SystemTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isBackendOnline: boolean | null;
  onMetricsFlushed?: () => void;
}

export const SystemTelemetryModal: React.FC<SystemTelemetryModalProps> = ({
  isOpen,
  onClose,
  isBackendOnline,
  onMetricsFlushed,
}) => {
  const [activeTab, setActiveTab] = useState<'hardware' | 'redis' | 'security'>('hardware');
  const [isFlushing, setIsFlushing] = useState(false);
  const [flushMessage, setFlushMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTabChange = (tab: 'hardware' | 'redis' | 'security') => {
    playTabSelect();
    setActiveTab(tab);
  };

  const handleFlush = async () => {
    playKeyClick('crisp');
    setIsFlushing(true);
    setFlushMessage(null);
    try {
      const msg = await ApiClient.flushMetrics();
      setFlushMessage(msg || 'Buffered metrics successfully flushed to the database.');
      if (onMetricsFlushed) {
        onMetricsFlushed();
      }
    } catch {
      setFlushMessage('Failed to flush metrics to database.');
    } finally {
      setIsFlushing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-xl mac-activity-monitor-chassis text-zinc-900 dark:text-zinc-100 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mac Window Title Bar with Traffic Lights */}
        <div className="h-10 px-4 bg-gradient-to-b from-[#f2f2f2] to-[#d8d8d8] dark:from-[#2c3038] dark:to-[#1e2127] border-b border-[#a8a8a8] dark:border-[#383d47] flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] hover:opacity-80 cursor-pointer"
                title="Close"
              />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]" />
            </div>
            <span className="ml-3 font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              System Profiler &amp; Activity Monitor — Live Telemetry
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                isBackendOnline
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
              }`}
            >
              {isBackendOnline ? 'ONLINE :5555' : 'DEMO MODE'}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mac OS X Segmented Tab Switcher */}
        <div className="px-4 py-2 bg-[#e4e4e4] dark:bg-[#202329] border-b border-[#c0c0c0] dark:border-[#333740] flex items-center justify-between">
          <div className="inline-flex items-center p-0.5 rounded-lg bg-[#cecece] dark:bg-[#16181d] border border-[#b4b4b4] dark:border-[#2b2f38]">
            <button
              onClick={() => handleTabChange('hardware')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'hardware'
                  ? 'bg-white dark:bg-[#3a3f4a] text-zinc-950 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Hardware &amp; Loom</span>
            </button>
            <button
              onClick={() => handleTabChange('redis')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'redis'
                  ? 'bg-white dark:bg-[#3a3f4a] text-zinc-950 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-rose-500" />
              <span>Redis Buffer</span>
            </button>
            <button
              onClick={() => handleTabChange('security')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'security'
                  ? 'bg-white dark:bg-[#3a3f4a] text-zinc-950 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Security &amp; Locking</span>
            </button>
          </div>

          <span className="hidden sm:inline font-mono text-[11px] text-zinc-500">
            JAVA 22 &bull; TOMCAT VIRTUAL &bull; RFC 7807
          </span>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 max-h-[72vh] overflow-y-auto text-xs bg-white dark:bg-[#121417]">
          {/* Top Gauges Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <AnalogVuMeter
              label="Loom Concurrency Saturation"
              sublabel="THREAD CAP"
              value={48}
              displayValue="4,800 / 10,000"
              unit="req/s"
            />
            <AnalogVuMeter
              label="HikariCP Pool Utilization"
              sublabel="JDBC ACTIVE"
              value={32}
              displayValue="8 / 25 Conn"
              unit="%"
            />
          </div>

          {/* Tab 1: Hardware & Concurrency */}
          {activeTab === 'hardware' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* JVM Virtual Threads */}
              <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between font-mono font-semibold">
                  <span className="flex items-center gap-1.5 text-zinc-900 dark:text-white font-bold">
                    <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Java 22 Virtual Threads
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">PROJECT LOOM</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans text-xs">
                  Lightweight virtual threads replace platform OS thread pools. Each incoming I/O request yields without blocking carrier threads.
                </p>
                <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-zinc-500">
                  <span>Thread-per-request: Active</span>
                  <span>&bull;</span>
                  <span>Throughput: ~10k+ req/s</span>
                </div>
              </div>

              {/* Multi-Layer Cache */}
              <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between font-mono font-semibold">
                  <span className="flex items-center gap-1.5 text-zinc-900 dark:text-white font-bold">
                    <Layers className="w-4 h-4 text-purple-500" />
                    Multi-Layer Cache
                  </span>
                  <span className="text-purple-600 dark:text-purple-400 text-[10px] font-bold">L1 + L2</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans text-xs">
                  L1 Caffeine in-memory cache (zero network latency) + L2 Redis cluster. Database load is bypassed by 90% across read workloads.
                </p>
                <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-zinc-500">
                  <span>Caffeine TTL: 5 min</span>
                  <span>&bull;</span>
                  <span>Redis TTL: 10 min</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Redis Write-Behind */}
          {activeTab === 'redis' && (
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono font-bold text-zinc-950 dark:text-white text-sm">
                    <Database className="w-4 h-4 text-rose-500" />
                    REDIS WRITE-BEHIND BUFFER &amp; BATCH FLUSH
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed max-w-lg font-sans">
                    Instead of issuing instant PostgreSQL UPDATE queries on every click, counters coalesce in a Redis Hash via atomic HINCRBY commands. A scheduled batch job flushes deltas to disk every 30 seconds.
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1 font-mono text-[11px]">
                  <span className="flex items-center gap-1 text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                    Timer: 30s
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Buffer: Live
                  </span>
                </div>
              </div>

              {/* Flush Feedback Message */}
              {flushMessage && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{flushMessage}</span>
                </div>
              )}

              {/* Action Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500 text-[11px] font-mono">
                  Flush buffered counters to the database without waiting for the timer:
                </span>
                <button
                  onClick={handleFlush}
                  disabled={isFlushing}
                  className="ios6-btn ios6-btn-blue px-4 py-2 text-xs"
                >
                  {isFlushing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>FLUSHING TO DB...</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                      <span>FLUSH TO DB NOW</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Security & Locking */}
          {activeTab === 'security' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Resilience4j Circuit Breaker */}
              <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between font-mono font-semibold">
                  <span className="flex items-center gap-1.5 text-zinc-900 dark:text-white font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Circuit Breaker
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">CLOSED</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans text-xs">
                  Circuit trips OPEN when the failure rate exceeds 50%, immediately routing requests to resilient fallback responses.
                </p>
                <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-zinc-500">
                  <span>Failure Rate: 0.0%</span>
                  <span>&bull;</span>
                  <span>Fallback: Armed</span>
                </div>
              </div>

              {/* Optimistic Locking */}
              <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between font-mono font-semibold">
                  <span className="flex items-center gap-1.5 text-zinc-900 dark:text-white font-bold">
                    <Zap className="w-4 h-4 text-amber-500" />
                    JPA @Version Locking
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 text-[10px] font-bold">OPTIMISTIC</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans text-xs">
                  Prevents concurrent lost updates lock-free. Stale mutation requests without locks receive RFC 7807 409 Conflict Problem Details.
                </p>
                <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-zinc-500">
                  <span>Row Lock: None (Lock-free)</span>
                  <span>&bull;</span>
                  <span>RFC 7807 Problem Details</span>
                </div>
              </div>

              {/* Token Bucket Rate Limiter */}
              <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between font-mono font-semibold">
                  <span className="flex items-center gap-1.5 text-zinc-900 dark:text-white font-bold">
                    <Gauge className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Token Bucket Rate Limiter
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">BURSTABLE</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans text-xs">
                  Continuous replenishment with nanosecond precision. Category-based DoS protection (General: 100/min, Auth: 10/min).
                </p>
                <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-zinc-500">
                  <span>Limit: 100 req/min</span>
                  <span>&bull;</span>
                  <span>HTTP 429 Too Many Requests</span>
                </div>
              </div>

              {/* Distributed Request Idempotency */}
              <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between font-mono font-semibold">
                  <span className="flex items-center gap-1.5 text-zinc-900 dark:text-white font-bold">
                    <Lock className="w-4 h-4 text-cyan-500" />
                    Idempotency Filter
                  </span>
                  <span className="text-cyan-600 dark:text-cyan-400 text-[10px] font-bold">SETNX LOCK</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans text-xs">
                  Acquires a 120s distributed lock for mutation requests via X-Idempotency-Key, replaying cached responses on duplicate calls.
                </p>
                <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-zinc-500">
                  <span>Lock TTL: 120s</span>
                  <span>&bull;</span>
                  <span>Cache TTL: 24h</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#c0c0c0] dark:border-[#2f343e] bg-[#f0f0f0] dark:bg-[#181a1f] flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 font-mono select-none">
          <span className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-zinc-500" />
            NOVA CORE 2026 &bull; TELEMETRY ENGINE V4
          </span>
          <button
            onClick={onClose}
            className="ios6-btn ios6-btn-silver px-4 py-1 text-xs"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
