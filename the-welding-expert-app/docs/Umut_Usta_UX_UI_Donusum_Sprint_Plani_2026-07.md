# Umut Usta UX/UI Dönüşüm Sprint Planı

**Proje:** the-welding-expert-app  
**Plan tarihi:** 18 Temmuz 2026  
**Program adı:** Müşteri Deneyimi ve Dönüşüm Yenilemesi  
**Önerilen ritim:** Sprint 0 için 1 hafta, devamındaki sprintler için 2 hafta  
**Varsayılan ekip:** 1 geliştirici, Product Owner/tasarım desteği, ihtiyaç halinde Supabase desteği  
**Tahmini program:** 13 hafta + ayrı büyüme fazı

## 1. Program amacı

Umut Usta'nın müşteri yüzünü giriş sayfasından başlayarak yeniden tasarlamak; mobilde hızlı, güven veren, erişilebilir ve ölçülebilir bir hizmet talebi deneyimi oluşturmak.

Program sonunda müşteri:

1. İlk ekranda hangi hizmetin, nerede ve nasıl verildiğini anlayacak.
2. Gerçek iş ve işletme kanıtlarıyla güven kararını verecek.
3. İhtiyacını hizmetler arasında kolayca eşleştirecek.
4. Hizmet ve zaman tercihini düşük sürtünmeyle gönderecek.
5. Talebinin randevu olmadığını, ekibin teyit edeceğini bilecek.
6. Talebini takip edebilecek; değişiklik veya iptal isteği gönderebilecek.
7. Telefon, WhatsApp ve sistem formundan kendisine uygun kanalı seçebilecek.

Product Owner ise ziyaret kaynağından onaylanan ve tamamlanan işe kadar ölçülebilir bir talep zinciri görecek.

## 2. Kapsam ve sınırlar

### Program kapsamı

- `/appointment` müşteri giriş sayfasının bilgi mimarisi ve görsel yenilemesi.
- Hero, navigasyon, güven kanıtları, hizmetler, işler, süreç, randevu, SSS, konum ve footer.
- `/gallery` iş örnekleri deneyimi.
- `/appointment/track/:publicToken` self-servis takip ve değişiklik/iptal deneyimi.
- Mobil performans, Core Web Vitals ve erişilebilirlik.
- Müşteri tarafı analitik olayları ve dönüşüm hunisi.
- SEO/canonical/sitemap ve yayın kalite kapıları.

### Bu program dışında

- Admin panelinin bütünüyle yeniden tasarlanması.
- Ödeme ve e-ticaret akışı.
- Teknisyen mobil uygulaması.
- Tam kapsamlı CRM değişimi.
- Reklam kampanyalarının kurulması.

Admin tarafında yalnız yeni müşteri olaylarını ve lead kalite durumlarını göstermek için gereken sınırlı değişiklikler yapılır.

## 3. Mevcut işlerin durum haritası

| Konu | Durum | Sprint yaklaşımı |
| --- | --- | --- |
| Yeni logo ve graphite/copper renk sistemi | Yerelde hazır | Sprint 0'da doğrula, Sprint 1'de optimize et |
| `Randevu Al` ve kısa `Fotoğraf Gönder` CTA metni | Yerelde hazır | Sprint 0'da canlıya al |
| Hizmet kartlarının salt görüntülenmesi | Yerelde hazır | Sprint 0'da canlıya al, Sprint 3'te yeniden tasarla |
| Talep/zaman tercihi/onaylı randevu terminolojisi | Yerelde hazır | Sprint 0'da regresyon kontrolü |
| Progressive image ve skeleton bileşenleri | Altyapı hazır | Sprint 1'de gerçek AVIF/WebP pipeline ile tamamla |
| Motion tokenları ve reduced-motion | Altyapı hazır | Sprint 1 ve 6'da kalite kontrolü |
| Self-servis takip, değişiklik ve iptal isteği | Yerelde hazır | Sprint 5'te UX ve erişilebilirlik yenilemesi |
| Kanal dönüşümü ve hizmet analitiği | Kısmen hazır | Sprint 6'da olay sözlüğü ve kalite döngüsü tamamla |
| Gerçek yorumlar, usta profili ve güvence | Eksik | Sprint 2-3 |
| Mobil performans ve CLS | Kritik açık | Sprint 1 |
| Gizlilik/aydınlatma bağlantısı | Eksik | Sprint 4-5 |
| Hizmet bazlı landing page'ler | Yeni | Büyüme Fazı |

## 4. Hedef müşteri sayfası mimarisi

Yeni `/appointment` sırası:

1. **Global müşteri header'ı:** Logo, Hizmetler, İşlerimiz, Nasıl çalışır, İletişim, `Randevu Al`.
2. **Hero:** Ankara + hizmet kategorisi + değer önerisi + randevu/WhatsApp/telefon.
3. **Güven şeridi:** Doğrulanabilir yorum, hizmet bölgesi, yanıt hedefi, gerçek iş sayısı.
4. **Hizmet özeti:** En önemli dört kategori ve tüm hizmetleri görüntüleme.
5. **Gerçek iş kanıtı:** Üç önce/sonra vaka; ilçe, süre, problem ve çözüm.
6. **Nasıl çalışır:** Talep, teyit/keşif, uygulama, teslim.
7. **Randevu deneyimi:** Hizmet -> zaman tercihi -> iletişim -> başarı/takip.
8. **Güven ve itirazlar:** Fiyatı etkileyenler, malzeme, iptal/değişiklik, müsaitlik.
9. **Hizmet alanı ve iletişim:** İlçeler, harita, telefon, WhatsApp ve saatler.
10. **Footer:** Hızlı erişim, iletişim, gizlilik/aydınlatma, marka ve sitemap.

İlk ekran ve randevu yüzeyi en yüksek görsel ağırlığı alır. Yardımcı içerik aynı büyüklükte kartlara bölünmez; sayfa tam genişlikte, ritmik bölümler halinde ilerler.

## 5. Program başarı ölçütleri

### Ana ürün metriği

**Haftalık onaylanan nitelikli talep sayısı.**

### Teknik hedefler

| Metrik | Başlangıç | Program hedefi |
| --- | ---: | ---: |
| Mobil Lighthouse Performance | 44 | >= 90 |
| Mobil LCP | 7,5 sn. | <= 2,5 sn. |
| Mobil CLS | 0,74 | <= 0,05 |
| İlk sayfa transferi | yaklaşık 11,4 MB | < 2 MB ideal, < 3 MB release eşiği |
| Lighthouse Accessibility | 95 | >= 98 + manuel akış testi |
| Kritik müşteri E2E kapsamı | Yok | 4 ana senaryo |

### Ürün hedefleri

- Hero -> randevu başlatma oranı.
- Adım bazlı randevu terk oranı.
- Telefon, WhatsApp ve sistem talebi dönüşüm oranı.
- Nitelikli talep oranı.
- İlk geri dönüş ve onay süresi.
- Değişiklik/iptal nedeni dağılımı.
- Müşteri efor skoru veya kısa başarı sonrası geri bildirim.

## 6. Sprint 0 - Stabilizasyon ve yayın tabanı

**Süre:** 1 hafta  
**Amaç:** Yerelde hazır değişiklikleri kaybetmeden güvenli bir başlangıç sürümü oluşturmak ve canlı/yerel farkını kapatmak.  
**Önerilen kapasite:** 15-18 story point

### Kullanıcı hikâyeleri

| ID | Hikâye | SP | Durum |
| --- | --- | ---: | --- |
| S0-01 | Müşteri olarak güncel, açık CTA ve talep metinlerini canlıda görmek istiyorum | 3 | Büyük ölçüde hazır |
| S0-02 | Müşteri olarak hizmet kartlarını yanlışlıkla randevu seçimi sanmadan incelemek istiyorum | 2 | Hazır |
| S0-03 | PO olarak canlı sürüm ile onaylanan release'in aynı olduğunu doğrulamak istiyorum | 3 | Yeni |
| S0-04 | Arama motoru olarak tek doğru canonical alan adını görmek istiyorum | 2 | Yeni |
| S0-05 | Ekip olarak dönüşüm öncesi performans ve UX baseline'ını saklamak istiyoruz | 3 | Yeni |
| S0-06 | Ekip olarak mevcut değişiklikleri regresyonsuz build/test etmek istiyoruz | 3 | Yeni |

### Teknik işler

- Mevcut kirli worktree değişikliklerini kapsamlarına göre gözden geçir; mevcut kullanıcı işini koru.
- `Randevu Al`, kısa WhatsApp CTA'sı, statik hizmet kartları ve yeni ürün metinlerini test et.
- Self-servis SQL/RPC gereksinimlerinin canlı Supabase ile sürüm uyumunu doğrula.
- `sitemap.xml`, canonical, robots ve Open Graph alan adlarını `umut-usta.vercel.app` ile eşitle.
- Mobil/masaüstü baseline ekran görüntülerini ve PageSpeed sonuçlarını release kaydı olarak sakla.
- Vercel preview -> PO onayı -> production yayın akışı tanımla.

### Kabul kriterleri

- Canlı hero CTA'sı `Randevu Al`, WhatsApp CTA'sı `Fotoğraf Gönder`.
- Pazarlama hizmet kartları tıklanamaz ve sayfayı kaydırmaz.
- Takvimde hizmet seçimi çalışmaya devam eder.
- Takip, değişiklik ve iptal linkleri canlı veritabanıyla çalışır.
- Sitemap ve canonical tek alan adı kullanır.
- Lint, build ve mevcut testler geçer.

### Sprint demo

Canlıda masaüstü ve mobil giriş -> hizmet inceleme -> randevu talebi -> başarı -> takip/değişiklik akışı.

## 7. Sprint 1 - Performans ve tasarım temelleri

**Süre:** 2 hafta  
**Amaç:** Yeni tasarımın üzerine kurulacağı hızlı, sabit ve erişilebilir medya/typography altyapısını tamamlamak.  
**Önerilen kapasite:** 26-30 story point

### Kullanıcı hikâyeleri

| ID | Hikâye | SP |
| --- | --- | ---: |
| S1-01 | Mobil müşteri olarak ilk ekranı birkaç saniye içinde sabit görmek istiyorum | 8 |
| S1-02 | Mobil müşteri olarak gereksiz büyük görseller indirmek istemiyorum | 8 |
| S1-03 | Hareket hassasiyeti olan kullanıcı olarak tüm içeriği animasyonsuz kullanmak istiyorum | 3 |
| S1-04 | Tasarım/geliştirme ekibi olarak ortak token ve responsive kuralları kullanmak istiyoruz | 5 |
| S1-05 | Ekip olarak performans gerilemesini CI aşamasında görmek istiyoruz | 5 |

### Teknik işler

- Hero, hizmet, portföy ve logo için AVIF/WebP üretim yaklaşımı kur.
- 320/640/1024 varyantları, `srcset`, `sizes`, width/height ve `aspect-ratio` ekle.
- Hero LCP görseline preload ve doğru `fetchpriority` uygula.
- İlk ekran dışındaki tüm medyayı lazy-load et; skeleton ölçülerini sabitle.
- Plus Jakarta Sans'ı self-host et; yalnız kullanılan ağırlıkları dahil et.
- Fallback font metriklerini ayarla ve header CLS kaynağını kaldır.
- Global tokenları light/dark, focus, status ve channel rollerine göre sadeleştir.
- 320, 390, 768, 1024 ve 1440 genişlikte sabit düzen testi ekle.
- Lighthouse CI veya eşdeğer performans bütçesi tanımla.

### Kabul kriterleri

- Mobil LCP < 3,5 sn. ve CLS < 0,10 release eşiğini geçer.
- İlk sayfa transferi < 3 MB.
- Hero font yüklenirken satır kırılımı nedeniyle belirgin kayma yapmaz.
- Görseller cihaz genişliğine uygun kaynak indirir.
- Reduced-motion modunda hiçbir içerik görünmez kalmaz.
- Tüm dokunma hedefleri en az 44x44 CSS px.

### Sprint demo

Yavaş 4G simülasyonunda eski/yeni filmstrip, transfer boyutu ve CLS karşılaştırması.

## 8. Sprint 2 - Müşteri giriş sayfası ve güven mimarisi

**Süre:** 2 hafta  
**Amaç:** Hero'dan ilk güven kararına kadar müşteri deneyimini baştan tasarlamak.  
**Önerilen kapasite:** 27-31 story point

### Kullanıcı hikâyeleri

| ID | Hikâye | SP |
| --- | --- | ---: |
| S2-01 | Canan olarak hizmeti, bölgeyi ve sonraki adımı ilk ekranda anlamak istiyorum | 5 |
| S2-02 | Mehmet olarak ustanın gerçek ve ulaşılabilir olduğunu hemen görmek istiyorum | 5 |
| S2-03 | Mobil müşteri olarak randevu, WhatsApp veya telefon kanalını kolayca seçmek istiyorum | 5 |
| S2-04 | Klavye kullanıcısı olarak ana navigasyonu ve CTA'ları eksiksiz kullanmak istiyorum | 3 |
| S2-05 | PO olarak hero kanallarının dönüşümünü ayrı ölçmek istiyorum | 3 |
| S2-06 | Müşteri olarak hizmet verilen ilçeleri açıkça görmek istiyorum | 3 |
| S2-07 | Müşteri olarak güven ve iletişim bilgilerini footer'da bulmak istiyorum | 5 |

### Tasarım kapsamı

- Yeni global müşteri header'ı ve responsive menü.
- Hero metin hiyerarşisi, gerçek görsel kompozisyonu ve üç kanal CTA.
- Yalnız doğrulanabilir bilgilerden oluşan güven şeridi.
- Gerçek Umut Usta portresi/atölye tanıtımı.
- İlçe/hizmet bölgesi özeti.
- Yeni footer bilgi mimarisi.
- Sticky mobil CTA'nın içerik ve cookie/gizlilik yüzeylerini kapatmaması.

### PO içerik bağımlılıkları

- Gerçek portre veya atölye fotoğrafı.
- Hizmet verilen kesin ilçeler ve varsa yol/servis koşulları.
- Telefon geri dönüş hedefi; örneğin çalışma saatlerinde 1-2 saat.
- Kullanılabilecek doğrulanabilir deneyim, iş veya yorum sayıları.
- Garanti veriliyorsa kapsam ve istisna onayı.

Doğrulanamayan sayı veya rozet tasarıma eklenmez; yer tutucu metin production'a çıkmaz.

### Kabul kriterleri

- İlk ekran “ne, nerede, neden güveneyim, ne yapmalıyım?” sorularını yanıtlar.
- `Randevu Al` tek birincil marka CTA'sıdır; WhatsApp kanal rengiyle, telefon ikincil aksiyonla ayrışır.
- Telefon `tel:` bağlantısı olarak çalışır ve olay üretir.
- Mobilde hero altında sonraki bölümün başlangıcı görünür.
- Header, sticky CTA ve focus göstergeleri çakışmaz.
- Footer iletişim, hızlı bağlantı ve gizlilik/aydınlatma bağlantılarını içerir.

### Sprint demo

Canan ve Mehmet persona senaryolarıyla 390 px mobil ve 1440 px masaüstü ilk 30 saniye testi.

## 9. Sprint 3 - Hizmet keşfi ve gerçek iş kanıtı

**Süre:** 2 hafta  
**Amaç:** Müşterinin ihtiyacını eşleştirmesini ve ustanın yeterliliğini gerçek işlerle değerlendirmesini sağlamak.  
**Önerilen kapasite:** 28-32 story point

### Kullanıcı hikâyeleri

| ID | Hikâye | SP | Yerel durum (19 Temmuz 2026) |
| --- | --- | ---: | --- |
| S3-01 | Müşteri olarak hizmetleri yanlışlıkla randevu seçmeden karşılaştırmak istiyorum | 5 | Tamamlandı |
| S3-02 | Müşteri olarak fiyatı hangi etkenlerin değiştirdiğini anlamak istiyorum | 3 | Tamamlandı |
| S3-03 | Mehmet olarak gerçek önce/sonra iş örnekleri görmek istiyorum | 5 | Teknik yüzey tamamlandı; gerçeklik ve yayın izni PO doğrulaması bekliyor |
| S3-04 | Selin olarak işin süresini, ilçesini ve çözümünü değerlendirmek istiyorum | 5 | İlçe ve çözüm tamamlandı; doğrulanmış süre verisi bekliyor |
| S3-05 | Müşteri olarak tüm iş örneklerini filtreleyerek incelemek istiyorum | 5 | Tamamlandı |
| S3-06 | PO olarak hangi hizmet ve vakanın randevuya katkı verdiğini ölçmek istiyorum | 3 | Tamamlandı |

### Tasarım kapsamı

- Giriş sayfasında dört ana hizmet kategorisi; diğer hizmetler ikincil görünümde.
- Kartlarda hizmet adı, müşteri problemi, fiyat mantığı ve kısa kapsam.
- Kartların salt bilgi yüzeyi olduğunun cursor/focus/semantics ile açık olması.
- En az üç vaka için önce/sonra karşılaştırması.
- Vaka şablonu: problem, çözüm, süre, ilçe, kullanılan yaklaşım ve sonuç.
- `/gallery` sayfasında kategori filtresi, erişilebilir medya görüntüleme ve vaka detay yapısı.
- Galeri yükleme, boş, hata ve yavaş bağlantı durumları.

### PO içerik bağımlılıkları

- En az üç gerçek projenin önce/sonra görselleri.
- Proje konumu için paylaşılabilir ilçe bilgisi.
- İş süresi ve kullanılan çözüm.
- Müşteri izni gereken görseller için yayın onayı.
- Başlangıç fiyatlarının güncel ve hangi kapsamı içerdiği bilgisi.

### Kabul kriterleri

- Hizmet kartına tıklama kullanıcıyı beklenmedik biçimde randevuya taşımaz.
- Her kartın metni iki bakışta hizmet/kapsam/fiyat mantığını anlatır.
- En az üç doğrulanmış vaka mobil ve masaüstünde erişilebilir.
- Görseller optimize edilmiş responsive kaynaklardan gelir.
- Galeri klavye, ESC ve focus dönüşüyle kullanılabilir.
- Vaka görüntüleme ve randevu CTA olayları ölçülür.

### Sprint demo

“Balkon korkuluğu kırıldı” ve “apartman raylı kapısı takılıyor” görevleriyle hizmet/vaka bulma testi.

## 10. Sprint 4 - Randevu akışının tamamen yenilenmesi

**Süre:** 2 hafta  
**Amaç:** Hizmet seçiminden başarı ekranına kadar ana ürün akışını yeniden tasarlamak.  
**Önerilen kapasite:** 30-34 story point

### Kullanıcı hikâyeleri

| ID | Hikâye | SP |
| --- | --- | ---: |
| S4-01 | Müşteri olarak hangi adımda olduğumu ve sırada ne olduğunu görmek istiyorum | 3 |
| S4-02 | Müşteri olarak hizmetimi az seçenek ve açık kapsamla seçmek istiyorum | 5 |
| S4-03 | Müşteri olarak uygun gün/saat tercihini mobilde kolayca seçmek istiyorum | 8 |
| S4-04 | Müşteri olarak yalnız gerekli iletişim bilgilerini vermek istiyorum | 5 |
| S4-05 | Hata yaptığımda verilerimi kaybetmeden nasıl düzelteceğimi görmek istiyorum | 5 |
| S4-06 | Müşteri olarak talebin kaydedildiğini ve sıradaki adımı açıkça görmek istiyorum | 5 |

### Tasarım kapsamı

- Wizard progress yapısının sadeleştirilmesi.
- Hizmet seçimi: büyük kart tekrarını azaltan kompakt seçim kontrolü.
- Takvim: gün, uygunluk, slot ve hafta geçişinin mobil-first tasarımı.
- Zamanın “tercih”, ekip iletişimi sonrası “onaylı randevu” olduğunun kalıcı açıklaması.
- Form: ad, telefon, isteğe bağlı e-posta/not; doğru mobil klavye ve autocomplete.
- Inline validation, hata özeti ve veri kaybetmeden düzeltme.
- WhatsApp ve sistem formu kanallarının net ama yarışmayan hiyerarşisi.
- Başarı: talep no, takip bağlantısı, seçilen özet, geri dönüş hedefi.

### Teknik işler

- `BookingCalendar`, `ServiceSelection`, `BookingForm` ve `BookingSuccess` bileşen sınırlarını koruyarak UI yenile.
- Form semantiği ve tek submit davranışı oluştur; yalnız buton `onClick` bağımlılığını azalt.
- `aria-live`, `aria-describedby`, focus management ve hata özetini uygula.
- Yerel bilgi otomatik doldurma davranışının gizlilik ve temizleme seçeneklerini değerlendir.
- API loading/error/retry ve slot çakışması durumlarını tasarla.
- Randevu E2E testini ekle.

### Kabul kriterleri

- 390x844 ekranda yatay kayma olmadan akış tamamlanır.
- Kullanıcı klavyeyle tüm adımları tamamlar.
- Geçersiz telefon hatası alana programatik olarak bağlıdır.
- API hatasında seçilen hizmet, gün, saat ve form bilgileri kaybolmaz.
- Slot çakışmasında açık çözüm ve yeni slot seçme yolu sunulur.
- Başarı ekranı “talep kaydedildi” ile “randevu onaylandı” ifadelerini karıştırmaz.
- Randevu başlangıç, adım, hata, gönderim ve başarı olayları tekil kaydedilir.

### Yerel uygulama durumu - 19 Temmuz 2026

| ID | Durum | Yerel çıktı |
| --- | --- | --- |
| S4-01 | Tamamlandı | Üç adımlı, semantik ve görünür wizard ilerlemesi |
| S4-02 | Tamamlandı | Kompakt radiogroup hizmet seçimi ve seçili hizmet özeti |
| S4-03 | Tamamlandı | Mobil gün/saat seçimi, hafta geçişi ve tercih açıklaması |
| S4-04 | Tamamlandı | Ad, telefon, isteğe bağlı e-posta/not ve tek submit davranışı |
| S4-05 | Tamamlandı | Inline hata, hata özeti, focus yönetimi ve slot çakışmasında veri koruma |
| S4-06 | Tamamlandı | Talep/onay ayrımı, takip bağlantısı ve sonraki adım durumu |

Sprint 4 yerelde tamamlandı. Canlı yayın, veritabanı şema değişikliği, commit ve push yapılmadı. Ayrıntılı kanıt ve kabul kriteri matrisi `Sprint_4_Local_Randevu_Akisi_Raporu_2026-07-19.md` dosyasındadır.

### Sprint demo

Başarılı talep, geçersiz telefon, API hatası ve son anda dolan slot olmak üzere dört senaryo.

## 11. Sprint 5 - Takip, değişiklik, iptal ve müşteri iletişimi

**Süre:** 2 hafta  
**Amaç:** Talep sonrası belirsizliği azaltmak ve self-servis akışı yeni müşteri tasarım diliyle tamamlamak.  
**Önerilen kapasite:** 26-30 story point

### Kullanıcı hikâyeleri

| ID | Hikâye | SP |
| --- | --- | ---: |
| S5-01 | Müşteri olarak talebimin güncel durumunu takip etmek istiyorum | 5 |
| S5-02 | Müşteri olarak tarih/saat değişikliği isteği göndermek istiyorum | 5 |
| S5-03 | Müşteri olarak iptal isteğimin ilk kez ve doğru biçimde alındığını görmek istiyorum | 5 |
| S5-04 | Müşteri olarak neden iletişim bilgilerimin alındığını bilmek istiyorum | 3 |
| S5-05 | Mesai dışında talep bırakan müşteri olarak ne zaman dönüş alacağımı bilmek istiyorum | 3 |
| S5-06 | PO olarak iptal nedeni ve geri bildirimi analiz etmek istiyorum | 5 |

### Tasarım kapsamı

- Takip sayfası: durum, hizmet, zaman tercihi, son güncelleme ve sonraki adım.
- Değişiklik/iptal segmented control, alanlar ve dinamik açıklama.
- Daha önce talep gönderildi uyarısının doğru ilk/tekrar davranışı.
- İptal nedeni, not ve geri bildirim alanlarının ayrıştırılması.
- Gizlilik/aydınlatma metni ve veri kullanım açıklaması.
- Çalışma saati/mesai dışı geri dönüş mesajı.
- Talep sonucu otomatik bildirim için sağlayıcı bağımsız event/outbox tasarımı; entegrasyon kapsamı ayrıca onaylanır.

### Kabul kriterleri

- İlk iptal isteği tekrar isteği gibi gösterilmez.
- İptal/değişiklik eylemi otomatik randevu değişikliği izlenimi vermez.
- Aynı tür tekrar talebinde önceki talep zamanı ve güncel not davranışı açıktır.
- Public token dışında kişisel kayıt kimliği açığa çıkmaz.
- Form yakınında veri kullanım bağlantısı ve kısa açıklama vardır.
- İptal nedeni dashboard analizine doğru düşer.
- Takip ve self-servis E2E senaryoları geçer.

### Yerel uygulama durumu - 19 Temmuz 2026

| ID | Durum | Yerel çıktı |
| --- | --- | --- |
| S5-01 | Tamamlandı | Durum, zaman tercihi, son güncelleme ve sıradaki adım bulunan takip görünümü |
| S5-02 | Tamamlandı | Ekip teyidi gerektiren tarih/saat değişiklik isteği |
| S5-03 | Tamamlandı | İlk ve tekrar iptal isteğini doğru ayıran inline sonuç davranışı |
| S5-04 | Tamamlandı | Form yakını kısa veri açıklaması ve ayrı veri kullanımı sayfası |
| S5-05 | Tamamlandı | İstanbul saatine göre mesai içi/dışı geri dönüş beklentisi |
| S5-06 | Tamamlandı | Ayrı iptal nedeni/geri bildirim alanları ve neden dağılım grafiği |

Sprint 5 uygulama kodu yerelde tamamlandı. Eklemeli işlem geçmişi, public veri minimizasyonu ve outbox için `supabase/sprint_5_customer_followup.sql` hazırlandı ancak veritabanında çalıştırılmadı. Canlı yayın, commit ve push yapılmadı. Ayrıntılar `Sprint_5_Local_Takip_Self_Servis_Raporu_2026-07-19.md` dosyasındadır.

### Sprint demo

Yeni talep takibi, ilk değişiklik, ilk iptal, tekrar iptal ve geçersiz token senaryoları.

## 12. Sprint 6 - Ölçüm, CRO, erişilebilirlik ve production release

**Süre:** 2 hafta  
**Amaç:** Yeni müşteri deneyimini ölçülebilir, test edilmiş ve kontrollü biçimde yayına almak.  
**Önerilen kapasite:** 27-31 story point

### Kullanıcı hikâyeleri

| ID | Hikâye | SP |
| --- | --- | ---: |
| S6-01 | PO olarak kaynak -> talep -> onay -> tamamlanan iş hunisini görmek istiyorum | 8 |
| S6-02 | PO olarak telefon, WhatsApp ve sistem kanallarını karşılaştırmak istiyorum | 5 |
| S6-03 | PO olarak niteliksiz veya bölge dışı talepleri ayırmak istiyorum | 5 |
| S6-04 | Ekip olarak müşteri akışının erişilebilirliğini ve regresyonunu güvenceye almak istiyoruz | 5 |
| S6-05 | Ekip olarak yeni tasarımı kontrollü ve geri alınabilir biçimde yayınlamak istiyoruz | 5 |

### Teknik işler

- Event taxonomy'yi merkezi sabitler ve şema doğrulamasıyla standardize et.
- Page view, hero CTA, telefon, adres, galeri, validasyon, başarı ve self-servis olaylarını tamamla.
- UTM source/medium/campaign/content/term standardını uygula.
- Admin tarafına `qualified`, `unqualified`, `outside_area`, `spam` kalite sınıfları ekle.
- Kanal -> talep -> onay -> tamamlanan iş dashboard görünümü oluştur.
- Keyboard, screen reader, 200% zoom, reduced-motion ve kontrast manuel testleri.
- Dört kritik müşteri Playwright E2E senaryosu ve görsel regresyon.
- Production smoke testi, performans ölçümü ve izleme planı.

### Kabul kriterleri

- Aynı oturum ve aynı işlem için olaylar iki kez sayılmaz.
- WhatsApp tıklaması ile onaylanan iş birebir eşleştirilemiyorsa raporda “iletişim başlangıcı” olarak adlandırılır; satış gibi sunulmaz.
- Kanal ve hizmet bazında nitelikli talep oranı görünür.
- Lighthouse mobil >= 90, accessibility >= 98 hedefini karşılar; geçici istisna varsa PO tarafından kayıt altına alınır.
- Dört E2E senaryosu production öncesi geçer.
- Release checklist ve rollback adımı dokümante edilir.

### Yerel uygulama durumu - 19 Temmuz 2026

| Kapsam | Durum | Not |
| --- | --- | --- |
| S6-01 ölçüm hunisi | Tamamlandı | Operasyon verisinden kapalı huni |
| S6-02 kanal karşılaştırması | Tamamlandı | WhatsApp satış olarak gösterilmiyor |
| S6-03 lead kalitesi | Smoke test bekliyor | Migration 19 Temmuz 2026'da kullanıcı tarafından uygulandı |
| S6-04 erişilebilirlik ve regresyon | Tamamlandı | 8/8 E2E, accessibility ve CLS kapıları geçti |
| S6-05 kontrollü release | NO-GO | Performance 80 ve LCP yaklaşık 5.33 sn; PO istisnası yok |

Ayrıntılı yerel sonuç: `docs/Sprint_6_Local_Olcum_Release_Raporu_2026-07-19.md`.

### Sprint demo

Bir UTM kampanyasından başlayan talebin dashboard'da kanal, hizmet, kalite ve onay durumu boyunca izlenmesi.

## 13. Büyüme Fazı - Hizmet bazlı landing page'ler

Bu faz çekirdek müşteri deneyimi kararlı ve ölçülebilir olduktan sonra başlatılmalıdır.

### Önerilen ilk sayfalar

1. Ankara kapı, korkuluk ve kaynak tamiri.
2. Ankara boya ve badana.
3. Raylı kapı tamiri ve montajı.
4. Otomatik kapı motoru ve akıllı kilit.

### Her sayfa için şablon

- Hizmet ve lokasyon odaklı H1.
- Tek birincil CTA.
- Problem ve kapsam.
- Başlangıç fiyat mantığı.
- Gerçek vaka ve fotoğraf.
- Hizmet verilen ilçeler.
- Hizmete özel SSS.
- LocalBusiness/Service schema ve canonical.
- Kampanya mesajıyla birebir uyum.
- Hizmet bazlı nitelikli talep metriği.

Bu faz, tek sprintte dört sayfayı kopyalamak yerine iki sprintte tasarım sistemi + dört benzersiz içerik olarak planlanmalıdır.

## 14. Product Owner karar ve içerik takvimi

| Son tarih | PO kararı/teslimi | Etkilediği sprint |
| --- | --- | --- |
| Sprint 0 ortası | Production alan adı ve release onayı | S0 |
| Sprint 1 ilk 3 gün | Yeni görsel formatı ve kalite seviyesi onayı | S1 |
| Sprint 2 başlamadan | İlçeler, geri dönüş hedefi, telefon önceliği | S2 |
| Sprint 2 ilk hafta | Portre/atölye ve doğrulanabilir güven kanıtları | S2 |
| Sprint 3 başlamadan | En az üç gerçek vaka ve yayın izinleri | S3 |
| Sprint 3 ilk hafta | Güncel başlangıç fiyatları ve kapsam | S3 |
| Sprint 4 başlamadan | WhatsApp vs sistem formu iş önceliği | S4 |
| Sprint 5 başlamadan | Gizlilik/aydınlatma metni ve saklama yaklaşımı | S5 |
| Sprint 6 başlamadan | Lead kalite tanımları ve dashboard kararları | S6 |

İçerik zamanında gelmezse yer tutucu üretim verisine dönüştürülmez. İlgili hikâye sprintten çıkarılır veya doğrulanabilir genel içerikle sınırlandırılır.

## 15. Sprint yönetim kuralları

### Definition of Ready

Bir hikâye sprinte alınmadan önce:

- Kullanıcı problemi ve hedef persona yazılıdır.
- Kabul kriterleri test edilebilir durumdadır.
- Gerekli metin, görsel ve işletme verisi hazırdır veya bağımlılık sahibine atanmıştır.
- Analytics olayı gerekip gerekmediği belirlenmiştir.
- Mobil, erişilebilirlik ve hata durumları tanımlanmıştır.
- Tahmin ve teknik bağımlılıklar ekipçe anlaşılmıştır.

### Definition of Done

- Kabul kriterleri karşılanmıştır.
- Lint, build, unit ve ilgili E2E testleri geçmiştir.
- 390x844, 768x1024 ve 1440x900 görsel kontrol yapılmıştır.
- Keyboard/focus, reduced-motion ve kontrast kontrol edilmiştir.
- Loading, empty, error ve success durumları tamamlanmıştır.
- Analytics olayı tekil ve doğru property'lerle doğrulanmıştır.
- Performans bütçesi aşılmamıştır.
- PO preview ortamında onaylamıştır.
- Release notu ve gerekiyorsa rollback adımı yazılmıştır.

### Sprint seremonileri

- **Planning:** 90 dakika; hedef, kapasite ve bağımlılık kilidi.
- **Günlük takip:** En fazla 15 dakika; ilerleme, engel ve karar ihtiyacı.
- **Ara UX kontrolü:** Sprintin 4. veya 5. günü; mobil ve içerik doğrulaması.
- **Backlog refinement:** Haftada 45 dakika; sonraki sprintin Ready durumu.
- **Review/demo:** Gerçek persona göreviyle, yalnız ekran gezintisi değil.
- **Retro:** Bir süreç iyileştirmesi ve bir kalite aksiyonu seçilir.

## 16. Riskler ve azaltma planı

| Risk | Olasılık | Etki | Azaltma |
| --- | --- | --- | --- |
| Gerçek fotoğraf/yorum gecikmesi | Yüksek | Yüksek | PO içerik takvimi ve sprint öncesi Ready kapısı |
| Büyük tasarım değişikliği randevuyu kırar | Orta | Çok yüksek | Bileşen sınırlarını koru, E2E ve preview release kullan |
| Görsel kalite için dosya boyutu yeniden büyür | Yüksek | Yüksek | Otomatik format/ölçü pipeline ve CI bütçesi |
| Analitik olaylar iki kez sayılır | Orta | Yüksek | Merkezi taxonomy, idempotency/deduplication testi |
| WhatsApp dönüşümü satış gibi yorumlanır | Orta | Orta | Olayı “iletişim başlangıcı” olarak adlandır, lead kaliteyle kapat |
| Koyu tema kontrast ve bakım yükünü artırır | Orta | Orta | Her iki tema için token testi; kullanım düşükse müşteri tarafında sadeleştir |
| Canlı ve yerel sürüm tekrar ayrışır | Orta | Yüksek | Preview onayı, release checklist ve canlı smoke testi |
| Tüm giriş sayfasını tek seferde yenileme gecikir | Yüksek | Yüksek | Dikey dilimler ve her sprint sonunda yayınlanabilir çıktı |

## 17. Önerilen Jira/backlog yapısı

### Epic'ler

- `UXF` - Foundation ve performans.
- `ENT` - Müşteri giriş deneyimi.
- `TRU` - Güven ve iş kanıtı.
- `BKG` - Randevu akışı.
- `SSV` - Self-servis takip/değişiklik/iptal.
- `DAT` - Analytics ve CRO.
- `QAR` - Accessibility, test ve release.
- `GRW` - Hizmet landing page büyümesi.

### Etiketler

- `persona-canan`, `persona-mehmet`, `persona-selin`
- `mobile`, `accessibility`, `performance`, `content`, `analytics`
- `po-content-needed`, `backend`, `frontend`, `design`
- `p0`, `p1`, `p2`

Her hikâye en az bir persona, bir epic ve bir kalite etiketi taşımalıdır.

## 18. Başlangıç önerisi

Program doğrudan yeni hero çizerek başlamamalı. İlk adım Sprint 0 ile yerel/canlı farkını kapatmak ve mevcut işlevleri güvenceye almak; ikinci adım Sprint 1 ile mobil performans ve tasarım temelini düzeltmektir. Böylece Sprint 2'de tasarlanacak yeni müşteri giriş sayfası ağır görsel ve kararsız layout üzerine kurulmaz.

İlk planning toplantısında yalnız Sprint 0 ve Sprint 1 ayrıntılı taahhüt edilmelidir. Sprint 2-6 hedefleri yol haritası olarak korunmalı; her refinement toplantısında gerçek içerik, ölçüm ve önceki sprint öğrenimlerine göre yeniden tahmin edilmelidir.

## 19. İlgili dokümanlar

- [Plerdy UX/UI Geliştirme Raporu](./Umut_Usta_Plerdy_UX_UI_Gelistirme_Raporu_2026-07.md)
- [Kapsamlı Değerlendirme Raporu v3](./Umut_Usta_Kapsamli_Degerlendirme_Raporu_v3.md)
- [Copy Audit](./Umut_Usta_Copy_Audit_2026-07.md)
- [UX/UI Animation Research](./UX_UI_Animation_Research.md)
