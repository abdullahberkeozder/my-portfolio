# Wizard: soru odağı ve bölge kontrolü

## Uygulanan karar

Eleken rehberinin kullanıcı tarafından paylaşılan metninden aşamalı açıklama, geriye dönüş, isteğe bağlı medya ve son kontrol ilkeleri alındı. Örnek ekranın yan navigasyon ve harita ilişkisi uyarlandı; lojistik paneli olduğu gibi kopyalanmadı.

Görsel düzen yeniden kuruldu. Mevcut soru sözleşmesi, koşullu sorular, taslak sahipliği, auth dönüşü, medya gönderimi ve talep gönderim işlemleri yeniden yazılmadı. İkinci wizard veya ikinci talep sistemi oluşturulmadı.

| Before | After | Why |
| --- | --- | --- |
| Tek merkez alan ve dağınık ilerleme bağlamı | Masaüstünde adım rayı, mobilde üst navigasyon | Kullanıcı hangi aşamada olduğunu ve nereye dönebileceğini görür |
| Dekoratif radyo, seçildi rozeti ve gölgeler | Native radyo, geniş tıklama alanı ve seçili yüzey | Aynı durumu üç kez göstermemek |
| Önceki adıma dönüşte yanlış element kaydırılıyor | Gerçek kaydırma alanı sıfırlanıyor, başlığa odak veriliyor | Yeni sorunun üstünü kaybetmemek |
| Body kilitli olsa da kök sayfa kaydırılabiliyor | Modal stack boyunca html ve body birlikte kilitli | Çift scrollbar ve arkadaki sayfanın hareketini önlemek |
| Son kontrolde yalnız uzun metin listesi | Düzenlenebilir kapsam özeti ve isteğe bağlı bölge haritası | Konum kararını görsel olarak kontrol etmek |
| Giriş aksiyonu uzun özetin altında | Giriş/gönderim için sabit alt eylem alanı | Ana görevi görünür tutmak |

## Haritanın sınırı

- Mevcut OpenStreetMap altyapısı ve `ankaraDistrictsGeo.latLngCenter` kullanılır.
- Harita yalnız kullanıcı açarsa dış servise bağlanır. Açık adres veya müşteri adı gönderilmez.
- Harita başarısız olursa ayrı sekmede açma bağlantısı vardır; wizard harita olmadan tamamlanabilir.
- İlçe çevresi gösterilir. Çizilmiş kesin idari sınır, canlı konum, müsaitlik veya eşleşme garantisi verilmez.
- Örnek ShopPin kayıtları, telefonlar, puanlar ve sabit tradeCount değerleri kullanılmaz.
- Açık taleplerde hizmet/ilçe filtreli gerçek usta dizini ayrı sekmede açılabilir. Özel taleplerde seçili usta korunur, başka ustaya yönlendirme yapılmaz.
- Gerçek ustaların haritada belirmesi tamamlanmadı. Bunun için izinli kamusal koordinat sözleşmesi, koordinatı olmayan kayıtların liste alternatifi, doğrulanmış erişim ve gerçek veriyle test gerekir. Rastgele veya ilçe merkezine saçılmış işaretçiler eklenmedi.

## Doğrulama

- Mevcut wizard, yönlendirilmiş wizard ve eşleştirme bileşen testleri: 24 geçti.
- Son düzenleme sonrası wizard, yönlendirilmiş wizard ve bölge önizleme testleri: 21 geçti.
- TypeScript, hedefli ESLint, stil giriş kontrolü ve üretim build geçti.
- `wizard-redesign.spec.ts`: 320/390/820/1440 px dört senaryo assertion'ları geçti. Sorular, konum, son kontrol, geri dönüş, kök kaydırma kilidi ve giriş eyleminin viewport içinde olması kontrol edildi.
- Playwright sunucu kapanışı önceki koşuda olduğu gibi beklemede kaldı. Senaryoların `ok` çıktısı temiz CI koşusuyla eşdeğer değildir.
- Masaüstü ve 320 px sonuç ekranı görüntüleri incelendi; ikinci turda giriş eylemi alt alana taşındı.
- Canlı OpenStreetMap içeriğinin ağ üzerinden yüklenmesi, gerçek cihaz, gerçek hesaplı gönderim ve çoklu kullanıcı yetki kanıtı bu dilimde doğrulanmadı.
- Veritabanı değişikliği, commit veya yayın yapılmadı.
