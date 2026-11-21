// src/lib/musicSystem.ts
'use client';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: string;
  duration: string;
  durationSec: number;
  youtubeId: string;
  genre: string;
  bitrate: string;
}

export const PLAYLIST: MusicTrack[] = [
  {
    id: 'less-than-zero',
    title: 'Less Than Zero',
    artist: 'The Weeknd',
    album: 'Dawn FM',
    year: '2022',
    duration: '3:31',
    durationSec: 211,
    youtubeId: 'LKsgDcckur0',
    genre: 'Synth-pop / Retro 80s',
    bitrate: '320 kbps',
  },
  {
    id: 'blinding-lights',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    year: '2020',
    duration: '3:20',
    durationSec: 200,
    youtubeId: '4NRXx6U8ABQ',
    genre: 'Synthwave',
    bitrate: '320 kbps',
  },
  {
    id: 'one-more-time',
    title: 'One More Time',
    artist: 'Daft Punk',
    album: 'Discovery (Mac G4 Era)',
    year: '2001',
    duration: '5:20',
    durationSec: 320,
    youtubeId: 'FGBhQbmMxH8',
    genre: 'French House',
    bitrate: '256 kbps',
  },
  {
    id: 'nightcall',
    title: 'Nightcall',
    artist: 'Kavinsky',
    album: 'OutRun',
    year: '2010',
    duration: '4:19',
    durationSec: 259,
    youtubeId: 'MV_3Dpw-BRY',
    genre: 'Electro / Synthwave',
    bitrate: '320 kbps',
  },
  {
    id: 'enjoy-the-silence',
    title: 'Enjoy The Silence',
    artist: 'Depeche Mode',
    album: 'Violator',
    year: '1990',
    duration: '4:16',
    durationSec: 256,
    youtubeId: 'aGSKrC7dVDY',
    genre: 'Synth-pop Classic',
    bitrate: '256 kbps',
  },
  {
    id: 'starboy',
    title: 'Starboy (feat. Daft Punk)',
    artist: 'The Weeknd',
    album: 'Starboy',
    year: '2016',
    duration: '3:50',
    durationSec: 230,
    youtubeId: 'dqt8Z1k0oWQ',
    genre: 'R&B / Electro',
    bitrate: '320 kbps',
  },
  {
    id: 'cupertino-1999',
    title: 'Cupertino 1999 Ambient Chime',
    artist: 'Jim Reekes & Apple Sound',
    album: 'Mac OS 9 Soundscape',
    year: '1999',
    duration: '3:10',
    durationSec: 190,
    youtubeId: 'wR2m8J9N_eU',
    genre: 'Ambient / Chime',
    bitrate: '192 kbps',
  },
];

type MusicListener = () => void;

class MusicSystem {
  private static instance: MusicSystem;
  private currentTrackIndex: number = 0;
  private isPlaying: boolean = false;
  private volume: number = 75; // 0..100
  private isMuted: boolean = false;
  private currentTime: number = 0;
  private listeners: Set<MusicListener> = new Set();
  private timer: NodeJS.Timeout | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedTrack = localStorage.getItem('novablog_music_track');
        if (savedTrack) {
          const idx = parseInt(savedTrack, 10);
          if (!isNaN(idx) && idx >= 0 && idx < PLAYLIST.length) {
            this.currentTrackIndex = idx;
          }
        }
        const savedVol = localStorage.getItem('novablog_music_volume');
        if (savedVol) {
          const vol = parseInt(savedVol, 10);
          if (!isNaN(vol)) this.volume = Math.max(0, Math.min(100, vol));
        }
      } catch {
        // ignore
      }
    }
  }

  public static getInstance(): MusicSystem {
    if (!MusicSystem.instance) {
      MusicSystem.instance = new MusicSystem();
    }
    return MusicSystem.instance;
  }

  public getPlaylist(): MusicTrack[] {
    return PLAYLIST;
  }

  public getCurrentTrack(): MusicTrack {
    return PLAYLIST[this.currentTrackIndex] || PLAYLIST[0];
  }

  public getCurrentTrackIndex(): number {
    return this.currentTrackIndex;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public subscribe(listener: MusicListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (e) {
        console.error('Error in music listener:', e);
      }
    });
  }

  public play() {
    this.isPlaying = true;
    this.startTimer();
    this.notify();
    this.postIframeCommand('playVideo');
  }

  public pause() {
    this.isPlaying = false;
    this.stopTimer();
    this.notify();
    this.postIframeCommand('pauseVideo');
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public selectTrack(index: number) {
    if (index < 0 || index >= PLAYLIST.length) return;
    this.currentTrackIndex = index;
    this.currentTime = 0;
    try {
      localStorage.setItem('novablog_music_track', index.toString());
    } catch {}
    this.play();
  }

  public nextTrack() {
    const nextIdx = (this.currentTrackIndex + 1) % PLAYLIST.length;
    this.selectTrack(nextIdx);
  }

  public prevTrack() {
    const prevIdx = (this.currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    this.selectTrack(prevIdx);
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(100, vol));
    try {
      localStorage.setItem('novablog_music_volume', this.volume.toString());
    } catch {}
    this.notify();
    this.postIframeCommand('setVolume', [this.isMuted ? 0 : this.volume]);
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    this.notify();
    this.postIframeCommand(this.isMuted ? 'mute' : 'unMute');
    if (!this.isMuted) {
      this.postIframeCommand('setVolume', [this.volume]);
    }
  }

  public seek(seconds: number) {
    this.currentTime = Math.max(0, Math.min(this.getCurrentTrack().durationSec, seconds));
    this.notify();
    this.postIframeCommand('seekTo', [this.currentTime, true]);
  }

  private startTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.isPlaying) {
        this.currentTime += 1;
        if (this.currentTime >= this.getCurrentTrack().durationSec) {
          this.nextTrack();
        } else {
          this.notify();
        }
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private postIframeCommand(func: string, args: unknown[] = []) {
    if (typeof window === 'undefined') return;
    const iframe = document.getElementById('global-music-player-iframe') as HTMLIFrameElement | null;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func,
          args,
        }),
        '*'
      );
    }
  }
}

export const musicSystem = MusicSystem.getInstance();


import { useState, useEffect } from 'react';

export function useMusicPlayer() {
  const [track, setTrack] = useState<MusicTrack>(musicSystem.getCurrentTrack());
  const [trackIndex, setTrackIndex] = useState<number>(musicSystem.getCurrentTrackIndex());
  const [isPlaying, setIsPlaying] = useState<boolean>(musicSystem.getIsPlaying());
  const [volume, setVolumeState] = useState<number>(musicSystem.getVolume());
  const [isMuted, setIsMuted] = useState<boolean>(musicSystem.getIsMuted());
  const [currentTime, setCurrentTime] = useState<number>(musicSystem.getCurrentTime());

  useEffect(() => {
    const unsubscribe = musicSystem.subscribe(() => {
      setTrack(musicSystem.getCurrentTrack());
      setTrackIndex(musicSystem.getCurrentTrackIndex());
      setIsPlaying(musicSystem.getIsPlaying());
      setVolumeState(musicSystem.getVolume());
      setIsMuted(musicSystem.getIsMuted());
      setCurrentTime(musicSystem.getCurrentTime());
    });
    return unsubscribe;
  }, []);

  return {
    track,
    trackIndex,
    playlist: PLAYLIST,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    play: () => musicSystem.play(),
    pause: () => musicSystem.pause(),
    togglePlay: () => musicSystem.togglePlay(),
    nextTrack: () => musicSystem.nextTrack(),
    prevTrack: () => musicSystem.prevTrack(),
    selectTrack: (idx: number) => musicSystem.selectTrack(idx),
    setVolume: (vol: number) => musicSystem.setVolume(vol),
    toggleMute: () => musicSystem.toggleMute(),
    seek: (sec: number) => musicSystem.seek(sec),
  };
}
