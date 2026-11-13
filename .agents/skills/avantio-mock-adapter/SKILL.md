---
name: avantio-mock-adapter
description: Mock Avantio booking adapter with fixtures until real API access arrives. Use for bookings and availability data.
---
# avantio-mock-adapter
- Avantio API access has NOT been received. Do not call it or guess endpoints.
- Define BookingSource { listStays(range), getAvailability(unitId, range) }.
- Implement MockBookingSource returning fixtures from supabase/seed.sql stays.
- When management supplies API docs and keys: add AvantioBookingSource read-only behind an env flag, and run the same contract tests against both implementations.
