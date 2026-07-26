# Umut Usta Randevu Uygulaması

## Kapsamlı Product, UX/UI ve Teknik Değerlendirme Raporu

**Tarih:** 26 Temmuz 2026  
**İncelenen sürüm:** Yerel `main` dalı  
**Proje:** `the-welding-expert-app`  
**İnceleme yüzeyleri:** Müşteri randevu akışı, haftalık takvim, galeri, vaka detayı, ekip girişi, müşteri öz-servis kapsamı, yönetim özellikleri, analitik, veri ve güvenlik mimarisi

---

## 1. Yönetici Özeti

Umut Usta, basit bir iletişim veya randevu formunun ötesine geçmiş, yerel hizmet işletmesinin müşteri kazanımı ile operasyon yönetimini aynı üründe birleştiren olgun bir MVP/erken büyüme ürünü konumundadır.

Ürünün en güçlü tarafı, müşteriyi aynı anda çok sayıda alanla karşılaştırmak yerine hizmet, zaman ve iletişim kararlarını üç adımda toplamasıdır. Mobil yerleşim 320 px dahil olmak üzere geniş bir cihaz matrisinde stabil, erişilebilir ve taşmasızdır. Galerideki gerçek önce/sonra görselleri, ürünün en güçlü görsel ve güven kancasıdır. Yönetim tarafındaki rol bazlı erişim, müsaitlik, talep, hizmet, galeri ve analitik kapsamı ise ürünün yalnızca vitrini değil, işletme operasyonunu da desteklediğini göstermektedir.

Bugünkü temel problem artık “arayüz mobilde çalışıyor mu?” değildir. Test ve yerel inceleme, temel deneyimin sağlam olduğunu göstermiştir. Bir sonraki ürün eşiği şu dört konuya bağlıdır:

1. Takvimde karar süresini azaltmak.
2. Galeride tekrar ve kategori yoğunluğunu azaltmak.
3. İşletme güvenini bağımsız kanıtlarla güçlendirmek.
4. WhatsApp, telefon ve web formu arasında parçalanan talep verisini tek operasyonda birleştirmek.

### Genel değerlendirme

| Boyut | Puan | Yorum |
| --- | ---: | --- |
| Değer önerisi | 8.5/10 | Yerel hizmet, gerçek iş örnekleri ve randevu talebi net biçimde birleşiyor. |
| Mobil kullanılabilirlik | 8.8/10 | Responsive yapı, dokunma hedefleri, sanal klavye ve safe-area davranışları güçlü. |
| Bilgi mimarisi | 7.8/10 | Ana akış sade; takvim ve uzun galeri sayfasında karar yoğunluğu artıyor. |
| Görsel tasarım | 8.6/10 | Tutarlı, güven veren, iş alanına uygun ve ayırt edici bir dil var. |
| Erişilebilirlik | 9.0/10 | Semantik, klavye, focus, reduced-motion ve forced-colors kapsamı ileri seviyede. |
| Feature completeness | 8.4/10 | Randevu ve operasyon çekirdeği güçlü; teklif, medya toplama ve otomatik bildirim tarafı kısmi. |
| Teknik kalite | 8.8/10 | Katmanlı yapı, RLS/RPC, lazy loading ve geniş test kapsamı güçlü. |
| Ölçülebilirlik | 8.3/10 | Birinci taraf event taksonomisi iyi; gerçek ürün kararları için kohort ve kanal bütünlüğü geliştirilmeli. |
| Genel ürün olgunluğu | **8.5/10** | Güçlü bir üretim MVP'si; dönüşüm ve operasyon bütünlüğü odaklı büyüme aşamasına hazır. |

> Puanlar karşılaştırmalı ürün sezgisidir; canlı kullanıcı analitiği veya nicel kullanıcı araştırması sonucu değildir.

---

## 2. İnceleme Yöntemi ve Kanıt Düzeyi

Değerlendirme dört kanıt katmanına dayanmaktadır:

- **Doğrudan ürün gözlemi:** Uygulama yerelde 390x844 mobil ve 1440x900 masaüstü ölçülerinde açıldı; randevu hizmet seçimi, haftalık zaman seçimi, galeri, filtreler, vaka detayı ve ekip girişi incelendi.
- **Kod ve mimari inceleme:** Route yapısı, servis katmanı, analitik olayları, müşteri öz-servisi, yönetim sayfaları, Supabase RPC/RLS ve migration kapsamı incelendi.
- **Otomatik kalite kanıtı:** Lint, birim/entegrasyon testleri, build, görsel medya denetimi, performans bütçesi ve uçtan uca testler çalıştırıldı.
- **Ürün hipotezi:** Hedef kitle ve motivasyonlar, canlı demografik veri bulunmadığı için yerel hizmet pazarı ve mevcut deneyim üzerinden hipotez olarak tanımlandı.

Bu ayrım önemlidir: “390 px ekranda taşma yok” doğrulanmış bir bulgudur; “45-60 yaş kullanıcı telefonla teyidi tercih eder” ise araştırmayla doğrulanması gereken bir hipotezdir.

---

## 3. Ürün Tanımı ve Temel Değer Önerisi

### Ürün tanımı

Umut Usta; Ankara'da bakım, kaynak, metal, kapı otomasyonu, boya, küçük tadilat ve dış alan işleri arayan müşterilerin:

- ustanın gerçek işlerini incelemesini,
- ihtiyacına yakın hizmeti seçmesini,
- açık müsaitlik üzerinden zaman tercihi bildirmesini,
- talebini takip etmesini,
- değişiklik veya iptal isteği iletmesini

sağlayan; işletme tarafında ise talep, kapasite, içerik, ekip erişimi ve performans yönetimini birleştiren web tabanlı hizmet operasyon ürünüdür.

### Temel değer önerisi

**Müşteri için:** “Doğru ustayı bulduğumdan emin olayım, iş örneklerini göreyim ve tekrar tekrar telefon görüşmesi yapmadan uygun zamanı seçeyim.”

**İşletme için:** “Eksik ve dağınık mesajlar yerine, hizmet ve zaman bilgisi yapılandırılmış talepler alayım; takvim ve müşteri sürecini tek yerden yöneteyim.”

### Ürünün yaptığı temel dönüşüm

```text
Belirsiz ihtiyaç
    -> Görsel güven ve hizmet tanıma
    -> Yapılandırılmış hizmet seçimi
    -> Uygun zaman tercihi
    -> Nitelikli müşteri talebi
    -> Telefon/WhatsApp teyidi
    -> Operasyon ve takip
```

Bu akış ürünün en doğru stratejik tercihidir. Uygulama “anında kesin rezervasyon” sözü vermek yerine talep ve teyit modelini açıkça anlatır. Bu, sahada iş süresinin ve kapsamının değişken olduğu usta hizmetleri için gerçekçi bir beklenti yönetimidir.

---

## 4. Hedef Kitle ve Demografik Analiz

Canlı müşteri verisi görülmediği için aşağıdaki segmentler araştırma hipotezi olarak ele alınmalıdır.

### Birincil segmentler

| Segment | Olası bağlam | Temel ihtiyaç | Başlıca kaygı | Ürün karşılığı |
| --- | --- | --- | --- | --- |
| Ev sahibi / kiracı | 28-60 yaş, Ankara merkez ilçeleri | Küçük tadilat ve onarım | Güven, fiyat belirsizliği, zamanında gelme | Galeri, fiyat başlangıçları, takvim, telefon teyidi |
| Apartman yöneticisi | 35-65 yaş | Kapı, korkuluk, giriş ve ortak alan işi | Fatura/hesap verebilirlik, hızlı dönüş, kalıcılık | Vaka detayları, konum, süreç, talep takibi |
| Küçük işletme sahibi | 30-60 yaş | Ofis, dükkân, metal veya otomasyon işi | İş kaybını azaltma, uygun saat, güvenilir plan | Haftalık müsaitlik, hizmet kapsamı, WhatsApp |
| Villa/bahçe sahibi | 35-65 yaş, Gölbaşı ve çevresi | Peyzaj, çit, kapı, otomasyon | Keşif ihtiyacı, kapsam ve maliyet | Önce/sonra galerisi, bölge bilgisi, fotoğrafla danışma |
| Dijital rahatlığı düşük kullanıcı | Yaştan bağımsız | En kısa yoldan ulaşmak | Karmaşık form, terim belirsizliği | Dört ana kategori, “Birlikte belirleyelim”, telefon/WhatsApp |

### Davranışsal ortaklıklar

- Kullanıcıların çoğu teknik hizmet adını değil, problemi bilir: “menteşe koptu”, “kapı kapanmıyor”, “duvar kabardı”.
- Karar yalnızca fiyatla verilmez; işin gerçekten yapılabildiğini gösteren görsel kanıt önemlidir.
- Müşteri kesin rezervasyondan önce fotoğraf, bölge ve yaklaşık fiyat üzerinden uygunluk teyidi bekleyebilir.
- Mobil kullanımın sahada, apartman girişinde veya sorunun yanında gerçekleşmesi olasıdır.
- Kullanıcı aynı işi farklı ustalara soruyor olabilir; ilk yanıt süresi dönüşüm için kritik hale gelir.

### Araştırılması gereken demografik sorular

- Taleplerin ilçe dağılımı ve hizmet bölgesi dışı talep oranı nedir?
- Kullanıcıların yaş aralıklarına göre form/WhatsApp tercihi değişiyor mu?
- Yeni müşteri ile tekrar müşterinin dönüşüm ve iptal oranı farklı mı?
- Apartman yöneticileri ile bireysel müşterilerin ortalama iş değeri farklı mı?
- En yüksek dönüşüm hangi giriş kanalından geliyor: organik arama, doğrudan, galeri, WhatsApp?

---

## 5. Müşteri Gözünden Beklenti Analizi

### Kullanıcının zihnindeki sorular

1. Bu usta benim işimi yapıyor mu?
2. Daha önce benzer iş yapmış mı?
3. Hangi bölgelere geliyor?
4. Yaklaşık ne kadar tutar?
5. Ne zaman gelebilir?
6. Talep gönderdikten sonra ne olacak?
7. Planım değişirse ne yapacağım?

Ürün 1, 2, 3, 5, 6 ve 7 numaralı soruları güçlü biçimde karşılıyor. Fiyat beklentisi galeri vakalarında kısmen cevaplanıyor; ancak randevu akışında hizmet seçimiyle birlikte fiyatı etkileyen faktörler veya keşif gereksinimi yeterince erken görünmüyor.

### Müşteri yolculuğu değerlendirmesi

| Aşama | Müşteri amacı | Mevcut deneyim | Risk | Fırsat |
| --- | --- | --- | --- | --- |
| Keşif | Güvenilir usta bulmak | Net hero, yer ve saat bilgisi, gerçek iş görseli | Bağımsız yorum/puan kanıtı yok | Google yorumları veya doğrulanabilir referans |
| Değerlendirme | Benzer işi ve kaliteyi görmek | Önce/sonra vakaları güçlü | Uzun sayfada içerik tekrarı | Galeriyi problem türüne göre sadeleştirme |
| Hizmet seçimi | Kendi sorununu eşleştirmek | Dört ana kategori ve belirsizlik yolu iyi | Teknik alt hizmet adları bazı kullanıcıları zorlayabilir | Problem tabanlı örnekler ve “fotoğraf ekle” |
| Zaman seçimi | En yakın uygun zamanı bulmak | Haftalık görünüm açık ve erişilebilir | Geçmiş günler ilk uygun günü aşağı iter | İlk uygun gün kısayolu, geçmiş günleri daraltma |
| Bilgi girişi | En az eforla talep bırakmak | Minimum zorunlu alan ve opsiyonel detay yaklaşımı iyi | Adres/bölge uygunluğu geç anlaşılabilir | İlçe ön kontrolü ve isteğe bağlı fotoğraf |
| Bekleme | Ne zaman dönüş olacağını bilmek | Teyit modeli ve çalışma saati beklentisi var | Otomatik bildirim teslimi ürün içinde görünür değil | SMS/e-posta/WhatsApp durum bildirimi |
| Sonrası | Değişiklik, iptal, geri bildirim | Token tabanlı öz-servis güçlü | Linkin müşteriye güvenilir teslimi kritik | Hatırlatma ve tekrar hizmet akışı |

---

## 6. Product Owner Değerlendirmesi

### Ürün hedefi

Kuzey yıldızı yalnızca “gönderilen randevu formu” olmamalıdır. Daha doğru ölçüm:

**Teyit edilmiş ve hizmet bölgesi içinde olan nitelikli randevu talebi sayısı.**

Çünkü çok talep fakat düşük teyit oranı; pazarlama başarısı değil, operasyon yükü üretir.

### Feature completeness

| Yetkinlik | Durum | Değerlendirme |
| --- | --- | --- |
| Hizmet keşfi | Güçlü | Ana kategori ve alt hizmet yapısı anlaşılır. |
| Randevu talebi | Güçlü | Üç adım, durum koruma ve hata davranışları mevcut. |
| Haftalık müsaitlik | Güçlü | Gün/saat, geçmiş ve kapalı durumları ayrışıyor. |
| Mobil deneyim | Güçlü | Geniş viewport ve sanal klavye test kapsamı var. |
| Galeri ve sosyal kanıt | Güçlü | Önce/sonra ve vaka anlatımı ayırt edici. |
| Müşteri öz-servisi | Güçlü | Takip, değişiklik, iptal ve geri bildirim mevcut. |
| Yönetim operasyonu | Güçlü | Talep, müsaitlik, hizmet, galeri, kullanıcı yönetimi mevcut. |
| Rol ve yetki | Güçlü | Owner/admin/operator/technician ayrımı ve RLS desteği var. |
| Ürün analitiği | Güçlü | Funnel, kanal, galeri ve öz-servis olayları izleniyor. |
| Görsel yükleme | Yönetimde güçlü, müşteride eksik | Müşteri fotoğrafı uygulama içinde talebe eklenemiyor. |
| Bölge uygunluk kontrolü | Kısmi | Hizmet bölgesi anlatılıyor; talep öncesi ilçe doğrulaması yok. |
| Otomatik bildirim | Kısmi | Provider bağımsız outbox şeması var; gönderim worker/provider entegrasyonu gözlenmedi. |
| Teklif/onay akışı | Eksik | Tahmini teklif, müşteri onayı ve revizyon yaşam döngüsü yok. |
| Ödeme/fatura | Kapsam dışı/eksik | Mevcut MVP için zorunlu değil; büyüme aşamasında değerlendirilebilir. |
| Tekrar müşteri/CRM | Kısmi | Yerel iletişim hatırlama var; müşteri geçmişi ve yeniden hizmet akışı sınırlı. |

### Ürün stratejisi riski

Uygulama hem kaynak/metal uzmanlığı hem boya, bahçe ve genel tadilat sunuyor. Bu geniş kapsam gelir fırsatı yaratır; fakat marka konumunu bulanıklaştırabilir. Kullanıcı “Umut Usta tam olarak neyin uzmanı?” sorusuna ilk saniyelerde kesin cevap arar.

Önerilen konum:

**Ana uzmanlık:** kaynak, metal, kapı ve otomasyon.  
**Tamamlayıcı hizmet:** bakım, küçük tadilat ve dış alan.

Bu hiyerarşi hero, galeri sırası, SEO sayfaları ve hizmet kategorilerinde tutarlı olmalıdır.

---

## 7. Design Thinking Değerlendirmesi

### Empathize

Mevcut ürün, kullanıcının teknik terimleri bilmeyebileceğini doğru kabul ediyor. “Hangi hizmet olduğunu bilmiyor musunuz? Birlikte belirleyelim” yolu bunun en iyi örneğidir.

Geliştirme alanı:

- 5-7 müşteriyle görev bazlı mobil test yapılmalı.
- 3 apartman yöneticisiyle güven ve teklif beklentisi görüşülmeli.
- Son 20 gerçek talep “hangi bilgi eksikti?” açısından kodlanmalı.
- İptal/değişiklik nedenleri yalnızca gösterilmemeli, ürün kararına dönüştürülmeli.

### Define

Önerilen problem tanımı:

> Ankara'da yerel bakım ve metal işi arayan müşteriler, ustanın uygunluğunu, iş kalitesini ve yaklaşık kapsamı aynı anda değerlendirmekte zorlandığı için telefon ve WhatsApp üzerinde tekrarlı görüşmeler yapmak zorunda kalıyor.

Ürün problemi “form doldurtmak” değil, **müşteri güvenini kaybetmeden operasyonel belirsizliği azaltmaktır**.

### Ideate

En güçlü çözüm fikirleri:

- İlk uygun gün ve saat önerisi.
- Problem fotoğrafını talebe ekleme.
- İlçe/hizmet alanı ön kontrolü.
- Benzer vakadan seçilen hizmeti randevuya taşıma.
- “Bu fiyatı ne etkiler?” bilgisini hizmet seçiminde bağlamsal gösterme.
- Galeride “problem türü” ve “mekân türü” üzerinden keşif.
- Müşteri için talep durum bildirimi ve otomatik hatırlatma.

### Prototype

Önce düşük riskli prototipler önerilir:

1. Takvimde geçmiş günleri tek satırlık “6 geçmiş gün” özetine dönüştür.
2. Galeri filtrelerini dört ana kategoriye indir; alt filtreyi kategori seçildikten sonra göster.
3. “Fotoğrafla danış” CTA'sını seçili hizmet bilgisiyle önceden doldur.
4. Randevu formuna zorunlu olmayan tek fotoğraf alanı prototipi ekle.

### Test

Her prototip için başarı kriteri önceden tanımlanmalıdır:

- Zaman adımını tamamlama süresi yüzde 20 azalıyor mu?
- Galeri filtresi kullananların vaka açma oranı artıyor mu?
- Fotoğraf ekleyen taleplerin teyit oranı yükseliyor mu?
- Hizmet bölgesi dışı talepler azalıyor mu?

---

## 8. UX/UI ve Bilişsel Yük Değerlendirmesi

### Güçlü yönler

- Birincil aksiyon olan “Randevu Al” görsel olarak baskın, WhatsApp ikincil fakat erişilebilir.
- Hero başlığı hizmet alanını ve lokasyonu doğrudan anlatıyor.
- Üç adımlı wizard, progressive disclosure ilkesini doğru uyguluyor.
- Seçilen hizmet sonraki adımda görünür kalıyor; recall yerine recognition destekleniyor.
- Mobil butonlar ve kartlar yeterli dokunma alanına sahip.
- Dark mode yalnızca renk değişimi değil, kontrast ve yüzey sistemi olarak ele alınmış.
- Gerçek önce/sonra görselleri, dekoratif stok görselden daha güçlü bir kanıt sunuyor.
- Vaka penceresi mobilde tam genişlik ve rahat incelenebilir medya düzenine sahip.
- Focus, klavye ve hareket azaltma davranışları otomatik testlerle güvence altında.

### Bilişsel yük riskleri

#### 1. Haftanın sonunda geçmiş gün yoğunluğu

26 Temmuz Pazar günü yapılan incelemede takvim önce 20-25 Temmuz arasındaki altı “Geçmiş” kartı gösterdi; tek müsait gün olan Pazar alt ekrana kaldı.

**Etkisi:** Kullanıcı doğru seçeneği bulmak için gereksiz tarama yapar.  
**Öneri:** Geçmiş günleri daralt, bugünü ilk sıraya getir veya ilk uygun günü görünür alanda kısayol olarak sun.

#### 2. Galeri filtrelerinde kategori yoğunluğu

Mobil filtre alanında sekiz seçenek bulunuyor ve “Bina ve bahçe kapıları için akıllı kilit sistemleri” seçeneği tam satır kaplıyor.

**Etkisi:** Hick yasasına göre seçenek sayısı ve ad uzunluğu karar süresini artırır.  
**Öneri:** Önce dört ana hizmet göster; alt hizmetleri seçim sonrası aç.

#### 3. Galeri içeriğinde tekrar

Önce/sonra vaka kartlarından sonra aynı işlerin yeniden yer aldığı ikinci galeri bulunuyor.

**Etkisi:** Sayfa uzuyor ve kullanıcı yeni içerik beklerken tekrar görüyor.  
**Öneri:** İlk bölümde öne çıkan 3 vaka, ikinci bölümde kalan işler veya tek birleşik galeri modeli kullan.

#### 4. “2 saat” ifadesinin anlam belirsizliği

“Standart randevu aralığı” operasyonel slot uzunluğunu anlatıyor; müşteri bunu işin iki saatte tamamlanacağı sözü olarak yorumlayabilir.

**Öneri:** “2 saatlik geliş zamanı aralığı” veya “Planlama aralığı” gibi daha kesin ifade kullan.

#### 5. Güven kanıtının çoğunlukla öz-beyan olması

Konum, saat ve iş sayısı faydalı; fakat bağımsız puan, müşteri yorumu, garanti yaklaşımı veya kurumsal doğrulama görünmüyor.

**Öneri:** Sahte veya doğrulanamaz sosyal kanıt eklenmemeli. Gerçek Google değerlendirmesi, müşteri izni alınmış kısa yorum veya işçilik garantisi varsa açıkça gösterilmeli.

### Görsel kanca değerlendirmesi

En güçlü görsel kanca, hero fotoğrafından çok gerçek önce/sonra iş görselleridir. Hero profesyonel bağlam kurar; fakat dönüşüm açısından “paslı menteşe -> sağlam kaynak” dönüşümü daha somut ve ikna edicidir.

Önerilen görsel öncelik:

1. Gerçek iş sonucu.
2. Önce/sonra farkı.
3. İlçe ve iş türü.
4. Kısa problem/çözüm.
5. Benzer iş için randevu CTA'sı.

Bu sıra galeride büyük ölçüde sağlanmıştır.

---

## 9. Data Visualization ve Ürün Ölçüm Modeli

### Mevcut güçlü temel

Üründe birinci taraf analitik olayları ve yönetim dashboard'u bulunuyor. Ölçülen başlıklar arasında:

- sayfa ve hero CTA etkileşimi,
- wizard başlangıcı,
- hizmet grubu seçimi ve geri dönüş,
- tarih kısayolu ve takvim kullanımı,
- slot seçimi,
- adım tamamlama ve doğrulama hatası,
- gönderim başlangıcı, başarı ve hata,
- WhatsApp tıklaması,
- galeri vaka görüntüleme ve randevu CTA'sı,
- müşteri takip ve öz-servis aksiyonları

yer alıyor. Kişisel alanların analitikten ayıklanması doğru bir privacy-by-design yaklaşımıdır.

### Önerilen ana metrik ağacı

```text
Nitelikli teyit edilmiş talep
├── Talep hacmi
│   ├── Ziyaretçi
│   ├── Wizard başlatma oranı
│   └── Form tamamlama oranı
├── Talep kalitesi
│   ├── Hizmet bölgesi uygunluğu
│   ├── İletişim kurulabilme oranı
│   └── Fotoğraf / yeterli açıklama oranı
├── Operasyon dönüşümü
│   ├── İlk yanıt süresi
│   ├── Teyit oranı
│   ├── Tamamlama oranı
│   └── İptal oranı
└── Müşteri değeri
    ├── Tekrar talep oranı
    ├── Ortalama iş değeri
    └── Tavsiye / yorum oranı
```

### Dashboard görselleştirme önerileri

| Soru | En uygun görsel | Kaçınılması gereken |
| --- | --- | --- |
| Funnel nerede kırılıyor? | Aşama bazlı funnel + yüzde | Yalnızca ham toplam kartları |
| Hangi saatler yoğun? | Gün x saat ısı haritası | Çok renkli pasta grafik |
| Hangi hizmet daha kaliteli lead üretiyor? | Sıralı yatay bar: talep, teyit, tamamlama | Tek başına talep sayısı |
| Kanallar nasıl karşılaştırılıyor? | Kanal bazlı küçük çoklu funnel | WhatsApp ve web'i aynı tanımsız toplamda birleştirme |
| İptal nedenleri ne? | Yatay bar + dönem karşılaştırması | Uzun legend'lı donut |
| Değişiklik etkisi ne oldu? | Önce/sonra zaman serisi ve anotasyon | Sadece son 30 gün ekranı |

### Ölçümde kritik eksikler

- WhatsApp ve telefon üzerinden başlayan talepler web funnel'ına otomatik bağlanmıyor.
- Session bazlı ölçüm, tekrar müşteriyi veya cihazlar arası yolculuğu tam temsil etmez.
- “İlk yanıt süresi” ve “teyide kadar geçen süre” ana operasyon metriği olarak öne çıkarılmalı.
- Galeri görüntüleme ile sonraki teyit edilmiş iş arasındaki attribution penceresi tanımlanmalı.
- Event şema versiyonu eklenmeli; aksi halde ileride dashboard anlamı sessizce değişebilir.

---

## 10. Advanced Software Engineering Değerlendirmesi

### Güçlü mimari kararlar

- Route seviyesinde lazy loading kullanılıyor.
- TanStack Query ile sunucu durumu UI durumundan ayrılıyor.
- Supabase erişimi domain servis modüllerinde toplanmış.
- Anonim randevu oluşturma doğrudan tablo insert'i yerine doğrulamalı RPC üzerinden yapılıyor.
- Slot kapatma/açma davranışı veri tabanı fonksiyonlarıyla korunuyor.
- RLS politikaları public ve ekip erişimini ayırıyor.
- Müşteri notu ile iç operasyon notunun ayrılması veri bütünlüğü ve gizlilik açısından doğru.
- Public token yanıtı minimum veriyle sınırlandırılmış.
- Rol bazlı route koruması veri tabanı yetkileriyle birlikte uygulanmış.
- Responsive görseller, lazy medya, performans bütçesi ve medya denetimi mevcut.

### Teknik riskler ve gelişim alanları

#### 1. Migration yönetimi

Birden fazla SQL dosyasında aynı fonksiyonların güncellenmiş sürümleri bulunuyor. Kurulum sırası README'de anlatılsa da migration bağımlılığı manuel dikkat gerektiriyor.

**Öneri:** Zaman damgalı, tek yönlü ve idempotent migration standardı; staging üzerinde otomatik migration smoke testi.

#### 2. Bildirim outbox'ı

Veri modelinde provider bağımsız `notification_outbox` var. Ancak repository içinde outbox tüketen worker/provider uygulaması gözlenmedi.

**Öneri:** Retry, exponential backoff, dead-letter durumu, idempotency key, provider response ve teslim zamanı alanlarıyla Edge Function/worker.

#### 3. Bundle boyutu

Dashboard chunk'ı yaklaşık 423 kB, ana index chunk'ı yaklaşık 251 kB ve Supabase chunk'ı yaklaşık 200 kB'dir. Lazy loading müşteri ilk yükünü koruyor; yine de admin tarafında ilk dashboard açılışı ağırlaşabilir.

**Öneri:** Recharts ve analitik panellerini ekran/sekme bazında daha geç yüklemek; bundle analizini CI raporuna eklemek.

#### 4. Gözlemlenebilirlik

Kullanıcıya anlaşılır hata mesajları var; fakat istemci hata takibi, RPC latency, bildirim teslimi ve başarısız talep alarmı görünür değil.

**Öneri:** PII filtreli hata izleme, temel SLI/SLO ve kritik RPC başarısızlık alarmı.

#### 5. Veri yaşam döngüsü

Gizlilik sayfası mevcut olsa da randevu verisinin saklama süresi, arşiv temizliği ve müşteri silme/anonymization süreci teknik politika olarak netleştirilmeli.

### Test ve kalite sonucu

| Kontrol | Sonuç |
| --- | --- |
| ESLint | Başarılı |
| Vitest | 24 dosya, 94 test başarılı |
| Production build | Başarılı |
| Playwright E2E | 56 senaryo başarılı |
| Responsive matris | 320x568 ile 1920x1080 arası başarılı |
| Klavye ve erişilebilirlik senaryoları | Başarılı |
| Reduced motion / forced colors | Başarılı |
| Görsel medya denetimi | 22 kaynak, 201 responsive varyant, başarılı |
| Performans bütçesi | Başarılı; toplam 14.78 MB, kritik görseller 194.8 kB |

Not: Medya denetiminin işaretlediği `landscaping.png` ve `landscaping_after.png`, aynı tamamlanmış iş görselinin iki teknik kopyasıdır. Görsel inceleme ayrıca `landscaping_before.png` dosyasının farklı bir mülkü gösterdiğini ortaya çıkarmıştır; gerçek öncesi doğrulanana kadar bu görsel aynı vaka içinde kullanılmamalıdır.

---

## 11. Bug ve Risk Kaydı

| Öncelik | Bulgu | Tür | Kullanıcı etkisi | Önerilen aksiyon |
| --- | --- | --- | --- | --- |
| P1 | Haftanın sonunda geçmiş günler tek uygun günü aşağı itiyor | UX | Zaman seçimi yavaşlıyor | Geçmiş günleri daralt veya ilk uygun günü öne al |
| P1 | Bildirim outbox tüketicisi repository içinde görünmüyor | Operasyon | Talep/takip linki teslimi manuel kalabilir | Worker ve teslim gözlemlenebilirliği |
| P1 | WhatsApp/telefon talepleri sistem talebiyle birleşmiyor | Product/Data | Funnel ve kapasite resmi eksik kalıyor | Hızlı manuel kayıt veya kanal entegrasyonu |
| P2 | Galeri filtreleri mobilde yoğun ve uzun | UX | Karar süresi ve tarama yükü artıyor | Hiyerarşik filtre |
| P2 | Önce/sonra ve galeri bölümleri içerik tekrarı yaratıyor | IA | Sayfa gereksiz uzuyor | Bölümleri farklı amaçlarla ayır |
| P2 | “2 saat” ifadesi hizmet süresi gibi algılanabilir | Content UX | Yanlış beklenti | Metni “planlama aralığı” olarak netleştir |
| P2 | Bağımsız güven kanıtı sınırlı | Product | İlk kez gelen müşteride tereddüt | Doğrulanabilir yorum/garanti/referans |
| P2 | Randevu içinde fotoğraf yükleme yok | Feature | Keşif için ek WhatsApp görüşmesi | Opsiyonel, güvenli medya eki |
| P2 | İlçe uygunluğu talep öncesi doğrulanmıyor | Product | Düşük kaliteli lead | İlçe seçimi ve uygunluk mesajı |
| P3 | Dashboard chunk'ı büyük | Engineering | Admin ilk açılışı yavaşlayabilir | Analitik modüllerini daha geç yükle |
| P3 | Peyzaj “önce” görseli aynı mülke ait görünmüyor | Content/Data | Önce/sonra güveni zarar görebilir | Doğrulanana kadar önce görselini yayından kaldır |
| P3 | Migration sırası manuel dikkat istiyor | Engineering | Ortamlar arası şema sapması | Numaralı migration ve CI smoke test |

---

## 12. Önceliklendirilmiş Aksiyon Planı

### Şimdi: 1-2 hafta

1. Takvimde geçmiş günleri daralt ve “İlk uygun gün” aksiyonunu görünür alana getir.
2. “2 saat” mesajını operasyonel anlamı açık olacak şekilde değiştir.
3. Yinelenen peyzaj sonuç görselini birleştir ve doğrulanamayan önce görselini vakadan çıkar.
4. Galeri filtrelerini dört ana kategori + bağlamsal alt kategori modeline indir.
5. Canlı dashboard'da ilk yanıt süresi, teyit oranı ve hizmet bölgesi dışı talep oranını görünür yap.

### Sonraki: 2-6 hafta

1. Talebe opsiyonel fotoğraf ekleme prototipi.
2. İlçe/hizmet alanı ön kontrolü.
3. Notification outbox worker ve teslim durumu.
4. Galeriden randevuya hizmet/vaka bağlamı taşıma.
5. Gerçek kullanıcı testleri ve beş temel görev için süre/hata ölçümü.

### Daha sonra: 6-12 hafta

1. Teklif oluşturma, müşteri onayı ve revizyon akışı.
2. WhatsApp/telefon talebi için hızlı operasyon kaydı.
3. Tekrar müşteri görünümü ve hizmet geçmişi.
4. Ortalama iş değeri ve kaynak bazlı gelir attribution'ı.
5. Gerekliyse ödeme/depozito ve fatura entegrasyonu.

### Etki / efor matrisi

| Aksiyon | Etki | Efor | Karar |
| --- | ---: | ---: | --- |
| İlk uygun günü öne alma | Yüksek | Düşük | Hemen yap |
| “2 saat” metnini netleştirme | Orta | Çok düşük | Hemen yap |
| Galeri filtre hiyerarşisi | Orta-yüksek | Orta | Yakın sprint |
| İlçe ön kontrolü | Yüksek | Orta | Yakın sprint |
| Fotoğraf yükleme | Yüksek | Orta-yüksek | Prototip ve test |
| Bildirim worker | Çok yüksek | Yüksek | Operasyon önceliği |
| Teklif/onay akışı | Yüksek | Yüksek | Validasyon sonrası |
| Ödeme | Belirsiz | Yüksek | Talep kanıtı olmadan yapma |

---

## 13. Kullanıcı Gözüyle Son Değerlendirme

Bir müşteri olarak ilk izlenim olumludur: işletmenin ne yaptığı, Ankara'da hizmet verdiği ve nasıl iletişime geçileceği anlaşılır. Gerçek iş fotoğrafları “bu işi yapabiliyor” hissini güçlü biçimde verir. Randevu akışının üç adımlı olması, uzun ve kurumsal bir form hissini azaltır. “Birlikte belirleyelim” seçeneği teknik adını bilmeyen kullanıcıya güven verir.

En çok zorlandığım an, haftanın son gününde zaman seçerken geçmiş günlerin arasından tek uygun günü bulmak olurdu. Galeri etkileyici olsa da filtre ve tekrar eden içerik nedeniyle bir noktadan sonra tarama yorgunluğu oluşabilir. Randevu bırakmadan önce yaklaşık fiyatı neyin değiştirdiğini, benim ilçeme kesin gelinip gelinmediğini ve talep sonrası ne kadar sürede dönüş yapılacağını daha somut görmek isterdim.

Genel his:

> “Profesyonel, güvenilir ve kullanımı kolay bir yerel hizmet ürünü. Talep bırakabilirim; fakat fiyat, hizmet alanı ve ilk dönüş süresi konusunda biraz daha kesinlik beni daha hızlı ikna eder.”

---

## 14. Sonuç

Umut Usta'nın tasarım ve teknik temeli güçlüdür. Mobil responsive kalite artık ürünün zayıf noktası değil, rekabet avantajıdır. Bundan sonraki yatırımın büyük kısmı yeni yüzeyler eklemekten çok:

- karar süresini azaltmaya,
- güveni bağımsız kanıtlarla artırmaya,
- talep kalitesini yükseltmeye,
- kanal ve bildirim operasyonunu birleştirmeye,
- ürün kararlarını canlı veriye bağlamaya

ayrılmalıdır.

Doğru sonraki adım, takvim ve galeri yoğunluğunu azaltan küçük UX geliştirmelerini canlıya alıp bunları gerçek funnel metrikleriyle ölçmek; aynı anda bildirim teslimi ve kanal bütünlüğünü operasyonel olarak sağlamlaştırmaktır.

Bu rapordan türetilen uygulama sırası, kabul kriterleri ve ölçüm planı
[`Umut_Usta_Urun_Iyilestirme_Sprint_Plani_2026-07-26.md`](./Umut_Usta_Urun_Iyilestirme_Sprint_Plani_2026-07-26.md)
dosyasında yer almaktadır.
