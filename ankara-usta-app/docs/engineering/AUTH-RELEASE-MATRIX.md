# Orkestra Kimlik Doğrulama, Yetkilendirme ve Parola Kurtarma Release Matrisi (AUTH-01)

- **Aşama**: P1 — Aşama 2 (Çekirdek Deneyim ve Erişilebilirlik)
- **Tarih**: 22 Eylül 2026
- **Kapsam**: Müşteri ve Usta Kayıt, Doğrulama Bildirimi, Callback Oturum Takası, Açık Yönlendirme Koruması, Rol Yetkilendirme (RBAC), Parola Kurtarma ve Taslak Koruma
- **Test Dosyaları**:
  - `tests/unit/authReleaseMatrix.test.ts` (20 entegrasyon testi)
  - `tests/component/AuthForm.test.tsx` (10 bileşen testi)
  - `tests/component/PasswordUpdatePage.test.tsx` (5 bileşen testi)
  - `tests/unit/authCallback.test.ts` (4 birim testi)
  - `tests/unit/authRedirect.test.ts` (5 birim testi)
  - `tests/unit/authServer.test.ts` (3 birim testi)

---

## Kanıt sınırı — 22 Eylül 2026

Bu tablo hedeflenen sekiz yolculuğu tarif eder; gerçek hesaplı tamamlanma kaydı değildir.
`authReleaseMatrix.test.ts` Supabase istemcisini mock eder. Rol sözlüğü ve
yönlendirme kontrolleri gerçek signup, e-posta teslimi, hesap varlığı gizliliği
veya hesaplar arası taslak izolasyonunu tek başına kanıtlamaz. Özellikle
enumeration başlıklı safeNextPath testleri açık yönlendirmeyi sınar.
Gerçek parola kurtarma tarayıcı testi de yönetici tarafından üretilen recovery
linkini kullanır; posta kutusuna teslim kanıtı sağlamaz.
Güncel sonuçlar: [doğrulama kaydı](VERIFICATION-2026-09-22.md).

## 1. Hedeflenen 8 Çekirdek Yolculuk (Core Journeys)

| # | Yolculuk | Başlangıç Rotası | Beklenen Sonuç | Güvenlik / Sözleşme İlkesi |
|---|---|---|---|---|
| **J1** | **Müşteri Kayıt (Customer Signup)** | `/kayit` | E-posta doğrulama bildirim ekranı | Otomatik ayrıcalıklı rol verilmez (`service_intent: 'customer'`); kullanıcı doğrulanana kadar talep oluşturma taslağı güvenle saklanır. |
| **J2** | **Usta Kayıt (Artisan Signup)** | `/usta/kayit` | E-posta doğrulama bildirim ekranı | Usta niyeti (`service_intent: 'tradesperson'`) kaydedilir; moderasyon onayı olmadan usta paneline erişim kilitlidir. |
| **J3** | **Hesap Numaralandırma Koruması (Enumeration Defense)** | `/kayit` & `/usta/kayit` | Nötr başarı/onay mesajı | Zaten kayıtlı bir e-posta ile kayıt denendiğinde kullanıcıya hesabın var olduğu ifşa edilmez; kimlik avı engellenir. |
| **J4** | **Callback Kod Takası (/auth/callback)** | `/auth/callback?code=...` | Oturum açılır -> Hedef sayfaya 307 yönlendirme | Kod geçerliyse oturum başlatılır; kod hatalı/süresi dolmuşsa `/giris?authError=callback` hata rotasına yönlendirilir. |
| **J5** | **Açık Yönlendirme Koruması (Open Redirect Defense)** | `?next=//evil.com` veya `https://...` | Temizlenir -> Varsayılan güvenli iniş sayfası | Protokol göreceli (`//`), ters eğik çizgi (`\\`), kontrol karakterleri ve harici şemalar (`javascript:`, `data:`) reddedilir. |
| **J6** | **Rol Tabanlı İniş ve Çapraz Koruma (RBAC)** | `/giris` veya `/usta/giris` | Müşteri -> `/taleplerim`, Usta -> `/usta/talepler` | Müşteri usta girişinden gelse dahi usta çalışma alanına sızamaz, müşteri alanına yönlendirilir. |
| **J7** | **Parola Kurtarma Yaşam Döngüsü (/parola-yenile)** | `#type=recovery&access_token=...` | Parola güncelleme formu -> Başarı -> `/hesap` | Belirteçsiz gelişte form kilitlenir; geçerli belirteçte hash temizlenir, eşleşmeyen şifreler bloklanır, başarıyla güncellenir. |
| **J8** | **Taslak Koruma ve Dönüş (Draft Return)** | `/?resume=1&service=...` | Giriş sonrası sihirbaza dönüş | Wizard akışında oluşturulan taslak kimliği login/callback zinciri boyunca korunur; başka hesaba sızmaz. |

---

## 2. Rol İniş ve İzin Matrisi

| Rol | Varsayılan İniş Sayfası | İzin Verilen Rota Önekleri | Kısıtlanan Alanlar |
|---|---|---|---|
| **customer** | `/taleplerim` | `/taleplerim`, `/islerim`, `/uyusmazliklar`, `/gorusmeler`, `/teklifler/`, `/hesap` | `/usta/*`, `/yonetim/*` |
| **tradesperson** | `/usta/talepler` | `/usta`, `/islerim`, `/uyusmazliklar`, `/gorusmeler`, `/teklifler/`, `/hesap` | `/yonetim/*` |
| **moderator** | `/yonetim/moderasyon` | `/yonetim`, `/uyusmazliklar`, `/hesap` | Doğrudan usta çalışma alanı |
| **admin** | `/yonetim/uyusmazliklar` | Tüm rotalar (`/yonetim`, `/usta`, `/taleplerim`, `/islerim`, vb.) | Yok |
| **anon (oturumsuz)** | `/` | Public rotalar (`/`, `/giris`, `/kayit`, `/yardim`, `/ustalar`, vb.) | Tüm korumalı çalışma alanları ve `/hesap` |

---

## 3. Doğrulama ve CI Entegrasyonu

Tüm bu kurallar, yerel CI hattında hiçbir sır gerektirmeksizin şu komutla koşulur:
```bash
node scripts/run-project-tool.mjs vitest run tests/unit/authReleaseMatrix.test.ts tests/component/AuthForm.test.tsx tests/component/PasswordUpdatePage.test.tsx
```

Bu testler her PR ve üretim öncesi `npm run quality` içinde otomatik olarak icra edilir.
