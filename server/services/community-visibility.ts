/**
 * Community visibility — the SINGLE writer of `is_hidden` for quality/senior
 * reasons.
 *
 * Both the bulk classify-score pass and the per-community self-heal recompute
 * call into here, so the STRICT keep-public policy is applied identically
 * everywhere. The policy itself lives in `shared/community-classification.ts`
 * (`evaluateCommunity`) — this module only loads rows, merges flags, applies
 * protective-quarantine overrides, and persists.
 *
 * Reversibility (Golden Data Rule): nothing is ever deleted. `is_hidden` is a
 * pure deterministic function of the current row, so re-running after a record
 * gains real content (e.g. via enrichment) automatically restores it.
 *
 * Protective overrides — a record stays hidden regardless of the quality score
 * when it is hidden for a DIFFERENT, stronger reason:
 *   - data_quality_flags contains 'synthetic_suspected' or 'geo_needs_review'
 *     (fake-coordinate quarantine — must not be auto-restored here), or
 *   - flag_status = 'confirmed' (an admin confirmed a problem report).
 * These flags are NOT in MANAGED_QUALITY_FLAGS, so they survive the flag merge.
 */
import { and, eq, gt, isNull, lt, or, sql } from "drizzle-orm";
import { db } from "../db";
import { communities } from "@shared/schema";
import {
  evaluateCommunity,
  MANAGED_QUALITY_FLAGS,
  type CommunityClassifyLike,
  type CommunityEvaluation,
} from "@shared/community-classification";

/** Flags that keep a record hidden no matter what the quality policy says. */
const PROTECTIVE_FLAGS = new Set(["synthetic_suspected", "geo_needs_review"]);
const MANAGED = new Set<string>(MANAGED_QUALITY_FLAGS as readonly string[]);

/** The exact column set evaluation needs — selected explicitly to avoid the
 *  known communities Drizzle/DB column drift on `SELECT *`. */
const evalColumns = {
  id: communities.id,
  name: communities.name,
  description: communities.description,
  phone: communities.phone,
  website: communities.website,
  email: communities.email,
  latitude: communities.latitude,
  longitude: communities.longitude,
  photos: communities.photos,
  careTypes: communities.careTypes,
  communitySubtype: communities.communitySubtype,
  facilityType: communities.facilityType,
  isVerified: communities.isVerified,
  data_source: communities.data_source,
  isClaimed: communities.isClaimed,
  claimVerified: communities.claimVerified,
  isFeaturedBrand: communities.isFeaturedBrand,
  subscriptionTier: communities.subscriptionTier,
  hudPropertyId: communities.hudPropertyId,
  rentPerMonth: communities.rentPerMonth,
  isHidden: communities.isHidden,
  flagStatus: communities.flagStatus,
  dataQualityFlags: communities.dataQualityFlags,
} as const;

type EvalRow = {
  [K in keyof typeof evalColumns]: any;
};

export interface RowVisibilityResult {
  id: number;
  evaluation: CommunityEvaluation;
  /** Final persisted is_hidden after protective overrides. */
  hidden: boolean;
  /** True when a protective flag/flag_status forced it to stay hidden. */
  protected: boolean;
  mergedFlags: string[];
}

/**
 * Pure: compute the visibility decision for an already-loaded row (no DB write).
 */
function computeRowVisibility(row: EvalRow): RowVisibilityResult {
  const evaluation = evaluateCommunity(row as CommunityClassifyLike);

  // Merge flags: drop this task's managed flags, keep everything else (other
  // scanners' flags + protective flags), then add freshly-computed managed ones.
  const existing: string[] = Array.isArray(row.dataQualityFlags) ? row.dataQualityFlags : [];
  const preserved = existing.filter((f) => typeof f === "string" && !MANAGED.has(f));
  const mergedFlags = Array.from(new Set([...preserved, ...evaluation.flags]));

  // Protective overrides — never auto-restore a record hidden for a stronger reason.
  const hasProtectiveFlag = existing.some((f) => PROTECTIVE_FLAGS.has(f));
  const adminConfirmed = row.flagStatus === "confirmed";
  const isProtected = hasProtectiveFlag || adminConfirmed;

  const hidden = isProtected ? true : !evaluation.keepPublic;

  return { id: row.id, evaluation, hidden, protected: isProtected, mergedFlags };
}

/** Persist a previously-computed decision. The single is_hidden writer. */
async function writeRowVisibility(result: RowVisibilityResult): Promise<void> {
  await db
    .update(communities)
    .set({
      seniorClassification: result.evaluation.classification,
      qualityScore: result.evaluation.score,
      qualityTier: result.evaluation.tier,
      dataQualityFlags: result.mergedFlags,
      dataQualityCheckedAt: new Date(),
      isHidden: result.hidden,
    } as any)
    .where(eq(communities.id, result.id));
}

/**
 * Compute the persisted visibility decision for an already-loaded row and write
 * it back (classification, score, tier, merged flags, is_hidden, checked-at).
 */
async function applyRowVisibility(row: EvalRow): Promise<RowVisibilityResult> {
  const result = computeRowVisibility(row);
  await writeRowVisibility(result);
  return result;
}

/** Run async tasks with a bounded concurrency limit. */
async function mapWithConcurrency<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx]);
    }
  });
  await Promise.all(workers);
}

/**
 * Recompute classification, score, and visibility for a SINGLE community.
 * Called by the self-heal / enrichment pipeline so a community that just gained
 * real content is re-scored and auto-restored (or a newly-degraded one hidden).
 * Returns null if the community does not exist.
 */
export async function recomputeCommunityVisibility(
  communityId: number,
): Promise<RowVisibilityResult | null> {
  const [row] = await db.select(evalColumns).from(communities).where(eq(communities.id, communityId)).limit(1);
  if (!row) return null;
  return applyRowVisibility(row as EvalRow);
}

export interface VisibilityPassOptions {
  /** Don't write — only compute and tally (for verification). */
  dryRun?: boolean;
  /** Resume from a community id cursor (exclusive). */
  afterId?: number;
  /** Stop after processing this many rows (0 = all). */
  limit?: number;
  /** Rows per batch. */
  batchSize?: number;
  /** Skip rows whose data_quality_checked_at is within this many hours. */
  skipCheckedWithinHours?: number;
  /** Stop after this many seconds of wall-clock time (0/undefined = no budget).
   *  Combined with skipCheckedWithinHours this makes the pass resumable in
   *  short, time-boxed chunks (e.g. inside a post-merge hook with a timeout). */
  maxSeconds?: number;
  /** Per-batch progress callback. */
  onBatch?: (stats: VisibilityPassStats) => void;
}

export interface VisibilityPassStats {
  processed: number;
  lastId: number;
  classification: Record<string, number>;
  tier: Record<string, number>;
  flags: Record<string, number>;
  willHide: number;
  willShow: number;
  protectedHidden: number;
  hiddenChanged: number; // is_hidden flipped vs prior persisted value
}

function emptyStats(): VisibilityPassStats {
  return {
    processed: 0,
    lastId: 0,
    classification: {},
    tier: {},
    flags: {},
    willHide: 0,
    willShow: 0,
    protectedHidden: 0,
    hiddenChanged: 0,
  };
}

function tally(stats: VisibilityPassStats, row: EvalRow, result: RowVisibilityResult) {
  stats.processed += 1;
  stats.lastId = row.id;
  const c = result.evaluation.classification;
  stats.classification[c] = (stats.classification[c] || 0) + 1;
  const t = result.evaluation.tier;
  stats.tier[t] = (stats.tier[t] || 0) + 1;
  for (const f of result.mergedFlags) stats.flags[f] = (stats.flags[f] || 0) + 1;
  if (result.hidden) stats.willHide += 1;
  else stats.willShow += 1;
  if (result.protected && result.hidden) stats.protectedHidden += 1;
  if (Boolean(row.isHidden) !== result.hidden) stats.hiddenChanged += 1;
}

/**
 * Batched, resumable, idempotent classification + scoring + visibility pass over
 * ALL communities. Cursor-paginates by id so it can resume after a crash
 * (`afterId`) and re-running is safe (every row is a pure function of its state).
 */
export async function runVisibilityPass(
  opts: VisibilityPassOptions = {},
): Promise<VisibilityPassStats> {
  const batchSize = Math.max(1, opts.batchSize ?? 1000);
  const stats = emptyStats();
  let cursor = opts.afterId ?? 0;
  const deadline =
    opts.maxSeconds && opts.maxSeconds > 0 ? Date.now() + opts.maxSeconds * 1000 : null;

  const staleCutoff =
    opts.skipCheckedWithinHours && opts.skipCheckedWithinHours > 0
      ? new Date(Date.now() - opts.skipCheckedWithinHours * 3600_000)
      : null;

  for (;;) {
    const whereConds = [gt(communities.id, cursor)];
    if (staleCutoff) {
      whereConds.push(
        or(
          isNull(communities.dataQualityCheckedAt),
          lt(communities.dataQualityCheckedAt, staleCutoff),
        )!,
      );
    }

    const rows = (await db
      .select(evalColumns)
      .from(communities)
      .where(and(...whereConds))
      .orderBy(communities.id)
      .limit(batchSize)) as EvalRow[];

    if (rows.length === 0) break;

    // Honor a row limit by trimming the batch before compute/write.
    const batch =
      opts.limit && stats.processed + rows.length > opts.limit
        ? rows.slice(0, opts.limit - stats.processed)
        : rows;

    // Compute is pure & cheap; do it for the whole batch first.
    const decisions = batch.map((row) => ({ row, result: computeRowVisibility(row) }));

    // Persist concurrently (bounded) — per-row UPDATEs over serverless are slow
    // sequentially, so a 1-pass apply of ~34k rows needs concurrency.
    if (!opts.dryRun) {
      await mapWithConcurrency(decisions, 40, ({ result }) => writeRowVisibility(result));
    }

    for (const { row, result } of decisions) {
      tally(stats, row, result);
      cursor = row.id;
    }

    opts.onBatch?.(stats);
    if (opts.limit && stats.processed >= opts.limit) break;
    if (deadline && Date.now() >= deadline) break;
  }

  return stats;
}
