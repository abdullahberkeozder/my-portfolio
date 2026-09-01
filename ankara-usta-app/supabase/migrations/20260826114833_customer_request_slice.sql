create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  service_id text not null check (service_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  delivery_model text not null check (delivery_model in ('package', 'quote', 'inspection')),
  status text not null default 'draft' check (
    status in ('draft', 'submitted', 'matching', 'quotes_received', 'provider_selected', 'cancelled', 'expired')
  ),
  answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object'),
  district text,
  neighborhood text,
  preferred_timing text,
  idempotency_key uuid not null,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id, idempotency_key),
  check (status = 'draft' or (
    district is not null and length(trim(district)) > 0 and
    neighborhood is not null and length(trim(neighborhood)) > 0 and
    answers <> '{}'::jsonb and
    submitted_at is not null
  ))
);

create index service_requests_customer_updated_idx
  on public.service_requests (customer_id, updated_at desc);

create table public.request_media (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  content_type text not null check (content_type in ('image/jpeg', 'image/png', 'image/webp', 'video/mp4')),
  byte_size bigint not null check (byte_size > 0 and byte_size <= 52428800),
  created_at timestamptz not null default now()
);

create index request_media_request_idx on public.request_media (request_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger service_requests_set_updated_at
before update on public.service_requests
for each row execute function public.set_updated_at();

alter table public.service_requests enable row level security;
alter table public.request_media enable row level security;

create policy "customers read own requests"
on public.service_requests for select
to authenticated
using ((select auth.uid()) = customer_id);

create policy "customers create own requests"
on public.service_requests for insert
to authenticated
with check ((select auth.uid()) = customer_id and status = 'draft');

create policy "customers update own requests"
on public.service_requests for update
to authenticated
using ((select auth.uid()) = customer_id)
with check ((select auth.uid()) = customer_id);

create policy "customers read own media metadata"
on public.request_media for select
to authenticated
using ((select auth.uid()) = customer_id);

create policy "customers create own media metadata"
on public.request_media for insert
to authenticated
with check (
  (select auth.uid()) = customer_id and
  exists (
    select 1 from public.service_requests request
    where request.id = request_id and request.customer_id = (select auth.uid())
  )
);

revoke all on table public.service_requests from anon;
revoke all on table public.request_media from anon;
grant select, insert, update on table public.service_requests to authenticated;
grant select, insert on table public.request_media to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'request-media',
  'request-media',
  false,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "customers upload to own media folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'request-media' and
  (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "customers read own media objects"
on storage.objects for select
to authenticated
using (
  bucket_id = 'request-media' and
  (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "customers delete own draft media objects"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'request-media' and
  (storage.foldername(name))[1] = (select auth.uid())::text
);
