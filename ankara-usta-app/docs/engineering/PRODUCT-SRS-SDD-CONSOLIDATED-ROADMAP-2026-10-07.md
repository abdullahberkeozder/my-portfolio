# Orkestra — SRS/SDD bütünlük denetimi, pazar karşılaştırması ve yol haritası

**Tarih:** 7 Ekim 2026  
**Kapsam:** SRS, SDD, gereksinim izlenebilirliği, mevcut araştırma notları, kaynak kodu/test kayıtları ve benzer ürün/depoların karşılaştırması  
**Karar türü:** Planlama ve kanıt denetimi; bu rapor oluşturulurken uygulama veya veritabanı değişikliği yapılmadı.

## 1. Yönetici kararı

Orkestra, Ankara pilotuna odaklanan, müşteri–usta–operasyon rollerini ve tekliften işe kadar olan yaşam döngüsünü modelleyen güçlü bir pazaryeri çekirdeğine sahip. En değerli teknik kararlar; hizmete özel wizard sözleşmesi, Supabase RLS/RPC ile sahiplik sınırlarının veritabanında zorlanması, append-only teklif sürümleri, iş olaylarının zaman çizelgesi ve outbox worker tasarımıdır.

Buna karşılık SRS ve SDD’nin üst bilgisindeki **“Onaylandı & Eksiksiz Uygulandı”** ve **587 test / %100 başarılı / 31 migration** ifadesi güncel ürün kararını tek başına temsil edemez. Bu ifadeler bir hedef/rapor snapshot’ı olarak korunabilir; ancak release kararı için daha yeni gereksinim izlenebilirliği ve doğrulama kayıtları esas alınmalıdır. İzlenebilirlik dosyası zaten `verified`, `partial`, `planned` ayrımı yapıyor; bu rapor bunu release sözleşmesinin ana ekseni yapar.

**Yeni çalışma kuralı:** Her özellik için dört ayrı alan tutulacak: `Belirtildi` → `Kodlandı` → `Yerelde doğrulandı` → `İzole/çoklu hesapta doğrulandı` → `Yayınlandı`. Bir üst seviye kanıt yoksa alt seviye başarı yayınlanmış özellik gibi yazılmayacak.

## 2. Kaynak bütünlüğü denetimi

### 2.1 SRS neyi doğru tanımlıyor?

- Ankara pilot bölgesi ve dokuz ilçe sınırı açık.
- Customer, verified tradesperson, başvuru aşamasındaki usta, moderatör, admin ve worker rolleri ayrılmış.
- 26 hizmet, doğal dil sınıflandırma, dallanan wizard, draft/auth dönüşü, doğrudan/açık talep, kör teklif, teklif revizyonu, mesajlaşma, iş yaşam döngüsü, uyuşmazlık ve bildirim hedefleri tek ürün vizyonunda birleşiyor.
- KVKK, MYK, ETK, RLS, idempotency, concurrency ve outbox gibi risk alanları gereksinim seviyesinde görünür.

### 2.2 SDD neyi doğru tasarlıyor?

- C4 yaklaşımı, Next.js + Supabase + .NET worker sınırlarını anlaşılır biçimde ayırıyor.
- Domain state machine’leri UI’dan bağımsız tutma kararı doğru.
- `service_requests`, `quotes`, `jobs`, `job_events`, `notification_outbox` ve adres/kanıt tabloları için güvenlik sınırları tarifli.
- `accept_quote`, lease claim/result ve RLS/RPC davranışları için atomiklik hedeflenmiş.
- UI borç ratchet’i ve erişilebilirlik hedefi bir kalite kapısı olarak tanımlanmış.

### 2.3 Düzeltilmesi gereken doküman sözleşmesi

| Alan | Mevcut ifade | Kanıt temelli yeni yorum |
|---|---|---|
| SRS/SDD durum satırı | Eksiksiz uygulandı | Gereksinim ve hedef mimari tamam; uygulama kanıtı özellik bazında değişken |
| Test sayısı | 587 / %100 | Tarihli bir snapshot; güncel HEAD, remote ve browser sonuçları ayrıca yazılmalı |
| Migration sayısı | 31 | Repo/remote envanteri aynı commit ve ortamla bağlanmalı; tarihsel 29/29 kayıtlarıyla karıştırılmamalı |
| “WCAG AA” | Genel uyum izlenimi | Otomatik/klavye kanıtı var; NVDA/VoiceOver, 200% zoom ve gerçek cihaz kanıtı ayrı bekliyor |
| Worker | Tasarım ve sözleşme var | Staging deployment, lease recovery, dead-letter ve gerçek sağlayıcı gözlemi ayrı kanıtlanmalı |
| Harita/usta arzı | Ürün akışında bulunuyor | Public projection ve gerçek onaylı profil kaynağı ayrılmalı; sentetik veri ürün navigasyonuna sızmamalı |

## 3. Mevcut durum: çalışan, kısmi ve kanıtsız alanlar

### 3.1 Çalışan veya güçlü yerel temeli olanlar

- 26 hizmet taksonomisi, katalog bütünlüğü ve wizard tanımlarının runtime doğrulaması.
- Wizard’da gerekli sorular, modal odağı, arka plan scroll kilidi, auth dönüşü ve başarı fişi için bileşen/domain testleri.
- Supabase migration’ları, RLS politikaları ve rol temelli RPC tasarımı.
- Usta başvuru state machine’i ve onaysız ustanın teklif verememesi için server-side eligibility.
- Append-only teklif sürümü ve en fazla üç teklif karşılaştırma niyeti.
- İş state machine’i, kapsam değişikliği için iki taraflı onay ve dijital işçilik belgesi çekirdeği.
- Uyuşmazlık evidence/decision ayrımı, moderasyon audit zinciri ve district trust metrikleri.
- CI tanımı, lint/type/build ve yerel component/unit kapıları.

### 3.2 Kısmi veya sonraki kanıtı bekleyenler

- Sınıflandırmanın tüm doğal dil, Türkçe casing/alias ve düşük güven durumları.
- Tekrarlı gönderimin gerçek DB concurrency altında tek kayıt garantisi.
- Customer/professional/admin için authenticated cross-role RLS paketi.
- Verification expiry’nin scheduled cron ile gerçekten çalıştığının remote kanıtı.
- Matching skor bileşenlerinin DB projection’ı ve arz yok/az arz recovery UX’i.
- Kabul yarışının remote concurrency kanıtı ve kabul edilmiş sözleşmenin immutable snapshot’ı.
- Mesaj odasının iki kullanıcıyla gizlilik, yeniden gönderimde idempotency ve Realtime kopma/geri bağlanma kanıtı.
- Notification worker’ın staging’de claim → send → result, retry, dead-letter ve lease fencing gözlemi.
- U5 müşteri/usta taleplerinde partial-error, expired, unauthorized ve doğrudan iş bağlantısı matrisi.
- Gerçek tarayıcıda U3 filtre → profil → seçili usta → auth dönüşü → tek gönderim akışı.

### 3.3 Yapılmadığı veya ürün kararı gerektirdiği görülenler

- Gerçek ödeme/escrow sağlayıcı entegrasyonu ve iade/cancellation politikası.
- MYK/e-Devlet doğrulamasının dış sistemle otomatik entegrasyonu.
- Canlı pazar arzı, 5×5 hizmet–ilçe supply matrix’i, SLA ve conversion ölçümü.
- Merkezi analytics ingestion, SLO/alert dashboard ve işletim runbook’unun hedef ortamda provası.
- Harita üzerindeki tüm pinlerin yalnızca doğrulanmış profesyonel projection’dan gelmesi; localStorage/örnek pinlerin ürün akışından tamamen ayrılması.

## 4. 10 üretim ürünü karşılaştırması

Bu ürünler “özelliği kopyalama” değil, Orkestra’nın hangi güven ve görev sözleşmesini kanıtlaması gerektiğini görmek için referans alınmıştır.

| Ürün | Gözlenen model | Orkestra’ya çıkarım |
|---|---|---|
| [TaskRabbit](https://www.taskrabbit.com/how-it-works) | Hizmet/konum seç, doğrulanmış Tasker’ı fiyat ve yorumla karşılaştır, sohbet et, planla ve güvenli öde | Kartta ilk bakışta güven + fiyat + uygunluk; iş öncesi sohbet ve koruma politikası tek akışta görünmeli |
| [Thumbtack](https://www.thumbtack.com/how-it-works) | Arama, doğrulanmış yorumlar, mesajlaşma ve hire/book adımları | Liste CTA’sı tek olmalı; “profil incele” ile “talep başlat” anlamı ayrılmalı |
| [Airtasker](https://support.airtasker.com/hc/en-gb/articles/200919990-What-is-Airtasker) | Talep yayınlama, teklifleri alma, en uygun teklifi seçme | Açık talep ve özel talep sözleşmeleri görünür; teklif yaşam döngüsü müşteri diline çevrilmeli |
| [Angi](https://www.angi.com/landing/how-it-works) | Anlık/ön fiyat veya teklif karşılaştırma, screened pro, verified review, destek/garanti | “Tahmini” ve “kesin” fiyat ayrımı; garanti/cancellation metni teklif kabulünden önce açık olmalı |
| [Bark](https://help.bark.com/hc/en-us/articles/13342669635484-What-is-Bark-and-how-does-it-work) | Müşteri sorularını yanıtlar, eşleşen profesyoneller geri döner | Wizard soruları yalnız iç veri değil, usta teklifinin kalitesini artıran ortak sözleşme olmalı |
| [Handy](https://www.handy.com/services) | Kategori taksonomisi, ev hizmeti dikeyleri, uygun hizmete hızlı giriş | 26 hizmette isimlendirme, örnek kapsam ve dahil/hariç alanları sabit tutulmalı |
| [Urban Company](https://www.urbancompany.com/near-me) | Vetted provider, şeffaf fiyat, slot, review, safety/warranty/support | Uygunluk yalnız harita değil; slot, doğrulama ve garanti ile açıklanmalı |
| [Checkatrade](https://www.checkatrade.com/support/consumer/jobs/how-to-find-a-trade) | İş + postcode, uygun yerel liste, nitelik/yorum/iş örnekleri, çoklu quote | No-result recovery, yeterlilik kanıtı ve açık sonraki eylem zorunlu |
| [Airbnb](https://www.airbnb.com/help/article/39) | Liste/harita senkronu, filtreler, sıralama; harita ve liste sonuçlarının bağlama göre farklı olabileceği açıklanıyor | `view` URL ile kalıcı; aktif kart–pin, “bu bölgede ara”, cluster ve map/list farkı açıklanmalı |
| [HomeStars](https://www.homestars.com/) | Yerel trade profili, yorum ve yakınlık odaklı keşif | Hizmet bölgesi ve iş kanıtı, yalnız yıldızdan daha güçlü güven sinyali olmalı |

Ortak desen: güven iddiası rozetle değil, rozetin neyi doğruladığıyla birlikte gösteriliyor. Orkestra’da “doğrulanmış profil” yazısını tekrar etmek yerine tek ikon + açıklayıcı tooltip/detail paneli daha düşük bilişsel yük üretir; fakat backend projection kanıtı yoksa ikon gösterilmemeli.

## 5. 5 GitHub referans deposu

| Depo | Neden referans | Alınacak ders |
|---|---|---|
| [Sharetribe Developer Platform docs](https://github.com/sharetribe/dev-docs) | Hizmet, kiralama, mesajlaşma ve reverse-gig pazarlarını aynı headless altyapıda tarif ediyor | Public marketplace API ile trusted integration API ayrımı; kullanıcı tarayıcısına yalnız kendi verisini açma |
| [Cocorico](https://github.com/Cocolabs-SAS/cocorico) | Hizmet/kiralama marketplace’i için açık kaynak Symfony temeli | Listing lifecycle, booking ve operasyon davranışlarını UI’dan bağımsız state olarak modelleme |
| [Cal.diy / Cal.com](https://github.com/calcom/cal.com) | Next.js/Postgres/Prisma tabanlı zamanlama ürünü; E2E ve seed yaklaşımı görünür | Availability, timezone, seed hesap ve Playwright raporunu ürün sözleşmesinin parçası yapma |
| [Supabase](https://github.com/supabase/supabase) | Orkestra’nın Auth/Postgres/RLS/Realtime omurgası | RLS’yi her exposed tabloda zorunlu kılma, allow/deny DB testleri ve private Realtime channel kullanma |
| [ServiceHub](https://github.com/aftabmujawar/ServiceHub) | Yerel hizmet pazaryeri; müşteri, provider, booking, review ve admin akışlarını tek örnekte topluyor | Provider approval, city/pincode filtreleri, availability ve booking status’lerini ayrı API/domain katmanlarında tutma |

İkincil teknik karşılaştırma için [BookorRent](https://github.com/agriya/bookorrent), [Gig-Marketplace](https://github.com/Mortarion002/Gig-Marketplace) ve [booking-platform](https://github.com/francatania/booking-platform) incelenebilir; ancak bunlar Orkestra’ya doğrudan mimari temel değil, state machine, OSM ve event-driven notification fikirleri için örnektir.

Supabase’in kendi referansında RLS’nin exposed tablolarda her işlem için ayrı allow/deny testleriyle doğrulanması; Realtime’da private channel ve `realtime.messages` politikaları kullanılması öneriliyor. Bu, Orkestra’nın “RPC güvenli” iddiasını gerçek çoklu hesap ve Realtime kanıtına bağlayan doğrudan referanstır: [RLS rehberi](https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/database/postgres/row-level-security.mdx), [Realtime authorization](https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/realtime/authorization.mdx).

## 6. Ürün yönü ve önceliklendirme

### P0 — Kanıt ve güven sözleşmesi

1. SRS/SDD üst bilgisini “gereksinim/tasarım baseline’ı” olarak yeniden etiketle; güncel release durumunu ayrı verification kaydına bağla.
2. Canonical request/quote/job status sözlüğünü tek TypeScript + SQL kaynağı yap; UI kopyalarını bu sözlükten üret.
3. Public professional projection’ı yalnız approved + current verification kayıtlarından üret; harita/listede sentetik veya localStorage pin kabul etme.
4. 38/38 API hata standardı gibi iddiaları güncel HEAD üzerinde yeniden say; gerçek route envanteri ve test çıktısını commit’e bağla.
5. Migration hash/listesi, remote schema/function imzaları ve rollback/roll-forward prosedürünü aynı release-candidate kaydına koy.

**Çıkış:** SRS/SDD, RTM ve doğrulama raporu aynı commit’i ve aynı kanıt seviyesini gösteriyor; “published/released” iddiası yalnız remote smoke sonrası kullanılıyor.

### P1 — Golden Musluk ve U3 keşif dikey yolu

1. Gerçek doğrulanmış fixture: müşteri, onaylı usta, ikinci müşteri ve admin.
2. `wizard → auth return → aynı draft/usta/step → submit once` browser akışı.
3. `hizmet + ilçe → filtre → profil → seçili ustaya talep` akışı 320/390/820/1440 px.
4. Usta teklif ekranı, müşteri karşılaştırma/kabul, kabul sonrası iş detayına deterministik geçiş.
5. Harita yardımcı görünüm: aktif kart–pin eşleşmesi, “bu bölgede ara”, no-result ve tile hata durumları.

**Çıkış:** Her adım için video/screenshot değil, komut + ortam + hesap rolü + beklenen/gerçek sonuç kaydı var; başarısız veya skip sonuç “geçti” sayılmıyor.

### P2 — Güvenilirlik ve operasyon

1. M3 mesajlaşma: private room authorization, duplicate-safe retry, reconnect history.
2. M4 teklif: base-version stale guard, append-only diff summary, concurrent acceptance.
3. Notification worker: gerçek PostgREST read-only probe, sonra gönderimsiz claim/result provası, ardından kontrollü Resend sandbox/test hesabı.
4. Retry/dead-letter/lease recovery ve eski worker fencing’in staging kanıtı.
5. Dashboard: queue age, dead count, delivery failure, RLS denial, request funnel ve core Web Vitals.

### P3 — Pilot ve ürün öğrenmesi

1. Dokuz ilçede hizmet × ilçe arz matrisi; her hücrede approved supply, response time, quote rate ve completion rate.
2. No-supply recovery: “başka ustalardan teklif al”, bekleme listesi ve açık talep yönlendirmesi; özel talebin izinsiz açılmaması.
3. Cancellation, refund, warranty ve rework politikasını yasal incelemeyle netleştir.
4. Usta onboarding, belge expiry ve moderasyon için operasyon SLA’sı.
5. Pilot feature flag’lerini yalnız doğrulanmış ortamda aç; rollback tatbikatı yap.

### P4 — Görsel ve erişilebilirlik kalite kapısı

1. Usta kartlarında tek ana CTA, yıldız + yorum sayısı, tek doğrulama ikonu ve hizmet/bölge hiyerarşisi.
2. Hero/header gereksiz KVKK/acil destek metnini bağlama göre azalt; talep CTA’sını görev diline çevir.
3. Haritada pin, cluster, zoom, hata, loading ve boş durumlarını reduced-motion ile sınırla.
4. Keyboard focus, screen reader name/description, 200% zoom, 320/390 px ve gerçek mobil cihaz matrisi.
5. CSS debt ratchet’ini eşik yükseltmeden temizle; `transition: all`, tekrarlı override ve modal scroll borcunu azalt.

## 7. Özellik bazlı çalışma panosu

| Alan | Bugünkü karar | Sonraki ölçülebilir iş |
|---|---|---|
| Keşif | U3 kodlandı; browser/staging kanıtı ayrı tutulmalı | 4 viewport + klavye + no-result + gerçek fixture |
| Wizard | Sözleşme ve draft/auth dönüş temeli güçlü | Golden Musluk tek gönderim ve seçili usta korunumu |
| Auth/draft | Sahiplik kuralları var; hesap değişimi kanıtı kritik | A→B switch, remote restore, stale local draft temizliği |
| Matching | Domain scorer ve RPC var | DB projection, neden açıklaması, arz yok recovery |
| Quotes | Sürümleme ve üçlü karşılaştırma var | stale base + immutable accepted snapshot + race |
| Messages | Oda/RLS/idempotency tasarımı var | iki browser, reconnect, unread, forbidden participant |
| Jobs | State machine ve scope approval var | accepted quote → job detail yarışını browser’da doğrula |
| Maps | OSM ve Ankara görünümü mevcut | yalnız gerçek projection, privacy/cluster/tile error |
| Worker | Kod/contract test mevcut | staging deployment, lease/dead-letter/Resend kontrollü smoke |
| Analytics | Consent/PII filtre temeli var | merkezi ingestion, event trigger kanıtı, dashboard/SLO |
| Admin/dispute | DB audit ve projection güçlü | gerçek admin fixture, SLA ve karar açıklaması E2E |

## 8. Önerilen uygulama sırası

**İlk sprint:** P0.1 kaynak gerçekliği + canonical status sözlüğü + public professional projection.  
**İkinci sprint:** P1 Golden Musluk/U3 gerçek browser paketi ve dört viewport kanıtı.  
**Üçüncü sprint:** P2 mesajlaşma ve teklif concurrency; worker gönderimsiz staging provası.  
**Dördüncü sprint:** P3 arz/SLA/pilot kararları ve P4 erişilebilirlik/premium polish.  

Her sprint sonunda şu kayıt zorunlu: commit SHA, migration listesi/hash’i, çalıştırılan komutlar, ortam, hesap rolleri, pass/fail/skip ayrımı, bilinen sınırlar ve rollback adımı.

## 9. Sonuç

Orkestra’nın en büyük riski artık “hiçbir şey yok” değil; hedef tasarımın, yerel testin, tarihsel staging kanıtının ve canlı işletim kanıtının aynı cümlede eritilmesi. Ürün yönü şu olmalı: **önce güvenilir keşif ve görev tamamlama, sonra gerçek arz ve operasyon, en son premium polish.**

Bu raporun önerdiği ilk teknik değişiklik uygulama kodu değil, SRS/SDD/RTM arasındaki durum sözleşmesini güncel HEAD ile sabitlemektir. Ardından P1 Golden Musluk dikey yolu, gerçek hesap ve gerçek onaylı usta projection’ı ile yürütülmelidir. Bu iki kapı geçmeden yeni görsel özellik, ödeme veya canlı bildirim kapsamı açılmamalıdır.

### Kaynak notu

Üretim ürünleri için resmi ürün/help sayfaları; teknik referanslar için proje sahiplerinin GitHub depoları ve Supabase’in resmi dokümantasyon kaynakları kullanıldı. Üçüncü taraf GitHub depoları mimari ilhamdır; kalite, lisans ve güvenlik açısından Orkestra’ya otomatik olarak uygun kabul edilmez.

## 10. Route ve ekran envanteri

Bu bölüm `ankara-usta-app/app/**/page.tsx` dosyalarının ve ortak header/footer bağlantılarının güncel kaynak taramasından çıkarıldı. Bir `page.tsx` bulunması ekranın her durumda çalıştığını değil, route yüzeyinin kodda bulunduğunu gösterir. Her satırın release kanıtı ayrıca test matrisiyle bağlanmalıdır.

### 10.1 Public keşif, içerik ve referans alanları

| Route | Kullanıcı amacı | Ana eylem | İncelenecek kanıt/gap |
|---|---|---|---|
| `/` | İhtiyacı anlatmak veya hizmet seçmek | Hizmet bul / kategori seç | Hero, dialog, eşleşmeme, SEO, mobile CTA |
| `/ustalar` | Uygun ustaları keşfetmek | Filtrele, profil aç | Gerçek projection, boş/partial/error, list/map sync |
| `/ustalar/[id]` | Bir ustanın güven ve uygunluğunu anlamak | Profili incele / talep başlat | Verification açıklaması, bölge gizliliği, seçili usta korunumu |
| `/ustalar/[id]/talep` | Belirli ustaya özel talep başlatmak | Wizard’a devam | Feature flag, auth return, draft ownership, tek gönderim |
| `/harita` | Harita görünümünü açmak | Usta keşfine yönlenmek | Şu an `/ustalar?view=map` yönlendirmesi; footer ve başlık dili ile uyum |
| `/ankara/[district]/[service]` | İlçe/hizmet landing sayfası | Hizmet talebi veya usta dizini | SEO canonical, ilçe/hizmet sözlüğü, gerçek arz iddiası |
| `/nasil-calisir` | Sistemin nasıl çalıştığını öğrenmek | Hizmetlere/usta başvurusuna geçmek | SRS’deki garanti ve ödeme vaatleriyle gerçek kapsamın uyuşması |
| `/yardim` | Sorun çözmek ve destek almak | Yardım konusu veya iletişim | Her kritik hata için doğru recovery linki |
| `/gizlilik` | KVKK ve veri kullanımını anlamak | Rıza/ayarları incelemek | Harita, adres, mesaj ve analytics açıklamalarının güncelliği |
| `/kullanim-kosullari` | Platform kurallarını okumak | İlgili ürün akışına dönmek | Escrow, garanti, iptal ve uyuşmazlık iddiaları kanıtla eşleşmeli |
| `/usta-basvurusu` | Usta olarak başvurmak | Başvuru formunu tamamlamak | Kayıt/giriş dönüşü, belge upload, expiry ve moderasyon durumu |
| `/concepts` | Ürün yönleri ve tasarım araştırması | Referans yön seçmek | Ürün navigasyonundan ayrılmalı; canlı fonksiyon iddiası taşımamalı |
| `/concepts/harita` | Harita konseptini incelemek | Liste/split/map varyantını denemek | Sentetik pinler canlı ürün akışına bağlanmamalı; “örnek” dili tutarlı olmalı |
| `/concepts/harita/usta/[id]` | Konsept profil görünümünü görmek | Konsept talep CTA’sı | Gerçek usta/projection ile karışmamalı |
| `/inspiration` | Tasarım araştırma örneklerini görmek | Kaynak açmak | Dış link güvenliği, referans alanının ürün akışından ayrılığı |
| `/motif-lab` | Görsel motifleri incelemek | Tasarım yönünü değerlendirmek | Üretim sayfalarına yanlışlıkla import edilmemesi |

### 10.2 Kimlik ve hesap rotaları

| Route | Görev | Durum sözleşmesi | Öncelik |
|---|---|---|---|
| `/giris` | Müşteri girişi | `next` güvenli allowlist, hata halinde form korunur | P0 |
| `/kayit` | Müşteri kaydı | E-posta mevcut/kayıtlı kontrolü, doğrulama ve draft dönüşü | P1 |
| `/usta/giris` | Usta girişi | Usta bağlamı ve aynı `next` sözleşmesi | P1 |
| `/usta/kayit` | Usta kaydı | Rol seçimi, başvuruya geçiş, doğrulama maili | P1 |
| `/parola-yenile` | Parola yenileme | Token expiry, başarı/hata ayrımı, geri dönüş | P2 |
| `/hesap` | Profil, bölge, gizlilik, çıkış | Navbar hydration, müşteri/usta çalışma alanına dönüş | P0/P1 |

### 10.3 Müşteri görev rotaları

| Route | Görev | Ana durumlar | Doğrulama |
|---|---|---|---|
| `/taleplerim` | Talepleri izlemek | draft, submitted, matching, quotes received, selected, expired, cancelled | P1: boş/yükleniyor/partial/error ve gerçek hesap |
| `/taleplerim/[id]/teklifler` | Teklifleri karşılaştırmak | teklif yok, teklif geldi, kabul edildi, süresi doldu | P1/P2: en fazla üç, current version, profil linki |
| `/teklifler/[id]` | Teklif sürümünü okumak | current/legacy, revision feedback, stale base | P2: eski sürüm kabul edilemez |
| `/gorusmeler` | Görüşme odalarını görmek | unread, gönderim hatası, erişim yok | P2: hizmet adı ve bağlam, kısa UUID yerine anlamlı başlık |
| `/gorusmeler/[requestId]/[professionalId]` | Müşteri–usta mesajlaşması | sending, sent, failed, retry, reconnect | P2: private room ve başka ustaya sızıntı yok |
| `/islerim` | Kabul edilmiş işleri görmek | active, completed, disputed, empty/error | P1: güçlü CTA yalnız detayda |
| `/islerim/[id]` | İşin tamamlanmasını yönetmek | scope, dispatch, completion, review, dispute | P1/P2: accepted quote → detail yarışını doğrula |
| `/uyusmazliklar` | Kendi uyuşmazlıklarını izlemek | open, due soon, overdue, closed | P2: SLA gerçekliği ve kanıt yükleme |
| `/uyusmazliklar/[id]` | Uyuşmazlık dosyasını yönetmek | evidence, statement, decision, appeal | P2: katılımcı/internal note ayrımı |

### 10.4 Usta çalışma alanı

| Route | Görev | Ana durum | Öncelik |
|---|---|---|---|
| `/usta/talepler` | Bana özel ve uygun açık talepleri görmek | invited, open, expired, rejected, no-match | P1: özel talep kendiliğinden genelleşmemeli |
| `/usta/teklifler/[requestId]` | Teklif vermek/revize etmek | eligible, blocked, submitted, revision requested | P2: base version ve teklif geçmişi |
| `/usta/musaitlik` | Hizmet/bölge/slot ayarlamak | saved, validation error, unavailable | P1: matching’in gerçekten kullandığı kanıt |
| `/usta/basvuru` | Başvuru alias’ı | yönlendirme/legacy | P0: `/usta-basvurusu` ile canonical birleştirme |

### 10.5 Operasyon ve yönetim

| Route | Görev | Yetki | Kanıt ihtiyacı |
|---|---|---|---|
| `/yonetim/usta-basvurulari` | Başvuru ve belge moderasyonu | admin/moderator | actor, reason, audit, expiry |
| `/yonetim/basvurular` | Legacy alias | admin/moderator | canonical redirect ve link temizliği |
| `/yonetim/ustalar` | Legacy/özet yönetim rotası | admin/moderator | `/yonetim/usta-basvurulari` ile ayrım |
| `/yonetim/moderasyon` | İş görselleri/yorum kuyruğu | admin/moderator | boş kuyruk ve karar gerekçesi |
| `/yonetim/uyusmazliklar` | Uyuşmazlık kuyruğu | admin/moderator | SLA sıralaması, filtreleme, bulk işlem riski |
| `/yonetim/uyusmazliklar/[id]` | Operasyon dosyası | admin/moderator | internal note, katılımcı açıklaması, audit |
| `/yonetim/denetim-izi` | Değişiklik geçmişi | admin/moderator | pagination, actor identity, immutable read model |

### 10.6 Sistem durum rotaları

| Surface | Beklenen davranış | Eksik kontrol |
|---|---|---|
| `error.tsx` | Hata sonrası ana sayfaya veya yardıma dönmek | Route’a özel recovery ve kullanıcı girdisi korunumu |
| `not-found.tsx` | Geçersiz route’ta açık geri dönüş | Referer/context korunumu ve SEO status |
| `layout.tsx` | Skip link, global header/footer, consent | Auth hydration ve mobil çekmece focus kanıtı |
| API route handlers | Güvenli JSON hata sözleşmesi | Tüm gerçek route listesiyle 1:1 test ve status sözlüğü |

## 11. Link ve navigasyon bütünlüğü

### Bulgular

1. **Ürün ve konsept navigasyonu karışma riski:** `/concepts`, `/inspiration`, `/motif-lab` tasarım araştırma yüzeyleri. Bunlar header/footer’da ürün rotalarıyla aynı ağırlıkta görünürse kullanıcı canlı hizmet bulma akışından çıkar.
2. **Harita adlandırma riski:** `/harita` gerçek ürün dizinine yönleniyor; `/concepts/harita` ise konsept. Footer’daki “Ankara Usta Haritası” ifadesi bu ayrımı kullanıcıya açıklamıyor.
3. **Auth dönüş riski:** Birden fazla giriş rotası (`/giris`, `/usta/giris`) ve `next` parametresi var. Her link, `next`’in yalnız izinli internal path’lere gitmesini ve draft/service/target context’in korunmasını gerektiriyor.
4. **Alias riski:** `/usta/basvuru`, `/yonetim/basvurular`, `/yonetim/ustalar` gibi alias’lar erişilebilirlik ve analytics ölçümünü bölebilir.
5. **Aşırı geri bağlantı:** Birçok ekran “geri” linkiyle önceki route’a dönüyor; route doğrudan açıldığında bu geri bağlantının görevi belirsizleşiyor. Sabit “çalışma alanına dön” fallback’i gerekli.

### Navigasyon kalite kapısı

- Her public link: 200/redirect hedefi, canonical route, sayfa başlığı ve ana CTA ile eşleştirilecek.
- Her protected link: unauthenticated redirect, post-auth return, unauthorized state ve account-switch state test edilecek.
- Her dynamic link: geçersiz ID, expired entity, deleted/hidden entity ve role mismatch test edilecek.
- Her external link: `target`, `rel`, açık bağlam ve domain değişimi kullanıcıya bildirilecek.
- Her nav item: masaüstü header, mobil drawer, footer ve rol duyarlı menüde yineleniyorsa aynı route label’ını kullanacak.

## 12. Route bazlı yeni roadmap paketleri

### R0 — Route gerçeği ve canonical sözlük

**Çıktılar:** route manifest, canonical/alias tablosu, status dictionary, auth `next` allowlist, public/protected/ops route sınıfları.  
**Kabul:** Her `page.tsx` bir owner, ana görev, auth politikası, loading/error/empty durumu ve en az bir test dosyasına bağlanır.

### R1 — Discovery contract

**Kapsam:** `/`, `/ustalar`, `/ustalar/[id]`, `/harita`, `/ankara/[district]/[service]`.  
**Çıktılar:** gerçek professional projection, filtre URL’si, list/map sync, profile-to-request context, no-result recovery.  
**Kabul:** dört viewport, keyboard, fake/synthetic pin yok, seçili usta auth dönüşünde korunuyor.

### R2 — Account and draft contract

**Kapsam:** `/giris`, `/kayit`, `/usta/*`, `/hesap`, wizard.  
**Çıktılar:** müşteri/usta rol ayrımı, account A→B izolasyonu, remote draft restore, navbar hydration, trusted sign-out.  
**Kabul:** gerçek iki müşteri hesabı, aynı tarayıcı ve yeni sekmede draft karışmıyor.

### R3 — Request/quote/job contract

**Kapsam:** `/taleplerim*`, `/usta/talepler`, `/usta/teklifler*`, `/teklifler*`, `/islerim*`.  
**Çıktılar:** request state sözlüğü, teklif current version, stale base, atomic acceptance, job detail handoff.  
**Kabul:** müşteri + onaylı usta iki oturumlu Golden Musluk akışı; tek kabul ve tek iş.

### R4 — Conversation and trust contract

**Kapsam:** `/gorusmeler*`, job messages, `/uyusmazliklar*`, admin dispute routes.  
**Çıktılar:** private conversation, idempotent retry, unread/reconnect, evidence/decision scope, SLA.  
**Kabul:** başka usta mesaj görmüyor; bağlantı kesilip geldiğinde geçmiş tamamlanıyor; admin iç notu katılımcıya sızmıyor.

### R5 — Operations and notification contract

**Kapsam:** `/yonetim/*`, `.NET worker`, outbox, analytics.  
**Çıktılar:** claim/result lease fencing, retry/dead-letter, audit dashboard, SLO ve rollback runbook.  
**Kabul:** gönderimsiz smoke, sonra kontrollü test maili; eski worker devralınan lease’i sonuçlandıramıyor.

### R6 — Visual/accessibility release gate

**Kapsam:** tüm public ve authenticated ekranlar.  
**Çıktılar:** ortak type/spacing/action tokens, tek CTA hiyerarşisi, 8 interaction state, reduced motion, route-specific copy.  
**Kabul:** 320/390/820/1440, keyboard, screen reader smoke, 200% zoom, no horizontal overflow ve no fake trust copy.

## 13. Her route için kanıt şablonu

Yeni veya güncellenen her route şu kısa kaydı taşımalı:

```text
Route:
Audience/role:
Primary job:
Canonical URL / aliases:
Auth and ownership rule:
Loading / empty / partial / error / unauthorized states:
Primary CTA and recovery CTA:
Dependent migrations/RPCs:
Component/unit tests:
Browser/staging test:
Evidence commit + date:
Known limits:
```

Bu şablon doldurulmadan route “tamamlandı” kabul edilmeyecek. Böylece SRS hedefi, SDD tasarımı, RTM satırı, kod ve browser kanıtı aynı nesne üzerinden izlenebilir hale gelir.

## 14. Güncellenmiş sonraki adım

İlk uygulama dilimi artık genel bir UI polish değil, **R0 Route gerçeği ve canonical sözlük** olmalıdır. Sıra:

1. Route manifest ve alias listesini üret.
2. Her route’u public, authenticated-customer, authenticated-professional veya operations olarak etiketle.
3. Request/quote/job durumlarını tek sözlükten üret.
4. Header, footer, mobile drawer ve ekran içi linkleri canonical route’lara bağla.
5. R0 manifestini lint, type-check, route smoke ve link integrity testiyle doğrula.
6. Sonra R1 discovery ve R2 account/draft paketlerini gerçek fixture’larla çalıştır.

Bu sıralama, görsel iyileştirmeyi geciktirmek için değil, her görsel CTA’nın doğru route’a ve doğru yetki sözleşmesine bağlanmasını sağlamak içindir.

## 15. R0 uygulama kaydı (7 Ekim 2026)

### Uygulanan

- `app/lib/routeManifest.ts` ile canonical route manifesti oluşturuldu.
- Public, customer, professional, operations, auth ve reference audience sınıfları tanımlandı.
- Route auth sözleşmesi ve primary job alanı eklendi.
- `/harita`, `/usta/basvuru`, `/yonetim/basvurular` ve `/yonetim/ustalar` alias’ları açıkça kaydedildi.
- Dynamic App Router segmentlerini (`[id]`, `[requestId]`, `[professionalId]`) güvenli eşleyen `findRoute` eklendi.
- Auth dönüşleri için yalnız manifest-backed internal path kabul eden `isAllowedInternalPath` eklendi.
- Request, quote ve job durumları için `app/domain/statusDictionary.ts` oluşturuldu.
- Mevcut U5 request resolver, yeni request sözlüğünü kullanacak şekilde bağlandı; `completed` yalnız geriye dönük read-model durumu olarak korundu.
- Route ve status sözleşmesi için iki yeni birim test dosyası eklendi.

### Yerel doğrulama

Bundled Node `v24.19.0` ile çalıştırıldı:

```text
routeManifest.test.ts + statusDictionary.test.ts: 2 dosya, 6 test geçti
requestStatusResolver + navigationModel + authRedirect matrisi: 6 dosya, 50 test geçti
type-check: geçti
hedefli ESLint: geçti, 0 hata / 0 uyarı
```

Sistem PATH’inde bulunan Node `v20.20.0` ile proje wrapper’ı `EPERM lstat C:\\Users\\a-ber` hatası verdi. Bu nedenle R0 sonucu Node 20 ile yeşil kabul edilmemeli; CI ve geliştirici runbook’unda Node `>=22.13.0` zorunluluğu görünür hale getirilmelidir.

### R0’da henüz yapılmayanlar

- Manifest henüz dosya sistemiyle otomatik karşılaştırılmıyor; eksik `page.tsx` veya manifestte fazladan route için CI kapısı eklenmeli.
- Header/footer/mobile drawer bağlantıları henüz manifestten türetilmiyor; metin ve link tekrarları devam ediyor.
- `authRedirect.ts` güvenlik filtresi manifest ile birlikte çalışıyor ancak tüm alias/canonical dönüşlerinin browser kanıtı henüz yok.
- API route’ları ve Supabase RPC’leri route manifestine dahil edilmedi; ayrı API contract manifesti P0.2 olarak kalıyor.
- Route başlığı, loading/empty/error/unauthorized durumları henüz makine-okunur alanlar olarak tutulmuyor.

**R0 durumu:** `Uygulandı → Yerel doğrulandı → Çoklu hesap doğrulaması bekliyor → Yayınlanmadı`.

## 16. R1 keşif ve harita sözleşmesi (7 Ekim 2026)

### Uygulanan

- `app/lib/discoveryContract.ts` ile `/ustalar` keşif URL’sinin tek sözleşmesi oluşturuldu: `service`, `district`, `view`, `sort` ve `page` parametreleri normalize ediliyor.
- Liste, bölünmüş ekran ve harita görünümleri artık aynı canonical query sırasını kullanıyor; görünüm ve sıralama, varsayılan olsalar bile paylaşılabilir URL’de korunuyor.
- Filtre değişiminde sayfa 1’e güvenli dönüş, görünüm/sıralama korunumu ve geçersiz hizmet/ilçe değerlerinin reddi ortak yardımcıya taşındı.
- `/ustalar` server page’i ad hoc query parsing yerine keşif sözleşmesini kullanıyor; pagination bağlantıları aynı `baseHref` üzerinden üretiliyor.
- Harita/list istemcisi filtre, görünüm ve sıralama yazarken aynı sözleşmeyi kullanıyor; hızlı ardışık filtre değişikliklerinde eski URL snapshot’ının üzerine yazma riski azaltıldı.
- Usta harita işaretçileri `verified_public_projection` kaynağı, `district`/`neighborhood` hassasiyeti ve `approximate_service_area` açıklamasıyla işaretlendi. Popup ve erişilebilir alternatif metin artık canlı GPS veya kesin adres izlenimi vermiyor.

### Yerel doğrulama

Bundled Node `v24.19.0` ile çalıştırıldı:

```text
discoveryContract + ustaCoordinates + routeManifest + statusDictionary: 4 dosya, 16 test geçti
UstalarSplitView + publicProfessionalDirectoryContract + ustaCoordinates: 3 dosya, 32 test geçti
type-check: geçti
hedefli ESLint: geçti, 0 hata / 0 uyarı
```

R1 browser paketi de bundled Node `v24.19.0` ile production Vinext üzerinde çalıştırıldı:

```text
tests/staging/u3-responsive.spec.ts — u3-chromium: 4/4 geçti
320, 390, 820 ve 1440 px — filtre, URL görünümü/sıralaması, geri-yenileme ve harita/list senkronu doğrulandı
```

### R1’de henüz yapılmayanlar

- Supabase staging’de gerçek doğrulanmış professional projection ve yaklaşık bölge verisiyle ayrı remote browser kanıtı alınmadı; mevcut sonuç production build üzerindeki yerel Vinext kanıtıdır.
- 320/390/820/1440 viewport temel akışı geçti; klavye ile tam liste–pin traversalı ve harita tile hata/boş durumları ayrı kalite senaryosu olarak kalıyor.
- Profil → seçili ustaya talep → auth dönüşünde keşif query’sinin ve hedef usta bağlamının korunması gerçek hesapla doğrulanmalı.
- `/ankara/[district]/[service]` SEO yüzeyi ile `/ustalar` sözleşmesinin canonical link/metadata birleşimi henüz tamamlanmadı.

7 Ekim remote denemesi: `verify-staging-discovery.mjs` hedef ref/URL kontrolünü geçti ancak publishable `E2E_SUPABASE_KEY` sağlanmadığı için Supabase CLI’dan anahtar çözümleyemedi. CLI ayrıca kullanıcı profilindeki telemetry geçici dosyasına yazma izni olmayan bir ortamda çalıştığından RPC çağrısına geçilmedi; staging verisi hakkında sonuç çıkarılmadı.

Yerel production browser denemesinde `/ustalar` RPC erişimi bulunmadığı için sayfa güvenli hata yüzeyini gösterdi; bu sonuç usta sayısının sıfır olduğu şeklinde yorumlanmamalı. Kart/klavye ve harita tile kanıtı, gerçek projection erişimi olan staging browser koşusuna bırakıldı.

**R1 durumu:** `Uygulandı → Yerel doğrulandı → Staging/browser doğrulaması bekliyor → Yayınlanmadı`.

## 17. R0 kapanış dilimi — manifest CI ve canonical navigasyon (7 Ekim 2026)

### Uygulanan

- `tests/unit/routeManifestFilesystem.test.ts` eklendi. `app/**/page.tsx` rotaları manifest ile birebir karşılaştırılıyor; fiziksel legacy route’lar yalnız açık alias sözlüğüyle geçebiliyor.
- `routes:check` npm komutu eklendi ve genel `quality` zincirine bağlandı. Yeni bir page route’u manifest dışında kaldığında veya manifestte fiziksel karşılığı olmayan canonical route eklendiğinde CI başarısız olacak.
- `canonicalRoute()` helper’ı ile manifest-backed href üretimi eklendi; alias’lar ortak navigasyona sızmadan canonical hedefe çözülüyor.
- `navigationModel.ts`, `AppHeader.tsx` ve `AppFooter.tsx` ortak canonical route sözlüğünü kullanıyor. Masaüstü header, mobil çekmece, hesap paneli ve footer arasında route yazım farkı azaltıldı.
- Harita footer bağlantısı legacy `/harita` yerine canonical `/ustalar?view=map` olarak çözülüyor; kullanıcıya görünen etiket korunuyor.
- `app/lib/apiRouteManifest.ts` ile `app/api/**/route.ts` yüzeyleri de ayrı API sözlüğüne alındı; audience ve primary job alanları zorunlu hale getirildi.
- `apiRouteManifestFilesystem.test.ts`, yeni veya eksik API route’larını `routes:check` CI kapısında yakalıyor.
- `/ustalar` veri kaynağı hata yüzeyi aynı keşif bağlamını koruyan `Yeniden dene`, `Harita görünümünü aç` ve ana sayfaya dönüş seçenekleriyle tamamlandı; sessiz “0 usta” durumu üretilmiyor.
- `/ankara/[district]/[service]` SEO landing sayfasındaki “Doğrulanmış Ustaları Gör” CTA’sı artık hizmet, ilçe, `view=split` ve `sort=recommended` parametrelerini tek keşif sözleşmesiyle `/ustalar` dizinine taşıyor.

### Yerel doğrulama

Bundled Node `v24.19.0` ile çalıştırıldı:

```text
routeManifest + routeManifestFilesystem + apiRouteManifestFilesystem + navigationModel: 4 dosya, 13 test geçti
type-check: geçti
hedefli ESLint: geçti, 0 hata / 0 uyarı
```

**R0 kapanış durumu:** `Uygulandı → Yerel doğrulandı → Çoklu hesap/browser doğrulaması bekliyor → Yayınlanmadı`.

## 18. R2 hesap–taslak sözleşmesi için yerel kanıt (7 Ekim 2026)

### Kontrol edilen yüzeyler

- Hesap değişiminde taslak sahibinin ve wizard yanıtlarının karışmaması.
- Giriş/kayıt dönüşünde aynı taslağın, aynı hizmetin ve aynı wizard adımının korunması.
- Hesap özetinin ve navbar kimliğinin auth durumu ile tutarlı kalması.
- Taslak silme, yeniden başlatma ve yetkisiz hesap sınırlarının kullanıcı girdisini kaybetmeden çalışması.

### Yerel doğrulama

Bundled Node `v24.19.0` ile aşağıdaki component paketi çalıştırıldı:

```text
tests/component/AccountDraftBoundary.test.tsx
tests/component/DirectedRequestWizard.test.tsx
tests/component/RequestWizard.test.tsx
tests/component/AccountSummary.test.tsx
tests/component/AccountManagement.test.tsx
tests/component/AuthForm.test.tsx

6 test dosyası · 51 test geçti
```

İlk browser koşusunda 320 px görünümde gizlilik banner’ının `Reddet` düğmesi sabit destek kapsülü tarafından örtülüyordu. Consent görünürken destek kapsülünü kaldıran body durum sözleşmesi ve consent katmanını yükselten stil eklendi. Üretim build sonrasında `tests/e2e/quick-service-resume.spec.ts` 3 hizmet × 4 genişlik (320/390/820/1440) olmak üzere **12/12 geçti**; E2E sunucusu portu da teardown’da serbest bırakıldı. Bu paket yerel auth’suz taslak resume davranışını kanıtlar; gerçek giriş dönüşü ve müşteri A → B izolasyonu hâlâ staging fixture’ı ile çalıştırılmalıdır.

Staging doğrulaması için gerekli `E2E_SUPABASE_KEY` gizli tutulmalıdır; anahtar sohbete veya repoya yazılmamalı, yalnızca süreç ortamından sağlanmalıdır. Anahtar olmadan remote RPC veya gerçek hesap sonucu hakkında çıkarım yapılmaz.

TypeScript type-check ve ConsentBanner hedefli ESLint de geçti. **R2 durumu:** `Uygulandı → Yerel component + browser resume doğrulandı → Browser/staging çoklu hesap doğrulaması bekliyor → Yayınlanmadı`.

R2 kapanışına ek yerel UI smoke kanıtı:

```text
tests/e2e/local-ui-smoke.spec.ts
tests/e2e/p8-visual-quality.spec.ts

8 test geçti — landing discovery, split directory, 320/390/820/1440 px taşma,
URL görünüm durumu ve klavye odağı.
```

Bu sonuçlar staging kimlik doğrulamasını veya gerçek Supabase projection verisini temsil etmez; yalnızca production build üzerindeki yerel kullanıcı yüzeyini doğrular.

Staging runner da süreç ortamı anahtarlarını öncelikli kullanacak şekilde güncellendi. `E2E_SUPABASE_KEY` (publishable) ve `E2E_SUPABASE_SERVICE_ROLE_KEY` (secret) sağlanırsa anahtarlar dosyaya yazılmadan build ve account-recovery browser paketi çalışır; yalnız bu değişkenler geçerli değilse Supabase CLI geri dönüşü denenir. Runner sözdizimi kontrolü geçti.

U4 account-switch runner’ı da aynı env-first sözleşmesine getirildi; böylece müşteri A → müşteri B taslak izolasyonu testi CLI telemetry/profil yazma izinlerine bağlı kalmaz.

Geniş Vitest taramasında durum rozetleri için eski başlık biçimi beklentisi ile sözlükteki küçük harfli etiketler arasında uyumsuzluk bulundu. `Ustalar Aranıyor`, `Teklifler Geldi`, `Usta Seçildi` ve `Süresi Doldu` etiketleri sözlükte test ve UI sözleşmesiyle eşitlendi; `CustomerRequestsPage` + `RequestStatusBadge` paketi **12/12 geçti**. Tam Vitest suite’i bu koşuda süre sınırına takıldığı için genel yeşil olarak kaydedilmedi.

Gerçek staging kanıtı: `npm run test:remote:account-recovery` çalıştırıldı ve parola kurtarma + hesap erişimini koruma senaryosu **1/1 geçti**. Staging build tamamlandı, test sonrası normal yerel build geri yüklendi. Koşu sırasında Vinext `ERR_STREAM_UNABLE_TO_PIPE` logu üretildi; bu test sonucunu bozmadı ancak sunucu kapanış/yanıt akışı borcu olarak açık tutuluyor.

Bu koşu U4 hesap değişimi paketi değildir. U4 kanıtı için aynı süreç ortamı anahtarları korunarak `npm run test:remote:u4` ayrıca çalıştırılmalıdır.

Gerçek staging U4 kanıtı: `npm run test:remote:u4` çalıştırıldı ve aşağıdaki iki senaryo **2/2 geçti**:

- Hesap merkezi: görünen ad + şehir güncellemesi, navbar yenilemesi ve çıkış.
- Aynı tarayıcıda müşteri A → müşteri B → müşteri A: taslak anahtarı ve uzak sahiplik izolasyonu.

Bu koşuda da Vinext `ERR_STREAM_UNABLE_TO_PIPE` birden fazla kez loglandı; E2E assertion’larını bozmadı ve sunucu portu teardown’da serbest kaldı. U4 işlevsel olarak staging’de doğrulandı, ancak stream warning’i giderilmeden release kapısı kapanmış sayılmamalıdır.

Kontrollü karşılaştırma: `PLAYWRIGHT_NO_COMPRESSION=1 npm run test:remote:u4` ile aynı U4 paketi tekrarlandı; **2/2 geçti**, fakat aynı stream warning’i yeniden oluştu. Uyarı compression katmanına özgü değil. Sıradaki teşhis, `sendWebResponse` çağrısına ulaşan isteğin URL/metodu ile tarayıcı kapanış zamanını ilişkilendirmek ve beklenen client-abort durumlarını hata logundan ayırmaktır.

Teşhis için `scripts/start-vinext-no-compression.mjs` içine isteğe bağlı stream diagnostics eklendi. `PLAYWRIGHT_STREAM_DIAGNOSTICS=1` verildiğinde yalnız sorgusuz metod/yol, response finish veya client-abort zamanı ve güvenli hata kodu loglanır; anahtar, cookie ve response gövdesi yazılmaz. Değişiklik sözdizimi ve diff kontrolünden geçti.

Yerel 320 px resume senaryosu diagnostics ile çalıştırıldı; tüm statik asset’ler ve `/api/account/summary`, `/api/tradespeople/featured` yanıtları `finished` olarak tamamlandı ve warning oluşmadı. Bu, problemin genel static stream katmanında olmadığını; auth/staging browser navigasyonlarında kapanan bir yanıtla ilişkili olduğunu gösteren ön kanıttır.

U4 staging testlerine de isteğe bağlı browser lifecycle diagnostics eklendi. `PLAYWRIGHT_STREAM_DIAGNOSTICS=1` iken yalnızca sorgusuz navigasyon yolları ve başarısız browser istekleri loglanır; credentials ve query parametreleri dışarı çıkmaz. Type-check geçti.

Staging diagnostics ile kök neden doğrulandı: `GET /api/account/summary` istekleri hesap sayfası navigasyonu sırasında client tarafından `net::ERR_ABORTED` ile kapanıyor; Vinext aynı kapalı yanıt gövdesine yazmaya çalışırken `ERR_STREAM_UNABLE_TO_PIPE` logluyor. `AppHeader` ve hesap formunun ayrı `useAccountSummary()` örnekleri aynı isteği yarışa sokuyordu. Hook artık modül düzeyinde in-flight istek tekilleştirmesi kullanıyor; auth/hesap değişiminde zorunlu yenileme korunuyor, son tüketici ayrıldığında eski promise temizleniyor.

Kök düzeltme sonrası `AccountSummary`, `AccountManagement` ve `CustomerRequestsPage` paketi **23/23**, 320 px browser resume smoke **1/1** geçti. U4 staging sonucu işlevsel olarak 2/2 yeşildir; warning’in yeniden oluşmadığını doğrulamak için staging U4 paketi bir kez daha çalıştırılmalıdır.

Son kontrollü U4 koşusu (`PLAYWRIGHT_NO_COMPRESSION=1 PLAYWRIGHT_STREAM_DIAGNOSTICS=1 npm run test:remote:u4`) **2/2 geçti**. Bu koşuda `[vinext] Server error: ERR_STREAM_UNABLE_TO_PIPE` görülmedi; dolayısıyla hesap özeti istek tekilleştirmesi mevcut U4 navigasyon yolundaki stream warning’ini kapattı. Diagnostics çıktısında kalan `net::ERR_ABORTED` kayıtları `/hesap` ve ilgili yönlendirme isteklerinin tarayıcı tarafından yeni sayfaya geçiş sırasında iptal edildiğini gösteriyor; bunlara karşılık gelen Vinext sunucu yazma hatası yok. Bu kayıtlar beklenen istemci yaşam döngüsü sinyali olarak ayrı tutulmalı, sunucu regresyonu sayılmamalıdır.

**Güncel U4 durumu:** `Uygulandı → Yerel doğrulandı → Staging çoklu hesap doğrulandı (2/2) → Stream uyarısı bu yol için kapatıldı → Yayınlanmadı`. Account-recovery paketi önceki koşuda warning üretmişti; aynı hook düzeltmesinin parola kurtarma akışında da temiz olduğunu kanıtlamak için diagnostics açık tek bir yeniden koşu hâlâ önerilir. Diagnostics varsayılan olarak kapalıdır ve yalnızca teşhis gerektiğinde açılmalıdır.

Account-recovery yeniden koşusu kontrollü olarak denendi. Staging API envanterinde modern `sb_secret_…` anahtar mevcut, ancak proje legacy `service_role` anahtarını devre dışı bıraktığı için Supabase Auth Admin `generateLink` ve `updateUserById` çağrıları modern secret ile `Invalid API key`/`401` döndürüyor. Test build’i tamamlanıp sunucu kapatıldı; bu nedenle bu paket **başarılı kanıt olarak kaydedilmedi** ve yayın kapısı açılmadı. U4 hesap değişimi paketi için bu engel yoktur; account-recovery için ya Auth Admin’i destekleyen izole test yetkisi ya da Supabase’in modern secret anahtarını Auth Admin uçlarında kabul ettiği doğrulanmış bir proje ayarı gerekir. Hiçbir anahtar değeri rapora veya repoya yazılmadı.

Yetki sözleşmesi ayrıca salt-okunur probe ile sınandı: modern secret anahtarı yalnız `apikey` başlığında kullanılarak `GET /auth/v1/admin/users?limit=1` çağrısı **401** döndürdü. Bu, hatanın parola cleanup’ına özgü olmadığını ve staging projesinde Auth Admin yüzeyinin modern secret ile erişilemediğini kanıtlar. Test bu nedenle sessizce `skip` edilmemeli; staging yetkisi düzeltilene kadar açık blokaj olarak kalmalıdır.

Runner güvenliği için account-recovery komutuna aynı salt-okunur Auth Admin ön kontrolü eklendi. Probe başarısızsa build, Playwright, e-posta gönderimi ve parola değişikliği başlamadan şu açık hata verilir: `Staging Auth Admin is unavailable ... HTTP 401`. Ön kontrol staging’de çalıştırılarak doğrulandı; süreç kontrollü biçimde kod 1 ile sonlandı.

İzole staging’de legacy JWT tabanlı API anahtarları geçici olarak yeniden etkinleştirildikten ve runner Auth Admin için JWT başlığını doğru kullandıktan sonra account-recovery browser paketi yeniden çalıştırıldı: **1/1 geçti**. Gerçek recovery linki açıldı, geçici parola ile giriş doğrulandı, aynı tarayıcı oturumunda özgün parola geri yüklendi ve son özgün parola girişi doğrulandı. `PLAYWRIGHT_NO_COMPRESSION=1` ve stream diagnostics açıkken `ERR_STREAM_UNABLE_TO_PIPE` oluşmadı. Normal yerel build test sonrasında geri yüklendi. Legacy anahtarlar yalnız bu staging testi için açık bırakıldı; release öncesi tekrar kapatılmalıdır.

Test sonrası legacy JWT anahtarları Supabase Dashboard üzerinden tekrar devre dışı bırakıldı; API Keys ekranı yeniden `Re-enable JWT-based API keys` durumunu gösteriyor. Böylece account-recovery kanıtı tamamlanırken staging projesi yüksek yetkili legacy anahtarları açık bırakılmadan güvenli varsayılana döndü.

Legacy anahtarlar kapalı durumdayken U4 runner yeniden denendi. CLI’den alınan modern `sb_secret_…` anahtarıyla `GET /rest/v1/tradespeople_profiles?select=user_id&limit=1` probe’u hem yalnız `apikey` hem de `apikey + Authorization` başlıklarıyla **401** döndürdü; browser fixture’ı başlamadı ve staging verisi değişmedi. Bu, mevcut modern secret’ın bu staging projesinin Data API’sinde kabul edilmediğini gösteren açık bir yapılandırma kanıtıdır. U4’ü yeniden yeşile almak için yeni/aktif bir secret anahtarının doğrulanması veya yalnız test süresince legacy JWT’nin tekrar açılması gerekir; release durumu değişmez.

### 2026-10-08 — Güvenli anahtar aktarımı sonrası U4 kapanış kanıtı

Yeni secret anahtarı PowerShell’de `Read-Host -AsSecureString` ile süreç ortamına aktarıldı; anahtar dosyaya veya sohbete yazılmadı. `PLAYWRIGHT_NO_COMPRESSION=1` ve `PLAYWRIGHT_STREAM_DIAGNOSTICS=1` ile `npm run test:remote:u4` yeniden çalıştırıldı:

- U4 browser paketi: **2/2 geçti**.
- Hesap merkezi: görünen ad + şehir güncellemesi, navbar yenilemesi ve çıkış geçti.
- Aynı tarayıcıda müşteri A → müşteri B → müşteri A taslak izolasyonu geçti.
- `ERR_STREAM_UNABLE_TO_PIPE`: **oluşmadı**.
- Kalan `net::ERR_ABORTED` kayıtları `/hesap` ve yönlendirme navigasyonlarının tarayıcı tarafından iptal edilmesine ait; eşleşen Vinext sunucu yazma hatası yok.
- Staging anahtarları test sonunda süreç ortamından temizlendi; normal yerel build yeniden başarılı.

Bu koşuyla U4 hesabı **staging çoklu hesap doğrulandı** ve ilgili stream uyarısı bu yol için kapatıldı. Account-recovery kanıtı ayrı yetki sözleşmesine bağlı kalmaya devam eder; modern secret ile Auth Admin erişimi hâlâ 401 verdiği için legacy anahtarlar kapalıyken yeniden çalıştırılamaz. Yayın kararı bu raporun kapsamı değildir.

### 2026-10-08 — U5 yerel durum ve rol matrisi

U5 müşteri/usta çalışma alanlarının erişim, durum ve hata sözleşmeleri hedefli Vitest paketleriyle yeniden doğrulandı:

- `requestStatusResolver`, `CustomerRequestsPage` ve `TradespersonRequestsPage`: **3 dosya, 30/30 test geçti**.
- `authReleaseMatrix`, `WorkspaceSkeleton`, `AccountManagement` ve `RequestInvitationPanel`: **4 dosya, 43/43 test geçti**.
- Kapsanan başlıklar: expired/cancelled recovery CTA’ları, müşteri ve usta rol ayrımı, unauthorized yönlendirme, loading/empty yüzeyleri ve süresi dolmuş özel davetin otomatik genişlememesi.
- İlk sandbox koşusu Vitest geçici dosya rename `EPERM` nedeniyle 0 test ile durdu; aynı komut sandbox dışı tekrarlandığında yukarıdaki sonuç alındı. Bu bir ürün testi hatası değil, çalıştırma ortamı kısıtıdır.

U5 durumu: **yerel sözleşme doğrulandı**. Gerçek staging hesaplarıyla `/taleplerim`, `/usta/talepler`, expired/unauthorized/partial-error ve doğrudan iş bağlantısı tarayıcı kanıtı henüz alınmadı; bu nedenle U5 yayınlandı kabul edilmez. Sonraki döngü, mevcut güvenli staging anahtarlarıyla U5 browser paketinin eklenmesi/çalıştırılması ve ardından notification worker doğrulamasıdır.

U5 gerçek tarayıcı kapısı için `playwright.u5.config.ts`, `scripts/run-u5-browser.mjs` ve `tests/staging/u5-workspaces-browser.spec.ts` eklendi. Runner yalnız süreç ortamından sağlanan publishable/secret anahtarları kabul eder, staging hedefini fail-closed doğrular ve veri yazmaz. Browser paketi müşteri çalışma alanı + usta alanına gerçek giriş, müşteri hesabının usta alanındaki güvenli reddi ve rol çalışma alanlarının ayrışmasını kontrol eder. Runner sözdizimi ve diff kontrolü geçti; staging koşusu kullanıcı terminalindeki güvenli anahtarlarla bekliyor.

Gerçek staging U5 koşusu tamamlandı: `npm run test:remote:u5` **2/2 geçti**. Müşteri oturumunda `/taleplerim` açıldı ve `/usta/talepler` erişimi güvenli müşteri alanı yönlendirmesiyle reddedildi; onaylı usta oturumunda `/usta/talepler` açıldı ve `/taleplerim` ayrı müşteri çalışma alanı olarak kaldı. Her iki oturum da güvenilir çıkışla sonlandı. Build ve teardown başarılı; `ERR_STREAM_UNABLE_TO_PIPE` veya buna eşlik eden server yazma hatası görülmedi. Bu kanıt U5’ün temel rol/çalışma alanı tarayıcı kapısını staging’de doğrular.

**Güncel U5 durumu:** `Uygulandı → Yerel sözleşme 73/73 → Staging browser rol/alan doğrulandı 2/2 → Yayınlanmadı`. Expired/partial-error/doğrudan iş bağlantısı ayrıntılarının gerçek fixture’lı browser kanıtı hâlâ ayrı bir genişletme dilimidir; component sözleşmesi bu durumları kapsar.

### 2026-10-08 — Notification worker gönderimsiz sözleşme kapısı

`AnkaraUsta.NotificationWorker.Tests` gönderimsiz contract paketi sandbox dışı geçici HTTP portuyla yeniden çalıştırıldı. İlk sandbox koşusu socket 10013 nedeniyle başlamadan durdu; ikinci koşu başarılıdır:

- Health HTTP sözleşmeleri: 8 yapılandırma vakası, liveness/readiness ve redaction geçti.
- Provider failure, eksik alıcı ve shutdown cancellation sözleşmeleri geçti.
- Lease generation forwarding, RPC payload ve tek acknowledgement sözleşmeleri geçti.
- Modern Secret API key için yalnız `apikey` başlığı ve salt-okunur REST probe sözleşmesi geçti.
- Sonuç: **Notification worker contract tests passed.** Bu koşuda gerçek Supabase RPC, outbox claim veya Resend e-postası çalıştırılmadı.

Worker durumu: **yerel contract doğrulandı**. Gerçek staging claim/result, retry/dead-letter ve lease recovery provası ile kontrollü test e-postası hâlâ ayrı ve açıkça yetkilendirilmiş bir adım olarak bekliyor.

Gönderimsiz staging rehearsal tamamlandı: `E2E_ALLOW_STAGING_WRITES=true node scripts/run-notification-rehearsal.mjs` retry, dead-letter, stale-owner/generation rejection, recovery ve cron sözleşmelerini geçti; ayrı bağlantıdan rollback cleanup doğrulandı. Worker veya Resend başlatılmadı.

İki bağlantılı concurrency provası (`node scripts/run-notification-concurrency.mjs`) fixture cleanup ve unrelated queue digest kontrolünü geçti; ancak stale worker acknowledgement’ının reddedilmesi gereken adımda `Stale acknowledgement accepted` hatası verdi. Remote function tanımı salt-okunur incelemede fenced imzayı ve doğru `worker_id + attempts` koşullarını içeriyor; migration `20260922205318` uygulanmış ve legacy imza yok. Bu nedenle sonuç **lease-fencing blocker** olarak kaydedildi: yarış scriptinin transaction/lock gözlemi ve gerçek claim sonrası satır sahipliği ayrıştırılmadan tekrar çalıştırılmamalı, kontrollü e-posta veya worker polling başlatılmamalıdır.

### 2026-10-08 — Concurrency harness düzeltmesi ve staging yeniden doğrulaması

Önceki kırmızı sonuç uygulama RPC’sinden değil, test harness’inin B claim transaction’ı başlamadan sabit `350 ms` sonra A stale acknowledgement’ını başlatmasından kaynaklandı. Harness’te zamanlamaya dayalı bekleme ve B açıkken polling bağlantıları kaldırıldı. B’nin ayrı transaction’ı commit olduktan sonra A ayrı transaction’da stale sonucu gönderiyor; böylece lease fence deterministik olarak ölçülüyor ve Supabase CLI bağlantı havuzu yapay bir yarışa sokulmuyor. Bu değişiklik yalnız `scripts/run-notification-concurrency.mjs` kapsamındadır; migration veya worker davranışı değişmedi.

Allowlist’teki `orkestra-e2e` staging koşusu başarılıdır:

```text
PASS race 0: separate transaction takeover/ack fence; stale success rejected; same owner=false; current owner acknowledged.
PASS: fixture cleanup and unrelated queue digest (fixture created).
```

İki önceki yeniden koşuda görülen `Initialising login role...` bağlantı hataları da fixture cleanup sonrasında oluştu; yeni düzenlemede tekrarlanmadı. Worker polling ve Resend gönderimi hâlâ başlatılmadı. **Güncel durum:** retry/dead-letter/lease recovery rehearsal ve deterministic lease-fencing staging kanıtı tamamlandı; kontrollü worker başlatma ve gerçek test e-postası ayrı onaylı dilim olarak bekliyor.

Kapsam sınırı: bu kanıt gerçek claim/ack transaction overlap’ı değildir; B commit olduktan sonra A başlatılır. Aynı-owner ve başarısız sonuç varyantları bu tek fixture koşusunun dışındadır ve sonraki concurrency paketi için açık kalır.
