# PUX-7.5 Wizard Grid ve Spacing Denetim Raporu

**Proje:** the-welding-expert-app  
**Tarih:** 19 Temmuz 2026  
**Kapsam:** Müşteri randevu wizardı; hizmet, zaman tercihi, iletişim ve başarı durumları  
**Çalışma biçimi:** Yalnız yerel geliştirme; push, deploy ve veritabanı değişikliği yok

## 1. Dayanak

Denetim; mevcut bilişsel yük raporu, PUX-7.5 wizard raporları ve Plerdy Usability/Conversion/Local Service kontrol listeleriyle eşleştirildi. Plerdy sayısal bir padding standardı tanımlamaz; kısa form, tek baskın CTA, açık adım sayısı, yeterli dokunma hedefi, mobilde taşmasız yerleşim ve ana göreve ayrılan dikkat bütçesini kontrol eder. Bu nedenle spacing kararları ürünün viewport matrisi üzerinde ölçülebilir kabul kriterlerine çevrildi.

## 2. Bulunan sorunlar

1. Mobilde sayfa paddingi ile wizard paddingi üst üste biniyor, gerçek görev alanı her iki yanda gereksiz daralıyordu.
2. Haftalık takvim rayı ilk kartı ortalamak için büyük başlangıç paddingi kullanıyordu. Bu boşluk seçim alanını daraltıyor ve ilk görünümde yalnız yaklaşık iki gün gösteriyordu.
3. Wizard dış kabuğu ana gridle hizalı olsa da stepper, panel, seçim kartları ve CTA aralıkları ortak bir spacing kaynağı kullanmıyordu.
4. İletişim özeti tam genişlikteyken form merkezde ve daha dar kalıyor; iki yüzeyin sol ve sağ ekseni ayrışıyordu.
5. Ana araştırma raporundaki 760-900 px wizard önerisi, daha sonra kabul edilen ana içerik gridine hizalı dış kabuk kararıyla çelişiyordu.

## 3. Uygulanan yerleşim sistemi

### 3.1 Dış kabuk

- Masaüstünde wizard dış kabuğu ana içerik gridinin 1180 px üst sınırını korur.
- Masaüstü iç paddingi `clamp(24px, 2.2vw, 32px)` olur.
- `640px` ve altında wizard tam viewport genişliğine açılır; sayfa paddingi negatif dış marjla dengelenir.
- Mobil görev içeriği solda ve sağda tek `16px` oluk kullanır.
- `380px` altındaki 12 px sayfa paddingi ayrıca dengelenir; wizard iç oluğu yine 16 px kalır.

### 3.2 Dikey ritim ve grid

- Bölüm aralığı masaüstünde 20 px, mobilde 16 px olarak ortak değişkene bağlandı.
- Kontrol/kart aralığı masaüstünde 10 px, mobilde 8 px olarak ortak değişkene bağlandı.
- Stepper ve aktif adım gövdesi aynı sol-sağ ekseni kullanır.
- Hizmet gridi masaüstünde iki eşit kolon, mobilde tek kolon olarak kalır.
- Tek hizmet seçeneği önceki ürün kararı gereği ortalanmış ve en fazla 560 px tutulmuştur.

### 3.3 Takvim

- Mobil raydaki yapay merkez paddingi kaldırıldı.
- İlk gün, takvim içeriğinin sol ekseninden başlar.
- Gün kartları mobil/tablette en az 108 px genişlikte yatay kaydırılır; 390 px ekranda yaklaşık üç gün aynı anda okunabilir.
- Saat paneli takvimin yanında değil altında kalır; görev sırası gün -> saat -> iletişim olarak görsel sırayla eşleşir.

### 3.4 İletişim

- Plerdy'nin tek kolon form yaklaşımı korundu.
- Talep özeti ve form aynı 840 px üst sınıra ve aynı sol eksene bağlandı.
- Mobilde özet, form alanları, gizlilik metni ve gönderim CTA'sı aynı 16 px oluğu paylaşır.

## 4. Ölçülebilir kabul kriterleri

| Kontrol | Kabul |
| --- | --- |
| 320/390 px wizard dış kabuğu | Viewport ile ±1 px eşit |
| Mobil stepper sol/sağ oluk | 16 px ±1 px |
| Mobil adım gövdesi sol/sağ oluk | 16 px ±1 px |
| Takvim ilk gün başlangıcı | Rayın sol ekseniyle ±1 px eşit |
| Saat paneli | Takvim panelinin altında |
| Masaüstü özet/form | Aynı x konumu ve aynı genişlik |
| Wizard iç taşması | Tüm adımlarda 0 px |
| Dokunma hedefi | En az 24x24 px; ana kontroller 44 px veya üzeri |
| Klavye akışı | Hizmetten başarıya kesintisiz |

## 5. Test kapsamı ve sonuç

| Paket | Sonuç |
| --- | --- |
| Unit/component | 24 dosya, 93/93 geçti |
| Playwright E2E | 56/56 geçti |
| Responsive | 320, 360, 390, 768, 1024, 1366, 1440, 1920 px geçti |
| Erişilebilirlik | Klavye, %200 eşdeğer reflow, reduced motion ve forced colors geçti |
| Görsel regresyon | Hizmet, keşif, takvim, saat, iletişim, başarı ve edge viewport baselineları güncellendi |

## 6. Plerdy sonrası doğrulama

Plerdy/predictive attention çıktıları gerçek kullanıcı davranışı değildir. Yayın sonrasında bu düzen için izlenecek hipotezler:

- `booking_step_completed` adım 1 -> 2 dönüşümü,
- zaman adımında gün seçimine kadar geçen süre,
- takvimde yatay etkileşim ve sonraki hafta kullanımı,
- iletişim adımındaki doğrulama hatası oranı,
- mobil form terk oranı.

Bu çalışma yerelde tamamlandı. Veritabanı migrationı, Supabase işlemi, git push veya canlı yayın gerektirmez.

## 7. Masaüstü zaman seçimi ek denetimi

İlk spacing revizyonundan sonra masaüstü zaman ekranı ayrıca incelendi. Takvim doğru genişlikte olmasına rağmen saat matrisi solda en fazla 720 px ile sınırlı kalıyor, CTA ise wizardın sağ kenarına yerleşiyordu. Bu ayrışma seçilen gün -> saat -> devam ilişkisini zayıflatıyor ve geniş ekranda tesadüfi boşluk üretiyordu.

Uygulanan düzeltme:

- Seçilen gün özeti masaüstünde sol bağlam sütununa alındı.
- Saat seçenekleri sağ görev sütununda gerçek `3x2` matris olarak genişletildi.
- `İletişime Geç` CTA'sı saat sütununun altında aynı eksene taşındı.
- Sütunlar `Seçilen gün` ve `Saat seçin` mikro etiketleriyle adlandırıldı.
- `900px` ve altında düzen tek sütuna döner; gün, saat ve CTA doğal dikey sırayı korur.
- Görsel regresyon verisi altı saat aralığına çıkarıldı; boş, seçilebilir ve seçilmiş durumlar ayrı doğrulandı.

Ek kabul kriterleri:

| Kontrol | Kabul |
| --- | --- |
| Masaüstü seçilen gün/saat matrisi | Ayrı iki sütun; saat sütunu sağda |
| Saat matrisi/CTA | Aynı x ekseni ve aynı görev sütunu |
| Tablet zaman akışı | Gün özeti üstte, saat matrisi altta |
| Gerçekçi yoğunluk | Altı saat aralığıyla `3x2` desktop ve `2x3` mobil test |

## 8. Masaüstü iletişim adımı ek denetimi

Zaman adımındaki yerleşim düzeltmesinin ardından iletişim adımı da aynı görev alanı ölçütleriyle yeniden incelendi. Talep özeti ve formun aynı 840 px sol kolonda art arda durması, 1180 px wizard yüzeyinin sağında büyük ve işlevsiz bir alan bırakıyordu. Form alanları gereğinden fazla uzuyor, kısa özet ise form ile aynı görsel ağırlığı taşıyordu.

Uygulanan düzeltme:

- Form, masaüstünde sol ana görev sütununda ve tek kolonlu olarak korunur.
- Talep özeti sağdaki ikincil bağlam sütununa taşınır; tarih, saat ve hizmet dikey taranır.
- Ana `Talebi Gönder` CTA'sı form sütununun genişliğini ve x eksenini paylaşır.
- Özet içindeki `Değiştir` ikincil eylemi özet sütununda kalır ve ana CTA ile yarışmaz.
- `900px` ve altında özet yeniden formun üstüne gelir; DOM ve görsel okuma sırası özet -> form -> CTA olur.
- İletişim adımının alan sayısı, doğrulama davranışı ve gönderim mantığı değiştirilmemiştir.

Ek kabul kriterleri:

| Kontrol | Kabul |
| --- | --- |
| Masaüstü form/özet | Form solda, özet ayrı sağ bağlam sütununda |
| Form/CTA ekseni | Aynı x konumu ve aynı genişlik |
| Tablet iletişim akışı | Özet üstte, form altta; aynı genişlik |
| Wizard yatay taşması | 0 px |
| İçerik önceliği | Tek baskın gönderim CTA'sı; özet düzenleme ikincil |

### 8.1 Mobil iletişim matrisi

İletişim yerleşimi yalnızca tek bir telefon ölçüsüne göre kabul edilmedi. `320x568`, `360x640`, `375x667`, `390x844`, `412x915`, `430x932` ve `667x375` mobil yatay görünümde aynı geometri sözleşmesiyle doğrulanır.

- Talep özeti formun üstünde kalır.
- Özet, form ve gönderim CTA'sı aynı sol-sağ ekseni kullanır.
- Form kontrolleri kendi sütun sınırlarını aşmaz.
- Özet düzenleme ve gönderim kontrolleri en az 44 px yüksekliğini korur.
- Kök sayfada, wizard'da veya form yüzeylerinde yatay taşma oluşmaz.
- Kontrol metinleri kırpılmaz; uzun metinler doğal satır kırılımıyla okunur.

## 9. Hizmete dönüş ve zaman adımı etkileşim revizyonu

Stepper içindeki `1 Hizmet` kontrolü, önceki seçim mevcut olsa bile kullanıcıyı doğrudan kategori başlangıcına döndürür. Seçim silinmez; kullanıcı ilgili kategoriye yeniden girdiğinde önceki hizmet seçili olarak görünür. Böylece geri dönüş davranışı tahmin edilebilir olurken yanlışlıkla veri kaybı oluşmaz.

Zaman adımında yapılan yerleşim düzeltmeleri:

- Düz metin görünümündeki hizmet satırı, tam genişlikte `Seçilen hizmet` özeti ve çerçeveli kalem ikonlu `Değiştir` kontrolüne dönüştürüldü.
- Yalnızca düzenleme butonu tıklanabilir; özet yüzeyi yanlış bir etkileşim beklentisi üretmez.
- Hizmet özeti ile gün araç çubuğu arasındaki yinelenen ayırıcılar kaldırıldı.
- Gün seçilmeden önceki saat açıklamasının yapay minimum yüksekliği kaldırıldı.
- Saat panelinin üst paddingi ve iç aralıkları sıkılaştırıldı.
- `İletişime Geç` CTA'sı saat matrisiyle aynı genişlik ve x eksenine bağlandı; mobilde çalışmayan iç sarmalayıcı kaldırıldı.

Ek kabul kriterleri:

| Kontrol | Kabul |
| --- | --- |
| `1 Hizmet` dönüşü | Kategori başlangıç ekranı görünür |
| Önceki hizmet | Korunur ve kategori tekrar açıldığında seçili görünür |
| Hizmet düzenleme hedefi | Belirgin, en az 44 px yüksekliğinde tek buton |
| Hizmet özeti/takvim | Aynı genişlik ve x ekseni; aralık en fazla 20 px |
| Saat matrisi/CTA | Aynı genişlik ve x ekseni |
| Boş saat durumu | Yapay minimum yükseklik olmadan kısa yönlendirme |

## 10. Yönlendirme başlığı ve wizard bütünlük denetimi

Müşteri yönlendirmesi ile wizard birlikte ele alındığında sorun yalnızca tekil padding değerleri değildi. Sayfanın üstünde henüz hiçbir içerik bölümü görünür değilken `Hizmetler` bağlantısının aktif görünmesi yanlış konum bilgisi veriyor, asimetrik yan kolonlar menüyü optik merkezden uzaklaştırıyor ve iki ikonlu tema kontrolü tek bir ayar yerine iki ayrı karar gibi algılanıyordu. Wizard içinde ise geri dönülen hizmet başlangıcında görünmeyen eski seçime bağlı bir devam CTA'sı bulunuyor, stepper'ın görünür hedeften çok daha geniş tıklama alanı ve iletişim formundaki görünmez hata satırları yerleşim ritmini bozuyordu.

Uygulanan düzenlemeler:

- Üst menü sayfa sırasına göre `İşler`, `Hizmetler`, `İletişim` olarak düzenlendi.
- Bir bölüm gerçekten okuma eşiğine ulaşmadan hiçbir menü bağlantısı aktif gösterilmez.
- Başlık üç eşdeğer grid bölgesi kullanır; orta menü, logo ve sağ eylem genişliğinden bağımsız olarak optik merkezde kalır.
- Tema kontrolü tek, 44 x 44 px ikon düğmesine indirildi; ikon mevcut durumu değil yapılacak eylemi anlatır.
- Hero görünürlüğü için küçük kesişim eşiği kullanılarak başlıktaki `Randevu Al` eyleminin sayfa ilerledikçe güvenilir biçimde görünmesi sağlandı.
- Hizmet kategori başlangıcında görünmeyen korunmuş seçime bağlı devam CTA'sı kaldırıldı. Devam eylemi yalnızca kullanıcı bir kategori içindeyken ve seçimini görebilirken sunulur.
- Stepper kontrollerinin tıklama alanı görünür etiket çevresinde sınırlandı; bir sütunun tamamı belirsiz tıklama yüzeyi değildir.
- Stepper alt boşluğu ve wizard ana ritmi sıkılaştırıldı; başlık ile aktif görev arasındaki mesafe azaltıldı.
- İletişim formundaki boş hata satırları yalnızca gerçek hata olduğunda oluşturulur.
- Başlıkta zaten açıklanan arama/WhatsApp bilgisi telefon alanının altında tekrar edilmez.

Bu kararlar rapordaki düşük bilişsel yük, görünür sistem durumu, tek baskın eylem ve Quiet Craft ilkelerine dayanır. Başlık yön buldurur; wizard görev yaptırır. İki katman aynı anda birden fazla aktif durum veya yinelenen açıklama üretmez.

Ek kabul kriterleri:

| Kontrol | Kabul |
| --- | --- |
| Sayfa üstü menü durumu | Aktif bağlantı yok |
| Menü sırası | Sayfadaki içerik sırasıyla aynı |
| Masaüstü menü geometrisi | Viewport ve başlık yüzeyinin optik merkezinde |
| Tema kontrolü | Tek ikon, 44 x 44 px, erişilebilir ad ve tooltip |
| Hizmet başlangıcı | Görünmeyen seçime bağlı CTA yok |
| Stepper hedefi | Etiket çevresinde belirgin; boş sütun alanı tıklanmaz |
| İletişim alan ritmi | Hata yokken ayrılmış boş hata satırı yok |
| Tekrarlanan açıklama | Arama/WhatsApp bilgisi yalnızca adım girişinde |
| Yatay taşma | 320-1920 px aralığında 0 px |

## 11. Tek görev ekseni revizyonu

Ek masaüstü denetiminde önceki iki kolonlu çözümlerin teknik olarak hizalı olmasına rağmen algısal boşluk ürettiği görüldü. Zaman adımında kısa gün özeti solda, saat matrisi ve CTA sağda kaldığı için sol kolon erken bitiyordu. İletişim adımında kısa talep özeti sağda, form solda uzadığı için sağ kolon erken bitiyordu. Her iki durumda da dış kabuk dengeli olsa bile görev içeriği sayfanın bir tarafında birikmiş görünüyordu.

Yeni karar:

- Takvim haftası tam genişliği korur; hafta ileri/geri kontrolü takvim ekseninin gerçek merkezine yerleşir.
- Seçilen tarih, saat matrisi ve `İletişime Geç` CTA'sı en fazla 840 px genişliğinde tek merkez görev kolonunda sıralanır.
- Tarih kartında zaten görünen seçimi tekrar eden `Seçilen gün` mikro etiketi kaldırılır.
- Devre dışı CTA'nın üstündeki yinelenen `İlerlemek için bir saat aralığı seçin` açıklaması kaldırılır.
- Talep özeti, formdan kopuk sağ kolon yerine formun üstünde yatay ve taranabilir bir şerit olur.
- Talep özeti, form, güven notu ve `Talebi Gönder` CTA'sı aynı 840 px merkez eksenini paylaşır.
- Stepper geri dönüş kontrollerinde 140 px genişliğinde dolu hover bloğu kullanılmaz; geri bildirim yalnız adım işaretinin çevresinde verilir.
- Wizard ana bölüm aralığı masaüstünde 16 px, mobilde 14 px ortak ritme bağlanır.

Bu revizyon Hick-Hyman açısından yeni seçenek eklemez; Gestalt yakınlık ilkesi açısından aynı karara ait tarih, saat ve devam eylemini yakınlaştırır. Plerdy attention-budget yaklaşımı açısından işlevsiz beyaz alanı yeni içerikle doldurmak yerine görevin görsel yolunu belirginleştirir. Quiet Craft hedefi bakımından premium algı gölge veya dekorasyonla değil, ölçülü genişlik, simetrik boşluk ve tekrarların çıkarılmasıyla kurulur.

| Kontrol | Kabul |
| --- | --- |
| Masaüstü slot görev kolonu | En fazla 840 px ve takvim yüzeyinde merkezde |
| Tarih/saat/CTA | Aynı x ekseni ve genişlik |
| Masaüstü özet/form/CTA | Aynı x ekseni ve genişlik |
| Okuma sırası | Tarih -> saat -> CTA; özet -> form -> güven -> CTA |
| Hafta kontrolü | Takvim yüzeyinin optik merkezinde |
| Stepper hover | Büyük dolu dikdörtgen yüzey yok |
| Mobil iç oluk | Her iki yanda 16 px |
| İç yatay taşma | En fazla 1 px |

## 12. Zaman seçimi karar yüzeyi sadeleştirmesi

Tek görev ekseni sonrasında yapılan görsel denetimde haftanın yedi gününün aynı kart biçiminde gösterilmesi yeni bir bilişsel sorun olarak belirlendi. Geçmiş, kapalı veya planlanmamış günler tıklanamasa da buton biçimini koruyor; kullanıcı gerçek seçenekleri ayırt etmek için önce işlevsiz seçenekleri taramak zorunda kalıyordu. Seçilen tarih ayrıca gün kartında, tarih başlığında ve saat açıklamasında yineleniyordu.

Uygulanan sadeleştirme:

- Yalnız bugünden sonraki, kapalı olmayan ve en az bir uygun saati bulunan günler seçim yüzeyinde gösterilir.
- Geçmiş, kapalı ve planlanmamış günler buton olarak oluşturulmaz.
- Tek uygun gün varsa kart 280 px üst sınırla merkezlenir; birden çok uygun gün dengeli responsive grid oluşturur.
- Gün kartları 124 px yüksekliğindeki durum kartından 72 px yüksekliğinde kompakt seçim kontrolüne dönüştürülür.
- `Müsait`, `Geçmiş tarih` ve `Planlanmadı` rozetleri kaldırılır; gösterilen her gün zaten seçilebilir olduğu için yalnız uygun saat sayısı sunulur.
- İlk haftada kullanılamayan `Önceki hafta` düğmesi hiç oluşturulmaz; yalnız işlevli hafta kontrolü görünür.
- `Hizmeti değiştir` çerçeveli ikincil CTA yerine sade metin eylemidir.
- `Tarih ve saat seçin` başlığı `Uygun zamanı seçin`, stepper etiketi ise mobilde kırılmayan `Zaman` olarak kısaltılır.
- Başlık, hizmet bağlamı, günler, saatler ve CTA aynı 840 px merkez görev eksenine bağlanır.

Bu yapı progressive disclosure uygular: kullanıcı tüm takvim durumlarını yönetmez, yalnız randevu alabileceği günlerden seçim yapar. Sistem uygun gün bulamazsa mevcut boş hafta açıklaması ve sonraki hafta/WhatsApp yolları korunur.

| Kontrol | Kabul |
| --- | --- |
| İşlevsiz gün butonu | 0 |
| Tek uygun gün | Merkezde, en fazla 280 px |
| Gün kartı yüksekliği | Masaüstü en az 72 px, mobil en az 68 px |
| Gün kartı içeriği | Gün, tarih, uygun saat sayısı |
| İlk hafta navigasyonu | Devre dışı önceki hafta kontrolü yok |
| Mobil stepper etiketi | Tek satır `Zaman` |
| Görev ekseni | Başlık, bağlam, gün, saat ve CTA aynı merkez kolonda |
