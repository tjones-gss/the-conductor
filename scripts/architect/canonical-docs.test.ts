import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');

function read(rel: string): string {
  return readFileSync(join(REPO_ROOT, rel), 'utf8');
}

describe('architect canonical documentation', () => {
  it('documents the planned command surface', () => {
    const command = read('.claude/commands/architect.md');
    const skill = read('.claude/skills/architect/SKILL.md');

    for (const phrase of [
      '/architect audit',
      '/architect generate --decision',
      '/architect polish <NNNN>',
      '/architect roadmap',
      '/architect status',
      '/architect abort',
    ]) {
      expect(command).toContain(phrase);
      expect(skill).toContain(phrase);
    }
  });

  it('keeps kernel-of-truth and proposal guardrails visible', () => {
    const skill = read('.claude/skills/architect/SKILL.md');
    const adrReadme = read('docs/adr/README.md');

    expect(skill).toMatch(/Kernel-of-truth/i);
    expect(skill).toMatch(/must not invent binding decisions/i);
    expect(skill).toMatch(/infer `brownfield`/);
    expect(skill).toMatch(/docs\/adr\/_proposals\/NNNN-<slug>\.draft\.md/);
    expect(adrReadme).toMatch(/human/i);
    expect(adrReadme).toMatch(/\.draft\.md/);
  });

  it('declares adopted standards and structural-only conflict scope', () => {
    const skill = read('.claude/skills/architect/SKILL.md');
    const adrReadme = read('docs/adr/README.md');

    for (const standard of ['MADR', 'DECIDER', 'Nygard', 'runbookdev']) {
      expect(skill).toContain(standard);
    }
    expect(adrReadme).toMatch(/structural/i);
    expect(adrReadme).toMatch(/not semantic/i);
  });
});
