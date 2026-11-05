# `/ustalar` Marker Safe-Area QA

Tarih: 29 Ekim 2026  
Route: `/ustalar?view=split&sort=recommended&fixture=limited`  
Amaç: Marker ve cluster etiketlerinin dar ekranlarda map viewport dışına taşmadığını doğrulamak.

## Sonuç

Clamp davranışı `.airbnbMapPill` ve `.clusterPinToken` için doğrulandı. Görünür marker elemanlarının tamamı map sınırları içinde kaldı; yatay sayfa taşması oluşmadı.

| Viewport | HTTP | Map sınırı | Görünür marker ihlali | Scroll width |
| --- | ---: | --- | ---: | ---: |
| 320 × 900 | 200 | x=16–304 | 0 | 320 |
| 390 × 900 | 200 | x=16–374 | 0 | 390 |
| 820 × 900 | 200 | x=386–803 | 0 | 820 |
| 1440 × 900 | 200 | x=593–1423 | 0 | 1440 |

Boş durum başlığı tüm ölçülerde aynı kaldı: `Bu bölgede doğrulanmış usta bulunamadı.`

## Kanıt görüntüleri

- [320 px](./marker-clamp-after-320.png)
- [390 px](./marker-clamp-after-390.png)
- [820 px](./marker-clamp-after-820.png)
- [1440 px](./marker-clamp-after-1440.png)

## Uygulanan davranış

- Marker elemanı eklendikten ve map yeniden ölçüldükten sonra yatay sınırları ölçülüyor.
- Gerekli düzeltme `--pill-shift-x` değişkeniyle uygulanıyor; mevcut hover/focus transformları korunuyor.
- Aynı clamp, bölge cluster etiketlerine de uygulanıyor.
- Map merkezi, zoom, route parametreleri ve marker verisi değiştirilmedi.

## Kalite kapıları

- `npm run styles:check`: başarılı
- `npm run lint`: 0 error, 9 mevcut warning
- `npm run type-check`: başarılı

