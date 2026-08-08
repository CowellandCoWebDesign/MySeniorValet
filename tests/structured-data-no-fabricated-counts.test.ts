/**
 * Regression test for Task 420: fabricated community counts must never
 * appear in search-engine structured data (JSON-LD) or SEO metadata again.
 *
 * Covers the server-side generator plus a repository-wide scan of every
 * client source file that emits SEO surfaces (Helmet, JSON-LD scripts,
 * document.title, useSEO, SEOMetaTags) and the static index.html shell.
 */
import fs from 'fs';
import path from 'path';
import {
  generateDirectorySchema,
  generateLocationSchema,
} from '../server/seo/structured-data-generator';

// Known fabricated/stale counts that previously shipped to Google
const FABRICATED_COUNT_PATTERNS: RegExp[] = [
  /33,?500/,          // "33,500+" global count
  /35,?264/,          // stale global count from meta tags
  /34,?494/,          // stale map-search / default-title count
  /33,?837/,          // stale social metadata count
  /5,?343/,           // Canada
  /1,?458/,           // Australia
  /2,800\+/,          // New York
  /1,707|1,278/,      // Ontario / Quebec breakdowns
  /36,000\+ senior/i, // homepage description
  /\b49 senior living communities\b/i,   // Tokyo
  /\b27 senior living facilities\b/i,    // Singapore
  /\b31 care homes\b/i,                  // Scotland
  /-\s*(49|27|31)\s+(Communities|Facilities)\b/, // hardcoded counts in titles
];

// Generic pattern: any "NN,NNN(+) <communities/facilities/locations>" claim
// inside a title/description/keywords string is an invented inventory count.
const GENERIC_SEO_COUNT = /(title|description|keywords)\s*[:=][^\n]*\b\d{2,3}(,\d{3})*\+?\s+(\+ )?(senior|verified|communit|facilit|location|aged|HUD|care home|option)/i;

const CLIENT_SRC = path.join(__dirname, '../client/src');
const SEO_EMITTER_MARKERS = /ld\+json|Helmet|document\.title|useSEO\(|SEOMetaTags|<meta/;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function expectNoFabricatedCounts(text: string, label: string) {
  for (const pattern of FABRICATED_COUNT_PATTERNS) {
    if (pattern.test(text)) {
      throw new Error(`${label} contains fabricated count matching ${pattern}`);
    }
  }
}

describe('structured data & SEO metadata contain no fabricated community counts', () => {
  test('server directory schema is count-free', () => {
    const schema = generateDirectorySchema('https://www.myseniorvalet.com');
    const json = JSON.stringify(schema);
    expectNoFabricatedCounts(json, 'generateDirectorySchema');
    // numberOfItems must match the actual list length, not an invented total
    expect(schema.numberOfItems).toBe(schema.itemListElement.length);
  });

  test('server location schemas are count-free', () => {
    for (const loc of ['oakmont', 'puerto-rico', 'hawaii', 'fort-worth', 'new-york', 'canada', 'australia']) {
      const schema = generateLocationSchema(loc, [], 'https://www.myseniorvalet.com');
      const json = JSON.stringify(schema);
      expectNoFabricatedCounts(json, `generateLocationSchema(${loc})`);
      // description copy must not include numeric facility counts like "5,343" or "180+"
      expect(json).not.toMatch(/\d[\d,]*\+? (senior|aged|luxury|island|Caribbean)?\s*(living|care|housing|communities|facilities|options)/i);
    }
  });

  test('static index.html (homepage shell, meta + JSON-LD) is count-free', () => {
    const src = fs.readFileSync(path.join(__dirname, '../client/index.html'), 'utf8');
    expectNoFabricatedCounts(src, 'client/index.html');
    expect(src).not.toMatch(/\b\d{1,3},\d{3}\+?\s*(senior|verified|communit)/i);
  });

  test('server structured-data generator source is count-free', () => {
    const src = fs.readFileSync(
      path.join(__dirname, '../server/seo/structured-data-generator.ts'),
      'utf8'
    );
    expectNoFabricatedCounts(src, 'structured-data-generator.ts');
  });

  // Crawlable body-content sources rendered by SEO-indexed routes, even
  // though they contain no meta/JSON-LD markers themselves.
  const CRAWLABLE_CONTENT_SOURCES = [
    'components/CommunityDirectorySections.tsx', // rendered by /community-directory
    'services/locationSEO.service.ts',           // feeds AI-search location content
  ];

  test('crawlable directory/location content is free of fabricated inventory counts', () => {
    for (const rel of CRAWLABLE_CONTENT_SOURCES) {
      const src = fs.readFileSync(path.join(CLIENT_SRC, rel), 'utf8');
      expectNoFabricatedCounts(src, rel);
      // no hardcoded "N,NNN COMMUNITIES/FACILITIES" style inventory claims
      expect(src).not.toMatch(/\b\d{1,3},\d{3}\+?\s+(COMMUNIT|AGED CARE|FACILIT|senior living communit)/i);
      // no hardcoded per-region count fields like { name: 'Ontario', count: '1,707' }
      expect(src).not.toMatch(/count:\s*'[\d,]+'/);
    }
  });

  // Any hardcoded "N,NNN(+) communities/facilities/etc." claim anywhere in
  // client source is a fabricated inventory count (crawlers index rendered
  // page content, not just meta tags).
  // Catches comma-grouped (33,500), plain numeric (412, 68), and compact-K
  // (30K+) inventory claims, as literals or in text nodes like ">30K+<".
  const GENERIC_INVENTORY_CLAIM = new RegExp(
    String.raw`\b(\d{1,3}(,\d{3})+|\d{2,6}|\d{1,3}(\.\d)?K)\+?\s+(\+ )?(subsidized |verified |senior |affordable |aged |CMS )*(senior living |aged care |long-term care )?(communit|facilit|listing|propert|location)`,
    'i'
  );
  const COMPACT_K_CLAIM = /(>|['"`])\s*\d{1,3}(\.\d)?K\+\s*(<|['"`])/;
  // Hardcoded count fields feeding "Communities Indexed/Listed/…" style stat
  // cards, e.g. `dataPoints: 32970` or `totalCommunities: 34171`.
  const HARDCODED_COUNT_FIELD = /\b(dataPoints|totalCommunities|communityCount|communitiesIndexed|communities)\s*:\s*\d{4,}\b/;
  // A numeric literal rendered next to an inventory-ish label such as
  // "Communities Indexed" / "Facilities Listed".
  const LABELED_COUNT = /\b\d{1,3}(,\d{3})+\+?\b[^\n]{0,120}(Communit|Facilit|Propert|Listing)\w*\s+(Indexed|Listed|Tracked|Analyzed|Available|Verified)/i;

  // Legitimate numeric phrases that are NOT inventory claims: 55+ age
  // designation, government program names, pricing-tier limits, batch sizes,
  // pagination, behavioral stats, and street addresses.
  const ALLOWLIST: RegExp[] = [
    /\b55\+\s+communit/i,                      // 55+ age-restricted community type
    /Section \d+ Propert/i,                    // USDA/HUD program names
    /per page/i,                               // pagination comments
    /Scan \d+ Communit/i,                      // admin batch action size
    /(up to|manage) \d+\+? (communit|propert)/i, // plan tier limits
    /\d+-\d+ communities/i,                    // tier ranges e.g. 10-49
    /'\d+ properties'/,                        // tier feature literals
    /contact \d+\+ communit/i,                 // behavioral statistic
    /\d+ Community Center/i,                   // street addresses
    /over \d+ (communit|propert)/i,            // volume-discount thresholds
    /\d+\+? communities?: \$/i,                // pricing-tier ranges
    />\s*\d+ properties\s*</i,                 // tier feature list items
    /^\s*\*.*\(\$[\d,]+\):/,                   // doc comments describing pricing tiers
  ];

  test('no client source file contains hardcoded inventory-count claims', () => {
    const offenders: string[] = [];
    for (const file of walk(CLIENT_SRC)) {
      const src = fs.readFileSync(file, 'utf8');
      const rel = path.relative(CLIENT_SRC, file);
      const isSeoEmitter = SEO_EMITTER_MARKERS.test(src);
      try {
        expectNoFabricatedCounts(src, rel);
      } catch (e: any) {
        offenders.push(e.message);
      }
      if (isSeoEmitter) {
        const genericMatch = src.match(GENERIC_SEO_COUNT);
        if (genericMatch) {
          offenders.push(`${rel}: generic SEO count claim -> ${genericMatch[0].slice(0, 120)}`);
        }
      }
      for (const [idx, line] of src.split('\n').entries()) {
        if (ALLOWLIST.some((a) => a.test(line))) continue;
        const inventoryMatch = line.match(GENERIC_INVENTORY_CLAIM);
        if (inventoryMatch) {
          offenders.push(`${rel}:${idx + 1}: inventory count claim -> ${inventoryMatch[0].slice(0, 120)}`);
        }
        const compactMatch = line.match(COMPACT_K_CLAIM);
        if (compactMatch) {
          offenders.push(`${rel}:${idx + 1}: compact-K count claim -> ${compactMatch[0].slice(0, 120)}`);
        }
        const fieldMatch = line.match(HARDCODED_COUNT_FIELD);
        if (fieldMatch) {
          offenders.push(`${rel}:${idx + 1}: hardcoded count field -> ${fieldMatch[0].slice(0, 120)}`);
        }
        const labeledMatch = line.match(LABELED_COUNT);
        if (labeledMatch) {
          offenders.push(`${rel}:${idx + 1}: labeled count -> ${labeledMatch[0].slice(0, 120)}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  test('alternate server structured-data generator emits no count language', () => {
    const src = fs.readFileSync(
      path.join(__dirname, '../server/utils/structured-data-generator.ts'),
      'utf8'
    );
    expectNoFabricatedCounts(src, 'server/utils/structured-data-generator.ts');
    expect(src).not.toMatch(/communityCount\}?\+/);
  });
});
