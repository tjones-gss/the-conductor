# Contributing to Conductor Harness

## Scope

This repo ships the Claude Code **slash command**, **skill** (orchestrator + templates), **Zod schemas + structural validator**, and **documentation**. Runtime behavior lives primarily in [.claude/skills/conductor/SKILL.md](.claude/skills/conductor/SKILL.md).

## Local checks

After `npm install`:

```bash
npm run validate
```

- **Typecheck** — `tsc --noEmit`.
- **Structural checks** — `validate-skill.ts` (templates vs `SCHEMA_BY_ROLE`, no removed-template files).
- **Schema tests** — `schemas.test.ts`.
- **Canonical doc drift** — `canonical-docs.test.ts` (README, slash command, `docs/kb/README.md` must stay aligned with v0.2 phase/role wording).

If you change user-facing wording, extend `canonical-docs.test.ts` when you add new invariants.

## Doc + skill coherence

Keep these in sync when behavior changes:

1. [.claude/skills/conductor/SKILL.md](.claude/skills/conductor/SKILL.md) — canonical orchestration.
2. [.claude/commands/conductor.md](.claude/commands/conductor.md) — user-facing summaries.
3. [README.md](README.md) — install and troubleshooting.
4. [docs/superpowers/specs/conductor-design.md](docs/superpowers/specs/conductor-design.md) — design history + **canonical v0.2** block at the top; archival v0.1 sections stay clearly marked.

## Pull request checklist

- [ ] `npm run validate` passes (typecheck + tests).
- [ ] Any new template role has matching Zod schema in `schemas.ts`, key in `SCHEMA_BY_ROLE`, and entry in validator `REQUIRED_TEMPLATES`.
- [ ] Slash command / README / KB README reflect phase count **0–5** and roster size **12** if you touched workflow prose.
- [ ] For releases, follow [docs/RELEASE-CHECKLIST.md](docs/RELEASE-CHECKLIST.md) and append [CHANGELOG.md](CHANGELOG.md).

## Historical plan doc

[docs/superpowers/plans/conductor-harness-build.md](docs/superpowers/plans/conductor-harness-build.md) is the original build narrative (v0.1-era tasks). Useful context; **not** normative unless cross-checked against `SKILL.md`.
