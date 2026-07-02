---
name: Global input sanitizer vs pass-through URLs
description: The SQL-pattern request sanitizer mangles legitimate URL params (e.g. image-proxy CDN filenames containing "--"); exempt pass-through-URL routes.
---

# Global input sanitizer vs pass-through URLs

The global security middleware (`server/security.ts`) strips SQL-comment
patterns (`--`, etc.) from query params on every request. Routes whose params
ARE raw URLs must be exempted — `GET /api/image-proxy` is on the skip list.

**Why:** real CDN photo filenames commonly contain `--`
(e.g. `kennett-court--building-photo.jpg`). The sanitizer silently rewrote the
`url` param, the upstream fetch 404'd, and the photo rendered as a blank white
tile with a `[SECURITY]` log line as the only clue.

**How to apply:** when adding any endpoint that takes a full URL (or filename)
as a query param, check whether the sanitizer mangles it and extend the skip
list for that route instead of weakening the global patterns. The image-proxy
is still protected by its own SSRF guard, so skipping SQL-pattern stripping
there loses nothing.
