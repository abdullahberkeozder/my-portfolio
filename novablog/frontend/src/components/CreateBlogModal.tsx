'use client';

import React, { useState } from 'react';
import { ApiClient } from '@/lib/api';
import { BlogDto, BlogCategoryDto } from '@/types/api';
import {
  X,
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  Plus,
  Eye,
  PenTool,
  FileCode,
  Bookmark,
  AlertCircle,
  Heading,
  Code,
  List,
  Quote,
  Bold,
} from 'lucide-react';

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
  const [tags, setTags] = useState<string[]>(['java-22', 'spring-boot', 'architecture']);
  const [tagInput, setTagInput] = useState('');
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [publicationMode, setPublicationMode] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');

  const defaultCatId = getCatId(categories[0], 1);
  const effectiveCatId =
    userSelectedCatId != null && categories.some((c) => getCatId(c) === userSelectedCatId)
      ? userSelectedCatId
      : defaultCatId;

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

  const insertMarkdown = (prefix: string, suffix = '', placeholder = '') => {
    const textarea = document.getElementById('blog-create-content') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;
    const before = content.substring(0, start);
    const after = content.substring(end);

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newContent = `${before}${replacement}${after}`;
    setContent(newContent);
    setFormError(null);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 15);
  };

  const handleAutoSuggest = async () => {
    if (!title.trim()) {
      setFormError('Lütfen önce bir makale başlığı giriniz.');
      return;
    }
    setFormError(null);
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

  const handleSubmit = async (targetStatus: 'PUBLISHED' | 'DRAFT') => {
    if (!header.trim() || !title.trim() || !content.trim()) {
      setFormError('Lütfen başlık, alt başlık ve makale içeriğini eksiksiz doldurunuz.');
      return;
    }
    setFormError(null);

    setPublicationMode(targetStatus);
    setIsSubmitting(true);
    try {
      const selectedCategory =
        categories.find((c) => getCatId(c) === effectiveCatId) || categories[0];
      const created = await ApiClient.createBlog({
        header: header.trim(),
        title: title.trim(),
        content: content.trim(),
      });
      created.category = selectedCategory;
      created.tags = tags;
      created.readTimeMinutes = readingTimeMinutes;
      created.publicationStatus = targetStatus;
      created.publishedAt = new Date().toISOString();
      created.author = 'Abdullah Berke Özder';
      created.clapsCount = 0;
      created.bookmarksCount = 0;

      onBlogCreated(created);
      onClose();
    } catch {
      setFormError('Makale kaydedilemedi. Lütfen bağlantınızı ve alanları kontrol ediniz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPreviewContent = (rawText: string) => {
    if (!rawText.trim()) {
      return (
        <p className="text-zinc-400 italic font-mono text-xs">
          İçerik henüz girilmedi. &quot;Yaz&quot; sekmesine geçerek makalenizi yazmaya başlayabilirsiniz.
        </p>
      );
    }

    const codeBlockRegex = /(```[\s\S]*?```)/g;
    const parts = rawText.split(codeBlockRegex);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trimStart();
        const firstNewline = lines.indexOf('\n');
        let lang = 'java';
        let code = lines;
        if (firstNewline !== -1) {
          lang = lines.slice(0, firstNewline).trim();
          code = lines.slice(firstNewline + 1);
        }
        return (
          <div
            key={index}
            className="my-4 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100"
          >
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-[10px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 uppercase font-bold text-emerald-400">
                <FileCode className="w-3.5 h-3.5" />
                {lang || 'CODE'}
              </span>
            </div>
            <pre className="p-4 overflow-x-auto text-xs font-mono text-emerald-300">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      const paragraphs = part.split('\n\n').filter((p) => p.trim());
      return (
        <div key={index} className="space-y-3">
          {paragraphs.map((p, pIdx) => {
            const trimmed = p.trim();
            if (trimmed.startsWith('### ')) {
              return (
                <h4
                  key={pIdx}
                  className="text-base font-bold text-zinc-950 dark:text-white pt-3 pb-1 border-b border-zinc-200 dark:border-zinc-800 font-mono"
                >
                  {trimmed.replace(/^###\s+/, '')}
                </h4>
              );
            }
            if (trimmed.startsWith('## ')) {
              return (
                <h3
                  key={pIdx}
                  className="text-xl font-bold text-zinc-950 dark:text-white pt-4 pb-2 border-b border-zinc-200 dark:border-zinc-800 font-sans tracking-tight"
                >
                  {trimmed.replace(/^##\s+/, '')}
                </h3>
              );
            }
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              const items = trimmed
                .split('\n')
                .filter((line) => line.trim().startsWith('- ') || line.trim().startsWith('* '));
              return (
                <ul key={pIdx} className="list-disc list-inside space-y-1 pl-2 text-zinc-700 dark:text-zinc-300 text-sm">
                  {items.map((item, iIdx) => (
                    <li key={iIdx}>{item.replace(/^[-*]\s+/, '')}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p
                key={pIdx}
                className="text-zinc-800 dark:text-zinc-200 text-sm sm:text-base leading-relaxed sm:leading-loose font-serif"
              >
                {trimmed}
              </p>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-hidden animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-[#0c0e12] border border-zinc-200/90 dark:border-zinc-800/90 text-zinc-900 dark:text-zinc-100 shadow-2xl overflow-hidden my-auto">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-white dark:bg-[#0c0e12] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-zinc-950 dark:bg-zinc-800 flex items-center justify-center text-emerald-400 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wide text-zinc-950 dark:text-white">
                YENİ TEKNİK MAKALE YAYINLA
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                SPRING AI ANLAMSAL VEKTÖR İNDEKSİ &bull; MARKDOWN VE KOD SÖZDİZİMİ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Editor vs Preview Apple HIG Segmented Control */}
            <div className="inline-flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'editor'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs font-bold'
                    : 'text-zinc-500 hover:text-black dark:hover:text-white'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>YAZ</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs font-bold'
                    : 'text-zinc-500 hover:text-black dark:hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-emerald-500" />
                <span>ÖNİZLE</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Inline Form Error Alert (Eliminates Browser alert() Anti-pattern) */}
        {formError && (
          <div className="mx-6 sm:mx-8 mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-sans flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{formError}</span>
            </div>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="p-1 rounded-md hover:bg-rose-500/20 text-rose-500 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5">
          {activeTab === 'editor' ? (
            <div className="space-y-5 text-xs font-mono">
              {/* Title Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="blog-create-title" className="font-bold text-zinc-900 dark:text-white uppercase">
                    Makale Başlığı (Title)
                  </label>
                  <span className="text-[10px] text-zinc-400">{title.length}/100</span>
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
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800 text-zinc-900 dark:text-white text-base sm:text-xs font-sans focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Subheader / Scope */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="blog-create-header" className="font-bold text-zinc-900 dark:text-white uppercase">
                    Alt Başlık / Kapsam (Header)
                  </label>
                  <span className="text-[10px] text-zinc-400">{header.length}/100</span>
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
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800 text-zinc-900 dark:text-white text-base sm:text-xs font-sans focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Category & AI Assistant */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="blog-create-category" className="font-bold text-zinc-900 dark:text-white uppercase">
                    Kategori
                  </label>
                  <select
                    id="blog-create-category"
                    name="categoryId"
                    value={String(effectiveCatId)}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setUserSelectedCatId(Number.isFinite(val) ? val : defaultCatId);
                    }}
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800 text-zinc-900 dark:text-white text-base sm:text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {categories.map((c, idx) => {
                      const catId = getCatId(c, idx + 1);
                      return (
                        <option key={String(catId)} value={String(catId)}>
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
                    className="w-full py-2.5 px-4 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-500 hover:text-white text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer uppercase"
                  >
                    {isSuggestingTags ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                    <span>SPRING AI İLE ETİKET ÖNER</span>
                  </button>
                </div>
              </div>

              {/* Content Body Textarea & Quick Toolbar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="blog-create-content" className="font-bold text-zinc-900 dark:text-white uppercase">
                    Teknik İçerik (Markdown &amp; Kod Blokları)
                  </label>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      ~{readingTimeMinutes} dk okuma
                    </span>
                    <span>&bull;</span>
                    <span>{wordCount} kelime</span>
                  </div>
                </div>

                {/* Markdown Formatting Quick Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800 text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => insertMarkdown('\n## ', '\n', 'Bölüm Başlığı')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-emerald-500 font-bold shadow-xs cursor-pointer transition-colors"
                    title="Bölüm Başlığı (H2)"
                  >
                    <Heading className="w-3.5 h-3.5 text-emerald-500" />
                    <span>H2</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('\n### ', '\n', 'Alt Başlık')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-cyan-500 font-bold shadow-xs cursor-pointer transition-colors"
                    title="Alt Başlık (H3)"
                  >
                    <Heading className="w-3.5 h-3.5 text-cyan-500" />
                    <span>H3</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('**', '**', 'vurgulanan metin')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-emerald-500 font-bold shadow-xs cursor-pointer transition-colors"
                    title="Kalın Metin (Bold)"
                  >
                    <Bold className="w-3.5 h-3.5" />
                    <span>Kalın</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('\n```java\n', '\n```\n', '// Java 22 Loom veya Spring Boot kodu')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-amber-500 font-bold shadow-xs cursor-pointer transition-colors"
                    title="Kod Bloğu Ekle"
                  >
                    <Code className="w-3.5 h-3.5 text-amber-500" />
                    <span>Kod Bloğu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('\n- ', '', 'Madde')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-emerald-500 font-bold shadow-xs cursor-pointer transition-colors"
                    title="Madde Listesi"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Liste</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('\n> ', '', 'Mimari not veya alıntı')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-purple-400 font-bold shadow-xs cursor-pointer transition-colors"
                    title="Alıntı / Mimari Not"
                  >
                    <Quote className="w-3.5 h-3.5 text-purple-400" />
                    <span>Alıntı</span>
                  </button>
                </div>

                <textarea
                  id="blog-create-content"
                  name="content"
                  rows={8}
                  required
                  placeholder="Makalenizi buraya yazın... Başlıklar için ##, listeler için -, kod blokları için ```java formatını veya yukarıdaki hızlı araç çubuğunu kullanabilirsiniz."
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800 text-zinc-900 dark:text-white text-base sm:text-xs leading-relaxed focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {/* Tags Section */}
              <div className="space-y-2">
                <label htmlFor="blog-create-tag-input" className="block font-bold text-zinc-900 dark:text-white uppercase">
                  Konu Etiketleri
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-mono uppercase font-semibold"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-rose-500 transition-colors cursor-pointer ml-1 text-sm font-bold"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="blog-create-tag-input"
                    name="tagInput"
                    type="text"
                    placeholder="Yeni etiket ekle (örn: redis, loom)..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="flex-1 px-4 py-2 rounded-full bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800 text-zinc-900 dark:text-white text-base sm:text-xs focus:outline-none focus:border-emerald-500"
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

              {/* Notice Banner */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-zinc-800 dark:text-zinc-200 flex items-start gap-3 font-sans">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5 font-mono text-[11px]">
                  <span className="font-bold text-zinc-950 dark:text-white uppercase">OTOMATİK VEKTÖRLEŞTİRME:</span>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans text-xs">
                    Makale yayınlandığında Spring AI arka planda 128 boyutlu gömme (embedding) çıkararak akıllı semantik
                    keşif motoruna anında kaydedecektir.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Live Markdown & Code Preview Canvas */
            <div className="space-y-6 max-w-2xl mx-auto py-2">
              <div className="space-y-3 border-b border-zinc-200 dark:border-zinc-800 pb-5">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-3 py-1 rounded-full font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white">
                    {categories.find((c) => getCatId(c) === effectiveCatId)?.categoryName || 'MÜHENDİSLİK'}
                  </span>
                  <span>&bull;</span>
                  <span className="text-zinc-500">~{readingTimeMinutes} dk okuma</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white leading-tight">
                  {title || 'Makale Başlığı'}
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                  {header || 'Alt başlık ve makale kapsam özeti...'}
                </p>
              </div>

              <div className="prose prose-zinc dark:prose-invert max-w-none">
                {renderPreviewContent(content)}
              </div>

              {tags.length > 0 && (
                <div className="pt-4 flex flex-wrap gap-2 border-t border-zinc-200 dark:border-zinc-800">
                  {tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Action Bar */}
        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-[#0c0e12] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-colors cursor-pointer uppercase font-mono"
          >
            Vazgeç
          </button>

          <div className="flex items-center gap-2.5">
            {/* Draft Option */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit('DRAFT')}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-bold transition-all cursor-pointer font-mono uppercase"
            >
              <Bookmark className="w-3.5 h-3.5 text-zinc-500" />
              <span>Taslak Kaydet</span>
            </button>

            {/* Publish Option */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit('PUBLISHED')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-black hover:opacity-90 text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer font-mono active:scale-95"
            >
              {isSubmitting && publicationMode === 'PUBLISHED' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>YAYINLANIYOR...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>MAKALEYİ YAYINLA</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
