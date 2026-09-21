# Orkestra Notification Worker Operations Runbook

- **Service Name**: `AnkaraUsta.NotificationWorker`
- **Runtime**: .NET 10 (ASP.NET Core Hosted Worker)
- **Database**: PostgreSQL / Supabase
- **External Provider**: Resend Transactional Email API (`api.resend.com`)
- **Status**: Production & Staging Operations Reference

---

## 1. Mimari ve Amaç

Orkestra pazaryeri akışlarında (mesajlaşma, teklif kabulü, keşif randevusu, kapsam değişikliği, usta başvuru durum güncellemeleri), e-posta sağlayıcısı gecikmelerinin veya geçici servis kesintilerinin ana veritabanı işlemlerini engellemesini önlemek amacıyla **Transactional Outbox** deseni uygulanır.

Domain işlemleri ile bildirim kuyruğu satırları (`public.notification_outbox`), PostgreSQL üzerinde aynı ACID transaction içinde atomik olarak kaydedilir. Teslimat, izole çalışan ve arka planda kuyruğu güvenle işleyen `AnkaraUsta.NotificationWorker` servisi tarafından yürütülür.

```
[ Domain Transaction ] ---> INSERT into public.notification_outbox (channel='email', status='pending')
                                      |
                                      v (FOR UPDATE SKIP LOCKED)
                         [ claim_email_notification_batch ]
                                      |
                                      v
                        [ AnkaraUsta.NotificationWorker ]
                          1. Resolve Recipient (Supabase Auth Admin)
                          2. Render Template (Job / Event Type)
                          3. Send via Resend (Idempotency-Key: ankara_usta_notification_{id})
                                      |
                         +------------+------------+
                         |                         |
                      Success                   Failure
                         |                         |
                         v                         v
               [ mark_notification_result ]  [ mark_notification_result ]
               status: 'sent'                status: 'retrying' (or 'dead' if attempts >= 8)
```

---

## 2. Dış Servis Sözleşmeleri ve İzinler

1. **Supabase Data REST RPC (`claim_email_notification_batch`)**:
   - `service_role` yetkisi ile çağrılır (`PUBLIC`, `anon`, `authenticated` erişimi revoked).
   - Email kanalındaki (`channel = 'email'`) bekleyen kayıtları atomik olarak kilitler.
2. **Supabase Auth Admin API (`GET auth/v1/admin/users/{recipientId}`)**:
   - Alıcı ID'sinden güncel ve doğrulanmış e-posta adresini çözer.
   - Servis rolü anahtarı asla istemci tarafına (Next.js client) aktarılmaz.
3. **Resend Email API (`POST https://api.resend.com/emails`)**:
   - HTTP Bearer Authentication (`ResendApiKey`).
   - `Idempotency-Key: ankara_usta_notification_{id}` başlığı ile çift gönderim engellenir.
4. **Supabase Data REST RPC (`mark_notification_result`)**:
   - `service_role` yetkisi ile çağrılır.
   - Sonucu veritabanında `sent`, `retrying` veya `dead` durumuna günceller.

---

## 3. Durum Yaşam Döngüsü ve Yeniden Deneme (Retry / Dead-Letter)

### 3.1. Durumlar
- `pending`: Yeni eklenmiş, işlenmeyi bekleyen bildirim.
- `processing`: Worker tarafından `claim_email_notification_batch` ile kilitlenmiş ve teslimatı süren bildirim.
- `sent`: Resend tarafından başarıyla kabul edilen ve `sent_at` zaman damgası işlenen teslimat.
- `retrying`: Hata almış ancak maksimum deneme sınırına ulaşmamış, artımlı bekleme süresi sonrasında tekrar işlenecek bildirim.
- `dead`: 8 deneme boyunca teslim edilememiş, operasyonel inceleme gerektiren bildirim.

### 3.2. Lease ve Kilit Mekanizması
- İşlem kilitlemesi `FOR UPDATE SKIP LOCKED` ile yapılır; birden fazla worker kopyası aynı anda birbirini engellemeden çalışabilir.
- **Worker Lease Zaman Aşımı**: `5 dakika`. Bir worker çökerse veya kilit düşerse, `status = 'processing' AND updated_at < now() - interval '5 minutes'` koşulu sayesinde kayıt otomatik olarak kuyruğa döner ve başka bir worker tarafından devralınır.
- **pg_cron Kurtarma Görevi**: `notification-outbox-recovery` her 10 dakikada bir (`*/10 * * * *`) kilitli kalmış bildirimleri sıfırlar.

### 3.3. Artımlı Bekleme (Exponential Backoff)
Her başarısız denemede `next_attempt_at` aşağıdaki kurala göre ötelenir:
- 1. Hata: 30 saniye
- 2. Hata: 60 saniye
- 3. Hata: 120 saniye
- 4. Hata: 240 saniye
- 5. Hata: 480 saniye
- 6. Hata: 960 saniye
- 7. Hata: 1920 saniye
- 8. Hata: `dead` durumuna geçer (`attempts >= 8`).

---

## 4. İdempotency ve Çift Gönderim Güvencesi

Ağ seviyesindeki kesintiler veya worker yeniden başlatmaları durumunda kullanıcılara mükerrer e-posta gitmesini önlemek için:
1. `ResendEmailSender`, her istekte `Idempotency-Key` başlığı olarak kararlı `ankara_usta_notification_{id}` değerini iletir.
2. Resend API bu anahtarı kullanarak sağlayıcı penceresi boyunca isteği tanır ve önceki yanıtı döndürür; yeni bir e-posta basmaz.
3. Worker seviyesinde teslimat *en az bir kez (at-least-once)*, Resend idempotency mekanizması ile kullanıcı tarafında *tam olarak bir kez (effectively-once)* gerçekleşir.

---

## 5. Yapılandırma ve Çevre Değişkenleri

Worker, `.NET` yapılandırma sağlayıcıları (`appsettings.json` veya ortam değişkenleri) üzerinden beslenir:

| Değişken | Açıklama | Örnek Değer |
|---|---|---|
| `NotificationWorker__SupabaseUrl` | Supabase proje adresi | `https://your-project.supabase.co` |
| `NotificationWorker__SupabaseServiceRoleKey` | Supabase admin yetkili anahtarı (Gizli) | `eyJhbGci...` |
| `NotificationWorker__ResendApiKey` | Resend API yetkilendirme anahtarı (Gizli) | `re_...` |
| `NotificationWorker__FromEmail` | Gönderici e-posta adresi (Doğrulanmış alan adı) | `Orkestra <bildirim@ankarausta.com>` |
| `NotificationWorker__PollIntervalSeconds` | Kuyruk boşken bekleme aralığı (5 - 300 sn) | `10` |
| `NotificationWorker__BatchSize` | Tek seferde talep edilecek bildirim sayısı (1 - 100) | `25` |

> [!WARNING]
> `SupabaseServiceRoleKey` ve `ResendApiKey` kesinlikle kaynak kod depolarına (`git`) eklenmemeli, CI secret yönetimi veya cloud environment store üzerinden inject edilmelidir.

---

## 6. İzleme ve Sağlık Kontrolü (Health Check)

Worker servisi hafif bir HTTP sunucusu barındırır ve `GET /health` uç noktasını sunar:

```bash
curl http://localhost:5000/health
```

**Başarılı Yanıt Örneği (Yapılandırılmış):**
```json
{
  "status": "ok",
  "integration": "supabase-outbox-to-resend",
  "configured": true
}
```

**Yapılandırma Eksik Yanıt Örneği:**
```json
{
  "status": "ok",
  "integration": "supabase-outbox-to-resend",
  "configured": false
}
```
*Not: Gerekli anahtarlar eksik olduğunda servis çökmez; HTTP sağlık kontrolü çalışmaya devam eder ancak arka plan kuyruk yoklaması (`NotificationDeliveryWorker`) devre dışı bırakılır.*

---

## 7. Operasyon ve Sorun Giderme Prosedürleri

### 7.1. Dead-Letter Kuyruğunu İnceleme
8 deneme sonunda teslim edilemeyen kayıtları listelemek için veritabanında çalıştırılacak sorgu:
```sql
select id, recipient_id, attempts, last_error, created_at, updated_at
from public.notification_outbox
where channel = 'email' and status = 'dead'
order by updated_at desc;
```

### 7.2. Dead-Letter Bildirimi Yeniden Tetikleme
Sorun çözüldükten sonra (örneğin kullanıcının geçersiz e-posta adresi düzeltildiğinde veya Resend kotası açıldığında):
```sql
update public.notification_outbox
set status = 'pending', attempts = 0, next_attempt_at = now(), last_error = null
where id = <NOTIFICATION_ID> and status = 'dead';
```

### 7.3. Kilitlenmiş Görevleri Manuel Kurtarma
```sql
update public.notification_outbox
set status = 'retrying', next_attempt_at = now(), worker_id = null
where channel = 'email'
  and status = 'processing'
  and updated_at < now() - interval '5 minutes';
```

---

## 8. Staging ve Yayın Öncesi Kontrol Listesi

- [ ] Supabase üzerinde `claim_email_notification_batch` ve `mark_notification_result` RPC fonksiyonları migrate edilmiş olmalıdır.
- [ ] `tradesperson-documents` ve outbox tablolarının RLS politikaları doğrulanmalıdır.
- [ ] Resend üzerinde `ankarausta.com` (veya staging alan adı) DNS kayıtları (SPF, DKIM, DMARC) onaylanmış olmalıdır.
- [ ] Worker container'ı deploy edildiğinde `/health` uç noktası `configured: true` dönmelidir.
- [ ] Test kullanıcısı oluşturularak bir durum geçişi veya mesaj tetiklenmeli, outbox kaydının `pending -> processing -> sent` geçişi gözlenmeli ve Resend Dashboard üzerinde `Idempotency-Key` kontrol edilmelidir.
