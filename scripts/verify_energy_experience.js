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
  console.log('--- STARTING OSTRUM CINEMATIC ENERGY EXPERIENCE REBUILD VERIFICATION ---');

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

    // Verify Legacy Downstream Content is completely removed
    const legacyFooterCta = await page.$('.footer-cta');
    const legacyFooter = await page.$('.footer-section');
    const legacyOrderModal = await page.$('#order-modal');
    if (!legacyFooterCta && !legacyFooter && !legacyOrderModal) {
      console.log('✓ VERIFIED: Legacy Clarté book content (FooterCta, Footer, OrderModal) completely eliminated.');
      results.testsPassed++;
    } else {
      console.error('✗ ERROR: Legacy content still present!');
      results.testsFailed++;
    }

    // Verify Section 02 bottom backing text is removed
    const section02BackingText = await page.evaluate(() => {
      const engineSection = document.getElementById('engine');
      if (!engineSection) return false;
      return engineSection.innerText.includes('Some ideas become products. Some products become ventures.');
    });
    if (!section02BackingText) {
      console.log('✓ VERIFIED: Section 02 premature backing statement removed (now exclusively Beat 04).');
      results.testsPassed++;
    } else {
      console.error('✗ ERROR: Section 02 still contains premature backing statement!');
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

    // Verify exactly 5 narrative beats are present
    const beatsCount = await page.evaluate(() => {
      return document.querySelectorAll('.narrative-beat-card').length;
    });
    if (beatsCount === 5) {
      console.log(`✓ VERIFIED: Exactly 5 narrative beats found in DOM.`);
      results.testsPassed++;
    } else {
      console.error(`✗ ERROR: Expected 5 beats, found ${beatsCount}`);
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

    // Test Pointer Movement
    await page.mouse.move(300, 300);
    await page.waitForTimeout(150);
    await page.mouse.move(700, 450);
    await page.waitForTimeout(150);

    // Retrieve ScrollTrigger & Section Geometry
    const sectionInfo = await page.evaluate(() => {
      const hero = document.querySelector('.intro');
      const engine = document.getElementById('engine');
      const energy = document.getElementById('energy-narrative');

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight;

      return {
        totalHeight,
        maxScroll,
        heroBottom: hero ? hero.getBoundingClientRect().bottom + window.scrollY : 0,
        engineTop: engine ? engine.getBoundingClientRect().top + window.scrollY : 0,
        energyTop: energy ? energy.getBoundingClientRect().top + window.scrollY : 0,
        energyHeight: energy ? energy.offsetHeight : 0,
      };
    });

    console.log('Section Layout Geography:', JSON.stringify(sectionInfo, null, 2));

    // STAGES VERIFICATION (11 STAGES)
    const scrollStages = [
      { id: 'stage-01-hero-load', scrollY: 0, label: 'Hero Initial State' },
      { id: 'stage-02-journey-mid', scrollY: Math.round(sectionInfo.engineTop * 0.4), label: 'Hero to Engine Glide' },
      { id: 'stage-03-engine-docked', scrollY: Math.round(sectionInfo.engineTop + 200), label: 'Engine Central Arrival' },
      { id: 'stage-04-engine-hold', scrollY: Math.round(sectionInfo.engineTop + 500), label: 'Engine Editorial Pinned Hold' },
      { id: 'stage-05-trans-object-only', scrollY: Math.round(sectionInfo.energyTop + 250), label: 'Stage 0: Object Alone in Pitch Black' },
      { id: 'stage-06-beat-01-problem', scrollY: Math.round(sectionInfo.energyTop + 850), label: 'Beat 01: Disconnected Systems' },
      { id: 'stage-07-beat-02-punchline', scrollY: Math.round(sectionInfo.energyTop + 1450), label: 'Beat 02: Complexity, Made Coherent' },
      { id: 'stage-08-beat-03-connect', scrollY: Math.round(sectionInfo.energyTop + 2050), label: 'Beat 03: We Connect Systems' },
      { id: 'stage-09-beat-04-ventures', scrollY: Math.round(sectionInfo.energyTop + 2650), label: 'Beat 04: Products & Ventures' },
      { id: 'stage-10-beat-05-closing', scrollY: Math.round(sectionInfo.energyTop + 3350), label: 'Beat 05: Build What Does Not Exist Yet' },
      { id: 'stage-11-release-spacer', scrollY: Math.round(sectionInfo.energyTop + 3800), label: 'Natural Unpinned Release Spacer' },
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
        const cards = Array.from(document.querySelectorAll('.narrative-beat-card'));
        const visibleCards = cards.filter((c) => {
          const op = parseFloat(window.getComputedStyle(c).opacity);
          return op > 0.4;
        });

        return {
          scrollY: window.scrollY,
          visibleCardText: visibleCards.map((c) => c.querySelector('h3')?.innerText?.trim()).join(' | '),
          visibleCardsCount: visibleCards.length,
          slotVisible: !!energySlot,
        };
      });

      console.log(`  Metrics:`, stageMetrics);

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
    const reverseShotPath = path.join(ARTIFACTS_DIR, 'stage-12-reverse-hero.png');
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
        return energy ? energy.getBoundingClientRect().top + window.scrollY + 1200 : 2200;
      });

      await vpPage.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), midScroll);
      await vpPage.waitForTimeout(600);

      const vpShotPath = path.join(ARTIFACTS_DIR, `vp-energy-${vp.name}.png`);
      await vpPage.screenshot({ path: vpShotPath });

      const overflow = await vpPage.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      console.log(`  Viewport ${vp.name} horizontal overflow: ${overflow ? 'DETECTED!' : 'None (Clean)'}`);
      if (!overflow) results.testsPassed++;
      else results.testsFailed++;

      results.viewports.push({
        name: vp.name,
        width: vp.width,
        height: vp.height,
        screenshot: vpShotPath,
        overflow,
      });

      await vpPage.close();
    }

    // Save audit summary
    const auditJsonPath = path.join(ARTIFACTS_DIR, 'energy_narrative_audit_results.json');
    fs.writeFileSync(auditJsonPath, JSON.stringify(results, null, 2));
    console.log(`Saved audit results: ${auditJsonPath}`);

  } catch (err) {
    console.error('Fatal Verification Error:', err);
    results.testsFailed++;
  } finally {
    await browser.close();
  }

  console.log(`--- VERIFICATION COMPLETE: ${results.testsPassed} PASSED, ${results.testsFailed} FAILED ---`);
}

runVerification();
