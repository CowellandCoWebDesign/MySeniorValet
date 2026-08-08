---
name: Fabricated inventory counts ban
description: No hardcoded community/facility inventory counts in any crawlable surface; enforced by regression test
---
Rule: never hardcode community/facility/property inventory counts (e.g. "33,500+ communities", "412 Communities", "30K+") in JSON-LD, meta tags, SEO titles/descriptions, or crawlable page copy. Copy must be count-free or derived from a real cached query.

**Why:** invented totals drifted from the real DB and shipped to Google via structured data and landing-page copy; multiple review rounds found them scattered across ~40 client files and TWO server generators (server/seo/ and server/utils/structured-data-generator.ts — both exist, clean both).

**How to apply:** run `npm run test:seo-counts` (tests/structured-data-no-fabricated-counts.test.ts). It scans all client source line-by-line with an allowlist for legit numerics (55+ age type, Section 515 program names, pricing-tier limits, addresses, pagination). Extend the allowlist rather than weakening the patterns. Cited third-party statistics (ACL/Senior Corps) are allowed.
