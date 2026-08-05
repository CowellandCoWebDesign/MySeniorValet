/**
 * Regression test for Task 466: the global dark-mode stylesheet must never
 * silently repaint new components again.
 *
 * Policy (documented atop the dark-mode block in client/src/index.css):
 * `.dark ...` rules that use `!important` are only allowed when scoped to an
 * explicit hook — a dedicated component class (e.g. .tab-*), a
 * data-attribute hook, or third-party widget DOM we cannot add classes to
 * (Leaflet controls). Broad `.dark` overrides keyed on Tailwind utility
 * classes (`.dark .bg-white`) or bare elements (`.dark input`) must NOT use
 * `!important`; without it, component-declared `dark:` variants win, so new
 * components render as authored.
 */
import fs from 'fs';
import path from 'path';

const CSS_FILES = [
  'client/src/index.css',
  'client/src/styles/dark-mode-standards.css',
  'client/src/styles/responsive-enhancements.css',
].filter((f) => fs.existsSync(path.resolve(__dirname, '..', f)));

interface CssRule {
  file: string;
  selector: string;
  body: string;
}

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function extractRules(css: string, file: string): CssRule[] {
  const rules: CssRule[] = [];
  // Simple tokenizer: walks braces, records selector -> body for leaf rules.
  let selectorStart = 0;
  const stack: string[] = [];
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === '{') {
      stack.push(css.slice(selectorStart, i).trim());
      selectorStart = i + 1;
    } else if (ch === '}') {
      const body = css.slice(selectorStart, i);
      const selector = stack.pop() ?? '';
      // Leaf rule if body contains declarations (no nested '{' handled above)
      if (selector && body.includes(':') && !selector.startsWith('@keyframes')) {
        rules.push({ file, selector, body });
      }
      selectorStart = i + 1;
    } else if (ch === ';' && stack.length === 0) {
      selectorStart = i + 1;
    }
  }
  return rules;
}

/**
 * A `.dark`-scoped selector segment is "explicitly hooked" when everything
 * after `.dark` targets a dedicated class, data attribute, or third-party
 * widget DOM — not a Tailwind utility class or bare element.
 */
const ALLOWED_HOOK_PATTERNS: RegExp[] = [
  /^\.dark\s+\.tab-(communities|services|healthcare|resources|vendors)\b/, // dedicated tab classes
  /^\.dark\s+\.leaflet-/, // third-party Leaflet control DOM
  /^\.dark\s+[a-z]*\[data-/, // explicit data-attribute hooks
];

function isAllowedDarkImportantSelector(segment: string): boolean {
  const s = segment.trim();
  if (!/(^|[\s>+~(])\.dark\b/.test(s)) return true; // not dark-scoped
  return ALLOWED_HOOK_PATTERNS.some((re) => re.test(s));
}

describe('dark-mode override policy (Task 466)', () => {
  const allRules: CssRule[] = CSS_FILES.flatMap((rel) => {
    const abs = path.resolve(__dirname, '..', rel);
    return extractRules(stripComments(fs.readFileSync(abs, 'utf8')), rel);
  });

  it('parses the stylesheets and finds dark-mode rules (sanity check)', () => {
    const darkRules = allRules.filter((r) => r.selector.includes('.dark'));
    expect(darkRules.length).toBeGreaterThan(20);
  });

  it('no broad `.dark` selector (utility class or bare element) uses !important', () => {
    const violations: string[] = [];
    for (const rule of allRules) {
      if (!rule.body.includes('!important')) continue;
      // Every comma-separated segment that is .dark-scoped must be an
      // explicit hook.
      const segments = rule.selector.split(',');
      for (const seg of segments) {
        if (!isAllowedDarkImportantSelector(seg)) {
          violations.push(`${rule.file}: "${seg.trim()}" uses !important`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('legacy dark defaults in index.css carry no !important (utilities must win)', () => {
    // Spot-check the selectors that historically repainted components.
    const broadSelectors = [
      '.dark .bg-white',
      '.dark .bg-gray-50',
      '.dark .text-gray-900',
      '.dark [role="dialog"]',
      '.dark label',
      '.dark li',
    ];
    for (const sel of broadSelectors) {
      const matches = allRules.filter(
        (r) => r.selector.split(',').map((s) => s.trim()).includes(sel),
      );
      expect(matches.length).toBeGreaterThan(0);
      for (const m of matches) {
        expect(`${sel} => ${m.body.includes('!important')}`).toBe(`${sel} => false`);
      }
    }
  });

  it('keeps hero CTA protection component-local instead of in the global stylesheet', () => {
    const globalCss = CSS_FILES.map((rel) =>
      fs.readFileSync(path.resolve(__dirname, '..', rel), 'utf8'),
    ).join('\n');
    const heroSource = fs.readFileSync(
      path.resolve(__dirname, '..', 'client/src/pages/myseniorvalet-home.tsx'),
      'utf8',
    );

    expect(globalCss).not.toContain('.hero-cta-primary');
    expect(globalCss).not.toContain('.hero-cta-secondary');
    expect(heroSource).toContain('data-hero-cta="primary"');
    expect(heroSource).toContain('data-hero-cta="secondary"');
    expect(heroSource).toContain('<style data-hero-cta-styles>');
    expect(heroSource).toContain('style={HERO_CTA_PRIMARY_FALLBACK}');
    expect(heroSource).toContain('style={HERO_CTA_SECONDARY_FALLBACK[theme]}');
  });
});
