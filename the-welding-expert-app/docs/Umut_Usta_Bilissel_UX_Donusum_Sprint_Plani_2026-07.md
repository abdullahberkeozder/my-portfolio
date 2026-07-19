# Umut Usta Bilişsel UX Dönüşüm Sprint Planı

**Program kodu:** `CUX`  
**Kapsam:** Müşteri giriş sayfası ve randevu talebi  
**Kapsam dışı:** Admin dashboard yeniden tasarımı  
**Yayın politikası:** Yalnız local; commit, push ve deploy yok

> Bu dosya programın kısa özetidir. Kullanıcı hikâyeleri, teknik görevler,
> dosya etkileri, manuel testler ve GO/NO-GO kapıları için
> `Umut_Usta_Bilissel_UX_Uygulanabilir_Detayli_Sprint_Plani_2026-07.md`
> kullanılmalıdır. Uygulama planlamasında CUX-4, `CUX-4A` (UI temeli) ve
> `CUX-4B` (iletişim/trust); CUX-6 ise `CUX-6A` (ölçüm/araştırma) ve
> `CUX-6B` (local release adayı) olarak teslim dilimlerine ayrılmıştır.

## Program hedefi

Müşterinin ilk doğru seçimi daha az zihinsel eforla yapmasını, talep akışını daha az hata ve geri dönüşle tamamlamasını sağlamak. Hizmet kapsamı azaltılmaz; bilgi ve seçimler görev anına göre katmanlanır.

## Ortak Definition of Done

- Acceptance kriterleri mobil ve masaüstünde karşılanır.
- Bir görünümde yalnız bir baskın birincil eylem bulunur.
- Klavye, focus, screen reader label, 200% eşdeğeri ve reduced-motion korunur.
- `npm run lint`, unit test, ilgili E2E ve build geçer.
- Görsel baseline bilinçli değişiklik için güncellenir.
- Analytics olayı merkezi taxonomy ile tekil kaydedilir.
- Admin ekranı davranışı değişmez.
- Push/deploy yapılmaz.

## CUX-0 - Araştırma, baseline ve karar kaydı

**Süre:** 1-2 gün  
**Amaç:** Tasarım değişikliklerini ölçülebilir kullanıcı problemine bağlamak.

### İşler

- Mevcut hero, sticky, hizmet ve zaman adımı aksiyon envanteri.
- Plerdy checklist eşleştirmesi.
- Bilimsel kaynak ve caveat kaydı.
- Persona/JTBD ve bilişsel walkthrough.
- Başlangıç event/funnel metriklerinin tanımı.

### Kabul kriterleri

- Araştırma raporu ve sprint planı repoda bulunur.
- “Plerdy prediction = gerçek kullanıcı verisi” yanılgısı açıkça engellenir.
- Admin kapsam dışı ve local-only kuralı belgelenir.

## CUX-1 - İlk seçim ve aksiyon hiyerarşisi

**Süre:** 3-5 gün  
**Amaç:** İlk ekrandaki ve hizmet seçimindeki karar maliyetini düşürmek.

### Kullanıcı hikâyeleri

| ID | Hikâye | SP |
| --- | --- | ---: |
| CUX-101 | Müşteri olarak ilk ekranda ana eylemi hemen ayırt etmek istiyorum | 3 |
| CUX-102 | Müşteri olarak ihtiyacımı teknik hizmet isimlerini taramadan seçmek istiyorum | 5 |
| CUX-103 | Müşteri olarak karar vermeden sistemin benim adıma hizmet seçmemesini istiyorum | 3 |
| CUX-104 | Mobil kullanıcı olarak sticky alanın içeriği kapatmamasını istiyorum | 3 |

### Teknik işler

- Hero'da bir birincil, bir alternatif görev yolu.
- Telefonu hero baskın butonlarından utility bağlantıya taşı.
- Mobil sticky alanı iki göreve düşür.
- Dört ihtiyaç grubu ve ikinci katman hizmet seçimi.
- Varsayılan seçimi kaldır.
- Seçim ve geri dönüş analytics olayları.
- Unit/E2E/görsel baseline güncellemesi.

### Kabul kriterleri

- İlk görünümde en fazla dört ihtiyaç grubu görünür.
- Hizmet kullanıcı tıklamadan seçili değildir.
- Devam butonu hizmet seçilmeden kullanılamaz.
- Kullanıcı grup ekranına geri dönebilir.
- Hero'da yalnız “Talep oluştur” baskın butondur.
- Sticky alanda yalnız “Talep oluştur” ve “Fotoğrafla danış” görünür.
- Telefon nav/contact alanında erişilebilir kalır.

### Ölçüm

- `service_group_selected`
- `service_group_back_clicked`
- `booking_service_changed`
- Grup -> hizmet -> zaman geçiş oranı

## CUX-2 - Randevu aracını görev merkezine taşıma

**Süre:** 3-4 gün  
**Amaç:** Kullanıcıyı tanıtım bölümlerini geçmeye zorlamadan talebe başlatmak.

### İşler

- Randevu aracını trust şeridinden hemen sonraya taşı.
- About içeriğini trust/proof içinde kısalt.
- İş örneklerini randevu sonrası ilk kanıt katmanı yap.
- Navigasyon anchor ve focus sırasını güncelle.
- Scroll-depth ve wizard-start ölçümünü karşılaştır.

### Kabul kriterleri

- DOM ve görsel sıra aynıdır.
- Randevu aracı mobilde en geç ikinci scroll bölgesinde başlar.
- Screen reader okuma sırası görev sırasıyla uyumludur.
- Mevcut hizmet kataloğu ve galeri kaybolmaz.

## CUX-3 - Zaman seçimini sadeleştirme

**Süre:** 4-6 gün  
**Amaç:** Tarih ve saat kararını iki küçük karara ayırmak.

### İşler

- Hızlı tarih seçeneklerini birincil görünüm yap.
- Seçilen günün saatlerini doğrudan göster.
- Tam hafta görünümünü “Başka tarih seç” altında aç.
- Boş hafta ve hata durumunu tek net alternatifle sadeleştir.
- Seçili hizmet özetini kompakt yap.

### Kabul kriterleri

- İlk görünümde tarih için en fazla üç hızlı seçenek vardır.
- Tam takvim kullanıcı talebiyle açılır.
- Gün seçilmeden saat seçilemez.
- Birincil ilerleme butonu focus ve sticky tarafından kapatılmaz.

## CUX-4 - İletişim ve güven katmanı

**Süre:** 4-5 gün  
**Amaç:** Formu kısa tutarken yüksek niyetli müşterinin ayrıntı ekleyebilmesini sağlamak.

### İşler

- Ad ve telefonu ana formda tut.
- E-posta/not alanlarını “Ek bilgi” progressive disclosure altında topla.
- Tek submit eylemi ve sade privacy metni.
- CTA yakınında doğrulanabilir güven kanıtları.
- Success görünümünde tek sıradaki adım ve takip bağlantısı.

### Kabul kriterleri

- Zorunlu alan sayısı iki olarak kalır.
- Ek alanlar klavye ve screen reader ile açılabilir.
- Form değeri adımlar arasında korunur.
- Hata özeti alana programatik olarak bağlıdır.

## CUX-5 - Hizmet içeriği ve progressive detail

**Süre:** 4-6 gün  
**Amaç:** Hizmet kataloğunu karar akışıyla yarışmadan taranabilir yapmak.

### İşler

- Featured hizmetleri problem diliyle özetle.
- Fiyat etkileyen ayrıntıları disclosure içine al.
- Gerçek vaka, ilçe, süre ve sonuç veri modelini hazırla.
- “Emin değilim” yolunu yerinde keşfe bağla.

### Kabul kriterleri

- Hizmet kartları görev butonu gibi görünmez.
- Her hizmette problem, kısa kapsam ve fiyat mantığı taranabilir.
- Ayrıntı açmak sayfayı beklenmedik anchor'a taşımaz.

## CUX-6 - Ölçüm, kullanılabilirlik ve local release adayı

**Süre:** 3-5 gün  
**Amaç:** Yeni deneyimi veri, görev testi ve teknik kaliteyle doğrulamak.

### İşler

- 5-8 kişiyle görev testi protokolü.
- SEQ ve kısa mental-demand ölçümü.
- Funnel/group/service görselleştirmeleri.
- 390x844, 768x1024 ve 1440x900 görsel QA.
- Lighthouse, E2E, accessibility ve regression.
- Local release raporu; production kararı verilmez.

### Kabul kriterleri

- Dört kritik E2E ve yeni grup akışı geçer.
- Accessibility >= 98 korunur.
- Mobil performance hedefi >= 90 veya açık NO-GO kaydı.
- Gerçek kullanıcı verisi yoksa dönüşüm artışı iddia edilmez.

## Sprint sırası ve bağımlılık

| Sprint | Bağımlılık | Çıktı |
| --- | --- | --- |
| CUX-0 | Yok | Araştırma ve baseline |
| CUX-1 | CUX-0 | Yeni aksiyon ve hizmet seçimi |
| CUX-2 | CUX-1 | Task-first sayfa sırası |
| CUX-3 | CUX-2 | Sade zaman seçimi |
| CUX-4 | CUX-3 | Sade iletişim ve trust |
| CUX-5 | Gerçek içerik | Hizmet/proof katmanı |
| CUX-6 | CUX-1-5 | Ölçüm ve local release adayı |

## Program riskleri

| Risk | Etki | Önlem |
| --- | --- | --- |
| Fazla sadeleştirme keşfedilebilirliği düşürür | Yüksek | İçeriği silme, katmanla; görev testi |
| Grup sınıflandırması müşterinin diline uymaz | Yüksek | “Bu iş hangi grupta?” testi ve analytics |
| Randevu öne gelince güven azalır | Orta | Kısa trust şeridi CTA yakınında kalır |
| Sticky CTA focus'u kapatır | Yüksek | Focus-not-obscured E2E |
| Eski event'lerle karşılaştırma bozulur | Orta | Taxonomy geriye uyumlu property ekler |
| Büyük redesign performansı düşürür | Yüksek | Dikey sprint, bundle/Lighthouse kapısı |

## Güncel durum

- CUX-0: Tamamlandı; araştırma, mevcut durum denetimi, kanıt hiyerarşisi ve baseline hazır.
- CUX-1: Yerelde tamamlandı. Varsayılan hizmet seçimi kaldırıldı; dört ihtiyaç grubu ve kademeli hizmet seçimi eklendi.
- CUX-1 aksiyon hiyerarşisi: Hero ve mobil sabit alanda iki ana eylem bırakıldı: "Talep Oluştur" ve "Fotoğrafla Danış". Telefon yardımcı bağlantıya taşındı.
- CUX-1 odak koruması: Mobil sabit aksiyonlar randevu sihirbazı görünürken gizleniyor; görev alanını ve devam butonunu kapatmıyor.
- CUX-1 ölçüm: `booking_service_group_selected` ve `booking_service_group_back_clicked` olayları eklendi.
- CUX-1 doğrulama: 60/60 Vitest, 8/8 Playwright, lint ve production build geçti. Mobil sihirbaz görsel yüksekliği 1367 px'den 797 px'ye indi; bu sonuç gerçek kullanıcı dönüşüm artışı iddiası değildir.
- CUX-2: Sıradaki uygulama sprinti; henüz başlanmadı.
- Git/Canlı: Commit, push ve deploy yapılmayacak.
