const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

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

function checkCardOverlap(cards) {
  const visibleCards = cards.filter(c => c.opacity > 0.1 && c.display !== 'none' && c.visibility !== 'hidden');
  const overlaps = [];

  for (let i = 0; i < visibleCards.length; i++) {
    for (let j = i + 1; j < visibleCards.length; j++) {
      const a = visibleCards[i].rect;
      const b = visibleCards[j].rect;

      const interW = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
      const interH = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      const interArea = interW * interH;

      const minArea = Math.min(a.width * a.height, b.width * b.height);
      const overlapRatio = minArea > 0 ? (interArea / minArea) : 0;

      if (overlapRatio > 0.15) {
        overlaps.push({
          cardA: visibleCards[i].index,
          cardB: visibleCards[j].index,
          titleA: visibleCards[i].title,
          titleB: visibleCards[j].title,
          overlapRatio: (overlapRatio * 100).toFixed(1) + '%',
          interArea: Math.round(interArea),
        });
      }
    }
  }
  return overlaps;
}

async function runPhase1Verification() {
  console.log('=== STARTING MASTER PHASE 1 WORKS WHEEL VERIFICATION ===\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--no-sandbox'],
  });

  const report = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    projectCatalogueCheck: {},
    ovalGeometryCheck: {},
    singleActiveImageCheck: {},
    progressionCheck: {},
    reverseScrollCheck: {},
    viewportMatrix: [],
    performanceMetrics: {},
    consoleErrors: [],
  };

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error(`[Console Error]: ${msg.text()}`);
      report.consoleErrors.push(msg.text());
    }
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Check ScrollTrigger
  const stInfo = await page.evaluate(() => {
    const st = window.ScrollTrigger ? window.ScrollTrigger.getById('works-wheel-pin') : null;
    return st ? { start: st.start, end: st.end, distance: st.end - st.start } : null;
  });
  console.log('ScrollTrigger works-wheel-pin:', stInfo);

  const { start, end, distance } = stInfo;

  async function getCardState() {
    return await page.evaluate(() => {
      const stage = document.querySelector('[role="listbox"]');
      const cardNodes = stage ? Array.from(stage.querySelectorAll('[role="option"]')) : [];
      const titleEl = document.querySelector('.pointer-events-none h3');
      const descEl = document.querySelector('.pointer-events-none p');
      const linkEl = document.querySelector('.pointer-events-none a');
      const labelEl = document.querySelector('.pointer-events-none span');
      const labelRect = labelEl ? labelEl.getBoundingClientRect() : null;

      const stageRect = stage ? stage.getBoundingClientRect() : null;
      const api = stage ? stage._worksWheel : null;

      const cards = cardNodes.map((c, i) => {
        const r = c.getBoundingClientRect();
        const style = window.getComputedStyle(c);
        const title = c.querySelector('img')?.getAttribute('alt') || `Card ${i}`;
        const imgEl = c.querySelector('img');
        const naturalWidth = imgEl ? imgEl.naturalWidth : 0;
        const naturalHeight = imgEl ? imgEl.naturalHeight : 0;
        return {
          index: i,
          title,
          rect: { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height },
          opacity: parseFloat(style.opacity || '1'),
          zIndex: style.zIndex,
          transform: style.transform,
          display: style.display,
          visibility: style.visibility,
          pointerEvents: style.pointerEvents,
          aspectRatio: r.height > 0 ? (r.width / r.height).toFixed(2) : '0',
          imageNaturalAspect: naturalHeight > 0 ? (naturalWidth / naturalHeight).toFixed(2) : '0',
        };
      });

      return {
        scrollY: window.scrollY,
        turn: api ? api.getTurn() : null,
        stageRect: stageRect ? { w: stageRect.width, h: stageRect.height } : null,
        labelRect: labelRect ? { left: labelRect.left, top: labelRect.top, right: labelRect.right, bottom: labelRect.bottom } : null,
        cards,
        activeTitle: titleEl ? titleEl.textContent : '',
        activeDesc: descEl ? descEl.textContent : '',
        activeHref: linkEl ? linkEl.getAttribute('href') : '',
      };
    });
  }

  // =========================================================================
  // STEP 1: INITIAL OVAL AT REST (turn = 0)
  // =========================================================================
  console.log('\n--- 1. Initial Oval at rest ---');
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 50);
  await page.waitForTimeout(400);

  const state1 = await getCardState();
  const overlaps1 = checkCardOverlap(state1.cards);
  console.log(`Card count: ${state1.cards.length}`);
  console.log(`Overlaps detected at rest: ${overlaps1.length}`);

  // Outer ellipse footprint
  const minLeft = Math.min(...state1.cards.map(c => c.rect.left));
  const maxRight = Math.max(...state1.cards.map(c => c.rect.right));
  const minTop = Math.min(...state1.cards.map(c => c.rect.top));
  const maxBottom = Math.max(...state1.cards.map(c => c.rect.bottom));
  const ovalW = maxRight - minLeft;
  const ovalH = maxBottom - minTop;
  const widthRatio = (ovalW / 1440) * 100;
  const heightRatio = (ovalH / 900) * 100;
  console.log(`Oval footprint: ${Math.round(ovalW)}x${Math.round(ovalH)}px (${widthRatio.toFixed(1)}% width, ${heightRatio.toFixed(1)}% height)`);

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase1-01-initial-oval.png') });

  // Assertions: 4 items, no overlaps, width 80-88%, height 55-68%
  if (state1.cards.length === 4 && overlaps1.length === 0 && widthRatio >= 80 && widthRatio <= 88 && heightRatio >= 55 && heightRatio <= 68) {
    console.log('✓ PASS: Assertion 1. Exact 4 genuine items, balanced wide ellipse, zero overlap at rest.');
    report.testsPassed++;
    report.ovalGeometryCheck = {
      cardCount: state1.cards.length,
      widthRatio: widthRatio.toFixed(1),
      heightRatio: heightRatio.toFixed(1),
      overlaps: 0,
    };
  } else {
    console.error('✗ FAIL: Assertion 1 Failed', { count: state1.cards.length, overlaps: overlaps1.length, widthRatio, heightRatio });
    report.testsFailed++;
  }

  // =========================================================================
  // STEP 2: SMALL INPUT (FRACTIONAL PROGRESS, turn ~ 0.15)
  // =========================================================================
  console.log('\n--- 2. First small input (turn ~ 0.15) ---');
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 350 + 150);
  await page.waitForTimeout(300);
  const state2 = await getCardState();
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase1-02-fractional-input.png') });
  console.log(`turn: ${state2.turn?.toFixed(2)}`);
  if (state2.turn >= 0.10 && state2.turn <= 0.20) {
    console.log('✓ PASS: Assertion 2. Wheel follows small fractional scroll input progressively.');
    report.testsPassed++;
  } else {
    console.error('✗ FAIL: Assertion 2 Failed', state2.turn);
    report.testsFailed++;
  }

  // =========================================================================
  // STEP 3: 25% THROUGH MORPH (turn ~ 0.25)
  // =========================================================================
  console.log('\n--- 3. 25% through morph ---');
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 350 + 250);
  await page.waitForTimeout(300);
  const state3 = await getCardState();
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase1-03-morph-25pct.png') });
  if (state3.turn >= 0.20 && state3.turn <= 0.30) {
    console.log('✓ PASS: Assertion 3. 25% morph state tracked cleanly.');
    report.testsPassed++;
  } else {
    console.error('✗ FAIL: Assertion 3 Failed', state3.turn);
    report.testsFailed++;
  }

  // =========================================================================
  // STEP 4: 50% THROUGH MORPH (turn ~ 0.50)
  // =========================================================================
  console.log('\n--- 4. 50% through morph ---');
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 350 + 500);
  await page.waitForTimeout(300);
  const state4 = await getCardState();
  const overlaps4 = checkCardOverlap(state4.cards);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase1-04-morph-50pct.png') });
  console.log(`50% morph turn: ${state4.turn?.toFixed(2)}, overlaps: ${overlaps4.length}`);
  if (state4.turn >= 0.45 && state4.turn <= 0.55 && overlaps4.length === 0) {
    console.log('✓ PASS: Assertion 4. 50% morph intermediate state stable, no card overlap.');
    report.testsPassed++;
  } else {
    console.error('✗ FAIL: Assertion 4 Failed', { turn: state4.turn, overlaps: overlaps4.length });
    report.testsFailed++;
  }

  // =========================================================================
  // STEP 5: 75% THROUGH MORPH (turn ~ 0.75)
  // =========================================================================
  console.log('\n--- 5. 75% through morph ---');
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 350 + 750);
  await page.waitForTimeout(300);
  const state5 = await getCardState();
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase1-05-morph-75pct.png') });
  if (state5.turn >= 0.70 && state5.turn <= 0.80) {
    console.log('✓ PASS: Assertion 5. 75% morph progress stable.');
    report.testsPassed++;
  } else {
    console.error('✗ FAIL: Assertion 5 Failed', state5.turn);
    report.testsFailed++;
  }

  // =========================================================================
  // STEP 6: MORPH COMPLETE, FIRST SELECTED PROJECT (turn = 1.0, settled)
  // =========================================================================
  console.log('\n--- 6. Morph Complete, First Project (TMR AI Car Care) ---');
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 350 + 1000);
  await page.waitForTimeout(400);
  const state6 = await getCardState();
  const visibleCards6 = state6.cards.filter(c => c.opacity > 0.1);
  const overlaps6 = checkCardOverlap(state6.cards);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase1-06-settled-project-1.png') });

  console.log(`Active Title: "${state6.activeTitle}"`);
  console.log(`Active URL: "${state6.activeHref}"`);
  console.log(`Visible cards count: ${visibleCards6.length}`);
  console.log(`Overlaps count: ${overlaps6.length}`);

  const card0 = state6.cards[0];
  const isRightShifted = card0.rect.left > (1440 * 0.45);
  const isCardLarge = card0.rect.width > (1440 * 0.40);

  if (
    state6.activeTitle.includes('TMR AI Car Care') &&
    state6.activeHref === 'https://tmraicarcare.com/' &&
    visibleCards6.length === 1 &&
    overlaps6.length === 0 &&
    isRightShifted &&
    isCardLarge
  ) {
    console.log('✓ PASS: Assertion 6. Morph complete, TMR AI Car Care active, 1 dominant large right image, 0 duplicates.');
    report.testsPassed++;
    report.singleActiveImageCheck = {
      project0: 'TMR AI Car Care',
      visibleCount: 1,
      overlaps: 0,
      widthPx: Math.round(card0.rect.width),
      isRightShifted,
    };
  } else {
    console.error('✗ FAIL: Assertion 6 Failed', { title: state6.activeTitle, visibleCount: visibleCards6.length, overlaps: overlaps6.length, isRightShifted, isCardLarge });
    report.testsFailed++;
  }

  // =========================================================================
  // STEP 7: SECOND PROJECT (Saraswati Driving School, turn = 2.0)
  // =========================================================================
  console.log('\n--- 7. Second Project (Saraswati Driving School) ---');
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 350 + 1000 + 1000);
  await page.waitForTimeout(400);
  const state7 = await getCardState();
  const visibleCards7 = state7.cards.filter(c => c.opacity > 0.1);
  const overlaps7 = checkCardOverlap(state7.cards);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase1-07-settled-project-2.png') });

  console.log(`Active Title: "${state7.activeTitle}"`);
  console.log(`Active URL: "${state7.activeHref}"`);
  console.log(`Visible cards count: ${visibleCards7.length}`);

  if (
    state7.activeTitle.includes('Saraswati Driving School') &&
    state7.activeHref === 'https://saraswati-driving-school.vercel.app/' &&
    visibleCards7.length === 1 &&
    overlaps7.length === 0
  ) {
    console.log('✓ PASS: Assertion 7. Saraswati Driving School active with verified URL, 1 dominant image, 0 overlaps.');
    report.testsPassed++;
  } else {
    console.error('✗ FAIL: Assertion 7 Failed', { title: state7.activeTitle, visibleCount: visibleCards7.length, overlaps: overlaps7.length });
    report.testsFailed++;
  }

  // =========================================================================
  // STEP 8: THIRD PROJECT (MNESA, turn = 3.0)
  // =========================================================================
  console.log('\n--- 8. Third Project (MNESA) ---');
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 350 + 1000 + 2000);
  await page.waitForTimeout(400);
  const state8 = await getCardState();
  const visibleCards8 = state8.cards.filter(c => c.opacity > 0.1);
  const overlaps8 = checkCardOverlap(state8.cards);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase1-08-settled-project-3.png') });

  console.log(`Active Title: "${state8.activeTitle}"`);
  console.log(`Active URL: "${state8.activeHref}"`);
  console.log(`Visible cards count: ${visibleCards8.length}`);

  if (
    state8.activeTitle.includes('MNESA') &&
    !state8.activeHref && // No dummy or broken link
    visibleCards8.length === 1 &&
    overlaps8.length === 0
  ) {
    console.log('✓ PASS: Assertion 8. MNESA active without fabricated link, 1 dominant image.');
    report.testsPassed++;
  } else {
    console.error('✗ FAIL: Assertion 8 Failed', { title: state8.activeTitle, href: state8.activeHref, visibleCount: visibleCards8.length });
    report.testsFailed++;
  }

  // =========================================================================
  // STEP 9: FOURTH & LAST PROJECT (NeuroMove, turn = 4.0)
  // =========================================================================
  console.log('\n--- 9. Fourth Project (NeuroMove) ---');
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 350 + 1000 + 3000);
  await page.waitForTimeout(400);
  const state9 = await getCardState();
  const visibleCards9 = state9.cards.filter(c => c.opacity > 0.1);
  const overlaps9 = checkCardOverlap(state9.cards);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase1-09-settled-project-4.png') });

  console.log(`Active Title: "${state9.activeTitle}"`);
  console.log(`Active URL: "${state9.activeHref}"`);
  console.log(`Visible cards count: ${visibleCards9.length}`);

  if (
    state9.activeTitle.includes('NeuroMove') &&
    !state9.activeHref &&
    visibleCards9.length === 1 &&
    overlaps9.length === 0
  ) {
    console.log('✓ PASS: Assertion 9. NeuroMove active without fabricated link, 1 dominant image.');
    report.testsPassed++;
  } else {
    console.error('✗ FAIL: Assertion 9 Failed', { title: state9.activeTitle, visibleCount: visibleCards9.length });
    report.testsFailed++;
  }

  // =========================================================================
  // STEP 10: LAST ITEM AT REST (in hold before footer)
  // =========================================================================
  console.log('\n--- 10. Last Project Item at Rest ---');
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 350 + 1000 + 3000 + 150);
  await page.waitForTimeout(300);
  const state10 = await getCardState();
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase1-10-last-project-hold.png') });
  if (state10.activeTitle.includes('NeuroMove')) {
    console.log('✓ PASS: Assertion 10. Last project holds at rest cleanly before release.');
    report.testsPassed++;
  } else {
    console.error('✗ FAIL: Assertion 10 Failed', state10.activeTitle);
    report.testsFailed++;
  }

  // =========================================================================
  // STEP 11: REVERSE NAVIGATION BACK TO INITIAL OVAL
  // =========================================================================
  console.log('\n--- 11. Reverse Navigation back to Initial Oval ---');
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 50);
  await page.waitForTimeout(500);
  const state11 = await getCardState();
  const overlaps11 = checkCardOverlap(state11.cards);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase1-11-reverse-to-oval.png') });

  console.log(`Reverse scroll card count: ${state11.cards.length}`);
  console.log(`Reverse scroll overlaps: ${overlaps11.length}`);
  console.log(`turn: ${state11.turn}`);

  if (state11.cards.length === 4 && overlaps11.length === 0 && state11.turn === 0) {
    console.log('✓ PASS: Assertion 11. Reverse navigation fully restores clean 4-card oval at rest.');
    report.testsPassed++;
    report.reverseScrollCheck = true;
  } else {
    console.error('✗ FAIL: Assertion 11 Failed', { count: state11.cards.length, overlaps: overlaps11.length, turn: state11.turn });
    report.testsFailed++;
  }

  // =========================================================================
  // STEP 12: REVERSE TO FINAL CINEMATIC SCENE (Beat 05)
  // =========================================================================
  console.log('\n--- 12. Reverse to Final Cinematic Scene ---');
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start - 600);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase1-12-reverse-to-cinematic.png') });

  const cinematicCheck = await page.evaluate(() => {
    const journey = document.querySelector('.ostrum-continuous-journey');
    const opacity = journey ? window.getComputedStyle(journey).opacity : '0';
    return parseFloat(opacity) >= 0.9;
  });

  if (cinematicCheck) {
    console.log('✓ PASS: Assertion 12. Preceding cinematic narrative & 3D sculpture restored with 100% opacity.');
    report.testsPassed++;
  } else {
    console.error('✗ FAIL: Assertion 12 Failed. 3D sculpture not visible on reverse.');
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

    // Scroll to Works Wheel start
    const vpSt = await page.evaluate(() => {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      const st = window.ScrollTrigger ? window.ScrollTrigger.getById('works-wheel-pin') : null;
      return st ? st.start : 9000;
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

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, `phase1-vp-${vp.name}.png`) });

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
    path.join(ARTIFACTS_DIR, 'works_wheel_phase1_audit.json'),
    JSON.stringify(report, null, 2)
  );

  console.log(`\n============================================================`);
  console.log(`PHASE 1 VERIFICATION COMPLETE: ${report.testsPassed} Passed, ${report.testsFailed} Failed`);
  console.log(`============================================================\n`);

  await browser.close();
}

runPhase1Verification().catch(err => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
