'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Copy,
  Check,
  Code2,
  Terminal,
  Play,
  RotateCcw,
  Activity,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Cpu,
  Database,
  Layers,
  Zap,
} from 'lucide-react';
import { CrtOscilloscope } from './CrtOscilloscope';
import { AnalogVuMeter } from './AnalogVuMeter';
import { playKeyClick, playTabSelect, playSwitchToggle } from '@/lib/retroAudio';

interface ModuleSpec {
  id: string;
  pid: number;
  processName: string;
  tag: string;
  title: string;
  category: string;
  description: string;
  specs: { label: string; value: string }[];
  whyExists: {
    bottleneck: string;
    solution: string;
    gain: string;
  };
  code: string;
  language: string;
  concurrencyMetric: string;
  cpuMetric: string;
  latencyMetric: string;
  status: 'AKTİF' | 'HAZIR' | 'TAMPONDA' | 'LOCK-FREE';
}

const MODULES: ModuleSpec[] = [
  {
    id: 'spring-ai',
    pid: 1024,
    processName: 'com.berkeozder.ai.VectorEmbeddingService',
    tag: 'MODULE // 01',
    title: 'Spring AI & Anlamsal Vektör Arama Motoru',
    category: 'YAPAY ZEKA & İÇERİK ANLAMA',
    description:
      'Klasik kelime aramasının ötesine geçerek, kullanıcı sorgularını anlam ilişkisine göre analiz eder; farklı kelimeler veya yazım hataları kullanılsa dahi en alakalı makaleleri milisaniyeler içinde bulup sıralar.',
    specs: [
      { label: 'VEKTÖR BOYUTU', value: '128 Boyutlu Yoğun' },
      { label: 'BENZERLİK METRİĞİ', value: 'Kosinüs Benzerliği' },
      { label: 'HİBRİT ARAMA', value: 'Hibrit Skorlama (RRF)' },
      { label: 'SORGU GECİKMESİ', value: '~1.8ms P99' },
    ],
    whyExists: {
      bottleneck: "Geleneksel SQL 'LIKE %query%' araması semantik bağlamı yakalayamaz ('bellek yönetimi' arandığında 'garbage collector' bulunamaz).",
      solution: 'Yapay zeka vektör eşleştirmesi ile kelimeler arasındaki anlamsal yakınlık hesaplanır.',
      gain: '%94.2 kavramsal doğruluk ve 1.4ms P99 sorgu gecikmesi.',
    },
    concurrencyMetric: '128D Dense Embed',
    cpuMetric: '1.8% CPU (SIMD)',
    latencyMetric: '~1.4ms',
    status: 'AKTİF',
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
    pid: 2048,
    processName: 'com.berkeozder.loom.VirtualThreadDispatcher',
    tag: 'MODULE // 02',
    title: 'Java 22 Virtual Threads (Project Loom)',
    category: 'EŞZAMANLILIK & CONCURRENCY',
    description:
      'Spring Boot 4 üzerinde thread-per-request modelini donanım seviyesinde hafif sanal iş parçacıklarına devrederek Tomcat thread pool darboğazlarını tamamen ortadan kaldırır.',
    specs: [
      { label: 'İŞ PARÇACIĞI', value: 'Kullanıcı Seviyesi (Sanal)' },
      { label: 'EŞZAMANLI İSTEK', value: '10,000+ Kapasite' },
      { label: 'OS THREAD KİLİTLEME', value: 'Sıfır Bloke (Lock-Free)' },
      { label: 'BELLEK TÜKETİMİ', value: '~1KB / Thread' },
    ],
    whyExists: {
      bottleneck: 'Tomcat varsayılan 200 OS iş parçacığıyla çalışır; yavaş I/O beklemelerinde thread havuzu tükenir ve sunucu 503 kilitlenir.',
      solution: 'Project Loom ile her gelen HTTP isteğine hafif sanal thread atanır; I/O anında OS carrier thread serbest bırakılır.',
      gain: 'Thread başına 1MB yerine ~1KB RAM tüketimi ve sıfır platform thread blokeleme.',
    },
    concurrencyMetric: '10,000+ Sanal Thread',
    cpuMetric: '8 Core Carrier',
    latencyMetric: '< 0.8ms',
    status: 'AKTİF',
    language: 'properties',
    code: `# application.properties - Spring Boot 4 Virtual Threads
spring.threads.virtual.enabled=true
server.tomcat.threads.max=200
server.tomcat.threads.min-spare=20

# Her gelen I/O isteği otomatik olarak Virtual Thread'e devredilir`,
  },
  {
    id: 'write-behind',
    pid: 3120,
    processName: 'com.berkeozder.metrics.RedisMetricBuffer',
    tag: 'MODULE // 03',
    title: 'Redis Write-Behind Buffer & Scheduled Sync',
    category: 'HIGH-THROUGHPUT SAYAÇ YÖNETİMİ',
    description:
      'Görüntülenme ve beğeni sayaçları PostgreSQL yerine Redis Hash tamponunda atomik HINCRBY komutlarıyla toplanır. Her 30 saniyede bir çalışan arka plan görevi deltaları topluca veritabanına aktarır.',
    specs: [
      { label: 'YAZMA GECİKMESİ', value: '< 0.5ms (O(1))' },
      { label: 'TAMPON HAFIZA', value: 'Redis In-Memory' },
      { label: 'TOPLU YAZIM', value: '30sn Periyodik' },
      { label: 'DİSK YÜKÜNDE DÜŞÜŞ', value: '%98 Azalma' },
    ],
    whyExists: {
      bottleneck: 'Her makale okunmasında veya beğenilmesinde veritabanı satır kilidi (Row Lock) almak yüksek trafikte DB disk I/O kilitlenmesi yaratır.',
      solution: 'Sayaç artışları Redis Hash içinde O(1) HINCRBY ile toplanır; 30 saniyede bir toplu (batch) DB yazımı yapılır.',
      gain: '%98 DB disk I/O tasarrufu ve sıfır satır kilitleme çekişmesi.',
    },
    concurrencyMetric: 'O(1) HINCRBY Buffer',
    cpuMetric: '0.4% Redis CPU',
    latencyMetric: '< 0.3ms',
    status: 'TAMPONDA',
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
    pid: 4096,
    processName: 'com.berkeozder.entity.OptimisticLockValidator',
    tag: 'MODULE // 04',
    title: 'JPA @Version ile Optimistic Concurrency Control',
    category: 'VERİ BÜTÜNLÜĞÜ & LOCKING',
    description:
      'Kayıp Güncelleme (Lost Update) anomalilerini lock-free önler. Satır kilidi tutmaksızın eski versiyonla gelen eşzamanlı istekleri tespit eder ve RFC 7807 409 Conflict Problem Details ile yönetir.',
    specs: [
      { label: 'KİLİTLEME TİPİ', value: 'İyimser (Lock-Free)' },
      { label: 'KİLİTLENME RİSKİ', value: 'Sıfır (Satır Kilidi Yok)' },
      { label: 'ÇAKIŞMA KODU', value: 'HTTP 409 Çakışma' },
      { label: 'GERİ ALMA İLKESİ', value: 'Otomatik UI Geri Alma' },
    ],
    whyExists: {
      bottleneck: 'Aynı makaleyi eşzamanlı güncelleyen iki editörden biri diğerinin içeriğini farkında olmadan ezebilir (Lost Update anomalisi).',
      solution: 'Pessimistic kilitleme yerine @Version long alanı ile lock-free OCC uygulanır; eski versiyonla gelen istek RFC 7807 409 Conflict döner.',
      gain: 'Sıfır kilitlenme (deadlock) riski, tam veri bütünlüğü ve otomatik UI geri alma.',
    },
    concurrencyMetric: 'Lock-Free OCC (@Version)',
    cpuMetric: 'Sıfır Lock Bekleme',
    latencyMetric: '~0.2ms',
    status: 'LOCK-FREE',
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
    pid: 5200,
    processName: 'com.berkeozder.batch.ChunkCleanupPipeline',
    tag: 'MODULE // 05',
    title: 'Spring Batch 5 Chunk-Tabanlı ETL Boru Hattı',
    category: 'BÜYÜK VERİ & ASENKRON İŞLEME',
    description:
      'Milyonlarca satırlık veri temizliği (Soft-Delete Cleanup) ve yazar analitik hesaplamalarını 50\'şerli chunk bloklarında işler. Retry, skip ve transaction rollback mekanizmaları devrededir.',
    specs: [
      { label: 'PAKET BOYUTU', value: '50 Kayıt / Commit' },
      { label: 'HATA TOLERANSI', value: '3 Tekrar Deneme' },
      { label: 'YÜRÜTME DURUMU', value: 'PostgreSQL Metadata' },
      { label: 'TETİKLEME ŞEKLİ', value: 'Zamanlanmış & REST' },
    ],
    whyExists: {
      bottleneck: "Milyonlarca silinmiş makaleyi tek bir 'DELETE FROM' ile silmek tablo kilitlenmesine ve OutOfMemory bellek aşımına yol açar.",
      solution: "Spring Batch 5 chunk-tabanlı mimari ile kayıtlar 50'şerli paketlerde okunur, doğrulanır ve izole transaction içinde silinir.",
      gain: 'Hata durumunda 3 retry toleransı, sıfır bellek sızıntısı ve kesintisiz arka plan arşivleme.',
    },
    concurrencyMetric: '50 Items / Isolated TX',
    cpuMetric: 'Chunk Commit: 50ms',
    latencyMetric: '~12ms / Chunk',
    status: 'HAZIR',
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

  // Mechanical Toggle Switch States
  const [virtualThreadsEnabled, setVirtualThreadsEnabled] = useState(true);
  const [redisBufferEnabled, setRedisBufferEnabled] = useState(true);
  const [occLockFreeEnabled, setOccLockFreeEnabled] = useState(true);

  // Interactive Simulation States
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [simBufferCount, setSimBufferCount] = useState(42);
  const [simConflictStatus, setSimConflictStatus] = useState<'IDLE' | 'RACE' | '409_RESOLVED'>('IDLE');
  const [simLoomThreads, setSimLoomThreads] = useState(120);

  const activeModule = MODULES.find((m) => m.id === activeModuleId) || MODULES[0];

  const handleSelectModule = (modId: string) => {
    playTabSelect();
    setActiveModuleId(modId);
    setSimStep(0);
    setSimConflictStatus('IDLE');
  };

  const handleToggleRocker = (type: 'loom' | 'redis' | 'occ') => {
    if (type === 'loom') {
      const next = !virtualThreadsEnabled;
      playSwitchToggle(next);
      setVirtualThreadsEnabled(next);
    } else if (type === 'redis') {
      const next = !redisBufferEnabled;
      playSwitchToggle(next);
      setRedisBufferEnabled(next);
    } else if (type === 'occ') {
      const next = !occLockFreeEnabled;
      playSwitchToggle(next);
      setOccLockFreeEnabled(next);
    }
  };

  const handleRunSimulation = useCallback(() => {
    playKeyClick('crisp');
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
  }, [activeModuleId]);

  const runSimRef = useRef(handleRunSimulation);

  useEffect(() => {
    runSimRef.current = handleRunSimulation;
  }, [handleRunSimulation]);

  useEffect(() => {
    const handleSelectModuleEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail && MODULES.some((m) => m.id === customEvent.detail)) {
        setActiveModuleId(customEvent.detail);
        setSimStep(0);
        setSimConflictStatus('IDLE');
      }
    };
    const handleRunSimEvent = () => {
      runSimRef.current();
    };

    window.addEventListener('select-console-module', handleSelectModuleEvent);
    window.addEventListener('run-console-simulation', handleRunSimEvent);
    return () => {
      window.removeEventListener('select-console-module', handleSelectModuleEvent);
      window.removeEventListener('run-console-simulation', handleRunSimEvent);
    };
  }, []);

  const handleCopyCode = () => {
    playKeyClick('crisp');
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(activeModule.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // VU Meter Value calculation
  const loomMeterPercent = (simLoomThreads / 10000) * 100;
  const redisMeterPercent = Math.min(100, (simBufferCount / 50) * 100);

  return (
    <section id="modular-architecture-console" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-300 dark:border-zinc-800">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span>SİTEMAP PARÇASI 5 // MAC OS X ACTIVITY MONITOR KONSOLU</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-3">
            <span>DAĞITIK SİSTEM MİMARİSİ & DONANIM TEŞHİSLERİ</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl font-sans leading-relaxed">
            Mac OS X Snow Leopard & Lion Activity Monitor standartlarında tasarlanan donanım konsolu.
            Java 22 Project Loom, Spring AI 128D vektör, Redis Write-Behind ve JPA Optimistic Locking süreçlerini canlı inceleyin.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 shrink-0">
          <span className="text-[11px] font-bold px-3 py-1 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
            201/201 TEST PASS
          </span>
        </div>
      </div>

      {/* Main Mac Activity Monitor Window Chassis */}
      <div className="mac-activity-monitor-chassis">
        {/* Mac OS X Window Header Bar with Traffic Lights */}
        <div className="h-10 px-4 bg-gradient-to-b from-[#f2f2f2] to-[#d8d8d8] dark:from-[#2c3038] dark:to-[#1e2127] border-b border-[#a8a8a8] dark:border-[#383d47] flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            {/* Traffic Lights */}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]" />
            </div>
            <span className="ml-3 font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Activity Monitor — Nova Dağıtık Çekirdek (pid: 1024..5200)
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              CARRIER CORE: 8
            </span>
            <span>&bull;</span>
            <span>OS THREADS BLOCKED: 0</span>
          </div>
        </div>

        {/* Mac OS X Segmented Toolbar Selector Tabs */}
        <div className="px-3 py-2 bg-[#e4e4e4] dark:bg-[#202329] border-b border-[#c0c0c0] dark:border-[#333740] flex items-center justify-between overflow-x-auto scrollbar-none gap-2">
          <div className="inline-flex items-center p-1 rounded-lg bg-[#cecece] dark:bg-[#16181d] border border-[#b4b4b4] dark:border-[#2b2f38] shadow-inner">
            {MODULES.map((m) => {
              const isActive = m.id === activeModuleId;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectModule(m.id)}
                  aria-selected={isActive}
                  role="tab"
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isActive
                      ? 'bg-gradient-to-b from-white to-[#ececec] dark:from-[#3a3f4a] dark:to-[#2a2e37] text-zinc-950 dark:text-white shadow-sm border border-[#a8a8a8] dark:border-[#4c5361]'
                      : 'text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span className={`text-[10px] font-mono ${isActive ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-zinc-500'}`}>
                    {m.tag.replace('MODULE // ', '#')}
                  </span>
                  <span>{m.title.split(' ')[0]} {m.title.split(' ')[1] || ''}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span>DAĞITIK MOD:</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">LOCK-FREE CLUSTER</span>
          </div>
        </div>

        {/* Instrument Deck: Dual Meters & CRT Oscilloscope Screen */}
        <div className="p-4 sm:p-5 bg-[#ebebeb] dark:bg-[#1a1d22] border-b border-[#cccccc] dark:border-[#2f343e] grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Dual Analog VU Meters (5 cols) */}
          <div className="md:col-span-5 grid grid-cols-2 gap-3">
            <AnalogVuMeter
              label="Loom Concurrency"
              sublabel="V-THREADS"
              value={loomMeterPercent}
              displayValue={`${simLoomThreads.toLocaleString()} T`}
              unit="T"
            />
            <AnalogVuMeter
              label="Redis Buffer"
              sublabel="DELTA PEAK"
              value={redisMeterPercent}
              displayValue={`${simBufferCount} ops`}
              unit="ops"
            />
          </div>

          {/* CRT Oscilloscope Screen (4 cols) */}
          <div className="md:col-span-4 flex flex-col justify-between">
            <CrtOscilloscope
              isSimulating={isSimulating}
              frequency={activeModuleId === 'spring-ai' ? 2.5 : activeModuleId === 'loom' ? 3.8 : 1.2}
              label="LOOM & TELEMETRY OSCILLOGRAM"
            />
          </div>

          {/* Mechanical Rocker Switches Panel (3 cols) */}
          <div className="md:col-span-3 p-3 rounded-lg bg-[#dedede] dark:bg-[#15171c] border border-[#bfbfbf] dark:border-[#2c3038] flex flex-col justify-between space-y-2 select-none">
            <div className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>DONANIM ŞALTERLERİ</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>

            {/* Rocker 1: Loom Virtual Threads */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium text-zinc-800 dark:text-zinc-200">
                Loom V-Threads
              </span>
              <div
                onClick={() => handleToggleRocker('loom')}
                className={`mac-mechanical-rocker ${virtualThreadsEnabled ? 'active' : ''}`}
                title="Loom Virtual Threads Toggle"
              >
                <span className="text-[8px] font-mono text-zinc-400 pl-1">0</span>
                <div className="rocker-knob">{virtualThreadsEnabled ? 'ON' : 'OFF'}</div>
                <span className="text-[8px] font-mono text-emerald-400 pr-1">1</span>
              </div>
            </div>

            {/* Rocker 2: Redis Write-Behind */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium text-zinc-800 dark:text-zinc-200">
                Write-Behind
              </span>
              <div
                onClick={() => handleToggleRocker('redis')}
                className={`mac-mechanical-rocker ${redisBufferEnabled ? 'active' : ''}`}
                title="Redis Write-Behind Buffer Toggle"
              >
                <span className="text-[8px] font-mono text-zinc-400 pl-1">0</span>
                <div className="rocker-knob">{redisBufferEnabled ? 'ON' : 'OFF'}</div>
                <span className="text-[8px] font-mono text-emerald-400 pr-1">1</span>
              </div>
            </div>

            {/* Rocker 3: JPA Optimistic Locking */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium text-zinc-800 dark:text-zinc-200">
                Lock-Free OCC
              </span>
              <div
                onClick={() => handleToggleRocker('occ')}
                className={`mac-mechanical-rocker ${occLockFreeEnabled ? 'active' : ''}`}
                title="Optimistic Concurrency Control Toggle"
              >
                <span className="text-[8px] font-mono text-zinc-400 pl-1">0</span>
                <div className="rocker-knob">{occLockFreeEnabled ? 'ON' : 'OFF'}</div>
                <span className="text-[8px] font-mono text-emerald-400 pr-1">1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mac OS X Aqua Process Table */}
        <div className="overflow-x-auto border-b border-[#c0c0c0] dark:border-[#2f343e]">
          <table className="mac-aqua-table">
            <thead>
              <tr>
                <th style={{ width: '65px' }}>PID</th>
                <th>SÜREÇ / MİMARİ MODÜL ADI</th>
                <th>EŞZAMANLILIK (CONCURRENCY)</th>
                <th>KAYNAK / CPU</th>
                <th>P99 GECİKME</th>
                <th style={{ width: '90px' }}>DURUM</th>
              </tr>
            </thead>
            <tbody>
              {MODULES.map((m) => {
                const isSelected = m.id === activeModuleId;
                return (
                  <tr
                    key={m.id}
                    onClick={() => handleSelectModule(m.id)}
                    className={`cursor-pointer ${isSelected ? 'selected' : ''}`}
                  >
                    <td className="font-mono text-zinc-600 dark:text-zinc-400 font-bold">
                      {m.pid}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {m.id === 'spring-ai' && <Cpu className="w-3.5 h-3.5 text-purple-500" />}
                        {m.id === 'loom' && <Activity className="w-3.5 h-3.5 text-emerald-500" />}
                        {m.id === 'write-behind' && <Database className="w-3.5 h-3.5 text-rose-500" />}
                        {m.id === 'optimistic-locking' && <Zap className="w-3.5 h-3.5 text-amber-500" />}
                        {m.id === 'spring-batch' && <Layers className="w-3.5 h-3.5 text-cyan-500" />}
                        <span className="font-bold">{m.processName}</span>
                      </div>
                    </td>
                    <td className="font-mono">{m.concurrencyMetric}</td>
                    <td className="font-mono">{m.cpuMetric}</td>
                    <td className="font-mono font-semibold">{m.latencyMetric}</td>
                    <td>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : m.status === 'AKTİF'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selected Module Deep Inspector Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-[#121417]">
          {/* Left Inspector (7 cols): Architecture Reasoning & Simulator */}
          <div className="lg:col-span-7 p-6 space-y-5 border-b lg:border-b-0 lg:border-r border-[#e0e0e0] dark:border-[#262a32]">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="px-3 py-1 rounded-md bg-[#eef2f6] dark:bg-[#1e232d] text-zinc-900 dark:text-zinc-100 font-bold border border-[#d0d7de] dark:border-[#323946] uppercase">
                {activeModule.category}
              </span>
              <span className="text-zinc-500 uppercase font-semibold">{activeModule.tag}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight uppercase">
              {activeModule.title}
            </h3>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
              {activeModule.description}
            </p>

            {/* Spec Matrix Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800 font-mono text-xs">
              {activeModule.specs.map((s, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{s.label}</div>
                  <div className="font-bold text-zinc-900 dark:text-white mt-1 text-[11px]">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Architectural Justification: "NEDEN VAR?" Box */}
            <div className="p-3.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>NEDEN VAR? // MİMARİ GEREKÇE</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-sans text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <div className="text-[10px] font-mono text-rose-500 font-bold uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    DARBOĞAZ
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-snug">
                    {activeModule.whyExists.bottleneck}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    ÇÖZÜM
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-snug">
                    {activeModule.whyExists.solution}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <div className="text-[10px] font-mono text-emerald-500 font-bold uppercase flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    KAZANIM
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-snug">
                    {activeModule.whyExists.gain}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Simulation Cockpit */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-zinc-950 dark:text-white uppercase text-[11px]">
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>CANLI TELEMETRİ SİMÜLATÖRÜ //</span>
                </div>
                <button
                  type="button"
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  aria-disabled={isSimulating}
                  title={
                    isSimulating
                      ? 'Simülasyon çalışıyor, lütfen bekleyin...'
                      : 'Aktif mimari modül için gerçek zamanlı yük simülasyonunu başlat'
                  }
                  className="mac-aqua-btn !px-4 !py-1.5 !text-xs uppercase font-mono font-bold"
                >
                  {isSimulating ? <RotateCcw className="w-3.5 h-3.5 animate-spin text-white" /> : <Play className="w-3.5 h-3.5 fill-current text-white" />}
                  <span>{isSimulating ? 'İŞLENİYOR...' : 'SİMÜLE ET'}</span>
                </button>
              </div>

              {/* Dynamic Interactive Telemetry Based on Active Module */}
              {activeModuleId === 'spring-ai' && (
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">ANLAMSAL UYUM: %94.2 İSABET</span>
                    <span className="text-emerald-500 font-bold">YANIT SÜRESİ: 1.4 MS</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-700 shadow-[0_0_8px_#10b981]"
                      style={{ width: isSimulating || simStep > 0 ? '94.2%' : '40%' }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans">
                    {simStep === 0 && 'Simülasyon hazır: Yapay zeka anlamsal eşleştirme motoru sorguyu bekliyor.'}
                    {simStep === 1 && 'Sorgu çözümleniyor: Cümlenin anlamsal özeti ve anahtar kavramları çıkarılıyor...'}
                    {simStep === 2 && 'Vektör veritabanı taranıyor: pgvector HNSW kosinüs benzerliği eşleştiriliyor...'}
                    {simStep >= 3 && 'Eşleşme tamamlandı: %94.2 anlamsal uyum ile milisaniyeler içinde en doğru makale bulundu.'}
                  </p>
                </div>
              )}

              {activeModuleId === 'loom' && (
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">AKTİF SANAL THREAD:</span>
                    <span className="text-emerald-500 font-bold">{simLoomThreads.toLocaleString()} CONCURRENT</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300 shadow-[0_0_8px_#10b981]"
                      style={{ width: `${(simLoomThreads / 10000) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-500 font-sans">
                    <span>Carrier OS Threads: 8 Core (Zero Blocked)</span>
                    <span>RAM Maliyeti: ~{(simLoomThreads / 1024).toFixed(1)} MB</span>
                  </div>
                </div>
              )}

              {activeModuleId === 'write-behind' && (
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">REDIS HASH TAMPONU:</span>
                    <span className="text-emerald-500 font-bold">HINCRBY = {simBufferCount} DELTA</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-sans">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Disk I/O tasarrufu: %98. Her 30 saniyede bir DB Batch Flush tetiklenir.</span>
                  </div>
                </div>
              )}

              {activeModuleId === 'optimistic-locking' && (
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">LOCK-FREE DURUMU:</span>
                    <span className="font-bold">
                      {simConflictStatus === 'IDLE' && <span className="text-zinc-500">HAZIR (VERSION = 1)</span>}
                      {simConflictStatus === 'RACE' && <span className="text-amber-500">EŞZAMANLI ÇAKIŞMA TESPİT EDİLDİ</span>}
                      {simConflictStatus === '409_RESOLVED' && <span className="text-emerald-500">RFC 7807 409 CONFLICT YÖNETİLDİ</span>}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans">
                    {simConflictStatus === 'IDLE' && 'Satır kilitleme yok. İstekler versiyon numarası ile atomik doğrulanır.'}
                    {simConflictStatus === 'RACE' && 'Kullanıcı A ve B aynı anda yazdı. B eski versiyon ile geldiğinden yakalandı.'}
                    {simConflictStatus === '409_RESOLVED' && 'Veri kaybı (Lost Update) önlendi; istemciye 409 Conflict Problem Details iletildi.'}
                  </p>
                </div>
              )}

              {activeModuleId === 'spring-batch' && (
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">CHUNK BOYUTU: 50 ITEMS</span>
                    <span className="text-emerald-500 font-bold">COMMIT: ISOLATED TX</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500 shadow-[0_0_8px_#10b981]"
                      style={{ width: isSimulating || simStep > 0 ? (simStep === 1 ? '33%' : simStep === 2 ? '66%' : '100%') : '25%' }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans">
                    Bellek sızıntısı olmadan Soft-Delete kayıtlar 50&apos;lik paketler halinde işlenir.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Inspector (5 cols): Production Code Excerpt */}
          <div className="lg:col-span-5 bg-[#16181d] p-6 flex flex-col justify-between text-zinc-100 font-mono">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs">
                <span className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Code2 className="w-4 h-4" />
                  <span>PRODUCTION EXCERPT</span>
                </span>
                <button
                  onClick={handleCopyCode}
                  className="ios6-btn ios6-btn-silver px-3 py-1 text-[10px]"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">KOPYALANDI</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>KOPYALA</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="text-xs text-emerald-300 leading-relaxed overflow-x-auto p-2 scrollbar-thin max-h-[340px] bg-black/40 rounded border border-zinc-800">
                <code>{activeModule.code}</code>
              </pre>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                <span>TEST DOĞRULAMASI: 201/201 GEÇTİ</span>
              </span>
              <span className="text-emerald-400 font-bold">RFC 7807 UYUMLU</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
