# Umut Usta Ürün İyileştirme Sprint Planı

**Tarih:** 26 Temmuz 2026  
**Kaynak:** Kapsamlı Product, UX/UI ve Teknik Değerlendirme Raporu  
**Önerilen ritim:** 4 sprint, sprint başına 1 hafta  
**Toplam tahmin:** 42 story point

## 1. Planlama İlkeleri

İşler aşağıdaki sıraya göre bölündü:

1. Önce canlı müşteri deneyimindeki görünür hata ve yanlış beklenti düzeltilir.
2. Ardından galeri bilgi mimarisi sadeleştirilir.
3. Dashboard metrikleri için güvenilir veri temeli kurulur.
4. Yeni veri, güvenlik ve depolama modeli gerektiren fotoğraf prototipi son sprintte ele alınır.

Bu sıra, hızlı kazanımları erkenden canlıya alırken yeni özelliklerin hatalı metrik veya kırılgan medya altyapısı üzerine kurulmasını önler.

---

## Sprint 1 - Medya Güvenilirliği ve Mesaj Netliği

**Süre:** 1 hafta  
**Tahmin:** 8 SP  
**Sprint hedefi:** Müşterinin gördüğü iş kanıtlarının eksiksiz yüklenmesini sağlamak ve randevu süresi hakkındaki yanlış beklentiyi kaldırmak.

**Uygulama durumu (26 Temmuz 2026):** Yerel kod, testler ve medya temizliği tamamlandı. Peyzaj kaydındaki doğrulanamayan önce görselinin canlı veriden kaldırılması için `supabase/sprint_7_gallery_media_integrity.sql` migration'ı hedef Supabase ortamında uygulanmalıdır.

### US-1.1 - Galeri hizmet özetini sadeleştirme

**Problem:** Galerideki dört istatistik kartı, “2 saat” ve “09-21” gibi operasyon ayrıntılarını gereğinden fazla öne çıkarıyor; müşteri odaklı ve profesyonel galeri anlatısını zayıflatıyor.

**Uygulanan içerik:**

- `Adresinizde hizmet` — `Ankara'da yerinde keşif ve uygulama`
- `Atölyede üretim` — `Özel ölçü imalat ve kontrollü onarım`

**Kapsam:**

- Dört kartlı istatistik görünümünü kaldır.
- Çalışma biçimlerini tek yüzeyde iki sakin bilgi satırı olarak göster.
- “2 saat” ve “09-21” metinlerini galeri özetinden çıkar.
- Ana sayfadaki galeri kanıtını, veri yüklenmesinden etkilenmeyen `Gerçek iş örnekleri / Uygulama ve sonuçlarıyla` müşteri diliyle güncelle.

**Kabul kriterleri:**

- Galeri özetinde yalnızca iki çalışma biçimi bulunur.
- Operasyon saatleri ve slot süresi galeri içinde istatistik gibi sunulmaz.
- 320 px genişlikte metin taşmaz ve bilgi sırası korunur.
- Erişilebilir isim ve ekran okuyucu sırası anlamlıdır.
- İlgili component testi güncellenir.

### US-1.2 - “İşlerimiz” görsellerinin görünmemesini düzeltme

**Doğrulanan teknik bulgu:** Randevu sayfasındaki üç önizleme, Supabase public object URL'sini `/storage/v1/render/image/public/` adresine dönüştürüyor. Galeri sayfası ise özgün public object URL'lerini kullanıyor ve görselleri gösterebiliyor. Image transformation hizmeti kapalı, desteklenmiyor veya hata veriyorsa önizleme bileşeni özgün URL'ye dönmek yerine hata durumunda kalıyor.

**Kapsam:**

- Optimize URL başarısız olduğunda özgün `image_url` adresine yalnızca bir kez fallback uygula.
- Özgün URL de başarısız olursa mevcut erişilebilir hata durumunu göster.
- Sonsuz `onError` döngüsünü engelle.
- Hatalı URL, Supabase dışı URL ve başarılı optimize URL senaryolarını test et.
- Randevu sayfasındaki üç güncel iş görselini mobil ve masaüstünde doğrula.

**Kabul kriterleri:**

- “İşçiliği sonuç üzerinden inceleyin” bölümündeki üç kartın görselleri görünürdür.
- Optimize endpoint `4xx/5xx` döndürdüğünde kullanıcı özgün görseli görür.
- İki URL de başarısızsa ikonlu, açıklayıcı ve layout'u koruyan fallback görünür.
- Aynı görsel için en fazla iki ağ isteği yapılır.
- 320, 390, 768 ve 1440 px genişliklerde görsel oranı ve kart geometrisi korunur.
- Yeni fallback davranışı birim testi ve E2E senaryosuyla korunur.

### US-1.3 - Peyzaj medya bütünlüğünü düzeltme

**Doğrulanan teknik bulgu:** `landscaping.png` ve `landscaping_after.png`, aynı tamamlanmış iş görselinin iki teknik kopyasıdır. `landscaping_before.png` farklı bir mülkü gösterdiği için aynı işin öncesi olarak doğrulanamamıştır.

**Kapsam:**

- Yinelenen yerel sonuç görselini ve responsive türevlerini kaldır.
- Hizmet kartını kalan `landscaping_after.png` kaynağına yönlendir.
- Doğrulanamayan önce görselini seed ve veri düzeltme migration'ıyla peyzaj vakasından çıkar.
- Gerçek önce görseli sağlanana kadar kaydı “tamamlanan iş” olarak sun.

**Kabul kriterleri:**

- Aynı tamamlanmış iş için yinelenen yerel kaynak dosya kalmaz.
- Peyzaj kaydı doğrulanmamış bir görseli “önce” olarak sunmaz.
- Tamamlanan iş görselinin alt metni doğru bağlamı aktarır.
- `npm run images:audit` aynı içerik uyarısını artık üretmez.
- Galeri kartı ve vaka diyaloğu iki farklı görseli gösterir.

### Sprint 1 test paketi

- `npm run lint`
- `npm run test:run`
- `npm run images:audit`
- `npm run build`
- Randevu sayfası mobil/masaüstü görsel kontrolü
- Galeri önce/sonra vaka kontrolü

### Sprint 1 başarı metriği

- İşlerimiz bölümündeki görsel yükleme başarı oranı: en az `%99`
- Görsel fallback sonrası layout shift: kabul edilen performans bütçesi içinde
- Galeri hizmet özetini operasyon istatistiği olarak yorumlayan test kullanıcısı: `0/5`

---

## Sprint 2 - Galeri Bilgi Mimarisi ve Bağlamsal Filtreler

**Süre:** 1 hafta  
**Tahmin:** 8 SP  
**Sprint hedefi:** Mobilde sekiz eş düzey seçenek yerine dört anlaşılır ana karar sunmak ve seçilen bağlama göre alt hizmetleri göstermek.

**Durum:** Tamamlandı - 26 Temmuz 2026

**Tamamlanan uygulama:**

- Randevu seçimi, hizmet kapsamı ve galeri için `serviceTaxonomy.js` ortak kaynak olarak tanımlandı.
- Galeri ilk seviyesi `Tümü + 4 ana kategori` modeline geçirildi.
- Alt kategoriler yalnızca aynı ana grupta birden fazla gerçek seçenek olduğunda gösteriliyor.
- “Raylı kapı sistemleri” hizmetinin metal anahtar sözcükleri nedeniyle yanlış gruba düşmesi giderildi.
- `gallery_filter_selected` payload'ı `group`, `subcategory` ve `result_count` alanlarıyla güncellendi.
- 320 px ve 390 px mobil E2E testlerinde kök taşması, 44 px dokunma alanı ve koşullu alt filtre davranışı doğrulandı.
- URL query parametresi, mevcut kapsamda ek durum senkronizasyonu ve geri gezinme karmaşıklığı yaratacağı için sonraki iterasyona bırakıldı.

### US-2.1 - Dört ana kategori modeli

**Ana kategoriler:**

| Ana kategori | Bağlamsal alt kategoriler |
| --- | --- |
| Boya ve küçük tadilat | Boya ve badana; İnşaat ve tadilat |
| Kaynak ve metal işleri | Kaynak ve metal |
| Kapı ve otomasyon | Raylı kapı sistemleri; Otomatik kapı motorları; Akıllı kilit sistemleri |
| Bahçe ve dış alan | Bahçe ve peyzaj |

**Kapsam:**

- Hizmet grubu taksonomisini ortak bir config modülüne taşı.
- Randevu seçimi, hizmet kapsamı ve galeri filtresinin aynı taksonomiyi kullanmasını sağla.
- İlk seviyede `Tümü + 4 ana kategori` göster.
- Ana kategori seçildikten sonra yalnızca o gruba ait alt kategori kontrolünü göster.
- Tek alt kategorisi olan grupta gereksiz ikinci karar üretme.
- Filtre değiştiğinde önce/sonra vakaları ve galeri öğelerini birlikte güncelle.
- URL query parametresiyle filtreyi paylaşılabilir hale getirmeyi değerlendir.

**Kabul kriterleri:**

- İlk görünümde en fazla beş filtre seçeneği vardır.
- Ana kategori seçildiğinde yalnızca ilgili alt kategoriler görünür.
- “Kapı ve otomasyon” seçimi üç alt hizmeti doğru filtreler.
- “Kaynak ve metal işleri” seçildiğinde ekstra tek-seçenek adımı gösterilmez.
- Filtreler 320 px ekranda yatay sayfa taşması üretmez.
- Aktif ana ve alt kategori yalnızca renkle değil `aria-pressed` ve görünür durumla anlaşılır.
- Mevcut galeri kayıtlarının hiçbiri kategorisiz veya ulaşılamaz kalmaz.

### US-2.2 - Analitik olaylarını güncelleme

**Kapsam:**

- `gallery_filter_selected` olayına `group`, `subcategory` ve `result_count` alanlarını ekle.
- Eski event verisinin dashboard'u bozmadığını doğrula.
- Event şemasına versiyon alanı eklemeyi değerlendir.

**Kabul kriterleri:**

- Ana ve alt kategori seçimleri ayrı ölçülebilir.
- Kişisel veri event payload'ına girmez.
- Eski kayıtlar için rapor hesaplamaları çalışmaya devam eder.

### Sprint 2 test paketi

- Taksonomi unit testleri
- Galeri filtre component testleri
- Mobil klavye ve ekran okuyucu akışı
- 320, 390, 768 ve 1440 px E2E
- Filtre sonuç sayısı ve analitik payload testi

### Sprint 2 başarı metriği

- Filtre alanının mobil dikey yüksekliğinde en az `%30` azalma
- Filtre kullanan oturumların vaka detayına geçiş oranında artış
- Sıfır sonuç üreten geçerli kategori kombinasyonu: `0`

---

## Sprint 3 - Operasyonel KPI Veri Temeli ve Canlı Dashboard

**Süre:** 1 hafta  
**Tahmin:** 13 SP  
**Sprint hedefi:** Ekibin yalnızca talep sayısını değil, yanıt hızını, teyit dönüşümünü ve hizmet alanı kalitesini günlük olarak yönetebilmesini sağlamak.

**Durum:** Tamamlandı - 26 Temmuz 2026

**Tamamlanan uygulama:**

- `first_contacted_at` alanı ve ilk temas anını tek sefer yazan immutable PostgreSQL trigger'ı eklendi.
- Güvenilir geçmiş veri olmadığı için mevcut taleplere tahminî backfill uygulanmadı.
- Medyan ilk yanıt süresi, nitelikli talep teyit oranı ve hizmet bölgesi dışı talep oranı dashboard'un öncelikli alanına taşındı.
- Üç KPI aynı dönem ve hizmet filtresiyle güncelleniyor; önceki eş dönemle karşılaştırılıyor.
- Pay, payda, örnek büyüklüğü ve eksik/etiketlenmemiş veri kartlarda açıkça gösteriliyor.
- Bölge dışı KPI kartı, `lead_quality=outside_area` filtresi seçili talep listesine bağlandı.
- Mevcut analitik huninin teyit oranı da yalnızca nitelikli talepleri payda kabul edecek şekilde düzeltildi.
- 390 px mobil ve 1440 px masaüstü Playwright kontrollerinde taşma, kolon düzeni, filtre senkronizasyonu ve liste geçişi doğrulandı.
- İlk yanıt süresi hedef değeri ürün sahibi tarafından henüz belirlenmedi; dashboard gerçek değeri hedef dışı/başarılı olarak renklendirmiyor.

### Teknik ön koşul - “İlk yanıt süresi” tanımı

Mevcut `avgResponseTimeHours` hesabı, `confirmed/completed` taleplerin `updated_at - created_at` farkını kullanıyor. `updated_at` not, kalite etiketi veya başka bir güncellemede değişebileceği için bu değer gerçek ilk yanıt süresi değildir.

**Önerilen veri alanı:** `first_contacted_at`

- Talep ilk kez `contacted`, `confirmed`, `cancelled` veya `completed` durumuna geçtiğinde bir kez yazılır.
- Sonraki güncellemelerde değiştirilmez.
- Mevcut kayıtlar için güvenilir backfill mümkün değilse “veri yok” olarak kalır; tahmini değer gerçek veri gibi sunulmaz.

### US-3.1 - İlk yanıt süresi

**Tanım:** `first_contacted_at - created_at`

**Gösterim:**

- Medyan yanıt süresi ana KPI olur.
- Ortalama değer yardımcı bilgi olarak gösterilebilir.
- Son 7/30 gün değişimi gösterilir.
- Veri olmayan kayıtlar paydaya alınmaz.

**Neden medyan:** Tek bir çok geç yanıtın ortalamayı bozmasını önler.

### US-3.2 - Teyit oranı

**Tanım:** `(confirmed + completed) / toplam nitelikli talep`

Dashboard'daki mevcut operasyon funnel'ı bu veriyi hesaplayabiliyor. Ana dashboard'a dönem ve hizmet filtresine uyan görünür KPI kartı eklenir.

**Kabul kriterleri:**

- Pay ve payda tooltip/açıklamada görünür.
- Spam ve hizmet bölgesi dışı taleplerin paydaya dahil edilip edilmeyeceği açık kuralla belirlenir.
- Önerilen varsayılan: yalnızca `qualified` talepler.

### US-3.3 - Hizmet bölgesi dışı talep oranı

**Tanım:** `lead_quality = outside_area / lead_quality atanmış talepler`

**Kabul kriterleri:**

- “Etiketlenmemiş” talepler ayrı veri kalitesi göstergesi olarak görünür.
- Oran, ilçe bilgisi olmadığı halde kesin coğrafi çıkarım yapmaz.
- Karttan ilgili filtrelenmiş talep listesine geçiş sağlanır.

### Dashboard kabul kriterleri

- Üç KPI 390 px ve masaüstünde öncelikli alanda görünür.
- Dönem ve hizmet filtreleri üç KPI'yı birlikte günceller.
- Loading, boş veri, kısmi veri ve hata durumları tanımlıdır.
- KPI hesapları saf utility fonksiyonlarında tutulur ve test edilir.
- `first_contacted_at` tek sefer yazılır ve sonraki update'lerde korunur.
- Tarih hesapları timezone farkından etkilenmez.
- Dashboard kartları yalnızca ham sayı değil, oran/süre ve karşılaştırma bağlamı gösterir.

### Sprint 3 test paketi

- Migration smoke testi
- İlk durum geçişi ve immutable timestamp testi
- KPI utility testleri
- Boş/kısmi veri dashboard testi
- Rol bazlı erişim testi
- Mobil dashboard responsive kontrolü

### Sprint 3 başarı metriği

- `first_contacted_at` doluluk oranı: yeni işlenen taleplerde `%100`
- Lead quality etiketleme oranı: en az `%90`
- Dashboard üzerinden “yanıt bekleyen talep”e ulaşma: en fazla 2 etkileşim
- Hedef ilk yanıt süresi ürün sahibi tarafından ayrıca belirlenmeli

---

## Sprint 4 - Opsiyonel Talep Fotoğrafı Prototipi

**Süre:** 1 hafta prototip + kullanıcı testi  
**Tahmin:** 13 SP  
**Sprint hedefi:** Müşterinin WhatsApp'a geçmeden problem fotoğrafı ekleyebilmesini ve ekibin talebi daha doğru değerlendirebilmesini güvenli bir prototiple doğrulamak.

### Prototip kapsamı

- İletişim adımındaki “Ek bilgi ekle” alanına opsiyonel fotoğraf kontrolü.
- İlk prototipte en fazla 3 görsel.
- JPEG, PNG ve WebP desteği.
- Dosya başına önerilen üst sınır: 5 MB.
- Mobil kamera ve fotoğraf galerisi seçimi.
- Yüklemeden önce küçük önizleme, kaldırma ve yeniden seçme.
- Talep gönderiminde progress ve kısmi hata davranışı.
- Admin randevu detayında güvenli thumbnail ve büyük önizleme.

### Güvenlik ve veri modeli

- Public galeri bucket'ı kullanılmamalı.
- Ayrı ve private `appointment-attachments` bucket oluşturulmalı.
- Dosya yolu tahmin edilemez request/token bağlamında üretilmeli.
- Müşteri yüklemesi dosya türü, magic bytes, boyut ve adet açısından sunucu tarafında doğrulanmalı.
- Admin görüntüleme kısa süreli signed URL ile yapılmalı.
- RLS yalnızca yetkili rollere okuma izni vermeli.
- Zararlı içerik taraması ve metadata temizliği üretim öncesi değerlendirilmelidir.
- Saklama ve silme süresi gizlilik metnine eklenmelidir.

### Önerilen gönderim akışı

```text
Talep bilgilerini doğrula
    -> Geçici yükleme yetkisi oluştur
    -> Görselleri private bucket'a yükle
    -> Randevu talebini görsel kayıtlarıyla bağla
    -> Başarısızlıkta orphan dosyaları temizle
    -> Başarı ekranını göster
```

### Kabul kriterleri

- Fotoğraf eklemeden talep akışı bugünkü gibi tamamlanabilir.
- Kullanıcı en fazla 3 fotoğraf ekleyebilir ve göndermeden önce kaldırabilir.
- Geçersiz tür ve büyük dosya anlaşılır mesajla reddedilir.
- Upload sırasında submit geometrisi değişmez ve çift gönderim engellenir.
- Yükleme başarısız olursa talebin kaydedilip kaydedilmediği açıkça belirtilir.
- Görseller public URL ile erişilemez.
- Yetkisiz kullanıcı attachment kaydını veya signed URL'yi alamaz.
- Admin mobil ve masaüstünde görselleri inceleyebilir.
- Talep silme/veri saklama politikası attachment'ları da kapsar.

### Prototip araştırma soruları

- Fotoğraf ekleyen kullanıcıların form tamamlama oranı düşüyor mu?
- Fotoğraflı taleplerde ilk görüşme süresi kısalıyor mu?
- Fotoğraflı taleplerin teyit oranı artıyor mu?
- Usta, fotoğrafı keşif gereksinimini anlamak için yeterli buluyor mu?
- Üç fotoğraf sınırı gerçek kullanım için yeterli mi?

### Sprint 4 başarı metriği

- Fotoğraf özelliğinin kullanıldığı uygun talepler: ölçülür, ilk sprintte hedef konmaz
- Fotoğraf yükleme teknik başarı oranı: en az `%98`
- Fotoğraflı taleplerde ilk değerlendirme süresinde azalma
- Fotoğraf eklemeyen kullanıcıların form dönüşümünde anlamlı düşüş olmaması

---

## 2. Sprint Bağımlılıkları

```text
Sprint 1: Medya güvenilirliği
    └── Sprint 2: Galeri filtre mimarisi

Sprint 3: KPI veri temeli
    └── Fotoğraflı ve fotoğrafsız lead kalitesini ölçer

Sprint 1 + Sprint 3
    └── Sprint 4: Fotoğraf prototipi ve güvenilir ölçüm
```

Sprint 2 ile Sprint 3, ekip kapasitesi uygunsa paralel yürütülebilir. Sprint 4; hem güvenli medya davranışının Sprint 1'de doğrulanmasına hem de etkisini ölçecek KPI temelinin Sprint 3'te kurulmasına bağlıdır.

---

## 3. Definition of Done

Her sprint ancak aşağıdaki koşullarda tamamlanmış sayılır:

- Kabul kriterlerinin tamamı doğrulanmıştır.
- Yeni davranış için birim/component testi vardır.
- Kritik müşteri yolculuğu E2E ile korunur.
- 320, 390, 768 ve 1440 px kontrolleri tamamlanır.
- Light/dark mode, klavye ve reduced-motion davranışı doğrulanır.
- `npm run lint`, `npm run test:run`, `npm run build` ve ilgili medya/performance denetimi geçer.
- Analitik olayı eklenmişse PII sanitization testi vardır.
- Migration eklenmişse rollback/backfill notu yazılmıştır.
- Ürün metni müşteri açısından yanlış taahhüt üretmez.
- Sprint çıktısının başarı metriği dashboard veya rapor üzerinden ölçülebilir.

---

## 4. Önerilen Yayın Sırası

| Yayın | İçerik | Risk |
| --- | --- | --- |
| Release 1 | Görsel fallback, peyzaj medya düzeltmesi, galeri hizmet özeti | Düşük |
| Release 2 | Dört ana kategori ve alt filtreler | Orta |
| Release 3 | KPI migration ve canlı dashboard kartları | Orta-yüksek |
| Release 4 | Fotoğraf prototipi, private storage ve admin görüntüleme | Yüksek |

Her release ayrı feature flag gerektirmez. Fotoğraf prototipi ise storage ve RPC değişiklikleri nedeniyle flag veya sınırlı kullanıcı açılımıyla yayınlanmalıdır.
