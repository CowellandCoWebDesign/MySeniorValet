---
name: Referral-support registry
description: Durable policy for deciding which senior communities may appear on public surfaces.
---

Public community visibility is a restrictive referral-authorization decision, not merely an operating-status or data-quality decision. Every public reader—search, maps, home/directory sections, pinned lists, detail routes, SEO, sitemaps, and counts—must use the same supporting-community eligibility policy.

**Why:** An active or open community may not accept MySeniorValet referrals. Brand size, competitor-directory presence, photographs, enrichment, or geographic membership cannot substitute for admin referral approval. A bypass on any public endpoint defeats the policy.

**How to apply:** Resolve approval only through canonical operator families, verified exact domains/aliases, or explicit individual approval. Never use loose brand substrings. Community-level exclusions and admin deactivation always override inherited approval. Discovery may stage candidates for review but must not return them publicly. Registry availability failures must compile to an empty result/404 rather than leaking old unrestricted inventory or referencing unavailable tables.
## Cache-independence rule
The SQL eligibility predicate may only cache STRUCTURAL facts (which registry tables exist). All decision data — gate flag, approvals, matches, exclusions — must be evaluated live inside the SQL (subqueries against platform_settings + registry tables). **Why:** a cached gate/decision snapshot goes stale after admin mutations; invalidating to null made sync routes compile to FALSE and emptied all public inventory. **How to apply:** invalidation marks the snapshot stale but keeps last-known structure; probe failures after a healthy probe keep last-known structure (stale-ok); only pre-bootstrap (never-probed) fails closed to SQL FALSE.

## Portfolio coverage rule
Exact alias/domain matching alone under-covers real portfolios (brands name communities "Brand <City>"). Use token-boundary brand-prefix aliases (`alias_kind='prefix'`, norm = prefix OR LIKE prefix||' %') for distinctive brands only; ambiguous words (holiday, provincial, integral, the ivy, conservatory) are `prefix_review` → proposed matches for admin review, never auto-published.

Approved registry identity counts as verification: `computeRowVisibility(row,{registryApproved})` keeps approved-portfolio records public despite thin-profile scoring, and `restoreApprovedPortfolioVisibility()` un-hides them at bootstrap — but hiding quarantines (synthetic/fake/test/duplicate/identity_suspect/confirmed flag) and registry exclusions ALWAYS win, and is_active is never touched.
