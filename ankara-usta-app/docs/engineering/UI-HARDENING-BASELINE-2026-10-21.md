# UI hardening başlangıç kaydı — 21 Ekim 2026

Bu kayıt P0 başlangıç kanıtıdır. Kod, test veya git durumu değiştirilmeden alınmıştır; kullanıcıya ait mevcut değişiklikler korunmuştur.

## Çalışma alanı

- Branch: `codex/worktree-preservation`
- Modified/staged satır sayısı: 165
- Untracked satır sayısı: 31
- `AGENTS.md` ve `.orchestration/TASK_TEMPLATE.md`: bu checkout'ta bulunamadı
- Node: `v20.20.0`
- `package.json` engine: `>=22.13.0` — ortam uyumsuzluğu; P1 görevi içinde yükseltme yapılmayacak

Sayılar, `git status --short --branch` çıktısının 21 Ekim 2026 tarihli snapshot'ıdır. Çalışma ağacındaki dosyaların sahibi kullanıcıdır; temizleme, reset, checkout veya toplu formatlama yapılmamıştır.

## P1a yeniden üretim kanıtı

`npm run styles:check`: başarılı.

`npm run type-check`: başarılı.

Komut: `npm run lint`

Sonuç: başarısız, 1 hata.

`app/ustalar/UstalarSplitView.tsx:300` içinde `useEffect` gövdesinden `setOpenServiceAreaKey(null)` çağrısı `react-hooks/set-state-in-effect` tarafından reddedildi. Bağımlılıklar: `selectedService`, `selectedDistrict`, `searchQuery`, `visibleUstaIds`.

Bu hata, filtre/arama değişiminde açık hizmet alanı panelini kapatma niyetiyle ilişkilidir. Çözüm; lint'i kapatmadan, `setTimeout`/microtask ile ertelemeden ve panelin geçersiz kaydı göstermeme davranışını koruyarak tasarlanmalıdır.

## U5 kaynak gözlemi

`app/components/U5VisualFixture.tsx` içinde `window.location.reload()` içeren `onClick` vardır; dosyanın başında `use client` direktifi yoktur. Bu, client/server sınırı için incelenmesi gereken bir kaynak riskidir. Production runtime arızası bu kayıtla kanıtlanmış sayılmaz; build ve route smoke ile doğrulanacaktır.

## Sonraki kapı

Yalnız şu dosya kapsamıyla P1a yürütülecek:

- `app/ustalar/UstalarSplitView.tsx`
- `app/components/U5VisualFixture.tsx`
- ilgili iki component test dosyası

İlk görev sözleşmesi: `GEMINI-UI-HARDENING-01.md`. Gemini erişimi ve izinli kaynak aktarımı doğrulanmadan Gemini görüşü alınmış gibi raporlanmayacaktır.
