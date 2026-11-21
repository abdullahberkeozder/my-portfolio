'use client';

import React from 'react';
import {
  ExternalLink,
  Globe,
  Activity,
  Layers,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { playKeyClick, playTabSelect } from '@/lib/retroAudio';

interface FooterProps {
  setActiveTab?: (tab: 'feed' | 'ai-search' | 'ai-lab' | 'admin-batch') => void;
  onOpenTelemetry?: () => void;
  onOpenArchitectureConsole?: () => void;
  onOpenAbout?: () => void;
  onOpenTwoFactor?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
  onOpenTelemetry,
  onOpenArchitectureConsole,
  onOpenAbout,
}) => {
  const handleNavFeed = () => {
    playTabSelect();
    if (setActiveTab) setActiveTab('feed');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavModule = (moduleId: string) => {
    playKeyClick();
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
    playTabSelect();
    if (setActiveTab) setActiveTab('ai-search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavAiLab = () => {
    playTabSelect();
    if (setActiveTab) setActiveTab('ai-lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavBatch = () => {
    playTabSelect();
    if (setActiveTab) setActiveTab('admin-batch');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavBlueprint = () => {
    playKeyClick();
    if (setActiveTab) setActiveTab('feed');
    setTimeout(() => {
      const el = document.getElementById('system-blueprint-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer className="apple-classic-footer pt-12 pb-32 sm:pb-36 border-t select-none transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Apple 2010 Classic 5-Column Sitemap Directory */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 pb-10">
          {/* Column 1: Articles & Publications */}
          <div className="space-y-2.5">
            <h4 className="apple-footer-col-title flex items-center gap-1.5">
              <span>Nova Articles</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={handleNavFeed} className="apple-footer-link text-left">
                  Most Read Publications
                </button>
              </li>
              <li>
                <button onClick={() => handleNavModule('loom')} className="apple-footer-link text-left">
                  Java 22 Loom &amp; Virtual Threads
                </button>
              </li>
              <li>
                <button onClick={handleNavAi} className="apple-footer-link text-left">
                  Spring AI &amp; Vector Space
                </button>
              </li>
              <li>
                <button onClick={() => handleNavModule('db')} className="apple-footer-link text-left">
                  PostgreSQL &amp; pgvector 128D
                </button>
              </li>
              <li>
                <button onClick={() => handleNavModule('redis')} className="apple-footer-link text-left">
                  Redis Write-Behind Cache
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Nova Core & Infrastructure */}
          <div className="space-y-2.5">
            <h4 className="apple-footer-col-title flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>Core &amp; Architecture</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleNavModule('loom')} className="apple-footer-link text-left">
                  Virtual Thread Executor
                </button>
              </li>
              <li>
                <button onClick={() => handleNavModule('redis')} className="apple-footer-link text-left">
                  Redis L2 Cache Engine
                </button>
              </li>
              <li>
                <button onClick={() => handleNavModule('db')} className="apple-footer-link text-left">
                  HikariCP Connection Pool
                </button>
              </li>
              <li>
                <button onClick={() => handleNavModule('stream')} className="apple-footer-link text-left">
                  Kafka Event Stream Pipeline
                </button>
              </li>
              <li>
                <button onClick={handleNavBlueprint} className="apple-footer-link text-left">
                  System Architecture Blueprint
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: AI & Semantic Vector Lab */}
          <div className="space-y-2.5">
            <h4 className="apple-footer-col-title flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>AI &amp; Vector Studio</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={handleNavAi} className="apple-footer-link text-left">
                  Spring AI Semantic Search
                </button>
              </li>
              <li>
                <button onClick={handleNavAi} className="apple-footer-link text-left">
                  pgvector HNSW Indexing
                </button>
              </li>
              <li>
                <button onClick={handleNavAiLab} className="apple-footer-link text-left">
                  Cosine Similarity Distance Matrix
                </button>
              </li>
              <li>
                <button onClick={handleNavAiLab} className="apple-footer-link text-left">
                  1-Minute AI TL;DR Engine
                </button>
              </li>
              <li>
                <button onClick={handleNavAiLab} className="apple-footer-link text-left">
                  LLM Multi-Agent Sandbox
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Community & Authors */}
          <div className="space-y-2.5">
            <h4 className="apple-footer-col-title flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-purple-500" />
              <span>Community &amp; Engineers</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    playKeyClick();
                    if (onOpenAbout) onOpenAbout();
                  }}
                  className="apple-footer-link text-left"
                >
                  Nova Manifesto
                </button>
              </li>
              <li>
                <button onClick={handleNavFeed} className="apple-footer-link text-left">
                  Senior Author Profiles
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/abdullahberkeozder"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => playKeyClick()}
                  className="apple-footer-link flex items-center gap-1"
                >
                  <span>Engineering Contributions</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <button onClick={handleNavBatch} className="apple-footer-link text-left">
                  Batch &amp; ETL Task Manager
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: System & Diagnostics */}
          <div className="space-y-2.5">
            <h4 className="apple-footer-col-title flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-500" />
              <span>System &amp; Diagnostics</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    playKeyClick();
                    if (onOpenTelemetry) onOpenTelemetry();
                  }}
                  className="apple-footer-link text-left"
                >
                  Activity Monitor Telemetry
                </button>
              </li>
              <li>
                <a
                  href="http://localhost:5555/actuator/health"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => playKeyClick()}
                  className="apple-footer-link flex items-center gap-1"
                >
                  <span>Spring Boot Actuator Health</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="http://localhost:5555/swagger-ui/index.html"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => playKeyClick()}
                  className="apple-footer-link flex items-center gap-1"
                >
                  <span>OpenAPI Swagger Specifications</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/abdullahberkeozder"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => playKeyClick()}
                  className="apple-footer-link flex items-center gap-1.5"
                >
                  <GithubIcon className="w-3 h-3" />
                  <span>GitHub Repository</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Global Bottom Bar: Copyright, Legal Links, and Country Selector */}
        <div className="apple-footer-legal-bar pt-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-center md:text-left">
            <span>Copyright © 2026 Nova Tech Publication Inc. All rights reserved.</span>
            <span className="hidden md:inline">&bull;</span>
            <span className="text-[11px] opacity-80">
              Mac OS X (10.6–10.11) & iOS 6 Retro Skeuomorphic Experience
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              type="button"
              onClick={() => playKeyClick()}
              className="apple-footer-link flex items-center gap-1 text-[11px] font-medium"
            >
              <Globe className="w-3 h-3 text-zinc-500" />
              <span>🌐 United States (English)</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
