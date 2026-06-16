---
name: Community enrichment pipeline
description: The single unified Perplexity-first enrichment pipeline and the Golden-Data/SSRF/website-authority constraints any future change must respect.
---

# Community enrichment pipeline

There is ONE enrichment pipeline: `enrichCommunityUnified()` in
`server/services/community-enrichment-orchestrator.ts`. Every entry point routes
through it — the public Refresh button (`POST /api/communities/:id/verify`), the
admin force-refresh (`POST /api/admin/communities/:id/perplexity-enrich`), the
admin enrich/refresh-dynamic/enrich-batch routes
(`server/routes/community-enrichment-routes.ts`), and the community-detail on-view
trigger (fire-and-forget; cost is bounded by the orchestrator's 7-day cache, so a
freshly-enriched community is served from DB without a new Perplexity call). Do NOT
re-introduce a competing pipeline.

**Why:** the codebase had ~6 overlapping enrichment services (optimized/simple/
gemini/on-demand/community-enrichment-service + inline route copies) that drifted
apart and produced inconsistent results. They were deleted and collapsed into the
one orchestrator.

## Pipeline order (do not reorder)
1. **Perplexity (PRIMARY)** — `perplexitySearchAPI.deepEnrichCommunity` (Search
   API + sonar structured-extract + native `return_images`) for description,
   contact/pricing, and multi-source photos.
2. **Free web scraping (BOOSTER/FALLBACK)** — `enrichCommunityFree` (DuckDuckGo +
   Jina) recovers description/photos for free when Perplexity returns nothing
   usable; directory/official pages scraped to corroborate photos.
3. **Photo validation + Golden-Data filtering** — stock/placeholder blocklist,
   senior-living-directory allowlist, name+city corroboration, SSRF-guarded
   fetches, non-destructive persistence.

> NOTE: This supersedes the older "paid-AI-free enrichment" mandate. Perplexity-
> first is now correct; the free scraper is the booster/fallback, not the default.

## Invariants any change MUST preserve
- **Golden Data Rule:** only verified real values persist. Reject SPA boilerplate
  (nav/footer/cookie/JS-disabled), generic og/social-share images (one junk image
  across thousands of communities), AI-guessed/unreachable websites. Fall back to
  "Contact for details" / "Contact for pricing" rather than inventing content.
- **Non-destructive persist:** never clobber richer existing data; a photo
  blocklist false-positive must not erase real existing photos.
- **`websiteProtected` is authoritative:** admin-entered website always wins;
  discovery/verify must never overwrite it or silently substitute a discovered URL.
- **7-day cache:** no re-enrichment/re-billing unless `forceRefresh` is passed.
- **Photo stock-blocklist matches by filename/path substring, not just domain:**
  directories serve generic placeholders from their own CDN
  (`/listing-stock-images/shutterstock_*.jpg`). Block `shutterstock`,
  `listing-stock-images`, `/stock-images/`, etc. — avoid bare `stock`
  (false-positives like "Stockton"/"Woodstock").
- **Validate photo/website corroboration against TITLE+SNIPPET, not the URL** — a
  host with a generic name token (sunrise-sunset.org ↔ "Sunrise Senior Living") is
  a false positive; for low-distinctiveness names also require the city.

## SSRF: server-side fetch of community-provided URLs
Enrichment fetches DB-stored community website URLs server-side. Every such fetch
MUST go through the SSRF guard (`isSafePublicUrl` / `isPrivateIp` in
`utils/data-quality`): http(s) + ports 80/443 only, reject
localhost/.local/.internal, DNS-resolve and reject private/loopback/link-local
(169.254/16 metadata)/CGNAT/multicast/reserved (IPv4+IPv6), and re-validate EVERY
redirect hop (`redirect: "manual"`, not "follow").
**Why:** without it, a crafted website/redirect could pivot to internal network or
cloud metadata. Residual DNS-rebinding TOCTOU remains (resolve vs connect are
separate) — acceptable for now; pin-per-hop or egress controls would fully close it.
