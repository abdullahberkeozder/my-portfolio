'use client';

import React, { useState } from 'react';
import { ApiClient } from '@/lib/api';
import {
  Compass,
  Cpu,
  Database,
  PenSquare,
  Search,
  RefreshCw,
  Sparkles,
  Info,
  Activity,
  Bot,
  Pin,
} from 'lucide-react';
import { playKeyClick, playTabSelect, playWindowOpen } from '@/lib/retroAudio';
import { NavTab } from '@/components/Navbar';

interface PortalCockpitDockProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenCreateModal: () => void;
  onOpenTelemetry: () => void;
  onOpenSpotlight?: () => void;
  onOpenAbout?: () => void;
  onOpenCopilot?: () => void;
  onMetricsFlushed?: () => void;
}

export const PortalCockpitDock: React.FC<PortalCockpitDockProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateModal,
  onOpenTelemetry,
  onOpenSpotlight,
  onOpenAbout,
  onOpenCopilot,
  onMetricsFlushed,
}) => {
  const [isFlushing, setIsFlushing] = useState(false);
  const [flushSuccess, setFlushSuccess] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isDockRevealed = isPinned || isHovered;

  const handleFlushBuffer = async () => {
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

  const handleNavTab = (tab: NavTab, targetId?: string) => {
    playTabSelect();
    setActiveTab(tab);
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenCompose = () => {
    playWindowOpen();
    onOpenCreateModal();
  };

  const handleOpenSpotlightClick = () => {
    playWindowOpen();
    if (onOpenSpotlight) {
      onOpenSpotlight();
    } else {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
    }
  };

  const handleOpenAboutClick = () => {
    playWindowOpen();
    if (onOpenAbout) onOpenAbout();
  };

  return (
    <aside
      aria-label="Mac OS X 3D Glass Desktop Dock"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 select-none transition-transform duration-350 ease-[cubic-bezier(0.175,0.885,0.32,1.15)] flex flex-col items-center pointer-events-auto"
      style={{
        transform: isDockRevealed
          ? 'translateX(-50%) translateY(0)'
          : 'translateX(-50%) translateY(calc(100% - 14px))',
      }}
    >
      {/* 1. Mac OS X Knurled Aluminum Pull-Tab Grip */}
      <button
        type="button"
        onClick={() => setIsHovered((prev) => !prev)}
        aria-label="Mac OS X 3D Dock'u Aç/Kapat"
        className="mac-dock-pull-tab group cursor-pointer"
        title={isDockRevealed ? "Dock'u Daralt" : " Mac OS X Dock'u Genişlet (Hover)"}
      >
        <span className="mac-dock-knurled-ribs" />
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/90 shadow-[0_0_6px_#38bdf8] animate-pulse" />
      </button>

      {/* 2. 3D Reflective Glass Dock Body */}
      <div className="mac-3d-glass-dock shadow-2xl">
        {/* 1. Finder / Feed (Vitrin) */}
        <div
          onClick={() => handleNavTab('feed', 'articles-feed')}
          className="mac-dock-item"
          title="Yayın Akışı (Finder / Vitrin)"
        >
          <div className="mac-dock-tile-3d">
            <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className={`mac-dock-indicator-dot ${activeTab === 'feed' ? 'active' : ''}`} />
        </div>

        {/* 2. Activity Monitor (Telemetri Konsolu) */}
        <div
          onClick={() => {
            playKeyClick('crisp');
            onOpenTelemetry();
          }}
          className="mac-dock-item"
          title="Activity Monitor & CRT Telemetri"
        >
          <div className="mac-dock-tile-3d">
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mac-dock-indicator-dot" />
        </div>

        {/* 3. Vector Lab (Spring AI pgvector 128D) */}
        <div
          onClick={() => handleNavTab('ai-search', 'ai-vector-studio')}
          className="mac-dock-item"
          title="Spring AI & pgvector Vektör Stüdyosu"
        >
          <div className="mac-dock-tile-3d">
            <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className={`mac-dock-indicator-dot ${activeTab === 'ai-search' ? 'active' : ''}`} />
        </div>

        {/* 4. Xserve Batch Studio (Spring Batch 5) */}
        <div
          onClick={() => handleNavTab('admin-batch', 'batch-etl-studio')}
          className="mac-dock-item"
          title="Spring Batch 5 & Xserve Veri Ambarı"
        >
          <div className="mac-dock-tile-3d">
            <Database className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className={`mac-dock-indicator-dot ${activeTab === 'admin-batch' ? 'active' : ''}`} />
        </div>

        {/* 5. Nova Copilot AI Assistant */}
        <div
          onClick={() => {
            playWindowOpen();
            if (onOpenCopilot) onOpenCopilot();
          }}
          className="mac-dock-item"
          title="Nova Copilot // Mimari Asistan"
        >
          <div className="mac-dock-tile-3d">
            <Bot className="w-5 h-5 text-cyan-500" />
          </div>
          <div className="mac-dock-indicator-dot" />
        </div>

        {/* Dock Separator Line */}
        <div className="mac-dock-separator" />

        {/* 6. Mac Mail (Yeni Makale Yaz) */}
        <div
          onClick={handleOpenCompose}
          className="mac-dock-item"
          title="Mac Mail — Yeni Makale Yaz"
        >
          <div className="mac-dock-tile-3d">
            <PenSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mac-dock-indicator-dot" />
        </div>

        {/* 7. Spotlight Search (⌘K) */}
        <div
          onClick={handleOpenSpotlightClick}
          className="mac-dock-item"
          title="Spotlight Arama (⌘K)"
        >
          <div className="mac-dock-tile-3d">
            <Search className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
          </div>
          <div className="mac-dock-indicator-dot" />
        </div>

        {/* 8. Redis Write-Behind Flush Trigger */}
        <div
          onClick={handleFlushBuffer}
          className="mac-dock-item"
          title="Redis Write-Behind Tamponunu Veritabanına Aktar"
        >
          <div className={`mac-dock-tile-3d ${flushSuccess ? '!bg-emerald-500 text-white' : ''}`}>
            {isFlushing ? (
              <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
            ) : flushSuccess ? (
              <Sparkles className="w-5 h-5 animate-bounce text-white" />
            ) : (
              <RefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            )}
          </div>
          <div className={`mac-dock-indicator-dot ${flushSuccess ? 'active' : ''}`} />
        </div>

        {/* 9. About This Mac ( Manifesto) */}
        <div
          onClick={handleOpenAboutClick}
          className="mac-dock-item"
          title="Bu Mac Hakkında (Mimari Manifesto)"
        >
          <div className="mac-dock-tile-3d">
            <Info className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />
          </div>
          <div className="mac-dock-indicator-dot" />
        </div>

        {/* 10. Dock Pin / Unpin Button */}
        <button
          type="button"
          onClick={() => {
            playKeyClick();
            setIsPinned((p) => !p);
          }}
          className={`px-1 py-1 rounded transition-colors self-center ${
            isPinned
              ? 'text-amber-400 bg-amber-500/20 shadow-xs'
              : 'text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
          title={isPinned ? 'Dock Sabitlendi (Otomatik Gizlemeyi Aç)' : 'Dock’u Sabitle'}
        >
          <Pin className={`w-3.5 h-3.5 ${isPinned ? 'rotate-45' : ''}`} />
        </button>
      </div>
    </aside>
  );
};
