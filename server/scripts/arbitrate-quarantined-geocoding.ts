/**
 * Quarantined-Community Geocode Arbitration
 * --------------------------------------------------------------
 * Runs the geocode arbitration pass over HIDDEN senior-classified communities
 * carrying the protective 'geo_needs_review' flag (suspect coordinates).
 * Per the quarantine policy the geocoder — not a heuristic — decides real vs
 * fake (Golden Data Rule: no fabricated coordinates, ever).
 *
 *   - Real address  -> Nominatim resolves a street-level match that verifiably
 *     lands in the right city/state (centroid distance OR addressdetails
 *     city+state match). Coords are written, protective flags
 *     (geo_needs_review / geo_unresolved / synthetic_suspected) are cleared,
 *     'geo_corrected' added, and recomputeCommunityVisibility() arbitrates the
 *     auto-restore.
 *   - Unresolvable  -> row stays quarantined, 'geo_unresolved' recorded.
 *
 * Resumable: attempted ids are checkpointed to .local/geo-arbitration-attempted.json
 * so interrupted runs skip already-attempted rows. Fresh rows (never attempted,
 * no geo_unresolved) are processed before retries of previously-unresolved rows.
 *
 * Usage:
 *   tsx server/scripts/arbitrate-quarantined-geocoding.ts [--dry-run] [--limit=N] [--time-budget=SECONDS]
 */

import fs from 'fs';
import path from 'path';
import { pool } from '../db';
import { recomputeCommunityVisibility } from '../services/community-visibility';

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='))?.split('=')[1];
const LIMIT = limitArg ? parseInt(limitArg, 10) : Infinity;
const timeBudgetArg = args.find(a => a.startsWith('--time-budget='))?.split('=')[1];
const TIME_BUDGET_MS = timeBudgetArg ? parseInt(timeBudgetArg, 10) * 1000 : Infinity;

const FIX_ACCEPT_KM = 30;
const NOMINATIM_DELAY_MS = 1100;
const CHECKPOINT = path.join(process.cwd(), '.local', 'geo-arbitration-attempted.json');

const CA_PROVINCES = new Set(['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT']);
// addresstypes that indicate a coarse city/region fallback (NOT a usable street-level fix)
const COARSE = new Set(['city','town','village','hamlet','municipality','administrative','county','state','postcode','region','province','suburb','city_district']);

const US_STATE_NAMES: Record<string, string> = {
  AL:'alabama',AK:'alaska',AZ:'arizona',AR:'arkansas',CA:'california',CO:'colorado',CT:'connecticut',DE:'delaware',FL:'florida',GA:'georgia',HI:'hawaii',ID:'idaho',IL:'illinois',IN:'indiana',IA:'iowa',KS:'kansas',KY:'kentucky',LA:'louisiana',ME:'maine',MD:'maryland',MA:'massachusetts',MI:'michigan',MN:'minnesota',MS:'mississippi',MO:'missouri',MT:'montana',NE:'nebraska',NV:'nevada',NH:'new hampshire',NJ:'new jersey',NM:'new mexico',NY:'new york',NC:'north carolina',ND:'north dakota',OH:'ohio',OK:'oklahoma',OR:'oregon',PA:'pennsylvania',RI:'rhode island',SC:'south carolina',SD:'south dakota',TN:'tennessee',TX:'texas',UT:'utah',VT:'vermont',VA:'virginia',WA:'washington',WV:'west virginia',WI:'wisconsin',WY:'wyoming',DC:'district of columbia',
  AB:'alberta',BC:'british columbia',MB:'manitoba',NB:'new brunswick',NL:'newfoundland and labrador',NS:'nova scotia',NT:'northwest territories',NU:'nunavut',ON:'ontario',PE:'prince edward island',QC:'quebec',SK:'saskatchewan',YT:'yukon',
};

interface Row {
  id: number; name: string; address: string; city: string; state: string;
  zip_code: string | null; flags: string[];
}
interface GeoResult {
  lat: number; lng: number; addresstype: string;
  city: string; state: string;
}

function distKm(lat: number, lng: number, mlat: number, mlng: number): number {
  return 111.045 * Math.sqrt(
    Math.pow(lat - mlat, 2) + Math.pow((lng - mlng) * Math.cos(lat * Math.PI / 180), 2)
  );
}
function median(nums: number[]): number {
  const a = [...nums].sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const norm = (s: string | null | undefined) => (s || '').toLowerCase().trim();

async function nominatim(params: Record<string, string>): Promise<GeoResult | null> {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    for (const [k, v] of Object.entries(params)) url.searchParams.append(k, v);
    url.searchParams.append('format', 'json');
    url.searchParams.append('addressdetails', '1');
    url.searchParams.append('limit', '1');
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'MySeniorValet/1.0 (https://myseniorvalet.com)', 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    const data: any[] = await res.json();
    if (!data || data.length === 0) return null;
    const r = data[0];
    const ad = r.address || {};
    return {
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      addresstype: r.addresstype || r.type || '',
      city: norm(ad.city || ad.town || ad.village || ad.hamlet || ad.municipality),
      state: norm(ad.state),
    };
  } catch {
    return null;
  }
}

function loadAttempted(): Set<number> {
  try {
    return new Set(JSON.parse(fs.readFileSync(CHECKPOINT, 'utf8')) as number[]);
  } catch {
    return new Set();
  }
}
function saveAttempted(ids: Set<number>) {
  fs.mkdirSync(path.dirname(CHECKPOINT), { recursive: true });
  fs.writeFileSync(CHECKPOINT, JSON.stringify([...ids]));
}

/** Result verifiably lands in the right place? Centroid distance OR city+state match. */
function verify(g: GeoResult, r: Row, c: { mlat: number; mlng: number } | undefined): boolean {
  if (COARSE.has(g.addresstype)) return false;
  if (c && distKm(g.lat, g.lng, c.mlat, c.mlng) <= FIX_ACCEPT_KM) return true;
  const stateName = US_STATE_NAMES[r.state.toUpperCase()] || norm(r.state);
  const stateOk = g.state === stateName || g.state === norm(r.state);
  const cityOk = g.city !== '' && g.city === norm(r.city);
  return stateOk && cityOk;
}

async function main() {
  console.log(`\n=== Quarantined-Community Geocode Arbitration ===`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'} | limit=${LIMIT} | time-budget=${TIME_BUDGET_MS === Infinity ? 'none' : TIME_BUDGET_MS / 1000 + 's'}\n`);

  // Cohort: hidden senior rows under protective geo quarantine with a street address.
  const { rows } = await pool.query<Row>(`
    SELECT id, name, address, city, state, zip_code,
           COALESCE(data_quality_flags, '{}'::text[]) AS flags
    FROM communities
    WHERE is_hidden = true
      AND senior_classification = 'senior'
      AND 'geo_needs_review' = ANY(data_quality_flags)
      AND address IS NOT NULL AND address <> ''
      AND city IS NOT NULL AND city <> ''
    ORDER BY id
  `);
  console.log(`Cohort: ${rows.length} hidden senior communities flagged geo_needs_review.`);

  // Trusted per-(city,state) centroids from VISIBLE communities only.
  const cent = await pool.query<{ key: string; mlat: number; mlng: number; n: number }>(`
    SELECT lower(trim(city)) || '|' || state AS key,
           percentile_cont(0.5) WITHIN GROUP (ORDER BY latitude::float8) AS mlat,
           percentile_cont(0.5) WITHIN GROUP (ORDER BY longitude::float8) AS mlng,
           count(*)::int AS n
    FROM communities
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      AND (is_hidden IS NULL OR is_hidden = false)
    GROUP BY 1 HAVING count(*) >= 4
  `);
  const centroid = new Map(cent.rows.map(c => [c.key, { mlat: Number(c.mlat), mlng: Number(c.mlng) }]));

  const attempted = loadAttempted();
  const pending = rows.filter(r => !attempted.has(r.id));
  // Fresh rows first, previously-unresolved retries last.
  pending.sort((a, b) => {
    const au = a.flags.includes('geo_unresolved') ? 1 : 0;
    const bu = b.flags.includes('geo_unresolved') ? 1 : 0;
    return au - bu || a.id - b.id;
  });
  const targets = pending.slice(0, LIMIT === Infinity ? pending.length : LIMIT);
  console.log(`Already attempted this pass: ${attempted.size}. Processing ${targets.length} now.\n`);

  if (DRY_RUN) {
    targets.slice(0, 10).forEach(r => console.log(`  [${r.id}] ${r.name} | ${r.address}, ${r.city}, ${r.state} | flags=${r.flags.join(',')}`));
    await pool.end();
    return;
  }

  const startMs = Date.now();
  let restored = 0, fixedStillHidden = 0, unresolved = 0, i = 0;
  for (const r of targets) {
    if (Date.now() - startMs > TIME_BUDGET_MS) {
      console.log(`  time budget reached after ${i} records.`);
      break;
    }
    i++;
    const country = CA_PROVINCES.has(r.state.toUpperCase()) ? 'Canada' : 'USA';
    const c = centroid.get(`${norm(r.city)}|${r.state}`);

    // Free-form query first, structured fallback second.
    let g = await nominatim({ q: `${r.address}, ${r.city}, ${r.state}, ${country}` });
    let ok = g ? verify(g, r, c) : false;
    if (!ok) {
      await sleep(NOMINATIM_DELAY_MS);
      g = await nominatim({
        street: r.address, city: r.city, state: r.state, country,
        ...(r.zip_code && r.zip_code.trim() ? { postalcode: r.zip_code.trim() } : {}),
      });
      ok = g ? verify(g, r, c) : false;
    }
    await sleep(NOMINATIM_DELAY_MS);

    if (ok && g) {
      // Write verified coords + clear protective flags, then let the single
      // visibility writer arbitrate the restore.
      await pool.query(`
        UPDATE communities SET
          latitude = $1::numeric, longitude = $2::numeric,
          location = ST_SetSRID(ST_MakePoint($2::float8, $1::float8), 4326)::geography,
          data_quality_flags = (
            SELECT COALESCE(array_agg(DISTINCT f), '{}'::text[]) FROM unnest(
              array_remove(array_remove(array_remove(array_remove(
                COALESCE(data_quality_flags, '{}'::text[]),
                'geo_needs_review'), 'geo_unresolved'), 'synthetic_suspected'), 'not_geocoded')
              || ARRAY['geo_corrected']
            ) f
          )
        WHERE id = $3
      `, [g.lat, g.lng, r.id]);
      const vis = await recomputeCommunityVisibility(r.id);
      if (vis && !vis.hidden) restored++;
      else fixedStillHidden++;
      if ((restored + fixedStillHidden) % 25 === 0) {
        console.log(`  [${i}/${targets.length}] verified ${r.name} (${r.city}, ${r.state}) -> ${g.lat.toFixed(4)},${g.lng.toFixed(4)} | restored=${restored} fixedHidden=${fixedStillHidden} unresolved=${unresolved}`);
      }
    } else {
      // Could not verify — stays quarantined (no fabricated coordinates).
      await pool.query(`
        UPDATE communities SET data_quality_flags = (
          SELECT array_agg(DISTINCT f) FROM unnest(
            COALESCE(data_quality_flags, '{}'::text[]) || ARRAY['geo_needs_review','geo_unresolved']
          ) f
        ) WHERE id = $1
      `, [r.id]);
      unresolved++;
    }

    attempted.add(r.id);
    if (i % 20 === 0) saveAttempted(attempted);
  }
  saveAttempted(attempted);

  console.log(`\nArbitration run done: ${restored} restored to public, ${fixedStillHidden} coords fixed but still hidden (quality), ${unresolved} unresolved (stay quarantined).`);
  await pool.end();
  console.log('Done.');
}

main().catch(async (e) => { console.error(e); try { await pool.end(); } catch {} process.exit(1); });
