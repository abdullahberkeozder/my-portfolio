# Sprint 0-1-2 Detaylı Denetim Raporu

**Tarih:** 18 Temmuz 2026  
**Kapsam:** Yerel kod, sprint planı, sprint raporları, otomatik testler ve responsive tarayıcı kontrolleri  
**Canlı işlem:** Yapılmadı; deploy, commit, push ve Supabase yazma işlemi yok

## Yönetici Özeti

Üç sprintte planlanan temel müşteri deneyimi yerelde büyük ölçüde uygulanmış durumda. SEO alan adı birliği, statik pazarlama hizmetleri, responsive medya altyapısı, yeni müşteri navigasyonu, güven şeridi ve üç iletişim kanalı çalışıyor. Bununla birlikte hiçbir sprint Definition of Done açısından tamamen kapalı sayılmamalı:

- **Sprint 0:** Koşullu geçti. Geçerli token self-servis akışı ve canlı veritabanı uyumu bu denetimde doğrulanmadı.
- **Sprint 1:** Koşullu geçti. Transfer ve responsive görsel hedefleri geçti; 44 px dokunma hedefi başarısız, LCP/CLS release eşikleri ölçülmedi.
- **Sprint 2:** Koşullu geçti. Ana müşteri ve güven mimarisi çalışıyor; hukuki footer bağlantıları ve bazı PO içerikleri açık, hero kanal olayları dashboard'da ayrı raporlanmıyor.

## Öncelikli Bulgular

### 1. Yüksek - Self-servis kabulü uçtan uca kapanmamış

Sprint 0 kabul kriteri takip, değişiklik ve iptal bağlantılarının canlı veritabanıyla çalışmasını istiyor. Kod ve SQL yapısı mevcut; ancak geçerli sentetik token smoke testi yok ve `CustomerAppointmentManage`, `BookingSuccess`, public RPC istemcileri için otomatik test bulunmuyor.

**Etkisi:** RPC sürüm farkı, public token dönüşü veya tekrar istek davranışı ancak gerçek kullanıcı akışında fark edilebilir.  
**Karar:** Sprint 0 release onayı için sentetik kayıtla talep -> başarı -> takip -> değişiklik -> iptal senaryosu zorunlu.

### 2. Yüksek - Sprint 1 dokunma hedefi kabulü başarısız

Gerçek tarayıcı ölçümü:

| Görünüm | 44 px altındaki hedef |
| --- | ---: |
| 320 x 760 | 14 |
| 390 x 844 | 8 |

320 px'te kök font `9.36px` oluyor; `4.4rem` hedefler yaklaşık `41.2px` yüksekliğe düşüyor. 390 px'te footer bağlantıları `36px`. Etkilenen yüzeyler arasında tema düğmesi, mobil menü, sticky CTA ve footer bağlantıları bulunuyor.

**Etkisi:** Mobil erişilebilirlik ve kullanım kolaylığı hedefi karşılanmıyor.  
**Karar:** Kök font küçültmesini kaldır; dokunma hedeflerinde `min-height: 44px` veya kök ölçekten bağımsız token kullan; footer linklerini en az 44 px yap.

### 3. Yüksek - LCP ve CLS release eşikleri henüz kanıtlanmadı

Responsive görsel ve yerel font altyapısı doğru yönde; ancak planın `LCP < 3.5 sn` ve `CLS < 0.10` eşikleri throttled Lighthouse/PageSpeed ile ölçülmemiş. Sprint 1 raporu da bu maddeleri açık bırakıyor.

**Etkisi:** Önceki canlı mobil baseline olan `LCP 7.5 sn` ve `CLS 0.74` değerlerinin hedefe indiği söylenemez.  
**Karar:** Canlıya yakın preview üzerinde yavaş 4G/mobil CPU profiliyle en az üç koşunun medyanını kaydet.

### 4. Orta - Sprint 2 kanal ölçümü dashboard'a bağlanmamış

Hero, navigasyon ve sticky alan `hero_cta_clicked`, `navigation_cta_clicked` ve `public_channel_clicked` olayları üretiyor. Mevcut kanal grafiği ise yalnız `booking_submitted`, `booking_whatsapp_clicked` ve `booking_email_clicked` olaylarını kullanıyor; telefon ile hero yerleşimleri ayrı görülemiyor.

**Etkisi:** S2-05 için veri yazılıyor fakat PO, kanalların ve yerleşimlerin dönüşümünü ürün içinde karşılaştıramıyor. Ayrıca `booking_wizard_started` sayfa açılışında üretildiği için dönüşüm paydası gerçek wizard başlangıcından yüksek olabilir.  
**Karar:** Tek olay sözlüğü belirle; `channel`, `placement`, `cta` özelliklerini kullanan dashboard kırılımı ekle ve gerçek wizard etkileşimini ayrı olay yap.

### 5. Orta - Sprint 2 hukuki bilgi mimarisi eksik

Footer iletişim ve hızlı bağlantıları içeriyor; gizlilik ve aydınlatma bağlantıları yok. Bu durum Sprint 2 raporunda da `Bekliyor` olarak doğru kaydedilmiş.

**Etkisi:** Sprint 2 footer kabul kriteri ve ileride form veri işleme şeffaflığı tamamlanmış değil.  
**Karar:** Onaylı metinler ve rotalar Sprint 5'te eklenene kadar Sprint 2'yi koşullu kabul et.

### 6. Orta - Doğrulanması gereken müşteri vaadi mevcut

PO bağımlılıklarında geri dönüş hedefi onay beklerken FAQ ve başarı ekranında “genellikle 1-2 saat içinde” ifadesi yayınlanıyor.

**Etkisi:** Operasyonel olarak sürdürülemeyen bir beklenti müşteri memnuniyetsizliği yaratabilir.  
**Karar:** PO bu SLA'yı doğrulamalı; doğrulanmıyorsa “çalışma saatleri içinde en kısa sürede” gibi ölçüsüz dil kullanılmalı.

### 7. Orta - Bilinmeyen rota indexlenebilir metadata bırakıyor

`PageNotFound` SEO bileşeni kullanmıyor. Production preview kontrolünde bilinmeyen rota, `/appointment` canonical ve ana sayfa başlığıyla açıldı; `noindex` yoktu.

**Etkisi:** Soft-404 sayfaları ana randevu sayfasına canonical verebilir ve arama motoru kalite sinyallerini bozabilir.  
**Karar:** 404 görünümüne özgü başlık, açıklama ve `noindex, nofollow` ekle; platform tarafında mümkünse gerçek 404 yanıt stratejisi belirle.

### 8. Düşük-Orta - Test paketi zamanlamaya duyarlı

Tam paket ilk koşuda lazy login testi nedeniyle 28/29 geçti; izole tekrar ve ikinci tam koşu 29/29 geçti. `findByRole` varsayılan kısa bekleme süresine bağlı.

**Etkisi:** CI'da aralıklı kırmızı build oluşabilir.  
**Karar:** Lazy route testi için açık ve makul timeout kullan veya lazy importları testte kararlı biçimde mockla.

### 9. Düşük - Uygulama ile sprint planındaki görsel kırılımlar farklı

Plan `320/480/768/1280` varyantlarını tarif ediyor; kod `320/640/1024` üretiyor. Tarayıcı doğru kaynak seçti: mobil `hero-640.avif`, masaüstü `hero-1024.avif`.

**Etkisi:** Davranış çalışıyor fakat plan ve uygulama izlenebilirliği zayıflıyor; bazı orta genişliklerde gereğinden büyük kaynak seçilebilir.  
**Karar:** Ya planı gerçek stratejiye göre güncelle ya da ölçüme dayanarak 480/768/1280 varyantlarını ekle.

## Sprint 0 Checklist

| Madde | Durum | Kanıt/Not |
| --- | --- | --- |
| `Randevu Al` ve kısa WhatsApp CTA | Geçti | Hero'da `Randevu Al`, `Fotoğraf Gönder`. |
| Pazarlama hizmet kartları tıklanamaz | Geçti | 8 semantik `article`, randevuya taşıyan buton yok. |
| Wizard hizmet seçimi | Geçti | Takvim güvenlik/component testleri geçiyor. |
| Talep/onay terminolojisi | Geçti | Zamanın tercih olduğu ve ekip teyidi gerektiği açıklanıyor. |
| Canonical, OG URL ve sitemap alan adı | Geçti | `https://umut-usta.vercel.app` ile uyumlu. |
| Login/signup/takip `noindex` | Geçti | SEO testleri ve tarayıcı metadata kontrolü geçti. |
| Bilinmeyen rota SEO | Kaldı | Ana sayfa canonical'ı ve indexlenebilir metadata kalıyor. |
| Geçerli token takip/değişiklik/iptal | Kaldı | Sentetik fixture ve otomatik E2E yok. |
| Baseline ekran görüntülerinin saklanması | Kaldı | Sayısal PageSpeed kaydı var; repoda sprint baseline/filmstrip bulunamadı. |
| Lint/build/test | Koşullu geçti | Lint ve build temiz; test son koşuda 29/29, bir önceki koşuda zamanlama kaynaklı 1 hata. |

## Sprint 1 Checklist

| Madde | Durum | Kanıt/Not |
| --- | --- | --- |
| AVIF/WebP pipeline | Geçti | 66 AVIF + 66 WebP, 22 kaynak PNG. |
| Responsive `srcset`/`sizes` | Geçti | Mobil ve masaüstünde uygun AVIF seçildi. |
| Hero preload ve yüksek öncelik | Geçti | AVIF preload, image srcset ve yüksek öncelik mevcut. |
| Offscreen medya lazy-load | Büyük ölçüde geçti | Hizmet, portföy ve harita lazy; kritik hero eager. |
| Yerel Plus Jakarta Sans | Geçti | Dış Google Fonts bağlantısı yok. |
| Fallback font metrik ayarı | Kaldı | Açık bir `size-adjust`/metric override tanımı yok. |
| Reduced motion | Geçti | Global ve reveal fallback içerikleri görünür tutuyor. |
| Performans bütçesi | Geçti | 132 dosya, 10.47 MB set, 194.8 KB kritik görsel. |
| İlk sayfa transferi < 3 MB | Önceki ölçüm geçti | Sprint raporunda 0.54 MB production preview. |
| 44 x 44 dokunma hedefleri | Başarısız | 320 px'te 14, 390 px'te 8 küçük hedef. |
| LCP < 3.5 sn / CLS < 0.10 | Kaldı | Throttled ölçüm yok. |
| CI gerileme kapısı | Kaldı | Script var; `.github`/Lighthouse CI entegrasyonu yok. |

## Sprint 2 Checklist

| Madde | Durum | Kanıt/Not |
| --- | --- | --- |
| Global header ve responsive menü | Geçti | 768 px mobil menü, 1024/1440 masaüstü menü; yatay taşma yok. |
| Mobil menü erişilebilirliği | Geçti | Dinamik ad, `aria-expanded`, `aria-controls`, `Escape`. |
| İlk ekran değer önerisi ve bölge | Geçti | Ankara, hizmet, teyit modeli ve aksiyonlar görünür. |
| Üç kanal CTA | Geçti | Randevu, yeşil WhatsApp, ikincil `tel:` telefon. |
| Doğrulanabilir güven şeridi | Geçti | Konum, saat, telefon ve yayınlanmış galeri sayısı. |
| Sonraki bölüm mobil ilk ekranda görünür | Geçti | 390 x 844'te güven şeridi 645 px'te başlıyor. |
| Hizmet bölgesi özeti | Koşullu geçti | Yenimahalle net; diğer ilçeler PO onayı olmadığı için vaat edilmiyor. |
| Gerçek portre/atölye tanıtımı | Koşullu geçti | Mevcut atölye görseli var; gerçek portre teslim edilmedi. |
| Footer iletişim/hızlı erişim | Geçti | Telefon, WhatsApp, konum, saatler ve bölüm bağlantıları var. |
| Footer hukuki bağlantılar | Kaldı | Gizlilik/aydınlatma rotaları yok. |
| Hero kanallarının ayrı ölçümü | Kısmi | Olaylar var; dashboard kırılımı yok. |
| PO içerik onayları | Kaldı | Kesin ilçeler, portre, yorum/garanti ve SLA teyidi açık. |

## Son Otomatik Doğrulama

- `npm run lint`: geçti.
- `npm run build`: geçti; 797 modül.
- `npm run perf:budget`: geçti.
- `npm run test:run`: son koşuda 9 dosya / 29 test geçti.
- Test kararlılığı: önceki tam koşuda lazy login testi bir kez zaman aşımına uğradı.
- `git diff --check`: sprint dosyalarında whitespace hatası yok; CRLF bilgilendirmeleri mevcut.
- 320, 390, 768, 1024 ve 1440 px tarayıcı kontrolü: yatay taşma yok.
- Production görsel seçimi: mobil `hero-640.avif`, masaüstü `hero-1024.avif`.
- Production build ve müşteri sayfası konsolunda uygulama hatası görülmedi.

## Sprint 3 Öncesi Kapanış Kapısı

- [ ] Geçerli sentetik token ile self-servis E2E testi ekle ve çalıştır.
- [ ] 320/390 px dokunma hedeflerini minimum 44 px yap.
- [ ] Throttled Lighthouse ile LCP ve CLS eşiklerini doğrula.
- [ ] Lazy login rota testini kararlı hale getir.
- [ ] Bilinmeyen rotaya `noindex` metadata ekle.
- [ ] Hero/telefon/WhatsApp kanal ve placement verisini dashboard'a bağla.
- [ ] “1-2 saat” geri dönüş vaadini PO ile onayla veya metni düzelt.
- [ ] Gizlilik/aydınlatma metni ve rota sahipliğini planla.
- [ ] Kesin hizmet ilçeleri, portre, gerçek yorum ve garanti kapsamı için PO kararı al.
- [ ] Sprint baseline görselleri ve Lighthouse çıktısını repoda release kaydına ekle.

## Sonuç

Kod tabanı Sprint 3 geliştirmesine teknik olarak devam edebilir; ancak Sprint 0-2'nin release-ready kabul edilmesi için yukarıdaki yüksek öncelikli üç kapı kapatılmalıdır: self-servis E2E, mobil dokunma hedefleri ve LCP/CLS ölçümü. Hukuki ve doğrulanabilir içerik bağımlılıkları production yayınından önce ayrıca tamamlanmalıdır.
