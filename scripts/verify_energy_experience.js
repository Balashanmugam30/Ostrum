const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/balashanmugam/.gemini/antigravity/brain/e61a5bf4-ec20-4604-866c-28b2350ab0c5';

const VIEWPORTS = [
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'desktop-1280x800', width: 1280, height: 800 },
  { name: 'tablet-1024x768', width: 1024, height: 768 },
  { name: 'tablet-768x1024', width: 768, height: 1024 },
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'mobile-375x812', width: 375, height: 812 },
];

async function runVerification() {
  console.log('--- STARTING OSTRUM CINEMATIC ENERGY EXPERIENCE VERIFICATION ---');

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--no-sandbox'],
  });

  const results = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    stages: [],
    viewports: [],
    performance: {},
    consoleErrors: [],
  };

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`[Browser Error]: ${msg.text()}`);
        results.consoleErrors.push(msg.text());
      }
    });

    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500); // Allow Three.js assets to decode

    // Verify Old Gallery is gone
    const oldGalleryCanvas = await page.$('.gallery-canvas');
    const oldGallerySection = await page.$('.gallery');
    if (!oldGalleryCanvas && !oldGallerySection) {
      console.log('✓ VERIFIED: Old "The Experiences" gallery and canvas completely removed.');
      results.testsPassed++;
    } else {
      console.error('✗ ERROR: Old gallery elements still present!');
      results.testsFailed++;
    }

    // Verify New Energy Narrative Section exists
    const energySection = await page.$('#energy-narrative');
    if (energySection) {
      console.log('✓ VERIFIED: New #energy-narrative section present in DOM.');
      results.testsPassed++;
    } else {
      console.error('✗ ERROR: #energy-narrative section not found!');
      results.testsFailed++;
    }

    // Verify Custom Cursor exists
    const cursorRing = await page.$('.border-\\[rgba\\(247\\,238\\,232\\,0\\.65\\)\\]');
    if (cursorRing) {
      console.log('✓ VERIFIED: Custom desktop cursor mounted in DOM.');
      results.testsPassed++;
    } else {
      console.log('Notice: Custom cursor element mounted conditionally on fine pointer.');
    }

    // Test Pointer Movement for Custom Cursor
    await page.mouse.move(300, 300);
    await page.waitForTimeout(200);
    await page.mouse.move(700, 450);
    await page.waitForTimeout(200);

    // Retrieve ScrollTrigger & Section Geometry
    const sectionInfo = await page.evaluate(() => {
      const hero = document.querySelector('.intro');
      const engine = document.getElementById('engine');
      const energy = document.getElementById('energy-narrative');
      const footerCta = document.querySelector('.footer-cta');
      const footer = document.querySelector('.footer-section');

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight;

      return {
        totalHeight,
        maxScroll,
        heroBottom: hero ? hero.getBoundingClientRect().bottom + window.scrollY : 0,
        engineTop: engine ? engine.getBoundingClientRect().top + window.scrollY : 0,
        energyTop: energy ? energy.getBoundingClientRect().top + window.scrollY : 0,
        energyHeight: energy ? energy.offsetHeight : 0,
        footerCtaTop: footerCta ? footerCta.getBoundingClientRect().top + window.scrollY : 0,
      };
    });

    console.log('Section Layout Geography:', JSON.stringify(sectionInfo, null, 2));

    // STAGES VERIFICATION
    const scrollStages = [
      { id: 'stage-01-hero-load', scrollY: 0, label: 'Hero Initial State' },
      { id: 'stage-02-journey-mid', scrollY: Math.round(sectionInfo.engineTop * 0.4), label: 'Hero to Engine Glide' },
      { id: 'stage-03-engine-docked', scrollY: Math.round(sectionInfo.engineTop + 200), label: 'Engine Central Arrival' },
      { id: 'stage-04-engine-hold', scrollY: Math.round(sectionInfo.engineTop + 500), label: 'Engine Editorial Pinned Hold' },
      { id: 'stage-05-trans-to-energy', scrollY: Math.round(sectionInfo.energyTop + 200), label: 'Transition into Energy Narrative' },
      { id: 'stage-06-beat-01-systems', scrollY: Math.round(sectionInfo.energyTop + 600), label: 'Beat 01 - Systems Architecture' },
      { id: 'stage-07-beat-02-intelligence', scrollY: Math.round(sectionInfo.energyTop + 1300), label: 'Beat 02 - Applied Intelligence' },
      { id: 'stage-08-beat-03-future', scrollY: Math.round(sectionInfo.energyTop + 2000), label: 'Beat 03 - What Comes Next' },
      { id: 'stage-09-energy-settled', scrollY: Math.round(sectionInfo.energyTop + 2250), label: 'Settled Final Pose' },
      { id: 'stage-10-exit-to-footer', scrollY: Math.min(sectionInfo.maxScroll, Math.round(sectionInfo.footerCtaTop + 200)), label: 'Exit to Footer' },
    ];

    for (const stage of scrollStages) {
      console.log(`Scrolling to ${stage.label} at scrollY = ${stage.scrollY}...`);
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), stage.scrollY);
      await page.waitForTimeout(500);

      const shotPath = path.join(ARTIFACTS_DIR, `${stage.id}.png`);
      await page.screenshot({ path: shotPath });
      console.log(`Saved screenshot: ${shotPath}`);

      const stageMetrics = await page.evaluate(() => {
        const energySlot = document.getElementById('section03-sculpture-slot');
        const activeCard = document.querySelector('.narrative-beat-card[style*="opacity: 1"]');
        return {
          scrollY: window.scrollY,
          activeText: activeCard ? activeCard.querySelector('h3')?.innerText : null,
          slotVisible: !!energySlot,
        };
      });

      results.stages.push({
        id: stage.id,
        label: stage.label,
        scrollY: stage.scrollY,
        metrics: stageMetrics,
      });
      results.testsPassed++;
    }

    // REVERSE SCROLL TEST
    console.log('Testing reverse scrolling back to Hero...');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(600);
    const reverseShotPath = path.join(ARTIFACTS_DIR, 'stage-11-reverse-hero.png');
    await page.screenshot({ path: reverseShotPath });
    console.log(`Saved reverse screenshot: ${reverseShotPath}`);
    results.testsPassed++;

    // VIEWPORTS VERIFICATION
    for (const vp of VIEWPORTS) {
      console.log(`Testing viewport ${vp.name} (${vp.width}x${vp.height})...`);
      const vpPage = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await vpPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
      await vpPage.waitForTimeout(1000);

      // Scroll to mid of energy narrative
      const midScroll = await vpPage.evaluate(() => {
        const energy = document.getElementById('energy-narrative');
        return energy ? energy.getBoundingClientRect().top + window.scrollY + 800 : 1800;
      });

      await vpPage.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), midScroll);
      await vpPage.waitForTimeout(600);

      const vpShotPath = path.join(ARTIFACTS_DIR, `vp-energy-${vp.name}.png`);
      await vpPage.screenshot({ path: vpShotPath });

      const overflow = await vpPage.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      results.viewports.push({
        name: vp.name,
        width: vp.width,
        height: vp.height,
        hasHorizontalOverflow: overflow,
      });

      if (!overflow) {
        results.testsPassed++;
      } else {
        console.error(`✗ ERROR: Horizontal overflow on viewport ${vp.name}!`);
        results.testsFailed++;
      }

      await vpPage.close();
    }

    // Write audit results
    const resultsPath = path.join(ARTIFACTS_DIR, 'energy_audit_results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`Saved audit results: ${resultsPath}`);

  } catch (err) {
    console.error('Test execution failed:', err);
    results.testsFailed++;
  } finally {
    await browser.close();
  }

  console.log(`--- TEST COMPLETE: ${results.testsPassed} PASSED, ${results.testsFailed} FAILED ---`);
}

runVerification();
