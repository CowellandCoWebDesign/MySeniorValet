---
name: communities.photos text[] corruption
description: Why scraped photos found by enrichment fail to render publicly, and the normalize-everywhere rule that prevents it.
---

## The Rule
`communities.photos` is a Postgres `text[]`. It must only ever hold clean http(s) URL strings. Two corruption classes silently break public rendering even when admin enrichment "finds" photos:
1. Photo **objects** (`{url, source, isAuthentic}`) written into the text[] coerce to the literal string `"[object Object]"`. Real URLs usually survive in `enrichment_data->'photos'`.
2. **HTML-entity-encoded** URLs (`&amp;`, `&#38;`) 404 when fetched — the image proxy URL-decodes but historically did NOT entity-decode.

Always run `normalizePhotoUrls()` (server/utils/photo-urls.ts) on BOTH write and read paths. It maps objects→url, unwraps `/api/image-proxy?url=` prefixes, decodes HTML entities, drops non-http/`[object Object]`, and dedupes.

**Why:** the corruption is invisible in the admin panel (which reads the live object array) but the public detail page reads the persisted text[], so admins saw photos that never reached families.

**How to apply:**
- Read protection lives centrally in `CommunityPhotoEnrichment.getEnrichedPhotosForCommunity()` (behind `/api/communities/:id`) and the `comprehensive-data` endpoint.
- Any NEW code path that writes `communities.photos` must normalize first, and must NOT overwrite with an empty array when every candidate was filtered out (would wipe good existing photos).
- One-off backfill: `server/scripts/repair-corrupted-photos.ts` (idempotent, `--dry-run` supported) recovers object-corrupted rows from `enrichment_data` and entity-decodes the rest.
