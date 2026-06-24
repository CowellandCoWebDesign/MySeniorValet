#!/bin/bash
set -e
npm install
node scripts/post-merge-migrations.mjs

# Data pass: classify/score/quarantine communities incrementally.
# Time-boxed (--max-seconds) and stale-aware (--skip-checked-hours) so it stays
# within the hook's timeout and resumes across merges. Idempotent + reversible
# (writes is_hidden only, never deletes). Never fail the merge on this — the
# full one-time prod cleanup is run manually (see classify-score-communities.ts).
npx tsx server/scripts/classify-score-communities.ts --skip-checked-hours=168 --max-seconds=90 || true
