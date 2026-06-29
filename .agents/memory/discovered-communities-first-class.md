---
name: Discovered communities are first-class
description: How web-discovered (uncovered-city) communities open, plot, and persist on the map-search flow
---

Web-discovered community results (uncovered cities, e.g. "Ranger, TX") flow
through POST /api/global-discovery/search with discoveryMode/force=true.

Rules / constraints learned:
- The discovery endpoint ALREADY persists discovered communities to the
  communities table and returns REAL positive ids (both newly inserted and
  merged existing DB rows). The id:0 objects only appear on an insert failure
  fallback.
- The response mapping (discoveredWithRealIds) must include `latitude`/
  `longitude` (from the saved row) or the client cannot plot pins — these were
  historically omitted even though the row was geocoded on insert.
- Client (map-search.tsx) passes `discoveredCommunities` to <Map> ONLY when
  `mapCommunities.length === 0`. That is safe because discovery only fires when
  the bounds markers query returned zero — so there is no DB pin to duplicate.
  If you ever also invalidate the markers query after discovery, you WILL get
  duplicate pins (one direct + one refetched).
- handleCommunityClick must guard `id > 0` before navigating to
  /communities/<id>; otherwise a failed-save result produces a broken
  /communities/0 link.

**Why:** Task #319 — discovered cards/pins were not reliably openable/plottable.
**How to apply:** when touching discovery → map rendering, keep coords in the
response, keep the zero-DB gating for direct pins, and keep the id guard.
