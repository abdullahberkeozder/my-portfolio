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
  CheckCircle2,
  Clock,
  Layers,
  ArrowDownToLine,
  Server,
  Sparkles,
} from 'lucide-react';

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
  const [isFlushing, setIsFlushing] = useState(false);
  const [flushMessage, setFlushMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFlush = async () => {
    setIsFlushing(true);
    setFlushMessage(null);
    try {
      const msg = await ApiClient.flushMetrics();
      setFlushMessage(msg || 'Tamponlanmış metrikler başarıyla veritabanına aktarıldı.');
      if (onMetricsFlushed) {
        onMetricsFlushed();
      }
    } catch {
      setFlushMessage('Metrik flush işlemi gerçekleştirilemedi.');
    } finally {
      setIsFlushing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl overflow-hidden my-auto animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Sistem Telemetrisi & Canlı Mimari</h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {isBackendOnline ? 'Backend Online (Port 5555)' : 'Canlı Mock & Demo Modu'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Loom Virtual Threads • Redis Write-Behind • Resilience4j
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Top Architecture Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* JVM Virtual Threads */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <Cpu className="w-4 h-4" />
                  Java 22 Virtual Threads
                </span>
                <span className="font-mono text-emerald-400 text-[11px] font-bold">Project Loom</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Platform OS thread havuzu yerine lightweight sanal thread&apos;ler devrede. Her gelen I/O isteği
                carrier thread&apos;i bloke etmeden askıya alınır.
              </p>
              <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-slate-500">
                <span>Thread-per-request: Aktif</span>
                <span>•</span>
                <span>Throughput: ~10k+ req/s</span>
              </div>
            </div>

            {/* Resilience4j Circuit Breaker */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  Resilience4j Circuit Breaker
                </span>
                <span className="font-mono text-emerald-400 text-[11px] font-bold">CLOSED</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Hata oranı %50&apos;yi aştığında devre açılır (OPEN), çağrılar anında fallback yanıtına yönlendirilir.
                Ring buffer boyutu: 10 istek.
              </p>
              <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-slate-500">
                <span>Hata Oranı: %0.0</span>
                <span>•</span>
                <span>Fallback: Aktif</span>
              </div>
            </div>

            {/* Optimistic Locking */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Zap className="w-4 h-4" />
                  JPA @Version Locking
                </span>
                <span className="font-mono text-cyan-400 text-[11px] font-bold">Optimistic</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Eşzamanlı güncelleme yarışlarını (Lost Update) engeller. Eski versiyon ile gelen istekler veritabanı
                kilidi tutulmadan 409 Conflict ile reddedilir.
              </p>
              <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-slate-500">
                <span>Row Lock: Yok (Lock-free)</span>
                <span>•</span>
                <span>Auto-Retry: Devrede</span>
              </div>
            </div>

            {/* Multi-Layer Cache */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5 text-purple-400">
                  <Layers className="w-4 h-4" />
                  Multi-Layer Caching
                </span>
                <span className="font-mono text-purple-400 text-[11px] font-bold">L1 + L2</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                L1 Caffeine in-memory önbellek (sıfır ağ gecikmesi) + L2 Redis kümesi. Okuma trafiğinde veritabanı
                yükü %90 oranında bypass edilir.
              </p>
              <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-slate-500">
                <span>Caffeine TTL: 5 dk</span>
                <span>•</span>
                <span>Redis TTL: 10 dk</span>
              </div>
            </div>
          </div>

          {/* Interactive Redis Write-Behind Section */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/30 via-slate-950 to-slate-950 border border-rose-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <Database className="w-4 h-4 text-rose-400" />
                  Redis Write-Behind Buffer & Scheduled Sync
                </div>
                <p className="text-slate-400 text-xs leading-relaxed max-w-lg">
                  Kullanıcıların her tıklamasında PostgreSQL&apos;e anlık UPDATE atmak yerine sayaçlar Redis tamponunda
                  atomik INCR komutlarıyla toplanır. Her 30 saniyede bir Scheduled Batch Job bu deltaları topluca
                  veritabanına yazar.
                </p>
              </div>

              <div className="flex flex-col items-end gap-1 font-mono text-[11px]">
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Scheduled: Her 30s
                </span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Buffer: Canlı
                </span>
              </div>
            </div>

            {/* Flush Feedback Message */}
            {flushMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{flushMessage}</span>
              </div>
            )}

            {/* Action Button */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-slate-400 text-[11px]">
                Zamanlayıcıyı beklemeden tamponlanmış sayaçları hemen senkronize edin:
              </span>
              <button
                onClick={handleFlush}
                disabled={isFlushing}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-lg shadow-rose-500/20 whitespace-nowrap cursor-pointer"
              >
                {isFlushing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    DB&apos;ye Yazılıyor...
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    Şimdi DB&apos;ye Flush Et
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            NovaBlog Core v2.4.0-SNAPSHOT
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
