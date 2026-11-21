'use client';

import React from 'react';
import { macSound } from '@/lib/retroAudioMac9';

export type DesktopIconType =
  | 'harddrive'
  | 'blog'
  | 'news'
  | 'trash'
  | 'wallpapers'
  | 'theme-toggle'
  | 'sherlock'
  | 'system-folder'
  | 'readme'
  | 'specs';

interface DesktopIconProps {
  id: string;
  type: DesktopIconType;
  title: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
  isNightMode?: boolean;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({
  id,
  type,
  title,
  isSelected,
  onSelect,
  onOpen,
  isNightMode = false,
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
            <path
              d="M10 11C12 9 15 10 17 8C19 6 23 8 25 12C26 15 24 19 22 21C20 23 18 25 16 27C14 27 12 25 10 23C8 20 8 13 10 11Z"
              fill="#22c55e"
              stroke="#262626"
              strokeWidth="0.8"
            />
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
            <line x1="7" y1="16" x2="16" y2="16" stroke="#262626" strokeWidth="1.5" />
            <line x1="7" y1="19" x2="16" y2="19" stroke="#808080" strokeWidth="1" />
            <line x1="7" y1="22" x2="15" y2="22" stroke="#808080" strokeWidth="1" />
            <rect x="18" y="15" width="7" height="9" fill="#DDDDDD" stroke="#808080" strokeWidth="1" />
            <circle cx="21" cy="18" r="1" fill="#262626" />
          </svg>
        );

      case 'wallpapers':
        return (
          <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
            {/* Screen / Display with Palette & Swatches (Figma 73:879) */}
            <rect x="3" y="4" width="26" height="18" rx="2" fill="#E8E8E8" stroke="#262626" strokeWidth="1.5" />
            <rect x="5" y="6" width="22" height="14" fill="#63659c" />
            {/* Paint Palette Circles */}
            <circle cx="9" cy="10" r="2" fill="#EF4444" stroke="#FFFFFF" strokeWidth="0.5" />
            <circle cx="15" cy="10" r="2" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="0.5" />
            <circle cx="21" cy="10" r="2" fill="#10B981" stroke="#FFFFFF" strokeWidth="0.5" />
            <circle cx="12" cy="15" r="2" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="0.5" />
            <circle cx="18" cy="15" r="2" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="0.5" />
            {/* Monitor Stand */}
            <path d="M12 22 L10 28 L22 28 L20 22 Z" fill="#BBBBBB" stroke="#262626" strokeWidth="1.2" />
          </svg>
        );

      case 'theme-toggle':
        return (
          <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
            {/* Day & Night Split Sun / Moon Icon */}
            <circle cx="16" cy="16" r="13" fill={isNightMode ? "#1E293B" : "#F8FAFC"} stroke="#262626" strokeWidth="1.5" />
            {/* Left Half: Sun */}
            <path d="M16 3 A13 13 0 0 0 16 29 Z" fill="#FBBF24" />
            {/* Sun Rays on left */}
            <line x1="2" y1="16" x2="6" y2="16" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="5" y1="8" x2="8" y2="10" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="5" y1="24" x2="8" y2="22" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
            {/* Right Half: Moon & Stars */}
            <path d="M16 3 A13 13 0 0 1 16 29 Z" fill="#0F172A" />
            <path d="M19 9 C22 11 23 15 21 19 C19 23 15 24 16 25 C22 25 25 18 22 11 C21 9 20 8 19 9 Z" fill="#E2E8F0" />
            <circle cx="24" cy="9" r="0.8" fill="#F8FAFC" />
            <circle cx="21" cy="6" r="0.6" fill="#F8FAFC" />
            {/* Vertical Center Divider */}
            <line x1="16" y1="3" x2="16" y2="29" stroke="#262626" strokeWidth="1.2" />
          </svg>
        );

      case 'sherlock':
        return (
          <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
            {/* Classic Sherlock 2 Detective Hat & Magnifier (Figma 69:143705) */}
            <circle cx="16" cy="16" r="13" fill="#E2E8F0" stroke="#262626" strokeWidth="1.5" />
            {/* Globe Grid */}
            <ellipse cx="16" cy="16" rx="6" ry="12" stroke="#94A3B8" strokeWidth="0.8" fill="none" />
            <line x1="4" y1="16" x2="28" y2="16" stroke="#94A3B8" strokeWidth="0.8" />
            {/* Brass Magnifying Glass */}
            <circle cx="14" cy="13" r="7" fill="#60A5FA" fillOpacity="0.4" stroke="#D97706" strokeWidth="2" />
            <line x1="19" y1="18" x2="26" y2="25" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
            <circle cx="12" cy="11" r="1.5" fill="#FFFFFF" fillOpacity="0.8" />
          </svg>
        );

      case 'system-folder':
        return (
          <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
            {/* Mac OS 9 Golden System Folder with Embossed Finder Face (Figma 73:909) */}
            <path d="M3 8 L12 8 L15 11 L29 11 L29 27 L3 27 Z" fill="#E5C158" stroke="#262626" strokeWidth="1.5" />
            <path d="M4 12 L28 12 L28 26 L4 26 Z" fill="#FDE047" stroke="#B45309" strokeWidth="0.8" />
            {/* Mini Finder Face on the folder */}
            <rect x="11" y="15" width="10" height="8" rx="1" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="0.8" />
            <circle cx="14" cy="17.5" r="0.8" fill="#FFFFFF" />
            <circle cx="18" cy="17.5" r="0.8" fill="#FFFFFF" />
            <path d="M14 20.5 Q16 22 18 20.5" stroke="#FFFFFF" strokeWidth="0.8" fill="none" />
          </svg>
        );

      case 'readme':
        return (
          <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
            {/* SimpleText / ReadMe.txt Document with Dog-Ear Corner (Figma 73:842) */}
            <path d="M6 3 L20 3 L26 9 L26 29 L6 29 Z" fill="#FFFFFF" stroke="#262626" strokeWidth="1.5" />
            {/* Dog-ear fold */}
            <path d="M20 3 L20 9 L26 9 Z" fill="#CBD5E1" stroke="#262626" strokeWidth="1" />
            {/* Text lines */}
            <line x1="9" y1="8" x2="16" y2="8" stroke="#1E293B" strokeWidth="1.2" />
            <line x1="9" y1="12" x2="23" y2="12" stroke="#64748B" strokeWidth="1" />
            <line x1="9" y1="16" x2="23" y2="16" stroke="#64748B" strokeWidth="1" />
            <line x1="9" y1="20" x2="21" y2="20" stroke="#64748B" strokeWidth="1" />
            <line x1="9" y1="24" x2="17" y2="24" stroke="#64748B" strokeWidth="1" />
          </svg>
        );

      case 'specs':
        return (
          <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
            {/* Mac Pro Logic Board / Microprocessor Chip */}
            <rect x="6" y="6" width="20" height="20" rx="1.5" fill="#1E293B" stroke="#262626" strokeWidth="1.5" />
            <rect x="10" y="10" width="12" height="12" fill="#0EA5E9" stroke="#38BDF8" strokeWidth="0.8" />
            {/* Core Label */}
            <text x="12" y="19" fill="#FFFFFF" fontSize="7" fontFamily="monospace" fontWeight="bold">G4</text>
            {/* Pins on 4 sides */}
            <line x1="10" y1="3" x2="10" y2="6" stroke="#F59E0B" strokeWidth="1.2" />
            <line x1="16" y1="3" x2="16" y2="6" stroke="#F59E0B" strokeWidth="1.2" />
            <line x1="22" y1="3" x2="22" y2="6" stroke="#F59E0B" strokeWidth="1.2" />
            <line x1="10" y1="26" x2="10" y2="29" stroke="#F59E0B" strokeWidth="1.2" />
            <line x1="16" y1="26" x2="16" y2="29" stroke="#F59E0B" strokeWidth="1.2" />
            <line x1="22" y1="26" x2="22" y2="29" stroke="#F59E0B" strokeWidth="1.2" />
            <line x1="3" y1="10" x2="6" y2="10" stroke="#F59E0B" strokeWidth="1.2" />
            <line x1="3" y1="16" x2="6" y2="16" stroke="#F59E0B" strokeWidth="1.2" />
            <line x1="3" y1="22" x2="6" y2="22" stroke="#F59E0B" strokeWidth="1.2" />
            <line x1="26" y1="10" x2="29" y2="10" stroke="#F59E0B" strokeWidth="1.2" />
            <line x1="26" y1="16" x2="29" y2="16" stroke="#F59E0B" strokeWidth="1.2" />
            <line x1="26" y1="22" x2="29" y2="22" stroke="#F59E0B" strokeWidth="1.2" />
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
