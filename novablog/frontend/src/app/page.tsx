'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { BlogCard } from '@/components/BlogCard';
import { BlogDetailModal } from '@/components/BlogDetailModal';
import { CreateBlogModal } from '@/components/CreateBlogModal';
import { SystemTelemetryModal } from '@/components/SystemTelemetryModal';
import { SemanticSearchStudio } from '@/components/SemanticSearchStudio';
import { AiPlayground } from '@/components/AiPlayground';
import { AdminBatchStudio } from '@/components/AdminBatchStudio';
import { Footer } from '@/components/Footer';
import { BlogDto } from '@/types/api';
import { ApiClient } from '@/lib/api';
import { useBlogsQuery, useCategoriesQuery } from '@/hooks/useBlogs';
import { Search, RefreshCw, SlidersHorizontal, X } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendOnline={isBackendOnline}
        onRefreshHealth={handleRefresh}
        onOpenTelemetry={() => setIsTelemetryModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'feed' && (
          <div>
            {/* Hero Banner */}
            <HeroSection
              onExploreAI={() => setActiveTab('ai-search')}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
            />

            {/* Articles Feed */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
              {/* Filter, Sort and Search Bar */}
              <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Category Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                        selectedCategory === null
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Tüm Makaleler ({blogs.length})
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.categoryId}
                        onClick={() => setSelectedCategory(c.categoryId || null)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                          selectedCategory === c.categoryId
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {c.categoryName}
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <div className="relative min-w-[280px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Başlık, içerik veya etiket ara (#java-22)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-bar: Sorting & Active Filter Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Sırala:</span>
                    <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
                      <button
                        onClick={() => setSortBy('latest')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                          sortBy === 'latest'
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        En Yeni
                      </button>
                      <button
                        onClick={() => setSortBy('views')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                          sortBy === 'views'
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        En Çok Okunan
                      </button>
                      <button
                        onClick={() => setSortBy('likes')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                          sortBy === 'likes'
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        En Çok Beğenilen
                      </button>
                    </div>
                  </div>

                  {/* Active Filter Pill */}
                  {hasActiveFilters && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">
                        {sortedBlogs.length} sonuç listeleniyor
                        {activeCategoryObj ? ` (${activeCategoryObj.categoryName})` : ''}
                        {searchTerm ? ` "${searchTerm}"` : ''}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedCategory(null);
                          setSearchTerm('');
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        Filtreyi Temizle
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Blog Cards Grid */}
              {isLoadingBlogs ? (
                <div className="py-20 text-center text-slate-400 space-y-3">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-400" />
                  <p className="text-sm">Makaleler yükleniyor...</p>
                </div>
              ) : sortedBlogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedBlogs.map((blog) => (
                    <BlogCard
                      key={blog.id ?? blog.blogId}
                      blog={blog}
                      onSelect={setSelectedBlog}
                      onTagClick={(tag) => setSearchTerm(tag)}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-500 space-y-3 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
                  <p className="text-sm text-slate-400">Arama kriterlerinize uygun teknik makale bulunamadı.</p>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchTerm('');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs hover:bg-indigo-600/30 transition-colors cursor-pointer"
                  >
                    Tüm Makaleleri Göster
                  </button>
                </div>
              )}
            </div>
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

      {/* Footer */}
      <Footer />
    </div>
  );
}
