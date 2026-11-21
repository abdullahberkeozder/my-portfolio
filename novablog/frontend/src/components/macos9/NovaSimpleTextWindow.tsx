'use client';

import React from 'react';

export const NovaSimpleTextWindow: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] font-mono text-[12px] text-[#1E293B] select-text">
      {/* SimpleText Toolbar */}
      <div className="bg-[#DDDDDD] border-b border-[#262626] px-3 py-1 flex items-center justify-between text-[11px] font-['Charcoal',sans-serif] select-none">
        <div className="flex items-center gap-3">
          <span className="font-bold">Dosya: ReadMe.txt</span>
          <span className="text-[#666]">Salt Okunur (Read-Only)</span>
        </div>
        <div className="text-[10px] text-[#555]">
          Boyut: 4.8 KB • Kodlama: Mac OS Roman (UTF-8)
        </div>
      </div>

      {/* Text Area */}
      <div className="flex-1 p-5 overflow-y-auto leading-relaxed space-y-4">
        <div>
          <h1 className="text-base font-bold text-black border-b border-black pb-1 mb-2 font-['Charcoal',sans-serif]">
             NOVA OS 9.2.2 (SONATA EDITION) // 2026 RELEASE NOTES
          </h1>
          <p className="text-[#475569] text-xs">
            Yayın Tarihi: 21 Kasım 2026 • Mimari: Java 22 Loom & Next.js 15
          </p>
        </div>

        <section className="space-y-1.5">
          <h2 className="font-bold text-sm text-black font-['Charcoal',sans-serif]">
            1. BİLİŞSEL ERGONOMİ & SIFIR İLK YÜK FELSEFESİ
          </h2>
          <p>
            Bu işletim sistemi web arayüzü, kullanıcının ilk açılış anında maruz kaldığı bilişsel aşırı yüklenmeyi (cognitive load) sıfırlamak üzere tasarlanmıştır. Geleneksel karmaşık feed listeleri, teknik sayı bombardımanları yerine sade bir masaüstü, dingin bir Nova amblemi ve kullanıcının isteğiyle açılan bağımsız pencereler sunulmaktadır.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-bold text-sm text-black font-['Charcoal',sans-serif]">
            2. TEMEL ÖZELLİKLER & KISAYOLLAR
          </h2>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li><strong>Blog İkonu:</strong> Çift tıklandığında tam ekran modern blog sistemini bir Mac OS 9 penceresinde açar.</li>
            <li><strong>News (Sherlock 2):</strong> Çok kanallı mühendislik haberlerini ve bültenleri listeler.</li>
            <li><strong>Wallpapers:</strong> Masaüstü desenini anında değiştiren Görünüm Masasını açar.</li>
            <li><strong>Day & Night:</strong> Çift tıklamayla Aydınlık Platin ile Gece Karbon modları arasında geçiş yapar.</li>
            <li><strong>Architecture Specs:</strong> Donanımsal veri yolu ve sunucu telemetri kartını açar.</li>
            <li><strong>Control Strip:</strong> Sol alttaki tutamaçla (`:::◀`) açılıp kapanabilen hızlı donanım çubuğudur.</li>
          </ul>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-bold text-sm text-black font-['Charcoal',sans-serif]">
            3. SES MOTORU (WEB AUDIO API)
          </h2>
          <p className="text-xs">
            Harici hiçbir ses dosyası indirilmez. C-Major Başlangıç akoru (Startup Chime), çift aşamalı fare tıklamaları, pencere açılış/kapanış süpürmeleri, WindowShade basamaklama sesleri ve çöp sepeti hışırtısı prosedürel matematiksel frekans sentezi ile üretilir.
          </p>
        </section>

        <div className="pt-4 border-t border-[#CBD5E1] text-[11px] text-[#64748B] flex justify-between">
          <span>Nova Studio © 2026. Tüm hakları saklıdır.</span>
          <span>Apple Computer, Inc. HIG 1999 saygıyla anılır.</span>
        </div>
      </div>
    </div>
  );
};
