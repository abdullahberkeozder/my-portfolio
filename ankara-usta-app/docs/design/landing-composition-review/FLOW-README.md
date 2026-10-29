# Keşiften talebe geçiş prototipi

Amaç: Fotoğraftan talebe geçerken hizmet ve ilham referansını görünür tutmak. Üretim RequestWizard değiştirilmez; prototip yalnız giriş sözleşmesini gösterir.

| Önce | Sonra | Neden |
|---|---|---|
| İş detayında genel açıklama | İşe bağlı görsel, seçili hizmet ve kapsam uyarısı | Görselin neyi temsil ettiğini anlatmak |
| Kaydetme ve kapatmayla biten detay | Benzerini yaptır eylemi | Keşifle talep arasındaki bağı kurmak |
| Referans aktarımı belirsiz | Çıkarılabilir ilham referansı | Kullanıcı kontrolü ve dürüst kapsam |
| Usta adı hedef gibi algılanabilir | targetProfessionalId null | Temsili kişiye gerçek talep göndermemek |

## Üretim sözleşmesi boşluğu

RequestWizard Props: service, onClose, remoteDraft, targetProfessional, initialDistrict. LocalDraft ilham referansı içermiyor. Dolayısıyla bu prototip gerçek entegrasyon değildir. Sonraki uygulama diliminde referansın saklanması, doğrulanması, taslak geri dönüşü ve görsel yetkileri ayrıca tasarlanmalı.

Prototip aktarımı: serviceId, referenceWorkId, referenceKind=inspiration, targetProfessionalId=null, answers. Bu nesne API'ye gönderilmez. Gerçek entegrasyonda istemciden gelen referans ve hizmet ilişkisi sunucuda doğrulanmalı. Fotoğraf kullanıcı yüklemesi veya tamamlanmış iş kanıtı olarak sayılmamalı.

## Kabul senaryoları

1. Bir iş açıldığında doğru görsel ve hizmet görünür.
2. Benzerini yaptır seçili hizmeti taşır; gerçek talep göndermez.
3. Referans kaldırılınca aktarımda da kaybolur.
4. Hizmet değişince ilgisiz referans ve yanıtlar temizlenir, nedeni açıklanır.
5. Aynı işte geri dönüş yanıtı ve referans kararını korur.
6. Başka iş açılırsa önceki işin yanıtları sızmaz.
7. Kaydetme eylemi talep başlatmaz.
8. Escape ve kapatma erişilebilir odak dönüşüyle çalışır (gerçek tarayıcı doğrulaması gerekir).
9. Filtre ve sayfa konumu modal akışında sıfırlanmaz.
10. Diğer hizmetlerde uydurma soru/süre/fiyat gösterilmez.

Kodlama: Gemini High. İnceleme ve kontrollü uygulama: Codex. Yeni arayüzün görsel doğrulaması bu dosyada ayrıca kaydedilmeden tamamlandı sayılmaz.
