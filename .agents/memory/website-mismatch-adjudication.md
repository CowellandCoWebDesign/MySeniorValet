---
name: Website-identity mismatch adjudication
description: How to review sweep-reported website mismatches without blind bulk clearing (host buckets + per-record overrides).
---

**Rule:** The identity sweep (`identity-integrity-sweep.ts --sweep=website`) is a heuristic — most hits are LEGIT parent-operator/nonprofit/gov domains. Adjudicate by HOST bucket, never bulk-clear: KEEP (operator/nonprofit), DIRECTORY (aggregator → clear website only), SYNTHETIC (`{place}-senior-living.com` regex → removal-request queue + synthetic_suspected + quarantine), per-ID FLAG (sibling contamination / garbled SEO-title records → clear website+phone+pricing + identity_suspect). Unknown hosts default to KEEP + report.

**Why:** Aug 2026 pass over 603 public suspects split 186 keep / 77 directory / 302 synthetic / 38 true mismatches — bulk clearing would have destroyed ~31% correct data.

**How to apply:** `server/scripts/review-website-mismatches-440.ts` models the pattern (respects website/phone/pricing `*_protected` columns; idempotent — actioned rows drop out of the re-scan). Data op: must run on the LIVE DB too; wired non-fatally into `scripts/post-merge.sh`. Garbled records to flag look like: SEO-title names, city/state contradictions ("Reno, CA"), sites of a nearby sibling facility.
