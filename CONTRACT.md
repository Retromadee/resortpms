# Demo contract

This is the initial implementation contract for the five-day demo. It supersedes
the longer Agile schedule for the demo timeline; the broader research plan remains
useful for future phases. Record any change here before parallel implementation.

## Stack and data ownership

- Next.js App Router, TypeScript, Tailwind, installable PWA.
- Supabase Auth, PostgreSQL with RLS, private Storage, and Realtime.
- Vercel hosts the web app. Use a separate Supabase development project.
- PostgreSQL is the only source of truth for application data.
- Supabase is the only backend. Do not add Firebase, Firestore, or a duplicate data store.
- Avantio and payment systems are interfaces with mock/demo implementations only.

## Roles

| Role | Access contract |
| --- | --- |
| guest | Own current stay, reservations, tickets, and notifications |
| resident | Own profile and unit, own reservations/tickets, facility status |
| worker | Assigned tickets, allowed ticket progress, facility checks |
| management | Operational data, assignment, unit/facility management |
| admin | Management access plus user roles and audit history |

Roles are stored in `profiles.role`; client-supplied role values are never trusted.
Only admins may change a user's role or assigned unit.

## Initial tables

`profiles`, `units`, `stays`, `amenities`, `reservations`, `facilities`,
`inspections`, `tickets`, `ticket_comments`, `notifications`, `payments_demo`,
and `audit_events`. All application tables have RLS enabled.
Ticket photos are private objects in the `ticket-photos` bucket.

## Initial route areas

- `/login`, `/profile`, `/notifications`
- `/guest`, `/resident`, `/bookings`, `/requests`
- `/worker/tasks`, `/worker/facilities`
- `/management/dashboard`, `/management/tickets`, `/management/units`
- `/admin/users`, `/admin/audit`

These are route areas, not a finished UI specification. The owning UI agents must
keep each common worker/resident action within three taps and add route-level
authorization as a second layer behind RLS.

## Business rules

- Ticket lifecycle: `open` → `assigned` → `in_progress` → `done`.
- Workers may only progress tickets assigned to them; they cannot change ticket
  ownership or routing fields.
- Reservation capacity is checked in PostgreSQL for each amenity and exact slot
  timestamp, including concurrent requests.
- Unit status changes and ticket status/assignment changes create audit events.
- Payments are explicitly demo-only. No real card data or payment provider.
- Do not add real guest, resident, or staff data until privacy and legal review.

## Acceptance gates

1. Apply migrations to a fresh development database and run the seed script.
2. Verify permitted and forbidden reads/writes for all five roles.
3. Test capacity races and ticket status/ownership rules at the database layer.
4. Run unit, browser, mobile-width, accessibility, and realtime isolation tests.
5. Deploy to Vercel preview and rehearse the demo before production.
