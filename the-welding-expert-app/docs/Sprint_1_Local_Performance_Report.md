# Sprint 1 - Yerel Performans ve Görsel Kararlılık Raporu

Tarih: 18 Temmuz 2026  
Durum: Yerelde tamamlandı; deploy, commit, push ve Supabase değişikliği yapılmadı.

## Sprint hedefi

Müşteri giriş sayfasındaki yüksek görsel transferini azaltmak, mobilde doğru boyutlu görsel sunmak, font kaynaklı kayma riskini düşürmek ve sonraki değişiklikler için otomatik performans bütçesi oluşturmak.

## Uygulanan değişiklikler

- 22 adet 1024x1024 PNG için 320, 640 ve 1024 px AVIF/WebP varyantları üretildi.
- Hero görseline responsive `srcset`, `sizes`, yüksek öncelik ve AVIF preload eklendi.
- Hizmet ve galeri kartları responsive görsel bileşenine taşındı; harici URL'ler değişmeden bırakıldı.
- Görsellere 1024x1024 intrinsic ölçü verildi; hero ve kart çerçevelerinin boyutları sabit tutuldu.
- Uygulama içindeki 1.5 MB PNG logo, mevcut SVG logo ile değiştirildi. PNG yalnızca sosyal paylaşım görseli olarak tutuldu.
- Google Fonts ağ bağlantısı kaldırıldı; Plus Jakarta Sans değişken fontu yerel ve subset'li olarak eklendi.
- `prefers-reduced-motion` davranışı korundu.
- Görsel üretim ve performans bütçesi komutları eklendi.

## Yerel ölçüm sonuçları

Production preview, önbellek kapalı, 390x844 viewport:

| Ölçüm | Sonuç |
|---|---:|
| Toplam transfer | 550.3 KB / 0.54 MB |
| Görseller | 308.8 KB |
| JavaScript | 189.3 KB |
| Font | 48.6 KB |
| CSS | 2.5 KB |
| Başarısız istek | 0 |
| Yatay taşma | Yok |
| Hero kaynağı | `hero-640.avif` |

Production preview, 1280 px masaüstü:

- Toplam transfer: 516.1 KB / 0.50 MB
- Hero kaynağı: `hero-1024.avif`
- Yatay taşma ve başarısız görsel: yok

Otomatik görsel bütçesi:

- 132 modern asset
- Kritik müşteri sayfası görselleri: 194.8 KB
- En büyük tek asset: 291.2 KB
- Modern asset seti toplamı: 10.47 MB; sayfa açılışında tamamı indirilmez

## Doğrulama

- `npm run lint`: geçti
- `npm run build`: geçti, 797 modül
- `npm run test:run`: geçti, 9 dosya / 28 test
- Responsive görsel testleri: 2 test geçti
- `npm run perf:budget`: geçti
- `git diff --check`: geçti; yalnızca mevcut CRLF bilgilendirmeleri var
- Mobil ve masaüstü ana sayfa ile galeri görsel kontrolü: geçti
- Production preview konsol uyarısı/hatası: yok

## Kabul kriterleri

| Kriter | Durum |
|---|---|
| Mobil transfer < 3 MB | Geçti: 0.54 MB yerel production preview |
| Cihaz genişliğine uygun görsel | Geçti: mobil 640 px, masaüstü 1024 px AVIF |
| Font dış kaynağa bağımlı değil | Geçti |
| Görsel ölçüleri sabit | Geçti |
| Reduced motion desteği | Geçti; mevcut global ve bileşen kuralları korunuyor |
| Dokunma hedefi >= 44 px | Geçti; global kontrol minimumu 4.4 rem |
| Mobil LCP < 3.5 sn | Canlıya yakın throttled Lighthouse/PageSpeed tekrarında doğrulanmalı |
| CLS < 0.1 | Sabit ölçüler ve yerel font uygulandı; throttled Lighthouse/PageSpeed tekrarında doğrulanmalı |

## Kalan riskler

- Supabase galeri kayıtlarındaki harici PNG URL'leri uygulama tarafından dönüştürülemiyor. Galeri masaüstü kontrolünde altı harici PNG kaynağı görüldü. Sonraki adım yükleme anında WebP/AVIF üretimi veya CDN image transformation olmalı.
- Yerel production preview gerçek mobil CPU/ağ yavaşlatmasını temsil etmez. LCP ve CLS için canlıya çıkmadan önce throttled Lighthouse koşusu gereklidir.
- Eski PNG kaynaklar `public/images` altında fallback/kaynak dosya olarak durduğu için deployment paketi büyüktür; kullanıcı transferine dahil değildir. CI artifact boyutu ayrıca sınırlandırılabilir.

## Yerel kullanım

```bash
npm run images:optimize
npm run perf:budget
npm run build
npm run preview -- --host 127.0.0.1 --port 5191
```
