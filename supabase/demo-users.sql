-- ============================================================================
-- The Resort Platform: In-House Postgres User Provisioning & Demo Fixtures
-- Run this directly in the Supabase SQL Editor.
-- Safe to re-run anytime: updates passwords, auto-confirms emails, seeds fixtures.
-- ============================================================================

create extension if not exists pgcrypto;

-- 1. Provision all in-house user credentials directly in Postgres auth.users
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'admin.demo@example.test', extensions.crypt('DemoAdmin123!', extensions.gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Admin Demo"}', now(), now()),

  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'manager.demo@example.test', extensions.crypt('DemoManager123!', extensions.gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Management Demo"}', now(), now()),

  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'worker.demo@example.test', extensions.crypt('DemoWorker123!', extensions.gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Worker Demo"}', now(), now()),

  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'resident.demo@example.test', extensions.crypt('DemoResident123!', extensions.gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Resident Demo"}', now(), now()),

  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'guest.demo@example.test', extensions.crypt('DemoGuest123!', extensions.gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Guest Demo"}', now(), now())
on conflict (email) do update
set encrypted_password = excluded.encrypted_password,
    email_confirmed_at = now(),
    updated_at = now();

-- 2. Ensure profile records exist for all in-house accounts
insert into public.profiles (id, full_name, role)
select au.id, coalesce(au.raw_user_meta_data->>'full_name', ''), 'guest'::public.user_role
from auth.users au
where not exists (select 1 from public.profiles p where p.id = au.id)
on conflict (id) do nothing;

-- 3. Assign in-house operational roles & unit assignments
update public.profiles p
set role = assignments.role,
    full_name = assignments.full_name,
    unit_id = case
      when assignments.role = 'resident' then (
        select u.id from public.units u where u.code = 'DEMO-A-101'
      )
      else null
    end
from auth.users au
join (values
  ('guest.demo@example.test', 'Guest Demo', 'guest'::public.user_role),
  ('resident.demo@example.test', 'Resident Demo', 'resident'::public.user_role),
  ('worker.demo@example.test', 'Worker Demo', 'worker'::public.user_role),
  ('manager.demo@example.test', 'Management Demo', 'management'::public.user_role),
  ('admin.demo@example.test', 'Admin Demo', 'admin'::public.user_role)
) as assignments(email, full_name, role) on lower(au.email) = assignments.email
where p.id = au.id;

-- 4. Synthetic operational tickets
alter table public.tickets disable trigger user;
insert into public.tickets
  (title, description, location, unit_id, facility_id, priority, status, created_by, assigned_to)
select fixture.title, fixture.description, fixture.location, u.id, f.id,
       fixture.priority::public.ticket_priority, fixture.status::public.ticket_status,
       creator.id, assignee.id
from (values
  ('Air conditioning not cooling', 'Bedroom unit needs a check.', 'DEMO-A-204 · Bedroom', 'DEMO-A-204', null, 'high', 'in_progress', 'resident.demo@example.test', 'worker.demo@example.test'),
  ('Pool gate latch is loose', 'The gate does not close smoothly.', 'Outdoor pool', null, 'Outdoor pool', 'medium', 'assigned', 'worker.demo@example.test', 'worker.demo@example.test'),
  ('Fresh towels requested', 'Two additional bath towels, please.', 'DEMO-A-204 · Guest stay', 'DEMO-A-204', null, 'low', 'open', 'guest.demo@example.test', null),
  ('Garden path light is out', 'Near the west walkway.', 'Gardens and paths', null, 'Gardens and paths', 'medium', 'assigned', 'resident.demo@example.test', 'worker.demo@example.test'),
  ('Kitchen tap dripping', 'Small leak under the sink.', 'DEMO-B-105 · Kitchen', 'DEMO-B-105', null, 'low', 'done', 'resident.demo@example.test', 'worker.demo@example.test')
) as fixture(title, description, location, unit_code, facility_name, priority, status, creator_email, assignee_email)
join auth.users creator on lower(creator.email) = fixture.creator_email
left join auth.users assignee on lower(assignee.email) = fixture.assignee_email
left join public.units u on u.code = fixture.unit_code
left join public.facilities f on f.name = fixture.facility_name
where not exists (
  select 1 from public.tickets existing where existing.title = fixture.title
);
alter table public.tickets enable trigger user;

-- 5. Active stay for guest
insert into public.stays (unit_id, guest_id, check_in, check_out, source)
select u.id, au.id, current_date, current_date + 3, 'demo'
from public.units u
join auth.users au on lower(au.email) = 'guest.demo@example.test'
where u.code = 'DEMO-A-204'
  and not exists (select 1 from public.stays s where s.guest_id = au.id and s.unit_id = u.id);

-- 6. Reservations
insert into public.reservations (amenity_id, party_id, starts_at, party_size, status)
select a.id, au.id, now() + fixture.hours * interval '1 hour', fixture.party_size,
       'confirmed'::public.reservation_status
from (values
  ('Spa', 2, 2, 'guest.demo@example.test'),
  ('Paddle court', 4, 2, 'resident.demo@example.test'),
  ('Hamam', 25, 1, 'guest.demo@example.test')
) as fixture(amenity_name, hours, party_size, email)
join public.amenities a on a.name = fixture.amenity_name
join auth.users au on lower(au.email) = fixture.email
where not exists (
  select 1 from public.reservations r
  where r.amenity_id = a.id and r.party_id = au.id and r.status = 'confirmed'
);

-- 7. In-app notifications
insert into public.notifications (user_id, body, read)
select au.id, fixture.body, fixture.read
from (values
  ('manager.demo@example.test', 'Ticket queue has been updated.', false),
  ('manager.demo@example.test', 'Pool inspection completed.', false),
  ('guest.demo@example.test', 'Your amenity booking is confirmed.', false)
) as fixture(email, body, read)
join auth.users au on lower(au.email) = fixture.email
where not exists (
  select 1 from public.notifications n where n.user_id = au.id and n.body = fixture.body
);
