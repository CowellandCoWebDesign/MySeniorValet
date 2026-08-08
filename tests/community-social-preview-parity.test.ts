/**
 * Social-preview drift guard for community pages.
 *
 * Community URLs are served identical metadata by three server paths:
 *  - crawler SSR (server/seo-ssr-middleware.ts)
 *  - all-UA shell injection (injectCommunityMetaIntoShell)
 *  - social-crawler middleware (injectMetaTags), which must DELEGATE to the
 *    shared builders in server/seo/community-seo.ts.
 *
 * This test asserts that fetching a community URL through injectMetaTags with
 * a social-crawler UA (facebookexternalhit) and with a normal browser UA
 * yields byte-identical HTML to injectCommunityMetaIntoShell — same title,
 * canonical, og: tags — with no hreflang. It also source-guards
 * server/middleware/seo-meta-tags.ts so nobody can re-add a per-UA community
 * metadata branch or hreflang there.
 */
import fs from 'fs';
import path from 'path';

// community-seo imports server/db, which throws without DATABASE_URL and
// opens a real pool — mock it with a chainable query builder we control.
const mockRows: any[] = [];
jest.mock('../server/db', () => {
  const chain: any = {
    select: () => chain,
    from: () => chain,
    where: () =>
      Object.assign(Promise.resolve([...mockRows]), {
        limit: () => Promise.resolve([...mockRows]),
      }),
  };
  return { db: chain, pool: { query: jest.fn() } };
});

import { injectCommunityMetaIntoShell } from '../server/seo/community-seo';
import { injectMetaTags } from '../server/middleware/seo-meta-tags';

const SHELL_PATH = path.resolve(process.cwd(), 'client', 'index.html');
const shellHtml = fs.readFileSync(SHELL_PATH, 'utf-8');

const community = {
  id: 123,
  name: 'Sunny Pines',
  city: 'Springfield',
  state: 'IL',
  stateSlug: 'il',
  citySlug: 'springfield',
  slug: 'sunny-pines',
  address: '100 Main St',
  zipCode: '62701',
  country: 'US',
  phone: '(555) 123-4567',
  careTypes: ['assisted_living', 'memory_care'],
  photos: ['https://example.com/photo1.jpg'],
  rentPerMonth: '3835',
  priceRange: null,
  pricingLastUpdated: new Date('2026-01-15T00:00:00Z'),
  description: 'A lovely community.',
  enrichedContent: null,
  latitude: '39.78',
  longitude: '-89.65',
  updatedAt: new Date('2026-06-01T00:00:00Z'),
  isHidden: false,
  isActive: true,
  website: 'https://sunnypines.example.com',
};

const SOCIAL_UA =
  'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

/** Run the social-crawler middleware and capture what it sends. */
async function runInjectMetaTags(reqPath: string, userAgent: string): Promise<{ html: string | null; nextCalled: boolean }> {
  let sent: string | null = null;
  let nextCalled = false;
  const req: any = {
    accepts: () => true,
    get: (h: string) => (h.toLowerCase() === 'user-agent' ? userAgent : undefined),
    path: reqPath,
    url: reqPath,
    originalUrl: reqPath,
  };
  const res: any = {
    status: () => res,
    set: () => res,
    send: (html: string) => {
      sent = html;
      return res;
    },
  };
  await injectMetaTags(req, res, () => {
    nextCalled = true;
  });
  return { html: sent, nextCalled };
}

function extract(html: string) {
  return {
    title: (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1],
    canonical: (html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/) || [])[1],
    ogTags: (html.match(/<meta[^>]*property="og:[^>]*>/g) || []).sort(),
    description: (html.match(/<meta[^>]*name="description"[^>]*>/) || [])[0],
  };
}

const COMMUNITY_URLS = [
  '/community/123',
  '/senior-living/il/springfield/sunny-pines',
];

describe('community social-preview parity (no per-UA drift)', () => {
  const origEnv = process.env.NODE_ENV;

  beforeAll(() => {
    // injectMetaTags reads client/index.html only in development mode.
    process.env.NODE_ENV = 'development';
    mockRows.length = 0;
    mockRows.push(community);
  });

  afterAll(() => {
    process.env.NODE_ENV = origEnv;
  });

  it.each(COMMUNITY_URLS)(
    '%s: social-crawler UA, browser UA, and shell injection all yield identical metadata',
    async (url) => {
      const direct = await injectCommunityMetaIntoShell(url, shellHtml);
      expect(direct).toBeTruthy();

      const social = await runInjectMetaTags(url, SOCIAL_UA);
      const browser = await runInjectMetaTags(url, BROWSER_UA);
      expect(social.html).toBeTruthy();
      expect(browser.html).toBeTruthy();
      expect(social.nextCalled).toBe(false);
      expect(browser.nextCalled).toBe(false);

      // Byte-identical HTML across all three paths — no per-UA metadata at all.
      expect(social.html).toBe(direct);
      expect(browser.html).toBe(direct);

      // Explicitly assert the tags that social previews consume.
      const d = extract(direct!);
      const s = extract(social.html!);
      const b = extract(browser.html!);
      expect(d.title).toContain('Sunny Pines');
      expect(s.title).toBe(d.title);
      expect(b.title).toBe(d.title);
      expect(d.canonical).toContain('/senior-living/il/springfield/sunny-pines');
      expect(s.canonical).toBe(d.canonical);
      expect(b.canonical).toBe(d.canonical);
      expect(d.ogTags.length).toBeGreaterThan(0);
      expect(s.ogTags).toEqual(d.ogTags);
      expect(b.ogTags).toEqual(d.ogTags);
      expect(s.description).toBe(d.description);
      expect(b.description).toBe(d.description);

      // No hreflang alternates on community pages, for any UA.
      expect(direct).not.toMatch(/hreflang/i);
      expect(social.html).not.toMatch(/hreflang/i);
      expect(browser.html).not.toMatch(/hreflang/i);
    }
  );

  it('unresolvable community URLs fall through to next() (visibility guard 404/410s upstream)', async () => {
    mockRows.length = 0; // no matching community
    try {
      const miss = await runInjectMetaTags('/community/999999', SOCIAL_UA);
      expect(miss.html).toBeNull();
      expect(miss.nextCalled).toBe(true);
    } finally {
      mockRows.push(community);
    }
  });
});

describe('source guard: seo-meta-tags.ts must never build community metadata itself', () => {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'server', 'middleware', 'seo-meta-tags.ts'),
    'utf-8'
  );

  it('contains no hreflang emission', () => {
    expect(src).not.toMatch(/hreflang/i);
  });

  it('delegates community URLs to the shared builders (injectCommunityMetaIntoShell)', () => {
    expect(src).toContain("from '../seo/community-seo'");
    expect(src).toContain('injectCommunityMetaIntoShell(');
  });

  it('getPageMetadata has no community-detail branch (no per-UA community metadata)', () => {
    const start = src.indexOf('async function getPageMetadata');
    const end = src.indexOf('export async function injectMetaTags');
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    // Strip line comments — only actual code counts as a violation.
    const body = src
      .slice(start, end)
      .split('\n')
      .map((l) => l.replace(/^\s*\/\/.*$/, ''))
      .join('\n');
    // No community-detail routing inside the generic metadata builder. If you
    // need community metadata, use server/seo/community-seo.ts — see the NOTE
    // at the top of getPageMetadata.
    expect(body).not.toMatch(/section\s*===\s*['"]community['"]/);
    expect(body).not.toMatch(/\/senior-living\//);
    expect(body).not.toMatch(/\\\/community\\\//); // no /community/:id regex matching
    expect(body).not.toContain('injectCommunityMetaIntoShell');
  });
});
