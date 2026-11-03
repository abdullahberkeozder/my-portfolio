-- Synthetic v20 data only. Runs in the disposable CI database before v21-v32.
begin;

insert into auth.users (id, email, raw_user_meta_data)
values
  ('11111111-1111-4111-8111-111111111111', 'migration-customer@fixture.invalid', '{"display_name":"Fixture Customer"}'::jsonb),
  ('22222222-2222-4222-8222-222222222222', 'migration-pro-one@fixture.invalid', '{"display_name":"Fixture Pro One"}'::jsonb),
  ('33333333-3333-4333-8333-333333333333', 'migration-pro-two@fixture.invalid', '{"display_name":"Fixture Pro Two"}'::jsonb);

-- The auth trigger grants customer by default; these two identities also act as professionals.
insert into public.user_roles (user_id, role)
values
  ('22222222-2222-4222-8222-222222222222', 'tradesperson'),
  ('33333333-3333-4333-8333-333333333333', 'tradesperson');

insert into public.tradesperson_profiles (user_id, display_name, bio)
values
  ('22222222-2222-4222-8222-222222222222', 'Fixture Pro One', 'Synthetic professional profile for isolated migration rehearsal.'),
  ('33333333-3333-4333-8333-333333333333', 'Fixture Pro Two', 'Synthetic professional profile for isolated migration rehearsal.');

insert into public.service_requests
  (id, customer_id, service_id, delivery_model, status, answers, district, neighborhood, preferred_timing, idempotency_key, submitted_at)
values
  ('44444444-4444-4444-8444-444444444441', '11111111-1111-4111-8111-111111111111', 'musluk-degisimi', 'package', 'draft', '{}'::jsonb, null, null, null, '55555555-5555-4555-8555-555555555551', null),
  ('44444444-4444-4444-8444-444444444442', '11111111-1111-4111-8111-111111111111', 'musluk-degisimi', 'quote', 'draft', '{}'::jsonb, null, null, null, '55555555-5555-4555-8555-555555555552', null),
  ('44444444-4444-4444-8444-444444444443', '11111111-1111-4111-8111-111111111111', 'musluk-degisimi', 'inspection', 'draft', '{}'::jsonb, null, null, null, '55555555-5555-4555-8555-555555555553', null),
  ('44444444-4444-4444-8444-444444444444', '11111111-1111-4111-8111-111111111111', 'musluk-degisimi', 'package', 'matching', '{"fixture":"migration-gap"}'::jsonb, 'Çankaya', 'Kızılay', 'Bu hafta', '55555555-5555-4555-8555-555555555554', '2026-11-01 10:00:00+00'),
  ('44444444-4444-4444-8444-444444444445', '11111111-1111-4111-8111-111111111111', 'musluk-degisimi', 'quote', 'matching', '{"fixture":"migration-gap"}'::jsonb, 'Çankaya', 'Kızılay', 'Bu hafta', '55555555-5555-4555-8555-555555555555', '2026-11-01 10:00:00+00'),
  ('44444444-4444-4444-8444-444444444446', '11111111-1111-4111-8111-111111111111', 'musluk-degisimi', 'inspection', 'matching', '{"fixture":"migration-gap"}'::jsonb, 'Çankaya', 'Kızılay', 'Bu hafta', '55555555-5555-4555-8555-555555555556', '2026-11-01 10:00:00+00');

insert into public.quotes
  (id, request_id, tradesperson_id, status, labor_amount_kurus, material_amount_kurus, estimated_duration_minutes, version)
values
  ('66666666-6666-4666-8666-666666666661', '44444444-4444-4444-8444-444444444445', '22222222-2222-4222-8222-222222222222', 'submitted', 85000, 10000, 90, 1),
  ('66666666-6666-4666-8666-666666666662', '44444444-4444-4444-8444-444444444445', '33333333-3333-4333-8333-333333333333', 'submitted', 92000, 8000, 120, 1);

do $$
begin
  if (select count(*) from public.service_requests where customer_id = '11111111-1111-4111-8111-111111111111') <> 6
     or (select count(*) from public.quotes where request_id = '44444444-4444-4444-8444-444444444445') <> 2
     or (select count(*) from public.tradesperson_profiles where user_id in
       ('22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333333')) <> 2
     or (select count(*) from public.user_roles where role = 'tradesperson' and user_id in
       ('22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333333')) <> 2 then
    raise exception 'Synthetic migration fixture is incomplete';
  end if;
end;
$$;

commit;
