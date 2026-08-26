# Ankara Usta — Araştırma ve Geliştirme Planı

Sürüm: 1.1
Tarih: 26 Ağustos 2026
Pazar: Ankara pilotu

## 1. Planın amacı

Bu plan, mevcut görsel ana sayfa prototipini gerçek bir full-stack hizmet pazaryerine dönüştürmek için araştırma ve geliştirme çalışmalarının sırasını tanımlar. Amaç tüm ekranları önce üretmek değil; her aşamada kullanıcıya ve operasyona değer sağlayan, baştan sona çalışan dikey ürün dilimleri oluşturmaktır.

Temel hedef yolculuk:

```text
Sorunu anlat
→ hizmeti ve kapsamı doğrula
→ talebi yayımla
→ uygun ustaları eşleştir
→ teklifleri karşılaştır
→ ustayı seç
→ işi aşamalarıyla takip et
→ işi kabul et
→ değerlendirme ve garanti
```

## 2. Mevcut durumda hazır olanlar

### Ürün araştırması

- Ankara odaklı MVP ürün gereksinimleri.
- Müşteri, usta ve yönetici rolleri.
- Paket, teklif ve keşif olmak üzere üç hizmet sunum modeli.
- İş yaşam döngüsü, değerlendirme, iş günlüğü ve uyuşmazlık yaklaşımı.
- Mahalle/ilçe temelli gizlilik ve güven ilkeleri.

### Hizmet bilgisi

- Altı ana kategori.
- Veritabanına aktarılabilir 26 hizmet.
- Hizmet alias’ları, problem ifadeleri ve standart kapsam alanları.
- Altı hizmet için özel soru ağaçları; kalan 20 hizmet için ortak başlangıç soruları.
- Ortak sihirbaz adımları ve sınıflandırma güven eşikleri.

### Tasarım araştırması

- Taskrabbit’in 14 temel sayfa türü ve mobil davranışı.
- Ana sayfa, hizmet dizini, rezervasyon, usta başvurusu, yerel hizmet, fiyat rehberi ve destek kalıpları.
- “Modern yerel zanaatkârlık” marka ve güven sistemi araştırması.
- Çalışan, fakat henüz gerçek veri ve backend kullanmayan ana sayfa prototipi.

### Veri modeli taslağı

- Profil, hizmet, bölge, usta, talep, eşleşme, teklif, iş, mesaj, medya, değerlendirme, garanti ve uyuşmazlık varlıkları.
- Sürümlü teklif ve onaylı kapsam değişikliği yaklaşımı.
- Öncesi–sonrası medya doğrulama kuralları.

## 3. Kapanması gereken araştırma açıkları

Geliştirmeyle paralel ilerleyebilir; ancak ilgili özelliğin canlıya çıkışından önce tamamlanmalıdır.

### R1 — Ankara arz araştırması

Amaç: Her `hizmet × ilçe` alanında gerçek usta arzını anlamak.

Çalışmalar:

- İlk dokuz aday ilçede hizmet veren ustalarla görüşme.
- Hizmet, çalışma bölgesi, müsaitlik, keşif tercihi ve yanıt süresi toplama.
- Her pilot hücre için doğrulanabilir aktif usta sayısı.
- Usta edinme maliyeti ve başvuru terk nedenleri.

Çıkış ölçütü:

- Pilot açılacak her hizmet/ilçe alanında en az üç doğrulanmış aktif usta veya açıkça tanımlanmış manuel yönlendirme modeli.

### R2 — Müşteri problem ve dil araştırması

Amaç: Kullanıcıların sorunlarını gerçekte hangi kelimelerle anlattığını öğrenmek.

Çalışmalar:

- Umut Usta geçmiş talep metinlerini kişisel veriden arındırarak inceleme.
- En az 20 potansiyel müşteriyle problem cümlesi testi.
- Alias, yazım hatası, belirti ve gündelik terim sözlüğü.
- Sınıflandırmanın en çok karıştırdığı hizmet çiftleri.

Çıkış ölçütü:

- 26 hizmet için yeterli gerçek problem cümlesi seti.
- İlk üç aday içinde doğru hizmeti gösterme hedefi en az `%90`.

### R3 — Fiyat ve standart kapsam araştırması

Amaç: Paket ve teklif karşılaştırmasını güvenilir hale getirmek.

Çalışmalar:

- 26 hizmetin dahil/hariç kapsamı.
- Paket işlerde adet, ölçü, yüzey ve malzeme sınırları.
- Ankara ilçe bazlı başlangıç fiyatı/aralık araştırması.
- Keşif bedeli ve işe mahsup uygulaması.
- Fiyatı değiştiren soru ve koşullar.

Çıkış ölçütü:

- İlk canlı paketlerin fiyat ve kapsamı en az beş usta görüşmesiyle doğrulanmış olmalı.
- Kullanıcı, ek ücret doğurabilecek koşulları rezervasyondan önce görebilmeli.

### R4 — Belge, güvenlik ve operasyon kuralları

Amaç: Tehlikeli veya uzmanlık gerektiren işleri güvenli yönlendirmek.

Çalışmalar:

- Elektrik, gaz, kaynak ve benzeri alanlarda gerekli belge/yeterlilik araştırması.
- Aktif su basması, yangın, gaz ve elektrik riski uyarıları.
- Platformun acil servis olmadığı durumlar.
- Belge son kullanma, red ve yeniden değerlendirme kuralları.

Çıkış ölçütü:

- Her riskli hizmet için zorunlu belge, uyarı ve moderasyon kuralı yazılı olmalı.

### R5 — Garanti, iptal ve uyuşmazlık politikası

Amaç: Arayüzde verilen güven sözünün operasyonel karşılığını tanımlamak.

Çalışmalar:

- “Dijital işçilik belgesi” ve ticari garanti ayrımı.
- İptal, geç kalma, gelmeme ve kapsam değişikliği politikası.
- Kanıt toplama, yanıt süresi ve moderasyon yetkileri.
- Profil yaptırımı ve itiraz süreci.

Çıkış ölçütü:

- Kullanıcıya gösterilen her güvence metni uygulanabilir bir operasyon prosedürüne bağlı olmalı.

## 4. Teknik karar kapısı

İlk kalıcı veri geliştirmesinden önce kısa bir mimari karar belgesi hazırlanmalıdır.

Karar verilecek başlıklar:

- Kimlik doğrulama sağlayıcısı.
- İlişkisel veritabanı ve migration yaklaşımı.
- Fotoğraf/video nesne depolama.
- Mesajlaşma için gerçek zamanlı veya periyodik yenileme modeli.
- Arama/sınıflandırma motorunun konumu.
- SMS/telefon doğrulama sağlayıcısı.
- E-posta ve bildirim sağlayıcısı.
- Yönetim ve denetim kayıtlarının saklanması.

Değerlendirilecek iki ana yol:

1. Mevcut Sites projesiyle uyumlu yerel yetenekler: Auth + D1 + R2.
2. PostgreSQL tabanlı harici backend: Auth + ilişkisel veri + nesne depolama + gerçek zamanlı mesajlaşma.

Karar ölçütleri:

- Yetkilendirme ve satır seviyesinde veri güvenliği.
- Migration ve yedekleme kolaylığı.
- Mesajlaşma ve medya desteği.
- Ankara pilotunun maliyeti.
- Başlangıç seviyesinde sürdürülebilir geliştirme.
- İleride Ankara dışına ölçeklenme.

## 5. Geliştirme ilkeleri

1. Taksonomi ve soru ağaçları kod içine dağınık sabitler olarak gömülmez; tek veri kaynağından okunur.
2. Önce mobil müşteri yolculuğu, sonra geniş masaüstü düzen.
3. Her sprint sonunda çalışan bir kullanıcı sonucu bulunur.
4. Tam adres, telefon ve kişisel medya yalnızca gerekli rol ve aşamada gösterilir.
5. Kritik durum geçişleri backend tarafından doğrulanır.
6. Teklif ve kapsam geçmişi üzerine yazılmaz; sürümlenir.
7. Tasarım sistemi ortak bileşenlere ayrılmadan yeni sayfa çoğaltılmaz.
8. Gerçek operasyon verisi yoksa ekranda üretim metriği gibi gösterilmez; açıkça demo işaretlenir.
9. Analitik olayları kişisel veri taşımaz.
10. Özellik tamamlanması yalnızca arayüzün görünmesi değil, başarı ve hata durumlarının çalışmasıdır.

## 6. Geliştirme fazları

Süreler tek geliştirici için yaklaşık tahmindir. Ekip büyüklüğüne göre paralelleştirilebilir.

### Faz 0 — Ürün ve mimari kararları

Tahmin: 1–2 hafta

Durum: Mühendislik baseline'ı 26 Ağustos 2026 tarihinde tamamlandı. Pazar araştırması ve sağlayıcı seçimi çalışmaları ilgili fazlara devam eder.

Araştırma:

- R1–R5 çalışmalarını başlatma.
- Pilot ilçe ve ilk paket hizmetleri seçme.
- Veri/backend mimarisi kararı.
- Gerçek metrik ile demo içeriğinin ayrılması.

Geliştirme:

- Route ve modül haritası.
- Ortam, secret ve migration stratejisi.
- Hata izleme ve analitik olay sözleşmesi.
- Tasarım tokenlarının mevcut ana sayfadan ortak sisteme alınması.
- Vitest, Testing Library ve Playwright test altyapısı.
- Lint, type-check, coverage, build ve E2E kalite kapısı.
- GitHub Actions CI workflow'u.
- Domain terimleri sözlüğü ve gereksinim–test izlenebilirlik matrisi.
- Backend, authentication ve storage ADR belgeleri.

Teslimatlar:

- Mimari karar belgesi.
- Pilot kapsam matrisi.
- Ortam ve yayın stratejisi.
- P0 backlog ve bağımlılık haritası.
- Çalışan unit, component ve E2E başlangıç testleri.

Çıkış ölçütü:

- Backend, auth ve depolama seçimi yazılı ve gerekçeli.
- İlk canlı dikey dilimin hizmetleri ve ilçeleri belli.

### Faz 1 — Ürün temeli ve hizmet kataloğu

Tahmin: 2 hafta

Mühendislik alt fazı — 26 Ağustos 2026 tarihinde tamamlandı:

- UI'dan bağımsız `Service`, `Request`, `Quote`, `Job` ve `UserRole` domain modelleri.
- Zod tabanlı çalışma zamanı şema doğrulaması.
- Talep ve iş durum makineleri; geçersiz geçişlerin domain katmanında reddedilmesi.
- Altı kategori ve 26 hizmet için ID, slug, sıra ve kategori referansı bütünlük kontrolleri.
- Altı özel wizard ile ortak fallback tanımının UI dışındaki veri katmanına taşınması.
- Kalan 20 hizmet için `docs/engineering/WIZARD-BACKLOG.md` soru ağacı backlog'u.

Geliştirme:

- Tasarım sistemi: buton, giriş, kart, rozet, modal, adım göstergesi, durum etiketi.
- Responsive header, footer ve ortak sayfa kabuğu.
- Altı kategori ve 26 hizmetin veri kaynağına aktarılması.
- `/hizmetler`, kategori ve hizmet detay sayfaları.
- Hizmette dahil/hariç, süre, malzeme, keşif ve fiyat gösterimi.
- Ankara ilçe veri kaynağı.

Teslimatlar:

- Veriden çalışan hizmet dizini.
- En az iki farklı hizmet modeli için detay sayfası.
- Ortak tasarım bileşenleri.

Çıkış ölçütü:

- Hizmet adı veya kapsam değişikliği tek veri kaynağından bütün ilgili ekranlara yansır.
- Masaüstü ve mobil temel erişilebilirlik kontrolü geçer.

### Faz 2 — Sorun araması ve talep sihirbazı

Tahmin: 3–4 hafta

Araştırma:

- R2 problem cümlesi setiyle sınıflandırma testi.
- Beş temsilî hizmette kullanılabilirlik testi.
- Soru bazlı terk ve anlaşılmayan terim testi.

Geliştirme:

- Kural tabanlı doğal dil sınıflandırma.
- Güven skoru, alternatif adaylar ve “Birlikte belirleyelim”.
- Risk bayrakları ve güvenlik uyarıları.
- 26 hizmetin dallanan soru ağaçlarını çalışan forma bağlama.
- Geri dönüşte yanıt koruma ve taslak kaydetme.
- Fotoğraf/video çekim rehberi ve yükleme.
- İlçe/mahalle, erişim, zaman/aciliyet.
- Düzenlenebilir kapsam özeti.

Teslimatlar:

- Anasayfa aramasından başlayan gerçek talep akışı.
- Paket, teklif ve keşif için üç ayrı sonuç ekranı.
- Talep taslağı ve gönderilmiş talep kaydı.

Çıkış ölçütü:

- Kullanıcı en az beş pilot hizmette baştan sona talep oluşturabilir.
- Yanlış sınıflandırmayı düzeltebilir.
- Yenileme veya geri dönüşte taslak kaybolmaz.
- Yüklenen medya yalnızca yetkili kullanıcı tarafından görülebilir.

### Faz 3 — Hesaplar ve usta başvurusu

Tahmin: 3 hafta

Araştırma:

- Usta başvuru formunun 8–12 usta ile testi.
- Belge yükleme ve red nedenlerinin anlaşılabilirliği.

Geliştirme:

- Müşteri hesabı ve telefon doğrulama.
- Usta rolü ve başvuru profili.
- Hizmet, ilçe/mahalle ve müsaitlik seçimi.
- Belge ve referans işi yükleme.
- Başvuru durumları: taslak, gönderildi, incelemede, düzeltme istendi, onaylandı, reddedildi.
- Yönetici başvuru inceleme kuyruğu.
- Rol ve veri erişim kontrolleri.

Teslimatlar:

- Müşteri kayıt/giriş akışı.
- Usta başvuru akışı.
- İlk yönetici moderasyon ekranı.

Çıkış ölçütü:

- Usta başvurusu baştan sona incelenip onaylanabilir.
- Doğrulanmamış belge profilde doğrulanmış görünmez.
- Müşteri ve usta birbirinin özel verilerine yetkisiz erişemez.

### Faz 4 — Eşleştirme ve teklifler

Tahmin: 3–4 hafta

Araştırma:

- Eşleşme ağırlıklarını operasyon ekibiyle değerlendirme.
- Ustaların “talep yeterince açıklayıcı” geri bildirimi.
- Teklif karşılaştırma prototipinin müşteri testi.

Geliştirme:

- Hizmet, bölge, müsaitlik ve doğrulama filtreleri.
- Açıklanabilir eşleştirme puanı.
- Arz yetersizliğinde bekleme listesi veya manuel yönlendirme.
- Ustanın talep ayrıntısı ve teklif oluşturması.
- İşçilik, malzeme, süre, başlangıç, garanti ve hariç kapsam alanları.
- Teklif sürümleri.
- Müşteriye en fazla üç teklifin yan yana karşılaştırılması.
- Teklif kabulü ve usta seçimi.

Teslimatlar:

- Talebin uygun ustalara dağıtılması.
- Usta teklif ekranı.
- Müşteri teklif karşılaştırma ekranı.

Çıkış ölçütü:

- Eşleşmenin nedeni yönetici tarafından görülebilir.
- Kabul edilen teklif sürümü değiştirilemez.
- Fiyatlar aynı kapsam alanları üzerinden karşılaştırılır.

### Faz 5 — Mesajlaşma ve iş yaşam döngüsü

Tahmin: 3–4 hafta

Geliştirme:

- Talep/işe bağlı mesajlaşma.
- Kontrollü medya eki.
- İletişim ve adres maskeleme.
- İş durumu geçişleri ve zaman çizelgesi.
- Keşif randevusu.
- İşe başlama ve müşteri kabulü.
- İki taraf onaylı kapsam değişikliği.
- Bildirim merkezi ve gerekli SMS/e-posta bildirimleri.

Teslimatlar:

- Müşteri ve usta iş odası.
- İş zaman çizelgesi.
- Kapsam değişikliği onayı.

Çıkış ölçütü:

- İzin verilmeyen durum geçişi backend tarafından reddedilir.
- Her değişiklik aktör ve zamanla denetim kaydı üretir.
- Tam adres yalnızca doğru aşamada seçilen ustaya açılır.

### Faz 6 — İş kanıtı, değerlendirme ve garanti

Tahmin: 3 hafta

Geliştirme:

- Öncesi, sırası, malzeme ve sonrası iş günlüğü.
- Müşteri kabulü ve dijital işçilik belgesi.
- Yalnızca tamamlanan işe bağlı değerlendirme.
- İşçilik, iletişim, zamanlama ve kapsam/fiyat puanları.
- Mahalle için minimum örneklem; yetersizse ilçe metriği.
- Usta profili ve doğrulanmış vaka sayfası.
- Tekrar çağırma akışı.

Teslimatlar:

- Doğrulanmış öncesi–sonrası vaka.
- Gerçek iş metrikleri kullanan usta profili.
- Değerlendirme ve garanti ekranları.

Çıkış ölçütü:

- Öncesi ve sonrası olmayan iş “doğrulanmış vaka” olamaz.
- Yayın izni olmayan medya kamuya açılmaz.
- Platform dışı referanslar platform işi metriğine eklenmez.

### Faz 7 — Şikâyet, uyuşmazlık ve yönetim paneli

Tahmin: 3 hafta

Geliştirme:

- Şikâyet ve kanıt oluşturma.
- `opened → evidence_requested → under_review → resolved → closed` durumları.
- Moderasyon notları ve denetim kayıtları.
- Kullanıcı/usta yaptırımları ve itiraz.
- Taksonomi ve soru şablonu yönetimi.
- Hizmet/ilçe arz ekranı.
- Talep, eşleşme, teklif ve iş operasyon görünümü.
- Medya ve mesaj bildirim kuyruğu.

Teslimatlar:

- Operasyon ve moderasyon paneli.
- Uyuşmazlık vaka ekranı.
- Yetki matrisi ve denetim kayıtları.

Çıkış ölçütü:

- Moderatör işlemleri gerekçe ve zamanla kaydedilir.
- Yetki seviyeleri owner/admin/moderator olarak ayrılır.
- Yaptırım otomatik ve açıklamasız uygulanmaz.

### Faz 8 — Ankara kapalı beta ve pilot

Tahmin: 3–4 hafta

Araştırma ve operasyon:

- 20–30 müşteri ve yeterli pilot usta ile kapalı beta.
- Beş ana yolculuk için görev bazlı kullanılabilirlik testi.
- Destek, iptal, gelmeme ve uyuşmazlık tatbikatı.
- İlçe/hizmet arz ve yanıt süresi takibi.

Geliştirme:

- Performans, erişilebilirlik ve güvenlik düzeltmeleri.
- Hata, boş, bekleme ve düşük arz durumları.
- Analitik panosu.
- SEO hizmet ve ilçe sayfaları.
- Yedekleme ve operasyon runbook’u.

Pilot çıkış ölçütleri:

- Talep oluşturma başarı oranı hedefi `%70+`.
- Yayınlanan taleplerin `%80+` bölümünde yeterli eşleşme.
- İlk teklif medyan süresi hedeflenen operasyon sınırında.
- Kritik yetkilendirme veya veri sızıntısı bulgusu yok.
- Uyuşmazlık vakalarının tamamında kayıtlı süreç işletilebiliyor.
- Operasyon ekibi geliştirici müdahalesi olmadan başvuru ve vaka yönetebiliyor.

## 7. Önceliklendirilmiş ürün kapsamı

### P0 — MVP için zorunlu

- Müşteri hesabı.
- Usta hesabı, başvurusu ve doğrulama.
- Yönetici/moderatör rolleri.
- Altı kategori ve 26 hizmet.
- Doğal dil araması ve talep sihirbazı.
- Güvenli medya yükleme.
- Hizmet/bölge eşleştirmesi.
- Teklif oluşturma ve karşılaştırma.
- Mesajlaşma.
- İş durumu takibi.
- Değerlendirme.
- Şikâyet/uyuşmazlık.
- Yönetim paneli.

### P1 — Pazaryeri kalitesi

- Paket işler ve gerçek randevu slotları.
- Teklif sürümleri ve kapsam değişikliği.
- Öncesi–sonrası iş günlüğü.
- Dijital işçilik belgesi.
- Yerel usta metrikleri.
- Tekrar çağırma.
- Fiyat ve maliyet rehberleri.

### P2 — Pilot sonrası farklılaşma

- Gelişmiş doğal dil/AI destekli sınıflandırma.
- Ardışık çoklu iş yönlendirmesi: tesisat → sıva → boya.
- Apartman/site yöneticisi referansları.
- Usta ekip/işletme hesapları.
- Gelişmiş müsaitlik ve rota optimizasyonu.

### P3 — Ölçek

- Ankara dışı şehirler.
- Platform içi ödeme ve emanet hesap.
- Native mobil uygulama.
- Abonelik, kurumsal hesap ve iş ortaklıkları.

## 8. İlk üç geliştirme sprinti

### Sprint 1 — Veriye dayalı hizmet temeli

- Tasarım bileşenlerini ayır.
- 6 kategori/26 hizmet verisini uygulamaya bağla.
- Hizmet dizini ve iki hizmet detay şablonu oluştur.
- Demo metrik ve fiyatları açık biçimde işaretle.
- Mimari karar belgesini tamamla.

Gösterilebilir sonuç: Kullanıcı ana sayfadan gerçek taksonomiyle çalışan bir hizmet detayına gider.

### Sprint 2 — Sınıflandırma ve beş hizmetlik sihirbaz

- Doğal dil kural motoru.
- Güven skoru ve alternatifler.
- Elektrik, su kaçağı, TV montajı, tek oda boya ve kapı onarımı soru ağaçları.
- Kapsam özeti.
- Risk uyarıları.

Gösterilebilir sonuç: Kullanıcı sorun cümlesinden başlayarak düzenlenebilir yapılandırılmış kapsam üretir.

### Sprint 3 — Kalıcı talep ve müşteri hesabı

- Auth ve müşteri profili.
- Talep taslağı ve gönderim.
- İlçe/mahalle seçimi.
- Kontrollü fotoğraf yükleme.
- Müşteri “Taleplerim” ekranı.
- Yönetici için temel talep listesi.

Gösterilebilir sonuç: Doğrulanmış müşteri gerçek talep oluşturur ve durumunu hesabında görür.

## 9. Test stratejisi

### Ürün testleri

- Görev bazlı kullanılabilirlik testi.
- Sınıflandırma doğruluk seti.
- Soru ağacı dal kapsaması.
- Teklif karşılaştırma anlama testi.
- Usta başvuru tamamlama testi.

### Teknik testler

- Birim: sınıflandırma, eşleştirme puanı, fiyat/kapsam kuralları, durum geçişleri.
- Entegrasyon: auth, veritabanı, medya, bildirim.
- Uçtan uca: müşteri talebi, usta teklifi, seçim, iş, değerlendirme, uyuşmazlık.
- Yetkilendirme: müşteri/usta/moderatör veri erişimi.
- Dosya güvenliği: tür, boyut, zararlı içerik ve yayın izni.
- Responsive: 390, 768 ve 1440 px.
- Erişilebilirlik: klavye, odak, etiket, hata mesajı ve azaltılmış hareket.

## 10. Ölçüm planı

### Talep hunisi

- Ana sayfa arama başlatma.
- Arama gönderme.
- Sınıflandırma önerisi gösterme.
- Öneriyi onaylama/düzeltme.
- Sihirbaz başlatma ve adım tamamlama.
- Talep gönderme.

### Pazaryeri

- Hizmet/ilçe başına doğrulanmış aktif usta.
- Eşleşme bulunan talep oranı.
- İlk teklif süresi.
- Teklif seçme oranı.
- İşe dönüşüm ve tamamlanma.
- Zamanında başlama.
- Kapsam/fiyat değişikliği.

### Güven ve kalite

- Öncesi–sonrası tamamlanma oranı.
- Tekrar çağırma.
- Uyuşmazlık açılma ve çözülme.
- Doğrulama red/sona erme.
- Müşteri ve usta destek talepleri.

## 11. Başlıca bağımlılıklar ve riskler

| Risk | Etki | Önlem |
|---|---|---|
| Yetersiz usta arzı | Talep karşılanamaz | Hizmet/ilçe eşiği, kademeli açılış, manuel yönlendirme |
| Yanlış hizmet sınıflandırma | Yanlış usta ve kötü teklif | Güven skoru, alternatifler, kullanıcı düzeltmesi |
| Fiyat anlaşmazlığı | Güven ve destek maliyeti | Standart kapsam, sürümlü teklif, iki taraflı değişiklik onayı |
| Sahte değerlendirme | Platform güveni düşer | Yalnızca tamamlanan işe bağlı yorum |
| Yanıltıcı portföy | Yanlış usta seçimi | Bağımsız referans ile platform işini ayırma |
| Kişisel veri sızıntısı | Yüksek hukuki ve güven riski | Rol tabanlı erişim, tam adresi geç paylaşma, özel medya politikası |
| Operasyonun kodla yürütülmesi | Ölçeklenemez | Erken yönetim paneli ve runbook |
| Demo verisinin gerçek sanılması | Yanlış beklenti | Demo etiketi, canlıda yalnızca hesaplanan metrik |

## 12. MVP tamamlanma tanımı

MVP aşağıdaki yolculuk canlı Ankara pilotunda uçtan uca çalıştığında tamamlanmış sayılır:

1. Müşteri sorunu doğal dille anlatır.
2. Hizmeti ve yapılandırılmış kapsamı onaylar.
3. Fotoğraf ve yaklaşık konumla talep oluşturur.
4. Sistem uygun doğrulanmış ustaları bulur.
5. Müşteri en fazla üç karşılaştırılabilir teklif alır.
6. Ustayı seçer ve işi aşamalarıyla izler.
7. Kapsam değişiklikleri iki tarafça onaylanır.
8. İş öncesi–sonrası kanıt ve müşteri kabulüyle tamamlanır.
9. Müşteri doğrulanmış değerlendirme bırakır.
10. Yönetici başvuruları, hizmetleri, talepleri ve uyuşmazlıkları yönetebilir.

## 13. Bir sonraki uygulama adımı

Bir sonraki geliştirme çalışması Faz 0 ve Sprint 1’i birlikte başlatmalıdır:

1. Teknik mimari kararını ver.
2. Mevcut ana sayfadaki demo veriyi gerçek taksonomiden ayır.
3. Tasarım sistemini yeniden kullanılabilir bileşenlere böl.
4. 6 kategori/26 hizmeti uygulamanın tek veri kaynağı yap.
5. `/hizmetler` ve ilk iki hizmet detay sayfasını oluştur.

İlk iki temsilî hizmet önerisi:

- TV duvar montajı — paket modelini doğrular.
- Su kaçağı tespiti — keşif, risk ve dallanan soru modelini doğrular.

Bu ikili, platformun en basit ve en karmaşık temel akışlarını erken aşamada test eder.
