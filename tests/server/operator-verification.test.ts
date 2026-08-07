import { evaluateOperatorVerification } from "../../server/services/operator-verification";

const approved = {
  claimId: 1,
  communityId: 10,
  claimerUserId: 20,
  status: "Approved",
  reviewedBy: 30,
  reviewedAt: "2026-08-07T12:00:00.000Z",
  claimantAccountActive: true,
};

describe("operator verification evidence", () => {
  it("requires an approved claim tied to an active authenticated operator and reviewer", () => {
    expect(evaluateOperatorVerification(approved)).toEqual({
      operatorVerified: true,
      operatorVerification: {
        source: "approved_operator_claim",
        verifiedAt: "2026-08-07T12:00:00.000Z",
      },
    });
  });

  it.each(["Pending", "Under Review", "Rejected", "Cancelled", "Revoked", "Suspended", "Expired"])(
    "does not verify a %s claim",
    (status) => {
      expect(evaluateOperatorVerification({ ...approved, status }).operatorVerified).toBe(false);
    },
  );

  it("rejects orphaned, unreviewed, and inactive-account claims", () => {
    expect(evaluateOperatorVerification({ ...approved, claimerUserId: null }).operatorVerified).toBe(false);
    expect(evaluateOperatorVerification({ ...approved, reviewedBy: null }).operatorVerified).toBe(false);
    expect(evaluateOperatorVerification({ ...approved, reviewedAt: null }).operatorVerified).toBe(false);
    expect(evaluateOperatorVerification({ ...approved, claimantAccountActive: false }).operatorVerified).toBe(false);
  });

  it("does not infer anything when no authoritative claim exists", () => {
    expect(evaluateOperatorVerification(null)).toEqual({
      operatorVerified: false,
      operatorVerification: null,
    });
  });
});
