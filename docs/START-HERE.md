# Start here

## Recommended setup

Use a hosted Supabase project for PostgreSQL, Auth, private photo storage, and
Realtime. This is the least-work option for this kit: the security model and app
integration already depend on Supabase. You do not need PostgreSQL installed on
your Mac to begin.

- Use Supabase Free for development and disposable demo data. Current limits and
  inactivity pauses are listed on [Supabase pricing](https://supabase.com/pricing);
  free projects can pause after a week without activity and do not include
  downloadable database backups. Do not rely on Free for an always-on live pilot.
- For a continuously available public demo or real pilot, budget for a paid
  Supabase plan (the pricing page currently lists Pro from $25/month) and test
  backups/restores first. Recheck pricing before subscribing.
- Vercel Hobby is free for personal, non-commercial use; check the current
  [Vercel plans](https://vercel.com/pricing) and terms before a business-facing
  demo. Use the appropriate plan for commercial use.
- If you later want local PostgreSQL, install Docker Desktop/Colima and use the
  Supabase CLI local stack. This is optional; do not install PostgreSQL directly
  just to run queries.

## First hour checklist

1. Confirm this project is connected to `https://github.com/Retromadee/resortpms`.
   Do not push until the initial review is complete.
2. Create a **development-only** Supabase project in a region close to the
   expected demo users. Keep production and real guest data out of this project.
3. Install/use the Supabase CLI and link this folder to the development project:

   ```sh
   npx supabase login
   npx supabase link --project-ref YOUR_DEV_PROJECT_REF
   npx supabase db push
   ```

4. Run `supabase/seed.sql` in the linked development project's SQL editor. It
   contains synthetic units/facilities/amenities only, with no claimed resort
   inventory or real prices.
5. Create five accounts in Supabase Auth with the `@example.test` addresses
   listed in `supabase/demo-users.sql`. Run that file in the SQL editor to set
   development roles and the resident's synthetic unit. Never let a user choose
   their role in the client.
6. Copy `.env.example` to `.env.local`; fill the public Supabase URL/key. Keep
   the service-role key server-side only.
7. Connect the GitHub repo to Vercel and set the same public Supabase variables
   in the Vercel Preview environment. Do not enable production data yet.
8. Enable `tickets`, `facilities`, and `notifications` in the
   `supabase_realtime` publication from the Supabase Dashboard. Realtime is
   required for live workspace updates; RLS still controls which rows a user
   receives.
9. Run the app locally with `npm install` and `npm run dev`. Without Supabase
   environment variables it opens the synthetic, non-persistent preview.
   Configure `.env.local` before testing Auth-backed flows.
10. Before a Vercel preview, run `npm run typecheck`, `npm run lint`, and
    `npm run build`. Review the deployment and keep real guest/resident data out
    of the demo project.

## Backups

Do not use Firebase as a PostgreSQL backup. Firestore/Realtime Database do not
preserve PostgreSQL schema, constraints, transactions, or RLS behavior. Use
Supabase's documented backup/restore features on a paid project for a live pilot,
and keep a separate encrypted `pg_dump` copy in access-controlled storage with a
tested restore procedure. Free projects do not include downloadable database
backups; treat the development project as disposable.

The Firebase project is not used by this kit. Since an Admin SDK key file was
included in the supplied materials, revoke that key in Google Cloud IAM and
generate a replacement only if you later decide to use a server-side Firebase
integration. Do not commit the old or replacement key.

## Before any real use

- Fix and verify the full RLS matrix, including profile role/unit changes, ticket
  ownership, storage objects, reservations, and notifications.
- Add rate limits, email delivery configuration, error reporting, retention rules,
  backup/restore, and a production security review.
- Obtain appropriate legal/privacy review for guest and resident data.
- Do not activate real payments or Avantio API calls with
  production credentials in the demo.
