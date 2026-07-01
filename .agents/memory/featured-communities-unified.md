---
name: Featured communities are one admin list
description: Home "Featured & Coastal" + directory "Featured Excellence" both read from the single featured_communities table; never reintroduce a hardcoded list.
---

# Featured = ONE admin-controlled list (featured_communities table)

Both featured surfaces render from the SAME source of truth, the
`featured_communities` table (admin CRUD via `FeaturedCommunitiesManager` →
`/api/admin/featured-communities`; public read via `/api/featured-communities`,
which is `storage.getFeaturedCommunities()`):

- Directory "Featured Excellence" = `RedTagDeals.tsx` — maps each
  `/api/featured-communities` record's real enriched `.community` object straight
  into the shared `CommunityGrid`. NO hardcoded IDs, NO fabricated copy/ratings,
  NO stock photos.
- Home "Featured & Coastal" = `home_section_configs` id=6 (`section_type='featured'`)
  with `selectionMode='auto'` + `communityIds=[]`, so the section-data `'featured'`
  branch (`runAutoQuery`) reads `getFeaturedCommunities()` too. That branch orders by
  `array_position(ARRAY[ids], id)` (the admin display_order), NOT `qualityOrderBy()`,
  so home matches the directory order exactly (user wanted Atria La Jolla at #1) —
  do not revert it to quality ordering.

**Why:** there used to be THREE diverging featured lists (admin table, a hardcoded
directory list w/ fabricated marketing copy that violated the Golden Data Rule,
and a curated home list with its own IDs). The user asked for one admin-editable
list feeding both places.

**How to apply:**
- To change what's featured, edit the admin Featured Communities panel — it now
  drives BOTH sections. Do NOT re-add hardcoded IDs or `fallbackDeals` to
  RedTagDeals, and do NOT set section #6 back to `selectionMode='curated'`.
- `getFeaturedCommunities()` only returns rows with `is_active=TRUE` AND
  `show_in_red_tag_deals=TRUE` AND (`end_date` NULL or future).
- These are DATA ops on the live DB (do not merge from a task-agent DB); use
  idempotent `INSERT ... ON CONFLICT (community_id)` upserts and deactivate
  (is_active=FALSE), never delete, so it's reversible from the admin panel.
