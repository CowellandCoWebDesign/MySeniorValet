/**
 * Community discovery runner — any state, or all states.
 *
 * Generalizes the Georgia runner (Task #341) to every state (Task #344). For
 * each target state it iterates that state's metros, runs the existing FREE
 * web-discovery pipeline (DuckDuckGo + Jina Reader, zero API cost) for each, and
 * persists genuinely-new real communities through the existing
 * DiscoveredCommunityService. Every candidate therefore passes the SAME
 * Golden-Data filters, dedup, reachable-website validation, and (after save) the
 * SINGLE community-visibility evaluation any other discovered community goes
 * through — no policy is changed here. Fresh real communities help replace the
 * synthetic fakes queued for removal by queue-synthetic-communities.ts.
 *
 * Metro selection is DATA-DRIVEN: rather than hand-curating a 50-state metro
 * table, each state's metros are the top cities by existing community count
 * (where the fakes and real listings actually are). Override with --cities=.
 *
 * IMPORTANT (isolated-env caveat): this is a DATA operation and does NOT merge
 * back from an isolated task-agent DB — only code merges. The actual discovery
 * pass MUST be executed against the LIVE database (main agent / post-merge step).
 * Running it here only verifies the tooling.
 *
 * Usage:
 *   npx tsx server/scripts/discover-communities.ts --state=TX                  # one state, top metros
 *   npx tsx server/scripts/discover-communities.ts --state=Ohio --dry-run
 *   npx tsx server/scripts/discover-communities.ts --state=TX --cities="Austin,Dallas,Houston"
 *   npx tsx server/scripts/discover-communities.ts --state=TX --cities-per-state=20
 *   npx tsx server/scripts/discover-communities.ts                            # ALL states
 *   npx tsx server/scripts/discover-communities.ts --delay-ms=2000 --max-new=200
 */
import { pool } from "../db";
import { discoverCommunitiesViaWeb } from "../services/free-discovery-service";
import { discoveredCommunityService } from "../services/discovered-community-service";
import { recomputeCommunityVisibility } from "../services/community-visibility";
import { normalizeState, statePredicate, allStateCodes, STATE_NAMES } from "./us-states";

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

/**
 * The state's metros = the top cities by existing community count. This targets
 * discovery where communities (real and fake) actually cluster, without a
 * hand-maintained 50-state metro list.
 */
async function metrosForState(stateCode: string, perState: number): Promise<string[]> {
  const r = await pool.query(
    `SELECT trim(city) AS city, count(*) AS n
       FROM communities
      WHERE ${statePredicate(stateCode)}
        AND city IS NOT NULL AND trim(city) <> ''
      GROUP BY trim(city)
      ORDER BY n DESC
      LIMIT ${perState}`,
  );
  return (r.rows as { city: string }[]).map((x) => x.city);
}

async function discoverState(
  stateCode: string,
  cities: string[],
  opts: { dryRun: boolean; delayMs: number; maxNew: number; startMaxId: number },
): Promise<{ candidates: number; saved: number; dedup: number; visible: number; newIds: number[] }> {
  const fullName = STATE_NAMES[stateCode] ?? stateCode;
  let candidates = 0;
  let saved = 0;
  let dedup = 0;
  const newIds: number[] = [];

  for (const city of cities) {
    if (saved >= opts.maxNew) {
      console.log(`  ⛔ Reached per-state max-new cap (${opts.maxNew}) for ${stateCode}; stopping early.`);
      break;
    }
    try {
      const found = await discoverCommunitiesViaWeb(
        `${city} ${fullName} senior living assisted living`,
        city,
        stateCode,
      );
      candidates += found.length;

      let savedThisCity = 0;
      if (!opts.dryRun) {
        for (const c of found) {
          if (saved >= opts.maxNew) break;
          const id = await discoveredCommunityService.saveDiscoveredCommunity({
            name: c.name,
            address: c.address,
            city: c.city || city,
            // Normalize to the canonical 2-letter code so dedup + location
            // matching stay consistent with the rest of the state's data.
            state: stateCode,
            country: c.country || "US",
            website: c.website,
            phone: c.phone,
            careTypes: c.careTypes,
            description: c.description,
            discoverySource: "state_free_web",
          });
          if (id > opts.startMaxId) {
            newIds.push(id);
            saved += 1;
            savedThisCity += 1;
          } else if (id > 0) {
            dedup += 1;
          }
        }
      }
      console.log(`  ${city.padEnd(18)} candidates=${found.length}  new=${savedThisCity}`);
    } catch (err) {
      console.error(`  ⚠️  ${city} (${stateCode}): discovery failed —`, (err as Error)?.message ?? err);
    }
    if (opts.delayMs > 0) await sleep(opts.delayMs);
  }

  // Apply the SAME visibility evaluation every discovered community gets.
  let visible = 0;
  if (!opts.dryRun && newIds.length > 0) {
    for (const id of newIds) {
      try {
        const res = await recomputeCommunityVisibility(id);
        if (res && res.hidden === false) visible += 1;
      } catch (err) {
        console.error(`  visibility eval failed for ${id}:`, (err as Error)?.message ?? err);
      }
    }
  }

  return { candidates, saved, dedup, visible, newIds };
}

async function main() {
  const dryRun = arg("dry-run") !== undefined;
  const delayMs = num("delay-ms") ?? 1500;
  const maxNew = num("max-new") ?? 500;
  const citiesPerState = num("cities-per-state") ?? 20;

  const stateArg = arg("state");
  let stateCodes: string[];
  if (stateArg) {
    const code = normalizeState(stateArg);
    if (!code) {
      console.error(`❌ Unknown --state="${stateArg}". Use a 2-letter code (TX) or full name (Texas).`);
      await pool.end();
      process.exit(1);
    }
    stateCodes = [code];
  } else {
    stateCodes = allStateCodes();
  }

  const citiesOverride = arg("cities")
    ? arg("cities")!.split(",").map((c) => c.trim()).filter(Boolean)
    : undefined;
  if (citiesOverride && stateCodes.length !== 1) {
    console.error("❌ --cities= can only be used with a single --state=.");
    await pool.end();
    process.exit(1);
  }

  console.log("🗺️  Community discovery runner (Task #344)");
  console.log(
    `mode: ${dryRun ? "DRY-RUN (no writes)" : "PERSIST"}  states=${stateCodes.length}  ` +
      `citiesPerState=${citiesOverride ? citiesOverride.length : citiesPerState}  ` +
      `delayMs=${delayMs}  maxNew=${maxNew}/state`,
  );

  // Snapshot max id so freshly-INSERTED rows (id > startMaxId) are distinguished
  // from dedup hits (existing lower ids returned by save).
  const maxRes = await pool.query(`SELECT COALESCE(MAX(id), 0)::int AS m FROM communities`);
  const startMaxId: number = maxRes.rows[0].m;

  let grandCandidates = 0;
  let grandNew = 0;
  let grandDedup = 0;
  let grandVisible = 0;
  const perState: { state: string; cities: number; candidates: number; saved: number; visible: number }[] = [];

  for (const stateCode of stateCodes) {
    const cities = citiesOverride ?? (await metrosForState(stateCode, citiesPerState));
    if (cities.length === 0) {
      console.log(`\n${stateCode}: no metros found in DB — skipping.`);
      continue;
    }
    console.log(`\n=== ${stateCode} (${STATE_NAMES[stateCode] ?? stateCode}) — ${cities.length} metros ===`);
    const res = await discoverState(stateCode, cities, { dryRun, delayMs, maxNew, startMaxId });
    grandCandidates += res.candidates;
    grandNew += res.saved;
    grandDedup += res.dedup;
    grandVisible += res.visible;
    perState.push({ state: stateCode, cities: cities.length, candidates: res.candidates, saved: res.saved, visible: res.visible });
  }

  console.log("\n===== DISCOVERY SUMMARY =====");
  console.log(`states searched:        ${perState.length}`);
  console.log(`total candidates found: ${grandCandidates}`);
  console.log(`new communities saved:  ${grandNew}`);
  console.log(`dedup (already existed): ${grandDedup}`);
  console.log(`became publicly visible: ${grandVisible} (rest stay hidden per policy until enriched)`);
  console.log("\nper-state (candidates → new → visible):");
  for (const r of perState) {
    if (r.candidates > 0 || r.saved > 0) {
      console.log(`  ${r.state.padEnd(6)} ${r.candidates} → ${r.saved} → ${r.visible}`);
    }
  }
  if (dryRun) console.log("\n(DRY-RUN: nothing was persisted.)");

  await pool.end();
  process.exit(0);
}

main().catch(async (err) => {
  console.error("❌ discover-communities failed:", err);
  try {
    await pool.end();
  } catch {}
  process.exit(1);
});
