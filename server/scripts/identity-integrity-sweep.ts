/**
 * Identity integrity sweep (Task #438) — REPORT-ONLY sweeps + single-record
 * flagging. Never bulk-changes data; never renames a community.
 *
 * Usage:
 *   npx tsx server/scripts/identity-integrity-sweep.ts --sweep=website [--limit=N]
 *       Report PUBLIC communities whose stored website domain does not
 *       corroborate their name (identity tokenizer that keeps suffix words) —
 *       likely contaminated by a sibling facility's site. No changes.
 *
 *   npx tsx server/scripts/identity-integrity-sweep.ts --sweep=zipcity
 *       Report PUBLIC records whose ZIP disagrees with the majority city for
 *       that ZIP in our own data (≥3 records, ≥80% dominant) — internal
 *       inconsistency like community 5526 (city Aiea, ZIP 96707 = Kapolei).
 *       No changes.
 *
 *   npx tsx server/scripts/identity-integrity-sweep.ts --flag=<id> [--reason="..."]
 *       Flag ONE community identity_suspect with evidence built from its row
 *       (mismatched website domain / supplied reason). Idempotent. Evidence is
 *       stored in enrichment_data.identitySuspect; the name is never changed.
 */
import { db } from "../db";
import { sql } from "drizzle-orm";
import { identityNameTokens, hostEmbedsCommunityName } from "../services/community-identity";

function parseArgs() {
  const args: Record<string, string> = {};
  for (const a of process.argv.slice(2)) {
    const m = a.match(/^--([a-z]+)(?:=(.*))?$/i);
    if (m) args[m[1]] = m[2] ?? "true";
  }
  return args;
}

function hostOf(url: string): string {
  try {
    return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname
      .replace(/^www\./, "")
      .toLowerCase();
  } catch {
    return "";
  }
}

// Directory / aggregator / generic hosts a community may legitimately point at
// even though the domain doesn't embed its name — skip these in the report.
const GENERIC_HOST_PATTERNS = [
  "facebook.com", "google.com", "caring.com", "aplaceformom.com", "seniorly.com",
  "seniorlivingnearme.com", "seniorhousingnet.com", "apartments.com", "yelp.com",
  "hud.gov", ".gov", "medicare", "brookdale", "sunriseseniorliving", "holidayseniorliving",
  "atriaseniorliving", "lifecarecenters", "goodsamaritan",
];

async function sweepWebsite(limit: number) {
  const res: any = await db.execute(sql`
    SELECT id, name, city, state, website
    FROM communities
    WHERE is_hidden = false AND is_active = true
      AND website IS NOT NULL AND trim(website) <> ''
    ORDER BY id
  `);
  const rows = res.rows ?? res;
  const suspects: any[] = [];
  for (const r of rows) {
    const host = hostOf(r.website);
    if (!host) continue;
    if (GENERIC_HOST_PATTERNS.some((p) => host.includes(p))) continue;
    const tokens = identityNameTokens(r.name || "");
    if (tokens.length === 0) continue; // fully generic name — can't judge
    const hostAlpha = host.replace(/[^a-z]/g, "");
    const nameHit = hostEmbedsCommunityName(r.website, r.name || "");
    const cityAlpha = (r.city || "").toLowerCase().replace(/[^a-z]/g, "");
    const cityHit = cityAlpha.length >= 4 && hostAlpha.includes(cityAlpha);
    if (!nameHit && !cityHit) {
      suspects.push({ id: r.id, name: r.name, city: r.city, state: r.state, website: r.website, host });
    }
  }
  console.log(`\n=== Website-domain identity mismatch report (REVIEW ONLY — no changes) ===`);
  console.log(`Scanned ${rows.length} public records with a website; ${suspects.length} suspect(s).`);
  for (const s of suspects.slice(0, limit)) {
    console.log(`  #${s.id}  ${s.name} (${s.city}, ${s.state}) → ${s.host}`);
  }
  if (suspects.length > limit) console.log(`  … and ${suspects.length - limit} more (raise --limit)`);
}

async function sweepZipCity() {
  const res: any = await db.execute(sql`
    WITH zip_cities AS (
      SELECT zip_code, lower(trim(city)) AS city_norm, COUNT(*) AS n
      FROM communities
      WHERE zip_code IS NOT NULL AND trim(zip_code) <> '' AND city IS NOT NULL
      GROUP BY zip_code, lower(trim(city))
    ),
    zip_majority AS (
      SELECT DISTINCT ON (zip_code)
             zip_code,
             city_norm AS majority_city,
             n AS majority_n,
             SUM(n) OVER (PARTITION BY zip_code) AS total_n
      FROM zip_cities
      ORDER BY zip_code, n DESC
    )
    SELECT c.id, c.name, c.city, c.state, c.zip_code, c.data_source,
           z.majority_city, z.total_n AS n
    FROM communities c
    JOIN zip_majority z ON z.zip_code = c.zip_code
    WHERE c.is_hidden = false AND c.is_active = true
      AND z.total_n >= 3
      AND lower(trim(c.city)) <> z.majority_city
      AND z.majority_n::float / z.total_n >= 0.8
    ORDER BY c.id
  `);
  const rows = res.rows ?? res;
  console.log(`\n=== ZIP↔city inconsistency report (REVIEW ONLY — no changes) ===`);
  console.log(`${rows.length} public record(s) disagree with the dominant city for their ZIP.`);
  for (const r of rows.slice(0, 200)) {
    console.log(
      `  #${r.id}  ${r.name} — city "${r.city}" but ZIP ${r.zip_code} is ~${r.majority_city} ` +
        `(${r.n} records; source=${r.data_source})`,
    );
  }
  if (rows.length > 200) console.log(`  … and ${rows.length - 200} more`);
}

async function flagOne(id: number, reason?: string) {
  const res: any = await db.execute(sql`
    SELECT id, name, city, state, zip_code, website, phone, data_source,
           data_quality_flags, enrichment_data
    FROM communities WHERE id = ${id}
  `);
  const row = (res.rows ?? res)[0];
  if (!row) {
    console.error(`Community ${id} not found`);
    process.exit(1);
  }
  const reasons: string[] = [];
  if (reason) reasons.push(reason);
  const host = hostOf(row.website || "");
  if (row.website && host && !hostEmbedsCommunityName(row.website, row.name || "")) {
    reasons.push(`stored website domain "${host}" does not corroborate name "${row.name}"`);
  }
  if (reasons.length === 0) reasons.push("flagged for identity review");

  const flags: string[] = Array.isArray(row.data_quality_flags) ? row.data_quality_flags : [];
  const newFlags = flags.includes("identity_suspect") ? flags : [...flags, "identity_suspect"];
  const prior = row.enrichment_data || {};
  const evidence = {
    detectedAt: prior?.identitySuspect?.detectedAt ?? new Date().toISOString(),
    candidateIdentity: row.website || prior?.identitySuspect?.candidateIdentity || null,
    reasons: Array.from(new Set([...(prior?.identitySuspect?.reasons ?? []), ...reasons])),
    sources: Array.from(
      new Set([...(prior?.identitySuspect?.sources ?? []), row.website].filter(Boolean)),
    ),
  };
  const merged = { ...prior, identitySuspect: evidence };
  await db.execute(sql`
    UPDATE communities
    SET data_quality_flags = (
          SELECT COALESCE(array_agg(x), ARRAY[]::text[])
          FROM jsonb_array_elements_text(${JSON.stringify(newFlags)}::jsonb) AS x
        ),
        enrichment_data = ${JSON.stringify(merged)}::jsonb
    WHERE id = ${id}
  `);
  console.log(`🚩 Flagged #${id} "${row.name}" identity_suspect. Evidence:`);
  console.log(JSON.stringify(evidence, null, 2));
}

async function main() {
  const args = parseArgs();
  if (args.sweep === "website") await sweepWebsite(parseInt(args.limit || "100", 10));
  else if (args.sweep === "zipcity") await sweepZipCity();
  else if (args.flag) await flagOne(parseInt(args.flag, 10), args.reason);
  else {
    console.log("Usage: --sweep=website [--limit=N] | --sweep=zipcity | --flag=<id> [--reason=...]");
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
