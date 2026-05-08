# Production-readiness taxonomy

This taxonomy is configurable per project. Keep labels evidence-based so documentation does not imply more certainty than the audit supports.

## Status values

- `not_assessed` - no readiness review has been performed.
- `unknown` - inputs are too incomplete to classify.
- `structural_only` - only file placement, links, headings, and status vocabulary were checked.
- `partial` - some areas have evidence, but gaps remain.
- `gaps_found` - specific blockers or missing artifacts are known.
- `ready_with_evidence` - readiness is supported by linked tests, runbooks, owners, and rollback/verification evidence.

Do not use `complete` as a coverage status. If the evidence is strong, use `ready_with_evidence` and link the supporting files.

## Example evidence

- Accepted ADR links to a paired spec.
- Spec lists concrete acceptance commands.
- SOP exists for production rollout, verification, rollback, and escalation.
- Ownership is explicit.
- Known gaps are listed with next actions.
