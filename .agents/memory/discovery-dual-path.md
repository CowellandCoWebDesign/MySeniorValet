---
name: Self-healing discovery has two independent paths
description: Home community discovery does NOT use comprehensive-search-engine; it uses /api/global-discovery/search
---

There are TWO separate self-healing discovery code paths. Changing only one leaves the user-facing behavior broken.

1. `server/services/comprehensive-search-engine.ts` `search()` — used by `/api/search/comprehensive`. Has its own discovery branch + `forceDiscovery` flag.
2. `server/routes/global-discovery.ts` `POST /api/global-discovery/search` — the path the HOME PAGE communities tab actually uses.

**Home communities rendering:** `myseniorvalet-home.tsx` HeroSection's `handleAutoExpandingSearch` fetches comprehensive for `searchResults.results`, but the inline results block is gated `activeTab !== 'communities'`, so those community results are NOT shown. Communities render via `SimplifiedMapPanel` (map markers from `/api/communities/map-data` by bounds) + a `discoveredCommunities` prop. The parent fills `discoveredCommunities` from a `homeSearchQuery` window event → `/api/global-discovery/search`.

**Why:** A task to "switch discovery to Perplexity" must edit global-discovery too, or the home page keeps using the old engine even though comprehensive-search-engine looks fixed.

**Cost control:** global-discovery only runs web discovery when `discoveryMode===true` OR DB has zero rows for the query. Send `discoveryMode:false` for auto (self-heal only on no local match) and `discoveryMode:true` to force (the "Search the web for this area" button).
