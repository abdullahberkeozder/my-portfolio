# Codex–Gemini görev kuyruğu

Codex görevleri `.orchestration/inbox/*.task.md` içine bırakır. Doğrulanmış Antigravity oturumunda çalışan `scripts/gemini-worker.ps1` bu dosyaları Gemini 3.8 Flash High’a gönderir ve çıktıyı `.orchestration/outbox/*.result.md` içine yazar.

## Bir kez başlatma

Antigravity CLI oturumunun doğrulandığı PowerShell penceresinde proje kökünden:

```powershell
.\scripts\gemini-worker.ps1
```

Görevlerin kapsamı Codex tarafından hazırlanır; worker yalnızca kuyruğu tüketir. Worker açık kaldığı sürece yeni görevler için prompt kopyalamanız gerekmez.

İzin istemlerini Gemini görev sözleşmeleriyle otomatik onaylamak gerektiğinde açıkça:

```powershell
.\scripts\gemini-worker.ps1 -SkipPermissions
```

`-SkipPermissions` kullanılabilir. Bu modda da commit ve push yasaktır; Codex her sonuçtan sonra diff ve testleri denetler.

Worker, `agy --print-timeout 0s` ile Gemini turunun kendi kendine tamamlanmasını bekler. Bu, uzun dosya incelemelerinde CLI’nin sabit üç dakikalık kesmesini önler; worker görevi sonuç veya hata dosyasıyla kapatır. `-SkipPermissions` yalnızca kullanıcının açık izniyle kullanılmalıdır.

## Durum klasörleri

- `inbox`: çalışmayı bekleyen `.task.md` dosyaları
- `processing`: worker’ın o anda aldığı görev
- `outbox`: tamamlanan görev çıktıları
- `failed`: worker seviyesinde başarısız görevler

Bu klasörler runtime çıktısıdır; görev dosyaları dışında üretim kodu içermez.
