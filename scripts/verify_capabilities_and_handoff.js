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
  console.log('===============================================================');
  console.log('   OSTRUM PHASE 5: CAPABILITIES & HANDOFF AUDIT SUITE          ');
  console.log('===============================================================\n');

  const report = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    assertions: [],
    consoleErrors: [],
    pageErrors: [],
    handoffMetrics: {},
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

  // Scroll to Works Wheel
  console.log('\nScrolling to Works Wheel entrance...');
  await page.evaluate(() => {
    const st = window.ScrollTrigger ? window.ScrollTrigger.getById('works-wheel-pin') : null;
    if (st) {
      window.scrollTo(0, st.start + 50);
    } else {
      const el = document.getElementById('selected-work');
      if (el) window.scrollTo(0, el.offsetTop);
    }
  });
  await page.waitForTimeout(600);

  const wheelAtRest = await page.evaluate(() => {
    const label = document.querySelector('[data-testid="works-wheel-center-label"]');
    const sec = document.getElementById('selected-work');
    return {
      label: label ? label.textContent.trim() : null,
      bg: sec ? window.getComputedStyle(sec).backgroundColor : null,
      scrollY: window.scrollY,
    };
  });
  assert('Works Wheel center label at rest is "Selected Work"', wheelAtRest.label === 'Selected Work', wheelAtRest);

  // Advance through Works Wheel to Project 4 (NeuroMove)
  console.log('\nAdvancing through Works Wheel to NeuroMove (Project 4)...');
  await page.evaluate(() => {
    const st = window.ScrollTrigger ? window.ScrollTrigger.getById('works-wheel-pin') : null;
    if (st) {
      // Scroll to end of Works Wheel pin (just before unpinning, where NeuroMove is front and held)
      window.scrollTo(0, st.end - 100);
    }
  });
  await page.waitForTimeout(600);

  const project4State = await page.evaluate(() => {
    const sec = document.getElementById('selected-work');
    const title = sec ? sec.querySelector('h3')?.textContent : null;
    const bg = sec ? window.getComputedStyle(sec).backgroundColor : null;
    return { title, bg, scrollY: window.scrollY };
  });
  assert('Works Wheel ends on NeuroMove project', project4State.title === 'NeuroMove', project4State);

  // -------------------------------------------------------------------------
  // PART 2: CINEMATIC PROJECT MEDIA EXPANSION HANDOFF
  // -------------------------------------------------------------------------
  console.log('\n--- PART 2: Verifying Cinematic Project Media Expansion Handoff ---');

  const handoffTrigger = await page.evaluate(() => {
    const st = window.ScrollTrigger ? window.ScrollTrigger.getById('project-expansion-pin') : null;
    return st ? { start: st.start, end: st.end, distance: st.vars.end } : null;
  });
  assert('Project Expansion Handoff ScrollTrigger is registered', !!handoffTrigger, handoffTrigger);

  // Step 2.1: Start of handoff (p = 0.0)
  await page.evaluate((pos) => window.scrollTo(0, pos), handoffTrigger.start + 10);
  await page.waitForTimeout(400);

  const handoffStart = await page.evaluate(() => {
    const card = document.querySelector('[data-testid="expanding-project-card"]');
    const rect = card ? card.getBoundingClientRect() : null;
    const img = card ? card.querySelector('img')?.getAttribute('src') : null;
    const overlay = document.querySelector('[data-testid="handoff-light-overlay"]');
    const overlayOpacity = overlay ? parseFloat(window.getComputedStyle(overlay).opacity) : null;
    return {
      cardRect: rect ? { width: Math.round(rect.width), height: Math.round(rect.height), left: Math.round(rect.left), top: Math.round(rect.top) } : null,
      imgSrc: img,
      overlayOpacity,
    };
  });
  assert('Expanding card has NeuroMove source (/images/works/neuromove.jpg)', handoffStart.imgSrc === '/images/works/neuromove.jpg', handoffStart);
  assert('Expanding card starts in compact card dimensions (< 700px width on 1440px viewport)', handoffStart.cardRect && handoffStart.cardRect.width < 700, handoffStart);
  assert('Light overlay starts fully transparent (opacity 0)', handoffStart.overlayOpacity === 0, handoffStart);

  // Step 2.2: Expansion mid-point (p ~ 0.50)
  const dist = handoffTrigger.end - handoffTrigger.start;
  await page.evaluate((pos) => window.scrollTo(0, pos), handoffTrigger.start + dist * 0.45);
  await page.waitForTimeout(400);

  const handoffMid = await page.evaluate(() => {
    const card = document.querySelector('[data-testid="expanding-project-card"]');
    const rect = card ? card.getBoundingClientRect() : null;
    return {
      width: rect ? Math.round(rect.width) : 0,
      height: rect ? Math.round(rect.height) : 0,
      left: rect ? Math.round(rect.left) : 0,
    };
  });
  assert('Card expands during scroll scrub (> 800px width)', handoffMid.width > 800, handoffMid);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'capabilities-01-handoff-expansion.png'),
    fullPage: false,
  });

  // Step 2.3: Full Viewport Hold Beat (p ~ 0.65)
  await page.evaluate((pos) => window.scrollTo(0, pos), handoffTrigger.start + dist * 0.65);
  await page.waitForTimeout(400);

  const handoffHold = await page.evaluate(() => {
    const card = document.querySelector('[data-testid="expanding-project-card"]');
    const rect = card ? card.getBoundingClientRect() : null;
    const borderRadius = card ? window.getComputedStyle(card).borderRadius : null;
    const overlay = document.querySelector('[data-testid="handoff-light-overlay"]');
    const overlayOpacity = overlay ? parseFloat(window.getComputedStyle(overlay).opacity) : null;
    return {
      width: rect ? Math.round(rect.width) : 0,
      height: rect ? Math.round(rect.height) : 0,
      borderRadius,
      overlayOpacity,
      viewportW: window.innerWidth,
      viewportH: window.innerHeight,
    };
  });
  assert('Card covers full viewport during hold beat (width == 1440, height == 900)', handoffHold.width >= 1440 && handoffHold.height >= 900, handoffHold);
  assert('Card border radius is 0px at full expansion', handoffHold.borderRadius === '0px' || parseFloat(handoffHold.borderRadius) === 0, handoffHold);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'capabilities-02-handoff-fullscreen-hold.png'),
    fullPage: false,
  });

  // Step 2.4: Cross-dissolve into Capabilities light canvas (p ~ 0.95)
  await page.evaluate((pos) => window.scrollTo(0, pos), handoffTrigger.start + dist * 0.95);
  await page.waitForTimeout(400);

  const handoffDissolve = await page.evaluate(() => {
    const overlay = document.querySelector('[data-testid="handoff-light-overlay"]');
    const overlayOpacity = overlay ? parseFloat(window.getComputedStyle(overlay).opacity) : null;
    return { overlayOpacity };
  });
  assert('Light overlay dissolves into white canvas (opacity > 0.85)', handoffDissolve.overlayOpacity > 0.85, handoffDissolve);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'capabilities-03-handoff-dissolve.png'),
    fullPage: false,
  });

  // -------------------------------------------------------------------------
  // PART 3: CAPABILITIES SECTION AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- PART 3: Verifying Capabilities Section ---');

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
    const overline = document.querySelector('[data-testid="capabilities-overline"]')?.textContent?.trim();
    const heading = document.querySelector('[data-testid="capabilities-heading"]')?.textContent?.trim();
    const statement = document.querySelector('[data-testid="capabilities-supporting-statement"]')?.textContent?.trim();
    const edgeLeft = document.querySelector('[data-testid="capabilities-edge-fade-left"]');
    const edgeRight = document.querySelector('[data-testid="capabilities-edge-fade-right"]');
    const bg = sec ? window.getComputedStyle(sec).backgroundColor : null;

    // Strict check: NO CTA INSIDE CAPABILITIES
    const ctaLinks = sec ? sec.querySelectorAll('a[href*="mailto"], a[href*="contact"], button:not([role="tab"])') : [];

    return {
      overline,
      heading,
      statement,
      hasEdgeLeft: !!edgeLeft,
      hasEdgeRight: !!edgeRight,
      bg,
      ctaCount: ctaLinks.length,
    };
  });

  assert('Overline is "WHAT WE BUILD"', capHeaderData.overline === 'WHAT WE BUILD', capHeaderData);
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
  // PART 4: STUDIO FOOTER AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- PART 4: Verifying Studio Footer ---');
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
  // PART 5: REVERSIBLE SCROLL AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- PART 5: Verifying Reversible Scroll Upward to Hero ---');
  // Scroll back to top in smooth steps
  for (let y = window_scrollY = await page.evaluate(() => window.scrollY); y >= 0; y -= 1500) {
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
  // PART 6: RESPONSIVE MATRIX AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- PART 6: Responsive Matrix Audit ---');
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
  // PART 7: PREFERS-REDUCED-MOTION AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- PART 7: Reduced Motion Audit ---');
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
  console.log('\n===============================================================');
  console.log(`TOTAL PASSED: ${report.testsPassed}`);
  console.log(`TOTAL FAILED: ${report.testsFailed}`);
  console.log(`CONSOLE ERRORS: ${report.consoleErrors.length}`);
  console.log(`PAGE ERRORS: ${report.pageErrors.length}`);
  console.log('===============================================================\n');

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
