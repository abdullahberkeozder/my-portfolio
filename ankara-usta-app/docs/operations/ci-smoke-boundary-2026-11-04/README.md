# CI smoke sınırı ve açık UX bulguları

Tarih: 4 Kasım 2026. Bu not, taslak [PR #19](https://github.com/abdullahberkeozder/my-portfolio/pull/19) için hazırlanan küçük CI düzeltmesinin neyi doğruladığını ve neyi doğrulamadığını kaydeder.

## Neden ayrı smoke komutu?

PR #19'un önceki push ve pull request kalite işlerinde repository, UI debt, lint, TypeScript, birim/bileşen testleri, üretim derlemesi ve .NET sözleşmeleri geçti. Son adım `End-to-end smoke test` adı altında bütün `npm run test:e2e` paketini başlatıyor, kimlik bilgisi bulunmayan PR ortamında 20 dakikalık iş sınırında iptal oluyordu. Bu adın gerçek kapsamla uyumsuzluğu CI sonucunu belirsiz kılıyordu.

`test:e2e:ci-smoke`, ana sayfanın başlık, arama alanı ve birincil eyleminin görünürlüğünü ve mevcut *bilinmeyen hizmetten toparlanma* testini `@ci-smoke` etiketiyle Chromium ve mobil Chromium'da çalıştırır. İkinci test, arama girişini, bilinmeyen sorgunun rastgele wizard açmamasını, kategoriye geri dönüşü ve klavye ile kategori açmayı kapsar. Yerel, secretsiz üretim derlemesinde **4/4 geçti**. Tam `test:e2e` komutu ve yapılandırılmış entegrasyon testleri korunur.

## Smoke dışında kalan doğrulanmış sorunlar

| Bulgu | Yerel kanıt | Gereken çalışma |
| --- | --- | --- |
| 320 px arama alanı dar | `home-discovery.spec.ts` genişlik beklentisi `>250 px`, gözlenen yaklaşık `130 px` | Landing arama bileşeninin 320 px düzeni ayrıca düzeltilip test yeniden çalıştırılmalı. |
| Kritik ARIA alt öğe ilişkisi | `accessibility.spec.ts` 320 px koşusunda `aria-required-children` ihlali; pilot kartındaki başlık ve bağlantılar ilgili rolün doğrudan çocukları olarak raporlandı | İşaretleme semantiği ve axe sonucu ayrı erişilebilirlik diliminde düzeltilmeli. |
| Mobil destek yüzeyi çerez eylemini örtüyor | `home.spec.ts` mobil koşusunda kayan destek kapsülü `Reddet` butonuna tıklamayı engelledi | Destek kapsülünün konumu/katman sırası ve çerez kontrolü birlikte görsel QA ile düzeltilmeli. |

Bu sorunlar PR #19'un dört dosyalık test altyapısı değişikliğiyle ortaya çıkarılmış veya bu dalda giderilmiş olarak gösterilmez. CI smoke'un yeşil olması tam E2E paketinin, erişilebilirliğin veya 320 px yerleşimin sağlıklı olduğu anlamına gelmez. Özellikle mevcut genişlik testini silmek veya beklentisini düşürmek bu teslimin parçası değildir.

## Ortak çalışma ve doğrulama

Gemini 3.8 Flash High dar smoke ayrımını değerlendirdi ve üç dosyalık ilk uygulamayı yaptı. Son incelemesinde yalnız toparlanma senaryosunun ana sayfa açılışını kanıtlamadığını belirtti. Gemini'nin önerdiği kısa açılış testini Codex mevcut PR #19 başlığına uyarladı; ilk koşudaki yanlış başlık beklentisi hata çıktısıyla düzeltilip Playwright yeniden çalıştırıldı: **4/4 geçti**. Codex değişen dosyaları, JSON söz dizimini ve `git diff --check` sonucunu inceledi. Commit/push veya PR birleştirmesi bu kanıt notu hazırlanırken yapılmadı.
