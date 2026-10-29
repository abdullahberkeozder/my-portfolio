# Landing Hallmark incelemesi ve uygulama dilimi

23 Ekim 2026. Bu kayıt yalnız bu dilimi kapsar; önceki test başarıları yeni doğrulama gibi sayılmaz.

## İncelenen örnekler

[Hallmark](https://github.com/nutlope/hallmark) yerel olarak zaten kurulu. 48 örneğin tamamı incelendi iddiası yok: Atelier, Studio ve Werkstatt görselleri tek tek açıldı.

| Örnek | Aktarılan ilke | Aktarılmayan |
| --- | --- | --- |
| Atelier | Yüzey sakinliği, malzemenin kendisini öne çıkarma | Parfüm sitesi tipografisi, düşük yoğunluklu satış hikâyesi |
| Studio | Dolu ana eylem / sessiz ikincil eylem ayrımı | Teknik kılavuz çizgileri, dev marka gösterisi |
| Werkstatt | Yapısal kategori hiyerarşisi, hizalı bilgi | Sarı-kırmızı-mavi bloklar, büyük harf metinler |

Orkestra bir hizmet ve sosyal keşif ürünü: örnekleri birebir kopyalamak, sosyal akışı uzun pazarlama bölümleriyle değiştirmek doğru değil. Kullanıcının merkezde cam görselli hero kararı korunur.

## Önce / sonra / neden

| Önce | Sonra | Neden |
| --- | --- | --- |
| 490 px masaüstü hero | 400 px minimum | Fotoğraf akışına daha erken geçiş |
| 660 px arama, gizli etiket | 760 px arama, görünür etiket | Başlangıç eylemini belirginleştirme |
| Üç dolu hızlı örnek kapsülü | 44 px dokunma alanlı metin eylemleri | Ana aramayla rekabeti azaltma |
| Başlık ve açıklama üst üste | Masaüstünde aynı başlık satırı, mobilde alt alta | Dikey yoğunluğu azaltma |
| İlçeler kapsül bulutu | Görünür 3 / 2 sütun bağlantı dizini | Konum bağlantılarını butondan ayırma |
| Hizmet akordeonunda yön işareti yok | Açık/kapalı SVG şevronu | Kontrolün davranışını görünür yapma |

Arama, sınıflandırma, kayıt, modal, wizard çağrıları, harita URL parametreleri ve ilçe bağlantıları korunmuştur. Ek metin iddiaları, metrikler veya müşteri yorumları eklenmemiştir.

## Gemini ile gerçek karşı değerlendirme

Model: gemini-3.8-flash-high. Dosya okuma isteyen ilk çağrı 90 saniyede çıktı vermeden zaman aşımına uğradı. İkinci çağrı, Codex'in doğruladığı kaynak ve ekran bulgularının metin özetini aldı; dosya, ekran veya testleri bağımsız incelemedi.

Gemini kapalı ilçe akordeonuna itiraz etti. Ek etkileşim maliyeti gerekçesi kabul edildi, bağlantılar görünür bırakıldı. İleri sürdüğü SEO zararı kanıtlanmış sayılmadı. Mobil yatay bağlantı rayı önerisi alınmadı: tüm ilçeleri görünür tutmak bu küçük kümede daha anlaşılır. Gemini bu dilimde kod yazmadı; uygulama ve doğrulama Codex tarafından yapıldı.

## Görsel ve teknik doğrulama

- Gerçek yerel tarayıcıda önce/sonra: 1440 ve 390 px; ek sonra kontrolleri: 320 ve 820 px.
- Dört genişlikte document yatay taşması yok.
- İlk kart üst kenarı: 1440 px'de 680 px, 390 px'de 623 px, 320 px'de 638 px, 820 px'de 559 px. Bunlar düzen ölçümüdür, dönüşüm performansı kanıtı değildir.
- styles:check, type-check ve yeni production build başarılı.
- Yeni production derlemesi üzerinde landing E2E: 16/16 başarılı (25.7 saniye). Görünür etiket testi artık yalnız inputu değil label yüksekliğini de kontrol eder. Önceki derleme üzerinde başlatılan ilk koşu bu sonuca dahil değildir.
- Hallmark taraması: 102 FAIL, 23 REFLEX, 3 WARN, 1 NOTE. Büyük kısmı eski CSS literal değerleri ve kaynak düzeyinde eski override kurallarıdır; kapatılmadı. Kaydedilenler filtresini eyebrow sayması yanlış pozitiftir. Cam uyarısı kullanıcının açık tasarım tercihine aykırıdır. Tam Hallmark uyumu iddia edilmiyor.
- Hallmark render aracı puppeteer bulunmadığı için çalışmadı; kurulu Playwright ile gerçek ekranlar alındı. Yeni bağımlılık kurulmadı.

## Dürüst kalan işler / sıra

1. Bu sınırlı uygulama tam site tasarım denetimi değildir. 24 Ekim bakım diliminde 61 ezilen bildirim kaldırıldı ve renkler yerel token'larda toplandı. Responsive/state kuralları ayrı tutuldu. [Stabilizasyon kanıtı](stabilization/README.md).
2. İlk ziyarette çerez paneli fotoğraf içeriğini örtüyor. Ayrı consent erişilebilirliği diliminde incelenmeli; burada onay davranışına dokunulmadı.
3. Temsili usta isimleri gerçek profil kanıtı değildir. Portfolyo alanındaki kaynak açıklaması ürün kararı olarak güçlendirilmeli; hayali doğrulama rozeti eklenmemeli.
4. Wizard: adım hiyerarşisi, seçenek / ana eylem ayrımı ve hata / odak durumları aynı yaklaşım ile ayrı denetlenmeli.
5. Skeleton: yalnız mevcut geometriye eşleşme ve gerçek yükleme durumları üzerinden ilerlemeli, dekoratif gecikme eklenmemeli.
6. Sitemap değişmedi: landing arama → sınıflandırma → wizard; keşif → detay → benzer hizmet; harita ve ilçe bağlantıları → /ustalar. Route yeniden adlandırması yapılmadı.

[Görsel karşılaştırmayı aç](compare.html)
