# Ustalar Rozet ve Hizmet Bölgesi Veri Kalitesi Pilot Planı V1

Tarih: 2026-10-21  
Kapsam: `/ustalar` üzerindeki mevcut nötr `Hizmet bölgesi` açıklaması.  
Amaç: Rekabetçi rozetlere geçmeden önce kapsam verisinin doğruluğunu, eksikliğini ve güncelliğini ölçmek.

## Başlangıç kanıtı

Read-only staging RPC ve public tablolar üzerinde yapılan ölçüm:

| Ölçüm | Sonuç | Yorum |
| --- | ---: | --- |
| Onaylı profesyonel | 14 | `list_public_verified_professionals` toplamı |
| Hizmet alanı olan profil | 14/14 | `%100` kapsam |
| Mahalle bilgisi olan profil | 14/14 | `%100` mahalle sinyali |
| Hizmet kaydı olan profil | 14/14 | `%100` hizmet eşleşmesi |
| Hizmet alanı satırı | 15 | Bir profilde iki alan satırı var |
| `district_trust_metrics` kaydı | 0/14 | Performans/rekabet rozeti için yetersiz |

Bu kanıt yalnızca staging okumasıdır; yazma, fixture ekleme veya üretim verisi değişikliği yapılmadı.

## V1 yayın kararı

Şimdilik yalnızca mevcut hizmet alanı açıklaması yayınlanabilir:

- `Hizmet bölgesi` tetikleyicisi
- İlçe ve mahalle listesi
- Veri yoksa `Çankaya geneli` veya `Ankara geneli` gibi nötr fall-back
- Açık adresin gösterilmediğini belirten KVKK açıklaması

Aşağıdaki rozetler veri sözleşmesi ve adalet incelemesi tamamlanana kadar kapalı kalır:

- Mahallenin ustası
- İlçenin ustası
- Bu ayın öne çıkanı
- En güvenilir usta

## Pilot ölçümleri

Her günlük staging/production-safe read-only raporda şu metrikler ölçülür:

1. **Kapsam tamlığı:** Onaylı profillerin kaçında en az bir ilçe ve en az bir hizmet var?
2. **Mahalle tamlığı:** Onaylı profillerin kaçında en az bir mahalle var?
3. **Tutarlılık:** Hizmet alanındaki ilçe, seçili sorgu filtresi ve kamuya açık profil arasında çelişki var mı?
4. **Tekrarsızlık:** Aynı `tradesperson_id + district + neighborhood` çifti birden fazla geliyor mu?
5. **Güncellik:** Alan kaydının son doğrulama zamanı veri sözleşmesinde mevcut mu? Yoksa güncellik rozeti gösterilmez.
6. **Güven metriği hazırlığı:** `district_trust_metrics` kaydı, tamamlanan iş sayısı, onaylı yorum sayısı ve hesaplama tarihi olmadan performans rozeti açılmaz.
7. **Mahremiyet:** Sokak adresi, GPS veya hassas konum alanı public response’a sızıyor mu?

## Kabul eşikleri

- Hizmet alanı ve hizmet kapsamı için en az `%98` doluluk.
- Aynı kapsam çiftinde `0` duplicate.
- Public response’ta `address`, `latitude`, `longitude` veya hassas koordinat alanı `0`.
- Eksik mahalle verisi olan profil, mahalle rozeti yerine nötr ilçe fall-back’i kullanmalı.
- Performans rozeti için en az 30 günlük veri, en az 5 tamamlanmış iş ve en az 3 onaylı yorum; ayrıca hesaplama tarihi zorunlu.
- Her rozet metni, kaynağını ve ölçüm penceresini açıklayan panel açmadan yalnızca sembolle gösterilmemeli.

## Görsel tarayıcı kontrolü

Yerel `/ustalar` kontrolünde gerçek RPC bağlantısı başarısız olduğunda güvenli `Usta listesi yüklenemedi` yüzeyi görüldü. `fixture` query parametresi server component’te RPC’den sonra değerlendirildiği için RPC hatasını bypass etmiyor. Bu nedenle canlı kart ve panel görsel QA’sı için sonraki teknik adım:

- read-only staging bağlantısıyla `/ustalar?view=split&sort=recommended` açmak veya
- RPC çağrısından önce çalışan, yalnızca test ortamında etkin bir visual fixture kapısı tasarlamak.

Sentetik profil eklemek veya staging’e veri yazmak bu pilotun parçası değildir.

## Sonraki ölçüm adımı

Bir sonraki ürün görevinden önce read-only rapor şu üç yüzeyi birlikte doğrulamalı:

1. `/ustalar` kartındaki özet,
2. `Hizmet bölgesi` ayrıntı paneli,
3. ilçe/mahalle filtresi ile panel verisinin eşleşmesi.

Bu üçlü doğrulama geçmeden rekabetçi gamification rozeti uygulanmamalıdır.
