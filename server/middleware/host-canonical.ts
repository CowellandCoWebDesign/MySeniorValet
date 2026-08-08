import { Request, Response, NextFunction } from 'express';
import { whiteLabelService } from '../services/white-label.service';

/**
 * Host canonicalization middleware.
 *
 * The app answers on multiple hosts (apex domain, Replit deploy/preview hosts,
 * white-label custom domains). Without canonicalization, search engines index
 * the same content under several hosts, fragmenting crawl budget and ranking.
 *
 * In production, any non-canonical, non-exempt host is permanently redirected
 * (301) to the single canonical origin. Exemptions:
 *  - localhost / loopback
 *  - Replit dev / preview / deploy hosts (*.replit.dev, *.repl.co, *.replit.app)
 *  - the /health endpoint (used by platform health checks)
 *  - configured white-label custom domains (env allowlist + runtime registry)
 *
 * The canonical origin is the single source of truth, derived from SITE_URL
 * (defaulting to https://www.myseniorvalet.com). This same constant is used
 * everywhere SEO URLs are built so the Host header is never trusted.
 */
export const CANONICAL_BASE_URL = (process.env.SITE_URL || 'https://www.myseniorvalet.com').replace(/\/+$/, '');
export const CANONICAL_HOST = new URL(CANONICAL_BASE_URL).host.toLowerCase();

// Static white-label custom domains may be supplied via env (comma-separated).
const envWhiteLabelDomains = new Set(
  (process.env.WHITE_LABEL_DOMAINS || '')
    .split(',')
    .map(d => d.trim().toLowerCase())
    .filter(Boolean)
);

function isExemptHost(hostname: string): boolean {
  if (!hostname) return true;
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1'
  ) {
    return true;
  }
  // Replit dev / preview / deploy infrastructure hosts
  if (
    hostname.endsWith('.replit.dev') ||
    hostname.endsWith('.repl.co') ||
    hostname.endsWith('.replit.app') ||
    hostname.endsWith('.replit.co') ||
    hostname.endsWith('.kirk.replit.dev') ||
    hostname.endsWith('.janeway.replit.dev')
  ) {
    return true;
  }
  // White-label custom domains (env allowlist + runtime registry)
  if (envWhiteLabelDomains.has(hostname)) return true;
  if (whiteLabelService.isWhiteLabelDomain(hostname)) return true;
  return false;
}

export function hostCanonicalizationMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only canonicalize in production — dev/preview keep their own hosts.
    if (process.env.NODE_ENV !== 'production') return next();
    // Only safe, idempotent navigations get redirected (never POST/PUT/etc).
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    // Platform health checks must always succeed on any host.
    if (req.path === '/health') return next();

    const rawHost = (req.headers.host || '').toLowerCase();
    const hostname = rawHost.split(':')[0];

    if (!hostname || hostname === CANONICAL_HOST) return next();
    if (isExemptHost(hostname)) return next();

    return res.redirect(301, `${CANONICAL_BASE_URL}${req.originalUrl}`);
  };
}
