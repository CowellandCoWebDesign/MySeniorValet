---
name: New tables need startup migration
description: Any new Drizzle table must also be created idempotently in the startup migrations, or it won't exist in dev/prod DBs.
---

# New tables need startup migration

Rule: whenever a new table is added to `shared/schema.ts`, add a matching
`CREATE TABLE IF NOT EXISTS` (+ indexes) to the startup migrations
(`runStartupMigrations` in server/run-migration.ts).

**Why:** task agents run against isolated databases and DB changes never merge
back — only code merges. A feature built in a task session ships with a table
that exists nowhere else, so every insert 500s in dev and prod (this killed the
Start Your Search wizard until the table was recreated at boot). `db:push` is
not an option because of known schema drift (destructive rename prompts).

**How to apply:** mirror the Drizzle column types/defaults exactly in the DDL;
keep it idempotent (IF NOT EXISTS everywhere) since it runs on every boot in
both dev and production. Verify with a workflow restart + `\d <table>`.
