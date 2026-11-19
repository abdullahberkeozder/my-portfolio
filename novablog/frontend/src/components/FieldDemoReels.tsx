'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Film,
  Info,
  Maximize2,
  Sliders,
} from 'lucide-react';
import { playKeyClick, playTabSelect, playWindowOpen } from '@/lib/retroAudio';

interface ReelItem {
  id: string;
  tag: string;
  badge: string;
  caption: string;
  title: string;
  subtitle: string;
  detail: string;
  image: string;
  moduleTarget: string;
  durationSec: number;
  filename: string;
  codec: string;
  bitrate: string;
  fps: string;
}

const REELS: ReelItem[] = [
  {
    id: 'reel-loom',
    tag: '01 // JAVA 22 LOOM',
    badge: '10K VIRTUAL THREADS',
    caption: '10,000 EŞZAMANLI İSTEK',
    title: 'SANAL İŞ PARÇACIĞI HAVUZU',
    subtitle: 'SUNUCU KİLİTLENMESİNE SON',
    detail: 'Aynı anda 10.000 kişi bağlandığında dahi milisaniyeler içinde yanıt veren hafif iş parçacığı mimarisi.',
    image: '/images/architecture-cutaway.jpg',
    moduleTarget: 'loom',
    durationSec: 6,
    filename: 'Java22_Loom_VirtualThreads.mov',
    codec: 'Apple ProRes 422 HQ, Linear PCM',
    bitrate: '11.4K req/s (Throughput)',
    fps: '60 fps @ 1080p',
  },
  {
    id: 'reel-redis',
    tag: '02 // REDIS WRITE-BEHIND',
    badge: 'LOCKLESS BUFFER',
    caption: '12.4K İSTEK/SN',
    title: 'ÖNBELLEK TAMPONLAMA',
    subtitle: 'VERİTABANI KİLİTLENMESİNE SON',
    detail: 'Yüksek trafik anında veritabanını yormayan, sayaçları bellekte toplayıp düzenli senkronize eden akıllı tampon.',
    image: '/images/terminal-hardware.jpg',
    moduleTarget: 'write-behind',
    durationSec: 7,
    filename: 'Redis_WriteBehind_Pipeline.mov',
    codec: 'H.264 High Profile, AAC',
    bitrate: '12,400 ops/s (Zero Lock)',
    fps: '60 fps @ 1080p',
  },
  {
    id: 'reel-springai',
    tag: '03 // SPRING AI pgvector',
    badge: '128D VECTOR SPACE',
    caption: '%94.2 ANLAMSAL İSABET',
    title: 'YAPAY ZEKA ANLAMSAL ARAMA',
    subtitle: 'AKILLI HİBRİT SIRALAMA',
    detail: 'Yazım hatası yapsanız dahi içeriğin derin anlamını kavrayan ve en doğru makaleyi getiren yapay zeka motoru.',
    image: '/images/hardware-core.jpg',
    moduleTarget: 'spring-ai',
    durationSec: 6,
    filename: 'SpringAI_pgvector_Cosine.mov',
    codec: 'Apple ProRes 4444, Float 32',
    bitrate: '128-Dim Cosine Distance',
    fps: '60 fps @ 1080p',
  },
  {
    id: 'reel-security',
    tag: '04 // RFC 7807 & 2FA',
    badge: 'STATE MACHINE',
    caption: 'İKİ ADIMLI 2FA DOĞRULAMA',
    title: 'PRE-AUTH & 2FA GÜVENLİK ZIRHI',
    subtitle: 'KURUMSAL KİMLİK KORUMASI',
    detail: 'İki faktörlü TOTP kodları ve standart hata yanıtlarıyla verilerinizi koruyan tavizsiz güvenlik protokolü.',
    image: '/images/terminal-hardware.jpg',
    moduleTarget: 'optimistic-locking',
    durationSec: 6,
    filename: 'Security_RFC7807_Keypad.mov',
    codec: 'H.264 Constrained, AES-256',
    bitrate: 'TOTP SHA-1 Time-Step 30s',
    fps: '60 fps @ 1080p',
  },
  {
    id: 'reel-batch',
    tag: '05 // SPRING BATCH 5',
    badge: 'CHUNK 100 ZERO LEAK',
    caption: 'SIFIR SIZINTI ETL',
    title: 'OTOMATİK VERİ TEMİZLİĞİ',
    subtitle: 'KESİNTİSİZ ARKA PLAN BORU HATTI',
    detail: 'Eski ve silinmiş verileri sunucu performansını zedelemeden arka planda temizleyen akıllı toplu iş motoru.',
    image: '/images/architecture-cutaway.jpg',
    moduleTarget: 'spring-batch',
    durationSec: 8,
    filename: 'SpringBatch5_RetentionETL.mov',
    codec: 'Apple ProRes 422, Multi-Thread',
    bitrate: '100 Items/Chunk Commit',
    fps: '60 fps @ 1080p',
  },
];

interface FieldDemoReelsProps {
  onOpenArchitectureConsole?: (moduleId: string) => void;
}

export const FieldDemoReels: React.FC<FieldDemoReelsProps> = ({
  onOpenArchitectureConsole,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredReelId, setHoveredReelId] = useState<string | null>(null);
  const [activeInspectorId, setActiveInspectorId] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ [id: string]: number }>({});
  const [isMuted, setIsMuted] = useState(true);

  // Mouse drag-to-scroll state
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  // Video progress simulation on hover
  useEffect(() => {
    if (!hoveredReelId) return;

    const reel = REELS.find((r) => r.id === hoveredReelId);
    const duration = (reel?.durationSec || 6) * 1000;
    const intervalMs = 50;
    const step = 100 / (duration / intervalMs);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const current = prev[hoveredReelId] || 0;
        const next = current + step;
        return {
          ...prev,
          [hoveredReelId]: next >= 100 ? 0 : next,
        };
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [hoveredReelId]);

  const handleMouseEnter = (id: string) => {
    setHoveredReelId(id);
    setProgress((prev) => ({ ...prev, [id]: prev[id] || 0 }));
  };

  const handleMouseLeaveCard = () => {
    setHoveredReelId(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 && e.button !== 2) return;
    if (!containerRef.current) return;

    setIsMouseDown(true);
    setHasDragged(false);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeftPos(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }
    containerRef.current.scrollLeft = scrollLeftPos - walk;
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const scroll = (direction: 'left' | 'right') => {
    playKeyClick('crisp');
    if (containerRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCardClick = (reel: ReelItem) => {
    if (hasDragged) return;
    playWindowOpen();
    if (onOpenArchitectureConsole) {
      onOpenArchitectureConsole(reel.moduleTarget);
    } else {
      const el = document.getElementById('modular-architecture-console');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      window.dispatchEvent(new CustomEvent('select-console-module', { detail: reel.moduleTarget }));
      window.dispatchEvent(new CustomEvent('run-console-simulation'));
    }
  };

  const toggleInspector = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    playTabSelect();
    setActiveInspectorId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="bg-gradient-to-b from-[#18181b] via-[#0f0f12] to-[#000000] text-white py-14 sm:py-20 border-b border-black/40 select-none overflow-hidden relative">
      {/* Subtle Mac Studio Chassis Ambient Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header: QuickTime X Desktop Video Showcase */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 sm:pb-8 gap-4 border-b border-white/10 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-md bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center shadow-md border border-blue-300/40">
                <Film className="w-3.5 h-3.5 text-white" />
              </span>
              <h2 className="font-sans text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>QuickTime X Mimari Telemetri Kayıtları</span>
                <span className="text-xs font-mono font-normal text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/10 hidden md:inline">
                  PRORES 422 HQ // 1080P DESKTOP REEL
                </span>
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Sanal iş parçacıkları, önbellek tamponu ve pgvector kosinüs hesaplamalarını QuickTime arayüzünde inceleyin.
            </p>
          </div>

          {/* Carousel Navigation Toolbar */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-zinc-400 hidden lg:inline tracking-wider bg-black/40 px-3 py-1 rounded-full border border-white/10">
              SÜRÜKLE VEYA HOVER İLE OYNAT
            </span>

            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zinc-900/90 border border-white/15 shadow-inner">
              <button
                onClick={() => scroll('left')}
                className="w-8 h-8 rounded bg-gradient-to-b from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 shadow-sm"
                title="Önceki Kayıt"
                aria-label="Önceki Kayıt"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-8 h-8 rounded bg-gradient-to-b from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 shadow-sm"
                title="Sonraki Kayıt"
                aria-label="Sonraki Kayıt"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Reel Cards (Styled as authentic QuickTime Player windows) */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onContextMenu={(e) => {
            if (hasDragged) e.preventDefault();
          }}
          className={`flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 -mx-4 px-4 sm:mx-0 sm:px-0 ${
            isMouseDown ? 'cursor-grabbing select-none' : 'cursor-grab'
          }`}
        >
          {REELS.map((reel) => {
            const isHovered = hoveredReelId === reel.id;
            const isInspectorOpen = activeInspectorId === reel.id;
            const cardProgress = progress[reel.id] || 0;
            const currentSec = Math.floor(((cardProgress / 100) * reel.durationSec));

            return (
              <div
                key={reel.id}
                onMouseEnter={() => handleMouseEnter(reel.id)}
                onMouseLeave={handleMouseLeaveCard}
                onClick={() => handleCardClick(reel)}
                className="relative min-w-[280px] sm:min-w-[320px] max-w-[340px] flex-shrink-0 snap-start rounded-xl overflow-hidden bg-[#1c1c1f] border border-white/20 shadow-[0_16px_36px_rgba(0,0,0,0.8)] transition-all duration-300 hover:scale-[1.02] hover:border-blue-400/60 group cursor-pointer flex flex-col"
              >
                {/* Mac OS X QuickTime Window Titlebar */}
                <div className="h-8 bg-gradient-to-b from-[#3a3a3d] to-[#252528] px-3 flex items-center justify-between border-b border-black/60 select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] border border-[#e0443e] shadow-inner" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e] border border-[#d89e24] shadow-inner" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28c840] border border-[#1aab29] shadow-inner" />
                  </div>

                  <span className="text-[11px] font-mono text-zinc-300 truncate max-w-[170px] drop-shadow-sm font-semibold">
                    {reel.filename}
                  </span>

                  <button
                    onClick={(e) => toggleInspector(e, reel.id)}
                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                      isInspectorOpen
                        ? 'bg-blue-600 text-white shadow-inner'
                        : 'text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                    title="Movie Inspector (⌘I)"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>

                {/* Video Viewport Area */}
                <div className="relative aspect-[16/10] bg-black overflow-hidden">
                  <Image
                    src={reel.image}
                    alt={reel.title}
                    fill
                    priority={reel.id === 'reel-loom'}
                    sizes="(max-width: 768px) 280px, 340px"
                    className={`object-cover object-center transition-transform duration-700 ease-out ${
                      isHovered ? 'scale-105 brightness-105' : 'scale-100 brightness-90'
                    }`}
                  />

                  {/* Top Vignette with Hardware Chip Badge */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
                    <span className="mac-hardware-chip-badge !bg-black/75 !text-[9px] !border-white/20">
                      {reel.badge}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playKeyClick('crisp');
                        setIsMuted(!isMuted);
                      }}
                      className="w-7 h-7 rounded-full bg-black/75 hover:bg-black text-white border border-white/20 flex items-center justify-center transition-transform hover:scale-110 pointer-events-auto shadow-md"
                      title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
                    >
                      {isMuted ? (
                        <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                      )}
                    </button>
                  </div>

                  {/* QuickTime Movie Inspector (⌘I HUD Overlay) */}
                  {isInspectorOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute inset-2 bg-black/90 backdrop-blur-md rounded-lg p-3 z-30 border border-white/20 text-xs font-mono space-y-2 text-zinc-300 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
                    >
                      <div className="flex items-center justify-between border-b border-white/15 pb-1">
                        <span className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                          <Sliders className="w-3 h-3 text-blue-400" />
                          <span>Movie Inspector (⌘I)</span>
                        </span>
                        <span className="text-[10px] text-zinc-400">ProRes</span>
                      </div>
                      <div className="space-y-1 text-[10px]">
                        <p className="flex justify-between">
                          <span className="text-zinc-500">Codec:</span>
                          <span className="text-zinc-200 font-semibold">{reel.codec}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-zinc-500">Çözünürlük:</span>
                          <span className="text-zinc-200">{reel.fps}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-zinc-500">Veri Akışı:</span>
                          <span className="text-emerald-400 font-bold">{reel.bitrate}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-zinc-500">Süre:</span>
                          <span className="text-zinc-200">00:00:0{reel.durationSec} (Tam Döngü)</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* QuickTime Floating Dark Glass Transport HUD */}
                  <div className="absolute bottom-2 inset-x-2 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-2.5 rounded-lg border border-white/10 z-20 flex flex-col gap-1.5">
                    {/* Timecode & Play State */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        {isHovered ? (
                          <Pause className="w-3 h-3 text-blue-400 fill-blue-400" />
                        ) : (
                          <Play className="w-3 h-3 text-zinc-400 fill-zinc-400" />
                        )}
                        <span className="font-semibold text-white">
                          00:0{currentSec} / 00:0{reel.durationSec}
                        </span>
                      </div>
                      <span className="text-blue-400 font-bold tracking-wider text-[9px] uppercase">
                        {reel.tag}
                      </span>
                    </div>

                    {/* QuickTime Scrub Bar */}
                    <div className="h-1.5 rounded-full bg-white/20 overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-all duration-75"
                        style={{ width: `${isHovered ? cardProgress : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Card Information Plinth (Brushed Silver/Slate look) */}
                <div className="p-4 bg-gradient-to-b from-[#222226] to-[#18181b] border-t border-black/40 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white tracking-tight uppercase line-clamp-1 group-hover:text-blue-400 transition-colors">
                      {reel.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-sans mt-1 line-clamp-2 leading-relaxed">
                      {reel.detail}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span className="text-zinc-500 uppercase">{reel.caption}</span>
                    <span className="text-blue-400 font-semibold group-hover:underline flex items-center gap-1">
                      <span>Simülasyon</span>
                      <Maximize2 className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};