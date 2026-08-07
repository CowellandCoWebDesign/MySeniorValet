/**
 * @jest-environment node
 *
 * Approved registry identity must prevent quality re-scoring from re-hiding an
 * approved-portfolio record — while protective quarantines still always win.
 */
import { describe, it, expect, jest } from "@jest/globals";

jest.mock("../../server/db", () => ({ db: {} }));

import { computeRowVisibility } from "../../server/services/community-visibility";

const thinRow: any = {
  id: 1,
  name: "Brookdale Example",
  description: "",
  phone: null,
  website: null,
  email: null,
  latitude: null,
  longitude: null,
  photos: [],
  careTypes: ["Assisted Living"],
  communitySubtype: null,
  facilityType: null,
  isVerified: false,
  data_source: null,
  isClaimed: false,
  claimVerified: false,
  isFeaturedBrand: false,
  subscriptionTier: null,
  hudPropertyId: null,
  rentPerMonth: null,
  isHidden: true,
  flagStatus: null,
  dataQualityFlags: ["no_photos", "thin_profile"],
};

describe("computeRowVisibility registryApproved override", () => {
  it("thin profile stays hidden WITHOUT registry approval", () => {
    expect(computeRowVisibility(thinRow).hidden).toBe(true);
  });

  it("thin profile becomes public WITH registry approval", () => {
    expect(computeRowVisibility(thinRow, { registryApproved: true }).hidden).toBe(false);
  });

  it("protective quarantine flags still win over registry approval", () => {
    const quarantined = { ...thinRow, dataQualityFlags: ["synthetic_suspected", "thin_profile"] };
    expect(computeRowVisibility(quarantined, { registryApproved: true }).hidden).toBe(true);
  });

  it("admin-confirmed flag_status still wins over registry approval", () => {
    const confirmed = { ...thinRow, flagStatus: "confirmed" };
    expect(computeRowVisibility(confirmed, { registryApproved: true }).hidden).toBe(true);
  });
});
