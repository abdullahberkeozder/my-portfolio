'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Cpu,
  Brain,
  Database,
  Shield,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  X,
  Layers,
  Zap,
} from 'lucide-react';
import { playKeyClick, playWindowOpen } from '@/lib/retroAudio';

interface ColumnItem {
  id: string;
  title: string;
  specCode: string;
  summary: string;
  status: string;
  targetId: string;
  tab: 'feed' | 'system' | 'ai-search' | 'admin-batch';
}

interface ColumnCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: ColumnItem[];
}

const DIRECTORY_DATA: ColumnCategory[] = [
  {
    id: 'feed',
    title: 'Makaleler & Vitrin',
    icon: <FileText className="w-3.5 h-3.5" />,
    items: [
      {
        id: 'all-articles',
        title: 'All Articles (Feed)',
        specCode: 'FEED // ALL',
        summary: 'Latest technical releases and trending engineering publications.',
        status: '26 ARTICLES',
        targetId: 'articles-feed',
        tab: 'feed',
      },
      {
        id: 'featured-spec',
        title: 'Featured Engineering',
        specCode: 'CURATED // SPEC',
        summary: 'Curated deep-dive architectural breakdowns approved by engineering committee.',
        status: 'EDITOR CHOICE',
        targetId: 'articles-feed',
        tab: 'feed',
      },
    ],
  },
  {
    id: 'core',
    title: 'Architectural Core',
    icon: <Cpu className="w-3.5 h-3.5" />,
    items: [
      {
        id: 'loom',
        title: 'Java 22 Loom V-Threads',
        specCode: 'JDK-22 // JEP-444',
        summary: '10,000 virtual thread pool eliminating operating system thread contention.',
        status: '11,400+ REQ/S',
        targetId: 'modular-architecture-console',
        tab: 'system',
      },
      {
        id: 'write-behind',
        title: 'Redis Write-Behind Buffer',
        specCode: 'CACHE // WRITE-BEHIND',
        summary: 'Zero PostgreSQL row lock contention on view and clap engagement metrics.',
        status: 'ASYNC BUFFER',
        targetId: 'modular-architecture-console',
        tab: 'system',
      },
      {
        id: 'occ',
        title: 'JPA Optimistic Locking',
        specCode: 'JPA // RFC-OPT-LOCK',
        summary: 'Conflict-free concurrent state mutations guarded by @Version optimistic locking.',
        status: 'LOCK-FREE OCC',
        targetId: 'modular-architecture-console',
        tab: 'system',
      },
      {
        id: 'storage',
        title: 'PostgreSQL 16 & HikariCP',
        specCode: 'DB // POOL-OPTIMIZED',
        summary: 'Zero-leak connection pool paired with Flyway automated schema migrations.',
        status: '10/10 POOL',
        targetId: 'modular-architecture-console',
        tab: 'system',
      },
    ],
  },
  {
    id: 'ai',
    title: 'Spring AI & Vector',
    icon: <Brain className="w-3.5 h-3.5" />,
    items: [
      {
        id: 'pgvector',
        title: '128D Vector Retrieval',
        specCode: 'PGVECTOR // COSINE',
        summary: 'Cosine similarity and deep semantic embeddings with PostgreSQL pgvector.',
        status: 'SUB-MS EMBED',
        targetId: 'ai-vector-studio',
        tab: 'ai-search',
      },
      {
        id: 'moderation',
        title: 'AI Moderation Radar',
        specCode: 'SAFETY // MODERATION',
        summary: 'Multilingual LLM-based toxicity quarantine and quality gate.',
        status: 'AUTO-APPROVED',
        targetId: 'ai-vector-studio',
        tab: 'ai-search',
      },
    ],
  },
  {
    id: 'batch',
    title: 'Batch & ETL Console',
    icon: <Database className="w-3.5 h-3.5" />,
    items: [
      {
        id: 'retention',
        title: 'Soft-Delete Purge Job',
        specCode: 'BATCH // RETENTION-30D',
        summary: 'Nightly retention job purging soft-deleted records older than 30 days.',
        status: 'CRON SCHEDULED',
        targetId: 'batch-etl-studio',
        tab: 'admin-batch',
      },
      {
        id: 'analytics',
        title: 'Author Analytics ETL',
        specCode: 'BATCH // AUTHOR-STATS',
        summary: 'Aggregating author metrics and exporting analytical digests to S3 storage.',
        status: 'CHUNK 100',
        targetId: 'batch-etl-studio',
        tab: 'admin-batch',
      },
    ],
  },
  {
    id: 'security',
    title: 'Security & Telemetry',
    icon: <Shield className="w-3.5 h-3.5" />,
    items: [
      {
        id: 'totp',
        title: 'RFC 6238 TOTP 2FA',
        specCode: 'SEC // GOOGLE-AUTH',
        summary: 'Hardware-backed time-based one-time password encryption and QR provisioning.',
        status: 'SECURE ENCLAVE',
        targetId: 'modular-architecture-console',
        tab: 'system',
      },
      {
        id: 'problem-details',
        title: 'RFC 7807 Problem Details',
        specCode: 'IETF // RFC-7807',
        summary: 'Global RFC standard format concealing stack traces while exposing actionable details.',
        status: 'STANDARD JSON',
        targetId: 'modular-architecture-console',
        tab: 'system',
      },
    ],
  },
];

interface SpecDirectoryPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (targetId: string, tab: 'feed' | 'system' | 'ai-search' | 'admin-batch') => void;
}

export const SpecDirectoryPopover: React.FC<SpecDirectoryPopoverProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string>('core');
  const [selectedItemId, setSelectedItemId] = useState<string>('loom');
  const popoverRef = useRef<HTMLDivElement>(null);

  const activeCategory = DIRECTORY_DATA.find((c) => c.id === selectedCatId) || DIRECTORY_DATA[1];
  const activeItem =
    activeCategory.items.find((i) => i.id === selectedItemId) || activeCategory.items[0];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKey);
      playWindowOpen();
    }
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pr-4 sm:pr-8 pt-16 pointer-events-none">
      {/* Click-away Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-[2px] pointer-events-auto transition-opacity"
        onClick={onClose}
      />

      {/* Mac OS X Column View Popover Window */}
      <div
        ref={popoverRef}
        className="relative pointer-events-auto w-[680px] max-w-[95vw] h-[350px] rounded-2xl bg-[#ececec]/95 dark:bg-[#1a1c22]/95 border border-black/20 dark:border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100 select-none animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Window Chrome Titlebar */}
        <div className="h-7 px-3 bg-gradient-to-b from-[#f6f6f6] to-[#dddddd] dark:from-[#2d3039] dark:to-[#1e2026] border-b border-black/15 dark:border-black/50 flex items-center justify-between text-[11px] font-mono font-semibold text-zinc-600 dark:text-zinc-300">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] border border-[#e0443e] cursor-pointer hover:opacity-80"
              onClick={onClose}
              title="Kapat (Esc)"
            />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e] border border-[#d89e24]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840] border border-[#1aab29]" />
          </div>
          <span className="font-bold tracking-wider text-[10px] uppercase">
             SPEC DIRECTORY // FINDER COLUMN VIEW
          </span>
          <button
            onClick={onClose}
            className="text-[10px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            Esc
          </button>
        </div>

        {/* 3 Columns Body */}
        <div className="flex-1 grid grid-cols-12 divide-x divide-black/10 dark:divide-white/10 overflow-hidden font-sans text-xs">
          {/* Column 1: Root Sidebar (4 cols) */}
          <div className="col-span-4 p-1.5 space-y-0.5 bg-zinc-200/50 dark:bg-zinc-900/40 overflow-y-auto scrollbar-none font-medium">
            <div className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase px-2 py-1 font-bold">
              ROOT DOMAINS
            </div>
            {DIRECTORY_DATA.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  playKeyClick();
                  setSelectedCatId(cat.id);
                  setSelectedItemId(cat.items[0]?.id);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  selectedCatId === cat.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-xs'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {cat.icon}
                <span className="truncate">{cat.title}</span>
              </button>
            ))}
          </div>

          {/* Column 2: Spec List (4 cols) */}
          <div className="col-span-4 p-1.5 space-y-0.5 bg-white/40 dark:bg-black/20 overflow-y-auto scrollbar-none">
            <div className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase px-2 py-1 font-bold">
              MODULES
            </div>
            {activeCategory.items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  playKeyClick();
                  setSelectedItemId(item.id);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  selectedItemId === item.id
                    ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/30'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span className="truncate pr-1">{item.title}</span>
                <ChevronRight className="w-3 h-3 shrink-0 opacity-60" />
              </button>
            ))}
          </div>

          {/* Column 3: Quick Look Inspector (4 cols) */}
          <div className="col-span-4 p-3 flex flex-col justify-between bg-zinc-100/60 dark:bg-zinc-900/60">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[9px] font-bold">
                {activeItem.specCode}
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-zinc-950 dark:text-white leading-snug">
                {activeItem.title}
              </h4>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans line-clamp-3">
                {activeItem.summary}
              </p>
              <div className="pt-1 flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                <span>{activeItem.status}</span>
              </div>
            </div>

            <button
              onClick={() => {
                playKeyClick();
                onNavigate(activeItem.targetId, activeItem.tab);
                onClose();
              }}
              className="mac-aqua-btn-primary w-full py-1.5 !text-xs font-bold flex items-center justify-center gap-1.5 shadow cursor-pointer hover:scale-[1.01] active:scale-[0.98] transition-transform"
            >
              <span>Launch Module</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
