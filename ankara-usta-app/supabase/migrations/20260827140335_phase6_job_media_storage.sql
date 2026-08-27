insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('job-media','job-media',false,15728640,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy "job participants upload work media" on storage.objects for insert to authenticated
with check (
  bucket_id='job-media'
  and (storage.foldername(name))[2]=(select auth.uid())::text
  and exists(select 1 from public.jobs j where j.id::text=(storage.foldername(name))[1] and (select auth.uid()) in (j.customer_id,j.tradesperson_id))
);
create policy "job participants read work media" on storage.objects for select to authenticated
using (
  bucket_id='job-media'
  and exists(select 1 from public.jobs j where j.id::text=(storage.foldername(name))[1] and ((select auth.uid()) in (j.customer_id,j.tradesperson_id) or (select private.is_admin())))
);
create policy "authors delete pending work media" on storage.objects for delete to authenticated
using (
  bucket_id='job-media' and owner_id=(select auth.uid())::text
  and not exists(select 1 from public.work_log_entries e where e.storage_path=name and e.moderation_status='approved')
);
