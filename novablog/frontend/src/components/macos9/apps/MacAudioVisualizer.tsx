// src/components/macos9/apps/MacAudioVisualizer.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMusicPlayer } from '@/lib/musicSystem';

type VisualizerMode = 'spectrum' | 'aurora' | 'notes' | 'oscilloscope';

interface FloatingNote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  symbol: string;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

const NOTE_SYMBOLS = ['♪', '♫', '♬', '♩', '𝅘𝅥𝅯', '♯', '♭'];
const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const MacAudioVisualizer: React.FC = () => {
  const { track, isPlaying, currentTime } = useMusicPlayer();
  const [mode, setMode] = useState<VisualizerMode>('spectrum');
  const [sensitivity, setSensitivity] = useState<number>(1.2);
  const [colorTheme, setColorTheme] = useState<'vista' | 'neon' | 'fire' | 'emerald'>('vista');
  const [activeNotes, setActiveNotes] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Bars physics state
  const peaksRef = useRef<number[]>(new Array(32).fill(0));
  const peakHoldRef = useRef<number[]>(new Array(32).fill(0));
  const floatingNotesRef = useRef<FloatingNote[]>([]);
  const phaseRef = useRef<number>(0);

  // Animation frame loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let beatCounter = 0;

    const render = () => {
      phaseRef.current += isPlaying ? 0.04 : 0.01;
      beatCounter += 1;

      const width = canvas.width;
      const height = canvas.height;

      // Clear with dark atmospheric background
      ctx.fillStyle = '#060A10';
      ctx.fillRect(0, 0, width, height);

      // Subtle background grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Procedural audio frequency generation synced to song time and rhythm
      const numBands = 32;
      const currentBars: number[] = [];
      const bpm = 120;
      const beatProgress = ((currentTime * (bpm / 60)) % 1);
      const isKick = beatProgress < 0.15 && isPlaying;

      const illuminatedNotes: string[] = [];

      for (let i = 0; i < numBands; i++) {
        let val = 0;
        if (isPlaying) {
          // Dynamic synth wave simulation
          const bassBoost = i < 6 ? Math.sin(phaseRef.current * 4) * 0.4 + 0.6 : 0.3;
          const midMelody = Math.sin(phaseRef.current * 2 + i * 0.4) * 0.35 + 0.45;
          const highSparkle = Math.cos(phaseRef.current * 5 + i * 0.8) * 0.25 + 0.35;
          const beatPunch = isKick && i < 10 ? 0.35 : 0;

          val = (bassBoost * 0.4 + midMelody * 0.4 + highSparkle * 0.2 + beatPunch) * sensitivity;
          val = Math.max(0.08, Math.min(0.98, val * (0.8 + Math.random() * 0.15)));
        } else {
          val = 0.05 + Math.sin(phaseRef.current + i * 0.2) * 0.03;
        }

        currentBars.push(val);

        // Calculate peak hold
        if (val > peaksRef.current[i]) {
          peaksRef.current[i] = val;
          peakHoldRef.current[i] = 12; // hold for 12 frames
        } else if (peakHoldRef.current[i] > 0) {
          peakHoldRef.current[i] -= 1;
        } else {
          peaksRef.current[i] = Math.max(0, peaksRef.current[i] - 0.015);
        }

        // Map band to musical pitch
        if (val > 0.45) {
          const noteIndex = (i * 2 + Math.floor(currentTime * 2)) % 12;
          const noteName = PITCH_CLASSES[noteIndex];
          if (!illuminatedNotes.includes(noteName)) {
            illuminatedNotes.push(noteName);
          }
        }
      }

      setActiveNotes(illuminatedNotes);

      // ======================================================================
      // 1. SPECTRUM BARS & PEAKS (Winamp / Windows Media Player Classic)
      // ======================================================================
      if (mode === 'spectrum') {
        const barMargin = 3;
        const totalBarWidth = (width - 40) / numBands;
        const barWidth = Math.max(2, totalBarWidth - barMargin);

        for (let i = 0; i < numBands; i++) {
          const barHeight = currentBars[i] * (height - 80);
          const x = 20 + i * totalBarWidth;
          const y = height - 50 - barHeight;

          // Gradient color by theme
          const grad = ctx.createLinearGradient(0, height - 50, 0, y);
          if (colorTheme === 'vista') {
            grad.addColorStop(0, '#00D2FF');
            grad.addColorStop(0.5, '#3A7BD5');
            grad.addColorStop(1, '#9B51E0');
          } else if (colorTheme === 'neon') {
            grad.addColorStop(0, '#00FFA3');
            grad.addColorStop(0.6, '#00B8FF');
            grad.addColorStop(1, '#D946EF');
          } else if (colorTheme === 'fire') {
            grad.addColorStop(0, '#F59E0B');
            grad.addColorStop(0.5, '#EF4444');
            grad.addColorStop(1, '#F43F5E');
          } else {
            grad.addColorStop(0, '#10B981');
            grad.addColorStop(0.7, '#34D399');
            grad.addColorStop(1, '#A7F3D0');
          }

          // Draw Bar
          ctx.fillStyle = grad;
          ctx.fillRect(x, y, barWidth, barHeight);

          // Draw Segment lines (Classic LED style)
          ctx.fillStyle = 'rgba(6, 10, 16, 0.45)';
          for (let segY = height - 50; segY > y; segY -= 4) {
            ctx.fillRect(x, segY, barWidth, 1);
          }

          // Draw Peak Cap (Floating white cap)
          const peakY = height - 50 - peaksRef.current[i] * (height - 80);
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#00D2FF';
          ctx.shadowBlur = 4;
          ctx.fillRect(x, Math.max(10, peakY - 2), barWidth, 2);
          ctx.shadowBlur = 0;
        }
      }

      // ======================================================================
      // 2. VISTA AURORA & LIQUID WAVEFORM (Windows Vista Ambience)
      // ======================================================================
      else if (mode === 'aurora') {
        const centerY = (height - 50) / 2;

        // Flowing Aurora Ribbon
        for (let layer = 0; layer < 3; layer++) {
          ctx.beginPath();
          ctx.moveTo(0, centerY);

          for (let x = 0; x <= width; x += 10) {
            const freqVal = currentBars[Math.floor((x / width) * numBands)] || 0.2;
            const waveY =
              centerY +
              Math.sin(phaseRef.current * (1.5 + layer * 0.5) + x * 0.015) * (60 + layer * 20) * freqVal +
              Math.cos(phaseRef.current * 0.8 + x * 0.02) * 25;
            ctx.lineTo(x, waveY);
          }

          ctx.lineTo(width, height - 50);
          ctx.lineTo(0, height - 50);
          ctx.closePath();

          const auroraGrad = ctx.createLinearGradient(0, 0, width, height);
          if (layer === 0) {
            auroraGrad.addColorStop(0, 'rgba(0, 210, 255, 0.25)');
            auroraGrad.addColorStop(1, 'rgba(155, 81, 224, 0.2)');
          } else if (layer === 1) {
            auroraGrad.addColorStop(0, 'rgba(58, 123, 213, 0.3)');
            auroraGrad.addColorStop(1, 'rgba(0, 255, 163, 0.2)');
          } else {
            auroraGrad.addColorStop(0, 'rgba(217, 70, 239, 0.2)');
            auroraGrad.addColorStop(1, 'rgba(0, 210, 255, 0.25)');
          }

          ctx.fillStyle = auroraGrad;
          ctx.fill();
        }

        // Glowing center oscilloscope line
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        for (let x = 0; x <= width; x += 5) {
          const barIdx = Math.floor((x / width) * numBands);
          const amp = currentBars[barIdx] * 70;
          const y = centerY + Math.sin(phaseRef.current * 3 + x * 0.03) * amp;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // ======================================================================
      // 3. MELODIC PARTICLES & DANCING NOTES (iTunes / Alchemy Visualizer)
      // ======================================================================
      else if (mode === 'notes') {
        const centerX = width / 2;
        const centerY = (height - 50) / 2;

        // Spawn new floating notes on beats
        if (isPlaying && (isKick || Math.random() < 0.25)) {
          const sym = NOTE_SYMBOLS[Math.floor(Math.random() * NOTE_SYMBOLS.length)];
          const angle = Math.random() * Math.PI * 2;
          const speed = 1.5 + Math.random() * 3;
          floatingNotesRef.current.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            symbol: sym,
            size: 16 + Math.random() * 18,
            color: ['#00D2FF', '#9B51E0', '#00FFA3', '#F59E0B', '#F43F5E'][
              Math.floor(Math.random() * 5)
            ],
            alpha: 1,
            life: 0,
            maxLife: 60 + Math.random() * 40,
          });
        }

        // Center Pulsing Sound Core
        const avgAmp = currentBars.reduce((a, b) => a + b, 0) / numBands;
        const coreRadius = 35 + avgAmp * 45;

        const radial = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, coreRadius);
        radial.addColorStop(0, '#FFFFFF');
        radial.addColorStop(0.3, '#00D2FF');
        radial.addColorStop(0.7, '#9B51E0');
        radial.addColorStop(1, 'transparent');

        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
        ctx.fill();

        // Update & Render Floating Notes
        for (let i = floatingNotesRef.current.length - 1; i >= 0; i--) {
          const fn = floatingNotesRef.current[i];
          fn.x += fn.vx;
          fn.y += fn.vy;
          fn.life += 1;
          fn.alpha = 1 - fn.life / fn.maxLife;

          ctx.font = `bold ${fn.size}px monospace`;
          ctx.fillStyle = fn.color;
          ctx.globalAlpha = Math.max(0, fn.alpha);
          ctx.shadowColor = fn.color;
          ctx.shadowBlur = 8;
          ctx.fillText(fn.symbol, fn.x, fn.y);
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;

          if (fn.life >= fn.maxLife) {
            floatingNotesRef.current.splice(i, 1);
          }
        }
      }

      // ======================================================================
      // 4. NEON OSCILLOSCOPE (Vintage Cathode Ray Tube)
      // ======================================================================
      else if (mode === 'oscilloscope') {
        const centerY = (height - 50) / 2;

        ctx.beginPath();
        ctx.moveTo(0, centerY);

        for (let x = 0; x <= width; x += 3) {
          const normX = x / width;
          const bandVal = currentBars[Math.floor(normX * numBands)] || 0.1;
          const y =
            centerY +
            Math.sin(phaseRef.current * 5 + normX * 25) * bandVal * 65 +
            Math.sin(phaseRef.current * 10 + normX * 50) * bandVal * 25;
          ctx.lineTo(x, y);
        }

        ctx.strokeStyle = '#00FF66';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00FF66';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Faint ghost persistence trace
        ctx.strokeStyle = 'rgba(0, 255, 102, 0.2)';
        ctx.lineWidth = 6;
        ctx.stroke();
      }

      // ======================================================================
      // BOTTOM HUD: MUSICAL NOTE MATRIX (Real-time Note Reflectors)
      // ======================================================================
      const matrixY = height - 32;
      ctx.fillStyle = '#080E18';
      ctx.fillRect(0, matrixY, width, 32);
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, matrixY);
      ctx.lineTo(width, matrixY);
      ctx.stroke();

      const noteSpacing = width / 12;
      PITCH_CLASSES.forEach((note, idx) => {
        const isLit = illuminatedNotes.includes(note) && isPlaying;
        const noteX = idx * noteSpacing + noteSpacing / 2;

        // LED dot above letter
        ctx.fillStyle = isLit ? '#00FFFF' : '#1E293B';
        if (isLit) {
          ctx.shadowColor = '#00FFFF';
          ctx.shadowBlur = 6;
        }
        ctx.beginPath();
        ctx.arc(noteX, matrixY + 7, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Note character
        ctx.font = `bold ${isLit ? 11 : 9}px monospace`;
        ctx.fillStyle = isLit ? '#FFFFFF' : '#64748B';
        ctx.textAlign = 'center';
        ctx.fillText(note, noteX, matrixY + 22);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [mode, sensitivity, colorTheme, isPlaying, currentTime]);

  return (
    <div className="flex flex-col h-full bg-[#080E18] text-[#E2E8F0] font-mono text-[11px] rounded-[3px] border border-[#1E293B] shadow-2xl select-none relative overflow-hidden">
      {/* Top Visualizer Control Bar */}
      <div className="px-3 py-2 bg-[#0F172A] border-b border-[#1E293B] flex items-center justify-between gap-2 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isPlaying
                ? 'bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.9)]'
                : 'bg-gray-600'
            }`}
          />
          <span className="font-bold text-xs tracking-wider text-cyan-300">
            AUDIO SPECTRUM & NOTE MATRIX
          </span>
          <span className="text-[9px] px-1.5 py-0.2 bg-[#1E293B] border border-cyan-500/30 rounded text-cyan-200">
            Vista / Mac OS 9 Engine
          </span>
        </div>

        {/* Visualizer Modes */}
        <div className="flex items-center gap-1">
          {(
            [
              { id: 'spectrum', label: '📊 Bars & EQ' },
              { id: 'aurora', label: '🌊 Vista Aurora' },
              { id: 'notes', label: '♪ Note Trails' },
              { id: 'oscilloscope', label: '⚡ Oscilloscope' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-2 py-0.5 rounded-[2px] text-[10px] transition-all font-bold ${
                mode === m.id
                  ? 'bg-cyan-600 text-white shadow-[0_0_8px_rgba(8,145,178,0.7)]'
                  : 'bg-[#1E293B] text-gray-400 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Visualizer Canvas Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={720}
          height={320}
          className="w-full h-full object-cover block"
        />

        {/* Floating HUD Metadata Tag in Upper Left */}
        <div className="absolute top-2.5 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded border border-white/10 pointer-events-none text-[10px]">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
            <span>🎵</span>
            <span className="truncate max-w-[200px]">{track.title}</span>
          </div>
          <div className="text-[9px] text-gray-400 truncate">{track.artist}</div>
          <div className="flex items-center gap-2 mt-1 text-[8px] text-gray-500 font-sans uppercase">
            <span className="text-emerald-400 font-bold">● Beat Sync 120 BPM</span>
            <span>• Key: E Maj</span>
            <span>• 32-Band FFT</span>
          </div>
        </div>

        {/* Floating Active Notes Pill in Upper Right */}
        <div className="absolute top-2.5 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10 pointer-events-none text-[9px] flex items-center gap-1">
          <span className="text-gray-400">Harmonics:</span>
          {activeNotes.length > 0 ? (
            activeNotes.slice(0, 5).map((n) => (
              <span
                key={n}
                className="px-1 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-400/40 font-bold"
              >
                {n}
              </span>
            ))
          ) : (
            <span className="text-gray-500">Scanning...</span>
          )}
        </div>
      </div>

      {/* Bottom Tuning Ribbon */}
      <div className="px-3 py-1.5 bg-[#0F172A] border-t border-[#1E293B] flex items-center justify-between text-[10px] text-gray-400 shrink-0">
        {/* Color Palette Switcher */}
        <div className="flex items-center gap-2">
          <span>Palette:</span>
          {(['vista', 'neon', 'fire', 'emerald'] as const).map((pal) => (
            <button
              key={pal}
              onClick={() => setColorTheme(pal)}
              className={`px-1.5 py-0.2 rounded text-[9px] uppercase ${
                colorTheme === pal
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'bg-[#1E293B] text-gray-400 hover:text-white'
              }`}
            >
              {pal}
            </button>
          ))}
        </div>

        {/* Sensitivity Gain Slider */}
        <div className="flex items-center gap-2">
          <span>Gain:</span>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={sensitivity}
            onChange={(e) => setSensitivity(parseFloat(e.target.value))}
            className="w-20 h-1 bg-[#334155] rounded appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="font-mono text-cyan-300 text-[9px]">{sensitivity.toFixed(1)}x</span>
        </div>
      </div>
    </div>
  );
};
