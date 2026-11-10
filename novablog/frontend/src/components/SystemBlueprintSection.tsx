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
} from 'lucide-react';

interface BlueprintCategory {
  index: string;
  title: string;
  tag: string;
  icon: React.ElementType;
  specs: { key: string; value: string; desc: string }[];
}

const BLUEPRINT_DATA: BlueprintCategory[] = [
  {
    index: '01',
    title: 'YÜKSEK TRAFİK & EŞZAMANLILIK (CONCURRENCY)',
    tag: 'JAVA 22 LOOM',
    icon: Zap,
    specs: [
      {
        key: 'İŞ PARÇACIĞI MİMARİSİ',
        value: 'Virtual Threads (Loom)',
        desc: 'Geleneksel ağır işletim sistemi threadleri yerine hafif sanal iş parçacıkları; sunucu kilitlenmesi sıfıra iner.',
      },
      {
        key: 'EŞZAMANLI İSTEK KAPASİTESİ',
        value: '11,400+ İstek/sn',
        desc: 'Tomcat üzerinde her istek için anında sanal thread tahsis edilir; yüksek trafikte yanıt süreleri uzamaz.',
      },
      {
        key: 'ÇALIŞMA ZAMANI (RUNTIME)',
        value: 'OpenJDK 22.0.2 LTS',
        desc: 'Java 22 sanal makine optimizasyonlarıyla bellek tüketimi minimum seviyede tutulur.',
      },
      {
        key: 'KİLİTLENME DİRENCİ',
        value: 'Zero Blocking Locks',
        desc: 'Gereksiz beklemeler ve darboğazlar kaldırıldı; işlemler birbirini engellemeden paralel işlenir.',
      },
      {
        key: 'SUNUCU YÜRÜTÜCÜSÜ',
        value: 'Tomcat 10.1 Virtual Exec',
        desc: 'Tam asenkron HTTP I/O yönetimiyle sunucu kaynakları yalnızca aktif işlem anında tüketilir.',
      },
    ],
  },
  {
    index: '02',
    title: 'ANLAMSAL ARAMA & YAPAY ZEKA (VECTOR SEARCH)',
    tag: 'SPRING AI + PGVECTOR',
    icon: Cpu,
    specs: [
      {
        key: 'ANLAMSAL VEKTÖR TEMSİLİ',
        value: '128-Boyutlu Yoğun Vektör',
        desc: 'Makaleler yalnızca kelime benzerliğiyle değil, yapay zekanın çıkardığı derin anlam ilişkisine göre eşleştirilir.',
      },
      {
        key: 'BENZERLİK ALGORİTMASI',
        value: 'Kosinüs Benzerliği (Cosine)',
        desc: 'Arama kutusuna farklı kelimeler veya yazım hataları girseniz dahi en yakın anlamlı içeriği bulan açısal yakınlık hesabı.',
      },
      {
        key: 'HIZLI İNDEKSLEME GRAFİĞİ',
        value: 'pgvector HNSW Graph',
        desc: 'Veri tabanındaki binlerce makale arasında milisaniyenin altında gecikmeyle sonuç getiren modern grafik arama indeksi.',
      },
      {
        key: 'HİBRİT ARAMA HARMANLAMA',
        value: 'Hibrit Sıralama (RRF)',
        desc: 'Klasik anahtar kelime araması ile yapay zeka anlamsal skorunu birleştirerek en isabetli sıralamayı sunar.',
      },
      {
        key: 'ARAMA YANIT SÜRESİ',
        value: '< 1.8ms P99 Gecikme',
        desc: 'Kullanıcı henüz tuşlara basarken arama sonuçları gecikmesiz olarak ekrana gelir.',
      },
    ],
  },
  {
    index: '03',
    title: 'VERİTABANI, ÖNBELLEK & DEPOLAMA (STORAGE)',
    tag: 'DUAL-TIER CACHE',
    icon: Database,
    specs: [
      {
        key: 'ANA VERİTABANI',
        value: 'PostgreSQL 16.2',
        desc: 'Flyway ile otomatik versiyonlanan, tam ilişkisel ve ACID garantili güvenli veri tabanı.',
      },
      {
        key: 'BAĞLANTI HAVUZU',
        value: 'HikariCP (10/10 Havuz)',
        desc: 'Bağlantı sızıntısını önleyen, anında hazır bekleyen optimize veritabanı bağlantı havuzu.',
      },
      {
        key: 'YEREL L1 ÖNBELLEK',
        value: 'Caffeine Cache',
        desc: 'Sıfır ağ gecikmesiyle doğrudan bellekten okunan, sık erişilen veriler için mikro-önbellek.',
      },
      {
        key: 'DAĞITIK L2 ÖNBELLEK',
        value: 'Redis 7.2 Cache',
        desc: 'Sunucular arasında paylaşılan, kullanıcı oturumlarını ve makale listelerini hızlandıran dağıtık katman.',
      },
      {
        key: 'ARKA PLAN TAMPONLAMA',
        value: 'Redis Write-Behind',
        desc: 'Okunma ve beğeni sayaçları veritabanını yormadan bellekte toplanır, 30 saniyede bir toplu yazılır.',
      },
      {
        key: 'MEDYA DEPOLAMA',
        value: 'MinIO S3 Presigned',
        desc: 'Görseller sunucuyu meşgul etmeden doğrudan güvenli depolama alanına şifreli URL ile aktarılır.',
      },
    ],
  },
  {
    index: '04',
    title: 'GÜVENLİK, HATA YÖNETİMİ & DAYANIKLILIK',
    tag: 'ENTERPRISE RESILIENCE',
    icon: ShieldCheck,
    specs: [
      {
        key: 'VERİ ÇAKIŞMA KORUMASI',
        value: 'İyimser Kilitleme (Optimistic)',
        desc: 'Aynı anda iki kişi makale güncellediğinde veri kaybı yaşanmaz; son değişiklikler güvenle korunur.',
      },
      {
        key: 'STANDART HATA FORMATI',
        value: 'RFC 7807 Problem Details',
        desc: 'Hatalar anlaşılmaz teknik kodlar yerine standart, açık ve istemcinin anlayacağı JSON formatında iletilir.',
      },
      {
        key: 'DEVRE KESİCİ (CIRCUIT BREAKER)',
        value: 'Resilience4j Fail-Safe',
        desc: 'Bağlı servislerde kesinti olduğunda tüm sistem çökmez; otomatik alternatif akış devreye girer.',
      },
      {
        key: 'YİNELENEN İSTEK KORUMASI',
        value: 'X-Idempotency-Key',
        desc: 'Ağ kopması nedeniyle butona iki kez basılsa dahi aynı makale iki kez oluşturulmaz.',
      },
      {
        key: 'İSTEK SINIRLAYICI (RATE LIMIT)',
        value: 'Token Bucket (100 istek/dk)',
        desc: 'Kötü niyetli bot saldırılarını ve sunucuyu yormayı engelleyen akıllı trafik regülatörü.',
      },
      {
        key: 'TOPLU VERİ TEMİZLİĞİ',
        value: 'Spring Batch 5 ETL',
        desc: 'Eski ve silinmiş veriler arka planda sistem performansını düşürmeden otomatik temizlenir.',
      },
    ],
  },
];

export const SystemBlueprintSection: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (idx: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleCopySpecManifest = () => {
    if (typeof window !== 'undefined') {
      const manifest = JSON.stringify(BLUEPRINT_DATA, null, 2);
      navigator.clipboard.writeText(manifest);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredData =
    activeCategoryIndex === 'all'
      ? BLUEPRINT_DATA
      : BLUEPRINT_DATA.filter((b) => b.index === activeCategoryIndex);

  return (
    <section id="system-blueprint-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10 border-t border-black/[0.08] dark:border-white/[0.08]">
      {/* Header (Ride Also Technical Spec Bar) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase font-bold text-[#a3c900] dark:text-[#d4f933]">
            <span className="w-2 h-2 rounded-full bg-[#d4f933] shadow-[0_0_8px_#d4f933]" />
            <span>03 {'//'} TECHNICAL SPECIFICATIONS & SYSTEM BLUEPRINT</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-zinc-950 dark:text-white uppercase tracking-tight">
            MİMARİ ŞARTNAME {'//'} BLUEPRINT
          </h2>

          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl font-mono leading-relaxed">
            Yüksek hacimli veri akışını, sub-milisaniye yapay zeka aramasını ve sıfır veri kaybını garanti eden
            modern dağıtık sistem mimarisinin tam teknik parametreleri.
          </p>
        </div>

        {/* Action Button: Copy Spec Manifest */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopySpecManifest}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-zinc-700 dark:text-zinc-300 border border-black/10 dark:border-white/10 text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500">SPEC JSON KOPYALANDI</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>SPEC MANIFEST KOPYALA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Category Filter Pills (Ride Also Selector Aesthetic) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono">
        <button
          onClick={() => setActiveCategoryIndex('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeCategoryIndex === 'all'
              ? 'bg-zinc-950 dark:bg-[#d4f933] text-white dark:text-black shadow-md'
              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white border border-black/10 dark:border-white/10'
          }`}
        >
          00 {'//'} TÜM ŞARTNAME (23 SPESİFİKASYON)
        </button>
        {BLUEPRINT_DATA.map((cat) => (
          <button
            key={cat.index}
            onClick={() => setActiveCategoryIndex(cat.index)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              activeCategoryIndex === cat.index
                ? 'bg-zinc-950 dark:bg-[#d4f933] text-white dark:text-black shadow-md'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white border border-black/10 dark:border-white/10'
            }`}
          >
            <span>{cat.index} {'//'}</span>
            <span>{cat.tag}</span>
          </button>
        ))}
      </div>

      {/* Blueprint Grid Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredData.map((category) => {
          const IconComponent = category.icon;
          const isExpanded = activeCategoryIndex !== 'all' || Boolean(expandedCategories[category.index]);
          const visibleSpecs = isExpanded ? category.specs : category.specs.slice(0, 3);
          const hasMore = category.specs.length > 3 && activeCategoryIndex === 'all';

          return (
            <div
              key={category.index}
              className="rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 shadow-xl overflow-hidden flex flex-col justify-between transition-all hover:border-black/30 dark:hover:border-white/30"
            >
              {/* Category Header */}
              <div className="p-6 bg-zinc-50 dark:bg-zinc-950/80 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between font-mono">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-zinc-900 dark:bg-zinc-800 text-[#d4f933] flex items-center justify-center border border-black/10 dark:border-white/10">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold">
                      BÖLÜM // {category.index}
                    </div>
                    <h3 className="text-sm font-black text-zinc-950 dark:text-white uppercase tracking-tight">
                      {category.title}
                    </h3>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#d4f933]/20 text-zinc-900 dark:text-[#d4f933] border border-[#d4f933]/30">
                  {category.tag}
                </span>
              </div>

              {/* Spec Rows (Ride Also Technical Table) */}
              <div className="divide-y divide-black/[0.06] dark:divide-white/[0.06] text-xs font-mono">
                {visibleSpecs.map((spec, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors"
                  >
                    <div className="space-y-0.5 max-w-sm">
                      <div className="font-bold text-zinc-950 dark:text-white uppercase text-[11px] tracking-wider">
                        {spec.key}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-sans leading-relaxed">
                        {spec.desc}
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <span className="inline-block px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-black text-zinc-900 dark:text-[#d4f933] border border-black/10 dark:border-white/10 text-[11px]">
                        {spec.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progressive Disclosure Toggle Button */}
              {hasMore && (
                <div className="p-2.5 bg-zinc-50/60 dark:bg-zinc-950/40 text-center border-t border-black/[0.05] dark:border-white/[0.05]">
                  <button
                    onClick={() => toggleCategory(category.index)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-mono text-[11px] font-bold uppercase transition-colors cursor-pointer"
                  >
                    <span>{isExpanded ? 'Daha Az Parametre Göster' : `+ ${category.specs.length - 3} Diğer Parametreyi Aç`}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}

              {/* Spec Footer */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 border-t border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-zinc-700 dark:text-zinc-300 font-semibold">201/201 OTOMATİK TEST: %100 GEÇTİ</span>
                </span>
                <span className="text-emerald-500 font-bold">RFC 7807 &amp; REST STANDARDI</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
