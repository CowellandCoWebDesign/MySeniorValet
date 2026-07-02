/**
 * SSRF guard tests — the server must NEVER fetch private/internal targets when
 * probing stored photo URLs (photo-liveness) or scraping (free-enrichment).
 */
import { isSafePublicUrl, isPrivateIp } from "../server/utils/url-safety";

jest.mock("../server/db", () => ({ db: {} }));

describe("isPrivateIp", () => {
  const privateIps = [
    "127.0.0.1",
    "0.0.0.0",
    "10.0.0.1",
    "10.255.255.255",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.0.1",
    "192.168.255.255",
    "169.254.169.254", // cloud metadata
    "100.64.0.1", // CGNAT
    "224.0.0.1", // multicast
    "255.255.255.255",
    "::1",
    "::",
    "fe80::1", // IPv6 link-local
    "fc00::1", // IPv6 ULA
    "fd12:3456::1",
    "ff02::1", // IPv6 multicast
    "::ffff:10.0.0.1", // IPv4-mapped private
    "::ffff:169.254.169.254",
  ];
  it.each(privateIps)("blocks %s", (ip) => {
    expect(isPrivateIp(ip)).toBe(true);
  });

  const publicIps = ["93.184.216.34", "8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"];
  it.each(publicIps)("allows %s", (ip) => {
    expect(isPrivateIp(ip)).toBe(false);
  });
});

describe("isSafePublicUrl", () => {
  const blocked = [
    "http://127.0.0.1/image.jpg",
    "http://127.0.0.1:80/image.jpg",
    "https://169.254.169.254/latest/meta-data/",
    "http://10.0.0.5/photo.png",
    "http://172.16.0.1/photo.png",
    "http://172.31.99.99/photo.png",
    "http://192.168.1.10/cam.jpg",
    "http://100.64.0.1/x.jpg",
    "http://0.0.0.0/x.jpg",
    "http://[::1]/x.jpg",
    "http://[fe80::1]/x.jpg",
    "http://[fd00::1]/x.jpg",
    "http://localhost/x.jpg",
    "http://internal-api.local/x.jpg",
    "http://db.internal/x.jpg",
    "ftp://example.com/x.jpg", // scheme
    "file:///etc/passwd", // scheme
    "http://example.com:8080/x.jpg", // non-standard port
    "https://example.com:8443/x.jpg", // non-standard port
    "not a url",
    "",
  ];
  it.each(blocked)("blocks %s", async (url) => {
    await expect(isSafePublicUrl(url)).resolves.toBe(false);
  });

  it("allows a public IP literal on a standard port", async () => {
    await expect(isSafePublicUrl("http://93.184.216.34/image.jpg")).resolves.toBe(true);
    await expect(isSafePublicUrl("https://93.184.216.34/image.jpg")).resolves.toBe(true);
  });
});

describe("photo liveness probe never fetches internal targets", () => {
  it("keeps internal URLs as unknown without any network call and never persist-removes them", async () => {
    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockImplementation(() => {
        throw new Error("fetch must not be called for SSRF-unsafe URLs");
      });
    try {
      const { filterLivePhotoUrls } = await import("../server/utils/photo-liveness");
      const internal = [
        "http://169.254.169.254/latest/meta-data/iam",
        "http://192.168.1.10/camera/live.jpg",
        "http://10.0.0.5/internal/photo.png",
      ];
      const result = await filterLivePhotoUrls(internal);
      // Not fetched…
      expect(fetchSpy).not.toHaveBeenCalled();
      // …not confirmed dead (so never persisted as removals)…
      expect(result.confirmedDead).toEqual([]);
      // …and treated as inconclusive (kept, display-only).
      expect(result.live).toEqual(internal);
    } finally {
      fetchSpy.mockRestore();
    }
  });
});
