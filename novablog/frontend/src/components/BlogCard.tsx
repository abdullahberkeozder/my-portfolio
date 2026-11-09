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
      className="group relative flex flex-col rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer overflow-hidden backdrop-blur-sm"
    >
      {/* Top Banner & Category */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
              {blog.category?.categoryName || 'Genel Teknoloji'}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
              <Clock className="w-3 h-3" />
              {readingTime} dk
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 px-1.5 py-0.5" title="Canlı İzlenme (Redis Write-Behind)">
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              {liveViews}
            </span>
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                blog.isLiked
                  ? 'text-pink-400 bg-pink-500/15 border border-pink-500/30 font-semibold'
                  : 'text-slate-400 hover:text-pink-400 hover:bg-slate-800/80'
              }`}
              title={blog.isLiked ? 'Beğeniyi geri al' : 'Beğen (TanStack Query Optimistic UI)'}
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
              className="p-1 rounded-md hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
          {blog.title}
        </h3>
        <p className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-wider">
          {blog.header}
        </p>

        <p className="mt-3 text-sm text-slate-300 line-clamp-3 leading-relaxed">
          {blog.content}
        </p>
      </div>

      {/* AI TL;DR Section */}
      <div className="px-5 py-2">
        {showSummary && summary ? (
          <div className="rounded-xl p-3 bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/30 text-xs text-purple-200">
            <div className="flex items-center justify-between gap-2 mb-1.5 font-semibold text-purple-300">
              <span className="flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-purple-400" />
                Spring AI TL;DR Özeti
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                -%65 Sıkıştırma
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans">{summary}</p>
          </div>
        ) : (
          <button
            onClick={handleFetchSummary}
            disabled={isLoadingSummary}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-purple-950/40 text-purple-300 border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer"
          >
            {isLoadingSummary ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                Spring AI Özeti Çıkarılıyor...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Spring AI ile TL;DR Özeti Gör
              </>
            )}
          </button>
        )}
      </div>

      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="px-5 pt-2 flex flex-wrap gap-1.5">
          {blog.tags.slice(0, 4).map((tag, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                if (onTagClick) onTagClick(tag);
              }}
              className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 hover:bg-indigo-950 hover:text-indigo-300 text-slate-300 border border-slate-700/60 transition-colors cursor-pointer"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-auto p-5 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
            {blog.author ? blog.author.charAt(0) : 'A'}
          </div>
          <span className="font-medium text-slate-300 truncate max-w-[130px]">
            {blog.author || 'Berke Özder'}
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-slate-400">
            <Calendar className="w-3 h-3 text-slate-500" />
            {formattedDate}
          </span>
        </div>

        <div className="flex items-center gap-1 text-indigo-400 font-medium group-hover:translate-x-1 transition-transform">
          <span>Detay</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </article>
  );
};
