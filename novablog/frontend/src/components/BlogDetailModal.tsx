'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BlogDto } from '@/types/api';
import { ApiClient } from '@/lib/api';
import {
  useCommentsQuery,
  useAddCommentMutation,
  useRecordViewMutation,
  useBlogDetailQuery,
  useApproveCommentMutation,
  useFlagCommentMutation,
} from '@/hooks/useBlogs';
import {
  X,
  Bot,
  Eye,
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
  Bookmark,
  ListTree,
  UserPlus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface BlogDetailModalProps {
  blog: BlogDto | null;
  onClose: () => void;
  onTagClick?: (tag: string) => void;
  onOpenAbout?: () => void;
  onAuthorClick?: (authorName: string) => void;
  followedAuthors?: string[];
  onToggleFollow?: (authorName: string) => void;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
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
    <div className="my-5 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-zinc-950 text-zinc-100 shadow-xl">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-[11px] font-mono text-zinc-400">
        <span className="flex items-center gap-1.5 uppercase font-bold text-emerald-400">
          <FileCode className="w-3.5 h-3.5" />
          {language || 'CODE'}
        </span>
        <button
          type="button"
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
      <pre className="p-4 sm:p-5 overflow-x-auto text-xs font-mono text-emerald-300 leading-relaxed scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const BlogDetailModal: React.FC<BlogDetailModalProps> = ({
  blog,
  onClose,
  onTagClick,
  onAuthorClick,
  followedAuthors = [],
  onToggleFollow,
}) => {
  const blogId = blog?.id ?? blog?.blogId;
  const { data: liveBlog } = useBlogDetailQuery(blogId);
  const currentBlog = liveBlog || blog;

  const { data: comments = [], isLoading: isLoadingComments } = useCommentsQuery(blogId);
  const addCommentMutation = useAddCommentMutation();
  const recordViewMutation = useRecordViewMutation();
  const approveCommentMutation = useApproveCommentMutation();
  const flagCommentMutation = useFlagCommentMutation();

  const [newComment, setNewComment] = useState('');
  const [authorNameInput, setAuthorNameInput] = useState('');
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isClappingAnimation, setIsClappingAnimation] = useState(false);

  // Social & Engagement Local States
  const [clapsCount, setClapsCount] = useState<number>(() => {
    return currentBlog?.clapsCount ?? currentBlog?.likesCount ?? currentBlog?.likes ?? 0;
  });

  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && blogId) {
      try {
        const saved: number[] = JSON.parse(localStorage.getItem('novablog_bookmarks') || '[]');
        return saved.includes(blogId);
      } catch {
        return false;
      }
    }
    return false;
  });

  const [moderationPreview, setModerationPreview] = useState<{
    toxic: boolean;
    sentiment: string;
    score: number;
  } | null>(null);

  const contentScrollRef = useRef<HTMLDivElement>(null);
  const hasRecordedView = useRef<number | null>(null);

  // Record View (Write-Behind Redis Buffer)
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

  // Extract Table of Contents from Markdown headings
  const blogContent = currentBlog?.content;
  const tocItems = useMemo<TocItem[]>(() => {
    if (!blogContent) return [];
    const lines = blogContent.split('\n');
    const items: TocItem[] = [];
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('## ')) {
        const text = trimmed.replace(/^##\s+/, '').replace(/[`*#_]/g, '');
        const id = 'heading-' + text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        items.push({ id, text, level: 2 });
      } else if (trimmed.startsWith('### ')) {
        const text = trimmed.replace(/^###\s+/, '').replace(/[`*#_]/g, '');
        const id = 'heading-' + text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        items.push({ id, text, level: 3 });
      }
    });
    return items;
  }, [blogContent]);

  if (!currentBlog || !blogId) return null;

  const wordCount = (currentBlog.content || '').split(/\s+/).filter(Boolean).length;
  const readingTime = currentBlog.readTimeMinutes || Math.max(1, Math.ceil(wordCount / 180));
  const authorName = currentBlog.author || currentBlog.authorUsername || 'Abdullah Berke Özder';
  const authorInitial = authorName.charAt(0).toUpperCase();
  const isAuthorFollowed = followedAuthors.includes(authorName);

  const formattedDate = currentBlog.publishedAt || currentBlog.createdDate
    ? new Date(currentBlog.publishedAt || currentBlog.createdDate!).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '5 Kasım 2026';

  const liveViews = currentBlog.viewsCount ?? currentBlog.views ?? 0;

  const handleBodyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll > 0) {
      setScrollProgress((el.scrollTop / maxScroll) * 100);
    }
  };

  const handleClap = () => {
    setClapsCount((prev) => prev + 1);
    setIsClappingAnimation(true);
    setTimeout(() => setIsClappingAnimation(false), 500);

    // Sync with backend API
    ApiClient.clapBlog(blogId, 1);
  };

  const handleToggleBookmark = () => {
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
      ApiClient.toggleBookmark(blogId);
    } catch {
      // ignore
    }
  };

  const handleShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/#blog-${blogId}`);
      setIsCopiedLink(true);
      setTimeout(() => setIsCopiedLink(false), 2000);
    }
  };

  const scrollToComments = () => {
    const commentsEl = document.getElementById('comments-discussion-section');
    if (commentsEl) {
      commentsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTocHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsTocOpen(false);
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
          authorName: authorNameInput.trim() || 'Ziyaretçi Mühendis',
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
              const rawTitle = trimmed.replace(/^###\s+/, '');
              const cleanId = 'heading-' + rawTitle.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
              return (
                <h4
                  id={cleanId}
                  key={pIdx}
                  className="scroll-mt-24 text-base font-bold text-zinc-950 dark:text-white pt-4 pb-1.5 border-b border-black/[0.08] dark:border-white/[0.08] font-mono"
                >
                  {renderInlineCode(rawTitle)}
                </h4>
              );
            }
            if (trimmed.startsWith('## ')) {
              const rawTitle = trimmed.replace(/^##\s+/, '');
              const cleanId = 'heading-' + rawTitle.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
              return (
                <h3
                  id={cleanId}
                  key={pIdx}
                  className="scroll-mt-24 text-xl font-bold text-zinc-950 dark:text-white pt-6 pb-2 border-b border-black/[0.08] dark:border-white/[0.08] font-sans tracking-tight"
                >
                  {renderInlineCode(rawTitle)}
                </h3>
              );
            }
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              const items = trimmed
                .split('\n')
                .filter((line) => line.trim().startsWith('- ') || line.trim().startsWith('* '));
              return (
                <ul key={pIdx} className="list-disc list-inside space-y-2 pl-2 text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
                  {items.map((item, iIdx) => (
                    <li key={iIdx}>
                      {renderInlineCode(item.replace(/^[-*]\s+/, ''))}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p
                key={pIdx}
                className="text-zinc-800 dark:text-zinc-200 text-sm sm:text-base leading-relaxed sm:leading-loose font-serif selection:bg-emerald-500/20"
              >
                {renderInlineCode(trimmed)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-hidden animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-[#0c0e12] border border-zinc-200/90 dark:border-zinc-800/90 text-zinc-900 dark:text-zinc-100 shadow-2xl overflow-hidden my-auto">
        {/* Sticky Reading Progress Indicator */}
        <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-900 overflow-hidden shrink-0">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-purple-500 transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-white dark:bg-[#0c0e12] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (onAuthorClick) {
                  onAuthorClick(authorName);
                }
              }}
              className="flex items-center gap-2.5 group cursor-pointer text-left"
              title={`${authorName} profilini aç`}
            >
              <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs group-hover:ring-2 group-hover:ring-emerald-500 transition-all">
                {authorInitial}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-zinc-950 dark:text-white group-hover:text-emerald-500 hover:underline truncate block">
                  {authorName}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono block">
                  {formattedDate} &bull; {readingTime} dk okuma
                </span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Table of Contents Toggle Pill */}
            {tocItems.length > 0 && (
              <button
                type="button"
                onClick={() => setIsTocOpen(!isTocOpen)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium border transition-colors cursor-pointer ${
                  isTocOpen
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200'
                }`}
                title="İçindekiler Tablosu"
              >
                <ListTree className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">İçindekiler</span>
                {isTocOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}

            <button
              type="button"
              onClick={handleToggleBookmark}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isBookmarked
                  ? 'text-emerald-500 bg-emerald-500/10'
                  : 'text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
              title={isBookmarked ? 'Okuma listesinden kaldır' : 'Okuma listeme kaydet'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleShareLink}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title="Yazı Bağlantısını Kopyala"
            >
              {isCopiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Collapsible Table of Contents Drawer */}
        {isTocOpen && tocItems.length > 0 && (
          <div className="px-6 py-4 bg-zinc-50 dark:bg-[#12141a] border-b border-zinc-200/80 dark:border-zinc-800 space-y-2 animate-fade-in shrink-0">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
              İÇİNDEKİLER // BÖLÜM GEÇİŞLERİ
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {tocItems.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToTocHeading(item.id)}
                  className={`text-left px-3 py-1.5 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer truncate ${
                    item.level === 3 ? 'pl-6 text-zinc-500' : 'text-zinc-800 dark:text-zinc-200 font-semibold'
                  }`}
                >
                  &rarr; {item.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scrollable Reading Canvas */}
        <div
          ref={contentScrollRef}
          onScroll={handleBodyScroll}
          className="flex-1 overflow-y-auto px-6 sm:px-12 py-8 space-y-8 max-w-3xl mx-auto w-full"
        >
          {/* Article Header & Scope */}
          <div className="space-y-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-6">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="px-3 py-1 rounded-full font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white">
                {currentBlog.category?.categoryName || 'MÜHENDİSLİK'}
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-bold">
                <CheckCircle2 className="w-3 h-3" />
                VEKTÖR İNDEKSİ
              </span>
              <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                <Eye className="w-3.5 h-3.5 text-zinc-400" />
                {liveViews} görüntülenme
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight leading-tight sm:leading-snug">
              {currentBlog.title}
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
              {currentBlog.header}
            </p>
          </div>

          {/* AI Executive TL;DR Takeaways Box */}
          {currentBlog.aiSummary && (
            <div className="rounded-3xl p-6 bg-gradient-to-br from-emerald-500/5 via-zinc-100/60 to-purple-500/5 dark:from-emerald-500/10 dark:via-zinc-900/40 dark:to-purple-500/10 border border-emerald-500/20 dark:border-emerald-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono font-bold text-zinc-950 dark:text-white text-xs uppercase tracking-wide">
                  <Bot className="w-4 h-4 text-emerald-500" />
                  <span>SPRING AI // 1 DAKİKADA ANA ÇIKARIMLAR</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  128D VECTOR EMBEDDING
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                {currentBlog.aiSummary}
              </p>
            </div>
          )}

          {/* Formatted Technical Content */}
          <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200">
            {renderContent(currentBlog.content)}
          </div>

          {/* Topic Tags Ribbon */}
          {currentBlog.tags && currentBlog.tags.length > 0 && (
            <div className="pt-4 flex flex-wrap gap-2 border-t border-zinc-100 dark:border-zinc-800">
              {currentBlog.tags.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (onTagClick) {
                      onTagClick(t);
                      onClose();
                    }
                  }}
                  className="text-xs font-mono px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-black text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer uppercase font-semibold"
                >
                  #{t}
                </button>
              ))}
            </div>
          )}

          {/* Medium-Grade Author Signature & Follow Box */}
          <div className="p-6 sm:p-7 rounded-3xl bg-zinc-50 dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xs">
            <div className="flex items-center gap-4">
              <div
                onClick={() => {
                  if (onAuthorClick) {
                    onAuthorClick(authorName);
                  }
                }}
                className="w-14 h-14 rounded-2xl bg-zinc-950 dark:bg-zinc-800 text-white flex items-center justify-center font-bold text-xl uppercase shadow-md cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all shrink-0"
              >
                {authorInitial}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4
                    onClick={() => {
                      if (onAuthorClick) {
                        onAuthorClick(authorName);
                      }
                    }}
                    className="font-bold text-zinc-950 dark:text-white text-base hover:text-emerald-500 cursor-pointer hover:underline"
                  >
                    {authorName}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                    YAZAR
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed">
                  {currentBlog.authorBio ||
                    'Java 22 Loom, Spring Boot 4 ve mikro-çekirdek reaktif sistemler üzerine teknik incelemeler paylaşıyor.'}
                </p>
              </div>
            </div>

            {onToggleFollow && (
              <button
                type="button"
                onClick={() => onToggleFollow(authorName)}
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  isAuthorFollowed
                    ? 'bg-zinc-200 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-950 dark:bg-white text-white dark:text-black hover:opacity-90'
                }`}
              >
                {isAuthorFollowed ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>TAKİP EDİLİYOR</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>TAKİP ET</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Comments Discussion Section */}
          <div id="comments-discussion-section" className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-6">
            <h4 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2 font-mono">
              <MessageSquare className="w-5 h-5 text-emerald-500" />
              TARTIŞMALAR & GERİ BİLDİRİMLER ({comments.length})
            </h4>

            {/* Comment Input Form */}
            <form onSubmit={handleAddComment} className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
              <input
                id="comment-author-name"
                name="authorName"
                type="text"
                placeholder="Adınız veya unvanınız (örn. Selin Demir - Platform Architect)"
                value={authorNameInput}
                onChange={(e) => setAuthorNameInput(e.target.value)}
                className="w-full sm:w-80 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-sans text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <textarea
                id="comment-content"
                name="commentContent"
                rows={3}
                placeholder="Teknik katkınızı veya sorunuzu yazın... (Spring AI canlı toksisite denetimi devrededir)"
                value={newComment}
                onChange={(e) => {
                  setNewComment(e.target.value);
                  if (!e.target.value.trim()) {
                    setModerationPreview(null);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-sans text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed"
              />

              {/* Moderation Banner */}
              {moderationPreview && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-mono flex items-center justify-between border ${
                    moderationPreview.toxic
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
                        ? 'Spring AI Uyarısı: Sakıncalı içerik (onaysız kaydedilir).'
                        : 'Spring AI Analizi: Topluluk kurallarına uygun.'}
                    </span>
                  </div>
                  <span className="uppercase font-bold tracking-wider text-[10px]">
                    Duygu: {moderationPreview.sentiment}
                  </span>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={addCommentMutation.isPending || !newComment.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50 shadow-sm transition-all cursor-pointer"
                >
                  {addCommentMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Yorum Gönder
                </button>
              </div>
            </form>

            {/* Comment Cards */}
            <div className="space-y-3">
              {isLoadingComments && (
                <div className="flex items-center justify-center py-6 text-zinc-400 gap-2 font-mono">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                  <span className="text-xs">Tartışmalar yükleniyor...</span>
                </div>
              )}
              {comments.map((c) => (
                <div
                  key={c.id}
                  className={`p-4 rounded-2xl border text-xs space-y-1.5 transition-all ${
                    c.isOptimistic
                      ? 'bg-indigo-500/10 border-indigo-500/40 animate-pulse'
                      : 'bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200/80 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-zinc-900 dark:text-white">{c.authorName}</span>
                    <div className="flex items-center gap-2">
                      {c.isApproved ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/25 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> ONAYLI
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/25 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> ONAY BEKLİYOR
                        </span>
                      )}
                      <span className="text-zinc-400 text-[11px]">
                        {new Date(c.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">{c.content}</p>

                  {blogId && c.id && !c.isOptimistic && (
                    <div className="pt-1.5 flex items-center justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800/80 font-mono text-[10px]">
                      <span className="text-zinc-400">Yönetim:</span>
                      {!c.isApproved ? (
                        <button
                          type="button"
                          onClick={() => approveCommentMutation.mutate({ commentId: c.id, blogId })}
                          disabled={approveCommentMutation.isPending}
                          className="px-2 py-0.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 transition-all cursor-pointer"
                        >
                          ✓ Onayla
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            flagCommentMutation.mutate({
                              commentId: c.id,
                              blogId,
                              reason: 'Karantina',
                            })
                          }
                          disabled={flagCommentMutation.isPending}
                          className="px-2 py-0.5 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/30 transition-all cursor-pointer"
                        >
                          ⚠️ Karantina
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Medium-Grade Sticky Bottom Interaction Bar */}
        <div className="px-6 py-3 border-t border-zinc-100 dark:border-zinc-800/80 bg-white/95 dark:bg-[#0c0e12]/95 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {/* Clap Button with Micro-Animation */}
            <button
              type="button"
              onClick={handleClap}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer active:scale-125 ${
                isClappingAnimation
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 scale-105'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
              title="Alkışla (Medium tarzı 👏)"
            >
              <span className="text-base leading-none">👏</span>
              <span>{clapsCount}</span>
            </button>

            {/* Jump to Comments Button */}
            <button
              type="button"
              onClick={scrollToComments}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{comments.length}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleBookmark}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{isBookmarked ? 'KAYDEDİLDİ' : 'KAYDET'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-mono bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              {isCopiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isCopiedLink ? 'KOPYALANDI' : 'PAYLAŞ'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
