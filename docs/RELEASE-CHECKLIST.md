# Release checklist (maintainers)

Use this when tagging or publishing a harness snapshot (e.g. to an internal template repo or versioned archive).

## Pre-release

- [ ] `npm run validate` is green locally and in CI (typecheck + tests).
- [ ] [CHANGELOG.md](../CHANGELOG.md) updated (keep newest first).
- [ ] Version callouts consistent: [SKILL.md](../.claude/skills/conductor/SKILL.md) header/changelog ↔ README opener ↔ design spec canonical section.
- [ ] Architect Layer docs are coherent: [architect skill](../.claude/skills/architect/SKILL.md) ↔ [command](../.claude/commands/architect.md) ↔ [ADR conventions](adr/README.md) ↔ [graph manifest](architecture/graph-manifest.json).
- [ ] ADR proposal directory is tracked by README/.gitkeep and is not ignored wholesale.
- [ ] No accidental **v0.1** wording in **canonical** files (README, `.claude/commands/conductor.md`, `docs/kb/README.md`) — guarded by tests.

## Tag / ship

- [ ] Tag or archive name reflects version (match `CHANGELOG`/`SKILL.md` wording).
- [ ] Optional: announce breaking changes when templates or schemas change consumer contracts.

## Post-release

- [ ] Consumers who copy paths from README re-run `validate:conductor` after merging.
- [ ] Consumers who copy the Architect Layer also re-run `validate:architect`.
