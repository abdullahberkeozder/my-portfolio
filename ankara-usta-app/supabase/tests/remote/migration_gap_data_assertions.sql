-- Assert the same synthetic v20 identities and relationships after v32.
do $$
begin
  if (select count(*) from public.service_requests
      where id between '44444444-4444-4444-8444-444444444441'::uuid
                   and '44444444-4444-4444-8444-444444444446'::uuid
        and customer_id = '11111111-1111-4111-8111-111111111111'
        and routing_mode = 'open' and target_professional_id is null) <> 6 then
    raise exception 'Migration changed or removed a synthetic request';
  end if;

  if (select count(*) from public.service_requests
      where id between '44444444-4444-4444-8444-444444444441'::uuid
                   and '44444444-4444-4444-8444-444444444446'::uuid
        and ((status = 'draft' and answers = '{}'::jsonb and submitted_at is null)
          or (status = 'matching' and answers = '{"fixture":"migration-gap"}'::jsonb
              and district = 'Çankaya' and neighborhood = 'Kızılay' and submitted_at = '2026-11-01 10:00:00+00'::timestamptz))) <> 6 then
    raise exception 'Migration changed synthetic request state or content';
  end if;

  if (select count(*) from public.service_requests
      where (id, delivery_model, status) in (
        ('44444444-4444-4444-8444-444444444441'::uuid, 'package', 'draft'),
        ('44444444-4444-4444-8444-444444444442'::uuid, 'quote', 'draft'),
        ('44444444-4444-4444-8444-444444444443'::uuid, 'inspection', 'draft'),
        ('44444444-4444-4444-8444-444444444444'::uuid, 'package', 'matching'),
        ('44444444-4444-4444-8444-444444444445'::uuid, 'quote', 'matching'),
        ('44444444-4444-4444-8444-444444444446'::uuid, 'inspection', 'matching')
      )) <> 6 then
    raise exception 'Migration changed synthetic request status or delivery model';
  end if;

  if (select count(*) from public.quotes q
      join public.service_requests r on r.id = q.request_id
      join public.tradesperson_profiles p on p.user_id = q.tradesperson_id
      where r.id = '44444444-4444-4444-8444-444444444445'
        and r.customer_id = '11111111-1111-4111-8111-111111111111'
        and q.status = 'submitted' and q.version = 1
        and ((q.id = '66666666-6666-4666-8666-666666666661' and p.user_id = '22222222-2222-4222-8222-222222222222' and q.labor_amount_kurus = 85000)
          or (q.id = '66666666-6666-4666-8666-666666666662' and p.user_id = '33333333-3333-4333-8333-333333333333' and q.labor_amount_kurus = 92000))) <> 2 then
    raise exception 'Migration changed synthetic quote state or relationships';
  end if;
end;
$$;
