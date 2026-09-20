# Orkestra ürün ve teslimat yol haritası

> **Tarihsel belge:** Bu belgenin sıralaması 21 Eylül 2026 tarihli [ürün olgunluğu yol haritası](PRODUCT-MATURITY-ROADMAP-2026-09-21.md) ile güncellenmiştir. Buradaki 19 Eylül kararları ve kanıt sınırları geçmiş kayıt olarak korunur.

Güncelleme: 19 Eylül 2026
Kapsam: ürün öncelikleri, UX/UI, Supabase doğrulaması, çoklu hesap kanıtı ve kontrollü Ankara pilotu
Durum: planlama belgesi; bu belge tek başına bir özelliği yayınlanmış saymaz.

## 1. Yönetici kararı

Orkestra'nın ana açığı yeni özellik eksikliği değildir. Ürün; katalog, wizard, hesap, usta dizini, yönlendirilmiş talep, teklif, görüşme, iş yaşam döngüsü, güven ve operasyon yüzeylerine sahiptir. Ana açık, bu kapasitenin aynı sürüm ve aynı izole ortam üzerinde gerçek rollerle baştan sona kanıtlanmamış olmasıdır.

Bu nedenle yeni öncelik sırası şöyledir:

1. Yerelde bekleyen U3 değişikliklerini doğrulayıp anlamlı bir teslimat birimine dönüştür.
2. Usta dizini, profil, seçili ustaya talep ve giriş sonrası taslağa dönüş yolunu dört görünümde tamamla.
3. `orkestra-e2e` ortamında M0–M4 yetki, Realtime ve eşzamanlılık kapılarını sessiz `skip` olmadan geçir.
4. `Musluk Değişimi` hizmetini açık ve seçili usta yollarıyla gerçek altın dikey dilim hâline getir.
5. Ancak bu kanıtlardan sonra feature flag aç, operasyon provası yap ve sınırlı Ankara pilotuna çık.

Harita üzerinde canlı usta pini, ödeme, takvim senkronizasyonu, M5 inquiry modeli, konuşma ekleri ve 26 hizmetin tamamında ileri teşhis ağaçları bu sıranın önüne geçmeyecektir.

## 2. Doğrulanmış mevcut durum

| Alan | Bugünkü durum | Kanıt sınırı |
| --- | --- | --- |
| U1, hizmet keşfi | Uygulandı ve yerel tarayıcı kontrolleri bulunuyor | Yayın ve gerçek kullanıcı davranışı kanıtı değil |
| U2, wizard ve başarı özeti | Uygulandı; soru odağı, düzenlenebilir özet ve sunucu başarısına bağlı makbuz mevcut | Tam cihaz/yardımcı teknoloji ve gerçek rol matrisi tamamlanmadı |
| U3, usta seçimi | Dizin, profil, filtre, örnek veri etiketi ve seçili ustaya talep yolu kodda mevcut | Final staging koşusunda responsive dizin, mobil auth dönüşü ve hesap değişimi 6/6 geçti |
| Auth dönüşü | İzole staging üzerinde seçili usta, cevaplar ve konum korunarak tek gönderim; A → B → A taslak izolasyonu kanıtlandı | Kayıt olma ve tam erişilebilirlik matrisi V3 içinde açık |
| İzole ortam | `orkestra-e2e` ve sentetik iki müşteri, admin ve iki usta profili hazırlandı | Tam migration/rol/concurrency sertifikasyonu değil |
| M0–M4 pazar akışları | Kaynak ve migration'lar büyük ölçüde uygulanmış; hedefli yerel testler var | Feature flag'ler kapalı; çoklu hesap, doğrudan RPC ve yarış kanıtı eksik |
| Kalite tabanı | Repository, stil giriş noktası ve UI debt kontrolleri 19 Eylül'de geçti | Tam lint, type-check, coverage, build ve E2E bu güncellemede çalıştırılmadı |
| Yayın | Hiçbir M0–M4 dilimi `Released` kabul edilmiyor | Ortam, commit, migration ve flag kaydıyla yayın kanıtı yok |

19 Eylül kalite ölçümü: 6.156 CSS satırı, 360 `!important`, 58 media query ve 37 inline style. Kontrol mevcut bütçe içinde geçiyor; bu sayı CSS borcunun kapandığı anlamına gelmez.

## 3. Ürün odağı

### Birincil müşteri görevi

İhtiyacı doğru kapsamla anlatmak, uygun ustayı veya teklif yolunu seçmek, güvenli şekilde anlaşmak ve işi takip etmek.

### Birincil usta görevi

Yetkili olduğu bölge ve hizmette uygun talebi görmek, kapsamı netleştirmek, sürümlü teklif vermek ve kabul edilen işi tamamlamak.

### Birincil operasyon görevi

Belge, moderasyon, uyuşmazlık ve bildirim sorunlarını denetlenebilir bir kayıtla yönetmek; ürün akışını manuel veritabanı müdahalesi olmadan sürdürebilmek.

### Altın hizmet

İlk yayın adayı `Musluk Değişimi` olacaktır. U3'teki sentetik TV montajı akışı auth dönüşünü doğrulayan teknik bir fixture'dır; ürün altın yolu yerine geçmez.

## 4. Öncelikli teslimat yolu

### R0, kaynak ve kanıtı sabitle (yerel olarak tamamlandı)

Amaç: yerel çalışma ağacı, dokümantasyon ve test sonucunun aynı gerçeği anlatması.

- U3 auth hydration, doküman navigasyonu, hesap özeti subscription düzeltmesi ve public doğrulama projection'ını tek kapsam olarak gözden geçir.
- Migration, uygulama çağrıları, staging testleri ve sonuç belgelerini birlikte doğrula.
- U3 responsive testini yeniden çalıştır; eski kırmızı `.last-run` kaydını başarılı sonuç olmadan geçersiz sayma.
- Hedefli lint, type-check, component testleri ve production build'i çalıştır.
- Orkestra değişikliklerini `.vscode`, Umut Usta ve diğer proje artefaktlarından ayrı commit sınırında tut.

Çıkış kriteri: değişiklik listesi, test komutları, sonuç, migration ve bilinen sınırlar tek commit adayında kayıtlıdır.

19 Eylül sonucu: kriter karşılandı. Kanıt [R0 kaynak ve kanıt kaydında](R0-SOURCE-AND-EVIDENCE-2026-09-19.md) tutuluyor. Commit ve push henüz yapılmadı.

### R1, U3 uzman seçimi ve auth dönüşünü bitir

Amaç: liste → profil → seçili ustaya talep yolunu kullanılabilir ve kanıtlı hâle getirmek.

- Hizmet ve ilçe filtrelerini 320, 390, 820 ve 1440 px'te doğrula.
- Uzun isim, boş sonuç, filtre temizleme, klavye sırası ve en az 44 px hedefleri kontrol et.
- Örnek profilleri açıkça test verisi olarak etiketle; haritayı canlı konum veya kesin arz gibi sunma.
- Mobilde wizard → giriş → açık taslak sahipliği devri → aynı usta, cevap ve adıma dönüş → tek gönderim yolunu çalıştır.
- Hesap değişiminde başka müşterinin taslağının görünmediğini kanıtla.

Çıkış kriteri: dört responsive dizin senaryosu ve mobil auth dönüşü geçer; yatay taşma, kayıp hedef usta veya çift talep yoktur.

### R2, M0–M4 çoklu hesap yayın kapısı

Amaç: uygulama görünürlüğü ile gerçek veritabanı yetkisini birlikte kanıtlamak.

- `orkestra-e2e` migration geçmişini ve kritik fonksiyon tanımlarını mevcut kaynakla karşılaştır.
- Müşteri A/B, usta A/B ve admin rollerinde doğrudan tablo/RPC ile uygulama API sınırlarını test et.
- Yönlendirilmiş talep, davet, görüşme, teklif revizyonu ve kabul için pozitif/negatif fixture'ları çalıştır.
- Eşzamanlı mesaj, tekrar gönderim, teklif kabulü, kapsam değişikliği ve uyuşmazlık kararında iki oturumun yakınsamasını doğrula.
- Fixture bulunamadığında testleri `skip` etmek yerine fixture hazırlama veya açık başarısızlık kullan.
- Database advisor, rollback/roll-forward ve flag aktivasyon kaydını oluştur.

Çıkış kriteri: kritik paket skip olmadan geçer; ilgisiz rol veriyi okuyamaz veya değiştiremez; yarışlarda tek yetkili sonuç oluşur.

### R3, Musluk Değişimi altın dikey dilimi

Amaç: pazaryerinin ticari çekirdeğini tek bir hizmette gerçek rollerle kanıtlamak.

Akış:

`Keşif → wizard → auth → açık veya seçili usta → görüşme → teklif → revizyon → kabul → iş → mesaj/kapsam → tamamlama → yorum veya uyuşmazlık`

- UI, API ve SQL soru/zamanlama sözleşmelerini tekleştir.
- Açık talep ile seçili usta talebinde aynı wizard çekirdeğini kullan.
- Müşteri, usta ve admin için yüklenme, boş, hata, bekleme ve yetkisiz durumlarını tamamla.
- En fazla üç güncel teklif karşılaştırmasını; eski sürüm reddini ve tek iş yaratılmasını doğrula.
- Tamamlama ve yorum/uyuşmazlık yollarını aynı fixture zincirine bağla.

Çıkış kriteri: üç gerçek test rolüyle tek hizmet baştan sona tamamlanır; kayıt sayıları ve kabul edilen şartlar veritabanından doğrulanır.

### R4, operasyon ve gözlemlenebilirlik

Amaç: çalışan akışı işletilebilir hâle getirmek.

- Usta başvuru, belge, doğrulama süresi, onay/ret/iade ve yaptırım akışını prova et.
- Notification worker'ı staging'de dağıt; retry, lease ve dead-letter runbook'unu doğrula.
- RPC gecikmesi, funnel terkleri, ilk teklif süresi, Realtime reconnect ve outbox derinliği için sahipli ölçüm oluştur.
- İş mesajları ve timeline için cursor/pagination stratejisi uygula.
- Genel hata kodu, kullanıcı mesajı ve correlation ID standardını ortaklaştır.

Çıkış kriteri: operasyon ekibi talebi manuel SQL müdahalesi olmadan yönetebilir; başarısız bildirim veya bağlantı kaybı işi geri almaz.

### R5, kontrollü Ankara pilotu

Amaç: vaadi gerçek arz ile sınırlandırılmış bir pilotta ölçmek.

- Gerçek arz bulunan 1–3 ilçe ve 3–5 hizmeti açıkça yayınla.
- Ödeme, canlı konum, kesin randevu veya tüm Ankara kapsaması gibi hazır olmayan vaatleri kullanma.
- Feature flag'leri dilim bazında, doğrulanmış commit ve migration ile aç.
- Haftalık görev tamamlama, teklif yanıtı, terk, uyuşmazlık ve mobil fark metriklerini incele.
- Kanıtlanan sözleşmeyi talep hacmine göre diğer hizmetlere çoğalt.

Çıkış kriteri: gerçek işler ölçülebilir teklif yanıtı ve yönetilebilir operasyon yüküyle tamamlanır; rollback hedefi bellidir.

## 5. UX/UI yönü

Tasarım dili korunacaktır: beyaz/lemonade yüzey, kobalt ana eylem, sarının kontrollü vurgu olarak kullanılması ve beş daireli Orkestra işareti. Yeni bir yeniden markalama bu yol haritasında yoktur.

| Önce | Bundan sonra | Neden |
| --- | --- | --- |
| Her ekranda aynı derecede güçlü çok sayıda eylem | Her yüzeyde tek ana görev ve birincil eylem | Karar yorgunluğunu azaltmak |
| Harita, fiş veya güven metinlerinin ana görevle yarışması | Harita yardımcı; makbuz yalnız sunucu başarısından sonra; güven kanıtı bağlamsal | Görsel kancayı göreve bağlamak |
| Kart ve iç içe yüzeylerle bölümleme | Boşluk, başlık ve ayırıcılarla daha sakin gruplama | Yapay arayüz hissini ve yoğunluğu azaltmak |
| Hover ile anlaşılan kontroller | Görünür etiket, seçili durum ve ayrı `focus-visible` | Mobil ve klavye erişimi |
| Tek breakpoint mantığı | 320, 390, 820 ve 1440 px için görev bazlı doğrulama | Sadece küçülen değil, yeniden yerleşen responsive deneyim |
| Birkaç başarılı testle genel hazır olma iddiası | Planned → Implemented → Local → Multi-account → Released | Ürün gerçeğini kanıt seviyesinden ayırmak |

Her UI diliminde default, hover, focus, active, disabled, loading, error ve success durumları; reduced motion; 200% zoom; uzun Türkçe metin ve klavye sırası kontrol edilecektir.

## 6. Ertelenen işler

Aşağıdakiler faydalıdır fakat R0–R3 öncesinde ürünün yayın riskini azaltmaz:

- M5 conversation-first inquiry ve inquiry → request dönüşümü
- Mesaj ekleri ve çevrimdışı pending-text kalıcılığı
- Canlı usta konumu veya kesin mahalle pinleri
- Google Calendar/OAuth, ödeme veya escrow
- 26 hizmetin tamamında ileri seviye koşullu teşhis ağacı
- Ankara geneline ve yeni şehirlere genişleme
- Görsel gösteri amaçlı ek scroll veya fiş animasyonları

## 7. Kalite ve yayın sözleşmesi

Bir dilim ancak aşağıdaki sıra ile ilerler:

`Planned → Implemented → Locally verified → Multi-account verified → Released`

- Yerel test, remote RLS kanıtı değildir.
- Feature flag, doğrudan RPC yetkisini kapatmaz.
- Test hesabı ve sentetik profil, gerçek usta arzı değildir.
- Yeşil smoke testi, tam regression veya erişilebilirlik kanıtı değildir.
- Yayın kaydında commit, migration listesi, flag değerleri, ortam, tarih, test sonucu ve rollback hedefi bulunmalıdır.
- Main/release için zorunlu persona secret'ları yoksa kritik entegrasyon paketi başarı sayılmamalıdır.

## 8. Başarı ölçümü

Kuzey yıldızı: müşteri tarafından kabul edilmiş ve platform üzerinden tamamlanmış haftalık iş sayısı.

Öncü göstergeler:

- Wizard başlatma → gönderim oranı
- Auth dönüşünde korunan taslak oranı
- Uygun usta bulunan talep oranı
- İlk geçerli teklif süresi
- Revizyon → kabul oranı
- Kabul → iş başlangıcı → tamamlama süresi

Koruyucu göstergeler:

- Yetkisiz erişim testi hatası
- Duplicate talep, mesaj, teklif veya iş sayısı
- Mobil ve masaüstü görev tamamlama farkı
- Bildirim retry/dead-letter derinliği
- Süresi geçmiş doğrulamayla işlem denemesi
- Kritik erişilebilirlik ihlali

## 9. Sıradaki çalışma dilimi

Bir sonraki uygulama işi **R2 çoklu hesap yayın kapısı** olmalıdır:

1. M0–M4 rol, doğrudan RPC/table, Realtime ve concurrency fixture'larını sessiz `skip` olmadan çalıştır.
2. Açık talep regresyonu ile yönlendirilmiş talebin kendiliğinden genişlemediğini aynı koşuda kanıtla.
3. Kayıt olma dönüşü ve V3'ün kalan erişilebilirlik matrisini tamamla.
4. R2 kanıtından sonra feature flag aktivasyon kararını ayrı ver.

Bu dilim tamamlanmadan M5, ödeme, takvim veya canlı harita pini geliştirmesine başlanmamalıdır.
