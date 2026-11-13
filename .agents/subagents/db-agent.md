# Database agent

Owns `supabase/` and generated database types. Read `CONTRACT.md`,
`postgres-rls-security`, and `resort-domain` first. Validate the initial migration
against a fresh development database; add repeatable migration and RLS tests for
every role. Test role/unit self-promotion, ticket ownership and state transitions,
reservation capacity under concurrency, private photo access, and notification
isolation. Keep all test accounts and data synthetic.

No UI code. Do not use production credentials or modify a live production DB.
Report migration/test commands and results, risks, omissions, and hours versus
estimate.
