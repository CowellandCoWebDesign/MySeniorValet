import { type Express } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { communityClaims, communities } from "@shared/schema";
import { db } from "../db";
import { checkRole, isAuthenticated as requireAuth } from "../auth-middleware";
import {
  approveOperatorClaim,
  removeOperatorClaimVerification,
} from "../services/operator-claim-lifecycle";
import { requireAuthenticatedOperatorUserId } from "../services/operator-claim-identity";

const createClaimSchema = z.object({
  communityId: z.coerce.number().int().positive(),
  claimerName: z.string().min(2),
  claimerEmail: z.string().email(),
  claimerPhone: z.string().optional(),
  position: z.string().min(2),
  companyName: z.string().optional(),
  businessLicenseNumber: z.string().optional(),
  businessAddress: z.string().optional(),
  reasonForClaim: z.string().min(2),
  additionalNotes: z.string().optional(),
});

export function registerClaimRoutes(app: Express) {
  app.get("/api/claims/check/:communityId", async (req, res) => {
    const communityId = Number(req.params.communityId);
    if (!Number.isInteger(communityId)) return res.status(400).json({ error: "Invalid community ID" });
    const [community] = await db
      .select({ id: communities.id, name: communities.name })
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);
    if (!community) return res.status(404).json({ error: "Community not found" });
    const [claim] = await db
      .select({ status: communityClaims.status })
      .from(communityClaims)
      .where(and(
        eq(communityClaims.communityId, communityId),
        sql`${communityClaims.status} IN ('Pending', 'Under Review', 'Approved')`,
      ))
      .orderBy(desc(communityClaims.createdAt))
      .limit(1);
    return res.json({
      canClaim: !claim,
      isClaimed: claim?.status === "Approved",
      claimStatus: claim?.status ?? null,
    });
  });

  const submit = async (req: any, res: any) => {
    try {
      const userId = requireAuthenticatedOperatorUserId(req);
      const data = createClaimSchema.parse(req.body);
      const [existing] = await db
        .select({ id: communityClaims.id, status: communityClaims.status })
        .from(communityClaims)
        .where(and(
          eq(communityClaims.communityId, data.communityId),
          sql`${communityClaims.status} IN ('Pending', 'Under Review', 'Approved')`,
        ))
        .limit(1);
      if (existing) return res.status(409).json({ error: `Claim already ${existing.status?.toLowerCase()}` });

      const [claim] = await db.insert(communityClaims).values({
        ...data,
        claimerUserId: userId,
        status: "Pending",
        priority: "Medium",
      }).returning({ id: communityClaims.id, status: communityClaims.status });
      return res.status(201).json({ claimId: claim.id, status: claim.status });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid claim", details: error.flatten().fieldErrors });
      }
      console.error("Error submitting claim:", error);
      return res.status(500).json({ error: "Failed to submit claim" });
    }
  };
  app.post("/api/claims", requireAuth, submit);
  app.post("/api/claims/submit", requireAuth, submit);

  app.get("/api/claims/my", requireAuth, async (req: any, res) => {
    const userId = requireAuthenticatedOperatorUserId(req);
    const claims = await db
      .select({
        claim: communityClaims,
        community: {
          id: communities.id,
          name: communities.name,
          address: communities.address,
          city: communities.city,
          state: communities.state,
        },
      })
      .from(communityClaims)
      .innerJoin(communities, eq(communityClaims.communityId, communities.id))
      .where(eq(communityClaims.claimerUserId, userId))
      .orderBy(desc(communityClaims.createdAt));
    return res.json(claims);
  });

  app.patch("/api/claims/:claimId/approve", requireAuth, checkRole("admin"), async (req: any, res) => {
    try {
      const reviewerId = requireAuthenticatedOperatorUserId(req);
      const result = await approveOperatorClaim(Number(req.params.claimId), reviewerId);
      return res.json({
        success: true,
        operatorVerification: {
          source: "approved_operator_claim",
          approvedBy: reviewerId,
          approvedAt: result.reviewedAt.toISOString(),
        },
      });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  });

  app.patch("/api/claims/:claimId/:action(reject|revoke|suspend)", requireAuth, checkRole("admin"), async (req: any, res) => {
    const reason = String(req.body.reason || req.body.rejectionReason || "").trim();
    if (!reason) return res.status(400).json({ error: "Reason is required" });
    const action = req.params.action as "reject" | "revoke" | "suspend";
    const status = {
      reject: "Rejected",
      revoke: "Revoked",
      suspend: "Suspended",
    }[action] as "Rejected" | "Revoked" | "Suspended";
    try {
      await removeOperatorClaimVerification({
        claimId: Number(req.params.claimId),
        reviewerId: requireAuthenticatedOperatorUserId(req),
        status,
        reason,
      });
      return res.json({ success: true, status });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get("/api/claims/stats", requireAuth, checkRole("admin"), async (_req, res) => {
    const result = await db.execute(sql`
      SELECT
        count(*) FILTER (WHERE status = 'Pending')::int AS pending,
        count(*) FILTER (WHERE status = 'Approved')::int AS approved,
        count(*) FILTER (WHERE status = 'Rejected')::int AS rejected,
        count(*) FILTER (WHERE status IN ('Revoked', 'Suspended', 'Expired'))::int AS inactive
      FROM community_claims
    `);
    return res.json((result as any).rows?.[0] ?? (result as any)[0]);
  });
}
