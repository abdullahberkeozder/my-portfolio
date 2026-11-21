'use client';

import React, { useState } from 'react';
import { ApiClient } from '@/lib/api';
import {
  X,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Check,
  BookOpen,
  Cpu,
  Database,
  Bot,
  ShieldCheck,
  Layers,
  Sparkles,
} from 'lucide-react';
import { playKeyClick, playTabSelect, playWindowOpen } from '@/lib/retroAudio';

interface FloatingCopilotWidgetProps {
  onOpenArchitectureConsole?: () => void;
  onOpenTelemetry?: () => void;
  onSelectTab?: (tab: 'feed' | 'ai-search' | 'ai-lab' | 'admin-batch') => void;
  onMetricsFlushed?: () => void;
  onOpenAbout?: () => void;
  onOpenArticle?: (blogId: number) => void;
  onOpenTwoFactor?: () => void;
  isOpenControlled?: boolean;
  onCloseControlled?: () => void;
  showFloatingButton?: boolean;
}

interface QnA {
  id: string;
  chipText: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  answer: string;
  tag: string;
  actionText?: string;
  actionType?: 'console-loom' | 'console-writebehind' | 'telemetry' | 'tab-ai' | 'tab-batch' | 'manifesto';
}

const KNOWLEDGE_BASE: QnA[] = [
  {
    id: 'manifesto',
    chipText: 'Philosophy',
    icon: BookOpen,
    title: 'Why Industrial Tactility and Java 22?',
    tag: 'PHILOSOPHY // ENGINEERING DISCIPLINE',
    answer:
      'Built upon Dieter Rams\' principle: "Good design is honest and as little design as possible." Instead of bloated microservices, we embrace a pure engineering discipline on a single modern JVM that pushes hardware limits, avoids locking, and never loses data.',
    actionText: 'Read Architecture Manifesto',
    actionType: 'manifesto',
  },
  {
    id: 'loom',
    chipText: 'Java 22 Loom',
    icon: Cpu,
    title: 'Virtual Threads & Concurrency',
    tag: 'CONCURRENCY // VIRTUAL THREADS',
    answer:
      'Tomcat\'s traditional 200 platform thread pool exhausts under high traffic, leading to server deadlock. Java 22 Loom virtual threads run without blocking OS threads, dropping memory overhead from megabytes to kilobytes to effortlessly handle 10,000+ concurrent requests.',
    actionText: 'Launch Loom Simulator',
    actionType: 'console-loom',
  },
  {
    id: 'write-behind',
    chipText: 'Redis Cache',
    icon: Database,
    title: 'Redis Write-Behind Asynchronous Counter Architecture',
    tag: 'CACHING // ZERO ROW CONTENTION',
    answer:
      'Writing directly to the database on every article view or clap locks server disks. In Redis Write-Behind, counters accumulate in ultra-fast RAM and safely batch-flush to the database every 30 seconds (98% I/O savings).',
    actionText: 'Inspect Write-Behind Buffer',
    actionType: 'console-writebehind',
  },
  {
    id: 'spring-ai',
    chipText: 'AI Vector Search',
    icon: Bot,
    title: 'AI-Powered Semantic Search',
    tag: 'ARTIFICIAL INTELLIGENCE // VECTOR SPACE',
    answer:
      'Classical search only matches the exact letters you type. Our semantic AI engine understands the contextual meaning of your query. For instance, searching for "memory management" returns "garbage collector" articles with highest relevance even if the phrase is absent.',
    actionText: 'Open Vector Studio',
    actionType: 'tab-ai',
  },
  {
    id: '2fa',
    chipText: '2FA Security',
    icon: ShieldCheck,
    title: 'Two-Factor Authentication & Pre-Auth Verification',
    tag: 'SECURITY // TWO-FACTOR TOTP',
    answer:
      'Validating a password does not grant full system access immediately; a temporary "PRE_AUTH" security scope is issued. This token can only reach the TOTP verification endpoint. Full corporate session is unlocked only upon valid Google Authenticator code entry.',
    actionText: 'Open Telemetry Console',
    actionType: 'telemetry',
  },
  {
    id: 'batch',
    chipText: 'Spring Batch',
    icon: Layers,
    title: 'Big Data Retention & Analytics Pipeline',
    tag: 'ETL // CHUNK CLEANUP',
    answer:
      'Soft-deleted records do not accumulate as permanent waste. With Spring Batch 5, background chunk processors safely purge records older than 30 days in 50-item transactions without stressing production throughput, while aggregating author interaction analytics.',
    actionText: 'Go to Batch Studio',
    actionType: 'tab-batch',
  },
];

export const FloatingCopilotWidget: React.FC<FloatingCopilotWidgetProps> = ({
  onOpenArchitectureConsole,
  onOpenTelemetry,
  onSelectTab,
  onMetricsFlushed,
  onOpenAbout,
  isOpenControlled,
  onCloseControlled,
  showFloatingButton = false,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = isOpenControlled !== undefined ? isOpenControlled : internalIsOpen;
  const [selectedQnA, setSelectedQnA] = useState<QnA>(KNOWLEDGE_BASE[0]);
  const [isFlushing, setIsFlushing] = useState(false);
  const [flushSuccess, setFlushSuccess] = useState(false);

  const handleToggleOpen = () => {
    playWindowOpen();
    if (onCloseControlled && isOpen) {
      onCloseControlled();
    }
    setInternalIsOpen((prev) => !prev);
  };

  const handleClose = () => {
    playWindowOpen();
    if (onCloseControlled) onCloseControlled();
    setInternalIsOpen(false);
  };

  const handleManualFlush = async () => {
    playKeyClick('crisp');
    setIsFlushing(true);
    setFlushSuccess(false);
    try {
      await ApiClient.flushMetrics();
      setFlushSuccess(true);
      if (onMetricsFlushed) onMetricsFlushed();
      setTimeout(() => setFlushSuccess(false), 2500);
    } catch {
      // ignore
    } finally {
      setIsFlushing(false);
    }
  };

  const handleAction = (type?: QnA['actionType']) => {
    playKeyClick('crisp');
    handleClose();
    if (!type) return;

    if (type === 'console-loom') {
      if (onSelectTab) onSelectTab('feed');
      if (onOpenArchitectureConsole) onOpenArchitectureConsole();
      setTimeout(() => {
        const el = document.getElementById('modular-architecture-console');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        window.dispatchEvent(new CustomEvent('select-console-module', { detail: 'loom' }));
        window.dispatchEvent(new CustomEvent('run-console-simulation'));
      }, 100);
    } else if (type === 'console-writebehind') {
      if (onSelectTab) onSelectTab('feed');
      if (onOpenArchitectureConsole) onOpenArchitectureConsole();
      setTimeout(() => {
        const el = document.getElementById('modular-architecture-console');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        window.dispatchEvent(new CustomEvent('select-console-module', { detail: 'write-behind' }));
        window.dispatchEvent(new CustomEvent('run-console-simulation'));
      }, 100);
    } else if (type === 'telemetry') {
      if (onOpenTelemetry) onOpenTelemetry();
    } else if (type === 'tab-ai') {
      if (onSelectTab) onSelectTab('ai-search');
      setTimeout(() => {
        const el = document.getElementById('ai-vector-studio');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (type === 'tab-batch') {
      if (onSelectTab) onSelectTab('admin-batch');
      setTimeout(() => {
        const el = document.getElementById('batch-etl-studio');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (type === 'manifesto') {
      if (onOpenAbout) onOpenAbout();
    }
  };

  const handleSelectSubject = (item: QnA) => {
    playTabSelect();
    setSelectedQnA(item);
  };

  return (
    <>
      {/* 1. Floating Trigger Capsule (Mac OS X Snow Leopard Acrylic Glass) */}
      {!isOpen && showFloatingButton && (
        <button
          type="button"
          onClick={handleToggleOpen}
          aria-expanded={isOpen}
          aria-label="Open Nova Systems Architect & Copilot Advisor"
          className="fixed bottom-6 right-6 z-40 mac-copilot-pill-master group"
          title="Open Nova Systems Architect & Copilot Advisor"
        >
          {/* Neon Green Heartbeat Beacon */}
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_#10b981,0_0_16px_rgba(16,185,129,0.5)]" />
          </span>
          <Bot className="w-4 h-4 text-emerald-400 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] transition-transform shrink-0" />
          <span className="w-px h-3.5 bg-white/25 shrink-0" aria-hidden="true" />
          <span className="font-sans text-xs font-black tracking-wider text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] whitespace-nowrap">
            COPILOT ADVISOR
          </span>
        </button>
      )}

      {/* Expanded HUD: Mac OS X Translucent Dark Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[95vw] sm:w-[440px] max-w-[460px] rounded-2xl bg-gradient-to-b from-[#222226]/95 via-[#1a1a1e]/95 to-[#121215]/95 backdrop-blur-xl border border-white/20 shadow-[0_24px_60px_rgba(0,0,0,0.85)] text-white p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200 select-none">
          
          {/* Mac OS 9 Platinum Window Titlebar */}
          <div className="mac9-subwindow-titlebar shrink-0 -mx-5 -mt-5 mb-4 px-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleOpen}
                className="mac9-box-btn"
                title="Close Window (Esc)"
              />
              <span className="mac9-title-badge">
                <Bot className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                 Nova Systems Architect &amp; Copilot
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleToggleOpen}
                className="text-zinc-500 hover:text-black dark:hover:text-white p-0.5"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Subject Chip Carousel (Apple Aqua Segmented Tabs) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              ARCHITECTURAL TOPIC //
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {KNOWLEDGE_BASE.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedQnA.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectSubject(item)}
                    className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-sm border border-blue-400/40'
                        : 'bg-white/10 hover:bg-white/15 text-zinc-300 border border-white/10'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{item.chipText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Knowledge Card (Translucent Brushed Plinth) */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-blue-400 font-bold uppercase tracking-wider">
                {selectedQnA.tag}
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
                <span>VERIFIED SPEC</span>
              </span>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-snug">
              {selectedQnA.title}
            </h4>

            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              {selectedQnA.answer}
            </p>

            {/* Action Bar */}
            {selectedQnA.id === 'write-behind' ? (
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => handleAction(selectedQnA.actionType)}
                  className="mac-aqua-btn flex-1 flex items-center justify-center gap-1.5 !py-2 !text-xs font-bold"
                >
                  <span>Inspect in Console</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={handleManualFlush}
                  disabled={isFlushing}
                  className={`mac-aqua-btn mac-aqua-btn-silver flex-1 flex items-center justify-center gap-1.5 !py-2.5 !text-xs font-bold ${
                    flushSuccess ? '!text-emerald-500 dark:!text-emerald-400' : ''
                  }`}
                  title="Flushes Redis Write-Behind buffer to database"
                >
                  {isFlushing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : flushSuccess ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 stroke-[3]" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span>{isFlushing ? 'WRITING' : flushSuccess ? 'SUCCESS' : 'FLUSH TO DB'}</span>
                </button>
              </div>
            ) : selectedQnA.actionText ? (
              <div className="pt-2">
                <button
                  onClick={() => handleAction(selectedQnA.actionType)}
                  className="mac-aqua-btn w-full flex items-center justify-center gap-2 !py-2 !text-xs font-bold"
                >
                  <span>{selectedQnA.actionText}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : null}
          </div>

          {/* Quick Engine Links Footer */}
          <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[10px] font-mono">
            <a
              href="http://localhost:5555/swagger-ui.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition-colors font-semibold"
            >
              <span>SWAGGER UI</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <a
              href="http://localhost:5555/h2-console"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition-colors font-semibold"
            >
              <span>H2 CONSOLE</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>
      )}
    </>
  );
};
