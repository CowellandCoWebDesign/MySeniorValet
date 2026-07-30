---
name: Enrichment crash/persist resilience
description: How enrichment survives mid-flight restarts and failed final DB writes without phantom "completed" data.
---

Enrichment runs ~15s and used to persist in ONE final write; a merge-triggered
restart mid-flight lost everything and left status stuck 'in_progress'.

**Three protections (keep all when refactoring the orchestrator):**
1. **Startup sweep** (`sweepStaleInProgressEnrichments`, called post-listen via
   dynamic import): resets in_progress rows older than 5 min to 'failed'.
   Attempts are NOT incremented (a crash is not a no-data run); rows with
   enrichment_attempts=0 also get last_enrichment_attempt cleared so the next
   visit re-enriches immediately, while attempts>0 keeps the timestamp so the
   24h→7d→30d backoff stays intact. Raw SQL on purpose (Drizzle column drift).
2. **Early persist** (Stage 2.75, before slow photo discovery): description/
   phone/website written as soon as structured facts arrive, through the SAME
   gates (sanitizeWebsiteUrl, isReachableWebsite, websiteProtected,
   shouldUpgradeDescription). The computed coreUpdates are reused in the final
   write — do not duplicate the gate logic. Early-write failure is non-fatal;
   the final write retries the same fields.
3. **Typed persist failure**: the final write throws `EnrichmentPersistError`
   (status reverted to 'failed', never 'completed'); the self-heal route
   catches it and returns `{success:false, foundData:false, error:'persist_failed'}`
   WITHOUT escalating backoff — a save failure is not a no-data verdict.

**Why:** verified July 30, 2026 loss (client showed new data, DB stale after a
task-merge restart). The client must never display data the DB rejected.
