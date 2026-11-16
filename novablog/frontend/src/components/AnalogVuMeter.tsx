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
  // Needle swings from -48deg to +48deg
  const angle = -48 + (clamped / 100) * 96;

  return (
    <div className={`analog-vu-meter-dial p-3 flex flex-col justify-between select-none ${className}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-zinc-300">
        <span className="tracking-wider uppercase">{label}</span>
        <span className="text-emerald-400 font-mono text-[11px] font-extrabold">
          {displayValue || `${clamped.toFixed(0)}${unit}`}
        </span>
      </div>

      {/* Dial SVG Face */}
      <div className="relative w-full h-[76px] flex items-end justify-center overflow-hidden my-1">
        <svg
          viewBox="0 0 200 100"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Dial Arc Background */}
          <path
            d="M 25 90 A 85 85 0 0 1 175 90"
            fill="none"
            stroke="#2a303c"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Normal Zone (Green) */}
          <path
            d="M 25 90 A 85 85 0 0 1 130 19"
            fill="none"
            stroke="#22c55e"
            strokeWidth="4"
            strokeOpacity="0.85"
          />

          {/* Warning Zone (Amber) */}
          <path
            d="M 130 19 A 85 85 0 0 1 155 35"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="4"
            strokeOpacity="0.85"
          />

          {/* Danger Zone (Red) */}
          <path
            d="M 155 35 A 85 85 0 0 1 175 90"
            fill="none"
            stroke="#ef4444"
            strokeWidth="5"
            strokeOpacity="0.9"
          />

          {/* Dial Ticks */}
          {[-45, -30, -15, 0, 15, 30, 45].map((deg, idx) => {
            const rad = ((deg - 90) * Math.PI) / 180;
            const x1 = 100 + 78 * Math.cos(rad);
            const y1 = 90 + 78 * Math.sin(rad);
            const x2 = 100 + 88 * Math.cos(rad);
            const y2 = 90 + 88 * Math.sin(rad);
            const isRed = deg >= 30;
            return (
              <line
                key={idx}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isRed ? '#ef4444' : '#94a3b8'}
                strokeWidth={deg % 30 === 0 ? '2' : '1'}
              />
            );
          })}

          {/* Needle */}
          <g
            style={{
              transformOrigin: '100px 90px',
              transform: `rotate(${angle}deg)`,
              transition: 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            {/* Needle Line */}
            <line
              x1="100"
              y1="90"
              x2="100"
              y2="12"
              stroke="#ef4444"
              strokeWidth="2.2"
              strokeLinecap="round"
              filter="drop-shadow(0 0 2px rgba(239, 68, 68, 0.8))"
            />
            {/* Needle Tip Indicator */}
            <circle cx="100" cy="12" r="1.5" fill="#ffffff" />
          </g>

          {/* Center Pivot Cap */}
          <circle
            cx="100"
            cy="90"
            r="12"
            fill="url(#pivotGradient)"
            stroke="#475569"
            strokeWidth="1.5"
          />
          <circle cx="100" cy="90" r="4" fill="#1e293b" />

          {/* Gradients */}
          <defs>
            <radialGradient id="pivotGradient" cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="60%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Bottom Sublabel */}
      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 pt-0.5 border-t border-zinc-800">
        <span>0 MIN</span>
        <span className="tracking-wider uppercase text-zinc-500">{sublabel}</span>
        <span className="text-rose-400">PEAK MAX</span>
      </div>
    </div>
  );
};
