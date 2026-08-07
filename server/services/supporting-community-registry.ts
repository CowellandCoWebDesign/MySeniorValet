/**
 * Supporting-Community Registry (Task #483)
 * ------------------------------------------
 * The single controlled referral-support registry. It decides which
 * communities MySeniorValet may publicly offer, using a restrictive
 * allowlist policy that the public predicate in
 * `server/utils/community-ranking.ts` enforces:
 *
 *   eligible = active AND not-hidden
 *              AND NOT community-level exclusion (community_id OR name|city|state key)
 *              AND (individually approved
 *                   OR approved match to an APPROVED operator family)
 *
 * Community-level exclusions ALWAYS win over any operator/brand inheritance.
 *
 * This module owns the WRITE side (the public predicate owns the read side) and
 * mirrors the EXACT table/column/gate names the public predicate reads:
 *   supporting_operator_families(status)
 *   supporting_operator_aliases / supporting_operator_domains  (matching inputs)
 *   supporting_community_matches(family_id, community_id, status)
 *   supporting_community_approvals(community_id, approval_key, status)
 *   supporting_community_exclusions(community_id, exclusion_key)
 *   gate: platform_settings key `supporting_community_registry_gate` (object with .enabled)
 *
 * Key integration guarantees:
 *   - approvals/exclusions RESOLVE community_id via EXACT normalized name+city
 *     and STATE ALIASES (CA/California).
 *   - effective eligibleCount counts ONLY existing active/not-hidden communities
 *     with a non-null id; the gate NEVER enables on unresolved registry rows.
 *   - matches populated ONLY from safe corroboration (exact website host/domain
 *     or exact normalized alias) — loose substring is FORBIDDEN.
 *   - re-seed NEVER overwrites an admin revoke/reject: INSERT defaults only,
 *     existing status preserved; the very first seed inserts approved.
 */

import { db } from "../db";
import { sql } from "drizzle-orm";
import {
  SUPPORTING_STATUSES,
  SUPPORTING_EXCLUSION_REASONS,
} from "@shared/schema";

// Public gate key read by server/utils/community-ranking.ts.
export const REGISTRY_GATE_KEY = "supporting_community_registry_gate";

// ---------------------------------------------------------------------------
// Normalization helpers (single source of truth for keys / matching)
// ---------------------------------------------------------------------------

export function normalizeName(value: string): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

/** Exact identity key (name|city|state) matching the public predicate. */
export function identityKey(name: string, city: string, state: string): string {
  return [normalizeName(name), normalizeName(city), normalizeName(state)].join("|");
}

/** Bare registrable domain (strip scheme/path/www), lowercased. */
export function normalizeDomain(value: string): string {
  if (!value) return "";
  let d = value.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "");
  d = d.replace(/^www\./, "");
  d = d.split("/")[0].split("?")[0];
  return d;
}

/**
 * State aliases so the seed can resolve a stored community whether its state is
 * "California" or "CA". Two-way map keyed by normalized value.
 */
const STATE_ALIASES: Record<string, string[]> = {
  california: ["california", "ca"],
  ca: ["california", "ca"],
  hawaii: ["hawaii", "hi"],
  hi: ["hawaii", "hi"],
};

export function stateAliases(state: string): string[] {
  const n = normalizeName(state);
  return STATE_ALIASES[n] ?? [n];
}

// ---------------------------------------------------------------------------
// Seed data — the initial admin-approved allowlist (from task-483.md)
// ---------------------------------------------------------------------------

interface SeedFamily {
  name: string;
  slug: string;
  aliases: string[];
  /**
   * Token-boundary brand-name prefixes (e.g. "brookdale" matches "Brookdale
   * Redding" but NOT "Brookdales"). Only distinctive brand naming conventions
   * belong here — matches are auto-APPROVED under the family.
   */
  prefixes?: string[];
  /**
   * Ambiguous prefixes ("holiday", "provincial") that may hit unrelated
   * entities. Matches are created as status='proposed' for admin review only —
   * they never publish automatically.
   */
  reviewPrefixes?: string[];
  domains: string[];
  evidenceNotes?: string;
}

export const SEED_FAMILIES: SeedFamily[] = [
  {
    name: "Atria Management Company",
    slug: "atria-management-company",
    aliases: [
      "Atria Senior Living",
      "Atria Park",
      "Atria Signature Collection",
      "Holiday by Atria",
      "Coterie Luxury Senior Living",
      "Atria Retirement Canada",
    ],
    // Atria's portfolio uses consistent brand-prefixed community names
    // ("Atria <Name>", "Holiday by Atria <Name>", "Coterie <Name>").
    prefixes: ["atria", "holiday by atria", "coterie"],
    // Legacy "Holiday <Name>" / "Holiday Retirement <Name>" records may be
    // Holiday Retirement properties, but "Holiday" also hits unrelated
    // entities (apartments, care homes) — admin review, never auto-publish.
    reviewPrefixes: ["holiday", "holiday retirement"],
    domains: [
      "atriaseniorliving.com",
      "coterieseniorliving.com",
      "holidayseniorliving.com",
      "atriaretirement.ca",
    ],
  },
  {
    name: "Discovery Senior Living",
    slug: "discovery-senior-living",
    aliases: [
      "Discovery Senior Living",
      "Integral Senior Living",
      "Morada Senior Living",
      "TerraBella Senior Living",
      "SummerHouse Senior Living",
      "Seaton Senior Living",
      "LakeHouse Senior Living",
      "Discovery Village",
      "Conservatory",
      "Calligraphy",
      "Provincial Senior Living",
      "Hilltop Estates",
      "Shasta Estates",
      "The Oakmont - A Provincial Senior Living Community",
      "Provincial Chico",
    ],
    // Discovery's regional brands use distinctive brand-prefixed names.
    prefixes: [
      "terrabella",
      "morada",
      "summerhouse",
      "seaton",
      "lakehouse",
      "discovery village",
      "calligraphy",
      "the conservatory at",
      "conservatory at",
      "integral senior living",
    ],
    // Generic words that can match unrelated entities — review only.
    reviewPrefixes: ["provincial", "integral", "conservatory"],
    domains: [
      "discoveryseniorliving.com",
      "discoveryvillages.com",
      "terrabellaseniorliving.com",
      "moradaseniorliving.com",
      "summerhouseseniorliving.com",
      "seatonseniorliving.com",
      "lakehouseseniorliving.com",
    ],
  },
  {
    name: "Mosaic Management Services",
    slug: "mosaic-management-services",
    aliases: ["Hilltop Springs Senior Living"],
    domains: ["mosaicms.com"],
    evidenceNotes:
      "Anchor on Hilltop Springs Senior Living + canonical mosaicms.com identity. Do not match unrelated 'Mosaic' companies.",
  },
  {
    name: "Titan SenQuest",
    slug: "titan-senquest",
    aliases: ["Red Bluff Senior Living"],
    domains: [],
    evidenceNotes: "Confirmed operator/management company for Red Bluff Senior Living.",
  },
  {
    name: "Oakmont Management Group",
    slug: "oakmont-management-group",
    aliases: ["Oakmont Senior Living", "Oakmont of Redding"],
    // Oakmont's portfolio is consistently named "Oakmont of <City>". Ivy
    // Living (ivyliving.com) is Oakmont Management Group's sister brand —
    // approved by verified domain; "the ivy" name-prefix goes to review.
    prefixes: ["oakmont of"],
    reviewPrefixes: ["the ivy"],
    domains: ["oakmontseniorliving.com", "oakmontmg.com", "ivyliving.com"],
    evidenceNotes: "Supersedes the earlier Redding-only Oakmont approval; approve full corroborated portfolio.",
  },
  {
    name: "Brookdale Senior Living",
    slug: "brookdale-senior-living",
    aliases: ["Brookdale Senior Living"],
    // Brookdale names every community "Brookdale <Name>".
    prefixes: ["brookdale"],
    domains: ["brookdale.com"],
    evidenceNotes: "Approve verified current portfolio, subject to individual exclusions (e.g. Brookdale Redding closed).",
  },
];

/**
 * Proposed families whose canonical management identity is NOT yet known in
 * code/evidence. They enter the review queue (status='proposed') and do NOT
 * inherit public approval. The Sundial community itself is preserved as an
 * INDIVIDUAL approval below, so it stays eligible while its management family is
 * under review.
 */
export const SEED_PROPOSED_FAMILIES: SeedFamily[] = [
  {
    name: "Sundial Assisted Living (management — pending identity)",
    slug: "sundial-management-pending",
    aliases: [],
    domains: [],
    evidenceNotes:
      "Sundial Assisted Living's verified management company is not yet identified from authoritative evidence. " +
      "Proposed for admin review; do NOT infer from a shared word or third-party directory. " +
      "The Sundial Assisted Living community is individually approved in the meantime.",
  },
];

interface SeedApproval {
  name: string;
  city: string;
  state: string;
}

export const SEED_APPROVALS: SeedApproval[] = [
  { name: "Oakmont of Redding", city: "Redding", state: "California" },
  { name: "Sundial Assisted Living", city: "Redding", state: "California" },
  { name: "Hilltop Estates", city: "Redding", state: "California" },
  { name: "Shasta Estates", city: "Redding", state: "California" },
  { name: "Hilltop Springs Senior Living", city: "Redding", state: "California" },
  { name: "The Oakmont / Provincial Chico", city: "Chico", state: "California" },
  { name: "Red Bluff Senior Living", city: "Red Bluff", state: "California" },
];

interface SeedExclusion {
  name: string;
  city: string;
  state: string;
  reason: (typeof SUPPORTING_EXCLUSION_REASONS)[number];
  note?: string;
}

export const SEED_EXCLUSIONS: SeedExclusion[] = [
  {
    name: "River Commons Senior Living",
    city: "Redding",
    state: "California",
    reason: "no_referrals",
    note: "Does not accept MySeniorValet referrals.",
  },
  { name: "Sierra Oaks", city: "Redding", state: "California", reason: "other", note: "Admin excluded." },
  {
    name: "Brookdale Redding",
    city: "Redding",
    state: "California",
    reason: "closed",
    note: "Confirmed closed and no longer operating.",
  },
  { name: "Lavender Hills", city: "Redding", state: "California", reason: "other", note: "Admin excluded." },
  {
    name: "Provincial Chico",
    city: "Chico",
    state: "California",
    reason: "duplicate",
    note: "Same property (phone 530-895-0123, provincialchico.com) as the canonical 'Oakmont of Chico' record.",
  },
  {
    name: "The Oakmont - A Provincial Senior Living Community",
    city: "Chico",
    state: "California",
    reason: "duplicate",
    note: "Same property (phone 530-895-0123, provincialchico.com) as the canonical 'Oakmont of Chico' record.",
  },
  {
    name: "Hawaii Kai Retirement Community Phase I and II",
    city: "Honolulu",
    state: "Hawaii",
    reason: "duplicate",
    note: "Same operator website as the canonical 'The Ivy Hawaii Kai' record (ivyliving.com) — legacy Holiday name for the rebranded Ivy Living community.",
  },
  {
    name: "The Ivy At Hawaii Kai",
    city: "Honolulu",
    state: "Hawaii",
    reason: "duplicate",
    note: "Aggregator-sourced duplicate of the canonical 'The Ivy Hawaii Kai' record.",
  },
  {
    name: "Oakmont Assisted Living and Memory Care",
    city: "Redding",
    state: "California",
    reason: "duplicate",
    note: "Non-destructive duplicate of the canonical Oakmont of Redding record.",
  },
];

/**
 * Evidence-backed reconciliation for the named Redding approvals. This only
 * enriches known records and hides a confirmed duplicate. It never changes
 * is_active, never clears an admin flag, and never restores visibility.
 */
async function reconcileApprovedReddingRecords(): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.execute(sql`
      UPDATE communities
      SET care_types = ARRAY['Assisted Living', 'Memory Care']::text[],
          enrichment_data = coalesce(enrichment_data, '{}'::jsonb) ||
            jsonb_build_object('supportingRegistryCareEvidence',
              jsonb_build_object(
                'source', 'A Place for Mom corroboration',
                'careTypes', ARRAY['Assisted Living', 'Memory Care']::text[]
              )),
          updated_at = now()
      WHERE lower(name) = 'hilltop springs senior living'
        AND lower(city) = 'redding'
        AND is_active = true
    `);

    await tx.execute(sql`
      UPDATE communities
      SET care_types = (
            SELECT ARRAY(SELECT DISTINCT value FROM unnest(
              coalesce(care_types, ARRAY[]::text[]) || ARRAY['Independent Living']::text[]
            ) value)
          ),
          data_quality_flags = (
            SELECT ARRAY(SELECT DISTINCT value FROM unnest(
              coalesce(data_quality_flags, ARRAY[]::text[]) || ARRAY['care_type_conflict_review']::text[]
            ) value)
          ),
          latitude = coalesce(latitude, 40.5996150),
          longitude = coalesce(longitude, -122.3706255),
          enrichment_data = coalesce(enrichment_data, '{}'::jsonb) ||
            jsonb_build_object(
              'supportingRegistryCareEvidence',
              jsonb_build_object(
                'source', 'official community independent-living page and Caring.com corroboration',
                'careTypes', ARRAY['Independent Living']::text[]
              ),
              'supportingRegistryGeocodeEvidence',
              jsonb_build_object('source', 'OpenStreetMap Nominatim', 'address', '451 Hilltop Drive, Redding, CA 96003')
            ),
          updated_at = now()
      WHERE lower(name) = 'hilltop estates'
        AND lower(city) = 'redding'
        AND is_active = true
    `);

    await tx.execute(sql`
      UPDATE communities
      SET address = CASE WHEN address IS NULL OR address !~ '^[0-9]+'
                         THEN '2150 Bechelli Lane, Redding, CA 96002'
                         ELSE address END,
          care_types = (
            SELECT ARRAY(SELECT DISTINCT value FROM unnest(
              coalesce(care_types, ARRAY[]::text[]) || ARRAY['Independent Living']::text[]
            ) value)
          ),
          latitude = coalesce(latitude, 40.5769153),
          longitude = coalesce(longitude, -122.3615349),
          enrichment_data = coalesce(enrichment_data, '{}'::jsonb) ||
            jsonb_build_object(
              'supportingRegistryCareEvidence',
              jsonb_build_object(
                'source', 'A Place for Mom corroboration',
                'careTypes', ARRAY['Independent Living', 'Assisted Living', 'Memory Care']::text[]
              ),
              'supportingRegistryGeocodeEvidence',
              jsonb_build_object('source', 'OpenStreetMap Nominatim', 'address', '2150 Bechelli Lane, Redding, CA 96002')
            ),
          updated_at = now()
      WHERE lower(name) = 'oakmont of redding'
        AND lower(city) = 'redding'
        AND is_active = true
    `);

    await tx.execute(sql`
      UPDATE communities
      SET address = CASE WHEN address IS NULL OR address !~ '^[0-9]+'
                         THEN '395 Hilltop Drive, Redding, CA 96003'
                         ELSE address END,
          latitude = coalesce(latitude, 40.6009980),
          longitude = coalesce(longitude, -122.3713940),
          website = coalesce(website, 'https://www.sundialalf.com'),
          enrichment_data = coalesce(enrichment_data, '{}'::jsonb) ||
            jsonb_build_object('supportingRegistryGeocodeEvidence',
              jsonb_build_object('source', 'OpenStreetMap Nominatim', 'address', '395 Hilltop Drive, Redding, CA 96003')),
          updated_at = now()
      WHERE lower(name) = 'sundial assisted living'
        AND lower(city) = 'redding'
        AND is_active = true
    `);

    await tx.execute(sql`
      UPDATE communities
      SET is_hidden = true,
          data_quality_flags = (
            SELECT ARRAY(SELECT DISTINCT value FROM unnest(
              coalesce(data_quality_flags, ARRAY[]::text[]) ||
              ARRAY['duplicate', 'duplicate_of:70617']::text[]
            ) value)
          ),
          updated_at = now()
      WHERE lower(name) = 'oakmont assisted living and memory care'
        AND lower(city) = 'redding'
        AND id <> 70617
    `);
  });
}

// ---------------------------------------------------------------------------
// DDL — idempotent CREATE TABLE IF NOT EXISTS (mirrors shared/schema.ts and the
// public predicate's expected table/column names)
// ---------------------------------------------------------------------------

export async function createRegistryTables(): Promise<void> {
  const statusCheck = SUPPORTING_STATUSES.map((s) => `'${s}'`).join(", ");
  const reasonCheck = SUPPORTING_EXCLUSION_REASONS.map((r) => `'${r}'`).join(", ");

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS supporting_operator_families (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN (${statusCheck})),
      evidence JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `));
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_supporting_families_slug ON supporting_operator_families (slug)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_supporting_families_status ON supporting_operator_families (status)`);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS supporting_operator_aliases (
      id SERIAL PRIMARY KEY,
      family_id INTEGER NOT NULL REFERENCES supporting_operator_families(id) ON DELETE CASCADE,
      alias TEXT NOT NULL,
      alias_normalized TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT now()
    )
  `);
  // 'exact' = full-name equality; 'prefix' = token-boundary brand prefix
  // (auto-approve); 'prefix_review' = ambiguous prefix (proposed matches only).
  await db.execute(sql`ALTER TABLE supporting_operator_aliases ADD COLUMN IF NOT EXISTS alias_kind TEXT NOT NULL DEFAULT 'exact'`);
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_supporting_aliases_family_norm ON supporting_operator_aliases (family_id, alias_normalized)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_supporting_aliases_norm ON supporting_operator_aliases (alias_normalized)`);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS supporting_operator_domains (
      id SERIAL PRIMARY KEY,
      family_id INTEGER NOT NULL REFERENCES supporting_operator_families(id) ON DELETE CASCADE,
      domain TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_supporting_domains_family_domain ON supporting_operator_domains (family_id, domain)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_supporting_domains_domain ON supporting_operator_domains (domain)`);

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS supporting_community_matches (
      id SERIAL PRIMARY KEY,
      family_id INTEGER NOT NULL REFERENCES supporting_operator_families(id) ON DELETE CASCADE,
      community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
      match_method TEXT NOT NULL DEFAULT 'manual',
      status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN (${statusCheck})),
      evidence JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `));
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_supporting_matches_family_community ON supporting_community_matches (family_id, community_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_supporting_matches_community ON supporting_community_matches (community_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_supporting_matches_status ON supporting_community_matches (status)`);

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS supporting_community_approvals (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      approval_key TEXT NOT NULL,
      community_id INTEGER REFERENCES communities(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN (${statusCheck})),
      evidence JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `));
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_supporting_approvals_key ON supporting_community_approvals (approval_key)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_supporting_approvals_community ON supporting_community_approvals (community_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_supporting_approvals_status ON supporting_community_approvals (status)`);

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS supporting_community_exclusions (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      exclusion_key TEXT NOT NULL,
      community_id INTEGER REFERENCES communities(id) ON DELETE SET NULL,
      reason TEXT NOT NULL CHECK (reason IN (${reasonCheck})),
      note TEXT,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `));
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_supporting_exclusions_key ON supporting_community_exclusions (exclusion_key)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_supporting_exclusions_community ON supporting_community_exclusions (community_id)`);
}

// ---------------------------------------------------------------------------
// community_id resolution — EXACT normalized name+city (+ state aliases)
// ---------------------------------------------------------------------------

/**
 * Resolve a stored community id by EXACT normalized name + city, matching state
 * against its aliases (CA/California). Returns null if 0 or >1 candidates
 * (ambiguous never auto-resolves). Uses the tx/db handle passed in.
 */
async function resolveCommunityId(
  exec: { execute: (q: any) => Promise<any> },
  name: string,
  city: string,
  state: string,
): Promise<number | null> {
  const nk = normalizeName(name);
  const ck = normalizeName(city);
  const states = stateAliases(state);
  const rows = await exec.execute(sql`
    SELECT id FROM communities
    WHERE lower(regexp_replace(trim(name), '\\s+', ' ', 'g')) = ${nk}
      AND lower(trim(city)) = ${ck}
      AND lower(trim(state)) = ANY(${sql`ARRAY[${sql.join(states.map((s) => sql`${s}`), sql`, `)}]::text[]`})
    LIMIT 2
  `);
  const r = (rows as any).rows ?? [];
  if (r.length === 1) return Number(r[0].id);
  return null;
}

/**
 * Public resolver used by admin endpoints: resolve a community id by EXACT
 * normalized name+city (+ state aliases). Returns null if 0 or >1 candidates.
 */
export async function resolveApprovalCommunityId(
  name: string,
  city: string,
  state: string,
): Promise<number | null> {
  return resolveCommunityId(db, name, city, state);
}

// ---------------------------------------------------------------------------
// Seed — idempotent atomic upsert of the initial allowlist
// ---------------------------------------------------------------------------

export interface SeedResult {
  families: number;
  proposedFamilies: number;
  aliases: number;
  domains: number;
  approvals: number;
  exclusions: number;
  resolvedApprovals: number;
  resolvedExclusions: number;
}

async function upsertFamily(
  tx: { execute: (q: any) => Promise<any> },
  fam: SeedFamily,
  approvedOnInsert: boolean,
): Promise<number> {
  const evidence = fam.evidenceNotes ? { notes: fam.evidenceNotes } : {};
  const insertStatus = approvedOnInsert ? "approved" : "proposed";
  // ON CONFLICT preserves the EXISTING status (admin decisions win); only
  // descriptive fields are refreshed. First insert uses insertStatus.
  const rows = await tx.execute(sql`
    INSERT INTO supporting_operator_families (name, slug, status, evidence, updated_at)
    VALUES (${fam.name}, ${fam.slug}, ${insertStatus}, ${JSON.stringify(evidence)}::jsonb, now())
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      evidence = EXCLUDED.evidence,
      updated_at = now()
    RETURNING id
  `);
  const familyId = Number((rows as any).rows[0].id);
  const aliasRows: Array<{ alias: string; kind: string }> = [
    ...fam.aliases.map((alias) => ({ alias, kind: "exact" })),
    ...(fam.prefixes ?? []).map((alias) => ({ alias, kind: "prefix" })),
    ...(fam.reviewPrefixes ?? []).map((alias) => ({ alias, kind: "prefix_review" })),
  ];
  for (const { alias, kind } of aliasRows) {
    await tx.execute(sql`
      INSERT INTO supporting_operator_aliases (family_id, alias, alias_normalized, alias_kind)
      VALUES (${familyId}, ${alias}, ${normalizeName(alias)}, ${kind})
      ON CONFLICT (family_id, alias_normalized) DO UPDATE SET
        alias = EXCLUDED.alias, alias_kind = EXCLUDED.alias_kind
    `);
  }
  for (const domain of fam.domains) {
    const d = normalizeDomain(domain);
    if (!d) continue;
    await tx.execute(sql`
      INSERT INTO supporting_operator_domains (family_id, domain)
      VALUES (${familyId}, ${d})
      ON CONFLICT (family_id, domain) DO NOTHING
    `);
  }
  return familyId;
}

/**
 * Idempotent, atomic seed. Re-runnable at every boot with no drift because
 * every write is an upsert that PRESERVES admin decisions (status). Runs inside
 * a single transaction.
 */
export async function seedRegistry(): Promise<SeedResult> {
  const result: SeedResult = {
    families: 0,
    proposedFamilies: 0,
    aliases: 0,
    domains: 0,
    approvals: 0,
    exclusions: 0,
    resolvedApprovals: 0,
    resolvedExclusions: 0,
  };

  await db.transaction(async (tx) => {
    for (const fam of SEED_FAMILIES) {
      await upsertFamily(tx, fam, true);
      result.families += 1;
      result.aliases += fam.aliases.length;
      result.domains += fam.domains.filter((d) => normalizeDomain(d)).length;
    }
    for (const fam of SEED_PROPOSED_FAMILIES) {
      await upsertFamily(tx, fam, false);
      result.proposedFamilies += 1;
    }

    for (const appr of SEED_APPROVALS) {
      const key = identityKey(appr.name, appr.city, appr.state);
      const cid = await resolveCommunityId(tx, appr.name, appr.city, appr.state);
      if (cid) result.resolvedApprovals += 1;
      // First insert = approved. Re-seed PRESERVES existing status (admin
      // revoke/reject wins); ONLY refreshes descriptive fields + newly-resolved
      // community_id.
      await tx.execute(sql`
        INSERT INTO supporting_community_approvals
          (name, city, state, approval_key, community_id, status, updated_at)
        VALUES (${appr.name}, ${appr.city}, ${appr.state}, ${key}, ${cid}, 'approved', now())
        ON CONFLICT (approval_key) DO UPDATE SET
          name = EXCLUDED.name, city = EXCLUDED.city, state = EXCLUDED.state,
          community_id = COALESCE(supporting_community_approvals.community_id, EXCLUDED.community_id),
          updated_at = now()
      `);
      result.approvals += 1;
    }

    for (const excl of SEED_EXCLUSIONS) {
      const key = identityKey(excl.name, excl.city, excl.state);
      const cid = await resolveCommunityId(tx, excl.name, excl.city, excl.state);
      if (cid) result.resolvedExclusions += 1;
      await tx.execute(sql`
        INSERT INTO supporting_community_exclusions
          (name, city, state, exclusion_key, community_id, reason, note, updated_at)
        VALUES (${excl.name}, ${excl.city}, ${excl.state}, ${key}, ${cid}, ${excl.reason}, ${excl.note ?? null}, now())
        ON CONFLICT (exclusion_key) DO UPDATE SET
          name = EXCLUDED.name, city = EXCLUDED.city, state = EXCLUDED.state,
          community_id = COALESCE(supporting_community_exclusions.community_id, EXCLUDED.community_id),
          reason = EXCLUDED.reason, note = EXCLUDED.note,
          updated_at = now()
      `);
      result.exclusions += 1;
    }
  });

  return result;
}

// ---------------------------------------------------------------------------
// Safe corroboration match population
// ---------------------------------------------------------------------------

export interface MatchPopulationResult {
  approvedByDomain: number;
  approvedByAlias: number;
  approvedByPrefix: number;
  proposedByName: number;
}

/**
 * Populate supporting_community_matches from SAFE corroboration only:
 *   - exact official website host/domain equals an approved family's verified
 *     domain → status='approved' (eligible via inheritance),
 *   - exact normalized community name equals an approved family's explicit
 *     alias → status='approved',
 *   - loose substring is FORBIDDEN. Any name-only ambiguity is left for admin
 *     review (recorded as status='proposed' only when explicitly created — none
 *     are auto-created here beyond the exact paths above).
 *
 * Idempotent: ON CONFLICT keeps a match but never downgrades an approved row.
 */
export async function populateMatches(): Promise<MatchPopulationResult> {
  const result: MatchPopulationResult = {
    approvedByDomain: 0,
    approvedByAlias: 0,
    approvedByPrefix: 0,
    proposedByName: 0,
  };

  await db.transaction(async (tx) => {
    // 1. Exact website host/domain match against an approved family's domain.
    const byDomain = await tx.execute(sql`
      INSERT INTO supporting_community_matches
        (family_id, community_id, match_method, status, evidence)
      SELECT f.id, c.id, 'domain', 'approved',
             jsonb_build_object('notes', 'Exact website host match to verified operator domain')
      FROM communities c
      JOIN supporting_operator_domains d
        ON d.domain = regexp_replace(
             regexp_replace(lower(coalesce(c.website, '')), '^https?://', ''),
             '^www\\.|/.*$', '', 'g')
      JOIN supporting_operator_families f ON f.id = d.family_id AND f.status = 'approved'
      WHERE coalesce(c.website, '') <> ''
      ON CONFLICT (family_id, community_id) DO UPDATE SET
        status = 'approved', match_method = 'domain', updated_at = now()
      RETURNING 1
    `);
    result.approvedByDomain = ((byDomain as any).rows ?? []).length;

    // 2. Exact normalized community name equals an approved family's explicit
    //    alias. Exact equality only — never substring/LIKE.
    const byAlias = await tx.execute(sql`
      INSERT INTO supporting_community_matches
        (family_id, community_id, match_method, status, evidence)
      SELECT f.id, c.id, 'alias', 'approved',
             jsonb_build_object('notes', 'Exact normalized name match to explicit brand alias')
      FROM communities c
      JOIN supporting_operator_aliases a
        ON a.alias_kind = 'exact'
       AND a.alias_normalized = lower(regexp_replace(trim(c.name), '\\s+', ' ', 'g'))
      JOIN supporting_operator_families f ON f.id = a.family_id AND f.status = 'approved'
      ON CONFLICT (family_id, community_id) DO NOTHING
      RETURNING 1
    `);
    result.approvedByAlias = ((byAlias as any).rows ?? []).length;

    // 3. Token-boundary brand-prefix match ("brookdale" → "Brookdale Redding",
    //    never "Brookdales..."): normalized name equals the prefix or starts
    //    with `prefix + ' '`. These prefixes are distinctive brand naming
    //    conventions explicitly listed per family — NOT loose substrings.
    const byPrefix = await tx.execute(sql`
      INSERT INTO supporting_community_matches
        (family_id, community_id, match_method, status, evidence)
      SELECT DISTINCT ON (f.id, c.id) f.id, c.id, 'brand_prefix', 'approved',
             jsonb_build_object(
               'notes', 'Token-boundary brand-name prefix match to approved family naming convention',
               'prefix', a.alias_normalized)
      FROM communities c
      JOIN supporting_operator_aliases a
        ON a.alias_kind = 'prefix'
       AND (
             lower(regexp_replace(trim(c.name), '\\s+', ' ', 'g')) = a.alias_normalized
          OR lower(regexp_replace(trim(c.name), '\\s+', ' ', 'g')) LIKE a.alias_normalized || ' %'
       )
      JOIN supporting_operator_families f ON f.id = a.family_id AND f.status = 'approved'
      ON CONFLICT (family_id, community_id) DO NOTHING
      RETURNING 1
    `);
    result.approvedByPrefix = ((byPrefix as any).rows ?? []).length;

    // 4. Ambiguous review-prefixes ("holiday", "provincial", "the ivy"): create
    //    PROPOSED matches only — visible in the admin review queue, never
    //    published without explicit approval. Never downgrades an approved row.
    const byReviewPrefix = await tx.execute(sql`
      INSERT INTO supporting_community_matches
        (family_id, community_id, match_method, status, evidence)
      SELECT DISTINCT ON (f.id, c.id) f.id, c.id, 'brand_prefix', 'proposed',
             jsonb_build_object(
               'notes', 'Ambiguous brand-prefix candidate — requires admin review before publishing',
               'prefix', a.alias_normalized)
      FROM communities c
      JOIN supporting_operator_aliases a
        ON a.alias_kind = 'prefix_review'
       AND (
             lower(regexp_replace(trim(c.name), '\\s+', ' ', 'g')) = a.alias_normalized
          OR lower(regexp_replace(trim(c.name), '\\s+', ' ', 'g')) LIKE a.alias_normalized || ' %'
       )
      JOIN supporting_operator_families f ON f.id = a.family_id AND f.status = 'approved'
      ON CONFLICT (family_id, community_id) DO NOTHING
      RETURNING 1
    `);
    result.proposedByName = ((byReviewPrefix as any).rows ?? []).length;
  });

  return result;
}

// ---------------------------------------------------------------------------
// Visibility restore for approved-portfolio records
// ---------------------------------------------------------------------------

/**
 * Flags that must NEVER be overridden by a registry-driven restore: quarantines
 * for fake/synthetic/test/duplicate records stay hidden regardless of operator
 * approval. Mirrors HIDING_PROTECTIVE_FLAGS in server/services/community-visibility.ts
 * plus the stronger fake/duplicate quarantine flags.
 */
export const RESTORE_BLOCKING_FLAGS = [
  "synthetic_suspected",
  "geo_needs_review",
  "test_data",
  "clearly_fake",
  "identity_suspect",
  "duplicate",
  "senior_review",
] as const;

/**
 * Approved registry identity IS meaningful verification: a record matched to an
 * admin-approved operator family (or individually approved) that was hidden
 * ONLY for reversible thin-profile-style quality flags is restored to public.
 *
 * It never:
 *   - touches is_active (admin deactivation is authoritative),
 *   - restores a record with a blocking quarantine flag or admin-confirmed flag,
 *   - restores an excluded community (exclusions always win).
 */
export async function restoreApprovedPortfolioVisibility(): Promise<number> {
  const blocking = sql.join(RESTORE_BLOCKING_FLAGS.map((f) => sql`${f}`), sql`, `);
  const res = await db.execute(sql`
    UPDATE communities c
    SET is_hidden = false,
        updated_at = now()
    WHERE c.is_active = true
      AND c.is_hidden = true
      AND coalesce(c.flag_status, '') <> 'confirmed'
      AND NOT EXISTS (
        SELECT 1 FROM unnest(coalesce(c.data_quality_flags, ARRAY[]::text[])) f
        WHERE f IN (${blocking}) OR f LIKE 'duplicate_of:%'
      )
      AND NOT EXISTS (
        SELECT 1 FROM supporting_community_exclusions x
        WHERE x.community_id = c.id
           OR x.exclusion_key = lower(trim(coalesce(c.name, ''))) || '|' ||
                                lower(trim(coalesce(c.city, ''))) || '|' ||
                                lower(trim(coalesce(c.state, '')))
      )
      AND (
        EXISTS (
          SELECT 1 FROM supporting_community_matches m
          JOIN supporting_operator_families f ON f.id = m.family_id
          WHERE m.community_id = c.id AND m.status = 'approved' AND f.status = 'approved'
        )
        OR EXISTS (
          SELECT 1 FROM supporting_community_approvals a
          WHERE a.status = 'approved'
            AND (a.community_id = c.id
                 OR a.approval_key = lower(trim(coalesce(c.name, ''))) || '|' ||
                                     lower(trim(coalesce(c.city, ''))) || '|' ||
                                     lower(trim(coalesce(c.state, ''))))
        )
      )
    RETURNING c.id
  `);
  return ((res as any).rows ?? []).length;
}

/**
 * True when the community is publicly approved through the registry (individual
 * approval or approved family match) and NOT excluded. Used by the visibility
 * evaluator so quality re-scoring does not re-hide approved-portfolio records.
 */
export async function isRegistryApprovedCommunityId(communityId: number): Promise<boolean> {
  const res = await db.execute(sql`
    SELECT 1
    FROM communities c
    WHERE c.id = ${communityId}
      AND NOT EXISTS (
        SELECT 1 FROM supporting_community_exclusions x
        WHERE x.community_id = c.id
           OR x.exclusion_key = lower(trim(coalesce(c.name, ''))) || '|' ||
                                lower(trim(coalesce(c.city, ''))) || '|' ||
                                lower(trim(coalesce(c.state, '')))
      )
      AND (
        EXISTS (
          SELECT 1 FROM supporting_community_matches m
          JOIN supporting_operator_families f ON f.id = m.family_id
          WHERE m.community_id = c.id AND m.status = 'approved' AND f.status = 'approved'
        )
        OR EXISTS (
          SELECT 1 FROM supporting_community_approvals a
          WHERE a.status = 'approved'
            AND (a.community_id = c.id
                 OR a.approval_key = lower(trim(coalesce(c.name, ''))) || '|' ||
                                     lower(trim(coalesce(c.city, ''))) || '|' ||
                                     lower(trim(coalesce(c.state, '')))))
      )
    LIMIT 1
  `).catch(() => ({ rows: [] } as any));
  return (((res as any).rows ?? []).length) > 0;
}

/** All registry-approved (and not excluded) community ids, for bulk passes. */
export async function getRegistryApprovedCommunityIdSet(): Promise<Set<number>> {
  const res = await db.execute(sql`
    SELECT DISTINCT c.id
    FROM communities c
    WHERE NOT EXISTS (
        SELECT 1 FROM supporting_community_exclusions x
        WHERE x.community_id = c.id
           OR x.exclusion_key = lower(trim(coalesce(c.name, ''))) || '|' ||
                                lower(trim(coalesce(c.city, ''))) || '|' ||
                                lower(trim(coalesce(c.state, '')))
      )
      AND (
        EXISTS (
          SELECT 1 FROM supporting_community_matches m
          JOIN supporting_operator_families f ON f.id = m.family_id
          WHERE m.community_id = c.id AND m.status = 'approved' AND f.status = 'approved'
        )
        OR EXISTS (
          SELECT 1 FROM supporting_community_approvals a
          WHERE a.status = 'approved'
            AND (a.community_id = c.id
                 OR a.approval_key = lower(trim(coalesce(c.name, ''))) || '|' ||
                                     lower(trim(coalesce(c.city, ''))) || '|' ||
                                     lower(trim(coalesce(c.state, '')))))
      )
  `).catch(() => ({ rows: [] } as any));
  return new Set((((res as any).rows ?? []) as any[]).map((r) => Number(r.id)));
}

// ---------------------------------------------------------------------------
// Effective eligibility evaluator
// ---------------------------------------------------------------------------

export interface EffectiveEligibility {
  eligibleCount: number;
  familyInheritedCount: number;
  individuallyApprovedCount: number;
  excludedCount: number;
}

/**
 * Compute effective PUBLIC eligibility exactly as the public predicate does,
 * but ONLY over REAL communities (existing, non-null id, active/not-hidden):
 *   eligible = active AND not-hidden
 *              AND NOT excluded (community-level exclusion wins)
 *              AND (individually approved OR approved approved-family match)
 * Exclusion matches on resolved community_id OR the name|city|state key so an
 * unresolved exclusion still blocks the matching community.
 */
export async function getEffectiveEligibility(): Promise<EffectiveEligibility> {
  const row = await db.execute(sql`
    WITH active_comm AS (
      SELECT id,
             lower(trim(coalesce(name, '')))  || '|' ||
             lower(trim(coalesce(city, '')))  || '|' ||
             lower(trim(coalesce(state, ''))) AS ident
      FROM communities
      WHERE is_active = true
        AND (is_hidden IS NULL OR is_hidden IS NOT TRUE)
    ),
    excluded AS (
      SELECT ac.id FROM active_comm ac
      WHERE EXISTS (
        SELECT 1 FROM supporting_community_exclusions x
        WHERE x.community_id = ac.id OR x.exclusion_key = ac.ident
      )
    ),
    approved_individual AS (
      SELECT ac.id FROM active_comm ac
      WHERE EXISTS (
        SELECT 1 FROM supporting_community_approvals a
        WHERE a.status = 'approved' AND (a.community_id = ac.id OR a.approval_key = ac.ident)
      )
    ),
    inherited AS (
      SELECT DISTINCT m.community_id AS id
      FROM supporting_community_matches m
      JOIN supporting_operator_families f ON f.id = m.family_id
      WHERE m.status = 'approved' AND f.status = 'approved'
    ),
    eligible AS (
      SELECT ac.id FROM active_comm ac
      WHERE ac.id NOT IN (SELECT id FROM excluded)
        AND (ac.id IN (SELECT id FROM approved_individual) OR ac.id IN (SELECT id FROM inherited))
    )
    SELECT
      (SELECT COUNT(*) FROM eligible) AS eligible_count,
      (SELECT COUNT(*) FROM active_comm ac WHERE ac.id IN (SELECT id FROM inherited) AND ac.id NOT IN (SELECT id FROM excluded)) AS inherited_count,
      (SELECT COUNT(*) FROM approved_individual ac WHERE ac.id NOT IN (SELECT id FROM excluded)) AS approved_count,
      (SELECT COUNT(*) FROM excluded) AS excluded_count
  `);
  const r = row.rows[0] as any;
  return {
    eligibleCount: Number(r?.eligible_count ?? 0),
    familyInheritedCount: Number(r?.inherited_count ?? 0),
    individuallyApprovedCount: Number(r?.approved_count ?? 0),
    excludedCount: Number(r?.excluded_count ?? 0),
  };
}

// ---------------------------------------------------------------------------
// Public gate
// ---------------------------------------------------------------------------

export interface RegistryGate {
  enabled: boolean;
  seededAt?: string;
  eligibleCount?: number;
  reason?: string;
}

export async function getRegistryGate(): Promise<RegistryGate> {
  const row = await db.execute(sql`SELECT value FROM platform_settings WHERE key = ${REGISTRY_GATE_KEY}`);
  const value = (row.rows[0] as any)?.value;
  if (value == null) return { enabled: false, reason: "not_seeded" };
  if (typeof value === "boolean") return { enabled: value };
  if (typeof value === "object") return value as RegistryGate;
  return { enabled: String(value).toLowerCase() === "true", reason: "legacy" };
}

async function setRegistryGate(gate: RegistryGate): Promise<void> {
  await db.execute(sql`
    INSERT INTO platform_settings (key, value)
    VALUES (${REGISTRY_GATE_KEY}, ${JSON.stringify(gate)}::jsonb)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `);
}

/**
 * Full idempotent bootstrap for the registry, safe to call at every startup:
 *   1. create tables (IF NOT EXISTS),
 *   2. atomically seed the allowlist (preserving admin decisions),
 *   3. populate matches from SAFE corroboration,
 *   4. compute effective eligibility over REAL active communities,
 *   5. flip the public gate ENABLED only when eligible (real rows) > 0.
 *
 * The gate is NEVER enabled on unresolved registry rows: eligibility is counted
 * strictly over communities that exist and are active/not-hidden with a
 * resolved id. The gate is only ever turned ON here, never off by a failed boot.
 */
export async function bootstrapRegistry(
  nowIso: string,
): Promise<{ seed: SeedResult; matches: MatchPopulationResult; eligibility: EffectiveEligibility; gate: RegistryGate }> {
  await createRegistryTables();
  const seed = await seedRegistry();
  await reconcileApprovedReddingRecords();
  const matches = await populateMatches();
  // Approved-portfolio records hidden ONLY for reversible thin-profile quality
  // flags become public — approved operator identity is verification. Runs
  // AFTER matches so newly-matched records restore in the same boot.
  await restoreApprovedPortfolioVisibility();
  const eligibility = await getEffectiveEligibility();

  let gate = await getRegistryGate();
  if (eligibility.eligibleCount > 0) {
    gate = {
      enabled: true,
      seededAt: nowIso,
      eligibleCount: eligibility.eligibleCount,
      reason: "seed_succeeded_with_resolved_eligible",
    };
    await setRegistryGate(gate);
  } else if (!gate.enabled) {
    // No REAL eligible communities resolved yet — keep the gate OFF so the
    // public predicate fails safe (active/not-hidden) instead of enforcing an
    // allowlist against unresolved rows (which would hide everything).
    gate = { enabled: false, eligibleCount: 0, reason: "no_resolved_eligible_yet" };
    await setRegistryGate(gate);
  }

  return { seed, matches, eligibility, gate };
}
