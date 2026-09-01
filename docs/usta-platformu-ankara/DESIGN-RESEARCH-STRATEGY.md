# Ankara Usta — Tasarım Dili, Site Şeması ve Geliştirme Stratejisi

## 1. Stratejik sonuç

Önerilen yön yalnızca “Taskrabbit benzeri” değildir. Ankara Usta için daha savunulabilir birleşim:

```text
Taskrabbit’in görev başlatma kolaylığı
+ Angi’nin fiyat, garanti ve doğrulama güveni
+ Umut Usta’nın iş günlüğü ve öncesi–sonrası kanıtı
+ Kamu hizmeti tasarım sistemlerinin açık, erişilebilir form disiplini
+ Ankara’ya özgü sıcak ve yerel zanaatkârlık kimliği
```

Bu birleşimin adı **Modern Yerel Zanaatkârlık** olarak korunabilir. Bunun görsel alt türü “sıcak işlevsel minimalizm”, davranışsal alt türü ise “kanıta dayalı güven tasarımı” olmalıdır.

## 2. Araştırılan ürün ve tasarım yaklaşımları

### Taskrabbit — hızlı işe başlama

Aktarılacak ilkeler:

- Arama veya kategoriyle hızlı başlangıç
- Gündelik dil ve kısa görev tanımı
- Hizmet verenleri fiyat, deneyim, kategoriye özel yorum ve müsaitlikle karşılaştırma
- Kişi odaklı profil ve doğrudan seçim
- İş bağlamında mesajlaşma

Taskrabbit’in güncel işe alma akışında kategori/arama, adres, usta profili, tarih-saat ve rezervasyon sıralaması bulunuyor. Profilde kategoriye özel deneyim, ücret ve yorumlar gösteriliyor. [Taskrabbit işe alma akışı](https://support.taskrabbit.com/hc/en-us/articles/46260422073755-How-Do-I-Hire-a-Tasker)

Alınmaması gerekenler:

- Logo, marka işaretleri, illüstrasyon ve birebir renkler
- Saatlik ücret modelini her hizmete uygulama
- Karmaşık tadilatları basit görev gibi gösterme

### Angi — ev hizmetinde güven ve fiyat

Aktarılacak ilkeler:

- Standart işlerde ön fiyat ve anlık rezervasyon
- Büyük işlerde teklif karşılaştırma
- Doğrulama seviyelerini açık anlatma
- Gerçek komşu yorumları
- İş boyunca destek ve garanti beklentisi
- Fiyat rehberleri ve geçmiş iş verileri

Angi, sabit/ön fiyatlı rezervasyonla teklif karşılaştırmayı aynı üründe birleştiriyor; doğrulanmış uzman, komşu değerlendirmesi, destek ve garanti mesajlarını ana güven katmanları olarak sunuyor. [Angi nasıl çalışır](https://www.angi.com/landing/how-it-works)

### Umut Usta — operasyon ve iş kanıtı

Korunacak özgün avantajlar:

- Tek kararlı adımlı sihirbaz
- Randevu ve müsaitlik yönetimi
- Müşteri takip bağlantısı
- Öncesi–sonrası galeri
- İş ve müşteri notlarının ayrılması
- Rol tabanlı yönetim
- Talep/iş analitiği

Pazaryerinde bunun genişletilmiş hali, ustanın yalnızca profilini değil iş yapma biçimini kanıtlayan vaka günlüğüdür.

### Hizmet tasarım sistemleri — açıklık ve erişilebilirlik

Kamu hizmeti tasarım sistemleri görsel olarak kopyalanmamalı; karmaşık ve yüksek güven gerektiren formlardaki disiplinlerinden yararlanılmalıdır:

- Kullanıcı ihtiyacına göre akış tasarlama
- Tekrar eden işleri modüler hizmet kalıplarına bölme
- Randevuyu hazırlık, rezervasyon, bildirim, değişiklik ve iptal alt akışlarına ayırma
- Görünür etiket, anlaşılır hata ve ilerleme kaybını önleme
- Mobil, düşük bant genişliği ve yardımcı teknoloji desteği

MOJ randevu kalıbı, kullanıcının zaman/konum seçebilmesi, ne bekleyeceğini bilmesi, bildirim alması ve değiştirme/iptal edebilmesi gibi ortak ihtiyaçları tanımlıyor. [MOJ randevu hizmet kalıbı](https://design-patterns.service.justice.gov.uk/service-patterns/appointment/)

DWP, bileşenlerin erişilebilir olmasının tek başına yeterli olmadığını, bağlam içinde otomatik ve yardımcı teknoloji testlerinin gerektiğini vurguluyor. [DWP Design System](https://design-system.dwp.gov.uk/get-started/how-to-use)

## 3. Tasarım dili: Modern Yerel Zanaatkârlık

### Marka kişiliği

- Güvenilir ama soğuk değil
- Usta işi ama kaba/endüstriyel değil
- Yerel ama nostaljik değil
- Teknolojik ama “yapay zekâ girişimi” gibi değil
- Premium ama lüks/dekoratif değil
- Açık, dürüst ve kanıt odaklı

### Görsel oran

Önerilen sayfa renk dağılımı:

- `%65–75` sıcak nötr zemin ve beyaz yüzey
- `%15–20` koyu metin ve yapısal nötrler
- `%7–10` yeşil marka/etkileşim rengi
- `%2–4` bakır vurgu
- `%1–2` durum renkleri

Yeşil bütün kartları doldurmamalı. Ana eylem, aktif seçim, doğrulama ve odak için kullanılmalı. Bakır fiyat veya hata rengi değildir; zanaat kimliğini taşıyan küçük vurgu, marka işareti ve seçili iş kanıtında kullanılmalıdır.

### Başlangıç renk sistemi

```text
Brand 900    #123F36   üst seviye marka/metin
Brand 700    #17614F   ana etkileşim
Brand 500    #24806A   hover/yardımcı vurgu
Brand 100    #DDEDE7   seçili ve doğrulanmış yüzey

Copper 700   #A84F28   koyu vurgu
Copper 500   #C96832   marka detayı
Copper 100   #F3DED1   hafif vurgu yüzeyi

Warm 50      #FAF8F4   sayfa zemini
Warm 100     #F2EEE7   bölüm zemini
Warm 300     #D9D2C7   sınır
Ink 900      #17231F   ana metin
Ink 600      #5E6B66   ikincil metin
```

Bu değerler prototip başlangıcıdır; WCAG kontrast testi, gerçek ekran testi ve marka çalışmasıyla kesinleştirilmelidir.

### Tipografi

Önerilen yön:

- Arayüz: `Inter`, `Manrope` veya `Plus Jakarta Sans`
- Marka başlıkları: aynı ailenin daha karakterli ama ölçülü kullanımı
- Yalnızca 400, 500 ve gerektiğinde 600 ağırlık
- Büyük başlıkta kısa cümle; gövde metninde yüksek okunabilirlik
- Fiyat, süre ve ölçülerde tabular rakam
- Tamamı büyük harf yalnızca çok kısa teknik etiketlerde

Umut Usta’daki Plus Jakarta Sans korunabilir. Böylece eski ürünle marka akrabalığı sürer; yeni sistemde daha sıkı ölçü ve daha az dekoratif kullanım benimsenir.

### Geometri ve yüzey

- Ana arama alanı: 16–20 px köşe
- Form kontrolleri: 10–12 px
- Kartlar: 10–14 px
- Rozetler: yalnızca kısa durumlarda kapsül
- Kart içinde kart kullanımından kaçınma
- Gölgeler yerine sınır, boşluk ve yüzey tonu
- Mobilde tam genişlik; masaüstünde içerik sütunu 1100–1200 px
- Ana karar alanında tek baskın eylem

### Fotoğraf ve medya dili

Stok fotoğraf yerine dört sınıf içerik:

1. Ustanın doğal, açık yüzlü profil fotoğrafı
2. İş öncesi genel ve yakın hasar görüntüsü
3. Süreç/malzeme/işçilik ayrıntısı
4. Aynı açıya mümkün olduğunca yakın iş sonrası görüntüsü

Öncesi–sonrası bileşeni iki bağımsız kart değil, karşılaştırılabilir tek vaka bileşeni olmalıdır. İş kapsamı, tarih, ilçe düzeyinde konum, doğrulama ve müşteri kabulü yanında gösterilir.

### İkon ve hareket

- Tek bir açık kaynak çizgi ikon ailesi
- 1.5–2 px tutarlı çizgi
- Kategori ikonları yönlendirme içindir; dekoratif dev illüstrasyon değildir
- Animasyon 120–220 ms arası, durum ve yön değişimini açıklamalıdır
- Yükleme hareketi işin ilerlediği bilgisini vermeli
- `prefers-reduced-motion` desteklenmeli

## 4. Güven tasarım sistemi

Güven yalnızca yeşil rozet değildir. Arayüzde dört kanıt katmanı bulunmalıdır.

### Kimlik kanıtı

- Telefon doğrulandı
- Kimlik doğrulandı (ileriki aşama)
- Adres/bölge doğrulandı
- İşletme/vergi kaydı doğrulandı (uygunsa)

### Meslek kanıtı

- Mesleki belge doğrulandı
- Belgenin kapsadığı hizmetler
- Geçerlilik tarihi
- Belge gerektirmeyen hizmetlerde deneyim ve referans

### Platform performansı

- Tamamlanan iş
- Zamanında başlama
- Yanıt süresi
- Kapsam/fiyat uyumu
- Tekrar çağrılma
- Çözülen uyuşmazlık

### Yerel ve iş kanıtı

- İlçede tamamlanan iş
- Mahalle metriği yalnızca gizlilik eşiği aşılırsa
- Öncesi–sonrası doğrulanmış vaka
- Apartman/site referansı izinli ve anonimleştirilmiş biçimde

Tek bir “doğrulandı” rozeti yerine kullanıcı “Ne doğrulandı?” ayrıntısını açabilmelidir.

## 5. Bilgi mimarisi ve site şeması

### Kamuya açık site

```text
/
├── /hizmetler
│   ├── /elektrik
│   │   ├── /avize-montaji
│   │   ├── /priz-anahtar-degisimi
│   │   └── /elektrik-arizasi-tespiti
│   ├── /su-tesisati
│   ├── /mobilya-montaj
│   ├── /boya-kucuk-tadilat
│   └── /kaynak-demir-kapi
├── /ankara
│   └── /{ilce}
│       └── /{hizmet}
├── /ustalar
│   └── /{usta-slug}
├── /isler
│   └── /{dogrulanmis-vaka-slug}
├── /fiyat-rehberi
│   └── /{hizmet-slug}
├── /nasil-calisir
├── /guvenlik-ve-dogrulama
├── /garanti-ve-uyusmazlik
├── /usta-ol
└── /yardim
```

İlçe × hizmet sayfaları yalnızca gerçek arz, özgün içerik ve kullanılabilir sonuç varsa yayımlanmalıdır. Boş veya birbirinin kopyası yüzlerce SEO sayfası üretilmemelidir.

Google, site içi bağlantıları sayfa önemini ve hiyerarşiyi anlamak için kullanıyor; ana sayfadan kategoriye, kategoriden hizmete ve hizmetten gerçek profil/vakalara taranabilir bağlantı olmalıdır. [Google site yapısı rehberi](https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure)

### Müşteri uygulaması

```text
/talep/yeni
/talep/{id}/ozet
/talep/{id}/teklifler
/talep/{id}/mesajlar
/is/{id}/takip
/is/{id}/gunluk
/is/{id}/degisiklikler
/is/{id}/garanti
/is/{id}/degerlendirme
/hesap/talepler
/hesap/favori-ustalar
```

### Usta uygulaması

```text
/usta/basvuru
/usta/profil
/usta/hizmetler-ve-bolgeler
/usta/musaitlik
/usta/is-firsatlari
/usta/teklifler
/usta/isler
/usta/portfoy
/usta/belgeler
/usta/performans
```

### Yönetim uygulaması

```text
/admin/pazar
/admin/usta-basvurulari
/admin/belgeler
/admin/hizmet-taksonomisi
/admin/bolge-arzi
/admin/talepler-ve-eslesmeler
/admin/isler
/admin/uyusmazliklar
/admin/medya-moderasyonu
/admin/kullanicilar
/admin/denetim-kayitlari
```

## 6. Sayfa şablonları

### Anasayfa

1. Sorununu anlat arama alanı
2. Örnek sorun cümleleri
3. Beş ana kategori
4. Anlat → karşılaştır → takip et
5. Paketlenmiş işler
6. Ankara’daki doğrulanmış iş kanıtı
7. Öncesi–sonrası vakalar
8. Güven sisteminin açıklaması
9. Usta başvuru çağrısı

### Hizmet sayfası

1. Hizmet adı ve sorun odaklı açıklama
2. Talep başlatma
3. Dahil/hariç standart kapsam
4. Paket/teklif/keşif modeli
5. Fiyatı etkileyen faktörler
6. Tahmini süre ve hazırlık
7. Ankara’da aktif bölgeler
8. Doğrulanmış vaka örnekleri
9. Uygun ustalar
10. SSS ve güvenlik notları

### Usta profili

1. Kimlik, hizmet ve bölge özeti
2. Ayrıştırılmış doğrulama seviyeleri
3. Hizmete özel fiyat yaklaşımı
4. Müsaitlik ve yanıt süresi
5. Platform performansı
6. Doğrulanmış öncesi–sonrası işler
7. Bağımsız referanslar ayrı bölüm
8. Tamamlanmış işe bağlı yorumlar
9. Şikâyet/garanti yaklaşımı
10. Talep veya seçim eylemi

### Doğrulanmış vaka

1. Öncesi–sonrası karşılaştırma
2. Başlangıç sorunu
3. Onaylanan kapsam
4. Süreç ve malzeme günlüğü
5. Onaylanan kapsam değişiklikleri
6. Süre ve fiyat aralığı (izinli/uygunsa)
7. Müşteri kabulü ve değerlendirme
8. Garanti durumu
9. Benzer iş talebi

## 7. Yapılandırılmış veri şeması

“Site şeması”nın arama motoru katmanında aşağıdaki Schema.org türleri kullanılabilir:

### Platform ana sayfası

- `Organization`
- `WebSite`
- Logo ve iletişim bilgileri

Google, resmi site/kuruluş bilgisinde ad, logo, iletişim ve gerçek dünya/çevrimiçi varlık bilgilerinin sağlanmasını öneriyor. [Google Organization verisi](https://developers.google.com/search/docs/appearance/structured-data/organization)

### Hizmet sayfası

- `Service`
- `serviceType`
- `areaServed`: Ankara veya ilgili ilçe
- `provider`: platform değil, hizmeti gerçekten sunan işletme/usta ilişkisi doğru kurulmalı
- `hasOfferCatalog` ve uygun `Offer` kayıtları

Schema.org, `Service`, `LocalBusiness`, `areaServed`, `OfferCatalog` ve `Offer` birleşimini hizmet kataloğu için örnekliyor. [Schema.org LocalBusiness/Service örneği](https://schema.org/LocalBusiness)

### Usta profili

- Gerçek işletmeyse en uygun `LocalBusiness` alt türü
- Bireysel hizmet verense `Person` ve sunduğu hizmet ilişkileri
- `areaServed`, `knowsAbout`, `makesOffer`
- Yalnızca sayfada görünür ve doğrulanabilir bilgiler

Google birden fazla yerel hizmet türü için `Electrician`, `Plumber`, `Locksmith` gibi uygun türlerin dizi olarak verilebileceğini belirtiyor. [Google LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business)

### Navigasyon

- `BreadcrumbList`
- Ana kategori → alt hizmet → ilçe/hizmet veya usta/vaka yolu

Google breadcrumb verisinin sayfanın hiyerarşideki yerini anlamaya ve sonuçlarda göstermeye yardımcı olabileceğini belirtiyor. [Google Breadcrumb](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)

### Yorumlar

- Yalnızca gerçek, sayfada görünen ve ilgili tamamlanmış işe bağlı yorum
- Platformun kontrolündeki veriyi yanıltıcı biçimde zengin sonuç kazanmak için işaretlememe
- `Review`/`AggregateRating` kullanımında Google’ın geçerli tür ve içerik kurallarını ayrıca doğrulama

Yapılandırılmış veri görünür içerikle aynı olmalı; doğru işaretleme zengin sonuç garantisi değildir ve ihlal manuel işleme yol açabilir. [Google yapılandırılmış veri kuralları](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)

### Filtre URL’leri

Usta listesinde hizmet, ilçe, puan, müsaitlik ve fiyat filtreleri çok sayıda URL üretebilir. İndekslenmesi gerekmeyen parametre birleşimleri canonical/noindex/robots ve bağlantı stratejisiyle kontrol edilmelidir. Google, sınırsız faceted URL alanlarının tarama kaynaklarını tüketebileceği konusunda uyarıyor. [Google faceted navigation](https://developers.google.com/crawling/docs/faceted-navigation)

## 8. Erişilebilirlik ve kapsayıcı tasarım

Hedef: WCAG 2.2 AA.

Özellikle:

- Görünür ve programatik form etiketleri
- Seçim sonrası beklenmedik otomatik ilerleme yapmama
- Hatanın alan yanında açıklanması ve düzeltme önerisi
- Geri dönünce tekrar veri istememe
- Minimum standardın üzerinde, tercihen 44–48 px dokunma hedefi
- Klavye ile bütün akış
- Odağın sticky başlık veya alt eylem çubuğunun altında kalmaması
- CAPTCHA yerine erişilebilir ve düşük sürtünmeli doğrulama
- Fotoğraf yükleyemeyen kullanıcı için alternatif
- Düşük bağlantıda taslak kaydı ve yeniden deneme
- Türkçe karakter, telefon ve adres girişinde doğru klavye/otomatik tamamlama

WCAG 2.2; görünür/engellenmeyen odak, minimum hedef boyutu, tutarlı yardım, gereksiz tekrar girişini önleme ve erişilebilir kimlik doğrulamayı kapsıyor. [W3C WCAG 2.2 yenilikleri](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)

Web.dev form rehberi, gerçek `input`, `select`, `textarea`, `button` öğelerini; görünür label ve alanla ilişkilendirilmiş hata mesajlarını öneriyor. [Web.dev erişilebilir formlar](https://web.dev/learn/forms/accessibility)

## 9. Bileşen sistemi

### Temel tokenlar

- Renk: marka, nötr, başarı, uyarı, hata, bilgi
- Tipografi: display, heading, body, label, caption
- Boşluk: 4 px tabanlı ölçek
- Köşe: 8, 12, 16, 20
- Katman: base, raised, overlay
- Hareket: fast 120 ms, normal 180 ms, deliberate 220 ms
- Odak: bütün temalarda yüksek kontrastlı ortak ring

### Temel bileşenler

- Button, icon button, link
- Input, textarea, select, combobox
- Radio card, checkbox, segmented choice
- Search composer
- Progress/step header
- Inline validation ve error summary
- Media picker ve çekim rehberi
- Scope include/exclude list
- Verification detail
- Provider summary ve provider profile header
- Quote comparison row/card
- Before/after case viewer
- Job timeline ve scope-change approval
- District/neighborhood selector
- Empty, loading, offline ve retry states

### Hizmet kalıpları

Bileşenden daha büyük tekrar kullanılabilir kalıplar:

- Sorundan hizmete sınıflandırma
- Tek soru odaklı sihirbaz
- Paket rezervasyonu
- Teklif toplama/karşılaştırma
- Keşif planlama
- Kapsam değişikliği onayı
- İş teslimi ve müşteri kabulü
- Garanti/uyuşmazlık başlatma
- Belge doğrulama

## 10. Geliştirme alanları

### P0 — ürünün güvenli çekirdeği

- Tasarım tokenları ve erişilebilir temel bileşenler
- Anasayfa sorun araması
- Kural tabanlı, açıklanabilir sınıflandırma
- 22 hizmet soru ağacı motoru
- Talep taslağı ve geri dönüşte veri koruma
- İlçe/mahalle ve hizmet alanı
- Usta başvurusu, hizmet/bölge seçimi
- Teklif, sürüm ve karşılaştırma
- İş durumları ve denetim günlüğü
- Temel mesajlaşma
- Öncesi–sonrası medya
- Yönetici doğrulama ve moderasyon

### P1 — pazaryeri kalitesi

- Paket fiyat/slot modeli
- Keşif bedeli ve işe mahsup kuralı
- Güven detay paneli
- Yerel performans metrikleri
- Kapsam değişikliği onayı
- Müşteri kabulü ve doğrulanmış yorum
- Şikâyet/uyuşmazlık yönetimi
- SMS/e-posta/push bildirim altyapısı
- Usta yanıt ve kalite analitiği

### P2 — farklılaşma

- Öncesi–sonrası aynı açı çekim yardımcısı
- Problem metninden gelişmiş öneri; insan onayı zorunlu
- Bir işin birden fazla hizmete ayrılması
- Tekrar çağırma ve favori usta
- Apartman/site yönetimi hesapları
- Garanti belgesi ve bakım hatırlatmaları
- Ankara fiyat içgörüleri
- Usta rota ve kapasite önerileri

### P3 — ölçek

- Platform içi ödeme/emanet ve iade
- Mobil uygulama
- Yeni şehir açma yönetimi
- Çoklu dil
- Gelişmiş dolandırıcılık/risk sistemi
- Belge doğrulama entegrasyonları
- Arz/talep tahmini ve dinamik kapasite

## 11. Teknik kalite hedefleri

- Mobil ilk render ve düşük bağlantıda kullanılabilirlik
- Kritik müşteri ve usta yollarında sunucu tarafı yetki doğrulaması
- Kişisel/konum verisinin en az yetki ilkesiyle korunması
- Medyada dosya türü/boyut ve kötüye kullanım kontrolü
- Her teklif ve kapsam değişikliğinde değişmez geçmiş
- Arama ve filtre için indekslenebilir veri modeli
- Analytics olaylarında serbest metin ve kişisel veri toplamama
- Kritik akışlarda birim, entegrasyon, erişilebilirlik ve E2E testleri
- SEO sayfalarında sunucu render/prerender ve canonical yönetimi
- Core Web Vitals bütçeleri

## 12. Doğrulama araştırması

Tasarım kararları yayına geçmeden şu kullanıcılarla test edilmelidir:

- Kategori bilmeyen ev sahibi
- Yaşça büyük, mobil kullanımı sınırlı müşteri
- Apartman/site yöneticisi
- Bireysel usta
- Ekip/işletme yöneticisi
- Belge ve teknoloji okuryazarlığı düşük usta

Test görevleri:

1. “Banyodan alt kata su akıyor” talebi oluşturma
2. Yanlış hizmet önerisini düzeltme
3. Fotoğrafsız ilerleme
4. Üç teklif arasında kapsam farkını bulma
5. Ustanın hangi bilgisinin doğrulandığını anlama
6. Ek iş fiyatını onaylama/reddetme
7. İş teslimi ve sorun bildirme

Ölçümler: tamamlama, süre, hata, geri dönüş, yardım ihtiyacı, güven algısı ve teklif kapsamını doğru anlama.

## 13. Tasarıma uygulanacak net değişiklikler

Mevcut wireframe’in sonraki sürümünde:

1. Büyük yuvarlak teknoloji kartları azaltılmalı.
2. Yeşil dolgu yalnızca eylem ve doğrulamaya çekilmeli.
3. Sıcak nötr yüzey oranı artırılmalı.
4. Bakır küçük marka/işçilik vurgusu olarak eklenmeli.
5. Kategori ikonları küçültülmeli; problem örnekleri güçlendirilmeli.
6. Gerçek iş kanıtı anasayfada daha yukarı taşınmalı.
7. Usta kartında tek “doğrulandı” yerine ayrıntılı kanıt özeti kullanılmalı.
8. Teklif ekranında fiyat kadar dahil/hariç ve garanti görünür olmalı.
9. Öncesi–sonrası bileşeni aynı açı ve müşteri kabulü bilgisi taşımalı.
10. Mobilde ilerleme, ana eylem ve yardım erişimi tutarlı kalmalı.

