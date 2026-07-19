# Sprint 4 Yerel Randevu Akışı Kapanış Raporu

**Tarih:** 19 Temmuz 2026  
**Kapsam:** Müşteri randevu talebi akışının hizmet seçiminden başarı ekranına kadar yenilenmesi  
**Ortam:** Yalnız yerel geliştirme ortamı

## 1. Sonuç özeti

Sprint 4 kapsamındaki altı kullanıcı hikâyesi yerelde tamamlandı. Akış artık üç açık adımdan oluşuyor: hizmet, zaman tercihi ve iletişim. Müşteri bir randevunun doğrudan onaylandığını düşünmeden talep oluşturabiliyor, hatalarını veri kaybetmeden düzeltebiliyor ve başarılı gönderimden sonra talebini takip edebiliyor.

Bu sprintte canlı ortama yayın, Git commit/push veya Supabase şema/veri değişikliği yapılmadı.

## 2. Kullanıcı hikâyeleri

| ID | Durum | Uygulama karşılığı |
| --- | --- | --- |
| S4-01 | Tamamlandı | `3 adımın X. adımı` durum metni, semantik sıralı liste ve aktif adım bilgisi |
| S4-02 | Tamamlandı | Kompakt hizmet seçenekleri, radiogroup semantiği, açık kapsam ve seçili hizmet özeti |
| S4-03 | Tamamlandı | Mobil gün kartları, iki sütunlu saat seçimi, doğru hafta ilerlemesi ve slot çakışması dönüşü |
| S4-04 | Tamamlandı | Zorunlu ad/telefon, isteğe bağlı e-posta/not, mobil klavye tipleri ve autocomplete |
| S4-05 | Tamamlandı | Alana bağlı hata mesajları, odaklanan hata özeti ve API hatasında form verilerinin korunması |
| S4-06 | Tamamlandı | `Talebiniz kaydedildi`, `Ekip teyidi bekleniyor`, talep numarası ve takip bağlantısı |

## 3. UX/UI kararları

- Bilgi amaçlı hizmet kartları ile randevu içindeki gerçek seçim kontrolü ayrıştırıldı.
- Hizmet seçimi büyük tekrar eden kartlar yerine taranabilir, sabit boyutlu seçeneklere dönüştürüldü.
- Zamanın onaylı randevu değil müşteri tercihi olduğu takvim ve başarı ekranında kalıcı biçimde açıklandı.
- WhatsApp hızlı iletişim kanalı olarak korundu; izlenebilir sistem kaydı oluşturmadığı açıkça belirtildi.
- Form tek bir semantik submit davranışına geçirildi. Hata özeti ve alan hataları ekran okuyucu ilişkileriyle bağlandı.
- İletişim bilgilerini cihazda saklama varsayılan olarak kapalıdır. Kullanıcı açıkça seçerse kaydedilir ve daha sonra temizlenebilir.
- Başarı ekranı talep kaydı ile ekip onayını birbirine karıştırmaz; takip eylemini birincil sonraki adım olarak sunar.

## 4. Hata ve dayanıklılık davranışı

- Geçersiz telefon ve e-posta hataları ilgili alana `aria-describedby` ile bağlıdır.
- Hata özeti gönderim sonrasında odağı alır; girilmiş değerler korunur.
- Genel API hatası form içinde gösterilir ve hizmet, zaman ve iletişim verilerini silmez.
- Son anda dolan slotta yalnız seçili saat temizlenir, uygunluk yeniden çekilir ve müşteri zaman adımına açık çözüm mesajıyla döner.
- Boş haftadan sonraki haftaya geçişteki 49 günlük sıçrama hatası giderildi.

## 5. Ölçüm olayları

Akış aşağıdaki ayrık olayları üretir:

- `booking_started`
- `booking_step_completed`
- `booking_validation_failed`
- `booking_submission_started`
- `booking_submitted`
- `booking_submission_failed`
- `booking_success_viewed`
- `booking_success_whatsapp_clicked`

Tamamlanan adımlar oturum içinde bir `Set` ile tekilleştirilir. Sunucu tarafında mutlak tekilleştirme Sprint 6 analitik yönetişimi kapsamında ayrıca değerlendirilebilir.

## 6. Kabul kriterleri ve kanıt

| Kabul kriteri | Sonuç | Kanıt |
| --- | --- | --- |
| 390x844 ekranda yatay kayma olmadan akış | Geçti | Playwright mobil E2E ve `scrollWidth` kontrolü |
| Klavyeyle adımların tamamlanabilmesi | Geçti | Semantik button/radio/form ve tek submit yapısı |
| Telefon hatasının alana programatik bağlı olması | Geçti | Bileşen testi ve `aria-invalid` E2E kontrolü |
| API hatasında verilerin korunması | Geçti | `CustomerBooking` entegrasyon testi |
| Slot çakışmasında yeni seçim yolu | Geçti | Entegrasyon testi, refetch ve zaman adımına dönüş |
| Talep ile onayın ayrışması | Geçti | `BookingSuccess` bileşen testi ve E2E başarı ekranı |
| Olayların tekil kaydı | Geçti | Adım Set'i ve ayrı başlangıç/hata/gönderim olayları |

## 7. Teknik doğrulama

- ESLint: geçti, sıfır uyarı.
- Vitest: 16 test dosyası, 45 test geçti.
- Playwright: 390x844 mobil randevu senaryosu geçti.
- Vite production build: geçti, 800 modül dönüştürüldü.
- `git diff --check`: yalnız satır sonu bilgilendirmeleri; whitespace hatası yok.

## 8. Veri ve yayın etkisi

- Yeni migration veya SQL çalıştırılması gerekmiyor.
- Mevcut `create_appointment_request` RPC sözleşmesi kullanılıyor.
- Yerel bilgi saklama yalnız kullanıcı onayıyla `localStorage` üzerinde çalışıyor.
- Canlı siteye dosya aktarılmadı.
- Commit ve push yapılmadı.

## 9. Sprint 5'e geçiş notu

Sprint 5; takip ekranı, değişiklik/iptal talepleri, ilk/tekrar talep mesajları, iletişim beklentisi ve iptal geri bildirimi kapsamını ele almalıdır. Sprint 4 başarı ekranındaki takip bağlantısı bu akış için hazır giriş noktasıdır.
