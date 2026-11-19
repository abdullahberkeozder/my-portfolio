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
      {/* 1. Left: Apple 2010 Embossed Brand */}
      <div className="flex items-center gap-2">
        <span className="apple-global-nav-brand flex items-center gap-1.5 select-none" title="Nova Teknoloji Yayıncılık (Mac OS X Masaüstü Shell)">
          <span className="text-sm leading-none"></span>
          <span className="font-extrabold tracking-tight">NOVA</span>
          <span className="text-[9px] text-zinc-400 font-normal hidden sm:inline ml-1 border-l border-zinc-600 pl-1.5">
            Masaüstü Shell
          </span>
        </span>
      </div>

      {/* 2. Center: System Environmental Indicator (Zero Navigation Duplication) */}
      <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-zinc-400 select-none">
        <span className="opacity-60">SİSTEM:</span>
        <span className="text-zinc-200 font-semibold tracking-wider">NOVA WORKSPACE // DESKTOP EDITION 4.2</span>
      </div>

      {/* 3. Right: System Health LED, Keychain 2FA, Celestial Theme Toggle & GitHub */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Backend Online Status LED */}
        <button
          type="button"
          onClick={() => {
            playKeyClick();
            if (onRefreshHealth) onRefreshHealth();
          }}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/40 border border-zinc-800 text-[10px] font-mono cursor-pointer"
          title={isBackendOnline ? 'Spring Boot 5555: Online (Tıkla Yenile)' : 'Backend Çevrimdışı'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendOnline === true
                ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]'
                : isBackendOnline === false
                ? 'bg-rose-500 shadow-[0_0_6px_#ef4444]'
                : 'bg-amber-500 animate-pulse'
            }`}
          />
          <span className="text-zinc-300 hidden sm:inline">
            {isBackendOnline === true ? 'ONLINE' : isBackendOnline === false ? 'OFFLINE' : 'CHECK'}
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
            title="Mac OS X Keychain Güvenlik & 2FA"
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
