import {
  getAuthenticatedOperatorUserId,
  requireAuthenticatedOperatorUserId,
} from "../../server/services/operator-claim-identity";
import { evaluateOperatorVerification } from "../../server/services/operator-verification";
import { readFileSync } from "fs";
import { join } from "path";

describe("operator claim authenticated identity lifecycle", () => {
  it("persists the canonical custom-session identity through approved public evidence", () => {
    const claimerUserId = requireAuthenticatedOperatorUserId({
      session: {
        userId: 42,
        user: { id: 42 },
      },
    });

    const persistedClaim = {
      claimId: 7,
      communityId: 297,
      claimerUserId,
      status: "Approved",
      reviewedBy: 9,
      reviewedAt: "2026-08-07T20:00:00.000Z",
      claimantAccountActive: true,
    };

    expect(persistedClaim.claimerUserId).toBe(42);
    expect(evaluateOperatorVerification(persistedClaim).operatorVerified).toBe(true);
  });

  it("prefers canonical session identity over legacy request-user identity", () => {
    expect(getAuthenticatedOperatorUserId({
      session: { userId: 42, user: { id: 42 } },
      user: { id: 99, claims: { sub: 100 } },
    })).toBe(42);
  });

  it("supports the session user object and rejects absent or invalid identities", () => {
    expect(getAuthenticatedOperatorUserId({ session: { user: { id: "51" } } })).toBe(51);
    expect(getAuthenticatedOperatorUserId({ user: { claims: { sub: "61" } } })).toBe(61);
    expect(getAuthenticatedOperatorUserId({ session: { userId: 0 } })).toBeNull();
    expect(() => requireAuthenticatedOperatorUserId({})).toThrow(
      "Authenticated operator account required",
    );
  });

  it("keeps all active claim ownership routes on canonical session identity", () => {
    const routeSources = [
      "server/routes/community-claim-routes.ts",
      "server/routes/community-claims.ts",
      "server/routes/claimRoutes.ts",
    ].map((path) => readFileSync(join(process.cwd(), path), "utf8"));

    expect(routeSources[0]).toContain(
      "const ownerId = requireAuthenticatedOperatorUserId(req as any)",
    );
    expect(routeSources[0]).not.toMatch(
      /claimedCommunities\.ownerId,\s*parseInt\(\(req as any\)\.user/,
    );
    expect(routeSources[1]).not.toMatch(
      /const requesterId = Number\(req\.user/,
    );
  });
});