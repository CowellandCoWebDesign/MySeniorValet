---
name: Self-heal enrichment backoff
description: How the public self-heal endpoint stops re-billing communities that have no findable data online.
---

The public self-heal endpoint (`POST /api/communities/:id/self-heal`) used to
retry every community every 24h forever. Now it backs off communities that
repeatedly find nothing.

**Signal for "found data":** `result.cached === true || result.contentSaved === true`.
`contentSaved` was added to `UnifiedEnrichmentResult` (= the orchestrator's
internal `contentWasSaved`) and is the ONLY reliable "new real content persisted
this run" flag — do NOT infer success from result.phone/website, which fall back
to pre-existing DB values and would never escalate.

**Backoff (keyed off `enrichment_attempts` = consecutive no-content runs):**
24h → 7d → 30d, then terminal `enrichment_status='no_data'` at
SELF_HEAL_TERMINAL_ATTEMPTS (4). `selfHealCooldownHours()` is exported and pure.
A found-data run resets attempts to 0 + status=completed.

**Why thrown errors don't escalate:** a pipeline exception is transient
(network/API), not a "no data" verdict — the catch sets status=failed but does
NOT increment attempts, so a flaky run can't push a community to terminal.

**Manual retry:** admin force-enrich (`POST /api/admin/communities/:id/perplexity-enrich`)
resets enrichment_attempts=0 and clears the terminal no_data state regardless of
outcome — that IS the admin "force a retry" path.

**Gotcha:** writing 'no_data' requires the DB CHECK constraint to include it —
see enrichment-status-check-constraint.md (dev + prod separately).
