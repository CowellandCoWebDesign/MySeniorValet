---
name: Communities Drizzle column drift
description: admin_rating_override and admin_rating_note were in the Drizzle schema but missing from the actual DB; fixed via startup migration in server/run-migration.ts.
---

# Communities Drizzle column drift

## Current Status (June 2026)
**FIXED.** Both `admin_rating_override` and `admin_rating_note` were added to the DB via
`server/run-migration.ts` (startup migration) and `scripts/post-merge-migrations.mjs`.
`db.select().from(communities)` now works correctly.

## The Rule (still valid for future schema additions)
Any new column added to the Drizzle schema must ALSO be added to the idempotent startup
migration in `server/run-migration.ts`. Without this, Drizzle ORM select generates an explicit
column list that includes the missing column, causing `42703: column does not exist` on every query.

**Why:** The `communities` table schema (`shared/schema.ts`) defines columns that have not always
been migrated to the actual PostgreSQL database. `db push` prompts for destructive renames and
is disabled; the only safe additive migration path is `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.

**How to apply:**
- Any new column in `shared/schema.ts` communities table → add a corresponding `ALTER TABLE communities ADD COLUMN IF NOT EXISTS ...` line in `server/run-migration.ts`
- Also add to `scripts/post-merge-migrations.mjs` for post-merge runs
- If you hit a `42703` error on any column: add it to `run-migration.ts` and run `npx tsx server/run-migration.ts` immediately — no restart needed

**Pattern for raw SQL when ORM fails:**
- Use `db.execute(sql\`SELECT * FROM communities WHERE ...\`)` as fallback
- Extract rows via `(result as any).rows ?? result`
- For IN lists use `sql.join(ids.map(id => sql\`${id}\`), sql\`, \`)` — do NOT use `ANY(array::int[])` which causes Drizzle to mis-cast JS arrays as `record`
