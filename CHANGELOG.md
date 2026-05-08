# Changelog

All notable changes to this harness are tracked here.

## Unreleased

### Added

- Architect Layer: `/architect` command (`audit`, `generate --decision`, `polish`, `roadmap`, `status`, `abort`), skill, seven role templates, schemas, fixtures, structural validator, and doc graph tests.
- Shared parameterized skill validator used by both conductor and architect while preserving `validateConductorSkill()`.
- ADR proposal, SOP, and production-readiness taxonomy conventions under `docs/adr/`, `docs/sops/`, and `docs/architecture/`.

### Changed

- `npm run validate` now covers all scripts, including conductor and architect tests.

## [0.2.0] — 2026-05-08

### Added

- Repo-local `npm install` / `npm run validate` via [`package.json`](package.json), [`tsconfig.json`](tsconfig.json), and [`.gitignore`](.gitignore).
- Canonical **v0.2 doc drift** tests in [`scripts/conductor/canonical-docs.test.ts`](scripts/conductor/canonical-docs.test.ts).
- [CONTRIBUTING.md](CONTRIBUTING.md), [docs/RELEASE-CHECKLIST.md](docs/RELEASE-CHECKLIST.md), CI workflow, MIT [LICENSE](LICENSE).
- `npm run validate` as the release check (typecheck + tests), Dependabot npm updates, `.gitattributes`, and a journal-entry convention.

### Changed

- Aligned [.claude/commands/conductor.md](.claude/commands/conductor.md), [README.md](README.md), [docs/kb/README.md](docs/kb/README.md), and [docs/superpowers/specs/conductor-design.md](docs/superpowers/specs/conductor-design.md) with **`SKILL.md` v0.2**: phases **0–5**, **12** roles, `journalist` for KB deltas, explicit historical (v0.1) markings in the design spec.
- CI now runs `npm run validate` instead of tests alone.
