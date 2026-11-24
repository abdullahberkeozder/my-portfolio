// src/components/macos9/apps/MacItunes.tsx
'use client';

import React, { useState } from 'react';
import { useMusicPlayer } from '@/lib/musicSystem';
import { macSound } from '@/lib/retroAudioMac9';
import { Search, X } from 'lucide-react';

export const MacItunes: React.FC = () => {
  const {
    track,
    trackIndex,
    playlist,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    togglePlay,
    nextTrack,
    prevTrack,
    selectTrack,
    setVolume,
    toggleMute,
    seek,
  } = useMusicPlayer();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>('library');

  // Format time mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const filteredPlaylist = playlist.filter((item) => {
    // Playlist filter
    if (selectedPlaylist === 'weeknd' && !item.artist.includes('The Weeknd')) return false;
    if (selectedPlaylist === 'synth' && !item.genre.toLowerCase().includes('synth')) return false;
    if (selectedPlaylist === 'mac9' && item.id !== 'cupertino-1999' && item.id !== 'one-more-time') return false;

    // Search query filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.artist.toLowerCase().includes(q) ||
      item.album.toLowerCase().includes(q)
    );
  });

  const progressPercent = Math.min(100, (currentTime / (track.durationSec || 1)) * 100);

  return (
    <div className="flex flex-col h-full bg-[#EDEDED] dark:bg-[#0F172A] font-['Charcoal',sans-serif] select-none text-[12px] text-[#262626] dark:text-[#E2E8F0]">
      {/* ================= 1. BRUSHED PLATINUM TOP CONTROLLER ================= */}
      <div className="p-2.5 bg-gradient-to-b from-[#EEEEEE] via-[#DDDDDD] to-[#CCCCCC] dark:from-[#1E293B] dark:via-[#152033] dark:to-[#0B132B] border-b border-[#707070] dark:border-[#334155] shadow-[inset_0_1px_0_#FFFFFF] flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          {/* Transport Controls (Prev, Play/Pause, Next) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                macSound.playMacClickDown();
                prevTrack();
              }}
              className="mac9-btn !w-8 !h-8 !p-0 rounded-full flex items-center justify-center shadow-[inset_0_1px_0_#FFF,0_1px_2px_rgba(0,0,0,0.2)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)]"
              title="Previous Track"
            >
              <span className="text-[11px] font-bold">⏮</span>
            </button>

            <button
              onClick={() => {
                macSound.playMacClickDown();
                togglePlay();
              }}
              className={`w-9 h-9 rounded-full border border-[#444] dark:border-[#60A5FA] flex items-center justify-center shadow-[inset_0_1px_0_#FFF,0_1px_3px_rgba(0,0,0,0.3)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] ${
                isPlaying
                  ? 'bg-gradient-to-b from-[#6B8AFD] to-[#333399] text-white font-bold shadow-[0_0_8px_rgba(51,51,153,0.5)]'
                  : 'bg-gradient-to-b from-[#FFFFFF] to-[#CCCCCC] dark:from-[#334155] dark:to-[#1E293B] text-[#222] dark:text-gray-200'
              }`}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              <span className="text-sm font-bold">{isPlaying ? '❚❚' : '▶'}</span>
            </button>

            <button
              onClick={() => {
                macSound.playMacClickDown();
                nextTrack();
              }}
              className="mac9-btn !w-8 !h-8 !p-0 rounded-full flex items-center justify-center shadow-[inset_0_1px_0_#FFF,0_1px_2px_rgba(0,0,0,0.2)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)]"
              title="Next Track"
            >
              <span className="text-[11px] font-bold">⏭</span>
            </button>

            {/* Volume Slider */}
            <div className="flex items-center gap-1.5 ml-1.5 pl-2 border-l border-[#A0A0A0] dark:border-[#475569]">
              <button
                onClick={toggleMute}
                className="text-[12px] opacity-80 hover:opacity-100 cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? '🔇' : '🔈'}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                className="w-16 h-1.5 bg-[#888] dark:bg-[#475569] rounded appearance-none cursor-pointer accent-[#333399]"
                title={`Volume: ${volume}%`}
              />
              <span className="text-[11px] text-[#555] dark:text-gray-400">🔊</span>
            </div>
          </div>

          {/* Center LCD Screen Display (Authentic Apple SoundJam / Retro LED) */}
          <div className="flex-1 max-w-[370px] bg-[#0A120A] border-2 border-[#334833] rounded-[4px] px-2.5 py-1.5 text-[#55EE55] font-mono shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)] relative overflow-hidden">
            <div className="flex items-center justify-between text-[9.5px] text-[#44AA44] mb-0.5 tracking-wider uppercase font-bold">
              <span>{isPlaying ? '● PLAYING' : '❚❚ PAUSED'}</span>
              <span className="text-cyan-400">{track.genre}</span>
            </div>

            <div className="font-bold text-[12px] truncate text-[#77FF77] flex items-center gap-1.5 font-['Geneva',sans-serif]">
              <span>🎵</span>
              <span className="truncate">{track.title}</span>
            </div>
            <div className="text-[10px] text-[#55CC55] truncate font-['Geneva',sans-serif]">
              {track.artist} &bull; {track.album}
            </div>

            {/* Scrub / Progress Bar */}
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[9px] text-[#44AA44] font-mono shrink-0">
                {formatTime(currentTime)}
              </span>
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  seek(pos * track.durationSec);
                }}
                className="flex-1 h-1.5 bg-[#081008] border border-[#223822] rounded-full cursor-pointer relative overflow-hidden"
              >
                <div
                  className="h-full bg-gradient-to-r from-[#44AA44] via-[#77FF77] to-cyan-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[9px] text-[#44AA44] font-mono shrink-0">
                {track.duration}
              </span>
            </div>

            {/* Dancing Equalizer Frequency Bars */}
            {isPlaying && (
              <div className="absolute top-1.5 right-2 flex items-end gap-[2px] h-3">
                {[45, 90, 60, 100, 75, 50].map((h, i) => (
                  <div
                    key={i}
                    className="w-[2px] bg-[#66FF66] rounded-t-sm animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDuration: `${0.25 + (i % 3) * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Top Right: Search Library Input (Streamlined, Authentic Mac OS 9 Player) */}
          <div className="flex items-center shrink-0">
            <div className="mac9-inset-box h-[24px] px-2 flex items-center gap-1.5 w-48 rounded-[2px]">
              <Search className="w-3 h-3 text-[#666] shrink-0" />
              <input
                type="text"
                placeholder="Search Library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-[11px] font-['Geneva',sans-serif] text-[#262626] dark:text-[#E2E8F0] focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[#888] hover:text-[#262626] shrink-0 p-0"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. MAIN BODY (VIEW CONTAINER) ================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* Source Sidebar */}
        <div className="w-44 bg-[#E0E0E0] dark:bg-[#1E293B] border-r border-[#888] dark:border-[#334155] flex flex-col py-2.5 px-1.5 text-[11px]">
          <span className="text-[10px] uppercase font-bold text-[#666] dark:text-gray-400 px-2 mb-1.5 tracking-wider font-mono">
            Source
          </span>
          <button
            onClick={() => setSelectedPlaylist('library')}
            className={`w-full text-left px-2.5 py-1.5 rounded-[2px] flex items-center gap-2 transition-none cursor-pointer ${
              selectedPlaylist === 'library'
                ? 'bg-[#333399] text-white font-bold shadow-sm'
                : 'hover:bg-[#D5D5D5] dark:hover:bg-[#2A374A] text-[#262626] dark:text-gray-200'
            }`}
          >
            <span>🎵</span>
            <span className="font-['Geneva',sans-serif]">Library</span>
          </button>
          <button
            onClick={() => setSelectedPlaylist('weeknd')}
            className={`w-full text-left px-2.5 py-1.5 rounded-[2px] flex items-center gap-2 transition-none cursor-pointer ${
              selectedPlaylist === 'weeknd'
                ? 'bg-[#333399] text-white font-bold shadow-sm'
                : 'hover:bg-[#D5D5D5] dark:hover:bg-[#2A374A] text-[#262626] dark:text-gray-200'
            }`}
          >
            <span>🎧</span>
            <span className="font-['Geneva',sans-serif]">The Weeknd Hits</span>
          </button>
          <button
            onClick={() => setSelectedPlaylist('synth')}
            className={`w-full text-left px-2.5 py-1.5 rounded-[2px] flex items-center gap-2 transition-none cursor-pointer ${
              selectedPlaylist === 'synth'
                ? 'bg-[#333399] text-white font-bold shadow-sm'
                : 'hover:bg-[#D5D5D5] dark:hover:bg-[#2A374A] text-[#262626] dark:text-gray-200'
            }`}
          >
            <span>💿</span>
            <span className="font-['Geneva',sans-serif]">Retro Synth &amp; Disco</span>
          </button>
          <button
            onClick={() => setSelectedPlaylist('mac9')}
            className={`w-full text-left px-2.5 py-1.5 rounded-[2px] flex items-center gap-2 transition-none cursor-pointer ${
              selectedPlaylist === 'mac9'
                ? 'bg-[#333399] text-white font-bold shadow-sm'
                : 'hover:bg-[#D5D5D5] dark:hover:bg-[#2A374A] text-[#262626] dark:text-gray-200'
            }`}
          >
            <span>🍎</span>
            <span className="font-['Geneva',sans-serif]">Cupertino 1999</span>
          </button>
        </div>

            {/* Track List Table */}
            <div className="flex-1 flex flex-col bg-white dark:bg-[#0B0F17] overflow-hidden">
              <div className="overflow-y-auto flex-1">
                <table className="w-full text-left text-[11px] border-collapse font-['Geneva',sans-serif]">
                  <thead className="sticky top-0 bg-[#DDDDDD] dark:bg-[#1E293B] border-b border-[#888] dark:border-[#334155] text-[#262626] dark:text-gray-200 z-10 shadow-sm select-none font-['Charcoal',sans-serif]">
                    <tr>
                      <th className="py-1 px-2 font-bold w-9 text-center border-r border-[#BBB] dark:border-[#334155]">#</th>
                      <th className="py-1 px-3 font-bold border-r border-[#BBB] dark:border-[#334155] w-[35%]">Song Name</th>
                      <th className="py-1 px-3 font-bold border-r border-[#BBB] dark:border-[#334155] w-[12%]">Time</th>
                      <th className="py-1 px-3 font-bold border-r border-[#BBB] dark:border-[#334155] w-[25%]">Artist</th>
                      <th className="py-1 px-3 font-bold border-r border-[#BBB] dark:border-[#334155] w-[20%]">Album</th>
                      <th className="py-1 px-2 font-bold w-16 text-right">Bitrate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlaylist.map((song, idx) => {
                      const isCurrent = playlist[trackIndex]?.id === song.id;
                      return (
                        <tr
                          key={song.id}
                          onClick={() => macSound.playMacClickDown()}
                          onDoubleClick={() => {
                            const originalIdx = playlist.findIndex((p) => p.id === song.id);
                            if (originalIdx !== -1) {
                              selectTrack(originalIdx);
                            }
                          }}
                          className={`cursor-pointer border-b border-[#EAEAEA] dark:border-[#1E293B] transition-none ${
                            isCurrent
                              ? 'bg-[#333399] text-white font-bold'
                              : idx % 2 === 0
                              ? 'bg-white dark:bg-[#0B0F17] hover:bg-[#EDF2FA] dark:hover:bg-[#1E293B]'
                              : 'bg-[#F9FAFC] dark:bg-[#0F1420] hover:bg-[#EDF2FA] dark:hover:bg-[#1E293B]'
                          }`}
                        >
                          <td className="py-1 px-2 text-center text-[10px] font-mono opacity-80">
                            {isCurrent ? (
                              <span className="text-white">🔊</span>
                            ) : (
                              idx + 1
                            )}
                          </td>
                          <td className="py-1 px-3 flex items-center gap-1.5 truncate">
                            <span className="truncate">{song.title}</span>
                            {song.id === 'less-than-zero' && (
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded-[2px] font-mono uppercase font-bold ${
                                  isCurrent
                                    ? 'bg-white text-[#333399] shadow-sm'
                                    : 'bg-[#E0E7FF] dark:bg-indigo-950 text-[#333399] dark:text-indigo-300'
                                }`}
                              >
                                Featured
                              </span>
                            )}
                          </td>
                          <td className="py-1 px-3 font-mono opacity-90">{song.duration}</td>
                          <td className="py-1 px-3 truncate">{song.artist}</td>
                          <td className="py-1 px-3 truncate opacity-90">{song.album}</td>
                          <td className="py-1 px-2 text-right opacity-70 text-[10px] font-mono">
                            {song.bitrate}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

      {/* ================= 3. BOTTOM STATUS BAR ================= */}
      <div className="px-3 py-1 bg-[#DDDDDD] dark:bg-[#1E293B] border-t border-[#888888] dark:border-[#334155] text-[10px] font-mono text-[#444] dark:text-gray-300 flex items-center justify-between shadow-inner">
        <span>{filteredPlaylist.length} songs, 27.6 minutes, 48.2 MB</span>
        <span className="flex items-center gap-1.5 text-[#222] dark:text-gray-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          <span>Mac OS 9 iTunes Audio Engine Online</span>
        </span>
      </div>
    </div>
  );
};
