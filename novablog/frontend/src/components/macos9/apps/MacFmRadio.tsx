'use client';

import React, { useState, useEffect } from 'react';
import { macSound } from '@/lib/retroAudioMac9';

const PRESETS = [
  { freq: 94.1, name: 'Nova Ambient FM', f1: 392.00, f2: 493.88, f3: 587.33 },
  { freq: 98.5, name: 'Cupertino 1999 Synth', f1: 440.00, f2: 554.37, f3: 659.25 },
  { freq: 104.2, name: 'Loom Chiptune Radio', f1: 523.25, f2: 659.25, f3: 783.99 },
];

export const MacFmRadio: React.FC = () => {
  const [freq, setFreq] = useState<number>(94.1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [signalLvl, setSignalLvl] = useState<number>(4);

  const currentStation = PRESETS.find((p) => Math.abs(p.freq - freq) < 0.2);

  const handleTune = (newFreq: number) => {
    macSound.playRadioStatic(0.08);
    setFreq(newFreq);
    const station = PRESETS.find((p) => Math.abs(p.freq - newFreq) < 0.2);
    if (station) {
      setSignalLvl(5);
      if (isPlaying) {
        macSound.playRadioChord(station.f1, station.f2, station.f3);
      }
    } else {
      setSignalLvl(1);
    }
  };

  const handleTogglePlay = () => {
    macSound.playMacClickDown();
    const nextPlay = !isPlaying;
    setIsPlaying(nextPlay);

    if (nextPlay) {
      if (currentStation) {
        macSound.playRadioChord(currentStation.f1, currentStation.f2, currentStation.f3);
      } else {
        macSound.playRadioStatic(0.3);
      }
    }
  };

  // Periodic gentle radio ambient pulses when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (currentStation) {
        macSound.playRadioChord(currentStation.f1, currentStation.f2, currentStation.f3);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying, currentStation]);

  return (
    <div className="flex flex-col h-full bg-[#CCCCCC] p-3 font-['Charcoal',sans-serif] select-none text-[12px] text-[#262626] justify-between">
      {/* Radio Tuner LCD Screen */}
      <div className="mac9-inset-box bg-[#1A261A] p-2.5 rounded-[2px] border border-[#262626] flex items-center justify-between text-[#80FF80] shadow-inner font-mono">
        <div>
          <div className="text-[10px] tracking-wider text-[#4D994D] uppercase">
            {currentStation ? currentStation.name : 'FM TUNER — SCANNING'}
          </div>
          <div className="text-2xl font-bold tracking-tight">
            {freq.toFixed(1)} <span className="text-xs">MHz</span>
          </div>
        </div>

        {/* Signal Bars */}
        <div className="flex flex-col items-end gap-1">
          <div className="text-[9px] text-[#4D994D]">STEREO SIGNAL</div>
          <div className="flex items-end gap-0.5 h-4">
            {[1, 2, 3, 4, 5].map((bar) => (
              <div
                key={bar}
                className={`w-1 rounded-sm ${
                  bar <= signalLvl ? 'bg-[#80FF80]' : 'bg-[#2A402A]'
                }`}
                style={{ height: `${bar * 3}px` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tuner Slider */}
      <div className="space-y-1 my-1">
        <div className="flex justify-between text-[10px] text-[#555] font-mono px-1">
          <span>88.0</span>
          <span>96.0</span>
          <span>104.0</span>
          <span>108.0</span>
        </div>
        <input
          type="range"
          min="88.0"
          max="108.0"
          step="0.1"
          value={freq}
          onChange={(e) => handleTune(parseFloat(e.target.value))}
          className="w-full h-2 bg-[#BBBBBB] rounded appearance-none cursor-pointer border border-[#262626]"
        />
      </div>

      {/* Preset Channels */}
      <div className="flex items-center gap-1.5 justify-between">
        {PRESETS.map((p) => (
          <button
            key={p.freq}
            onClick={() => handleTune(p.freq)}
            className={`flex-1 py-1 px-1 text-[10px] font-mono rounded-[2px] border border-[#262626] transition-none ${
              Math.abs(freq - p.freq) < 0.1
                ? 'bg-[#000080] text-white font-bold'
                : 'bg-[#DDDDDD] hover:bg-white text-[#262626]'
            }`}
          >
            {p.freq} MHz
          </button>
        ))}
      </div>

      {/* Control Buttons */}
      <div className="pt-2 border-t border-[#808080] flex items-center justify-between">
        <button
          onClick={handleTogglePlay}
          className={`mac9-btn px-4 py-1.5 font-bold ${
            isPlaying ? 'bg-[#FFDDDD]' : 'mac9-btn-default'
          }`}
        >
          {isPlaying ? '■ Stop' : '▶ Play (Synth)'}
        </button>

        <span className="text-[10px] text-[#555] font-mono">
          Apple FM Stereo Tuner
        </span>
      </div>
    </div>
  );
};
