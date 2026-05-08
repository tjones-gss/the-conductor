# Journal entries

The conductor writes one journal entry during Phase 4 Ship for each completed ADR run. Entries should be short, decision-grade summaries that help future agents understand what changed and what evidence mattered.

## Filename

Use:

```text
YYYY-MM-DD-NN-adr-slug.md
```

Example: `2026-05-08-01-auth-session-hardening.md`.

## Template

```markdown
# ADR NNNN: Short outcome title

- Date: YYYY-MM-DD
- ADR: docs/adr/NNNN-adr-title.md
- Spec: docs/specs/NNNN-adr-title-implementation.md
- Conductor run: .conductor/NNNN/

## Outcome

Briefly state what shipped and why it matters.

## Verification

List the commands that passed, including every `acceptance_commands_required` entry.

## Notes for Future Runs

Capture follow-up risks, KB topics updated, or implementation constraints future agents should know.
```
