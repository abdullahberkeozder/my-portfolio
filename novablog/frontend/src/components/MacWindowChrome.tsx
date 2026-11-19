'use client';

import React, { useState } from 'react';
import { playKeyClick, playSwitchToggle } from '@/lib/retroAudio';

interface MacWindowChromeProps {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  className?: string;
}

export const MacWindowChrome: React.FC<MacWindowChromeProps> = ({
  title = 'Nova — Dağıtık Sistemler & Yapay Zeka',
  subtitle = 'Java 22 Loom · Spring AI · pgvector',
  onClose,
  onMinimize,
  onMaximize,
  className = '',
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleClose = () => {
    playKeyClick();
    if (onClose) {
      onClose();
    }
  };

  const handleMinimize = () => {
    playSwitchToggle();
    setIsMinimized(!isMinimized);
    if (onMinimize) {
      onMinimize();
    }
  };

  const handleMaximize = () => {
    playKeyClick();
    setIsMaximized(!isMaximized);
    if (onMaximize) {
      onMaximize();
    }
  };

  return (
    <div className={`mac-titlebar flex items-center justify-between px-3 md:px-4 ${className}`}>
      {/* 1. Left: Classic Glossy Traffic Lights (🔴 🟡 🟢) */}
      <div className="flex items-center gap-2">
        <div className="mac-traffic-lights" title="Mac OS X Pencere Yönetimi">
          <button
            type="button"
            onClick={handleClose}
            className="mac-traffic-dot mac-traffic-close focus:outline-none"
            title="Kapat (Close)"
            aria-label="Kapat"
          />
          <button
            type="button"
            onClick={handleMinimize}
            className="mac-traffic-dot mac-traffic-min focus:outline-none"
            title="Simge Durumuna Küçült (Minimize)"
            aria-label="Küçült"
          />
          <button
            type="button"
            onClick={handleMaximize}
            className="mac-traffic-dot mac-traffic-max focus:outline-none"
            title="Ekranı Kapla / Büyüt (Zoom)"
            aria-label="Büyüt"
          />
        </div>

        {/* Subtle Finder breadcrumb folder */}
        <span className="hidden sm:inline-flex items-center text-[10px] text-zinc-500 font-mono ml-2 select-none">
          📁 ~/nova-workspace
        </span>
      </div>

      {/* 2. Center: Window Title with Letterpress Typography */}
      <div className="flex items-center justify-center text-center overflow-hidden px-2">
        <span className="text-[12px] font-bold text-zinc-800 dark:text-zinc-200 tracking-tight truncate select-none drop-shadow-[0_1px_0_rgba(255,255,255,0.85)] dark:drop-shadow-[0_-1px_0_rgba(0,0,0,0.8)]">
          {title}
        </span>
      </div>

      {/* 3. Right: System Spec & Architecture Pill */}
      <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 select-none">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_#10b981]" />
        <span>{subtitle}</span>
      </div>
    </div>
  );
};
