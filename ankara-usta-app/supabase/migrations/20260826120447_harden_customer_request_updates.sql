drop policy "customers update own requests" on public.service_requests;

create policy "customers update own draft requests"
on public.service_requests for update
to authenticated
using ((select auth.uid()) = customer_id and status = 'draft')
with check ((select auth.uid()) = customer_id and status in ('draft', 'submitted'));

create or replace function public.protect_customer_request_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.customer_id <> old.customer_id
    or new.idempotency_key <> old.idempotency_key
    or new.service_id <> old.service_id
    or new.delivery_model <> old.delivery_model then
    raise exception 'Immutable request fields cannot be changed';
  end if;

  if old.status <> 'draft' then
    raise exception 'A submitted request cannot be edited by the customer';
  end if;

  if new.status not in ('draft', 'submitted') then
    raise exception 'Invalid customer request transition';
  end if;

  return new;
end;
$$;

create trigger service_requests_protect_customer_fields
before update on public.service_requests
for each row execute function public.protect_customer_request_fields();

drop policy "customers delete own draft media objects" on storage.objects;

create policy "customers delete media from own draft requests"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'request-media' and
  (storage.foldername(name))[1] = (select auth.uid())::text and
  exists (
    select 1
    from public.service_requests request
    where request.id::text = (storage.foldername(name))[2]
      and request.customer_id = (select auth.uid())
      and request.status = 'draft'
  )
);
