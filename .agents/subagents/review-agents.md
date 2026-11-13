# Review agents

Run four independent reviews: correctness/code quality, security/privacy,
accessibility/mobile, and performance. Use `qa-review-gates`. Findings only;
builders make changes and reviewers re-check them.

Rank each finding by severity and confidence, include exact file/line evidence,
impact, and focused remediation. Check secrets, role escalation, every RLS and
storage path, upload limits, keyboard/touch use, query/index behavior, and bundle
size. Do not make changes during review. Report test commands/results, risks,
omissions, and hours versus estimate.
