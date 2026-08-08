import { db } from "../db";
import { sql } from "drizzle-orm";

const APPLY = process.argv.includes("--apply");
const ACTOR = "system:operator-claim-cleanup";

export async function cleanupUnsupportedOperatorClaimFlags(options?: {
  apply?: boolean;
  log?: boolean;
}) {
  const apply = options?.apply ?? APPLY;
  const shouldLog = options?.log ?? true;
  const candidates = await db.execute(sql`
    SELECT c.id, c.name, c.city, c.state, c.is_claimed, c.claim_verified,
           c.claimed_by_user_id, c.claim_date
    FROM communities c
    WHERE (c.is_claimed IS TRUE OR c.claim_verified IS TRUE OR c.claimed_by_user_id IS NOT NULL)
      AND c.is_active IS TRUE
      AND c.is_hidden IS NOT TRUE
      AND NOT EXISTS (
        SELECT 1
        FROM community_claims cc
        JOIN users u ON u.id = cc.claimer_user_id
        WHERE cc.community_id = c.id
          AND cc.status = 'Approved'
          AND cc.reviewed_by IS NOT NULL
          AND cc.reviewed_at IS NOT NULL
          AND u.is_active IS TRUE
      )
    ORDER BY c.id
  `);
  const rows: any[] = (candidates as any).rows ?? candidates;

  if (shouldLog) {
    console.log(JSON.stringify({
      mode: apply ? "apply" : "audit",
      unsupportedCount: rows.length,
      communities: rows.map(({ id, name, city, state }) => ({ id, name, city, state })),
    }, null, 2));
  }

  if (!apply || rows.length === 0) return rows.length;

  const changedRows = await db.transaction(async (tx) => {
    const ids = rows.map((row) => Number(row.id));
    const idList = sql.join(ids.map((id) => sql`${id}`), sql`, `);
    const updateResult = await tx.execute(sql`
      UPDATE communities c
      SET is_claimed = false,
          claim_verified = false,
          claimed_by_user_id = NULL,
          claim_date = NULL,
          updated_at = NOW()
      WHERE c.id IN (${idList})
        AND (c.is_claimed IS TRUE OR c.claim_verified IS TRUE OR c.claimed_by_user_id IS NOT NULL)
        AND c.is_active IS TRUE
        AND c.is_hidden IS NOT TRUE
        AND NOT EXISTS (
          SELECT 1
          FROM community_claims cc
          JOIN users u ON u.id = cc.claimer_user_id
          WHERE cc.community_id = c.id
            AND cc.status = 'Approved'
            AND cc.reviewed_by IS NOT NULL
            AND cc.reviewed_at IS NOT NULL
            AND u.is_active IS TRUE
        )
      RETURNING c.id
    `);
    const updated: any[] = (updateResult as any).rows ?? updateResult;
    const changedIds = new Set(updated.map((row) => Number(row.id)));
    const changed = rows.filter((row) => changedIds.has(Number(row.id)));

    for (const row of changed) {
      await tx.execute(sql`
        INSERT INTO audit_logs (
          action, entity_type, entity_id, metadata, severity, outcome
        ) VALUES (
          'unsupported_operator_claim_flags_removed',
          'community',
          ${String(row.id)},
          ${JSON.stringify({
            previousValues: {
              isClaimed: row.is_claimed,
              claimVerified: row.claim_verified,
              claimedByUserId: row.claimed_by_user_id,
              claimDate: row.claim_date,
            },
            reason: "No approved, reviewed claim tied to an active authenticated operator",
            additionalInfo: { performedBy: ACTOR },
          })}::jsonb,
          'Medium',
          'Success'
        )
      `);
    }
    return changed;
  });

  if (shouldLog) {
    console.log(JSON.stringify({
      applied: true,
      reversibleFromAuditLog: true,
      updatedCount: changedRows.length,
    }, null, 2));
  }
  return changedRows.length;
}

if (process.argv[1]?.endsWith("cleanup-unsupported-operator-claims.ts")) {
  cleanupUnsupportedOperatorClaimFlags().then(() => process.exit(0)).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
