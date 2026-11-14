-- Run only in the development project's SQL editor after creating these five
-- synthetic accounts in Supabase Auth. Do not use real staff or guest accounts.
do $$
declare
  missing_emails text[];
begin
  select array_agg(expected.email)
    into missing_emails
    from (values
      ('guest.demo@example.test'),
      ('resident.demo@example.test'),
      ('worker.demo@example.test'),
      ('manager.demo@example.test'),
      ('admin.demo@example.test')
    ) as expected(email)
    left join auth.users u on lower(u.email) = expected.email
    where u.id is null;

  if missing_emails is not null then
    raise exception 'Create these development test accounts first: %', missing_emails;
  end if;
end
$$;

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

-- Synthetic live-demo fixtures. Safe to re-run in the development project.
-- These rows represent existing operational records, so bypass only the insert
-- guard while seeding as the database owner; normal client writes remain guarded.
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

insert into public.stays (unit_id, guest_id, check_in, check_out, source)
select u.id, au.id, current_date, current_date + 3, 'demo'
from public.units u
join auth.users au on lower(au.email) = 'guest.demo@example.test'
where u.code = 'DEMO-A-204'
  and not exists (select 1 from public.stays s where s.guest_id = au.id and s.unit_id = u.id);

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
