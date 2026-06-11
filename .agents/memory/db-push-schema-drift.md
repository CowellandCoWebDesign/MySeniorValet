---
name: db push schema drift
description: Why `npm run db:push` is unsafe in this repo and how to apply additive column migrations instead.
---

# `drizzle-kit push` prompts for destructive table renames here — do not use it for small changes

Running `npm run db:push` pulls the live schema, finds large divergence between
`shared/schema.ts` and the actual DB, and interactively prompts things like
"Is accounts_receivable created or renamed from another table?" with a long list
of unrelated tables as rename candidates. Answering blindly can rename/drop tables.

**Why:** the Drizzle schema and the real Postgres schema have drifted (extra
tables/columns exist in the DB, e.g. `data_quality_score`, `data_quality_log`,
and triggers like `validate_hud_data_quality`). `push` tries to reconcile the
*entire* schema in one pass, not just your change.

**How to apply:** for additive column changes, edit `shared/schema.ts` for type
safety AND apply the column directly with idempotent SQL instead of `db:push`:
`psql "$DATABASE_URL" -c "ALTER TABLE x ADD COLUMN IF NOT EXISTS ..."`.
Verify with `psql "$DATABASE_URL" -c "\d communities"`. Never edit
`drizzle.config.ts` or `package.json`.
