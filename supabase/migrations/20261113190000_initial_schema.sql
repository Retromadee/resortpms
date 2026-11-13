create type public.user_role as enum ('guest', 'resident', 'worker', 'management', 'admin');
create type public.unit_status as enum ('for_sale', 'for_rent', 'bnb', 'owner_occupied', 'maintenance');
create type public.ticket_status as enum ('open', 'assigned', 'in_progress', 'done');
create type public.ticket_priority as enum ('low', 'medium', 'high');
create type public.facility_status as enum ('ok', 'attention', 'closed');
create type public.reservation_status as enum ('confirmed', 'cancelled');

create table public.units (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  unit_type text not null default 'apartment',
  status public.unit_status not null default 'for_rent',
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role public.user_role not null default 'guest',
  unit_id uuid references public.units(id),
  lang text not null default 'en' check (lang in ('en', 'tr', 'ru')),
  created_at timestamptz not null default now()
);

create function public.app_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role from public.profiles p where p.id = auth.uid()
$$;

create function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.app_role() in ('management', 'admin'), false)
$$;

create function public.guard_profile_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() = old.id and public.app_role() <> 'admin' then
    if new.role is distinct from old.role or new.unit_id is distinct from old.unit_id then
      raise exception 'Only an admin may change a profile role or unit';
    end if;
  end if;
  return new;
end
$$;
create trigger profiles_guard_changes
  before update on public.profiles
  for each row execute function public.guard_profile_changes();

create table public.stays (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id),
  guest_id uuid not null references public.profiles(id),
  check_in date not null,
  check_out date not null check (check_out > check_in),
  source text not null default 'mock'
);
create index stays_guest_dates_idx on public.stays (guest_id, check_in, check_out);

create table public.amenities (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  capacity_per_slot integer not null default 1 check (capacity_per_slot > 0),
  price_guest numeric(10, 2) not null default 0 check (price_guest >= 0),
  price_resident numeric(10, 2) not null default 0 check (price_resident >= 0),
  currency text not null default 'EUR' check (currency in ('GBP', 'EUR', 'USD', 'TRY'))
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  amenity_id uuid not null references public.amenities(id),
  party_id uuid not null references public.profiles(id) default auth.uid(),
  starts_at timestamptz not null,
  party_size integer not null default 1 check (party_size > 0),
  status public.reservation_status not null default 'confirmed',
  created_at timestamptz not null default now()
);
create index reservations_amenity_slot_idx on public.reservations (amenity_id, starts_at)
  where status = 'confirmed';
create index reservations_party_created_idx on public.reservations (party_id, created_at desc);

create function public.guard_reservation_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.app_role() not in ('management', 'admin') then
    if new.party_id is distinct from old.party_id
      or new.amenity_id is distinct from old.amenity_id
      or new.starts_at is distinct from old.starts_at
      or new.party_size is distinct from old.party_size then
      raise exception 'Guests and residents may only cancel their own reservation';
    end if;
  end if;
  return new;
end
$$;
create trigger reservations_guard_changes
  before update on public.reservations
  for each row execute function public.guard_reservation_changes();

create function public.enforce_reservation_capacity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  slot_capacity integer;
  reserved integer;
begin
  if new.status <> 'confirmed' then
    return new;
  end if;

  -- Serialize capacity checks for an amenity so concurrent requests cannot overbook a slot.
  select a.capacity_per_slot into slot_capacity
    from public.amenities a where a.id = new.amenity_id for update;
  if slot_capacity is null then
    raise exception 'Amenity not found';
  end if;

  select coalesce(sum(r.party_size), 0) into reserved
    from public.reservations r
    where r.amenity_id = new.amenity_id
      and r.starts_at = new.starts_at
      and r.status = 'confirmed'
      and r.id <> new.id;

  if reserved + new.party_size > slot_capacity then
    raise exception 'Slot is full';
  end if;
  return new;
end
$$;
create trigger reservations_enforce_capacity
  before insert or update of amenity_id, starts_at, party_size, status on public.reservations
  for each row execute function public.enforce_reservation_capacity();

create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  status public.facility_status not null default 'ok',
  last_checked_at timestamptz,
  last_checked_by uuid references public.profiles(id)
);

create table public.inspections (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id),
  done_by uuid not null references public.profiles(id) default auth.uid(),
  readings jsonb not null default '{}',
  result public.facility_status not null default 'ok',
  note text,
  photo_path text,
  created_at timestamptz not null default now()
);
create index inspections_facility_created_idx on public.inspections (facility_id, created_at desc);

create table public.tickets (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  location text not null,
  unit_id uuid references public.units(id),
  facility_id uuid references public.facilities(id),
  priority public.ticket_priority not null default 'medium',
  status public.ticket_status not null default 'open',
  created_by uuid not null references public.profiles(id) default auth.uid(),
  assigned_to uuid references public.profiles(id),
  photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (unit_id is not null or facility_id is not null)
);
create index tickets_assigned_status_idx on public.tickets (assigned_to, status);
create index tickets_creator_created_idx on public.tickets (created_by, created_at desc);

create function public.guard_worker_ticket_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.app_role() = 'worker' then
    if old.assigned_to is distinct from auth.uid() then
      raise exception 'Workers may only update tickets assigned to them';
    end if;
    if new.title is distinct from old.title
      or new.location is distinct from old.location
      or new.unit_id is distinct from old.unit_id
      or new.facility_id is distinct from old.facility_id
      or new.priority is distinct from old.priority
      or new.created_by is distinct from old.created_by
      or new.assigned_to is distinct from old.assigned_to
      or new.created_at is distinct from old.created_at then
      raise exception 'Workers cannot change ticket ownership or routing fields';
    end if;
    if new.status is distinct from old.status
      and not (
        (old.status = 'assigned' and new.status = 'in_progress')
        or (old.status = 'in_progress' and new.status = 'done')
      ) then
      raise exception 'Invalid worker ticket status transition';
    end if;
  end if;
  new.updated_at = now();
  return new;
end
$$;
create function public.guard_ticket_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_staff() then
    if new.status <> 'open' or new.assigned_to is not null then
      raise exception 'Only management may assign or advance a new ticket';
    end if;
    if public.app_role() = 'resident' and new.unit_id is not null
      and not exists (
        select 1 from public.profiles p where p.id = auth.uid() and p.unit_id = new.unit_id
      ) then
      raise exception 'Residents may only create tickets for their own unit';
    end if;
    if public.app_role() = 'guest' and new.unit_id is not null
      and not exists (
        select 1 from public.stays s
        where s.guest_id = auth.uid() and s.unit_id = new.unit_id
          and current_date between s.check_in and s.check_out
      ) then
      raise exception 'Guests may only create tickets for their current stay';
    end if;
  end if;
  return new;
end
$$;
create trigger tickets_guard_insert
  before insert on public.tickets
  for each row execute function public.guard_ticket_insert();

create trigger tickets_guard_worker_update
  before update on public.tickets
  for each row execute function public.guard_worker_ticket_update();

create table public.ticket_comments (
  id bigint generated always as identity primary key,
  ticket_id bigint not null references public.tickets(id) on delete cascade,
  author_id uuid not null references public.profiles(id) default auth.uid(),
  body text not null check (length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);

create table public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_created_idx on public.notifications (user_id, created_at desc);

create table public.payments_demo (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) default auth.uid(),
  reservation_id uuid references public.reservations(id),
  amount numeric(10, 2) not null check (amount >= 0),
  currency text not null default 'EUR' check (currency in ('GBP', 'EUR', 'USD', 'TRY')),
  method text not null default 'demo',
  status text not null default 'demo_paid' check (status = 'demo_paid'),
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  detail jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index audit_events_created_idx on public.audit_events (created_at desc);

create function public.log_audit_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed_id text;
  event_detail jsonb;
begin
  changed_id := coalesce(to_jsonb(new)->>'id', '');
  if tg_table_name = 'units' then
    event_detail := jsonb_build_object('status', to_jsonb(new)->'status');
    if tg_op = 'UPDATE' then
      event_detail := jsonb_build_object(
        'from', to_jsonb(old)->'status',
        'to', to_jsonb(new)->'status'
      );
    end if;
  elsif tg_table_name = 'tickets' then
    event_detail := jsonb_build_object(
      'status', to_jsonb(new)->'status',
      'assigned_to', to_jsonb(new)->'assigned_to'
    );
    if tg_op = 'UPDATE' then
      event_detail := jsonb_build_object(
        'status_from', to_jsonb(old)->'status',
        'status_to', to_jsonb(new)->'status',
        'assigned_to_from', to_jsonb(old)->'assigned_to',
        'assigned_to_to', to_jsonb(new)->'assigned_to'
      );
    end if;
  elsif tg_table_name = 'facilities' then
    event_detail := jsonb_build_object(
      'from', to_jsonb(old)->'status',
      'to', to_jsonb(new)->'status'
    );
  else
    event_detail := jsonb_build_object(
      'role_from', to_jsonb(old)->'role',
      'role_to', to_jsonb(new)->'role'
    );
  end if;

  insert into public.audit_events(actor_id, action, entity, entity_id, detail)
  values (auth.uid(), lower(tg_op), tg_table_name, changed_id, event_detail);
  return new;
end
$$;
create trigger audit_unit_changes after insert or update of status on public.units
  for each row execute function public.log_audit_event();
create trigger audit_ticket_changes after insert or update of status, assigned_to on public.tickets
  for each row execute function public.log_audit_event();
create trigger audit_facility_status_changes after update of status on public.facilities
  for each row when (old.status is distinct from new.status)
  execute function public.log_audit_event();
create trigger audit_profile_role_changes after update of role on public.profiles
  for each row when (old.role is distinct from new.role)
  execute function public.log_audit_event();

create function public.notify_ticket_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.assigned_to is distinct from old.assigned_to and new.assigned_to is not null then
    insert into public.notifications(user_id, body)
    values (new.assigned_to, 'A ticket has been assigned to you.');
  end if;
  if new.status is distinct from old.status then
    insert into public.notifications(user_id, body)
    values (new.created_by, 'The status of your request has changed.');
  end if;
  return new;
end
$$;
create trigger tickets_notify_changes
  after update of assigned_to, status on public.tickets
  for each row execute function public.notify_ticket_changes();

create function public.apply_inspection_to_facility()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.facilities
    set status = new.result, last_checked_at = new.created_at, last_checked_by = new.done_by
    where id = new.facility_id;
  return new;
end
$$;
create trigger inspections_apply_to_facility
  after insert on public.inspections
  for each row execute function public.apply_inspection_to_facility();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles(id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.units enable row level security;
alter table public.profiles enable row level security;
alter table public.stays enable row level security;
alter table public.amenities enable row level security;
alter table public.reservations enable row level security;
alter table public.facilities enable row level security;
alter table public.inspections enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_comments enable row level security;
alter table public.notifications enable row level security;
alter table public.payments_demo enable row level security;
alter table public.audit_events enable row level security;

create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_staff());
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid() or public.app_role() = 'admin')
  with check (
    public.app_role() = 'admin'
    or (id = auth.uid() and role = public.app_role())
  );

create policy units_select on public.units for select to authenticated using (
  public.is_staff()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.unit_id = units.id)
  or exists (select 1 from public.stays s where s.unit_id = units.id and s.guest_id = auth.uid())
  or exists (select 1 from public.tickets t where t.unit_id = units.id and t.assigned_to = auth.uid())
);
create policy units_staff_write on public.units for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy stays_select on public.stays for select to authenticated
  using (guest_id = auth.uid() or public.is_staff());
create policy stays_staff_write on public.stays for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy amenities_select on public.amenities for select to authenticated
  using (auth.uid() is not null);
create policy amenities_staff_write on public.amenities for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy reservations_select on public.reservations for select to authenticated
  using (party_id = auth.uid() or public.is_staff());
create policy reservations_insert on public.reservations for insert to authenticated
  with check (
    party_id = auth.uid()
    and public.app_role() in ('guest', 'resident')
  );
create policy reservations_update on public.reservations for update to authenticated
  using (party_id = auth.uid() or public.is_staff())
  with check (party_id = auth.uid() or public.is_staff());

create policy facilities_select on public.facilities for select to authenticated
  using (public.app_role() in ('resident', 'worker', 'management', 'admin'));
create policy facilities_staff_write on public.facilities for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy inspections_select on public.inspections for select to authenticated
  using (done_by = auth.uid() or public.is_staff());
create policy inspections_insert on public.inspections for insert to authenticated
  with check (
    done_by = auth.uid()
    and public.app_role() in ('worker', 'management', 'admin')
  );

create policy tickets_select on public.tickets for select to authenticated
  using (created_by = auth.uid() or assigned_to = auth.uid() or public.is_staff());
create policy tickets_insert on public.tickets for insert to authenticated
  with check (
    created_by = auth.uid()
    and public.app_role() in ('guest', 'resident', 'worker', 'management', 'admin')
  );
create policy tickets_update on public.tickets for update to authenticated
  using (public.is_staff() or assigned_to = auth.uid())
  with check (public.is_staff() or assigned_to = auth.uid());

create policy ticket_comments_select on public.ticket_comments for select to authenticated
  using (exists (select 1 from public.tickets t where t.id = ticket_id));
create policy ticket_comments_insert on public.ticket_comments for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (select 1 from public.tickets t where t.id = ticket_id)
  );

create policy notifications_select on public.notifications for select to authenticated
  using (user_id = auth.uid());
create policy notifications_update on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy payments_demo_select on public.payments_demo for select to authenticated
  using (user_id = auth.uid() or public.is_staff());
create policy payments_demo_insert on public.payments_demo for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.reservations r
      where r.id = reservation_id and r.party_id = auth.uid()
    )
  );

create policy audit_events_admin_select on public.audit_events for select to authenticated
  using (public.app_role() = 'admin');

grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
revoke all on public.audit_events from authenticated;
grant select on public.audit_events to authenticated;

revoke all on function public.app_role() from public, anon;
revoke all on function public.is_staff() from public, anon;
grant execute on function public.app_role() to authenticated;
grant execute on function public.is_staff() to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ticket-photos', 'ticket-photos', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy ticket_photos_select on storage.objects for select to authenticated
  using (
    bucket_id = 'ticket-photos'
    and exists (
      select 1 from public.tickets t
      where t.id::text = (storage.foldername(name))[2]
    )
  );
create policy ticket_photos_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'ticket-photos'
    and (storage.foldername(name))[1] = 'tickets'
    and (storage.foldername(name))[3] = auth.uid()::text
    and exists (
      select 1 from public.tickets t
      where t.id::text = (storage.foldername(name))[2]
        and (t.created_by = auth.uid() or t.assigned_to = auth.uid() or public.is_staff())
    )
  );

alter publication supabase_realtime add table public.tickets;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.facilities;
alter publication supabase_realtime add table public.reservations;
