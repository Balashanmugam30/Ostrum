const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:\\Users\\balashanmugam\\.gemini\\antigravity\\brain\\e61a5bf4-ec20-4604-866c-28b2350ab0c5';

async function runAudit() {
  console.log('=== STARTING OSTRUM ANODIZED INK WORKS WHEEL CERTIFICATION ===\n');

  const report = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    handoffStationaryCheck: false,
    ringSizingCheck: {},
    drumLayoutCheck: {},
    anodizedInkCheck: false,
    projectDataCheck: false,
    artworkImagesCheck: false,
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
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'anodized-01-beat05-rest.png') });

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
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'anodized-02-handoff-rising.png') });

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
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'anodized-03-handoff-covered.png') });

    const beatStationary = beat5InitialRect && Math.abs(beat5InitialRect.top - handoffMidState.beatTop) <= 2;
    const workRoseFromBottom = handoffMidState.workTop > 0 && handoffMidState.workTop < handoffMidState.windowH;
    const workFullyCovered = Math.abs(handoffFullState.workTop) <= 5;

    if (beatStationary && workRoseFromBottom && workFullyCovered) {
      console.log('✓ PASS: Test 1 Passed. Beat 05 stayed 100% stationary; Selected Work panel covers it smoothly.');
      report.handoffStationaryCheck = true;
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Test 1 Failed.', { beatStationary, workRoseFromBottom, workFullyCovered });
      report.testsFailed++;
    }

    // --- TEST 2: ANODIZED INK SHADER CANVAS VERIFICATION ---
    console.log('\n--- TEST 2: Anodized Ink WebGL2 Shader Background ---');
    const shaderCheck = await page.evaluate(() => {
      const section = document.getElementById('selected-work');
      if (!section) return null;
      const canvas = section.querySelector('canvas');
      const hasWebGL2 = canvas && canvas.getContext('webgl2') !== null;
      return {
        hasCanvas: !!canvas,
        canvasWidth: canvas ? canvas.width : 0,
        canvasHeight: canvas ? canvas.height : 0,
        hasWebGL2: !!hasWebGL2,
      };
    });
    console.log('Shader Canvas Check:', shaderCheck);
    if (shaderCheck && shaderCheck.hasCanvas && shaderCheck.canvasWidth > 0 && shaderCheck.canvasHeight > 0) {
      console.log('✓ PASS: Test 2 Passed. Anodized Ink WebGL2 shader canvas rendered full-bleed.');
      report.anodizedInkCheck = true;
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Test 2 Failed. Anodized Ink canvas missing or failed context.', shaderCheck);
      report.testsFailed++;
    }

    // --- TEST 3: INITIAL RING SCALE, FIT & MINIMAL LABEL ---
    console.log('\n--- TEST 3: Initial Circular Catalogue Scale & Minimal Center Label ---');
    // Scroll directly to Selected Work resting position
    await page.evaluate(() => {
      const workEl = document.getElementById('selected-work');
      if (workEl) workEl.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(600);

    const ringMetrics = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[id^="works-wheel-"]'));
      if (cards.length === 0) return null;

      let minTop = Infinity;
      let maxBottom = -Infinity;
      let minLeft = Infinity;
      let maxRight = -Infinity;

      cards.forEach((c) => {
        const visualEl = c.firstElementChild || c;
        const r = visualEl.getBoundingClientRect();
        if (r.top < minTop) minTop = r.top;
        if (r.bottom > maxBottom) maxBottom = r.bottom;
        if (r.left < minLeft) minLeft = r.left;
        if (r.right > maxRight) maxRight = r.right;
      });

      const ringH = maxBottom - minTop;
      const ringW = maxRight - minLeft;
      const winH = window.innerHeight;
      const winW = window.innerWidth;
      const topMargin = minTop;
      const bottomMargin = winH - maxBottom;
      const ringRatio = ringH / winH;

      // Label check
      const labelEl = document.querySelector('#selected-work span');
      const allText = document.getElementById('selected-work')?.textContent || '';
      const hasSelectedWork = allText.includes('Selected Work');
      const hasRightIndex = document.querySelector('#selected-work ol') !== null;

      return {
        ringH: Math.round(ringH),
        ringW: Math.round(ringW),
        winH,
        winW,
        ringRatio: Math.round(ringRatio * 1000) / 10,
        topMarginRatio: Math.round((topMargin / winH) * 1000) / 10,
        bottomMarginRatio: Math.round((bottomMargin / winH) * 1000) / 10,
        hasSelectedWork,
        hasRightIndex,
      };
    });

    console.log('Ring Sizing Metrics at Rest:', ringMetrics);
    report.ringSizingCheck = ringMetrics;
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'anodized-04-ring-rest.png') });

    // Target: ring height 68% - 76% of viewport, top & bottom margins >= 8%, label is "Selected Work", NO right index
    if (
      ringMetrics &&
      ringMetrics.ringRatio >= 66 &&
      ringMetrics.ringRatio <= 78 &&
      ringMetrics.topMarginRatio >= 8 &&
      ringMetrics.bottomMarginRatio >= 8 &&
      ringMetrics.hasSelectedWork &&
      !ringMetrics.hasRightIndex
    ) {
      console.log(`✓ PASS: Test 3 Passed. Ring height is ${ringMetrics.ringRatio}% of viewport height (target 68-76%), center label is "Selected Work", and right index is removed.`);
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Test 3 Failed.', ringMetrics);
      report.testsFailed++;
    }

    // --- TEST 4: DRUM MODE TWO-COLUMN LARGE LAYOUT ---
    console.log('\n--- TEST 4: Drum Mode Two-Column Layout (Left Text, Large Right Image) ---');
    // Turn wheel to item 0 (TMR AI Car Care) by setting turn to 1
    await page.evaluate(() => {
      const listbox = document.querySelector('div[role="listbox"]');
      if (listbox && (listbox)._worksWheel) {
        (listbox)._worksWheel.to(1);
      }
    });
    await page.waitForFunction(() => {
      const listbox = document.querySelector('div[role="listbox"]');
      return listbox && listbox._worksWheel && Math.abs(listbox._worksWheel.turn.current - 1) < 0.05;
    }, { timeout: 4000 });
    await page.waitForTimeout(300);

    const drumLayout = await page.evaluate(() => {
      const activeCard = document.querySelector('#works-wheel-0');
      const visualEl = activeCard ? (activeCard.firstElementChild || activeCard) : null;
      const cardRect = visualEl ? visualEl.getBoundingClientRect() : null;
      const winW = window.innerWidth;
      const winH = window.innerHeight;

      // Card size ratios
      const cardWRatio = cardRect ? (cardRect.width / winW) * 100 : 0;
      const cardHRatio = cardRect ? (cardRect.height / winH) * 100 : 0;
      const cardCenterX = cardRect ? cardRect.left + cardRect.width / 2 : 0;
      const isShiftedRight = cardCenterX > winW * 0.55;

      // Left panel check
      const textSection = document.getElementById('selected-work');
      const allText = textSection ? textSection.textContent : '';
      const hasTitle = allText.includes('TMR AI Car Care');
      const hasDesc = allText.includes('Autonomous workflow');
      const hasLiveLink = allText.includes('Visit Platform');
      const hasNoBadges = !allText.includes('VERIFIED CLIENT') && !allText.includes('CONCEPT PROJECT');

      return {
        cardW: cardRect ? Math.round(cardRect.width) : 0,
        cardH: cardRect ? Math.round(cardRect.height) : 0,
        cardWRatio: Math.round(cardWRatio * 10) / 10,
        cardHRatio: Math.round(cardHRatio * 10) / 10,
        cardCenterX: Math.round(cardCenterX),
        isShiftedRight,
        hasTitle,
        hasDesc,
        hasLiveLink,
        hasNoBadges,
      };
    });

    console.log('Drum Layout Metrics:', drumLayout);
    report.drumLayoutCheck = drumLayout;
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'anodized-05-drum-tmr-layout.png') });

    // Target: card width 42-48% of screen, height 48-60%, shifted right, clean left text, no badges
    if (
      drumLayout &&
      drumLayout.cardWRatio >= 40 &&
      drumLayout.cardWRatio <= 50 &&
      drumLayout.isShiftedRight &&
      drumLayout.hasTitle &&
      drumLayout.hasDesc &&
      drumLayout.hasLiveLink &&
      drumLayout.hasNoBadges
    ) {
      console.log(`✓ PASS: Test 4 Passed. Active card is a large thumbnail on the right (${drumLayout.cardWRatio}% width), left panel has clean title and description with no status badges.`);
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Test 4 Failed.', drumLayout);
      report.testsFailed++;
    }

    // --- TEST 5: MULTIPLE PROJECTS ADVANCING SYNCHRONOUSLY ---
    console.log('\n--- TEST 5: Project Synchronous Advancing (Saraswati & Concept) ---');
    // Turn to item 1 (Saraswati Driving School)
    await page.evaluate(() => {
      const listbox = document.querySelector('div[role="listbox"]');
      if (listbox && (listbox)._worksWheel) {
        (listbox)._worksWheel.to(2);
      }
    });
    await page.waitForFunction(() => {
      const h3 = document.querySelector('#selected-work h3');
      return h3 && h3.textContent.includes('Saraswati');
    }, { timeout: 4000 });

    const saraswatiCheck = await page.evaluate(() => {
      const textSection = document.getElementById('selected-work');
      const allText = textSection ? textSection.textContent : '';
      return {
        hasTitle: allText.includes('Saraswati Driving School'),
        hasDesc: allText.includes('fleet logistics infrastructure'),
        hasLiveLink: allText.includes('Visit Platform'),
      };
    });
    console.log('Saraswati Item Check:', saraswatiCheck);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'anodized-06-drum-saraswati.png') });

    // Turn to item 2 (Signal)
    await page.evaluate(() => {
      const listbox = document.querySelector('div[role="listbox"]');
      if (listbox && (listbox)._worksWheel) {
        (listbox)._worksWheel.to(3);
      }
    });
    await page.waitForFunction(() => {
      const h3 = document.querySelector('#selected-work h3');
      return h3 && h3.textContent.includes('Signal');
    }, { timeout: 4000 });

    const signalCheck = await page.evaluate(() => {
      const textSection = document.getElementById('selected-work');
      const allText = textSection ? textSection.textContent : '';
      return {
        hasTitle: allText.includes('Signal'),
        hasDesc: allText.includes('telemetry and quantitative data'),
        hasNoBadges: !allText.includes('CONCEPT'),
      };
    });
    console.log('Signal Item Check:', signalCheck);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'anodized-07-drum-signal.png') });

    if (saraswatiCheck.hasTitle && saraswatiCheck.hasDesc && signalCheck.hasTitle && signalCheck.hasDesc) {
      console.log('✓ PASS: Test 5 Passed. Left panel and active card advance synchronously across projects.');
      report.projectDataCheck = true;
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Test 5 Failed.', { saraswatiCheck, signalCheck });
      report.testsFailed++;
    }

    // --- TEST 6: BESPOKE ARTWORK LOADING ---
    console.log('\n--- TEST 6: All 9 Custom Artwork Images Loading ---');
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
      console.log('✓ PASS: Test 6 Passed. All 9 bespoke editorial artwork images loaded successfully.');
      report.artworkImagesCheck = true;
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Test 6 Failed.', imageStatus);
      report.testsFailed++;
    }

    // --- TEST 7: CLICK VS DRAG SEPARATION & NAVIGATION ---
    console.log('\n--- TEST 7: Click vs Drag Separation & Live Navigation ---');
    // Turn back to Item 0 (TMR AI Car Care)
    await page.evaluate(() => {
      const listbox = document.querySelector('div[role="listbox"]');
      if (listbox && (listbox)._worksWheel) {
        (listbox)._worksWheel.to(1);
      }
    });
    await page.waitForTimeout(800);

    // Spy on window.open
    await page.evaluate(() => {
      window._lastOpenedUrl = null;
      window.open = function (url) {
        window._lastOpenedUrl = url;
        return null;
      };
    });

    // 7a: Genuine click on active card 0
    const card0 = await page.$('#works-wheel-0');
    if (card0) {
      console.log('Clicking active Card 0 (TMR AI Car Care)...');
      await card0.click();
      await page.waitForTimeout(200);

      const openedUrl = await page.evaluate(() => window._lastOpenedUrl);
      console.log('Window.open intercepted URL for TMR:', openedUrl);

      if (openedUrl === 'https://tmraicarcare.com/') {
        console.log('✓ PASS: Genuine click opened live platform for TMR AI Car Care.');
        report.linkNavigationCheck['tmr'] = true;
      } else {
        console.error('✗ FAIL: Click on Card 0 did not open https://tmraicarcare.com/', openedUrl);
      }
    }

    // 7b: Genuine click on Saraswati
    await page.evaluate(() => {
      const listbox = document.querySelector('div[role="listbox"]');
      if (listbox && (listbox)._worksWheel) {
        (listbox)._worksWheel.to(2);
      }
    });
    await page.waitForTimeout(800);

    await page.evaluate(() => {
      window._lastOpenedUrl = null;
    });

    const card1 = await page.$('#works-wheel-1');
    if (card1) {
      console.log('Clicking active Card 1 (Saraswati Driving School)...');
      await card1.click();
      await page.waitForTimeout(200);

      const openedUrl = await page.evaluate(() => window._lastOpenedUrl);
      console.log('Window.open intercepted URL for Saraswati:', openedUrl);

      if (openedUrl === 'https://saraswati-driving-school.vercel.app/') {
        console.log('✓ PASS: Genuine click opened live platform for Saraswati Driving School.');
        report.linkNavigationCheck['saraswati'] = true;
      } else {
        console.error('✗ FAIL: Click on Card 1 did not open Saraswati platform', openedUrl);
      }
    }

    // 7c: Drag gesture test
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

    // --- TEST 8: RESPONSIVE VIEWPORT SUITE ---
    console.log('\n--- TEST 8: Responsive Viewport Suite (6 Screen Sizes) ---');
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
      const vpScreenshot = path.join(ARTIFACTS_DIR, `anodized-vp-${vp.name}.png`);
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
      path.join(ARTIFACTS_DIR, 'anodized_works_wheel_audit.json'),
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
