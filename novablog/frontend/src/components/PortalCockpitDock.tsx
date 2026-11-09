'use client';

import React, { useState } from 'react';
import { ApiClient } from '@/lib/api';
import {
  Sparkles,
  Database,
  ArrowDownToLine,
  RefreshCw,
  Plus,
  Cpu,
  LayoutGrid,
} from 'lucide-react';
import { LiquidThemeToggle } from './LiquidThemeToggle';

interface PortalCockpitDockProps {
  activeTab: 'feed' | 'ai-search' | 'ai-lab' | 'admin-batch';
  setActiveTab: (tab: 'feed' | 'ai-search' | 'ai-lab' | 'admin-batch') => void;
  onOpenCreateModal: () => void;
  onOpenTelemetry: () => void;
  onMetricsFlushed?: () => void;
}

export const PortalCockpitDock: React.FC<PortalCockpitDockProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateModal,
  onOpenTelemetry,
  onMetricsFlushed,
}) => {
  const [isFlushing, setIsFlushing] = useState(false);
  const [flushSuccess, setFlushSuccess] = useState(false);

  const handleFlushBuffer = async () => {
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

  return (
    <aside
      aria-label="Portal Cockpit Dock"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[94vw] sm:max-w-fit"
    >
      <div className="relative flex items-center gap-1.5 sm:gap-2.5 p-1.5 sm:p-2 rounded-full glass-liquid shadow-2xl border border-black/10 dark:border-white/15 backdrop-blur-2xl transition-all duration-300">
        {/* Specular Edge Line */}
        <span className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        {/* Engine Status Tag (Ride Also Cockpit Style) */}
        <button
          onClick={onOpenTelemetry}
          title="Telemetri HUD Konsolunu Aç"
          className="hidden md:flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors font-mono text-[11px] font-bold text-zinc-900 dark:text-white cursor-pointer select-none"
        >
          <span className="w-2 h-2 rounded-full bg-[#d4f933] shadow-[0_0_8px_#d4f933] animate-pulse" />
          <span>PORTAL // HUD</span>
        </button>

        <span className="hidden md:block w-[1px] h-5 bg-black/10 dark:bg-white/10" />

        {/* Modular View Selectors */}
        <div className="flex items-center gap-1 font-mono text-xs">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'feed'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-black shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">VİTRİN</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-search')}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ai-search'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-black shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">VEKTÖR</span>
          </button>

          <button
            onClick={() => setActiveTab('admin-batch')}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'admin-batch'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-black shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">BATCH</span>
          </button>
        </div>

        <span className="w-[1px] h-5 bg-black/10 dark:bg-white/10" />

        {/* Quick Flush Buffer Action Button */}
        <button
          onClick={handleFlushBuffer}
          disabled={isFlushing}
          title="Redis Write-Behind Tamponunu Veritabanına Flush Et"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[11px] font-bold transition-all cursor-pointer ${
            flushSuccess
              ? 'bg-emerald-500 text-white'
              : 'hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
          }`}
        >
          {isFlushing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#d4f933]" />
          ) : flushSuccess ? (
            <Sparkles className="w-3.5 h-3.5 animate-bounce" />
          ) : (
            <ArrowDownToLine className="w-3.5 h-3.5 text-[#a3c900] dark:text-[#d4f933]" />
          )}
          <span className="hidden sm:inline">
            {isFlushing ? 'YAZILIYOR' : flushSuccess ? 'FLUSH EDİLDİ' : 'FLUSH'}
          </span>
        </button>

        {/* Primary Ride Also Volt Action Pill: + YAYINLA */}
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#d4f933] hover:bg-[#c4e82b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#d4f933]/25 active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>YAZ</span>
        </button>

        {/* Kaolti Liquid Theme Switcher */}
        <div className="pl-0.5">
          <LiquidThemeToggle />
        </div>
      </div>
    </aside>
  );
};
