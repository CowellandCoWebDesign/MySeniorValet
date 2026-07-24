#!/bin/bash
set -e
npm install
node scripts/post-merge-migrations.mjs

# Task #360: one-time-per-DB cleanup of corrupted communities.website values
# (markdown wrappers, citation markers, junk placeholders, bare domains).
# Idempotent + batched — subsequent runs scan ~17k rows and write nothing
# (~3s). Non-fatal: a data-cleanup hiccup must not fail merge setup.
npx tsx server/scripts/sanitize-community-websites.ts \
  || echo "WARN: website sanitize pass failed (non-fatal, re-runs next merge)"

# Task #378: restore screened-real hidden senior communities (idempotent,
# resumable — time-boxed so it converges across merges; re-runs are cheap
# no-ops once the cohort is restored). Flags template-address synthetic
# batches with synthetic_suspected, then recomputes visibility through the
# single writer. MUST also be run once against the PRODUCTION DATABASE_URL
# (prod data does not merge):
#   npx tsx server/scripts/restore-screened-senior-communities.ts
# followed by a prod restart (startup clears + prewarms the sitemap cache).
npx tsx server/scripts/restore-screened-senior-communities.ts --max-seconds=25 \
  || echo "WARN: screened-senior restore pass failed (non-fatal, re-runs next merge)"

# NOTE: The community classify/score/quarantine data pass is intentionally NOT
# run here. The full reconciliation takes minutes (~87s for ~34k rows) and would
# blow the post-merge hook's hard 20s timeout, failing every merge's setup. The
# hook is for fast, additive schema migrations only.
#
# Run the data pass manually (idempotent + reversible, is_hidden only, no deletes):
#   npx tsx server/scripts/classify-score-communities.ts            # apply to all
#   npx tsx server/scripts/classify-score-communities.ts --dry-run  # report only
# See server/scripts/classify-score-communities.ts for full options.
#
# Task #352 description/website backfill (idempotent, run once on the live DB):
#   npx tsx server/scripts/backfill-descriptions-from-cache.ts            # apply
#   npx tsx server/scripts/backfill-descriptions-from-cache.ts --dry-run  # report only
# Upgrades template/truncated descriptions from cached enrichment summaries and
# repairs corrupted website values (markdown artifacts, citation markers, junk).
