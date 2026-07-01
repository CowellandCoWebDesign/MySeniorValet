/**
 * Verify & restore hidden senior communities that are actually real.
 * =================================================================
 * A re-runnable, resumable, batched, cost-aware pass that walks the HIDDEN
 * senior communities, verifies + enriches each via the ONE unified pipeline
 * (`enrichCommunityUnified`, through the shared self-heal backoff runner), and
 * lets the existing visibility evaluator AUTO-RESTORE the ones that now clear the
 * keep-public bar. Anything still unverifiable, suspicious (synthetic_suspected /
 * clearly_fake / geo_needs_review), or terminal stays hidden.
 *
 * Nothing is deleted, nothing is force-shown: the pass only verifies, enriches,
 * and lets the deterministic visibility policy flip `is_hidden`.
 *
 * ── Priority (most-likely-real & cheapest-to-confirm first) ──────────────────
 *   1. hidden + senior + thin/empty WITH a website AND a phone
 *   2. … WITH a website OR a phone
 *   3. … with neither (lowest yield)
 * Protective-flagged rows (synthetic_suspected / clearly_fake / geo_needs_review)
 * are EXCLUDED by default — the visibility evaluator keeps them hidden regardless,
 * so enriching them only wastes budget. Pass --include-flagged to attempt them.
 *
 * ── Cost order (free-first) ─────────────────────────────────────────────────
 * Every community is enriched with `preferFree: true`, so the unified pipeline
 * runs the FREE web search/scrape (DuckDuckGo/Jina) FIRST and only escalates to
 * the paid Perplexity stage when the free pass yields insufficient content. This
 * keeps re-verifying ~22k communities from firing ~22k paid AI calls.
 *
 * ── Cost-awareness & resumability (no cursor needed) ────────────────────────
 * The selection query pre-filters to ELIGIBLE rows only: it excludes terminal
 * `no_data`, in-flight rows, and rows still inside their escalating self-heal
 * cooldown (24h → 7d → 30d, computed from enrichment_attempts). Because each
 * processed row gets `last_enrichment_attempt` stamped (and a no-data result
 * widens its cooldown / a success un-hides it), the SAME rows are not re-selected
 * on the next run — so the pass is naturally idempotent and resumable in
 * incremental, budget-bounded chunks. Use --limit / --max-seconds to bound a run.
 *
 * ── Usage ───────────────────────────────────────────────────────────────────
 *   # Preview the prioritized selection (NO enrichment, NO billing):
 *   npx tsx server/scripts/verify-restore-hidden-communities.ts --dry-run --limit=50
 *
 *   # Validate on a small batch (RUNS enrichment — free-first; bills paid AI
 *   # only for communities the free pass can't resolve):
 *   npx tsx server/scripts/verify-restore-hidden-communities.ts --limit=10
 *
 *   # Full incremental restoration against the LIVE database (run repeatedly):
 *   npx tsx server/scripts/verify-restore-hidden-communities.ts --limit=500 --max-seconds=900
 *
 * Flags:
 *   --limit=N            Max communities to process this run (default 25).
 *   --batch-size=N       Rows fetched per DB page (default 100).
 *   --concurrency=N      Parallel enrichments (default 2 — gentle on free search/AI).
 *   --max-seconds=N      Wall-clock budget; stop cleanly when reached (0 = none).
 *   --include-flagged    Also attempt synthetic_suspected / clearly_fake / geo rows.
 *   --all-tiers          Don't restrict to thin/empty; process any hidden senior.
 *   --dry-run            Print the prioritized selection only; no enrichment.
 *
 * IMPORTANT (data pass): data changes in an isolated task environment do NOT
 * merge to the live DB — only code merges. Validate on a small batch here, then
 * run the full incremental restoration against the LIVE database.
 */
import { pool } from "../db";
import { runSelfHealEnrichment } from "../services/self-heal-enrichment";

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return undefined;
  const eq = hit.indexOf("=");
  return eq === -1 ? "true" : hit.slice(eq + 1);
}
function num(name: string, dflt: number): number {
  const v = arg(name);
  if (v === undefined) return dflt;
  const n = Number(v);
  return Number.isFinite(n) ? n : dflt;
}

interface Candidate {
  id: number;
  name: string;
  city: string | null;
  state: string | null;
  hasWebsite: boolean;
  hasPhone: boolean;
  qualityTier: string | null;
}

/**
 * Fetch the next page of ELIGIBLE hidden senior communities in priority order.
 * Eligibility (matches the self-heal gates so we don't fetch rows the runner
 * would only skip):
 *   - is_hidden AND senior
 *   - NOT protective-flagged (unless --include-flagged)
 *   - enrichment_status NOT 'no_data' and NOT 'in_progress'
 *   - no enrichment attempt within the last 10 minutes (in-flight de-dup)
 *   - outside the escalating cooldown derived from enrichment_attempts
 */
async function fetchCandidates(opts: {
  limit: number;
  includeFlagged: boolean;
  allTiers: boolean;
}): Promise<Candidate[]> {
  const flaggedClause = opts.includeFlagged
    ? ""
    : `AND NOT (
         'synthetic_suspected' = ANY(COALESCE(data_quality_flags, '{}'))
         OR 'clearly_fake' = ANY(COALESCE(data_quality_flags, '{}'))
         OR 'geo_needs_review' = ANY(COALESCE(data_quality_flags, '{}'))
       )`;
  const tierClause = opts.allTiers ? "" : `AND quality_tier IN ('thin', 'empty')`;

  const sql = `
    SELECT id, name, city, state,
           (website IS NOT NULL AND website <> '') AS has_website,
           (phone   IS NOT NULL AND phone   <> '') AS has_phone,
           quality_tier
    FROM communities
    WHERE is_hidden = true
      AND senior_classification = 'senior'
      ${tierClause}
      ${flaggedClause}
      AND (enrichment_status IS DISTINCT FROM 'no_data')
      -- Gate-2 parity: the runner skips a row that is in_progress OR was attempted
      -- within the last 10 minutes (in-flight de-dup). Exclude BOTH here so we
      -- don't keep re-selecting rows the runner would only skip (incl. stale
      -- in_progress rows whose attempt is older than the 10-minute window).
      AND enrichment_status IS DISTINCT FROM 'in_progress'
      AND (last_enrichment_attempt IS NULL
           OR last_enrichment_attempt < now() - interval '10 minutes')
      AND (
        last_enrichment_attempt IS NULL
        OR last_enrichment_attempt < now() - (
          CASE
            WHEN COALESCE(enrichment_attempts, 0) <= 1 THEN interval '24 hours'
            WHEN enrichment_attempts = 2 THEN interval '7 days'
            ELSE interval '30 days'
          END
        )
      )
    ORDER BY
      (CASE WHEN website IS NOT NULL AND website <> '' THEN 1 ELSE 0 END) DESC,
      (CASE WHEN phone   IS NOT NULL AND phone   <> '' THEN 1 ELSE 0 END) DESC,
      id ASC
    LIMIT $1
  `;
  const res = await pool.query(sql, [opts.limit]);
  return res.rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    city: r.city,
    state: r.state,
    hasWebsite: r.has_website,
    hasPhone: r.has_phone,
    qualityTier: r.quality_tier,
  }));
}

async function main() {
  const limit = num("limit", 25);
  const batchSize = num("batch-size", 100);
  const concurrency = Math.max(1, num("concurrency", 2));
  const maxSeconds = num("max-seconds", 0);
  const includeFlagged = arg("include-flagged") !== undefined;
  const allTiers = arg("all-tiers") !== undefined;
  const dryRun = arg("dry-run") !== undefined;

  const deadline = maxSeconds > 0 ? Date.now() + maxSeconds * 1000 : null;

  console.log("🔎 Verify & restore hidden senior communities");
  console.log(
    `mode: ${dryRun ? "DRY-RUN (no enrichment)" : "ENRICH + RESTORE"}` +
      `  limit=${limit} batchSize=${batchSize} concurrency=${concurrency}` +
      (maxSeconds ? ` maxSeconds=${maxSeconds}` : "") +
      (includeFlagged ? " include-flagged" : "") +
      (allTiers ? " all-tiers" : ""),
  );

  // ── Dry-run: just preview the prioritized selection. ──────────────────────
  if (dryRun) {
    const candidates = await fetchCandidates({
      limit: Math.min(limit, 200),
      includeFlagged,
      allTiers,
    });
    console.log(`\nNext ${candidates.length} eligible (priority order):`);
    for (const c of candidates) {
      const tag = `${c.hasWebsite ? "W" : "-"}${c.hasPhone ? "P" : "-"}`;
      console.log(
        `  [${tag}] #${c.id} ${c.name} — ${c.city ?? "?"}, ${c.state ?? "?"} (tier=${c.qualityTier ?? "?"})`,
      );
    }
    await pool.end();
    process.exit(0);
  }

  const stats = {
    processed: 0,
    enriched: 0,
    contentSaved: 0,
    restored: 0,
    stillHidden: 0,
    skipped: 0,
    errors: 0,
    skipReasons: {} as Record<string, number>,
  };
  const start = Date.now();

  // Process in pages of eligible candidates. Because each processed row leaves
  // the eligible set (cooldown/visibility/terminal), every page returns fresh
  // rows until the budget/limit is hit or the eligible set is exhausted.
  let stop = false;
  while (!stop && stats.processed < limit) {
    const remaining = limit - stats.processed;
    const page = await fetchCandidates({
      limit: Math.min(batchSize, remaining),
      includeFlagged,
      allTiers,
    });
    if (page.length === 0) {
      console.log("\n✅ No more eligible communities — eligible set exhausted.");
      break;
    }

    let idx = 0;
    const worker = async () => {
      while (idx < page.length && !stop) {
        const c = page[idx++];
        try {
          const run = await runSelfHealEnrichment(c.id, {
            recomputeVisibilityOnSkip: true,
            preferFree: true,
          });
          stats.processed += 1;
          if (run.skipped) {
            stats.skipped += 1;
            const r = run.reason ?? "unknown";
            stats.skipReasons[r] = (stats.skipReasons[r] || 0) + 1;
            if (run.restored) {
              stats.restored += 1;
              console.log(`  🔓 RESTORED (already complete) #${c.id} ${c.name}`);
            }
          } else {
            stats.enriched += 1;
            if (run.contentSaved) stats.contentSaved += 1;
            if (run.restored) {
              stats.restored += 1;
              console.log(
                `  🔓 RESTORED #${c.id} ${c.name} — ${c.city ?? "?"}, ${c.state ?? "?"}` +
                  ` (saved=${run.contentSaved}, cached=${run.cached})`,
              );
            } else if (run.visible === false) {
              stats.stillHidden += 1;
            }
          }
        } catch (err) {
          stats.errors += 1;
          stats.processed += 1;
          console.warn(
            `  ⚠️ Error enriching #${c.id} ${c.name}: ${err instanceof Error ? err.message : err}`,
          );
        }

        if (deadline && Date.now() >= deadline) {
          stop = true;
          break;
        }
        if (stats.processed >= limit) {
          stop = true;
          break;
        }
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(concurrency, page.length) }, () => worker()),
    );

    console.log(
      `  …processed ${stats.processed}/${limit} (restored ${stats.restored}, ` +
        `contentSaved ${stats.contentSaved}, skipped ${stats.skipped}, errors ${stats.errors})`,
    );

    if (deadline && Date.now() >= deadline) {
      console.log("\n⏱️  Time budget reached — stopping cleanly (resume by re-running).");
      break;
    }
  }

  console.log("\n===== RESULT =====");
  console.log(`processed:     ${stats.processed}`);
  console.log(`enriched:      ${stats.enriched}`);
  console.log(`content saved: ${stats.contentSaved}`);
  console.log(`RESTORED:      ${stats.restored}`);
  console.log(`still hidden:  ${stats.stillHidden}`);
  console.log(`skipped:       ${stats.skipped}`);
  console.log(`errors:        ${stats.errors}`);
  if (Object.keys(stats.skipReasons).length) {
    console.log("skip reasons:");
    for (const [k, v] of Object.entries(stats.skipReasons).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${k.padEnd(20)} ${v}`);
    }
  }
  console.log(`\n✅ Done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
  await pool.end();
  process.exit(0);
}

main().catch(async (err) => {
  console.error("❌ verify-restore-hidden-communities failed:", err);
  try {
    await pool.end();
  } catch {}
  process.exit(1);
});
