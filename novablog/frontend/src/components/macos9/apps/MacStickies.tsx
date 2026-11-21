'use client';

import React, { useState, useEffect } from 'react';
import { macSound } from '@/lib/retroAudioMac9';

export const MacStickies: React.FC = () => {
  const [content, setContent] = useState<string>(
    ' Nova Stickies\n\n' +
    '• Welcome to Mac OS 9.2.2 Web Desktop!\n' +
    '• Open Applications folder for Calculator, FM Radio, and Stickies.\n' +
    '• Click "Day & Night" in menu bar to toggle theme.\n' +
    '• Double-click the Nova emblem to open Appearance.\n' +
    '• All stickies and preferences auto-save to browser storage.'
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem('novablog_sticky_note');
      if (saved) setContent(saved);
    } catch {}
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    try {
      localStorage.setItem('novablog_sticky_note', e.target.value);
    } catch {}
  };

  return (
    <div className="flex flex-col h-full bg-[#FFF9C4] font-['Geneva',sans-serif] text-[12px] text-[#262626]">
      {/* Stickies Top Bar */}
      <div className="bg-[#FFF59D] border-b border-[#FBC02D] px-2 py-1 flex items-center justify-between text-[11px] select-none">
        <span className="font-bold text-[#795548]">Stickies Note</span>
        <button
          onClick={() => {
            macSound.playMacClickDown();
            setContent('');
            try {
              localStorage.removeItem('novablog_sticky_note');
            } catch {}
          }}
          className="text-[10px] text-[#8D6E63] hover:text-[#3E2723] px-1"
          title="Clear Note"
        >
          Clear
        </button>
      </div>

      {/* Note Area */}
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Type your note here..."
        className="mac9-cursor-text flex-1 p-3 bg-transparent resize-none outline-none leading-relaxed text-[#262626] font-sans selection:bg-[#FFE082]"
      />

      <div className="px-2 py-0.5 bg-[#FFF59D] text-[10px] text-[#8D6E63] text-right font-mono select-none">
        Auto-Saved
      </div>
    </div>
  );
};
