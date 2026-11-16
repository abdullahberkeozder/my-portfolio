'use client';

import React, { createContext, useContext, useEffect, useCallback, useSyncExternalStore } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: (event?: React.MouseEvent) => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_CHANGE_EVENT = 'novablog-theme-change';

const subscribe = (callback: () => void) => {
  window.addEventListener('storage', callback);
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
  };
};

const getSnapshot = (): Theme => {
  const saved = localStorage.getItem('novablog_theme');
  return saved === 'light' ? 'light' : 'dark';
};

const getServerSnapshot = (): Theme => 'dark';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Sync DOM classes whenever theme changes (external system synchronization)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const applyTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem('novablog_theme', newTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    document.documentElement.setAttribute('data-theme', newTheme);
  }, []);

  const toggleTheme = useCallback(
    (event?: React.MouseEvent) => {
      const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';

      const hasViewTransition =
        typeof document !== 'undefined' &&
        'startViewTransition' in document &&
        typeof (document as unknown as { startViewTransition: (cb: () => void) => { ready: Promise<void> } }).startViewTransition === 'function';

      if (hasViewTransition && event) {
        const x = event.clientX;
        const y = event.clientY;
        const endRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        );

        const transition = (
          document as unknown as { startViewTransition: (cb: () => void) => { ready: Promise<void> } }
        ).startViewTransition(() => {
          applyTheme(nextTheme);
        });

        transition.ready.then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 520,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
              pseudoElement: '::view-transition-new(root)',
            }
          );
        });
      } else {
        applyTheme(nextTheme);
      }
    },
    [theme, applyTheme]
  );

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme: applyTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
