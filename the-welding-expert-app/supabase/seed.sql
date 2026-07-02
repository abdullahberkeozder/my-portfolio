-- =============================================================================
-- Umut Usta Randevu Sistemi — Seed Verisi
-- =============================================================================
-- Bu dosya başlangıç takvim verilerini oluşturur.
-- Schema kurulumu için önce welding_appointments_schema.sql çalıştırın,
-- ardından bu dosyayı Supabase SQL Editor'den çalıştırın.
--
-- GÜVENLİ: ON CONFLICT DO NOTHING kullanıldığı için tekrar çalıştırmak
-- admin tarafından yapılmış değişiklikleri (kapalı günler, dolu slotlar)
-- bozmaz.
-- =============================================================================

-- 180 günlük müsaitlik günleri oluştur (sadece yoksa)
insert into public.appointment_availability_days (work_date, status, note)
select
  day_value::date,
  'available',
  'Ortalama iş süresi iki saattir. 09:00 - 21:00 arasında randevu alınabilir.'
from generate_series(
  current_date,
  current_date + interval '180 days',
  interval '1 day'
) as generated_days(day_value)
on conflict (work_date) do nothing;

-- Her müsait gün için 2 saatlik randevu slotları oluştur (09:00-21:00, sadece yoksa)
insert into public.appointment_availability_slots (day_id, slot_time)
select d.id, make_time(hour_value, 0, 0)
from public.appointment_availability_days d
cross join generate_series(9, 19, 2) as hours(hour_value)
where d.work_date between current_date and current_date + 180
on conflict (day_id, slot_time) do nothing;

-- =============================================================================
-- Notlar:
-- • slot_time = '09:00' => müşteride '09:00 - 11:00' olarak görünür
-- • Belirli slotları kapatmak için:
--     update public.appointment_availability_slots
--     set is_available = false
--     where day_id = (
--       select id from public.appointment_availability_days
--       where work_date = current_date + 1
--     )
--     and slot_time in ('09:00', '13:00');
--
-- • İlk admini onaylamak için:
--     update public.admin_profiles
--     set role = 'admin', is_active = true
--     where user_id = (
--       select id from auth.users where email = 'admin@example.com'
--     );
-- =============================================================================
