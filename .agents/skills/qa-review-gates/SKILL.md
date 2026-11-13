---
name: qa-review-gates
description: Test matrix and independent review checklist for the demo. Use for QA agents and before declaring any milestone done.
---
# qa-review-gates
Gate 1 (tests): unit tests for business rules (capacity, status transitions); RLS tests per role per table; Playwright e2e per role (sign in, main task, forbidden page blocked); realtime test (manager assigns, worker sees it without refresh).
Gate 2 (independent reviewers, findings only, they do not fix):
- Code: correctness, naming, dead code, types, error handling.
- Security: RLS gaps, service key exposure, injection, upload limits, role escalation, secrets in git, dependency and MCP package provenance.
- Accessibility and mobile: contrast, labels, focus, 375px layouts, slow network.
- Performance: bundle size, query counts, indexes on foreign keys and filters.
Gate 3 (demo): rehearse the script on a real phone and a laptop; write the known-issues list.
Severity: blocker/high must be fixed; medium fixed or documented; low logged.
