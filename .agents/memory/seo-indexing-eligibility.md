---
name: SEO indexing eligibility
description: One shared eligibility function decides index vs noindex,follow for community + location pages; all surfaces must consume it.
---

Rule: a single shared eligibility function (`shared/community-indexability.ts`) is the ONLY decider of index vs noindex,follow for community pages; a city/state page indexes only when ≥1 of its communities is indexable. Criteria doc: `docs/SEO_INDEXING_ELIGIBILITY.md`.

**Why:** ~2/3 of public community pages are thin/templated; indexing them risks sitewide Google quality demotion. Hiding/deleting was rejected — pages stay reachable with noindex,FOLLOW (never nofollow) so they flip to index automatically once enrichment adds real data, and robots.txt stays permissive so Google can see the noindex.

**How to apply:**
- Every surface must agree: all-UA shell injection, crawler SSR meta + X-Robots-Tag, location SSR, sitemaps (indexable pages only), and the client SPA (locations mirror the server decision via an API endpoint — don't re-derive client-side).
- Location robots decisions must resolve city slugs with the SAME normalizer as the page's data query, or SSR and sitemap disagree. State-code grammar includes hyphenated Australian codes (AU-SA/AU-WA) — a 2-3-letter-only regex silently drops them.
- data_quality_flags are nearly universal → only critical-integrity flags hard-fail; a defaulted-only care type is UNCONFIRMED unless corroborated.
- Duplicate handling is canonical-interim only (flag secondary → canonical to primary + noindex + out of sitemap); the duplicate service's name normalizer strips most senior-living words, so names can reduce to empty and match 100% — always require nonempty normalized names plus address/phone/website evidence before trusting a duplicate pair.
