# PUX-7.5 Zaman Tercihi Takvim Odaklı Revizyon

**Tarih:** 19 Temmuz 2026  
**Ortam:** Yalnızca yerel geliştirme  
**Durum:** Uygulandı ve doğrulandı

## 1. Tespit edilen sorunlar

Canlı ekran ve responsive ölçümlerde önceki zaman seçimi şu sorunları üretiyordu:

1. Bugün, Yarın, native tarih alanı ve haftalık takvim aynı karar için birden fazla yöntem sunuyordu.
2. `Başka tarih seç` disclosure'ı takvimi ikincil göstererek asıl karar yüzeyini saklıyordu.
3. Hizmet, hızlı günler, disclosure, saatler ve CTA birbirinden kopuk dikey bloklar oluşturuyordu.
4. Masaüstünde hizmet ile `Değiştir` eylemi gereğinden fazla uzaklaşıyordu.
5. Altı saat seçeneği `5+1` dizilerek optik dengesizlik yaratıyordu.
6. Seçimsiz durumda geniş boş alan ve tek başına duran devre dışı CTA, tamamlanmamış panel algısı oluşturuyordu.

## 2. Ürün kararı

Bugün/Yarın kısayolları kaldırıldı. Native tarih alanı ve takvim disclosure'ı da aynı kararın tekrarlanan yolları olduğu için kaldırıldı. Haftalık takvim zaman adımının tek tarih seçim yüzeyi oldu.

Yeni görev sırası:

1. Hizmet bağlamını kontrol et.
2. Görünür haftalık takvimden bir gün seç.
3. Seçilen günün uygun saatlerinden birini seç.
4. İletişim adımına geç.

## 3. Uygulanan yerleşim

- `Gün seçin` başlığı, önceki/sonraki hafta kontrolleri ve yedi günlük takvim aynı yüzeyde gösteriliyor.
- Masaüstünde yedi gün aynı satırda karşılaştırılıyor.
- Mobilde günler yatay, snap destekli ve seçili güne odaklanan bir akış kullanıyor.
- Gün seçilmeden saat alanı tek kısa açıklama gösteriyor.
- Gün seçildiğinde masaüstünde seçilen gün özeti solda, saatler ve devam eylemi sağdaki görev sütununda açılıyor. Saatler dengeli `3x2`; tablet ve mobilde gün özetinin altında `2` kolon halinde gösteriliyor.
- CTA, seçilebilir saatler oluşmadan gösterilmiyor.
- Hizmet adı ve `Değiştir` eylemi yakınlaştırıldı; mobilde hizmet adı kesilmeden satıra açılıyor.

## 4. Bilişsel yük gerekçesi

Revizyon aynı karar için sunulan kontrol sayısını azaltır, seçim yöntemleri arasındaki karşılaştırma maliyetini kaldırır ve görünür sistem durumu ile gerçek görev sırasını eşler. Kullanıcı artık “kısayol mu, tarih alanı mı, tam takvim mi?” kararı vermek yerine doğrudan uygun güne odaklanır.

## 5. Doğrulama

| Kapı | Sonuç |
| --- | --- |
| Unit/component | `24` dosya, `91/91` test geçti |
| Playwright E2E | `47/47` senaryo geçti |
| Responsive | `320-1920 px` matrisi geçti |
| Takvim görünürlüğü | Masaüstü ve mobilde doğrudan görünür |
| İç taşma | Wizard ve takvim yüzeylerinde yok |
| Klavye akışı | Hizmetten talep gönderimine kadar geçti |
| Forced colors/reduced motion | Geçti |
| ESLint/build | Geçti |
| Performans bütçesi | Geçti |

Veritabanı, Supabase, admin paneli ve canlı ortam etkilenmedi. Commit, push veya deploy yapılmadı.
