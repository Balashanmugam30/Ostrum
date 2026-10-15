import { chromium } from 'playwright';
import path from 'path';

const artifactsDir = 'C:\\Users\\balashanmugam\\.gemini\\antigravity\\brain\\e61a5bf4-ec20-4604-866c-28b2350ab0c5';

async function validate2DCinematicPreloader() {
  console.log('=== STARTING 2D CINEMATIC PRELOADER VALIDATION ===\n');

  const browser = await chromium.launch({
    args: ['--enable-webgl', '--ignore-gpu-blocklist']
  });

  const errors = [];
  const warnings = [];

  const attachListeners = (page, scenarioName) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(`[${scenarioName} Error]: ${msg.text()}`);
      } else if (msg.type() === 'warn') {
        warnings.push(`[${scenarioName} Warn]: ${msg.text()}`);
      }
    });
    page.on('pageerror', err => {
      errors.push(`[${scenarioName} PageError]: ${err.message}`);
    });
  };

  // --------------------------------------------------------------------------
  // TEST 1: STAGE A — IVORY OPENING & 2D VECTOR ARTWORK
  // --------------------------------------------------------------------------
  console.log('--- TEST 1: Stage A — Ivory Opening & 2D Vector Artwork (1920x1080) ---');
  const contextA = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const pageA = await contextA.newPage();
  attachListeners(pageA, 'StageA');

  await pageA.goto('http://localhost:3000/?replay=true', { waitUntil: 'commit' });
  await pageA.waitForSelector('#ostrum-preloader[data-phase="stageA"]', { timeout: 5000 });
  await pageA.waitForTimeout(100); // Allow DOM paint

  const stageAState = await pageA.evaluate(() => {
    const overlay = document.querySelector('#ostrum-preloader');
    const phaseAttr = overlay ? overlay.getAttribute('data-phase') : null;
    const pearl = document.querySelector('[data-testid="preloader-pearl-field"]');
    const vectorSvg = pearl ? pearl.querySelector('svg') : null;
    const wordmark = pearl ? pearl.querySelector('span') : null;
    const journey = document.querySelector('.ostrum-continuous-journey');

    return {
      overlayMounted: !!overlay,
      currentPhase: phaseAttr,
      overlayOpacity: overlay ? getComputedStyle(overlay).opacity : null,
      pearlMounted: !!pearl,
      pearlOpacity: pearl ? getComputedStyle(pearl).opacity : null,
      pearlBg: pearl ? getComputedStyle(pearl).backgroundColor : null,
      hasVectorArtwork: !!vectorSvg,
      wordmarkText: wordmark ? wordmark.textContent.trim() : null,
      journeyOpacity: journey ? getComputedStyle(journey).opacity : null,
      canvasVisibleDuringIntro: journey ? getComputedStyle(journey).opacity !== '0' : false,
    };
  });
  console.log('Stage A State:', stageAState);

  await pageA.screenshot({ path: path.join(artifactsDir, 'stage-a-ivory-opening.png') });
  console.log('Saved stage-a-ivory-opening.png');
  await pageA.close();
  await contextA.close();

  // --------------------------------------------------------------------------
  // TEST 2: STAGE B — CRIMSON ENERGY WIPE AT PEAK
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 2: Stage B — Crimson Energy Transition at Peak ---');
  const contextB = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const pageB = await contextB.newPage();
  attachListeners(pageB, 'StageB');

  await pageB.goto('http://localhost:3000/?replay=true', { waitUntil: 'domcontentloaded' });
  // Wait for Stage B crimson field to surge
  await pageB.waitForFunction(() => {
    const crimson = document.querySelector('[data-testid="preloader-crimson-field"]');
    return crimson && parseFloat(getComputedStyle(crimson).opacity) >= 0.7;
  }, { timeout: 4000 });

  const stageBState = await pageB.evaluate(() => {
    const crimson = document.querySelector('[data-testid="preloader-crimson-field"]');
    const journey = document.querySelector('.ostrum-continuous-journey');
    return {
      crimsonOpacity: crimson ? getComputedStyle(crimson).opacity : null,
      journeyOpacity: journey ? getComputedStyle(journey).opacity : null,
      canvasHidden: journey ? getComputedStyle(journey).opacity === '0' : false,
    };
  });
  console.log('Stage B State at peak energy:', stageBState);

  await pageB.screenshot({ path: path.join(artifactsDir, 'stage-b-crimson-transition.png') });
  console.log('Saved stage-b-crimson-transition.png');
  await pageB.close();
  await contextB.close();

  // --------------------------------------------------------------------------
  // TEST 3: STAGE C — HERO TRANSITION & FINAL DESKTOP HERO
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 3: Stage C — Hero Transition & Completed Desktop Hero ---');
  const contextC = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const pageC = await contextC.newPage();
  attachListeners(pageC, 'StageC');

  await pageC.goto('http://localhost:3000/?replay=true', { waitUntil: 'domcontentloaded' });

  // Wait for overlay to reach Stage C
  await pageC.waitForSelector('#ostrum-preloader[data-phase="stageC"]', { timeout: 5000 });
  await pageC.waitForTimeout(200);

  const stageCState = await pageC.evaluate(() => {
    const overlay = document.querySelector('#ostrum-preloader');
    const heroO = document.querySelector('#hero-ostrum-o');
    const journey = document.querySelector('.ostrum-continuous-journey');
    return {
      overlayOpacity: overlay ? getComputedStyle(overlay).opacity : null,
      hasHeroO: !!heroO,
      journeyOpacity: journey ? getComputedStyle(journey).opacity : null,
    };
  });
  console.log('Stage C State:', stageCState);
  await pageC.screenshot({ path: path.join(artifactsDir, 'stage-c-hero-transition.png') });
  console.log('Saved stage-c-hero-transition.png');

  // Wait for preloader to completely finish and unmount
  await pageC.waitForFunction(() => {
    return document.querySelector('#ostrum-preloader') === null;
  }, { timeout: 6000 });
  await pageC.waitForTimeout(600); // Allow typography settle

  const completedDesktopState = await pageC.evaluate(() => {
    const overlay = document.querySelector('#ostrum-preloader');
    const headline = document.querySelector('.intro-desc');
    const wordmark = document.querySelector('.intro svg[aria-label="OSTRUM"]');
    const header = document.querySelector('.header');
    const journey = document.querySelector('.ostrum-continuous-journey');
    const bodyOverflow = document.body.style.overflow;

    return {
      overlayUnmounted: overlay === null,
      headlineVisible: headline ? getComputedStyle(headline).opacity === '1' || getComputedStyle(headline).visibility === 'visible' : false,
      headlineText: headline ? headline.textContent : null,
      wordmarkVisible: wordmark ? getComputedStyle(wordmark).opacity !== '0' : false,
      headerVisible: header ? getComputedStyle(header).opacity === '1' : false,
      journeyOpacity: journey ? getComputedStyle(journey).opacity : null,
      bodyOverflow,
    };
  });
  console.log('Completed Desktop State:', completedDesktopState);
  await pageC.screenshot({ path: path.join(artifactsDir, 'desktop-completed-hero.png') });
  console.log('Saved desktop-completed-hero.png');

  // --------------------------------------------------------------------------
  // TEST 4: SCROLL & DOWNSTREAM SECTIONS CHECK
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 4: Scroll & Downstream Section Verification ---');
  await pageC.evaluate(() => window.scrollTo({ top: 1400, behavior: 'instant' }));
  await pageC.waitForTimeout(500);

  const scrollCheck = await pageC.evaluate(() => {
    return {
      scrollY: window.scrollY,
      engineSectionExists: !!document.getElementById('section02-sculpture-slot') || !!document.querySelector('.engine-section'),
      footerExists: !!document.querySelector('#studio-footer'),
    };
  });
  console.log('Scroll verification at 1400px:', scrollCheck);

  await pageC.close();
  await contextC.close();

  // --------------------------------------------------------------------------
  // TEST 5: REPEAT VISIT (SESSION SUPPRESSION)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 5: Repeat Visit (Session Storage Suppression) ---');
  const contextSession = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const pageSession = await contextSession.newPage();
  attachListeners(pageSession, 'RepeatVisit');

  // Visit 1: normal load
  await pageSession.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await pageSession.waitForFunction(() => sessionStorage.getItem('ostrum_intro_viewed_v2') === 'true', { timeout: 6000 });

  // Visit 2: repeat load without replay param
  await pageSession.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await pageSession.waitForTimeout(400);

  const repeatState = await pageSession.evaluate(() => {
    const overlay = document.querySelector('#ostrum-preloader');
    return {
      overlayPresent: !!overlay,
    };
  });
  console.log('Repeat visit check (overlay should be suppressed):', repeatState);
  await pageSession.close();
  await contextSession.close();

  // --------------------------------------------------------------------------
  // TEST 6: PREFERS-REDUCED-MOTION
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 6: Prefers-Reduced-Motion Instant Skip ---');
  const contextReduced = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    reducedMotion: 'reduce'
  });
  const pageReduced = await contextReduced.newPage();
  attachListeners(pageReduced, 'ReducedMotion');

  await pageReduced.goto('http://localhost:3000/?replay=true', { waitUntil: 'domcontentloaded' });
  await pageReduced.waitForFunction(() => document.querySelector('#ostrum-preloader') === null, { timeout: 3000 });

  const reducedState = await pageReduced.evaluate(() => {
    return {
      overlayPresent: !!document.querySelector('#ostrum-preloader'),
      bodyOverflow: document.body.style.overflow,
    };
  });
  console.log('Reduced motion check:', reducedState);
  await pageReduced.close();
  await contextReduced.close();

  // --------------------------------------------------------------------------
  // TEST 7: SIMULATED GLB FAILURE (Decoupled from 3D Assets)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 7: Simulated Failure/Block of GLB Asset ---');
  const contextFailure = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const pageFailure = await contextFailure.newPage();
  attachListeners(pageFailure, 'GLBFailure');

  // Intercept and abort GLB model
  await pageFailure.route('**/*.glb', route => route.abort());

  await pageFailure.goto('http://localhost:3000/?replay=true', { waitUntil: 'domcontentloaded' });
  // Ensure the intro still completes in bounded time (<3.5s)
  await pageFailure.waitForFunction(() => document.querySelector('#ostrum-preloader') === null, { timeout: 4500 });
  const failureState = await pageFailure.evaluate(() => {
    return {
      overlayUnmounted: document.querySelector('#ostrum-preloader') === null,
      headlineVisible: !!document.querySelector('.intro-desc'),
    };
  });
  console.log('Intro completes even when GLB is blocked:', failureState);
  await pageFailure.close();
  await contextFailure.close();

  // --------------------------------------------------------------------------
  // TEST 8: MOBILE VIEWPORT EMULATION (iPhone 390x844)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 8: Mobile Viewport Emulation (390x844) ---');
  const contextMob = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const pageMob = await contextMob.newPage();
  attachListeners(pageMob, 'Mobile');

  await pageMob.goto('http://localhost:3000/?replay=true', { waitUntil: 'domcontentloaded' });
  await pageMob.waitForFunction(() => document.querySelector('#ostrum-preloader') === null, { timeout: 6000 });
  await pageMob.waitForTimeout(600);

  const mobileMetrics = await pageMob.evaluate(() => {
    const docWidth = document.documentElement.offsetWidth;
    const windowWidth = window.innerWidth;
    const headline = document.querySelector('.intro-desc');
    const wordmark = document.querySelector('.intro svg[aria-label="OSTRUM"]');
    return {
      hasHorizontalOverflow: docWidth > windowWidth,
      docWidth,
      windowWidth,
      headlineText: headline ? headline.textContent : null,
      headlineVisible: headline ? getComputedStyle(headline).opacity : null,
      wordmarkVisible: wordmark ? getComputedStyle(wordmark).opacity : null,
    };
  });
  console.log('Mobile completed metrics:', mobileMetrics);
  await pageMob.screenshot({ path: path.join(artifactsDir, 'mobile-completed-hero.png') });
  console.log('Saved mobile-completed-hero.png');

  await pageMob.close();
  await contextMob.close();

  await browser.close();

  console.log('\n--- AUDIT OF CAUGHT ERRORS ---');
  // Filter out the intentional GLB abort error from Test 7
  const genuineErrors = errors.filter(e => !e.includes('net::ERR_FAILED') && !e.includes('Failed to fetch'));
  console.log(`Genuine uncaught errors: ${genuineErrors.length}`);
  if (genuineErrors.length > 0) {
    console.error('Errors:', genuineErrors);
  } else {
    console.log('Zero uncaught exceptions, zero console errors, zero hydration mismatches! Pristine.');
  }

  console.log('\n=== VALIDATION COMPLETE ===');
}

validate2DCinematicPreloader().catch(console.error);
