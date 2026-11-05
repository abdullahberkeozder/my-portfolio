# Parola Yenileme Yüzeyi — Nötr/Yeşil Kontrol Dili

## Amaç

`/parola-yenile` akışını giriş/kayıt yüzeyiyle aynı sakin ve güven veren hesap diliyle hizalamak. Bu dilim yalnızca parola yenileme yüzeyini kapsar; yeni kimlik doğrulama davranışı veya Supabase sözleşmesi eklemez.

## Uygulanan kararlar

- Kart köşesi `16px`, kontrol ve birincil eylem köşesi `8px` ile auth yüzeyindeki geometrik ritme hizalandı.
- Sıfırlama doğrulama durumu için nötr-yeşil bir bilgi yüzeyi tanımlandı; hata ve başarı yüzeyleri mevcut semantik renklerini korudu.
- Geri dön, parola görünürlüğü, footer bağlantısı ve birincil eylem için görünür `:focus-visible` halkası eklendi.
- Hata mesajı artık iki parola alanına `aria-describedby` ile bağlı; hata durumunda alanlar `aria-invalid` bildiriyor ve odak ilk parola alanına geri dönüyor.
- Uyarı emojisi kaldırıldı. Kararlı, küçük `!` / `✓` piktogramları farklı işletim sistemi emojilerine bağlı olmayan bir görünüm sağlıyor.

## QA sözleşmesi

- Component: `tests/component/PasswordUpdatePage.test.tsx` — recovery oturumu, token temizliği, eşleşmeyen parola hatası, başarı durumu ve unsubscribe.
- Browser: `tests/e2e/password-recovery-surface.spec.ts` — 390px ve 1440px invalid recovery yüzeyi, consent kapatma, kart/eylem geometri kontrolleri ve ekran görüntüsü.

## Görsel kanıt

- `screenshots/password-recovery-390.png`
- `screenshots/password-recovery-1440.png`

Bu değişiklik bounded bir görsel/erişilebilirlik düzeltmesidir; commit, push ve production değişikliği içermez.
