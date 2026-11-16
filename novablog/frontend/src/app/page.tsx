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
import { AuthorProfileModal } from '@/components/AuthorProfileModal';
import { OmnibarModal } from '@/components/OmnibarModal';
import { SkeuomorphicLeatherBookmarksBinder } from '@/components/SkeuomorphicLeatherBookmarksBinder';
import { playKeyClick, playTabSelect } from '@/lib/retroAudio';
import { BlogDto, BlogSemanticSearchResultDto } from '@/types/api';
import { ApiClient } from '@/lib/api';
import { useBlogsQuery, useCategoriesQuery } from '@/hooks/useBlogs';
import { useBookmarks, useFollowedAuthors } from '@/hooks/useSocialStore';
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
  Loader2,
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
    role: 'Senior Systems Architect & Tech Lead',
    initial: 'A',
    bio: 'Java 22 Loom sanal iş parçacıkları, yüksek throughput dağıtık sistemler ve Spring Boot mimarisi.',
    articlesCount: 4,
    topics: ['Java 22', 'Loom', 'Distributed Systems'],
  },
  {
    name: 'Dr. Selin Demir',
    role: 'Principal AI & Data Systems Researcher',
    initial: 'S',
    bio: 'Spring AI, pgvector 128D anlamsal arama ve büyük dil modellerinde RAG optimizasyonu.',
    articlesCount: 1,
    topics: ['Spring AI', 'Vector DB', 'Embeddings'],
  },
  {
    name: 'Caner Aydın',
    role: 'Staff Cloud & Kubernetes Architect',
    initial: 'C',
    bio: 'Cloud-native mimariler, eBPF gözlemlenebilirlik ve sıfır güven (Zero-Trust) güvenlik altyapıları.',
    articlesCount: 1,
    topics: ['Security', 'Cloud', 'TOTP'],
  },
];

const TOPIC_PILLS = [
  { id: 'all', label: 'TÜMÜ', tag: null },
  { id: 'java-22', label: 'JAVA 22', tag: 'java' },
  { id: 'spring-boot', label: 'SPRING BOOT', tag: 'spring' },
  { id: 'loom', label: 'VIRTUAL THREADS', tag: 'loom' },
  { id: 'ai', label: 'SPRING AI & VEKTÖR', tag: 'ai' },
  { id: 'redis', label: 'REDIS ÖNBELLEK', tag: 'redis' },
  { id: 'architecture', label: 'SİSTEM MİMARİSİ', tag: 'distributed' },
  { id: 'security', label: '2FA GÜVENLİK', tag: 'security' },
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
  const [isOmnibarOpen, setIsOmnibarOpen] = useState(false);
  const [activeAuthorProfile, setActiveAuthorProfile] = useState<string | null>(null);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
  const [semanticResults, setSemanticResults] = useState<BlogSemanticSearchResultDto[] | null>(null);
  const [isSearchingSemantic, setIsSearchingSemantic] = useState(false);

  // Social Graph & Reading List reactive stores
  const bookmarkedIds = useBookmarks();
  const followedAuthors = useFollowedAuthors();

  const focusSearchInput = () => {
    setIsOmnibarOpen(true);
  };

  const handleTriggerSemanticSearch = async (queryText?: string) => {
    const q = (queryText || searchTerm).trim();
    if (!q) return;
    setIsSearchingSemantic(true);
    try {
      const res = await ApiClient.searchSemantic(q, 0.45, 10);
      setSemanticResults(res);
    } catch {
      setSemanticResults([]);
    } finally {
      setIsSearchingSemantic(false);
    }
  };

  useEffect(() => {
    ApiClient.checkBackendHealth().then(setIsBackendOnline);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOmnibarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFollowAuthor = (authorName: string) => {
    if (typeof window === 'undefined') return;
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('novablog_followed_authors') || '[]');
      let updated: string[];
      if (saved.includes(authorName)) {
        updated = saved.filter((a: string) => a !== authorName);
      } else {
        updated = [...saved, authorName];
      }
      localStorage.setItem('novablog_followed_authors', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('followed-authors-updated', { detail: updated }));
      ApiClient.toggleFollow(authorName);
    } catch {
      // ignore
    }
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
    const authorUsername = blog.authorUsername || blog.author || 'admin';
    const authorDisplayName =
      blog.authorUsername === 'selindemir'
        ? 'Dr. Selin Demir'
        : blog.authorUsername === 'caneraydin'
        ? 'Caner Aydın'
        : blog.author || 'Abdullah Berke Özder';

    // 1. Feed Mode Filter
    if (feedMode === 'following') {
      if (
        followedAuthors.length > 0 &&
        !followedAuthors.includes(authorUsername) &&
        !followedAuthors.includes(authorDisplayName)
      ) {
        return false;
      }
    } else if (feedMode === 'bookmarks') {
      if (!bookmarkedIds.includes(blogId)) {
        return false;
      }
    }

    // 2. Category Filter
    const categoryId = blog.category?.categoryId || blog.blogCategoryDto?.categoryId || blog.blogCategoryDto?.blogCategoryId;
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
        authorUsername.toLowerCase().includes(s) ||
        authorDisplayName.toLowerCase().includes(s) ||
        blog.tags?.some((t) => t.toLowerCase().includes(s));
      if (!matchesSearch) return false;
    }

    return true;
  });

  // Sorted blogs based on Explore Sub-sort
  const sortedBlogs = [...filteredBlogs].sort((a, b) => {
    if (feedMode === 'explore') {
      if (exploreSort === 'trending') {
        const clapsA = a.clapsCount ?? a.likesCount ?? a.likes ?? 0;
        const clapsB = b.clapsCount ?? b.likesCount ?? b.likes ?? 0;
        const scoreA = clapsA * 2 + (a.viewsCount ?? a.views ?? 0) * 0.2 + (a.bookmarksCount ?? 0) * 3;
        const scoreB = clapsB * 2 + (b.viewsCount ?? b.views ?? 0) * 0.2 + (b.bookmarksCount ?? 0) * 3;
        return scoreB - scoreA;
      }
      if (exploreSort === 'featured') {
        const isFeaturedA = a.isFeatured ? 1 : 0;
        const isFeaturedB = b.isFeatured ? 1 : 0;
        return isFeaturedB - isFeaturedA;
      }
    }
    // 'latest' or default chronological
    const dateA = new Date(a.publishedAt || a.createdDate || 0).getTime();
    const dateB = new Date(b.publishedAt || b.createdDate || 0).getTime();
    return dateB - dateA;
  });

  const activeCategoryObj = categories.find((c) => (c.categoryId ?? c.blogCategoryId) === selectedCategory);
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
        onFocusSearch={focusSearchInput}
      />

      <main className="flex-1 ios-pinstripe min-h-screen">
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
          {/* De-Boxed Feed Header: Direct Canvas Breathing Room with Hairline Separation */}
          <div className="space-y-4 pb-6 border-b border-zinc-200/90 dark:border-zinc-800/80">
            {/* Top Bar: Feed Switcher & Contextual Filter Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Primary Dual-Feed Tabs with Mac OS X Segmented Styling */}
              <div className="ios-segmented-track w-fit">
                <button
                  type="button"
                  onClick={() => {
                    playTabSelect();
                    setFeedMode('explore');
                  }}
                  className={`ios-segment-btn flex items-center gap-2 ${
                    feedMode === 'explore' ? 'active' : ''
                  }`}
                >
                  <Compass className="w-4 h-4 text-emerald-500" />
                  <span>KEŞFET</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playTabSelect();
                    setFeedMode('following');
                  }}
                  className={`ios-segment-btn flex items-center gap-2 ${
                    feedMode === 'following' ? 'active' : ''
                  }`}
                >
                  <Users className="w-4 h-4 text-cyan-500" />
                  <span>TAKİP EDİLENLER</span>
                  {followedAuthors.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-cyan-500 text-white text-[10px] font-mono flex items-center justify-center font-bold shadow-sm">
                      {followedAuthors.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playTabSelect();
                    setFeedMode('bookmarks');
                  }}
                  className={`ios-segment-btn flex items-center gap-2 ${
                    feedMode === 'bookmarks' ? 'active' : ''
                  }`}
                >
                  <Bookmark className="w-4 h-4 text-amber-500" />
                  <span>OKUMA LİSTEM</span>
                  {bookmarkedIds.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-mono flex items-center justify-center font-bold shadow-sm">
                      {bookmarkedIds.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Right: Dedicated Contextual Filter Search (Single Source of Truth, No Action Duplication) */}
              <div className="relative w-full sm:w-72 lg:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                <input
                  id="blog-search-input"
                  name="blogSearch"
                  type="text"
                  placeholder="Başlık, yazar veya etiket filtrele..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchTerm.trim()) {
                      handleTriggerSemanticSearch(searchTerm);
                    }
                  }}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-sm font-sans text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                {searchTerm ? (
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleTriggerSemanticSearch(searchTerm)}
                      disabled={isSearchingSemantic}
                      title="Spring AI Vektör Araması (pgvector)"
                      aria-label="Vektör Ara"
                      className="p-1 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSearchingSemantic ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setSemanticResults(null);
                      }}
                      aria-label="Aramayı Temizle"
                      className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleTriggerSemanticSearch()}
                    title="Spring AI Anlamsal Arama ile Tara"
                    aria-label="Anlamsal Arama"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-zinc-400 hover:text-emerald-500 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Sub-bar: Edge-Faded Topic Ribbon & Apple HIG Segmented Sort Control */}
            <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              {/* Topic Ribbon with CSS Mask Edge-Fade */}
              <div
                className="relative overflow-x-auto pb-1 md:pb-0 scrollbar-none flex-1 min-w-0"
                style={{
                  WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
                  maskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
                }}
              >
                <div className="flex items-center gap-2 pr-6">
                  {TOPIC_PILLS.map((topic) => {
                    const isActive = selectedTopic === topic.tag;
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => {
                          playKeyClick();
                          setSelectedTopic(topic.tag);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                          isActive
                            ? 'bg-zinc-950 dark:bg-white text-white dark:text-black shadow-sm'
                            : 'bg-zinc-100 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {topic.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Explore Sub-Sort: Apple HIG Segmented Control */}
              {feedMode === 'explore' && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider hidden lg:inline">
                    SIRALA:
                  </span>
                  <div className="inline-flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200/70 dark:border-zinc-800/80 font-mono text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        playKeyClick();
                        setExploreSort('trending');
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                        exploreSort === 'trending'
                          ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-bold shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span>Trendler</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playKeyClick();
                        setExploreSort('featured');
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                        exploreSort === 'featured'
                          ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-bold shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>Editörün Seçimi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playKeyClick();
                        setExploreSort('latest');
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                        exploreSort === 'latest'
                          ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-bold shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Clock className="w-3 h-3 text-purple-400" />
                      <span>En Yeni</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Active Filter Pill Bar */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 pt-2 text-xs">
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

                    {/* Spring AI pgvector Semantic Results Banner & Grid */}
          {semanticResults !== null && (
            <div className="rounded-3xl p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/30 space-y-4 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                      Spring AI & pgvector Anlamsal Arama Sonuçları
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold">
                        {semanticResults.length} eşleşme
                      </span>
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      128-boyutlu gömme vektör uzayında kosinüs benzerliği (cosine distance) ile sıralandı.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSemanticResults(null)}
                  className="px-3 py-1.5 rounded-full bg-zinc-200/80 dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Sonuçları Temizle</span>
                </button>
              </div>

              {semanticResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                  Belirtilen eşik değerinde (threshold: 0.45) anlamsal eşleşme bulunamadı. Standart metin araması sonuçlarını inceleyebilirsiniz.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {semanticResults.map((result, idx) => (
                    <div
                      key={result.blog.blogId ?? result.blog.id ?? `semantic-${idx}`}
                      className="relative p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-500/30 hover:border-emerald-500 transition-all flex flex-col justify-between space-y-3 cursor-pointer group shadow-sm hover:shadow-md"
                      onClick={() => setSelectedBlog(result.blog)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold">
                            Benzerlik: %{(result.similarityScore * 100).toFixed(1)}
                          </span>
                          <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider">pgvector</span>
                        </div>
                        <h5 className="font-bold text-sm text-zinc-950 dark:text-white group-hover:text-emerald-500 transition-colors line-clamp-2">
                          {result.blog.title}
                        </h5>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {result.blog.header || result.blog.content}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 flex items-center justify-between">
                        <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[150px]">
                          {result.blog.author || 'Mühendis'}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold group-hover:underline flex items-center gap-1">
                          İncele <span>→</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
                        <button
                          type="button"
                          onClick={() => setActiveAuthorProfile(author.name)}
                          className="flex items-center gap-3 cursor-pointer group/author text-left bg-transparent border-none p-0"
                          title="Yazar profilini aç"
                        >
                          <div className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm group-hover/author:ring-2 group-hover/author:ring-emerald-500 transition-all">
                            {author.initial}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-zinc-950 dark:text-white text-sm truncate group-hover/author:text-emerald-500 hover:underline">
                              {author.name}
                            </h4>
                            <p className="text-[11px] text-zinc-500 truncate">{author.role}</p>
                          </div>
                        </button>

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

          {/* Bookmarks Empty State: Skeuomorphic Stitched Saddle-Leather Binder */}
          {feedMode === 'bookmarks' && bookmarkedIds.length === 0 && (
            <SkeuomorphicLeatherBookmarksBinder
              title="Okuma Listeniz Henüz Boş"
              subtitle="Makalelerin üzerindeki yer imi (bookmark) simgesine tıklayarak daha sonra çevrimdışı incelemek istediğiniz teknik yazıları bu arşive ekleyebilirsiniz."
              badgeText="MAC OS X SAFARI READING LIST"
              actionText="Makaleleri Keşfet"
              onAction={() => {
                setFeedMode('explore');
              }}
            />
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
                  onAuthorClick={setActiveAuthorProfile}
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

        {/* Section Landmark: Transition from Technical Publication to Interactive Architecture Consoles */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>CANLI SİSTEM MİMARİSİ LABORATUVARI</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white font-sans">
                İnteraktif Çekirdek ve Telemetri Simülasyonları
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                Java 22 Loom sanal iş parçacıklarını, pgvector 128D anlamsal eşleşmelerini ve Redis önbellek mekanizmalarını canlı olarak test edin ve telemetri metriklerini gözlemleyin.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>CANLI TEST ORTAMI</span>
            </div>
          </div>
        </div>

        {/* 3. Deep Architecture Modules (Navbar Jump Targets) */}
        <div id="modular-architecture-console" className="scroll-mt-24 pt-4">
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
        onAuthorClick={setActiveAuthorProfile}
        followedAuthors={followedAuthors}
        onToggleFollow={toggleFollowAuthor}
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

      {/* Author Profile Modal (Medium-Style Personal Publication & Stats) */}
      <AuthorProfileModal
        authorName={activeAuthorProfile}
        isOpen={Boolean(activeAuthorProfile)}
        onClose={() => setActiveAuthorProfile(null)}
        onSelectBlog={(b) => setSelectedBlog(b)}
        allBlogs={blogs}
        followedAuthors={followedAuthors}
        onToggleFollow={toggleFollowAuthor}
      />

      {/* Raycast / Linear-grade Command Palette Omnibar Modal (Cmd+K) */}
      <OmnibarModal
        isOpen={isOmnibarOpen}
        onClose={() => setIsOmnibarOpen(false)}
        blogs={blogs}
        onSelectBlog={(b) => setSelectedBlog(b)}
        onSelectAuthor={(auth) => setActiveAuthorProfile(auth)}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenTelemetry={() => setIsTelemetryModalOpen(true)}
        onOpenTwoFactor={() => setIsTwoFactorModalOpen(true)}
        onTriggerSemanticSearch={(q) => {
          setSearchTerm(q);
          handleTriggerSemanticSearch(q);
          const el = document.getElementById('articles-feed');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Floating Copilot Widget */}
      <FloatingCopilotWidget
        onOpenArticle={(blogId: number) => {
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
