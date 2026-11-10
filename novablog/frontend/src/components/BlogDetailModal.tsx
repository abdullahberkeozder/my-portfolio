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
  useApproveCommentMutation,
  useFlagCommentMutation,
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
  Clock,
  Share2,
  Copy,
  Check,
  FileCode,
} from 'lucide-react';

interface BlogDetailModalProps {
  blog: BlogDto | null;
  onClose: () => void;
  onTagClick?: (tag: string) => void;
  onOpenAbout?: () => void;
}

const CodeSnippet: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-4 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-zinc-950 text-zinc-100 shadow-xl">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-[11px] font-mono text-zinc-400">
        <span className="flex items-center gap-1.5 uppercase font-bold text-[#d4f933]">
          <FileCode className="w-3.5 h-3.5" />
          {language || 'CODE'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer text-[10px] font-mono"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">KOPYALANDI</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>KOPYALA</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs font-mono text-emerald-300 leading-relaxed scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const BlogDetailModal: React.FC<BlogDetailModalProps> = ({ blog, onClose, onTagClick, onOpenAbout }) => {
  const blogId = blog?.id ?? blog?.blogId;
  const { data: liveBlog } = useBlogDetailQuery(blogId);
  const currentBlog = liveBlog || blog;

  const { data: comments = [], isLoading: isLoadingComments } = useCommentsQuery(blogId);
  const addCommentMutation = useAddCommentMutation();
  const toggleLikeMutation = useToggleLikeMutation();
  const recordViewMutation = useRecordViewMutation();
  const approveCommentMutation = useApproveCommentMutation();
  const flagCommentMutation = useFlagCommentMutation();

  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [moderationPreview, setModerationPreview] = useState<{
    toxic: boolean;
    sentiment: string;
    score: number;
  } | null>(null);

  const handleBodyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll > 0) {
      setScrollProgress((el.scrollTop / maxScroll) * 100);
    }
  };

  const renderInlineCode = (text: string) => {
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((seg, i) => {
      if (seg.startsWith('`') && seg.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-purple-600 dark:text-purple-400 font-mono text-[12px] font-bold border border-black/5 dark:border-white/10"
          >
            {seg.slice(1, -1)}
          </code>
        );
      }
      return seg;
    });
  };

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

  const handleShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/#blog-${blogId}`);
      setIsCopiedLink(true);
      setTimeout(() => setIsCopiedLink(false), 2000);
    }
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

  const wordCount = (currentBlog.content || '').split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 180));

  const formattedDate = currentBlog.publishedAt || currentBlog.createdDate
    ? new Date(currentBlog.publishedAt || currentBlog.createdDate!).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    : '5 Kasım 2026';

  const liveViews = currentBlog.viewsCount ?? currentBlog.views ?? 0;
  const liveLikes = currentBlog.likesCount ?? currentBlog.likes ?? 0;

  const renderContent = (rawText: string) => {
    if (!rawText) return null;

    const codeBlockRegex = /(```[\s\S]*?```)/g;
    const parts = rawText.split(codeBlockRegex);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trimStart();
        const firstNewline = lines.indexOf('\n');
        let lang = 'java';
        let code = lines;
        if (firstNewline !== -1) {
          lang = lines.slice(0, firstNewline).trim();
          code = lines.slice(firstNewline + 1);
        }
        return <CodeSnippet key={index} code={code} language={lang} />;
      }

      const paragraphs = part.split('\n\n').filter((p) => p.trim());
      return (
        <div key={index} className="space-y-4">
          {paragraphs.map((p, pIdx) => {
            const trimmed = p.trim();
            if (trimmed.startsWith('### ')) {
              return (
                <h4 key={pIdx} className="text-base font-bold text-zinc-950 dark:text-white pt-2 border-b border-black/[0.08] dark:border-white/[0.08] pb-1.5 font-mono">
                  {renderInlineCode(trimmed.replace(/^###\s+/, ''))}
                </h4>
              );
            }
            if (trimmed.startsWith('## ')) {
              return (
                <h3 key={pIdx} className="text-lg font-bold text-zinc-950 dark:text-white pt-3 border-b border-black/[0.08] dark:border-white/[0.08] pb-1.5 font-mono">
                  {renderInlineCode(trimmed.replace(/^##\s+/, ''))}
                </h3>
              );
            }
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              const items = trimmed.split('\n').filter((line) => line.trim().startsWith('- ') || line.trim().startsWith('* '));
              return (
                <ul key={pIdx} className="list-disc list-inside space-y-2 pl-2 text-zinc-600 dark:text-zinc-300 text-sm">
                  {items.map((item, iIdx) => (
                    <li key={iIdx} className="leading-relaxed">
                      {renderInlineCode(item.replace(/^[-*]\s+/, ''))}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={pIdx} className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm">
                {renderInlineCode(trimmed)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-zinc-100 shadow-2xl overflow-hidden my-auto animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-black/[0.08] dark:border-white/[0.08] flex items-start justify-between bg-zinc-50 dark:bg-zinc-950/60">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-zinc-200 dark:bg-white/10 text-zinc-900 dark:text-white border border-black/10 dark:border-white/10">
                {currentBlog.category?.categoryName || 'GENEL'}
              </span>
              <span className="flex items-center gap-1 text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                <CheckCircle2 className="w-3 h-3" />
                128D VEKTÖR İNDEKSİ
              </span>
              <span className="flex items-center gap-1 text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-0.5 rounded-full">
                <Clock className="w-3 h-3 text-zinc-400" />
                ~{readingTime} DK OKUMA
              </span>
              {currentBlog.version !== undefined && (
                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full" title="JPA @Version Lock">
                  v{currentBlog.version}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight leading-snug">{currentBlog.title}</h2>
            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{currentBlog.header}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reading Progress Indicator */}
        <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-[#d4f933] to-emerald-400 transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Modal Body */}
        <div onScroll={handleBodyScroll} className="p-6 overflow-y-auto space-y-6">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-500 pb-4 border-b border-black/[0.08] dark:border-white/[0.08]">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-zinc-950 dark:bg-zinc-800 text-white flex items-center justify-center font-bold text-xs uppercase">
                  {currentBlog.author ? currentBlog.author.charAt(0) : 'A'}
                </div>
                {onOpenAbout ? (
                  <button
                    onClick={onOpenAbout}
                    className="font-semibold text-zinc-900 dark:text-zinc-200 hover:text-purple-600 dark:hover:text-[#d4f933] transition-colors cursor-pointer flex items-center gap-1.5 group"
                    title="Mimar & Mühendislik Manifestosunu Görüntüle"
                  >
                    <span>{currentBlog.author || 'Abdullah Berke Özder'}</span>
                    <span className="text-[10px] font-mono font-bold text-zinc-700 dark:text-[#d4f933] bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full border border-black/10 dark:border-white/10 group-hover:bg-[#d4f933] group-hover:text-black transition-colors">
                      MİMAR
                    </span>
                  </button>
                ) : (
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{currentBlog.author || 'Abdullah Berke Özder'}</span>
                )}
              </div>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1" title="Write-Behind Buffer + DB">
                <Eye className="w-3.5 h-3.5 text-zinc-400" />
                {liveViews} GÖRÜNTÜLENME
              </span>
            </div>

            {/* Actions: Share & Like */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-black/10 dark:border-white/10 transition-all cursor-pointer"
              >
                {isCopiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{isCopiedLink ? 'KOPYALANDI' : 'PAYLAŞ'}</span>
              </button>

              <button
                onClick={handleToggleLike}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${currentBlog.isLiked
                  ? 'bg-pink-500/20 text-pink-600 dark:text-pink-300 border border-pink-500/40'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-pink-500/10 hover:text-pink-500 border border-black/10 dark:border-white/10'
                  }`}
                title={currentBlog.isLiked ? 'Beğeniyi geri al' : 'Beğen (Optimistic UI)'}
              >
                <Heart
                  className={`w-4 h-4 transition-transform active:scale-125 ${currentBlog.isLiked ? 'fill-pink-500 text-pink-500' : ''
                    }`}
                />
                <span>{liveLikes} BEĞENİ</span>
              </button>
            </div>
          </div>

          {/* AI TL;DR Section */}
          {currentBlog.aiSummary && (
            <div className="rounded-3xl p-5 bg-zinc-100 dark:bg-zinc-900/90 border border-black/10 dark:border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-mono font-bold text-zinc-900 dark:text-white text-sm">
                  <Bot className="w-4 h-4 text-[#a3c900] dark:text-[#d4f933]" />
                  SPRING AI // TL;DR KURUMSAL YÖNETİCİ ÖZETİ
                </div>
                <span className="text-[10px] font-mono font-bold text-zinc-900 dark:text-[#d4f933] bg-[#d4f933]/20 px-2.5 py-0.5 rounded-full">
                  LOCAL-EXTRACTIVE NLP
                </span>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">{currentBlog.aiSummary}</p>
            </div>
          )}

          {/* Formatted Blog Content with Code Syntax Support */}
          <div className="text-zinc-800 dark:text-zinc-300 leading-relaxed font-sans text-sm space-y-4">
            {renderContent(currentBlog.content)}
          </div>

          {/* Tags */}
          {currentBlog.tags && currentBlog.tags.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-2">
              {currentBlog.tags.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (onTagClick) {
                      onTagClick(t);
                      onClose();
                    }
                  }}
                  className="text-xs font-mono px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-[#d4f933] hover:text-black dark:hover:bg-[#d4f933] dark:hover:text-black text-zinc-700 dark:text-zinc-300 border border-black/10 dark:border-white/10 transition-colors cursor-pointer uppercase font-semibold"
                  title="Bu etikete sahip yazıları filtrele"
                >
                  #{t}
                </button>
              ))}
            </div>
          )}

          {/* Comments Section */}
          <div className="pt-6 border-t border-black/[0.08] dark:border-white/[0.08]">
            <h4 className="text-lg font-black text-zinc-950 dark:text-white mb-4 flex items-center gap-2 font-mono">
              <MessageSquare className="w-5 h-5 text-[#a3c900] dark:text-[#d4f933]" />
              YORUMLAR & TARTIŞMALAR ({comments.length})
            </h4>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-black/10 dark:border-white/10 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  id="comment-author-name"
                  name="authorName"
                  type="text"
                  placeholder="Adınız veya Unvanınız (örn. Caner Kaya - Senior Java Dev)"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-zinc-900 dark:text-zinc-200 text-xs font-mono focus:outline-none focus:border-[#d4f933]"
                />
              </div>
              <textarea
                id="comment-content"
                name="commentContent"
                rows={3}
                placeholder="Yorumunuzu yazın... (Spring AI Moderasyonu canlı olarak duygu durum ve toksisite analizini gösterir)"
                value={newComment}
                onChange={(e) => {
                  setNewComment(e.target.value);
                  if (!e.target.value.trim()) {
                    setModerationPreview(null);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-zinc-900 dark:text-zinc-200 text-xs font-mono focus:outline-none focus:border-[#d4f933]"
              />

              {/* Real-Time Moderation Feedback Banner */}
              {moderationPreview && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-mono flex items-center justify-between border ${moderationPreview.toxic
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-300'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {moderationPreview.toxic ? (
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                    <span>
                      {moderationPreview.toxic
                        ? 'Spring AI Uyarısı: Sakıncalı içerik algılandı (Onaysız kaydedilir).'
                        : 'Spring AI Analizi: İçerik kurallara uygun & Güvenli.'}
                    </span>
                  </div>
                  <span className="uppercase font-bold tracking-wider text-[10px]">
                    Duygu: {moderationPreview.sentiment}
                  </span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={addCommentMutation.isPending || !newComment.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-950 dark:bg-[#d4f933] text-white dark:text-black font-mono font-bold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50 shadow-md transition-all cursor-pointer"
                >
                  {addCommentMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  YORUM GÖNDER (OPTIMISTIC UI)
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {isLoadingComments && (
                <div className="flex items-center justify-center py-6 text-zinc-400 gap-2 font-mono">
                  <Loader2 className="w-4 h-4 animate-spin text-[#d4f933]" />
                  <span className="text-xs">Yorumlar yükleniyor...</span>
                </div>
              )}
              {comments.map((c) => (
                <div
                  key={c.id}
                  className={`p-4 rounded-2xl border text-xs space-y-1.5 transition-all ${c.isOptimistic
                    ? 'bg-indigo-500/10 border-indigo-500/40 animate-pulse'
                    : 'bg-zinc-50 dark:bg-zinc-950/40 border-black/[0.08] dark:border-white/[0.08]'
                    }`}
                >
                  <div className="flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-white">{c.authorName}</span>
                      {c.isOptimistic && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-400">
                          SUNUCUYA İLETİLİYOR...
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {/* State Machine Status Badge */}
                      {c.moderationStatus === 'FLAGGED_TOXIC' || (!c.isApproved && c.sentiment === 'NEGATIVE') ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/30 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" /> KARANTİNA (TOKSİK)
                        </span>
                      ) : !c.isApproved || c.moderationStatus === 'PENDING_MODERATION' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/25 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> ONAY BEKLİYOR
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/25 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> ONAYLI
                        </span>
                      )}

                      {/* AI Sentiment Badge */}
                      {c.sentiment && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-mono tracking-wider border ${
                            c.sentiment === 'POSITIVE'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : c.sentiment === 'NEGATIVE'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700'
                          }`}
                        >
                          {c.sentiment}
                        </span>
                      )}

                      <span className="text-zinc-400 text-[11px]">
                        {new Date(c.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">{c.content}</p>

                  {/* State Machine Transition Actions (Interactive Test & Admin Control) */}
                  {blogId && c.id && !c.isOptimistic && (
                    <div className="pt-1.5 flex items-center justify-end gap-2 border-t border-black/[0.04] dark:border-white/[0.04] font-mono text-[10px]">
                      <span className="text-zinc-400">Durum Geçişi:</span>
                      {!c.isApproved ? (
                        <button
                          type="button"
                          onClick={() => approveCommentMutation.mutate({ commentId: c.id, blogId })}
                          disabled={approveCommentMutation.isPending}
                          className="px-2 py-0.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                        >
                          {approveCommentMutation.isPending ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : '✓ Onayla'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => flagCommentMutation.mutate({ commentId: c.id, blogId, reason: 'Kullanıcı/Admin tarafından karantinaya alındı' })}
                          disabled={flagCommentMutation.isPending}
                          className="px-2 py-0.5 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                        >
                          {flagCommentMutation.isPending ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : '⚠️ Karantinaya Al'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
