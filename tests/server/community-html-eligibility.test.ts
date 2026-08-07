import { describe, it, expect, jest, beforeEach } from "@jest/globals";

const rows: any[] = [];
const eligible = jest.fn(async (_id: number) => true);
const slugLookup = jest.fn(async () => null as any);

jest.mock("../../server/db", () => {
  const chain: any = {
    select: () => chain,
    from: () => chain,
    where: () => chain,
    limit: async () => [...rows],
  };
  return { db: chain };
});

jest.mock("../../server/utils/community-ranking", () => ({
  isCommunitySupportingEligible: (id: number) => eligible(id),
}));

jest.mock("../../server/seo/community-seo", () => ({
  findCommunityBySlugUrl: (...args: any[]) => slugLookup(...args),
  isCommunityGone: (community: any) =>
    community?.isHidden === true || community?.isActive === false,
  resolveDuplicateCanonicalUrl: jest.fn(async () => null),
  buildCommunityPricing: jest.fn(() => null),
  communityBreadcrumbs: jest.fn(() => []),
  breadcrumbJsonLd: jest.fn(() => ({})),
  breadcrumbHtml: jest.fn(() => ""),
  communityStructuredData: jest.fn(() => ({})),
  escapeHtml: (value: string) => value,
  safeHttpUrl: (value: string) => value,
  safeJsonLd: (value: any) => JSON.stringify(value),
}));

import { communityVisibilityGuard, seoSSRMiddleware } from "../../server/seo-ssr-middleware";

function responseCapture() {
  const capture: any = { statusCode: 200, body: "", headers: {} };
  capture.status = (code: number) => {
    capture.statusCode = code;
    return capture;
  };
  capture.set = (name: string, value: string) => {
    capture.headers[name] = value;
    return capture;
  };
  capture.send = (body: string) => {
    capture.body = body;
    return capture;
  };
  return capture;
}

beforeEach(() => {
  rows.splice(0, rows.length);
  eligible.mockReset();
  eligible.mockResolvedValue(true);
  slugLookup.mockReset();
  slugLookup.mockResolvedValue(null);
});

describe("community HTML referral eligibility", () => {
  it("returns a noindex 404 for an unapproved ID URL to a regular browser", async () => {
    rows.push({ id: 99, isHidden: false, isActive: true });
    eligible.mockResolvedValue(false);
    const req: any = { path: "/community/99" };
    const res = responseCapture();
    const next = jest.fn();

    await communityVisibilityGuard()(req, res, next);

    expect(res.statusCode).toBe(404);
    expect(res.headers["X-Robots-Tag"]).toBe("noindex, follow");
    expect(next).not.toHaveBeenCalled();
  });

  it("allows an approved ID URL through for a regular browser", async () => {
    rows.push({ id: 99, isHidden: false, isActive: true });
    const req: any = { path: "/community/99" };
    const res = responseCapture();
    const next = jest.fn();

    await communityVisibilityGuard()(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("returns a noindex 404 for an unapproved canonical slug URL", async () => {
    slugLookup.mockResolvedValue({ id: 101, isHidden: false, isActive: true });
    eligible.mockResolvedValue(false);
    const req: any = { path: "/senior-living/ca/redding/unapproved-home" };
    const res = responseCapture();
    const next = jest.fn();

    await communityVisibilityGuard()(req, res, next);

    expect(eligible).toHaveBeenCalledWith(101);
    expect(res.statusCode).toBe(404);
    expect(next).not.toHaveBeenCalled();
  });

  it("blocks crawler SSR for an unapproved ID before HTML generation/cache serving", async () => {
    rows.push({
      id: 99,
      isHidden: false,
      isActive: true,
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    });
    eligible.mockResolvedValue(false);
    const req: any = {
      path: "/community/99",
      query: {},
      headers: { "user-agent": "Googlebot/2.1" },
      get: (name: string) => name.toLowerCase() === "user-agent" ? "Googlebot/2.1" : undefined,
    };
    const res = responseCapture();
    const next = jest.fn();

    await seoSSRMiddleware()(req, res, next);

    expect(res.statusCode).toBe(404);
    expect(res.headers["X-Robots-Tag"]).toBe("noindex, follow");
    expect(next).not.toHaveBeenCalled();
  });

  it("blocks crawler SSR for an unapproved canonical slug before cache serving", async () => {
    const community = {
      id: 101,
      isHidden: false,
      isActive: true,
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    };
    slugLookup.mockResolvedValue(community);
    eligible.mockResolvedValue(false);
    const req: any = {
      path: "/senior-living/ca/redding/unapproved-home",
      query: {},
      headers: { "user-agent": "Googlebot/2.1" },
      get: (name: string) => name.toLowerCase() === "user-agent" ? "Googlebot/2.1" : undefined,
    };
    const res = responseCapture();
    const next = jest.fn();

    await seoSSRMiddleware()(req, res, next);

    expect(eligible).toHaveBeenCalledWith(101);
    expect(res.statusCode).toBe(404);
    expect(res.headers["X-Robots-Tag"]).toBe("noindex, follow");
    expect(next).not.toHaveBeenCalled();
  });
});