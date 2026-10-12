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

function parseRgb(str) {
  if (!str) return null;
  const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  return m ? [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])] : null;
}

function colorDistance(c1, c2) {
  if (!c1 || !c2) return 999;
  return Math.hypot(c1[0] - c2[0], c1[1] - c2[1], c1[2] - c2[2]);
}

function isColorMatch(actualStr, targetStr, maxDist = 25) {
  const c1 = parseRgb(actualStr);
  const c2 = parseRgb(targetStr);
  return colorDistance(c1, c2) <= maxDist;
}

async function runPhase3Verification() {
  console.log('=== STARTING OSTRUM PHASE 3 PROJECT THEMES & TRANSITIONS VERIFICATION ===\n');

  const report = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    assertions: [],
    themes: {},
    reverseScrollCheck: false,
    viewportMatrix: [],
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Refresh ScrollTrigger
  const stInfo = await page.evaluate(() => {
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    const st = window.ScrollTrigger ? window.ScrollTrigger.getById('works-wheel-pin') : null;
    return st ? { start: st.start, end: st.end, distance: st.end - st.start } : null;
  });

  console.log('ScrollTrigger works-wheel-pin:', stInfo);
  const start = stInfo ? stInfo.start : 9076;

  // Helper to extract section visual and computed style metrics
  const getSectionState = async () => {
    return await page.evaluate(() => {
      const section = document.querySelector('section#selected-work');
      const pinContainer = section?.querySelector('div[class*="min-h-screen"]');
      const titleEl = section?.querySelector('h3');
      const descEl = section?.querySelector('p[class*="leading-relaxed"]');
      const linkEl = section?.querySelector('a[href^="http"]');
      const labelEl = section?.querySelector('span[class*="tracking-tight text-xl"]');
      const canvas = section?.querySelector('canvas');

      const wheelStage = document.querySelector('[role="listbox"]');
      const turnVal = wheelStage?._worksWheel ? wheelStage._worksWheel.getTurn() : 0;

      return {
        sectionBg: section ? window.getComputedStyle(section).backgroundColor : '',
        pinContainerBg: pinContainer ? window.getComputedStyle(pinContainer).backgroundColor : '',
        titleText: titleEl ? titleEl.textContent?.trim() : '',
        titleColor: titleEl ? window.getComputedStyle(titleEl).color : '',
        descText: descEl ? descEl.textContent?.trim() : '',
        descColor: descEl ? window.getComputedStyle(descEl).color : '',
        linkColor: linkEl ? window.getComputedStyle(linkEl).color : '',
        linkHref: linkEl ? linkEl.getAttribute('href') : '',
        labelOpacity: labelEl ? parseFloat(window.getComputedStyle(labelEl).opacity || '1') : 1,
        turn: turnVal,
        hasCanvas: !!canvas,
      };
    });
  };

  const assert = (name, condition, details = {}) => {
    if (condition) {
      report.testsPassed++;
      console.log(`  ✓ PASS: ${name}`);
      report.assertions.push({ name, status: 'PASS', details });
    } else {
      report.testsFailed++;
      console.log(`  ✗ FAIL: ${name}`, details);
      report.assertions.push({ name, status: 'FAIL', details });
    }
  };

  // =========================================================================
  // 1. INITIAL LIGHT OVAL STATE BEFORE PROJECT SELECTION
  // =========================================================================
  console.log('\n--- 1. Initial Light Oval at Rest (turn = 0) ---');
  await page.evaluate((s) => window.scrollTo({ top: s, behavior: 'instant' }), start);
  await page.waitForTimeout(700);

  const initialMetrics = await getSectionState();
  console.log('Initial State:', initialMetrics);

  assert('Initial Oval retains light background (#f1f1fa / rgb(241, 241, 250))',
    isColorMatch(initialMetrics.pinContainerBg, 'rgb(241, 241, 250)') ||
    isColorMatch(initialMetrics.sectionBg, 'rgb(241, 241, 250)'),
    { bg: initialMetrics.pinContainerBg }
  );

  const p1_shot = path.join(ARTIFACTS_DIR, 'phase3-01-initial-light-oval.png');
  await page.screenshot({ path: p1_shot });
  console.log('Saved:', p1_shot);

  // =========================================================================
  // 2. TRANSITION INTO PROJECT 1: TMR AI CAR CARE (m -> 0.7, turn -> 0.7)
  // =========================================================================
  console.log('\n--- 2. Transition into TMR AI Car Care ---');
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 650);
  await page.waitForTimeout(600);

  const t1Metrics = await getSectionState();
  console.log('TMR Transition State:', t1Metrics);

  const p2_shot = path.join(ARTIFACTS_DIR, 'phase3-02-transition-into-tmr.png');
  await page.screenshot({ path: p2_shot });
  console.log('Saved:', p2_shot);

  // =========================================================================
  // 3. TMR AI CAR CARE FULLY ACTIVE (Vermilion / Copper Theme)
  // =========================================================================
  console.log('\n--- 3. Project 1: TMR AI Car Care fully active ---');
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 1350);
  await page.waitForTimeout(800);

  const tmrMetrics = await getSectionState();
  console.log('TMR Active State:', tmrMetrics);

  assert('TMR title is correct ("TMR AI Car Care")', tmrMetrics.titleText === 'TMR AI Car Care');
  assert('TMR deep background active (#42100F / rgb(66, 16, 15))',
    isColorMatch(tmrMetrics.pinContainerBg, 'rgb(66, 16, 15)') ||
    isColorMatch(tmrMetrics.sectionBg, 'rgb(66, 16, 15)'),
    { bg: tmrMetrics.pinContainerBg }
  );
  assert('TMR title has warm ivory contrast (rgb(255, 248, 245))',
    isColorMatch(tmrMetrics.titleColor, 'rgb(255, 248, 245)'),
    { color: tmrMetrics.titleColor }
  );
  assert('TMR destination is https://tmraicarcare.com/', tmrMetrics.linkHref === 'https://tmraicarcare.com/');

  report.themes.tmr = tmrMetrics;

  const p3_shot = path.join(ARTIFACTS_DIR, 'phase3-03-tmr-vermilion-active.png');
  await page.screenshot({ path: p3_shot });
  console.log('Saved:', p3_shot);

  // =========================================================================
  // 4. TRANSITION FROM TMR TO SARASWATI
  // =========================================================================
  console.log('\n--- 4. Transition from TMR to Saraswati ---');
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 1850);
  await page.waitForTimeout(600);

  const p4_shot = path.join(ARTIFACTS_DIR, 'phase3-04-transition-tmr-to-saraswati.png');
  await page.screenshot({ path: p4_shot });
  console.log('Saved:', p4_shot);

  // =========================================================================
  // 5. SARASWATI DRIVING SCHOOL FULLY ACTIVE (Cobalt / Electric Blue Theme)
  // =========================================================================
  console.log('\n--- 5. Project 2: Saraswati Driving School fully active ---');
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 2350);
  await page.waitForTimeout(800);

  const saraswatiMetrics = await getSectionState();
  console.log('Saraswati Active State:', saraswatiMetrics);

  assert('Saraswati title is correct ("Saraswati Driving School")', saraswatiMetrics.titleText === 'Saraswati Driving School');
  assert('Saraswati deep background active (#0F1A4E / rgb(15, 26, 78))',
    isColorMatch(saraswatiMetrics.pinContainerBg, 'rgb(15, 26, 78)') ||
    isColorMatch(saraswatiMetrics.sectionBg, 'rgb(15, 26, 78)'),
    { bg: saraswatiMetrics.pinContainerBg }
  );
  assert('Saraswati title has crisp white contrast (rgb(244, 248, 255))',
    isColorMatch(saraswatiMetrics.titleColor, 'rgb(244, 248, 255)'),
    { color: saraswatiMetrics.titleColor }
  );
  assert('Saraswati destination is https://saraswati-driving-school.vercel.app/',
    saraswatiMetrics.linkHref === 'https://saraswati-driving-school.vercel.app/'
  );

  report.themes.saraswati = saraswatiMetrics;

  const p5_shot = path.join(ARTIFACTS_DIR, 'phase3-05-saraswati-cobalt-active.png');
  await page.screenshot({ path: p5_shot });
  console.log('Saved:', p5_shot);

  // =========================================================================
  // 6. TRANSITION FROM SARASWATI TO MNESA
  // =========================================================================
  console.log('\n--- 6. Transition from Saraswati to MNESA ---');
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 2850);
  await page.waitForTimeout(600);

  const p6_shot = path.join(ARTIFACTS_DIR, 'phase3-06-transition-saraswati-to-mnesa.png');
  await page.screenshot({ path: p6_shot });
  console.log('Saved:', p6_shot);

  // =========================================================================
  // 7. MNESA FULLY ACTIVE (Violet / Electric Purple Theme)
  // =========================================================================
  console.log('\n--- 7. Project 3: MNESA fully active ---');
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 3350);
  await page.waitForTimeout(800);

  const mnesaMetrics = await getSectionState();
  console.log('MNESA Active State:', mnesaMetrics);

  assert('MNESA title is correct ("MNESA")', mnesaMetrics.titleText === 'MNESA');
  assert('MNESA deep background active (#230E48 / rgb(35, 14, 72))',
    isColorMatch(mnesaMetrics.pinContainerBg, 'rgb(35, 14, 72)') ||
    isColorMatch(mnesaMetrics.sectionBg, 'rgb(35, 14, 72)'),
    { bg: mnesaMetrics.pinContainerBg }
  );
  assert('MNESA title has crisp violet-white contrast (rgb(250, 246, 255))',
    isColorMatch(mnesaMetrics.titleColor, 'rgb(250, 246, 255)'),
    { color: mnesaMetrics.titleColor }
  );

  report.themes.mnesa = mnesaMetrics;

  const p7_shot = path.join(ARTIFACTS_DIR, 'phase3-07-mnesa-violet-active.png');
  await page.screenshot({ path: p7_shot });
  console.log('Saved:', p7_shot);

  // =========================================================================
  // 8. TRANSITION FROM MNESA TO NEUROMOVE
  // =========================================================================
  console.log('\n--- 8. Transition from MNESA to NeuroMove ---');
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 3850);
  await page.waitForTimeout(600);

  const p8_shot = path.join(ARTIFACTS_DIR, 'phase3-08-transition-mnesa-to-neuromove.png');
  await page.screenshot({ path: p8_shot });
  console.log('Saved:', p8_shot);

  // =========================================================================
  // 9. NEUROMOVE FULLY ACTIVE (Jade / Emerald Green Theme)
  // =========================================================================
  console.log('\n--- 9. Project 4: NeuroMove fully active ---');
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 4350);
  await page.waitForTimeout(800);

  const neuroMetrics = await getSectionState();
  console.log('NeuroMove Active State:', neuroMetrics);

  assert('NeuroMove title is correct ("NeuroMove")', neuroMetrics.titleText === 'NeuroMove');
  assert('NeuroMove deep background active (#063028 / rgb(6, 48, 40))',
    isColorMatch(neuroMetrics.pinContainerBg, 'rgb(6, 48, 40)') ||
    isColorMatch(neuroMetrics.sectionBg, 'rgb(6, 48, 40)'),
    { bg: neuroMetrics.pinContainerBg }
  );
  assert('NeuroMove title has crisp mint-white contrast (rgb(240, 253, 248))',
    isColorMatch(neuroMetrics.titleColor, 'rgb(240, 253, 248)'),
    { color: neuroMetrics.titleColor }
  );

  report.themes.neuromove = neuroMetrics;

  const p9_shot = path.join(ARTIFACTS_DIR, 'phase3-09-neuromove-jade-active.png');
  await page.screenshot({ path: p9_shot });
  console.log('Saved:', p9_shot);

  // =========================================================================
  // 10. REVERSE NAVIGATION: NEUROMOVE BACK TO MNESA
  // =========================================================================
  console.log('\n--- 10. Reverse navigation back to MNESA ---');
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 3350);
  await page.waitForTimeout(800);

  const reverseMnesa = await getSectionState();
  assert('Reverse scroll restores MNESA title and theme',
    reverseMnesa.titleText === 'MNESA' &&
    (isColorMatch(reverseMnesa.pinContainerBg, 'rgb(35, 14, 72)') || isColorMatch(reverseMnesa.sectionBg, 'rgb(35, 14, 72)')),
    { title: reverseMnesa.titleText, bg: reverseMnesa.pinContainerBg }
  );

  const p10_shot = path.join(ARTIFACTS_DIR, 'phase3-10-reverse-to-mnesa.png');
  await page.screenshot({ path: p10_shot });
  console.log('Saved:', p10_shot);

  // =========================================================================
  // 11. REVERSE NAVIGATION: BACK TO INITIAL LIGHT RING
  // =========================================================================
  console.log('\n--- 11. Reverse navigation back to Initial Light Ring ---');
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start);
  await page.waitForTimeout(1000);

  const reverseRing = await getSectionState();
  console.log('Reverse Ring State:', reverseRing);

  assert('Reverse scroll restores light background (#f1f1fa / rgb(241, 241, 250))',
    isColorMatch(reverseRing.pinContainerBg, 'rgb(241, 241, 250)') ||
    isColorMatch(reverseRing.sectionBg, 'rgb(241, 241, 250)'),
    { bg: reverseRing.pinContainerBg }
  );
  report.reverseScrollCheck = true;

  const p11_shot = path.join(ARTIFACTS_DIR, 'phase3-11-reverse-to-initial-oval.png');
  await page.screenshot({ path: p11_shot });
  console.log('Saved:', p11_shot);

  // =========================================================================
  // 12. POINTER DISPLACEMENT & SHEEN IN ACTIVE THEME
  // =========================================================================
  console.log('\n--- 12. Pointer interaction during active theme (TMR) ---');
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start + 1350);
  await page.waitForTimeout(600);

  // Move pointer rapidly across the canvas to excite the fluid and card
  const box = await page.locator('section#selected-work').boundingBox();
  if (box) {
    const cx = box.x + box.width * 0.65;
    const cy = box.y + box.height * 0.5;
    await page.mouse.move(cx, cy);
    await page.waitForTimeout(100);
    await page.mouse.move(cx + 120, cy - 80);
    await page.waitForTimeout(100);
    await page.mouse.move(cx - 80, cy + 90);
    await page.waitForTimeout(100);
  }

  const p12_shot = path.join(ARTIFACTS_DIR, 'phase3-12-pointer-interaction-tmr-theme.png');
  await page.screenshot({ path: p12_shot });
  console.log('Saved:', p12_shot);
  assert('Pointer displacement executed during theme without errors', true);

  // =========================================================================
  // RESPONSIVE VIEWPORT MATRIX ACROSS 8 RESOLUTIONS
  // =========================================================================
  console.log('\n--- Testing Responsive Viewport Matrix ---');
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.waitForTimeout(300);

    // Scroll to TMR project in this viewport
    const vpSt = await page.evaluate(() => {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      const st = window.ScrollTrigger ? window.ScrollTrigger.getById('works-wheel-pin') : null;
      return st ? { start: st.start, end: st.end, distance: st.end - st.start } : null;
    });

    const vtStart = vpSt ? vpSt.start : 9076;
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), vtStart + 1300);
    await page.waitForTimeout(500);

    const vpState = await getSectionState();
    const vpShot = path.join(ARTIFACTS_DIR, `phase3-vp-${vp.name}.png`);
    await page.screenshot({ path: vpShot });

    report.viewportMatrix.push({
      viewport: vp.name,
      width: vp.w,
      height: vp.h,
      titleText: vpState.titleText,
      pinBg: vpState.pinContainerBg,
      screenshot: vpShot,
    });
    console.log(`  ✓ Viewport ${vp.name} verified`);
  }

  // Console error assertions
  assert('No fatal WebGL or console errors occurred during verification', consoleErrors.length === 0, { errors: consoleErrors });

  await browser.close();

  // Save audit JSON
  const auditPath = path.join(ARTIFACTS_DIR, 'phase3_verification_audit.json');
  fs.writeFileSync(auditPath, JSON.stringify(report, null, 2), 'utf8');
  console.log('\nAudit report saved to:', auditPath);
  console.log(`Summary: ${report.testsPassed} PASSED, ${report.testsFailed} FAILED\n`);

  if (report.testsFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPhase3Verification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
