# Sprint 5 Yerel Takip ve Self-Servis Kapanış Raporu

**Tarih:** 19 Temmuz 2026  
**Kapsam:** Talep takibi, değişiklik/iptal isteği, müşteri iletişimi ve iptal nedeni analizi  
**Ortam:** Yalnız yerel geliştirme ortamı

## 1. Sonuç özeti

Sprint 5'in altı kullanıcı hikâyesi uygulama kodunda tamamlandı. Müşteri artık talebinin durumunu, son güncellemeyi ve sıradaki adımı görebiliyor; değişiklik veya iptal isteğinin otomatik işlem olmadığını anlayarak ekibe yeni bir talep iletebiliyor. İlk ve tekrar talep davranışı ayrıldı, veri kullanımı açıklaması eklendi ve Product Owner için iptal nedeni dağılımı oluşturuldu.

Canlı yayın, Git commit/push veya Supabase üzerinde SQL çalıştırma yapılmadı.

## 2. Kullanıcı hikâyeleri

| ID | Sonuç | Uygulama karşılığı |
| --- | --- | --- |
| S5-01 | Tamamlandı | Durum rozeti, hizmet, zaman tercihi, son güncelleme ve sıradaki adım |
| S5-02 | Tamamlandı | Yeni tarih/saat tercihi ve ekip teyidi açıklaması |
| S5-03 | Tamamlandı | İlk istekte `İsteğiniz ilk kez alındı`, yalnız aynı tür tekrarında önceki zaman uyarısı |
| S5-04 | Tamamlandı | Form içi kısa açıklama ve `/privacy` veri kullanımı sayfası |
| S5-05 | Tamamlandı | `Europe/Istanbul` saat dilimine göre mesai içi/dışı mesajı |
| S5-06 | Tamamlandı | İptal nedeni, işlem notu ve geri bildirim ayrımı; dashboard neden grafiği |

## 3. UX/UI kararları

- Ekranın birincil görevi “talebi takip etmek”, ikincil görevi “işlem isteği göndermek” olarak ayrıştırıldı.
- Alttaki form mevcut randevuyu otomatik değiştirdiği veya iptal ettiği izlenimini vermez.
- Segmented control iki eylemi aynı hiyerarşide sunar; seçime göre alan ve açıklama değişir.
- İlk başarılı işlem ile tekrar işlem farklı metinlerle bildirilir ve başarı durumu odağı alır.
- Aynı tür önceki istek yoksa tekrar uyarısı gösterilmez.
- API hatasında form verileri korunur ve yeniden deneme yolu açık kalır.
- İptal nedeni, ekibe iletilecek not ve deneyim geri bildirimi farklı amaçlarla etiketlenir.
- Mesai dışı müşteri talebi engellenmez; ne zaman inceleneceği açıklanır.

## 4. Public veri sınırı

Yeni public takip RPC tasarımı yalnız ekranın ihtiyaç duyduğu alanları döndürür. Dahili randevu `id` değeri, müşteri adı, telefon, e-posta ve public token yanıt gövdesine eklenmez. Public token yalnız rota/RPC girdisi olarak kullanılır.

Doğrudan tablo erişimi yerine `security definer` RPC sınırı korunur. Eklemeli geçmiş ve outbox tabloları için anon/authenticated doğrudan erişimi kaldırılır.

## 5. Veri modeli ve outbox

`supabase/sprint_5_customer_followup.sql` aşağıdaki yapıları hazırlar:

- `appointment_customer_actions`: Her değişiklik/iptal isteğini ayrı satırda saklayan eklemeli geçmiş.
- `notification_outbox`: SMS, WhatsApp veya e-posta sağlayıcısından bağımsız bildirim olayı kuyruğu.
- Minimize edilmiş `get_public_appointment_request` RPC dönüşü.
- JSON sonuç döndüren ve ilk/tekrar sayısını hesaplayan `submit_appointment_customer_action` RPC'si.
- Eski tekil müşteri işlem kaydını geçmiş tablosuna güvenli biçimde taşıyan backfill.

Bildirim sağlayıcısı entegrasyonu bu sprintte yapılmadı; outbox tüketicisi ayrıca onaylanıp uygulanmalıdır.

## 6. Analitik

Eklenen olaylar:

- `self_service_tracking_viewed`
- `self_service_action_submitted`
- `self_service_action_failed`

Başarılı işlem olayında eylem türü, iptal nedeni ve tekrar bilgisi tutulur. Dashboard takip görüntüleme, değişiklik isteği, iptal isteği ve iptal nedenlerini ayrı gösterir. Geri bildirim metni analitik olaya gönderilmez; yalnız operasyon kaydında saklanır.

## 7. Kabul kriterleri

| Kriter | Sonuç | Kanıt |
| --- | --- | --- |
| İlk iptal tekrar gibi gösterilmez | Geçti | Bileşen ve E2E ilk işlem testi |
| Eylem otomatik işlem izlenimi vermez | Geçti | Form ve başarı metni testleri |
| Aynı tür tekrarında önceki zaman görünür | Geçti | Tekrar iptal bileşen/E2E testi |
| Dahili kayıt kimliği public yanıtta yoktur | Hazır | Sprint 5 RPC migration tasarımı |
| Veri kullanımı açıklaması ve bağlantısı vardır | Geçti | `/privacy` sayfası ve tarayıcı QA |
| İptal nedeni dashboard analizine düşer | Geçti | Analitik metrik testi ve grafik |
| Takip/self-servis E2E senaryoları geçer | Geçti | Üç Sprint 5 E2E senaryosu |

## 8. Teknik doğrulama

- ESLint: geçti, sıfır uyarı.
- Vitest: 17 test dosyası, 51 test geçti.
- Playwright: dört toplam E2E senaryosu geçti; üçü Sprint 5 self-servis kapsamındadır.
- Vite production build: geçti, 802 modül dönüştürüldü.
- Tarayıcı QA: veri kullanımı ve geçersiz token durumları semantik/görsel olarak doğrulandı.
- `git diff --check`: whitespace hatası yok.

## 9. Veritabanı uygulama adımı

Yerel uygulama eski RPC yanıtıyla temel olarak çalışır; geçmiş, public veri minimizasyonu ve outbox'ın etkinleşmesi için yayın öncesinde Supabase SQL Editor'da şu dosya tek sefer çalıştırılmalıdır:

`supabase/sprint_5_customer_followup.sql`

Uygulama öncesi veritabanı yedeği alınmalı; sonrasında yeni talep takibi, ilk değişiklik, ilk iptal, tekrar iptal ve geçersiz token smoke testleri yapılmalıdır. Dosya `DROP FUNCTION ...` adımını yeni dönüş tipinden önce içerdiği için PostgreSQL `42P13` dönüş tipi hatasını önler.

## 10. Yayın öncesi notlar

- Veri kullanımı metni ürün içi anlaşılabilirlik için hazırlanmıştır; canlı yayın öncesinde işletme kimliği, saklama süresi ve yasal dayanak açısından hukuk kontrolü yapılmalıdır.
- Outbox tüketicisi kurulmadan tablo yalnız güvenilir olay kaydı üretir, otomatik mesaj göndermez.
- Migration henüz çalıştırılmadı.
- Canlı siteye aktarım, commit ve push yapılmadı.
