const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.OSTRUM_BASE_URL || 'http://localhost:3000';
const ARTIFACTS_DIR = path.join(__dirname, '..', 'rebuild-capture', 'audit', 'capabilities-viewports');
const VIEWPORTS = [
  { name: 'desktop-1920x1080', width: 1920, height: 1080 },
  { name: 'laptop-1440x900', width: 1440, height: 900 },
  { name: 'tablet-1024x768', width: 1024, height: 768 },
  { name: 'mobile-390x844', width: 390, height: 844 },
];
fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-gpu', '--enable-gpu-benchmarking', '--enable-threaded-compositing'],
  });
  const assertions = [];
  const errors = [];
  const viewportResults = [];

  const assert = (name, condition, details = {}) => {
    assertions.push({ name, passed: Boolean(condition), details });
    console.log(`${condition ? 'PASS' : 'FAIL'} ${name}`, details);
  };

  for (const viewport of VIEWPORTS) {
    const page = await browser.newPage({ viewport });
    page.on('pageerror', (error) => errors.push(`${viewport.name}: pageerror: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`${viewport.name}: console: ${message.text()}`);
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForFunction(
      () => window.lenis && window.ScrollTrigger?.getById('works-wheel-pin'),
      null,
      { timeout: 30000 },
    );
    await page.waitForTimeout(250);

    const geometry = await page.evaluate(() => {
      const wheel = window.ScrollTrigger.getById('works-wheel-pin');
      const mobile = window.innerWidth < 768;
      const hold = mobile ? 250 : 350;
      const morph = mobile ? 700 : 1000;
      const projects = mobile ? 2100 : 2950;
      const total = hold + morph + projects + (mobile ? 1000 : 1650);
      return {
        wheelStart: wheel.start,
        wheelEnd: wheel.end,
        p2: (hold + morph) / total,
        p3: (hold + morph + projects) / total,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    });
    const toProgress = (p) => geometry.wheelStart + (geometry.wheelEnd - geometry.wheelStart) * p;

    const scroll = async (y) => {
      await page.evaluate((position) => window.lenis.scrollTo(position, { immediate: true }), y);
      await page.waitForTimeout(160);
    };
    const getState = () => page.evaluate(() => {
      const get = (selector) => document.querySelector(selector);
      const surface = get('[data-testid="capabilities-pin-container"]');
      const anchor = get('[data-testid="capabilities-transition-anchor"]');
      const rect = (element) => {
        if (!element) return null;
        const r = element.getBoundingClientRect();
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
      };
      return {
        title: get('[data-testid="works-wheel-project-title"]')?.textContent?.trim(),
        wheelTurn: get('[role="listbox"]')?._worksWheel?.turn?.current ?? null,
        anchor: rect(anchor),
        anchorChildren: anchor?.children.length ?? -1,
        surface: rect(surface),
        surfacePosition: surface?.style.position ?? '',
        surfaceOpacity: getComputedStyle(surface).opacity,
        surfaceTransform: surface?.style.transform ?? '',
        transitionProgress: Number(surface?.dataset.transitionProgress ?? -1),
        transitionScale: Number(surface?.dataset.transitionScale ?? -1),
        transitionSource: surface?.dataset.transitionSource ? JSON.parse(surface.dataset.transitionSource) : null,
        visibleBounds: surface?.dataset.transitionVisibleBounds ? JSON.parse(surface.dataset.transitionVisibleBounds) : null,
        headingCount: document.querySelectorAll('[data-testid="capabilities-heading"]').length,
        sectionCount: document.querySelectorAll('[data-testid="capabilities-section"]').length,
        sectionBackground: getComputedStyle(get('[data-testid="capabilities-section"]')).backgroundColor,
        cardCount: document.querySelectorAll('#capabilities article').length,
      };
    });
    const screenshot = async (name) => {
      const file = path.join(ARTIFACTS_DIR, `${viewport.name}-${name}.png`);
      await page.screenshot({ path: file });
      console.log(`SCREENSHOT ${file}`);
      return file;
    };

    // MNESA remains the third item; the old floating fake preview is absent.
    const mnesaProgress = geometry.p2 + (2 / 3) * (geometry.p3 - geometry.p2);
    await scroll(toProgress(mnesaProgress));
    let state = await getState();
    assert(`${viewport.name}: MNESA is active before the fourth entry`, state.title === 'MNESA', state);
    assert(`${viewport.name}: one canonical section and an empty wheel anchor`,
      state.sectionCount === 1 && state.headingCount === 1 && state.cardCount === 6 && state.anchorChildren === 0,
      { sections: state.sectionCount, headings: state.headingCount, cards: state.cardCount, anchorChildren: state.anchorChildren });

    // At the fourth entry, the canonical content is clipped to the measured media rectangle.
    const settledY = toProgress(geometry.p3);
    await scroll(settledY);
    state = await getState();
    const boundsMatch = state.transitionSource && state.visibleBounds && state.anchor &&
      Math.abs(state.transitionSource.left - state.anchor.left) < 2 &&
      Math.abs(state.transitionSource.top - state.anchor.top) < 2 &&
      Math.abs(state.transitionSource.width - state.anchor.width) < 2 &&
      Math.abs(state.transitionSource.height - state.anchor.height) < 2 &&
      Math.abs(state.visibleBounds.left - state.anchor.left) < 2 &&
      Math.abs(state.visibleBounds.top - state.anchor.top) < 2 &&
      Math.abs(state.visibleBounds.width - state.anchor.width) < 2 &&
      Math.abs(state.visibleBounds.height - state.anchor.height) < 2;
    assert(`${viewport.name}: Capabilities settles at the real fourth wheel position`,
      state.title === 'Our Capabilities' && state.wheelTurn >= 3.95 && state.surfaceOpacity === '1', state);
    assert(`${viewport.name}: shared-element visible bounds equal the measured wheel media`, boundsMatch,
      { anchor: state.anchor, source: state.transitionSource, visible: state.visibleBounds });
    await screenshot('thumbnail-settled');

    // Expansion reaches the same full-screen section without mounting another composition.
    const startScale = state.transitionScale;
    await scroll(toProgress(geometry.p3 + (1 - geometry.p3) * 0.5));
    const mid = await getState();
    assert(`${viewport.name}: midpoint is a uniform transform of the same section`,
      mid.sectionCount === 1 && mid.headingCount === 1 && mid.cardCount === 6 &&
      mid.transitionScale > startScale && mid.transitionScale < 1 && mid.surfaceTransform.includes('scale('),
      { startScale, midScale: mid.transitionScale, transform: mid.surfaceTransform });
    await screenshot('expansion-midpoint');

    const wheelEnd = geometry.wheelEnd;
    await scroll(wheelEnd + 1);
    const full = await getState();
    const neutralTransform = !full.surfaceTransform || full.surfaceTransform === 'none' ||
      full.surfaceTransform === 'translate(0px, 0px)' || full.surfaceTransform === 'translate(0px,0px)';
    assert(`${viewport.name}: full arrival fills the viewport`,
      full.surfacePosition === 'fixed' && neutralTransform &&
      Math.abs(full.surface.left) < 2 && Math.abs(full.surface.top) < 2 &&
      Math.abs(full.surface.width - geometry.width) < 2 && Math.abs(full.surface.height - geometry.height) < 2,
      { ...full, neutralTransform });
    assert(`${viewport.name}: one heading and six canonical cards at full arrival`,
      full.sectionCount === 1 && full.headingCount === 1 && full.cardCount === 6,
      { sections: full.sectionCount, headings: full.headingCount, cards: full.cardCount });
    await screenshot('full-arrival');

    const capTrigger = await page.evaluate(() => {
      const trigger = window.ScrollTrigger.getById('capabilities-pin');
      const track = document.querySelector('[data-testid="capabilities-track"]');
      const surface = document.querySelector('[data-testid="capabilities-pin-container"]');
      const firstCard = track.querySelector('article');
      return {
        start: trigger.start,
        end: trigger.end,
        horizontalTravel: Math.max(0, track.scrollWidth - surface.clientWidth),
        viewportHeight: window.innerHeight,
        cardHeight: firstCard.getBoundingClientRect().height,
        steps: track.children.length - 1,
      };
    });
    const verticalPerStep = (capTrigger.end - capTrigger.start) / capTrigger.steps;
    const minReadingDistance = Math.max(
      geometry.height * (geometry.width < 768 ? 0.58 : 0.7),
      capTrigger.cardHeight * 1.2,
      (capTrigger.horizontalTravel / capTrigger.steps) * 1.5,
    );
    assert(`${viewport.name}: card pace uses measured track travel and responsive reading distance`,
      capTrigger.end - capTrigger.start > capTrigger.horizontalTravel &&
      verticalPerStep >= minReadingDistance - 2 &&
      (geometry.width >= 768 || verticalPerStep <= geometry.height * 0.8),
      { ...capTrigger, verticalPerStep, minReadingDistance });

    await scroll(capTrigger.end - 1);
    const finalCard = await page.locator('[data-testid="capability-card-6"]').boundingBox();
    assert(`${viewport.name}: sixth card is fully accessible at the end of the track`,
      finalCard && finalCard.x >= -1 && finalCard.x + finalCard.width <= geometry.width + 1,
      { finalCard, viewportWidth: geometry.width, travel: capTrigger.horizontalTravel });
    await screenshot('sixth-card');

    await scroll(capTrigger.end + geometry.height * 0.5);
    const footer = await page.locator('#studio-footer').boundingBox();
    const released = await getState();
    assert(`${viewport.name}: contact CTA follows the catalogue without a blank release`,
      footer && Math.abs(footer.y) < 5 && footer.y + footer.height > 0 &&
      released.sectionBackground === 'rgba(0, 0, 0, 0)' &&
      released.surfacePosition !== 'fixed' && !released.surfaceTransform,
      { footer, sectionBackground: released.sectionBackground, surfacePosition: released.surfacePosition, surfaceTransform: released.surfaceTransform });
    await screenshot('contact-cta-release');

    // Reverse through the same live section and back into the drum; no fixed state remains.
    await scroll(settledY);
    state = await getState();
    assert(`${viewport.name}: reverse scrolling restores the fourth wheel item`,
      state.title === 'Our Capabilities' && state.surfacePosition === 'fixed' && state.anchorChildren === 0,
      state);
    await scroll(toProgress(mnesaProgress));
    state = await getState();
    assert(`${viewport.name}: reverse scrolling restores MNESA without stale overlay styles`,
      state.title === 'MNESA' && state.surfacePosition !== 'fixed' && state.surfaceOpacity === '0' && !state.surfaceTransform,
      state);

    viewportResults.push({ viewport, geometry, capTrigger, verticalPerStep, errors: errors.slice() });
    await page.close();
  }

  assert('No browser console or runtime errors at tested viewports', errors.length === 0, errors);
  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'final_transition_audit_report.json'),
    JSON.stringify({ baseUrl: BASE_URL, viewportResults, assertions, errors }, null, 2),
  );
  await browser.close();

  const failures = assertions.filter((item) => !item.passed);
  console.log(`\n${assertions.length - failures.length}/${assertions.length} assertions passed; ${failures.length} failed.`);
  if (failures.length) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
