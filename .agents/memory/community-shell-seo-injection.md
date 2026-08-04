---
name: Community shell SEO injection
description: How community-specific SEO reaches initial HTML for ALL user agents, and the traps hit while building it
---

# Community shell SEO injection

All requests (not just detected crawlers) to valid community URLs get community-specific head tags + a pre-hydration block injected into the SPA shell via `server/seo/community-seo.ts` (`injectCommunityMetaIntoShell`), called from the dev catch-all in `server/vite.ts` and the prod `serveStatic` fallback. Crawler full-SSR path in `server/seo-ssr-middleware.ts` remains and shares the same builders (pricing, breadcrumbs, LocalBusiness JSON-LD).

**Rules / traps:**
- Inside `app.use("*")` handlers, `req.path` is mount-stripped — use `req.originalUrl` (query stripped) to match community URLs.
- `String.replace` with a string replacement interprets `$1`/`$&` — pricing text like "$3,835" gets eaten. ALWAYS use replacer functions when injecting content containing `$`.
- Server-injected head tags carry `data-ssr-meta`; `client/src/main.tsx` removes them before React mounts so Helmet/useSEO replace instead of duplicate (one-self-canonical rule). The injected `<title>` is intentionally NOT marked — Helmet updates the single title in place.
- Pre-hydration content goes INSIDE `<div id="root">`; `createRoot().render()` replaces it, so no duplicate H1 after hydration.
- Pricing display strictly from real DB values (rentPerMonth, then priceRange min/max); never "Contact for pricing" beside numeric pricing; verification date only when real pricing AND pricingLastUpdated exist.
- Pure builders live in `server/seo/community-seo-builders.ts` (no db imports, baseUrl passed explicitly) so jest can test injection/escaping without a database; tests in `tests/community-seo-injection.test.ts`.
- Strip ALL generic shell SEO (title, description/keywords/robots/googlebot/author, og:*, twitter:*, AND the static JSON-LD blocks) before injecting, or browsers end up with duplicate/conflicting tags after Helmet mounts.
- Every interpolated value in crawler SSR must go through escapeHtml; JSON-LD via safeJsonLd (escapes `<` → no `</script>` breakout); hrefs/srcs through safeHttpUrl (http/https only) — community data is enrichment-derived and untrusted.
- The dev shell contains an empty `<title></title>` inside the Replit devtools inline script's JS string — not a parsed tag; prod build has exactly one title. Don't chase it.
