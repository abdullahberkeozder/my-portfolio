create or replace function private.can_read_request(p_request_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.service_requests request
    where request.id=p_request_id
      and (
        request.customer_id=(select auth.uid())
        or exists (
          select 1
          from public.request_matches match
          where match.request_id=request.id
            and match.tradesperson_id=(select auth.uid())
        )
      )
  )
$$;

revoke execute on function private.can_read_request(uuid)
from public,anon,authenticated,service_role;

drop policy "customers and matched tradespeople read request scope"
on public.service_requests;

create policy "customers and matched tradespeople read request scope"
on public.service_requests for select to authenticated
using ((select private.can_read_request(id)));
