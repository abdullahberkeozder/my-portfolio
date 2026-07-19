# Umut Usta UX/UI ve Motion Araştırması

Tarih: 11 Temmuz 2026

## Amaç

Umut Usta için hareket, dikkat çekmek yerine üç işlevi yerine getirmelidir: sistemin yanıt verdiğini göstermek, kullanıcıya içerik hiyerarşisini koruyarak yön vermek ve metal işçiliği markasının özen hissini güçlendirmek.

## Araştırma Bulguları

| Konu | Bulgu | Ürün Kararı |
| --- | --- | --- |
| Süre ve easing | Masaüstünde mikro etkileşimler kısa kalmalı; Material rehberi 150-200 ms aralığını önerir. | Hover/focus: 140-200 ms. Bölüm ve rota girişi: 320 ms. |
| Hareket erişilebilirliği | Sistem hareket azaltma tercihi, zorunlu olmayan hareketi kaldırmalıdır. | Tüm yeni hareketler `prefers-reduced-motion` altında anlık hale gelir. |
| Yükleme geri bildirimi | Skeleton, hedef düzeni koruyarak algılanan bekleme süresini azaltır. | Galeri verisi ve görseller için layout-preserving skeleton kullanılır. |
| Sayfa geçişi | Kısa, aynı bağlamdaki geçişler yön bulmayı iyileştirir; desteklenmeyen ortamlarda içerik doğrudan görünmelidir. | Yönetim rotalarında 320 ms fade + 8 px yükselme; bağımlılık veya API zorunluluğu yok. |
| Performans | Çok sayıda veya büyük animasyon işlemci tüketimini artırır. | Yalnızca `opacity` ve `transform` animasyonu; sürekli dekoratif efekt yok. |

## Kaynaklar

- [Material Design: Duration & easing](https://m1.material.io/motion/duration-easing.html): kısa, bağlama uygun süreler ve doğal easing eğrileri.
- [web.dev: Motion accessibility](https://web.dev/learn/accessibility/motion/): sistem hareket tercihine saygı ve gereksiz sürekli hareketten kaçınma.
- [W3C WCAG 2.3.3: Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions): etkileşim kaynaklı zorunlu olmayan hareketin kapatılabilmesi.
- [web.dev: Skeleton loading](https://web.dev/case-studies/eleme): skeleton ekranların algılanan performansa katkısı.
- [Chrome for Developers: View Transitions](https://developer.chrome.com/docs/web-platform/view-transitions): aynı bağlamdaki kısa geçişlerin destek/fallback yaklaşımı.

## Uygulanan Sistem

### Motion Tokenları

- `--motion-fast: 140ms`: buton basışı, hover ve küçük ikon durumları.
- `--motion-base: 200ms`: renk, kenarlık ve gölge değişimleri.
- `--motion-slow: 320ms`: sayfa ve bölüm girişi.
- `--ease-standard`: arayüz durumu değişimleri.
- `--ease-out`: ekrana giriş ve içerik görünür hale gelmesi.

### Hareket Haritası

| An | Davranış | Amaç |
| --- | --- | --- |
| Route lazy-load | Markalı logo, bakır ilerleme çizgisi | Boş ekran yerine marka devamlılığı |
| Sayfa açılışı | 8-12 px yükselme + fade | Bağlam değişimini yumuşatma |
| Bölüm viewport'a girişi | Tek seferlik, 320 ms reveal | Uzun randevu akışında hiyerarşi |
| Görsel yükleme | Skeleton -> opacity + küçük ölçek düzeltmesi | Layout shift olmadan gerçek görselin ortaya çıkması |
| Kart / buton | Kısa gölge ve `translateY` | Tıklanabilirlik geri bildirimi |
| Tema değişimi | 420 ms renk cross-fade | Önceki 1.5 sn geçişin oluşturduğu gecikmeyi azaltma |

## Kaçınılan Desenler

- Sürekli parlayan CTA ve sonsuz dekoratif loop'lar.
- Parallax veya ekranın büyük kısmını hareket ettiren geçişler.
- Yalnızca spinner kullanıp nihai düzeni gizleyen tam ekran yüklemeler.
- Hareket azaltma tercihini yok sayan ölçekleme ve kaydırma efektleri.

## Sonraki Ölçüm

Yayın sonrası aşağıdaki metrikler takip edilmelidir:

- Randevu sihirbazında hizmet seçimi -> saat seçimi geçiş oranı.
- Skeleton görünen oturumlarda tekrar yenileme veya tekrar tıklama oranı.
- Mobilde ilk etkileşime kadar geçen süre ve LCP.
- Hareket azaltma tercihine sahip oturumlarda hata veya terk oranı.
