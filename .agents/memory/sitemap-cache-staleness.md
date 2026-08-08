---
name: Sitemap cache staleness
description: Sitemaps are file-cached for 24h; URL-format code changes don't show until the cache is cleared.
---

# Sitemap cache staleness

Generated sitemaps are written to `.cache/sitemaps/*.json` with a 24h TTL. The
served XML comes from this cache, **not** freshly from the DB on every request.

**Why:** Generating the communities sitemap (33,931 URLs) is expensive, so it is
cached. After a code change to the URL format (e.g. canonicalizing
`/community/{id}` → `/senior-living/{state}/{city}/{slug}`), the live sitemap keeps
serving the OLD URLs until the cache expires or is cleared.

**How to apply:** After any change to sitemap URL shape, clear the cache so a fresh
sitemap is served before submitting to Google Search Console / Bing:
- Dev: `rm -f .cache/sitemaps/*.json` (regenerates on next request).
- Programmatic: `clearSitemapCache()` in `server/sitemap-generator.ts`; also called
  by the daily `scheduledSitemapPing()` and on community add/bulk-add hooks in
  `server/utils/sitemap-pinger.ts`.
- Production has its OWN cache — clearing dev does NOT fix prod. Prod self-heals
  within 24h (scheduled ping) or on the next community add.
