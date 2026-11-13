---
name: realtime-notifications
description: Live updates and in-app notifications using Supabase Realtime. Use when building dashboards, ticket boards or alerts.
---
# realtime-notifications
- Source of truth: PostgreSQL. `notifications` rows are created by database triggers for ticket assignment and status changes.
- Subscribe with Supabase Realtime to tickets, notifications, facilities, and reservations. RLS applies to realtime; test that users never receive rows they cannot read.
- This demo has no push-notification provider. Do not add Firebase or device-token storage.
- Keep reconnect handling and notification read state in Postgres; do not silently fall back to another database.
