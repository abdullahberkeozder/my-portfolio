-- Keep both approval timestamps and the approved status in one statement so
-- scope_changes_check1 is never exposed to an invalid intermediate row.
create or replace function private.respond_scope_change(p_scope_change_id uuid,p_approve boolean)
returns public.scope_changes
language plpgsql security definer set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  actor_role text;
  job_row public.jobs%rowtype;
  change_row public.scope_changes%rowtype;
  customer_approved boolean;
  tradesperson_approved boolean;
begin
  select * into change_row from public.scope_changes where id=p_scope_change_id for update;
  select * into job_row from public.jobs where id=change_row.job_id for update;
  actor_role:=private.job_actor_role(job_row,actor);
  if actor_role is null or change_row.status<>'pending' or job_row.status in ('completed','cancelled') or (actor=change_row.proposed_by and actor_role<>'admin') then
    raise exception 'Scope response is not allowed';
  end if;

  if not p_approve then
    update public.scope_changes
    set status='rejected',decided_at=now(),updated_at=now()
    where id=p_scope_change_id returning * into change_row;
  else
    customer_approved := change_row.customer_approved_at is not null
      or actor=job_row.customer_id or actor_role='admin';
    tradesperson_approved := change_row.tradesperson_approved_at is not null
      or actor=job_row.tradesperson_id or actor_role='admin';

    update public.scope_changes set
      customer_approved_at=case when customer_approved then coalesce(customer_approved_at,now()) end,
      tradesperson_approved_at=case when tradesperson_approved then coalesce(tradesperson_approved_at,now()) end,
      status=case when customer_approved and tradesperson_approved then 'approved' else 'pending' end,
      decided_at=case when customer_approved and tradesperson_approved then now() else null end,
      updated_at=now()
    where id=p_scope_change_id returning * into change_row;
  end if;

  perform private.append_job_event(
    job_row.id,
    case when change_row.status='approved' then 'scope_change_approved'
      when change_row.status='rejected' then 'scope_change_rejected'
      else 'scope_change_partially_approved' end,
    actor,actor_role,jsonb_build_object('scope_change_id',change_row.id,'status',change_row.status)
  );
  return change_row;
end;
$$;

revoke all on function private.respond_scope_change(uuid,boolean) from public,anon;
grant execute on function private.respond_scope_change(uuid,boolean) to authenticated;
