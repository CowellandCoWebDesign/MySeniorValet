/**
 * Community Geocoding Repair & Synthetic-Data Cleanup
 * --------------------------------------------------------------
 * Addresses widespread coordinate corruption in the communities table.
 *
 * Detection: per-(city,state) robust median centroid (cities with >= 4 listings).
 * A community is "mislocated" when it sits > 40km from its city centroid.
 *
 * Actions (respecting the Golden Data Rule — no fabricated data):
 *   1. DELETE high-confidence synthetic records (mislocated AND fabricated
 *      generic-vocabulary street address). Backed up to JSON first.
 *   2. AUTO-FIX real mislocated records by re-geocoding the street address via
 *      the free OpenStreetMap/Nominatim service. Coordinates are written ONLY
 *      when the geocoder returns a street-level match that verifiably lands in
 *      the correct city/state. Otherwise the record is left flagged.
 *   3. FLAG everything mislocated that could not be confidently fixed with
 *      data_quality_flags = 'geo_needs_review' for human QC review.
 *
 * Flags written: 'geo_corrected', 'geo_needs_review'.
 *
 * Usage:
 *   tsx server/scripts/fix-community-geocoding.ts --dry-run
 *   tsx server/scripts/fix-community-geocoding.ts --phase=delete
 *   tsx server/scripts/fix-community-geocoding.ts --phase=flag
 *   tsx server/scripts/fix-community-geocoding.ts --phase=geocode [--geo-limit=N]
 *   tsx server/scripts/fix-community-geocoding.ts --phase=all   (default)
 */

import { pool } from '../db';
import fs from 'fs';
import path from 'path';

// ---------- args ----------
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const phaseArg = args.find(a => a.startsWith('--phase='))?.split('=')[1] || 'all';
const geoLimitArg = args.find(a => a.startsWith('--geo-limit='))?.split('=')[1];
const GEO_LIMIT = geoLimitArg ? parseInt(geoLimitArg, 10) : Infinity;
const timeBudgetArg = args.find(a => a.startsWith('--time-budget='))?.split('=')[1];
const TIME_BUDGET_MS = timeBudgetArg ? parseInt(timeBudgetArg, 10) * 1000 : Infinity;
const runDelete = phaseArg === 'all' || phaseArg === 'delete';
const runFlag = phaseArg === 'all' || phaseArg === 'flag';
const runGeocode = phaseArg === 'all' || phaseArg === 'geocode';

const MISLOCATE_KM = 40;       // distance from city centroid to be "mislocated"
const FIX_ACCEPT_KM = 30;      // geocode result must land within this of centroid
const MIN_CITY_N = 4;          // city must have this many listings for a reliable centroid
const NOMINATIM_DELAY_MS = 1100;

const CA_PROVINCES = new Set(['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT']);

// Fabricated generic-street vocabulary (validated against the data). A record is
// considered synthetic ONLY in combination with being geographically mislocated.
const SYNTH_STREET = /^(Main|Church|Park|Queen|King|Pine|Oak|Maple|Second|First|Third|Victoria|Lake|Wellington|River)\s+(St|Ave|Rd|Dr)$/i;
const MALFORMED_STREET = /(Street|Avenue|Boulevard)\s+(St|Rd|Ave|Pkwy|Dr|Blvd)$/i;

interface Row {
  id: number; name: string; address: string | null;
  city: string; state: string; zip_code: string | null;
  website: string | null; lat: number; lng: number;
  data_quality_flags: string[] | null;
}

function streetOf(address: string | null): string {
  if (!address) return '';
  return address.trim().replace(/^\d+[a-zA-Z]?\s+/, '').trim();
}
function isSyntheticStreet(address: string | null): boolean {
  const s = streetOf(address);
  return SYNTH_STREET.test(s) || MALFORMED_STREET.test(s);
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

// ---------- Nominatim with street-level verification ----------
interface GeoResult { lat: number; lng: number; addresstype: string; }
async function geocodePrecise(query: string): Promise<GeoResult | null> {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.append('q', query);
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
    return { lat: parseFloat(r.lat), lng: parseFloat(r.lon), addresstype: r.addresstype || r.type || '' };
  } catch {
    return null;
  }
}
// addresstypes that indicate a coarse city/region fallback (NOT a usable fix)
const COARSE = new Set(['city','town','village','hamlet','municipality','administrative','county','state','postcode','region','province','suburb','city_district']);

async function main() {
  console.log(`\n=== Community Geocoding Repair ===`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'} | phase=${phaseArg} | geo-limit=${GEO_LIMIT}\n`);

  // 1. Load all communities with coordinates
  const { rows } = await pool.query<Row>(`
    SELECT id, name, address, city, state, zip_code, website,
           latitude::float8 AS lat, longitude::float8 AS lng,
           data_quality_flags
    FROM communities
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      AND (is_hidden IS NULL OR is_hidden = false)
  `);
  console.log(`Loaded ${rows.length} communities with coordinates.`);

  // 2. Per-(city,state) median centroid
  const groups = new Map<string, Row[]>();
  for (const r of rows) {
    const key = `${(r.city || '').toLowerCase().trim()}|${r.state}`;
    (groups.get(key) || groups.set(key, []).get(key)!).push(r);
  }
  const centroid = new Map<string, { mlat: number; mlng: number; n: number }>();
  for (const [key, list] of groups) {
    centroid.set(key, {
      mlat: median(list.map(r => r.lat)),
      mlng: median(list.map(r => r.lng)),
      n: list.length,
    });
  }

  // 3. Detect mislocated + classify
  const toDelete: Row[] = [];
  const toFix: Array<Row & { mlat: number; mlng: number }> = [];
  for (const r of rows) {
    const key = `${(r.city || '').toLowerCase().trim()}|${r.state}`;
    const c = centroid.get(key)!;
    if (c.n < MIN_CITY_N) continue;
    const d = distKm(r.lat, r.lng, c.mlat, c.mlng);
    if (d <= MISLOCATE_KM) continue;
    if (isSyntheticStreet(r.address)) toDelete.push(r);
    else if (runGeocode && (r.data_quality_flags || []).includes('geo_unresolved')) continue; // already attempted, skip during geocode resume
    else toFix.push({ ...r, mlat: c.mlat, mlng: c.mlng });
  }
  console.log(`Mislocated (> ${MISLOCATE_KM}km, cities with >= ${MIN_CITY_N}): ${toDelete.length + toFix.length}`);
  console.log(`  -> synthetic to DELETE: ${toDelete.length}`);
  console.log(`  -> real to FIX/FLAG:    ${toFix.length}\n`);

  if (DRY_RUN) {
    console.log('Sample delete set:');
    toDelete.slice(0, 8).forEach(r => console.log(`  [${r.id}] ${r.name} | ${r.address} | ${r.city}, ${r.state}`));
    console.log('\nSample fix set:');
    toFix.slice(0, 8).forEach(r => console.log(`  [${r.id}] ${r.name} | ${r.address} | ${r.city}, ${r.state}`));
    await pool.end();
    return;
  }

  // ---------- PHASE: DELETE synthetic ----------
  if (runDelete && toDelete.length > 0) {
    const backupDir = path.join(process.cwd(), '.local', 'backups');
    fs.mkdirSync(backupDir, { recursive: true });
    const backupPath = path.join(backupDir, `deleted-synthetic-communities-${Date.now()}.json`);
    // Capture full rows for an audit/recovery trail
    const ids = toDelete.map(r => r.id);
    const full = await pool.query(`SELECT * FROM communities WHERE id = ANY($1::int[])`, [ids]);
    fs.writeFileSync(backupPath, JSON.stringify(full.rows, null, 2));
    console.log(`Backed up ${full.rows.length} synthetic records -> ${backupPath}`);

    // Discover FK children of communities so deletes don't violate constraints
    const fks = await pool.query<{ child_table: string; fk_col: string }>(`
      SELECT tc.table_name AS child_table, kcu.column_name AS fk_col
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'communities'
    `);
    let childDeleted = 0;
    for (const fk of fks.rows) {
      const res = await pool.query(
        `DELETE FROM "${fk.child_table}" WHERE "${fk.fk_col}" = ANY($1::int[])`, [ids]
      );
      if (res.rowCount) { childDeleted += res.rowCount; console.log(`  cleared ${res.rowCount} rows from ${fk.child_table}`); }
    }
    const del = await pool.query(`DELETE FROM communities WHERE id = ANY($1::int[])`, [ids]);
    console.log(`Deleted ${del.rowCount} synthetic communities (+${childDeleted} dependent rows).\n`);
  }

  // ---------- PHASE: FLAG mislocated real records for QC ----------
  if (runFlag && toFix.length > 0) {
    const ids = toFix.map(r => r.id);
    await pool.query(`
      UPDATE communities SET data_quality_flags = (
        SELECT array_agg(DISTINCT f) FROM unnest(array_append(COALESCE(data_quality_flags, '{}'::text[]), 'geo_needs_review')) f
      ) WHERE id = ANY($1::int[])
    `, [ids]);
    console.log(`Flagged ${ids.length} mislocated records with 'geo_needs_review'.\n`);
  }

  // ---------- PHASE: GEOCODE & fix real records ----------
  if (runGeocode && toFix.length > 0) {
    const targets = toFix.slice(0, GEO_LIMIT === Infinity ? toFix.length : GEO_LIMIT);
    const budgetNote = TIME_BUDGET_MS === Infinity ? '' : ` (time budget ${TIME_BUDGET_MS / 1000}s)`;
    console.log(`Geocoding up to ${targets.length} records via Nominatim${budgetNote}...`);
    const startMs = Date.now();
    let fixed = 0, failed = 0, i = 0;
    for (const r of targets) {
      if (Date.now() - startMs > TIME_BUDGET_MS) { console.log(`  time budget reached after ${i} records.`); break; }
      i++;
      const country = CA_PROVINCES.has(r.state) ? 'Canada' : 'USA';
      const g = await geocodePrecise(`${r.address}, ${r.city}, ${r.state}, ${country}`);
      await sleep(NOMINATIM_DELAY_MS);

      let accept = false;
      if (g && !COARSE.has(g.addresstype)) {
        if (distKm(g.lat, g.lng, r.mlat, r.mlng) <= FIX_ACCEPT_KM) accept = true;
      }

      if (accept && g) {
        await pool.query(`
          UPDATE communities SET
            latitude = $1::numeric, longitude = $2::numeric,
            location = ST_SetSRID(ST_MakePoint($2::float8, $1::float8), 4326)::geography,
            is_hidden = CASE WHEN 'synthetic_suspected' = ANY(COALESCE(data_quality_flags, '{}'::text[])) THEN false ELSE is_hidden END,
            data_quality_flags = (
              SELECT array_agg(DISTINCT f) FROM unnest(
                array_remove(array_remove(array_remove(COALESCE(data_quality_flags, '{}'::text[]), 'geo_needs_review'), 'geo_unresolved'), 'synthetic_suspected') || ARRAY['geo_corrected']
              ) f
            )
          WHERE id = $3
        `, [g.lat, g.lng, r.id]);
        fixed++;
        if (fixed % 10 === 0) console.log(`  [${i}/${targets.length}] fixed ${r.name} (${r.city}, ${r.state}) -> ${g.lat.toFixed(4)},${g.lng.toFixed(4)}`);
      } else {
        // Mark as attempted-but-unresolved so resumed runs skip it (no fabricated coords).
        await pool.query(`
          UPDATE communities SET data_quality_flags = (
            SELECT array_agg(DISTINCT f) FROM unnest(COALESCE(data_quality_flags, '{}'::text[]) || ARRAY['geo_needs_review','geo_unresolved']) f
          ) WHERE id = $1
        `, [r.id]);
        failed++;
      }
    }
    console.log(`\nGeocoding run done: ${fixed} fixed, ${failed} unresolved this run.\n`);
  }

  await pool.end();
  console.log('Done.');
}

main().catch(async (e) => { console.error(e); try { await pool.end(); } catch {} process.exit(1); });
