import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = path.resolve('reports/audits/artifacts');
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

async function runAudit() {
  console.log('===============================================================');
  console.log('OSTRUM — FINAL LEGAL-CURTAIN, PROJECT ARTWORK & BRAND AUDIT');
  console.log('===============================================================\n');

  const browser = await chromium.launch({ headless: true });
  const results = {
    timestamp: new Date().toISOString(),
    termsCurtain: {},
    privacyCurtain: {},
    homepageCTARegression: {},
    selectedWorkArtwork: {},
    responsiveMatrix: {},
    reducedMotion: {},
    passedAll: false,
  };

  const VIEWPORTS = [
    { name: '1920x1080 Desktop Workstation', width: 1920, height: 1080 },
    { name: '1440x900 Standard Desktop', width: 1440, height: 900 },
    { name: '1280x800 Compact Laptop', width: 1280, height: 800 },
    { name: '1024x768 Landscape Tablet', width: 1024, height: 768 },
    { name: '768x1024 Portrait Tablet', width: 768, height: 1024 },
    { name: '430x932 iPhone 14/15 Pro Max', width: 430, height: 932 },
    { name: '390x844 iPhone 12/13/14', width: 390, height: 844 },
    { name: '360x800 Small Android', width: 360, height: 800 },
  ];

  // =========================================================================
  // 1. AUDIT TERMS & CONDITIONS CURTAIN REVEAL
  // =========================================================================
  console.log('--- 1. Auditing /terms-and-conditions Curtain Reveal ---');
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', err => consoleErrors.push(err.message));

    await page.goto('http://localhost:3000/terms-and-conditions', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Initial measurements
    const geo = await page.evaluate(() => {
      const sec16 = document.getElementById('contact');
      const article = document.querySelector('article');
      const legalWrapper = document.querySelector('.legal-page > div:first-child');
      const stageWrapper = document.getElementById('theatre-stage-wrapper');
      const curtain = document.querySelector('[data-testid="theatre-curtain-panel"]');
      const stage = document.querySelector('[data-testid="theatre-stage-panel"]');
      const tiles = document.querySelector('[data-testid="footer-tile-email"]');

      const sec16Rect = sec16?.getBoundingClientRect();
      const wrapRect = legalWrapper?.getBoundingClientRect();
      const stageRect = stageWrapper?.getBoundingClientRect();

      return {
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
        scrollHeight: document.documentElement.scrollHeight,
        gapBetweenLegalAndStage: stageRect.top - wrapRect.bottom,
        gapBetweenSection16AndStage: stageRect.top - sec16Rect.bottom,
        sec16TopDoc: sec16Rect.top + window.scrollY,
        stageWrapperTopDoc: stageRect.top + window.scrollY,
      };
    });

    console.log(`Measured Gap Between Legal Wrapper and Stage: ${geo.gapBetweenLegalAndStage.toFixed(2)}px`);
    console.log(`Measured Gap Between Section 16 Bottom and Stage: ${geo.gapBetweenSection16AndStage.toFixed(2)}px`);

    // Scroll so section 16 is at top
    await page.evaluate((y) => window.scrollTo(0, y), geo.sec16TopDoc);
    await page.waitForTimeout(500);

    // Check if any burgundy peeks out in viewport when section 16 is at top
    const peekCheckBeforeReveal = await page.evaluate(() => {
      const stageWrapper = document.getElementById('theatre-stage-wrapper');
      const curtain = document.querySelector('[data-testid="theatre-curtain-panel"]');
      const tiles = document.querySelector('[data-testid="footer-tile-email"]');
      const rCurtain = curtain?.getBoundingClientRect();
      const rTiles = tiles?.getBoundingClientRect();
      const rWrapper = stageWrapper?.getBoundingClientRect();

      // Check pixel colors across the bottom 50px of the viewport
      // If curtain covers viewport, rCurtain.bottom >= window.innerHeight
      return {
        scrollY: window.scrollY,
        wrapperTop: rWrapper?.top,
        curtainTop: rCurtain?.top,
        curtainBottom: rCurtain?.bottom,
        curtainCoversToViewportBottom: rCurtain?.bottom >= window.innerHeight,
        tilesTop: rTiles?.top,
        tilesVisibleInViewport: rTiles ? (rTiles.top < window.innerHeight && rTiles.bottom > 0) : false,
      };
    });

    console.log('Peek check when Section 16 is at top:', peekCheckBeforeReveal);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'terms-before-reveal-desktop.png') });

    // ScrollTrigger info
    const stInfo = await page.evaluate(() => {
      const st = window.ScrollTrigger?.getById('theatre-curtain-reveal-legal');
      return st ? { start: st.start, end: st.end, totalDistance: st.end - st.start } : null;
    });
    console.log('ScrollTrigger Info (Terms):', stInfo);

    // Progress testing: 0, 0.25, 0.50, 0.75, 1.0
    const progressSamples = [];
    if (stInfo) {
      for (const p of [0, 0.25, 0.5, 0.75, 1.0]) {
        const targetScroll = stInfo.start + stInfo.totalDistance * p;
        await page.evaluate((y) => window.scrollTo(0, y), targetScroll);
        await page.waitForTimeout(300);

        const sample = await page.evaluate((pVal) => {
          const curtain = document.querySelector('[data-testid="theatre-curtain-panel"]');
          const tiles = document.querySelector('[data-testid="footer-tile-email"]');
          const st = window.ScrollTrigger?.getById('theatre-curtain-reveal-legal');
          const cRect = curtain?.getBoundingClientRect();
          const tRect = tiles?.getBoundingClientRect();

          // Hit test: what element is at (x=200, y=200) or at tiles center?
          let hitElement = null;
          if (tRect) {
            const hit = document.elementFromPoint(tRect.left + 50, tRect.top + 50);
            hitElement = hit ? hit.getAttribute('data-testid') || hit.tagName : null;
          }

          return {
            p: pVal,
            scrollY: window.scrollY,
            stProgress: st?.progress,
            curtainTop: cRect?.top,
            curtainBottom: cRect?.bottom,
            curtainVisibility: window.getComputedStyle(curtain).visibility,
            curtainPointerEvents: window.getComputedStyle(curtain).pointerEvents,
            curtainTransform: window.getComputedStyle(curtain).transform,
            tilesTop: tRect?.top,
            hitElementOnTiles: hitElement,
          };
        }, p);

        progressSamples.push(sample);
        if (p === 0.5) {
          await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'terms-reveal-midpoint-desktop.png') });
        } else if (p === 1.0) {
          await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'terms-footer-final-desktop.png') });
        }
      }
    }

    // Reverse scroll check: scroll back to start of trigger and allow GSAP scrub (0.5s) to settle
    await page.evaluate((y) => window.scrollTo(0, y), stInfo.start);
    await page.waitForTimeout(750);
    const reverseCheck = await page.evaluate(() => {
      const curtain = document.querySelector('[data-testid="theatre-curtain-panel"]');
      const cRect = curtain?.getBoundingClientRect();
      return {
        curtainVisibility: window.getComputedStyle(curtain).visibility,
        curtainTop: cRect?.top,
        curtainBottom: cRect?.bottom,
        covered: Math.abs(cRect?.top || 0) <= 8 && (cRect?.bottom || 0) >= window.innerHeight - 10,
      };
    });

    results.termsCurtain = {
      geo,
      peekCheckBeforeReveal,
      stInfo,
      progressSamples,
      reverseCheck,
      consoleErrors,
      passed: (
        geo.gapBetweenSection16AndStage >= 20 &&
        geo.gapBetweenSection16AndStage <= 48 &&
        peekCheckBeforeReveal.curtainCoversToViewportBottom &&
        progressSamples[0]?.curtainBottom >= 890 &&
        progressSamples[0]?.hitElementOnTiles !== 'footer-tile-email' && // Curtain blocks tile at progress 0
        progressSamples[4]?.curtainVisibility === 'hidden' &&
        progressSamples[4]?.curtainPointerEvents === 'none' &&
        reverseCheck.covered
      ),
    };

    console.log(`Terms Curtain Reveal Status: ${results.termsCurtain.passed ? 'PASS' : 'FAIL'}`);
    await context.close();
  }

  // =========================================================================
  // 2. AUDIT PRIVACY POLICY CURTAIN REVEAL
  // =========================================================================
  console.log('\n--- 2. Auditing /privacy-policy Curtain Reveal ---');
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto('http://localhost:3000/privacy-policy', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const geo = await page.evaluate(() => {
      const sec15 = document.getElementById('contact');
      const stageWrapper = document.getElementById('theatre-stage-wrapper');
      const sec15Rect = sec15?.getBoundingClientRect();
      const stageRect = stageWrapper?.getBoundingClientRect();
      return {
        gapBetweenSection15AndStage: stageRect.top - sec15Rect.bottom,
        sec15TopDoc: sec15Rect.top + window.scrollY,
      };
    });

    console.log(`Privacy gap: ${geo.gapBetweenSection15AndStage.toFixed(2)}px`);

    const stInfo = await page.evaluate(() => {
      const st = window.ScrollTrigger?.getById('theatre-curtain-reveal-legal');
      return st ? { start: st.start, end: st.end, totalDistance: st.end - st.start } : null;
    });

    // Scroll to section 15
    await page.evaluate((y) => window.scrollTo(0, y), geo.sec15TopDoc);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'privacy-before-reveal-desktop.png') });

    // Scroll to midpoint
    await page.evaluate((y) => window.scrollTo(0, y), stInfo.start + stInfo.totalDistance * 0.5);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'privacy-reveal-midpoint-desktop.png') });

    // Scroll to end
    await page.evaluate((y) => window.scrollTo(0, y), stInfo.end);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'privacy-footer-final-desktop.png') });

    const endCheck = await page.evaluate(() => {
      const curtain = document.querySelector('[data-testid="theatre-curtain-panel"]');
      const tiles = document.querySelector('[data-testid="footer-tile-email"]');
      const wordmark = document.querySelector('.bwf-word');
      return {
        curtainVisibility: window.getComputedStyle(curtain).visibility,
        tilesVisible: !!tiles && tiles.getBoundingClientRect().top < window.innerHeight,
        wordmarkPresent: !!wordmark,
      };
    });

    results.privacyCurtain = {
      geo,
      endCheck,
      passed: geo.gapBetweenSection15AndStage >= 20 && geo.gapBetweenSection15AndStage <= 48 && endCheck.curtainVisibility === 'hidden' && endCheck.tilesVisible,
    };
    console.log(`Privacy Curtain Reveal Status: ${results.privacyCurtain.passed ? 'PASS' : 'FAIL'}`);
    await context.close();
  }

  // =========================================================================
  // 3. HOMEPAGE CTA-TO-FOOTER REVEAL REGRESSION TEST
  // =========================================================================
  console.log('\n--- 3. Auditing Homepage CTA-to-Footer Reveal Regression ---');
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const ctaCheck = await page.evaluate(() => {
      const cta = document.querySelector('[data-testid="liquid-sand-cta-section"]');
      const curtain = document.querySelector('[data-testid="theatre-curtain-panel"]');
      const st = window.ScrollTrigger?.getById('theatre-curtain-reveal-cta');
      return {
        ctaPresent: !!cta,
        curtainBg: curtain ? window.getComputedStyle(curtain).backgroundColor : null,
        stStart: st?.start,
        stEnd: st?.end,
      };
    });

    console.log('Homepage CTA Check:', ctaCheck);

    if (ctaCheck.stStart) {
      // Scroll to start of CTA pin
      await page.evaluate((y) => window.scrollTo(0, y), ctaCheck.stStart);
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'homepage-cta-before-reveal-desktop.png') });

      // Scroll to midpoint
      await page.evaluate((y) => window.scrollTo(0, y), ctaCheck.stStart + (ctaCheck.stEnd - ctaCheck.stStart) * 0.5);
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'homepage-cta-reveal-midpoint-desktop.png') });

      // Scroll to fully revealed
      await page.evaluate((y) => window.scrollTo(0, y), ctaCheck.stEnd);
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'homepage-footer-final-desktop.png') });
    }

    results.homepageCTARegression = {
      ctaCheck,
      passed: ctaCheck.ctaPresent && ctaCheck.curtainBg === 'rgb(5, 5, 5)',
    };
    console.log(`Homepage CTA Reveal Status: ${results.homepageCTARegression.passed ? 'PASS' : 'FAIL'}`);
    await context.close();
  }

  // =========================================================================
  // 4. SELECTED WORK ARTWORK & WHEEL TEST
  // =========================================================================
  console.log('\n--- 4. Auditing Selected Work Thumbnails in WorksWheel ---');
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Scroll to Selected Work section
    const wheelY = await page.evaluate(() => {
      const wheel = document.getElementById('selected-work');
      return wheel ? wheel.getBoundingClientRect().top + window.scrollY : null;
    });

    if (wheelY) {
      await page.evaluate((y) => window.scrollTo(0, y + 200), wheelY);
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'selected-work-wheel-desktop.png') });
    }

    // Inspect the 3 images directly in DOM and via network
    const imageAudits = await page.evaluate(async () => {
      const checkImage = (src) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve({
            src,
            loaded: true,
            width: img.naturalWidth,
            height: img.naturalHeight,
            aspectRatio: (img.naturalWidth / img.naturalHeight).toFixed(3),
          });
          img.onerror = () => resolve({ src, loaded: false });
          img.src = src;
        });
      };

      const tmr = await checkImage('/images/works/tmr-ai-car-care.jpg');
      const saraswati = await checkImage('/images/works/saraswati-driving-school.jpg');
      const mnesa = await checkImage('/images/works/mnesa.jpg');

      return { tmr, saraswati, mnesa };
    });

    console.log('Image Audit Results:', JSON.stringify(imageAudits, null, 2));

    results.selectedWorkArtwork = {
      imageAudits,
      passed: (
        imageAudits.tmr.loaded && imageAudits.tmr.width > 500 &&
        imageAudits.saraswati.loaded && imageAudits.saraswati.width > 500 &&
        imageAudits.mnesa.loaded && imageAudits.mnesa.width > 500
      ),
    };
    console.log(`Selected Work Artwork Status: ${results.selectedWorkArtwork.passed ? 'PASS' : 'FAIL'}`);
    await context.close();
  }

  // =========================================================================
  // 5. RESPONSIVE MULTI-DEVICE VIEWPORT MATRIX (8 VIEWPORTS)
  // =========================================================================
  console.log('\n--- 5. Auditing 8-Device Viewport Matrix ---');
  results.responsiveMatrix.profiles = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto('http://localhost:3000/terms-and-conditions', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const vpMetrics = await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;
      const horizontalOverflow = Math.max(0, scrollWidth - innerWidth);
      const curtain = document.querySelector('[data-testid="theatre-curtain-panel"]');
      const cRect = curtain?.getBoundingClientRect();

      return {
        scrollWidth,
        innerWidth,
        horizontalOverflow,
        curtainWidth: cRect?.width,
        curtainFullWidth: Math.abs(cRect?.width - innerWidth) <= 1,
      };
    });

    const isPass = vpMetrics.horizontalOverflow === 0 && vpMetrics.curtainFullWidth;
    console.log(`[${isPass ? 'PASS' : 'FAIL'}] ${vp.name} (${vp.width}x${vp.height}): overflow = ${vpMetrics.horizontalOverflow}px, curtainWidth = ${vpMetrics.curtainWidth}px`);

    results.responsiveMatrix.profiles.push({
      profile: vp.name,
      viewport: `${vp.width}x${vp.height}`,
      overflow: vpMetrics.horizontalOverflow,
      curtainWidth: vpMetrics.curtainWidth,
      passed: isPass,
    });

    await context.close();
  }

  results.responsiveMatrix.passed = results.responsiveMatrix.profiles.every(p => p.passed);

  // =========================================================================
  // 6. REDUCED MOTION AUDIT
  // =========================================================================
  console.log('\n--- 6. Auditing prefers-reduced-motion ---');
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto('http://localhost:3000/terms-and-conditions', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const rmMetrics = await page.evaluate(() => {
      const curtain = document.querySelector('[data-testid="theatre-curtain-panel"]');
      const stageWrapper = document.getElementById('theatre-stage-wrapper');
      const footer = document.querySelector('footer');
      const st = window.ScrollTrigger?.getById('theatre-curtain-reveal-legal');

      return {
        curtainPresent: !!curtain,
        footerPresent: !!footer,
        scrollTriggerActive: !!st,
      };
    });

    console.log('Reduced Motion Metrics:', rmMetrics);
    results.reducedMotion = {
      rmMetrics,
      passed: !rmMetrics.curtainPresent && rmMetrics.footerPresent && !rmMetrics.scrollTriggerActive,
    };
    console.log(`Reduced Motion Status: ${results.reducedMotion.passed ? 'PASS' : 'FAIL'}`);
    await context.close();
  }

  await browser.close();

  // OVERALL STATUS
  results.passedAll = (
    results.termsCurtain.passed &&
    results.privacyCurtain.passed &&
    results.homepageCTARegression.passed &&
    results.selectedWorkArtwork.passed &&
    results.responsiveMatrix.passed &&
    results.reducedMotion.passed
  );

  console.log('\n===============================================================');
  console.log(`OVERALL AUDIT RESULT: ${results.passedAll ? 'ALL PASS' : 'FAILURES DETECTED'}`);
  console.log('===============================================================');

  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'final_legal_curtain_and_artwork_results.json'),
    JSON.stringify(results, null, 2)
  );
}

runAudit().catch(err => {
  console.error('Master Audit Failure:', err);
  process.exit(1);
});
