import { join, resolve } from 'node:path';
import { SCHEMA_BY_ROLE, type RoleName } from './schemas';
import { validateSkill } from '../shared/validate-skill';

const REPO_ROOT = resolve(__dirname, '..', '..');
const SKILL_DIR = join(REPO_ROOT, '.claude', 'skills', 'architect');
const TEMPLATES_DIR = join(SKILL_DIR, 'templates');
const COMMAND_FILE = join(REPO_ROOT, '.claude', 'commands', 'architect.md');

const REQUIRED_TEMPLATES: RoleName[] = [
  'portfolio-auditor',
  'adr-drafter',
  'adr-polisher',
  'conflict-checker',
  'dependency-planner',
  'sop-scout',
  'doc-linter',
];

export function validateArchitectSkill(): { errors: string[] } {
  return validateSkill<RoleName>({
    repoRoot: REPO_ROOT,
    skillName: 'architect',
    skillDir: SKILL_DIR,
    templatesDir: TEMPLATES_DIR,
    commandFile: COMMAND_FILE,
    requiredTemplates: REQUIRED_TEMPLATES,
    schemaByRole: SCHEMA_BY_ROLE,
  });
}
