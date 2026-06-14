---
name: Community geocode cleanup & synthetic detection
description: How mislocated/synthetic communities are detected, why hard-delete by heuristic is unsafe, and the quarantine+geocode-arbitration pattern that replaced it.
---

# Detecting & repairing bad community coordinates

A large batch of `communities` rows had corrupted coordinates (>40km from their
per-(city,state) median centroid) mixed with fabricated/synthetic records. The
repair tooling lives in `server/scripts/fix-community-geocoding.ts` (delete/flag/
geocode phases, resumable) and `server/scripts/restore-quarantine.ts`.

## Rule: never hard-delete a community on a heuristic alone
**Why:** The original delete gate was `mislocated AND street matches generic
abbreviated vocab (Oak Ave/Pine St/Main St...)`. This produced FALSE POSITIVES —
real facilities on real common streets with corrupted coords were deleted (e.g.
real San Francisco SNFs on Pine St / Lake St like "St. Anne's Home"). Coordinate
corruption + a common street name is NOT proof of fabrication.

**How to apply:** Only hard-delete records that are *impossible to be real*:
- malformed concatenated street types (`Main Street Rd`, `4th Avenue St`,
  `Fry Boulevard Ave`) — no such real street exists; OR
- a website domain shared across multiple distinct cities (e.g. one
  `heritagepalms.com` used in Tampa+Sacramento+Asheville) or truncated fabricated
  domains. Everything else that merely looks generic must be QUARANTINED, not deleted.

## Pattern: quarantine + let the geocoder arbitrate
For ambiguous "synthetic-suspected" rows: keep them in the DB but
`is_hidden=true` + `data_quality_flags={geo_needs_review,synthetic_suspected}`,
set `location=NULL`, keep the (corrupt) lat/lng only to recompute mislocation.
Then the geocode phase decides authentically (Golden Data Rule — no fabricated coords):
- real address → resolves to verified street-level coords within 30km of city
  centroid → write coords, **unhide** (`is_hidden=false`), drop `synthetic_suspected`,
  add `geo_corrected`.
- fabricated address → fails to resolve → stays hidden + `synthetic_suspected`
  for human review. Never fall back to city-centroid coords (that is fabrication).

## Restore mechanics (faithful row resurrection)
All deletes are backed up to `.local/backups/deleted-synthetic-communities-*.json`
(full `SELECT *`, 365 cols). Re-insert with
`INSERT INTO communities SELECT * FROM jsonb_populate_recordset(null::communities, $1::jsonb) ON CONFLICT (id) DO NOTHING`
— Postgres coerces every column type (arrays, jsonb, numeric, timestamps) by name;
far safer than hand-mapping params. Null out `location` before insert so the geocoder
recomputes the PostGIS point.

## Map visibility
`server/routes/communityRoutes.ts` map query already filters `is_hidden IS NOT TRUE`
AND `isClearlyFake(...)`, so quarantined rows never reach the map/search.
