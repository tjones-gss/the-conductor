import { describe, it, expect } from 'vitest';
import { validateArchitectSkill } from './validate-skill';

describe('validateArchitectSkill', () => {
  it('returns an errors array', () => {
    const result = validateArchitectSkill();
    expect(result).toHaveProperty('errors');
    expect(Array.isArray(result.errors)).toBe(true);
    for (const e of result.errors) {
      expect(typeof e).toBe('string');
    }
  });

  it('reports zero errors once architect command, skill, and templates are assembled', () => {
    const result = validateArchitectSkill();
    if (result.errors.length > 0) {
      throw new Error(
        `validator reported ${result.errors.length} error(s):\n  - ${result.errors.join('\n  - ')}`,
      );
    }
    expect(result.errors).toEqual([]);
  });
});
