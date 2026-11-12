'use client';

import React, { useState, useEffect } from 'react';
import { BlogDto } from '@/types/api';
import { ApiClient } from '@/lib/api';
import { useToggleLikeMutation } from '@/hooks/useBlogs';
import {
  Sparkles,
  Heart,
  Calendar,
  ArrowRight,
  Loader2,
  Clock,
  Share2,
  Check,
  Bookmark,
  MessageSquare,
} from 'lucide-react';

interface BlogCardProps {
  blog: BlogDto;
  onSelect: (blog: BlogDto) => void;
  onTagClick?: (tag: string) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog, onSelect, onTagClick }) => {
  const [summary, setSummary] = useState<string | undefined>(blog.aiSummary);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const toggleLikeMutation = useToggleLikeMutation();
  const blogId = blog.id ?? blog.blogId;

  // Initialize bookmark state lazily from localStorage
  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && blogId) {
      try {
        const saved = JSON.parse(localStorage.getItem('novablog_bookmarks') || '[]');
        return saved.includes(blogId);
      } catch {
        return false;
      }
    }
    return false;
  });

  // Listen to external bookmark updates
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent<number[]>;
      if (blogId) {
        setIsBookmarked((custom.detail || []).includes(blogId));
      }
    };
    window.addEventListener('bookmarks-updated', handleUpdate);
    return () => window.removeEventListener('bookmarks-updated', handleUpdate);
  }, [blogId]);

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!blogId || typeof window === 'undefined') return;
    try {
      const saved: number[] = JSON.parse(localStorage.getItem('novablog_bookmarks') || '[]');
      let updated: number[];
      if (saved.includes(blogId)) {
        updated = saved.filter((id) => id !== blogId);
        setIsBookmarked(false);
      } else {
        updated = [...saved, blogId];
        setIsBookmarked(true);
      }
      localStorage.setItem('novablog_bookmarks', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('bookmarks-updated', { detail: updated }));
    } catch {
      // ignore
    }
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!blogId) return;
    toggleLikeMutation.mutate({
      blogId,
      currentlyLiked: Boolean(blog.isLiked),
    });
  };

  const handleFetchSummary = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const authorName = blog.author || 'Abdullah Berke Özder';
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <article
      onClick={() => onSelect(blog)}
      className="group relative flex flex-col rounded-3xl bg-white dark:bg-[#0c0e12] border border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-black/50 cursor-pointer overflow-hidden p-6 sm:p-7 space-y-4"
    >
      {/* 1. Author Micro-Bar & Meta */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm ring-1 ring-black/5 dark:ring-white/10 shrink-0">
            {authorInitial}
          </div>
          <div className="flex items-center gap-1.5 min-w-0 font-medium text-zinc-800 dark:text-zinc-200 truncate">
            <span className="font-bold hover:underline">{authorName}</span>
            <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
            <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1 shrink-0">
              <Calendar className="w-3 h-3 text-zinc-400" />
              {formattedDate}
            </span>
            <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">&bull;</span>
            <span className="text-zinc-500 dark:text-zinc-400 hidden sm:flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3 text-zinc-400" />
              {readingTime} dk okuma
            </span>
          </div>
        </div>

        {/* Top Actions: Bookmark & Share */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleCopyLink}
            title={isCopied ? 'Bağlantı Kopyalandı' : 'Yazı Bağlantısını Kopyala'}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleToggleBookmark}
            title={isBookmarked ? 'Okuma listesinden kaldır' : 'Daha sonra oku (Kaydet)'}
            className={`p-1.5 rounded-full transition-colors ${
              isBookmarked
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                : 'text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Article Title & Excerpt */}
      <div className="space-y-2">
        <h3 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug tracking-tight">
          {blog.title}
        </h3>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {rawExcerpt}
        </p>
      </div>

      {/* 3. Expandable Discreet AI TL;DR (Accordion) */}
      {showSummary && summary && (
        <div className="rounded-2xl p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5 text-zinc-900 dark:text-white">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              1 DAKİKALIK YÖNETİCİ ÖZETİ (TL;DR)
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
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

      {/* 4. Bottom Footer: Topic Tags, TL;DR Trigger & Social Engagement */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-zinc-100 dark:border-zinc-800/80">
        {/* Left: Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          {blog.category?.categoryName && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
              {blog.category.categoryName}
            </span>
          )}
          {blog.tags &&
            blog.tags.slice(0, 2).map((tag, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onTagClick) onTagClick(tag);
                }}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800 transition-colors uppercase cursor-pointer"
              >
                #{tag}
              </button>
            ))}
        </div>

        {/* Right: Interaction Buttons */}
        <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
          {/* Quick AI Summary Accordion Trigger */}
          <button
            onClick={handleFetchSummary}
            disabled={isLoadingSummary}
            className="flex items-center gap-1 font-mono text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            title="Yapay Zeka ile Hızlı Özet Çıkar"
          >
            {isLoadingSummary ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            )}
            <span>{showSummary ? 'Özeti Gizle' : 'Özet'}</span>
          </button>

          {/* Claps / Likes */}
          <button
            onClick={handleToggleLike}
            className={`flex items-center gap-1 font-mono text-xs transition-colors cursor-pointer ${
              blog.isLiked ? 'text-pink-600 font-bold' : 'hover:text-pink-600'
            }`}
            title={blog.isLiked ? 'Beğeniyi geri al' : 'Alkışla / Beğen'}
          >
            <Heart className={`w-3.5 h-3.5 ${blog.isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
            <span>{liveLikes}</span>
          </button>

          {/* Comments count */}
          <span className="flex items-center gap-1 font-mono text-xs">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{blog.comments?.length || 0}</span>
          </span>

          {/* Read CTA */}
          <span className="flex items-center gap-1 font-bold text-zinc-900 dark:text-white group-hover:translate-x-0.5 transition-transform">
            <span>Oku</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </article>
  );
};

