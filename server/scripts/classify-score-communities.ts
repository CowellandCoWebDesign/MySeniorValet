/**
 * Task #262 — bulk classify, score & apply community visibility.
 *
 * Runs the single visibility policy (shared/community-classification.ts) over
 * every community: assigns senior_classification, quality_score, quality_tier,
 * merges problem flags into data_quality_flags, and applies the STRICT
 * keep-public visibility via is_hidden (the only bulk writer of is_hidden for
 * quality/senior reasons). Idempotent, batched, resumable. No hard deletes.
 *
 * Usage:
 *   npx tsx server/scripts/classify-score-communities.ts            # apply to all
 *   npx tsx server/scripts/classify-score-communities.ts --dry-run  # report only
 *   npx tsx server/scripts/classify-score-communities.ts --after-id=12345
 *   npx tsx server/scripts/classify-score-communities.ts --batch-size=500
 *   npx tsx server/scripts/classify-score-communities.ts --skip-checked-hours=24
 *   npx tsx server/scripts/classify-score-communities.ts --limit=100
 */
import { runVisibilityPass, type VisibilityPassStats } from "../services/community-visibility";

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

function printStats(label: string, stats: VisibilityPassStats) {
  const sortDesc = (o: Record<string, number>) =>
    Object.entries(o).sort((a, b) => b[1] - a[1]);
  console.log(`\n===== ${label} =====`);
  console.log(`processed: ${stats.processed}  (last id: ${stats.lastId})`);
  console.log(`visible:   ${stats.willShow}`);
  console.log(`hidden:    ${stats.willHide}  (protected-quarantine: ${stats.protectedHidden})`);
  console.log(`is_hidden changed this run: ${stats.hiddenChanged}`);
  console.log("\nclassification:");
  for (const [k, v] of sortDesc(stats.classification)) console.log(`  ${k.padEnd(12)} ${v}`);
  console.log("\nquality tier:");
  for (const [k, v] of sortDesc(stats.tier)) console.log(`  ${k.padEnd(12)} ${v}`);
  console.log("\nflags:");
  for (const [k, v] of sortDesc(stats.flags)) console.log(`  ${k.padEnd(18)} ${v}`);
}

async function main() {
  const dryRun = arg("dry-run") !== undefined;
  const afterId = num("after-id");
  const limit = num("limit");
  const batchSize = num("batch-size") ?? 1000;
  const skipCheckedWithinHours = num("skip-checked-hours");

  console.log("🏷️  Classify · score · apply visibility (Task #262)");
  console.log(
    `mode: ${dryRun ? "DRY-RUN (no writes)" : "APPLY"}` +
      `  batchSize=${batchSize}` +
      (afterId ? `  afterId=${afterId}` : "") +
      (limit ? `  limit=${limit}` : "") +
      (skipCheckedWithinHours ? `  skipCheckedWithinHours=${skipCheckedWithinHours}` : ""),
  );

  const start = Date.now();
  const stats = await runVisibilityPass({
    dryRun,
    afterId,
    limit,
    batchSize,
    skipCheckedWithinHours,
    onBatch: (s) => {
      if (s.processed % 5000 < batchSize) {
        console.log(`  …processed ${s.processed} (id ≤ ${s.lastId})`);
      }
    },
  });

  printStats(dryRun ? "DRY-RUN RESULT" : "APPLIED", stats);
  console.log(`\n✅ Done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ classify-score-communities failed:", err);
  process.exit(1);
});
