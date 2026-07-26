-- Sprint 9: private appointment photo attachments.

create table if not exists public.appointment_attachments (
  id uuid primary key default gen_random_uuid(),
  appointment_request_id uuid not null
    references public.appointment_requests(id) on delete cascade,
  storage_path text not null unique,
  media_type text not null
    check (media_type in ('image/jpeg', 'image/png', 'image/webp')),
  file_size integer not null
    check (file_size > 0 and file_size <= 5242880),
  created_at timestamptz not null default now()
);

create index if not exists appointment_attachments_request_idx
  on public.appointment_attachments(appointment_request_id, created_at);

create or replace function public.enforce_appointment_attachment_limit()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (
    select count(*)
    from public.appointment_attachments
    where appointment_request_id = new.appointment_request_id
  ) >= 3 then
    raise exception 'appointment_attachment_limit';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_appointment_attachment_limit
on public.appointment_attachments;

create trigger enforce_appointment_attachment_limit
before insert on public.appointment_attachments
for each row execute function public.enforce_appointment_attachment_limit();

alter table public.appointment_attachments enable row level security;
revoke all on public.appointment_attachments from anon;
grant select on public.appointment_attachments to authenticated;
grant select on public.appointment_requests to service_role;
grant all on public.appointment_attachments to service_role;

drop policy if exists "Team can read permitted appointment attachments"
on public.appointment_attachments;

create policy "Team can read permitted appointment attachments"
on public.appointment_attachments
for select
to authenticated
using (
  exists (
    select 1
    from public.appointment_requests request
    where request.id = appointment_request_id
      and (
        public.has_admin_role(array['owner', 'admin', 'operator'])
        or (
          public.has_admin_role(array['technician'])
          and request.assigned_to = auth.uid()
        )
      )
  )
);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'appointment-attachments',
  'appointment-attachments',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Team can read permitted appointment storage"
on storage.objects;

create policy "Team can read permitted appointment storage"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'appointment-attachments'
  and exists (
    select 1
    from public.appointment_attachments attachment
    join public.appointment_requests request
      on request.id = attachment.appointment_request_id
    where attachment.storage_path = name
      and (
        public.has_admin_role(array['owner', 'admin', 'operator'])
        or (
          public.has_admin_role(array['technician'])
          and request.assigned_to = auth.uid()
        )
      )
  )
);

comment on table public.appointment_attachments is
  'Private customer-supplied appointment photos. Remove storage objects and rows 90 days after the related request is archived.';

notify pgrst, 'reload schema';
