import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');

function read(rel: string): string {
  return readFileSync(join(REPO_ROOT, rel), 'utf8');
}

describe('architect doc graph conventions', () => {
  it('ships the ADR, proposal, SOP, and architecture convention docs', () => {
    expect(existsSync(join(REPO_ROOT, 'docs/adr/README.md'))).toBe(true);
    expect(existsSync(join(REPO_ROOT, 'docs/adr/_proposals/README.md'))).toBe(true);
    expect(existsSync(join(REPO_ROOT, 'docs/sops/README.md'))).toBe(true);
    expect(existsSync(join(REPO_ROOT, 'docs/architecture/production-readiness-taxonomy.md'))).toBe(
      true,
    );
    expect(existsSync(join(REPO_ROOT, 'docs/architecture/graph-manifest.json'))).toBe(true);
  });

  it('keeps proposal ADRs out of accepted ADR filenames', () => {
    const proposalsReadme = read('docs/adr/_proposals/README.md');
    expect(proposalsReadme).toMatch(/Proposed/i);
    expect(proposalsReadme).toMatch(/must not/i);
    expect(proposalsReadme).toMatch(/\.draft\.md/);
    expect(proposalsReadme).toMatch(/docs\/adr\/NNNN-/);
  });

  it('defines structural-only doc lint and conflict checks', () => {
    const adrReadme = read('docs/adr/README.md');
    const manifest = JSON.parse(read('docs/architecture/graph-manifest.json'));

    expect(adrReadme).toMatch(/structural/i);
    expect(adrReadme).toMatch(/not semantic/i);
    expect(manifest.conflict_checker.scope).toBe('structural');
    expect(manifest.doc_lint.expectations).toContain('proposal-adrs-stay-under-docs-adr-proposals');
  });

  it('tracks architect runtime state without ignoring proposal docs', () => {
    const gitignore = read('.gitignore');
    expect(gitignore).toMatch(/^\.architect\/$/m);
    expect(gitignore).not.toMatch(/^docs\/adr\/_proposals\/$/m);
  });
});
