'use client';

import React, { useState, useRef, useEffect } from 'react';
import { macSound } from '@/lib/retroAudioMac9';

export interface MacOs9WindowProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  minWidth?: number;
  minHeight?: number;
  zIndex: number;
  onFocus: () => void;
  isActive: boolean;
  children: React.ReactNode;
  subtitle?: string;
}

export const MacOs9Window: React.FC<MacOs9WindowProps> = ({
  id,
  title,
  icon,
  isOpen,
  onClose,
  initialPosition = { x: 80, y: 50 },
  initialSize = { width: 860, height: 600 },
  minWidth = 360,
  minHeight = 240,
  zIndex,
  onFocus,
  isActive,
  children,
  subtitle,
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isShaded, setIsShaded] = useState(false); // WindowShade (stor perde rulosu)
  const [isZoomed, setIsZoomed] = useState(false);
  const [prevBounds, setPrevBounds] = useState({ position, size });

  const windowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ isDragging: boolean; startX: number; startY: number; origX: number; origY: number }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });

  const resizeRef = useRef<{ isResizing: boolean; startX: number; startY: number; origW: number; origH: number }>({
    isResizing: false,
    startX: 0,
    startY: 0,
    origW: 0,
    origH: 0,
  });

  // Handle Dragging
  const handleMouseDownTitle = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return; // Don't drag when clicking buttons
    onFocus();
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: position.x,
      origY: position.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragRef.current.isDragging) return;
      const dx = moveEvent.clientX - dragRef.current.startX;
      const dy = moveEvent.clientY - dragRef.current.startY;
      setPosition({
        x: Math.max(10, Math.min(window.innerWidth - 100, dragRef.current.origX + dx)),
        y: Math.max(22, Math.min(window.innerHeight - 40, dragRef.current.origY + dy)), // Clamped below 20px menu bar
      });
    };

    const handleMouseUp = () => {
      dragRef.current.isDragging = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Handle WindowShade (Double click on titlebar or click collapse box)
  const toggleWindowShade = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextState = !isShaded;
    setIsShaded(nextState);
    macSound.playWindowShade(nextState);
  };

  // Handle Zoom (Smart Maximize / Restore)
  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    macSound.playMacClickDown();
    if (!isZoomed) {
      setPrevBounds({ position, size });
      setPosition({ x: 20, y: 30 });
      setSize({
        width: Math.max(minWidth, window.innerWidth - 40),
        height: Math.max(minHeight, window.innerHeight - 60),
      });
      setIsZoomed(true);
    } else {
      setPosition(prevBounds.position);
      setSize(prevBounds.size);
      setIsZoomed(false);
    }
  };

  // Handle Close
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    macSound.playWindowClose();
    onClose();
  };

  // Handle Grow Box (Resize)
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus();
    resizeRef.current = {
      isResizing: true,
      startX: e.clientX,
      startY: e.clientY,
      origW: size.width,
      origH: size.height,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizeRef.current.isResizing) return;
      const dw = moveEvent.clientX - resizeRef.current.startX;
      const dh = moveEvent.clientY - resizeRef.current.startY;
      setSize({
        width: Math.max(minWidth, resizeRef.current.origW + dw),
        height: Math.max(minHeight, resizeRef.current.origH + dh),
      });
    };

    const handleMouseUp = () => {
      resizeRef.current.isResizing = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={windowRef}
      onMouseDown={onFocus}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: isShaded ? 'auto' : `${size.height}px`,
        zIndex,
      }}
      className={`fixed flex flex-col mac9-window-frame shadow-[2px_2px_0_rgba(0,0,0,0.4),0_8px_24px_rgba(0,0,0,0.25)] select-none transition-none ${
        isActive ? 'mac9-window-active ring-1 ring-black/40' : 'mac9-window-inactive opacity-95'
      }`}
    >
      {/* 19px Otantik Platin Başlık Çubuğu */}
      <div
        onMouseDown={handleMouseDownTitle}
        onDoubleClick={toggleWindowShade}
        className={`relative h-[19px] shrink-0 border-b border-[#262626] flex items-center justify-between px-1 cursor-default ${
          isActive ? 'mac9-titlebar-stripes' : 'bg-[#DDDDDD]'
        }`}
      >
        {/* Sol Kapatma Kutusu (Close Box [■]) */}
        <button
          onClick={handleClose}
          className="relative size-[13px] bg-[#CCCCCC] border border-[#262626] shadow-[inset_1px_1px_0_#FFFFFF,inset_-1px_-1px_0_#808080] active:shadow-[inset_1px_1px_0_#404040,inset_-1px_-1px_0_#FFFFFF] active:bg-[#999999] flex items-center justify-center shrink-0"
          title="Kapat"
        >
          <div className="size-[5px] bg-[#262626] opacity-0 active:opacity-100" />
        </button>

        {/* Ortalanmış Başlık ve Gri Yastık Pedi */}
        <div className="absolute inset-x-12 top-0 bottom-0 flex items-center justify-center pointer-events-none">
          <div className="bg-[#CCCCCC] px-2.5 h-[17px] flex items-center gap-1.5 border-x border-[#CCCCCC] shadow-[0_0_1px_#CCCCCC]">
            {icon && <span className="size-3.5 flex items-center justify-center">{icon}</span>}
            <span
              className={`text-[12px] font-['Charcoal',sans-serif] tracking-[0.42px] leading-none whitespace-nowrap ${
                isActive ? 'text-[#262626] font-bold' : 'text-[#808080]'
              }`}
            >
              {title}
            </span>
          </div>
        </div>

        {/* Sağ Kontroller: Zoom [⧉] & WindowShade [▲] */}
        <div className="flex items-center gap-1 shrink-0 z-10">
          {/* Zoom Box [⧉] */}
          <button
            onClick={toggleZoom}
            className="relative size-[13px] bg-[#CCCCCC] border border-[#262626] shadow-[inset_1px_1px_0_#FFFFFF,inset_-1px_-1px_0_#808080] active:shadow-[inset_1px_1px_0_#404040,inset_-1px_-1px_0_#FFFFFF] flex items-center justify-center"
            title="Büyüt / Eski Boyut"
          >
            <div className="size-[7px] border border-[#262626] flex items-start justify-start p-px">
              <div className="size-[2px] bg-[#262626]" />
            </div>
          </button>

          {/* WindowShade Box [▲] */}
          <button
            onClick={toggleWindowShade}
            className="relative size-[13px] bg-[#CCCCCC] border border-[#262626] shadow-[inset_1px_1px_0_#FFFFFF,inset_-1px_-1px_0_#808080] active:shadow-[inset_1px_1px_0_#404040,inset_-1px_-1px_0_#FFFFFF] flex items-center justify-center"
            title={isShaded ? 'Pencereyi Aç' : 'WindowShade (Stor Rulo Yap)'}
          >
            <div className="w-[7px] h-px bg-[#262626] mb-1" />
            <div className="absolute bottom-[2px] w-[5px] h-px bg-[#262626]" />
          </button>
        </div>
      </div>

      {/* Pencere Gövdesi (WindowShade ile katlandığında gizlenir) */}
      {!isShaded && (
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          {/* Durum / Adres Çubuğu */}
          {subtitle && (
            <div className="h-[20px] bg-[#DDDDDD] border-b border-[#262626] px-3 flex items-center justify-between text-[11px] font-['Geneva',sans-serif] text-[#262626] shadow-[inset_0_1px_0_#FFFFFF]">
              <span className="truncate">{subtitle}</span>
              <span className="text-[10px] text-[#808080] font-mono">Mac OS 9.2.2 Web Window</span>
            </div>
          )}

          {/* İçerik Alanı (Kaydırılabilir Web Sayfası) */}
          <div className="flex-1 overflow-auto relative select-text">
            {children}
          </div>

          {/* Sağ Alt Köşe: Grow Box [▨] (Yeniden Boyutlandırma Tutamacı) */}
          <div
            onMouseDown={handleMouseDownResize}
            className="absolute bottom-0 right-0 size-4 bg-[#DDDDDD] border-t border-l border-[#262626] cursor-se-resize flex flex-col items-end justify-end p-0.5 z-20 hover:bg-[#CCCCCC]"
            title="Boyutlandır"
          >
            <div className="w-2.5 h-px bg-[#262626] mb-0.5" />
            <div className="w-1.5 h-px bg-[#262626]" />
          </div>
        </div>
      )}
    </div>
  );
};
