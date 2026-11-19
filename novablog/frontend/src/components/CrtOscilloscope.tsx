'use client';

import React, { useEffect, useRef } from 'react';

interface CrtOscilloscopeProps {
  isSimulating?: boolean;
  frequency?: number;
  label?: string;
  className?: string;
}

export const CrtOscilloscope: React.FC<CrtOscilloscopeProps> = ({
  isSimulating = false,
  frequency = 1,
  label = 'LOOM VIRTUAL THREAD OSCILLOGRAM — CH 1',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // 1. Phosphor Persistence Decay Fade (leaves a subtle tail)
      ctx.fillStyle = 'rgba(3, 15, 6, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // 2. Graticule Grid (Subtle luminous green coordinate mesh)
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.14)';
      const stepX = width / 10;
      const stepY = height / 6;

      ctx.beginPath();
      for (let x = stepX; x < width; x += stepX) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = stepY; y < height; y += stepY) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Center Reference Axes (Dashed)
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Compute Complex Simulated Signal Waveform
      const speed = isSimulating ? 0.08 : 0.035;
      phase += speed * frequency;
      const baseAmp = isSimulating ? height * 0.34 : height * 0.18;

      const points: { x: number; y: number }[] = [];
      for (let x = 0; x < width; x++) {
        const normX = x / width;
        // Superposition: Fundamental + 3rd Harmonic + Simulated I/O Jitter
        const jitter = isSimulating ? Math.sin(normX * 48 + phase * 2.5) * (height * 0.04) : 0;
        const wave =
          Math.sin(normX * Math.PI * 4 * frequency + phase) * (baseAmp * 0.85) +
          Math.sin(normX * Math.PI * 12 - phase * 1.8) * (baseAmp * 0.18) +
          jitter;

        points.push({ x, y: centerY + wave });
      }

      // 4. Pass 1: Broad Phosphor Halo Bloom
      ctx.beginPath();
      ctx.lineWidth = isSimulating ? 5 : 3.5;
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.35)';
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = isSimulating ? 16 : 8;

      for (let i = 0; i < points.length; i++) {
        if (i === 0) ctx.moveTo(points[i].x, points[i].y);
        else ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();

      // 5. Pass 2: Intense Phosphor White-Green Core
      ctx.beginPath();
      ctx.lineWidth = isSimulating ? 2 : 1.4;
      ctx.strokeStyle = '#dcfce7';
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = isSimulating ? 8 : 4;

      for (let i = 0; i < points.length; i++) {
        if (i === 0) ctx.moveTo(points[i].x, points[i].y);
        else ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();

      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isSimulating, frequency]);

  return (
    <div className={`crt-oscilloscope-screen p-2.5 flex flex-col justify-between relative select-none ${className}`}>
      {/* 4 Machined Corner Screws */}
      <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-zinc-400 to-zinc-800 shadow border border-black/50 z-20" />
      <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-zinc-400 to-zinc-800 shadow border border-black/50 z-20" />
      <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-zinc-400 to-zinc-800 shadow border border-black/50 z-20" />
      <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-zinc-400 to-zinc-800 shadow border border-black/50 z-20" />

      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-emerald-400 mb-1 z-10 relative px-1">
        <span className="flex items-center gap-1.5 tracking-wider">
          <span className={`w-1.5 h-1.5 rounded-full ${isSimulating ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500 shadow-[0_0_6px_#10b981]'}`} />
          {label}
        </span>
        <span className="text-[9px] font-mono text-emerald-300/80 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
          {isSimulating ? 'TRIG: AUTO (RUNNING)' : 'TRIG: READY (NORMAL)'}
        </span>
      </div>

      {/* The CRT Canvas Screen */}
      <canvas
        ref={canvasRef}
        width={380}
        height={92}
        className="w-full h-[92px] block rounded z-10"
      />

      {/* Bottom CRT Hardware Scale Readout */}
      <div className="flex items-center justify-between text-[8.5px] font-mono text-emerald-500/70 pt-1 z-10 px-1">
        <span>CH1: 50mV / DIV</span>
        <span className="tracking-widest">COUPLING: DC 1MΩ</span>
        <span>TB: 10µs / DIV</span>
      </div>
    </div>
  );
};
