# PUX-5 Yerel Kapanış Raporu

**Proje:** Umut Usta Randevu Uygulaması  
**Sprint:** PUX-5 - Fotoğraf sanat yönetimi ve medya sistemi  
**Tarih:** 19 Temmuz 2026  
**Durum:** Teknik uygulama tamamlandı; gerçek fotoğraf kabul kapısı dış bağımlılık olarak açık  
**Dağıtım:** Git commit/push, canlı yayın ve uzak Supabase değişikliği yapılmadı

## 1. Amaç ve sonuç

PUX-5, müşteri sayfasındaki görselleri yalnız dekoratif dosyalar olmaktan çıkarıp ölçülebilir bir medya sistemine bağladı. Yerel görseller artık AVIF, WebP ve JPEG responsive varyantlara; tutarlı alt metin üretimine; sabit boyut/aspect-ratio desteğine; lazy/eager yükleme kurallarına ve otomatik teknik bütünlük denetimine sahiptir.

Sprint ayrıca mevcut kaynakların gerçek iş kanıtı niteliğini ayrı değerlendirdi. `22` kaynağın hiçbirinde EXIF/provenans verisi bulunmadığı, önce/sonra çiftlerinin çoğunun aynı açı ve bağlamı taşımadığı görüldü. Bu nedenle mevcut görsellerin gerçek Umut Usta işi olduğu varsayılmadı. Teknik sistem tamamlandı; gerçek çekim ve kullanım izni doğrulaması yayın öncesi açık kapı olarak tutuldu.

## 2. Tamamlanan işler

### 2.1 Asset audit

- `22` kaynak görsel çözünürlük, kadraj, güvenlik görünümü, provenans ve önce/sonra eşleşmesi açısından incelendi.
- `0/22` kaynakta EXIF/provenans verisi bulundu.
- `landscaping.png` ve `landscaping_after.png` dosyalarının birebir aynı olduğu otomatik hash kontrolüyle tespit edildi.
- Yedi önce/sonra grubu aynı nesne, açı ve bağlam kriteriyle değerlendirildi; uyumsuz çiftler değiştirilmesi gereken kanıt olarak sınıflandırıldı.
- Ayrıntılı kararlar [PUX-5 Medya Envanteri ve Çekim Standardı](./PUX_5_Medya_Envanteri_ve_Cekim_Standardi_2026-07-19.md) belgesinde kayıt altındadır.

### 2.2 Üç formatlı responsive pipeline

- Her yerel kaynak için `320`, `640` ve `1024 px` AVIF, WebP ve JPEG üretimi eklendi.
- LCP hero için ayrıca `400 px` varyant korunuyor.
- Modern tarayıcılar AVIF/WebP, desteklemeyen istemciler responsive JPEG srcset kullanır.
- Pipeline her çalışmada output klasörünü temizleyerek stale asset oluşmasını önler.
- `npm run images:audit` komutu eksik format/genişlik varyantlarını, boyut sorunlarını, EXIF durumunu ve yinelenen kaynakları denetler.

### 2.3 Medya bileşenleri

- `ProgressiveImage`, `<source media>` ile mobil/masaüstü art direction destekler.
- Kaynak bazlı `sizes` ve sabit `aspectRatio` desteği eklendi.
- `<picture>` kaynak anahtarı format ve media birleşimiyle çakışmasız hale getirildi.
- Yerel img fallback'i PNG/WebP yerine gerçek JPEG olarak tanımlandı.
- Müşteri sayfası guardrail'i ham yerel PNG indirilmediğini doğrular.

### 2.4 Alt metin ve metadata sözleşmesi

- `getGalleryImageAlt` merkezi yardımcı fonksiyonu eklendi.
- Önce ve tamamlanan uygulama aşamaları ayrı tarif edilir.
- `image_alt`, `before_image_alt`, `after_image_alt` gibi editoryal alanlar varsa öncelik kazanır.
- Metadata yoksa başlık, aşama, kategori ve konumdan açıklayıcı fallback üretilir.
- Customer booking önizlemesi, galeri grid'i, önce/sonra kartı ve vaka dialog'u aynı sözleşmeyi kullanır.
- Hero alt metni, doğrulanmamış kimlik/atölye iddiası yerine görüntüde gerçekten görünen işi tarif eder.

### 2.5 İlk ekran performansı

- Alt sayfa içeriği ve uzak Supabase verisi hero çiziminden `800 ms` sonra progressive olarak devreye girer.
- Randevu wizard'ı ve hero ilk anda eksiksizdir.
- `react-hot-toast` müşteri rotasının ana paketinden çıkarıldı; yalnız admin ve kimlik doğrulama rotalarında dinamik yüklenir.
- Ana bundle gzip boyutu yaklaşık `89.5 KB`dan `85.3 KB`a indi.
- Wizard'ın 2. ve 3. adımında mobil sticky CTA koşulsuz kapatılarak uzun form üzerinde yeniden belirme riski giderildi.

## 3. Kabul kriterleri

| Kriter | Sonuç | Açıklama |
|---|---|---|
| Hero mobil ve masaüstünde işi açık gösterir | Koşullu | Mevcut kırpım teknik olarak stabil; özgün yatay ve 4:5 gerçek çekim bekleniyor |
| Stock veya yapay kaynak kullanılmaz | Açık dış bağımlılık | Mevcut kaynak provenansı doğrulanamadı; gerçek iş kanıtı olarak onaylanmadı |
| Görsel yatay taşma veya CLS üretmez | Geçti | Responsive E2E ve CLS `0.0095` |
| LCP baseline'dan kötüleşmez | Geçti | Medyan yaklaşık `3.07 sn`; önceki `3.06 sn` baseline ile eşdeğer |
| Önce/sonra aynı açı ve bağlam | Mevcut assetlerde geçmedi | Uyumsuz çiftler envanterde değiştirilmek üzere işaretlendi |
| AVIF/WebP/JPEG fallback | Geçti | 201 optimize varyant ve PUX-5 E2E guardrail |
| Alt metin/metadata standardı | Geçti | Merkezi helper ve üç unit testi |
| Galeri lazy-load, hero eager/preload | Geçti | DOM ve network E2E kontrolü |

PUX planının dış bağımlılık notuna uygun olarak gerçek çekim eksikliği UI sprintlerini bloke etmez. Ancak gerçek fotoğraf kabul kapısı tamamlanmadan PUX-5'in içerik/provenans kısmı production-ready sayılmaz.

## 4. Güncel medya bütçesi

| Ölçüm | Sonuç |
|---|---:|
| Kaynak PNG | 22 |
| Optimize varyant | 201 |
| Format | AVIF, WebP, JPEG |
| Optimize arşiv | 14.78 MB |
| Kritik müşteri görselleri | 194.8 KB |
| En büyük tek varyant | 291.2 KB |
| Lighthouse transfer | Yaklaşık 479 KB |

Arşiv toplamı üç tam format ailesini içerir. Tarayıcı her gösterilen görsel için bu ailelerden yalnız uygun tek adayı indirir.

## 5. Lighthouse kalite kapısı

Üç koşuluk mobil Lighthouse sonucu:

| Ölçüm | Koşular | Medyan/hedef |
|---|---:|---:|
| Performans | `0.91 / 0.93 / 0.92` | `0.92`, hedef en az `0.90` |
| Erişilebilirlik | `1.00 / 1.00 / 1.00` | `1.00`, hedef en az `0.98` |
| LCP | `3.07 / 3.09 / 3.02 sn` | `3.07 sn`, hedef en fazla `3.50 sn` |
| TBT | `158 / 52 / 107 ms` | `107 ms` |
| CLS | `0.0095` | Hedef en fazla `0.10` |

## 6. Kalite kapıları

| Kontrol | Sonuç |
|---|---|
| `npm run lint` | Başarılı, 0 uyarı |
| `npm run test:run` | 24 dosya, `92/92` test başarılı |
| `npm run test:e2e` | `28/28` başarılı |
| PUX-5 medya E2E | Optimize format, JPEG fallback, boyut, lazy-load ve alt metin geçti |
| `npm run build` | Başarılı, 805 modül işlendi |
| `npm run images:audit` | Teknik bütünlük geçti; provenans ve duplicate uyarıları kaydedildi |
| `npm run perf:budget` | Başarılı; 201 dosya, 14.78 MB |
| `npm run perf:lighthouse` | Üç koşuluk assertion paketi başarılı |
| `git diff --check` | Whitespace hatası yok; yalnız Windows satır sonu uyarıları |

## 7. Gerçek fotoğraf kabul kapısı

Production öncesinde aşağıdakiler tamamlanmalıdır:

1. Hero için gerçek yatay ve bağımsız `4:5` çekim sağlanmalı.
2. Kullanılacak her görselin kaynak sahibi ve kullanım izni kaydedilmeli.
3. Uyumsuz önce/sonra çiftleri aynı açıdan çekilmiş gerçek çiftlerle değiştirilmeli.
4. `problem`, `solution`, `result`, `image_alt` ve `before_image_alt` metadata'sı doldurulmalı.
5. Kişisel bilgi, yüz, plaka ve adres görünümü kontrol edilmeli.
6. Yeni dosyalar optimize/audit/performance/Lighthouse kapılarından geçirilmelidir.

## 8. PUX-6 geçiş kararı

PUX-5 teknik medya sistemi PUX-6 motion, loading ve feedback çalışması için hazırdır. ProgressiveImage state'leri, skeleton yüzeyi, reduced-motion davranışı ve deferred alt içerik PUX-6'nın kullanacağı stabil temeli sağlar.

Gerçek fotoğraf çekimi PUX-6'yı bloke etmez; geldiğinde mevcut pipeline üzerinden asset katmanı değiştirilecektir. Bu sprint için SQL veya Supabase migration gerekmez.

