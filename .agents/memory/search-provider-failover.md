---
name: Web search provider failover
description: How free web search works post-fallback (DDG vqd/JSON primary + Bing HTML fallback), and the engine constraints learned the hard way.
---

# Web search provider failover

`server/services/search-provider.ts` exports `webSearch(query) -> { provider, results[] }`.
All free search callers go through it: enrichment `searchDuckDuckGo()`
(free-enrichment-service.ts → photo discovery in communityRoutes) and the two
discovery `searchDuckDuckGo*()` functions in free-discovery-service.ts.

## Provider order (failover)
1. **DuckDuckGo** via `duck-duck-scrape` npm (vqd token + JSON endpoint). NOT the
   `duckduckgo.com/html/` page — that page is what DDG protects with the HTTP-202
   bot challenge. Replaced all raw HTML scraping.
2. **Bing** HTML scrape (no key) as fallback. Bing wraps result URLs in
   `bing.com/ck/a?...&u=a1<base64url>` — decode the `u` param (drop `a1`,
   base64url-decode) to recover the real URL. Needs Mac-Safari UA +
   `Cookie: SRCHHPGUSR=SRCHLANG=en` to return `li.b_algo` results.

`webSearch` catches throws / non-OK / empty and falls through; never throws into
the caller. Each provider has a 12s timeout. Logs which provider answered and
when failover triggered (🔁).

## Hard-won engine facts (this Replit datacenter IP)
- **Why:** duck-duck-scrape itself returns "DDG detected an anomaly" here (the
  vqd/d.js endpoint is also throttled for this IP), so in this environment Bing
  carries everything. In production DDG may work and is preferred.
- Bing is **great for branded/proper-noun queries** (photo discovery: a specific
  community name → real official site + directory listing pages). It returns
  **garbage for generic keyword-soup queries** ("senior living Naperville IL" →
  dictionary definitions, Wikipedia, tourism, even Chinese results) because Bing
  geo-personalizes and a datacenter IP has no local context. This is a Bing
  limitation, not a parser bug. The old DDG-HTML discovery returned 202/0 here
  too, so generic discovery via fallback is no worse, and photo discovery is now
  fixed.
- Excluded/dead engines: Brave (task-excluded, and 429s), Mojeek & Ecosia (403
  bot-block), Startpage (200 but no parseable results), DDG-lite (202).

## How to apply
- Don't reintroduce `duckduckgo.com/html/` scraping.
- If adding engines, prefer ones that survive a datacenter IP; test generic AND
  branded queries before trusting them.
- Bing-decoded URLs are absolute already — downstream SSRF guard + directory
  ranking still apply unchanged.
