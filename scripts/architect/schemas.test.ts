import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  ArchitectStatusSchema,
  AdrDraftResultSchema,
  AdrPolisherResultSchema,
  ConflictCheckResultSchema,
  DependencyPlanResultSchema,
  DocLintResultSchema,
  PortfolioAuditResultSchema,
  SopScoutResultSchema,
  SCHEMA_BY_ROLE,
} from './schemas';

const fx = (name: string) => JSON.parse(readFileSync(resolve(__dirname, 'fixtures', name), 'utf8'));

describe('ArchitectStatusSchema', () => {
  it('parses a valid brownfield status', () => {
    expect(() => ArchitectStatusSchema.parse(fx('status.valid.json'))).not.toThrow();
  });

  it('rejects an implicit mode', () => {
    const bad = { ...fx('status.valid.json') };
    delete bad.mode;
    expect(() => ArchitectStatusSchema.parse(bad)).toThrow();
  });

  it('rejects accepted ADR output paths for proposals', () => {
    expect(() =>
      ArchitectStatusSchema.parse({
        ...fx('status.valid.json'),
        proposal_paths: ['docs/adr/0042-payments.md'],
      }),
    ).toThrow(/docs\/adr\/_proposals/);
  });
});

describe('architect role schemas', () => {
  it('parses a portfolio audit result without claiming full coverage', () => {
    expect(() => PortfolioAuditResultSchema.parse(fx('portfolio-audit.valid.json'))).not.toThrow();
    expect(() =>
      PortfolioAuditResultSchema.parse({
        status: 'ok',
        mode: 'brownfield',
        coverage_status: 'complete',
        audited_paths: ['docs/adr'],
        gaps: [],
        summary_path: '.architect/0042/dispatches/0001-portfolio-auditor.md',
      }),
    ).toThrow();
  });

  it('requires adr-drafter proposals to stay in docs/adr/_proposals', () => {
    expect(() => AdrDraftResultSchema.parse(fx('adr-draft.valid.json'))).not.toThrow();
    expect(() =>
      AdrDraftResultSchema.parse({
        status: 'ok',
        proposal_path: 'docs/adr/0042-payments.md',
        decision_source: 'user_one_line',
        binding_decision_claimed: false,
        summary_path: '.architect/0042/dispatches/0002-adr-drafter.md',
      }),
    ).toThrow(/docs\/adr\/_proposals/);
  });

  it('requires draft suffix for proposal paths', () => {
    expect(() =>
      AdrDraftResultSchema.parse({
        status: 'ok',
        proposal_path: 'docs/adr/_proposals/0042-payments.md',
        decision_source: 'user_one_line',
        binding_decision_claimed: false,
        summary_path: '.architect/0042/dispatches/0002-adr-drafter.md',
      }),
    ).toThrow(/draft\.md/);
  });

  it('rejects adr-drafter returns that claim binding decisions', () => {
    expect(() =>
      AdrDraftResultSchema.parse({
        status: 'ok',
        proposal_path: 'docs/adr/_proposals/0042-payments.draft.md',
        decision_source: 'user_one_line',
        binding_decision_claimed: true,
        summary_path: '.architect/0042/dispatches/0002-adr-drafter.md',
      }),
    ).toThrow(/binding/);
  });

  it('parses the remaining architect role summaries', () => {
    expect(() => AdrPolisherResultSchema.parse(fx('adr-polish.valid.json'))).not.toThrow();
    expect(() => ConflictCheckResultSchema.parse(fx('conflict-check.valid.json'))).not.toThrow();
    expect(() => DependencyPlanResultSchema.parse(fx('dependency-plan.valid.json'))).not.toThrow();
    expect(() => SopScoutResultSchema.parse(fx('sop-scout.valid.json'))).not.toThrow();
    expect(() => DocLintResultSchema.parse(fx('doc-lint.valid.json'))).not.toThrow();
  });

  it('requires adr-polisher outputs to remain proposal drafts', () => {
    expect(() =>
      AdrPolisherResultSchema.parse({
        status: 'ok',
        input_path: 'docs/adr/0042-payments.md',
        output_path: 'docs/adr/0042-payments.md',
        standards_applied: ['MADR'],
        semantic_decisions_added: false,
        summary_path: '.architect/0042/dispatches/0003-adr-polisher.md',
      }),
    ).toThrow(/docs\/adr\/_proposals/);
  });
});

describe('SCHEMA_BY_ROLE registry', () => {
  it('exposes all seven architect roles', () => {
    expect(Object.keys(SCHEMA_BY_ROLE).sort()).toEqual([
      'adr-drafter',
      'adr-polisher',
      'conflict-checker',
      'dependency-planner',
      'doc-linter',
      'portfolio-auditor',
      'sop-scout',
    ]);
  });
});
