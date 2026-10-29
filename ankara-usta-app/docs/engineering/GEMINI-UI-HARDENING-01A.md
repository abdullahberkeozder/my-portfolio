# Gemini görevi UI-HARDENING-01A — U5 client sınırı

Durum: Gemini path tartışmasından sonra hazırlandı; allowlist erişimiyle yürütülecek.

## Amaç

`U5VisualFixture` içindeki retry etkileşimini geçerli bir client sınırına almak. SplitView lifecycle, CSS, modal ve ortak config bu görevin dışındadır.

## İzinli dosyalar

- `app/components/U5VisualFixture.tsx`
- `tests/component/U5VisualFixture.test.tsx` (yeni)

Başka dosya zorunluysa önce gerekçeyi bildir. Mevcut staged/unstaged/untracked değişiklikleri koru; reset, clean, checkout, commit, push ve deploy yapma.

## Kabul kriterleri

1. Bileşen server ve client tüketicilerinde hydration/build sınırı ihlali üretmez.
2. Dört fixture türü (`empty`, `partial-error`, `expired`, `direct-link`) ve mevcut audience/view veri sözleşmesi korunur.
3. Retry düğmesi tek kullanıcı tetiklemesinde tek kez çalışır; işlem sırasında `disabled` ve `aria-busy="true"` olur.
4. Retry davranışı client tarafında kalır; server component’lere uygunsuz event prop aktarılmaz.
5. CSS, global config, dependency ve ilgisiz dosya değişmez.

## Önce kısa teknik değerlendirme

Kodlamadan önce mevcut RSC sınırının riskini, en küçük client izolasyonunu, retry busy state’in test edilebilirliğini ve server consumer sözleşmesini açıkla. Sonra uygula.

## Doğrulama

```pwsh
npm run test -- tests/component/U5VisualFixture.test.tsx
npm run type-check
npm run build
```

Test dosyası yoksa yalnız izinli yeni test dosyasını oluştur. Build ortam/Node uyumsuzluğu nedeniyle çalışmazsa exit code ve gerçek nedeni raporla; başarı iddia etme. Bu görev tamamlanınca dur; SplitView için ayrı 01B görevine geçme.

## Teslim

Çözüm özeti, değişen iki dosya, gerçek komut/exit code, önceki hata ayrımı, süre ve düzeltme turu. Görsel route iddiası bu görev kapsamına dahil değildir.
