---
name: resort-domain
description: Domain rules for The Resort Platform (units, roles, facilities, amenities, tickets). Use before designing any table, screen or workflow.
---
# resort-domain
- Unit status enum: for_sale, for_rent, bnb, owner_occupied, maintenance. Every change is audited.
- Roles: guest (own stay), resident (own unit + common-area status), worker (assigned tickets and facility checks), management (all operational data), admin (all + users + audit).
- Facilities: outdoor pool, indoor pool, paddle court, main lawn, gardens and paths. Status ok/attention/closed. An inspection updates it automatically.
- Amenities: spa, hamam, gym, paddle court, cafe table. Capacity per slot. Residents get a resident price tier.
- Ticket lifecycle: open -> assigned -> in_progress -> done. Priority low/medium/high.
- UI text lives in translation files (English now; Turkish and Russian later).
- Currencies are display only in the demo: GBP, EUR, USD, TRY.
