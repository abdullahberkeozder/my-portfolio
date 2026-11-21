'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  Globe,
  Check,
  Clock,
  ArrowRight,
  ExternalLink,
  Cpu,
  Layers,
  Flame,
  FileText,
  UserPlus,
} from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { BlogDto, AuthorProfileDto } from '@/types/api';
import { ApiClient } from '@/lib/api';
import { playKeyClick, playTabSelect } from '@/lib/retroAudio';

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
  const [activeTab, setActiveTab] = useState<'articles' | 'notes' | 'about'>('articles');

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

  const isStaffBerke = authorName.toLowerCase().includes('admin') || authorName.toLowerCase().includes('berke');
  const isStaffSelin = authorName.toLowerCase().includes('selin');
  const isStaffCaner = authorName.toLowerCase().includes('caner');

  const displayName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : isStaffSelin
      ? 'Dr. Selin Demir'
      : isStaffCaner
      ? 'Caner Aydin'
      : isStaffBerke
      ? 'Abdullah Berke Ozder'
      : authorName;

  const initial = displayName.charAt(0).toUpperCase();

  const authorNotes = isStaffBerke
    ? [
        {
          id: 'm-n1',
          date: 'Nov 14, 2026',
          topic: 'Virtual Threads & JDBC Pools',
          content:
            'Size the HikariCP connection pool based on PostgreSQL CPU cores (2 x CPU + Disk IO), not on the number of virtual threads. Virtual threads eliminate I/O blocking, but they are not an excuse to bloat the database connection pool.',
          claps: 48,
        },
        {
          id: 'm-n2',
          date: 'Nov 12, 2026',
          topic: 'Redis Write-Behind Buffer',
          content:
            'Asynchronously flushing claps and views via Redis HINCRBY buffer reduced PostgreSQL row contention by 99.2% under stress loads.',
          claps: 64,
        },
      ]
    : isStaffSelin
    ? [
        {
          id: 'm-s1',
          date: 'Nov 13, 2026',
          topic: 'Dimension Reduction & Memory',
          content:
            '128D vs 1536D embedding comparison: Low-dimensional optimized embeddings reduce memory consumption by 80% in enterprise vector search while retaining high retrieval accuracy.',
          claps: 57,
        },
      ]
    : isStaffCaner
    ? [
        {
          id: 'm-c1',
          date: 'Nov 15, 2026',
          topic: 'Kubernetes CFS Quota',
          content:
            'CFS throttling in Kubernetes pod CPU limits can spike tail latency by 300ms. Configuring CPU requests while flexing limits immediately stabilized p99 latency.',
          claps: 73,
        },
      ]
    : [
        {
          id: 'm-gen',
          date: 'Nov 10, 2026',
          topic: 'Engineering Notes',
          content: 'Sharing high-scale distributed systems analyses and optimization architectures on the Nova platform.',
          claps: 12,
        },
      ];

  const techStack = isStaffBerke
    ? ['Java 22 Loom', 'Spring Boot 3.4', 'PostgreSQL pgvector', 'Redis Write-Behind', 'HikariCP Pool', 'Kafka Streams', 'Next.js 16']
    : isStaffSelin
    ? ['Spring AI', 'pgvector 128D', 'HNSW Indexing', 'Cosine Similarity', 'Embeddings RAG', 'Semantic Cache']
    : isStaffCaner
    ? ['Kubernetes', 'eBPF Telemetry', 'Docker Containers', 'Prometheus', 'Zero-Trust 2FA', 'CI/CD Pipelines']
    : ['Java & Spring Boot', 'Systems Architecture', 'Distributed Systems'];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 safari-reader-backdrop overflow-hidden animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl mac-addressbook-card shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Saddle-Stitched Leather Top Header Banner */}
        <div className="leather-stitched-header shrink-0">
          <div className="inline-flex items-center gap-2 text-amber-200 text-xs font-mono font-bold tracking-wider uppercase">
            <span>❖ NOVA ADDRESS BOOK // CONTACT CARD</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/author/${encodeURIComponent(authorName)}`}
              onClick={() => {
                playKeyClick();
                onClose();
              }}
              className="safari-hud-btn text-[11px] font-mono"
              title="Open in Dedicated Profile Page"
            >
              <span>Dedicated Page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              type="button"
              onClick={() => {
                playKeyClick();
                onClose();
              }}
              className="w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center font-bold text-xs shadow-inner cursor-pointer"
              title="Close"
            >
              &times;
            </button>
          </div>
        </div>

        {/* 2. Mac Address Book Profile Info Section */}
        <div className="p-6 sm:p-7 space-y-4 shrink-0 bg-white dark:bg-[#181a1d] border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Brushed Silver Coin Avatar */}
              <div className="retro-avatar-silver shrink-0">
                <div className="w-16 h-16 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xl font-bold uppercase shadow-inner overflow-hidden">
                  {profile?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.imageUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    initial
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white font-sans tracking-tight">
                  {displayName}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  {profile?.title || (isStaffSelin ? 'Principal AI & Data Systems Researcher' : isStaffCaner ? 'Staff Cloud & Kubernetes Architect' : 'Staff Systems Architect & Tech Lead @ Nova')}
                </p>
              </div>
            </div>

            {/* Skeuomorphic Follow Action Button */}
            <button
              type="button"
              onClick={() => {
                playKeyClick();
                onToggleFollow(authorName);
                ApiClient.toggleFollow(authorName);
              }}
              className={`ios6-btn px-5 py-2 text-xs font-bold gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 ${
                isFollowing ? 'ios6-btn-silver' : 'ios6-btn-blue'
              }`}
            >
              {isFollowing ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>FOLLOWING</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>FOLLOW</span>
                </>
              )}
            </button>
          </div>

          {/* Bio */}
          <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
            {profile?.bio ||
              (isStaffSelin
                ? 'Conducting research on Spring AI integrations, pgvector embeddings, and high-dimensional vector space semantic retrieval (RAG) architectures.'
                : isStaffCaner
                ? 'Designing cloud-native architectures, eBPF observability, zero-downtime deployments, and high-availability microservice infrastructure.'
                : 'Publishing deep technical analyses and production architectures on Java 22 Loom, Spring Boot 3.4, and microkernel reactive systems.')}
          </p>

          {/* Social Stats & Links */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            <div className="flex items-center gap-5 text-zinc-600 dark:text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <strong className="text-zinc-950 dark:text-white font-bold">
                  {(profile?.followersCount || 1240) + (isFollowing ? 1 : 0)}
                </strong>{' '}
                followers
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                <strong className="text-zinc-950 dark:text-white font-bold">
                  {authorBlogs.length > 0 ? authorBlogs.length : profile?.articlesCount || 4}
                </strong>{' '}
                articles
              </span>
            </div>

            <div className="flex items-center gap-2 text-zinc-400">
              <a
                href="https://github.com/abdullahberkeozder"
                target="_blank"
                rel="noreferrer"
                onClick={() => playKeyClick()}
                className="hover:text-black dark:hover:text-white transition-colors cursor-pointer p-1"
                title="GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <span className="hover:text-black dark:hover:text-white transition-colors cursor-pointer p-1" title="X (Twitter)">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </span>
              <span className="hover:text-black dark:hover:text-white transition-colors cursor-pointer p-1" title="Website">
                <Globe className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>

        {/* 3. Mac Finder Style Segmented Control Track */}
        <div className="px-6 sm:px-8 py-3 bg-zinc-100 dark:bg-[#121417] border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="ios-segmented-track">
            <button
              type="button"
              onClick={() => {
                playTabSelect();
                setActiveTab('articles');
              }}
              className={`ios-segment-btn flex items-center gap-1.5 ${
                activeTab === 'articles' ? 'active' : ''
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>ARTICLES ({authorBlogs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playTabSelect();
                setActiveTab('notes');
              }}
              className={`ios-segment-btn flex items-center gap-1.5 ${
                activeTab === 'notes' ? 'active' : ''
              }`}
            >
              <FileText className="w-3 h-3 text-amber-500" />
              <span>LEGAL PAD NOTES ({authorNotes.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playTabSelect();
                setActiveTab('about');
              }}
              className={`ios-segment-btn flex items-center gap-1.5 ${
                activeTab === 'about' ? 'active' : ''
              }`}
            >
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span>HARDWARE BADGES</span>
            </button>
          </div>
        </div>

        {/* 4. Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4">
          {/* Tab 1: Articles List */}
          {activeTab === 'articles' && (
            <div className="space-y-3">
              {authorBlogs.length > 0 ? (
                authorBlogs.map((b) => (
                  <div
                    key={b.blogId ?? b.id}
                    onClick={() => {
                      playKeyClick();
                      if (onSelectBlog) {
                        onSelectBlog(b);
                        onClose();
                      }
                    }}
                    className="group mac-blog-card p-4 flex flex-col justify-between space-y-2 cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                      <span className="retro-tag-pill uppercase">{b.category?.categoryName || 'PUBLICATION'}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {b.readTimeMinutes || 4} min read
                      </span>
                    </div>
                    <h4 className="font-bold text-zinc-950 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-sans">
                      {b.title}
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {b.content.slice(0, 140)}...
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <div className="flex items-center gap-2 text-zinc-500 font-mono">
                        <span>👏 {b.clapsCount ?? b.likesCount ?? 0}</span>
                        <span>&bull;</span>
                        <span>💬 {b.commentCount ?? 0}</span>
                      </div>
                      <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Read</span> <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-zinc-400 font-mono">
                  This author hasn&apos;t published any other articles yet.
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Mac OS X Mountain Lion Yellow Legal-Pad Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {authorNotes.map((note) => (
                <div
                  key={note.id}
                  className="ios-notes-paper p-6 pl-16 rounded-xl border border-amber-300 dark:border-amber-900/60 shadow-md space-y-2 relative"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="retro-tag-pill uppercase">
                      #{note.topic}
                    </span>
                    <span className="text-zinc-500 text-[11px] font-bold">{note.date}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed font-sans">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 font-mono pt-2 border-t border-amber-200/50 dark:border-amber-900/30">
                    <button
                      type="button"
                      onClick={() => playKeyClick()}
                      className="cursor-pointer hover:text-blue-600 font-bold"
                    >
                      👏 {note.claps} claps
                    </button>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest">
                      MAC OS X MOUNTAIN LION NOTE
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Hardware IC Chip Metallic Badges */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-zinc-950 dark:text-white flex items-center gap-1.5 uppercase font-mono">
                  <Cpu className="w-3.5 h-3.5 text-blue-500" />
                  <span>HARDWARE &amp; ARCHITECTURE CHIP BADGES</span>
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {techStack.map((tech) => (
                    <span
                      key={tech}
                      className="mac-hardware-chip-badge"
                    >
                      <Layers className="w-3 h-3 text-blue-400" />
                      <span>{tech}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                <span className="font-bold text-zinc-950 dark:text-white flex items-center gap-1.5 font-mono">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>ARCHITECTURE VISION &amp; MANIFESTO</span>
                </span>
                <p className="leading-relaxed font-sans">
                  Stripped of synthetic telemetry and artificial intelligence illusions; high-throughput, deterministic, and sustainable enterprise software architectures. Zero locking with Java 22 Loom virtual threads, precision semantic inference in pgvector 128D space.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
