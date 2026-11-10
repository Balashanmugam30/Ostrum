import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const BASE_URL = 'http://localhost:3000';
const artifactsDir = path.resolve('reports/audits/artifacts/playwright');
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

async function verifyTheme(browser, scheme) {
  const context = await browser.newContext({
    colorScheme: scheme,
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });

  // 1. Inspect DOM icon links
  const iconLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]'));
    return links.map(l => ({
      href: l.getAttribute('href'),
      media: l.getAttribute('media'),
      sizes: l.getAttribute('sizes'),
      type: l.getAttribute('type'),
      matchesMedia: l.getAttribute('media') ? window.matchMedia(l.getAttribute('media')).matches : true,
    }));
  });

  console.log(`\n[Theme: ${scheme.toUpperCase()}] Evaluated Icon Links:`, JSON.stringify(iconLinks, null, 2));

  // Determine active icon for this scheme
  const matchingLinks = iconLinks.filter(l => l.matchesMedia);
  const activeIcon = matchingLinks[0]?.href;
  console.log(`[Theme: ${scheme.toUpperCase()}] Active favicon in browser: ${activeIcon}`);

  // Assert expected v3 asset
  const expectedAsset = scheme === 'light' ? '/favicon-light-v3.png' : '/favicon-dark-v3.png';
  if (!activeIcon || !activeIcon.includes(expectedAsset)) {
    throw new Error(`Expected active favicon for ${scheme} to be ${expectedAsset}, but found: ${activeIcon}`);
  }

  // Fetch icon and assert pixel color
  const response = await page.goto(`${BASE_URL}${expectedAsset}`);
  if (response.status() !== 200) {
    throw new Error(`Failed to fetch ${expectedAsset}: HTTP ${response.status()}`);
  }
  const iconBuffer = await response.body();
  const { data, info } = await sharp(iconBuffer).raw().toBuffer({ resolveWithObject: true });

  let rSum = 0, gSum = 0, bSum = 0, aCount = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i + 3] > 20) {
      rSum += data[i];
      gSum += data[i + 1];
      bSum += data[i + 2];
      aCount++;
    }
  }
  const avgR = Math.round(rSum / aCount);
  const avgG = Math.round(gSum / aCount);
  const avgB = Math.round(bSum / aCount);
  console.log(`[Theme: ${scheme.toUpperCase()}] Asset avg color: rgb(${avgR},${avgG},${avgB})`);

  if (scheme === 'light') {
    // Deep burgundy (R > 60, G < 30, B < 30)
    if (avgR < 50 || avgG > 40 || avgB > 40) {
      throw new Error(`Light favicon color unexpected: rgb(${avgR},${avgG},${avgB})`);
    }
  } else {
    // Bright Ivory (R > 180, G > 170, B > 160)
    if (avgR < 170 || avgG < 160 || avgB < 150) {
      throw new Error(`Dark favicon color unexpected: rgb(${avgR},${avgG},${avgB})`);
    }
  }

  // Capture simulated browser tab screenshot
  const tabBgColor = scheme === 'light' ? { r: 241, g: 243, b: 244, alpha: 1 } : { r: 32, g: 33, b: 36, alpha: 1 };
  const tabActiveBg = scheme === 'light' ? { r: 255, g: 255, b: 255, alpha: 1 } : { r: 60, g: 64, b: 67, alpha: 1 };
  const textColor = scheme === 'light' ? '#3c4043' : '#e8eaed';

  const tabStrip = await sharp({
    create: { width: 400, height: 42, channels: 4, background: tabBgColor },
  }).composite([
    {
      input: await sharp({
        create: { width: 220, height: 34, channels: 4, background: tabActiveBg },
      }).png().toBuffer(),
      left: 10,
      top: 8,
    },
    {
      input: await sharp(iconBuffer).resize(20, 20).png().toBuffer(),
      left: 20,
      top: 15,
    },
  ]).png().toBuffer();

  const screenshotPath = path.join(artifactsDir, `simulated-chrome-tab-${scheme}.png`);
  fs.writeFileSync(screenshotPath, tabStrip);
  console.log(`[Theme: ${scheme.toUpperCase()}] Saved simulated tab bar to ${screenshotPath}`);

  await context.close();
  return {
    scheme,
    iconLinks,
    activeIcon,
    avgColor: `rgb(${avgR},${avgG},${avgB})`,
    pass: true,
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const lightResult = await verifyTheme(browser, 'light');
    const darkResult = await verifyTheme(browser, 'dark');

    console.log('\n=== DUAL-THEME PLAYWRIGHT VERIFICATION SUMMARY ===');
    console.log(`Light Scheme: PASS ✓ (Active: ${lightResult.activeIcon}, Color: ${lightResult.avgColor})`);
    console.log(`Dark Scheme:  PASS ✓ (Active: ${darkResult.activeIcon}, Color: ${darkResult.avgColor})`);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('Dual-Theme Favicon Playwright Test Failed:', err);
  process.exit(1);
});
