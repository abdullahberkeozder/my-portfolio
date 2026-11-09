'use client';

import React from 'react';
import { Cpu, Database, Server, CheckCircle2, AlertCircle, Activity, Sparkles } from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { LiquidThemeToggle } from './LiquidThemeToggle';

interface NavbarProps {
  activeTab: 'feed' | 'ai-search' | 'ai-lab' | 'admin-batch';
  setActiveTab: (tab: 'feed' | 'ai-search' | 'ai-lab' | 'admin-batch') => void;
  isBackendOnline: boolean | null;
  onRefreshHealth: () => void;
  onOpenTelemetry?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isBackendOnline,
  onRefreshHealth,
  onOpenTelemetry,
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/75 dark:bg-[#07080a]/80 border-b border-black/[0.08] dark:border-white/[0.08] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand (Ride Also Aesthetic) */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('feed')}
          >
            <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-800 border border-black/10 dark:border-white/15 flex items-center justify-center p-[2px] transition-transform group-hover:scale-105 shadow-sm">
              <div className="w-full h-full rounded-[9px] bg-black dark:bg-[#07080a] flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d4f933] shadow-[0_0_8px_#d4f933]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-base tracking-tight text-zinc-950 dark:text-white uppercase">
                  NOVA <span className="text-zinc-400 dark:text-zinc-500 font-normal">{'//'}</span> BLOG
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-zinc-900/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 border border-black/10 dark:border-white/10">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono hidden sm:block">
                SPRING BOOT 4.1.1 &bull; JAVA 22 LOOM
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Ride Also Floating Pill) */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900/90 p-1 rounded-full border border-black/[0.08] dark:border-white/[0.08] shadow-inner">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
                activeTab === 'feed'
                  ? 'bg-zinc-950 dark:bg-white text-white dark:text-black font-bold shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              01 // MAKALE & VİTRİN
            </button>
            <button
              onClick={() => setActiveTab('ai-search')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
                activeTab === 'ai-search'
                  ? 'bg-zinc-950 dark:bg-white text-white dark:text-black font-bold shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              02 // VEKTÖR ARAMA
            </button>
            <button
              onClick={() => setActiveTab('ai-lab')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
                activeTab === 'ai-lab'
                  ? 'bg-zinc-950 dark:bg-white text-white dark:text-black font-bold shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              03 // AI LAB
            </button>
            <button
              onClick={() => setActiveTab('admin-batch')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
                activeTab === 'admin-batch'
                  ? 'bg-zinc-950 dark:bg-white text-white dark:text-black font-bold shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              04 // BATCH
            </button>
          </nav>

          {/* Right Status & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Kaolti Liquid Glass Theme Switcher */}
            <LiquidThemeToggle />

            {/* Telemetry Modal Button */}
            {onOpenTelemetry && (
              <button
                onClick={onOpenTelemetry}
                title="Sistem Telemetrisi ve Canlı Mimari"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all border border-black/10 dark:border-white/10 bg-zinc-900/5 dark:bg-zinc-900 hover:border-[#d4f933]/50 text-zinc-800 dark:text-zinc-200 cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5 text-[#a3c900] dark:text-[#d4f933] animate-pulse" />
                <span className="hidden sm:inline font-bold">TELEMETRİ</span>
              </button>
            )}

            {/* Backend Health Badge */}
            <button
              onClick={onRefreshHealth}
              title="Backend Durumu (Tıklayarak sorgulayın)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all border border-black/10 dark:border-white/10 bg-zinc-900/5 dark:bg-zinc-900 hover:border-black/20 dark:hover:border-white/20 cursor-pointer"
            >
              <Server className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              {isBackendOnline === true ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  :5555
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                  <AlertCircle className="w-3 h-3" />
                  DEMO
                </span>
              )}
            </button>

            {/* GitHub Repo Link */}
            <a
              href="https://github.com/abdullahberkeozder/my-portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 p-2 rounded-full glass-liquid hover:border-black/20 dark:hover:border-white/20 text-zinc-800 dark:text-zinc-200 transition-all cursor-pointer"
              title="GitHub Repository"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-black/[0.08] dark:border-white/[0.08] text-xs font-mono">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-2 py-1 rounded-full ${
              activeTab === 'feed'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-black font-bold'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Vitrin
          </button>
          <button
            onClick={() => setActiveTab('ai-search')}
            className={`px-2 py-1 rounded-full ${
              activeTab === 'ai-search'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-black font-bold'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Vektör
          </button>
          <button
            onClick={() => setActiveTab('ai-lab')}
            className={`px-2 py-1 rounded-full ${
              activeTab === 'ai-lab'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-black font-bold'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            AI Lab
          </button>
          <button
            onClick={() => setActiveTab('admin-batch')}
            className={`px-2 py-1 rounded-full ${
              activeTab === 'admin-batch'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-black font-bold'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Batch
          </button>
          {onOpenTelemetry && (
            <button
              onClick={onOpenTelemetry}
              className="px-2 py-1 text-[#a3c900] dark:text-[#d4f933] font-bold"
            >
              Telemetri
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
