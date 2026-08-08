/**
 * Identity-suspect review flow (Task #438).
 *
 * Pins down the terminal-until-reviewed contract:
 *   - background self-heal enrichment is BLOCKED while identity_suspect is set;
 *   - routine QC actions (restore / clear-flags without naming the flag)
 *     PRESERVE the flag, so self-heal stays blocked;
 *   - only the deliberate adjudication (naming identity_suspect in
 *     clearProtectiveFlags — the QC "Identity reviewed" action) removes it and
 *     unblocks enrichment;
 *   - identity_suspect never forces is_hidden (unlike the quarantine flags) and
 *     survives the visibility recompute's flag merge.
 */
import {
  isIdentitySuspectFlagged,
  IDENTITY_SUSPECT_FLAG,
} from "../server/services/community-identity";
import {
  flagsKeptOnAdminRestore,
  computeRowVisibility,
  HIDING_PROTECTIVE_FLAGS,
  PROTECTIVE_FLAG_LIST,
} from "../server/services/community-visibility";

describe("self-heal blocking", () => {
  it("blocks while the flag is present, not otherwise", () => {
    expect(isIdentitySuspectFlagged(["no_photos", IDENTITY_SUSPECT_FLAG])).toBe(true);
    expect(isIdentitySuspectFlagged(["no_photos"])).toBe(false);
    expect(isIdentitySuspectFlagged(null)).toBe(false);
    expect(isIdentitySuspectFlagged(undefined)).toBe(false);
  });
});

describe("routine QC actions preserve the flag (self-heal stays blocked)", () => {
  const existing = ["no_photos", "thin_description", IDENTITY_SUSPECT_FLAG];

  it("restore WITHOUT naming the flag keeps it", () => {
    const kept = flagsKeptOnAdminRestore(existing);
    expect(kept).toContain(IDENTITY_SUSPECT_FLAG);
    expect(isIdentitySuspectFlagged(kept)).toBe(true); // still blocked
  });

  it("restore naming a DIFFERENT protective flag still keeps it", () => {
    const kept = flagsKeptOnAdminRestore(
      [...existing, "synthetic_suspected"],
      ["synthetic_suspected"],
    );
    expect(kept).toContain(IDENTITY_SUSPECT_FLAG);
    expect(kept).not.toContain("synthetic_suspected");
  });

  it("only the explicit identity adjudication clears it and unblocks self-heal", () => {
    const kept = flagsKeptOnAdminRestore(existing, [IDENTITY_SUSPECT_FLAG]);
    expect(kept).not.toContain(IDENTITY_SUSPECT_FLAG);
    expect(isIdentitySuspectFlagged(kept)).toBe(false); // unblocked
  });

  it("identity_suspect is a canonical protective flag (valid clearProtectiveFlags name)", () => {
    expect(PROTECTIVE_FLAG_LIST).toContain(IDENTITY_SUSPECT_FLAG);
  });
});

describe("visibility semantics", () => {
  const baseRow: any = {
    id: 1,
    name: "Kona Senior Living",
    description: "A".repeat(200),
    phone: "(808) 555-0100",
    website: "https://example.com",
    email: null,
    latitude: 21.38,
    longitude: -157.93,
    photos: ["https://example.com/a.jpg"],
    careTypes: ["assisted_living"],
    communitySubtype: null,
    facilityType: null,
    isVerified: false,
    data_source: "government_records",
    isClaimed: false,
    claimVerified: false,
    isFeaturedBrand: false,
    subscriptionTier: null,
    hudPropertyId: null,
    rentPerMonth: null,
    isHidden: false,
    flagStatus: null,
    dataQualityFlags: [IDENTITY_SUSPECT_FLAG],
  };

  it("identity_suspect does NOT force hiding (unlike quarantine flags)", () => {
    expect(HIDING_PROTECTIVE_FLAGS.has(IDENTITY_SUSPECT_FLAG)).toBe(false);
    const result = computeRowVisibility(baseRow);
    expect(result.protected).toBe(false);
  });

  it("the flag survives the visibility recompute's managed-flag merge", () => {
    const result = computeRowVisibility(baseRow);
    expect(result.mergedFlags).toContain(IDENTITY_SUSPECT_FLAG);
  });

  it("quarantine flags still force hidden", () => {
    const result = computeRowVisibility({
      ...baseRow,
      dataQualityFlags: ["synthetic_suspected"],
    });
    expect(result.protected).toBe(true);
    expect(result.hidden).toBe(true);
  });
});
