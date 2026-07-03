---
name: NLP search location hard filter
description: How NLP search applies extracted city/state as a hard filter, and the entity traps that make hard filtering dangerous.
---

# NLP search location hard filter

Extracted location entities must be RESOLVED to a concrete {city, state} and applied as a hard SQL filter in community search — location-boost-only ranking let alphabetically-early wrong-city results win (Dallas query returned Redding, CA).

**Why:** entity lists arrive messy (e.g. "assisted living in Dallas Texas" → `["TX", "dallas", "Dallas Texas"]`); only a strict "City, ST" regex was consuming them, so most location intents were silently ignored.

**How to apply:**
- Resolve all entity strings together: state codes, full state names, "City, ST", and "City Statename" (strip trailing state words); prefer the shortest clean city candidate.
- Hard filtering makes entity FALSE POSITIVES dangerous: "near me" matched state code ME via the case-insensitive context regex; ambiguous codes (ME/IN/OR/OK/HI/LA/…) must only count when uppercase in the query, and filler words ("me", "here", "the area") must be excluded from the "in <location>" capture.
- Facility-name + city queries ("Oakmont Assisted Living of Redding") need residual name tokens (query minus location/care-type/generic words) ANDed with the location filter, then relaxed to location-only if zero results — otherwise name searches regress to alphabetical city listings.
- Zero results after location filtering must stay zero (triggers downstream discovery); never fall back to unfiltered wrong-city results.
