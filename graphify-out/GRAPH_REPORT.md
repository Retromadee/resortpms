# Graph Report - resort-pms-demo  (2026-11-16)

## Corpus Check
- 104 files · ~42,076 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 507 nodes · 542 edges · 82 communities (24 shown, 58 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0dddaa91`
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
- What You Must Do When Invoked
- Supabase Postgres Best Practices
- graphify reference: extra exports and benchmark
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
- Low-token codebase navigation
- route.ts
- CLAUDE.md
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- graphify
- extraction-spec.md

## God Nodes (most connected - your core abstractions)
1. `useI18n()` - 19 edges
2. `compilerOptions` - 16 edges
3. `What You Must Do When Invoked` - 12 edges
4. `/graphify` - 10 edges
5. `isSupabaseConfigured()` - 9 edges
6. `Section Definitions` - 9 edges
7. `graphify reference: extra exports and benchmark` - 8 edges
8. `HANDOFF` - 8 edges
9. `Workspace()` - 8 edges
10. `Changelog` - 8 edges

## Surprising Connections (you probably didn't know these)
- `LoginPage()` --calls--> `isSupabaseConfigured()`  [EXTRACTED]
  src/app/login/page.tsx → src/lib/supabase/server.ts
- `BookingsView()` --calls--> `useI18n()`  [EXTRACTED]
  src/components/workspace/workspace.tsx → src/components/language-switcher.tsx
- `TicketModal()` --calls--> `useI18n()`  [EXTRACTED]
  src/components/workspace/workspace.tsx → src/components/language-switcher.tsx
- `signIn()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  src/app/login/actions.ts → src/lib/supabase/server.ts
- `signIn()` --calls--> `isSupabaseConfigured()`  [EXTRACTED]
  src/app/login/actions.ts → src/lib/supabase/server.ts

## Import Cycles
- None detected.

## Communities (82 total, 58 thin omitted)

### Community 0 - "workspace.tsx"
Cohesion: 0.06
Nodes (53): metadata, viewport, DEMO_ROLES, errorKeyMap, LoginView(), LoginViewProps, I18nContext, I18nContextValue (+45 more)

### Community 1 - "database.types.ts"
Cohesion: 0.22
Nodes (8): Current task, Files touched (path - what changed), Gotchas / commands to run (tests, build), HANDOFF, Key decisions and why, Next steps (ordered), Status (done / in progress / blocked), Where to look (graph nodes, symbols, line ranges)

### Community 2 - "AGENTS.md — The Resort Platform demo"
Cohesion: 0.07
Nodes (26): AGENTS.md — The Resort Platform demo, Always, Product (keep it simple), Schedule (hours from start), Stack, Subagent rules, Thinking rules, This is NOT the Next.js you know (+18 more)

### Community 3 - "dependencies"
Cohesion: 0.08
Nodes (23): lucide-react, next, dependencies, lucide-react, next, react, react-dom, @supabase/ssr (+15 more)

### Community 4 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 5 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/turbopack, @types/node (+9 more)

### Community 6 - "isSupabaseConfigured"
Cohesion: 0.27
Nodes (10): DEMO_USERS, quickDemoSignIn(), signIn(), signOut(), signUp(), LoginPage(), LoginPageProps, POST() (+2 more)

### Community 7 - "include"
Cohesion: 0.10
Nodes (20): [0.1.3](https://github.com/supabase/agent-skills/compare/v0.1.2...v0.1.3) (2026-06-02), [0.1.4](https://github.com/supabase/agent-skills/compare/v0.1.3...v0.1.4) (2026-06-05), [0.1.5](https://github.com/supabase/agent-skills/compare/v0.1.4...v0.1.5) (2026-07-10), [0.1.6](https://github.com/supabase/agent-skills/compare/v0.1.5...supabase-v0.1.6) (2026-07-30), [0.1.7](https://github.com/supabase/agent-skills/compare/v0.1.6...supabase-v0.1.7) (2026-08-12), [0.1.8](https://github.com/supabase/agent-skills/compare/v0.1.7...supabase-v0.1.8) (2026-09-24), [0.1.9](https://github.com/supabase/agent-skills/compare/v0.1.8...supabase-v0.1.9) (2026-09-28), Bug Fixes (+12 more)

### Community 8 - "Demo contract"
Cohesion: 0.11
Nodes (15): Fix suggestion, Source, What happened, Skill Feedback, Steps, Core Principles, Debugging, Making and Committing Schema Changes (+7 more)

### Community 9 - "layout.tsx"
Cohesion: 0.83
Nodes (3): assert(), run(), testEndpoint()

### Community 32 - "Changelog"
Cohesion: 0.12
Nodes (16): [1.2.0](https://github.com/supabase/agent-skills/compare/v1.1.1...v1.2.0) (2026-06-02), [1.3.0](https://github.com/supabase/agent-skills/compare/v1.2.0...v1.3.0) (2026-06-05), [1.4.0](https://github.com/supabase/agent-skills/compare/v1.3.0...v1.4.0) (2026-07-10), [1.5.0](https://github.com/supabase/agent-skills/compare/supabase-postgres-best-practices-v1.4.0...supabase-postgres-best-practices-v1.5.0) (2026-07-30), [1.6.0](https://github.com/supabase/agent-skills/compare/supabase-postgres-best-practices-v1.5.0...supabase-postgres-best-practices-v1.6.0) (2026-07-30), Bug Fixes, Bug Fixes, Bug Fixes (+8 more)

### Community 33 - "Writing Guidelines for Postgres References"
Cohesion: 0.12
Nodes (15): 1. Concrete Transformation Patterns, 2. Error-First Structure, 3. Quantified Impact, 4. Self-Contained Examples, 5. Semantic Naming, Code Example Standards, Comments, Impact Level Guidelines (+7 more)

### Community 34 - "demo-data.ts"
Cohesion: 0.07
Nodes (32): config, Amenity, AuditEvent, Database, DemoPayment, Facility, FacilityStatus, Inspection (+24 more)

### Community 35 - "Section Definitions"
Cohesion: 0.20
Nodes (9): 1. Query Performance (query), 2. Connection Management (conn), 3. Security & RLS (security), 4. Schema Design (schema), 5. Concurrency & Locking (lock), 6. Data Access Patterns (data), 7. Monitoring & Diagnostics (monitor), 8. Advanced Features (advanced) (+1 more)

### Community 36 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 37 - "Supabase Postgres Best Practices"
Cohesion: 0.33
Nodes (5): How to Use, References, Rule Categories by Priority, Supabase Postgres Best Practices, When to Apply

### Community 39 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 72 - "app/page.tsx"
Cohesion: 0.50
Nodes (4): demoRoleProfiles, getLiveSessionData(), HomePage(), HomePageProps

### Community 73 - "Low-token codebase navigation"
Cohesion: 0.25
Nodes (7): Before the user switches model or account, Hard rules, Low-token codebase navigation, One-time project setup (tell the user if not done), Startup sequence (do this every session, and after every model/account switch), Suggested CLAUDE.md block, While working

### Community 74 - "route.ts"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 76 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 77 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 78 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

## Knowledge Gaps
- **271 isolated node(s):** `graphify`, `Usage`, `What graphify is for`, `Step 0 - GitHub repos and multi-path merge (only if a URL or several paths)`, `Step 1 - Ensure graphify is installed` (+266 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **58 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `dependencies`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `graphify`, `Usage`, `What graphify is for` to the rest of the system?**
  _271 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `workspace.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0574400723654455 - nodes in this community are weakly interconnected._
- **Should `AGENTS.md — The Resort Platform demo` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._