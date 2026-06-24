---
name: Community data pass must run on live DB
description: Bulk classify/score/quarantine is a DATA op that does not merge from task-agent DBs; how directory stats + prod cleanup are wired.
---

# Bulk visibility/data passes must run against the MAIN/live database

`server/scripts/classify-score-communities.ts` (→ `runVisibilityPass` in
`server/services/community-visibility.ts`) writes `senior_classification`,
`quality_score`, `quality_tier`, `data_quality_flags`, and STRICT `is_hidden`.

**Why:** task-agent code changes merge upstream, but task-agent *data* changes do
NOT. Running the pass in an isolated task DB leaves the live DB un-cleaned (saw
~30k visible / only 60 classified even though the code was merged). The pass MUST
be executed against the live DB to take effect.

**How to apply:**
- Live/dev: `npx tsx server/scripts/classify-score-communities.ts` (idempotent,
  reversible — is_hidden only, no deletes). ~34k rows ≈ 30-60s; the tsx wrapper
  may hit a 120s shell timeout near the end but it is resumable — re-run, or use
  `--skip-checked-hours=N` / `--after-id=N` to resume. Strict policy yields
  ~6.3k visible senior communities.
- Production: run the same full command once against prod DATABASE_URL. Ongoing
  top-up runs automatically in `scripts/post-merge.sh` via
  `--skip-checked-hours=168 --max-seconds=90` (time-boxed + stale-aware so it
  stays within the hook timeout and resumes across merges).

# Directory stats are scoped to the visible set
`/api/communities/stats` (server/routes/communityRoutes.ts) computes ALL numbers
over `publicVisibleFilter()` and `totalVerified` over `verifiedOnlyFilter()`
(real signals, never legacy `is_verified`). The directory hero + lower stats
panel read from this endpoint. `/api/communities/count` is intentionally left at
the raw total (home page consumes it and has its own separate task).
