# Umut Usta Bilişsel Yük Odaklı UX/UI Araştırma Raporu

**Proje:** `the-welding-expert-app`  
**Tarih:** 19 Temmuz 2026  
**Sürüm:** 3.0 - premium deneyim ve yeniden tasarım denetimi  
**Kapsam:** Yalnız müşteri giriş sayfası, randevu talebi ve hızlı iletişim yolları  
**Kapsam dışı:** Admin dashboard yeniden tasarımı, canlı yayın, Git push ve production değişiklikleri

**Eşlik eden tasarım benchmark'ı:** [Umut Usta Premium Tasarım Dili Benchmark Raporu](./Umut_Usta_Premium_Tasarim_Dili_Benchmark_Raporu_2026-07-19.md)

## 1. Yönetici özeti

Mevcut müşteri sayfası işlevsel, güvenli ve içerik bakımından güçlüdür; ancak aynı anda çok fazla amaca hizmet etmeye çalışmaktadır. İlk ekranda randevu, WhatsApp, telefon, adres ve iş örnekleri; sayfanın devamında işletme tanıtımı, sekiz hizmet, süreç, galeri, randevu aracı, lokasyon ve SSS benzer görsel ağırlıklarla yarışmaktadır. Müşterinin temel işi olan “ihtiyacımı belirtip uygun zaman talebi bırakmak” sayfa içinde geç görünür hale gelmektedir.

En kritik bilişsel yük kaynakları:

1. Hero alanında üç eşdeğer buton ve iki ek bağlantı bulunması.
2. Mobil sticky alanda üç sürekli aksiyonun içeriği kapatması.
3. Randevu aracında sekiz hizmetin aynı anda gösterilmesi.
4. İlk hizmetin kullanıcı kararı olmadan seçili gelmesi.
5. Pazarlama içeriklerinin görev akışından önce gelmesi.
6. Aynı “randevu kesin değildir” açıklamasının farklı yüzeylerde tekrar etmesi.
7. Tarih adımında hızlı tarihler, tarih input'u, hafta kontrolleri, yedi gün kartı ve saat seçeneklerinin aynı anda görünmesi.

Önerilen yön tam sayfa bir görsel yeniden tasarım değildir. Mevcut marka, güven, içerik ve teknik altyapı korunmalı; **bilgi mimarisi ve seçim mimarisi görev önceliğine göre yeniden düzenlenmelidir.** Hedef deneyim:

- İlk ekranda birincil görev: **Talep oluştur**.
- Alternatif görev: **Fotoğrafla danış**.
- Telefon, adres, galeri ve ayrıntılar yardımcı katmanda.
- Hizmet seçimi önce dört anlaşılır ihtiyaç grubu, sonra ilgili 1-3 hizmet.
- Varsayılan seçim yok; kullanıcı kararı açıkça alınır.
- Her randevu adımında tek bir birincil ilerleme eylemi.
- Trust, süreç, hizmet kataloğu ve SSS ihtiyaç halinde taranabilir ama görevle yarışmaz.

### Güncel uygulama durumu

Bu rapordaki "mevcut durum" bulgularının bir bölümü ilk baseline denetimini anlatır. CUX-1 sonrasında yerel kodda aşağıdaki ilerleme sağlanmıştır:

| Konu | Baseline | Yerel güncel durum | Sonraki doğrulama |
| --- | --- | --- | --- |
| Hero aksiyonları | Üç eşdeğer buton | Talep Oluştur + Fotoğrafla Danış; telefon utility | 5 saniye ve görev testi |
| Mobil sticky | Üç eylem, içerik kapatma riski | İki eylem; wizard görünürken gizleniyor | Gerçek cihaz focus/occlusion |
| Hizmet seçimi | Sekiz hizmet birlikte | Dört grup -> ilgili 1-3 hizmet | Grup geri dönüş oranı |
| Varsayılan hizmet | İlk hizmet seçili | Varsayılan seçim yok | Yanlış hizmet oranı |
| İlk hizmet ekranı yüksekliği | 1367 px görsel baseline | 797 px yerel görsel baseline | Görev başarısı ve scroll davranışı |
| Zaman seçimi | Çoklu kontrol aynı anda | Hızlı tarihler önce; tam takvim disclosure içinde | Gerçek görev süresi |
| İletişim formu | Ek alanlar görünür | Ad/telefon ana; ek bilgiler disclosure içinde | Form terk ve hata oranı |
| Sayfa sırası | Pazarlama içeriği wizard'dan önce | Hero -> trust -> wizard task-first sırası uygulandı | Scroll ve wizard başlangıcı |

797 px sonucu yalnız arayüz yoğunluğunu gösterir; daha iyi dönüşüm veya daha düşük algılanan yük kanıtı değildir.

### Sürüm 3 yeniden denetim sonucu

CUX sprintleri sonrasında görev akışının yapısal bilişsel yükü belirgin biçimde düşürülmüştür. Yeni sorun artık "kullanıcı randevu aracını bulamıyor" değildir. Güncel yerel sayfada ana sorun, aynı doğru bilgilerin ve aksiyonların birden fazla yüzeyde yeniden sunulması ile marka görsel sisteminin premium zanaat vaadini yeterince taşımamasıdır.

19 Temmuz 2026 tarihli 390x844 ve 1440x900 görsel denetiminde şu bulgular doğrulandı:

1. Mobil ilk görünümde hero içindeki `Talep Oluştur` ve `Fotoğrafla Danış` aksiyonları aynı iki aksiyonlu sticky bar ile eşzamanlı görünür; kullanıcı dört buton görür ama yalnız iki farklı karar vardır.
2. Marka navigasyonda, hero içindeki ayrı marka bloğunda ve logo karesinde tekrar eder. Tekrar güveni artırmaktan çok ilk ekranın üst bölümünü kalabalıklaştırır.
3. Hero trust listesi, hero konum rozeti ve hemen altındaki dört parçalı trust bar aynı konum, saat, kanal ve teyit mesajlarını farklı biçimlerde yineler.
4. Görsel master logo ile kullanılan SVG işaret aynı kalite ve karakterde değildir. PNG master dövme metal formu taşırken küçük SVG daha jenerik, kalın bir U ve turuncu noktalar olarak görünür.
5. Bakır ana aksiyon, güçlü WhatsApp yeşili, açık mavi tema anahtarı, pembe-bakır konum rozeti ve fotoğraf üstündeki sıcak overlay aynı viewport içinde ayrı vurgu merkezleri oluşturur.
6. `Ekip teyidi`, `uygunluk` ve `randevunun kesinleşmesi` açıklaması hero, takvim, süreç, hizmet alanı, başarı ve footer bağlamlarında tekrar eder.
7. Hizmet kataloğu mobilde yatay taşan büyük kartlar, uzun açıklamalar, fiyat vurguları ve disclosure kontrolleriyle görev sonrasında dahi yüksek tarama maliyeti üretir.

Bu nedenle v3 önerisi, yeni özellik eklemek değil; **tekrarları kaldırmak, marka sinyalini tekleştirmek, zanaat kanıtını güçlendirmek ve bir viewport içindeki vurgu sayısını azaltmaktır.**

## 2. Araştırma yöntemi

Araştırma beş kanıt katmanına dayanmaktadır:

1. Mevcut React müşteri akışının kod ve görsel regresyon çıktılarının incelenmesi.
2. Önceki kapsamlı değerlendirme, copy audit, Plerdy raporu ve Sprint 0-6 çıktıları.
3. Plerdy `/check/` hub içindeki Local Service, Usability, Conversion, Content ve Core Web Vitals listeleri.
4. Bilişsel psikoloji ve HCI araştırmaları: çalışma belleği, Hick-Hyman, progressive disclosure ve choice overload.
5. WCAG 2.2 ve görev odaklı veri görselleştirme ilkeleri.

### Kanıt hiyerarşisi

Plerdy'nin predictive heatmap, attention budget, scan pattern ve scroll-depth özellikleri hipotez üretmek için kullanışlıdır; gerçek kullanıcı davranışı değildir. Plerdy de bu çıktıları gerçek analytics yerine “fast first pass” olarak tanımlar. Bu nedenle karar sırası şöyledir:

1. Gerçek talep ve funnel verisi.
2. Moderated görev testi ve gözlem.
3. E2E, erişilebilirlik ve performans ölçümü.
4. Predictive heatmap ve uzman kontrol listesi.
5. Estetik tercih.

## 3. Kullanıcılar ve Jobs to Be Done

### Canan, 32 - hızlı mobil kullanıcı

**Durum:** Google veya sosyal medya üzerinden telefondan gelir.  
**İşi:** “Sorunuma uygun hizmeti hızlıca belirtip bana uyan zamanı bırakmak istiyorum.”  
**Başarı:** İlk anlamlı seçim en fazla 10 saniye içinde; talep 2 dakika içinde tamamlanır.  
**Risk:** Büyük sayfa, çok seçenek, tekrar eden açıklamalar ve geç görünen form.

### Mehmet, 58 - güven ve telefon odaklı kullanıcı

**Durum:** Ustanın gerçek ve ulaşılabilir olduğunu doğrulamak ister.  
**İşi:** “Doğru kişiye ulaştığımı görüp gerekirse telefonla konuşmak istiyorum.”  
**Başarı:** Ankara, telefon, çalışma saati ve gerçek iş kanıtı kolay bulunur.  
**Risk:** Küçük metin, yalnız ikonla anlatım, üç eşdeğer kanal ve belirsiz terminoloji.

### Selin, 44 - kapsam ve teklif odaklı karar verici

**Durum:** Apartman veya iş yeri için kapsamı paylaşılabilir biçimde anlatmak ister.  
**İşi:** “İş türünü ve beklentimi doğru iletip keşif/teklif sürecini başlatmak istiyorum.”  
**Başarı:** “Yerinde keşif ve teklif” yolu kolay bulunur; ayrıntı notu kaybolmaz.  
**Risk:** Hizmet adlarının teknik olması ve geniş kapsamın tek listede sunulması.

## 4. Mevcut görev yolculuğu

### İlk ekran

Mevcut hero güçlü bir değer önerisi sunar; fakat beş ayrı hedef üretir:

- Randevu Al
- Fotoğraf Gönder
- Ara
- Adresi gör
- İş örnekleri

Bu seçeneklerin hepsi yararlı olsa da aynı anda ve benzer ağırlıkla gösterildiğinde kullanıcının “önce ne yapmalıyım?” sorusunu artırır. Plerdy attention-budget yaklaşımına göre dekoratif görsel, yardımcı bağlantılar veya kanal seçenekleri ana CTA'dan daha fazla dikkat almamalıdır.

### Sayfa sırası

Masaüstünde randevu aracı; hero, trust, hakkımızda, hizmetler, süreç ve galeri sonrasında gelir. Mobil CSS randevuyu süreçten önce taşısa da hâlâ hakkımızda ve hizmet kataloğundan sonradır. Bu yapı tanıtım okumak isteyen kullanıcı için iyidir; görev tamamlamak isteyen kullanıcı için uzundur.

### Hizmet seçimi

Sekiz hizmet kartı tek radiogroup içinde sunulur ve ilk hizmet varsayılan seçilidir. Görsel regresyon çıktısında mobil sticky bar alt kartları ve ilerleme alanını kısmen kapatmaktadır. Kullanıcı kendi ihtiyacını işaretlemeden “Zaman tercihini seç” eylemi aktiftir; bu yanlış hizmetle ilerlemeyi kolaylaştırır.

### Zaman seçimi

Aynı yüzeyde şunlar bulunur:

- Zaman tercihinin kesin randevu olmadığı açıklaması.
- Seçili hizmet ve değiştirme eylemi.
- Tarih input'u.
- Önceki/sonraki hafta.
- Bugün, yarın, ilk uygun gün kısa yolları.
- Yedi günlük durum kartları.
- Saat aralıkları.

Bu araçlar tek tek anlamlıdır; fakat aynı anda görünmeleri özellikle mobilde görsel arama maliyetini artırır.

## 5. Bilimsel tasarım temeli

### 5.1 Çalışma belleği

Cowan'ın çalışma belleği değerlendirmesi, dikkat odağının tipik olarak yaklaşık dört ayrı öğeyle sınırlı olduğunu savunur. Bu “arayüzde her zaman en fazla dört öğe olmalı” demek değildir; aynı anda zihinde karşılaştırılması gereken seçeneklerin gruplanması gerektiğini gösterir.

**Umut Usta kararı:** Sekiz hizmeti silmek yerine dört ihtiyaç grubuna böl; seçilen grubun altındaki 1-3 hizmeti ikinci katmanda göster.

### 5.2 Hick-Hyman ve karar süresi

Hick ve Hyman'ın deneyleri, uyaran belirsizliği arttıkça seçim tepkisinin uzadığını göstermiştir. Bu ilişki mekanik olarak “daha az buton her zaman daha iyidir” biçiminde uygulanmamalıdır; seçeneklerin tanıdıklığı, olasılığı ve gruplanması önemlidir.

**Umut Usta kararı:** Kullanıcının aşina olduğu problem dilini kullan: “Boya ve küçük tadilat”, “Kaynak ve metal”, “Kapı ve otomasyon”, “Bahçe veya keşif”. Teknik hizmet adı ikinci seçimde gösterilir.

### 5.3 Choice overload için önemli düzeltme

Scheibehenne, Greifeneder ve Todd'un 50 deney/5.036 katılımcıyı kapsayan meta-analizi choice-overload ortalama etkisini yaklaşık sıfır, koşullara göre değişimi ise yüksek bulmuştur. Bu nedenle hizmet sayısını kanıtsız biçimde azaltmak bilimsel değildir.

**Umut Usta kararı:** Ürün kapsamı korunur; karşılaştırma maliyeti progressive disclosure ve gruplamayla düşürülür. Sonuç gerçek funnel ve görev testiyle doğrulanır.

### 5.4 Progressive disclosure

Progressive disclosure araştırmaları, ayrıntının ne zaman gösterildiğinin kullanıcı amacıyla uyumlu olması gerektiğini; gereksiz artımlı geri bildirimin de dikkat dağıtabileceğini gösterir.

**Umut Usta kararı:**

- Fiyatı etkileyen ayrıntılar hizmet kataloğunda “Ayrıntıyı gör” katmanında.
- Randevu adımında yalnız karar için gerekli problem cümlesi ve fiyat mantığı.
- Süreç açıklaması bir kez, ilgili adımın yanında.
- Güven kanıtı CTA yakınında kısa; ayrıntılı kanıt aşağı bölümde.

### 5.5 Erişilebilirlik bilişsel erişilebilirliğin parçasıdır

WCAG 2.2; focus görünürlüğü, focus'un sticky yüzeylerce kapatılmaması, minimum target size, tutarlı yardım ve tekrarlı girişin azaltılmasını güçlendirir.

**Umut Usta kararı:** Minimum 44 px pratik dokunma hedefi, görünür metin etiketi, klavye sırası, `aria-live` adım sonucu ve sticky barın form alanlarını kapatmaması kabul kriteridir.

## 6. Plerdy bulgularının siteye uyarlanması

Plerdy `/check/` tek bir otomatik skor değil, 15 uzman listesinin hub'ıdır. Umut Usta için beş liste doğrudan kullanılmıştır.

| Plerdy ilkesi | Mevcut durum | Hedef karar |
| --- | --- | --- |
| İlk ekran ne/nerede/neden sorularını yanıtlar | Güçlü ama aksiyon kalabalık | Mesaj korunur, 1 ana + 1 alternatif yol |
| Ana CTA fold üstünde | Var | Tek baskın CTA |
| Trust CTA yakınında | Kısmen var | 2-3 doğrulanabilir kısa kanıt |
| Form kısa olmalı | Güçlü | Ad/telefon zorunlu; diğerleri isteğe bağlı |
| Takvim kolay olmalı | İşlevsel ama yoğun | Hızlı tarihler önce, tam takvim isteğe bağlı |
| Fast contact yolları | Üç kanal var | Göreve göre iki yol; telefon utility olarak korunur |
| Sticky CTA içerik kapatmamalı | Mobilde riskli | İki eylem, daha düşük yükseklik, focus-safe boşluk |
| Gerçek fotoğraf ve vaka | Galeri var | İlk ekranda değil; karar sonrası güven katmanı |
| Heatmap CTA görünürlüğünü doğrular | Tahmini/gerçek veri ayrımı gerekli | Hipotez + gerçek event funnel |
| Lead kalitesi kaydedilir | Sprint 6'da hazır | Yeni varyantın nitelikli oranı izlenir |

## 7. Hedef bilgi mimarisi

### Önerilen müşteri sayfası sırası

1. Sade müşteri navigasyonu.
2. Hero: hizmet/lokasyon + tek ana görev + fotoğraf alternatifi.
3. Kısa doğrulanabilir güven şeridi.
4. Randevu talebi aracı.
5. Gerçek iş örnekleri.
6. Hizmet kataloğu, salt bilgi ve progressive detail.
7. Nasıl çalışır.
8. Lokasyon ve iletişim.
9. SSS.
10. İşletme/yasal footer.

“Biz kimiz” içeriği bağımsız uzun bir blok yerine trust ve gerçek iş kanıtları içine dağıtılmalıdır. Kullanıcı önce görevini yapabilmeli, sonra ihtiyaç duyarsa kanıtı derinleştirmelidir.

## 8. Hedef seçim mimarisi

### Hizmet adımı

**Katman 1 - İhtiyaç grubu:**

1. Boya ve küçük tadilat
2. Kaynak ve metal işleri
3. Kapı ve otomasyon
4. Bahçe veya yerinde keşif

**Katman 2 - İlgili hizmet:** Seçilen gruba ait 1-3 seçenek.

Kurallar:

- Varsayılan seçili hizmet yok.
- Grup seçimi geri alınabilir.
- Hizmet seçilmeden ilerleme butonu pasif ve nedeni metinle anlaşılır.
- Seçim sonrası tek bir özet ve tek ilerleme butonu görünür.
- “Emin değilim / yerinde keşif” her zaman kaçış yolu sağlar.

### Zaman adımı

Önerilen görünüm sırası:

1. Seçili hizmet özeti.
2. Bugün / yarın / ilk uygun gün.
3. Seçilen günün saatleri.
4. “Başka tarih seç” ile tam hafta görünümü.

Bu yapı hızlı görevi öne alır, ayrıntılı tarih kontrolünü kaldırmaz.

### İletişim adımı

- Ad soyad ve telefon ilk görünür grup.
- E-posta ve ayrıntılı not “Ek bilgi” altında.
- Gizlilik kısa metni gönderim yakınında.
- Tek birincil buton: “Talebi gönder”.
- WhatsApp bu adımda rakip submit butonu değil, form başarısızlığı/alternatif iletişim yoludur.

## 9. Buton ve aksiyon bütçesi

| Yüzey | Mevcut | Hedef |
| --- | ---: | ---: |
| Hero baskın buton | 3 | 1 |
| Hero alternatif yol | 2 ek link | 1 ikincil link/button |
| Mobil sticky | 3 | 2 |
| Hizmet ilk görünüm | 8 radio + 1 devam | 4 grup |
| Hizmet ikinci görünüm | Yok | 1-3 radio + 1 devam |
| Randevu adımı birincil eylem | Değişken | Her adımda 1 |

Telefon kaldırılmaz; nav/contact utility eylemi olarak görünür kalır. Ama hero içinde randevu ve fotoğraf yoluyla aynı görsel ağırlıkta yarışmaz.

## 10. Görsel sistem kararı

Marka dili korunmalıdır: forged iron, graphite, sıcak nötrler ve kontrollü bakır vurgu. Premium his daha fazla gölge ve animasyonla değil şu özelliklerle güçlenir:

- Daha az eşzamanlı vurgu rengi.
- Bir ekranda tek baskın dolu buton.
- Seçili durumda yalnız border + hafif yüzey + check.
- Daha geniş içerik nefesi, daha kısa metin blokları.
- Kart yerine liste/radio satırı; kart yalnız gerçek tekrarlı içerikte.
- Motion yalnız durum değişimini açıklar; 160-240 ms, reduced-motion desteği.
- Loading sırasında seçimin yeri değişmez.

## 11. Data Visualization ve ölçüm yaklaşımı

Müşteri sayfasına analitik grafik eklenmeyecektir. Data visualization teknikleri iki yerde kullanılacaktır:

1. **İlerleme görselleştirmesi:** Üç adımlı lineer süreçte konum, tamamlanan adım ve sıradaki karar açıkça gösterilir.
2. **PO değerlendirmesi:** Yeni tasarımın etkisi dashboard verileriyle okunur.

Munzner'ın nested modeline göre önce görev ve veri, sonra görsel encoding seçilmelidir. Bu nedenle dashboard soruları şunlardır:

- Kullanıcı hangi ihtiyaç grubunda başlıyor?
- Grup seçip hizmet seçemeden çıkan oran nedir?
- Hizmet -> zaman -> iletişim geçiş oranı nedir?
- Tamamlama süresi ve hata sayısı nedir?
- Kanal ve hizmet bazında nitelikli talep oranı değişti mi?

Önerilen grafikler:

- Funnel: mutlak sayı + adım dönüşüm yüzdesi.
- Grup karşılaştırması: sıralı yatay bar; ortak sıfır ekseni.
- Tamamlama süresi: medyan ve P75; ortalama tek başına kullanılmaz.
- Hata nedenleri: sıralı yatay bar.
- Gün/saat: yalnız yeterli örneklem varsa heatmap.
- Durum renkleri metin ve ikonla desteklenir; renk tek taşıyıcı değildir.

## 12. Design Thinking uygulaması

### Empathize

Canan, Mehmet ve Selin görevleriyle 5-8 kullanıcı testi. Kullanıcıdan “siteyi değerlendir” değil, gerçek görev istenir.

### Define

Problem ifadesi: “Ankara'da hizmet arayan müşteri, kapsamı kaybetmeden ilk doğru seçimi hızlıca yapmalı ve seçiminin kesin randevu olmadığını anlayarak talep bırakabilmelidir.”

### Ideate

En az üç alternatif:

1. Randevu-first tek sayfa.
2. Hero içinde iki görev yolu.
3. Hizmete özel landing + ortak randevu aracı.

### Prototype

Önce kod içinde düşük riskli dikey dilim: hero aksiyon bütçesi + grouped service selection + no-default seçim.

### Test

Görev metrikleri:

- İlk anlamlı seçim süresi.
- Görev tamamlama oranı.
- Geri dönüş ve yanlış seçim sayısı.
- Single Ease Question (SEQ).
- Kısa NASA-TLX mental demand maddesi.
- Nitelikli talep oranı.

## 13. Başarı kriterleri

| Metrik | Başlangıç | Hedef |
| --- | --- | --- |
| Hero baskın aksiyon | 3 | 1 |
| Mobil sticky aksiyon | 3 | 2 |
| İlk hizmet seçiminde görünen seçenek | 8 | 4 grup |
| Varsayılan hizmet | Var | Yok |
| İlk anlamlı seçim | Ölçülmüyor | P75 < 20 sn |
| Wizard tamamlama | Mevcut funnel | +%15 göreli iyileşme hipotezi |
| Validation error / submit | Mevcut event | -%20 göreli azalma hipotezi |
| Accessibility | Lighthouse hedefi geçti | >= 98 korunur |
| Mobil performance | 80 | >= 90 ayrı kalite kapısı |

Yüzde hedefleri vaat değil, test edilecek hipotezdir.

## 14. Önceliklendirme

### P0

- Varsayılan hizmet seçimini kaldır.
- Hizmetleri dört ihtiyaç grubuna ayır.
- Hero ve sticky aksiyon hiyerarşisini sadeleştir.
- Randevu aracını içerik hiyerarşisinde öne taşı.
- E2E ve accessibility regresyonunu güncelle.

### P1

- Zaman adımını hızlı tarihler -> saatler -> tam takvim düzenine geçir.
- İletişim formunda ek alanları progressive disclosure yap.
- Hizmet kataloğunu daha taranabilir bilgi listesine dönüştür.
- Güven kanıtlarını CTA yakınına taşı.

### P2

- Hizmete özel landing page'ler.
- Gerçek kullanıcı heatmap/session replay verisi.
- Kontrollü A/B test ve PO dashboard karşılaştırması.

## 15. Bilişsel yükün operasyonel tanımı

### 15.1 Bu ürün için düşük bilişsel yük ne demektir?

Bilişsel yük için her web sitesinde geçerli tek bir sayı veya kabul edilmiş bir "buton sınırı" yoktur. Umut Usta için düşük yük, estetik bir kanaat değil üç kanıt katmanının birlikte sağlanmasıdır:

1. **Yapısal yük:** Aynı anda anlamlandırılan karar, eylem ve mesaj sayısı.
2. **Davranışsal yük:** Görev süresi, hata, geri dönüş, terk ve yardım ihtiyacı.
3. **Algılanan yük:** Görev sonrasında bildirilen zihinsel talep, çaba ve kolaylık.

Ekran sade göründüğü halde kullanıcı doğru hizmeti bulamıyorsa yük azaltılmamış, yalnızca gizlenmiştir.

### 15.2 Yük türleri ve ürün karşılıkları

| Yük türü | Umut Usta örneği | Tasarım yaklaşımı |
| --- | --- | --- |
| İçsel yük | Müşteri işinin hangi hizmete ait olduğunu bilmeyebilir | Problem dili, "emin değilim" yolu, kısa örnekler |
| Dışsal yük | Sekiz hizmet, üç kanal ve tekrar eden uyarıları karşılaştırmak | Gruplama, tek karar, progressive disclosure |
| Yararlı işlem | Boya ile tadilat kapsamını ayırmak | Kısa açıklama ve fiyatı etkileyenler |

Hedef içsel karmaşıklığı inkâr etmek değil, **arayüzden doğan dışsal yükü azaltıp gerekli kararı görünür ve geri alınabilir yapmaktır.**

### 15.3 Umut Usta bilişsel yük bütçesi

Aşağıdaki değerler evrensel bilimsel eşikler değildir; araştırmadan türetilmiş, kullanıcı testiyle doğrulanacak yerel ürün standartlarıdır.

| Boyut | Yerel bütçe | Denetim | Başarısızlık işareti |
| --- | ---: | --- | --- |
| Bir görünümde baskın görev | 1 | Görsel QA | İki dolu ana buton aynı ağırlıkta |
| Bir görünümde iletişim yolu | En fazla 2 | DOM/görsel QA | Randevu, telefon ve WhatsApp eşdeğer |
| Aynı anda karşılaştırılan seçim | Hedef 2-4, üst sınır 5 | Bileşen testi | Sekiz hizmet tek listede |
| Wizard adımı | 3 ana adım | E2E | Gereksiz ara onaylar |
| Bir adımın ana kararı | 1 | Görev analizi | Tarih, kanal ve iletişim birlikte soruluyor |
| Zorunlu iletişim alanı | 2 | Form şeması | Başlangıçta e-posta/adres zorunlu |
| Bir uyarıdaki ana mesaj | 1 | Copy audit | Tek kutuda farklı üç uyarı |
| Ana dokunma hedefi | Tercihen >=44x44 CSS px | Playwright ölçümü | Yanlış dokunma veya 24 px altı hedef |
| Normal metin kontrastı | >=4.5:1 | Kontrast testi | Açık gri gövde metni |
| UI/focus kontrastı | >=3:1 | Otomatik + manuel QA | Düşük kontrastlı ince focus |
| Motion | 140-240 ms; büyük geçiş <=320 ms | Token denetimi | Görevi bekleten dekoratif hareket |
| İlk anlamlı seçim | P75 <20 saniye | Görev testi | Grup kararsızlığı |
| Talep tamamlama | Medyan <2 dakika | Event süresi | Uzun bekleme/terk |
| Yanlış hizmet seçimi | <=%10 hipotezi | Moderated test | Açıklama sonrası seçim düzeltme |
| Kritik görev başarısı | >=%90 | Görev testi | Yardımsız bitirememe |
| SEQ kolaylık | Medyan >=5.5/7 | Görev sonrası soru | Medyan <5 |
| NASA-TLX Mental Demand | Medyan <=35/100, P75 <=50 | Kısa ölçek | Yüksek talep kümelenmesi |

NASA-TLX hedefi klinik veya evrensel eşik değildir. Önce baseline alınır; yeni tasarım görev başarısı korunurken önceki sürümden daha düşük zihinsel talep üretmelidir.

### 15.4 Ekran bazlı dikkat bütçesi

| Yüzey | Kullanıcının tek sorusu | Başlangıçta görünür | Başlangıçta gizli |
| --- | --- | --- | --- |
| Hero | Bu işletme işimi yapıyor mu, nasıl başlarım? | Hizmet, Ankara, değer, iki yol, güven | Uzun hikâye ve tüm hizmetler |
| Hizmet grubu | İhtiyacım hangi gruba yakın? | Dört problem grubu | Teknik ayrıntı/fiyat faktörleri |
| Hizmet seçimi | Hangi hizmet işime yakın? | İlgili 1-3 hizmet, tek devam | Diğer gruplar ve galeri |
| Zaman | Ne zaman uygunum? | Hızlı gün, seçilen günün saatleri | Tam takvim ihtiyaç duyulana kadar |
| İletişim | Ekip bana nasıl ulaşacak? | Ad, telefon, kısa gizlilik, gönder | E-posta ve not disclosure altında |
| Başarı | Şimdi ne olacak? | Durum, dönüş beklentisi, takip | Rakip CTA ve pazarlama içeriği |

## 16. Ayrıntılı kullanıcı ve bağlam modeli

Personalar araştırma hipotezidir; gerçek yaş, cihaz ve yetkinlik dağılımı analytics ve müşteri araştırmasıyla doğrulanmalıdır.

| Segment | Ana ihtiyaç | Bilişsel risk | Ürün yanıtı |
| --- | --- | --- | --- |
| Hızlı mobil bireysel müşteri | Hızlı talep veya fotoğraf | Uzun scroll ve kanal kararsızlığı | İki başlangıç yolu, kısa wizard |
| Güven odaklı yetişkin | Gerçek işletme ve erişilebilir kişi | Küçük yazı, yalnız ikon, teknik terim | Açık telefon, adres/saat, gerçek fotoğraf |
| Apartman/iş yeri karar vericisi | Keşif, kapsam, teklif | Yanlış hizmet ve not kaybı | Yerinde keşif, not ve takip |
| Acil sorun yaşayan kullanıcı | Hızlı iletişim ve net beklenti | Metin okumama, zamanı kesin sanma | Kısa kanal seçimi, açık teyit mesajı |
| Düşük dijital yetkinlik | Adım adım yönlendirme | Yeni kontroller ve çoklu seçenek | Standart kontrol, tek karar, geri dönüş |
| Erişilebilirlik ihtiyacı | Bağımsız görev tamamlama | Focus, renk bağımlılığı, occlusion | Semantik HTML, metin+ikon, focus-safe sticky |

### 16.1 Kullanıcının karar hiyerarşisi

1. Bu işletme benim sorun türümle ilgileniyor mu?
2. Benim konumuma hizmet veriyor mu?
3. Güvenilir ve ulaşılabilir mi?
4. Fiyatın nasıl belirlendiğini kabaca anlayabiliyor muyum?
5. Bana uygun zaman var mı?
6. Talep bırakırsam sonra ne olacak?

Arayüz bu sırayı tersine çevirip önce kişisel bilgi veya teknik hizmet adı isterse dışsal yük artar.

## 17. Uçtan uca kullanıcı senaryoları

| # | Senaryo ve ideal yol | Ana yük riski | Uygulanabilir kabul kriteri |
| ---: | --- | --- | --- |
| 1 | **Boya ihtiyacı:** Hero -> Talep -> Boya grubu -> hizmet -> zaman -> ad/telefon | Katalog okumak, sticky occlusion | İlk seçim <20 sn; toplam <2 dk; hizmetsiz devam yok |
| 2 | **Türden emin değil:** Hero -> Fotoğrafla Danış -> WhatsApp fotoğrafı | Teknik hizmet tahmini | Görünür metin etiketi; tarafsız hazır mesaj |
| 3 | **Telefon/güven:** Trust -> Telefonla ara veya iletişim | Telefonun gizlenmesi, küçük metin | Telefon en fazla 2 etkileşimde; adres/saat tutarlı |
| 4 | **Apartman keşfi:** Talep -> Yerinde keşif -> zaman -> ek not | Tek hizmete sıkışma, not kaybı | Keşif yolu görünür; not korunur; fiyat kesin sanılmaz |
| 5 | **Slot doldu:** Form sonrası zaman adımına kontrollü dönüş | Form kaybı ve yön kaybı | Ad/telefon korunur; alternatif saat; focus doğru yerde |
| 6 | **Müsaitlik servisi yok:** Kapalı takvim -> yeniden dene/WhatsApp | Boş ekran veya sonsuz spinner | Skeleton sabit; doğrulanmamış saat seçilemez |
| 7 | **Form hatası:** Eksik telefon -> alan içi düzeltme | Yalnız kırmızı border, belirsiz hata | `aria-invalid`, bağlı hata metni, değerler korunur |
| 8 | **İptal/değişiklik:** Takip -> işlem -> neden -> ekip teyidi | Otomatik iptal sanılması | İşlemin talep olduğu açık; önceki istek zamanı görünür |
| 9 | **Hizmet alanı dışı:** Bölgeyi erken gör -> mesafe teyidi | Sonda kapsam dışı olduğunu öğrenme | Yenimahalle merkezli kapsam CTA yakınında |
| 10 | **Klavye/büyütme:** Mantıklı focus sırası ile tüm wizard | Focus kaybı, taşma, hareket | 195 CSS px'de taşma yok; reduced motion; klavye tamamlama |

### 17.1 Senaryo test metinleri

Kullanıcıya arayüzü tarif eden komut verilmez. Örnek görevler:

- "Salon duvarındaki kabarma için yarın öğleden sonra talep bırakın."
- "Metal kapının sorununun kaynak mı motor mu olduğunu bilmiyorsunuz; fotoğrafla danışın."
- "İşletmenin Ankara'nın hangi bölgesinde olduğunu ve telefonunu bulun."
- "Apartmandaki birkaç farklı iş için keşif talebi bırakın."
- "Yanlış seçtiğiniz iş türünden geri dönüp doğru hizmeti seçin."
- "Talebinizi daha sonra nasıl değiştireceğinizi gösterin."

## 18. Alternatif renk yönleri ve karar

Renk, "mavi güven verir" gibi bağlamdan bağımsız psikoloji genellemeleriyle seçilmez. Marka uyumu, ayırt edicilik, kontrast, durum anlamı ve gerçek görsellerle birliktelik değerlendirilir.

| Alternatif | Güçlü taraf | Risk | Karar |
| --- | --- | --- | --- |
| **A. Forged Copper + Graphite** | Metal kimliği, ayırt edici, premium | Fazla bakır turuncu/kahverengi tek nota dönüşür | **Ana yön** |
| B. Industrial Blue + Steel | Kurumsal ve teknik | Jenerik SaaS/tesisat görünümü | Reddedildi |
| C. Dark Forged | Güçlü atölye atmosferi | Formda ağır, okunabilirlik riski | Yalnız footer/galeri vurgusu |
| D. Trust Green | Olumlu durum çağrışımı | Ana CTA, WhatsApp ve başarı karışır | Ana palet olarak reddedildi |
| E. Monochrome Premium | Sessiz ve rafine | Eylem/durum ayrımı zayıf | Logo/print varyantı |

### 18.1 Önerilen açık tema tokenları

| Rol | Değer | Kullanım ve kontrast |
| --- | --- | --- |
| Ana metin | `#1C1C1A` | Başlık/kritik bilgi; çok yüksek kontrast |
| Gövde | `#43433D` | Ana açıklamalar |
| Yardımcı metin | `#5E5E56` | Beyazda 6.54:1 |
| En düşük okunur gri | `#6B6B62` | Beyazda 5.38:1 |
| Dekoratif/disabled | `#A3A398` | Beyazda 2.55:1; normal metinde yasak |
| Ana zemin | `#FFFFFF` | Form ve temel yüzey |
| Sayfa zemini | `#FBFBF9` | Sıcak nötr |
| İkincil yüzey | `#F2F2EE` | Gruplama |
| Sınır | `#E4E4DB` | Input/kart; shape ve metinle desteklenir |
| Ana aksiyon | `#9A431F` | Açık metinle 6.34:1 |
| Hover/pressed | `#7A3218` | Daha yüksek kontrast |
| Seçim zemini | `#FFF4ED` | `#9A431F` ile 6.07:1 |
| Dekoratif bakır | `#BD5928` | Beyazda 4.54:1; küçük metinde tercih edilmez |
| WhatsApp | `#15803D` | Açık metinle 4.84:1; yalnız kanal rolü |
| Başarı metni | `#0B6C43` | `#E8F5E9` ile 5.76:1 |
| Uyarı metni | `#854D0E` | `#FFFBEB` ile 6.61:1 |
| Hata metni | `#B42318` | `#FFF4F2` ile 6.10:1 |
| Bilgi metni | `#0369A1` | `#E0F2FE` ile 5.17:1 |
| Focus ring | `#9A431F` | Komşu yüzeyde >=3:1 ayrıca doğrulanır |

Mevcut `#0D8050`, `#E8F5E9` üzerinde 4.42:1 ile normal metin için az farkla yetersizdir; metin rolünde `#0B6C43` kullanılmalıdır.

### 18.2 Renk dağılımı ve kullanım yasağı

- %70-80 beyaz/sıcak açık nötr.
- %15-25 graphite metin, sınır ve ikincil yüzey.
- %5-8 bakır marka ve ana aksiyon.
- <%3 yeşil, kırmızı, sarı ve mavi semantik durum.

Bir viewport içinde tüm durum renkleri aynı anda dikkat istememelidir. Müsait/dolu, seçili hizmet, form hatası, tamamlanan adım ve iptal durumu yalnız renkle anlatılmaz; metin, ikon, check veya çizgi stili eklenir.

### 18.3 Koyu tema

Koyu tema müşteri akışının ana deneyimi değildir. Korunacaksa sistem tercihini izlemeli; form alanları net ayrılmalı; bakır skalası koyu tema için ayrıca eşlenmeli ve her token çifti bağımsız kontrast testinden geçmelidir. Galeri/footer koyu yüzeyden faydalanabilir, randevu akışında okunabilirlik önceliklidir.

## 19. Tipografi ve içerik yoğunluğu

Mevcut Plus Jakarta Sans korunabilir. Türkçe karakterleri, değişken ağırlıkları ve modern geometrisi marka için uygundur; ikinci dekoratif font gereksiz yük ve tutarsızlık yaratır.

| Rol | Boyut | Satır yüksekliği | Ağırlık |
| --- | ---: | ---: | ---: |
| Hero H1 | 36-40 px desktop; 30-34 px mobile | 1.08-1.15 | 700-800 |
| Bölüm H2 | 28/24 px | 1.2 | 700 |
| Panel başlığı | 20-22 px | 1.25 | 700 |
| Kart başlığı | 16-18 px | 1.3 | 700 |
| Gövde | 16 px | 1.55-1.7 | 400-500 |
| Yardımcı | 14 px | 1.45-1.6 | 400-600 |
| Etiket | 13-14 px | 1.3-1.4 | 600-700 |
| En küçük meta | 12 px | >=1.4 | 600 |

Kurallar:

- Font viewport genişliğiyle sürekli ölçeklenmez; letter spacing `0` olur.
- Gövde 16 px altında olmaz; 12-13 px yalnız kısa meta içindir.
- Desktop gövde satırı yaklaşık 45-75 karakter aralığında tutulur.
- Uzun tamamı büyük harf etiket ve negatif tracking kullanılmaz.
- Hero ölçeği kompakt wizard/kart başlığında kullanılmaz.

### 19.1 Metin bütçesi ve sözlük

| İçerik | Standart |
| --- | --- |
| Hero | Tek açık vaat + en fazla iki kısa destek cümlesi |
| CTA | Fiil + sonuç: "Talep Oluştur", "Fotoğrafla Danış" |
| Grup açıklaması | Mobilde en fazla iki satır hedefi |
| Yardım metni | Yalnız hata önlemeye yarıyorsa |
| Uyarı | Ne oldu + kullanıcı ne yapmalı |
| Başarı | Ne kaydedildi + sonraki adım/dönüş beklentisi |
| Fiyat | Başlangıç/fiyatı etkileyenler; kesinlik iddiası yok |

Kontrollü terminoloji: `Talep Oluştur`, `Zaman tercihi`, `Fotoğrafla Danış`, `Talebi Gönder`, `Talebi Takip Et`, `İptal Talebi Gönder`. `Kesin randevu`, bağlamsız `Devam`, `Onayla` ve otomatik işlem izlenimi veren metinlerden kaçınılır.

## 20. Layout, bileşen ve etkileşim standartları

### 20.1 Layout

- Ana içerik maksimum 1120-1200 px; okuma metni 680-760 px.
- Wizard dış kabuğu masaüstünde ana 1120-1180 px içerik gridine hizalanır; tek sütun form ve uzun okuma yüzeyleri içeride en fazla 840 px tutulur.
- Mobilde wizard ekran genişliğini kullanır ve içeride tek 16 px yatay görev oluğu bırakır; sayfa ve wizard paddingleri üst üste bindirilmez. 360 px altında kırılma test edilir.
- Section aralıkları 48-80 px; form içi aralıklar 12-24 px.
- Kart yalnız tekrarlı öğe, gerçek araç ve modal için; kart içinde kart yok.

### 20.2 Buton ve seçim

| Seviye | Stil | Bir görünümde sayı | Örnek |
| --- | --- | ---: | --- |
| Primary | Dolu bakır | 1 | Talebi Gönder |
| Secondary | Sınır/düşük yüzey | 1 | Fotoğrafla Danış |
| Tertiary | Metin+ikon | Gruplanmış | Telefonla ara, İş türlerine dön |
| Destructive | Kırmızı, bağlama özel | 1 | İptal Talebi Gönder |

- Tek seçim radio; binary tercih checkbox/toggle; mod seçimi segmented control.
- Seçili durum border + yüzey + check + `aria-checked` ile gösterilir.
- Disabled neden yakındaki görünür metinle açıklanır; hover tek başına yeterli değildir.
- Kullanıcı adına hizmet varsayılmaz; yalnız güvenli sistem varsayımları otomatikleştirilir.

### 20.3 Form

- Etiket input üstünde ve daima görünür; placeholder etiket değildir.
- `autocomplete`, `inputmode` ve uygun input tipi kullanılır.
- Hata alanla programatik bağlı, renk+metin+ikonla görünür.
- Veri adımlar arasında, conflict ve geçici sunucu hatasında korunur.
- Submit loading durumu buton boyutunu değiştirmez.

### 20.4 Sistem durumları

| Durum | Görsel yanıt | Eylem |
| --- | --- | --- |
| İlk yükleme | Sabit boyutlu skeleton | Bekle |
| Availability yenileme | Seçim alanı yerinde | Bekle/yeniden dene |
| Veri yok | Neden + alternatif | Başka tarih/WhatsApp |
| Ağ hatası | Alert + kısa açıklama | Yeniden dene |
| Slot conflict | İlgili adımda warning | Alternatif seç |
| Başarı | Tek sonuç ve beklenti | Takip et |

### 20.5 Motion

- Hover/focus 140 ms; seçim/accordion 180-220 ms; adım 200-240 ms; büyük geçiş <=320 ms.
- Aynı anda tek ana hareket odağı.
- Parallax, autoplay, sürekli pulse ve dekoratif loading yok.
- `prefers-reduced-motion` altında hareket kaldırılır, bilgi korunur.
- Animasyon tıklamayı veya veri girişini bekletmez.

### 20.6 Logo ve görsel art direction

- Forged U logosu ana navigasyonda yatay wordmark, küçük yüzeyde sade favicon varyantıyla kullanılır.
- Logo çevresinde en az U formunun iç boşluğu kadar clear-space korunur; gölge, glow ve tekrar metal dokusu eklenmez.
- Logo ana CTA ile bakır renk için yarışmamalıdır; nav içinde daha kontrollü ölçekte kalır.
- Hizmet görselleri gerçek işi açıklamalı: sorun, uygulama veya sonuç görülebilmelidir.
- Tüm hizmet görsellerinde ortak oran, doğal ışık, benzer beyaz dengesi ve tutarlı kırpım kullanılır.
- Karanlık, aşırı blur, yalnız atmosfer veren stok benzeri fotoğraflar ana hizmet kanıtı olmaz.
- Önce/sonra çiftlerinde kamera açısı ve ölçek mümkün olduğunca sabit tutulur.
- Görsel alt metni dosya adı değil, karar için anlamlı sonucu açıklar.
- Hero bitmap kullanılacaksa ürün/usta/iş ilk viewport sinyali olmalı; metin okunabilirliği için kontrollü overlay kullanılmalı, görsel ayrı dekoratif kart yapılmamalıdır.

### 20.7 Responsive ve cihaz matrisi

| Görünüm | Ana kontrol | Özel risk |
| --- | --- | --- |
| 360x800 | Küçük Android | Uzun Türkçe etiket, sticky yüksekliği |
| 390x844 | Ana mobil baseline | İlk viewport CTA ve wizard |
| 412x915 | Büyük Android | Kartların gereksiz genişlemesi |
| 768x1024 | Tablet portrait | Grid'in erken/ geç kırılması |
| 1024x768 | Tablet landscape | Hero ve wizard oranı |
| 1280x720 | Kısa desktop | Fold ve sticky nav |
| 1440x900 | Ana desktop baseline | İçerik genişliği ve hiyerarşi |
| 195x422 CSS eşdeğeri | %200 zoom kontrolü | Reflow, metin ve focus occlusion |

Her görünümde yatay taşma, metin kesilmesi, focus görünürlüğü, primary CTA sayısı ve sabit yüzeylerin içerik kapatması denetlenir.

## 21. Hedef bilgi mimarisi ve Plerdy eşlemesi

Önerilen sıra: kompakt nav -> hero -> güven şeridi -> randevu wizard -> gerçek işler -> bilgi amaçlı hizmet kataloğu -> süreç -> hizmet bölgesi/iletişim -> SSS -> footer.

Katalog bilgi verir ve tıklamayla kullanıcıyı taşımaz. Wizard karar alır ve yalnız gerekli kısa içeriği gösterir.

| Plerdy alanı | Umut Usta gereksinimi | Kanıt | Öncelik |
| --- | --- | --- | --- |
| İlk 3 saniyede amaç | H1, Ankara, hizmet açık | 5 saniye testi | P0 |
| CTA fold üstünde | Talep Oluştur ilk viewport'ta | 390x844 QA | P0 |
| Click-to-call | Gerçek `tel:` bağlantısı | E2E | P0 |
| Hizmet alanı | Yenimahalle ve diğer ilçeler mantığı | Copy testi | P0 |
| Fiyat mantığı | Başlangıç/fiyat faktörü | İçerik audit | P1 |
| Trust yakınlığı | Adres, saat, gerçek iş | Görsel QA | P0 |
| Kısa mobil form | Ad/telefon zorunlu | Form testi | P0 |
| Kolay takvim | Hızlı gün; conflict yönetimi | E2E | P0 |
| Mesai beklentisi | Ne zaman dönüş yapılacağı | Saat testi | P1 |
| NAP tutarlılığı | Config tabanlı tek veri | Test | P0 |
| Gerçek fotoğraf/vaka | Atölye, süreç, sonuç | İçerik checklist | P1 |
| İtirazlar | Fiyat, süre, malzeme, iptal | SSS audit | P1 |
| Sticky occlusion | Wizard'da sticky gizli | Screenshot | P0 |
| Açık terminoloji | Kontrollü Türkçe sözlük | Copy audit | P0 |
| İkon+etiket | Kritik ikonlar metinli | A11y tree | P0 |
| Disabled açıklaması | Seçim gereği görünür | Unit test | P0 |
| Honest controls | Link gezinir, button eylem | Semantik test | P0 |
| Focus/reduced motion | Focus-safe, hareket tercihi | Playwright | P0 |
| Gerçek lead ölçümü | Submit/telefon/WhatsApp ayrımı | Event taxonomy | P0 |
| Lead kalitesi | Qualified/unqualified | Operasyon verisi | P1 |

Plerdy uzman heuristiğidir; predictive heatmap gerçek davranış verisi değildir. Hipotezler event, gerçek heatmap/session ve görev testiyle doğrulanır.

## 22. Ölçüm ve araştırma protokolü

İlk moderated tur 6-8 katılımcı içerir: iki hızlı mobil, iki 50+ veya telefon odaklı, bir apartman/iş yeri karar vericisi, bir düşük dijital yetkinlik kullanıcısı ve mümkünse klavye/büyütme kullanan biri.

Toplanacak veriler:

- Tamamlandı / yardımla / başarısız.
- İlk anlamlı seçim ve toplam görev süresi.
- Yanlış seçim, geri dönüş, validation ve yardım sayısı.
- SEQ 1-7.
- NASA-TLX Mental Demand, Effort, Frustration 0-100.
- Tereddüt cümleleri ve nitel gözlem.

### 22.1 Event ve görselleştirme

| Event | Amaç | Property |
| --- | --- | --- |
| `public_page_viewed` | Funnel başlangıcı | attribution |
| `hero_cta_clicked` | Başlangıç yolu | cta, placement |
| `booking_service_group_selected` | Grup anlaşılabilirliği | group, visible_services |
| `booking_service_group_back_clicked` | Yanlış grup/kararsızlık | group |
| `booking_service_changed` | Hizmet seçimi | service_type |
| `booking_slot_selected` | Zaman seçimi | slot_time, service_type |
| `booking_step_completed` | Adım dönüşümü | step, service_type |
| `booking_validation_failed` | Form sürtünmesi | fields, service_type |
| `booking_submitted` | Tamamlama | service_type, channel |
| `public_channel_clicked` | Kanal tercihi | channel, placement |

Dashboard kuralları: funnel sayı+yüzde; barlar ortak sıfır ekseni; oran yanında örneklem; süre için medyan+P75; düşük örneklemli heatmap gizli; renk yanında metin/ikon; varyantta tarih, kaynak ve cihaz dağılımı açık.

## 23. Uygulanabilir kalite kapıları

### UX Definition of Done

- Her adım tek ana soruya cevap verir; tek baskın CTA vardır.
- Seçim geri alınabilir, veri korunur, varsayılan hizmet yoktur.
- Loading, boş, hata, başarı ve conflict durumları tasarlanmıştır.
- Kontrollü terminoloji kullanılır; telefon/fotoğraf yolu erişilebilir kalır.

### Accessibility Definition of Done

- WCAG 2.2 AA hedefi; normal metin >=4.5:1, UI/focus >=3:1.
- Kritik hedefler pratikte >=44x44 px.
- %200 eşdeğeri görünümde kayıp/taşma yok.
- Focus görünür ve sticky altında değil; görev klavyeyle tamamlanır.
- Renk tek taşıyıcı değildir; reduced motion bilgi kaybettirmez.

### Engineering Definition of Done

- Unit/integration/kritik E2E, görsel regresyon, lint, build ve `git diff --check` geçer.
- Event merkezi taxonomy'dedir; kişisel veri event property'lerine yazılmaz.
- Loading layout shift yaratmaz.
- SQL gerekiyorsa ayrı migration ve rollback notu bulunur.

### PO GO/NO-GO

GO: kritik görev >=%90, P0 erişilebilirlik sorunu yok, submit kapanmıyor, veri korunuyor, event'ler dedupe çalışıyor ve test lead'i operasyona ulaşıyor.

NO-GO: yanlış hizmetle sessiz ilerleme, dolu slotun seçilebilir olması, başarısız submitte başarı mesajı, küçük mobil görünümde ulaşılamayan telefon/form veya kritik focus/kontrast sorunu.

## 24. Uygulama iş paketleri

| Paket | İş | Çıktı |
| --- | --- | --- |
| CUX-1 tamamlandı | Grup seçimi, no-default, CTA sadeleştirme | Düşük ilk seçim yükü |
| CUX-2 tamamlandı | Wizard trust sonrasına taşındı | Kısa görev yolu |
| CUX-3 tamamlandı | Hızlı gün -> saat -> tam tarih disclosure | Sade zaman seçimi |
| CUX-4 tamamlandı | Ad/telefon ana; ek bilgi disclosure | Kısa iletişim adımı |
| CUX-5 tamamlandı | Katalog detail, gerçek vaka, hizmet alanı | Güven ve beklenti |
| CUX-6 kısmen tamamlandı | Ölçüm altyapısı/protokol hazır; gerçek kullanıcı baseline'ı bekliyor | Kanıta hazırlık |

### 24.1 Renk sistemi teknik işleri

1. Başarı metnini `#0B6C43` veya daha koyu semantic tokena taşı.
2. `grey-400` kullanımını dekoratif/disabled ile sınırla.
3. Beyaz küçük metinli ana eylemde `brand-600` kullan; `brand-500` kullanma.
4. Semantic token dışı doğrudan hex kullanımını azalt.
5. Light/dark token çiftleri için kontrast testi ekle.
6. Durum bileşenlerine ikon+metin regresyon testi ekle.

### 24.2 Araştırma belirsizlikleri

- Gerçek yaş/cihaz dağılımı ve workload baseline bilinmiyor.
- Predictive heatmap gerçek heatmap değildir.
- Renk alternatifleri kullanıcı tercih testine girmedi.
- Dört hizmet grubunun müşteri diliyle eşleşmesi doğrulanmalı.
- Dönüşüm artışı henüz iddia edilemez.

### 24.3 Gereksinim ve kabul testi izlenebilirliği

| ID | Gereksinim | Kabul kanıtı | Sprint |
| --- | --- | --- | --- |
| COG-01 | Varsayılan hizmet seçilmez | Unit + E2E | CUX-1 tamamlandı |
| COG-02 | İlk hizmet görünümünde en fazla dört grup | Screenshot + DOM testi | CUX-1 tamamlandı |
| COG-03 | Hero'da tek primary ve tek alternatif yol | Görsel QA + role testi | CUX-1 tamamlandı |
| COG-04 | Sticky wizard/submit alanını kapatmaz | 360/390 screenshot | CUX-1 tamamlandı |
| COG-05 | Wizard trust sonrasında ilk görev bandıdır | DOM sırası + screenshot | CUX-2 tamamlandı |
| COG-06 | Zaman adımı önce hızlı tarihleri gösterir | E2E | CUX-3 tamamlandı |
| COG-07 | Tam takvim progressive disclosure'dır | Keyboard E2E | CUX-3 tamamlandı |
| COG-08 | Yalnız ad ve telefon ilk görünümde zorunludur | Form şeması testi | CUX-4 tamamlandı |
| COG-09 | Ek bilgi açıldığında focus ve veri korunur | Unit + E2E | CUX-4 tamamlandı |
| VIS-01 | Normal metin kontrastı >=4.5:1 | Token kontrast testi | CUX-4 tamamlandı |
| VIS-02 | Durumlar renk+metin+ikon taşır | Component test | CUX-4 tamamlandı |
| VIS-03 | 195 CSS px görünümde yatay taşma yok | Playwright | Her sprint |
| CNT-01 | Katalog kartı görev butonu değildir | Role testi | CUX-5 tamamlandı |
| CNT-02 | Her hizmet problem, kapsam ve fiyat mantığı taşır | Content schema | CUX-5 tamamlandı |
| IMG-01 | Gerçek vakalar ortak oran ve anlamlı alt metin taşır | Content QA | CUX-5 tamamlandı |
| MET-01 | Grup seçimi/geri dönüş ölçülür | Event unit test | CUX-1 tamamlandı |
| MET-02 | Workload baseline SEQ ve NASA-TLX ile kaydedilir | Araştırma raporu | CUX-6 |
| OPS-01 | Test lead'i doğru operasyon ekranına ulaşır | Entegrasyon testi | CUX-6 |

## 25. Güncel ekran ve tekrar denetimi

### 25.1 İlk viewport dikkat envanteri

390x844 görünümünde kullanıcı wizard'a ulaşmadan önce aşağıdaki sinyallerle karşılaşır:

| Katman | Görünen öğeler | Karar etkisi | Karar |
| --- | --- | --- | --- |
| Navigasyon | Logo+isim, açık/koyu anahtarı, menü | Tema seçimi ana göreve katkı sağlamaz | Tema kontrolünü menü/footer'a taşı; sistem tercihini varsayılan al |
| Hero marka | İkinci logo, ikinci `Umut Usta`, `Randevu ve hizmet talebi` | Navigasyondaki marka bilgisini tekrarlar | Hero içi marka bloğunu kaldır |
| Hero mesaj | Uzun H1, iki cümle lead, üç güven maddesi | H1 anlaşılır; destek katmanı fazla | H1 + tek kısa lead + tek hizmet alanı kanıtı |
| Hero aksiyon | Dolu bakır ve dolu yeşil buton | İki primary gibi algılanır | Bir dolu primary; WhatsApp düşük ağırlıklı secondary/text action |
| Sticky aksiyon | Aynı iki hero aksiyonu | Farklı seçenek üretmeden buton sayısını ikiye katlar | Hero görünürken gizli; aşağıda yalnız tek primary |
| Trust | Hero rozeti + dört hücreli şerit | Konum ve saat yararlı; telefon/WhatsApp tekrar | Üç kısa kanıt: bölge, saat, gerçek iş |

İlk viewport için hedef dikkat bütçesi:

- 1 marka sinyali.
- 1 görev cümlesi.
- 1 baskın CTA.
- 1 alternatif kanal.
- En fazla 3 kısa güven kanıtı.
- Tema, galeri, telefon ve ayrıntılı navigasyon ana görevle aynı vurgu düzeyinde olmaz.

| Ölçü | Güncel mobil ilk görünüm | Hedef |
| --- | ---: | ---: |
| Marka bloğu | 2 | 1 |
| Görünen dönüşüm butonu | 4 buton / 2 farklı karar | 2 buton / 2 farklı karar |
| Hero+trust güven sinyali | 8'e kadar | 3 |
| Eşzamanlı doygun vurgu ailesi | 4 | 1 marka + gerektiğinde 1 kanal |
| İlk hizmet seviyesinde eşdeğer seçim | 5 | 4 + ayrı yardım yolu |

Bu bütçe çalışma belleği için mekanik bir "dört öğe yasası" değildir. Cowan'ın odaklanmış dikkat için yaklaşık 3-4 chunk bulgusu, yalnız eşzamanlı ve ilişkisiz sinyalleri azaltmak için yön verir. Choice-overload meta-analizi de seçenek sayısını tek başına düşürmenin evrensel fayda sağlamadığını gösterir; asıl hedef anlaşılır gruplama, belirgin varsayımlar ve karar için gerekli karşılaştırma bilgisidir.

### 25.2 Yinelenen içerik matrisi

| İçerik/eylem | Mevcut yüzeyler | Gerekli yüzey | Kaldırılacak/azaltılacak yüzey |
| --- | --- | --- | --- |
| `Talep Oluştur` | Nav, hero, sticky, süreç, footer | Hero; hero dışındayken sticky/nav | Footer ve süreç içindeki CTA tekrarı |
| `Fotoğrafla Danış` | Hero, sticky, form kanal alanı, footer | Hero secondary; formda bağlamsal alternatif | Hero görünürken sticky; footer tekrarı |
| Telefon | Hero utility, trust bar, konum, footer | Kompakt nav/menu ve konum | Hero utility ve trust bar |
| Konum/Yenimahalle | Hero rozeti, trust bar, konum, footer | Hero kısa kanıt + ayrıntılı konum | Footer ve tekrar eden trust cümlesi |
| 09:00-21:00 | Trust, konum, footer, başarı beklentisi | Trust ve bağlamsal başarı beklentisi | Konum linki ve footer |
| Ekip teyidi | Hero, takvim, süreç, konum, başarı, footer | Takvimde tek kısa uyarı; başarıda sonraki adım | Hero lead dışındaki genel tekrarlar ve footer |
| İş örnekleri | Nav, hero utility, preview CTA, footer | Nav/menu ve preview CTA | Hero utility ve footer |
| Marka adı/logo | Nav ve hero içinde iki kez | Nav wordmark | Hero marka bloğu |

Tekrar tamamen yasak değildir. Kritik yardımın tutarlı yerde tekrar görünmesi erişilebilirliği destekleyebilir. Buradaki silme ölçütü şudur: aynı viewport içinde aynı karara hizmet eden iki öğe yeni bilgi veya yeni eylem üretmiyorsa biri kaldırılır.

### 25.3 Mevcut seçim mimarisi bulgusu

İlk hizmet adımı önceki sekiz hizmetlik baseline'a göre daha iyidir; ancak güncel beş seçenekten `Bahçe veya yerinde keşif` iki farklı zihinsel modeli aynı kutuda birleştirir. `Emin değilim` ise beşinci eşdeğer seçim olarak görünür. Önerilen ilk seviye:

1. **Boya ve küçük tadilat**
2. **Kaynak ve metal**
3. **Kapı ve otomasyon**
4. **Bahçe ve dış alan**

`Emin değilim` ana grid dışında, düşük ağırlıklı fakat açık bir yardım yolu olur: **“Kararsızım, fotoğrafla soracağım”**. Sistem içinde keşif talebi korunacaksa bu yol bir açıklama ardından `Yerinde keşif` seçebilir; kullanıcıya bahçe ile keşfi aynı kavrammış gibi sunmaz.

Seçim satırları büyük dekoratif kart yerine kompakt 2x2 tile veya tek sütun radio satırlarıdır. Her seçenek yalnız kısa ad ve bir örnek satırı taşır. Seçim yapıldıktan sonra ilgili 1-3 hizmet görünür; diğer gruplar ekranda kalmaz.

## 26. Premium deneyimin bilimsel ve ürün tanımı

### 26.1 Premium ne değildir?

Bu ürün için premium deneyim:

- daha fazla gradient, glow, metal dokusu veya animasyon değildir;
- tüm yüzeyleri koyu yapmak değildir;
- büyük logo ve iddialı slogan değildir;
- her bilgiyi kart içine almak değildir;
- WhatsApp, başarı ve ana aksiyonu aynı yeşil ailede göstermek değildir;
- erişilebilirlik ve hız pahasına editorial/lüks site taklidi değildir.

### 26.2 Hedef yön: Quiet Craft

Önerilen tasarım yönünün adı **Quiet Craft / Sessiz Zanaat**tır. Marka, yaptığı işin malzeme kalitesini bağırmadan gösterir. Premium algı altı bileşenden oluşur:

1. **İşlevsel kesinlik:** Kullanıcı ilk bakışta ne yapacağını bilir.
2. **Malzeme dürüstlüğü:** Gerçek metal, kaynak, boya ve tamamlanmış iş fotoğrafları kullanılır.
3. **Görsel tutarlılık:** Tek radius ailesi, tek gölge mantığı, tek ikon stili ve kontrollü renk rolleri vardır.
4. **İçerik özgüveni:** Uzun açıklama ve kendini tekrar etmek yerine kısa, doğrulanabilir bilgi verilir.
5. **İnce hareket:** Hareket yalnız durum değişimini açıklar; marka gösterisi yapmaz.
6. **Operasyonel güven:** Gerçek bölge, saat, fiyat mantığı, iş kanıtı ve sonraki adım nettir.

Processing-fluency araştırması, simetri, figure-ground ayrımı, kontrast ve prototipik/kolay işlenen biçimlerin estetik değerlendirmeyi etkileyebildiğini gösterir. Bu nedenle premium algı "daha karmaşık" değil, daha niyetli ve daha kolay çözümlenen bir görsel hiyerarşiyle aranır.

### 26.3 Premium referanslardan aktarılabilir ilkeler

| Referans | Gözlenen ilke | Umut Usta'ya aktarım | Kopyalanmayacak unsur |
| --- | --- | --- | --- |
| Vitsœ | Sade ürün dili, dürüst fiyat, uzun ömür ve az vurgu | Açık kapsam, başlangıç fiyatı ve onarımın kalıcılığı | Mobilya markasının editorial boşluğu |
| Gaggenau | Malzeme, hassas işçilik, tutarlı form ve gerçek üretim kanıtı | Gerçek atölye/iş detayı ve ölçülü metal kimliği | Aşırı aspirasyonel lüks söylem |
| Buster + Punch | Ham dökümden hassas işçiliğe uzanan zanaat hikâyesi | Kaynak dikişi, bağlantı, yüzey ve bitmiş iş yakın planları | E-ticaret katalog yoğunluğu |
| Plerdy local service | İlk ekranda iş, konum, CTA; CTA yakınında gerçek trust | H1, Ankara, tek CTA ve tamamlanmış iş sayısı | Her kanalı aynı anda görünür yapmak |

Bu karşılaştırmalar dönüşüm kanıtı değildir; görsel ve içerik hipotezi üretir. Karar gerçek görev testi ve davranış verisiyle doğrulanır.

## 27. Logo sistemi yeniden değerlendirmesi

### 27.1 Mevcut asset bulguları

- `umut-usta-logo.png` 4096x4096 master, dövülmüş metal yüzey, kontrollü bakır kenar ve kaynak boncuklarıyla premium zanaat fikrini taşır; ancak yaklaşık 1.55 MB raster dosyadır ve UI ölçeğinde kullanıma uygun değildir.
- `umut-usta-logo.svg` master görseli birebir temsil etmez. Kalın yuvarlatılmış stroke, gradient ve turuncu noktalar küçük boyutta jenerik bir U gibi görünür; master'daki açılı forged uçlar ve katmanlı metal kütle kaybolur.
- `umut-usta-logo-horizontal.svg` içindeki slogan `<text>` ile fonta bağımlıdır; Türkçe karakterlerin dosyada bozulduğu görülür. Export-safe wordmark değildir.
- Navigasyon 36 px seviyesinde yalnız sembol ve yanında HTML metni kullanır. Hero içinde aynı sembol tekrar çerçeveli bir kutuda gösterilir.

### 27.2 Hedef logo mimarisi

| Varyant | Kullanım | Teknik kural |
| --- | --- | --- |
| Forged U master | Basın, büyük görsel, marka dokümanı | 1024/2048 PNG/WebP; şeffaf ve açık zemin varyantı |
| Forged U vector | Nav, form, footer | Gerçek path; font, blur ve ağır filter yok; 24-64 px optik test |
| Horizontal wordmark | Desktop nav, doküman | Yazı path'e çevrilmiş veya HTML wordmark; bozuk Türkçe yok |
| Favicon micro | 16, 24, 32, 48 px | Tek renk graphite U + en fazla bir bakır dikiş; boncuklar kaldırılır |
| Monochrome | Tek renk baskı ve erişilebilir yüzey | %100 siyah/beyaz; gradient yok |

Vector rafinasyon kuralları:

- Master PNG'deki dış silüet referans alınır; üst uçların açılı forged karakteri korunur.
- U'nun iç boşluğu küçük boyutta kapanmayacak kadar genişletilir.
- Kaynak dikişi 24-40 px ölçekte en fazla bir kısa çizgi veya tek bakır kesit olur; küçük boncuklar kaldırılır.
- Metal doku vektörde taklit edilmez. Doku yalnız büyük raster master'da bulunur.
- UI logosunda drop shadow ve glow kullanılmaz.
- Sembol ile wordmark optik olarak aynı cap-height eksenine oturur.
- Clear-space sembol kol kalınlığının en az 0.75 katıdır.
- Ana sayfada aynı viewport içinde bir logo/wordmark yeterlidir; hero içinde ikinci marka bloğu kullanılmaz.

### 27.3 Logo kabul testleri

- 16 px favicon açık ve koyu tabda ayırt edilir.
- 24, 32, 40 ve 64 px boyutlarda U formu kapanmaz ve kaynak detayı gürültü oluşturmaz.
- SVG'de `<text>`, raster embed, blur filter ve harici font bağımlılığı yoktur.
- Türkçe wordmark ve slogan dosya/DOM encoding testinden geçer.
- Logo tek renk çıktıda anlamını korur.
- 390x844 ilk viewport'ta marka yalnız navigasyonda bir kez görünür.

## 28. Renk, tipografi ve yüzey sistemi v3

### 28.1 Mevcut palet sorunu

Mevcut palette erişilebilir tokenlar bulunmasına rağmen ilk viewport aynı anda bakır, WhatsApp yeşili, açık mavi tema segmenti, pembe-bakır rozet, sıcak beyaz overlay ve çok sayıda gri yüzey gösterir. Sorun tek tek renklerin yanlışlığı değil, hepsinin aynı anda vurgu rolü üstlenmesidir. Üç ana müşteri stil dosyasındaki statik tarama 59 benzersiz hex değer ve `GlobalStyles` içinde 62 benzersiz `--color-*` tokenı bulmuştur. Bunların bir bölümü light/dark ve semantik roller için gerekli olsa da marka katmanında daha küçük bir çekirdek palet tanımlanmalıdır.

Yeni palet **Obsidian / Bone / Forged Copper** üçlüsüne dayanır. Yeşil yalnız durum ve WhatsApp kanalında; mavi yalnız gerçekten bilgi durumu gerekirse kullanılır.

### 28.2 Önerilen çekirdek tokenlar

| Rol | Token | Değer | Kullanım |
| --- | --- | --- | --- |
| Ana mürekkep | `ink-950` | `#181A18` | H1, güçlü metin, koyu yüzey |
| Graphite | `graphite-800` | `#292B29` | Nav/footer, ikincil koyu alan |
| Steel text | `steel-650` | `#555953` | Gövde ve meta |
| Muted text | `steel-550` | `#676B65` | Kontrast testli yardımcı metin |
| Bone page | `bone-50` | `#F7F6F2` | Sayfa zemini |
| Paper | `paper-0` | `#FFFFFF` | Form ve aktif yüzey |
| Hairline | `line-200` | `#DDDCD5` | Sınır ve ayırıcı |
| Copper primary | `copper-700` | `#8F4021` | Tek primary CTA ve seçim |
| Copper hover | `copper-800` | `#713019` | Hover/pressed |
| Copper detail | `copper-500` | `#C56A37` | İnce çizgi, ikon detayı; küçük beyaz metin yok |
| Copper wash | `copper-50` | `#FBF0E9` | Seçim arka planı |
| Success | `success-700` | `#11633F` | Başarı metni/durumu |
| WhatsApp | `whatsapp-700` | `#128044` | Yalnız kanal ikonu/secondary sınırı |
| Warning | `warning-800` | `#7A470C` | Uyarı metni |
| Danger | `danger-700` | `#A92A20` | Hata/iptal |

Kesin tokenlar uygulama öncesi mevcut kontrast yardımcı testiyle doğrulanır. Normal metin 4.5:1, büyük metin ve UI/focus 3:1 altına düşmez.

Ön kontrol sonuçları beyaz zemin üzerinde `ink-950` 17.50:1, `steel-650` 7.14:1, `steel-550` 5.43:1, `copper-700` 7.18:1, `success-700` 7.29:1 ve `whatsapp-700` 5.00:1 oranlarını vermiştir. `copper-500` 3.82:1 olduğu için normal boyutta beyaz metin zemini değil, dekoratif detay veya büyük/UI grafik rolüdür. Bu v3 token tablosu uygulama kararı açısından Bölüm 18'deki alternatif palet çalışmasını geçersiz kılmaz; onu daraltır ve yerine geçer.

### 28.3 Renk kullanım oranı

- %78-84 Bone/Paper ve doğal fotoğraf alanı.
- %12-17 Ink/Graphite/Steel.
- %3-5 Copper vurgu.
- %1-2 semantik yeşil/sarı/kırmızı.

Bir viewport içinde copper dışındaki doygun renk yalnız aktif bir sistem durumu veya alternatif kanal gerçekten görünürse kullanılır. WhatsApp secondary eylemi dolu yeşil yüzey olmak zorunda değildir; nötr yüzey, yeşil ikon ve sınırla kanal anlamı korunabilir.

### 28.4 Tipografi kararı

Plus Jakarta Sans korunabilir; sorun fonttan çok 800 ağırlığın ve çok sayıda küçük uppercase etiketin tekrar kullanılmasıdır.

- Hero H1: 700 ağırlık, 38-44 px desktop; 30-34 px mobile.
- Bölüm H2: 650-700 ağırlık, 24-30 px.
- Gövde: 16 px, 1.55-1.65 line-height.
- Etiket: 13-14 px, 650; uppercase yalnız çok kısa kategori etiketinde.
- Buton: 15-16 px, 700; tüm butonlarda aynı metrik.
- Negatif letter-spacing kullanılmaz.
- İkinci editorial font eklenmez. Premium algı font çeşitliliği yerine boşluk, fotoğraf ve hiyerarşiden gelir.

### 28.5 Radius, border ve shadow

- Ana radius ailesi 6 ve 8 px; yalnız modal/hero gibi büyük yüzeyde en fazla 12 px.
- Her section kart değildir. Hero ve wizard dışındaki bantlar unframed olabilir.
- Normal kart `1px line-200`; gölge yok veya tek çok hafif shadow.
- Hover'da kartın 4 px yukarı sıçraması yerine border/ton değişimi kullanılır.
- Gradient CTA kaldırılır; copper primary düz renktir.
- Hero overlay gradient yerine fotoğrafın doğru çekimi ve gerekirse tekdüze nötr scrim ile çözülür.

## 29. Hedef müşteri deneyimi ve bileşen spesifikasyonu

### 29.1 Yeni sayfa sırası

`kompakt nav -> hero -> 3 kanıt -> wizard -> seçilmiş 3 iş -> hizmet özeti -> 3 adımlı süreç -> konum/iletişim -> SSS -> minimal footer`

Mevcut task-first sırası korunur; ancak içerik miktarı ve görsel ağırlığı azaltılır.

### 29.2 Navigasyon

Desktop:

- Sol: rafine horizontal wordmark.
- Orta: `İşler`, `Hizmetler`, `İletişim` olmak üzere en fazla üç anchor.
- Sağ: hero viewport dışındaysa görünen `Talep Oluştur`; telefon yalnız ikon+tooltip veya menü içinde.
- Tema anahtarı birincil nav'dan kaldırılır; sistem tercihi kullanılır, manuel kontrol menü/footer'a taşınır.

Mobil:

- Logo+isim, telefon ikonu ve menü.
- Tema kontrolü menü içinde.
- Menü kapalıyken üçten fazla kontrol görünmez.

### 29.3 Hero

Hedef içerik:

**H1:** `Ankara'da bakım, onarım ve metal işleri`  
**Lead:** `İşinizi seçin, size uyan zamanı bırakın. Uygunluğu birlikte netleştirelim.`  
**Primary:** `Talep Oluştur`  
**Secondary:** `Fotoğrafla danış`  
**Proof:** `Yenimahalle merkezli yerinde servis` veya `9 gerçek iş örneği`

Kurallar:

- Hero içinde ikinci logo/`Umut Usta` bloğu yoktur.
- Telefon ve galeri utility linkleri hero'dan çıkarılır.
- Üç maddeli trust listesi kaldırılır.
- Primary tek dolu butondur. Secondary outline/text+ikon olur.
- Gerçek ustayı ve işi anlaşılır gösteren, net odaklı fotoğraf kullanılır. Mevcut kaynak fotoğraf değerlidir ancak metin tarafında daha sakin negatif alanla yeniden kırpılmalıdır.
- Fotoğraf üstü metin için tekdüze scrim kullanılır; süt beyaz gradient katmanlarla fotoğrafı yıkamak yerine kontrollü kontrast sağlanır.

### 29.4 Sticky davranışı

- Hero primary görünürken sticky yoktur.
- Hero çıktıktan ve wizard görünmeden önce yalnız `Talep Oluştur` görünür.
- Wizard görünür olduğunda sticky tamamen gizlenir.
- WhatsApp sticky içinde ikinci büyük buton olmaz; gerekirse küçük erişilebilir ikon veya wizard dışı contextual link olur.
- Sticky yüksekliği safe-area dahil içerik kapatmayacak biçimde test edilir.

### 29.5 Trust şeridi

Dört sütun yerine üç öğe:

1. `Yenimahalle, Ankara`
2. `09:00-21:00 planlama`
3. `9 yayınlanmış iş`

Telefon nav/iletişimde bulunur. Trust metinleri birer satır ana bilgi ve gerekirse tek kısa meta taşır. Hücreler kart görünümü almaz; ince ayırıcılarla tek bant olur.

### 29.6 Wizard

- Üstte görünür `3 adımın 1. adımı` cümlesi ile stepper birlikte gösterilmez. Cümle screen-reader live region olarak kalır; görselde yalnız stepper vardır.
- Her adımın üstünde tek soru bulunur.
- İlk ekranda dört ihtiyaç grubu; `Emin değilim` yardım linki.
- Seçim sonrası yalnız ilgili alt hizmetler görünür.
- `Henüz hizmet seçilmedi` ve `Devam etmek için...` metinleri tek bir yardımcı cümlede birleşir.
- İleri butonu yalnız seçimden sonra görünür olabilir; disabled buton gösterilecekse yanında ikinci açıklama tekrarlanmaz.
- Zaman adımında haftalık takvim doğrudan görünür; Bugün/Yarın gibi ikinci tarih yöntemleri kullanılmaz. Gün seçildikten sonra saatler aynı akışta takvimin altında açılır.
- Formda ad ve telefon ana; e-posta/not disclosure içinde kalır.
- Teyit uyarısı zaman adımında bir kez: `Seçtiğiniz saat tercihtir; ekip uygunluğu telefonla netleştirir.`

### 29.7 İş kanıtı ve hizmet kataloğu

İş kanıtı:

- İlk üç işte görsel, iş adı, ilçe ve tek sonuç cümlesi.
- Uzun uygulama açıklaması galeri detayında.
- Ortak 4:3 oran; doğal ışık ve benzer renk düzenleme.
- Mümkünse önce/sonra veya sorun/sonuç çifti.

Hizmet kataloğu:

- Mobil yatay carousel kaldırılır; tek sütun kısa satır veya stabil grid kullanılır.
- İlk görünümde fotoğraf, ad, bir problem cümlesi ve başlangıç fiyatı.
- `Kısa kapsam`, üç madde ve fiyat faktörleri disclosure içindedir.
- Sayfa içinde seçim yaptırmaz ve wizard'a otomatik scroll etmez.
- En fazla dört ana hizmet görünür; diğerleri `Tüm hizmetler` disclosure veya ayrı sayfada.

### 29.8 Süreç, konum, SSS ve footer

- Süreç dört karttan üç adıma iner: `Talebi bırak -> Detayları netleştir -> Uygulama ve teslim`.
- Konumda hizmet alanı, adres ve tek telefon aksiyonu bulunur. Harita ilk yüklemede iframe yerine `Haritada aç` ile isteğe bağlı yüklenebilir; bu hem hız hem dikkat için daha uygundur.
- SSS yalnız itiraz çözüyorsa kalır. Teyit cümlesini yeniden anlatan soru kısaltılır.
- Footer tek sayfalık site menüsünü yeniden üretmez. Wordmark, telefon/WhatsApp, gizlilik ve telif yeterlidir.

## 30. İçerik ve mikro metin sadeleştirme planı

| Mevcut metin | Sorun | Önerilen metin/karar |
| --- | --- | --- |
| `Randevu ve hizmet talebi` | Marka altında açıklayıcı olmayan tekrar | Kaldır |
| `Ankara'da ev, ofis ve metal işleriniz için planlı hizmet talebi` | Uzun ve isim tamlaması ağır | `Ankara'da bakım, onarım ve metal işleri` |
| `Hizmeti ve size uyan zaman tercihini seçin...` | Teyit mesajı uzun | `İşinizi seçin, size uyan zamanı bırakın.` |
| Üç hero güven maddesi | Trust barı tekrarlar | Kaldır; tek proof bırak |
| `3 adımın 1. adımı: Hizmet` | Görsel stepper'ı tekrarlar | Yalnız screen reader live status |
| `Henüz hizmet seçilmedi` + `Devam etmek için...` | Aynı durumu iki kez söyler | `Devam etmek için bir iş türü seçin.` |
| `Önce ihtiyacınızı, ardından kapsamı...` | Katalog davranışını tarif eder | `Hizmet kapsamlarını ve başlangıç fiyatlarını inceleyin.` |
| `Seçtiğiniz zaman bir tercihtir...` | Birçok yerde tekrar | Yalnız zaman adımında kısa uyarı |
| `Randevu talebi ekip teyidinden sonra kesinleşir` footer | Görev bağlamı dışında tekrar | Kaldır |
| `Tüm İş Örneklerini İncele →` | Gereksiz büyük harf ve manuel ok | `Tüm işleri gör` + ikon |

Metin kalite kapıları:

- Hero H1 en fazla 8-10 kelime hedefi.
- Hero lead en fazla iki kısa cümle ve 120 karakter hedefi.
- Her seçim açıklaması mobilde iki satırı aşmaz.
- Aynı teyit mesajı başarı ekranı dışında görev boyunca en fazla bir kez görünür.
- CTA adları kanal değil sonuç söyler; WhatsApp alternatifi kanalın gerekli olduğu yerde belirtilir.
- Görsel arayüzü anlatan `buradaki kartlar...`, `aşağıdaki form...` türü metinler kaldırılır.

## 31. Data Visualization, ölçüm ve doğrulama planı

### 31.1 Müşteri arayüzü veri gösterimi

- Müsaitlikte günler ortak hizada ve aynı ölçekte gösterilir.
- Durum karşılaştırması için renk yanında metin/check/çizgi kullanılır.
- Yoğunluk veya popülerlik gösterilmeyecekse dekoratif heatmap kullanılmaz.
- Fiyatlar aynı tipografik hizada ve aynı para formatında sunulur.
- Stepper yalnız ilerlemeyi gösterir; yüzde veya sahte tamamlanma hissi üretmez.

### 31.2 Admin ölçüm görselleştirmesi

Cleveland ve McGill'in graphical-perception bulguları doğrultusunda kesin karşılaştırmalarda ortak ölçek üzerindeki konum ve uzunluk; alan, açı ve hacimden önce tercih edilir.

- Funnel: sayı + oran; aşamalar sabit sıra.
- Kanal dönüşümü: ortak sıfır eksenli yatay bar.
- Hizmet onay oranı: sıralı dot plot/bar; `n` görünür.
- Gün/saat yoğunluğu: yalnız yeterli örneklemde heatmap; legend ve sayı tooltip'i.
- Süre: medyan + P75 + örneklem; ortalama tek başına kullanılmaz.
- Renk: marka bakırı veri serilerinde varsayılan değil; semantik ve erişilebilir kategori paleti.
- Düşük örneklem: soluk grafik değil, `Yeterli veri yok (n<...)` mesajı.

### 31.3 Design Thinking doğrulama döngüsü

1. **Empathize:** 5-8 müşteriyle mobil görev; en az iki 50+ veya düşük dijital yetkinlik profili.
2. **Define:** `Premium görünmüyor` ifadesini ölçülebilir alt problemlere ayır: güven, marka hatırlama, görsel tutarlılık, görev netliği.
3. **Ideate:** En az üç düşük sadakatli yön: mevcut iyileştirme, Quiet Craft light, daha koyu workshop yönü.
4. **Prototype:** Önce hero/nav/wizard ilk adımını Figma veya local prototype olarak üret.
5. **Test:** Estetik beğeni ile görev başarısını ayrı ölç. Kullanıcı "güzel" dese bile tereddüt, yanlış tıklama ve süre izlenir.
6. **Implement:** Kazanan yön token ve component seviyesinde uygulanır; sayfa bazlı istisna biriktirilmez.

### 31.4 Deney ve kabul kriterleri

| Boyut | Ölçüm | Hedef/karar kapısı |
| --- | --- | --- |
| İlk görev netliği | 5 saniye testi | Katılımcıların >=%80'i yapılacak işi ve bölgeyi doğru söyler |
| CTA hiyerarşisi | İlk tıklama | Ana senaryoda yanlış kanal seçimi <=%10 |
| Seçim yükü | İlk iş türü süresi | Medyan <=12 sn; P75 <=20 sn hipotezi |
| Görev başarısı | Talep akışı | Yardımsız >=%90 |
| Algılanan kolaylık | SEQ | Medyan >=5.5/7 |
| Mental demand | NASA-TLX alt ölçek | Baseline'a göre düşüş; mutlak eşik iddiası yok |
| Premium algı | 5 sıfatlı semantic differential | `özenli`, `güvenilir`, `ustalıklı` artar; `yapay`, `kalabalık` azalır |
| Marka hatırlama | Gecikmeli recall | U/metal işçiliği bağlantısı kuruluyor |
| Tekrar | İlk viewport envanteri | 1 primary, 1 secondary; aynı aksiyon eşzamanlı tekrar etmez |
| Erişilebilirlik | WCAG/E2E | P0 sorun yok; focus, target, reflow geçer |
| Performans | Lighthouse/RUM | LCP mimari iş paketi ayrı; görsel iyileştirme gerileme yaratmaz |

Premium yönün başarısı yalnız "daha şık" geri bildirimiyle kabul edilmez. Görev başarısı korunmazsa veya ilk seçim süresi artarsa görsel yön revize edilir.

## 32. Kaynaklar

- [Plerdy Website Checklists Hub](https://www.plerdy.com/check/)
- [Plerdy Local Service Website Leak Checklist](https://www.plerdy.com/local-service-website-money-leak-checklist/)
- [Plerdy Website Usability Checklist](https://www.plerdy.com/usability-testing-website-checklist/)
- [Plerdy UX & Usability Testing rehberi](https://www.plerdy.com/blog/plerdy-ux-usability-testing-how-to-use-it/)
- [Plerdy Website Conversion Rate Checklist](https://www.plerdy.com/conversion-boosting-ideas-for-your-website/)
- [Plerdy Website Content Checklist](https://www.plerdy.com/website-content-checklist/)
- [Hick, On the Rate of Gain of Information](https://doi.org/10.1080/17470215208416600)
- [Hyman, Stimulus Information as a Determinant of Reaction Time](https://pubmed.ncbi.nlm.nih.gov/13052851/)
- [Scheibehenne, Greifeneder, Todd - Choice Overload Meta-analysis](https://ideas.repec.org/a/oup/jconrs/v37y2010i3p409-425.html)
- [Cowan - The Magical Number 4 in Short-Term Memory](https://pubmed.ncbi.nlm.nih.gov/11515286/)
- [Reber, Schwarz, Winkielman - Processing Fluency and Aesthetic Pleasure](https://journals.sagepub.com/doi/10.1207/s15327957pspr0804_3)
- [Springer & Whittaker - Progressive Disclosure](https://doi.org/10.1145/3374218)
- [Munzner - Nested Model for Visualization Design and Validation](https://www.cs.ubc.ca/labs/imager/tr/2009/NestedModel/)
- [Cleveland & McGill - Graphical Perception](https://www.tandfonline.com/doi/abs/10.1080/01621459.1984.10478080)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [W3C - Understanding Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)
- [W3C - Understanding Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)
- [W3C - Understanding Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)
- [W3C COGA - Clear and Understandable Content](https://www.w3.org/WAI/WCAG2/supplemental/objectives/o3-clear-content/)
- [NASA Task Load Index](https://www.nasa.gov/human-systems-integration-division/nasa-task-load-index-tlx/)
- [NASA-TLX Paper and Pencil Package](https://ntrs.nasa.gov/archive/nasa/casi.ntrs.nasa.gov/20000021488.pdf)
- [ACM Survey on Measuring Cognitive Workload in HCI](https://doi.org/10.1145/3582272)
- [GOV.UK Service Manual - Structuring Forms](https://www.gov.uk/service-manual/design/form-structure)
- [Reinecke et al. - Visual Complexity, Colorfulness and First Impressions](https://doi.org/10.1145/2470654.2481281)
- [IDEO.org - Human-Centered Design](https://www.designkit.org/human-centered-design.html)
- [Stanford d.school - Design Thinking Bootleg](https://dschool.stanford.edu/tools/design-thinking-bootleg)
- [Vitsœ](https://www.vitsoe.com/)
- [Gaggenau Company Profile](https://www.gaggenau.com/press/company-profile)
- [Buster + Punch - Behind the Design](https://uk.busterandpunch.com/es/pages/behind-the-design)

## 33. Yerel çalışma ilkesi

Bu araştırma ve takip eden sprintler yalnız local çalışma alanında yürütülür. Git commit/push, Vercel deploy, canlı alan adı değişikliği ve production release kullanıcıdan ayrı ve açık onay gelmeden yapılmaz.
