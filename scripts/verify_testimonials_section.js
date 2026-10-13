const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.OSTRUM_BASE_URL || 'http://localhost:3000';
const ARTIFACTS_DIR = path.join(__dirname, '..', 'rebuild-capture', 'audit', 'testimonials');
fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

const VIEWPORTS = [
  { name: 'desktop-large', width: 1920, height: 1080 },
  { name: 'desktop-standard', width: 1440, height: 900 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'mobile', width: 390, height: 844 },
];

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-gpu', '--enable-gpu-benchmarking', '--enable-threaded-compositing'],
  });

  const allAssertions = [];
  const errors = [];
  const networkErrors = [];

  const assert = (name, condition, details = {}) => {
    allAssertions.push({ name, passed: Boolean(condition), details });
    console.log(`${condition ? 'PASS' : 'FAIL'} ${name}`, details);
  };

  // Test Primary Viewport (1440x900) for complete scroll choreography
  console.log('\n--- 1. Testing Full Scroll Choreography on Desktop (1440x900) ---');
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });
  page.on('requestfailed', (req) => {
    networkErrors.push(`${req.url()}: ${req.failure()?.errorText ?? 'failed'}`);
  });

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Assertion 1: Placement & Hierarchy
  const sectionInfo = await page.evaluate(() => {
    const caps = document.querySelector('#capabilities');
    const test = document.querySelector('#testimonials');
    if (!caps || !test) return null;
    return {
      capsIndex: Array.from(document.querySelectorAll('section')).indexOf(caps),
      testIndex: Array.from(document.querySelectorAll('section')).indexOf(test),
      testId: test.getAttribute('data-testid'),
      instances: document.querySelectorAll('#testimonials').length,
    };
  });

  assert(
    'Testimonials section exists and follows Capabilities section',
    sectionInfo && sectionInfo.testIndex > sectionInfo.capsIndex,
    sectionInfo,
  );
  assert('Exactly one Testimonials section instance exists', sectionInfo?.instances === 1, sectionInfo);

  // Assertion 2: Heading Typography & Bounding Box
  const headingInfo = await page.evaluate(() => {
    const heading = document.querySelector('[data-testid="testimonials-heading"]');
    if (!heading) return null;
    const rect = heading.getBoundingClientRect();
    const style = getComputedStyle(heading);
    return {
      text: heading.textContent.trim(),
      width: rect.width,
      viewportWidth: window.innerWidth,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      color: style.color,
      ratio: rect.width / window.innerWidth,
    };
  });

  assert(
    'Monumental TESTIMONIALS heading has correct text and spans canvas width',
    headingInfo &&
      headingInfo.text === 'TESTIMONIALS' &&
      headingInfo.ratio >= 0.75,
    headingInfo,
  );

  // Assertion 3: Card Stack Setup & Data Integrity
  const cardsData = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[data-card-index]'));
    return cards.map((c) => ({
      index: Number(c.getAttribute('data-card-index')),
      client: c.getAttribute('data-client'),
      placeholder: c.getAttribute('data-placeholder'),
      approved: c.getAttribute('data-approved'),
      opacity: Number(getComputedStyle(c).opacity),
      transform: getComputedStyle(c).transform,
      rect: c.getBoundingClientRect(),
    }));
  });

  assert('Exactly 6 testimonial cards are present in stack', cardsData.length === 6, {
    count: cardsData.length,
  });
  assert(
    'First card is TMR AI Car Care',
    cardsData[0]?.client === 'TMR AI Car Care',
    cardsData[0],
  );
  assert(
    'Second card is Saraswati Driving School',
    cardsData[1]?.client === 'Saraswati Driving School',
    cardsData[1],
  );
  assert(
    'All sample cards are flagged with isPlaceholder=true and approved=false',
    cardsData.every((c) => c.placeholder === 'true' && c.approved === 'false'),
    cardsData.map((c) => ({ client: c.client, placeholder: c.placeholder, approved: c.approved })),
  );

  // Measure Scroll Ranges
  const scrollMetrics = await page.evaluate(() => {
    const section = document.querySelector('#testimonials');
    const rect = section.getBoundingClientRect();
    const start = rect.top + window.scrollY;
    const distance = section.offsetHeight - window.innerHeight;
    return { start, distance, height: section.offsetHeight, innerHeight: window.innerHeight };
  });
  console.log('Testimonials scroll metrics:', scrollMetrics);

  const scrollToProgress = async (progress) => {
    const targetY = scrollMetrics.start + scrollMetrics.distance * progress;
    await page.evaluate((y) => {
      if (window.lenis) {
        window.lenis.scrollTo(y, { immediate: true });
      } else {
        window.scrollTo(0, y);
      }
    }, targetY);
    await page.waitForTimeout(400);
  };

  // State 1: Progress 0.0 — Initial State, Card 0 (TMR) foreground
  await scrollToProgress(0.01);
  const state0 = await page.evaluate(() => {
    const c0 = document.querySelector('[data-testid="testimonial-card-0"]');
    const c1 = document.querySelector('[data-testid="testimonial-card-1"]');
    return {
      c0Opacity: Number(getComputedStyle(c0).opacity),
      c1Opacity: Number(getComputedStyle(c1).opacity),
      c0Transform: getComputedStyle(c0).transform,
      c1Transform: getComputedStyle(c1).transform,
    };
  });
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, '01-testimonials-initial-card-0-tmr.png'),
    fullPage: false,
  });
  assert('State 0: TMR AI Car Care card is active in foreground', state0.c0Opacity >= 0.95, state0);

  // State 2: Progress 0.16 — Card 0 exited, Card 1 (Saraswati) settled in foreground
  await scrollToProgress(0.16);
  const state1 = await page.evaluate(() => {
    const c0 = document.querySelector('[data-testid="testimonial-card-0"]');
    const c1 = document.querySelector('[data-testid="testimonial-card-1"]');
    const rect0 = c0.getBoundingClientRect();
    const rect1 = c1.getBoundingClientRect();
    return {
      c0Y: rect0.top,
      c1Y: rect1.top,
      c0Opacity: Number(getComputedStyle(c0).opacity),
      c1Opacity: Number(getComputedStyle(c1).opacity),
    };
  });
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, '02-testimonials-card-1-saraswati.png'),
    fullPage: false,
  });
  assert(
    'State 1: Card 0 has moved upward and Card 1 is settling in foreground',
    state1.c0Y < state1.c1Y && state1.c1Opacity >= 0.95,
    state1,
  );

  // State 3: Progress 0.50 — Midpoint transition with intermediate cards
  await scrollToProgress(0.5);
  const stateMid = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[data-card-index]')).map((c) => ({
      index: c.getAttribute('data-card-index'),
      top: c.getBoundingClientRect().top,
      opacity: Number(getComputedStyle(c).opacity),
    }));
    return cards;
  });
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, '03-testimonials-card-transition-midpoint.png'),
    fullPage: false,
  });
  assert(
    'State 2: Middle cards cycle smoothly through stack at midpoint',
    stateMid[0].opacity === 0 && stateMid[1].opacity === 0,
    stateMid,
  );

  // State 4: Progress 0.86 — Last card exiting stack
  await scrollToProgress(0.86);
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, '04-testimonials-last-card-exit.png'),
    fullPage: false,
  });

  // State 5: Progress 0.98 — Resolved state: All cards exited, TESTIMONIALS unobstructed, button prominent
  await scrollToProgress(0.98);
  const resolvedState = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[data-card-index]'));
    const allExited = cards.every((c) => {
      const op = Number(getComputedStyle(c).opacity);
      const top = c.getBoundingClientRect().top;
      return op === 0 || top < -100;
    });
    const heading = document.querySelector('[data-testid="testimonials-heading"]');
    const button = document.querySelector('[data-testid="testimonials-cta-button"]');
    const buttonRect = button ? button.getBoundingClientRect() : null;
    return {
      allExited,
      headingVisible: heading && getComputedStyle(heading).visibility !== 'hidden',
      buttonVisible: button && getComputedStyle(button).opacity >= 0.8,
      buttonHref: button?.getAttribute('href'),
      buttonText: button?.textContent?.trim(),
      buttonRect,
    };
  });
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, '05-testimonials-resolved-unobstructed-heading.png'),
    fullPage: false,
  });
  assert(
    'State 3: All cards exit cleanly leaving TESTIMONIALS heading completely unobstructed',
    resolvedState.allExited,
    resolvedState,
  );
  assert(
    'State 4: Outlined pill button is visible and links to #contact',
    resolvedState.buttonVisible && resolvedState.buttonHref === '#contact',
    resolvedState,
  );

  // State 6: Reverse scroll check — scroll back to 0.01 and verify restoration
  await scrollToProgress(0.01);
  const restoredState = await page.evaluate(() => {
    const c0 = document.querySelector('[data-testid="testimonial-card-0"]');
    return {
      c0Opacity: Number(getComputedStyle(c0).opacity),
      c0Rect: c0.getBoundingClientRect(),
    };
  });
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, '06-testimonials-reverse-restoration.png'),
    fullPage: false,
  });
  assert(
    'State 5: Reverse scrolling flawlessly restores Card 0 to active foreground position',
    restoredState.c0Opacity >= 0.95,
    restoredState,
  );

  await page.close();

  // Test across responsive viewport matrix
  console.log('\n--- 2. Testing Multi-Viewport Matrix ---');
  for (const vp of VIEWPORTS) {
    const vpPage = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await vpPage.goto(BASE_URL, { waitUntil: 'networkidle' });
    // Ensure ScrollTrigger layout is fully initialized, then scroll to testimonials
    await vpPage.evaluate(() => {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
    await vpPage.waitForTimeout(400);

    const secTop = await vpPage.evaluate(() => {
      const s = document.querySelector('#testimonials');
      return s ? s.getBoundingClientRect().top + window.scrollY : 0;
    });

    await vpPage.evaluate((y) => {
      if (window.lenis) {
        window.lenis.scrollTo(y, { immediate: true });
      } else {
        window.scrollTo(0, y);
      }
    }, secTop);
    await vpPage.waitForTimeout(600);

    const vpMetrics = await vpPage.evaluate(() => {
      const section = document.querySelector('#testimonials');
      const heading = document.querySelector('[data-testid="testimonials-heading"]');
      const card = document.querySelector('[data-testid="testimonial-card-0"]');
      const button = document.querySelector('[data-testid="testimonials-cta-button"]');
      if (!section || !heading || !card) return null;

      const hRect = heading.getBoundingClientRect();
      const cRect = card.getBoundingClientRect();
      const bRect = button?.getBoundingClientRect();

      return {
        sectionHeight: section.offsetHeight,
        headingWidth: hRect.width,
        headingHeight: hRect.height,
        cardWidth: cRect.width,
        cardHeight: cRect.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        overflowsX: hRect.width > window.innerWidth + 10,
        cardFits: cRect.width <= window.innerWidth,
      };
    });

    await vpPage.screenshot({
      path: path.join(ARTIFACTS_DIR, `viewport-${vp.name}-${vp.width}x${vp.height}.png`),
      fullPage: false,
    });

    assert(
      `Viewport ${vp.name} (${vp.width}x${vp.height}): heading fits without horizontal document overflow`,
      vpMetrics && !vpMetrics.overflowsX,
      vpMetrics,
    );
    assert(
      `Viewport ${vp.name} (${vp.width}x${vp.height}): card fits cleanly inside viewport`,
      vpMetrics && vpMetrics.cardFits,
      vpMetrics,
    );

    await vpPage.close();
  }

  // Reduced motion test
  console.log('\n--- 3. Testing Reduced-Motion Mode ---');
  const rmPage = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await rmPage.emulateMedia({ reducedMotion: 'reduce' });
  await rmPage.goto(BASE_URL, { waitUntil: 'networkidle' });
  await rmPage.waitForSelector('#testimonials', { timeout: 10000 });
  await rmPage.waitForSelector('[data-testid="testimonial-card-0"]', { timeout: 10000 });
  await rmPage.evaluate(() => {
    const s = document.querySelector('#testimonials');
    if (s) s.scrollIntoView({ behavior: 'instant' });
  });
  await rmPage.waitForTimeout(600);

  const rmState = await rmPage.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[data-card-index]'));
    return {
      count: cards.length,
      allAccessible: cards.every((c) => c.textContent.length > 20),
    };
  });
  await rmPage.screenshot({
    path: path.join(ARTIFACTS_DIR, 'reduced-motion-layout.png'),
    fullPage: false,
  });
  assert('Reduced-motion mode renders all testimonials accessibly', rmState.allAccessible, rmState);
  await rmPage.close();

  // Zero error checks
  assert('Zero console/runtime errors during Testimonials interaction', errors.length === 0, errors);
  assert('Zero failed network requests', networkErrors.length === 0, networkErrors);

  await browser.close();

  const failures = allAssertions.filter((a) => !a.passed);
  console.log(`\n========================================`);
  console.log(`Testimonials Suite: ${allAssertions.length - failures.length}/${allAssertions.length} assertions passed.`);
  if (failures.length > 0) {
    console.error(`FAILED assertions (${failures.length}):`, failures);
    process.exitCode = 1;
  } else {
    console.log('ALL ASSERTIONS PASSED SUCCESSFULLY!');
  }
}

run().catch((err) => {
  console.error('Test execution error:', err);
  process.exitCode = 1;
});
