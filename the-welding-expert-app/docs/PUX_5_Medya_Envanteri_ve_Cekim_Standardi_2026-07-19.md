# PUX-5 Medya Envanteri ve Çekim Standardı

**Proje:** Umut Usta Randevu Uygulaması  
**Tarih:** 19 Temmuz 2026  
**Kapsam:** Hero, yerel hizmet görselleri, galeri iş kanıtları ve önce/sonra çiftleri  
**Ortam:** Yerel geliştirme

## 1. Karar özeti

Mevcut `22` PNG kaynak teknik olarak yeterli çözünürlüktedir (`1024x1024`) fakat hiçbirinde EXIF veya kaynağı doğrulayacak gömülü provenans bilgisi yoktur. Bu nedenle görseller, yalnız görsel kaliteye bakılarak “Umut Usta'nın gerçek işi” olarak onaylanamaz.

Yedi önce/sonra grubunun çoğu aynı açı, mekan veya nesneyi göstermediği için dönüşüm kanıtı olarak kullanıma uygun değildir. `landscaping.png` ile `landscaping_after.png` birebir aynı dosyadır. Gerçek fotoğraflar gelene kadar mevcut kaynaklar geçici yer tutucu olarak korunabilir; müşteri kanıtı veya kimlik iddiası üretmemelidir.

## 2. Sınıflandırma ölçütleri

| Boyut | Kabul koşulu |
|---|---|
| Provenans | Çekimi yapan/ileten kişi ve iş sahibinin onayı kayıtlı |
| Gerçeklik | Umut Usta'nın veya ekibinin gerçek işi; stock ya da yapay üretim değil |
| Güvenlik | Riskli işlemde uygun göz, el, yüz ve alan koruması görünür |
| Kadraj | Ana uygulama net; gereksiz dağınıklık ve yanıltıcı kırpım yok |
| Önce/sonra | Aynı nesne, aynı yön, yakın ölçek ve benzer ışık |
| Teknik kalite | En az 1600 px uzun kenar; net, aşırı HDR/blur yok |
| Metadata | İş türü, konum seviyesi, sorun, uygulama, sonuç ve alt metin mevcut |

## 3. Mevcut asset denetimi

`Koşullu` sınıfı yalnız görsel kaliteyi ifade eder. Kaynak sahipliği doğrulanmadan gerçek iş kanıtı olarak yayınlanamaz.

| Asset/grup | Görsel değerlendirme | Sınıf | Gerekli işlem |
|---|---|---|---|
| `hero.png` | Kaynak işlemi ve koruyucu maske görünür; kare kaynak, kişi/iş merkezde, negatif alan sınırlı | Yeniden kırp / doğrula | Gerçek kimlik ve çekim kaynağını doğrula; yatay ve 4:5 özgün çekimle değiştir |
| `custom_metal.png` | Bitmiş raf ve metal taşıyıcı detayı okunur | Koşullu | İş sahipliği doğrulanırsa sonuç detayı olarak kullanılabilir |
| `estimate.png` | Ölçüm anı anlatılıyor; kişi ve mekan provenansı yok | Değiştir / doğrula | Gerçek keşif anı ve müşteri izniyle yeniden çek |
| `gate_motor_before.png` + `gate_motor_after.png` | Önce karede motor yok; nesne, ölçek ve açı eşleşmiyor | Değiştir | Aynı kapı motorunu aynı açıdan çek |
| `hinge_before.png` + `hinge_after.png` | Aynı iş türü fakat açı, ölçek ve çevre yeterince eşleşmiyor | Yeniden çek | Tripod/sabit referansla aynı menteşe ve çevreyi koru |
| `hinge_repair.png` | Onarım süreci okunur; güvenlik ve kaynak sahipliği doğrulanmalı | Koşullu | Ekipman ve iş kaydı doğrulanırsa süreç karesi olabilir |
| `landscaping_before.png` + `landscaping_after.png` | Bahçe ve kamera yönü eşleşmiyor | Değiştir | Aynı sabit noktadan önce/sonra çek |
| `landscaping.png` | `landscaping_after.png` ile birebir aynı | Yinelenen | Tek kanonik dosya bırak; çift kanıtı olarak kullanma |
| `painting.png` | Alan koruma ve devam eden uygulama görünür | Koşullu | Gerçek iş doğrulanırsa süreç karesi olarak kullan |
| `railing_before.png` + `railing_after.png` | Farklı korkuluk, mekan ve bağlam | Değiştir | Aynı korkuluğu aynı ölçek ve yönden çek |
| `railing_repair.png` | Metal işçiliği okunur; aktif işlemde yüz/göz koruması belirsiz | Değiştir | Doğru PPE ile gerçek uygulama karesi çek |
| `renovation.png` | Tadilat süreci ve mekan koruması kısmen okunur | Koşullu | Kaynak ve izin doğrulanırsa süreç görseli olabilir |
| `shelf_before.png` + `shelf_after.png` | Önce malzeme/tezgah, sonra lastik rafı; aynı açı ve durum değil | Değiştir | Aynı rafın montaj öncesi ve sonrası çekilmeli |
| `sliding_gate_before.png` + `sliding_gate_after.png` | Benzer giriş bağlamı olsa da açı ve kadraj karşılaştırmaya uygun değil | Yeniden çek / doğrula | Aynı giriş olduğu doğrulanmalı; sabit açıyla yeniden çekilmeli |
| `smart_lock_before.png` + `smart_lock_after.png` | Farklı kapı, kilit ve mekan | Değiştir | Aynı kapıda eski kilit ve tamamlanmış sistem çekilmeli |

## 4. Hero çekim brifi

### Zorunlu kareler

1. `3:2` veya `16:9` yatay ana çekim; usta sağ üçte, solda sakin negatif alan.
2. Aynı sahnenin bağımsız `4:5` dikey çekimi; yüz, el ve işlem güvenli alanda.
3. Metal birleşim veya kaynak dikişi makrosu.
4. Bitmiş parçayı mekan bağlamında gösteren sonuç karesi.

### Görsel dil

- Nötr-sıcak beyaz dengesi; turuncu-teal grading yok.
- Metal highlight'larında doku kaybı yok.
- Kontrollü doğal ışık; yapay blur ve aşırı clarity yok.
- Atölye düzenli fakat gerçek; tehlikeli kablo, açık tüp veya korumasız kıvılcım görünmez.
- Kaynak sırasında maske, eldiven, uygun giysi ve alan güvenliği açıkça görünür.

### Güvenli kırpım

- Masaüstü odak noktası yaklaşık `%68 x / %45 y`.
- Mobil odak noktası çekimin öznesine göre ayrıca kaydedilir; masaüstü karenin otomatik merkez kırpımı kullanılmaz.
- Metin öznenin, kıvılcımın veya kritik el hareketinin üzerine gelmez.

## 5. Önce/sonra çekim protokolü

1. Telefon/kamera konumu zeminde işaretlenir.
2. Lens, zoom, yön ve yükseklik değiştirilmez.
3. Önce ve sonra karede nesnenin çevresinden en az yüzde 15 bağlam korunur.
4. Işık yönü mümkün olduğunca eşleştirilir.
5. Sonuç karesinde temizlik ve güvenli kullanım durumu gösterilir.
6. Rötuş yalnız pozlama, beyaz dengesi ve küçük perspektif düzeltmesiyle sınırlıdır.
7. Nesne ekleme/silme, yapay üretim veya sonucu olduğundan iyi gösteren düzenleme yapılmaz.

## 6. Dosya ve metadata standardı

### Dosya adı

```text
YYYY-MM-DD_is-turu_ilce_kisa-vaka-adi_stage_sequence.ext
```

Örnek:

```text
2026-07-19_kaynak_yenimahalle_bahce-kapisi_before_01.jpg
2026-07-19_kaynak_yenimahalle_bahce-kapisi_after_01.jpg
```

### Zorunlu metadata

| Alan | Örnek |
|---|---|
| `title` | Bahçe kapısı menteşe onarımı |
| `category` | Kaynak ve metal |
| `location` | Yenimahalle |
| `problem` | Kapı ağırlık nedeniyle aşağı sarkıyordu |
| `solution` | Menteşe bağlantısı yenilenip kaynakla güçlendirildi |
| `result` | Kapı hizalı ve rahat açılır durumda teslim edildi |
| `image_alt` | Güçlendirilmiş menteşesiyle hizalanan bahçe kapısı |
| `before_image_alt` | Aşağı sarkan bahçe kapısının işlem öncesi menteşesi |
| `captured_at` | 2026-07-19 |
| `provenance_owner` | Çekimi yapan veya dosyayı sağlayan kişi |
| `usage_consent` | Müşteri alanı ve kişi görünümü için onay kaydı |
| `before_after_verified` | Aynı nesne/açı kontrolü tamamlandıysa `true` |

Müşteri arayüzü `image_alt` ve `before_image_alt` alanlarını öncelikli kullanır; alanlar yoksa iş başlığı, aşama, kategori ve konumdan açıklayıcı fallback üretir.

## 7. Yayın kontrol listesi

- [ ] Kaynak ve kullanım izni doğrulandı.
- [ ] Görsel gerçek Umut Usta işi.
- [ ] Güvenlik ekipmanı doğru.
- [ ] Önce/sonra aynı nesne ve açı.
- [ ] Sorun, uygulama ve sonuç metadata'sı tamam.
- [ ] Alt metin görseldeki işi açıklıyor.
- [ ] Kişisel bilgi, plaka, kapı numarası ve yüz izni kontrol edildi.
- [ ] `npm run images:optimize` çalıştırıldı.
- [ ] `npm run images:audit` geçti.
- [ ] `npm run perf:budget` geçti.
- [ ] Mobil ve masaüstü kırpım görsel olarak onaylandı.

## 8. Teknik çıktı

- Her kaynak için `320`, `640`, `1024 px` AVIF, WebP ve JPEG üretilir.
- Hero için ayrıca `400 px` LCP varyantı bulunur.
- AVIF/WebP desteklemeyen istemci responsive JPEG srcset kullanır.
- Görsellerde width/height bulunur; kartlarda sabit aspect-ratio/min-height yerleşimi korunur.
- Galeri görselleri lazy-load edilir; yalnız LCP hero eager ve high priority kalır.
- Teknik medya bütünlüğü `npm run images:audit` ile doğrulanır.

