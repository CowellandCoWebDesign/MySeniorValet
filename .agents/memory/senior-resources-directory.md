---
name: Senior Resources directory architecture
description: How the /senior-resources directory layers and classifies resource data across categories.
---

The senior resources directory composes results in a fixed precedence and renders each item by a `scope` flag (curated / discovered / national). This is a durable design decision, not just current code.

**Layering precedence (highest to lowest):**
1. Curated hand-verified listings (NorCal home-base counties) — shown first; sets the "verified local coverage" banner.
2. Cached prior discoveries (freshness-windowed).
3. Live free web discovery — runs only on THIN local coverage, guarded so a location isn't re-discovered within 24h.
4. National federal programs (Medicare/PACE/VA/HUD/SSA) — apply to EVERY US location so non-curated areas always have real cited content even when discovery returns nothing.
5. 211 + state Area Agency on Aging fallback — always present.

**Category-awareness is mandatory:** discovery must run PER category (targeted query per category) and every discovered/cached row must be classified into a real category (keyword classifier + persisted category tag), NOT dumped into a single catch-all. A reviewer will reject a single generic discovery pass that lands everything in "community-211".

**County-aware cache:** the resources table has no county column — persist the discovery county in metadata and match on it (falling back to the city column for legacy rows), otherwise county-level repeat lookups miss when an item's city differs from the requested county.

**Why free web discovery, not Perplexity:** the codebase migrated all discovery to free search (DuckDuckGo primary, Bing failover) + Jina extraction; Perplexity is no longer used for discovery. replit.md still says "Perplexity-first" but that is stale for the discovery path. See `free-discovery-pipeline.md` and `search-provider-failover.md`.

**Golden Data + Removal rules:** every listing carries a source citation and verified flag; advance-care docs link ONLY to official gov/state sources (never generate/store the legal forms). The expansion was ADDITIVE — the original Food/IHSS/SLS tabs and endpoints stay untouched.
