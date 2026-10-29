# Orkestra kompozisyon değerlendirmesi

26 Ekim 2026. Bu çalışma üretim sayfasını değiştirmeyen tasarım alternatifleridir.

## Roller ve karar yöntemi

Codex: UX tasarım incelemesi, görev önceliği, mobil akış, iddia doğruluğu. Gemini 3.8 Flash High: UI referans incelemesi, kompozisyon önerileri ve prototip kod üretimi. Bunlar simüle edilmiş uzman rolleri; kullanıcı araştırması veya gerçek kullanıcı testi yerine geçmez.

Mevcut sayfa referansı: [önceki dilimin son hali](../landing-hallmark-v2/after-1440.png). Bu tasarım turunda “önce” budur. Önceki turun bulanık geliştirme görüntüleri yeni karşılaştırmaya temel alınmayacak.

## Codex'in ilk UX görüşü

Sorun, bölüm sayısından önce görsel ağırlığın dağılımı. Hero büyük ve kapalı bir panel; arama bu panelin içinde ikinci bir yüzey. Sonrasında tüm işler eşit büyüklükte sıralanıyor. Acil işi olan kişi için başlangıç anlaşılır; keşfe gelen kişi için ise ürün bir fotoğraf kataloğuna yakın görünüyor.

İki giriş niyeti korunmalı: ihtiyacını bilen kullanıcı arama yapar; fikre ihtiyacı olan fotoğraflardan başlar. Yeni bir açılış seçimi veya “hangi moddasınız” adımı eklenmemeli. Arama birincil, keşif hemen sonraki görünür içerik olmalı.

## Bölüm sınırları hipotezi

“Premium sitelerde belirgin sınır yok” evrensel bir kural değil. Hallmark gerçek markaların dönüşüm verisini sağlayan bir benchmark değil, tasarım referans kütüphanesidir.

Codex'in doğrudan incelediği yeni referanslar:

- **Loom:** büyük fotoğraf çerçevesiz; alt içerikte açık zemin geçişi ve tablo kuralları var. Kutusuz olmak, hiyerarşisiz olmak değil.
- **Vellum:** fotoğraf üzerinde belirgin açık panel ve aşağıda güçlü renk bandı var. Sınırların premium hissi zorunlu olarak bozmadığına karşı örnek.
- **Hedgerow:** aynı koyu zemin üzerinde süreklilik; listeyi düzenleyen ince çizgiler korunuyor.
- **Garden:** açık fotoğraf yerleşimi ve bol boşluk; bir sonraki bölümde koyu bant. Her şeyi kutuya almadan bölüm ayrımı yapılabiliyor.
- **Bloom:** zemine entegre ana sahne; araçların etrafında işlevsel yüzeyler var. Orkestra'ya dekoratif cihaz ve kabartma butonları taşınmamalı.

Çıkarım: bölüm kutularını azalt, etkileşim sınırlarını koru. Arama alanı, seçili kategori, hata ve klavye odağı kaybolmamalı. Büyük bir görünmez tıklama alanı premium değil, belirsizliktir.

## İki alternatifin ortak kabul şartları

- Yeşil ana eylem ve mevcut mavi marka işareti korunur.
- Slogan ve arama ortalanır. Fotoğraf mevcut kullanıcı varlıklarından gelir.
- Görseller “örnek uygulama” olarak sunulur; sahte puan, başarı sayısı veya doğrulanmış usta iddiası eklenmez.
- Arama ilk ekranda görünür. Mobilde keşif tüm ekranı kaplayan hero yüzünden kaybolmaz.
- Kart içinde kart, seri promosyon bantları ve yeni güven sayaçları eklenmez.
- Alternatifler yalnızca köşe ve renk farkıyla ayrışmaz: hero geçişi, fotoğraf ölçüsü ve keşif okuma sırası değişir.
- Tasarım prototipindeki arama/detay/kaydet davranışları yereldir; gerçek talep göndermez.

## Değerlendirme senaryoları

1. Musluğu damlayan kişi ilk ekranda aramayı bulabilmeli.
2. Hizmet adını bilmeyen kişi örnekten başlayabilmeli.
3. İlham arayan kişi ilk fotoğrafı makul kaydırmayla görebilmeli.
4. Kategori değiştiren kişi neyin seçili olduğunu anlayabilmeli.
5. Bir işi kaydeden kişi detay açmadan kaydedebilmeli.
6. Örnek iş fotoğrafı gerçek tamamlanmış işe ait kanıt sanılmamalı.
7. Bölge seçimi açık adres istemeden erişilebilir olmalı.
8. Klavye kullanıcısı arama, filtre ve kartlara sırayla erişebilmeli.
9. Mobilde kategori satırı ve kontroller yatay sayfa taşması üretmemeli.
10. Görsel yüklenmezse başlık ve eylemler kullanılabilir kalmalı.

## Gerçek karşılıklı tartışma

### Gemini High, UI görüşü

Gemini'ye Codex'in fotoğraflardan çıkardığı somut gözlemler ve iki ilk öneri verildi. Gemini'nin altı yeni temayı dosya/görsel araçlarıyla tek çağrıda inceleme girişimi 180 saniyede raporu tamamlayamadı. Dolayısıyla aşağıdaki görüş yeni altı görselin bağımsız tamamlanmış incelemesi değil, aktarılan kanıta dayalı UI eleştirisidir. Önceki turdaki beş referans incelemesi ayrı rapordadır.

Gemini dekoratif sınırları azaltma fikrini destekledi. A'nın iki eşit sütununu, tekdüze sosyal akışa dönüşme riski nedeniyle eleştirdi; ince çizgiler ve farklı bilgi hizalamaları önerdi. B'nin büyük ana fotoğraf + iki küçük fotoğraf düzenini daha güçlü buldu. Aramanın fotoğraf üstünden alınarak ayrı, yüksek kontrastlı bir banda yerleştirilmesini önerdi. B'yi güven ve editoryal hiyerarşi gerekçesiyle öne çıkardı.

### Codex, UX karşı görüşü

1. Sosyal akışın doğası gereği daha az güvenilir olduğu iddiası kanıtlanmadı. Orkestra'nın sosyal keşif amacı mevcut; bunu sırf lüks görünüm için silemeyiz.
2. B'de bir işin büyük gösterilmesi bir sıralama sinyalidir. Üretimde büyük kart seçimi editoryal, kişisel veya ücretli mi, açıklanmalı. Prototipte görseller örnek; “en iyi”, “öne çıkan usta” gibi iddialar yok.
3. Aramayı görselden ayırma önerisi kullanıcının ortalanmış görselli arama kararına aykırı. Bu öneri reddedildi. Okunurluk sakin fotoğraf bölgesi ve hafif örtüyle sağlanmalı.
4. Her karta yeni çizgi, etiket ve çerçeve eklemek kullanıcı gözlemiyle çelişebilir. A'da ana ayrım boşluk, başlık ve hizalama ile kurulacak.

### Kod üretimine gönderilen revize yön

**A / Açık akış:** Hero fotoğrafı sayfa zeminine bağlanır, kapalı yuvarlatılmış hero paneli kaldırılır. İki eşit fotoğraf sütunu ve bağımsız kaydet eylemi. Uygun olduğu durum: karşılaştırılabilir, tarafsız keşif.

**B / Editoryal vitrin:** Daha sığ panorama ve büyük bir iş fotoğrafı + iki küçük fotoğraf. Sonraki üç iş normal sırada. Uygun olduğu durum: işin görsel ayrıntısına öncelik veren keşif. Risk: büyük fotoğrafın sıralama/öneri sanılması ve ilk işin diğerlerini geri itmesi.

İki tasarım da aynı içerik ve varlıklarla hazırlanacak. Fark içerik ekleyerek değil, kompozisyon değiştirerek kurulacak. Üretim route'ları bu değerlendirmede değiştirilmiyor. Codex'in geçici tercihi A; B görsel vurgu için karşılaştırma alternatifi. Bu tercih görsel inceleme sonrası yeniden ele alınacak.

## 27 Ekim: ikinci tur ve teslim durumu

Gemini'nin özgün kod çıktısı `gemini-prototype-response.txt`, düzeltme cevabı `gemini-revision.json`, son görüşü `gemini-final-review.txt` olarak saklandı. Kodun ana üreticisi Gemini High; uygulama öncesi inceleme ve aşağıdaki düzeltmeler Codex tarafından yapıldı. Bu tur yalnızca bu tasarım klasörüne yazıldı.

### Önce / sonra / gerekçe

| Alan | Mevcut ekran | Yeni prototip | Gerekçe |
|---|---|---|---|
| Hero | Yuvarlatılmış kapalı panel | A'da zemine geçiş, B'de açık panorama | Dekoratif sınırı azaltırken görsel aramayı korumak |
| Keşif | Üç eşit sütun | A iki geniş sütun; B büyük ana iş ve küçük işler | Farklı okuma ritimlerini karşılaştırmak |
| Kontroller | Liste ve sayfa eylemleri | 52px arama kontrolleri, 44px bağımsız kaydet | Öncelik ve hedef alanını korumak |
| Meta bilgi | Başlık ve isim | Başlık18px, usta/ilçe14px, temsili açıklaması | Görsel ile sahibini yakın tutmak, sahte kanıt üretmemek |
| Alt akış | İlçe listesi ve hizmet açılımı | Hizmet başlıkları ve açıkça prototip olan bölge seçimi | Yalnızca kompozisyon denemesi; route tasarımının yerine geçmez |

### Gemini çıktısını kabul etmediğimiz noktalar

İlk kod yanlış yatay logo, temsili görsele gerçek iş iddiası, yalnızca modal içi kaydetme ve alert açan filtre içeriyordu. Düzeltme turunda Gemini bunları ele aldı; ancak CSS önerisi hero görselini silip A/B ayrımını zayıflatıyordu. Codex görsel katmanını ve ayrı grid kurallarını geri kurdu. Gemini'nin verdiği farklı yeşil ve morumsu girdi sınırı marka tonlarıyla değiştirildi. Bunlar görsel incelemeye değil, kaynak incelemesine dayalı düzeltmelerdir.

### Son karşılıklı görüş

[Gemini'nin tam son yanıtı](gemini-final-review.txt): koşullu A tercihi; B'de önerilen/sponsorlu algısı, A'da tekdüzelik riski; dekoratif sınırların azaltılması ama işlevsel ayrımın korunması. Gemini'nin “güveni zedeler” ifadesi kanıtlanmış sonuç değildir. Ayrıca Orkestra kamu hizmeti değil, sosyal keşif ve ticari hizmet pazaryeridir. Codex bu iki çerçeveyi düzeltir: B yasak değildir; öne çıkarma gerekçesi ve kullanıcı algısı test edilmelidir.

**Koşullu tasarım kararı:** A temel yön; B görsel vurgu alternatifi. Bu karar kullanıcı testi veya yeni ekran görüntüsüyle doğrulanmış nihai üretim kararı değildir.

### Doğrulama

- Node ile iki script bloğunun sözdizimi kontrolü başarılı.
- 10 görsel referansı kontrol edildi, eksik dosya yok.
- Gerçek iş iddiası artık yok.
- Tarayıcı aracı yerel `file://` açılışını güvenlik politikası nedeniyle reddetti. Alternatif yol ile aşılmadı. Yeni screenshot, etkileşim testi, responsive veya kontrast doğrulaması yapılmış sayılmaz.
- Hallmark sloplint ve üretim testleri bu tur çalıştırılmadı. Uygulama kodu değiştirilmedi.
- Kaydetme durumu yalnızca prototip oturumunda tutulur. Arama ve bölge seçimi sunucuya istek göndermez.

### Sonraki teslim kapısı

Tarayıcı erişimi uygun olduğunda A ve B için 1440 ve390px ekran görüntüleri;320 ve820px taşma kontrolü; filtre, kaydetme, dialog Escape/odak dönüşü ve arama doğrulaması. İki tasarım aynı içerikle karşılaştırılmalı. Ana gezinmenin giriş/hizmet-ver rotaları bu prototipte temsilen daraltılmıştır; üretime aktarımda mevcut rotalar korunmalıdır. Üretime geçiş bu eksikler giderilmeden önerilmez.
