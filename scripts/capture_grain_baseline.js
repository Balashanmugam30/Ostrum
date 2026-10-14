const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = path.join(__dirname, '..', 'rebuild-capture', 'audit', 'grain-and-typography');
fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

async function captureBaselines() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Hero baseline
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '01-baseline-hero.png') });

  // 2. Scroll to Engine / Ostrum Core
  const engineTop = await page.evaluate(() => {
    const el = document.querySelector('#engine') || document.querySelector('.engine-section');
    return el ? el.getBoundingClientRect().top + window.scrollY : 2000;
  });
  await page.evaluate((y) => {
    if (window.lenis) window.lenis.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
  }, engineTop);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '02-baseline-engine.png') });

  // 3. Scroll to Works Wheel / Selected Work
  const wheelTop = await page.evaluate(() => {
    const el = document.querySelector('#selected-work') || document.querySelector('#works-wheel') || document.querySelector('[data-testid="works-wheel-section"]');
    return el ? el.getBoundingClientRect().top + window.scrollY : 10000;
  });
  await page.evaluate((y) => {
    if (window.lenis) window.lenis.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
  }, wheelTop + 500);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '03-baseline-selected-work.png') });

  // 4. Scroll to Testimonials
  const testimonialsTop = await page.evaluate(() => {
    const el = document.querySelector('#testimonials');
    return el ? el.getBoundingClientRect().top + window.scrollY : 20000;
  });
  await page.evaluate((y) => {
    if (window.lenis) window.lenis.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
  }, testimonialsTop + 50);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '04-baseline-testimonials-tmr.png') });

  // Measure current typography of testimonial quote
  const quoteMetrics = await page.evaluate(() => {
    const p = document.querySelector('[data-testid="testimonial-card-0"] p');
    const card = document.querySelector('[data-testid="testimonial-card-0"]');
    if (!p || !card) return null;
    const style = getComputedStyle(p);
    const cardStyle = getComputedStyle(card);
    const pRect = p.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    return {
      fontSize: style.fontSize,
      lineHeight: style.lineHeight,
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight,
      pWidth: pRect.width,
      pHeight: pRect.height,
      cardWidth: cardRect.width,
      cardHeight: cardRect.height,
      verticalRatio: pRect.height / cardRect.height,
    };
  });
  console.log('Current Testimonial Quote Metrics:', quoteMetrics);

  await browser.close();
}

captureBaselines().catch((e) => {
  console.error(e);
  process.exit(1);
});
