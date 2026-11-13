# The Resort Platform

Mobile-first resort operations demo built with Next.js, TypeScript, Tailwind,
and Supabase. Product scope, database boundaries, roles, and acceptance gates are
in [CONTRACT.md](./CONTRACT.md) and [AGENTS.md](./AGENTS.md).

## Recommended development setup

- **Web hosting:** Vercel connected to this GitHub repository.
- **Database/auth/storage/realtime:** Supabase-managed PostgreSQL.
- **Local PostgreSQL:** optional; not required to start. Hosted development
  database is simpler; use Docker with the Supabase CLI if local testing is wanted.
- **Backend:** Supabase only. Do not add Firebase or mirror data in a second store.

Read [docs/START-HERE.md](./docs/START-HERE.md) before creating services. Its
free-tier caveats matter: Supabase Free can pause inactive projects and is not
the right availability target for a real pilot. Vercel Hobby is intended for
personal, non-commercial use; check the current vendor plans/terms for a public
business demo.

## Database

The initial migration is
[supabase/migrations/20261113190000_initial_schema.sql](./supabase/migrations/20261113190000_initial_schema.sql).
It includes RLS policies, a private ticket-photo bucket, ticket/role guards, audit
events, notifications, and a serialized amenity-capacity check. Apply it only to
a new development project first:

```sh
npx supabase login
npx supabase link --project-ref YOUR_DEV_PROJECT_REF
npx supabase db push
```

Then run `supabase/seed.sql` in that dev project's SQL editor. Seed rows are
synthetic and use zero prices until management supplies verified values. Test
role access and the migration on a fresh project before any production use.

## Secrets and local config

Copy `.env.example` to `.env.local` for local work. `.env.local`, service-account
JSON, and private keys are ignored by Git. Never put
`SUPABASE_SERVICE_ROLE_KEY` in browser code, tracked MCP configs, or agent prompts.
Only the Supabase URL and publishable/anon key belong in browser variables;
enforce access with RLS.

MCP files are optional examples, not required for setup. Review server source and
permissions before running any MCP server; begin without write-capable database
tools. Project guidance is under `.agents/skills/` and
`.agents/subagents/`.

## Run locally

```sh
npm install
npm run dev
```

Without Supabase environment variables, the app opens in a clearly labeled,
interactive preview using synthetic records. Preview changes stay in browser
memory and are not saved. To use Supabase, create `.env.local` from
`.env.example`, apply the migration and development seed, create the demo Auth
users, then set the public URL and anon key. Sign-in is at `/login`.

Run the local checks before opening a pull request:

```sh
npm run typecheck
npm run lint
npm run build
```

Manager/admin ticket assignment is protected by Supabase RLS. Realtime updates
are subscribed for tickets, facilities, and the signed-in user's notifications;
enable those tables in the `supabase_realtime` publication in the Supabase
Dashboard. Connect the GitHub repository to a Vercel Preview environment only
after reviewing the initial deployment settings. Do not push or deploy without
review.

## Known limitations

- Hosted Supabase Auth, queries, RLS, Storage, and Realtime have not been tested
  because this project has not been configured with hosted credentials. Apply
  the migration to a development project and verify all five roles before a
  public demo.
- Ticket photos use the private-storage contract but upload/view workflows are
  not yet implemented.
- User administration, profile management, real payments, and Avantio
  connectivity are not implemented.
- The migration uses an exact amenity start timestamp as the capacity slot. Add
  configurable duration/opening-hours rules only after requirements are confirmed.
- Sample records and prices are synthetic; replace them only with verified
  development data.
