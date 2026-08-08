/**
 * Self-heal enrichment backoff tests.
 *
 * Covers:
 *  1. The pure escalating-cooldown schedule (24h → 7d → 30d) and the terminal
 *     attempt threshold.
 *  2. That the schema's `enrichmentStatus` enum and the DB CHECK constraint
 *     (built from ENRICHMENT_STATUS_VALUES in run-migration) stay in sync — this
 *     catches the schema/constraint mismatch that would otherwise only surface
 *     as a runtime 500 (23514) when self-heal writes the terminal 'no_data'.
 */
import { communities } from '../shared/schema';
import { ENRICHMENT_STATUS_VALUES } from '../server/run-migration';
import {
  selfHealCooldownHours,
  SELF_HEAL_TERMINAL_ATTEMPTS,
} from '../server/self-heal-backoff';

describe('selfHealCooldownHours', () => {
  it('keeps the 24h floor for fresh / just-succeeded / first-failure communities', () => {
    expect(selfHealCooldownHours(0)).toBe(24);
    expect(selfHealCooldownHours(1)).toBe(24);
  });

  it('escalates 24h → 7d → 30d as consecutive no-data runs accumulate', () => {
    expect(selfHealCooldownHours(2)).toBe(24 * 7);
    expect(selfHealCooldownHours(3)).toBe(24 * 30);
    expect(selfHealCooldownHours(4)).toBe(24 * 30);
    expect(selfHealCooldownHours(10)).toBe(24 * 30);
  });

  it('crosses the terminal threshold only at the configured attempt count', () => {
    expect(SELF_HEAL_TERMINAL_ATTEMPTS).toBe(4);
    // attempt counts below the threshold are NOT terminal; at/above are.
    expect(3 >= SELF_HEAL_TERMINAL_ATTEMPTS).toBe(false);
    expect(4 >= SELF_HEAL_TERMINAL_ATTEMPTS).toBe(true);
  });
});

describe('enrichment_status schema ↔ DB CHECK constraint sync', () => {
  it("includes the terminal 'no_data' value in both the schema enum and the constraint", () => {
    const schemaValues = (communities.enrichmentStatus as any).enumValues as string[];
    expect(schemaValues).toContain('no_data');
    expect(ENRICHMENT_STATUS_VALUES).toContain('no_data');
  });

  it('has no drift between the schema enum and the migration constraint values', () => {
    const schemaValues = [...((communities.enrichmentStatus as any).enumValues as string[])].sort();
    const constraintValues = [...ENRICHMENT_STATUS_VALUES].sort();
    // Any value writable per the schema must be allowed by the DB CHECK
    // constraint, or that write fails at runtime with 23514.
    expect(constraintValues).toEqual(schemaValues);
  });
});
