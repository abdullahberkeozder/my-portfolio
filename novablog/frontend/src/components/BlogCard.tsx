'use client';

import React, { useState } from 'react';
import { BlogDto } from '@/types/api';
import { ApiClient } from '@/lib/api';
import { useToggleLikeMutation } from '@/hooks/useBlogs';
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
  const blogId = blog.id ?? blog.blogId;

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

  return (
    <article
      onClick={() => onSelect(blog)}
      className="group relative flex flex-col rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/[0.08] dark:border-white/[0.08] hover:border-[#d4f933]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#d4f933]/5 cursor-pointer overflow-hidden"
    >
      {/* Top Banner & Spec Header */}
      <div className="p-6 pb-3">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500">
              #{String(blogId || 1).padStart(3, '0')}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-zinc-900/5 dark:bg-white/10 text-zinc-900 dark:text-zinc-200 border border-black/10 dark:border-white/10">
              {blog.category?.categoryName || 'SİSTEM // GENEL'}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-500">
              <Clock className="w-3 h-3 text-zinc-400" />
              {readingTime} DK
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span className="flex items-center gap-1 px-1.5 py-0.5" title="Canlı İzlenme (Redis Write-Behind)">
              <Eye className="w-3.5 h-3.5 text-zinc-400" />
              {liveViews}
            </span>
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                blog.isLiked
                  ? 'text-pink-600 dark:text-pink-400 bg-pink-500/15 border border-pink-500/30 font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-pink-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent'
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
              className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <h3 className="text-xl font-black text-zinc-950 dark:text-white group-hover:text-[#a3c900] dark:group-hover:text-[#d4f933] transition-colors line-clamp-2 leading-snug tracking-tight">
          {blog.title}
        </h3>
        <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-wider">
          {blog.header}
        </p>

        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
          {blog.content}
        </p>
      </div>

      {/* AI TL;DR Section */}
      <div className="px-6 py-2">
        {showSummary && summary ? (
          <div className="rounded-2xl p-4 bg-zinc-100 dark:bg-zinc-900/90 border border-black/10 dark:border-white/10 text-xs text-zinc-800 dark:text-zinc-300">
            <div className="flex items-center justify-between gap-2 mb-2 font-mono font-semibold text-zinc-900 dark:text-white">
              <span className="flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-[#a3c900] dark:text-[#d4f933]" />
                SPRING AI // TL;DR
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4f933]/20 text-zinc-900 dark:text-[#d4f933] font-bold font-mono">
                -%65 SIKIŞTIRMA
              </span>
            </div>
            <p className="leading-relaxed font-sans">{summary}</p>
          </div>
        ) : (
          <button
            onClick={handleFetchSummary}
            disabled={isLoadingSummary}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-xs font-mono font-semibold bg-zinc-100 dark:bg-zinc-900/90 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-black/[0.08] dark:border-white/[0.08] hover:border-[#d4f933]/50 transition-all cursor-pointer"
          >
            {isLoadingSummary ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#a3c900] dark:text-[#d4f933]" />
                SPRING AI ANALİZİ ÇIKARILIYOR...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#a3c900] dark:text-[#d4f933]" />
                SPRING AI İLE TL;DR ÖZETİ GÖR
              </>
            )}
          </button>
        )}
      </div>

      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="px-6 pt-2 flex flex-wrap gap-1.5">
          {blog.tags.slice(0, 4).map((tag, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                if (onTagClick) onTagClick(tag);
              }}
              className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-[#d4f933] hover:text-black dark:hover:bg-[#d4f933] dark:hover:text-black text-zinc-600 dark:text-zinc-400 border border-black/10 dark:border-white/10 transition-colors cursor-pointer uppercase"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-auto p-6 pt-4 border-t border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center text-[10px] font-bold uppercase">
            {blog.author ? blog.author.charAt(0) : 'A'}
          </div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-300 truncate max-w-[130px]">
            {blog.author || 'Berke Özder'}
          </span>
          <span className="text-zinc-400">&bull;</span>
          <span className="flex items-center gap-1 text-zinc-500">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </span>
        </div>

        <div className="flex items-center gap-1 font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#a3c900] dark:group-hover:text-[#d4f933] group-hover:translate-x-1 transition-all">
          <span>İNCELE</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </article>
  );
};
