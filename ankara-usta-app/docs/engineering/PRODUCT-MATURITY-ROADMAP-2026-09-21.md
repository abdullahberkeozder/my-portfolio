# Orkestra ürün olgunluğu yol haritası

Güncelleme: 21 Eylül 2026

Kapsam: ürün stratejisi, müşteri–usta pazaryeri döngüsü, UX/UI, güven, operasyon ve teknik kanıt

Durum: güncel planlama kaynağı; yayın kararı veya feature flag aktivasyonu değildir.

Bu belge, 19 Eylül tarihli yayın odaklı sıralamanın yerini alır. Önceki belge tarihsel karar ve kanıt kaydı olarak korunur. Yeni aşamalar `P0–P6` olarak adlandırılmıştır; böylece wizard `R0/R1/R2` ve daha önceki teslimat kapılarıyla ad çakışması önlenir.

## 1. Yönetici kararı

Orkestra yayın aşamasında değildir. Yakın hedef daha fazla özellik eklemek veya flag açmak değil; var olan geniş kapasiteyi anlaşılır, güvenilir ve tekrarlanabilir tek bir pazaryeri deneyimine dönüştürmektir.

Öncelik sırası:

1. Kaynak, migration, test sonucu, doküman ve commit sınırını aynı gerçeğe bağla.
2. `Musluk Değişimi` hizmetinde müşteri–usta–operasyon akışını baştan sona tamamla.
3. Wizard ve uzman seçimini erişilebilirlik, hata kurtarma ve mobil görev tamamlama açısından olgunlaştır.
4. Teklif, pazarlık, görüşme ve iş yaşam döngüsünün kullanıcı yüzlerini backend sözleşmeleriyle aynı seviyeye getir.
5. Hesap, doğrulama, moderasyon ve bildirim süreçlerini gerçek operasyon yüzeylerine dönüştür.
6. Ürün davranışını ölçmeden katalog, şehir veya entegrasyon yüzeyini genişletme.

Feature flag'ler kapalı kalacaktır. Teknik R2 kapısının geçmesi, ürün kararıyla etkinleştirme ve yayın kanıtının yerine geçmez.

## 2. Bugünkü kanıt tablosu

| Alan | Güncel durum | Kanıtlanan | Henüz iddia edilmeyen |
| --- | --- | --- | --- |
| U1 hizmet keşfi | Yerel doğrulandı | Arama, kategoriye dönüş, klavye ve hedef viewport kontrolleri | Gerçek kullanıcı dönüşümü |
| U2 talep hazırlama | Uygulandı, yerel doğrulandı, kısmi gerçek oturum kanıtı | Soru odağı, koşullu akış, konum, düzenlenebilir özet, başarı makbuzu, taslak/auth dönüşü | Tam yardımcı teknoloji, zoom, cihaz ve hata matrisi |
| U3 uzman seçimi | Çoklu hesap doğrulandı | Gerçek sentetik usta verisiyle filtre → profil → seçili ustaya talep; 320/390/820/1440; A → B → A taslak izolasyonu | Canlı usta arzı ve gerçek pazar kalitesi |
| M0–M4 çekirdek sözleşmeler | Uygulandı, yerel ve çoklu hesap doğrulandı | Yetki, açık/yönlendirilmiş talep ayrımı, davet/genişletme, görüşme, revizyon, stale-base, retry, kabul ve Realtime çekirdek senaryoları | Yayın, tüm erişilebilirlik/offline matrisi ve gerçek operasyon yükü |
| R2 Realtime paketi | 4/4 geçti | Canlı teklif, eşzamanlı mesaj, kapsam değişikliği ve analytics PII kontrolü | Vinext kapanış logunun tamamen giderildiği |
| Altın hizmet | Yerel parçalar mevcut | `Musluk Değişimi` soru ve sözleşme temeli | Tek fixture zincirinde müşteri → usta → iş → yorum/uyuşmazlık |
| Hesap ve auth | Kısmi | Giriş dönüşü, taslak sahipliği, hesap değişimi | Kayıt, e-posta doğrulama, parola sıfırlama ve tüm rol girişlerinin tam tarayıcı matrisi |
| Operasyon | Kısmi | Moderasyon, uyuşmazlık ve notification outbox temelleri | Worker'ın staging gözlemi, eksiksiz admin yolculuğu ve runbook provası |
| Yayın | Başlatılmadı | Flag'ler varsayılan olarak kapalı | Release candidate, pilot veya canlı arz |

R2 çalışmasının kaynakları çalışma ağacında henüz tek bir Orkestra commit adayı olarak sabitlenmemiştir. Bu nedenle kanıt “geçti” olarak kaydedilir; “Released” veya temiz repository durumu olarak sunulmaz.

## 3. Tamamlanan temel adımlar

- Ankara odaklı 6 kategori ve 26 hizmetlik ortak katalog oluşturuldu.
- Wizard; hizmete özel soru sözleşmeleri, koşullu sorular, risk uyarıları, ilçe/mahalle, medya, özet ve sunucu başarısına bağlı makbuz bileşenlerine ayrıldı.
- Misafir taslağının giriş sonrasında hedef usta, cevaplar ve adım korunarak hesaba devri; müşteri değişiminde izolasyonu doğrulandı.
- Usta dizini, profil, hizmet/bölge filtreleri, örnek veri etiketi ve seçili ustaya talep yolu responsive olarak doğrulandı.
- Yönlendirilmiş ve açık talebin görünürlük kuralları; davet, açık havuza kontrollü genişletme, özel görüşme, teklif revizyonu ve kabul sözleşmeleri geliştirildi.
- Çoklu hesap RLS, RPC, concurrency ve Realtime çekirdek kontrolleri izole `orkestra-e2e` ortamında geçti.
- Teklif ve iş yaşam döngüsü için atomik RPC yaklaşımı, append-only revizyonlar, idempotency ve stale-base koruması kuruldu.
- Usta başvurusu, belgeler, doğrulama, uyuşmazlık ve bildirim outbox'ı için backend temelleri hazırlandı.
- Marka, ana keşif, hesap paneli, responsive navigasyon, harita ve wizard üzerinde önemli UX/UI sadeleştirmeleri yapıldı.

## 4. Açık ürün ve kalite boşlukları

### Görev tamamlama

- Ürün kapasitesi geniş fakat tek bir gerçekçi fixture zinciri bütün ekranları ve rolleri baştan sona kanıtlamıyor.
- Açık talep, seçili usta talebi, teklif, revizyon, kabul ve iş ekranları ayrı ayrı güçlü; kullanıcıya tek bir kesintisiz yol gibi davranıp davranmadıkları tekrar doğrulanmalı.
- Usta ve admin yüzeylerinde boş, bekleme, hata, süre dolumu ve yetkisiz durumların kapsaması eşit değil.

### UX/UI ve erişilebilirlik

- Wizard'ın uzun/koşullu içerikte klavye, 200% zoom, ekran klavyesi, reduced motion ve yardımcı teknoloji matrisi tamamlanmadı.
- Tasarım sistemi uygulanmış olsa da CSS katmanı hâlâ yüksek tekrar ve `!important` borcu taşıyor.
- Görsel hiyerarşi bazı çalışma alanlarında ana görev yerine harita, durum kartı veya tekrar eden güven metinleri tarafından bölünebiliyor.

### Kimlik ve güven

- Kayıt, mevcut e-posta, doğrulama bağlantısı, callback, parola sıfırlama ve rol bazlı dönüş tek bir gerçek tarayıcı paketiyle henüz kanıtlanmadı.
- Usta doğrulamasının belge türü, süre sonu ve kullanıcıya gösterilen rozet anlamı aynı sözleşmede tekrar incelenmeli.
- Admin uyuşmazlık kararının katılımcı ekranlarına yansıması, çekirdek R2 dışında ayrıca doğrulanmalı.

### Operasyon ve veri

- Notification worker uygulanmış olsa da staging dağıtımı, retry/dead-letter gözlemi ve operasyon runbook'u tamamlanmadı.
- Funnel, ilk teklif süresi, auth dönüş kaybı, duplicate koruması ve eşleşme kalitesi için karar verecek ürün panosu yok.
- Eşleşme ağırlıkları ve 26 hizmetin soru kalitesi gerçek talep diliyle kalibre edilmedi.
- Vinext test sunucusu başarılı koşulardan sonra zararsız görünen fakat gizlenmemesi gereken `ERR_STREAM_UNABLE_TO_PIPE` kapanış logu üretebiliyor.

## 5. Önceliklendirme modeli

Öncelik; kullanıcı etkisi, iş değeri, güven/yanlış işlem riski ve öğrenme değeri birlikte değerlendirilerek belirlenir. Efor, yüksek değerli bir işi ertelemek için değil, dilimi küçültmek için kullanılır.

| Öncelik | Dilim | Kullanıcı etkisi | İş/güven değeri | Yaklaşık efor | Karar |
| --- | --- | --- | --- | --- | --- |
| P0 | Kanıt ve repository gerçeği | Orta | Çok yüksek | Düşük | Hemen |
| P1 | Musluk Değişimi altın yol | Çok yüksek | Çok yüksek | Yüksek | P0 sonrası |
| P2 | Wizard dayanıklılığı ve erişilebilirlik | Çok yüksek | Yüksek | Orta | P1 ile kontrollü paralel olabilir |
| P3 | Pazaryeri anlaşma döngüsü UI'ı | Çok yüksek | Çok yüksek | Yüksek | P1 bulgularına göre |
| P4 | Hesap, güven ve operasyon | Yüksek | Çok yüksek | Yüksek | Çekirdek akışla birlikte |
| P5 | Gözlemlenebilirlik ve performans | Orta | Çok yüksek | Orta | P1 event sözleşmesiyle başlar |
| P6 | Katalog olgunlaştırma ve pilot hazırlığı | Orta | Orta | Yüksek | Veri geldikten sonra |

## 6. Yeni yol haritası

### P0 — Kanıtı ve commit sınırını sabitle — commit adayı hazır

Amaç: repository, test ortamı ve belgelerin aynı durumu anlatması.

- R2'de geçen M0–M4, cleanup, Realtime ve concurrency sonuçlarını tek kanıt kaydında birleştir.
- Untracked/modified Orkestra dosyalarını Umut Usta, `.vscode` ve diğer artefaktlardan ayır.
- Hedefli lint, type-check, test ve build'i son kaynak üzerinde tekrar çalıştır.
- Migration listesi, ortam, test hesap türleri, cleanup sonucu ve bilinen sınırları kaydet.
- R2'yi ayrı bir commit adayı yap; push ve yayın kararını ayrıca bırak.

Çıkış kriteri: tek değişiklik listesi, tek test özeti ve tek commit sınırı; eski kırmızı veya stale belge güncel gerçeği geçersiz kılmaz.

21 Eylül sonucu: kriter karşılandı ve [P0 repository/kanıt kaydında](P0-REPOSITORY-EVIDENCE-2026-09-21.md) belgelendi. Commit ve push ayrı kullanıcı kararıdır.

### P1 — `Musluk Değişimi` altın dikey yol

Amaç: ürünün değer önerisini tek bir hizmette eksiksiz ispatlamak.

Ana zincir:

`Keşif → wizard → giriş/kayıt → açık veya seçili usta → fırsat/davet → görüşme → teklif → revizyon → karşılaştırma → kabul → iş → mesaj/kapsam → tamamlama → yorum`

Yan zincir:

`Uyuşmazlık açma → kanıt → admin kararı → müşteri ve ustaya doğru durum`

- UI, API ve SQL'de aynı hizmet, zamanlama ve kapsam anlamını doğrula.
- Açık ve yönlendirilmiş talepte ikinci wizard üretmeden aynı çekirdeği kullan.
- Her geçişte loading, empty, error, retry, expired ve unauthorized durumunu tanımla.
- En fazla üç güncel teklifi; eski sürüm reddini ve tek iş oluşumunu doğrula.
- Fixture sonrası kayıt sayılarını ve erişim sınırlarını veritabanından kontrol et.

Çıkış kriteri: müşteri, onaylı usta ve gerekli yan akışta admin ile tek deterministic fixture zinciri sessiz `skip` olmadan tamamlanır.

### P2 — Wizard dayanıklılığı ve erişilebilirlik

Amaç: talep oluşturmanın bütün kullanıcılar için öngörülebilir olması.

- 320, 390, 820 ve 1440 px; kısa ve uzun viewport; ekran klavyesi; yatay/dikey yön kontrolleri.
- Klavye sırası, görünür focus, dialog odağı, 200% zoom, reduced motion ve temel ekran okuyucu isimleri.
- Koşullu soru geri dönüşü, doğrudan önceki adıma düzenleme, risk uyarısı, medya hatası ve konum kurtarma.
- Taslak devam/sil, auth dönüşü, hesap değişimi ve tek gönderim davranışı.
- Son özeti kademeli açıklama ile sade tut; fiş yalnız başarı sonrası makbuz olarak davranır.

Çıkış kriteri: ana görev düğmeleri kaybolmaz; hata girdiyi silmez; yardımcı teknolojiyle hizmet, konum, zaman ve gönderim anlaşılır.

### P3 — Pazaryeri anlaşma döngüsünü tamamla

Amaç: backend gücünü müşteri ve usta için anlaşılır bir anlaşma deneyimine dönüştürmek.

- Usta fırsatlarında “Bana özel” ve “Uygun açık talepler” ayrımı.
- Teklif ver, gerekçeyle reddet, süre dolumu ve müşterinin kontrollü genişletme kararı.
- Müşteri–usta çiftine özel görüşme; gönderiliyor, hata, yeniden dene, okunmamış ve reconnect.
- Revizyon isteği, v2/v3, değişiklik özeti, güncel teklif karşılaştırması ve eski sürüm engeli.
- Kabul edilen şartların iş ekranında değişmez referans olarak gösterilmesi.

Çıkış kriteri: her rol sıradaki eylemi ve talebin kimlere açık olduğunu anlayabilir; rakip ustaların özel verileri sızmaz.

### P4 — Kimlik, güven ve operasyon merkezi

Amaç: kullanıcı ve operasyon ekibinin manuel veritabanı müdahalesi olmadan güvenli çalışması.

- Müşteri/usta kayıt girişleri, mevcut e-posta davranışı, doğrulama callback'i, parola sıfırlama ve rol dönüşü.
- Navbar ve hesap merkezinde kimlik, profil, bölge, güvenlik ve çıkış hiyerarşisi.
- Usta başvurusu, belge türleri, eksik/iade/onay, doğrulama süresi ve görünür rozet sözleşmesi.
- Admin moderasyonu, uyuşmazlık kanıtı, karar gerekçesi, yaptırım ve katılımcı mesajı.
- Notification worker staging dağıtımı; retry, lease, idempotency ve dead-letter runbook'u.

Çıkış kriteri: kullanıcı hesap görevlerini ve admin ana kararlarını UI'dan tamamlar; yetki ve audit izi korunur.

### P5 — Ölçüm, hata yönetimi ve teknik sürdürülebilirlik

Amaç: ürün kararlarını gözleme ve hatadan kurtarmaya dayandırmak.

- Onay/rıza uyumlu funnel event sözleşmesi; hassas cevap veya açık adres taşımama.
- Genel public hata kodu, kullanıcı mesajı ve correlation ID standardı.
- İlk teklif süresi, talep terk noktası, auth dönüş kaybı, duplicate engeli, Realtime reconnect ve outbox göstergeleri.
- Uzun listelerde cursor/pagination; sorgu hatasını boş durumdan ayırma.
- Görsel boyutları, algılanan performans, CSS tekrarları ve Vinext kapanış logu için sahipli backlog.

Çıkış kriteri: temel akıştaki başarısızlık kullanıcıya, loga ve operasyon sahibine aynı correlation ile ulaşır; ana metrikler PII taşımadan üretilebilir.

### P6 — Katalog kalitesi ve kontrollü pilot hazırlığı

Amaç: kanıtlanan çekirdeği talep ve arz sinyaline göre genişletmek.

- Önce 3–5 yüksek değerli hizmette soru ağacı, risk, fiyat/kapsam dili ve usta arzını kalibre et.
- 26 hizmeti eşit anda derinleştirmek yerine gerçek hata ve talep hacmine göre sırala.
- Canlı arz bulunmayan hizmet/ilçeyi açıkça sınırla; sentetik profili gerçek arz gibi göstermeme.
- Pilot ilçeler, destek kapsamı, operasyon kapasitesi, rollback ve başarı eşiğini yazılılaştır.

Çıkış kriteri: ancak gerçek arz, görev tamamlama ve operasyon kapasitesi kanıtlandığında ayrı bir release/pilot planı hazırlanır.

## 7. Bilinçli olarak ertelenenler

- Ödeme, escrow veya platform içi para transferi
- Google Calendar/OAuth ve kesin randevu slotu
- Canlı GPS/usta konumu veya kesin mahalle pini
- M5 conversation-first inquiry
- Mesaj dosya ekleri ve geniş offline kuyruk
- Yeni şehirler ve Ankara'nın tamamı için kapsama iddiası
- 26 hizmetin tamamını aynı anda ileri teşhis ağacına dönüştürme
- Ana görevden önce gelen gösterişli scroll/fiş animasyonları

Bu işler reddedilmemiştir; çekirdek görev kanıtı ve öğrenme verisi oluşana kadar öncelik dışıdır.

## 8. Her dilim için kalite sözleşmesi

Her dilim şu aşamaları ayrı ayrı taşır:

`Planned → Implemented → Locally verified → Multi-account verified → Released`

- Kaynak kodun bulunması, özelliğin kullanılabilir olduğu anlamına gelmez.
- Yerel test, remote RLS veya Auth kanıtı değildir.
- Sentetik hesap, canlı pazar arzı değildir.
- Feature flag, doğrudan RPC yetkisini kapatmaz.
- Başarılı test, cleanup ve sunucu kapanışını gizleyemez.
- Her kanıtta commit, migration, ortam, persona, viewport, komut, sonuç ve bilinen sınır yer alır.
- Tasarım değişikliği; para, erişim, gizlilik, taslak sahipliği veya teklif sözleşmesini sessizce değiştiremez.

## 9. Başarı ölçümü

Ana ürün sonucu: platform üzerinden kabul edilip tamamlanan geçerli iş sayısı.

Yayın öncesi öncü göstergeler:

- Wizard başlatma → geçerli gönderim
- Auth dönüşünde korunan taslak
- Uygun profesyonel veya geçerli teklif bulunan talep
- İlk teklif süresi
- Görüşme/revizyon → kabul
- Kabul → iş başlangıcı → tamamlama

Koruyucu göstergeler:

- Yetkisiz erişim testi hatası
- Duplicate talep, mesaj, teklif veya iş
- Mobil/masaüstü görev tamamlama farkı
- Süresi geçmiş doğrulamayla işlem
- Bildirim retry/dead-letter derinliği
- Kritik erişilebilirlik ihlali

## 10. Sıradaki somut çalışma

İlk çalışma `P0` olmalıdır:

1. Geçen R2 kanıtını güncel kaynak ve migration listesiyle yeniden bağla.
2. Orkestra değişikliklerini unrelated çalışma ağacından ayır.
3. Hedefli kalite kapılarını son kez çalıştır.
4. R2 kanıtını ayrı commit adayı olarak sabitle.
5. Ardından P1 için `Musluk Değişimi` ekran–API–RPC–tablo durum envanterini çıkar ve ilk eksik dikey bağlantıyı uygula.

Bu aşamada flag açma, staging dışına yayın veya pilot başlatma yoktur.
