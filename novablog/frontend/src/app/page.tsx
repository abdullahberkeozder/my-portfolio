'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Navbar, NavTab } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { ModularArchitectureConsole } from '@/components/ModularArchitectureConsole';
import { FieldDemoReels } from '@/components/FieldDemoReels';
import { PressReviewsCarousel } from '@/components/PressReviewsCarousel';
import { BlogCard } from '@/components/BlogCard';
import { BlogDetailModal } from '@/components/BlogDetailModal';
import { CreateBlogModal } from '@/components/CreateBlogModal';
import { SystemTelemetryModal } from '@/components/SystemTelemetryModal';
import { TwoFactorModal } from '@/components/TwoFactorModal';
import { SemanticSearchStudio } from '@/components/SemanticSearchStudio';
import { AiPlayground } from '@/components/AiPlayground';
import { AdminBatchStudio } from '@/components/AdminBatchStudio';
import { SystemBlueprintSection } from '@/components/SystemBlueprintSection';
import { Footer } from '@/components/Footer';
import { AboutManifestoModal } from '@/components/AboutManifestoModal';
import { FloatingCopilotWidget } from '@/components/FloatingCopilotWidget';
import { BlogDto } from '@/types/api';
import { ApiClient } from '@/lib/api';
import { useBlogsQuery, useCategoriesQuery } from '@/hooks/useBlogs';
import {
  Search,
  RefreshCw,
  X,
  Compass,
  Users,
  Bookmark,
  TrendingUp,
  Sparkles,
  Clock,
  UserPlus,
  Check,
  PenSquare,
} from 'lucide-react';

type FeedTabMode = 'explore' | 'following' | 'bookmarks';
type ExploreSortOption = 'trending' | 'featured' | 'latest';

interface SuggestedAuthor {
  name: string;
  role: string;
  initial: string;
  bio: string;
  articlesCount: number;
  topics: string[];
}

const SUGGESTED_AUTHORS: SuggestedAuthor[] = [
  {
    name: 'Abdullah Berke Özder',
    role: 'Staff Systems Architect & Tech Lead',
    initial: 'A',
    bio: 'Java 22 Loom sanal iş parçacıkları, yüksek throughput dağıtık sistemler ve Spring AI araştırmacısı.',
    articlesCount: 24,
    topics: ['Java 22', 'Loom', 'Spring Boot 4'],
  },
  {
    name: 'Caner Aydın',
    role: 'Senior AI & Data Infrastructure Lead',
    initial: 'C',
    bio: 'Spring AI, pgvector 128D anlamsal arama ve hibrit sıralama mimarileri.',
    articlesCount: 12,
    topics: ['Spring AI', 'Vector DB', 'Embeddings'],
  },
  {
    name: 'Zeynep Kaya',
    role: 'Principal Cloud & SRE Engineer',
    initial: 'Z',
    bio: 'Kubernetes, Redis Write-Behind önbellekleme ve sıfır-kesinti dayanıklılık altyapıları.',
    articlesCount: 18,
    topics: ['Redis', 'Cloud Native', 'Concurrency'],
  },
];

const TOPIC_PILLS = [
  { id: 'all', label: 'TÜMÜ', tag: null },
  { id: 'java-22', label: 'JAVA 22', tag: 'java' },
  { id: 'spring-boot', label: 'SPRING BOOT', tag: 'spring' },
  { id: 'loom', label: 'VIRTUAL THREADS', tag: 'virtual-threads' },
  { id: 'ai', label: 'SPRING AI & VEKTÖR', tag: 'spring-ai' },
  { id: 'redis', label: 'REDIS ÖNBELLEK', tag: 'redis' },
  { id: 'architecture', label: 'SİSTEM MİMARİSİ', tag: 'concurrency' },
  { id: 'security', label: '2FA GÜVENLİK', tag: 'siber-guvenlik' },
];

export default function Home() {
  const queryClient = useQueryClient();
  const { data: blogs = [], isLoading: isLoadingBlogs, refetch: refetchBlogs } = useBlogsQuery();
  const { data: categories = [] } = useCategoriesQuery();

  const [activeTab, setActiveTab] = useState<NavTab>('feed');
  const [feedMode, setFeedMode] = useState<FeedTabMode>('explore');
  const [exploreSort, setExploreSort] = useState<ExploreSortOption>('trending');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlog, setSelectedBlog] = useState<BlogDto | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  // Social Graph & Reading List state initialized lazily from localStorage
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('novablog_bookmarks') || '[]');
      } catch {
        return [];
      }
    }
    return [];
  });

  const [followedAuthors, setFollowedAuthors] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('novablog_followed_authors') || '[]');
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    ApiClient.checkBackendHealth().then(setIsBackendOnline);

    if (typeof window !== 'undefined') {
      const handleBookmarksUpdated = (e: Event) => {
        const custom = e as CustomEvent<number[]>;
        setBookmarkedIds(custom.detail || []);
      };
      window.addEventListener('bookmarks-updated', handleBookmarksUpdated);
      return () => window.removeEventListener('bookmarks-updated', handleBookmarksUpdated);
    }
  }, []);

  const toggleFollowAuthor = (authorName: string) => {
    setFollowedAuthors((prev) => {
      let updated: string[];
      if (prev.includes(authorName)) {
        updated = prev.filter((a) => a !== authorName);
      } else {
        updated = [...prev, authorName];
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('novablog_followed_authors', JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Track active section as user scrolls for high-end reactive nav indicator
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id === 'articles-feed') setActiveTab('feed');
            else if (id === 'modular-architecture-console') setActiveTab('system');
            else if (id === 'ai-vector-studio') setActiveTab('ai-search');
            else if (id === 'batch-etl-studio') setActiveTab('admin-batch');
          }
        });
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: 0.1 }
    );

    const sectionIds = [
      'articles-feed',
      'modular-architecture-console',
      'ai-vector-studio',
      'batch-etl-studio',
    ];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleRefresh = async () => {
    const online = await ApiClient.checkBackendHealth();
    setIsBackendOnline(online);
    refetchBlogs();
  };

  const handleBlogCreated = (newBlog: BlogDto) => {
    queryClient.setQueryData<BlogDto[]>(['blogs'], (old) => [newBlog, ...(old || [])]);
  };

  // Filtered blogs based on Feed Mode, Search, Topic, Category
  const filteredBlogs = blogs.filter((blog) => {
    const blogId = blog.blogId ?? blog.id ?? 0;
    const authorName = blog.author || 'Abdullah Berke Özder';

    // 1. Feed Mode Filter
    if (feedMode === 'following') {
      if (followedAuthors.length > 0 && !followedAuthors.includes(authorName)) {
        return false;
      }
    } else if (feedMode === 'bookmarks') {
      if (!bookmarkedIds.includes(blogId)) {
        return false;
      }
    }

    // 2. Category Filter
    const categoryId = blog.category?.categoryId || blog.blogCategoryDto?.categoryId;
    if (selectedCategory !== null && categoryId !== selectedCategory) {
      return false;
    }

    // 3. Topic Tag Filter
    if (selectedTopic !== null) {
      const matchesTopic =
        blog.tags?.some((t) => t.toLowerCase().includes(selectedTopic.toLowerCase())) ||
        blog.header.toLowerCase().includes(selectedTopic.toLowerCase()) ||
        blog.title.toLowerCase().includes(selectedTopic.toLowerCase());
      if (!matchesTopic) return false;
    }

    // 4. Search Filter
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      const matchesSearch =
        blog.title.toLowerCase().includes(s) ||
        blog.header.toLowerCase().includes(s) ||
        authorName.toLowerCase().includes(s) ||
        blog.tags?.some((t) => t.toLowerCase().includes(s));
      if (!matchesSearch) return false;
    }

    return true;
  });

  // Sorted blogs based on Explore Sub-sort
  const sortedBlogs = [...filteredBlogs].sort((a, b) => {
    if (feedMode === 'explore') {
      if (exploreSort === 'trending') {
        const scoreA = (a.viewsCount ?? a.views ?? 0) * 0.2 + (a.likesCount ?? a.likes ?? 0) * 1.5;
        const scoreB = (b.viewsCount ?? b.views ?? 0) * 0.2 + (b.likesCount ?? b.likes ?? 0) * 1.5;
        return scoreB - scoreA;
      }
      if (exploreSort === 'featured') {
        const isFeaturedA = a.hasVectorEmbedding ? 1 : 0;
        const isFeaturedB = b.hasVectorEmbedding ? 1 : 0;
        return isFeaturedB - isFeaturedA;
      }
    }
    // 'latest' or default chronological
    const dateA = new Date(a.publishedAt || a.createdDate || 0).getTime();
    const dateB = new Date(b.publishedAt || b.createdDate || 0).getTime();
    return dateB - dateA;
  });

  const activeCategoryObj = categories.find((c) => c.categoryId === selectedCategory);
  const hasActiveFilters = Boolean(
    selectedCategory !== null || selectedTopic !== null || searchTerm.trim()
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans transition-colors duration-300">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendOnline={isBackendOnline}
        onRefreshHealth={handleRefresh}
        onOpenTelemetry={() => setIsTelemetryModalOpen(true)}
        onOpenArchitectureConsole={() => {
          const el = document.getElementById('modular-architecture-console');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenTwoFactor={() => setIsTwoFactorModalOpen(true)}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      <main className="flex-1">
        {/* 1. Publication Hero Header */}
        <HeroSection
          onExploreAI={() => {
            const el = document.getElementById('ai-vector-studio');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />

        {/* 2. Main Publication Feed (Keşfet / Takip Edilenler / Okuma Listem) */}
        <div id="articles-feed" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 scroll-mt-20">
          {/* Dual-Feed Tab Switcher & Action Bar */}
          <div className="space-y-4 p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/[0.08] dark:border-white/[0.08] shadow-sm">
            {/* Top Bar: Feed Switcher & Omnibar Search */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Primary Dual-Feed Tabs */}
              <div className="flex items-center gap-2 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900/80 w-fit">
                <button
                  type="button"
                  onClick={() => setFeedMode('explore')}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    feedMode === 'explore'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Compass className="w-4 h-4 text-emerald-500" />
                  <span>KEŞFET</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFeedMode('following')}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    feedMode === 'following'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4 text-cyan-500" />
                  <span>TAKİP EDİLENLER</span>
                  {followedAuthors.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[10px] font-mono flex items-center justify-center font-bold">
                      {followedAuthors.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setFeedMode('bookmarks')}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    feedMode === 'bookmarks'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Bookmark className="w-4 h-4 text-amber-500" />
                  <span>OKUMA LİSTEM</span>
                  {bookmarkedIds.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-mono flex items-center justify-center font-bold">
                      {bookmarkedIds.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Right: Search Omnibar & Write CTA */}
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    id="blog-search-input"
                    name="blogSearch"
                    type="text"
                    placeholder="Başlık, yazar veya etiket ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs font-sans text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-black text-xs font-bold tracking-wide uppercase transition-all shadow-sm hover:opacity-90 active:scale-95 cursor-pointer whitespace-nowrap"
                  title="Yeni Teknik Makale Yayınla"
                >
                  <PenSquare className="w-3.5 h-3.5 text-emerald-400 dark:text-zinc-950" />
                  <span className="hidden sm:inline">YENİ MAKALE YAZ</span>
                  <span className="sm:hidden">YAZ</span>
                </button>
              </div>
            </div>

            {/* Sub-bar: Topic Pills & Sorting */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              {/* Topic Ribbon */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {TOPIC_PILLS.map((topic) => {
                  const isActive = selectedTopic === topic.tag;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => setSelectedTopic(topic.tag)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-zinc-950 dark:bg-white text-white dark:text-black shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      {topic.label}
                    </button>
                  );
                })}
              </div>

              {/* Explore Sub-Sort */}
              {feedMode === 'explore' && (
                <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                  <span className="text-zinc-400 font-bold uppercase mr-1">SIRALA:</span>
                  <button
                    type="button"
                    onClick={() => setExploreSort('trending')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                      exploreSort === 'trending'
                        ? 'bg-zinc-900 dark:bg-zinc-800 text-white font-bold'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span>Trendler</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExploreSort('featured')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                      exploreSort === 'featured'
                        ? 'bg-zinc-900 dark:bg-zinc-800 text-white font-bold'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Editörün Seçimi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExploreSort('latest')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                      exploreSort === 'latest'
                        ? 'bg-zinc-900 dark:bg-zinc-800 text-white font-bold'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Clock className="w-3 h-3 text-purple-400" />
                    <span>En Yeni</span>
                  </button>
                </div>
              )}
            </div>

            {/* Active Filter Pill */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
                <span className="text-zinc-500">
                  {sortedBlogs.length} makale listeleniyor
                  {selectedTopic ? ` (#${selectedTopic})` : ''}
                  {activeCategoryObj ? ` (${activeCategoryObj.categoryName})` : ''}
                  {searchTerm ? ` "${searchTerm}"` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTopic(null);
                    setSelectedCategory(null);
                    setSearchTerm('');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-[11px] font-bold transition-colors cursor-pointer hover:bg-rose-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                  Filtreyi Sıfırla
                </button>
              </div>
            )}
          </div>

          {/* Smart Seed Onboarding Widget (When Following Feed is Empty) */}
          {feedMode === 'following' && followedAuthors.length === 0 && (
            <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0d0f14] border border-zinc-200/90 dark:border-zinc-800/90 space-y-6 shadow-sm">
              <div className="max-w-2xl space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-mono font-bold uppercase">
                  <Users className="w-3.5 h-3.5" />
                  <span>KİŞİSEL AKIŞ BAŞLANGICI</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white">
                  Takip ettiğiniz mühendislerin makaleleri burada görünür.
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Şu anda henüz bir yazar takip etmiyorsunuz. Nova topluluğundaki kıdemli mimarları ve sistem
                  mühendislerini takip ederek kişiselleştirilmiş akışınızı hemen oluşturun:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SUGGESTED_AUTHORS.map((author) => {
                  const isFollowing = followedAuthors.includes(author.name);
                  return (
                    <div
                      key={author.name}
                      className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm">
                            {author.initial}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-zinc-950 dark:text-white text-sm truncate">
                              {author.name}
                            </h4>
                            <p className="text-[11px] text-zinc-500 truncate">{author.role}</p>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {author.bio}
                        </p>

                        <div className="flex flex-wrap gap-1">
                          {author.topics.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleFollowAuthor(author.name)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isFollowing
                            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                            : 'bg-zinc-950 dark:bg-white text-white dark:text-black hover:opacity-90'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Takip Ediliyor</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Takip Et</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bookmarks Empty State */}
          {feedMode === 'bookmarks' && bookmarkedIds.length === 0 && (
            <div className="py-20 text-center space-y-4 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8">
              <Bookmark className="w-8 h-8 text-amber-500 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-zinc-950 dark:text-white text-base">
                  Okuma Listeniz Henüz Boş
                </h4>
                <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
                  Makalelerin üzerindeki yer imi (bookmark) simgesine tıklayarak daha sonra okumak istediğiniz teknik yazıları buraya kaydedebilirsiniz.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFeedMode('explore')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-black text-xs font-bold transition-transform active:scale-95 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Makaleleri Keşfet</span>
              </button>
            </div>
          )}

          {/* Blog Cards Grid */}
          {isLoadingBlogs ? (
            <div className="py-24 text-center text-zinc-400 space-y-3 font-mono">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500" />
              <p className="text-xs uppercase tracking-widest">YAYIN MAKALELERİ YÜKLENİYOR...</p>
            </div>
          ) : sortedBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedBlogs.map((blog, idx) => (
                <BlogCard
                  key={blog.blogId ?? blog.id ?? `blog-${idx}`}
                  blog={blog}
                  onSelect={setSelectedBlog}
                  onTagClick={(tag) => setSelectedTopic(tag)}
                />
              ))}
            </div>
          ) : (
            !(feedMode === 'following' && followedAuthors.length === 0) &&
            !(feedMode === 'bookmarks' && bookmarkedIds.length === 0) && (
              <div className="py-20 text-center space-y-4 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8">
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  Kriterlerinize uygun makale bulunamadı.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTopic(null);
                    setSelectedCategory(null);
                    setSearchTerm('');
                    setFeedMode('explore');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-black text-xs font-bold transition-transform active:scale-95 cursor-pointer uppercase"
                >
                  Tüm Makaleleri Göster
                </button>
              </div>
            )
          )}
        </div>

        {/* 3. Deep Architecture Modules (Navbar Jump Targets) */}
        <div id="modular-architecture-console" className="scroll-mt-24 border-t border-black/[0.08] dark:border-white/[0.08] pt-12">
          <ModularArchitectureConsole />
        </div>

        <div id="ai-vector-studio" className="scroll-mt-24 border-t border-black/[0.08] dark:border-white/[0.08] pt-12">
          <SemanticSearchStudio onSelectBlog={setSelectedBlog} />
          <div className="border-t border-black/[0.08] dark:border-white/[0.08] mt-8">
            <AiPlayground />
          </div>
        </div>

        <div id="batch-etl-studio" className="scroll-mt-24 border-t border-black/[0.08] dark:border-white/[0.08] pt-12">
          <AdminBatchStudio />
        </div>

        {/* Field Demo Reels */}
        <FieldDemoReels
          onOpenArchitectureConsole={(moduleId) => {
            const el = document.getElementById('modular-architecture-console');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            window.dispatchEvent(new CustomEvent('select-console-module', { detail: moduleId }));
            window.dispatchEvent(new CustomEvent('run-console-simulation'));
          }}
        />

        {/* Press / Community Reviews */}
        <PressReviewsCarousel />

        {/* Technical Blueprint */}
        <div id="system-blueprint-section" className="scroll-mt-24">
          <SystemBlueprintSection
            onOpenTelemetry={() => setIsTelemetryModalOpen(true)}
            onOpenTwoFactor={() => setIsTwoFactorModalOpen(true)}
            onOpenAbout={() => setIsAboutModalOpen(true)}
          />
        </div>
      </main>

      {/* Detail Modal */}
      <BlogDetailModal
        blog={selectedBlog}
        onClose={() => setSelectedBlog(null)}
        onTagClick={(tag) => setSelectedTopic(tag)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
      />

      {/* Create Modal */}
      {isCreateModalOpen && (
        <CreateBlogModal
          categories={categories}
          onClose={() => setIsCreateModalOpen(false)}
          onBlogCreated={handleBlogCreated}
        />
      )}

      {/* System Telemetry & Architecture Modal */}
      <SystemTelemetryModal
        isOpen={isTelemetryModalOpen}
        onClose={() => setIsTelemetryModalOpen(false)}
        isBackendOnline={isBackendOnline}
        onMetricsFlushed={() => refetchBlogs()}
      />

      {/* Two-Factor Authentication Modal */}
      <TwoFactorModal
        isOpen={isTwoFactorModalOpen}
        onClose={() => setIsTwoFactorModalOpen(false)}
      />

      {/* About Manifesto Modal */}
      <AboutManifestoModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      {/* Floating Copilot Widget */}
      <FloatingCopilotWidget
        onOpenArticle={(blogId) => {
          const matched = blogs.find((b) => (b.id ?? b.blogId) === blogId);
          if (matched) setSelectedBlog(matched);
        }}
        onOpenTelemetry={() => setIsTelemetryModalOpen(true)}
        onOpenTwoFactor={() => setIsTwoFactorModalOpen(true)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
      />

      {/* Footer */}
      <Footer
        onOpenTelemetry={() => setIsTelemetryModalOpen(true)}
        onOpenArchitectureConsole={() => {
          const el = document.getElementById('modular-architecture-console');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenTwoFactor={() => setIsTwoFactorModalOpen(true)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
      />
    </div>
  );
}
