# Graph Report - resort-pms-demo  (2026-11-14)

## Corpus Check
- 86 files · ~27,014 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 399 nodes · 380 edges · 75 communities (19 shown, 56 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `734ca6c1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- workspace.tsx
- database.types.ts
- AGENTS.md — The Resort Platform demo
- dependencies
- compilerOptions
- devDependencies
- isSupabaseConfigured
- include
- Demo contract
- layout.tsx
- Database
- avantio-mock-adapter/SKILL.md
- mobile-pwa-ui/SKILL.md
- payment-demo/SKILL.md
- postgres-rls-security/SKILL.md
- qa-review-gates/SKILL.md
- realtime-notifications/SKILL.md
- resort-domain/SKILL.md
- db-agent.md
- demo-agent.md
- integration-agent.md
- orchestrator.md
- qa-agent.md
- realtime-agent.md
- review-agents.md
- ui-guest-resident.md
- ui-worker-management.md
- eslint.config.mjs
- next.config.ts
- next-env.d.ts
- install-skills.sh script
- Changelog
- Writing Guidelines for Postgres References
- demo-data.ts
- Section Definitions
- database.types.ts
- Supabase Postgres Best Practices
- Workspace
- dateLabel
- advanced-full-text-search.md
- advanced-jsonb-indexing.md
- conn-idle-timeout.md
- conn-limits.md
- conn-pooling.md
- conn-prepared-statements.md
- data-batch-inserts.md
- data-n-plus-one.md
- data-pagination.md
- data-upsert.md
- lock-advisory.md
- lock-deadlock-prevention.md
- lock-short-transactions.md
- lock-skip-locked.md
- monitor-explain-analyze.md
- monitor-pg-stat-statements.md
- monitor-vacuum-analyze.md
- query-composite-indexes.md
- query-covering-indexes.md
- query-index-types.md
- query-missing-indexes.md
- query-partial-indexes.md
- schema-constraints.md
- schema-data-types.md
- schema-foreign-key-indexes.md
- schema-lowercase-identifiers.md
- schema-partitioning.md
- schema-primary-keys.md
- security-privileges.md
- security-rls-basics.md
- security-rls-performance.md
- _template.md
- app/page.tsx

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `Section Definitions` - 9 edges
3. `Changelog` - 8 edges
4. `Supabase` - 8 edges
5. `AGENTS.md — The Resort Platform demo` - 8 edges
6. `Writing Guidelines for Postgres References` - 7 edges
7. `Demo contract` - 7 edges
8. `include` - 7 edges
9. `Changelog` - 6 edges
10. `Key Principles` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Workspace()` --calls--> `createSupabaseBrowserClient()`  [EXTRACTED]
  src/components/workspace/workspace.tsx → src/lib/supabase/browser.ts

## Import Cycles
- None detected.

## Communities (75 total, 56 thin omitted)

### Community 0 - "workspace.tsx"
Cohesion: 0.09
Nodes (18): ActivityView(), amenityEmojis, facilityStatusTitles, FacilityTiles(), initials(), navByRole, NotificationsView(), relativeTime() (+10 more)

### Community 2 - "AGENTS.md — The Resort Platform demo"
Cohesion: 0.07
Nodes (26): AGENTS.md — The Resort Platform demo, Always, Product (keep it simple), Schedule (hours from start), Stack, Subagent rules, Thinking rules, This is NOT the Next.js you know (+18 more)

### Community 3 - "dependencies"
Cohesion: 0.09
Nodes (22): lucide-react, next, dependencies, lucide-react, next, react, react-dom, @supabase/ssr (+14 more)

### Community 4 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 5 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/turbopack, @types/node (+9 more)

### Community 6 - "isSupabaseConfigured"
Cohesion: 0.24
Nodes (7): DEMO_USERS, quickDemoSignIn(), signIn(), signUp(), DEMO_ROLES, errors, LoginPageProps

### Community 7 - "include"
Cohesion: 0.10
Nodes (20): [0.1.3](https://github.com/supabase/agent-skills/compare/v0.1.2...v0.1.3) (2026-06-02), [0.1.4](https://github.com/supabase/agent-skills/compare/v0.1.3...v0.1.4) (2026-06-05), [0.1.5](https://github.com/supabase/agent-skills/compare/v0.1.4...v0.1.5) (2026-07-10), [0.1.6](https://github.com/supabase/agent-skills/compare/v0.1.5...supabase-v0.1.6) (2026-07-30), [0.1.7](https://github.com/supabase/agent-skills/compare/v0.1.6...supabase-v0.1.7) (2026-08-12), [0.1.8](https://github.com/supabase/agent-skills/compare/v0.1.7...supabase-v0.1.8) (2026-09-24), [0.1.9](https://github.com/supabase/agent-skills/compare/v0.1.8...supabase-v0.1.9) (2026-09-28), Bug Fixes (+12 more)

### Community 8 - "Demo contract"
Cohesion: 0.11
Nodes (15): Fix suggestion, Source, What happened, Skill Feedback, Steps, Core Principles, Debugging, Making and Committing Schema Changes (+7 more)

### Community 32 - "Changelog"
Cohesion: 0.12
Nodes (16): [1.2.0](https://github.com/supabase/agent-skills/compare/v1.1.1...v1.2.0) (2026-06-02), [1.3.0](https://github.com/supabase/agent-skills/compare/v1.2.0...v1.3.0) (2026-06-05), [1.4.0](https://github.com/supabase/agent-skills/compare/v1.3.0...v1.4.0) (2026-07-10), [1.5.0](https://github.com/supabase/agent-skills/compare/supabase-postgres-best-practices-v1.4.0...supabase-postgres-best-practices-v1.5.0) (2026-07-30), [1.6.0](https://github.com/supabase/agent-skills/compare/supabase-postgres-best-practices-v1.5.0...supabase-postgres-best-practices-v1.6.0) (2026-07-30), Bug Fixes, Bug Fixes, Bug Fixes (+8 more)

### Community 33 - "Writing Guidelines for Postgres References"
Cohesion: 0.12
Nodes (15): 1. Concrete Transformation Patterns, 2. Error-First Structure, 3. Quantified Impact, 4. Self-Contained Examples, 5. Semantic Naming, Code Example Standards, Comments, Impact Level Guidelines (+7 more)

### Community 34 - "demo-data.ts"
Cohesion: 0.11
Nodes (16): Facility, Notification, Reservation, Stay, Unit, demoAmenities, demoAuditEvents, demoFacilities (+8 more)

### Community 35 - "Section Definitions"
Cohesion: 0.20
Nodes (9): 1. Query Performance (query), 2. Connection Management (conn), 3. Security & RLS (security), 4. Schema Design (schema), 5. Concurrency & Locking (lock), 6. Data Access Patterns (data), 7. Monitoring & Diagnostics (monitor), 8. Advanced Features (advanced) (+1 more)

### Community 36 - "database.types.ts"
Cohesion: 0.12
Nodes (16): Amenity, AuditEvent, Database, DemoPayment, FacilityStatus, Inspection, Profile, ReservationStatus (+8 more)

### Community 37 - "Supabase Postgres Best Practices"
Cohesion: 0.33
Nodes (5): How to Use, References, Rule Categories by Priority, Supabase Postgres Best Practices, When to Apply

### Community 38 - "Workspace"
Cohesion: 0.38
Nodes (7): getDefaultView(), getInitialView(), isFacilityRecord(), isNotificationRecord(), isRecord(), isTicketRecord(), Workspace()

### Community 39 - "dateLabel"
Cohesion: 0.40
Nodes (5): dateLabel(), FacilitiesView(), OverviewView(), ReservationList(), UnitsView()

## Knowledge Gaps
- **213 isolated node(s):** `DEMO_USERS`, `LoginPageProps`, `errors`, `DEMO_ROLES`, `HomePageProps` (+208 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **56 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `dependencies`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `DEMO_USERS`, `LoginPageProps`, `errors` to the rest of the system?**
  _213 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `workspace.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0873015873015873 - nodes in this community are weakly interconnected._
- **Should `AGENTS.md — The Resort Platform demo` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._