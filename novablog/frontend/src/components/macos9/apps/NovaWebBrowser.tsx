'use client';

import React, { useState } from 'react';
import { macSound } from '@/lib/retroAudioMac9';

interface NovaWebBrowserProps {
  onOpenBlog?: () => void;
  initialUrl?: string;
}

export const NovaWebBrowser: React.FC<NovaWebBrowserProps> = ({
  onOpenBlog,
  initialUrl = 'https://www.google.com/webhp?igu=1',
}) => {
  const [urlInput, setUrlInput] = useState<string>(initialUrl);
  const [currentUrl, setCurrentUrl] = useState<string>(initialUrl);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('Done');
  const [history, setHistory] = useState<string[]>([initialUrl]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'iframe' | 'retro-google' | 'nova-blog'>('iframe');

  const navigateTo = (targetUrl: string, mode: 'iframe' | 'retro-google' | 'nova-blog' = 'iframe') => {
    macSound.playMacClickDown();
    setIsLoading(true);
    setStatusText(`Connecting to ${targetUrl}...`);
    setUrlInput(targetUrl);
    setCurrentUrl(targetUrl);
    setViewMode(mode);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(targetUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    setTimeout(() => {
      setIsLoading(false);
      setStatusText('Done');
      macSound.playDroplet();
    }, 600);
  };

  const handleGo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let trimmed = urlInput.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      // If it looks like a domain, prepend https://, else treat as Google search
      if (trimmed.includes('.') && !trimmed.includes(' ')) {
        trimmed = 'https://' + trimmed;
      } else {
        trimmed = `https://www.google.com/search?igu=1&q=${encodeURIComponent(trimmed)}`;
      }
    }
    navigateTo(trimmed, 'iframe');
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      const prevUrl = history[prevIndex];
      setUrlInput(prevUrl);
      setCurrentUrl(prevUrl);
      macSound.playMacClickUp();
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const nextUrl = history[nextIndex];
      setUrlInput(nextUrl);
      setCurrentUrl(nextUrl);
      macSound.playMacClickUp();
    }
  };

  const handleRefresh = () => {
    macSound.playMacClickDown();
    setIsLoading(true);
    setStatusText('Reloading page...');
    setTimeout(() => {
      setIsLoading(false);
      setStatusText('Done');
    }, 500);
  };

  const handleGoogleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const googleSearchUrl = `https://www.google.com/search?igu=1&q=${encodeURIComponent(searchQuery)}`;
    navigateTo(googleSearchUrl, 'iframe');
  };

  return (
    <div className="flex flex-col h-full bg-[#DDDDDD] font-['Charcoal',sans-serif] text-[12px] text-[#262626] select-none">
      {/* ================= 1. BROWSER NAVIGATION CONTROLS ================= */}
      <div className="p-1.5 border-b border-[#808080] bg-[#ECECEC] flex items-center justify-between gap-1 shadow-sm">
        {/* Nav Toolbar Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleBack}
            disabled={historyIndex === 0}
            className={`mac9-btn px-2 py-0.5 text-[11px] flex items-center gap-1 ${
              historyIndex === 0 ? 'opacity-40 cursor-not-allowed' : ''
            }`}
            title="Geri"
          >
            <span>◄</span>
            <span className="hidden sm:inline">Back</span>
          </button>

          <button
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className={`mac9-btn px-2 py-0.5 text-[11px] flex items-center gap-1 ${
              historyIndex >= history.length - 1 ? 'opacity-40 cursor-not-allowed' : ''
            }`}
            title="İleri"
          >
            <span>►</span>
            <span className="hidden sm:inline">Forward</span>
          </button>

          <button
            onClick={handleRefresh}
            className="mac9-btn px-2 py-0.5 text-[11px] flex items-center gap-1"
            title="Yenile"
          >
            <span>↻</span>
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => navigateTo('https://www.google.com/webhp?igu=1', 'iframe')}
            className="mac9-btn px-2 py-0.5 text-[11px] flex items-center gap-1"
            title="Google Ana Sayfası"
          >
            <span>🏠</span>
            <span className="hidden sm:inline">Home</span>
          </button>

          <button
            onClick={() => setViewMode('retro-google')}
            className={`mac9-btn px-2 py-0.5 text-[11px] flex items-center gap-1 ${
              viewMode === 'retro-google' ? 'bg-[#C0C0E0] font-bold' : ''
            }`}
            title="Retro Google Görünümü"
          >
            <span>🔍</span>
            <span className="hidden sm:inline">Retro Google</span>
          </button>
        </div>

        {/* Animated Loading Indicator / Activity Spinner */}
        <div className="flex items-center gap-1.5 pr-1">
          <div
            className={`w-4 h-4 rounded-full border-2 ${
              isLoading
                ? 'border-t-[#000080] border-r-[#000080] border-b-transparent border-l-transparent animate-spin'
                : 'border-[#808080]'
            }`}
            title={isLoading ? 'Sayfa yükleniyor...' : 'Hazır'}
          />
          <span className="text-[10px] text-[#555] font-mono hidden md:inline">IE 5.0 Mac</span>
        </div>
      </div>

      {/* ================= 2. ADDRESS BAR ================= */}
      <div className="px-2 py-1.5 bg-[#DDDDDD] border-b border-[#808080] flex items-center gap-2">
        <span className="text-[11px] font-bold shrink-0">Address:</span>
        <form onSubmit={handleGo} className="flex-1 flex items-center gap-1.5">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 px-2 py-0.5 bg-white border border-[#808080] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.25)] rounded-[2px] text-[12px] font-mono text-[#111] focus:outline-none focus:border-[#000080]"
            placeholder="URL girin veya arama yapın (örn: www.google.com)..."
          />
          <button type="submit" className="mac9-btn px-3 py-0.5 text-[11px] font-bold">
            Go
          </button>
        </form>
      </div>

      {/* ================= 3. QUICK BOOKMARKS BAR ================= */}
      <div className="px-2 py-1 bg-[#E4E4E4] border-b border-[#999999] flex items-center gap-2 overflow-x-auto text-[10px]">
        <span className="text-[#666] font-bold shrink-0">Bookmarks:</span>
        <button
          onClick={() => navigateTo('https://www.google.com/webhp?igu=1', 'iframe')}
          className="px-1.5 py-0.2 bg-[#DDDDDD] hover:bg-[#CECECE] border border-[#888] rounded-[2px] whitespace-nowrap flex items-center gap-1"
        >
          <span>🌐</span> Google Search
        </button>
        <button
          onClick={() => {
            if (onOpenBlog) {
              onOpenBlog();
            } else {
              navigateTo('http://novablog.internal', 'nova-blog');
            }
          }}
          className="px-1.5 py-0.2 bg-[#DDDDDD] hover:bg-[#CECECE] border border-[#888] rounded-[2px] whitespace-nowrap flex items-center gap-1"
        >
          <span>📖</span> Nova Blog
        </button>
        <button
          onClick={() => navigateTo('https://news.ycombinator.com', 'iframe')}
          className="px-1.5 py-0.2 bg-[#DDDDDD] hover:bg-[#CECECE] border border-[#888] rounded-[2px] whitespace-nowrap flex items-center gap-1"
        >
          <span>🟧</span> Hacker News
        </button>
        <button
          onClick={() => navigateTo('https://en.wikipedia.org/wiki/Mac_OS_9', 'iframe')}
          className="px-1.5 py-0.2 bg-[#DDDDDD] hover:bg-[#CECECE] border border-[#888] rounded-[2px] whitespace-nowrap flex items-center gap-1"
        >
          <span>📚</span> Wikipedia (Mac OS 9)
        </button>
        <button
          onClick={() => navigateTo('https://github.com', 'iframe')}
          className="px-1.5 py-0.2 bg-[#DDDDDD] hover:bg-[#CECECE] border border-[#888] rounded-[2px] whitespace-nowrap flex items-center gap-1"
        >
          <span>🐙</span> GitHub
        </button>
      </div>

      {/* ================= 4. MAIN BROWSER CONTENT VIEWPORT ================= */}
      <div className="flex-1 bg-white relative overflow-hidden">
        {/* Mode 1: Live Interactive Google / External Webpage via IFRAME */}
        {viewMode === 'iframe' && (
          <div className="w-full h-full relative">
            <iframe
              key={currentUrl}
              src={currentUrl}
              title="Mac OS 9 Web Browser"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              onError={() => setViewMode('retro-google')}
            />

            {/* In case user wants to jump to quick search overlay */}
            <div className="absolute top-2 right-2 z-10 bg-[#DDDDDD]/95 border border-[#262626] rounded p-1 shadow-md flex items-center gap-1">
              <span className="text-[10px] text-[#333]">Site açılmıyorsa:</span>
              <button
                onClick={() => setViewMode('retro-google')}
                className="mac9-btn px-2 py-0.2 text-[10px]"
              >
                Retro Google Motorunu Aç
              </button>
              <a
                href={currentUrl}
                target="_blank"
                rel="noreferrer"
                className="mac9-btn px-2 py-0.2 text-[10px] text-[#000080]"
              >
                Yeni Sekmede Aç ↗
              </a>
            </div>
          </div>
        )}

        {/* Mode 2: Retro Google 1999 Search Engine Mockup */}
        {viewMode === 'retro-google' && (
          <div className="w-full h-full p-6 flex flex-col items-center justify-center bg-white text-center font-serif">
            {/* Retro 1998-1999 Google Logo */}
            <div className="mb-4">
              <span className="text-4xl font-extrabold text-[#4285F4]">G</span>
              <span className="text-4xl font-extrabold text-[#EA4335]">o</span>
              <span className="text-4xl font-extrabold text-[#FBBC05]">o</span>
              <span className="text-4xl font-extrabold text-[#4285F4]">g</span>
              <span className="text-4xl font-extrabold text-[#34A853]">l</span>
              <span className="text-4xl font-extrabold text-[#EA4335]">e</span>
              <span className="text-3xl font-extrabold text-[#4285F4]">!</span>
              <div className="text-[11px] font-sans text-[#777] mt-0.5 tracking-wider">
                Stanford University & Apple Mac OS 9 Edition
              </div>
            </div>

            {/* Search Input Box */}
            <form onSubmit={handleGoogleSearchSubmit} className="w-full max-w-md space-y-3">
              <div className="flex border border-[#808080] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] bg-white rounded-[2px] p-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Google'da veya webde arayın..."
                  className="w-full px-2 py-1 text-[13px] font-sans focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="submit"
                  className="mac9-btn mac9-btn-default px-4 py-1 text-[12px] font-sans font-bold"
                >
                  Google Search
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const randoms = ['Mac OS 9 UI Kit', 'Java 22 Loom', 'Next.js 15 App Router', 'Spring Boot 4.1', 'pgvector'];
                    const chosen = randoms[Math.floor(Math.random() * randoms.length)];
                    setSearchQuery(chosen);
                    navigateTo(`https://www.google.com/search?igu=1&q=${encodeURIComponent(chosen)}`, 'iframe');
                  }}
                  className="mac9-btn px-4 py-1 text-[12px] font-sans"
                >
                  I&apos;m Feeling Lucky
                </button>
              </div>
            </form>

            {/* Fast Quick Links */}
            <div className="mt-8 pt-4 border-t border-[#DDD] max-w-md w-full text-[11px] font-sans text-[#555] flex justify-center gap-4">
              <button
                onClick={() => navigateTo('https://www.google.com/webhp?igu=1', 'iframe')}
                className="text-[#000080] hover:underline"
              >
                Canlı Google Iframe Modu
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  if (onOpenBlog) onOpenBlog();
                  else setViewMode('nova-blog');
                }}
                className="text-[#000080] hover:underline font-bold"
              >
                Nova Blog Sayfası
              </button>
            </div>
          </div>
        )}

        {/* Mode 3: Nova Blog internal preview */}
        {viewMode === 'nova-blog' && (
          <div className="p-6 h-full overflow-y-auto bg-[#F8F9FA]">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="p-4 bg-white border border-[#CCC] rounded shadow-sm">
                <h3 className="text-xl font-bold text-[#000080]">Nova Blog — Modern Sistem Mimarisi</h3>
                <p className="text-xs text-[#666] mt-1">
                  Mac OS 9 Masaüstü içerisinden modern web uygulaması deneyimi.
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => onOpenBlog?.()}
                    className="mac9-btn mac9-btn-default px-4 py-1"
                  >
                    Ayrı Pencerede Tam Ekran Aç
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= 5. STATUS BAR ================= */}
      <div className="px-2 py-0.5 bg-[#DDDDDD] border-t border-[#808080] text-[10px] font-mono text-[#444] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{isLoading ? '⏳ Loading...' : '✓ ' + statusText}</span>
          <span className="text-[#777]">|</span>
          <span className="truncate max-w-[300px]">{currentUrl}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span>🔒 SSL Active</span>
          <span>Internet Zone</span>
        </div>
      </div>
    </div>
  );
};
