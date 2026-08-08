---
name: Map verified-only filter
description: How the family-facing "Verified only" toggle threads through the interactive map
---
The live family-facing map (`/map` → MapSearch → client/src/components/Map.tsx) does NOT use the supercluster `/api/communities/clusters` endpoint. It fetches raw markers from `/api/communities/markers` and clusters them in the browser via react-leaflet-cluster. So filtering the markers query automatically keeps frontend cluster counts accurate — no separate count recompute needed.

**Verified-only filter** uses `verifiedOnlyFilter()` from server/utils/community-ranking.ts (real signals only: quality_tier featured/verified, featured brand, featured/platinum subscription, claimed/claim_verified, or HUD id+rent — never the legacy is_verified boolean).

Threaded through (all accept `?verifiedOnly=true|1`):
- `/api/communities/markers` (the one the live map actually uses)
- `/api/communities/clusters` → superclusterService.getClusters(bbox, zoom, verifiedOnly) → all 4 sub-methods (city/state/regional/local). Supercluster cache keys get a `v:` prefix when verified so verified and unverified results don't collide.

**Why:** supercluster clusters endpoint is only used by experimental/demo pages (ai-search-intelligence, ai-map-showcase, test-debug), but threading it keeps cluster COUNTS honest there too.

**How to apply:** the directory's matching toggle is in client/src/pages/community-directory.tsx (state `verifiedOnly`). The map toggle lives in map-search.tsx filter bar (data-testid="toggle-verified-only"), stored in the `filters` SearchFilters object and passed via `searchFilters` to Map.tsx. Note: `false` boolean must be excluded from map-search activeFiltersCount or it falsely counts as an active filter.
