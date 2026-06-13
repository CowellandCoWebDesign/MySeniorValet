---
name: DB grooming — at-risk community hide (June 2026)
description: 2,416 communities were flagged and hidden from public view in a one-time grooming operation; how to reverse or extend it.
---

# DB grooming — at-risk community hide (June 2026)

On June 13, 2026, a direct SQL grooming operation flagged and hid 2,416 communities.

**Why:** Many discovered communities had 2+ missing data signals (no contact, no geocode, no address, no description). User requested they be hidden from public until admin reviews each one.

**What was done:**
- `is_hidden = true` — removes from all public queries (search, map, sitemap, detail)
- `data_quality_flags` set to array of signal strings per community
- `data_quality_checked_at = NOW()` stamped on each

**Signal keys used (consistent; do not rename):**
- `no_contact` — phone IS NULL AND email IS NULL AND website IS NULL
- `no_street_number` — address IS NULL or no digits in address
- `not_geocoded` — latitude IS NULL AND longitude IS NULL
- `no_description` — description IS NULL or < 40 chars
- `no_care_types` — careTypes IS NULL or empty

**Result:** 31,067 public, 2,416 hidden/flagged.

**How to reverse a community:** `UPDATE communities SET is_hidden = false, data_quality_flags = '{}' WHERE id = <id>;`

**How to restore all once enriched:** `UPDATE communities SET is_hidden = false WHERE data_quality_flags && ARRAY['no_contact'] AND phone IS NOT NULL;` (adjust per signal)

**How to apply:** Any future grooming run should use risk score ≥ 2 from these same signals. Use `data_quality_checked_at` to skip already-reviewed records.
