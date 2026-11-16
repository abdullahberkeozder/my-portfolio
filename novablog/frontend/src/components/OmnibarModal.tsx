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
  ArrowRight,
  Command,
} from 'lucide-react';
import { BlogDto } from '@/types/api';

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
  title: string;
  subtitle?: string;
  badge?: string;
  icon: React.ReactNode;
  onExecute: () => void;
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
        title: b.title,
        subtitle: `${b.author || 'Mühendis'} • ~${readTime} dk okuma`,
        badge: b.tags?.[0] ? `#${b.tags[0]}` : undefined,
        icon: <FileText className="w-4 h-4 text-emerald-500" />,
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
        title: a.name,
        subtitle: a.role,
        badge: a.topics[0],
        icon: <User className="w-4 h-4 text-cyan-500" />,
        onExecute: () => {
          onClose();
          onSelectAuthor(a.name);
        },
      });
    });

    // 3. Navigation Sections
    const navSections = [
      { id: 'articles-feed', label: 'Yayın Akışı & Makaleler', icon: <Layers className="w-4 h-4 text-emerald-400" /> },
      { id: 'modular-architecture-console', label: 'Modüler Dağıtık Sistem Mimarisi', icon: <Cpu className="w-4 h-4 text-cyan-400" /> },
      { id: 'ai-vector-studio', label: 'Spring AI & pgvector Vektör Stüdyosu', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
      { id: 'batch-etl-studio', label: 'Spring Batch 5 Chunk ETL Konsolu', icon: <Database className="w-4 h-4 text-amber-400" /> },
    ];

    navSections
      .filter((s) => !q || s.label.toLowerCase().includes(q))
      .forEach((s) => {
        result.push({
          id: `nav-${s.id}`,
          category: 'navigation',
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
        icon: <Activity className="w-4 h-4 text-[#d4f933]" />,
        onExecute: () => {
          onClose();
          onOpenTelemetry();
        },
      },
      {
        id: 'action-2fa',
        title: 'Donanımsal 2FA Güvenlik Konsolu',
        subtitle: 'RFC 6238 TOTP Donanım Doğrulaması',
        icon: <Shield className="w-4 h-4 text-indigo-400" />,
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
          title: a.title,
          subtitle: a.subtitle,
          icon: a.icon,
          onExecute: a.onExecute,
        });
      });

    // 5. Spring AI Semantic search suggestion if query has characters
    if (q.length >= 2) {
      result.unshift({
        id: 'action-semantic-search',
        category: 'actions',
        title: `Spring AI ile Vektör Uzayında Ara: "${query.trim()}"`,
        subtitle: '128-boyutlu gömme kosinüs benzerliği taraması',
        badge: 'pgvector',
        icon: <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />,
        onExecute: () => {
          onClose();
          onTriggerSemanticSearch(query.trim());
        },
      });
    }

    return result;
  }, [query, blogs, onClose, onSelectBlog, onSelectAuthor, onOpenCreateModal, onOpenTelemetry, onOpenTwoFactor, onTriggerSemanticSearch]);

  // Safe selected index bounded by items length
  const safeSelectedIndex = items.length === 0 ? 0 : Math.min(selectedIndex, items.length - 1);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (items.length > 0 ? (prev + 1) % items.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
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
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0c0e12] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="relative flex items-center px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0">
          <Search className="w-5 h-5 text-zinc-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Makale, yazar, bölüm veya eylem ara... (örn: Virtual Threads, Selin, Telemetri)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-base sm:text-sm font-sans text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-500 border border-zinc-200 dark:border-zinc-700">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1">
          {items.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 space-y-2">
              <p className="text-xs font-mono uppercase tracking-wider">Eşleşen sonuç bulunamadı</p>
              <p className="text-[11px] text-zinc-500">Farklı anahtar kelimeler veya yazar adı deneyebilirsiniz.</p>
            </div>
          ) : (
            items.map((item, idx) => {
              const isSelected = idx === safeSelectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.onExecute}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-zinc-100 dark:bg-zinc-800/90 text-zinc-950 dark:text-white'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold truncate">
                        {item.title}
                      </h4>
                      {item.subtitle && (
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {item.badge}
                      </span>
                    )}
                    {isSelected && (
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-500 animate-in fade-in" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-5 py-2.5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-[10px]">↓</kbd>
              <span>Gezin</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-[10px]">↵</kbd>
              <span>Seç</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            <span>K Komut Paleti</span>
          </div>
        </div>
      </div>
    </div>
  );
};
