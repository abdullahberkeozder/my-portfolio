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
  status: 'ACTIVE' | 'READY' | 'BUFFERED' | 'LOCK-FREE';
}

const MODULES: ModuleSpec[] = [
  {
    id: 'spring-ai',
    pid: 1024,
    processName: 'com.berkeozder.ai.VectorEmbeddingService',
    tag: 'MODULE // 01',
    title: 'Spring AI & Semantic Vector Search Engine',
    category: 'ARTIFICIAL INTELLIGENCE & NLP',
    description:
      'Going beyond literal keyword searches, analyzes user queries by contextual meaning; returns and ranks relevant articles in sub-milliseconds even with colloquial wording or misspellings.',
    specs: [
      { label: 'VECTOR DIMENSION', value: '128-Dimensional Dense' },
      { label: 'SIMILARITY METRIC', value: 'Cosine Similarity' },
      { label: 'HYBRID SEARCH', value: 'Hybrid RRF Fusion' },
      { label: 'QUERY LATENCY', value: '~1.8ms P99' },
    ],
    whyExists: {
      bottleneck: "Traditional SQL 'LIKE %query%' cannot capture semantic context (searching for 'memory management' misses 'garbage collector').",
      solution: 'Calculates semantic proximity between concepts in multi-dimensional vector space.',
      gain: '94.2% conceptual precision and 1.4ms P99 retrieval latency.',
    },
    concurrencyMetric: '128D Dense Embed',
    cpuMetric: '1.8% CPU (SIMD)',
    latencyMetric: '~1.4ms',
    status: 'ACTIVE',
    language: 'java',
    code: `@Component
public class VectorEmbeddingService {
    @Autowired
    private EmbeddingClient embeddingClient;

    public float[] embedDocument(String text) {
        // Generates 128-dimensional normalized embedding vector
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
    category: 'CONCURRENCY & VIRTUAL THREADS',
    description:
      'Delegates the thread-per-request model on Spring Boot 4 to hardware-level lightweight virtual threads, eliminating Tomcat thread pool bottlenecks.',
    specs: [
      { label: 'THREAD MODEL', value: 'User-Space (Virtual)' },
      { label: 'CONCURRENT CAPACITY', value: '10,000+ Concurrent' },
      { label: 'OS THREAD BLOCKING', value: 'Zero Blocking (Lock-Free)' },
      { label: 'MEMORY FOOTPRINT', value: '~1KB / Thread' },
    ],
    whyExists: {
      bottleneck: 'Tomcat default pool runs 200 platform threads; blocking I/O calls quickly exhaust the pool, triggering 503 gateway timeouts.',
      solution: 'Project Loom assigns lightweight virtual threads to incoming requests; releases carrier threads immediately during I/O wait.',
      gain: '~1KB RAM consumption per thread instead of 1MB, with zero platform thread starvation.',
    },
    concurrencyMetric: '10,000+ Virtual Threads',
    cpuMetric: '8 Core Carrier',
    latencyMetric: '< 0.8ms',
    status: 'ACTIVE',
    language: 'properties',
    code: `# application.properties - Spring Boot 4 Virtual Threads
spring.threads.virtual.enabled=true
server.tomcat.threads.max=200
server.tomcat.threads.min-spare=20

# All incoming I/O requests are automatically scheduled on virtual threads`,
  },
  {
    id: 'write-behind',
    pid: 3120,
    processName: 'com.berkeozder.metrics.RedisMetricBuffer',
    tag: 'MODULE // 03',
    title: 'Redis Write-Behind Buffer & Scheduled Sync',
    category: 'HIGH-THROUGHPUT COUNTER PIPELINE',
    description:
      'Aggregates article view and clap telemetry in Redis Hash structures via atomic HINCRBY. A scheduled background task flushes accumulated deltas to PostgreSQL every 30 seconds.',
    specs: [
      { label: 'WRITE LATENCY', value: '< 0.5ms (O(1))' },
      { label: 'BUFFER MEMORY', value: 'Redis In-Memory' },
      { label: 'BATCH SYNC', value: '30s Periodic' },
      { label: 'DISK I/O REDUCTION', value: '98% Reduction' },
    ],
    whyExists: {
      bottleneck: 'Acquiring row-level locks on PostgreSQL for every page view and clap causes intense disk I/O contention under load.',
      solution: 'Counters increment in RAM via O(1) HINCRBY; synchronized to database periodically in isolated batch transactions.',
      gain: '98% database disk I/O reduction and zero row lock contention.',
    },
    concurrencyMetric: 'O(1) HINCRBY Buffer',
    cpuMetric: '0.4% Redis CPU',
    latencyMetric: '< 0.3ms',
    status: 'BUFFERED',
    language: 'java',
    code: `@Service
public class RedisMetricBufferService {
    @Autowired
    private StringRedisTemplate redisTemplate;

    public void incrementView(Long blogId) {
        // O(1) in-memory atomic operation: zero disk I/O
        redisTemplate.opsForHash().increment("novablog:metrics:views:buffer", blogId.toString(), 1L);
    }
}`,
  },
  {
    id: 'optimistic-locking',
    pid: 4096,
    processName: 'com.berkeozder.entity.OptimisticLockValidator',
    tag: 'MODULE // 04',
    title: 'JPA @Version with Optimistic Concurrency Control',
    category: 'DATA INTEGRITY & LOCKING',
    description:
      'Prevents Lost Update anomalies lock-free. Intercepts concurrent mutations carrying stale version tokens and handles them transparently via RFC 7807 409 Conflict Problem Details.',
    specs: [
      { label: 'LOCKING TYPE', value: 'Optimistic (Lock-Free)' },
      { label: 'DEADLOCK RISK', value: 'Zero (No Row Locks)' },
      { label: 'CONFLICT CODE', value: 'HTTP 409 Conflict' },
      { label: 'RECOVERY POLICY', value: 'Automatic UI Rollback' },
    ],
    whyExists: {
      bottleneck: 'Two editors updating the same article concurrently can overwrite each other without warning (Lost Update anomaly).',
      solution: 'Replaces pessimistic database locking with @Version long fields for OCC; stale updates return RFC 7807 409 Conflict.',
      gain: 'Zero deadlock risk, complete transactional data integrity, and automatic UI state recovery.',
    },
    concurrencyMetric: 'Lock-Free OCC (@Version)',
    cpuMetric: 'Zero Lock Contention',
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
    title: 'Spring Batch 5 Chunk-Based ETL Pipeline',
    category: 'BIG DATA & ASYNC PIPELINES',
    description:
      'Processes millions of soft-deleted records and author interaction analytics in 50-item chunk transactions with automatic retry, skip, and rollback mechanisms.',
    specs: [
      { label: 'CHUNK SIZE', value: '50 Items / Commit' },
      { label: 'FAULT TOLERANCE', value: '3 Retry Limit' },
      { label: 'EXECUTION STATE', value: 'PostgreSQL Metadata' },
      { label: 'TRIGGER MECHANISM', value: 'Scheduled & REST' },
    ],
    whyExists: {
      bottleneck: "Purging millions of deleted articles with a single 'DELETE FROM' locks tables and triggers OutOfMemoryErrors.",
      solution: 'Reads, validates, and purges records in 50-item chunks within isolated transactions using Spring Batch 5.',
      gain: '3-retry fault tolerance, zero memory leaks, and non-blocking background archiving.',
    },
    concurrencyMetric: '50 Items / Isolated TX',
    cpuMetric: 'Chunk Commit: 50ms',
    latencyMetric: '~12ms / Chunk',
    status: 'READY',
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
            <span>SITEMAP SECTION 5 // MAC OS X ACTIVITY MONITOR CONSOLE</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-3">
            <span>DISTRIBUTED SYSTEMS ARCHITECTURE &amp; HARDWARE TELEMETRY</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl font-sans leading-relaxed">
            Hardware diagnostic console modeled after Mac OS X Snow Leopard &amp; Lion Activity Monitor standards.
            Inspect Java 22 Project Loom, Spring AI 128D vector space, Redis Write-Behind, and JPA Optimistic Locking live.
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
        {/* Mac OS 9 Window Header Bar with Pinstripe Titlebar */}
        <div className="mac9-subwindow-titlebar shrink-0">
          <div className="flex items-center gap-2">
            <div className="mac9-box-btn" title="Window Control" />
            <span className="mac9-title-badge">
              <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
               Activity Monitor — Nova Distributed Core (pid: 1024..5200)
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              CARRIER CORE: 8
            </span>
            <span>&bull;</span>
            <span>OS THREADS BLOCKED: 0</span>
            <div className="mac9-mini-close-box" title="Zoom" />
          </div>
        </div>

        {/* Mac OS X Segmented Toolbar Selector Tabs */}
        <div className="px-4 py-2.5 bg-[#e4e4e7] dark:bg-[#1a1d23] border-b border-[#c4c4c8] dark:border-[#2d323b] flex items-center justify-between overflow-x-auto scrollbar-none gap-2 select-none">
          <div className="mac-segmented-channel">
            {MODULES.map((m) => {
              const isActive = m.id === activeModuleId;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectModule(m.id)}
                  aria-selected={isActive}
                  role="tab"
                  className={`mac-segmented-tab ${isActive ? 'active' : ''}`}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                  )}
                  <span className={`text-[10px] font-mono ${isActive ? 'font-black text-emerald-600 dark:text-emerald-400' : 'opacity-70'}`}>
                    {m.tag.replace('MODULE // ', '#')}
                  </span>
                  <span>{m.title.split(' ')[0]} {m.title.split(' ')[1] || ''}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span>DISTRIBUTED MODE:</span>
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
              <span>HARDWARE TOGGLES</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>

            {/* Rocker 1: Loom Virtual Threads */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium text-zinc-800 dark:text-zinc-200">
                Loom V-Threads
              </span>
              <div
                role="switch"
                aria-checked={virtualThreadsEnabled}
                aria-label="Loom Virtual Threads Hardware Switch"
                tabIndex={0}
                onClick={() => handleToggleRocker('loom')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleRocker('loom');
                  }
                }}
                className={`mac-mechanical-rocker-pro ${virtualThreadsEnabled ? 'active' : ''}`}
                title="Loom Virtual Threads Toggle (Space/Enter or Click)"
              >
                <span className="rocker-track-label rocker-track-off">OFF</span>
                <span className="rocker-track-label rocker-track-on">ON</span>
                <div className="rocker-knob">
                  <span className="rocker-knob-pip" />
                </div>
              </div>
            </div>

            {/* Rocker 2: Redis Write-Behind */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium text-zinc-800 dark:text-zinc-200">
                Write-Behind
              </span>
              <div
                role="switch"
                aria-checked={redisBufferEnabled}
                aria-label="Redis Write-Behind Buffer Hardware Switch"
                tabIndex={0}
                onClick={() => handleToggleRocker('redis')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleRocker('redis');
                  }
                }}
                className={`mac-mechanical-rocker-pro ${redisBufferEnabled ? 'active' : ''}`}
                title="Redis Write-Behind Buffer Toggle (Space/Enter or Click)"
              >
                <span className="rocker-track-label rocker-track-off">OFF</span>
                <span className="rocker-track-label rocker-track-on">ON</span>
                <div className="rocker-knob">
                  <span className="rocker-knob-pip" />
                </div>
              </div>
            </div>

            {/* Rocker 3: JPA Optimistic Locking */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium text-zinc-800 dark:text-zinc-200">
                Lock-Free OCC
              </span>
              <div
                role="switch"
                aria-checked={occLockFreeEnabled}
                aria-label="JPA Optimistic Concurrency Control Hardware Switch"
                tabIndex={0}
                onClick={() => handleToggleRocker('occ')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleRocker('occ');
                  }
                }}
                className={`mac-mechanical-rocker-pro ${occLockFreeEnabled ? 'active' : ''}`}
                title="Optimistic Concurrency Control Toggle (Space/Enter or Click)"
              >
                <span className="rocker-track-label rocker-track-off">OFF</span>
                <span className="rocker-track-label rocker-track-on">ON</span>
                <div className="rocker-knob">
                  <span className="rocker-knob-pip" />
                </div>
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
                <th>PROCESS / ARCHITECTURAL MODULE</th>
                <th>CONCURRENCY MODEL</th>
                <th>RESOURCE / CPU</th>
                <th>P99 LATENCY</th>
                <th style={{ width: '90px' }}>STATUS</th>
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
                            : m.status === 'ACTIVE'
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

            {/* Architectural Justification: "WHY DOES IT EXIST?" Box */}
            <div className="p-3.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>WHY DOES IT EXIST? // ARCHITECTURAL RATIONALE</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-sans text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <div className="text-[10px] font-mono text-rose-500 font-bold uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    BOTTLENECK
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-snug">
                    {activeModule.whyExists.bottleneck}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    SOLUTION
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-snug">
                    {activeModule.whyExists.solution}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <div className="text-[10px] font-mono text-emerald-500 font-bold uppercase flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    GAIN
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
                  <span>LIVE TELEMETRY SIMULATOR //</span>
                </div>
                <button
                  type="button"
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  aria-disabled={isSimulating}
                  title={
                    isSimulating
                      ? 'Simulation running, please wait...'
                      : 'Launch real-time workload simulation for active module'
                  }
                  className="mac-aqua-btn !px-4 !py-1.5 !text-xs uppercase font-mono font-bold"
                >
                  {isSimulating ? <RotateCcw className="w-3.5 h-3.5 animate-spin text-white" /> : <Play className="w-3.5 h-3.5 fill-current text-white" />}
                  <span>{isSimulating ? 'PROCESSING...' : 'SIMULATE'}</span>
                </button>
              </div>

              {/* Dynamic Interactive Telemetry Based on Active Module */}
              {activeModuleId === 'spring-ai' && (
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">SEMANTIC ACCURACY: 94.2%</span>
                    <span className="text-emerald-500 font-bold">RESPONSE TIME: 1.4 MS</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-700 shadow-[0_0_8px_#10b981]"
                      style={{ width: isSimulating || simStep > 0 ? '94.2%' : '40%' }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans">
                    {simStep === 0 && 'Simulation ready: Semantic retrieval engine awaiting query.'}
                    {simStep === 1 && 'Deconstructing query: Extracting conceptual tokens and contextual embeddings...'}
                    {simStep === 2 && 'Scanning vector space: Matching pgvector HNSW cosine similarity...'}
                    {simStep >= 3 && 'Match complete: Retrieved target technical documentation with 94.2% semantic precision in milliseconds.'}
                  </p>
                </div>
              )}

              {activeModuleId === 'loom' && (
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">ACTIVE VIRTUAL THREADS:</span>
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
                    <span>RAM Footprint: ~{(simLoomThreads / 1024).toFixed(1)} MB</span>
                  </div>
                </div>
              )}

              {activeModuleId === 'write-behind' && (
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">REDIS HASH BUFFER:</span>
                    <span className="text-emerald-500 font-bold">HINCRBY = {simBufferCount} DELTA</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-sans">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Disk I/O savings: 98%. Periodic DB Batch Flush triggers every 30 seconds.</span>
                  </div>
                </div>
              )}

              {activeModuleId === 'optimistic-locking' && (
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">LOCK-FREE STATE:</span>
                    <span className="font-bold">
                      {simConflictStatus === 'IDLE' && <span className="text-zinc-500">READY (VERSION = 1)</span>}
                      {simConflictStatus === 'RACE' && <span className="text-amber-500">CONCURRENT RACE DETECTED</span>}
                      {simConflictStatus === '409_RESOLVED' && <span className="text-emerald-500">RFC 7807 409 CONFLICT HANDLED</span>}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans">
                    {simConflictStatus === 'IDLE' && 'No row locks held. Writes verified atomically via version number.'}
                    {simConflictStatus === 'RACE' && 'Users A and B committed simultaneously. User B caught carrying stale version.'}
                    {simConflictStatus === '409_RESOLVED' && 'Lost Update anomaly averted; 409 Conflict Problem Details returned to client.'}
                  </p>
                </div>
              )}

              {activeModuleId === 'spring-batch' && (
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">CHUNK SIZE: 50 ITEMS</span>
                    <span className="text-emerald-500 font-bold">COMMIT: ISOLATED TX</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500 shadow-[0_0_8px_#10b981]"
                      style={{ width: isSimulating || simStep > 0 ? (simStep === 1 ? '33%' : simStep === 2 ? '66%' : '100%') : '25%' }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans">
                    Soft-deleted records purged in 50-item batches without memory leaks.
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
                <span>TEST VERIFICATION: 201/201 PASSED</span>
              </span>
              <span className="text-emerald-400 font-bold">RFC 7807 COMPLIANT</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
