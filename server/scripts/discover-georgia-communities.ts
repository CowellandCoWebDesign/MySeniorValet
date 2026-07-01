/**
 * Task #341 (part 1) — Georgia community discovery runner.
 *
 * Iterates a list of Georgia metros/cities, runs the existing FREE web-discovery
 * pipeline (DuckDuckGo + Jina Reader, zero API cost) for each, and persists
 * genuinely-new real communities through the existing DiscoveredCommunityService.
 * Every candidate therefore passes the SAME Golden-Data filters, dedup, reachable-
 * website validation, and (after save) the SINGLE community-visibility evaluation
 * that any other discovered community goes through — no policy is changed here.
 *
 * IMPORTANT (isolated-env caveat): this is a DATA operation. Data written in an
 * isolated task-agent database does NOT merge back to the live app — only code
 * does. So the deliverable is this runnable tool; the actual discovery pass must
 * be executed against the LIVE database (by the main agent, or as an explicit
 * post-merge step). Running it here only verifies the tooling.
 *
 * Usage:
 *   npx tsx server/scripts/discover-georgia-communities.ts                 # all default metros
 *   npx tsx server/scripts/discover-georgia-communities.ts --dry-run       # discover, don't persist
 *   npx tsx server/scripts/discover-georgia-communities.ts --limit-cities=5
 *   npx tsx server/scripts/discover-georgia-communities.ts --cities="Atlanta,Savannah,Macon"
 *   npx tsx server/scripts/discover-georgia-communities.ts --delay-ms=2000
 *   npx tsx server/scripts/discover-georgia-communities.ts --max-new=200   # global cost cap
 */
import { pool } from "../db";
import { discoverCommunitiesViaWeb } from "../services/free-discovery-service";
import { discoveredCommunityService } from "../services/discovered-community-service";
import { recomputeCommunityVisibility } from "../services/community-visibility";

// A representative spread of Georgia metros + mid-size cities so discovery has
// real geographic coverage across the state (not just Atlanta).
const DEFAULT_GA_CITIES = [
  "Atlanta",
  "Sandy Springs",
  "Roswell",
  "Alpharetta",
  "Johns Creek",
  "Marietta",
  "Smyrna",
  "Kennesaw",
  "Dunwoody",
  "Brookhaven",
  "Peachtree City",
  "Decatur",
  "Douglasville",
  "Lawrenceville",
  "Duluth",
  "Augusta",
  "Columbus",
  "Macon",
  "Savannah",
  "Athens",
  "Albany",
  "Warner Robins",
  "Valdosta",
  "Gainesville",
  "Rome",
  "Newnan",
  "Milledgeville",
  "Statesboro",
  "Dalton",
  "Brunswick",
];

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return undefined;
  const eq = hit.indexOf("=");
  return eq === -1 ? "true" : hit.slice(eq + 1);
}

function num(name: string): number | undefined {
  const v = arg(name);
  if (v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const dryRun = arg("dry-run") !== undefined;
  const delayMs = num("delay-ms") ?? 1500;
  const limitCities = num("limit-cities");
  const maxNew = num("max-new") ?? 500;

  const citiesArg = arg("cities");
  let cities = citiesArg
    ? citiesArg.split(",").map((c) => c.trim()).filter(Boolean)
    : DEFAULT_GA_CITIES;
  if (limitCities && limitCities > 0) cities = cities.slice(0, limitCities);

  console.log("🍑 Georgia discovery runner (Task #341)");
  console.log(
    `mode: ${dryRun ? "DRY-RUN (no writes)" : "PERSIST"}  cities=${cities.length}  ` +
      `delayMs=${delayMs}  maxNew=${maxNew}`,
  );

  // Snapshot the current max community id so we can distinguish freshly-INSERTED
  // rows (id > startMaxId) from dedup hits (existing lower ids returned by save).
  const maxRes = await pool.query(`SELECT COALESCE(MAX(id), 0)::int AS m FROM communities`);
  const startMaxId: number = maxRes.rows[0].m;

  let totalCandidates = 0;
  let totalNew = 0;
  let totalDedup = 0;
  const newIds: number[] = [];
  const perCity: { city: string; candidates: number; saved: number }[] = [];

  for (const city of cities) {
    if (totalNew >= maxNew) {
      console.log(`⛔ Reached global max-new cap (${maxNew}); stopping early.`);
      break;
    }

    try {
      const candidates = await discoverCommunitiesViaWeb(
        `${city} Georgia senior living assisted living`,
        city,
        "GA",
      );
      totalCandidates += candidates.length;

      let savedThisCity = 0;
      if (!dryRun) {
        for (const c of candidates) {
          if (totalNew >= maxNew) break;
          const id = await discoveredCommunityService.saveDiscoveredCommunity({
            name: c.name,
            address: c.address,
            city: c.city || city,
            // Normalize to the canonical two-letter state so dedup + location
            // matching stay consistent with the rest of the GA data.
            state: "GA",
            country: c.country || "US",
            website: c.website,
            phone: c.phone,
            careTypes: c.careTypes,
            description: c.description,
            discoverySource: "georgia_free_web",
          });
          if (id > startMaxId) {
            newIds.push(id);
            totalNew += 1;
            savedThisCity += 1;
          } else if (id > 0) {
            totalDedup += 1;
          }
        }
      }

      perCity.push({ city, candidates: candidates.length, saved: savedThisCity });
      console.log(
        `  ${city.padEnd(16)} candidates=${candidates.length}  new=${savedThisCity}`,
      );
    } catch (err) {
      console.error(`  ⚠️  ${city}: discovery failed —`, (err as Error)?.message ?? err);
      perCity.push({ city, candidates: 0, saved: 0 });
    }

    // Cost/rate guard: pause between cities so we stay gentle on the free
    // DuckDuckGo/Jina endpoints.
    if (delayMs > 0) await sleep(delayMs);
  }

  // Apply the SAME visibility evaluation every discovered community gets, so the
  // new rows are classified/scored/tiered and become visible iff they pass the
  // existing keep-public policy (never weakened here).
  let becameVisible = 0;
  if (!dryRun && newIds.length > 0) {
    console.log(`\n🔎 Evaluating visibility for ${newIds.length} newly-saved communities…`);
    for (const id of newIds) {
      try {
        const r = await recomputeCommunityVisibility(id);
        if (r && r.hidden === false) becameVisible += 1;
      } catch (err) {
        console.error(`  visibility eval failed for ${id}:`, (err as Error)?.message ?? err);
      }
    }
  }

  console.log("\n===== GEORGIA DISCOVERY SUMMARY =====");
  console.log(`cities searched:        ${perCity.length}`);
  console.log(`total candidates found: ${totalCandidates}`);
  console.log(`new communities saved:  ${totalNew}`);
  console.log(`dedup (already existed): ${totalDedup}`);
  console.log(`became publicly visible: ${becameVisible} (rest stay hidden per policy until enriched)`);
  console.log("\nper-city (candidates → new):");
  for (const r of perCity) {
    if (r.candidates > 0 || r.saved > 0) {
      console.log(`  ${r.city.padEnd(16)} ${r.candidates} → ${r.saved}`);
    }
  }
  if (dryRun) console.log("\n(DRY-RUN: nothing was persisted.)");

  await pool.end();
  process.exit(0);
}

main().catch(async (err) => {
  console.error("❌ discover-georgia-communities failed:", err);
  try {
    await pool.end();
  } catch {}
  process.exit(1);
});
