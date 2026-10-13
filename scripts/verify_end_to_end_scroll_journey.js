const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:\\Users\\balashanmugam\\.gemini\\antigravity\\brain\\e61a5bf4-ec20-4604-866c-28b2350ab0c5';

async function runEndToEndVerification() {
  console.log('======================================================================');
  console.log('   OSTRUM END-TO-END SCROLL JOURNEY & REVERSIBILITY VERIFICATION      ');
  console.log('======================================================================\n');

  const report = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    assertions: [],
    consoleErrors: [],
    pageErrors: [],
  };

  const assert = (description, condition, details = {}) => {
    if (condition) {
      console.log(`✓ PASS: ${description}`);
      report.testsPassed++;
      report.assertions.push({ status: 'PASS', description, details });
    } else {
      console.error(`✗ FAIL: ${description}`, details);
      report.testsFailed++;
      report.assertions.push({ status: 'FAIL', description, details });
    }
  };

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-gpu-benchmarking', '--enable-threaded-compositing'],
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      report.consoleErrors.push(msg.text());
      console.error('Console error:', msg.text());
    }
  });

  page.on('pageerror', (err) => {
    report.pageErrors.push(err.message);
    console.error('Page error:', err.message);
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.ScrollTrigger?.getById('works-wheel-pin'));
  await page.waitForTimeout(500);

  const wheelSt = await page.evaluate(() => {
    const st = window.ScrollTrigger.getById('works-wheel-pin');
    return { start: st.start, end: st.end, totalDist: st.end - st.start };
  });

  const capSt = await page.evaluate(() => {
    const st = window.ScrollTrigger.getById('capabilities-pin');
    return { start: st.start, end: st.end, totalDist: st.end - st.start };
  });

  // -------------------------------------------------------------------------
  // STAGE 1: MNESA NORMAL PRESENTATION (turn ~ 3.0)
  // -------------------------------------------------------------------------
  console.log('\n--- STAGE 1: MNESA (Project 3) Presentation ---');
  // At tProj = 0.667: turn = 1.0 + 0.667 * 3.0 = 3.0 (MNESA)
  // p = p2 + 0.667 * (p3 - p2) ~ 0.2269 + 0.667 * (0.7227 - 0.2269) ~ 0.5576
  const scrollMnesa = wheelSt.start + wheelSt.totalDist * 0.56;
  await page.evaluate((pos) => window.scrollTo(0, pos), scrollMnesa);
  await page.waitForTimeout(400);

  const mnesaState = await page.evaluate(() => {
    const lpTitle = document.querySelector('[data-testid="works-wheel-project-title"]')?.textContent?.trim();
    const lpDesc = document.querySelector('[data-testid="works-wheel-project-description"]')?.textContent?.trim();
    const pinContainer = document.querySelector('[data-testid="capabilities-pin-container"]');
    const anchor = document.querySelector('[data-testid="capabilities-transition-anchor"]');
    const isOverlayFixed = pinContainer ? pinContainer.style.position === 'fixed' : false;

    return {
      title: lpTitle,
      description: lpDesc,
      isOverlayFixed,
      anchorOpacity: anchor ? window.getComputedStyle(anchor).opacity : null,
    };
  });

  assert('MNESA is active project on Works Wheel', mnesaState.title === 'MNESA', mnesaState);
  assert('MNESA description is displayed', mnesaState.description?.includes('neural memory retrieval'), mnesaState);
  assert('Capabilities fixed overlay is INACTIVE over MNESA (not fixed)', !mnesaState.isOverlayFixed, mnesaState);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'journey-01-mnesa-settled.png'),
    fullPage: false,
  });

  // -------------------------------------------------------------------------
  // STAGE 2: 3D DRUM CIRCULAR ROTATION FROM MNESA TO OUR CAPABILITIES
  // -------------------------------------------------------------------------
  console.log('\n--- STAGE 2: Circular Transition from MNESA to Our Capabilities ---');
  // Intermediate scroll point during drum rotation (tProj ~ 0.85, turn ~ 3.55, p ~ 0.65)
  const scrollRotation = wheelSt.start + wheelSt.totalDist * 0.65;
  await page.evaluate((pos) => window.scrollTo(0, pos), scrollRotation);
  await page.waitForTimeout(400);

  const rotState = await page.evaluate(() => {
    const anchor = document.querySelector('[data-testid="capabilities-transition-anchor"]');
    const pinContainer = document.querySelector('[data-testid="capabilities-pin-container"]');
    return {
      anchorExists: !!anchor,
      anchorHasZeroFakeElements: anchor ? anchor.children.length === 0 : false,
      anchorOpacity: anchor ? window.getComputedStyle(anchor).opacity : null,
      isOverlayFixed: pinContainer ? pinContainer.style.position === 'fixed' : false,
    };
  });

  assert('Card 4 transition anchor has ZERO fake elements/children', rotState.anchorHasZeroFakeElements, rotState);
  assert('Card 4 transition anchor is transparent (opacity 0)', rotState.anchorOpacity === '0', rotState);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'journey-02-drum-rotation-midpoint.png'),
    fullPage: false,
  });

  // -------------------------------------------------------------------------
  // STAGE 3: OUR CAPABILITIES SETTLED ON WHEEL DRUM (turn = 4.0, p ~ 0.725)
  // -------------------------------------------------------------------------
  console.log('\n--- STAGE 3: Our Capabilities Settled Front & Center ---');
  const scrollSettled = wheelSt.start + wheelSt.totalDist * 0.725;
  await page.evaluate((pos) => window.scrollTo(0, pos), scrollSettled);
  await page.waitForTimeout(400);

  const settledState = await page.evaluate(() => {
    const lpTitle = document.querySelector('[data-testid="works-wheel-project-title"]')?.textContent?.trim();
    const lpDesc = document.querySelector('[data-testid="works-wheel-project-description"]')?.textContent?.trim();
    const pinContainer = document.querySelector('[data-testid="capabilities-pin-container"]');
    const pRect = pinContainer ? pinContainer.getBoundingClientRect() : null;
    const isOverlayFixed = pinContainer ? pinContainer.style.position === 'fixed' : false;
    const capHeading = document.querySelector('[data-testid="capabilities-heading"]')?.textContent?.trim();
    const mnesaCard = document.getElementById('works-wheel-2');
    const mnesaOpacity = mnesaCard ? parseFloat(window.getComputedStyle(mnesaCard).opacity) : 0;

    return {
      title: lpTitle,
      description: lpDesc,
      isOverlayFixed,
      containerWidth: pRect ? Math.round(pRect.width) : 0,
      capHeading,
      mnesaOpacity,
    };
  });

  assert('Our Capabilities is active entry title', settledState.title === 'Our Capabilities', settledState);
  assert('Our Capabilities description is present', settledState.description?.includes('digital experiences and intelligent AI systems'), settledState);
  assert('Live Capabilities section is active in thumbnail state', settledState.isOverlayFixed, settledState);
  assert('Capabilities section sits at thumbnail width (~635px)', settledState.containerWidth > 500 && settledState.containerWidth < 700, settledState);
  assert('Live Capabilities section heading "Our Capabilities" is visible inside thumbnail', settledState.capHeading === 'Our Capabilities', settledState);
  assert('MNESA card on drum is faded out (opacity 0)', settledState.mnesaOpacity < 0.05, settledState);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'journey-03-capabilities-settled.png'),
    fullPage: false,
  });

  // -------------------------------------------------------------------------
  // STAGE 4: THUMBNAIL EXPANDS SMOOTHLY TO FULL VIEWPORT (p ~ 0.995)
  // -------------------------------------------------------------------------
  console.log('\n--- STAGE 4: Thumbnail Expansion into Section 05 ---');
  const scrollExpanded = wheelSt.start + wheelSt.totalDist * 0.995;
  await page.evaluate((pos) => window.scrollTo(0, pos), scrollExpanded);
  await page.waitForTimeout(400);

  const expState = await page.evaluate(() => {
    const pinContainer = document.querySelector('[data-testid="capabilities-pin-container"]');
    const pRect = pinContainer ? pinContainer.getBoundingClientRect() : null;
    const lp = document.querySelector('[data-testid="works-wheel-left-panel"]');
    const lpOp = lp ? parseFloat(window.getComputedStyle(lp).opacity) : 1;
    return {
      width: pRect ? Math.round(pRect.width) : 0,
      height: pRect ? Math.round(pRect.height) : 0,
      leftPanelOpacity: lpOp,
    };
  });

  assert('Expanded container covers full viewport width (1440)', expState.width >= 1438, expState);
  assert('Expanded container covers full viewport height (900)', expState.height >= 898, expState);
  assert('Left panel metadata completely faded to 0', expState.leftPanelOpacity < 0.05, expState);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'journey-04-expansion-full.png'),
    fullPage: false,
  });

  // -------------------------------------------------------------------------
  // STAGE 4B: CONTINUOUS HANDOFF VERIFICATION (ZERO BLANK GAP)
  // -------------------------------------------------------------------------
  console.log('\n--- STAGE 4B: Zero Blank Gap Continuous Check ---');
  let blankGapFrames = 0;
  for (let step = 0; step <= 8; step++) {
    const testPos = wheelSt.end - 50 + step * 25; // Spanning through the exact handoff
    await page.evaluate((pos) => window.scrollTo(0, pos), testPos);
    await page.waitForTimeout(100);

    const check = await page.evaluate(() => {
      const pinContainer = document.querySelector('[data-testid="capabilities-pin-container"]');
      if (!pinContainer) return { visible: false };
      const r = pinContainer.getBoundingClientRect();
      const style = window.getComputedStyle(pinContainer);
      const isVisible = r.width >= 1400 && r.height >= 850 && parseFloat(style.opacity) >= 0.95 && r.top <= 10;
      return { visible: isVisible, width: r.width, height: r.height, opacity: style.opacity, top: r.top };
    });

    if (!check.visible) {
      blankGapFrames++;
      console.error(`Blank frame detected at scroll ${testPos}:`, check);
    }
  }

  assert('ZERO blank frames during works-wheel to capabilities handoff', blankGapFrames === 0, { blankGapFrames });

  // -------------------------------------------------------------------------
  // STAGE 5: HORIZONTAL SERVICE CATALOGUE (Cards 01 to 06)
  // -------------------------------------------------------------------------
  console.log('\n--- STAGE 5: Horizontal Service Catalogue Scrub ---');
  // Scrub to Card 06 (end of capabilities-pin)
  const scrollEndCard = capSt.start + capSt.totalDist * 0.95;
  await page.evaluate((pos) => window.scrollTo(0, pos), scrollEndCard);
  await page.waitForTimeout(400);

  const trackState = await page.evaluate(() => {
    const track = document.querySelector('[data-testid="capabilities-track"]');
    const card6 = document.querySelector('[data-testid="capability-card-6"]');
    const c6Rect = card6 ? card6.getBoundingClientRect() : null;
    return {
      trackTransform: track ? window.getComputedStyle(track).transform : '',
      card6Visible: c6Rect ? c6Rect.left < window.innerWidth && c6Rect.right > 0 : false,
      card6Left: c6Rect ? Math.round(c6Rect.left) : null,
    };
  });

  assert('Track translated horizontally across cards', trackState.trackTransform.includes('-'), trackState);
  assert('Card 06 (CUSTOM ENGINEERING) is in view at end of catalogue', trackState.card6Visible, trackState);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'journey-05-card-06-settled.png'),
    fullPage: false,
  });

  // -------------------------------------------------------------------------
  // STAGE 6: NATURAL RELEASE INTO FOOTER (Zero Duplicate Section / Zero Blank Pause)
  // -------------------------------------------------------------------------
  console.log('\n--- STAGE 6: Natural Release into Studio Footer ---');
  // Scroll into Studio Footer
  const scrollFooter = capSt.end + 500;
  await page.evaluate((pos) => window.scrollTo(0, pos), scrollFooter);
  await page.waitForTimeout(400);

  const footerState = await page.evaluate(() => {
    const footer = document.getElementById('studio-footer');
    const fRect = footer ? footer.getBoundingClientRect() : null;
    const secCount = document.querySelectorAll('[data-testid="capabilities-section"]').length;
    const headingCount = document.querySelectorAll('[data-testid="capabilities-heading"]').length;
    const cardsCount = document.querySelectorAll('#capabilities article').length;
    return {
      footerVisible: fRect ? fRect.top < window.innerHeight && fRect.bottom > 0 : false,
      footerTop: fRect ? Math.round(fRect.top) : null,
      sectionCount: secCount,
      headingCount: headingCount,
      cardsCount: cardsCount,
    };
  });

  assert('Studio Footer is visible and entered viewport naturally', footerState.footerVisible, footerState);
  assert('Exactly 1 Capabilities section exists in DOM', footerState.sectionCount === 1, footerState);
  assert('Exactly 1 Capabilities heading exists in DOM (NO duplicate section)', footerState.headingCount === 1, footerState);
  assert('Exactly 6 service cards exist in DOM (NO duplicate catalogue)', footerState.cardsCount === 6, footerState);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'journey-06-studio-footer-entered.png'),
    fullPage: false,
  });

  // -------------------------------------------------------------------------
  // STAGE 7: REVERSE SCROLL CLEAN REVERSIBILITY
  // -------------------------------------------------------------------------
  console.log('\n--- STAGE 7: Reverse Scroll to MNESA ---');
  // Reverse scroll all the way back to MNESA
  await page.evaluate((pos) => window.scrollTo(0, pos), scrollMnesa);
  await page.waitForTimeout(500);

  const revMnesa = await page.evaluate(() => {
    const lpTitle = document.querySelector('[data-testid="works-wheel-project-title"]')?.textContent?.trim();
    const pinContainer = document.querySelector('[data-testid="capabilities-pin-container"]');
    return {
      title: lpTitle,
      isOverlayFixed: pinContainer ? pinContainer.style.position === 'fixed' : false,
    };
  });

  assert('Reverse scroll successfully restored MNESA', revMnesa.title === 'MNESA', revMnesa);
  assert('Capabilities overlay inactive on reverse scroll to MNESA', !revMnesa.isOverlayFixed, revMnesa);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'journey-07-reversed-to-mnesa.png'),
    fullPage: false,
  });

  // -------------------------------------------------------------------------
  // RUNTIME CLEANLINESS
  // -------------------------------------------------------------------------
  console.log('\n--- STAGE 8: Runtime Health ---');
  assert('Zero console errors throughout journey', report.consoleErrors.length === 0, report.consoleErrors);
  assert('Zero page errors throughout journey', report.pageErrors.length === 0, report.pageErrors);

  await browser.close();

  // Report Summary
  console.log('\n======================================================================');
  console.log(`JOURNEY VERIFICATION PASSED: ${report.testsPassed}`);
  console.log(`JOURNEY VERIFICATION FAILED: ${report.testsFailed}`);
  console.log('======================================================================\n');

  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'end_to_end_journey_audit_report.json'),
    JSON.stringify(report, null, 2)
  );

  if (report.testsFailed > 0 || report.consoleErrors.length > 0 || report.pageErrors.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runEndToEndVerification().catch((err) => {
  console.error('Fatal journey failure:', err);
  process.exit(1);
});
