# Umut Usta Metin Denetimi ve Ürün Dili

Tarih: 11 Temmuz 2026

Bu çalışma, mevcut kapsamlı değerlendirme raporu, canlı ürün akışları ve kullanıcı senaryoları üzerinden hazırlanmıştır. Amaç, metni daha gösterişli yapmak değil; müşterinin ne olacağını anlamasını ve işletmenin doğru beklentiyle talep toplamasını sağlamaktır.

## Ürün Sözü

**Müşteri için:** Hizmeti ve tercih edilen zamanı seç, talebini tek kanaldan ilet, ekip teyit etsin.

**İşletme için:** Sistem kaydı olan talepleri görünür, doğru durumla ve yanıltıcı performans yorumu olmadan yönet.

Bu nedenle ürün dili şu ayrımı her ekranda korur:

- **Talep:** Müşterinin seçtiği hizmet, tarih ve saat tercihi.
- **Onaylı randevu:** Ekibin uygunluğu ve detayları teyit ettikten sonra kesinleşen kayıt.
- **İptal/değişiklik isteği:** Müşterinin ekibe ilettiği, otomatik uygulanmayan değişiklik.

## Product Owner İncelemesi

### Hedefler

1. Web, WhatsApp ve telefon akışları arasında yanlış söz vermeden dönüşümü artırmak.
2. Operatörün önce hangi talebe döneceğini anlamasını kolaylaştırmak.
3. Dashboard sayılarının kapsamını açık tutmak; sistemde olmayan WhatsApp konuşmalarını veri gibi göstermemek.
4. Fiyat ve süre metinlerinde keşif gerektiren işleri kesin vaat gibi sunmamak.

### Riskler ve Kararlar

| Risk | Etki | Metin kararı |
| --- | --- | --- |
| “Randevu al” ifadesi seçilen saati kesinleşmiş gösterir | İptal, güven kaybı, operasyon baskısı | “Uygun zamanı seç”, “talep gönder”, “ekip teyit eder” dili |
| “Teklif al” CTA’sı fotoğraftan kesin fiyat beklentisi yaratır | Fiyat uyuşmazlığı | “Ön değerlendirme iste” dili |
| WhatsApp verisi dashboard’a otomatik girmiyor | Yanlış kanal/performans yorumu | Sistem kayıtlarının kapsamını açıklayan yardımcı metin |
| Değişiklik formu müşterinin tarihini otomatik güncelleyecekmiş gibi algılanabilir | Çakışma ve destek talebi | “Tercih ettiğiniz yeni zaman, uygunluk kontrolünden sonra teyit edilir” |

## Müşteri Senaryoları

### Canan, 32: Hızlı karar vermek istiyor

İhtiyacı: “İşimi anlatayım, uygun zamanı seçeyim; sonra ne olacağını bileyim.”

Uygulanan dil: WhatsApp CTA’sı “Fotoğraf gönder, ön değerlendirme iste”; sistem formu CTA’sı “Talebi kaydet”; başarı ekranı seçilen zamanın **talep** olduğunu ve ekibin teyit edeceğini anlatır.

### Mehmet, 58: Güvence arıyor

İhtiyacı: “Karşıma gerçek bir hizmet süreci çıksın; arayabileceğim biri olsun.”

Uygulanan dil: Telefon numarasının neden istendiği açıkça belirtilir, çalışma saatleri içinde geri dönüş beklentisi yazılır, takip ekranındaki iptal/değişiklik akışı otomatik işlem gibi sunulmaz.

### Selin, 44: Site yöneticisi

İhtiyacı: “Keşif ve teklif süreci açık olsun; fiyatın fotoğrafa bakıp kesinleşmediğini anlayayım.”

Uygulanan dil: Yerinde keşif hizmeti “ön inceleme” ve “yazılı teklif” ile anlatılır; fiyat CTA’sı “ön değerlendirme” olarak konumlanır.

## Metin İlkeleri

1. Kullanıcının gördüğü eylemi adlandır: “Talebi kaydet”, “Değişiklik isteğini gönder”.
2. Sonucu ve sıradaki adımı aynı yerde belirt: “Ekip uygunluğu teyit eder.”
3. Kesin olmayan süre/fiyat için bağlam ekle: “çalışma saatlerinde”, “keşif sonrasında”.
4. Yönetim ekranlarında metrik kapsamını açıkla: “sistem kaydı olan”, “web üzerindeki davranış”.
5. Yardım metnini yalnızca karar noktasında göster; pazarlama açıklamasıyla formu ağırlaştırma.

## Araştırma Dayanağı

- [GOV.UK: Designing good services](https://www.gov.uk/service-manual/design/introduction-designing-government-services): kullanıcıdan ne beklendiğinin ve karşılığında ne alacağının açık olması gerekir.
- [GOV.UK: Scope a transaction around the user journey](https://www.gov.uk/service-manual/design/scoping-your-service): işlemi kurum yapısına göre değil, kullanıcının tamamlamak istediği göreve göre kurgulamak gerekir.
- [Baymard: Form design](https://baymard.com/learn/form-design): kalıcı alan etiketleri ve alanın neden istendiğini açıklayan yardımcı metinler belirsizliği azaltır.
- [GOV.UK: Learn user needs](https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs): kullanıcı ihtiyaçları ile ürün hikâyeleri arasında izlenebilir bağ kurulmalıdır.

## Sonraki Doğrulama

- Randevu başlangıcı -> talep gönderimi oranı
- WhatsApp CTA tıklaması -> sistem talebi oranı
- Takip ekranında değişiklik/iptal isteği tamamlama oranı
- “Seçili saat kesin mi?” veya “ne zaman aranacağım?” temalı destek mesajları
- Dashboard kullanıcılarının WhatsApp verisi kapsamı hakkında geri bildirimi
