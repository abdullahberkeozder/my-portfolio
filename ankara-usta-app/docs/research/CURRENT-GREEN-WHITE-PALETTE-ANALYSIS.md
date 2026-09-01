# Orkestra — Mevcut Yeşil ve Beyazı Koruyan Renk Analizi

Tarih: 25 Ağustos 2026  
Durum: Karar araştırması; uygulamaya alınmadı

## Sabit kabul edilen mevcut kimlik

- Ana yeşil: `#0D7A5F`
- Koyu yeşil/metin: `#0A2B14`
- Ana yüzey: `#FFFFFF`
- Mevcut açık nane yüzeyi: `#E8F6EF`

Mevcut sayfanın güçlü yanı beyazın baskın, yeşilin ise navigasyon, CTA ve dekoratif odak olarak kullanılmasıdır. `#0D7A5F` beyaz üzerinde `5.29:1` kontrast verir ve normal metin için WCAG AA eşiğini geçer. Dolayısıyla ana yeşili değiştirmek için erişilebilirlik veya marka açısından zorunlu bir neden yoktur.

## Mevcut dağılımın güçlü tarafları

1. Beyaz alan fazlalığı, kullanıcı problemle geldiğinde sakin ve anlaşılır bir başlangıç sağlar.
2. Yeşil arama düğmesini, ana CTA'ları ve bağlantıları tutarlı biçimde görünür kılar.
3. Yeşil–beyaz birlikteliği temizlik, tamamlanma ve güven çağrışımlarını aynı anda taşıyabilir.
4. Gerçek iş fotoğrafları eklendiğinde beyaz zemin görüntülerle rekabet etmez.
5. Sihirbaz, teklif karşılaştırma ve yönetim ekranları için ölçeklenebilir bir nötr temel sunar.

## İyileştirme gerektiren alan

Sorun yeşil ve beyazda değil; bunların çevresindeki açık mavi, mor, parlak limon sarısı ve soluk sarı gibi çok sayıdaki yardımcı rengin ortak bir anlam sistemine bağlı olmamasıdır. Bu renkler birlikte kullanıldığında genel teknoloji girişimi hissi güçleniyor ve “yerel ustalık, iş kanıtı, kapsam şeffaflığı” anlatısı zayıflıyor.

Bu nedenle yeni yaklaşım:

- Yeşil ve beyaz oranını korumalı.
- Yardımcı renk sayısını azaltmalı.
- Bakırı ana CTA değil, işçilik ve kanıt vurgusu yapmalı.
- Açık yüzeyleri yalnızca bölüm hiyerarşisi için kullanmalı.
- Durum renklerini marka renklerinden ayrı tutmalı.

## Önerilen genel dağılım

- `%66–72` beyaz
- `%14–18` mevcut yeşil ve koyu yeşil
- `%8–12` açık yardımcı yüzey
- `%2–4` bakır veya mavi vurgu
- `%2–4` sınır, metin ve semantik renkler

Bu dağılımda bakırın küçük görünmesi bir eksiklik değildir. Vurgu rengi az kullanıldığında daha değerli ve daha kolay fark edilir.

## Öneri 1 — Mevcut Yeşil + Sessiz Bakır

En az değişiklikle özgün kimlik kazandıran seçenektir.

- Ana yeşil: `#0D7A5F`
- Koyu yeşil: `#0A2B14`
- Beyaz: `#FFFFFF`
- Açık nane: `#E8F6EF`
- Sessiz bakır: `#A85432`
- Sıcak sınır: `#DED7CE`

Bakır; öncesi–sonrası etiketi, iş günlüğü zaman çizgisi, garanti belgesi işareti ve editoryal başlık ayracında kullanılır. Ana CTA yeşil kalır. Bakır/beyaz kontrastı `5.28:1` olsa da bakır dolgulu CTA kullanımı sınırlı tutulur.

**Duygu:** Tanıdık, sıcak, yerel, kontrollü.  
**Risk:** Bakır fazla kullanılırsa yeşille güç yarışı başlar.  
**Dağılım:** `%70` beyaz, `%16` yeşil, `%9` nane, `%3` bakır, `%2` sınır/metin.

## Öneri 2 — Mevcut Yeşil + Sıcak Kâğıt

Beyazı korur fakat uzun içerik ve hizmet detaylarında çok hafif sıcak yüzeyler ekler.

- Ana yeşil: `#0D7A5F`
- Koyu yeşil: `#0A2B14`
- Beyaz: `#FFFFFF`
- Sıcak kâğıt: `#F6F1E8`
- Koyu toprak/bakır: `#8F5139`
- Taş sınır: `#D8D2C8`

Beyaz; form, modal, kart ve arama alanında korunur. Sıcak kâğıt yalnızca “Nasıl çalışır?”, fiyat/kapsam rehberi ve iş kanıtı gibi editoryal bölümlerde kullanılır. Ana yeşil sıcak kâğıt üzerinde `4.71:1`; koyu bakır beyaz üzerinde `6.17:1` kontrast verir.

**Duygu:** Zanaatkâr, sakin, daha olgun.  
**Risk:** Sıcak yüzey geniş kullanılırsa mevcut ferahlık azalır.  
**Dağılım:** `%64` beyaz, `%17` yeşil, `%13` sıcak kâğıt, `%3` bakır, `%3` sınır/metin.

## Öneri 3 — Mevcut Yeşil + Güven Mavisi

Mevcut açık mavi davranışını tamamen kaldırmak yerine anlamlı bir bilgi rengine dönüştürür; bakır yalnızca zanaat vurgusunda kalır.

- Ana yeşil: `#0D7A5F`
- Koyu yeşil: `#0A2B14`
- Beyaz: `#FFFFFF`
- Açık bilgi mavisi: `#DDEFF5`
- Bilgi mavisi: `#146F93`
- Koyu bakır: `#9C4F30`

Yeşil ana eylemi, mavi sınıflandırma sonucu ve güvenlik bilgisini, bakır işçilik kanıtını temsil eder. Mavi CTA olarak kullanılmaz. `#146F93` beyaz üzerinde `5.64:1`, koyu bakır beyaz üzerinde `5.87:1` kontrast verir.

**Duygu:** Teknik olarak güvenilir, açıklayıcı, hizmet pazaryeri odaklı.  
**Risk:** Mavi geniş kullanılırsa Taskrabbit benzeri genel teknoloji hissi geri gelir.  
**Dağılım:** `%69` beyaz, `%15` yeşil, `%10` açık mavi, `%3` bilgi mavisi, `%2` bakır, `%1` sınır.

## Sonuç

Birinci öneri mevcut tasarımı en az bozarak Orkestra'ya özgü bir imza ekler. İkinci öneri içerik ve zanaat hikâyesini güçlendirir. Üçüncü öneri ise sınıflandırma, risk uyarıları ve süreç ekranlarında en açık semantik ayrımı sağlar.

Ana sayfa için **Öneri 1**, hizmet detayları ve fiyat rehberleri için Öneri 2'nin sıcak kâğıt yüzeyi, bilgi/risk bileşenleri için Öneri 3'ün mavi semantik rengi birlikte kullanılabilir. Ancak ana tasarım sisteminde tek baskın öneri seçilecekse en güvenli tercih Öneri 1'dir.
