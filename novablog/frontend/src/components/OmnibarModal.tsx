'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  X,
  FileText,
  User,
  Layers,
  Cpu,
  Database,
  PenSquare,
  Activity,
  Shield,
  Sparkles,
  Command,
  ArrowRight,
  Clock,
  BookOpen,
} from 'lucide-react';
import { BlogDto } from '@/types/api';
import { playKeyClick, playTabSelect } from '@/lib/retroAudio';

interface OmnibarModalProps {
  isOpen: boolean;
  onClose: () => void;
  blogs: BlogDto[];
  onSelectBlog: (blog: BlogDto) => void;
  onSelectAuthor: (authorName: string) => void;
  onOpenCreateModal: () => void;
  onOpenTelemetry: () => void;
  onOpenTwoFactor: () => void;
  onTriggerSemanticSearch: (query: string) => void;
}

interface PaletteAction {
  id: string;
  category: 'articles' | 'authors' | 'navigation' | 'actions';
  categoryLabel: string;
  title: string;
  subtitle?: string;
  badge?: string;
  icon: React.ReactNode;
  onExecute: () => void;
  rawBlog?: BlogDto;
  rawAuthor?: { name: string; role: string; topics: string[] };
}

const AUTHORS = [
  {
    name: 'Abdullah Berke Özder',
    role: 'Senior Systems Architect & Tech Lead',
    topics: ['Java 22', 'Loom', 'Distributed Systems'],
  },
  {
    name: 'Dr. Selin Demir',
    role: 'Principal AI & Data Systems Researcher',
    topics: ['Spring AI', 'Vector DB', 'pgvector'],
  },
  {
    name: 'Caner Aydın',
    role: 'Staff Cloud & Kubernetes Architect',
    topics: ['Security', 'Cloud', 'TOTP'],
  },
];

export const OmnibarModal: React.FC<OmnibarModalProps> = ({
  isOpen,
  onClose,
  blogs,
  onSelectBlog,
  onSelectAuthor,
  onOpenCreateModal,
  onOpenTelemetry,
  onOpenTwoFactor,
  onTriggerSemanticSearch,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setQuery('');
    setSelectedIndex(0);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Compute filtered items
  const items = useMemo<PaletteAction[]>(() => {
    const q = query.trim().toLowerCase();
    const result: PaletteAction[] = [];

    // 0. Spring AI Semantic search suggestion if query has characters
    if (q.length >= 2) {
      result.push({
        id: 'action-semantic-search',
        category: 'actions',
        categoryLabel: 'YAPAY ZEKA VEKTÖR ARAMASI',
        title: `Spring AI ile Vektör Uzayında Ara: "${query.trim()}"`,
        subtitle: '128-boyutlu gömme kosinüs benzerliği taraması',
        badge: 'pgvector 128D',
        icon: <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />,
        onExecute: () => {
          onClose();
          onTriggerSemanticSearch(query.trim());
        },
      });
    }

    // 1. Articles
    const matchedBlogs = blogs
      .filter((b) => {
        if (!q) return true;
        return (
          b.title.toLowerCase().includes(q) ||
          b.header?.toLowerCase().includes(q) ||
          b.author?.toLowerCase().includes(q) ||
          b.tags?.some((t) => t.toLowerCase().includes(q))
        );
      })
      .slice(0, 5);

    matchedBlogs.forEach((b) => {
      const readTime = b.readTimeMinutes || 5;
      result.push({
        id: `blog-${b.blogId ?? b.id}`,
        category: 'articles',
        categoryLabel: 'TEKNİK MAKALELER',
        title: b.title,
        subtitle: `${b.author || 'Mühendis'} • ~${readTime} dk okuma`,
        badge: b.tags?.[0] ? `#${b.tags[0]}` : undefined,
        icon: <FileText className="w-4 h-4 text-emerald-500" />,
        rawBlog: b,
        onExecute: () => {
          onClose();
          onSelectBlog(b);
        },
      });
    });

    // 2. Authors
    const matchedAuthors = AUTHORS.filter((a) => {
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        a.topics.some((t) => t.toLowerCase().includes(q))
      );
    });

    matchedAuthors.forEach((a) => {
      result.push({
        id: `author-${a.name}`,
        category: 'authors',
        categoryLabel: 'YAZARLAR MASASI',
        title: a.name,
        subtitle: a.role,
        badge: a.topics[0],
        icon: <User className="w-4 h-4 text-cyan-500" />,
        rawAuthor: a,
        onExecute: () => {
          onClose();
          onSelectAuthor(a.name);
        },
      });
    });

    // 3. Navigation Sections
    const navSections = [
      { id: 'articles-feed', label: 'Yayın Akışı & Makaleler', icon: <Layers className="w-4 h-4 text-emerald-500" /> },
      { id: 'modular-architecture-console', label: 'Modüler Dağıtık Sistem Mimarisi', icon: <Cpu className="w-4 h-4 text-indigo-500" /> },
      { id: 'ai-vector-studio', label: 'Spring AI & pgvector Vektör Stüdyosu', icon: <Sparkles className="w-4 h-4 text-purple-500" /> },
      { id: 'batch-etl-studio', label: 'Spring Batch 5 Chunk ETL Konsolu', icon: <Database className="w-4 h-4 text-amber-500" /> },
    ];

    navSections
      .filter((s) => !q || s.label.toLowerCase().includes(q))
      .forEach((s) => {
        result.push({
          id: `nav-${s.id}`,
          category: 'navigation',
          categoryLabel: 'MİMARİ BÖLÜMLER',
          title: s.label,
          subtitle: `Bölüme Zıpla (#${s.id})`,
          icon: s.icon,
          onExecute: () => {
            onClose();
            const el = document.getElementById(s.id);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          },
        });
      });

    // 4. Quick Actions
    const quickActions = [
      {
        id: 'action-write',
        title: 'Yeni Teknik Makale Yayınla',
        subtitle: 'Markdown & Kod Editörünü Başlat',
        icon: <PenSquare className="w-4 h-4 text-emerald-500" />,
        onExecute: () => {
          onClose();
          onOpenCreateModal();
        },
      },
      {
        id: 'action-telemetry',
        title: 'Sistem Telemetrisi & Canlı Metrikler',
        subtitle: 'JVM, Loom ve Redis Durumunu İncele',
        icon: <Activity className="w-4 h-4 text-emerald-500" />,
        onExecute: () => {
          onClose();
          onOpenTelemetry();
        },
      },
      {
        id: 'action-2fa',
        title: 'Donanımsal 2FA Güvenlik Konsolu',
        subtitle: 'RFC 6238 TOTP Donanım Doğrulaması',
        icon: <Shield className="w-4 h-4 text-indigo-500" />,
        onExecute: () => {
          onClose();
          onOpenTwoFactor();
        },
      },
    ];

    quickActions
      .filter((a) => !q || a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q))
      .forEach((a) => {
        result.push({
          id: a.id,
          category: 'actions',
          categoryLabel: 'HIZLI EYLEMLER',
          title: a.title,
          subtitle: a.subtitle,
          icon: a.icon,
          onExecute: a.onExecute,
        });
      });

    return result;
  }, [query, blogs, onClose, onSelectBlog, onSelectAuthor, onOpenCreateModal, onOpenTelemetry, onOpenTwoFactor, onTriggerSemanticSearch]);

  const safeSelectedIndex = items.length === 0 ? 0 : Math.min(selectedIndex, items.length - 1);
  const selectedItem = items[safeSelectedIndex];

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        playKeyClick('crisp');
        setSelectedIndex((prev) => (items.length > 0 ? (prev + 1) % items.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        playKeyClick('crisp');
        setSelectedIndex((prev) => (items.length > 0 ? (prev - 1 + items.length) % items.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[safeSelectedIndex]) {
          items[safeSelectedIndex].onExecute();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, items, safeSelectedIndex, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-150 select-none"
      onClick={handleClose}
    >
      <div
        className="mac-spotlight-modal animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Spotlight Big Search Bar */}
        <div className="mac-spotlight-input-bar">
          <Search className="w-6 h-6 text-zinc-400 shrink-0" />
          <input
            id="spotlight-search-input"
            name="spotlightSearch"
            ref={inputRef}
            type="text"
            placeholder="Spotlight Arama (örn: Virtual Threads, Selin, pgvector, Telemetri)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="mac-spotlight-input"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                playKeyClick('crisp');
                setQuery('');
              }}
              className="p-1 rounded text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700">
              ESC
            </kbd>
          )}
        </div>

        {/* Spotlight Split Layout */}
        <div className="mac-spotlight-split">
          {/* Left Column: Categorized Results List */}
          <div ref={listRef} className="mac-spotlight-results-col space-y-1">
            {items.length === 0 ? (
              <div className="py-16 text-center text-zinc-400 space-y-2">
                <p className="text-xs font-mono uppercase tracking-wider font-bold">Eşleşen sonuç bulunamadı</p>
                <p className="text-[11px] text-zinc-500">Farklı bir terim veya mimari kavramı aratabilirsiniz.</p>
              </div>
            ) : (
              items.map((item, idx) => {
                const isSelected = idx === safeSelectedIndex;
                const prevItem = items[idx - 1];
                const showCategoryHeader = !prevItem || prevItem.category !== item.category;

                return (
                  <React.Fragment key={item.id}>
                    {showCategoryHeader && (
                      <div className="px-2 pt-2 pb-1 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                        {item.categoryLabel}
                      </div>
                    )}
                    <div
                      onClick={item.onExecute}
                      onMouseEnter={() => {
                        if (selectedIndex !== idx) {
                          playTabSelect();
                          setSelectedIndex(idx);
                        }
                      }}
                      className={`mac-spotlight-item ${isSelected ? 'active' : ''}`}
                    >
                      <div className="w-7 h-7 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-xs truncate">
                          {item.title}
                        </div>
                        {item.subtitle && (
                          <div className="text-[10px] text-zinc-500 truncate">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </React.Fragment>
                );
              })
            )}
          </div>

          {/* Right Column: Live Rich Preview Pane */}
          <div className="mac-spotlight-preview-col">
            {selectedItem ? (
              <div className="space-y-4">
                {/* 1. Article Preview */}
                {selectedItem.rawBlog ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="retro-tag-pill">
                        #{selectedItem.rawBlog.tags?.[0] || 'mimari'}
                      </span>
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        ~{selectedItem.rawBlog.readTimeMinutes || 5} dk okuma
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-zinc-950 dark:text-white leading-snug">
                      {selectedItem.rawBlog.title}
                    </h3>

                    <div className="flex items-center gap-2 pt-1 border-t border-black/10 dark:border-white/10">
                      <div className="w-6 h-6 rounded-full retro-avatar-silver text-[10px] font-bold">
                        {selectedItem.rawBlog.author?.charAt(0) || 'A'}
                      </div>
                      <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {selectedItem.rawBlog.author || 'Mühendis'}
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed line-clamp-4">
                      {selectedItem.rawBlog.header || selectedItem.rawBlog.content?.substring(0, 200)}...
                    </p>

                    <div className="pt-4">
                      <button
                        onClick={selectedItem.onExecute}
                        className="ios6-btn ios6-btn-blue w-full py-2 text-xs"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Safari Reader ile Aç (↵)</span>
                      </button>
                    </div>
                  </div>
                ) : selectedItem.rawAuthor ? (
                  /* 2. Author Preview */
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full retro-avatar-silver text-base font-bold">
                        {selectedItem.rawAuthor.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                          {selectedItem.rawAuthor.name}
                        </h3>
                        <p className="text-xs text-zinc-500 font-mono">
                          {selectedItem.rawAuthor.role}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-black/10 dark:border-white/10">
                      <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                        UZMANLIK & ÇALIŞMA ALANLARI
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedItem.rawAuthor.topics.map((t, idx) => (
                          <span key={idx} className="mac-hardware-chip-badge">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                      Mac OS X Address Book ve Mountain Lion Sarı Hukuk Pedi ile yazarın mühendislik notlarını ve tüm yayınlarını inceleyin.
                    </p>

                    <div className="pt-4">
                      <button
                        onClick={selectedItem.onExecute}
                        className="ios6-btn ios6-btn-blue w-full py-2 text-xs"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Yazar Profilini Aç (↵)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 3. Section / System Action Preview */
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                      {selectedItem.icon}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                        {selectedItem.title}
                      </h3>
                      <p className="text-xs text-zinc-500 font-mono mt-1">
                        {selectedItem.subtitle}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-black/5 dark:bg-white/5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                      Java 22 Loom, Spring AI ve Activity Monitor telemetri konsoluna doğrudan erişin veya ilgili modülü başlatın.
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={selectedItem.onExecute}
                        className="ios6-btn ios6-btn-silver w-full py-2 text-xs"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Şimdi Yürüt (↵)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center text-zinc-400 text-xs">
                Önizleme için bir sonuç seçin
              </div>
            )}
          </div>
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-5 py-2.5 border-t border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/20 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px]">↓</kbd>
              <span>Gezin</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px]">↵</kbd>
              <span>Seç / Aç</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px]">esc</kbd>
              <span>Kapat</span>
            </span>
          </div>

          <div className="flex items-center gap-1 font-semibold text-zinc-700 dark:text-zinc-300">
            <Command className="w-3 h-3" />
            <span>Spotlight ⌘K</span>
          </div>
        </div>
      </div>
    </div>
  );
};
