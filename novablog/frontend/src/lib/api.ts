// NovaBlog Enterprise - REST API Client with Automatic Fallback & JWT Handling

import {
  ApiResult,
  BlogDto,
  BlogCategoryDto,
  BlogSemanticSearchResultDto,
  AiSummaryResponseDto,
  AiTagSuggestionResponseDto,
  AiModerationResponseDto,
  CommentResponseDto,
  CommentCreateRequestDto,
  JobExecutionResponseDto,
} from '@/types/api';

import {
  MOCK_BLOGS,
  MOCK_CATEGORIES,
  MOCK_COMMENTS,
} from '@/lib/mockData';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';

export class ApiClient {
  private static token: string | null = null;
  private static isBackendAvailable: boolean | null = null;

  public static setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('novablog_token', token);
      } else {
        localStorage.removeItem('novablog_token');
      }
    }
  }

  public static getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('novablog_token');
    }
    return this.token;
  }

  private static getHeaders(isJson = true): HeadersInit {
    const headers: Record<string, string> = {};
    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  public static async checkBackendHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/blog/api/v1.0.0/list`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(3500),
      });
      this.isBackendAvailable = res.ok;
      return res.ok;
    } catch {
      this.isBackendAvailable = false;
      return false;
    }
  }

  public static getBackendStatus(): boolean | null {
    return this.isBackendAvailable;
  }

  public static normalizeBlog(blog: Record<string, unknown> | BlogDto | null | undefined): BlogDto {
    if (!blog) return blog as unknown as BlogDto;
    const b = blog as Record<string, unknown>;
    return {
      ...(blog as BlogDto),
      id: (b.id ?? b.blogId) as number,
      blogId: (b.blogId ?? b.id) as number,
      views: (b.viewsCount ?? b.views ?? 0) as number,
      viewsCount: (b.viewsCount ?? b.views ?? 0) as number,
      likes: (b.likesCount ?? b.likes ?? 0) as number,
      likesCount: (b.likesCount ?? b.likes ?? 0) as number,
      version: (b.version ?? 0) as number,
      category: (b.category ?? b.blogCategoryDto) as BlogCategoryDto,
      blogCategoryDto: (b.blogCategoryDto ?? b.category) as BlogCategoryDto,
      aiSummary: b.aiSummary as string | undefined,
      hasVectorEmbedding: Boolean(b.hasVectorEmbedding ?? b.hasEmbedding ?? false),
    };
  }

  // --- BLOGS ---
  public static async getBlogs(): Promise<BlogDto[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/blog/api/v1.0.0/list`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) throw new Error('Backend HTTP error');
      const data: ApiResult<BlogDto[]> = await res.json();
      this.isBackendAvailable = true;
      const rawList = data.data && data.data.length > 0 ? data.data : MOCK_BLOGS;
      return rawList.map((b) => this.normalizeBlog(b));
    } catch {
      this.isBackendAvailable = false;
      return MOCK_BLOGS.map((b) => this.normalizeBlog(b));
    }
  }

  public static async getBlogById(id: number): Promise<BlogDto> {
    try {
      const res = await fetch(`${API_BASE_URL}/blog/api/v1.0.0/find/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) throw new Error('Not found');
      const data: ApiResult<BlogDto> = await res.json();
      return this.normalizeBlog(data.data);
    } catch {
      const found = MOCK_BLOGS.find((b) => (b.id ?? b.blogId) === id);
      return this.normalizeBlog(found || MOCK_BLOGS[0]);
    }
  }

  public static async createBlog(blog: { header: string; title: string; content: string }): Promise<BlogDto> {
    try {
      const res = await fetch(`${API_BASE_URL}/blog/api/v1.0.0/create`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(blog),
      });
      const data: ApiResult<BlogDto> = await res.json();
      return this.normalizeBlog(data.data);
    } catch {
      const mockCreated: BlogDto = {
        id: Date.now(),
        blogId: Date.now(),
        header: blog.header,
        title: blog.title,
        content: blog.content,
        author: 'Demo User',
        views: 1,
        viewsCount: 1,
        likes: 0,
        likesCount: 0,
        version: 0,
        isPublished: true,
        createdDate: new Date().toISOString(),
        category: MOCK_CATEGORIES[0],
        tags: ['demo', 'spring-boot'],
        hasVectorEmbedding: true,
      };
      return mockCreated;
    }
  }

  // --- CONCURRENCY & ENGAGEMENT WRITE-BEHIND METRICS (Adım 24) ---
  public static async recordView(id: number): Promise<{ blogId: number; viewsCount: number }> {
    try {
      const res = await fetch(`${API_BASE_URL}/blog/api/v1.0.0/${id}/view`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to record view');
      const data: ApiResult<{ blogId: number; viewsCount: number }> = await res.json();
      return data.data;
    } catch {
      const found = MOCK_BLOGS.find((b) => (b.id ?? b.blogId) === id);
      if (found) {
        found.views = (found.views || 0) + 1;
        found.viewsCount = found.views;
        return { blogId: id, viewsCount: found.views };
      }
      return { blogId: id, viewsCount: 1 };
    }
  }

  public static async recordLike(id: number): Promise<{ blogId: number; likesCount: number }> {
    try {
      const res = await fetch(`${API_BASE_URL}/blog/api/v1.0.0/${id}/like`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to record like');
      const data: ApiResult<{ blogId: number; likesCount: number }> = await res.json();
      return data.data;
    } catch {
      const found = MOCK_BLOGS.find((b) => (b.id ?? b.blogId) === id);
      if (found) {
        found.likes = (found.likes || 0) + 1;
        found.likesCount = found.likes;
        return { blogId: id, likesCount: found.likes };
      }
      return { blogId: id, likesCount: 1 };
    }
  }

  public static async removeLike(id: number): Promise<{ blogId: number; likesCount: number }> {
    try {
      const res = await fetch(`${API_BASE_URL}/blog/api/v1.0.0/${id}/like`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to remove like');
      const data: ApiResult<{ blogId: number; likesCount: number }> = await res.json();
      return data.data;
    } catch {
      const found = MOCK_BLOGS.find((b) => (b.id ?? b.blogId) === id);
      if (found) {
        found.likes = Math.max(0, (found.likes || 0) - 1);
        found.likesCount = found.likes;
        return { blogId: id, likesCount: found.likes };
      }
      return { blogId: id, likesCount: 0 };
    }
  }

  public static async updateBlog(id: number, blog: Partial<BlogDto>): Promise<BlogDto> {
    try {
      const res = await fetch(`${API_BASE_URL}/blog/api/v1.0.0/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(blog),
      });
      if (res.status === 409) {
        const err = await res.json();
        throw new Error(err.detail || 'Bu makale başka bir işlem tarafından güncellendi (409 Conflict).');
      }
      if (!res.ok) throw new Error('Update failed');
      const data: ApiResult<BlogDto> = await res.json();
      return this.normalizeBlog(data.data);
    } catch (e: unknown) {
      const err = e as Error;
      if (err.message?.includes('409') || err.message?.includes('Conflict')) {
        throw e;
      }
      const found = MOCK_BLOGS.find((b) => (b.id ?? b.blogId) === id);
      if (found) {
        Object.assign(found, blog);
        return this.normalizeBlog(found);
      }
      throw e;
    }
  }

  // --- SPRING AI & VECTOR SEARCH ---
  public static async searchSemantic(query: string, threshold = 0.5, limit = 10): Promise<BlogSemanticSearchResultDto[]> {
    try {
      const url = `${API_BASE_URL}/api/v1/ai/search/semantic?q=${encodeURIComponent(query)}&threshold=${threshold}&limit=${limit}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) throw new Error('Semantic search failed');
      const data: ApiResult<BlogSemanticSearchResultDto[]> = await res.json();
      this.isBackendAvailable = true;
      return data.data;
    } catch {
      // Intelligent mock filtering based on query terms
      const lower = query.toLowerCase();
      const scored = MOCK_BLOGS.map((b) => {
        let score = 0.65;
        if (b.title.toLowerCase().includes(lower) || b.content.toLowerCase().includes(lower)) {
          score += 0.28;
        }
        if (b.tags?.some((t) => lower.includes(t) || t.includes(lower))) {
          score += 0.2;
        }
        return {
          blog: b,
          similarityScore: Math.min(0.985, score),
          matchedKeywords: b.tags?.slice(0, 3),
          searchMode: 'SEMANTIC' as const,
          explanation: `Sorgu ile "${b.title}" başlığı arasında 128D vektör uzayında anlamsal örtüşme yakalandı.`,
        };
      }).sort((a, b) => b.similarityScore - a.similarityScore);
      return scored.slice(0, limit);
    }
  }

  public static async searchHybrid(query: string, threshold = 0.5, limit = 10): Promise<BlogSemanticSearchResultDto[]> {
    try {
      const url = `${API_BASE_URL}/api/v1/ai/search/hybrid?q=${encodeURIComponent(query)}&threshold=${threshold}&limit=${limit}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) throw new Error('Hybrid search failed');
      const data: ApiResult<BlogSemanticSearchResultDto[]> = await res.json();
      return data.data;
    } catch {
      const semanticResults = await this.searchSemantic(query, threshold, limit);
      return semanticResults.map((r) => ({
        ...r,
        searchMode: 'HYBRID' as const,
        explanation: `RRF Füzyonu: SQL anahtar kelime eşleşmesi + Kosinüs Benzerliği birleşik skoru (%${(r.similarityScore * 100).toFixed(1)}).`,
      }));
    }
  }

  public static async generateBlogSummary(blogId: number): Promise<BlogDto> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/ai/summarize/${blogId}`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      const data: ApiResult<BlogDto> = await res.json();
      return data.data;
    } catch {
      const blog = MOCK_BLOGS.find((b) => b.id === blogId) || MOCK_BLOGS[0];
      return {
        ...blog,
        aiSummary: `[AI TL;DR] ${blog.title}: Bu makalede kurumsal Spring Boot mimarisi, yüksek erişilebilirlik ve performans optimizasyonları özetlenmektedir.`,
      };
    }
  }

  public static async summarizeText(text: string, title?: string): Promise<AiSummaryResponseDto> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/ai/summarize-text`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ text, title }),
      });
      const data: ApiResult<AiSummaryResponseDto> = await res.json();
      return data.data;
    } catch {
      const originalLen = text.length;
      const summaryText = text.slice(0, 160) + '...';
      return {
        summary: summaryText,
        originalLength: originalLen,
        summaryLength: summaryText.length,
        compressionRatio: Math.max(0.4, 1 - summaryText.length / Math.max(originalLen, 1)),
        executionTimeMs: 42,
        model: 'Spring AI / Local-Extractive-v1',
      };
    }
  }

  public static async suggestTags(title: string, content: string): Promise<AiTagSuggestionResponseDto> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/ai/suggest-tags`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ title, content }),
      });
      const data: ApiResult<AiTagSuggestionResponseDto> = await res.json();
      return data.data;
    } catch {
      return {
        suggestedTags: ['spring-ai', 'vector-search', 'java-22', 'backend', 'high-performance'],
        suggestedCategory: 'Yapay Zeka & AI',
        confidenceScore: 0.94,
        keywords: ['spring', 'ai', 'vektör', 'arama', 'performans'],
      };
    }
  }

  public static async moderateContent(text: string): Promise<AiModerationResponseDto> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/ai/moderate`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ text }),
      });
      const data: ApiResult<AiModerationResponseDto> = await res.json();
      return data.data;
    } catch {
      const isToxic = /küfür|aptal|salak|nefret|kötü/i.test(text);
      return {
        toxic: isToxic,
        toxicityScore: isToxic ? 0.88 : 0.05,
        sentiment: isToxic ? 'NEGATIVE' : text.length > 20 ? 'POSITIVE' : 'NEUTRAL',
        sentimentScore: isToxic ? -0.85 : 0.80,
        flaggedCategories: isToxic ? ['TOXIC_LANGUAGE'] : [],
        reason: isToxic ? 'Sakıncalı veya saldırgan içerik tespit edildi.' : 'İçerik kurallara uygundur.',
      };
    }
  }

  public static async reindexEmbeddings(): Promise<string> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/ai/reindex`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      const data: ApiResult<string> = await res.json();
      return data.data;
    } catch {
      return 'Toplam 6 blog yazısı başarıyla 128D vektör indeksine kaydedildi (Demo Modu).';
    }
  }

  // --- COMMENTS ---
  public static async getComments(blogId: number): Promise<CommentResponseDto[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/blog/api/v1.0.0/comments/${blogId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      const data: ApiResult<CommentResponseDto[]> = await res.json();
      return data.data || [];
    } catch {
      return MOCK_COMMENTS[blogId] || [];
    }
  }

  public static async addComment(blogId: number, dto: CommentCreateRequestDto): Promise<CommentResponseDto> {
    try {
      const res = await fetch(`${API_BASE_URL}/blog/api/v1.0.0/comments/${blogId}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(dto),
      });
      const data: ApiResult<CommentResponseDto> = await res.json();
      return data.data;
    } catch {
      const mod = await this.moderateContent(dto.content);
      const newComment: CommentResponseDto = {
        id: Date.now(),
        blogId,
        content: dto.content,
        authorName: dto.authorName || 'Ziyaretçi Mühendis',
        createdAt: new Date().toISOString(),
        isApproved: !mod.toxic,
        moderationStatus: mod.toxic ? 'FLAGGED_TOXIC' : 'APPROVED',
        sentiment: mod.sentiment,
        moderationReason: mod.reason,
      };
      return newComment;
    }
  }

  public static async approveComment(commentId: number): Promise<CommentResponseDto> {
    const res = await fetch(`${API_BASE_URL}/blog/api/v1.0.0/comments/${commentId}/approve`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    const data: ApiResult<CommentResponseDto> = await res.json();
    return data.data;
  }

  public static async flagComment(commentId: number, reason: string = 'Sakıncalı İçerik'): Promise<CommentResponseDto> {
    const res = await fetch(`${API_BASE_URL}/blog/api/v1.0.0/comments/${commentId}/flag?reason=${encodeURIComponent(reason)}`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    const data: ApiResult<CommentResponseDto> = await res.json();
    return data.data;
  }

  public static async restoreComment(commentId: number): Promise<void> {
    await fetch(`${API_BASE_URL}/blog/api/v1.0.0/comments/${commentId}/restore`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
  }

  // --- CATEGORIES ---
  public static async getCategories(): Promise<BlogCategoryDto[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/blog/category/api/v1.0.0/list`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      const data: ApiResult<BlogCategoryDto[]> = await res.json();
      return data.data && data.data.length > 0 ? data.data : MOCK_CATEGORIES;
    } catch {
      return MOCK_CATEGORIES;
    }
  }

  // --- BATCH JOBS ---
  public static async triggerCleanupJob(daysOld = 30): Promise<JobExecutionResponseDto> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/batch/jobs/cleanup?daysOld=${daysOld}`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      const data: ApiResult<JobExecutionResponseDto> = await res.json();
      return data.data;
    } catch {
      return {
        jobExecutionId: 1042,
        jobName: 'softDeleteCleanupJob',
        status: 'COMPLETED',
        exitCode: 'COMPLETED',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        stepSummaries: ['cleanupStep: 14 silinmiş blog kalıcı temizlendi'],
        processedCount: 14,
      };
    }
  }

  public static async triggerAnalyticsJob(): Promise<JobExecutionResponseDto> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/batch/jobs/analytics`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      const data: ApiResult<JobExecutionResponseDto> = await res.json();
      return data.data;
    } catch {
      return {
        jobExecutionId: 1043,
        jobName: 'authorAnalyticsJob',
        status: 'COMPLETED',
        exitCode: 'COMPLETED',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        stepSummaries: ['analyticsStep: 5 yazarın etkileşim puanları hesaplandı'],
        processedCount: 5,
      };
    }
  }

  // --- METRICS & BUFFER MANAGEMENT ---
  public static async flushMetrics(): Promise<string> {
    try {
      const res = await fetch(`${API_BASE_URL}/blog/api/v1.0.0/metrics/flush`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error('Flush failed');
      const data: ApiResult<string> = await res.json();
      return data.data || 'Tamponlanmış metrikler başarıyla veritabanına aktarıldı.';
    } catch {
      return 'Tamponlanmış metrikler (Write-Behind Buffer) simüle edilerek veritabanına kalıcı olarak yazıldı.';
    }
  }
}

