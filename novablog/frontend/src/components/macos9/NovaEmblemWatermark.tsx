'use client';

import React, { useState, useRef, useCallback } from 'react';
import { WallpaperTheme } from './MacAppearancePanel';
import { macSound } from '@/lib/retroAudioMac9';

export interface NovaEmblemWatermarkProps {
  hasOpenWindows?: boolean;
  wallpaper?: WallpaperTheme;
  isNightMode?: boolean;
  onOpenAppearance?: () => void;
}

export const NovaEmblemWatermark: React.FC<NovaEmblemWatermarkProps> = ({
  hasOpenWindows = false,
  wallpaper = 'sonata-purple',
  isNightMode = false,
  onOpenAppearance,
}) => {
  const plaqueRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number; glintX: number; glintY: number }>({
    x: 0,
    y: 0,
    glintX: 50,
    glintY: 50,
  });
  const [isHovered, setIsHovered] = useState(false);

  // Optical wallpaper grouping for contrast ergonomics
  const isBrightWallpaper = !isNightMode && (wallpaper === 'quantum-foam' || wallpaper === 'macos-bg');
  const isHighPattern = wallpaper === 'blue-dalmatian' || wallpaper === 'capsules' || wallpaper === 'tub';
  const isDark = isNightMode || wallpaper === 'dark-carbon' || wallpaper === 'heavy-petal' || wallpaper === 'indigo-foam';

  // Interactive 3D tilt and specular sheen
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!plaqueRef.current) return;
    const rect = plaqueRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = x / rect.width;
    const normY = y / rect.height;

    // Subtle 3D tilt: max 6 degrees
    const rotateY = (normX - 0.5) * 10;
    const rotateX = (0.5 - normY) * 10;

    setTilt({
      x: rotateX,
      y: rotateY,
      glintX: Math.round(normX * 100),
      glintY: Math.round(normY * 100),
    });
  }, []);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0, glintX: 50, glintY: 50 });
  };

  const handleDoubleClick = () => {
    try {
      macSound.playMacClickDown();
    } catch {}
    if (onOpenAppearance) {
      onOpenAppearance();
    }
  };

  // State-aware container styling (soft ghost in focus state, crisp hero in ambient state)
  const containerStateClass = hasOpenWindows
    ? 'opacity-20 scale-[0.98]'
    : isHovered
    ? 'opacity-100 scale-[1.01]'
    : 'opacity-85 scale-100';

  return (
    <div
      className={`pointer-events-none select-none flex flex-col items-center justify-center text-center transition-all duration-500 ease-out ${containerStateClass}`}
      style={{ perspective: '1000px' }}
    >
      {/* =========================================================================
          POWER MAC G4 CUBE & STUDIO DISPLAY LUCITE ACRYLIC PLAQUE
          - 135° Chamfered Edge
          - Sub-pixel Prismatic Chromatic Dispersion (Bondi Cyan / Grape / Tangerine)
          - 4x Torx T8 Countersunk Screws with Lathe Rings
          - Interactive Real-time Specular Sheen & 3D Tilt
          ========================================================================= */}
      <div
        ref={plaqueRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
        title="Nova Architecture Emblem — Çift tıklayarak Appearance kontrol panelini açabilirsiniz"
        className={`pointer-events-auto relative px-9 py-6 rounded-2xl transition-transform duration-200 ease-out cursor-default ${
          isHighPattern ? 'backdrop-blur-[20px]' : 'backdrop-blur-[14px]'
        }`}
        style={{
          transform: isHovered
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(12px)`
            : 'rotateX(0deg) rotateY(0deg) translateZ(0px)',
          background: isDark
            ? 'linear-gradient(135deg, rgba(20, 24, 33, 0.88) 0%, rgba(12, 14, 20, 0.92) 50%, rgba(6, 8, 12, 0.96) 100%)'
            : isBrightWallpaper
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.55) 0%, rgba(245, 248, 255, 0.38) 50%, rgba(235, 240, 252, 0.25) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.06) 50%, rgba(240, 245, 255, 0.03) 100%)',
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.14)'
            : isBrightWallpaper
            ? '1px solid rgba(0, 0, 0, 0.14)'
            : '1px solid rgba(255, 255, 255, 0.24)',
          boxShadow: isDark
            ? `
              /* 135° White Specular Rim */
              inset 0 1px 1px 0 rgba(255, 255, 255, 0.35),
              /* Bondi Cyan & Grape Micro Dispersion */
              inset 1px 1.2px 2px 0 rgba(56, 189, 248, 0.35),
              inset -1px -1px 2px 0 rgba(251, 191, 36, 0.20),
              /* Deep Obsidian Shadows */
              0 24px 48px -12px rgba(0, 0, 0, 0.75),
              0 4px 12px 0 rgba(0, 0, 0, 0.45)
            `
            : isBrightWallpaper
            ? `
              /* Clean Daylight Cameo Specular */
              inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.95),
              inset 1px 1px 2px 0 rgba(56, 189, 248, 0.25),
              inset -1px -1px 2px 0 rgba(0, 0, 0, 0.10),
              /* Light Ambient Shadow */
              0 20px 40px -10px rgba(0, 0, 0, 0.12),
              0 3px 8px 0 rgba(0, 0, 0, 0.06)
            `
            : `
              /* 135° Pure Specular Peak */
              inset 0 1px 1px 0 rgba(255, 255, 255, 0.90),
              /* Bondi Cyan Micro Dispersion (Top-Left) */
              inset 1px 1.2px 2px 0 rgba(56, 189, 248, 0.42),
              /* Grape Violet Refraction */
              inset 2px 2px 3.5px -1px rgba(168, 85, 247, 0.32),
              /* Tangerine Gold Bounce (Bottom-Right) */
              inset -1px -1px 2px 0 rgba(251, 191, 36, 0.30),
              /* CRT Lead Glass Deep Ambient Shadow */
              0 24px 52px -10px rgba(0, 0, 0, 0.55),
              0 4px 10px 0 rgba(0, 0, 0, 0.32)
            `,
        }}
      >
        {/* ================= TORX T8 COUNTERSUNK CORNER FASTENERS ================= */}
        {/* Top-Left Fastener */}
        <div className="absolute top-2.5 left-2.5 w-3 h-3 pointer-events-none opacity-70">
          <svg className="w-full h-full" viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="6" fill={isDark ? '#2D3748' : '#CBD5E1'} stroke={isDark ? '#1A202C' : '#94A3B8'} strokeWidth="0.8" />
            <circle cx="7" cy="7" r="4.2" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
            <circle cx="7" cy="7" r="2.2" fill={isDark ? '#111827' : '#475569'} />
          </svg>
        </div>
        {/* Top-Right Fastener */}
        <div className="absolute top-2.5 right-2.5 w-3 h-3 pointer-events-none opacity-70">
          <svg className="w-full h-full" viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="6" fill={isDark ? '#2D3748' : '#CBD5E1'} stroke={isDark ? '#1A202C' : '#94A3B8'} strokeWidth="0.8" />
            <circle cx="7" cy="7" r="4.2" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
            <circle cx="7" cy="7" r="2.2" fill={isDark ? '#111827' : '#475569'} />
          </svg>
        </div>
        {/* Bottom-Left Fastener */}
        <div className="absolute bottom-2.5 left-2.5 w-3 h-3 pointer-events-none opacity-70">
          <svg className="w-full h-full" viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="6" fill={isDark ? '#2D3748' : '#CBD5E1'} stroke={isDark ? '#1A202C' : '#94A3B8'} strokeWidth="0.8" />
            <circle cx="7" cy="7" r="4.2" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
            <circle cx="7" cy="7" r="2.2" fill={isDark ? '#111827' : '#475569'} />
          </svg>
        </div>
        {/* Bottom-Right Fastener */}
        <div className="absolute bottom-2.5 right-2.5 w-3 h-3 pointer-events-none opacity-70">
          <svg className="w-full h-full" viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="6" fill={isDark ? '#2D3748' : '#CBD5E1'} stroke={isDark ? '#1A202C' : '#94A3B8'} strokeWidth="0.8" />
            <circle cx="7" cy="7" r="4.2" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
            <circle cx="7" cy="7" r="2.2" fill={isDark ? '#111827' : '#475569'} />
          </svg>
        </div>

        {/* Dynamic Interactive Specular Sheen (Moves with cursor on hover) */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.85 : 0.35,
            background: `radial-gradient(circle 140px at ${tilt.glintX}% ${tilt.glintY}%, rgba(255, 255, 255, ${
              isDark ? '0.22' : '0.45'
            }), transparent 75%)`,
          }}
        />

        {/* Diagonal Optical Acrylic Sheen Stripe */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
          style={{ opacity: isDark ? 0.15 : 0.28 }}
        >
          <div
            className="w-[200%] h-24 absolute -top-8 -left-1/2 rotate-[-25deg]"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 100%)',
            }}
          />
        </div>

        {/* =========================================================================
            8-POINT CHISELED SUPERNOVA DIAMOND COMPASS STAR
            - 16 Facets with 135° Directional Lighting
            - Golden Ratio Proportions (R_cardinal = 46, R_diagonal = 27, R_valley = 9.5)
            - Elevated Diamond Hub Core with Pure Specular Glint
            ========================================================================= */}
        <div className="flex items-center justify-center mb-2.5">
          <svg
            className="w-16 h-16 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] transition-transform duration-300"
            viewBox="0 0 128 128"
            fill="none"
          >
            <defs>
              {/* Platinum Lit Facet Gradient (NW 135° key light) */}
              <linearGradient id="facetLitNorth" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
                <stop offset="40%" stopColor="#F1F5F9" stopOpacity="0.88" />
                <stop offset="80%" stopColor="#E2E8F0" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.65" />
              </linearGradient>

              {/* Shaded Pewter / Steel Facet Gradient */}
              <linearGradient id="facetDarkNorth" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#64748B" stopOpacity="0.80" />
                <stop offset="85%" stopColor="#475569" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#334155" stopOpacity="0.90" />
              </linearGradient>

              {/* Bondi Blue & Grape Chromatic Facet Accent (Finder hommage) */}
              <linearGradient id="facetBondiAccent" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0.55" />
              </linearGradient>

              {/* Deep Cobalt / Violet Shadow Facet */}
              <linearGradient id="facetGrapeShadow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#475569" stopOpacity="0.75" />
                <stop offset="60%" stopColor="#1E1B4B" stopOpacity="0.80" />
                <stop offset="100%" stopColor="#0F172A" stopOpacity="0.90" />
              </linearGradient>

              {/* Central Diamond Core Gemstone */}
              <radialGradient id="emblemHubCore" cx="42%" cy="38%" r="58%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="35%" stopColor="#F8FAFC" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#94A3B8" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#334155" stopOpacity="0.85" />
              </radialGradient>
            </defs>

            {/* 16 Facets of the 8-Point Supernova Diamond Star */}
            {/* 1. North Ray (V0: 64, 18 | V15: 60.36, 55.22 | V1: 67.64, 55.22) */}
            <polygon points="64,64 60.36,55.22 64,18" fill="url(#facetLitNorth)" />
            <polygon points="64,64 64,18 67.64,55.22" fill="url(#facetDarkNorth)" />

            {/* 2. NE Ray (V2: 83.09, 44.91 | V1: 67.64, 55.22 | V3: 72.78, 60.36) */}
            <polygon points="64,64 67.64,55.22 83.09,44.91" fill="url(#facetBondiAccent)" />
            <polygon points="64,64 83.09,44.91 72.78,60.36" fill="url(#facetGrapeShadow)" />

            {/* 3. East Ray (V4: 110, 64 | V3: 72.78, 60.36 | V5: 72.78, 67.64) */}
            <polygon points="64,64 72.78,60.36 110,64" fill="url(#facetLitNorth)" />
            <polygon points="64,64 110,64 72.78,67.64" fill="url(#facetDarkNorth)" />

            {/* 4. SE Ray (V6: 83.09, 83.09 | V5: 72.78, 67.64 | V7: 67.64, 72.78) */}
            <polygon points="64,64 72.78,67.64 83.09,83.09" fill="url(#facetDarkNorth)" />
            <polygon points="64,64 83.09,83.09 67.64,72.78" fill="url(#facetLitNorth)" />

            {/* 5. South Ray (V8: 64, 110 | V7: 67.64, 72.78 | V9: 60.36, 72.78) */}
            <polygon points="64,64 67.64,72.78 64,110" fill="url(#facetGrapeShadow)" />
            <polygon points="64,64 64,110 60.36,72.78" fill="url(#facetLitNorth)" />

            {/* 6. SW Ray (V10: 44.91, 83.09 | V9: 60.36, 72.78 | V11: 55.22, 67.64) */}
            <polygon points="64,64 60.36,72.78 44.91,83.09" fill="url(#facetDarkNorth)" />
            <polygon points="64,64 44.91,83.09 55.22,67.64" fill="url(#facetLitNorth)" />

            {/* 7. West Ray (V12: 18, 64 | V11: 55.22, 67.64 | V13: 55.22, 60.36) */}
            <polygon points="64,64 55.22,67.64 18,64" fill="url(#facetDarkNorth)" />
            <polygon points="64,64 18,64 55.22,60.36" fill="url(#facetLitNorth)" />

            {/* 8. NW Ray (V14: 44.91, 44.91 | V13: 55.22, 60.36 | V15: 60.36, 55.22) */}
            <polygon points="64,64 55.22,60.36 44.91,44.91" fill="url(#facetLitNorth)" />
            <polygon points="64,64 44.91,44.91 60.36,55.22" fill="url(#facetLitNorth)" />

            {/* Central Diamond Facet Cap */}
            <polygon points="64,57 71,64 64,71 57,64" fill="url(#emblemHubCore)" stroke="rgba(255,255,255,0.7)" strokeWidth="0.6" />
            <circle cx="64" cy="64" r="1.8" fill="#FFFFFF" />
            <line x1="64" y1="59" x2="64" y2="69" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.9" />
            <line x1="59" y1="64" x2="69" y2="64" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.9" />
          </svg>
        </div>

        {/* =========================================================================
            CHISELED WORDMARK: "✧  N O V A  ✧"
            - Flanked by 4-point Astroid Diamond Starbursts
            - Apple Garamond / Trajan Roman Majuscules with +0.25em tracking
            - 135° Chiseled Relief Shadows
            ========================================================================= */}
        <div className="flex items-center justify-center gap-3">
          {/* Left Astroid Diamond Starburst */}
          <svg className="w-3.5 h-3.5 text-white opacity-80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8,1 Q8,8 15,8 Q8,8 8,15 Q8,8 1,8 Q8,8 8,1 Z" />
          </svg>

          <h1
            className={`font-['Apple_Garamond',Garamond,Georgia,serif] tracking-[0.25em] text-[24px] font-bold uppercase transition-colors duration-300 ${
              isBrightWallpaper
                ? 'text-[#1E293B] [text-shadow:0_1px_0_rgba(255,255,255,0.9),0_2px_4px_rgba(0,0,0,0.15)]'
                : 'text-[#FFFFFF] [text-shadow:0_1px_1px_rgba(255,255,255,0.8),0_-1px_1px_rgba(0,0,0,0.5),0_2px_6px_rgba(0,0,0,0.75)]'
            }`}
          >
            N O V A
          </h1>

          {/* Right Astroid Diamond Starburst */}
          <svg className="w-3.5 h-3.5 text-white opacity-80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8,1 Q8,8 15,8 Q8,8 8,15 Q8,8 1,8 Q8,8 8,1 Z" />
          </svg>
        </div>

        {/* Subtitle / Department Definition */}
        <p
          className={`font-['Charcoal',sans-serif] text-[10.5px] font-medium tracking-[0.20em] uppercase mt-1 transition-all duration-300 ${
            hasOpenWindows ? 'opacity-0 h-0 overflow-hidden mt-0' : 'opacity-85'
          } ${
            isBrightWallpaper
              ? 'text-[#334155] [text-shadow:0_1px_0_rgba(255,255,255,0.8)]'
              : 'text-[#E2E8F0] [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]'
          }`}
        >
          Modern Mühendislik & Sistem Mimarisi
        </p>

        {/* =========================================================================
            HARDWARE SPECIFICATION SEAL & APPLE SPECTRUM BADGE
            - CNC Machined Groove Hairline
            - Apple 6-Color Spectrum Micro-Dot Dot Accent
            - "MAC OS 9.2.2 PLATINUM ARCHITECTURE" • "MOD. NV-2001"
            ========================================================================= */}
        {!hasOpenWindows && (
          <div className="mt-3 pt-2.5 flex flex-col items-center gap-1.5 transition-colors duration-300">
            {/* Machined Hairline Divider Groove with Central Spectrum Dot */}
            <div className="w-full relative flex items-center justify-center">
              <div
                className="w-full h-[1px]"
                style={{
                  background: isDark
                    ? 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 30%, rgba(255,255,255,0.22) 70%, transparent 100%)'
                    : isBrightWallpaper
                    ? 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.18) 30%, rgba(0,0,0,0.18) 70%, transparent 100%)'
                    : 'linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.45) 25%, rgba(168,85,247,0.45) 75%, transparent 100%)',
                }}
              />
              {/* Apple 6-Color Spectrum Micro Emblem Badge in Center */}
              <div className="absolute px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center gap-0.5 shadow-sm">
                <span className="w-1 h-1 rounded-full bg-[#61BB46]" />
                <span className="w-1 h-1 rounded-full bg-[#FDB827]" />
                <span className="w-1 h-1 rounded-full bg-[#F58220]" />
                <span className="w-1 h-1 rounded-full bg-[#E03A3E]" />
                <span className="w-1 h-1 rounded-full bg-[#963D97]" />
                <span className="w-1 h-1 rounded-full bg-[#009DDC]" />
              </div>
            </div>

            {/* Micro Specification Grid */}
            <div className="mt-1 flex items-center justify-center gap-2 text-[9px] font-mono tracking-widest uppercase opacity-80">
              <span className={isBrightWallpaper ? 'text-[#475569]' : 'text-[#CBD5E1]'}>
                MAC OS 9.2.2 PLATINUM ARCHITECTURE
              </span>
              <span className="text-[7px] opacity-50">•</span>
              <span className={isBrightWallpaper ? 'text-[#64748B]' : 'text-[#94A3B8]'}>
                MOD. NV-2001
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
