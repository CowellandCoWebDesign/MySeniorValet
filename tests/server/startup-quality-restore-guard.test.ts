/**
 * Source guard for the STRICT-SUBSET guarantee of the startup auto-restore in
 * server/run-migration.ts (runStartupQualityRestore). The behavioral DB test
 * lives in server/scripts/test-startup-quality-restore.ts (jest cannot run
 * DB-backed tests in this repo); this guard makes sure nobody silently removes
 * the exclusions that keep the raw-SQL restore a strict subset of
 * evaluateCommunity's keep-public policy.
 */
import * as fs from "fs";
import * as path from "path";

const src = fs.readFileSync(
  path.join(__dirname, "../../server/run-migration.ts"),
  "utf8",
);

describe("runStartupQualityRestore SQL keeps its strict-subset exclusions", () => {
  it("excludes test/demo/sample/placeholder/e2e names (looksLikeTestData mirror)", () => {
    expect(src).toMatch(/name !~\* '\\\\m\(test\|demo\|sample\|placeholder\|e2e\)\\\\M'/);
    expect(src).toContain("do not use");
  });

  it("excludes test website hosts", () => {
    for (const host of ["example\\\\.(com|org|net)", "test\\\\.com", "localhost", "myseniorvalet\\\\.com", "placeholder"]) {
      expect(src).toContain(host);
    }
  });

  it("excludes the auto-detected test_data_suspected flag", () => {
    expect(src).toContain("test_data_suspected");
  });

  it("requires a real (≥100 chars, non-boilerplate) description", () => {
    expect(src).toContain(">= 100");
    expect(src).toContain("quality senior living community in ");
    expect(src).toContain("hud section 202");
  });

  it("still excludes protective flags via the imported list", () => {
    expect(src).toContain("PROTECTIVE_FLAG_LIST");
  });
});
