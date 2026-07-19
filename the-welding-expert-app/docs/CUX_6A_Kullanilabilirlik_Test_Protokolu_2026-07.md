# CUX-6A Kullanılabilirlik Test Protokolü

## Amaç ve karar

Yeni müşteri akışının görev başarısını, karar süresini ve algılanan bilişsel yükünü ölçmek. Bu belge saha sonucu değildir; 6-8 gerçek katılımcıyla uygulanacak moderasyon ve kayıt sözleşmesidir. Kritik görev başarısı yüzde 90'ın altındaysa veya P0 bulgu varsa yerel release NO-GO olur.

## Örneklem

- 2 hızlı mobil kullanıcı.
- 2 güven ve telefon odaklı, mümkünse 50+ kullanıcı.
- 1 apartman veya iş yeri karar vericisi.
- 1 düşük dijital yetkinlik kullanıcısı.
- Mümkünse klavye veya büyütme kullanan 1 katılımcı.

Katılımcıya gerçek ad, telefon veya adres kullandırılmaz. Test verisi yerel fixture değerleridir. Canlı Supabase kullanılmaz.

## Görevler

1. Boya işi için yarın öğleden sonra takip edilebilir talep bırakın.
2. Türünü bilmediğiniz kapı sorununu fotoğrafla danışacağınız yolu bulun.
3. Telefon numarası ile hizmet bölgesini bulun.
4. Birden fazla iş için yerinde keşif talebi başlatın.
5. Yanlış iş türünü seçip geri dönün, doğru hizmete geçin.
6. Oluşturulmuş talebin tarihini değiştirme yolunu bulun.

Kolaylaştırıcı yön tarif etmez. Beş saniyeyi aşan sessiz tereddüt, yanlış seçim, geri dönüş, validation hatası ve yardım talebi zaman damgasıyla kaydedilir.

## Her görevde kaydedilecekler

| Alan | Ölçüm |
| --- | --- |
| Sonuç | Tek başına / yardımla / başarısız |
| İlk anlamlı seçim | Başlangıçtan ilk doğru grup veya kanala kadar saniye |
| Toplam süre | Başlangıçtan görev sonuna kadar saniye |
| Hata | Yanlış seçim, geri dönüş, validation ve yardım sayısı |
| SEQ | 1 çok zor, 7 çok kolay |
| NASA-TLX alt boyutları | Mental Demand, Effort, Frustration; 0-100 |
| Nitel kanıt | Söylenen ifade, gözlenen tereddüt, beklenen sonuç |

## Sonuç tablosu

| Katılımcı | Segment | Cihaz | Görev | Sonuç | İlk seçim sn | Toplam sn | Hata | Yardım | SEQ | Mental | Effort | Frustration |
| --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| P01 |  |  |  |  |  |  |  |  |  |  |  |  |

Her süre için n, medyan ve P75 raporlanır. Ortalama tek başına kullanılmaz. Beşten az tamamlanmış gözlem “yetersiz veri” olarak gösterilir.

## Bulgu şablonu

| ID | Severity | Senaryo | Kanıt | Etki | Öneri | Sprint | Durum |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UX-001 | P0-P3 |  |  |  |  |  | Açık |

- P0: Görev tamamlanamıyor, yanlış kayıt veya veri kaybı riski.
- P1: Kritik görev ciddi yardımla tamamlanıyor.
- P2: Belirgin gecikme, tekrar veya güven kaybı.
- P3: Küçük sürtünme veya metin iyileştirmesi.

## Mevcut durum

Protokol ve ölçüm altyapısı hazırdır. Gerçek katılımcı oturumu henüz yapılmadığı için SEQ/NASA-TLX baseline, yüzde 90 başarı hedefi ve saha GO kararı **ölçülmedi**. Bu değerler sentetik testlerden türetilmeyecek ve dönüşüm artışı iddia edilmeyecektir.
