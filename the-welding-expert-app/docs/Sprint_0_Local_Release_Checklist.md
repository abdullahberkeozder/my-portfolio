# Sprint 0 Local Release Checklist

Bu kontrol listesi yalnız yerel hazırlık içindir. Production deploy, Git push ve uzak veritabanı değişikliği Sprint 0 çalışma oturumunun kapsamı dışındadır.

## Kapsam

- [x] Hero ana CTA metni: `Randevu Al`
- [x] Hero WhatsApp CTA metni: `Fotoğraf Gönder`
- [x] Pazarlama hizmet kartları salt görüntüleme yüzeyi
- [x] Talep, zaman tercihi ve onaylı randevu terminolojisi
- [x] Self-servis takip/değişiklik/iptal rotası kodda mevcut
- [x] Canonical, Open Graph ve sitemap alan adı uyumu
- [x] Yönetim giriş/kayıt sayfaları için `noindex`
- [x] Lint
- [x] Production build
- [x] Unit/component test paketi
- [x] Local masaüstü müşteri akışı
- [x] Local mobil müşteri akışı
- [x] Geçersiz takip tokenı ve takip sayfası metadata smoke testi
- [ ] Sentetik geçerli token ile değişiklik/iptal formu smoke testi

## Baseline

18 Temmuz 2026 tarihli canlı PageSpeed ölçümü:

| Metrik | Mobil | Masaüstü |
| --- | ---: | ---: |
| Performance | 44 | 93 |
| LCP | 7,5 sn. | 1,6 sn. |
| CLS | 0,74 | 0 |
| Transfer | yaklaşık 11,4 MB | yaklaşık 11,8 MB |

Bu değerler Sprint 1 performans çalışmasının karşılaştırma tabanıdır; Sprint 0 release kabul eşiği değildir.

## Local smoke senaryoları

1. `/appointment` açılır; hero, navigasyon ve hizmetler görünür.
2. `Randevu Al` randevu yüzeyine götürür.
3. Hizmet kartına basmak sayfayı randevu alanına taşımaz.
4. Wizard hizmet -> zaman tercihi -> iletişim adımlarında ilerler.
5. Müsaitlik servisi hatasında slotlar güvenli biçimde kapalı kalır.
6. Başarı ekranı talebi randevu onayı gibi sunmaz.
7. Geçerli public token takip sayfasını; geçersiz token güvenli hata durumunu açar.
8. Değişiklik ve iptal istekleri otomatik işlem yapılmış izlenimi vermez.
9. `/gallery`, `/login`, `/signup` ve bilinmeyen rota açılır.
10. Mobilde yatay taşma, sticky CTA çakışması veya kesilen metin yoktur.

## Local çıkış kaydı

### Otomatik doğrulama

- `npm run lint`: başarılı.
- `npm run build`: başarılı; 794 modül üretildi.
- `npm run test:run`: 8 test dosyası ve 26 test başarılı.
- `git diff --check`: başarılı; satır sonu dönüşüm uyarıları dışında hata yok.

### Tarayıcı doğrulaması

- Local URL: `http://127.0.0.1:5182/appointment`.
- Masaüstünde hero, navigasyon, hizmetler, süreç, galeri özeti, wizard, konum ve SSS görünür.
- `Randevu Al` tıklandığında `#appointment-calendar` açıldı ve wizard viewport üstüne yerleşti.
- Pazarlama hizmet bölümünde 8 `article`, 0 buton doğrulandı.
- Wizard hizmet -> zaman tercihi -> iletişim adımına ilerledi; herhangi bir talep gönderilmedi.
- 390x844 hedef viewport testinde tarayıcı içerik alanı 355x767 olarak raporlandı; yatay taşma yok.
- Mobil sticky CTA 57 px yüksekliğinde ve sayfa alt boşluğu tarafından karşılanıyor.
- `/gallery` canonical ve `og:url` değerleri eşleşiyor.
- `/login` ve kişiye özel takip sayfası `noindex, nofollow`.
- Geçersiz public token güvenli “Randevu takip bilgisi yüklenemedi” durumu gösteriyor.

### Açık yerel bağımlılıklar

- Geçerli sentetik public token olmadığı için gerçek bir müşteri kaydına erişmeden değişiklik/iptal formunun tarayıcı smoke testi yapılmadı. İlgili RPC davranışı daha önce manuel test edildi; bu kontrol için ileride sentetik local fixture kullanılmalı.
- Hizmet kartlarının bazı fiyat ve madde metinleri Supabase'deki dinamik `service_configs` kayıtlarından geliyor ve yerel `business.js` metinlerinin önüne geçiyor. Uzak veri değişikliği kapsam dışı olduğu için bu kayıtlar değiştirilmedi.
- `5174` portu başka/eski bir süreçte 404 döndürdüğü için Sprint 0 doğrulaması `5182` portunda yapıldı; mevcut süreç sonlandırılmadı.

### Kapsam güvencesi

- Production deploy yapılmadı.
- Git commit veya push yapılmadı.
- Supabase üzerinde SQL veya veri değişikliği yapılmadı.
