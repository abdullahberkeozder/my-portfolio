-- Role-protected gallery table and public Supabase Storage bucket.
-- Run after role_based_access_control.sql.

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null default 'Genel',
  location text,
  image_url text not null,
  before_image_url text,
  before_label text default 'Öncesi',
  after_label text default 'Sonrası',
  points text[],
  price_tagline text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gallery_items
  alter column sort_order set default 0,
  alter column sort_order set not null,
  alter column is_published set default true,
  alter column is_published set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

create index if not exists gallery_items_public_order_idx
  on public.gallery_items(is_published, sort_order, created_at desc);

drop trigger if exists set_gallery_items_updated_at
on public.gallery_items;

create trigger set_gallery_items_updated_at
before update on public.gallery_items
for each row execute function public.set_updated_at();

alter table public.gallery_items enable row level security;

grant select on public.gallery_items to anon, authenticated;
grant insert, update, delete on public.gallery_items to authenticated;

drop policy if exists "Public read" on public.gallery_items;
drop policy if exists "Authenticated write" on public.gallery_items;
drop policy if exists "Public can read published gallery items"
  on public.gallery_items;
drop policy if exists "Gallery managers can read all gallery items"
  on public.gallery_items;
drop policy if exists "Gallery managers can insert gallery items"
  on public.gallery_items;
drop policy if exists "Gallery managers can update gallery items"
  on public.gallery_items;
drop policy if exists "Gallery managers can delete gallery items"
  on public.gallery_items;

create policy "Public can read published gallery items"
on public.gallery_items
for select
to anon, authenticated
using (is_published = true);

create policy "Gallery managers can read all gallery items"
on public.gallery_items
for select
to authenticated
using (public.has_admin_role(array['owner', 'admin']));

create policy "Gallery managers can insert gallery items"
on public.gallery_items
for insert
to authenticated
with check (public.has_admin_role(array['owner', 'admin']));

create policy "Gallery managers can update gallery items"
on public.gallery_items
for update
to authenticated
using (public.has_admin_role(array['owner', 'admin']))
with check (public.has_admin_role(array['owner', 'admin']));

create policy "Gallery managers can delete gallery items"
on public.gallery_items
for delete
to authenticated
using (public.has_admin_role(array['owner', 'admin']));

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'gallery',
  'gallery',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public gallery read" on storage.objects;
drop policy if exists "Authenticated gallery upload" on storage.objects;
drop policy if exists "Authenticated gallery delete" on storage.objects;
drop policy if exists "Gallery images are public" on storage.objects;
drop policy if exists "Gallery managers can upload images" on storage.objects;
drop policy if exists "Gallery managers can update images" on storage.objects;
drop policy if exists "Gallery managers can delete images" on storage.objects;

create policy "Gallery images are public"
on storage.objects
for select
to public
using (bucket_id = 'gallery');

create policy "Gallery managers can upload images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'gallery'
  and public.has_admin_role(array['owner', 'admin'])
);

create policy "Gallery managers can update images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'gallery'
  and public.has_admin_role(array['owner', 'admin'])
)
with check (
  bucket_id = 'gallery'
  and public.has_admin_role(array['owner', 'admin'])
);

create policy "Gallery managers can delete images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'gallery'
  and public.has_admin_role(array['owner', 'admin'])
);

notify pgrst, 'reload schema';

-- Verification:
-- select id, title, category, is_published, sort_order
-- from public.gallery_items
-- order by sort_order, created_at desc;
