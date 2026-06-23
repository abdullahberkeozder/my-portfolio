# The Welding Expert App - Teknik ve Urun Denetimi

Son guncelleme: 2026-06-23

## 1. Yonetici Ozeti

Proje, bir kaynak ustasi icin gerekli temel urun sinirini dogru kuruyor:

- Musteri hizmetleri, ustayi, sureci, adresi ve sik sorulanlari gorebiliyor.
- Haftalik takvimden 2 saatlik uygun bir aralik secebiliyor.
- WhatsApp, e-posta veya sistem uzerinden talep iletebiliyor.
- Admin talepleri, musaitligi ve admin hesaplarini yonetebiliyor.
- Galeri ve referanslar ayri bir sayfada sunuluyor.

Kod derleniyor, lint kontrolu temiz ve uretim bagimliliklarinda bilinen npm acigi bulunmuyor. Buna karsilik proje henuz canli kullanima hazir kabul edilmemeli. En kritik eksik, randevu kurallarinin sadece React arayuzunde uygulanmasi. Veritabani ayni slot icin tekrar talep olusturulmasini veya kapali bir slotun API uzerinden istenmesini engellemiyor.

Tavsiye edilen sira:

1. Randevu veri butunlugu ve atomik onay akisi
2. Admin route korumasi ve mobil admin duzeni
3. Gercek verili admin dashboard
4. Form, hata ve basari deneyimi
5. Gercek isletme icerigi, SEO, medya ve performans

## 2. Dogrulanan Mevcut Durum

### Calisan ozellikler

- Public rotalar: `/appointment`, `/gallery`
- Auth rotalari: `/login`, `/signup`
- Admin rotalari: `/admin/dashboard`, `/admin/bookings`, `/admin/availability`, `/admin/users`
- Supabase Auth ile kayit, giris ve cikis
- `pending` ve `admin` profil modeli
- Talep durumlari: `new`, `contacted`, `confirmed`, `cancelled`, `completed`
- Gun kapatma, gun notu, tekli ve toplu slot acma/kapatma
- Talep onaylaninca ilgili slotu kapatma girisimi
- WhatsApp hizli yanit, telefon/e-posta kopyalama
- Galeri, once/sonra ve referans alanlari
- RLS ile public ve admin veri erisiminin ayrilmasi

### Teknik kontroller

- `npm run lint`: basarili
- `npm run build`: basarili
- Uretim paketi: 606.58 kB, gzip 170.59 kB
- Build uyarisi: ana JavaScript paketi 500 kB esigini geciyor
- `npm audit --omit=dev`: 0 bilinen acik
- Otomatik test: bulunmuyor
- Mobil inceleme: musteri sayfasi 390 px genislikte tasma yapmiyor
- Mobil inceleme: admin paneli 390 px genislikte kullanilamaz durumda

## 3. Guclu Taraflar

### Urun kapsami

Kapsam yerel hizmet uygulamasi icin kontrollu. Stok, fatura veya agir CRM gibi isin sinirini asan moduller yok. Musterinin ana sorulari cevaplanmis: kim, hangi hizmet, hangi zaman, nerede ve nasil iletisim.

### Supabase temeli

Tablolarin ayrimi anlasilir. RLS etkin ve public kullaniciya randevu taleplerini okuma yetkisi verilmiyor. `is_admin()` yardimci fonksiyonu admin kontrollerini tek yerde topluyor.

### Takvim modeli

09:00-21:00 araliginda 2 saatlik bloklar kaynak isi icin tek saatlik randevudan daha gercekci. Gun durumu, gun notu ve slot durumu birlikte kullanilabiliyor.

### Gorsel dil

Masaustunde musteri sayfasi tutarli bir sistem kullaniyor. Kart yaricaplari, ikonlar, renk kodlari ve bolum navigasyonu genel olarak dengeli. Admin masaustu duzeni de sakin ve is odakli.

## 4. Kritik Bulgular - P0

### P0.1 Randevu uygunlugu veritabaninda dogrulanmiyor

`appointment_requests` insert politikasi ad, telefon, kanal ve durum kontrol ediyor; fakat tarih/saatin gercekten acik bir slota ait oldugunu kontrol etmiyor. Arayuz disindan yapilan bir API istegi kapali veya tanimsiz bir saate talep birakabilir.

Onerilen cozum:

- Public tablo insert yetkisini kaldir.
- `create_appointment_request(...)` adinda `security definer` RPC olustur.
- RPC icinde gunun gorunur ve kapali olmadigini, slotun mevcut ve acik oldugunu dogrula.
- Telefon, tarih, saat ve metin uzunluklarini sunucuda dogrula.
- Talebi tek transaction icinde olustur.

Kabul olcutu:

- Kapali gun, kapali slot, gecmis tarih ve standart disi saat icin RPC hata vermeli.
- React istemcisi dogrudan tabloya insert yapmamali.

### P0.2 Ayni slot icin cakisma ve cift talep riski var

Birden fazla musteri ayni acik slota talep birakabilir. Ayrica basarili sistem kaydindan sonra form ayni secimle yeniden gonderilebilir.

Onerilen cozum:

- Is kuralini netlestir: talep slotu gecici olarak mi tutacak, yoksa yalnizca onaylanan talep mi kapatacak?
- Ilk surum icin ayni slota birden fazla `new` talep kabul edilebilir; ancak `confirmed` icin DB seviyesinde tekillik zorunlu olmali.
- Talep ile availability slot arasina `slot_id` foreign key ekle.
- Onay sonrasi formu basari durumuna gecir ve tekrar gonderimi engelle.

Kabul olcutu:

- Ayni `slot_id` icin iki aktif/onayli randevu olusamamali.

### P0.3 Talep onayi ve slot kapatma atomik degil

`Bookings.jsx` once talep durumunu `confirmed` yapiyor, sonra ayri API cagrisi ile slotu kapatiyor. Ikinci islem hata verirse talep onayli kalirken slot musteride acik gorunebilir.

Onerilen cozum:

- `confirm_appointment_request(request_id)` RPC olustur.
- Talep durumu ve slot durumu ayni PostgreSQL transaction icinde guncellensin.
- Iptal edilen onayli randevunun slotu yeniden acma kurali ayni RPC katmaninda tanimlansin.

Kabul olcutu:

- Islem tamamen basarili olmali veya hicbir kayit degismemeli.

### P0.4 Musteri takvimi hata durumunda gunleri acik gosteriyor

`CustomerBooking.jsx`, Supabase kaydi olmayan veya okunamayan gunler icin tum slotlari acik varsayan fallback veri uretiyor. Bu, veritabani kesintisini gercek musaitlik gibi gosterebilir.

Onerilen cozum:

- Hata durumunda fail-closed davran: slotlari secilemez yap.
- "Musaitlik su anda yuklenemiyor" mesaji ve tekrar dene butonu goster.
- Kaydi olmayan gunu admin olusturmadan musteri tarafinda acik kabul etme.

Kabul olcutu:

- Supabase erisilemezken musteri sistem talebi gonderememeli.

### P0.5 SQL dosyasi yeniden calistirilinca admin takvimi sifirlanabilir

Ana schema dosyasindaki 180 gunluk seed, `on conflict do update` ile mevcut gunleri yeniden `available` durumuna ve varsayilan nota cekiyor. Kurulum SQL'i tekrar calistirilirsa adminin kapattigi gunler acilabilir.

Onerilen cozum:

- Seed icin `on conflict do nothing` kullan.
- Schema, migration ve demo/seed verisini ayri dosyalara bol.
- Uygulanmis migrationlari Supabase CLI migration klasorunde surumle.

Kabul olcutu:

- Migration veya seed tekrar calistirildiginda mevcut admin duzenlemeleri degismemeli.

## 5. Yuksek Oncelikli Bulgular - P1

### P1.1 Admin rotalari korumali degil

Giris yapmayan kullanici `/admin/*` rotalarinda sidebar ve header'i gorebiliyor; yalnizca sayfa iceriginde giris uyarisi aliyor. RLS veriyi korudugu icin dogrudan veri sizintisi yok, fakat route davranisi eksik.

Oneri: `ProtectedRoute` veya `RequireAdmin` katmani ekle. Oturum yoksa `/login`, pending/pasif hesapta ayri bir bekleme/yetkisiz sayfasi goster.

### P1.2 Admin mobil duzeni bozuk

`AppLayout` sabit `26rem` sidebar kullaniyor ve mobil breakpoint icermiyor. 390 px testinde ana icerigin gorunen genisligi yaklasik 115 px'e dusuyor.

Oneri: mobilde sidebar'i drawer yap, header'a menu ikonu ekle, ana padding'i 1.6rem'e indir ve tablolar/kartlar icin yatay tasma stratejisi belirle.

### P1.3 Dashboard tamamen statik

Dashboard'daki musaitlik, randevular, musteri sayilari ve tarihler ornek veri. Adminin operasyonel karar vermesine yardim etmiyor ve diger ekranlarla celisebiliyor.

Oneri:

- Bugunku talepler
- Bu haftaki acik slot sayisi
- `new` ve `confirmed` sayilari
- En yakin onayli randevu
- Son 5 talep
- Hizli aksiyonlar

Bu veriler mevcut Supabase tablolarindan turetilmeli.

### P1.4 Musteri notu ile admin notu ayni kolonda

Çözüldü: müşteri formu artık `customer_note`, admin yönetimi ise `admin_note` alanını kullanıyor. Eski `notes` verisini kaybetmeden ayırmak için `supabase/separate_appointment_notes.sql` migrasyonu eklendi.

Eski `notes` kolonu dağıtım sırasında geriye uyumluluk için geçici olarak korunuyor; yeni uygulama bu kolona admin güncellemesi yazmıyor.

### P1.5 Silme yerine arsivleme gerekli

Talep su anda kalici olarak siliniyor. Randevu gecmisi ve is takibi kayboluyor.

Oneri: `archived_at`, `archived_by` ekle; varsayilan listede arsivlenmeyenleri goster. Kalici silmeyi yalnizca owner veya veritabani bakim islemi yapabilsin.

### P1.6 Admin hesap yetkisi owner modeline hazir degil

Her aktif admin diger adminleri onaylayabilir ve pasiflestirebilir. UI kendi hesabini pasiflestirmeyi engelliyor, fakat asil kural veritabaninda yok.

Oneri: `pending`, `admin`, `owner` rolleri; yalnizca owner hesap yonetebilsin. Son owner'in pasiflestirilmesini DB fonksiyonu engellesin.

### P1.7 Yeni talepler otomatik gorunmuyor

React Query pencere odagi yenilemesini kapatiyor ve realtime/polling kullanilmiyor. Admin paneli acikken gelen yeni bir talep otomatik listelenmeyebilir.

Oneri: Supabase Realtime subscription veya 30-60 saniyelik kontrollu refetch ekle. Yeni talepte toast/badge goster.

### P1.8 Tarih ve saat yardimcilari tek merkezde degil

Ayni tarih/slot yardimcilari `CustomerBooking`, `Availability` ve servis dosyalarinda tekrar ediyor. Bazi yerler yerel tarih, bazi yerler UTC tabanli `toISOString()` kullaniyor. Istanbul saatinde gun siniri hatasi olusabilir.

Oneri: `utils/date.js` ve `config/business.js` olustur; zaman dilimini `Europe/Istanbul` olarak acik tanimla.

## 6. UI ve Icerik Degerlendirmesi

### Musteri sayfasi

Guculu taraflar:

- Masaustunde hiyerarsi ve CTA'lar anlasilir.
- Takvim, hizmet ve talep ozeti birlikte calisiyor.
- Bolum navigasyonu uzun sayfada yon bulmayi kolaylastiriyor.

Gelistirme alanlari:

- 390 px mobil testinde sayfa yaklasik 7.700 px uzunlugunda. Ilk randevu aksiyonuna ulasma gecikebiliyor.
- Mobil AppNav yatay kayiyor; scrollbar gizli oldugu icin devam eden sekmeler fark edilmiyor.
- Ana hero gercek bir kaynak isi gorseli yerine renk gecisi agirlikli.
- Turkce ve Ingilizce metinler karisik: `Availability`, `Requests`, `Same-day quote review` gibi.
- Turkce karakterlerin kullanilmamasi urunu taslak gibi gosteriyor.
- Telefon, e-posta, adres, usta adi ve istatistikler ornek/hardcoded.
- Harita alani gercek embed degil, CSS ile olusturulmus yer tutucu.

Oneri:

- Mobilde sticky alt CTA kullan: `Randevu sec` ve `WhatsApp`.
- Hizmet kartlarini mobilde daha kompakt yap; surec ve SSS icin accordion dusun.
- AppNav'in sonunda fade/ok ile yatay devam sinyali ver veya 3-4 ana sekmeye indir.
- Gercek kaynak/atolye gorselini hero arka plani olarak kullan.
- Tum copy'yi Turkce ve gercek isletme bilgileriyle merkezilesmis config'ten besle.

### Admin paneli

Guculu taraflar:

- Masaustunde sakin, okunabilir ve is odakli.
- Musaitlik kartlari onceki surume gore daha kompakt.
- Talep kartlarinda temel aksiyonlar bir arada.

Gelistirme alanlari:

- Mobil admin su anda kullanilamaz.
- Bookings listesinde arama, durum filtresi, tarih filtresi ve sayfalama yok.
- Tum kartlar tek mutation loading durumu paylastigi icin bir kayit guncellenirken tum liste etkilenebilir.
- Native `window.confirm` yerine urun diline uygun modal gerekli.
- Admin ve public ekranlarinda ortak isletme bilgileri farkli dosyalarda tekrar ediyor.

### Galeri

- Unsplash gorselleri gecici olarak uygun, fakat canli site icin gercek is gorselleri zorunlu.
- Gorseller CSS `background-image` olarak kullanildigi icin anlamli `alt` metni, intrinsic boyut ve native lazy loading yok.
- "Simdilik ornek" ve sahte referans metinleri canli sitede guven azaltir.
- Gercek gorseller Supabase Storage'a alinmali; `<img>`/`picture`, WebP/AVIF, width/height ve lazy loading kullanilmali.

## 7. Kod Mimarisi ve Bakim

Mevcut buyuk dosyalar:

- `CustomerBooking.jsx`: 1.934 satir
- `Availability.jsx`: 1.014 satir
- `Bookings.jsx`: 808 satir
- `Gallery.jsx`: 693 satir
- `Dashboard.jsx`: 628 satir
- `AdminUsers.jsx`: 539 satir

Bu boyutlar degisiklik riskini ve tekrar eden styled-component sayisini arttiriyor.

Onerilen bolme:

- `features/booking/components/BookingCalendar.jsx`
- `features/booking/components/BookingSummary.jsx`
- `features/availability/components/AvailabilityDayCard.jsx`
- `features/requests/components/RequestCard.jsx`
- `features/admin-users/components/AdminUserCard.jsx`
- `config/business.js`
- `utils/date.js`, `utils/phone.js`

Once is kurallari guvenli hale getirilmeli; dosya bolme calismasi bunun ardindan mekanik ve test destekli yapilmali.

## 8. Test, Performans ve Deploy

### Test

Hic otomatik test yok. En az su senaryolar eklenmeli:

- Kapali slot talebi reddedilir.
- Ayni slot iki kez onaylanamaz.
- Talep onayi slotu kapatir.
- Iptal politikasina gore slot yeniden acilir veya kapali kalir.
- Pending kullanici admin verisi goremez.
- Owner olmayan admin hesap yonetemez.
- Tarih/hafta gecisleri Istanbul saatinde dogru calisir.

Tavsiye: Vitest + React Testing Library, kritik Supabase kurallari icin SQL/RPC entegrasyon testleri, public booking icin bir Playwright smoke testi.

### Performans

- Route bazli `React.lazy` ile admin, galeri ve customer bundle'larini ayir.
- React Query Devtools'u sadece development ortaminda yukle.
- Galeri gorsellerini optimize et ve responsive kaynaklar kullan.
- Poppins ve Sono ihtiyacini yeniden degerlendir; kullanilmayan fontu kaldir.
- Paket guncellemelerini ayri bir sprintte yap. React Query 4, React 18 ve Vite 4 icin major guncellemeler mevcut; islevsel duzeltmelerle ayni degisiklige karistirma.

### Deploy

- Vercel/Netlify icin SPA rewrite dosyasi repoda yok; direkt `/gallery` veya `/admin/bookings` acilisi 404 verebilir.
- `vercel.json` veya Netlify `_redirects` ekle.
- Supabase Site URL ve redirect URL'lerini production domain ile ayarla.
- Gercek domain sonrasinda canonical, sitemap ve LocalBusiness JSON-LD ekle.
- Hata izleme icin Sentry benzeri bir servis, urun olcumu icin gizlilik uyumlu analytics dusun.

## 9. Onerilen Sprint Plani

### Sprint 1 - Veri butunlugu ve erisim

1. `slot_id`, `customer_note`, `admin_note`, `archived_at` migration'i
2. Public booking RPC ve sunucu tarafi validasyon
3. Atomik confirm/cancel RPC
4. Fail-closed musteri takvimi
5. `RequireAdmin` route guard
6. Kritik SQL/RPC testleri

Tamamlanma tanimi: UI veya API yoluyla kapali/cakisan slot onaylanamiyor; admin olmayan kullanici admin layout'una giremiyor.

### Sprint 2 - Admin operasyonu

1. Gercek verili dashboard
2. Mobil sidebar/drawer ve responsive layout
3. Talep filtreleme, arama ve arsiv
4. Realtime yeni talep bildirimi
5. Owner tabanli admin onayi

Tamamlanma tanimi: Admin masaustu ve mobilde gunluk isi tek panelden takip edebiliyor.

### Sprint 3 - Musteri deneyimi

1. Form validasyonu ve normalize telefon
2. Basari ekrani ve takip kodu
3. Mobil sticky CTA ve daha kisa sayfa akisi
4. Gercek iletisim/adres/usta bilgileri
5. Gercek harita ve WhatsApp fotograf yonlendirmesi

Tamamlanma tanimi: Musteri uygun slotu guvenle seciyor, talebin alindigini net goruyor ve tekrar gonderim yapmiyor.

### Sprint 4 - Guven, SEO ve medya

1. Gercek galeri ve referanslar
2. Supabase Storage ve admin medya yonetimi
3. Sayfa bazli title/meta/canonical
4. LocalBusiness JSON-LD, sitemap ve robots
5. Route code splitting ve gorsel optimizasyon

Tamamlanma tanimi: Production domain dogrudan rotalarda calisiyor; gercek isletme icerigi ve temel arama motoru sinyalleri hazir.

## 10. Tavsiye Edilen Bir Sonraki Is

Ilk uygulanmasi gereken paket: **Sprint 1 - randevu veri butunlugu ve admin route guard**.

Tasarimi daha fazla buyutmeden once bu katman tamamlanmali. Cunku mevcut arayuz guven veriyor, fakat veritabani ayni guveni henuz zorunlu kilmiyor. Bu paket bittiginde dashboard ve mobil admin gelistirmeleri daha saglam bir temel uzerinde ilerler.
