/**
 * Self-heal enrichment runner — the SINGLE place the self-heal backoff gating
 * and counter bookkeeping live.
 *
 * Both the public self-heal endpoint (`POST /api/communities/:id/self-heal`) and
 * the batched hidden-community verification/restore pass
 * (`server/scripts/verify-restore-hidden-communities.ts`) call
 * `runSelfHealEnrichment()` so the escalating backoff (24h → 7d → 30d →
 * terminal `no_data`) and the `enrichment_status` / `enrichment_attempts`
 * bookkeeping are applied identically everywhere. There is no parallel pipeline:
 * the actual verification + enrichment is delegated to `enrichCommunityUnified`
 * (the one unified pipeline), which itself recomputes visibility and auto-restores
 * a hidden community that now clears the keep-public bar.
 *
 * Gates (priority order — identical to the public endpoint):
 *   1. Content-complete (≥1 photo AND a real description ≥100 chars) → skipped,
 *      no enrichment call. Optionally still recompute visibility (free) so a
 *      content-complete-but-hidden record can be restored without re-billing.
 *   2. In-flight de-dup: enrichment_status='in_progress' OR an attempt within the
 *      last 10 minutes → skipped.
 *   3. Terminal "no data": enrichment_status='no_data' → skipped until an admin
 *      forces a refresh (or the caller passes `force`).
 *   4. Escalating backoff: a run that persists NO new content widens the cooldown
 *      via `enrichment_attempts` (24h → 7d → 30d → terminal). A successful run
 *      (real content saved, or a cache hit) resets the counter to 0.
 */

import { db } from "../db";
import { communities } from "@shared/schema";
import { eq } from "drizzle-orm";
import {
  enrichCommunityUnified,
  type UnifiedEnrichmentResult,
} from "./community-enrichment-orchestrator";
import { recomputeCommunityVisibility } from "./community-visibility";
import { selfHealCooldownHours, SELF_HEAL_TERMINAL_ATTEMPTS } from "../self-heal-backoff";

export interface SelfHealRunOptions {
  /**
   * Bypass the cooldown / terminal gates and force a fresh enrichment (the admin
   * "force refresh" semantic). Still respects the in-flight de-dup so two callers
   * can't fire at once. When true, `enrichCommunityUnified` is called with
   * `forceRefresh: true`.
   */
  force?: boolean;
  /**
   * When a content-complete community is skipped (gate 1), still recompute its
   * visibility so a hidden-but-already-complete record is restored for free
   * (no enrichment / no billing). Used by the batch restore pass.
   */
  recomputeVisibilityOnSkip?: boolean;
  /**
   * Free-first cost order: run the FREE web search/scrape before the paid
   * Perplexity stage and only escalate to paid AI when the free pass is
   * insufficient. Forwarded to `enrichCommunityUnified({ preferFree })`. Used by
   * the bulk restore pass so re-verifying ~22k communities doesn't fire ~22k
   * paid AI calls. The public route leaves this off (Perplexity-first).
   */
  preferFree?: boolean;
}

export interface SelfHealRunResult {
  communityId: number;
  /** True when no enrichment ran (a gate fired). */
  skipped: boolean;
  /** Machine-readable reason when skipped. */
  reason?:
    | "not_found"
    | "already_has_content"
    | "in_progress"
    | "no_data_terminal"
    | "rate_limited";
  /** For rate_limited: the cooldown window that applied. */
  retryAfterHours?: number;
  /** For rate_limited: how many consecutive no-content runs have accrued. */
  consecutiveNoDataAttempts?: number;
  /** True when the run found data (new content saved OR a cache hit). */
  foundData?: boolean;
  /** True when this run persisted NEW real content. */
  contentSaved?: boolean;
  /** True when served from the persisted-content cache (no billing). */
  cached?: boolean;
  /** Visibility after the run: true if the record is now publicly visible. */
  visible?: boolean;
  /** True when this run flipped is_hidden false→…→ visible (a restore). */
  restored?: boolean;
  /** The full unified-enrichment result, when enrichment actually ran. */
  result?: UnifiedEnrichmentResult;
}

/**
 * Run a single community through the self-heal backoff + unified enrichment
 * pipeline and persist the resulting backoff state. Never throws for a transient
 * pipeline error: it records `enrichment_status='failed'` (which does NOT
 * escalate the no-data counter) and re-throws so the caller can decide how to
 * report it — except callers that want resilience can catch it.
 */
export async function runSelfHealEnrichment(
  communityId: number,
  opts: SelfHealRunOptions = {},
): Promise<SelfHealRunResult> {
  const { force = false, recomputeVisibilityOnSkip = false, preferFree = false } = opts;

  const [community] = await db
    .select({
      id: communities.id,
      name: communities.name,
      description: communities.description,
      photos: communities.photos,
      isHidden: communities.isHidden,
      enrichmentStatus: communities.enrichmentStatus,
      enrichmentAttempts: communities.enrichmentAttempts,
      lastEnrichmentAttempt: communities.lastEnrichmentAttempt,
    })
    .from(communities)
    .where(eq(communities.id, communityId))
    .limit(1);

  if (!community) {
    return { communityId, skipped: true, reason: "not_found" };
  }

  const wasHidden = Boolean(community.isHidden);

  // Gate 1 — content-complete: enrichment already ran and saved permanently.
  const photoCount = (community.photos || []).filter(
    (p: string) => typeof p === "string" && p.trim().length > 0,
  ).length;
  const descLen = (community.description || "").trim().length;
  const isContentComplete = photoCount > 0 && descLen >= 100;
  if (isContentComplete && !force) {
    // A content-complete record needs no (re-)enrichment, but if it is still
    // hidden we can restore it for free by recomputing visibility — no billing.
    let visible: boolean | undefined;
    let restored = false;
    if (recomputeVisibilityOnSkip && wasHidden) {
      const vis = await recomputeCommunityVisibility(communityId);
      if (vis) {
        visible = !vis.hidden;
        restored = wasHidden && !vis.hidden;
      }
    }
    return {
      communityId,
      skipped: true,
      reason: "already_has_content",
      visible,
      restored,
    };
  }

  const now = Date.now();
  const lastAttempt = community.lastEnrichmentAttempt
    ? new Date(community.lastEnrichmentAttempt).getTime()
    : 0;
  const minsSinceAttempt = lastAttempt ? (now - lastAttempt) / 60000 : Infinity;

  // Gate 2 — in-flight de-dup (10 min). NOT a data TTL. Enforced always (even
  // with `force`) so two concurrent callers can't both fire the slow pipeline.
  if (community.enrichmentStatus === "in_progress" || minsSinceAttempt < 10) {
    return { communityId, skipped: true, reason: "in_progress" };
  }

  if (!force) {
    // Gate 3 — terminal "no data" state.
    if (community.enrichmentStatus === "no_data") {
      return { communityId, skipped: true, reason: "no_data_terminal" };
    }

    // Gate 4 — escalating backoff rate limit.
    const failedAttempts = community.enrichmentAttempts || 0;
    const requiredCooldownHours = selfHealCooldownHours(failedAttempts);
    if (minsSinceAttempt < requiredCooldownHours * 60) {
      return {
        communityId,
        skipped: true,
        reason: "rate_limited",
        retryAfterHours: requiredCooldownHours,
        consecutiveNoDataAttempts: failedAttempts,
      };
    }
  }

  const failedAttempts = community.enrichmentAttempts || 0;

  // Mark in-flight BEFORE the (slow) pipeline runs so a concurrent caller hits
  // gate 2 and does not fire a duplicate enrichment.
  const startedAt = new Date();
  await db
    .update(communities)
    .set({ enrichmentStatus: "in_progress", lastEnrichmentAttempt: startedAt } as any)
    .where(eq(communities.id, communityId));

  try {
    // Pass options only when set, so the common public-route path stays the same
    // single-arg call (Perplexity-first). The batch restore pass sets preferFree
    // for free-first cost order; the admin force path sets forceRefresh.
    const enrichOpts: { forceRefresh?: boolean; preferFree?: boolean } = {};
    if (force) enrichOpts.forceRefresh = true;
    if (preferFree) enrichOpts.preferFree = true;
    const result =
      Object.keys(enrichOpts).length > 0
        ? await enrichCommunityUnified(communityId, enrichOpts)
        : await enrichCommunityUnified(communityId);

    // "Found data" = real new content persisted this run, OR the community
    // already had meaningful content (cache hit). Anything else is a no-data run
    // that escalates the backoff.
    const foundData = result.cached === true || result.contentSaved === true;

    if (foundData) {
      await db
        .update(communities)
        .set({
          enrichmentStatus: "completed",
          enrichmentAttempts: 0,
          lastEnrichmentDate: new Date(),
        } as any)
        .where(eq(communities.id, communityId));
    } else {
      const newAttempts = failedAttempts + 1;
      const terminal = newAttempts >= SELF_HEAL_TERMINAL_ATTEMPTS;
      await db
        .update(communities)
        .set({
          enrichmentStatus: terminal ? "no_data" : "failed",
          enrichmentAttempts: newAttempts,
        } as any)
        .where(eq(communities.id, communityId));
    }

    // enrichCommunityUnified already recomputed visibility when it persisted
    // content. Read the current is_hidden so the caller knows if a restore
    // happened this run.
    let visible: boolean | undefined;
    let restored = false;
    if (foundData) {
      const [after] = await db
        .select({ isHidden: communities.isHidden })
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);
      if (after) {
        visible = !after.isHidden;
        restored = wasHidden && !after.isHidden;
      }
    }

    return {
      communityId,
      skipped: false,
      foundData,
      contentSaved: result.contentSaved,
      cached: result.cached,
      visible,
      restored,
      result,
    };
  } catch (pipelineErr) {
    // A thrown error is treated as transient (network/API), NOT a "no data"
    // outcome — it must not escalate the backoff toward the terminal state.
    await db
      .update(communities)
      .set({ enrichmentStatus: "failed" } as any)
      .where(eq(communities.id, communityId));
    throw pipelineErr;
  }
}
