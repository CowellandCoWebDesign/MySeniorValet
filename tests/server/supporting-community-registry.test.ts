/**
 * @jest-environment node
 *
 * Focused tests for the Supporting-Community Registry (Task #483) pure helpers
 * and seed-data integrity. These do not touch the database — they verify the
 * normalization/keying contract that the idempotent seed and eligibility
 * evaluator depend on, plus the shared enum contract.
 */

import { describe, it, expect, jest } from '@jest/globals';

// The module imports ../db at load time; stub it so importing the pure helpers
// never opens a real connection.
jest.mock('../../server/db', () => ({ db: { execute: jest.fn(), transaction: jest.fn() } }));

import {
  normalizeName,
  normalizeDomain,
  identityKey,
  stateAliases,
  SEED_FAMILIES,
  SEED_PROPOSED_FAMILIES,
  SEED_APPROVALS,
  SEED_EXCLUSIONS,
} from '../../server/services/supporting-community-registry';
import {
  SUPPORTING_STATUSES,
  SUPPORTING_EXCLUSION_REASONS,
} from '../../shared/schema';

describe('normalization helpers', () => {
  it('normalizeName lowercases, trims, and collapses whitespace', () => {
    expect(normalizeName('  Atria   Senior  Living ')).toBe('atria senior living');
    expect(normalizeName('OAKMONT')).toBe('oakmont');
  });

  it('normalizeDomain strips scheme, www, path, and query', () => {
    expect(normalizeDomain('https://www.mosaicms.com/about?x=1')).toBe('mosaicms.com');
    expect(normalizeDomain('HTTP://Discovery Senior Living'.replace(' ', ''))).toContain('discovery');
    expect(normalizeDomain('brookdale.com')).toBe('brookdale.com');
    expect(normalizeDomain('')).toBe('');
  });

  it('identityKey builds a deterministic name|city|state key', () => {
    expect(identityKey('Oakmont of Redding', 'Redding', 'California')).toBe(
      'oakmont of redding|redding|california',
    );
    // Case / whitespace insensitive so seeding is idempotent across sources.
    expect(identityKey(' oakmont OF redding ', ' REDDING ', 'california')).toBe(
      'oakmont of redding|redding|california',
    );
  });

  it('stateAliases maps CA <-> California both ways for community resolution', () => {
    expect(stateAliases('California')).toEqual(expect.arrayContaining(['california', 'ca']));
    expect(stateAliases('CA')).toEqual(expect.arrayContaining(['california', 'ca']));
    // Unknown states fall back to their own normalized value.
    expect(stateAliases('Texas')).toEqual(['texas']);
  });
});

describe('seed data integrity', () => {
  it('every seed family has a unique slug', () => {
    const slugs = SEED_FAMILIES.map((f) => f.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('includes the named approved operator families from the task', () => {
    const names = SEED_FAMILIES.map((f) => f.name);
    for (const expected of [
      'Atria Management Company',
      'Discovery Senior Living',
      'Mosaic Management Services',
      'Titan SenQuest',
      'Oakmont Management Group',
      'Brookdale Senior Living',
    ]) {
      expect(names).toContain(expected);
    }
  });

  it('Discovery family carries its verified regional brand aliases', () => {
    const discovery = SEED_FAMILIES.find((f) => f.slug === 'discovery-senior-living')!;
    for (const alias of [
      'Integral Senior Living',
      'Morada Senior Living',
      'TerraBella Senior Living',
      'Provincial Senior Living',
    ]) {
      expect(discovery.aliases).toContain(alias);
    }
  });

  it('Mosaic anchors on the canonical mosaicms.com domain', () => {
    const mosaic = SEED_FAMILIES.find((f) => f.slug === 'mosaic-management-services')!;
    expect(mosaic.domains).toContain('mosaicms.com');
  });

  it('standalone approvals use exact name+city+state and are unique by key', () => {
    const keys = SEED_APPROVALS.map((a) => identityKey(a.name, a.city, a.state));
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain('sundial assisted living|redding|california');
  });

  it('permanent exclusions only use valid reasons', () => {
    for (const excl of SEED_EXCLUSIONS) {
      expect(SUPPORTING_EXCLUSION_REASONS).toContain(excl.reason);
    }
  });

  it('Brookdale Redding is a permanent closed exclusion (overrides Brookdale family)', () => {
    const brookdale = SEED_EXCLUSIONS.find((e) => e.name === 'Brookdale Redding')!;
    expect(brookdale).toBeDefined();
    expect(brookdale.reason).toBe('closed');
    // And Brookdale Senior Living IS an approved family — exclusion must win.
    expect(SEED_FAMILIES.map((f) => f.name)).toContain('Brookdale Senior Living');
  });

  it('River Commons is excluded as no_referrals', () => {
    const river = SEED_EXCLUSIONS.find((e) => e.name === 'River Commons Senior Living')!;
    expect(river.reason).toBe('no_referrals');
  });

  it('Sundial management family is PROPOSED (identity unknown) while the community stays individually approved', () => {
    // The verified management company is not known in evidence — proposed only.
    const sundialFamily = SEED_PROPOSED_FAMILIES.find((f) => f.slug === 'sundial-management-pending');
    expect(sundialFamily).toBeDefined();
    // Not a hard-coded approved family.
    expect(SEED_FAMILIES.map((f) => f.slug)).not.toContain('sundial-management-pending');
    // The community itself remains individually approved.
    const sundialApproval = SEED_APPROVALS.find((a) => a.name === 'Sundial Assisted Living');
    expect(sundialApproval).toBeDefined();
  });
});


describe('brand-prefix matching seeds', () => {
  it('distinctive brand naming conventions are approved prefixes', () => {
    const bySlug = Object.fromEntries(SEED_FAMILIES.map((f: any) => [f.slug, f]));
    expect(bySlug['brookdale-senior-living'].prefixes).toContain('brookdale');
    expect(bySlug['oakmont-management-group'].prefixes).toContain('oakmont of');
    expect(bySlug['atria-management-company'].prefixes).toEqual(
      expect.arrayContaining(['atria', 'holiday by atria']),
    );
    expect(bySlug['discovery-senior-living'].prefixes).toEqual(
      expect.arrayContaining(['terrabella', 'morada', 'discovery village', 'lakehouse']),
    );
  });

  it('ambiguous prefixes are review-only, never auto-approved', () => {
    const bySlug = Object.fromEntries(SEED_FAMILIES.map((f: any) => [f.slug, f]));
    // "Holiday" and "Provincial" can match unrelated entities.
    expect(bySlug['atria-management-company'].reviewPrefixes).toContain('holiday');
    expect(bySlug['atria-management-company'].prefixes).not.toContain('holiday');
    expect(bySlug['discovery-senior-living'].reviewPrefixes).toContain('provincial');
    expect(bySlug['discovery-senior-living'].prefixes ?? []).not.toContain('provincial');
    // Mosaic must never get a loose prefix (spec: unrelated "Mosaic" companies).
    expect(bySlug['mosaic-management-services'].prefixes ?? []).toEqual([]);
    expect(bySlug['mosaic-management-services'].reviewPrefixes ?? []).toEqual([]);
  });
});

describe('shared enum contract', () => {
  it('statuses match the required set', () => {
    expect([...SUPPORTING_STATUSES].sort()).toEqual(
      ['approved', 'proposed', 'rejected', 'revoked'].sort(),
    );
  });

  it('exclusion reasons match the required set', () => {
    expect([...SUPPORTING_EXCLUSION_REASONS].sort()).toEqual(
      ['closed', 'duplicate', 'no_referrals', 'other'].sort(),
    );
  });
});
