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

      // Phosphor persistence decay fade
      ctx.fillStyle = 'rgba(6, 20, 8, 0.22)';
      ctx.fillRect(0, 0, width, height);

      // Center reference zero-voltage line
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.18)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Oscilloscope beam
      ctx.lineWidth = isSimulating ? 2.5 : 1.8;
      ctx.strokeStyle = '#33ff33';
      ctx.shadowColor = '#33ff33';
      ctx.shadowBlur = isSimulating ? 12 : 6;

      ctx.beginPath();

      const speed = isSimulating ? 0.08 : 0.03;
      phase += speed * frequency;

      const baseAmp = isSimulating ? height * 0.36 : height * 0.18;

      for (let x = 0; x < width; x++) {
        const normX = x / width;
        // Superposition of fundamental + 3rd harmonic + simulated I/O jitter
        const jitter = isSimulating ? Math.sin(normX * 40 + phase * 2) * (height * 0.04) : 0;
        const wave =
          Math.sin(normX * Math.PI * 4 * frequency + phase) * baseAmp * 0.8 +
          Math.sin(normX * Math.PI * 10 - phase * 1.5) * (baseAmp * 0.2) +
          jitter;

        const y = centerY + wave;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // Reset shadow blur for other drawings
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isSimulating, frequency]);

  return (
    <div className={`crt-oscilloscope-screen p-2.5 ${className}`}>
      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-emerald-400 mb-1 z-10 relative">
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isSimulating ? 'bg-emerald-400 animate-ping' : 'bg-emerald-600'}`} />
          {label}
        </span>
        <span className="text-[9px] opacity-75">
          {isSimulating ? 'TRIGGER: AUTO (RUNNING)' : 'TRIGGER: READY'}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={360}
        height={90}
        className="w-full h-[90px] block rounded"
      />
    </div>
  );
};
