'use client';

import React, { useState, useEffect, useRef } from 'react';
import { macSound } from '@/lib/retroAudioMac9';

interface MacOs9MenuBarProps {
  onOpenBlog?: () => void;
  onOpenNews?: () => void;
  onOpenBrowser?: () => void;
  onOpenCalculator?: () => void;
  onOpenStickies?: () => void;
  onOpenAppearance?: () => void;
  onEmptyTrash?: () => void;
  onRestart?: () => void;
  onAbout?: () => void;
  onToggleTheme?: () => void;
  isNightMode?: boolean;
  activeAppTitle?: string;
}

export const MacOs9MenuBar: React.FC<MacOs9MenuBarProps> = ({
  onOpenBlog,
  onOpenNews,
  onOpenBrowser,
  onOpenCalculator,
  onOpenStickies,
  onOpenAppearance,
  onEmptyTrash,
  onRestart,
  onAbout,
  onToggleTheme,
  isNightMode = false,
  activeAppTitle = 'Finder',
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'icons' | 'buttons' | 'list'>('icons');
  const [currentTime, setCurrentTime] = useState<string>('12:00 PM');
  const [isMuted, setIsMuted] = useState<boolean>(macSound.getIsMuted());
  const barRef = useRef<HTMLDivElement>(null);

  // Live Digital Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const strMinutes = minutes < 10 ? '0' + minutes : minutes;
      setCurrentTime(`${hours}:${strMinutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Global click outside to dismiss menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
        setActiveSubmenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (menuName: string) => {
    macSound.playMacClickDown();
    setOpenMenu((prev) => {
      if (prev === menuName) {
        setActiveSubmenu(null);
        return null;
      }
      return menuName;
    });
  };

  const handleMenuHover = (menuName: string) => {
    if (openMenu !== null && openMenu !== menuName) {
      setOpenMenu(menuName);
      setActiveSubmenu(null);
    }
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
      {/* Left Menu Group (Apple, File, Edit, View, Special, Help) */}
      <div className="flex items-center gap-0.5 h-full">
        {/* ================= 1. APPLE  MENU (FIGMA IMAGE 1) ================= */}
        <div className="relative h-full flex items-center">
          <button
            onClick={() => handleMenuClick('apple')}
            onMouseEnter={() => handleMenuHover('apple')}
            className={`px-2 h-full flex items-center justify-center transition-none ${openMenu === 'apple' ? 'bg-[#333399] text-white' : 'hover:bg-[#CCCCCC]'
              }`}
            title="Apple Menu"
          >
            {/* Rainbow Apple Logo Vector */}
            <svg className="w-3.5 h-3.5" viewBox="0 0 170 170" fill="currentColor">
              <path
                d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.85-11.94-14.43-6.53-10.13-11.66-21.65-15.4-34.56-3.74-12.91-5.61-25.14-5.61-36.68 0-14.82 3.69-27.11 11.07-36.87 7.38-9.76 16.59-14.7 27.63-14.82 4.9 0 10.22 1.3 15.97 3.9 5.75 2.61 9.61 3.96 11.59 4.05 1.5.09 5.56-1.29 12.18-4.14 6.62-2.85 12.33-4.11 17.13-3.78 12.42.99 22.42 5.51 30 13.56-10.74 6.5-16.01 15.54-15.82 27.13.18 9.07 3.59 16.73 10.22 22.97 6.63 6.24 14.54 9.87 23.74 10.9-2.42 7.55-5.35 15.11-8.79 22.68zM119.22 31.81c0-7.39 2.68-14.45 8.04-21.18 5.36-6.73 12.12-10.63 20.28-11.71.18 1.03.27 2.06.27 3.09 0 7.39-2.73 14.36-8.19 20.91-5.46 6.55-12.23 10.27-20.31 11.16-.06-.75-.09-1.5-.09-2.27z"
                fill={openMenu === 'apple' ? '#FFFFFF' : '#262626'}
              />
            </svg>
          </button>

          {openMenu === 'apple' && (
            <div className="absolute top-[20px] left-0 w-64 bg-[#DDDDDD] border border-[#262626] shadow-[2px_2px_0_rgba(0,0,0,0.35)] py-1 z-50 text-[12px] font-['Charcoal',sans-serif]">
              {/* About This Computer */}
              <button
                onClick={() => {
                  onAbout?.();
                  setOpenMenu(null);
                  setActiveSubmenu(null);
                  macSound.playMacClickUp();
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#333399] hover:text-white flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-[#9999CC] border border-[#262626] flex items-center justify-center text-[9px] font-bold text-white"></div>
                  <span>About This Computer</span>
                </div>
                <span className="text-[10px] opacity-60">9.2.2</span>
              </button>

              <div className="h-px bg-[#999999] border-b border-[#FFFFFF] my-1 mx-1" />

              {/* Calculator */}
              <button
                onClick={() => {
                  onOpenCalculator?.();
                  setOpenMenu(null);
                  setActiveSubmenu(null);
                  macSound.playMacClickUp();
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#333399] hover:text-white flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[14px]">🔢</span>
                  <span>Calculator</span>
                </div>
              </button>

              {/* Chooser */}
              <button
                onClick={() => {
                  alert('Mac OS 9 Chooser: LaserWriter & AppleTalk active.');
                  setOpenMenu(null);
                  setActiveSubmenu(null);
                  macSound.playMacClickUp();
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#333399] hover:text-white flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[14px]">🖨️</span>
                  <span>Chooser</span>
                </div>
              </button>

              {/* Control Panels ▶ (With Submenu) */}
              <div
                onMouseEnter={() => setActiveSubmenu('controlPanels')}
                onMouseOver={() => setActiveSubmenu('controlPanels')}
                className="relative"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSubmenu((prev) => (prev === 'controlPanels' ? null : 'controlPanels'));
                  }}
                  className={`w-full text-left px-3 py-1 flex items-center justify-between group ${activeSubmenu === 'controlPanels' ? 'bg-[#333399] text-white' : 'hover:bg-[#333399] hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[14px]">⚙️</span>
                    <span>Control Panels</span>
                  </div>
                  <span className="text-[10px]">▶</span>
                </button>

                {/* Submenu for Control Panels */}
                {activeSubmenu === 'controlPanels' && (
                  <div className="absolute left-full top-0 ml-[-2px] w-48 bg-[#DDDDDD] border border-[#262626] shadow-[2px_2px_0_rgba(0,0,0,0.35)] py-1 z-50">
                    <button
                      onClick={() => {
                        onOpenAppearance?.();
                        setOpenMenu(null);
                        setActiveSubmenu(null);
                        macSound.playMacClickUp();
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#333399] hover:text-white flex items-center justify-between"
                    >
                      <span>Appearance</span>
                      <span className="text-[10px] text-emerald-700">✓ Kit</span>
                    </button>
                    <button
                      onClick={() => {
                        macSound.playSosumi();
                        setOpenMenu(null);
                        setActiveSubmenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#333399] hover:text-white"
                    >
                      Sound
                    </button>
                    <button
                      onClick={() => {
                        alert('General Controls: System 9.2.2 Platinum');
                        setOpenMenu(null);
                        setActiveSubmenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#333399] hover:text-white"
                    >
                      General Controls
                    </button>
                    <button
                      onClick={() => {
                        alert('Monitors: Apple Studio Display 1024x768 Millions of Colors');
                        setOpenMenu(null);
                        setActiveSubmenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#333399] hover:text-white"
                    >
                      Monitors
                    </button>
                    <button
                      onClick={() => {
                        alert('Date & Time: Network Time Active');
                        setOpenMenu(null);
                        setActiveSubmenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#333399] hover:text-white"
                    >
                      Date & Time
                    </button>
                  </div>
                )}
              </div>

              {/* Favorites ▶ */}
              <div
                onMouseEnter={() => setActiveSubmenu('favorites')}
                onMouseOver={() => setActiveSubmenu('favorites')}
                className="relative"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSubmenu((prev) => (prev === 'favorites' ? null : 'favorites'));
                  }}
                  className={`w-full text-left px-3 py-1 flex items-center justify-between group ${activeSubmenu === 'favorites' ? 'bg-[#333399] text-white' : 'hover:bg-[#333399] hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[14px]">🔖</span>
                    <span>Favorites</span>
                  </div>
                  <span className="text-[10px]">▶</span>
                </button>

                {activeSubmenu === 'favorites' && (
                  <div className="absolute left-full top-0 ml-[-2px] w-48 bg-[#DDDDDD] border border-[#262626] shadow-[2px_2px_0_rgba(0,0,0,0.35)] py-1 z-50">
                    <button
                      onClick={() => {
                        onOpenBlog?.();
                        setOpenMenu(null);
                        setActiveSubmenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#333399] hover:text-white flex justify-between"
                    >
                      <span>Nova Engineering Blog</span>
                      <span className="text-[10px] opacity-70">⌘B</span>
                    </button>
                    <button
                      onClick={() => {
                        onOpenNews?.();
                        setOpenMenu(null);
                        setActiveSubmenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#333399] hover:text-white flex justify-between"
                    >
                      <span>Sherlock 2 (News)</span>
                      <span className="text-[10px] opacity-70">⌘N</span>
                    </button>
                    <button
                      onClick={() => {
                        onOpenBrowser?.();
                        setOpenMenu(null);
                        setActiveSubmenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#333399] hover:text-white"
                    >
                      Google Web Search
                    </button>
                  </div>
                )}
              </div>

              {/* Key Caps */}
              <button
                onClick={() => {
                  alert('Key Caps: Apple Extended Keyboard II');
                  setOpenMenu(null);
                  setActiveSubmenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#333399] hover:text-white flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[14px]">⌨️</span>
                  <span>Key Caps</span>
                </div>
              </button>

              {/* Network Browser */}
              <button
                onClick={() => {
                  alert('Network Browser: AppleShare IP / Ethernet Active');
                  setOpenMenu(null);
                  setActiveSubmenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#333399] hover:text-white flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[14px]">🖥️</span>
                  <span>Network Browser</span>
                </div>
              </button>

              {/* Recent Applications ▶ (CLONED FROM FIGMA IMAGE 1) */}
              <div
                onMouseEnter={() => setActiveSubmenu('recentApps')}
                onMouseOver={() => setActiveSubmenu('recentApps')}
                className="relative"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSubmenu((prev) => (prev === 'recentApps' ? null : 'recentApps'));
                  }}
                  className={`w-full text-left px-3 py-1 flex items-center justify-between group ${activeSubmenu === 'recentApps' ? 'bg-[#333399] text-white' : 'hover:bg-[#333399] hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[14px]">📁</span>
                    <span>Recent Applications</span>
                  </div>
                  <span className="text-[10px]">▶</span>
                </button>

                {/* Submenu from Image 1 */}
                {activeSubmenu === 'recentApps' && (
                  <div className="absolute left-full top-0 ml-[-2px] w-52 bg-[#DDDDDD] border border-[#262626] shadow-[2px_2px_0_rgba(0,0,0,0.35)] py-1 z-50">
                    <button
                      onClick={() => {
                        onOpenBrowser?.();
                        setOpenMenu(null);
                        setActiveSubmenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#333399] hover:text-white flex items-center gap-2"
                    >
                      <span>🌐</span>
                      <span>Internet Explorer</span>
                    </button>
                    <button
                      onClick={() => {
                        onOpenBlog?.();
                        setOpenMenu(null);
                        setActiveSubmenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#333399] hover:text-white flex items-center gap-2"
                    >
                      <span>📖</span>
                      <span>Nova Blog</span>
                    </button>
                    <button
                      onClick={() => {
                        onOpenNews?.();
                        setOpenMenu(null);
                        setActiveSubmenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#333399] hover:text-white flex items-center gap-2"
                    >
                      <span>🔍</span>
                      <span>Sherlock 2</span>
                    </button>
                    <button
                      onClick={() => {
                        alert('CorelDRAW 8 (Classic Mac OS)');
                        setOpenMenu(null);
                        setActiveSubmenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#333399] hover:text-white"
                    >
                      CorelDRAW 8
                    </button>
                    <button
                      onClick={() => {
                        alert('Adobe Photoshop 5.5');
                        setOpenMenu(null);
                        setActiveSubmenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#333399] hover:text-white"
                    >
                      Adobe Photoshop 5.5
                    </button>
                    <button
                      onClick={() => {
                        alert('Help Viewer (Apple Guide)');
                        setOpenMenu(null);
                        setActiveSubmenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#333399] hover:text-white"
                    >
                      Help Viewer
                    </button>
                  </div>
                )}
              </div>

              {/* Scrapbook */}
              <button
                onClick={() => {
                  alert('Scrapbook: Clipboard clip items.');
                  setOpenMenu(null);
                  setActiveSubmenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#333399] hover:text-white flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[14px]">📓</span>
                  <span>Scrapbook</span>
                </div>
              </button>

              {/* Sherlock 2 */}
              <button
                onClick={() => {
                  onOpenNews?.();
                  setOpenMenu(null);
                  setActiveSubmenu(null);
                  macSound.playMacClickUp();
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#333399] hover:text-white flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[14px]">🔍</span>
                  <span>Sherlock 2</span>
                </div>
                <span className="text-[10px] opacity-60 font-mono">⌘N</span>
              </button>

              {/* Stickies */}
              <button
                onClick={() => {
                  onOpenStickies?.();
                  setOpenMenu(null);
                  setActiveSubmenu(null);
                  macSound.playMacClickUp();
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#333399] hover:text-white flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[14px]">📝</span>
                  <span>Stickies</span>
                </div>
              </button>

              <div className="h-px bg-[#999999] border-b border-[#FFFFFF] my-1 mx-1" />

              {/* Restart & Shut Down */}
              <button
                onClick={() => {
                  onRestart?.();
                  setOpenMenu(null);
                  setActiveSubmenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#333399] hover:text-white"
              >
                Restart
              </button>
              <button
                onClick={() => {
                  macSound.playWildEep();
                  setOpenMenu(null);
                  setActiveSubmenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#333399] hover:text-white"
              >
                Shut Down...
              </button>
            </div>
          )}
        </div>

        {/* ================= 2. FILE MENU ================= */}
        <div className="relative h-full flex items-center">
          <button
            onClick={() => handleMenuClick('file')}
            onMouseEnter={() => handleMenuHover('file')}
            className={`px-2 h-full flex items-center transition-none ${openMenu === 'file' ? 'bg-[#333399] text-white' : 'hover:bg-[#CCCCCC]'
              }`}
          >
            File
          </button>
          {openMenu === 'file' && (
            <div className="absolute top-[20px] left-0 w-48 bg-[#DDDDDD] border border-[#262626] shadow-[2px_2px_0_rgba(0,0,0,0.35)] py-1 z-50 text-[12px] font-['Charcoal',sans-serif]">
              <div className="px-4 py-1 hover:bg-[#333399] hover:text-white cursor-pointer flex justify-between">
                <span>New Folder</span>
                <span className="text-[10px] opacity-70">⌘N</span>
              </div>
              <button
                onClick={() => {
                  onOpenBlog?.();
                  setOpenMenu(null);
                }}
                className="w-full text-left px-4 py-1 hover:bg-[#333399] hover:text-white flex justify-between"
              >
                <span>Open Blog</span>
                <span className="text-[10px] opacity-70">⌘B</span>
              </button>
              <button
                onClick={() => {
                  onOpenNews?.();
                  setOpenMenu(null);
                }}
                className="w-full text-left px-4 py-1 hover:bg-[#333399] hover:text-white flex justify-between"
              >
                <span>Open News</span>
                <span className="text-[10px] opacity-70">⌘O</span>
              </button>
              <div className="h-px bg-[#999999] border-b border-[#FFFFFF] my-1 mx-1" />
              <div className="px-4 py-1 hover:bg-[#333399] hover:text-white cursor-pointer flex justify-between">
                <span>Close Window</span>
                <span className="text-[10px] opacity-70">⌘W</span>
              </div>
              <div className="px-4 py-1 hover:bg-[#333399] hover:text-white cursor-pointer flex justify-between">
                <span>Get Info</span>
                <span className="text-[10px] opacity-70">⌘I</span>
              </div>
              <div className="h-px bg-[#999999] border-b border-[#FFFFFF] my-1 mx-1" />
              <div className="px-4 py-1 hover:bg-[#333399] hover:text-white cursor-pointer flex justify-between">
                <span>Duplicate</span>
                <span className="text-[10px] opacity-70">⌘D</span>
              </div>
              <div className="px-4 py-1 hover:bg-[#333399] hover:text-white cursor-pointer flex justify-between">
                <span>Make Alias</span>
                <span className="text-[10px] opacity-70">⌘M</span>
              </div>
            </div>
          )}
        </div>

        {/* ================= 3. EDIT MENU ================= */}
        <div className="relative h-full flex items-center">
          <button
            onClick={() => handleMenuClick('edit')}
            onMouseEnter={() => handleMenuHover('edit')}
            className={`px-2 h-full flex items-center transition-none ${openMenu === 'edit' ? 'bg-[#333399] text-white' : 'hover:bg-[#CCCCCC]'
              }`}
          >
            Edit
          </button>
          {openMenu === 'edit' && (
            <div className="absolute top-[20px] left-0 w-44 bg-[#DDDDDD] border border-[#262626] shadow-[2px_2px_0_rgba(0,0,0,0.35)] py-1 z-50 text-[12px] font-['Charcoal',sans-serif]">
              <div className="px-4 py-1 opacity-50 cursor-not-allowed flex justify-between">
                <span>Undo</span>
                <span className="text-[10px]">⌘Z</span>
              </div>
              <div className="h-px bg-[#999999] border-b border-[#FFFFFF] my-1 mx-1" />
              <div className="px-4 py-1 hover:bg-[#333399] hover:text-white cursor-pointer flex justify-between">
                <span>Cut</span>
                <span className="text-[10px] opacity-70">⌘X</span>
              </div>
              <div className="px-4 py-1 hover:bg-[#333399] hover:text-white cursor-pointer flex justify-between">
                <span>Copy</span>
                <span className="text-[10px] opacity-70">⌘C</span>
              </div>
              <div className="px-4 py-1 hover:bg-[#333399] hover:text-white cursor-pointer flex justify-between">
                <span>Paste</span>
                <span className="text-[10px] opacity-70">⌘V</span>
              </div>
              <div className="px-4 py-1 hover:bg-[#333399] hover:text-white cursor-pointer">
                <span>Clear</span>
              </div>
              <div className="px-4 py-1 hover:bg-[#333399] hover:text-white cursor-pointer flex justify-between">
                <span>Select All</span>
                <span className="text-[10px] opacity-70">⌘A</span>
              </div>
            </div>
          )}
        </div>

        {/* ================= 4. VIEW MENU (CLONED FROM FIGMA IMAGE 1 & 4) ================= */}
        <div className="relative h-full flex items-center">
          <button
            onClick={() => handleMenuClick('view')}
            onMouseEnter={() => handleMenuHover('view')}
            className={`px-2 h-full flex items-center transition-none ${openMenu === 'view' ? 'bg-[#333399] text-white' : 'hover:bg-[#CCCCCC]'
              }`}
          >
            View
          </button>
          {openMenu === 'view' && (
            <div className="absolute top-[20px] left-0 w-48 bg-[#DDDDDD] border border-[#262626] shadow-[2px_2px_0_rgba(0,0,0,0.35)] py-1 z-50 text-[12px] font-['Charcoal',sans-serif]">
              <div
                onClick={() => {
                  setViewMode('icons');
                  setOpenMenu(null);
                  macSound.playMacClickUp();
                }}
                className="px-4 py-1 hover:bg-[#333399] hover:text-white cursor-pointer flex items-center justify-between"
              >
                <span>as Icons</span>
                {viewMode === 'icons' && <span className="font-bold">✓</span>}
              </div>
              <div
                onClick={() => {
                  setViewMode('buttons');
                  setOpenMenu(null);
                  macSound.playMacClickUp();
                }}
                className="px-4 py-1 hover:bg-[#333399] hover:text-white cursor-pointer flex items-center justify-between"
              >
                <span>as Buttons</span>
                {viewMode === 'buttons' && <span className="font-bold">✓</span>}
              </div>
              <div
                onClick={() => {
                  setViewMode('list');
                  setOpenMenu(null);
                  macSound.playMacClickUp();
                }}
                className="px-4 py-1 hover:bg-[#333399] hover:text-white cursor-pointer flex items-center justify-between"
              >
                <span>as List</span>
                {viewMode === 'list' && <span className="font-bold">✓</span>}
              </div>

              <div className="h-px bg-[#999999] border-b border-[#FFFFFF] my-1 mx-1" />

              <div className="px-4 py-1 hover:bg-[#333399] hover:text-white cursor-pointer">
                <span>Clean Up</span>
              </div>
              <div className="px-4 py-1 hover:bg-[#333399] hover:text-white cursor-pointer flex items-center justify-between">
                <span>Arrange</span>
                <span className="text-[10px]">▶</span>
              </div>
              <div className="px-4 py-1 hover:bg-[#333399] hover:text-white cursor-pointer">
                <span>Reset Column Positions</span>
              </div>

              <div className="h-px bg-[#999999] border-b border-[#FFFFFF] my-1 mx-1" />

              <div
                onClick={() => {
                  onOpenAppearance?.();
                  setOpenMenu(null);
                }}
                className="px-4 py-1 hover:bg-[#333399] hover:text-white cursor-pointer font-bold"
              >
                <span>View Options...</span>
              </div>
            </div>
          )}
        </div>

        {/* ================= 5. SPECIAL MENU ================= */}
        <div className="relative h-full flex items-center">
          <button
            onClick={() => handleMenuClick('special')}
            onMouseEnter={() => handleMenuHover('special')}
            className={`px-2 h-full flex items-center transition-none ${openMenu === 'special' ? 'bg-[#333399] text-white' : 'hover:bg-[#CCCCCC]'
              }`}
          >
            Special
          </button>
          {openMenu === 'special' && (
            <div className="absolute top-[20px] left-0 w-48 bg-[#DDDDDD] border border-[#262626] shadow-[2px_2px_0_rgba(0,0,0,0.35)] py-1 z-50 text-[12px] font-['Charcoal',sans-serif]">
              <button
                onClick={() => {
                  onEmptyTrash?.();
                  setOpenMenu(null);
                }}
                className="w-full text-left px-4 py-1 hover:bg-[#333399] hover:text-white"
              >
                Empty Trash...
              </button>
              <div className="h-px bg-[#999999] border-b border-[#FFFFFF] my-1 mx-1" />
              <div className="px-4 py-1 hover:bg-[#333399] hover:text-white cursor-pointer flex justify-between">
                <span>Eject</span>
                <span className="text-[10px] opacity-70">⌘E</span>
              </div>
              <div className="px-4 py-1 opacity-50 cursor-not-allowed">
                <span>Erase Disk...</span>
              </div>
              <div className="h-px bg-[#999999] border-b border-[#FFFFFF] my-1 mx-1" />
              <button
                onClick={() => {
                  onRestart?.();
                  setOpenMenu(null);
                }}
                className="w-full text-left px-4 py-1 hover:bg-[#333399] hover:text-white"
              >
                Restart
              </button>
              <button
                onClick={() => {
                  macSound.playWildEep();
                  setOpenMenu(null);
                }}
                className="w-full text-left px-4 py-1 hover:bg-[#333399] hover:text-white"
              >
                Shut Down...
              </button>
            </div>
          )}
        </div>

        {/* ================= 6. HELP MENU ================= */}
        <div className="relative h-full flex items-center">
          <button
            onClick={() => handleMenuClick('help')}
            onMouseEnter={() => handleMenuHover('help')}
            className={`px-2 h-full flex items-center transition-none ${openMenu === 'help' ? 'bg-[#333399] text-white' : 'hover:bg-[#CCCCCC]'
              }`}
          >
            Help
          </button>
          {openMenu === 'help' && (
            <div className="absolute top-[20px] left-0 w-44 bg-[#DDDDDD] border border-[#262626] shadow-[2px_2px_0_rgba(0,0,0,0.35)] py-1 z-50 text-[12px] font-['Charcoal',sans-serif]">
              <div
                onClick={() => {
                  onAbout?.();
                  setOpenMenu(null);
                }}
                className="px-4 py-1 hover:bg-[#333399] hover:text-white cursor-pointer"
              >
                Nova Desktop Help
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Status Group (Day/Night Mode, Audio Mute, Clock, Finder) */}
      <div className="flex items-center gap-1.5 h-full pr-1">
        {/* Day & Night Mode Toggle Button (Day & Night - Figma Image 1 HD Vector) */}
        {onToggleTheme && (
          <button
            onClick={() => {
              macSound.playDroplet();
              onToggleTheme();
            }}
            className={`h-[17px] px-1.5 rounded-[2px] flex items-center gap-1.5 border transition-none font-['Charcoal',sans-serif] text-[10px] ${isNightMode
              ? 'bg-[#1E293B] text-[#F1F5F9] border-[#475569] shadow-[inset_1px_1px_1px_#000000]'
              : 'bg-[#E5E5E5] text-[#262626] border-[#808080] shadow-[inset_1px_1px_0_#FFFFFF,inset_-1px_-1px_0_#808080] hover:bg-[#D4D4D4] active:shadow-[inset_1px_1px_1px_#000000]'
              }`}
            title={isNightMode ? 'Switch to Day Mode' : 'Switch to Night Mode'}
          >
            {/* Split Sun / Moon HD Graphic matching Figma Image 1 */}
            <div className="w-3.5 h-3.5 relative flex-shrink-0">
              <svg className="w-full h-full" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" fill={isNightMode ? '#0F172A' : '#F8FAFC'} stroke="#262626" strokeWidth="1.5" />
                {/* Left Half: Golden Sun */}
                <path d="M16 2 A14 14 0 0 0 16 30 Z" fill="#FBBF24" />
                <line x1="1" y1="16" x2="6" y2="16" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
                <line x1="4" y1="7" x2="8" y2="10" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
                <line x1="4" y1="25" x2="8" y2="22" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
                {/* Right Half: Midnight Navy */}
                <path d="M16 2 A14 14 0 0 1 16 30 Z" fill="#0F172A" />
                {/* White Crescent and Stars */}
                <path
                  d="M19 8 C22 10 24 14 22 19 C20 23 16 24 17 25 C24 25 26 17 23 10 C22 8 20 7 19 8 Z"
                  fill="#FFFFFF"
                />
                <circle cx="21" cy="6" r="1" fill="#FFFFFF" />
                <circle cx="27" cy="14" r="0.8" fill="#FFFFFF" />
              </svg>
            </div>
            <span className="font-bold tracking-tight">Day & Night</span>
          </button>
        )}

        {/* 1px Vertical Separator */}
        <div className="w-px h-3.5 bg-[#808080] mx-0.5" />

        {/* Sound Unmute / Mute Toggle */}
        <button
          onClick={toggleSound}
          className="px-1.5 py-0.5 rounded text-[11px] hover:bg-[#CCCCCC] flex items-center gap-1 border border-transparent hover:border-[#808080]"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        {/* Digital Clock */}
        <span className="text-[11px] px-1 font-mono tracking-tight font-medium text-[#262626]">
          {currentTime}
        </span>

        {/* 1px Vertical Separator */}
        <div className="w-px h-3.5 bg-[#808080] mx-0.5" />

        {/* Finder / Active Application Menu Indicator */}
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
