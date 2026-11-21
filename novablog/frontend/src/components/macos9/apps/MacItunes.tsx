// src/components/macos9/apps/MacItunes.tsx
'use client';

import React, { useState } from 'react';
import { useMusicPlayer, MusicTrack } from '@/lib/musicSystem';
import { macSound } from '@/lib/retroAudioMac9';

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
  const [showVideo, setShowVideo] = useState<boolean>(false);

  // Format time mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const filteredPlaylist = playlist.filter((item) => {
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
    <div className="flex flex-col h-full bg-[#D4D4D4] font-['Charcoal',sans-serif] select-none text-[12px] text-[#262626]">
      {/* ================= 1. BRUSHED METAL / PLATINUM TOP CONTROLLER ================= */}
      <div className="p-3 bg-gradient-to-b from-[#EEEEEE] via-[#D8D8D8] to-[#B8B8B8] border-b border-[#707070] shadow-[inset_0_1px_0_#FFFFFF] flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          {/* Transport Controls (Prev, Play/Pause, Next) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                macSound.playMacClickDown();
                prevTrack();
              }}
              className="w-8 h-8 rounded-full bg-gradient-to-b from-[#FAFAFA] to-[#CCCCCC] border border-[#666666] flex items-center justify-center shadow-[inset_0_1px_0_#FFF,0_1px_2px_rgba(0,0,0,0.2)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)] active:from-[#CCCCCC]"
              title="Previous Track"
            >
              <span className="text-[11px] font-bold">⏮</span>
            </button>

            <button
              onClick={() => {
                macSound.playMacClickDown();
                togglePlay();
              }}
              className={`w-10 h-10 rounded-full border border-[#555555] flex items-center justify-center shadow-[inset_0_1px_0_#FFF,0_1px_3px_rgba(0,0,0,0.3)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] ${
                isPlaying
                  ? 'bg-gradient-to-b from-[#99CCFF] to-[#3366CC] text-white font-bold'
                  : 'bg-gradient-to-b from-[#FFFFFF] to-[#CCCCCC] text-[#222]'
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
              className="w-8 h-8 rounded-full bg-gradient-to-b from-[#FAFAFA] to-[#CCCCCC] border border-[#666666] flex items-center justify-center shadow-[inset_0_1px_0_#FFF,0_1px_2px_rgba(0,0,0,0.2)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)] active:from-[#CCCCCC]"
              title="Next Track"
            >
              <span className="text-[11px] font-bold">⏭</span>
            </button>

            {/* Volume Slider */}
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-[#A0A0A0]">
              <button
                onClick={toggleMute}
                className="text-[12px] opacity-80 hover:opacity-100"
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
                className="w-16 h-1.5 bg-[#888] rounded appearance-none cursor-pointer accent-[#3366CC]"
                title={`Volume: ${volume}%`}
              />
              <span className="text-[11px] font-mono text-[#555]">🔊</span>
            </div>
          </div>

          {/* Center LCD Screen Display (Apple SoundJam / iTunes 1.0 Retro LED Screen) */}
          <div className="flex-1 max-w-[340px] bg-[#1E291E] border-2 border-[#555] rounded-[3px] p-2 text-[#66FF66] font-mono shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] text-[#449944] mb-0.5 tracking-wider uppercase font-bold">
              <span>{isPlaying ? '● PLAYING' : '❚❚ PAUSED'}</span>
              <span>{track.genre}</span>
            </div>

            <div className="font-bold text-xs truncate text-[#88FF88] flex items-center gap-1.5">
              <span>🎵</span>
              <span className="truncate">{track.title}</span>
            </div>
            <div className="text-[10px] text-[#55BB55] truncate">
              {track.artist} — {track.album}
            </div>

            {/* Scrub / Progress Bar */}
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-[9px] text-[#44AA44] font-mono shrink-0">
                {formatTime(currentTime)}
              </span>
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  seek(pos * track.durationSec);
                }}
                className="flex-1 h-1.5 bg-[#0D1A0D] border border-[#2D4A2D] rounded-full cursor-pointer relative overflow-hidden"
              >
                <div
                  className="h-full bg-gradient-to-r from-[#44AA44] to-[#88FF88] transition-all duration-300"
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
                {[40, 90, 60, 100, 75, 45].map((h, i) => (
                  <div
                    key={i}
                    className="w-[2px] bg-[#66FF66] rounded-t-sm animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDuration: `${0.3 + (i % 3) * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Search Box & Video Toggle */}
          <div className="flex flex-col gap-1.5 items-end shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-2 py-0.5 text-[11px] bg-white border border-[#777] rounded-[2px] shadow-inner font-mono text-[#262626] w-36 focus:outline-none focus:border-[#3366CC]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-0.5 text-[#888] hover:text-[#333] text-[10px]"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={() => {
                macSound.playMacClickUp();
                setShowVideo(!showVideo);
              }}
              className={`px-2 py-0.5 text-[10px] rounded-[2px] border transition-none font-bold ${
                showVideo
                  ? 'bg-[#3366CC] text-white border-[#224488]'
                  : 'bg-[#E0E0E0] text-[#333] border-[#888] hover:bg-[#D0D0D0]'
              }`}
            >
              {showVideo ? 'Hide Video' : '📺 Show Video'}
            </button>
          </div>
        </div>
      </div>

      {/* ================= 2. MAIN BODY (SIDEBAR + TRACK LIST) ================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* Source Sidebar */}
        <div className="w-44 bg-[#E0E0E0] border-r border-[#888] flex flex-col py-2 px-1 text-[11px]">
          <span className="text-[10px] uppercase font-bold text-[#666] px-2 mb-1 tracking-wider">
            Source
          </span>
          <button
            onClick={() => setSelectedPlaylist('library')}
            className={`w-full text-left px-2 py-1 rounded-[2px] flex items-center gap-1.5 transition-none ${
              selectedPlaylist === 'library'
                ? 'bg-[#3366CC] text-white font-bold'
                : 'hover:bg-[#D0D0D0] text-[#262626]'
            }`}
          >
            <span>🎵</span>
            <span>Library</span>
          </button>
          <button
            onClick={() => setSelectedPlaylist('weeknd')}
            className={`w-full text-left px-2 py-1 rounded-[2px] flex items-center gap-1.5 transition-none ${
              selectedPlaylist === 'weeknd'
                ? 'bg-[#3366CC] text-white font-bold'
                : 'hover:bg-[#D0D0D0] text-[#262626]'
            }`}
          >
            <span>🎧</span>
            <span>The Weeknd Hits</span>
          </button>
          <button
            onClick={() => setSelectedPlaylist('synth')}
            className={`w-full text-left px-2 py-1 rounded-[2px] flex items-center gap-1.5 transition-none ${
              selectedPlaylist === 'synth'
                ? 'bg-[#3366CC] text-white font-bold'
                : 'hover:bg-[#D0D0D0] text-[#262626]'
            }`}
          >
            <span>💿</span>
            <span>Retro Synth & Disco</span>
          </button>
          <button
            onClick={() => setSelectedPlaylist('mac9')}
            className={`w-full text-left px-2 py-1 rounded-[2px] flex items-center gap-1.5 transition-none ${
              selectedPlaylist === 'mac9'
                ? 'bg-[#3366CC] text-white font-bold'
                : 'hover:bg-[#D0D0D0] text-[#262626]'
            }`}
          >
            <span>🍎</span>
            <span>Cupertino 1999</span>
          </button>

          <div className="h-px bg-[#B0B0B0] my-2 mx-1" />

          {/* Quick Info Box */}
          <div className="px-2 py-1.5 text-[10px] text-[#555] bg-[#D4D4D4] rounded border border-[#B8B8B8] mt-auto font-mono">
            <div className="font-bold text-[#333] mb-0.5">QuickTime Audio</div>
            <div>Stereo 44.1 kHz</div>
            <div>CoreAudio v2.1</div>
          </div>
        </div>

        {/* Track List Table */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left text-[11px] border-collapse font-mono">
              <thead className="sticky top-0 bg-[#DEDEDE] border-b border-[#999] text-[#333] z-10 shadow-sm select-none">
                <tr>
                  <th className="py-1 px-2 font-bold w-8 text-center border-r border-[#BBB]">#</th>
                  <th className="py-1 px-3 font-bold border-r border-[#BBB] w-[35%]">Song Name</th>
                  <th className="py-1 px-3 font-bold border-r border-[#BBB] w-[12%]">Time</th>
                  <th className="py-1 px-3 font-bold border-r border-[#BBB] w-[25%]">Artist</th>
                  <th className="py-1 px-3 font-bold border-r border-[#BBB] w-[20%]">Album</th>
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
                      className={`cursor-pointer border-b border-[#EAEAEA] transition-none ${
                        isCurrent
                          ? 'bg-[#3366CC] text-white font-bold'
                          : idx % 2 === 0
                          ? 'bg-white hover:bg-[#EDF2FA]'
                          : 'bg-[#F9FAFC] hover:bg-[#EDF2FA]'
                      }`}
                    >
                      <td className="py-1 px-2 text-center text-[10px] opacity-75">
                        {isCurrent ? (
                          <span className="text-white animate-bounce">🔊</span>
                        ) : (
                          idx + 1
                        )}
                      </td>
                      <td className="py-1 px-3 flex items-center gap-1.5 truncate">
                        <span className="truncate">{song.title}</span>
                        {song.id === 'less-than-zero' && (
                          <span className={`text-[9px] px-1 py-0.2 rounded font-sans uppercase ${
                            isCurrent ? 'bg-white/30 text-white' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            Featured
                          </span>
                        )}
                      </td>
                      <td className="py-1 px-3 opacity-90">{song.duration}</td>
                      <td className="py-1 px-3 truncate">{song.artist}</td>
                      <td className="py-1 px-3 truncate opacity-90">{song.album}</td>
                      <td className="py-1 px-2 text-right opacity-70 text-[10px]">
                        {song.bitrate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Embedded YouTube Video Screen Drawer */}
          {showVideo && (
            <div className="h-48 border-t-2 border-[#666] bg-black flex flex-col relative shrink-0">
              <div className="bg-[#222] text-[#CCC] px-2 py-0.5 text-[10px] flex items-center justify-between font-mono">
                <span>YouTube Media Feed: {track.title}</span>
                <button
                  onClick={() => setShowVideo(false)}
                  className="text-white hover:text-red-400 font-bold px-1"
                >
                  ✕ Close Feed
                </button>
              </div>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${track.youtubeId}?autoplay=1&enablejsapi=1`}
                title={track.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </div>

      {/* ================= 3. BOTTOM STATUS BAR ================= */}
      <div className="px-3 py-1 bg-[#DDDDDD] border-t border-[#888888] text-[10px] font-mono text-[#444] flex items-center justify-between shadow-inner">
        <span>{filteredPlaylist.length} songs, 27.6 minutes, 48.2 MB</span>
        <span className="flex items-center gap-1 text-[#222]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>Mac OS 9 iTunes Audio Engine Online</span>
        </span>
      </div>
    </div>
  );
};
