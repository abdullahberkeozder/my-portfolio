# Sprint 6 Yerel Ölçüm ve Release Raporu

**Tarih:** 19 Temmuz 2026  
**Kapsam:** Ölçüm, CRO, lead kalitesi, erişilebilirlik, regresyon ve kontrollü yayın hazırlığı  
**Yayın durumu:** Production'a gönderilmedi

## Sonuç

Sprint 6'nın yerel ürün ve mühendislik kapsamı tamamlandı. Merkezi event taxonomy, UTM attribution, işlem bazlı tekrar önleme, lead kalite sınıflandırması, kapalı operasyon hunisi, kanal/hizmet karşılaştırmaları, erişilebilirlik senaryoları, görsel regresyon ve rollback dokümantasyonu hazırlandı.

Production release henüz hazır değildir. Migration 19 Temmuz 2026 tarihinde Supabase SQL Editor'da kullanıcı tarafından uygulandı. İki açık doğrulama kapısı vardır:

1. Admin lead kalitesi ve dashboard gerçek bir kayıtla smoke test edilmelidir.
2. Mobil Lighthouse performance hedefi karşılanmamaktadır. PO istisnası verilmediği için release checklist kapalı tutulmuştur.

## Tamamlanan kapsam

| Hikâye | Yerel sonuç | Durum |
| --- | --- | --- |
| S6-01 | Kaynak -> talep -> nitelikli -> onay -> tamamlanan iş hunisi | Tamamlandı |
| S6-02 | Kanal bazında talep, kalite, onay ve tamamlanma karşılaştırması | Tamamlandı |
| S6-03 | `qualified`, `unqualified`, `outside_area`, `spam` sınıflandırması | Migration uygulandı, smoke test bekliyor |
| S6-04 | Klavye, reduced-motion, 200% eşdeğeri ve görsel regresyon | Tamamlandı |
| S6-05 | Kontrollü release, izleme eşikleri ve rollback adımları | Dokümante edildi, release kapalı |

## Ölçüm mimarisi

- Event adları `src/analytics/events.js` içinde merkezi sabitlere taşındı.
- Event properties düz, kişisel bilgi içermeyen ve doğrulanan bir şemaya bağlandı.
- `source`, `medium`, `campaign`, `content`, `term` UTM alanları oturum boyunca korunuyor.
- Aynı `operation_id` istemci tarafında ikinci kez yazılmıyor; migration sonrasında veritabanı unique index'i de koruma sağlayacak.
- WhatsApp ve telefon tıklamaları satış değil, yalnızca “iletişim başlangıcı” olarak raporlanıyor.
- İş hunisi click event'lerinden değil, `appointment_requests` durum ve lead kalite verisinden hesaplanıyor.

## Test sonuçları

| Kontrol | Sonuç |
| --- | --- |
| `npm run lint` | Geçti, 0 uyarı |
| `npm test -- --run` | Geçti, 19 dosya / 59 test |
| `npm run build` | Geçti, 803 modül |
| `npm run test:e2e` | Geçti, 8/8 |
| Fonksiyonel müşteri E2E | Geçti, 4 senaryo |
| Erişilebilirlik E2E | Geçti, 2 senaryo |
| Görsel regresyon | Geçti, 2 baseline |
| `git diff --check` | Geçti; yalnızca CRLF bilgilendirmeleri var |

E2E paketi mobil randevu tamamlama, ilk değişiklik, tekrar iptal, geçersiz token, klavye kullanımı, reduced-motion ve 200% eşdeğeri dar görünümü kapsıyor.

## Lighthouse kalite kapısı

Nihai üç tekrarlı yerel production ölçümünde:

| Metrik | Hedef | Sonuç | Durum |
| --- | ---: | ---: | --- |
| Accessibility | >= 98 | Hedef geçti | Geçti |
| CLS | <= 0.10 | Hedef geçti | Geçti |
| Performance | >= 90 | 80 | Kaldı |
| LCP | <= 3.5 sn | yaklaşık 5.33 sn | Kaldı |

Pasif wizard adımlarındaki kontrast hatası giderildi. İlk ekranı ana pakete alma denemesi LCP'yi iyileştirse de başlangıç JavaScript boyutunu ve layout kararlılığını bozduğu için geri alındı. Bu karar, tek bir sentetik metriği iyileştirirken gerçek kullanıcı riskini artırmamak için verildi.

## Release kararı

**Karar: NO-GO.** Yerel geliştirme devam edebilir; production deploy, Git push veya release yapılmadı.

Release'in açılması için:

1. Admin lead kalite güncellemesi ve dashboard gerçek veriyle smoke test edilmeli.
2. Müşteri route LCP'si ayrı bir performans işiyle iyileştirilmeli veya geçici istisna PO tarafından açıkça kaydedilmeli.
3. Preview ortamında release checklist tamamlanmalı.

## İlgili belgeler

- `docs/Sprint_6_Analytics_Taxonomy.md`
- `docs/Sprint_6_Production_Release_Checklist.md`
- `supabase/sprint_6_measurement_release.sql`
