'use client';

import React from 'react';

export const NovaSimpleTextWindow: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] font-mono text-[12px] text-[#1E293B] select-text">
      {/* SimpleText Toolbar */}
      <div className="bg-[#DDDDDD] border-b border-[#262626] px-3 py-1 flex items-center justify-between text-[11px] font-['Charcoal',sans-serif] select-none">
        <div className="flex items-center gap-3">
          <span className="font-bold">File: ReadMe.txt</span>
          <span className="text-[#666]">Read-Only</span>
        </div>
        <div className="text-[10px] text-[#555]">
          Size: 4.8 KB • Encoding: Mac OS Roman (UTF-8)
        </div>
      </div>

      {/* Text Area */}
      <div className="flex-1 p-5 overflow-y-auto leading-relaxed space-y-4">
        <div>
          <h1 className="text-base font-bold text-black border-b border-black pb-1 mb-2 font-['Charcoal',sans-serif]">
             NOVA OS 9.2.2 (SONATA EDITION) // 2026 RELEASE NOTES
          </h1>
          <p className="text-[#475569] text-xs">
            Release Date: November 21, 2026 • Architecture: Java 22 Loom & Next.js 15
          </p>
        </div>

        <section className="space-y-1.5">
          <h2 className="font-bold text-sm text-black font-['Charcoal',sans-serif]">
            1. COGNITIVE ERGONOMICS & ZERO INITIAL LOAD PHILOSOPHY
          </h2>
          <p>
            This operating system web interface was engineered to eliminate user cognitive overload upon initial launch. Instead of complex infinite feeds and metric firehoses, it presents an uncluttered desktop, a serene Nova emblem, and independent windows launched on demand.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-bold text-sm text-black font-['Charcoal',sans-serif]">
            2. CORE HIGHLIGHTS & SHORTCUTS
          </h2>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li><strong>Blog Window:</strong> Double-click to launch the full-featured modern engineering blog in an authentic Mac OS 9 window.</li>
            <li><strong>News (Sherlock 2):</strong> Multi-channel system architecture bulletins and engineering intelligence.</li>
            <li><strong>Applications Folder:</strong> Houses Calculator, FM Synthesizer Radio, and Sticky Notes.</li>
            <li><strong>Day & Night:</strong> Click the sun/moon icon in the top menu bar to toggle between Classic Platinum and Obsidian Carbon themes.</li>
            <li><strong>Appearance Panel:</strong> Double-click the Nova emblem or select Pattern in the Control Strip to change wallpapers.</li>
            <li><strong>Control Strip:</strong> Quick-access hardware strip expandable from the bottom-left corner with volume, wallpaper selector, and telemetry.</li>
          </ul>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-bold text-sm text-black font-['Charcoal',sans-serif]">
            3. PROCEDURAL SOUND SYNTHESIS (WEB AUDIO API)
          </h2>
          <p className="text-xs">
            Zero external audio files downloaded. C-Major Startup Chime, dual-phase mouse clicks, window sweeps, WindowShade accordion clicks, and trash paper crinkles are synthesized in real-time via Web Audio mathematical oscillators.
          </p>
        </section>

        <div className="pt-4 border-t border-[#CBD5E1] text-[11px] text-[#64748B] flex justify-between">
          <span>Nova Studio © 2026. All rights reserved.</span>
          <span>Honoring Apple Computer, Inc. 1999 Human Interface Guidelines.</span>
        </div>
      </div>
    </div>
  );
};
