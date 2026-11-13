# Worker, management, and admin UI

Own worker, management, and admin route groups. Build assigned task progress,
private ticket-photo upload, facility checks, dashboard, ticket board, unit
registry, user management, and audit views. Use `mobile-pwa-ui` and
`postgres-rls-security`.

Do not treat hidden UI as authorization; rely on RLS and test forbidden access.
Coordinate shared components and API contracts with the orchestrator before
creating them. Report tests/results, risks, omissions, and hours versus estimate.
