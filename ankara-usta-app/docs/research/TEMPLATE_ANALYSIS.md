# AI Website Cloner Template — Orkestra Değerlendirmesi

## Depo ne yapıyor?

`JCodesMore/ai-website-cloner-template`, hazır bir site teması değil; bir hedef sayfayı sistematik biçimde incelemek için hazırlanmış Next.js tabanlı bir tersine-mühendislik çalışma akışıdır. Ana değeri ürettiği koddan çok, araştırmayı tekrarlanabilir hale getiren süreçtedir.

## Mimari

- Next.js 16 App Router, React 19 ve strict TypeScript.
- Tailwind CSS v4, shadcn/ui ve Radix temelli bileşen yaklaşımı.
- Lucide başlangıç ikonları; inceleme sırasında özgün/yerel ikonlarla değiştirme beklentisi.
- Araştırma çıktıları için `docs/research`, görsel referanslar için `docs/design-references`, hedefe göre ad alanı ayrılmış bileşen ve varlık klasörleri.
- Lint, tip kontrolü ve üretim derlemesini tek komutta çalıştıran doğrulama yaklaşımı.

## Klonlama iş akışı

1. Masaüstü ve mobil keşif.
2. Renk, yazı, boşluk, kırılma noktası ve etkileşim tokenlarının çıkarılması.
3. Her bileşen için uygulanabilir spesifikasyon yazılması.
4. Temel tasarım sisteminin kurulması.
5. Bileşenlerin küçük parçalarda geliştirilmesi.
6. Sayfa montajı, derleme ve görsel karşılaştırma.

## Güçlü yanları

- “Yaklaşık benzer” yerine ölçülebilir tasarım kararları üretir.
- Etkileşim modelini tıklama, kaydırma, hover ve zaman bazında ayırır.
- Masaüstü ve mobil davranışı ayrı ayrı belgeler.
- Araştırma ile uygulama arasında denetlenebilir bir bileşen spesifikasyonu bırakır.
- Yeni hedeflerin mevcut rotaları ezmesini önleyen ad alanı yaklaşımına sahiptir.

## Riskler ve sınırlar

- Varsayılan “pixel-perfect” ve gerçek varlık indirme yaklaşımı üçüncü taraf marka, telif ve ticari görünüm riskleri doğurur.
- Gerçek metin ve görsellerin alınması Orkestra için doğru değildir; özgün metin, fotoğraf ve marka kullanılmalıdır.
- Çok ajanlı worktree süreci küçük/orta bir MVP için gereğinden ağır olabilir.
- Varsayılan kapsam backend, gerçek kimlik doğrulama ve erişilebilirlik denetimi içermez.
- Depo Node.js 24+ ve Vercel odaklıdır; Orkestra mevcut Vinext/Sites yapısını korumalıdır.

## Entegrasyon kararı

Depoyu proje temeli olarak kopyalamıyoruz. Mevcut Orkestra uygulamasının çalışan Vinext yapısı korunuyor. Depodan şu yöntemler uyarlanıyor:

- Araştırma çıktılarının `docs/research` altında tutulması.
- Tasarım tokenları, sayfa iskeleti, etkileşimler ve bileşenlerin ayrı belgelenmesi.
- Küçük ve yeniden kullanılabilir arayüz parçaları.
- Her değişiklikten sonra üretim derlemesi.

Taskrabbit logosu, metinleri, görselleri, ikonları ve ayırt edici marka varlıkları alınmayacaktır.
