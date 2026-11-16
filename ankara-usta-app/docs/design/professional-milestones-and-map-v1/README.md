# Usta iş kilometre taşları ve boş harita, V1

Durum: yerel uygulama ve staging doğrulaması, 1 Kasım 2026. Rekabet, mahalle liderliği ve aylık sıralama bu sürümde yoktur.

## Uygulama durumu

Deterministik görsel QA route'u: `/ustalar?fixture=milestones&view=split&sort=recommended`. Bu fixture yalnız geliştirme/test ortamında veya açık `ORKESTRA_DIRECTORY_VISUAL_FIXTURES=true` bayrağıyla çalışır; Supabase istemcisi oluşturmaz ve veritabanına istek göndermez. `5 / 20 / 50` eşiklerine ek olarak rozet üretmemesi gereken 3 işlik kontrol kartını da içerir.

Başarılı Chromium kanıtları:

- [320 px mobil](./evidence/ustalar-milestones-mobile-320.png)
- [390 px mobil](./evidence/ustalar-milestones-mobile-390.png)
- [820 px tablet](./evidence/ustalar-milestones-tablet-820.png)
- [1440 px masaüstü](./evidence/ustalar-milestones-desktop-1440.png)

- `/harita` yönlendirmesi ve `/ustalar` haritası, başarılı bir dizin sorgusunda usta sayısı sıfır olduğunda çiziliyor. Ankara coğrafyası ve bölge seçimi kullanılabilir kalıyor; temsilî dükkân pinleri usta dizininde gösterilmiyor. Ana dizin RPC'si hata verdiğinde haritayı koruyan bağlantı-hatası kompozisyonu henüz uygulanmadı.
- `5 / 20 / 50` iş eşikleri `/ustalar` masaüstü ve mobil kartlarına ve `/ustalar/[id]` profil sayfasına eklendi. Liste kartı ve profil özeti, yalnız gerçek tamamlanan iş RPC'sinden gelen en yüksek eşiği gösterir; profil ayrıca doğrulanmış gerçek iş toplamını (`N tamamlanan iş`) sunar. İlk bakış arayüzünde birden fazla plaka vadedilmez; veri bilinmiyorsa veya hata durumunda işaret ve tamamlanan iş iddiası gizlenir. Açıklama paneli `document.body` portalında viewport'a sabitlenip 16 px güvenli alan içinde tutuluyor; liste ve mobil karusel tarafından kırpılmıyor. Etkileşim dokunma/klavye ile açılıp kapanıyor, Escape odağı tetikleyiciye geri getiriyor. Alt kontrole odaklanmak kart seçimini veya harita kaydırmasını tetiklemiyor. İşaret bir kalite veya sıralama iddiası taşımıyor.
- `supabase/migrations/20261101201122_public_completed_job_milestones.sql` yalnız doğrulanmış profesyonellerin `jobs.status = completed` toplamını dönen RPC'yi tanımlar. Migration **yalnız `orkestra-e2e` staging projesine** uygulandı; production projesine uygulanmadı. RPC bulunmazsa sorgu hatası güvenli biçimde rozeti gizler. `En çok iş` sıralaması bu yarışmasız sürümde sunulmaz.
- Staging doğrulaması: 14 doğrulanmış usta için RPC sayımları doğrudan iş tablosuyla bire bir eşleşti. Üç farklı ustanın birer tamamlanmış işi var; henüz 5 iş eşiğine ulaşan yok. Bilinmeyen kimlik, boş dizi ve 51 elemanlı dizi sonuç döndürmedi. Anonim REST çağrısı da bilinen usta için yalnız `{user_id, completed_jobs}` sonucunu HTTP 200 ile döndürdü; bilinmeyen kimlik ve 51 elemanlı girdi boş sonuç verdi. `anon` ve `authenticated` için yürütme yetkisi var; genel `PUBLIC` yetkisi yok. Bu gerçek veriyle rozetin görünmemesi beklenen davranıştır.
- Supabase güvenlik danışmanı, anonim çağrılabilen `SECURITY DEFINER` RPC için uyarı veriyor. Bu yüzeyin herkese açık olması ürün kararıdır; fonksiyon yalnız doğrulanmış usta kimliği ve toplam sayı döndürür, girdi 50 kimlikle sınırlıdır. Anonim REST kontrolü geçti; uyarı üretim geçişinde ayrıca gözden geçirilmelidir. [Danışman uyarısı](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable).

## Üretim ön kontrolü — geçiş ertelendi

1 Kasım 2026'da `hizmet-pazaryeri` projesi salt okunur denetlendi. Üretimde migration geçmişi 20 kayıt içeriyor; staging'de rozet migration'ı öncesi 31 kayıt vardı. Üretimde `private.public_professional_verification(uuid)` ve `public.list_public_verified_professionals(...)` bulunmuyor. Rozet RPC'si ilk fonksiyona bağlıdır; ayrıca usta dizini de ikinci fonksiyona bağlıdır. Bu nedenle rozet migration'ını tek başına üretime uygulamak güvenli veya çalışır bir teslim değildir. **Üretim veritabanına değişiklik yapılmadı.** Üretimde tamamlanmış iş kaydı şu anda sıfırdır.

Eksik 11 migration: `20260901130258` (e-posta bildirimi), `20260902200310`–`20260902213412` aralığındaki beş talep/davet/görüşme/teklif migration'ı, `20260905152012` (güven metriği), `20260907010554` (doğrulama özeti), `20260919194836` (doğrulama yetkisi), `20260922161628` (public usta dizini) ve `20260922205318` (bildirim lease fencing). Bazıları tablo, tetikleyici, RLS ve mevcut iş akışı fonksiyonlarını değiştirir. Bunları rozet tesliminin parçası gibi sessizce üretime geçirmek doğru değildir.

Üretim geçiş sırası: (1) eksik 11 migration için ayrı dağıtım ve geri dönüş planı; (2) üretimle eşdeğer şemada migration zinciri provası ve ilgili uzak sözleşme testleri; (3) dizin, talep, bildirim ve anonim erişim smoke testleri; (4) rozet migration'ı ve aynı sayım/izin testleri; (5) uygulama dağıtımı. Bu kapılar geçmeden üretim rozeti etkin sayılmaz.

Bu makinede Docker komutu bulunmadığı için yerel Supabase veritabanında prova yapılamadı. Üretimden açılacak izole Supabase geliştirme dalı alternatifidir; yeni dal ücret doğurabileceğinden maliyet ve kapsamı netleştirilmeden oluşturulmaz. Mevcut `orkestra-e2e` ortamı migration zincirini zaten içerir; üretimden eksik zincirin yükseltme provasının yerini tutmaz.

### Ücretsiz prova yolu

Ücretli Supabase dalı reddedildi; dal oluşturulmadı. Açık GitHub deposundaki standart `ubuntu-latest` Actions çalıştırıcısı için [migration prova iş akışı](../../../../.github/workflows/ankara-usta-migration-rehearsal.yml), [üretim geçmişi manifesti](../../operations/production-applied-migrations.txt) ve [SQL kabul sorgusu](../../../supabase/tests/remote/migration_gap_rehearsal.sql) hazırlandı. Manifest, üretimdeki 20 migration kaydıyla bire bir karşılaştırıldı. İş akışı yalnız geçici yerel PostgreSQL veritabanı açar; üretim URL'si, anahtarı veya verisi kullanmaz. Önce 20 dosyayı uygular, sonra kalan 12 dosyayı `--include-all` ile uygular ve 32 kayıt ile RPC/izin sınırlarını doğrular. Tam Supabase servis yığını yerine `supabase db start` kullanılır; Windows kaynaklı CRLF satır sonları manifest okunurken temizlenir. Gemini High'ın ilk taslağındaki güvenilir olmayan çıktı ayrıştırma ve desteklenmeyen diff bayrağı kullanılmadı.

SQL kabul sorgusu mevcut `orkestra-e2e` staging veritabanında geçti. Migration prova iş akışı ve sentetik veri uyumluluğu denetimi GitHub'daki ayrı prova dallarına gönderildi (`f0ad83d`, `92268c0`). Bu rozet UI dilimi söz konusu CI çalışmalarının sonucunu yeniden doğrulamaz ve 20→32 yükseltme provasını kendi başına başarılı ilan etmez. Ayrıca boş şema provası, üretimde mevcut 62 talep ve 2 teklifin veri uyumluluğunu kanıtlamaz. Bu veri bağımlılığı için ayrı anonimleştirilmiş fixture veya kontrollü bakım penceresi planı gerekir.
- Yerel doğrulama: milestone, dizin, fixture ve harita projeksiyonu kapsamındaki 6 dosyada 77 hedefli test geçti. TypeScript, odaklı lint, stil giriş denetimi, diff hijyeni ve production build başarılı. Chromium ile 320 / 390 / 820 / 1440 px route testi 4/4 geçti; panel her viewport'ta güvenli alan içinde kaldı, 3 işlik kontrol kartında rozet oluşmadı. Gerçek hesap doğrulaması, RPC production zinciri güvenle yayımlandıktan ve en az bir usta eşiğe ulaştıktan sonra ayrıca yapılmalıdır.

## Ürün anlamı

Rozet yalnızca Orkestra üzerinden tamamlanmış iş adedini anlatır. Beceri, güvenilirlik, kalite, belge doğrulaması veya başka ustalara göre üstünlük ima etmez. Müşteri yorumları ve belge doğrulaması ayrı sinyallerdir. Rozet arama sıralamasını değiştirmez.

Önerilen kilometre taşları: 5, 20 ve 50 tamamlanmış iş. Bunlar ilk ürün eşikleridir; canlı dağılım gözlemi sonrası değişebilir. Her eşik için okunur ad doğrudan sayıyı taşır: `5 iş tamamladı`, `20 iş tamamladı`, `50 iş tamamladı`. `Usta seviyesi`, `elit`, `en iyi` gibi yetkinlik iddiaları kullanılmaz.

Sayım kaynağı `jobs.status = 'completed'` olmalıdır. `district_trust_metrics.completed_jobs` kullanılmaz: mevcut migration bu alanı onaylı yorumların sayısından üretir. İptal veya ihtilaf nedeniyle completed durumundan çıkan iş, güncel sayımdan düşer. İş bazlı veri public yüzeye açılmaz; yalnız toplam sayı ve kazanılan eşikler açılır. Kaynak okunamazsa rozet gizlenir, sıfır iş iddiası üretilmez.

## Görsel sözleşme

- Mevcut Orkestra nötr yüzeyi ve koyu yeşili koru. Metalik altın, taş, parlama, seviye şeridi, emoji ve animasyon yok.
- Üç eşik aynı geometrik aileden gelsin: ince çizgili, küçük bir işaret ve net `5 / 20 / 50` rakamı. Sembol tek başına kalite onayı gibi görünmemeli.
- Liste kartında ve profil özetinde yalnız kazanılmış en yüksek eşik ile güvenilir gerçek toplam görünsün; ilk bakış arayüzünde birden fazla kazanılmış plaka vadedilmez, bilgi yükü artırılmaz.
- Bilgi taşıyan işaret düğme olarak en az 44 × 44 px etkileşim alanına sahip olsun. Dokunma, Enter/Space ve Escape ile açıklama açılıp kapanabilsin; odak tetikleyiciye dönsün.
- Açıklama metni gerçek toplamı gösterir; işaretin puan veya sıralama olmadığını açıklar.
- Yeni ustada boş gri rozet veya kilitli seviye gösterme. Ustanın kendi alanında ilerleme gösterimi daha sonra ayrı tasarlanabilir.

## Harita sözleşmesi

Harita Ankara coğrafyasının keşif yüzeyidir; ustalar işaret katmanıdır. Usta sayısı sıfır olduğunda ilçe sınırları, yakınlaştırma, kaydırma ve bölge seçimi kullanılabilir kalır. Boş veri, filtre sonucu ve bağlantı hatası üç ayrı durumdur.

- Gerçek sıfır arz: `Bu bölgede henüz doğrulanmış usta yok.` Harita açık kalır; kullanıcı başka bölge seçebilir veya ihtiyacını anlatabilir.
- Filtre sonucu sıfır: filtreleri sıfırlama yolu gösterilir.
- Dizin bağlantı hatası: `Usta verileri şu anda yüklenemiyor.` Tekrar deneme sunulur; sıfır arz iddiası yapılmaz.
- Temsilî atölye veya dükkân pinleri gerçek usta işaretleri yerine geçmez. Başka keşif konseptinde kullanılacaksa açıkça ayrı katman ve temsili etiket gerektirir.
- Mobilde liste boş olsa da harita görünümüne geçiş erişilebilir kalır.

## Uygulama sırası ve kabul

1. Harita boş ve hata durumlarında render edilir; temsilî arz işaretleri kaldırılır. Ekran görüntüsü ve route testi ile doğrulanır.
2. Gerçek tamamlanan iş sayısını veren, yalnız public onaylı ustalara toplu sonuç dönen güvenli veri yüzeyi hazırlanır. Migration yerel kod olarak incelenir; üretim verisine otomatik uygulanmaz.
3. Saf eşik hesaplama fonksiyonu, kart ve profil görseli eklenir. Sayı bilinmiyorsa işaret gösterilmez. 0, 4, 5, 19, 20, 49 ve 50 sınırları test edilir.
4. Masaüstü, mobil, klavye ve ekran okuyucu denetimi yapılır. Yayın etkisi için rozetli/rozetsiz profil açılışları ve yeni usta görünürlüğü ayrıca izlenir.

Kaynak notu: Etsy, satıcı işaretlerinde kriter ve dönemi açıkça yayımlıyor; bu Orkestra için açıklanabilirlik ilkesi olarak değerlendirildi. Orkestra'nın ilk iş kilometre taşları Etsy'nin kalite rozetleriyle eşdeğer değildir: https://help.etsy.com/hc/en-us/articles/4403058372503-What-is-the-Star-Seller-Badge
