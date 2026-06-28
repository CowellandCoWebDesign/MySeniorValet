import {
  classifySenior,
  evaluateCommunity,
  isMeaningfullyVerified,
  hasRealContent,
} from "@shared/community-classification";

describe("classifySenior", () => {
  it("classifies real senior care types as senior", () => {
    expect(classifySenior({ name: "Maple Grove", careTypes: ["Assisted Living"] })).toBe("senior");
    expect(classifySenior({ name: "Anywhere", careTypes: ["Memory Care"] })).toBe("senior");
  });

  it("classifies senior name keywords as senior", () => {
    expect(classifySenior({ name: "Sunrise Senior Living" })).toBe("senior");
    expect(classifySenior({ name: "Golden Years Retirement Home" })).toBe("senior");
  });

  it("matches HUD Section 202 (elderly) only on explicit phrasing", () => {
    expect(classifySenior({ name: "Section 202 Elderly Apartments" })).toBe("senior");
    expect(classifySenior({ name: "Sec. 202 Housing" })).toBe("senior");
  });

  it("does NOT treat a bare '202' substring as a senior signal", () => {
    // address / building-number / branding false positives must not be senior
    expect(classifySenior({ name: "2020 Main St Apartments" })).not.toBe("senior");
    expect(classifySenior({ name: "Building 202 Family Housing" })).not.toBe("senior");
    expect(classifySenior({ name: "Route 202 Commons" })).toBe("unknown");
  });

  it("marks a HUD feed row non_senior ONLY when its only care type is generic HUD Housing", () => {
    expect(
      classifySenior({
        name: "Riverside Manor",
        data_source: "HUD Multifamily Database",
        careTypes: ["HUD Housing"],
      }),
    ).toBe("non_senior");
  });

  it("keeps an ambiguous HUD feed row (empty/mixed care types) as unknown, not non_senior", () => {
    expect(
      classifySenior({ name: "Riverside Manor", data_source: "HUD Multifamily Database", careTypes: [] }),
    ).toBe("unknown");
    expect(
      classifySenior({ name: "Pine Court", data_source: "HUD Multifamily Database" }),
    ).toBe("unknown");
  });

  it("classifies obvious general-housing names as non_senior", () => {
    expect(classifySenior({ name: "Oakwood Family Apartments" })).toBe("non_senior");
    expect(classifySenior({ name: "City Housing Authority" })).toBe("non_senior");
    expect(classifySenior({ name: "Section 8 Public Housing" })).toBe("non_senior");
  });

  it("does NOT trust the over-applied hud_senior_housing subtype alone", () => {
    expect(
      classifySenior({ name: "Generic Place", community_subtype: "hud_senior_housing" }),
    ).toBe("unknown");
  });

  it("treats HUD-VASH (homeless-veteran supportive housing) as non_senior, not senior", () => {
    // Name-based VASH signal is non_senior regardless of feed.
    expect(classifySenior({ name: "Valor Station HUD-VASH Apartments" })).toBe("non_senior");
    expect(classifySenior({ name: "Riverside VASH Program" })).toBe("non_senior");
    // HUD-VASH feed row whose only care type is generic HUD Housing → non_senior.
    expect(
      classifySenior({ name: "Liberty House", facility_type: "HUD-VASH", careTypes: ["HUD Housing"] }),
    ).toBe("non_senior");
  });

  it("does NOT classify generic veterans housing as senior", () => {
    // Veterans signals are no longer positive senior signals; with no real
    // senior care type/subtype/name these stay ambiguous (unknown), not senior.
    expect(classifySenior({ name: "State Veterans Home", careTypes: ["VA Housing"] })).toBe("unknown");
    expect(classifySenior({ name: "County Veterans Residence", community_subtype: "veterans_home" })).toBe("unknown");
  });

  it("still classifies a veterans community as senior when it offers real senior care", () => {
    // A genuine senior care type wins regardless of the veterans label.
    expect(
      classifySenior({ name: "Veterans Memorial Care", careTypes: ["Skilled Nursing"] }),
    ).toBe("senior");
  });

  it("leaves genuinely ambiguous listings as unknown", () => {
    expect(classifySenior({ name: "Hilltop Commons" })).toBe("unknown");
  });
});

describe("isMeaningfullyVerified", () => {
  it("ignores the legacy is_verified flag and auto-set subscription_tier='verified'", () => {
    expect(isMeaningfullyVerified({ is_verified: true })).toBe(false);
    expect(isMeaningfullyVerified({ subscriptionTier: "verified" })).toBe(false);
  });

  it("counts claimed / featured / gov-verified pricing", () => {
    expect(isMeaningfullyVerified({ isClaimed: true })).toBe(true);
    expect(isMeaningfullyVerified({ subscriptionTier: "featured" })).toBe(true);
    expect(isMeaningfullyVerified({ hudPropertyId: "ABC123", rentPerMonth: 900 })).toBe(true);
    expect(isMeaningfullyVerified({ hudPropertyId: "ABC123", rentPerMonth: 0 })).toBe(false);
  });
});

describe("hasRealContent", () => {
  it("requires >=1 photo or >=100-char description", () => {
    expect(hasRealContent({ photos: ["a.jpg"] })).toBe(true);
    expect(hasRealContent({ description: "x".repeat(100) })).toBe(true);
    expect(hasRealContent({ description: "too short" })).toBe(false);
    expect(hasRealContent({})).toBe(false);
  });
});

describe("evaluateCommunity keepPublic (STRICT + senior-only)", () => {
  it("keeps a senior listing with real content public", () => {
    const e = evaluateCommunity({ name: "Sunrise Senior Living", photos: ["a.jpg"] });
    expect(e.classification).toBe("senior");
    expect(e.keepPublic).toBe(true);
  });

  it("hides a non_senior listing even when it has content", () => {
    const e = evaluateCommunity({
      name: "Oakwood Family Apartments",
      description: "x".repeat(300),
      photos: ["a.jpg", "b.jpg"],
    });
    expect(e.classification).toBe("non_senior");
    expect(e.keepPublic).toBe(false);
  });

  it("keeps an ambiguous unknown listing public when it meets the content bar", () => {
    const e = evaluateCommunity({ name: "Hilltop Commons", photos: ["a.jpg"] });
    expect(e.classification).toBe("unknown");
    expect(e.keepPublic).toBe(true);
  });

  it("hides a senior listing that is thin and unverified (no content)", () => {
    const e = evaluateCommunity({ name: "Sunrise Senior Living" });
    expect(e.classification).toBe("senior");
    expect(e.realContent).toBe(false);
    expect(e.meaningfullyVerified).toBe(false);
    expect(e.keepPublic).toBe(false);
  });

  it("keeps a meaningfully-verified senior listing public even without content", () => {
    const e = evaluateCommunity({ name: "Sunrise Senior Living", isClaimed: true });
    expect(e.keepPublic).toBe(true);
  });

  it("hides clearly-fake listings", () => {
    const e = evaluateCommunity({ name: "Empty Senior Place" });
    expect(e.clearlyFake).toBe(true);
    expect(e.keepPublic).toBe(false);
  });
});
