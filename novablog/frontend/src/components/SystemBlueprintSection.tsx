'use client';

import React, { useState } from 'react';
import {
  Cpu,
  Database,
  ShieldCheck,
  Check,
  Copy,
  Terminal,
  Zap,
} from 'lucide-react';

interface BlueprintCategory {
  index: string;
  title: string;
  tag: string;
  icon: React.ElementType;
  specs: { key: string; value: string; desc: string }[];
}

const BLUEPRINT_DATA: BlueprintCategory[] = [
  {
    index: '01',
    title: 'ÇEKİRDEK & EŞZAMANLILIK (CORE RUNTIME)',
    tag: 'PROJECT LOOM',
    icon: Zap,
    specs: [
      {
        key: 'JVM RUNTIME',
        value: 'OpenJDK 22.0.2 (64-Bit)',
        desc: 'Java 22 LTS donanım tabanlı M:N sanal iş parçacığı yönetimi',
      },
      {
        key: 'CONCURRENCY MODEL',
        value: 'Virtual Threads (Loom)',
        desc: 'Lightweight sanal iş parçacıkları; OS thread bloklaması sıfır',
      },
      {
        key: 'IOPS THROUGHPUT',
        value: '11,400+ Req/s Sustained',
        desc: 'Tomcat 10.1 sanal iş parçacığı havuzuyla thread-per-request',
      },
      {
        key: 'CARRIER PINNING',
        value: 'Zero Synchronized Blocking',
        desc: 'ReentrantLock ve Lock-Free yapılarıyla taşıyıcı thread korunur',
      },
      {
        key: 'CONTAINER EXECUTOR',
        value: 'Embedded Tomcat 10.1',
        desc: 'Virtual thread per-task executor ile tam asenkron HTTP I/O',
      },
    ],
  },
  {
    index: '02',
    title: 'BİLİŞSEL VEKTÖR MOTORU (AI & COGNITIVE RETRIEVAL)',
    tag: 'SPRING AI 128D',
    icon: Cpu,
    specs: [
      {
        key: 'EMBEDDING DIMENSION',
        value: '128-Dimensional Dense',
        desc: 'Yüksek yoğunluklu normalize latent uzay vektör gömmeleri',
      },
      {
        key: 'SIMILARITY METRIC',
        value: 'Cosine Distance cos(θ)',
        desc: 'Çok boyutlu kosinüs açısı: cos(θ) = (A · B) / (||A|| · ||B||)',
      },
      {
        key: 'INDEX TOPOLOGY',
        value: 'pgvector HNSW Graph',
        desc: 'Hierarchical Navigable Small World ile logaritmik arama',
      },
      {
        key: 'HYBRID FUSION',
        value: 'RRF (Reciprocal Rank)',
        desc: 'Sözcüksel SQL LIKE ve vektörel kosinüs skorlarının birleşimi',
      },
      {
        key: 'QUERY LATENCY',
        value: '< 1.8ms P99 Latency',
        desc: 'Milisaniyeler içinde semantik alaka düzeyi hesaplama',
      },
    ],
  },
  {
    index: '03',
    title: 'VERİ, ÖNBELLEK & WRITE-BEHIND (DATA & STORAGE MATRIX)',
    tag: 'DUAL-TIER CACHE',
    icon: Database,
    specs: [
      {
        key: 'PRIMARY DATABASE',
        value: 'PostgreSQL 16.2',
        desc: 'Flyway V7 otomatik versiyonlanmış DDL ve şema geçişleri',
      },
      {
        key: 'CONNECTION POOL',
        value: 'HikariCP (10/10 Pool)',
        desc: '10 maksimum, 10 minimum boşta bağlantı; sıfır connection leak',
      },
      {
        key: 'L1 IN-MEMORY CACHE',
        value: 'Caffeine Cache (Local)',
        desc: 'Sıfır ağ gecikmeli yerel L1 önbellek; 5 dakika TTL',
      },
      {
        key: 'L2 DISTRIBUTED CACHE',
        value: 'Redis 7.2 Alpine',
        desc: 'Dağıtık oturum ve çok katmanlı sorgu önbelleği; 10 dakika TTL',
      },
      {
        key: 'WRITE-BEHIND BUFFER',
        value: 'Redis Hash HINCRBY',
        desc: 'Görüntülenme ve beğeni sayaçları O(1); 30s Scheduled DB Flush',
      },
      {
        key: 'OBJECT STORAGE',
        value: 'MinIO S3 Presigned URLs',
        desc: 'Doğrudan istemciye imzalanmış güvenli medya yükleme protokolü',
      },
    ],
  },
  {
    index: '04',
    title: 'DAYANIKLILIK, BATCH & GÜVENLİK (RESILIENCE & INTEGRITY)',
    tag: 'ENTERPRISE ARMOR',
    icon: ShieldCheck,
    specs: [
      {
        key: 'CONCURRENCY LOCKING',
        value: 'JPA @Version Optimistic',
        desc: 'Satır kilidi tutulmaz (Lock-Free); kayıp güncellemeler önlenir',
      },
      {
        key: 'CONFLICT STANDARD',
        value: 'RFC 7807 Problem Details',
        desc: 'HTTP 409 Conflict durumunda otomatik istemci geri alması',
      },
      {
        key: 'CIRCUIT BREAKER',
        value: 'Resilience4j (Sliding: 10)',
        desc: '%50 hata oranında OPEN devre; otomatik fallback devrede',
      },
      {
        key: 'IDEMPOTENCY ARMOR',
        value: 'X-Idempotency-Key',
        desc: '120 saniye mutasyon kilidi, 24 saat sonuç önbellekleme',
      },
      {
        key: 'RATE LIMITER',
        value: 'Token Bucket (100 req/min)',
        desc: 'İstemci IP başına kayan pencereli atomik istek regülatörü',
      },
      {
        key: 'BATCH ETL PIPELINE',
        value: 'Spring Batch 5 (Chunk: 50)',
        desc: 'İzole transaction commit ile 30 günlük soft-delete temizliği',
      },
    ],
  },
];

export const SystemBlueprintSection: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<string>('all');

  const handleCopySpecManifest = () => {
    if (typeof window !== 'undefined') {
      const manifest = JSON.stringify(BLUEPRINT_DATA, null, 2);
      navigator.clipboard.writeText(manifest);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredData =
    activeCategoryIndex === 'all'
      ? BLUEPRINT_DATA
      : BLUEPRINT_DATA.filter((b) => b.index === activeCategoryIndex);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10 border-t border-black/[0.08] dark:border-white/[0.08]">
      {/* Header (Ride Also Technical Spec Bar) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase font-bold text-[#a3c900] dark:text-[#d4f933]">
            <span className="w-2 h-2 rounded-full bg-[#d4f933] shadow-[0_0_8px_#d4f933]" />
            <span>03 {'//'} TECHNICAL SPECIFICATIONS & SYSTEM BLUEPRINT</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-zinc-950 dark:text-white uppercase tracking-tight">
            MİMARİ ŞARTNAME {'//'} BLUEPRINT
          </h2>

          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl font-mono leading-relaxed">
            Ride Also donanım şartnamesinden esinlenen tam teknik matris. Dağıtık mikroservis çekirdekleri,
            eşzamanlılık parametreleri, bellek kapasiteleri ve kurumsal dayanıklılık standartları.
          </p>
        </div>

        {/* Action Button: Copy Spec Manifest */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopySpecManifest}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-zinc-700 dark:text-zinc-300 border border-black/10 dark:border-white/10 text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500">SPEC JSON KOPYALANDI</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>SPEC MANIFEST KOPYALA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Category Filter Pills (Ride Also Selector Aesthetic) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono">
        <button
          onClick={() => setActiveCategoryIndex('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeCategoryIndex === 'all'
              ? 'bg-zinc-950 dark:bg-[#d4f933] text-white dark:text-black shadow-md'
              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white border border-black/10 dark:border-white/10'
          }`}
        >
          00 {'//'} TÜM ŞARTNAME (23 SPESİFİKASYON)
        </button>
        {BLUEPRINT_DATA.map((cat) => (
          <button
            key={cat.index}
            onClick={() => setActiveCategoryIndex(cat.index)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              activeCategoryIndex === cat.index
                ? 'bg-zinc-950 dark:bg-[#d4f933] text-white dark:text-black shadow-md'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white border border-black/10 dark:border-white/10'
            }`}
          >
            <span>{cat.index} {'//'}</span>
            <span>{cat.tag}</span>
          </button>
        ))}
      </div>

      {/* Blueprint Grid Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredData.map((category) => {
          const IconComponent = category.icon;
          return (
            <div
              key={category.index}
              className="rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 shadow-xl overflow-hidden flex flex-col justify-between transition-all hover:border-black/30 dark:hover:border-white/30"
            >
              {/* Category Header */}
              <div className="p-6 bg-zinc-50 dark:bg-zinc-950/80 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between font-mono">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-zinc-900 dark:bg-zinc-800 text-[#d4f933] flex items-center justify-center border border-black/10 dark:border-white/10">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold">
                      BÖLÜM // {category.index}
                    </div>
                    <h3 className="text-sm font-black text-zinc-950 dark:text-white uppercase tracking-tight">
                      {category.title}
                    </h3>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#d4f933]/20 text-zinc-900 dark:text-[#d4f933] border border-[#d4f933]/30">
                  {category.tag}
                </span>
              </div>

              {/* Spec Rows (Ride Also Technical Table) */}
              <div className="divide-y divide-black/[0.06] dark:divide-white/[0.06] text-xs font-mono">
                {category.specs.map((spec, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors"
                  >
                    <div className="space-y-0.5 max-w-sm">
                      <div className="font-bold text-zinc-950 dark:text-white uppercase text-[11px] tracking-wider">
                        {spec.key}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-sans leading-relaxed">
                        {spec.desc}
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <span className="inline-block px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-black text-zinc-900 dark:text-[#d4f933] border border-black/10 dark:border-white/10 text-[11px]">
                        {spec.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Spec Footer */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 border-t border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                  <span>SLA VERIFICATION: PASSED</span>
                </span>
                <span className="text-emerald-500 font-bold">STANDARDS 100% COMPLIANT</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
