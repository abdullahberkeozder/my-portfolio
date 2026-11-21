'use client';

import React from 'react';
import { Bookmark, Compass } from 'lucide-react';
import { playKeyClick } from '@/lib/retroAudio';

interface SkeuomorphicLeatherBookmarksBinderProps {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  actionText?: string;
  onAction?: () => void;
}

export const SkeuomorphicLeatherBookmarksBinder: React.FC<SkeuomorphicLeatherBookmarksBinderProps> = ({
  title = 'Your Reading List is Empty',
  subtitle = 'Click the bookmark icon on any publication to save technical papers to this archive for later review.',
  badgeText = 'MAC OS X SAFARI READING LIST',
  actionText = 'Explore Articles',
  onAction,
}) => {
  const handleAction = () => {
    playKeyClick();
    if (onAction) onAction();
  };

  return (
    <div className="relative retro-leather-binder p-8 sm:p-12 my-6 text-center max-w-3xl mx-auto">
      {/* Hanging Crimson Silk Ribbon Bookmark */}
      <div className="silk-ribbon-bookmark" title="Safari Reading List Bookmark" />

      {/* Decorative Brass Stitched Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-600/40 text-amber-300 text-[10px] font-mono font-bold tracking-widest uppercase mb-4 shadow-inner">
        <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-current" />
        <span>{badgeText}</span>
      </div>

      {/* Embossed Letterpress Title & Description */}
      <div className="space-y-3 max-w-lg mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold leather-embossed-title">
          {title}
        </h3>
        <p className="text-xs sm:text-sm leather-embossed-subtitle leading-relaxed font-sans">
          {subtitle}
        </p>
      </div>

      {/* Skeuomorphic Glossy Action Button */}
      <div className="mt-8">
        <button
          type="button"
          onClick={handleAction}
          className="ios6-btn ios6-btn-silver px-6 py-2.5 text-xs font-bold gap-2 cursor-pointer transition-transform active:scale-95 shadow-lg"
        >
          <Compass className="w-4 h-4 text-zinc-700" />
          <span>{actionText}</span>
        </button>
      </div>
    </div>
  );
};
