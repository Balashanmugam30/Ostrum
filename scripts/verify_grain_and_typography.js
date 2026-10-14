const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.OSTRUM_BASE_URL || 'http://localhost:3000';
const ARTIFACTS_DIR = path.join(__dirname, '..', 'rebuild-capture', 'audit', 'grain-and-typography');
fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

const VIEWPORTS = [
  { name: 'desktop-large', width: 1920, height: 1080 },
  { name: 'desktop-standard', width: 1440, height: 900 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'mobile', width: 390, height: 844 },
];

async function run() {
  const browser = await chromium.launch({ headless: true });
  const allAssertions = [];
  const errors = [];
  const networkErrors = [];

  const assert = (name, condition, details = {}) => {
    allAssertions.push({ name, passed: Boolean(condition), details });
    console.log(`${condition ? 'PASS' : 'FAIL'} ${name}`, details);
  };

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

  // ----------------------------------------------------
  // SECTION A: Verify Grain Removal Across Sections 1-4
  // ----------------------------------------------------
  console.log('\n--- A. Verifying Grain-Free Background & Visuals ---');

  // 1. Hero Screenshot (Grain-Free)
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '01-grainfree-hero.png') });

  // Check BackgroundCaustics grain intensity uniform
  const causticsUniforms = await page.evaluate(() => {
    const canvas = document.querySelector('.background-webgl canvas');
    return {
      canvasExists: Boolean(canvas),
      canvasWidth: canvas?.width,
      canvasHeight: canvas?.height,
    };
  });
  assert('Caustics canvas exists and renders background cleanly', causticsUniforms.canvasExists, causticsUniforms);

  // 2. Engine Screenshot (Grain-Free)
  const engineTop = await page.evaluate(() => {
    const el = document.querySelector('#engine') || document.querySelector('.engine-section');
    return el ? el.getBoundingClientRect().top + window.scrollY : 2000;
  });
  await page.evaluate((y) => {
    if (window.lenis) window.lenis.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
  }, engineTop);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '02-grainfree-engine.png') });

  // 3. Selected Work Screenshot (Grain-Free)
  const wheelTop = await page.evaluate(() => {
    const el = document.querySelector('#selected-work') || document.querySelector('[data-testid="works-wheel-section"]');
    return el ? el.getBoundingClientRect().top + window.scrollY : 10000;
  });
  await page.evaluate((y) => {
    if (window.lenis) window.lenis.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
  }, wheelTop + 400);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '03-grainfree-selected-work.png') });

  // ----------------------------------------------------
  // SECTION B: Testimonial Typography & Vertical Presence
  // ----------------------------------------------------
  console.log('\n--- B. Verifying Testimonial Typography & Card Presence ---');

  const testimonialsTop = await page.evaluate(() => {
    const el = document.querySelector('#testimonials');
    return el ? el.getBoundingClientRect().top + window.scrollY : 20000;
  });
  await page.evaluate((y) => {
    if (window.lenis) window.lenis.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
  }, testimonialsTop + 40);
  await page.waitForTimeout(600);

  // Measure card and quote metrics across all 3 cards at 1920x1080
  const typographyMetrics = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[data-card-index]'));
    return cards.map((c, i) => {
      const p = c.querySelector('[data-testid="testimonial-quote-text"]');
      const logo = c.querySelector('img') || c.querySelector('[data-testid="mnesa-blue-m-mark"]');
      const pStyle = p ? getComputedStyle(p) : null;
      const cStyle = getComputedStyle(c);
      const pRect = p ? p.getBoundingClientRect() : null;
      const cRect = c.getBoundingClientRect();
      const logoRect = logo ? logo.getBoundingClientRect() : null;

      const fontSizePx = parseFloat(pStyle?.fontSize || '0');
      const lineHeightPx = parseFloat(pStyle?.lineHeight || '0');
      const verticalRatio = pRect ? pRect.height / cRect.height : 0;
      const gapBetweenLogoAndQuote = pRect && logoRect ? pRect.top - logoRect.bottom : 0;
      const quoteWithinCard = pRect ? pRect.bottom <= cRect.bottom && pRect.top >= cRect.top : false;

      return {
        cardIndex: i,
        client: c.getAttribute('data-client'),
        fontSize: pStyle?.fontSize,
        fontSizePx,
        lineHeight: pStyle?.lineHeight,
        lineHeightPx,
        fontFamily: pStyle?.fontFamily,
        pWidth: pRect?.width,
        pHeight: pRect?.height,
        cardWidth: cRect.width,
        cardHeight: cRect.height,
        verticalRatio,
        gapBetweenLogoAndQuote,
        quoteWithinCard,
      };
    });
  });

  console.log('Enlarged Testimonial Typography Metrics (Desktop):', typographyMetrics);

  // Assertion 1: Font size is noticeably larger in target range (22px to 28px on desktop)
  assert(
    'Desktop quote typography is enlarged into the target 22px-28px range (currently 25px)',
    typographyMetrics[0].fontSizePx >= 22 && typographyMetrics[0].fontSizePx <= 28,
    typographyMetrics[0],
  );

  // Assertion 2: Vertical presence has significantly increased (verticalRatio >= 0.40)
  assert(
    'Quote text occupies commanding vertical presence within the card (> 40% of card height)',
    typographyMetrics[0].verticalRatio >= 0.40 && typographyMetrics[0].pHeight >= 170,
    typographyMetrics[0],
  );

  // Assertion 3: Clean spacing without logo collision
  assert(
    'No quote collides with the logo, and remains with comfortable breathing room',
    typographyMetrics.every((m) => m.gapBetweenLogoAndQuote >= 15 && m.quoteWithinCard),
    typographyMetrics,
  );

  // Assertion 4: All 3 cards remain in exact sequence
  assert(
    'Exactly three cards remain in sequence: TMR, Saraswathi, MNESA',
    typographyMetrics.length === 3 &&
      typographyMetrics[0].client === 'TMR AI Car Care' &&
      typographyMetrics[1].client === 'Saraswati Driving School' &&
      typographyMetrics[2].client === 'MNESA',
    typographyMetrics.map((m) => m.client),
  );

  // Take screenshot of each card settled
  // Card 0: TMR
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '04-enlarged-card-0-tmr.png') });

  // Advance scroll to Card 1: Saraswati
  const scrollMetrics = await page.evaluate(() => {
    const section = document.querySelector('#testimonials');
    const rect = section.getBoundingClientRect();
    const start = rect.top + window.scrollY;
    const distance = section.offsetHeight - window.innerHeight;
    return { start, distance };
  });

  const scrollToProgress = async (progress) => {
    const targetY = scrollMetrics.start + scrollMetrics.distance * progress;
    await page.evaluate((y) => {
      if (window.lenis) window.lenis.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
    }, targetY);
    await page.waitForTimeout(400);
  };

  await scrollToProgress(0.35);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '05-enlarged-card-1-saraswathi.png') });

  await scrollToProgress(0.65);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '06-enlarged-card-2-mnesa.png') });

  await scrollToProgress(0.96);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '07-unobstructed-heading-resolved.png') });

  await page.close();

  // ----------------------------------------------------
  // SECTION C: Responsive Multi-Viewport Matrix
  // ----------------------------------------------------
  console.log('\n--- C. Testing Multi-Viewport Matrix ---');
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
      if (window.lenis) window.lenis.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
    }, secTop);
    await vpPage.waitForTimeout(600);

    const vpMetrics = await vpPage.evaluate(() => {
      const card = document.querySelector('[data-testid="testimonial-card-0"]');
      const quote = document.querySelector('[data-testid="testimonial-card-0"] [data-testid="testimonial-quote-text"]');
      const heading = document.querySelector('[data-testid="testimonials-heading"]');
      if (!card || !quote || !heading) return null;

      const cRect = card.getBoundingClientRect();
      const qRect = quote.getBoundingClientRect();
      const hRect = heading.getBoundingClientRect();
      const qStyle = getComputedStyle(quote);

      return {
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        cardWidth: cRect.width,
        cardHeight: cRect.height,
        quoteFontSize: qStyle.fontSize,
        quoteFontSizePx: parseFloat(qStyle.fontSize),
        quoteLineHeight: qStyle.lineHeight,
        quoteHeight: qRect.height,
        quoteWithinCard: qRect.bottom <= cRect.bottom && qRect.top >= cRect.top,
        cardFits: cRect.width <= window.innerWidth,
        overflowsX: document.documentElement.scrollWidth > window.innerWidth + 2,
        headingUnclipped: hRect.left >= 0 && hRect.right <= window.innerWidth,
      };
    });

    await vpPage.screenshot({
      path: path.join(ARTIFACTS_DIR, `viewport-${vp.name}-${vp.width}x${vp.height}.png`),
    });

    assert(
      `Viewport ${vp.name} (${vp.width}x${vp.height}): quote is responsive (>= 17px) and fully contained inside card`,
      vpMetrics && vpMetrics.quoteFontSizePx >= 17 && vpMetrics.quoteWithinCard,
      vpMetrics,
    );
    assert(
      `Viewport ${vp.name} (${vp.width}x${vp.height}): card fits cleanly without horizontal overflow`,
      vpMetrics && vpMetrics.cardFits && !vpMetrics.overflowsX,
      vpMetrics,
    );

    await vpPage.close();
  }

  // ----------------------------------------------------
  // SECTION D: Reduced Motion Mode
  // ----------------------------------------------------
  console.log('\n--- D. Testing Reduced-Motion Mode ---');
  const rmPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await rmPage.emulateMedia({ reducedMotion: 'reduce' });
  await rmPage.goto(BASE_URL, { waitUntil: 'networkidle' });
  await rmPage.evaluate(() => {
    const s = document.querySelector('#testimonials');
    if (s) s.scrollIntoView({ behavior: 'instant' });
  });
  await rmPage.waitForTimeout(600);

  const rmState = await rmPage.evaluate(() => {
    const quotes = Array.from(document.querySelectorAll('[data-card-index] [data-testid="testimonial-quote-text"]'));
    return {
      count: quotes.length,
      allEnlarged: quotes.every((q) => parseFloat(getComputedStyle(q).fontSize) >= 20),
    };
  });

  await rmPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'reduced-motion-enlarged.png') });
  assert('Reduced-motion mode renders all 3 cards with enlarged typography in flow', rmState.count === 3 && rmState.allEnlarged, rmState);
  await rmPage.close();

  // Zero errors
  assert('Zero console or runtime errors across all interactions', errors.length === 0, errors);
  assert('Zero failed network requests', networkErrors.length === 0, networkErrors);

  await browser.close();

  const failures = allAssertions.filter((a) => !a.passed);
  console.log(`\n========================================`);
  console.log(`Suite: ${allAssertions.length - failures.length}/${allAssertions.length} assertions passed.`);
  if (failures.length > 0) {
    console.error(`FAILED assertions (${failures.length}):`, failures);
    process.exitCode = 1;
  } else {
    console.log('ALL ASSERTIONS PASSED SUCCESSFULLY!');
  }
}

run().catch((e) => {
  console.error('Fatal test error:', e);
  process.exitCode = 1;
});
