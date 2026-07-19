# PUX-5 Öncesi Wizard Düzeltme Raporu

**Tarih:** 19 Temmuz 2026  
**Kapsam:** Müşteri randevu akışı, hizmet sınıflandırması ve wizard yerleşimi  
**Durum:** Teknik uygulama tamamlandı, yalnız yerelde doğrulandı  
**Canlı/Git:** Deploy, commit ve push yapılmadı

## 1. Problem ve Kararlar

### 1.1 Keşif seçeneğinin tekrarı

`Yerinde keşif ve teklif`, bahçe grubunda normal bir hizmet gibi görünürken ayrıca belirsiz ihtiyacın güvenli çıkış yolu olarak sunuluyordu. Seçim sonrası hizmet adı hem kartta hem özette tekrar ediyordu. Bu yapı kategori sınırlarını bulanıklaştırıyor ve kullanıcının aynı seçeneği iki kez değerlendirmesine neden oluyordu.

Uygulanan çözüm:

- Dördüncü ana grup `Bahçe ve dış alan` olarak yeniden tanımlandı.
- Keşif, normal hizmet gruplarından çıkarıldı.
- `Birlikte belirleyelim` seçimi ayrı `Keşif talebi` durumunu açıyor.
- Bu durumda yalnız bir radyo seçeneği gösteriliyor.
- Görünür hizmet sayısı bir ise kart normal sütun genişliğinde ortalanıyor; iki veya daha fazla seçenek iki eşit sütuna dağılıyor. Mobilde tüm seçenekler tam genişlikte tek kolona dönüyor.
- Alt özet hizmet adını tekrarlamıyor; `Hizmet seçildi` ve `Zaman tercihinizi seçerek devam edin` diyor.
- Sayfanın bilgilendirme kataloğu da keşfi tekrar listelemiyor.

Bu karar recognition-over-recall, açık kategori ayrımı ve gereksiz tekrarın azaltılması ilkeleriyle uyumludur.

### 1.2 Adımlar üzerinden gezinme

İlerleme göstergesi yalnız durum bildiriyordu. Artık üç adım gerçek `button` elemanlarıdır ve aşamalı açılır:

| Adım | Erişim kuralı |
|---|---|
| Hizmet | Her zaman açık |
| Zaman Tercihi | Hizmet seçildikten sonra açık |
| İletişim | Geçerli tarih ve saat seçildikten sonra açık |

Kullanıcı tamamlanmış adıma geri dönebilir ve ileri adıma döndüğünde mevcut seçimler korunur. Henüz tamamlanmamış adıma atlama engellenerek hata önleme ilkesi korunur. Düğmeler en az 44 px hedef alanına, klavye odağına, `aria-current` bilgisine ve açıklayıcı erişilebilir adlara sahiptir.

### 1.3 Wizard genişliği

Önceki `90rem` sınırı odaklı form okuması için savunulabilir olsa da hizmet seçimi, ilerleme ve takvim dahil tüm kabuğa uygulanmıştı. Bu nedenle wizard, sayfanın `118rem` ana içerik ekseninden kopuk görünüyordu.

Yeni ölçü sistemi:

- Wizard dış kabuğu: `max-width: 118rem`, ana sayfa ızgarasıyla hizalı.
- İletişim formu: `max-width: 72rem`, ortalanmış ve kontrollü okuma uzunluğu.
- Mobil: Tek kolon, mevcut 16/12 px iç boşluk ve taşmasız yapı korunuyor.

Böylece görsel devamlılık ile form okunabilirliği aynı katmanda çözülmek yerine görev türüne göre ayrıldı. Hizmet karşılaştırması geniş alandan yararlanırken metin girişi gereksiz yere uzamıyor.

## 2. Etkilenen Alanlar

- `src/features/booking/components/ServiceSelection.jsx`
- `src/features/booking/components/booking.styles.js`
- `src/pages/CustomerBooking.jsx`
- `src/features/booking/components/ServiceSelection.test.jsx`
- `e2e/pux-baseline.spec.js`
- İlgili Playwright görsel referansları

API sözleşmesi, Supabase şeması, randevu kayıt mantığı ve admin ekranları değişmedi. Migration gerekmiyor.

## 3. Doğrulama

| Kalite kapısı | Sonuç |
|---|---:|
| ESLint | Başarılı, 0 uyarı |
| Vitest | 87/87 başarılı |
| Playwright E2E | 26/26 başarılı |
| PUX görsel/davranış paketi | 18/18 başarılı |
| Vite production build | Başarılı |
| Performance budget | Başarılı |

Eklenen korumalar:

- Keşif başlığı akışta yalnız bir kez görünür.
- Keşif alt hizmet kataloğunda tekrar etmez.
- Tek keşif kartının masaüstünde wizard merkeziyle hizası en fazla 1 px sapar.
- Adımlar doğru sırada açılır ve seçimler ileri-geri gezinmede korunur.
- Masaüstü wizard ile ana içerik ızgarasının x konumu ve genişliği en fazla 1 px sapar.
- Masaüstü wizard için yeni görsel regresyon referansı bulunur.

Önceki wizard görüntüleri `docs/readme-assets/pux-4-wizard-baseline/` altında arşivlendi.

## 4. Sonuç

Üç kullanıcı geri bildirimi karşılandı. Akış daha açık bir hizmet taksonomisine, geri dönülebilir fakat güvenli bir adım navigasyonuna ve sayfa tasarım sistemiyle tutarlı bir dış genişliğe sahip. PUX-5'e geçiş için veritabanı veya ek yerel yapılandırma gerekmiyor.
