const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/balashanmugam/.gemini/antigravity/brain/e61a5bf4-ec20-4604-866c-28b2350ab0c5';

async function verifyAll() {
  console.log('🚀 Starting Comprehensive Ostrum Visual Stability, Docking & Parallax Verification...');

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
    viewports: {},
    holdStability: {},
    backgroundParallax: {},
    hoverBias: {},
    reverseScroll: {},
  };

  // 1. Detailed Verification on Desktop 1440x900
  {
    console.log('\n--- 1. Testing Desktop 1440x900 Deep Flow ---');
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Initial Hero State
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify-01-hero-desktop.png') });

    // Check Hero 'O' and 3D initial position
    const heroMetrics = await page.evaluate(() => {
      const heroSvg = document.querySelector('.intro svg[aria-label="OSTRUM"]');
      const journeyContainer = document.querySelector('.ostrum-continuous-journey');
      const canvas = journeyContainer ? journeyContainer.querySelector('canvas') : null;
      const bgCanvas = document.querySelector('.background-webgl canvas');
      return {
        hasHeroSvg: !!heroSvg,
        hasJourneyCanvas: !!canvas,
        hasBgCanvas: !!bgCanvas,
        windowScrollY: window.scrollY,
      };
    });
    console.log('Hero metrics:', heroMetrics);

    // Scroll to the Start of Section 02 Editorial Hold
    const holdData = await page.evaluate(() => {
      // Find ScrollTrigger
      // @ts-ignore
      const st = window.ScrollTrigger ? window.ScrollTrigger.getById('section02-hold') : null;
      const engineSlot = document.getElementById('section02-sculpture-slot');
      const slotRect = engineSlot ? engineSlot.getBoundingClientRect() : null;
      return {
        stStart: st ? st.start : null,
        stEnd: st ? st.end : null,
        slotTop: slotRect ? slotRect.top : null,
        slotHeight: slotRect ? slotRect.height : null,
      };
    });
    console.log('Hold data detected:', holdData);

    const dockTargetY = holdData.stStart || 1100;

    // Scroll smoothly to dockStart
    await page.evaluate((y) => window.scrollTo(0, y), dockTargetY);
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify-02-docked-start.png') });

    // Measure stability throughout the hold (+150px, +300px, +450px)
    const holdSteps = [0, 150, 300, 450];
    const holdMeasurements = [];

    for (const step of holdSteps) {
      await page.evaluate((y) => window.scrollTo(0, y), dockTargetY + step);
      await page.waitForTimeout(300);

      const m = await page.evaluate(() => {
        const slot = document.getElementById('section02-sculpture-slot');
        const rect = slot.getBoundingClientRect();
        const centerOnScreen = rect.top + rect.height * 0.5;
        const viewportCenter = window.innerHeight * 0.5;
        return {
          scrollY: window.scrollY,
          rectTop: rect.top,
          rectHeight: rect.height,
          centerOnScreen,
          viewportCenter,
          diffFromCenter: Math.abs(centerOnScreen - viewportCenter),
        };
      });
      holdMeasurements.push(m);
    }
    console.log('Hold measurements across 450px scroll:', holdMeasurements);
    results.holdStability = holdMeasurements;

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify-03-docked-mid-hold.png') });

    // Test Hover Focus Bias on cards during hold
    console.log('Testing card hover focus bias...');
    const leftBlock = await page.$('.ostrum-engine-section h3:text-matches(".*Systems that make.*")');
    if (leftBlock) {
      await leftBlock.hover();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify-04-hover-business.png') });
    }

    const rightBlock = await page.$('.ostrum-engine-section h3:text-matches(".*Products and ventures.*")');
    if (rightBlock) {
      await rightBlock.hover();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify-05-hover-next.png') });
    }

    // Unpinned Exit Past Hold
    console.log('Testing unpinned exit past hold into Section 04...');
    await page.evaluate((y) => window.scrollTo(0, y), dockTargetY + 850);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify-06-unpinned-exit.png') });

    // Reverse Scroll Back to Top
    console.log('Testing reverse scroll back to Hero O...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify-07-reverse-hero.png') });

    // Verify background caustics parallax response
    const bgParallaxData = await page.evaluate(() => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, maxScroll * 0.5);
      return {
        scrollY: window.scrollY,
        maxScroll,
      };
    });
    console.log('Background scroll test at 50%:', bgParallaxData);

    await page.close();
  }

  // 2. Multi-Viewport Responsive Layout Audit
  console.log('\n--- 2. Multi-Viewport Layout Verification ---');
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    // Scroll to Section 02
    await page.evaluate(() => {
      const el = document.getElementById('engine');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(400);

    const vpCheck = await page.evaluate(() => {
      const slot = document.getElementById('section02-sculpture-slot');
      const rect = slot ? slot.getBoundingClientRect() : null;
      return {
        hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
        slotVisible: !!rect && rect.top < window.innerHeight && rect.bottom > 0,
        slotWidth: rect ? rect.width : 0,
        slotHeight: rect ? rect.height : 0,
        slotTop: rect ? rect.top : 0,
      };
    });

    results.viewports[vp.name] = vpCheck;
    console.log(`Viewport ${vp.name}:`, vpCheck);

    const vpFileName = `verify-vp-${vp.name}.png`;
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, vpFileName) });

    await page.close();
  }

  await browser.close();

  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'verify_results.json'),
    JSON.stringify(results, null, 2)
  );
  console.log('\n✨ Verification complete! All screenshots saved in artifact directory.');
}

verifyAll().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
