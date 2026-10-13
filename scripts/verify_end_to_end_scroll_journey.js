const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.OSTRUM_BASE_URL || 'http://localhost:3000';
const ARTIFACTS_DIR = path.join(__dirname, '..', 'rebuild-capture', 'audit', 'capabilities-journey');
fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

const VIEWPORT = { width: 1440, height: 900 };
const DESCRIPTION =
  'From digital experiences and intelligent AI systems to business platforms, product engineering and connected hardware, we build the technology that moves businesses forward.';

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-gpu-benchmarking', '--enable-threaded-compositing'],
  });
  const page = await browser.newPage({ viewport: VIEWPORT });
  const errors = [];
  const networkErrors = [];
  const assertions = [];

  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('requestfailed', (request) => {
    networkErrors.push(`${request.url()}: ${request.failure()?.errorText ?? 'request failed'}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400) networkErrors.push(`${response.status()} ${response.url()}`);
  });
  await page.addInitScript(() => {
    const health = { frameIntervals: [], layoutShifts: [], longAnimationFrames: [] };
    (window).__ostrumBrowserHealth = health;
    let previousFrame = null;
    const sampleFrame = (time) => {
      if (previousFrame !== null) health.frameIntervals.push(time - previousFrame);
      previousFrame = time;
      requestAnimationFrame(sampleFrame);
    };
    requestAnimationFrame(sampleFrame);
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            health.layoutShifts.push({
              value: entry.value,
              startTime: entry.startTime,
              sources: (entry.sources ?? []).map((source) => {
                const node = source.node;
                return {
                  testId: node?.closest?.('[data-testid]')?.getAttribute('data-testid') ?? null,
                  id: node?.id ?? null,
                  className: typeof node?.className === 'string' ? node.className : null,
                  previousRect: source.previousRect?.toJSON?.() ?? null,
                  currentRect: source.currentRect?.toJSON?.() ?? null,
                };
              }),
            });
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    }
    if (PerformanceObserver.supportedEntryTypes?.includes('long-animation-frame')) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          health.longAnimationFrames.push({
            duration: entry.duration,
            blockingDuration: entry.blockingDuration,
            scripts: (entry.scripts ?? []).map((script) => ({
              sourceURL: script.sourceURL,
              functionName: script.sourceFunctionName,
              duration: script.duration,
            })),
          });
        }
      });
      observer.observe({ type: 'long-animation-frame', buffered: true });
    }
  });

  const assert = (name, condition, details = {}) => {
    assertions.push({ name, passed: Boolean(condition), details });
    console.log(`${condition ? 'PASS' : 'FAIL'} ${name}`, details);
  };

  const snapshot = () =>
    page.evaluate(() => {
      const get = (selector) => document.querySelector(selector);
      const rect = (element) => {
        if (!element) return null;
        const value = element.getBoundingClientRect();
        return {
          left: value.left,
          top: value.top,
          right: value.right,
          bottom: value.bottom,
          width: value.width,
          height: value.height,
        };
      };
      const surface = get('[data-testid="capabilities-pin-container"]');
      const wheel = document.getElementById('works-wheel-3');
      const mnesa = document.getElementById('works-wheel-2');
      const anchor = get('[data-testid="capabilities-transition-anchor"]');
      const track = get('[data-testid="capabilities-track"]');
      const capTrigger = window.ScrollTrigger?.getById('capabilities-pin');
      const wheelTrigger = window.ScrollTrigger?.getById('works-wheel-pin');

      return {
        scrollY: window.scrollY,
        title: get('[data-testid="works-wheel-project-title"]')?.textContent?.trim(),
        description: get('[data-testid="works-wheel-project-description"]')?.textContent?.trim(),
        leftPanelOpacity: Number(getComputedStyle(get('[data-testid="works-wheel-left-panel"]')).opacity),
        wheelTurn: get('[role="listbox"]')?._worksWheel?.turn?.current ?? null,
        capabilitiesCardOpacity: wheel ? Number(getComputedStyle(wheel).opacity) : 0,
        mnesaCardOpacity: mnesa ? Number(getComputedStyle(mnesa).opacity) : 0,
        anchorRect: rect(anchor),
        anchorChildCount: anchor?.children.length ?? -1,
        surfaceRect: rect(surface),
        surfacePosition: surface ? surface.style.position : null,
        surfaceOpacity: surface ? getComputedStyle(surface).opacity : null,
        surfaceTransform: surface ? surface.style.transform : null,
        surfaceClip: surface ? surface.style.clipPath : null,
        transitionProgress: surface?.dataset.transitionProgress ?? null,
        transitionScale: surface?.dataset.transitionScale ?? null,
        transitionSource: surface?.dataset.transitionSource ?? null,
        transitionVisibleBounds: surface?.dataset.transitionVisibleBounds ?? null,
        headingCount: document.querySelectorAll('[data-testid="capabilities-heading"]').length,
        sectionCount: document.querySelectorAll('[data-testid="capabilities-section"]').length,
        sectionBackground: getComputedStyle(get('[data-testid="capabilities-section"]')).backgroundColor,
        statementCount: document.querySelectorAll('[data-testid="capabilities-supporting-statement"]').length,
        trackCount: document.querySelectorAll('[data-testid="capabilities-track"]').length,
        serviceCardCount: document.querySelectorAll('#capabilities article').length,
        trackTransform: track ? getComputedStyle(track).transform : null,
        wheelStart: wheelTrigger?.start ?? null,
        wheelEnd: wheelTrigger?.end ?? null,
        capabilitiesStart: capTrigger?.start ?? null,
        capabilitiesEnd: capTrigger?.end ?? null,
      };
    });

  const moveWithLenis = async (scrollY) => {
    await page.evaluate((position) => window.lenis.scrollTo(position, { immediate: true }), scrollY);
    await page.waitForTimeout(180);
  };

  const capture = async (name) => {
    const file = path.join(ARTIFACTS_DIR, `${name}.png`);
    await page.screenshot({ path: file });
    console.log(`SCREENSHOT ${file}`);
    return file;
  };

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForFunction(
    () => window.lenis && window.ScrollTrigger?.getById('works-wheel-pin'),
    null,
    { timeout: 30000 },
  );
  await page.waitForTimeout(350);

  const geometry = await page.evaluate(() => {
    const wheel = window.ScrollTrigger.getById('works-wheel-pin');
    const mobile = window.innerWidth < 768;
    const hold = mobile ? 250 : 350;
    const morph = mobile ? 700 : 1000;
    const projects = mobile ? 2100 : 2950;
    const total = hold + morph + projects + (mobile ? 1000 : 1650);
    const p2 = (hold + morph) / total;
    const p3 = (hold + morph + projects) / total;
    return {
      start: wheel.start,
      end: wheel.end,
      p2,
      p3,
    };
  });
  geometry.forTurn = (turn) => geometry.start + (geometry.end - geometry.start) *
    (geometry.p2 + ((turn - 1) / 3) * (geometry.p3 - geometry.p2));
  geometry.forExpansion = (progress) => geometry.start + (geometry.end - geometry.start) *
    (geometry.p3 + progress * (1 - geometry.p3));

  // 1. MNESA is active, with no Capabilities preview visible over it.
  await moveWithLenis(geometry.forTurn(3));
  let state = await snapshot();
  assert('MNESA is the active third wheel entry', state.title === 'MNESA', state);
  assert('Capabilities item has no separately rendered thumbnail content', state.anchorChildCount === 0, state);
  assert('Capabilities section is hidden while MNESA is active', state.surfaceOpacity === '0', state);
  await capture('01-mnesa-active');

  // 2. Sample the real drum halfway from MNESA to the fourth entry.
  await moveWithLenis(geometry.forTurn(3.6));
  state = await snapshot();
  assert('Fourth item enters through the existing drum rotation', state.title === 'Our Capabilities' && state.wheelTurn >= 3.45, state);
  assert('The transition uses the real section at the fourth item bounds', state.surfacePosition === 'fixed' && state.anchorChildCount === 0, state);
  assert('Wheel metadata clears when the canonical Capabilities content enters', state.leftPanelOpacity < 0.02, { leftPanelOpacity: state.leftPanelOpacity });
  await capture('02-mnesa-to-capabilities-drum-rotation');

  // 3. The fourth item settles; the measured thumbnail and live section share bounds.
  await moveWithLenis(geometry.forExpansion(0));
  state = await snapshot();
  const source = JSON.parse(state.transitionSource || 'null');
  const visibleBounds = JSON.parse(state.transitionVisibleBounds || 'null');
  const sourceMatchesAnchor = source && state.anchorRect &&
    Math.abs(source.left - state.anchorRect.left) < 2 &&
    Math.abs(source.top - state.anchorRect.top) < 2 &&
    Math.abs(source.width - state.anchorRect.width) < 2 &&
    Math.abs(source.height - state.anchorRect.height) < 2;
  const visibleMatchesAnchor = visibleBounds && state.anchorRect &&
    Math.abs(visibleBounds.left - state.anchorRect.left) < 2 &&
    Math.abs(visibleBounds.top - state.anchorRect.top) < 2 &&
    Math.abs(visibleBounds.width - state.anchorRect.width) < 2 &&
    Math.abs(visibleBounds.height - state.anchorRect.height) < 2;
  assert('Our Capabilities settles as wheel item four', state.title === 'Our Capabilities' && state.capabilitiesCardOpacity > 0.95, state);
  assert('Only the canonical section heading remains visible at the settled entry', state.leftPanelOpacity < 0.02 && state.headingCount === 1, { leftPanelOpacity: state.leftPanelOpacity, headingCount: state.headingCount });
  assert('MNESA is no longer visible at the settled fourth position', state.mnesaCardOpacity < 0.05, state);
  assert('The single live section begins at the measured fourth-item media bounds', sourceMatchesAnchor && visibleMatchesAnchor, { source, anchor: state.anchorRect, visibleBounds });
  assert('The wheel entry copy matches the required description', state.description ===
    'From digital experiences and intelligent AI systems to business platforms, product engineering and connected hardware, we build the technology that moves businesses forward.', state.description);
  await capture('03-capabilities-settled-in-wheel');

  // 4–9. Scrub the same outer section from its thumbnail bounds to full viewport.
  const progressFrames = [
    ['04-expansion-start', 0.005],
    ['05-expansion-25-percent', 0.25],
    ['06-expansion-50-percent', 0.5],
    ['07-expansion-75-percent', 0.75],
    ['08-expansion-full-arrival', 1],
  ];
  let firstScale = 0;
  for (const [name, progress] of progressFrames) {
    const target = progress === 1 ? geometry.end + 1 : geometry.forExpansion(progress);
    await moveWithLenis(target);
    state = await snapshot();
    const scale = Number(state.transitionScale);
    if (progress === 0.005) firstScale = scale;
    assert(`${Math.round(progress * 100)}% expansion stays one opaque section`,
      state.sectionCount === 1 && state.headingCount === 1 && state.serviceCardCount === 6 &&
      state.surfaceOpacity === '1' && state.leftPanelOpacity < 0.02, state);
    if (progress >= 0.25 && progress < 1) {
      assert(`${Math.round(progress * 100)}% expansion grows uniformly from the source bounds`,
        scale > firstScale && scale < 1 && state.surfaceTransform.includes('scale('),
        { scale, firstScale, transform: state.surfaceTransform, clip: state.surfaceClip });
    }
    if (progress === 0.005) {
      const origin = JSON.parse(state.transitionSource || 'null');
      const visible = JSON.parse(state.transitionVisibleBounds || 'null');
      assert('Initial expansion frame still matches the settled media bounds',
        origin && visible && Math.abs(origin.left - state.anchorRect.left) < 2 &&
        Math.abs(origin.top - state.anchorRect.top) < 2 &&
        Math.abs(visible.width - state.anchorRect.width) < 2 &&
        Math.abs(visible.height - state.anchorRect.height) < 2,
        { origin, anchor: state.anchorRect, visible });
    }
    if (progress === 1) {
      const neutralTransform = !state.surfaceTransform || state.surfaceTransform === 'none' ||
        state.surfaceTransform === 'translate(0px, 0px)' || state.surfaceTransform === 'translate(0px,0px)';
      assert('Full arrival fills the viewport and keeps the real section interactive',
        state.surfacePosition === 'fixed' && neutralTransform &&
        state.surfaceRect.width >= VIEWPORT.width - 2 && state.surfaceRect.height >= VIEWPORT.height - 2,
        { ...state, neutralTransform });
    }
    await capture(name);
  }

  // 10–12. The live six-card track has measured travel and a deliberate vertical range.
  const capMetrics = await page.evaluate(() => {
    const track = document.querySelector('[data-testid="capabilities-track"]');
    const surface = document.querySelector('[data-testid="capabilities-pin-container"]');
    const trigger = window.ScrollTrigger.getById('capabilities-pin');
    const first = track.querySelector('article');
    return {
      horizontalTravel: Math.max(0, track.scrollWidth - surface.clientWidth),
      verticalDistance: trigger.end - trigger.start,
      viewportHeight: window.innerHeight,
      cardHeight: first.getBoundingClientRect().height,
      steps: track.children.length - 1,
    };
  });
  assert('Capabilities vertical range is paced from actual horizontal travel and card geometry',
    capMetrics.verticalDistance > capMetrics.horizontalTravel &&
    capMetrics.verticalDistance / capMetrics.steps >= Math.max(capMetrics.viewportHeight * 0.58, capMetrics.cardHeight * 1.2) - 2,
    capMetrics);

  const capStart = state.capabilitiesStart;
  const capEnd = state.capabilitiesEnd;
  const capDistance = capEnd - capStart;
  await moveWithLenis(capStart + capDistance * 0.12);
  state = await snapshot();
  await capture('09-first-service-card-reveal');
  const firstCard = await page.locator('[data-testid="capability-card-1"]').boundingBox();
  assert('First service card is visible as the horizontal track begins moving',
    firstCard && firstCard.x < VIEWPORT.width && firstCard.x + firstCard.width > 0, firstCard);

  await moveWithLenis(capStart + capDistance * 0.5);
  const middleTrack = await page.locator('[data-testid="capabilities-track"]').evaluate((element) => getComputedStyle(element).transform);
  await capture('10-service-catalogue-midpoint');
  assert('The catalogue advances continuously at its midpoint', middleTrack !== 'none' && middleTrack !== 'matrix(1, 0, 0, 1, 0, 0)', middleTrack);

  await moveWithLenis(capEnd - 1);
  state = await snapshot();
  const finalCard = await page.locator('[data-testid="capability-card-6"]').boundingBox();
  await capture('11-sixth-card-fully-accessible');
  assert('The sixth card is fully in view at the measured track endpoint',
    finalCard && finalCard.x >= -1 && finalCard.x + finalCard.width <= VIEWPORT.width + 1,
    { finalCard, viewport: VIEWPORT, horizontalTravel: capMetrics.horizontalTravel });

  // 13. The section releases into the existing contact CTA without a fixed stale surface.
  await moveWithLenis(capEnd + 1);
  state = await snapshot();
  const footer = await page.locator('#studio-footer').boundingBox();
  await capture('12-natural-release-into-contact-cta');
  assert('The contact CTA enters naturally after the sixth card',
    footer && Math.abs(footer.y) < 5 && footer.y + footer.height > 0,
    { footer, transitionPosition: state.surfacePosition, transitionTransform: state.surfaceTransform });
  assert('The released section leaves no white tail behind the contact CTA',
    state.sectionBackground === 'rgba(0, 0, 0, 0)', { sectionBackground: state.sectionBackground });
  assert('The shared section releases its fixed transform before the CTA',
    state.surfacePosition !== 'fixed' && !state.surfaceTransform,
    { position: state.surfacePosition, transform: state.surfaceTransform });

  // 14. Reverse-scroll through the same section and wheel, checking clean restoration.
  await moveWithLenis(capStart + capDistance * 0.5);
  await capture('13-reverse-through-service-catalogue');
  await moveWithLenis(geometry.forExpansion(0));
  state = await snapshot();
  assert('Reverse scroll restores the settled fourth wheel entry',
    state.title === 'Our Capabilities' && state.capabilitiesCardOpacity > 0.95 && state.surfacePosition === 'fixed', state);
  await capture('14-reverse-to-capabilities-wheel-entry');
  await moveWithLenis(geometry.forTurn(3));
  state = await snapshot();
  assert('Reverse scroll restores MNESA and removes the shared-element styles',
    state.title === 'MNESA' && state.surfacePosition !== 'fixed' && state.surfaceOpacity === '0', state);
  await capture('15-reverse-to-mnesa');

  // Exercise the same journey with real mouse-wheel events through Lenis.
  const wheelTo = async (target) => {
    await page.mouse.move(VIEWPORT.width * 0.75, VIEWPORT.height * 0.5);
    let current = await page.evaluate(() => window.scrollY);
    while (Math.abs(target - current) > 30) {
      const requested = Math.sign(target - current) * Math.min(480, Math.abs(target - current) / 0.95);
      await page.mouse.wheel(0, requested);
      const expected = current + requested * 0.95;
      await page.waitForFunction((goal) => Math.abs(window.scrollY - goal) < 30, expected, { timeout: 5000 });
      current = await page.evaluate(() => window.scrollY);
    }
    await page.waitForTimeout(120);
  };
  await moveWithLenis(0);
  await wheelTo(geometry.forTurn(3));
  const mouseWheelMnesa = await snapshot();
  assert('Real mouse-wheel input reaches MNESA through Lenis and ScrollTrigger', mouseWheelMnesa.title === 'MNESA', mouseWheelMnesa);
  await page.evaluate(() => {
    window.__ostrumBrowserHealth.frameIntervals.length = 0;
    window.__ostrumBrowserHealth.layoutShifts.length = 0;
    window.__ostrumBrowserHealth.longAnimationFrames.length = 0;
  });
  await wheelTo(geometry.forTurn(3.75));
  const mouseWheelCapabilities = await snapshot();
  assert('Real mouse-wheel input advances through the circular drum to Capabilities',
    mouseWheelCapabilities.title === 'Our Capabilities' && mouseWheelCapabilities.wheelTurn > 3.5,
    mouseWheelCapabilities);
  const browserHealth = await page.evaluate(() => {
    const intervals = window.__ostrumBrowserHealth.frameIntervals.slice().sort((a, b) => a - b);
    const percentile = (fraction) => intervals.length
      ? intervals[Math.min(intervals.length - 1, Math.floor(intervals.length * fraction))]
      : 0;
    return {
      sampledFrames: intervals.length,
      frameIntervalP95Ms: percentile(0.95),
      maxFrameIntervalMs: intervals.at(-1) ?? 0,
      intervalsOver50Ms: intervals.filter((interval) => interval > 50).length,
      cumulativeLayoutShift: window.__ostrumBrowserHealth.layoutShifts.reduce((sum, entry) => sum + entry.value, 0),
      layoutShifts: window.__ostrumBrowserHealth.layoutShifts,
      longAnimationFrames: window.__ostrumBrowserHealth.longAnimationFrames,
      maxLongAnimationFrameMs: Math.max(0, ...window.__ostrumBrowserHealth.longAnimationFrames.map((entry) => entry.duration)),
    };
  });
  console.log('Browser health during real wheel interaction', JSON.stringify(browserHealth, null, 2));
  assert('No significant layout shift during the real wheel interaction', browserHealth.cumulativeLayoutShift < 0.1, browserHealth);
  assert('No long animation frames during the real wheel interaction', browserHealth.maxLongAnimationFrameMs <= 50, browserHealth);
  await capture('16-real-wheel-input-capabilities');
  await wheelTo(geometry.forTurn(3));
  const mouseWheelReverse = await snapshot();
  assert('Real reverse mouse-wheel input returns to MNESA', mouseWheelReverse.title === 'MNESA', mouseWheelReverse);

  assert('All page assets load successfully', networkErrors.length === 0, networkErrors);

  assert('No browser console or runtime errors during the journey', errors.length === 0, errors);
  const report = {
    baseUrl: BASE_URL,
    viewport: VIEWPORT,
    geometry,
    capabilitiesMetrics: capMetrics,
    browserHealth,
    assertions,
    errors,
    networkErrors,
    screenshots: fs.readdirSync(ARTIFACTS_DIR).filter((file) => file.endsWith('.png')),
  };
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'end_to_end_journey_audit_report.json'), JSON.stringify(report, null, 2));
  await browser.close();

  const failures = assertions.filter((item) => !item.passed);
  console.log(`\n${assertions.length - failures.length}/${assertions.length} assertions passed; ${failures.length} failed.`);
  if (failures.length) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
