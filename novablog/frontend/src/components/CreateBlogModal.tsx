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

export const CreateBlogModal: React.FC<CreateBlogModalProps> = ({
  categories,
  onClose,
  onBlogCreated,
}) => {
  const [header, setHeader] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<number>(categories[0]?.categoryId || 1);
  const [tags, setTags] = useState<string[]>(['spring-ai', 'backend', 'java-22']);
  const [tagInput, setTagInput] = useState('');
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      if (matched && matched.categoryId) {
        setSelectedCatId(matched.categoryId);
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
      const selectedCategory = categories.find((c) => c.categoryId === selectedCatId) || categories[0];
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl overflow-hidden my-auto animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5 font-bold text-white text-base">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3>Yeni Teknik Makale Yayınla</h3>
              <p className="text-xs text-slate-400 font-normal">
                Spring AI 128D Vektör İndeksleme & Markdown Desteği
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">
                Makale Başlığı (Title)
              </label>
              <span className="text-[10px] font-mono text-slate-500">
                {title.length}/100
              </span>
            </div>
            <input
              type="text"
              required
              maxLength={100}
              placeholder="Örn: Java 22 Virtual Threads ve Loom ile Yüksek Throughput Mimarisi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Subheader */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">
                Alt Başlık / Kapsam (Header)
              </label>
              <span className="text-[10px] font-mono text-slate-500">
                {header.length}/100
              </span>
            </div>
            <input
              type="text"
              required
              maxLength={100}
              placeholder="Örn: Concurrency, Thread Pool Darboğazı ve Non-blocking I/O"
              value={header}
              onChange={(e) => setHeader(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Category & AI Tag Assistant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">Kategori</label>
              </div>
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.categoryName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={handleAutoSuggest}
                disabled={isSuggestingTags}
                className="w-full py-2 px-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-500/30 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {isSuggestingTags ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                )}
                Spring AI ile Otomatik Etiket & Kategori Belirle
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">Teknik İçerik</label>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  ~{readingTimeMinutes} dk okuma
                </span>
                <span>•</span>
                <span>{wordCount} kelime</span>
              </div>
            </div>
            <textarea
              rows={7}
              required
              placeholder="Makalenizi yazın... Kod blokları için ```java veya ```ts formatını kullanabilirsiniz."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Etiketler (Tagging)
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {tags.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-indigo-300 border border-slate-700/80 text-xs font-mono"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-pink-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Yeni etiket ekle (örn: docker, redis)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Ekle
              </button>
            </div>
          </div>

          {/* AI Banner Notice */}
          <div className="p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-500/25 text-xs text-emerald-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-emerald-200">Otomatik Vektör İndeksleme:</span>
              <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                Bu makale kaydedildiğinde Spring AI arkada 128 boyutlu gömme (embedding) çıkarıp semantik arama
                motoruna anında kaydedecektir.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Yayınlanıyor & Vektörleniyor...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Makaleyi Yayınla
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
