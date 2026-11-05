# Orkestra: masaüstü ve mobil görsel karşılaştırma

27 Ekim 2026. Uygulamadan bağımsız tasarım çalışması; production entegrasyonu, commit veya push yapılmadı.

[Önce / öneri karşılaştırması](compare.html) · [Boyuta uyarlanan taslak](proposal.html) · [Masaüstü tam boy](after-1440.png) · [Mobil tam boy](after-390.png)

## Sonuç

Mevcut içeriğin görsel ağırlığını yeniden dağıttık. Ortalanmış fotoğraflı arama ve yeşil eylem korunurken serif/mono karışımı, paspartular, ağır protokol bloğu ve iç içe bölge kutuları sadeleşti. Fotoğraf arşivi, hizmetler ve ana sayfa kapsamı değişmedi. Bu, daha çok özellik içeren bir sayfa değildir.

Tasarım yoğunlukları: çeşitlilik 4/10 (sakin düzen, farklı gerçek fotoğraflar), hareket 1/10 (animasyon yok), bilgi yoğunluğu 5/10 (mevcut metinler korunuyor). Sayısal değerler ürün metriği değil, tasarım yönlendirmesidir.

## Nihai 10 kararın karşılığı

| Önce | Öneri | Neden / sınır |
|---|---|---|
| Genel gren ve çoklu yüzey | Temiz açık ana zemin | I01. Doku fotoğrafta kalıyor. |
| Koyu arama, yeşil alt eylem, kahverengi footer markası | Yeşil ana eylem, mavi logo, nötr metin | I02. Header’daki hizmet verme eylemi ikincil. |
| Serif, mono ve sans karışımı | Tek sistem sans ailesinde ölçü/ağırlık rolleri | I03. Son font seçimi değil; çevrimdışı okunabilir karşılaştırma. |
| Hero içinde çok sayıda kutulu örnek | Ortalanmış slogan/arama; örnekler fotoğrafın altında sade bağlantılar | I04. Aynı fotoğraf yeniden kadrajlandı. |
| Farklı ölçüde fotoğraf ağırlıkları | Aynı altı fotoğrafın tutarlı oranlarda sunumu | I05 kısmi. Yeni çekim/renk düzenlemesi yapılmadı; mevcut ışık farkları sürüyor. |
| Çift çerçeveli ve gölgeli iş kartları | Fotoğraf, yakın başlık ve usta bilgisi | I06. Üç sütunlu gerçek iş galerisi, mobilde tek sütun. |
| Bölge kartı içinde ilçe butonları | Ortak zeminde ince ayraçlı dizin | I07. Mevcut bölge adları ve açıklamaları korunuyor. |
| Çok sayıda kontrol geometrisi | 6 px civarında sade, düz bir kontrol ailesi | I08. Odak görünümü korunuyor; squircle iddiası yok. |
| Kutulu kategoriler | Metin ve etkin alt çizgi | I09. Prototipte kategori filtresi çalıştırılmıyor. |
| Mobilde yüksek hero ve dikey chip yığını | İki satırlı arama kontrolü, kompakt iki sütun örnekler | I10. 390 px’de ilk iş fotoğrafı yaklaşık y=682’de başlıyor. |

## Gemini ile çalışma ve ikinci inceleme

Gemini 3.8 Flash High ilk HTML/CSS taslağını üretti. Dosya/komut kullanan ilk girişim, etkileşimsiz komut izni nedeniyle çalışmadı. İzinler genişletilmedi; sınırlandırılmış içerik ve tarif verilerek araçsız metin çıktısına geçildi. Uzun çıktının kapanış bölümü tamamlanmadan süreç durduruldu; eksik alt kapanış ve mevcut footer/alt açıklama Codex tarafından birleştirildi. Kaynak çıktı `proposal-response.txt` içinde saklanıyor. Dolayısıyla teslimin tamamının Gemini tarafından kesintisiz üretildiği iddia edilmiyor.

Codex ilk taslakta ortalama eksikliğini, fazla opak hero katmanını ve ana aramayla yarışan header butonunu tespit etti. Gemini’den kısa CSS düzeltmesi alındı; yanlış/genel selector’lar gerçek DOM’a uyarlanarak uygulandı. Ardından tarayıcı ekranları alındı.

Gemini iki ekranı görsel olarak inceleyerek şu noktaları bildirdi:

- Sıcak fotoğraf ve keşif görsellerinin ilişkisini, masaüstü arama satırını ve galeri hiyerarşisini olumlu değerlendirdi.
- Mobil ilçe metninin kesilmesini ve fotoğraf üstündeki hızlı bağlantıların yoğunluğunu eleştirdi. Son turda mevcut **Tüm Ankara** etiketi geri getirildi, hızlı bağlantılar fotoğraf altındaki düz zemine taşındı.
- İlk iş fotoğrafının y724’te başlamasını “ilk ekranın tamamen dışında” diye nitelendirdi. Bu yorum kabul edilmedi: ekran 844 px yüksekliğindeydi, fotoğrafın üst kısmı görünüyordu. Son düzenleme başlangıcı yaklaşık y682’ye çekti.

Görüş birliği kalite kanıtı değildir. Bu çalışma dönüşüm, güven veya bilişsel yükte ölçülmüş iyileşme iddia etmez.

## Korunan içerik ve prototip sınırları

- Altı işin başlığı, usta adı, ilçesi ve bütün malzeme metinleri korundu.
- Dört bölgenin adı, mahalleleri, açıklamaları ve ilçeleri korundu.
- Yedi protokol başlığı ve açıklaması korundu. Sicil/garanti mikro metinleri koyu mühür yerine küçük düz paragrafta yer alıyor; bu ifadeler doğrulanmış ürün vaatleri değildir.
- 71 içerik dizgesi kontrol edildi; eksik yok. Slogan, örnek bağlantılar, arama placeholder’ı ve seçicideki Tüm Ankara ayrıca mevcut kaynakla eşitlendi.
- Harf avatarı diskleri kaldırıldı; usta adları korundu. Yeni insan fotoğrafı veya sahte kimlik eklenmedi.
- Mobil Menü yazısı ikonlu kontrole dönüştü; erişilebilir adı var. Marka yazısı mevcut küçük harfli `orkestra` biçimine düzeltildi. Logo geometrisi korundu; wordmark’ın fontu sistem fontuyla önizleniyor.
- Alt hizmet dizininin kapalı görünümü karşılaştırılıyor; açıldığında yalnız altı kategori adı gösterilir. Gerçek kapsam listeleri, wizard, navigasyon, arama, kaydetme ve filtre davranışları bağlı değildir. Bu çalışma tam işlevsel prototip değildir.
- Aynı mevcut fotoğraflar kullanıldığı için fotoğraf sanat yönetiminin tamamlandığını iddia etmiyoruz. Daha ileri görsel kalite için gerçek iş fotoğraflarının seçimi ayrı bir çalışma gerektirir.

## Doğrulama

| Kontrol | Sonuç |
|---|---|
| 320 / 390 / 820 / 1440 px yatay taşma | Yok |
| Eksik iş fotoğrafı | Yok |
| 390 × 844 ilk fotoğraf başlangıcı | Yaklaşık 682 px; üst kısmı ilk ekranda |
| 320 × 844 ilk fotoğraf başlangıcı | Yaklaşık 691 px |
| Korunan iş/bölge/protokol dizgesi | 71 / 71 |
| Başlangıçla karşılaştırılan uygulama dosyası | 300; değişiklik yok |
| Karşılaştırmanın mobil/masaüstü seçimi | Tarayıcıda çalıştırıldı; resimlerin yüklenmesi beklenerek görüntü alındı |

[Geometri ve fotoğraf kontrolleri](VISUAL-CHECKS.json) · [İçerik ve kapsam kontrolü](CONTENT-AND-SCOPE-CHECK.json)

Bu kontroller tam erişilebilirlik testi veya production E2E değildir. Gerçek akışlar bağlandığında klavye, ekran okuyucu, hata, loading ve sunucu davranışı ayrıca test edilmelidir. Bu aşamada uygulama testleri çalıştırılmadı; uygulama kodu değişmedi.

## Dürüst kalan eleştiri

Sayfa artık daha tutarlı; yine de tamamen özgün bir marka sanat yönetimi seviyesinde değil. Uzun sicil/protokol dili ve teknik kart metinleri, sosyal keşif hissine karşı hâlâ ağır. Bunları burada silmek, “aynı içerikle karşılaştırma” sözleşmesini bozardı. Mevcut içerik korunarak elde edilebilecek sadeleşmeyi gösteriyoruz. Bir sonraki karar, bu tasarım yönünün uygunluğunu görsel olarak değerlendirmek; ardından gerekiyorsa metin sadeleştirmesini ayrı kapsamda ele almak olmalı.
