import fs from "fs";
import path from "path";

const source = fs.readFileSync(
  path.resolve(process.cwd(), "server/routes/communityRoutes.ts"),
  "utf8",
);

function routeBody(startMarker: string, endMarker: string): string {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  return source.slice(start, end);
}

describe("public community route policy", () => {
  it("gates pricing prediction by row-level referral eligibility", () => {
    const body = routeBody(
      'app.get("/api/communities/:id/pricing-prediction"',
      "// AI-powered community matching",
    );
    expect(body).toContain("isCommunitySupportingEligible(communityId)");
    expect(body).toContain('status(404)');
  });

  it("filters every AI match before returning it", () => {
    const body = routeBody(
      'app.post("/api/communities/ai-match"',
      "app.post(\"/api/communities/:id/verify\"",
    );
    expect(body).toContain("isCommunitySupportingEligible");
    expect(body).toContain("matches: eligibleMatches");
  });

  it("gates HUD listings and HUD/pricing aggregate queries", () => {
    const hudCount = routeBody(
      'app.get("/api/communities/hud-count"',
      "// Get comprehensive pricing coverage statistics",
    );
    const pricingCoverage = routeBody(
      'app.get("/api/communities/pricing-coverage"',
      "// Intelligent Pricing Prediction endpoint",
    );
    expect(hudCount).toContain("publicVisibleFilter({ includeHud: true })");
    expect(pricingCoverage.match(/publicVisibleFilter\(\{ includeHud: true \}\)/g)?.length).toBeGreaterThanOrEqual(3);

    const firstHud = routeBody(
      'app.get("/api/communities/hud-featured"',
      "// Trending communities",
    );
    const secondHudStart = source.lastIndexOf('app.get("/api/communities/hud-featured"');
    const secondHudEnd = source.indexOf("// Trending communities", secondHudStart);
    const secondHud = source.slice(secondHudStart, secondHudEnd);
    expect(firstHud).toContain("publicVisibleFilter({ includeHud: true })");
    expect(secondHud).toContain("publicVisibleFilter({ includeHud: true })");
  });

  it("gates the public verify endpoint by referral eligibility", () => {
    const body = routeBody(
      'app.post("/api/communities/:id/verify"',
      "// Get community details first",
    );
    expect(body).toContain("isCommunitySupportingEligible(communityId)");
    expect(body).toContain("status(404)");
  });
});

describe("public ID-based community endpoints in other route files", () => {
  const cases: Array<{ file: string; route: string; expectFilter?: boolean }> = [
    { file: "server/routes/searchRoutes.ts", route: "'/api/market-pricing/:communityId'" },
    { file: "server/routes/reviewRoutes.ts", route: "'/api/communities/:communityId/reviews'" },
    { file: "server/routes/reviewRoutes.ts", route: "'/api/communities/:communityId/inspections/fetch'" },
    { file: "server/routes/reviewRoutes.ts", route: "'/api/communities/:communityId/reviews/fetch-external'" },
    { file: "server/routes/pricingRoutes.ts", route: "'/api/pricing/community/:communityId'" },
    { file: "server/routes/pricingRoutes.ts", route: "'/api/pricing/transparency/:communityId'" },
    { file: "server/routes/seo-community-urls.ts", route: "'/api/communities/:id/seo-url'" },
    { file: "server/routes/platformRoutes.ts", route: "'/api/communities/:id/similar'", expectFilter: true },
    { file: "server/routes/perplexityRoutes.ts", route: "'/api/ai/enhance-community/:id'" },
  ];

  const filterCases: Array<{ file: string; minCount?: number }> = [
    { file: "server/routes/semanticSearchRoutes.ts" },
    { file: "server/routes/naturalLanguageSearch.ts" },
    { file: "server/routes/seo-location-pages.ts", minCount: 3 },
  ];

  for (const { file, minCount } of filterCases) {
    it(`${file} scopes community queries with the shared eligibility predicate`, () => {
      const src = fs.readFileSync(path.resolve(process.cwd(), file), "utf8");
      const uses = src.match(/supportingEligibilityFilter\(/g)?.length ?? 0;
      expect(uses).toBeGreaterThanOrEqual(minCount ?? 1);
      // The old active/hidden-only public predicate must be gone from these files.
      expect(src).not.toMatch(/conditions\.push\(sql`\$\{communities\.isActive\} = true`\)/);
    });
  }

  for (const { file, route, expectFilter } of cases) {
    it(`${file} ${route} enforces referral eligibility`, () => {
      const src = fs.readFileSync(path.resolve(process.cwd(), file), "utf8");
      const start = src.indexOf(route);
      expect(start).toBeGreaterThanOrEqual(0);
      const body = src.slice(start, start + 2000);
      expect(body).toContain("isCommunitySupportingEligible");
      expect(body).toContain("404");
      if (expectFilter) {
        // Similar-communities list results are also filtered by the shared predicate.
        expect(body).toContain("supportingEligibilityFilter()");
      }
    });
  }
});