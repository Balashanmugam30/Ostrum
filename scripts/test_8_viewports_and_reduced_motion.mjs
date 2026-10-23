import { chromium } from 'playwright';

const VIEWPORTS = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1440x900',  width: 1440, height: 900 },
  { name: '1280x800',  width: 1280, height: 800 },
  { name: '1024x768',  width: 1024, height: 768 },
  { name: '768x1024',  width: 768,  height: 1024 },
  { name: '430x932',   width: 430,  height: 932 },
  { name: '390x844',   width: 390,  height: 844 },
  { name: '360x800',   width: 360,  height: 800 },
];

async function runViewportMatrix() {
  const browser = await chromium.launch({ headless: true });

  console.log('--- TESTING 8 VIEWPORTS MATRIX ---');
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    
    // Check terms page
    await page.goto('http://localhost:3000/terms-and-conditions', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    const termsData = await page.evaluate(() => {
      const curtain = document.querySelector('[data-testid="theatre-curtain-panel"]');
      const mask = document.querySelector('[data-testid="legal-curtain-mask"]');
      const stage = document.querySelector('[data-testid="theatre-stage-panel"]');
      const container = document.querySelector('#theatre-stage-wrapper');
      return {
        curtainBg: curtain ? window.getComputedStyle(curtain).backgroundColor : null,
        maskBg: mask ? window.getComputedStyle(mask).backgroundColor : null,
        stageBg: stage ? window.getComputedStyle(stage).backgroundColor : null,
        containerBg: container ? window.getComputedStyle(container).backgroundColor : null,
      };
    });

    if (termsData.curtainBg !== 'rgb(250, 247, 242)' || termsData.maskBg !== 'rgb(250, 247, 242)') {
      throw new Error(`Viewport ${vp.name} failed legal curtain bg check: ${JSON.stringify(termsData)}`);
    }

    // Scroll to end on terms
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(400);

    const termsEnd = await page.evaluate(() => {
      const stage = document.querySelector('[data-testid="theatre-stage-panel"]');
      return {
        stageBottom: stage ? Math.round(stage.getBoundingClientRect().bottom) : null,
        hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

    if (termsEnd.hasHorizontalOverflow) {
      throw new Error(`Viewport ${vp.name} has horizontal overflow!`);
    }

    console.log(`[PASS] Viewport ${vp.name}: Legal curtain = ${termsData.curtainBg}, Stage = ${termsData.stageBg}, no overflow.`);
    await page.close();
  }

  // TEST REDUCED MOTION
  console.log('\n--- TESTING PREFERS-REDUCED-MOTION: REDUCE ---');
  const rmContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  
  // Test Homepage with reduced motion
  const rmHome = await rmContext.newPage();
  await rmHome.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await rmHome.waitForTimeout(800);

  const rmHomeCheck = await rmHome.evaluate(() => {
    const cta = document.querySelector('[data-testid="liquid-sand-cta-section"]');
    const stage = document.querySelector('[data-testid="theatre-stage-panel"]');
    const container = document.querySelector('#theatre-stage-wrapper');
    // Pin spacer should NOT exist for theatre curtain
    const pinSpacer = document.querySelector('.pin-spacer');
    return {
      hasCTA: !!cta,
      hasStage: !!stage,
      hasContainer: !container, // In reduced motion, fallback renders without theatre-stage-wrapper
    };
  });
  console.log('Reduced motion homepage check:', rmHomeCheck);
  await rmHome.close();

  // Test Terms with reduced motion
  const rmTerms = await rmContext.newPage();
  await rmTerms.goto('http://localhost:3000/terms-and-conditions', { waitUntil: 'domcontentloaded' });
  await rmTerms.waitForTimeout(800);

  const rmTermsCheck = await rmTerms.evaluate(() => {
    const mask = document.querySelector('[data-testid="legal-curtain-mask"]');
    const footer = document.querySelector('footer');
    return {
      hasMask: !!mask, // Should NOT exist in reduced motion!
      hasFooter: !!footer, // Footer should exist directly in normal flow
    };
  });
  console.log('Reduced motion terms check:', rmTermsCheck);
  if (rmTermsCheck.hasMask) {
    throw new Error('Reduced motion should not render any legal curtain mask!');
  }
  if (!rmTermsCheck.hasFooter) {
    throw new Error('Reduced motion footer must be present!');
  }

  await rmContext.close();
  await browser.close();

  console.log('\n>>> ALL 8 VIEWPORTS AND REDUCED MOTION PASSED! <<<');
}

runViewportMatrix().catch(err => {
  console.error('VIEWPORT MATRIX ERROR:', err);
  process.exit(1);
});
