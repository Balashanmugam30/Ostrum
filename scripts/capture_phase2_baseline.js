const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/balashanmugam/.gemini/antigravity/brain/e61a5bf4-ec20-4604-866c-28b2350ab0c5';

(async () => {
  console.log('Capturing Phase 2 Baseline...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const start = await page.evaluate(() => {
    const st = window.ScrollTrigger ? window.ScrollTrigger.getById('works-wheel-pin') : null;
    return st ? st.start : 9076;
  });

  // Scroll to Works Wheel initial state
  await page.evaluate((y) => window.scrollTo({ top: y + 50, behavior: 'instant' }), start);
  await page.waitForTimeout(500);

  // Baseline 1: Stationary pointer over initial oval
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase2-baseline-01-stationary.png') });

  // Baseline 2: Pointer moving slowly across fluid
  await page.mouse.move(720, 450);
  await page.waitForTimeout(200);
  await page.mouse.move(820, 400, { steps: 15 });
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase2-baseline-02-pointer-slow.png') });

  // Baseline 3: Pointer moving quickly
  await page.mouse.move(500, 300, { steps: 3 });
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase2-baseline-03-pointer-fast.png') });

  // Baseline 4: Pointer over ring card
  const cardBox = await page.evaluate(() => {
    const card = document.querySelector('[role="option"]');
    if (!card) return null;
    const r = card.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });

  if (cardBox) {
    await page.mouse.move(cardBox.x, cardBox.y, { steps: 10 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase2-baseline-04-pointer-over-card.png') });
  }

  // Baseline 5: Settled first project
  await page.evaluate((y) => window.scrollTo({ top: y + 1350, behavior: 'instant' }), start);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase2-baseline-05-settled-project-1.png') });

  console.log('Baseline screenshots captured successfully.');
  await browser.close();
})();
