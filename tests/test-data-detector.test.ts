/**
 * Automated guard (Task: block seeded/test communities from going public):
 * `looksLikeTestData` fingerprints seeded/demo records — test-like names,
 * example.com / placeholder websites, or our own myseniorvalet.com domain —
 * and `evaluateCommunity` must NEVER return keepPublic=true for them, no
 * matter how rich the content. Since evaluateCommunity is the single
 * visibility evaluator (bulk pass + self-heal recompute), this test asserts
 * that no future seed/import can put a test record in front of the public.
 */
import {
  evaluateCommunity,
  looksLikeTestData,
  MANAGED_QUALITY_FLAGS,
} from "../shared/community-classification";

/** Content-rich senior row that clears every keep-public bar. */
function richRow(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    name: "Willow Gardens Assisted Living",
    description:
      "A full-service assisted living community offering restaurant-style dining, " +
      "daily activities, transportation, and 24/7 licensed care staff on site.",
    phone: "(555) 123-4567",
    website: "https://willowgardens.com",
    email: "info@willowgardens.com",
    latitude: 34.05,
    longitude: -118.24,
    photos: ["https://cdn.willowgardens.com/a.jpg"],
    careTypes: ["Assisted Living"],
    isVerified: true,
    data_source: "California DSS Licensing",
    isClaimed: true,
    ...overrides,
  } as any;
}

describe("looksLikeTestData detector", () => {
  it("flags test-like names", () => {
    expect(looksLikeTestData({ name: "Test Community" } as any)).toBe(true);
    expect(looksLikeTestData({ name: "Premium Test Community" } as any)).toBe(true);
    expect(looksLikeTestData({ name: "Demo Senior Living" } as any)).toBe(true);
    expect(looksLikeTestData({ name: "Sample Facility" } as any)).toBe(true);
    expect(looksLikeTestData({ name: "PLACEHOLDER" } as any)).toBe(true);
  });

  it("flags fake / placeholder websites", () => {
    expect(looksLikeTestData(richRow({ website: "https://example.com/x" }))).toBe(true);
    expect(looksLikeTestData(richRow({ website: "https://sub.example.org" }))).toBe(true);
    expect(looksLikeTestData(richRow({ website: "https://placeholder.site/img" }))).toBe(true);
    expect(looksLikeTestData(richRow({ website: "https://www.myseniorvalet.com/c/1" }))).toBe(true);
    expect(looksLikeTestData(richRow({ website: "http://localhost:5000" }))).toBe(true);
  });

  it("does NOT flag legitimate names/websites", () => {
    expect(looksLikeTestData(richRow())).toBe(false);
    // \b-bounded: substrings inside real words must not match
    expect(looksLikeTestData({ name: "Demopolis Senior Center" } as any)).toBe(false);
    expect(looksLikeTestData({ name: "Contest Hill Retirement" } as any)).toBe(false);
    expect(
      looksLikeTestData(richRow({ website: "https://greatexample.community.com" })),
    ).toBe(false);
  });
});

describe("evaluateCommunity blocks test records from public", () => {
  it("keeps a genuine rich senior row public (control)", () => {
    const e = evaluateCommunity(richRow());
    expect(e.keepPublic).toBe(true);
    expect(e.flags).not.toContain("test_data_suspected");
  });

  it.each([
    ["test-like name", { name: "Test Community of Sunnyvale" }],
    ["demo name", { name: "Demo Assisted Living" }],
    ["example.com website", { website: "https://example.com/facility" }],
    ["placeholder website", { website: "https://images.placeholder.com/400" }],
    ["myseniorvalet.com fake website", { website: "https://myseniorvalet.com/fake" }],
  ])("never keeps public with %s, even with rich content", (_label, overrides) => {
    const e = evaluateCommunity(richRow(overrides));
    expect(e.keepPublic).toBe(false);
    expect(e.flags).toContain("test_data_suspected");
  });

  it("test_data_suspected is a MANAGED flag so recomputes keep it current", () => {
    expect(MANAGED_QUALITY_FLAGS).toContain("test_data_suspected");
  });
});
