/**
 * Request context capture helpers.
 *
 * Used to enrich admin notifications (e.g. "New User Registration") with REAL
 * context about how/where an action happened. Per the Golden Data Rule, these
 * helpers never fabricate values — anything not present on the request resolves
 * to "Unknown".
 */
import type { Request } from 'express';

export interface CapturedRequestContext {
  ipAddress: string;
  referrer: string;
  userAgentRaw: string;
  device: string; // friendly "Browser on OS (Device)" string
  acceptLanguage: string;
}

/**
 * Parse a raw User-Agent string into a friendly "Browser on OS (Device)" label.
 * Intentionally dependency-free and best-effort; returns "Unknown" for empty UA.
 */
export function parseUserAgent(ua?: string | null): string {
  if (!ua || !ua.trim()) return 'Unknown';
  const s = ua;

  // Operating system
  let os = 'Unknown OS';
  if (/Windows NT 10/.test(s)) os = 'Windows 10/11';
  else if (/Windows NT/.test(s)) os = 'Windows';
  else if (/iPad/.test(s)) os = 'iPadOS';
  else if (/iPhone|iPod/.test(s)) os = 'iOS';
  else if (/Android/.test(s)) os = 'Android';
  else if (/Mac OS X|Macintosh/.test(s)) os = 'macOS';
  else if (/CrOS/.test(s)) os = 'ChromeOS';
  else if (/Linux/.test(s)) os = 'Linux';

  // Browser (order matters: Edge/Opera masquerade as Chrome)
  let browser = 'Unknown browser';
  if (/Edg(A|iOS)?\//.test(s)) browser = 'Edge';
  else if (/OPR\/|Opera/.test(s)) browser = 'Opera';
  else if (/SamsungBrowser/.test(s)) browser = 'Samsung Internet';
  else if (/Firefox\/|FxiOS/.test(s)) browser = 'Firefox';
  else if (/Chrome\/|CriOS/.test(s)) browser = 'Chrome';
  else if (/Safari\//.test(s) && /Version\//.test(s)) browser = 'Safari';

  // Device type
  let device = 'Desktop';
  if (/iPad|Tablet/.test(s)) device = 'Tablet';
  else if (/Mobile|iPhone|iPod|Android.*Mobile/.test(s)) device = 'Mobile';

  return `${browser} on ${os} (${device})`;
}

/**
 * Resolve the originating client IP, respecting the x-forwarded-for chain set
 * by Replit's proxy (trust proxy is enabled). Falls back to req.ip / socket.
 */
export function getClientIp(req: Request): string {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.trim()) {
    return xff.split(',')[0].trim();
  }
  if (Array.isArray(xff) && xff.length) {
    return String(xff[0]).split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'Unknown';
}

/**
 * Capture server-side request metadata in one shot. All fields default to
 * "Unknown" when the corresponding header is absent.
 */
export function captureRequestContext(req: Request): CapturedRequestContext {
  const ua = (req.headers['user-agent'] as string) || '';
  const referrer =
    (req.headers['referer'] as string) ||
    (req.headers['referrer'] as string) ||
    '';

  return {
    ipAddress: getClientIp(req) || 'Unknown',
    referrer: referrer || 'Unknown',
    userAgentRaw: ua || 'Unknown',
    device: parseUserAgent(ua),
    acceptLanguage: (req.headers['accept-language'] as string) || 'Unknown',
  };
}

export interface AdminDetailRow {
  label: string;
  value: string;
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Render labeled rows as a scannable HTML table, consistent with other admin
 * notification emails (light borders, label/value columns).
 */
export function renderAdminDetailTable(rows: AdminDetailRow[]): string {
  const body = rows
    .map(
      (r) => `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 600; white-space: nowrap; vertical-align: top;">${escapeHtml(
                  r.label
                )}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${escapeHtml(
                  r.value
                )}</td>
              </tr>`
    )
    .join('');

  return `
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tbody>${body}
              </tbody>
            </table>`;
}

/**
 * Plain-text equivalent of the detail table for email text/part fallback.
 */
export function renderAdminDetailText(rows: AdminDetailRow[]): string {
  return rows.map((r) => `${r.label}: ${r.value}`).join('\n');
}

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  family: 'Family Member',
  user: 'Family Member',
  community: 'Community Manager',
  vendor: 'Vendor',
  admin: 'Administrator',
  super_admin: 'Super Administrator',
};

export function formatAccountType(accountType?: string | null): string {
  if (!accountType) return 'Unknown';
  return ACCOUNT_TYPE_LABELS[accountType] || accountType;
}

const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  fr: 'French',
  es: 'Spanish',
};

/**
 * Friendly locale label. Accepts app toggle codes ('en'/'fr'/'es') or raw
 * Accept-Language values; returns "Unknown" for empty input.
 */
export function formatLocale(locale?: string | null): string {
  if (!locale || !locale.trim()) return 'Unknown';
  const primary = locale.split(',')[0].trim().toLowerCase();
  const base = primary.split('-')[0];
  if (LOCALE_LABELS[base]) {
    return primary === base
      ? LOCALE_LABELS[base]
      : `${LOCALE_LABELS[base]} (${locale})`;
  }
  return locale;
}
