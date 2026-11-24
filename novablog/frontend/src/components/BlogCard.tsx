'use client';

import React from 'react';
import { BlogDto } from '@/types/api';
import { ApiClient } from '@/lib/api';
import { useBookmarks } from '@/hooks/useSocialStore';
import { playKeyClick, playTabSelect } from '@/lib/retroAudio';
import { Bookmark } from 'lucide-react';

interface BlogCardProps {
  blog: BlogDto;
  onSelect: (blog: BlogDto) => void;
  onTagClick?: (tag: string) => void;
  onAuthorClick?: (authorName: string) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog, onSelect, onAuthorClick }) => {
  const blogId = blog.id ?? blog.blogId;

  const bookmarkedIds = useBookmarks();
  const isBookmarked = Boolean(blogId && bookmarkedIds.includes(blogId));

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTabSelect();
    if (!blogId || typeof window === 'undefined') return;
    try {
      const saved: number[] = JSON.parse(localStorage.getItem('novablog_bookmarks') || '[]');
      let updated: number[];
      if (saved.includes(blogId)) {
        updated = saved.filter((id) => id !== blogId);
      } else {
        updated = [...saved, blogId];
      }
      localStorage.setItem('novablog_bookmarks', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('bookmarks-updated', { detail: updated }));
      ApiClient.toggleBookmark(blogId);
    } catch {
      // ignore
    }
  };

  const wordCount = (blog.content || '').split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 180));

  const formattedDate = blog.publishedAt || blog.createdDate
    ? new Date(blog.publishedAt || blog.createdDate!).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    : 'Nov 5, 2026';

  // Clean, markdown-free excerpt for card preview
  const rawExcerpt = (blog.content || '')
    .replace(/^#+\s+[^\n]+/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[`*#_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const authorUsername = blog.authorUsername || blog.author || 'admin';
  const authorDisplayName =
    blog.authorUsername === 'selindemir'
      ? 'Dr. Selin Demir'
      : blog.authorUsername === 'caneraydin'
        ? 'Caner Aydin'
        : blog.author || 'Abdullah Berke Ozder';
  const authorInitial = authorDisplayName.charAt(0).toUpperCase();
  const authorAvatarUrl = blog.authorImageUrl;

  const categoryName = blog.blogCategoryDto?.categoryName || blog.category?.categoryName;

  return (
    <article
      onClick={() => {
        playKeyClick();
        onSelect(blog);
      }}
      className="group mac9-blog-card p-3.5 sm:p-4 flex flex-col justify-between space-y-3 cursor-pointer transition-all duration-150"
    >
      <div className="space-y-2.5">
        {/* 1. Clean Mac OS 9 Author & Date Line */}
        <div className="flex items-center justify-between gap-2 border-b border-[#B0B0B0] dark:border-[#333742] pb-2 text-xs shadow-[0_1px_0_#FFFFFF] dark:shadow-none">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playKeyClick();
              if (onAuthorClick) {
                onAuthorClick(authorUsername);
              }
            }}
            className="flex items-center gap-2 min-w-0 group/author cursor-pointer text-left bg-transparent border-none p-0"
            title={`View ${authorDisplayName}'s profile`}
          >
            {/* Mac OS 9 Silver Beveled Coin Avatar */}
            <div className="retro-avatar-silver shrink-0">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-b from-[#404040] to-[#1F1F1F] text-white flex items-center justify-center font-bold text-[10px] uppercase shadow-inner">
                {authorAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={authorAvatarUrl}
                    alt={authorDisplayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  authorInitial
                )}
              </div>
            </div>

            <div className="min-w-0 flex flex-col justify-center">
              <span className="font-['Charcoal',sans-serif] font-bold text-[11.5px] text-zinc-950 dark:text-white truncate group-hover/author:text-[#333399] dark:group-hover/author:text-[#818CF8] transition-colors leading-tight">
                {authorDisplayName}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-['Geneva',sans-serif] leading-tight truncate">
                {formattedDate} &bull; {readingTime} min read
              </span>
            </div>
          </button>

          {/* Bookmark Action */}
          <button
            type="button"
            onClick={handleToggleBookmark}
            title={isBookmarked ? 'Remove from reading list' : 'Save to Mac OS 9 Reading List'}
            className={`mac9-btn mac9-btn-icon shrink-0 ${isBookmarked
              ? '!bg-amber-100 dark:!bg-amber-950/40 !border-amber-500 text-amber-600'
              : 'text-zinc-500 dark:text-zinc-400'
              }`}
          >
            <Bookmark className={`w-3 h-3 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* 2. Article Title & Excerpt (Uncluttered, High-Readability Editorial Flow) */}
        <div className="space-y-1.5">
          <h3 className="font-['Charcoal',sans-serif] text-[15px] font-bold text-zinc-950 dark:text-white group-hover:text-[#333399] dark:group-hover:text-[#818CF8] transition-colors leading-snug line-clamp-2">
            {blog.title}
          </h3>
          <p className="text-[12px] text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed font-['Geneva',sans-serif]">
            {rawExcerpt}
          </p>
        </div>
      </div>

      {/* 3. Bottom Footer: Clean Category & Direct Read Action */}
      <div className="pt-2 flex items-center justify-between w-full border-t border-[#B0B0B0] dark:border-[#333742] shadow-[0_1px_0_#FFFFFF] dark:shadow-none mt-auto">
        {/* Left: Full Category Badge (Untruncated, Crisp Platinum Chip) */}
        <div className="flex items-center min-w-0 pr-2">
          {categoryName && (
            <span
              className="mac9-chip-tag uppercase whitespace-nowrap !text-[9px] font-mono font-bold !py-0.5 !px-2 !h-[20px] text-[#333399] dark:text-[#818CF8] flex items-center"
              title={categoryName}
            >
              {categoryName}
            </span>
          )}
        </div>

        {/* Right: Clean Read Article Action Button */}
        <div className="flex items-center shrink-0 ml-auto">
          <span
            className="mac9-btn !h-[20px] !px-2.5 !py-0 !text-[9.5px] font-['Charcoal',sans-serif] font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-[#333399] dark:group-hover:text-[#818CF8] flex items-center gap-1 select-none"
            title="Read Article"
          >
            <span>Read</span>
            <span className="text-[10px] transition-transform group-hover:translate-x-0.5">➔</span>
          </span>
        </div>
      </div>
    </article>
  );
};
