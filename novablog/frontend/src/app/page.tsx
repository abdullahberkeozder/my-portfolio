'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { StoriesCarousel } from '@/components/StoriesCarousel';
import { ModularArchitectureConsole } from '@/components/ModularArchitectureConsole';
import { SpotlightBanner } from '@/components/SpotlightBanner';
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
import { FloatingCopilotWidget } from '@/components/FloatingCopilotWidget';
import { BlogDto } from '@/types/api';
import { ApiClient } from '@/lib/api';
import { useBlogsQuery, useCategoriesQuery } from '@/hooks/useBlogs';
import { Search, RefreshCw, SlidersHorizontal, X, Plus } from 'lucide-react';

type SortOption = 'latest' | 'views' | 'likes';

export default function Home() {
  const queryClient = useQueryClient();
  const { data: blogs = [], isLoading: isLoadingBlogs, refetch: refetchBlogs } = useBlogsQuery();
  const { data: categories = [] } = useCategoriesQuery();

  const [activeTab, setActiveTab] = useState<'feed' | 'ai-search' | 'ai-lab' | 'admin-batch'>('feed');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [selectedBlog, setSelectedBlog] = useState<BlogDto | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    ApiClient.checkBackendHealth().then(setIsBackendOnline);
  }, []);

  const handleRefresh = async () => {
    const online = await ApiClient.checkBackendHealth();
    setIsBackendOnline(online);
    refetchBlogs();
  };

  const handleBlogCreated = (newBlog: BlogDto) => {
    queryClient.setQueryData<BlogDto[]>(['blogs'], (old) => [newBlog, ...(old || [])]);
  };

  // Filtered blogs for feed view
  const filteredBlogs = blogs.filter((blog) => {
    const categoryId = blog.category?.categoryId || blog.blogCategoryDto?.categoryId;
    const matchesCategory = selectedCategory === null || categoryId === selectedCategory;
    const matchesSearch =
      !searchTerm.trim() ||
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.header.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Sorted blogs
  const sortedBlogs = [...filteredBlogs].sort((a, b) => {
    if (sortBy === 'views') {
      const viewsA = a.viewsCount ?? a.views ?? 0;
      const viewsB = b.viewsCount ?? b.views ?? 0;
      return viewsB - viewsA;
    }
    if (sortBy === 'likes') {
      const likesA = a.likesCount ?? a.likes ?? 0;
      const likesB = b.likesCount ?? b.likes ?? 0;
      return likesB - likesA;
    }
    // 'latest'
    const dateA = new Date(a.publishedAt || a.createdDate || 0).getTime();
    const dateB = new Date(b.publishedAt || b.createdDate || 0).getTime();
    return dateB - dateA;
  });

  const activeCategoryObj = categories.find((c) => c.categoryId === selectedCategory);
  const hasActiveFilters = Boolean(selectedCategory !== null || searchTerm.trim());

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans transition-colors duration-300">
      {/* Navigation (Ride Also Interactive Mega-Drawer & Ticker Header) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendOnline={isBackendOnline}
        onRefreshHealth={handleRefresh}
        onOpenTelemetry={() => setIsTelemetryModalOpen(true)}
        onOpenArchitectureConsole={() => {
          setActiveTab('feed');
          setTimeout(() => {
            const el = document.getElementById('modular-architecture-console');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }}
        onOpenTwoFactor={() => setIsTwoFactorModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'feed' && (
          <div>
            {/* Hero Banner (Ride Also High-Performance Industrial + 3-Slide Hardware Core) */}
            <HeroSection
              onExploreAI={() => setActiveTab('ai-search')}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onOpenArchitectureConsole={() => {
                const el = document.getElementById('modular-architecture-console');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* 1. Stories Horizontal Snap Carousel (Direct Ride Also Screenshot 1) */}
            <StoriesCarousel
              onSelectTab={setActiveTab}
              onOpenTelemetry={() => setIsTelemetryModalOpen(true)}
              onOpenArchitectureConsole={() => {
                const el = document.getElementById('modular-architecture-console');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Modular Architecture Console (System Architecture Core Selector) */}
            <ModularArchitectureConsole />

            {/* 2. Full-Width Architectural Spotlight Banner (Nova Core 4.1 Distributed Engine) */}
            <SpotlightBanner
              onExploreAI={() => setActiveTab('ai-search')}
              onOpenArchitectureConsole={() => {
                const el = document.getElementById('modular-architecture-console');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Articles Feed */}
            <div id="articles-feed" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 scroll-mt-20">
              {/* Filter, Sort and Search Bar (Ride Also Pill Aesthetic) */}
              <div className="space-y-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/[0.08] dark:border-white/[0.08] shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Category Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`px-4 py-2 rounded-full text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedCategory === null
                          ? 'bg-zinc-950 dark:bg-white text-white dark:text-black shadow-md'
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white border border-black/10 dark:border-white/10'
                      }`}
                    >
                      00 {'//'} TÜM MAKALELER ({blogs.length})
                    </button>
                    {categories.map((c, idx) => (
                      <button
                        key={c.categoryId ?? `cat-${idx}`}
                        onClick={() => setSelectedCategory(c.categoryId || null)}
                        className={`px-4 py-2 rounded-full text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                          selectedCategory === c.categoryId
                            ? 'bg-zinc-950 dark:bg-white text-white dark:text-black shadow-md'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white border border-black/10 dark:border-white/10'
                        }`}
                      >
                        0{idx + 1} {'//'} {c.categoryName.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {/* Right Actions: Search Input & New Article Pill */}
                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 sm:w-72">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        id="blog-search-input"
                        name="blogSearch"
                        type="text"
                        placeholder="Başlık, içerik veya etiket ara (#java-22)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-9 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900/90 border border-black/[0.08] dark:border-white/[0.08] text-xs font-mono text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#d4f933] transition-colors"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full bg-[#d4f933] hover:bg-[#c4e82b] text-black text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-sm hover:shadow-[#d4f933]/25 active:scale-95 cursor-pointer whitespace-nowrap btn-tactile"
                      title="Yeni Teknik Makale Yayınla"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span className="hidden sm:inline">YENİ MAKALE YAZ</span>
                      <span className="sm:hidden">YAZ</span>
                    </button>
                  </div>
                </div>

                {/* Sub-bar: Sorting & Active Filter Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-black/[0.08] dark:border-white/[0.08] text-xs font-mono">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#a3c900] dark:text-[#d4f933]" />
                    <span className="uppercase text-[11px] font-bold">SIRALA //</span>
                    <div className="inline-flex rounded-full bg-zinc-100 dark:bg-zinc-900 p-0.5 border border-black/10 dark:border-white/10">
                      <button
                        onClick={() => setSortBy('latest')}
                        className={`px-3 py-1 rounded-full text-[11px] font-mono transition-colors cursor-pointer ${
                          sortBy === 'latest'
                            ? 'bg-zinc-950 dark:bg-[#d4f933] text-white dark:text-black font-bold shadow-sm'
                            : 'text-zinc-500 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        EN YENİ
                      </button>
                      <button
                        onClick={() => setSortBy('views')}
                        className={`px-3 py-1 rounded-full text-[11px] font-mono transition-colors cursor-pointer ${
                          sortBy === 'views'
                            ? 'bg-zinc-950 dark:bg-[#d4f933] text-white dark:text-black font-bold shadow-sm'
                            : 'text-zinc-500 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        EN ÇOK OKUNAN
                      </button>
                      <button
                        onClick={() => setSortBy('likes')}
                        className={`px-3 py-1 rounded-full text-[11px] font-mono transition-colors cursor-pointer ${
                          sortBy === 'likes'
                            ? 'bg-zinc-950 dark:bg-[#d4f933] text-white dark:text-black font-bold shadow-sm'
                            : 'text-zinc-500 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        EN ÇOK BEĞENİLEN
                      </button>
                    </div>
                  </div>

                  {/* Active Filter Pill */}
                  {hasActiveFilters && (
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 text-[11px]">
                        {sortedBlogs.length} sonuç
                        {activeCategoryObj ? ` (${activeCategoryObj.categoryName})` : ''}
                        {searchTerm ? ` "${searchTerm}"` : ''}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedCategory(null);
                          setSearchTerm('');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-[11px] font-bold transition-colors cursor-pointer hover:bg-rose-500 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                        FİLTREYİ TEMİZLE
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Blog Cards Grid */}
              {isLoadingBlogs ? (
                <div className="py-24 text-center text-zinc-400 space-y-3 font-mono">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#a3c900] dark:text-[#d4f933]" />
                  <p className="text-xs uppercase tracking-widest">SİSTEM MAKALELERİ YÜKLENİYOR...</p>
                </div>
              ) : sortedBlogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedBlogs.map((blog, idx) => (
                    <BlogCard
                      key={blog.blogId ?? blog.id ?? `blog-${idx}`}
                      blog={blog}
                      onSelect={setSelectedBlog}
                      onTagClick={(tag) => setSearchTerm(tag)}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center space-y-4 rounded-3xl border border-dashed border-black/15 dark:border-white/15 p-8 font-mono">
                  <p className="text-xs uppercase tracking-widest text-zinc-500">
                    Arama kriterlerinize uygun teknik makale kaydı bulunamadı.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchTerm('');
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-950 dark:bg-[#d4f933] text-white dark:text-black text-xs font-bold transition-transform active:scale-95 cursor-pointer uppercase"
                  >
                    Tüm Makaleleri Listele
                  </button>
                </div>
              )}
            </div>

            {/* 3. Field Demo Reels (Direct Ride Also Video Reels with Hover Play, Green Progress & Drag-to-Scroll) */}
            <FieldDemoReels
              onOpenArchitectureConsole={(moduleId) => {
                const el = document.getElementById('modular-architecture-console');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                window.dispatchEvent(new CustomEvent('select-console-module', { detail: moduleId }));
                window.dispatchEvent(new CustomEvent('run-console-simulation'));
              }}
            />

            {/* 4. In the Press / System Bulletin Carousel (Direct Ride Also Screenshot 3 & 4) */}
            <PressReviewsCarousel />

            {/* Technical Specifications & System Blueprint (Ride Also Specs Matrix) */}
            <SystemBlueprintSection />
          </div>
        )}

        {/* Tab 2: Spring AI & Semantic Vector Search */}
        {activeTab === 'ai-search' && (
          <SemanticSearchStudio onSelectBlog={setSelectedBlog} />
        )}

        {/* Tab 3: Spring AI NLP Lab */}
        {activeTab === 'ai-lab' && <AiPlayground />}

        {/* Tab 4: Admin Batch & System Studio */}
        {activeTab === 'admin-batch' && <AdminBatchStudio />}
      </main>

      {/* Detail Modal */}
      <BlogDetailModal
        blog={selectedBlog}
        onClose={() => setSelectedBlog(null)}
        onTagClick={(tag) => setSearchTerm(tag)}
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

      {/* Two-Factor Authentication (2FA / TOTP) Security Center Modal */}
      <TwoFactorModal
        isOpen={isTwoFactorModalOpen}
        onClose={() => setIsTwoFactorModalOpen(false)}
      />

      {/* Footer (Ride Also Architecture Manifest & Monumental Brandmark) */}
      <Footer
        setActiveTab={setActiveTab}
        onOpenTelemetry={() => setIsTelemetryModalOpen(true)}
        onOpenArchitectureConsole={() => {
          setActiveTab('feed');
          setTimeout(() => {
            const el = document.getElementById('modular-architecture-console');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }}
      />

      {/* Ride Also Signature Floating Lavender Copilot Widget (Screenshots 1-6) */}
      <FloatingCopilotWidget
        onSelectTab={setActiveTab}
        onOpenTelemetry={() => setIsTelemetryModalOpen(true)}
        onMetricsFlushed={() => refetchBlogs()}
        onOpenArchitectureConsole={() => {
          setActiveTab('feed');
          setTimeout(() => {
            const el = document.getElementById('modular-architecture-console');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }}
      />
    </div>
  );
}
