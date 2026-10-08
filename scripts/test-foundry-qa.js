const { chromium } = require(require.resolve('playwright', { paths: [process.env.APPDATA + '/npm/node_modules'] }));
const path = require('path');
const fs = require('fs');

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900, isMobile: false },
  { name: 'desktop-1280', width: 1280, height: 800, isMobile: false },
  { name: 'desktop-1024', width: 1024, height: 768, isMobile: false },
  { name: 'tablet-768', width: 768, height: 1024, isMobile: true },
  { name: 'mobile-390', width: 390, height: 844, isMobile: true },
  { name: 'mobile-375', width: 375, height: 812, isMobile: true },
];

async function runQA() {
  console.log('--- Starting Ostrum Foundry QA Audit ---');
  const browser = await chromium.launch({ headless: true });

  const results = [];
  const errors = [];

  for (const vp of VIEWPORTS) {
    console.log(`\nTesting Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(`[${vp.name}] Console Error: ${msg.text()}`);
      }
    });

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Check Foundry section
    const audit = await page.evaluate(async () => {
      const foundry = document.querySelector('section.foundry-section') || document.querySelector('#foundry');
      if (!foundry) return { error: 'Foundry section not found' };

      const rect = foundry.getBoundingClientRect();
      const headline = foundry.querySelector('h2');
      const dossier = foundry.querySelector('[aria-label*="Ostrum Foundry Dossier"]');
      const card = dossier ? dossier.querySelector('div[style*="transform-style"]') : null;
      const flipBtn = foundry.querySelector('button[aria-label*="cover"]');
      const steps = Array.from(foundry.querySelectorAll('.border-b')).map(el => el.textContent.trim().replace(/\s+/g, ' '));
      const hasOverflow = document.body.scrollWidth > window.innerWidth;

      return {
        foundryFound: true,
        top: rect.top,
        height: rect.height,
        headlineText: headline ? headline.textContent.trim() : null,
        hasDossier: !!dossier,
        hasCard3D: !!card,
        initialTransform: card ? card.style.transform : null,
        flipBtnFound: !!flipBtn,
        stepsCount: steps.length,
        hasOverflow,
        bodyScrollWidth: document.body.scrollWidth,
        windowWidth: window.innerWidth,
      };
    });

    console.log(`  Foundry Section Found: ${audit.foundryFound}`);
    console.log(`  Initial Transform: ${audit.initialTransform}`);
    console.log(`  Overflow Free: ${!audit.hasOverflow} (${audit.bodyScrollWidth}px / ${audit.windowWidth}px)`);

    // Scroll to Foundry Section
    await page.evaluate(() => {
      const foundry = document.querySelector('section.foundry-section');
      if (foundry) {
        foundry.scrollIntoView({ behavior: 'instant', block: 'start' });
        window.scrollBy(0, -40);
      }
    });
    await page.waitForTimeout(600);

    // Capture screenshot
    if (vp.name === 'desktop-1440') {
      const outPath = path.join(__dirname, '../rebuild-capture/desktop/ostrum-1440-foundry.png');
      await page.screenshot({ path: outPath });
      console.log(`  Saved screenshot: ${outPath}`);

      // Test Flip Interaction
      console.log('  Testing Flip Interaction...');
      await page.evaluate(async () => {
        const flipBtn = document.querySelector('button[aria-label*="cover"]');
        if (flipBtn) flipBtn.click();
      });
      await page.waitForTimeout(1000);

      const flippedTransform = await page.evaluate(() => {
        const dossier = document.querySelector('[aria-label*="Ostrum Foundry Dossier"]');
        const card = dossier ? dossier.querySelector('div[style*="transform-style"]') : null;
        return card ? card.style.transform : null;
      });
      console.log(`  Flipped Transform: ${flippedTransform}`);

      const flippedPath = path.join(__dirname, '../rebuild-capture/desktop/ostrum-1440-foundry-flipped.png');
      await page.screenshot({ path: flippedPath });
      console.log(`  Saved flipped screenshot: ${flippedPath}`);

      // Flip back
      await page.evaluate(async () => {
        const flipBtn = document.querySelector('button[aria-label*="cover"]');
        if (flipBtn) flipBtn.click();
      });
      await page.waitForTimeout(1000);
    } else if (vp.name === 'mobile-390') {
      const outPath = path.join(__dirname, '../rebuild-capture/mobile/ostrum-390-foundry.png');
      await page.screenshot({ path: outPath });
      console.log(`  Saved mobile screenshot: ${outPath}`);
    } else if (vp.name === 'tablet-768') {
      const outPath = path.join(__dirname, '../rebuild-capture/tablet/ostrum-768-foundry.png');
      await page.screenshot({ path: outPath });
      console.log(`  Saved tablet screenshot: ${outPath}`);
    }

    results.push({ viewport: vp.name, ...audit });
    await context.close();
  }

  // Reduced motion test
  console.log('\n--- Testing Prefers Reduced Motion ---');
  const rmContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const rmPage = await rmContext.newPage();
  await rmPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  const rmTransform = await rmPage.evaluate(() => {
    const dossier = document.querySelector('[aria-label*="Ostrum Foundry Dossier"]');
    const card = dossier ? dossier.querySelector('div[style*="transform-style"]') : null;
    return card ? card.style.transform : null;
  });
  console.log(`  Reduced Motion Transform: ${rmTransform}`);
  await rmContext.close();

  await browser.close();

  console.log('\n--- QA SUMMARY ---');
  console.log(`Total Viewports Tested: ${results.length}`);
  console.log(`Console Errors: ${errors.length}`);
  if (errors.length > 0) {
    console.error('Errors encountered:', errors);
  }

  return { results, errors, rmTransform };
}

runQA().catch(console.error);
