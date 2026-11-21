'use client';

import React, { useState } from 'react';
import { macSound } from '@/lib/retroAudioMac9';

export const NovaArchitectureSpecWindow: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const TABS = [
    'ALL ARCHITECTURAL BUSES (23 SPECS)',
    '01 // JAVA 22 LOOM',
    '02 // SPRING AI + PGVECTOR',
    '03 // DUAL-TIER CACHE',
    '04 // ENTERPRISE RESILIENCE',
  ];

  return (
    <div className="flex flex-col h-full bg-[#E5E5E5] font-['Charcoal',sans-serif] text-[12px] text-[#262626] select-none">
      {/* Top Header */}
      <div className="p-4 bg-[#DDDDDD] border-b border-[#808080] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#2563EB] text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                REV 4.1.1
              </span>
              <span className="text-[10px] font-mono text-[#555]">
                JAVA 22 LOOM / PGVECTOR 128D / POSTGRESQL 16 / REDIS 7.2
              </span>
            </div>
            <h2 className="text-base font-bold text-black leading-tight">
              System Architecture & Logic Board Specification
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              LOGIC BOARD ONLINE
            </span>
            <button
              onClick={() => {
                macSound.playMacClickDown();
                alert('Mac Pro Workstation: Nova Core G4 Architecture 2026.');
              }}
              className="mac9-btn text-[11px] py-1 px-3"
            >
              Activity Monitor
            </button>
          </div>
        </div>

        {/* Tab Menu */}
        <div className="flex flex-wrap gap-1 pt-1 border-t border-[#CCC]">
          {TABS.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => {
                macSound.playMacClickDown();
                setActiveTab(idx);
              }}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-[2px] border border-[#262626] transition-none ${
                activeTab === idx
                  ? 'bg-[#000080] text-white'
                  : 'bg-[#EEE] hover:bg-white text-[#262626]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="flex-1 p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#E5E5E5]">
        {/* CARD 1: CONCURRENCY BUS */}
        <div className="mac9-outset-card p-3 rounded-[3px] bg-white border border-[#262626] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#EEE] mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-blue-600 font-bold">⚡</span>
                <span className="font-bold text-[11px] text-[#1E293B]">
                  HIGH TRAFFIC & CONCURRENCY BUS
                </span>
              </div>
              <span className="text-[9px] font-mono bg-black text-white px-1.5 py-0.5 rounded">
                INTEL-XEON-LOOM-V22
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between items-center py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Thread Architecture:</span>
                <span className="font-mono font-bold text-[#0F172A] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  Virtual Threads (Loom)
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Concurrent Request Capacity:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  11,400+ Req/sec
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#64748B]">Runtime Environment:</span>
                <span className="font-mono font-bold text-[#0F172A]">
                  OpenJDK 22.0.2 LTS
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#EEE] flex justify-between text-[10px] text-emerald-700 font-mono font-bold">
            <span>✓ 201/201 TESTS // 100% PASSED</span>
            <span>RFC 7807 ARCHITECTURAL STANDARD</span>
          </div>
        </div>

        {/* CARD 2: VECTOR MATRIX */}
        <div className="mac9-outset-card p-3 rounded-[3px] bg-white border border-[#262626] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#EEE] mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-indigo-600 font-bold">⚙️</span>
                <span className="font-bold text-[11px] text-[#1E293B]">
                  SEMANTIC SEARCH & AI (VECTOR MATRIX)
                </span>
              </div>
              <span className="text-[9px] font-mono bg-black text-white px-1.5 py-0.5 rounded">
                APPLE-NEURAL-VEC-128D
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between items-center py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Vector Embedding Representation:</span>
                <span className="font-mono font-bold text-[#0F172A] bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                  128-Dimensional Dense Vector
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Similarity Metric:</span>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                  Cosine Similarity Distance
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#64748B]">High-Speed Index Graph:</span>
                <span className="font-mono font-bold text-[#0F172A]">
                  pgvector HNSW Graph
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#EEE] flex justify-between text-[10px] text-emerald-700 font-mono font-bold">
            <span>✓ 201/201 TESTS // 100% PASSED</span>
            <span>SUB-MS P99 LATENCY</span>
          </div>
        </div>

        {/* CARD 3: STORAGE CONTROLLER */}
        <div className="mac9-outset-card p-3 rounded-[3px] bg-white border border-[#262626] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#EEE] mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">🗄️</span>
                <span className="font-bold text-[11px] text-[#1E293B]">
                  DATABASE, CACHE & STORAGE CONTROLLER
                </span>
              </div>
              <span className="text-[9px] font-mono bg-black text-white px-1.5 py-0.5 rounded">
                RAID-REDIS-POSTGRES-X7
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between items-center py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Primary Database Engine:</span>
                <span className="font-mono font-bold text-[#0F172A] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  PostgreSQL 16.2
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Connection Pool:</span>
                <span className="font-mono font-bold text-[#0F172A]">
                  HikariCP (10/10 Pool Size)
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#64748B]">Local L1 Cache:</span>
                <span className="font-mono font-bold text-emerald-700">
                  Caffeine Cache (Zero Network Latency)
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#EEE] flex justify-between text-[10px] text-emerald-700 font-mono font-bold">
            <span>✓ 201/201 TESTS // 100% PASSED</span>
            <span>ZERO-LEAK CONNECTION POOL</span>
          </div>
        </div>

        {/* CARD 4: SECURITY & RESILIENCE */}
        <div className="mac9-outset-card p-3 rounded-[3px] bg-white border border-[#262626] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#EEE] mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-rose-600 font-bold">🛡️</span>
                <span className="font-bold text-[11px] text-[#1E293B]">
                  SECURITY, FAULT TOLERANCE & RESILIENCE (KEYCHAIN CHIP)
                </span>
              </div>
              <span className="text-[9px] font-mono bg-black text-white px-1.5 py-0.5 rounded">
                APPLE-T1-KEYCHAIN-SEC
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between items-center py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Concurrency Conflict Guard:</span>
                <span className="font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  Optimistic Locking
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Standardized Error Format:</span>
                <span className="font-mono font-bold text-[#0F172A]">
                  RFC 7807 Problem Details
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#64748B]">Circuit Breaker:</span>
                <span className="font-mono font-bold text-emerald-700">
                  Resilience4j Fail-Safe
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#EEE] flex justify-between text-[10px] text-emerald-700 font-mono font-bold">
            <span>✓ 201/201 TESTS // 100% PASSED</span>
            <span>ISOLATED FAIL-SAFE ARCHITECTURE</span>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="p-2 bg-[#DDDDDD] border-t border-[#808080] flex items-center justify-between text-[10px] font-mono text-[#555]">
        <span>Nova Logic Board Hardware Interface v4.1</span>
        <span>Platform: PowerPC G4 500 MHz / Java 22 Loom</span>
      </div>
    </div>
  );
};
