/**
 * Task #440 — Adjudicated review pass over the Task #438 website-identity
 * mismatch report (603 PUBLIC communities whose stored website domain does not
 * corroborate their name/city).
 *
 * This is NOT blind bulk clearing: every host in the report was manually
 * reviewed and classified into one of four buckets, plus per-record overrides
 * for the tricky sibling-contamination / garbled-record cases:
 *
 *  1. KEEP  — legit management-company / parent-operator / non-profit / gov
 *     domains (the sweep is a heuristic; "eldercarealliance.org" for AlmaVia is
 *     correct). No change.
 *  2. DIRECTORY — aggregator/directory/media hosts (caring-style directories,
 *     Wikipedia, realtor.com, ZoomInfo…). The URL is definitively NOT the
 *     community's own site, but the record itself looks real → clear website
 *     only (phone/pricing may have independent provenance).
 *  3. SYNTHETIC — the machine-generated "{county}-senior-living.com" /
 *     "{town}-senior-care.com" templated cluster → handled via the existing
 *     removal-request flow (pending removal_requests row + protective
 *     synthetic_suspected flag + quarantine is_hidden=true). NEVER deleted.
 *  4. Per-record FLAG — record is contaminated with a SIBLING facility's
 *     identity or the record itself is garbled (SEO-title names, wrong
 *     state/city) → clear website/phone/pricing (unprotected fields only) and
 *     flag identity_suspect with evidence (same shape as
 *     identity-integrity-sweep --flag).
 *
 * Unknown hosts are conservatively KEPT and listed in the report for manual
 * follow-up. Idempotent: cleared/hidden rows drop out of the sweep's public
 * scan, flags/requests are de-duped, so re-runs converge to a no-op.
 *
 * IMPORTANT (isolated-env caveat): DATA op — does not merge back from a task
 * DB; must also be run once against the LIVE database.
 *
 * Usage:
 *   npx tsx server/scripts/review-website-mismatches-440.ts --dry-run
 *   npx tsx server/scripts/review-website-mismatches-440.ts            # apply
 */
import { pool } from "../db";
import { identityNameTokens, hostEmbedsCommunityName } from "../services/community-identity";

const DRY = process.argv.includes("--dry-run");

function hostOf(url: string): string {
  try {
    return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname
      .replace(/^www\./, "")
      .toLowerCase();
  } catch {
    return "";
  }
}

// Same skip-list as the sweep (generic hosts never reported as suspects).
const GENERIC_HOST_PATTERNS = [
  "facebook.com", "google.com", "caring.com", "aplaceformom.com", "seniorly.com",
  "seniorlivingnearme.com", "seniorhousingnet.com", "apartments.com", "yelp.com",
  "hud.gov", ".gov", "medicare", "brookdale", "sunriseseniorliving", "holidayseniorliving",
  "atriaseniorliving", "lifecarecenters", "goodsamaritan",
];

// Machine-generated templated fakes: {county|town}-senior-living.com /
// {town}-senior-care.com. Real brands use real domains and never match.
const SYNTHETIC_HOST = /^[a-z0-9]+-senior-(living|care)\.com$/;

// Bucket 1 — legit operator / management company / non-profit / government
// hosts. Reviewed by hand against the 2026-08-04 report.
const KEEP_HOSTS = new Set([
  // US operators / nonprofits / affordable-housing sponsors
  "eldercarealliance.org", "srgseniorliving.com", "bridgehousing.com", "humangood.org",
  "eahhousing.org", "unitycouncil.org", "cchnc.org", "jscoabode.com", "jsco.net",
  "thecil.org", "cschomecare.com", "oneononeseniorcare.com", "hsseniorcare.com",
  "seniorcs.com", "raystoneseniors.com", "crmscommunities.com", "onelifeseniorliving.com",
  "milestoneretirement.com", "koelschseniorcommunities.com", "lifegen.net", "rbhc.biz",
  "sunmarnursing.com", "mosaicms.com", "rhf.org", "roseleafcare.com", "1pvi.org",
  "standard-communities.com", "nazarethhouse.org", "selfhelpelderly.org", "fredfinch.org",
  "burbankhousing.org", "wearecch.org", "mdihawaii.com", "hawaiiaffordable.com",
  "chm.org", "riverspringhealth.org", "legendseniorliving.com", "civitasseniorliving.com",
  "pegasusseniorliving.com", "oakmontseniorliving.com", "jhsf.org", "jhslf.org",
  "kiscoseniorliving.com", "arcadia.org", "lcca.com", "sonidaseniorliving.com",
  "stellarliving.com", "watermarkcommunities.com", "leisurecare.com", "prestigecare.com",
  "cascadeliving.com", "seniorservicesofamerica.com", "seniorstar.com",
  "episcopalretirement.com", "epichouse.org", "catholichealthservices.org",
  "arborcompany.com", "seniorlivinginstyle.com", "ecsforseniors.org", "mercyhousing.org",
  "covlivingflorida.org", "cc-md.org", "wsfssh.org", "nycnh.org", "phsk.org",
  "bgretirement.com", "hnvi.org", "sfhcr.com", "commhav.com", "shore-center.com",
  "heritagewaterside.com", "regency-pacific.com", "viliving.com",
  "provincialseniorliving.com", "morningstarseniorliving.com", "volanteseniorliving.com",
  "marquiscompanies.com", "tutera.com", "homesc.com", "ivyliving.com",
  "ivyassistedliving.com", "casaderetiroelmirador.com",
  // Canada
  "rils.ca", "vch.ca", "amica.ca", "atriaretirement.ca", "verveseniorliving.com",
  "levanteliving.com", "allseniorscare.com", "sifton.com", "hvgbhousing.com",
  "shannonfalls.ca", "parkplaceheightslong.ca",
  // Australia / NZ
  "sccliving.org.au", "scctas.org.au", "uniting.org", "ech.asn.au", "bupa.com.au",
  "infin8care.com.au", "salvationarmy.org.au", "hammond.com.au", "dgas.org.au",
  "wmq.org.au", "svcs.org.au", "dhac.org.au", "caringco.com.au",
  // Japan
  "care21.co.jp", "care-21.co.jp", "care-sys.jp", "san-ikukai.or.jp", "aoikai.jp",
  "tokyu-land.co.jp", "iuhw.ac.jp", "hcm3455.co.jp", "cuc-jpn.com",
  // Russia
  "k31.ru", "dominternat19.ru", "pansionat-dolgozhitel.ru", "pansionatu.ru",
  // Europe
  "emeis.fr", "sanctuary-care.co.uk", "hbb.de", "fdst.de",
  // Mexico / LatAm / gov
  "gob.mx", "difjalisco.gob.mx", "prefeitura.rio",
  // Asia (operators)
  "sinooceangroup.com", "perennialholdings.com", "thkmc.org.sg", "touch.org.sg",
  "mft.org.sg", "ucccare.com", "bahri.com", "westhillssenior.com",
  // real facilities that legitimately embed no name token
  "paradisecreekrl.com", "tablerocksl.com", "bayshire.com",
]);

// Bucket 2 — directory / aggregator / media / marketplace hosts: definitively
// NOT the community's own website → clear website only.
const DIRECTORY_HOSTS = new Set([
  "assistedlivingmagazine.com", "assistedlivingcenter.com", "seniorliving.org",
  "seniorhomes.com", "seniorsite.org", "seniors.fyi", "payingforseniorcare.com",
  "olera.care", "elderlifefinancial.com", "alzheimers.net", "assistedliving.org",
  "assistedliving.com", "seniorguidance.org", "seniorlivingfacilities.net",
  "seniorlivingnearme.org", "assistedlivingnearme.net", "assistedseniorliving.net",
  "seniorcarehomes.com", "seniorcarefinder.com", "petfriendlyseniorliving.com",
  "mylivingchoice.com", "theassistedlivingspecialist.com", "seniorhousingnews.com",
  "en.m.wikipedia.org", "en.wikipedia.org", "amazon.com", "realtor.com",
  "tripadvisor.com", "zoominfo.com", "justdial.com", "carehome.co.uk",
  "trustedcare.co.uk", "lottie.org", "autumna.co.uk", "caresourcer.com",
  "agedcareguide.com.au", "liveyourretirement.com", "ecdol.org", "starzmeet.com",
  "eoslhe.eu", "continuingcarecommunities.org", "homelycare.com",
  "directory.tml.org", "members.pcbeach.org", "hitesite.org",
  "mexicoassistedliving.com",
]);

// Per-record overrides — CLEAR website only (wrong entity: architect/developer/
// press/unrelated org, or an operator host that does not run THIS community).
const CLEAR_IDS = new Map<number, string>([
  [348, "starzmeet.com is junk, unrelated to Silicon Valley Independent Living Center"],
  [50473, "marquiscompanies.com not corroborated for generic 'Portland Assisted Living' record"],
  [70250, "casadelcarmen.org.mx is a CDMX facility, not the Culiacán asilo"],
  [70716, "tablerocksl.com is a Boise facility, not Park Place in Nampa"],
  [70868, "bayshire.com does not operate The Glen at Scripps Ranch"],
  [75005, "provectuscare.com.au (Australian operator) on a Beijing record"],
  [75010, "dahlingroup.com is an architecture firm, not the operator"],
  [75012, "smithgroup.com is an architecture firm, not the operator"],
  [75055, "gpny.net unrelated to Caring Transitions"],
  [75932, "thw.com is a design firm, not the operator"],
  [75990, "klingsoehr.com is the developer, not Sunrise Senior Living Berlin"],
]);

// Per-record overrides — sibling-facility contamination or garbled record:
// clear website/phone/pricing AND flag identity_suspect.
const FLAG_IDS = new Map<number, string>([
  [2016, "website points at sibling facility santamartharesidential.com"],
  [2028, "website points at sibling facility canyonvillas.com"],
  [5519, "record garbled: 'Kaneohe Senior Living' located in Honokaa; directory website"],
  [5522, "website points at Ivy Living (different operator); record looks synthetic"],
  [5531, "website points at Ivy Living; 'Pearl Harbor Hawaii Kai' name looks fabricated"],
  [5934, "record garbled: 'Las Vegas Valley Memory Care' located in Reno, NV"],
  [50474, "website points at sibling facility westhillssenior.com; generic fabricated name"],
  [52334, "saraland.org (Alabama city site) on a Quebec City record"],
  [54073, "website points at sibling facility shannonfalls.ca; generic name"],
  [55743, "website points at different facility parkplaceheightslong.ca"],
  [59476, "amazon.com as website; 'Levis Senior Living 22' looks fabricated"],
  [75008, "met-studio.com (design firm); 'Retirement Community (South of Beijing)' garbled"],
  [75710, "website points at sibling facility highlandersenior.com"],
  [76264, "website points at sibling facility paradisecreekrl.com (Paradise Creek ≠ Fairview Estates)"],
  [76265, "record garbled: 'Independence Hill' (a San Antonio brand) located in Moscow, ID"],
  [76490, "website points at unrelated vi.com"],
  [76493, "website points at sibling facility ranchosantafevilla.com"],
  [76495, "website points at sibling facility thepavilionattecologlen.com"],
  [76496, "website points at sibling facility plazavillage.com"],
  [76497, "website points at sibling facility highlandersenior.com"],
  [76506, "website points at sibling facility arcadiaplace.com"],
  [76605, "record is a scraped SEO title, not a facility name"],
  [76607, "record is a scraped SEO fragment ('Daytona Beach'), not a facility"],
  [76616, "record is a scraped SEO title ('Atlantic City Skilled Nursing Homes')"],
  [76620, "record garbled: 'Independent Living Reno' in Reno, CA (wrong state)"],
  [76621, "record is a scraped SEO title, not a facility name"],
  [76624, "record is a scraped SEO title, not a facility name"],
]);

const REMOVAL_REASON =
  "Synthetic / fabricated listing: machine-generated from a templated " +
  "'{place}-senior-living.com' domain. Identified PUBLIC by the Task #438 " +
  "identity-integrity sweep and adjudicated in the Task #440 review. Flagged by " +
  "the MySeniorValet data-integrity system for removal review per the Golden Data Rule.";

interface Row {
  id: number; name: string; city: string | null; state: string | null;
  website: string; phone: string | null;
  website_protected: boolean | null; phone_protected: boolean | null; pricing_protected: boolean | null;
  data_quality_flags: string[] | null; enrichment_data: any;
}

async function loadSuspects(): Promise<Row[]> {
  const res = await pool.query(
    `SELECT id, name, city, state, website, phone,
            website_protected, phone_protected, pricing_protected,
            data_quality_flags, enrichment_data
       FROM communities
      WHERE is_hidden = false AND is_active = true
        AND website IS NOT NULL AND trim(website) <> ''
      ORDER BY id`,
  );
  const out: Row[] = [];
  for (const r of res.rows as Row[]) {
    const host = hostOf(r.website);
    if (!host) continue;
    if (GENERIC_HOST_PATTERNS.some((p) => host.includes(p))) continue;
    const tokens = identityNameTokens(r.name || "");
    if (tokens.length === 0) continue;
    const hostAlpha = host.replace(/[^a-z]/g, "");
    const nameHit = hostEmbedsCommunityName(r.website, r.name || "");
    const cityAlpha = (r.city || "").toLowerCase().replace(/[^a-z]/g, "");
    const cityHit = cityAlpha.length >= 4 && hostAlpha.includes(cityAlpha);
    if (!nameHit && !cityHit) out.push(r);
  }
  return out;
}

async function clearWebsite(r: Row, alsoContact: boolean, note: string) {
  if (DRY) return;
  const sets: string[] = [];
  if (!r.website_protected) sets.push(`website = NULL`);
  if (alsoContact) {
    if (!r.phone_protected) sets.push(`phone = NULL`, `phone_valid = NULL`);
    if (!r.pricing_protected)
      sets.push(
        `price_range = NULL`, `pricing_details = '{}'::json`,
        `price_range_min = NULL`, `price_range_max = NULL`, `live_pricing = NULL`,
      );
  }
  if (sets.length === 0) return;
  await pool.query(
    `UPDATE communities SET ${sets.join(", ")}, updated_at = now() WHERE id = $1`,
    [r.id],
  );
  void note;
}

async function flagIdentitySuspect(r: Row, reason: string) {
  if (DRY) return;
  const flags = Array.isArray(r.data_quality_flags) ? r.data_quality_flags : [];
  const newFlags = flags.includes("identity_suspect") ? flags : [...flags, "identity_suspect"];
  const prior = r.enrichment_data || {};
  const evidence = {
    detectedAt: prior?.identitySuspect?.detectedAt ?? new Date().toISOString(),
    candidateIdentity: r.website || prior?.identitySuspect?.candidateIdentity || null,
    reasons: Array.from(new Set([...(prior?.identitySuspect?.reasons ?? []), reason])),
    sources: Array.from(new Set([...(prior?.identitySuspect?.sources ?? []), r.website].filter(Boolean))),
  };
  const merged = { ...prior, identitySuspect: evidence };
  await pool.query(
    `UPDATE communities
        SET data_quality_flags = (
              SELECT COALESCE(array_agg(x), ARRAY[]::text[])
              FROM jsonb_array_elements_text($2::jsonb) AS x
            ),
            enrichment_data = $3::jsonb,
            flag_status = COALESCE(flag_status, 'pending'),
            updated_at = now()
      WHERE id = $1`,
    [r.id, JSON.stringify(newFlags), JSON.stringify(merged)],
  );
}

async function queueSynthetic(r: Row): Promise<"queued" | "already"> {
  const existing = await pool.query(
    `SELECT 1 FROM removal_requests
      WHERE request_type = 'community' AND entity_id = $1
        AND status IN ('pending','reviewing') LIMIT 1`,
    [r.id],
  );
  const hasOpen = (existing.rowCount ?? 0) > 0;
  if (DRY) return hasOpen ? "already" : "queued";
  if (!hasOpen) {
    await pool.query(
      `INSERT INTO removal_requests
         (request_type, entity_id, entity_name, requestor_name, requestor_email,
          requestor_role, reason, legal_basis, additional_notes, status, created_at, updated_at)
       VALUES ('community', $1, $2,
          'MySeniorValet Data Integrity System', 'hello@myseniorvalet.com',
          'authorized_representative', $3, 'accuracy', $4, 'pending', now(), now())`,
      [r.id, r.name, REMOVAL_REASON, `Templated domain: ${r.website} · Location: ${r.city ?? "?"}, ${r.state ?? "?"}`],
    );
  }
  // Protective flag + quarantine (reversible; nothing deleted).
  await pool.query(
    `UPDATE communities
        SET data_quality_flags = (
              SELECT array_agg(DISTINCT f)
                FROM unnest(array_append(COALESCE(data_quality_flags, '{}'), 'synthetic_suspected')) AS f
            ),
            flag_status = 'pending',
            is_hidden = true,
            updated_at = now()
      WHERE id = $1`,
    [r.id],
  );
  return hasOpen ? "already" : "queued";
}

async function main() {
  console.log(`Task #440 website-mismatch review — ${DRY ? "DRY-RUN (no writes)" : "APPLY"}`);
  const suspects = await loadSuspects();
  console.log(`Sweep re-run: ${suspects.length} public suspect(s).\n`);

  const buckets = { keep: [] as Row[], directory: [] as Row[], synthetic: [] as Row[], clear: [] as Row[], flag: [] as Row[], unknown: [] as Row[] };
  let queued = 0, already = 0;

  for (const r of suspects) {
    const host = hostOf(r.website);
    if (FLAG_IDS.has(r.id)) {
      buckets.flag.push(r);
      await clearWebsite(r, true, FLAG_IDS.get(r.id)!);
      await flagIdentitySuspect(r, FLAG_IDS.get(r.id)!);
    } else if (CLEAR_IDS.has(r.id)) {
      buckets.clear.push(r);
      await clearWebsite(r, false, CLEAR_IDS.get(r.id)!);
    } else if (SYNTHETIC_HOST.test(host)) {
      buckets.synthetic.push(r);
      const res = await queueSynthetic(r);
      if (res === "queued") queued++; else already++;
    } else if (KEEP_HOSTS.has(host)) {
      buckets.keep.push(r);
    } else if (DIRECTORY_HOSTS.has(host)) {
      buckets.directory.push(r);
      await clearWebsite(r, false, "directory/aggregator host is not the community's own site");
    } else {
      buckets.unknown.push(r); // conservative: no change, listed for manual follow-up
    }
  }

  console.log("===== REVIEW SUMMARY =====");
  console.log(`KEEP (legit operator/nonprofit/gov domains):   ${buckets.keep.length}`);
  console.log(`DIRECTORY (website cleared):                   ${buckets.directory.length}`);
  console.log(`SYNTHETIC (removal-queued + quarantined):      ${buckets.synthetic.length}  (new requests: ${queued}, already open: ${already})`);
  console.log(`CLEAR (per-record website cleared):            ${buckets.clear.length}`);
  console.log(`FLAG (identity_suspect + website/phone/pricing cleared): ${buckets.flag.length}`);
  console.log(`UNKNOWN host (no change — manual follow-up):   ${buckets.unknown.length}`);
  for (const r of buckets.unknown) {
    console.log(`   ?  #${r.id}  ${r.name} (${r.city}, ${r.state}) → ${hostOf(r.website)}`);
  }
  if (DRY) console.log("\n(DRY-RUN: nothing was persisted.)");
  await pool.end();
  process.exit(0);
}

main().catch(async (e) => {
  console.error("❌ review-website-mismatches-440 failed:", e);
  try { await pool.end(); } catch {}
  process.exit(1);
});
