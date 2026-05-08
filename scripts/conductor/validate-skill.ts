import { join, resolve } from 'node:path';
import { SCHEMA_BY_ROLE, type RoleName } from './schemas';
import { validateSkill } from '../shared/validate-skill';

const REPO_ROOT = resolve(__dirname, '..', '..');
const SKILL_DIR = join(REPO_ROOT, '.claude', 'skills', 'conductor');
const TEMPLATES_DIR = join(SKILL_DIR, 'templates');
const COMMAND_FILE = join(REPO_ROOT, '.claude', 'commands', 'conductor.md');

// 12 roles after the v0.2 merges (planner+task-splitter, journalist+kb-curator).
const REQUIRED_TEMPLATES: RoleName[] = [
  'worker',
  'test-writer',
  'validator',
  'critic',
  'scope-judge',
  'premortem',
  'spec-writer',
  'planner',
  'ratifier',
  'shipper',
  'journalist',
  'retrospective',
];

// v0.1 roles that were removed in v0.2 — fail if their template files are
// still present, so a stale install can't quietly run with the old roster.
const REMOVED_TEMPLATES = ['task-splitter.md', 'knowledge-curator.md'];

export function validateConductorSkill(): { errors: string[] } {
  return validateSkill<RoleName>({
    repoRoot: REPO_ROOT,
    skillName: 'conductor',
    skillDir: SKILL_DIR,
    templatesDir: TEMPLATES_DIR,
    commandFile: COMMAND_FILE,
    requiredTemplates: REQUIRED_TEMPLATES,
    removedTemplates: REMOVED_TEMPLATES,
    schemaByRole: SCHEMA_BY_ROLE,
  });
}
