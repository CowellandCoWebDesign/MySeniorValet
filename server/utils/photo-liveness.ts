/**
 * Serve-time photo liveness filtering — a stored photo URL that is malformed or
 * confirmed dead/blocked upstream must NOT be counted or rendered as a photo.
 * Results are cached in-memory so detail views stay fast; transient failures
 * (timeouts) are treated as alive to avoid dropping real photos.
 */
import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { isSafePublicUrl } from "./url-safety";

const ALIVE_TTL_MS = 6 * 60 * 60 * 1000; // 6h — confirmed-alive URLs
const DEAD_TTL_MS = 60 * 60 * 1000; // 1h — confirmed-dead URLs (retry later)
const UNKNOWN_TTL_MS = 5 * 60 * 1000; // 5min — inconclusive probes (avoid re-paying probe latency on every request)
const PROBE_TIMEOUT_MS = 4000;
const TOTAL_BUDGET_MS = 6000;
const CONCURRENCY = 6;

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

type ProbeState = "alive" | "dead" | "unknown";
type CacheEntry = { state: ProbeState; expires: number };
const livenessCache = new Map<string, CacheEntry>();

function isMalformedPhotoUrl(url: string): boolean {
  if (!url || typeof url !== "string") return true;
  const trimmed = url.trim();
  if (trimmed.length < 12 || trimmed.length > 2000) return true;
  if (trimmed.includes("[object Object]") || trimmed.includes("...[TRUNCATED]")) return true;
  if (trimmed.startsWith("/uploads/")) return false; // local admin uploads are fine
  if (!/^https?:\/\//i.test(trimmed)) return true;
  try {
    const parsed = new URL(trimmed);
    return !parsed.hostname.includes(".");
  } catch {
    return true;
  }
}

const MAX_PROBE_REDIRECTS = 3;

/**
 * Probe a single URL. Returns:
 *  - "alive"   → 2xx image-ish response
 *  - "dead"    → DEFINITIVELY gone (404/410) or a hotlink-block HTML page —
 *                only these outcomes may be persisted as removals
 *  - "unknown" → timeout / network error / 403 / 429 / 5xx — bot-protected or
 *                transient; keep the photo, never persist a removal.
 *                ALSO returned (without fetching) for SSRF-unsafe targets
 *                (private/loopback/link-local/metadata hosts) — the server
 *                never touches those, and never persist-removes on them.
 *
 * SSRF hardening: every hop (initial URL + each redirect Location) is
 * validated with the shared isSafePublicUrl guard before it is fetched, so a
 * public host cannot redirect the probe into an internal service.
 */
async function probeUrl(url: string): Promise<ProbeState> {
  const attempt = async (method: "HEAD" | "GET"): Promise<ProbeState | null> => {
    let currentUrl = url;
    for (let hop = 0; hop <= MAX_PROBE_REDIRECTS; hop++) {
      if (!(await isSafePublicUrl(currentUrl))) return "unknown"; // SSRF guard — do not fetch
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
      try {
        const res = await fetch(currentUrl, {
          method,
          redirect: "manual", // validate every hop ourselves
          signal: controller.signal,
          headers: {
            "User-Agent": BROWSER_UA,
            Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
            ...(method === "GET" ? { Range: "bytes=0-0" } : {}),
          },
        });
        if (res.status >= 300 && res.status < 400) {
          const location = res.headers.get("location");
          if (!location) return "unknown";
          try {
            currentUrl = new URL(location, currentUrl).toString();
          } catch {
            return "unknown";
          }
          continue; // next hop (re-validated at top of loop)
        }
        // Some hosts reject HEAD — retry with a ranged GET before judging.
        if (method === "HEAD" && (res.status === 405 || res.status === 501 || res.status === 403)) {
          return null;
        }
        if (res.ok || res.status === 206) {
          const contentType = (res.headers.get("content-type") || "").toLowerCase();
          // Hotlink-blocked hosts often serve an HTML error page with 200.
          if (contentType.startsWith("text/html")) return "dead";
          return "alive";
        }
        // Only 404/410 are definitive. 403/429 = referer/bot protection (the
        // image proxy may still fetch it with richer headers); 5xx = transient.
        if (res.status === 404 || res.status === 410) return "dead";
        return "unknown";
      } catch {
        return "unknown"; // timeout / network — unknown, don't drop
      } finally {
        clearTimeout(timer);
      }
    }
    return "unknown"; // too many redirects — inconclusive
  };

  const headResult = await attempt("HEAD");
  if (headResult !== null) return headResult;
  return (await attempt("GET")) ?? "unknown";
}

export interface LivenessResult {
  live: string[];
  /** URLs positively confirmed dead or malformed (safe to persist-remove). */
  confirmedDead: string[];
}

/**
 * Filter a photo list down to servable URLs. Malformed URLs are always dropped;
 * remote URLs are probed (cached) within a total time budget — anything not
 * conclusively dead stays in the list.
 */
export async function filterLivePhotoUrls(urls: string[]): Promise<LivenessResult> {
  const live: string[] = [];
  const confirmedDead: string[] = [];
  if (!urls || urls.length === 0) return { live, confirmedDead };

  const deadline = Date.now() + TOTAL_BUDGET_MS;
  const toProbe: string[] = [];

  for (const url of urls) {
    if (isMalformedPhotoUrl(url)) {
      confirmedDead.push(url);
      continue;
    }
    if (url.startsWith("/uploads/")) {
      live.push(url);
      continue;
    }
    const cached = livenessCache.get(url);
    if (cached && cached.expires > Date.now()) {
      // "unknown" is treated as live for display but is cached briefly so hot
      // detail pages don't re-pay probe latency on every request.
      (cached.state === "dead" ? confirmedDead : live).push(url);
      continue;
    }
    toProbe.push(url);
  }

  // Probe with limited concurrency inside the time budget.
  let index = 0;
  const results = new Map<string, ProbeState>();
  const worker = async () => {
    while (index < toProbe.length) {
      const url = toProbe[index++];
      if (Date.now() > deadline) {
        results.set(url, "unknown"); // budget exhausted — keep photo, don't cache
        continue;
      }
      const outcome = await probeUrl(url);
      results.set(url, outcome);
      const ttl =
        outcome === "alive" ? ALIVE_TTL_MS : outcome === "dead" ? DEAD_TTL_MS : UNKNOWN_TTL_MS;
      livenessCache.set(url, { state: outcome, expires: Date.now() + ttl });
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, toProbe.length) }, () => worker()),
  );

  // Preserve original order for the final list.
  for (const url of urls) {
    if (live.includes(url) || confirmedDead.includes(url)) continue;
    const outcome = results.get(url);
    if (outcome === "dead") confirmedDead.push(url);
    else live.push(url); // alive or unknown
  }

  // Rebuild in original order.
  const liveSet = new Set(live);
  return {
    live: urls.filter((u) => liveSet.has(u)),
    confirmedDead,
  };
}

/**
 * Persist a cleaned photo list (removals only) back to the community record so
 * the stored data self-heals. Keeps photoAttributions aligned by index.
 * Fire-and-forget safe: never throws.
 */
export async function persistPhotoRemovals(
  communityId: number,
  removedUrls: string[],
): Promise<void> {
  if (!removedUrls || removedUrls.length === 0) return;
  try {
    const [row] = await db
      .select({
        photos: communities.photos,
        photoAttributions: communities.photoAttributions,
      })
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);
    if (!row || !Array.isArray(row.photos) || row.photos.length === 0) return;

    const removeSet = new Set(removedUrls);
    const keptPhotos: string[] = [];
    const keptAttributions: string[] = [];
    const attrs = Array.isArray(row.photoAttributions) ? row.photoAttributions : [];
    let removedAny = false;
    row.photos.forEach((url: string, i: number) => {
      if (removeSet.has(url)) {
        removedAny = true;
        return;
      }
      keptPhotos.push(url);
      keptAttributions.push(attrs[i] ?? "");
    });
    if (!removedAny) return;

    await db
      .update(communities)
      .set({
        photos: keptPhotos,
        photoAttributions: attrs.length > 0 ? keptAttributions : row.photoAttributions,
        updatedAt: new Date(),
      })
      .where(eq(communities.id, communityId));
    console.log(
      `🧹 Photo liveness: removed ${row.photos.length - keptPhotos.length} dead/malformed photo(s) from community ${communityId} (${keptPhotos.length} remain)`,
    );
  } catch (error) {
    console.error(`Photo liveness persist failed for community ${communityId}:`, error);
  }
}
