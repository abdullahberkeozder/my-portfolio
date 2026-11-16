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

  const displayName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : username.toLowerCase().includes('selin')
      ? 'Dr. Selin Demir'
      : username.toLowerCase().includes('caner')
      ? 'Caner Aydın'
      : username.toLowerCase().includes('admin') || username.toLowerCase().includes('berke')
      ? 'Abdullah Berke Özder'
      : profile?.name || username;

  const initial = displayName.charAt(0).toUpperCase();

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
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 space-y-12">
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
                  {profile?.title || 'Distributed Systems & Platform Architect'}
                </p>

                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed pt-1">
                  {profile?.bio ||
                    'Java 22 Loom, Spring Boot 4 ve mikro-çekirdek reaktif sistemler üzerine teknik derinlemesine incelemeler paylaşıyor.'}
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

        {/* Author Articles Feed */}
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span>Yayınlanan Teknik Makaleler ({blogs.length})</span>
            </h2>
          </div>

          {isLoading ? (
            <div className="py-20 text-center font-mono text-xs text-zinc-400 space-y-2">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-500" />
              <p>MAKALELER YÜKLENİYOR...</p>
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogs.map((blog, idx) => (
                <BlogCard
                  key={blog.blogId ?? blog.id ?? `author-blog-${idx}`}
                  blog={blog}
                  onSelect={setSelectedBlog}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8 space-y-2">
              <p className="text-sm font-semibold text-zinc-950 dark:text-white">Henüz yayınlanmış makale yok</p>
              <p className="text-xs text-zinc-500">Yazarın yeni yayınları burada listelenecektir.</p>
            </div>
          )}
        </section>
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
