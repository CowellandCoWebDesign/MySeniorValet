---
name: Community detail enrichment refresh race
description: Why enriched community photos/description appeared to vanish on revisit, and the invariants that prevent it.
---

# Enriched community data "vanishing" on the detail page

Symptom: admin/visitor enriches an empty community, photos/description/pricing
show, but on revisit the page looks empty until a HARD reload. The data DID
persist to the DB — it was a client cache + refetch race, not data loss.

## Root causes
- The community detail `useQuery` used `staleTime: 30min` (+ `gcTime: 2h`). After a
  background enrichment save, a remount/navigate-back within the stale window
  served the **pre-enrichment empty** cached copy without refetching. Hard reload
  cleared the in-memory cache → fresh DB fetch → data reappeared.
- The PRIMARY SEO route `GET /api/communities/by-slug/...` triggered **no** on-view
  enrichment and did **no** read-time photo filtering, while `GET /api/communities/:id`
  did both (fire-and-forget `enrichCommunityUnified` + `enrichCommunityIfNeeded`).
- The verify path (`handleInitialLoad`) only invalidated the **id** query key, never
  the **slug** key — so on slug pages the persisted set never refetched after verify.

## Invariants (keep these true)
- **Never cache the community detail record as fresh** — `staleTime: 0` so every
  mount/refocus refetches the authoritative DB record (gcTime keeps instant render).
- **The by-slug and by-id detail routes must stay at parity** — both trigger the same
  fire-and-forget `enrichCommunityUnified`, both run `enrichCommunityIfNeeded` photo
  filtering, both return `comprehensiveData` from `enrichedContent`.
- **Any client-triggered enrichment must refetch BOTH the slug key and the id key**
  (`refetchQueries`), because the slug route is primary and the active query key
  depends on the URL form. Self-heal already does both; verify must too.
- Persistence itself is already authoritative: self-heal/verify/admin-enrich all
  `await enrichCommunityUnified` (which persists) BEFORE responding, so a post-response
  refetch returns saved data — no overwrite-with-empty race.

**Why:** enrichment writes land asynchronously; the client must not pin a stale empty
snapshot, and the primary (slug) surface must enrich + refetch exactly like by-id.

## Dead end ruled out
`/api/web-intelligence/quick-photos` and `/quality-photos` (called by
EnhancedPhotoCarousel progressive loading) have **no server route** — they 404, so
they never inject transient display-only photos. Shown photos come from
`community.photos` (DB) + `verificationReport` images (which == the persisted set).
