'use client';

import React, { use, useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Check,
  UserPlus,
  Globe,
  Share2,
  RefreshCw,
  ExternalLink,
  Pin,
  Terminal,
  Cpu,
  Layers,
  Flame,
  Clock,
  MessageSquare,
  Copy,
} from 'lucide-react';
import { GithubIcon } from '@/components/GithubIcon';
import { BlogDto, AuthorProfileDto } from '@/types/api';
import { ApiClient } from '@/lib/api';
import { BlogCard } from '@/components/BlogCard';
import { BlogDetailModal } from '@/components/BlogDetailModal';
import { AquariumToggle } from '@/components/AquariumToggle';
import { useFollowedAuthors } from '@/hooks/useSocialStore';

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
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center font-mono text-xs text-zinc-500">
      <div className="space-y-3 text-center">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500" />
        <p className="tracking-widest uppercase">YAZAR PROFİLİ YÜKLENİYOR...</p>
      </div>
    </div>
  );
}

function AuthorContent({ params }: AuthorPageProps) {
  const resolvedParams = use(params);
  const username = decodeURIComponent(resolvedParams.username || '');
  const router = useRouter();

  const [profile, setProfile] = useState<AuthorProfileDto | null>(null);
  const [blogs, setBlogs] = useState<BlogDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleCopyNote = (noteId: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedNoteId(noteId);
      setTimeout(() => setCopiedNoteId(null), 2000);
    }
  };

  const handleClapNote = (noteId: string) => {
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
      ? 'Caner Aydın'
      : isStaffBerke
      ? 'Abdullah Berke Özder'
      : profile?.name || username;

  const initial = displayName.charAt(0).toUpperCase();

  // Curated Technical Notes / Micro-updates for Staff Authors (Roadmap 3.D)
  const authorNotes: AuthorNote[] = isStaffBerke
    ? [
        {
          id: 'note-1',
          date: '2 gün önce',
          topic: 'Virtual Threads & JDBC Pools',
          content:
            'Virtual Threads ile JDBC bağlantı havuzu yapılandırırken dikkat: HikariCP havuz boyutunu sanal thread sayısına göre değil, veritabanı CPU çekirdek sayısına (2 x CPU + Disk IO) göre boyutlandırın. Sanal iş parçacıkları bağlantı havuzunu şişirmek için bir bahane değildir!',
          codeSnippet: 'spring.datasource.hikari.maximum-pool-size=16\nspring.threads.virtual.enabled=true',
          claps: 48,
        },
        {
          id: 'note-2',
          date: '4 gün önce',
          topic: 'Redis Write-Behind Buffer',
          content:
            'Redis Write-Behind tamponunda HINCRBY ile alkış ve görüntülenme sayımlarını toplamak, veritabanı satır kilitlemelerini (row contention) %99.2 oranında düşürdü. Milyonlarca istek doğrudan bellekte birleşiyor.',
          claps: 64,
        },
        {
          id: 'note-3',
          date: '1 hafta önce',
          topic: 'PostgreSQL pgvector HNSW vs IVFFlat',
          content:
            'PostgreSQL 128D Cosine Distance sorgularında IVFFlat yerine HNSW indeksine geçtik. Recall oranı %94\'ten %99.4\'e yükselirken sorgu gecikmesi 1.8ms seviyesinde sabitlendi.',
          codeSnippet: 'CREATE INDEX ON blogs USING hnsw (embedding vector_cosine_ops)\nWITH (m = 16, ef_construction = 64);',
          claps: 82,
        },
      ]
    : isStaffSelin
    ? [
        {
          id: 'note-s1',
          date: '3 gün önce',
          topic: 'Dimension Reduction & Memory',
          content:
            '128D vs 1536D embedding karşılaştırması: Düşük boyutlu optimize edilmiş gömmeler (dimension reduction), kurumsal semantik aramada %80 bellek tasarrufu sağlarken anlamsal doğrulukta sadece %1.8 kayıp yaşatıyor.',
          claps: 57,
        },
        {
          id: 'note-s2',
          date: '5 gün önce',
          topic: 'Token Streaming Moderation',
          content:
            'Spring AI toxicity moderasyon pipeline\'ında token streaming kullanırken asenkron filtreleme: kullanıcı yazarken ilk 50 token içinde toksisite tespit edilirse istek erken sonlandırılabiliyor.',
          claps: 41,
        },
      ]
    : isStaffCaner
    ? [
        {
          id: 'note-c1',
          date: '1 gün önce',
          topic: 'Kubernetes CFS Quota & Throttling',
          content:
            'Kubernetes pod resource limitlerinde CPU limit kaldırma tartışması: CFS quota throttling yüzünden p99 gecikmeleri 300ms fırlayabiliyor. Sadece CPU request belirleyip limitleri kaldırmak gecikmeyi anında düşürdü.',
          codeSnippet:
            'resources:\n  requests:\n    cpu: "2"\n    memory: "4Gi"\n  # limits.cpu intentionally omitted to eliminate CFS throttling',
          claps: 73,
        },
        {
          id: 'note-c2',
          date: '6 gün önce',
          topic: 'Prometheus Metric Cardinality',
          content:
            'Prometheus histogramlarında bucket sınırlarını logaritmik yerine gerçek p50/p95/p99 dağılımına göre optimize etmek metrik cardinality\'sini %40 azalttı.',
          claps: 39,
        },
      ]
    : [
        {
          id: 'note-gen-1',
          date: '3 gün önce',
          topic: 'Mühendislik Günlüğü',
          content: 'Nova platformu üzerinde teknik mimari incelemeleri ve sistem optimizasyonları paylaşıyorum.',
          claps: 12,
        },
      ];

  // Core Tech Competencies (Roadmap 3.D)
  const techStack: string[] = isStaffBerke
    ? ['Java 22', 'Spring Boot 3.4', 'Project Loom', 'PostgreSQL', 'pgvector 128D', 'Redis Write-Behind', 'Distributed Systems', 'Next.js 16']
    : isStaffSelin
    ? ['Spring AI', 'pgvector', 'Python / PyTorch', 'Embeddings', 'Vector Search', 'Semantic Cache', 'Ollama']
    : isStaffCaner
    ? ['Kubernetes', 'Docker', 'eBPF', 'Prometheus', 'Grafana', 'Kafka', 'Microservices', 'Zero-Downtime CI/CD']
    : ['Teknoloji', 'Sistem Mimarisi', 'Yazılım Mühendisliği'];

  const pinnedBlog = blogs.length > 0 ? blogs[0] : null;
  const feedBlogs = blogs.length > 1 ? blogs.slice(1) : blogs;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans transition-colors duration-300">
      {/* Top Editorial Navbar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-[#08090c]/80 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title="Ana Sayfaya Dön"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-mono text-lg font-black tracking-tighter text-zinc-950 dark:text-white">
                NOVA<span className="text-emerald-500">.</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
                / YAZAR PROFİLİ
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>{isCopied ? 'Kopyalandı!' : 'Profili Paylaş'}</span>
            </button>
            <AquariumToggle compact compactWidth={80} className="shrink-0" />
          </div>
        </div>
      </header>

      {/* Main Author Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 space-y-10">
        {/* Author Bio Banner Card */}
        <section className="relative rounded-3xl p-6 sm:p-10 bg-white dark:bg-[#0d0f14] border border-black/[0.08] dark:border-white/[0.08] shadow-sm space-y-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-zinc-950 dark:bg-zinc-800 text-white flex items-center justify-center text-3xl font-bold uppercase shadow-xl ring-4 ring-white dark:ring-[#0d0f14] overflow-hidden shrink-0">
                {profile?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.imageUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </div>

              {/* Bio & Details */}
              <div className="space-y-2 max-w-xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                    {displayName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-mono font-bold uppercase">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    KIDEMLİ YAZAR
                  </span>
                </div>

                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {profile?.title || (isStaffSelin ? 'Principal AI & Data Systems Researcher' : isStaffCaner ? 'Staff Cloud & Kubernetes Architect' : 'Staff Backend & Systems Architect @ Nova')}
                </p>

                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed pt-1">
                  {profile?.bio ||
                    (isStaffSelin
                      ? 'LLM entegrasyonları, pgvector gömmeleri ve yüksek boyutlu vektör uzaylarında anlamsal bilgi getirme (RAG) mimarileri üzerinde araştırmalar yapıyor.'
                      : isStaffCaner
                      ? 'Cloud-Native mimariler, eBPF gözlemlenebilirlik, sıfır kesintili dağıtımlar ve yüksek erişilebilirlikli mikroservis altyapıları tasarlıyor.'
                      : 'Java 22 Loom, Spring Boot 4 ve mikro-çekirdek reaktif sistemler üzerine teknik derinlemesine incelemeler paylaşıyor.')}
                </p>

                {/* External Social Links */}
                <div className="flex items-center gap-3 pt-2 text-zinc-500 text-xs">
                  {profile?.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
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
                      className="inline-flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Follow Action */}
            <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-3">
              <button
                type="button"
                onClick={toggleFollow}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer whitespace-nowrap active:scale-95 ${
                  isFollowing
                    ? 'bg-zinc-200 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-950 dark:bg-white text-white dark:text-black hover:opacity-90'
                }`}
              >
                {isFollowing ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>TAKİP EDİLİYOR</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>TAKİP ET</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Stats Strip */}
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-3 sm:w-80 gap-4 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-black font-mono text-zinc-950 dark:text-white">
                {blogs.length}
              </div>
              <div className="text-[11px] font-mono text-zinc-500 uppercase">Makale</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black font-mono text-zinc-950 dark:text-white">
                {(profile?.followersCount || 1240) + (isFollowing ? 1 : 0)}
              </div>
              <div className="text-[11px] font-mono text-zinc-500 uppercase">Takipçi</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black font-mono text-zinc-950 dark:text-white">
                {profile?.followingCount || 89}
              </div>
              <div className="text-[11px] font-mono text-zinc-500 uppercase">Takip</div>
            </div>
          </div>
        </section>

        {/* Apple Segmented Control Tab Switcher (Roadmap 3.D) */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="inline-flex p-1 rounded-2xl bg-zinc-200/70 dark:bg-zinc-900 border border-zinc-300/60 dark:border-zinc-800/80 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('articles')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'articles'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span>Makaleler ({blogs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'notes'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Terminal className="w-4 h-4 text-cyan-500" />
              <span>Teknik Notlar ({authorNotes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Cpu className="w-4 h-4 text-amber-500" />
              <span>Hakkında & Yetkinlikler</span>
            </button>
          </div>
        </div>

        {/* TAB 1: Long-Form Technical Articles */}
        {activeTab === 'articles' && (
          <div className="space-y-8 animate-fade-in">
            {/* Pinned Featured Article Highlight (Roadmap 3.D) */}
            {pinnedBlog && (
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-500/5 via-cyan-500/5 to-transparent border border-emerald-500/30 dark:border-emerald-500/20 shadow-sm space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">
                    <Pin className="w-3.5 h-3.5 fill-current" />
                    ÖNE ÇIKAN SABİTLENMİŞ YAZI (PINNED)
                  </span>
                  <span className="text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {pinnedBlog.readTimeMinutes || 6} dk okuma
                  </span>
                </div>

                <div className="space-y-2">
                  <h3
                    onClick={() => setSelectedBlog(pinnedBlog)}
                    className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white hover:text-emerald-500 transition-colors cursor-pointer"
                  >
                    {pinnedBlog.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-3 leading-relaxed">
                    {pinnedBlog.content.slice(0, 240)}...
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
                    <span>👏 {pinnedBlog.clapsCount ?? pinnedBlog.likesCount ?? 42}</span>
                    <span>·</span>
                    <span>💬 {pinnedBlog.commentCount ?? 0} yorum</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/post/${pinnedBlog.blogId ?? pinnedBlog.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                      <span>Müstakil Oku</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* All Articles Grid */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <span>Tüm Makaleler ({blogs.length})</span>
              </h2>

              {isLoading ? (
                <div className="py-20 text-center font-mono text-xs text-zinc-400 space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-500" />
                  <p>MAKALELER YÜKLENİYOR...</p>
                </div>
              ) : feedBlogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {feedBlogs.map((blog, idx) => (
                    <BlogCard
                      key={blog.blogId ?? blog.id ?? `author-blog-${idx}`}
                      blog={blog}
                      onSelect={setSelectedBlog}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8 space-y-2">
                  <p className="text-sm font-semibold text-zinc-950 dark:text-white">Henüz başka makale yok</p>
                  <p className="text-xs text-zinc-500">Yazarın yeni yayınları burada listelenecektir.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Substack & X-Style Technical Notes & Observations (Roadmap 3.D) */}
        {activeTab === 'notes' && (
          <div className="space-y-6 animate-fade-in max-w-3xl">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-500" />
                <span>Teknik Notlar & Mimari Gözlemler</span>
              </h2>
              <p className="text-xs text-zinc-500">
                Kısa soluklu mühendislik notları, kod parçacıkları, üretim gözlemleri ve mikro-benchmarklar.
              </p>
            </div>

            <div className="space-y-4">
              {authorNotes.map((note) => {
                const totalClaps = note.claps + (localNoteClaps[note.id] || 0);
                const isCopiedNote = copiedNoteId === note.id;

                return (
                  <article
                    key={note.id}
                    className="p-6 rounded-3xl bg-white dark:bg-[#0c0e12] border border-zinc-200/90 dark:border-zinc-800/90 shadow-xs space-y-4 transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold uppercase">
                          #{note.topic}
                        </span>
                        <span className="text-zinc-400 font-mono text-[11px]">&bull; {note.date}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyNote(note.id, note.content)}
                        className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        title="Notu Kopyala"
                      >
                        {isCopiedNote ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                      {note.content}
                    </p>

                    {note.codeSnippet && (
                      <div className="rounded-2xl bg-zinc-950 p-4 border border-zinc-800 font-mono text-xs text-emerald-400 overflow-x-auto scrollbar-thin">
                        <pre>
                          <code>{note.codeSnippet}</code>
                        </pre>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-500 font-mono">
                      <button
                        type="button"
                        onClick={() => handleClapNote(note.id)}
                        className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors cursor-pointer group"
                      >
                        <span className="group-hover:scale-125 transition-transform">👏</span>
                        <span className="font-bold">{totalClaps}</span>
                      </button>

                      <div className="flex items-center gap-4 text-zinc-400 text-[11px]">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Mühendislik Günlüğü</span>
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: About & Tech Stack Competencies (Roadmap 3.D) */}
        {activeTab === 'about' && (
          <div className="space-y-8 animate-fade-in max-w-3xl">
            {/* Tech Stack Pills */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c0e12] border border-zinc-200/90 dark:border-zinc-800/90 space-y-4">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-500" />
                <span>Çekirdek Teknoloji Yığını & Uzmanlıklar</span>
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Platform mimarisinde aktif olarak kodlanan ve üretim ortamında optimize edilen teknolojiler:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80"
                  >
                    <Layers className="w-3 h-3 text-emerald-500" />
                    <span>{tech}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Engineering Mission & Manifesto */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c0e12] border border-zinc-200/90 dark:border-zinc-800/90 space-y-4">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Mühendislik Vizyonu</span>
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Modern kurumsal sistemlerde sentetik telemetri ve AI-slop illüzyonlarından uzak durarak; somut, ölçülebilir ve yüksek eşzamanlı mimariler geliştirmek. Kod tabanında sıfır darboğaz, şeffaf dağıtık izleme ve yüksek okunabilirlikli teknik yayıncılık kültürü oluşturmak.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Selected Blog Modal Reader */}
      {selectedBlog && (
        <BlogDetailModal
          blog={selectedBlog}
          isOpen={true}
          onClose={() => setSelectedBlog(null)}
          onAuthorClick={(auth) => {
            if (auth !== username) {
              router.push(`/author/${encodeURIComponent(auth)}`);
            }
          }}
          followedAuthors={followedAuthors}
          onToggleFollow={toggleFollow}
        />
      )}
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
