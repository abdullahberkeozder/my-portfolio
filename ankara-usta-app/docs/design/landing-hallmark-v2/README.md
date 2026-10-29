# Landing / Hallmark V2 — 25 Ekim 2026

## Kapsam ve kaynak

Kaynak: https://github.com/nutlope/hallmark — projedeki `.codex/skills/hallmark` entegrasyonu kullanıldı. Bu bir bileşen kütüphanesi değildir; referans sayfaların marka kimlikleri veya görselleri ürün varlığı olarak kopyalanmadı.

Codex beş referansın JPG görüntüsünü inceledi. `gemini-3.8-flash-high` aynı beş görseli ve landing kaynaklarını okuduğunu raporladı. Bu, bütün Hallmark örneklerinin incelendiği anlamına gelmez.

| Referans | Alınan ilke | Orkestra'ya taşınmayan unsur |
| --- | --- | --- |
| Atelier | İnce sınırlar, malzeme görsellerine alan açma | Parfüm kataloğu kimliği, serif başlıklar |
| Studio | Kontrollü boşluk ve tipografik hiyerarşi | Dekoratif baskı/kesim işaretleri |
| Werkstatt | Kategori ve eylemlerin net ayrımı | Ana renk blokları, büyük harf ağırlığı |
| Kiln | Tek güçlü eylem rengi, ikincil kontrollerde sakinlik | Koyu tema ve üretim paneli görünümü |
| Formwork | Okunur eylem geometrisi ve yapısal hizalama | Sert gölgeler ve beton marka dili |

## Karşılıklı değerlendirmenin sonucu

Gemini kartlara malzeme etiketleri, arama örneklerine yeni chip çerçeveleri ve iskelet ölçülerinin eşleştirilmesini önerdi. Codex ilk iki öneriyi reddetti: sosyal keşif kartında daha çok etiket ve çerçeve, kullanıcının az metin / düşük bilişsel yük beklentisine aykırı. Ortalanmış cam hero ve yeşil ana eylem korunacak.

Uygulama yönü: arama yüzeyinde belirgin fakat ince sınır, tutarlı buton köşeleri ve hedef yüksekliği, hareketsiz hover davranışı, kart başlığında daha güçlü hiyerarşi. Popülerlik verisi bulunmayan örnekler “Örnekler” olarak adlandırılacak.

## İskelet ve sonraki yüzeyler

`DiscoveryGridSkeleton` global `app/loading.tsx` içinde kullanılıyor. Ana sayfa geometrisiyle mevcut ölçüleri uyuşmuyor; ancak global sınırı sadece landing'e göre düzeltmek diğer rotaları doğrulamaz. İskelet için ayrı route kapsamı ve gerçek yükleme kontrolü gerekiyor; sıfır CLS iddiası yok.

Wizard için aynı ilkeler: seçeneklerde seçim durumu ile eylem butonu ayrılmalı; bir ana devam eylemi, sakin geri/düzenle eylemleri, görünür klavye odağı ve alan yanında hata. Bu dilimde wizard davranışı ve sitemap değiştirilmeyecek. Mevcut keşif → iş detayı → benzer hizmet; doğrudan arama → talep; harita → usta akışları korunacak.

## Kanıtlar

- `before-1440.png`, `before-390.png`: bu turda Codex tarafından yerel tarayıcıdan alınan gerçek önce görüntüleri.
- Gemini'nin ilk kodlama/screenshot çağrısı headless command iznine takıldı. Dosya araçlarıyla sınırlı ikinci çağrı 180 saniyede zaman aşımına uğradı. Ardından araçsız iki çağrıda Gemini CSS patch ve kural değişikliklerini üretti; Codex mevcut kurallara uyguladı. Ekran görüntülerini Gemini değil Codex aldı.

## Tamamlanan dilim — 26 Ekim 2026

- Arama dış köşesi 10 px, ana buton köşesi 8 px; arama kontrol yüksekliği 48 px. İç cam vurgusu ve sakin gölge.
- Arama alanının hover/focus konum sıçraması kaldırıldı.
- Kart başlığı 1.125 rem / 1.4 satır yüksekliği; üst boşluk 14 px ve içerik aralığı 8 px; usta satırı .875 rem.
- Kart görsel zoom/gölge ve kaydetme butonu hover büyümesi kaldırıldı.
- İkincil hizmet/harita butonları 8 px köşe ve en az 48 px yükseklik.
- Kanıtsız “Popüler” ifadesi “Örnekler” oldu. İşlevler, sitemap, içerik sayısı korundu.

Bu değişiklik kapsamlı yeniden tasarım değildir. Kullanıcının istediği tüm site dönüşümü tamamlandı olarak işaretlenmez. Wizard ve global skeleton bu dilimde değiştirilmedi.

### Doğrulama

- `npm run build`: başarılı; `styles:check`: başarılı.
- `npm run type-check`: başarılı.
- `home-discovery.spec.ts` ve `production-loading-contract.spec.ts`, Chromium: 8/8 başarılı.
- 320 / 390 / 820 / 1440 px arama genişliği, erişilebilir ana eylem ve yatay taşma kontrolü başarılı.
- Yerel production ölçümünde landing CLS: 0 / 0 / 0 / 0.0086. Bu laboratuvar örneği gerçek kullanıcı metriği veya tüm skeleton geçişlerinin kanıtı değildir.
- `after-1440.png`, `after-390.png`: production sonrası gerçek ekranlar. [Karşılaştırmayı aç](compare.html).
- Önce görüntülerinde geliştirme ortamından kaynaklanabilecek netlik farkı var; netlik artışı UI değişikliğine mal edilmemeli.

### Sıradaki kabul koşulları

1. Landing ve wizard akışında görsel kararların ikinci bağımsız incelemesi.
2. Global loading sınırının route kapsamını netleştirme; ardından gerçek geometriye uyan skeleton. Yapay bekleme eklenmeyecek.
3. Wizard seçenek/özet/düzenleme kontrollerinde aynı geometri; seçim, focus ve hata için ayrı görsel durumlar. İşlem mantığı korunacak.

## Gemini'nin ikinci görsel değerlendirmesi ve Codex denetimi

Gemini High dört önce/sonra görselini açtığını bildirdi. Temel eleştirisi: görsel ilerleme küçük, ana kompozisyonda belirgin değişim yok. Bu eleştiriye katılıyoruz; teslim “büyük yeniden tasarım” olarak adlandırılmamalı.

Ancak “yalnızca metin değişti, diğer ölçüler pixel-identical” yorumu doğru değil. Codex canlı DOM üzerinden kontrol etti: ana buton yüksekliği 48 px, köşesi 8 px; kart başlığı 18 px ve 25.2 px satır yüksekliği. Bunlar eski 46 px / 10 px / 1.02 rem değerlerinden farklı. Gemini'nin mobil görsel için yazdığı 4:3 oranı da yanlış; canlı oran 16:9. Önerdiği sabit 320 px kart yüksekliği kullanılmayacak; responsive oran esas olmalı.

Gemini skeleton ölçü uyuşmazlığını doğru yakaladı, fakat “gözle görülür hydration CLS” iddiası mevcut testle kanıtlanmadı. Ölçülen normal production yüklemesi başarılı; ayrı yavaşlatılmış boundary geçişi henüz doğrulanmış değil. Böylece görüşler otomatik kabul edilmeden kanıtla ayrıştırıldı.
