---
name: enrichment_status CHECK constraint
description: Adding a value to a schema.ts text-enum does NOT update the DB CHECK constraint; writes of the new value 500 until you ALTER it.
---

`communities.enrichment_status` (and several other communities text columns) are
declared in `shared/schema.ts` as `text(..., { enum: [...] })` — a TS-only enum.
The actual Postgres column is plain `text` BUT guarded by a separate CHECK
constraint (`communities_enrichment_status_check`) that enumerates the allowed
values. `db:push`/Drizzle does NOT manage these CHECK constraints.

**Rule:** when you add a new allowed value to one of these text-enums in schema,
you MUST also update the matching CHECK constraint in the DB, or every write of
the new value fails with an opaque 23514 → 500 (same trap as the SendGrid enum
note). Do it idempotently:

```sql
ALTER TABLE communities DROP CONSTRAINT IF EXISTS communities_enrichment_status_check;
ALTER TABLE communities ADD CONSTRAINT communities_enrichment_status_check
  CHECK (enrichment_status = ANY (ARRAY['pending','in_progress','completed','failed','no_data']));
```

**Why:** dev and prod have independent DBs; the constraint must be applied to
BOTH. The durable fix is to put the drop+re-add in `server/run-migration.ts`
(`runStartupMigrations`, idempotent, runs every boot) so it self-applies to dev
AND prod — do that rather than a one-off manual ALTER, which only fixes one DB.
`ENRICHMENT_STATUS_VALUES` there is the single source of truth for the
enrichment_status constraint; a drift test asserts the schema enum equals it.

**How to apply:** after changing any communities text-enum, inspect existing
constraints with `pg_get_constraintdef` over `pg_constraint` WHERE
`conrelid='communities'::regclass AND contype='c'`, then ALTER the relevant one.

Known constrained columns include: enrichment_status, claim_approval_status,
flag_status, subscription_status, subscription_tier, facility_type,
stripe_account_type.
