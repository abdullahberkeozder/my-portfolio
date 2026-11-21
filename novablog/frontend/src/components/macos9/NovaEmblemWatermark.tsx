'use client';

import React from 'react';

export const NovaEmblemWatermark: React.FC = () => {
  return (
    <div className="pointer-events-none select-none flex flex-col items-center justify-center text-center opacity-75">
      {/* 3D Kabartmalı Nova Rozeti */}
      <div className="relative p-6 rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.06)] backdrop-blur-[2px] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.25),inset_-1px_-1px_2px_rgba(0,0,0,0.35),0_4px_12px_rgba(0,0,0,0.2)]">
        {/* Nova Yıldız İkonu */}
        <div className="flex items-center justify-center mb-2">
          <svg className="w-12 h-12 text-[#EEEEEE] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="rgba(255,255,255,0.15)" />
          </svg>
        </div>

        {/* Tipografi */}
        <h1 className="font-['Charcoal',sans-serif] tracking-[0.25em] text-[20px] font-bold text-[#FFFFFF] drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)] uppercase">
          ✦ N O V A ✦
        </h1>
        <p className="font-['Geneva',sans-serif] text-[11px] tracking-widest text-[#E0E0FF] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] mt-1">
          Modern Mühendislik & Sistem Mimarisi
        </p>
        <div className="mt-2.5 pt-2 border-t border-[rgba(255,255,255,0.15)] flex items-center justify-center gap-2">
          <span className="text-[10px] font-mono text-[#D4D4FF] tracking-wider uppercase opacity-80">
            Mac OS 9.2.2 Web Desktop Edition
          </span>
        </div>
      </div>
    </div>
  );
};
