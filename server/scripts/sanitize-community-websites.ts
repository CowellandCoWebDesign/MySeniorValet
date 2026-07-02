/**
 * One-time IDEMPOTENT cleanup of corrupted communities.website values.
 * =====================================================================
 * Some enrichment writes left corrupted websites in the DB: markdown bold
 * wrappers ("**www.hilltopspringssl.com**"), markdown links, bare domains with
 * no protocol, citation markers, junk placeholders ("N/A", "none", …). These
 * block forced refresh / official-site scraping ("Invalid website URL
 * detected … ignoring").
 *
 * This script re-runs `sanitizeWebsiteUrl` (the same normalizer the pipeline
 * now applies on read) over every non-null website and persists the sanitized
 * value. Junk values that cannot be salvaged are set to NULL. Running it twice
 * is a no-op (sanitize(sanitize(x)) === sanitize(x)).
 *
 * Run: npx tsx server/scripts/sanitize-community-websites.ts [--dry-run]
 */
import { db } from "../db";
import { sql } from "drizzle-orm";
import { sanitizeWebsiteUrl } from "../utils/website-url";

const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  const rows = (await db.execute(sql`
    SELECT id, name, website, website_protected
    FROM communities
    WHERE website IS NOT NULL AND trim(website) <> ''
  `)) as any;
  const list = rows.rows ?? rows;

  let fixed = 0;
  let nulled = 0;
  let unchanged = 0;

  // Trailing-slash-insensitive comparison: `new URL(...).toString()` appends a
  // canonical "/" to bare-origin URLs. That is NOT corruption — rewriting ~15k
  // rows for a cosmetic slash would be pure churn. Only persist when the value
  // differs beyond the trailing slash (markdown wrappers, missing protocol,
  // citation markers, junk).
  const canon = (s: string) => s.trim().replace(/\/+$/, "");

  for (const c of list) {
    const clean = sanitizeWebsiteUrl(c.website);
    if (clean && canon(clean) === canon(c.website)) {
      unchanged++;
      continue;
    }
    if (clean) {
      fixed++;
      console.log(`FIX   #${c.id} "${c.name}": "${c.website}" → "${clean}"`);
      if (!DRY_RUN) {
        await db.execute(sql`UPDATE communities SET website = ${clean} WHERE id = ${c.id}`);
      }
    } else {
      nulled++;
      console.log(`NULL  #${c.id} "${c.name}": "${c.website}" (unsalvageable junk)`);
      if (!DRY_RUN) {
        await db.execute(sql`UPDATE communities SET website = NULL WHERE id = ${c.id}`);
      }
    }
  }

  console.log(
    `\n${DRY_RUN ? "[DRY RUN] " : ""}Websites scanned: ${list.length} — sanitized: ${fixed}, nulled: ${nulled}, already clean: ${unchanged}`,
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
