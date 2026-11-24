// NovaBlog Enterprise - High Quality Mock Data for Vitrin / Offline Demo
// Hybrid Tech Publication: 12 Deep Engineering Articles + 8 Curated Dispatches (Approved Core Catalog)

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
  // ==========================================
  // PILLAR 1: DISTRIBUTED SYSTEMS & CONCURRENCY
  // ==========================================
  {
    id: 1,
    blogId: 1,
    publicationType: 'article',
    header: 'Java 22 & Virtual Threads',
    title: 'Overcoming Carrier Thread Pinning in Project Loom: Migrating from Synchronized Blocks to ReentrantLock and Scoped Values',
    content: `Project Loom in Java 21 and 22 represents a generational leap in server-side throughput by decoupling user-mode Virtual Threads from the operating system's kernel carrier threads. However, unmonitored deployments frequently suffer from a catastrophic failure mode: **Carrier Thread Pinning**.

## 1. The Mechanics of Carrier Thread Pinning
When a Virtual Thread enters a \`synchronized\` block or invokes a native method (JNI) and subsequently performs a blocking I/O operation, the underlying carrier thread cannot be unmounted. The JVM's \`ForkJoinPool\` scheduler is forced to keep the OS carrier thread blocked, rapidly exhausting the carrier worker pool and triggering massive tail latency spikes.

\`\`\`java
// BAD: Pinning the OS carrier thread during network I/O
public synchronized byte[] fetchRemoteTelemetryBad(String serviceUrl) {
    // Blocking socket read prevents ForkJoinPool unmounting!
    return restTemplate.getForObject(serviceUrl, byte[].class);
}

// GOOD: Fully unmountable Virtual Thread execution with ReentrantLock
private final ReentrantLock lock = new ReentrantLock();

public byte[] fetchRemoteTelemetrySafe(String serviceUrl) {
    lock.lock();
    try {
        // Virtual thread unmounts cleanly; carrier thread is returned to pool
        return restTemplate.getForObject(serviceUrl, byte[].class);
    } finally {
        lock.unlock();
    }
}
\`\`\`

## 2. Replacing ThreadLocal with JEP 480 Scoped Values
Beyond locking, enterprise Spring Boot applications often pass security tokens and database contexts via \`ThreadLocal\`. In a system handling 50,000 concurrent Virtual Threads, \`ThreadLocal\` memory overhead causes severe heap bloat and memory leaks.

\`\`\`java
// Modern Java 22 Scoped Values pattern
public final static ScopedValue<SecurityContext> CURRENT_SECURITY_CONTEXT = ScopedValue.newInstance();

ScopedValue.where(CURRENT_SECURITY_CONTEXT, userContext)
           .run(() -> {
               // Immutable, zero-overhead context inherited across structured subtasks
               executeAuditedTransaction();
           });
\`\`\`

## 3. Production Verification & Metrics
Enabling \`-Djdk.tracePinnedThreads=full\` in the JVM arguments immediately logs stack traces whenever a carrier thread is pinned. After refactoring our connection pools and database wrappers, p99 latency dropped from 480ms to 12ms under 20,000 concurrent socket connections.`,
    author: 'Abdullah Berke Ozder',
    authorUsername: 'berke.ozder',
    authorTitle: 'Staff Platform Engineer',
    views: 3420,
    likes: 412,
    clapsCount: 412,
    commentCount: 14,
    isPublished: true,
    publishedAt: '2026-11-20T10:00:00Z',
    createdDate: '2026-11-20T09:30:00Z',
    category: MOCK_CATEGORIES[1],
    tags: ['java-22', 'virtual-threads', 'loom', 'concurrency', 'scoped-values'],
    aiSummary: 'Comprehensive architectural analysis of Java 22 Project Loom carrier thread pinning. Eliminates thread starvation via ReentrantLock and JEP 480 Scoped Values, cutting p99 latency by 97%.',
    hasVectorEmbedding: true,
    isFeatured: true,
    readTimeMinutes: 6,
    version: 1,
  },
  {
    id: 2,
    blogId: 2,
    publicationType: 'article',
    header: 'Distributed Data & CDC',
    title: 'The Distributed Dual-Write Dilemma: Outbox Pattern and Debezium CDC Over Two-Phase Commit',
    content: `When a microservice needs to persist an entity to PostgreSQL and simultaneously publish an event to Redis or Kafka, issuing two separate network calls introduces the classic **Dual-Write Hazard**. If the database commit succeeds but the message broker rejects the packet, downstream consumers remain permanently desynchronized.

## 1. Why Two-Phase Commit (2PC) Fails in Cloud Architectures
Traditional distributed transactions (XA / 2PC) enforce atomicity by holding row locks across multiple independent systems throughout the duration of network round trips. Under high traffic, this causes catastrophic lock contention, deadlock cascades, and severe latency amplification.

\`\`\`sql
-- Dedicated Transactional Outbox Table in PostgreSQL 16
CREATE TABLE outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(64) NOT NULL,
    aggregate_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);
CREATE INDEX idx_outbox_created ON outbox_events(created_at ASC);
\`\`\`

## 2. Debezium Log-Based Change Data Capture (CDC)
Instead of polling the table with polling queries that burn database IOPS, we deploy **Debezium**, an open-source distributed platform that taps directly into the PostgreSQL Write-Ahead Log (WAL) via logical decoding:
- Zero polling query overhead on primary database CPUs.
- Guarantees strict ordering and at-least-once delivery semantics.
- Decouples core business transactions from downstream event consumers.

\`\`\`java
@Transactional
public BlogEntity createBlogPost(BlogCreateRequest request) {
    BlogEntity blog = blogRepository.save(new BlogEntity(request));
    
    // Atomically persisted in the same local ACID transaction
    outboxRepository.save(new OutboxEvent("BLOG", blog.getId(), "BLOG_CREATED", toJson(blog)));
    return blog;
}
\`\`\`

## 3. High-Frequency Counters with Redis Write-Behind
For high-frequency telemetry counters like claps and views, we bypass relational row updates entirely using Redis \`HINCRBY\` buffers. A scheduled batch job flushes aggregated counters to PostgreSQL every 5 seconds, cutting write contention by over 85%.`,
    author: 'Abdullah Berke Ozder',
    authorUsername: 'berke.ozder',
    authorTitle: 'Staff Platform Engineer',
    views: 2890,
    likes: 356,
    clapsCount: 356,
    commentCount: 9,
    isPublished: true,
    publishedAt: '2026-11-19T14:15:00Z',
    createdDate: '2026-11-19T13:00:00Z',
    category: MOCK_CATEGORIES[4],
    tags: ['debezium', 'cdc', 'transactional-outbox', 'redis', 'postgresql'],
    aiSummary: 'Solving the distributed dual-write problem using the Transactional Outbox Pattern and Debezium PostgreSQL WAL streaming. Guarantees consistency while eliminating 2PC locking bottlenecks.',
    hasVectorEmbedding: true,
    isFeatured: true,
    readTimeMinutes: 7,
    version: 1,
  },
  {
    id: 3,
    blogId: 3,
    publicationType: 'article',
    header: 'SRE & High-Throughput Networks',
    title: 'Tail Latency Amplification: Taming p99.9 Latency in Fan-Out Microservice Topologies with Hedging Requests and Circuit Breakers',
    content: `In distributed architectures where a single incoming user request fans out across 20 downstream microservices, system responsiveness is governed not by median latency (p50), but by the slowest tail percentile ($p99$ and $p99.9$). The mathematical probability of encountering a slow dependency scales aggressively as:

$$P(\\text{slow}) = 1 - (1 - p)^N$$

Where $N$ is the fan-out degree. At $N=20$, even if each service has a 99% SLA, over 18% of user requests experience extreme tail degradation.

## 1. Coordinated Omission in Load Testing
Standard benchmarking tools often wait for a request to complete before sending the next one. When a microservice hiccups, the tool pauses, artificially masking the queue backup in production. Using Gil Tene's **HdrHistogram** methodology, we capture true latency distributions under constant arrival rates.

\`\`\`yaml
# Resilience4j Sliding Window Configuration
resilience4j.circuitbreaker:
  instances:
    downstreamSearchService:
      slidingWindowType: TIME_BASED
      slidingWindowSize: 30
      minimumNumberOfCalls: 10
      failureRateThreshold: 50
      slowCallRateThreshold: 75
      slowCallDurationThreshold: 250ms
      waitDurationInOpenState: 5000ms
\`\`\`

## 2. Hedged Requests Pattern
If a downstream read has not responded within the 95th percentile threshold (e.g., 40ms), an identical speculative secondary request is dispatched to an alternative replica. The client accepts whichever completes first and cancels the other.

\`\`\`java
CompletableFuture<SearchResponse> primary = fetchAsync(replicaA);
scheduler.schedule(() -> {
    if (!primary.isDone()) {
        CompletableFuture<SearchResponse> hedged = fetchAsync(replicaB);
        return CompletableFuture.anyOf(primary, hedged);
    }
    return primary;
}, 40, TimeUnit.MILLISECONDS);
\`\`\`

## 3. Production Outcomes
Implementing hedged requests combined with Resilience4j rate limiting dropped our global p99.9 response time from 1,420ms down to 88ms with less than 2% additional network overhead.`,
    author: 'Caner Aydin',
    authorUsername: 'caneraydin',
    authorTitle: 'Principal Security Architect & Cloud Native SRE',
    views: 2150,
    likes: 278,
    clapsCount: 278,
    commentCount: 8,
    isPublished: true,
    publishedAt: '2026-11-18T11:20:00Z',
    createdDate: '2026-11-18T10:45:00Z',
    category: MOCK_CATEGORIES[2],
    tags: ['sre', 'tail-latency', 'p99', 'resilience4j', 'circuit-breaker'],
    aiSummary: 'Mathematical modeling and SRE mitigation of tail latency amplification in distributed systems. Deploys request hedging and Resilience4j to crush p99.9 latency by over 93%.',
    hasVectorEmbedding: true,
    isFeatured: false,
    readTimeMinutes: 5,
    version: 1,
  },

  // ==========================================
  // PILLAR 2: APPLIED AI & VECTOR RETRIEVAL
  // ==========================================
  {
    id: 4,
    blogId: 4,
    publicationType: 'article',
    header: 'Spring AI & Vector Engine',
    title: 'Hybrid Semantic Retrieval with Spring AI and pgvector: Fusing 128D Cosine Similarity with BM25 Lexical Ranking',
    content: `Traditional relational search engines struggle with synonyms and conceptual intent, while pure vector retrieval often misses exact product IDs, acronyms, and error codes. NovaBlog implements **Hybrid Search via Reciprocal Rank Fusion (RRF)** on PostgreSQL 16.

## 1. The 128D Cosine Similarity Vector Space
We normalize text embeddings to 128-dimensional unit vectors ($\\|\\mathbf{u}\\|_2 = 1$). Under $L_2$ normalization, calculating cosine distance simplifies directly to dot products:

$$\\cos(\\theta) = \\mathbf{u} \\cdot \\mathbf{v} = \\sum_{i=1}^{128} u_i v_i$$

\`\`\`sql
-- PostgreSQL pgvector 16+ HNSW Index Definition
CREATE INDEX idx_blogs_embedding_hnsw 
ON blogs 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- Full-Text Lexical GIN Index
CREATE INDEX idx_blogs_fts 
ON blogs 
USING gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')));
\`\`\`

## 2. Reciprocal Rank Fusion (RRF) Implementation
Because dense vector scores and sparse BM25 scores have incompatible statistical distributions, they cannot be linearly summed. RRF combines their rank positions:

$$RRF\\_Score(d) = \\sum_{m \\in \\{Dense, Sparse\\}} \\frac{1}{k + r_m(d)}, \\quad k = 60$$

\`\`\`java
@Service
public class HybridSearchService {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<SearchResult> executeRrfSearch(String query, float[] vector, int limit) {
        String sql = """
            WITH vector_ranked AS (
                SELECT id, ROW_NUMBER() OVER (ORDER BY embedding <=> ?::vector) as r_dense
                FROM blogs WHERE is_published = true LIMIT 50
            ),
            keyword_ranked AS (
                SELECT id, ROW_NUMBER() OVER (ORDER BY ts_rank_cd(to_tsvector('english', title || ' ' || content), plainto_tsquery('english', ?)) DESC) as r_sparse
                FROM blogs WHERE is_published = true AND to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', ?) LIMIT 50
            )
            SELECT COALESCE(v.id, k.id) as blog_id,
                   (COALESCE(1.0 / (60 + v.r_dense), 0.0) + COALESCE(1.0 / (60 + k.r_sparse), 0.0)) as rrf_score
            FROM vector_ranked v
            FULL OUTER JOIN keyword_ranked k ON v.id = k.id
            ORDER BY rrf_score DESC LIMIT ?;
        """;
        return jdbcTemplate.query(sql, mapper, vector, query, query, limit);
    }
}
\`\`\`

## 3. Benchmark Results
RRF achieved a 94.4% Mean Reciprocal Rank (MRR@10) on enterprise documentation queries, outperforming pure vector search by 18% on technical acronym queries.`,
    author: 'Dr. Selin Demir',
    authorUsername: 'selindemir',
    authorTitle: 'AI Research Lead & Vector Architect',
    views: 4120,
    likes: 512,
    clapsCount: 512,
    commentCount: 16,
    isPublished: true,
    publishedAt: '2026-11-17T08:00:00Z',
    createdDate: '2026-11-17T07:15:00Z',
    category: MOCK_CATEGORIES[0],
    tags: ['spring-ai', 'pgvector', 'hnsw', 'semantic-search', 'rrf-fusion'],
    aiSummary: 'End-to-end implementation of hybrid search combining PostgreSQL pgvector HNSW indexing and BM25 lexical ranking via Reciprocal Rank Fusion (RRF), achieving 94.4% MRR.',
    hasVectorEmbedding: true,
    isFeatured: true,
    readTimeMinutes: 6,
    version: 1,
  },
  {
    id: 5,
    blogId: 5,
    publicationType: 'article',
    header: 'AI Caching & Performance',
    title: 'Sub-Millisecond LLM Response Latency with Semantic Caching: Cosine Distance Thresholds in Redis VSS',
    content: `Calling hosted LLM APIs costs up to 1500ms of network latency and thousands of dollars in monthly token fees. Traditional HTTP caches fail because natural language questions are rarely character-for-character identical. **Semantic Caching** solves this via vector proximity.

## 1. The Proximity Threshold Axiom
When a user asks *"How do I tune HikariCP pool size?"*, the embedding vector is mathematically almost identical to *"Best practices for Hikari connection pool configuration"*. If their cosine distance satisfies:

$$D_{\\text{cosine}}(\\mathbf{u}, \\mathbf{v}) \\le 0.08 \\quad (\\text{Similarity} \\ge 0.92)$$

The cached response is retrieved directly from in-memory Redis storage in under 3 milliseconds, completely bypassing the external model.

\`\`\`java
@Service
public class SemanticCacheService {
    @Autowired
    private JedisPooled jedis;

    public Optional<String> lookupCachedAnswer(float[] queryVector) {
        Query q = new Query("*=>[KNN 1 @embedding $vec AS score]")
            .addParam("vec", toByteArray(queryVector))
            .returnFields("response", "score")
            .setSortBy("score", true)
            .limit(0, 1);

        SearchResult res = jedis.ftSearch("idx:semantic_cache", q);
        if (!res.getDocuments().isEmpty()) {
            Document doc = res.getDocuments().get(0);
            double distance = Double.parseDouble(doc.getString("score"));
            if (distance <= 0.08) {
                return Optional.of(doc.getString("response")); // Cache HIT!
            }
        }
        return Optional.empty(); // Cache MISS
    }
}
\`\`\`

## 2. Production Economics
Across 250,000 monthly reader queries on NovaBlog, the semantic cache achieved an 43.8% hit rate, reducing LLM token billing by $3,400/month while dropping p50 latency from 1,200ms to 4ms.`,
    author: 'Dr. Selin Demir',
    authorUsername: 'selindemir',
    authorTitle: 'AI Research Lead & Vector Architect',
    views: 1980,
    likes: 245,
    clapsCount: 245,
    commentCount: 6,
    isPublished: true,
    publishedAt: '2026-11-16T12:00:00Z',
    createdDate: '2026-11-16T11:30:00Z',
    category: MOCK_CATEGORIES[0],
    tags: ['semantic-cache', 'redis-vss', 'cosine-similarity', 'llm-optimization', 'vector-db'],
    aiSummary: 'Achieving 3ms response times for AI queries using Redis Vector Similarity Search and cosine distance thresholding, reducing LLM token billing by over 40%.',
    hasVectorEmbedding: true,
    isFeatured: false,
    readTimeMinutes: 5,
    version: 1,
  },
  {
    id: 6,
    blogId: 6,
    publicationType: 'article',
    header: 'Agent Protocols & MCP',
    title: 'Enterprise Model Context Protocol (MCP) Server Architecture with Spring Boot 4: Zero-Trust Database and Filesystem Tooling',
    content: `The 2026 AI era has transitioned from conversational chat completion to autonomous agentic systems. Rather than coding brittle proprietary tool-calling wrappers, the industry has standardized on the open **Model Context Protocol (MCP)**.

## 1. What is the Model Context Protocol?
MCP establishes a bidirectional, JSON-RPC 2.0 based protocol between AI host orchestrators (Claude Desktop, local IDE agents) and system resources (databases, Git, POSIX filesystems, CI/CD runners).

\`\`\`json
// MCP Tool Call Request Frame
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "query_vector_store",
    "arguments": {
      "semanticQuery": "memory leak virtual threads",
      "limit": 5
    }
  },
  "id": 42
}
\`\`\`

## 2. Exposing Spring Boot 4 Services as MCP Servers
Using Spring AI's official MCP server starter, Java services register tip-safe tool definitions with strict JSON Schema contracts and zero-trust parameter validation:

\`\`\`java
@Component
public class DatabaseMcpTools {

    @Autowired
    private BlogVectorRepository vectorRepo;

    @Tool(description = "Executes hybrid vector similarity search across engineering documentation")
    public List<DocumentSnippet> queryVectorStore(
            @ToolParam(description = "Semantic natural language search phrase") String semanticQuery,
            @ToolParam(description = "Maximum results to retrieve (1-10)") int limit) {
        
        // Zero-trust boundary validation
        if (limit > 10) limit = 10;
        return vectorRepo.findSimilarSnippets(semanticQuery, limit);
    }
}
\`\`\`

## 3. Sandboxing & Isolation
To prevent prompt-injection attacks from executing destructive commands, all filesystem and bash tools run inside ephemeral gVisor micro-containers with read-only root mounts.`,
    author: 'Dr. Selin Demir',
    authorUsername: 'selindemir',
    authorTitle: 'AI Research Lead & Vector Architect',
    views: 3100,
    likes: 389,
    clapsCount: 389,
    commentCount: 11,
    isPublished: true,
    publishedAt: '2026-11-15T09:00:00Z',
    createdDate: '2026-11-15T08:20:00Z',
    category: MOCK_CATEGORIES[0],
    tags: ['mcp', 'agentic-ai', 'spring-boot-4', 'json-rpc', 'zero-trust'],
    aiSummary: 'Designing enterprise Model Context Protocol (MCP) servers with Spring Boot 4. Exposes pgvector and system tooling to autonomous agents over JSON-RPC 2.0 with zero-trust sandboxing.',
    hasVectorEmbedding: true,
    isFeatured: true,
    readTimeMinutes: 7,
    version: 1,
  },

  // ==========================================
  // PILLAR 3: MODERN FRONTEND & COMPILER SYSTEMS
  // ==========================================
  {
    id: 7,
    blogId: 7,
    publicationType: 'article',
    header: 'React 19 & Compiler Systems',
    title: 'React 19 Compiler Architecture: Static Single Assignment (SSA) Control Flow Graphs and the End of Manual Memoization',
    content: `For a decade, React developers have spent countless hours agonizing over reference equality, dependency arrays, and manual \`useMemo\`, \`useCallback\`, and \`React.memo\` guards. The **React 19 Compiler (Forget)** shifts this cognitive burden to Ahead-Of-Time (AOT) compiler analysis.

## 1. Static Single Assignment (SSA) and Control Flow Analysis
The compiler parses JSX into an Abstract Syntax Tree (AST) and transforms component function bodies into **Static Single Assignment (SSA)** form:
- Every variable is assigned exactly once.
- The Control Flow Graph (CFG) traces mutable borrows and value lifetimes.
- The compiler identifies exactly which subtrees depend on which inputs.

\`\`\`javascript
// Raw Source Component
function ArticleClapWidget({ claps, onClap }) {
  const isMilestone = claps >= 1000;
  return (
    <button onClick={onClap} className={isMilestone ? 'badge-gold' : 'badge-silver'}>
      <span>👏 {claps}</span>
    </button>
  );
}

// React 19 Compiler Output (Conceptual Bytecode Slot Allocation)
function ArticleClapWidget_Compiled({ claps, onClap }) {
  const $ = _c(4); // Fixed cache slot array allocated per component fiber
  let t0;
  if ($[0] !== claps || $[1] !== onClap) {
    t0 = <button onClick={onClap} className={claps >= 1000 ? 'badge-gold' : 'badge-silver'}>
           <span>👏 {claps}</span>
         </button>;
    $[0] = claps;
    $[1] = onClap;
    $[2] = t0;
  } else {
    t0 = $[2];
  }
  return t0;
}
\`\`\`

## 2. Elimination of Cache Line Bouncing in the Virtual DOM
By hoisting memoization slots directly into the fiber allocation table, React 19 eliminates unnecessary V8 garbage collection passes generated by transient object allocations. Component tree re-render time drops by up to 60%.`,
    author: 'Caner Aydin',
    authorUsername: 'caneraydin',
    authorTitle: 'Principal Security Architect & Cloud Native SRE',
    views: 2750,
    likes: 340,
    clapsCount: 340,
    commentCount: 12,
    isPublished: true,
    publishedAt: '2026-11-14T15:30:00Z',
    createdDate: '2026-11-14T14:40:00Z',
    category: MOCK_CATEGORIES[3],
    tags: ['react-19', 'compiler', 'ast', 'usememo', 'frontend-architecture'],
    aiSummary: 'Under the hood of the React 19 Compiler. How Control Flow Graphs and Static Single Assignment (SSA) eliminate useMemo and useCallback boilerplate while reducing V8 garbage collection overhead.',
    hasVectorEmbedding: true,
    isFeatured: true,
    readTimeMinutes: 6,
    version: 1,
  },
  {
    id: 8,
    blogId: 8,
    publicationType: 'article',
    header: 'Distributed Client-Server Web',
    title: 'Next.js App Router and the React Flight Protocol: Byte-Level RPC Streaming and Distributed Client-Server Boundaries',
    content: `React Server Components (RSC) and Server Actions are not merely syntactic sugar over fetch calls; they represent an entirely new distributed client-server wire protocol: **The React Flight Protocol**.

## 1. Flight Wire Format vs. Classical JSON
Traditional SSR renders HTML and sends a redundant JSON data payload along with a heavy JavaScript bundle. React Flight streams a compact, newline-delimited line format where each component chunk is tagged:

\`\`\`text
1:I{"id":"./src/components/BlogCard.tsx","chunks":["app/client.js"],"name":"BlogCard"}
2:{"title":"Project Loom","claps":412,"author":"Abdullah Berke Ozder"}
0:["$","$1","card-1",{"data":"$2"}]
\`\`\`

## 2. Server Actions and Zero-Latency Optimistic UI
When a reader bookmarks an article or applauds in NovaBlog, waiting 300ms for a round-trip to PostgreSQL degrades perceived tactile responsiveness. Using React 19's \`useOptimistic\`, state mutates instantaneously on the client while the Server Action resolves asynchronously in the background:

\`\`\`typescript
'use client';
import { useOptimistic, useTransition } from 'react';
import { toggleArticleClapAction } from '@/actions/blogActions';

export function ClapButton({ initialClaps, articleId }: { initialClaps: number; articleId: number }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticClaps, setOptimisticClaps] = useOptimistic(
    initialClaps,
    (current, update: number) => current + update
  );

  const handleClick = () => {
    startTransition(async () => {
      setOptimisticClaps(1); // 0ms instantaneous UI update
      await toggleArticleClapAction(articleId); // Asynchronous RPC
    });
  };

  return (
    <button onClick={handleClick} className="mac9-btn">
      <span>👏 {optimisticClaps}</span>
    </button>
  );
}
\`\`\`

## 3. Streaming and Time to First Byte (TTFB)
With \`renderToPipeableStream\`, the outer layout and critical Mac OS 9 window frame arrive in 15ms over HTTP/2, while slower database telemetry cards resolve inside Suspense boundaries without blocking the main document.`,
    author: 'Caner Aydin',
    authorUsername: 'caneraydin',
    authorTitle: 'Principal Security Architect & Cloud Native SRE',
    views: 2280,
    likes: 295,
    clapsCount: 295,
    commentCount: 7,
    isPublished: true,
    publishedAt: '2026-11-13T10:15:00Z',
    createdDate: '2026-11-13T09:40:00Z',
    category: MOCK_CATEGORIES[3],
    tags: ['nextjs-16', 'flight-protocol', 'server-actions', 'optimistic-ui', 'turbopack'],
    aiSummary: 'Deep-dive into the React Flight Protocol and Next.js Server Actions. Combines byte-level RPC streaming with useOptimistic to deliver instantaneous zero-latency tactile feedback.',
    hasVectorEmbedding: true,
    isFeatured: false,
    readTimeMinutes: 5,
    version: 1,
  },
  {
    id: 9,
    blogId: 9,
    publicationType: 'article',
    header: 'Apple HIG & Spatial UI',
    title: 'Mac OS 9 Platinum HIG and Cognitive Ergonomics: Restoring Human Intent and Spatial Memory to the Digital Canvas',
    content: `The 2010s "Flat Design" movement stripped interfaces of borders, shadows, and depth cues, creating what ergonomics literature calls **Mystery Meat Navigation**: users must hover or guess whether an element is a clickable button or a static label. 

## 1. The 45-Degree Light Axiom
The 1999 Mac OS 9 Platinum Human Interface Guidelines (HIG) were mathematically optimized for human perceptual psychology:
- **Light Source Axiom:** All interactive widgets are illuminated by an imaginary 45-degree white light from the top-left.
- **Affordance Mapping:** Raised buttons carry a 1px white highlight on top/left and a 1px shadow on bottom/right. Recessed data entry fields (inputs) reverse this geometry, communicating a physical indentation.
- **The Result:** The human visual cortex decodes interactive depth within 30 milliseconds, incurring zero extraneous cognitive load.

\`\`\`css
/* Authentic Mac OS 9 Platinum Button Bevel */
.mac9-btn {
  background: linear-gradient(180deg, #FFFFFF 0%, #EAEAEA 25%, #DDDDDD 50%, #CCCCCC 100%);
  border: 1px solid #1F1F1F;
  box-shadow: inset 1px 1px 0px #FFFFFF, inset -1px -1px 0px #707070;
  font-family: 'Charcoal', sans-serif;
  cursor: pointer;
}
.mac9-btn:active {
  background: #AFAFAF;
  box-shadow: inset 1px 1px 1px #1F1F1F, inset -1px -1px 0px #FFFFFF;
}
\`\`\`

## 2. Spatial Memory vs. Transient Tabs
When users open 70 browser tabs, spatial orientation collapses. Classic Mac OS Finder windows opened at dedicated pixel coordinates with fixed dimensions, anchoring files to the user's hippocampal place cells. NovaBlog honors this principle by preserving desktop window coordinates and states across sessions.`,
    author: 'Abdullah Berke Ozder',
    authorUsername: 'berke.ozder',
    authorTitle: 'Staff Platform Engineer',
    views: 3870,
    likes: 489,
    clapsCount: 489,
    commentCount: 19,
    isPublished: true,
    publishedAt: '2026-11-12T16:00:00Z',
    createdDate: '2026-11-12T15:15:00Z',
    category: MOCK_CATEGORIES[3],
    tags: ['mac-os-9', 'platinum-hig', 'cognitive-load', 'skeuomorphism', 'spatial-memory'],
    aiSummary: 'Why the 1999 Mac OS 9 Platinum design system remains an ergonomic masterclass. Explores the 45-degree light axiom, physical affordances, and spatial memory against the pitfalls of modern flat UI.',
    hasVectorEmbedding: true,
    isFeatured: true,
    readTimeMinutes: 6,
    version: 1,
  },

  // ==========================================
  // PILLAR 4: ENTERPRISE STRATEGY, HISTORY & SRE
  // ==========================================
  {
    id: 10,
    blogId: 10,
    publicationType: 'article',
    header: 'Enterprise Architecture Strategy',
    title: 'The Microservices Illusion: Consolidating Distributed Sprawl into High-Cohesion Modular Monoliths to Slash Cloud Egress by 65%',
    content: `For a decade, engineering organizations with fewer than 100 engineers rushed to slice their systems into dozens of independent microservices. The result was rarely velocity; more often, it created a **Distributed Monolith**—all the network latency, serialized RPC failures, and debugging complexity of distributed systems with none of the independent deployment benefits.

## 1. The Hidden Bill: The Distributed Computing Tax
When a request hops across five microservices, organizations incur:
- Serialization and deserialization CPU cycles.
- Cloud inter-availability zone egress bandwidth charges.
- Distributed tracing and telemetry ingestion bills that rival the primary compute invoice.
- Inevitable data inconsistency and distributed saga orchestration failures.

\`\`\`java
// Spring Modulith: Enforcing domain module boundaries at compile time
@ApplicationModule
public class NovaBlogApplication {
    public static void main(String[] args) {
        SpringApplication.run(NovaBlogApplication.class, args);
    }
}

// Architectural fitness test verifying zero unauthorized cross-module coupling
@Test
void verifyModularArchitecture() {
    ApplicationModules.of(NovaBlogApplication.class).verify();
}
\`\`\`

## 2. The Modular Monolith Alternative
Using **Spring Modulith**, domain boundaries are strictly verified during unit test execution. Modules communicate via internal event publications and clean in-memory interfaces, eliminating network hops entirely.

## 3. Financial and Operational ROI
Consolidating our secondary services back into a single modular Spring Boot deployment reduced our monthly AWS EC2 and inter-AZ data transit bills by 65%, while cutting Mean Time to Resolution (MTTR) on production defects in half.`,
    author: 'Abdullah Berke Ozder',
    authorUsername: 'berke.ozder',
    authorTitle: 'Staff Platform Engineer',
    views: 4560,
    likes: 620,
    clapsCount: 620,
    commentCount: 24,
    isPublished: true,
    publishedAt: '2026-11-11T13:00:00Z',
    createdDate: '2026-11-11T12:10:00Z',
    category: MOCK_CATEGORIES[1],
    tags: ['modular-monolith', 'microservices', 'cloud-finops', 'spring-modulith', 'architecture-roi'],
    aiSummary: 'Strategic case study on reversing microservice sprawl into high-cohesion Spring Moduliths. Slashes AWS cloud egress and observability costs by 65% while accelerating feature delivery.',
    hasVectorEmbedding: true,
    isFeatured: true,
    readTimeMinutes: 8,
    version: 1,
  },
  {
    id: 11,
    blogId: 11,
    publicationType: 'article',
    header: 'Computing History & OS Evolution',
    title: 'The Legacy of BeOS: From 1995 Pervasive Preemptive Threading to the 2026 Java Virtual Threading Renaissance',
    content: `In 1995, former Apple executive Jean-Louis Gassée unveiled **BeOS**, the most advanced multimedia operating system of its generation. BeOS championed "Pervasive Multithreading": every window, audio track, and file query lived on its own preemptive thread.

## 1. The Tragedy of Premature Multithreading
While visionarily ahead of its time, BeOS collided with 1990s hardware constraints. Allocating a dedicated kernel thread for every UI widget exhausted CPU cache lines, while context-switch overhead overwhelmed single-core PowerPC 603 processors.

\`\`\`text
1995 BeOS Architecture:
  GUI Widget -> Kernel Thread (1MB Stack) -> Heavy Context Switch -> Hardware Bottleneck

2026 Java 22 Loom Architecture:
  Task / Socket -> Virtual Thread (Heap Continuation) -> M:N Carrier Scheduler -> 1,000,000+ Concurrent Units
\`\`\`

## 2. The 30-Year Architectural Loop
What BeOS attempted at the kernel level in 1995, modern runtimes have finally solved in 2026 by moving continuation scheduling into user-space:
- Lightweight continuations parked on the heap.
- Decoupling logical threads from operating system kernel stacks.
- Restoring the clarity of synchronous imperative programming without blocking underlying silicons.

Understanding computing history reveals that modern cloud engineering rarely invents new paradigms from scratch; it fulfills the unfulfilled architectural dreams of the 1990s with modern silicon.`,
    author: 'Abdullah Berke Ozder',
    authorUsername: 'berke.ozder',
    authorTitle: 'Staff Platform Engineer',
    views: 2940,
    likes: 380,
    clapsCount: 380,
    commentCount: 15,
    isPublished: true,
    publishedAt: '2026-11-10T11:00:00Z',
    createdDate: '2026-11-10T10:15:00Z',
    category: MOCK_CATEGORIES[2],
    tags: ['computing-history', 'beos', 'project-loom', 'os-architecture', 'multithreading'],
    aiSummary: 'Historical and technical examination connecting BeOS 1995 pervasive multithreading to modern Java 22 Virtual Threads. How user-space continuations finally realized the 30-year-old dream.',
    hasVectorEmbedding: true,
    isFeatured: false,
    readTimeMinutes: 7,
    version: 1,
  },
  {
    id: 12,
    blogId: 12,
    publicationType: 'article',
    header: 'SRE & Fault Tolerance',
    title: 'Resilience4j Circuit Breakers and RFC 7807: Transforming Distributed Network Failures into Deterministic Machine Contracts',
    content: `In high-throughput microservices, treating network failures as generic HTTP 500 errors leaves frontend applications blind. Without structured machine contracts, clients cannot distinguish between an invalid payload, an overloaded database, or an active circuit breaker.

## 1. The RFC 7807 Problem Details Standard
Spring Boot 4 natively implements RFC 7807 (\`application/problem+json\`). Rather than custom error schemas, every abnormal execution returns a standardized envelope:

\`\`\`json
{
  "type": "https://novablog.internal/errors/circuit-breaker-open",
  "title": "Service Degraded - Circuit Breaker Open",
  "status": 503,
  "detail": "AI Vector Search is currently unavailable due to downstream timeouts. Please retry in 5 seconds.",
  "instance": "/api/v1/blogs/search/semantic",
  "traceId": "7f8b91a2-c3d4-4e5f-b6a7-8c9d0e1f2a3b",
  "retryAfterSeconds": 5
}
\`\`\`

## 2. Spring Boot 4 Global Error Handler Integration
By intercepting Resilience4j \`CallNotPermittedException\` instances, we translate circuit breaker trips into deterministic HTTP 503 envelopes equipped with exact backoff directives:

\`\`\`java
@ExceptionHandler(CallNotPermittedException.class)
public ProblemDetail handleCircuitBreakerOpen(CallNotPermittedException ex, HttpServletRequest request) {
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(
        HttpStatus.SERVICE_UNAVAILABLE, 
        "Downstream dependency is isolated due to high error rates."
    );
    problem.setType(URI.create("https://novablog.internal/errors/circuit-breaker-open"));
    problem.setProperty("traceId", Tracer.currentTraceId());
    problem.setProperty("retryAfterSeconds", 5);
    return problem;
}
\`\`\`

## 3. Frontend Graceful Recovery
Receiving this contract, our Next.js client reads the \`retryAfterSeconds\` property, disables retry buttons, and displays a friendly Mac OS 9 alert banner rather than crashing the interface.`,
    author: 'Caner Aydin',
    authorUsername: 'caneraydin',
    authorTitle: 'Principal Security Architect & Cloud Native SRE',
    views: 2410,
    likes: 310,
    clapsCount: 310,
    commentCount: 10,
    isPublished: true,
    publishedAt: '2026-11-09T14:00:00Z',
    createdDate: '2026-11-09T13:20:00Z',
    category: MOCK_CATEGORIES[5],
    tags: ['resilience4j', 'rfc-7807', 'problem-details', 'fault-tolerance', 'sre'],
    aiSummary: 'Standardizing distributed error handling with RFC 7807 Problem Details and Resilience4j. Translates circuit breaker trips into machine-readable contracts with trace IDs and retry intervals.',
    hasVectorEmbedding: true,
    isFeatured: false,
    readTimeMinutes: 5,
    version: 1,
  },
];

export const MOCK_COMMENTS: Record<number, CommentResponseDto[]> = {
  1: [
    {
      id: 101,
      blogId: 1,
      content: 'The carrier thread pinning analysis with JFR and ReentrantLock is deeply instructive. We had this exact issue with legacy synchronized DB drivers!',
      authorName: 'Mehmet Kaya (Staff SRE)',
      createdAt: '2026-11-20T11:30:00Z',
      isApproved: true,
      sentiment: 'POSITIVE',
    },
    {
      id: 102,
      blogId: 1,
      content: 'Scoped Values in Java 22 is a breath of fresh air. ThreadLocal memory leaks were plaguing our Kubernetes pods.',
      authorName: 'Elif Yilmaz (Backend Lead)',
      createdAt: '2026-11-20T14:10:00Z',
      isApproved: true,
      sentiment: 'POSITIVE',
    },
  ],
  2: [
    {
      id: 201,
      blogId: 2,
      content: 'Debezium CDC over WAL is the only sane way to handle dual-writes. 2PC was causing endless lock contention in our database clusters.',
      authorName: 'Arda Guler (Data Architect)',
      createdAt: '2026-11-19T16:00:00Z',
      isApproved: true,
      sentiment: 'POSITIVE',
    },
  ],
  4: [
    {
      id: 401,
      blogId: 4,
      content: 'The Reciprocal Rank Fusion (RRF) formula with k=60 worked flawlessly for our technical docs search. Pure vector search was missing all our error codes!',
      authorName: 'Zeynep Ak (AI Engineer)',
      createdAt: '2026-11-17T10:20:00Z',
      isApproved: true,
      sentiment: 'POSITIVE',
    },
  ],
  6: [
    {
      id: 601,
      blogId: 6,
      content: 'Model Context Protocol (MCP) is standardizing agent tooling across the whole industry. Excellent walkthrough of the Spring AI MCP server setup.',
      authorName: 'Cem Ozturk (Agentic Systems Lead)',
      createdAt: '2026-11-15T12:00:00Z',
      isApproved: true,
      sentiment: 'POSITIVE',
    },
  ],
  7: [
    {
      id: 701,
      blogId: 7,
      content: 'React 19 Compiler finally kills useMemo and useCallback boilerplate. The SSA control flow analysis explanation is crystal clear!',
      authorName: 'Bora Tan (Senior Frontend Architect)',
      createdAt: '2026-11-14T17:45:00Z',
      isApproved: true,
      sentiment: 'POSITIVE',
    },
  ],
  9: [
    {
      id: 901,
      blogId: 9,
      content: 'The 45-degree light source axiom and spatial memory explanation hit the nail on the head. Modern flat UI has made everything look like unclickable mystery meat.',
      authorName: 'Emre Demir (HCI Researcher)',
      createdAt: '2026-11-12T18:30:00Z',
      isApproved: true,
      sentiment: 'POSITIVE',
    },
  ],
  10: [
    {
      id: 1001,
      blogId: 10,
      content: 'Our cloud egress bills dropped by over $8,000/month after moving from 15 microservices back to a Spring Modulith. Thank you for speaking truth to the microservice hype!',
      authorName: 'Serkan Acar (VP of Engineering)',
      createdAt: '2026-11-11T16:15:00Z',
      isApproved: true,
      sentiment: 'POSITIVE',
    },
  ],
};

export const MOCK_SEMANTIC_RESULTS: BlogSemanticSearchResultDto[] = [
  {
    blog: MOCK_BLOGS[0], // Loom Pinning
    similarityScore: 0.965,
    matchedKeywords: ['java-22', 'virtual-threads', 'loom', 'concurrency'],
    searchMode: 'SEMANTIC',
    explanation: '96.5% semantic convergence identified between concurrency queries and Java 22 Loom carrier thread unpinning.',
  },
  {
    blog: MOCK_BLOGS[3], // Hybrid RRF Search
    similarityScore: 0.942,
    matchedKeywords: ['spring-ai', 'pgvector', 'hnsw', 'semantic-search'],
    searchMode: 'SEMANTIC',
    explanation: 'High relevance detected in vector database indexing and Reciprocal Rank Fusion query routing.',
  },
  {
    blog: MOCK_BLOGS[1], // Outbox & Debezium
    similarityScore: 0.890,
    matchedKeywords: ['debezium', 'outbox', 'cdc', 'redis'],
    searchMode: 'HYBRID',
    explanation: 'Ranked top tier in distributed transactional consistency and Write-Ahead Log replication.',
  },
  {
    blog: MOCK_BLOGS[6], // React 19 Compiler
    similarityScore: 0.845,
    matchedKeywords: ['react-19', 'compiler', 'ast', 'usememo'],
    searchMode: 'SEMANTIC',
    explanation: 'Direct match for modern web compiler architecture and static single assignment analysis.',
  },
  {
    blog: MOCK_BLOGS[9], // Modular Monolith
    similarityScore: 0.815,
    matchedKeywords: ['modular-monolith', 'microservices', 'cloud-finops'],
    searchMode: 'SEMANTIC',
    explanation: 'Strong semantic alignment regarding enterprise software economics and cloud egress reduction.',
  },
];
