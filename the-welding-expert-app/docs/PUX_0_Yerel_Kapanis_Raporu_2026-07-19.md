# PUX-0 Yerel Kapanış Raporu

**Proje:** `the-welding-expert-app`  
**Sprint:** PUX-0 - Baseline, karar kaydı ve koruma ağı  
**Tarih:** 19 Temmuz 2026  
**Durum:** Tamamlandı  
**Ortam:** Yalnız yerel geliştirme

## 1. Sprint amacı

PUX-0'ın amacı müşteri arayüzünü değiştirmek değil; premium dönüşümden önce mevcut görünüm, davranış, tekrarlar, token dağınıklığı ve ana randevu durumları için ölçülebilir bir baseline oluşturmaktı.

Bu amaç tamamlandı. Üretim UI bileşenlerinin görünümü veya Supabase şeması değiştirilmedi.

## 2. Tamamlanan çıktılar

### 2.1 Deterministik görsel baseline

Yeni Playwright paketi:

- `e2e/pux-baseline.spec.js`

Yeni snapshot klasörü:

- `e2e/pux-baseline.spec.js-snapshots/`
- Tarihsel PUX-0 arşivi: `docs/readme-assets/pux-0-baseline/`

Aktif Playwright snapshot'ları sonraki bilinçli görsel sprintlerde güncellenir. PUX-0 öncesi/sonrası karşılaştırmasının kaybolmaması için bu sprintin dokuz görseli tarihsel arşive ayrıca kopyalanmıştır.

Kaydedilen 9 görsel:

1. Mobil açık ilk viewport.
2. Mobil koyu ilk viewport.
3. Tablet açık ilk viewport.
4. Masaüstü açık ilk viewport.
5. Wizard hizmet adımı.
6. Wizard zaman adımı.
7. Wizard iletişim adımı.
8. Wizard başarı durumu.
9. Koyu tema geçersiz takip durumu.

Toplam snapshot boyutu yaklaşık `1.58 MiB` (`1,657,743` byte).

### 2.2 Kararlılık önlemleri

- Sistem tarihi `19 Temmuz 2026` olarak sabitlendi.
- Supabase REST cevapları yerel fixture ile mocklandı.
- Galeri ve servis remote verisine bağımlılık kaldırıldı.
- Font yüklemesi screenshot öncesinde bekleniyor.
- İlk viewport'taki görsellerin decode işlemi bekleniyor.
- Reduced motion aktif; animasyon ve caret screenshot farkı üretmiyor.

### 2.3 Logo koruma sözleşmesi

- Navigasyon logosunun açık temada görünür ve yüklenmiş olduğu doğrulanıyor.
- Navigasyon logosunun koyu temada görünür ve yüklenmiş olduğu doğrulanıyor.
- `naturalWidth` ve `naturalHeight` sıfırdan büyük olmalı.

Bu test asset'in teknik olarak yüklendiğini doğrular. Koyu temadaki optik ayrışma PUX-1 visual baseline ile iyileştirilecektir.

### 2.4 Dikkat mimarisi koruma sözleşmesi

- Mobil ilk viewport'ta 2 görünür logo mevcut durum olarak kaydedildi.
- Hero ile sticky CTA'nın aynı anda görünmesi mevcut durum olarak kaydedildi.
- PUX-2 hedefi olan “hero CTA görünürken sticky gizli” davranışı `test.fail` ile expected-failure sözleşmesi olarak eklendi.

PUX-2 davranışı uyguladığında `test.fail` kaldırılacak ve hedef normal geçen regression testine dönüşecektir.

### 2.5 Envanter ve karar kaydı

Oluşturulan belge:

- [PUX-0 Mevcut Durum ve Karar Envanteri](./PUX_0_Mevcut_Durum_Envanteri_2026-07-19.md)

Belge şunları içerir:

- Logo, CTA, güven, iletişim ve teyit tekrarları.
- Her unsur için koru/birleştir/taşı/kaldır kararı.
- Wizard ve alt sayfa içerik kararları.
- Token, tema ve asset envanteri.
- 8 tasarım karar kaydı.
- PUX-1 giriş kriterleri.

## 3. Baseline ölçümleri

| Ölçüm | Sonuç |
| --- | ---: |
| Benzersiz `--color-*` adı | 63 |
| Benzersiz core style hex değeri | 59 |
| Core style radius bildirimi | 45 |
| Core style shadow bildirimi | 23 |
| Core style transition bildirimi | 17 |
| Core style animation bildirimi | 7 |
| ThemeToggle local hex değeri | 15 |
| Mobil ilk viewport görünür logo | 2 |
| Mobil ilk viewport farklı karar | 2 |
| Mobil ilk viewport CTA görünümü | 4 |

Core style kapsamı:

- `src/styles/GlobalStyles.js`
- `src/pages/CustomerBooking.styles.js`
- `src/features/booking/components/booking.styles.js`

## 4. Test sonuçları

### Lint

Komut:

```text
npm run lint
```

Sonuç: Başarılı, `0` warning ve `0` error.

### Unit/component testleri

Komut:

```text
npm run test:run
```

Sonuç:

- `20/20` test dosyası geçti.
- `79/79` test geçti.

`CustomerAppointmentManage` invalid-token testi beklenen hata yolunu `stderr` üzerinde gösterir; test başarısızlığı değildir.

### PUX baseline Playwright

Komut:

```text
npm run test:e2e -- e2e/pux-baseline.spec.js --reporter=line
```

Sonuç: `10/10` geçti. PUX-2 hedef testi expected-failure sözleşmesi olarak doğru biçimde işlendi.

### Tüm Playwright paketi

Komut:

```text
npm run test:e2e -- --reporter=line
```

Sonuç: `18/18` geçti.

Kapsanan alanlar:

- Mobil randevu tamamlama.
- Klavye ve semantic landmark.
- `%200` eşdeğeri dar viewport.
- Reduced motion.
- Self-servis değişiklik/iptal ve invalid token.
- Mevcut ve PUX görsel regresyonları.

### Production build

Komut:

```text
npm run build
```

Sonuç: Başarılı; `803` modül dönüştürüldü.

### Performans bütçesi

Komut:

```text
npm run perf:budget
```

Sonuç: Başarılı.

- `132` dosya.
- `10.47 MB` toplam dist.
- `194.8 KB` kritik görseller.
- `291.2 KB` en büyük bütçelenen asset.

Bu değerler premium dönüşümün sonraki sprintlerinde karşılaştırma baseline'ıdır; gerçek kullanıcı Core Web Vitals verisi değildir.

## 5. Kabul kriteri kontrolü

| Kriter | Durum | Kanıt |
| --- | --- | --- |
| Mobil/tablet/desktop baseline | Geçti | 4 first-viewport snapshot |
| Wizard adım 1/2/3/success | Geçti | 4 wizard snapshot |
| Tracking/self-servis tema baseline | Geçti | Dark invalid tracking + önceki light snapshot |
| Tekrar envanteri | Geçti | PUX-0 envanter belgesi |
| Token envanteri | Geçti | Sayısal ölçüm ve sınıflandırma |
| Hero/sticky hedef sözleşmesi | Geçti | Expected-failure Playwright testi |
| Mevcut testler yeşil | Geçti | 79 unit + 18 E2E |
| Production UI değişmedi | Geçti | Değişiklikler yalnız test/snapshot/docs |
| SQL migration yok | Geçti | Supabase dosyası değiştirilmedi |
| Push/deployment yok | Geçti | Yalnız yerel çalışma |

## 6. Açık bulgular

PUX-0 bu sorunları düzeltmez; sonraki sprintler için görünür hale getirir:

1. Koyu temada logo optik ayrışması düşük.
2. Theme toggle marka dışı mavi/mor/sarı palet kullanıyor.
3. Mobil hero ve sticky aynı CTA setini tekrarlıyor.
4. İlk viewport'ta nav ve hero markası tekrar ediyor.
5. Hero trust, badge ve proof strip aynı güven mesajlarını çoğaltıyor.
6. Core stil sisteminde renk, radius ve shadow dağılımı geniş.
7. Wizard başarı ekranı doğru bilgi taşısa da uzun ve çok katmanlı.

## 7. PUX-1 hazırlık durumu

PUX-1 başlayabilir. Giriş koşulları karşılandı:

- Görsel baseline kararlı.
- Logo master asset mevcut.
- Token ve hardcoded değer envanteri hazır.
- Light/dark logo testleri hazır.
- Build ve performans bütçesi yeşil.
- Booking API ve analytics kontratına dokunulmadı.

PUX-1 kapsamı şu sınırda tutulmalıdır:

1. Forged U asset varyantları.
2. Quiet Craft semantic token temeli.
3. Tipografi/radius/shadow/motion çekirdeği.
4. Açık/koyu tema parity.
5. Theme toggle token ve süre uyumu.

Navigasyon/hero yapısal sadeleştirmesi PUX-2'ye bırakılmalıdır.

## 8. Yerel çalışma güvencesi

- Git commit yapılmadı.
- Git push yapılmadı.
- Canlı ortama deployment yapılmadı.
- Supabase üzerinde migration veya uzak veri değişikliği yapılmadı.
- Uygulama yalnız yerel test ve build araçlarıyla doğrulandı.

---

**Sprint sonucu:** PUX-0 tamamlandı ve PUX-1 için güvenli başlangıç baseline'ı oluşturuldu.
