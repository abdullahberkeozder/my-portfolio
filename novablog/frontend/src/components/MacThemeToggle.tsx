'use client';

import React from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { Sun, Moon } from 'lucide-react';

interface MacThemeToggleProps {
  className?: string;
  size?: 'default' | 'compact';
}

export const MacThemeToggle: React.FC<MacThemeToggleProps> = ({
  className = '',
  size = 'default',
}) => {
  const { isDark, toggleTheme } = useTheme();

  const isCompact = size === 'compact';
  const trackWidth = isCompact ? 'w-[52px]' : 'w-[60px]';
  const trackHeight = isCompact ? 'h-[26px]' : 'h-[30px]';
  const thumbSize = isCompact ? 'w-[20px] h-[20px]' : 'w-[24px] h-[24px]';
  const thumbTranslate = isCompact
    ? isDark ? 'translate-x-[29px]' : 'translate-x-[3px]'
    : isDark ? 'translate-x-[33px]' : 'translate-x-[3px]';

  return (
    <button
      type="button"
      onClick={(e) => toggleTheme(e)}
      aria-label={isDark ? 'Switch to day mode' : 'Switch to night mode'}
      title={isDark ? 'Switch to Day Mode (Mac OS X Day Horizon)' : 'Switch to Night Mode (Mac OS X Night Sky)'}
      className={`group relative inline-flex items-center justify-center min-w-[44px] min-h-[44px] p-1 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900 rounded-full transition-transform active:scale-95 ${className}`}
    >
      <div
        className={`relative inline-flex items-center ${trackWidth} ${trackHeight} rounded-full overflow-hidden transition-all duration-300 ${
          isDark
            ? 'border border-white/20 shadow-[inset_0_2px_5px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.18)] hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.95),0_0_10px_rgba(255,255,255,0.25)]'
            : 'border border-black/25 shadow-[inset_0_2px_5px_rgba(0,0,0,0.45),0_1px_0_rgba(255,255,255,0.7)] hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.55),0_0_10px_rgba(59,130,246,0.35)]'
        }`}
      >
        {/* 1. Daylight Horizon Layer */}
        <div
          className={`absolute inset-0 bg-gradient-to-b from-[#2d87f5] via-[#5ea5ff] to-[#9eccff] transition-opacity duration-500 ease-in-out ${
            isDark ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* Daytime Fluffy Cumulus Clouds */}
          <div className="relative w-full h-full pointer-events-none overflow-hidden">
            <div className="absolute top-1.5 right-2 flex items-center gap-0.5 opacity-90 transition-transform duration-500 group-hover:scale-105">
              <span className="w-2.5 h-2.5 rounded-full bg-white/85 shadow-[0_1px_2px_rgba(0,0,0,0.15)]" />
              <span className="w-3.5 h-3.5 rounded-full bg-white/95 -ml-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.15)]" />
              <span className="w-2 h-2 rounded-full bg-white/80 -ml-1" />
            </div>
          </div>
        </div>

        {/* 2. Midnight Deep Space Layer */}
        <div
          className={`absolute inset-0 bg-gradient-to-b from-[#070b16] via-[#0e1426] to-[#18213a] transition-opacity duration-500 ease-in-out ${
            isDark ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Twinkling Skeuomorphic Stars */}
          <div className="relative w-full h-full pointer-events-none">
            <span className="absolute top-1.5 left-2 w-1 h-1 rounded-full bg-white opacity-95 shadow-[0_0_3px_#ffffff] animate-pulse" />
            <span className="absolute top-3.5 left-4 w-0.5 h-0.5 rounded-full bg-blue-200 opacity-80" />
            <span className="absolute bottom-1.5 left-2.5 w-0.5 h-0.5 rounded-full bg-amber-200 opacity-95 shadow-[0_0_2px_#fde047]" />
          </div>
        </div>

        {/* 3. 3D Celestial Spherical Thumb (Sun / Moon) */}
        <div
          className={`relative z-10 ${thumbSize} rounded-full flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.34,1.35,0.64,1)] ${thumbTranslate} ${
            isDark
              ? 'bg-gradient-to-b from-[#ffffff] via-[#cbd5e1] to-[#64748b] border border-slate-300 shadow-[0_2px_6px_rgba(0,0,0,0.7),0_0_8px_rgba(148,163,184,0.45),inset_0_1px_0_#ffffff]'
              : 'bg-gradient-to-b from-[#fffbe8] via-[#fbbf24] to-[#d97706] border border-amber-400 shadow-[0_2px_6px_rgba(0,0,0,0.35),0_0_10px_rgba(251,191,36,0.65),inset_0_1px_0_#ffffff]'
          }`}
        >
          <Sun
            className={`w-3 h-3 text-amber-950 transition-all duration-500 absolute ${
              isDark ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0 group-hover:rotate-45'
            }`}
          />
          <Moon
            className={`w-3 h-3 text-zinc-900 transition-all duration-500 absolute ${
              isDark ? 'opacity-100 scale-100 -rotate-12 group-hover:rotate-0' : 'opacity-0 scale-50 -rotate-90'
            }`}
          />
        </div>
      </div>
    </button>
  );
};
