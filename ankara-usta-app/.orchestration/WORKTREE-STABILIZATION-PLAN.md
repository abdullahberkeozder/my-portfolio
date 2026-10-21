# Çalışma Ağacı Stabilizasyon Planı

Tarih: 2026-10-21  
Kapsam: `ankara-usta-app` çalışma alanı; Git kökü üst klasördeki `my-portfolio` reposudur.

## Mevcut durum kaydı

- `main`: `dc59590` (`chore(workflow): add bounded Gemini orchestration contract`).
- `origin/main`: `31fb39f`; local `main` remote'un bir commit önünde ve henüz push edilmedi.
- `codex/clean-baseline`: `dc59590` tabanlı temiz geliştirme worktree'si. Stabilizasyon planı bu dalda güncellenmektedir.
- `codex/worktree-preservation`: önceki büyük kullanıcı çalışma ağacını taşıyan koruma dalı; runtime, test/tooling ve araştırma/evidence değişiklikleri burada tutulur.
- U5 checkpoint'i `31fb39f` ile zaten sabitlendi; orchestration sözleşmesi `dc59590` ile ayrı atomik commit olarak main'e alındı.
- `.env*`, `.next`, `node_modules`, `coverage`, `test-results`, `.orchestration/runs` gibi yerel/üretilmiş alanlar korunuyor ve temizleme yapılmıyor.
- `Incomplete string token.` anomalisini Git stash cleanup aşamasında yok olarak raporladı; tracked ürün dosyası değildir ve yeniden oluşturulmayacaktır.

## Stabilizasyon ilkeleri

1. `git reset --hard`, `git clean`, `git checkout --`, toplu formatlama ve otomatik stash kullanılmayacak.
2. Kullanıcı değişiklikleri önce içeriklerine göre kulvarlara ayrılacak; Git status çıktısını küçültmek için dosya silinmeyecek.
3. Bir sonraki Gemini görevi yalnızca task JSON'ındaki `allowedFiles` üzerinde çalışacak. Runner'ın hash ve Git index korumaları zorunlu kalacak.
4. Staged içerik ile unstaged içerik karıştırılmayacak. Yeni görev başlamadan önce staged dosyaların listesi ve index imzası kaydedilecek.
5. Generated evidence, araştırma kütüphanesi ve geçici `scratch` çıktıları ürün runtime değişiklikleriyle aynı checkpoint'e alınmayacak.
6. Commit, ancak kullanıcı ayrı olarak onayladığında ve her checkpoint odaklı test kanıtıyla hazır olduğunda yapılacak.

## Önerilen kulvarlar

| Kulvar | İçerik | Kabul kapısı |
| --- | --- | --- |
| Runtime | `app/`, `services/`, `supabase/` | ilgili route/component testleri, type-check |
| Test ve tooling | `tests/`, `scripts/`, Playwright configleri | odaklı test + repository check |
| Araştırma ve evidence | `docs/research/`, `docs/design/`, `docs/evidence/`, referans görselleri | dosya bütünlüğü ve link kontrolü |
| Orkestrasyon | `AGENTS.md`, `.orchestration/` task/runner belgeleri | runner smoke/read-only kontrolü |
| Yerel/generated | `scratch/`, browser raporları ve makineye özel çıktılar | silme yok; yalnızca açıkça generated olduğu doğrulanırsa gelecekte ignore adayı |

## Bir sonraki güvenli işlem sırası

1. Bu güncellenmiş belgeyi baseline kabul et; `main` ile `origin/main` arasındaki farkı push öncesi ayrıca doğrula.
2. `codex/worktree-preservation` içeriğini kulvar bazında yeniden envanterle; tek büyük commit veya toplu reset yapma.
3. Bir sonraki ürün görevini yalnızca `codex/clean-baseline` üzerinde, küçük `allowedFiles` listesiyle çalıştır.
4. Gemini test kanıtını aldıktan sonra Codex diff, scope ve UI/route davranışını incele.
5. Kullanıcı commit onayı verdiğinde runtime, test/tooling ve research/evidence dilimlerini ayrı atomik checkpoint'ler olarak ele al.
6. Remote push yalnızca checkpoint doğrulaması ve açık push onayından sonra yapılır.

## Neden şimdi temizleme yapılmıyor?

Bu ağaçta untracked araştırma/evidence dosyaları ve farklı ürün dilimleri gerçek kullanıcı çalışması olabilir. `git clean` veya toplu ignore değişikliği görünür dosyaları kaybettirebilir ya da gelecek görevlerin kapsamını gizleyebilir. Bu nedenle ilk optimizasyon fiziksel silme değil, kapsam ve doğrulama disiplinidir.
