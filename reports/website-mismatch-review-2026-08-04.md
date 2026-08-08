# Task #440 — Website-identity mismatch review (2026-08-04)

Adjudicated review of the 603 PUBLIC communities from the Task #438 sweep
(`reports/identity-integrity-sweep-2026-08-04.md`). Every host was manually
classified; no blind bulk clearing. Runner (idempotent, re-runnable):

```
npx tsx server/scripts/review-website-mismatches-440.ts [--dry-run]
```

## Outcome (applied to this environment's DB)

| Bucket | Count | Action |
|---|---|---|
| KEEP — legit management-company / operator / non-profit / gov domains | 186 | none (sweep heuristic false positives, e.g. eldercarealliance.org, humangood.org, uniting.org, care21.co.jp) |
| DIRECTORY — aggregator/media hosts (assistedlivingmagazine, wikipedia, realtor.com, carehome.co.uk, …) | 77 | website cleared (not their site); phone/pricing untouched |
| SYNTHETIC — templated `{county}-senior-living.com` cluster (newcastle/fairfield/hennepin/cook/cuyahoga/…) | 302 | pending removal_requests row + `synthetic_suspected` flag + quarantined `is_hidden=true` (nothing deleted) |
| CLEAR — per-record wrong-entity websites (architects, developers, unrelated orgs) | 11 | website cleared |
| FLAG — sibling-facility contamination / garbled records (SEO-title names, wrong state) | 27 | website+phone+pricing cleared (unprotected fields only) + `identity_suspect` flag with evidence |
| UNKNOWN | 0 | — |

Idempotency verified: a re-run reports 186 KEEP + 1 protected DIRECTORY row
(#76643, `website_protected=true` — intentionally untouched) and writes nothing.

## IMPORTANT — live DB

This is a DATA operation; task-environment data does not merge. The same
command must be run once against the LIVE/production database (it also runs
non-fatally from `scripts/post-merge.sh` for the dev DB).

## Follow-through

- Synthetic cluster: approve/deny in the admin removal-request queue.
- Flagged records: review in the admin QC queue ("Fake / suspect" pill);
  `identity_suspect` blocks background self-heal enrichment until adjudicated.
- Cleared-website communities will pick up a correct site on their next
  identity-gated enrichment pass.
