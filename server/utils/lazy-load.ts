import { createRequire } from "module";

const req = createRequire(import.meta.url);

/**
 * Lazily load a heavy CommonJS package on first property access instead of at
 * module-evaluation time.
 *
 * Why: the production bundle is built with esbuild `--packages=external`, so
 * every STATIC `import x from "pkg"` is hoisted to the top of the bundle and
 * loaded serially before `server.listen()`. Heavy packages (playwright,
 * cheerio, jsforce, ...) added multiple seconds to cold-start boot, which made
 * autoscale instances serve connection-refused/500 to Googlebot during scale
 * events. A runtime `require(pkg)` is invisible to esbuild's hoisting, so the
 * package loads only when a request path actually touches it.
 *
 * Usage:
 *   const cheerio = lazyModule<typeof import("cheerio")>("cheerio");
 *   ...later, inside a handler: cheerio.load(html)  // loads on first call
 *
 * Only use this for CJS-compatible packages; the load is synchronous on first
 * access (same behavior as the original top-of-file import, just deferred).
 */
/** Synchronously require an external package at call time (never hoisted by esbuild). */
export function requireModule(pkg: string): any {
  return req(pkg);
}

/**
 * Lazily load a package whose default export is a callable function
 * (e.g. `axios`, `node-fetch`). The proxy supports both direct invocation
 * (`axios(config)`) and property access (`axios.get(...)`), loading the
 * package only on first use so it never blocks server boot.
 */
export function lazyCallable<T>(pkg: string): T {
  let fn: any;
  const load = () => {
    if (fn === undefined) {
      const m = req(pkg);
      fn = m?.default ?? m;
    }
    return fn;
  };
  const target = function () {} as any;
  return new Proxy(target, {
    apply(_t, thisArg, args) {
      return Reflect.apply(load(), thisArg, args);
    },
    construct(_t, args) {
      return Reflect.construct(load(), args);
    },
    get(_t, prop) {
      if (prop === "name" || prop === "length") return load()[prop];
      const value = load()[prop];
      return typeof value === "function" ? value.bind(load()) : value;
    },
    has(_t, prop) {
      return prop in load();
    },
  }) as T;
}

/**
 * Lazily construct a client/SDK instance on first use. The factory (which may
 * `requireModule()` a heavy package and `new` up a client) only runs when a
 * request path first touches the client — not at module-evaluation/boot time.
 * Methods are bound to the real instance so call sites stay unchanged.
 */
export function lazyClient<T extends object>(factory: () => T): T {
  let inst: T | undefined;
  const load = () => {
    if (inst === undefined) inst = factory();
    return inst as any;
  };
  return new Proxy(Object.create(null) as T, {
    get(_target, prop) {
      const value = load()[prop];
      return typeof value === "function" ? value.bind(load()) : value;
    },
    has(_target, prop) {
      return prop in load();
    },
  });
}

export function lazyModule<T extends object>(pkg: string): T {
  let mod: any;
  const load = () => {
    if (mod === undefined) {
      mod = req(pkg);
    }
    return mod;
  };
  return new Proxy(Object.create(null) as T, {
    get(_target, prop) {
      return load()[prop];
    },
    has(_target, prop) {
      return prop in load();
    },
    ownKeys() {
      return Reflect.ownKeys(load());
    },
    getOwnPropertyDescriptor(_target, prop) {
      const desc = Object.getOwnPropertyDescriptor(load(), prop);
      if (desc) desc.configurable = true;
      return desc;
    },
  });
}
