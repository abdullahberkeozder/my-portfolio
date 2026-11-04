# Editorial landing ve wizard: izole entegrasyon kanıtı

Tarih: 4 Kasım 2026
Dal: `codex/editorial-landing-ci-integration`
Temel commit: `d41288e` (`codex/worktree-preservation`)

## Kapsam

Mevcut landing kompozisyonu, keşif detayı, wizard görsel dili, bunların tarayıcı sözleşmeleri ve iki gerekli WebP varlığı ayrı bir worktree'ye taşındı. Eski durum rozeti beklentileri iki bileşen testinde güncel merkezi sözlükle hizalandı. Kaynak çalışma ağacındaki başka harita, rozet, migration ve hesap değişiklikleri bu dala alınmadı.

Yerel `.env.local` ve `node_modules` bağlantısı Git tarafından yok sayılır; entegrasyon teslimine dahil değildir. `.env.e2e.local` bu worktree'ye taşınmadı.

## Gemini High ile ortak inceleme

- İlk risk değerlendirmesinde Gemini, `origin/main` temelini önerdi. Codex, `origin/main` ile mevcut `d41288e` arasında yedi commit ve 442 dosyalık fark olduğunu gösterdi. Bu kanıtla Gemini, küçük ve denetlenebilir bir değişiklik için mevcut commit üzerine yığılmış dalı uygun buldu.
- Gemini, landing'deki tek statik inline SVG stilini CSS sınıfına taşıyan dar kapsamlı düzeltmeyi önerdi. İzole dalda uygulandı; `ui-debt:check` 53/53 inline stil sınırına indi.
- Gemini, 743 testten altısının eski metin ve ton beklentilerinden kaynaklandığı incelemesinde iki test dosyasını güncel ürün sözlüğüyle hizalamayı önerdi. Ürün metinleri değiştirilmedi.
- Dosya okuması isteyen uzun bir Gemini incelemesi zaman aşımına uğradı; bu deneme bağımsız görüş olarak sayılmadı.

## Yerel doğrulama

| Kapı | Sonuç |
| --- | --- |
| Üretim derlemesi | Geçti |
| TypeScript | Geçti |
| Hedefli ESLint | Geçti |
| Stil giriş noktaları | Geçti |
| UI debt | Geçti: 7859/7899 CSS satırı, 380/380 `!important`, 67/67 medya sorgusu, 53/53 inline stil |
| `git diff --check` | Geçti |
| Vitest | 113 dosya, **743/743 test geçti**; Windows geçici dosya yarışını önlemek için tek işçi ve worktree içi geçici klasör kullanıldı |
| Playwright landing + wizard | Masaüstü ve mobil Chromium'da **20/20 geçti**; wizard 320, 390, 820 ve 1440 px genişliklerinde doğrulandı |

İlk Playwright denemesinde izole worktree'de `.env.local` bulunmadığı için taslak doğrulaması formu güvenli biçimde açmadı. Git tarafından yok sayılan yerel yapılandırma eklenip üretim derlemesi yenilendiğinde aynı akış geçti. Sandbox içinden `localhost` erişimi engellendiği için tarayıcı koşusu yetkili yerel oturumda çalıştırıldı.

## Görsel kanıt

Görüntüler izole dalın üretim derlemesinden alındı. Landing çekimlerinde çerez tercihi kapatıldı ve alt kartların fotoğrafları kaydırılarak yüklendi.

| Yüzey | Görüntü |
| --- | --- |
| Landing, 1440 px | [Masaüstü](screenshots/landing-desktop-1440.png) |
| Landing, 390 px | [Mobil](screenshots/landing-mobile-390.png) |
| Wizard özeti, 1440 px | [Masaüstü](screenshots/wizard-summary-desktop-1440.png) |
| Wizard özeti, 390 px | [Mobil](screenshots/wizard-summary-mobile-390.png) |

Görsel denetimde landing görselleri ve wizard özeti yüklenmiş durumda; mobil kartlar tek sütunda, masaüstü keşif alanı asimetrik ızgarada. Bu kayıt, estetik karar için ayrıca yapılacak ürün değerlendirmesinin yerini almaz.

## Birleştirme sırası

Bu dal için karşılaştırma tabanı `codex/worktree-preservation` olmalıdır. Önce taban dalın `main` ile entegrasyonu incelenmeli, ardından bu dalın hedefi güncellenmelidir. Şu anda commit, push, PR veya veritabanı değişikliği yapılmadı.
