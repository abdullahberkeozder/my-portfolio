'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { createEngine, type Engine, type Parts } from '@/lib/aquarium/engine';
import { LOOP } from '@/lib/aquarium/demo';
import styles from './AquariumToggle.module.css';

declare global {
  interface Window {
    __render?: (t: number) => void;
    __LOOP?: number;
  }
}

export interface AquariumToggleProps {
  /** If true, sizes the toggle to fit compactly in navigation bars */
  compact?: boolean;
  /** Custom width in CSS px for compact mode (default: 72px) */
  compactWidth?: number;
  /** Extra container styling */
  className?: string;
}

export const AquariumToggle: React.FC<AquariumToggleProps> = ({
  compact = false,
  compactWidth = 72,
  className = '',
}) => {
  const { isDark, setTheme } = useTheme();
  const setThemeRef = useRef(setTheme);
  useEffect(() => {
    setThemeRef.current = setTheme;
  }, [setTheme]);
  const initialDarkRef = useRef(isDark);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitRef = useRef<HTMLButtonElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const tankRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<SVGSVGElement>(null);
  const engineRef = useRef<Engine | null>(null);

  useEffect(() => {
    const [cv, ht, st, tk, wr, cu] = [
      canvasRef.current,
      hitRef.current,
      statusRef.current,
      tankRef.current,
      wrapRef.current,
      cursorRef.current,
    ];
    if (!cv || !ht || !st || !tk || !wr || !cu) return;

    const parts: Parts = { canvas: cv, hit: ht, status: st, tank: tk, wrap: wr, cursor: cu };
    const demo = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1';

    const engine = createEngine(parts, {
      demo,
      initialTheme: initialDarkRef.current ? 'dark' : 'light',
      compact,
      compactWidth,
      onThemeChange: (theme) => {
        setThemeRef.current(theme);
      },
    });

    engineRef.current = engine;
    engine.start();

    if (demo) {
      let frame = -1;
      window.__LOOP = LOOP;
      window.__render = (t: number) => {
        const target = Math.max(1, Math.round(t * 60));
        if (frame < 0 || target < frame) {
          engine.dispose();
          const fresh = createEngine(parts, {
            demo: true,
            now0: 0,
            initialTheme: initialDarkRef.current ? 'dark' : 'light',
            compact,
            compactWidth,
          });
          engineRef.current = fresh;
          frame = 0;
        }
        while (frame < target) {
          frame++;
          engineRef.current?.step(frame * (1000 / 60));
        }
      };
    }

    return () => {
      engine.dispose();
      engineRef.current = null;
      delete window.__render;
      delete window.__LOOP;
    };
  }, [compact, compactWidth]);

  // Sync external theme changes into the engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setTheme(isDark ? 'dark' : 'light');
    }
  }, [isDark]);

  return (
    <div className={`${styles.stage} ${className}`}>
      <div ref={wrapRef} className={styles.wrap}>
        <div ref={tankRef} className={styles.tank}>
          <canvas ref={canvasRef} aria-hidden="true" />
          <button
            ref={hitRef}
            className={styles.hit}
            type="button"
            role="switch"
            aria-checked={isDark ? 'true' : 'false'}
            aria-label="Gece/Gündüz Modunu Değiştir"
            title={isDark ? 'Gündüz Moduna Geç' : 'Gece Moduna Geç'}
          />
          <span ref={statusRef} className={styles.vh} role="status" aria-live="polite" />
        </div>
      </div>
      <svg ref={cursorRef} className={styles.cursor} viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M3 2 L3 19.2 L7.4 15 L10.5 21.8 L13.6 20.4 L10.6 13.8 L16.9 13.6 Z"
          fill="#15161a"
          stroke="#fff"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
