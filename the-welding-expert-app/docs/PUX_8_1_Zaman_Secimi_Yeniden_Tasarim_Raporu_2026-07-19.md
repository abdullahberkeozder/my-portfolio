# PUX-8.1 Zaman Seçimi Yeniden Tasarım Raporu

**Proje:** `the-welding-expert-app`  
**Tarih:** 19 Temmuz 2026  
**Ortam:** Yalnızca yerel geliştirme  
**Kapsam:** Müşteri randevu wizard'ı, Zaman Tercihi adımı  
**Durum:** Uygulandı ve teknik olarak doğrulandı  
**Canlı/veri etkisi:** Yok

## 1. Yönetici özeti

Önceki zaman adımı işlevsel olmasına rağmen gün ve saat kararlarını dar bir sol ray ile sağ panel arasında bölüyordu. Gün kartlarındaki uygun saat sayıları, panel içi mikro adımlar ve ayrı açıklamalar görev basit olduğu halde arayüzü operasyonel gösteriyordu. Kullanıcı geri bildirimi doğrultusunda haftalık takvim ve saat alanı yeniden yatay, dengeli iki banda dönüştürüldü.

Yeni tasarım tek bir karar yüzeyi kullanır:

1. Kullanıcı haftanın yedi gününü aynı sırada görür; seçilemeyen günler kısa durum metni ve renkle açıklanır.
2. Bir gün seçtiğinde o günün yalnızca uygun saatleri alt bantta açılır.
3. Saat seçilene kadar devam eylemi gösterilmez.
4. Masaüstünde hafta tek satır, saatler dengeli `3x2`; mobilde günler ve saatler taşmasız iki kolon halinde yerleşir.
5. Seçilen hizmet bir kez ve kısa bir bağlam satırı olarak korunur.

Bu değişiklik görsel süs ekleyerek değil; seçenek, durum, sınır ve eylem sayısını azaltarak daha premium ve daha sakin bir ürün hissi hedefler.

## 2. Kullanılan araştırma zemini

### 2.1 Yerel raporlar

- [Bilişsel Yük UX/UI Araştırma Raporu](./Umut_Usta_Bilissel_Yuk_UX_UI_Arastirma_Raporu_2026-07-19.md)
- [Plerdy UX/UI Geliştirme Raporu](./Umut_Usta_Plerdy_UX_UI_Gelistirme_Raporu_2026-07.md)
- [PUX-8 Öncesi Wizard Premium UX Denetimi](./PUX_8_Oncesi_Randevu_Wizard_Premium_UX_Denetim_Raporu_2026-07-19.md)
- [PUX-7.5 Takvim Odaklı Revizyon](./PUX_7_5_Zaman_Tercihi_Takvim_Odakli_Revizyon_2026-07-19.md)
- [PUX-8 Kullanıcı Doğrulama Protokolü](./PUX_8_Kullanici_Dogrulama_Protokolu_2026-07-19.md)

### 2.2 İncelenen ürün desenleri

| Kaynak | İncelenen desen | Umut Usta için alınan karar |
| --- | --- | --- |
| Calendly | Tarih ile kullanılabilir saatlerin aynı görev içinde ardışık sunulması | Gün ve saat mekânsal olarak ilişkilendirildi |
| Cal.com | Uygunluk odaklı planlama ve zaman dilimi bağlamı | Müsait günler belirgin, seçilemeyen günler pasif tutuldu |
| Google Calendar Appointment Schedules | Meşgul zamanları gizleyip rezerve edilebilir saatleri öne çıkarma | Haftalık bağlam korundu; saat alanında yalnız seçilebilir aralıklar gösterildi |
| Square Appointments | Tarih/saat seçimini hizmet ve müşteri bilgileri arasındaki odaklı alt görev olarak ele alma | Üç adımlı wizard korundu; zaman adımı kendi içinde iki mikro karara ayrıldı |
| Plerdy | Net etiket, tutarlı kontrol, dikkat sırası ve gerçek kullanım verisiyle doğrulama | Görsel hiyerarşi sadeleştirildi; saha ölçümü ayrı karar kapısı olarak korundu |

Kaynaklar:

- https://calendly.com/help/how-to-book-meetings-in-real-time
- https://cal.com/faq
- https://support.google.com/calendar/answer/10729749?hl=en
- https://squareup.com/help/us/en/article/5349-create-and-schedule-appointments
- https://www.plerdy.com/usability-testing-website-checklist/
- https://www.plerdy.com/blog/plerdy-ux-usability-testing-how-to-use-it/

Bu kaynaklar birebir görsel kopya için değil, görev modeli ve etkileşim ilkelerini karşılaştırmak için kullanıldı. Umut Usta'nın iki saatlik yerel hizmet aralıkları ve haftalık ekip müsaitliği korunarak ürüne özel bir bileşim oluşturuldu.

## 3. Önceki tasarımın sorun modeli

| Bulgu | Kullanıcı etkisi | Öncelik |
| --- | --- | ---: |
| Gün ve saatlerin dar sol ray ile geniş sağ panel arasında bölünmesi | Haftayı karşılaştırma ve saatleri tarama alanı dengesizleşiyordu | Yüksek |
| Gün kartlarında uygun saat sayısının tekrarlanması | Karar için gerekmeyen sayı görsel gürültü oluşturuyordu | Yüksek |
| Hafta oklarının günlerden kopuk algılanması | Kontrolün hangi alanı değiştirdiği zayıflıyordu | Orta-yüksek |
| Tarih seçilmeden boş saat bölgesi ve pasif CTA görülmesi | Arayüz yarım veya çalışmıyor algısı yaratabiliyordu | Yüksek |
| Çok sayıda durum rozeti | Asıl hedef olan uygun zamanı bulma görevini görsel olarak bastırıyordu | Orta |
| `Hizmeti değiştir` eyleminin metin bağlantısı gibi görünmesi | Tıklanabilirlik sinyali zayıf kalıyordu | Orta |
| Büyük CTA'nın her durumda görünmesi | Henüz mümkün olmayan eylem gereksiz dikkat çekiyordu | Orta |

## 4. Tasarım ilkeleri

### 4.1 Progressive disclosure

Saatler ancak gün seçildikten sonra, devam eylemi ise ancak saat seçildikten sonra gösterilir. Kullanıcının o anda veremeyeceği kararlar görünür tutulmaz.

### 4.2 Recognition over recall

Seçilen hizmet zaman ekranında kısa bir bağlam satırı olarak kalır. Kullanıcının önceki adımda ne seçtiğini hatırlaması gerekmez; ancak hizmet açıklaması tekrar edilmez.

### 4.3 Availability signaling

Takvim haftanın tamamını kronolojik bağlam için gösterir. Müsait günler renk ve kısa metinle belirginleştirilir; geçmiş, kapalı veya planlanmamış günler görünür fakat seçilemez. Saat alanında ise yalnızca gerçekten seçilebilir aralıklar yer alır. Renk hiçbir zaman tek durum göstergesi değildir.

### 4.4 Proximity and common region

Hafta navigasyonu gün kartlarıyla aynı panelde tutulur. Seçilen gün ve saatler hemen alttaki ikinci panelde açılır. Bu yakınlık, haftalık bağlamı korurken seçim ile sonucunu ardışık hale getirir.

### 4.5 Calm premium

Premium his; fazla gölge, animasyon veya dekor yerine düzenli hizalama, kontrollü boşluk, kısa metin, net tipografik seviye ve az sayıda güçlü etkileşim üzerinden kurulur.

## 5. Yeni bilgi ve etkileşim mimarisi

```text
Uygun zamanı seçin
  Hizmet: seçili hizmet                         Hizmeti değiştir

  Gün seçin                     Önceki hafta · Tarih aralığı · Sonraki hafta
  Pazartesi ... Pazar           Kısa ve renk destekli durumlar

  Seçilen tam tarih
  Ortalama süre ve çalışma aralığı
  09:00-11:00 ... 19:00-21:00  (masaüstü 3x2)

  Saat seçildiyse kısa teyit notu
  İletişime Geç
```

### Durum sözleşmesi

| Durum | Görünen içerik | Görünmeyen içerik |
| --- | --- | --- |
| İlk açılış | Yedi günlük hafta, kısa durumlar ve saat yönlendirmesi | Saat butonları, CTA |
| Gün seçildi | Seçilen tarih, çalışma aralığı ve uygun saatler | Saat sayısı, kullanılamayan saatler, CTA |
| Saat seçildi | Seçim işareti, teyit notu, tek CTA | İkinci bir ileri eylem |
| Haftada uygunluk yok | Kısa boş durum, sonraki hafta ve WhatsApp alternatifi | Boş takvim hücreleri |
| Slot çakışması | Odaklanan hata bildirimi ve yenilenmiş uygunluk | Eski seçimin geçerli olduğu izlenimi |

## 6. Uygulanan görsel sistem

### Masaüstü

- Maksimum karar yüzeyi `84rem` ile sınırlandı.
- Hafta navigasyonu ve yedi gün aynı panel içinde gösterilir.
- Yedi gün geniş ekranda tek satırda ve eşit kolonlarda yerleşir.
- Saatler ortalanmış, dengeli `3x2` grid halinde gösterilir.
- Gün ve saat alanları eşit genişlikte iki ardışık panel kullanır.

### Tablet

- Gün kartları dört kolonlu ara düzene geçer.
- Hafta kontrolü aynı panel içinde kalır ve kartlardan kopmaz.

### Mobil

- Günler iki kolonlu, saatler `2x3`; yatay kaydırma gerekmez.
- Saat kontrolleri en az `44px` dokunma hedefini korur.
- Uzun hizmet adında `Hizmeti değiştir` eylemi ayrı satıra geçer.
- Wizard ve karar yüzeyinde yatay taşma oluşturulmaz.

### Hareket

- Gün değiştiğinde yalnızca saat içeriği kısa ve düşük mesafeli bir giriş kullanır.
- Seçili saat butonu geometrisini değiştiren sıçrama/pulse etkisi kaldırıldı.
- `prefers-reduced-motion` davranışı korunur.

## 7. Metin revizyonu

| Önceki yaklaşım | Yeni metin | Gerekçe |
| --- | --- | --- |
| `Tarih ve saat seçin` | `Uygun zamanı seçin` | Sistem tarih değil, müsaitlik sunuyor |
| Genel yönlendirme | `Önce günü, ardından size uyan saati seçin.` | Karar sırasını tek cümlede açıklar |
| Panel içi `1. Gün / Uygun günler` | `Gün seçin` | Gereksiz mikro adımı kaldırır |
| Boş saat alanı | `Bir gün seçin` | Bir sonraki eylemi doğrudan söyler |
| Saat sayısı ve aralık rozeti | Ortalama süre ve `09:00 - 21:00` çalışma aralığı | Sayısal rozeti kaldırıp karar bağlamını korur |
| Saat başlığı | `2. Saat / [tam tarih]` | Seçim bağlamını görünür tutar |
| Uzun iş süresi açıklaması | `[n] uygun saat · İki saatlik aralıklar` | Gereken iki bilgiyi kısa sunar |
| Pasif devam butonu | Saat seçilene kadar gizli | Geçersiz eylemi dikkat alanından çıkarır |

## 8. Erişilebilirlik ve mühendislik sözleşmesi

- Gün ve saatler gerçek `button` kontrolleridir.
- Seçim durumu `aria-pressed` ile aktarılır.
- Tarih butonlarının erişilebilir adı tam tarih ve müsaitlik durumunu içerir.
- Değişen saat bölgesi `aria-live="polite"` kullanır.
- Slot çakışması bildirimi `role="alert"` ile odaklanır.
- Klavye ile hizmetten gönderime kadar tam akış korunur.
- Minimum kontrol yüksekliği `44px` altına düşmez.
- Forced-colors ve reduced-motion koşulları otomatik test kapsamındadır.

## 9. Teknik doğrulama

| Kapı | Sonuç |
| --- | ---: |
| ESLint | Geçti, `0` hata |
| Unit/component | `24` dosya, `93/93` test |
| Zaman adımı odaklı test | `12/12` test |
| Production build | Geçti, `805` modül |
| CustomerBooking chunk | `110.58 kB`, gzip `26.90 kB` |
| Performans bütçesi | Geçti |
| Playwright E2E | `56/56` senaryo |
| Responsive | `320-1920 px` matrisi geçti |
| Görsel regresyon | Zaman adımının dört referans durumu güncellendi ve geçti |
| Erişilebilirlik | Klavye, reduced motion ve forced colors geçti |

## 10. Plerdy ölçüm planı

Otomatik testler kullanılabilirlik sonucunu kanıtlamaz. Yerel release adayı gerçek kullanım verisi alınabilecek bir ortama geçtiğinde aşağıdaki ölçümler önerilir:

| Ölçüm | Beklenen sinyal | Karar eşiği |
| --- | --- | ---: |
| Gün seçimine ilk doğru tıklama | Kullanıcı uygun gün listesini doğrudan anlar | `>= %90` |
| Gün seçimi -> saat seçimi süresi | İki mikro karar arasında kaybolmaz | Medyan `< 12 sn` |
| Saat seçimi rage click | Tıklama alanı ve seçim geri bildirimi nettir | `< %2` oturum |
| Zaman adımında geri dönüş | Hizmet bağlamı yeterlidir | `< %10` |
| Zaman adımı terk oranı | İçerik ve uygunluk akışı engel oluşturmaz | Önceki sürüme göre düşüş |
| SEQ | Görev kolay algılanır | Medyan `>= 5.5/7` |
| NASA-TLX Mental Demand | Zihinsel talep düşüktür | Medyan `<= 35/100` |

Plerdy heatmap ve oturum kayıtlarında özellikle hafta oku, gün kartı, boş saat yönlendirmesi, saat butonları ve `Hizmeti değiştir` etkileşimi izlenmelidir. Tek başına tıklama yoğunluğu başarı kabul edilmemeli; görev tamamlama olayı ve hata davranışıyla birlikte yorumlanmalıdır.

## 11. Açık riskler

1. Gerçek müşteri testi yapılmadığı için algılanan premium kalite ve görev kolaylığı henüz ölçülmüş değildir.
2. Yedi günlük kart düzeninin tablet ve mobilde tarama süresi saha verisiyle doğrulanmalıdır.
3. İki saatlik aralıkların hizmet türüne göre değişmesi planlanırsa saat kartı metni ve grid yoğunluğu yeniden test edilmelidir.
4. Plerdy ölçümleri canlıya alma talebi verilmeden kurulmayacak ve üretim verisi toplanmayacaktır.

## 12. Kapanış kararı

**Teknik GO:** Yeni zaman seçimi yüzeyi yerel kullanım ve kontrollü PUX-8 kullanıcı testleri için hazırdır.  
**Saha PENDING:** Premium algı, ilk doğru tıklama ve zihinsel yük hedefleri 5-8 gerçek katılımcıyla doğrulanmalıdır.  
**Production PENDING:** Kullanıcı açıkça istemeden commit, push, deploy veya canlı veri değişikliği yapılmayacaktır.

Bu çalışmada Supabase şeması, SQL, admin paneli ve canlı ortam değiştirilmedi.
