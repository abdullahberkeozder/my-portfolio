'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BlogDto } from '@/types/api';
import { ApiClient } from '@/lib/api';
import {
  useCommentsQuery,
  useAddCommentMutation,
  useToggleLikeMutation,
  useRecordViewMutation,
  useBlogDetailQuery,
} from '@/hooks/useBlogs';
import {
  X,
  Bot,
  Calendar,
  Eye,
  Heart,
  MessageSquare,
  Send,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface BlogDetailModalProps {
  blog: BlogDto | null;
  onClose: () => void;
}

export const BlogDetailModal: React.FC<BlogDetailModalProps> = ({ blog, onClose }) => {
  const blogId = blog?.id ?? blog?.blogId;
  const { data: liveBlog } = useBlogDetailQuery(blogId);
  const currentBlog = liveBlog || blog;

  const { data: comments = [], isLoading: isLoadingComments } = useCommentsQuery(blogId);
  const addCommentMutation = useAddCommentMutation();
  const toggleLikeMutation = useToggleLikeMutation();
  const recordViewMutation = useRecordViewMutation();

  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [moderationPreview, setModerationPreview] = useState<{
    toxic: boolean;
    sentiment: string;
    score: number;
  } | null>(null);

  // Görüntülenme Sayacı (Write-Behind Redis Buffer): Modal açıldığında bir kez tetiklenir
  const hasRecordedView = useRef<number | null>(null);
  useEffect(() => {
    if (blogId && hasRecordedView.current !== blogId) {
      hasRecordedView.current = blogId;
      recordViewMutation.mutate(blogId);
    }
  }, [blogId, recordViewMutation]);

  // Real-time AI moderation check on comment typing
  useEffect(() => {
    if (!newComment.trim()) {
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await ApiClient.moderateContent(newComment);
        setModerationPreview({
          toxic: res.toxic,
          sentiment: res.sentiment,
          score: res.sentimentScore,
        });
      } catch {
        // ignore
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [newComment]);

  if (!currentBlog || !blogId) return null;

  const handleToggleLike = () => {
    toggleLikeMutation.mutate({
      blogId,
      currentlyLiked: Boolean(currentBlog.isLiked),
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    addCommentMutation.mutate(
      {
        blogId,
        dto: {
          content: newComment,
          authorName: authorName.trim() || 'Ziyaretçi Mühendis',
        },
      },
      {
        onSuccess: () => {
          setNewComment('');
          setModerationPreview(null);
        },
        onError: () => {
          alert('Yorum kaydedilemedi. Otomatik geri alma uygulandı.');
        },
      }
    );
  };

  const formattedDate = currentBlog.publishedAt || currentBlog.createdDate
    ? new Date(currentBlog.publishedAt || currentBlog.createdDate!).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '5 Kasım 2026';

  const liveViews = currentBlog.viewsCount ?? currentBlog.views ?? 0;
  const liveLikes = currentBlog.likesCount ?? currentBlog.likes ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/50">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {currentBlog.category?.categoryName || 'Genel'}
              </span>
              <span className="flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                128D Vektör İndeksli
              </span>
              {currentBlog.version !== undefined && (
                <span className="text-[10px] font-mono text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded" title="JPA @Version Optimistic Lock">
                  v{currentBlog.version}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{currentBlog.title}</h2>
            <p className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-wider">{currentBlog.header}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                  {currentBlog.author ? currentBlog.author.charAt(0) : 'A'}
                </div>
                <span className="font-medium text-slate-200">{currentBlog.author || 'Abdullah Berke Özder'}</span>
              </div>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1" title="Write-Behind Buffer + DB">
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                {liveViews} Görüntülenme
              </span>
            </div>

            {/* Interactive Optimistic Like Button */}
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentBlog.isLiked
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 font-semibold'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-pink-300 border border-slate-700'
              }`}
              title={currentBlog.isLiked ? 'Beğeniyi geri al' : 'Beğen (TanStack Query Optimistic UI)'}
            >
              <Heart
                className={`w-4 h-4 transition-transform active:scale-125 ${
                  currentBlog.isLiked ? 'fill-pink-500 text-pink-500' : ''
                }`}
              />
              <span>{liveLikes} Beğeni</span>
            </button>
          </div>

          {/* AI TL;DR Section */}
          {currentBlog.aiSummary && (
            <div className="rounded-xl p-4 bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-semibold text-purple-300 text-sm">
                  <Bot className="w-4 h-4 text-purple-400" />
                  Spring AI Kurumsal Yönetici Özeti (TL;DR)
                </div>
                <span className="text-[11px] font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded">
                  Local-Extractive NLP
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{currentBlog.aiSummary}</p>
            </div>
          )}

          {/* Blog Content */}
          <div className="text-slate-300 leading-relaxed whitespace-pre-wrap font-sans text-sm">
            {currentBlog.content}
          </div>

          {/* Tags */}
          {currentBlog.tags && (
            <div className="pt-2 flex flex-wrap gap-2">
              {currentBlog.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-indigo-300 border border-slate-700/80"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Comments Section */}
          <div className="pt-6 border-t border-slate-800">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              Yorumlar & Tartışmalar ({comments.length})
            </h4>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Adınız veya Unvanınız (örn. Ahmet Kaya - Java Dev)"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <textarea
                rows={3}
                placeholder="Yorumunuzu yazın... (Spring AI Moderasyonu canlı olarak duygu durum ve toksisite analizini gösterir)"
                value={newComment}
                onChange={(e) => {
                  setNewComment(e.target.value);
                  if (!e.target.value.trim()) {
                    setModerationPreview(null);
                  }
                }}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />

              {/* Real-Time Moderation Feedback Banner */}
              {moderationPreview && (
                <div
                  className={`p-2.5 rounded-lg text-xs flex items-center justify-between border ${
                    moderationPreview.toxic
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                      : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {moderationPreview.toxic ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span>
                      {moderationPreview.toxic
                        ? 'Spring AI Uyarısı: Sakıncalı kelime algılandı (Onaysız kaydedilir).'
                        : 'Spring AI Analizi: İçerik kurallara uygun & Güvenli.'}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-wider">
                    Duygu: {moderationPreview.sentiment}
                  </span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={addCommentMutation.isPending || !newComment.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all"
                >
                  {addCommentMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Yorum Gönder (Optimistic UI)
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {isLoadingComments && (
                <div className="flex items-center justify-center py-6 text-slate-400 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span className="text-xs">Yorumlar yükleniyor...</span>
                </div>
              )}
              {comments.map((c) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                    c.isOptimistic
                      ? 'bg-indigo-950/20 border-indigo-500/40 animate-pulse'
                      : 'bg-slate-950/40 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{c.authorName}</span>
                      {c.isOptimistic && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-mono">
                          Sunucuya İletiliyor...
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {c.isApproved ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                          Onaylı
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/25">
                          Moderatör Onayı Bekliyor
                        </span>
                      )}
                      <span className="text-slate-500 font-mono text-[11px]">
                        {new Date(c.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

