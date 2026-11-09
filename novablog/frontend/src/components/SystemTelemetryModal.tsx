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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-zinc-100 shadow-2xl overflow-hidden my-auto animate-in fade-in duration-200">
        {/* Header (Ride Also Spec Sheet) */}
        <div className="p-6 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 dark:bg-zinc-800 border border-black/10 dark:border-white/10 flex items-center justify-center text-[#d4f933] shadow-sm">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-zinc-950 dark:text-white text-base uppercase">
                  SİSTEM TELEMETRİSİ // CANLI MİMARİ
                </h3>
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#d4f933]/20 text-zinc-900 dark:text-[#d4f933] font-bold border border-[#d4f933]/30">
                  {isBackendOnline ? 'ONLINE :5555' : 'DEMO MODU'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                JAVA 22 LOOM &bull; REDIS WRITE-BEHIND &bull; RESILIENCE4J
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Top Architecture Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* JVM Virtual Threads */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.08] dark:border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between font-mono font-semibold">
                <span className="flex items-center gap-1.5 text-zinc-900 dark:text-white">
                  <Cpu className="w-4 h-4 text-[#a3c900] dark:text-[#d4f933]" />
                  Java 22 Virtual Threads
                </span>
                <span className="text-[#a3c900] dark:text-[#d4f933] text-[11px] font-bold">PROJECT LOOM</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans text-xs">
                Platform OS thread havuzu yerine lightweight sanal thread&apos;ler devrede. Her gelen I/O isteği
                carrier thread&apos;i bloke etmeden askıya alınır.
              </p>
              <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-zinc-400">
                <span>Thread-per-request: Aktif</span>
                <span>&bull;</span>
                <span>Throughput: ~10k+ req/s</span>
              </div>
            </div>

            {/* Resilience4j Circuit Breaker */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.08] dark:border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between font-mono font-semibold">
                <span className="flex items-center gap-1.5 text-zinc-900 dark:text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Circuit Breaker
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">CLOSED</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans text-xs">
                Hata oranı %50&apos;yi aştığında devre açılır (OPEN), çağrılar anında fallback yanıtına yönlendirilir.
                Ring buffer boyutu: 10 istek.
              </p>
              <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-zinc-400">
                <span>Hata Oranı: %0.0</span>
                <span>&bull;</span>
                <span>Fallback: Devrede</span>
              </div>
            </div>

            {/* Optimistic Locking */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.08] dark:border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between font-mono font-semibold">
                <span className="flex items-center gap-1.5 text-zinc-900 dark:text-white">
                  <Zap className="w-4 h-4 text-amber-500" />
                  JPA @Version Locking
                </span>
                <span className="text-amber-600 dark:text-amber-400 text-[11px] font-bold">OPTIMISTIC</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans text-xs">
                Eşzamanlı güncelleme yarışlarını (Lost Update) engeller. Eski versiyon ile gelen istekler veritabanı
                kilidi tutulmadan 409 Conflict ile reddedilir.
              </p>
              <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-zinc-400">
                <span>Row Lock: Yok (Lock-free)</span>
                <span>&bull;</span>
                <span>Conflict Map: RFC 7807</span>
              </div>
            </div>

            {/* Multi-Layer Cache */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.08] dark:border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between font-mono font-semibold">
                <span className="flex items-center gap-1.5 text-zinc-900 dark:text-white">
                  <Layers className="w-4 h-4 text-purple-500" />
                  Multi-Layer Cache
                </span>
                <span className="text-purple-600 dark:text-purple-400 text-[11px] font-bold">L1 + L2</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans text-xs">
                L1 Caffeine in-memory önbellek (sıfır ağ gecikmesi) + L2 Redis kümesi. Okuma trafiğinde veritabanı
                yükü %90 oranında bypass edilir.
              </p>
              <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-zinc-400">
                <span>Caffeine TTL: 5 dk</span>
                <span>&bull;</span>
                <span>Redis TTL: 10 dk</span>
              </div>
            </div>
          </div>

          {/* Interactive Redis Write-Behind Section (Ride Also Spec Card) */}
          <div className="p-5 rounded-3xl bg-zinc-100 dark:bg-zinc-900/90 border border-black/10 dark:border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono font-bold text-zinc-950 dark:text-white text-sm">
                  <Database className="w-4 h-4 text-rose-500" />
                  REDIS WRITE-BEHIND BUFFER & BATCH FLUSH
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed max-w-lg font-sans">
                  Kullanıcıların her tıklamasında PostgreSQL&apos;e anlık UPDATE atmak yerine sayaçlar Redis tamponunda
                  atomik INCR komutlarıyla toplanır. Her 30 saniyede bir Scheduled Batch Job bu deltaları topluca
                  veritabanına yazar.
                </p>
              </div>

              <div className="flex flex-col items-end gap-1 font-mono text-[11px]">
                <span className="flex items-center gap-1 text-zinc-500">
                  <Clock className="w-3.5 h-3.5" />
                  Schedule: 30s
                </span>
                <span className="text-[#a3c900] dark:text-[#d4f933] flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Buffer: Canlı
                </span>
              </div>
            </div>

            {/* Flush Feedback Message */}
            {flushMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-mono flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{flushMessage}</span>
              </div>
            )}

            {/* Action Button (Ride Also Pill Button) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-black/[0.08] dark:border-white/[0.08]">
              <span className="text-zinc-500 text-[11px] font-mono">
                Zamanlayıcıyı beklemeden tamponlanmış sayaçları hemen senkronize edin:
              </span>
              <button
                onClick={handleFlush}
                disabled={isFlushing}
                className="px-5 py-2.5 rounded-full bg-[#d4f933] hover:bg-[#c4e82b] disabled:opacity-50 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-[#d4f933]/20 cursor-pointer active:scale-95"
              >
                {isFlushing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    DB&apos;YE YAZILIYOR...
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    ŞİMDİ DB&apos;YE FLUSH ET
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-black/[0.08] dark:border-white/[0.08] bg-zinc-50 dark:bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-500 font-mono">
          <span className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5" />
            CORE V4.1.1 &bull; KONSOL
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-200 transition-all text-xs font-mono font-semibold cursor-pointer"
          >
            KAPAT
          </button>
        </div>
      </div>
    </div>
  );
};
