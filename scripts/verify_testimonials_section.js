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
  });

  const allAssertions = [];
  const errors = [];
  const networkErrors = [];

  const assert = (name, condition, details = {}) => {
    allAssertions.push({ name, passed: Boolean(condition), details });
    console.log(`${condition ? 'PASS' : 'FAIL'} ${name}`, details);
  };

  // 1. Primary Viewport Calibration (1920x1080) matching Ignite Reference
  console.log('\n--- 1. Testing Ignite Visual Calibration on Desktop (1920x1080) ---');
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });
  page.on('requestfailed', (req) => {
    networkErrors.push(`${req.url()}: ${req.failure()?.errorText ?? 'failed'}`);
  });

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);

  // Assertion 1: Hierarchy and Placement
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

  // Assertion 2: Heading Typography, Font, Proportions, and Unclipped Bounds
  const headingInfo = await page.evaluate(() => {
    const heading = document.querySelector('[data-testid="testimonials-heading"]');
    if (!heading) return null;
    const rect = heading.getBoundingClientRect();
    const style = getComputedStyle(heading);
    return {
      text: heading.textContent.trim(),
      left: rect.left,
      right: rect.right,
      width: rect.width,
      height: rect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      fontSize: style.fontSize,
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight,
      color: style.color,
      ratio: rect.width / window.innerWidth,
      isFullyInsideViewport: rect.left >= 0 && rect.right <= window.innerWidth,
    };
  });

  assert(
    'Monumental TESTIMONIALS heading uses condensed font family',
    headingInfo &&
      (headingInfo.fontFamily.toLowerCase().includes('oswald') ||
        headingInfo.fontFamily.toLowerCase().includes('barlow') ||
        headingInfo.fontFamily.toLowerCase().includes('impact')),
    headingInfo,
  );
  assert(
    'TESTIMONIALS heading text is exact and spans prominent viewport width ratio (>= 0.75 and <= 0.95 at 1920px)',
    headingInfo && headingInfo.text === 'TESTIMONIALS' && headingInfo.ratio >= 0.75 && headingInfo.ratio <= 0.95,
    headingInfo,
  );
  assert(
    'TESTIMONIALS heading first "T" and last "S" are completely unclipped with generous margins',
    headingInfo && headingInfo.isFullyInsideViewport && headingInfo.left >= 10 && headingInfo.right <= 1910,
    headingInfo,
  );

  // Assertion 3: Exactly Three Cards in Sequence
  const cardsInfo = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[data-card-index]'));
    return cards.map((c, idx) => {
      const text = c.textContent || '';
      const img = c.querySelector('img');
      const mMark = c.querySelector('[data-testid="mnesa-blue-m-mark"]');
      const style = getComputedStyle(c);
      return {
        idx,
        client: c.getAttribute('data-client'),
        placeholder: c.getAttribute('data-placeholder'),
        approved: c.getAttribute('data-approved'),
        hasImg: Boolean(img),
        imgSrc: img ? img.getAttribute('src') : null,
        hasBlueMMark: Boolean(mMark),
        backgroundColor: style.backgroundColor,
        borderRadius: style.borderRadius,
        textSnippet: text.slice(0, 80),
      };
    });
  });

  assert('Sequence contains strictly three cards', cardsInfo.length === 3, { count: cardsInfo.length });
  assert(
    'Card 01 is TMR AI Car Care with authentic logo and pending approval status',
    cardsInfo[0] &&
      cardsInfo[0].client === 'TMR AI Car Care' &&
      cardsInfo[0].hasImg &&
      decodeURIComponent(cardsInfo[0].imgSrc || '').includes('tmr-ai-car-care-logo-light') &&
      cardsInfo[0].approved === 'false',
    cardsInfo[0],
  );
  assert(
    'Card 02 is Saraswati Driving School with authentic logo and pending approval status',
    cardsInfo[1] &&
      cardsInfo[1].client === 'Saraswati Driving School' &&
      cardsInfo[1].hasImg &&
      decodeURIComponent(cardsInfo[1].imgSrc || '').includes('saraswati-driving-school-logo-dark') &&
      cardsInfo[1].approved === 'false',
    cardsInfo[1],
  );
  assert(
    'Card 03 is MNESA internal architecture note with custom blue M mark and approved status',
    cardsInfo[2] &&
      cardsInfo[2].client === 'MNESA' &&
      cardsInfo[2].hasBlueMMark &&
      cardsInfo[2].approved === 'true',
    cardsInfo[2],
  );

  // Measure Scroll Ranges
  const scrollMetrics = await page.evaluate(() => {
    const section = document.querySelector('#testimonials');
    const rect = section.getBoundingClientRect();
    const start = rect.top + window.scrollY;
    const distance = section.offsetHeight - window.innerHeight;
    return { start, distance, height: section.offsetHeight, innerHeight: window.innerHeight };
  });
  console.log('Testimonials scroll metrics at 1920x1080:', scrollMetrics);

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

  const takeScreenshot = async (p, filePath) => {
    try {
      await p.screenshot({ path: filePath });
    } catch (e) {
      console.warn(`Screenshot warning for ${filePath}: ${e.message}`);
    }
  };

  // State 1: Progress 0.02 — Initial state, Card 0 (TMR) active in foreground
  await scrollToProgress(0.02);
  const state0 = await page.evaluate(() => {
    const c0 = document.querySelector('[data-testid="testimonial-card-0"]');
    const c1 = document.querySelector('[data-testid="testimonial-card-1"]');
    const c2 = document.querySelector('[data-testid="testimonial-card-2"]');
    return {
      c0Opacity: Number(getComputedStyle(c0).opacity),
      c0ZIndex: Number(getComputedStyle(c0).zIndex),
      c1ZIndex: Number(getComputedStyle(c1).zIndex),
      c2ZIndex: Number(getComputedStyle(c2).zIndex),
    };
  });
  await takeScreenshot(page, path.join(ARTIFACTS_DIR, '01-initial-composition-tmr.png'));
  assert(
    'State 1: Initial composition has TMR card active with highest initial stack zIndex',
    state0.c0Opacity >= 0.95 && state0.c0ZIndex > state0.c1ZIndex && state0.c1ZIndex > state0.c2ZIndex,
    state0,
  );

  // State 2: Progress 0.14 — Card 0 (TMR) translating upward IN FRONT of Card 1
  await scrollToProgress(0.14);
  const stateExit0 = await page.evaluate(() => {
    const c0 = document.querySelector('[data-testid="testimonial-card-0"]');
    const c1 = document.querySelector('[data-testid="testimonial-card-1"]');
    const rect0 = c0.getBoundingClientRect();
    const rect1 = c1.getBoundingClientRect();
    const z0 = Number(getComputedStyle(c0).zIndex);
    const z1 = Number(getComputedStyle(c1).zIndex);
    const op0 = Number(getComputedStyle(c0).opacity);
    return {
      c0Top: rect0.top,
      c1Top: rect1.top,
      z0,
      z1,
      op0,
      isCard0AboveCard1InZIndex: z0 > z1,
      isCard0MovingUpward: rect0.top < rect1.top,
    };
  });
  await takeScreenshot(page, path.join(ARTIFACTS_DIR, '02-tmr-card-moving-upward-in-front.png'));
  assert(
    'State 2: Card 0 moves upward IN FRONT of Card 1 (z-index 40 > z-index 20, never slips behind)',
    stateExit0.isCard0AboveCard1InZIndex && stateExit0.isCard0MovingUpward && stateExit0.op0 > 0.4,
    stateExit0,
  );

  // State 3: Progress 0.22 — Midpoint transition between TMR and Saraswati
  await scrollToProgress(0.22);
  await takeScreenshot(page, path.join(ARTIFACTS_DIR, '03-transition-midpoint-tmr-saraswathi.png'));

  // State 4: Progress 0.35 — Card 1 (Saraswati) active and settled in foreground
  await scrollToProgress(0.35);
  const state1 = await page.evaluate(() => {
    const c0 = document.querySelector('[data-testid="testimonial-card-0"]');
    const c1 = document.querySelector('[data-testid="testimonial-card-1"]');
    const c2 = document.querySelector('[data-testid="testimonial-card-2"]');
    return {
      c0Opacity: Number(getComputedStyle(c0).opacity),
      c1Opacity: Number(getComputedStyle(c1).opacity),
      c1ZIndex: Number(getComputedStyle(c1).zIndex),
      c2ZIndex: Number(getComputedStyle(c2).zIndex),
    };
  });
  await takeScreenshot(page, path.join(ARTIFACTS_DIR, '04-saraswathi-active-foreground.png'));
  assert(
    'State 4: Card 1 (Saraswati) settled in foreground with top z-index',
    state1.c0Opacity === 0 && state1.c1Opacity >= 0.95 && state1.c1ZIndex > state1.c2ZIndex,
    state1,
  );

  // State 5: Progress 0.46 — Card 1 (Saraswati) translating upward IN FRONT of Card 2 (MNESA)
  await scrollToProgress(0.46);
  const stateExit1 = await page.evaluate(() => {
    const c1 = document.querySelector('[data-testid="testimonial-card-1"]');
    const c2 = document.querySelector('[data-testid="testimonial-card-2"]');
    const rect1 = c1.getBoundingClientRect();
    const rect2 = c2.getBoundingClientRect();
    const z1 = Number(getComputedStyle(c1).zIndex);
    const z2 = Number(getComputedStyle(c2).zIndex);
    return {
      c1Top: rect1.top,
      c2Top: rect2.top,
      z1,
      z2,
      isCard1AboveCard2InZIndex: z1 > z2,
      isCard1MovingUpward: rect1.top < rect2.top,
    };
  });
  await takeScreenshot(page, path.join(ARTIFACTS_DIR, '05-saraswathi-moving-upward-in-front.png'));
  assert(
    'State 5: Card 1 moves upward IN FRONT of Card 2 (z-index 40 > z-index 10, never slips behind)',
    stateExit1.isCard1AboveCard2InZIndex && stateExit1.isCard1MovingUpward,
    stateExit1,
  );

  // State 6: Progress 0.54 — Midpoint transition between Saraswati and MNESA
  await scrollToProgress(0.54);
  await takeScreenshot(page, path.join(ARTIFACTS_DIR, '06-transition-midpoint-saraswathi-mnesa.png'));

  // State 7: Progress 0.65 — Card 2 (MNESA) active in foreground with blue M mark
  await scrollToProgress(0.65);
  const state2 = await page.evaluate(() => {
    const c1 = document.querySelector('[data-testid="testimonial-card-1"]');
    const c2 = document.querySelector('[data-testid="testimonial-card-2"]');
    const mMark = c2.querySelector('[data-testid="mnesa-blue-m-mark"]');
    return {
      c1Opacity: Number(getComputedStyle(c1).opacity),
      c2Opacity: Number(getComputedStyle(c2).opacity),
      c2ZIndex: Number(getComputedStyle(c2).zIndex),
      hasBlueM: Boolean(mMark),
    };
  });
  await takeScreenshot(page, path.join(ARTIFACTS_DIR, '07-mnesa-active-with-blue-m.png'));
  assert(
    'State 7: Card 2 (MNESA) active in foreground with blue M mark',
    state2.c2Opacity >= 0.95 && state2.c2ZIndex === 30 && state2.hasBlueM,
    state2,
  );

  // State 8: Progress 0.78 — Card 2 (MNESA) leaving the stack
  await scrollToProgress(0.78);
  const stateExit2 = await page.evaluate(() => {
    const c2 = document.querySelector('[data-testid="testimonial-card-2"]');
    const rect2 = c2.getBoundingClientRect();
    return {
      c2Top: rect2.top,
      isLeaving: rect2.top < 100,
    };
  });
  await takeScreenshot(page, path.join(ARTIFACTS_DIR, '08-final-card-leaving-stack.png'));
  assert('State 8: Final card (MNESA) leaves the stack cleanly upward', stateExit2.isLeaving, stateExit2);

  // State 9: Progress 0.96 — Resolved state: All cards exited, TESTIMONIALS completely unobstructed
  await scrollToProgress(0.96);
  const resolvedState = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[data-card-index]'));
    const allExited = cards.every((c) => {
      const op = Number(getComputedStyle(c).opacity);
      const top = c.getBoundingClientRect().top;
      return op === 0 || top < -100;
    });
    const heading = document.querySelector('[data-testid="testimonials-heading"]');
    const button = document.querySelector('[data-testid="testimonials-cta-button"]');
    return {
      allExited,
      headingVisible: heading && getComputedStyle(heading).visibility !== 'hidden',
      buttonAbsent: button === null,
    };
  });
  await takeScreenshot(page, path.join(ARTIFACTS_DIR, '09-complete-unobstructed-testimonials-heading.png'));
  assert(
    'State 9: All cards exit cleanly leaving TESTIMONIALS heading completely unobstructed with NO button',
    resolvedState.allExited && resolvedState.headingVisible && resolvedState.buttonAbsent,
    resolvedState,
  );

  // State 10: Reverse scroll check — scroll back to 0.02 and verify flawless restoration
  await scrollToProgress(0.02);
  const restoredState = await page.evaluate(() => {
    const c0 = document.querySelector('[data-testid="testimonial-card-0"]');
    return {
      c0Opacity: Number(getComputedStyle(c0).opacity),
      c0ZIndex: Number(getComputedStyle(c0).zIndex),
    };
  });
  await takeScreenshot(page, path.join(ARTIFACTS_DIR, '10-reversed-restoration-to-tmr.png'));
  assert(
    'State 10: Reverse scrolling flawlessly restores Card 0 to active foreground position',
    restoredState.c0Opacity >= 0.95 && restoredState.c0ZIndex === 30,
    restoredState,
  );

  await page.close();

  // Test across responsive viewport matrix
  console.log('\n--- 2. Testing Multi-Viewport Matrix ---');
  for (const vp of VIEWPORTS) {
    const vpPage = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await vpPage.goto(BASE_URL, { waitUntil: 'networkidle' });
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
      if (!section || !heading || !card) return null;

      const hRect = heading.getBoundingClientRect();
      const cRect = card.getBoundingClientRect();

      return {
        sectionHeight: section.offsetHeight,
        headingWidth: hRect.width,
        headingHeight: hRect.height,
        headingLeft: hRect.left,
        headingRight: hRect.right,
        cardWidth: cRect.width,
        cardHeight: cRect.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        overflowsX: document.documentElement.scrollWidth > window.innerWidth + 2,
        headingUnclipped: hRect.left >= 0 && hRect.right <= window.innerWidth,
        cardFits: cRect.width <= window.innerWidth,
      };
    });

    try {
      await vpPage.screenshot({
        path: path.join(ARTIFACTS_DIR, `viewport-${vp.name}-${vp.width}x${vp.height}.png`),
      });
    } catch (e) {
      console.warn(`Viewport screenshot warning: ${e.message}`);
    }

    assert(
      `Viewport ${vp.name} (${vp.width}x${vp.height}): heading fits without horizontal document overflow`,
      vpMetrics && !vpMetrics.overflowsX,
      vpMetrics,
    );
    assert(
      `Viewport ${vp.name} (${vp.width}x${vp.height}): heading is completely unclipped inside viewport`,
      vpMetrics && vpMetrics.headingUnclipped,
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
  try {
    await rmPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'reduced-motion-layout.png'),
    });
  } catch (e) {
    console.warn(`Reduced-motion screenshot warning: ${e.message}`);
  }
  assert('Reduced-motion mode renders all 3 testimonials accessibly in document flow', rmState.count === 3 && rmState.allAccessible, rmState);
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
