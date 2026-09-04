# Orkestra Wizard Yeniden Tasarım Araştırması ve Ürün Kararı

**Tarih:** 4 Eylül 2026  
**Durum:** R0 ve R1 uygulandı, R2 planlandı  
**Kapsam:** 15 ürün/desen incelemesi, mevcut wizard eleştirisi, UX/UI ve Product Owner değerlendirmesi

## 1. Yönetici özeti

Mevcut wizard görsel olarak yeniden tasarlanmış olsa da temel görev olan “ihtiyacı doğru ve güvenli biçimde tarif edip talep oluşturma”yı desteklemek yerine kullanıcıya aynı anda fazla sayıda arayüz katmanı gösteriyor. Tam ekran marka başlığı, dört aşamalı navigasyon, soru sayacı, sağdaki sürekli fiş, alt eylemler ve kapatma kontrolü aynı dikkat bütçesi için yarışıyor. Masaüstünde iki kolon, iç kaydırma ve yapay fiş metaforu; mobilde ise sıkışan dikey alan, açılır özet ve sabit eylem alanı birleşerek ilerleme hissini zayıflatıyor.

Nihai karar, wizard’ı “premium fiş animasyonu” etrafında değil, **tek görevli ve koşullu hizmet teşhisi** etrafında yeniden kurmaktır. Önerilen V6 modeli:

- Her ekranda tek karar veya anlamlı bir küçük alan grubu.
- Tek bir kaydırma sahibi; modal içinde bağımsız gövde scrollbar’ı yok.
- Kullanıcının gerçek toplamı bilinmiyorsa yanıltıcı yüzde veya dört sekmeli ilerleme yok.
- Masaüstünde sakin, ortalanmış görev yüzeyi; mobilde doğal tam ekran görev akışı.
- Sürekli görünen fiş kaldırılır. Özet, yalnız son kontrol adımında düzenlenebilir bir “talep kapsamı” olarak açılır.
- Auth zorunluluğu son kontrolden sonra uygulanır; taslak ve mevcut adım korunur.
- Koşullu sorular, risk yönlendirmesi, medya, ilçe/mahalle ve zamanlama aynı veri sözleşmesini kullanır.
- Hareket yalnız durum değişimini anlatır; dekoratif kâğıt/fiş animasyonu kullanılmaz.

Bu yön, tamamlanma oranını, veri kalitesini ve teklif doğruluğunu birlikte optimize eder. Önceki işlevsel kazanımlar — taslak sahipliği, auth dönüşü, koşullu sorular, risk uyarıları ve gönderim sözleşmesi — korunmalıdır.

## 2. Geri alınan tasarım yönü

Son tam ekran V5 kabuğu görsel olarak geri alınmıştır. Aşağıdaki kararlar yeni tasarıma taşınmayacaktır:

- Sürekli marka başlığı ve servis bilgisini ayrı bir üst kabukta tekrar etmek.
- Her adımda sağda yapay bir termal fiş göstermek.
- Soru aşamasında tüm aşamaları büyük, tıklanabilir sekmeler olarak sunmak.
- Masaüstünde iki ayrı iç kaydırma alanı oluşturmak.
- Fazla sayıda ok, rozet, ikon, durum noktası ve iç içe kart kullanmak.
- “Premium” algısını gölge, kâğıt yırtığı ve dekoratif animasyonla üretmeye çalışmak.

Kod tabanında geçici görsel geri dönüş override’ı bulunuyor. V6 uygulamasına başlanırken eski V5 deklarasyonları ve bu geçici override birlikte silinmeli; üçüncü bir CSS katmanı eklenmemelidir.

## 3. Ürün görevi ve başarı tanımı

### Kullanıcının işi

“Sorunumu teknik terimleri bilmeden anlatmak, doğru kapsama dönüştürmek, uygun ustalardan karşılaştırılabilir teklif almak ve talebimi kaybetmemek istiyorum.”

### Platformun işi

Belirsiz bir kullanıcı anlatımını, ustanın fiyatlandırabileceği ve platformun eşleştirebileceği yapılandırılmış bir talebe çevirmek.

### Başarı ölçütleri

- Wizard başlatma → son kontrol oranı.
- Son kontrol → auth dönüşü → tek gönderim oranı.
- Soru/branch bazında terk oranı ve tamamlanma süresi.
- Kullanıcının özet ekranında yaptığı düzeltme oranı.
- Ustanın “eksik kapsam” nedeniyle revizyon isteme oranı.
- Yanlış hizmet eşleşmesi ve talep iptal oranı.
- Taslak kurtarma ve hesap değişiminde doğru sahiplik oranı.
- Riskli cevaplarda güvenlik uyarısının görülme ve onaylanma oranı.

## 4. Mevcut durum — UX/UI uzmanı değerlendirmesi

### Güçlü taraflar

- Bir soruya odaklanan çekirdek içerik yapısı doğru yönde.
- Koşullu sorular ve hizmete özel sözleşme, genel bir iletişim formundan daha yüksek veri kalitesi sağlayabilir.
- Taslak, auth dönüşü ve önceki adıma dönme yetenekleri gerçek kullanıcı kaybını azaltır.
- Lemonade yüzey rengi, mavi ana aksiyon ve Orkestra kimliği ayırt edici bir sistem kurabilir.

### Temel sorunlar

1. **Odak rekabeti:** Başlık, adım navigasyonu, kategori, soru, eylemler ve fiş eşit görsel ağırlıkta.
2. **Yanlış metafor:** Fiş, henüz oluşmamış bir anlaşmayı fazla erken resmileştiriyor ve boş alanları “eksik ürün” gibi gösteriyor.
3. **İç kaydırma:** Modal gövdesinin ayrıca kayması, trackpad, klavye, zoom ve mobil tarayıcı yüksekliğinde yön duygusunu bozuyor.
4. **İlerleme yanılsaması:** Koşullu soruların sayısı değişirken sabit adım veya yüzde göstermek güvenilir değil.
5. **Aşırı çerçeveleme:** İç içe kartlar, çizgiler, rozetler ve gölgeler içerik hiyerarşisinin yerine geçiyor.
6. **Mikro metin yükü:** Hesap/taslak açıklamaları ana sorunun yakınında fazla görünür.
7. **Mobil sıkışma:** Üst kabuk + ilerleme + soru + alt CTA, küçük telefonlarda kullanılabilir yüksekliği tüketiyor.

### UX/UI hükmü

Yeni arayüz “az öğe” değil, **az eşzamanlı karar** ilkesini izlemeli. Bir ekranda yalnızca kullanıcıdan beklenen karar, gerekli bağlam, geri/ileri eylemi ve gerektiğinde güvenlik uyarısı bulunmalıdır.

## 5. Mevcut durum — Product Owner değerlendirmesi

### Ürün riskleri

- Görsel yenilik, gönderim oranı ve kapsam kalitesi ölçülmeden ürün başarısı sayılıyor.
- Sürekli özet, kullanıcıyı erken aşamada gereksiz kontrol davranışına itiyor.
- Genel ve özel talep yollarının aynı wizard’ı kullanması doğru; ikinci bir wizard üretmek bakım ve analitik parçalanma riski yaratır.
- Auth kapısı erken gösterilirse keşif düşer; gönderimden sonra gösterilirse misafir verisi/sahiplik karmaşası oluşur. Doğru nokta son kontrol ile gönderim arasındadır.
- Görsel animasyonların ürün değeri ancak hata azaltma veya durum anlatımıyla ilişkilendirildiğinde vardır.

### Product Owner hükmü

V6, “tasarım projesi” olarak değil, kontrollü bir dönüşüm ve veri kalitesi dilimi olarak çıkmalıdır. Mevcut RPC, draft ve request sözleşmeleri korunmalı; UI değişimi feature flag altında karşılaştırmalı ölçülmelidir.

## 6. On beş referansın karar matrisi

| # | Sistem | Gözlenen desen | UX/UI yorumu | Product Owner yorumu | Karar |
|---|---|---|---|---|---|
| 1 | Typeform | Varsayılan olarak bir soru/bir sayfa, konuşma hissi, koşullu mantık | Güçlü odak; çoklu alan aynı sayfada ölçümü ve bilişsel yükü zayıflatabilir | Soru bazlı terk analizi değerlidir | **Uyarla:** tek karar ekranı, açık devam |
| 2 | GOV.UK Question Pages | Soru, yardım, hata, geri ve devam için katı sayfa sözleşmesi | Dekorasyonsuz ve erişilebilir; görev yönü nettir | Karmaşık kamu işlemlerinde hata maliyetini azaltır | **Benimse:** semantik yapı ve hata odağı |
| 3 | GOV.UK Check Answers | Gönderim öncesi özet ve satır bazlı “Değiştir” bağlantıları | Sürekli yan panelden daha sakin ve düzeltilebilir | Yanlış talep maliyetini düşürür | **Benimse:** final kapsam özeti |
| 4 | Thumbtack | İhtiyacı sorularla daraltma, ardından uygun profesyoneller | Kullanıcı teknik kategori bilmeden ilerler | Yapılandırılmış cevap eşleştirme ve lead kalitesini artırır | **Uyarla:** hizmete özel teşhis |
| 5 | Stripe Checkout | Duyarlı, sınırlı özelleştirme, güçlü durum ve oturum yönetimi | Görsel özgünlükten çok güvenilir görev tamamlama | Session/expiry ve hata davranışı kritik | **Benimse:** akış sözleşmesi, değil görünüşü |
| 6 | Airbnb | Seçim → ayrıntılar → koşullar → istek; gerekli yerde mesajlaşma | Durumlar ve beklenti açık; güven bilgisi karar noktasına yakın | Kabul, ret ve süre aşımı ayrı ürün durumlarıdır | **Uyarla:** son kontrol ve sonraki adım açıklığı |
| 7 | Jotform Cards | Tek soru kartı ile klasik uzun form arasında seçim | Kart yaklaşımı odak sağlar; her alan tipi için uygun değildir | Bir formatı bütün hizmetlere zorlamak veri kaybı yaratabilir | **Seçici kullan:** küçük alan gruplarına izin ver |
| 8 | Tally | Göster/gizle, sayfa atlama ve koşullu zorunluluk | Progressive disclosure yükü azaltır | Karmaşık branch ağları test edilmezse sessiz hataya dönüşür | **Benimse:** sözleşme + branch testleriyle |
| 9 | Google Forms | Bölüm bazlı, belirli cevap türleriyle sınırlı dallanma | Basit ve öğrenilebilir; ileri teşhis için kaba | Kısıtlı model bakım maliyetini düşürür | **Uyarla:** kuralları bilinçli sınırlı tut |
| 10 | Microsoft Forms | Yalnız ileri doğru dallanma | Geri dönüşte döngü ve yön kaybını önler | Geçersiz akış üretimini azaltır | **Benimse:** branch graph doğrulaması |
| 11 | Taskrabbit | Kategori/kapsam/adres/tarih, sonra sağlayıcı karşılaştırması | Kararlar doğru sıraya konur; güven kanıtı seçim anında görünür | Talep yeterince yapılandırılmadan eşleştirme yapılmaz | **Benimse:** sıra ve kapsam mantığı |
| 12 | Angi | Teklif/rezervasyon ayrımı, karşılaştırma ve fiyat beklentisi | Teslim modelini açık anlatmak belirsizliği azaltır | Paket, teklif ve keşif aynı vaatle sunulmamalı | **Benimse:** teslim modeline özel sonuç metni |
| 13 | ServiceTitan Scheduler | Müsaitlik, iş ayrıntıları ve müşteri/konum tanımlama | Konum seçimi sadece harita/ilçe değil, sahip olunan adres bağlamıdır | Aynı hesabın birden çok konumu veri modeli gerektirir | **Uyarla:** ilçe→mahalle, sonra kayıtlı adres |
| 14 | TurboTax | Rehberli sorular, fotoğrafla veri girişi, bağlamsal yardım | Karmaşık görevi küçük kararlara böler | Yardım, destek maliyetini ve yanlış girişi azaltabilir | **Benimse:** kamera/media ve yerinde yardım |
| 15 | Lemonade | Stresli olaylarda empati, şeffaflık ve hızlı yönlendirme | Sıcak dil güven verir; eğlenceli animasyon acil durumda ters tepebilir | Riskli işlerde güvenlik, dönüşümden önce gelir | **Benimse:** risk kesintisi ve sakin ton |
| 16 | Baymard Checkout* | Alan sayısı, geri dönüşte veri koruma, login sonrası akışa dönüş | Adım sayısından çok görünen alan ve sürtünme önemlidir | Auth/draft kaybı doğrudan terk üretir | **Benimse:** minimum alan, güvenilir geri/auth dönüşü |

\* Baymard, önceki beşli içindeki iki GOV.UK desenini tek ürün ailesi olarak saydığımızda toplam **15 bağımsız ürün/sistem referansını** tamamlayan çapraz benchmark’tır. İncelenen desen sayısı 16 satırdır; bağımsız referans ailesi sayısı 15’tir.

## 7. Ortak araştırma bulguları

### Güçlü ortaklıklar

1. **Tek görünür karar:** Typeform, GOV.UK, Jotform ve TurboTax.
2. **Progressive disclosure:** Tally, Google Forms, Microsoft Forms ve Thumbtack.
3. **Göndermeden önce düzenlenebilir özet:** GOV.UK, Airbnb ve Stripe.
4. **Durum ve oturum güvenilirliği:** Stripe, Airbnb ve Baymard.
5. **Kapsamdan sonra sağlayıcı/teklif:** Taskrabbit, Thumbtack ve Angi.
6. **Risk anında akışı kesme:** Lemonade ve Airbnb güven modelleri.

### Körü körüne alınmaması gereken desenler

- Typeform benzeri her seçimde otomatik ilerleme: yanlış dokunma ve erişilebilirlik riski.
- Checkout yüzdesini koşullu soru ağında taklit etmek: gerçek toplam değişkendir.
- Her şeyi ayrı sayfaya bölmek: ilişkili adres veya tarih alanlarında gereksiz adım sayısı.
- Sürekli yan özet: karmaşık fiyatlandırmada faydalı olabilir, erken hizmet teşhisinde dikkat dağıtır.
- Animasyonlu fiziksel fiş: anlaşma sonrası belge için uygun; talep toplama sırasında yanlış zihinsel model.

## 8. Önerilen V6 bilgi mimarisi

### A. Başlangıç

- Hizmet adı ve kısa “ne kadar sürer?” bilgisi.
- Seçili usta varsa açık görünürlük özeti.
- “Başla” yerine ilk anlamlı soru doğrudan gösterilebilir; gereksiz karşılama ekranı eklenmez.

### B. Kapsam teşhisi

- Her görünümde bir karar veya birbiriyle ayrılmaz küçük alan grubu.
- Cevaba bağlı sonraki soru.
- Riskli cevapta soru ağını kesen güvenlik yönlendirmesi.
- “Neden soruyoruz?” yardımı yalnız gerektiğinde açılır.

### C. Kanıt / medya

- Opsiyonel olduğu açıkça belirtilir.
- Kamera ve dosya seçimi aynı eylem ailesinde.
- Yükleme başlamadan dosya türü, boyut ve gizlilik bilgisi görünür.

### D. Konum ve zaman

- İlçe seçilince yalnız geçerli mahalleler açılır.
- Açık adres, yalnız ürün gerçekten ihtiyaç duyduğu aşamada istenir.
- Zaman seçenekleri UI, API ve eşleştirmede aynı enum/semantiği taşır.

### E. Talep kapsamı

- Fiş değil, semantik tanım listesi.
- Hizmet, cevaplar, konum, zaman ve medya ayrı bölümler.
- Her bölümde “Değiştir” ile ilgili adıma dönüş.
- Teslim modeli ve talebin kimlere görüneceği gönderimden önce açıkça belirtilir.

### F. Auth ve gönderim

- Misafir son özete kadar ilerleyebilir.
- Gönderim tıklamasında giriş/kayıt istenir.
- Dönüşte aynı kullanıcı, aynı taslak, aynı hedef usta ve aynı özet açılır.
- Son gönderim kullanıcı eylemiyle yapılır; auth dönüşünde otomatik submit yoktur.

## 9. Responsive yerleşim kararı

### 320–390 px

- Tam ekran görev yüzeyi; yatay dış boşluk 16 px.
- Üstte geri, kısa hizmet adı ve kapat; marka lockup tekrar edilmez.
- “Kapsam · Soru 2” gibi kısa metin; büyük stepper yok.
- Ana CTA en az 48 px, safe-area üzerinde.
- Sayfa kayabilir; ayrı form scrollbar’ı oluşmaz.
- Özet yalnız son adımda; ara adımlarda açılır fiş yok.

### 820 px tablet

- Tek kolon, 640–720 px içerik genişliği.
- Eylemler içerik sonunda; yalnız çok kısa viewport’ta güvenli sticky kullanılabilir.
- Yardım metni sorunun yanında/aşağısında.

### 1440 px masaüstü

- 760–880 px ortalanmış görev yüzeyi.
- Boş alan bilinçli kullanılır; ikinci kolon zorunlu değildir.
- Final özette en fazla iki kolon: bölüm adları ve değerler. İç scrollbar yok.
- Modal kullanılacaksa viewport’tan taşmayan, sayfa scroll’unu tek başına yöneten dialog; alternatif olarak `/talep/yeni` rotası tercih edilir.

## 10. Görsel sistem kararı

- **Zemin:** beyaza yakın nötr; lemonade yalnız seçili durum, yardım ve yumuşak bölüm vurgusunda.
- **Ana aksiyon:** Orkestra mavisi; aynı ekranda yalnız bir birincil buton.
- **Risk:** sarı marka rengi değil, semantik amber/kırmızı güvenlik token’ı.
- **Tipografi:** soru 32–40 px masaüstü, 26–32 px mobil; gövde 16–18 px; satır uzunluğu 60–68 karakter.
- **Çerçeveler:** bir ana yüzey; iç içe kart yerine boşluk ve ince ayraç.
- **Hareket:** 160–220 ms opacity + 8–12 px translate; spring/bounce yok. `prefers-reduced-motion` altında anında geçiş.
- **Fiş dili:** “İş kapsamı” veya “Talep özeti”; termal kâğıt, barkod, yırtık kenar ve yazıcı animasyonu yok.

Önerilen tasarım dial’ları: **Design variance 3/10, motion 2/10, visual density 4/10.**

## 11. İçerik ilkeleri

- Soru başlıkları teknik terim değil, kullanıcının gözlemlediği durumu sorar.
- Birincil buton ne olacağını söyler: “Konumu ekle”, “Özeti kontrol et”, “Giriş yap ve devam et”.
- “Sonraki soru” yalnız hedef bilinmiyorsa kullanılır.
- Opsiyonel alanlarda “isteğe bağlı” başlıkta görünür.
- Güvenlik uyarıları kısa, eyleme dönük ve dönüşüm hedefinden bağımsızdır.
- Kullanıcının cevabı özetlenirken sistem çıkarımı ile kullanıcının söylediği ayrılır.

## 12. Erişilebilirlik ve kalite kabul kriterleri

- 320, 390, 820 ve 1440 px’te yatay taşma yok.
- 200% zoom’da içerik ve ana eylem kaybolmaz; 400% reflow temel görevleri korur.
- Dialog varsa odak içine alınır, Escape güvenli kapanır, kapanış taslağı silmez.
- Soru değişiminde başlığa programatik odak verilir; ekran okuyucu adım bağlamını duyar.
- Tüm kontroller en az 44×44 px; görünür focus ring bulunur.
- Hata mesajı alanla `aria-describedby` üzerinden bağlıdır ve hata özetinden alana gidilebilir.
- Geri dönüşte cevaplar korunur; branch değişince artık görünmeyen cevaplar veri sözleşmesine göre temizlenir.
- Tek scroll sahibi vardır; `.wizard-form-side` gibi ayrı iç scroll alanı yoktur.
- Klavyeyle seçim, geri, ileri, özet düzenleme ve auth dönüşü tamamlanabilir.
- Reduced motion altında bilgi kaybı veya bekleme oluşmaz.

## 13. Teknik ve ürün sözleşmeleri

1. Mevcut 26 hizmet ve koşullu soru sözleşmesi tek kaynak olmaya devam eder.
2. UI’daki cevap anahtarları SQL/RPC doğrulamasıyla birebir eşleşir.
3. Taslak anahtarı kullanıcı + hizmet + hedef usta bağlamına göre izole edilir.
4. Eski/uyumsuz taslak için sessiz bozulma yerine sürüm göçü veya açık sıfırlama sunulur.
5. Gönderim idempotency anahtarı UI yeniden denemelerinde korunur.
6. Özel talep kendiliğinden açık talebe dönüşmez.
7. Auth dönüşü `next` hedefini doğrular ve dış yönlendirmeye izin vermez.
8. Analitik hassas serbest metni veya medya adını göndermez.

## 14. Uygulama yol haritası

### Uygulama kaydı, 4 Eylül 2026

- **R0, uygulandı:** V5 tam ekran ve geçici rollback CSS katmanları kaldırıldı. Wizard görünümü bağımsız bir CSS modülüne taşındı.
- **R1, uygulandı:** Bulanık arka planlı dialog, tek kolon görev yüzeyi, kısa aşama bilgisi ve tek scroll sahibi oluşturuldu.
- **Final özet, öne alındı:** Sürekli fiş kaldırıldı. Son aşamada satır bazlı “Değiştir” eylemleri olan semantik talep kapsamı eklendi.
- **Yerel doğrulama:** Lint, type-check, production build, 17 hedefli bileşen testi ve dört cihaz projesinde 24 Playwright testi geçti.
- **Bilinen sınır:** Gerçek hesaplı auth dönüşü ve uzaktaki Supabase ile gönderim doğrulaması bu dilimde çalıştırılmadı.

### R0 — Baseline ve temizlik

- V5 CSS ve geçici rollback override’ını birlikte kaldır.
- Mevcut draft/auth/request davranış testlerini dondur.
- Başlatma, branch, özet ve terk ölçümleri için rıza kontrollü olay sözleşmesi yaz.

**Çıkış:** İşlevsel sözleşme değişmeden temiz bir wizard CSS sınırı.

### R1 — Yeni kabuk ve soru primitive’i

- Tek kolon görev yüzeyi.
- Soru, küçük alan grubu, hata, yardım ve eylem bileşenleri.
- Mobil/masaüstü tek scroll ve focus yönetimi.

**Çıkış:** Bir pilot hizmet bütün breakpoint ve klavye kontrollerini geçer.

### R2 — Koşullu teşhis, risk, medya, konum

- Branch graph doğrulaması.
- Risk kesintileri.
- Medya yükleme durumları.
- İlçe → mahalle bağımlılığı ve standart zaman enum’u.

**Çıkış:** Pozitif/negatif branch fixture’ları ve veri sözleşmesi testleri yeşil.

### R3 — Özet, düzenleme ve auth dönüşü

- GOV.UK tarzı düzenlenebilir kapsam özeti.
- Auth kapısı, aynı taslağa dönüş ve açık submit.
- Özel/açık talep görünürlüğü.

**Çıkış:** Misafir → giriş/kayıt → aynı özet → tek gönderim senaryosu geçer.

### R4 — Doğrulama ve kontrollü yayın

- 5 kullanıcıyla mobil görev testi; en az ikisi düşük dijital yeterlilik profili.
- Gerçek müşteri/usta hesaplarıyla scope yeterliliği kontrolü.
- Eski ve yeni akışın tamamlanma, süre, hata ve düzeltme karşılaştırması.
- Feature flag ile kademeli yayın.

**Çıkış:** P0 erişilebilirlik veya görev engelleyici yok; metriklerde belirgin gerileme yok.

## 15. Önceliklendirilmiş karar listesi

### P0 — Tasarım başlamadan zorunlu

1. Tek scroll sözleşmesi.
2. Sürekli fişi kaldırma ve final özet modelini kabul etme.
3. Soru/branch veri sözleşmesini dondurma.
4. Auth/draft dönüş regresyon testlerini koruma.
5. 320/390/820/1440 ve klavye testlerini CI kapsamına alma.

### P1 — İlk kullanılabilir dilim

1. Tek kolon kabuk.
2. Bir soru/bir karar bileşeni.
3. Açık geri/ileri ve hata durumu.
4. İlçe/mahalle ve zamanlama.
5. Düzenlenebilir final kapsam özeti.

### P2 — Ölçüm ve iyileştirme

1. Branch bazlı terk analizi.
2. Bağlamsal yardım.
3. Kamera odaklı medya deneyimi.
4. Taslak sürüm göçü.
5. Kontrollü motion polish.

## 16. Nihai ürün kararı

Orkestra wizard’ı bir “gösterişli modal” veya “animasyonlu dijital fiş” olmayacaktır. **Kullanıcıyı teknik bilgi gerektirmeden doğru hizmet kapsamına götüren, hataya dayanıklı bir talep oluşturma aracı** olacaktır. Marka karakteri renk, tipografi, dil ve ölçülü geçişlerle taşınacak; görev yüzeyinin önüne geçmeyecektir.

Kodlama onayı verildiğinde R0 + R1 birlikte ele alınmalı; yalnız yeni bir görünüm ekleyip eski CSS’i altta bırakmak kabul edilmemelidir. İlk dikey dilim “Musluk Değişimi” veya veri sözleşmesi en olgun başka bir hizmet üzerinde uçtan uca tamamlanmalı, ardından 26 hizmete yayılmalıdır.

## 17. Kaynaklar

- Typeform — [One-question form pages](https://help.typeform.com/hc/en-us/articles/38099463383188-How-to-add-multiple-questions-to-a-form-page)
- GOV.UK — [Question pages](https://design-system.service.gov.uk/patterns/question-pages/)
- GOV.UK — [Check answers](https://design-system.service.gov.uk/patterns/check-answers/)
- Stripe — [How Checkout works](https://docs.stripe.com/payments/checkout/how-checkout-works)
- Airbnb — [Instant Book and reservation requests](https://www.airbnb.com/help/article/85)
- Airbnb — [When to message your host](https://www.airbnb.com/help/article/124)
- Jotform — [Card form layout](https://www.jotform.com/help/493-How-to-Change-the-Form-Layout/)
- Tally — [Conditional form logic](https://tally.so/help/conditional-form-logic)
- Google Forms — [Show questions based on answers](https://support.google.com/docs/answer/141062)
- Microsoft Forms — [Branching logic](https://support.microsoft.com/en-US/Forms/use-branching-logic-in-microsoft-forms)
- Taskrabbit — [What happens after booking](https://www.taskrabbit.com/blog/getting-started-with-taskrabbit-what-happens-after-i-book/)
- Angi — [FAQ and service flow](https://www.angi.com/landing/faq)
- ServiceTitan — [Web Scheduler for homeowners](https://help.servicetitan.com/residential-s-r/docs/set-web-scheduler-for-homeowners)
- TurboTax — [Guided mobile tax experience](https://turbotax.intuit.com/personal-taxes/mobile-apps/turbotax/)
- Lemonade — [Transparency review](https://www.lemonade.com/blog/lemonade-transparency-review/)
- Baymard — [Checkout flow and form fields](https://baymard.com/blog/checkout-flow-average-form-fields)
