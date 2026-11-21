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
  Mail,
} from 'lucide-react';
import { playKeyClick, playTabSelect, playSendWhoosh } from '@/lib/retroAudio';

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
    playKeyClick('crisp');
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
    playKeyClick('crisp');
    if (!title.trim()) {
      setFormError('Please enter an article title first.');
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
      playKeyClick('crisp');
      setTags([...tags, cleanTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    playKeyClick('crisp');
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (targetStatus: 'PUBLISHED' | 'DRAFT') => {
    if (!header.trim() || !title.trim() || !content.trim()) {
      setFormError('Please provide title, subtitle, and article content.');
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
      created.author = 'Abdullah Berke Ozder';
      created.clapsCount = 0;
      created.bookmarksCount = 0;

      // Play authentic Mac OS X Mail send whoosh sound!
      playSendWhoosh();

      onBlogCreated(created);
      onClose();
    } catch {
      setFormError('Failed to save article. Please verify your connection and form fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPreviewContent = (rawText: string) => {
    if (!rawText.trim()) {
      return (
        <p className="text-zinc-400 italic font-mono text-xs">
          No content entered yet. Switch to the &quot;Write&quot; tab to compose your article.
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
            className="my-4 rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-800 bg-[#16181d] text-zinc-100"
          >
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#20232a] border-b border-zinc-800 text-[10px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 uppercase font-bold text-emerald-400">
                <FileCode className="w-3.5 h-3.5" />
                {lang || 'CODE'}
              </span>
            </div>
            <pre className="p-3.5 overflow-x-auto text-xs font-mono text-emerald-300 leading-relaxed">
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
                  className="text-base font-bold text-zinc-950 dark:text-white pt-2 font-mono"
                >
                  {trimmed.replace(/^###\s+/, '')}
                </h4>
              );
            }
            if (trimmed.startsWith('## ')) {
              return (
                <h3
                  key={pIdx}
                  className="text-lg font-bold text-zinc-950 dark:text-white pt-3 pb-1 border-b border-zinc-200 dark:border-zinc-800 font-sans tracking-tight"
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
                className="text-zinc-800 dark:text-zinc-200 text-sm leading-relaxed font-serif"
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
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/75 backdrop-blur-md overflow-hidden animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative mac9-window-frame w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mac OS 9 Platinum Pinstripe Titlebar */}
        <div className="mac9-subwindow-titlebar shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="mac9-box-btn"
              title="Close (Esc)"
            />
            <span className="mac9-title-badge">
               New Publication — Compose Article
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline mr-2">
              SPRING AI VECTOR TAGGER
            </span>
            <div className="mac9-mini-close-box cursor-pointer" title="Zoom" />
            <div
              className="mac9-mini-close-box flex flex-col justify-center items-center gap-[1px] cursor-pointer"
              title="WindowShade"
            >
              <div className="w-[7px] h-[1px] bg-[#262626] dark:bg-[#AAA]" />
              <div className="w-[7px] h-[1px] bg-[#262626] dark:bg-[#AAA]" />
            </div>
          </div>
        </div>

        {/* Mac OS 9 Application Toolbar */}
        <div className="mac9-app-toolbar px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {/* Send / Publish Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit('PUBLISHED')}
              title={isSubmitting ? 'Publishing article, please wait...' : 'Verify and publish article live'}
              className="mac9-btn-default !px-3.5 !py-1 text-xs font-bold"
            >
              {isSubmitting && publicationMode === 'PUBLISHED' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  <span>PUBLISHING...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1" />
                  <span>Publish</span>
                </>
              )}
            </button>

            {/* Save Draft Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit('DRAFT')}
              title={isSubmitting ? 'Processing...' : 'Save as draft'}
              className="mac9-btn !px-3 !py-1 text-xs font-bold"
            >
              <Bookmark className="w-3.5 h-3.5 mr-1 text-zinc-600 dark:text-zinc-400" />
              <span>Draft</span>
            </button>
          </div>

          {/* Center: Markdown Formatting Toolbar */}
          <div className="hidden sm:inline-flex items-center p-0.5 rounded-lg bg-[#cecece] dark:bg-[#16181d] border border-[#b4b4b4] dark:border-[#2b2f38]">
            <button
              type="button"
              onClick={() => insertMarkdown('\n## ', '\n', 'Heading')}
              className="px-2 py-1 rounded text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700"
              title="Section Heading (H2)"
            >
              <Heading className="w-3.5 h-3.5 text-emerald-600" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('**', '**', 'bold text')}
              className="px-2 py-1 rounded text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700"
              title="Bold Text"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('\n```java\n', '\n```\n', '// Java 22 Loom code')}
              className="px-2 py-1 rounded text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700"
              title="Java Code Block"
            >
              <Code className="w-3.5 h-3.5 text-amber-600" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('\n- ', '', 'Item')}
              className="px-2 py-1 rounded text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700"
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('\n> ', '', 'Architectural note')}
              className="px-2 py-1 rounded text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700"
              title="Quote / Note"
            >
              <Quote className="w-3.5 h-3.5 text-purple-500" />
            </button>
          </div>

          {/* Right: View Switcher */}
          <div className="inline-flex items-center p-0.5 rounded-lg bg-[#cecece] dark:bg-[#16181d] border border-[#b4b4b4] dark:border-[#2b2f38] text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                playTabSelect();
                setActiveTab('editor');
              }}
              className={`px-3 py-1 rounded flex items-center gap-1 font-bold ${
                activeTab === 'editor'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <PenTool className="w-3 h-3" />
              <span>Write</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playTabSelect();
                setActiveTab('preview');
              }}
              className={`px-3 py-1 rounded flex items-center gap-1 font-bold ${
                activeTab === 'preview'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Eye className="w-3 h-3 text-emerald-500" />
              <span>Preview</span>
            </button>
          </div>
        </div>

        {/* Mail Header Form Fields (To, Subject, Scope) */}
        <div className="shrink-0">
          {/* Row 1: Category / To */}
          <div className="mac-mail-field-row">
            <span className="mac-mail-field-label">To / Section:</span>
            <div className="flex-1 flex items-center justify-between gap-2">
              <select
                id="blog-create-category"
                name="categoryId"
                value={String(effectiveCatId)}
                onChange={(e) => {
                  playKeyClick('crisp');
                  const val = Number(e.target.value);
                  setUserSelectedCatId(Number.isFinite(val) ? val : defaultCatId);
                }}
                className="bg-transparent text-xs font-sans text-zinc-900 dark:text-zinc-100 font-bold focus:outline-none cursor-pointer py-1"
              >
                {categories.map((c, idx) => {
                  const catId = getCatId(c, idx + 1);
                  return (
                    <option key={String(catId)} value={String(catId)} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                      {c.categoryName}
                    </option>
                  );
                })}
              </select>

              <button
                type="button"
                onClick={handleAutoSuggest}
                disabled={isSuggestingTags}
                className="ios6-btn ios6-btn-silver px-2.5 py-0.5 text-[10px] font-mono shrink-0"
                title="Suggest tags and category based on title via Spring AI"
              >
                {isSuggestingTags ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                )}
                <span>AI SUGGEST</span>
              </button>
            </div>
          </div>

          {/* Row 2: Subject (Title) */}
          <div className="mac-mail-field-row">
            <span className="mac-mail-field-label">Subject / Title:</span>
            <input
              id="blog-create-title"
              name="title"
              type="text"
              required
              maxLength={100}
              placeholder="e.g.: Java 22 Virtual Threads and High-Throughput Loom Architecture"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 bg-transparent text-xs font-sans font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none py-1"
            />
          </div>

          {/* Row 3: Scope (Header / Subtitle) */}
          <div className="mac-mail-field-row">
            <span className="mac-mail-field-label">Scope / Summary:</span>
            <input
              id="blog-create-header"
              name="header"
              type="text"
              required
              maxLength={100}
              placeholder="e.g.: Concurrency, Thread Pool Bottlenecks, and Non-blocking I/O"
              value={header}
              onChange={(e) => setHeader(e.target.value)}
              className="flex-1 bg-transparent text-xs font-sans text-zinc-700 dark:text-zinc-300 focus:outline-none py-1"
            />
          </div>

          {/* Row 4: Etiketler (Tags) */}
          <div className="mac-mail-field-row">
            <span className="mac-mail-field-label">Tags:</span>
            <div className="flex-1 flex flex-wrap items-center gap-1.5 py-1">
              {tags.map((t, idx) => (
                <span
                  key={idx}
                  className="retro-tag-pill inline-flex items-center gap-1 text-[10px]"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-600 cursor-pointer text-xs font-bold ml-0.5"
                  >
                    &times;
                  </button>
                </span>
              ))}
              <div className="inline-flex items-center gap-1">
                <input
                  id="blog-create-tag-input"
                  name="tagInput"
                  type="text"
                  placeholder="+ tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="bg-transparent text-[11px] font-mono text-zinc-700 dark:text-zinc-300 focus:outline-none w-20"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert Bar */}
        {formError && (
          <div className="mx-4 mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-sans flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{formError}</span>
            </div>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="p-0.5 text-rose-500 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Body Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white dark:bg-[#14161a]">
          {activeTab === 'editor' ? (
            <div className="h-full flex flex-col space-y-2">
              <textarea
                id="blog-create-content"
                name="content"
                rows={14}
                required
                placeholder="Compose your technical article here... Markdown supported: ## for Headings, - for Lists, ```java for Code blocks."
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (formError) setFormError(null);
                }}
                className="w-full flex-1 p-3 bg-transparent text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm font-sans leading-relaxed focus:outline-none resize-none"
              />

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400 select-none">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Ready for Spring AI 128D Vector Index
                </span>
                <span className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    ~{readingTimeMinutes} min read
                  </span>
                  <span>&bull;</span>
                  <span>{wordCount} words</span>
                </span>
              </div>
            </div>
          ) : (
            /* Safari Reader Styled Preview */
            <div className="safari-reader-parchment max-w-2xl mx-auto p-6 sm:p-8 space-y-4 rounded-xl shadow-lg border border-[#c4bdae] dark:border-[#383c44]">
              <div className="space-y-2 border-b border-zinc-300 dark:border-zinc-700 pb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                  <span className="font-bold uppercase text-emerald-600">
                    {categories.find((c) => getCatId(c) === effectiveCatId)?.categoryName || 'ENGINEERING'}
                  </span>
                  <span>&bull;</span>
                  <span>~{readingTimeMinutes} min read</span>
                </div>
                <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white leading-tight">
                  {title || 'Article Title'}
                </h1>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                  {header || 'Subtitle summary...'}
                </p>
              </div>

              <div className="prose prose-zinc dark:prose-invert max-w-none text-xs sm:text-sm">
                {renderPreviewContent(content)}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Status Bar */}
        <div className="h-8 px-4 bg-[#e8e8e8] dark:bg-[#1a1c22] border-t border-[#c0c0c0] dark:border-[#2c3038] flex items-center justify-between text-[10px] font-mono text-zinc-500 select-none shrink-0">
          <span>MAC OS 9.2.2 PLATINUM PUBLICATION STUDIO</span>
          <span>AUTOSAVE: LOCAL BUFFER</span>
        </div>
      </div>
    </div>
  );
};
