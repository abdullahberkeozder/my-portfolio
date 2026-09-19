# R0 kaynak ve kanıt sabitleme kaydı

Tarih: 19 Eylül 2026
Ortam: yerel çalışma ağacı + izole Supabase `orkestra-e2e` (`hyuijuafuayzultbjvjb`)
Durum: commit adayı hazır; commit ve push yapılmadı.

## Kapsam

Bu dilim aşağıdaki tek sözleşmeyi sabitler:

- Auth formu hydration tamamlanmadan kullanıcı girdisini kabul etmez.
- Wizard, auth sınırını taslağı kaydettikten sonra belge navigasyonuyla geçer.
- Hesap özeti ilk server okumasını `INITIAL_SESSION` olayıyla gereksiz yere iptal edip tekrarlamaz.
- Public usta profili yalnız dar boolean doğrulama projection'ını kullanır.
- Dizin kartı ve filtre temizleme kurtarma eylemleri Vinext client-router belirsizliğine bağlı kalmadan klavye ve belge navigasyonuyla çalışır.
- İzole staging senaryosu seçili ustayı, kapsamı ve konumu auth dönüşünde korur ve aynı idempotency anahtarıyla tek talep oluşturur.
- Aynı tarayıcıdaki müşteri A → müşteri B → müşteri A geçişi, hesap-kapsamlı yerel anahtarları ve sunucu RLS sınırını birlikte korur.

## Kaynak değişiklikleri

| Alan | Dosyalar | Davranış |
| --- | --- | --- |
| Auth hydration | `app/components/AuthForm.tsx` | Alanlar ve gönderim, client hydration tamamlanana kadar pasif |
| Wizard auth geçişi | `app/components/RequestWizard.tsx` | Scoped draft ve aynı-sekme handoff kaydedildikten sonra native navigasyon |
| Hesap özeti | `app/hooks/useAccountSummary.ts`, `tests/component/AccountSummary.test.tsx` | `INITIAL_SESSION` ikinci fetch/abort üretmiyor; gerçek auth değişiklikleri yenilemeye devam ediyor |
| Public doğrulama | `app/ustalar/[id]/page.tsx`, `app/ustalar/[id]/talep/page.tsx` | İç eligibility helper yerine `get_public_professional_verification` |
| Usta dizini | `app/ustalar/page.tsx` | Profil ve filtre temizleme bağlantıları gerçek belge navigasyonuyla klavyeden çalışıyor |
| Staging altyapısı | `playwright.u3.config.ts`, `scripts/run-u3-browser.mjs`, `scripts/prepare-u3-personas.mjs`, `scripts/check-e2e-connection.mjs`, `tests/staging/*` | Sabit staging hedefi, gizli bilgileri Git dışında tutan persona ve browser paketi |
| Veritabanı | `20260907010554_public_verification_summary.sql`, `20260919194836_harden_public_verification_projection.sql` | Public boolean projection ve private helper execute sınırının ileri-düzeltmesi |

## Migration ve izin kanıtı

- CLI: Supabase `2.115.0`; daha yeni `2.117.0` bulunduğu bilgisi verildi, bu dilimde bağımlılık yükseltilmedi.
- İlk 28 yerel migration, staging geçmişiyle birebir eşleşti.
- Dry-run yalnız `20260919194836_harden_public_verification_projection.sql` dosyasını gösterdi.
- Yeni migration yalnız `orkestra-e2e` ortamına `db push --skip-vault` ile uygulandı. Üretim projesine yazılmadı.
- `private.public_professional_verification`: sabit boş `search_path`; `anon` execute `false`; `authenticated` execute `false`.
- `public.get_public_professional_verification`: sabit boş `search_path`; yalnız boolean projection; `anon` ve `authenticated` execute `true`.
- Eski `public.has_current_professional_verification`: `anon` ve `authenticated` execute `false`.
- Bulunmayan UUID sonucu `false`; sentetik onaylı ve güncel belgeli profil sonucu `true`.

## Test komutları ve sonuçları

| Kontrol | Sonuç |
| --- | --- |
| `npm run repository:check` | Geçti; 1.087 repository dosyası |
| `npm run styles:check` | Geçti |
| `npm run ui-debt:check` | Geçti; 6.156 CSS satırı, 360 `!important`, 58 media query, 37 inline style |
| Hedefli ESLint | Geçti; U3 uygulama, test, config ve runner dosyaları |
| `npm run type-check` | Geçti |
| Hedefli Vitest | 4 dosya, 32 test geçti |
| Final staging Playwright | 6/6 geçti; 30,6 saniye |
| Production build | Staging build ve credentialsız normal build geçti |
| Test sunucusu | Runner-owned `4187` portu kapandı ve serbest bırakıldı |
| `.last-run.json` | `passed`, başarısız test yok |

Final browser paketi şunları doğruladı:

- 320, 390, 820 ve 1440 px'te hizmet/ilçe filtresi, uzun isim, en az 44 px kontroller ve yatay taşma sınırı.
- Klavyeyle filtre gönderme ve profil açma.
- Profil → seçili ustaya wizard yolu ve hedef ustanın korunması.
- Boş sonuç → filtreleri temizleme kurtarma yolu.
- Haritanın örnek veri ve canlı konum olmadığını belirten içerik.
- 390×844 mobil görünümde wizard → gerçek staging auth → açık draft claim → aynı kapsam/usta → tek gönderim.
- Veritabanında yönlendirilmiş hedef, Çankaya/Ayrancı konumu, submitted durum ve tek idempotency kaydı.
- Aynı Chromium context içinde A'nın taslağı oluşturuldu, çıkış yapıldı ve B ile giriş yapıldı; B boş wizard gördü ve A'nın taslak satırını RLS nedeniyle okuyamadı.
- A yeniden giriş yaptığında yalnız kendi hesap-kapsamlı taslak seçimini gördü ve aynı `requestId` ile medya adımına döndü.

## Kronolojik hata kaydı

Başarılı sonucun önceki kırmızı koşuları silmesine izin verilmedi:

1. İlk koşuda dört responsive test profil kartına odaklandı ancak Vinext client navigasyonu Enter ile sayfayı değiştirmedi.
2. Profil bağlantısı belge navigasyonuna çevrilince akış profil ve wizard'ı geçti; bu kez boş durumdaki filtre temizleme bağlantısının query state'i temizlemediği görüldü.
3. İki kurtarma yolu düzeltildikten sonra 5/5 test geçti.
4. İzin sertleştirme migration'ından sonra aynı 5/5 paket tekrar geçti.
5. İkinci müşteri eklenirken fixture sırası birincil ustanın görünen adını sıfırladı; iki profil-bağımlı test erken ve kırmızı bitti, dört responsive test geçti.
6. Fixture sırası düzeltildi; A → B → A izolasyonu dahil 6/6 paket geçti. Bu son koşu kanonik R0 sonucudur.

Geçen auth senaryoları staging'de sentetik submitted talep ve hesap-değişimi senaryosu bir draft oluşturdu. Kayıtlar üretim verisi değildir; bu dilimde geçmiş kanıtı silmek için cleanup yapılmadı.

## Advisor sonucu ve bilinen sınırlar

Security advisor: 0 hata, 3 uyarı.

- `anon_security_definer_function_executable`: public doğrulama RPC'sinin ziyaretçilere dar boolean vermesi için bilinçli. Fonksiyon sabit `search_path`, açık return tipi ve explicit grant kullanıyor; belge alanı döndürmüyor.
- `authenticated_security_definer_function_executable`: aynı kasıtlı public projection'ın authenticated rolü için karşılığı.
- `auth_leaked_password_protection`: staging Auth ayarı açık iş; kod migration'ıyla gizlenmedi.

Açık kalanlar:

- M0–M4 tam rol matrisi, doğrudan RPC/table negatif testleri, Realtime ve eşzamanlılık paketi R2'ye aittir.
- Test profilleri gerçek arz veya canlı konum kanıtı değildir.
- Feature flag yalnız test runner sürecinde açıldı; üretim veya normal yerel ortam ayarı değiştirilmedi.
- Tam coverage ve bütün E2E regression paketi bu hedefli R0 diliminde çalıştırılmadı.
- Jsdom hedefli test koşusunda native belge navigasyonu için bilinen `Not implemented: navigation to another Document` bilgi satırı üretir; 32 testin sonucunu başarısız yapmadı.
- Başarılı U3 koşusunda Vinext bir istemci navigasyonu kapanırken `ERR_STREAM_UNABLE_TO_PIPE` logladı. Runner 6/6 geçti, owned server kapandı ve port serbest kaldı; log gizlenmedi ve ayrı Vinext yaşam-döngüsü borcu olarak tutuluyor.
- Supabase CLI patch güncellemesi bu dilimde yapılmadı.

## Commit sınırı

Commit adayı yalnız `ankara-usta-app` altındaki yukarıda listelenen uygulama, migration, staging test/runner ve R0/U3 dokümanlarını içermelidir. `.vscode`, `.github/workflows/umut-admin-acceptance.yml`, `the-welding-expert-app/AGENTS.md` ve `the-welding-expert-app/playwright-admin-report/` bu commitin dışında tutulmalıdır.

Önerilen commit başlığı:

`fix(orkestra): verify U3 auth return and draft isolation`
