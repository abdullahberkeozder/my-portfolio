alter function public.create_job_review(uuid,integer,text) set schema private;
revoke execute on function private.create_job_review(uuid,integer,text) from public,anon;
grant execute on function private.create_job_review(uuid,integer,text) to authenticated;

create function public.create_job_review(p_job_id uuid,p_rating integer,p_comment text default null)
returns public.reviews language sql security invoker set search_path=''
as $$ select private.create_job_review(p_job_id,p_rating,p_comment); $$;
revoke execute on function public.create_job_review(uuid,integer,text) from public,anon;
grant execute on function public.create_job_review(uuid,integer,text) to authenticated;

alter function public.moderate_entity(text,uuid,text,text) set schema private;
revoke execute on function private.moderate_entity(text,uuid,text,text) from public,anon;
grant execute on function private.moderate_entity(text,uuid,text,text) to authenticated;

create function public.moderate_entity(p_entity_type text,p_entity_id uuid,p_action text,p_reason text)
returns public.moderation_decisions language sql security invoker set search_path=''
as $$ select private.moderate_entity(p_entity_type,p_entity_id,p_action,p_reason); $$;
revoke execute on function public.moderate_entity(text,uuid,text,text) from public,anon;
grant execute on function public.moderate_entity(text,uuid,text,text) to authenticated;
