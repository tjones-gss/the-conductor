import { z } from 'zod';

const ProposalPathSchema = z
  .string()
  .regex(
    /^docs\/adr\/_proposals\/[0-9]{4}-[a-z0-9-]+\.draft\.md$/,
    'proposal ADR paths must be under docs/adr/_proposals/ and end in .draft.md',
  );

const SummaryPathSchema = z.string();

export const ARCHITECT_PHASES = [
  'intake',
  'audit',
  'draft',
  'polish',
  'roadmap',
  'completed',
  'aborted',
  'escalated',
] as const;

export const ArchitectStatusSchema = z.object({
  run_id: z.string(),
  mode: z.enum(['brownfield', 'greenfield']),
  phase: z.enum(ARCHITECT_PHASES),
  started_at: z.string().datetime(),
  events_offset: z.number().int().nonnegative(),
  proposal_paths: z.array(ProposalPathSchema).default([]),
  production_readiness_taxonomy_path: z.string().default(
    'docs/architecture/production-readiness-taxonomy.md',
  ),
  escalation_reason: z.string().optional(),
});

export type ArchitectStatus = z.infer<typeof ArchitectStatusSchema>;

const CoverageStatusSchema = z.enum([
  'not_assessed',
  'unknown',
  'partial',
  'gaps_found',
  'structural_only',
  'ready_with_evidence',
]);

const ArchitectRoleStatusSchema = z.enum(['ok', 'blocked', 'context_exhausted', 'failed']);
const ArchitectModeSchema = z.enum(['brownfield', 'greenfield']);
const StandardSchema = z.enum(['MADR', 'DECIDER', 'Nygard', 'runbookdev']);

export const PortfolioAuditResultSchema = z.object({
  status: ArchitectRoleStatusSchema,
  mode: ArchitectModeSchema,
  coverage_status: CoverageStatusSchema,
  audited_paths: z.array(z.string()).default([]),
  gaps: z.array(z.string()).default([]),
  summary_path: SummaryPathSchema,
  notes: z.string().optional(),
});

export type PortfolioAuditResult = z.infer<typeof PortfolioAuditResultSchema>;

export const AdrDraftResultSchema = z
  .object({
    status: ArchitectRoleStatusSchema,
    proposal_path: ProposalPathSchema,
    decision_source: z.enum(['user_one_line', 'user_supplied_draft']),
    binding_decision_claimed: z.boolean(),
    open_questions: z.array(z.string()).default([]),
    summary_path: SummaryPathSchema,
    notes: z.string().optional(),
  })
  .superRefine((result, ctx) => {
    if (result.binding_decision_claimed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['binding_decision_claimed'],
        message: 'architect may draft Proposed ADRs but must not claim binding decisions',
      });
    }
  });

export type AdrDraftResult = z.infer<typeof AdrDraftResultSchema>;

export const AdrPolisherResultSchema = z
  .object({
    status: ArchitectRoleStatusSchema,
    input_path: z.string(),
    output_path: ProposalPathSchema,
    standards_applied: z.array(StandardSchema).min(1),
    semantic_decisions_added: z.boolean(),
    summary_path: SummaryPathSchema,
    notes: z.string().optional(),
  })
  .superRefine((result, ctx) => {
    if (result.semantic_decisions_added) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['semantic_decisions_added'],
        message: 'polishing may clarify structure but must not add semantic decisions',
      });
    }
  });

export type AdrPolisherResult = z.infer<typeof AdrPolisherResultSchema>;

export const ConflictCheckResultSchema = z.object({
  status: ArchitectRoleStatusSchema,
  scope: z.literal('structural'),
  checked_paths: z.array(z.string()).default([]),
  conflicts: z.array(z.string()).default([]),
  coverage_status: z.literal('structural_only'),
  summary_path: SummaryPathSchema,
  notes: z.string().optional(),
});

export type ConflictCheckResult = z.infer<typeof ConflictCheckResultSchema>;

export const DependencyPlanResultSchema = z.object({
  status: ArchitectRoleStatusSchema,
  roadmap_path: z.string(),
  nodes: z.array(z.string()).default([]),
  edges: z.array(z.object({ from: z.string(), to: z.string(), reason: z.string() })).default([]),
  blocked_items: z.array(z.string()).default([]),
  summary_path: SummaryPathSchema,
  notes: z.string().optional(),
});

export type DependencyPlanResult = z.infer<typeof DependencyPlanResultSchema>;

export const SopScoutResultSchema = z.object({
  status: ArchitectRoleStatusSchema,
  sop_paths: z.array(z.string()).default([]),
  runbookdev_fields_checked: z.array(z.string()).default([]),
  gaps: z.array(z.string()).default([]),
  summary_path: SummaryPathSchema,
  notes: z.string().optional(),
});

export type SopScoutResult = z.infer<typeof SopScoutResultSchema>;

export const DocLintResultSchema = z.object({
  status: ArchitectRoleStatusSchema,
  expectations: z.array(z.string()).default([]),
  violations: z.array(z.string()).default([]),
  summary_path: SummaryPathSchema,
  notes: z.string().optional(),
});

export type DocLintResult = z.infer<typeof DocLintResultSchema>;

export const SCHEMA_BY_ROLE = {
  'portfolio-auditor': PortfolioAuditResultSchema,
  'adr-drafter': AdrDraftResultSchema,
  'adr-polisher': AdrPolisherResultSchema,
  'conflict-checker': ConflictCheckResultSchema,
  'dependency-planner': DependencyPlanResultSchema,
  'sop-scout': SopScoutResultSchema,
  'doc-linter': DocLintResultSchema,
} as const;

export type RoleName = keyof typeof SCHEMA_BY_ROLE;
