// NovaBlog Enterprise - High Quality Mock Data for Vitrin / Offline Demo
// Hybrid Tech Publication: Deep Engineering Articles + Curated Dispatches (Haberler)

import { BlogDto, BlogCategoryDto, CommentResponseDto, BlogSemanticSearchResultDto } from '@/types/api';

export const MOCK_CATEGORIES: BlogCategoryDto[] = [
  { categoryId: 1, categoryName: 'Artificial Intelligence & AI', categoryDescription: 'Spring AI, LLM Integrations, Model Context Protocol, and Vector Databases' },
  { categoryId: 2, categoryName: 'Backend & Distributed Systems', categoryDescription: 'Spring Boot 4, Java 22/23 Loom, Virtual Threads, and Microservices Architecture' },
  { categoryId: 3, categoryName: 'Cloud & Infrastructure', categoryDescription: 'Cloud Architecture, Linux Kernel, Network Protocols, and Distributed Storage' },
  { categoryId: 4, categoryName: 'React & Modern Frontend', categoryDescription: 'React 19, Next.js 15/16, Turbopack, Tailwind CSS, and Web Standards' },
  { categoryId: 5, categoryName: 'Data & Batch ETL', categoryDescription: 'Spring Batch, PostgreSQL, and High-Volume Data Processing' },
  { categoryId: 6, categoryName: 'Cybersecurity & 2FA', categoryDescription: 'OAuth2, JWT, TOTP 2FA, and Zero-Trust Enterprise Defense' },
];

export const MOCK_BLOGS: BlogDto[] = [
  // --- 1. IN-DEPTH TECHNICAL ARTICLES (Long-Form) ---
  {
    id: 1,
    publicationType: 'article',
    header: 'Spring AI & Semantic Search',
    title: 'Spring AI and Intelligent Vector Database Architecture',
    content: `Traditional keyword-based scans in enterprise information systems fall short when trying to understand user intent and conceptual context.

## 1. Why Semantic Vector Retrieval?
When natural language text is projected into a multi-dimensional mathematical embedding space, synonymous terms and related concepts cluster close to one another. For instance, searching for "memory optimization" conceptually matches "JVM Garbage Collector tuning", even if those exact words never appear in the document.

\`\`\`java
@Component
public class VectorEmbeddingService {
    private final EmbeddingClient embeddingClient;

    public float[] generateEmbedding(String documentText) {
        // Transforms raw text into a semantic coordinate vector
        return embeddingClient.embed(documentText);
    }
}
\`\`\`

## 2. Hybrid Search & Intelligent Re-Ranking
Our search engine implements Reciprocal Rank Fusion (RRF):
- Classic keyword matching
- Dense vector similarity
- Unified hybrid relevance score

Through this architecture, users searching with natural phrasing receive accurate technical documentation within milliseconds.`,
    author: 'Abdullah Berke Ozder',
    views: 1420,
    likes: 189,
    isPublished: true,
    publishedAt: '2026-11-05T10:00:00Z',
    createdDate: '2026-11-05T09:30:00Z',
    category: MOCK_CATEGORIES[0],
    tags: ['artificial-intelligence', 'semantic-search', 'vector-database', 'spring-ai', 'smart-filter'],
    aiSummary: 'Spring AI and vector database architecture understanding user intent. Delivers 94% recall accuracy and sub-millisecond query responses over legacy SQL LIKE searches.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 2,
    publicationType: 'article',
    header: 'Java 22 & High Concurrency',
    title: 'Java 22 Virtual Threads and High-Throughput Request Dispatching',
    content: `One of the most foundational transformations in the Java runtime, Project Loom (Virtual Threads), replaces the traditional 1:1 OS carrier thread model with lightweight, user-mode execution units.

## 1. The Virtual Thread Paradigm
In conventional Spring Boot architectures, the Tomcat thread pool is throttled to ~200 carrier threads. Any blocking database I/O or REST call monopolizes an entire OS thread. Virtual threads decouple this by parking during blocking operations and releasing carrier threads to execute other work.

\`\`\`java
// Spawning lightweight execution units via Virtual Threads
Thread.ofVirtual()
      .name("virtual-worker-", 0)
      .start(() -> {
          // Blocking I/O operations will not suspend the underlying carrier thread
          fetchRemoteEnterpriseData();
      });
\`\`\`

## 2. Spring Boot 4 Integration
Enabling \`spring.threads.virtual.enabled=true\` in Spring Boot 4:
- Automatically offloads every HTTP request to a virtual thread.
- Reduces context-switching overhead by over 90%.
- Maintains a negligible memory footprint even under 10,000 concurrent socket connections.`,
    author: 'Abdullah Berke Ozder',
    views: 2840,
    likes: 312,
    isPublished: true,
    publishedAt: '2026-11-04T14:15:00Z',
    createdDate: '2026-11-04T13:00:00Z',
    category: MOCK_CATEGORIES[1],
    tags: ['java-22', 'virtual-threads', 'high-concurrency', 'spring-boot-4', 'performance'],
    aiSummary: 'Eliminating thread pool starvation with Java 22 Virtual Threads. Concurrent request capacity scales by 10x while reducing idle memory consumption by 90%.',
    hasVectorEmbedding: true,
    version: 2,
  },
  {
    id: 3,
    publicationType: 'article',
    header: 'Redis & High Traffic',
    title: 'Zeroing Database I/O Bottlenecks with Redis Write-Behind Buffering',
    content: `Under heavy traffic, issuing synchronous database writes to PostgreSQL for every page view and article clap leads to catastrophic disk I/O bottlenecks and row contention.

## 1. The Write-Behind Principle
NovaBlog never performs direct disk writes for high-frequency telemetry counters. Instead, metrics coalesce in Redis RAM memory using atomic operations and flush asynchronously in periodic batches.

\`\`\`java
@Service
public class RedisWriteBehindBuffer {
    @Autowired
    private StringRedisTemplate redisTemplate;

    public void incrementViewCount(Long blogId) {
        // Nanosecond in-memory counter incrementation
        redisTemplate.opsForValue().increment("blog:views:" + blogId);
    }
}
\`\`\`

## 2. Scheduled Batch Synchronization
A background worker flushes accumulated memory counts every 5 seconds using a single atomic batch SQL query. This reduces database write contention by over 85%.`,
    author: 'Abdullah Berke Ozder',
    views: 2150,
    likes: 245,
    isPublished: true,
    publishedAt: '2026-11-03T11:20:00Z',
    createdDate: '2026-11-03T10:00:00Z',
    category: MOCK_CATEGORIES[1],
    tags: ['redis', 'write-behind', 'cache-buffer', 'high-scale', 'performance'],
    aiSummary: 'Reducing disk write pressure by 85% with an in-memory Redis write-behind buffer. Lock-free metric aggregation prevents PostgreSQL row contention under thousands of concurrent readers.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 4,
    publicationType: 'article',
    header: 'Data Integrity & JPA',
    title: 'Preventing Data Loss with Optimistic Concurrency Control (OCC)',
    content: `In multi-tenant editorial platforms where multiple authors or administrators update records simultaneously, the "Last-Write-Wins" hazard silently wipes earlier revisions.

## 1. Collision Detection with JPA @Version
Hibernate tracks changes across mutations by attaching an automatic version token to entity models.

\`\`\`java
@Entity
public class BlogEntity {
    @Id
    @GeneratedValue
    private Long id;

    @Version
    private Integer version; // Hibernate version tracking token
}
\`\`\`

## 2. Handling Collisions
If two concurrent requests attempt to commit updates using the same version token, Hibernate throws an \`OptimisticLockException\`. The application traps the collision and alerts the author without discarding their unsaved input.`,
    author: 'Abdullah Berke Ozder',
    views: 980,
    likes: 88,
    isPublished: true,
    publishedAt: '2026-11-02T16:45:00Z',
    createdDate: '2026-11-02T15:30:00Z',
    category: MOCK_CATEGORIES[1],
    tags: ['jpa-hibernate', 'optimistic-locking', 'data-integrity', 'concurrency', 'security'],
    aiSummary: 'Guarding concurrent state mutations with JPA @Version optimistic locking. Eliminates race conditions and silent overwrites in multi-user editorial flows.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 5,
    publicationType: 'article',
    header: 'Spring Batch & Big Data',
    title: 'Large-Scale Data Retention Pipelines & Automated Chunk Purging',
    content: `As historical audit logs, analytical metrics, and soft-deleted entities accumulate, maintenance jobs quickly outgrow the capacity of standard synchronous HTTP request workers.

## 1. Chunk-Oriented Processing Pipeline
With Spring Batch 5, entities are processed in bounded transaction windows of 50 items each, preventing memory leaks and transaction rollbacks.

\`\`\`java
@Bean
public Step softDeleteCleanupStep(JobRepository jobRepository, PlatformTransactionManager txManager) {
    return new StepBuilder("cleanupStep", jobRepository)
        .<BlogEntity, BlogEntity>chunk(50, txManager)
        .reader(softDeletedBlogItemReader())
        .processor(expiredBlogItemProcessor())
        .writer(permanentDeleteBlogItemWriter())
        .faultTolerant()
        .retryLimit(3)
        .build();
}
\`\`\`

## 2. Fault Tolerance & Automatic Retries
- Automatic retry policies isolate transient network or disk hiccups.
- Bad records are diverted to dead-letter sinks without blocking valid rows.
- Full step execution status is journaled durably in the job repository schema.`,
    author: 'Abdullah Berke Ozder',
    views: 1190,
    likes: 95,
    isPublished: true,
    publishedAt: '2026-11-01T14:00:00Z',
    createdDate: '2026-11-01T13:30:00Z',
    category: MOCK_CATEGORIES[4],
    tags: ['spring-batch', 'big-data', 'etl-pipeline', 'postgresql', 'automation'],
    aiSummary: 'Processing millions of records without heap spikes using Spring Batch chunk-oriented pipelines. Built-in fault tolerance and automatic retries ensure bulletproof background maintenance.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 6,
    publicationType: 'article',
    header: 'Cybersecurity & 2FA',
    title: 'Hardening Authentication with RFC 6238 TOTP State Machines',
    content: `To defend privileged accounts against credential stuffing and leak hazards, time-based two-factor authentication (2FA) is an indispensable zero-trust requirement.

## 1. RFC 6238 Time-Based One-Time Passwords (TOTP)
The TOTP algorithm computes 6-digit verification codes by cryptographically hashing a base32 shared secret key against synchronized 30-second UNIX timestamp intervals.

\`\`\`java
public boolean verifyTotpCode(String base32Secret, int userCode) {
    long currentWindow = System.currentTimeMillis() / 1000L / 30L;
    // Inspect [-1, 0, +1] intervals to tolerate client clock drifts
    for (int i = -1; i <= 1; i++) {
        if (generateTotp(base32Secret, currentWindow + i) == userCode) {
            return true;
        }
    }
    return false;
}
\`\`\`

## 2. Emergency Recovery Codes
To safeguard access in the event of hardware token loss:
- Five unique 8-character emergency recovery codes are generated.
- Codes are hashed securely at rest using strong salted algorithms.
- Each code is marked invalid immediately upon first redemption.`,
    author: 'Abdullah Berke Ozder',
    views: 1750,
    likes: 144,
    isPublished: true,
    publishedAt: '2026-10-31T09:15:00Z',
    createdDate: '2026-10-31T08:45:00Z',
    category: MOCK_CATEGORIES[5],
    tags: ['cybersecurity', 'totp-2fa', 'zero-trust', 'cryptography', 'account-defense'],
    aiSummary: 'RFC 6238 compliant time-based one-time password (TOTP) verification. Seamlessly compatible with standard Authenticator applications and guarded by single-use recovery codes.',
    hasVectorEmbedding: true,
    version: 1,
  },

  // --- 2. CURATED TECH DISPATCHES (20 Curated Releases via Global Tech Press) ---

  // === CATEGORY 1: CLOUD & INFRASTRUCTURE (5 DISPATCHES) ===
  {
    id: 1001,
    publicationType: 'dispatch',
    header: 'CLOUD INFRASTRUCTURE & DATA TRANSIT',
    title: 'AWS and Cloudflare Form Zero-Egress Data Bridge Standard',
    content: `Egress fees—long the single greatest cost bottleneck for multi-cloud enterprise architectures—have been effectively neutralized through an automated interconnect agreement between Cloudflare and Amazon Web Services.

Large datasets stored in AWS S3 can now replicate directly into Cloudflare Workers and global Edge KV caches without incurring outbound bandwidth penalties.

### Key Architectural Gains:
- Complete elimination of multi-cloud vendor lock-in.
- Distributed analytical processing remains anchored in AWS while static media caches across 330+ global edge nodes.
- 40% reduction in measured P99 media distribution latency.`,
    author: 'Nova Tech Wire',
    authorTitle: 'Cloud Infrastructure Bureau',
    views: 3120,
    likes: 420,
    clapsCount: 420,
    isPublished: true,
    publishedAt: '2026-11-19T08:30:00Z',
    createdDate: '2026-11-19T08:00:00Z',
    category: MOCK_CATEGORIES[2],
    viaSource: 'The Cloudflare Blog',
    viaUrl: 'https://blog.cloudflare.com',
    editorialTake: 'Eliminating egress lock-in allows analytical processing pipelines to reside on AWS while delivering sub-millisecond edge cache hits globally.',
    isBreaking: true,
    readTimeMinutes: 3,
    tags: ['cloud', 'aws', 'cloudflare', 'egress', 'edge-computing'],
    aiSummary: 'Zero-egress transit agreement between AWS and Cloudflare dramatically cuts multi-cloud data transport costs while boosting edge delivery speeds.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1002,
    publicationType: 'dispatch',
    header: 'KERNEL ARCHITECTURE & REAL-TIME',
    title: 'Linux Kernel 6.12 Officially Releases with Full PREEMPT_RT Support',
    content: `Long maintained as an external out-of-tree patch for high-frequency financial order books and industrial robotics, the PREEMPT_RT patchset has officially merged into Linux Kernel 6.12 mainline.

Standard Linux distributions can now be compiled with deterministic interrupt response guarantees directly out of the box.

### Key Architectural Gains:
- In-kernel spinlock and interrupt latency dropped below 5 microseconds.
- Garbage collection and thread context switch jitter eliminated in high-throughput trading engines.
- Standalone RTOS layers are no longer required on commodity LTS server hardware.`,
    author: 'Nova Tech Wire',
    authorTitle: 'Systems & OS Reporter',
    views: 2450,
    likes: 310,
    clapsCount: 310,
    isPublished: true,
    publishedAt: '2026-11-18T14:10:00Z',
    createdDate: '2026-11-18T13:40:00Z',
    category: MOCK_CATEGORIES[2],
    viaSource: 'Phoronix & Kernel.org',
    viaUrl: 'https://www.phoronix.com',
    editorialTake: 'Mainline real-time scheduling in Linux 6.12 unlocks sub-5 microsecond deterministic guarantees on commodity hardware without custom RTOS kernels.',
    isBreaking: false,
    readTimeMinutes: 4,
    tags: ['linux', 'kernel-6-12', 'preempt-rt', 'low-latency', 'systems'],
    aiSummary: 'PREEMPT_RT merged into mainline Linux 6.12, providing deterministic microsecond scheduling for mission-critical trading and telecom systems.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1003,
    publicationType: 'dispatch',
    header: 'OBSERVABILITY & eBPF',
    title: 'OpenTelemetry and eBPF Standardization: Distributed Tracing with Zero Instrumentation',
    content: `The Cloud Native Computing Foundation (CNCF) has solidified eBPF (Extended Berkeley Packet Filter) as a first-class citizen under the OpenTelemetry framework.

Developers are no longer required to inject manual SDKs, byte-code agents, or sidecars into production service code to capture distributed traces.

### Key Architectural Gains:
- CPU and memory observability overhead reduced from 12% to under 0.4%.
- Inter-service P99 latency anomalies mapped instantaneously across kernel sockets.
- Distributed tracing configuration drift and instrumentation bugs completely eliminated.`,
    author: 'Nova Tech Wire',
    authorTitle: 'Observability Architect',
    views: 1890,
    likes: 275,
    clapsCount: 275,
    isPublished: true,
    publishedAt: '2026-11-17T11:45:00Z',
    createdDate: '2026-11-17T11:15:00Z',
    category: MOCK_CATEGORIES[2],
    viaSource: 'The New Stack',
    viaUrl: 'https://thenewstack.io',
    editorialTake: 'Zero-instrumentation tracing via kernel eBPF probes captures all HTTP, gRPC, and socket telemetry without touching application code.',
    isBreaking: false,
    readTimeMinutes: 3,
    tags: ['opentelemetry', 'ebpf', 'observability', 'distributed-systems', 'cncf'],
    aiSummary: 'CNCF OpenTelemetry and eBPF integration provides deep distributed tracing and socket observability with less than 0.5% CPU overhead.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1004,
    publicationType: 'dispatch',
    header: 'HARDWARE & INDEPENDENT CLOUD',
    title: 'Hetzner and European Sovereign Clouds Roll Out NVMe-over-Fabrics and ARM Neoverse',
    content: `Accelerated by European data sovereignty mandates and power efficiency benchmarks, independent cloud providers are upgrading infrastructure with NVMe-over-Fabrics (NVMe-oF) and ARM Neoverse V2 silicon.

Hetzner and OVHcloud report 45% higher performance-per-watt efficiency in their newest bare-metal lineups compared to legacy x86 architectures.

### Key Architectural Gains:
- NVMe-oF remote block storage latency benchmarked at under 12 microseconds over 100GbE RoCEv2 fabrics.
- ARM Neoverse V2 cores deliver 35% higher throughput on PostgreSQL and Redis workloads compared to equivalent x86 instances.
- 50% reduction in rack-level thermal dissipation and operational power draw.`,
    author: 'Nova Tech Wire',
    authorTitle: 'Infrastructure Analyst',
    views: 1650,
    likes: 210,
    clapsCount: 210,
    isPublished: true,
    publishedAt: '2026-11-16T16:20:00Z',
    createdDate: '2026-11-16T15:50:00Z',
    category: MOCK_CATEGORIES[2],
    viaSource: 'Ars Technica',
    viaUrl: 'https://arstechnica.com',
    editorialTake: 'NVMe-over-Fabrics with RoCEv2 eliminates remote block storage bottlenecks, giving independent clouds hyperscaler-grade I/O at a fraction of the cost.',
    isBreaking: false,
    readTimeMinutes: 3,
    tags: ['arm-neoverse', 'hetzner', 'nvme-of', 'hardware', 'sovereign-cloud'],
    aiSummary: 'European clouds adopt ARM Neoverse V2 and NVMe-over-Fabrics, delivering 45% better power efficiency and sub-12 microsecond remote storage access.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1005,
    publicationType: 'dispatch',
    header: 'NETWORK PROTOCOLS & QUIC',
    title: 'HTTP/3 and QUIC Protocol Surpasses 35% of Global Internet Traffic',
    content: `Transport Layer metrics published by Cloudflare and Google confirm that HTTP/3 over UDP-based QUIC now carries over 35% of all live global web transactions.

By eliminating Head-of-Line (HoL) blocking on congested packet networks, QUIC fundamentally outperforms legacy TCP+TLS handshake cycles.

### Key Architectural Gains:
- Single-round-trip 0-RTT connection re-establishment on mobile handoffs.
- Packet loss on mobile cellular links no longer stalls concurrent multiplexed streams.
- 18% improvement in First Contentful Paint (FCP) across unstable mobile networks.`,
    author: 'Nova Tech Wire',
    authorTitle: 'Network Protocol Specialist',
    views: 2100,
    likes: 290,
    clapsCount: 290,
    isPublished: true,
    publishedAt: '2026-11-15T09:00:00Z',
    createdDate: '2026-11-15T08:30:00Z',
    category: MOCK_CATEGORIES[2],
    viaSource: 'Cloudflare Radar',
    viaUrl: 'https://radar.cloudflare.com',
    editorialTake: 'Multiplexed streams without Head-of-Line blocking make QUIC and HTTP/3 essential for low-latency global delivery on unreliable connections.',
    isBreaking: false,
    readTimeMinutes: 2,
    tags: ['http3', 'quic', 'networking', 'latency', 'web-protocols'],
    aiSummary: 'HTTP/3 over QUIC exceeds 35% global traffic share, eliminating Head-of-Line blocking and improving mobile connection resumption to 0-RTT.',
    hasVectorEmbedding: true,
    version: 1,
  },

  // === CATEGORY 2: AI DEVELOPMENT & AGENTS (5 DISPATCHES) ===
  {
    id: 1006,
    publicationType: 'dispatch',
    header: 'AI AGENTS & MCP PROTOCOL',
    title: 'Anthropic Model Context Protocol (MCP) Open-Source Standardization',
    content: `Anthropic has open-sourced the Model Context Protocol (MCP), establishing an industry-standard interface between Large Language Models (LLMs) and external enterprise data stores, file systems, and API endpoints.

Supported by major developer platforms, MCP provides a unified client-server architecture for autonomous agent tool execution.

### Key Architectural Gains:
- Standardized JSON-RPC protocol replaces ad-hoc API adapter glue code.
- Granular permission boundaries isolate local filesystems and databases from prompt injection.
- Seamless multi-agent interoperability across diverse enterprise tool ecosystems.`,
    author: 'Dr. Selin Demir',
    authorTitle: 'Principal AI Researcher',
    views: 4520,
    likes: 680,
    clapsCount: 680,
    isPublished: true,
    publishedAt: '2026-11-20T10:15:00Z',
    createdDate: '2026-11-20T09:45:00Z',
    category: MOCK_CATEGORIES[0],
    viaSource: 'Anthropic Engineering',
    viaUrl: 'https://www.anthropic.com/news/model-context-protocol',
    editorialTake: 'Replacing fragile ad-hoc API wrappers with a standardized MCP server interface brings enterprise-grade security and modularity to LLM tool execution.',
    isBreaking: true,
    readTimeMinutes: 4,
    tags: ['mcp', 'anthropic', 'agentic-ai', 'developer-tools', 'llm-standards'],
    aiSummary: 'Model Context Protocol (MCP) open-sourced by Anthropic to standardize how autonomous AI agents interface with tools, databases, and APIs.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1007,
    publicationType: 'dispatch',
    header: 'ENTERPRISE AI & SPRING',
    title: 'Spring AI 1.0 Milestone: Structured Outputs and Multi-Agent Advisors',
    content: `The Spring engineering team has announced the 1.0 Milestone of Spring AI, introducing native typed JSON Schema structured output extraction and modular multi-agent advisor chains.

Enterprise Java applications can now safely interface with frontier LLMs while preserving strong compile-time type safety.

### Key Architectural Gains:
- Guaranteed type-safe JSON parsing backed by Jackson and Bean validation models.
- Modular Advisor chains intercept prompt pipelines for toxicity screening, token budgeting, and RAG injection.
- Native integration with PostgreSQL pgvector, Milvus, and Redis vector stores.`,
    author: 'Dr. Selin Demir',
    authorTitle: 'Principal AI Researcher',
    views: 3100,
    likes: 415,
    clapsCount: 415,
    isPublished: true,
    publishedAt: '2026-11-19T13:00:00Z',
    createdDate: '2026-11-19T12:30:00Z',
    category: MOCK_CATEGORIES[0],
    viaSource: 'Spring.io Blog',
    viaUrl: 'https://spring.io/blog',
    editorialTake: 'Spring AI 1.0 bridges enterprise Java rigor and frontier generative models, enforcing strict JSON Schema contracts and modular pipeline advisors.',
    isBreaking: false,
    readTimeMinutes: 3,
    tags: ['spring-ai', 'java', 'structured-outputs', 'rag', 'enterprise-ai'],
    aiSummary: 'Spring AI 1.0 Milestone brings typed structured outputs, modular agent advisors, and production-grade vector store abstractions to the JVM.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1008,
    publicationType: 'dispatch',
    header: 'VECTOR DATABASES & PGVECTOR',
    title: 'PostgreSQL pgvector 0.8: 10x Faster HNSW Indexing with AVX-512 SIMD',
    content: `The open-source pgvector team has released version 0.8, implementing hardware-accelerated AVX-512 and ARM SVE vector math routines alongside parallel HNSW graph construction.

PostgreSQL instances can now index multi-million embedding vector datasets up to ten times faster while reducing memory footprint.

### Key Architectural Gains:
- HNSW index build time reduced by 10x via AVX-512 vector distance primitives.
- Half-precision (fp16) and scalar quantization (int8) storage options reduce RAM usage by up to 75%.
- Zero-downtime concurrent index builds under continuous live production insertion.`,
    author: 'Dr. Selin Demir',
    authorTitle: 'Principal AI Researcher',
    views: 2950,
    likes: 380,
    clapsCount: 380,
    isPublished: true,
    publishedAt: '2026-11-18T10:30:00Z',
    createdDate: '2026-11-18T10:00:00Z',
    category: MOCK_CATEGORIES[0],
    viaSource: 'PostgreSQL News',
    viaUrl: 'https://www.postgresql.org',
    editorialTake: 'Hardware-accelerated AVX-512 SIMD vector math makes PostgreSQL pgvector a formidable alternative to dedicated vector databases like Pinecone.',
    isBreaking: false,
    readTimeMinutes: 3,
    tags: ['pgvector', 'hnsw', 'postgresql', 'vector-search', 'simd'],
    aiSummary: 'pgvector 0.8 leverages AVX-512 SIMD and quantization to achieve 10x faster HNSW indexing and a 75% reduction in vector memory consumption.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1009,
    publicationType: 'dispatch',
    header: 'OPEN WEIGHT MODELS & LLAMA',
    title: 'Meta Llama 3.3 70B: GPT-4 Class Reasoning in Open Source',
    content: `Meta has unveiled Llama 3.3 70B, matching the reasoning, coding, and benchmark performance of early closed-source frontier models while running efficiently on commodity dual-GPU hardware.

The model is released under an open commercial license with 128k context window support.

### Key Architectural Gains:
- Matches GPT-4 and Claude 3.5 Sonnet class reasoning on standard MMLU-Pro and HumanEval benchmarks.
- Fits onto dual NVIDIA RTX 4090 or single A100 GPU systems with 4-bit AWQ/EXL2 quantization.
- Native multilingual support with high precision across enterprise technical documentation.`,
    author: 'Dr. Selin Demir',
    authorTitle: 'Principal AI Researcher',
    views: 3800,
    likes: 540,
    clapsCount: 540,
    isPublished: true,
    publishedAt: '2026-11-17T15:45:00Z',
    createdDate: '2026-11-17T15:15:00Z',
    category: MOCK_CATEGORIES[0],
    viaSource: 'Hugging Face & Meta AI',
    viaUrl: 'https://huggingface.co/blog',
    editorialTake: 'Llama 3.3 70B brings frontier reasoning capabilities to private on-premise infrastructure, eliminating data sovereignty and API cost trade-offs.',
    isBreaking: false,
    readTimeMinutes: 3,
    tags: ['llama-3-3', 'meta-ai', 'open-weights', 'inference', 'huggingface'],
    aiSummary: 'Meta releases Llama 3.3 70B with 128k context, delivering GPT-4 tier reasoning performance on accessible open-weight dual-GPU hardware.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1010,
    publicationType: 'dispatch',
    header: 'AGENT FRAMEWORKS & BENCHMARKS',
    title: 'LangChain vs Semantic Kernel vs Spring AI: 2026 Enterprise Agent Matrix',
    content: `Independent architecture audits published across InfoQ and The New Stack evaluate the leading enterprise AI orchestration frameworks across latency, memory safety, and thread concurrency.

The audit compares Python-first ecosystems against JVM and .NET native enterprise agent platforms.

### Key Architectural Gains:
- Spring AI and Virtual Threads demonstrate the highest concurrency throughput, handling 10,000 parallel agent tasks with zero thread exhaustion.
- Semantic Kernel leads in enterprise Microsoft Azure RBAC and token validation ergonomics.
- LangChain / LangGraph excels in rapid prototyping but requires careful memory management under sustained production loads.`,
    author: 'Dr. Selin Demir',
    authorTitle: 'Principal AI Researcher',
    views: 2600,
    likes: 340,
    clapsCount: 340,
    isPublished: true,
    publishedAt: '2026-11-16T12:00:00Z',
    createdDate: '2026-11-16T11:30:00Z',
    category: MOCK_CATEGORIES[0],
    viaSource: 'InfoQ Architecture',
    viaUrl: 'https://www.infoq.com',
    editorialTake: 'For high-concurrency microservices, Spring AI combined with Java 22 Virtual Threads delivers unmatched throughput and memory safety for multi-agent workflows.',
    isBreaking: false,
    readTimeMinutes: 4,
    tags: ['agentic-ai', 'infoq', 'spring-ai', 'semantic-kernel', 'benchmarks'],
    aiSummary: 'Benchmarking LangChain, Semantic Kernel, and Spring AI reveals JVM and Virtual Threads achieve top concurrency and memory isolation in enterprise agent workloads.',
    hasVectorEmbedding: true,
    version: 1,
  },

  // === CATEGORY 3: REACT & MODERN FRONTEND (5 DISPATCHES) ===
  {
    id: 1011,
    publicationType: 'dispatch',
    header: 'FRONTEND CORE & REACT 19',
    title: 'React 19 Stable Release: useActionState, useOptimistic, and Automatic Memoization',
    content: `The React core team has released React 19 stable, establishing Server Actions, the React Compiler, and native optimistic UI primitives as standard web building blocks.

Manual \`useMemo\` and \`useCallback\` annotations are rendered obsolete by compiler-level AST optimizations.

### Key Architectural Gains:
- \`useOptimistic\` provides instant tactile feedback on user actions before network round-trips complete.
- \`useActionState\` streamlines asynchronous form mutations and pending transitions without boilerplate.
- The React Compiler automatically optimizes re-renders across deeply nested component trees.`,
    author: 'Caner Aydin',
    authorTitle: 'Staff Frontend Architect',
    views: 5200,
    likes: 790,
    clapsCount: 790,
    isPublished: true,
    publishedAt: '2026-11-19T11:00:00Z',
    createdDate: '2026-11-19T10:30:00Z',
    category: MOCK_CATEGORIES[3],
    viaSource: 'React Dev Blog',
    viaUrl: 'https://react.dev/blog',
    editorialTake: 'Native optimistic UI primitives and compiler-level auto-memoization give skeuomorphic web applications physical tactile responsiveness without boilerplate.',
    isBreaking: true,
    readTimeMinutes: 4,
    tags: ['react-19', 'actions', 'useoptimistic', 'react-compiler', 'web-perf'],
    aiSummary: 'React 19 reaches general availability, introducing native optimistic updates, action state hooks, and automated memoization via the React Compiler.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1012,
    publicationType: 'dispatch',
    header: 'BUNDLER ENGINE & NEXT.JS',
    title: 'Next.js 15/16 and Turbopack Default: 76% Faster HMR Performance',
    content: `Vercel has confirmed Turbopack as the default development and production bundler in Next.js 15 and 16, replacing legacy Webpack pipelines.

Engineered in Rust, Turbopack utilizes incremental computation graphs to accelerate compilation across complex enterprise codebases.

### Key Architectural Gains:
- Hot Module Replacement (HMR) speeds increased by up to 76% in projects with over 5,000 components.
- Initial server startup latency reduced from 14 seconds to under 1.8 seconds.
- Native async request cookies and headers API prevent accidental client-side data leaks.`,
    author: 'Caner Aydin',
    authorTitle: 'Staff Frontend Architect',
    views: 3400,
    likes: 470,
    clapsCount: 470,
    isPublished: true,
    publishedAt: '2026-11-18T17:15:00Z',
    createdDate: '2026-11-18T16:45:00Z',
    category: MOCK_CATEGORIES[3],
    viaSource: 'Vercel News',
    viaUrl: 'https://vercel.com/blog',
    editorialTake: 'Rust-powered incremental bundler graphs make Turbopack an indispensable productivity engine for massive skeuomorphic desktop web apps.',
    isBreaking: false,
    readTimeMinutes: 3,
    tags: ['nextjs-15', 'turbopack', 'rust', 'hmr', 'vercel'],
    aiSummary: 'Turbopack becomes the default bundler in Next.js, achieving 76% faster hot module reloading and sub-2 second cold boot times in large codebases.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1013,
    publicationType: 'dispatch',
    header: 'STYLE ENGINE & TAILWIND V4',
    title: 'Tailwind CSS v4 Transitions to CSS-First Architecture with Oxide Engine',
    content: `Tailwind Labs has released Tailwind CSS v4, completely rewriting the styling engine from JavaScript into high-performance Rust (Oxide) and shifting to native \`@theme\` CSS configuration.

The build step is up to 10x faster with zero legacy JavaScript configuration files required.

### Key Architectural Gains:
- Full build passes execute in under 15 milliseconds thanks to the Rust-based Oxide compiler.
- Direct CSS-first configuration via \`@theme\` removes the need for \`tailwind.config.js\`.
- Native modern CSS features like \`@layer\`, CSS nesting, and \`color-mix()\` supported without preprocessors.`,
    author: 'Caner Aydin',
    authorTitle: 'Staff Frontend Architect',
    views: 2800,
    likes: 390,
    clapsCount: 390,
    isPublished: true,
    publishedAt: '2026-11-17T09:30:00Z',
    createdDate: '2026-11-17T09:00:00Z',
    category: MOCK_CATEGORIES[3],
    viaSource: 'Tailwind Labs',
    viaUrl: 'https://tailwindcss.com/blog',
    editorialTake: 'The Oxide engine redefines build performance, compiling complex retro styling layers and color matrices in single-digit milliseconds.',
    isBreaking: false,
    readTimeMinutes: 3,
    tags: ['tailwindcss', 'oxide', 'css4', 'frontend-build', 'ui-performance'],
    aiSummary: 'Tailwind CSS v4 introduces the Rust Oxide engine and CSS-first @theme directive, accelerating stylesheet compilation by 10x.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1014,
    publicationType: 'dispatch',
    header: 'WEB STANDARDS & BASELINE 2026',
    title: 'Web Platform Baseline 2026: CSS Subgrid, Popover API, and View Transitions',
    content: `The WebDX Community Group and major browser vendors have locked in Baseline 2026 standards, ensuring uniform cross-browser support for modern layout and transition APIs.

Desktop web applications can now utilize native browser primitives instead of bulky JavaScript polyfills.

### Key Architectural Gains:
- Native Popover API and \`<dialog>\` elements replace cumbersome third-party modal and floating UI libraries.
- CSS View Transitions enable seamless fluid page navigation animations across multi-page workflows.
- CSS Subgrid establishes perfectly aligned nested column hierarchies across complex dashboard layouts.`,
    author: 'Caner Aydin',
    authorTitle: 'Staff Frontend Architect',
    views: 2150,
    likes: 310,
    clapsCount: 310,
    isPublished: true,
    publishedAt: '2026-11-16T14:40:00Z',
    createdDate: '2026-11-16T14:10:00Z',
    category: MOCK_CATEGORIES[3],
    viaSource: 'Web.dev & Google Chrome',
    viaUrl: 'https://web.dev',
    editorialTake: 'Baseline 2026 allows complex windowing, popovers, and smooth view transitions to run entirely on native browser engines without heavy polyfills.',
    isBreaking: false,
    readTimeMinutes: 2,
    tags: ['baseline-2026', 'view-transitions', 'popover-api', 'css-subgrid', 'standards'],
    aiSummary: 'Baseline 2026 achieves universal browser support for Popover API, View Transitions, and CSS Subgrid, reducing frontend bundle weight.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1015,
    publicationType: 'dispatch',
    header: 'STREAMING & REAL-TIME DATA',
    title: 'Real-Time Event Streams with TanStack Query v5 and Server-Sent Events (SSE)',
    content: `TanStack Query v5 has introduced standardized adapters for Server-Sent Events (SSE) and persistent reactive streams, bridging client caches with continuous backend event flows.

Applications can subscribe to live telemetry feeds without maintaining expensive full-duplex WebSocket connections.

### Key Architectural Gains:
- Server-Sent Events consume negligible server overhead compared to long-lived WebSocket handshakes.
- Automatic cache invalidation and query cache updates triggered directly by incoming server push events.
- Built-in reconnection backoff and stream recovery over standard HTTP/2 and HTTP/3 multiplexed connections.`,
    author: 'Caner Aydin',
    authorTitle: 'Staff Frontend Architect',
    views: 1980,
    likes: 260,
    clapsCount: 260,
    isPublished: true,
    publishedAt: '2026-11-15T13:10:00Z',
    createdDate: '2026-11-15T12:40:00Z',
    category: MOCK_CATEGORIES[3],
    viaSource: 'Medium Frontend Engineering',
    viaUrl: 'https://medium.com',
    editorialTake: 'Server-Sent Events combined with TanStack Query provide lightweight real-time telemetry streaming over standard HTTP without WebSocket operational overhead.',
    isBreaking: false,
    readTimeMinutes: 3,
    tags: ['tanstack-query', 'sse', 'realtime-data', 'react-state', 'medium'],
    aiSummary: 'TanStack Query v5 integrates Server-Sent Events (SSE) for lightweight real-time data streaming and automatic reactive cache synchronization.',
    hasVectorEmbedding: true,
    version: 1,
  },

  // === CATEGORY 4: BACKEND & DISTRIBUTED SYSTEMS (5 DISPATCHES) ===
  {
    id: 1016,
    publicationType: 'dispatch',
    header: 'JAVA RUNTIME & AMBER',
    title: 'Java 23 and Project Amber: Pattern Matching for Primitives and Stream Gatherers',
    content: `The OpenJDK community has shipped Java 23, finalizing Project Amber productivity enhancements including primitive pattern matching and flexible Stream Gatherers.

Developers can now author concise, expressive domain logic with zero autoboxing performance penalties.

### Key Architectural Gains:
- Pattern matching across primitive types eliminates unnecessary wrapper object allocations in high-frequency data pipelines.
- Stream Gatherers (JEP 473) allow custom intermediate stream operations like windowing, folding, and rate-limiting.
- Markdown documentation comments in source code render beautifully directly inside IDE tooltips.`,
    author: 'Abdullah Berke Ozder',
    authorTitle: 'Senior Systems Architect',
    views: 4100,
    likes: 580,
    clapsCount: 580,
    isPublished: true,
    publishedAt: '2026-11-20T08:00:00Z',
    createdDate: '2026-11-20T07:30:00Z',
    category: MOCK_CATEGORIES[1],
    viaSource: 'Oracle Java Magazine',
    viaUrl: 'https://blogs.oracle.com/java',
    editorialTake: 'Stream Gatherers and primitive pattern matching give Java 23 developers expressive data pipeline abstractions without sacrificing CPU cache locality.',
    isBreaking: true,
    readTimeMinutes: 4,
    tags: ['java-23', 'stream-gatherers', 'pattern-matching', 'jvm', 'amber'],
    aiSummary: 'Java 23 introduces Stream Gatherers and primitive pattern matching, delivering expressive stream processing without autoboxing overhead.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1017,
    publicationType: 'dispatch',
    header: 'NATIVE IMAGE & SPRING BOOT 3.4',
    title: 'Spring Boot 3.4 and GraalVM Native Image: 80ms Cold Starts',
    content: `The Spring Boot 3.4 release introduces refined Ahead-of-Time (AOT) compilation heuristics and deep GraalVM native image optimizations.

Microservices compile into standalone native Linux binaries that boot in double-digit milliseconds with a fraction of the baseline memory footprint.

### Key Architectural Gains:
- Cold start bootstrap latency reduced from 2.5 seconds on the JVM to under 80 milliseconds in native images.
- Base memory footprint drops from 280MB to 32MB, making serverless container scaling highly cost-efficient.
- Native build times reduced by 40% through shared static analysis caching.`,
    author: 'Abdullah Berke Ozder',
    authorTitle: 'Senior Systems Architect',
    views: 3350,
    likes: 460,
    clapsCount: 460,
    isPublished: true,
    publishedAt: '2026-11-19T15:20:00Z',
    createdDate: '2026-11-19T14:50:00Z',
    category: MOCK_CATEGORIES[1],
    viaSource: 'Spring.io Release',
    viaUrl: 'https://spring.io/blog',
    editorialTake: 'Sub-100 millisecond cold starts make Spring Boot 3.4 native images a premier choice for autoscaling serverless microservices and edge nodes.',
    isBreaking: false,
    readTimeMinutes: 3,
    tags: ['spring-boot-3-4', 'graalvm', 'native-image', 'aot', 'microservices'],
    aiSummary: 'Spring Boot 3.4 and GraalVM Native Image achieve 80ms cold boots and 32MB baseline RAM consumption for elastic container workloads.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1018,
    publicationType: 'dispatch',
    header: 'RELATIONAL ENGINES & POSTGRESQL 17',
    title: 'PostgreSQL 17 Released: Enhanced Memory Management and Optimized Vacuum',
    content: `The PostgreSQL Global Development Group has released PostgreSQL 17, delivering a ground-up redesign of memory management for VACUUM maintenance operations and native JSON_TABLE support.

High-write production databases experience dramatically reduced vacuum lock overhead and disk thrashing.

### Key Architectural Gains:
- VACUUM operations consume up to 20x less memory while accelerating cleanup sweeps on high-write transaction tables.
- Native SQL/JSON \`JSON_TABLE\` simplifies querying semi-structured documents into relational result sets.
- Logical replication failover control ensures seamless failover promotion across high-availability clusters.`,
    author: 'Abdullah Berke Ozder',
    authorTitle: 'Senior Systems Architect',
    views: 2900,
    likes: 385,
    clapsCount: 385,
    isPublished: true,
    publishedAt: '2026-11-18T12:00:00Z',
    createdDate: '2026-11-18T11:30:00Z',
    category: MOCK_CATEGORIES[1],
    viaSource: 'PostgreSQL Community',
    viaUrl: 'https://www.postgresql.org/about/news',
    editorialTake: 'Redesigned VACUUM memory structures eliminate disk thrashing on write-heavy tables, preserving sub-millisecond query performance under sustained load.',
    isBreaking: false,
    readTimeMinutes: 3,
    tags: ['postgresql-17', 'vacuum-optimization', 'json-table', 'sql-tuning', 'database'],
    aiSummary: 'PostgreSQL 17 launches with a 20x memory-optimized VACUUM engine, native JSON_TABLE functions, and hardened high-availability replication.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1019,
    publicationType: 'dispatch',
    header: 'IN-MEMORY CACHE & REDIS 7.4',
    title: 'Redis 7.4 Community Edition: Hash Field Expiration and Multi-Vector Indexing',
    content: `Redis 7.4 introduces long-awaited granular Hash Field Expiration (HEXPIRE) and multi-vector search index capabilities directly to the core in-memory engine.

Engineers can now attach precise TTL policies to individual hash fields without deleting or duplicating parent key objects.

### Key Architectural Gains:
- \`HEXPIRE\` allows per-field TTL eviction inside Redis Hashes, dramatically simplifying user session and ephemeral token management.
- Multi-vector indexing enables searching multiple embedding representations per record in a single memory lookup.
- 15% reduction in memory overhead for high-density integer hash maps.`,
    author: 'Abdullah Berke Ozder',
    authorTitle: 'Senior Systems Architect',
    views: 2450,
    likes: 320,
    clapsCount: 320,
    isPublished: true,
    publishedAt: '2026-11-17T14:15:00Z',
    createdDate: '2026-11-17T13:45:00Z',
    category: MOCK_CATEGORIES[1],
    viaSource: 'Redis Ltd & Hacker News',
    viaUrl: 'https://news.ycombinator.com',
    editorialTake: 'Granular Hash Field Expiration (HEXPIRE) eliminates custom TTL workarounds, making Redis an even sharper tool for temporary session buffers.',
    isBreaking: false,
    readTimeMinutes: 3,
    tags: ['redis-7-4', 'hash-field-expiration', 'in-memory', 'caching', 'hacker-news'],
    aiSummary: 'Redis 7.4 adds Hash Field Expiration (HEXPIRE) and multi-vector search, optimizing per-field TTL management in memory-constrained environments.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1020,
    publicationType: 'dispatch',
    header: 'DISTRIBUTED DATA & CDC',
    title: 'The Distributed Transaction Dilemma: Outbox Pattern and Debezium CDC Over 2PC',
    content: `Modern cloud-native architectures are definitively retiring heavy Two-Phase Commit (2PC) protocols in favor of the Transactional Outbox Pattern paired with Debezium Change Data Capture (CDC).

By decoupling database transactions from downstream event message dispatching, systems achieve true eventual consistency with zero distributed locking.

### Key Architectural Gains:
- Local database transactions atomically insert business records and outbox events in a single ACID commit.
- Debezium tails PostgreSQL Write-Ahead Logs (WAL) with zero impact on active OLTP query throughput.
- Eliminates distributed transaction deadlocks and guarantees at-least-once message delivery to Apache Kafka.`,
    author: 'Abdullah Berke Ozder',
    authorTitle: 'Senior Systems Architect',
    views: 3600,
    likes: 495,
    clapsCount: 495,
    isPublished: true,
    publishedAt: '2026-11-16T10:45:00Z',
    createdDate: '2026-11-16T10:15:00Z',
    category: MOCK_CATEGORIES[1],
    viaSource: 'InfoQ Software Architecture',
    viaUrl: 'https://www.infoq.com',
    editorialTake: 'Tailing the PostgreSQL WAL with Debezium replaces fragile distributed locks with rock-solid, high-throughput asynchronous event publishing.',
    isBreaking: false,
    readTimeMinutes: 4,
    tags: ['transactional-outbox', 'debezium', 'event-driven', 'cdc', 'infoq'],
    aiSummary: 'Adopting the Transactional Outbox Pattern and Debezium CDC over 2PC eliminates distributed locking while guaranteeing atomic event publication.',
    hasVectorEmbedding: true,
    version: 1,
  },
];

export const MOCK_COMMENTS: Record<number, CommentResponseDto[]> = {
  1: [
    {
      id: 101,
      blogId: 1,
      content: 'The vector search and cosine similarity architecture is brilliantly executed! The hybrid RRF ranker delivers exceptional relevance.',
      authorName: 'Caner Aydin (Senior AI Engineer)',
      createdAt: '2026-11-05T12:30:00Z',
      isApproved: true,
      sentiment: 'POSITIVE',
    },
    {
      id: 102,
      blogId: 1,
      content: 'Integrating Spring AI with pgvector is a game changer for enterprise architectures.',
      authorName: 'Elif Yilmaz (Tech Lead)',
      createdAt: '2026-11-05T14:10:00Z',
      isApproved: true,
      sentiment: 'POSITIVE',
    },
  ],
  2: [
    {
      id: 201,
      blogId: 2,
      content: 'Virtual Threads bring Spring Boot 4 performance to an entirely new level; the Loom carrier thread unpinning analysis is deeply instructive.',
      authorName: 'Mehmet Kaya (DevOps Lead)',
      createdAt: '2026-11-04T16:00:00Z',
      isApproved: true,
      sentiment: 'POSITIVE',
    },
  ],
  1006: [
    {
      id: 601,
      blogId: 1006,
      content: 'Model Context Protocol (MCP) has the capability to unify the whole industry around one open protocol. Tested with Claude Desktop and works seamlessly.',
      authorName: 'Arda Guler (DevOps Lead)',
      createdAt: '2026-11-20T11:00:00Z',
      isApproved: true,
      sentiment: 'POSITIVE',
    },
  ],
  1011: [
    {
      id: 701,
      blogId: 1011,
      content: 'React 19 useOptimistic delivers that instantaneous tactile physical feedback we look for on skeuomorphic buttons without any boilerplate.',
      authorName: 'Zeynep Ak (Frontend Specialist)',
      createdAt: '2026-11-19T12:45:00Z',
      isApproved: true,
      sentiment: 'POSITIVE',
    },
  ],
};

export const MOCK_SEMANTIC_RESULTS: BlogSemanticSearchResultDto[] = [
  {
    blog: MOCK_BLOGS[0],
    similarityScore: 0.942,
    matchedKeywords: ['spring-ai', 'vektor-arama', 'anlamsal-arama', 'yapay-zeka'],
    searchMode: 'SEMANTIC',
    explanation: '94.2% semantic convergence identified between user query concept and vector embedding space.',
  },
  {
    blog: MOCK_BLOGS[1],
    similarityScore: 0.815,
    matchedKeywords: ['spring-boot-4', 'concurrency', 'threads'],
    searchMode: 'HYBRID',
    explanation: 'Ranked top tier in hybrid ranking under modern backend architecture and high scalability context.',
  },
  {
    blog: MOCK_BLOGS[2],
    similarityScore: 0.768,
    matchedKeywords: ['redis', 'write-behind', 'performance'],
    searchMode: 'SEMANTIC',
    explanation: 'Strong semantic proximity identified across caching and distributed counter aggregation concepts.',
  },
  {
    blog: MOCK_BLOGS[6], // 1001 (AWS & Cloudflare Egress)
    similarityScore: 0.890,
    matchedKeywords: ['cloud', 'egress', 'cloudflare', 'aws'],
    searchMode: 'SEMANTIC',
    explanation: 'High relevance detected regarding cloud storage egress optimization and distributed data transit.',
  },
  {
    blog: MOCK_BLOGS[11], // 1006 (Anthropic MCP)
    similarityScore: 0.965,
    matchedKeywords: ['mcp', 'anthropic', 'agentic-ai'],
    searchMode: 'SEMANTIC',
    explanation: 'Flawless semantic match in Model Context Protocol and autonomous AI agent tool execution context.',
  },
];
