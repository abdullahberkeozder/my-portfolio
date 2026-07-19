# Sprint 6 Analytics Taxonomy

## Ortak alanlar

Her olay `event_name`, `session_id`, `created_at` ve düz `properties` nesnesi taşır. UTM varsa `source`, `medium`, `campaign`, `content`, `term` alanları oturum boyunca otomatik eklenir. Kişisel iletişim bilgileri analytics properties içine yazılmaz.

`operation_id` yalnız aynı işlemin retry veya tekrar render nedeniyle iki kez sayılmasını engellemek için kullanılır. Bilinçli ikinci müşteri işlemi yeni bir operation ID alır.

## Olay grupları

| Grup | Olaylar | Amaç |
| --- | --- | --- |
| Sayfa/CTA | `public_page_viewed`, `hero_cta_clicked`, `public_channel_clicked`, `navigation_cta_clicked` | Ziyaret ve iletişim başlangıcı |
| Randevu | `booking_wizard_started`, `booking_service_changed`, `booking_slot_selected`, `booking_step_completed` | Wizard ilerlemesi |
| Gönderim | `booking_validation_failed`, `booking_submission_started`, `booking_submitted`, `booking_submission_failed`, `booking_success_viewed` | Form performansı ve hata |
| WhatsApp | `booking_whatsapp_clicked`, `booking_success_whatsapp_clicked` | İletişim başlangıcı; satış değildir |
| Galeri | `gallery_case_viewed`, `gallery_filter_selected`, `gallery_booking_cta_clicked` | Vaka katkısı |
| Self-servis | `self_service_tracking_viewed`, `self_service_action_submitted`, `self_service_action_failed` | Takip, değişiklik ve iptal |

## İş metrikleri

Talep, onay, tamamlanan iş ve lead kalitesi `appointment_requests` tablosundan hesaplanır. Bu kapalı huni click event'lerinden türetilmez. WhatsApp tıklaması yalnız “iletişim başlangıcı” olarak adlandırılır; bir randevu kaydıyla eşleşmediği sürece talep veya satış sayılmaz.
