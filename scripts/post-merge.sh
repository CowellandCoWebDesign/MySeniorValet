#!/bin/bash
set -e
npm install
node scripts/post-merge-migrations.mjs

# NOTE: The community classify/score/quarantine data pass is intentionally NOT
# run here. The full reconciliation takes minutes (~87s for ~34k rows) and would
# blow the post-merge hook's hard 20s timeout, failing every merge's setup. The
# hook is for fast, additive schema migrations only.
#
# Run the data pass manually (idempotent + reversible, is_hidden only, no deletes):
#   npx tsx server/scripts/classify-score-communities.ts            # apply to all
#   npx tsx server/scripts/classify-score-communities.ts --dry-run  # report only
# See server/scripts/classify-score-communities.ts for full options.
