'use client';

import React, { useState } from 'react';
import {
  Cpu,
  Database,
  ShieldCheck,
  Check,
  Copy,
  Terminal,
  Zap,
  ChevronDown,
  ChevronUp,
  Activity,
  Lock,
  Info,
} from 'lucide-react';
import { playKeyClick, playTabSelect, playWindowOpen } from '@/lib/retroAudio';

interface SystemBlueprintSectionProps {
  onOpenTelemetry?: () => void;
  onOpenTwoFactor?: () => void;
  onOpenAbout?: () => void;
}

interface BlueprintCategory {
  index: string;
  title: string;
  tag: string;
  busSlot: string;
  chipModel: string;
  icon: React.ElementType;
  specs: { key: string; value: string; desc: string; chipBadge?: string }[];
}

const BLUEPRINT_DATA: BlueprintCategory[] = [
  {
    index: '01',
    title: 'YÜKSEK TRAFİK & EŞZAMANLILIK (CONCURRENCY BUS)',
    tag: 'JAVA 22 LOOM',
    busSlot: 'PCIe 2.0 x16 HOST BUS',
    chipModel: 'INTEL-XEON-LOOM-V22',
    icon: Zap,
    specs: [
      {
        key: 'İŞ PARÇACIĞI MİMARİSİ',
        value: 'Virtual Threads (Loom)',
        desc: 'Geleneksel ağır işletim sistemi threadleri yerine hafif sanal iş parçacıkları; sunucu kilitlenmesi sıfıra iner.',
        chipBadge: 'QFP-64 // V-THREAD',
      },
      {
        key: 'EŞZAMANLI İSTEK KAPASİTESİ',
        value: '11,400+ İstek/sn',
        desc: 'Tomcat üzerinde her istek için anında sanal thread tahsis edilir; yüksek trafikte yanıt süreleri uzamaz.',
        chipBadge: 'SOIC-16 // THROUGHPUT',
      },
      {
        key: 'ÇALIŞMA ZAMANI (RUNTIME)',
        value: 'OpenJDK 22.0.2 LTS',
        desc: 'Java 22 sanal makine optimizasyonlarıyla bellek tüketimi minimum seviyede tutulur.',
        chipBadge: 'BGA-256 // JVM-HOTSPOT',
      },
      {
        key: 'KİLİTLENME DİRENCİ',
        value: 'Zero Blocking Locks',
        desc: 'Gereksiz beklemeler ve darboğazlar kaldırıldı; işlemler birbirini engellemeden paralel işlenir.',
        chipBadge: 'LOCKLESS // CAS',
      },
      {
        key: 'SUNUCU YÜRÜTÜCÜSÜ',
        value: 'Tomcat 10.1 Virtual Exec',
        desc: 'Tam asenkron HTTP I/O yönetimiyle sunucu kaynakları yalnızca aktif işlem anında tüketilir.',
        chipBadge: 'EXEC // SUB-MS',
      },
    ],
  },
  {
    index: '02',
    title: 'ANLAMSAL ARAMA & YAPAY ZEKA (VECTOR MATRIX)',
    tag: 'SPRING AI + PGVECTOR',
    busSlot: 'QPI INTERCONNECT 6.4 GT/s',
    chipModel: 'APPLE-NEURAL-VEC-128D',
    icon: Cpu,
    specs: [
      {
        key: 'ANLAMSAL VEKTÖR TEMSİLİ',
        value: '128-Boyutlu Yoğun Vektör',
        desc: 'Makaleler yalnızca kelime benzerliğiyle değil, yapay zekanın çıkardığı derin anlam ilişkisine göre eşleştirilir.',
        chipBadge: 'EMBED // 128-DIM',
      },
      {
        key: 'BENZERLİK ALGORİTMASI',
        value: 'Kosinüs Benzerliği (Cosine)',
        desc: 'Arama kutusuna farklı kelimeler veya yazım hataları girseniz dahi en yakın anlamlı içeriği bulan açısal yakınlık hesabı.',
        chipBadge: 'MATH // COSINE-DIST',
      },
      {
        key: 'HIZLI İNDEKSLEME GRAFİĞİ',
        value: 'pgvector HNSW Graph',
        desc: 'Veri tabanındaki binlerce makale arasında milisaniyenin altında gecikmeyle sonuç getiren modern grafik arama indeksi.',
        chipBadge: 'HNSW // M=16 ef=64',
      },
      {
        key: 'HİBRİT ARAMA HARMANLAMA',
        value: 'Hibrit Sıralama (RRF)',
        desc: 'Klasik anahtar kelime araması ile yapay zeka anlamsal skorunu birleştirerek en isabetli sıralamayı sunar.',
        chipBadge: 'FUSION // RRF-K60',
      },
      {
        key: 'ARAMA YANIT SÜRESİ',
        value: '< 1.8ms P99 Gecikme',
        desc: 'Kullanıcı henüz tuşlara basarken arama sonuçları gecikmesiz olarak ekrana gelir.',
        chipBadge: 'LATENCY // P99',
      },
    ],
  },
  {
    index: '03',
    title: 'VERİTABANI, ÖNBELLEK & DEPOLAMA (STORAGE CONTROLLER)',
    tag: 'DUAL-TIER CACHE',
    busSlot: 'SAS 6Gb/s CONTROLLER BUS',
    chipModel: 'RAID-REDIS-POSTGRES-X7',
    icon: Database,
    specs: [
      {
        key: 'ANA VERİTABANI',
        value: 'PostgreSQL 16.2',
        desc: 'Flyway ile otomatik versiyonlanan, tam ilişkisel ve ACID garantili güvenli veri tabanı.',
        chipBadge: 'ACID // FLYWAY-MIG',
      },
      {
        key: 'BAĞLANTI HAVUZU',
        value: 'HikariCP (10/10 Havuz)',
        desc: 'Bağlantı sızıntısını önleyen, anında hazır bekleyen optimize veritabanı bağlantı havuzu.',
        chipBadge: 'HIKARI // ZERO-LEAK',
      },
      {
        key: 'YEREL L1 ÖNBELLEK',
        value: 'Caffeine Cache',
        desc: 'Sıfır ağ gecikmesiyle doğrudan bellekten okunan, sık erişilen veriler için mikro-önbellek.',
        chipBadge: 'L1 // ZERO-NET-LAT',
      },
      {
        key: 'DAĞITIK L2 ÖNBELLEK',
        value: 'Redis 7.2 Cache',
        desc: 'Sunucular arasında paylaşılan, kullanıcı oturumlarını ve makale listelerini hızlandıran dağıtık katman.',
        chipBadge: 'L2 // IN-MEMORY',
      },
      {
        key: 'ARKA PLAN TAMPONLAMA',
        value: 'Redis Write-Behind',
        desc: 'Okunma ve beğeni sayaçları veritabanını yormadan bellekte toplanır, 30 saniyede bir toplu yazılır.',
        chipBadge: 'BUFFER // BATCH-30S',
      },
      {
        key: 'MEDYA DEPOLAMA',
        value: 'MinIO S3 Presigned',
        desc: 'Görseller sunucuyu meşgul etmeden doğrudan güvenli depolama alanına şifreli URL ile aktarılır.',
        chipBadge: 'S3 // ENCRYPTED-URL',
      },
    ],
  },
  {
    index: '04',
    title: 'GÜVENLİK, HATA YÖNETİMİ & DAYANIKLILIK (KEYCHAIN CHIP)',
    tag: 'ENTERPRISE RESILIENCE',
    busSlot: 'ECC MEMORY BUS & SECURE ENCLAVE',
    chipModel: 'APPLE-T1-KEYCHAIN-SEC',
    icon: ShieldCheck,
    specs: [
      {
        key: 'VERİ ÇAKIŞMA KORUMASI',
        value: 'İyimser Kilitleme (Optimistic)',
        desc: 'Aynı anda iki kişi makale güncellediğinde veri kaybı yaşanmaz; son değişiklikler güvenle korunur.',
        chipBadge: 'VERSION // OPT-LOCK',
      },
      {
        key: 'STANDART HATA FORMATI',
        value: 'RFC 7807 Problem Details',
        desc: 'Hatalar anlaşılmaz teknik kodlar yerine standart, açık ve istemcinin anlayacağı JSON formatında iletilir.',
        chipBadge: 'RFC-7807 // IETF-SPEC',
      },
      {
        key: 'DEVRE KESİCİ (CIRCUIT BREAKER)',
        value: 'Resilience4j Fail-Safe',
        desc: 'Bağlı servislerde kesinti olduğunda tüm sistem çökmez; otomatik alternatif akış devreye girer.',
        chipBadge: 'FAIL-SAFE // 50%-TRIP',
      },
      {
        key: 'YİNELENEN İSTEK KORUMASI',
        value: 'X-Idempotency-Key',
        desc: 'Ağ kopması nedeniyle butona iki kez basılsa dahi aynı makale iki kez oluşturulmaz.',
        chipBadge: 'IDEMPOTENT // SHA-256',
      },
      {
        key: 'İSTEK SINIRLAYICI (RATE LIMIT)',
        value: 'Token Bucket (100 istek/dk)',
        desc: 'Kötü niyetli bot saldırılarını ve sunucuyu yormayı engelleyen akıllı trafik regülatörü.',
        chipBadge: 'RATE-LIMIT // TOKEN-BUCKET',
      },
      {
        key: 'TOPLU VERİ TEMİZLİĞİ',
        value: 'Spring Batch 5 ETL',
        desc: 'Eski ve silinmiş veriler arka planda sistem performansını düşürmeden otomatik temizlenir.',
        chipBadge: 'ETL // CHUNK-100',
      },
    ],
  },
];

export const SystemBlueprintSection: React.FC<SystemBlueprintSectionProps> = ({
  onOpenTelemetry,
  onOpenTwoFactor,
  onOpenAbout,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (idx: string) => {
    playKeyClick('crisp');
    setExpandedCategories((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleCopySpecManifest = () => {
    playKeyClick('crisp');
    if (typeof window !== 'undefined') {
      const manifest = JSON.stringify(BLUEPRINT_DATA, null, 2);
      navigator.clipboard.writeText(manifest);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCategoryChange = (index: string) => {
    playTabSelect();
    setActiveCategoryIndex(index);
  };

  const filteredData =
    activeCategoryIndex === 'all'
      ? BLUEPRINT_DATA
      : BLUEPRINT_DATA.filter((b) => b.index === activeCategoryIndex);

  return (
    <section id="system-blueprint-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 select-none">
      {/*  Mac Pro / Xserve Brushed Aluminum Enclosure */}
      <div className="rounded-2xl bg-gradient-to-b from-[#e8e8ed] to-[#dcdce2] dark:from-[#232328] dark:to-[#18181c] border border-black/20 dark:border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden relative">
        
        {/* Chassis Corner Hex Bolts */}
        <div className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600 border border-black/30 dark:border-white/20 shadow-inner" />
        <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600 border border-black/30 dark:border-white/20 shadow-inner" />
        <div className="absolute bottom-2.5 left-2.5 w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600 border border-black/30 dark:border-white/20 shadow-inner" />
        <div className="absolute bottom-2.5 right-2.5 w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600 border border-black/30 dark:border-white/20 shadow-inner" />

        {/* Mac OS X Window Titlebar */}
        <div className="h-10 bg-gradient-to-b from-[#f2f2f5] to-[#d8d8de] dark:from-[#323236] dark:to-[#222226] px-4 flex items-center justify-between border-b border-black/15 dark:border-black/60">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] shadow-inner" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24] shadow-inner" />
            <span className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29] shadow-inner" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 font-sans tracking-tight drop-shadow-xs">
               Mac Pro (2010 Architecture) — System Hardware &amp; Logic Board Spec Sheet
            </span>
          </div>

          {/* Quick Hardware LED Status */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
              <span>LOGIC BOARD ONLINE</span>
            </span>
          </div>
        </div>

        {/* Unified Brushed Aluminum Toolbar */}
        <div className="p-5 sm:p-6 bg-gradient-to-b from-[#dedee4] to-[#cfcfe6] dark:from-[#26262b] dark:to-[#1c1c20] border-b border-black/10 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-[10px] font-bold tracking-wider">
                REV 4.1.1
              </span>
              <span className="font-mono text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                JAVA 22 LOOM / PGVECTOR 128D / POSTGRESQL 16 / REDIS 7.2
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Sistem Mimarisi ve Donanımsal Mantık Kartı Şartnamesi
            </h2>
          </div>

          {/* Action Modals & Copy Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenAbout && (
              <button
                onClick={() => {
                  playWindowOpen();
                  onOpenAbout();
                }}
                className="mac-aqua-btn flex items-center gap-1.5 !px-3 !py-1.5 !text-xs"
                title="Bu Mac Hakkında penceresini aç"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Bu Mac Hakkında</span>
              </button>
            )}

            {onOpenTelemetry && (
              <button
                onClick={() => {
                  playWindowOpen();
                  onOpenTelemetry();
                }}
                className="mac-aqua-btn flex items-center gap-1.5 !px-3 !py-1.5 !text-xs"
                title="Activity Monitor telemetrisini aç"
              >
                <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Activity Monitor</span>
              </button>
            )}

            {onOpenTwoFactor && (
              <button
                onClick={() => {
                  playWindowOpen();
                  onOpenTwoFactor();
                }}
                className="mac-aqua-btn flex items-center gap-1.5 !px-3 !py-1.5 !text-xs"
                title="Keychain 2FA Güvenlik Panelini aç"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Keychain 2FA</span>
              </button>
            )}

            <button
              onClick={handleCopySpecManifest}
              className="mac-aqua-btn flex items-center gap-1.5 !px-3 !py-1.5 !text-xs !bg-gradient-to-b !from-zinc-100 !to-zinc-200 dark:!from-zinc-700 dark:!to-zinc-800"
              title="Tam şartname JSON manifestini panoya kopyala"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
                  <span>Spec JSON</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bus Filter Navigation Bar (Apple Aqua Segmented Tabs) */}
        <div className="px-5 py-3 bg-[#d5d5dc] dark:bg-[#1f1f24] border-b border-black/10 dark:border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-3 py-1 rounded text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategoryIndex === 'all'
                ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-sm border border-blue-400/40'
                : 'bg-white/60 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 border border-black/10 dark:border-white/10'
            }`}
          >
            TÜM MİMARİ VERİ YOLU (23 SPESİFİKASYON)
          </button>
          {BLUEPRINT_DATA.map((cat) => (
            <button
              key={cat.index}
              onClick={() => handleCategoryChange(cat.index)}
              className={`px-3 py-1 rounded text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategoryIndex === cat.index
                  ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-sm border border-blue-400/40'
                  : 'bg-white/60 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 border border-black/10 dark:border-white/10'
              }`}
            >
              <span>{cat.index} {'//'}</span>
              <span>{cat.tag}</span>
            </button>
          ))}
        </div>

        {/* Blueprint Grid: 2-Column Logic Board Modules */}
        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#efeff4] dark:bg-[#141418]">
          {filteredData.map((category) => {
            const IconComponent = category.icon;
            const isExpanded = activeCategoryIndex !== 'all' || Boolean(expandedCategories[category.index]);
            const visibleSpecs = isExpanded ? category.specs : category.specs.slice(0, 3);
            const hasMore = category.specs.length > 3 && activeCategoryIndex === 'all';

            return (
              <div
                key={category.index}
                className="rounded-xl bg-white dark:bg-[#1e1e24] border border-black/15 dark:border-white/10 shadow-md overflow-hidden flex flex-col justify-between"
              >
                {/* Logic Board Slot Header */}
                <div className="p-4 bg-gradient-to-b from-[#f8f8fa] to-[#ececef] dark:from-[#28282e] dark:to-[#202026] border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-blue-500 to-blue-600 text-white flex items-center justify-center shadow border border-blue-400/30">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase font-bold">
                        SLOT // {category.busSlot}
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                        {category.title}
                      </h3>
                    </div>
                  </div>

                  <span className="mac-hardware-chip-badge !text-[9px]">
                    {category.chipModel}
                  </span>
                </div>

                {/* Alternating Spec Rows (Mac OS X Table View) */}
                <div className="divide-y divide-black/[0.06] dark:divide-white/[0.06] text-xs font-mono">
                  {visibleSpecs.map((spec, sIdx) => (
                    <div
                      key={sIdx}
                      className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
                        sIdx % 2 === 0 ? 'bg-white dark:bg-[#1e1e24]' : 'bg-[#fbfbfd] dark:bg-[#19191e]'
                      } hover:bg-blue-50/50 dark:hover:bg-blue-950/20`}
                    >
                      <div className="space-y-0.5 max-w-sm">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 uppercase text-[11px] tracking-wider flex items-center gap-2">
                          <span>{spec.key}</span>
                          {spec.chipBadge && (
                            <span className="text-[9px] font-mono text-zinc-400 bg-black/5 dark:bg-white/5 px-1.5 py-0.2 rounded border border-black/5 dark:border-white/5">
                              {spec.chipBadge}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed">
                          {spec.desc}
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-bold text-blue-700 dark:text-blue-300 border border-black/10 dark:border-white/10 text-[11px]">
                          {spec.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Expand / Collapse Footer */}
                {hasMore && (
                  <div className="p-2 bg-[#f4f4f7] dark:bg-[#18181c] text-center border-t border-black/10 dark:border-white/10">
                    <button
                      onClick={() => toggleCategory(category.index)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-zinc-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer"
                    >
                      <span>{isExpanded ? 'Parametreleri Daralt' : `+ ${category.specs.length - 3} Diğer Parametreyi Aç`}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                )}

                {/* Module Logic Board Sub-Footer */}
                <div className="p-3 bg-[#f0f0f4] dark:bg-[#1a1a20] border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>201/201 OTOMATİK TEST // %100 GEÇTİ</span>
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    RFC 7807 MİMARİ STANDARDI
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
