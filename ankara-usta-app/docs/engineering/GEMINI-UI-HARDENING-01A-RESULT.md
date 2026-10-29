# UI-HARDENING-01A sonuç kaydı — 21 Ekim 2026

Durum: Uygulandı ve hedefli doğrulandı. Commit/push yapılmadı.

## Gemini katkısı

Gemini 3.8 Flash High, doğrudan kirli checkout’a erişmeden yalnız U5 kaynak metniyle patch üretti. İlk izole paket denemesinde `RunCommand` headless izin politikasıyla reddedildi; kaynak metin prompt’a alınarak ikinci deneme tamamlandı. Gemini’nin ürettiği patch Codex tarafından iki dosya sınırı, server consumer sözleşmesi ve test kapsamı açısından incelenerek uygulandı.

## Değişen dosyalar

- `app/components/U5VisualFixture.tsx`
- `tests/component/U5VisualFixture.test.tsx`

U5 bileşeni client sınırına alındı. Retry kontrolü `disabled` ve `aria-busy` durumunu yönetiyor; dört fixture varyantı ve audience/view nitelikleri korundu. Server consumer’lar callback geçmeden mevcut serializable props ile çalışıyor.

## Gerçek doğrulama

- `npm run test -- tests/component/U5VisualFixture.test.tsx` → **6 test geçti**. İlk sandbox denemesi Windows temporary rename `EPERM` ile çalışmadı; aynı komut sandbox dışında tekrarlandı.
- `npm run type-check` → **başarılı**.
- `npm run build` → **başarılı**. Mevcut `/images/auth-bg.jpg` build uyarısı devam ediyor; bu görev kapsamı dışıdır.
- `npm run lint` → **başarısız, önceden bilinen tek hata**: `app/ustalar/UstalarSplitView.tsx:300` içindeki `setState` effect çağrısı. Bu 01B görevidir; lint kuralı kapatılmadı.

## Kapsam notu

CSS, config, dependency, route ve git geçmişi değiştirilmedi. Sonraki bounded görev 01B: SplitView lifecycle/state invalidation ve lint düzeltmesi.
