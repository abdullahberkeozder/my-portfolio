'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
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
import { playKeyClick, playTabSelect, playSendWhoosh } from '@/lib/retroAudio';
import {
  Bot,
  Eye,
  MessageSquare,
  Send,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  FileCode,
  Bookmark,
  ListTree,
  UserPlus,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Printer,
  Type,
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
    playKeyClick();
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-5 rounded-lg overflow-hidden border border-zinc-700/80 bg-[#1e2024] text-zinc-100 shadow-xl">
      <div className="flex items-center justify-between px-4 py-2 bg-[#16171a] border-b border-zinc-800 text-[11px] font-mono text-zinc-400">
        <span className="flex items-center gap-1.5 uppercase font-bold text-emerald-400">
          <FileCode className="w-3.5 h-3.5" />
          {language || 'JAVA'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="ios6-btn ios6-btn-dark px-2.5 py-0.5 text-[10px] font-mono"
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
  const [readerFontSize, setReaderFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

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
  const [commentErrorMessage, setCommentErrorMessage] = useState<string | null>(null);

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
  const authorUsername = currentBlog.authorUsername || 'admin';
  const authorDisplayName =
    currentBlog.author ||
    (currentBlog.authorUsername === 'selindemir'
      ? 'Dr. Selin Demir'
      : currentBlog.authorUsername === 'caneraydin'
      ? 'Caner Aydın'
      : 'Abdullah Berke Özder');
  const authorInitial = authorDisplayName.charAt(0).toUpperCase();
  const authorAvatarUrl = currentBlog.authorImageUrl;
  const isAuthorFollowed = followedAuthors.includes(authorUsername) || followedAuthors.includes(authorDisplayName);

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
    playKeyClick();
    setClapsCount((prev) => prev + 1);
    ApiClient.clapBlog(blogId, 1);
  };

  const handleToggleBookmark = () => {
    playTabSelect();
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
    playKeyClick();
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/#blog-${blogId}`);
      setIsCopiedLink(true);
      setTimeout(() => setIsCopiedLink(false), 2000);
    }
  };

  const handlePrint = () => {
    playKeyClick();
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const cycleFontSize = () => {
    playKeyClick();
    if (readerFontSize === 'normal') setReaderFontSize('large');
    else if (readerFontSize === 'large') setReaderFontSize('xlarge');
    else setReaderFontSize('normal');
  };

  const scrollToComments = () => {
    playKeyClick();
    const commentsEl = document.getElementById('comments-discussion-section');
    if (commentsEl) {
      commentsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTocHeading = (id: string) => {
    playKeyClick();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsTocOpen(false);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    playSendWhoosh();

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
          setCommentErrorMessage(null);
        },
        onError: () => {
          setCommentErrorMessage('Yorum kaydedilemedi. Lütfen bağlantınızı kontrol edip tekrar deneyin.');
          setTimeout(() => setCommentErrorMessage(null), 5000);
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
            className="px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 text-purple-700 dark:text-purple-300 font-mono text-[12px] font-bold border border-black/10 dark:border-white/10"
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

    const textSizeClass =
      readerFontSize === 'xlarge'
        ? 'text-lg sm:text-xl leading-loose'
        : readerFontSize === 'large'
        ? 'text-base sm:text-lg leading-loose'
        : 'text-sm sm:text-base leading-relaxed sm:leading-loose';

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
                  className="scroll-mt-24 text-base sm:text-lg font-bold text-zinc-950 dark:text-white pt-4 pb-1.5 border-b border-black/[0.08] dark:border-white/[0.08] font-sans"
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
                  className="scroll-mt-24 text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-6 pb-2 border-b border-black/[0.08] dark:border-white/[0.08] font-sans tracking-tight"
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
                <ul key={pIdx} className="list-disc list-inside space-y-2 pl-2 text-zinc-800 dark:text-zinc-200 text-sm sm:text-base leading-relaxed">
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
                className={`${textSizeClass} text-zinc-900 dark:text-zinc-200 font-serif selection:bg-emerald-500/20`}
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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-2 sm:p-4 md:p-6 safari-reader-backdrop overflow-hidden animate-fade-in">
      {/* 1. Safari Reader Top Floating HUD Capsule */}
      <div className="w-full flex justify-center py-2 shrink-0 z-50">
        <div className="safari-floating-hud">
          {/* Pointed Chevron Back Button (< Geri) */}
          <button
            type="button"
            onClick={() => {
              playKeyClick();
              onClose();
            }}
            className="ios-back-chevron mr-1"
            title="Okuyucudan Çık ve Geri Dön"
          >
            <span>&lt; Geri</span>
          </button>

          {/* Typography 'aA' Font Scaler */}
          <button
            type="button"
            onClick={cycleFontSize}
            className="safari-hud-btn"
            title={`Yazı Boyutunu Değiştir (Şu an: ${
              readerFontSize === 'normal' ? 'Standart' : readerFontSize === 'large' ? 'Büyük' : 'Çok Büyük'
            })`}
          >
            <Type className="w-3.5 h-3.5" />
            <span className="font-serif font-bold text-xs">
              {readerFontSize === 'normal' ? 'aA' : readerFontSize === 'large' ? 'aA+' : 'aA++'}
            </span>
          </button>

          {/* Table of Contents Dropdown Trigger */}
          {tocItems.length > 0 && (
            <button
              type="button"
              onClick={() => {
                playKeyClick();
                setIsTocOpen(!isTocOpen);
              }}
              className={`safari-hud-btn ${isTocOpen ? 'bg-white/20' : ''}`}
              title="İçindekiler Tablosu"
            >
              <ListTree className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">İçindekiler</span>
              {isTocOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}

          {/* Print Article */}
          <button
            type="button"
            onClick={handlePrint}
            className="safari-hud-btn hidden md:inline-flex"
            title="Makaleyi Yazdır (Print to PDF)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Yazdır</span>
          </button>

          {/* Share Article */}
          <button
            type="button"
            onClick={handleShareLink}
            className="safari-hud-btn"
            title="Bağlantıyı Kopyala"
          >
            {isCopiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isCopiedLink ? 'Kopyalandı' : 'Paylaş'}</span>
          </button>

          {/* Open in Standalone Post Route */}
          <Link
            href={`/post/${blogId}`}
            onClick={() => playKeyClick()}
            className="safari-hud-btn hidden sm:inline-flex"
            title="Müstakil URL ile Aç (/post/[id])"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Close Window Traffic Light */}
          <button
            type="button"
            onClick={() => {
              playKeyClick();
              onClose();
            }}
            className="w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center font-bold text-xs ml-1 shadow-inner cursor-pointer"
            title="Kapat"
          >
            &times;
          </button>
        </div>
      </div>

      {/* Collapsible Table of Contents Popover HUD */}
      {isTocOpen && tocItems.length > 0 && (
        <div className="fixed top-18 z-50 max-w-lg w-full px-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-xl bg-zinc-900/95 border border-zinc-700 shadow-2xl text-xs font-mono space-y-2 text-white">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              SAFARI İÇİNDEKİLER DİZİNİ
            </span>
            <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-thin">
              {tocItems.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToTocHeading(item.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer truncate block ${
                    item.level === 3 ? 'pl-5 text-zinc-400' : 'font-semibold text-zinc-200'
                  }`}
                >
                  &rarr; {item.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Centered Safari Reader Parchment Canvas (740px Classic Warm Document) */}
      <div className="relative w-full max-w-3xl flex-1 flex flex-col safari-reader-parchment overflow-hidden my-2">
        {/* Subtle Reading Progress Line */}
        <div className="w-full h-1 bg-black/5 dark:bg-white/5 overflow-hidden shrink-0">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Scrollable Parchment Body */}
        <div
          ref={contentScrollRef}
          onScroll={handleBodyScroll}
          className="flex-1 overflow-y-auto px-6 sm:px-12 lg:px-16 py-8 space-y-8"
        >
          {/* Article Header & Scope */}
          <div className="space-y-4 border-b border-black/10 dark:border-white/10 pb-6 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-mono">
              <span className="retro-tag-pill uppercase">
                {currentBlog.category?.categoryName || 'MÜHENDİSLİK'}
              </span>
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded text-[11px] font-bold border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                VEKTÖR İNDEKSİ (128D)
              </span>
              <span className="flex items-center gap-1 text-zinc-500 text-[11px]">
                <Eye className="w-3.5 h-3.5" />
                {liveViews} görüntülenme
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-zinc-950 dark:text-white tracking-tight leading-snug">
              {currentBlog.title}
            </h1>

            {/* Author Byline with Brushed Silver Avatar */}
            <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  playKeyClick();
                  if (onAuthorClick) onAuthorClick(authorUsername);
                }}
                className="flex items-center gap-2.5 text-left group cursor-pointer"
              >
                <div className="retro-avatar-silver shrink-0">
                  <div className="w-9 h-9 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs uppercase shadow-inner overflow-hidden">
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
                <div>
                  <span className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 hover:underline block">
                    {authorDisplayName}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono block">
                    {formattedDate} &bull; {readingTime} dk okuma
                  </span>
                </div>
              </button>
            </div>

            {currentBlog.header && (
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans italic pt-2">
                &ldquo;{currentBlog.header}&rdquo;
              </p>
            )}
          </div>

          {/* AI Executive TL;DR Takeaways Box (Skeuomorphic Recessed Tray) */}
          {currentBlog.aiSummary && (
            <div className="rounded-xl p-5 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-teal-500/5 border border-blue-400/30 space-y-2 shadow-inner">
              <div className="flex items-center justify-between font-mono text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Bot className="w-4 h-4" />
                  SPRING AI // 1 DAKİKALIK YÖNETİCİ ÖZETİ
                </span>
                <span className="text-[10px] text-blue-700 dark:text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-400/20">
                  pgvector 128D
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                {currentBlog.aiSummary}
              </p>
            </div>
          )}

          {/* Formatted Technical Content */}
          <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-900 dark:text-zinc-100">
            {renderContent(currentBlog.content)}
          </div>

          {/* Topic Tags Ribbon */}
          {currentBlog.tags && currentBlog.tags.length > 0 && (
            <div className="pt-4 flex flex-wrap gap-2 border-t border-black/10 dark:border-white/10">
              {currentBlog.tags.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    playKeyClick();
                    if (onTagClick) {
                      onTagClick(t);
                      onClose();
                    }
                  }}
                  className="retro-tag-pill uppercase cursor-pointer hover:border-zinc-400 transition-colors"
                >
                  #{t}
                </button>
              ))}
            </div>
          )}

          {/* Author Signature & Follow Box */}
          <div className="p-5 sm:p-6 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-300 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="retro-avatar-silver shrink-0">
                <div
                  onClick={() => {
                    playKeyClick();
                    if (onAuthorClick) onAuthorClick(authorUsername);
                  }}
                  className="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-base uppercase shadow-md cursor-pointer overflow-hidden"
                >
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
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4
                    onClick={() => {
                      playKeyClick();
                      if (onAuthorClick) onAuthorClick(authorUsername);
                    }}
                    className="font-bold text-zinc-950 dark:text-white text-base hover:text-blue-600 cursor-pointer hover:underline"
                  >
                    {authorDisplayName}
                  </h4>
                  <span className="retro-tag-pill uppercase text-[10px]">
                    YAZAR
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed font-sans">
                  {currentBlog.authorBio ||
                    (authorUsername === 'selindemir'
                      ? 'Spring AI, pgvector 128D anlamsal çıkarım motorları ve büyük dil modellerinde RAG optimizasyonu araştırmacısı.'
                      : authorUsername === 'caneraydin'
                      ? 'Cloud-native mimariler, eBPF gözlemlenebilirlik ve sıfır güven güvenlik altyapıları mimarı.'
                      : 'Java 22 Loom sanal iş parçacıkları, yüksek throughput dağıtık sistemler ve Spring Boot mimarisi.')}
                </p>
              </div>
            </div>

            {onToggleFollow && (
              <button
                type="button"
                onClick={() => {
                  playKeyClick();
                  onToggleFollow(authorUsername);
                }}
                className={`ios6-btn px-4 py-2 text-xs font-bold gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 ${
                  isAuthorFollowed ? 'ios6-btn-silver' : 'ios6-btn-blue'
                }`}
              >
                {isAuthorFollowed ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
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

          {/* 3. Masaüstü iMessage Çift Sütunlu Tartışma & Yorum İpliği */}
          <div id="comments-discussion-section" className="pt-8 border-t border-black/10 dark:border-white/10 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2 font-mono">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <span>MESAJLAR &amp; TARTIŞMALAR ({comments.length})</span>
              </h4>

              {/* Glowing Spring AI Verified Safe Seal Badge */}
              <div className="spring-ai-shield-badge">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Spring AI Verified Safe</span>
              </div>
            </div>

            {/* Skeuomorphic Comment Composition Form */}
            <form onSubmit={handleAddComment} className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 space-y-3 shadow-inner">
              <input
                id="comment-author-name"
                name="authorName"
                type="text"
                placeholder="Adınız veya unvanınız (örn. Selin Demir - Platform Architect)"
                value={authorNameInput}
                onChange={(e) => setAuthorNameInput(e.target.value)}
                className="w-full sm:w-80 px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-sans text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
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
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-sans text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors leading-relaxed shadow-inner"
              />

              {/* Form Error Alert */}
              {commentErrorMessage && (
                <div className="p-2.5 rounded-lg text-xs font-mono flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{commentErrorMessage}</span>
                </div>
              )}

              {/* Spring AI Real-Time Moderation Feedback */}
              {moderationPreview && (
                <div
                  className={`p-2 rounded-lg text-xs font-mono flex items-center justify-between border ${
                    moderationPreview.toxic
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {moderationPreview.toxic ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    )}
                    <span>
                      {moderationPreview.toxic
                        ? 'Spring AI Uyarısı: Sakıncalı içerik tespit edildi.'
                        : 'Spring AI Analizi: Topluluk kurallarına uygun.'}
                    </span>
                  </div>
                  <span className="uppercase font-bold text-[10px]">
                    Duygu: {moderationPreview.sentiment}
                  </span>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={addCommentMutation.isPending || !newComment.trim()}
                  className="ios6-btn ios6-btn-blue px-4 py-2 text-xs font-bold gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {addCommentMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Mesaj Gönder</span>
                </button>
              </div>
            </form>

            {/* iMessage Speech Bubbles Thread */}
            <div className="space-y-4 pt-2">
              {isLoadingComments && (
                <div className="flex items-center justify-center py-6 text-zinc-400 gap-2 font-mono">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-xs">Mesajlar yükleniyor...</span>
                </div>
              )}

              {comments.map((c) => {
                const isApproved = Boolean(c.isApproved);
                const isAuthorOrApproved = isApproved;
                const bubbleClass = c.isOptimistic
                  ? 'imessage-bubble-blue animate-pulse'
                  : isAuthorOrApproved
                  ? 'imessage-bubble-green'
                  : 'imessage-bubble-gray';

                return (
                  <div key={c.id} className="space-y-1">
                    {/* Timestamp & Author Meta Header */}
                    <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 px-2">
                      <span className="font-bold text-zinc-800 dark:text-zinc-300">{c.authorName}</span>
                      <span>&bull;</span>
                      <span>{new Date(c.createdAt).toLocaleDateString('tr-TR')}</span>
                      {isApproved && (
                        <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> ONAYLI
                        </span>
                      )}
                    </div>

                    {/* Speech Bubble */}
                    <div className="max-w-xl">
                      <div className={bubbleClass}>
                        <p className="text-xs sm:text-sm leading-relaxed font-sans">{c.content}</p>
                      </div>
                    </div>

                    {/* Admin Moderation Controls */}
                    {blogId && c.id && !c.isOptimistic && (
                      <div className="flex items-center gap-2 pt-0.5 px-2 font-mono text-[10px]">
                        <span className="text-zinc-400">Moderasyon:</span>
                        {!c.isApproved ? (
                          <button
                            type="button"
                            onClick={() => {
                              playKeyClick();
                              approveCommentMutation.mutate({ commentId: c.id, blogId });
                            }}
                            disabled={approveCommentMutation.isPending}
                            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                          >
                            ✓ Onayla
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              playKeyClick();
                              flagCommentMutation.mutate({
                                commentId: c.id,
                                blogId,
                                reason: 'Karantina',
                              });
                            }}
                            disabled={flagCommentMutation.isPending}
                            className="text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
                          >
                            ⚠️ Karantinaya Al
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Safari Reader 49px Glossy Black Bottom Interaction Dock */}
        <div className="safari-reader-dock shrink-0">
          <div className="flex items-center gap-3">
            {/* Clap Button with Audio Click */}
            <button
              type="button"
              onClick={handleClap}
              className="ios6-btn ios6-btn-blue px-3 py-1.5 text-xs font-bold gap-1.5"
              title="Alkışla (Medium Clap)"
            >
              <span className="text-sm leading-none">👏</span>
              <span>{clapsCount}</span>
            </button>

            {/* Jump to Comments */}
            <button
              type="button"
              onClick={scrollToComments}
              className="ios6-btn ios6-btn-silver px-3 py-1.5 text-xs font-semibold gap-1.5"
              title="Mesajlara Git"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>{comments.length}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            {/* Reading list bookmark button */}
            <button
              type="button"
              onClick={handleToggleBookmark}
              className={`ios6-btn px-3 py-1.5 text-xs font-bold gap-1.5 ${
                isBookmarked ? 'ios6-btn-silver' : 'ios6-btn-dark'
              }`}
              title="Safari Okuma Listeme Ekle"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span className="hidden sm:inline">{isBookmarked ? 'KAYDEDİLDİ' : 'OKUMA LİSTESİ'}</span>
            </button>

            {/* Reading stats */}
            <span className="text-zinc-400 text-[11px] hidden md:inline">
              {readingTime} dk okuma
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
