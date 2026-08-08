import fs from 'node:fs/promises';
import path from 'node:path';
import {
  chromium,
  firefox,
  type Browser,
  type BrowserType,
  type Page,
} from 'playwright';

const baseUrl = process.env.E2E_BASE_URL
  ?? (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'http://127.0.0.1:5000');
const outputDir = path.resolve('test-results/hero-cta-mobile');
const ctaSelectors = [
  '[data-testid="button-start-your-search"]',
  '[data-testid="link-browse-resource-directory"]',
  '[data-testid="link-call-scott"]',
];

interface RenderedStyle {
  selector: string;
  backgroundColor: string;
  backgroundImage: string;
  color: string;
  contrastRatio: number;
}

function parseRgb(value: string): [number, number, number, number] {
  const match = value.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\)/);
  if (!match) throw new Error(`Could not parse computed color "${value}"`);
  return [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    match[4] === undefined ? 1 : Number(match[4]),
  ];
}

function luminance([r, g, b]: [number, number, number, number]): number {
  const channels = [r, g, b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = luminance(parseRgb(foreground));
  const backgroundLuminance = luminance(parseRgb(background));
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

async function assertCtas(page: Page, label: string): Promise<void> {
  const rendered: RenderedStyle[] = [];
  for (const selector of ctaSelectors) {
    await page.locator(selector).waitFor({ state: 'visible' });
    const styles = await page.locator(selector).evaluate((element) => {
      const computed = window.getComputedStyle(element);
      return {
        backgroundColor: computed.backgroundColor,
        backgroundImage: computed.backgroundImage,
        color: computed.color,
      };
    });
    const alpha = parseRgb(styles.backgroundColor)[3];
    const hasGradient = styles.backgroundImage !== 'none';
    const ratio = contrastRatio(styles.color, styles.backgroundColor);

    if (alpha === 0 && !hasGradient) {
      throw new Error(`${label}: ${selector} rendered with a transparent background`);
    }
    if (ratio < 4.5) {
      throw new Error(`${label}: ${selector} has low contrast (${ratio.toFixed(2)}:1)`);
    }
    rendered.push({ selector, ...styles, contrastRatio: ratio });
  }
  console.log(`${label}:`, rendered);
}

async function setTheme(page: Page, theme: 'light' | 'dark'): Promise<void> {
  await page.evaluate((nextTheme) => {
    localStorage.setItem('theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  }, theme);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('[data-hero-cta-styles]').waitFor();
}

async function exerciseBrowser(name: string, browserType: BrowserType<Browser>): Promise<void> {
  const browser = await browserType.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    for (const theme of ['light', 'dark'] as const) {
      await setTheme(page, theme);
      await assertCtas(page, `${name} ${theme} hard reload`);

      await page.reload({ waitUntil: 'domcontentloaded' });
      await assertCtas(page, `${name} ${theme} normal reload`);

      await page.locator('[data-testid="link-browse-resource-directory"]').click();
      await page.waitForURL(/\/senior-resources-center(?:[/?#]|$)/);
      await page.goBack({ waitUntil: 'domcontentloaded' });
      await page.waitForURL((url) => url.pathname === '/');
      await assertCtas(page, `${name} ${theme} in-app history navigation`);

      await page.screenshot({
        path: path.join(outputDir, `${name}-${theme}.png`),
        fullPage: true,
      });
    }
    await context.close();
  } finally {
    await browser.close();
  }
}

async function main(): Promise<void> {
  await fs.mkdir(outputDir, { recursive: true });
  await exerciseBrowser('chromium', chromium);

  try {
    await exerciseBrowser('firefox', firefox);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/Executable doesn't exist|browserType\.launch/.test(message)) {
      console.warn(`Firefox unavailable in this environment; skipped: ${message}`);
      return;
    }
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});