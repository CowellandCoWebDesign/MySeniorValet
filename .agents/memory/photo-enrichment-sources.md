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

**Perplexity `return_images` gate (June 2026):** the directory allowlist is NO
longer a hard requirement for Perplexity's own returned images. That gate
(`originIsDirectory && relevant`) discarded ALL photos for communities hosted on
unlisted sites (e.g. olera.care: 10 returned, 10 rejected, 0 kept). Now: trust
Perplexity by default — keep when authentic (official domain) OR a light guard
passes (`hasNameToken && hasCityToken && !siblingLocation`), and the guard ONLY
applies when BOTH distinctive name AND city tokens exist; generic-named /
unknown-city communities default to keeping. The Jina *scrape* directory gate
(arbitrary pages, not curated Perplexity output) stays in place.

**Why:** allowlist over-rejection silently zeroed out photos for good communities;
Perplexity already returns query-matched images, so a manual host list is redundant
and harmful. Light name+city guard still catches same-name college/gym/hospital.
