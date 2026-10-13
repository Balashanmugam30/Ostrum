const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.OSTRUM_BASE_URL || 'http://localhost:3000';
const ARTIFACTS_DIR = path.join(__dirname, '..', 'rebuild-capture', 'audit', 'works-wheel-final');
const VIEWPORT = { width: 1440, height: 900 };
fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-gpu', '--enable-gpu-benchmarking', '--enable-threaded-compositing'],
  });
  const page = await browser.newPage({ viewport: VIEWPORT });
  const assertions = [];
  const errors = [];
  const networkErrors = [];

  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('requestfailed', (request) => networkErrors.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400) networkErrors.push(`${response.status()} ${response.url()}`);
  });

  const assert = (name, passed, details = {}) => {
    assertions.push({ name, passed: Boolean(passed), details });
    console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`, details);
  };

  const scroll = async (position) => {
    await page.evaluate((y) => window.lenis.scrollTo(y, { immediate: true }), position);
    await page.waitForTimeout(500);
  };
  const capture = (name) => page.screenshot({
    path: path.join(ARTIFACTS_DIR, `${name}.png`),
  });
  const snapshot = () => page.evaluate(() => {
    const get = (selector) => document.querySelector(selector);
    const rect = (element) => {
      if (!element) return null;
      const r = element.getBoundingClientRect();
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    };
    const surface = get('[data-testid="capabilities-pin-container"]');
    const anchor = get('[data-testid="capabilities-transition-anchor"]');
      const centerLabel = get('[data-testid="works-wheel-center-label"]');
      const overviewSculpture = get('[data-testid="selected-work-overview-sculpture"]');
      const transitionSculpture = get('[data-testid="capabilities-transition-sculpture"]');
    return {
      scrollY: window.scrollY,
      title: get('[data-testid="works-wheel-project-title"]')?.textContent?.trim() ?? '',
      leftPanelOpacity: get('[data-testid="works-wheel-left-panel"]') ? Number(getComputedStyle(get('[data-testid="works-wheel-left-panel"]')).opacity) : 0,
      centerLabel: get('[data-testid="works-wheel-center-label"]')?.textContent?.trim() ?? '',
      wheelTurn: get('[role="listbox"]')?._worksWheel?.turn?.current ?? null,
      wheelEntryCount: document.querySelectorAll('[role="listbox"] [role="option"]').length,
      anchor: rect(anchor),
      anchorChildren: anchor?.children.length ?? -1,
      centerLabelBounds: rect(centerLabel),
      overviewSculpture: {
        rect: rect(overviewSculpture),
        opacity: overviewSculpture ? Number(getComputedStyle(overviewSculpture).opacity) : 0,
        visibility: overviewSculpture ? getComputedStyle(overviewSculpture).visibility : 'hidden',
      },
      transitionSculpture: {
        rect: rect(transitionSculpture),
        opacity: transitionSculpture ? Number(getComputedStyle(transitionSculpture).opacity) : 0,
        visibility: transitionSculpture ? getComputedStyle(transitionSculpture).visibility : 'hidden',
      },
      transitionSculptureCount: document.querySelectorAll('[data-testid="capabilities-transition-sculpture"]').length,
      artworkCount: document.querySelectorAll('#capabilities [data-testid^="capability-artwork-"]').length,
      surface: rect(surface),
      surfacePosition: surface?.style.position ?? '',
      surfaceOpacity: surface ? getComputedStyle(surface).opacity : '0',
      surfaceTransform: surface?.style.transform ?? '',
      transitionSource: surface?.dataset.transitionSource ? JSON.parse(surface.dataset.transitionSource) : null,
      sectionCount: document.querySelectorAll('[data-testid="capabilities-section"]').length,
      headingCount: document.querySelectorAll('[data-testid="capabilities-heading"]').length,
      cardCount: document.querySelectorAll('#capabilities article').length,
    };
  });

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForFunction(
      () => window.lenis && window.ScrollTrigger?.getById('works-wheel-pin'),
      null,
      { timeout: 30000 },
    );

    const geometry = await page.evaluate(() => {
      const trigger = window.ScrollTrigger.getById('works-wheel-pin');
      const hold = 350;
      const morph = 1000;
      const projects = 2950;
      const total = hold + morph + projects + 1650;
      return {
        start: trigger.start,
        end: trigger.end,
        p2: (hold + morph) / total,
        p3: (hold + morph + projects) / total,
      };
    });
    const forTurn = (turn) => geometry.start + (geometry.end - geometry.start) *
      (geometry.p2 + ((turn - 1) / 3) * (geometry.p3 - geometry.p2));
    const forExpansion = (progress) => geometry.start + (geometry.end - geometry.start) *
      (geometry.p3 + progress * (1 - geometry.p3));

    // Enter the pin by one frame's scroll distance so ScrollTrigger has a real
    // active update (progress is zero exactly at `start`, before onUpdate runs).
    await scroll(geometry.start + 30);
    let state = await snapshot();
    assert('Resting oval keeps four entries and the center label while hiding TMR copy',
      state.wheelEntryCount === 4 && state.centerLabel === 'Selected Work' &&
      state.leftPanelOpacity < 0.02 && state.surface.top > VIEWPORT.height &&
      state.overviewSculpture.opacity > 0.95 &&
      state.overviewSculpture.visibility === 'visible' &&
      state.overviewSculpture.rect.right < state.centerLabelBounds.left,
      { ...state, viewport: VIEWPORT });
    await capture('01-initial-oval-rest');

    await scroll(forTurn(1.15));
    state = await snapshot();
    assert('TMR copy appears when the first project becomes active',
      state.title.startsWith('TMR') && state.leftPanelOpacity > 0.95 &&
      state.overviewSculpture.opacity < 0.02, state);
    await capture('02-tmr-active');

    await scroll(forTurn(2));
    state = await snapshot();
    assert('Saraswati remains the second entry in the wheel',
      state.title.includes('Saraswati') && state.leftPanelOpacity > 0.95, state);
    await capture('03-saraswati-active');

    await scroll(forTurn(3));
    state = await snapshot();
    assert('MNESA remains the third entry and Capabilities stays below the viewport',
      state.title === 'MNESA' && state.leftPanelOpacity > 0.95 &&
      state.surface.top >= VIEWPORT.height && state.anchorChildren === 0, state);
    await capture('04-mnesa-active');

    // Sample just inside the expansion phase. At the exact phase boundary the
    // opacity transition is still settling from the preceding wheel state.
    await scroll(forTurn(4) + 30);
    state = await snapshot();
    const sourceMatchesAnchor = state.transitionSource && state.anchor &&
      Math.abs(state.transitionSource.left - state.anchor.left) < 2 &&
      Math.abs(state.transitionSource.top - state.anchor.top) < 2 &&
      Math.abs(state.transitionSource.width - state.anchor.width) < 2 &&
      Math.abs(state.transitionSource.height - state.anchor.height) < 2;
    assert('Capabilities enters as the fourth item from its measured anchor with no duplicate preview',
      state.title === 'Our Capabilities' && state.leftPanelOpacity < 0.02 &&
      state.anchorChildren === 0 && state.sectionCount === 1 && state.headingCount === 1 &&
      state.cardCount === 6 && state.surfacePosition === 'fixed' && sourceMatchesAnchor,
      { ...state, sourceMatchesAnchor });
    assert('Capabilities enters with no misplaced top orb and 6 service cards ready',
      state.transitionSculptureCount === 0 && state.cardCount === 6,
      { sculptureCount: state.transitionSculptureCount, cardCount: state.cardCount });
    await capture('05-capabilities-fourth-entry');

    const settledScale = Number((await snapshot()).surface?.width / VIEWPORT.width);
    await scroll(forExpansion(0.5));
    state = await snapshot();
    const midScale = Number(state.surface?.width / VIEWPORT.width);
    assert('The same live Capabilities section expands smoothly from the fourth entry',
      state.sectionCount === 1 && state.headingCount === 1 && state.cardCount === 6 &&
      midScale > settledScale && midScale < 1 && state.transitionSculptureCount === 0,
      { settledScale, midScale, state });
    await capture('06-capabilities-expansion-midpoint');

    await scroll(forTurn(3));
    state = await snapshot();
    assert('Reverse scroll restores MNESA and clears the shared-element overlay',
      state.title === 'MNESA' && state.leftPanelOpacity > 0.95 &&
      state.surfacePosition !== 'fixed' && !state.surfaceTransform, state);
    await capture('07-reverse-to-mnesa');

    assert('No page errors or failed requests', errors.length === 0 && networkErrors.length === 0,
      { errors, networkErrors });
    const report = { baseUrl: BASE_URL, viewport: VIEWPORT, geometry, assertions, errors, networkErrors };
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'final_works_wheel_audit_report.json'),
      JSON.stringify(report, null, 2),
    );
  } finally {
    await browser.close();
  }

  const failures = assertions.filter((item) => !item.passed);
  console.log(`\n${assertions.length - failures.length}/${assertions.length} assertions passed; ${failures.length} failed.`);
  if (failures.length) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
