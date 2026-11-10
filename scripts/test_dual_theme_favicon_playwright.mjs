import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const BASE_URL = 'http://localhost:3000';
const artifactsDir = path.resolve('reports/audits/artifacts/playwright');
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

async function verifyBlackFaviconAsset() {
  const assetPath = path.resolve('public/favicon-ostrum-black.png');
  if (!fs.existsSync(assetPath)) {
    throw new Error(`favicon-ostrum-black.png does not exist at ${assetPath}`);
  }

  const { data, info } = await sharp(assetPath).raw().toBuffer({ resolveWithObject: true });
  console.log(`\n--- 1. STATIC ASSET AUDIT: favicon-ostrum-black.png ---`);
  console.log(`Dimensions: ${info.width}x${info.height} (Square: ${info.width === info.height ? 'PASS ✓' : 'FAIL ✗'})`);

  if (info.width !== info.height) {
    throw new Error(`Asset is not square: ${info.width}x${info.height}`);
  }

  let transparentPixels = 0;
  let nonBlackPixels = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i + 3] !== 255) transparentPixels++;
    if (data[i] !== 0 || data[i + 1] !== 0 || data[i + 2] !== 0) nonBlackPixels++;
  }

  console.log(`Transparency: ${transparentPixels} non-opaque pixels (100% Opaque: ${transparentPixels === 0 ? 'PASS ✓' : 'FAIL ✗'})`);
  if (transparentPixels > 0) {
    throw new Error(`Asset contains ${transparentPixels} transparent pixels. Must be 100% opaque.`);
  }

  // Check 4 corners are pure black #000000
  const cornerCoords = [
    [0, 0],
    [info.width - 1, 0],
    [0, info.height - 1],
    [info.width - 1, info.height - 1],
  ];

  for (const [x, y] of cornerCoords) {
    const idx = (y * info.width + x) * info.channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    if (r !== 0 || g !== 0 || b !== 0 || a !== 255) {
      throw new Error(`Corner at (${x},${y}) is not pure black: rgba(${r},${g},${b},${a})`);
    }
  }
  console.log(`Four Corners: 100% pure black (#000000, alpha 255) - PASS ✓`);

  // Verify multi-scale downscaling (16x16, 32x32, 48x48)
  for (const sz of [16, 32, 48]) {
    const downscaled = await sharp(assetPath).resize(sz, sz).png().toBuffer();
    const dMeta = await sharp(downscaled).metadata();
    if (dMeta.width !== sz || dMeta.height !== sz) {
      throw new Error(`Failed to generate ${sz}x${sz} derivative`);
    }
    console.log(`Scale verification (${sz}x${sz}): PASS ✓`);
  }
}

async function verifyThemeSession(browser, scheme) {
  const context = await browser.newContext({
    colorScheme: scheme,
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('favicon')) {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });

  // 1. Inspect DOM icon links
  const iconLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]'));
    return links.map(l => ({
      href: l.getAttribute('href'),
      media: l.getAttribute('media'),
      sizes: l.getAttribute('sizes'),
      type: l.getAttribute('type'),
    }));
  });

  console.log(`\n[Theme: ${scheme.toUpperCase()}] Evaluated DOM Icon Links:`, JSON.stringify(iconLinks, null, 2));

  // Assert exactly 1 favicon link exists
  if (iconLinks.length !== 1) {
    throw new Error(`Expected exactly 1 favicon link in DOM, found: ${iconLinks.length}`);
  }

  const primaryIcon = iconLinks[0];
  if (!primaryIcon.href?.includes('favicon-ostrum-black.png')) {
    throw new Error(`Expected favicon href to be /favicon-ostrum-black.png, but got: ${primaryIcon.href}`);
  }

  // Assert NO media query attribute on the favicon
  if (primaryIcon.media) {
    throw new Error(`Favicon link must NOT have a media query attribute, but found: ${primaryIcon.media}`);
  }
  console.log(`[Theme: ${scheme.toUpperCase()}] Media-query-free single favicon declaration: PASS ✓`);

  // Verify HTTP 200 on the favicon URL via context request
  const response = await context.request.get(`${BASE_URL}/favicon-ostrum-black.png`);
  if (response.status() !== 200) {
    throw new Error(`HTTP GET /favicon-ostrum-black.png returned status: ${response.status()}`);
  }
  const contentType = response.headers()['content-type'] || '';
  if (!contentType.includes('image/png')) {
    throw new Error(`HTTP GET /favicon-ostrum-black.png returned unexpected content-type: ${contentType}`);
  }
  console.log(`[Theme: ${scheme.toUpperCase()}] Favicon HTTP 200 (image/png): PASS ✓`);

  // Dynamic Theme Switch Verification on the active page
  const oppositeScheme = scheme === 'light' ? 'dark' : 'light';
  await page.emulateMedia({ colorScheme: oppositeScheme });
  const switchedIconHref = await page.evaluate(() => {
    const link = document.querySelector('link[rel="icon"]');
    return link ? link.getAttribute('href') : null;
  });

  if (!switchedIconHref?.includes('favicon-ostrum-black.png')) {
    throw new Error(`Favicon altered after dynamic switch to ${oppositeScheme}: ${switchedIconHref}`);
  }
  console.log(`[Theme Switch: ${scheme} -> ${oppositeScheme}] Favicon invariant: PASS ✓`);

  // Render simulated tab bar for visual proof
  const iconBuffer = await response.body();
  const tabBgColor = scheme === 'light' ? { r: 241, g: 243, b: 244, alpha: 1 } : { r: 32, g: 33, b: 36, alpha: 1 };
  const tabActiveBg = scheme === 'light' ? { r: 255, g: 255, b: 255, alpha: 1 } : { r: 60, g: 64, b: 67, alpha: 1 };

  const tabStrip = await sharp({
    create: { width: 400, height: 44, channels: 4, background: tabBgColor },
  }).composite([
    {
      input: await sharp({
        create: { width: 220, height: 36, channels: 4, background: tabActiveBg },
      }).png().toBuffer(),
      left: 10,
      top: 8,
    },
    {
      input: await sharp(iconBuffer).resize(20, 20).png().toBuffer(),
      left: 20,
      top: 16,
    },
  ]).png().toBuffer();

  const screenshotPath = path.join(artifactsDir, `simulated-chrome-tab-${scheme}-black-favicon.png`);
  fs.writeFileSync(screenshotPath, tabStrip);
  console.log(`[Theme: ${scheme.toUpperCase()}] Saved simulated tab bar to: ${screenshotPath}`);

  if (consoleErrors.length > 0) {
    throw new Error(`Console errors encountered: ${consoleErrors.join(', ')}`);
  }

  await context.close();
  return {
    scheme,
    primaryIcon: primaryIcon.href,
    pass: true,
  };
}

async function main() {
  await verifyBlackFaviconAsset();

  const browser = await chromium.launch({ headless: true });
  try {
    const lightResult = await verifyThemeSession(browser, 'light');
    const darkResult = await verifyThemeSession(browser, 'dark');

    console.log('\n=== PERMANENT WHITE-ON-BLACK FAVICON VERIFICATION SUMMARY ===');
    console.log(`Light Scheme Tab: PASS ✓ (Active: ${lightResult.primaryIcon})`);
    console.log(`Dark Scheme Tab:  PASS ✓ (Active: ${darkResult.primaryIcon})`);
    console.log(`Zero Theme Switching Invariant: PASS ✓`);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('Permanent Black Favicon Playwright Test Failed:', err);
  process.exit(1);
});
