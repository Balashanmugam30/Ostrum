import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'reports/audits/artifacts';
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

async function verifyRoute(browser, routePath, name, showCTA, viewport = { width: 1440, height: 900 }) {
  const page = await browser.newPage({ viewport });
  console.log(`\n======================================================`);
  console.log(`TESTING ROUTE: ${routePath} (${name}) at ${viewport.width}x${viewport.height}`);
  console.log(`======================================================`);

  await page.goto(`http://localhost:3000${routePath}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Inspect elements
  const layout = await page.evaluate((showCTA) => {
    const container = document.querySelector('#theatre-stage-wrapper');
    const curtain = document.querySelector('[data-testid="theatre-curtain-panel"]');
    const mask = document.querySelector('[data-testid="legal-curtain-mask"]');
    const stage = document.querySelector('[data-testid="theatre-stage-panel"]');
    const cta = document.querySelector('[data-testid="liquid-sand-cta-section"]');

    const getComputed = (el) => {
      if (!el) return null;
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        height: cs.height,
        minHeight: cs.minHeight,
        position: cs.position,
        zIndex: cs.zIndex,
        opacity: cs.opacity,
        visibility: cs.visibility,
        transform: cs.transform,
      };
    };

    return {
      container: getComputed(container),
      curtain: getComputed(curtain),
      mask: getComputed(mask),
      stage: getComputed(stage),
      cta: getComputed(cta),
      containerTopDoc: container ? container.getBoundingClientRect().top + window.scrollY : null,
      stageHeight: stage ? stage.offsetHeight : null,
    };
  }, showCTA);

  console.log(`Initial styles:`);
  console.log(`  Container BG: ${layout.container?.bg}`);
  console.log(`  Curtain BG:   ${layout.curtain?.bg}`);
  console.log(`  Curtain H:    ${layout.curtain?.height}, minH: ${layout.curtain?.minHeight}`);
  console.log(`  Mask BG:      ${layout.mask ? layout.mask.bg : 'N/A'}`);
  console.log(`  Stage BG:     ${layout.stage?.bg}`);

  // Color assertion
  if (showCTA) {
    if (layout.curtain?.bg !== 'rgb(5, 5, 5)') {
      throw new Error(`Homepage CTA curtain must be rgb(5, 5, 5), got ${layout.curtain?.bg}`);
    }
  } else {
    if (layout.curtain?.bg !== 'rgb(250, 247, 242)') {
      throw new Error(`Legal curtain must be rgb(250, 247, 242) (#FAF7F2), got ${layout.curtain?.bg}`);
    }
    if (layout.mask?.bg !== 'rgb(250, 247, 242)') {
      throw new Error(`Legal curtain mask must be rgb(250, 247, 242) (#FAF7F2), got ${layout.mask?.bg}`);
    }
  }

  // Scroll until theatre stage wrapper is near top
  const containerTop = layout.containerTopDoc;
  console.log(`Container top is at ${containerTop}`);

  // Beat 1: Immediately before transition (50px before container hits top)
  const posBefore = Math.max(0, containerTop - 50);
  await page.evaluate((y) => window.scrollTo(0, y), posBefore);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${ARTIFACTS_DIR}/${name}_1_before.png` });
  console.log(`Captured ${name}_1_before.png at scrollY = ${posBefore}`);

  // Beat 2: Start of reveal (container pinned at top)
  const posStart = containerTop;
  await page.evaluate((y) => window.scrollTo(0, y), posStart);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${ARTIFACTS_DIR}/${name}_2_start.png` });
  console.log(`Captured ${name}_2_start.png at scrollY = ${posStart}`);

  // Beat 3: Mid-reveal (halfway through lift)
  const liftDistance = viewport.height;
  const posMid = containerTop + Math.round(liftDistance * 0.5);
  await page.evaluate((y) => window.scrollTo(0, y), posMid);
  await page.waitForTimeout(400);

  const midState = await page.evaluate(() => {
    const curtain = document.querySelector('[data-testid="theatre-curtain-panel"]');
    const stage = document.querySelector('[data-testid="theatre-stage-panel"]');
    return {
      curtainTransform: curtain ? window.getComputedStyle(curtain).transform : null,
      curtainRect: curtain ? curtain.getBoundingClientRect() : null,
      stageRect: stage ? stage.getBoundingClientRect() : null,
    };
  });
  console.log(`Mid-reveal transform: ${midState.curtainTransform}`);
  console.log(`Mid-reveal curtain top: ${midState.curtainRect?.top}, bottom: ${midState.curtainRect?.bottom}`);
  await page.screenshot({ path: `${ARTIFACTS_DIR}/${name}_3_mid.png` });
  console.log(`Captured ${name}_3_mid.png at scrollY = ${posMid}`);

  // Beat 4: Almost lifted (90% through lift)
  const posAlmost = containerTop + Math.round(liftDistance * 0.9);
  await page.evaluate((y) => window.scrollTo(0, y), posAlmost);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${ARTIFACTS_DIR}/${name}_4_almost_lifted.png` });
  console.log(`Captured ${name}_4_almost_lifted.png at scrollY = ${posAlmost}`);

  // Beat 5: Fully revealed (100% lift)
  const posEnd = containerTop + liftDistance + 50;
  await page.evaluate((y) => window.scrollTo(0, y), posEnd);
  await page.waitForTimeout(400);

  const endState = await page.evaluate(() => {
    const curtain = document.querySelector('[data-testid="theatre-curtain-panel"]');
    const stage = document.querySelector('[data-testid="theatre-stage-panel"]');
    const centerEl = document.elementFromPoint(720, 450);
    return {
      curtainVisibility: curtain ? window.getComputedStyle(curtain).visibility : null,
      stageRect: stage ? stage.getBoundingClientRect() : null,
      centerEl: centerEl ? `${centerEl.tagName}${centerEl.id ? '#' + centerEl.id : ''} [bg: ${window.getComputedStyle(centerEl).backgroundColor}]` : null,
    };
  });
  console.log(`End state: Curtain visibility: ${endState.curtainVisibility}, Center element: ${endState.centerEl}`);
  await page.screenshot({ path: `${ARTIFACTS_DIR}/${name}_5_fully_revealed.png` });
  console.log(`Captured ${name}_5_fully_revealed.png at scrollY = ${posEnd}`);

  // Beat 6: Reverse test (scroll back up to mid-reveal and verify smooth recovery)
  await page.evaluate((y) => window.scrollTo(0, y), posMid);
  await page.waitForTimeout(400);
  const revState = await page.evaluate(() => {
    const curtain = document.querySelector('[data-testid="theatre-curtain-panel"]');
    return {
      curtainVisibility: curtain ? window.getComputedStyle(curtain).visibility : null,
      curtainTransform: curtain ? window.getComputedStyle(curtain).transform : null,
    };
  });
  console.log(`Reverse state at mid: visibility: ${revState.curtainVisibility}, transform: ${revState.curtainTransform}`);
  if (revState.curtainVisibility !== 'visible') {
    throw new Error(`Reverse scroll failed to restore curtain visibility! Got ${revState.curtainVisibility}`);
  }
  await page.screenshot({ path: `${ARTIFACTS_DIR}/${name}_6_reversed_mid.png` });
  console.log(`Captured ${name}_6_reversed_mid.png`);

  await page.close();
}

async function runAllVerifications() {
  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Homepage Desktop
    await verifyRoute(browser, '/', 'desktop_homepage', true, { width: 1440, height: 900 });

    // 2. Terms Desktop
    await verifyRoute(browser, '/terms-and-conditions', 'desktop_terms', false, { width: 1440, height: 900 });

    // 3. Privacy Desktop
    await verifyRoute(browser, '/privacy-policy', 'desktop_privacy', false, { width: 1440, height: 900 });

    // 4. Mobile Verifications
    await verifyRoute(browser, '/', 'mobile_homepage', true, { width: 390, height: 844 });
    await verifyRoute(browser, '/terms-and-conditions', 'mobile_terms', false, { width: 390, height: 844 });
    await verifyRoute(browser, '/privacy-policy', 'mobile_privacy', false, { width: 390, height: 844 });

    console.log('\n>>> ALL 6 VERIFICATION RUNS PASSED CLEANLY! <<<');
  } finally {
    await browser.close();
  }
}

runAllVerifications().catch(err => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
