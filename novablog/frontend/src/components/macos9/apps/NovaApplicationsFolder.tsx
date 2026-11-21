'use client';

import React from 'react';
import { macSound } from '@/lib/retroAudioMac9';

interface NovaApplicationsFolderProps {
  onLaunchCalculator: () => void;
  onLaunchStickies: () => void;
  onLaunchRadio: () => void;
  onLaunchBlog: () => void;
  onLaunchNews: () => void;
  onLaunchAppearance: () => void;
}

export const NovaApplicationsFolder: React.FC<NovaApplicationsFolderProps> = ({
  onLaunchCalculator,
  onLaunchStickies,
  onLaunchRadio,
  onLaunchBlog,
  onLaunchNews,
  onLaunchAppearance,
}) => {
  const APPS = [
    {
      id: 'calculator',
      name: 'Calculator',
      desc: 'Masaüstü hesap makinesi aracı',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
          <rect x="5" y="4" width="22" height="24" rx="2" fill="#CCCCCC" stroke="#262626" strokeWidth="1.5" />
          <rect x="8" y="7" width="16" height="5" fill="#E8EAE6" stroke="#262626" strokeWidth="0.8" />
          <line x1="9" y1="9" x2="15" y2="9" stroke="#262626" strokeWidth="1" />
          <rect x="8" y="15" width="4" height="3" fill="#FFFFFF" stroke="#262626" strokeWidth="0.8" />
          <rect x="14" y="15" width="4" height="3" fill="#FFFFFF" stroke="#262626" strokeWidth="0.8" />
          <rect x="20" y="15" width="4" height="3" fill="#FFFFFF" stroke="#262626" strokeWidth="0.8" />
          <rect x="8" y="20" width="4" height="3" fill="#FFFFFF" stroke="#262626" strokeWidth="0.8" />
          <rect x="14" y="20" width="4" height="3" fill="#FFFFFF" stroke="#262626" strokeWidth="0.8" />
          <rect x="20" y="20" width="4" height="3" fill="#FFFFFF" stroke="#262626" strokeWidth="0.8" />
        </svg>
      ),
      action: onLaunchCalculator,
    },
    {
      id: 'stickies',
      name: 'Stickies',
      desc: 'Sarı yapışkan masaüstü notları',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
          <rect x="5" y="5" width="22" height="22" rx="1" fill="#FFF59D" stroke="#262626" strokeWidth="1.5" />
          <rect x="5" y="5" width="22" height="4" fill="#FBC02D" />
          <line x1="8" y1="13" x2="20" y2="13" stroke="#5D4037" strokeWidth="1" />
          <line x1="8" y1="17" x2="23" y2="17" stroke="#5D4037" strokeWidth="1" />
          <line x1="8" y1="21" x2="18" y2="21" stroke="#5D4037" strokeWidth="1" />
        </svg>
      ),
      action: onLaunchStickies,
    },
    {
      id: 'radio',
      name: 'Apple FM Radio',
      desc: 'Stereo radyo & chiptune çalar',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
          <rect x="3" y="8" width="26" height="18" rx="2" fill="#E2E8F0" stroke="#262626" strokeWidth="1.5" />
          <line x1="8" y1="8" x2="8" y2="3" stroke="#262626" strokeWidth="1.5" />
          <circle cx="8" cy="3" r="1.5" fill="#EF4444" />
          <rect x="6" y="11" width="12" height="6" fill="#1E293B" stroke="#262626" strokeWidth="0.8" />
          <circle cx="23" cy="14" r="3" fill="#CBD5E1" stroke="#262626" strokeWidth="1" />
          <circle cx="23" cy="21" r="2" fill="#94A3B8" stroke="#262626" strokeWidth="1" />
        </svg>
      ),
      action: onLaunchRadio,
    },
    {
      id: 'browser',
      name: 'Web Browser',
      desc: 'Nova Blog modern internet sayfası',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="13" fill="#3B82F6" stroke="#262626" strokeWidth="1.5" />
          <ellipse cx="16" cy="16" rx="6" ry="13" stroke="#FFFFFF" strokeWidth="1" fill="none" />
          <line x1="3" y1="16" x2="29" y2="16" stroke="#FFFFFF" strokeWidth="1" />
          <path d="M10 11C12 9 15 10 17 8C19 6 23 8 25 12C26 15 24 19 22 21Z" fill="#10B981" />
        </svg>
      ),
      action: onLaunchBlog,
    },
    {
      id: 'sherlock',
      name: 'Sherlock 2.0',
      desc: 'Çok kanallı bülten ve arama motoru',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="13" fill="#E2E8F0" stroke="#262626" strokeWidth="1.5" />
          <circle cx="14" cy="13" r="7" fill="#60A5FA" fillOpacity="0.4" stroke="#D97706" strokeWidth="2" />
          <line x1="19" y1="18" x2="26" y2="25" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ),
      action: onLaunchNews,
    },
    {
      id: 'appearance',
      name: 'Appearance',
      desc: 'Masaüstü desenleri & sistem sesleri',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
          <rect x="3" y="4" width="26" height="18" rx="2" fill="#E8E8E8" stroke="#262626" strokeWidth="1.5" />
          <rect x="5" y="6" width="22" height="14" fill="#63659C" />
          <circle cx="9" cy="10" r="2" fill="#EF4444" />
          <circle cx="15" cy="10" r="2" fill="#3B82F6" />
          <circle cx="21" cy="10" r="2" fill="#10B981" />
          <path d="M12 22 L10 28 L22 28 L20 22 Z" fill="#BBBBBB" stroke="#262626" strokeWidth="1.2" />
        </svg>
      ),
      action: onLaunchAppearance,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] font-['Charcoal',sans-serif] text-[12px] text-[#262626] select-none">
      {/* Folder Header */}
      <div className="px-3 py-1.5 bg-[#DDDDDD] border-b border-[#262626] flex items-center justify-between text-[11px] shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold">Applications</span>
          <span className="text-[#666]">6 items</span>
        </div>
        <div className="text-[10px] text-[#555] font-mono">
          2.4 GB available on Macintosh HD
        </div>
      </div>

      {/* Grid of Applications */}
      <div className="flex-1 p-4 grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto bg-[#F8F9FA]">
        {APPS.map((app) => (
          <div
            key={app.id}
            onDoubleClick={() => {
              macSound.playWindowOpen();
              app.action();
            }}
            onClick={() => macSound.playMacClickDown()}
            className="group flex flex-col items-center p-2.5 rounded hover:bg-[#E0E7FF] border border-transparent hover:border-[#000080] cursor-pointer text-center transition-none"
            title="Açmak için çift tıklayın"
          >
            <div className="mb-1.5 group-active:scale-95 transition-transform flex items-center justify-center">
              {app.icon}
            </div>
            <span className="font-bold text-[12px] group-hover:bg-[#000080] group-hover:text-white px-2 py-0.5 rounded-[2px]">
              {app.name}
            </span>
            <span className="text-[10px] text-[#666] leading-tight mt-1 line-clamp-1">
              {app.desc}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Status */}
      <div className="px-3 py-1 bg-[#DDDDDD] border-t border-[#808080] text-[10px] font-mono text-[#555] flex justify-between">
        <span>Figma Mac OS 9 Uygulama Paketi</span>
        <span>Açmak için herhangi bir uygulamaya çift tıklayın</span>
      </div>
    </div>
  );
};
