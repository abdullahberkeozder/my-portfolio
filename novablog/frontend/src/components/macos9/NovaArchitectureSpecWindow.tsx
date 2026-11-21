'use client';

import React, { useState } from 'react';
import { macSound } from '@/lib/retroAudioMac9';

export const NovaArchitectureSpecWindow: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const TABS = [
    'TÜM MİMARİ VERİ YOLU (23 SPESİFİKASYON)',
    '01 // JAVA 22 LOOM',
    '02 // SPRING AI + PGVECTOR',
    '03 // DUAL-TIER CACHE',
    '04 // ENTERPRISE RESILIENCE',
  ];

  return (
    <div className="flex flex-col h-full bg-[#E5E5E5] font-['Charcoal',sans-serif] text-[12px] text-[#262626] select-none">
      {/* Üst Bilgi Başlığı */}
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
              Sistem Mimarisi ve Donanımsal Mantık Kartı Şartnamesi
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

        {/* Tab Menüsü */}
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

      {/* Kartlar Izgarası */}
      <div className="flex-1 p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#E5E5E5]">
        {/* KART 1: CONCURRENCY BUS */}
        <div className="mac9-outset-card p-3 rounded-[3px] bg-white border border-[#262626] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#EEE] mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-blue-600 font-bold">⚡</span>
                <span className="font-bold text-[11px] text-[#1E293B]">
                  YÜKSEK TRAFİK & EŞZAMANLILIK (CONCURRENCY BUS)
                </span>
              </div>
              <span className="text-[9px] font-mono bg-black text-white px-1.5 py-0.5 rounded">
                INTEL-XEON-LOOM-V22
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between items-center py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">İş Parçacığı Mimarisi:</span>
                <span className="font-mono font-bold text-[#0F172A] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  Virtual Threads (Loom)
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Eşzamanlı İstek Kapasitesi:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  11,400+ İstek/sn
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#64748B]">Çalışma Zamanı (Runtime):</span>
                <span className="font-mono font-bold text-[#0F172A]">
                  OpenJDK 22.0.2 LTS
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#EEE] flex justify-between text-[10px] text-emerald-700 font-mono font-bold">
            <span>✓ 201/201 TEST // %100 GEÇTİ</span>
            <span>RFC 7807 MİMARİ STANDARDI</span>
          </div>
        </div>

        {/* KART 2: VECTOR MATRIX */}
        <div className="mac9-outset-card p-3 rounded-[3px] bg-white border border-[#262626] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#EEE] mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-indigo-600 font-bold">⚙️</span>
                <span className="font-bold text-[11px] text-[#1E293B]">
                  ANLAMSAL ARAMA & YAPAY ZEKA (VECTOR MATRIX)
                </span>
              </div>
              <span className="text-[9px] font-mono bg-black text-white px-1.5 py-0.5 rounded">
                APPLE-NEURAL-VEC-128D
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between items-center py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Anlamsal Vektör Temsili:</span>
                <span className="font-mono font-bold text-[#0F172A] bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                  128-Boyutlu Yoğun Vektör
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Benzerlik Algoritması:</span>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                  Kosinüs Benzerliği (Cosine)
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#64748B]">Hızlı İndeksleme Grafiği:</span>
                <span className="font-mono font-bold text-[#0F172A]">
                  pgvector HNSW Graph
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#EEE] flex justify-between text-[10px] text-emerald-700 font-mono font-bold">
            <span>✓ 201/201 TEST // %100 GEÇTİ</span>
            <span>SUB-MS P99 LATENCY</span>
          </div>
        </div>

        {/* KART 3: STORAGE CONTROLLER */}
        <div className="mac9-outset-card p-3 rounded-[3px] bg-white border border-[#262626] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#EEE] mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">🗄️</span>
                <span className="font-bold text-[11px] text-[#1E293B]">
                  VERİTABANI, ÖNBELLEK & DEPOLAMA (STORAGE CONTROLLER)
                </span>
              </div>
              <span className="text-[9px] font-mono bg-black text-white px-1.5 py-0.5 rounded">
                RAID-REDIS-POSTGRES-X7
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between items-center py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Ana Veritabanı:</span>
                <span className="font-mono font-bold text-[#0F172A] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  PostgreSQL 16.2
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Bağlantı Havuzu:</span>
                <span className="font-mono font-bold text-[#0F172A]">
                  HikariCP (10/10 Havuz)
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#64748B]">Yerel L1 Önüellek:</span>
                <span className="font-mono font-bold text-emerald-700">
                  Caffeine Cache (Sıfır Ağ Gecikmesi)
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#EEE] flex justify-between text-[10px] text-emerald-700 font-mono font-bold">
            <span>✓ 201/201 TEST // %100 GEÇTİ</span>
            <span>ZERO-LEAK CONNECTION POOL</span>
          </div>
        </div>

        {/* KART 4: SECURITY & RESILIENCE */}
        <div className="mac9-outset-card p-3 rounded-[3px] bg-white border border-[#262626] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#EEE] mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-rose-600 font-bold">🛡️</span>
                <span className="font-bold text-[11px] text-[#1E293B]">
                  GÜVENLİK, HATA YÖNETİMİ & DAYANIKLILIK (KEYCHAIN CHIP)
                </span>
              </div>
              <span className="text-[9px] font-mono bg-black text-white px-1.5 py-0.5 rounded">
                APPLE-T1-KEYCHAIN-SEC
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between items-center py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Veri Çakışma Koruması:</span>
                <span className="font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  İyimser Kilitleme (Optimistic)
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Standart Hata Formatı:</span>
                <span className="font-mono font-bold text-[#0F172A]">
                  RFC 7807 Problem Details
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#64748B]">Devre Kesici (Circuit Breaker):</span>
                <span className="font-mono font-bold text-emerald-700">
                  Resilience4j Fail-Safe
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#EEE] flex justify-between text-[10px] text-emerald-700 font-mono font-bold">
            <span>✓ 201/201 TEST // %100 GEÇTİ</span>
            <span>ISOLATED FAIL-SAFE ARCHITECTURE</span>
          </div>
        </div>
      </div>

      {/* Alt Durum Çubuğu */}
      <div className="p-2 bg-[#DDDDDD] border-t border-[#808080] flex items-center justify-between text-[10px] font-mono text-[#555]">
        <span>Nova Logic Board Hardware Interface v4.1</span>
        <span>Platform: PowerPC G4 500 MHz / Java 22 Loom</span>
      </div>
    </div>
  );
};
