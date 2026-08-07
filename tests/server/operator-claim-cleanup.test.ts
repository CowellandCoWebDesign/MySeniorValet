import { readFileSync } from "fs";
import { join } from "path";

describe("unsupported operator claim cleanup", () => {
  const source = readFileSync(
    join(process.cwd(), "server/scripts/cleanup-unsupported-operator-claims.ts"),
    "utf8",
  );

  it("is restricted to active public legacy flags without authoritative evidence", () => {
    expect(source).toContain("c.is_active IS TRUE");
    expect(source).toContain("c.is_hidden IS NOT TRUE");
    expect(source).toContain("cc.status = 'Approved'");
    expect(source).toContain("cc.reviewed_by IS NOT NULL");
    expect(source).toContain("cc.reviewed_at IS NOT NULL");
    expect(source).toContain("u.is_active IS TRUE");
    expect(source).toContain("RETURNING c.id");
  });

  it("records prior values before clearing all stale mirrors", () => {
    expect(source).toContain("unsupported_operator_claim_flags_removed");
    expect(source).toContain("previousValues");
    expect(source).toContain("is_claimed = false");
    expect(source).toContain("claim_verified = false");
    expect(source).toContain("claimed_by_user_id = NULL");
    expect(source).toContain("claim_date = NULL");
    expect(source).toContain("for (const row of changed)");
  });
});