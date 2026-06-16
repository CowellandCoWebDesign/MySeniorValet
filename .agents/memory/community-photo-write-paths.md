---
name: Community photo write paths
description: All the routes that persist to communities.photos and the shared Golden-Data gate they must each apply
---

There is NO single chokepoint for community photos — at least three routes write
to the canonical `communities.photos` column the public carousel reads:
1. `server/routes/communityRoutes.ts` verify endpoint (the public/auto path).
2. `server/routes/adminRoutes.ts` perplexity-enrich (admin-triggered).
3. `server/routes/competitiveAnalysisRoutes.ts` (competitive-analysis page).

**Why:** Fixing junk/wrong photos on only the verify path still let off-community
images ("clouding") leak in through the admin Jina-scrape and the competitive
analysis Sonar photos, because each path had its own (weaker) source filter. A
photo-source change applied to one path silently regresses via the others.

**How to apply:**
- Treat `isSeniorLivingDirectoryHost(host)` (exported from
  `server/services/perplexity-search-api.ts`) as the ONE source of truth for the
  trusted-directory allowlist. It does exact host/subdomain match
  (`h === d || h.endsWith('.'+d)`), never substring `includes` (look-alike guard).
- Trust a scraped/discovered photo only if its host is the verified official site
  (exact/subdomain of the DB/structured officialWebsite) OR a trusted directory
  whose page references the community by name+city (`textReferencesCommunity(..,
  {requireCity:true})`). The name+city text match ALONE is insufficient — same-name
  gyms/clinics/hospitals/architecture portfolios legitimately mention the city.
- The "official domain" used to flag a photo `isAuthentic` (which bypasses the
  name/city gate) must EXCLUDE senior-living directories — otherwise a first search
  result of caring.com/seniorly.com marks directory images authentic.
- `return_images` from Perplexity is nondeterministic for generic facility names;
  feed Perplexity Search results filtered to the allowlist into the scrape/
  corroborate path (`photoDirectoryCandidates`) so photos surface deterministically
  WITHOUT DuckDuckGo/Bing (the user flagged DDG as "clouding" Perplexity).

**Scraping URL hygiene (applies to every scrape):**
- Bare domains like `rbhc.biz` throw in `new URL()` → the SSRF guard
  (`isSafePublicUrl`) rejects them as "unsafe URL", silently dropping a valid
  official source. Normalize: prepend `https://` when no protocol.
- Force `http://` → `https://` before scraping. Persisted http image URLs are
  blocked as mixed content on the public https page, so the carousel shows nothing
  even though photos "exist". https-only scrape yields https image URLs that render.
