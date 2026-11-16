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
  const trackWidth = isCompact ? 'w-[52px]' : 'w-[58px]';
  const trackHeight = isCompact ? 'h-[26px]' : 'h-[28px]';
  const thumbSize = isCompact ? 'w-[20px] h-[20px]' : 'w-[22px] h-[22px]';
  const thumbTranslate = isCompact
    ? isDark
      ? 'translate-x-[28px]'
      : 'translate-x-[2px]'
    : isDark
    ? 'translate-x-[32px]'
    : 'translate-x-[3px]';

  return (
    <button
      type="button"
      onClick={(e) => toggleTheme(e)}
      aria-label={isDark ? 'Gündüz moduna geç' : 'Gece moduna geç'}
      title={
        isDark
          ? 'Gündüz Moduna Geç (Mac OS X Day Horizon)'
          : 'Gece Moduna Geç (Mac OS X Night Sky)'
      }
      className={`group relative inline-flex items-center ${trackWidth} ${trackHeight} rounded-full cursor-pointer select-none overflow-hidden transition-shadow duration-300 ${
        isDark
          ? 'border border-white/20 shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.9),0_0_8px_rgba(255,255,255,0.2)]'
          : 'border border-black/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.35),0_1px_0_rgba(255,255,255,0.6)] hover:shadow-[inset_0_2px_5px_rgba(0,0,0,0.4),0_0_8px_rgba(59,130,246,0.3)]'
      } ${className}`}
    >
      {/* 1. Daylight Horizon Layer (Smooth Cross-fade) */}
      <div
        className={`absolute inset-0 bg-gradient-to-b from-[#4a97f8] via-[#63a7fb] to-[#99c8fc] transition-opacity duration-500 ease-in-out ${
          isDark ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Soft Daytime Puffy Clouds */}
        <div className="relative w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-1.5 right-2 flex items-center gap-0.5 opacity-90 transition-transform duration-500 group-hover:scale-105">
            <span className="w-2.5 h-2.5 rounded-full bg-white/80 shadow-[0_1px_2px_rgba(0,0,0,0.1)]" />
            <span className="w-3.5 h-3.5 rounded-full bg-white/95 -ml-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.1)]" />
            <span className="w-2 h-2 rounded-full bg-white/80 -ml-1" />
          </div>
        </div>
      </div>

      {/* 2. Midnight Deep Space Layer (Smooth Cross-fade) */}
      <div
        className={`absolute inset-0 bg-gradient-to-b from-[#0a0d16] via-[#121626] to-[#1a2035] transition-opacity duration-500 ease-in-out ${
          isDark ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Twinkling Skeuomorphic Stars */}
        <div className="relative w-full h-full pointer-events-none">
          <span className="absolute top-1.5 left-2 w-1 h-1 rounded-full bg-white opacity-90 shadow-[0_0_3px_#ffffff] animate-pulse" />
          <span className="absolute top-3.5 left-4 w-0.5 h-0.5 rounded-full bg-blue-100 opacity-75" />
          <span className="absolute bottom-1.5 left-2.5 w-0.5 h-0.5 rounded-full bg-amber-200 opacity-90 shadow-[0_0_2px_#fde047]" />
        </div>
      </div>

      {/* 3. 3D Skeuomorphic Celestial Thumb (Sun / Moon) */}
      <div
        className={`relative z-10 ${thumbSize} rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${thumbTranslate} ${
          isDark
            ? 'bg-radial from-[#ffffff] via-[#cbd5e1] to-[#64748b] border border-white/40 shadow-[0_2px_5px_rgba(0,0,0,0.7),0_0_6px_rgba(203,213,225,0.4),inset_0_1px_0_rgba(255,255,255,0.8)]'
            : 'bg-radial from-[#fffdf0] via-[#fde047] to-[#d97706] border border-amber-300 shadow-[0_2px_5px_rgba(0,0,0,0.35),0_0_7px_rgba(253,224,71,0.6),inset_0_1px_0_rgba(255,255,255,0.95)]'
        }`}
      >
        {/* Sun Icon with Smooth Rotation & Fade */}
        <Sun
          className={`w-2.5 h-2.5 text-amber-950 transition-all duration-500 absolute ${
            isDark
              ? 'opacity-0 scale-50 rotate-90'
              : 'opacity-100 scale-100 rotate-0 group-hover:rotate-45'
          }`}
        />

        {/* Moon Icon with Smooth Rotation & Fade */}
        <Moon
          className={`w-2.5 h-2.5 text-zinc-800 transition-all duration-500 absolute ${
            isDark
              ? 'opacity-100 scale-100 -rotate-12 group-hover:rotate-0'
              : 'opacity-0 scale-50 -rotate-90'
          }`}
        />
      </div>
    </button>
  );
};
