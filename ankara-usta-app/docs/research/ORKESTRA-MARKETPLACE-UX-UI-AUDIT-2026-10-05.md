# Orkestra Marketplace UX/UI Audit and Roadmap

**Tarih:** 5 Ekim 2026  
**Kapsam:** Ana sayfa, hizmet keşfi, usta listesi, bölünmüş liste/harita görünümü, usta profili, wizard girişleri, logo ve ortak buton dili  
**Durum:** Tasarım ve ürün karar dokümanı. Uygulama değişikliği içermez.

## Tasarım okuması

Orkestra'yı Ankara odaklı, doğrulanmış yerel hizmetleri keşfetme ve teklif alma pazaryeri olarak okuyorum. Temel deneyim, Airbnb'nin sakin keşif ve harita/liste eşleşmesinden, TaskRabbit'in görev odaklı arama ve güven anlatısından yararlanmalı; Orkestra'nın farkı ise doğal dil ile ihtiyaç anlatma, ilçe seviyesinde yerellik, teklif karşılaştırma ve beş daireli Bağ Halkası markası olmalı.

**Tasarım ayarları:** `DESIGN_VARIANCE 4`, `MOTION_INTENSITY 2`, `VISUAL_DENSITY 4`.

- Varyans 4: ayırt edici fakat pazaryeri görevini gölgelemeyen bir kimlik.
- Hareket 2: yalnızca durum değişikliği, filtre uygulama, harita senkronu ve wizard ilerlemesi için geri bildirim.
- Yoğunluk 4: çok sayıda usta göstermek mümkün, fakat kart başına üçten fazla güven sinyali gösterilmemeli.

## Yönetici özeti

### Güçlü taraflar

- Hizmet aramayı ürünün ana girişine koyan görev odaklı bir omurga var.
- Liste, harita ve filtrelerin aynı keşif yüzeyinde buluşması doğru ürün yönü.
- Gerçek iş akışı, teklif sürümleri, mesajlaşma, rol ayrımı ve RLS çalışmaları görsel yüzeyin arkasında güçlü bir temel oluşturuyor.
- Türkçe, Ankara ve ilçe bağlamı ürünü genel bir kopyadan ayırıyor.
- `OrchestraLogo` beş daireli markayı tek bileşen olarak koruyor; bu, marka sürekliliği için iyi bir temel.

### En kritik problemler

1. **Üst alan çok fazla karar istiyor.** Başlık, güven rozeti, acil destek, talep CTA'sı, görünüm seçici, sonuç sayısı, sıralama ve filtreler aynı ilk bakışta yarışıyor.
2. **Kartlar veri tablosuna yaklaşıyor.** İsim, rozet, puan, iş sayısı, kategori, ilçe, açıklama ve CTA birlikte veriliyor. Kullanıcı önce “Bu kişi bana uygun mu?” sorusuna cevap arıyor; tüm kanıtı ilk kartta okumak istemiyor.
3. **Renk ve token katmanları bölünmüş.** Mevcut uygulama kobalt `#1246B5`, sarı `#FFDD00`, lemonade ve gece laciverti kullanırken eski araştırma ekranlarında yeşil-mavi sistem de yaşıyor. Bu durum logo, buton ve güven sinyalinin hangi renge ait olduğunu belirsizleştiriyor.
4. **Şekil dili gereğinden fazla yuvarlaklaşıyor.** 999px pill, 22px kart ve 28px konsept profil yüzeyleri birlikte kullanılıyor. Premium görünüm için her şeyi kapsül yapmak yerine 12-16px yüzey, 8-10px kontrol ve yalnızca etiketlerde pill kullanılmalı.
5. **Konsept ve canlı veri sözleşmesi ayrımı hâlâ hassas.** Konsept rota için profil bağlantısı düzeltildi, ancak gerçek `/ustalar` yüzeyinde Supabase ortam değişkenleri yanlış projeye işaret ederse kullanıcıya “liste yüklenemedi” gösteriliyor. Demo verisi gerçek doğrulama diliyle karıştırılmamalı.
6. **CSS katmanı borç taşıyor.** Aynı dosyada eski TaskRabbit-benzeri yeşil tokenlar, yeni kobalt tokenlar, doğrudan hex renkler ve `transition: all` örnekleri bulunuyor. Bu, görsel tutarlılık ve bakım maliyeti açısından P0 teknik tasarım borcudur.

## Mevcut kod ve belge kanıtı

| Alan | Kanıt | Yorum |
|---|---|---|
| Marka | `app/components/OrchestraLogo.tsx`, `app/components/OrkestraWordmark.tsx` | Logo tek SVG bileşeninde, fakat varyant adları ve renk varsayılanları sadeleştirilmeli. |
| Ana renkler | `app/application.css` kök tokenları | Kobalt, sarı, lemonade, parchment ve charcoal iyi bir çekirdek; tüm ekranlara zorunlu token kullanımı uygulanmamış. |
| Keşif | `app/ustalar/UstalarSplitView.tsx` | URL filtreleri, chip'ler, görünüm seçimi ve harita senkronu var; bileşen çok büyük ve etkileşim sorumlulukları iç içe. |
| Kart dili | `app/ustalar/ustalarSplitView.module.css` | Doğrudan hex renk, çok sayıda radius ve `transition: all` tekrarları var. |
| Ana sayfa | `app/home.module.css` | Hero arama güçlü, ancak gradient, glass ve çok sayıda dekoratif katman premium sadelikle çelişebilir. |
| Konsept | `app/concepts/harita/page.tsx`, `app/concepts/harita/usta/[id]/page.tsx` | Konsept profil yolu ayrıldı; bu rota canlı usta verisi gibi sunulmamalı. |
| Araştırma | `docs/research/TASKRABBIT_FULL_SITE_AUDIT.md` | TaskRabbit'in arama, kategori, güven, popüler iş ve üç adımlı akışı belgelenmiş. |
| Araştırma | `docs/research/TASKRABBIT_PATTERN_AUDIT.md` | Görev odaklı içerik sırası ve mobil davranış için ölçümler var. |
| Marka | `docs/research/DESIGN-MEMORABILITY-PRINCIPLES.md` | Bağ Halkası'nın şekil temelli ayırt ediciliği tanımlanmış; yeni görsel dil bu karar ile uyumlu kalmalı. |
| Yol haritası | `docs/engineering/PRODUCT-ROADMAP-REASSESSMENT-2026-09-21.md` | Ürün omurgası güçlü, ancak gerçek hesaplı ve görsel doğrulama kanıtları yayın öncesi hâlâ ayrı kapı. |

## Airbnb, TaskRabbit ve Plerdy karşılaştırması

Airbnb'nin arama yaklaşımı hedef, tarih/filtre ve liste-harita ilişkisini kademeli kurar; harita konumu gizlilik nedeniyle yaklaşık gösterebilir. TaskRabbit ana görevi “yardım bul” mesajı, arama ve kategori keşfiyle başlatır; güven kanıtını görev kararından hemen önce taşır. Orkestra bu ilkeleri kopyalamamalı, Ankara hizmet pazaryeri bağlamına uyarlamalıdır.

Plerdy'nin kontrol merkezi yerel hizmet sitesi, kullanılabilirlik, Core Web Vitals, mobil UX, dönüşüm ve hata takibini ayrı kontrol listelerine ayırıyor. Orkestra için bu, tek bir “güzel görünüyor” onayı yerine görev tamamlama, güven, performans ve hata geri dönüşünü ayrı kalite kapıları olarak ölçmek anlamına gelir. Kaynak: [Plerdy Website Checklists Hub](https://www.plerdy.com/check/).

| Boyut | Airbnb ilkesi | TaskRabbit ilkesi | Orkestra kararı |
|---|---|---|---|
| İlk görev | Arama ve bölge | “What do you need help with?” | Tek doğal dil araması + isteğe bağlı hizmet kategorisi |
| Filtre | Kademeli, gerektiğinde açılan | Kategori ve şehir niyeti | İlk seviye yalnız hizmet + ilçe; diğerleri çekmecede |
| Harita | Listeyle birlikte, yaklaşık konum | Harita ikincil | Harita yardımcı görünüm; liste karar yüzeyi |
| Kart | Fotoğraf, fiyat, konum, puan | Usta, hizmet, güven | İsim, tek uzmanlık, ilçe, tek güven satırı, tek CTA |
| Güven | Yorum, doğrulama, konum gizliliği | Verified Tasker ve garanti | “Doğrulanmış” yalnız gerçek veri varsa; açıklama profilde |
| Mobil | Alt filtreler ve harita geçişi | Tek sütun, görev CTA'sı | Alt çekmece: liste/harita, filtre, sonuç sayısı; sabit CTA yok |
| Ölçüm | Arama ve filtre niyeti | Görev/rezervasyon dönüşümü | Arama başlatma, filtre uygulama, profil açma, taslak başlatma, gönderim |

## Tasarım sistemi kararı

### Renk

Tek bir ana eylem rengi kullanılmalı: kobalt. Sarı/lemonade yalnızca vurgu, seçili durum ve sıcak güven katmanı olmalı. Yeşil tokenlar canlı ürün yüzeyinden kaldırılmalı veya yalnızca semantik başarı durumuna indirgenmeli. Saf siyah ve saf beyaz yerine charcoal ve parchment korunmalı.

Önerilen roller:

- `brand.action`: `#1246B5`
- `brand.action-hover`: `#0C338C`
- `brand.accent`: `#FFDD00`
- `surface.page`: `#FAF8F5`
- `surface.raised`: `#FFFFFF`
- `text.primary`: `#17233B`
- `status.success`: ayrı semantik yeşil, marka rengi değil

### Logo

- Yatay kilitlenme: masaüstü header ve ana sayfa.
- Sembol: avatar, favicon, küçük harita/ustalık işareti.
- Ters varyant: yalnız koyu yüzey üzerinde.
- `emerald`, `burgundy`, `gold`, `pistachio` gibi ürün anlamı taşımayan varyant adları kaldırılmalı veya açıkça legacy olarak işaretlenmeli.
- Logo yanında ikinci bir dekoratif daire, nokta veya rastgele blob kullanılmamalı; beş daireli işaret tek marka imzası olarak kalmalı.

### Butonlar

- Ekran başına bir birincil CTA.
- Birincil: kobalt dolu, 44-48px yükseklik.
- İkincil: beyaz/şeffaf, kobalt kenarlık.
- Tersinmez işlemler: kırmızı değil, metin ve onay adımıyla açıklanmalı.
- `border-radius: 999px` yalnız etiket ve filtre chip'lerinde.
- `transition: all` kaldırılmalı; yalnız renk, border, shadow ve transform ayrı ayrı tanımlanmalı.

## Before / After / Why

| Before | After | Why |
|---|---|---|
| Üstte güven, acil telefon, CTA, görünüm, sonuç, sıralama ve filtre birlikte | Başlık + tek ana arama + tek “Talep oluştur” CTA; sonuç/filtre satırı aşağıda | İlk karar yükünü azaltır |
| Kartta çok sayıda chip ve tekrar eden doğrulama metni | İsim, uzmanlık, ilçe, tek güven satırı ve “Profili aç” | Hızlı tarama ve daha yüksek sinyal/gürültü oranı |
| Harita her zaman güçlü ikinci odak | Harita yardımcı panel, mobilde açıkça seçilen görünüm | Liste kararını korur, performans ve mobil okunabilirlik artar |
| 999px kapsül ve 20px üstü kart radiusları | Yüzey 14-16px, kontrol 8-10px, chip 999px | Premium ve kontrollü geometri |
| Konsept rota, canlı rota ile aynı güven tonu | Konsept verisi ayrıştırılmış; canlı rota Supabase kaynağına bağlı | Yanlış doğrulama ve beklenti riskini azaltır |
| Hero'da gradient + glass + ambient dekor | Sakin parchment yüzey, güçlü tipografi, tek Bağ Halkası motifi | Marka hatırlanır, görev gölgelenmez |
| Genel “başarılı” veya sonsuz yükleme | Boş, hata, yükleniyor ve yeniden dene durumları | Plerdy'nin kullanılabilirlik ve dönüşüm kalite kapılarını karşılar |

## Uygulama yol haritası

### P0: Gerçeği ve sistemi sabitle

1. Supabase proje/env eşleşmesini düzelt; canlı `/ustalar` hata durumunu gerçek test hesabıyla doğrula.
2. Konsept, fixture ve gerçek usta verisini veri kaynağı seviyesinde ayır.
3. Renk, tipografi, radius, elevation ve focus tokenlarını tek dosyada kanonikleştir.
4. Logo varyant envanterini çıkar; legacy renk ve isimleri kaldır.
5. `transition: all`, doğrudan hex ve tekrar eden üstüne yazma katmanlarını hedefli CSS temizliğiyle azalt.

**Çıkış:** aynı marka ve aynı veri sözleşmesiyle render edilen ana sayfa, keşif ve profil.

### P1: Keşif başlığı ve filtreler

1. Hero'yu “Ankara'da doğru ustayı keşfedin” + doğal dil araması olarak sadeleştir.
2. İlk seviye filtreleri hizmet ve ilçe ile sınırla.
3. Diğer filtreleri çekmeceye al; uygulananları chip olarak göster.
4. Sonuç sayısı ve sıralamayı filtre satırına taşı.
5. URL'yi tek kaynak yap: `view`, `service`, `district`, `sort`, `q` yenileme ve geri dönüşte korunmalı.

**Çıkış:** kullanıcı ilk bakışta ne aradığını ve kaç sonuç bulunduğunu anlayabilmeli.

### P2: Usta kartları

1. Tek ana CTA: keşifte “Profili aç”, profil içinde “Bu ustayla talep oluştur”.
2. En fazla üç güven sinyali: doğrulama, puan/iş sayısı, hizmet bölgesi.
3. Uzun açıklamaları profil detayına taşı.
4. Kart hover, focus ve seçili pin durumunu aynı görsel sistemle bağla.
5. Kartın tamamını tıklanabilir yapma; eylem sınırlarını klavye ile görünür tut.

### P3: Liste ve harita

1. Aktif kart ile pin arasında iki yönlü senkron kur.
2. “Bu bölgede ara” yalnız harita hareketinden sonra görünür olsun.
3. Harita yükleniyor, hata ve boş durumlarını listeyi kilitlemeden göster.
4. Konumları yaklaşıklaştır; açık adres ve canlı GPS hiçbir zaman kartta gösterilmesin.
5. Demo pinleri üretim sorgusundan ayır; gerçek profil UUID'si olmayan pin talep akışına giremesin.

### P4: Profil ve seçili ustaya talep

1. Profil, hizmet kanıtı ve ilçe bağlamını tek karar ekranında birleştir.
2. Seçili profesyonel kimliğini wizard taslağına güvenli biçimde ekle.
3. Auth dönüşünden sonra aynı usta, cevaplar ve adım korunmalı.
4. Eski veya yetkisiz profil için açık hata ve listeye geri dönüş sağla.

### P5: Mobil ve erişilebilirlik

1. 320 ve 390px'te alt çekmeceyi peek, half ve full durumlarıyla tasarla.
2. Liste/harita geçişini segmentli kontrol olarak sun.
3. 44px hedef, görünür focus, doğal klavye sırası, Escape ile kapanma ve reduced motion doğrula.
4. Uzun isim, boş sonuç, ağ hatası, yavaş harita ve 200% zoom senaryolarını test et.

### P6: Premium polish ve ölçüm

1. Başlık font ölçülerini ve satır aralıklarını tek tip hiyerarşiye bağla.
2. Mikro animasyonları yalnızca eylem geri bildirimi için kullan.
3. Arama, filtre, profil, talep başlangıcı, auth dönüşü ve gönderim olaylarını ölç.
4. Core Web Vitals, JS hata oranı, harita yüklenme oranı ve wizard terk oranını kalite panosuna ekle.

## Kalite kapısı

Her dilim için `Planned -> Implemented -> Locally verified -> Multi-account verified -> Released` kaydı tutulmalı.

- 320/390/820/1440px yatay taşma ve odak kontrolü.
- Hedefli component testleri, type-check ve production build.
- Playwright sunucu kapanış problemi çözülmeden responsive sonucu “kanıtlandı” sayılmaz.
- Tam lint sonucu önceden var olan hatalarla karıştırılmamalı; dosya bazlı ve repo bazlı sonuç ayrı raporlanmalı.
- Gerçek Supabase hesabı, gerçek usta kaydı ve gerçek auth dönüşü olmadan canlı güven iddiası yapılmamalı.

## Nihai karar

Orkestra'nın en iyi yönü, genel bir hizmet kataloğu olmaması; yerel, doğrulanmış ve teklif tabanlı bir iş akışına sahip olmasıdır. Bu nedenle hedef Airbnb'yi görsel olarak kopyalamak değil, Airbnb'nin sakin keşif sırasını ve TaskRabbit'in görev netliğini Orkestra'nın Ankara ağı, ilçe bağlamı ve Bağ Halkası markasıyla birleştirmektir.

İlk uygulama sırası **P0 -> P1 -> P2** olmalıdır. Görsel polish, harita animasyonu veya yeni dekoratif logo çalışmaları, veri gerçeği ve keşif hiyerarşisi sabitlenmeden önce yapılmamalıdır.

## P0 ilk uygulama kaydı

**Durum:** Implemented, locally verified. Henüz commit edilmedi.

Uygulanan küçük ve geri alınabilir temel düzeltmeler:

- `--text-primary` artık marka kobaltı yerine `--brand-charcoal`; aksiyon rengi kobalt olarak ayrıldı.
- Kart radiusu 14px, yüzey gölgesi nötr charcoal temelli ve dialog overlay yeşil yerine nötr hale getirildi.
- `--action-primary-hover` eski yeşil değerden kobalt hover tokenına taşındı.
- `OrchestraLogo` ürün yüzeyinde yalnız `primary` ve `inverse` varyantlarını kabul ediyor.
- Ana sayfa öneri düğmesinde ve usta keşif kontrollerinde `transition: all` kaldırılarak animasyon özellikleri açıkça tanımlandı.

Doğrulama sonuçları:

- `npm run type-check`: geçti.
- `npm run build`: geçti.
- Değişen TSX dosyalarında hedefli ESLint: geçti.
- Repository geneli `npm run lint`: 0 hata, 10 uyarı. Kalan uyarılar görüntü optimizasyonu, iç araç/scratch dosyaları ve bir internal navigation çağrısıdır.
- İlgili Vitest dosyaları başlatılamadı: Node 20 ile jsdom/undici `webidl.util.markAsUncloneable` uyumsuzluğu worker fork aşamasında oluştu; bu nedenle testler başarısız değil, çalıştırılamamış olarak kaydedildi.
- Supabase ortam eşleşmesi ve gerçek hesaplı `/ustalar` verisi bu turda değiştirilmedi.

## P1 ilk uygulama kaydı

**Durum:** Implemented, locally verified. Henüz commit edilmedi.

- Üst satırdan acil destek ve sanal liste teknik rozetleri kaldırıldı; acil destek ikincil filtre çekmecesine taşındı.
- Hizmet ve ilçe ilk seviye filtreleri korundu; çekmece sayacı artık hizmet, ilçe ve metin aramasını birlikte gösteriyor.
- Sıralama seçimi `sort` URL parametresine yazılıyor ve yenileme sonrası korunuyor.
- Görünüm geçişi tam sayfa yönlendirme yerine router geçişi kullanıyor; mevcut shell ve odak kaybı azaltıldı.
- Çekmece içindeki telefon eylemi 44px hedef yüksekliğine getirildi.

Doğrulama:

- Hedefli ESLint: geçti.
- `npm run type-check`: geçti.
- `npm run build`: geçti.
- Konsept keşif rotası gerçek tarayıcıda açıldı; filtre çekmecesi ve ikincil acil destek bağlantısı görünür.
- Liste görünümünde sıralama `En yüksek puan` seçildiğinde URL `view=list&sort=rating` olarak korundu.
- Gerçek `/ustalar` rotasında Supabase ortam eşleşmesi nedeniyle hata yüzeyi görüldü; bu, konsept fixture doğrulamasından ayrı bir staging kanıtı olarak kaydedildi.

## P2 ilk uygulama kaydı

**Durum:** Implemented, locally verified. Henüz commit edilmedi.

- Keşif kartlarında tek görünür ana eylem `Profili aç` olarak sadeleştirildi; talep oluşturma niyeti profil ekranındaki sonraki adıma bırakıldı.
- Kartın vurgulu bilgi satırındaki tekrar eden ilçe chip'i kaldırıldı. İlçe bağlamı kart alt başlığında korunurken satır yalnızca ana hizmet ve tamamlanan iş sayısını taşıyor.
- Kartın erişilebilir adı talep yolunu kaybetmeden `Profili aç ve talep oluştur` olarak korunuyor; görünen metin ve ekran okuyucu açıklaması ayrıştırıldı.
- Önceki P1 değişiklikleriyle birlikte filtre çekmecesi, URL sıralaması ve router tabanlı görünüm geçişi aynı keşif yüzeyinde çalışıyor.

Doğrulama:

- `npx eslint app/ustalar/UstalarSplitView.tsx --max-warnings 0`: geçti.
- `npm run type-check`: geçti.
- `npm run build`: geçti.
- `git diff --check`: içerik hatası yok; yalnızca Windows satır sonu normalizasyon uyarıları var.
- Konsept liste rotası gerçek tarayıcıda yeniden yüklendi. Kartlar hizmet + iş sayısını öne çıkarıyor, ilçe alt bağlamda kalıyor ve tek CTA görünür.
- Gerçek `/ustalar` rotası için Supabase ortam eşleşmesi hâlâ ayrı bir staging engeli; bu nedenle P2 tarayıcı kanıtı konsept fixture üzerinden yerel kanıt olarak sınırlıdır.

## P3'e geçiş notu

Bir sonraki dilim liste ve harita ilişkisidir: aktif kart/pin eşleşmesi, `Bu bölgede ara` davranışı, harita boş/hata/yükleniyor durumları ve demo pinlerinin gerçek profil verisinden ayrılması. P2'deki tek CTA sözleşmesi korunmalı; harita üzerindeki bir pin seçimi kartta aynı odak ve erişilebilir açıklamayı üretmelidir.

## P3 ilk teknik doğrulama kaydı

**Durum:** Implemented, locally verified. Çoklu hesap ve gerçek Supabase verisiyle doğrulama bekliyor.

- URL'den gelen `sort` artık sunucu sayfasından `UstalarSplitView` bileşenine açık başlangıç değeri olarak aktarılıyor. Böylece SSR ve ilk istemci render'ı aynı sıralama ile başlıyor.
- Liste, harita ve bölge arama kontrolleri aynı URL görünümünü koruyor; `Bu bölgede ara` durumu harita üzerinde görünür sonuç sayısıyla birlikte duyuruluyor.
- Harita için yükleme, tile hatası ve sıfır sonuç yüzeyleri mevcut listeyi kilitlemeden ayrı gösteriliyor.

Doğrulama:

- Hedefli ESLint (`UstalarSplitView`, `/ustalar`, konsept harita sayfası): geçti.
- `npm run type-check`: geçti.
- `npm run build`: geçti.
- Konsept rotası `view=split&sort=rating` gerçek tarayıcıda açıldı; sıralama URL'den doğru okundu ve önceki hydration hatası (`Unhandled Script Error`) yeniden oluşmadı.
- Harita erişilebilirlik ağacında 12 usta pini, `Bu bölgede ara`, katman, yakınlaştırma ve sıfırlama kontrolleri görünür.
- İlk kart seçildiğinde canlı duyuru `... seçildi. Harita ve liste senkronize edildi.` olarak güncelleniyor; aynı ustanın harita önizlemesi açılıyor.
- `Bu bölgede ara` açıldığında liste 12 profilden 11 görünür profile daraldı, özet `11 / 12` olarak güncellendi ve `Tüm Ankara'yı göster` geri dönüş eylemi belirdi.
- Gerçek `/ustalar` rotasının Supabase ortam eşleşmesi ve gerçek veriyle kart/pin kanıtı ayrıca staging doğrulamasına bırakıldı.

## P4 ilk uygulama kaydı

**Durum:** Implemented, locally verified. Gerçek onaylı profil ve hesapla uçtan uca doğrulama bekliyor.

- Profil filtresindeki ilçe, `Bu ustadan teklif al` formunun talep girişine taşınıyor.
- İlçe, yalnızca ustanın doğrulanmış hizmet bölgeleri içindeyse wizard başlangıç bağlamı olarak kullanılıyor; mahalle seçimi yine kullanıcıya bırakılıyor.
- Usta kimliği ve hizmet seçimi mevcut doğrudan talep sözleşmesiyle korunuyor; yeni bir wizard veya ikinci bir talep sistemi eklenmedi.
- Taslak ve auth dönüşü için mevcut `targetProfessionalId` kapsamı aynen kullanılıyor.

Doğrulama:

- Hedefli ESLint (`RequestWizard`, `DirectedRequestEntry`, profil ve talep sayfaları): geçti.
- `npm run type-check`: geçti.
- Konsept profil ekranı tarayıcıda açıldı; uzmanlık, ilçe ve güven sinyali görünür. Konsept CTA'sı bilinçli olarak genel hizmet başlangıcına gider; gerçek doğrudan talep akışı yalnız üretim `/ustalar/:id` profilinde feature flag ve doğrulanmış Supabase kaydıyla açılır.
- Gerçek `/ustalar/:id` ve `/ustalar/:id/talep` akışı, mevcut Supabase ortam eşleşmesi ve gerçek onaylı profil gerektirdiği için henüz staging kanıtı değildir.

## P5 responsive ve erişilebilirlik kaydı

**Durum:** Locally verified. Gerçek hesaplı auth dönüşü ve mobil fiziksel cihaz kanıtı bekliyor.

- Konsept profil ekranı 320x760 ve 390x844 görünüm override'larında yatay taşma üretmedi.
- Profilde iki ana eylem odağı doğal sırada kaldı: listeye dönüş ve talep başlangıcı.
- Klavye ile sekme sırası görünür odak çizgisiyle doğrulandı; odak ilk olarak listeye dönüş, sonra talep başlatma bağlantısına ilerledi.
- P4'te eklenen ilçe bağlamı, profil → doğrudan talep geçişinde korunuyor; auth dönüşü mevcut `requestResumePath` ve hedef usta kapsamıyla çalışmaya devam ediyor.
- `npm run test:e2e:responsive`: 320, 390, 820 ve 1440 px için 4 test geçti. Görünüm geri dönüş sözleşmesi URL dönüşünden sonra kontrollü reload ile doğrulanıyor; bu, Vinext'in bfcache DOM geri yükleme davranışını ürün hatası olarak işaretlememek için testte açıkça belgelenmiştir.

Sınırlar:

- Browser viewport kanıtı masaüstü tarayıcı emülasyonudur; fiziksel iOS/Android ve ekran okuyucu testi değildir.
- Gerçek Supabase hesabı, doğrulanmış usta UUID'si ve doğrudan talep feature flag'i staging'de birlikte doğrulanmadı.

## P6 premium polish ve ölçüm kaydı

**Durum:** Implemented, locally verified. Gerçek kullanıcı ölçümü ve staging profili bekliyor.

- Keşif sıralaması görünümden ayrıştırıldı. Puan veya iş sayısına göre sıralama artık URL'deki `view` değerini `rating` gibi geçersiz bir değere çevirmiyor; seçili liste, harita veya bölünmüş yüzey korunuyor.
- Keşif ve harita kontrollerindeki kritik `transition: all` kullanımları açık renk, arka plan, kenarlık, gölge ve transform geçişlerine ayrıldı. Böylece kart/pane ölçümleri istemeden animasyona girmezken mevcut premium mikro-etkileşimler korunuyor.
- Ustalar split-view için mevcut `prefers-reduced-motion` kapısı korunuyor; yeni hareket eklenmedi.
- Responsive staging senaryosuna sıralama regresyon kontrolü eklendi: `sort=rating` seçimi `view=split` sözleşmesini korumalı.

Doğrulama:

- `npm run type-check`: geçti.
- `npm run build`: geçti.
- `npm run test:e2e:responsive`: 320, 390, 820 ve 1440 px senaryoları yeni sıralama regresyon kontrolüyle birlikte 4/4 geçti. Vinext sunucusu kontrollü biçimde kapandı ve port serbest bırakıldı.
- `npm run lint`: 0 hata, 9 mevcut uyarı. Uyarılar P6 dosyalarından kaynaklanmıyor; görsel optimizasyonu, kullanılmayan değişkenler ve `scratch/` yardımcı dosyalarıyla ilgili.
- `git diff --check`: yalnızca Windows satır sonu normalizasyon uyarıları beklenir.

Bilinen sınır: Analitik izin listesi mevcut discovery/wizard olaylarıyla sınırlıdır; bu dilimde yeni PII riski yaratacak olay adı eklenmedi. Gerçek trafik ölçümü için consent kabul edilmiş staging hesabı ve analytics endpoint gerekir.

## Referanslar

- [TaskRabbit ana sayfası](https://www.taskrabbit.com/?type=standard)
- [TaskRabbit hizmet dizini](https://www.taskrabbit.com/services)
- [Airbnb arama sonuçları](https://www.airbnb.com/help/article/252)
- [Airbnb arama ve filtre açıklaması](https://www.airbnb.com/help/article/39)
- [Airbnb kesin konum gizliliği](https://www.airbnb.com/help/article/2141)
- [Plerdy Website Checklists Hub](https://www.plerdy.com/check/)
- Repository research: `docs/research/TASKRABBIT_FULL_SITE_AUDIT.md`
- Repository research: `docs/research/TASKRABBIT_PATTERN_AUDIT.md`
- Repository research: `docs/research/DESIGN-MEMORABILITY-PRINCIPLES.md`
- Repository roadmap: `docs/engineering/PRODUCT-ROADMAP-REASSESSMENT-2026-09-21.md`
