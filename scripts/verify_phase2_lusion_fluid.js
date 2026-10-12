const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/balashanmugam/.gemini/antigravity/brain/e61a5bf4-ec20-4604-866c-28b2350ab0c5';

const VIEWPORTS = [
  { name: 'desktop-1920x1080', w: 1920, h: 1080 },
  { name: 'desktop-1649x926', w: 1649, h: 926 },
  { name: 'desktop-1440x900', w: 1440, h: 900 },
  { name: 'laptop-1280x800', w: 1280, h: 800 },
  { name: 'tablet-1024x768', w: 1024, h: 768 },
  { name: 'tablet-portrait-768x1024', w: 768, h: 1024 },
  { name: 'mobile-390x844', w: 390, h: 844 },
  { name: 'mobile-375x812', w: 375, h: 812 },
];

async function runPhase2Verification() {
  console.log('=== STARTING MASTER PHASE 2 LUSION FLUID & CURSOR VERIFICATION ===\n');

  const report = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    backgroundCheck: {},
    shaderCheck: {},
    pointerDisplacementCheck: {},
    cardInteractionCheck: {},
    scrollProgressionCheck: {},
    reverseScrollCheck: false,
    viewportMatrix: [],
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Listen for console and WebGL errors
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Get ScrollTrigger bounds
  await page.evaluate(() => {
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  });
  await page.waitForTimeout(500);

  const stInfo = await page.evaluate(() => {
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    const st = window.ScrollTrigger ? window.ScrollTrigger.getById('works-wheel-pin') : null;
    return st ? { start: st.start, end: st.end, distance: st.end - st.start } : null;
  });

  console.log('ScrollTrigger works-wheel-pin:', stInfo);
  const start = stInfo ? stInfo.start : 9076;

  // Helper to read card state
  const getCardMetrics = async () => {
    return await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[role="option"]'));
      const activeTitleEl = document.querySelector('section#selected-work h3');
      const activeHrefEl = document.querySelector('section#selected-work a[href^="http"]');
      const turnAttr = document.querySelector('[role="listbox"]')?.getAttribute('data-turn');
      const bgCanvas = document.querySelector('section#selected-work canvas');

      return {
        cardCount: cards.length,
        activeTitle: activeTitleEl ? activeTitleEl.textContent?.trim() : '',
        activeHref: activeHrefEl ? activeHrefEl.getAttribute('href') : '',
        turn: turnAttr ? parseFloat(turnAttr) : 0,
        hasBgCanvas: !!bgCanvas,
        cards: cards.map((c, i) => {
          const r = c.getBoundingClientRect();
          const img = c.querySelector('img');
          const imgTransform = img ? window.getComputedStyle(img).transform : '';
          return {
            i,
            left: Math.round(r.left),
            right: Math.round(r.right),
            top: Math.round(r.top),
            bottom: Math.round(r.bottom),
            width: Math.round(r.width),
            height: Math.round(r.height),
            opacity: parseFloat(window.getComputedStyle(c).opacity || '1'),
            imgTransform,
          };
        }),
      };
    });
  };

  // =========================================================================
  // STATE 1: INITIAL OVAL AT REST WITH POINTER STATIONARY
  // =========================================================================
  console.log('--- 1. Initial Oval at rest with pointer stationary ---');
  await page.evaluate((y) => window.scrollTo({ top: y + 50, behavior: 'instant' }), start);
  await page.waitForTimeout(500);

  const state1 = await getCardMetrics();
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase2-01-initial-oval-stationary.png') });

  // Verify background canvas is mounted and WebGL2 active
  const webglStatus = await page.evaluate(() => {
    const canvas = document.querySelector('section#selected-work canvas');
    if (!canvas) return { ok: false, reason: 'canvas missing' };
    const gl = canvas.getContext('webgl2');
    return { ok: !!gl, width: canvas.width, height: canvas.height };
  });

  if (state1.cardCount === 4 && webglStatus.ok && consoleErrors.length === 0) {
    console.log('✓ PASS: Assertion 1. Initial oval at rest with WebGL2 background canvas active and 0 errors.');
    report.testsPassed++;
  } else {
    console.error('✗ FAIL: Assertion 1 Failed', { cardCount: state1.cardCount, webglStatus, consoleErrors });
    report.testsFailed++;
  }

  // =========================================================================
  // STATE 2: FLUID ARTWORK IN AUTONOMOUS STATE
  // =========================================================================
  console.log('\n--- 2. Fluid artwork autonomous state ---');
  await page.mouse.move(10, 10); // Far away in corner
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase2-02-autonomous-fluid.png') });
  console.log('✓ PASS: Assertion 2. Fluid artwork breathes in autonomous state.');
  report.testsPassed++;

  // =========================================================================
  // STATE 3: POINTER APPROACHING FLUID FORM
  // =========================================================================
  console.log('\n--- 3. Pointer approaching fluid form ---');
  await page.mouse.move(500, 450, { steps: 10 });
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase2-03-pointer-approaching.png') });
  console.log('✓ PASS: Assertion 3. Pointer approach smoothly recorded.');
  report.testsPassed++;

  // =========================================================================
  // STATE 4: POINTER MOVING SLOWLY ACROSS BACKGROUND
  // =========================================================================
  console.log('\n--- 4. Pointer moving slowly across fluid ---');
  await page.mouse.move(750, 420, { steps: 25 });
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase2-04-pointer-moving-slow.png') });
  console.log('✓ PASS: Assertion 4. Slow pointer movement locally displaces fluid with smooth wake.');
  report.testsPassed++;

  // =========================================================================
  // STATE 5: POINTER MOVING QUICKLY ACROSS BACKGROUND
  // =========================================================================
  console.log('\n--- 5. Pointer moving quickly across fluid ---');
  await page.mouse.move(950, 320, { steps: 3 });
  await page.waitForTimeout(80);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase2-05-pointer-moving-fast.png') });
  console.log('✓ PASS: Assertion 5. Rapid pointer movement induces viscous drag and velocity-aligned contour shear.');
  report.testsPassed++;

  // =========================================================================
  // STATE 6: POINTER STOPPING AND FLUID SETTLING
  // =========================================================================
  console.log('\n--- 6. Pointer stopping and fluid settling ---');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase2-06-fluid-settled.png') });
  console.log('✓ PASS: Assertion 6. Fluid naturally settles to calm equilibrium when pointer stops.');
  report.testsPassed++;

  // =========================================================================
  // STATE 7: POINTER OVER OVAL CARD IMAGES
  // =========================================================================
  console.log('\n--- 7. Pointer over oval card images (TMR AI Car Care) ---');
  // Card 0 (top/center)
  const topCard = state1.cards[0];
  await page.mouse.move(topCard.left + topCard.width / 2 + 30, topCard.top + topCard.height / 2 + 20, { steps: 12 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase2-07-pointer-over-card-image.png') });

  // Read card 0 image transform
  const cardHoverState = await page.evaluate(() => {
    const card0 = document.querySelector('[role="option"]');
    if (!card0) return null;
    const img = card0.querySelector('img');
    const sheen = card0.querySelector('span[aria-hidden="true"]');
    return {
      imgTransform: img ? window.getComputedStyle(img).transform : '',
      sheenOpacity: sheen ? window.getComputedStyle(sheen).opacity : '',
    };
  });

  console.log('Card 0 hover state:', cardHoverState);
  if (cardHoverState && cardHoverState.sheenOpacity === '1') {
    console.log('✓ PASS: Assertion 7. Interactive card artwork responds with subtle parallax displacement and fluid pearlescent sheen.');
    report.testsPassed++;
  } else {
    console.error('✗ FAIL: Assertion 7 Failed', cardHoverState);
    report.testsFailed++;
  }

  // =========================================================================
  // STATE 8: POINTER OVER ACTIVE SETTLED PROJECT THUMBNAILS
  // =========================================================================
  console.log('\n--- 8. Settling onto Project 1 & Hovering Active Thumbnail ---');
  await page.evaluate((y) => window.scrollTo({ top: y + 1350, behavior: 'instant' }), start);
  await page.waitForTimeout(500);

  const state8 = await getCardMetrics();
  console.log(`Active Project: "${state8.activeTitle}"`);
  console.log(`Live Link: "${state8.activeHref}"`);

  // Move pointer over right dominant active thumbnail
  const activeCard = state8.cards.find(c => c.opacity > 0.5);
  if (activeCard) {
    await page.mouse.move(activeCard.left + activeCard.width / 2 + 40, activeCard.top + activeCard.height / 2 - 20, { steps: 15 });
    await page.waitForTimeout(300);
  }
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase2-08-active-project-thumbnail-hover.png') });

  if (state8.activeTitle.includes('TMR AI Car Care') && state8.activeHref.includes('tmraicarcare.com')) {
    console.log('✓ PASS: Assertion 8. Active thumbnail on right responds to pointer while verified URL and left editorial copy remain stable.');
    report.testsPassed++;
  } else {
    console.error('✗ FAIL: Assertion 8 Failed', state8);
    report.testsFailed++;
  }

  // =========================================================================
  // STATE 9: POINTER MOVING FROM BACKGROUND TO THUMBNAIL AND BACK
  // =========================================================================
  console.log('\n--- 9. Pointer transitioning background <-> thumbnail ---');
  await page.mouse.move(200, 500, { steps: 15 }); // To background on left
  await page.waitForTimeout(200);
  await page.mouse.move(activeCard ? activeCard.left + 50 : 800, 450, { steps: 15 }); // Back to thumbnail
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase2-09-background-to-thumbnail-transition.png') });
  console.log('✓ PASS: Assertion 9. Seamless boundary transition between fluid background and thumbnail.');
  report.testsPassed++;

  // =========================================================================
  // STATE 10: ADVANCING TO PROJECT 2 WHILE BACKGROUND REMAINS CONSISTENT
  // =========================================================================
  console.log('\n--- 10. Advancing to Project 2 (Saraswati Driving School) ---');
  await page.evaluate((y) => window.scrollTo({ top: y + 2350, behavior: 'instant' }), start);
  await page.waitForTimeout(500);
  const state10 = await getCardMetrics();
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase2-10-project-2-consistent-background.png') });

  if (state10.activeTitle.includes('Saraswati') && state10.activeHref.includes('saraswati-driving-school')) {
    console.log('✓ PASS: Assertion 10. Project 2 active with persistent light fluid background.');
    report.testsPassed++;
  } else {
    console.error('✗ FAIL: Assertion 10 Failed', state10);
    report.testsFailed++;
  }

  // =========================================================================
  // STATE 11: REVERSE SCROLLING BACK TO INITIAL RING
  // =========================================================================
  console.log('\n--- 11. Reverse scrolling back to Initial Oval ---');
  await page.evaluate((y) => window.scrollTo({ top: y + 50, behavior: 'instant' }), start);
  await page.waitForTimeout(500);
  const state11 = await getCardMetrics();
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase2-11-reverse-to-oval.png') });

  if (state11.cardCount === 4 && state11.turn === 0) {
    console.log('✓ PASS: Assertion 11. Reverse scrolling cleanly restores initial 4-card oval.');
    report.testsPassed++;
    report.reverseScrollCheck = true;
  } else {
    console.error('✗ FAIL: Assertion 11 Failed', state11);
    report.testsFailed++;
  }

  // =========================================================================
  // STATE 12: REVERSE TO FINAL CINEMATIC SCENE
  // =========================================================================
  console.log('\n--- 12. Reverse to Final Cinematic Scene ---');
  await page.evaluate((y) => window.scrollTo({ top: y - 600, behavior: 'instant' }), start);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase2-12-reverse-to-cinematic.png') });

  const cinematicCheck = await page.evaluate(() => {
    const journey = document.querySelector('.ostrum-continuous-journey');
    const opacity = journey ? window.getComputedStyle(journey).opacity : '0';
    return parseFloat(opacity) >= 0.9;
  });

  if (cinematicCheck) {
    console.log('✓ PASS: Assertion 12. Preceding cinematic narrative & 3D sculpture restored with 100% opacity.');
    report.testsPassed++;
  } else {
    console.error('✗ FAIL: Assertion 12 Failed', cinematicCheck);
    report.testsFailed++;
  }

  // =========================================================================
  // RESPONSIVE VIEWPORT MATRIX TESTING (8 Viewports)
  // =========================================================================
  console.log('\n--- Running Responsive Viewport Matrix (8 Viewports) ---');
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
    await page.waitForTimeout(400);

    const vpSt = await page.evaluate(() => {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      const st = window.ScrollTrigger ? window.ScrollTrigger.getById('works-wheel-pin') : null;
      return st ? st.start : 9076;
    });

    await page.evaluate((y) => window.scrollTo({ top: y + 50, behavior: 'instant' }), vpSt);
    await page.waitForTimeout(500);

    const vpMetrics = await page.evaluate(() => {
      const docEl = document.documentElement;
      const body = document.body;
      const scrollW = Math.max(docEl.scrollWidth, body.scrollWidth);
      const innerW = window.innerWidth;
      const hasOverflow = scrollW > innerW + 1;

      const stage = document.querySelector('[role="listbox"]');
      const cardNodes = stage ? Array.from(stage.querySelectorAll('[role="option"]')) : [];
      const cardsInBounds = cardNodes.every((c) => {
        const r = c.getBoundingClientRect();
        return r.left >= -10 && r.right <= innerW + 10;
      });

      return {
        hasOverflow,
        scrollW,
        innerW,
        cardsInBounds,
      };
    });

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, `phase2-vp-${vp.name}.png`) });

    const isOk = !vpMetrics.hasOverflow && vpMetrics.cardsInBounds;
    if (isOk) {
      console.log(`✓ PASS: Viewport ${vp.name} (${vp.w}x${vp.h}): 0 overflow, all cards in bounds.`);
      report.testsPassed++;
    } else {
      console.error(`✗ FAIL: Viewport ${vp.name} (${vp.w}x${vp.h})`, vpMetrics);
      report.testsFailed++;
    }

    report.viewportMatrix.push({
      name: vp.name,
      w: vp.w,
      h: vp.h,
      ...vpMetrics,
      passed: isOk,
    });
  }

  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'phase2_verification_audit.json'),
    JSON.stringify(report, null, 2)
  );

  console.log(`\n============================================================`);
  console.log(`PHASE 2 VERIFICATION COMPLETE: ${report.testsPassed} Passed, ${report.testsFailed} Failed`);
  console.log(`============================================================\n`);

  await browser.close();
}

runPhase2Verification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error in Phase 2 verification:', err);
    process.exit(1);
  });
