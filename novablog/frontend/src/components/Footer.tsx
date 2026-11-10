'use client';

import React from 'react';
import {
  ExternalLink,
  Zap,
  Cpu,
  Database,
  Layers,
  ShieldCheck,
  Terminal,
  Code2,
} from 'lucide-react';
import { GithubIcon } from './GithubIcon';

interface FooterProps {
  setActiveTab?: (tab: 'feed' | 'ai-search' | 'ai-lab' | 'admin-batch') => void;
  onOpenTelemetry?: () => void;
  onOpenArchitectureConsole?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
  onOpenTelemetry,
  onOpenArchitectureConsole,
}) => {
  const handleNavFeed = () => {
    if (setActiveTab) setActiveTab('feed');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavModule = (moduleId: string) => {
    if (setActiveTab) setActiveTab('feed');
    if (onOpenArchitectureConsole) {
      onOpenArchitectureConsole();
    } else {
      setTimeout(() => {
        const el = document.getElementById('modular-architecture-console');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('select-console-module', { detail: moduleId }));
    }, 100);
  };

  const handleNavAi = () => {
    if (setActiveTab) setActiveTab('ai-search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavBatch = () => {
    if (setActiveTab) setActiveTab('admin-batch');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavBlueprint = () => {
    if (setActiveTab) setActiveTab('feed');
    setTimeout(() => {
      const el = document.getElementById('system-blueprint-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer className="relative bg-[#200e38] text-[#c084fc] overflow-hidden pt-16 sm:pt-20 lg:pt-24 border-t border-[#3b1d63] select-none">
      {/* Ambient Radial Lighting matching Ride Also Aubergine Tone */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-[#8c52ff]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[250px] bg-[#d4f933]/5 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid: Split Layout (Direct Ride Also Footer Clone) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* Left Column: Monumental Category Links (Articles, Core, Vector AI, Batch ETL) */}
          <div className="lg:col-span-5 space-y-4 font-sans">
            <button
              onClick={handleNavFeed}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#c084fc] hover:text-white transition-colors duration-200 cursor-pointer block text-left tracking-tight leading-tight"
            >
              Makaleler
            </button>
            <button
              onClick={() => handleNavModule('loom')}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#c084fc] hover:text-white transition-colors duration-200 cursor-pointer block text-left tracking-tight leading-tight"
            >
              Çekirdek
            </button>
            <button
              onClick={handleNavAi}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#c084fc] hover:text-white transition-colors duration-200 cursor-pointer block text-left tracking-tight leading-tight"
            >
              Vektör AI
            </button>
            <button
              onClick={handleNavBatch}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#c084fc] hover:text-white transition-colors duration-200 cursor-pointer block text-left tracking-tight leading-tight"
            >
              Batch ETL
            </button>
          </div>

          {/* Right Columns: Technical Directory (Company, Resources, Account) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 font-mono text-xs">
            {/* Column 1: Company / Platform */}
            <div className="space-y-4">
              <span className="text-[#e9d5ff] font-bold text-sm tracking-wide block font-sans">
                Kurumsal
              </span>
              <ul className="space-y-2.5 text-[11px] tracking-wider uppercase font-semibold">
                <li>
                  <a
                    href="https://github.com/abdullahberkeozder"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span>HAKKINDA</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </li>
                <li>
                  <button
                    onClick={handleNavFeed}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    MAKALELER
                  </button>
                </li>
                <li>
                  <a
                    href="https://abdullahberkeozder.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span>KARİYER</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </li>
                <li>
                  <button
                    onClick={handleNavBlueprint}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    ŞARTNAME // V4.1.1
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Resources / Specifications */}
            <div className="space-y-4">
              <span className="text-[#e9d5ff] font-bold text-sm tracking-wide block font-sans">
                Mimari Kaynaklar
              </span>
              <ul className="space-y-2.5 text-[11px] tracking-wider uppercase font-semibold">
                <li>
                  <button
                    onClick={() => handleNavModule('loom')}
                    className="hover:text-white transition-colors text-left cursor-pointer flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3 text-[#d4f933]" />
                    <span>JAVA 22 LOOM</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavModule('spring-ai')}
                    className="hover:text-white transition-colors text-left cursor-pointer flex items-center gap-1"
                  >
                    <Layers className="w-3 h-3 text-purple-300" />
                    <span>SPRING AI 128D</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavModule('write-behind')}
                    className="hover:text-white transition-colors text-left cursor-pointer flex items-center gap-1"
                  >
                    <Database className="w-3 h-3 text-rose-300" />
                    <span>WRITE-BEHIND</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavModule('optimistic-locking')}
                    className="hover:text-white transition-colors text-left cursor-pointer flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-300" />
                    <span>JPA @VERSION</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavModule('spring-batch')}
                    className="hover:text-white transition-colors text-left cursor-pointer flex items-center gap-1"
                  >
                    <Cpu className="w-3 h-3 text-amber-300" />
                    <span>SPRING BATCH 5</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Account & Access */}
            <div className="space-y-4">
              <span className="text-[#e9d5ff] font-bold text-sm tracking-wide block font-sans">
                Erişim & Doğrulama
              </span>
              <ul className="space-y-2.5 text-[11px] tracking-wider uppercase font-semibold">
                <li>
                  <button
                    onClick={() => {
                      if (onOpenTelemetry) onOpenTelemetry();
                    }}
                    className="hover:text-white transition-colors text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4f933] animate-pulse" />
                    <span>GİRİŞ & 2FA DOĞRULAMA</span>
                  </button>
                </li>
                <li>
                  <a
                    href="http://localhost:5555/swagger-ui.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span>SWAGGER UI</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </li>
                <li>
                  <a
                    href="http://localhost:5555/h2-console"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span>H2 CONSOLE</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </li>
                <li>
                  <a
                    href="http://localhost:5555/actuator/health"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span>ACTUATOR</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sub-Footer Row: Social Icons on Left & Legal Specifications on Right */}
        <div className="mt-16 pt-8 border-t border-[#3b1d63] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 font-mono text-xs">
          {/* Social Icons (Directly below Company Column as in Ride Also) */}
          <div className="flex items-center gap-4 text-[#c084fc]">
            <a
              href="https://github.com/abdullahberkeozder"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
              title="GitHub Profile"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/abdullahberkeozder/my-portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
              title="Portfolio Monorepo"
            >
              <Code2 className="w-4 h-4" />
            </a>
            <a
              href="https://abdullahberkeozder.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
              title="Architect Portfolio"
            >
              <Terminal className="w-4 h-4" />
            </a>
          </div>

          {/* Secondary Legal & Protocol Badges */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[11px] text-[#c084fc]/80 tracking-widest uppercase">
            <span className="hover:text-white transition-colors cursor-default">
              BASIN & İLETİŞİM
            </span>
            <span className="hover:text-white transition-colors cursor-default">
              KULLANIM ŞARTLARI
            </span>
            <span className="hover:text-white transition-colors cursor-default">
              GİZLİLİK POLİTİKASI
            </span>
            <span className="text-[#d4f933] font-bold">
              201/201 AUTOMATED TESTS (100% PASS)
            </span>
          </div>
        </div>
      </div>

      {/* The Iconic Ride Also Monumental Giant Brandmark ("NOVA.") */}
      <div className="mt-12 sm:mt-16 lg:mt-20 w-full overflow-hidden select-none group cursor-pointer pb-0 mb-0">
        <h1
          onClick={handleNavFeed}
          title="Sayfa Başına Dön"
          className="text-[22vw] font-black tracking-tight text-[#a78bfa] group-hover:text-white transition-colors duration-500 ease-out leading-[0.78] uppercase text-left pl-3 sm:pl-6 lg:pl-10 -mb-2 sm:-mb-6 lg:-mb-10 cursor-pointer select-none"
        >
          NOVA<span className="text-[#d4f933] group-hover:text-white transition-colors duration-500">.</span>
        </h1>
      </div>
    </footer>
  );
};
