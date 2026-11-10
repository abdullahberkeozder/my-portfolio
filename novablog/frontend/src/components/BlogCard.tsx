'use client';

import React, { useState } from 'react';
import { BlogDto } from '@/types/api';
import { ApiClient } from '@/lib/api';
import { useToggleLikeMutation, useSoftDeleteBlogMutation } from '@/hooks/useBlogs';
import {
  Sparkles,
  Eye,
  Heart,
  Calendar,
  ArrowRight,
  Loader2,
  Bot,
  Clock,
  Share2,
  Check,
  Archive,
} from 'lucide-react';

interface BlogCardProps {
  blog: BlogDto;
  onSelect: (blog: BlogDto) => void;
  onTagClick?: (tag: string) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog, onSelect, onTagClick }) => {
  const [summary, setSummary] = useState<string | undefined>(blog.aiSummary);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [showSummary, setShowSummary] = useState(Boolean(blog.aiSummary));
  const [isCopied, setIsCopied] = useState(false);

  const toggleLikeMutation = useToggleLikeMutation();
  const softDeleteMutation = useSoftDeleteBlogMutation();
  const blogId = blog.id ?? blog.blogId;

  const handleSoftDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!blogId) return;
    if (confirm(`"${blog.title}" başlıklı yazıyı 30 günlük saklama arşivine (Soft Delete) taşımak istediğinize emin misiniz?`)) {
      softDeleteMutation.mutate(blogId);
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
      setSummary('Özet oluşturulamadı.');
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

  const liveViews = blog.viewsCount ?? blog.views ?? 0;
  const liveLikes = blog.likesCount ?? blog.likes ?? 0;

  // Clean, markdown-free excerpt for card preview
  const rawExcerpt = (blog.content || '')
    .replace(/^#+\s+[^\n]+/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[`*#_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return (
    <article
      onClick={() => onSelect(blog)}
      className="group relative flex flex-col rounded-3xl bg-white dark:bg-[#0c0e12] border border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-black/50 cursor-pointer overflow-hidden"
    >
      {/* Top Banner & Spec Header */}
      <div className="p-6 pb-2">
        {/* Tier 1: Category Pill & Interaction Toolbar */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="shrink-0 text-[11px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-200/80 dark:border-zinc-700/60">
              #{String(blogId || 1).padStart(3, '0')}
            </span>
            <span className="shrink-0 whitespace-nowrap inline-flex items-center px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-sm">
              {blog.category?.categoryName || 'SİSTEM // GENEL'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-xs font-mono text-zinc-500">
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                blog.isLiked
                  ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 border border-pink-300 dark:border-pink-800 font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-pink-600 dark:hover:text-pink-400 bg-zinc-100/80 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/60'
              }`}
              title={blog.isLiked ? 'Beğeniyi geri al' : 'Beğen (Optimistic UI)'}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                  blog.isLiked ? 'fill-pink-500 text-pink-500' : ''
                }`}
              />
              <span>{liveLikes}</span>
            </button>
            <button
              onClick={handleCopyLink}
              title={isCopied ? 'Bağlantı Kopyalandı' : 'Yazı Bağlantısını Kopyala'}
              className="p-1.5 rounded-full bg-zinc-100/80 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-zinc-200/80 dark:border-zinc-700/60 transition-colors"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleSoftDelete}
              disabled={softDeleteMutation.isPending}
              title="Arşive Taşı (Soft Delete & 30G Saklama)"
              className="p-1.5 rounded-full bg-zinc-100/80 dark:bg-zinc-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-500 hover:text-rose-600 border border-zinc-200/80 dark:border-zinc-700/60 transition-colors cursor-pointer disabled:opacity-50"
            >
              {softDeleteMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Archive className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Tier 2: Spec Meta Bar (Reading Time & Live Views) */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mb-2.5">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            {readingTime} dk okuma
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
          <span className="flex items-center gap-1" title="Canlı İzlenme (Redis Write-Behind)">
            <Eye className="w-3.5 h-3.5 text-zinc-400" />
            {liveViews.toLocaleString('tr-TR')} görüntülenme
          </span>
        </div>

        {/* Title & Architectural Header */}
        <h3 className="text-lg md:text-xl font-black text-zinc-950 dark:text-white group-hover:text-zinc-700 dark:group-hover:text-[#d4f933] transition-colors line-clamp-2 leading-snug tracking-tight">
          {blog.title}
        </h3>
        <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-wider font-semibold">
          {blog.header}
        </p>

        {/* Excerpt */}
        <p className="mt-2.5 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {rawExcerpt}
        </p>
      </div>

      {/* AI TL;DR Section */}
      <div className="px-6 py-2">
        {showSummary && summary ? (
          <div className="rounded-2xl p-4 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-300">
            <div className="flex items-center justify-between gap-2 mb-2 font-mono font-semibold text-zinc-900 dark:text-white">
              <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                <Bot className="w-4 h-4 text-emerald-600 dark:text-[#d4f933]" />
                SPRING AI // TL;DR ÖZETİ
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 dark:bg-[#d4f933]/15 text-emerald-700 dark:text-[#d4f933] font-bold font-mono border border-emerald-500/20 dark:border-[#d4f933]/30">
                -%65 SIKIŞTIRMA
              </span>
            </div>
            <p className="leading-relaxed font-sans text-zinc-700 dark:text-zinc-300 text-xs">{summary}</p>
          </div>
        ) : (
          <button
            onClick={handleFetchSummary}
            disabled={isLoadingSummary}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-xs font-mono font-semibold bg-zinc-50 dark:bg-zinc-900/90 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer"
          >
            {isLoadingSummary ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600 dark:text-[#d4f933]" />
                SPRING AI ANALİZİ ÇIKARILIYOR...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-[#d4f933]" />
                SPRING AI İLE TL;DR ÖZETİ GÖR
              </>
            )}
          </button>
        )}
      </div>

      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="px-6 pt-2 pb-1 flex flex-wrap gap-1.5">
          {blog.tags.slice(0, 4).map((tag, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                if (onTagClick) onTagClick(tag);
              }}
              className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-md bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-900 hover:text-white dark:hover:bg-[#d4f933] dark:hover:text-black text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-800 transition-all cursor-pointer uppercase"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-auto p-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-500">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 shrink-0 rounded-full bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center text-[10px] font-bold uppercase shadow-sm">
            {blog.author ? blog.author.charAt(0) : 'A'}
          </div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-200 whitespace-nowrap">
            {blog.author || 'Abdullah Berke Özder'}
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
          <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
            <Calendar className="w-3 h-3 text-zinc-400" />
            {formattedDate}
          </span>
        </div>

        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-[#d4f933] dark:group-hover:text-black font-mono font-bold text-[11px] text-zinc-900 dark:text-zinc-100 transition-all">
          <span>İNCELE</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </article>
  );
};
