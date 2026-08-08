/**
 * The `test_data` data-quality flag must be PROTECTIVE: a seeded/demo record
 * carrying it stays hidden no matter how good its content looks, and the flag
 * itself must survive the managed-flag merge so every future recompute (bulk
 * pass, self-heal, on-view enrichment) keeps the record quarantined.
 */
import fs from "fs";
import path from "path";
import {
  computeRowVisibility,
  PROTECTIVE_FLAG_LIST,
} from "../server/services/community-visibility";

// community-visibility imports ../db (which opens a Neon pool at module eval);
// these tests only exercise the pure compute path, so stub it out.
jest.mock("../server/db", () => ({ db: {}, pool: {} }));

/** A content-rich senior community row that would normally be kept public. */
function richSeniorRow(overrides: Record<string, any> = {}) {
  return {
    id: 76347,
    name: "Premium Willow Gardens Assisted Living",
    description:
      "A full-service assisted living community offering restaurant-style dining, " +
      "daily activities, transportation, and 24/7 licensed care staff on site.",
    phone: "(555) 123-4567",
    website: "https://premiumwillowgardens.com",
    email: "info@premiumwillowgardens.com",
    latitude: 34.05,
    longitude: -118.24,
    photos: ["https://example.com/a.jpg", "https://example.com/b.jpg"],
    careTypes: ["assisted_living", "memory_care"],
    communitySubtype: null,
    facilityType: "assisted_living",
    isVerified: true,
    data_source: "seed",
    isClaimed: false,
    claimVerified: false,
    isFeaturedBrand: false,
    subscriptionTier: null,
    hudPropertyId: null,
    rentPerMonth: 4500,
    isHidden: false,
    flagStatus: null,
    dataQualityFlags: [],
    ...overrides,
  } as any;
}

describe("protective flag list", () => {
  it("includes test_data so ALL restore paths built from the list skip seeded records", () => {
    expect(PROTECTIVE_FLAG_LIST).toContain("test_data");
    expect(PROTECTIVE_FLAG_LIST).toContain("synthetic_suspected");
    expect(PROTECTIVE_FLAG_LIST).toContain("geo_needs_review");
  });

  it("startup auto-restore (run-migration.ts) builds its exclusion from PROTECTIVE_FLAG_LIST, not a hand-copied array", () => {
    const src = fs.readFileSync(
      path.join(__dirname, "..", "server", "run-migration.ts"),
      "utf8",
    );
    // Regression guard: the startup restore once excluded only
    // synthetic_suspected/geo_needs_review inline and republished test_data
    // rows at every boot. It must reference the shared list.
    expect(src).toMatch(/PROTECTIVE_FLAG_LIST/);
    expect(src).not.toMatch(/ARRAY\['synthetic_suspected','geo_needs_review'\]/);
  });
});

describe("test_data protective flag", () => {
  it("keeps a content-rich record public without the flag (control)", () => {
    const result = computeRowVisibility(richSeniorRow());
    expect(result.protected).toBe(false);
    expect(result.hidden).toBe(false);
  });

  it("forces hidden=true regardless of content quality when test_data is present", () => {
    const result = computeRowVisibility(
      richSeniorRow({ dataQualityFlags: ["test_data"] }),
    );
    expect(result.protected).toBe(true);
    expect(result.hidden).toBe(true);
  });

  it("preserves test_data through the managed-flag merge so recompute cannot drop it", () => {
    const result = computeRowVisibility(
      richSeniorRow({ dataQualityFlags: ["test_data", "no_photos"] }),
    );
    expect(result.mergedFlags).toContain("test_data");
    expect(result.hidden).toBe(true);
  });

  it("stays hidden even after simulated enrichment restores it in-row (auto-restore guard)", () => {
    // Simulate the on-view enrichment path: record was hidden, gained content,
    // recompute runs — the protective flag must win over keepPublic.
    const result = computeRowVisibility(
      richSeniorRow({ isHidden: true, dataQualityFlags: ["test_data"] }),
    );
    expect(result.hidden).toBe(true);
    expect(result.protected).toBe(true);
  });
});
