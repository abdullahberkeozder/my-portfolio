'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  Code2,
  Terminal,
  Play,
  RotateCcw,
  Activity,
} from 'lucide-react';

interface ModuleSpec {
  id: string;
  tag: string;
  title: string;
  category: string;
  description: string;
  specs: { label: string; value: string }[];
  code: string;
  language: string;
}

const MODULES: ModuleSpec[] = [
  {
    id: 'spring-ai',
    tag: 'MODULE // 01',
    title: 'Spring AI & 128D Vektör Anlamsal Uzayı',
    category: 'YAPAY ZEKA & EMBEDDINGS',
    description:
      'Geleneksel SQL aramasının ötesinde, kullanıcı sorgularını 128 boyutlu yoğun vektör gömmelerine projekte ederek pgvector ve Kosinüs Benzerliği formülü ile milisaniyeler içinde hibrit RRF sıralaması gerçekleştirir.',
    specs: [
      { label: 'EMBEDDING DIM', value: '128D Dense' },
      { label: 'SIMILARITY METRIC', value: 'Cosine cos(θ)' },
      { label: 'HYBRID FUSION', value: 'RRF (Reciprocal Rank)' },
      { label: 'QUERY LATENCY', value: '~1.8ms P99' },
    ],
    language: 'java',
    code: `@Component
public class VectorEmbeddingService {
    @Autowired
    private EmbeddingClient embeddingClient;

    public float[] embedDocument(String text) {
        // 128 boyutlu normalize vektör üretir
        return embeddingClient.embed(text);
    }

    public double calculateCosineSimilarity(float[] vecA, float[] vecB) {
        return VectorUtils.cosineSimilarity(vecA, vecB);
    }
}`,
  },
  {
    id: 'loom',
    tag: 'MODULE // 02',
    title: 'Java 22 Virtual Threads (Project Loom)',
    category: 'EŞZAMANLILIK & CONCURRENCY',
    description:
      'Spring Boot 4 üzerinde thread-per-request modelini donanım seviyesinde hafif sanal iş parçacıklarına devrederek Tomcat thread pool darboğazlarını tamamen ortadan kaldırır.',
    specs: [
      { label: 'THREAD MODEL', value: 'M:N User-Mode' },
      { label: 'CONCURRENCY CAP', value: '10,000+ Concurrent' },
      { label: 'CARRIER PINNING', value: 'Zero Blocking' },
      { label: 'RAM CONSUMPTION', value: '~1KB / Thread' },
    ],
    language: 'properties',
    code: `# application.properties - Spring Boot 4 Virtual Threads
spring.threads.virtual.enabled=true
server.tomcat.threads.max=200
server.tomcat.threads.min-spare=20

# Her gelen I/O isteği otomatik olarak Virtual Thread'e devredilir`,
  },
  {
    id: 'write-behind',
    tag: 'MODULE // 03',
    title: 'Redis Write-Behind Buffer & Scheduled Sync',
    category: 'HIGH-THROUGHPUT SAYAÇ YÖNETİMİ',
    description:
      'Görüntülenme ve beğeni sayaçları PostgreSQL yerine Redis Hash tamponunda atomik HINCRBY komutlarıyla toplanır. Her 30 saniyede bir çalışan arka plan görevi deltaları topluca veritabanına aktarır.',
    specs: [
      { label: 'WRITE LATENCY', value: '< 0.5ms (O(1))' },
      { label: 'BUFFER CAPACITY', value: 'Redis In-Memory' },
      { label: 'BATCH INTERVAL', value: '30s Fixed Delay' },
      { label: 'DB DISK I/O DROP', value: '%98 Azalma' },
    ],
    language: 'java',
    code: `@Service
public class RedisMetricBufferService {
    @Autowired
    private StringRedisTemplate redisTemplate;

    public void incrementView(Long blogId) {
        // O(1) atomik işlem: disk I/O sıfır
        redisTemplate.opsForHash().increment("novablog:metrics:views:buffer", blogId.toString(), 1L);
    }
}`,
  },
  {
    id: 'optimistic-locking',
    tag: 'MODULE // 04',
    title: 'JPA @Version ile Optimistic Concurrency Control',
    category: 'VERİ BÜTÜNLÜĞÜ & LOCKING',
    description:
      'Kayıp Güncelleme (Lost Update) anomalilerini lock-free önler. Satır kilidi tutmaksızın eski versiyonla gelen eşzamanlı istekleri tespit eder ve RFC 7807 409 Conflict Problem Details ile yönetir.',
    specs: [
      { label: 'LOCKING TYPE', value: 'Lock-Free Optimistic' },
      { label: 'DEADLOCK RISK', value: 'Zero (No Row Locks)' },
      { label: 'CONFLICT CODE', value: 'HTTP 409 Conflict' },
      { label: 'RETRY POLICY', value: 'Automatic UI Rollback' },
    ],
    language: 'java',
    code: `@Entity
@Table(name = "blogs")
public class BlogEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long blogId;

    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;
}`,
  },
  {
    id: 'spring-batch',
    tag: 'MODULE // 05',
    title: 'Spring Batch 5 Chunk-Tabanlı ETL Boru Hattı',
    category: 'BÜYÜK VERİ & ASENKRON İŞLEME',
    description:
      'Milyonlarca satırlık veri temizliği (Soft-Delete Cleanup) ve yazar analitik hesaplamalarını 50\'şerli chunk bloklarında işler. Retry, skip ve transaction rollback mekanizmaları devrededir.',
    specs: [
      { label: 'CHUNK SIZE', value: '50 Items / Commit' },
      { label: 'FAULT TOLERANCE', value: '3 Retry Limit' },
      { label: 'EXECUTION STATE', value: 'PostgreSQL Meta' },
      { label: 'TRIGGER MODES', value: 'Cron & REST API' },
    ],
    language: 'java',
    code: `@Bean
public Step cleanupStep(JobRepository repo, PlatformTransactionManager tx) {
    return new StepBuilder("cleanupStep", repo)
        .<BlogEntity, BlogEntity>chunk(50, tx)
        .reader(softDeletedBlogReader())
        .processor(expiredBlogProcessor())
        .writer(permanentDeleteWriter())
        .faultTolerant().retryLimit(3)
        .build();
}`,
  },
];

export const ModularArchitectureConsole: React.FC = () => {
  const [activeModuleId, setActiveModuleId] = useState<string>('spring-ai');
  const [copiedCode, setCopiedCode] = useState(false);

  // Interactive Simulation States
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [simBufferCount, setSimBufferCount] = useState(42);
  const [simConflictStatus, setSimConflictStatus] = useState<'IDLE' | 'RACE' | '409_RESOLVED'>('IDLE');
  const [simLoomThreads, setSimLoomThreads] = useState(120);

  const activeModule = MODULES.find((m) => m.id === activeModuleId) || MODULES[0];

  const handleCopyCode = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(activeModule.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimStep(1);

    if (activeModuleId === 'spring-ai') {
      setTimeout(() => setSimStep(2), 400);
      setTimeout(() => setSimStep(3), 900);
      setTimeout(() => setIsSimulating(false), 1400);
    } else if (activeModuleId === 'loom') {
      setSimLoomThreads(120);
      let count = 120;
      const interval = setInterval(() => {
        count += 1800;
        if (count >= 10000) {
          count = 10000;
          clearInterval(interval);
          setIsSimulating(false);
        }
        setSimLoomThreads(count);
      }, 100);
    } else if (activeModuleId === 'write-behind') {
      setSimBufferCount((prev) => prev + 1);
      setTimeout(() => setIsSimulating(false), 300);
    } else if (activeModuleId === 'optimistic-locking') {
      setSimConflictStatus('RACE');
      setTimeout(() => {
        setSimConflictStatus('409_RESOLVED');
        setIsSimulating(false);
      }, 1200);
    } else if (activeModuleId === 'spring-batch') {
      setTimeout(() => setSimStep(2), 500);
      setTimeout(() => setSimStep(3), 1100);
      setTimeout(() => setIsSimulating(false), 1600);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      {/* Section Header (Ride Also Style) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase font-bold text-[#a3c900] dark:text-[#d4f933]">
            <span className="w-2 h-2 rounded-full bg-[#d4f933] shadow-[0_0_8px_#d4f933]" />
            <span>02 // MODULAR ARCHITECTURE CONSOLE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-950 dark:text-white uppercase tracking-tight">
            MODÜLER DAĞITIK SİSTEM MİMARİSİ
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl font-mono leading-relaxed">
            Ride Also donanım modülerliğinden ilham alan bileşen konsolu. Her çekirdeğin mimarisini,
            canlı telemetrisini, etkileşimli simülatörünü ve üretim kodunu inceleyin.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
          <span>SPEC_STATUS //</span>
          <span className="text-emerald-500 font-bold">ALL 5 MODULES TESTED (195 PASS)</span>
        </div>
      </div>

      {/* Modular Switcher Tabs (Ride Also TM-B Modular Frame Selector) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono">
        {MODULES.map((m) => {
          const isActive = m.id === activeModuleId;
          return (
            <button
              key={m.id}
              onClick={() => {
                setActiveModuleId(m.id);
                setSimStep(0);
                setSimConflictStatus('IDLE');
              }}
              className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-zinc-950 dark:bg-white text-white dark:text-black shadow-lg shadow-black/10 dark:shadow-white/5'
                  : 'bg-zinc-100 dark:bg-zinc-900/90 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white border border-black/10 dark:border-white/10'
              }`}
            >
              <span className={`text-[10px] ${isActive ? 'text-[#d4f933] dark:text-black font-black' : 'text-zinc-400'}`}>
                {m.tag}
              </span>
              <span>
                {m.title.split(' ')[0]} {m.title.split(' ')[1] || ''}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Spec Card: Split Screen */}
      <div className="rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
        {/* Left Side: Technical Spec Sheet + Interactive Simulation (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold border border-black/10 dark:border-white/10 uppercase">
                {activeModule.category}
              </span>
              <span className="text-zinc-400 uppercase font-semibold">{activeModule.tag}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white tracking-tight uppercase">
              {activeModule.title}
            </h3>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
              {activeModule.description}
            </p>

            {/* Spec Matrix Grid (Ride Also Hardware Specs) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-black/[0.08] dark:border-white/[0.08] font-mono text-xs">
              {activeModule.specs.map((s, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06]">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider">{s.label}</div>
                  <div className="font-bold text-zinc-950 dark:text-white mt-1">{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Simulation Cockpit */}
          <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 space-y-4 font-mono text-xs mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-zinc-950 dark:text-white uppercase text-[11px]">
                <Activity className="w-4 h-4 text-[#a3c900] dark:text-[#d4f933]" />
                <span>CANLI DONANIM VE MİMARİ SİMÜLATÖRÜ //</span>
              </div>
              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="px-4 py-2 rounded-full bg-zinc-950 dark:bg-[#d4f933] hover:opacity-90 disabled:opacity-50 text-white dark:text-black font-black uppercase tracking-wider text-[11px] flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-sm"
              >
                {isSimulating ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isSimulating ? 'İŞLENİYOR...' : 'SİMÜLE ET'}</span>
              </button>
            </div>

            {/* Dynamic Interactive Telemetry Based on Active Module */}
            {activeModuleId === 'spring-ai' && (
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">KOSİNÜS AÇISI: cos(θ) = 0.942</span>
                  <span className="text-emerald-500 font-bold">LATENCY: 1.4 MS</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#d4f933] h-2 rounded-full transition-all duration-700 shadow-[0_0_10px_#d4f933]"
                    style={{ width: isSimulating || simStep > 0 ? '94.2%' : '40%' }}
                  />
                </div>
                <p className="text-[10px] text-zinc-400 font-sans">
                  {simStep === 0 && 'Simülasyon hazır: 128D normalize latent vektör projektörü bekliyor.'}
                  {simStep === 1 && 'Sorgu vektörleştiriliyor: Dense 128 float array hesaplanıyor...'}
                  {simStep === 2 && 'pgvector HNSW indeksi taranıyor: Kosinüs mesafesi skorlandı...'}
                  {simStep >= 3 && 'Eşleşme doğrulandı: %94.2 kosinüs benzerliği ile 1.4ms içinde sonuç döndü.'}
                </p>
              </div>
            )}

            {activeModuleId === 'loom' && (
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">AKTİF SANAL THREAD:</span>
                  <span className="text-[#a3c900] dark:text-[#d4f933] font-bold">{simLoomThreads.toLocaleString()} CONCURRENT</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#d4f933] h-2 rounded-full transition-all duration-300 shadow-[0_0_10px_#d4f933]"
                    style={{ width: `${(simLoomThreads / 10000) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-400 font-sans">
                  <span>Carrier OS Threads: 8 Core (Zero Blocked)</span>
                  <span>RAM Maliyeti: ~{(simLoomThreads / 1024).toFixed(1)} MB</span>
                </div>
              </div>
            )}

            {activeModuleId === 'write-behind' && (
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">REDIS HASH TAMPONU:</span>
                  <span className="text-[#a3c900] dark:text-[#d4f933] font-bold">HINCRBY = {simBufferCount} DELTA</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-sans">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Disk I/O tasarrufu: %98. Her 30 saniyede bir DB Batch Flush tetiklenir.</span>
                </div>
              </div>
            )}

            {activeModuleId === 'optimistic-locking' && (
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">LOCK-FREE DURUMU:</span>
                  <span className="font-bold">
                    {simConflictStatus === 'IDLE' && <span className="text-zinc-400">HAZIR (VERSION = 1)</span>}
                    {simConflictStatus === 'RACE' && <span className="text-amber-500">EŞZAMANLI ÇAKIŞMA TESPİT EDİLDİ</span>}
                    {simConflictStatus === '409_RESOLVED' && <span className="text-emerald-500">RFC 7807 409 CONFLICT YÖNETİLDİ</span>}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-sans">
                  {simConflictStatus === 'IDLE' && 'Satır kilitleme yok. İstekler versiyon numarası ile atomik doğrulanır.'}
                  {simConflictStatus === 'RACE' && 'Kullanıcı A ve B aynı anda yazdı. B eski versiyon ile geldiğinden yakalandı.'}
                  {simConflictStatus === '409_RESOLVED' && 'Veri kaybı (Lost Update) önlendi; istemciye 409 Conflict Problem Details iletildi.'}
                </p>
              </div>
            )}

            {activeModuleId === 'spring-batch' && (
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">CHUNK BOYUTU: 50 ITEMS</span>
                  <span className="text-emerald-500 font-bold">COMMIT: ISOLATED TX</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#d4f933] h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_#d4f933]"
                    style={{ width: isSimulating || simStep > 0 ? (simStep === 1 ? '33%' : simStep === 2 ? '66%' : '100%') : '25%' }}
                  />
                </div>
                <p className="text-[10px] text-zinc-400 font-sans">
                  Bellek sızıntısı olmadan Soft-Delete kayıtlar 50&apos;lik paketler halinde işlenir.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Production Code Excerpt (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-950 border-t lg:border-t-0 lg:border-l border-zinc-800 p-6 sm:p-8 flex flex-col justify-between text-zinc-100 font-mono">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs">
              <span className="flex items-center gap-2 text-[#d4f933] font-bold">
                <Code2 className="w-4 h-4" />
                <span>PRODUCTION EXCERPT</span>
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer text-[10px]"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">KOPYALANDI</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>KOPYALA</span>
                  </>
                )}
              </button>
            </div>

            <pre className="text-xs text-emerald-300/90 leading-relaxed overflow-x-auto p-2 scrollbar-thin max-h-[300px]">
              <code>{activeModule.code}</code>
            </pre>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-zinc-400" />
              <span>TESTED: 195/195 PASS</span>
            </span>
            <span className="text-[#d4f933] font-bold">RFC 7807 COMPLIANT</span>
          </div>
        </div>
      </div>
    </section>
  );
};
