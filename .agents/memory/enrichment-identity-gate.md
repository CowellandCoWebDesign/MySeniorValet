---
name: Enrichment identity gate
description: Identity-bearing enrichment fields require the same name+city corroboration as photos; identity_suspect flag semantics and review flow.
---

# Enrichment identity gate

All identity-bearing enrichment writes (website, phone, management company,
capacity/unit types, pricing, availability, description) must pass the shared
corroboration helper (`community-identity`) before persist.

**Why:** web research can lock onto a sibling facility; wrong contact/pricing
data is worse than missing data, and a wrong stored website poisons every later
photo pass. The stored record ITSELF can be the false identity (garbled source
rows with ZIP↔city or name-geography conflicts poison every search built from
them) — mismatches are evidence about the record, not just the result.

**How to apply:**
- Corroboration rules mirror the photo gate: tokenizer keeps suffix words;
  short names (≤2 tokens) match ALL tokens; city must also appear but never
  rescues a failed name match. Gate runs BEFORE any identity field persists;
  on failure enrichment reports honest partial results.
- Repeated (≥2) mismatched resolutions ⇒ `identity_suspect` flag + evidence in
  enrichmentData. NEVER auto-rename.
- `identity_suspect` is a PROTECTIVE flag (survives routine QC restore/clear;
  clearing requires naming it — the "Identity reviewed" QC action) but does NOT
  force is_hidden (HIDING_PROTECTIVE_FLAGS is the hiding subset). While set,
  self-heal enrichment is terminal; admin force refresh still works.
- Integrity sweeps are REPORT-ONLY (website-domain mismatch, ZIP↔city majority
  check); never bulk-clear without review.
