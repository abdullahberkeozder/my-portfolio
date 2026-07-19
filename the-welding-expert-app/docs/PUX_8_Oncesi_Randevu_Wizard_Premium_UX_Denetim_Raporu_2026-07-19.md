# PUX-8 Öncesi Randevu Wizard Premium UX Denetim Raporu

**Ürün:** Umut Usta Randevu Uygulaması (`the-welding-expert-app`)  
**Tarih:** 19 Temmuz 2026  
**Kapsam:** Müşteri randevu wizard'ı; hizmet, zaman, iletişim, doğrulama ve başarı durumları  
**Çalışma biçimi:** Yerel inceleme ve test; commit, push, deploy ve canlı veri kaydı yapılmadı  
**Ana referans:** `Umut_Usta_Bilissel_Yuk_UX_UI_Arastirma_Raporu_2026-07-19.md`  
**Tasarım referansı:** `Umut_Usta_Premium_Tasarim_Dili_Benchmark_Raporu_2026-07-19.md`

## 1. Yönetici özeti

Randevu wizard'ı işlev, görev sırası ve erişilebilirlik bakımından olgunlaşmıştır. Üç ana adım nettir; hizmet seçimi kademeli açılır; tarih ve saat birlikte sorulmaz; iletişim adımında yalnız ad ve telefon zorunludur; önceki adımlara dönüş mümkündür; başarı ekranı takip ve self-servis yönetim yolunu sunar. Bu yapı önceki sekiz hizmetli, uzun ve aynı anda çok karar isteyen sürüme göre belirgin biçimde daha düşük bilişsel yük üretir.

Kullanıcının hissettiği “bir şeylerin yanlış gitmesi” işlevsel bir kırılmadan çok **algısal kalite ve içerik özgüveni açığıdır**. Akış bugün iyi tasarlanmış bir operasyon formu gibi görünür; ancak Quiet Craft hedefindeki ölçülü, özenli ve ustalık odaklı premium hizmet deneyimine tam ulaşmaz.

Temel nedenler:

1. İlerleme durumu iki kez anlatılır: `Adım 1 / 3 · Hizmet` metni ve hemen altındaki üç adımlı gösterge aynı bilgiyi tekrarlar.
2. Her adım kendi işini açıklarken ayrıca arayüzün nasıl kullanılacağını da anlatır. Bu, işlem tamamlamayı kolaylaştırmaktan çok metin hacmini büyütür.
3. `Talebi sistemde kaydet`, `aşağıdaki kısa form`, `talep numarası ve yönetim bağlantısı` gibi ifadeler müşteri sonucundan çok sistem mekanizmasını öne çıkarır.
4. Çerçeve, ayırıcı, özet şeridi, kart ve durum kutuları birbirine yakın görsel ağırlıktadır. Hiyerarşi doğru olsa da yeterince seçkin değildir.
5. Wizard dış kabuğu masaüstünde ana içerik ızgarasıyla uyumludur; fakat iç görev yüzeyi geniş boşluk ve tekdüze yatay dağılım nedeniyle editorial/premium bir ritim yerine genişletilmiş form hissi verir.
6. `320 px` genişlikte iletişim adımında wizard içinde yaklaşık `35 px` yatay taşma oluşur. Sayfa kökü taşmadığı için mevcut PUX-7 testi bu sorunu yakalamaz.
7. Başarı ekranı güven vericidir; fakat sonraki adım açıklaması ve üç eylem birlikte gösterildiğinde kapanış anındaki odak bölünür.

**Karar:** PUX-8 kullanıcı doğrulamasına geçmeden önce küçük ama etkili bir **PUX-7.5 Wizard Refinement** uygulanmalıdır. Bilgi mimarisi ve üç adımlı model korunmalı; metin, ilerleme göstergesi, yüzey hiyerarşisi, dar mobil davranış ve başarı kapanışı rafine edilmelidir. Baştan yeni wizard tasarlamak gerekli değildir.

## 2. İnceleme yöntemi

### 2.1 Kullanılan kanıtlar

- Bilişsel yük raporundaki yerel yük bütçesi, kullanıcı senaryoları, renk, tipografi, motion ve Quiet Craft ilkeleri incelendi.
- Premium benchmark raporundaki malzeme dürüstlüğü, restrained hierarchy, gerçek kanıt, kontrollü renk ve içerik özgüveni ilkeleri incelendi.
- Yerel uygulama `http://127.0.0.1:5281/appointment` üzerinden açıldı.
- Masaüstü `1440x900`, mobil `390x844` ve dar mobil `320x760` görünümleri açık ve koyu temada incelendi.
- Hizmet kategorisi, alt hizmet, tarih, saat ve iletişim adımları canlı yerel arayüzde yürütüldü.
- Başarı durumu, gerçek kayıt oluşturmadan mock'lu Playwright senaryosu ve güncel görsel baseline üzerinden incelendi.
- Wizard'a ait bileşen testleri ve PUX-7 E2E sertleştirme testleri yeniden çalıştırıldı.

### 2.2 Test sonuçları

| Katman | Sonuç | Not |
| --- | ---: | --- |
| Wizard birim/bileşen testleri | **23/23 geçti** | Hizmet, takvim, form, başarı ve müşteri sayfası |
| E2E akış/erişilebilirlik/PUX-7 | **18/18 geçti** | Klavye, responsive matris, virtual keyboard, forced colors |
| Canlı masaüstü yürüyüş | **Tamamlandı** | Gönderim öncesine kadar gerçek yerel arayüz |
| Canlı mobil yürüyüş | **Tamamlandı** | 390 px ve 320 px |
| Gerçek Supabase kaydı | **Yapılmadı** | Yan etki oluşturmamak için başarı mock ile doğrulandı |

### 2.3 Değerlendirme sınırı

Bu rapordaki puanlar kullanıcı araştırması sonucu değil, uzman denetimi ve teknik ölçüme dayalı başlangıç skorlarıdır. PUX-8 sırasında gerçek katılımcı verisiyle doğrulanmalıdır.

## 3. Araştırma raporuyla uyum

### 3.1 Sağlanan hedefler

| Araştırma hedefi | Güncel durum | Değerlendirme |
| --- | --- | --- |
| Üç ana wizard adımı | Hizmet, Zaman Tercihi, İletişim | Sağlandı |
| Bir adımda bir ana karar | Her adım kendi kararını taşır | Sağlandı |
| Aynı anda 2-4 ana seçim | İlk adımda dört kategori | Sağlandı |
| Hizmeti kademeli açma | Kategori sonrası 1-3 alt hizmet | Sağlandı |
| Zorunlu alan sayısı iki | Ad ve telefon | Sağlandı |
| Geri alınabilir seçim | Adım düğmeleri ve değiştirme eylemleri | Sağlandı |
| Tek ana CTA | Her durumda bir dolu CTA | Büyük ölçüde sağlandı |
| Randevunun teyitle kesinleşmesi | Zaman ve iletişim adımında açıklanıyor | Anlaşılıyor, fakat tekrar ediyor |
| Mobil sticky wizard'ı kapatmıyor | PUX-7 testi geçiyor | Sağlandı |
| Klavye ile tamamlama | E2E testi geçiyor | Sağlandı |
| Dar görünümde taşma olmaması | 320 px iletişim adımında iç taşma var | Sağlanmadı |
| Kontrollü terminoloji | `Zaman tercihi` kullanılıyor | Kısmi; `Talebi kaydet` sözlük dışı |

### 3.2 Araştırma hedefinden sapmalar

Araştırma raporu içerik özgüvenini “uzun açıklama ve kendini tekrar etmek yerine kısa, doğrulanabilir bilgi” olarak tanımlar. Güncel wizard, kararları doğru azaltırken açıklama katmanlarını yeterince azaltmamıştır. Özellikle:

- İlerleme bilgisi iki farklı yüzeyde aynı anda görünür.
- Seçim yapılmadığında hem durum metni hem disabled CTA aynı şeyi anlatır.
- Seçim yapıldığında hem seçili radio durumu hem `Hizmet seçildi` metni hem de CTA ilerlemeyi anlatır.
- İletişim adımında teyit açıklaması üst metinde ve gizlilik/işlem notunda yinelenir.
- Başarı ekranında `Ekip teyidi bekleniyor`, çalışma saatleri kutusu ve son cümle aynı beklentiyi farklı biçimlerde tekrar eder.

Bu tekrarlar kritik hata değildir. Ancak premium deneyimde algılanan özen, daha fazla bilgiyle değil doğru bilgiyi yalnız doğru anda gösterme cesaretiyle oluşur.

## 4. Uzman skor kartı

| Boyut | Skor / 10 | Gerekçe |
| --- | ---: | --- |
| Görev bulunabilirliği | 9.0 | Hero ve güven şeridinden sonra wizard görünür |
| Karar mimarisi | 8.8 | Dört kategori, kademeli alt hizmet, üç adım |
| Geri dönüş ve kontrol | 9.0 | Adım göstergesi ve `Değiştir` yolları çalışıyor |
| Bilişsel yük | 8.2 | Yapısal yük düşük; açıklama ve durum tekrarları var |
| İçerik dili | 6.8 | Açık fakat yer yer sistem-merkezli ve öğretici |
| Görsel hiyerarşi | 7.2 | Düzenli; çok sayıda eş ağırlıklı çizgi/yüzey var |
| Premium/Quiet Craft hissi | 6.4 | Temiz ve tutarlı; zanaat özgünlüğü ile içerik özgüveni zayıf |
| Operasyonel güven | 8.7 | Teyit, saat, takip ve yönetim beklentisi net |
| Erişilebilirlik | 9.2 | Semantik roller ve klavye akışı güçlü |
| Responsive dayanıklılık | 7.4 | 390 px iyi; 320 px iletişim durumunda iç taşma var |
| Başarı kapanışı | 7.6 | Sonuç ve takip net; açıklama/eylem yoğunluğu fazla |

**Genel uzman değerlendirmesi:** `7.9 / 10`  
**Premium algı alt skoru:** `6.4 / 10`  
**Yorum:** Ürün görev tamamlama bakımından güçlü, marka deneyimi bakımından orta-üst seviyededir.

## 5. Bilişsel yük analizi

### 5.1 İçsel yük

Müşterinin kaynak, motor, boya, tadilat veya keşif arasındaki ayrımı her zaman bilmemesi işin doğal karmaşıklığıdır. Güncel tasarım bunu dört problem grubu ve `Birlikte belirleyelim` yoluyla iyi yönetir. Bu katman korunmalıdır.

### 5.2 Dışsal yük

Dışsal yük şu noktalarda gereksiz yükselir:

- Aynı ilerleme bilgisinin iki kez görünmesi.
- Seçili durumun birden fazla bileşende tekrarlanması.
- `Seçili hizmet:` satırı ile `Değiştir` düğmesinin ayrı bir ara bant oluşturması.
- İletişim adımındaki üç satırlı özetin mobilde büyük bir blok haline gelmesi.
- Formu açıklayan iki giriş cümlesi, telefon yardım metni, cihazda saklama metni ve gizlilik/teyit notunun aynı ekranda görünmesi.
- Başarı ekranında takip kodu, beş detay satırı, çalışma saatleri kutusu ve üç eylemin ardışık sunulması.

### 5.3 Yararlı işlem

Kullanıcının karar vermesini gerçekten destekleyen içerikler:

- Hizmet kartlarındaki kısa problem örnekleri.
- Ortalama iş süresi ve çalışma saatleri.
- Randevunun ekip teyidiyle kesinleşeceği bilgisi.
- Telefonun arama veya WhatsApp için kullanılacağı açıklaması.
- Başarı ekranındaki takip kodu ve yönetim bağlantısı.

Rafinasyon sırasında bu içerikler korunmalı; yalnız konumları ve tekrar sayıları azaltılmalıdır.

## 6. Adım bazlı denetim

### 6.1 Adım 1: Hizmet

#### Güçlü yönler

- İlk görünümde dört ana kategori vardır; yerel bütçedeki 2-4 hedefini karşılar.
- Kategori dili müşterinin problemine yakındır.
- Varsayılan seçim yapılmaz; kullanıcı iradesi korunur.
- `Birlikte belirleyelim` ana kategori ızgarasından ayrıdır.
- Seçim sonrası yalnız ilgili alt hizmetler görünür.
- Alt hizmetler radio semantiğine sahiptir.

#### Sorunlar

1. `Adım 1 / 3 · Hizmet` ile ilerleme göstergesi tekrar eder.
2. İlk dört seçenek büyük kartlar olarak sunulur. İşlevsel olsa da border, ikon kutusu, ok ve açıklama birlikte biraz “template UI” hissi verir.
3. `Henüz hizmet seçilmedi / Devam etmek için bir hizmet seçin` metni, disabled `Zaman tercihini seç` düğmesinin anlamını tekrarlar.
4. Alt hizmet seçildikten sonra `Hizmet seçildi / Zaman tercihinizi seçerek devam edin` metni, seçili radio ve aktif CTA ile aynı durumu üçüncü kez anlatır.
5. Hizmet açıklamaları kimi seçeneklerde iki-üç satıra çıkar; kart yüksekliği büyür ve tarama ritmi zayıflar.

#### Öneri

- Üstte yalnız üç adımlı ilerleme göstergesini bırak; `Adım x / 3` metnini yalnız ekran okuyucu canlı bölgesinde tut.
- Seçim öncesi durum paragrafını kaldır. Disabled CTA tek başına yeterli değilse CTA altında yalnız tek kısa hata önleme cümlesi göster.
- Seçim sonrası `Hizmet seçildi` paragrafını kaldır. Radio seçili stili + CTA yeterlidir.
- Kartlarda ikon kutusu yerine daha sakin tek renk ikon veya numarasız kısa başlık kullan; border kontrastını azalt, seçili durumu bakır sol çizgi/check ile belirginleştir.
- Açıklamaları mobilde hedef iki satırla sınırla; anlamı tooltip'e taşıma.

### 6.2 Adım 2: Zaman tercihi

#### Güçlü yönler

- Tarih ve saat sıralı sorulur.
- Bugün/Yarın hızlı seçimleri düşük çaba sağlar.
- Tam takvim progressive disclosure ile açılır.
- Saatler erişilebilir adlarla sunulur.
- Ortalama iş süresi yanlış beklentiyi azaltır.
- Seçili hizmet değiştirilebilir.

#### Sorunlar

1. `Tarih ve saat seçin` başlığının altında iki ayrı cümle vardır; biri kullanım talimatı, diğeri teyit politikasıdır.
2. `Seçili hizmet:` ara satırı geniş yatay yüzeyde zayıf bir bilgi bandı gibi görünür.
3. Tarih seçilmeden önce `Gün seçin`, `Ortalama iş süresi...`, `Önce bir tarih seçin` ve kısayol açıklaması birlikte gereğinden fazla boş durum metni üretir.
4. Tarih seçildikten sonra altı eşit saat düğmesi, seçim için uygundur; ancak müsaitlik durumu yalnız erişilebilir adda vardır. Görsel olarak hepsi sıradan buton gibi görünür.
5. Adım yüksekliği tarih seçilmeden önce büyük bir boş alan içerir. Bu, masaüstünde “tamamlanmamış panel” hissi verir.

#### Öneri

- Başlık altını `Size uyan günü ve saati seçin.` olarak kısalt; teyit bilgisini adımın altındaki tek operasyon notuna taşı.
- Seçili hizmeti `Hizmet · Kapı, korkuluk ve kaynak · Değiştir` biçiminde kompakt breadcrumb/summary satırına dönüştür.
- Tarih seçilmeden önce yalnız `Bir gün seçin` boş durumunu göster. Ortalama süreyi tarih seçildikten sonra saat başlığının yanında göster.
- Saat seçeneklerinde seçili/müsait/dolu durumunu renk + ikon/etiket kombinasyonuyla koru; her slotta tekrar eden `müsait` metni görselde zorunlu değildir.
- Masaüstünde tarih kontrolleri ile saat alanı arasında kontrollü iki kolon kullanılabilir; mobilde tek kolon korunur. Bu yalnız adım 2 için görev odaklı bir istisna olabilir.

### 6.3 Adım 3: İletişim

#### Güçlü yönler

- Ad ve telefon dışında zorunlu alan yoktur.
- Ek bilgi progressive disclosure altındadır.
- Telefon kullanım amacı açıklanır.
- Gizlilik amacı görünürdür.
- Önceki adıma dönüş mümkündür.
- Özet seçilen hizmet, tarih ve saati doğrulatır.

#### Sorunlar

1. `Talebi sistemde kaydet` ürün içi teknik dili müşteriye taşır. Kullanıcının amacı sisteme kayıt değil, ustaya talep iletmektir.
2. `Talep numarası ve yönetim bağlantısı almak için aşağıdaki kısa formu tamamlayın.` cümlesi arayüzü tarif eder ve sonucu mekanizmaya bağlar.
3. Ana CTA `Talebi kaydet`, araştırma raporundaki kontrollü `Talebi Gönder` terminolojisiyle uyumsuzdur.
4. `İletişim bilgilerinizi paylaşın` ve `Talebi sistemde kaydet` iki ardışık başlık olarak aynı yüzeyde rekabet eder.
5. Mobil özet üç büyük satıra dönüşür; form başlamadan önce yüksek bir blok oluşturur.
6. Telefon kullanım açıklaması, gizlilik açıklaması ve teyit açıklaması aynı ekranda üç ayrı güven metni yaratır.
7. `Ad, telefon ve e-posta bilgilerimi...` seçeneği, e-posta alanı başlangıçta kapalıyken kavramsal bir tutarsızlık oluşturur.
8. `320 px` genişlikte özet/progress/form bileşimi wizard içinde yaklaşık `35 px` yatay taşar ve sağ kenar kırpılır.

#### Öneri

- Tek başlık kullan: **`İletişim bilgileri`**.
- Tek destek cümlesi kullan: **`Uygunluğu teyit etmek için sizi bu numaradan arayalım veya WhatsApp'tan yazalım.`**
- `Talebi sistemde kaydet` başlığını ve form tarifini kaldır.
- CTA'yı **`Talebi Gönder`** yap.
- Özeti masaüstünde tek satırlı, mobilde iki satırlı kompakt bir özet yap: `Kapı, korkuluk ve kaynak · 20 Temmuz · 09:00-11:00` ve `Değiştir`.
- Gizlilik metnini CTA yakınında tek cümle tut; teyit bilgisini bu adımda tekrar etme.
- Cihazda saklama seçeneğini `Bilgilerimi bu cihazda hatırla` yap; kapsam ayrıntısını gizlilik metninde açıkla.
- `320 px` için progress, özet ve form çocuklarında `min-width: 0`, uzun metinde `overflow-wrap`, kontrollü gap ve daraltılmış padding doğrula.

### 6.4 Doğrulama ve hata durumu

#### Güçlü yönler

- Hata özeti `role="alert"` ile duyurulur.
- Hata sonrası odak özete taşınır.
- Virtual keyboard yüksekliğinde submit erişilebilir kalır.
- Ek bilgi alanı sonradan açılabilir.

#### Riskler

- Hata özeti ve alan içi hata aynı mesajı gereksiz tekrar etmemelidir.
- Hata rengi premium görünümde de semantik rolünü korumalı; bakır hata rengi olarak kullanılmamalıdır.
- Kullanıcı formun en altındayken hata özeti üstte kalıyorsa, odak + scroll davranışı gerçek iOS/Android cihazda doğrulanmalıdır.

### 6.5 Başarı durumu

#### Güçlü yönler

- Sonuç nettir: talep kaydedilmiştir.
- Takip kodu, hizmet, tarih, saat ve maskeli telefon görünür.
- `Talebi takip et` self-servis davranışı destekler.
- Fotoğraf/detay ekleme kanalı sunulur.
- Yeni talep oluşturma yolu vardır.

#### Sorunlar

1. `Talebiniz kaydedildi` sistem sonucudur; müşteriye daha doğal `Talebiniz alındı` ifadesi premium hizmet tonuna daha yakındır.
2. `Ekip teyidi bekleniyor`, çalışma saatleri kutusu ve kutu içindeki son cümle aynı beklentiyi tekrarlar.
3. Üç eylem aynı kapanışta görünür. Ana görev tamamlandıktan sonra kullanıcı hangi eylemin gerekli olduğunu yeniden değerlendirmek zorunda kalır.
4. Beş ayrıntı satırı ve büyük çalışma saatleri kutusu mobilde uzun bir kapanış üretir.

#### Öneri

- Başlık: **`Talebiniz alındı`**.
- Durum: **`Uygunluk teyidi bekleniyor`**.
- Tek sonraki adım cümlesi: **`Çalışma saatleri içinde sizi arayacağız veya WhatsApp'tan yazacağız.`**
- Birincil CTA: **`Talebi Takip Et`**.
- Fotoğraf ekleme ikincil link olarak kalabilir.
- `Yeni talep oluştur` düşük ağırlıklı metin linki olarak korunabilir.
- Ayrıntılar başlangıçta hizmet, tarih-saat ve takip koduyla sınırlandırılabilir; maskeli telefon disclosure altında gösterilebilir.

## 7. Premium deneyim açığı

### 7.1 Neden “temiz” ama tam premium değil?

Premium algı bu üründe koyu tema, daha çok bakır, daha büyük logo veya daha fazla animasyonla oluşmaz. Mevcut wizard zaten temizdir. Eksik olan, kararların ve görsel vurguların yeterince **edit edilmiş** görünmesidir.

| Quiet Craft bileşeni | Güncel durum | Açık |
| --- | --- | --- |
| İşlevsel kesinlik | Yüksek | Küçük metin tekrarları |
| Malzeme dürüstlüğü | Sayfanın iş galerisi güçlü | Wizard marka/ustalık bağlamından kopuk |
| Görsel tutarlılık | Yüksek | Çok sayıda eş ağırlıklı sınır ve ikon kutusu |
| İçerik özgüveni | Orta | Sistem dili ve arayüz anlatımı fazla |
| İnce hareket | İyi | Durum geçişleri anlamlı; artırılmamalı |
| Operasyonel güven | Yüksek | Aynı teyit mesajı fazla tekrar ediyor |

### 7.2 Önerilen premium görsel yön

- Açık tema müşteri wizard'ının ana referansı olmalıdır.
- Paper yüzey, bone sayfa zemini ve graphite metin korunmalıdır.
- Bakır yalnız aktif adım, seçili durum ve ana CTA'da kullanılmalıdır.
- Wizard dış kabuğu korunabilir; iç bölümlerde ek kart görünümü azaltılmalıdır.
- Bir adımda en fazla bir güçlü yüzey, bir ana başlık ve bir ana CTA olmalıdır.
- İkonlar yardımcı rol üstlenmeli; her satır için ayrı renkli ikon kutusu zorunlu olmamalıdır.
- Gölge eklenmemeli; premium ayrım spacing, baseline hizası, tipografi ve hairline ile kurulmalıdır.
- Wizard içine logo, metal doku, glow veya dekoratif kaynak animasyonu eklenmemelidir.

### 7.3 Masaüstü genişlik kararı

Wizard'ın `118rem` dış genişliğe sahip olması bilimsel bir zorunluluk değildir; PUX-3 sırasında ana içerik ızgarasıyla hizalama amacıyla alınmış bir tasarım kararıdır. Bu karar korunabilir.

Önerilen model:

- **Dış kabuk:** Ana sayfa ızgarasıyla aynı `118rem` genişlik.
- **İç görev kolon genişliği:** Adım 1 için tam genişlik; adım 2 için kontrollü iki kolon; adım 3 için yaklaşık `72-84rem` merkezli form.
- **Gerekçe:** Sayfa hizasını korurken okuma ve form tarama satırlarını gereksiz uzatmaz.

Bu yaklaşım kullanıcının önceki “wizard neden daha dar?” itirazını geri getirmez; dış yüzey eşit kalır, yalnız görev içeriği ihtiyacına göre ölçülür.

## 8. Metin revizyon matrisi

| Güncel | Önerilen | Gerekçe |
| --- | --- | --- |
| `Adım 1 / 3 · Hizmet` | Görselden kaldır; screen-reader status olarak koru | İlerleme tekrarını azaltır |
| `Önce ihtiyacınızı en iyi anlatan iş türünü seçin.` | `İşinize en yakın başlığı seçin.` | Daha kısa ve doğal |
| `Hangi hizmete yakın?` | `Hangi işe daha yakın?` | Müşteri problem diline yaklaşır |
| `Hizmet seçildi` | Kaldır | Seçili radio yeterli |
| `Devam etmek için bir hizmet seçin` | Kaldır veya yalnız gerektiğinde göster | Disabled CTA ile tekrar |
| `Tarih ve saat seçin` | Korunabilir | Sonuç odaklı ve açık |
| `Önce size uyan günü...` | `Size uyan günü ve saati seçin.` | Daha düşük metin yükü |
| `Seçili hizmet:` | `Hizmet` | Gereksiz sıfatı kaldırır |
| `İletişim bilgilerinizi paylaşın` | `İletişim bilgileri` | Daha sakin panel başlığı |
| `Talebi sistemde kaydet` | Kaldır | Sistem-merkezli dil |
| `aşağıdaki kısa formu tamamlayın` | Kaldır | Arayüzü tarif ediyor |
| `Talebi kaydet` | `Talebi Gönder` | Kontrollü terminoloji ve müşteri sonucu |
| `Talebiniz kaydedildi` | `Talebiniz alındı` | Hizmet tonu, daha doğal kapanış |
| `Ekip teyidi bekleniyor` | `Uygunluk teyidi bekleniyor` | Neyin beklendiğini netleştirir |

## 9. Responsive ve erişilebilirlik bulguları

### 9.1 Dar mobil taşma

Canlı `320x760` ölçümünde:

- Wizard dış genişliği: yaklaşık `281 px`.
- Wizard `clientWidth`: yaklaşık `281 px`.
- Wizard iç `scrollWidth`: yaklaşık `316 px`.
- İç yatay taşma: yaklaşık **`35 px`**.
- Progress düğmeleri yaklaşık `83 + 100 + 85 px`; divider ve gap ile birlikte kullanılabilir iç genişliği aşıyor.
- İletişim özeti ve form alanlarının sağ kenarı görsel olarak kırpılıyor.

Mevcut E2E testi yalnız `document.documentElement` kök taşmasını ve etkileşimli kontrollerin kendi `scrollWidth/clientWidth` farkını kontrol eder. Wizard kapsayıcısının etkileşimsiz iç taşması bu nedenle testten kaçar.

### 9.2 Önerilen teknik kabul testi

Her desteklenen viewport ve her wizard adımında:

```js
const wizard = page.locator("#appointment-calendar");
const overflow = await wizard.evaluate((element) =>
  element.scrollWidth - element.clientWidth
);
expect(overflow).toBeLessThanOrEqual(1);
```

Ek olarak `320x568`, `360x800` ve `390x844` için hizmet, zaman, iletişim, hata ve başarı ekranlarının ayrı screenshot baseline'ları tutulmalıdır. Şu an 320 baseline yalnız sayfanın ilk viewport'unu kapsar; wizard'ın son adımı kapsanmaz.

### 9.3 Odak yönetimi

- Adım değişiminde yeni başlığa programatik odak taşınması ekran okuyucu ve klavye akışı için doğrudur.
- Klavye E2E testi bu davranışı doğrular.
- Programatik başlık odağı görünür bir interaktif kontrol değildir; gerçek kullanıcı testinde adım değişiminin scroll ve başlık konumu ile yeterince anlaşılır olup olmadığı gözlenmelidir.
- Görsel odak halkası buton, link ve form kontrollerinde korunmalıdır; dekoratif olarak zayıflatılmamalıdır.

## 10. PUX-7.5 uygulanabilir iş paketi

### WIZ-01: Dar mobil düzeltme

**Öncelik:** P0  
**Efor:** Küçük-Orta

- 320 px progress satırını yeniden düzenle.
- Wizard ve tüm grid/flex çocuklarında taşmayı gider.
- İletişim özeti ve form alanlarını dar ekran için doğrula.
- Her adım için container overflow testi ekle.

**Kabul:** `320`, `360`, `390` genişliklerinde tüm wizard durumlarında iç ve kök yatay taşma `<=1 px`.

### WIZ-02: İlerleme bilgisini sadeleştirme

**Öncelik:** P1  
**Efor:** Küçük

- Görsel `Adım x / 3` satırını kaldır.
- Screen-reader canlı durumunu görsel olarak gizli tut.
- Adım düğmelerinin tıklanabilir ve disabled davranışını koru.

**Kabul:** Kullanıcı ilerlemeyi üç adımlı göstergeden anlar; erişilebilir adım durumu duyurulur; bilgi iki kez görünmez.

### WIZ-03: Copy compression ve terminoloji

**Öncelik:** P1  
**Efor:** Küçük

- Sistem-merkezli form başlığını kaldır.
- CTA'ları `Talebi Gönder` ve `Talebi Takip Et` sözlüğüne geçir.
- Seçim ve teyit tekrarlarını azalt.
- Başarı metnini hizmet tonuna getir.

**Kabul:** Her adımda başlık + en fazla bir kısa destek metni; aynı teyit bilgisi bir adımda bir kez.

### WIZ-04: Yüzey ve ritim rafinasyonu

**Öncelik:** P1  
**Efor:** Orta

- Eş ağırlıklı border ve ikon kutusu sayısını azalt.
- Aktif/seçili durumu copper ile; diğer yüzeyleri neutral ile göster.
- Adım 2 ve adım 3 iç genişliklerini görev türüne göre ayarla.
- Light theme'i ana referans, dark theme'i erişilebilir alternatif olarak doğrula.

**Kabul:** Bir viewport'ta tek baskın CTA; seçili durum üç saniyelik taramada ayırt edilir; kart-içinde-kart etkisi oluşmaz.

### WIZ-05: Başarı kapanışını sadeleştirme

**Öncelik:** P2  
**Efor:** Küçük-Orta

- Sonraki adım metnini tek cümleye indir.
- Takip eylemini tek birincil CTA yap.
- Fotoğraf ve yeni talep yollarını ikincil/tertiary hiyerarşide tut.

**Kabul:** Kullanıcı beş saniye içinde talebin alındığını ve sırada ne olduğunu doğru söyler.

### WIZ-06: PUX-8 ölçüm hazırlığı

**Öncelik:** P1  
**Efor:** Küçük

- Wizard varyantını test protokolüne ekle.
- İlk kategori süresi, toplam tamamlama, geri dönüş, hata ve terk olaylarını mevcut analytics sözlüğüyle eşleştir.
- Premium semantic differential sorularını ekle: `özenli`, `güvenilir`, `ustalıklı`, `yapay`, `kalabalık`.

**Kabul:** PUX-8 katılımcıları aynı senaryoyu eski/yeni metin veya prototipte karşılaştırabilir.

## 11. PUX-8 kullanıcı testi önerisi

### 11.1 Katılımcılar

- 5 mobil öncelikli bireysel müşteri.
- 2 apartman/site yöneticisi.
- 1 dijital güveni düşük veya 50+ kullanıcı.
- En az 2 kişi işin hangi kategoriye girdiğinden emin olmamalı.

### 11.2 Görevler

1. Salon duvarındaki kabarma için yarın öğleden sonra talep bırakın.
2. Metal kapının kaynak mı motor mu olduğunu bilmiyorsunuz; uygun yardım yolunu bulun.
3. Yanlış hizmet seçin, geri dönün ve doğru hizmete geçin.
4. Randevunun kesinleşip kesinleşmediğini açıklayın.
5. Talep sonrası değişiklik veya takip yolunu gösterin.

### 11.3 Başarı metrikleri

| Metrik | Hedef |
| --- | ---: |
| Kritik görev başarısı | `>= %90` |
| İlk kategori seçimi P75 | `< 20 sn` |
| Toplam talep tamamlama medyanı | `< 2 dk` |
| Yanlış hizmet seçimi | `<= %10` hipotezi |
| SEQ kolaylık medyanı | `>= 5.5 / 7` |
| NASA-TLX Mental Demand medyanı | `<= 35 / 100` başlangıç hedefi |
| “Ne olacak?” doğru beklenti | `>= %90` |
| Premium `özenli/güvenilir/ustalıklı` | Baseline'dan yüksek |
| Negatif `yapay/kalabalık` | Baseline'dan düşük |

### 11.4 Gözlem soruları

- Kullanıcı `Adım x / 3` satırı olmadan nerede olduğunu anlıyor mu?
- `Birlikte belirleyelim` bir hizmet mi, yardım yolu mu olarak algılanıyor?
- `Talebi Gönder` ifadesi randevunun kesinleştiği izlenimini yaratıyor mu?
- İletişim ekranındaki özet karar güvenini artırıyor mu, yoksa tekrar mı geliyor?
- Kullanıcı başarı ekranında önce hangi eyleme bakıyor?
- Premium algıyı renk mi, içerik kısalığı mı, iş kanıtı mı yükseltiyor?

## 12. Korunması gerekenler

Rafinasyon sırasında aşağıdaki güçlü özellikler kaybedilmemelidir:

- Üç adımlı wizard modeli.
- Dört ana hizmet kategorisi ve kademeli alt hizmetler.
- Varsayılan hizmet/tarih/saat seçilmemesi.
- `Birlikte belirleyelim` yardım yolu.
- Bugün/Yarın ve tam takvim disclosure modeli.
- Ad ve telefon dışında zorunlu alan bulunmaması.
- Adım göstergesi üzerinden geri dönüş.
- Erişilebilir radio/button semantiği.
- Klavye, reduced motion, forced colors ve virtual keyboard desteği.
- Takip kodu ve self-servis yönetim bağlantısı.
- Gerçek iş örneklerinin wizard sonrasında yer alması.

## 13. Son karar

Wizard'ın temel ürün ve yazılım mimarisi değiştirilmemelidir. Sorun “yanlış akış” değil, doğru akışın henüz yeterince edit edilmemiş olmasıdır.

PUX-8 öncesinde şu sıra izlenmelidir:

1. `WIZ-01` ile 320 px taşmayı düzelt ve test açığını kapat.
2. `WIZ-02` ve `WIZ-03` ile tekrarları ve sistem dilini azalt.
3. `WIZ-04` ile yüzey/spacing hiyerarşisini Quiet Craft yönüne taşı.
4. `WIZ-05` ile başarı kapanışını sadeleştir.
5. `WIZ-06` ile PUX-8 ölçümünü hazırla.

Bu paket tamamlandığında hedef, daha “gösterişli” bir wizard değil; daha az konuşan, daha kesin davranan ve işçilik kalitesini arayüz disiplininde hissettiren bir randevu deneyimidir.

## 14. Kanıt dosyaları

- `e2e/pux-baseline.spec.js-snapshots/pux-wizard-service-win32.png`
- `e2e/pux-baseline.spec.js-snapshots/pux-wizard-time-win32.png`
- `e2e/pux-baseline.spec.js-snapshots/pux-wizard-contact-win32.png`
- `e2e/pux-baseline.spec.js-snapshots/pux-wizard-success-win32.png`
- `e2e/pux7-hardening.spec.js`
- `src/features/booking/components/ServiceSelection.jsx`
- `src/features/booking/components/BookingCalendar.jsx`
- `src/features/booking/components/BookingForm.jsx`
- `src/features/booking/components/BookingSuccess.jsx`
- `src/features/booking/components/booking.styles.js`
- `src/pages/CustomerBooking.jsx`

