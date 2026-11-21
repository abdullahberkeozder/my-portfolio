'use client';

import React from 'react';
import { macSound } from '@/lib/retroAudioMac9';

export type DesktopIconType = 'harddrive' | 'blog' | 'news' | 'trash';

interface DesktopIconProps {
  id: string;
  type: DesktopIconType;
  title: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({
  id,
  type,
  title,
  isSelected,
  onSelect,
  onOpen,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    macSound.playMacClickDown();
    onSelect(id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    macSound.playWindowOpen();
    onOpen(id);
  };

  // Render 32x32 crisp pixel icon based on type
  const renderIcon = () => {
    switch (type) {
      case 'harddrive':
        return (
          <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
            {/* Macintosh HD Retro Hard Drive */}
            <rect x="3" y="10" width="26" height="12" rx="1" fill="#CCCCCC" stroke="#262626" strokeWidth="1.5" />
            <line x1="3" y1="18" x2="29" y2="18" stroke="#808080" strokeWidth="1" />
            <circle cx="24" cy="14" r="1.5" fill="#4ade80" stroke="#262626" />
            <rect x="6" y="13" width="12" height="2" fill="#262626" />
            <rect x="4" y="22" width="24" height="2" fill="#999999" />
          </svg>
        );
      case 'blog':
        return (
          <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
            {/* Earth Globe with Hand — Classic "Browse the Internet" */}
            <circle cx="16" cy="16" r="13" fill="#3b82f6" stroke="#262626" strokeWidth="1.5" />
            {/* Continents */}
            <path
              d="M10 11C12 9 15 10 17 8C19 6 23 8 25 12C26 15 24 19 22 21C20 23 18 25 16 27C14 27 12 25 10 23C8 20 8 13 10 11Z"
              fill="#22c55e"
              stroke="#262626"
              strokeWidth="0.8"
            />
            {/* Meridians */}
            <ellipse cx="16" cy="16" rx="6" ry="13" stroke="#262626" strokeWidth="1" fill="none" />
            <line x1="3" y1="16" x2="29" y2="16" stroke="#262626" strokeWidth="1" />
          </svg>
        );
      case 'news':
        return (
          <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
            {/* Retro Newspaper Icon */}
            <rect x="4" y="5" width="24" height="22" rx="1" fill="#FFFFFF" stroke="#262626" strokeWidth="1.5" />
            <rect x="7" y="8" width="18" height="5" fill="#262626" />
            {/* Headline text stripes */}
            <line x1="7" y1="16" x2="16" y2="16" stroke="#262626" strokeWidth="1.5" />
            <line x1="7" y1="19" x2="16" y2="19" stroke="#808080" strokeWidth="1" />
            <line x1="7" y1="22" x2="15" y2="22" stroke="#808080" strokeWidth="1" />
            {/* Thumbnail picture */}
            <rect x="18" y="15" width="7" height="9" fill="#DDDDDD" stroke="#808080" strokeWidth="1" />
            <circle cx="21" cy="18" r="1" fill="#262626" />
          </svg>
        );
      case 'trash':
        return (
          <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
            {/* Classic Mac Metal Trash Can */}
            <ellipse cx="16" cy="6" rx="9" ry="2.5" fill="#DDDDDD" stroke="#262626" strokeWidth="1.5" />
            <path
              d="M8 7 L10 27 C10 28 12 29 16 29 C20 29 22 28 22 27 L24 7"
              fill="#CCCCCC"
              stroke="#262626"
              strokeWidth="1.5"
            />
            {/* Ribs on the trash can */}
            <line x1="12" y1="10" x2="13" y2="25" stroke="#808080" strokeWidth="1" />
            <line x1="16" y1="10" x2="16" y2="26" stroke="#808080" strokeWidth="1" />
            <line x1="20" y1="10" x2="19" y2="25" stroke="#808080" strokeWidth="1" />
          </svg>
        );
    }
  };

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`group flex flex-col items-center w-[74px] p-1 select-none cursor-pointer rounded transition-none ${
        isSelected ? 'mac9-icon-selected' : ''
      }`}
    >
      <div className="relative mb-1 flex items-center justify-center mac9-icon-img">
        {renderIcon()}
      </div>
      <span
        className={`px-1.5 py-0.5 text-center text-[11px] leading-tight font-['Charcoal',sans-serif] break-words line-clamp-2 ${
          isSelected
            ? 'bg-[#000080] text-white rounded-[2px]'
            : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
        }`}
      >
        {title}
      </span>
    </div>
  );
};
