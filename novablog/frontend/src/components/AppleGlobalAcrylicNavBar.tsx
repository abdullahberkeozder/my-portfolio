'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { MacThemeToggle } from './MacThemeToggle';
import { playKeyClick } from '@/lib/retroAudio';

interface AppleGlobalAcrylicNavBarProps {
  isBackendOnline: boolean | null;
  onRefreshHealth?: () => void;
  onOpenTwoFactor?: () => void;
}

export const AppleGlobalAcrylicNavBar: React.FC<AppleGlobalAcrylicNavBarProps> = ({
  isBackendOnline,
  onRefreshHealth,
  onOpenTwoFactor,
}) => {
  return (
    <div className="apple-global-nav sticky top-0 left-0 w-full flex items-center justify-between px-3 md:px-4 z-50">
      {/* 1. Left: Nova Crisp Vector Brand */}
      <div className="flex items-center gap-2">
        <span className="apple-global-nav-brand flex items-center gap-1.5 select-none" title="Nova Technology Publication (Mac OS X Desktop Shell)">
          <svg viewBox="0 0 40 40" fill="none" className="w-3.5 h-3.5 text-zinc-100" aria-hidden="true">
            <path
              d="M20 2C20 11.9411 28.0589 20 38 20C28.0589 20 20 28.0589 20 38C20 28.0589 11.9411 20 2 20C11.9411 20 20 11.9411 20 2Z"
              fill="currentColor"
            />
          </svg>
          <span className="font-extrabold tracking-tight">NOVA</span>
        </span>
      </div>

      {/* 2. Center: Low Cognitive Load Clean Publication Context */}
      <div className="hidden md:flex items-center gap-1.5 text-[11px] font-sans text-zinc-400 select-none">
        <span className="font-semibold text-zinc-200">Nova</span>
        <span className="opacity-40 text-zinc-500">/</span>
        <span className="text-zinc-400">Distributed Systems &amp; AI Journal</span>
      </div>

      {/* 3. Right: System Health LED, Keychain 2FA, Celestial Theme Toggle & GitHub */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Backend Status Indicator */}
        <button
          type="button"
          onClick={() => {
            playKeyClick();
            if (onRefreshHealth) onRefreshHealth();
          }}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/30 border border-white/10 text-[10px] font-mono cursor-pointer hover:bg-black/50 transition-colors"
          title={isBackendOnline ? 'Spring Boot 5555: Online (Click to Refresh)' : 'Backend Offline / Standby (Click to Refresh)'}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isBackendOnline === true
                ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]'
                : isBackendOnline === false
                ? 'bg-amber-400'
                : 'bg-zinc-500 animate-pulse'
            }`}
          />
          <span className="text-zinc-300 hidden sm:inline">
            {isBackendOnline === true ? 'ONLINE' : 'STANDBY'}
          </span>
        </button>

        {/* Security / 2FA trigger */}
        {onOpenTwoFactor && (
          <button
            type="button"
            onClick={() => {
              playKeyClick();
              onOpenTwoFactor();
            }}
            className="text-zinc-400 hover:text-zinc-200 transition-colors p-1 cursor-pointer"
            title="Mac OS X Keychain Security & 2FA"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Mac OS X Skeuomorphic Day/Night Celestial Switch */}
        <div className="flex items-center">
          <MacThemeToggle size="compact" className="scale-90" />
        </div>

        {/* GitHub Link */}
        <a
          href="https://github.com/abdullahberkeozder/my-portfolio"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playKeyClick()}
          className="text-zinc-400 hover:text-white transition-colors p-1"
          title="GitHub Repo"
        >
          <GithubIcon className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
