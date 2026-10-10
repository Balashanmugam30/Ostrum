const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/balashanmugam/.gemini/antigravity/brain/e61a5bf4-ec20-4604-866c-28b2350ab0c5';

async function runContinuousBackgroundAudit() {
  console.log('🚀 Starting Continuous Background Reconstruction & Visual Verification...');

  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { name: 'desktop-1440x900', width: 1440, height: 900 },
    { name: 'desktop-1280x800', width: 1280, height: 800 },
    { name: 'tablet-1024x768', width: 1024, height: 768 },
    { name: 'tablet-768x1024', width: 768, height: 1024 },
    { name: 'mobile-390x844', width: 390, height: 844 },
    { name: 'mobile-375x812', width: 375, height: 812 },
  ];

  const results = {
    timestamp: new Date().toISOString(),
    stages: {},
    viewports: {},
  };

  // --- 1. Deep 9-Stage Scroll Progression on Desktop 1440x900 ---
  console.log('\n--- Auditing 9-Stage Scroll Journey on 1440x900 ---');
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Stage 1: Hero at scroll 0
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'bg-01-hero-top.png') });
  console.log('Saved: bg-01-hero-top.png');

  // Stage 2: Late Hero (scrollY: 400px)
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'bg-02-late-hero.png') });
  console.log('Saved: bg-02-late-hero.png');

  // Stage 3: First Arrival at Ostrum Engine (scrollY: dockScrollY ~ 1274px)
  const dockScrollY = await page.evaluate(() => {
    const slot = document.getElementById('section02-sculpture-slot');
    const slotRect = slot.getBoundingClientRect();
    return slotRect.top + window.scrollY + slotRect.height * 0.5 - window.innerHeight * 0.5;
  });
  await page.evaluate((y) => window.scrollTo(0, y), dockScrollY);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'bg-03-engine-arrival.png') });
  console.log('Saved: bg-03-engine-arrival.png');

  // Stage 4: Middle of Ostrum Engine Hold (dockScrollY + 300px)
  await page.evaluate((y) => window.scrollTo(0, y), dockScrollY + 300);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'bg-04-engine-mid-hold.png') });
  console.log('Saved: bg-04-engine-mid-hold.png');

  // Stage 5: End of Resting Interval (dockScrollY + 600px)
  await page.evaluate((y) => window.scrollTo(0, y), dockScrollY + 600);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'bg-05-engine-end-hold.png') });
  console.log('Saved: bg-05-engine-end-hold.png');

  // Stage 6: First part of following section (Gallery entrance ~ 2500px)
  await page.evaluate(() => {
    const gal = document.querySelector('.gallery');
    if (gal) gal.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'bg-06-gallery-start.png') });
  console.log('Saved: bg-06-gallery-start.png');

  // Stage 7: Middle of following section (Gallery mid)
  await page.evaluate(() => {
    const gal = document.querySelector('.gallery');
    if (gal) gal.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'bg-07-gallery-mid.png') });
  console.log('Saved: bg-07-gallery-mid.png');

  // Stage 8: Final sections (Footer / Epilogue)
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'bg-08-footer-bottom.png') });
  console.log('Saved: bg-08-footer-bottom.png');

  // Stage 9: Reverse scroll back to Hero
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'bg-09-reverse-hero.png') });
  console.log('Saved: bg-09-reverse-hero.png');

  // Cursor interaction check: hover around screen
  await page.mouse.move(720, 450);
  await page.waitForTimeout(200);
  await page.mouse.move(300, 300);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'bg-10-cursor-halo.png') });
  console.log('Saved: bg-10-cursor-halo.png');

  results.consoleErrors = consoleErrors;
  await page.close();

  // --- 2. Multi-Viewport Layout Verification ---
  console.log('\n--- Auditing Responsive Viewports ---');
  for (const vp of viewports) {
    const p = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await p.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await p.waitForTimeout(600);

    const shotName = `bg-vp-${vp.name}.png`;
    await p.screenshot({ path: path.join(ARTIFACTS_DIR, shotName) });
    console.log(`Saved: ${shotName}`);

    const metrics = await p.evaluate(() => ({
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
      scrollHeight: document.documentElement.scrollHeight,
      innerWidth: window.innerWidth,
    }));
    results.viewports[vp.name] = metrics;
    await p.close();
  }

  await browser.close();

  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'bg_audit_results.json'),
    JSON.stringify(results, null, 2)
  );
  console.log('\n✨ Background audit complete!');
}

runContinuousBackgroundAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
