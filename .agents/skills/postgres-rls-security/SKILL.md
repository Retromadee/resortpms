---
name: postgres-rls-security
description: Rules for Postgres schema, row-level security, migrations and role tests. Use for any database or access-control change.
---
# postgres-rls-security
1. Enable RLS on every application table. No private table without policies and no broad `using (true)`.
2. Role comes from `profiles.role` via `public.app_role()`; never trust client claims.
3. Only admins may change a profile role or unit assignment. Test both paths.
4. Migrations live in `supabase/migrations`; do not edit a live database by hand.
5. Test allowed and forbidden reads/writes for every role and table, including storage objects and realtime.
6. Service-role key stays server-side only. Never ship it to the browser.
7. Photos use a private bucket with a per-ticket path and short-lived signed URLs.
8. Capacity and ticket status/assignment rules must be enforced in PostgreSQL, not only in UI code.
9. After any policy change rerun the full role test suite before merging.
