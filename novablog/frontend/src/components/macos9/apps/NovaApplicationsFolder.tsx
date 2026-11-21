'use client';

import React, { useState } from 'react';
import { macSound } from '@/lib/retroAudioMac9';

interface NovaApplicationsFolderProps {
  onLaunchCalculator: () => void;
  onLaunchStickies: () => void;
  onLaunchRadio: () => void;
  onLaunchBlog: () => void;
  onLaunchNews?: () => void;
  onLaunchAppearance: () => void;
  onLaunchBrowser: () => void;
}

type ViewMode = 'icons' | 'list';

interface AppItem {
  id: string;
  name: string;
  dateModified: string;
  size: string;
  kind: string;
  icon: React.ReactNode;
  action: () => void;
}

export const NovaApplicationsFolder: React.FC<NovaApplicationsFolderProps> = ({
  onLaunchCalculator,
  onLaunchStickies,
  onLaunchRadio,
  onLaunchBlog,
  onLaunchAppearance,
  onLaunchBrowser,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('icons');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  // Figma 82-811 Building Blocks - Icons & Canonical Apps
  const APPS: AppItem[] = [
    {
      id: 'explorer',
      name: 'Internet Explorer',
      dateModified: 'Dec 19, 2020, 2:15 PM',
      size: '15 M',
      kind: 'application program',
      icon: (
        <svg className="w-9 h-9" viewBox="0 0 32 32" fill="none">
          {/* Figma 82-811: Internet Explorer 5 Icon */}
          <circle cx="16" cy="16" r="11" fill="#0284C7" stroke="#0369A1" strokeWidth="1" />
          <path d="M9 15 H23 C23 9 10 9 10 16 C10 22 23 23 23 18" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="16" cy="16" rx="14" ry="5" stroke="#F59E0B" strokeWidth="1.6" fill="none" transform="rotate(-30 16 16)" />
        </svg>
      ),
      action: onLaunchBrowser,
    },
    {
      id: 'itunes',
      name: 'iTunes',
      dateModified: 'Dec 9, 2020, 3:23 PM',
      size: '1.2 M',
      kind: 'application program',
      icon: (
        <svg className="w-9 h-9" viewBox="0 0 32 32" fill="none">
          {/* Figma 82-811: iTunes CD Disc with Musical Notes */}
          <circle cx="16" cy="16" r="12" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.2" />
          <circle cx="16" cy="16" r="4" fill="#FFFFFF" stroke="#64748B" strokeWidth="1" />
          <circle cx="16" cy="16" r="1.5" fill="#475569" />
          <path d="M17 11 V7 H22 V10" stroke="#9333EA" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="15.5" cy="11.5" r="1.5" fill="#9333EA" />
        </svg>
      ),
      action: onLaunchRadio,
    },
    {
      id: 'wallpapers',
      name: 'Wallpapers',
      dateModified: 'Nov 21, 2026, 3:30 PM',
      size: '620 K',
      kind: 'control panel',
      icon: (
        <svg className="w-9 h-9" viewBox="0 0 32 32" fill="none">
          {/* Figma 82-811: Appearance / Wallpapers Studio Display Icon */}
          <rect x="3" y="3" width="26" height="20" rx="2" fill="#DDDDDD" stroke="#262626" strokeWidth="1.2" />
          <rect x="5" y="5" width="22" height="15" fill="#63659C" stroke="#262626" strokeWidth="0.8" />
          {/* Miniature wallpaper ribbons inside screen */}
          <path d="M5 16 C10 10 16 20 27 10" stroke="#9FA5C4" strokeWidth="2" fill="none" />
          <circle cx="16" cy="12" r="2.5" fill="#FBBF24" />
          {/* Stand and base */}
          <path d="M12 23 L10 28 L22 28 L20 23 Z" fill="#BBBBBB" stroke="#262626" strokeWidth="1" />
          <line x1="8" y1="28" x2="24" y2="28" stroke="#808080" strokeWidth="1.5" />
        </svg>
      ),
      action: onLaunchAppearance,
    },
    {
      id: 'stickies',
      name: 'Stickies',
      dateModified: 'Sep 2, 2020, 1:29 PM',
      size: '224 K',
      kind: 'application program',
      icon: (
        <svg className="w-9 h-9" viewBox="0 0 32 32" fill="none">
          {/* Figma 82-811: Stickies Yellow Note */}
          <rect x="5" y="5" width="22" height="22" rx="1" fill="#FFF59D" stroke="#262626" strokeWidth="1.2" />
          <rect x="5" y="5" width="22" height="4" fill="#FBC02D" />
          <line x1="8" y1="13" x2="20" y2="13" stroke="#5D4037" strokeWidth="1" />
          <line x1="8" y1="17" x2="23" y2="17" stroke="#5D4037" strokeWidth="1" />
          <line x1="8" y1="21" x2="18" y2="21" stroke="#5D4037" strokeWidth="1" />
        </svg>
      ),
      action: onLaunchStickies,
    },
    {
      id: 'calculator',
      name: 'Calculator',
      dateModified: 'Oct 14, 2020, 11:15 AM',
      size: '180 K',
      kind: 'application program',
      icon: (
        <svg className="w-9 h-9" viewBox="0 0 32 32" fill="none">
          {/* Figma 82-811: Mac Calculator Keypad */}
          <rect x="5" y="3" width="22" height="26" rx="2" fill="#CCCCCC" stroke="#262626" strokeWidth="1.2" />
          <rect x="8" y="6" width="16" height="5" fill="#E8EAE6" stroke="#262626" strokeWidth="0.8" />
          <line x1="10" y1="8.5" x2="16" y2="8.5" stroke="#262626" strokeWidth="1" />
          <rect x="8" y="14" width="4" height="3" fill="#FFFFFF" stroke="#262626" strokeWidth="0.6" />
          <rect x="14" y="14" width="4" height="3" fill="#FFFFFF" stroke="#262626" strokeWidth="0.6" />
          <rect x="20" y="14" width="4" height="3" fill="#FFFFFF" stroke="#262626" strokeWidth="0.6" />
          <rect x="8" y="19" width="4" height="3" fill="#FFFFFF" stroke="#262626" strokeWidth="0.6" />
          <rect x="14" y="19" width="4" height="3" fill="#FFFFFF" stroke="#262626" strokeWidth="0.6" />
          <rect x="20" y="19" width="4" height="3" fill="#FFFFFF" stroke="#262626" strokeWidth="0.6" />
          <rect x="8" y="24" width="10" height="3" fill="#FFFFFF" stroke="#262626" strokeWidth="0.6" />
        </svg>
      ),
      action: onLaunchCalculator,
    },
    {
      id: 'scrapbook',
      name: 'Scrapbook',
      dateModified: 'Mar 11, 1999, 10:12 AM',
      size: '960 K',
      kind: 'application program',
      icon: (
        <svg className="w-9 h-9" viewBox="0 0 32 32" fill="none">
          {/* Figma 82-811: Scrapbook Notebook */}
          <rect x="6" y="4" width="20" height="24" rx="1" fill="#FEF08A" stroke="#262626" strokeWidth="1.2" />
          <rect x="9" y="8" width="6" height="6" fill="#F43F5E" />
          <rect x="17" y="8" width="6" height="6" fill="#3B82F6" />
          <line x1="9" y1="18" x2="23" y2="18" stroke="#713F12" strokeWidth="1" />
          <line x1="9" y1="22" x2="20" y2="22" stroke="#713F12" strokeWidth="1" />
        </svg>
      ),
      action: onLaunchStickies,
    },
  ];

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    macSound.playMacClickDown();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const handleCloseContextMenu = () => {
    setContextMenuPos(null);
  };

  return (
    <div
      onClick={handleCloseContextMenu}
      onContextMenu={handleContextMenu}
      className="flex flex-col h-full bg-[#FFFFFF] font-['Charcoal',sans-serif] text-[12px] text-[#262626] select-none relative"
    >
      {/* ================= HEADER BAR (6 items, 12.44 GB available) ================= */}
      <div className="px-3 py-1.5 bg-[#DDDDDD] border-b border-[#262626] flex items-center justify-between text-[11px] shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold">Applications</span>
          <span className="text-[#666]">6 items, 12.44 GB available</span>
        </div>

        {/* View Switcher: as Icons / as List (Figma 69-130300) */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              macSound.playMacClickUp();
              setViewMode('icons');
            }}
            className={`px-2 py-0.5 rounded text-[10px] border transition-none ${
              viewMode === 'icons'
                ? 'bg-[#000080] text-white border-[#000080] font-bold'
                : 'bg-[#ECECEC] text-[#262626] border-[#888] hover:bg-[#D8D8D8]'
            }`}
            title="View as Icons"
          >
            as Icons
          </button>
          <button
            onClick={() => {
              macSound.playMacClickUp();
              setViewMode('list');
            }}
            className={`px-2 py-0.5 rounded text-[10px] border transition-none ${
              viewMode === 'list'
                ? 'bg-[#000080] text-white border-[#000080] font-bold'
                : 'bg-[#ECECEC] text-[#262626] border-[#888] hover:bg-[#D8D8D8]'
            }`}
            title="View as List"
          >
            as List
          </button>
        </div>
      </div>

      {/* ================= VIEW 1: AS ICONS ================= */}
      {viewMode === 'icons' && (
        <div className="flex-1 p-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 overflow-y-auto bg-white content-start">
          {APPS.map((app) => {
            const isSelected = selectedAppId === app.id;
            return (
              <div
                key={app.id}
                onClick={(e) => {
                  e.stopPropagation();
                  macSound.playMacClickDown();
                  setSelectedAppId(app.id);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  macSound.playWindowOpen();
                  app.action();
                }}
                className="group flex flex-col items-center cursor-pointer text-center select-none"
              >
                <div
                  className={`p-1 rounded mb-1 transition-transform group-active:scale-95 ${
                    isSelected ? 'filter drop-shadow-[0_0_2px_rgba(0,0,128,0.8)]' : ''
                  }`}
                >
                  {app.icon}
                </div>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-[2px] leading-tight break-words max-w-[95px] ${
                    isSelected
                      ? 'bg-[#000080] text-white font-bold'
                      : 'text-[#262626] group-hover:bg-[#EAEAEA]'
                  }`}
                >
                  {app.name}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= VIEW 2: AS LIST ================= */}
      {viewMode === 'list' && (
        <div className="flex-1 overflow-y-auto bg-white">
          <table className="w-full text-left text-[11px] border-collapse font-mono">
            <thead>
              <tr className="bg-[#DDDDDD] border-b border-[#808080] text-[#333] sticky top-0 select-none">
                <th className="py-1 px-3 font-bold border-r border-[#B0B0B0] w-[35%]">Name</th>
                <th className="py-1 px-3 font-bold border-r border-[#B0B0B0] w-[25%]">Date Modified</th>
                <th className="py-1 px-3 font-bold border-r border-[#B0B0B0] w-[15%]">Size</th>
                <th className="py-1 px-3 font-bold w-[25%]">Kind</th>
              </tr>
            </thead>
            <tbody>
              {APPS.map((app, index) => {
                const isSelected = selectedAppId === app.id;
                return (
                  <tr
                    key={app.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      macSound.playMacClickDown();
                      setSelectedAppId(app.id);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      macSound.playWindowOpen();
                      app.action();
                    }}
                    className={`cursor-pointer border-b border-[#F0F0F0] ${
                      isSelected
                        ? 'bg-[#333399] text-white font-bold'
                        : index % 2 === 0
                        ? 'bg-white hover:bg-[#F2F4F8]'
                        : 'bg-[#F9FAFB] hover:bg-[#F2F4F8]'
                    }`}
                  >
                    <td className="py-1 px-3 flex items-center gap-2">
                      <div className="w-4 h-4 shrink-0 flex items-center justify-center scale-75">
                        {app.icon}
                      </div>
                      <span className="truncate">{app.name}</span>
                    </td>
                    <td className="py-1 px-3">{app.dateModified}</td>
                    <td className="py-1 px-3">{app.size}</td>
                    <td className="py-1 px-3">{app.kind}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= RIGHT CLICK CONTEXT MENU ================= */}
      {contextMenuPos && (
        <div
          style={{ top: contextMenuPos.y - 40, left: contextMenuPos.x - 40 }}
          className="fixed bg-[#DDDDDD] border border-[#262626] shadow-[2px_2px_0_rgba(0,0,0,0.35)] py-1 z-[9999] text-[11px] w-40"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-0.5 opacity-50 cursor-not-allowed">Help</div>
          <div className="px-3 py-0.5 opacity-50 cursor-not-allowed">New Folder</div>
          <div className="px-3 py-0.5 opacity-50 cursor-not-allowed">Close Window</div>
          <div className="h-px bg-[#999] my-0.5" />
          <div
            onClick={() => {
              setViewMode('icons');
              setContextMenuPos(null);
            }}
            className="px-3 py-0.5 hover:bg-[#333399] hover:text-white cursor-pointer flex justify-between"
          >
            <span>as Icons</span>
            {viewMode === 'icons' && <span>✓</span>}
          </div>
          <div
            onClick={() => {
              setViewMode('list');
              setContextMenuPos(null);
            }}
            className="px-3 py-0.5 hover:bg-[#333399] hover:text-white cursor-pointer flex justify-between"
          >
            <span>as List</span>
            {viewMode === 'list' && <span>✓</span>}
          </div>
        </div>
      )}

      {/* Bottom Status bar */}
      <div className="px-3 py-0.5 bg-[#DDDDDD] border-t border-[#808080] text-[10px] font-mono text-[#555] flex justify-between">
        <span>Figma 82-811 Applications Suite</span>
        <span>Double-click to open</span>
      </div>
    </div>
  );
};
