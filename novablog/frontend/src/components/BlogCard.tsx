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
      setSummary('Failed to generate summary.');
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
    ? new Date(blog.publishedAt || blog.createdDate!).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Nov 5, 2026';

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
      ? 'Caner Aydin'
      : blog.author || 'Abdullah Berke Ozder';
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
      className="group mac9-blog-card p-4 sm:p-5 flex flex-col justify-between space-y-3 cursor-pointer transition-all duration-150"
    >
      <div className="space-y-2.5">
        {/* 1. Mac OS 9 Platinum Author Header & Badges */}
        <div className="flex items-center justify-between gap-2 text-xs border-b border-[#A0A0A0] dark:border-[#333742] pb-2 shadow-[0_1px_0_#FFFFFF] dark:shadow-none">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playKeyClick();
              if (onAuthorClick) {
                onAuthorClick(authorUsername);
              }
            }}
            className="flex items-center gap-2 min-w-0 group/author cursor-pointer text-left bg-transparent border-none p-0"
            title={`View ${authorDisplayName}'s profile`}
          >
            {/* Mac OS 9 Beveled Coin Avatar */}
            <div className="retro-avatar-silver shrink-0">
              <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-b from-[#404040] to-[#1F1F1F] text-white flex items-center justify-center font-bold text-[11px] uppercase shadow-inner">
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

            <div className="flex items-center gap-1.5 min-w-0 font-medium text-zinc-800 dark:text-zinc-200 truncate font-['Geneva',sans-serif]">
              <span className="font-bold text-xs group-hover/author:text-[#333399] dark:group-hover/author:text-[#818CF8] transition-colors">
                {authorDisplayName}
              </span>
              <span className="text-zinc-400 dark:text-zinc-600">&bull;</span>
              <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1 shrink-0 text-[11px]">
                {formattedDate}
              </span>
              <span className="text-zinc-400 dark:text-zinc-600 hidden sm:inline">&bull;</span>
              <span className="text-zinc-600 dark:text-zinc-400 hidden sm:flex items-center gap-1 shrink-0 text-[11px]">
                {readingTime} min read
              </span>
              {blog.publicationType === 'dispatch' && (
                <span
                  className={`mac9-chip-tag !py-0 !px-1.5 text-[9px] uppercase shrink-0 ${
                    blog.isBreaking
                      ? '!border-amber-600 !text-amber-700 dark:!text-amber-400'
                      : '!border-[#333399] !text-[#333399] dark:!text-[#818CF8]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      blog.isBreaking ? 'bg-amber-500 animate-pulse' : 'bg-[#333399] dark:bg-[#818CF8]'
                    }`}
                  />
                  {blog.isBreaking ? 'BREAKING' : 'DISPATCH'}
                </span>
              )}
            </div>
          </button>

          {/* Top Actions: Via Source & Bookmark/Share */}
          <div className="flex items-center gap-1 shrink-0">
            {blog.viaSource && (
              <a
                href={blog.viaUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  playKeyClick();
                }}
                className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-[#333399] dark:hover:text-[#818CF8] px-1.5 py-0.5 rounded border border-[#A0A0A0] dark:border-[#383D47] bg-[#F0F0F0] dark:bg-[#1A1C22]"
                title={`View original source: ${blog.viaSource}`}
              >
                <span>via</span>
                <span className="underline truncate max-w-[80px]">{blog.viaSource}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            )}
            <button
              onClick={handleCopyLink}
              title={isCopied ? 'Link Copied' : 'Copy Article Link'}
              className="p-1 rounded hover:bg-[#DDD] dark:hover:bg-[#2A2C34] text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleToggleBookmark}
              title={isBookmarked ? 'Remove from reading list' : 'Save to Mac OS 9 Reading List'}
              className={`p-1 rounded transition-all ${
                isBookmarked
                  ? 'text-amber-600 bg-amber-100 dark:bg-amber-950/40 border border-amber-400'
                  : 'text-zinc-500 hover:text-black dark:hover:text-white hover:bg-[#DDD] dark:hover:bg-[#2A2C34]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* 2. Article Title & Excerpt */}
        <div className="space-y-1">
          <h3 className="font-['Charcoal',sans-serif] text-[15px] sm:text-[16px] font-bold text-zinc-950 dark:text-white group-hover:text-[#333399] dark:group-hover:text-[#818CF8] transition-colors leading-snug line-clamp-2">
            {blog.title}
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed font-['Geneva',sans-serif]">
            {rawExcerpt}
          </p>
        </div>

        {/* 3. Streamlined Editorial Take / Engineering Commentary */}
        {blog.editorialTake && (
          <div className="border-l-2 border-[#333399] dark:border-[#818CF8] pl-2 py-0.5 text-[11px] text-zinc-800 dark:text-zinc-200 italic line-clamp-1 bg-[#ECECEC] dark:bg-[#1E2026] rounded-r border border-[#C0C0C0] dark:border-[#2D3038]">
            <span className="font-semibold text-[#333399] dark:text-[#818CF8] not-italic font-mono mr-1 text-[10px] uppercase">
              Engineering Take:
            </span>
            &ldquo;{blog.editorialTake}&rdquo;
          </div>
        )}

        {/* Expandable Recessed AI TL;DR (Accordion) */}
        {showSummary && summary && (
          <div className="mac9-inset-box p-2.5 rounded-[2px] bg-white dark:bg-[#16181D] text-xs text-zinc-800 dark:text-zinc-200 space-y-1 animate-in fade-in duration-200 font-['Geneva',sans-serif]">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1 text-[#333399] dark:text-[#818CF8]">
                <Sparkles className="w-3 h-3" />
                1-MINUTE SUMMARY (SPRING AI)
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playKeyClick();
                  setShowSummary(false);
                }}
                className="text-zinc-500 hover:text-black dark:hover:text-white"
              >
                Hide
              </button>
            </div>
            <p className="leading-relaxed text-xs">{summary}</p>
          </div>
        )}
      </div>

      {/* 4. Bottom Footer: Topic Tags & Platinum Action Buttons */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-1.5 text-xs border-t border-[#A0A0A0] dark:border-[#333742] shadow-[0_1px_0_#FFFFFF] dark:shadow-none">
        {/* Left: Tags */}
        <div className="flex items-center gap-1.5 overflow-hidden">
          {categoryName && (
            <span className="mac9-chip-tag uppercase truncate max-w-[130px]">
              {categoryName}
            </span>
          )}
          {blog.tags &&
            blog.tags.slice(0, 1).map((tag, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  playKeyClick();
                  if (onTagClick) onTagClick(tag);
                }}
                className="mac9-chip-tag uppercase cursor-pointer hover:border-[#333399] dark:hover:border-[#818CF8] transition-colors hidden sm:inline-block"
              >
                #{tag}
              </button>
            ))}
        </div>

        {/* Right: Interaction Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Quick AI Summary Button (Platinum 3D Button) */}
          <button
            onClick={handleFetchSummary}
            disabled={isLoadingSummary}
            className="mac9-btn !min-h-[24px] !px-2 !py-0.5 text-[10.5px]"
            title="Executive Summary via Spring AI"
          >
            {isLoadingSummary ? (
              <Loader2 className="w-3 h-3 animate-spin text-[#333399] dark:text-[#818CF8] mr-1" />
            ) : (
              <Sparkles className="w-3 h-3 text-[#333399] dark:text-[#818CF8] mr-1" />
            )}
            <span>{showSummary ? 'Hide' : 'AI TL;DR'}</span>
          </button>

          {/* Claps / Likes (Platinum Default Double-Bordered Button) */}
          <button
            onClick={handleToggleLike}
            className="mac9-btn-default !min-h-[24px] !px-2.5 !py-0.5 text-[10.5px]"
            title="Applaud (Medium Clap)"
          >
            <span className="text-[11px] mr-1">👏</span>
            <span>{liveClaps}</span>
          </button>

          {/* Comments count (Mac OS 9 Chip Badge) */}
          <span className="mac9-chip-tag !h-[24px] !px-2 text-[10.5px]" title={`${commentCount} Comments`}>
            <MessageSquare className="w-2.5 h-2.5 mr-1" />
            <span>{commentCount}</span>
          </span>

          {/* Classic Mac OS 9 Right Disclosure Arrow */}
          <div className="pl-1 flex items-center justify-center text-[10px] text-zinc-500 group-hover:text-[#333399] dark:group-hover:text-[#818CF8] font-bold transition-transform group-hover:translate-x-0.5">
            ▶
          </div>
        </div>
      </div>
    </article>
  );
};
