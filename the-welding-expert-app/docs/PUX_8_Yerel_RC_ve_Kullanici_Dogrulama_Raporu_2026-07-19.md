# PUX-8 Yerel RC ve Kullanıcı Doğrulama Raporu

**Proje:** `the-welding-expert-app`  
**Tarih:** 19 Temmuz 2026  
**Ortam:** Yalnızca yerel geliştirme  
**Teknik RC:** Hazır  
**Saha doğrulaması:** Ölçüm bekliyor  
**Canlı/veri etkisi:** Yok

## 1. Sprint sonucu

PUX-8'in teknik hazırlık bölümü tamamlandı. Randevu akışının görev, erişilebilirlik, responsive davranış, görsel kararlılık, performans ve analytics sözleşmeleri yerel release-candidate kapısına bağlandı. Gerçek kullanıcı başarı oranı, SEQ, NASA-TLX veya premium algı sonuçları sentetik testlerden türetilmedi.

Bu nedenle karar iki parçalıdır:

- **Teknik GO:** Uygulama kontrollü kullanıcı testine hazır.
- **Saha PENDING:** 5-8 gerçek katılımcı sonucu olmadan production/release GO kararı verilemez.

## 2. Üretilen çıktılar

| Çıktı | Sonuç |
| --- | --- |
| Kullanıcı testi protokolü | 7 görev, moderasyon kuralları, başarı ölçütleri ve severity modeli hazırlandı. |
| Ham sonuç şablonu | Katılımcı, süre, hata, SEQ, NASA-TLX ve premium semantic differential alanları CSV olarak hazırlandı. |
| Analytics sözleşmesi | Wizard başlangıcı, hizmet seçimi, adım tamamlama, zaman seçimi ve gönderim olayları regresyon testine bağlandı. |
| RC komutu | `npm run pux8:rc` eklendi. |
| Görsel kanıt | İletişim özeti yerleşimi için mobil ve masaüstü referansları güncellendi. |

İlgili belgeler:

- [PUX-8 Kullanıcı Doğrulama Protokolü](./PUX_8_Kullanici_Dogrulama_Protokolu_2026-07-19.md)
- [PUX-8 Kullanıcı Testi Sonuç Şablonu](./PUX_8_Kullanici_Test_Sonuclari_Sablonu.csv)
- [PUX-8 Öncesi Wizard Denetimi](./PUX_8_Oncesi_Randevu_Wizard_Premium_UX_Denetim_Raporu_2026-07-19.md)

## 3. Teknik kalite kapısı

`npm run pux8:rc` tek ve kesintisiz koşuda tamamlandı.

| Kapı | Sonuç |
| --- | ---: |
| ESLint | Geçti, `0` hata |
| Unit/component | `24` dosya, `93/93` test |
| Analytics odaklı test | `17/17` test |
| Production build | Geçti, `805` modül |
| Müşteri booking chunk | `107.92 kB`, gzip `26.60 kB` |
| Performans bütçesi | Geçti |
| Playwright E2E | `56/56` senaryo |
| Responsive matris | `320` ile `1920 px` arası geçti |
| Erişilebilirlik | Klavye, reduced motion, forced colors ve sanal klavye geçti |
| Görsel regresyon | Hizmet, zaman, iletişim, başarı ve tracking durumları geçti |

Testte beklenen geçersiz takip kaydı hatasının stderr'e yazılması kontrollü negatif senaryodur; test sonucu başarısız değildir.

## 4. Ölçüm sözleşmesi

Saha oturumlarında aşağıdaki eşikler kullanılacaktır:

| Metrik | GO eşiği |
| --- | ---: |
| Kritik görev başarısı | `>= %90` |
| İlk doğru tıklama | `>= %85` |
| İlk kategori seçimi | P75 `< 20 sn` |
| Talep tamamlama | Medyan `< 120 sn` |
| Kritik hata | `%0` |
| SEQ kolaylık | Medyan `>= 5.5 / 7` |
| NASA-TLX Mental Demand | Medyan `<= 35 / 100` |
| Teyit beklentisini doğru anlama | `>= %90` |

Premium değerlendirme `özenli`, `güvenilir`, `ustalıklı`, `yapay` ve `kalabalık` boyutlarında 1-7 ölçeğiyle kaydedilecektir. Beşten az tamamlanmış gözlem istatistiksel karar için `yetersiz veri` sayılacaktır.

## 5. Açık karar kapısı

Gerçek kullanıcı oturumu yapılmadığı için aşağıdaki değerler henüz bilinmiyor:

- Görev başarı oranı ve ilk doğru tıklama,
- Hizmet kategorisi seçme P75 süresi,
- Toplam tamamlama medyanı,
- SEQ ve NASA-TLX sonuçları,
- Premium ve yerel samimiyet algısı,
- Kullanıcının talebin kesin randevu olmadığını doğru anlama oranı.

Bir P0 veya P1 bulgu RC kararını `NO-GO` yapar. P2 bulgular risk ve düzeltme kararıyla, P3 bulgular backlog ile yönetilir.

## 6. Yerel çalışma beyanı

Bu sprintte Supabase migration veya SQL değişikliği gerekmedi. Production verisi yazılmadı; Git commit/push ve canlıya alma yapılmadı. Bütün testler yerel uygulama ve mock servislerle yürütüldü.
