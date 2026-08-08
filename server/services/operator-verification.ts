import { sql } from "drizzle-orm";
import { db } from "../db";

export type OperatorClaimStatus =
  | "Pending"
  | "Under Review"
  | "Approved"
  | "Rejected"
  | "Cancelled"
  | "Revoked"
  | "Suspended"
  | "Expired";

export interface OperatorVerificationEvidence {
  claimId: number;
  communityId: number;
  claimerUserId: number | null;
  status: OperatorClaimStatus | string | null;
  reviewedBy: number | null;
  reviewedAt: Date | string | null;
  claimantAccountActive: boolean;
}

export interface PublicOperatorVerification {
  operatorVerified: boolean;
  operatorVerification: {
    source: "approved_operator_claim";
    verifiedAt: string;
  } | null;
}

export function evaluateOperatorVerification(
  evidence: OperatorVerificationEvidence | null | undefined,
): PublicOperatorVerification {
  const verified = Boolean(
    evidence &&
      evidence.status === "Approved" &&
      evidence.claimerUserId &&
      evidence.reviewedBy &&
      evidence.reviewedAt &&
      evidence.claimantAccountActive,
  );

  return {
    operatorVerified: verified,
    operatorVerification: verified
      ? {
          source: "approved_operator_claim",
          verifiedAt: new Date(evidence!.reviewedAt!).toISOString(),
        }
      : null,
  };
}

export async function getOperatorVerificationByCommunityIds(
  communityIds: number[],
): Promise<Map<number, PublicOperatorVerification>> {
  const ids = Array.from(
    new Set(communityIds.filter((id) => Number.isInteger(id) && id > 0)),
  );
  const result = new Map<number, PublicOperatorVerification>();
  if (ids.length === 0) return result;

  const idList = sql.join(ids.map((id) => sql`${id}`), sql`, `);
  const rows = await db.execute(sql`
    SELECT DISTINCT ON (cc.community_id)
      cc.id AS claim_id,
      cc.community_id,
      cc.claimer_user_id,
      cc.status,
      cc.reviewed_by,
      cc.reviewed_at,
      COALESCE(u.is_active, false) AS claimant_account_active
    FROM community_claims cc
    LEFT JOIN users u ON u.id = cc.claimer_user_id
    WHERE cc.community_id IN (${idList})
    ORDER BY
      cc.community_id,
      CASE WHEN cc.status = 'Approved' THEN 0 ELSE 1 END,
      cc.reviewed_at DESC NULLS LAST,
      cc.id DESC
  `);

  const records: any[] = (resultRows(rows) as any[]);
  for (const row of records) {
    const communityId = Number(row.community_id);
    result.set(
      communityId,
      evaluateOperatorVerification({
        claimId: Number(row.claim_id),
        communityId,
        claimerUserId: row.claimer_user_id == null ? null : Number(row.claimer_user_id),
        status: row.status,
        reviewedBy: row.reviewed_by == null ? null : Number(row.reviewed_by),
        reviewedAt: row.reviewed_at,
        claimantAccountActive: row.claimant_account_active === true,
      }),
    );
  }

  return result;
}

function resultRows(result: unknown): unknown[] {
  if (Array.isArray(result)) return result;
  return (result as any)?.rows ?? [];
}

/**
 * Adds only non-sensitive, derived claim evidence to a public community payload.
 * Legacy flags and claimant account IDs are intentionally removed.
 */
export async function attachPublicOperatorVerification<T extends Record<string, any>>(
  communities: T[],
): Promise<Array<Omit<T, "claimedBy" | "claimed_by_user_id" | "claimToken" | "claim_token"> & PublicOperatorVerification>> {
  const evidence = await getOperatorVerificationByCommunityIds(
    communities.map((community) => Number(community.id)),
  );

  return communities.map((community) => {
    const {
      claimedBy: _claimedBy,
      claimed_by_user_id: _claimedBySnake,
      claimToken: _claimToken,
      claim_token: _claimTokenSnake,
      ...publicCommunity
    } = community;
    return {
      ...publicCommunity,
      ...(evidence.get(Number(community.id)) ?? {
        operatorVerified: false,
        operatorVerification: null,
      }),
    };
  });
}
