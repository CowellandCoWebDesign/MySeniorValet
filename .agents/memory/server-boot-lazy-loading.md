---
name: Server boot lazy-loading
description: Why prod cold-start was slow and the rules that keep time-to-listen low
---

# Rule
Keep `server.listen()` early (migrations fire-and-forget post-listen) and never let heavy SDKs load before listen. All heavy externals go through `server/utils/lazy-load.ts` helpers: `lazyModule` (namespace/module), `lazyClient(factory)` (SDK instances constructed at module top — proxy defers construction to first property access), `lazyCallable` (callable defaults like axios/node-fetch), `requireModule` (raw sync require at call time).

**Why:** The prod build uses esbuild `--packages=external`, which hoists EVERY static external import to the top of the single bundle. They load serially before listen — even imports inside dynamically-imported local modules. Baseline cold start was ~5.7s (module eval ~5.4s of it); Google Search Console reported "server connectivity" failures. Runtime `require` (via `createRequire`) is NOT hoisted, so lazy helpers defer the cost to first use.

**How to apply:**
- Never add top-of-file static imports of heavy SDKs (stripe, openai, @anthropic-ai/sdk, axios, cheerio, playwright, jsforce, ioredis, openid-client, qrcode, google-auth-library, duck-duck-scrape, rate-limiter-flexible, node-fetch) in server code. Use `import type` + lazy helper.
- Never construct SDK clients at module eval (`const stripe = new Stripe(...)` at top) — wrap in `lazyClient<T>(() => new (requireModule('pkg').default)(...))`. Call sites stay unchanged (methods are bound).
- Watch for eager singletons whose constructors touch a lazy proxy at module eval (e.g. a service calling `redisCache.get()` or `stripe.webhookEndpoints` in its constructor) — defer with `setImmediate`. Trace offenders with a `Module._load` preload hook logging slow requires + stacks.
- date-fns: use subpath imports (`date-fns/format`) — the barrel costs ~250ms.
- Destructuring a lazy proxy at module top (`const { chromium } = lazy`) defeats laziness.
- @sendgrid/mail must stay eagerly loaded (gmail-sender monkeypatches it at boot) — it pulls axios (~230ms combined); accepted floor along with express/vite/drizzle/neon.
- Node 20.19+ `require(esm)` works, so `lazyCallable('node-fetch')` (ESM-only pkg) is fine.
- Measure: build, boot with `NODE_ENV=production`, grep `time-to-listen`; marginal costs via sequential `await import()` of the bundle's external list.
