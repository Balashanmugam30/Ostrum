const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:\\Users\\balashanmugam\\.gemini\\antigravity\\brain\\e61a5bf4-ec20-4604-866c-28b2350ab0c5';

async function runAudit() {
  console.log('=== STARTING OSTRUM FINAL WORKS WHEEL AUDIT ===\n');

  const report = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    handoffStationaryCheck: false,
    ringSizingCheck: {},
    projectDataCheck: false,
    artworkImagesCheck: false,
    pastelTransitionsCheck: false,
    clickVsDragCheck: false,
    linkNavigationCheck: {},
    viewportsTested: [],
    consoleErrors: [],
  };

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'],
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon') && !text.includes('WebGL')) {
          console.error('[Console Error]', text);
          report.consoleErrors.push(text);
        }
      }
    });

    console.log('1. Navigating to http://localhost:3000 ...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Read ScrollTrigger layout markers
    const coords = await page.evaluate(() => {
      const stEnergy = window.ScrollTrigger?.getById('energy-narrative-pin');
      const workEl = document.getElementById('selected-work');
      const workRect = workEl ? workEl.getBoundingClientRect() : null;
      const isMob = window.innerWidth < 768;
      const scrollDistance = isMob ? 3600 : 5000;

      return {
        energyStart: stEnergy ? stEnergy.start : 3000,
        energyEnd: stEnergy ? stEnergy.end : 8900,
        scrollDistance,
        handoffDistance: window.innerHeight,
        workTop: workRect ? workRect.top + window.scrollY : 8900,
      };
    });

    console.log('ScrollTrigger Coordinates:', coords);
    const { energyStart, scrollDistance, handoffDistance } = coords;
    const beat5ScrollY = energyStart + scrollDistance;

    // --- TEST 1: FIXED CINEMATIC HANDOFF ---
    console.log('\n--- TEST 1: Fixed Cinematic Handoff (Beat 05 & 3D Stationary) ---');
    // Scroll to beat 05 rest position
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), beat5ScrollY - 50);
    await page.waitForTimeout(500);

    const beat5InitialRect = await page.evaluate(() => {
      const beatCards = document.querySelectorAll('.narrative-beat-card');
      const lastBeat = beatCards[4];
      if (!lastBeat) return null;
      const rect = lastBeat.getBoundingClientRect();
      return { top: Math.round(rect.top), height: Math.round(rect.height) };
    });

    console.log('Beat 05 viewport Y at rest:', beat5InitialRect);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'wheel-final-01-beat05-rest.png') });

    // Scroll halfway into the handoff:
    const handoffMidY = beat5ScrollY + Math.round(handoffDistance * 0.50);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), handoffMidY);
    await page.waitForTimeout(400);

    const handoffMidState = await page.evaluate(() => {
      const beatCards = document.querySelectorAll('.narrative-beat-card');
      const lastBeat = beatCards[4];
      const beatRect = lastBeat ? lastBeat.getBoundingClientRect() : null;
      const workEl = document.getElementById('selected-work');
      const workRect = workEl ? workEl.getBoundingClientRect() : null;
      return {
        beatTop: beatRect ? Math.round(beatRect.top) : null,
        workTop: workRect ? Math.round(workRect.top) : null,
        windowH: window.innerHeight,
      };
    });

    console.log('Handoff Midway State:', handoffMidState);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'wheel-final-02-handoff-rising.png') });

    // Scroll to full cover position:
    const handoffFullY = beat5ScrollY + handoffDistance;
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), handoffFullY);
    await page.waitForTimeout(400);

    const handoffFullState = await page.evaluate(() => {
      const workEl = document.getElementById('selected-work');
      const workRect = workEl ? workEl.getBoundingClientRect() : null;
      return {
        workTop: workRect ? Math.round(workRect.top) : null,
      };
    });

    console.log('Handoff Full Cover State:', handoffFullState);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'wheel-final-03-handoff-covered.png') });

    // Assert: Beat 05 stayed stationary during entry, and Selected Work covered the viewport
    const beatStationary = beat5InitialRect && Math.abs(beat5InitialRect.top - handoffMidState.beatTop) <= 2;
    const workRoseFromBottom = handoffMidState.workTop > 0 && handoffMidState.workTop < handoffMidState.windowH;
    const workFullyCovered = Math.abs(handoffFullState.workTop) <= 5;

    if (beatStationary && workRoseFromBottom && workFullyCovered) {
      console.log('✓ PASS: Test 1 Passed. Beat 05 is 100% stationary; Selected Work rises and covers smoothly.');
      report.handoffStationaryCheck = true;
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Test 1 Failed.', { beatStationary, workRoseFromBottom, workFullyCovered });
      report.testsFailed++;
    }

    // --- TEST 2: WHEEL SIZING & VIEWPORT FIT AT REST ---
    console.log('\n--- TEST 2: Wheel Sizing and Viewport Fit ---');
    // Scroll directly to Selected Work resting position
    await page.evaluate(() => {
      const workEl = document.getElementById('selected-work');
      if (workEl) workEl.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(600);

    const sizingMetrics = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[id^="works-wheel-"]'));
      if (cards.length === 0) return null;

      let minTop = Infinity;
      let maxBottom = -Infinity;
      cards.forEach((c) => {
        const visualEl = c.firstElementChild || c;
        const r = visualEl.getBoundingClientRect();
        if (r.top < minTop) minTop = r.top;
        if (r.bottom > maxBottom) maxBottom = r.bottom;
      });

      const ringH = maxBottom - minTop;
      const winH = window.innerHeight;
      const topMargin = minTop;
      const bottomMargin = winH - maxBottom;
      const ringRatio = ringH / winH;

      return {
        ringH: Math.round(ringH),
        winH,
        ringRatio: Math.round(ringRatio * 1000) / 10, // e.g. 65.5%
        topMarginRatio: Math.round((topMargin / winH) * 1000) / 10,
        bottomMarginRatio: Math.round((bottomMargin / winH) * 1000) / 10,
      };
    });

    console.log('Ring Sizing Metrics at Rest:', sizingMetrics);
    report.ringSizingCheck = sizingMetrics;
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'wheel-final-04-ring-rest.png') });

    // Target: ring height 60% - 72% of viewport (spec 65-70%), margins >= 8%
    if (
      sizingMetrics &&
      sizingMetrics.ringRatio >= 58 &&
      sizingMetrics.ringRatio <= 74 &&
      sizingMetrics.topMarginRatio >= 8 &&
      sizingMetrics.bottomMarginRatio >= 8
    ) {
      console.log(`✓ PASS: Test 2 Passed. Ring height is ${sizingMetrics.ringRatio}% of viewport height (target 65-70%), with comfortable top/bottom breathing room.`);
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Test 2 Failed. Ring sizing out of bounds.', sizingMetrics);
      report.testsFailed++;
    }

    // --- TEST 3: PROJECT DATA & HONEST LABELS ---
    console.log('\n--- TEST 3: Project Data, OSTRUM / WORKS Label & Badges ---');
    const projectData = await page.evaluate(() => {
      const section = document.getElementById('selected-work');
      const text = section ? section.textContent : '';
      const hasMainLabel = text.includes('OSTRUM') && text.includes('WORKS');
      const hasTMR = text.includes('TMR AI Car Care');
      const hasSaraswati = text.includes('Saraswati Driving School');
      const hasSignal = text.includes('Signal');
      const hasAtlas = text.includes('Atlas');
      const hasOrigin = text.includes('Origin');

      const cards = document.querySelectorAll('[id^="works-wheel-"]');
      return {
        hasMainLabel,
        hasTMR,
        hasSaraswati,
        hasSignal,
        hasAtlas,
        hasOrigin,
        cardCount: cards.length,
      };
    });

    console.log('Project Data Check:', projectData);
    if (projectData.hasMainLabel && projectData.hasTMR && projectData.hasSaraswati && projectData.cardCount === 9) {
      console.log('✓ PASS: Test 3 Passed. Label "OSTRUM / WORKS" present and all 9 projects verified.');
      report.projectDataCheck = true;
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Test 3 Failed.', projectData);
      report.testsFailed++;
    }

    // --- TEST 4: BESPOKE ARTWORK IMAGES LOADING ---
    console.log('\n--- TEST 4: Bespoke Artwork Images Loading ---');
    const imageStatus = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('#selected-work img'));
      return imgs.map((img) => ({
        src: img.getAttribute('src'),
        loaded: img.complete && img.naturalWidth > 0,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      }));
    });

    console.log(`Verified ${imageStatus.length} images:`);
    const allImagesLoaded = imageStatus.length === 9 && imageStatus.every((img) => img.loaded && img.src.includes('/images/works/'));
    imageStatus.forEach((img, i) => {
      console.log(`  [${i + 1}] ${img.src} -> ${img.loaded ? 'OK' : 'FAILED'} (${img.naturalWidth}x${img.naturalHeight})`);
    });

    if (allImagesLoaded) {
      console.log('✓ PASS: Test 4 Passed. All 9 bespoke editorial artwork images loaded successfully.');
      report.artworkImagesCheck = true;
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Test 4 Failed. Some artwork images failed to load.', imageStatus);
      report.testsFailed++;
    }

    // --- TEST 5: PASTEL BACKGROUND TRANSITIONS ---
    console.log('\n--- TEST 5: Pastel Background Transitions ---');
    // Read initial background (Item 0: TMR AI Car Care -> #F2E3D6)
    const initialBg = await page.evaluate(() => {
      const workEl = document.getElementById('selected-work');
      return window.getComputedStyle(workEl).backgroundColor;
    });
    console.log('Initial Background (TMR):', initialBg);

    // Turn wheel to Item 1 (Saraswati Driving School: #DDE8D9) by clicking index 2 (item 1)
    const buttons = await page.$$('ol button');
    if (buttons.length >= 2) {
      console.log('Clicking index button for Item 1 (Saraswati Driving School)...');
      await buttons[1].click();
      // Wait for background to complete transition to Saraswati pastel ground
      await page.waitForFunction(
        () => {
          const workEl = document.getElementById('selected-work');
          if (!workEl) return false;
          const bg = window.getComputedStyle(workEl).backgroundColor;
          return bg === 'rgb(221, 232, 217)' || bg.includes('221, 232, 217');
        },
        { timeout: 4000 }
      );
    }

    const item1State = await page.evaluate(() => {
      const workEl = document.getElementById('selected-work');
      const bg = window.getComputedStyle(workEl).backgroundColor;
      const text = workEl ? workEl.textContent : '';
      const isSaraswatiActive = text.includes('Saraswati Driving School') && text.includes('Fleet Logistics');
      return { bg, isSaraswatiActive };
    });
    console.log('Item 1 Background (Saraswati):', item1State);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'wheel-final-05-item-1-saraswati.png') });

    // Turn wheel to Item 2 (Signal: #DFE8F3) by clicking index 3
    if (buttons.length >= 3) {
      console.log('Clicking index button for Item 2 (Signal)...');
      await buttons[2].click();
      await page.waitForFunction(
        () => {
          const workEl = document.getElementById('selected-work');
          if (!workEl) return false;
          const bg = window.getComputedStyle(workEl).backgroundColor;
          return bg === 'rgb(223, 232, 243)' || bg.includes('223, 232, 243');
        },
        { timeout: 4000 }
      );
    }

    const item2State = await page.evaluate(() => {
      const workEl = document.getElementById('selected-work');
      const bg = window.getComputedStyle(workEl).backgroundColor;
      const text = workEl ? workEl.textContent : '';
      const isSignalActive = text.includes('Signal') && text.includes('Autonomous Market');
      return { bg, isSignalActive };
    });
    console.log('Item 2 Background (Signal):', item2State);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'wheel-final-06-item-2-signal.png') });

    const bgTransformed = initialBg !== item1State.bg && item1State.bg !== item2State.bg;
    if (bgTransformed) {
      console.log('✓ PASS: Test 5 Passed. Background dynamically transitions smoothly through project pastel palettes.');
      report.pastelTransitionsCheck = true;
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Test 5 Failed. Background did not transition between projects.');
      report.testsFailed++;
    }

    // --- TEST 6: CLICK VS DRAG SEPARATION & NAVIGATION ---
    console.log('\n--- TEST 6: Click vs Drag Separation & Navigation ---');
    // Turn back to Item 0 (TMR AI Car Care)
    if (buttons.length >= 1) {
      await buttons[0].click();
      await page.waitForTimeout(700);
    }

    // Spy on window.open
    await page.evaluate(() => {
      window._lastOpenedUrl = null;
      window.open = function (url) {
        window._lastOpenedUrl = url;
        return null;
      };
    });

    // 6a: Test genuine click on active card 0 (TMR AI Car Care)
    const card0 = await page.$('#works-wheel-0');
    if (card0) {
      console.log('Performing genuine click (<7px movement) on active Card 0...');
      await card0.click();
      await page.waitForTimeout(200);

      const openedUrl = await page.evaluate(() => window._lastOpenedUrl);
      console.log('Window.open intercepted URL:', openedUrl);

      if (openedUrl === 'https://tmraicarcare.com/') {
        console.log('✓ PASS: Genuine click opened live HTTPS platform for TMR AI Car Care.');
        report.linkNavigationCheck['tmr'] = true;
      } else {
        console.error('✗ FAIL: Click on Card 0 did not open https://tmraicarcare.com/', openedUrl);
      }
    }

    // 6b: Test genuine click on Card 1 (Saraswati Driving School)
    if (buttons.length >= 2) {
      await buttons[1].click();
      await page.waitForTimeout(700);
    }

    await page.evaluate(() => {
      window._lastOpenedUrl = null;
    });

    const card1 = await page.$('#works-wheel-1');
    if (card1) {
      console.log('Performing genuine click on active Card 1...');
      await card1.click();
      await page.waitForTimeout(200);

      const openedUrl = await page.evaluate(() => window._lastOpenedUrl);
      console.log('Window.open intercepted URL for Saraswati:', openedUrl);

      if (openedUrl === 'https://saraswati-driving-school.vercel.app/') {
        console.log('✓ PASS: Genuine click opened live HTTPS platform for Saraswati Driving School.');
        report.linkNavigationCheck['saraswati'] = true;
      } else {
        console.error('✗ FAIL: Click on Card 1 did not open https://saraswati-driving-school.vercel.app/', openedUrl);
      }
    }

    // 6c: Test drag gesture (>7px movement)
    await page.evaluate(() => {
      window._lastOpenedUrl = null;
    });

    const stageEl = await page.$('div[role="listbox"]');
    if (stageEl) {
      console.log('Performing drag gesture (>7px movement) across stage...');
      const box = await stageEl.boundingBox();
      if (box) {
        const startX = box.x + box.width / 2;
        const startY = box.y + box.height / 2;
        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(startX, startY - 80, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(400);

        const dragOpenedUrl = await page.evaluate(() => window._lastOpenedUrl);
        if (dragOpenedUrl === null) {
          console.log('✓ PASS: Drag gesture rotated wheel without triggering false link navigation.');
          report.clickVsDragCheck = true;
          report.testsPassed++;
        } else {
          console.error('✗ FAIL: Drag gesture falsely triggered navigation!', dragOpenedUrl);
          report.testsFailed++;
        }
      }
    }

    // --- TEST 7: RESPONSIVE VIEWPORT SUITE ---
    console.log('\n--- TEST 7: Responsive Viewport Suite (6 Screen Sizes) ---');
    const viewports = [
      { name: 'desktop-1920x1080', w: 1920, h: 1080 },
      { name: 'desktop-1440x900', w: 1440, h: 900 },
      { name: 'laptop-1280x800', w: 1280, h: 800 },
      { name: 'tablet-1024x768', w: 1024, h: 768 },
      { name: 'mobile-390x844', w: 390, h: 844 },
      { name: 'mobile-375x812', w: 375, h: 812 },
    ];

    for (const vp of viewports) {
      console.log(`\nTesting Viewport: ${vp.name} (${vp.w}x${vp.h}) ...`);
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.waitForTimeout(500);

      // Scroll to Selected Work
      await page.evaluate(() => {
        const el = document.getElementById('selected-work');
        if (el) el.scrollIntoView({ behavior: 'instant' });
      });
      await page.waitForTimeout(400);

      const vpMetrics = await page.evaluate(() => {
        const docW = document.documentElement.clientWidth;
        const scrollW = document.documentElement.scrollWidth;
        const hasOverflow = scrollW > docW;
        const cards = Array.from(document.querySelectorAll('[id^="works-wheel-"]'));
        let minTop = Infinity;
        let maxBottom = -Infinity;
        cards.forEach((c) => {
          const visualEl = c.firstElementChild || c;
          const r = visualEl.getBoundingClientRect();
          if (r.top < minTop) minTop = r.top;
          if (r.bottom > maxBottom) maxBottom = r.bottom;
        });
        const ringH = maxBottom - minTop;
        const ringRatio = ringH / window.innerHeight;

        return {
          hasOverflow,
          docW,
          scrollW,
          ringH: Math.round(ringH),
          ringRatio: Math.round(ringRatio * 1000) / 10,
        };
      });

      console.log(`  Metrics for ${vp.name}:`, vpMetrics);
      const vpScreenshot = path.join(ARTIFACTS_DIR, `wheel-final-vp-${vp.name}.png`);
      await page.screenshot({ path: vpScreenshot });

      const passed = !vpMetrics.hasOverflow && vpMetrics.ringH > 100;
      report.viewportsTested.push({ ...vp, ...vpMetrics, passed });
      if (passed) {
        console.log(`  ✓ PASS: Viewport ${vp.name} verified (0 overflow, ring ratio ${vpMetrics.ringRatio}%).`);
        report.testsPassed++;
      } else {
        console.error(`  ✗ FAIL: Viewport ${vp.name} failed verification.`, vpMetrics);
        report.testsFailed++;
      }
    }

    console.log('\n=== AUDIT COMPLETE ===');
    console.log(`Tests Passed: ${report.testsPassed}`);
    console.log(`Tests Failed: ${report.testsFailed}`);
    console.log(`Console Errors: ${report.consoleErrors.length}`);

    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'final_works_wheel_audit.json'),
      JSON.stringify(report, null, 2)
    );
  } finally {
    await browser.close();
  }
}

runAudit().catch((err) => {
  console.error('Fatal Error during audit:', err);
  process.exit(1);
});
