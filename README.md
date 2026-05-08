# Conductor Harness

A pure-orchestrator skill for ADR-driven implementation in Claude Code. The orchestrator never writes code itself — it dispatches subagents (worker, test-writer, validator, critic, etc.), routes their structured returns, persists state to disk, and escalates only on a small set of trigger conditions. The point is to keep one Claude session usefully driving a meaningful piece of work to completion without context bloat or drift.

This repo also ships an **Architect Layer**: a sibling `/architect` workflow that audits decision docs, drafts **Proposed** ADRs, polishes ADR/spec/SOP artifacts, checks structural doc conflicts, and roadmaps dependencies before `/conductor` implements accepted ADRs.

**This is v0.2.** Originally built on a Next.js poker-club app, then graded by three independent reviewers (code-quality / architectural / devil's-advocate). The five highest-impact fixes landed: full schema coverage (8 new schemas), acceptance-command binding that schema-rejects `ship_ready: true` when commands didn't run, per-task iter+split tracking that survives crash-resume, role merges (14 → 12), phase merges (7 → 5), and a validator that actually checks template contents instead of just file existence. See the changelog at the bottom of `SKILL.md` for the v0.1 → v0.2 diff.

Still: it has been battle-tested on exactly one project. Treat templates as v0.2 and refine as you use it.

## What you get

- **Slash command** — `/conductor <NNNN>` (start), `/conductor resume`, `/conductor status`, `/conductor abort`.
- **Architect slash command** — `/architect audit`, `/architect generate --decision "<one line>" [--mode brownfield|greenfield]`, `/architect polish <NNNN>`, `/architect roadmap`, `/architect status`, `/architect abort`.
- **Orchestrator skill** — `SKILL.md` enforces the Pragmatic Purist rule (orchestrator may read specs/ADRs/state; not source code) and **phases 0–5** (bootstrap → plan → build → integration → ship → retrospective).
- **Architect skill** — prepares MADR/DECIDER/Nygard ADRs and runbookdev-style SOPs without accepting decisions or writing implementation code.
- **12 role templates** — worker, test-writer, validator, critic, scope-judge, premortem, planner (initial + split modes), spec-writer, journalist (entry + KB deltas), retrospective, shipper, ratifier.
- **7 architect role templates** — portfolio-auditor, adr-drafter, adr-polisher, conflict-checker, dependency-planner, sop-scout, doc-linter.
- **Structural validator** — TypeScript + zod schemas + vitest tests. Beyond file existence: every template's fenced ```` ```json ```` examples parse against its `SCHEMA_BY_ROLE` schema after `{{placeholder}}` substitution, every template has a `# Role: <name>` heading, and any v0.1 removed templates (`task-splitter.md`, `knowledge-curator.md`) being on disk is a hard error.
- **Doc graph conventions** — ADR proposals live under `docs/adr/_proposals/`, SOP conventions live under `docs/sops/`, and production-readiness coverage uses evidence-based taxonomy labels.
- **Acceptance-command binding** — spec frontmatter requires `acceptance_commands:`. The slice validator runs them. `ScopeJudgeResultSchema.superRefine` schema-rejects `ship_ready: true` when any command did not run-and-pass.
- **Paired-spec template** — convention for spec docs that pair with an ADR (`docs/specs/_template.md`).
- **KB convention** — topic-keyed knowledge base under `docs/kb/` that the conductor reads by topic slice.
- **Design spec + implementation plan** — the source-of-truth design doc (with v0.2 amendments at the top) and the original build plan, kept for future amendment.

Further reading: [CONTRIBUTING.md](CONTRIBUTING.md) · [CHANGELOG.md](CHANGELOG.md)

## Quickstart (validate this repo)

Requires **Node ≥ 20**:

```bash
npm install
npm run validate
```

This runs `tsc --noEmit` plus Vitest against `scripts/` (conductor schemas/validator/docs and architect schemas/validator/doc graph checks).

## Quickstart (install into another project)

1. Copy `.claude/`, `scripts/`, and the `docs/` paths listed under [Installation](#installation-into-a-target-project) below.
2. Ensure `vitest`, `zod`, `@types/node`, `"validate:conductor": "vitest run scripts/conductor"`, and `"validate:architect": "vitest run scripts/architect"` exist in that project’s `package.json`.
3. Run `npm run validate:conductor` before your first `/conductor` drive.
4. Run `npm run validate:architect` before your first `/architect` drive.

## Troubleshooting

| Symptom | What to try |
|:---|:---|
| `vitest`/module not found | From the repo that contains `scripts/conductor`, run package-manager install (`npm install` / `pnpm install`) and rerun `npm run validate:conductor`. |
| Validator reports missing `acceptance_commands` | Your paired spec must define `acceptance_commands:` (non-empty) in frontmatter — the orchestrator blocks Phase 2 until fixed (see `_template.md`). |
| **`gh`** not installed / PR step fails | `shipper` expects GitHub CLI for PR flow — install [`gh`](https://cli.github.com/) and authenticate (`gh auth login`), or adjust the shipper template for your forge. |
| Stale **v0.1** templates on disk | Remove `task-splitter.md` and `knowledge-curator.md` if present — the validator treats them as errors. |
| Architect reports proposal path errors | Keep AI-drafted ADRs under `docs/adr/_proposals/`; accepted ADR files under `docs/adr/NNNN-*.md` are human-controlled. |
| Subagents unavailable | Workflow still parses, but the orchestrator won’t isolate context; consider lighter workflows until `Agent`/subagents are available. |

## Installation into a target project

The harness assumes you're using Claude Code, with subagents available (the `Agent` tool). Without subagents you lose the context-isolation benefit and the orchestrator effectively does all the work itself; the harness still runs but is much heavier than it needs to be.

### 1. Copy the files

From the **repository root** of this harness (`conductor-harness/`), copy these into your target project:

```
.claude/commands/conductor.md          → <project>/.claude/commands/conductor.md
.claude/commands/architect.md          → <project>/.claude/commands/architect.md
.claude/skills/conductor/              → <project>/.claude/skills/conductor/
.claude/skills/architect/              → <project>/.claude/skills/architect/
scripts/                               → <project>/scripts/
docs/adr/README.md                     → <project>/docs/adr/README.md
docs/adr/_proposals/README.md          → <project>/docs/adr/_proposals/README.md
docs/architecture/                     → <project>/docs/architecture/
docs/sops/README.md                    → <project>/docs/sops/README.md
docs/superpowers/                      → <project>/docs/superpowers/
docs/specs/                            → <project>/docs/specs/   (merge if exists)
docs/journal/README.md                 → <project>/docs/journal/README.md
docs/kb/README.md                      → <project>/docs/kb/README.md
```

If the target project doesn't already have a `docs/adr/` directory, the conductor will assume the conventions used in the design spec — see `docs/superpowers/specs/conductor-design.md` for the layouts it expects.

### 2. Add dependencies

The validator scripts use `zod`, run on `vitest`, and typecheck with Node globals. If your project doesn't already have them:

```
pnpm add -D zod vitest @types/node
```

(Or your package manager equivalent.)

### 3. Add the npm script

In `package.json` under `"scripts"`:

```json
"validate:conductor": "vitest run scripts/conductor",
"validate:architect": "vitest run scripts/architect"
```

Run `pnpm validate:conductor` once after install to confirm the validator's own tests pass against the templates you copied. This catches typos in the SKILL.md / template frontmatter before you start running the conductor.
Run `pnpm validate:architect` after copying the Architect Layer to confirm proposal-path, doc graph, and template checks.

### 4. Customize project-specific knobs

Edit `.claude/skills/conductor/SKILL.md`:

- **High-risk ADR list** — under "High-risk auto-flag", specify the ADR numbers in your project that should auto-trigger `premortem`. The default is none; the original project's list was `0003, 0004, 0005, 0006, 0009, 0023` (auth, money, idempotency, audit-log, identity, privacy).
- **Pragmatic Purist read-list** — verify the file paths under "You may directly read" match your project's layout. Most projects can use the defaults; some may rename `docs/spec.md` → `docs/architecture.md` etc.

### 5. Seed your KB

`docs/kb/` starts empty (only `README.md` is shipped with this harness). The original project seeded topic files such as `auth.md`, `rls.md`, and `money-handling.md`; create whatever topics fit your codebase. During **Ship** (Phase 4), the `journalist` role writes both the journal entry and topic-keyed KB deltas in one pass, so the KB grows with each run.

### 6. Optional: hook up Telegram for done/ratification pings

If you've configured the `telegram:configure` skill, the conductor's escalation policy already pings Telegram on triggers 4 (done) and 5 (ratification approval). No extra setup needed.

## Preparing decisions with architect

Use `/architect` before `/conductor` when the decision record is missing, thin, or needs a doc graph audit:

```
/architect generate --decision "Use managed Postgres for audit logs"
```

Architect will audit existing docs, draft a non-binding Proposed ADR under `docs/adr/_proposals/NNNN-<slug>.draft.md`, polish it against MADR/DECIDER/Nygard conventions, run structural-only conflict checks, and roadmap dependencies/SOP gaps. It never moves proposals into `docs/adr/NNNN-*.md` and never marks an ADR Accepted.

## Running it

Once installed:

```
/conductor 0003
```

starts the conductor on ADR-0003. It will:

1. **Phase 0 — Bootstrap** — read the ADR, check status (Stub→Accepted via ratifier if needed, with user approval), ensure paired spec exists; freeze spec `acceptance_commands` into `status.json`.
2. **Phase 1 — Plan** — critic reviews spec, planner produces a task list, premortem on high-risk tasks.
3. **Phase 2 — Build** — per task: test-writer and worker in parallel, then validator. Up to 5 retries per task; then planner (`mode=split`) decomposes the task unless split lineage already hit the cap (`splits[id] ≥ 2` → escalate instead).
4. **Phase 3 — Integration** — slice-scope validator (gauntlet + every `acceptance_commands_required`), critic vs spec diff, scope-judge; critic `revise` can reopen work in Phase 2.
5. **Phase 4 — Ship** — `journalist` (journal entry + KB deltas) and `shipper` (commit, push, PR) in parallel; PR body can reference the journal path.
6. **Phase 5 — Retrospective** — proposes `skill-diff-proposal.md`. **Never auto-merged.** Mark run completed and archive `.conductor/<N>/` per skill.

`/conductor resume`, `/conductor status`, and `/conductor abort` work as expected.

## Escalation policy

The conductor pauses and notifies you ONLY for:

1. API keys / secrets needed
2. Login / OAuth / MFA / browser auth
3. Money decisions (paid tier upgrades, purchases)
4. Done — end of Phase 5 (includes `skill-diff-proposal` path when present)
5. Ratification approval — when a Stub ADR proposal is ready at `.conductor/<N>/ratification-proposal.md`
6. Stuck — validator-loop max-iters with `splits[id] ≥ 2` for that task (no further split); or critic-loop max-iters; or ratifier-revision max-iters
7. Implicit: destructive ops on shared/production systems

It does NOT escalate for: design ambiguities (resolved by spec-writer + critic), within-budget validator failures, premortem findings (fed into worker prompts), first-attempt PR-create failures (retried).

## When to use this vs lighter alternatives

**Reach for the conductor when:**

- You have multi-day work to drive
- Multiple specs / ADRs to implement in sequence
- You want a paper trail (journal entries + KB deltas)
- Subagents can run in parallel (Claude Code's Agent tool available)
- You're at a point where context decay is a real problem

**Skip it (use `superpowers:brainstorming` / `executing-plans` / `subagent-driven-development` instead) when:**

- One-off scripts or small fixes
- You're still in greenfield exploration mode (no specs yet)
- No ADR or spec culture in the project
- You want lighter ceremony

## Project context where this was built

The original project: a Next.js (App Router) marketing + member-portal app for a private poker club, with documented ADRs covering auth (Supabase RLS), money (integer cents), idempotency, audit log, etc. The harness was scaffolded across ~17 commits and used to drive at least one ADR (0030, SEO & content strategy) end-to-end before being extracted here.

If you spot rot, drift, or a bug in a template while using it on a new project, the `retrospective` agent will already write a `skill-diff-proposal.md` for you at the end of the run — review and merge that diff back into your local copy.

## Source of truth

`docs/superpowers/specs/conductor-design.md` is the design spec (with explicit v0.2 summary and archival v0.1 sections). If you change the `SKILL.md` without updating the spec (or vice versa), they can drift semantically — run `npm run validate` here or the same Vitest script in your app often. [`scripts/conductor/validate-skill.ts`](scripts/conductor/validate-skill.ts) catches **structural** drift (templates, schemas, placeholders), not prose semantics.

See [CONTRIBUTING.md](CONTRIBUTING.md) for coherence rules. Licensed under [MIT](LICENSE).

## Layout

```
.claude/
├── commands/
│   ├── architect.md                    # decision-artifact preparation entry point
│   └── conductor.md                    # implementation entry point
└── skills/
    ├── architect/
    │   ├── SKILL.md                    # ADR/spec/SOP preparation workflow
    │   └── templates/                  # 7 architect role templates
    └── conductor/
        ├── SKILL.md                    # orchestrator behavior (canonical phases 0–5)
        └── templates/                  # 12 role templates (v0.2)
            ├── critic.md
            ├── journalist.md
            ├── planner.md              # initial + split modes
            ├── premortem.md
            ├── ratifier.md
            ├── retrospective.md
            ├── scope-judge.md
            ├── shipper.md
            ├── spec-writer.md
            ├── test-writer.md
            ├── validator.md
            └── worker.md
scripts/
├── architect/                          # architect schemas, fixtures, validator, doc graph tests
├── conductor/                          # conductor schemas, fixtures, validator, canonical docs tests
└── shared/
    └── validate-skill.ts               # parameterized structural validator
docs/
├── adr/
│   ├── README.md
│   └── _proposals/README.md
├── architecture/
│   ├── graph-manifest.json
│   └── production-readiness-taxonomy.md
├── sops/
│   └── README.md
├── superpowers/
│   ├── specs/conductor-design.md       # source-of-truth design
│   └── plans/conductor-harness-build.md # build plan (history)
├── specs/
│   ├── README.md                        # paired-spec convention
│   └── _template.md
├── journal/
│   └── README.md                        # journal entry convention
└── kb/
    └── README.md                        # KB convention; topic files are project-specific
```
