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
    <footer className="apple-classic-footer pt-12 pb-8 border-t select-none transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Apple 2010 Classic 5-Column Sitemap Directory */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 pb-10">
          {/* Column 1: Makaleler & Yayın */}
          <div className="space-y-2.5">
            <h4 className="apple-footer-col-title flex items-center gap-1.5">
              <span> Nova Makaleler</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={handleNavFeed} className="apple-footer-link text-left">
                  En Çok Okunanlar
                </button>
              </li>
              <li>
                <button onClick={() => handleNavModule('loom')} className="apple-footer-link text-left">
                  Java 22 Loom & Sanal İş Parçacıkları
                </button>
              </li>
              <li>
                <button onClick={handleNavAi} className="apple-footer-link text-left">
                  Spring AI & Vektör Uzayı
                </button>
              </li>
              <li>
                <button onClick={() => handleNavModule('db')} className="apple-footer-link text-left">
                  PostgreSQL & pgvector 128D
                </button>
              </li>
              <li>
                <button onClick={() => handleNavModule('redis')} className="apple-footer-link text-left">
                  Redis Write-Behind Önbellek
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Nova Çekirdek & Altyapı */}
          <div className="space-y-2.5">
            <h4 className="apple-footer-col-title flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>Çekirdek & Mimari</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleNavModule('loom')} className="apple-footer-link text-left">
                  Virtual Thread Executor
                </button>
              </li>
              <li>
                <button onClick={() => handleNavModule('redis')} className="apple-footer-link text-left">
                  Redis L2 Cache Mekanizması
                </button>
              </li>
              <li>
                <button onClick={() => handleNavModule('db')} className="apple-footer-link text-left">
                  HikariCP Bağlantı Havuzu
                </button>
              </li>
              <li>
                <button onClick={() => handleNavModule('stream')} className="apple-footer-link text-left">
                  Kafka Asenkron Olay Kuyruğu
                </button>
              </li>
              <li>
                <button onClick={handleNavBlueprint} className="apple-footer-link text-left">
                  Sistem Mimarisi Şeması
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Yapay Zeka & Semantik Arama */}
          <div className="space-y-2.5">
            <h4 className="apple-footer-col-title flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Yapay Zeka Laboratuvarı</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={handleNavAi} className="apple-footer-link text-left">
                  Spring AI Semantik Arama
                </button>
              </li>
              <li>
                <button onClick={handleNavAi} className="apple-footer-link text-left">
                  pgvector HNSW İndeksleme
                </button>
              </li>
              <li>
                <button onClick={handleNavAiLab} className="apple-footer-link text-left">
                  Kosinüs Benzerliği Matrisi
                </button>
              </li>
              <li>
                <button onClick={handleNavAiLab} className="apple-footer-link text-left">
                  1 Dakikalık AI TL;DR Motoru
                </button>
              </li>
              <li>
                <button onClick={handleNavAiLab} className="apple-footer-link text-left">
                  LLM Çoklu Ajan Konsolu
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Topluluk & Yazarlar */}
          <div className="space-y-2.5">
            <h4 className="apple-footer-col-title flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-purple-500" />
              <span>Topluluk & Yazarlar</span>
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
                  Nova Manifestosu
                </button>
              </li>
              <li>
                <button onClick={handleNavFeed} className="apple-footer-link text-left">
                  Kıdemli Yazar Profilleri
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
                  <span>Mühendislik Katkıları</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <button onClick={handleNavBatch} className="apple-footer-link text-left">
                  Batch & ETL Görev Yöneticisi
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: Sistem & Geliştirici */}
          <div className="space-y-2.5">
            <h4 className="apple-footer-col-title flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-500" />
              <span>Sistem & Tanılama</span>
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
                  Activity Monitor Telemetri
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
                  <span>OpenAPI Swagger Dokümantasyonu</span>
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
            <span>Copyright © 2026 Nova Tech Publication Inc. Tüm hakları saklıdır.</span>
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
              <span>🇹🇷 Türkiye (Türkçe)</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
