'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Sparkles,
  Check,
  Copy,
  List,
  RefreshCw,
} from 'lucide-react';
import { BlogDto } from '@/types/api';
import { ApiClient } from '@/lib/api';
import { AquariumToggle } from '@/components/aquarium/AquariumToggle';
import { useBookmarks, useFollowedAuthors } from '@/hooks/useSocialStore';
import { BlogCard } from '@/components/BlogCard';

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default function PostPage({ params }: PostPageProps) {
  const resolvedParams = use(params);
  const rawId = resolvedParams.id;
  const blogId = Number(rawId);
  const router = useRouter();

  const [blog, setBlog] = useState<BlogDto | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(false);

  // Claps local optimistic state
  const [localClaps, setLocalClaps] = useState(0);
  const [userClaps, setUserClaps] = useState(0);

  const bookmarkedIds = useBookmarks();
  const followedAuthors = useFollowedAuthors();

  // Scroll Progress listener
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Blog & Related
  useEffect(() => {
    let isMounted = true;

    if (!Number.isFinite(blogId)) {
      Promise.resolve().then(() => {
        if (isMounted) setIsLoading(false);
      });
      return;
    }

    Promise.all([
      ApiClient.getBlogById(blogId),
      ApiClient.getBlogs(),
    ])
      .then(([b, all]) => {
        if (!isMounted) return;
        setBlog(b);
        setLocalClaps(b.clapsCount ?? b.likesCount ?? b.likes ?? 42);
        const related = all.filter((item) => (item.blogId ?? item.id) !== blogId).slice(0, 2);
        setRelatedBlogs(related);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [blogId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center font-mono text-xs text-zinc-500">
        <div className="space-y-3 text-center">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500" />
          <p className="tracking-widest uppercase">MAKALE OKUMA TUVALİ YÜKLENİYOR...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-3xl bg-white dark:bg-[#0d0f14] border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white">Makale Bulunamadı</h2>
          <p className="text-xs text-zinc-500">İstediğiniz teknik makale yayından kaldırılmış veya taşınmış olabilir.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-black text-xs font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Yayın Akışına Dön</span>
          </Link>
        </div>
      </div>
    );
  }

  const isBookmarked = bookmarkedIds.includes(blogId);
  const authorUsername = blog.authorUsername || 'admin';
  const authorDisplayName =
    blog.author ||
    (authorUsername === 'selindemir'
      ? 'Dr. Selin Demir'
      : authorUsername === 'caneraydin'
      ? 'Caner Aydın'
      : 'Abdullah Berke Özder');

  const isAuthorFollowed = followedAuthors.includes(authorUsername) || followedAuthors.includes(authorDisplayName);
  const initial = authorDisplayName.charAt(0).toUpperCase();

  const wordCount = (blog.content || '').split(/\s+/).filter(Boolean).length;
  const readingTime = blog.readTimeMinutes || Math.max(1, Math.ceil(wordCount / 180));
  const formattedDate = blog.publishedAt || blog.createdDate
    ? new Date(blog.publishedAt || blog.createdDate!).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '5 Kasım 2026';

  const toggleBookmark = () => {
    if (typeof window === 'undefined') return;
    try {
      const saved: number[] = JSON.parse(localStorage.getItem('novablog_bookmarks') || '[]');
      let updated: number[];
      if (saved.includes(blogId)) {
        updated = saved.filter((id) => id !== blogId);
      } else {
        updated = [...saved, blogId];
      }
      localStorage.setItem('novablog_bookmarks', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('bookmarks-updated', { detail: updated }));
      ApiClient.toggleBookmark(blogId);
    } catch {
      // ignore
    }
  };

  const toggleFollow = () => {
    if (typeof window === 'undefined') return;
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('novablog_followed_authors') || '[]');
      let updated: string[];
      if (saved.includes(authorUsername)) {
        updated = saved.filter((a) => a !== authorUsername);
      } else {
        updated = [...saved, authorUsername];
      }
      localStorage.setItem('novablog_followed_authors', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('followed-authors-updated', { detail: updated }));
      ApiClient.toggleFollow(authorUsername);
    } catch {
      // ignore
    }
  };

  const handleClap = () => {
    if (userClaps >= 50) return;
    setUserClaps((prev) => prev + 1);
    setLocalClaps((prev) => prev + 1);
    ApiClient.recordClap(blogId, 1);
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopiedLink(true);
      setTimeout(() => setIsCopiedLink(false), 2000);
    }
  };

  // Extract headings for Table of Contents
  const headings = (blog.content || '')
    .split('\n')
    .filter((line) => line.startsWith('## ') || line.startsWith('### '))
    .map((line) => {
      const level = line.startsWith('### ') ? 3 : 2;
      const text = line.replace(/^#{2,3}\s+/, '').trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return { level, text, id };
    });

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans transition-colors duration-300">
      {/* Top 3px Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 z-50 transition-all duration-100 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-[#08090c]/80 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title="Yayına Geri Dön"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Link href="/" className="font-mono text-lg font-black tracking-tighter text-zinc-950 dark:text-white">
              NOVA<span className="text-emerald-500">.</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {headings.length > 0 && (
              <button
                type="button"
                onClick={() => setIsTocOpen(!isTocOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                <List className="w-3.5 h-3.5 text-zinc-400" />
                <span>İçindekiler</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title="Bağlantıyı Kopyala"
            >
              {isCopiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
            <AquariumToggle compact compactWidth={80} className="shrink-0" />
          </div>
        </div>
      </header>

      {/* Main 720px Reading Canvas */}
      <main className="flex-1 max-w-[720px] mx-auto w-full px-4 sm:px-6 py-12 space-y-10">
        {/* Topic Tags Ribbon */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Title & Subheader */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-950 dark:text-white tracking-tight leading-[1.15]">
            {blog.title}
          </h1>
          {blog.header && (
            <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 font-serif leading-relaxed">
              {blog.header}
            </p>
          )}
        </div>

        {/* Author Meta Strip */}
        <div className="flex items-center justify-between py-4 border-y border-zinc-100 dark:border-zinc-800/80">
          <Link
            href={`/author/${encodeURIComponent(authorUsername)}`}
            className="flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 dark:bg-zinc-800 text-white flex items-center justify-center font-bold text-base uppercase shadow-md group-hover:ring-2 group-hover:ring-emerald-500 transition-all overflow-hidden shrink-0">
              {blog.authorImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={blog.authorImageUrl} alt={authorDisplayName} className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="min-w-0">
              <span className="text-sm font-bold text-zinc-950 dark:text-white group-hover:text-emerald-500 hover:underline block truncate">
                {authorDisplayName}
              </span>
              <span className="text-xs text-zinc-500 font-mono block">
                {formattedDate} &bull; {readingTime} dk okuma
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={toggleFollow}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              isAuthorFollowed
                ? 'bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-zinc-950 dark:bg-white text-white dark:text-black hover:opacity-90'
            }`}
          >
            {isAuthorFollowed ? 'Takip Ediliyor' : 'Takip Et'}
          </button>
        </div>

        {/* AI TL;DR Abstract Box */}
        {blog.aiSummary && (
          <div className="rounded-2xl p-6 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent border border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>YÖNETİCİ ÖZETİ (SPRING AI TL;DR)</span>
            </div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {blog.aiSummary}
            </p>
          </div>
        )}

        {/* Article Body */}
        <article className="prose prose-zinc dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 text-base sm:text-lg leading-[1.8] space-y-6">
          {(blog.content || '').split('\n\n').map((paragraph, idx) => {
            const p = paragraph.trim();
            if (!p) return null;

            // Heading 2
            if (p.startsWith('## ')) {
              const text = p.replace(/^##\s+/, '');
              const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              return (
                <h2 key={idx} id={id} className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white pt-6 pb-2 tracking-tight">
                  {text}
                </h2>
              );
            }

            // Heading 3
            if (p.startsWith('### ')) {
              const text = p.replace(/^###\s+/, '');
              const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              return (
                <h3 key={idx} id={id} className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-4 pb-1">
                  {text}
                </h3>
              );
            }

            // Code Block
            if (p.startsWith('```')) {
              const lines = p.split('\n');
              const lang = lines[0].replace('```', '') || 'java';
              const codeBody = lines.slice(1, -1).join('\n');

              return (
                <div key={idx} className="relative rounded-2xl bg-zinc-950 text-zinc-100 border border-zinc-800 overflow-hidden my-6">
                  <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-[11px] font-mono text-zinc-400">
                    <span className="uppercase">{lang}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(codeBody);
                          setCopiedCodeIdx(idx);
                          setTimeout(() => setCopiedCodeIdx(null), 2000);
                        }
                      }}
                      className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedCodeIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCodeIdx === idx ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
                    </button>
                  </div>
                  <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto text-emerald-400 bg-transparent m-0">
                    <code>{codeBody}</code>
                  </pre>
                </div>
              );
            }

            // Standard Paragraph
            return (
              <p key={idx} className="text-zinc-800 dark:text-zinc-200">
                {p}
              </p>
            );
          })}
        </article>

        {/* Author Signature Box */}
        <section className="mt-14 p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/author/${encodeURIComponent(authorUsername)}`}
              className="w-16 h-16 rounded-2xl bg-zinc-950 dark:bg-zinc-800 text-white flex items-center justify-center font-bold text-xl uppercase shadow-md overflow-hidden shrink-0 hover:ring-2 hover:ring-emerald-500 transition-all"
            >
              {blog.authorImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={blog.authorImageUrl} alt={authorDisplayName} className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </Link>
            <div className="space-y-1">
              <Link
                href={`/author/${encodeURIComponent(authorUsername)}`}
                className="font-bold text-zinc-950 dark:text-white text-base hover:text-emerald-500 hover:underline"
              >
                {authorDisplayName}
              </Link>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md">
                {blog.authorBio || 'Java 22, Loom Virtual Threads ve yüksek throughput mimarileri üzerine araştırmacı mühendis.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleFollow}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              isAuthorFollowed
                ? 'bg-zinc-200 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-zinc-950 dark:bg-white text-white dark:text-black hover:opacity-90'
            }`}
          >
            {isAuthorFollowed ? 'Takip Ediliyor' : 'Yazarı Takip Et'}
          </button>
        </section>

        {/* Related Articles */}
        {relatedBlogs.length > 0 && (
          <section className="space-y-6 pt-10 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
              Önerilen Diğer Yayınlar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedBlogs.map((b) => (
                <BlogCard
                  key={b.blogId ?? b.id}
                  blog={b}
                  onSelect={(selected) => router.push(`/post/${selected.blogId ?? selected.id}`)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Medium-Grade Floating Bottom Interaction Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-6 py-3 rounded-full bg-white/95 dark:bg-[#0f1117]/95 border border-zinc-200 dark:border-zinc-800 shadow-2xl backdrop-blur-xl">
        {/* Claps */}
        <button
          type="button"
          onClick={handleClap}
          className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-emerald-500 transition-colors cursor-pointer group"
          title="Alkışla (1-50)"
        >
          <span className="text-base group-hover:scale-125 transition-transform">👏</span>
          <span className="font-mono">{localClaps}</span>
          {userClaps > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              +{userClaps}
            </span>
          )}
        </button>

        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800" />

        {/* Bookmark */}
        <button
          type="button"
          onClick={toggleBookmark}
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-amber-500 transition-colors cursor-pointer"
          title="Okuma Listesine Kaydet"
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : 'text-zinc-400'}`} />
          <span className="hidden sm:inline">{isBookmarked ? 'Kaydedildi' : 'Kaydet'}</span>
        </button>

        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800" />

        {/* Share */}
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-emerald-500 transition-colors cursor-pointer"
          title="Makaleyi Paylaş"
        >
          <Share2 className="w-4 h-4 text-zinc-400" />
          <span className="hidden sm:inline">{isCopiedLink ? 'Kopyalandı' : 'Paylaş'}</span>
        </button>
      </div>
    </div>
  );
}
