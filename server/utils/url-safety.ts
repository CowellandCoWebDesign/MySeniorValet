/**
 * Shared SSRF guard — validates that a URL is safe for the SERVER to fetch.
 *
 * Blocks: non-http(s) schemes, non-standard ports, localhost/.local/.internal
 * hosts, loopback, RFC1918 private ranges, link-local (169.254.x — cloud
 * metadata), CGNAT (100.64/10), multicast/reserved, and their IPv6 equivalents
 * (::1, fe80::/10, fc00::/7, ff00::/8, IPv4-mapped). Hostnames are DNS-resolved
 * and EVERY resolved address must be public.
 *
 * IMPORTANT: redirects can hop to an internal host, so callers that follow
 * redirects must re-validate each hop with this guard (use manual redirects).
 */
import { isIP } from "net";
import { lookup } from "dns/promises";

export async function isSafePublicUrl(rawUrl: string): Promise<boolean> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
  const port = parsed.port ? parseInt(parsed.port, 10) : parsed.protocol === "https:" ? 443 : 80;
  if (port !== 80 && port !== 443) return false;

  const host = parsed.hostname.toLowerCase();
  if (!host || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return false;

  if (isIP(host)) return !isPrivateIp(host);

  try {
    const addresses = await lookup(host, { all: true });
    if (!addresses.length) return false;
    return addresses.every((a) => !isPrivateIp(a.address));
  } catch {
    return false;
  }
}

export function isPrivateIp(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) {
    const p = ip.split(".").map(Number);
    if (p.length !== 4 || p.some((n) => isNaN(n) || n < 0 || n > 255)) return true;
    const [a, b] = p;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a >= 224) return true;
    return false;
  }
  if (v === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "::") return true;
    const mapped = lower.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIp(mapped[1]);
    if (/^fe[89ab]/.test(lower)) return true;
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    if (lower.startsWith("ff")) return true;
    return false;
  }
  return true;
}
