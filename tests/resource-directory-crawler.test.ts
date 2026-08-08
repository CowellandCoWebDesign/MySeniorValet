/**
 * Crawler-path integration test for the baked Senior Resource Directory.
 *
 * The social/search crawler middleware (createSEOMiddleware → injectMetaTags)
 * runs BEFORE the Vite/static shell injector and used to serve generic
 * "resource center" metadata for /senior-resources with a
 * /senior-resources-center canonical. It must instead delegate to the shared
 * baked-directory injector so crawlers get exactly one self-canonical and the
 * full baked listing HTML — the same output every other visitor receives.
 */

// The baked service falls back to curated-only data when the DB is
// unavailable; disable the DB entirely so this test stays hermetic.
jest.mock("../server/db", () => ({
  db: new Proxy(
    {},
    {
      get: () => () => {
        throw new Error("db disabled in tests");
      },
    },
  ),
  pool: {},
}));

import type { Request, Response } from "express";
import { injectMetaTags, isSocialMediaCrawler } from "../server/middleware/seo-meta-tags";
import { RESOURCE_DIRECTORY_PAYLOAD_ID } from "../server/seo/resource-directory-seo";

function crawlerRequest(path: string, userAgent: string): Request {
  return {
    accepts: (type: string) => type === "html",
    get: (h: string) => (h.toLowerCase() === "user-agent" ? userAgent : undefined),
    path,
    url: path,
    originalUrl: path,
  } as unknown as Request;
}

function captureResponse() {
  const captured: { status?: number; body?: string; headers?: Record<string, string> } = {};
  const res = {
    status(code: number) {
      captured.status = code;
      return this;
    },
    set(headers: Record<string, string>) {
      captured.headers = headers;
      return this;
    },
    send(body: string) {
      captured.body = body;
      return this;
    },
  } as unknown as Response;
  return { res, captured };
}

describe("crawler requests to /senior-resources", () => {
  const prevEnv = process.env.NODE_ENV;

  beforeAll(() => {
    // Point injectMetaTags at client/index.html (the dev shell in this repo).
    process.env.NODE_ENV = "development";
  });

  afterAll(() => {
    process.env.NODE_ENV = prevEnv;
  });

  it("search/social crawler UAs are intercepted by the SEO middleware", () => {
    expect(isSocialMediaCrawler("Googlebot/2.1 (+http://www.google.com/bot.html)")).toBe(true);
    expect(isSocialMediaCrawler("facebookexternalhit/1.1")).toBe(true);
  });

  it("serves the baked directory with exactly one self-canonical (not the center canonical)", async () => {
    const { res, captured } = captureResponse();
    const next = jest.fn();

    await injectMetaTags(crawlerRequest("/senior-resources", "Googlebot/2.1"), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(captured.status).toBe(200);
    const html = captured.body!;

    const canonicals = html.match(/rel="canonical"/g) || [];
    expect(canonicals).toHaveLength(1);
    expect(html).toMatch(/rel="canonical" href="https:\/\/[^"]+\/senior-resources"/);
    expect(html).not.toContain("/senior-resources-center\"");

    // Exactly one title, and it is the directory's — not the center's.
    expect(html.match(/<title>/g)).toHaveLength(1);
    expect(html).toContain("Senior Resource Directory");

    // Baked listing content is present in the raw HTML.
    expect(html).toContain("PSA 2 Area Agency on Aging");
    expect(html).toContain("Dial 2-1-1");
    expect(html).toContain(`<script id="${RESOURCE_DIRECTORY_PAYLOAD_ID}" type="application/json">`);
  });

  it("still serves hub metadata (center canonical) for /senior-resources-center", async () => {
    const { res, captured } = captureResponse();
    const next = jest.fn();

    await injectMetaTags(crawlerRequest("/senior-resources-center", "facebookexternalhit/1.1"), res, next);

    expect(next).not.toHaveBeenCalled();
    const html = captured.body!;
    expect(html).toMatch(/rel="canonical" href="https:\/\/[^"]+\/senior-resources-center"/);
    expect(html).not.toContain(RESOURCE_DIRECTORY_PAYLOAD_ID);
  });
});
