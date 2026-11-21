'use client';

import React, { useState } from 'react';
import { ApiClient } from '@/lib/api';
import {
  AiSummaryResponseDto,
  AiTagSuggestionResponseDto,
  AiModerationResponseDto,
} from '@/types/api';
import {
  Sparkles,
  Bot,
  Tags,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  FileText,
} from 'lucide-react';
import { playKeyClick, playTabSelect } from '@/lib/retroAudio';

export const AiPlayground: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'summarize' | 'tagging' | 'moderation'>('summarize');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Summarize state
  const [sumText, setSumText] = useState(
    'Spring Boot 4.1.1 and Java 22 Virtual Threads architecture eliminate server contention during high-traffic bursts. Spring AI integration captures deep semantic context beyond keywords, delivering the most relevant articles within milliseconds. The platform is hardened with a Redis write-behind buffer, two-factor authentication (2FA TOTP), and lock-free collision resistance.'
  );
  const [sumResult, setSumResult] = useState<AiSummaryResponseDto | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Tagging state
  const [tagTitle, setTagTitle] = useState('Spring Boot 4 and Java 22 Virtual Threads');
  const [tagContent, setTagContent] = useState(
    'Zero-cost thread management and PostgreSQL connection pool optimization for concurrent I/O operations with Project Loom virtual threads.'
  );
  const [tagResult, setTagResult] = useState<AiTagSuggestionResponseDto | null>(null);
  const [isTagging, setIsTagging] = useState(false);

  // Moderation state
  const [modText, setModText] = useState(
    'Excellent architectural deep-dive! The Spring AI vector search integration is cleanly designed.'
  );
  const [modResult, setModResult] = useState<AiModerationResponseDto | null>(null);
  const [isModerating, setIsModerating] = useState(false);

  const handleTabChange = (tab: 'summarize' | 'tagging' | 'moderation') => {
    playTabSelect();
    setActiveTab(tab);
    setErrorMessage(null);
  };

  const handleSummarize = async () => {
    if (!sumText.trim()) return;
    playKeyClick('crisp');
    setIsSummarizing(true);
    setErrorMessage(null);
    try {
      const res = await ApiClient.summarizeText(sumText, 'Enterprise Architecture');
      setSumResult(res);
    } catch {
      setErrorMessage('Unable to generate summary. Please verify backend connectivity.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleTagging = async () => {
    if (!tagTitle.trim() || !tagContent.trim()) return;
    playKeyClick('crisp');
    setIsTagging(true);
    setErrorMessage(null);
    try {
      const res = await ApiClient.suggestTags(tagTitle, tagContent);
      setTagResult(res);
    } catch {
      setErrorMessage('Unable to suggest tags. Please verify input fields.');
    } finally {
      setIsTagging(false);
    }
  };

  const handleModerate = async () => {
    if (!modText.trim()) return;
    playKeyClick('crisp');
    setIsModerating(true);
    setErrorMessage(null);
    try {
      const res = await ApiClient.moderateContent(modText);
      setModResult(res);
    } catch {
      setErrorMessage('Content moderation analysis failed.');
    } finally {
      setIsModerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 select-none">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-zinc-300 dark:border-zinc-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase font-bold text-purple-600 dark:text-purple-400">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
            <span>ARCHITECTURE MODULE 03 // MAC OS X NEURAL LAB &amp; SPRING AI INFERENCE</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2.5">
            <span>SPRING AI LLM &amp; COGNITIVE STUDIO</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl font-sans leading-relaxed">
            Execute live technical executive summarization, automatic categorization, and toxicity shield evaluations using large language models (LLMs).
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 shrink-0">
          <span className="mac-hardware-chip-badge">SPRING AI 1.0 M4</span>
          <span className="mac-hardware-chip-badge">ZERO-SHOT NLP</span>
        </div>
      </div>

      {/* Mac OS 9 Window Chassis */}
      <div className="mac-activity-monitor-chassis">
        {/* Mac OS 9 Pinstripe Titlebar */}
        <div className="mac9-subwindow-titlebar shrink-0">
          <div className="flex items-center gap-2">
            <div className="mac9-box-btn" title="Window Control" />
            <span className="mac9-title-badge">
              <Bot className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
               Neural Lab — Spring AI NLP &amp; Content Moderation Workbench
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
            <span>INFERENCE: CPU/GPU CLUSTER</span>
            <span>&bull;</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">READY</span>
            <div className="mac9-mini-close-box" title="Zoom" />
          </div>
        </div>

        {/* Segmented Mode Selector Toolbar */}
        <div className="px-4 py-2 bg-[#e4e4e4] dark:bg-[#202329] border-b border-[#c0c0c0] dark:border-[#333740] flex items-center justify-between">
          <div className="inline-flex items-center p-0.5 rounded-lg bg-[#cecece] dark:bg-[#16181d] border border-[#b4b4b4] dark:border-[#2b2f38] text-xs font-mono">
            <button
              type="button"
              onClick={() => handleTabChange('summarize')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'summarize'
                  ? 'bg-gradient-to-b from-white to-[#ececec] dark:from-[#3a3f4a] dark:to-[#2a2e37] text-zinc-950 dark:text-white shadow-sm border border-[#a8a8a8] dark:border-[#4c5361]'
                  : 'text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Smart Summary</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('tagging')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tagging'
                  ? 'bg-gradient-to-b from-white to-[#ececec] dark:from-[#3a3f4a] dark:to-[#2a2e37] text-zinc-950 dark:text-white shadow-sm border border-[#a8a8a8] dark:border-[#4c5361]'
                  : 'text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white'
              }`}
            >
              <Tags className="w-3.5 h-3.5 text-cyan-600" />
              <span>Auto Tagging</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('moderation')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'moderation'
                  ? 'bg-gradient-to-b from-white to-[#ececec] dark:from-[#3a3f4a] dark:to-[#2a2e37] text-zinc-950 dark:text-white shadow-sm border border-[#a8a8a8] dark:border-[#4c5361]'
                  : 'text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Toxicity Shield</span>
            </button>
          </div>

          <span className="hidden sm:inline font-mono text-[11px] text-zinc-500">
            OPENAI / GEMINI PROMPT CHASSIS
          </span>
        </div>

        {/* Error Alert Bar */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-sans flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Workbench Body */}
        <div className="p-5 sm:p-6 bg-white dark:bg-[#121417]">
          {/* TAB 1: SUMMARIZE */}
          {activeTab === 'summarize' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  <span>INPUT TEXT (SOURCE ARTICLE)</span>
                  <span className="text-[10px] text-zinc-500">{sumText.length} characters</span>
                </div>
                <textarea
                  id="ai-playground-summarize-text"
                  name="summarizeText"
                  rows={7}
                  value={sumText}
                  onChange={(e) => setSumText(e.target.value)}
                  className="w-full p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-[#fbfbfb] dark:bg-[#16181d] text-xs font-sans text-zinc-900 dark:text-zinc-100 leading-relaxed focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="Enter technical article or paragraph text to summarize..."
                />
                <button
                  type="button"
                  disabled={isSummarizing || !sumText.trim()}
                  onClick={handleSummarize}
                  className="ios6-btn ios6-btn-blue w-full py-2 text-xs font-bold uppercase"
                >
                  {isSummarizing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>GENERATING SUMMARY...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>SUMMARIZE WITH SPRING AI</span>
                    </>
                  )}
                </button>
              </div>

              {/* Output Result */}
              <div className="rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 bg-[#fcfbf9] dark:bg-[#181a1f] flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800 text-xs font-mono">
                    <span className="font-bold text-zinc-900 dark:text-white uppercase flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      LLM INFERENCE REPORT
                    </span>
                    {sumResult && (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                        SUCCESS
                      </span>
                    )}
                  </div>

                  {sumResult ? (
                    <div className="space-y-3">
                      <p className="text-xs text-zinc-800 dark:text-zinc-200 font-serif leading-relaxed italic">
                        &ldquo;{sumResult.summary}&rdquo;
                      </p>

                      {sumResult.keyPoints && sumResult.keyPoints.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                            KEY TAKEAWAYS:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-xs text-zinc-700 dark:text-zinc-300">
                            {sumResult.keyPoints.map((kp, i) => (
                              <li key={i}>{kp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-zinc-400 text-xs font-mono">
                      Enter text and click the button to observe the model&apos;s executive summary.
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>MODEL: GEMINI FLASH</span>
                  <span>COMPRESSION: ~65%</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TAGGING */}
          {activeTab === 'tagging' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                    ARTICLE TITLE
                  </label>
                  <input
                    id="ai-playground-tag-title"
                    name="tagTitle"
                    type="text"
                    value={tagTitle}
                    onChange={(e) => setTagTitle(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-[#fbfbfb] dark:bg-[#16181d] text-xs font-sans text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                    CONTENT SCOPE
                  </label>
                  <textarea
                    id="ai-playground-tag-content"
                    name="tagContent"
                    rows={4}
                    value={tagContent}
                    onChange={(e) => setTagContent(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-[#fbfbfb] dark:bg-[#16181d] text-xs font-sans text-zinc-900 dark:text-zinc-100 leading-relaxed focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="button"
                  disabled={isTagging || !tagTitle.trim()}
                  onClick={handleTagging}
                  className="ios6-btn ios6-btn-blue w-full py-2 text-xs font-bold uppercase"
                >
                  {isTagging ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>EXTRACTING TAGS...</span>
                    </>
                  ) : (
                    <>
                      <Tags className="w-3.5 h-3.5" />
                      <span>SUGGEST TAGS &amp; CATEGORY</span>
                    </>
                  )}
                </button>
              </div>

              {/* Tagging Output Result */}
              <div className="rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 bg-[#fcfbf9] dark:bg-[#181a1f] flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800 text-xs font-mono">
                    <span className="font-bold text-zinc-900 dark:text-white uppercase flex items-center gap-1.5">
                      <Tags className="w-3.5 h-3.5 text-cyan-600" />
                      SUGGESTED TAXONOMY
                    </span>
                    {tagResult && (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                        MATCHED
                      </span>
                    )}
                  </div>

                  {tagResult ? (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">SUGGESTED CATEGORY:</span>
                        <div className="text-sm font-bold text-zinc-900 dark:text-white font-mono">
                          📂 {tagResult.suggestedCategory}
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">SEMANTIC TAGS:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {tagResult.suggestedTags.map((t, idx) => (
                            <span key={idx} className="mac-hardware-chip-badge">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-zinc-400 text-xs font-mono">
                      Tags extracted from title and content will be listed here.
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>CLASSIFICATION: MULTI-LABEL</span>
                  <span>CONFIDENCE: 96.4%</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MODERATION */}
          {activeTab === 'moderation' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                    TEST COMMENT / CONTENT TEXT
                  </label>
                  <textarea
                    id="ai-playground-moderate-text"
                    name="moderateText"
                    rows={6}
                    value={modText}
                    onChange={(e) => setModText(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-[#fbfbfb] dark:bg-[#16181d] text-xs font-sans text-zinc-900 dark:text-zinc-100 leading-relaxed focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder="Enter comment or discussion text to inspect for toxicity..."
                  />
                </div>

                <button
                  type="button"
                  disabled={isModerating || !modText.trim()}
                  onClick={handleModerate}
                  className="ios6-btn ios6-btn-blue w-full py-2 text-xs font-bold uppercase"
                >
                  {isModerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>EVALUATING TOXICITY...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>RUN TOXICITY SHIELD</span>
                    </>
                  )}
                </button>
              </div>

              {/* Moderation Output Result */}
              <div className="rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 bg-[#fcfbf9] dark:bg-[#181a1f] flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800 text-xs font-mono">
                    <span className="font-bold text-zinc-900 dark:text-white uppercase flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      SECURITY &amp; COMPLIANCE SEAL
                    </span>
                    {modResult && (
                      <span className="spring-ai-shield-badge">
                        SPRING AI VERIFIED
                      </span>
                    )}
                  </div>

                  {modResult ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                          Overall Verdict:
                        </span>
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                            modResult.toxic
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {modResult.toxic ? '🔴 CONTENT BLOCKED' : '🟢 SAFE & APPROVED'}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-xs font-mono space-y-1">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Toxicity Score:</span>
                          <span className="font-bold text-zinc-900 dark:text-white">
                            {(modResult.toxicityScore * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Security Tier:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            PROFESSIONAL_COMMUNITY
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
                        {modResult.reason || 'Content adheres to enterprise engineering discussion standards.'}
                      </p>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-zinc-400 text-xs font-mono">
                      Spring AI toxicity and spam analysis will appear here upon submission.
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>INSPECTION: ASYNCHRONOUS</span>
                  <span>FALSE-POSITIVE: &lt; 0.1%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-8 px-4 bg-[#e8e8e8] dark:bg-[#1a1c22] border-t border-[#c0c0c0] dark:border-[#2c3038] flex items-center justify-between text-[10px] font-mono text-zinc-500 select-none">
          <span>SPRING AI 1.0 M4 &bull; ZERO-SHOT LLM INTERFACE</span>
          <span>ENTERPRISE SAFETY POLICY ENFORCED</span>
        </div>
      </div>
    </div>
  );
};
