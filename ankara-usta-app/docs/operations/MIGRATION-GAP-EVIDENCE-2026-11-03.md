# Üretim migration farkı — salt okunur kanıt kaydı

**Tarih:** 3 Kasım 2026

**İlk gözlem checkout'u:** `codex/worktree-preservation` / `d41288e`; veri fixture değişikliği `codex/migration-data-compatibility` dalında hazırlanıyor
**Durum:** Ücretsiz boş şema CI provası geçti. Mevcut üretim satırlarıyla uyumluluk kanıtlanmadı. Üretim veya staging verisi değiştirilmedi.

## Kaynak ve sonuç

| Kaynak | Doğrudan gözlem | Sonuç sınırı |
| --- | --- | --- |
| Supabase proje listesi, 3 Kasım | `hizmet-pazaryeri` (`qzrktfyouloqxjbkhjce`) ve `orkestra-e2e` (`hyuijuafuayzultbjvjb`) aktif. | Bunlar iki ayrı projedir. |
| Supabase `list_migrations`, salt okunur | Üretim 20 migration; staging 32. Üretimdeki 20 sürüm [yerel manifest](production-applied-migrations.txt) ile aynı sırada. Repo `supabase/migrations` altında 32 SQL dosyası içeriyor. | [22 Eylül doğrulama notundaki](../engineering/VERIFICATION-2026-09-22.md) üretim için 29 sayısı bugünkü bu iki proje envanterini temsil etmiyor. Eski kayıt silinmez; ref/tarih farkı olarak tutulur. |
| [GitHub Actions run #41459057324](https://github.com/abdullahberkeozder/my-portfolio/actions/runs/41459057324) | 2 Kasım, `f0ad83d`, `Orkestra migration gap rehearsal`, **Success**, `rehearse` işi başarılı. [PR #18](https://github.com/abdullahberkeozder/my-portfolio/pull/18) taslak ve açık. | Bu sonuç `d41288e` commit'inin CI koşusu değildir. İki commit arasında workflow, manifest, kabul SQL'i ve rozet migration'ında içerik farkı yoktur (`git diff --name-status` boş). |
| Supabase `execute_sql`, salt okunur agregalar | Üretimde 62 `service_requests`: 38 `draft`, 24 `matching`; 38 `package`, 20 `quote`, 4 `inspection`. İki `quotes` satırı da `submitted`. | Kişi kimliği, talep metni, adres veya satır içeriği alınmadı. Bunlar sadece toplu sayılardır. |
| [CI workflow](../../../.github/workflows/ankara-usta-migration-rehearsal.yml) ve [kabul SQL'i](../../supabase/tests/remote/migration_gap_rehearsal.sql) | Geçici PostgreSQL önce 20 migration ile kurulur, sonra kalan 12 uygulanır; 32 kayıt, üç RPC varlığı, rozet `anon` yürütme izni ve 50 kimlik sınırı denetlenir. | Başarılı boş şema ve RPC kontrolü, mevcut talep/teklif satırlarının veri dönüşümü, FK, tetikleyici, performans veya rollback uyumluluğunu kanıtlamaz. |

## Eksik 12 migration'ın sınırı

Üretim manifestinin dışında olan sürümler: `20260901130258`, `20260902200310`, `20260902202626`, `20260902205806`, `20260902211047`, `20260902213412`, `20260905152012`, `20260907010554`, `20260919194836`, `20260922161628`, `20260922205318`, `20261101201122`. İlk 11'i rozetin ön bağımlılıkları arasındadır. Rozet migration'ını tek başına üretime geçirmek kabul değildir.

## Gemini 3.8 Flash High karşı incelemesi

Gemini'ye önce yalnız belirtilen migration dosyalarını okuma görevi verildi; Antigravity headless oturumu `read_file` iznini otomatik reddetti. Bu deneme dosya incelemesi olarak raporlanmıyor. Ardından sır ve gerçek satır içermeyen özetle ikinci bir değerlendirme alındı. Gemini, taslak/aktif talep, üç `delivery_model` ve teklif bağlılığını temsil eden küçük sentetik fixture'ı geçici CI veritabanına eklemeyi önerdi. İlk yanıtında run'ı yanlışlıkla `d41288e`ye bağladı; `quotes.service_request_id` ve `request_type` diye var olmayan iki kolon kullandı. Hatalar geri bildirilince `f0ad83d`, `quotes.request_id` ve `service_requests.delivery_model` olarak düzeltti.

**PM/teknik karar:** Gemini önerisi yalnız test tasarımı girdisidir; kaynak incelemesi veya çalışan SQL kanıtı değildir. Altı sentetik talep ve iki teklif, temel FK/durum/model geçişini sınayabilir; üretimdeki 62 talebin tüm dağılımını, hacim davranışını ve gerçek veri içeriğini kanıtlayamaz. Bu nedenle fixture provası geçse bile kontrollü gerçek veri uyumluluk/geri dönüş planı ve yayın smoke ayrı kalır.

## Sıradaki sınırlı uygulama görevi

**3 Kasım yerel ilerleme:** [Sentetik v20 fixture](../../supabase/tests/remote/migration_gap_data_fixture.sql), [v32 veri kabulü](../../supabase/tests/remote/migration_gap_data_assertions.sql) ve [CI sırası](../../../.github/workflows/ankara-usta-migration-rehearsal.yml) hazırlandı. Altı sentetik talep (`draft`/`matching` × üç model), iki ayrı ustadan iki `submitted` teklif ve açık yönlendirme varsayımı denetleniyor. Workflow YAML ayrıştırıldı ve adım sırası yerelde doğrulandı. Yerel Docker/PostgreSQL bulunmadığı için SQL **çalıştırılmadı**; bu dilim henüz CI kanıtı veya üretim uyumluluğu değildir. Gemini 3.8 Flash High, kusursuz sentetik verinin tarihsel bozuk kayıtları temsil etmediğini ve dar durum kapsamının yanlış güven yaratabileceğini belirtti. Geniş kodlama/üç dosya inceleme görevleri CLI süre sınırına takıldı; bu değişiklikler Gemini tarafından yazılmış veya dosya bazında onaylanmış sayılmıyor. Kısa şema incelemesindeki rol uyarısı üzerine sentetik profesyonellere `tradesperson` rolü eklendi.

1. `20260902192847` sonrası, **20 migration'lı geçici CI şemasına** anonim ve deterministik kullanıcı/usta/talep/teklif fixture'ı yüklemek için ayrı SQL hazırla. `service_requests` için `draft` ve `matching`, `delivery_model` için `package`, `quote`, `inspection`; `quotes.request_id` ile iki `submitted` teklif ilişkisini kapsa. Gerçek üretim satırı veya kimliği kopyalama.
2. Eksik 12 migration uygulanmadan önce fixture'ın şema ve FK açısından geçerli olduğunu doğrula. Göç sonrasında talep/teklif sayısı, kimlikleri, statü/model değerleri ve bağlı tekliflerin bozulmadığını assert et. Testi yalnız CI geçici veritabanında çalıştır.
3. Başarısızlıkta hangi migration'ın kırıldığını ve fixture cleanup'ını açık raporla. Geçiş planı ayrıca `roll-forward`, yedekleme ve üretimde durdurma eşiğini içersin; tek başına SQL `down` sözü verme.
4. Bu kodlama dilimini Gemini'ye dar kaynak paketiyle ver; Codex diff, SQL ve CI kanıtını bağımsız incelesin. Bu belge kodlama/CI sonucu değildir.

**Yayın kapısı:** Bu kayıt üretime migration uygulama, PR birleştirme veya pilot açma izni vermez.
