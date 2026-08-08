---
name: Free Discovery Pipeline
description: DuckDuckGo+Jina replaces Perplexity in all community discovery paths — where it lives, how it works, what to watch for.
---

# Free Discovery Pipeline

## What replaced what
- `server/services/free-discovery-service.ts` — new module, exports `discoverCommunitiesViaWeb(query, city?, state?)`
- Previously: `perplexitySearchAPI.discoverCommunities()` in global-discovery.ts and `perplexityService.searchRealTime()` in comprehensive-search-engine.ts

## How it works
1. DuckDuckGo HTML search (`duckduckgo.com/html/?q=...`) for senior-living keywords
2. Jina Reader (`r.jina.ai/{url}`) fetches each result URL as clean markdown (free, no key)
3. Regex extracts name (from title/H1), phone, street address, care types
4. SSRF guard: only fetches URLs matching `ALLOWED_SSRF_PATTERN`, never user-controlled URLs
5. Rejects SPA boilerplate: "You need to enable JavaScript", "Access Denied", etc.

## Auto-trigger rule
In `server/routes/global-discovery.ts`, `isDiscoveryMode` is now:
```
req.body.discoveryMode === true || (existingCommunities.length === 0 && query.trim().length > 2)
```
Zero DB results → free discovery fires automatically.

## What's still dead code
Healthcare/resources/vendors Perplexity blocks were wrapped in `if (false && ...)` at lines ~675-920 of global-discovery.ts — NOT removed, just made unreachable. Clean removal is tracked as a follow-up task.

**Why:** The block contained complex saving logic for `healthcareProviders` and `seniorResources` tables that would need a free alternative before safe removal.

## Data source strings
Discovered communities are now tagged:
- `data_source: 'Free Discovery (DuckDuckGo+Jina)'`
- `source: 'Free Discovery (<domain>)'`
