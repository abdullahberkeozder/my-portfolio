'use client';

import React from 'react';
import { BlogDto } from '@/types/api';
import { ApiClient } from '@/lib/api';
import { useToggleLikeMutation } from '@/hooks/useBlogs';
import { useBookmarks } from '@/hooks/useSocialStore';
import { playKeyClick, playTabSelect } from '@/lib/retroAudio';
import {
  Bookmark,
  MessageSquare,
} from 'lucide-react';

interface BlogCardProps {
  blog: BlogDto;
  onSelect: (blog: BlogDto) => void;
  onTagClick?: (tag: string) => void;
  onAuthorClick?: (authorName: string) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog, onSelect, onTagClick, onAuthorClick }) => {
  const toggleLikeMutation = useToggleLikeMutation();
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

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    playKeyClick();
    if (!blogId) return;
    toggleLikeMutation.mutate({
      blogId,
      currentlyLiked: Boolean(blog.isLiked),
    });
    ApiClient.clapBlog(blogId, 1);
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

  const liveLikes = blog.likesCount ?? blog.likes ?? 0;
  const liveClaps = (blog.clapsCount && blog.clapsCount > 0) ? blog.clapsCount : liveLikes;
  const commentCount = blog.commentCount ?? (blog as unknown as { comments?: unknown[] }).comments?.length ?? 0;

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

      {/* 3. Bottom Footer: Category & Platinum Interaction Stats */}
      <div className="pt-2 flex items-center justify-between w-full border-t border-[#B0B0B0] dark:border-[#333742] shadow-[0_1px_0_#FFFFFF] dark:shadow-none mt-auto">
        {/* Left: Category & Tag Chips (Compact, Far-Left Aligned) */}
        <div className="flex items-center gap-1 overflow-hidden min-w-0">
          {categoryName && (
            <span
              className="mac9-chip-tag uppercase whitespace-nowrap !text-[8.5px] font-mono !py-0 !px-1.5 !h-[18px] max-w-[100px] truncate leading-none flex items-center"
              title={categoryName}
            >
              {categoryName}
            </span>
          )}
          {blog.tags && blog.tags.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                playKeyClick();
                if (onTagClick) onTagClick(blog.tags![0]);
              }}
              className="mac9-chip-tag uppercase whitespace-nowrap !text-[8px] font-mono !py-0 !px-1 !h-[18px] cursor-pointer hover:border-[#333399] dark:hover:border-[#818CF8] transition-colors hidden sm:inline-flex items-center leading-none"
            >
              #{blog.tags[0]}
            </button>
          )}
        </div>

        {/* Right: Interaction Stats (Compact, Far-Right Aligned) */}
        <div className="flex items-center gap-1 shrink-0 ml-auto">
          {/* Claps / Likes Button */}
          <button
            type="button"
            onClick={handleToggleLike}
            className={`mac9-btn !h-[18px] !px-1.5 !py-0 !text-[8.5px] font-mono flex items-center gap-0.5 leading-none ${blog.isLiked ? 'active !text-white' : ''
              }`}
            title="Applaud (Clap)"
          >
            <span className="text-[9px]">👏</span>
            <span className="font-bold">{liveClaps}</span>
          </button>

          {/* Comments Count */}
          <span
            className="mac9-btn !h-[18px] !px-1.5 !py-0 !text-[8.5px] font-mono text-zinc-600 dark:text-zinc-400 flex items-center gap-0.5 cursor-default leading-none"
            title={`${commentCount} Comments`}
          >
            <MessageSquare className="w-2.5 h-2.5" />
            <span>{commentCount}</span>
          </span>

          {/* Read Disclosure Arrow */}
          <span
            className="text-[9px] font-mono text-zinc-400 group-hover:text-[#333399] dark:group-hover:text-[#818CF8] font-bold transition-transform group-hover:translate-x-0.5 ml-0.5"
            title="Read Article"
          >
            ➔
          </span>
        </div>
      </div>
    </article>
  );
};
