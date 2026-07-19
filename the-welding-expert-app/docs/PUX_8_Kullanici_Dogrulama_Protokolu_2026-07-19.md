# PUX-8 Kullanıcı Doğrulama Protokolü

**Proje:** `the-welding-expert-app`  
**Ortam:** Yalnızca yerel release adayı  
**Karar kapsamı:** Görev başarısı, bilişsel yük, güven ve premium algı

## 1. Araştırma sorusu

Müşteri randevu akışını yardım almadan tamamlayabiliyor mu; talebin kesin randevu değil, uygunluk teyidi bekleyen bir istek olduğunu anlayabiliyor mu; arayüzü özenli, güvenilir ve ustalıklı bulurken yapay veya kalabalık algılamıyor mu?

Bu protokol uzman denetiminin yerine gerçek kullanıcı kanıtı koyar. Otomatik test başarısı kullanıcı başarısı olarak raporlanmaz.

## 2. Katılımcı planı

- Ankara'da ev, ofis veya apartman bakım işi yaptırmış ya da yaptırma ihtimali olan `5-8` kişi.
- En az `3` mobil öncelikli kullanıcı.
- En az `2` apartman/site yöneticisi veya karar verici.
- Mümkünse bir `50+` veya dijital güveni düşük katılımcı.
- En az iki katılımcı hizmet kategorisinden emin olmadığı bir senaryoyu tamamlar.

Gerçek ad, telefon, adres veya fotoğraf kullanılmaz. Yerel fixture verisi kullanılır; canlı Supabase'e kayıt gönderilmez.

## 3. Moderasyon kuralları

1. Katılımcıya arayüz anlatılmaz; yalnızca senaryo okunur.
2. Düşünerek konuşması istenir, ancak seçim önerilmez.
3. Beş saniyeyi aşan sessiz tereddüt zaman damgasıyla kaydedilir.
4. İlk doğru eylem, yanlış seçim, geri dönüş, validation ve yardım ayrı sayılır.
5. Görev sonunda SEQ; oturum sonunda kısaltılmış NASA-TLX ve semantic differential soruları uygulanır.
6. Kayıt alınıyorsa katılımcıdan açık onay alınır.

## 4. Görevler

| ID | Senaryo | Başarı koşulu |
| --- | --- | --- |
| T1 | Salon duvarındaki kabarma için uygun bir hizmet ve gelecek uygun saatle talep bırakın. | Doğru hizmet, gün, saat ve iletişim adımları yardımsız tamamlanır. |
| T2 | Metal kapının sorununun kaynak mı otomasyon mu olduğundan emin değilsiniz. Yardım yolunu bulun. | `Birlikte belirleyelim` yolu bulunur; rastgele hizmet seçilmez. |
| T3 | Önce yanlış hizmeti seçin; sonra hizmet adımına dönüp doğru seçimi yapın. | Progress veya `Değiştir` ile veri kaybetmeden geri dönülür. |
| T4 | Fotoğraf göndererek ön değerlendirme isteyin. | WhatsApp kanalı bulunur; bunun randevu olmadığı anlaşılır. |
| T5 | Benzer bir yapılmış iş bulun ve randevuya geri dönün. | İş kanıtı bulunur; ana görev kaybolmaz. |
| T6 | Oluşturulan talebin tarihini değiştirme veya iptal yolunu bulun. | Takip/self-servis yolu bulunur. |
| T7 | Başarı ekranını inceleyip şimdi ne olacağını anlatın. | `Talep alındı`, `teyit bekleniyor` ve sonraki adım doğru açıklanır. |

## 5. Ölçüm sözleşmesi

Ham veriler [PUX-8 sonuç şablonuna](./PUX_8_Kullanici_Test_Sonuclari_Sablonu.csv) kaydedilir.

| Metrik | Hesap | Hedef |
| --- | --- | ---: |
| Kritik görev başarısı | Yardımsız başarılı kritik görev / kritik görev | `>= %90` |
| İlk doğru tıklama | İlk eylemi doğru olan görev / tüm görev | `>= %85` |
| İlk kategori seçimi | Başlangıçtan doğru kategoriye | P75 `< 20 sn` |
| Talep tamamlama | Wizard başlangıcından başarıya | Medyan `< 120 sn` |
| Kritik hata | Veri kaybı, yanlış talep, tamamlayamama | `%0` |
| SEQ | Görev sonu kolaylık, 1-7 | Medyan `>= 5.5` |
| Mental Demand | NASA-TLX alt boyutu, 0-100 | Medyan `<= 35` |
| Teyit beklentisi | Kesin randevu olmadığını doğru söyleyen | `>= %90` |
| Premium algı | Özenli/güvenilir/ustalıklı, 1-7 | Baseline'dan yüksek |
| Negatif algı | Yapay/kalabalık, 1-7 | Baseline'dan düşük |

Sürelerde `n`, medyan ve P75 birlikte raporlanır. Tamamlanmış gözlem sayısı beşten azsa sonuç `yetersiz veri` olarak işaretlenir.

## 6. Analytics doğrulaması

Oturum kaydı ile şu event zinciri karşılaştırılır:

`hero_cta_clicked -> booking_wizard_started -> booking_service_group_selected -> booking_service_changed -> booking_step_completed(step=1) -> booking_slot_selected -> booking_step_completed(step=2) -> booking_submission_started -> booking_submitted -> booking_success_viewed`

- İlk kategori süresi: `public_page_viewed` ile `booking_service_group_selected` arası.
- Zaman seçimi: `booking_wizard_started` ile `booking_slot_selected` arası.
- Toplam tamamlama: `booking_wizard_started` ile `booking_submitted` arası.
- Terk: wizard başlayıp `booking_submitted` olmayan oturum; bot ve test oturumları ayrılır.
- WhatsApp tıklaması iletişim başlangıcıdır; talep veya satış sayılmaz.
- Analytics properties içinde ad, telefon, e-posta, not veya mesaj bulunamaz.

## 7. Bulgu ve karar

| Severity | Tanım | Karar |
| --- | --- | --- |
| P0 | Görev tamamlanamıyor, veri kaybı veya yanlış kayıt riski | RC NO-GO |
| P1 | Kritik görev yardımla tamamlanabiliyor veya teyit yanlış anlaşılıyor | RC NO-GO |
| P2 | Belirgin gecikme, tekrar veya güven kaybı | Risk kaydı ve düzeltme kararı |
| P3 | Küçük sürtünme veya metin iyileştirmesi | Backlog |

Teknik kalite kapısı `npm run pux8:rc` ile çalıştırılır. Teknik kapının geçmesi saha kapısını otomatik olarak geçirmez. Yerel release adayı ancak P0/P1 bulunmadığında ve hedef metrikler yeterli örneklemle sağlandığında `GO` olabilir.
