# Hallmark anti-slop entegrasyonu

## Amaç

Hallmark, Orkestra'nın marka sisteminin yerine geçen bir tema değildir. Projede üç iş için kullanılır:

1. Kod seviyesinde mekanik tasarım borcunu bulmak.
2. Landing, wizard, ortak butonlar ve skeleton'larda tekrar eden “AI slop” kalıplarını görünür kılmak.
3. Görsel QA öncesi bir eleştiri listesi üretmek.

Orkestra'nın kobalt marka işareti, orman yeşili eylem rengi, sıcak beyaz yüzeyleri ve sosyal zanaat pazaryeri kimliği korunur.

## Kurulum

Hallmark proje kapsamına `.codex/skills/hallmark` altında kurulmuştur. Kaynak MIT lisanslıdır. Skill yeni Codex oturumlarında doğrudan kullanılabilir; mevcut oturumda linter ve referans belgeleri yerel kaynak olarak çalıştırılabilir.

## İlk tarama

Kapsam:

- `app/page.tsx`
- `app/home.module.css`
- `app/components/ui/Button.tsx`
- `app/components/ui/Button.module.css`
- `app/components/RequestWizard.tsx`
- `app/components/requestWizard.module.css`
- `app/components/skeletons`

İlk sonuç: 399 mekanik bulgu. Aynı 12 dosyalık kapsamda değişikliklerden sonra: 365 bulgu.

Bu sayı bir kalite puanı değildir. Kalanların 349'u renk literal/token kuralından, 21'i saf beyaz/siyah kuralından ve 4'ü Hallmark damga beklentisinden gelir. Bunlar mevcut Orkestra sistemine toplu ve kör biçimde uygulanmayacaktır.

## Kabul edilen bulgular

- `transition: all` yerine değişen özellikleri açıkça yazmak.
- Birincil/ikincil eylem butonlarında 8–10 px köşe grameri kullanmak.
- Pill formunu yalnızca chip, filtre ve segmented-control semantiğine ayırmak.
- Emoji arayüz ikonunu aynı çizgi ailesindeki SVG ikonla değiştirmek.
- Klavye odağını `:focus-visible` ve sabit kalınlıklı outline ile göstermek.
- Skeleton geometrisini gerçek bileşenin son şekliyle eşleştirmek.
- Büyük harf + geniş harf aralığı kullanan küçük etiketleri cümle düzenine çekmek.
- Nokta dizisiyle ayrılmış güven mesajını taranabilir kısa öğelere bölmek.

## Reddedilen veya ertelenen bulgular

- Saf beyazı tamamen yasaklamak: fotoğraf ağırlıklı pazar yeri yüzeylerinde temiz zemin işlevseldir.
- Tüm renk literallerini tek seferde token'a çevirmek: kirli çalışma ağacında geniş ve riskli bir refaktördür; ayrı bir tasarım-token dilimi olmalıdır.
- Her CSS dosyasına Hallmark damgası eklemek: ürün koduna araç sahipliği izlenimi verir ve Orkestra'nın kendi tasarım sözleşmesi değildir.
- Tüm kapsülleri kaldırmak: kategori chip'i, zaman seçimi ve filtre gibi seçim kontrollerinde kapsül semantiği korunur.
- Hallmark temalarından birini doğrudan uygulamak: `werkstatt` ve `atelier` yalnızca eleştiri/ilham kaynağıdır.

## Uygulanan ilk dilim

- Landing search yüzeyi tam kapsülden 16 px kompozit kontrole çekildi.
- Landing'deki gerçek CTA'lar 10 px köşeye çekildi; hızlı arama ve ilçe chip'leri kapsül kaldı.
- Wizard eylem butonları ve ekleme butonu 10 px; seçenek kartları 14 px oldu.
- Wizard'ın kayıtlı taslak karar ekranındaki eylemler de 10 px buton gramerine alındı.
- Wizard konum seçimi 12/8 px segmented-control gramerine geçti.
- Kamera emojisi çizgi SVG ikonuyla değiştirildi.
- Wizard select odağı `focus-visible` outline aldı.
- Wizard seçeneklerindeki yinelenen ikinci seçim halkası kaldırıldı; erişilebilir native radio tek kaynak olarak kaldı.
- İlerleme bilgisi dekoratif kapsülden çıkarılıp sade bir ayraç satırına dönüştürüldü.
- Skeleton search kemiği 16 px ile gerçek landing kontrolüne eşlendi.
- Güven mesajı üç kısa, taranabilir öğeye ayrıldı.

## Sonraki kontrollü dilimler

1. Renk token borcunu dosya bazında çıkarmak; yalnızca tekrar eden ve gerçekten semantik değerleri taşımak.
2. Wizard'ın 320/390/820/1440 px görsel QA matrisi ve modal state kontrolleri.
3. `/ustalar` filtre, rozet paneli ve liste eylemlerinde aynı buton gramerini denetlemek.
4. Loading skeleton'ların gerçek içerik geometrisiyle route bazında karşılaştırılması.
5. Hallmark bulgularını `quality` komutuna bağlamadan önce onaylı bir baseline/waiver politikası oluşturmak.

## Gemini ikinci görüş durumu

Gemini 3.8 Flash High ile önceki başarılı metin tabanlı karşılıklı inceleme kaydı korunmuştur. Bu inceleme, üç bounded dilim önermiştir: ortak Button primitive'i, `/ustalar` ikon/motion temizliği ve RequestWizard kontrol/CTA davranışı. Doğrudan dosya yazdıran patch oturumu zaman aşımına uğradığı için kod değişiklikleri Gemini yazmış gibi raporlanmamış, Codex tarafından kontrollü diff olarak uygulanmıştır.

Bu turun ilk çağrısında Antigravity CLI mevcut Windows süreç bağlamında OAuth beklemesine geçmiştir. Daha sonra aynı proje kanıt paketiyle, dosya yazma yetkisi vermeden, `--model gemini-3.8-flash-high --mode plan` kullanılarak ikinci görüş başarıyla alınmıştır. Gemini'nin karşı incelemesi şu üç noktayı doğrulamıştır: açık transition/focus-visible ve flex-basis motion temizliği doğru yöndedir; emoji yerine düz metin geçişi taranabilirliği azaltabileceği için sonraki dilimde çizgi SVG ikonlarıyla tamamlanmalıdır; loading/error/success durumlarında yükseklik ve CLS tekrar ölçülmelidir. Bu görüş dosya yazmadı; uygulanmış diff Codex tarafından bounded kapsamda tutuldu.

## Son uygulanan bounded dilim

- `Button.module.css`: 4px ritmine uygun 36/44/52px yükseklikler, semantic action token'ları, açık transition listeleri, sabit loading genişliği ve `focus-visible` halkası.
- `/ustalar`: avatar mor-pembe gradient kaldırıldı; split pane `flex-basis` motion'ı kaldırıldı; kullanıcıya dönük emoji ikonlar metin ve mevcut marka grameriyle değiştirildi; DB uyarısı kısa bir statü etiketi aldı.
- `RequestWizard`: ana action gradient'i düz semantic marka rengine alındı; kontrol olmayan rozetler 8–10px köşe gramerine çekildi; zaman seçimleri 44px dokunma alanını koruyan kontrollü köşelere alındı; uzun recovery eylemi mobilde güvenli sarılan erişilebilir bir butona dönüştü.

## Uygulama doğrulaması

- `npm run type-check`: başarılı.
- `npm run lint`: 0 hata, yalnızca Hallmark scriptlerinde 8 mevcut kullanılmayan-değişken uyarısı.
- `Button.test.tsx`, `RequestWizard.test.tsx`, `UstalarSplitView.test.tsx`: 3 dosya, 49/49 test başarılı.
- Gerçek tarayıcı smoke: dev sunucuda `/` ve `/ustalar?view=split&sort=recommended&fixture=limited` yüklendi; landing hero, discovery kartları ve wizard açılışı görsel olarak kontrol edildi.
- E2E QA matrisi: 52 testten 20'si geçti. Kalan 32 hata ağırlıklı olarak mevcut production fixture/test sözleşmesi kaymasına (`Usta bul` yerine `Hizmet bul`, production başlık fixture'ı ve canonical bridge beklentisi) bağlıdır. Wizard dokunma testi yalnızca production başlatımında 42.8–43.5px ölçerken dev sunucuda close 48px ve devam 52px ölçüldü; bu nedenle hata sessizce kapatılmadı, ayrı bir production build fixture dilimine bırakıldı.
- Hallmark statik taraması devam eden dosya-bazlı renk literal'larını, eski emoji/legacy yüzeyleri ve görsel tercihleri ayrıca raporlamaya devam ediyor. Bu bulguların tamamı otomatik olarak düzeltilmeyecek; sonraki dilimler yüksek etkili ve düşük riskli sırayla seçilecek.

## Production E2E ve ölçüm dilimi, 2026-10-23

Bu dilimde üretim sözleşmesi güncellendi ve doğrulandı:

- Landing arama E2E'si `Hizmet bul` ve mobil `Bul` erişilebilir adlarını, 320/390/820/1440 px arama genişliğini ve canonical `/ustalar?view=split&sort=recommended` köprüsünü kullanıyor.
- `/ustalar` responsive sözleşmesi CSS Module sınıf isimlerine değil, `Mobil usta listesini göster` erişilebilir buton adına bağlandı. Böylece üretim hash'leri test sözleşmesini bozmaz.
- `scripts/playwright-server.ts`, production E2E fixture'ını `ORKESTRA_DIRECTORY_VISUAL_FIXTURES=true` ile deterministik başlatıyor.
- `/ustalar` quote modalındaki kapatma, konum ve güven göstergeleri mevcut çizgi SVG ailesiyle (`IconClose`, `IconLocation`, `IconShield`) veriliyor. Kapatma kontrolü 44px dokunma alanına çıkarıldı.
- Landing ve `/ustalar` için `production-loading-contract.spec.ts` eklendi. PerformanceObserver CLS ve CTA/çekmece dokunma alanlarını 4 viewport ve 4 Playwright projesinde ölçüyor.

Üretim doğrulama sonucu:

- `home-discovery.spec.ts` + `wizard-redesign.spec.ts`: 36/36 geçti.
- `ustalar-support-responsive.spec.ts`: 16/16 geçti.
- `production-loading-contract.spec.ts`: 16/16 geçti.
- Gözlenen CLS değerleri çoğunlukla `0.0000`; en yüksek değer `0.0086`, kabul eşiği `0.05`.
- Landing CTA ve mobil çekmece düğmeleri ölçümde en az 44px yükseklik koşulunu sağladı.
- Hedef component testleri: `UstalarSplitView`, `RequestWizard`, `DiscoveryWorkDetail`, toplam 51/51 geçti.
- `npm run type-check`, `npm run lint -- --quiet` ve `npm run build`: başarılı.

Bu sonuç, production loading ve E2E sözleşmesinin bu dilim için uygulanabilir olduğunu gösterir. Sonraki dilim, ölçüm çıktısını CI kalite kapısına bağlamak veya yeni bir görsel yüzey eklemek değil, önce bu değişikliklerin ayrı bir checkpoint commit'e alınması için kullanıcı onayı beklemektir.

### Gemini 3.8 Flash High bağımsız son görüşü

Gemini, kanıt paketini üç başlıkta değerlendirdi:

- **Kabul:** E2E, component, type-check, lint ve build kapıları ile CLS/touch kriterleri karşılandı; SVG, erişilebilir seçici ve deterministik fixture yaklaşımı doğru bulundu.
- **Risk:** Çalışma ağacının bilerek dirty kalması, fixture ile gerçek API arasındaki fark ve `lint --quiet` nedeniyle warning görünürlüğünün azalması.
- **Sonraki adım:** Atomik checkpoint commit ve CI doğrulaması, ardından gerçek staging smoke testi.

Bu görüş dosya değiştirmeden, `--model gemini-3.8-flash-high --mode plan` ile alındı. Commit/push bu rapor diliminde yapılmadı.

## Landing page visual refinement, 2026-10-23

Bu ayrı bounded dilim yalnızca landing yüzeyindeki iskelet, container ve eylem butonlarını ele aldı. Wizard ve diğer route'lara dokunulmadı.

Gemini 3.8 Flash High ile kararlaştırılan tasarım yönü:

- Hero dış yüzeyi `16px` radius ve tek katmanlı ambient gölgeye indirildi.
- Glass efekti yalnızca arama satırında bırakıldı ve blur `12px` ile sınırlandı. Hızlı aksiyonlar, ilçe çipleri ve discovery yüzeyleri artık cam efekti kullanmıyor.
- Arama CTA'sı 46px inset kontrol, 10px radius ve marka yeşiliyle daha belirgin hale getirildi.
- Discovery görsel yüzeyleri 10px radius, ince sınır ve daha sakin hover gölgesiyle sadeleştirildi.
- Discovery altındaki iki CTA aynı 10px kontrol gramerine ve en az 44px dokunma yüksekliğine getirildi.
- İlçe çipleri 44px minimum dokunma yüksekliğine çıkarıldı.
- Hizmet dizini summary satırı 48px minimum yüksekliğe, görünür sınır ve focus durumuna alındı; servis düğmeleri de 44px dokunma alanına taşındı.
- Kategori scroll oku için dekoratif gradient kaldırıldı.

Hallmark statik taraması bu üç dosyada 97 floor, 23 reflex ve 4 warning raporladı. Bulguların çoğu bu dilimden önce var olan literal renkler, stamp/token politikası ve spacing borcudur. Bunlar landing polish kapsamını büyütmemek için toplu biçimde değiştirilmedi. Glass warning'i bilinçli olarak tutuldu, çünkü kullanıcı brief'inde hero arama yüzeyi için cam katman açıkça istenmiş ve tek yüzeyle sınırlandırılmıştır.

Bu dilimin doğrulaması:

- `npm run styles:check`: başarılı.
- `npm run type-check`: başarılı.
- `npm run lint -- --quiet`: başarılı.
- `npm run build`: başarılı.
- Landing E2E + production loading: `28/28` başarılı.
- CLS ölçümü: tüm viewport'larda `0.0000` veya `0.0086`; eşik `0.05`.
