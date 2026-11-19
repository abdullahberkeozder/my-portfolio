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
  onMetricsFlushed?: () => void;
}

export const PortalCockpitDock: React.FC<PortalCockpitDockProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateModal,
  onOpenTelemetry,
  onOpenSpotlight,
  onOpenAbout,
  onMetricsFlushed,
}) => {
  const [isFlushing, setIsFlushing] = useState(false);
  const [flushSuccess, setFlushSuccess] = useState(false);

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
      className="mac-3d-glass-dock-wrapper select-none"
    >
      <div className="mac-3d-glass-dock">
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

        {/* Dock Separator Line */}
        <div className="mac-dock-separator" />

        {/* 5. Mac Mail (Yeni Makale Yaz) */}
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

        {/* 6. Spotlight Search (⌘K) */}
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

        {/* 7. Redis Write-Behind Flush Trigger */}
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

        {/* 8. About This Mac ( Manifesto) */}
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
      </div>
    </aside>
  );
};
