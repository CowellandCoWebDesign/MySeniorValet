/**
 * /api/image-proxy SSRF tests — the proxy must fail closed (4xx, NO upstream
 * fetch) for internal/private/link-local/metadata targets, including redirect
 * chains that hop from a public host to an internal one.
 */
import express from "express";
import request from "supertest";

const mockFetch = jest.fn();
jest.mock("node-fetch", () => ({
  __esModule: true,
  default: (...args: any[]) => mockFetch(...args),
}));

import imageProxyRouter from "../server/routes/imageProxy";

const app = express();
app.use(imageProxyRouter);

beforeEach(() => {
  mockFetch.mockReset();
});

describe("image proxy blocks internal targets without fetching", () => {
  const blockedTargets = [
    "http://127.0.0.1/secret.png",
    "http://localhost/secret.png",
    "http://localhost:5000/api/admin", // non-standard port AND localhost
    "https://169.254.169.254/latest/meta-data/", // cloud metadata
    "http://10.0.0.5/photo.jpg",
    "http://172.16.0.1/photo.jpg",
    "http://192.168.1.10/cam.jpg",
    "http://100.64.0.1/x.jpg", // CGNAT
    "http://0.0.0.0/x.jpg",
    "http://[::1]/x.jpg", // IPv6 loopback
    "http://[fe80::1]/x.jpg", // IPv6 link-local
    "http://[fd00::1]/x.jpg", // IPv6 ULA
    "http://internal-api.local/x.jpg",
    "http://db.internal/x.jpg",
    "http://example.com:8080/x.jpg", // non-standard port
  ];

  it.each(blockedTargets)("blocks %s with 403 and never fetches", async (target) => {
    const res = await request(app)
      .get("/api/image-proxy")
      .query({ url: target });
    expect(res.status).toBe(403);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("rejects non-http(s) schemes without fetching", async () => {
    const res = await request(app)
      .get("/api/image-proxy")
      .query({ url: "ftp://example.com/x.jpg" });
    expect([400, 403]).toContain(res.status);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe("image proxy blocks redirect-to-internal chains", () => {
  it("fails closed when a public host redirects to a private target", async () => {
    // Public IP literal (no DNS needed) that answers with a redirect into the
    // cloud metadata endpoint — the second hop must be blocked BEFORE fetching.
    mockFetch.mockResolvedValueOnce({
      status: 302,
      ok: false,
      headers: { get: (h: string) => (h.toLowerCase() === "location" ? "http://169.254.169.254/latest/meta-data/" : null) },
    });

    const res = await request(app)
      .get("/api/image-proxy")
      .query({ url: "http://93.184.216.34/image.jpg" });

    expect(res.status).toBe(403);
    expect(mockFetch).toHaveBeenCalledTimes(1); // first hop only; internal hop never fetched
    const fetchedUrl = mockFetch.mock.calls[0][0];
    expect(fetchedUrl).toBe("http://93.184.216.34/image.jpg");
    // Manual redirect handling — the fetch itself must not auto-follow.
    expect(mockFetch.mock.calls[0][1]?.redirect).toBe("manual");
  });

  it("fails closed when a redirect hops to localhost", async () => {
    mockFetch.mockResolvedValueOnce({
      status: 301,
      ok: false,
      headers: { get: (h: string) => (h.toLowerCase() === "location" ? "http://127.0.0.1:80/internal" : null) },
    });

    const res = await request(app)
      .get("/api/image-proxy")
      .query({ url: "http://93.184.216.34/image.jpg" });

    expect(res.status).toBe(403);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("still serves images from safe public targets", async () => {
    const pngByte = Buffer.from([0x89]);
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      headers: { get: (h: string) => (h.toLowerCase() === "content-type" ? "image/png" : null) },
      arrayBuffer: async () => pngByte.buffer.slice(0, 1),
    });

    const res = await request(app)
      .get("/api/image-proxy")
      .query({ url: "http://93.184.216.34/image.png" });

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("image/png");
  });
});
