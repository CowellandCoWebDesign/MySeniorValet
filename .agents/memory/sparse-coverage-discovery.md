---
name: Sparse-coverage self-healing discovery
description: Why /api/global-discovery/search auto-runs web discovery for SPARSE coverage, not only zero results.
---

# Sparse-coverage auto-discovery

The discovery endpoint exists to validate+repair the DB, not only fill empty results.
So it auto-triggers web discovery when coverage is SPARSE, not just when zero DB rows exist.

**Rule:** sparse = few rows OR rows that look "covered" but are empty (missing photo and
real description). Well-covered cities keep a fast path and never call the paid AI.

**Why:** stale/incomplete rows from past failed scrapes rendered as empty cards yet blocked
self-healing because the city wasn't technically zero-result.

**Durable decisions:**
- Discovered results are ALWAYS merged with existing DB rows, de-duped, so users see both.
- A 24h cost guard prevents repeat AUTO (non-forced) discovery for the same city. It is
  IN-MEMORY by design, so it resets on server restart — a sparse city can re-trigger once
  after a restart. Expected, not a bug.
- The frontend must NEVER force-retry to bypass the guard. Sparse self-heal is server-driven
  on the normal (non-forced) call; only an explicit user button (force) bypasses the guard.
- Home page triggers a non-forced discovery on URL-driven location loads (SEO deep links) and
  on the search event, plus a once-per-query non-forced re-trigger when the server reports
  sparse but returned nothing — all force:false so the server guard still decides.
