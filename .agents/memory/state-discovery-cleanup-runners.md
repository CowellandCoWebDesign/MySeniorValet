---
name: State discovery + synthetic cleanup runners
description: Pattern for per-state "find real communities + enrich real hidden ones + queue synthetic fakes for removal" data ops.
---

# Per-state discovery + synthetic-listing cleanup

Runnable scripts model this. The queue + discover runners are now STATE-GENERIC
(`server/scripts/queue-synthetic-communities.ts`,
`server/scripts/discover-communities.ts`, sharing `server/scripts/us-states.ts`
for state normalization). Both take `--state=` (2-letter OR full name) or run
ALL states when omitted, and emit a per-state report. The old Georgia-only
`queue-synthetic-georgia.ts` / `discover-georgia-communities.ts` were removed
(fully subsumed by `--state=GA`). The enrich runner remains Georgia-specific
(`server/scripts/enrich-real-georgia.ts`); generalize it the same way if needed.

**Discovery metros are DATA-DRIVEN, not hand-curated:** `metrosForState()` picks
each state's top-N cities by existing community count (default 20,
`--cities-per-state=`), overridable per single-state run via `--cities=`. This
targets discovery where communities actually cluster without a 50-state metro
table. `discoverySource='state_free_web'`.

**Nationwide scale (Task #344 snapshot):** ~10,344 rows match
`%-senior-living.com` (almost all hidden); top states OH 757, MO 702, VA 615, NC
595, GA 583. Full apply = ~10k removal-request inserts + thousands of free web
calls — a deliberate LIVE run, NEVER post-merge (post-merge must stay fast/idempotent).

**Enrich-real runner (restore genuinely-real hidden rows):** the state's real
brand communities can be hidden ONLY for lack of content (no photos / thin desc),
not because they're fake. Detect = `is_hidden=true AND website ~* '^https?://'
AND website NOT ILIKE '%-senior-living.com' AND website NOT ILIKE any
directory/aggregator host (olera.care, aplaceformom, caring, seniorly, yelp, …)
AND senior_classification IN ('senior','unknown')`. This naturally excludes the
HUD-apartment rows (no website / non_senior) and the templated fakes. For each:
`enrichCommunityUnified(id,{forceRefresh:true})` then
`recomputeCommunityVisibility(id)`. Rows that gain real content (>=1 photo OR
>=100-char desc) + classify senior/unknown auto-restore to public; the rest stay
hidden. Golden-Data safe (persists only verified content). Enrichment makes real
network calls — ~30-60s per row, so cap/batch when testing (`--ids=`, `--limit=`,
`--dry-run`).

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
