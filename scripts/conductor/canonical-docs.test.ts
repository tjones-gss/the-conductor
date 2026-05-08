import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');

function read(rel: string): string {
  return readFileSync(join(REPO_ROOT, rel), 'utf8');
}

/**
 * Canonical, user-facing docs must not regress to v0.1 phase counts or merged
 * ship/doc split. Design history lives in conductor-design.md and is exempt.
 */
describe('canonical markdown (v0.2 drift guard)', () => {
  const commandMd = read('.claude/commands/conductor.md');
  const skillMd = read('.claude/skills/conductor/SKILL.md');
  const gitignore = read('.gitignore');
  const readme = read('README.md');
  const designSpec = read('docs/superpowers/specs/conductor-design.md');
  const kbReadme = read('docs/kb/README.md');

  it('slash command describes phases 0–5 only', () => {
    expect(commandMd).toMatch(/phases[^\n]*0[–-]5/i);
    expect(commandMd).not.toMatch(/through[^\n]*phases[^\n]*0[–-]7/i);
    expect(commandMd).not.toMatch(/\b[Pp]hase\s+7\b/);
  });

  it('README describes the five shipped phases and twelve templates', () => {
    expect(readme).toMatch(/\*\*Phase\s+5\s+[—\-]\s*Retrospective\*\*/i);
    expect(readme).toMatch(/\*\*Phase\s+4\s+[—\-]\s*Ship\*\*/i);
    expect(readme).toMatch(/12\s+role\s+templates/i);
    expect(readme).not.toMatch(/14\s+role\s+templates/i);
    expect(readme).not.toMatch(/through[^\n]*phases[^\n]*0[–-]7/i);
    expect(readme).not.toMatch(/\bend of [Pp]hase\s+7\b/);
    expect(readme).not.toMatch(
      /\b[Dd]ocument\b[^\n]{0,80}\b[Jj]ournalist\b[^\n]{0,40}\bknowledge-curator\b/i,
    );
  });

  it('SKILL.md preserves canonical v0.2 phase, role, and acceptance-command wording', () => {
    expect(skillMd).toMatch(/## Phase flow \(5 phases \+ cleanup tail\)/i);
    expect(skillMd).toMatch(/\b12 schemas in `SCHEMA_BY_ROLE`/i);
    expect(skillMd).toMatch(/## Roster \(12 roles\)/i);
    expect(skillMd).toMatch(/\bacceptance_commands_required\b/);
    expect(skillMd).not.toMatch(/\b[Pp]hase\s+7\b/);
  });

  it('.gitignore excludes conductor runtime state', () => {
    expect(gitignore).toMatch(/^\.conductor\/$/m);
  });

  it('design spec marks v0.2 as canonical and v0.1 as historical', () => {
    expect(designSpec).toMatch(/Canonical phase flow \(v0\.2: phases 0[–-]5\)/i);
    expect(designSpec).toMatch(/Historical \(v0\.1\): agent roster and lifecycle/i);
    expect(designSpec).toMatch(/Historical \(v0\.1\): seven-phase diagram/i);
    expect(designSpec).toMatch(/Archive only/i);
  });

  it('KB README attributes KB deltas to journalist (v0.2)', () => {
    expect(kbReadme).toMatch(/\bjournalist\b/i);
    expect(kbReadme).not.toMatch(
      /\bwritten by (the )?[`']?knowledge-curator\b/i,
    );
  });
});
