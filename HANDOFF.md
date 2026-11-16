# HANDOFF

## Current task
Switch Cafe table amenity to Restaurant across the application.

## Status (done / in progress / blocked)
Done. Amenity renamed from "Cafe table" to "Restaurant" with the dining emoji (`🍽️`) across UI components, demo mock data, and database seed fixtures.

## Files touched (path - what changed)
- `src/components/workspace/workspace.tsx` - Updated `amenityEmojis` map to associate `"Restaurant"` and `"Restaurant table"` with `🍽️`.
- `src/lib/demo-data.ts` - Updated amenity mock fixture id `amenity-5` name from `"Cafe table"` to `"Restaurant"`.
- `supabase/seed.sql` - Updated seed amenities insert to use `'Restaurant'` instead of `'Cafe table'`.

## Key decisions and why
- Kept both `"Restaurant"` and `"Restaurant table"` mapped in `amenityEmojis` for backwards compatibility with any persisted database rows.
- Replaced coffee icon `☕` with dining icon `🍽️` for visual alignment with restaurant facilities.

## Next steps (ordered)
- User testing in mobile emulator at `/emulator.html` or live Vercel URL.

## Where to look (graph nodes, symbols, line ranges)
- `src/components/workspace/workspace.tsx` (line ~188)
- `src/lib/demo-data.ts` (line ~60)
- `supabase/seed.sql` (line ~15)
- `https://resortpms-retromadees-projects.vercel.app/`

## Gotchas / commands to run (tests, build)
- `npm run typecheck && npm test && npm run test:ui && npm run build`
