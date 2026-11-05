# Orkestra Landing Page: Salt Görsel Estetik Denetim Raporu
**Tarih:** 27 Ekim 2026  
**Kapsam:** Salt görsel kanıtlara dayalı salt-okunur (read-only) estetik denetim. Yeni özellik, buton, akış veya rozet ekleme önerilmemiştir; piksel ölçümleri, CLS veya hover durumları görsel kanıt dışından uydurulmamıştır.

---

### Yüklenen Görsel Kanıtlar ve Hata Bildirimi
1. **Mevcut Durum:**
   - `docs/design/landing-aesthetic-audit-2026-10-27/evidence/current/live-1440.png` (Masaüstü — Başarıyla yüklendi ve incelendi)
   - `docs/design/landing-aesthetic-audit-2026-10-27/evidence/current/live-390.png` (Mobil — Başarıyla yüklendi ve incelendi)
2. **Hallmark Referans Tabloları:**
   - `contact-sheets/hallmark-01.jpg` (H01 almanac – H06 broadside)
   - `contact-sheets/hallmark-02.jpg` (H07 brutal – H12 darkroom)
   - `contact-sheets/hallmark-03.jpg` (H13 dose – H18 garden)
   - `contact-sheets/hallmark-04.jpg` (H19 grid – H24 kiln)
   - `contact-sheets/hallmark-05.jpg` (H25 loom – H30 overprint)
   - `contact-sheets/hallmark-06.jpg` (H31 pasteup – H36 solstice)
   - `contact-sheets/hallmark-07.jpg` (H37 specimen – H42 studio)
   - `contact-sheets/hallmark-08.jpg` (H43 terminal – H48 werkstatt)  
   *(Toplam 48 adet etiketli bağımsız görsel referans eksiksiz incelendi).*
3. **Benchmark Referans Tabloları:**
   - `contact-sheets/benchmark-01.jpg` (B01 linear, B02 stripe, B03 apple)
   - `contact-sheets/benchmark-02.jpg` (B04 vercel, B05 airbnb, B06 zara)
   - `contact-sheets/benchmark-03.jpg` (B07 massimodutti, B08 cos, B09 mango)
   - `contact-sheets/benchmark-04.jpg` (B10 beymen, B11 taskrabbit, B12 armut)
   - `contact-sheets/benchmark-05.jpg` (B13 thumbtack, B14 mybuilder, B15 airtasker)
4. **Görsel Kanıt Kusuru / Hata Kaydı:**
   - **B14 mybuilder:** Ekran görüntüsünde hedef landing page yerine Cloudflare güvenlik doğrulama arayüzü (*"Performing security verification"*) yer almaktadır. Bu referans estetik kıyaslamaya dahil edilmemiş, veri hatası olarak kayda geçirilmiştir.

---

### 1. Mevcut Tasarımda Gözlemlenen Estetik Başarısızlıklar

Mevcut canlı ekranlar (`live-1440` ve `live-390`), Ankara'nın zanaat ve mimari dokusunu yansıtmak yerine, 2018 model SaaS şablonları ile genel ilan panoları arasında sıkışmış bir kimlik krizi sergilemektedir:

1. **Görsel Kirlilik ve Ucuz Dashboard Klişesi (Harf Avatarları):** Kartların tamamında ustalar için kullanılan siyah daire içi tek harfli avatarlar (*"M" Murat Usta, "S" Selim Usta, "D" Derya Usta*), ürünün "özenle seçilmiş usta sicili" iddiasını anında yok etmekte; ürünü kimliksiz bir yönetim paneli veya müşteri destek yazılımı seviyesine düşürmektedir.
2. **Hero Bölümündeki Çamurlu Katmanlaşma:** Arka planda flulaştırılmış, kontrastı ezilmiş iç mekân görseli üzerine oturtulan arama kutusu ve altındaki dört adet soluk bej hap buton (*"Hızlı Teşhis..."*), görsel olarak zemine batmakta ve kirli bir leke etkisi yaratmaktadır.
3. **Hiyerarşisiz ve Ritimden Yoksun Kart Düzeni:** Masonry taklidi olarak kurgulanan asimetrik yerleşim (sol tarafta devasa raf montajı kartı, sağda üst üste ezilmiş batarya ve boya kartları, altta üçlü kolon), editoryal bir hiyerarşi oluşturmak yerine sayfayı dengesiz bir biçimde sola doğru devirmektedir.
4. **Kart İçi Veri Sunumunun Bürokratik Katılığı:** Kart altlarındaki teknik bilgiler (*"MALZEME: 40mm Masif Meşe", "BAĞLANTI: Gizli Çelik Ankraj"*), tipografik bir incelikten yoksun, büyük harfli, kuru birer form hücresi gibi dizilmiştir.
5. **Kutu İçinde Kutu Enflasyonu (Bölgesel Zanaat Alanı):** "Ankara Konut Dokusu" bölümünde yer alan dört büyük kart ve içlerindeki gri buton dizilimleri (*"Çankaya →", "Gölbaşı → Etimesgut →"*), sayfayı zanaat rehberinden çıkarıp belediye toplu taşıma hat haritasına çevirmektedir.
6. **Protokol Bölümünün Monolitik Ağırlığı:** "Zanaat ve Nezaket Protokolü"nde sol tarafa yerleştirilen devasa koyu lacivert kutu (*"07 BAĞLAYICI İLKE"*), sağdaki 7 maddelik zarif liste ile orantısız bir görsel zıtlık kurmakta; bir atölye manifestosu değil, banka kredi sözleşmesi soğukluğu vermektedir.
7. **Mobil Kompozisyon Boğulması (`live-390`):** Masaüstündeki dengesizlikler mobilde tek bir dikey kuyuya dönüşmüştür. Kategori filtrelerinin sağdan `>` oku ile kırpılması ve ilçe butonlarının dikeyde yığılması arayüzü hantal bir mobil forma indirgemiştir.

---

### 2. İsimlendirilmiş Referanslara Dayalı 10 Güçlü Görsel Karar

Tasarımı ucuz kurumsal şablon hissiyatından çıkarıp üst düzey bir zanaat siciline dönüştürecek 10 temel görsel yönlendirme:

1. **Editoryal Tipografi Disiplini (*H15 editorial, H29 newsprint, H37 specimen*):**  
   Hero ve bölüm başlıklarında mevcut jenerik sans-serif yerine, yüksek kontrastlı, oturaklı ve orantılı bir editoryal display serif font ailesine geçilmelidir. Başlık ile gövde metni arasındaki punto ve ağırlık kontrastı netleştirilmelidir.
2. **Harf Avatarlarının Koşulsuz Tasfiyesi (*H44 terrazzo, H25 loom, B08 cos*):**  
   Siyah yuvarlak içindeki ucuz "M", "S", "D" harf damgaları tamamen kaldırılmalıdır. Usta bilgisi, kart üzerinde tipografik bir üst-başlık veya editoryal imza satırı olarak (*"Murat Usta — Çankaya, Masif Ahşap"* şeklinde) tek satırda ve rafine bir aralıkla sunulmalıdır.
3. **Hap (Pill) Butonların Yerine Metin Sekmeleri (*H15 editorial, H29 newsprint, B08 cos*):**  
   Kategori seçimindeki ("Tümü, Montaj, Tesisat...") siyah ve gri çerçeveli hap butonlar kaldırılmalı; H15 ve H29'daki gibi yalın, alt çizgili veya sakin nokta işaretli editoryal metin sekmelerine dönüştürülmelidir.
4. **Sakin ve Monokrom Malzeme Zemini (*H03 atelier, H18 garden, H44 terrazzo*):**  
   Soğuk hastane beyazı zemin ve çamurlu bej degradeler yerine; kireç, yontulmuş taş ve ham keten hissi veren tekil, mat ve bütüncül bir arka plan tonu seçilmelidir.
5. **Bölge Dağılımının Tablosal/Dizin Mimarisi (*H01 almanac, H23 ink, H44 terrazzo*):**  
   "Bölge 01, 02..." şeklindeki 4 adet kaba çerçeveli kart ve içlerindeki küçük buton yığınları kaldırılmalıdır. Ankara'nın semt ve mimari dönemleri, H01 almanac ve H44 terrazzo'daki gibi hairline çizgilerle ayrılmış zarif bir kütük/envanter indeksi şeklinde dizilmelidir.
6. **Laboratuvar ve Zanaat Çizelgesi Tipografisi (*H09 cobalt, H10 console, H17 furrow*):**  
   Kart altındaki teknik detaylar (*tolerans, malzeme, standart*), büyük harfli form etiketleri yerine monospaced veya hafif daraltılmış (condensed) mikro tipografi ile küçük punto ve zarif yatay aralıklarla yerleştirilmelidir.
7. **Protokolün Manifestoya / Nizamnameye Dönüştürülmesi (*H06 broadside, H27 manifesto, H48 werkstatt*):**  
   Sol taraftaki hantal lacivert kutu tamamen eritilmeli; 7 ilke, H48 werkstatt ve H06 broadside'daki gibi tipografik numaralandırma, dengeli sütun genişlikleri ve baskı zanaatı disipliniyle sayfaya doğrudan işlenmelidir.
8. **Malzeme ve Zanaat Odaklı Nesnel Fotoğrafçılık (*H16 formwork, H24 kiln, B07 massimodutti*):**  
   Hero arkasındaki flulaştırılmış belirsiz salon görseli yerine; H24 veya H16'daki gibi gerçek taş dokusunu, döküm pirinci, ahşap damarını veya zanaatkâr aletini gösteren yüksek kontrastlı, derinlikli tek bir odak fotoğrafı kullanılmalıdır.
9. **Monolitik ve Hemzemin Arama Çubuğu (*B01 linear, H42 studio, B05 airbnb*):**  
   Gölgesi havada asılı duran ve altında kirli bej etiketler taşıyan arama bloğu; zeminle bütünleşen, ince bir sınır çizgisiyle tanımlanmış, "Hızlı Teşhis" etiket kirliliğinden arındırılmış yalın bir yüzeye indirgenmelidir.
10. **Kart Köşelerinde Görsel Ağırlık Dengelemesi (*H03 atelier, H36 solstice, B03 apple*):**  
    Kartların üzerine havada yüzer gibi iliştirilmiş yer imi (bookmark) düğmeleri görsel karmaşayı artırmaktadır. Kart üzerindeki tüm ikonsal gürültü temizlenmeli, görsel ile tipografi arasındaki oran rahatlatılmalıdır.

---

### 3. Önceki Yüzeysel A/B Kolon Değişikliklerinin Eleştirisi

Daha önce önerilen veya denenmiş olan "3 kolondan 2 kolona geçiş" ya da "grid kolon genişliklerini yüzde oranlarıyla eşitleme" gibi yüzeysel A/B yaklaşımları temelde kusurludur:

- **Estetik Seviye Kolon Sayısıyla Belirlenmez:** Bir arayüzün "premium" veya "seçkin" algılanması, içeriklerin kaç sütuna bölündüğüyle değil; negatif alanın (whitespace) kalitesi, satır taban çizgisi ritmi (baseline grid), tipografik mikro hiyerarşi ve yüzey tonlamasıyla inşa edilir.
- **Biçimsel Kargaşa Kolon Değişimiyle Çözülemez:** Kötü harf avatarları, form doldurma hissi veren kaba meta etiketler ve ucuz hap butonlar 3 kolonda da çirkin durur, 2 kolonda da. Kolon sayısıyla oynamak, görsel hastalığı tedavi etmez; sadece dağınıklığın yönünü ve sıkışıklığını değiştirir.
- **Asimetrinin Yanlış Kullanımı:** Mevcut tasarım asimetriyi bir zanaat dengesi olarak değil, rastgele boyutlandırılmış kart yığını olarak kullanmıştır. Çözüm kolon matematiğinde değil, kompozisyonun editoryal ağırlık merkezindedir.

---

### 4. Sürekli Köşeler (Squircle) ile Kenarlıksız Yüzeylerin Ayrımı ve Arşiv Raporu Yanılgıları

Tasarım dokümantasyonlarında ve arşiv raporlarında sıklıkla yapılan iki temel teknik ve felsefi hatanın düzeltilmesi zorunludur:

#### A. Sürekli Eğrilik (Continuous Curvature / Squircle) vs. Basit Border-Radius
- CSS'teki standart `border-radius: 20px` tanımı bir **squircle değildir**.
- Standart `border-radius`, düz çizgiden dairesel yaya ani bir teğetsel geçiş yapar; eğriliğin türevi köşenin başladığı noktada aniden sıçrar (*tangent jerk*). Bu durum gözde köşelerin "kırıldığı" ve mekanik bir kutu olduğu hissini yaratır.
- Gerçek sürekli eğrilik (Apple ve otomotiv tasarımında kullanılan G2/G3 sürekliliği / Lamé eğrisi), eğriliğin kademeli olarak başladığı ve yarıçapın teğet boyunca değişkenlik gösterdiği organik bir yüzey akışıdır. Kodu veya görseli incelerken "20px verdik, dolayısıyla squircle oldu" iddiası görsel cehalettir.

#### B. Kenarlıksız Yüzeyler (Borderless Surfaces) ve Arşiv Raporu Safsatası
- Bazı arşiv raporlarında yer alan *"Tüm premium web siteleri kenarlıksızdır (borderless) ve bu garanti dönüşüm sağlar"* iddiası **somut görsel kanıtlarla çürütülmüştür ve tamamen reddedilmelidir**:
  - İncelenen en üst düzey referanslar olan **H01 almanac**, **H06 broadside**, **H15 editorial**, **H29 newsprint**, **H42 studio**, **H44 terrazzo** ve **B01 linear**; kenarlık kullanmaktan kaçınmamakta, tam aksine milimetrik 1px hairline çizgiler, cetvel hatları ve yapılandırılmış ızgaralar kullanmaktadır.
  - Kenarlık (border), acemi tasarımlarda bir içeriği hapsetmek için "kalkan" gibi kalın ve gereksiz kullanıldığında ucuzluk yaratır. Ancak zanaatkâr ve editoryal bir disiplinle uygulandığında, sayfaya mimari bir denge, saygınlık ve editoryal netlik kazandırır.
  - Dönüşüm veya prestij kenarlıksız olmakta değil; yüzey sınırlarının çizgiyle mi, yoksa ton farkıyla mı tanımlanacağının bilinçli seçilmesindedir.

---

### 5. On Lens (Ten-Lens) İncelemesi ve Görsel Çatışmalar

| Mercek (Lens) | Canlı Durum Gözlemi (`live-1440` / `live-390`) | Referans Zeminindeki Uyuşmazlık |
| :--- | :--- | :--- |
| **1. Sanat Yönetimi (Art Direction)** | Ankara zanaat kültürü vaat edilirken, gayrimenkul ve SaaS arayüzü kırması, ruhsuz bir genel düzen hakim. | *H03 atelier* ve *H25 loom* referanslarındaki malzeme ruhu, dürüstlük ve zanaat ağırlığı tamamen ıskalanmış. |
| **2. Tipografi (Typography)** | Sıradan bir grotesk sans-serif her yere gelişigüzel yayılmış. Başlıklar etkisiz, meta veriler kaba, kontrast sıfır. | *H37 specimen* ve *H15 editorial* dillerindeki hiyerarşik ağırlık, editoryal serif asaleti mevcut değil. |
| **3. Fotoğrafçılık (Photography)** | Hero'daki flu salon görseli yapay. Kartlardaki fotoğrafların ışık dengesi, odak derinliği ve renk sıcaklıkları birbiriyle uyumsuz. | *H16 formwork* ve *H24 kiln* serilerindeki nesnel, net ve dokuyu hissettiren zanaat fotoğrafçılığı eksik. |
| **4. Kompozisyon (Composition)** | Hero gereksiz yüksek, kart gridi sola çökmüş, alt protokol bloğu sağa çekilmiş; sayfada dengeleyici bir eksen yok. | *H19 grid* ve *H42 studio* örneklerindeki matematiksel ve oranlı sayfa dengesi kurulamamış. |
| **5. Marka Kimliği (Brand)** | "Orkestra" ismi armoni ve kusursuz uyum vadederken; logodaki soğuk geometrik simge ve sayfadaki dil sıradan bir ilan panosunu andırıyor. | *H48 werkstatt* veya *B07 massimodutti* referanslarındaki kurumsal ciddiyet ve zanaat prestiji hissedilmiyor. |
| **6. Kontroller & Butonlar (Controls)** | Hap butonlar, yuvarlak bookmark ikonları, siyah arama butonu ve zümrüt yeşili alt buton stil karmaşası yaratıyor. | *B01 linear* ve *H42 studio* kontrollerindeki monolitik, tek renk ailesine bağlı kontrol dili yok. |
| **7. Görsel Hiyerarşi (Visual Hierarchy)** | Sayfaya girildiğinde göz nereye odaklanacağını şaşırıyor: Başlık mı, arama kutusu mu, yeşil buton mu, dev raf görseli mi? | *H30 overprint* ve *H28 midnight* işlerindeki tek ve tartışmasız odak noktası ilkesi ihlal edilmiş. |
| **8. Mobil Uyarlama (Mobile)** | Masaüstündeki hatalar dikeyde uzatılarak kullanıcıya sonsuz ve tekdüze bir kaydırma çilesi sunulmuş. Filtreler ekrandan taşıyor. | *live-390*, *H47 wayfind* ve *B03 apple* ekranlarındaki kompakt, nefes alan ve ekran oranına saygılı ritimden yoksun. |
| **9. Erişilebilirlik (Accessibility)** | Soluk bej hap butonlar üzerindeki gri yazılar, hero zeminindeki beyaz metinler ve ilçe kartlarındaki silik oklar düşük kontrasta sahip. | *H06 broadside* ve *H27 manifesto* örneklerindeki okunaklı ve yüksek kontrastlı tipografik netlik yok. |
| **10. Görsel İtidal (Visual Restraint)** | "07 Bağlayıcı İlke" kutuları, parantez içi 2026 ibareleri, harf avatarları, yer imleri ile arayüzde gereksiz bir biçimsel israf var. | *B08 cos* ve *H44 terrazzo* referanslarındaki fazlalıklardan arındırılmış, vakur ve dingin yalınlık sağlanamamış. |

---

### 6. Eyleme Geçirilebilir Salt-Görsel Düzenleme Yönergesi
*(Hiçbir yeni buton, akış, CTA veya rozet eklenmeden uygulanacak biçimsel düzeltmeler):*

1. **Avatarları Yok Et:** Kartlardaki siyah zeminli "M", "S", "D" dairelerini tamamen kaldır. Usta ismini ve Ankara semtini kart tipografisinin içine ince editoryal bir satır olarak entegre et.
2. **Hero Katmanını Birleştir:** Arka plandaki silik görseli kaldır ya da tekil, yüksek kaliteli, derinlikli bir malzeme/atölye fotoğrafına odakla. Arama çubuğunu zeminle aynı düzleme indir, altındaki 4 adet çamurlu bej teşhis etiketini arındır.
3. **Tipografik Aileyi Yeniden Konumlandır:** Başlıklarda editoryal bir karaktere (H15/H29 benzeri serif displine) geç. Kart altındaki teknik özellikleri monospaced mikro-tipografiyle, büyük harf bağırması olmadan diz.
4. **Bölge ve İlçe Kartlarını Tabloya Dönüştür:** 4 adet kutu şeklindeki bölge kartını ve içlerindeki buton kümesini kaldır. Semt dağılımını H44 terrazzo benzeri 1px ince çizgilerle ayrılmış mimari bir fihrist tablosuna dönüştür.
5. **Protokolü Hafiflet:** Sol bloktaki devasa lacivert kutuyu kaldır. 7 maddeyi, sayfa genişliğine dengeli dağılmış, ince numaralandırmalara sahip bir manifesto nizamnamesi zarafetinde sun.
6. **Filtre Haplarını Sekmeye Çevir:** Kategorilerdeki kapsül butonları kaldır, düz metin ve zarif bir alt çizgiyle çalışan gazete sekmelerine dönüştür.
