// src/components/macos9/GlobalMusicPlayer.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMusicPlayer } from '@/lib/musicSystem';

export const GlobalMusicPlayer: React.FC = () => {
  const { track, isPlaying, volume, isMuted } = useMusicPlayer();
  const [origin, setOrigin] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  // Sync volume with YouTube iframe postMessage
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const effectiveVol = isMuted ? 0 : volume;
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'setVolume',
          args: [effectiveVol],
        }),
        '*'
      );
    }
  }, [volume, isMuted]);

  if (!origin) return null;

  // We embed the YouTube player. When isPlaying is true, autoplay is active.
  const srcUrl = `https://www.youtube-nocookie.com/embed/${track.youtubeId}?enablejsapi=1&autoplay=${
    isPlaying ? '1' : '0'
  }&origin=${encodeURIComponent(origin)}&widget_referrer=${encodeURIComponent(origin)}`;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        bottom: '-9999px',
        left: '-9999px',
        width: '1px',
        height: '1px',
        opacity: 0.01,
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      <iframe
        id="global-music-player-iframe"
        ref={iframeRef}
        key={track.id}
        src={srcUrl}
        title={`Global Audio Stream: ${track.title} - ${track.artist}`}
        allow="autoplay; encrypted-media"
        className="w-1 h-1"
      />
    </div>
  );
};
