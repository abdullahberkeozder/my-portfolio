'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { macSound } from '@/lib/retroAudioMac9';

interface MacBootSequenceProps {
  onComplete: () => void;
  forceRestart?: boolean;
}

type BootPhase = 'crt-screen' | 'welcome-splash' | 'starting-up' | 'desktop-transition' | 'finished';

const EXTENSIONS = [
  { name: 'QuickTime™', icon: '🎬' },
  { name: 'AppleScript', icon: '📜' },
  { name: 'Open Transport', icon: '🌐' },
  { name: 'Sound Manager', icon: '🔊' },
  { name: 'Control Strip', icon: '🎛️' },
  { name: 'Sherlock 2', icon: '🔍' },
  { name: 'Appearance', icon: '🎨' },
  { name: 'Nova Core 22', icon: '⚡' },
];

export const MacBootSequence: React.FC<MacBootSequenceProps> = ({
  onComplete,
  forceRestart = false,
}) => {
  const [phase, setPhase] = useState<BootPhase>('crt-screen');
  const [progress, setProgress] = useState<number>(0);
  const [loadedExtCount, setLoadedExtCount] = useState<number>(0);
  const chimePlayedRef = useRef(false);

  // Finish and persist to sessionStorage
  const handleFinish = useCallback(() => {
    try {
      sessionStorage.setItem('macos9_booted', 'true');
    } catch {
      // ignore
    }
    setPhase('finished');
    onComplete();
  }, [onComplete]);

  // Check if already booted in this session (unless forced restart)
  useEffect(() => {
    if (!forceRestart) {
      try {
        const alreadyBooted = sessionStorage.getItem('macos9_booted');
        if (alreadyBooted === 'true') {
          onComplete();
          return;
        }
      } catch {
        // ignore
      }
    }

    // Play startup chime
    if (!chimePlayedRef.current) {
      chimePlayedRef.current = true;
      macSound.playMacStartupChime();
    }

    // Timeline of Boot
    // 1. Happy Mac CRT screen (0 - 1.2s)
    const t1 = setTimeout(() => {
      setPhase('welcome-splash');
    }, 1200);

    // 2. Welcome to Mac OS splash (1.2s - 2.5s)
    const t2 = setTimeout(() => {
      setPhase('starting-up');
    }, 2500);

    // 3. Starting Up progress & extension parade (2.5s - 5.2s)
    let progressInterval: NodeJS.Timeout;
    const t3 = setTimeout(() => {
      let currentProgress = 0;
      progressInterval = setInterval(() => {
        currentProgress += 3.5;
        if (currentProgress > 100) currentProgress = 100;
        setProgress(Math.round(currentProgress));

        // Extension load cadence
        const extIndex = Math.min(
          EXTENSIONS.length,
          Math.floor((currentProgress / 100) * EXTENSIONS.length)
        );
        setLoadedExtCount(extIndex);

        if (currentProgress >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setPhase('desktop-transition');
            setTimeout(handleFinish, 600);
          }, 350);
        }
      }, 70);
    }, 2500);

    // Keyboard bypass: Space or Escape skips directly to desktop
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Escape' || e.key === 'Enter') {
        if (progressInterval) clearInterval(progressInterval);
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (progressInterval) clearInterval(progressInterval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [forceRestart, handleFinish, onComplete]);

  if (phase === 'finished') return null;

  return (
    <div
      onClick={handleFinish}
      className={`fixed inset-0 z-[99999] flex items-center justify-center select-none font-['Charcoal',sans-serif] transition-opacity duration-500 ${
        phase === 'desktop-transition' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } ${
        phase === 'crt-screen'
          ? 'bg-[#CCCCCC]'
          : 'bg-[#63659c] mac9-wallpaper-sonata-purple'
      }`}
      style={{ cursor: phase === 'desktop-transition' ? 'wait' : 'default' }}
      title="Click or press Spacebar to quickly skip to desktop"
    >
      {/* ================= STAGE 1: HAPPY MAC CRT SCREEN ================= */}
      {phase === 'crt-screen' && (
        <div className="flex flex-col items-center justify-center animate-fade-in">
          {/* Authentic 25x32 Happy Mac Icon */}
          <div className="relative w-[32px] h-[38px] drop-shadow-md">
            <Image
              src="/retro/happy-mac.png"
              alt="Happy Mac"
              width={32}
              height={38}
              className="object-contain image-rendering-pixelated"
              priority
            />
          </div>
          <span className="mt-4 text-[11px] text-[#404040] font-mono tracking-wider">
            Nova PowerPC G4 • 500 MHz
          </span>
        </div>
      )}

      {/* ================= STAGE 2 & 3: WELCOME TO MAC OS & STARTING UP DIALOG ================= */}
      {(phase === 'welcome-splash' || phase === 'starting-up' || phase === 'desktop-transition') && (
        <div className="relative w-[422px] min-h-[323px] bg-[#DDDDDD] border border-[#262626] shadow-[4px_4px_12px_rgba(0,0,0,0.5),inset_1px_1px_0_#FFFFFF,inset_-1px_-1px_0_#808080] rounded-[2px] p-4 flex flex-col items-center justify-between">
          
          {/* Inner White Frame (Figma ComponentWindowFrame inner frame) */}
          <div className="relative w-[350px] h-[221px] bg-white border border-[#262626] shadow-[inset_1px_1px_0px_#808080,inset_-1px_-1px_0px_#FFFFFF] flex flex-col items-center justify-center p-4">
            
            {/* Split-Face Picasso Finder Logo */}
            <div className="relative w-[88px] h-[92px] mb-2">
              <img
                src="/retro/finder-logo-bg.svg"
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />
              <img
                src="/retro/finder-logo-face-shapes.svg"
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />
              <img
                src="/retro/finder-logo-mouth.svg"
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />
              <img
                src="/retro/finder-logo-eye.svg"
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />
            </div>

            {/* "Mac OS 9" Typography (Apple Garamond Serif) */}
            <h1
              className="text-[48px] leading-none tracking-[-2px] text-black font-serif font-light text-center select-none"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Mac OS 9
            </h1>

            {/* Version Badge */}
            <div className="text-[10px] text-[#666666] tracking-wider mt-1 font-mono">
              NOVA SYSTEM 9.2.2 // 2026 EDITION
            </div>
          </div>

          {/* Bottom Status & Progress Area */}
          <div className="w-[350px] mt-3 flex flex-col items-center justify-center gap-2">
            
            {/* Subtitle Message */}
            <div className="text-[12px] text-[#262626] tracking-[0.4px] font-medium h-[16px]">
              {phase === 'welcome-splash' ? (
                'Welcome to Mac OS'
              ) : (
                <span className="flex items-center gap-1.5">
                  Starting Up... <span className="font-mono text-[10px] text-[#555]">({progress}%)</span>
                </span>
              )}
            </div>

            {/* Molecule / Barber-Pole Progress Bar (Figma 241:8107) */}
            {phase !== 'welcome-splash' ? (
              <div className="relative w-[180px] h-[12px] bg-[#BBBBBB] border border-[#262626] shadow-[inset_1px_1px_0_#808080,inset_-1px_-1px_0_#FFFFFF] overflow-hidden">
                <div
                  className="h-full mac9-progress-stripe transition-all duration-75 ease-linear border-r border-[#262626]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            ) : (
              <div className="h-[12px]" />
            )}

            {/* Extension Parade (Classic Mac OS marching extensions) */}
            <div className="w-full h-[24px] flex items-center justify-center gap-1.5 px-2 bg-[#D4D4D4] border border-[#A0A0A0] rounded-[2px] overflow-hidden shadow-inner">
              {EXTENSIONS.map((ext, idx) => {
                const isLoaded = idx < loadedExtCount;
                return (
                  <div
                    key={ext.name}
                    title={ext.name}
                    className={`w-[18px] h-[18px] flex items-center justify-center text-[11px] rounded transition-transform duration-150 ${
                      isLoaded
                        ? 'opacity-100 scale-100 bg-[#E8E8E8] shadow-[1px_1px_0_#FFFFFF,inset_1px_1px_0_#999]'
                        : 'opacity-15 scale-75'
                    }`}
                  >
                    <span>{ext.icon}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Skip Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFinish();
            }}
            className="absolute -bottom-8 text-[11px] text-white/80 hover:text-white bg-black/40 hover:bg-black/60 px-3 py-0.5 rounded-full backdrop-blur-sm border border-white/20 transition-all cursor-pointer font-sans"
          >
            [Spacebar or Click: Quick Launch ➔]
          </button>
        </div>
      )}
    </div>
  );
};
