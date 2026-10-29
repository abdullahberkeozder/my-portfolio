# `/ustalar` Split View Audit V1

Tarih: 2026-10-29  
Kapsam: yalnızca tarayıcı gözlemi ve kalite kararı. Uygulama kodu bu audit diliminde değiştirilmedi.

## Test yüzeyleri

İki yüzey ayrı değerlendirildi:

1. Varsayılan `/ustalar?view=split&sort=recommended`.
2. Deterministik görsel QA yüzeyi `/ustalar?view=split&sort=recommended&fixture=limited`.

Yerel Supabase RPC erişimi olmadığı için varsayılan yüzey `Usta listesi yüklenemedi` hata durumuna dönüyor. Bu sonuç görsel düzen hatası olarak sınıflandırılmadı; gerçek veri sözleşmesi / staging erişimi ayrıca çözülmeli.

## Dört viewport sonucu

| Genişlik | HTTP | Taşma | Gözlenen durum |
| ---: | ---: | ---: | --- |
| 320 | 200 | Yok | Split kontrolü ve harita kullanılabilir. Sol kenara yaklaşan `Yenimahalle 2` rozeti kesiliyor. |
| 390 | 200 | Yok | Aynı rozet yaklaşık 14 px dışarı taşıyor; alt panel ve footer taşmıyor. |
| 820 | 200 | Yok | Liste ve harita dengeli; boş sonuç mesajı okunabilir. |
| 1440 | 200 | Yok | Liste yaklaşık %40, harita yaklaşık %60 genişlikte; harita kontrolü ve destek kapsülü çakışmıyor. |

Kanıt ekranları:

- [320 px fixture](./fixture-limited-320.png)
- [390 px fixture](./fixture-limited-390.png)
- [820 px fixture](./fixture-limited-820.png)
- [1440 px fixture](./fixture-limited-1440.png)
- [Ham ölçümler](./fixture-limited-metrics.json)

## UX değerlendirmesi

### Öncelik 1: harita etiketi güvenli alanı

320 px ölçümünde `Yenimahalle 2` rozetinin kutusu `x=-59`, 390 px ölçümünde `x=-24` değerinde. Bu, yatay sayfa taşması yaratmıyor; ancak kullanıcı etiketin bir kısmını göremediği için harita üzerindeki bölgesel ipucunu eksik algılıyor. Sorun `ustalarSplitView.module.css` içinde genel bir padding sorunu değil; Leaflet marker icon anchor ve dar viewport koordinatlarının birlikte ele alınmasını gerektiriyor.

Önerilen çözüm sınırı:

- yalnızca `app/components/map/RealAnkaraMap.tsx` marker icon üretimi ve ilgili map CSS;
- marker metnini harita sınırları içinde tutan dar-ekran anchor/clamp davranışı;
- harita merkezini, zoom seviyesini veya veri modelini değiştirmeme;
- 320 ve 390 px’de hiçbir marker metninin sol/sağ sınırdan kesilmemesi.

### Öncelik 2: boş liste / harita dili

Fixture, liste tarafında `Bu filtrede henüz eşleşen usta yok`, harita tarafında `Bu bölgede henüz uygun usta yok` metinlerini aynı anda gösteriyor. Bu iki mesaj teknik olarak farklı durumları anlatabilir; aynı ekranda arka arkaya gelince bilişsel yükü artırıyor. Tek bir ortak cümle ve ikincil açıklama ile hizalanması daha iyi olur. Bu, veri davranışını değiştirmeden yalnızca metin sözleşmesi olarak ele alınmalı.

### Öncelik 3: destek kontrolü

Desktopta destek kapsülü haritanın sağ-altında ve mevcut fixture’da başka bir kontrolle çakışmıyor. Mobilde destek yüzeyi bilinçli olarak gizleniyor; `320 / 390` ölçümlerinde sabit destek kontrolü görünmüyor. Bu davranış, alt liste panelinin dokunma alanını koruduğu için olumlu. Ancak mevcut metin/ikon bileşeninde emoji karakterleri bulunuyor; premium Orkestra dili için sonraki ayrı bir ikonografi diliminde anlamlı SVG ile değiştirilmesi uygun.

## Erişilebilirlik gözlemi

İlk 16 Tab adımında skip link, marka, menü, ana CTA, görünüm anahtarları, sıralama ve filtre kontrolleri sıralı biçimde erişiliyor. `Daha fazla filtre` kontrolü `aria-label="Filtrele, diğer seçenekleri aç"` taşıyor. Bu dilimde modal veya profil kartı açılışına kadar ilerlenemediği için focus trap doğrulaması yapılmadı.

## Kod kalitesi kapıları

- `npm run styles:check`: başarılı.
- `npm run type-check`: başarısız; hata bu dilimin dışında kalan Hallmark fixture dosyalarında eksik `class-variance-authority` ve `./cn` modüllerinden geliyor.
- Çalışma ağacı: mevcut kullanıcı değişiklikleri korunuyor; commit veya reset yapılmadı.

## Gemini doğrulaması

Bu audit için Gemini High’a salt-okuma UI/UX eleştirisi gönderme denendi. Antigravity CLI bu Windows oturumunda OAuth beklemesine geçti (`You are not logged into Antigravity`), bu nedenle Gemini görüşü varmış gibi raporlanmadı ve kodlama görevi açılmadı.

## Sonraki bounded görev

**Map marker safe-area hardening:** marker etiketlerini 320/390 px’de harita sınırları içinde tut, boş durum mesajlarını tek bir dil sözleşmesinde hizala ve yalnızca ilgili map dosyalarını değiştir. Kabul kriterleri:

1. 320, 390, 820 ve 1440 px’de `scrollWidth === clientWidth`.
2. Harita üzerindeki görünen tüm rozetlerin bounding box’ları map viewport sınırları içinde.
3. Liste ve harita boş durumları aynı ana mesajı kullanıyor.
4. İlk 16 Tab sırası değişmiyor.
5. `npm run styles:check`, ilgili testler ve dört viewport screenshot QA başarılı.

Bu görev tamamlanmadan yeni rozet, filtre veya harita özelliği eklenmemeli.
