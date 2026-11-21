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
      {/* 19px Authentic Platinum Title Bar */}
      <div
        onMouseDown={handleMouseDownTitle}
        onDoubleClick={toggleWindowShade}
        className={`relative h-[19px] shrink-0 border-b border-[#262626] flex items-center justify-between px-1 cursor-default ${
          isActive ? 'mac9-titlebar-stripes' : 'bg-[#DDDDDD]'
        }`}
      >
        {/* Left Close Box (Close Box [■] - Figma Image 6 & 8) */}
        <button
          onClick={handleClose}
          className="relative size-[13px] bg-[#CCCCCC] border border-[#262626] shadow-[inset_1px_1px_0_#FFFFFF,inset_-1px_-1px_0_#808080] active:shadow-[inset_1px_1px_1px_#000000] active:bg-[#999999] flex items-center justify-center shrink-0 group"
          title="Close"
        >
          <div className="size-[5px] bg-[#262626] opacity-0 group-active:opacity-100" />
        </button>

        {/* Centered Title and Platinum Pillow Tab */}
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

        {/* Right Controls: Zoom [⧉] & WindowShade [▲] (Figma Image 6 & 8) */}
        <div className="flex items-center gap-1 shrink-0 z-10">
          {/* Zoom Box [⧉] */}
          <button
            onClick={toggleZoom}
            className="relative size-[13px] bg-[#CCCCCC] border border-[#262626] shadow-[inset_1px_1px_0_#FFFFFF,inset_-1px_-1px_0_#808080] active:shadow-[inset_1px_1px_1px_#000000] flex items-center justify-center shrink-0"
            title="Zoom / Restore"
          >
            <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none">
              <rect x="0.5" y="0.5" width="9" height="9" stroke="#262626" strokeWidth="1" />
              <rect x="2.5" y="2.5" width="4" height="4" fill="#262626" />
            </svg>
          </button>

          {/* WindowShade Box [▲] */}
          <button
            onClick={toggleWindowShade}
            className="relative size-[13px] bg-[#CCCCCC] border border-[#262626] shadow-[inset_1px_1px_0_#FFFFFF,inset_-1px_-1px_0_#808080] active:shadow-[inset_1px_1px_1px_#000000] flex items-center justify-center shrink-0"
            title={isShaded ? 'Expand Window' : 'WindowShade (Collapse)'}
          >
            <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none">
              <rect x="0.5" y="0.5" width="9" height="9" stroke="#262626" strokeWidth="1" />
              <line x1="2" y1="3" x2="8" y2="3" stroke="#262626" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Window Body (Collapsed and hidden when WindowShaded) */}
      {!isShaded && (
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          {/* Status / Address Bar */}
          {subtitle && (
            <div className="h-[20px] bg-[#DDDDDD] border-b border-[#262626] px-3 flex items-center justify-between text-[11px] font-['Geneva',sans-serif] text-[#262626] shadow-[inset_0_1px_0_#FFFFFF]">
              <span className="truncate">{subtitle}</span>
              <span className="text-[10px] text-[#808080] font-mono">Mac OS 9.2.2 Web Window</span>
            </div>
          )}

          {/* Content Area (Scrollable Web Canvas) */}
          <div className="flex-1 overflow-auto relative select-text">
            {children}
          </div>

          {/* Lower Right Corner: Grow Box [▨] (Figma Image 6 & 8 HD 3D Diagonal Ridges) */}
          <div
            onMouseDown={handleMouseDownResize}
            className="absolute bottom-0 right-0 size-[14px] bg-[#DDDDDD] border-t border-l border-[#808080] shadow-[inset_1px_1px_0_#FFFFFF] cursor-se-resize flex items-center justify-center z-20 hover:bg-[#CCCCCC]"
            title="Resize Window"
          >
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
              <line x1="10" y1="2" x2="2" y2="10" stroke="#808080" strokeWidth="1" />
              <line x1="11" y1="3" x2="3" y2="11" stroke="#FFFFFF" strokeWidth="1" />
              <line x1="10" y1="6" x2="6" y2="10" stroke="#808080" strokeWidth="1" />
              <line x1="11" y1="7" x2="7" y2="11" stroke="#FFFFFF" strokeWidth="1" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
