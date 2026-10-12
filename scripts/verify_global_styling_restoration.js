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

async function verifyGlobalStyling() {
  console.log('=== STARTING AUDIT: OSTRUM GLOBAL STYLING RESTORATION ===\n');

  const report = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    consoleErrors: [],
    cssAudits: {},
    computedStyles: {},
    fontCheck: {},
    viewports: [],
  };

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--no-sandbox'],
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error(`[Console Error]: ${msg.text()}`);
      report.consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    console.error(`[Page Error]: ${err.message}`);
    report.consoleErrors.push(err.message);
  });

  console.log('Navigating to http://localhost:3000 at 1440x900...');
  const res = await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  console.log(`HTTP Status: ${res.status()}`);
  await page.waitForTimeout(2000);

  // 1. Verify Stylesheets & Link tags
  const styleAudit = await page.evaluate(() => {
    const styleSheets = Array.from(document.styleSheets).map(s => {
      let rulesCount = 0;
      try { rulesCount = s.cssRules ? s.cssRules.length : 0; } catch (e) { rulesCount = -1; }
      return { href: s.href, rulesCount };
    });
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href);
    return { styleSheets, links };
  });

  console.log('Stylesheet Audit:', JSON.stringify(styleAudit, null, 2));
  report.cssAudits = styleAudit;

  if (styleAudit.styleSheets.length > 0 && styleAudit.styleSheets.some(s => s.rulesCount > 50)) {
    console.log('✓ PASS: CSS Stylesheet actively parsed and loaded with valid rules.');
    report.testsPassed++;
  } else {
    console.error('✗ FAIL: No valid CSS stylesheet loaded.');
    report.testsFailed++;
  }

  // 2. Computed Styles Verification
  const computed = await page.evaluate(() => {
    const body = document.body;
    const bodyStyle = window.getComputedStyle(body);
    const header = document.querySelector('header');
    const headerStyle = header ? window.getComputedStyle(header) : null;
    const wordmark = document.querySelector('.intro .drop-shadow-2xl') || document.querySelector('.intro svg');
    const wordmarkRect = wordmark ? wordmark.getBoundingClientRect() : null;
    const introDesc = document.querySelector('.intro-desc');
    const introDescStyle = introDesc ? window.getComputedStyle(introDesc) : null;

    return {
      body: {
        backgroundColor: bodyStyle.backgroundColor,
        color: bodyStyle.color,
        fontFamily: bodyStyle.fontFamily,
      },
      header: headerStyle ? {
        position: headerStyle.position,
        zIndex: headerStyle.zIndex,
        display: headerStyle.display,
      } : null,
      wordmark: wordmarkRect ? {
        width: Math.round(wordmarkRect.width),
        height: Math.round(wordmarkRect.height),
      } : null,
      introDesc: introDescStyle ? {
        fontFamily: introDescStyle.fontFamily,
        color: introDescStyle.color,
        fontSize: introDescStyle.fontSize,
      } : null,
    };
  });

  console.log('Computed Styles:', JSON.stringify(computed, null, 2));
  report.computedStyles = computed;

  // Assert Body Dark Background
  if (computed.body.backgroundColor === 'rgb(0, 0, 0)' || computed.body.backgroundColor === '#000000') {
    console.log('✓ PASS: Body background is stable pitch black (rgb(0, 0, 0)).');
    report.testsPassed++;
  } else {
    console.error(`✗ FAIL: Body background is ${computed.body.backgroundColor}, expected rgb(0, 0, 0).`);
    report.testsFailed++;
  }

  // Assert Body Typography
  if (computed.body.fontFamily.includes('Neue Montreal')) {
    console.log('✓ PASS: Body typography matches established Neue Montreal.');
    report.testsPassed++;
  } else {
    console.error(`✗ FAIL: Body font is ${computed.body.fontFamily}, expected Neue Montreal.`);
    report.testsFailed++;
  }

  // Assert Header
  if (computed.header && computed.header.position === 'fixed') {
    console.log('✓ PASS: Header layout restored as fixed floating navbar.');
    report.testsPassed++;
  } else {
    console.error('✗ FAIL: Header is not fixed.');
    report.testsFailed++;
  }

  // Assert Wordmark
  if (computed.wordmark && computed.wordmark.width > 200 && computed.wordmark.width <= 1440) {
    console.log(`✓ PASS: Ostrum wordmark dimensions proportional (${computed.wordmark.width}x${computed.wordmark.height}px).`);
    report.testsPassed++;
  } else {
    console.error('✗ FAIL: Wordmark dimensions abnormal.');
    report.testsFailed++;
  }

  // 3. Verify Font Loading Status
  const fontLoaded = await page.evaluate(async () => {
    const fonts = ['400 16px "Neue Montreal"', '500 16px "Neue Montreal"', '400 16px "Romie"'];
    const results = {};
    for (const f of fonts) {
      results[f] = document.fonts.check(f);
    }
    return results;
  });

  console.log('Font Loaded Status:', JSON.stringify(fontLoaded, null, 2));
  report.fontCheck = fontLoaded;

  // 4. Capture Visual States & Verify Across Viewports
  console.log('\n--- Capturing Visual States at 1440x900 ---');

  // State 01: Hero at Rest
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'restored-01-hero-monumental.png'), fullPage: false });
  console.log('Captured restored-01-hero-monumental.png');

  // State 02: Scroll to Section 02 Engine
  await page.evaluate(() => {
    const el = document.getElementById('engine') || document.querySelector('.ostrum-engine-section');
    if (el) el.scrollIntoView({ behavior: 'instant' });
    else window.scrollTo(0, 1100);
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'restored-02-section-engine.png'), fullPage: false });
  console.log('Captured restored-02-section-engine.png');

  // State 03: Scroll to Section 03 Narrative
  await page.evaluate(() => {
    const el = document.getElementById('energy-narrative');
    if (el) el.scrollIntoView({ behavior: 'instant' });
    else window.scrollTo(0, 2400);
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'restored-03-cinematic-narrative.png'), fullPage: false });
  console.log('Captured restored-03-cinematic-narrative.png');

  // State 04: Selected Works Incoming / Resting Oval (Light Lusion background)
  await page.evaluate(() => {
    const sec = document.getElementById('selected-work');
    if (sec) {
      sec.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'restored-04-works-wheel-light-oval.png'), fullPage: false });
  console.log('Captured restored-04-works-wheel-light-oval.png');

  // State 05: Scroll into Works Wheel Project 1 (TMR - Vermilion)
  await page.evaluate(() => {
    window.scrollBy({ top: 900, behavior: 'instant' });
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'restored-05-wheel-project1-tmr.png'), fullPage: false });
  console.log('Captured restored-05-wheel-project1-tmr.png');

  // State 06: Scroll into Works Wheel Project 2 (Saraswati - Cobalt)
  await page.evaluate(() => {
    window.scrollBy({ top: 900, behavior: 'instant' });
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'restored-06-wheel-project2-saraswati.png'), fullPage: false });
  console.log('Captured restored-06-wheel-project2-saraswati.png');

  // State 07: Scroll into Works Wheel Project 3 (MNESA - Violet)
  await page.evaluate(() => {
    window.scrollBy({ top: 900, behavior: 'instant' });
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'restored-07-wheel-project3-mnesa.png'), fullPage: false });
  console.log('Captured restored-07-wheel-project3-mnesa.png');

  // State 08: Scroll into Works Wheel Project 4 (NeuroMove - Jade)
  await page.evaluate(() => {
    window.scrollBy({ top: 900, behavior: 'instant' });
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'restored-08-wheel-project4-neuromove.png'), fullPage: false });
  console.log('Captured restored-08-wheel-project4-neuromove.png');

  // State 09: Scroll Reversal back to top
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'restored-09-reverse-to-hero.png'), fullPage: false });
  console.log('Captured restored-09-reverse-to-hero.png');

  // 5. Test all 8 Viewports
  console.log('\n--- Verifying All 8 Viewports ---');
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    const vpMetrics = await page.evaluate((vpW) => {
      const bodyBg = window.getComputedStyle(document.body).backgroundColor;
      const wordmark = document.querySelector('.intro .drop-shadow-2xl') || document.querySelector('.intro svg');
      const wRect = wordmark ? wordmark.getBoundingClientRect() : null;
      return {
        bodyBg,
        wordmarkWidth: wRect ? Math.round(wRect.width) : 0,
        fitsViewport: wRect ? wRect.width <= vpW : true,
      };
    }, vp.w);

    const vpShot = path.join(ARTIFACTS_DIR, `restored-vp-${vp.name}.png`);
    await page.screenshot({ path: vpShot, fullPage: false });

    console.log(`Viewport ${vp.name} (${vp.w}x${vp.h}): bg=${vpMetrics.bodyBg}, wordmark=${vpMetrics.wordmarkWidth}px, fits=${vpMetrics.fitsViewport}`);

    if (vpMetrics.bodyBg === 'rgb(0, 0, 0)' && vpMetrics.fitsViewport) {
      report.testsPassed++;
    } else {
      report.testsFailed++;
    }

    report.viewports.push({
      viewport: vp.name,
      dimensions: `${vp.w}x${vp.h}`,
      ...vpMetrics,
      screenshot: vpShot,
    });
  }

  await browser.close();

  // Write audit results
  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'global_styling_restoration_audit.json'),
    JSON.stringify(report, null, 2)
  );

  console.log(`\n=== AUDIT COMPLETE ===`);
  console.log(`Tests Passed: ${report.testsPassed}`);
  console.log(`Tests Failed: ${report.testsFailed}`);
  console.log(`Console Errors: ${report.consoleErrors.length}`);
}

verifyGlobalStyling().catch((err) => {
  console.error('Fatal Audit Error:', err);
  process.exit(1);
});
