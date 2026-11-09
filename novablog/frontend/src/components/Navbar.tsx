'use client';

import React from 'react';
import { Sparkles, Cpu, Database, Server, CheckCircle2, AlertCircle } from 'lucide-react';
import { GithubIcon } from './GithubIcon';

interface NavbarProps {
  activeTab: 'feed' | 'ai-search' | 'ai-lab' | 'admin-batch';
  setActiveTab: (tab: 'feed' | 'ai-search' | 'ai-lab' | 'admin-batch') => void;
  isBackendOnline: boolean | null;
  onRefreshHealth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isBackendOnline,
  onRefreshHealth,
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('feed')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-400 p-[2px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  NovaBlog
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Spring Boot 4.1.1 & Spring AI & Next.js 16
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'feed'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Makaleler & Vitrin
            </button>
            <button
              onClick={() => setActiveTab('ai-search')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'ai-search'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-4 h-4 text-purple-400" />
              Spring AI Vektör Arama
            </button>
            <button
              onClick={() => setActiveTab('ai-lab')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'ai-lab'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              AI Laboratuvarı
            </button>
            <button
              onClick={() => setActiveTab('admin-batch')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'admin-batch'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-4 h-4 text-cyan-400" />
              Batch & Sistem
            </button>
          </nav>

          {/* Right Status / Actions */}
          <div className="flex items-center gap-3">
            {/* Backend Health Badge */}
            <button
              onClick={onRefreshHealth}
              title="Backend Durumu (Tıklayarak yeniden sorgulayın)"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition-all border bg-slate-900 border-slate-800 hover:border-slate-700"
            >
              <Server className="w-3.5 h-3.5 text-slate-400" />
              {isBackendOnline === true ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  Backend: 5555
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400">
                  <AlertCircle className="w-3 h-3" />
                  Canlı Demo Modu
                </span>
              )}
            </button>

            {/* GitHub Repo */}
            <a
              href="https://github.com/abdullahberkeozder/my-portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <GithubIcon className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800/60 text-xs">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-2 py-1 rounded ${activeTab === 'feed' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
          >
            Vitrin
          </button>
          <button
            onClick={() => setActiveTab('ai-search')}
            className={`px-2 py-1 rounded ${activeTab === 'ai-search' ? 'text-purple-400 font-semibold' : 'text-slate-400'}`}
          >
            Vektör Arama
          </button>
          <button
            onClick={() => setActiveTab('ai-lab')}
            className={`px-2 py-1 rounded ${activeTab === 'ai-lab' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
          >
            AI Lab
          </button>
          <button
            onClick={() => setActiveTab('admin-batch')}
            className={`px-2 py-1 rounded ${activeTab === 'admin-batch' ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}
          >
            Batch
          </button>
        </div>
      </div>
    </header>
  );
};
