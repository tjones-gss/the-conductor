# Knowledge base

Topic-keyed lessons accumulated across conductor runs. Each file holds dated bullets — gotchas, surprises, “next time avoid X” — written by the **`journalist`** role as part of **Phase 4 (Ship)** (journal entry plus KB deltas in one pass; v0.2 merged the old `knowledge-curator` into `journalist`).

Workers, test-writers, and spec-writers read the relevant topic slice on every dispatch, so the KB compounds over time.

**Harness note:** this repository ships only `README.md` here. Topic files live in **your** project after you create them.

## Example topics (from the reference poker-club project)

Add rows and files as your domain requires:

| File | ADR(s) |
|---|---|
| `rls.md` | 0003 |
| `money-handling.md` | 0004 |
| `idempotency.md` | 0005 |
| `audit-log.md` | 0006 |
| `auth.md` | 0002 |
| `pii.md` | 0009, 0023 |

New topics: append a row above and create the file. `journalist` may propose new topics when lessons do not fit existing ones.

## Bullet format

```markdown
- **YYYY-MM-DD** — short lesson. *Context:* what we were doing. *Why it matters:* why future-you cares.
```
