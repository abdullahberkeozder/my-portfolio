# Taskrabbit Ürün ve Ekran Mimarisi Araştırması

İnceleme tarihi: 24 Ağustos 2026  
İncelenen ana kaynak: `https://www.taskrabbit.com/`  
Yöntem: canlı tarayıcı incelemesi, görünür DOM envanteri, form/etkileşim taraması, hesaplanmış stil ölçümü ve 390 px mobil kırılım kontrolü.

## Kapsam tanımı

Taskrabbit; şehir, hizmet ve şehir–hizmet birleşimleriyle yüzlerce SEO rotası üretir. Bu inceleme, aynı şablonun veriyle çoğaltılmış her örneğini değil, birbirinden farklı ürün veya tasarım yapısına sahip tüm temel sayfa türlerini kapsar. Oturum açma ve ödeme sonrasındaki ekranlar kullanıcı hesabı gerektirdiğinden bu araştırmanın dışında kalmıştır.

## İncelenen sayfa türleri

| No | Sayfa türü | Örnek rota | Temel amaç |
|---:|---|---|---|
| 1 | Ana sayfa | `/` | Arama, kategori keşfi, popüler işler, güven ve dönüşüm |
| 2 | Hizmet dizini | `/services` | Tüm hizmetleri kategori başlıkları altında taratma |
| 3 | Talep/rezervasyon | `/book/6940/details` | Konum ve kapsam sorularıyla iş talebi oluşturma |
| 4 | Giriş/kayıt | `/login` | Tek yüzeyde hesap girişi ve hesap oluşturma |
| 5 | Usta başvurusu | `/become-a-tasker` | Kazanç vaadi, uygunluk, profil ve iş alanı kurulumu |
| 6 | Şehir dizini | `/locations` | Hizmet verilen şehirlerin alfabetik/coğrafi dizini |
| 7 | Şehir detay | `/locations/los-angeles` | Şehre özel hizmet kataloğu ve “Book Now” dönüşümü |
| 8 | Yakındaki hizmet dizini | `/near-me` | Yerel niyetli hizmet bağlantılarının listesi |
| 9 | Yerel hizmet detay | `/near-me/wall-mount-tv` | Usta önizlemeleri, güven, yorumlar, SSS ve yerel arama |
| 10 | Fiyat rehberleri | `/cost-guides` | Kategori ve iş bazında maliyet eğitimi |
| 11 | Seçkin usta programı | `/taskrabbit-elite` | Yüksek performanslı hizmet sağlayıcı statüsü |
| 12 | Kurumsal sayfa | `/about` | Marka hikâyesi ve liderlik |
| 13 | Blog | `/blog` | Rehber, ilham, SEO ve kategori içerikleri |
| 14 | Destek merkezi | `support.taskrabbit.com/hc/en-us` | Müşteri, usta, kayıt, hesap ve politika desteği |

## 1. Ana sayfa

### İçerik sırası

1. Logo, Hizmetler, Giriş/Kayıt ve Usta Ol navigasyonu.
2. “Book trusted help / for home tasks” şeklinde iki satırlı ana vaat.
3. “What do you need help with?” arama alanı.
4. Assembly, Mounting, Moving, Cleaning gibi yatay kategori sekmeleri.
5. Seçili kategoriye bağlı alt iş bağlantıları ve açıklayıcı görsel.
6. Tamamlanan iş sayılarıyla platform hacmi.
7. Başlangıç fiyatı içeren Popüler Projeler kartları.
8. Uzun müşteri değerlendirmeleri ve bağımsız Trustpilot kanıtı.
9. Garanti, doğrulanmış Tasker ve destek üçlüsü.
10. Üç adımlı “How it works”.
11. Hızlı hizmet bağlantıları ve geniş footer.

### Etkileşim modeli

- Arama alanı birincil dönüşüm noktasıdır.
- Kategori düğmeleri içerik setini değiştirir.
- Popüler işler doğrudan belirli rezervasyon rotalarına gider.
- Değerlendirmeler yatay/kart tabanlı içerik grubu olarak kullanılır.

### Mobil davranış

- 390 px genişlikte masaüstü navigasyon bağlantıları gizlenir, menü düğmesi kalır.
- Hero araması yaklaşık 265 px giriş + 72 px eylem düğmesi olarak tek satırda korunur.
- Kategori kontrolleri 105 px genişlikli yatay kaydırılabilir düğmelere dönüşür.
- İlk popüler projeler gösterilir, kalanlar “See more projects” ile açılır.
- Bölümler tek sütuna geçer; ana içerik genişliği yaklaşık 343 px olur.

## 2. Hizmet dizini

- Büyük fakat kısa hero: yapılacaklar listesinin platform tarafından üstlenildiği mesajı.
- İlk grup “Featured Tasks”; devamında Handyman ve diğer ana kategoriler.
- Hizmetler karttan çok metin bağlantıları ve kategori kümeleri halinde sunulur.
- Aynı hizmet hem üst düzey öne çıkanlarda hem kendi kategorisinde yer alabilir.
- Mobilde kategori navigasyonu ve hizmet listeleri tek sütunlu, yoğun fakat hızlı taranabilir kalır.

Orkestra karşılığı: Beş pilot kategori ana girişte; 22 hizmetin tamamı ayrı Hizmetler sayfasında kategorilere göre listelenmeli.

## 3. Talep ve rezervasyon sihirbazı

- Sayfa başında seçilen hizmet adı görünür.
- İlk zorunlu adım konumdur: sokak adresi ve daire/kapı bilgisi.
- Sonraki bölüm “Details” ve ustaya özel açıklama alanıdır.
- Başlıklar numaralı ve doğrusal ilerler; her ekranda tek baskın eylem bulunur.
- Kullanıcı, usta listesine geçmeden önce işin kapsamını ve hizmet bölgesini belirler.

Orkestra farkı: doğal dil sınıflandırması konumdan önce gelmeli; konum ilçe/mahalle düzeyinde alınmalı, tam adres usta seçilene kadar saklanabilir.

## 4. Giriş ve kayıt

- Ayrı bir kimlik sağlayıcı alanında açılır.
- Tek kart, “Welcome” başlığı, e-posta ve parola alanları.
- “Continue” tek birincil eylemdir.
- Pazaryeri içeriği ve navigasyon bu ekranda dikkat dağıtmaz.

Orkestra karşılığı: müşteri ve usta için ortak giriş; rol seçimi kayıt sonrasında yapılmalı.

## 5. Usta başvuru sayfası

### Sayfa akışı

1. “Earn money your way” kazanç ve esneklik vaadi.
2. Bölge ve kategori seçimiyle hızlı uygunluk kontrolü.
3. Be your own boss, set your own rates ve grow your business faydaları.
4. Altı adım: kayıt, profil, uygunluk doğrulama, kayıt ücreti, takvim/bölge ve iş almaya başlama.
5. Akordeon SSS.
6. Tekrarlanan “Get started” CTA.

Orkestra karşılığı: ilçe + hizmet seçimi, belge doğrulama, referans işleri, çalışma bölgesi, müsaitlik ve moderasyon sırası.

## 6. Şehir ve bölge mimarisi

### Şehir dizini

- Eyalet başlıkları ve altında şehir bağlantıları.
- Arama yerine alfabetik/coğrafi tarama.

### Şehir detay

- “Hello [şehir]!” şeklinde yerelleştirilmiş başlık.
- Şehirdeki bütün hizmetlerin kart/listesi.
- Her hizmette tekrarlanan “Book Now”.

Orkestra karşılığı: tek şehir nedeniyle şehir dizini gereksizdir. Bunun yerine `/ankara/cankaya`, `/ankara/kecioren` gibi ilçe sayfaları ve ilçe–hizmet kombinasyonları kullanılabilir.

## 7. Yakındaki hizmetler ve yerel hizmet detayı

### Dizin

- “Near Me” niyetine göre seçilmiş yüksek talep gören hizmetlerin sade bağlantı listesi.

### Hizmet detay şablonu

1. Breadcrumb.
2. Hizmeti gösteren büyük görsel, H1, kısa açıklama ve posta kodu girişi.
3. “Top pros near you” usta önizlemeleri.
4. Usta kartında fotoğraf, isim, puan, yorum sayısı, tamamlanan ilgili iş sayısı ve uzun tanıtım metni.
5. Güvence, doğrulama ve destek.
6. Yakın tarihli hizmete özgü değerlendirmeler.
7. SSS akordeonu.
8. İlgili blog içerikleri.
9. Ortalama puan, tamamlanan iş ve yorum hacmi.
10. Benzer ve ilişkili hizmet bağlantıları.
11. Uzun, SEO odaklı açıklayıcı içerik.

Orkestra karşılığı: posta kodu yerine ilçe/mahalle; usta kartında aynı ilçe iş sayısı, zamanında gelme, tekrar çağrılma ve doğrulanmış öncesi–sonrası bulunmalı.

## 8. Fiyat rehberleri

- Rehberlerin platform verisi ve araştırmayla güncellendiği açıklanır.
- İçindekiler tablosu bulunur.
- Rehberler ana kategori ve hizmete göre gruplanır.
- Ticari dönüşümden önce fiyat belirsizliğini azaltan eğitici yüzeydir.

Orkestra karşılığı: her hizmette dahil/hariç kapsam, tahmini süre, malzeme, keşif gereksinimi ve Ankara fiyat aralığı.

## 9. Elite / doğrulanmış usta seviyesi

- Ayrı bir prestij programı olarak konumlandırılır.
- Ana mesaj en yüksek puanlı ustalar ve müşterinin bu ustaları neden tercih ettiği üzerinedir.

Orkestra karşılığı: tek Elite rozeti yerine telefon, belge, adres, referans, zamanında gelme ve sorunsuz tamamlanma göstergeleri ayrı ayrı sunulmalı.

## 10. Blog ve destek

### Blog

- Büyük öne çıkan içerik.
- Konu kategorileri: ev, maliyet, nasıl yapılır, oda rehberleri, bahçe, usta yaşamı.
- Son yazılar ve arama alanı.
- Yazı içeriklerinden hizmet rezervasyonuna çapraz bağlantı.

### Destek merkezi

- “How can we help?” arama alanı.
- Client, Tasker, Registration, Account ve Policy Center ana bölümleri.
- Popüler kısayollar: fatura, ödeme, rezervasyon, iptal ve IKEA işleri.
- Bulamayan kullanıcı için destek eylemi; ardından yeni iş oluşturma CTA’sı.

Orkestra karşılığı: Müşteri, Usta, Talep/Teklif, Ödeme, Şikâyet/Uyuşmazlık ve Garanti kategorileri.

## Tasarım sistemi ölçümleri

### Masaüstü

- Gövde fontu: Inter, 16 px / 24 px, 400.
- Ana zemin: yaklaşık `rgb(249, 250, 251)`.
- Beyaz yüzey: `rgb(255, 255, 255)`.
- Ana metin: yaklaşık `rgb(36, 42, 48)`.
- Koyu yeşil başlıklar: yaklaşık `rgb(10, 43, 20)` ve `rgb(43, 76, 50)`.
- Yeşil vurgu: yaklaşık `rgb(13, 122, 95)`.
- H1: yaklaşık 55 px, 800, 77 px satır yüksekliği.
- H2: yaklaşık 30 px, 700, 42 px satır yüksekliği.
- Arama girişi: yaklaşık 18 px.

### Genel karakter

- Az gölge, geniş beyaz alan ve net yüzey ayrımı.
- Kartlarda sınırlı yuvarlatma; içerik karttan daha baskın.
- Yeşil yalnızca marka ve eylem vurgusunda kullanılır.
- Uzun sayfalarda düzenli başlık–kanıt–CTA ritmi.
- Fiyat, puan, yorum ve iş sayısı ayrı metrikler olarak sunulur.

## Ana sayfaya uyarlanması gereken yapı

Araştırma tamamlandıktan sonra Orkestra ana sayfası şu sırayla yeniden kurulmalıdır:

1. Sade header: Hizmetler, Nasıl çalışır, Giriş, Usta olarak katıl.
2. Büyük doğal dil araması ve sorun örnekleri.
3. Yatay kategori seçici + seçili kategoriye bağlı 4–6 alt hizmet.
4. Seçili kategori için açıklama ve gerçek iş/öncesi–sonrası görsel alanı.
5. Ankara platform metrikleri.
6. Popüler paket işler ve başlangıç fiyatları.
7. İlçe bazlı doğrulanmış müşteri değerlendirmeleri.
8. Garanti, doğrulama ve uyuşmazlık desteği.
9. Üç adımlı süreç.
10. Ankara ilçeleri ve tüm hizmetlere giden geniş bağlantı alanı.
11. Ayrıntılı footer.

## Tasarım uyarlamasından önce gerekli kararlar

- İlk kategori sekmesinde hangi kategori seçili açılacak?
- Popüler işler için fiyatlar gerçek operasyon verisi mi, örnek aralık mı olacak?
- Hero altında gerçek fotoğraf kullanılacak mı, ilk sürümde nötr iş görselleri mi olacak?
- “Garanti” ticari bir teminat mı, dijital işçilik belgesi mi olacak?

Bu kararlar içerik düzeyindedir; sayfa iskeletinin uygulanmasına engel değildir.
