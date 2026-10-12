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
    gradientIncludes: '#D7B5FA',
    variant: 1,
  },
  {
    index: '02 / 06',
    title: 'AI SYSTEMS & AGENTS',
    description: 'Intelligent systems that respond, reason and carry work forward across your business.',
    tags: ['AI Receptionists', 'AI Agents', 'Workflow Automation'],
    gradientIncludes: '#86FFF8',
    variant: 2,
  },
  {
    index: '03 / 06',
    title: 'BUSINESS PLATFORMS',
    description: 'Connected systems that bring customer relationships, daily operations and business data into focus.',
    tags: ['CRM & ERP', 'Operations Dashboards', 'Business Workflows'],
    gradientIncludes: '#FAC274',
    variant: 3,
  },
  {
    index: '04 / 06',
    title: 'SOFTWARE & PRODUCT ENGINEERING',
    description: 'From a promising idea to a dependable digital product built for real-world use.',
    tags: ['Web & Mobile Apps', 'SaaS & MVPs', 'APIs & Integrations'],
    gradientIncludes: '#BBCBFF',
    variant: 4,
  },
  {
    index: '05 / 06',
    title: 'HARDWARE & CONNECTED TECHNOLOGY',
    description: 'Physical technology that brings sensors, devices and software together to solve practical problems.',
    tags: ['IoT & Embedded Systems', 'Smart Devices', 'Hardware Integration'],
    gradientIncludes: '#BDECCF',
    variant: 5,
  },
  {
    index: '06 / 06',
    title: 'CUSTOM ENGINEERING',
    description: 'Some challenges do not fit a category. We design the right solution around the problem.',
    tags: ['Product R&D', 'Prototyping', 'End-to-End Systems'],
    gradientIncludes: '#E9C9F6',
    variant: 6,
  },
];

async function runVerification() {
  console.log('======================================================================');
  console.log('   OSTRUM PHASE 5.1: SELECTED WORK -> CAPABILITIES AUDIT SUITE        ');
  console.log('======================================================================\n');

  const report = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    assertions: [],
    consoleErrors: [],
    pageErrors: [],
    wheelProjects: [],
    expansionMetrics: {},
    capabilitiesMetrics: {},
    responsiveResults: [],
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
  // PART 1: REGRESSION AUDIT (Hero -> Sec02 -> Sec03 -> Works Wheel)
  // -------------------------------------------------------------------------
  console.log('\n--- PART 1: Verifying Existing Flow Regression ---');

  const heroData = await page.evaluate(() => {
    const wordmark = document.querySelector('.intro svg[aria-label="OSTRUM"]');
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    return {
      bodyBg,
      hasWordmark: !!wordmark,
      scrollY: window.scrollY,
    };
  });
  assert('Hero has pure dark background', heroData.bodyBg === 'rgb(0, 0, 0)', heroData);
  assert('Hero wordmark is present', heroData.hasWordmark, heroData);

  // -------------------------------------------------------------------------
  // PART 2: WORKS WHEEL PROJECTS & OUR CAPABILITIES IN 4TH POSITION
  // -------------------------------------------------------------------------
  console.log('\n--- PART 2: Works Wheel Projects (TMR -> Saraswati -> MNESA -> Our Capabilities) ---');

  const wheelTrigger = await page.evaluate(() => {
    const st = window.ScrollTrigger ? window.ScrollTrigger.getById('works-wheel-pin') : null;
    return st ? { start: st.start, end: st.end, distance: st.vars.end } : null;
  });
  assert('Works Wheel ScrollTrigger is registered', !!wheelTrigger, wheelTrigger);

  // At rest (turn = 0)
  await page.evaluate((pos) => window.scrollTo(0, pos), wheelTrigger.start + 50);
  await page.waitForTimeout(600);

  const wheelAtRest = await page.evaluate(() => {
    const label = document.querySelector('[data-testid="works-wheel-center-label"]');
    const sec = document.getElementById('selected-work');
    return {
      label: label ? label.textContent.trim() : null,
      bg: sec ? window.getComputedStyle(sec).backgroundColor : null,
    };
  });
  assert('Works Wheel center label at rest is "Selected Work"', wheelAtRest.label === 'Selected Work', wheelAtRest);

  const totalDist = wheelTrigger.end - wheelTrigger.start;
  // Sample progress points for projects
  // Total pin distance = 400 (hold) + 900 (morph) + 3000 (projects) + 1600 (expand) = 5900
  // p1 = 400/5900 = 0.0678
  // p2 = 1300/5900 = 0.2203
  // p3 = 4300/5900 = 0.7288
  // Entry 1 (TMR): tProj ~ 0 => p ~ 0.2203
  // Entry 2 (Saraswati): tProj ~ 0.333 => p ~ 0.3898
  // Entry 3 (MNESA): tProj ~ 0.666 => p ~ 0.5593
  // Entry 4 (Our Capabilities): tProj ~ 1.0 => p ~ 0.7288

  // Project 1: TMR
  await page.evaluate((pos) => window.scrollTo(0, pos), wheelTrigger.start + totalDist * 0.23);
  await page.waitForTimeout(400);
  const p1Data = await page.evaluate(() => {
    const title = document.querySelector('#selected-work h3')?.textContent?.trim();
    return { title };
  });
  assert('Project 1 is "TMR AI Car Care"', p1Data.title === 'TMR AI Car Care', p1Data);

  // Project 2: Saraswati
  await page.evaluate((pos) => window.scrollTo(0, pos), wheelTrigger.start + totalDist * 0.40);
  await page.waitForTimeout(400);
  const p2Data = await page.evaluate(() => {
    const title = document.querySelector('#selected-work h3')?.textContent?.trim();
    return { title };
  });
  assert('Project 2 is "Saraswati Driving School"', p2Data.title === 'Saraswati Driving School', p2Data);

  // Project 3: MNESA
  await page.evaluate((pos) => window.scrollTo(0, pos), wheelTrigger.start + totalDist * 0.58);
  await page.waitForTimeout(400);
  const p3Data = await page.evaluate(() => {
    const title = document.querySelector('#selected-work h3')?.textContent?.trim();
    return { title };
  });
  assert('Project 3 is "MNESA"', p3Data.title === 'MNESA', p3Data);

  // Project 4: Our Capabilities (p = p3, ~ 0.73)
  await page.evaluate((pos) => window.scrollTo(0, pos), wheelTrigger.start + totalDist * 0.728);
  await page.waitForTimeout(400);

  const p4Data = await page.evaluate(() => {
    const title =
      document.querySelector('[data-testid="works-wheel-project-title"]')?.textContent?.trim() ||
      document.querySelector('#selected-work h3')?.textContent?.trim();
    const desc =
      document.querySelector('[data-testid="works-wheel-project-description"]')?.textContent?.trim() ||
      document.querySelector('#selected-work [data-testid="works-wheel-left-panel"] p')?.textContent?.trim();
    const liveLink = document.querySelector('#selected-work a[href^="http"]');
    const preview = document.querySelector('[data-testid="capabilities-transition-preview"]');
    const previewRect = preview ? preview.getBoundingClientRect() : null;
    return {
      title,
      desc,
      hasLiveLink: !!liveLink,
      hasPreview: !!preview,
      previewBounds: previewRect ? { width: Math.round(previewRect.width), height: Math.round(previewRect.height) } : null,
    };
  });

  assert('Entry 4 title is "Our Capabilities"', p4Data.title === 'Our Capabilities', p4Data);
  assert(
    'Entry 4 description matches exact prompt specification',
    p4Data.desc === 'From digital experiences and intelligent AI systems to business platforms, product engineering and connected hardware, we build the technology that moves businesses forward.',
    p4Data
  );
  assert('Entry 4 has NO external client link', !p4Data.hasLiveLink, p4Data);
  assert('Entry 4 card displays capabilities preview thumbnail', p4Data.hasPreview && p4Data.previewBounds && p4Data.previewBounds.width > 0, p4Data);

  // Check no duplicate NeuroMove exists anywhere
  const noNeuroMove = await page.evaluate(() => {
    const titles = Array.from(document.querySelectorAll('h3, h2, h4')).map((el) => el.textContent.trim());
    return {
      hasNeuroMoveTitle: titles.some((t) => t.includes('NeuroMove')),
      hasHandoffCard: !!document.querySelector('[data-testid="expanding-project-card"]'),
    };
  });
  assert('NeuroMove is NOT in Selected Work or headings', !noNeuroMove.hasNeuroMoveTitle, noNeuroMove);
  assert('Old intermediate handoff card is completely removed from DOM', !noNeuroMove.hasHandoffCard, noNeuroMove);

  // -------------------------------------------------------------------------
  // PART 3: SHARED-ELEMENT EXPANSION INTO CAPABILITIES
  // -------------------------------------------------------------------------
  console.log('\n--- PART 3: Verifying Shared-Element Thumbnail Expansion ---');

  // Mid-expansion (p ~ 0.85)
  await page.evaluate((pos) => window.scrollTo(0, pos), wheelTrigger.start + totalDist * 0.85);
  await page.waitForTimeout(400);

  const expMid = await page.evaluate(() => {
    const expLayer = document.querySelector('[data-testid="expanding-capabilities-preview"]');
    const rect = expLayer ? expLayer.getBoundingClientRect() : null;
    const style = expLayer ? window.getComputedStyle(expLayer) : null;
    return {
      width: rect ? Math.round(rect.width) : 0,
      height: rect ? Math.round(rect.height) : 0,
      opacity: style ? parseFloat(style.opacity) : 0,
      borderRadius: style ? style.borderRadius : null,
    };
  });
  assert('Expanding preview is visible (opacity > 0.8)', expMid.opacity > 0.8, expMid);
  assert('Expanding preview has grown larger than initial card (> 700px width)', expMid.width > 700, expMid);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'capabilities-01-handoff-expansion.png'),
    fullPage: false,
  });

  // Full expansion hold (p ~ 0.98)
  await page.evaluate((pos) => window.scrollTo(0, pos), wheelTrigger.start + totalDist * 0.98);
  await page.waitForTimeout(400);

  const expFull = await page.evaluate(() => {
    const expLayer = document.querySelector('[data-testid="expanding-capabilities-preview"]');
    const rect = expLayer ? expLayer.getBoundingClientRect() : null;
    const style = expLayer ? window.getComputedStyle(expLayer) : null;
    return {
      width: rect ? Math.round(rect.width) : 0,
      height: rect ? Math.round(rect.height) : 0,
      borderRadius: style ? style.borderRadius : null,
      viewportW: window.innerWidth,
      viewportH: window.innerHeight,
    };
  });
  assert('Expanding preview reaches 100vw x 100vh full viewport (1440x900)', expFull.width >= 1440 && expFull.height >= 900, expFull);
  assert('Border radius reaches 0px at full expansion', expFull.borderRadius === '0px' || parseFloat(expFull.borderRadius) === 0, expFull);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'capabilities-02-handoff-fullscreen-hold.png'),
    fullPage: false,
  });

  // -------------------------------------------------------------------------
  // PART 4: CAPABILITIES SECTION AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- PART 4: Verifying Capabilities Section ---');

  const capTrigger = await page.evaluate(() => {
    const st = window.ScrollTrigger ? window.ScrollTrigger.getById('capabilities-pin') : null;
    return st ? { start: st.start, end: st.end, distance: st.vars.end } : null;
  });
  assert('Capabilities Section ScrollTrigger is registered', !!capTrigger, capTrigger);

  // Scroll into Capabilities
  await page.evaluate((pos) => window.scrollTo(0, pos), capTrigger.start + 50);
  await page.waitForTimeout(600);

  const capHeaderData = await page.evaluate(() => {
    const sec = document.getElementById('capabilities');
    const overline = document.querySelector('[data-testid="capabilities-overline"]');
    const heading = document.querySelector('[data-testid="capabilities-heading"]')?.textContent?.trim();
    const statement = document.querySelector('[data-testid="capabilities-supporting-statement"]')?.textContent?.trim();
    const edgeLeft = document.querySelector('[data-testid="capabilities-edge-fade-left"]');
    const edgeRight = document.querySelector('[data-testid="capabilities-edge-fade-right"]');
    const bg = sec ? window.getComputedStyle(sec).backgroundColor : null;

    // Strict check: NO CTA INSIDE CAPABILITIES
    const ctaLinks = sec ? sec.querySelectorAll('a[href*="mailto"], a[href*="contact"], button:not([role="tab"])') : [];

    // Check that "WHAT WE BUILD" text is NOT present anywhere in #capabilities
    const textContent = sec ? sec.textContent : '';
    const hasWhatWeBuild = textContent.includes('WHAT WE BUILD');

    return {
      hasOverlineElem: !!overline,
      hasWhatWeBuild,
      heading,
      statement,
      hasEdgeLeft: !!edgeLeft,
      hasEdgeRight: !!edgeRight,
      bg,
      ctaCount: ctaLinks.length,
    };
  });

  assert('"WHAT WE BUILD" overline is REMOVED from Capabilities', !capHeaderData.hasOverlineElem && !capHeaderData.hasWhatWeBuild, capHeaderData);
  assert('Heading is "Our Capabilities"', capHeaderData.heading === 'Our Capabilities', capHeaderData);
  assert(
    'Supporting statement matches exact copy',
    capHeaderData.statement ===
      'We design and engineer the systems that move businesses forward—from digital experiences and intelligent software to connected hardware built around real-world needs.',
    capHeaderData
  );
  assert('Soft edge fades exist on both left and right edges', capHeaderData.hasEdgeLeft && capHeaderData.hasEdgeRight, capHeaderData);
  assert('STRICT REQUIREMENT: Zero CTAs inside Capabilities section', capHeaderData.ctaCount === 0, capHeaderData);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'capabilities-04-capabilities-overview.png'),
    fullPage: false,
  });

  // Verify all 6 cards
  const cardsData = await page.evaluate(() => {
    const articles = Array.from(document.querySelectorAll('#capabilities article'));
    return articles.map((art, idx) => {
      const indexText = art.querySelector('span.font-mono')?.textContent?.trim();
      const title = art.querySelector('h3')?.textContent?.trim();
      const desc = art.querySelector('p')?.textContent?.trim();
      const tags = Array.from(art.querySelectorAll('div.flex-wrap span')).map((t) => t.textContent.trim());
      const bg = art.style.background || window.getComputedStyle(art).backgroundImage;
      const hasCanvas = !!art.querySelector('canvas');
      const rect = art.getBoundingClientRect();
      return {
        idx,
        indexText,
        title,
        desc,
        tags,
        bg,
        hasCanvas,
        rect: {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          left: Math.round(rect.left),
        },
      };
    });
  });

  assert('All 6 service cards rendered in track', cardsData.length === 6, { count: cardsData.length });

  EXPECTED_CARDS.forEach((exp, i) => {
    const actual = cardsData[i];
    if (!actual) {
      assert(`Card ${i + 1} exists`, false, { expected: exp });
      return;
    }
    assert(`Card ${i + 1} index is "${exp.index}"`, actual.indexText === exp.index, actual);
    assert(`Card ${i + 1} title is "${exp.title}"`, actual.title === exp.title, actual);
    assert(`Card ${i + 1} description matches exact copy`, actual.desc === exp.description, actual);
    assert(`Card ${i + 1} tags match: [${exp.tags.join(', ')}]`, JSON.stringify(actual.tags) === JSON.stringify(exp.tags), actual);
    assert(`Card ${i + 1} has 3D accent canvas`, actual.hasCanvas, actual);
    assert(
      `Card ${i + 1} dimensions match portrait ratio (~360x510 on desktop)`,
      actual.rect.width >= 300 && actual.rect.width <= 380 && actual.rect.height >= 450 && actual.rect.height <= 550,
      actual.rect
    );
  });

  // Scroll horizontally through the catalogue
  console.log('\nScrubbing scroll through horizontal catalogue...');
  const capDist = capTrigger.end - capTrigger.start;
  await page.evaluate((pos) => window.scrollTo(0, pos), capTrigger.start + capDist * 0.75);
  await page.waitForTimeout(600);

  const trackScrolled = await page.evaluate(() => {
    const track = document.querySelector('[data-testid="capabilities-track"]');
    const transform = track ? window.getComputedStyle(track).transform : null;
    const card6 = document.querySelector('[data-testid="capability-card-6"]');
    const card6Rect = card6 ? card6.getBoundingClientRect() : null;
    return {
      transform,
      card6Left: card6Rect ? Math.round(card6Rect.left) : null,
      viewportW: window.innerWidth,
    };
  });
  assert('Track translated horizontally under scroll scrub (transform matrix has negative translateX)', trackScrolled.transform && trackScrolled.transform.includes('-'), trackScrolled);
  assert('Card 06 has moved into visible viewport area', trackScrolled.card6Left !== null && trackScrolled.card6Left < 1440, trackScrolled);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'capabilities-05-cards-horizontal-scrolled.png'),
    fullPage: false,
  });

  // -------------------------------------------------------------------------
  // PART 5: STUDIO FOOTER AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- PART 5: Verifying Studio Footer ---');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(600);

  const footerData = await page.evaluate(() => {
    const footer = document.getElementById('studio-footer');
    const overline = footer ? footer.querySelector('p')?.textContent?.trim() : null;
    const heading = footer ? footer.querySelector('h2')?.textContent?.trim() : null;
    const ctaLink = footer ? footer.querySelector('a[href^="mailto:hello@ostrum.co"]') : null;
    return {
      overline,
      heading,
      hasCtaLink: !!ctaLink,
      ctaText: ctaLink ? ctaLink.textContent?.trim() : null,
      scrollY: window.scrollY,
    };
  });

  assert('Studio Footer overline is "READY FOR WHAT\'S NEXT?"', footerData.overline === "READY FOR WHAT'S NEXT?", footerData);
  assert('Studio Footer has authoritative contact link to mailto:hello@ostrum.co', footerData.hasCtaLink, footerData);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'capabilities-06-studio-footer.png'),
    fullPage: false,
  });

  // -------------------------------------------------------------------------
  // PART 6: REVERSIBLE SCROLL AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- PART 6: Verifying Reversible Scroll Upward to Hero ---');
  for (let y = await page.evaluate(() => window.scrollY); y >= 0; y -= 1500) {
    await page.evaluate((top) => window.scrollTo(0, top), Math.max(0, y));
    await page.waitForTimeout(100);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);

  const topState = await page.evaluate(() => ({
    scrollY: window.scrollY,
    bodyBg: window.getComputedStyle(document.body).backgroundColor,
  }));
  assert('Successfully reversed all the way back to Hero (scrollY == 0)', topState.scrollY === 0, topState);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'capabilities-07-reversed-to-hero.png'),
    fullPage: false,
  });

  // -------------------------------------------------------------------------
  // PART 7: RESPONSIVE MATRIX AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- PART 7: Responsive Matrix Audit ---');
  const viewports = [
    { name: 'desktop-1920x1080', width: 1920, height: 1080 },
    { name: 'desktop-1440x900', width: 1440, height: 900 },
    { name: 'tablet-1024x768', width: 1024, height: 768 },
    { name: 'tablet-portrait-768x1024', width: 768, height: 1024 },
    { name: 'mobile-390x844', width: 390, height: 844 },
    { name: 'mobile-375x812', width: 375, height: 812 },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(500);

    // Scroll to Capabilities
    await page.evaluate(() => {
      const el = document.getElementById('capabilities');
      if (el) window.scrollTo(0, el.offsetTop);
    });
    await page.waitForTimeout(400);

    const vpMetrics = await page.evaluate(() => {
      const heading = document.querySelector('[data-testid="capabilities-heading"]');
      const cards = document.querySelectorAll('#capabilities article');
      return {
        hasHeading: !!heading,
        cardCount: cards.length,
      };
    });

    assert(`Responsive check on ${vp.name}: 6 cards visible, heading present`, vpMetrics.cardCount === 6 && vpMetrics.hasHeading, vpMetrics);

    const screenshotPath = path.join(ARTIFACTS_DIR, `capabilities-vp-${vp.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    report.responsiveResults.push({ ...vp, ...vpMetrics });
  }

  // -------------------------------------------------------------------------
  // PART 8: PREFERS-REDUCED-MOTION AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- PART 8: Reduced Motion Audit ---');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const reducedMotionData = await page.evaluate(() => {
    const sec = document.getElementById('capabilities');
    const track = document.querySelector('[data-testid="capabilities-track"]');
    return {
      hasCapabilities: !!sec,
      trackOverflow: track ? window.getComputedStyle(track).overflowX : null,
    };
  });
  assert('Capabilities renders safely in reduced motion mode', reducedMotionData.hasCapabilities, reducedMotionData);

  // Close browser and record results
  await browser.close();

  // Summary
  console.log('\n======================================================================');
  console.log(`TOTAL PASSED: ${report.testsPassed}`);
  console.log(`TOTAL FAILED: ${report.testsFailed}`);
  console.log(`CONSOLE ERRORS: ${report.consoleErrors.length}`);
  console.log(`PAGE ERRORS: ${report.pageErrors.length}`);
  console.log('======================================================================\n');

  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'capabilities_and_handoff_verification_report.json'),
    JSON.stringify(report, null, 2)
  );

  if (report.testsFailed > 0 || report.consoleErrors.length > 0 || report.pageErrors.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runVerification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
