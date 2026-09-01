# Talep Sihirbazı ve Anasayfa Arama Yönlendirmesi

## Araştırma özeti

### Mevcut Umut Usta'dan alınacak ilkeler

Mevcut uygulama hizmetleri önce anlaşılır gruplara, sonra gerçek hizmetlere indiriyor; “Birlikte belirleyelim” kaçış yolu sunuyor. Seçim, zaman ve iletişim şeklindeki üç ana adımda tek karar odağı kullanıyor. Geri dönüşte verileri koruyor, seçilen hizmeti sonraki adımlarda görünür tutuyor, başlık odağı/scroll davranışı ve adım analitiği sağlıyor.

Yeni pazaryerinde korunacaklar:

- Tek ekranda tek ana karar
- İlerleme göstergesi ve geriye dönüş
- Yanıtların kaybolmaması
- Seçim özetinin sürekli görünmesi
- “Bilmiyorum” ve “Birlikte belirleyelim” seçenekleri
- Klavye, ekran okuyucu, dokunma alanı ve azaltılmış hareket desteği
- Adım başlangıç/tamamlama ve hata analitiği

Değişecekler:

- Hizmet seçimi yalnızca kartlardan değil, anasayfadaki sorun metninden de başlayacak.
- Her hizmet kendi soru ağacına sahip olacak.
- Zaman seçimi teklifli işlerde ilk adım olmayacak; önce kapsam tamamlanacak.
- Paket, teklif ve keşif akışları farklı sonlanacak.
- Konum tam adres yerine önce ilçe/mahalle düzeyinde alınacak.

### Rakiplerden gözlenen desenler

- Armut hizmete göre kısa ve fiyatı etkileyen sorular soruyor; teklifleri standartlaştırılmış talep üzerinden topluyor. TV montajında aparatın dahil olup olmayacağı ve ekran ölçüsü; boya işinde m², oda sayısı, malzeme, eşya ve tavan; demir kapıda ihtiyaç türü, adet ve kapı tipi öne çıkıyor.
- Mobilya montajında ürün türü, adet/kutu, ölçü, söküm ve duvara sabitleme; avizede adet ve eski avize sökümü fiyatı etkileyen temel girdiler.
- Armut genel akışında hizmete özel sorular, teklif alma, yorum/fiyat karşılaştırma ve seçim var.
- Ustabilir konum ve kategoriyle usta listeliyor; profil, referans işi, puan/yorum ve sertifika bilgilerini güven sinyali olarak kullanıyor.
- Sahibinden katalog/arama yaklaşımında konum, kategori, profil doluluğu, yorum ve yanıt performansı önemli.

Kaynaklar:

- [Armut nasıl çalışır](https://info.armut.com/nasil-calisir)
- [Armut TV montajı talep ve fiyat etkenleri](https://armut.com/fiyatlari/televizyon-duvara-montaj_441)
- [Armut boya badana talep alanları](https://armut.com/fiyatlari/boyaci-boya-badana-ustasi_32)
- [Armut mobilya montaj kapsamı](https://armut.com/fiyatlari/mobilya-montaj_222)
- [Armut demir kapı talep alanları](https://armut.com/fiyatlari/demir-kapi_543)
- [Ustabilir usta üyelik modeli](https://www.ustabilir.com/usta/uyelik-durumu)
- [Sahibinden Ustalar ve Hizmetler modeli](https://yardim.sahibinden.com/hc/tr/articles/28942096865564-Ustalar-ve-Hizmetler-Ma%C4%9Fazas%C4%B1-Nedir-Nas%C4%B1l-Hesap-A%C3%A7abilirim)

Rakip soruları kopyalanmamalıdır. Fiyatı ve uygun ustayı gerçekten etkileyen veri noktaları kendi kapsam modelimize göre yeniden yazılmalıdır.

## Birleşik giriş mimarisi

Sihirbaz iki giriş yolunu aynı talep taslağında birleştirir:

```text
Anasayfa sorun metni ─┐
                     ├─> sınıflandırma → aday hizmet → eksik sorular
Kategori kartları ───┘
```

Kategori yolundan giren kullanıcıya problem metni yine sorulur; aramadan giren kullanıcıya metinde zaten açık olan sorular tekrar sorulmaz.

## Anasayfa arama akışı

1. Kullanıcı en az 8 karakterlik sorun cümlesi yazar.
2. Metin normalize edilir; yazım varyasyonları, Ankara ilçe/mahalleleri, aciliyet, adet/ölçü ve hizmet sinyalleri çıkarılır.
3. En fazla 3 hizmet adayı puanlanır.
4. Risk bayrakları hizmet seçiminden önce değerlendirilir.
5. Sonuç güvenine göre yönlendirme yapılır.

### Güven eşikleri

- `>= 0.80`: Hizmeti öner, kullanıcıya tek dokunuşla onaylat ve ilgili ağaca gir.
- `0.55–0.79`: En fazla 3 olası hizmeti kısa gerekçeleriyle göster.
- `< 0.55`: Ana kategori seçimi veya “Birlikte belirleyelim” akışı.
- Kritik risk: Güven eşiğinden bağımsız önce güvenlik uyarısı, sonra güvenliyse talebe devam.

Sistem “Sorununuz kesin olarak su kaçağıdır” demez; “Bu ihtiyaç en çok su kaçağı tespitine benziyor” der.

### Arama çıktısı sözleşmesi

```json
{
  "raw_text": "Banyodan alt kata su akıyor",
  "candidates": [
    {
      "service_key": "water_leak_diagnosis",
      "confidence": 0.91,
      "matched_signals": ["alt kata su", "banyo"]
    }
  ],
  "extracted": {
    "space": "bathroom",
    "impact": "lower_floor"
  },
  "risk_flags": ["active_water_damage"],
  "missing_question_keys": ["leak_active", "water_source_guess"]
}
```

`matched_signals` kullanıcıya teknik olmayan gerekçe göstermek ve yönlendirmeyi denetlemek için saklanır. Serbest metin, yapılandırılmış yanıtlara dönüştürüldükten sonra silinmez.

## Ortak sihirbaz omurgası

### 0. Giriş

- Sorun metni veya kategori/hizmet seçimi
- Sınıflandırma onayı
- Güvenlik uyarısı gerekiyorsa gösterim

### 1. İhtiyacın kapsamı

- Hizmete özgü dallanan sorular
- “Bilmiyorum” her teknik soruda geçerli seçenek
- Önce yüksek bilgi değerli sorular: iş türü, adet/ölçü, mevcut durum, malzeme

### 2. Görsel kanıt

- Hangi açıların gerektiğini gösteren örnek/çekim rehberi
- Dosya yerine kameradan çekim ve galeriden seçme
- Fotoğrafsız devam gerekçesi; yalnızca zorunlu hizmetlerde engel
- Video yalnızca hareket/ses/aralıklı arıza için

### 3. Konum ve erişim

- İlçe ve mahalle
- Mekân türü: ev, apartman ortak alanı, site, ofis, dükkân
- Kat, asansör, otopark/yükleme ve çalışma izni gibi yalnızca ilgili sorular
- Tam adres, usta seçildikten veya paket randevusu kesinleştikten sonra

### 4. Zaman ve aciliyet

- Esnek, belirli tarih aralığı, aynı gün
- “Acil” seçimi güvenlik servisi vaadi değildir
- Paket işte gerçek slot; teklifli işte işe başlama tercihi; keşifte keşif slotu

### 5. Kapsam özeti

- Kullanıcının problem cümlesi
- Önerilen hizmet ve sunum modeli
- Dahil/hariç standart kapsam
- Yanıtlar ve medya
- Ustanın teklifinde ayrıca fiyatlandırması gerekenler
- Düzenle bağlantıları

### 6. Hesap/iletişim

- Telefon doğrulama
- Ad; e-posta isteğe bağlı
- Açık rıza ve iletişim tercihleri ayrı

### 7. Akışa göre sonuç

- Paket: Uygun usta/slot ve fiyat kapsamı → rezervasyon
- Teklif: Uygun ustalara dağıtım → en fazla 3 teklif
- Keşif: Keşif koşulu ve bedeli → keşif randevusu/teklifi

## Soru tasarım kuralları

- Ekran başına varsayılan olarak bir soru; kolay ilişkili alanlarda en fazla üç kısa alan.
- Kullanıcının metninden kesin çıkarılmış bilgi tekrar sorulmaz, özet olarak onaylatılır.
- Teknik jargon yerine müşteri dili; gerekiyorsa görselli seçenek.
- “Diğer” seçeneği açıklama alanı açar; serbest açıklama tüm dalların sonunda isteğe bağlıdır.
- Bir yanıt sonraki soruyu gereksiz kılıyorsa dal atlanır.
- Fiyatı, güvenliği, usta uzmanlığını veya ekipmanı değiştirmeyen soru MVP'de sorulmaz.
- Zorunluluk gerekçesi alanın yanında açıklanır.
- Yanıtlar ileri/geri hareket ederken korunur; hizmet değişirse uyumsuz yanıtlar silinmeden taslakta pasiflenir.
- Kullanıcı son özette her bölümü düzenleyebilir.

## “Birlikte belirleyelim” akışı

Hizmet bulunamadığında genel uzun form açılmaz. Şu kısa ayrıştırma yapılır:

1. Sorun nerede? Elektrik, su, duvar/yüzey, mobilya/montaj, metal/kapı, emin değilim.
2. Yeni yapım/montaj mı, arıza/tamir mi?
3. Ne görüyorsunuz? Kontrollü belirtiler + diğer.
4. Fotoğraf/video ekleyebilir misiniz?
5. İlçe/mahalle ve zaman tercihi.

Yüksek güven oluşursa ilgili ağaca geçilir; oluşmazsa talep moderasyon kuyruğuna `unclassified` olarak gider.

## Analitik olayları

- `home_problem_search_started`
- `home_problem_search_submitted`
- `classification_result_shown`
- `classification_candidate_selected`
- `classification_corrected`
- `safety_warning_shown`
- `wizard_started`
- `wizard_question_answered` (serbest metin/kişisel veri gönderilmez)
- `wizard_branch_entered`
- `wizard_step_completed`
- `wizard_back_clicked`
- `wizard_summary_edited`
- `request_submitted`
- `classification_outcome_confirmed` (iş sonunda gerçek hizmetle karşılaştırma)

## Başarı ve kalite ölçütleri

- Arama yapanların sihirbaza geçiş oranı
- İlk önerinin kullanıcı tarafından onaylanma/düzeltilme oranı
- Hizmet başına soru ve tamamlanma süresi
- Soru bazlı terk oranı
- “Bilmiyorum” ve moderasyona düşme oranı
- Ustaların “talep yeterince açıklayıcı” değerlendirmesi
- Teklif sonrası kapsam değişiklik oranı
- İlk sınıflandırma ile tamamlanan gerçek hizmet uyumu

