---
name: Free community enrichment scraping
description: Why the enrichment pipeline is paid-AI-free and the Golden-Data/SSRF constraints any future change must respect.
---

# Free community enrichment scraping

Community enrichment (`server/services/on-demand-enrichment-service.ts`) is a
zero-cost, website-scraping-only pipeline (cheerio). It must NOT call paid AI
(OpenAI/ChatGPT, Claude/Anthropic, Perplexity) for description/photo generation.

**Why:** User mandate — billing used the user's own API keys, AI-generated
descriptions were invented marketing copy (a Golden Data Rule violation), and
the Playwright photo path was broken. Free scraping is the required default; a
"hyper cheap" real-research source may be added later via the `researchHook()`
no-op stub — never re-introduce invented content.

**How to apply:**
- Prefer curated sources for descriptions (JSON-LD → meta → og → body prose) and
  REJECT boilerplate (nav/footer/cookie/JS-disabled). Big-brand SPA pages
  (e.g. Atria) only server-render a generic shell, so they yield boilerplate
  descriptions and a single duplicated social-share/og graphic. Persisting those
  is a Golden Data violation (same junk image across thousands of communities) —
  filter them out (`looksLikeContentImage`, `isBoilerplate`, `isGenericEmail`)
  and let the community fall back to "Contact for details" instead.
- Only fill a description when the existing one is an empty stub (<100 chars);
  never clobber richer existing text.
- Real, server-rendered independent community sites scrape well (genuine
  description + multiple real photos) — that's the target case.
- Photo stock-blocklist must match by filename/path substring, not just the
  stock-photo *domain*. Directories (e.g. seniorliving.org) serve generic
  placeholders from their own CDN like `/listing-stock-images/shutterstock_*.jpg`;
  blocking only `shutterstock.com` lets them through, so they persist and show on
  the detail carousel while `community-card` filters them — an inconsistency users
  notice. Block `shutterstock`, `listing-stock-images`, `/stock-images/`, etc.
  (avoid bare `stock` — false-positives like "Stockton"/"Woodstock").

## SSRF: server-side fetch of community-provided URLs
Enrichment fetches DB-stored community website URLs server-side and is reachable
from the normal view flow (`onCommunityView`). Any such fetch MUST go through the
SSRF guard (`isSafePublicUrl` / `isPrivateIp`): http(s) + ports 80/443 only,
reject localhost/.local/.internal, DNS-resolve and reject private/loopback/
link-local (169.254/16 metadata)/CGNAT/multicast/reserved (IPv4+IPv6), and
re-validate EVERY redirect hop (use `redirect: "manual"`, not "follow").
**Why:** without it, a crafted website/redirect could pivot to internal network
or cloud metadata endpoints. Residual DNS-rebinding TOCTOU remains (resolve vs
connect are separate) — acceptable for now; pin-per-hop or egress controls would
fully close it.
