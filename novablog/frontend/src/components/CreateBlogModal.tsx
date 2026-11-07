'use client';

import React, { useState } from 'react';
import { ApiClient } from '@/lib/api';
import { BlogDto, BlogCategoryDto } from '@/types/api';
import { X, Sparkles, Send, Loader2, CheckCircle2 } from 'lucide-react';

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
  const [tags, setTags] = useState<string[]>(['spring-ai', 'backend']);
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAutoSuggest = async () => {
    if (!title.trim()) {
      alert('Lütfen önce bir başlık giriniz.');
      return;
    }
    setIsSuggestingTags(true);
    try {
      const res = await ApiClient.suggestTags(title, content || title);
      setTags(res.suggestedTags);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!header.trim() || !title.trim() || !content.trim()) {
      alert('Lütfen tüm alanları doldurunuz.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCategory = categories.find((c) => c.categoryId === selectedCatId) || categories[0];
      const created = await ApiClient.createBlog({
        header: header.trim().slice(0, 25),
        title: title.trim().slice(0, 25),
        content: content.trim(),
      });
      created.category = selectedCategory;
      created.tags = tags;
      onBlogCreated(created);
      onClose();
    } catch {
      alert('Blog kaydedilemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2 font-bold text-white text-lg">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Yeni Blog Yazısı Yayınla
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Blog Başlığı (Title)
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Java 22 Sanal Thread Devrimi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Alt Başlık / Header
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Java 22 & Loom"
              value={header}
              onChange={(e) => setHeader(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-300">Kategori</label>
              <button
                type="button"
                onClick={handleAutoSuggest}
                disabled={isSuggestingTags}
                className="text-[11px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                {isSuggestingTags ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                Spring AI ile Otomatik Belirle
              </button>
            </div>
            <select
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            >
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">İçerik</label>
            <textarea
              rows={4}
              required
              placeholder="Makalenizin ana içeriğini buraya giriniz..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Etiketler</label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700 text-xs font-mono"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Kayıt sırasında Spring AI arka planda 128D Vektör Gömme üretir.</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Yayınla & Vektör İndeksle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
