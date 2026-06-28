---
name: admin API global guard
description: /api/admin/* is intercepted by a global auth guard before route handlers run.
---

# All `/api/admin/*` requests are blocked by a global guard, even "no-auth" routes

A request to `/api/admin/anything` returns `{"message":"Unauthorized"}` (401)
without a valid admin session (a logged-in super-admin account) — even routes
that declare no auth middleware
(e.g. adminCommunityRoutes' `/admin/test`). So you cannot smoke-test admin
endpoints with a plain `curl` from the shell, even in development mode.

**Why:** a global middleware guards the `/api/admin` prefix ahead of the
per-router `requireAdmin` checks; the dev-bypass inside individual route files
never gets a chance to run for unauthenticated shell requests.

**How to apply:** to validate admin-route logic locally, exercise the underlying
service/SQL directly (e.g. via `psql` or a `tsx` script) rather than hitting the
HTTP endpoint. A 401 from `curl` on an admin route is expected, not a bug.
