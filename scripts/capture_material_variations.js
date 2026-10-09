const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function captureAllVariations() {
  const outDir = path.join(__dirname, '..', 'rebuild-capture', 'ostrum-core-materials');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  console.log('Navigating to http://localhost:3000/preview/ostrum-core ...');
  await page.goto('http://localhost:3000/preview/ostrum-core', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500); // Allow WebGL & shader compile

  const variations = [
    { key: 'ostrum-pearl', name: 'Var A — Ostrum Pearl', prefix: 'var-a' },
    { key: 'crimson-porcelain', name: 'Var B — Crimson Porcelain', prefix: 'var-b' },
    { key: 'sculptural-satin', name: 'Var C — Sculptural Satin', prefix: 'var-c' },
  ];

  const targetAngles = [
    { deg: 0, suffix: 'front-0deg', label: '0° Front' },
    { deg: 45, suffix: 'three-quarter-45deg', label: '45° 3/4 View' },
    { deg: 90, suffix: 'side-90deg', label: '90° Side' },
    { deg: 135, suffix: 'three-quarter-rev-135deg', label: '135° 3/4 Rev' },
    { deg: 180, suffix: 'back-180deg', label: '180° Back' },
    { deg: 270, suffix: 'opp-side-270deg', label: '270° Opp Side' },
    { deg: 360, suffix: 'loop-360deg', label: '360° Full Loop' },
  ];

  for (const v of variations) {
    console.log(`\n=== Capturing ${v.name} ===`);
    // Select variation button
    await page.click(`button:has-text("${v.name}")`);
    await page.waitForTimeout(600);

    // Standard framing
    await page.click('button:has-text("Standard")');
    await page.click('button:has-text("0° Front")');
    await page.waitForTimeout(800);

    // 1. Full stage screenshot
    await page.screenshot({ path: path.join(outDir, `${v.prefix}-full-stage.png`) });
    console.log(`Saved ${v.prefix}-full-stage.png`);

    // 2. Capture target angles (canvas container)
    for (const a of targetAngles) {
      await page.click(`button:has-text("${a.label}")`);
      await page.waitForTimeout(700);
      const stage = page.locator('[data-testid="stage-viewport"]');
      await stage.screenshot({ path: path.join(outDir, `${v.prefix}-${a.suffix}.png`) });
      console.log(`Saved ${v.prefix}-${a.suffix}.png`);
    }

    // 3. Close-up framing capture
    await page.click('button:has-text("Close-Up")');
    await page.click('button:has-text("45° 3/4 View")');
    await page.waitForTimeout(800);
    const closeUpStage = page.locator('[data-testid="stage-viewport"]');
    await closeUpStage.screenshot({ path: path.join(outDir, `${v.prefix}-close-up.png`) });
    console.log(`Saved ${v.prefix}-close-up.png`);

    // Reset to standard
    await page.click('button:has-text("Standard")');
  }

  // 4. Capture Clean Presentation Mode
  console.log('\n=== Capturing Clean Presentation Mode ===');
  await page.click('button:has-text("Clean Presentation")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'presentation-mode-clean.png') });
  console.log('Saved presentation-mode-clean.png');

  // Exit clean presentation
  await page.click('button:has-text("Show Controls")');
  await page.waitForTimeout(400);

  // 5. Responsive Viewport Audits
  console.log('\n=== Capturing Responsive Viewports ===');
  // Desktop 1440
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'viewport-desktop-1440.png') });

  // Tablet 1024
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'viewport-tablet-1024.png') });

  // Mobile 390
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'viewport-mobile-390.png') });

  await browser.close();

  console.log('\nAll captures completed successfully!');
  console.log('Errors logged:', errors);
}

captureAllVariations().catch(console.error);
