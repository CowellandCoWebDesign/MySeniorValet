---
name: Serve-time photo liveness + honest image errors
description: Rules for probing stored photo URLs at serve time and why the image proxy must return real error statuses.
---

# Serve-time photo liveness filtering

Detail routes probe stored photo URLs before serving and persist confirmed-dead removals so data self-heals.

**Rules (hard-won):**
- Only 404/410 (or a 200 HTML hotlink-block page) count as DEAD. 403/429 are bot/referer protection — the image proxy often still fetches those with richer headers, so treating them dead causes PERMANENT data loss when removals persist. 5xx/timeouts = transient.
- Cache ALL probe outcomes, including "unknown" (short TTL) — otherwise a consistently-timing-out host re-pays the full probe budget on every detail request.
- Never persist removals for unknown outcomes; display-keep them.

**Why:** persisted removals delete URLs from the DB — a false-dead verdict is irreversible without re-enrichment.

**SSRF:** any server-side fetch of a STORED URL (photos, websites) is an SSRF primitive — DB content is attacker-influenceable via enrichment. Use the shared guard in `server/utils/url-safety.ts` and validate EVERY redirect hop (manual redirects), not just the initial URL. Unsafe targets → "unknown" (never fetched, never persist-removed). Code review rejects serve-time fetch paths without this — the image proxy needs the identical guard, not its own hostname-prefix checks.

# Image proxy must surface real errors

Returning HTTP 200 with a placeholder image on failure prevents the browser's `img.onError` from firing, so carousels count blank frames as photos. The proxy must return real error statuses (502 upstream failure / 404 non-image) — clients rely on them for honest photo counts.

# Website URL sanitation

Sanitize website URLs on enrichment write AND on read. AI-sourced URLs commonly carry citation markers (`example.com[1][5].`), markdown bold/links, or bare domains. Strip `[digits]` markers and markdown, but NEVER strip underscores — they're valid in URL paths (a naive markdown-emphasis strip corrupted real `_`-containing paths).
