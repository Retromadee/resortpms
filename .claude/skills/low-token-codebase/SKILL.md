---
name: low-token-codebase
description: Use at the start of any session or task in this repo, after a model/account switch, and before reading, searching, or exploring code. Forces graph-first and index-first navigation so the agent never scans the whole codebase to continue a prompt.
---

# Low-token codebase navigation

Goal: continue work without re-reading the codebase. Context is lost when the model or account changes; only files on disk survive. Rebuild context from those files, not from the source tree.

## Hard rules

1. **Do not run broad Glob/Grep/Read sweeps** (whole directories, "read all files", repo-wide greps) until steps 1-3 below are done.
2. **Never read a whole file to find one function.** Use a graph query, symbol search, or chunk search first, then read only the needed line range.
3. **Read before you write.** Graph and index results are for orientation. Before editing, read the actual file lines you will change.
4. If a step's tool is missing, skip to the next step. Don't fall back to scanning everything.

## Startup sequence (do this every session, and after every model/account switch)

1. **Handoff:** if `HANDOFF.md` exists in the repo root, read it first. It holds the current task, files touched, decisions, and next steps.
2. **Graph:** if `graphify-out/GRAPH_REPORT.md` exists, read it (god nodes, communities, structure). Then query the graph for the specific area you need:
   - `graphify explain "<SymbolOrConcept>"`
   - `graphify path "<A>" "<B>"`
   - `graphify query "<question>"`
   If the graph is missing or stale, tell the user to run `/graphify .` (or `graphify --watch` in a background terminal). Code-only rebuilds are AST-based and cost no LLM tokens.
3. **Targeted retrieval** (use whichever is installed, in this order):
   - Serena MCP: `get_symbols_overview`, `find_symbol`, `find_referencing_symbols` (callers/references).
   - cocoindex-code: `ccc search "<query>"` (returns chunks, not files).
   - claude-context MCP: `search_code`.
   - Otherwise: grep for one specific identifier, scoped to one directory, then read only the matching line range.
4. Only now read the specific files/lines you will edit.

## While working

- Keep a running list of files touched and decisions made. Update `HANDOFF.md` after each milestone, not just at the end.
- Prefer CLI tools over adding more MCP servers. Run `/mcp` and disable servers not needed for the task. Run `/context` if the session feels heavy.
- Use `/compact` with instructions (e.g. `/compact keep: current task, files touched, open bugs`) rather than re-reading code.
- Never paste large file contents back into chat. Reference path and line numbers.

## Before the user switches model or account

Write or update `HANDOFF.md` in the repo root using this template, then tell the user it is ready:

```
# HANDOFF
## Current task
## Status (done / in progress / blocked)
## Files touched (path - what changed)
## Key decisions and why
## Next steps (ordered)
## Where to look (graph nodes, symbols, line ranges)
## Gotchas / commands to run (tests, build)
```

## One-time project setup (tell the user if not done)

```
pip install graphifyy && graphify install
graphify install --project --strict     # skill lives in the repo, strict graph use
graphify claude install                 # CLAUDE.md section + PreToolUse hook on Glob/Grep
graphify hook install                   # refresh hook path after upgrades
/graphify .                             # build the graph
graphify --watch                        # optional, keeps graph fresh (AST only)
```

Optional retrieval layers:

```
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project $(pwd)
npx skills add cocoindex-io/cocoindex-code
```

Commit `graphify-out/` and `.claude/skills/` so any account or machine starts with the same graph and rules.

## Suggested CLAUDE.md block

```
## Navigation rules
- At session start or after a model/account switch: read HANDOFF.md, then graphify-out/GRAPH_REPORT.md. Do not scan the repo.
- Use graphify queries / Serena / ccc search before any Glob, Grep, or file Read.
- Read only the line ranges you will edit. Never read whole files to find one symbol.
- Update HANDOFF.md after each milestone and before the user switches model or account.
- Invoke the low-token-codebase skill at the start of every task.
```
