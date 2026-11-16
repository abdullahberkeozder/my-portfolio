# Dizin bağlantı hatası görsel kanıtı

Bu paket, `/ustalar` bağlantı hatası kurtarma yüzeyinin üretim derlemesi üzerinde doğrulanan responsive görüntülerini içerir. Hem `view=split` hem de URL değiştirilmeden haritaya dönüşen `view=list` girişleri kapsanır.

## Kabul sözleşmesi

- Ankara haritası görünür ve etkileşimli kalır.
- Profesyonel ve temsilî dükkân pinleri gösterilmez.
- Yalnız bir `Tekrar dene` eylemi bulunur.
- `0 usta`, `Sayfa 1` ve normal boş liste mesajları gösterilmez.
- Yatay taşma oluşmaz.
- Mevcut hizmet, ilçe, görünüm ve sıralama URL üzerinde korunur.
- Bağlantı hatasında görünüm seçici gizlenir; `view=list` isteği URL üzerinde korunurken kullanışlı harita kurtarma yüzeyi gösterilir.

## Görsel matris

| Genişlik | Kanıt |
| --- | --- |
| 320 px | [connection-error-320.png](./evidence/connection-error-320.png) |
| 390 px | [connection-error-390.png](./evidence/connection-error-390.png) |
| 820 px | [connection-error-820.png](./evidence/connection-error-820.png) |
| 1440 px | [connection-error-1440.png](./evidence/connection-error-1440.png) |
| 390 px · liste girişi | [connection-error-list-390.png](./evidence/connection-error-list-390.png) |
| 1440 px · liste girişi | [connection-error-list-1440.png](./evidence/connection-error-list-1440.png) |

Görüntüler yerel üretim derlemesinde yalnız geliştirme/test fixture kapısı açılarak alınmıştır. Üretim veritabanı ve production yapılandırması değiştirilmemiştir.
