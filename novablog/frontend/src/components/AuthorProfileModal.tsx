'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Users,
  BookOpen,
  Globe,
  Check,
  Plus,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Terminal,
  Cpu,
  Layers,
  Flame,
} from 'lucide-react';
import { BlogDto, AuthorProfileDto } from '@/types/api';
import { ApiClient } from '@/lib/api';

interface AuthorProfileModalProps {
  authorName: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectBlog?: (blog: BlogDto) => void;
  allBlogs: BlogDto[];
  followedAuthors: string[];
  onToggleFollow: (authorName: string) => void;
}

export const AuthorProfileModal: React.FC<AuthorProfileModalProps> = ({
  authorName,
  isOpen,
  onClose,
  onSelectBlog,
  allBlogs,
  followedAuthors,
  onToggleFollow,
}) => {
  const [profile, setProfile] = useState<AuthorProfileDto | null>(null);
  const [activeTab, setActiveTab] = useState<'articles' | 'notes' | 'about'>('articles');

  useEffect(() => {
    if (!isOpen || !authorName) return;

    let isMounted = true;
    ApiClient.getAuthorProfile(authorName)
      .then((data) => {
        if (isMounted) setProfile(data);
      })
      .catch(() => {
        if (isMounted) setProfile(null);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, authorName]);

  if (!isOpen || !authorName) return null;

  const isFollowing = followedAuthors.includes(authorName);
  const authorBlogs = allBlogs.filter((b) => {
    const authorU = (b.authorUsername || '').toLowerCase();
    const authorN = (b.author || '').toLowerCase();
    const target = authorName.toLowerCase();
    return (
      authorU === target ||
      authorN === target ||
      (target === 'selindemir' && authorN.includes('selin')) ||
      (target === 'caneraydin' && authorN.includes('caner')) ||
      (target === 'admin' && authorN.includes('berke'))
    );
  });

  const isStaffBerke = authorName.toLowerCase().includes('admin') || authorName.toLowerCase().includes('berke');
  const isStaffSelin = authorName.toLowerCase().includes('selin');
  const isStaffCaner = authorName.toLowerCase().includes('caner');

  const displayName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : isStaffSelin
      ? 'Dr. Selin Demir'
      : isStaffCaner
      ? 'Caner Aydın'
      : isStaffBerke
      ? 'Abdullah Berke Özder'
      : authorName;

  const initial = displayName.charAt(0).toUpperCase();

  const authorNotes = isStaffBerke
    ? [
        {
          id: 'm-n1',
          date: '2 gün önce',
          topic: 'Virtual Threads & JDBC Pools',
          content:
            'HikariCP havuz boyutunu sanal thread sayısına göre değil, veritabanı CPU çekirdek sayısına göre boyutlandırın. Sanal iş parçacıkları bağlantı havuzunu şişirmek için bahane değildir.',
          claps: 48,
        },
        {
          id: 'm-n2',
          date: '4 gün önce',
          topic: 'Redis Write-Behind Buffer',
          content:
            'Redis HINCRBY tamponu ile alkış ve görüntülenme sayımlarını toplamak satır kilitlemelerini %99.2 düşürdü.',
          claps: 64,
        },
      ]
    : isStaffSelin
    ? [
        {
          id: 'm-s1',
          date: '3 gün önce',
          topic: 'Dimension Reduction & Memory',
          content:
            '128D vs 1536D embedding karşılaştırması: Düşük boyutlu optimize edilmiş gömmeler kurumsal aramada %80 bellek tasarrufu sağlıyor.',
          claps: 57,
        },
      ]
    : isStaffCaner
    ? [
        {
          id: 'm-c1',
          date: '1 gün önce',
          topic: 'Kubernetes CFS Quota',
          content:
            'Kubernetes pod limitlerinde CFS throttling gecikmeyi 300ms fırlatabiliyor. Sadece CPU request belirleyip limitleri esnetmek gecikmeyi anında düşürdü.',
          claps: 73,
        },
      ]
    : [
        {
          id: 'm-gen',
          date: '3 gün önce',
          topic: 'Mühendislik Notları',
          content: 'Nova platformunda yüksek ölçekli sistem incelemeleri ve optimizasyonlar paylaşıyorum.',
          claps: 12,
        },
      ];

  const techStack = isStaffBerke
    ? ['Java 22', 'Spring Boot 3.4', 'Project Loom', 'PostgreSQL', 'pgvector 128D', 'Redis', 'Next.js 16']
    : isStaffSelin
    ? ['Spring AI', 'pgvector', 'PyTorch', 'Embeddings', 'Vector Search', 'Semantic Cache']
    : isStaffCaner
    ? ['Kubernetes', 'Docker', 'eBPF', 'Prometheus', 'Grafana', 'Kafka', 'CI/CD']
    : ['Teknoloji', 'Sistem Mimarisi'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#0d0f14] rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="relative h-28 bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-purple-500/20 p-6 flex items-start justify-between shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md text-[11px] font-mono font-bold tracking-wider uppercase text-zinc-900 dark:text-zinc-100">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>YAZAR PROFİLİ</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/author/${encodeURIComponent(authorName)}`}
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-1 text-[11px] font-mono font-semibold px-2.5"
              title="Müstakil Profil Sayfasında Aç"
            >
              <span>Ayrı Sayfa</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 flex items-center justify-center text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Card Info */}
        <div className="px-6 sm:px-8 pb-4 -mt-12 space-y-4 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-zinc-950 dark:bg-zinc-800 text-white flex items-center justify-center text-2xl font-bold uppercase shadow-lg ring-4 ring-white dark:ring-[#0d0f14] overflow-hidden shrink-0">
                {profile?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.imageUrl} alt={displayName} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  initial
                )}
              </div>
              <div className="space-y-0.5">
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white">
                  {displayName}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  {profile?.title || (isStaffSelin ? 'Principal AI & Data Systems Researcher' : isStaffCaner ? 'Staff Cloud & Kubernetes Architect' : 'Staff Backend & Systems Architect @ Nova')}
                </p>
              </div>
            </div>

            {/* Follow Action Button */}
            <button
              type="button"
              onClick={() => {
                onToggleFollow(authorName);
                ApiClient.toggleFollow(authorName);
              }}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all shadow-sm cursor-pointer whitespace-nowrap active:scale-95 ${
                isFollowing
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-zinc-950 dark:bg-white text-white dark:text-black hover:opacity-90'
              }`}
            >
              {isFollowing ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>TAKİP EDİLİYOR</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>TAKİP ET</span>
                </>
              )}
            </button>
          </div>

          {/* Bio */}
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {profile?.bio ||
              (isStaffSelin
                ? 'LLM entegrasyonları, pgvector gömmeleri ve yüksek boyutlu vektör uzaylarında anlamsal bilgi getirme (RAG) mimarileri üzerinde araştırmalar yapıyor.'
                : isStaffCaner
                ? 'Cloud-Native mimariler, eBPF gözlemlenebilirlik, sıfır kesintili dağıtımlar ve yüksek erişilebilirlikli mikroservis altyapıları tasarlıyor.'
                : 'Java 22 Loom, Spring Boot 4 ve mikro-çekirdek reaktif sistemler üzerine derinlemesine teknik incelemeler ve üretim mimarileri yayınlıyor.')}
          </p>

          {/* Social Stats & Links */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
            <div className="flex items-center gap-5 text-zinc-600 dark:text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-500" />
                <strong className="text-zinc-950 dark:text-white font-bold">
                  {(profile?.followersCount || 1240) + (isFollowing ? 1 : 0)}
                </strong>{' '}
                takipçi
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                <strong className="text-zinc-950 dark:text-white font-bold">
                  {authorBlogs.length > 0 ? authorBlogs.length : profile?.articlesCount || 6}
                </strong>{' '}
                makale
              </span>
            </div>

            <div className="flex items-center gap-2 text-zinc-400">
              <span className="hover:text-black dark:hover:text-white transition-colors cursor-pointer p-1" title="GitHub">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </span>
              <span className="hover:text-black dark:hover:text-white transition-colors cursor-pointer p-1" title="X (Twitter)">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </span>
              <span className="hover:text-black dark:hover:text-white transition-colors cursor-pointer p-1" title="Web Sitesi">
                <Globe className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Apple Segmented Control Tabs */}
        <div className="px-6 sm:px-8 py-2 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('articles')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'articles'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs font-bold'
                  : 'text-zinc-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
              <span>Makaleler ({authorBlogs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'notes'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs font-bold'
                  : 'text-zinc-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-500" />
              <span>Notlar ({authorNotes.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs font-bold'
                  : 'text-zinc-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-amber-500" />
              <span>Yetkinlikler</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-4 space-y-3 bg-zinc-50/50 dark:bg-black/20 scrollbar-thin">
          {activeTab === 'articles' && (
            <>
              {authorBlogs.length > 0 ? (
                authorBlogs.map((b) => (
                  <div
                    key={b.blogId ?? b.id}
                    onClick={() => {
                      if (onSelectBlog) {
                        onSelectBlog(b);
                        onClose();
                      }
                    }}
                    className="group p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-emerald-500/50 transition-all cursor-pointer space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                      <span>{b.header}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {b.readTimeMinutes || 4} dk okuma
                      </span>
                    </div>
                    <h4 className="font-bold text-zinc-950 dark:text-white text-sm group-hover:text-emerald-500 transition-colors">
                      {b.title}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {b.content.slice(0, 140)}...
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <div className="flex items-center gap-1.5 text-zinc-400 font-mono">
                        <span>👏 {b.clapsCount ?? b.likesCount ?? 0}</span>
                        <span>·</span>
                        <span>💬 {b.commentCount ?? 0}</span>
                      </div>
                      <span className="text-emerald-500 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Oku <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-zinc-400">
                  Bu yazar henüz başka bir makale yayınlamamış.
                </div>
              )}
            </>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-3">
              {authorNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold uppercase">
                      #{note.topic}
                    </span>
                    <span className="text-zinc-400 text-[11px]">{note.date}</span>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                    {note.content}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono pt-1">
                    <span>👏 {note.claps} alkış</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
                <span className="text-xs font-bold text-zinc-950 dark:text-white flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                  Uzmanlık Alanları
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {techStack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80"
                    >
                      <Layers className="w-3 h-3 text-emerald-500" />
                      <span>{tech}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                <span className="font-bold text-zinc-950 dark:text-white flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Mimari Vizyon
                </span>
                <p className="leading-relaxed">
                  Sentetik telemetri ve yapay zeka illüzyonlarından arındırılmış; yüksek eşzamanlı, güvenilir ve sürdürülebilir kurumsal yazılım mimarileri.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
