/**
 * Baked Senior Resource Directory — shell injection tests.
 *
 * The /senior-resources page must serve its listings baked into the initial
 * HTML (crawlable with JS disabled): real resource names, addresses, hours,
 * and phone numbers, with exactly ONE self-canonical and stable category
 * anchors. These tests exercise the pure builders in
 * server/seo/resource-directory-seo.ts without a server or DB.
 */

import {
  buildDirectoryHead,
  buildDirectoryBody,
  injectDirectoryIntoShell,
  RESOURCE_DIRECTORY_PAYLOAD_ID,
} from "../server/seo/resource-directory-seo";
import {
  DIRECTORY_CATEGORIES,
  DIRECTORY_COUNTIES,
  DIRECTORY_SITUATIONS,
  DIRECTORY_CATEGORY_IDS,
  DIRECTORY_COUNTY_IDS,
  type BakedResourceDirectory,
} from "../shared/resource-directory";
import {
  CURATED_LOCAL_LISTINGS,
  STATEWIDE_LISTINGS,
  NATIONAL_LISTINGS,
} from "../server/data/resource-directory-curated";

import {
  cachedNorCalCondition,
  countyIdArraySql,
  cachedRowToListing,
  assemble,
} from "../server/services/resource-directory-baked";
import { PgDialect } from "drizzle-orm/pg-core";

const BASE = "https://www.myseniorvalet.com";

function fullDirectory(): BakedResourceDirectory {
  return {
    categories: DIRECTORY_CATEGORIES,
    counties: DIRECTORY_COUNTIES,
    situations: DIRECTORY_SITUATIONS,
    listings: [...CURATED_LOCAL_LISTINGS, ...STATEWIDE_LISTINGS, ...NATIONAL_LISTINGS],
    generatedAt: "2026-08-05T00:00:00.000Z",
  };
}

const SHELL = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Generic Title</title>
    <meta name="description" content="Generic description" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

describe("curated data integrity", () => {
  const all = [...CURATED_LOCAL_LISTINGS, ...STATEWIDE_LISTINGS, ...NATIONAL_LISTINGS];

  it("every listing has a valid category, a source citation, and a contact", () => {
    for (const l of all) {
      expect(DIRECTORY_CATEGORY_IDS.has(l.category)).toBe(true);
      expect(l.source).toBeTruthy();
      expect(l.phone || l.website).toBeTruthy();
    }
  });

  it("every category has at least one listing (no empty sections)", () => {
    for (const cat of DIRECTORY_CATEGORIES) {
      const count = all.filter((l) => l.category === cat.id).length;
      expect({ category: cat.id, count: Math.min(count, 1) }).toEqual({ category: cat.id, count: 1 });
    }
  });

  it("all 11 NorCal counties have hand-verified local coverage", () => {
    for (const county of DIRECTORY_COUNTIES) {
      const count = CURATED_LOCAL_LISTINGS.filter(
        (l) => l.scope === "curated" && (l.counties || []).includes(county.id),
      ).length;
      expect({ county: county.id, covered: count > 0 }).toEqual({ county: county.id, covered: true });
    }
  });

  it("local listings only reference known county ids", () => {
    for (const l of CURATED_LOCAL_LISTINGS) {
      for (const c of l.counties || []) {
        // Extra counties a regional agency serves (e.g. plumas) are allowed
        // only for hand-written entries; researched entries are pre-filtered.
        if (!DIRECTORY_COUNTY_IDS.has(c)) {
          expect(["plumas", "colusa", "sutter", "del norte", "lake"]).toContain(c);
        }
      }
    }
  });

  it("every situation jump link points at a real category", () => {
    for (const s of DIRECTORY_SITUATIONS) {
      expect(DIRECTORY_CATEGORY_IDS.has(s.categoryId)).toBe(true);
    }
  });
});

describe("cached NorCal query construction (error 42809 regression)", () => {
  const dialect = new PgDialect();

  it("builds a real text[] array for ANY(), not a tuple", () => {
    const q = dialect.sqlToQuery(countyIdArraySql());
    expect(q.sql).toMatch(/^ARRAY\[\$1(, \$\d+)*\]::text\[\]$/);
    expect(q.params.length).toBe(DIRECTORY_COUNTIES.length);
    expect(q.params).toContain("humboldt");
  });

  it("full cached condition uses = ANY(ARRAY[...]::text[]) and parameterizes the cutoff", () => {
    const cutoff = new Date("2026-05-01T00:00:00Z");
    const q = dialect.sqlToQuery(cachedNorCalCondition(cutoff)!);
    // Both the metadata-county and city comparisons must target an array literal.
    const anyMatches = q.sql.match(/= ANY\(ARRAY\[/g) || [];
    expect(anyMatches.length).toBe(2);
    // Never the tuple form that triggered PostgreSQL error 42809.
    expect(q.sql).not.toMatch(/= ANY\(\$\d+(, ?\$\d+)+\)/);
    expect(q.sql).not.toMatch(/= ANY\(\(\$/);
    // Cutoff is parameterized (drizzle may serialize the Date), never inlined.
    expect(q.sql).not.toContain("2026-05-01");
    expect(q.params.length).toBe(DIRECTORY_COUNTIES.length * 2 + 1);
  });

  it("eligible cached rows are converted and merged into the baked payload", () => {
    const listing = cachedRowToListing({
      name: "Test Discovered Meals Program",
      city: "Redding",
      state: "CA",
      phone: "(530) 555-0100",
      services: ["home-delivered meals"],
      metadata: { discoveryCounty: "shasta", discoveryCategory: "events-support" },
      source: "free_discovery",
    });
    expect(listing).not.toBeNull();
    expect(listing!.category).toBe("meals-on-wheels");
    expect(listing!.counties).toEqual(["shasta"]);
    expect(listing!.scope).toBe("discovered");

    const dir = assemble([listing!]);
    expect(dir.listings.some((l) => l.name === "Test Discovered Meals Program")).toBe(true);
  });

  it("cached rows deduplicate against curated by name and drop non-actionable rows", () => {
    const dupName = CURATED_LOCAL_LISTINGS[0].name;
    const dup = cachedRowToListing({
      name: dupName,
      state: "CA",
      phone: "555",
      metadata: { discoveryCounty: "shasta" },
    });
    expect(dup).not.toBeNull();
    const dir = assemble([dup!]);
    expect(dir.listings.filter((l) => l.name === dupName)).toHaveLength(1);

    // No phone/website → not actionable → excluded
    expect(
      cachedRowToListing({ name: "No Contact Org", state: "CA", metadata: { discoveryCounty: "shasta" } }),
    ).toBeNull();
    // Unknown county → excluded
    expect(
      cachedRowToListing({ name: "Elsewhere Org", state: "CA", phone: "555", city: "Los Angeles" }),
    ).toBeNull();
  });
});

describe("buildDirectoryHead", () => {
  const head = buildDirectoryHead(BASE);

  it("emits exactly one self-canonical", () => {
    const canonicals = head.match(/rel="canonical"/g) || [];
    expect(canonicals).toHaveLength(1);
    expect(head).toContain(`href="${BASE}/senior-resources"`);
  });

  it("emits a unique title and description marked data-ssr-meta", () => {
    expect(head).toContain("<title>");
    expect(head).toContain("Senior Resource Directory");
    expect(head).toContain('data-ssr-meta="resource-directory" name="description"');
    expect(head).toContain('name="robots" content="index, follow"');
  });
});

describe("buildDirectoryBody", () => {
  const body = buildDirectoryBody(fullDirectory());

  it("bakes real listing details into the HTML (names, addresses, phones, hours)", () => {
    expect(body).toContain("PSA 2 Area Agency on Aging");
    expect(body).toContain("1647 Hartnell Ave"); // street address
    expect(body).toContain("(530) 229-1435"); // phone
    expect(body).toContain("Mon–Fri 8:00 AM – 5:00 PM"); // hours
  });

  it("renders every category as a stable anchor section", () => {
    for (const cat of DIRECTORY_CATEGORIES) {
      expect(body).toContain(`<section id="${cat.id}">`);
    }
  });

  it("includes the 211 line and county coverage", () => {
    expect(body).toContain("Dial 2-1-1");
    expect(body).toContain("Humboldt");
    expect(body).toContain("Yuba");
  });

  it("escapes HTML in listing data", () => {
    const dir = fullDirectory();
    dir.listings = [
      {
        name: `<script>alert("x")</script>`,
        category: "senior-centers",
        source: "test",
        verified: false,
        scope: "national",
        phone: "555",
      },
    ];
    const out = buildDirectoryBody(dir);
    expect(out).not.toContain(`<script>alert`);
    expect(out).toContain("&lt;script&gt;");
  });
});

describe("injectDirectoryIntoShell", () => {
  const html = injectDirectoryIntoShell(SHELL, fullDirectory(), BASE);

  it("strips the generic head and leaves exactly one title and one canonical", () => {
    expect(html.match(/<title>/g)).toHaveLength(1);
    expect(html.match(/rel="canonical"/g)).toHaveLength(1);
    expect(html).not.toContain("Generic Title");
    expect(html).not.toContain("Generic description");
  });

  it("injects crawlable content inside #root", () => {
    expect(html).toMatch(/<div id="root"><div data-ssr-shell="resource-directory">/);
    expect(html).toContain("Senior Resource Directory");
  });

  it("embeds the JSON payload outside #root with </script>-safe escaping", () => {
    expect(html).toContain(`<script id="${RESOURCE_DIRECTORY_PAYLOAD_ID}" type="application/json">`);
    const payloadMatch = html.match(
      new RegExp(`<script id="${RESOURCE_DIRECTORY_PAYLOAD_ID}"[^>]*>(.*?)</script>`, "s"),
    );
    expect(payloadMatch).toBeTruthy();
    expect(payloadMatch![1]).not.toContain("</");
    const parsed = JSON.parse(payloadMatch![1].replace(/\\u003c/g, "<"));
    expect(parsed.categories.length).toBe(DIRECTORY_CATEGORIES.length);
    expect(parsed.listings.length).toBeGreaterThan(50);
  });

  it("does not treat $ in listing text as a replacement pattern", () => {
    const dir = fullDirectory();
    dir.listings = [
      {
        name: "Costs $1,000 & more $& $' test",
        category: "senior-centers",
        source: "test",
        verified: false,
        scope: "national",
        phone: "555",
      },
    ];
    const out = injectDirectoryIntoShell(SHELL, dir, BASE);
    expect(out).toContain("Costs $1,000");
  });
});
