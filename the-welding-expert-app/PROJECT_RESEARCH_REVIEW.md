# The Welding Expert App - Arastirma ve Degerlendirme

Son guncelleme: 2026-06-17

## Kisa Sonuc

Proje artik sadece tek sayfalik randevu formu degil; musteri vitrini, admin paneli, Supabase tabanli randevu/veri akisi ve ayri galeri sayfasi olan uygulanabilir bir yerel hizmet uygulamasina donusmus durumda. En guclu taraflar: randevu secimi, WhatsApp/mail/sistem kanallari, admin ve musteri ekranlarinin ayrilmasi, musaitlik yonetimi, is ornekleri ve yorumlar.

Bir sonraki kalite sicrama noktasi tasarimi buyutmek degil; guven sinyallerini, yerel SEO sinyallerini, gercek gorselleri, teknik SEO metadata/structured data katmanini ve operasyonel admin akislarini netlestirmek.

## Kaynaklardan Cikan Ana Bulgular

- Google Business Profile tarafinda yerel gorunurluk icin eksiksiz ve dogru isletme bilgisi, adres/telefon/kategori, guncel saatler, yorumlara yanit verme, fotograf/video ekleme oneriliyor. Google yerel sonuclari aciklarken relevance, distance ve prominence faktorlerini one cikariyor. Kaynak: https://support.google.com/business/answer/7091
- Google SEO rehberi; sayfalarin mantikli URL yapisi, okunabilir/yararli icerik, iyi title/meta description, ilgili metne yakin kaliteli gorsel ve acik alt text ile desteklenmesini oneriyor. Kaynak: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- LocalBusiness structured data; adres, telefon, geo koordinatlar, openingHoursSpecification, review gibi alanlarin JSON-LD ile isaretlenebilecegini gosteriyor. Kaynak: https://developers.google.com/search/docs/appearance/structured-data/local-business
- Review structured data, yorum ve aggregateRating kullanimi icin JSON-LD ornekleri veriyor; gercek yorumlar sisteme girdiginde arama sonucu gorunumu icin degerli olabilir. Kaynak: https://developers.google.com/search/docs/appearance/structured-data/review-snippet
- Web Vitals tarafinda iyi kullanici deneyimi icin LCP, INP ve CLS metrikleri izlenmeli; gorsel agirligi olan galeri sayfasi eklendigi icin LCP ve CLS ozellikle onemli. Kaynak: https://web.dev/articles/vitals

## Mevcut Proje Degerlendirmesi

### 1. Urun Kapsami

Mevcut durum:
- Public musteri sayfasi: `/appointment`
- Is ornekleri/galeri sayfasi: `/gallery`
- Admin paneli: `/admin/dashboard`, `/admin/bookings`, `/admin/availability`
- Auth: `/login`, `/signup`
- Supabase tablolar: availability days, availability slots, appointment requests, admin profiles

Degerlendirme:
Kapsam bir kaynak ustasi sitesi icin dogru yerde. Is sinirini asan CRM, stok, faturalandirma gibi agir moduller yok. Musteri icin ihtiyac duyulan ana karar noktasi var: "Kim bu usta?", "Ne is yapiyor?", "Ornek is var mi?", "Ne zaman musait?", "Nasil iletisime gecerim?"

Risk:
Gercek gorsel, gercek yorum ve gercek adres/telefon bilgileri girilmeden site guven hissini tam tamamlamaz.

### 2. Tasarim ve UX

Guculu taraflar:
- Ana sayfa artik bilgi mimarisi olarak mantikli: Biz Kimiz, Hizmetler, Surec, Randevu, Adres, SSS.
- AppNav ve sag scroll rail, uzun sayfada konum hissi veriyor.
- Randevu takvimi 2 saatlik is mantigina gore daha gercekci.
- Galeri sayfasi ile "once/sonra" guven sinyali geldi.

Iyilestirme onerileri:
- Public header icinde "telefonla ara" ve "WhatsApp" CTA'lari daha gorunur olabilir.
- Galeri sayfasinda ileride filtreler eklenebilir: Korkuluk, kapi, ozel imalat, tamir.
- Randevu formunda "fotograf yukle" veya "WhatsApp ile fotograf gonder" acik yonlendirmesi eklenebilir.
- Adres bolumunde gercek Google Maps embed veya statik harita linki kullanilmali.

### 3. Yerel SEO

Eksikler:
- Sayfa bazli title/meta description yok; Vite SPA oldugu icin su anda genel title kullaniliyor.
- LocalBusiness JSON-LD yok.
- Review/AggregateRating JSON-LD yok.
- Canonical URL, sitemap, robots.txt gibi deploy sonrasi temel SEO dosyalari henuz net degil.
- Sehir/hizmet hedefli sayfalar yok.

Onerilen sayfa yapisi:
- `/appointment`: ana randevu ve hizmet vitrini.
- `/gallery`: is ornekleri ve referanslar.
- `/services/korkuluk-tamiri`
- `/services/kapi-mentese-kaynak-onarimi`
- `/services/ozel-metal-imalat`
- `/contact` veya mevcut sayfadaki adres bolumunun ayri versiyonu.

Not:
Bu sayfalar pazarlama sayfasi gibi buyumemeli; her biri kisa, is odakli, gercek gorselli ve randevu CTA'li olmali.

### 4. Randevu ve Operasyon

Mevcut durum:
- Musait gun/saat Supabase'den okunuyor.
- Musteri talep olusturabiliyor.
- WhatsApp/mail/sistem kanallari var.
- Admin musaitlik slotlarini yonetebiliyor.

Bir sonraki operasyonel adimlar:
- Admin randevu talebini "onaylandi / reddedildi / tamamlandi" durumlarina daha rahat cekebilmeli.
- Musteriye onay mesaji icin hazir WhatsApp metni olusturulmali.
- Ayni slot icin ayni anda iki talep gelmesini engelleyen DB constraint veya transaction mantigi eklenmeli.
- Admin tarafinda gunluk/haftalik kapasite ozeti daha netlestirilmeli.
- Musteri talep olusturduktan sonra "talep takip kodu" verilebilir.

### 5. Veri Modeli ve Supabase

Guculu taraflar:
- RLS aktif.
- Admin kontrolu `admin_profiles` ve `is_admin` fonksiyonu uzerinden yapiliyor.
- Public taraf sadece gorunur availability ve insert request yetkisine sahip.

Iyilestirme onerileri:
- `appointment_requests` icin duplicate slot kontrolu dusunulmeli.
- Admin profil onayi icin manuel SQL yerine admin ekraninda "pending admin users" bolumu eklenebilir.
- Galeri ve yorumlar su anda kod icinde sabit; ileride Supabase tablolarina alinabilir:
  - `portfolio_projects`
  - `portfolio_images`
  - `customer_testimonials`
- Storage bucket: `portfolio-images`
- Public read, admin write RLS politikalari.

### 6. Performans ve Deploy

Mevcut build uyarisi:
Vite build 500 kB uzeri chunk uyarisi veriyor. Bu kritik hata degil ama galeri ve admin buyudukce artar.

Oneriler:
- Route bazli lazy loading: `CustomerBooking`, `Gallery`, admin sayfalari dinamik import edilebilir.
- Galeri gorselleri gercek dosyaya gecince boyutlandirilmali: webp/avif, width/height, lazy loading.
- Supabase key sadece publishable/anon key olarak client'ta tutulmali; secret key asla client veya repo icinde olmamali.
- Deploy icin Vercel veya Netlify uygun. SPA fallback ayari yapilmali ki `/gallery` direkt acildiginda 404 vermesin.

## Onceliklendirilmis Yol Haritasi

### Hemen

1. Gercek telefon, e-posta, adres ve Google Maps linkini gir.
2. Galeri icin 6-10 gercek fotograf hazirla.
3. Yorumlar bolumune gercek referans metinleri ekle.
4. Sayfa title/meta description ve canonical ekle.
5. LocalBusiness JSON-LD ekle.

### Sonraki Sprint

1. Galeri ve yorumlari Supabase tablosuna tasi.
2. Supabase Storage bucket ile adminin fotograf yukleyebilmesini sagla.
3. Admin randevu durum akisini iyilestir.
4. Ayni slot icin conflict guard ekle.
5. Route bazli code splitting yap.

### Daha Sonra

1. Hizmet detay sayfalari ekle.
2. Google Business Profile ile site bilgilerini birebir eslestir.
3. Search Console ve Analytics kur.
4. PageSpeed/Core Web Vitals olcumu yap.
5. Musteri talep takip kodu veya SMS/e-posta bildirim sistemi ekle.

## Tavsiye Edilen Bir Sonraki Teknik Is

En dogru siradaki is: SEO + structured data + gercek isletme bilgileri katmani.

Sebep:
Site fonksiyonel olarak buyudu. Simdi arama motorlari ve kullanicilar icin "bu gercek, yerel, guvenilir bir kaynak ustasi" sinyalini guclendirmek gerekiyor. LocalBusiness JSON-LD, page meta bilgileri, sitemap/robots ve gercek galeri gorselleri bu projeye en hizli deger katan katman olur.
