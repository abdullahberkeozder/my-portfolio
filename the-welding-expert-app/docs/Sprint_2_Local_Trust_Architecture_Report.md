# Sprint 2 - Müşteri Giriş Sayfası ve Güven Mimarisi

**Tarih:** 18 Temmuz 2026  
**Ortam:** Yalnız yerel geliştirme  
**Durum:** Teknik kapsam tamamlandı, PO içerik bağımlılıkları açık

## Amaç

Müşterinin ilk ekranda hizmeti, hizmet bölgesini, doğrulanabilir işletme bilgilerini ve kullanabileceği iletişim kanallarını hızlıca anlayabilmesini sağlamak. Randevu, WhatsApp ve telefon aksiyonları birbirinden görsel ve analitik olarak ayrıştırıldı.

## Tamamlanan İşler

- Logo, bölüm bağlantıları, birincil `Randevu Al` aksiyonu, tema kontrolü ve erişilebilir mobil menü içeren global müşteri navigasyonu eklendi.
- Hero metin hiyerarşisi sadeleştirildi; randevu, WhatsApp ve `tel:` telefon kanalları birlikte sunuldu.
- Yalnız mevcut verilerden oluşan güven şeridi eklendi: Yenimahalle konumu, çalışma saatleri, telefon ve yayınlanmış iş sayısı.
- Hizmet bölgesi dili netleştirildi. Kesin olmayan ilçeler listelenmedi; kapsamın iş türü, mesafe ve ekip uygunluğuna göre teyit edildiği açıklandı.
- Mobil sabit aksiyon alanı `Randevu`, `WhatsApp` ve `Ara` olarak üç kanala ayrıldı; içerik için alt boşluk korunarak çakışma engellendi.
- Footer; marka özeti, hızlı erişim, telefon, WhatsApp, konum ve çalışma saatleriyle yeniden düzenlendi.
- Hero, navigasyon, sticky mobil alan, harita ve konum kanalları için yerleşim bazlı analitik olayları eklendi.
- Mobil menü için `aria-expanded`, `aria-controls`, dinamik erişilebilir ad ve `Escape` ile kapatma davranışı eklendi.

## Kabul Kriterleri

| Kriter | Sonuç | Not |
| --- | --- | --- |
| İlk ekran ne, nerede, güven ve sonraki aksiyonu açıklar | Geçti | Hero ve güven şeridi 390 px ilk görünümde başlıyor. |
| Tek birincil `Randevu Al`, yeşil WhatsApp, ikincil telefon | Geçti | Hero, header ve mobil kanal rolleri ayrıştırıldı. |
| Telefon `tel:` bağlantısıdır ve olay üretir | Geçti | Hero, sticky alan, konum ve footer bağlantıları doğrulandı. |
| Mobilde sonraki bölüm başlangıcı görünür | Geçti | 390 x 844 görünümde güven şeridinin başlangıcı görünür. |
| Header, sticky CTA ve içerik çakışmaz | Geçti | Yatay taşma yok; üç mobil aksiyon metni kesilmeden sığıyor. |
| Footer iletişim ve hızlı bağlantıları içerir | Geçti | Telefon, WhatsApp, konum, saatler ve bölüm bağlantıları mevcut. |
| Footer gizlilik/aydınlatma bağlantıları içerir | Bekliyor | Onaylı hukuki metin ve rota yok; Sprint 5 bağımlılığı olarak korundu. |

## Doğrulama

- `npm run lint`: geçti.
- `npm run build`: geçti.
- `npm run test:run`: 9 test dosyası, 29 test geçti.
- `npm run perf:budget`: geçti; 132 dosya, 10.47 MB toplam optimize medya, 194.8 KB kritik görsel.
- 390 x 844 mobil kontrolü: yatay taşma yok, mobil menü aç/kapat ve `Escape` davranışı geçti.
- 1440 x 900 masaüstü kontrolü: navigasyon, hero, güven şeridi ve footer yerleşimi geçti.
- Tarayıcı konsolu: uygulama hatası yok.

## Açık PO Bağımlılıkları

- Kullanılabilir gerçek Umut Usta portresi henüz sağlanmadı. Mevcut doğrulanmış atölye görseli korunuyor.
- Hizmet verilen kesin ilçeler ve yol/servis koşulları onaylanmadı. Bu nedenle ilçe vaadi üretilmedi.
- Doğrulanabilir müşteri yorumu, puanı veya garanti kapsamı sağlanmadı. Sahte güven rozeti eklenmedi.
- Gizlilik ve aydınlatma metinleri ile hedef rotalar henüz yok. Footer hukuki bağlantıları Sprint 5'e bırakıldı.

## Teknik Etki

Sprint 2 için yeni veritabanı tablosu, migration veya ortam değişkeni gerekmiyor. Analitik kayıtları mevcut `logEvent` altyapısını kullanıyor. Canlı ortama aktarım, commit ve push yapılmadı.

## Yerel Demo

`http://127.0.0.1:5192/appointment`
