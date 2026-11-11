'use client';

import React, { useState } from 'react';
import { ApiClient } from '@/lib/api';
import { BlogDto, BlogCategoryDto } from '@/types/api';
import { X, Sparkles, Send, Loader2, CheckCircle2, Clock, Plus } from 'lucide-react';

interface CreateBlogModalProps {
  categories: BlogCategoryDto[];
  onClose: () => void;
  onBlogCreated: (blog: BlogDto) => void;
}

const getCatId = (c?: BlogCategoryDto | null, fallback = 1): number => {
  if (!c) return fallback;
  const raw = c.categoryId ?? c.blogCategoryId;
  const num = Number(raw);
  return Number.isFinite(num) ? num : fallback;
};

export const CreateBlogModal: React.FC<CreateBlogModalProps> = ({
  categories,
  onClose,
  onBlogCreated,
}) => {
  const [header, setHeader] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [userSelectedCatId, setUserSelectedCatId] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>(['spring-ai', 'backend', 'java-22']);
  const [tagInput, setTagInput] = useState('');
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived safe category ID: uses user's explicit selection if valid in current categories, otherwise first category
  const defaultCatId = getCatId(categories[0], 1);
  const effectiveCatId = userSelectedCatId != null && categories.some((c) => getCatId(c) === userSelectedCatId)
    ? userSelectedCatId
    : defaultCatId;

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

  const handleAutoSuggest = async () => {
    if (!title.trim()) {
      alert('Lütfen önce bir makale başlığı giriniz.');
      return;
    }
    setIsSuggestingTags(true);
    try {
      const res = await ApiClient.suggestTags(title, content || title);
      if (res.suggestedTags && res.suggestedTags.length > 0) {
        setTags(res.suggestedTags);
      }
      const matched = categories.find((c) =>
        c.categoryName.toLowerCase().includes(res.suggestedCategory.toLowerCase())
      );
      if (matched) {
        setUserSelectedCatId(getCatId(matched));
      }
    } catch {
      // ignore
    } finally {
      setIsSuggestingTags(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const cleanTag = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!header.trim() || !title.trim() || !content.trim()) {
      alert('Lütfen başlık, alt başlık ve makale içeriğini doldurunuz.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCategory = categories.find((c) => getCatId(c) === effectiveCatId) || categories[0];
      const created = await ApiClient.createBlog({
        header: header.trim(),
        title: title.trim(),
        content: content.trim(),
      });
      created.category = selectedCategory;
      created.tags = tags;
      onBlogCreated(created);
      onClose();
    } catch {
      alert('Blog kaydedilemedi. Lütfen alanları kontrol ediniz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-zinc-100 shadow-2xl overflow-hidden my-auto animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 dark:bg-zinc-800 border border-black/10 dark:border-white/10 flex items-center justify-center text-[#d4f933] shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-base uppercase text-zinc-950 dark:text-white">
                YENİ TEKNİK MAKALE YAYINLA
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                SPRING AI ANLAMSAL VEKTÖR İNDEKSİ &bull; MARKDOWN SÖZDİZİMİ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs font-mono">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-zinc-900 dark:text-white uppercase">
                Makale Başlığı (Title)
              </label>
              <span className="text-[10px] text-zinc-400">
                {title.length}/100
              </span>
            </div>
            <input
              id="blog-create-title"
              name="title"
              type="text"
              required
              maxLength={100}
              placeholder="Örn: Java 22 Virtual Threads ve Loom ile Yüksek Throughput Mimarisi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-[#d4f933] transition-colors"
            />
          </div>

          {/* Subheader */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="blog-create-header" className="font-bold text-zinc-900 dark:text-white uppercase">
                Alt Başlık / Kapsam (Header)
              </label>
              <span className="text-[10px] text-zinc-400">
                {header.length}/100
              </span>
            </div>
            <input
              id="blog-create-header"
              name="header"
              type="text"
              required
              maxLength={100}
              placeholder="Örn: Concurrency, Thread Pool Darboğazı ve Non-blocking I/O"
              value={header}
              onChange={(e) => setHeader(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-[#d4f933] transition-colors"
            />
          </div>

          {/* Category & AI Tag Assistant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="blog-create-category" className="font-bold text-zinc-900 dark:text-white uppercase">Kategori</label>
              </div>
              <select
                id="blog-create-category"
                name="categoryId"
                value={effectiveCatId}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setUserSelectedCatId(Number.isFinite(val) ? val : defaultCatId);
                }}
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-[#d4f933]"
              >
                {categories.map((c, idx) => {
                  const catId = getCatId(c, idx + 1);
                  return (
                    <option key={`create-cat-${catId}-${idx}`} value={catId}>
                      {c.categoryName}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={handleAutoSuggest}
                disabled={isSuggestingTags}
                className="w-full py-2.5 px-4 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-[#d4f933] hover:text-black dark:hover:bg-[#d4f933] dark:hover:text-black text-zinc-700 dark:text-zinc-300 border border-black/10 dark:border-white/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer uppercase"
              >
                {isSuggestingTags ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                SPRING AI İLE ETİKET ÖNER
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-zinc-900 dark:text-white uppercase">Teknik İçerik</label>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  ~{readingTimeMinutes} DK OKUMA
                </span>
                <span>&bull;</span>
                <span>{wordCount} KELİME</span>
              </div>
            </div>
            <textarea
              id="blog-create-content"
              name="content"
              rows={7}
              required
              placeholder="Makalenizi yazın... Kod blokları için ```java veya ```ts formatını kullanabilirsiniz."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs leading-relaxed focus:outline-none focus:border-[#d4f933] font-mono"
            />
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="blog-create-tag-input" className="block font-bold text-zinc-900 dark:text-white mb-2 uppercase">
              Etiketler (Tagging)
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
              {tags.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-black/10 dark:border-white/10 text-xs font-mono uppercase font-semibold"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-500 transition-colors cursor-pointer ml-1"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="blog-create-tag-input"
                name="tagInput"
                type="text"
                placeholder="Yeni etiket (örn: redis, loom)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="flex-1 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-[#d4f933]"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                EKLE
              </button>
            </div>
          </div>

          {/* AI Notice Banner */}
          <div className="p-4 rounded-2xl bg-[#d4f933]/10 border border-[#d4f933]/30 text-xs text-zinc-800 dark:text-zinc-200 flex items-start gap-2.5 font-sans">
            <CheckCircle2 className="w-4 h-4 text-[#a3c900] dark:text-[#d4f933] shrink-0 mt-0.5" />
            <div className="space-y-0.5 font-mono text-[11px]">
              <span className="font-bold text-zinc-950 dark:text-white uppercase">OTOMATİK VEKTÖR İNDEKSLEME:</span>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans text-xs">
                Bu makale yayınlandığında Spring AI arka planda 128 boyutlu gömme (embedding) çıkarıp semantik arama
                motoruna anında kaydedecektir.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/[0.08] dark:border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-colors cursor-pointer uppercase"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-950 dark:bg-[#d4f933] hover:opacity-90 text-white dark:text-black text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  YAYINLANIYOR...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  MAKALEYİ YAYINLA
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
