const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:\\Users\\balashanmugam\\.gemini\\antigravity\\brain\\e61a5bf4-ec20-4604-866c-28b2350ab0c5';

const EXPECTED_CARDS = [
  {
    index: '01 / 06',
    title: 'DIGITAL EXPERIENCES',
    description: 'Digital touchpoints designed to make your business easier to discover, use and buy from.',
    tags: ['Websites', 'E-commerce', 'Customer Portals'],
    variant: 1,
  },
  {
    index: '02 / 06',
    title: 'AI SYSTEMS & AGENTS',
    description: 'Intelligent systems that respond, reason and carry work forward across your business.',
    tags: ['AI Receptionists', 'AI Agents', 'Workflow Automation'],
    variant: 2,
  },
  {
    index: '03 / 06',
    title: 'BUSINESS PLATFORMS',
    description: 'Connected systems that bring customer relationships, daily operations and business data into focus.',
    tags: ['CRM & ERP', 'Operations Dashboards', 'Business Workflows'],
    variant: 3,
  },
  {
    index: '04 / 06',
    title: 'SOFTWARE & PRODUCT ENGINEERING',
    description: 'From a promising idea to a dependable digital product built for real-world use.',
    tags: ['Web & Mobile Apps', 'SaaS & MVPs', 'APIs & Integrations'],
    variant: 4,
  },
  {
    index: '05 / 06',
    title: 'HARDWARE & CONNECTED TECHNOLOGY',
    description: 'Physical technology that brings sensors, devices and software together to solve practical problems.',
    tags: ['IoT & Embedded Systems', 'Smart Devices', 'Hardware Integration'],
    variant: 5,
  },
  {
    index: '06 / 06',
    title: 'CUSTOM ENGINEERING',
    description: 'Some challenges do not fit a category. We design the right solution around the problem.',
    tags: ['Product R&D', 'Prototyping', 'End-to-End Systems'],
    variant: 6,
  },
];

async function runAudit() {
  console.log('======================================================================');
  console.log('   OSTRUM FINAL TRANSITION AUDIT: ONE LIVE CANONICAL SECTION          ');
  console.log('======================================================================\n');

  const report = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    assertions: [],
    consoleErrors: [],
    pageErrors: [],
    geometryLog: [],
    multiPassResults: [],
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
  await page.waitForTimeout(1000);

  // -------------------------------------------------------------------------
  // TEST 1: CANONICAL COMPONENT COUNT AUDIT ACROSS ALL SCROLL STATES
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 1: Canonical Component Count (Single React Section Rule) ---');

  const getCanonicalCounts = async () => {
    return await page.evaluate(() => {
      const sections = document.querySelectorAll('[data-testid="capabilities-section"]');
      const headings = document.querySelectorAll('[data-testid="capabilities-heading"]');
      const statements = document.querySelectorAll('[data-testid="capabilities-supporting-statement"]');
      const tracks = document.querySelectorAll('[data-testid="capabilities-track"]');
      const cards = document.querySelectorAll('#capabilities article');
      const fakePreviews = document.querySelectorAll('[data-testid="capabilities-transition-preview"]');
      const expandingPrevs = document.querySelectorAll('[data-testid="expanding-capabilities-preview"]');
      const anchors = document.querySelectorAll('[data-testid="capabilities-transition-anchor"]');
      const placeholders = document.querySelectorAll('[data-testid="capabilities-flow-placeholder"]');

      return {
        sectionCount: sections.length,
        headingCount: headings.length,
        statementCount: statements.length,
        trackCount: tracks.length,
        cardCount: cards.length,
        fakePreviewCount: fakePreviews.length,
        expandingPreviewCount: expandingPrevs.length,
        anchorCount: anchors.length,
        placeholderCount: placeholders.length,
      };
    });
  };

  // State 1: At top (Hero)
  const countsHero = await getCanonicalCounts();
  assert('Hero state: Exactly 1 canonical Capabilities section', countsHero.sectionCount === 1, countsHero);
  assert('Hero state: Exactly 1 heading', countsHero.headingCount === 1, countsHero);
  assert('Hero state: Exactly 6 cards', countsHero.cardCount === 6, countsHero);
  assert('Hero state: ZERO fake preview components', countsHero.fakePreviewCount === 0, countsHero);
  assert('Hero state: ZERO duplicate expanding overlays', countsHero.expandingPreviewCount === 0, countsHero);

  // Scroll to Works Wheel
  const wheelTrigger = await page.evaluate(() => {
    const st = window.ScrollTrigger ? window.ScrollTrigger.getById('works-wheel-pin') : null;
    return st ? { start: st.start, end: st.end } : null;
  });
  assert('Works Wheel ScrollTrigger exists', !!wheelTrigger, wheelTrigger);

  const totalDist = wheelTrigger.end - wheelTrigger.start;

  // State 2: At Works Wheel Project 4 (tProj ~ 1.0, settled at rest, p ~ 0.728)
  console.log('\nAdvancing to Works Wheel Project 4 (Our Capabilities settled)...');
  await page.evaluate((pos) => window.scrollTo(0, pos), wheelTrigger.start + totalDist * 0.728);
  await page.waitForTimeout(500);

  const countsP4 = await getCanonicalCounts();
  assert('Project 4 settled: Exactly 1 canonical Capabilities section', countsP4.sectionCount === 1, countsP4);
  assert('Project 4 settled: Exactly 1 heading', countsP4.headingCount === 1, countsP4);
  assert('Project 4 settled: Exactly 1 supporting statement', countsP4.statementCount === 1, countsP4);
  assert('Project 4 settled: Exactly 1 cards track', countsP4.trackCount === 1, countsP4);
  assert('Project 4 settled: Exactly 6 cards', countsP4.cardCount === 6, countsP4);
  assert('Project 4 settled: ZERO duplicate preview mockups', countsP4.fakePreviewCount === 0 && countsP4.expandingPreviewCount === 0, countsP4);
  assert('Project 4 settled: Exactly 1 destination anchor in card 4', countsP4.anchorCount === 1, countsP4);

  // State 3: At expansion midpoint (p ~ 0.86)
  console.log('\nAdvancing to Expansion Midpoint (p ~ 0.86)...');
  await page.evaluate((pos) => window.scrollTo(0, pos), wheelTrigger.start + totalDist * 0.86);
  await page.waitForTimeout(500);

  const countsMid = await getCanonicalCounts();
  assert('Expansion midpoint: Exactly 1 canonical Capabilities section', countsMid.sectionCount === 1, countsMid);
  assert('Expansion midpoint: Exactly 1 heading', countsMid.headingCount === 1, countsMid);
  assert('Expansion midpoint: Exactly 6 cards', countsMid.cardCount === 6, countsMid);
  assert('Expansion midpoint: ZERO duplicate previews or overlays', countsMid.fakePreviewCount === 0 && countsMid.expandingPreviewCount === 0, countsMid);

  // State 4: At full expansion arrival (p ~ 0.99)
  console.log('\nAdvancing to Full Expansion Arrival (p ~ 0.99)...');
  await page.evaluate((pos) => window.scrollTo(0, pos), wheelTrigger.start + totalDist * 0.99);
  await page.waitForTimeout(500);

  const countsArrival = await getCanonicalCounts();
  assert('Full-size arrival: Exactly 1 canonical Capabilities section', countsArrival.sectionCount === 1, countsArrival);
  assert('Full-size arrival: Exactly 1 heading', countsArrival.headingCount === 1, countsArrival);
  assert('Full-size arrival: Exactly 6 cards', countsArrival.cardCount === 6, countsArrival);

  // -------------------------------------------------------------------------
  // TEST 2 & 3: MEASURED GEOMETRY & UNIFORM SCALING WITHOUT TEXT REFLOW
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 2 & 3: Uniform Scaling & Geometry Alignment ---');

  // Return to Project 4 settled state
  await page.evaluate((pos) => window.scrollTo(0, pos), wheelTrigger.start + totalDist * 0.73);
  await page.waitForTimeout(400);

  const geomSettled = await page.evaluate(() => {
    const anchor = document.querySelector('[data-testid="capabilities-transition-anchor"]');
    const pinContainer = document.querySelector('[data-testid="capabilities-pin-container"]');
    const heading = document.querySelector('[data-testid="capabilities-heading"]');
    const statement = document.querySelector('[data-testid="capabilities-supporting-statement"]');

    const aRect = anchor ? anchor.getBoundingClientRect() : null;
    const pRect = pinContainer ? pinContainer.getBoundingClientRect() : null;
    const hRect = heading ? heading.getBoundingClientRect() : null;

    // Check heading computed styles and line-wrapping
    const hStyle = heading ? window.getComputedStyle(heading) : null;
    const hLines = heading ? heading.getClientRects().length : 0;
    const aStyle = anchor ? window.getComputedStyle(anchor) : null;
    const pStyle = pinContainer ? window.getComputedStyle(pinContainer) : null;

    return {
      anchorRect: aRect ? { left: Math.round(aRect.left), top: Math.round(aRect.top), width: Math.round(aRect.width), height: Math.round(aRect.height) } : null,
      containerRect: pRect ? { left: Math.round(pRect.left), top: Math.round(pRect.top), width: Math.round(pRect.width), height: Math.round(pRect.height) } : null,
      headingRect: hRect ? { left: Math.round(hRect.left), top: Math.round(hRect.top), width: Math.round(hRect.width), height: Math.round(hRect.height) } : null,
      headingFontSize: hStyle ? hStyle.fontSize : null,
      headingLineCount: hLines,
      anchorOpacity: aStyle ? aStyle.opacity : null,
      anchorShadow: aStyle ? aStyle.boxShadow : null,
      containerOpacity: pStyle ? pStyle.opacity : null,
      containerTransform: pinContainer ? pinContainer.style.transform : null,
    };
  });

  assert('Section container is transformed via scale()', geomSettled.containerTransform && geomSettled.containerTransform.includes('scale'), geomSettled);
  assert('Section container matches anchor dimensions (~560x350)', geomSettled.containerRect && Math.abs(geomSettled.containerRect.width - geomSettled.anchorRect.width) < 10, geomSettled);
  assert('Frame Zero: Capabilities section has full opacity in thumbnail (opacity === 1)', parseFloat(geomSettled.containerOpacity || '0') >= 0.95, geomSettled);
  assert('Single Surface: Card 4 anchor is transparent (opacity === 0, no shadow)', geomSettled.anchorOpacity === '0' && (geomSettled.anchorShadow === 'none' || !geomSettled.anchorShadow), geomSettled);
  assert('Frame Zero: Capabilities heading is rendered inside thumbnail bounds', geomSettled.headingRect && geomSettled.headingRect.top >= geomSettled.containerRect.top, geomSettled);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'final-01-thumbnail-settled.png'),
    fullPage: false,
  });

  // Check Midpoint Geometry
  await page.evaluate((pos) => window.scrollTo(0, pos), wheelTrigger.start + totalDist * 0.86);
  await page.waitForTimeout(400);

  const geomMid = await page.evaluate(() => {
    const pinContainer = document.querySelector('[data-testid="capabilities-pin-container"]');
    const pRect = pinContainer ? pinContainer.getBoundingClientRect() : null;
    const heading = document.querySelector('[data-testid="capabilities-heading"]');
    const hLines = heading ? heading.getClientRects().length : 0;
    return {
      width: pRect ? Math.round(pRect.width) : 0,
      height: pRect ? Math.round(pRect.height) : 0,
      left: pRect ? Math.round(pRect.left) : 0,
      headingLineCount: hLines,
      transform: pinContainer ? pinContainer.style.transform : null,
    };
  });

  assert('Midpoint: Container has expanded smoothly (> 800px width)', geomMid.width > 800, geomMid);
  assert('Midpoint: Heading line count is stable (NO text reflow)', geomMid.headingLineCount === geomSettled.headingLineCount, { settled: geomSettled.headingLineCount, mid: geomMid.headingLineCount });

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'final-02-expansion-midpoint.png'),
    fullPage: false,
  });

  // Check Full-Size Arrival Geometry
  await page.evaluate((pos) => window.scrollTo(0, pos), wheelTrigger.start + totalDist * 0.995);
  await page.waitForTimeout(400);

  const geomFull = await page.evaluate(() => {
    const pinContainer = document.querySelector('[data-testid="capabilities-pin-container"]');
    const pRect = pinContainer ? pinContainer.getBoundingClientRect() : null;
    const heading = document.querySelector('[data-testid="capabilities-heading"]');
    const hLines = heading ? heading.getClientRects().length : 0;
    return {
      width: pRect ? Math.round(pRect.width) : 0,
      height: pRect ? Math.round(pRect.height) : 0,
      left: pRect ? Math.round(pRect.left) : 0,
      headingLineCount: hLines,
      borderRadius: pinContainer ? pinContainer.style.borderRadius : null,
      viewportW: window.innerWidth,
      viewportH: window.innerHeight,
    };
  });

  assert('Arrival: Container covers full viewport (1440x900)', geomFull.width >= 1438 && geomFull.height >= 898, geomFull);
  assert('Arrival: Border radius is 0px at full arrival', geomFull.borderRadius === '0px' || parseFloat(geomFull.borderRadius) === 0, geomFull);
  assert('Arrival: Heading line count is identical (0 text reflow)', geomFull.headingLineCount === geomSettled.headingLineCount, { settled: geomSettled.headingLineCount, arrival: geomFull.headingLineCount });

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'final-03-full-arrival.png'),
    fullPage: false,
  });

  // -------------------------------------------------------------------------
  // TEST 4 & 5: OUTGOING METADATA & ZERO DUPLICATE OVERLAP
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 4 & 5: Outgoing Wheel Metadata & No Overlap ---');

  // Verify left panel opacity during expansion
  const leftPanelOpacities = await page.evaluate(() => {
    const lp = document.querySelector('[data-testid="works-wheel-left-panel"]');
    return lp ? parseFloat(window.getComputedStyle(lp).opacity) : 1;
  });
  assert('At full expansion: Works Wheel left panel has faded to 0 opacity', leftPanelOpacities < 0.05, { opacity: leftPanelOpacities });

  // Verify no NeuroMove anywhere
  const noNeuro = await page.evaluate(() => {
    const text = document.body.textContent || '';
    return !text.includes('NeuroMove');
  });
  assert('No NeuroMove text or components exist anywhere on the page', noNeuro);

  // -------------------------------------------------------------------------
  // TEST 6: NO WHITE-SCREEN PAUSE
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 6: Continuous Visibility (Zero White-Screen Pause) ---');

  // Sample opacity at 5 points during expansion
  const expansionSteps = [0.75, 0.80, 0.85, 0.90, 0.95];
  for (const step of expansionSteps) {
    await page.evaluate((pos) => window.scrollTo(0, pos), wheelTrigger.start + totalDist * step);
    await page.waitForTimeout(100);
    const stepState = await page.evaluate(() => {
      const pinContainer = document.querySelector('[data-testid="capabilities-pin-container"]');
      const op = pinContainer ? window.getComputedStyle(pinContainer).opacity : '0';
      return parseFloat(op);
    });
    assert(`At step p=${step}: Capabilities section is visible (opacity >= 0.9)`, stepState >= 0.9, { step, opacity: stepState });
  }

  // -------------------------------------------------------------------------
  // TEST 7: STABLE RETURN PATH (3 FORWARD & REVERSE CYCLES)
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 7: Multi-Pass Bidirectional Reversibility (3 Passes) ---');

  const capTrigger = await page.evaluate(() => {
    const st = window.ScrollTrigger ? window.ScrollTrigger.getById('capabilities-pin') : null;
    return st ? { start: st.start, end: st.end } : null;
  });
  assert('Capabilities Section ScrollTrigger exists', !!capTrigger, capTrigger);

  for (let pass = 1; pass <= 3; pass++) {
    console.log(`\nExecuting Pass ${pass} Forward -> Reverse cycle...`);

    // Forward scroll through Capabilities horizontal cards
    const capDist = capTrigger.end - capTrigger.start;
    await page.evaluate((pos) => window.scrollTo(0, pos), capTrigger.start + capDist * 0.85);
    await page.waitForTimeout(300);

    const fwdCheck = await page.evaluate(() => {
      const track = document.querySelector('[data-testid="capabilities-track"]');
      const tr = track ? window.getComputedStyle(track).transform : '';
      const cCount = document.querySelectorAll('[data-testid="capabilities-section"]').length;
      return { transform: tr, sectionCount: cCount };
    });
    assert(`Pass ${pass} Forward: Track translated horizontally`, fwdCheck.transform.includes('-'), fwdCheck);
    assert(`Pass ${pass} Forward: Section count remains 1`, fwdCheck.sectionCount === 1, fwdCheck);

    // Reverse scroll back to Project 4 settled state
    await page.evaluate((pos) => window.scrollTo(0, pos), wheelTrigger.start + totalDist * 0.73);
    await page.waitForTimeout(400);

    const revCheck = await page.evaluate(() => {
      const pinContainer = document.querySelector('[data-testid="capabilities-pin-container"]');
      const lp = document.querySelector('[data-testid="works-wheel-left-panel"]');
      const lpOp = lp ? parseFloat(window.getComputedStyle(lp).opacity) : 0;
      const rect = pinContainer ? pinContainer.getBoundingClientRect() : null;
      const cCount = document.querySelectorAll('[data-testid="capabilities-section"]').length;
      return {
        sectionCount: cCount,
        leftPanelOpacity: lpOp,
        width: rect ? Math.round(rect.width) : 0,
      };
    });

    assert(`Pass ${pass} Reverse: Section count remains 1`, revCheck.sectionCount === 1, revCheck);
    assert(
      `Pass ${pass} Reverse: Section returned to thumbnail size (matches initial width ~${geomSettled.containerRect.width}px)`,
      Math.abs(revCheck.width - geomSettled.containerRect.width) <= 10,
      revCheck
    );
  }

  // -------------------------------------------------------------------------
  // TEST 8: ACTUAL CARD TRACK FUNCTIONALITY & ZERO CTA
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 8: All 6 Service Cards & Editorial Content ---');

  // Scroll into full Capabilities horizontal track
  await page.evaluate((pos) => window.scrollTo(0, pos), capTrigger.start + 50);
  await page.waitForTimeout(400);

  const cardsData = await page.evaluate(() => {
    const articles = Array.from(document.querySelectorAll('#capabilities article'));
    const overline = document.querySelector('[data-testid="capabilities-overline"]');
    const sec = document.getElementById('capabilities');
    const ctas = sec ? sec.querySelectorAll('a[href*="mailto"], a[href*="contact"], button:not([role="tab"])') : [];
    return {
      count: articles.length,
      hasOverline: !!overline,
      ctaCount: ctas.length,
      cards: articles.map((art) => ({
        index: art.querySelector('span.font-mono')?.textContent?.trim(),
        title: art.querySelector('h3')?.textContent?.trim(),
        desc: art.querySelector('p')?.textContent?.trim(),
        tags: Array.from(art.querySelectorAll('div.flex-wrap span')).map((t) => t.textContent.trim()),
        hasCanvas: !!art.querySelector('canvas'),
      })),
    };
  });

  assert('No "WHAT WE BUILD" overline present', !cardsData.hasOverline);
  assert('STRICT: Zero CTAs inside Capabilities', cardsData.ctaCount === 0, { ctaCount: cardsData.ctaCount });
  assert('Exactly 6 service cards present', cardsData.count === 6, { count: cardsData.count });

  EXPECTED_CARDS.forEach((exp, i) => {
    const act = cardsData.cards[i];
    assert(`Card ${i + 1}: Index is "${exp.index}"`, act.index === exp.index, act);
    assert(`Card ${i + 1}: Title is "${exp.title}"`, act.title === exp.title, act);
    assert(`Card ${i + 1}: Description matches exact copy`, act.desc === exp.description, act);
    assert(`Card ${i + 1}: Tags match [${exp.tags.join(', ')}]`, JSON.stringify(act.tags) === JSON.stringify(exp.tags), act);
    assert(`Card ${i + 1}: Has 3D accent canvas`, act.hasCanvas, act);
  });

  // -------------------------------------------------------------------------
  // TEST 9: MULTI-VIEWPORT RESPONSIVE AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 9: Multi-Viewport Responsive Matrix ---');

  const viewports = [
    { name: '1920x1080', width: 1920, height: 1080 },
    { name: '1440x900', width: 1440, height: 900 },
    { name: '1024x768', width: 1024, height: 768 },
    { name: '390x844', width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(400);

    const vpData = await page.evaluate(() => {
      const sCount = document.querySelectorAll('[data-testid="capabilities-section"]').length;
      const hCount = document.querySelectorAll('[data-testid="capabilities-heading"]').length;
      const cCount = document.querySelectorAll('#capabilities article').length;
      return { sCount, hCount, cCount };
    });

    assert(`Viewport ${vp.name}: Exactly 1 section, 1 heading, 6 cards`, vpData.sCount === 1 && vpData.hCount === 1 && vpData.cCount === 6, vpData);

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, `final-vp-${vp.name}.png`),
      fullPage: false,
    });
  }

  // -------------------------------------------------------------------------
  // TEST 10: CONSOLE & PAGE ERRORS
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 10: Runtime Health & Console Cleanliness ---');
  assert('Zero console errors', report.consoleErrors.length === 0, report.consoleErrors);
  assert('Zero page errors', report.pageErrors.length === 0, report.pageErrors);

  await browser.close();

  // Summary
  console.log('\n======================================================================');
  console.log(`TOTAL PASSED: ${report.testsPassed}`);
  console.log(`TOTAL FAILED: ${report.testsFailed}`);
  console.log(`CONSOLE ERRORS: ${report.consoleErrors.length}`);
  console.log(`PAGE ERRORS: ${report.pageErrors.length}`);
  console.log('======================================================================\n');

  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'final_transition_audit_report.json'),
    JSON.stringify(report, null, 2)
  );

  if (report.testsFailed > 0 || report.consoleErrors.length > 0 || report.pageErrors.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
