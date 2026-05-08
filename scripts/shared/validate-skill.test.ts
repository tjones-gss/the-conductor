import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { validateSkill } from './validate-skill';

function withTempSkill(fn: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), 'skill-validator-'));
  try {
    fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

describe('validateSkill', () => {
  it('fails when a later JSON example is invalid even if the first one is valid', () => {
    withTempSkill((root) => {
      const skillDir = join(root, '.claude', 'skills', 'demo');
      const templatesDir = join(skillDir, 'templates');
      const commandFile = join(root, '.claude', 'commands', 'demo.md');

      mkdirSync(templatesDir, { recursive: true });
      mkdirSync(join(root, '.claude', 'commands'), { recursive: true });

      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: demo
description: Demo skill for validator regression coverage.
---

# Demo

This body is deliberately long enough to pass the minimum skill-length check.
`,
      );
      writeFileSync(commandFile, 'Invoke demo.\n');
      writeFileSync(
        join(templatesDir, 'demo-role.md'),
        `# Role: demo-role

Valid example:

\`\`\`json
{
  "status": "ok"
}
\`\`\`

Invalid later example:

\`\`\`json
{
  "status": "nope"
}
\`\`\`
`,
      );

      const result = validateSkill({
        repoRoot: root,
        skillName: 'demo',
        skillDir,
        commandFile,
        requiredTemplates: ['demo-role'],
        schemaByRole: {
          'demo-role': z.object({ status: z.literal('ok') }),
        },
        minSkillLength: 50,
      });

      expect(result.errors.join('\n')).toMatch(/Invalid literal value/);
    });
  });
});
