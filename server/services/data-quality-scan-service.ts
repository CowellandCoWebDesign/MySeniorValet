/**
 * Data Quality Scan Service
 * =========================
 * Read-only detection + non-destructive flagging of suspect AI-guessed
 * community data, plus an opt-in (explicitly authorized) remediation path.
 *
 * Detected issues (stored in communities.data_quality_flags):
 *   - citation_artifact   : leftover [1] / *(verify)* markers in text fields
 *   - incomplete_address  : "City, State" placeholder (no real street)
 *   - guessed_name        : name guessed from a search-result/article title
 *   - unreachable_website : website does not resolve (404 / dead domain)
 *
 * IMPORTANT — Golden Data Rule + removal-authorization rule:
 *   - scanDataQuality() and reporting are READ-ONLY (no writes).
 *   - flagDataQuality() only writes non-destructive markers; it never deletes.
 *   - cleanupDataQuality() requires an explicit { confirm: true } and NEVER
 *     deletes records — it only strips citation artifacts and/or nulls out
 *     verified-unreachable websites.
 */

import { db } from "../db";
import { sql } from "drizzle-orm";
import { isReachableWebsite } from "../utils/data-quality";

// ── Shared SQL predicates (no user input — safe for sql.raw) ──────────────────

const CITATION_COND = `(
  coalesce(name, '')        ~ '\\[[0-9]+\\]' OR coalesce(name, '')        ~* '\\*?\\(verify\\)' OR
  coalesce(description, '') ~ '\\[[0-9]+\\]' OR coalesce(description, '') ~* '\\*?\\(verify\\)' OR
  coalesce(website, '')     ~ '\\[[0-9]+\\]' OR
  coalesce(phone, '')       ~ '\\[[0-9]+\\]' OR
  coalesce(address, '')     ~ '\\[[0-9]+\\]'
)`;

const INCOMPLETE_ADDR_COND = `(
  address IS NULL OR btrim(address) = '' OR
  lower(btrim(address)) = lower(btrim(coalesce(city, '') || ', ' || coalesce(state, ''))) OR
  lower(btrim(address)) = lower(btrim(coalesce(city, ''))) OR
  address !~ '[0-9]'
)`;

const GUESSED_NAME_COND = `(
  name IS NULL OR btrim(name) = '' OR
  name ~* '^[[:space:]]*(the[[:space:]]+)?[0-9]+[[:space:]]+(best|top|cheapest|affordable)' OR
  name ~* 'near[[:space:]]+(you|me)' OR
  name ~* 'senior[[:space:]]+living[[:space:]]+(guide|directory)' OR
  name ~ '\\[[0-9]+\\]' OR
  length(name) > 100 OR
  name LIKE '%|%'
)`;

const UNREACHABLE_FLAG_COND = `('unreachable_website' = ANY(coalesce(data_quality_flags, '{}')))`;

export type DataQualityFlag =
  | "citation_artifact"
  | "incomplete_address"
  | "guessed_name"
  | "unreachable_website";

export interface DataQualityReport {
  totalCommunities: number;
  counts: Record<DataQualityFlag, number>;
  anyFlagged: number;
  examples: Record<DataQualityFlag, Array<Record<string, unknown>>>;
}

export interface ScanOptions {
  exampleLimit?: number;
  /**
   * When > 0, run a bounded, real reachability pass (flagUnreachableWebsites)
   * BEFORE computing counts so the report reflects freshly-detected unreachable
   * websites rather than only previously-flagged ones. Network-bound, so this is
   * opt-in and capped per call; repeat with afterId to cover the full catalog.
   */
  websiteScanLimit?: number;
  websiteScanAfterId?: number;
}

/**
 * READ-ONLY by default: count and sample communities affected by each
 * data-quality issue. If websiteScanLimit > 0, first performs a bounded,
 * non-destructive reachability pass that flags (never deletes) unreachable
 * websites so the report's unreachable_website count is freshly detected.
 */
export async function scanDataQuality(
  optsOrExampleLimit: number | ScanOptions = 10,
): Promise<DataQualityReport & { websiteScan?: UnreachableScanResult }> {
  const opts: ScanOptions =
    typeof optsOrExampleLimit === "number"
      ? { exampleLimit: optsOrExampleLimit }
      : optsOrExampleLimit;
  const exampleLimit = opts.exampleLimit ?? 10;

  let websiteScan: UnreachableScanResult | undefined;
  if (opts.websiteScanLimit && opts.websiteScanLimit > 0) {
    websiteScan = await flagUnreachableWebsites({
      limit: opts.websiteScanLimit,
      afterId: opts.websiteScanAfterId,
    });
  }

  const base = await scanDataQualityCounts(exampleLimit);
  return websiteScan ? { ...base, websiteScan } : base;
}

/**
 * READ-ONLY: count and sample communities affected by each data-quality issue.
 * Does not modify any record.
 */
async function scanDataQualityCounts(exampleLimit = 10): Promise<DataQualityReport> {
  const countsResult = await db.execute(sql`
    SELECT
      count(*) FILTER (WHERE ${sql.raw(CITATION_COND)})        AS citation_artifact,
      count(*) FILTER (WHERE ${sql.raw(INCOMPLETE_ADDR_COND)}) AS incomplete_address,
      count(*) FILTER (WHERE ${sql.raw(GUESSED_NAME_COND)})    AS guessed_name,
      count(*) FILTER (WHERE ${sql.raw(UNREACHABLE_FLAG_COND)}) AS unreachable_website,
      count(*) FILTER (WHERE ${sql.raw(CITATION_COND)} OR ${sql.raw(INCOMPLETE_ADDR_COND)} OR ${sql.raw(GUESSED_NAME_COND)} OR ${sql.raw(UNREACHABLE_FLAG_COND)}) AS any_flag,
      count(*) AS total
    FROM communities
  `);

  const row = (countsResult.rows[0] || {}) as Record<string, any>;

  const conds: Record<DataQualityFlag, string> = {
    citation_artifact: CITATION_COND,
    incomplete_address: INCOMPLETE_ADDR_COND,
    guessed_name: GUESSED_NAME_COND,
    unreachable_website: UNREACHABLE_FLAG_COND,
  };

  const examples = {} as DataQualityReport["examples"];
  for (const [flag, cond] of Object.entries(conds) as [DataQualityFlag, string][]) {
    const ex = await db.execute(sql`
      SELECT id, name, city, state, address, website
      FROM communities
      WHERE ${sql.raw(cond)}
      ORDER BY id DESC
      LIMIT ${exampleLimit}
    `);
    examples[flag] = ex.rows as Array<Record<string, unknown>>;
  }

  return {
    totalCommunities: Number(row.total || 0),
    counts: {
      citation_artifact: Number(row.citation_artifact || 0),
      incomplete_address: Number(row.incomplete_address || 0),
      guessed_name: Number(row.guessed_name || 0),
      unreachable_website: Number(row.unreachable_website || 0),
    },
    anyFlagged: Number(row.any_flag || 0),
    examples,
  };
}

/**
 * NON-DESTRUCTIVE: recompute and write data_quality_flags markers for every
 * community. Preserves any previously-set 'unreachable_website' flag (which is
 * produced only by reachability checks, not by SQL pattern detection).
 * Never deletes or hides any record.
 */
export async function flagDataQuality(): Promise<{ flagged: number; total: number }> {
  await db.execute(sql`
    UPDATE communities SET
      data_quality_flags = (
        SELECT array_remove(ARRAY[
          CASE WHEN ${sql.raw(CITATION_COND)}        THEN 'citation_artifact' END,
          CASE WHEN ${sql.raw(INCOMPLETE_ADDR_COND)} THEN 'incomplete_address' END,
          CASE WHEN ${sql.raw(GUESSED_NAME_COND)}    THEN 'guessed_name' END,
          CASE WHEN ${sql.raw(UNREACHABLE_FLAG_COND)} THEN 'unreachable_website' END
        ], NULL)
      ),
      data_quality_checked_at = now()
  `);

  const result = await db.execute(sql`
    SELECT
      count(*) FILTER (WHERE coalesce(array_length(data_quality_flags, 1), 0) > 0) AS flagged,
      count(*) AS total
    FROM communities
  `);
  const row = (result.rows[0] || {}) as Record<string, any>;
  return { flagged: Number(row.flagged || 0), total: Number(row.total || 0) };
}

export interface UnreachableScanOptions {
  limit?: number;     // bound reachability checks per run (default 100, max 500)
  afterId?: number;   // cursor: only check communities with id > afterId
}

export interface UnreachableScanResult {
  checked: number;
  flaggedUnreachable: number;
  unflaggedRecovered: number;
  nextAfterId: number | null; // pass back as afterId to continue; null = done
}

/**
 * NON-DESTRUCTIVE detection of unreachable websites.
 *
 * Walks a bounded, resumable batch of communities (cursor by id), actually
 * resolves each stored website with isReachableWebsite(), and:
 *   - appends the 'unreachable_website' flag when the site does NOT resolve
 *     (the website field itself is left untouched — flagging only);
 *   - removes a stale 'unreachable_website' flag if a previously-flagged site
 *     now resolves again.
 *
 * Never deletes or nulls any field — that destructive remediation lives only in
 * cleanupDataQuality({ confirm: true, dropUnreachableWebsites: true }).
 *
 * Reachability is network-bound, so the full ~34k catalog is processed across
 * repeated calls: pass the returned nextAfterId back as afterId until it is null.
 */
export async function flagUnreachableWebsites(
  opts: UnreachableScanOptions = {}
): Promise<UnreachableScanResult> {
  const limit = Math.max(1, Math.min(opts.limit ?? 100, 500));
  const afterId = Math.max(0, opts.afterId ?? 0);

  const candidates = await db.execute(sql`
    SELECT id, website
    FROM communities
    WHERE website IS NOT NULL AND btrim(website) <> '' AND id > ${afterId}
    ORDER BY id ASC
    LIMIT ${limit}
  `);

  const rows = candidates.rows as Array<{ id: number; website: string }>;
  const result: UnreachableScanResult = {
    checked: 0,
    flaggedUnreachable: 0,
    unflaggedRecovered: 0,
    nextAfterId: null,
  };

  let lastId = afterId;
  for (const c of rows) {
    lastId = c.id;
    result.checked++;
    const reachable = await isReachableWebsite(c.website);
    if (!reachable) {
      const upd = await db.execute(sql`
        UPDATE communities SET
          data_quality_flags = (
            SELECT array_remove(ARRAY(SELECT DISTINCT unnest(coalesce(data_quality_flags, '{}') || ARRAY['unreachable_website'])), NULL)
          ),
          data_quality_checked_at = now()
        WHERE id = ${c.id}
          AND NOT ('unreachable_website' = ANY(coalesce(data_quality_flags, '{}')))
        RETURNING id
      `);
      if (upd.rows.length > 0) result.flaggedUnreachable++;
    } else {
      const upd = await db.execute(sql`
        UPDATE communities SET
          data_quality_flags = array_remove(coalesce(data_quality_flags, '{}'), 'unreachable_website'),
          data_quality_checked_at = now()
        WHERE id = ${c.id}
          AND 'unreachable_website' = ANY(coalesce(data_quality_flags, '{}'))
        RETURNING id
      `);
      if (upd.rows.length > 0) result.unflaggedRecovered++;
    }
  }

  result.nextAfterId = rows.length === limit ? lastId : null;
  return result;
}

export interface CleanupOptions {
  confirm: boolean;
  cleanCitations?: boolean;
  dropUnreachableWebsites?: boolean;
  websiteCheckLimit?: number; // bound reachability checks per run
}

export interface CleanupResult {
  citationsCleaned: number;
  websitesChecked: number;
  websitesDropped: number;
}

/**
 * OPT-IN remediation. Requires { confirm: true }. NEVER deletes records.
 *   - cleanCitations: strips [n] / *(verify)* artifacts from text fields in-place.
 *   - dropUnreachableWebsites: for a bounded batch, verifies reachability and
 *     nulls out + flags websites that do not resolve.
 */
export async function cleanupDataQuality(opts: CleanupOptions): Promise<CleanupResult> {
  if (!opts.confirm) {
    throw new Error("cleanupDataQuality requires explicit confirmation (confirm: true)");
  }

  const result: CleanupResult = {
    citationsCleaned: 0,
    websitesChecked: 0,
    websitesDropped: 0,
  };

  if (opts.cleanCitations) {
    const cleaned = await db.execute(sql`
      UPDATE communities SET
        name = nullif(btrim(regexp_replace(regexp_replace(coalesce(name, ''), '\\[[0-9]+\\]', '', 'g'), '[[:space:]]*\\*?\\(verify\\)\\*?', '', 'gi')), ''),
        description = nullif(btrim(regexp_replace(regexp_replace(coalesce(description, ''), '\\[[0-9]+\\]', '', 'g'), '[[:space:]]*\\*?\\(verify\\)\\*?', '', 'gi')), ''),
        website = nullif(btrim(regexp_replace(coalesce(website, ''), '\\[[0-9]+\\]', '', 'g')), ''),
        phone = nullif(btrim(regexp_replace(coalesce(phone, ''), '\\[[0-9]+\\]', '', 'g')), ''),
        address = coalesce(nullif(btrim(regexp_replace(coalesce(address, ''), '\\[[0-9]+\\]', '', 'g')), ''), address),
        updated_at = now()
      WHERE ${sql.raw(CITATION_COND)}
      RETURNING id
    `);
    result.citationsCleaned = cleaned.rows.length;
  }

  if (opts.dropUnreachableWebsites) {
    const limit = Math.max(1, Math.min(opts.websiteCheckLimit ?? 100, 500));
    const candidates = await db.execute(sql`
      SELECT id, website
      FROM communities
      WHERE website IS NOT NULL AND btrim(website) <> ''
        AND NOT (${sql.raw(UNREACHABLE_FLAG_COND)})
      ORDER BY id DESC
      LIMIT ${limit}
    `);

    for (const c of candidates.rows as Array<{ id: number; website: string }>) {
      result.websitesChecked++;
      const reachable = await isReachableWebsite(c.website);
      if (!reachable) {
        await db.execute(sql`
          UPDATE communities SET
            website = NULL,
            data_quality_flags = (
              SELECT array_remove(ARRAY(SELECT DISTINCT unnest(coalesce(data_quality_flags, '{}') || ARRAY['unreachable_website'])), NULL)
            ),
            data_quality_checked_at = now(),
            updated_at = now()
          WHERE id = ${c.id}
        `);
        result.websitesDropped++;
      }
    }
  }

  return result;
}
