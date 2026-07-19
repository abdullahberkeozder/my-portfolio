# PUX-6 Yerel Kapanış Raporu

**Tarih:** 19 Temmuz 2026  
**Kapsam:** Motion, loading ve geri bildirim dili  
**Ortam:** Yalnızca yerel geliştirme; commit, push, deploy ve uzak Supabase değişikliği yapılmadı.

## Sonuç

PUX-6 teknik kapsamı tamamlandı. Müşteri akışındaki hareketler `140/200/320 ms` token sistemiyle sınırlandı; sürekli dekoratif efektler kaldırıldı; adım geçişleri erişilebilir odak yönetimiyle bağlandı; yükleme ve gönderim durumlarının geometriyi değiştirmemesi güvence altına alındı.

## Uygulanan Değişiklikler

- Ana randevu wizard'ı scroll reveal kapsamından çıkarıldı; görev kontrolü sayfa açılışında animasyon nedeniyle saklanmıyor.
- Hizmet, zaman ve iletişim geçişlerinde yeni adımın `h2` başlığına programatik odak verildi.
- Adım, tamamlanma, disclosure, seçim ve buton durumları motion token'larına bağlandı; `transition: all` kullanımları ilgili özelliklerle sınırlandı.
- Skeleton shimmer ve görsel sheen döngüleri kaldırıldı. Skeleton tek seferlik kısa giriş, görsel ise en fazla `320 ms` blur-up/fade davranışı kullanıyor.
- Route fallback logo gösterisinden sade durum göstergesine dönüştürüldü.
- Takvim yüklenirken yanlışlıkla boş hafta mesajı gösterilmesi engellendi; gerçek alan ölçüsünü koruyan sakin skeleton eklendi.
- Submit butonu sabit üç kolonlu içerik düzenine geçirildi. Spinner açıldığında buton genişliği ve yüksekliği değişmiyor.
- Form hata satırları önceden alan ayırıyor; hata görünürlüğü `140 ms` opacity geçişiyle değişiyor.
- `prefers-reduced-motion: reduce` altında akışın tamamı animasyon döngüsü olmadan kullanılabiliyor.

## Kabul Kriterleri

| Kriter | Sonuç | Kanıt |
| --- | --- | --- |
| Sürekli pulse, bounce, parallax veya logo shine yok | Geçti | Skeleton, progressive image ve route fallback denetimi |
| Görev etkileşimleri en fazla 320 ms | Geçti | PUX-6 computed-style E2E guardrail |
| Reduced motion altında tam akış | Geçti | Hizmet -> zaman -> iletişim E2E senaryosu |
| Yeni adım başlığına kontrollü odak | Geçti | `booking-service/time/contact-title` odak testi |
| Loading/submit geometri değişimi yok | Geçti | Submit butonu width/height E2E karşılaştırması |
| Ana görev scroll reveal ile saklanmıyor | Geçti | Wizard `data-reveal` guardrail'i |

## Kalite Kapıları

- `npm run lint`: geçti.
- `npm run test:run`: 24 dosya, 92/92 test geçti.
- `npm run test:e2e`: 30/30 test geçti.
- `npm run build`: geçti; 805 modül üretildi.
- `npm run perf:budget`: geçti; 201 medya dosyası, 14.78 MB toplam, 194.8 KB kritik görsel bütçesi.
- `npm run images:audit`: teknik bütünlük geçti. Bilinen açık içerik bağımlılıkları değişmedi: EXIF/provenans verisi yok ve iki landscaping kaynağı aynı içeriği kullanıyor.

## Sonraki Adım

PUX-7'de responsive cihaz matrisi, klavye/safe-area davranışı, WCAG erişilebilirlik sertleştirmesi, forced-colors kontrolleri, performans ölçümleri ve genişletilmiş visual regression kapsamı ele alınmalıdır.
