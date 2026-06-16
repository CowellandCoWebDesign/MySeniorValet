---
name: Photo enrichment sources
description: Which sites are valid photo/info sources for admin community enrichment
---

Senior living DIRECTORY sites are VALID photo and info sources — accept them.
caring.com, aplaceformom.com, seniorlivingnearme.com, senioradvisor.com,
seniorhousing.net, assistedliving.com, seniorliving.org, etc. all have curated
community galleries and pricing. They are NOT directory junk to be filtered out.

**Why:** User mandate (June 2026) — directory pages like
`{community}.seniorlivingnearme.com` are the normal/expected URL form for many
communities, and their photos are fine. Over-filtering them left communities with
zero or stale photos.

**How to apply:**
- Only exclude genuinely irrelevant sites (yelp, tripadvisor, facebook, google,
  wikipedia, linkedin, youtube, instagram, twitter/x) from photo scraping and from
  "official domain" selection.
- Admin Perplexity enrichment (server/routes/adminRoutes.ts) scrapes MULTIPLE
  candidate pages: officialWebsite → DB website → Perplexity source URLs, merging
  deduped photos (cap 20, early-break ~12). Perplexity Search API returns text
  snippets only — actual photos come from scrapeWebsitePage() (og:image + inline).
- Use hostname-based matching (host === d || host.endsWith('.'+d)), never substring
  includes() — 'x.com' substring matches unrelated hosts. The trusted-directory
  allowlist + this exact-match test now live in ONE exported helper,
  `isSeniorLivingDirectoryHost()` (perplexity-search-api.ts) — reuse it everywhere
  instead of re-implementing per-route filters. See community-photo-write-paths.md.
