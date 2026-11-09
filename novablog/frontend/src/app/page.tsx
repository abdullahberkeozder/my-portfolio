'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { BlogCard } from '@/components/BlogCard';
import { BlogDetailModal } from '@/components/BlogDetailModal';
import { CreateBlogModal } from '@/components/CreateBlogModal';
import { SemanticSearchStudio } from '@/components/SemanticSearchStudio';
import { AiPlayground } from '@/components/AiPlayground';
import { AdminBatchStudio } from '@/components/AdminBatchStudio';
import { Footer } from '@/components/Footer';
import { BlogDto } from '@/types/api';
import { ApiClient } from '@/lib/api';
import { useBlogsQuery, useCategoriesQuery } from '@/hooks/useBlogs';
import { Search, RefreshCw } from 'lucide-react';

export default function Home() {
  const queryClient = useQueryClient();
  const { data: blogs = [], isLoading: isLoadingBlogs, refetch: refetchBlogs } = useBlogsQuery();
  const { data: categories = [] } = useCategoriesQuery();

  const [activeTab, setActiveTab] = useState<'feed' | 'ai-search' | 'ai-lab' | 'admin-batch'>('feed');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlog, setSelectedBlog] = useState<BlogDto | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendOnline={isBackendOnline}
        onRefreshHealth={handleRefresh}
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
              {/* Filter and Search Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                      selectedCategory === null
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Tüm Kategoriler ({blogs.length})
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.categoryId}
                      onClick={() => setSelectedCategory(c.categoryId || null)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                        selectedCategory === c.categoryId
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {c.categoryName}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="relative min-w-[260px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Başlık veya etiket filtrele..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Blog Cards Grid */}
              {isLoadingBlogs ? (
                <div className="py-20 text-center text-slate-400 space-y-3">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-400" />
                  <p className="text-sm">Yazılar yükleniyor...</p>
                </div>
              ) : filteredBlogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBlogs.map((blog) => (
                    <BlogCard key={blog.id ?? blog.blogId} blog={blog} onSelect={setSelectedBlog} />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <p className="text-sm">Arama kriterlerine uygun makale bulunamadı.</p>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchTerm('');
                    }}
                    className="text-xs text-indigo-400 hover:underline"
                  >
                    Filtreleri Sıfırla
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
      <BlogDetailModal blog={selectedBlog} onClose={() => setSelectedBlog(null)} />

      {/* Create Modal */}
      {isCreateModalOpen && (
        <CreateBlogModal
          categories={categories}
          onClose={() => setIsCreateModalOpen(false)}
          onBlogCreated={handleBlogCreated}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
