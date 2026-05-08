# Contributing to Conductor Harness

## Scope

This repo ships Claude Code **slash commands**, **skills** (orchestrators + templates), **Zod schemas + structural validators**, and **documentation**. Runtime behavior lives primarily in [.claude/skills/conductor/SKILL.md](.claude/skills/conductor/SKILL.md) and [.claude/skills/architect/SKILL.md](.claude/skills/architect/SKILL.md).

## Local checks

After `npm install`:

```bash
npm run validate
```

- **Typecheck** — `tsc --noEmit`.
- **Structural checks** — shared `scripts/shared/validate-skill.ts` through conductor and architect wrappers.
- **Schema tests** — conductor and architect `schemas.test.ts`.
- **Canonical doc drift** — `canonical-docs.test.ts` (README, slash command, `docs/kb/README.md` must stay aligned with v0.2 phase/role wording).
- **Doc graph drift** — `scripts/architect/doc-graph.test.ts` (ADR proposals, SOPs, taxonomy, graph manifest, `.architect/` ignore).

If you change user-facing wording, extend `canonical-docs.test.ts` when you add new invariants.

## Doc + skill coherence

Keep these in sync when behavior changes:

1. [.claude/skills/conductor/SKILL.md](.claude/skills/conductor/SKILL.md) — canonical implementation orchestration.
2. [.claude/skills/architect/SKILL.md](.claude/skills/architect/SKILL.md) — canonical ADR/spec/SOP preparation workflow.
3. [.claude/commands/conductor.md](.claude/commands/conductor.md) and [.claude/commands/architect.md](.claude/commands/architect.md) — user-facing command summaries.
4. [README.md](README.md) — install and troubleshooting.
5. [docs/adr/README.md](docs/adr/README.md), [docs/adr/_proposals/README.md](docs/adr/_proposals/README.md), [docs/sops/README.md](docs/sops/README.md), and [docs/architecture/graph-manifest.json](docs/architecture/graph-manifest.json) — Architect Layer doc graph rules.
6. [docs/superpowers/specs/conductor-design.md](docs/superpowers/specs/conductor-design.md) — design history + **canonical v0.2** block at the top; archival v0.1 sections stay clearly marked.

## Pull request checklist

- [ ] `npm run validate` passes (typecheck + tests).
- [ ] Any new template role has matching Zod schema in `schemas.ts`, key in `SCHEMA_BY_ROLE`, and entry in validator `REQUIRED_TEMPLATES`.
- [ ] Slash command / README / KB README reflect phase count **0–5** and roster size **12** if you touched workflow prose.
- [ ] Architect changes preserve the kernel-of-truth rule: proposals stay under `docs/adr/_proposals/`, accepted ADRs remain human-controlled, conflict checks are structural only, and coverage labels avoid false confidence.
- [ ] For releases, follow [docs/RELEASE-CHECKLIST.md](docs/RELEASE-CHECKLIST.md) and append [CHANGELOG.md](CHANGELOG.md).

## Historical plan doc

[docs/superpowers/plans/conductor-harness-build.md](docs/superpowers/plans/conductor-harness-build.md) is the original build narrative (v0.1-era tasks). Useful context; **not** normative unless cross-checked against `SKILL.md`.
