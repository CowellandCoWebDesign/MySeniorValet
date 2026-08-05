---
name: Baked Senior Resource Directory
description: /senior-resources must serve listings baked into the initial HTML for ALL user agents; invariants to keep.
---

# Baked Senior Resource Directory

**Rule:** `/senior-resources` serves its full directory (curated + cached) baked
into the initial HTML for every visitor — no live lookup or web discovery may
ever run in that request path.

**Why:** owner direction — the page must be crawlable with JS disabled and
render instantly to compete for local search traffic. (Community detail pages'
on-view enrichment is intentional and separate; do not conflate them.)

**How to apply:**
- There are TWO server paths that can serve this page's HTML: the crawler SEO
  middleware (social/search UAs) and the shell injector for everyone else.
  BOTH must delegate to the same baked-directory injector, or crawlers get
  wrong/duplicate canonicals. Any new pre-shell middleware must delegate too.
- Category ids double as public anchor slugs (linked + indexed) — renaming
  them breaks inbound links.
- Golden Data: every curated listing is source-cited; omit hours rather than
  guess. County research lives in a generated data module, not the DB.
- DB unavailability must degrade to curated-only content, never an empty page.
