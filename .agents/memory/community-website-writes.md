---
name: Community website write sanitization
description: Every write to communities.website must go through sanitizeWebsiteUrl; junk becomes NULL, bare domains get https.
---

**Rule:** Any code path that sets `communities.website` (insert or update) must wrap the value in `sanitizeWebsiteUrl` from `server/utils/website-url.ts`. Junk/markdown/citation-marked values become NULL; bare domains get `https://`.

**Why:** Corrupted website values (markdown links, `[1]` citation markers, prose like "Not available") were being persisted by AI-discovery and verification writers, producing broken "Visit Website" links. A one-time cleanup isn't enough — new writers keep appearing, so the invariant lives at the write paths.

**How to apply:**
- `storage.createCommunity`/`updateCommunity` (both MemStorage and DatabaseStorage) are sanitizing chokepoints — anything routed through `storage.*` is covered automatically.
- Direct `db.insert(communities)`/`db.update(communities)` calls are NOT covered — each must sanitize explicitly (all existing ones do as of July 2026).
- Admin PUT sanitizes BEFORE deciding `websiteProtected`, so protection reflects the sanitized value.
- When adding a new community writer, prefer routing through `storage.*`; otherwise sanitize inline and drop (don't guess) invalid values.
