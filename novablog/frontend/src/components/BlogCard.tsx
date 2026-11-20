'use client';

import React, { useState } from 'react';
import { BlogDto } from '@/types/api';
import { ApiClient } from '@/lib/api';
import { useToggleLikeMutation } from '@/hooks/useBlogs';
import { useBookmarks } from '@/hooks/useSocialStore';
import { playKeyClick, playTabSelect } from '@/lib/retroAudio';
import {
  Sparkles,
  Calendar,
  Loader2,
  Clock,
  Share2,
  Check,
  Bookmark,
  MessageSquare,
  ExternalLink,
  Radio,
} from 'lucide-react';

interface BlogCardProps {
  blog: BlogDto;
  onSelect: (blog: BlogDto) => void;
  onTagClick?: (tag: string) => void;
  onAuthorClick?: (authorName: string) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog, onSelect, onTagClick, onAuthorClick }) => {
  const [summary, setSummary] = useState<string | undefined>(blog.aiSummary);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const toggleLikeMutation = useToggleLikeMutation();
  const blogId = blog.id ?? blog.blogId;

  const bookmarkedIds = useBookmarks();
  const isBookmarked = Boolean(blogId && bookmarkedIds.includes(blogId));

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTabSelect();
    if (!blogId || typeof window === 'undefined') return;
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

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    playKeyClick();
    if (!blogId) return;
    toggleLikeMutation.mutate({
      blogId,
      currentlyLiked: Boolean(blog.isLiked),
    });
    // Send Medium-style clap to backend API
    ApiClient.clapBlog(blogId, 1);
  };

  const handleFetchSummary = async (e: React.MouseEvent) => {
    e.stopPropagation();
    playKeyClick();
    if (summary) {
      setShowSummary(!showSummary);
      return;
    }
    if (!blogId) return;

    setIsLoadingSummary(true);
    try {
      const res = await ApiClient.generateBlogSummary(blogId);
      setSummary(res.aiSummary);
      setShowSummary(true);
    } catch {
      setSummary('Özet çıkarılamadı.');
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    playKeyClick();
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/#blog-${blogId}`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const wordCount = (blog.content || '').split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 180));

  const formattedDate = blog.publishedAt || blog.createdDate
    ? new Date(blog.publishedAt || blog.createdDate!).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '5 Kas 2026';

  const liveLikes = blog.likesCount ?? blog.likes ?? 0;

  // Clean, markdown-free excerpt for card preview
  const rawExcerpt = (blog.content || '')
    .replace(/^#+\s+[^\n]+/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[`*#_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const authorUsername = blog.authorUsername || blog.author || 'admin';
  const authorDisplayName =
    blog.authorUsername === 'selindemir'
      ? 'Dr. Selin Demir'
      : blog.authorUsername === 'caneraydin'
      ? 'Caner Aydın'
      : blog.author || 'Abdullah Berke Özder';
  const authorInitial = authorDisplayName.charAt(0).toUpperCase();
  const authorTitle =
    blog.authorTitle ||
    (blog.authorUsername === 'selindemir'
      ? 'Principal AI Researcher'
      : blog.authorUsername === 'caneraydin'
      ? 'Staff Cloud Architect'
      : 'Senior Systems Architect');
  const authorAvatarUrl = blog.authorImageUrl;

  const categoryName = blog.blogCategoryDto?.categoryName || blog.category?.categoryName;
  const liveClaps = (blog.clapsCount && blog.clapsCount > 0) ? blog.clapsCount : liveLikes;
  const commentCount = blog.commentCount ?? (blog as unknown as { comments?: unknown[] }).comments?.length ?? 0;

  return (
    <article
      onClick={() => {
        playKeyClick();
        onSelect(blog);
      }}
      className="group ios-grouped-table-card p-5 sm:p-6 flex flex-col justify-between space-y-4 cursor-pointer"
    >
      <div className="space-y-3.5">
        {/* 1. Mac Mail / Contacts Header: Brushed Silver Coin Avatar & Author Info */}
        <div className="flex items-center justify-between gap-3 text-xs ios-etched-divider pb-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playKeyClick();
              if (onAuthorClick) {
                onAuthorClick(authorUsername);
              }
            }}
            className="flex items-center gap-2.5 min-w-0 group/author cursor-pointer text-left bg-transparent border-none p-0"
            title={`${authorDisplayName} profilini görüntüle`}
          >
            {/* Brushed-silver coin avatar ring */}
            <div className="retro-avatar-silver shrink-0">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-b from-zinc-800 to-zinc-950 text-white flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                {authorAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={authorAvatarUrl}
                    alt={authorDisplayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  authorInitial
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 min-w-0 font-medium text-zinc-800 dark:text-zinc-200 truncate">
              <span className="font-bold group-hover/author:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {authorDisplayName}
              </span>
              <span className="text-zinc-400 dark:text-zinc-500 text-[11px] truncate hidden md:inline">
                ({authorTitle})
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
              <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1 shrink-0 text-[11px]">
                <Calendar className="w-3 h-3 text-zinc-400" />
                {formattedDate}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">&bull;</span>
              <span className="text-zinc-500 dark:text-zinc-400 hidden sm:flex items-center gap-1 shrink-0 text-[11px]">
                <Clock className="w-3 h-3 text-zinc-400" />
                {readingTime} dk
              </span>
            </div>
          </button>

          {/* Top Actions: Copy Link & Bookmark */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleCopyLink}
              title={isCopied ? 'Bağlantı Kopyalandı' : 'Yazı Bağlantısını Kopyala'}
              className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleToggleBookmark}
              title={isBookmarked ? 'Okuma listesinden kaldır' : 'Daha sonra oku (Safari Reading List)'}
              className={`p-1.5 rounded-md transition-all ${
                isBookmarked
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border border-amber-300/50 dark:border-amber-700/50'
                  : 'text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dispatch Ribbon & Via Source Attribution */}
        {blog.publicationType === 'dispatch' && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 pb-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border shadow-sm ${
                  blog.isBreaking
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                    : 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    blog.isBreaking ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'
                  }`}
                />
                {blog.isBreaking ? '⚡ FLAŞ HABER' : '📡 DİSPAÇ'}
              </span>

              {blog.header && (
                <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 dark:text-zinc-400 font-semibold truncate max-w-[220px]">
                  {blog.header}
                </span>
              )}
            </div>

            {blog.viaSource && (
              <a
                href={blog.viaUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  playKeyClick();
                }}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-2 py-0.5 rounded border border-black/10 dark:border-white/10"
                title={`Orijinal Kaynağı Görüntüle: ${blog.viaSource}`}
              >
                <span className="opacity-70 font-sans">via</span>
                <span className="font-semibold underline underline-offset-2">{blog.viaSource}</span>
                <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
              </a>
            )}
          </div>
        )}

        {/* 2. Article Title & Excerpt */}
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug tracking-tight font-sans">
            {blog.title}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {rawExcerpt}
          </p>
        </div>

        {/* Editorial Take / Mühendislik Yorumu */}
        {blog.editorialTake && (
          <div className="rounded-lg p-2.5 bg-gradient-to-r from-blue-50/90 to-indigo-50/60 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs text-zinc-800 dark:text-zinc-300 space-y-1 shadow-sm">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider uppercase text-blue-700 dark:text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>MÜHENDİSLİK DEĞERLENDİRMESİ</span>
            </div>
            <p className="text-[11px] leading-relaxed italic text-zinc-700 dark:text-zinc-300 font-sans">
              &ldquo;{blog.editorialTake}&rdquo;
            </p>
          </div>
        )}

        {/* 3. Expandable Recessed AI TL;DR (Accordion) */}
        {showSummary && summary && (
          <div className="rounded-lg p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-inner text-xs text-zinc-800 dark:text-zinc-200 space-y-1.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5 text-zinc-900 dark:text-white">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                1 DAKİKALIK YÖNETİCİ ÖZETİ (SPRING AI)
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playKeyClick();
                  setShowSummary(false);
                }}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                Gizle
              </button>
            </div>
            <p className="leading-relaxed font-sans">{summary}</p>
          </div>
        )}
      </div>

      {/* 4. Bottom Footer: Topic Tags, Skeuomorphic Action Buttons & Disclosure */}
      <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-black/10 dark:border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        {/* Left: Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categoryName && (
            <span className="retro-tag-pill uppercase">
              {categoryName}
            </span>
          )}
          {blog.tags &&
            blog.tags.slice(0, 2).map((tag, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  playKeyClick();
                  if (onTagClick) onTagClick(tag);
                }}
                className="retro-tag-pill uppercase cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
              >
                #{tag}
              </button>
            ))}
        </div>

        {/* Right: Interaction Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick AI Summary Button (Silver Skeuomorphic Button) */}
          <button
            onClick={handleFetchSummary}
            disabled={isLoadingSummary}
            className="mac-btn-aluminum !min-h-[28px] !px-2.5 !py-1 text-[11px] font-semibold"
            title="Spring AI ile Yönetici Özeti"
          >
            {isLoadingSummary ? (
              <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
            ) : (
              <Sparkles className="w-3 h-3 text-blue-500" />
            )}
            <span>{showSummary ? 'Gizle' : 'Özet'}</span>
          </button>

          {/* Claps / Likes (Aqua Primary Gloss Button) */}
          <button
            onClick={handleToggleLike}
            className="mac-aqua-btn-primary !min-h-[28px] !px-2.5 !py-1 text-[11px] font-bold"
            title="Alkışla (Medium Clap)"
          >
            <span className="text-xs">👏</span>
            <span>{liveClaps}</span>
          </button>

          {/* Comments count (Mac Aqua Notification Badge) */}
          <span className="mac-aqua-comment-badge" title={`${commentCount} Yorum`}>
            <MessageSquare className="w-3 h-3" />
            <span>{commentCount}</span>
          </span>

          {/* Classic iOS / Mac Right Disclosure Arrow */}
          <div className="pl-1 flex items-center justify-center">
            <span className="ios-disclosure-arrow group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </article>
  );
};
