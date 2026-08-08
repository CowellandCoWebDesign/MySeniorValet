---
name: Photo confirmation gate & forced-refresh clearing
description: Decision rules for when community enrichment persists photos, clears to empty, or preserves existing ones on forced refresh.
---

# Photo confirmation gate

A community photo may persist ONLY if positively tied to THIS community:
authentic (host matches the sonar-verified official host, exact or subdomain) OR
name+city corroborated (name-token + city-token match from a recognized
senior-living directory, no sibling location). Anchor authenticity to the
sonar-verified official host computed BEFORE photo extraction — never a heuristic
domain guess.

**Why:** Golden Data Rule, zero synthetic data. Wrong-community/stock photos must
fall back to "Contact for details" rather than display.

**How to apply:**
- Preservation across a forced refresh uses the SAME confirmation rule as discovery:
  preserve a stored photo when official-host confirmed OR name+city corroborated
  (directory attribution). Do NOT preserve official-only — corroborated directory
  photos must survive too.
- A forced refresh runs BOTH discovery passes (Perplexity return_images AND
  official/directory scrape corroboration) and merges the deduped sets — never
  short-circuit the scrape just because Perplexity returned images.
- Clear to empty (`photos=[]`, "Contact for details") ONLY when discovery actually
  completed AND the merged confirmed set is empty AND the DB previously had photos.
- NEVER clear on a transient failure: a scrape failure must not undo a successful
  Perplexity pass, and an empty result from a failed run must not wipe existing.
- Persistence guard: an empty photos array is normally DROPPED from the update (so
  we don't wipe). Only an intentional clear persists `photos=[]`.

**Frontend:** a forced refresh may ADD or CLEAR photos, so always invalidate the
community query (slug + id keys) after refresh — never gate invalidation on
"photos found". Apply a returned photos array even when empty so cleared/replaced
photos propagate instantly.
