# Orkestra — Bütünleşik Ürün, UX ve Teslimat Yol Haritası

Tarih: 4 Eylül 2026  
Kapsam: Ürün stratejisi, müşteri–usta–operasyon akışları, UX/UI, Supabase güvenliği, test kanıtı ve yayın hazırlığı  
Bu çalışma bir denetim ve planlama çıktısıdır; uygulama veya veritabanı davranışını değiştirmez.

## 1. Yönetici kararı

Orkestra artık bir fikir veya statik arayüz değildir. 34 ürün sayfası, 38 API rotası, 26 migration, 71 otomatik test dosyası, kapsamlı RLS/RPC altyapısı ve ayrı bir ASP.NET Core bildirim worker'ı bulunan ciddi bir pazaryeri temelidir.

Ana problem özellik eksikliği değil, **uygulanan kapasite ile kanıtlanmış ve yayınlanabilir kapasite arasındaki farktır**. Veritabanı katmanı birçok konuda arayüzden ileride; arayüz ise aynı anda katalog, wizard, hesap, teklif, mesaj, iş, güven ve operasyon yüzeylerini taşımaya çalışıyor. Sonuç olarak ürün geniş fakat tek bir hizmette baştan sona gerçek hesaplarla kanıtlanmış “altın yol” henüz yok.

Bu nedenle önerilen yön:

1. Yeni yatay özellik eklemeyi geçici olarak sınırla.
2. Tek bir yüksek talep hizmetini üretim kalitesinde dikey dilim olarak tamamla.
3. Wizard'ı bu dilimin giriş kapısı olarak sadeleştir.
4. Gerçek müşteri–usta–admin doğrulamasını yayın kapısı yap.
5. Kanıtlandıktan sonra aynı sözleşmeyi diğer hizmetlere çoğalt.

## 2. Denetim kanıtı

### Kod ve ürün yüzeyi

| Alan | Mevcut kanıt | Yorum |
| --- | --- | --- |
| Katalog | 6 kategori, 26 benzersiz hizmet | Ürün kapsamı geniş ve veri sahipliğinde |
| Wizard | 6 hizmete özel akış, 20 hizmette doğrulanmış genel akış | Katalog vaadi ile teşhis derinliği aynı seviyede değil |
| Sayfalar | 34 erişilebilir ürün rotası | Müşteri, usta, iş, teklif, görüşme ve yönetim yüzeyleri mevcut |
| API | 38 server route | İstemci yazımlarının önemli bölümü server sınırından geçiyor |
| Veritabanı | 26 migration; 99 fonksiyon tanımı; 87 RLS policy tanımı | Backend kapasitesi projenin en güçlü tarafı |
| Test | 71 test dosyası | Yerel kapsama geniş; gerçek persona ve eşzamanlılık kanıtı eksik |
| Bildirim | ASP.NET Core worker + transactional outbox + Resend | Kod hazır; ayrı dağıtım ve canlı gözlem gerekiyor |
| Feature flags | Directed request, pre-job chat ve quote revisions varsayılan kapalı | Doğru fail-closed yaklaşım; henüz yayın kanıtı yok |

### Bugünkü kalite kapıları

- Repository hygiene: geçti; 940 dosya doğrulandı.
- Stil giriş noktaları: geçti.
- UI debt kontrolü: geçti, ancak kabul edilen mevcut borç seviyesi yüksek.
- Son wizard çalışma diliminde lint, type-check, build, 380 Vitest testi ve 24 hedefli Playwright senaryosu geçmişti.
- Gerçek iki/üç persona testleri gerekli kimlik bilgileri veya fixture yoksa `skip` olabiliyor.
- Supabase integration CI yalnız gerekli sekiz secret mevcutsa gerçek akışı çalıştırıyor; eksik secret başarısızlık yerine uyarı ve skip üretiyor.

### Çalışma ağacı

Wizard yeniden tasarımına ait commit edilmemiş değişiklikler bulunuyor. Bu durum geliştirme sırasında kabul edilebilir; fakat yeni bir büyük dilime geçmeden önce değişikliklerin kapsamı, test kanıtı ve dokümanıyla tek bir anlamlı commit altında sabitlenmesi gerekir. Yayınlanan sürüm ile kaynak commit arasındaki bağ ayrıca kaydedilmelidir.

## 3. Ürün olgunluk görünümü

Aşağıdaki yüzdeler test sonucu değil, mevcut kod ve kanıta dayanan ürün olgunluğu tahminidir.

| Alan | Tahmini olgunluk | Güçlü taraf | Kalan temel boşluk |
| --- | ---: | --- | --- |
| Hizmet keşfi ve katalog | %75 | Ortak taksonomi, doğal dil eşleştirme | Gerçek kullanıcı diliyle sınıflandırma kalibrasyonu |
| Wizard ve talep oluşturma | %60 | Koşullu adımlar, taslak, medya, konum | 20 genel akış, görsel istikrarsızlık, başarı anının tasarımı |
| Auth ve hesap | %65 | Kayıt/giriş, rol yönlendirmesi, auth dönüşü | Gerçek e-posta/callback/account-switch kanıtı |
| Usta onboarding ve doğrulama | %70 | Durum makinesi, belge, expiry, audit | Gerçek upload, cron ve çapraz rol testleri |
| Eşleştirme ve teklif | %65 | Açıklanabilir skor, sürümleme, atomik kabul | Kalibrasyon, concurrency ve gerçek karşılaştırma kanıtı |
| Ön görüşme ve pazarlık | %55 | Özel oda ve revizyon sözleşmeleri | Flag kapalı; Realtime, retry ve iki oturum kanıtı eksik |
| İş yaşam döngüsü | %70 | Durum makinesi, randevu, kapsam, timeline | Sıralama, rol ve adres RLS entegrasyon kanıtı |
| Güven ve uyuşmazlık | %75 | İnce durum makinesi, karar/sanction/audit | Operasyon pratiği, retention ve gerçek workflow gözlemi |
| Bildirim ve operasyon | %50 | Outbox ve worker tasarımı | Deployment, monitoring, dead-letter operasyonu |
| Yayın hazırlığı | %40 | CI ve güvenlik başlıkları mevcut | İzole ortam, fixture, strict persona gate ve release provenance |

## 4. Güçlü yönler

1. **Domain kuralları UI'dan ayrılmış.** Durum makineleri, Zod sözleşmeleri ve ortak taksonomi uzun vadeli bakım için doğru temel.
2. **Kritik işlemler veritabanına taşınmış.** Teklif kabulü, kapsam onayı, mesaj sırası, uyuşmazlık ve audit gibi yarışa açık alanlarda RPC yaklaşımı doğru.
3. **Güvenlik modeli savunmacı.** RLS, private Storage, rol kontrolleri, feature flag'ler ve append-only kayıtlar ürün türüne uygun.
4. **Operasyon sonrası düşünülmüş.** Uyuşmazlık, belge süresi, yaptırım, SLA, outbox ve dead-letter gibi çoğu prototipte olmayan parçalar var.
5. **Tasarım kimliği ayırt edilebilir.** Orkestra işareti, sarı–mavi sistem ve yerel hizmet dili jenerik pazaryeri görünümünden ayrılıyor.
6. **Erişilebilirlik niyeti kodda görülüyor.** 44 px hedefler, reduced-motion yaklaşımı, klavye testleri ve axe bağımlılığı doğru yönde.

## 5. Kritik eksikler ve riskler

### P0 — Yayın öncesi engelleyiciler

#### P0.1 Gerçek “altın yol” kanıtı yok

Tek bir hizmette dahi taslak → auth → gönderim → eşleştirme → teklif → revizyon → kabul → mesaj → iş → tamamlama → yorum/uyuşmazlık zinciri gerçek müşteri, usta ve admin oturumlarıyla birlikte kanıtlanmış değil.

**Etkisi:** Her parça ayrı ayrı doğru görünse de rol, RLS, Realtime ve durum geçişlerinin birleştiği yerde üretim hatası kalabilir.

#### P0.2 Integration CI fail-open davranıyor

Persona secret'ları yoksa kritik E2E paketi skip oluyor. Bu geliştirme döneminde bilinçli bir karar; ancak release branch için uygun bir kalite kapısı değil.

**Etkisi:** Yeşil CI, gerçek yetkilendirmenin geçtiği anlamına gelmeyebilir.

#### P0.3 Migration'lar ile etkin ürün yüzeyi ayrışmış

M0–M4 migration'ları kaynakta var; ilgili feature flag'ler varsayılan kapalı ve plan dokümanları remote/multi-account doğrulamayı açıkça bekletiyor.

**Etkisi:** “Kodlandı”, “yerelde doğrulandı”, “çok hesapla doğrulandı” ve “yayında” statüleri karışabilir.

#### P0.4 Deterministik entegrasyon verisi yok

`seed.sql` bilinçli olarak yalnız `select 1` içeriyor. Sahte Auth kullanıcıları üretmemek doğru; fakat izole test ortamını deterministik kuran ayrı bir persona/fixture provisioning aracı henüz teslim edilmiş kanıt olarak görünmüyor.

**Etkisi:** Testler mevcut hesaptaki talep/iş durumuna bağlı olarak dinamik skip üretiyor.

#### P0.5 Yayın provenance'i net değil

Çalışma ağacı kirli ve canlı sürümün hangi commit/migration/flag kombinasyonuyla çalıştığını kanıtlayan tek kayıt yok.

**Etkisi:** Regresyonun kaynağı ve rollback hedefi belirsizleşir.

### P1 — Görev tamamlama ve dönüşüm

#### P1.1 Wizard hâlâ ürünün en kırılgan yüzeyi

Wizard hem veri toplama, auth geçişi, taslak sahipliği, risk uyarısı, konum, medya, yönlendirilmiş talep ve özet görevlerini taşıyor. Görsel katman sık değiştiği için davranış sözleşmesi ile sunum katmanı birbirini kolayca etkiliyor.

#### P1.2 26 hizmet vaadi ile 6 özel teşhis akışı arasında mesafe var

Genel fallback teknik olarak geçerli ama kullanıcı açısından “doğru ustayı bulma” değer önerisini bütün katalogda aynı güçte yerine getirmiyor.

#### P1.3 Eşleştirme skoru açıklanabilir fakat kanıtlanmış değil

İlçe, uygunluk ve doğrulama bileşenleri var; ağırlıklar gerçek Ankara arz-talep ve iş tamamlama verisiyle kalibre edilmemiş.

#### P1.4 Teklif ve mesajlaşma yüzeyleri backend gücünün gerisinde

Sürüm, feedback, karşılaştırma, acceptance ve conversation altyapısı mevcut; ancak bütün bunların tek, sakin ve anlaşılır müşteri yolculuğu hâline geldiği gerçek kullanım kanıtı yok.

#### P1.5 Operasyon rolleri ürünle birlikte prova edilmedi

Admin uyuşmazlık ve moderasyon yüzeyleri zengin; fakat gerçek sıra, SLA, bildirim, kanıt talebi ve itiraz işlemlerinin bir operasyon görevlisi tarafından uçtan uca yürütülmesi doğrulanmamış.

### P2 — Sistem kalitesi ve ölçek

#### P2.1 CSS mimarisi değişiklik maliyetini yükseltiyor

Ölçülen durum: 6.156 CSS satırı, 360 `!important`, 58 media query ve 70 inline stil. Kalite script'i mevcut eşikler içinde geçiyor; bu, borcun düşük olduğu anlamına gelmiyor.

#### P2.2 Dokümanlarda tasarım ve durum drift'i var

README aynı anda iki eski renk paletini anlatıyor. Wizard'ın önceki “sürekli iş fişi” tarifi ile yeni soru-odaklı yaklaşım da tam uzlaştırılmamış.

#### P2.3 Güvenlik yüzeyi büyük

99 fonksiyon ve 64 `security definer` ifadesi bulunan migration geçmişi güçlü ama denetim maliyeti yüksek. Her invoker/definer fonksiyonu için `search_path`, grant/revoke, actor doğrulaması ve doğrudan RPC çağrısı kanıtı tutulmalı.

#### P2.4 Bazı basit mutasyonlar hâlâ doğrudan tablo yazıyor

Belge, uygunluk, profil ve medya gibi bazı server route'ları doğrudan insert/update/upsert kullanıyor. RLS bunu koruyabilir; ancak upload + metadata gibi çok adımlı işlemlerde atomiklik ve orphan cleanup ayrıca ele alınmalı.

#### P2.5 Gözlemlenebilirlik ürün seviyesinde tamamlanmamış

Consent-aware event temeli var; fakat funnel, RPC latency, Realtime reconnect, outbox depth, dead-letter, quote response time ve dispute SLA için sahipli dashboard/SLO görünmüyor.

## 6. Wizard için nihai ürün kararı

Wizard ikinci bir sayfaya yönlendiren klasik form gibi değil, mevcut sayfanın üzerinde arka planı sakinleştiren bir **odak katmanı** olarak açılmalı. Ancak modalın içinde yeni bir web sayfası üretmemeli.

Önerilen yapı:

1. Üstte tek ilerleme göstergesi ve kapatma.
2. Ortada yalnız bir karar/soru.
3. Gerektiğinde kısa yardım ve risk uyarısı.
4. Altta geri/ileri eylemi; mobilde her zaman erişilebilir.
5. Önceki adımlar düzenlenebilir özet içinde görünür.
6. Auth yalnız son gönderimde devreye girer; taslak ve adım korunur.
7. Sunucu onayından sonra başarı yüzeyi açılır.

### Fiş kararı

Fişi bütün wizard boyunca sağda taşımak bilişsel yük ve yapaylık yaratıyor. En doğru kullanım, **başarılı gönderimden sonra 700–900 ms süren bir tamamlanma artefaktı** olmasıdır:

- Yalnız doğrulanmış hizmet, ilçe/mahalle, zamanlama, medya adedi ve talep numarasını gösterir.
- Fiş makinesinden çıkma hareketi kısa, fiziksel ve abartısız olur.
- Sonunda kopma/perforasyon hissi verir; konfeti veya dekoratif parıltı kullanılmaz.
- `prefers-reduced-motion` durumunda animasyon kaldırılır ve sonuç doğrudan görünür.
- Animasyon gerçek sunucu başarısından önce başlamaz.
- Fiş bir dekor değil; “talebin kayda geçti” makbuzudur.

## 7. UX/UI dönüşüm tablosu

| Before | After | Why |
| --- | --- | --- |
| Wizard boyunca form + sürekli fiş + çoklu ilerleme bilgisi | Tek soru odağı + tek ilerleme göstergesi + sonda doğrulanmış makbuz | Karar yorgunluğunu ve görsel rekabeti azaltır |
| Global CSS override'larıyla ekran bazlı düzeltme | Wizard'a ait modül, token ve bileşen sınırları | Bir düzeltmenin başka breakpoint'i bozmasını önler |
| 26 hizmetin eşit derecede “hazır” görünmesi | Özel teşhis akışı olan hizmetleri açıkça önceliklendirme | Ürün vaadini gerçek kapasiteyle hizalar |
| Teklif, konuşma ve revizyonun ayrı teknik yüzeyler gibi görünmesi | Bir talep detayında zaman sıralı karar akışı | Kullanıcıya “şimdi ne yapmalıyım?” cevabını verir |
| Harita ve yardımcı bilgiler dashboard'da ana görevle yarışıyor | Talepler/işler ana, harita ikincil ve açılır | Dönüş görevini öne çıkarır |
| Feature implement edildiğinde tamamlanmış sayılması | Planned → Implemented → Local → Multi-account → Released | Yanlış hazır olma algısını engeller |

## 8. Önerilen teslimat yolu

### Aşama 0 — Kaynağı sabitle ve gerçeği tekleştir (2–3 gün)

1. Mevcut wizard değişikliklerini kapsam, test ve dokümanıyla ayrı commit'e al.
2. README'deki eski palet ve eski fiş anlatımını güncel kararla uzlaştır.
3. Her M0–M4 özelliğine beş durumlu teslimat etiketi koy.
4. Canlı/staging sürüm için commit, migration listesi ve flag değerini release kaydına yaz.
5. Remote doğrulama ertelenmiş kalabilir; fakat hiçbir özellik `Released` işaretlenmemeli.

**Çıkış kriteri:** Çalışma ağacı ve ürün dokümanı aynı gerçeği anlatır.

### Aşama 1 — Altın dikey dilim (1–2 hafta)

Pilot hizmet olarak `Musluk Değişimi` seçilsin. Akış:

`Keşif → wizard → auth dönüşü → açık veya seçili usta → teklif → revizyon → kabul → mesaj → iş → tamamlama → yorum/uyuşmazlık`

1. Bu hizmetin soru sözleşmesini tamamla.
2. UI/API/SQL zaman ve kapsam değerlerini tek sözleşmede eşleştir.
3. Açık ve yönlendirilmiş talep aynı wizard çekirdeğini kullansın.
4. Talep detayını teklif + konuşma + karar zaman çizgisi olarak birleştir.
5. Usta için fırsat → yanıt → teklif görevini tek yüzeyde bitir.

**Çıkış kriteri:** Mock/yerel veride baştan sona tek bir tutarlı yol ve bütün durumların görünür hata/boş/yüklenme karşılığı vardır.

### Aşama 2 — Wizard R2 ve başarı fişi (4–6 gün)

1. Soru, seçenek, medya, konum, auth handoff ve özet bileşen sınırlarını kesinleştir.
2. Body scroll kilidi ile modal içeriğinin viewport davranışını ayır.
3. 320, 390, 820 ve 1440 px düzenlerini ayrı kurallarla doğrula.
4. Son adımı düzenlenebilir kapsam özeti yap.
5. Sunucu başarısına bağlı makbuz/fiş animasyonunu ekle.
6. Klavye, focus trap, Escape, focus restore ve reduced-motion davranışını tamamla.

**Çıkış kriteri:** Hiçbir viewport'ta body taşması, erişilemeyen CTA veya iç içe scrollbar yoktur.

### Aşama 3 — İzole Supabase doğrulama ortamı (4–7 gün)

Kullanıcının önceki kararı uyarınca bu paket geliştirme sonunda çalıştırılabilir; ancak yayın öncesinde zorunludur.

1. İzole proje ve Auth üzerinden deterministik müşteri/usta/admin provisioning oluştur.
2. Migration history ve function definition preflight çalıştır.
3. RLS pozitif/negatif fixture'larını uygula.
4. Mesaj sırası, idempotency, teklif kabulü ve revizyon yarışlarını çalıştır.
5. CI'da release/main için missing-secret durumunu hard fail yap.

**Çıkış kriteri:** Kritik persona testi skip olmadan geçer; flag açılması için kayıtlı kanıt oluşur.

### Aşama 4 — Usta arzı ve operasyon provası (1–2 hafta)

1. Usta başvuru, belge, hizmet, bölge ve uygunluk akışını gerçek hesapla yürüt.
2. Admin onay/ret/iade ve belge expiry görevlerini prova et.
3. Usta fırsat listesinde özel ve açık talepleri görev önceliğine göre göster.
4. Bildirim worker'ını staging'de dağıt; retry/dead-letter runbook'unu uygula.
5. Uyuşmazlık SLA, iç not, kanıt, karar ve itiraz akışını operasyon rolüyle test et.

**Çıkış kriteri:** Bir talep manuel veritabanı müdahalesi olmadan operasyon ekibi tarafından tamamlanabilir.

### Aşama 5 — Kontrollü Ankara pilotu (2–4 hafta)

1. 25 ilçe veya 9 pilot ilçe yerine, gerçek arz bulunan 1–3 ilçeyi açıkça yayınla.
2. 3–5 hizmetle başla; her hizmette doğrulanmış en az birkaç usta bulundur.
3. Ödeme ve takvim vaatlerini çalışan entegrasyon yoksa metinden uzak tut.
4. Haftalık funnel ve güven metriklerini incele.
5. Başarılı dikey dilimi talep sırasına göre diğer hizmetlere çoğalt.

**Çıkış kriteri:** İlk gerçek işler, ölçülebilir teklif yanıtı ve yönetilebilir uyuşmazlık oranıyla tamamlanır.

## 9. Önceliklendirilmiş backlog

### Şimdi

- Mevcut wizard dilimini commit ile sabitle.
- Musluk Değişimi altın yolunu tek sözleşme üzerinden tamamla.
- Talep detayında konuşma, teklif, revizyon ve karar hiyerarşisini birleştir.
- Wizard R2 ve yalnız başarı sonrası fiş yaklaşımını uygula.
- Release durumlarını dokümanda dürüstçe ayır.

### Sonra

- İzole Supabase ortamı ve deterministik persona provisioning.
- Strict multi-account CI, RLS ve concurrency paketi.
- Worker staging deployment ve gözlemlenebilirlik.
- Usta onboarding/admin operasyon provası.
- İlk 3–5 hizmet için özel soru ağacı.

### Daha sonra

- 26 hizmetin tamamında uzman soru ağacı.
- Matching ağırlıklarının gerçek veriyle kalibrasyonu.
- Harita/geocoding, takvim veya ödeme entegrasyonu; yalnız ürün ihtiyacı ve operasyon hazır olduğunda.
- Gelişmiş medya, conversation attachment ve M5 inquiry modeli.
- İlçe genişlemesi.

## 10. Ölçüm çerçevesi

### Kuzey yıldızı

**Müşteri tarafından kabul edilmiş, platform üzerinden tamamlanan haftalık iş sayısı.**

### Öncü metrikler

- Wizard başlatma → gönderim oranı
- Adım bazlı terk oranı
- Auth handoff sonrası geri dönüş oranı
- Uygun usta bulunan talep oranı
- İlk teklif süresi
- Talep başına güncel teklif sayısı
- Revizyon sonrası kabul oranı
- Kabul → iş başlangıcı ve iş başlangıcı → tamamlama süresi
- Tamamlanan işte yorum oranı

### Koruyucu metrikler

- Yetkisiz erişim testi hatası
- Duplicate talep/mesaj/teklif sayısı
- İptal ve uyuşmazlık oranı
- Bildirim retry ve dead-letter derinliği
- Süresi geçmiş doğrulamayla teklif denemesi
- Mobil görev tamamlama farkı
- Erişilebilirlik kritik ihlal sayısı

## 11. Ürün karar ilkeleri

1. **Bir akışın backend'i hazır olması, ürünün hazır olduğu anlamına gelmez.**
2. **Bir özellik ancak gerçek rol ve veri sınırlarıyla kanıtlandığında yayınlanabilir.**
3. **Wizard görsel şov değil, doğru kapsam üretme aracıdır.**
4. **Fiş yalnız doğrulanmış tamamlanmanın sonucu olmalıdır.**
5. **Yeni özellik, altın yolu uzatıyorsa ertelenmelidir.**
6. **İlçe ve hizmet vaadi gerçek arzdan büyük olmamalıdır.**
7. **RLS, doğrudan RPC ve istemci deneyimi birlikte test edilmelidir.**

## 12. İlk uygulama talimatı

Bir sonraki geliştirme dilimi şu sınırla başlamalıdır:

> Mevcut commit edilmemiş wizard değişikliklerini inceleyip tek bir R1 baseline olarak sabitle. Ardından yalnız `Musluk Değişimi` hizmetinde R2 odak katmanını, düzenlenebilir son özeti ve sunucu başarısından sonra çıkan erişilebilir makbuz animasyonunu uygula. Mevcut request draft, auth return, open/direct routing ve submit RPC sözleşmelerini değiştirme. Her alt adımda hedefli component/E2E kontrolü çalıştır; ertelenmiş gerçek persona ve remote Supabase paketini yayın öncesi zorunlu kapı olarak koru.

