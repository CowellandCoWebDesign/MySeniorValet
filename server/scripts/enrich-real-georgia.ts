/**
 * Task #343 — enrich Georgia's genuinely-real hidden communities.
 *
 * Task #341 intentionally left untouched the small set of GENUINELY-REAL hidden
 * Georgia communities: real brand websites (Atria North Point/Buckhead, Holiday
 * by Atria Atlanta, Belmont Village Buckhead, Robin Run Village, The William
 * Breman Jewish Home, Foxwood Springs, Cresswind Peachtree City, …). They are
 * hidden ONLY because they lack photos/description content — NOT because they are
 * fake. Giving them real content lets them pass the keep-public visibility policy
 * so families searching Georgia can find them.
 *
 * This runner (Golden-Data safe — it fabricates nothing):
 *   1. Selects hidden GA communities whose website is a REAL brand domain
 *      (a valid http(s) URL, NOT the templated `{town}-senior-living.com` fake,
 *      NOT a directory/aggregator host) and whose classification is senior or
 *      unknown (never non_senior general housing).
 *   2. Runs the EXISTING unified enrichment pipeline (enrichCommunityUnified with
 *      forceRefresh) — Perplexity-first → free scraper fallback → photo filter.
 *      Only verified content is persisted; a run that finds nothing saves nothing.
 *   3. Re-scores each row via recomputeCommunityVisibility. A row that gains real
 *      content (>=1 photo OR >=100-char description) and classifies senior/unknown
 *      auto-restores to public; the rest stay hidden with their existing reason.
 *
 * IMPORTANT (isolated-env caveat): this is a DATA operation and does NOT merge
 * back from an isolated task-agent DB — only code merges. The actual enrichment
 * pass MUST be run against the LIVE database (main agent / post-merge step).
 * Running it here only verifies the tooling; the dev DB mirrors live.
 *
 * Usage:
 *   npx tsx server/scripts/enrich-real-georgia.ts               # apply (enrich + rescore)
 *   npx tsx server/scripts/enrich-real-georgia.ts --dry-run     # list targets only, no writes
 *   npx tsx server/scripts/enrich-real-georgia.ts --limit=3     # cap for a test run
 *   npx tsx server/scripts/enrich-real-georgia.ts --delay-ms=3000
 *   npx tsx server/scripts/enrich-real-georgia.ts --ids=70489,70490  # explicit ids
 */
import { pool } from "../db";
import { enrichCommunityUnified } from "../services/community-enrichment-orchestrator";
import { recomputeCommunityVisibility } from "../services/community-visibility";

const GA_STATE_PREDICATE = `upper(trim(coalesce(state,''))) IN ('GA','GEORGIA')`;

// A REAL brand website is a valid http(s) URL that is NOT the machine-generated
// templated fake and NOT a third-party directory/aggregator host (those are not
// the community's own site, so scraping them would not be authentic first-party
// content). This deliberately excludes the ~106 HUD-apartment rows (no website /
// non_senior) and the templated `{town}-senior-living.com` fakes queued for
// removal in Task #341.
const DIRECTORY_HOSTS = [
  "olera.care",
  "aplaceformom.com",
  "caring.com",
  "seniorlivingnearme",
  "seniorly.com",
  "senioradvisor.com",
  "yelp.com",
  "facebook.com",
  "niche.com",
  "apartments.com",
];
const DIRECTORY_PREDICATE = DIRECTORY_HOSTS.map(
  (h) => `AND website NOT ILIKE '%${h}%'`,
).join("\n          ");

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return undefined;
  const eq = hit.indexOf("=");
  return eq === -1 ? "true" : hit.slice(eq + 1);
}

function num(name: string): number | undefined {
  const v = arg(name);
  if (v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface TargetRow {
  id: number;
  name: string;
  city: string | null;
  website: string | null;
  senior_classification: string | null;
  desc_len: number;
  has_photos: boolean;
}

async function loadTargets(idsArg?: string, limit?: number): Promise<TargetRow[]> {
  const baseSelect = `
    SELECT id, name, city, website, senior_classification,
           COALESCE(length(trim(description)), 0) AS desc_len,
           (array_length(photos, 1) IS NOT NULL AND array_length(photos, 1) > 0) AS has_photos
      FROM communities`;

  if (idsArg) {
    const ids = idsArg
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n));
    if (ids.length === 0) return [];
    const r = await pool.query(
      `${baseSelect} WHERE id = ANY($1::int[]) ORDER BY id`,
      [ids],
    );
    return r.rows as TargetRow[];
  }

  const r = await pool.query(
    `${baseSelect}
      WHERE ${GA_STATE_PREDICATE}
        AND is_hidden = true
        AND website ~* '^https?://'
        AND website NOT ILIKE '%-senior-living.com'
        ${DIRECTORY_PREDICATE}
        AND senior_classification IN ('senior', 'unknown')
      ORDER BY id
      ${limit ? `LIMIT ${limit}` : ""}`,
  );
  return r.rows as TargetRow[];
}

async function main() {
  const dryRun = arg("dry-run") !== undefined;
  const delayMs = num("delay-ms") ?? 2000;
  const limit = num("limit");
  const idsArg = arg("ids");

  console.log("🍑 Enrich genuinely-real hidden Georgia communities (Task #343)");
  console.log(
    `mode: ${dryRun ? "DRY-RUN (no writes)" : "APPLY"}` +
      `${limit ? `  limit=${limit}` : ""}${idsArg ? `  ids=${idsArg}` : ""}  delayMs=${delayMs}`,
  );

  const targets = await loadTargets(idsArg, limit);
  console.log(`\nFound ${targets.length} genuinely-real hidden GA communities to enrich.\n`);
  for (const c of targets) {
    console.log(
      `  #${c.id} ${c.name} (${c.city ?? "?"}) — ${c.website} ` +
        `[cls=${c.senior_classification}, desc=${c.desc_len}, photos=${c.has_photos}]`,
    );
  }

  if (dryRun) {
    console.log("\n(DRY-RUN: nothing was enriched or re-scored.)");
    await pool.end();
    process.exit(0);
  }

  let enriched = 0;
  let contentSaved = 0;
  let becameVisible = 0;
  let stayedHidden = 0;
  let failed = 0;

  for (const c of targets) {
    try {
      console.log(`\n→ Enriching #${c.id} ${c.name} …`);
      // forceRefresh so we always re-run the pipeline (these rows have thin/empty
      // descriptions that would otherwise be treated as a cache miss anyway, but
      // forcing keeps behavior explicit and re-derives photos).
      const result = await enrichCommunityUnified(c.id, { forceRefresh: true });
      enriched += 1;
      if (result.contentSaved) contentSaved += 1;
      console.log(
        `   contentSaved=${result.contentSaved} cached=${result.cached} ` +
          `descLen=${(result.summary || "").length} photos=${result.photos?.length ?? 0}`,
      );

      // Re-score visibility. enrichCommunityUnified already calls this internally
      // after persisting content, but we call it again explicitly so the summary
      // reflects the final persisted decision for every row (idempotent).
      const vis = await recomputeCommunityVisibility(c.id);
      if (vis && vis.hidden === false) {
        becameVisible += 1;
        console.log(`   ✅ NOW PUBLIC (classification=${vis.evaluation.classification})`);
      } else {
        stayedHidden += 1;
        console.log(
          `   ⏸️  stays hidden` +
            `${vis?.protected ? " (protective flag)" : ""}` +
            ` — insufficient real content to pass keep-public policy`,
        );
      }
    } catch (err) {
      failed += 1;
      console.error(`   ⚠️  #${c.id} ${c.name} failed:`, (err as Error)?.message ?? err);
    }

    if (delayMs > 0) await sleep(delayMs);
  }

  console.log("\n===== ENRICH REAL GEORGIA SUMMARY =====");
  console.log(`targets:                 ${targets.length}`);
  console.log(`enriched (pipeline ran): ${enriched}`);
  console.log(`persisted new content:   ${contentSaved}`);
  console.log(`became publicly visible: ${becameVisible}`);
  console.log(`stayed hidden:           ${stayedHidden}`);
  console.log(`failed:                  ${failed}`);
  console.log(
    "\nRows that gained real content (>=1 photo OR >=100-char description) and " +
      "classify senior/unknown auto-restored to public; the rest stay hidden with " +
      "their existing reason. Nothing synthetic was introduced (Golden Data Rule).",
  );

  await pool.end();
  process.exit(0);
}

main().catch(async (err) => {
  console.error("❌ enrich-real-georgia failed:", err);
  try {
    await pool.end();
  } catch {}
  process.exit(1);
});
