'use client';

import React from 'react';

interface AnalogVuMeterProps {
  label: string;
  sublabel?: string;
  value: number; // 0 to 100
  displayValue?: string;
  unit?: string;
  className?: string;
}

export const AnalogVuMeter: React.FC<AnalogVuMeterProps> = ({
  label,
  sublabel = 'CALIBRATED VU',
  value,
  displayValue,
  unit = '%',
  className = '',
}) => {
  // Clamp value between 0 and 100
  const clamped = Math.max(0, Math.min(100, value));
  // Needle swings from -46deg to +46deg
  const angle = -46 + (clamped / 100) * 92;
  const isPeak = clamped >= 80;

  return (
    <div className={`analog-vu-meter-dial p-3 flex flex-col justify-between select-none relative ${className}`}>
      {/* 4 Machined Corner Screw Rivets */}
      <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-zinc-300 via-zinc-500 to-zinc-800 shadow-[0_1px_1px_rgba(0,0,0,0.8)] border border-black/40 flex items-center justify-center pointer-events-none opacity-80 z-10">
        <div className="w-1 h-[0.5px] bg-zinc-900 rotate-45" />
      </div>
      <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-zinc-300 via-zinc-500 to-zinc-800 shadow-[0_1px_1px_rgba(0,0,0,0.8)] border border-black/40 flex items-center justify-center pointer-events-none opacity-80 z-10">
        <div className="w-1 h-[0.5px] bg-zinc-900 -rotate-45" />
      </div>
      <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-zinc-300 via-zinc-500 to-zinc-800 shadow-[0_1px_1px_rgba(0,0,0,0.8)] border border-black/40 flex items-center justify-center pointer-events-none opacity-80 z-10">
        <div className="w-1 h-[0.5px] bg-zinc-900 -rotate-12" />
      </div>
      <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-zinc-300 via-zinc-500 to-zinc-800 shadow-[0_1px_1px_rgba(0,0,0,0.8)] border border-black/40 flex items-center justify-center pointer-events-none opacity-80 z-10">
        <div className="w-1 h-[0.5px] bg-zinc-900 rotate-75" />
      </div>

      {/* Top Header: Vintage Plate Typographic Header */}
      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-zinc-300 px-1 z-10">
        <span className="tracking-wider uppercase text-zinc-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          {/* Hardware Peak Warning Lamp */}
          <span
            className={`w-1.5 h-1.5 rounded-full transition-all duration-150 ${
              isPeak
                ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse'
                : 'bg-rose-950 border border-rose-900/50'
            }`}
            title={isPeak ? 'PEAK OVERLOAD' : 'NORMAL'}
          />
          <span className="text-emerald-400 font-mono text-[11px] font-extrabold bg-black/50 px-1.5 py-0.2 rounded border border-emerald-500/20 shadow-inner">
            {displayValue || `${clamped.toFixed(0)}${unit}`}
          </span>
        </div>
      </div>

      {/* Dial SVG Face */}
      <div className="relative w-full h-[82px] flex items-end justify-center overflow-hidden my-1 z-10">
        <svg
          viewBox="0 0 220 110"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Ambient Warm Backlight Glow */}
            <radialGradient id="warmLampGlow" cx="50%" cy="100%" r="90%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.25" />
              <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>

            {/* Pivot Metal Machined Cap */}
            <radialGradient id="pivotGradient" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#e2e8f0" />
              <stop offset="60%" stopColor="#64748b" />
              <stop offset="90%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>

            {/* Needle Soft Cast Shadow */}
            <filter id="needleShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="2" dy="3" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.75" />
            </filter>
          </defs>

          {/* Warm Backlight Cone */}
          <path
            d="M 20 100 A 90 90 0 0 1 200 100 Z"
            fill="url(#warmLampGlow)"
          />

          {/* Main Dial Scale Background Arc */}
          <path
            d="M 24 100 A 86 86 0 0 1 196 100"
            fill="none"
            stroke="#1e2430"
            strokeWidth="9"
            strokeLinecap="round"
          />

          {/* Normal Range (Green) */}
          <path
            d="M 24 100 A 86 86 0 0 1 148 24"
            fill="none"
            stroke="#10b981"
            strokeWidth="4"
            strokeOpacity="0.9"
          />

          {/* Warning Range (Amber) */}
          <path
            d="M 148 24 A 86 86 0 0 1 176 44"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="4"
            strokeOpacity="0.9"
          />

          {/* Overload / Peak Range (Red) */}
          <path
            d="M 176 44 A 86 86 0 0 1 196 100"
            fill="none"
            stroke="#ef4444"
            strokeWidth="5"
            strokeOpacity="0.95"
          />

          {/* Calibrated Tick Marks with Authentic Angles */}
          {[-44, -33, -22, -11, 0, 11, 22, 33, 44].map((deg, idx) => {
            const rad = ((deg - 90) * Math.PI) / 180;
            const isMajor = deg % 22 === 0;
            const rInner = isMajor ? 76 : 80;
            const rOuter = 88;
            const x1 = 110 + rInner * Math.cos(rad);
            const y1 = 100 + rInner * Math.sin(rad);
            const x2 = 110 + rOuter * Math.cos(rad);
            const y2 = 100 + rOuter * Math.sin(rad);
            const isRedZone = deg >= 22;
            const isAmberZone = deg >= 11 && deg < 22;

            return (
              <line
                key={idx}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isRedZone ? '#ef4444' : isAmberZone ? '#f59e0b' : '#94a3b8'}
                strokeWidth={isMajor ? '2' : '1'}
                strokeOpacity={isMajor ? '0.95' : '0.6'}
              />
            );
          })}

          {/* Scale Labels */}
          <text x="32" y="88" fill="#64748b" fontSize="6.5" fontFamily="monospace" fontWeight="bold">-20</text>
          <text x="56" y="52" fill="#64748b" fontSize="6.5" fontFamily="monospace" fontWeight="bold">-10</text>
          <text x="104" y="32" fill="#94a3b8" fontSize="7" fontFamily="monospace" fontWeight="extrabold">0 dB</text>
          <text x="156" y="48" fill="#f59e0b" fontSize="6.5" fontFamily="monospace" fontWeight="bold">+2</text>
          <text x="182" y="88" fill="#ef4444" fontSize="6.5" fontFamily="monospace" fontWeight="bold">+3</text>

          {/* Realistic Tapered Physical Needle with Rotation and Shadow */}
          <g
            style={{
              transformOrigin: '110px 100px',
              transform: `rotate(${angle}deg)`,
              transition: 'transform 0.28s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
            }}
            filter="url(#needleShadow)"
          >
            {/* Needle Body (Tapered Polygon) */}
            <polygon
              points="109,100 111,100 110.4,12 109.6,12"
              fill="#ef4444"
            />
            {/* Counterweight Tail */}
            <polygon
              points="108.5,100 111.5,100 110.8,108 109.2,108"
              fill="#334155"
            />
            {/* Luminous Specular Needle Tip */}
            <circle cx="110" cy="12" r="1.5" fill="#ffffff" />
          </g>

          {/* Machined Metal Concentric Pivot Cap */}
          <circle
            cx="110"
            cy="100"
            r="13"
            fill="url(#pivotGradient)"
            stroke="#334155"
            strokeWidth="1.5"
            filter="drop-shadow(0 2px 3px rgba(0,0,0,0.7))"
          />
          <circle cx="110" cy="100" r="7" fill="none" stroke="#64748b" strokeWidth="0.8" strokeOpacity="0.8" />
          <circle cx="110" cy="100" r="3.5" fill="#0f172a" />
        </svg>
      </div>

      {/* Bottom Sublabel: Studio Calibrated Plate */}
      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 pt-1 border-t border-zinc-800/80 px-1 z-10">
        <span className="text-zinc-500">VU -20</span>
        <span className="tracking-widest uppercase text-amber-500/90 font-semibold">{sublabel}</span>
        <span className="text-rose-400 font-bold">+3 PEAK</span>
      </div>
    </div>
  );
};
