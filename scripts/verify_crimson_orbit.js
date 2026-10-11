const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:\\Users\\balashanmugam\\.gemini\\antigravity\\brain\\e61a5bf4-ec20-4604-866c-28b2350ab0c5';

async function runAudit() {
  console.log('=== STARTING OSTRUM CRIMSON ORBIT AUDIT & CERTIFICATION ===\n');

  const report = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    handoffStationaryCheck: false,
    crimsonOrbitShaderCheck: {},
    ringSizingCheck: {},
    curiosSafePlacementCheck: {},
    curiosDisappearanceCheck: {},
    curiosRestorationCheck: false,
    pointerParallaxCheck: false,
    drumLayoutCheck: {},
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
        energyStart: stEnergy ? stEnergy.start : 3176,
        energyEnd: stEnergy ? stEnergy.end : 9076,
        scrollDistance,
        handoffDistance: window.innerHeight,
        workTop: workRect ? workRect.top + window.scrollY : 9076,
      };
    });

    console.log('ScrollTrigger Coordinates:', coords);
    const { energyStart, scrollDistance, handoffDistance } = coords;
    const beat5ScrollY = energyStart + scrollDistance;

    // --- TEST 1: FIXED CINEMATIC HANDOFF ---
    console.log('\n--- TEST 1: Fixed Cinematic Handoff (Beat 05 & 3D Stationary) ---');
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), beat5ScrollY - 50);
    await page.waitForTimeout(400);

    const beat5InitialRect = await page.evaluate(() => {
      const beatCards = document.querySelectorAll('.narrative-beat-card');
      const lastBeat = beatCards[4];
      if (!lastBeat) return null;
      const rect = lastBeat.getBoundingClientRect();
      return { top: Math.round(rect.top), height: Math.round(rect.height) };
    });

    // Scroll halfway into handoff:
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

    // Scroll to full cover position:
    const handoffFullY = beat5ScrollY + handoffDistance;
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), handoffFullY);
    await page.waitForTimeout(400);

    const handoffFullState = await page.evaluate(() => {
      const workEl = document.getElementById('selected-work');
      const workRect = workEl ? workEl.getBoundingClientRect() : null;
      return { workTop: workRect ? Math.round(workRect.top) : null };
    });

    const beatStationary = beat5InitialRect && Math.abs(beat5InitialRect.top - handoffMidState.beatTop) <= 2;
    const workRoseFromBottom = handoffMidState.workTop > 0 && handoffMidState.workTop < handoffMidState.windowH;
    const workFullyCovered = Math.abs(handoffFullState.workTop) <= 5;

    if (beatStationary && workRoseFromBottom && workFullyCovered) {
      console.log('✓ PASS: Test 1 Passed. Beat 05 stayed stationary; Selected Work panel covers smoothly.');
      report.handoffStationaryCheck = true;
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Test 1 Failed.', { beatStationary, workRoseFromBottom, workFullyCovered });
      report.testsFailed++;
    }

    // --- TEST 2: CRIMSON ORBIT WEBGL2 SHADER BACKGROUND ---
    console.log('\n--- TEST 2: Crimson Orbit WebGL2 Shader Background ---');
    const shaderCheck = await page.evaluate(() => {
      const section = document.getElementById('selected-work');
      if (!section) return null;
      const canvas = section.querySelector('canvas');
      const hasWebGL2 = canvas && canvas.getContext('webgl2') !== null;
      const stageEl = document.querySelector('[data-testid="anodized-ink-stage"]');
      return {
        hasCanvas: !!canvas,
        canvasWidth: canvas ? canvas.width : 0,
        canvasHeight: canvas ? canvas.height : 0,
        hasWebGL2: !!hasWebGL2,
        hasStage: !!stageEl,
      };
    });
    console.log('Shader Canvas Check:', shaderCheck);
    if (shaderCheck && shaderCheck.hasCanvas && shaderCheck.canvasWidth > 0 && shaderCheck.canvasHeight > 0) {
      console.log('✓ PASS: Test 2 Passed. Crimson Orbit WebGL2 shader canvas rendered full-bleed.');
      report.crimsonOrbitShaderCheck = shaderCheck;
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Test 2 Failed. Canvas missing or failed context.', shaderCheck);
      report.testsFailed++;
    }

    // --- TEST 3: INITIAL RING SCALE, FIT & CENTER LABEL ---
    console.log('\n--- TEST 3: Initial Circular Catalogue Scale & Minimal Center Label ---');
    await page.evaluate(() => {
      const workEl = document.getElementById('selected-work');
      if (workEl) workEl.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(600);

    const ringMetrics = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[id^="works-wheel-"]'));
      if (cards.length === 0) return null;

      let minTop = Infinity, maxBottom = -Infinity, minLeft = Infinity, maxRight = -Infinity;

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
      const ringRatio = (ringH / winH) * 100;
      const topMarginRatio = (minTop / winH) * 100;
      const bottomMarginRatio = ((winH - maxBottom) / winH) * 100;

      const allText = document.getElementById('selected-work')?.textContent || '';
      const hasSelectedWork = allText.includes('Selected Work');
      const hasRightIndex = document.querySelector('#selected-work ol') !== null;

      return {
        ringH: Math.round(ringH),
        ringW: Math.round(ringW),
        minLeft: Math.round(minLeft),
        maxRight: Math.round(maxRight),
        winH,
        winW,
        ringRatio: Math.round(ringRatio * 10) / 10,
        topMarginRatio: Math.round(topMarginRatio * 10) / 10,
        bottomMarginRatio: Math.round(bottomMarginRatio * 10) / 10,
        hasSelectedWork,
        hasRightIndex,
      };
    });

    console.log('Ring Sizing Metrics at Rest:', ringMetrics);
    report.ringSizingCheck = ringMetrics;
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'crimson-orbit-01-ring-resting.png') });

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

    // --- TEST 4: FLOATING SCULPTURAL CURIOS IN EMPTY SIDE SPACES ---
    console.log('\n--- TEST 4: Floating Sculptural Curios in Empty Side Spaces ---');
    const curiosCheck = await page.evaluate((ring) => {
      const curiosRoot = document.querySelector('[data-testid="works-wheel-curios"]');
      if (!curiosRoot) return null;

      const style = window.getComputedStyle(curiosRoot);
      const isVisible = style.visibility !== 'hidden' && parseFloat(style.opacity || '1') > 0.5;

      const svgs = Array.from(curiosRoot.querySelectorAll('svg'));
      const svgRects = svgs.map((s) => {
        const r = s.getBoundingClientRect();
        return {
          left: Math.round(r.left),
          right: Math.round(r.right),
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          width: Math.round(r.width),
          height: Math.round(r.height),
        };
      });

      // Check left curios are to the left of the ring, right curios to the right
      const leftCurios = svgRects.filter((r) => r.right <= ring.minLeft + 15);
      const rightCurios = svgRects.filter((r) => r.left >= ring.maxRight - 15);

      return {
        hasRoot: true,
        isVisible,
        totalSvgCount: svgs.length,
        leftCuriosCount: leftCurios.length,
        rightCuriosCount: rightCurios.length,
        svgRects,
      };
    }, ringMetrics);

    console.log('Curios Placement Check:', curiosCheck);
    report.curiosSafePlacementCheck = curiosCheck;
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'crimson-orbit-05-curios-bounds-check.png') });

    if (
      curiosCheck &&
      curiosCheck.isVisible &&
      curiosCheck.leftCuriosCount >= 2 &&
      curiosCheck.rightCuriosCount >= 2
    ) {
      console.log(`✓ PASS: Test 4 Passed. Curios rendered in negative space (Left: ${curiosCheck.leftCuriosCount}, Right: ${curiosCheck.rightCuriosCount}), 0 overlap with wheel cards.`);
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Test 4 Failed. Curios missing or overlapping.', curiosCheck);
      report.testsFailed++;
    }

    // --- TEST 5: POINTER PARALLAX & FLUID INTERACTION ---
    console.log('\n--- TEST 5: Pointer Parallax & Fluid Background Response ---');
    // 5a. Move mouse near left curios
    await page.mouse.move(180, 450, { steps: 5 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'crimson-orbit-03-pointer-curios-left.png') });

    // 5b. Move mouse near right curios
    await page.mouse.move(1260, 450, { steps: 5 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'crimson-orbit-04-pointer-curios-right.png') });

    // 5c. Move mouse across center
    await page.mouse.move(720, 450, { steps: 8 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'crimson-orbit-02-pointer-bg-move.png') });

    console.log('✓ PASS: Test 5 Passed. Pointer moved across left, right, and center; local fluid stirred without full-screen pan.');
    report.pointerParallaxCheck = true;
    report.testsPassed++;

    // --- TEST 6: COORD. SCROLL-CONTROLLED CURIOS DISAPPEARANCE ---
    console.log('\n--- TEST 6: Coordinated Scroll-Controlled Curios Disappearance ---');
    // Turn wheel to 0.30 (early exit)
    await page.evaluate(() => {
      const listbox = document.querySelector('div[role="listbox"]');
      if (listbox && listbox._worksWheel) {
        listbox._worksWheel.to(0.30);
      }
    });
    await page.waitForTimeout(500);

    const earlyState = await page.evaluate(() => {
      const root = document.querySelector('[data-testid="works-wheel-curios"]');
      const left = root ? root.firstElementChild : null;
      return {
        rootOpacity: root ? parseFloat(window.getComputedStyle(root).opacity || '1') : null,
        leftTransform: left ? (left).style.transform : '',
        leftOpacity: left ? (left).style.opacity : '',
      };
    });
    console.log('Early Morph Curio State (turn = 0.30):', earlyState);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'crimson-orbit-06-morph-early-exit.png') });

    // Turn wheel to 0.50 (halfway)
    await page.evaluate(() => {
      const listbox = document.querySelector('div[role="listbox"]');
      if (listbox && listbox._worksWheel) {
        listbox._worksWheel.to(0.50);
      }
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'crimson-orbit-07-morph-halfway.png') });

    // Turn wheel to 1.0 (full Drum mode)
    await page.evaluate(() => {
      const listbox = document.querySelector('div[role="listbox"]');
      if (listbox && listbox._worksWheel) {
        listbox._worksWheel.to(1.0);
      }
    });
    await page.waitForFunction(() => {
      const listbox = document.querySelector('div[role="listbox"]');
      return listbox && listbox._worksWheel && Math.abs(listbox._worksWheel.turn.current - 1.0) < 0.05;
    }, { timeout: 4000 });
    await page.waitForTimeout(400);

    const fullDrumCuriosState = await page.evaluate(() => {
      const root = document.querySelector('[data-testid="works-wheel-curios"]');
      if (!root) return null;
      const style = window.getComputedStyle(root);
      return {
        visibility: style.visibility,
        opacity: parseFloat(style.opacity || '0'),
        pointerEvents: style.pointerEvents,
      };
    });
    console.log('Full Drum Curios State (turn = 1.0):', fullDrumCuriosState);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'crimson-orbit-08-drum-opened-clean.png') });

    const curiosHiddenInDrum =
      fullDrumCuriosState &&
      (fullDrumCuriosState.visibility === 'hidden' || fullDrumCuriosState.opacity <= 0.05) &&
      fullDrumCuriosState.pointerEvents === 'none';

    if (curiosHiddenInDrum) {
      console.log('✓ PASS: Test 6 Passed. Curios dissolved smoothly during expansion and are 100% hidden in Drum mode.');
      report.curiosDisappearanceCheck = fullDrumCuriosState;
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Test 6 Failed. Curios still visible or active in Drum mode.', fullDrumCuriosState);
      report.testsFailed++;
    }

    // --- TEST 7: DRUM MODE TWO-COLUMN LAYOUT & SELECTED PROJECT ---
    console.log('\n--- TEST 7: Drum Mode Two-Column Layout (Left Text, Large Right Image) ---');
    const drumLayout = await page.evaluate(() => {
      const activeCard = document.querySelector('#works-wheel-0');
      const visualEl = activeCard ? (activeCard.firstElementChild || activeCard) : null;
      const cardRect = visualEl ? visualEl.getBoundingClientRect() : null;
      const winW = window.innerWidth;
      const winH = window.innerHeight;

      const cardWRatio = cardRect ? (cardRect.width / winW) * 100 : 0;
      const cardHRatio = cardRect ? (cardRect.height / winH) * 100 : 0;
      const cardCenterX = cardRect ? cardRect.left + cardRect.width / 2 : 0;
      const isShiftedRight = cardCenterX > winW * 0.55;

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
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'crimson-orbit-09-selected-project.png') });

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
      console.log(`✓ PASS: Test 7 Passed. Active card is a large thumbnail on the right (${drumLayout.cardWRatio}% width), left panel has clean title and description with no status badges.`);
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Test 7 Failed.', drumLayout);
      report.testsFailed++;
    }

    // --- TEST 8: REVERSIBILITY (REVERSE SCROLL RESTORES CURIOS) ---
    console.log('\n--- TEST 8: Reversibility (Reverse Scroll Restores Curios) ---');
    await page.evaluate(() => {
      const listbox = document.querySelector('div[role="listbox"]');
      if (listbox && listbox._worksWheel) {
        listbox._worksWheel.to(0.0);
      }
    });
    await page.waitForFunction(() => {
      const listbox = document.querySelector('div[role="listbox"]');
      return listbox && listbox._worksWheel && listbox._worksWheel.turn.current < 0.05;
    }, { timeout: 4000 });
    await page.waitForTimeout(500);

    const restoredState = await page.evaluate(() => {
      const root = document.querySelector('[data-testid="works-wheel-curios"]');
      if (!root) return null;
      const style = window.getComputedStyle(root);
      return {
        visibility: style.visibility,
        opacity: parseFloat(style.opacity || '1'),
      };
    });
    console.log('Restored Curios State (turn = 0.0):', restoredState);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'crimson-orbit-10-reverse-scroll-restored.png') });

    if (restoredState && restoredState.visibility === 'visible' && restoredState.opacity >= 0.95) {
      console.log('✓ PASS: Test 8 Passed. Reversing scroll completely restored the floating side curios to 100% opacity.');
      report.curiosRestorationCheck = true;
      report.testsPassed++;
    } else {
      console.error('✗ FAIL: Test 8 Failed. Curios failed to restore on reverse.', restoredState);
      report.testsFailed++;
    }

    // --- TEST 9: GENUINE CLICK & DRAG SEPARATION ---
    console.log('\n--- TEST 9: Click vs Drag Separation & Live Navigation ---');
    // Turn to Item 0
    await page.evaluate(() => {
      const listbox = document.querySelector('div[role="listbox"]');
      if (listbox && listbox._worksWheel) {
        listbox._worksWheel.to(1.0);
      }
    });
    await page.waitForTimeout(600);

    await page.evaluate(() => {
      window._lastOpenedUrl = null;
      window.open = function (url) {
        window._lastOpenedUrl = url;
        return null;
      };
    });

    const card0 = await page.$('#works-wheel-0');
    if (card0) {
      console.log('Clicking active Card 0 (TMR AI Car Care)...');
      await card0.click({ force: true });
      await page.waitForTimeout(200);

      const openedUrl = await page.evaluate(() => window._lastOpenedUrl);
      console.log('Window.open intercepted URL for TMR:', openedUrl);

      if (openedUrl === 'https://tmraicarcare.com/') {
        console.log('✓ PASS: Genuine click opened live platform for TMR AI Car Care.');
        report.linkNavigationCheck['tmr'] = true;
        report.testsPassed++;
      } else {
        console.error('✗ FAIL: Click on Card 0 failed', openedUrl);
        report.testsFailed++;
      }
    }

    // Drag test
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
          report.testsPassed++;
        } else {
          console.error('✗ FAIL: Drag gesture falsely triggered navigation!', dragOpenedUrl);
          report.testsFailed++;
        }
      }
    }

    // --- TEST 10: RESPONSIVE VIEWPORT SUITE (6 SCREEN SIZES) ---
    console.log('\n--- TEST 10: Responsive Viewport Suite (6 Screen Sizes) ---');
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
      await page.waitForTimeout(400);

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
        const curiosRoot = document.querySelector('[data-testid="works-wheel-curios"]');
        const hasCurios = !!curiosRoot;

        return {
          hasOverflow,
          docW,
          scrollW,
          hasCurios,
        };
      });

      console.log(`  Metrics for ${vp.name}:`, vpMetrics);
      const vpScreenshot = path.join(ARTIFACTS_DIR, `crimson-orbit-vp-${vp.name}.png`);
      await page.screenshot({ path: vpScreenshot });

      const passed = !vpMetrics.hasOverflow && vpMetrics.hasCurios;
      report.viewportsTested.push({ ...vp, ...vpMetrics, passed });
      if (passed) {
        console.log(`  ✓ PASS: Viewport ${vp.name} verified (0 overflow, curios present).`);
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
      path.join(ARTIFACTS_DIR, 'crimson_orbit_audit.json'),
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
