# Orkestra: süreklilik, bilişsel yük ve özgün keşif

27 Ekim 2026. Araştırma ve karar belgesi; üretim kodu değişikliği değildir.

## Kısa teşhis

Önceki A/B çalışması görsel kompozisyon denemesiydi; ürünün keşiften hizmete geçişini yeniden tasarlamadı. Sütun sayısını ve hero sınırını değiştirmenin tek başına yenilik sayılmaması haklı bir eleştiri. A'yı nihai çözüm olarak kapatmıyoruz.

Bugünkü tasarımda arama, fotoğraf, usta, ilçe ve hizmetler yan yana bulunuyor; fakat fotoğrafta beğenilen şeyin bir talebe nasıl dönüşeceği kompozisyon kadar açık değil. Özgünlük için bu ilişkiyi görünür kılmak, yeni dekorasyon eklemekten daha değerli bir hipotez.

## Kanıt sınırı

- Codex bu tur Hallmark Garden, Loom, Vellum, Atelier ve Formwork ekranlarını dosyadan açtı.
- Mevcut Orkestra referansı önceki turun `landing-hallmark-v2/after-1440.png` ekranıdır; canlı sitenin bugün aynı olduğuna dair yeni doğrulama yoktur.
- Upwork, Thumbtack, Porch, Bark ve LawnStarter değerlendirmeleri konuşmaya eklediğin ekranlara dayanır. Bunlar sitelerin bütün akışlarının veya bugünkü sürümlerinin incelemesi değildir.
- Master rapor, social-marketplace-benchmarks ve luxury-and-digital-benchmarks mevcut checkout'ta bulunamadı. İki diğer worktree'nin araştırma klasörlerinde de hedef raporlar bulunamadı. Geçici ekran görüntüsü dosyaları artık o yollarda değil. Arşivin tamamı incelendi iddiası yoktur.
- Mevcut DESIGN-ROUTE.md eski kobalt eylem ve farklı logo kararı taşıyor. Bu, güncel yeşil eylem kararını değiştirmek için dayanak değildir.
- Hallmark'ın yerel sürümünde48 tema görseli var. Bu tur5 görsel incelendi;48'inin incelendiği iddia edilmiyor.

## “Continuous border” gözlemini nasıl yorumluyoruz?

Bu ifadeyi yeni bir standart adı gibi değil, kesintisiz ana zemin ve daha az kutu sınırı isteği olarak yorumluyoruz. Üç ayrı sınır türü var:

1. **Dekoratif sınır:** Her bölümü ayrı radius, gölge ve çerçeveyle kapatmak. Büyük ölçüde azaltılabilir.
2. **Anlamsal sınır:** Başlığın altındaki içeriğe yakınlığı, kartlar arası mesafe, tipografik hiyerarşi. Korunmalı; aksi halde kullanıcı hangi bilginin hangi işe ait olduğunu çözmek zorunda kalır.
3. **Etkileşim sınırı:** Arama kutusu, seçili filtre, klavye odağı ve hata alanı. Açık olmalı.

Lüks görünümün kaynağı sınırların yokluğu değil, hangi sınırın ne iş yaptığıdır. Görsel süreklilik ile görev sürekliliği de farklıdır: bir sayfa kusursuz akarken kullanıcının seçtiği kategori wizard'da kaybolabilir. Orkestra için her ikisi gerekli.

## Ekranlardan tek tek çıkarımlar

| Kaynak | Ekranda doğrudan görülen | Alınabilecek fikir | Taşımayacağımız unsur / risk |
|---|---|---|---|
| Garden | Aynı açık zeminde metin/fotoğraf; alt bölümde çizgili liste; daha sonra koyu bant | Boşlukla grupla, sadece gerektiğinde ton değiştir | Koyu bant ve serif otomatik premium reçetesi değil |
| Loom | Tam genişlik işçilik fotoğrafı; sonra açık zeminde teslim süreci tablosu | Fotoğrafın gösterdiği işle sonraki karar arasında bağ kur | Dev hero ve süreç tablosunu veri olmadan kopyalamak |
| Vellum | Fotoğraf üstünde belirgin açık panel; mavi bölümde sipariş seçimi | Tanıtımdan aynı nesneye ait eyleme geçiş | “Premium'da sınır olmaz” fikrine karşı örnek; renkler taşınmaz |
| Atelier | Dört fiziksel örnek görseli, ürüne bağlı kısa etiket ve sonraki ürüne geçiş | Hizmet kategorisini soyut emoji yerine anlamlı iş örneğiyle anlat | Dekoratif örneklerin kullanıcıya yeni bir sembol dili öğretmesi |
| Formwork | Sert siyah panel, turuncu ana eylem, iki kullanıcı türü için belirgin kutular | Rol ayrımını ürün gereği olduğunda görünür kıl | Sert endüstriyel dili ev hizmetlerinin tümüne dayatmak |
| Upwork, kullanıcı ekranı | İnsan portreleri merkezi teklif etrafında; tek ana CTA; aşağıda üç güven gerekçesi | Ustanın hizmetin faili olduğunu görünür kıl | Çok sayıda yüzen avatar ve uzun orta metin bizim sosyal keşfi geciktirir |
| Thumbtack, kullanıcı ekranı | Ev fotoğrafı, hizmet ve konum araması, eyleme yakın gizlilik açıklaması | Hizmet niyetini anlaşılır bir sonraki adıma bağla | İlk ekranı kaplayan görsel ve yüksek metrikler yeni platforma kopyalanamaz |
| Porch, kullanıcı ekranı | Sigorta vaadi, adres, uygunluk eylemi, üç fayda | Eylem sonucunu açık söyle | Bu ekran hizmet pazaryerinden çok sigorta ürünüdür; doğrudan akış benchmark'ı değildir |
| Bark, kullanıcı ekranı | Kısa vaat, hizmet+posta kodu, örnek hizmetler; aşağıda görsel seçenekler | Arama ve görsel keşfi birlikte sun | Sağlayıcı katılım butonunun müşterinin aramasından daha dikkat çekmesi |
| LawnStarter, kullanıcı ekranı | Tek hizmet, adres girişi, fiyat odaklı turuncu eylem, yorumlar | Butonun sonucunu somutlaştır | Orkestra'da hesaplanmayan “anında fiyat” vaadi ve yorum duvarı |

### Mevcut A/B denemelerindeki eksikler

- A: eşit fotoğrafları büyütüyor, ama “bu işi ben de istiyorum” bağlantısını yeterince kurmuyor.
- B: görsel hiyerarşi kuruyor; neden bu işin büyük olduğunu açıklayan içerik politikası yok.
- İkisinde de mevcut kategorileri dropdown'a almak keşfedilebilirlik bakımından gerileme olabilir. Sayfayı temizlemek amacıyla sık kullanılan kontrolleri saklamak doğru değil.
- Örnekler pasif metne dönüştüğünde kullanıcı için başlangıç ipucu kalır ama eylem kısayolu kaybolur.
- Alt hizmet ve bölge seçenekleri footer benzeri alana indirgenmiş. İşletimsel rotalara gerçek bağ kurulmadan final tasarım sayılmazlar.

## Bilişsel yük: azaltılacak şey bilgi miktarından önce belirsizlik

Üç soruyu izleriz: Nereye başlayacağım? Tıklayınca ne olacak? Önceki seçimimi yeniden anlatacak mıyım?

- İlk görünümde birincil görev hizmet arama; ikincil yol görsel keşif. Kullanıcı önce “mod” seçmek zorunda kalmaz.
- Kategori seçenekleri keşif başlığının yanında görünür kalır. Gelişmiş filtreler istek üzerine açılır.
- İş kartında fotoğraf, iş adı, yapan kişi ve kaydetme bulunur. Fiyat, puan, rozet, tarih, ilçe, beğeni ve yorum sayısını aynı kartta yığmayız.
- Kartın detayı kapsam ve “Benzerini yaptır” eylemini gösterir. Temsili örnek gerçek iş kanıtı gibi sunulmaz.
- Usta arama aşamasında bölge görünür ve değiştirilebilir olur; alan dışı kullanıcılar boş talep akışına sürüklenmez. Konumu tamamen sona saklamak önerilmez.
- Wizard'a geçişte referans ve kategori korunur; görselden otomatik ölçü, fiyat veya iş kapsamı çıkarılmış gibi davranılmaz.
- Hata, geri dönüş, yüklenme ve boş sonuç, normal durumla aynı yerleşim mantığını korur.

NN/G'nin yakınlık ilkesi, ilişkili bilgilerin yakın ve grupların birbirinden ayrılmış olmasını destekler. Kademeli açıklama sık kullanılan eylemleri saklamak için gerekçe değildir. Kaynaklar: [Yakınlık](https://www.nngroup.com/articles/gestalt-proximity/), [Progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/), [Formlarda bilişsel yük](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/).

## Daha özgün üç ürün/tasarım yönü

### 1. İş örneğinden talebe devam eden keşif

Akış: fotoğraf → iş detayı → “Benzerini yaptır” → referansı gösteren mevcut wizard.

Fotoğraf vitrin dekoru olmaktan çıkar, kullanıcının ne istediğini anlatan bir başlangıca dönüşür. Landing'e daha fazla kontrol eklemek gerekmez. Büyük bir yeni panel yerine detayda seçili fotoğraf, kısa kapsam ve tek ana eylem kullanılır.

Gereken veri: örnek iş kimliği, gerçek/temsili durumu, hizmet eşlemesi, görsel kullanım hakkı. Wizard'a aktarım açıkça gösterilir ve çıkarılabilir. Aynı ustaya yönlendirme ile benzer hizmet talebi karıştırılmaz.

Risk: fotoğraftaki her şeyin teklif kapsamına dahil sanılması. Kullanıcı kendi ihtiyacını doğrular; görsel ilham olduğu açıklanır. Başarı: referanslı akışta kategori yeniden seçimi ve yanlış hizmet seçimi azalıyor mu? Henüz ölçülmedi.

### 2. Tek keşif yüzeyi, niyete göre değişen içerik

Arama ve kategori seçimi yeni, kopuk landing bölümleri açmak yerine aynı keşif alanını yönlendirir. “Montaj” seçince seçili durum görünür; ilgili örnekler ve kapsam aynı yerde güncellenir. Bölge usta sonucuna geçişte bağlamın parçasıdır.

Hallmark Ecosystem Index'ten alınan fikir, içerik üzerinde farklı bakışlar sunmak. Ancak tüm yatay rafları, popüler/son/yakın/öne çıkan bölümlerini aynı anda çoğaltmak reddediliyor. İki veya üç yeni menüyle arayüzü öğretmek zorunda kalmamalıyız.

Risk: görünümün neden değiştiği anlaşılmazsa süreklilik kaybolur. Seçili kategori, sonuç başlığı, geri alma ve boş sonuç açıklaması şart. Arama gerçek usta listesine götürüyorsa keşif filtrelemesiyle aynı eylemmiş gibi gösterilmez.

### 3. İsteğe bağlı iş referansı koleksiyonu

Kaydedilen birkaç örnek, daha sonra kullanıcı isterse bir işe referans yapılabilir. Zorunlu onboarding, puan, streak, sürekli açılan çekmece veya otomatik hesap duvarı yok.

Yenilik, bir “kaydet” ikonunun biriktirdiği değeri talebe bağlamakta. Her kaydetmede ekranın düzenini değiştirmeyiz. Kullanıcı koleksiyonuna normal gezinmeden erişir.

Risk: farklı işler tek kapsam sanılabilir; koleksiyondan talebe aktarımda tek hizmet ve seçili referanslar doğrulanır. Kayıt/senkronizasyon modeli netleşmeden kalıcılık sözü verilmez. Bu nedenle ilk uygulama değil, sonraki araştırma dilimi.

## Görsel dil için önerilen yeni brief

Sakin, kesintisiz zemin üzerinde işin kendisini öne çıkaran sosyal hizmet keşfi. Yeşil eylem, mavi marka; centered image search kararı korunur. Tasarım farklılığı yalnız grid oranından değil, fotoğrafın görevle bağından gelir.

- Hero ile keşif arasında kalın çerçeve yok; boşluk ve hizalama ritmi var. Fotoğraf geçişi okunurluk testine bağlı.
- Kartın çevresinde kapsayıcı gölge yok. Fotoğraf, başlık ve usta aynı hizaya oturur. Kaydetme görünür44px hedefte kalır.
- Arama dolu yeşil ana eylem; keşif bağlantıları daha düşük ağırlıkta; yalnız modal bağlamında benzer iş talebi ana eylem olur.
- Yeni rastgele radius ailesi yok. Buton şekli eylem önceliğinin yerine geçmez.
- Ürünle ilişkili fotoğraf öncelikli. Yeni soyut3D dekor eklemek yenilik çözümü sayılmaz.
- Önce/sonra karşılaştırması ancak aynı gerçek işe ait izinli fotoğraf çifti varsa eklenir; temsili iki fotoğraf sonuç kanıtı olarak eşleştirilmez.

## Test planı: varsayımları karar gibi sunmamak

Mevcut ekran ile yeni akış aynı görev ve içerikle karşılaştırılmalı. Başlangıç için küçük biçimlendirici kullanıcı oturumları yeterli olabilir; dönüşüm artışı iddiası için ayrıca uygun örneklem gerekir.

| Görev | İzlenecek işaret |
|---|---|
| Musluk arızası için başla | İlk doğru eylem, yanlış kategori, tereddüt |
| Fotoğraftakine benzer raf yaptır | Detaydan talebe geçişin anlaşılması |
| Bir fikri kaydet, sonra dön | Kaydetme anlamı ve tekrar bulma |
| İlçe kapsamını kontrol et | Kapsamın erken anlaşılması, boşa akışa giriş |
| Montaj örneklerini filtrele | Seçili durumun ve geri almanın anlaşılması |
| Wizard'dan keşfe geri dön | Referans ve seçimin korunması |
| Klavyeyle detay aç/kapat | Odak görünürlüğü, Escape, odak dönüşü |
|320px dar ekranda kullan | Taşma, eksik eylem, yanlış dokunma |

Başarı ölçütü yalnız daha az tıklama değil; doğru görev tamamlama, daha az geri dönüş ve kullanıcının bir sonraki adımı açıklayabilmesidir. Henüz kullanıcı verisi yok; bilişsel yükün yüzde azaldığı iddia edilmiyor.

## Görsel kanıt sayfaları

Aşağıdakiler Hallmark'ın yerel örnek tasarımlarıdır; gerçek rakip dönüşüm verisi veya premium marka arşivi değildir.

### Garden: süreklilik içinde bilgi grupları
![Garden referansı](../../../.codex/skills/hallmark/references/themes/garden.jpg)

### Loom: görselden süreç bilgisine geçiş
![Loom referansı](../../../.codex/skills/hallmark/references/themes/loom.jpg)

### Vellum: belirgin panel ve eylem odaklı alt yüzey
![Vellum referansı](../../../.codex/skills/hallmark/references/themes/vellum.jpg)

### Atelier: nesneye bağlı gezinme
![Atelier referansı](../../../.codex/skills/hallmark/references/themes/atelier.jpg)

### Formwork: açık sınırların bilinçli kullanımı
![Formwork referansı](../../../.codex/skills/hallmark/references/themes/formwork.jpg)

## Gemini ile ikinci araştırma tartışması

[Gemini High'ın ilk bağımsız yanıtı](gemini-innovation-review.txt). Gemini belirtilen dört görseli native araçlarıyla açtığını raporladı. Yanıtındaki ayrıntılar kaynaklarla karşılaştırıldı; metin kusursuz kabul edilmedi. Codex beş Hallmark görselini ayrıca doğrudan görüntüledi.

| Gemini görüşü | Codex değerlendirmesi | Karar |
|---|---|---|
| A/B yalnız grid değişimi düzeyinde kalıyor | Ürünün geçiş mantığı çözülmediği için büyük ölçüde katılıyorum | A/B final çözüm değil |
| Onarım ve ilham için iki ayrı akış | Aynı hizmet iki niyete de hizmet edebilir; yeni ikili karar yükü doğurur | Zorunlu ayrımı reddet |
| Kapsam köprüsü | Mevcut detay zaten bunun yeri; ikinci panel wizard'ı çoğaltır | Mevcut detayda kapsam ve tek geçiş eylemi |
| Canlı müsaitlik çizelgesi | Gerçek/güncel takvim verisi gerekli; şu anda kanıt yok | Şimdilik ertele |
| İlçeyi tamamen gizleme | Kullanıcı hizmet kapsamını erken anlamalı | Hizmet bölgesi ve usta adresini ayır; kapsamı görünür tut |
| Kaydedilenleri proje taslağına bağlama | Faydalı olabilir; farklı hizmetleri otomatik birleştirme | İsteğe bağlı, sonraki aşama |

**Düzeltilen doğruluk sorunları:** Garden'daki22 seriflidir; Gemini “serifsiz” dedi.15dakika/45dakika iş süresi, %75/%40 ret eşikleri için veri verilmedi. “Yanlış kategori sürtünmesini tamamen sıfırlar” iddiası desteklenmiyor. Bunlar tasarım şartnamesine alınmadı. İki modelin aynı görüşe gelmesi kullanıcı kanıtı değildir.

Codex'in geribildirimi Gemini'ye ikinci kez gönderildi: yeni panel yerine mevcut detayı güçlendirme; onarım/ilham ikiliğini zorlamama; sahte süre/fiyat/takvim göstermeme; koleksiyondan talebe kontrollü geçiş. Son yanıt ayrı dosyada tutulacaktır.

### Son yanıt ve nihai sentez

[Gemini'nin ikinci yanıtı](gemini-innovation-rebuttal.txt) hatalı süreleri, yüzdeleri, serif yorumunu ve sıfır sürtünme iddiasını açıkça geri çekti. Yeni ikili akış ve ek ön-panel önerisini bıraktı; mevcut detay üzerinden tek talep geçişinde uzlaşıldı.

Codex son yanıttaki üç ayrıntıyı yine otomatik kabul etmiyor:

- “Sabit alt buton” varsayılan olmayacak. Özellikle mobilde içerik/klavye çakışması test edilmeden sticky eklenmez.
- Kaydetme fotoğrafın üzerinde olmak zorunda değil. Mevcut metadata yanındaki44px kontrol fotoğrafı kirletmeden bağımsız eylem sağlar; görünür kalır.
- “Sessiz bağlam aktarımı” kullanıcıdan gizli aktarım değildir. Wizard ilk adımında referans küçük görseli, hizmet ve kaldır/değiştir eylemi görünür olmalıdır.

### Sonraki tasarım denemesi için somut yerleşim

1. Mevcut başlık ve görselli arama tek ana sahnede kalır; dış panel sınırı azaltılır. Düğme ve girdi sınırları korunur.
2. İlk keşif satırı sahnenin doğal devamında başlar; kategori kontrolü gizlenmez. Mobilde başlık, arama ve en az keşfin başlangıcını görebilmek hedeflenir; kesin yükseklik cihaz testinde belirlenir.
3. Fotoğrafın altındaki tek kısa satır işi; ikinci satır yapan kişiyi veya “temsili örnek” durumunu tanımlar. Kaydetme aynı grubun sağındadır. Gölge/border koleksiyonu yerine hizalama kullanılır.
4. İş detayı masaüstünde fotoğraf ve kapsamı yan yana, mobilde ardışık gösterir. Bu bir ikinci wizard değildir. Ana eylem “Benzerini yaptır”; gerçek sağlayıcıya özel talep varsa bunun ayrı anlamı açık yazılır.
5. Wizard'a geçişte seçilen referans görünür kalır; geri dönüş keşifteki kategori ve kaydırma konumunu korumayı hedefler.

Bu, uygulama yapılmış bir akış değildir; yeni tasarım brief'idir. Önce bu geçişin düşük ayrıntılı prototipi, ardından görsel kaplama ve kullanıcı görevleriyle doğrulama yapılmalıdır. Eksik sosyal/lüks arşiv elde edildiğinde aynı gözlem/çıkarım/karar matrisiyle eklenmeli; yeni bulgular bu yönü değiştirebilmelidir.
