-- Sprint 3: immutable first-contact timestamp for operational KPI reporting.
-- Existing rows remain null because updated_at cannot reliably reconstruct first contact.

alter table public.appointment_requests
  add column if not exists first_contacted_at timestamptz;

create index if not exists appointment_requests_first_contacted_at_idx
  on public.appointment_requests(first_contacted_at)
  where first_contacted_at is not null;

create or replace function public.set_appointment_first_contacted_at()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'UPDATE' and old.first_contacted_at is not null then
    new.first_contacted_at := old.first_contacted_at;
    return new;
  end if;

  if new.status in ('contacted', 'confirmed', 'cancelled', 'completed')
    and (
      tg_op = 'INSERT'
      or old.status is distinct from new.status
    )
  then
    new.first_contacted_at := clock_timestamp();
  else
    new.first_contacted_at := null;
  end if;

  return new;
end;
$$;

drop trigger if exists set_appointment_first_contacted_at
on public.appointment_requests;

create trigger set_appointment_first_contacted_at
before insert or update of status, first_contacted_at
on public.appointment_requests
for each row execute function public.set_appointment_first_contacted_at();

revoke all on function public.set_appointment_first_contacted_at()
from public;

notify pgrst, 'reload schema';
