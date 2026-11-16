'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  BookOpen,
  Globe,
  Check,
  Plus,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { BlogDto, AuthorProfileDto } from '@/types/api';
import { ApiClient } from '@/lib/api';

interface AuthorProfileModalProps {
  authorName: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectBlog?: (blog: BlogDto) => void;
  allBlogs: BlogDto[];
  followedAuthors: string[];
  onToggleFollow: (authorName: string) => void;
}

export const AuthorProfileModal: React.FC<AuthorProfileModalProps> = ({
  authorName,
  isOpen,
  onClose,
  onSelectBlog,
  allBlogs,
  followedAuthors,
  onToggleFollow,
}) => {
  const [profile, setProfile] = useState<AuthorProfileDto | null>(null);

  useEffect(() => {
    if (!isOpen || !authorName) return;

    let isMounted = true;
    ApiClient.getAuthorProfile(authorName)
      .then((data) => {
        if (isMounted) setProfile(data);
      })
      .catch(() => {
        if (isMounted) setProfile(null);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, authorName]);

  if (!isOpen || !authorName) return null;

  const isFollowing = followedAuthors.includes(authorName);
  const authorBlogs = allBlogs.filter((b) => {
    const authorU = (b.authorUsername || '').toLowerCase();
    const authorN = (b.author || '').toLowerCase();
    const target = authorName.toLowerCase();
    return (
      authorU === target ||
      authorN === target ||
      (target === 'selindemir' && authorN.includes('selin')) ||
      (target === 'caneraydin' && authorN.includes('caner')) ||
      (target === 'admin' && authorN.includes('berke'))
    );
  });

  const displayName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : authorName === 'selindemir'
      ? 'Dr. Selin Demir'
      : authorName === 'caneraydin'
      ? 'Caner Aydın'
      : authorName === 'admin'
      ? 'Abdullah Berke Özder'
      : authorName;

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#0d0f14] rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="relative h-28 bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-purple-500/20 p-6 flex items-start justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md text-[11px] font-mono font-bold tracking-wider uppercase text-zinc-900 dark:text-zinc-100">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>YAZAR PROFİLİ</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 flex items-center justify-center text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card Info */}
        <div className="px-6 sm:px-8 pb-4 -mt-12 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-zinc-950 dark:bg-zinc-800 text-white flex items-center justify-center text-2xl font-bold uppercase shadow-lg ring-4 ring-white dark:ring-[#0d0f14] overflow-hidden">
                {profile?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.imageUrl} alt={displayName} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  initial
                )}
              </div>
              <div className="space-y-0.5">
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white">
                  {displayName}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  {profile?.title || 'Kıdemli Sistem & Dağıtık Sistemler Mimarı'}
                </p>
              </div>
            </div>

            {/* Follow Action Button */}
            <button
              type="button"
              onClick={() => {
                onToggleFollow(authorName);
                ApiClient.toggleFollow(authorName);
              }}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all shadow-sm cursor-pointer whitespace-nowrap active:scale-95 ${
                isFollowing
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-zinc-950 dark:bg-white text-white dark:text-black hover:opacity-90'
              }`}
            >
              {isFollowing ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>TAKİP EDİLİYOR</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>TAKİP ET</span>
                </>
              )}
            </button>
          </div>

          {/* Bio */}
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {profile?.bio ||
              'Java 22 Loom, Spring Boot 4 ve mikro-çekirdek reaktif sistemler üzerine derinlemesine teknik incelemeler ve üretim mimarileri yayınlıyor.'}
          </p>

          {/* Social Stats & Links */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
            <div className="flex items-center gap-5 text-zinc-600 dark:text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-500" />
                <strong className="text-zinc-950 dark:text-white font-bold">
                  {(profile?.followersCount || 1240) + (isFollowing ? 1 : 0)}
                </strong>{' '}
                takipçi
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                <strong className="text-zinc-950 dark:text-white font-bold">
                  {authorBlogs.length > 0 ? authorBlogs.length : profile?.articlesCount || 6}
                </strong>{' '}
                makale
              </span>
            </div>

            <div className="flex items-center gap-2 text-zinc-400">
              <span className="hover:text-black dark:hover:text-white transition-colors cursor-pointer p-1" title="GitHub">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </span>
              <span className="hover:text-black dark:hover:text-white transition-colors cursor-pointer p-1" title="X (Twitter)">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </span>
              <span className="hover:text-black dark:hover:text-white transition-colors cursor-pointer p-1" title="LinkedIn">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </span>
              <span className="hover:text-black dark:hover:text-white transition-colors cursor-pointer p-1" title="Web Sitesi">
                <Globe className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Author Articles Feed List */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3 bg-zinc-50/50 dark:bg-black/20">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              YAYINLANAN MAKALELER
            </span>
            <span className="text-[11px] font-mono text-zinc-400">
              {authorBlogs.length} makale
            </span>
          </div>

          {authorBlogs.length > 0 ? (
            authorBlogs.map((b) => (
              <div
                key={b.blogId ?? b.id}
                onClick={() => {
                  if (onSelectBlog) {
                    onSelectBlog(b);
                    onClose();
                  }
                }}
                className="group p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-emerald-500/50 transition-all cursor-pointer space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span>{b.header}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    {b.readTimeMinutes || 4} dk okuma
                  </span>
                </div>
                <h4 className="font-bold text-zinc-950 dark:text-white text-sm group-hover:text-emerald-500 transition-colors">
                  {b.title}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {b.content.slice(0, 140)}...
                </p>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <div className="flex items-center gap-1.5 text-zinc-400 font-mono">
                    <span>👏 {b.clapsCount ?? b.likesCount ?? 0}</span>
                    <span>·</span>
                    <span>💬 {b.commentCount ?? 0}</span>
                  </div>
                  <span className="text-emerald-500 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Oku <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-zinc-400">
              Bu yazar henüz başka bir makale yayınlamamış.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
