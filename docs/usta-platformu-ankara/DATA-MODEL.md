# Taksonomi ve Veri Modeli Taslağı

Bu belge `service-taxonomy.json` içeriğinin ileride PostgreSQL/Supabase gibi ilişkisel bir veritabanına aktarılma sözleşmesidir. Henüz teknoloji seçimi veya migration değildir.

## Taksonomi ayrımı

- `service_categories`: Beş ana hizmet alanı
- `services`: Talebe bağlanan gerçek hizmetler
- `service_aliases`: Gündelik adlar ve eş anlamlılar
- `service_problem_phrases`: Serbest metni hizmete yönlendiren örnekler
- `service_scope_items`: Dahil/hariç kapsam
- `service_questions`: Hizmete özel talep soruları
- `provider_services`: Ustanın sunduğu hizmetler
- `service_areas`: Ankara ilçe ve mahalleleri
- `provider_service_areas`: Ustanın hizmet bazında kapsadığı bölgeler

Kullanıcıya görünen ad değişebilse de ilişkiler kalıcı `key` alanlarıyla kurulmalıdır.

## Önerilen tablo haritası

```text
profiles
├── customer_profiles
├── provider_profiles
└── staff_profiles

service_categories
└── services
    ├── service_aliases
    ├── service_problem_phrases
    ├── service_scope_items
    ├── service_questions
    └── service_required_credentials

providers
├── provider_services
├── provider_service_areas
├── provider_credentials
├── provider_portfolio_cases
└── provider_metrics

service_areas

service_requests
├── request_answers
├── request_media
├── request_matches
├── quotes
│   └── quote_versions
├── conversations
│   └── messages
└── jobs
    ├── job_status_events
    ├── job_scope_changes
    ├── job_journal_entries
    ├── job_media
    ├── warranties
    ├── reviews
    └── disputes
```

## Çekirdek alanlar

### `services`

```text
id uuid primary key
category_id uuid foreign key
key text unique not null
name text not null
description text
delivery_model enum(package, quote, discovery)
requires_discovery boolean
is_active boolean
sort_order integer
created_at timestamptz
updated_at timestamptz
```

### `provider_services`

```text
provider_id uuid
service_id uuid
experience_years integer nullable
discovery_fee numeric nullable
discovery_fee_deductible boolean
base_price numeric nullable
is_active boolean
approval_status enum(pending, approved, rejected, suspended)
primary key(provider_id, service_id)
```

### `service_areas`

```text
id uuid primary key
city_code text default '06'
district_key text
district_name text
neighborhood_key text nullable
neighborhood_name text nullable
is_launch_area boolean
is_active boolean
```

Tam adres bu tabloda tutulmaz. Müşterinin açık adresi erişimi sınırlı talep/iş konum kaydında bulunur.

### `service_requests`

```text
id uuid primary key
customer_id uuid
service_id uuid nullable
raw_problem_text text
classification_confidence numeric nullable
delivery_model enum(package, quote, discovery)
district_id uuid
neighborhood_id uuid nullable
address_private jsonb nullable
urgency enum(flexible, scheduled, same_day, urgent)
status enum(submitted, matching, quotes_received, provider_selected, cancelled, expired)
structured_scope jsonb
created_at timestamptz
```

Ham problem metni ile sistemin çıkardığı yapılandırılmış kapsam ayrı tutulur. Böylece yanlış sınıflandırmalar denetlenebilir.

### `quotes` ve `quote_versions`

Teklif kimliği sabit, içeriği sürümlüdür. Her sürüm şunları kapsar:

- İşçilik ve malzeme bedeli
- Malzemeyi sağlayacak taraf
- Dahil ve hariç kapsam
- Başlangıç ve süre tahmini
- Keşif koşulu
- Garanti
- Geçerlilik tarihi
- Usta açıklaması

Kabul edilmiş sürüm değiştirilemez. Ek iş `job_scope_changes` ile oluşturulur ve iki tarafın onayıyla geçerli olur.

### `jobs`

```text
id uuid primary key
request_id uuid unique
provider_id uuid
accepted_quote_version_id uuid
status enum(provider_selected, discovery_scheduled, in_progress,
  awaiting_customer_approval, completed, warranty_active, closed,
  cancelled, disputed)
started_at timestamptz nullable
completed_at timestamptz nullable
warranty_ends_at timestamptz nullable
```

Her durum değişikliği ayrıca `job_status_events` tablosunda aktör, zaman ve açıklamayla tutulur.

## Öncesi–sonrası kuralları

Medya türleri:

```text
request_problem
before
during
material
after
independent_reference
dispute_evidence
```

Bir vaka ancak şu koşullarla `platform_verified_completed_job` olabilir:

1. Platformdaki bir işe bağlıdır.
2. En az bir `before` ve bir `after` medyası vardır.
3. Müşteri işi kabul etmiştir veya tanımlı itiraz süresi dolmuştur.
4. Medya yayın izni kaydedilmiştir.

Ustanın dışarıda tamamladığı işler `independent_reference` olarak etiketlenir ve platform işi metriklerine katılmaz.

## Mahalle temelli gizlilik

- Tam adres yalnızca seçilen usta ve gerekli operasyon rolleriyle paylaşılır.
- Teklif öncesinde ilçe, yaklaşık mahalle ve gerekli erişim koşulları gösterilir.
- Kamuya açık mahalle metriği için başlangıçta en az 5 iş/değerlendirme şartı uygulanır.
- Eşik sağlanmazsa ilçe istatistiği gösterilir.
- Ad, telefon, açık adres ve bina/site bilgileri kamuya açıklanmaz.
- Site/apartman referansı yalnızca yetkili onay ve yayın izniyle adlandırılır.

## Sorun metni sınıflandırma çıktısı

```json
{
  "service_key": "water_leak_diagnosis",
  "confidence": 0.86,
  "alternatives": ["drain_unblocking"],
  "risk_flags": ["property_damage"],
  "next_question_keys": ["leak_continuity", "affected_floor"]
}
```

Bu sonuç tavsiyedir. Kullanıcı hizmet özetini onaylamadan talep yayımlanmaz.

## Ankara arz kontrolü

Her `service × district` için şu değerler izlenir:

- Onaylı aktif usta sayısı
- Son 30 günde yanıt veren usta sayısı
- Medyan ilk yanıt süresi
- Açık talep/usta oranı
- Tamamlanan iş sayısı

Arz eşiğinin altında anlık eşleşme vaadi yerine bekleme listesi veya manuel yönlendirme sunulur.

## JSON içe aktarma kuralları

1. `schema_version` kaydedilir.
2. Kategori ve hizmetler `key` üzerinden upsert edilir.
3. Kaldırılan hizmet silinmez, pasife alınır.
4. Alias ve problem ifadeleri normalize edilerek benzersizleştirilir.
5. Güncel fiyatlar taksonomi JSON'una gömülmez; bölge ve tarih bazlı ayrı kayıtlarda tutulur.
6. Taksonomi değişikliği eski taleplerin kapsam geçmişini değiştirmez.
7. Yönetim değişiklikleri denetim kaydı üretir.

## Sonraki araştırmalar

- Ankara'nın resmi ilçe ve mahalle verisinin yetkili kaynaktan alınması
- Hizmet sorularının tipleri ve doğrulama kuralları
- Paketlerin adet, ölçü ve yüzey türü varyantları
- Tehlikeli işler için zorunlu mesleki belge/mevzuat doğrulaması
- Ankara başlangıç fiyatlarının saha görüşmeleriyle belirlenmesi
- Ardışık işler: örneğin kaçak tespiti sonrası tesisat, sıva ve boya

