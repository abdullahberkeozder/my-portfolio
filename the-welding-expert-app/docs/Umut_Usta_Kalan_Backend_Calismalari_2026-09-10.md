# Umut Usta: Kalan Backend Calismalari ve Gecis Raporu

Tarih: 10 Eylul 2026
Incelenen yerel commit: `9c160dc`
Kapsam: PostgreSQL veri butunlugu, Spring okuma API'leri, testler, mevcut React/Supabase akisiyla uyum ve kalan uygulama sirasi.

## 1. Yonetici Ozeti

Mevcut calisma, Spring'e gecis icin test edilmis bir temel olusturuyor; tamamlanmis bir backend gecisi degil. Okuma sorgulari gercek PostgreSQL ile dogrulandi. Mevcut onay yolundaki slot kilidi ve rollback davranisi da ayri sozlesme testleriyle korunuyor.

En onemli kalan is yeni endpoint sayisini artirmak degil, tum rezervasyon degisikliklerinin ayni veri butunlugu kurallarina uymasini saglamak. Ozellikle onayli kaydi arsivden geri alma, onayli kaydin tarih/saatini degistirme ve dogrudan onayli kayit ekleme mevcut tetikleyicinin guvence kapsami disinda.

Oneri: once islem kurallari ve SQL guvenceleri; bununla paralel salt okunur API guvenlik/uyumluluk testleri; ardindan kontrollu frontend gecisi ve yazma komutlari. Spring okuyucularinin staging denemesi, yazma API'lerini beklemek zorunda degil. Ancak mevcut istemcinin yazma yollarindaki riskler ayrica kapatilmalidir.

## 2. Kanit ve Sinirlar

- Kod ve testler bu rapor icin yeniden okundu. Bu turda testler tekrar calistirilmadi.
- Onceki adimda dogrulanan [PostgreSQL CI](https://github.com/abdullahberkeozder/my-portfolio/actions/runs/34492287136) ve [frontend CI](https://github.com/abdullahberkeozder/my-portfolio/actions/runs/34492287070) basariliydi. Bu, o commit ve test kapsaminin kanitidir; bugunun tum canli durumunun kaniti degildir.
- [PR #16](https://github.com/abdullahberkeozder/my-portfolio/pull/16) onceki adimda acildi; bu incelemede uzak PR durumu yeniden sorgulanmadi.
- Canli SQL karsilastirmasi icin `backend-contract/live-comparison-2026-09-10.md` esas alindi. Bu turda canli veritabanina sorgu veya yazma yapilmadi.
- Bu rapor yeni bir mobil/gorsel tarayici denetimi degildir. Onceki UX sprintlerinin tum canli kabul kriterleri yeniden dogrulanmis sayilmamalidir.
- Kodda teyit edilen aciklar, canlida cift rezervasyon yasandigi anlamina gelmez. Gercek veri etkisi henuz olculmedi.

## 3. Tamamlanan Temel

| Alan | Mevcut durum | Kanitin siniri |
| --- | --- | --- |
| SQL sozlesmesi | 5 test: bekleyen talep, onay rollback, eszamanli onay, iptal, musait olmayan talep | JDBC ve gecici PostgreSQL; Spring yazma servisi degil |
| Spring okuma | Hizmet, musaitlik ve yonetici tarih/durum listeleme | React henuz bu API'lere gecmedi |
| PostgreSQL entegrasyonu | 12 test calismasi, rol parametreleri dahil | Test DB sahibi kullaniliyor; gercek reader yetkileri degil |
| HTTP guvenlik temeli | 4 MVC testi | JwtDecoder mock; kriptografik JWT dogrulamasi test edilmiyor |
| Canli SQL eslesmesi | Iki kritik fonksiyon govdesi ve slot trigger tanimi eslesmis | Tum migration, RLS, grant ve yardimci trigger esligi degil |
| Yayin disiplini | CI raporlari artifact olarak saklaniyor | Backend deploy, staging smoke ve geri donus tatbikati yok |

## 4. Oncelikli Bulgular

### P1: Arsivden geri alma slotu yeniden ayirmiyor

Kaniti: `src/services/apiAppointmentRequests.js:228` yalnizca `archived_at=null` yazar. `src/pages/Bookings.jsx:971` bu servisi kullaniyor. `supabase/welding_appointments_schema.sql:448` onay rezervasyonunu yalnizca eski durum confirmed degilken baslatir.

Senaryo: A onaylanir, arsivlenir ve slot acilir; B ayni slota onaylanir; A geri alinir. A'nin status degeri zaten confirmed oldugundan rezervasyon kontrolune girmez. Iki aktif onayli kayit olusabilir.

Kabul: dolu slota onayli geri alma reddedilmeli ve kayit arsivde kalmali; bos slota geri alma kayit ve slotu tek transaction'da guncellemeli. Alternatif olarak geri alma her zaman bekleyen duruma donebilir, ancak bu ayri bir urun karari ve acik UI mesaji gerektirir.

### P1: Onayli tarih/saat degisikligi rezervasyonu tasimiyor

Kaniti: `supabase/welding_appointments_schema.sql:655` trigger yalnizca status, archived_at ve DELETE uzerinde. Onay kosulu da confirmed -> confirmed degisikligini ele almiyor. `apiAppointmentRequests.js:191` genel bir update servisi sunuyor.

Etki: dogrudan tarih/saat guncellenirse eski slot kapali kalabilir, hedef slot dogrulanmadan onayli kayit tasinabilir. Incelenen Bookings ekraninda dogrudan tarih tasima butonu kanitlanmadi; musteri tarih degisiklik istegi gercek rezervasyon tasimasindan ayridir.

Kabul: hedef doluysa eski rezervasyon aynen kalmali; hedef bossa eski ve yeni slot ile randevu atomik degismeli. Iki slot icin tutarli kilit sirasi ve ayni randevuya paralel komut davranisi test edilmeli.

### P1: Onayli INSERT ve alternatif yazma yollarinda guvence eksik

Kaniti: ayni trigger INSERT kapsamiyor. Onceki canli envanter, aktif onayli randevular icin tekillik indeksi bulmadi. Mevcut olusturma RPC'si bekleyen kayit olusturuyor; normal musteri akisinin bu acigi kullandigi iddia edilmiyor.

Kabul: yetkili istemciler dahi genel alan guncellemesiyle rezervasyon protokolunu atlayamamali. Dogrudan confirmed INSERT reddi veya guvenli rezervasyon yolu tanimlanmali. Aktif onayli tarih/saat icin kismi unique index ek savunma olarak degerlendirilmeli; once mevcut cakismalar salt okunur taranmali. Index mevcut slot kilidinin yerine gecmemeli.

### P1: Spring guvenlik testleri deployment guvenligini tamamlamiyor

Kaniti: `ReadSecurityTest.java` JwtDecoder'i mock ediyor; `BookingReadPostgresIT.java` DB sahibiyle baglaniyor ve auth.uid() null donen bir shim kullaniyor. README bu sinirlari dogru belirtiyor.

Eksikler: imzali JWT ile yanlis issuer/audience, suresi dolmus token, yanlis imza, bozuk subject; gercek sinirli DB rolu ile SELECT ve yazma reddi; RLS/JDBC kimlik modelinin staging dogrulamasi. Mevcut guvenlik kodunun yanlis oldugu degil, bu guvencelerin henuz uctan uca kanitlanmadigi sonucuna variliyor.

### P2: Spring yonetici listelemesi mevcut ekrani birebir karsilamiyor

Kaniti: `apiAppointmentRequests.js:34` arsiv, createdAfter, arama, leadQuality ve created_at siralamasi kullaniyor; sayfa 1'den basliyor. `BookingReadService.java` randevu tarihi araligi, status ve sayfa 0 tabanli; arsivi disliyor; tarih/saat/id siraliyor.

DTO telefon, not, musteri aksiyonu ve operasyon metrik alanlarini icermiyor. Bu veri minimizasyonu icin olumlu; fakat mevcut yonetici ekraninin dogrudan yeni endpoint'e baglanmasina yetmiyor. Yetkili detay endpoint'i ve ekran bazli DTO karari gerekli. Listeleme tarihinin is anlami acikca ayrilmali: talebin gelis tarihi ile randevu tarihi ayni degil.

### P2: Musaitlik ve operasyon saati sozlesmesi tamamlanmamis

Spring gecmis gunleri Istanbul tarihine gore eliyor; ayni gunun gecmis saatlerini elemiyor. SQL olusturma dogrulamasi current_date kullaniyor. Bunlar otomatik bug olarak degil, karara baglanmasi gereken sinirlar olarak ele alinmali: bugun gecmis saat secilebilir mi, en az kac dakika once rezervasyon gerekir, DB session timezone ne olacak?

Ayrica slot.is_available hem manuel kapatma hem rezervasyon icin kullaniliyor. Iptal/arsiv tetikleyicisi bunu true yaparken onceki manuel kapatma niyetini saklamiyor. Gun kapaliysa listeleme yine koruyor; slot bazli manuel kapalilik ve rezervasyonun ayrimi ise netlestirilmeli.

### P2: completed ve terminal durum kurallari belirsiz

Confirmed -> completed gecisinde slot serbest birakilmiyor. Bu, gecmis isler icin makul olabilir; gelecek tarihli yanlis tamamlama veya completed kaydi arsivleme gibi yollar icin beklenen davranis belgelenmemis. Evrensel gecis matrisi olmadan bunu otomatik olarak degistirmek dogru degil.

### P2: Yayin ve isletim hazirligi eksik

Spring icin frontend entegrasyon anahtari, ortam bazli yonlendirme/CORS veya ayni-origin proxy karari, staging deploy, health kontrolu, secret yonetimi, izleme ve geri donus proseduru gerekiyor. Kaynak kodda bunlarin tamamlandigina dair kanit bulunmadi. Hikari read-only ayari DB grant'lerinin yerine gecmiyor.

## 5. Karara Baglanacak Islem Kurallari

Asagidaki maddeler oneridir, uygulanmis davranis degildir:

| Komut | Onerilen kural | Hata halinde |
| --- | --- | --- |
| Talep olustur | Bekleyen kayit; slotu kesin ayirmaz | Talep birakma |
| Onayla | Aktif ve uygun durum; slot tekrar dogrulanir | Status/slot degismez |
| Tarih degistir | Onayli kayit icin atomik tasima; bekleyen tercih kesin rezervasyon degil | Eski rezervasyon korunur |
| Iptal et | Izinli durumdan gecis; tekrar cagri tanimli olmali | Yari islem kalmaz |
| Arsivle | Operasyonel iptal mi, sadece gorunurluk mu acikca secilmeli | Status ile kapasite celismemeli |
| Geri al | Onayli duruma donuste hedef yeniden dogrulanir | Arsiv korunur |
| Tamamla | Gelecek tarihli tamamlamaya izin ve slot politikasi belirlenmeli | Terminal durumdan izinsiz gecis olmaz |
| Musteri istegi | Degisiklik/iptal istegi ile gercek uygulama ayrilir | Musteriye kesinlesmis gibi gosterilmez |

Ayrica kim onaylayabilir/geri alabilir, tokenli musteri hangi alanlari gorebilir, ayni komut tekrarlandiginda ne olur ve rakip yonetici guncellemesi nasil bildirilir sorulari yanitlanmali.

## 6. Onerilen Calisma Sirasi

### Asama A: Sozlesme ve mevcut aciklar

1. Durum gecis matrisi, arsiv anlami, saat politikasi ve yetki tablosunu yaz.
2. Mevcut aciklari gecici PostgreSQL'de ureten testleri ekle. Hata ureten testleri ayri beklenen-bug testleriyle kalici olarak mesrulastirma; duzeltmeyle birlikte kabul testine cevir.
3. Canlida salt okunur olarak aktif onay cakismalari ve slot tutarsizliklarini tara; kisi verisi yerine sayim ve gerekli teknik kimliklerle raporla.
4. Versiyonlu SQL degisikligiyle butun giris noktalarini koru. Mevcut slot kilidini muhafaza et; unique index ancak veri temizligi ve migration planiyla eklenmeli.

Cikis: restore/reschedule/confirm yarislarinda en fazla bir aktif rezervasyon; basarisiz tasimada eski rezervasyon kayipsiz; mevcut bes sozlesme testi yesil.

### Asama B: Spring okuma API'sini gecise hazirla

1. HTTP -> security -> controller -> service -> gercek PostgreSQL zincirini test et.
2. Yerel test anahtarlari/JWKS ile JWT olumsuz senaryolarini kanitla; canli tokenlari test fixture'a koyma.
3. Sinirli reader grant'leriyle test calistir; yazma girisiminin DB tarafinda reddini dogrula.
4. Eski/yeni endpoint sozlesme tablosu: alanlar, arsiv, arama, tarih anlami, siralama, sayfalama, yetkiler ve hata cevaplari.
5. Enjekte edilen Clock ile Istanbul gece yarisi, bugun/gecmis ve 90 gun sinir testlerini deterministik hale getir.

Cikis: secilen ilk ekran eski davranisla uyumlu; yetkisiz kullanici veri goremiyor; frontend hata durumunu anlayabiliyor.

### Asama C: Spring yazma komutlari

Genel entity PATCH yerine olustur/onayla/iptal/tasi/arsivle/geri-al komutlari. Transaction sahibi uygulama servisi olmali; mevcut SQL kilitleme davranisi bu transaction icinde korunmali. SQLSTATE/alan hatalari kontrollu HTTP cevaplarina cevrilmeli; cakisma icin 409 gibi istikrarli bir sozlesme belirlenmeli.

Idempotency ozellikle olusturma ve ag tekrarlarinda ele alinmali. Bildirim veya dosya yukleme hatasi DB rollback'iyle ayni sey degildir: commit sonrasi isler icin kalici tekrar-deneme/outbox gereksinimi ayrica belirlenmeli. Foto ekleme akisindaki kismi basari kullaniciya dogru aktarilmali.

Cikis: eszamanlilik ve rollback testleri yalniz JDBC'de degil Spring komut servisi uzerinden de yesil; yasak durum gecisleri ve tekrarlanan istekler testli.

### Asama D: Staging ve kontrollu frontend gecisi

Once hizmet ve musaitlik okumalari; sonra yonetici okumalari; son olarak yazmalar. Her adim ayri geri alinabilir olmali. Canlida ayni istegi iki backend'e yazan dual-write yapilmamali. Gecis suresince eski istemci/RPC erisimi de SQL kurallarina uymali.

Cikis: 320/375/390/430 px ve masaustu kritik akislar, yavas ag/401/403/409/5xx, rol degisimi, liste yenileme, foto yukleme ve takip ekrani regresyonu dogrulanmis; deploy geri donusu denenmis.

### Asama E: Isletim ve olcek

Migration sirasi ve schema parity kapsamini genislet; yedek/geri yukleme proseduru, baglanti havuzu, sorgu timeout ve izleme belirle. Gercekci hacimde EXPLAIN ANALYZE ile sorgulari olc; olcmeden index veya cache ekleme. Offset sayfalamayi ancak hacim gerektiriyorsa cursor modeline tasi.

Teknik metrikler: p95 gecikme, hata orani, DB baglanti bekleme, slot cakismasi, kilit bekleme, basarisiz komut ve bildirim tekrar sayisi. Urun metrikleri: rezervasyon tamamlama, ilk yanit, teyit, bolge disi talep. Olcum tanimi ve payda yeni API'ye geciste degismemeli. Telefon, takip tokeni ve notlar loglanmamali.

## 7. Asgari Test Matrisi

| Senaryo | Bugun | Sonraki kanit |
| --- | --- | --- |
| Ayni slotta iki onay | JDBC testli | Spring komutu uzerinden ayni garanti |
| Onay sonrasi SQL hatasi | JDBC rollback testli | Spring exception/transaction rollback |
| Kilit sahibinin rollback'i | Ayrik yaris testi yok | Bekleyenin basarili olabildigi test |
| Arsivli onayliyi dolu slota geri alma | Yok | Reddet, arsivi ve diger rezervasyonu koru |
| Dolu hedefe tasima | Yok | Eski slot ve kayit degismez |
| Iki yonlu/ayni hedefe tasima | Yok | Kilit sirasi, cakisma ve timeout davranisi |
| Confirm ile cancel/archive yarisi | Yok | Tutarlı son durum ve slot sahipligi |
| Yetkili/yetkisiz DB profili | Servis testli | HTTP ve sinirli DB roluyle birlikte |
| JWT imza/issuer/audience/expiry | Mock kapsaminda degil | Gercek decoder ile olumsuz testler |
| Listeleme tip/esleme/filtre | PostgreSQL testli | HTTP serialization ve frontend uyumu |
| Gece yarisi/gecmis saat | Kismi, sistem saatli | Sabit Clock ve kararlastirilmis kural |
| Uretim schema/grant esligi | Iki fonksiyon + trigger | Kullanilan tum nesneler ve migration sirasi |

## 8. Sonuc ve Ilk Teslimat

Bir sonraki paket Asama A olmali: onaylanabilir islem kurallari belgesi, restore/reschedule regresyon testleri ve gerekli SQL duzeltmesi. Guvenlik/okuma uyumu Asama B ile paralel ilerleyebilir. Henuz tum backend'in tasinmasi veya genel CRUD endpoint'leri onerilmiyor.

Bu raporda uygulama kodu, canli veri veya schema degistirilmedi; commit/push/merge yapilmadi. Sure tahmini, arsiv ve tamamlanma kurallari kesinlesmeden verilmedi.
