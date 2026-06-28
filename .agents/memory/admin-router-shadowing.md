---
name: Admin route shadowing & registration order
description: How /api/admin community routes resolve and which router wins on overlapping paths
---

# Admin community routes resolution

The active server entry is `server/routes.ts` (large file imported by `server/index.ts` as `registerRoutes`), NOT `server/routes/index.ts`. `server/routes.ts` calls `registerModularRoutes(app)` (from `routes/index.ts`) early; that in turn calls `registerAdminRoutes(app)` which mounts the main `adminRouter` (in `server/routes/adminRoutes.ts`) at `/api/admin` with `requireAuth + isAdmin`.

**Registration order = match priority.** The modular admin router is registered BEFORE any later `app.use('/api', ...)` sub-routers in `routes.ts`. So for overlapping paths (e.g. `GET/PUT/DELETE /api/admin/communities/:id`, `POST .../verify`), the main `adminRouter` wins and any later router's same-path handlers are dead/shadowed.

**Why it matters:** A second community router (formerly `adminCommunityRoutes.ts`, mounted later at `/api`) had its own PUT-with-DataIntegrityValidator that never actually ran because adminRouter's plain PUT shadowed it. Consolidation merged the truly-unique endpoints (stats, filters, hide/unhide, listing-flags moderation, verify/batch|stats|cities|top-cities, GET single admin-bypass) into `adminRouter` and added the Golden-Data validation to adminRouter's PUT so it isn't lost.

**How to apply:** When adding `/api/admin/communities/...` endpoints, add them to `adminRouter` in `server/routes/adminRoutes.ts`. Define literal sub-paths (`/communities/stats`, `/communities/filters`) BEFORE the param route `/communities/:id`, or `:id` will swallow them. Routes return 401 (not 404) when registered but the session is unauthenticated — that's the global guard, proof the route exists.
