# R2 — M0–M4 regresyon kapısı

Son doğrulama: 21 Eylül 2026. Ayrıntılı commit-adayı kapsamı, migration listesi ve komut sonuçları için [P0 repository ve kanıt kaydına](engineering/P0-REPOSITORY-EVIDENCE-2026-09-21.md) bakın.

Bu kayıt, M0–M4 yetkilendirme, Realtime, eşzamanlılık ve açık talep akışının tek kapıda doğrulanması içindir. Hedef ortam yalnız `orkestra-e2e` (`hyuijuafuayzultbjvjb`) olmalıdır; üretim ref'i (`qzrktfyouloqxjbkhjce`) kabul edilmez.

## Kanıt durumu

| Alan | Sonuç | Kanıt |
| --- | --- | --- |
| Migration envanteri | Geçti | Staging’de 29/29 migration yerel dosyalarla eşleşti. |
| M0–M1 RLS / RPC hardening | Geçti | `phase65_hardening.sql`: RLS, uygunluk, kapsam, retry ve trust kontrolleri geçti. `two_user_rls.sql` deterministik U3 müşterileriyle çalışır. |
| Idempotent draft yarışı | Geçti | İki bağımsız müşteri oturumu aynı anahtarla çağrı yaptı; iki çağrı başarılı ve tek request satırı oluştu. |
| Rakip teklif kabulü | Geçti | İki profesyonel teklifi, iki bağımsız müşteri oturumu aynı anda kabul etti; tam bir kabul edilen teklif ve tam bir iş oluştu. |
| M2 davet / açık talep regresyonu | Geçti | Hedef dışı yanıt reddedildi; hedef usta decline verdi; yalnız müşteri açıkça broaden ederek ayrı açık taslak oluşturdu. |
| M3 Realtime mesajlaşma | Geçti | İki gerçek browser oturumunda teklif, eşzamanlı mesajlar ve kapsam değişikliği yenilemesiz göründü; 4/4 Playwright testi geçti. |
| M4 revizyon / stale-base | Geçti | Aynı tabandan iki revizyon yarıştı; tam biri kazandı, aynı payload retry aynı v2’yi döndürdü. |
| Fixture cleanup | Geçti | Her remote paketten önce ve sonra yalnız R2 işaretli request/job/quote/mesaj fixture’ları temizlendi. |

## Çalıştırma

```powershell
$env:E2E_ALLOW_STAGING_WRITES='true'
.\tools\node-v24.19.0-win-x64\node.exe scripts\run-phase65-remote.mjs
```

Koşucu staging ref'ini `.env.e2e.local` içinden okur, ayrıca her SQL çağrısında `--project-ref` ile aynı ref'i tekrar belirtir. Eşzamanlı yarışlar Supabase Management API sorgularıyla değil, dört bağımsız `supabase-js` oturumuyla yürütülür. Böylece test edilen kilit/transaction yolu, ürünün gerçek authenticated Data API yolu ile aynıdır.

## Yerel kapı sonuçları

- Repository hygiene: 1.097 dosya doğrulandı.
- ESLint ve TypeScript `--noEmit` geçti.
- Vitest: 67 dosya, 398 test geçti.
- Vinext production build geçti.
- Remote tekrar koşusunda migration 29/29 eşleşti; hardening/concurrency, M2–M4 ve Realtime 4/4 geçti.

## Bilinen sınırlar

- İlk remote denemede `npm.cmd` sistem Node 20’yi seçti ve Realtime istemcisi native WebSocket bulamadı; doğrudan proje Node 24 çalıştırıcısı ile tekrarlandığında ürün yarışları geçti.
- Browser koşusunda Vinext `ERR_STREAM_UNABLE_TO_PIPE` logları üretmeye devam etti; Playwright 4/4 geçti, sunucu kontrollü kapandı ve port 4187 serbest kaldı. Bu log ayrı Vinext uyumluluk borcudur.
- Bu kayıt staging doğrulamasıdır; production feature flag aktivasyonu ve yayın kararı ayrı adımdır.
