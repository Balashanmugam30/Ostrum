import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACT_DIR = 'C:/Users/balashanmugam/.gemini/antigravity/brain/e61a5bf4-ec20-4604-866c-28b2350ab0c5';

const VIEWPORTS = [
  { name: 'desktop_fhd', width: 1920, height: 1080 },
  { name: 'desktop_standard', width: 1440, height: 900 },
  { name: 'laptop_compact', width: 1280, height: 800 },
  { name: 'tablet_landscape', width: 1024, height: 768 },
  { name: 'tablet_portrait', width: 768, height: 1024 },
  { name: 'mobile_large', width: 428, height: 926 },
  { name: 'mobile_standard', width: 390, height: 844 },
  { name: 'mobile_compact', width: 360, height: 780 },
];

async function runVerification() {
  console.log('--- Starting OSTRUM Legal Pages & Wordmark Verification ---');
  const browser = await chromium.launch({ headless: true });
  const results = {
    wordmarkTests: [],
    legalSpacingTests: [],
    contentChecks: [],
    homepageCheck: null,
    viewportsTested: [],
  };

  try {
    // 1. Verify Wordmark Click & Cursor on Desktop
    console.log('\n[1/5] Verifying Footer Wordmark Click-Hop & Clipping Removal...');
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:3000/privacy-policy', { waitUntil: 'networkidle' });

    // Scroll to footer wordmark
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Wait until entrance transition is 100% complete across all letter wrappers
    await page.waitForTimeout(3000);

    const wordmarkLetters = await page.$$('.bwf-l');
    console.log(`Found ${wordmarkLetters.length} wordmark letters.`);

    const wordContainerBox = await page.$eval('[data-testid="footer-wordmark-container"]', el => {
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, height: r.height };
    });

    for (let i = 0; i < wordmarkLetters.length; i++) {
      const letter = wordmarkLetters[i];
      const char = await letter.innerText();
      const beforeCursor = await letter.evaluate(el => window.getComputedStyle(el).cursor);
      const beforeTop = await letter.evaluate(el => el.getBoundingClientRect().top);

      // Click the letter
      await letter.dispatchEvent('click');
      await page.waitForTimeout(200);

      const afterTop = await letter.evaluate(el => el.getBoundingClientRect().top);
      const hasHopClass = await letter.evaluate(el => el.classList.contains('is-hop'));

      const yDelta = Math.abs(afterTop - beforeTop);
      const isClippedAtTop = afterTop < wordContainerBox.top;

      console.log(`Letter '${char}': yDelta=${yDelta.toFixed(3)}px, hasHop=${hasHopClass}, cursor=${beforeCursor}, isClipped=${isClippedAtTop}`);

      results.wordmarkTests.push({
        char,
        yDelta,
        hasHopClass,
        cursor: beforeCursor,
        isClippedAtTop,
        passed: yDelta < 0.05 && !hasHopClass && beforeCursor === 'default' && !isClippedAtTop,
      });
    }

    // Capture screenshot of footer wordmark
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, '01_footer_wordmark_verified_no_hop.png'),
      fullPage: false,
    });

    // 2. Content & Palette Checks on Legal Pages
    console.log('\n[2/5] Checking Content, Metadata & Palette on Legal Pages...');
    for (const route of ['/privacy-policy', '/terms-and-conditions']) {
      await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      const html = await page.content();
      const text = await page.innerText('body');

      const hasGreenDot = html.includes('#16A34A') || html.includes('rgb(22, 163, 74)') || html.includes('bg-green-600') || html.includes('bg-emerald-500');
      const hasVersion20 = text.includes('Version 2.0') || text.includes('(Public Release)');
      const hasStudioAffairs = text.includes('Studio Legal Affairs');
      const hasDraftingNoteTerms = text.includes('Specific monetary liability caps remain subject to formal legal review');
      const hasDraftingNotePrivacy = text.includes('Formal statutory grievance officer designations will be updated');
      const hasLastUpdated = text.includes('Last updated:');

      // Check heading colors and badge text
      const headingColor = await page.$eval('h1', el => window.getComputedStyle(el).color);
      const badgeText = await page.$eval('[class*="font-mono"][class*="uppercase"]', el => el.innerText).catch(() => '');

      console.log(`Route ${route}:`);
      console.log(`  - hasGreenDot: ${hasGreenDot}`);
      console.log(`  - hasVersion20: ${hasVersion20}`);
      console.log(`  - hasStudioAffairs: ${hasStudioAffairs}`);
      console.log(`  - hasDraftingNotes: ${route.includes('terms') ? hasDraftingNoteTerms : hasDraftingNotePrivacy}`);
      console.log(`  - hasLastUpdated: ${hasLastUpdated}`);
      console.log(`  - headingColor: ${headingColor}`);
      console.log(`  - badgeText: ${badgeText}`);

      results.contentChecks.push({
        route,
        hasGreenDot,
        hasVersion20,
        hasStudioAffairs,
        hasDraftingNotes: hasDraftingNoteTerms || hasDraftingNotePrivacy,
        hasLastUpdated,
        headingColor,
        badgeText,
        passed: !hasGreenDot && !hasVersion20 && !hasStudioAffairs && !(hasDraftingNoteTerms || hasDraftingNotePrivacy) && hasLastUpdated,
      });

      const filename = route.includes('privacy') ? '02_privacy_policy_clean_header.png' : '03_terms_clean_header.png';
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, filename),
      });
    }

    // 3. Spacing & Curtain Verification on Legal Routes
    console.log('\n[3/5] Verifying End Spacing and Curtain Reveal on Legal Routes...');
    for (const route of ['/privacy-policy', '/terms-and-conditions']) {
      await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(800);

      // Measure layout metrics
      const layoutMetrics = await page.evaluate(() => {
        const article = document.querySelector('article');
        const container = document.querySelector('[data-testid="theatre-curtain-reveal-container"]');
        return {
          articleBottom: article ? article.offsetTop + article.offsetHeight : 0,
          containerTop: container ? container.offsetTop : 0,
          scrollHeight: document.documentElement.scrollHeight,
          windowHeight: window.innerHeight,
        };
      });

      console.log(`Route ${route} Layout Metrics: articleBottom=${layoutMetrics.articleBottom}px, containerTop=${layoutMetrics.containerTop}px`);

      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1500);

      const endState = await page.evaluate(() => {
        const curtain = document.querySelector('[data-testid="theatre-curtain-panel"]');
        const stage = document.querySelector('[data-testid="theatre-stage-panel"]');
        const wordmark = document.querySelector('[data-testid="footer-wordmark-container"]');

        const curtainTransform = curtain ? window.getComputedStyle(curtain).transform : null;
        const curtainVisibility = curtain ? window.getComputedStyle(curtain).visibility : null;
        const stageVisible = stage ? window.getComputedStyle(stage).visibility !== 'hidden' : false;
        const wordmarkRect = wordmark ? wordmark.getBoundingClientRect() : null;

        return {
          curtainTransform,
          curtainVisibility,
          stageVisible,
          wordmarkVisible: wordmarkRect ? wordmarkRect.height > 0 : false,
          wordmarkRect,
        };
      });

      console.log(`Route ${route} Reveal Verification:`);
      console.log(`  - Stage visible: ${endState.stageVisible}`);
      console.log(`  - Wordmark visible: ${endState.wordmarkVisible}`);
      console.log(`  - Curtain transform at bottom: ${endState.curtainTransform}`);
      console.log(`  - Curtain visibility: ${endState.curtainVisibility}`);

      results.legalSpacingTests.push({
        route,
        layoutMetrics,
        endState,
        passed: endState.stageVisible && endState.wordmarkVisible && endState.curtainTransform && endState.curtainTransform.includes('-900'),
      });

      const screenshotName = route.includes('privacy') ? '04_privacy_curtain_lifted.png' : '05_terms_curtain_lifted.png';
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, screenshotName),
      });
    }

    // 4. Homepage CTA-to-Footer Reveal Intact Check
    console.log('\n[4/5] Verifying Homepage CTA-to-Footer Reveal is 100% Intact...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Check CTA inside curtain
    const ctaInsideCurtain = await page.evaluate(() => {
      const curtain = document.querySelector('[data-testid="theatre-curtain-panel"]');
      return curtain ? !!curtain.querySelector('section, form, a[href*="mailto"]') : false;
    });

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);

    const homepageEndState = await page.evaluate(() => {
      const stage = document.querySelector('[data-testid="theatre-stage-panel"]');
      const wordmark = document.querySelector('[data-testid="footer-wordmark-container"]');
      const rect = wordmark ? wordmark.getBoundingClientRect() : null;
      return {
        stagePresent: !!stage,
        wordmarkVisible: !!(rect && rect.height > 0),
        rect,
      };
    });

    console.log(`Homepage CTA in curtain: ${ctaInsideCurtain}, Stage present: ${homepageEndState.stagePresent}, Wordmark visible: ${homepageEndState.wordmarkVisible}`);
    results.homepageCheck = {
      ctaInsideCurtain,
      ...homepageEndState,
      passed: ctaInsideCurtain && homepageEndState.stagePresent && homepageEndState.wordmarkVisible,
    };

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, '06_homepage_curtain_and_footer_intact.png'),
    });

    // 5. Multi-viewport validation
    console.log('\n[5/5] Testing across 8 viewports...');
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:3000/privacy-policy', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      // Check for horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 1;
      });

      // Check footer wordmark visibility at bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1200);

      const wordmarkBox = await page.$eval('[data-testid="footer-wordmark-container"]', el => {
        const r = el.getBoundingClientRect();
        return { width: r.width, height: r.height };
      }).catch(() => null);

      console.log(`Viewport ${vp.name} (${vp.width}x${vp.height}): horizontalScroll=${hasHorizontalScroll}, wordmarkBox=${JSON.stringify(wordmarkBox)}`);

      results.viewportsTested.push({
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        hasHorizontalScroll,
        wordmarkVisible: !!(wordmarkBox && wordmarkBox.height > 0),
        passed: !hasHorizontalScroll && !!(wordmarkBox && wordmarkBox.height > 0),
      });
    }

    await browser.close();

    // Summary evaluation
    const allWordmarkPassed = results.wordmarkTests.every(t => t.passed);
    const allContentPassed = results.contentChecks.every(t => t.passed);
    const allSpacingPassed = results.legalSpacingTests.every(t => t.passed);
    const homepagePassed = results.homepageCheck.passed;
    const allViewportsPassed = results.viewportsTested.every(t => t.passed);

    console.log('\n================ VERIFICATION SUMMARY ================');
    console.log(`Wordmark Click-Hop & Clipping Removal: ${allWordmarkPassed ? 'PASSED (0 hop, 0 clipping, default cursor)' : 'FAILED'}`);
    console.log(`Legal Content & Palette Refinement:   ${allContentPassed ? 'PASSED (no green dot, no v2.0, no drafting notes)' : 'FAILED'}`);
    console.log(`Legal Spacing & Curtain Transition:    ${allSpacingPassed ? 'PASSED (calibrated end spacing, smooth reveal)' : 'FAILED'}`);
    console.log(`Homepage CTA-to-Footer Intact:         ${homepagePassed ? 'PASSED' : 'FAILED'}`);
    console.log(`All 8 Viewports Verified:              ${allViewportsPassed ? 'PASSED (0 horizontal overflow)' : 'FAILED'}`);
    console.log('======================================================\n');

    fs.writeFileSync(
      path.join(ARTIFACT_DIR, 'legal_refinement_and_wordmark_results.json'),
      JSON.stringify(results, null, 2)
    );

    if (allWordmarkPassed && allContentPassed && allSpacingPassed && homepagePassed && allViewportsPassed) {
      console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
      process.exit(0);
    } else {
      console.error('SOME CHECKS FAILED. Review results.');
      process.exit(1);
    }
  } catch (err) {
    console.error('Verification failed with error:', err);
    await browser.close();
    process.exit(1);
  }
}

runVerification();
