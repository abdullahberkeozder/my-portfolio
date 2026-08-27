create or replace function private.upsert_request_draft(
  p_idempotency_key uuid,
  p_service_id text,
  p_delivery_model text,
  p_answers jsonb,
  p_district text default null,
  p_neighborhood text default null,
  p_preferred_timing text default null
)
returns public.service_requests
language plpgsql security definer set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  request_row public.service_requests%rowtype;
begin
  if actor is null then raise exception 'Authentication required'; end if;
  if p_service_id !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    or p_delivery_model not in ('package','quote','inspection')
    or jsonb_typeof(p_answers)<>'object' then
    raise exception 'Draft fields are invalid';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(actor::text||p_idempotency_key::text,0));
  select * into request_row
  from public.service_requests
  where customer_id=actor and idempotency_key=p_idempotency_key
  for update;

  if found then
    if request_row.service_id<>p_service_id or request_row.delivery_model<>p_delivery_model then
      raise exception 'Idempotency key belongs to a different service request';
    end if;
    if request_row.status<>'draft' then return request_row; end if;

    update public.service_requests set
      answers=p_answers,
      district=nullif(trim(p_district),''),
      neighborhood=nullif(trim(p_neighborhood),''),
      preferred_timing=nullif(trim(p_preferred_timing),'')
    where id=request_row.id returning * into request_row;
    return request_row;
  end if;

  insert into public.service_requests(
    customer_id,service_id,delivery_model,status,answers,district,neighborhood,
    preferred_timing,idempotency_key
  ) values (
    actor,p_service_id,p_delivery_model,'draft',p_answers,nullif(trim(p_district),''),
    nullif(trim(p_neighborhood),''),nullif(trim(p_preferred_timing),''),p_idempotency_key
  ) returning * into request_row;
  return request_row;
end;
$$;

revoke all on function private.upsert_request_draft(uuid,text,text,jsonb,text,text,text) from public,anon;
grant execute on function private.upsert_request_draft(uuid,text,text,jsonb,text,text,text) to authenticated;

create or replace function public.upsert_request_draft(
  p_idempotency_key uuid,
  p_service_id text,
  p_delivery_model text,
  p_answers jsonb,
  p_district text default null,
  p_neighborhood text default null,
  p_preferred_timing text default null
)
returns public.service_requests
language sql security invoker set search_path = ''
as $$
  select private.upsert_request_draft(
    p_idempotency_key,p_service_id,p_delivery_model,p_answers,
    p_district,p_neighborhood,p_preferred_timing
  )
$$;

revoke execute on function public.upsert_request_draft(uuid,text,text,jsonb,text,text,text) from public,anon;
grant execute on function public.upsert_request_draft(uuid,text,text,jsonb,text,text,text) to authenticated;
