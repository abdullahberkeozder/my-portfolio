'use client';

import React from 'react';
import { macSound } from '@/lib/retroAudioMac9';

interface NovaSystemFolderWindowProps {
  onOpenAppearance: () => void;
  onOpenSpecs: () => void;
  onOpenReadme: () => void;
}

export const NovaSystemFolderWindow: React.FC<NovaSystemFolderWindowProps> = ({
  onOpenAppearance,
  onOpenSpecs,
  onOpenReadme,
}) => {
  const FOLDERS = [
    { id: 'control-panels', name: 'Control Panels', count: '14 items', icon: '🎛️', action: onOpenAppearance },
    { id: 'extensions', name: 'Extensions', count: '32 items', icon: '🧩', action: onOpenSpecs },
    { id: 'fonts', name: 'Fonts', count: '18 items', icon: '🔤', action: onOpenReadme },
    { id: 'preferences', name: 'Preferences', count: '8 items', icon: '⚙️', action: onOpenAppearance },
    { id: 'startup-items', name: 'Startup Items', count: '3 items', icon: '🚀', action: onOpenSpecs },
    { id: 'help', name: 'Help Files', count: '6 items', icon: '❓', action: onOpenReadme },
  ];

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] font-['Charcoal',sans-serif] text-[12px] text-[#262626] select-none">
      {/* Finder Folder Header */}
      <div className="px-3 py-1.5 bg-[#DDDDDD] border-b border-[#262626] flex items-center justify-between text-[11px] shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold">System Folder</span>
          <span className="text-[#666]">6 items</span>
        </div>
        <div className="text-[10px] text-[#555] font-mono">
          142.8 MB available on Macintosh HD
        </div>
      </div>

      {/* Grid of Folder Icons */}
      <div className="flex-1 p-4 grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto bg-[#F8F9FA]">
        {FOLDERS.map((f) => (
          <div
            key={f.id}
            onDoubleClick={() => {
              macSound.playWindowOpen();
              f.action();
            }}
            onClick={() => macSound.playMacClickDown()}
            className="group flex flex-col items-center p-2 rounded hover:bg-[#E0E7FF] border border-transparent hover:border-[#000080] cursor-pointer text-center transition-none"
          >
            <div className="text-3xl mb-1 group-active:scale-95 transition-transform">
              {f.icon}
            </div>
            <span className="font-bold text-[12px] group-hover:bg-[#000080] group-hover:text-white px-1.5 py-0.5 rounded-[2px]">
              {f.name}
            </span>
            <span className="text-[10px] text-[#666] font-mono mt-0.5">
              {f.count}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Status */}
      <div className="px-3 py-1 bg-[#DDDDDD] border-t border-[#808080] text-[10px] font-mono text-[#555]">
        Mac OS 9.2.2 System Enclave • Çift tıklayarak klasörleri açabilirsiniz
      </div>
    </div>
  );
};
