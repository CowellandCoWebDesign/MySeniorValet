---
name: State discovery + synthetic cleanup runners
description: Pattern for per-state "find real communities + queue synthetic fakes for removal" data ops.
---

# Per-state discovery + synthetic-listing cleanup

Two runnable scripts model this (built for Georgia, Task #341):
`server/scripts/discover-georgia-communities.ts` and
`server/scripts/queue-synthetic-georgia.ts`.

**Rule:** these are DATA operations. Data written in an isolated task-agent DB
does NOT merge back — only code merges. Deliverable = runnable tooling; the
actual pass MUST run against the LIVE DB (main agent / post-merge step). Verify
locally only (the dev DB mirrors live).

**Discovery runner:** iterate metros → `discoverCommunitiesViaWeb` (free
DuckDuckGo+Jina, Bing failover) → persist via
`discoveredCommunityService.saveDiscoveredCommunity` (reuses Golden-Data
filters, dedup, reachable-website validation) → `recomputeCommunityVisibility`
per new id. Detect new-vs-dedup by snapshotting `MAX(id)` first (save() returns
the existing lower id on a dedup hit). Do NOT weaken the visibility policy;
thin/empty discovered rows correctly stay hidden until enriched.

**Synthetic templated fakes:** machine-generated listings share a templated
`{town}-senior-living.com` website (one per tiny town), a fabricated/mis-located
address, an auto phone, and `{no_photos,no_description}`. Detect =
`is_hidden=true AND website ILIKE '%-senior-living.com'` for the state. Real
brands use real domains and never match. NEVER enrich (would fabricate data) and
NEVER delete (Removal Authorization Rule) — only QUEUE for the user's approval.

**Queue mechanism (both surfaces):** (1) insert a pending `removal_requests`
row (requestType='community', system requestor `hello@myseniorvalet.com`,
legalBasis='accuracy') — the removal-review flow; (2) add protective
`synthetic_suspected` flag + `flag_status='pending'`, keep `is_hidden=true` — so
it shows in the admin QC queue under the "Fake / suspect" pill. Idempotent: skip
listings that already have an open (pending/reviewing) removal request.

**Drift gotcha:** `removal_requests` has Drizzle/DB drift — the schema declares
`supporting_documents`/`ip_address`/`user_agent` columns that don't exist in the
DB, so `storage.createRemovalRequest` throws 42703. Use a raw parameterized
INSERT of only the core columns (request_type, entity_id, entity_name,
requestor_*, reason, legal_basis, additional_notes, status) — portable across
dev+prod. `flag_status` DB CHECK allows only 'pending'|'confirmed'.
