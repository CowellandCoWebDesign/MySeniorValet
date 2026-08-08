/**
 * @jest-environment node
 *
 * Task #483 — /api/directories/* must scope EVERY community query (rows and
 * counts) with the shared referral-support eligibility predicate. These tests
 * register the real route handlers on a real express app, feed fixture rows
 * through a captured drizzle chain, and assert the rendered WHERE clause of
 * every executed query embeds the shared predicate (and the HUD directory
 * opts into HUD explicitly).
 */
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import express from "express";
import request from "supertest";
import { PgDialect } from "drizzle-orm/pg-core";

// Capture every WHERE clause passed through the mocked db chain.
const capturedWheres: any[] = [];
let fixtureRows: any[] = [];

function chain(): any {
  const c: any = {
    select: () => c,
    from: () => c,
    where: (w: any) => {
      capturedWheres.push(w);
      return c;
    },
    groupBy: () => c,
    orderBy: () => c,
    limit: () => c,
    offset: () => c,
    then: (resolve: any, reject: any) => Promise.resolve(fixtureRows).then(resolve, reject),
  };
  return c;
}

jest.mock("../../server/db", () => ({
  db: { select: () => chain() },
}));

// Real drizzle SQL sentinel so and()/render work exactly as in production.
jest.mock("../../server/utils/community-ranking", () => {
  const { sql } = jest.requireActual("drizzle-orm") as typeof import("drizzle-orm");
  return {
    supportingEligibilityFilter: async (opts?: { includeHud?: boolean }) =>
      sql.raw(`ELIGIBILITY_SENTINEL_HUD_${opts?.includeHud ? "IN" : "OUT"}`),
  };
});

import { registerDirectoryRoutes } from "../../server/routes/directoryRoutes";

const dialect = new PgDialect();
const render = (frag: any) => dialect.sqlToQuery(frag).sql;

function buildApp() {
  const app = express();
  registerDirectoryRoutes(app);
  return app;
}

const APPROVED = { id: 1, name: "Oakmont of Redding", city: "Redding", state: "CA" };

describe("directory routes enforce shared referral eligibility", () => {
  let app: express.Express;

  beforeEach(() => {
    capturedWheres.length = 0;
    fixtureRows = [APPROVED];
    app = buildApp();
  });

  const nonHudCases: Array<{ path: string; queries: number }> = [
    { path: "/api/directories/by-state/CA", queries: 1 },
    { path: "/api/directories/by-city/Redding", queries: 1 },
    { path: "/api/directories/autocomplete?query=red", queries: 2 },
    { path: "/api/directories/canadian-communities", queries: 2 },
    { path: "/api/directories/mexican-communities", queries: 2 },
  ];

  for (const { path, queries } of nonHudCases) {
    it(`${path} applies the predicate (HUD excluded) to every query`, async () => {
      fixtureRows = path.includes("autocomplete") ? [] : [APPROVED];
      const res = await request(app).get(path);
      expect(res.status).toBe(200);
      expect(capturedWheres.length).toBeGreaterThanOrEqual(queries);
      for (const w of capturedWheres) {
        expect(render(w)).toContain("ELIGIBILITY_SENTINEL_HUD_OUT");
      }
    });
  }

  it("/api/directories/hud-communities keeps HUD rows but still requires eligibility", async () => {
    const res = await request(app).get("/api/directories/hud-communities");
    expect(res.status).toBe(200);
    expect(capturedWheres.length).toBeGreaterThanOrEqual(2);
    for (const w of capturedWheres) {
      const sqlText = render(w);
      expect(sqlText).toContain("ELIGIBILITY_SENTINEL_HUD_IN");
      expect(sqlText).toContain("hud_property_id");
    }
  });

  it("returns only the rows the predicate-scoped query yields (excluded/unapproved rows never reach the response)", async () => {
    // The DB — filtered by the predicate — yields only the approved fixture;
    // the endpoint must surface exactly that set.
    const res = await request(app).get("/api/directories/by-city/Redding");
    expect(res.status).toBe(200);
    expect(res.body.communities).toHaveLength(1);
    expect(res.body.communities[0].name).toBe("Oakmont of Redding");
    expect(res.body.count).toBe(1);
  });
});
