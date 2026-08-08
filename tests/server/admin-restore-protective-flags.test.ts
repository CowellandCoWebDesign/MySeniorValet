/**
 * @jest-environment node
 *
 * Regression: admin restore must NEVER resurrect a quarantined test/fake
 * record (Task: stop admin restore from wiping protective flags).
 *
 * Both restore endpoints (bulk-quality-action + qc-action) route through
 * adminRestoreCommunities, which preserves protective flags and lets the
 * canonical visibility recompute decide is_hidden. This test runs the REAL
 * service (computeRowVisibility + evaluateCommunity, no mocks on policy)
 * against a stateful in-memory row store, so it verifies end state:
 *   - a record flagged test_data stays hidden after restore,
 *   - the protective flag survives the flag rewrite,
 *   - a genuinely good record without protective flags IS restored,
 *   - a named clearProtectiveFlags override is required to lift quarantine.
 */
import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// ── Stateful in-memory "communities table" ────────────────────────────────
// Keyed by id; rows use the same camelCase property names as the Drizzle
// column aliases used in community-visibility.ts, so select({...}) mapping
// is the identity.
const rows = new Map<number, any>();

// drizzle-orm: eq(col, val) → capture the id value so the fake db can filter.
jest.mock("drizzle-orm", () => ({
  eq: (_col: any, val: any) => ({ __id: val }),
  and: (...a: any[]) => a,
  or: (...a: any[]) => a,
  gt: (...a: any[]) => a,
  lt: (...a: any[]) => a,
  isNull: (...a: any[]) => a,
  inArray: (...a: any[]) => a,
  sql: Object.assign((...a: any[]) => a, { raw: (...a: any[]) => a }),
}));

jest.mock("../../shared/schema", () => {
  // Property access on the table object just returns the key name — the fake
  // db never inspects columns, it returns whole rows.
  const communities = new Proxy({}, { get: (_t, p) => ({ name: String(p) }) });
  return { communities };
});

jest.mock("../../server/db", () => {
  const db = {
    select: (_cols: any) => ({
      from: () => ({
        where: (cond: any) => {
          const match = rows.has(cond.__id) ? [{ ...rows.get(cond.__id) }] : [];
          return Object.assign(Promise.resolve(match), {
            limit: () => Promise.resolve(match),
            orderBy: () => ({ limit: () => Promise.resolve(match) }),
          });
        },
      }),
    }),
    update: () => ({
      set: (vals: any) => ({
        where: (cond: any) => {
          const row = rows.get(cond.__id);
          if (row) Object.assign(row, vals);
          return Promise.resolve({ rowCount: row ? 1 : 0 });
        },
      }),
    }),
  };
  return { db, pool: {} };
});

import {
  adminRestoreCommunities,
  computeRowVisibility,
} from "../../server/services/community-visibility";

/** A content-rich senior community row that policy would keep public. */
function richSeniorRow(id: number, overrides: Record<string, any> = {}) {
  return {
    id,
    name: "Premium Willow Gardens Assisted Living",
    description:
      "A full-service assisted living community offering restaurant-style dining, " +
      "daily activities, transportation, and 24/7 licensed care staff on site.",
    phone: "(555) 123-4567",
    website: "https://premiumwillowgardens.com",
    email: "info@premiumwillowgardens.com",
    latitude: 34.05,
    longitude: -118.24,
    photos: ["https://premiumwillowgardens.com/a.jpg", "https://premiumwillowgardens.com/b.jpg"],
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
    isActive: true,
    flagStatus: null,
    dataQualityFlags: [],
    ...overrides,
  };
}

beforeEach(() => rows.clear());

describe("adminRestoreCommunities vs protective flags", () => {
  it("keeps a quarantined test_data record hidden with the flag intact (restore is a no-op resurrection)", async () => {
    // Quarantined: even though the content looks rich, test_data is protective.
    rows.set(76347, richSeniorRow(76347, {
      isHidden: true,
      flagStatus: "confirmed",
      dataQualityFlags: ["test_data", "thin_description"],
    }));

    const results = await adminRestoreCommunities([76347]);

    expect(results).toHaveLength(1);
    expect(results[0].restored).toBe(false);
    expect(results[0].hidden).toBe(true);
    expect(results[0].protected).toBe(true);
    expect(results[0].protectiveFlags).toContain("test_data");

    const row = rows.get(76347);
    expect(row.isHidden).toBe(true);
    expect(row.dataQualityFlags).toContain("test_data");
  });

  it("preserves synthetic_suspected quarantine through restore", async () => {
    rows.set(500, richSeniorRow(500, {
      isHidden: true,
      dataQualityFlags: ["synthetic_suspected"],
    }));

    const [r] = await adminRestoreCommunities([500]);
    expect(r.hidden).toBe(true);
    expect(rows.get(500).dataQualityFlags).toContain("synthetic_suspected");
  });

  it("restores a good record with only reviewer-actionable flags", async () => {
    rows.set(600, richSeniorRow(600, {
      isHidden: true,
      flagStatus: "confirmed",
      dataQualityFlags: ["citation_artifact"],
    }));

    const [r] = await adminRestoreCommunities([600]);
    expect(r.restored).toBe(true);
    expect(r.hidden).toBe(false);
    const row = rows.get(600);
    expect(row.isHidden).toBe(false);
    expect(row.flagStatus).toBeNull();
    expect(row.isActive).toBe(true);
  });

  it("lifts quarantine ONLY when the protective flag is named explicitly", async () => {
    // A record whose CONTENT does not fingerprint as test data (quarantined
    // manually), so once the flag is deliberately cleared it can go public.
    rows.set(700, richSeniorRow(700, {
      isHidden: true,
      dataQualityFlags: ["geo_needs_review"],
    }));

    // Without the override: stays hidden.
    let [r] = await adminRestoreCommunities([700]);
    expect(r.hidden).toBe(true);

    // With the named override: restored.
    [r] = await adminRestoreCommunities([700], {
      clearProtectiveFlags: ["geo_needs_review"],
    });
    expect(r.hidden).toBe(false);
    expect(rows.get(700).dataQualityFlags).not.toContain("geo_needs_review");
  });

  it("cannot un-quarantine a record whose CONTENT fingerprints as test data, even with the override", async () => {
    rows.set(76346, richSeniorRow(76346, {
      name: "Test Community Alpha",
      website: "https://demo.myseniorvalet.com",
      isHidden: true,
      dataQualityFlags: ["test_data"],
    }));

    const [r] = await adminRestoreCommunities([76346], {
      clearProtectiveFlags: ["test_data"],
    });
    // evaluateCommunity re-detects test data from content → keepPublic=false.
    expect(r.hidden).toBe(true);
    expect(rows.get(76346).isHidden).toBe(true);
  });

  it("computeRowVisibility never publishes a row carrying test_data", () => {
    const result = computeRowVisibility(
      richSeniorRow(1, { dataQualityFlags: ["test_data"] }) as any,
    );
    expect(result.hidden).toBe(true);
    expect(result.protected).toBe(true);
    expect(result.mergedFlags).toContain("test_data");
  });
});
