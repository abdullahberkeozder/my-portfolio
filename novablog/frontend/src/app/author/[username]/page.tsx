'use client';

import React, { use, useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  UserPlus,
  Globe,
  Share2,
  RefreshCw,
  Pin,
  Cpu,
  Layers,
  Flame,
  BookOpen,
  FileText,
} from 'lucide-react';
import { GithubIcon } from '@/components/GithubIcon';
import { BlogDto, AuthorProfileDto } from '@/types/api';
import { ApiClient } from '@/lib/api';
import { MOCK_BLOGS } from '@/lib/mockData';
import { BlogCard } from '@/components/BlogCard';
import { BlogDetailModal } from '@/components/BlogDetailModal';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useFollowedAuthors } from '@/hooks/useSocialStore';
import { playKeyClick, playTabSelect } from '@/lib/retroAudio';

interface AuthorPageProps {
  params: Promise<{ username: string }>;
}

interface AuthorNote {
  id: string;
  date: string;
  topic: string;
  content: string;
  codeSnippet?: string;
  claps: number;
}

function AuthorPageSkeleton() {
  return (
    <div className="min-h-screen safari-reader-backdrop flex items-center justify-center font-mono text-xs text-zinc-400">
      <div className="space-y-3 text-center">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500" />
        <p className="tracking-widest uppercase">MAC ADDRESS BOOK &amp; AUTHOR PROFILE LOADING...</p>
      </div>
    </div>
  );
}

function AuthorContent({ params }: AuthorPageProps) {
  const resolvedParams = use(params);
  const username = decodeURIComponent(resolvedParams.username || '');
  const router = useRouter();

  const [profile, setProfile] = useState<AuthorProfileDto | null>(() =>
    ApiClient.getFallbackAuthorProfile(username)
  );
  const [blogs, setBlogs] = useState<BlogDto[]>(() => {
    const target = username.toLowerCase();
    return MOCK_BLOGS.filter((b) => {
      const u = (b.authorUsername || '').toLowerCase();
      const n = (b.author || '').toLowerCase();
      return (
        u === target ||
        n === target ||
        (target.includes('selin') && n.includes('selin')) ||
        (target.includes('caner') && n.includes('caner')) ||
        (target.includes('berke') && n.includes('berke')) ||
        (target.includes('admin') && n.includes('berke'))
      );
    }).map((b) => ApiClient.normalizeBlog(b));
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogDto | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'articles' | 'notes' | 'about'>('articles');
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);
  const [localNoteClaps, setLocalNoteClaps] = useState<Record<string, number>>({});

  const followedAuthors = useFollowedAuthors();

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      ApiClient.getAuthorProfile(username),
      ApiClient.getBlogs(),
    ])
      .then(([prof, allBlogs]) => {
        if (!isMounted) return;
        setProfile(prof);

        const target = username.toLowerCase();
        const filtered = allBlogs.filter((b) => {
          const u = (b.authorUsername || '').toLowerCase();
          const n = (b.author || '').toLowerCase();
          return (
            u === target ||
            n === target ||
            (target.includes('selin') && n.includes('selin')) ||
            (target.includes('caner') && n.includes('caner')) ||
            (target.includes('berke') && n.includes('berke')) ||
            (target.includes('admin') && n.includes('berke'))
          );
        });
        setBlogs(filtered);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [username]);

  const targetIdentifier = profile?.username || username;
  const isFollowing = followedAuthors.includes(targetIdentifier) || followedAuthors.includes(profile?.name || '');

  const toggleFollow = () => {
    playKeyClick();
    if (typeof window === 'undefined') return;
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('novablog_followed_authors') || '[]');
      let updated: string[];
      if (saved.includes(targetIdentifier)) {
        updated = saved.filter((a) => a !== targetIdentifier);
      } else {
        updated = [...saved, targetIdentifier];
      }
      localStorage.setItem('novablog_followed_authors', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('followed-authors-updated', { detail: updated }));
      ApiClient.toggleFollow(targetIdentifier);
    } catch {
      // ignore
    }
  };

  const handleShare = () => {
    playKeyClick();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleCopyNote = (noteId: string, text: string) => {
    playKeyClick();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedNoteId(noteId);
      setTimeout(() => setCopiedNoteId(null), 2000);
    }
  };

  const handleClapNote = (noteId: string) => {
    playKeyClick();
    setLocalNoteClaps((prev) => ({
      ...prev,
      [noteId]: (prev[noteId] || 0) + 1,
    }));
  };

  const isStaffBerke = username.toLowerCase().includes('admin') || username.toLowerCase().includes('berke');
  const isStaffSelin = username.toLowerCase().includes('selin');
  const isStaffCaner = username.toLowerCase().includes('caner');

  const displayName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : isStaffSelin
      ? 'Dr. Selin Demir'
      : isStaffCaner
      ? 'Caner Aydin'
      : isStaffBerke
      ? 'Abdullah Berke Ozder'
      : profile?.name || username;

  const initial = displayName.charAt(0).toUpperCase();

  // Curated Technical Notes / Micro-updates on Mountain Lion Yellow Legal-Pad
  const authorNotes: AuthorNote[] = isStaffBerke
    ? [
        {
          id: 'note-1',
          date: '14 Kas 2026',
          topic: 'Virtual Threads & JDBC Pools',
          content:
            'When configuring JDBC connection pools with Virtual Threads: size your HikariCP pool based on database CPU cores (2 x CPU + Disk IO), not on virtual thread counts. Virtual threads are not an excuse to bloat your database connection pool!',
          codeSnippet: 'spring.datasource.hikari.maximum-pool-size=16\nspring.threads.virtual.enabled=true',
          claps: 48,
        },
        {
          id: 'note-2',
          date: '12 Kas 2026',
          topic: 'Redis Write-Behind Buffer',
          content:
            'Collecting clap and view increments via HINCRBY in the Redis Write-Behind buffer reduced database row contention by 99.2%. Millions of telemetry requests coalesce in-memory.',
          claps: 64,
        },
        {
          id: 'note-3',
          date: '8 Kas 2026',
          topic: 'PostgreSQL pgvector HNSW vs IVFFlat',
          content:
            'Migrated from IVFFlat to HNSW indexing for PostgreSQL 128D Cosine Distance queries. Recall increased from 94% to 99.4% while query latency settled at 1.8ms.',
          codeSnippet: 'CREATE INDEX ON blogs USING hnsw (embedding vector_cosine_ops)\nWITH (m = 16, ef_construction = 64);',
          claps: 82,
        },
      ]
    : isStaffSelin
    ? [
        {
          id: 'note-s1',
          date: '13 Kas 2026',
          topic: 'Dimension Reduction & Memory',
          content:
            '128D vs 1536D embedding comparison: Low-dimensional optimized embeddings (dimension reduction) save 80% RAM in enterprise semantic search with only a 1.8% loss in semantic recall.',
          claps: 57,
        },
        {
          id: 'note-s2',
          date: '10 Kas 2026',
          topic: 'Token Streaming Moderation',
          content:
            'Asynchronous filtering in the Spring AI moderation pipeline using token streaming: if toxicity is detected within the first 50 tokens, the request can be aborted early.',
          claps: 41,
        },
      ]
    : isStaffCaner
    ? [
        {
          id: 'note-c1',
          date: '15 Kas 2026',
          topic: 'Kubernetes CFS Quota & Throttling',
          content:
            'Eliminating CPU limits in Kubernetes pod resource configurations: CFS quota throttling was causing p99 latencies to spike to 300ms. Specifying only CPU requests dropped latency instantly.',
          codeSnippet:
            'resources:\n  requests:\n    cpu: "2"\n    memory: "4Gi"\n  # limits.cpu intentionally omitted to eliminate CFS throttling',
          claps: 73,
        },
        {
          id: 'note-c2',
          date: '9 Kas 2026',
          topic: 'Prometheus Metric Cardinality',
          content:
            'Optimizing Prometheus histogram bucket boundaries based on real p50/p95/p99 distributions rather than logarithmic steps reduced metric cardinality by 40%.',
          claps: 39,
        },
      ]
    : [
        {
          id: 'note-gen-1',
          date: '10 Kas 2026',
          topic: 'Engineering Log',
          content: 'Sharing technical architecture deep-dives and system optimizations on the Nova platform.',
          claps: 12,
        },
      ];

  // Core Tech Competencies (Hardware IC Chip Badges)
  const techStack: string[] = isStaffBerke
    ? ['Java 22 Loom', 'Spring Boot 3.4', 'Project Loom', 'PostgreSQL pgvector', 'Redis Write-Behind', 'HikariCP Pool', 'Distributed Systems', 'Next.js 16']
    : isStaffSelin
    ? ['Spring AI', 'pgvector 128D', 'Python / PyTorch', 'Embeddings RAG', 'Vector Search', 'Semantic Cache', 'Ollama LLM']
    : isStaffCaner
    ? ['Kubernetes', 'Docker Pods', 'eBPF Tracing', 'Prometheus', 'Grafana Alerts', 'Kafka Streams', 'Zero-Trust 2FA']
    : ['Java 22', 'Spring Boot', 'System Architecture', 'Software Engineering'];

  const pinnedBlog = blogs.length > 0 ? blogs[0] : null;
  const feedBlogs = blogs.length > 1 ? blogs.slice(1) : blogs;

  if (isLoading) {
    return <AuthorPageSkeleton />;
  }

  return (
    <div className="min-h-screen ios-pinstripe flex flex-col font-sans transition-colors duration-300">
      {/* 1. Unified Mac OS X Desktop Header */}
      <Navbar
        isBackendOnline={true}
        onRefreshHealth={() => {}}
      />

      {/* 2. Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Mac OS X Address Book Bifold Card */}
        <section className="mac-addressbook-card shadow-2xl overflow-hidden">
          {/* Saddle-Stitched Leather Top Header Banner */}
          <div className="leather-stitched-header">
            <div className="inline-flex items-center gap-2 text-amber-200 text-xs font-mono font-bold tracking-wider uppercase">
              <span>MAC ADDRESS BOOK // YAZAR MASASI</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="safari-hud-btn text-xs font-mono"
                title="Share Author Profile"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{isCopied ? 'Copied' : 'Share'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playKeyClick();
                  router.push('/');
                }}
                className="w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center font-bold text-xs shadow-inner cursor-pointer"
                title="Go Back"
              >
                &times;
              </button>
            </div>
          </div>

          {/* Profile Card Body */}
          <div className="p-6 sm:p-10 space-y-6 bg-white dark:bg-[#181a1d] border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                {/* Brushed Silver Coin Avatar */}
                <div className="retro-avatar-silver shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-zinc-900 text-white flex items-center justify-center text-3xl font-bold uppercase shadow-inner overflow-hidden">
                    {profile?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.imageUrl} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      initial
                    )}
                  </div>
                </div>

                {/* Bio & Details */}
                <div className="space-y-2 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white tracking-tight font-sans">
                      {displayName}
                    </h1>
                    <span className="retro-tag-pill uppercase">
                      SENIOR ARCHITECT
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 font-sans">
                    {profile?.title || (isStaffSelin ? 'Principal AI & Data Systems Researcher' : isStaffCaner ? 'Staff Cloud & Kubernetes Architect' : 'Staff Systems Architect & Tech Lead @ Nova')}
                  </p>

                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed pt-1 font-sans">
                    {profile?.bio ||
                      (isStaffSelin
                        ? 'Conducts research on Spring AI integrations, pgvector embeddings, and high-dimensional semantic retrieval (RAG) architectures.'
                        : isStaffCaner
                        ? 'Designs Cloud-Native architectures, eBPF observability, zero-downtime deployments, and highly available microservice platforms.'
                        : 'Publishes in-depth technical investigations and production architectures on Java 22 Loom, Spring Boot 4, and micro-kernel systems.')}
                  </p>

                  {/* External Social Links */}
                  <div className="flex items-center gap-4 pt-2 text-zinc-500 text-xs">
                    {profile?.githubUrl && (
                      <a
                        href={profile.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => playKeyClick()}
                        className="inline-flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors"
                      >
                        <GithubIcon className="w-3.5 h-3.5" />
                        <span>GitHub</span>
                      </a>
                    )}
                    {profile?.websiteUrl && (
                      <a
                        href={profile.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => playKeyClick()}
                        className="inline-flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Web</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Follow Button */}
              <button
                type="button"
                onClick={toggleFollow}
                className={`mac-aqua-btn ${
                  isFollowing ? 'mac-aqua-btn-silver' : 'mac-aqua-btn-primary'
                } !px-6 !py-2.5 !text-xs font-bold gap-2 cursor-pointer whitespace-nowrap active:scale-95`}
              >
                {isFollowing ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>FOLLOWING</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>FOLLOW</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 4. Mac Finder Style Segmented Tab Track */}
          <div className="px-6 sm:px-10 py-3 bg-zinc-100 dark:bg-[#121417] border-b border-zinc-200 dark:border-zinc-800">
            <div className="ios-segmented-track">
              <button
                type="button"
                onClick={() => {
                  playTabSelect();
                  setActiveTab('articles');
                }}
                className={`ios-segment-btn flex items-center gap-2 ${
                  activeTab === 'articles' ? 'active' : ''
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>YAYINLANAN MAKALELER ({blogs.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTabSelect();
                  setActiveTab('notes');
                }}
                className={`ios-segment-btn flex items-center gap-2 ${
                  activeTab === 'notes' ? 'active' : ''
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>YELLOW NOTES &amp; MICRO UPDATES ({authorNotes.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTabSelect();
                  setActiveTab('about');
                }}
                className={`ios-segment-btn flex items-center gap-2 ${
                  activeTab === 'about' ? 'active' : ''
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>HARDWARE CHIP BADGES</span>
              </button>
            </div>
          </div>

          {/* 5. Tab Viewport Contents */}
          <div className="p-6 sm:p-10 space-y-6">
            {/* Tab 1: Articles */}
            {activeTab === 'articles' && (
              <div className="space-y-6">
                {pinnedBlog && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
                      <Pin className="w-3.5 h-3.5 text-amber-500" />
                      <span>PINNED LEAD ARTICLE</span>
                    </div>
                    <BlogCard
                      blog={pinnedBlog}
                      onSelect={(b) => setSelectedBlog(b)}
                    />
                  </div>
                )}

                {feedBlogs.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                      OTHER PUBLICATIONS ({feedBlogs.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {feedBlogs.map((b) => (
                        <BlogCard
                          key={b.blogId ?? b.id}
                          blog={b}
                          onSelect={(selected) => setSelectedBlog(selected)}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  !pinnedBlog && (
                    <div className="py-12 text-center text-xs text-zinc-400 font-mono">
                      This author has not published any articles yet.
                    </div>
                  )
                )}
              </div>
            )}

            {/* Tab 2: Mountain Lion Yellow Legal-Pad Notes */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10 text-xs font-mono text-zinc-500">
                  <span>MAC OS X MOUNTAIN LION NOTES PAD</span>
                  <span>{authorNotes.length} TECHNICAL MICRO NOTES</span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {authorNotes.map((note) => {
                    const claps = (note.claps || 0) + (localNoteClaps[note.id] || 0);
                    return (
                      <article
                        key={note.id}
                        className="ios-notes-paper p-6 sm:p-8 pl-16 sm:pl-20 rounded-xl border border-amber-300 dark:border-amber-900/60 shadow-lg space-y-4 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="retro-tag-pill uppercase">
                            #{note.topic}
                          </span>
                          <span className="text-xs font-mono text-zinc-500 font-bold">{note.date}</span>
                        </div>

                        <p className="text-sm sm:text-base text-zinc-900 dark:text-zinc-100 font-serif leading-relaxed">
                          {note.content}
                        </p>

                        {note.codeSnippet && (
                          <div className="relative rounded-lg bg-zinc-950 text-emerald-400 font-mono text-xs p-4 overflow-x-auto shadow-inner border border-zinc-800">
                            <button
                              type="button"
                              onClick={() => handleCopyNote(note.id, note.codeSnippet!)}
                              className="absolute top-2 right-2 ios6-btn ios6-btn-dark px-2 py-0.5 text-[10px]"
                              title="Kodu Kopyala"
                            >
                              {copiedNoteId === note.id ? 'Copied' : 'Copy'}
                            </button>
                            <pre>
                              <code>{note.codeSnippet}</code>
                            </pre>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-amber-200/60 dark:border-amber-900/40 text-xs font-mono">
                          <button
                            type="button"
                            onClick={() => handleClapNote(note.id)}
                            className="ios6-btn ios6-btn-silver px-3 py-1 text-xs font-bold gap-1 cursor-pointer"
                          >
                            <span>👏</span>
                            <span>{claps} claps</span>
                          </button>
                          <span className="text-[10px] text-zinc-400 uppercase tracking-widest hidden sm:inline">
                            SKEUOMORPHIC MOUNTAIN LION LEGAL PAD
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Hardware IC Chip Badges */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-950 dark:text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                      <Cpu className="w-4 h-4 text-blue-500" />
                      <span>SPECIALIZATIONS &amp; HARDWARE CHIP BADGES</span>
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {techStack.length} ARCHITECTURAL MODULES
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {techStack.map((tech) => (
                      <span
                        key={tech}
                        className="mac-hardware-chip-badge"
                      >
                        <Layers className="w-3.5 h-3.5 text-blue-400" />
                        <span>{tech}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <span className="text-xs font-bold text-zinc-950 dark:text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>ARCHITECTURAL VISION &amp; MANIFESTO</span>
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                    Crafted free of synthetic telemetry and artificial intelligence illusions; high-concurrency, deterministic, and sustainable enterprise software architecture. Zero thread contention with Java 22 Loom virtual threads, surgical semantic precision with pgvector 128D.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 6. Blog Detail Modal (If an article is selected from author's feed) */}
      {selectedBlog && (
        <BlogDetailModal
          blog={selectedBlog}
          onClose={() => setSelectedBlog(null)}
        />
      )}

      {/* 7. Apple Classic Directory Footer */}
      <Footer />
    </div>
  );
}

export default function AuthorPage(props: AuthorPageProps) {
  return (
    <Suspense fallback={<AuthorPageSkeleton />}>
      <AuthorContent {...props} />
    </Suspense>
  );
}
