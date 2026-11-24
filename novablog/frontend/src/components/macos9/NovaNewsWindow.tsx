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
    id: 'java-24-scoped-values',
    category: 'backend',
    categoryLabel: 'JAVA & RUNTIME CORE',
    badge: 'DISPATCH',
    title: 'Java 24 Early Access: Scoped Values and Structured Concurrency Nearing Finalization',
    author: 'Abdullah Berke Ozder',
    date: 'Nov 24, 2026',
    summary:
      'OpenJDK benchmarks confirm JEP 480 Scoped Values reduce per-virtual-thread memory allocations by 60% while accelerating context switching by 4x. Deprecation of legacy ThreadLocal has officially begun.',
    verdict:
      'Spring Boot 4 core completely eliminates thread-local memory leak hazards; cross-cutting security context propagation drops to sub-nanosecond scale.',
    tags: ['JAVA CORE', '#JAVA-24', '#SCOPED-VALUES', '#VIRTUAL-THREADS'],
  },
  {
    id: 'mcp-2-standard',
    category: 'ai',
    categoryLabel: 'AGENT PROTOCOLS & MCP',
    badge: 'STANDARDS',
    title: 'Open Standard Victory: Anthropic and Linux Foundation Ratify Model Context Protocol (MCP) 2.0',
    author: 'Dr. Selin Demir',
    date: 'Nov 23, 2026',
    summary:
      'Updated with gRPC multiplexing, Zero-Knowledge cryptographic authentication, and asynchronous streaming, MCP 2.0 is ratified as the global industry standard for agentic tool execution.',
    verdict:
      'PostgreSQL pgvector and enterprise microservices now connect to autonomous agents directly with zero bespoke wrapper bloat.',
    tags: ['ARTIFICIAL INTELLIGENCE', '#MCP-2', '#ANTHROPIC', '#STANDARDS'],
  },
  {
    id: 'pgvector-08-binary-quant',
    category: 'ai',
    categoryLabel: 'VECTOR INFRASTRUCTURE',
    badge: 'BREAKING',
    title: 'PostgreSQL pgvector 0.8.0 Released: 1-Bit Binary Quantization Cuts HNSW Memory Footprint by 75%',
    author: 'Dr. Selin Demir',
    date: 'Nov 22, 2026',
    summary:
      '1-bit binary vector quantization merges into the official pgvector repository. Scanning 128D and 1536D embeddings via Hamming distance slashes RAM requirements by 32x while preserving 98%+ Recall@K.',
    verdict:
      'Large-scale enterprise semantic search clusters run on standard commodity hardware without dedicated high-memory instances.',
    tags: ['DATABASE & VECTOR', '#PGVECTOR', '#HNSW', '#QUANTIZATION'],
  },
  {
    id: 'turbopack-v16-rolldown',
    category: 'frontend',
    categoryLabel: 'COMPILERS & BUILD TOOLS',
    badge: 'BENCHMARK',
    title: 'New Era in Bundlers: Turbopack v16 Reaches Stability, Rolldown Hits 10ms HMR Threshold',
    author: 'Caner Aydin',
    date: 'Nov 21, 2026',
    summary:
      'Webpack and Babel are officially deprecated. Rust-powered Turbopack v16 and Rolldown leverage memory-mapped files and multi-core parallelism to slash cold build times on 100,000-module monorepos down to 850ms.',
    verdict:
      'Enterprise monorepo CI/CD build duration dropped by 75%; developer HMR latency is imperceptible.',
    tags: ['FRONTEND CORE', '#TURBOPACK', '#RUST', '#ROLLDOWN', '#COMPILERS'],
  },
  {
    id: 'vmware-license-fallout',
    category: 'architecture',
    categoryLabel: 'ENTERPRISE STRATEGY',
    badge: 'ANALYSIS',
    title: 'Post-Broadcom VMware Licensing Crisis: Enterprise Migration to Kubernetes KubeVirt and KVM Accelerates',
    author: 'Abdullah Berke Ozder',
    date: 'Nov 20, 2026',
    summary:
      'Following the elimination of perpetual licensing and forced subscription price hikes of 300%+, Fortune 500 infrastructure teams are shifting hypervisors directly onto Kubernetes KubeVirt and native KVM.',
    verdict:
      'Bare-metal container platforms have become the primary hedge against aggressive enterprise vendor lock-in.',
    tags: ['CLOUD STRATEGY', '#VMWARE', '#KUBERNETES', '#KUBEVIRT', '#FINOPS'],
  },
  {
    id: 'cdn-outage-postmortem',
    category: 'architecture',
    categoryLabel: 'SRE FORENSIC AUTOPSY',
    badge: 'POST-MORTEM',
    title: 'Post-Mortem: Global CDN Outage Traced to Catastrophic Regex Backtracking and Cascading Health Check Failures',
    author: 'Caner Aydin',
    date: 'Nov 19, 2026',
    summary:
      'A faulty WAF regex rule caused 100% CPU lockups across edge clusters, causing load balancers to mark all healthy origin servers as offline and triggering a cascading global outage.',
    verdict:
      'Demonstrates the critical necessity of strict regex execution timeouts, canary stage deployments, and automated circuit breaking in edge infrastructure.',
    tags: ['SRE & RELIABILITY', '#POST-MORTEM', '#CASCADING-FAILURE', '#WAF'],
  },
  {
    id: 'platinum-renaissance',
    category: 'frontend',
    categoryLabel: 'HUMAN INTERFACE DESIGN',
    badge: 'TRENDS',
    title: "Design Systems 'Platinum Renaissance': The Return of Mac OS 9 Bevels Against Flat Design Fatigue",
    author: 'Abdullah Berke Ozder',
    date: 'Nov 18, 2026',
    summary:
      "Independent software communities are reviving Apple's 1999 Platinum HIG guidelines, re-introducing 45-degree 1px highlights, chiseled insets, and tactile affordances over indistinct flat UI cards.",
    verdict:
      'Usability benchmarks show a 34% increase in task completion speed and 50% fewer misclicks on tactile, bevelled interfaces.',
    tags: ['ERGONOMICS', '#MAC-OS-9', '#PLATINUM-HIG', '#SKEUOMORPHISM', '#UI-DESIGN'],
  },
  {
    id: 'next-cube-history',
    category: 'backend',
    categoryLabel: 'COMPUTING HISTORY',
    badge: 'HISTORY',
    title: 'This Day in Computing History: Steve Jobs Unveils the NeXT Computer — The Genesis of Modern Software Architecture',
    author: 'Abdullah Berke Ozder',
    date: 'Nov 17, 2026',
    summary:
      "Anniversary of the magnesium NeXT Cube workstation, where Tim Berners-Lee authored the original World Wide Web. NeXTSTEP's dynamic Objective-C messaging and Interface Builder laid the architectural foundation for modern Spring IoC and declarative UI frameworks.",
    verdict:
      "Yesterday's object-oriented microkernel experiments continue to govern today's distributed container paradigms.",
    tags: ['COMPUTING HISTORY', '#NEXTSTEP', '#STEVE-JOBS', '#OBJECT-ORIENTED'],
  },
];

export const NovaNewsWindow: React.FC<NovaNewsWindowProps> = ({ onOpenArticleInBlog }) => {
  const [activeChannel, setActiveChannel] = useState<'all' | 'frontend' | 'backend' | 'ai' | 'architecture'>('all');
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
            { id: 'frontend' as const, label: 'Frontend' },
            { id: 'backend' as const, label: 'Java & Loom' },
            { id: 'ai' as const, label: 'AI & MCP' },
            { id: 'architecture' as const, label: 'Architecture & SRE' },
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
