'use client';

import React from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export const LiquidThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={(e) => toggleTheme(e)}
      type="button"
      aria-label="Gece/Gündüz Modunu Değiştir"
      title={isDark ? 'Gündüz Moduna Geç (Kaolti Circular Wipe)' : 'Gece Moduna Geç (Ride Also Dark Mode)'}
      className="group relative inline-flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full glass-liquid hover:border-[var(--color-volt)]/50 transition-all duration-300 cursor-pointer shadow-sm active:scale-95"
    >
      {/* Specular Edge Highlight Overlay */}
      <span className="absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

      {/* Interactive Morphing Knob */}
      <div className="relative w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 bg-black/40 dark:bg-zinc-900 border border-white/10 dark:border-white/15 shadow-inner">
        {/* Glow Halo */}
        <span
          className={`absolute inset-0 rounded-full blur-[6px] opacity-75 transition-opacity ${
            isDark ? 'bg-indigo-500/40' : 'bg-[#d4f933]/50'
          }`}
        />

        {/* Morphing Sun/Moon Icon */}
        <div className="relative z-10 transition-transform duration-500 ease-out">
          {isDark ? (
            <Moon className="w-3.5 h-3.5 text-indigo-300 transform -rotate-12 transition-transform group-hover:rotate-0" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-[#a3c900] dark:text-[#d4f933] transform rotate-0 transition-transform group-hover:rotate-45" />
          )}
        </div>
      </div>

      {/* Tactical HUD Readout */}
      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider font-semibold select-none">
        <span
          className={`w-1.5 h-1.5 rounded-full transition-colors animate-pulse ${
            isDark ? 'bg-indigo-400 shadow-[0_0_8px_#818cf8]' : 'bg-[#d4f933] shadow-[0_0_8px_#d4f933]'
          }`}
        />
        <span className="text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
          {isDark ? 'NIGHT' : 'DAY'}
        </span>
      </div>
    </button>
  );
};
