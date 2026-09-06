# Orkestra: görev odaklı arayüz yenilemesi

## Amaç ve kapsam

Kullanıcının 20 UX ilkesi esas alınır. Renk tokenları ve beş daireli logo korunur. Her ekranın ana görevi, birincil eylemi ve hata sonrası geri dönüşü açık olmalıdır. İlkelerin birbiriyle çeliştiği yerde erişilebilirlik, kullanıcı kontrolü ve görevin tamamlanması önceliklidir.

Bu belge bütün ekranların yeniden tasarlandığını iddia etmez. İlk uygulama ana sayfa ve hizmet keşfidir. Aşağıdaki diğer dilimler uygulama sırasıdır; gerçek hesaplı ekranların görsel doğrulaması henüz bu çalışma kapsamında yapılmadı.

Çalışma başlangıcında wizard, eşleştirme stilleri, harita, hesap formu, usta dizini, başvuru ve ortak çerçevede commit edilmemiş değişiklikler vardı. Bu değişiklikler korunmuştur; bu dilimin başarısı olarak sayılmaz.

## Tasarım kararı

Aydınlık, mevcut beyaz/lemonade yüzeyler; ana eylemlerde mevcut kobalt. Hareket yerine bilgi hiyerarşisi. DESIGN_VARIANCE 3, MOTION_INTENSITY 2, VISUAL_DENSITY 4. Yeni animasyon veya font eklenmedi.

| Before | After | Why |
| --- | --- | --- |
| Orta genişlikte yaklaşık 250 px arama, kesilen örnek metin | 680 px'e kadar büyüyen tam genişlikli arama; 600 px altında alt alta alan ve düğme | Kullanıcının ana görevine kullanılabilir alan ayırmak |
| Ekran okuyucuya özel arama etiketi | Her zaman görünen etiket | Yazı girildikten sonra da alanın amacı anlaşılır |
| Sayılı, tekrarlayan büyük kategori kartları | İki sütunlu açılır satırlar; mobilde tek sütun | Hizmet seçimini korurken ilk taramayı kısaltmak |
| Her kartta hem 01 hem 1. başlığı | Anlamlı üç adımlı sıralı liste | Aynı bilgiyi iki kez söylememek |
| Teknik ve uzun süreç açıklamaları | İşi anlat, teklifleri karşılaştır, işi takip et | Ürünü iç terimler yerine kullanıcının işi üzerinden açıklamak |
| Eşleşmeyen aramada kategori ilk hizmeti otomatik başlatıyor | Aramayı düzenle veya kategorilerden hizmet seç | Kullanıcı adına yanlış hizmet seçmemek; arama metnini korumak |
| Ana sayfa sınıfları global ve ortak çerçeve stillerine bağlı | Ana sayfa düzeni home.module.css içinde | Başka ekranların stilleriyle çakışmadan düzenleyebilmek |

Eski global ana sayfa seçicileri bu dilimde silinmedi. Ortak CSS dosyaları başlangıçta değişikti; bağımlılık taramasından sonra ayrı temizlik yapılmalı. Bu nedenle tüm CSS borcunun kapandığı ileri sürülmez.

## Ekran envanteri ve uygulama sırası

Envanter `app/**/page.tsx` dosyalarından çıkarıldı; rota bulunması işlevin canlı olarak doğrulandığı anlamına gelmez.

| Dilim | Ekranlar | Ana görev ve tasarım yönü | Tamamlanma kanıtı |
| --- | --- | --- | --- |
| U1: hizmet keşfi | `/`, eşleştirme dialogu | Açıklama gir veya kategoriden hizmet seç; seçim kullanıcıda kalsın | Bileşen, viewport ve klavye testleri |
| U2: talep hazırlama | Wizard, `/ustalar/[id]/talep` | Tek soru odağı; tek ilerleme bilgisi; medya isteğe bağlı; son adımda sade fiş | 320/390/820/1440, geri/ileri, taslak ve auth dönüşü; seçili usta kaybolmamalı |
| U3: uzman seçimi | `/ustalar`, `/ustalar/[id]`, `/harita` | Filtreleri kademeli aç; hizmet/bölge ve doğrulanmış kanıt önce; harita yardımcı | Filtre temizleme, boş sonuç, uzun isim, ağ hatası; gerçek veriyle kontrol |
| U4: hesap | `/giris`, `/kayit`, `/usta/giris`, `/usta/kayit`, `/parola-yenile`, `/hesap` | Kimlik, bölge, oturum grupları; açık rol seçimi; çıkış ikincil eylem | Alan hataları, kayıtlı veriyi koruma, hesap değişimi, navbar tutarlılığı |
| U5: müşteri/usta talepleri | `/taleplerim`, `/usta/talepler`, `/usta/musaitlik` | Durum ve beklenen eylem önce; harita ve diğer bilgiler sonra | Boş/yüklü/hata, dar ekran, rol ayrımı, gerçek hesaptan görev tamamlama |
| U6: anlaşma | `/taleplerim/[id]/teklifler`, `/usta/teklifler/[requestId]`, `/teklifler/[id]` | Güncel sürüm, fiyat, kapsam ve farklar; kabul tek belirgin eylem | Eski sürüm, revizyon, fiyat/süre farkları; eşzamanlı kabul testleri korunur |
| U7: görüşme ve iş | `/gorusmeler`, `/gorusmeler/[requestId]/[professionalId]`, `/islerim`, `/islerim/[id]` | Görüşme bağlamı; gönderim durumu; iş aşamasına göre ilgili kontroller | Yeniden dene, çift gönderim, okunmamış, iş kabulü ve bağlantı dönüşü |
| U8: operasyon | `/uyusmazliklar/[id]`, `/yonetim/uyusmazliklar`, `/yonetim/uyusmazliklar/[id]`, `/yonetim/moderasyon`, `/yonetim/usta-basvurulari` | Kanıt, süre ve sonraki eylem; karar gerekçesi; iç not/katılımcı mesajı ayrımı | Rol erişimi, yanlış karar önleme, klavye, gecikme ve boş durumlar |
| U9: bilgilendirme | `/nasil-calisir`, `/usta-basvurusu`, `/yardim`, `/gizlilik`, `/kullanim-kosullari` | Kısa başlık, okunabilir metin, ilgili eylem; aynı vaadi tekrarlamamak | İç link/anchor, form etiketi, mobil okuma, içerik doğruluğu |
| Referans alanları | `/concepts`, `/inspiration`, `/motif-lab` | Müşteri görevleri dışında tut; ürün gezinmesine karıştırma | Navigasyon ve yayın kapsamı ayrıca kontrol edilir |

## Kaynak incelemesinde sonraki somut noktalar

- Hesap sayfasında görünen ad hem bilgi listesinde hem düzenleme formunda bulunuyor. Kimlik özetini e-posta/rol ile sınırlamak, ad düzenlemeyi tek yerde yapmak değerlendirilmeli. Kaydetme sonrası navbar güncellemesi bozulmamalı.
- Görüşme listesinde ana tanımlayıcı kısaltılmış talep kimliği ve tarih. Hizmet adı bağlamı daha anlaşılır olabilir; erişim kurallarını genişletmeden mevcut sorgu sözleşmesi incelenmeli.
- İş listesi her satırda aynı güçlü düğmeyi kullanıyor. Listede satır bağlantısı, detayda ise iş aşamasına ait birincil eylem tercih edilmeli.
- Wizard'da viewport yüksekliği sınırlandırılmış ve bir içerik kaydırma alanı var. Uzun içerikte kaydırmayı tamamen kapatmak çözüm değildir; son eylemin görünürlüğü, odak sonrası kaydırma ve klavye açıldığında kullanılabilir yükseklik ölçülmeli.
- Çalışma başlangıcındaki ortak CSS değişikliklerinde `transition: all` ve border ile geniş gölge birlikte kullanılıyor. Temizlik, mevcut değişikliklerle karşılaştırılarak yapılmalı; yeni üstüne-yazma katmanları biriktirilmemeli.

Bunlar kaynak temelli inceleme noktalarıdır; gerçek hesapla gözlemlenmiş hata etiketi taşımaz.

## Her dilim için kalite kapısı

1. Ana kullanıcı amacı ve birincil eylem yazılı olarak belli.
2. Default, hover, focus, active, disabled, loading, error, success durumları uygulanabilir yerde kontrol edilir.
3. 320/390/820/1440 px: yatay taşma yok; kontroller en az 44 px; içerik büyüyünce düğmeler kaybolmaz.
4. Klavye: doğal sıra, görünür odak, dialog kapanınca odağın geri dönmesi; yalnız hover ile bulunan fonksiyon yok.
5. Hata kullanıcı girdisini kaybettirmez. Sunucu başarısı olmadan gönderildi/kabul edildi denmez.
6. Para, yetki, gizlilik, taslak sahipliği ve teklif sözleşmesi görsel düzenleme uğruna değiştirilmez.
7. Hedefli testler, type-check ve üretim build; gerçek hesaplı kanıt ayrı kaydedilir.
8. Uygulandı, yerel doğrulandı, çoklu hesap doğrulandı ve yayınlandı durumları ayrı tutulur.

## U1 doğrulama kaydı

- Tarayıcıda önce/sonra incelendi: arama genişliği ve görünür etiket, kategori başlangıcı.
- `ServiceMatch.test.tsx`: 6 test geçti; alternatif seçimi, Escape ve metni koruyan eşleşmeme kurtarma yolu dahil.
- `home-discovery.spec.ts`: iki senaryo geçti. İlk senaryo 320, 390, 820, 1440 px genişlik/taşma/eylem ölçümü; ikincisi eşleşmeme sonrası kategorilere dönüş ve Enter ile açma.
- Playwright iki senaryoyu `ok` olarak bildirdi, ancak sunucu kapanışında süreç sonlanmadı ve kesildi (çıkış kodu 1). Bu sonuç temiz bir tam E2E koşusu veya CI yeşili olarak sunulamaz; teardown ayrıca incelenmeli.
- TypeScript ve değişen TSX/test dosyaları için ESLint geçti. Üretim build geçti.
- Fiziksel telefon, yardımcı teknoloji, gerçek hesaplı akış, tam regression ve yayın doğrulaması bu kayıt kapsamında değil.
- Commit/push yapılmadı. Bu dilim yalnız yerel değişikliktir.

## U2 son kontrol ve U3 ilk dilim, 6 Eylül 2026

`design-taste` değerlendirmesi: mevcut aydınlık beyaz/lemonade sistemi, kobalt ana eylem; düzen 3, hareket 1, yoğunluk 4. İşlem ve erişim sözleşmeleri değiştirilmedi.

| Before | After | Why |
| --- | --- | --- |
| Her yanıt yanında Değiştir | Bölüm başına erişilebilir isimli kalem düğmesi | Tekrarlanan eylemleri azaltmak; düzenlemeyi görünür tutmak |
| Harita açıklamaları bir arada | İsteğe bağlı harita, açılır diğer seçenekler | Gönderimin haritaya bağlı olmadığını korumak |
| Global giriş düğmesi hover rengi | Wizard'a ait kobalt giriş eylemi | Eski yeşil hover ve global stil sızıntısını önlemek |
| Gerçek liste yanında örnek harita sekmesi | Gerçek liste ana görünüm; örnek haritaya açıklamalı yardımcı bağlantı | Örnek dükkânları gerçek sonuç sanmayı önlemek |
| Profil kartında bölge eksik | Hizmet bölgesi, uzmanlık ve başvuru onayı | Karşılaştırmayı fiyat dışı bağlama oturtmak |
| Profil geçişinde filtre bağlamı kayboluyor | Hizmet ve ilçe URL'de; sunulan hizmetse talep formunda seçili | Yanlış hizmeti kendiliğinden seçmeden yolculuğu sürdürmek |
| Kart sütunu en az 320 px | Kapsayıcıdan genişlemeyen sütun, uzun isim sarma | 320 px cihazda sayfa kenar boşluklarıyla taşmayı önlemek |

### Kanıt

- RequestWizard, DirectedRequestWizard ve WizardRegionPreview: 21 bileşen testi geçti.
- ProfessionalDirectory: 3 test geçti; filtre bağlamı, bölge/onay metni, örnek haritanın listeyi değiştirmemesi, boş sonuç ve sorgu hatasının ayrımı. Veri mock'tur, canlı yetki kanıtı değildir.
- Wizard E2E: 320/390/820/1440 px dört senaryo `ok`; yanıtı kalem düğmesiyle düzenleme, özette güncelleme, konumun korunması, odak, giriş eyleminin görünürlüğü ve Escape sonrası scroll kilidinin kalkması kontrol edildi. 320/1440 ekran görüntüleri incelendi.
- E2E webServer kapanışında süreç yine sonlanmadı; test sonuçları geldikten sonra kesildi (exit 1). Temiz CI/E2E tamamlanması iddia edilmiyor.
- TypeScript, hedefli U3 ESLint ve üretim build geçti. Son görsel incelemede bulunan giriş bağlantısının global hover rengi ayrıca yerel CSS'e taşındı.

### Durum ve kalan kapılar

U2 yerel etkileşim kontrolü yapıldı; U3 ilk dilimi uygulandı ve bileşen testleriyle doğrulandı. Gerçek hesap/gerçek usta verisiyle U3 görsel ve uçtan uca doğrulama bekliyor. Kontrol sırasında `localhost:3000/ustalar` bağlantıyı reddetti. Profil üzerinden seçili ustaya gönderim, gerçek auth dönüşü, dış harita yüklenmesi ve fiziksel cihaz testleri tamamlandı sayılmaz. Veritabanı, feature flag ve yetkiler değiştirilmedi; commit/push/yayın yapılmadı. Sonraki dilim: gerçek listede filtre temizleme, uzun ad ve profil geçişini dört genişlikte doğrulamak; ardından seçili ustalı auth dönüşünü izole test ortamında tamamlamak.
