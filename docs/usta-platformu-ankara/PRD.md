# Orkestra Platformu — MVP Ürün Gereksinimleri

## Ürün özeti

- Pazar: Yalnızca Ankara
- Ürün: Müşteri ile bağımsız ustaları buluşturan iki taraflı hizmet pazaryeri
- Giriş modeli: Müşteri kategori bilmeden sorununu doğal dille anlatır
- MVP kategorileri: Elektrik; su tesisatı; paketlenmiş işler, mobilya ve montaj; boya ve küçük tadilat; kaynak, demir ve kapı sistemleri
- Temel vaat: Talebi, kapsamı, teklifi, işi ve garantiyi başından sonuna şeffaf yönetmek

## Problem

Müşteri hangi ustaya ihtiyacı olduğunu, işin kapsamını ve yaklaşık bedelini çoğu zaman bilemez. Ustanın yeterliliğini doğrulamak ve sözlü anlaşmaları takip etmek zordur. Usta tarafında ise eksik tanımlanmış talepler, boşa keşif ve teklif emeği, dağınık iletişim ve iyi işçiliği kanıtlama problemi vardır.

## Kullanıcılar

- **Müşteri:** Ankara'da ev, apartman, site, ofis veya küçük işletme için tamir, montaj, bakım ya da küçük tadilat arayan kişi.
- **Usta:** MVP kategorilerinden en az birinde Ankara'nın seçtiği bölgelerinde hizmet veren birey, ekip veya işletme.
- **Yönetici/moderatör:** Usta başvurularını, belgeleri, taksonomiyi, talepleri, medyayı ve uyuşmazlıkları yöneten ekip.

## Ankara pilotu

Veri modeli Ankara'nın tüm ilçelerini destekler; operasyon yeterli usta bulunan ilçelerde kademeli açılır. İlk adaylar Çankaya, Yenimahalle, Keçiören, Etimesgut, Sincan, Mamak, Altındağ, Gölbaşı ve Pursaklar'dır.

Bir `hizmet × ilçe` alanı, öneri olarak en az 3 doğrulanmış ve aktif usta olmadan “anında eşleşme” vaadiyle açılmaz. Yetersiz arzda müşteri bekleme listesine veya manuel yönlendirmeye alınır.

## Ürün ilkeleri

1. Kategori değil sorun odaklı başlangıç
2. Tekliften önce açık ve karşılaştırılabilir iş kapsamı
3. Tek rozet yerine kanıta dayalı güven göstergeleri
4. Yalnızca sonuç değil öncesi–sırası–sonrası iş kaydı
5. Açık adresi ve müşteriyi ifşa etmeyen mahalle temelli itibar
6. Standart işlerde hızlı rezervasyon, karmaşık işlerde teklif veya keşif
7. Her kritik değişikliğin kayıtlı ve iki tarafça görülebilir olması

## Ana deneyim: “Sorununu anlat”

Anasayfanın ana öğesi Google benzeri büyük bir doğal dil alanıdır. Örnekler:

- “Banyodan alt kata su akıyor.”
- “Salona iki avize ve TV askı aparatı takılacak.”
- “Bahçe kapısı kapanmıyor, menteşesi kırılmış olabilir.”

Sistem olası hizmeti, risk uyarılarını, eksik bilgileri tamamlayan soruları ve uygun hizmet modelini çıkarır. Düşük güven durumunda kesin karar vermez; en fazla üç seçenek veya “Birlikte belirleyelim” sunar. Kullanıcı yapılandırılmış talep özetini onaylamadan talep yayımlanmaz.

MVP'de açıklanabilir kural tabanlı sınıflandırma kullanılabilir: hizmet adı, eş anlamlılar, problem ifadeleri ve soru cevapları. Yapay zekâ zorunlu değildir; ileride yardımcı sınıflandırıcı olarak eklenebilir.

## Hizmet sunum modelleri

### Paket

Avize, TV, musluk, korniş, hazır mobilya ve tek oda boya gibi sınırları öngörülebilen işler. Paket; adet/ölçü sınırı, dahil-hariç kapsam, süre, malzeme sorumluluğu ve ek ücret koşullarını açıklar.

### Teklif

Fotoğraf, ölçü veya ayrıntı gerektiren işler. Müşteriye en fazla 3 karşılaştırılabilir teklif gösterilir. Her teklif işçilik, malzeme, süre, başlangıç, keşif, garanti ve hariç tutulanları aynı yapıda sunar.

### Keşif

Yerinde inceleme olmadan güvenilir fiyat verilemeyen işler. Keşif bedeli ve işe mahsup edilip edilmeyeceği önceden belirtilir.

## MVP kapsamı ve kabul ölçütleri

### Hesaplar

- Müşteri ve usta telefon doğrulamasıyla hesap açabilir.
- Usta ayrıca başvuru profili tamamlar.
- Yönetim rolleri en az `owner`, `admin`, `moderator` olarak ayrılır.
- Kullanıcılar yalnızca yetkili oldukları kişisel ve operasyonel verileri görür.

### Usta güven seviyesi

Telefon, adres/bölge, mesleki belge ve referans işleri ayrı kanıtlar olarak tutulur. Her biri `not_submitted`, `pending`, `verified`, `rejected` veya `expired` durumundadır. Doğrulanmamış bilgi doğrulanmış gibi gösterilmez.

Profilde ayrıca tamamlanan iş, zamanında gelme, tekrar çağrılma, sorunsuz tamamlanma ve yanıt performansı gösterilebilir. Yeterli örneklem oluşmadan oran yayımlanmaz.

### Hizmet ve bölge seçimi

- Usta aktif hizmetleri ve Ankara'da hizmet verdiği ilçe/mahalleleri seçer.
- Her hizmet için deneyim, fiyat yaklaşımı, keşif tercihi ve müsaitlik tanımlar.
- Teklif kabul edilmeden ustaya müşterinin tam adresi gösterilmez.

### Talep sihirbazı

- Müşteri sorun metniyle veya kategori seçerek başlayabilir.
- Hizmete özgü sorular, gerekli fotoğraf/video ve konum bilgisi alınır.
- Göndermeden önce kapsam özeti gösterilir.
- Elektrik, yangın, gaz veya aktif su basması gibi risklerde güvenlik uyarısı gösterilir; platform acil servis gibi davranmaz.

### Eşleştirme

Hizmet, bölge, müsaitlik, doğrulama, yanıt performansı, tamamlanan işler, uyuşmazlık oranı ve yerel performans kullanılır. MVP açıklanabilir puan tabanlı çalışır; eşleşme nedenleri yönetici tarafından incelenebilir.

### Teklif

- Bir talepte müşteriye en fazla 3 aktif teklif sunulur.
- Teklifler aynı alanlarla karşılaştırılır.
- Değişen teklif yeni sürüm oluşturur; geçmiş kaybolmaz.
- Kabul edilen kapsam ancak iki tarafın onayladığı değişiklik kaydıyla genişletilir.

### Mesajlaşma

- Mesajlar talep veya işe bağlıdır.
- Kontrollü fotoğraf/dosya ekleri desteklenir.
- Hassas iletişim ve adres bilgileri uygun aşamaya kadar maskelenir.
- Moderasyon erişimi gerekçeli ve denetim kayıtlıdır.

### İş yaşam döngüsü

```text
submitted
→ matching
→ quotes_received
→ provider_selected
→ discovery_scheduled (gerekiyorsa)
→ in_progress
→ awaiting_customer_approval
→ completed
→ warranty_active
→ closed
```

Alternatif sonlar: `cancelled`, `expired`, `disputed`. Her geçiş aktör, zaman ve açıklamayla kaydedilir; izin verilen geçişler backend tarafından doğrulanır.

### İş günlüğü ve portföy

- Teklif kapsamı, onaylı değişiklikler, malzeme ve süreç kayıtları işe bağlanır.
- Öncesi kaydı olmayan vaka “platformda doğrulanmış iş” olamaz.
- Sonrası fotoğrafı müşteri kabulünden sonra doğrulanmış tamamlanmış iş etiketi alır.
- Ustanın platform dışı işleri “bağımsız referans” olarak yayımlanabilir; tamamlanan platform işi metriklerine girmez.
- Medya yayını için açık izin kaydedilir.

### Değerlendirme ve mahalle güveni

- Yalnızca tamamlanan işin tarafları değerlendirme yapar.
- İşçilik, iletişim, zamanlama ve kapsam/fiyat uyumu ayrı puanlanır.
- Mahalle metriği için örneğin en az 5 tamamlanmış iş/değerlendirme gerekir; aksi halde ilçe seviyesi gösterilir.
- Müşteri adı, açık adresi, bina/site adı ve kesin konum kamuya açıklanmaz.

### Şikâyet ve uyuşmazlık

Taraflar iş üzerinden vaka ve kanıt oluşturabilir. Durumlar: `opened`, `evidence_requested`, `under_review`, `resolved`, `closed`. Profil yaptırımı otomatik değil, kayıtlı moderasyon kararıyla uygulanır.

### Yönetim paneli

- Usta ve belge başvuruları
- Hizmetler, paketler ve soru şablonları
- İlçe/mahalle arz görünümü
- Talep, eşleşme, teklif ve iş takibi
- Mesaj/medya bildirimleri
- Uyuşmazlıklar ve yaptırımlar
- Yetki ve denetim kayıtları
- Pazaryeri dönüşüm ve kalite metrikleri

## Standart hizmet kartı

Her hizmette şu alanlar bulunur:

- Ad, açıklama, eş anlamlı ve problem ifadeleri
- Kategori ve sunum modeli
- Dahil/hariç kapsam
- Tahmini süre
- Fiyat gösterim tipi; isteğe bağlı başlangıç/aralık
- Malzeme sorumluluğu
- Usta ekipmanı ve müşteri hazırlıkları
- Fotoğraf/video ve keşif gereksinimi
- Garanti varsayılanı
- Güvenlik/yeterlilik notları
- Hizmete özel sorular

## Anasayfa bilgi mimarisi

1. Büyük “Sorununu anlat” alanı
2. Örnek problem cümleleri
3. Beş MVP kategori kısayolu
4. “Anlat, karşılaştır, takip et” açıklaması
5. Popüler paketlenmiş işler
6. Ankara/ilçe bazlı anonim güven göstergeleri
7. Doğrulanmış öncesi–sonrası vakaları
8. Güven seviyelerinin açıklaması
9. Usta başvuru çağrısı

Arama kullanıcıyı basit sonuç listesine değil, kısa bir teşhis/talep sihirbazına götürür.

## Başarı metrikleri

- İlçe/hizmet başına aktif doğrulanmış usta
- Usta başvuru tamamlama oranı
- Sorun metninden onaylı talebe dönüşüm
- Eşleşme bulunan talep oranı
- İlk teklif süresi ve teklif seçme oranı
- Tamamlanma ve zamanında başlama oranı
- Kapsam/fiyat değişiklik oranı
- Tekrar çağrılma oranı
- Uyuşmazlık ve çözüm oranı
- Öncesi–sonrası kaydı tamamlanan iş oranı

## MVP dışında

- Ankara dışı operasyon
- Platform içi ödeme/emanet hesap
- Native mobil uygulama
- Canlı konum takibi
- Tam otomatik yapay zekâ teşhisi
- Sağlık, bakım, ders, etkinlik ve dijital hizmetler
- Abonelik ve reklam modeli
- Bütün resmi belgelerin dış servislerle otomatik doğrulanması

## Başlıca riskler

- **Boş pazaryeri:** İlçe/hizmet arz eşiği ve kademeli açılış.
- **Yanlış yönlendirme:** Güven skoru, alternatifler ve gerektiğinde moderasyon.
- **Fiyat anlaşmazlığı:** Sürümlü teklif ve onaylı kapsam değişikliği.
- **Sahte yorum:** Yalnızca tamamlanan işe bağlı değerlendirme.
- **Yanıltıcı portföy:** Bağımsız referans ile doğrulanmış platform işini ayırma.
- **Mahremiyet:** Minimum örneklem ve tam adresi geç paylaşma.
- **Tehlikeli iş:** Hizmet bazlı yeterlilik ve güvenlik kuralları.

## MVP tamamlanma tanımı

MVP; açık bir Ankara pilot ilçesinde müşterinin sorununu doğal dille girip yapılandırılmış talep oluşturabildiği, uygun ustalardan karşılaştırılabilir teklifler aldığı, ustayı seçip işi aşamalarıyla izlediği ve tamamlandıktan sonra doğrulanmış değerlendirme bıraktığı durumda tamamlanmış sayılır. Yönetici başvuruları, belgeleri, hizmetleri, içerikleri ve uyuşmazlıkları yönetebilmelidir.

