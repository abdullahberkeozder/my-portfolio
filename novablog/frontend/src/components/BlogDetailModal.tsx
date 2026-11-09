'use client';

import React, { useState, useEffect } from 'react';
import { BlogDto, CommentResponseDto } from '@/types/api';
import { ApiClient } from '@/lib/api';
import {
  X,
  Bot,
  Sparkles,
  Calendar,
  Eye,
  ThumbsUp,
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
  const [comments, setComments] = useState<CommentResponseDto[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moderationPreview, setModerationPreview] = useState<{
    toxic: boolean;
    sentiment: string;
    score: number;
  } | null>(null);

  useEffect(() => {
    if (blog?.id) {
      ApiClient.getComments(blog.id).then(setComments);
    }
  }, [blog]);

  // Real-time AI moderation check on comment typing
  useEffect(() => {
    if (!newComment.trim()) {
      setModerationPreview(null);
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
    }, 400);

    return () => clearTimeout(timer);
  }, [newComment]);

  if (!blog) return null;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !blog.id) return;

    setIsSubmitting(true);
    try {
      const added = await ApiClient.addComment(blog.id, {
        content: newComment,
        authorName: authorName.trim() || 'Ziyaretçi Mühendis',
      });
      setComments([added, ...comments]);
      setNewComment('');
      setModerationPreview(null);
    } catch {
      alert('Yorum kaydedilemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = blog.publishedAt || blog.createdDate
    ? new Date(blog.publishedAt || blog.createdDate!).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '5 Kasım 2026';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/50">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {blog.category?.categoryName || 'Genel'}
              </span>
              <span className="flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                128D Vektör İndeksli
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{blog.title}</h2>
            <p className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-wider">{blog.header}</p>
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
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                {blog.author ? blog.author.charAt(0) : 'A'}
              </div>
              <span className="font-medium text-slate-200">{blog.author || 'Abdullah Berke Özder'}</span>
            </div>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              {blog.views || 0} Görüntülenme
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5 text-slate-500" />
              {blog.likes || 0} Beğeni
            </span>
          </div>

          {/* AI TL;DR Section */}
          {blog.aiSummary && (
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
              <p className="text-sm text-slate-200 leading-relaxed">{blog.aiSummary}</p>
            </div>
          )}

          {/* Main Content */}
          <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-sm space-y-4">
            <p>{blog.content}</p>
          </div>

          {/* Tags */}
          {blog.tags && (
            <div className="pt-2 flex flex-wrap gap-2">
              {blog.tags.map((t, idx) => (
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
                onChange={(e) => setNewComment(e.target.value)}
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
                  disabled={isSubmitting || !newComment.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Yorum Gönder (AI Doğrulamalı)
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{c.authorName}</span>
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

