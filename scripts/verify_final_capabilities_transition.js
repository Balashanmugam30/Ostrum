const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.OSTRUM_BASE_URL || 'http://127.0.0.1:3000';
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

    await page.goto(BASE_URL, { waitUntil: 'load' });
    await page.waitForFunction(
      () => window.lenis && window.ScrollTrigger?.getById('works-wheel-pin'),
      null,
      { timeout: 30000 },
    );
    await page.waitForTimeout(250);
    await page.evaluate(() => window.ScrollTrigger?.refresh());
    await page.waitForTimeout(400);

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

    const sculptureClearsSurface = (sculpture, surface) =>
      sculpture.rect.right <= surface.left + 1 ||
      sculpture.rect.left >= surface.right - 1 ||
      sculpture.rect.bottom <= surface.top + 1 ||
      sculpture.rect.top >= surface.bottom - 1;

    const scroll = async (y) => {
      await page.evaluate((position) => window.lenis.scrollTo(position, { immediate: true }), y);
      await page.waitForTimeout(500);
    };
    const getState = () => page.evaluate(() => {
      const get = (selector) => document.querySelector(selector);
      const surface = get('[data-testid="capabilities-pin-container"]');
      const anchor = get('[data-testid="capabilities-transition-anchor"]');
      const overviewSculpture = get('[data-testid="selected-work-overview-sculpture"]');
      const transitionSculpture = get('[data-testid="capabilities-transition-sculpture"]');
      const track = get('[data-testid="capabilities-track"]');
      const firstCard = get('[data-testid="capability-card-1"]');
      const heading = get('[data-testid="capabilities-heading"]');
      const statement = get('[data-testid="capabilities-supporting-statement"]');
      const selectedWork = get('[data-testid="selected-work-section"]');
      const wheelStage = get('#selected-work .pin-spacer-works-wheel-pin > div');
      const header = get('.header');
      const rect = (element) => {
        if (!element) return null;
        const r = element.getBoundingClientRect();
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
      };
      const leftPanel = get('[data-testid="works-wheel-left-panel"]');
      const capSection = get('[data-testid="capabilities-section"]');
      return {
        scrollY: window.scrollY,
        title: get('[data-testid="works-wheel-project-title"]')?.textContent?.trim(),
        leftPanelOpacity: leftPanel ? Number(getComputedStyle(leftPanel).opacity) : 0,
        wheelTurn: get('[role="listbox"]')?._worksWheel?.turn?.current ?? null,
        wheelEntryCount: document.querySelectorAll('[role="listbox"] [role="option"]').length,
        anchor: rect(anchor),
        anchorChildren: anchor?.children.length ?? -1,
        surface: rect(surface),
        overviewSculpture: {
          rect: rect(overviewSculpture),
          opacity: overviewSculpture ? Number(getComputedStyle(overviewSculpture).opacity) : 0,
        },
        transitionSculpture: {
          rect: rect(transitionSculpture),
          opacity: transitionSculpture ? Number(getComputedStyle(transitionSculpture).opacity) : 0,
        },
        selectedWorkBounds: rect(selectedWork),
        wheelStageBounds: rect(wheelStage),
        surfacePosition: surface?.style.position ?? '',
        surfaceComputedPosition: surface ? getComputedStyle(surface).position : '',
        surfaceOpacity: surface ? getComputedStyle(surface).opacity : '0',
        surfaceTransform: surface?.style.transform ?? '',
        transitionProgress: Number(surface?.dataset.transitionProgress ?? -1),
        transitionScale: Number(surface?.dataset.transitionScale ?? -1),
        transitionSource: surface?.dataset.transitionSource ? JSON.parse(surface.dataset.transitionSource) : null,
        visibleBounds: surface?.dataset.transitionVisibleBounds ? JSON.parse(surface.dataset.transitionVisibleBounds) : null,
        headingCount: document.querySelectorAll('[data-testid="capabilities-heading"]').length,
        headingBounds: rect(heading),
        statementBounds: rect(statement),
        headerControls: header && Number(getComputedStyle(header).opacity) > 0.1
          ? Array.from(header.children).map(rect).filter((bounds) => bounds && bounds.width > 0 && bounds.height > 0)
          : [],
        sectionCount: document.querySelectorAll('[data-testid="capabilities-section"]').length,
        sectionBackground: capSection ? getComputedStyle(capSection).backgroundColor : '',
        cardCount: document.querySelectorAll('#capabilities article').length,
        artworkCount: document.querySelectorAll('#capabilities [data-testid^="capability-artwork-"]').length,
        canvasArtworkCount: document.querySelectorAll('#capabilities [data-testid^="capability-artwork-"] canvas').length,
        transitionSculptureCount: document.querySelectorAll('[data-testid="capabilities-transition-sculpture"]').length,
        firstCard: rect(firstCard),
        trackPaddingLeft: track ? getComputedStyle(track).paddingLeft : '',
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
        footerCount: document.querySelectorAll('#studio-footer').length,
      };
    });
    const screenshot = async (name) => {
      const file = path.join(ARTIFACTS_DIR, `${viewport.name}-${name}.png`);
      await page.screenshot({ path: file });
      console.log(`SCREENSHOT ${file}`);
      return file;
    };

    // The wheel is visible at rest with its center label; only project metadata is hidden.
    await scroll(geometry.wheelStart + 30);
    let state = await getState();
    const initialWheel = await page.locator('[role="listbox"]').boundingBox();
    const centerLabel = await page.locator('[data-testid="works-wheel-center-label"]').innerText();
    assert(`${viewport.name}: initial oval wheel and Selected Work label are visible without TMR metadata`,
      initialWheel && initialWheel.width > 0 && initialWheel.y >= -1 &&
      initialWheel.y < geometry.height && centerLabel === 'Selected Work' &&
      state.wheelEntryCount === 4 && state.leftPanelOpacity < 0.02 &&
      state.overviewSculpture.opacity > 0.95 &&
      (geometry.width < 768 || state.overviewSculpture.rect.right < (await page.locator('[data-testid="works-wheel-center-label"]').boundingBox()).x),
      { initialWheel, centerLabel, ...state });
    await screenshot('initial-oval-rest');

    // MNESA remains the third item; the old floating fake preview is absent.
    const mnesaProgress = geometry.p2 + (2 / 3) * (geometry.p3 - geometry.p2);
    await scroll(toProgress(mnesaProgress));
    state = await getState();
    assert(`${viewport.name}: MNESA is active before the fourth entry`, state.title === 'MNESA', state);
    assert(`${viewport.name}: one canonical section and an empty wheel anchor`,
      state.sectionCount === 1 && state.headingCount === 1 && state.cardCount === 6 && state.anchorChildren === 0,
      { sections: state.sectionCount, headings: state.headingCount, cards: state.cardCount, anchorChildren: state.anchorChildren });

    const tmrProgress = geometry.p2 + (geometry.p3 - geometry.p2) * 0.05;
    await scroll(toProgress(tmrProgress));
    state = await getState();
    assert(`${viewport.name}: TMR metadata appears when TMR becomes active`,
      state.title?.startsWith('TMR') && state.leftPanelOpacity > 0.95, state);
    await screenshot('tmr-active');
    await scroll(toProgress(mnesaProgress));
    state = await getState();
    assert(`${viewport.name}: MNESA remains the third item after TMR`, state.title === 'MNESA', state);

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

    // A few pixels into expansion verifies no misplaced floating orb is spawned.
    await scroll(settledY + 30);
    const transitionVisual = await getState();
    assert(`${viewport.name}: early expansion keeps clean editorial header without misplaced floating orb`,
      transitionVisual.transitionSculptureCount === 0,
      { count: transitionVisual.transitionSculptureCount });
    await screenshot('capabilities-early-expansion');

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
    assert(`${viewport.name}: full-size Capabilities editorial header is clean without misplaced top orb, and all 6 cards contain 3D artworks`,
      full.transitionSculptureCount === 0 && full.artworkCount === 6,
      { count: full.transitionSculptureCount, artworks: full.artworkCount });
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
        sectionHeight: document.querySelector('[data-testid="capabilities-section"]').getBoundingClientRect().height,
        documentMaxScroll: document.documentElement.scrollHeight - window.innerHeight,
        hasPinSpacer: Boolean(surface.closest('.pin-spacer')),
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

    // Capture the live section shortly after release and where the previous
    // wheel formerly appeared to linger over its upper edge.
    await scroll(capTrigger.start + 80);
    let horizontal = await getState();
    const earlyHeading = await page.locator('[data-testid="capabilities-heading"]').boundingBox();
    const earlyCard = await page.locator('[data-testid="capability-card-1"]').boundingBox();
    assert(`${viewport.name}: early horizontal scroll shows the canonical heading and first service card`,
      horizontal.cardCount === 6 && earlyHeading && earlyCard &&
      earlyHeading.y >= -1 && earlyHeading.y < geometry.height &&
      earlyCard.x < geometry.width && earlyCard.x + earlyCard.width > 0 &&
      horizontal.documentWidth <= geometry.width + 1,
      { ...horizontal, earlyHeading, earlyCard });
    assert(`${viewport.name}: editorial header remains clean during horizontal card travel`,
      horizontal.transitionSculptureCount === 0,
      { count: horizontal.transitionSculptureCount });
    await screenshot('capabilities-horizontal-early');

    await scroll(capTrigger.start + (capTrigger.end - capTrigger.start) * 0.5);
    horizontal = await getState();
    const midHeading = await page.locator('[data-testid="capabilities-heading"]').boundingBox();
    const midCard = await page.locator('[data-testid="capability-card-1"]').boundingBox();
    assert(`${viewport.name}: Selected Work releases before the card-scroll overlap region`,
      horizontal.selectedWorkBounds.bottom <= 1 && horizontal.wheelStageBounds.bottom <= 1 &&
      horizontal.transitionSculptureCount === 0 &&
      horizontal.cardCount === 6 && midHeading && midCard &&
      midHeading.y >= -1 && midHeading.y < geometry.height &&
      horizontal.documentWidth <= geometry.width + 1,
      { ...horizontal, midHeading, midCard });
    await screenshot('capabilities-horizontal-overlap-region');

    await scroll(capTrigger.end - 1);
    const finalCard = await page.locator('[data-testid="capability-card-6"]').boundingBox();
    assert(`${viewport.name}: sixth card is fully accessible at the end of the track`,
      finalCard && finalCard.x >= -1 && finalCard.x + finalCard.width <= geometry.width + 1,
      { finalCard, viewportWidth: geometry.width, travel: capTrigger.horizontalTravel });
    await screenshot('sixth-card');

    await scroll(capTrigger.end + geometry.height * 0.5);
    const released = await getState();
    const endCard = await page.locator('[data-testid="capability-card-6"]').boundingBox();
    assert(`${viewport.name}: page ends on the sticky Capabilities stage with no trailing footer`,
      released.footerCount === 0 && released.surfaceComputedPosition === 'sticky' &&
      Math.abs(released.surface.top) < 2 && endCard && endCard.x >= -1 &&
      endCard.x + endCard.width <= geometry.width + 1 &&
      Math.abs(released.scrollY - capTrigger.end) < 3 &&
      Math.abs(capTrigger.documentMaxScroll - capTrigger.end) < 3 &&
      !capTrigger.hasPinSpacer,
      { ...released, endCard, viewportWidth: geometry.width, triggerEnd: capTrigger.end,
        documentMaxScroll: capTrigger.documentMaxScroll, hasPinSpacer: capTrigger.hasPinSpacer });
    assert(`${viewport.name}: restored six-card catalogue keeps its original track and responsive widths`,
      released.cardCount === 6 && released.artworkCount === 6 &&
      released.transitionSculptureCount === 0 &&
      released.documentWidth <= released.viewportWidth + 1 &&
      (geometry.width < 1280 || released.trackPaddingLeft === '80px'),
      { cards: released.cardCount, artworks: released.artworkCount,
        sculpture: released.transitionSculptureCount,
        firstCard: released.firstCard, trackPaddingLeft: released.trackPaddingLeft,
        documentWidth: released.documentWidth, viewportWidth: released.viewportWidth });
    await screenshot('page-end-sixth-card');

    const card = page.locator('[data-testid="capability-card-6"]');
    const beforeHover = await card.boundingBox();
    await card.hover();
    await page.waitForTimeout(420);
    const afterHover = await card.boundingBox();
    assert(`${viewport.name}: card hover lifts and enlarges the selected card`,
      afterHover && beforeHover && afterHover.y < beforeHover.y && afterHover.width > beforeHover.width,
      { beforeHover, afterHover });
    await screenshot('sixth-card-hover');
    await page.mouse.move(geometry.width - 1, geometry.height - 1);
    await page.waitForFunction(
      () => !document.querySelector('[data-testid="capability-card-6"]')?.matches(':hover'),
      null,
      { timeout: 2000 },
    );
    await page.waitForTimeout(420);
    const afterHoverExit = await card.boundingBox();
    assert(`${viewport.name}: card returns to baseline after hover`,
      afterHoverExit && beforeHover && Math.abs(afterHoverExit.y - beforeHover.y) < 1 &&
      Math.abs(afterHoverExit.width - beforeHover.width) < 1,
      { beforeHover, afterHoverExit });
    await card.focus();
    await page.waitForTimeout(420);
    const afterFocus = await card.boundingBox();
    assert(`${viewport.name}: keyboard focus emphasizes the selected card`,
      afterFocus && beforeHover && afterFocus.y < beforeHover.y && afterFocus.width > beforeHover.width,
      { beforeHover, afterFocus });
    await screenshot('sixth-card-keyboard-focus');

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
