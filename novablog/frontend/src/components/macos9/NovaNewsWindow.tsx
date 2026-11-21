'use client';

import React, { useState } from 'react';
import { macSound } from '@/lib/retroAudioMac9';

interface NovaNewsWindowProps {
  onOpenArticleInBlog?: (articleId?: string) => void;
}

interface NewsItem {
  id: string;
  category: 'frontend' | 'backend' | 'ai' | 'architecture';
  categoryLabel: string;
  badge: string;
  title: string;
  author: string;
  date: string;
  summary: string;
  verdict: string;
  tags: string[];
}

const NEWS_DATA: NewsItem[] = [
  {
    id: 'react-19',
    category: 'frontend',
    categoryLabel: 'FRONTEND CORE',
    badge: 'BREAKING',
    title: 'React 19 Release: useActionState, useOptimistic & Automatic Memoization',
    author: 'Caner Aydin',
    date: 'Nov 19, 2026',
    summary:
      'Meta React core team released the general availability release of React 19. The compiler and asynchronous form actions are now standardized.',
    verdict:
      'Zero-latency tactile user interactions for likes, claps, and bookmarks in NovaBlog via useOptimistic; manual useMemo declarations deprecated.',
    tags: ['REACT & MODERN FRONTEND', '#REACT-19', '#ACTIONS', '#OPTIMISTIC'],
  },
  {
    id: 'anthropic-mcp',
    category: 'ai',
    categoryLabel: 'AGENT PROTOCOLS & MCP',
    badge: 'BREAKING',
    title: 'Anthropic Model Context Protocol (MCP) Open Standard Adoption',
    author: 'Dr. Selin Demir',
    date: 'Nov 20, 2026',
    summary:
      'Anthropic open-sourced the bidirectional Model Context Protocol standard connecting AI agents with real-world datasources (databases, IDEs, filesystems, and GitHub).',
    verdict:
      'Unified standard established for integrating microservices and PostgreSQL pgvector with autonomous agents; eliminates custom wrapper bloat.',
    tags: ['ARTIFICIAL INTELLIGENCE', '#MCP', '#ANTHROPIC', '#LLM-INTEGRATION'],
  },
  {
    id: 'java-23-amber',
    category: 'backend',
    categoryLabel: 'JAVA EVOLUTION & AMBER',
    badge: 'BREAKING',
    title: 'Java 23 & Project Amber: Pattern Matching in Primitives & Stream Gatherers',
    author: 'Abdullah Berke Ozder',
    date: 'Nov 20, 2026',
    summary:
      'Oracle Java Platform Group announced Java 23 general availability. Project Amber brings primitive type switch pattern matching and custom intermediate Stream gatherers.',
    verdict:
      'Eliminated heap allocations and boxing-unboxing overhead in Spring Boot telemetry transforms; increased pipeline throughput by 28%.',
    tags: ['JAVA & SPRING CORE', '#JAVA-23', '#VIRTUAL-THREADS', '#AMBER'],
  },
  {
    id: 'loom-concurrency',
    category: 'architecture',
    categoryLabel: 'ARCHITECTURE BENCHMARK',
    badge: 'ANALYSIS',
    title: 'Spring Boot 4.1.1 & Virtual Threads: 10,000+ Concurrent Requests Benchmark',
    author: 'Nova Systems Team',
    date: 'Nov 21, 2026',
    summary:
      'Stress test using Tomcat with dedicated virtual threads per request alongside PostgreSQL pgvector and Redis Write-Behind buffer clocked 11,400+ req/sec.',
    verdict:
      'Eliminated platform thread pool starvation completely; achieved enterprise-grade high throughput with sub-millisecond P99 latency.',
    tags: ['SYSTEM ARCHITECTURE', '#LOOM', '#CONCURRENCY', '#REDIS'],
  },
];

export const NovaNewsWindow: React.FC<NovaNewsWindowProps> = ({ onOpenArticleInBlog }) => {
  const [activeChannel, setActiveChannel] = useState<'all' | 'frontend' | 'backend' | 'ai'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNews = NEWS_DATA.filter((item) => {
    const matchesChannel = activeChannel === 'all' || item.category === activeChannel;
    const matchesQuery =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesChannel && matchesQuery;
  });

  return (
    <div className="flex flex-col h-full bg-[#CCCCCC] select-none text-[12px] text-[#262626] font-['Charcoal',sans-serif]">
      {/* Sherlock 2 Channels Bar */}
      <div className="p-2 bg-[#DDDDDD] border-b border-[#808080] flex flex-wrap items-center justify-between gap-2 shadow-sm">
        {/* Channels */}
        <div className="flex items-center gap-1">
          {[
            { id: 'all' as const, label: '✦ All Bulletins' },
            { id: 'frontend' as const, label: 'Frontend & React' },
            { id: 'backend' as const, label: 'Java & Loom' },
            { id: 'ai' as const, label: 'AI & MCP' },
          ].map((ch) => (
            <button
              key={ch.id}
              onClick={() => {
                macSound.playMacClickDown();
                setActiveChannel(ch.id);
              }}
              className={`px-2.5 py-1 text-[11px] rounded-[2px] border border-[#262626] transition-none ${
                activeChannel === ch.id
                  ? 'bg-[#000080] text-white font-bold'
                  : 'bg-[#EEEEEE] hover:bg-white text-[#262626] shadow-[inset_1px_1px_0_#FFF]'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>

        {/* Sherlock Search Input */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search news with Sherlock..."
            className="mac9-cursor-text w-48 sm:w-56 h-[22px] px-2 text-[11px] border border-[#262626] bg-white text-[#262626] shadow-inner rounded-[2px] outline-none placeholder:text-[#888]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-1 text-[10px] text-[#666] hover:text-black px-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Bulletins List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#E5E5E5]">
        {filteredNews.length === 0 ? (
          <div className="text-center py-12 text-[#666]">
            <p className="font-bold">No matching articles found.</p>
            <p className="text-[11px] mt-1">Try a different search term or channel.</p>
          </div>
        ) : (
          filteredNews.map((news) => (
            <div
              key={news.id}
              className="mac9-outset-card p-3 rounded-[3px] bg-[#FFFFFF] border border-[#262626] shadow-[2px_2px_0_rgba(0,0,0,0.15)] flex flex-col gap-2 hover:border-[#000080] transition-colors"
            >
              {/* Meta Row */}
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="bg-[#FFE5B4] text-[#B85D00] border border-[#CCA066] px-1.5 py-0.2 rounded font-bold font-mono text-[10px]">
                    ⚡ {news.badge}
                  </span>
                  <span className="font-mono text-[#555] font-semibold text-[10px]">
                    {news.categoryLabel}
                  </span>
                </div>
                <div className="text-[#666] font-mono text-[10px]">
                  {news.author} • {news.date}
                </div>
              </div>

              {/* Title */}
              <h3 className="font-bold text-[14px] text-black leading-snug">
                {news.title}
              </h3>

              {/* Summary */}
              <p className="text-[12px] text-[#444] leading-relaxed">
                {news.summary}
              </p>

              {/* Engineering Verdict Box */}
              <div className="bg-[#F0F5FF] border-l-2 border-[#000080] p-2 text-[11px] text-[#1E3A8A] rounded-[2px] italic">
                <span className="font-bold not-italic block mb-0.5 font-mono text-[10px]">
                  🔹 ENGINEERING VERDICT:
                </span>
                &quot;{news.verdict}&quot;
              </div>

              {/* Tags & Action Button */}
              <div className="flex flex-wrap items-center justify-between pt-1 border-t border-[#DDD] gap-2">
                <div className="flex flex-wrap gap-1">
                  {news.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-1.5 py-0.5 bg-[#EEE] text-[#555] border border-[#CCC] rounded-[2px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => {
                    macSound.playMacClickUp();
                    onOpenArticleInBlog?.(news.id);
                  }}
                  className="mac9-btn mac9-btn-default text-[11px] py-1 px-3 ml-auto"
                >
                  Read in Blog ➔
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Status Bar */}
      <div className="px-3 py-1 bg-[#DDDDDD] border-t border-[#808080] text-[10px] font-mono text-[#555] flex justify-between">
        <span>{filteredNews.length} articles indexed</span>
        <span>Sherlock 2 News Engine v9.2</span>
      </div>
    </div>
  );
};
