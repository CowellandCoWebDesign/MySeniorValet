---
name: QC review queue semantics
description: Durable decisions behind the admin QC review & resolution queue (community adjudication)
---

# QC review & resolution queue — decisions

Admin surface that adjudicates problematic communities (mega-dashboard "QC Review" tab).

## Decisions worth keeping consistent
- **"Reviewed" reuses `flag_status='confirmed'`, not a new column.**
  **Why:** the visibility engine already treats `flag_status='confirmed'` as a protective
  keep-hidden override, so overloading it means "Keep hidden" both marks an item reviewed AND
  makes the visibility pass respect the decision — one source of truth, no drift.
  **How to apply:** any future "adjudicated/reviewed" concept for hidden communities should
  reuse `flag_status='confirmed'` rather than inventing a parallel flag.

- **Queue membership = hidden OR deactivated OR carrying any non-empty `flag_status`.**
  **Why:** the task scope is "hidden/flagged"; flagged-but-still-public records must be
  reviewable too, not just hidden/deactivated ones.

- **Removal is never an in-queue mutation — single AND bulk both go through the existing
  removal-request flow** (a removal request per community; admin fills requestor + reason).
  **Why:** hard task constraint — removal stays explicit/manual/authorized; nothing auto-deletes.

- **Only real signals are shown; nothing invented.** Reason buckets are SQL predicates over
  real columns (data_quality_flags, quality_tier, senior_classification, country, flag_status).
  As of June 2026 the scoring engine had not populated senior_classification / quality_tier /
  quality_score (all null), so classification/tier buckets read empty until that engine runs;
  flag/geo/country/deactivated buckets are the populated ones.
