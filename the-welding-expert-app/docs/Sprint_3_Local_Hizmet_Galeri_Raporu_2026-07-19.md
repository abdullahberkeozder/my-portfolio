# Sprint 3 Yerel Uygulama Raporu

**Tarih:** 19 Temmuz 2026  
**Kapsam:** Hizmet keşfi, fiyat mantığı, gerçek iş kanıtı ve katkı analitiği  
**Ortam:** Yalnız yerel geliştirme; canlı yayın, commit ve push yapılmadı

## 1. Sonuç özeti

Sprint 3'ün teknik kapsamı yerel ortamda büyük ölçüde tamamlandı. Müşteri giriş sayfasındaki hizmet kartları randevu seçiminden ayrıldı; dört ana hizmet ilk bakışta gösteriliyor, dört ikincil hizmet isteğe bağlı açılıyor. Galeri kategori filtresi, önce/sonra vakaları, erişilebilir vaka diyaloğu ve vaka kaynaklı randevu ölçümü kazandı.

İki PO bağımlılığı bilinçli olarak açık bırakıldı: iş sürelerinin doğrulanması ile görsellerin gerçeklik/yayın izni kontrolü. Uygulama bu alanlarda doğrulanmamış bilgi üretmiyor.

## 2. Tamamlanan kullanıcı değeri

### S3-01 - Hizmetleri güvenli karşılaştırma

- Hizmet kartları salt bilgi amaçlı `article` yapısında kaldı.
- Kart tıklaması veya odak davranışı kullanıcıyı randevu alanına taşımıyor.
- Dört ana hizmet ilk görünümde, diğer dört hizmet kontrollü açılır durumda.
- Açma düğmesi `aria-expanded` ile durumunu açıklıyor.

### S3-02 - Fiyat mantığını anlama

- Her hizmette müşteri problemi, kısa kapsam ve fiyat mantığı birlikte gösteriliyor.
- Her kartta fiyatı etkileyen üç somut etken bulunuyor.
- Fiyatların keşif ve kapsam sonrası netleştiği dil korunuyor.

### S3-03 ve S3-04 - Vaka kanıtı

- Yayındaki verilerden yedi önce/sonra vaka görüntüleniyor.
- Diyalogta ilçe, planlama durumu, fiyatlama, problem/çözüm ve uygulanan yaklaşım yer alıyor.
- Gerçek süre bulunmadığında "İş kapsamına göre teyit edilir" gösteriliyor.
- Doğrulanmamış müşteri yorumları galeri sayfasından kaldırıldı.
- Vaka içinden doğrudan "Benzer iş için randevu al" eylemi eklendi.

### S3-05 - Filtreli galeri

- Yayındaki kategoriler veriden dinamik oluşturuluyor.
- Filtreler `aria-pressed` ile seçili durumunu bildiriyor.
- Önce/sonra ve galeri alanları aynı filtreye birlikte yanıt veriyor.
- Yükleme, hata ve kategoriye özel boş durumları korunuyor.
- Diyalog ESC ile kapanıyor, klavye odağını içeride tutuyor ve kapanınca açan kontrole geri veriyor.

### S3-06 - Katkı ölçümü

Yeni olaylar:

- `service_catalog_expanded`
- `gallery_filter_selected`
- `gallery_case_viewed`
- `gallery_booking_cta_clicked`

Yönetim analitiğine katalog genişletme, vaka görüntüleme ve vakadan randevuya geçiş özetleri eklendi. Vaka bazlı grafikte aynı oturumun tekrarları tekilleştiriliyor ve en çok incelenen sekiz vaka karşılaştırılıyor.

## 3. Teknik değişiklikler

- Hizmet keşif metadatası `src/config/business.js` içinde tutuluyor.
- Müşteri hizmet yüzeyi `src/pages/CustomerBooking.jsx` ve stil dosyasında güncellendi.
- Galeri filtreleme ve olay üretimi `src/pages/Gallery.jsx` içinde uygulandı.
- Erişilebilir ayrıntı yüzeyi `src/features/gallery/GalleryCaseDialog.jsx` olarak ayrıldı.
- Katkı hesapları saf fonksiyonlar halinde `analyticsMetrics.js` içine alındı.
- Yönetim görünümü `AnalyticsDashboard.jsx` içinde genişletildi.
- Veritabanı şeması veya Supabase verisi bu çalışma sırasında değiştirilmedi.

## 4. Doğrulama

| Kontrol | Sonuç |
| --- | --- |
| ESLint | Geçti, 0 uyarı |
| Vitest | 13 dosya, 40 test geçti |
| Vite production build | Geçti |
| 1440x900 galeri | Filtre, medya ve diyalog doğrulandı |
| 390x844 müşteri sayfası | 4+4 hizmet yapısı ve içerik semantiği doğrulandı |
| Diyalog klavye davranışı | ESC, focus trap ve focus return geçti |
| Tarayıcı konsolu | Hata ve uyarı yok |

Yerel inceleme adresleri:

- `http://127.0.0.1:5291/appointment`
- `http://127.0.0.1:5291/gallery`

## 5. Açık PO kararları

1. Her vakanın görselinin gerçek müşteri işi olduğu doğrulanmalı.
2. Görsel yayın izinleri kayıt altına alınmalı.
3. Her vaka için doğrulanmış süre veya süre aralığı sağlanmalı.
4. Başlangıç fiyatları ve kapsamları güncel ticari bilgiyle onaylanmalı.
5. İlçe bilgisinin yayınlanabilirliği vaka bazında teyit edilmeli.

Bu maddeler tamamlanmadan S3-03 ve S3-04 ürün kabulü tamamen kapatılmamalıdır.

## 6. Sonraki demo senaryoları

1. "Balkon korkuluğu kırıldı" senaryosunda müşteri ana hizmeti bulur, kaynak vakalarını filtreler, ayrıntıyı açar ve randevuya geçer.
2. "Apartman raylı kapısı takılıyor" senaryosunda müşteri ikincil hizmetleri açar, raylı kapı örneklerini filtreler ve fiyatı etkileyen başlıkları değerlendirir.
3. PO yönetim ekranında vaka görüntüleme ve vaka kaynaklı randevu tıklamalarını karşılaştırır.
