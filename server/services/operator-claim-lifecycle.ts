import { eq, sql } from "drizzle-orm";
import { communityClaims, communities } from "@shared/schema";
import { db } from "../db";
import type { OperatorClaimStatus } from "./operator-verification";

type BadgeRemovingStatus = Exclude<OperatorClaimStatus, "Approved">;

function numericActorId(actorId: unknown): number {
  const parsed = Number(actorId);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("A valid authenticated reviewer is required");
  }
  return parsed;
}

export async function approveOperatorClaim(claimId: number, reviewerId: unknown) {
  const actorId = numericActorId(reviewerId);
  return db.transaction(async (tx) => {
    const [claim] = await tx
      .select()
      .from(communityClaims)
      .where(eq(communityClaims.id, claimId))
      .limit(1);

    if (!claim) throw new Error("Claim not found");
    if (!claim.claimerUserId) {
      throw new Error("Claim is not tied to an authenticated operator account");
    }
    if (!["Pending", "Under Review"].includes(claim.status || "")) {
      throw new Error("Claim is not eligible for approval");
    }

    const claimantResult = await tx.execute(sql`
      SELECT id, is_active
      FROM users
      WHERE id = ${claim.claimerUserId}
      LIMIT 1
    `);
    const claimantRow = (claimantResult as any).rows?.[0] ?? (claimantResult as any)[0];
    if (!claimantRow || claimantRow.is_active !== true) {
      throw new Error("Claimant account is missing or inactive");
    }

    const reviewedAt = new Date();
    await tx
      .update(communityClaims)
      .set({
        status: "Approved",
        reviewedBy: actorId,
        reviewedAt,
        rejectionReason: null,
        updatedAt: reviewedAt,
      })
      .where(eq(communityClaims.id, claimId));

    await tx
      .update(communities)
      .set({
        isClaimed: true,
        claimVerified: true,
        claimedBy: claim.claimerUserId,
        claimDate: reviewedAt,
        updatedAt: reviewedAt,
      })
      .where(eq(communities.id, claim.communityId));

    return { claim, reviewedAt };
  });
}

export async function removeOperatorClaimVerification(options: {
  claimId: number;
  reviewerId: unknown;
  status: BadgeRemovingStatus;
  reason?: string;
}) {
  const actorId = numericActorId(options.reviewerId);

  return db.transaction(async (tx) => {
    const [claim] = await tx
      .select()
      .from(communityClaims)
      .where(eq(communityClaims.id, options.claimId))
      .limit(1);
    if (!claim) throw new Error("Claim not found");

    const reviewedAt = new Date();
    await tx
      .update(communityClaims)
      .set({
        status: options.status,
        reviewedBy: actorId,
        reviewedAt,
        rejectionReason: options.reason || null,
        updatedAt: reviewedAt,
      })
      .where(eq(communityClaims.id, options.claimId));

    const approvedRows = await tx.execute(sql`
      SELECT 1
      FROM community_claims
      WHERE community_id = ${claim.communityId}
        AND status = 'Approved'
        AND claimer_user_id IS NOT NULL
        AND reviewed_by IS NOT NULL
        AND reviewed_at IS NOT NULL
      LIMIT 1
    `);
    const approvedRecords: any[] = (approvedRows as any).rows ?? (approvedRows as unknown as any[]);
    const anotherApprovedClaim = approvedRecords.length > 0;

    if (!anotherApprovedClaim) {
      await tx
        .update(communities)
        .set({
          isClaimed: false,
          claimVerified: false,
          claimedBy: null,
          claimDate: null,
          updatedAt: reviewedAt,
        })
        .where(eq(communities.id, claim.communityId));
    }

    return { claim, reviewedAt };
  });
}
