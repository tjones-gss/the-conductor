import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { ZodTypeAny } from 'zod';

type SchemaByRole<RoleName extends string> = Record<RoleName, ZodTypeAny>;

export type SkillValidationConfig<RoleName extends string> = {
  repoRoot: string;
  skillName: string;
  skillDir: string;
  templatesDir?: string;
  commandFile: string;
  requiredTemplates: readonly RoleName[];
  removedTemplates?: readonly string[];
  schemaByRole: SchemaByRole<RoleName>;
  minSkillLength?: number;
};

export type SkillValidationResult = { errors: string[] };

const FRONTMATTER_DESC = /^description:\s*\S.*$/m;
const TEMPLATE_HEADING = /^#\s+Role:\s*(\S+)/m;
const TEMPLATE_VAR = /\{\{[^}]+\}\}/g;
const JSON_FENCE = /```json\s*\n([\s\S]*?)\n```/g;

function extractJsonBlocks(body: string): string[] {
  return Array.from(body.matchAll(JSON_FENCE), (m) => m[1] ?? '');
}

function replacePlaceholders(json: string): string {
  return json.replace(TEMPLATE_VAR, '__placeholder__');
}

function checkRoleExampleJson<RoleName extends string>(
  role: RoleName,
  body: string,
  schemaByRole: SchemaByRole<RoleName>,
): string | null {
  const schema = schemaByRole[role];
  const blocks = extractJsonBlocks(body);
  if (blocks.length === 0) {
    return `template ${role}.md has no \`\`\`json example block`;
  }

  const errors: string[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!;
    const substituted = replacePlaceholders(block);
    let parsed: unknown;
    try {
      parsed = JSON.parse(substituted);
    } catch (e) {
      errors.push(
        `block ${i + 1}: not valid JSON after placeholder substitution (${(e as Error).message})`,
      );
      continue;
    }
    const result = schema.safeParse(parsed);
    if (!result.success) {
      errors.push(`block ${i + 1}: ${result.error.issues.map((iss) => iss.message).join('; ')}`);
    }
  }
  if (errors.length > 0) {
    return `template ${role}.md example JSON does not match SCHEMA_BY_ROLE.${role}: ${errors.join(' | ')}`;
  }
  return null;
}

function checkTemplateNonEmpty(filePath: string, body: string): string | null {
  if (body.trim().length < 50) {
    return `template ${filePath} is empty or near-empty (< 50 non-whitespace chars)`;
  }
  return null;
}

function checkTemplateHeading<RoleName extends string>(
  filePath: string,
  role: RoleName,
  body: string,
): string | null {
  const m = body.match(TEMPLATE_HEADING);
  if (!m) {
    return `template ${filePath} missing \`# Role: ${role}\` heading`;
  }
  if (m[1] !== role) {
    return `template ${filePath} role heading is "${m[1]}", expected "${role}"`;
  }
  return null;
}

export function validateSkill<RoleName extends string>(
  config: SkillValidationConfig<RoleName>,
): SkillValidationResult {
  const errors: string[] = [];
  const templatesDir = config.templatesDir ?? join(config.skillDir, 'templates');
  const minSkillLength = config.minSkillLength ?? 1000;

  if (!existsSync(config.skillDir)) {
    errors.push(`missing dir: ${config.skillDir}`);
    return { errors };
  }

  const skillMd = join(config.skillDir, 'SKILL.md');
  if (!existsSync(skillMd)) {
    errors.push(`missing file: ${skillMd}`);
  } else {
    const body = readFileSync(skillMd, 'utf8');
    const frontmatterName = new RegExp(`^name:\\s*${config.skillName}\\s*$`, 'm');
    if (!body.startsWith('---')) errors.push('SKILL.md missing frontmatter');
    if (!frontmatterName.test(body)) {
      errors.push(`SKILL.md frontmatter missing or wrong \`name: ${config.skillName}\``);
    }
    if (!FRONTMATTER_DESC.test(body)) errors.push('SKILL.md frontmatter missing `description`');
    if (body.length < minSkillLength) {
      errors.push(`SKILL.md suspiciously short (< ${minSkillLength} chars)`);
    }
  }

  if (!existsSync(templatesDir)) {
    errors.push(`missing dir: ${templatesDir}`);
    return { errors };
  }

  const present = new Set(readdirSync(templatesDir));

  for (const role of config.requiredTemplates) {
    const file = `${role}.md`;
    if (!present.has(file)) {
      errors.push(`missing template: ${file}`);
      continue;
    }
    const filePath = join(templatesDir, file);
    const body = readFileSync(filePath, 'utf8');

    const emptyErr = checkTemplateNonEmpty(file, body);
    if (emptyErr) errors.push(emptyErr);

    const headingErr = checkTemplateHeading(file, role, body);
    if (headingErr) errors.push(headingErr);

    if (!emptyErr && !headingErr) {
      const schemaErr = checkRoleExampleJson(role, body, config.schemaByRole);
      if (schemaErr) errors.push(schemaErr);
    }
  }

  for (const removed of config.removedTemplates ?? []) {
    if (present.has(removed)) {
      errors.push(`stale removed template still present: ${removed}`);
    }
  }

  if (!existsSync(config.commandFile)) {
    errors.push(`missing slash command: ${config.commandFile}`);
  }

  return { errors };
}
