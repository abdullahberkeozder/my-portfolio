# Umut Usta Web Sitesi UX/UI Geliştirme Raporu

**Proje:** the-welding-expert-app  
**Ürün:** Umut Usta Randevu ve Hizmet Talebi  
**İnceleme tarihi:** 18 Temmuz 2026  
**Canlı adres:** https://umut-usta.vercel.app/appointment  
**Ana kaynak:** Plerdy Website Checklists Hub  
**Kapsam:** UX, UI, CRO, içerik, yerel güven, erişilebilirlik, mobil performans, ölçüm ve ürün yönetimi

## 1. Yönetici özeti

Umut Usta sitesi doğru bir ürün problemi çözüyor: Ankara'da bakım, onarım ve metal işi arayan müşteriyi telefon trafiğine mahkum etmeden hizmet, zaman tercihi ve iletişim bilgisi üzerinden ekibe bağlıyor. Hizmet kapsamı, takvim, WhatsApp alternatifi, iş örnekleri, adres ve SSS bir yerel hizmet sitesi için güçlü bir temel oluşturuyor.

En büyük sorun görsel estetikten önce mobil deneyimin teknik performansı ve güven kanıtlarının eksikliği. 18 Temmuz 2026 tarihli PageSpeed laboratuvar ölçümünde masaüstü performansı 93 iken mobil performans 44. Mobil LCP 7,5 saniye ve CLS 0,74. Toplam ağ yükü yaklaşık 11,4 MB; PageSpeed yalnızca görsel yayınlama tarafında yaklaşık 10,5 MB tasarruf potansiyeli bildiriyor. Kullanıcı telefonundan geldiğinde premium tasarımın hissedilmesinden önce bekleme ve düzen kayması yaşıyor.

İkinci önemli sorun canlı sürüm ile yerel geliştirme sürümünün ayrışması. Canlıda hâlâ `Randevu Seç`, `Fotoğraf Gönder, Teklif Al` ve tıklanabilir hizmet kartları bulunuyor. Repoda bunlar sırasıyla `Randevu Al`, `Fotoğraf Gönder` ve salt görüntülenen hizmet kartları olarak düzeltilmiş. Bu nedenle ürünün gerçek müşteri deneyimi, geliştirme ortamındaki iyileştirmelerin gerisinde.

Önerilen öncelik sırası:

1. Mobil görsel yükü ve CLS sorununu çözmek.
2. Güncel UX sürümünü canlıya almak ve yayın kontrol listesi kurmak.
3. Gerçek müşteri yorumu, iş kanıtı, garanti/kapsam ve hizmet bölgesi ayrıntılarını CTA yakınına taşımak.
4. Form gizliliği, dönüşüm olayları ve kanal atfını ölçülebilir hale getirmek.
5. Hizmet niyetine özel landing page yapısına geçmek.

## 2. Araştırma yöntemi ve kapsam seçimi

Plerdy `/check/` sayfası, tek bir otomatik denetleyici yerine 15 uzman kontrol listesini bir araya getiriyor. Bu raporda Umut Usta için doğrudan ilgili olan şu listeler incelendi:

| Plerdy listesi | Toplam kapsam | Umut Usta için kullanım |
| --- | ---: | --- |
| Local Service Website Leak Checklist | 50 madde | Ana değerlendirme omurgası |
| Website Usability Checklist | 230+ madde | Form, CTA, navigasyon, mobil ve WCAG filtresi |
| Website Conversion Rate Checklist | 61 madde | Güven, teklif, hizmet, CTA ve form dönüşümü |
| Website Content Checklist | 41 madde | Mesaj hiyerarşisi, okunabilirlik, SEO ve editoryal QA |
| Core Web Vitals Checklist | 30 madde | LCP, CLS, görsel, font, önbellek ve performans bütçesi |

E-ticaret sepeti, ödeme, ürün stoğu, para birimi ve ürün filtreleme gibi Umut Usta'nın iş modeline uymayan maddeler kapsam dışı bırakıldı. Buna karşılık yerel güven, randevu, telefon/WhatsApp, hizmet alanı, form, gerçek iş fotoğrafları, Core Web Vitals ve analitik maddeleri yüksek ağırlıkla değerlendirildi.

Değerlendirme dört kanıta dayanıyor:

- Canlı sitenin masaüstü DOM ve görsel incelemesi.
- 18 Temmuz 2026 tarihli PageSpeed mobil ve masaüstü laboratuvar sonuçları.
- Güncel React/Vite/Supabase kodu ve tasarım tokenları.
- Önceki kapsamlı rapordaki Canan, Mehmet ve Selin personaları.

## 3. Mevcut durum puan kartı

Bu puanlar otomatik Plerdy puanı değildir; Plerdy ölçütlerinin canlı site ve kod kanıtlarıyla eşleştirilmiş uzman değerlendirmesidir.

| Alan | Puan | Durum | Kısa yorum |
| --- | ---: | --- | --- |
| Değer önerisi ve ilk ekran | 8/10 | Güçlü | Ne, nerede ve nasıl sorularına hızlı yanıt veriyor |
| Randevu akışı | 7,5/10 | Güçlü | Adımlar açık; talep/onay ayrımı yerel sürümde güçlendirildi |
| Yerel güven ve sosyal kanıt | 5/10 | Geliştirilmeli | Adres ve işler var; doğrulanabilir yorum ve güvence zayıf |
| İçerik ve mikro metin | 7,5/10 | Güçlü | Yeni metinler açık; canlı sürüm geride |
| Mobil kullanılabilirlik | 6/10 | Riskli | Yapı responsive; yükleme ve CLS deneyimi bozuyor |
| Görsel sistem ve premium his | 7/10 | İyi temel | Graphite/copper dil tutarlı; gerçek iş kanıtı daha baskın olmalı |
| Erişilebilirlik | 8/10 | İyi | Lighthouse 95; kontrast ve başlık sırası açıkları var |
| Mobil performans | 3/10 | Kritik | Performans 44, LCP 7,5 sn., CLS 0,74 |
| Ölçüm ve deney altyapısı | 5,5/10 | Orta | Ürün olayları var; sayfa girişi, telefon ve kalite döngüsü eksik |
| SEO teknik temeli | 8/10 | İyi | Lighthouse 100; sitemap alan adı tutarsız |
| Genel UX/UI olgunluğu | **6,6/10** | **İyi temel, kritik optimizasyon gerekli** | Mobil hız ve güven kanıtı çözülürse hızlı sıçrama mümkün |

## 4. Canlı performans bulguları

### 4.1 PageSpeed sonuçları

| Metrik | Mobil | Masaüstü | Yorum |
| --- | ---: | ---: | --- |
| Performance | 44 | 93 | Mobil ve masaüstü arasında kabul edilemez fark var |
| Accessibility | 95 | 95 | İyi, fakat manuel test hâlâ gerekli |
| Best Practices | 100 | 100 | Güçlü teknik temel |
| SEO | 100 | 100 | Lighthouse kapsamı içinde güçlü |
| FCP | 2,7 sn. | 0,7 sn. | Mobil ilk görünüm gecikiyor |
| LCP | 7,5 sn. | 1,6 sn. | Mobil ana içerik çok geç tamamlanıyor |
| TBT | 0 ms. | 10 ms. | Ana sorun JavaScript bloklaması değil |
| CLS | 0,74 | 0 | Mobilde ağır görsel düzen kayması var |
| Speed Index | 5,6 sn. | 1,4 sn. | Mobil algılanan hız düşük |
| Toplam ağ yükü | yaklaşık 11,4 MB | yaklaşık 11,8 MB | Yerel hizmet landing page'i için fazla yüksek |

Gerçek kullanıcı CrUX verisi bulunmuyor. Bu, trafik hacminin yeterli olmaması veya alan verisinin henüz oluşmaması anlamına gelebilir. Bu nedenle sonuçlar laboratuvar bazlı başlangıç ölçümü olarak kullanılmalı; yayın sonrası RUM ile doğrulanmalıdır.

### 4.2 Ana performans nedenleri

1. **PNG görseller çok büyük.** `public/images` içindeki görsellerin çoğu 730 KB ile 1,33 MB arasında. Sekiz hizmet görseli ve üç portföy görseli aynı landing page'de yükleniyor.
2. **Görseller gerçek görüntüleme ölçüsünden büyük.** Örneğin 1024 piksel kaynak, mobilde yaklaşık 483 piksel alanda gösteriliyor.
3. **Modern format ve `srcset` yok.** PageSpeed yalnızca görsel servisinde yaklaşık 10.471 KiB tasarruf öngörüyor.
4. **Supabase galeri görselleri de yaklaşık 900 KB-1 MB.** `loading="lazy"` var, fakat dosya üretim katmanında dönüşüm yok.
5. **Mobil CLS'nin tamamı header çevresinde oluşuyor.** PageSpeed, toplam 0,740 kaymanın header ve Google font yüklemesiyle ilişkili olduğunu gösteriyor.
6. **Font ve ilk ekran metrikleri birlikte kararsız.** Plus Jakarta Sans geç geldiğinde başlık satırları yeniden akıyor; hero düzeni büyük ölçüde kayıyor.
7. **Render engelleyen istekler yaklaşık 1.150 ms tasarruf alanı oluşturuyor.** Google Fonts stylesheet'i ve kritik olmayan kaynaklar gözden geçirilmeli.
8. **Önbellek tasarrufu yaklaşık 2.253 KiB.** Özellikle Supabase medya yanıtlarında uzun süreli cache politikası ve CDN dönüşümü gerekli.

### 4.3 Performans hedefi

| Metrik | Mevcut mobil | İlk hedef | İdeal hedef |
| --- | ---: | ---: | ---: |
| LCP | 7,5 sn. | < 3,5 sn. | <= 2,5 sn. |
| CLS | 0,74 | < 0,10 | <= 0,05 |
| FCP | 2,7 sn. | < 2,0 sn. | <= 1,8 sn. |
| Toplam ilk sayfa transferi | 11,4 MB | < 3 MB | < 2 MB |
| Mobil Lighthouse | 44 | >= 75 | >= 90 |

### 4.4 Teknik çözüm paketi

- Hizmet ve portföy kaynaklarını AVIF ana format, WebP fallback olarak üret.
- Kartlar için 320, 480 ve 768 piksel varyantları oluştur; `srcset` ve `sizes` kullan.
- Hero için masaüstü ve mobil ayrı kırpım üret; LCP kaynağını preload et ve `fetchpriority="high"` kullan.
- İlk ekranda olmayan tüm hizmet/galeri görsellerini gerçek lazy loading ile getir.
- `ProgressiveImage` çerçevelerine kesin `aspect-ratio`, genişlik ve yükseklik ver.
- Logo için 64/128 piksel raster varyantı veya optimize SVG kullan; 1,5 MB ana logoyu küçük yüzeylerde indirme.
- Plus Jakarta Sans'ı WOFF2 olarak self-host et, yalnız kullanılan ağırlıkları tut, preload et ve metrik uyumlu fallback tanımla.
- Mobil header için font yüklenmeden önce de aynı satır kırılımını koruyacak `size-adjust`/fallback metriği ve sabit min-height testi ekle.
- Supabase yükleme işleminde görsel boyutlandırma/sıkıştırmayı zorunlu hale getir.
- CI içinde mobil Lighthouse bütçesi kur; LCP, CLS ve transfer boyutu eşik aşımında build uyarı versin.

## 5. Plerdy Local Service değerlendirmesi

### 5.1 Tracking ve analytics

**Güçlü olanlar**

- `booking_wizard_started`, hizmet değişimi, slot seçimi, adım tamamlama, sistem talebi ve WhatsApp tıklaması kaydediliyor.
- Kanal ve hizmet türü bazı olaylarda property olarak tutuluyor.
- Sprint 1 dashboard'unda kanal dönüşümü, hizmet bazlı onay ve yoğunluk görselleştirmeleri bulunuyor.

**Eksikler**

- `page_view`, hero CTA, telefon tıklaması, adres tıklaması, galeri görüntüleme, form hata oranı ve başarı ekranı görüntüleme olayları eksik.
- Sistem `sessionStorage` içinde anonim bir oturum kimliği oluşturuyor; ölçüm amacı ve veri saklama yaklaşımı kullanıcıya açıklanmıyor.
- WhatsApp'a gidiş ölçülüyor, ancak WhatsApp'tan nitelikli talebe dönüş bağı kurulmamış.
- UTM standardı ve kampanya sözlüğü yok.
- Aynı talebin kanal değiştirerek iki kez sayılması riski için deduplication modeli görünmüyor.
- Lead kalitesi `qualified/unqualified/outside_area/spam/sold` seviyesinde kapalı döngüye alınmamış.

**Öneri olay sözlüğü**

| Olay | Ne zaman | Temel property |
| --- | --- | --- |
| `public_page_viewed` | Sayfa ilk açıldığında | source, medium, campaign, device |
| `hero_cta_clicked` | Randevu/WhatsApp/telefon | cta, placement |
| `service_list_viewed` | Hizmet bölümü görünür olduğunda | visible_services |
| `booking_started` | İlk wizard etkileşimi | service_type, source |
| `booking_step_completed` | Her adım geçişinde | step, elapsed_ms |
| `booking_validation_failed` | Gönderim engellendiğinde | field, error_type |
| `booking_submitted` | RPC başarı verdiğinde | request_id, service_type, channel |
| `booking_manage_opened` | Takip bağlantısı açıldığında | request_status |
| `change_or_cancel_requested` | Self-servis talep gönderildiğinde | request_type, reason |
| `lead_qualified` | Admin nitelikli işaretlediğinde | service_type, source |
| `appointment_approved` | Talep onaylandığında | service_type, source, lead_time |
| `job_completed` | İş tamamlandığında | service_type, source |

### 5.2 Landing page ve teklif netliği

**Güçlü olanlar**

- İlk ekran ne yapıldığını, Ankara lokasyonunu ve iki ana aksiyonu gösteriyor.
- Fiyat mantığı hizmet kartlarında görünür.
- Randevu ve WhatsApp alternatif kanalları birlikte sunuluyor.
- Yerel repoda “zaman tercihi” ile “onaylı randevu” ayrımı açıklaştırılmış.

**Geliştirilmesi gerekenler**

- Tek sayfada sekiz farklı hizmet bulunması, reklam niyeti açısından fazla geniş. `kaynak`, `boya`, `raylı kapı`, `akıllı kilit` gibi yüksek niyetli hizmetler ayrı landing page almalı.
- Hero yakınındaki güven kanıtları iddia düzeyinde; gerçek yorum puanı, tamamlanan iş sayısı veya doğrulanabilir garanti yok.
- “Ankara merkez ve yakın ilçeler” belirsiz. Hizmet verilen ilçeler açık listelenmeli.
- Başlangıç fiyatının hangi kapsamı içerdiği kartta kısa bir bilgi katmanıyla açıklanmalı.
- Acil servis iddiası yalnız gerçek operasyon kapasitesi varsa kullanılmalı; aksi durumda “müsaitliğe göre aynı gün” dili korunmalı.

### 5.3 Lead capture ve dönüşüm yolu

**Güçlü olanlar**

- Çok adımlı akış bilişsel yükü azaltıyor.
- Ad ve telefon zorunlu; e-posta ve not isteğe bağlı.
- WhatsApp fotoğraf paylaşımı için doğal alternatif kanal.
- Başarı ekranı ve self-servis takip bağlantısı yerel sürümde mevcut.

**Eksikler ve riskler**

- Form yakınında gizlilik/aydınlatma bağlantısı yok.
- Telefon doğrulaması görsel hata metni veriyor, fakat hata özeti, `aria-live` ve alan-hata programatik bağı doğrulanmalı.
- “Talebi Kaydet” sonrasında yanıt süresi ve sonraki adım açık olsa da gerçek otomatik bildirim kanalı bulunmuyor.
- Mesai dışı yanıt beklentisi ayrı yönetilmiyor.
- Telefonla arama, özellikle Mehmet personası için hero/sticky alanda yeterince güçlü değil.
- Spam koruması ve hız sınırlama davranışı ürün kabul kriterlerinde görünür değil.

### 5.4 Yerel güven ve hizmet kanıtı

**Mevcut kanıtlar**

- Açık adres, telefon, harita ve çalışma saatleri.
- Gerçek işe benzeyen proje görselleri ve açıklamalar.
- Hizmet bazlı kapsam ve süreç anlatımı.
- SSS içinde fiyat, malzeme, iptal ve acil hizmet itirazları.

**Eksik güven katmanları**

- Google işletme puanı, yorum sayısı ve gerçek yorum alıntısı.
- Umut Usta'nın gerçek portresi/atölye fotoğrafı ve kısa uzmanlık geçmişi.
- Garanti verilen işlerde kapsam, süre ve istisna açıklaması.
- Önce/sonra karşılaştırması ve proje sonucu.
- “İş ne kadar sürdü, hangi malzeme kullanıldı, hangi ilçede yapıldı?” bilgisi.
- İşletme bilgilerinin footer, LocalBusiness schema, Google profili ve sitemap alan adıyla tam tutarlılığı.

## 6. Müşteri gözünden UX analizi

### 6.1 Canan, 32: hızlı ve mobil kullanıcı

Canan reklamdan veya Google aramasından telefonla gelir. İlk 10 saniyede hizmetin Ankara'da verildiğini, yaklaşık fiyat mantığını ve müsait zaman seçebileceğini anlamak ister.

**Bugünkü deneyim:** İlk ekran mesajı iyi; fakat 7,5 saniyelik LCP ve 0,74 CLS, daha etkileşime geçmeden güveni düşürür. Uzun sayfa ve ağır kart görselleri mobil veri kullanımını artırır.

**Başarı koşulu:** İlk ekran 2,5 saniye içinde sabit görünmeli; CTA tek dokunuşla wizard'a gitmeli; form bilgileri kaybolmamalı; başarı sonrası takip bağlantısı açık olmalı.

### 6.2 Mehmet, 58: güven ve telefon odaklı kullanıcı

Mehmet dijital randevudan önce gerçek usta, gerçek adres ve ulaşılabilir telefon kanıtı arar.

**Bugünkü deneyim:** Adres, telefon ve iş örnekleri olumlu; fakat gerçek yorumlar, portre, garanti ve görünür “Ara” aksiyonu eksik.

**Başarı koşulu:** Header'da tıklanabilir telefon, CTA yakınında doğrulanabilir yorum, gerçek kişi fotoğrafı ve süreç güvencesi bulunmalı. Metin en az 16 px eşdeğerinde ve yüksek kontrastlı olmalı.

### 6.3 Selin, 44: apartman yöneticisi ve karar verici

Selin hizmeti yalnız almak değil, kurul veya yönetimle paylaşılabilir biçimde belgelemek ister.

**Bugünkü deneyim:** Keşif ve not alanı iyi başlangıç; ancak proje kapsamı, teklif belgesi, malzeme ve zaman taahhüdü yeterince yapılandırılmış değil.

**Başarı koşulu:** “Keşif iste” akışı fotoğraf, ölçü, adres ve beklenti toplamalı; sonrasında paylaşılabilir teklif/iş kapsamı üretmeli. Hizmet örnekleri sonuç ve süre verisi içermeli.

## 7. UI ve görsel tasarım değerlendirmesi

### 7.1 Güçlü tasarım kararları

- Graphite, sıcak gri ve bakır renk sistemi metal işçiliği alanıyla uyumlu.
- Yeşilin yalnız WhatsApp ve durum renklerinde tutulması marka hiyerarşisini koruyor.
- Plus Jakarta Sans modern ve güvenilir bir ürün hissi veriyor.
- 8-12 px yarıçap, ince sınır ve ölçülü gölge yerel hizmet ürününe uygun.
- Motion tokenları ve `prefers-reduced-motion` desteği mevcut.
- Progressive image, skeleton ve route fallback bileşenleri algılanan performans için doğru altyapı.

### 7.2 Premium hissi zayıflatan noktalar

- Premium hissi yaratan ana unsur “daha fazla efekt” değil; hızlı, sabit ve kanıtlı deneyimdir. Mobil kayma ve ağır görseller tasarım kalitesini gölgeler.
- Hizmet ve galeri görselleri aynı ışık, renk, kırpım ve çözünürlük standardında değil.
- Gerçek iş kanıtı yerine genel atölye atmosferi ilk ekranda fazla baskın kalabilir.
- Uzun tek sayfa yapısında benzer kart ritmi tekrar ediyor; önemli kanıt ile yardımcı içerik aynı ağırlıkta algılanıyor.
- Koyu tema müşteri landing page'inde ürün değerinden çok bakım maliyeti yaratabilir; kullanım verisiyle doğrulanmadan öne çıkarılmamalı.
- Footer yalnız iki metinden oluşuyor; güven, iletişim, yasal bilgi ve hızlı erişim açısından eksik.

### 7.3 Önerilen görsel hiyerarşi

1. **Hero:** Ne yapıyoruz + Ankara + ana CTA + telefon/WhatsApp + bir güçlü güven kanıtı.
2. **Kanıt şeridi:** Google puanı, tamamlanan iş, hizmet bölgesi, geri dönüş hedefi. Yalnız doğrulanabilir değerler kullanılmalı.
3. **Hizmet özeti:** Statik, hızlı taranan 4 ana kategori; geri kalanlar “Tüm hizmetler” altında.
4. **Gerçek iş örnekleri:** Önce/sonra, ilçe, iş süresi, kullanılan çözüm.
5. **Randevu akışı:** Sayfanın ana etkileşim yüzeyi.
6. **Süreç ve itirazlar:** Talep/onay ayrımı, fiyatı etkileyenler, malzeme, iptal/değişiklik.
7. **Yerel güven:** Harita, telefon, çalışma saatleri, gerçek kişi ve işletme bilgisi.
8. **Footer:** Hızlı bağlantı, iletişim, gizlilik/aydınlatma, sitemap ve marka bilgisi.

### 7.4 Motion ilkeleri

- Giriş animasyonları 180-320 ms aralığında, bir kez ve küçük mesafeyle çalışmalı.
- CTA veya form konumu animasyon nedeniyle değişmemeli.
- Skeleton gerçek bileşenin ölçüsünü birebir korumalı.
- Shimmer sürekli dikkat çeken dekor değil, yalnız yükleme göstergesi olmalı.
- Scroll reveal kritik ilk ekran öğelerine uygulanmamalı; görünürlük JavaScript'e bağlı olmamalı.
- Başarı animasyonu talebin kaydedildiğini desteklemeli; tekrar eden veya bloklayan animasyon kullanılmamalı.
- Tema geçişinde tüm DOM'a `transition: all` benzeri geniş maliyetli davranış uygulanmamalı.

## 8. İçerik ve bilgi mimarisi

### 8.1 Mesaj mimarisi

Kullanıcı her bölümde şu dört sorudan yalnız birine yanıt almalı:

- Bu hizmet benim ihtiyacıma uygun mu?
- Bu ustaya güvenebilir miyim?
- Yaklaşık maliyet ve süreç ne?
- Şimdi ne yapmalıyım?

Yerel sürümdeki “Hizmeti ve size uyan zaman tercihini seçin. Ekip, uygunluğu ve işin ayrıntılarını sizinle teyit eder.” metni ürün sözleşmesini doğru kuruyor. Bu dil canlıya taşınmalı ve başarı, takip, iptal/değişiklik ekranlarında aynı terminoloji korunmalı.

### 8.2 Terminoloji standardı

| Kavram | Kullanılacak ifade | Kaçınılacak ifade |
| --- | --- | --- |
| Müşteri ilk gönderimi | Talep / hizmet talebi | Kesin randevu |
| Müşterinin seçtiği zaman | Zaman tercihi | Onaylı saat |
| Ekip onayı sonrası | Onaylı randevu | Talep |
| Değişiklik | Tarih/saat değişikliği isteği | Randevu otomatik değişti |
| İptal | İptal isteği ekibe iletildi | Randevu iptal edildi |
| Fiyat | Başlangıç fiyatı / kapsam sonrası teklif | Kesin fiyat, kapsam bilinmiyorsa |

### 8.3 SEO ve içerik yapısı

- Her ana hizmet için ayrı, benzersiz landing page oluştur: `/ankara-kaynak`, `/ankara-boya-badana`, `/rayli-kapi-tamiri`, `/akilli-kilit-montaji`.
- Her sayfada hizmete özel hero, örnek iş, fiyat mantığı, ilçeler, SSS ve CTA kullan.
- Genel sayfa kategori merkezi olarak kalmalı; ücretli trafik doğrudan ilgili hizmet sayfasına gitmeli.
- `sitemap.xml` içindeki `the-welding-expert-app.vercel.app` alan adını canlı canonical alan adı `umut-usta.vercel.app` ile eşitle.
- Open Graph görseli mutlak URL kullanmalı ve logo yerine gerçek işi gösteren sosyal paylaşım görseli tercih edilmeli.
- İçerik güncelleme tarihi ve fiyat gözden geçirme sorumlusu tanımlanmalı.

## 9. Erişilebilirlik değerlendirmesi

Lighthouse erişilebilirlik puanı 95. Bu güçlü bir başlangıçtır; otomatik test yalnız belirli hata sınıflarını yakalar.

**Doğrulanan açıklar**

- Bazı ön plan/arka plan renk çiftleri yeterli kontrasta sahip değil.
- Başlık seviyeleri bazı bölgelerde sıralı değil; canlı DOM'da `h3` sonrasında portföy başlıklarının `h4` olması ve dinamik içerik yapısı gözden geçirilmeli.

**Manuel kontrol listesi**

- Klavyeyle hero, navigasyon, SSS, wizard ve self-servis yönetim akışını tamamla.
- Görünür focus halkasının sticky CTA veya header tarafından örtülmediğini doğrula.
- Tüm dokunma hedeflerini en az 44x44 CSS px yap.
- Form hatalarını `aria-describedby` ile alana bağla ve `aria-live` özet ekle.
- Yalnız renkle anlatılan seçili/uygun/dolu durum bırakma.
- 200% zoom ve 320 CSS px genişlikte yatay kayma testi yap.
- Koyu tema dahil tüm token çiftlerinde WCAG AA kontrast ölçümü çalıştır.
- Reduced-motion modunda reveal edilen tüm içeriklerin görünür kaldığını test et.

## 10. Ürün ve dönüşüm öncelikleri

### P0: yayın öncesi kritik

| İş | Etki | Efor | Kabul ölçütü |
| --- | --- | --- | --- |
| Görselleri AVIF/WebP ve responsive varyantlara dönüştür | Çok yüksek | Orta | İlk sayfa transferi < 3 MB |
| Mobil CLS'yi düzelt | Çok yüksek | Orta | CLS < 0,10 |
| Yerel güncel UX sürümünü canlıya al | Çok yüksek | Küçük | Canlıda `Randevu Al`, kısa CTA ve statik hizmet kartları |
| Sitemap/canonical alan adını eşitle | Yüksek | Küçük | Tüm URL'ler `umut-usta.vercel.app` |
| Form gizlilik/aydınlatma bağlantısı ekle | Yüksek | Küçük | Gönderim CTA'sı yakınında erişilebilir bağlantı |
| Telefon, form ve başarı olaylarını tamamla | Yüksek | Orta | Olay sözlüğü dashboard'da doğrulanıyor |

### P1: güven ve dönüşüm

| İş | Etki | Efor | Kabul ölçütü |
| --- | --- | --- | --- |
| Gerçek Google yorumları ve puan | Çok yüksek | Orta | Kaynağı ve güncellik tarihi görünür |
| Umut Usta gerçek portre/atölye profili | Yüksek | Küçük-orta | CTA yakınında gerçek kişi kanıtı |
| Hizmet verilen ilçeler | Yüksek | Küçük | İlçe listesi ve kapsam dışı mesajı |
| Tıklanabilir “Ara” CTA | Yüksek | Küçük | Mobil hero/sticky alanda ölçümleniyor |
| Önce/sonra vaka formatı | Yüksek | Orta | En az 3 vaka; süre, ilçe, çözüm |
| Mesai dışı yanıt mesajı | Orta-yüksek | Küçük | Kullanıcı ne zaman dönüş alacağını biliyor |

### P2: büyüme altyapısı

| İş | Etki | Efor | Kabul ölçütü |
| --- | --- | --- | --- |
| Hizmet bazlı landing page'ler | Çok yüksek | Büyük | İlk 4 yüksek niyet hizmet yayında |
| UTM ve kanal standardı | Yüksek | Orta | Kampanya -> talep -> onay izlenebiliyor |
| Lead kalite döngüsü | Yüksek | Orta | Nitelikli, onaylı, tamamlanan iş oranı |
| Teklif/keşif formu | Yüksek | Orta-büyük | Selin personası paylaşılabilir kapsam alıyor |
| Otomatik talep bildirimi | Yüksek | Orta | Müşteriye talep no ve takip linki gönderiliyor |

## 11. Öğrenme yol haritası

Yoğun Plerdy bilgisini bir kerede öğrenmek yerine ürün üzerinde uygulanan altı modüle bölmek daha verimli olur.

### Modül 1: Kullanıcı problemi ve görev akışı

**Öğrenilecek:** Jobs to Be Done, persona, müşteri yolculuğu, bilişsel yük, progressive disclosure.  
**Uygulama:** Canan, Mehmet ve Selin için ilk gelişten talep onayına kadar görev akışı çiz.  
**Çıktı:** Her ekranın tek ana görevi ve birincil CTA'sı.

### Modül 2: Bilgi mimarisi ve UX writing

**Öğrenilecek:** İçerik hiyerarşisi, taranabilir metin, açık CTA, hata ve başarı mesajı, terminoloji sistemi.  
**Uygulama:** Talep, zaman tercihi ve onaylı randevu sözlüğünü tüm ekranlarda uygula.  
**Çıktı:** Versiyonlanan ürün metni sözlüğü ve içerik QA listesi.

### Modül 3: UI sistemi ve erişilebilirlik

**Öğrenilecek:** Renk rolleri, tipografi ölçeği, spacing, component state'leri, WCAG 2.2, keyboard/focus.  
**Uygulama:** Token tabanlı light/dark kontrast matrisi ve form state seti oluştur.  
**Çıktı:** Figma/kod ile eşleşen foundation ve component kabul kriterleri.

### Modül 4: Mobil ve Core Web Vitals

**Öğrenilecek:** LCP, CLS, INP/TBT, responsive images, font loading, caching, performance budget.  
**Uygulama:** Önce hero, sonra hizmet kartı, sonra galeri optimizasyonu yap; her adımda Lighthouse karşılaştır.  
**Çıktı:** Mobil skor >= 75 ilk eşik, ardından >= 90 hedefi.

### Modül 5: CRO ve deney tasarımı

**Öğrenilecek:** Dönüşüm hunisi, friction, trust signal, hypothesis, A/B test, guardrail metric.  
**Uygulama:** “Ara CTA eklemek Mehmet personasında tamamlanan iletişimi artırır” gibi ölçülebilir hipotez yaz.  
**Çıktı:** Hipotez, ana metrik, koruma metriği, örneklem ve karar kuralı.

### Modül 6: Ürün analitiği ve operasyon

**Öğrenilecek:** Event taxonomy, attribution, lead quality, funnel, cohort, veri minimizasyonu.  
**Uygulama:** Kaynak -> talep -> onay -> tamamlanan iş zincirini dashboard'a bağla.  
**Çıktı:** Product Owner'ın haftalık karar panosu.

## 12. Ölçüm ve deney planı

### 12.1 Ana ürün metriği

**Haftalık onaylanan nitelikli talep sayısı.**

Yalnız gönderilen form sayısı başarı değildir. Uygulama; doğru hizmet bölgesinden, gerçek ihtiyacı olan ve ekip tarafından onaylanabilen talepleri artırmalıdır.

### 12.2 Destek metrikleri

| Kategori | Metrik |
| --- | --- |
| Edinim | Kaynak/kanal bazlı ziyaret ve yeni oturum |
| Aktivasyon | Wizard başlatma oranı |
| Sürtünme | Adım bazlı terk, validasyon hata oranı, süre |
| Dönüşüm | Sistem talebi, WhatsApp, telefon tıklama oranı |
| Kalite | Nitelikli talep ve hizmet alanı dışı oranı |
| Operasyon | İlk geri dönüş süresi, onay süresi |
| Sonuç | Onaylanan ve tamamlanan iş oranı |
| Deneyim | İptal nedeni, müşteri geri bildirimi, CES |
| Teknik | LCP, CLS, hata oranı, API başarısızlığı |

### 12.3 İlk üç deney

1. **Telefon CTA deneyi:** Hero'da “Ara” aksiyonu eklemek, özellikle 45+ mobil kullanıcıda iletişim başlatma oranını artırır mı?
2. **Güven kanıtı deneyi:** CTA yakınına doğrulanmış yorum puanı ve üç kısa yorum eklemek wizard başlatma oranını artırır mı?
3. **Hizmet sayfası deneyi:** Genel sayfa yerine “Ankara kaynak tamiri” landing page'i reklamdan gelen nitelikli talep oranını artırır mı?

CTR tek başına karar metriği olmamalı. Her deney nitelikli talep, iptal ve hizmet alanı dışı talep oranıyla birlikte değerlendirilmeli.

## 13. Test ve kalite güvence planı

### Her pull request

- Lint, unit test ve build.
- Kritik sayfalarda accessibility smoke testi.
- 390x844, 768x1024 ve 1440x900 görsel regresyon.
- Yatay taşma ve metin kesilmesi kontrolü.
- Hero, hizmet, wizard ve sticky CTA çakışma kontrolü.

### Her release

- Canlı URL'de metin ve CTA sürüm kontrolü.
- Randevu oluşturma, takip, değişiklik ve iptal uçtan uca testi.
- WhatsApp, telefon, harita, galeri ve footer bağlantı testi.
- Mobil Lighthouse ve WebPageTest ölçümü.
- LocalBusiness schema, canonical, robots ve sitemap doğrulaması.
- Form olaylarının dashboard'a tekil ve doğru düşme kontrolü.

### Aylık

- Plerdy heatmap ve session recording incelemesi.
- En çok rage click, dead click ve scroll drop görülen üç alan.
- Kanal/hizmet bazında nitelikli talep analizi.
- En sık iptal nedeni ve müşteri geri bildirimi.
- Görsel, fiyat, ilçe ve çalışma saati içerik tazelik kontrolü.

## 14. Önerilen 4 sprint

### Sprint A: Mobil hız ve yayın güvenliği

- AVIF/WebP pipeline, `srcset`, hero preload.
- Font self-host ve CLS düzeltmesi.
- Güncel yerel sürümün yayını.
- Sitemap/canonical düzeltmesi.
- Lighthouse performans bütçesi.

**Sprint çıkış kriteri:** Mobil LCP < 3,5 sn., CLS < 0,10, transfer < 3 MB, canlı metin/kod eşleşmesi.

### Sprint B: Güven ve iletişim

- Gerçek yorumlar, portre, garanti/kapsam metni.
- İlçe listesi ve telefon CTA.
- Footer bilgi mimarisi ve gizlilik bağlantısı.
- Mesai dışı beklenti mesajı.

**Sprint çıkış kriteri:** Üç personanın temel güven sorularına ilk iki ekran içinde yanıt.

### Sprint C: Ölçüm ve CRO

- Olay sözlüğü, UTM standardı, telefon/adres olayları.
- Lead kalite statüleri ve kapalı dönüşüm döngüsü.
- Dashboard hunisi ve kanal kalite grafiği.
- İlk kontrollü CTA/güven deneyi.

**Sprint çıkış kriteri:** Kaynaktan onaylanan işe kadar izlenebilir talep zinciri.

### Sprint D: Hizmet odaklı büyüme

- İlk dört hizmet landing page'i.
- Hizmete özel vaka, SSS, fiyat mantığı ve schema.
- Reklam mesajı ile landing page mesajı eşleşmesi.
- Teklif/keşif akışının yapılandırılması.

**Sprint çıkış kriteri:** Her sayfada tek niyet, tek birincil CTA ve hizmet bazlı kalite ölçümü.

## 15. Nihai değerlendirme

Umut Usta'nın UX/UI açısından yeni bir görsel kimlikten çok, mevcut güçlü kimliğin performans, güven ve ölçümle tamamlanmasına ihtiyacı var. Marka dili ve randevu akışı doğru yönde; asıl değer kaybı mobilde ağır medya, yüksek CLS, canlı sürüm geriliği ve doğrulanabilir yerel güven kanıtlarının eksikliğinden geliyor.

Plerdy yaklaşımı siteye uygulandığında en önemli ürün ilkesi şudur: kullanıcı daha fazla içerik değil, daha az belirsizlik ister. Hizmetin kapsamı, fiyat mantığı, hizmet bölgesi, gerçek iş kanıtı, yanıt süresi ve talep sonrası adım açık olduğunda hem müşteri güveni hem Product Owner'ın nitelikli talep oranı birlikte yükselir.

## 16. Kaynaklar

- [Plerdy Website Checklists Hub](https://www.plerdy.com/check/)
- [Plerdy Local Service Website Leak Checklist](https://www.plerdy.com/local-service-website-money-leak-checklist/)
- [Plerdy Website Usability Checklist](https://www.plerdy.com/usability-testing-website-checklist/)
- [Plerdy Website Conversion Rate Checklist](https://www.plerdy.com/conversion-boosting-ideas-for-your-website/)
- [Plerdy Website Content Checklist](https://www.plerdy.com/website-content-checklist/)
- [Plerdy Core Web Vitals Checklist](https://www.plerdy.com/core-web-vitals-checklist/)
- [PageSpeed Insights - Umut Usta mobil/masaüstü raporu](https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fumut-usta.vercel.app%2Fappointment)
- [Umut Usta Kapsamlı Değerlendirme Raporu v3](./Umut_Usta_Kapsamli_Degerlendirme_Raporu_v3.md)
- [Umut Usta Copy Audit](./Umut_Usta_Copy_Audit_2026-07.md)
- [UX/UI Animation Research](./UX_UI_Animation_Research.md)
