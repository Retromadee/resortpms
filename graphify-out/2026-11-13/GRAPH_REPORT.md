# Graph Report - resort-pms-demo  (2026-11-13)

## Corpus Check
- 43 files · ~14,698 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 239 nodes · 292 edges · 32 communities (10 shown, 22 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

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

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `isSupabaseConfigured()` - 10 edges
3. `createSupabaseServerClient()` - 8 edges
4. `AGENTS.md — The Resort Platform demo` - 8 edges
5. `Workspace()` - 7 edges
6. `include` - 7 edges
7. `Demo contract` - 7 edges
8. `scripts` - 6 edges
9. `relativeTime()` - 6 edges
10. `The Resort Platform` - 6 edges

## Surprising Connections (you probably didn't know these)
- `LoginPage()` --calls--> `isSupabaseConfigured()`  [EXTRACTED]
  src/app/login/page.tsx → src/lib/supabase/server.ts
- `signIn()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  src/app/login/actions.ts → src/lib/supabase/server.ts
- `signIn()` --calls--> `isSupabaseConfigured()`  [EXTRACTED]
  src/app/login/actions.ts → src/lib/supabase/server.ts
- `signOut()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  src/app/login/actions.ts → src/lib/supabase/server.ts
- `signOut()` --calls--> `isSupabaseConfigured()`  [EXTRACTED]
  src/app/login/actions.ts → src/lib/supabase/server.ts

## Import Cycles
- None detected.

## Communities (32 total, 22 thin omitted)

### Community 0 - "workspace.tsx"
Cohesion: 0.07
Nodes (31): ActivityView(), amenityEmojis, dateLabel(), FacilitiesView(), facilityStatusTitles, FacilityTiles(), getDefaultView(), getInitialView() (+23 more)

### Community 1 - "database.types.ts"
Cohesion: 0.09
Nodes (31): HomePageProps, Amenity, AuditEvent, DemoPayment, Facility, FacilityStatus, Inspection, Notification (+23 more)

### Community 2 - "AGENTS.md — The Resort Platform demo"
Cohesion: 0.09
Nodes (19): AGENTS.md — The Resort Platform demo, Always, Product (keep it simple), Schedule (hours from start), Stack, Subagent rules, Thinking rules, This is NOT the Next.js you know (+11 more)

### Community 3 - "dependencies"
Cohesion: 0.09
Nodes (22): lucide-react, next, dependencies, lucide-react, next, react, react-dom, @supabase/ssr (+14 more)

### Community 4 - "compilerOptions"
Cohesion: 0.11
Nodes (19): dom, dom.iterable, esnext, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules (+11 more)

### Community 5 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/turbopack, @types/node (+9 more)

### Community 6 - "isSupabaseConfigured"
Cohesion: 0.31
Nodes (9): signIn(), signOut(), errors, LoginPage(), LoginPageProps, POST(), HomePage(), createSupabaseServerClient() (+1 more)

### Community 7 - "include"
Cohesion: 0.20
Nodes (9): **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx, exclude (+1 more)

### Community 8 - "Demo contract"
Cohesion: 0.29
Nodes (7): Acceptance gates, Business rules, Demo contract, Initial route areas, Initial tables, Roles, Stack and data ownership

## Knowledge Gaps
- **109 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+104 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `dependencies`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `compilerOptions` connect `compilerOptions` to `include`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _109 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `workspace.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07084785133565621 - nodes in this community are weakly interconnected._
- **Should `database.types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08739495798319327 - nodes in this community are weakly interconnected._
- **Should `AGENTS.md — The Resort Platform demo` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._