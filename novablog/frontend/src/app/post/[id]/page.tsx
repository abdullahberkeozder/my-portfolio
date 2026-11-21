'use client';

import React, { use, useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Share2,
  Bookmark,
  Sparkles,
  Check,
  Copy,
  RefreshCw,
  MessageSquare,
  Send,
  ShieldCheck,
  AlertTriangle,
  Flag,
  Loader2,
  CheckCircle2,
  FileCode,
  Printer,
  Type,
  ListTree,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { BlogDto, CommentResponseDto, AiModerationResponseDto } from '@/types/api';
import { ApiClient } from '@/lib/api';
import { MOCK_BLOGS, MOCK_COMMENTS } from '@/lib/mockData';
import { useBookmarks, useFollowedAuthors } from '@/hooks/useSocialStore';
import { BlogCard } from '@/components/BlogCard';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { playKeyClick, playTabSelect, playSendWhoosh } from '@/lib/retroAudio';

interface PostPageProps {
  params: Promise<{ id: string }>;
}

function PostPageSkeleton() {
  return (
    <div className="min-h-screen safari-reader-backdrop flex items-center justify-center font-mono text-xs text-zinc-400">
      <div className="space-y-3 text-center">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500" />
        <p className="tracking-widest uppercase">SAFARI DESKTOP READER LOADING...</p>
      </div>
    </div>
  );
}

function PostContent({ params }: PostPageProps) {
  const resolvedParams = use(params);
  const rawId = resolvedParams.id;
  const blogId = Number(rawId);
  const router = useRouter();

  const initialMockBlog = Number.isFinite(blogId)
    ? MOCK_BLOGS.find((b) => (b.id ?? b.blogId) === blogId)
    : null;

  const [blog, setBlog] = useState<BlogDto | null>(() =>
    initialMockBlog ? ApiClient.normalizeBlog(initialMockBlog) : null
  );
  const [relatedBlogs, setRelatedBlogs] = useState<BlogDto[]>(() =>
    MOCK_BLOGS.filter((item) => (item.blogId ?? item.id) !== blogId).slice(0, 2).map((b) => ApiClient.normalizeBlog(b))
  );
  const [comments, setComments] = useState<CommentResponseDto[]>(() =>
    Number.isFinite(blogId) ? (MOCK_COMMENTS[blogId] || []) : []
  );
  const [isLoading, setIsLoading] = useState(() => !initialMockBlog);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBarVisible, setIsBarVisible] = useState(true);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [readerFontSize, setReaderFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Comment Form & AI Moderation state
  const [authorNameInput, setAuthorNameInput] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [moderationPreview, setModerationPreview] = useState<AiModerationResponseDto | null>(null);
  const [flaggedCommentIds, setFlaggedCommentIds] = useState<number[]>([]);

  // Claps local optimistic state
  const [localClaps, setLocalClaps] = useState(0);

  const bookmarkedIds = useBookmarks();
  const followedAuthors = useFollowedAuthors();

  // Scroll Progress and Auto-Retreating Reader HUD listener
  useEffect(() => {
    let lastY = window.scrollY;
    const handleScroll = () => {
      const currentY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (currentY / totalHeight) * 100));
        setScrollProgress(progress);
      }
      if (currentY > lastY + 20 && currentY > 180) {
        setIsBarVisible(false); // Retract when actively reading down
      } else if (currentY < lastY - 10) {
        setIsBarVisible(true); // Reveal on pause or scroll up
      }
      lastY = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Blog, Related & Comments
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
      ApiClient.getComments(blogId),
    ])
      .then(([b, all, comms]) => {
        if (!isMounted) return;
        setBlog(b);
        setComments(comms || []);
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

  // Debounced AI Content Moderation for live feedback
  useEffect(() => {
    if (!newCommentText.trim() || newCommentText.trim().length < 8) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const result = await ApiClient.moderateContent(newCommentText);
        setModerationPreview(result);
      } catch {
        // ignore
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [newCommentText]);

  if (isLoading) {
    return <PostPageSkeleton />;
  }

  if (!blog) {
    return (
      <div className="min-h-screen safari-reader-backdrop flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-xl bg-white dark:bg-[#181a1d] border border-zinc-300 dark:border-zinc-800 shadow-2xl">
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white font-sans">Article Not Found</h2>
          <p className="text-xs text-zinc-500 font-sans">The requested technical article may have been unpublished or moved.</p>
          <button
            type="button"
            onClick={() => {
              playKeyClick();
              router.push('/');
            }}
            className="mac-aqua-btn mac-aqua-btn-primary px-5 py-2 text-xs font-bold gap-1.5"
          >
            <span>&lt; Return to Feed</span>
          </button>
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
      ? 'Caner Aydin'
      : 'Abdullah Berke Ozder');

  const isAuthorFollowed = followedAuthors.includes(authorUsername) || followedAuthors.includes(authorDisplayName);
  const initial = authorDisplayName.charAt(0).toUpperCase();

  const wordCount = (blog.content || '').split(/\s+/).filter(Boolean).length;
  const readingTime = blog.readTimeMinutes || Math.max(1, Math.ceil(wordCount / 180));
  const formattedDate = blog.publishedAt || blog.createdDate
    ? new Date(blog.publishedAt || blog.createdDate!).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'November 5, 2026';

  const toggleBookmark = () => {
    playTabSelect();
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
    playKeyClick();
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
    playKeyClick();
    setLocalClaps((prev) => prev + 1);
    ApiClient.recordClap(blogId, 1);
  };

  const handleShare = () => {
    playKeyClick();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopiedLink(true);
      setTimeout(() => setIsCopiedLink(false), 2000);
    }
  };

  const handlePrint = () => {
    playKeyClick();
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const cycleFontSize = () => {
    playKeyClick();
    if (readerFontSize === 'normal') setReaderFontSize('large');
    else if (readerFontSize === 'large') setReaderFontSize('xlarge');
    else setReaderFontSize('normal');
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || isSubmittingComment) return;
    playSendWhoosh();

    setIsSubmittingComment(true);
    const authorName = authorNameInput.trim() || 'Visiting Engineer';

    try {
      const res = await ApiClient.addComment(blogId, {
        content: newCommentText.trim(),
        authorName,
      });

      setComments((prev) => [res, ...prev]);
      setNewCommentText('');
      setModerationPreview(null);
    } catch {
      // Fallback optimistic comment
      const fallbackComment: CommentResponseDto = {
        id: Date.now(),
        blogId,
        content: newCommentText.trim(),
        authorName,
        createdAt: new Date().toISOString(),
        isApproved: true,
        sentiment: 'POSITIVE',
      };
      setComments((prev) => [fallbackComment, ...prev]);
      setNewCommentText('');
      setModerationPreview(null);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleFlagComment = async (commentId: number) => {
    playKeyClick();
    setFlaggedCommentIds((prev) => [...prev, commentId]);
    try {
      await ApiClient.flagComment(commentId, 'Flagged as inappropriate by community');
    } catch {
      // ignore
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

  const textSizeClass =
    readerFontSize === 'xlarge'
      ? 'text-lg sm:text-xl leading-loose'
      : readerFontSize === 'large'
      ? 'text-base sm:text-lg leading-loose'
      : 'text-sm sm:text-base leading-relaxed sm:leading-loose';

  return (
    <div className="min-h-screen safari-reader-backdrop flex flex-col font-sans transition-colors duration-300">
      {/* 1. Unified Mac OS X Desktop Header */}
      <Navbar
        isBackendOnline={true}
        onRefreshHealth={() => {}}
      />

      {/* 2. Top Sticky Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 z-50 transition-all duration-100 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* 3. Safari Reader Floating HUD Bar */}
      <div className="sticky top-14 z-40 w-full flex justify-center py-2 px-4 pointer-events-none">
        <div className="safari-floating-hud pointer-events-auto">
          {/* < Geri Pointed Chevron */}
          <button
            type="button"
            onClick={() => {
              playKeyClick();
              router.push('/');
            }}
            className="ios-back-chevron mr-1"
            title="Return to Feed"
          >
            <span>&lt; Back</span>
          </button>

          {/* Typography 'aA' Font Scaler */}
          <button
            type="button"
            onClick={cycleFontSize}
            className="safari-hud-btn"
            title={`Font Size (Current: ${
              readerFontSize === 'normal' ? 'Standard' : readerFontSize === 'large' ? 'Large' : 'Extra Large'
            })`}
          >
            <Type className="w-3.5 h-3.5" />
            <span className="font-serif font-bold text-xs">
              {readerFontSize === 'normal' ? 'aA' : readerFontSize === 'large' ? 'aA+' : 'aA++'}
            </span>
          </button>

          {/* Table of Contents Dropdown Trigger */}
          {headings.length > 0 && (
            <button
              type="button"
              onClick={() => {
                playKeyClick();
                setIsTocOpen(!isTocOpen);
              }}
              className={`safari-hud-btn ${isTocOpen ? 'bg-white/20' : ''}`}
              title="Table of Contents"
            >
              <ListTree className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Contents</span>
              {isTocOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}

          {/* Print Article */}
          <button
            type="button"
            onClick={handlePrint}
            className="safari-hud-btn hidden md:inline-flex"
            title="Print Article"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {/* Share Article */}
          <button
            type="button"
            onClick={handleShare}
            className="safari-hud-btn"
            title="Copy Link"
          >
            {isCopiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isCopiedLink ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Table of Contents Popover HUD */}
      {isTocOpen && headings.length > 0 && (
        <div className="fixed top-32 z-50 left-1/2 -translate-x-1/2 max-w-lg w-full px-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-xl bg-zinc-900/95 border border-zinc-700 shadow-2xl text-xs font-mono space-y-2 text-white">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              SAFARI TABLE OF CONTENTS
            </span>
            <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-thin">
              {headings.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    playKeyClick();
                    setIsTocOpen(false);
                    const target = document.getElementById(item.id);
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer truncate block ${
                    item.level === 3 ? 'pl-5 text-zinc-400' : 'font-semibold text-zinc-200'
                  }`}
                >
                  &rarr; {item.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Main 740px Safari Reader Warm Parchment Canvas */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-8 pt-8 pb-48 my-4 safari-reader-parchment space-y-8">
        {/* Topic Tags Ribbon & Dispatch Identifier */}
        <div className="flex flex-wrap items-center gap-2">
          {blog.publicationType === 'dispatch' && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wider uppercase border shadow-sm ${
                blog.isBreaking
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                  : 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  blog.isBreaking ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'
                }`}
              />
              {blog.isBreaking ? '⚡ LIVE BREAKING NEWS' : '📡 TECH DISPATCH'}
            </span>
          )}

          {blog.tags &&
            blog.tags.map((tag) => (
              <span key={tag} className="retro-tag-pill uppercase">
                #{tag}
              </span>
            ))}
          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded text-[11px] font-bold border border-emerald-500/20 font-mono">
            <CheckCircle2 className="w-3 h-3" />
            VECTOR INDEX (128D)
          </span>
        </div>

        {/* Title & Subheader */}
        <div className="space-y-3 border-b border-black/10 dark:border-white/10 pb-6">
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-zinc-950 dark:text-white tracking-tight leading-snug">
            {blog.title}
          </h1>
          {blog.header && (
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-sans italic leading-relaxed">
              &ldquo;{blog.header}&rdquo;
            </p>
          )}

          {/* Author Meta Strip with Brushed Silver Avatar */}
          <div className="flex items-center justify-between pt-4">
            <Link
              href={`/author/${encodeURIComponent(authorUsername)}`}
              onClick={() => playKeyClick()}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="retro-avatar-silver shrink-0">
                <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs uppercase shadow-inner overflow-hidden">
                  {blog.authorImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={blog.authorImageUrl} alt={authorDisplayName} className="w-full h-full object-cover" />
                  ) : (
                    initial
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <span className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 hover:underline block truncate">
                  {authorDisplayName}
                </span>
                <span className="text-[11px] text-zinc-500 font-mono block">
                  {formattedDate} &bull; {readingTime} min read
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={toggleFollow}
              className={`mac-aqua-btn ${
                isAuthorFollowed ? 'mac-aqua-btn-silver' : 'mac-aqua-btn-primary'
              } !px-4 !py-1.5 !text-xs font-bold gap-1 cursor-pointer`}
            >
              {isAuthorFollowed ? 'Following' : 'Follow Author'}
            </button>
          </div>
        </div>

        {/* Via Source Canonical Citation Banner */}
        {blog.viaSource && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-black/10 dark:border-white/10 text-xs font-mono shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">SOURCE ATTRIBUTION:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{blog.viaSource}</span>
            </div>
            {blog.viaUrl && (
              <a
                href={blog.viaUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playKeyClick()}
                className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-bold"
              >
                <span>Visit Original Release</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Nova Editorial Engineering Commentary */}
        {blog.editorialTake && (
          <div className="rounded-xl p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-teal-500/5 border border-blue-400/40 space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>NOVA ENGINEERING EVALUATION</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed italic text-zinc-800 dark:text-zinc-200 font-sans">
              &ldquo;{blog.editorialTake}&rdquo;
            </p>
          </div>
        )}

        {/* AI TL;DR Abstract Box (Skeuomorphic Recessed Tray) */}
        {blog.aiSummary && (
          <div className="rounded-xl p-5 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-teal-500/5 border border-blue-400/30 space-y-2 shadow-inner">
            <div className="flex items-center justify-between font-mono text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <Sparkles className="w-4 h-4" />
                SPRING AI // 1-MINUTE EXECUTIVE SUMMARY
              </span>
              <span className="text-[10px] text-blue-700 dark:text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-400/20">
                pgvector 128D
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
              {blog.aiSummary}
            </p>
          </div>
        )}

        {/* Article Body */}
        <article className="prose prose-zinc dark:prose-invert max-w-none text-zinc-900 dark:text-zinc-100 space-y-6">
          {(blog.content || '').split('\n\n').map((paragraph, idx) => {
            const p = paragraph.trim();
            if (!p) return null;

            // Heading 2
            if (p.startsWith('## ')) {
              const text = p.replace(/^##\s+/, '');
              const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              return (
                <h2 key={idx} id={id} className="text-xl sm:text-2xl font-serif font-bold text-zinc-950 dark:text-white pt-6 pb-2 tracking-tight border-b border-black/10 dark:border-white/10">
                  {text}
                </h2>
              );
            }

            // Heading 3
            if (p.startsWith('### ')) {
              const text = p.replace(/^###\s+/, '');
              const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              return (
                <h3 key={idx} id={id} className="text-lg sm:text-xl font-serif font-bold text-zinc-950 dark:text-white pt-4 pb-1">
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
                <div key={idx} className="my-5 rounded-lg overflow-hidden border border-zinc-700/80 bg-[#1e2024] text-zinc-100 shadow-xl">
                  <div className="flex items-center justify-between px-4 py-2 bg-[#16171a] border-b border-zinc-800 text-[11px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1.5 uppercase font-bold text-emerald-400">
                      <FileCode className="w-3.5 h-3.5" />
                      {lang || 'JAVA'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        playKeyClick();
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(codeBody);
                          setCopiedCodeIdx(idx);
                          setTimeout(() => setCopiedCodeIdx(null), 2000);
                        }
                      }}
                      className="ios6-btn ios6-btn-dark px-2.5 py-0.5 text-[10px] font-mono"
                    >
                      {copiedCodeIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCodeIdx === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-4 sm:p-5 overflow-x-auto text-xs font-mono text-emerald-300 leading-relaxed scrollbar-thin">
                    <code>{codeBody}</code>
                  </pre>
                </div>
              );
            }

            // Standard Paragraph
            return (
              <p key={idx} className={`${textSizeClass} text-zinc-900 dark:text-zinc-100 font-serif leading-relaxed sm:leading-loose selection:bg-emerald-500/20`}>
                {p}
              </p>
            );
          })}
        </article>

        {/* Author Signature Box */}
        <section className="mt-10 p-6 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-300 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <Link
              href={`/author/${encodeURIComponent(authorUsername)}`}
              onClick={() => playKeyClick()}
              className="retro-avatar-silver shrink-0"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-base uppercase shadow-md overflow-hidden">
                {blog.authorImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={blog.authorImageUrl} alt={authorDisplayName} className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </div>
            </Link>
            <div className="space-y-1">
              <Link
                href={`/author/${encodeURIComponent(authorUsername)}`}
                onClick={() => playKeyClick()}
                className="font-bold text-zinc-950 dark:text-white text-base hover:text-blue-600 hover:underline block"
              >
                {authorDisplayName}
              </Link>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md font-sans">
                {blog.authorBio || 'Research engineer specializing in Java 22, Project Loom Virtual Threads, and high-throughput systems.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleFollow}
            className={`mac-aqua-btn ${
              isAuthorFollowed ? 'mac-aqua-btn-silver' : 'mac-aqua-btn-primary'
            } !px-4 !py-2 !text-xs font-bold gap-1.5 cursor-pointer whitespace-nowrap`}
          >
            {isAuthorFollowed ? 'Following' : 'Follow Author'}
          </button>
        </section>

        {/* 6. Desktop iMessage Two-Column Discussion & Comments Thread */}
        <section id="comments-discussion-section" className="pt-8 border-t border-black/10 dark:border-white/10 space-y-6 scroll-mt-20">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2 font-mono">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span>MESSAGES &amp; DISCUSSIONS ({comments.length})</span>
            </h3>

            {/* Glowing Spring AI Verified Safe Seal Badge */}
            <div className="spring-ai-shield-badge">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Spring AI Verified Safe</span>
            </div>
          </div>

          {/* Skeuomorphic Comment Form */}
          <form onSubmit={handleAddComment} className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 space-y-3 shadow-inner">
            <input
              id="comment-author-name-input"
              name="authorName"
              type="text"
              placeholder="Your name or title (e.g. Sarah Connor - Platform Architect)"
              value={authorNameInput}
              onChange={(e) => setAuthorNameInput(e.target.value)}
              className="w-full sm:w-80 px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-sans text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
            />

            <textarea
              id="comment-body-textarea"
              name="commentBody"
              rows={3}
              placeholder="Add your architectural or technical evaluation... (Spring AI live toxicity and sentiment analysis enabled)"
              value={newCommentText}
              onChange={(e) => {
                setNewCommentText(e.target.value);
                if (!e.target.value.trim()) {
                  setModerationPreview(null);
                }
              }}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-sans text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors leading-relaxed shadow-inner"
            />

            {/* Live AI Moderation Status Badge */}
            {moderationPreview && (
              <div
                className={`p-2 rounded-lg text-xs font-mono flex items-center justify-between border ${
                  moderationPreview.toxic
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-300'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {moderationPreview.toxic ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  )}
                  <span>
                    {moderationPreview.toxic
                      ? 'Spring AI Alert: Inappropriate content detected. Comment quarantined.'
                      : 'Spring AI Analysis: Meets community standards.'}
                  </span>
                </div>
                <span className="uppercase font-bold text-[10px]">
                  Sentiment: {moderationPreview.sentiment}
                </span>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmittingComment || !newCommentText.trim()}
                className="mac-aqua-btn mac-aqua-btn-primary !px-4 !py-2 !text-xs font-bold gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
              >
                {isSubmittingComment ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-white" />
                )}
                <span>Send Message</span>
              </button>
            </div>
          </form>

          {/* iMessage Speech Bubbles List */}
          <div className="space-y-4 pt-2">
            {isLoading ? (
              <div className="py-6 text-center font-mono text-xs text-zinc-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                <span>LOADING COMMENTS...</span>
              </div>
            ) : comments.length > 0 ? (
              comments.map((comm) => {
                const isFlagged = flaggedCommentIds.includes(comm.id) || comm.moderationStatus === 'FLAGGED_TOXIC';
                const isApproved = comm.isApproved !== false && !isFlagged;
                const bubbleClass = isApproved
                  ? 'imessage-bubble-green'
                  : 'imessage-bubble-gray';

                return (
                  <div key={comm.id} className="space-y-1">
                    {/* Timestamp & Author Meta Header */}
                    <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 px-2">
                      <span className="font-bold text-zinc-800 dark:text-zinc-300">{comm.authorName || 'Anonymous Engineer'}</span>
                      <span>&bull;</span>
                      <span>{new Date(comm.createdAt).toLocaleDateString('tr-TR')}</span>
                      {isApproved && (
                        <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> APPROVED
                        </span>
                      )}
                      {!isFlagged ? (
                        <button
                          type="button"
                          onClick={() => handleFlagComment(comm.id)}
                          className="text-zinc-400 hover:text-rose-500 cursor-pointer ml-auto"
                          title="Report Inappropriate Content"
                        >
                          <Flag className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-rose-500 font-bold uppercase ml-auto">
                          [Quarantined]
                        </span>
                      )}
                    </div>

                    {/* Speech Bubble */}
                    <div className="max-w-xl">
                      <div className={bubbleClass}>
                        <p className="text-xs sm:text-sm leading-relaxed font-sans">
                          {isFlagged ? 'This comment is quarantined pending community moderation review.' : comm.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 p-6 space-y-1">
                <p className="text-xs font-bold text-zinc-950 dark:text-white">Be the first to share a technical comment</p>
                <p className="text-[11px] text-zinc-500">Share your architectural insights and questions in this iMessage thread.</p>
              </div>
            )}
          </div>
        </section>

        {/* 7. Related Articles */}
        {relatedBlogs.length > 0 && (
          <section className="space-y-4 pt-8 border-t border-black/10 dark:border-white/10">
            <h3 className="text-base font-bold text-zinc-950 dark:text-white font-mono">
              RECOMMENDED PUBLICATIONS
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

      {/* 8. 49px Safari Reader Sticky Bottom Interaction Dock (Auto-Retreats on downscroll) */}
      <div
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 safari-reader-dock rounded-2xl w-[90%] max-w-lg shadow-2xl transition-all duration-300 ease-out ${
          isBarVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Claps */}
          <button
            type="button"
            onClick={handleClap}
            className="mac-aqua-btn mac-aqua-btn-primary !px-3.5 !py-1.5 !text-xs font-bold gap-1.5"
            title="Applaud (Medium Clap)"
          >
            <span className="text-sm leading-none">👏</span>
            <span className="font-mono">{localClaps}</span>
          </button>

          {/* Comments Jump Button */}
          <button
            type="button"
            onClick={() => {
              playKeyClick();
              const el = document.getElementById('comments-discussion-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="mac-aqua-btn mac-aqua-btn-silver !px-3.5 !py-1.5 !text-xs font-semibold gap-1.5"
            title="Jump to Messages"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="font-mono">{comments.length}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Bookmark */}
          <button
            type="button"
            onClick={toggleBookmark}
            className={`mac-aqua-btn ${
              isBookmarked ? 'mac-aqua-btn-silver' : '!bg-[#1e222a] border border-white/20 text-white'
            } !px-3.5 !py-1.5 !text-xs font-bold gap-1.5`}
            title="Add to Safari Reading List"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span className="hidden sm:inline">{isBookmarked ? 'SAVED' : 'READING LIST'}</span>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="mac-aqua-btn mac-aqua-btn-silver !px-3.5 !py-1.5 !text-xs font-semibold gap-1.5"
            title="Copy Article Link"
          >
            {isCopiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 9. Apple Classic Directory Footer */}
      <Footer />
    </div>
  );
}

export default function PostPage(props: PostPageProps) {
  return (
    <Suspense fallback={<PostPageSkeleton />}>
      <PostContent {...props} />
    </Suspense>
  );
}
