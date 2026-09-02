-- M3: participant-only pre-job text conversations. Requires M1 and M2.
create table public.request_conversations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id),
  customer_id uuid not null references auth.users(id),
  professional_id uuid not null references public.tradesperson_profiles(user_id),
  last_sequence bigint not null default 0 check(last_sequence>=0),
  customer_read_sequence bigint not null default 0,
  professional_read_sequence bigint not null default 0,
  created_at timestamptz not null default now(),
  unique(request_id,professional_id),
  check(customer_id<>professional_id),
  check(customer_read_sequence between 0 and last_sequence),
  check(professional_read_sequence between 0 and last_sequence)
);
create index request_conversations_customer_idx on public.request_conversations(customer_id,created_at desc);
create index request_conversations_professional_idx on public.request_conversations(professional_id,created_at desc);
alter table public.request_conversations enable row level security;
revoke all on public.request_conversations from public,anon,authenticated;
grant select on public.request_conversations to authenticated;
create policy "conversation participants read" on public.request_conversations for select to authenticated
  using(customer_id=(select auth.uid()) or professional_id=(select auth.uid()));

create table public.request_conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.request_conversations(id),
  sequence bigint not null check(sequence>0),
  sender_id uuid not null references auth.users(id),
  body text not null check(length(trim(body)) between 1 and 4000),
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  unique(conversation_id,sequence),
  unique(conversation_id,sender_id,idempotency_key)
);
alter table public.request_conversation_messages enable row level security;
revoke all on public.request_conversation_messages from public,anon,authenticated;
grant select on public.request_conversation_messages to authenticated;
create policy "conversation participants read messages" on public.request_conversation_messages for select to authenticated
  using(exists(select 1 from public.request_conversations c where c.id=conversation_id));
create function private.prevent_request_message_mutation() returns trigger language plpgsql set search_path='' as $$
begin raise exception 'Messages are append-only' using errcode='23514'; end $$;
revoke all on function private.prevent_request_message_mutation() from public,anon,authenticated;
create trigger request_messages_immutable before update or delete on public.request_conversation_messages
  for each row execute function private.prevent_request_message_mutation();

create function private.request_conversation(
  p_request_id uuid,p_professional_id uuid,p_action text default 'fetch',
  p_body text default null,p_key uuid default null,p_after bigint default 0
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  actor uuid:=auth.uid(); r public.service_requests%rowtype; c public.request_conversations%rowtype;
  previous public.request_conversation_messages%rowtype; eligible boolean; writable boolean;
  page jsonb; cursor_value bigint; unread_count bigint; job_id uuid; ack uuid;
begin
  if actor is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_action is null or p_action not in ('fetch','send','read') or p_after is null or p_after<0 then
    raise exception 'Invalid conversation action' using errcode='22023';
  end if;
  -- Same first lock as accept_quote and invitation responses: no send can race past acceptance.
  select * into r from public.service_requests where id=p_request_id for update;
  if not found or p_professional_id is null or r.customer_id=p_professional_id
    or actor not in (r.customer_id,p_professional_id) then
    raise exception 'Conversation unavailable' using errcode='42501';
  end if;
  select * into c from public.request_conversations
    where request_id=r.id and professional_id=p_professional_id for update;
  eligible:=private.direct_target_eligible(p_professional_id,r.service_id,r.district) and (
    (r.routing_mode='direct' and r.target_professional_id=p_professional_id and exists(
      select 1 from public.request_invitations i where i.request_id=r.id and i.professional_id=p_professional_id
      and (i.status='quoted' or (i.status='awaiting' and i.response_due_at>clock_timestamp()))
    )) or (r.routing_mode='open' and exists(
      select 1 from public.request_matches m where m.request_id=r.id and m.tradesperson_id=p_professional_id
    ))
  );
  writable:=coalesce(eligible,false) and r.status in ('submitted','matching','quotes_received');
  -- Previous participants retain their own history, even after expiry, rejection or acceptance.
  if c.id is null and not writable then raise exception 'Conversation unavailable' using errcode='42501'; end if;
  if p_action='send' then
    if p_key is null or p_body is null or length(trim(p_body)) not between 1 and 4000 then
      raise exception 'Invalid message' using errcode='22023';
    end if;
    select * into previous from public.request_conversation_messages
      where conversation_id=c.id and sender_id=actor and idempotency_key=p_key;
    if found then
      if previous.body<>trim(p_body) then raise exception 'Idempotency payload mismatch' using errcode='23514'; end if;
      ack:=previous.id;
    else
      if not writable then raise exception 'Conversation is read only' using errcode='23514'; end if;
      if c.id is null then
        insert into public.request_conversations(request_id,customer_id,professional_id)
          values(r.id,r.customer_id,p_professional_id) returning * into c;
      end if;
      update public.request_conversations set last_sequence=last_sequence+1 where id=c.id returning * into c;
      insert into public.request_conversation_messages(conversation_id,sequence,sender_id,body,idempotency_key)
        values(c.id,c.last_sequence,actor,trim(p_body),p_key) returning id into ack;
    end if;
  elsif p_action='read' and c.id is not null then
    if p_after>c.last_sequence then raise exception 'Read cursor beyond history' using errcode='22023'; end if;
    update public.request_conversations set
      customer_read_sequence=case when actor=customer_id then greatest(customer_read_sequence,p_after) else customer_read_sequence end,
      professional_read_sequence=case when actor=professional_id then greatest(professional_read_sequence,p_after) else professional_read_sequence end
      where id=c.id returning * into c;
  end if;
  select coalesce(jsonb_agg(to_jsonb(m) order by m.sequence),'[]'::jsonb),coalesce(max(m.sequence),p_after)
    into page,cursor_value from (
      select id,sequence,sender_id,body,created_at from public.request_conversation_messages
      where conversation_id=c.id and sequence>p_after order by sequence limit 100
    ) m;
  select count(*) into unread_count from public.request_conversation_messages m
    where m.conversation_id=c.id and m.sender_id<>actor
    and m.sequence>case when actor=c.customer_id then c.customer_read_sequence else c.professional_read_sequence end;
  select j.id into job_id from public.jobs j
    where j.request_id=r.id and j.customer_id=r.customer_id and j.tradesperson_id=p_professional_id;
  return jsonb_build_object('conversationId',c.id,'messages',page,'cursor',cursor_value,
    'hasMore',cursor_value<coalesce(c.last_sequence,0),'unreadCount',unread_count,
    'canSend',writable,'jobId',job_id,'acknowledgedId',ack);
end $$;
revoke all on function private.request_conversation(uuid,uuid,text,text,uuid,bigint) from public,anon;
grant execute on function private.request_conversation(uuid,uuid,text,text,uuid,bigint) to authenticated;
create function public.request_conversation(
  p_request_id uuid,p_professional_id uuid,p_action text default 'fetch',
  p_body text default null,p_key uuid default null,p_after bigint default 0
) returns jsonb language sql security invoker set search_path='' as $$
  select private.request_conversation(p_request_id,p_professional_id,p_action,p_body,p_key,p_after)
$$;
revoke all on function public.request_conversation(uuid,uuid,text,text,uuid,bigint) from public,anon;
grant execute on function public.request_conversation(uuid,uuid,text,text,uuid,bigint) to authenticated;
