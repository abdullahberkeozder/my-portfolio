'use client';

import React, { useState } from 'react';
import { macSound } from '@/lib/retroAudioMac9';

interface NovaNewsWindowProps {
  onOpenArticleInBlog?: (articleId?: string) => void;
}

interface NewsItem {
  id: string;
  category: 'frontend' | 'backend' | 'ai' | 'architecture';
  categoryLabel: string;
  badge: string;
  title: string;
  author: string;
  date: string;
  summary: string;
  verdict: string;
  tags: string[];
}

const NEWS_DATA: NewsItem[] = [
  {
    id: 'react-19',
    category: 'frontend',
    categoryLabel: 'FRONTEND ÇEKİRDEĞİ',
    badge: 'FLAŞ HABER',
    title: 'React 19 Kararlı Sürüm: useActionState, useOptimistic ve Otomatik Memoization',
    author: 'Caner Aydın',
    date: '19 Kas 2026',
    summary:
      'Meta React çekirdek ekibi, React 19’un genel kullanıma hazır kararlı sürümünü duyurdu. Yıllardır beklenen otomatik derleyici ve asenkron form eylemleri standartlaştı.',
    verdict:
      'NovaBlog’un beğeni, alkış ve yer imi gibi anlık taktil kullanıcı etkileşimlerinde useOptimistic ile sıfır gecikmeli UI tepkileri sağlandı; karmaşık useMemo yazımları tarihe karıştı.',
    tags: ['REACT & MODERN FRONTEND', '#REACT-19', '#ACTIONS', '#OPTIMISTIC'],
  },
  {
    id: 'anthropic-mcp',
    category: 'ai',
    categoryLabel: 'AJAN STANDARTLARI & MCP',
    badge: 'FLAŞ HABER',
    title: 'Anthropic Model Context Protocol (MCP) Açık Kaynak Standartlaşması',
    author: 'Dr. Selin Demir',
    date: '20 Kas 2026',
    summary:
      'Anthropic, yapay zeka ajanları ile veri kaynakları (veritabanları, IDE’ler, dosya sistemleri, GitHub) arasındaki iki yönlü protokol standardını açık kaynak olarak duyurdu.',
    verdict:
      'Kurumsal backend sistemlerimizde mikroservisleri ve PostgreSQL pgvector veritabanımızı ajanlara bağlamak için ortak standart kuruldu; custom API sarmalayıcı ihtiyacı kalktı.',
    tags: ['YAPAY ZEKA', '#MCP', '#ANTHROPIC', '#LLM-INTEGRATION'],
  },
  {
    id: 'java-23-amber',
    category: 'backend',
    categoryLabel: 'JAVA EVRİMİ & AMBER',
    badge: 'FLAŞ HABER',
    title: 'Java 23 ve Amber Projesi: Primitive Tiplerde Pattern Matching ve Stream Gatherers',
    author: 'Abdullah Berke Özder',
    date: '20 Kas 2026',
    summary:
      'Oracle Java Platform Grubu, Java 23 sürümünü resmen kullanıma sundu. Project Amber kapsamında primitive tiplerde switch pattern matching ve özelleştirilebilir Stream ara işlemleri devreye girdi.',
    verdict:
      'Spring Boot veri dönüşümlerinde ve telemetri metrik hesaplamalarında heap tahsisatları ve boxing-unboxing yükü ortadan kalktı; işlem hızı %28 arttı.',
    tags: ['JAVA & SPRING ÇEKİRDEĞİ', '#JAVA-23', '#VIRTUAL-THREADS', '#AMBER'],
  },
  {
    id: 'loom-concurrency',
    category: 'architecture',
    categoryLabel: 'MİMARİ PERFORMANS',
    badge: 'ANALİZ',
    title: 'Spring Boot 4.1.1 & Virtual Threads: 10,000+ Eşzamanlı İstek Benchmark Raporu',
    author: 'Nova Sistem Ekibi',
    date: '21 Kas 2026',
    summary:
      'Tomcat üzerinde her gelen istek için ayrı bir sanal iş parçacığı tahsis edilerek yapılan yük testinde, PostgreSQL pgvector ve Redis Write-Behind tamponu eşliğinde 11,400+ istek/sn ölçüldü.',
    verdict:
      'Geleneksel platform thread kilitlenmesi sıfıra indirildi; sub-ms P99 gecikme ile kurumsal yüksek verim elde edildi.',
    tags: ['SİSTEM MİMARİSİ', '#LOOM', '#CONCURRENCY', '#REDIS'],
  },
];

export const NovaNewsWindow: React.FC<NovaNewsWindowProps> = ({ onOpenArticleInBlog }) => {
  const [activeChannel, setActiveChannel] = useState<'all' | 'frontend' | 'backend' | 'ai'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNews = NEWS_DATA.filter((item) => {
    const matchesChannel = activeChannel === 'all' || item.category === activeChannel;
    const matchesQuery =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesChannel && matchesQuery;
  });

  return (
    <div className="flex flex-col h-full bg-[#CCCCCC] select-none text-[12px] text-[#262626] font-['Charcoal',sans-serif]">
      {/* Sherlock 2 Üst Kanallar Çubuğu */}
      <div className="p-2 bg-[#DDDDDD] border-b border-[#808080] flex flex-wrap items-center justify-between gap-2 shadow-sm">
        {/* Kanallar (Kanallar Sekmesi) */}
        <div className="flex items-center gap-1">
          {[
            { id: 'all' as const, label: '✦ Tüm Bülten' },
            { id: 'frontend' as const, label: 'Frontend & React' },
            { id: 'backend' as const, label: 'Java & Loom' },
            { id: 'ai' as const, label: 'Yapay Zeka & MCP' },
          ].map((ch) => (
            <button
              key={ch.id}
              onClick={() => {
                macSound.playMacClickDown();
                setActiveChannel(ch.id);
              }}
              className={`px-2.5 py-1 text-[11px] rounded-[2px] border border-[#262626] transition-none ${
                activeChannel === ch.id
                  ? 'bg-[#000080] text-white font-bold'
                  : 'bg-[#EEEEEE] hover:bg-white text-[#262626] shadow-[inset_1px_1px_0_#FFF]'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>

        {/* Sherlock Arama Çubuğu */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sherlock ile haberlerde ara..."
            className="mac9-cursor-text w-48 sm:w-56 h-[22px] px-2 text-[11px] border border-[#262626] bg-white text-[#262626] shadow-inner rounded-[2px] outline-none placeholder:text-[#888]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-1 text-[10px] text-[#666] hover:text-black px-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Bülten Listesi */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#E5E5E5]">
        {filteredNews.length === 0 ? (
          <div className="text-center py-12 text-[#666]">
            <p className="font-bold">Eşleşen haber bulunamadı.</p>
            <p className="text-[11px] mt-1">Farklı bir arama terimi deneyin veya kanalı değiştirin.</p>
          </div>
        ) : (
          filteredNews.map((news) => (
            <div
              key={news.id}
              className="mac9-outset-card p-3 rounded-[3px] bg-[#FFFFFF] border border-[#262626] shadow-[2px_2px_0_rgba(0,0,0,0.15)] flex flex-col gap-2 hover:border-[#000080] transition-colors"
            >
              {/* Üst Bilgi Satırı */}
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="bg-[#FFE5B4] text-[#B85D00] border border-[#CCA066] px-1.5 py-0.2 rounded font-bold font-mono text-[10px]">
                    ⚡ {news.badge}
                  </span>
                  <span className="font-mono text-[#555] font-semibold text-[10px]">
                    {news.categoryLabel}
                  </span>
                </div>
                <div className="text-[#666] font-mono text-[10px]">
                  {news.author} • {news.date}
                </div>
              </div>

              {/* Başlık */}
              <h3 className="font-bold text-[14px] text-black leading-snug">
                {news.title}
              </h3>

              {/* Özet */}
              <p className="text-[12px] text-[#444] leading-relaxed">
                {news.summary}
              </p>

              {/* Mühendislik Değerlendirmesi Kutusu */}
              <div className="bg-[#F0F5FF] border-l-2 border-[#000080] p-2 text-[11px] text-[#1E3A8A] rounded-[2px] italic">
                <span className="font-bold not-italic block mb-0.5 font-mono text-[10px]">
                  🔹 MÜHENDİSLİK DEĞERLENDİRMESİ:
                </span>
                &quot;{news.verdict}&quot;
              </div>

              {/* Etiketler & Blogda Oku Butonu */}
              <div className="flex flex-wrap items-center justify-between pt-1 border-t border-[#DDD] gap-2">
                <div className="flex flex-wrap gap-1">
                  {news.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-1.5 py-0.5 bg-[#EEE] text-[#555] border border-[#CCC] rounded-[2px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => {
                    macSound.playMacClickUp();
                    onOpenArticleInBlog?.(news.id);
                  }}
                  className="mac9-btn mac9-btn-default text-[11px] py-1 px-3 ml-auto"
                >
                  Blogda İncele ➔
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Durum Çubuğu */}
      <div className="px-3 py-1 bg-[#DDDDDD] border-t border-[#808080] text-[10px] font-mono text-[#555] flex justify-between">
        <span>{filteredNews.length} haber listelendi</span>
        <span>Sherlock 2 Haber Motoru v9.2</span>
      </div>
    </div>
  );
};
