---
name: Photo re-enrichment trap
description: Why communities get stuck at zero servable photos and how visit-driven recovery works
---

The trap: a community can have stored photos that are ALL removed by the serve-time
sibling/junk filter (e.g. "Hilltop Estates" photos stored on "Hilltop Springs"), while the
no-expiry description cache tells the orchestrator "already enriched" and a corrupted
`website` value (markdown bold, citation markers, bare domain) blocks official-site
scraping. Result: visitor sees zero photos forever.

The fix (keep these invariants):
- `communityNeedsPhotoRediscovery()` (orchestrator) is the ONE pure detector: trapped =
  stored photos exist but zero survive filterPhotosForCommunity + stock filter; an EMPTY
  photo set is only "confirmed no-photos" when `lastPhotoEnrichment` is set.
- The no-expiry cache gate is bypassed ONLY when the caller passes
  `{ photoRediscovery: true }` AND the detector says trapped. The ONLY caller allowed to
  pass that flag is the self-heal route — its escalating backoff (24h→7d→30d→terminal
  no_data) is the cost guard. On-view fire-and-forget enrich calls must NOT pass it.
- Recovery is VISIT-DRIVEN only; never batch re-enrich. Client self-heal trigger must not
  be blocked by `enrichmentStatus==='completed'` when the served photo count is 0.
- `sanitizeWebsiteUrl` is applied on READ of the stored website everywhere the
  orchestrator uses it, so future corrupted writes can't re-block scraping.

**Why:** batch photo enrichment across ~33k communities is a cost bomb; the backoff
machinery already exists in the self-heal route, so funneling re-discovery through it
gets recovery for free with bounded spend.

**How to apply:** if a community shows zero photos but has rows in `photos`, don't touch
the sibling filter — check the detector + self-heal path. Website cleanup script
(`server/scripts/sanitize-community-websites.ts`, idempotent, --dry-run) compares
trailing-slash-insensitively so it only rewrites genuine corruption (~200 rows), not the
~15k rows that merely lack a canonical trailing slash.
