/**
 * Regression test for the enrichment identity gate (Task #438).
 *
 * Live repro: community 5526 "Kona Senior Living" (Aiea, HI) — Perplexity
 * research locked onto "Aiea Heights Senior Living" and persisted ITS website,
 * phone, capacity, and pricing. The photo layer rejected everything, but the
 * other identity-bearing fields had no gate. These tests pin down the shared
 * gate: a mismatched official-site candidate must persist NO website / phone /
 * management company / capacity / unit types / pricing.
 */
import {
  identityNameTokens,
  textCorroboratesIdentity,
  evaluateSourceIdentity,
  hostEmbedsCommunityName,
  gateIdentityFields,
  shouldFlagIdentitySuspect,
} from "../server/services/community-identity";

// A realistic scraped page for the WRONG facility (the live repro's candidate).
const AIEA_HEIGHTS_PAGE = `
  Aiea Heights Senior Living | Assisted Living in Aiea, Hawaii.
  Welcome to Aiea Heights Senior Living, a 22-resident care home located in
  Aiea, HI 96701. Call (808) 979-6229 to schedule a tour. Monthly rates from
  $4,500 for assisted living and $5,200 for memory care.
`;

describe("identity tokenizer", () => {
  it("keeps suffix words so siblings stay distinguishable", () => {
    expect(identityNameTokens("Hilltop Estates Senior Living")).toEqual([
      "hilltop",
      "estates",
    ]);
    expect(identityNameTokens("Hilltop Springs Assisted Living")).toEqual([
      "hilltop",
      "springs",
    ]);
  });
  it("drops only generic care words", () => {
    expect(identityNameTokens("Kona Senior Living")).toEqual(["kona"]);
  });
});

describe("mismatched official-site candidate (Kona repro)", () => {
  const name = "Kona Senior Living";
  const city = "Aiea";
  const url = "https://aieaheightsseniorliving.com/locations/aiea-heights-senior-living/";

  it("does NOT corroborate — city coincidence must not rescue a name mismatch", () => {
    const check = evaluateSourceIdentity({ url, pageText: AIEA_HEIGHTS_PAGE, name, city });
    expect(check.corroborated).toBe(false);
    expect(check.reason).toMatch(/name mismatch/i);
  });

  it("host check also fails (no 'kona' in the domain)", () => {
    expect(hostEmbedsCommunityName(url, name)).toBe(false);
  });

  it("gate persists NO website/phone/pricing/capacity/managementCompany", () => {
    const check = evaluateSourceIdentity({ url, pageText: AIEA_HEIGHTS_PAGE, name, city });
    const { kept, skipped } = gateIdentityFields(check, {
      website: url,
      phone: "(808) 979-6229",
      managementCompany: "Aiea Heights LLC",
      capacity: 22,
      unitTypes: ["private", "semi-private"],
      pricing: { min: 4500, max: 5200 },
      pricingByCareLevel: [{ label: "Assisted Living", min: 4500 }],
      availability: "waitlist",
    });
    expect(kept).toEqual({});
    expect(skipped).toEqual(
      expect.arrayContaining([
        "website",
        "phone",
        "managementCompany",
        "capacity",
        "unitTypes",
        "pricing",
        "pricingByCareLevel",
        "availability",
      ]),
    );
  });
});

describe("corroborated sources still persist", () => {
  it("a page naming this community AND its city passes", () => {
    const check = evaluateSourceIdentity({
      url: "https://hilltopestatessl.com/",
      pageText: "Hilltop Estates senior living community in Lancaster, CA.",
      name: "Hilltop Estates",
      city: "Lancaster",
    });
    expect(check.corroborated).toBe(true);
    const { kept, skipped } = gateIdentityFields(check, {
      website: "https://hilltopestatessl.com/",
      phone: "(661) 555-0100",
    });
    expect(skipped).toEqual([]);
    expect(kept.website).toBe("https://hilltopestatessl.com/");
  });

  it("short names must match ALL tokens (siblings can't steal on one shared token)", () => {
    const check = textCorroboratesIdentity(
      "Hilltop Springs assisted living in Lancaster",
      "Hilltop Estates",
      "Lancaster",
    );
    expect(check.corroborated).toBe(false);
  });

  it("city must corroborate too", () => {
    const check = textCorroboratesIdentity(
      "Hilltop Estates senior living — schedule a tour today",
      "Hilltop Estates",
      "Lancaster",
    );
    expect(check.corroborated).toBe(false);
    expect(check.reason).toMatch(/city mismatch/i);
  });
});

describe("unverifiable sources", () => {
  it("scrape failure + non-matching host does NOT corroborate", () => {
    const check = evaluateSourceIdentity({
      url: "https://aieaheightsseniorliving.com/",
      pageText: "",
      name: "Kona Senior Living",
      city: "Aiea",
    });
    expect(check.corroborated).toBe(false);
  });
  it("scrape failure but host embeds the name → weakly corroborated", () => {
    const check = evaluateSourceIdentity({
      url: "https://konaseniorliving.com/",
      pageText: "",
      name: "Kona Senior Living",
      city: "Aiea",
    });
    expect(check.corroborated).toBe(true);
  });
});

describe("identity_suspect arbitration", () => {
  it("flags after repeated mismatched resolutions, not the first", () => {
    const one = [{ at: "2026-08-04T00:00:00Z", reason: "name mismatch" }];
    expect(shouldFlagIdentitySuspect(one)).toBe(false);
    expect(
      shouldFlagIdentitySuspect([
        ...one,
        { at: "2026-08-05T00:00:00Z", reason: "name mismatch", candidateWebsite: "x" },
      ]),
    ).toBe(true);
  });
});
