---
name: Communities Drizzle column drift
description: admin_rating_override is in the Drizzle schema but missing from the actual DB; any db.select().from(communities) call fails at runtime.
---

# Communities Drizzle column drift

## The Rule
Never use `db.select().from(communities)` for queries that will run in the current DB environment. Use raw `db.execute(sql\`SELECT * FROM communities WHERE ...\`)` instead.

**Why:** The `communities` table Drizzle schema (`shared/schema.ts`) defines `adminRatingOverride: decimal("admin_rating_override", ...)` but this column has never been migrated to the actual PostgreSQL database. Drizzle's ORM select generates an explicit column list that includes `admin_rating_override`, causing a `42703: column does not exist` error on every query.

**How to apply:**
- Any new endpoint that queries the communities table → use raw SQL `SELECT *` via `db.execute(sql\`...\`)`
- Extract rows via `(result as any).rows ?? result`
- For IN lists use `sql.join(ids.map(id => sql\`${id}\`), sql\`, \`)` — do NOT use `ANY(array::int[])` which causes Drizzle to mis-cast JS arrays as `record`
- For numeric column comparisons (rating, rent_per_month) these are `DECIMAL` in the DB — compare directly without any CAST
- The section-data endpoint in `server/routes/communityRoutes.ts` is the canonical example of the correct pattern

**To fix permanently:** Run `ALTER TABLE communities ADD COLUMN IF NOT EXISTS admin_rating_override DECIMAL(3,1);` against the production DB, then all ORM selects will work again.
