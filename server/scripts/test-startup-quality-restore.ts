/**
 * DB-integration regression test for the STRICT-SUBSET guarantee of the
 * startup auto-restore (server/run-migration.ts runStartupQualityRestore):
 * hidden test/demo rows — which evaluateCommunity would NEVER keep public
 * (looksLikeTestData) — must never be flipped public at boot, even when they
 * otherwise satisfy the quality bar. A genuine quality-bar row IS restored
 * (positive control).
 *
 * Run: npx tsx server/scripts/test-startup-quality-restore.ts
 * (Jest cannot run DB-backed tests in this repo — drizzle/neon fails inside the
 * jsdom harness — so this lives as a tsx script, per the established pattern.)
 */
import { db } from "../db";
import { sql } from "drizzle-orm";
import { runStartupQualityRestore } from "../run-migration";
import { evaluateCommunity } from "@shared/community-classification";

const LONG_DESC =
  "A wonderful licensed assisted living residence offering 24-hour caregivers, chef-prepared meals, and a secured memory care wing near downtown with daily enrichment programs.";

const insertedIds: number[] = [];

async function insertHidden(name: string, website: string, flags: string[] = []): Promise<number> {
  const r = await db.execute(sql`
    INSERT INTO communities (name, address, city, state, zip_code, country,
      description, website, phone, senior_classification, is_hidden,
      data_quality_flags, slug, city_slug, state_slug)
    VALUES (${name}, '1 Test Way', 'Testville', 'ZZ', '00000', 'US',
      ${LONG_DESC}, ${website}, '555-000-0000', 'senior', true,
      ${sql`ARRAY[${sql.join(flags.length ? flags.map((f) => sql`${f}`) : [sql`''`], sql`, `)}]::text[]`},
      ${`qa-restore-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`},
      'testville', 'zz')
    RETURNING id
  `);
  const id = (r.rows[0] as any).id as number;
  insertedIds.push(id);
  return id;
}

async function isHidden(id: number): Promise<boolean> {
  const r = await db.execute(sql`SELECT is_hidden FROM communities WHERE id = ${id}`);
  return Boolean((r.rows[0] as any)?.is_hidden);
}

let failures = 0;
function check(label: string, ok: boolean) {
  console.log(`${ok ? "✅" : "❌"} ${label}`);
  if (!ok) failures++;
}

(async () => {
  try {
    // Sanity: the canonical evaluator rejects the test-named row.
    check(
      "evaluateCommunity rejects test-named row",
      evaluateCommunity({ name: "Test Senior Living", description: LONG_DESC, phone: "555-000-0000" }).keepPublic === false,
    );

    const testName = await insertHidden("Test Senior Living", "https://real-looking-site-qa.com");
    const testHost = await insertHidden("Golden Meadows Senior Living QA", "https://test.com/facility");
    const suspected = await insertHidden("Willow Bend Senior Living QA", "https://willowbend-qa-real.com", ["test_data_suspected"]);
    const genuine = await insertHidden("Willow Grove Senior Living QA", "https://willowgrove-qa-genuine.com");

    await runStartupQualityRestore();

    check("test/demo-named row stays hidden", await isHidden(testName));
    check("test-host website row stays hidden", await isHidden(testHost));
    check("test_data_suspected row stays hidden", await isHidden(suspected));
    check("genuine quality-bar row IS restored (positive control)", !(await isHidden(genuine)));
  } finally {
    if (insertedIds.length) {
      await db.execute(
        sql`DELETE FROM communities WHERE id IN (${sql.join(insertedIds.map((i) => sql`${i}`), sql`, `)})`,
      );
      console.log(`Cleaned up ${insertedIds.length} QA rows.`);
    }
  }
  process.exit(failures ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
