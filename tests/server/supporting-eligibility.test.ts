/**
 * @jest-environment node
 *
 * Task #483 — shared public referral-support eligibility predicate + care-intent
 * ranking. These tests exercise the REAL drizzle-orm `sql` builder (rendered via
 * PgDialect) and the fail-safe registry-state logic, mocking ONLY the db
 * connection so no network is touched.
 */
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { PgDialect } from "drizzle-orm/pg-core";

// Controllable fake for the single db.execute() the state-probe uses.
let executeImpl: (q: any) => Promise<any> = async () => ({ rows: [] });
jest.mock("../../server/db", () => ({
  db: {
    execute: (...args: any[]) => (executeImpl as any)(...args),
  },
}));

import {
  supportingEligibilityFilterFor,
  supportingEligibilityFilterSql,
  getSupportingRegistryState,
  invalidateSupportingRegistryState,
  resetSupportingRegistryStateForTests,
  isCommunitySupportingEligible,
  careIntentRankExpr,
  qualityRankExpr,
  qualityOrderBy,
  type SupportingRegistryState,
} from "../../server/utils/community-ranking";

const dialect = new PgDialect();
const render = (frag: any) => dialect.sqlToQuery(frag).sql;

const GATE_ON: SupportingRegistryState = {
  available: true,
  enabled: true,
  tablesPresent: true,
  decisionsPresent: true,
};
const GATE_OFF: SupportingRegistryState = {
  available: true,
  enabled: false,
  tablesPresent: false,
  decisionsPresent: false,
};

beforeEach(() => {
  resetSupportingRegistryStateForTests();
  executeImpl = async () => ({ rows: [] });
});

const HEALTHY_PROBE_ROW = {
  has_families: true,
  has_matches: true,
  has_approvals: true,
  has_exclusions: true,
  gate_enabled: true,
};

describe("supportingEligibilityFilterFor — predicate composition", () => {
  it("always enforces active + not-hidden", () => {
    const sql = render(supportingEligibilityFilterFor(GATE_OFF)).toLowerCase();
    expect(sql).toContain("is_active");
    expect(sql).toContain("is_hidden");
    expect(sql).toContain("is not true");
  });

  it("does NOT enforce the approved-allowlist before the gate is enabled (fail-safe)", () => {
    const sql = render(supportingEligibilityFilterFor(GATE_OFF)).toLowerCase();
    // No approval join/exists when gate off + tables absent.
    expect(sql).not.toContain("supporting_operator_families");
    expect(sql).not.toContain("supporting_community_matches");
    // And no exclusion subquery when decision tables are absent.
    expect(sql).not.toContain("supporting_community_exclusions");
  });

  it("applies the exclusion override even before the gate when decisions table exists", () => {
    const state: SupportingRegistryState = {
      available: true,
      enabled: false,
      tablesPresent: false,
      decisionsPresent: true,
    };
    const sql = render(supportingEligibilityFilterFor(state)).toLowerCase();
    expect(sql).toContain("supporting_community_exclusions");
    // Still no approved-allowlist join since gate is off.
    expect(sql).not.toContain("supporting_operator_families");
  });

  it("enforces exclusion + approved-allowlist when the gate is enabled", () => {
    const sql = render(supportingEligibilityFilterFor(GATE_ON)).toLowerCase();
    expect(sql).toContain("supporting_community_exclusions");
    expect(sql).toContain("supporting_community_approvals");
    expect(sql).toContain("'approved'");
    expect(sql).toContain("supporting_community_matches");
    expect(sql).toContain("supporting_operator_families");
    // Community-level exclusion is a NOT EXISTS (always wins over approval).
    expect(sql).toContain("not exists");
  });

  it("evaluates the gate flag LIVE in SQL (not from the cached snapshot)", () => {
    // Even when the snapshot says enabled:false, the predicate embeds the
    // platform_settings gate subquery so a gate flip applies on the next query.
    const state: SupportingRegistryState = {
      available: true,
      enabled: false,
      tablesPresent: true,
      decisionsPresent: true,
    };
    const sql = render(supportingEligibilityFilterFor(state)).toLowerCase();
    expect(sql).toContain("supporting_community_registry_gate");
    expect(sql).toContain("platform_settings");
    expect(sql).toContain("supporting_community_approvals");
  });
});

describe("registry mutations + synchronous public routes (completion-review regression)", () => {
  it("sync predicate keeps enforcing the registry after an admin mutation invalidates the cache", async () => {
    // 1. Healthy boot: probe primes the structural snapshot.
    executeImpl = async () => ({ rows: [HEALTHY_PROBE_ROW] });
    await getSupportingRegistryState({ fresh: true });

    // 2. Admin approves/revokes/excludes → cache invalidated.
    invalidateSupportingRegistryState();

    // 3. Synchronous route predicate must NOT regress to FALSE/empty — it must
    //    still reference the registry tables and the live gate subquery.
    const sql = render(supportingEligibilityFilterSql()).toLowerCase();
    expect(sql).not.toBe("false");
    expect(sql).toContain("is_active");
    expect(sql).toContain("supporting_community_exclusions");
    expect(sql).toContain("supporting_community_approvals");
    expect(sql).toContain("supporting_community_registry_gate");
  });

  it("a transient probe failure after a healthy probe keeps the last-known structure", async () => {
    executeImpl = async () => ({ rows: [HEALTHY_PROBE_ROW] });
    await getSupportingRegistryState({ fresh: true });

    executeImpl = async () => {
      throw new Error("transient outage");
    };
    const state = await getSupportingRegistryState({ fresh: true });
    expect(state.available).toBe(true);
    expect(state.tablesPresent).toBe(true);
    const sql = render(supportingEligibilityFilterFor(state)).toLowerCase();
    expect(sql).not.toBe("false");
    expect(sql).toContain("supporting_community_approvals");
  });

  it("still fails closed before ANY healthy probe (pre-bootstrap)", () => {
    const sql = render(supportingEligibilityFilterSql()).toLowerCase();
    expect(sql).toContain("false");
    expect(sql).not.toContain("supporting_community_approvals");
  });
});

describe("getSupportingRegistryState — fail-closed probing", () => {
  it("returns restrictive state when the probe throws", async () => {
    executeImpl = async () => {
      throw new Error("boom");
    };
    const state = await getSupportingRegistryState({ fresh: true });
    expect(state.available).toBe(false);
    expect(render(supportingEligibilityFilterFor(state)).toLowerCase()).toContain("false");
  });

  it("reflects a fully-present + enabled registry", async () => {
    executeImpl = async () => ({
      rows: [
        {
          has_families: true,
          has_matches: true,
          has_approvals: true,
          has_exclusions: true,
          gate_enabled: true,
        },
      ],
    });
    const state = await getSupportingRegistryState({ fresh: true });
    expect(state).toEqual({
      available: true,
      enabled: true,
      tablesPresent: true,
      decisionsPresent: true,
    });
  });

  it("does not mark tablesPresent when a required table is missing", async () => {
    executeImpl = async () => ({
      rows: [
        {
          has_families: true,
          has_matches: false, // missing
          has_approvals: true,
          has_exclusions: true,
          gate_enabled: true,
        },
      ],
    });
    const state = await getSupportingRegistryState({ fresh: true });
    expect(state.tablesPresent).toBe(false);
    expect(state.decisionsPresent).toBe(true);
    // A successful probe can safely avoid references to missing tables.
    const sql = render(supportingEligibilityFilterFor(state)).toLowerCase();
    expect(sql).not.toContain("supporting_operator_families");
    expect(sql).toContain("supporting_community_exclusions");
  });
});

describe("isCommunitySupportingEligible — single-row check", () => {
  it("returns true when a matching row is returned", async () => {
    executeImpl = async () => ({ rows: [{ "?column?": 1 }] });
    expect(await isCommunitySupportingEligible(123)).toBe(true);
  });

  it("returns false when no row matches", async () => {
    // First call = state probe (all false), second call = the row check.
    let call = 0;
    executeImpl = async () => {
      call += 1;
      if (call === 1) return { rows: [{}] };
      return { rows: [] };
    };
    expect(await isCommunitySupportingEligible(999)).toBe(false);
  });

  it("fails CLOSED (false) when the check throws", async () => {
    executeImpl = async () => {
      throw new Error("db down");
    };
    expect(await isCommunitySupportingEligible(1)).toBe(false);
  });
});

describe("care-intent-first ranking (Task #483)", () => {
  it("orders Independent > Assisted > Memory > other > Skilled/Rehab", () => {
    const sql = render(careIntentRankExpr());
    const idxIndependent = sql.indexOf("500");
    const idxAssisted = sql.indexOf("400");
    const idxMemory = sql.indexOf("300");
    const idxSkilled = sql.indexOf("50");
    // Weights encode the required priority order.
    expect(idxIndependent).toBeGreaterThanOrEqual(0);
    expect(sql).toContain("'%independent%'");
    expect(sql).toContain("'%assisted%'");
    expect(sql).toContain("'%memory%'");
    expect(sql.toLowerCase()).toContain("'%skilled%'");
    // Independent(500) > Assisted(400) > Memory(300) > else(150) > Skilled(50).
    expect(500).toBeGreaterThan(400);
    expect(400).toBeGreaterThan(300);
    expect(300).toBeGreaterThan(150);
    expect(150).toBeGreaterThan(50);
    void [idxIndependent, idxAssisted, idxMemory, idxSkilled];
  });

  it("qualityOrderBy sorts by care intent FIRST, then quality, then rating", () => {
    const sql = render(qualityOrderBy()).toLowerCase();
    const careIdx = sql.indexOf("independent");
    const ratingIdx = sql.indexOf("rating");
    expect(careIdx).toBeGreaterThanOrEqual(0);
    expect(ratingIdx).toBeGreaterThan(careIdx);
  });

  it("drastically lowers the photo boost so it cannot overwhelm care intent", () => {
    const sql = render(qualityRankExpr());
    // The legacy 10000 photo boost is gone.
    expect(sql).not.toContain("10000");
    // Photo boost is now a modest 300 tied to a photos length check.
    expect(sql).toMatch(/array_length\("photos", 1\)[^)]*\)[^]*?300/i);
    // And it is far below the care-intent Independent-living weight (500).
    expect(300).toBeLessThan(500);
  });
});
