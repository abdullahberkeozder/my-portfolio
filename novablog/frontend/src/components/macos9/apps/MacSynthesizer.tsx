// src/components/macos9/apps/MacSynthesizer.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';

type Waveform = 'sawtooth' | 'square' | 'triangle' | 'sine';

interface Preset {
  id: string;
  name: string;
  waveform: Waveform;
  cutoff: number;
  resonance: number;
  attack: number;
  release: number;
  subOsc: boolean;
}

const PRESETS: Preset[] = [
  {
    id: 'dawn-fm',
    name: 'Dawn FM 80s Lead',
    waveform: 'sawtooth',
    cutoff: 2400,
    resonance: 5,
    attack: 0.02,
    release: 0.35,
    subOsc: true,
  },
  {
    id: 'discovery',
    name: 'Discovery Vocoder Bass',
    waveform: 'square',
    cutoff: 850,
    resonance: 9,
    attack: 0.01,
    release: 0.25,
    subOsc: true,
  },
  {
    id: 'nightcall',
    name: 'Nightcall Retro Arp',
    waveform: 'sawtooth',
    cutoff: 1600,
    resonance: 7,
    attack: 0.01,
    release: 0.45,
    subOsc: false,
  },
  {
    id: 'cupertino',
    name: 'Cupertino 1999 Bell',
    waveform: 'triangle',
    cutoff: 3800,
    resonance: 2,
    attack: 0.005,
    release: 0.8,
    subOsc: false,
  },
];

interface Note {
  note: string;
  freq: number;
  keyChar: string;
  isBlack: boolean;
}

const NOTES: Note[] = [
  { note: 'C3', freq: 130.81, keyChar: 'A', isBlack: false },
  { note: 'C#3', freq: 138.59, keyChar: 'W', isBlack: true },
  { note: 'D3', freq: 146.83, keyChar: 'S', isBlack: false },
  { note: 'D#3', freq: 155.56, keyChar: 'E', isBlack: true },
  { note: 'E3', freq: 164.81, keyChar: 'D', isBlack: false },
  { note: 'F3', freq: 174.61, keyChar: 'F', isBlack: false },
  { note: 'F#3', freq: 185.00, keyChar: 'T', isBlack: true },
  { note: 'G3', freq: 196.00, keyChar: 'G', isBlack: false },
  { note: 'G#3', freq: 207.65, keyChar: 'Y', isBlack: true },
  { note: 'A3', freq: 220.00, keyChar: 'H', isBlack: false },
  { note: 'A#3', freq: 233.08, keyChar: 'U', isBlack: true },
  { note: 'B3', freq: 246.94, keyChar: 'J', isBlack: false },
  { note: 'C4', freq: 261.63, keyChar: 'K', isBlack: false },
  { note: 'C#4', freq: 277.18, keyChar: 'O', isBlack: true },
  { note: 'D4', freq: 293.66, keyChar: 'L', isBlack: false },
  { note: 'D#4', freq: 311.13, keyChar: 'P', isBlack: true },
  { note: 'E4', freq: 329.63, keyChar: ';', isBlack: false },
];

export const MacSynthesizer: React.FC = () => {
  const [activePreset, setActivePreset] = useState<string>('dawn-fm');
  const [waveform, setWaveform] = useState<Waveform>('sawtooth');
  const [cutoff, setCutoff] = useState<number>(2400);
  const [resonance, setResonance] = useState<number>(5);
  const [attack, setAttack] = useState<number>(0.02);
  const [release, setRelease] = useState<number>(0.35);
  const [subOsc, setSubOsc] = useState<boolean>(true);
  const [activeNotes, setActiveNotes] = useState<string[]>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeOscsRef = useRef<Map<string, { osc: OscillatorNode; subOsc?: OscillatorNode; gain: GainNode }>>(new Map());

  const getAudioContext = (): AudioContext => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  };

  const handleApplyPreset = (p: Preset) => {
    setActivePreset(p.id);
    setWaveform(p.waveform);
    setCutoff(p.cutoff);
    setResonance(p.resonance);
    setAttack(p.attack);
    setRelease(p.release);
    setSubOsc(p.subOsc);
  };

  const startNote = (note: Note) => {
    if (activeOscsRef.current.has(note.note)) return;

    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(cutoff, now);
      filter.Q.setValueAtTime(resonance, now);

      // Main Gain & Envelope
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + attack);

      // Main Oscillator
      const osc = ctx.createOscillator();
      osc.type = waveform;
      osc.frequency.setValueAtTime(note.freq, now);

      osc.connect(filter);

      // Optional Sub-Oscillator (1 octave down)
      let subNode: OscillatorNode | undefined;
      if (subOsc) {
        subNode = ctx.createOscillator();
        subNode.type = 'sine';
        subNode.frequency.setValueAtTime(note.freq / 2, now);
        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.2, now);
        subNode.connect(subGain);
        subGain.connect(filter);
        subNode.start(now);
      }

      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);

      activeOscsRef.current.set(note.note, { osc, subOsc: subNode, gain });
      setActiveNotes((prev) => [...prev, note.note]);
    } catch (e) {
      console.warn('Synth error starting note:', e);
    }
  };

  const stopNote = (noteName: string) => {
    const entry = activeOscsRef.current.get(noteName);
    if (!entry || !audioCtxRef.current) return;

    try {
      const now = audioCtxRef.current.currentTime;
      entry.gain.gain.cancelScheduledValues(now);
      entry.gain.gain.setValueAtTime(entry.gain.gain.value, now);
      entry.gain.gain.exponentialRampToValueAtTime(0.0001, now + release);

      setTimeout(() => {
        try {
          entry.osc.stop();
          entry.subOsc?.stop();
          entry.osc.disconnect();
          entry.subOsc?.disconnect();
          entry.gain.disconnect();
        } catch {}
      }, release * 1000 + 50);

      activeOscsRef.current.delete(noteName);
      setActiveNotes((prev) => prev.filter((n) => n !== noteName));
    } catch (e) {
      console.warn('Synth error stopping note:', e);
    }
  };

  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toUpperCase();
      const found = NOTES.find((n) => n.keyChar === key);
      if (found) {
        startNote(found);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const found = NOTES.find((n) => n.keyChar === key);
      if (found) {
        stopNote(found.note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [waveform, cutoff, resonance, attack, release, subOsc]);

  return (
    <div className="flex flex-col bg-[#1A1E26] text-[#E2E8F0] p-3 font-mono text-[11px] rounded-[3px] border border-[#334155] shadow-2xl select-none">
      {/* Top Synth Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#334155]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <span className="font-bold text-xs tracking-wider text-cyan-300">NOVA ANALOG SYNTH 99</span>
          <span className="text-[9px] px-1.5 py-0.2 bg-[#0F172A] border border-[#38BDF8]/40 rounded text-cyan-200">
            QuickTime V-Synth
          </span>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-400">Preset:</span>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleApplyPreset(p)}
              className={`px-2 py-0.5 rounded-[2px] text-[10px] transition-all ${
                activePreset === p.id
                  ? 'bg-cyan-600 text-white font-bold shadow-[0_0_8px_rgba(8,145,178,0.6)]'
                  : 'bg-[#273244] text-gray-300 hover:bg-[#334155]'
              }`}
            >
              {p.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Control Knobs & Faders Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-2.5 bg-[#0F141C] rounded border border-[#2A3447] mb-3">
        {/* Waveform Selector */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase tracking-wider text-gray-400">Waveform</span>
          <div className="grid grid-cols-2 gap-1">
            {(['sawtooth', 'square', 'triangle', 'sine'] as Waveform[]).map((w) => (
              <button
                key={w}
                onClick={() => setWaveform(w)}
                className={`py-1 text-[9px] rounded-[2px] uppercase ${
                  waveform === w ? 'bg-cyan-500 text-black font-bold' : 'bg-[#1E293B] text-gray-400 hover:text-white'
                }`}
              >
                {w.slice(0, 4)}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Cutoff */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[9px] text-gray-400">
            <span>Cutoff</span>
            <span className="text-cyan-300">{cutoff} Hz</span>
          </div>
          <input
            type="range"
            min="300"
            max="6000"
            step="50"
            value={cutoff}
            onChange={(e) => setCutoff(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-[#334155] rounded appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Resonance Q */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[9px] text-gray-400">
            <span>Resonance (Q)</span>
            <span className="text-cyan-300">{resonance}</span>
          </div>
          <input
            type="range"
            min="1"
            max="18"
            step="1"
            value={resonance}
            onChange={(e) => setResonance(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-[#334155] rounded appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Release Envelope */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[9px] text-gray-400">
            <span>Release</span>
            <span className="text-cyan-300">{Math.round(release * 1000)}ms</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="1.2"
            step="0.05"
            value={release}
            onChange={(e) => setRelease(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[#334155] rounded appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Sub-Oscillator Toggle */}
        <div className="flex flex-col justify-between">
          <span className="text-[9px] uppercase tracking-wider text-gray-400">Sub-Osc</span>
          <button
            onClick={() => setSubOsc(!subOsc)}
            className={`w-full py-1 text-[10px] rounded-[2px] font-bold ${
              subOsc
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_6px_rgba(16,185,129,0.3)]'
                : 'bg-[#1E293B] text-gray-500 border border-gray-700'
            }`}
          >
            {subOsc ? '● SUB -1 OCT' : '○ SUB OFF'}
          </button>
        </div>
      </div>

      {/* Interactive Piano Keyboard (White and Black Keys) */}
      <div className="relative h-28 bg-[#0B0F17] p-1.5 rounded border border-[#2A3447] flex justify-center items-start shadow-inner overflow-hidden">
        {/* Render White Keys */}
        <div className="flex relative z-0">
          {NOTES.filter((n) => !n.isBlack).map((note) => {
            const isPlaying = activeNotes.includes(note.note);
            return (
              <div
                key={note.note}
                onMouseDown={() => startNote(note)}
                onMouseUp={() => stopNote(note.note)}
                onMouseLeave={() => stopNote(note.note)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  startNote(note);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  stopNote(note.note);
                }}
                className={`w-7 sm:w-8 h-24 bg-gradient-to-b from-[#FFFFFF] to-[#E2E8F0] border border-[#94A3B8] rounded-b-[3px] mx-[1px] flex flex-col justify-end items-center pb-1 text-[9px] font-bold text-[#1E293B] cursor-pointer shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.4)] transition-all ${
                  isPlaying ? '!bg-cyan-200 !from-cyan-100 !to-cyan-300 translate-y-0.5 shadow-none ring-2 ring-cyan-400' : 'hover:to-cyan-50'
                }`}
              >
                <span className="text-[8px] text-[#64748B]">{note.keyChar}</span>
                <span>{note.note}</span>
              </div>
            );
          })}
        </div>

        {/* Render Black Keys Absolutely Positioned */}
        <div className="absolute top-1.5 left-0 right-0 flex justify-center z-10 pointer-events-none">
          <div className="flex relative pointer-events-auto" style={{ width: `${10 * 34}px` }}>
            {/* Specific pixel offsets for standard piano black keys pattern */}
            {[
              { note: 'C#3', left: 22, keyChar: 'W' },
              { note: 'D#3', left: 54, keyChar: 'E' },
              { note: 'F#3', left: 118, keyChar: 'T' },
              { note: 'G#3', left: 150, keyChar: 'Y' },
              { note: 'A#3', left: 182, keyChar: 'U' },
              { note: 'C#4', left: 246, keyChar: 'O' },
              { note: 'D#4', left: 278, keyChar: 'P' },
            ].map((bk) => {
              const fullNote = NOTES.find((n) => n.note === bk.note);
              if (!fullNote) return null;
              const isPlaying = activeNotes.includes(bk.note);
              return (
                <div
                  key={bk.note}
                  onMouseDown={() => startNote(fullNote)}
                  onMouseUp={() => stopNote(fullNote.note)}
                  onMouseLeave={() => stopNote(fullNote.note)}
                  style={{ left: `${bk.left}px` }}
                  className={`absolute top-0 w-5 h-14 bg-gradient-to-b from-[#2B3545] via-[#111827] to-[#030712] border border-[#000000] rounded-b-[2px] flex flex-col justify-end items-center pb-1 text-[8px] font-bold text-cyan-300 cursor-pointer shadow-[0_3px_5px_rgba(0,0,0,0.8)] transition-all ${
                    isPlaying ? '!bg-cyan-600 !from-cyan-500 !to-cyan-700 translate-y-0.5 ring-2 ring-cyan-300' : 'hover:from-[#374151]'
                  }`}
                >
                  <span className="text-[7px] text-gray-400">{bk.keyChar}</span>
                  <span className="text-[7px] leading-tight">{bk.note}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Keyboard Hint Footer */}
      <div className="flex items-center justify-between pt-2 mt-1 text-[9px] text-gray-400">
        <span>Play using keyboard keys [A, W, S, E, D, F, T, G, Y, H, U, J, K, O, L, P, ;]</span>
        <span className="text-cyan-400">Real-time Web Audio V-Oscillator</span>
      </div>
    </div>
  );
};
