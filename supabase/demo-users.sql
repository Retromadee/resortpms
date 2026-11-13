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
    unit_id = case
      when assignments.role = 'resident' then (
        select u.id from public.units u where u.code = 'DEMO-A-101'
      )
      else null
    end
from auth.users au
join (values
  ('guest.demo@example.test', 'guest'::public.user_role),
  ('resident.demo@example.test', 'resident'::public.user_role),
  ('worker.demo@example.test', 'worker'::public.user_role),
  ('manager.demo@example.test', 'management'::public.user_role),
  ('admin.demo@example.test', 'admin'::public.user_role)
) as assignments(email, role) on lower(au.email) = assignments.email
where p.id = au.id;
