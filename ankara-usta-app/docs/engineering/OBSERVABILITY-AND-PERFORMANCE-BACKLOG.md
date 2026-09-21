# Orkestra Gözlemlenebilirlik, Hata Yönetimi ve Performans Backlog'u (P5)

- **Kapsam**: Telemetri, Funnel Analitiği, Hata Yönetimi, Sayfalama, UI Debt ve Performans Standartları
- **Hedef**: Ürün ve mühendislik kararlarını gerçek gözlemlenebilirlik ve sürdürülebilir kaliteye bağlamak
- **Durum**: P5 Yol Haritası Referans Dokümanı

---

## 1. Funnel Telemetrisi ve Mahremiyet Sözleşmesi

Orkestra pazaryerinde dönüşüm oranları ve kullanıcı akışları, kullanıcının açık rızası (`ankara_analytics_consent = 'accepted'`) temelinde izlenir.

### 1.1. Olay Sözleşmesi (`ALLOWED_EVENTS`)
Yalnızca önceden tanımlanmış olaylar kaydedilebilir:
- **Keşif ve Sihirbaz**: `service_search`, `service_selected`, `wizard_started`, `wizard_completed`, `wizard_abandoned`, `draft_resumed`, `quote_profile_opened`.
- **Kimlik Doğrulama Dönüşü**: `auth_return_completed`, `auth_return_failed` (Dönüş hedefi ve servis tipi ile).
- **Güvenilirlik ve Mükerrer Engeli**: `duplicate_submission_blocked`, `realtime_reconnected`, `realtime_disconnected`.
- **Teklif Yaşam Döngüsü**: `first_quote_received` (İlk teklife kadar geçen süre / SLA ölçümü), `first_qualified_quote_received`, `quote_accepted`, `quote_rejected`.
- **İş ve Kapsam**: `job_completed`, `job_cancelled`, `dispute_opened`, `scope_change_proposed`, `scope_change_accepted`, `scope_change_rejected`.

### 1.2. Sıfır Kişisel Veri (PII) Garantisi
`sanitizeProperties` filtresi, telemetri yükünden aşağıdaki hassas alanları koşulsuz temizler:
- `email`, `phone`, `address_line`, `body`, `password`, `token`, `full_name`, `name`, `display_name`, `tc_no`, `details`, `notes`, `description`, `original_name`, `storage_path`, `answers`.

---

## 2. Genel Public Hata Standardı ve Correlation ID

Tüm API uç noktaları, hata durumunda standart ve tutarlı bir JSON gövdesi döner:

```json
{
  "error": "Kullanıcıya gösterilebilir güvenli Türkçe mesaj",
  "code": "POSTGRES_OR_DOMAIN_CODE",
  "correlationId": "err_k2l9x_a1b2c"
}
```

### 2.1. Standartlaşma Kuralları
1. **İç Detayların Gizlenmesi**: Ham SQL, veritabanı yığın izi veya bağlantı detayları asla istemciye aktarılmaz (`mapDatabaseError`).
2. **Correlation ID İzlenebilirliği**: Her hata için benzersiz bir `err_<timestamp>_<random>` anahtarı üretilir.
3. **İstemci Sunumu**: `workspaceMutation` ve wizard bileşenleri, hata mesajının yanına `(err_...)` referansını ekler. Destek taleplerinde bu ID üzerinden log araması yapılır.
4. **Önbellek Koruması**: Tüm hata yanıtlarında `Cache-Control: private, no-store` başlığı zorunludur (`jsonApiError`).

---

## 3. Uzun Listeler, Sayfalama ve Hata İzolasyonu

Veritabanı okuma başarısızlıklarının boş liste gibi algılanmasını önlemek için tüm listelerde katı durum ayrımı uygulanır:

| Ekran | Sayfa Boyutu (PageSize) | Hata Durumu | Boş Durum |
| :--- | :--- | :--- | :--- |
| **Müşteri Talepleri** (`/taleplerim`) | 12 | `role="alert"` + `Talepler yüklenemedi` | `Henüz talebiniz yok` |
| **Usta Fırsatları** (`/usta/talepler`) | 12 | `role="alert"` + Hata bildirimi | `Uygun talep bulunamadı` |
| **İşlerim** (`/islerim`) | 12 | `role="alert"` + `İşler yüklenemedi` | `Henüz iş kaydınız yok` |
| **Usta Başvuruları** (`/yonetim/usta-basvurulari`) | 12 | `role="alert"` + `Kuyruk yüklenemedi` | `İncelenecek başvuru yok` |
| **Uyuşmazlık Merkezi** (`/yonetim/uyusmazliklar`) | 15 | `role="alert"` + `Uyuşmazlık kuyruğu yüklenemedi` | `Uyuşmazlık kuyruğu temiz` |

Tüm listelerde `count: 'exact'` sorgusu ve `Pagination` bileşeni ile sayfa numaralandırması sağlanır.

---

## 4. Performans ve Teknik Borç (UI Debt) Backlog'u

### 4.1. Inline Stilleri Azaltma Yolu
- **Mevcut Durum**: 47 inline style (Bütçe: Maksimum 71).
- **Hedef**: Sıfır inline style. Tüm bileşenlerin semantik CSS sınıflarına taşınması.
- **P5 Kazanımı**: `/yonetim/uyusmazliklar` sayfasındaki `style={{ maxWidth: ... }}` vb. satırlar `.admin-queue-container` ve `.admin-queue-header` sınıflarına taşınarak borç düşürülmüştür.

### 4.2. Varlık ve Görsel Optimizasyonu
- Avif ve WebP formatlarının varsayılan kılınması.
- Usta profil görsellerinde responsive `srcset` ve `sizes` kullanımı.
- Hero ve harita varlıklarının `loading="lazy"` ve `decoding="async"` ile gecikmeli yüklenmesi.

### 4.3. Vinext Sunucu Yaşam Döngüsü
- `SIGTERM` ve `SIGINT` sinyallerinde mevcut isteklerin tamamlanmasını bekleyen (graceful shutdown) mekanizması.
- Arka plan işlemlerinin bağlantı havuzunu tüketmeden güvenle sonlandırılması.
