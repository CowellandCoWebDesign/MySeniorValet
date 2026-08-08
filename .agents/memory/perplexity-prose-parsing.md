---
name: Perplexity prose parsing
description: How natural-prose enrichment summaries are converted to structured facts (pricing labels, availability enum, structuredFacts blob) and the labeling pitfalls.
---

# Perplexity prose parsing

Enrichment summaries are natural prose ("$3,000–$5,000/month for assisted living; semi-private memory care $3,200"). Label-based parsers ("CURRENT PRICING:") extract nothing from them — parse prose server-side (`parsePerplexityProse`) and persist a `structuredFacts` blob (capacity, unitTypes, pricingByCareLevel, availability) inside `communities.enrichment_data`. The consolidated profile UI (header pricing band, quick facts, costs section, availability units grid) reads report.structuredFacts first, then the persisted blob.

**Rules learned the hard way:**
- Pairing an amount with its care level: use the NEAREST mention, before OR after the amount — "assisted living starting at $7,562" and "$7,562 for assisted living" both occur. The after-window must be truncated at conjunctions/commas/next `$` or "$4,100 and one-bedroom units at $5,300" steals the next amount's label.
- Segment on sentence AND semicolon boundaries so clauses don't inherit the previous clause's care level.
- Skip one-time fees (deposit/community fee/entrance fee) segments; sanity-bound monthly amounts ($500–$30,000).
- `availability_status` has a DB CHECK enum (Available/Waitlist/Full/Unknown) — normalize free text with `normalizeAvailabilityStatus` and SKIP the write when unmapped (else opaque 23514).
- enrichment_status must be resolved at the end of EVERY enrichment run (completed when content exists, else failed) and un-stuck on cache hits, or it dangles in "in_progress" forever.

**How to apply:** any new consumer of enrichment prose should reuse `parsePerplexityProse` rather than adding regex label parsers; any new write of availability/enum columns must normalize first.
