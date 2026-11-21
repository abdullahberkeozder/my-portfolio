'use client';

import React, { useState, useEffect, useRef } from 'react';
import { macSound } from '@/lib/retroAudioMac9';

interface MacOs9MenuBarProps {
  onOpenBlog?: () => void;
  onOpenNews?: () => void;
  onEmptyTrash?: () => void;
  onRestart?: () => void;
  onAbout?: () => void;
  activeAppTitle?: string;
}

export const MacOs9MenuBar: React.FC<MacOs9MenuBarProps> = ({
  onOpenBlog,
  onOpenNews,
  onEmptyTrash,
  onRestart,
  onAbout,
  activeAppTitle = 'Finder',
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('12:00 PM');
  const [isMuted, setIsMuted] = useState<boolean>(macSound.getIsMuted());
  const barRef = useRef<HTMLDivElement>(null);

  // Live Digital Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      setCurrentTime(`${formattedHours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (menuName: string) => {
    macSound.playMacClickDown();
    setOpenMenu((prev) => (prev === menuName ? null : menuName));
  };

  const toggleSound = () => {
    const muted = macSound.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      macSound.playDroplet();
    }
  };

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 right-0 h-[20px] bg-[#DDDDDD] border-b border-[#262626] z-[9999] flex items-center justify-between px-2 select-none shadow-[inset_0_1px_0_#FFFFFF,0_1px_2px_rgba(0,0,0,0.15)] font-['Charcoal',sans-serif] text-[12px] text-[#262626]"
    >
      {/* Sol Menü Grubu */}
      <div className="flex items-center gap-1 h-full">
        {/* Apple  Logosu */}
        <div className="relative h-full flex items-center">
          <button
            onClick={() => handleMenuClick('apple')}
            className={`px-2 h-full flex items-center justify-center transition-none ${
              openMenu === 'apple' ? 'bg-[#000080] text-white' : 'hover:bg-[#CCCCCC]'
            }`}
            title="Apple Menüsü"
          >
            {/* Gökkuşağı Apple Logosu Vektörü */}
            <svg className="w-3.5 h-3.5" viewBox="0 0 170 170" fill="currentColor">
              <path
                d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.85-11.94-14.43-6.53-10.13-11.66-21.65-15.4-34.56-3.74-12.91-5.61-25.14-5.61-36.68 0-14.82 3.69-27.11 11.07-36.87 7.38-9.76 16.59-14.7 27.63-14.82 4.9 0 10.22 1.3 15.97 3.9 5.75 2.61 9.61 3.96 11.59 4.05 1.5.09 5.56-1.29 12.18-4.14 6.62-2.85 12.33-4.11 17.13-3.78 12.42.99 22.42 5.51 30 13.56-10.74 6.5-16.01 15.54-15.82 27.13.18 9.07 3.59 16.73 10.22 22.97 6.63 6.24 14.54 9.87 23.74 10.9-2.42 7.55-5.35 15.11-8.79 22.68zM119.22 31.81c0-7.39 2.68-14.45 8.04-21.18 5.36-6.73 12.12-10.63 20.28-11.71.18 1.03.27 2.06.27 3.09 0 7.39-2.73 14.36-8.19 20.91-5.46 6.55-12.23 10.27-20.31 11.16-.06-.75-.09-1.5-.09-2.27z"
                fill={openMenu === 'apple' ? '#FFFFFF' : '#262626'}
              />
            </svg>
          </button>

          {openMenu === 'apple' && (
            <div className="absolute top-[20px] left-0 w-52 bg-[#DDDDDD] border border-[#262626] shadow-[2px_2px_0_rgba(0,0,0,0.35)] py-1 z-50">
              <button
                onClick={() => {
                  onAbout?.();
                  setOpenMenu(null);
                  macSound.playMacClickUp();
                }}
                className="w-full text-left px-4 py-1 hover:bg-[#000080] hover:text-white flex items-center justify-between"
              >
                <span>About Nova OS...</span>
                <span className="text-[10px] opacity-60">9.2.2</span>
              </button>
              <div className="h-px bg-[#808080] my-1 mx-2" />
              <button
                onClick={() => {
                  onOpenBlog?.();
                  setOpenMenu(null);
                  macSound.playMacClickUp();
                }}
                className="w-full text-left px-4 py-1 hover:bg-[#000080] hover:text-white"
              >
                Nova Blog Sayfası
              </button>
              <button
                onClick={() => {
                  onOpenNews?.();
                  setOpenMenu(null);
                  macSound.playMacClickUp();
                }}
                className="w-full text-left px-4 py-1 hover:bg-[#000080] hover:text-white"
              >
                Nova Haberler
              </button>
              <div className="h-px bg-[#808080] my-1 mx-2" />
              <button
                onClick={() => {
                  macSound.playSosumi();
                  setOpenMenu(null);
                }}
                className="w-full text-left px-4 py-1 hover:bg-[#000080] hover:text-white"
              >
                Test Sound: Sosumi
              </button>
            </div>
          )}
        </div>

        {/* File Menüsü */}
        <div className="relative h-full flex items-center">
          <button
            onClick={() => handleMenuClick('file')}
            className={`px-2 h-full flex items-center transition-none ${
              openMenu === 'file' ? 'bg-[#000080] text-white' : 'hover:bg-[#CCCCCC]'
            }`}
          >
            File
          </button>
          {openMenu === 'file' && (
            <div className="absolute top-[20px] left-0 w-44 bg-[#DDDDDD] border border-[#262626] shadow-[2px_2px_0_rgba(0,0,0,0.35)] py-1 z-50">
              <button
                onClick={() => {
                  onOpenBlog?.();
                  setOpenMenu(null);
                }}
                className="w-full text-left px-4 py-1 hover:bg-[#000080] hover:text-white flex justify-between"
              >
                <span>Open Blog</span>
                <span className="text-[10px] opacity-70">⌘B</span>
              </button>
              <button
                onClick={() => {
                  onOpenNews?.();
                  setOpenMenu(null);
                }}
                className="w-full text-left px-4 py-1 hover:bg-[#000080] hover:text-white flex justify-between"
              >
                <span>Open News</span>
                <span className="text-[10px] opacity-70">⌘N</span>
              </button>
            </div>
          )}
        </div>

        {/* Edit Menüsü */}
        <div className="relative h-full flex items-center">
          <button
            onClick={() => handleMenuClick('edit')}
            className={`px-2 h-full flex items-center transition-none ${
              openMenu === 'edit' ? 'bg-[#000080] text-white' : 'hover:bg-[#CCCCCC]'
            }`}
          >
            Edit
          </button>
          {openMenu === 'edit' && (
            <div className="absolute top-[20px] left-0 w-36 bg-[#DDDDDD] border border-[#262626] shadow-[2px_2px_0_rgba(0,0,0,0.35)] py-1 z-50">
              <div className="px-4 py-1 opacity-50 cursor-not-allowed">Cut (⌘X)</div>
              <div className="px-4 py-1 opacity-50 cursor-not-allowed">Copy (⌘C)</div>
              <div className="px-4 py-1 opacity-50 cursor-not-allowed">Paste (⌘V)</div>
            </div>
          )}
        </div>

        {/* View Menüsü */}
        <div className="relative h-full flex items-center">
          <button
            onClick={() => handleMenuClick('view')}
            className={`px-2 h-full flex items-center transition-none ${
              openMenu === 'view' ? 'bg-[#000080] text-white' : 'hover:bg-[#CCCCCC]'
            }`}
          >
            View
          </button>
          {openMenu === 'view' && (
            <div className="absolute top-[20px] left-0 w-36 bg-[#DDDDDD] border border-[#262626] shadow-[2px_2px_0_rgba(0,0,0,0.35)] py-1 z-50">
              <div className="px-4 py-1 hover:bg-[#000080] hover:text-white cursor-pointer">as Icons</div>
              <div className="px-4 py-1 hover:bg-[#000080] hover:text-white cursor-pointer">as List</div>
            </div>
          )}
        </div>

        {/* Special Menüsü */}
        <div className="relative h-full flex items-center">
          <button
            onClick={() => handleMenuClick('special')}
            className={`px-2 h-full flex items-center transition-none ${
              openMenu === 'special' ? 'bg-[#000080] text-white' : 'hover:bg-[#CCCCCC]'
            }`}
          >
            Special
          </button>
          {openMenu === 'special' && (
            <div className="absolute top-[20px] left-0 w-48 bg-[#DDDDDD] border border-[#262626] shadow-[2px_2px_0_rgba(0,0,0,0.35)] py-1 z-50">
              <button
                onClick={() => {
                  onEmptyTrash?.();
                  setOpenMenu(null);
                }}
                className="w-full text-left px-4 py-1 hover:bg-[#000080] hover:text-white"
              >
                Empty Trash...
              </button>
              <div className="h-px bg-[#808080] my-1 mx-2" />
              <button
                onClick={() => {
                  onRestart?.();
                  setOpenMenu(null);
                }}
                className="w-full text-left px-4 py-1 hover:bg-[#000080] hover:text-white"
              >
                Restart
              </button>
              <button
                onClick={() => {
                  macSound.playWildEep();
                  setOpenMenu(null);
                }}
                className="w-full text-left px-4 py-1 hover:bg-[#000080] hover:text-white"
              >
                Shut Down...
              </button>
            </div>
          )}
        </div>

        {/* Help Menüsü */}
        <div className="relative h-full flex items-center">
          <button
            onClick={() => handleMenuClick('help')}
            className={`px-2 h-full flex items-center transition-none ${
              openMenu === 'help' ? 'bg-[#000080] text-white' : 'hover:bg-[#CCCCCC]'
            }`}
          >
            Help
          </button>
          {openMenu === 'help' && (
            <div className="absolute top-[20px] left-0 w-44 bg-[#DDDDDD] border border-[#262626] shadow-[2px_2px_0_rgba(0,0,0,0.35)] py-1 z-50">
              <div
                onClick={() => {
                  onAbout?.();
                  setOpenMenu(null);
                }}
                className="px-4 py-1 hover:bg-[#000080] hover:text-white cursor-pointer"
              >
                Nova Desktop Help
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sağ Durum Grubu (Ses Mute, Saat, Finder) */}
      <div className="flex items-center gap-2 h-full pr-1">
        {/* Ses Açma/Kapama Mute Butonu */}
        <button
          onClick={toggleSound}
          className="px-1.5 py-0.5 rounded text-[11px] hover:bg-[#CCCCCC] flex items-center gap-1 border border-transparent hover:border-[#808080]"
          title={isMuted ? 'Sesi Aç' : 'Sesi Kapat (Mute)'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        {/* Dijital Saat */}
        <span className="text-[11px] px-1 font-mono tracking-tight font-medium text-[#262626]">
          {currentTime}
        </span>

        {/* 1px Dikey Ayırıcı */}
        <div className="w-px h-3.5 bg-[#808080] mx-0.5" />

        {/* Finder Uygulama Göstergesi */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 hover:bg-[#CCCCCC] cursor-default">
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="2" fill="#9999CC" stroke="#262626" />
            <circle cx="5.5" cy="6.5" r="1.5" fill="#262626" />
            <circle cx="10.5" cy="6.5" r="1.5" fill="#262626" />
            <path d="M5 10.5C6 12 10 12 11 10.5" stroke="#262626" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span className="text-[11px] font-bold">{activeAppTitle}</span>
        </div>
      </div>
    </div>
  );
};
