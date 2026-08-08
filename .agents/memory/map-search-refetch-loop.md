---
name: map-search refetch loop & discovery fallback
description: Why the map/city search hung forever on empty cities and how its Perplexity-backed discovery fallback must behave
---

# Map-search empty-result infinite loop

**Rule:** The "force query when panel opens" effect in `client/src/pages/map-search.tsx` must NOT depend on `mapCommunities.length` (or re-fire while results are legitimately empty). Gate it to fire `invalidateQueries(['communities-map-bounds'])` at most ONCE per `boundsKey` via a `useRef`. The spatial query key already contains `boundsKey`, so genuine bounds changes refetch on their own.

**Why:** Depending on `mapCommunities.length === 0` created an infinite invalidate→refetch→still-empty→invalidate loop for any city with zero coverage (repro: "Ranger, TX"), hanging the panel on the mascot "Loading communities…" forever and spamming aborted spatial requests.

**How to apply:** Any effect that invalidates a bounds-keyed query must key its one-shot guard on the bounds identity, never on the (empty) result length. Same trap applies to the stale default-San-Francisco fetch in the spatial `queryFn` — return `[]` when `!mapBounds` instead of querying a hardcoded SF box, which briefly showed wrong results and added abort churn.

# Web-discovery fallback uses Perplexity (forced) on this page

**Rule:** On zero DB results for a real `searchQuery` (>2 chars), the map page fires `POST /api/global-discovery/search { query, searchType:'community', limit:30, discoveryMode:true }` ONCE (ref guard keyed by lowercased query). It MUST send `discoveryMode:true` so the server runs a fresh Perplexity (`sonar`) discovery and **bypasses the 24h cost guard** — otherwise the guard silently returns the empty DB result and the user sees "no results". Also expose a user-activated "Discovery Mode" button (empty state) + "Search again" banner button (results) that re-run the same forced call.

**Why:** The user explicitly overrode the original free-only constraint: the DuckDuckGo+Jina path "is not producing results" for map/city search, and a non-forced call hits the per-city 24h cost guard so any already-probed city comes back empty. Server-side the `searchType:'community'` discovery path already calls Perplexity (`perplexitySearchAPI.discoverCommunities`, model `sonar`); only `searchType:'services'` still uses DDG+Jina. This supersedes `free-discovery-pipeline.md` for the map page specifically.

**How to apply:** Render results via `displayedCommunities = mapCommunities.length ? mapCommunities : discoveredCommunities` so DB results always win and stale discovered results never bleed across cities. Discovered items can have id 0 / missing coords — make list keys index-unique and guard the distance sort on coord presence. Filter out the AI "no results" placeholder rows (names like "No specific senior living communities found in X") before rendering — they otherwise show as junk cards. Discovery latency is 20-60s; keep the spinner state visible.
